import { execFileSync } from 'node:child_process';
import { appendFileSync, existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { extname, join, resolve } from 'node:path';

const extensoesImagem = new Set(
  ['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif', 'heic', 'heif', 'tif', 'tiff', 'raw', 'dng', 'cr2', 'cr3', 'nef', 'arw'].map((extensao) => `.${extensao}`),
);
const limitePadraoMb = 15;
const ramo = 'main';

const raiz = resolve(import.meta.dirname, '..');
const argumentos = process.argv.slice(2);
const valorArgumento = (nome) => argumentos[argumentos.indexOf(nome) + 1];
const simular = argumentos.includes('--simular');
const forcar = argumentos.includes('--forcar');
const semEnviar = argumentos.includes('--sem-enviar');
const somenteEnviar = argumentos.includes('--somente-enviar');
const limite = Number(argumentos.includes('--limite-mb') ? valorArgumento('--limite-mb') : limitePadraoMb) * 1024 * 1024;
const caminhoBackup = resolve(
  argumentos.includes('--backup')
    ? valorArgumento('--backup')
    : join(tmpdir(), `mikael-fotografia-historico-${new Date().toISOString().slice(0, 10)}.bundle`),
);

const git = (args, opcoes = {}) =>
  execFileSync('git', args, { cwd: opcoes.cwd ?? raiz, encoding: 'utf8', maxBuffer: 1 << 30, input: opcoes.input, stdio: opcoes.stdio }) ?? '';
const linhas = (texto) => texto.split('\n').filter(Boolean);
const shaRemoto = () => git(['ls-remote', 'origin', `refs/heads/${ramo}`]).split(/\s+/)[0];
const arquivoEstado = resolve(raiz, git(['rev-parse', '--git-dir']).trim(), 'limpar-historico-imagens.json');

const formatarTamanho = (bytes) =>
  bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(2)} MB` : `${(bytes / 1024).toFixed(0)} KB`;

const saida = (valores) => {
  if (!process.env.GITHUB_OUTPUT) return;
  appendFileSync(process.env.GITHUB_OUTPUT, Object.entries(valores).map(([chave, valor]) => `${chave}=${valor}\n`).join(''));
};

const resumo = (markdown) => {
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${markdown}\n\n`);
};

const aviso = (mensagem) => console.log(process.env.GITHUB_ACTIONS ? `::warning::${mensagem}` : `Aviso: ${mensagem}`);

const falhar = (mensagem) => {
  console.error(process.env.GITHUB_ACTIONS ? `::error::${mensagem}` : `Erro: ${mensagem}`);
  process.exit(1);
};

const listarCandidatos = (cwd = raiz) => {
  const imagens = new Map();
  for (const linha of linhas(git(['rev-list', '--objects', '--all'], { cwd }))) {
    const espaco = linha.indexOf(' ');
    if (espaco < 0) continue;
    const caminho = linha.slice(espaco + 1);
    if (extensoesImagem.has(extname(caminho).toLowerCase())) imagens.set(linha.slice(0, espaco), caminho);
  }
  if (!imagens.size) return [];
  const atuais = new Set(linhas(git(['ls-tree', '-r', '--object-only', 'HEAD'], { cwd })));
  const tipos = linhas(git(['cat-file', '--batch-check=%(objectname) %(objecttype) %(objectsize)'], { cwd, input: [...imagens.keys()].join('\n') }));
  return tipos
    .map((linha) => linha.split(' '))
    .filter(([id, tipo]) => tipo === 'blob' && !atuais.has(id))
    .map(([id, , tamanho]) => ({ id, caminho: imagens.get(id), tamanho: Number(tamanho) }))
    .sort((a, b) => b.tamanho - a.tamanho);
};

const verificarFilterRepo = () => {
  try {
    git(['filter-repo', '--version']);
  } catch {
    falhar('git-filter-repo não encontrado. Instale com: pip install git-filter-repo');
  }
};

const reescrever = (cwd, candidatos) => {
  const pastaIds = mkdtempSync(join(tmpdir(), 'limpar-historico-'));
  const arquivoIds = join(pastaIds, 'ids.txt');
  writeFileSync(arquivoIds, `${candidatos.map(({ id }) => id).join('\n')}\n`);
  try {
    git(['filter-repo', '--force', '--strip-blobs-with-ids', arquivoIds], { cwd, stdio: 'inherit' });
  } finally {
    rmSync(pastaIds, { recursive: true, force: true });
  }
};

const enviar = () => {
  if (!existsSync(arquivoEstado)) falhar('Nenhuma reescrita pendente para enviar.');
  const estado = JSON.parse(readFileSync(arquivoEstado, 'utf8'));
  if (git(['rev-parse', 'HEAD^{tree}']).trim() !== estado.arvore) falhar('A árvore da HEAD mudou desde a reescrita. Envio cancelado.');
  const remoto = shaRemoto();
  if (remoto !== estado.shaOriginal) {
    aviso(`A ${ramo} mudou durante a limpeza (${estado.shaOriginal.slice(0, 7)} → ${remoto.slice(0, 7)}). Nada foi enviado; a próxima execução fará a limpeza.`);
    resumo(`> A ${ramo} mudou durante a limpeza. Nada foi enviado.`);
    saida({ enviado: 'false' });
    return;
  }
  git(['push', `--force-with-lease=refs/heads/${ramo}:${estado.shaOriginal}`, 'origin', `HEAD:refs/heads/${ramo}`], { stdio: 'inherit' });
  rmSync(arquivoEstado, { force: true });
  console.log(`Histórico reescrito enviado: ${estado.shaOriginal.slice(0, 7)} → ${git(['rev-parse', '--short', 'HEAD']).trim()}.`);
  resumo(`Histórico enviado para a ${ramo}: \`${estado.shaOriginal.slice(0, 7)}\` → \`${git(['rev-parse', '--short', 'HEAD']).trim()}\`.`);
  saida({ enviado: 'true' });
};

