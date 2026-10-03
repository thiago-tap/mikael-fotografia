import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { chromium } from 'playwright';

const raiz = resolve(import.meta.dirname, '..');
const saida = join(raiz, 'public', 'og-padrao.png');
const fonte = (arquivo) =>
  `data:font/woff2;base64,${readFileSync(join(raiz, 'node_modules', arquivo)).toString('base64')}`;

const html = `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<style>
  @font-face { font-family: 'Cormorant'; font-weight: 300; src: url('${fonte('@fontsource/cormorant-garamond/files/cormorant-garamond-latin-300-normal.woff2')}'); }
  @font-face { font-family: 'Cormorant'; font-weight: 400; font-style: italic; src: url('${fonte('@fontsource/cormorant-garamond/files/cormorant-garamond-latin-400-italic.woff2')}'); }
  @font-face { font-family: 'Jost'; font-weight: 100 900; src: url('${fonte('@fontsource-variable/jost/files/jost-latin-wght-normal.woff2')}'); }
  * { margin: 0; box-sizing: border-box; }
  body { width: 1200px; height: 630px; background: #faf8f5; color: #1d1b18; display: grid; place-items: center; }
  .moldura { position: absolute; inset: 28px; border: 1px solid #ddd5ca; }
  .conteudo { text-align: center; }
  .marca { font-family: 'Cormorant'; font-weight: 300; font-size: 104px; letter-spacing: 0.34em; margin-right: -0.34em; line-height: 1; }
  .sub { font-family: 'Jost'; font-weight: 400; font-size: 22px; letter-spacing: 0.6em; margin-right: -0.6em; color: #6f5f4e; margin-top: 18px; }
  .linha { width: 64px; height: 1px; background: #6f5f4e; margin: 44px auto; opacity: 0.6; }
  .frase { font-family: 'Cormorant'; font-style: italic; font-size: 46px; color: #4a4640; }
  .local { font-family: 'Jost'; font-weight: 400; font-size: 18px; letter-spacing: 0.36em; color: #6f5f4e; margin-top: 28px; text-transform: uppercase; }
</style>
</head>
<body>
  <div class="moldura"></div>
  <div class="conteudo">
    <p class="marca">MIKAEL VT</p>
    <p class="sub">FOTÓGRAFO</p>
    <div class="linha"></div>
    <p class="frase">O dia em que duas histórias se tornam uma só.</p>
    <p class="local">Fotógrafo de casamento · Brasília/DF</p>
  </div>
</body>
</html>`;

let navegador;
for (const channel of ['msedge', 'chrome', undefined]) {
  try {
    navegador = await chromium.launch({ channel });
    break;
  } catch {
    continue;
  }
}
if (!navegador) throw new Error('Nenhum navegador encontrado. Rode: npx playwright install chromium');

try {
  const pagina = await navegador.newPage({ viewport: { width: 1200, height: 630 } });
  await pagina.setContent(html, { waitUntil: 'load' });
  await pagina.evaluate(() => document.fonts.ready);
  await pagina.screenshot({ path: saida, type: 'png' });
  console.log(`Imagem gerada: ${saida}`);
} finally {
  await navegador.close();
}
