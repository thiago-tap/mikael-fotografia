import { z } from 'astro/zod';
import agendaJson from '../content/agenda.json';
import configuracoesJson from '../content/configuracoes.json';
import instagramJson from '../content/instagram.json';

const esquemaAgenda = z.object({
  ativo: z.boolean().default(false),
  texto: z.string().default(''),
});

const textoOpcional = z
  .string()
  .nullish()
  .transform((valor) => valor?.trim() ?? '');

const esquemaConfiguracoes = z.object({
  whatsapp: z.object({
    numero: z.string().transform((valor) => valor.replace(/\D/g, '')),
    exibicao: z.string(),
    mensagem: z.string(),
  }),
  instagram: z.object({
    usuario: z.string().transform((valor) => valor.trim().replace(/^@/, '')),
    url: z.url(),
  }),
  analytics: z
    .object({
      gaId: textoOpcional,
      gtmId: textoOpcional,
    })
    .default({ gaId: '', gtmId: '' }),
  fotos: z.record(z.string(), textoOpcional).default({}),
});

const esquemaInstagram = z
  .array(
    z.object({
      imagem: textoOpcional,
      link: textoOpcional,
      alt: textoOpcional,
    }),
  )
  .default([]);

export const agenda = esquemaAgenda.parse(agendaJson);

export const agendaVisivel = agenda.ativo && agenda.texto.trim().length > 0;

export const configuracoes = esquemaConfiguracoes.parse(configuracoesJson);

export const postsDoInstagram = esquemaInstagram
  .parse(instagramJson)
  .filter((post) => post.imagem.length > 0)
  .slice(0, 6);
