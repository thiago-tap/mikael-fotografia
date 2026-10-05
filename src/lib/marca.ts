import type { ImageMetadata } from 'astro';
import { getImage } from 'astro:assets';
import { configuracoes } from './configuracoes';

type ModuloImagem = { default: ImageMetadata };

const pasta = '/src/assets/marca/';

const arquivos = import.meta.glob<ModuloImagem>('/src/assets/marca/*.{png,svg,webp,PNG,SVG,WEBP}', { eager: true });

/** Arquivo escolhido no painel; sem escolha, procura em src/assets/marca um arquivo com o nome `padrao` (ex.: logo.png). */
function arquivoDaMarca(escolhido: string, padrao: string): string | undefined {
  const caminho = escolhido && `/${escolhido.replace(/^\.?\/+/, '')}`.toLowerCase();
  const encontrado = caminho && Object.keys(arquivos).find((chave) => chave.toLowerCase() === caminho);
  if (encontrado) return encontrado;
  return Object.keys(arquivos).find((chave) => chave.slice(pasta.length).replace(/\.[^.]+$/, '').toLowerCase() === padrao);
}

const imagem = (caminho: string | undefined) => (caminho ? arquivos[caminho]?.default : undefined);

export const logo = imagem(arquivoDaMarca(configuracoes.logo, 'logo'));

export const logoClaro = imagem(arquivoDaMarca(configuracoes.logoClaro, 'logo-claro'));

/** Caminho do ícone a partir da raiz do projeto (ex.: /src/assets/marca/icone.png). */
export const arquivoDoIcone = arquivoDaMarca(configuracoes.icone, 'icone');

export const icone = imagem(arquivoDoIcone);

export const tamanhosDoIcone = {
  'favicon-32': { lado: 32, fundo: false },
  'apple-touch-icon': { lado: 180, fundo: true },
  'icone-192': { lado: 192, fundo: false },
  'icone-512': { lado: 512, fundo: false },
} as const;

export type NomeDoIcone = keyof typeof tamanhosDoIcone;

export const ehSvg = (imagem: ImageMetadata) => imagem.format === 'svg';

/** Endereço do logo para os dados estruturados: SVG como está, demais em PNG de até 1200 px. */
export async function enderecoDoLogo(): Promise<string | undefined> {
  if (!logo) return undefined;
  if (ehSvg(logo)) return logo.src;
  const convertido = await getImage({ src: logo, width: Math.min(logo.width, 1200), format: 'png' });
  return convertido.src;
}
