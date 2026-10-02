import type { ImageMetadata } from 'astro';
import { getImage } from 'astro:assets';
import { z } from 'astro/zod';
import legendasJson from '../content/portfolio/legendas.json';
import { configuracoes } from './configuracoes';

type ModuloImagem = { default: ImageMetadata };

const imagensDoRepositorio = import.meta.glob<ModuloImagem>(
  ['/src/assets/**/*.{jpg,jpeg,png,webp,avif}', '/src/content/**/*.{jpg,jpeg,png,webp,avif}'],
  { eager: true },
);

export type Proporcao = '3:2' | '4:5' | '16:9' | '2:3' | '9:16';

/** Fotos fixas do site. O arquivo vai em src/assets/fotos com o nome indicado ou é escolhido em configuracoes.json → fotos. */
export const vagas = {
  'home-hero': { proporcao: '3:2', medida: '3000 × 2000 px' },
  'proposta-hero': { proporcao: '3:2', medida: '3000 × 2000 px' },
  'faixa': { proporcao: '3:2', medida: '3000 × 2000 px' },
  'sobre-retrato': { proporcao: '4:5', medida: '1600 × 2000 px' },
  'pacote-micro-wedding': { proporcao: '3:2', medida: '2400 × 1600 px' },
  'pacote-mini-wedding': { proporcao: '3:2', medida: '2400 × 1600 px' },
  'pacote-promessa': { proporcao: '3:2', medida: '2400 × 1600 px' },
  'pacote-eternidade': { proporcao: '3:2', medida: '2400 × 1600 px' },
  'pdf-capa': { proporcao: '9:16', medida: '1690 × 3000 px' },
  'pdf-extras': { proporcao: '3:2', medida: '2400 × 1600 px' },
  'pdf-diferenciais': { proporcao: '2:3', medida: '1600 × 2400 px' },
} as const satisfies Record<string, { proporcao: Proporcao; medida: string }>;

export type Vaga = keyof typeof vagas;

export const formatos: ('avif' | 'webp')[] = ['avif', 'webp'];

/** Larguras geradas no build, sem ampliar a foto e com teto de `maxima` px. */
export function larguras(foto: ImageMetadata, maxima = 2400): number[] {
  const padrao = [480, 800, 1200, 1600].filter((largura) => largura < Math.min(foto.width, maxima));
  return [...padrao, Math.min(foto.width, maxima)];
}

/** Versão grande usada no lightbox e no link da foto quando o JavaScript não roda. */
export async function versaoAmpliada(foto: ImageMetadata): Promise<string> {
  const ampliada = await getImage({ src: foto, width: Math.min(foto.width, 2400), format: 'webp', quality: 85 });
  return ampliada.src;
}

function nomeSemExtensao(caminho: string): string {
  return (caminho.split('/').pop() ?? caminho).replace(/\.[^.]+$/, '');
}

/**
 * Caminho salvo pelo painel (ex.: /src/assets/instagram/foto.jpg) para a imagem processada pelo Astro.
 * Caminhos com ./ são procurados em `pasta` (ex.: src/content/depoimentos).
 */
export function imagemDoRepositorio(caminho: string | null | undefined, pasta?: string): ImageMetadata | undefined {
  const limpo = caminho?.trim();
  if (!limpo) return undefined;
  const relativo = limpo.startsWith('./') && pasta ? `${pasta}/${limpo.slice(2)}` : limpo;
  return imagensDoRepositorio[`/${relativo.replace(/^\.?\/+/, '')}`]?.default;
}

/** Usa a foto escolhida no painel para a vaga; sem escolha, procura em src/assets/fotos um arquivo com esse nome. */
export function fotoDoSite(nome: string): ImageMetadata | undefined {
  const escolhida = imagemDoRepositorio(configuracoes.fotos[nome]);
  if (escolhida) return escolhida;
  const encontrada = Object.entries(imagensDoRepositorio).find(
    ([caminho]) => caminho.startsWith('/src/assets/fotos/') && nomeSemExtensao(caminho) === nome,
  );
  return encontrada?.[1].default;
}

export type FotoPortfolio = {
  id: string;
  imagem: ImageMetadata;
  alt: string;
  legenda?: string;
};

const altPadrao = 'Fotografia de casamento por Mikael Fotografia';

const esquemaLegendas = z.array(
  z.object({
    imagem: z.string().nullish(),
    alt: z.string().nullish(),
    legenda: z.string().nullish(),
  }),
);

/**
 * Fotos de src/content/portfolio. As que estão em legendas.json vêm primeiro, na ordem da lista,
 * com texto alternativo e legenda; as demais seguem em ordem alfabética do nome do arquivo.
 */
export function fotosPortfolio(): FotoPortfolio[] {
  const legendas = esquemaLegendas.parse(legendasJson);
  const doPortfolio = Object.entries(imagensDoRepositorio)
    .filter(([caminho]) => caminho.startsWith('/src/content/portfolio/'))
    .sort(([a], [b]) => a.localeCompare(b, 'pt-BR', { numeric: true }));

  const posicao = (caminho: string) => {
    const indice = legendas.findIndex((item) => item.imagem && `/${item.imagem.replace(/^\.?\/+/, '')}` === caminho);
    return indice === -1 ? Number.POSITIVE_INFINITY : indice;
  };

  return doPortfolio
    .map(([caminho, modulo], ordemAlfabetica) => ({ caminho, modulo, ordem: posicao(caminho), ordemAlfabetica }))
    .sort((a, b) => a.ordem - b.ordem || a.ordemAlfabetica - b.ordemAlfabetica)
    .map(({ caminho, modulo, ordem }) => {
      const texto = Number.isFinite(ordem) ? legendas[ordem] : undefined;
      return {
        id: nomeSemExtensao(caminho),
        imagem: modulo.default,
        alt: texto?.alt?.trim() || altPadrao,
        legenda: texto?.legenda?.trim() || undefined,
      };
    });
}
