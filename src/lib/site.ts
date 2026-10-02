export const site = {
  nome: 'Mikael Fotografia',
  fotografo: 'Mikael Vitor',
  frase: 'O dia em que duas histórias se tornam uma só.',
  url: 'https://thiago-tap.github.io/mikael-fotografia/',
  descricao:
    'Fotografia de casamento por Mikael Vitor. Pacotes Micro Wedding, Mini Wedding, Promessa e Eternidade, com fotos tratadas em alta resolução e atendimento próximo.',
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

export const menu = [
  { rotulo: 'Blog', caminho: '/blog/' },
  { rotulo: 'Portfólio', caminho: '/portfolio/' },
  { rotulo: 'Depoimentos', caminho: '/depoimentos/' },
  { rotulo: 'Sobre', caminho: '/sobre/' },
  { rotulo: 'FAQ', caminho: '/faq/' },
  { rotulo: 'Contato', caminho: '/contato/' },
] as const;

export function rota(caminho = '/'): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${base}${caminho}`;
}

export function linkWhatsApp(mensagem: string = site.whatsapp.mensagem): string {
  return `https://wa.me/${site.whatsapp.numero}?text=${encodeURIComponent(mensagem)}`;
}

export function formatarPreco(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: valor % 1 === 0 ? 0 : 2,
  }).format(valor);
}
