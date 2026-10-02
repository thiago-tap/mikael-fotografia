import { getCollection, getEntry } from 'astro:content';

const porOrdem = <T extends { data: { ordem: number } }>(a: T, b: T) => a.data.ordem - b.data.ordem;

export async function pacotes() {
  return (await getCollection('pacotes')).sort(porOrdem);
}

export async function extras() {
  return (await getCollection('extras')).sort(porOrdem);
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

export function formatarData(data: Date): string {
  return new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(data);
}
