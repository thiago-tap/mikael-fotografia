import { z } from 'astro/zod';
import agendaJson from '../content/agenda.json';
import configuracoesJson from '../content/configuracoes.json';
import instagramJson from '../content/instagram.json';
import { esquemaFoco } from './enquadramento';

export const meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'] as const;

export type Mes = (typeof meses)[number];

export const situacoes = ['disponivel', 'poucas-datas', 'esgotado', 'sem-info'] as const;

export type Situacao = (typeof situacoes)[number];

const esquemaSituacao = z.preprocess((valor) => (valor === '' || valor === null ? undefined : valor), z.enum(situacoes).default('sem-info'));

const esquemaAno = z.object({
  ano: z.number().int().min(2024, 'Agenda: ano a partir de 2024').max(2100, 'Agenda: ano até 2100'),
  ...Object.fromEntries(meses.map((mes) => [mes, esquemaSituacao])),
}) as unknown as z.ZodType<{ ano: number } & Record<Mes, Situacao>>;

const esquemaAgenda = z.object({
  ativo: z.boolean().default(false),
  texto: z.string().max(140, 'Texto da faixa de agenda: no máximo 140 caracteres').default(''),
  anos: z.array(esquemaAno).max(4, 'Agenda: no máximo 4 anos').default([]),
});

const textoOpcional = z
  .string()
  .nullish()
  .transform((valor) => valor?.trim() ?? '');

const esquemaConfiguracoes = z.object({
  logo: textoOpcional,
  logoClaro: textoOpcional,
  icone: textoOpcional,
  whatsapp: z.object({
    numero: z
      .string()
      .transform((valor) => valor.replace(/\D/g, ''))
      .pipe(z.string().regex(/^55\d{10,11}$/, 'WhatsApp: use só números, começando com 55 e o DDD (ex.: 5561982042153)')),
    exibicao: z.string().trim().min(1, 'WhatsApp: informe o número como aparece no site').max(24, 'WhatsApp: número de exibição com mais de 24 caracteres'),
    mensagem: z.string().trim().min(1, 'WhatsApp: informe a mensagem padrão').max(300, 'WhatsApp: mensagem padrão com mais de 300 caracteres'),
  }),
  instagram: z.object({
    usuario: z
      .string()
      .transform((valor) => valor.trim().replace(/^@/, ''))
      .pipe(z.string().regex(/^[A-Za-z0-9._]{1,30}$/, 'Instagram: usuário sem @, só letras, números, ponto e sublinhado')),
    url: z.url('Instagram: endereço do perfil inválido (comece com https://)').refine((valor) => valor.startsWith('https://'), 'Instagram: o endereço deve começar com https://'),
  }),
  analytics: z
    .object({
      gaId: textoOpcional.refine((valor) => /^(G-[A-Z0-9]+)?$/.test(valor), 'Google Analytics: o ID começa com G- (ex.: G-AB12CD34EF)'),
      gtmId: textoOpcional.refine((valor) => /^(GTM-[A-Z0-9]+)?$/.test(valor), 'Tag Manager: o ID começa com GTM- (ex.: GTM-AB12CD3)'),
    })
    .default({ gaId: '', gtmId: '' }),
  fotos: z.record(z.string(), textoOpcional).default({}),
  focos: z.record(z.string(), esquemaFoco).default({}),
});

const esquemaInstagram = z
  .array(
    z.object({
      imagem: textoOpcional,
      link: textoOpcional.refine((valor) => valor === '' || /^https:\/\//.test(valor), 'Instagram: o link do post deve começar com https://'),
      alt: textoOpcional,
    }),
  )
  .max(6, 'Instagram: no máximo 6 fotos')
  .default([]);

export const agenda = esquemaAgenda.parse(agendaJson);

export const agendaVisivel = agenda.ativo && agenda.texto.trim().length > 0;

export const agendaComInformacao = agenda.anos.some((ano) => meses.some((mes) => ano[mes] !== 'sem-info'));

export const configuracoes = esquemaConfiguracoes.parse(configuracoesJson);

export const postsDoInstagram = esquemaInstagram
  .parse(instagramJson)
  .filter((post) => post.imagem.length > 0)
  .slice(0, 6);
