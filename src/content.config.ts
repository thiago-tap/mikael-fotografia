import { defineCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { esquemaEtapa, esquemaFoco, esquemaTamanho } from './lib/enquadramento';

const textoOpcional = z
  .string()
  .nullish()
  .transform((valor) => valor ?? undefined);

const limite = (rotulo: string, maximo: number) => z.string().trim().min(1, `${rotulo}: obrigatório`).max(maximo, `${rotulo}: no máximo ${maximo} caracteres`);

const limiteOpcional = (rotulo: string, maximo: number) =>
  z
    .string()
    .max(maximo, `${rotulo}: no máximo ${maximo} caracteres`)
    .nullish()
    .transform((valor) => valor?.trim() || undefined);

const dataOpcional = z.preprocess((valor) => (valor === '' || valor === null ? undefined : valor), z.coerce.date().optional());

const ordem = z.preprocess((valor) => valor ?? undefined, z.number().default(0));

const pacotes = defineCollection({
  loader: file('src/content/pacotes.json'),
  schema: z.object({
    nome: limite('Nome do pacote', 24),
    ordem: z.number(),
    preco: z.number().min(0, 'Preço do pacote não pode ser negativo').max(100000, 'Preço do pacote acima de R$ 100.000'),
    cobertura: limite('Cobertura do pacote', 40),
    chamada: limiteOpcional('Frase de chamada do pacote', 90),
    itens: z
      .array(limite('Item do pacote', 120))
      .min(3, 'Pacote: inclua pelo menos 3 itens')
      .max(14, 'Pacote: no máximo 14 itens'),
    idealPara: limiteOpcional('"Ideal para" do pacote', 160),
    pagamento: limiteOpcional('Forma de pagamento do pacote', 80),
    destaque: z.boolean().default(false),
    selo: limiteOpcional('Selo do pacote', 32),
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
    titulo: limite('Título da etapa', 40),
    texto: limite('Texto da etapa', 220),
    detalhe: limiteOpcional('Detalhe da etapa', 32),
    ordem: z.number(),
  }),
});

const extras = defineCollection({
  loader: file('src/content/extras.json'),
  schema: z.object({
    nome: limite('Nome do extra', 48),
    preco: z.preprocess(
      (valor) => (valor === '' || valor === null ? undefined : valor),
      z.number().min(0, 'Preço do extra não pode ser negativo').max(100000, 'Preço do extra acima de R$ 100.000').optional(),
    ),
    aPartirDe: z.boolean().default(false),
    unidade: limiteOpcional('Unidade do extra', 24),
    descricao: limiteOpcional('Descrição do extra', 200),
    itens: z.array(limite('Item do extra', 120)).default([]),
    ordem: z.number(),
  }),
});

const diferenciais = defineCollection({
  loader: file('src/content/diferenciais.json'),
  schema: z.object({
    titulo: limite('Título do diferencial', 40),
    texto: limite('Texto do diferencial', 180),
    ordem: z.number(),
  }),
});

const paginas = defineCollection({
  loader: glob({ pattern: 'sobre.md', base: './src/content' }),
  schema: z.object({
    titulo: limite('Título da página Sobre', 80),
    subtitulo: limiteOpcional('Subtítulo da página Sobre', 60),
    resumo: limite('Resumo da página Sobre', 400),
  }),
});

const faq = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/faq' }),
  schema: z.object({
    pergunta: limite('Pergunta do FAQ', 120),
    ordem: z.number(),
    naProposta: z.boolean().default(false),
  }),
});

const depoimentos = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/depoimentos' }),
  schema: z.object({
    casal: limite('Casal do depoimento', 60),
    local: limiteOpcional('Local do depoimento', 80),
    data: dataOpcional,
    foto: textoOpcional,
    fotoFoco: esquemaFoco,
    ordem,
  }),
});

const blog = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/blog' }),
  schema: z.object({
    titulo: limite('Título do post', 90),
    descricao: limite('Resumo do post', 200),
    data: z.coerce.date(),
    capa: textoOpcional,
    capaAlt: limiteOpcional('Descrição da capa do post', 160),
    capaFoco: esquemaFoco,
  }),
});

const casamentos = defineCollection({
  loader: glob({
    pattern: ['*.md', '*/index.md'],
    base: './src/content/casamentos',
    generateId: ({ entry }) => entry.replace(/(\/index)?\.md$/, ''),
  }),
  schema: z.object({
    casal: limite('Casal', 60),
    local: limiteOpcional('Local do casamento', 80),
    cidade: limiteOpcional('Cidade do casamento', 60),
    data: dataOpcional,
    capa: z
      .object({
        imagem: textoOpcional,
        alt: limiteOpcional('Descrição da capa', 160),
        foco: esquemaFoco,
      })
      .prefault({}),
    resumo: limite('Resumo do casamento', 220),
    galeria: z
      .array(
        z.object({
          imagem: z.string().trim().min(1, 'Galeria: escolha a foto'),
          alt: limiteOpcional('Descrição da foto', 160),
          legenda: limiteOpcional('Legenda da foto', 80),
          etapa: esquemaEtapa,
          tamanho: esquemaTamanho,
          foco: esquemaFoco,
        }),
      )
      .max(80, 'Galeria: no máximo 80 fotos por casamento')
      .default([]),
    destaque: z.boolean().default(false),
    ordem,
  }),
});

export const collections = { pacotes, comoFunciona, extras, diferenciais, paginas, faq, depoimentos, blog, casamentos };
