import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import opentype from 'opentype.js';

const raiz = resolve(import.meta.dirname, '..');
const pastaFontes = join(raiz, 'node_modules', '@fontsource', 'cormorant-garamond', 'files');
const casas = 2;
const numero = (valor) => Number(valor.toFixed(casas));

function fonte(peso, estilo) {
  const dados = readFileSync(join(pastaFontes, `cormorant-garamond-latin-${peso}-${estilo}.woff`));
  return opentype.parse(dados.buffer.slice(dados.byteOffset, dados.byteOffset + dados.byteLength));
}

function desenhar(peso, espessuraFio) {
  const corpo = 100;
  const caminhoM = fonte(peso, 'normal').getPath('M', 0, corpo, corpo);
  const caixaM = caminhoM.getBoundingBox();
  const larguraM = caixaM.x2 - caixaM.x1;
  const caminhoV = fonte(peso, 'italic').getPath('V', caixaM.x1 + larguraM * 0.6, corpo * 1.34, corpo * 0.92);
  const caixaV = caminhoV.getBoundingBox();

  const extensaoFio = 14;
  const yFio = caixaM.y2 + 9;
  const x = caixaM.x1 - extensaoFio;
  const y = Math.min(caixaM.y1, caixaV.y1);
  const largura = caixaV.x2 + extensaoFio - x;
  const altura = Math.max(caixaM.y2, caixaV.y2, yFio + espessuraFio) - y;
  const conteudo = `<path d="${caminhoM.toPathData(casas)}${caminhoV.toPathData(casas)}"/><rect x="${numero(x)}" y="${numero(yFio)}" width="${numero(largura)}" height="${espessuraFio}"/>`;
  return { x, y, largura, altura, conteudo };
}

const fino = desenhar(300, 0.9);
const monograma = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${[fino.x, fino.y, fino.largura, fino.altura].map(numero).join(' ')}" fill="currentColor">${fino.conteudo}</svg>
`;

function icone(fundo, tinta) {
  const forte = desenhar(500, 3);
  const lado = Math.max(forte.largura, forte.altura) * 1.22;
  const x = forte.x + forte.largura / 2 - lado / 2;
  const y = forte.y + forte.altura / 2 - lado / 2;
  const quadro = [x, y, lado, lado].map(numero);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${quadro.join(' ')}"><rect x="${quadro[0]}" y="${quadro[1]}" width="${quadro[2]}" height="${quadro[3]}" fill="${fundo}"/><g fill="${tinta}">${forte.conteudo}</g></svg>
`;
}

const saidas = {
  'src/assets/monograma.svg': monograma,
  'src/assets/marca/icone.svg': icone('#faf8f5', '#1d1b18'),
  'public/favicon.svg': icone('#faf8f5', '#1d1b18'),
};

for (const [arquivo, conteudo] of Object.entries(saidas)) {
  const destino = join(raiz, arquivo);
  mkdirSync(dirname(destino), { recursive: true });
  writeFileSync(destino, conteudo);
  console.log(`Gerado: ${arquivo}`);
}
