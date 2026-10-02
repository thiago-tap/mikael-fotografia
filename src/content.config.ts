import { defineCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';

const pacotes = defineCollection({
  loader: file('src/content/pacotes.json'),
  schema: z.object({
    nome: z.string(),
    ordem: z.number(),
    preco: z.number(),
    cobertura: z.string(),
    chamada: z.string().optional(),
    itens: z.array(z.string()).min(1),
    idealPara: z.string().optional(),
    pagamento: z.string().optional(),
    destaque: z.boolean().default(false),
  }),
});

const extras = defineCollection({
  loader: file('src/content/extras.json'),
  schema: z.object({
    nome: z.string(),
    preco: z.number(),
    aPartirDe: z.boolean().default(false),
    unidade: z.string().optional(),
    descricao: z.string().optional(),
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
    subtitulo: z.string().optional(),
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
  schema: ({ image }) =>
    z.object({
      casal: z.string(),
      local: z.string().optional(),
      data: z.coerce.date().optional(),
      foto: image().optional(),
      ordem: z.number().default(0),
    }),
});

const blog = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/blog' }),
  schema: ({ image }) =>
    z.object({
      titulo: z.string(),
      descricao: z.string(),
      data: z.coerce.date(),
      capa: image().optional(),
      capaAlt: z.string().optional(),
    }),
});

export const collections = { pacotes, extras, diferenciais, paginas, faq, depoimentos, blog };
