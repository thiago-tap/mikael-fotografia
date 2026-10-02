import type { ImageMetadata } from 'astro';
import { getImage } from 'astro:assets';
import legendas from '../content/portfolio/legendas.json';

type ModuloImagem = { default: ImageMetadata };

const fotosDoSite = import.meta.glob<ModuloImagem>('/src/assets/fotos/*.{jpg,jpeg,png,webp,avif}', {
  eager: true,
});

const fotosDoPortfolio = import.meta.glob<ModuloImagem>(
  '/src/content/portfolio/*.{jpg,jpeg,png,webp,avif}',
  { eager: true },
);

const marca = import.meta.glob<ModuloImagem>('/src/assets/marca/logo.{png,svg,webp}', {
  eager: true,
});

export type Proporcao = '3:2' | '4:5' | '16:9' | '2:3';

/** Fotos fixas do site. O arquivo vai em src/assets/fotos com o nome indicado (jpg, png ou webp). */
export const vagas = {
  'home-hero': { proporcao: '3:2', medida: '3000 × 2000 px' },
  'proposta-hero': { proporcao: '3:2', medida: '3000 × 2000 px' },
  'faixa': { proporcao: '3:2', medida: '3000 × 2000 px' },
  'sobre-retrato': { proporcao: '4:5', medida: '1600 × 2000 px' },
  'pacote-micro-wedding': { proporcao: '3:2', medida: '2400 × 1600 px' },
  'pacote-mini-wedding': { proporcao: '3:2', medida: '2400 × 1600 px' },
  'pacote-promessa': { proporcao: '3:2', medida: '2400 × 1600 px' },
  'pacote-eternidade': { proporcao: '3:2', medida: '2400 × 1600 px' },
} as const satisfies Record<string, { proporcao: Proporcao; medida: string }>;

export type Vaga = keyof typeof vagas;

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

/** Procura em src/assets/fotos um arquivo com esse nome (qualquer extensão). */
export function fotoDoSite(nome: string): ImageMetadata | undefined {
  const encontrada = Object.entries(fotosDoSite).find(([caminho]) => nomeSemExtensao(caminho) === nome);
  return encontrada?.[1].default;
}

export function logo(): ImageMetadata | undefined {
  return Object.values(marca)[0]?.default;
}

type Legenda = { alt?: string; legenda?: string };

export type FotoPortfolio = {
  id: string;
  imagem: ImageMetadata;
  alt: string;
  legenda?: string;
};

const altPadrao = 'Fotografia de casamento por Mikael Fotografia';

/**
 * Fotos de src/content/portfolio em ordem alfabética do nome do arquivo.
 * Texto alternativo e legenda vêm de legendas.json, pela chave do nome do arquivo sem extensão.
 */
export function fotosPortfolio(): FotoPortfolio[] {
  const textos = legendas as Record<string, Legenda>;
  return Object.entries(fotosDoPortfolio)
    .sort(([a], [b]) => a.localeCompare(b, 'pt-BR', { numeric: true }))
    .map(([caminho, modulo]) => {
      const id = nomeSemExtensao(caminho);
      return {
        id,
        imagem: modulo.default,
        alt: textos[id]?.alt ?? altPadrao,
        legenda: textos[id]?.legenda,
      };
    });
}
