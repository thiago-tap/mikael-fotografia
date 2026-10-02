import type { APIRoute } from 'astro';
import { icone } from '../lib/marca';
import { rota, site } from '../lib/site';

export const GET: APIRoute = () => {
  const icones = icone
    ? [192, 512].map((lado) => ({ src: rota(`/icones/icone-${lado}.png`), sizes: `${lado}x${lado}`, type: 'image/png' }))
    : [{ src: rota('/favicon.svg'), sizes: 'any', type: 'image/svg+xml' }];
  const manifesto = {
    name: site.nome,
    short_name: site.nome,
    description: site.descricao,
    lang: 'pt-BR',
    start_url: rota('/'),
    scope: rota('/'),
    display: 'browser',
    background_color: '#faf8f5',
    theme_color: '#faf8f5',
    icons: icones,
  };
  return new Response(JSON.stringify(manifesto, null, 2), {
    headers: { 'Content-Type': 'application/manifest+json; charset=utf-8' },
  });
};
