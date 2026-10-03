import { appendFileSync, existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const raiz = resolve(import.meta.dirname, '..');
const arquivo = join(raiz, 'relatorio-testes', 'resultado.json');
const destino = process.env.GITHUB_STEP_SUMMARY;

function escrever(texto) {
  if (destino) appendFileSync(destino, texto);
  else console.log(texto);
}

if (!existsSync(arquivo)) {
  escrever('## Testes automáticos\n\nOs testes não chegaram a gerar resultado. Veja o log do passo "Testar o site antes de publicar".\n\n');
  process.exit(0);
}

const relatorio = JSON.parse(readFileSync(arquivo, 'utf8'));
const { expected = 0, unexpected = 0, flaky = 0, skipped = 0, duration = 0 } = relatorio.stats ?? {};

function* testes(suite, caminho = []) {
  const titulos = suite.title && !suite.title.endsWith('.ts') ? [...caminho, suite.title] : caminho;
  for (const especificacao of suite.specs ?? []) {
    for (const teste of especificacao.tests ?? []) yield { titulo: [...titulos, especificacao.title].join(' › '), teste };
  }
  for (const filha of suite.suites ?? []) yield* testes(filha, titulos);
}

const falhas = [];
const instaveis = [];
for (const suite of relatorio.suites ?? []) {
  for (const { titulo, teste } of testes(suite)) {
    const linha = `- [${teste.projectName}] ${titulo}`;
    if (teste.status === 'unexpected') {
      const erro = teste.results?.at(-1)?.error?.message?.split('\n')[0]?.replace(/\u001b\[[0-9;]*m/g, '') ?? '';
      falhas.push(erro ? `${linha}\n  - ${erro}` : linha);
    } else if (teste.status === 'flaky') instaveis.push(linha);
  }
}

const situacao = unexpected > 0 ? '❌ Falhou: o site **não** foi publicado; continua no ar a versão anterior.' : '✅ Todos os testes passaram.';
const partes = [
  '## Testes automáticos',
  '',
  situacao,
  '',
  '| Passaram | Falharam | Instáveis | Pulados | Tempo |',
  '|---:|---:|---:|---:|---:|',
  `| ${expected} | ${unexpected} | ${flaky} | ${skipped} | ${Math.round(duration / 1000)} s |`,
  '',
];
if (falhas.length > 0) partes.push('### Falhas', '', ...falhas, '', 'Baixe o artefato **relatorio-testes** no fim desta página para ver capturas de tela e detalhes.', '');
if (instaveis.length > 0) partes.push('### Passaram só na segunda tentativa', '', ...instaveis, '');
escrever(`${partes.join('\n')}\n`);
