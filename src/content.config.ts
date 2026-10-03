import { defineCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';

const textoOpcional = z
  .string()
  .nullish()
  .transform((valor) => valor ?? undefined);

const pacotes = defineCollection({
  loader: file('src/content/pacotes.json'),
  schema: z.object({
    nome: z.string(),
    ordem: z.number(),
    preco: z.number(),
    cobertura: z.string(),
    chamada: textoOpcional,
    itens: z.array(z.string()).min(1),
    idealPara: textoOpcional,
    pagamento: textoOpcional,
    destaque: z.boolean().default(false),
    selo: textoOpcional,
    comparativo: z
      .object({
        fotografos: textoOpcional,
        fotos: textoOpcional,
        preWedding: textoOpcional,
        makingOf: textoOpcional,
        galeria: textoOpcional,
        previas: textoOpcional,
        entrega: textoOpcional,
        poses: textoOpcional,
      })
      .prefault({}),
  }),
});

const comoFunciona = defineCollection({
  loader: file('src/content/comoFunciona.json'),
  schema: z.object({
    titulo: z.string(),
    texto: z.string(),
    detalhe: textoOpcional,
    ordem: z.number(),
  }),
});

const extras = defineCollection({
  loader: file('src/content/extras.json'),
  schema: z.object({
    nome: z.string(),
    preco: z.preprocess((valor) => (valor === '' || valor === null ? undefined : valor), z.number().optional()),
    aPartirDe: z.boolean().default(false),
    unidade: textoOpcional,
    descricao: textoOpcional,
    itens: z.array(z.string()).default([]),
    ordem: z.number(),
  }),
});

const diferenciais = defineCollection({
  loader: file('src/content/diferenciais.json'),
  schema: z.object({
    titulo: z.string(),
    texto: z.string(),
    ordem: z.number(),
  }),
});

const paginas = defineCollection({
  loader: glob({ pattern: 'sobre.md', base: './src/content' }),
  schema: z.object({
    titulo: z.string(),
    subtitulo: textoOpcional,
    resumo: z.string(),
  }),
});

const faq = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/faq' }),
  schema: z.object({
    pergunta: z.string(),
    ordem: z.number(),
    naProposta: z.boolean().default(false),
  }),
});

const depoimentos = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/depoimentos' }),
  schema: z.object({
    casal: z.string(),
    local: textoOpcional,
    data: z.preprocess((valor) => (valor === '' || valor === null ? undefined : valor), z.coerce.date().optional()),
    foto: textoOpcional,
    ordem: z.preprocess((valor) => valor ?? undefined, z.number().default(0)),
  }),
});

const blog = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/blog' }),
  schema: z.object({
    titulo: z.string(),
    descricao: z.string(),
    data: z.coerce.date(),
    capa: textoOpcional,
    capaAlt: textoOpcional,
  }),
});

export const collections = { pacotes, comoFunciona, extras, diferenciais, paginas, faq, depoimentos, blog };
