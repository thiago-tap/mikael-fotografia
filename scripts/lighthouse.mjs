import { appendFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import lighthouse from 'lighthouse';
import { chromium } from 'playwright';
import { criarServidor, normalizarBase } from './servir-dist.mjs';

const raiz = resolve(import.meta.dirname, '..');
const pastaRelatorios = join(raiz, 'relatorio-lighthouse');
const paginas = [
  { nome: 'inicio', rota: '' },
  { nome: 'proposta', rota: 'proposta/' },
];
const metas = {
  performance: { minimo: Number(process.env.LH_PERFORMANCE ?? 0.85), bloqueia: false, rotulo: 'Desempenho' },
  accessibility: { minimo: 0.95, bloqueia: true, rotulo: 'Acessibilidade' },
  'best-practices': { minimo: 0.9, bloqueia: false, rotulo: 'Boas práticas' },
  seo: { minimo: 0.95, bloqueia: true, rotulo: 'SEO' },
};
const portaDepuracao = Number(process.env.LH_PORTA_DEPURACAO ?? 9333);
const emIntegracao = Boolean(process.env.CI);

const base = normalizarBase();
const servidor = criarServidor(base);
await new Promise((pronto) => servidor.listen(0, '127.0.0.1', pronto));
const endereco = servidor.address();
const origem = `http://127.0.0.1:${typeof endereco === 'object' && endereco ? endereco.port : 0}${base}/`;

const navegador = await chromium.launch({ args: [`--remote-debugging-port=${portaDepuracao}`] });
mkdirSync(pastaRelatorios, { recursive: true });

const linhas = [];
const falhasBloqueantes = [];
const avisos = [];

try {
  for (const { nome, rota } of paginas) {
    const url = new URL(rota, origem).href;
    console.log(`Lighthouse (celular): ${url}`);
    const resultado = await lighthouse(
      url,
      { port: portaDepuracao, output: ['html', 'json'], logLevel: 'error' },
      {
        extends: 'lighthouse:default',
        settings: {
          onlyCategories: Object.keys(metas),
          skipAudits: ['uses-long-cache-ttl'],
        },
      },
    );
    if (!resultado) throw new Error(`Lighthouse não retornou resultado para ${url}`);
    const [html, json] = resultado.report;
    writeFileSync(join(pastaRelatorios, `${nome}.html`), html);
    writeFileSync(join(pastaRelatorios, `${nome}.json`), json);

    const notas = {};
    for (const [categoria, meta] of Object.entries(metas)) {
      const nota = resultado.lhr.categories[categoria]?.score ?? 0;
      notas[categoria] = nota;
      if (nota < meta.minimo) {
        const mensagem = `${nome}: ${meta.rotulo} ${Math.round(nota * 100)} (mínimo ${Math.round(meta.minimo * 100)})`;
        (meta.bloqueia ? falhasBloqueantes : avisos).push(mensagem);
      }
    }
    linhas.push({ pagina: `/${rota}`, notas });
  }
} finally {
  await navegador.close();
  servidor.close();
}

const cabecalho = `| Página | ${Object.values(metas).map((meta) => meta.rotulo).join(' | ')} |`;
const separador = `|---|${Object.keys(metas).map(() => '---:').join('|')}|`;
const corpo = linhas.map(
  ({ pagina, notas }) =>
    `| ${pagina} | ${Object.entries(metas)
      .map(([categoria, meta]) => `${Math.round(notas[categoria] * 100)}${notas[categoria] < meta.minimo ? (meta.bloqueia ? ' ❌' : ' ⚠️') : ''}`)
      .join(' | ')} |`,
);
const tabela = [cabecalho, separador, ...corpo].join('\n');
console.log(`\n${tabela}\n`);

if (process.env.GITHUB_STEP_SUMMARY) {
  const metasTexto = Object.values(metas)
    .map((meta) => `${meta.rotulo} ≥ ${Math.round(meta.minimo * 100)}${meta.bloqueia ? ' (bloqueia)' : ' (aviso)'}`)
    .join(' · ');
  appendFileSync(process.env.GITHUB_STEP_SUMMARY, `## Lighthouse (celular)\n\n${tabela}\n\nMetas: ${metasTexto}\n\n`);
}

for (const aviso of avisos) console.log(emIntegracao ? `::warning::Lighthouse abaixo da meta — ${aviso}` : `Aviso: ${aviso}`);
for (const falha of falhasBloqueantes) console.log(emIntegracao ? `::error::Lighthouse abaixo da meta — ${falha}` : `Falha: ${falha}`);
if (falhasBloqueantes.length > 0) process.exitCode = 1;
