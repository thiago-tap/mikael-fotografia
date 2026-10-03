import { getCollection, getEntry, type CollectionEntry } from 'astro:content';

const porOrdem = <T extends { data: { ordem: number } }>(a: T, b: T) => a.data.ordem - b.data.ordem;

export async function pacotes() {
  return (await getCollection('pacotes')).sort(porOrdem);
}

export async function etapas() {
  return (await getCollection('comoFunciona')).sort(porOrdem);
}

export async function extras() {
  return (await getCollection('extras')).sort(porOrdem);
}

export async function diferenciais() {
  return (await getCollection('diferenciais')).sort(porOrdem);
}

export async function perguntas({ somenteProposta = false } = {}) {
  const todas = (await getCollection('faq')).sort(porOrdem);
  return somenteProposta ? todas.filter((pergunta) => pergunta.data.naProposta) : todas;
}

export async function depoimentos() {
  return (await getCollection('depoimentos')).sort(porOrdem);
}

export async function posts() {
  return (await getCollection('blog')).sort((a, b) => b.data.data.getTime() - a.data.data.getTime());
}

export async function sobre() {
  const pagina = await getEntry('paginas', 'sobre');
  if (!pagina) throw new Error('src/content/sobre.md não encontrado');
  return pagina;
}

export type ItemMenu = { rotulo: string; caminho: string };

let menuEmCache: Promise<ItemMenu[]> | undefined;

export function menu(): Promise<ItemMenu[]> {
  menuEmCache ??= montarMenu();
  return menuEmCache;
}

async function montarMenu(): Promise<ItemMenu[]> {
  const [listaDepoimentos, listaPosts] = await Promise.all([depoimentos(), posts()]);
  return [
    { rotulo: 'Portfólio', caminho: '/portfolio/' },
    { rotulo: 'Proposta', caminho: '/proposta/' },
    { rotulo: 'Sobre', caminho: '/sobre/' },
    ...(listaDepoimentos.length > 0 ? [{ rotulo: 'Depoimentos', caminho: '/depoimentos/' }] : []),
    ...(listaPosts.length > 0 ? [{ rotulo: 'Blog', caminho: '/blog/' }] : []),
    { rotulo: 'FAQ', caminho: '/faq/' },
    { rotulo: 'Contato', caminho: '/contato/' },
  ];
}

type DadosPacote = CollectionEntry<'pacotes'>['data'];

export function chamadaDoPacote({ chamada, comparativo }: DadosPacote): string | undefined {
  if (chamada) return chamada;
  return comparativo.fotos ? `${comparativo.fotos} fotos editadas em alta resolução.` : undefined;
}

export function seloDoPacote({ destaque, selo }: DadosPacote): string | undefined {
  return destaque ? 'O mais escolhido' : selo;
}

type CampoComparativo = keyof DadosPacote['comparativo'];

const linhasDoComparativo: { rotulo: string; campo: CampoComparativo }[] = [
  { rotulo: 'Fotógrafos', campo: 'fotografos' },
  { rotulo: 'Fotos editadas', campo: 'fotos' },
  { rotulo: 'Pré-wedding', campo: 'preWedding' },
  { rotulo: 'Making of da noiva', campo: 'makingOf' },
  { rotulo: 'Galeria online', campo: 'galeria' },
  { rotulo: 'Prévias oficiais', campo: 'previas' },
  { rotulo: 'Entrega completa', campo: 'entrega' },
  { rotulo: 'Direcionamento de poses', campo: 'poses' },
];

export function comparativo(lista: CollectionEntry<'pacotes'>[]) {
  const linhas = [
    { rotulo: 'Cobertura', valores: lista.map((pacote) => pacote.data.cobertura) },
    ...linhasDoComparativo.map(({ rotulo, campo }) => ({
      rotulo,
      valores: lista.map((pacote) => pacote.data.comparativo[campo]?.trim() || undefined),
    })),
  ];
  return linhas.filter((linha) => linha.valores.some(Boolean));
}

export function faixaDePrecos(lista: CollectionEntry<'pacotes'>[]): [number, number] {
  const precos = lista.map((pacote) => pacote.data.preco);
  return [Math.min(...precos), Math.max(...precos)];
}

export function textoSimples(markdown: string): string {
  return markdown
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_`#>]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function formatarData(data: Date): string {
  return new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(data);
}
