import type { ImageMetadata } from 'astro';
import type { Foco, Tamanho } from './enquadramento';

export type Orientacao = 'horizontal' | 'vertical';

export type FotoEditorial = {
  imagem?: ImageMetadata;
  alt: string;
  legenda?: string;
  foco: Foco;
  tamanho: Tamanho;
  aguardando?: string;
  orientacaoVazia?: Orientacao;
};

export type ItemEditorial = { tamanho: Tamanho; orientacao: Orientacao };

type Resolvido<T> = T & { papel: Exclude<Tamanho, 'auto'> };

export type Linha<T> =
  | { tipo: 'larga'; itens: [Resolvido<T>] }
  | { tipo: 'destaque'; itens: [Resolvido<T>, Resolvido<T>]; principal: 0 | 1 }
  | { tipo: 'par'; itens: [Resolvido<T>, Resolvido<T>] }
  | { tipo: 'trio'; itens: [Resolvido<T>, Resolvido<T>, Resolvido<T>] }
  | { tipo: 'citacao'; itens: [Resolvido<T>, Resolvido<T>]; texto: string }
  | { tipo: 'sozinha'; itens: [Resolvido<T>] };

const ritmoHorizontal = ['grande', 'medio', 'medio'] as const;

function resolver<T extends ItemEditorial>(itens: T[]): Resolvido<T>[] {
  let horizontais = 0;
  return itens.map((item) => {
    if (item.tamanho !== 'auto') return { ...item, papel: item.tamanho };
    if (item.orientacao === 'vertical') return { ...item, papel: 'vertical' };
    const papel = ritmoHorizontal[horizontais % ritmoHorizontal.length];
    horizontais += 1;
    return { ...item, papel };
  });
}

/**
 * Agrupa as fotos em linhas de revista sem mudar a ordem: grande + vertical lado a lado,
 * pares de médias, trios de verticais e, de vez em quando, uma frase entre duas verticais.
 */
export function montarLinhas<T extends ItemEditorial>(itens: T[], citacoes: string[] = []): Linha<T>[] {
  const fila = resolver(itens);
  const linhas: Linha<T>[] = [];
  const frases = [...citacoes];
  let paresDeVerticais = 0;
  let i = 0;

  while (i < fila.length) {
    const [a, b, c] = [fila[i], fila[i + 1], fila[i + 2]];

    if (a.papel === 'grande') {
      if (b?.papel === 'vertical') {
        linhas.push({ tipo: 'destaque', itens: [a, b], principal: 0 });
        i += 2;
      } else {
        linhas.push({ tipo: 'larga', itens: [a] });
        i += 1;
      }
      continue;
    }

    if (a.papel === 'medio') {
      if (b?.papel === 'medio') {
        linhas.push({ tipo: 'par', itens: [a, b] });
        i += 2;
      } else if (b?.papel === 'vertical') {
        linhas.push({ tipo: 'destaque', itens: [a, b], principal: 0 });
        i += 2;
      } else {
        linhas.push({ tipo: 'larga', itens: [a] });
        i += 1;
      }
      continue;
    }

    if (b?.papel === 'grande' || b?.papel === 'medio') {
      linhas.push({ tipo: 'destaque', itens: [a, b], principal: 1 });
      i += 2;
    } else if (b?.papel === 'vertical' && c?.papel === 'vertical') {
      linhas.push({ tipo: 'trio', itens: [a, b, c] });
      i += 3;
    } else if (b?.papel === 'vertical') {
      const texto = paresDeVerticais % 2 === 0 ? frases.shift() : undefined;
      linhas.push(texto ? { tipo: 'citacao', itens: [a, b], texto } : { tipo: 'par', itens: [a, b] });
      paresDeVerticais += 1;
      i += 2;
    } else {
      linhas.push({ tipo: 'sozinha', itens: [a] });
      i += 1;
    }
  }

  return linhas;
}
