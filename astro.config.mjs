// @ts-check
import { readFileSync } from 'node:fs';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

const agenda = JSON.parse(readFileSync(new URL('./src/content/agenda.json', import.meta.url), 'utf8'));
const agendaComInformacao = (agenda.anos ?? []).some((/** @type {Record<string, unknown>} */ ano) =>
  Object.entries(ano).some(([chave, valor]) => chave !== 'ano' && valor && valor !== 'sem-info'),
);
const foraDoSitemap = ['/proposta-pdf', '/tipografia', ...(agendaComInformacao ? [] : ['/agenda'])];

// No GitHub Pages o workflow preenche SITE_URL e BASE_PATH (ex.: "/mikael-fotografia").
// Com domínio próprio, BASE_PATH fica vazio e o site é servido na raiz.
export default defineConfig({
  site: process.env.SITE_URL || 'http://localhost:4321',
  base: process.env.BASE_PATH || '/',
  integrations: [sitemap({ filter: (pagina) => !foraDoSitemap.some((caminho) => pagina.includes(caminho)) })],
  vite: {
    plugins: [tailwindcss()],
  },
});
