import type { CollectionEntry } from 'astro:content';
import type { FotoEditorial } from './editorial';
import { etapas, nomeDaEtapa, type Etapa } from './enquadramento';
import { imagemDoRepositorio } from './fotos';

type Casamento = CollectionEntry<'casamentos'>;

const pastaDoCasamento = (casamento: Casamento) => {
  const arquivo = casamento.filePath?.replace(/\\/g, '/') ?? '';
  return arquivo.slice(0, arquivo.lastIndexOf('/')) || 'src/content/casamentos';
};

export function capaDoCasamento(casamento: Casamento) {
  return imagemDoRepositorio(casamento.data.capa.imagem, pastaDoCasamento(casamento));
}

export type GrupoDaGaleria = { etapa?: Etapa; titulo?: string; fotos: FotoEditorial[] };

/** Galeria em ordem de making of, cerimônia, casal e festa; fotos sem etapa ficam no fim, na ordem da lista. */
export function galeriaDoCasamento(casamento: Casamento): GrupoDaGaleria[] {
  const pasta = pastaDoCasamento(casamento);
  const fotos = casamento.data.galeria.flatMap((item) => {
    const imagem = imagemDoRepositorio(item.imagem, pasta);
    if (!imagem) return [];
    const foto: FotoEditorial = {
      imagem,
      alt: item.alt ?? `${item.etapa ? `${nomeDaEtapa(item.etapa)} do casamento` : 'Casamento'} de ${casamento.data.casal}`,
      legenda: item.legenda,
      foco: item.foco,
      tamanho: item.tamanho,
    };
    return [{ etapa: item.etapa, foto }];
  });

  const grupos: GrupoDaGaleria[] = etapas
    .map((etapa) => ({ etapa, titulo: nomeDaEtapa(etapa), fotos: fotos.filter((item) => item.etapa === etapa).map((item) => item.foto) }))
    .filter((grupo) => grupo.fotos.length > 0);
  const semEtapa = fotos.filter((item) => !item.etapa).map((item) => item.foto);
  if (semEtapa.length > 0) grupos.push({ fotos: semEtapa });
  return grupos;
}

export function partesDoCasal(casal: string): string[] {
  return casal.split(/\s+(e|&)\s+/i);
}
