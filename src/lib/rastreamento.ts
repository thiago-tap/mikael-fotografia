export type Consentimento = 'aceito' | 'recusado';

type Parametros = Record<string, string | number | boolean>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...argumentos: unknown[]) => void;
  }
}

const chave = 'mikael-consentimento';

export function consentimentoSalvo(): Consentimento | null {
  try {
    const valor = localStorage.getItem(chave);
    return valor === 'aceito' || valor === 'recusado' ? valor : null;
  } catch {
    return null;
  }
}

export function salvarConsentimento(valor: Consentimento | null): void {
  try {
    if (valor) localStorage.setItem(chave, valor);
    else localStorage.removeItem(chave);
  } catch {
    return;
  }
}

function configuracao(): { gaId: string; gtmId: string } | null {
  const elemento = document.querySelector<HTMLElement>('[data-consentimento]');
  if (!elemento) return null;
  return { gaId: elemento.dataset.ga ?? '', gtmId: elemento.dataset.gtm ?? '' };
}

export function rastrear(nome: string, parametros: Parametros = {}): void {
  const ids = configuracao();
  if (!ids || consentimentoSalvo() !== 'aceito') return;
  if (ids.gtmId) window.dataLayer?.push({ event: nome, ...parametros });
  if (ids.gaId) window.gtag?.('event', nome, parametros);
}
