// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// No GitHub Pages o workflow preenche SITE_URL e BASE_PATH (ex.: "/mikael-fotografia").
// Com domínio próprio, BASE_PATH fica vazio e o site é servido na raiz.
export default defineConfig({
  site: process.env.SITE_URL || 'http://localhost:4321',
  base: process.env.BASE_PATH || '/',
  integrations: [sitemap({ filter: (pagina) => !pagina.includes('/proposta-pdf') })],
  vite: {
    plugins: [tailwindcss()],
  },
});
