import { z } from 'astro/zod';
import agendaJson from '../content/agenda.json';

const esquemaAgenda = z.object({
  ativo: z.boolean().default(false),
  texto: z.string().default(''),
});

export const agenda = esquemaAgenda.parse(agendaJson);

export const agendaVisivel = agenda.ativo && agenda.texto.trim().length > 0;
