import { spawnSync } from 'node:child_process';
import { createReadStream, existsSync, mkdirSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, resolve } from 'node:path';
import { chromium } from 'playwright';

const raiz = resolve(import.meta.dirname, '..');
const dist = join(raiz, 'dist');
const saida = join(raiz, 'proposta', 'Proposta-Mikael-Fotografia.pdf');
const pularBuild = process.argv.includes('--sem-build');

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
  const caminho = decodeURIComponent(new URL(pedido.url ?? '/', 'http://localhost').pathname);
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
const url = `http://127.0.0.1:${typeof endereco === 'object' && endereco ? endereco.port : 0}/proposta-pdf/`;

async function abrirNavegador() {
  for (const channel of ['msedge', 'chrome', undefined]) {
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
  mkdirSync(join(raiz, 'proposta'), { recursive: true });
  await pagina.pdf({ path: saida, preferCSSPageSize: true, printBackground: true });
  console.log(`PDF gerado com ${totalPaginas} páginas: ${saida}`);

  if (estouradas.length > 0) {
    console.error(`Conteúdo passando do tamanho da página em: ${estouradas.join(', ')}`);
    process.exitCode = 1;
  }
} finally {
  await navegador.close();
  servidor.close();
}
