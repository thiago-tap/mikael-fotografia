export const site = {
  nome: 'Mikael Fotografia',
  fotografo: 'Mikael Vitor',
  frase: 'O dia em que duas histórias se tornam uma só.',
  cidade: 'Brasília',
  uf: 'DF',
  url: 'https://thiago-tap.github.io/mikael-fotografia/',
  descricao:
    'Fotógrafo de casamento em Brasília/DF. Mikael Vitor e equipe fotografam Micro Wedding, Mini Wedding e casamentos completos, com fotos tratadas em alta resolução e atendimento próximo.',
  whatsapp: {
    numero: '5561982042153',
    exibicao: '(61) 98204-2153',
    mensagem: 'Olá, Mikael! Vi seu site e quero saber mais sobre a fotografia do meu casamento.',
  },
  instagram: {
    usuario: 'mikaelvt_fotografia',
    url: 'https://www.instagram.com/mikaelvt_fotografia/',
  },
} as const;

export const regiao = `${site.cidade}/${site.uf}`;

export function rota(caminho = '/'): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${base}${caminho}`;
}

export function linkWhatsApp(mensagem: string = site.whatsapp.mensagem): string {
  return `https://wa.me/${site.whatsapp.numero}?text=${encodeURIComponent(mensagem)}`;
}

const nomesDasPaginas: Record<string, string> = {
  '/': 'a página inicial',
  '/proposta/': 'a proposta',
  '/portfolio/': 'o portfólio',
  '/sobre/': 'a página Sobre',
  '/faq/': 'as perguntas frequentes',
  '/contato/': 'a página de contato',
  '/depoimentos/': 'os depoimentos',
  '/blog/': 'o blog',
};

export function nomeDaPagina(caminhoCompleto: string): string | undefined {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const caminho = caminhoCompleto.startsWith(base) ? caminhoCompleto.slice(base.length) || '/' : caminhoCompleto;
  const normalizado = caminho.endsWith('/') ? caminho : `${caminho}/`;
  if (normalizado.startsWith('/blog/')) return 'o blog';
  return nomesDasPaginas[normalizado];
}

export function mensagemDisponibilidade(pagina?: string): string {
  const origem = pagina ? `Vi ${pagina} do seu site` : 'Vi o seu site';
  return `Olá, Mikael! ${origem} e quero consultar a disponibilidade da minha data de casamento.`;
}

export function mensagemPacote(nome: string): string {
  return `Olá, Mikael! Tenho interesse no pacote ${nome} e quero consultar a disponibilidade da minha data de casamento.`;
}

export function formatarPreco(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: valor % 1 === 0 ? 0 : 2,
  }).format(valor);
}
