import { configuracoes } from './configuracoes';

export const site = {
  nome: 'Mikael Vt Fotógrafo',
  fotografo: 'Mikael Vt',
  marca: { nome: 'MIKAEL VT', complemento: 'FOTÓGRAFO' },
  arquivoPdf: 'proposta-mikael-vt-fotografo.pdf',
  frase: 'O dia em que duas histórias se tornam uma só.',
  lema: 'Tá cansado de ouvir “olha pra câmera e sorri”? Eu também.',
  cidade: 'Brasília',
  uf: 'DF',
  url: 'https://thiago-tap.github.io/mikael-fotografia/',
  descricao:
    'Fotógrafo de casamento em Brasília/DF. Mikael Vt e equipe fotografam Micro Wedding, Mini Wedding e casamentos completos com um olhar espontâneo, documental e elegante, e fotos tratadas em alta resolução.',
  whatsapp: configuracoes.whatsapp,
  instagram: configuracoes.instagram,
};

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
  '/privacidade/': 'a política de privacidade',
  '/casamentos/': 'os casamentos reais',
  '/agenda/': 'a agenda',
};

export function nomeDaPagina(caminhoCompleto: string): string | undefined {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const caminho = caminhoCompleto.startsWith(base) ? caminhoCompleto.slice(base.length) || '/' : caminhoCompleto;
  const normalizado = caminho.endsWith('/') ? caminho : `${caminho}/`;
  if (normalizado.startsWith('/blog/')) return 'o blog';
  if (normalizado.startsWith('/casamentos/')) return 'os casamentos reais';
  return nomesDasPaginas[normalizado];
}

export function mensagemCasamento(casal: string): string {
  return `Olá, Mikael! Vi o casamento de ${casal} no seu site e quero uma história assim. Pode consultar a disponibilidade da minha data?`;
}

export function mensagemMes(mes: string, ano: number): string {
  return `Olá, Mikael! Vi a agenda no seu site e quero consultar uma data em ${mes} de ${ano}.`;
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
