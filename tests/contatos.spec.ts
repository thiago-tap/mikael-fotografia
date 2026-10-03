import { expect, test } from '@playwright/test';
import { abrir, nomeDaRota, numeroWhatsApp, paginasPrincipais } from './apoio';

const numero = numeroWhatsApp();

test.describe('Links de contato', () => {
  test('o número do WhatsApp está configurado', () => {
    expect(numero, 'whatsapp.numero em src/content/configuracoes.json').toMatch(/^\d{10,15}$/);
  });

  for (const rota of paginasPrincipais) {
    test(`${nomeDaRota(rota)}: links do WhatsApp usam o número configurado e têm mensagem`, async ({ page }) => {
      await abrir(page, rota);
      const enderecos = await page.locator('a[href*="wa.me"]').evaluateAll((links) => links.map((link) => link.getAttribute('href') ?? ''));
      expect(enderecos.length).toBeGreaterThan(0);
      for (const endereco of enderecos) {
        const url = new URL(endereco);
        expect(url.hostname, endereco).toBe('wa.me');
        expect(url.pathname, `${endereco} sem número válido`).toMatch(/^\/\d{10,15}$/);
        expect(url.pathname, endereco).toBe(`/${numero}`);
        expect(url.searchParams.get('text')?.trim(), `mensagem vazia em ${endereco}`).toBeTruthy();
        expect(endereco, 'mensagem precisa estar codificada').not.toMatch(/\s/);
      }
    });

    test(`${nomeDaRota(rota)}: links do Instagram apontam para instagram.com`, async ({ page }) => {
      await abrir(page, rota);
      const enderecos = await page
        .locator('a[href*="instagram" i], a[data-evento="clique_instagram"]')
        .evaluateAll((links) => links.map((link) => link.getAttribute('href') ?? ''));
      for (const endereco of enderecos) {
        const url = new URL(endereco);
        expect(url.protocol, endereco).toBe('https:');
        expect(url.hostname, endereco).toMatch(/(^|\.)instagram\.com$/);
      }
    });
  }
});
