import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, resolve, sep } from 'node:path';

const raiz = resolve(import.meta.dirname, '..');
const dist = join(raiz, 'dist');

const tipos = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.gif': 'image/gif',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.pdf': 'application/pdf',
};

export function normalizarBase(valor = process.env.BASE_PATH ?? '/') {
  const limpo = valor.trim().replace(/^\/+|\/+$/g, '');
  return limpo ? `/${limpo}` : '';
}

function enviarArquivo(resposta, arquivo, status = 200) {
  resposta.writeHead(status, { 'Content-Type': tipos[extname(arquivo).toLowerCase()] ?? 'application/octet-stream' });
  createReadStream(arquivo).pipe(resposta);
}

function naoEncontrado(resposta) {
  const pagina404 = join(dist, '404.html');
  if (existsSync(pagina404)) enviarArquivo(resposta, pagina404, 404);
  else resposta.writeHead(404).end();
}

export function criarServidor(base = normalizarBase()) {
  return createServer((pedido, resposta) => {
    const endereco = new URL(pedido.url ?? '/', 'http://localhost');
    let caminho;
    try {
      caminho = decodeURIComponent(endereco.pathname);
    } catch {
      resposta.writeHead(400).end();
      return;
    }

    if (base && caminho === base) {
      resposta.writeHead(301, { Location: `${base}/${endereco.search}` }).end();
      return;
    }
    if (base && !caminho.startsWith(`${base}/`)) {
      naoEncontrado(resposta);
      return;
    }

    const relativo = base ? caminho.slice(base.length) : caminho;
    let arquivo = join(dist, relativo);
    if (arquivo !== dist && !arquivo.startsWith(dist + sep)) {
      resposta.writeHead(403).end();
      return;
    }

    if (existsSync(arquivo) && statSync(arquivo).isDirectory()) {
      if (!caminho.endsWith('/')) {
        resposta.writeHead(301, { Location: `${caminho}/${endereco.search}` }).end();
        return;
      }
      arquivo = join(arquivo, 'index.html');
    } else if (!existsSync(arquivo) && existsSync(`${arquivo}.html`)) {
      arquivo = `${arquivo}.html`;
    }

    if (!existsSync(arquivo) || !statSync(arquivo).isFile()) {
      naoEncontrado(resposta);
      return;
    }
    enviarArquivo(resposta, arquivo);
  });
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(import.meta.filename)) {
  if (!existsSync(join(dist, 'index.html'))) {
    console.error('dist/index.html não existe. Rode npm run build antes.');
    process.exit(1);
  }
  const base = normalizarBase();
  const porta = Number(process.env.PORTA ?? 4322);
  criarServidor(base).listen(porta, '127.0.0.1', () => {
    console.log(`Servindo dist/ em http://127.0.0.1:${porta}${base}/`);
  });
}
