import { expect, test, type Page } from '@playwright/test';
import { abrir, numeroWhatsApp } from './apoio';

async function capturarWhatsApp(pagina: Page) {
  await pagina.addInitScript(() => {
    const janela = window as unknown as { __enderecosAbertos: string[] };
    janela.__enderecosAbertos = [];
    window.open = ((endereco?: string | URL) => {
      janela.__enderecosAbertos.push(String(endereco ?? ''));
      return { opener: null } as Window;
    }) as typeof window.open;
  });
  await pagina.route(/^https:\/\/(api\.)?wa\.me\//, (rota) => rota.fulfill({ status: 200, contentType: 'text/html', body: '' }));
  return async (): Promise<string[]> => {
    if (new URL(pagina.url()).hostname.endsWith('wa.me')) return [pagina.url()];
    return pagina.evaluate(() => (window as unknown as { __enderecosAbertos: string[] }).__enderecosAbertos);
  };
}

test.describe('Formulário de contato', () => {
  test('gera a mensagem do WhatsApp com os dados do casal', async ({ page }) => {
    const enderecosAbertos = await capturarWhatsApp(page);
    await abrir(page, 'contato/');
    const formulario = page.locator('form').filter({ has: page.locator('#nome') });
    await formulario.locator('#nome').fill('Ana e Pedro');
    await formulario.locator('#data').pressSequentially('15052027');
    await expect(formulario.locator('#data')).toHaveValue('15/05/2027');
    await formulario.locator('#convidados').fill('120');
    await formulario.locator('[type="submit"]').click();

    await expect.poll(enderecosAbertos).toHaveLength(1);
    const [endereco] = await enderecosAbertos();
    const url = new URL(endereco);
    expect(url.hostname).toBe('wa.me');
    expect(url.pathname).toMatch(/^\/\d{10,15}$/);
    expect(url.pathname).toBe(`/${numeroWhatsApp()}`);
    const mensagem = url.searchParams.get('text') ?? '';
    expect(mensagem).toContain('Casal:');
    expect(mensagem).toContain('Ana e Pedro');
    expect(mensagem).toContain('15/05/2027');
  });

  test('data inexistente mostra aviso e não abre o WhatsApp', async ({ page }) => {
    const enderecosAbertos = await capturarWhatsApp(page);
    const dialogos: string[] = [];
    page.on('dialog', (dialogo) => {
      dialogos.push(dialogo.message());
      void dialogo.dismiss();
    });
    await abrir(page, 'contato/');
    const formulario = page.locator('form').filter({ has: page.locator('#nome') });
    await formulario.locator('#nome').fill('Ana e Pedro');
    await formulario.locator('#data').pressSequentially('31022027');
    await formulario.locator('[type="submit"]').click();

    const avisoVisivel = formulario.locator('[role="alert"]:visible');
    await expect.poll(async () => (await avisoVisivel.count()) + dialogos.length).toBeGreaterThan(0);
    await page.waitForTimeout(300);
    expect(await enderecosAbertos()).toEqual([]);
    expect(page.url()).not.toContain('wa.me');
  });
});

test.describe('Lightbox', () => {
  test('abre e fecha a foto ampliada', async ({ page }) => {
    let fotos = 0;
    for (const rota of ['portfolio/', 'proposta/']) {
      await abrir(page, rota);
      fotos = await page.locator('a[data-lightbox]').count();
      if (fotos > 0) break;
    }
    test.skip(fotos === 0, 'Nenhuma foto com ampliação publicada ainda.');

    const primeira = page.locator('a[data-lightbox]').first();
    await primeira.scrollIntoViewIfNeeded();
    await primeira.click();
    const dialogo = page.locator('dialog[open]');
    await expect(dialogo).toBeVisible();
    await expect(dialogo.locator('img').first()).toHaveAttribute('src', /.+/);
    await page.keyboard.press('Escape');
    await expect(page.locator('dialog[open]')).toHaveCount(0);
  });
});

test.describe('Menu do celular', () => {
  test('abre pelo botão e fecha com Esc', async ({ page }, info) => {
    test.skip(info.project.name !== 'celular', 'O menu sanfona só aparece no celular.');
    await abrir(page, '');
    const botao = page.locator('header button[aria-controls]').first();
    await expect(botao).toBeVisible();
    const painel = page.locator(`#${await botao.getAttribute('aria-controls')}`);

    await expect(botao).toHaveAttribute('aria-expanded', 'false');
    await expect(painel).toBeHidden();
    await botao.click();
    await expect(botao).toHaveAttribute('aria-expanded', 'true');
    await expect(painel).toBeVisible();
    await expect(painel.locator('a[href]').first()).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(botao).toHaveAttribute('aria-expanded', 'false');
    await expect(painel).toBeHidden();
  });
});
