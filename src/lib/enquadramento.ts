import { z } from 'astro/zod';

export const focos = [
  'centro',
  'esquerda',
  'direita',
  'topo',
  'base',
  'topo-esquerda',
  'topo-direita',
  'base-esquerda',
  'base-direita',
] as const;

export type Foco = (typeof focos)[number];

export const tamanhos = ['auto', 'grande', 'medio', 'vertical'] as const;

export type Tamanho = (typeof tamanhos)[number];

export const etapas = ['making-of', 'cerimonia', 'casal', 'festa'] as const;

export type Etapa = (typeof etapas)[number];

const vazioComoAusente = (valor: unknown) => (valor === '' || valor === null ? undefined : valor);

export const esquemaFoco = z.preprocess(vazioComoAusente, z.enum(focos).default('centro'));

export const esquemaTamanho = z.preprocess(vazioComoAusente, z.enum(tamanhos).default('auto'));

export const esquemaEtapa = z.preprocess(vazioComoAusente, z.enum(etapas).optional());

export function posicaoDoFoco(foco: Foco): string {
  switch (foco) {
    case 'centro':
      return '50% 50%';
    case 'esquerda':
      return '0% 50%';
    case 'direita':
      return '100% 50%';
    case 'topo':
      return '50% 0%';
    case 'base':
      return '50% 100%';
    case 'topo-esquerda':
      return '0% 0%';
    case 'topo-direita':
      return '100% 0%';
    case 'base-esquerda':
      return '0% 100%';
    case 'base-direita':
      return '100% 100%';
    default: {
      const inesperado: never = foco;
      throw new Error(`Foco desconhecido: ${String(inesperado)}`);
    }
  }
}

export function nomeDaEtapa(etapa: Etapa): string {
  switch (etapa) {
    case 'making-of':
      return 'Making of';
    case 'cerimonia':
      return 'Cerimônia';
    case 'casal':
      return 'O casal';
    case 'festa':
      return 'Festa';
    default: {
      const inesperada: never = etapa;
      throw new Error(`Etapa desconhecida: ${String(inesperada)}`);
    }
  }
}
