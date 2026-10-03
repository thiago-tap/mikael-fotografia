import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import type { Page } from '@playwright/test';

export const raiz = resolve(import.meta.dirname, '..');
export const dist = join(raiz, 'dist');

export const paginasPrincipais = ['', 'proposta/', 'portfolio/', 'sobre/', 'faq/', 'contato/', 'privacidade/'];

export const base = (() => {
  const limpo = (process.env.BASE_PATH ?? '/').trim().replace(/^\/+|\/+$/g, '');
  return limpo ? `/${limpo}/` : '/';
})();

export function nomeDaRota(rota: string): string {
  return rota ? `/${rota}` : '/';
}

export function numeroWhatsApp(): string {
  const arquivo = join(raiz, 'src', 'content', 'configuracoes.json');
  const configuracoes = JSON.parse(readFileSync(arquivo, 'utf8')) as { whatsapp?: { numero?: unknown } };
  return String(configuracoes.whatsapp?.numero ?? '').replace(/\D/g, '');
}

export function caminhoNoDist(caminhoUrl: string): string {
  const relativo = caminhoUrl.startsWith(base) ? caminhoUrl.slice(base.length) : caminhoUrl.replace(/^\//, '');
  return join(dist, decodeURIComponent(relativo));
}

export function existeNoDist(caminhoUrl: string): boolean {
  return existsSync(caminhoNoDist(caminhoUrl));
}

export async function abrir(pagina: Page, rota: string) {
  const resposta = await pagina.goto(rota, { waitUntil: 'load' });
  if (!resposta) throw new Error(`Sem resposta para ${nomeDaRota(rota)}`);
  return resposta;
}

export async function linksDaNavegacao(pagina: Page): Promise<string[]> {
  return pagina.evaluate(() => {
    const links = [...document.querySelectorAll<HTMLAnchorElement>('header a[href], footer a[href]')];
    return [
      ...new Set(
        links
          .map((link) => new URL(link.href, location.href))
          .filter((url) => url.origin === location.origin)
          .map((url) => url.pathname),
      ),
    ];
  });
}

export async function recursosDaPagina(pagina: Page): Promise<string[]> {
  return pagina.evaluate(() => {
    const enderecos = new Set<string>();
    const adicionar = (valor: string | null | undefined) => {
      if (!valor) return;
      try {
        const url = new URL(valor, location.href);
        if (url.origin !== location.origin) return;
        url.hash = '';
        enderecos.add(url.href);
      } catch {}
    };
    const adicionarSrcset = (valor: string | null) =>
      valor?.split(',').forEach((parte) => adicionar(parte.trim().split(/\s+/)[0]));

    document.querySelectorAll<HTMLAnchorElement>('a[href]').forEach((link) => adicionar(link.getAttribute('href')));
    document.querySelectorAll('link[href]').forEach((link) => adicionar(link.getAttribute('href')));
    document.querySelectorAll('script[src]').forEach((script) => adicionar(script.getAttribute('src')));
    document.querySelectorAll('img').forEach((imagem) => {
      adicionar(imagem.getAttribute('src'));
      adicionarSrcset(imagem.getAttribute('srcset'));
    });
    document.querySelectorAll('source[srcset]').forEach((fonte) => adicionarSrcset(fonte.getAttribute('srcset')));
    return [...enderecos];
  });
}