if (somenteEnviar) {
  enviar();
  process.exit(0);
}

if (git(['status', '--porcelain']).trim()) falhar('Há alterações não commitadas. Faça commit ou descarte antes de limpar o histórico.');
if (git(['symbolic-ref', '--short', 'HEAD']).trim() !== ramo) falhar(`Execute a limpeza com a branch ${ramo} ativa.`);
git(['fetch', 'origin', ramo], { stdio: 'inherit' });
const shaOriginal = git(['rev-parse', 'HEAD']).trim();
if (shaOriginal !== git(['rev-parse', 'FETCH_HEAD']).trim()) falhar(`A ${ramo} local difere da origin/${ramo}. Sincronize (pull/push) antes de limpar.`);
const arvore = git(['rev-parse', 'HEAD^{tree}']).trim();

const candidatos = listarCandidatos();
const total = candidatos.reduce((soma, { tamanho }) => soma + tamanho, 0);
saida({ candidatos: candidatos.length, total, reescrito: 'false', enviado: 'false' });

if (!candidatos.length) {
  console.log('Nenhuma versão antiga de imagem no histórico.');
  resumo('### Limpeza do histórico de imagens\n\nNenhuma versão antiga de imagem no histórico.');
  process.exit(0);
}

const tabela = candidatos.map(({ id, caminho, tamanho }) => [
  caminho,
  formatarTamanho(tamanho),
  linhas(git(['log', '--all', '--format=%h', `--find-object=${id}`])).join(', '),
]);
console.log(`Versões antigas de imagens fora da HEAD (${candidatos.length}, total ${formatarTamanho(total)}):`);
tabela.forEach(([caminho, tamanho, commits]) => console.log(`  - ${caminho}  ${tamanho}  [${commits}]`));
resumo(
  [
    '### Limpeza do histórico de imagens',
    '',
    '| Arquivo | Tamanho | Commits |',
    '| --- | ---: | --- |',
    ...tabela.map((linha) => `| ${linha.join(' | ')} |`),
    '',
    `**Total:** ${formatarTamanho(total)} em ${candidatos.length} versões (limite ${formatarTamanho(limite)}).`,
  ].join('\n'),
);

if (total < limite && !forcar) {
  console.log(`Total abaixo do limite de ${formatarTamanho(limite)}. Histórico mantido.`);
  resumo('Abaixo do limite: histórico mantido.');
  process.exit(0);
}

verificarFilterRepo();

if (simular) {
  const pastaClone = mkdtempSync(join(tmpdir(), 'limpar-historico-clone-'));
  try {
    git(['clone', '--quiet', '--no-local', raiz, pastaClone]);
    reescrever(pastaClone, candidatos);
    const arvoreClone = git(['rev-parse', 'HEAD^{tree}'], { cwd: pastaClone }).trim();
    if (arvoreClone !== arvore) falhar('Simulação: a árvore da HEAD mudaria com a reescrita.');
    const restantes = listarCandidatos(pastaClone).length;
    console.log(`Simulação concluída: árvore da HEAD idêntica, ${restantes} versões antigas restantes. Nada foi alterado.`);
    resumo(`Simulação: árvore da HEAD idêntica após a reescrita, ${restantes} versões antigas restantes. Nada foi enviado.`);
  } finally {
    rmSync(pastaClone, { recursive: true, force: true });
  }
  process.exit(0);
}

const urlOrigem = git(['remote', 'get-url', 'origin']).trim();
git(['bundle', 'create', caminhoBackup, '--all'], { stdio: 'inherit' });
git(['bundle', 'verify', '--quiet', caminhoBackup], { stdio: 'inherit' });
console.log(`Backup completo do repositório: ${caminhoBackup}`);

reescrever(raiz, candidatos);
if (!linhas(git(['remote'])).includes('origin')) git(['remote', 'add', 'origin', urlOrigem]);

if (git(['rev-parse', 'HEAD^{tree}']).trim() !== arvore) {
  falhar(`A árvore da HEAD mudou com a reescrita. Nada foi enviado. Restaure com: git fetch "${caminhoBackup}" ${ramo} && git reset --hard FETCH_HEAD`);
}
const restantes = listarCandidatos();
if (restantes.length) falhar(`${restantes.length} versões antigas continuam no histórico. Nada foi enviado.`);

writeFileSync(arquivoEstado, JSON.stringify({ shaOriginal, arvore }));
saida({ reescrito: 'true' });
console.log(`Histórico reescrito localmente: ${shaOriginal.slice(0, 7)} → ${git(['rev-parse', '--short', 'HEAD']).trim()} (árvore da HEAD idêntica).`);

if (!semEnviar) enviar();
