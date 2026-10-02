import { appendFileSync, existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { extname, join, relative, resolve } from 'node:path';
import sharp from 'sharp';

const pastasPadrao = [
  'src/assets/fotos',
  'src/assets/instagram',
  'src/content/portfolio',
  'src/content/depoimentos',
  'src/content/blog',
];
const ladoMaximo = 3000;
const tamanhoMaximo = 3 * 1024 * 1024;
const economiaMinima = 0.05;
const qualidadeJpeg = 82;
const qualidadeWebp = 82;
const qualidadePng = 90;

const extensoesOtimizaveis = new Set(['.jpg', '.jpeg', '.png', '.webp']);
const extensoesNaoSuportadas = new Set(['.heic', '.heif', '.dng', '.cr2', '.cr3', '.nef', '.arw', '.raf', '.orf', '.rw2', '.tif', '.tiff']);

const raiz = resolve(import.meta.dirname, '..');
const argumentos = process.argv.slice(2);
const modoVerificar = argumentos.includes('--verificar');
const pastasArgumento = argumentos.flatMap((valor, indice) => (argumentos[indice - 1] === '--pasta' ? [valor] : []));
const pastas = (pastasArgumento.length ? pastasArgumento : pastasPadrao).map((pasta) => resolve(raiz, pasta));

const listarArquivos = (pasta) =>
  existsSync(pasta)
    ? readdirSync(pasta, { withFileTypes: true }).flatMap((item) => {
        const caminho = join(pasta, item.name);
        return item.isDirectory() ? listarArquivos(caminho) : [caminho];
      })
    : [];

const formatarTamanho = (bytes) =>
  bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(2)} MB` : `${(bytes / 1024).toFixed(0)} KB`;

const nomeExibido = (caminho) => relative(raiz, caminho).replaceAll('\\', '/');

const dimensoesOrientadas = (meta) =>
  (meta.orientation ?? 1) >= 5 ? { largura: meta.height, altura: meta.width } : { largura: meta.width, altura: meta.height };

const codificar = (entrada, extensao) => {
  const pipeline = sharp(entrada, { failOn: 'none' })
    .rotate()
    .resize({ width: ladoMaximo, height: ladoMaximo, fit: 'inside', withoutEnlargement: true });
  if (extensao === '.png') return pipeline.png({ palette: true, quality: qualidadePng, compressionLevel: 9, effort: 10 }).toBuffer();
  if (extensao === '.webp') return pipeline.webp({ quality: qualidadeWebp, effort: 6 }).toBuffer();
  return pipeline
    .jpeg({ quality: qualidadeJpeg, mozjpeg: true, progressive: true, chromaSubsampling: '4:2:0' })
    .toBuffer();
};

const imprimirTabela = (cabecalho, linhas) => {
  const larguras = cabecalho.map((titulo, coluna) => Math.max(titulo.length, ...linhas.map((linha) => linha[coluna].length)));
  const formatar = (linha) => linha.map((celula, coluna) => (coluna === 0 ? celula.padEnd(larguras[coluna]) : celula.padStart(larguras[coluna]))).join('  ');
  console.log(formatar(cabecalho));
  console.log(larguras.map((largura) => '-'.repeat(largura)).join('  '));
  linhas.forEach((linha) => console.log(formatar(linha)));
  if (process.env.GITHUB_STEP_SUMMARY) {
    const markdown = [cabecalho, cabecalho.map(() => '---'), ...linhas].map((linha) => `| ${linha.join(' | ')} |`).join('\n');
    appendFileSync(process.env.GITHUB_STEP_SUMMARY, `### Otimização de imagens\n\n${markdown}\n\n`);
  }
};

const arquivos = pastas.flatMap(listarArquivos).sort();
const naoSuportados = arquivos.filter((arquivo) => extensoesNaoSuportadas.has(extname(arquivo).toLowerCase()));
const imagens = arquivos.filter((arquivo) => extensoesOtimizaveis.has(extname(arquivo).toLowerCase()));

if (naoSuportados.length) {
  console.error('Formato não suportado (HEIC/RAW/TIFF). Exporte como JPG (sRGB) e envie de novo:');
  naoSuportados.forEach((arquivo) => console.error(`  - ${nomeExibido(arquivo)}`));
  if (process.env.GITHUB_ACTIONS) {
    naoSuportados.forEach((arquivo) =>
      console.log(`::error file=${nomeExibido(arquivo)}::Formato não suportado. Exporte como JPG (sRGB) e envie de novo.`),
    );
  }
}

if (modoVerificar) {
  const problemas = [];
  for (const arquivo of imagens) {
    const meta = await sharp(arquivo).metadata();
    const { largura, altura } = dimensoesOrientadas(meta);
    const tamanho = statSync(arquivo).size;
    const motivos = [
      ...(Math.max(largura, altura) > ladoMaximo ? [`${largura}×${altura} px`] : []),
      ...(tamanho > tamanhoMaximo ? [formatarTamanho(tamanho)] : []),
    ];
    if (motivos.length) problemas.push([nomeExibido(arquivo), motivos.join(', ')]);
  }
  if (problemas.length) {
    console.log(`Imagens acima de ${ladoMaximo} px ou ${formatarTamanho(tamanhoMaximo)}:`);
    problemas.forEach(([arquivo, motivo]) => console.log(`  - ${arquivo}: ${motivo}`));
  } else {
    console.log(`${imagens.length} imagens verificadas, todas dentro do limite.`);
  }
  process.exit(problemas.length || naoSuportados.length ? 1 : 0);
}

const linhas = [];
let totalAntes = 0;
let totalDepois = 0;

for (const arquivo of imagens) {
  const extensao = extname(arquivo).toLowerCase();
  const original = readFileSync(arquivo);
  const meta = await sharp(original).metadata();
  if ((meta.pages ?? 1) > 1) continue;
  const { largura, altura } = dimensoesOrientadas(meta);
  const redimensionar = Math.max(largura, altura) > ladoMaximo;
  const otimizado = await codificar(original, extensao);
  const economia = 1 - otimizado.length / original.length;
  const gravar = redimensionar || economia > economiaMinima;
  const depois = gravar ? otimizado.length : original.length;
  totalAntes += original.length;
  totalDepois += depois;
  if (!gravar) continue;
  writeFileSync(arquivo, otimizado);
  const final = await sharp(otimizado).metadata();
  linhas.push([
    nomeExibido(arquivo),
    `${largura}×${altura}`,
    `${final.width}×${final.height}`,
    formatarTamanho(original.length),
    formatarTamanho(otimizado.length),
    `${Math.round(economia * 100)}%`,
  ]);
}

if (linhas.length) {
  imprimirTabela(['Arquivo', 'Antes (px)', 'Depois (px)', 'Antes', 'Depois', 'Economia'], linhas);
  console.log(
    `\n${linhas.length} de ${imagens.length} imagens otimizadas. Total: ${formatarTamanho(totalAntes)} → ${formatarTamanho(totalDepois)}.`,
  );
} else {
  console.log(`${imagens.length} imagens verificadas, nenhuma precisou de otimização.`);
}

if (naoSuportados.length) process.exit(2);
