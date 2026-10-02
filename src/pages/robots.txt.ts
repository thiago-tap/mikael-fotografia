import type { APIRoute } from 'astro';
import { rota } from '../lib/site';

export const GET: APIRoute = ({ site }) => {
  const mapa = new URL(rota('/sitemap-index.xml'), site);
  const corpo = ['User-agent: *', 'Allow: /', `Disallow: ${rota('/proposta-pdf/')}`, '', `Sitemap: ${mapa}`, ''].join('\n');
  return new Response(corpo, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
