import { join } from 'node:path';
import type { ImageMetadata } from 'astro';
import { getImage } from 'astro:assets';
import { z } from 'astro/zod';
import sharp from 'sharp';
import legendasJson from '../content/portfolio/legendas.json';
import { configuracoes } from './configuracoes';
import { esquemaFoco, esquemaTamanho, type Foco, type Tamanho } from './enquadramento';

type ModuloImagem = { default: ImageMetadata };

const imagensDoRepositorio = import.meta.glob<ModuloImagem>(
  [
    '/src/assets/**/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG,WEBP,AVIF,Jpg,Jpeg,Png,Webp}',
    '/src/content/**/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG,WEBP,AVIF,Jpg,Jpeg,Png,Webp}',
  ],
  { eager: true },
);

const caminhoDaImagem = new Map(Object.entries(imagensDoRepositorio).map(([caminho, modulo]) => [modulo.default, caminho]));

/** Chave de comparação que ignora maiúsculas, acentos decompostos, %20 e ./ do início (ex.: Foto%20Um.JPG = foto um.jpg). */
function chaveDoCaminho(caminho: string): string {
  let limpo = caminho.trim();
  try {
    limpo = decodeURI(limpo);
  } catch {
    // caminho com % solto: usa como está
  }
  return `/${limpo.replace(/^\.?\/+/, '')}`.normalize('NFC').toLowerCase();
}

const imagemPorChave = new Map(Object.entries(imagensDoRepositorio).map(([caminho, modulo]) => [chaveDoCaminho(caminho), modulo.default]));

const avisados = new Set<string>();

export type Proporcao = '3:2' | '4:5' | '16:9' | '2:3' | '9:16' | '3:4' | '1:1';

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

const miniaturas = new Map<string, Promise<string | undefined>>();

/** Miniatura de 20 px em base64, mostrada desfocada enquanto a foto carrega. */
export function miniatura(foto: ImageMetadata | undefined): Promise<string | undefined> {
  const caminho = foto && caminhoDaImagem.get(foto);
  if (!caminho) return Promise.resolve(undefined);
  let pronta = miniaturas.get(caminho);
  if (!pronta) {
    pronta = sharp(join(process.cwd(), caminho))
      .rotate()
      .resize(20)
      .webp({ quality: 50 })
      .toBuffer()
      .then((dados) => `data:image/webp;base64,${dados.toString('base64')}`)
      .catch(() => undefined);
    miniaturas.set(caminho, pronta);
  }
  return pronta;
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
  const imagem = imagemPorChave.get(chaveDoCaminho(relativo));
  if (!imagem && !avisados.has(relativo)) {
    avisados.add(relativo);
    console.warn(`[fotos] Foto escolhida no painel não encontrada no repositório: ${limpo}`);
  }
  return imagem;
}

/** Usa a foto escolhida no painel para a vaga; sem escolha, procura em src/assets/fotos um arquivo com esse nome. */
export function fotoDoSite(nome: string): ImageMetadata | undefined {
  const escolhida = imagemDoRepositorio(configuracoes.fotos[nome]);
  if (escolhida) return escolhida;
  const encontrada = Object.entries(imagensDoRepositorio).find(
    ([caminho]) => caminho.startsWith('/src/assets/fotos/') && nomeSemExtensao(caminho).toLowerCase() === nome,
  );
  return encontrada?.[1].default;
}

export function focoDaVaga(nome: string): Foco {
  return configuracoes.focos[nome] ?? 'centro';
}

export type FotoPortfolio = {
  id: string;
  imagem: ImageMetadata;
  alt: string;
  legenda?: string;
  foco: Foco;
  tamanho: Tamanho;
};

const altPadrao = 'Fotografia de casamento por Mikael Vt';

const esquemaLegendas = z.array(
  z.object({
    imagem: z.string().nullish(),
    alt: z.string().max(160, 'Descrição da foto do portfólio com mais de 160 caracteres').nullish(),
    legenda: z.string().max(80, 'Legenda do portfólio com mais de 80 caracteres').nullish(),
    foco: esquemaFoco,
    tamanho: esquemaTamanho,
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
    const indice = legendas.findIndex((item) => item.imagem && chaveDoCaminho(item.imagem) === chaveDoCaminho(caminho));
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
        foco: texto?.foco ?? 'centro',
        tamanho: texto?.tamanho ?? 'auto',
      };
    });
}
