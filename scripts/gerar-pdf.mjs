import { spawnSync } from 'node:child_process';
import { createReadStream, existsSync, mkdirSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { dirname, extname, join, resolve } from 'node:path';
import { chromium } from 'playwright';

const raiz = resolve(import.meta.dirname, '..');
const dist = join(raiz, 'dist');
const argumentos = process.argv.slice(2);
const pularBuild = argumentos.includes('--sem-build');
const indiceSaida = argumentos.indexOf('--saida');
const saida = indiceSaida >= 0 && argumentos[indiceSaida + 1]
  ? resolve(raiz, argumentos[indiceSaida + 1])
  : join(raiz, 'proposta', 'Proposta-Mikael-Vt-Fotografo.pdf');
const emIntegracao = Boolean(process.env.CI);
const base = pularBuild ? (process.env.BASE_PATH ?? '/').replace(/\/+$/, '') : '';

const tipos = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.svg': 'image/svg+xml',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.xml': 'application/xml',
};

if (!pularBuild) {
  console.log('Gerando o site (astro build)...');
  const build = spawnSync('npx astro build', {
    cwd: raiz,
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, BASE_PATH: '/', SITE_URL: 'http://localhost' },
  });
  if (build.status !== 0) process.exit(build.status ?? 1);
}

if (!existsSync(join(dist, 'proposta-pdf', 'index.html'))) {
  console.error('dist/proposta-pdf/index.html não existe. Rode sem --sem-build.');
  process.exit(1);
}

const servidor = createServer((pedido, resposta) => {
  const completo = decodeURIComponent(new URL(pedido.url ?? '/', 'http://localhost').pathname);
  const caminho = base && completo.startsWith(base) ? completo.slice(base.length) || '/' : completo;
  let arquivo = join(dist, caminho);
  if (!arquivo.startsWith(dist)) {
    resposta.writeHead(403).end();
    return;
  }
  if (existsSync(arquivo) && statSync(arquivo).isDirectory()) arquivo = join(arquivo, 'index.html');
  if (!existsSync(arquivo)) {
    resposta.writeHead(404).end();
    return;
  }
  resposta.writeHead(200, { 'Content-Type': tipos[extname(arquivo).toLowerCase()] ?? 'application/octet-stream' });
  createReadStream(arquivo).pipe(resposta);
});

await new Promise((pronto) => servidor.listen(0, '127.0.0.1', pronto));
const endereco = servidor.address();
const url = `http://127.0.0.1:${typeof endereco === 'object' && endereco ? endereco.port : 0}${base}/proposta-pdf/`;

async function abrirNavegador() {
  const canais = emIntegracao ? [undefined, 'chrome', 'msedge'] : ['msedge', 'chrome', undefined];
  for (const channel of canais) {
    try {
      return await chromium.launch({ channel });
    } catch {
      continue;
    }
  }
  throw new Error('Nenhum navegador encontrado. Instale o Edge/Chrome ou rode: npx playwright install chromium');
}

const navegador = await abrirNavegador();
try {
  const pagina = await navegador.newPage({ viewport: { width: 1080, height: 1920 } });
  await pagina.goto(url, { waitUntil: 'networkidle' });
  await pagina.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(
      [...document.images].map((imagem) => (imagem.complete ? null : new Promise((fim) => imagem.addEventListener('load', fim)))),
    );
  });

  const estouradas = await pagina.evaluate(() =>
    [...document.querySelectorAll('.folha')].flatMap((folha, posicao) => {
      const limite = folha.getBoundingClientRect();
      const fora = [...folha.querySelectorAll('*')].some((elemento) => {
        const caixa = elemento.getBoundingClientRect();
        return caixa.height > 0 && (caixa.bottom > limite.bottom + 1 || caixa.top < limite.top - 1);
      });
      return fora ? [`página ${posicao + 1} (#${folha.id})`] : [];
    }),
  );

  const totalPaginas = await pagina.locator('.folha').count();
  mkdirSync(dirname(saida), { recursive: true });
  await pagina.pdf({ path: saida, preferCSSPageSize: true, printBackground: true });
  console.log(`PDF gerado com ${totalPaginas} páginas: ${saida}`);

  if (estouradas.length > 0) {
    const aviso = `Conteúdo passando do tamanho da página em: ${estouradas.join(', ')}`;
    if (emIntegracao) console.log(`::warning::${aviso}`);
    else {
      console.error(aviso);
      process.exitCode = 1;
    }
  }
} finally {
  await navegador.close();
  servidor.close();
}
