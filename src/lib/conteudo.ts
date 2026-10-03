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

export async function casamentos() {
  return (await getCollection('casamentos')).sort(
    (a, b) => a.data.ordem - b.data.ordem || (b.data.data?.getTime() ?? 0) - (a.data.data?.getTime() ?? 0),
  );
}

export function lugarDoCasamento({ local, cidade }: CollectionEntry<'casamentos'>['data']): string {
  return [local, cidade].filter(Boolean).join(' · ');
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
  const [listaDepoimentos, listaPosts, listaCasamentos] = await Promise.all([depoimentos(), posts(), casamentos()]);
  return [
    { rotulo: 'Portfólio', caminho: '/portfolio/' },
    ...(listaCasamentos.length > 0 ? [{ rotulo: 'Casamentos', caminho: '/casamentos/' }] : []),
    { rotulo: 'Proposta', caminho: '/proposta/' },
    { rotulo: 'Sobre', caminho: '/sobre/' },
    ...(listaDepoimentos.length > 0 ? [{ rotulo: 'Depoimentos', caminho: '/depoimentos/' }] : []),
    ...(listaPosts.length > 0 ? [{ rotulo: 'Blog', caminho: '/blog/' }] : []),
    { rotulo: 'FAQ', caminho: '/faq/' },
    { rotulo: 'Contato', caminho: '/contato/' },
  ];
}

type DadosPacote = CollectionEntry<'pacotes'>['data'];

export function destaquesDoPacote({ comparativo }: DadosPacote): string[] {
  const { fotografos, fotos, preWedding, makingOf } = comparativo;
  const extrasInclusos = [preWedding === 'Incluso' && 'Pré-wedding', makingOf === 'Incluso' && 'making of'].filter(Boolean);
  return [
    fotografos && `${fotografos} ${fotografos === '1' ? 'fotógrafo' : 'fotógrafos profissionais'}`,
    fotos && `${fotos} fotos editadas`,
    extrasInclusos.length > 0 ? `${extrasInclusos.join(' e ')} inclusos` : 'Cerimônia e recepção',
  ].filter((item): item is string => Boolean(item));
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

export type Numero = { valor: number; rotulo: string };

const primeiroNumero = (texto: string | undefined) => {
  const encontrado = texto?.match(/\d+/);
  return encontrado ? Number(encontrado[0]) : undefined;
};

/** Números confirmados pelo próprio conteúdo do site; o que não estiver escrito em algum lugar não aparece. */
export async function numerosDoSite(): Promise<Numero[]> {
  const [paginaSobre, listaPacotes, listaEtapas] = await Promise.all([sobre(), pacotes(), etapas()]);
  const anos = primeiroNumero(paginaSobre.data.resumo.match(/\d+\s+anos?/)?.[0]);
  const fotografos = Math.max(0, ...listaPacotes.map((pacote) => primeiroNumero(pacote.data.comparativo.fotografos) ?? 0));
  const etapa = (id: string) => listaEtapas.find((item) => item.id === id)?.data.detalhe;
  const previas = primeiroNumero(etapa('previas'));
  const entrega = primeiroNumero(etapa('entrega'));
  return [
    anos !== undefined && { valor: anos, rotulo: anos === 1 ? 'ano fotografando' : 'anos fotografando' },
    fotografos > 1 && { valor: fotografos, rotulo: 'fotógrafos no seu dia' },
    previas !== undefined && { valor: previas, rotulo: 'dias para as prévias' },
    entrega !== undefined && { valor: entrega, rotulo: 'dias úteis para a entrega' },
  ].filter((numero): numero is Numero => Boolean(numero));
}

export function formatarData(data: Date): string {
  return new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(data);
}
