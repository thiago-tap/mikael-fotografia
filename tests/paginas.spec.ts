import { expect, test } from '@playwright/test';
import { abrir, linksDaNavegacao, nomeDaRota, paginasPrincipais, recursosDaPagina } from './apoio';

test.describe('Páginas principais', () => {
  for (const rota of paginasPrincipais) {
    test(`${nomeDaRota(rota)} responde 200 e tem título H1`, async ({ page }) => {
      const resposta = await abrir(page, rota);
      expect(resposta.status()).toBe(200);
      const titulo = page.locator('h1').first();
      await expect(titulo).toBeVisible();
      await expect(titulo).not.toHaveText(/^\s*$/);
    });
  }

  test('endereço inexistente mostra a página 404', async ({ page }) => {
    const resposta = await abrir(page, 'pagina-que-nao-existe-123/');
    expect(resposta.status()).toBe(404);
    await expect(page.locator('h1').first()).toBeVisible();
    await expect(page.locator('header a[href]').first()).toBeVisible();
  });

  test('páginas do menu e do rodapé abrem com H1', async ({ page }) => {
    await abrir(page, '');
    const caminhos = await linksDaNavegacao(page);
    expect(caminhos.length).toBeGreaterThan(0);
    for (const caminho of caminhos.filter((item) => item.endsWith('/'))) {
      const resposta = await page.goto(caminho);
      expect(resposta?.status(), caminho).toBe(200);
      await expect(page.locator('h1').first(), caminho).toBeVisible();
    }
  });
});

test.describe('Links internos', () => {
  test('todos os links e recursos internos respondem sem erro', async ({ page, request }, info) => {
    test.skip(info.project.name !== 'computador', 'Os links são os mesmos nos dois tamanhos de tela.');
    test.setTimeout(120_000);

    await abrir(page, '');
    const paginas = new Set([...paginasPrincipais.map((rota) => new URL(rota, page.url()).pathname), ...(await linksDaNavegacao(page))]);
    const enderecos = new Map<string, string>();

    for (const caminho of paginas) {
      if (!caminho.endsWith('/')) continue;
      await page.goto(caminho);
      for (const endereco of await recursosDaPagina(page)) {
        if (!enderecos.has(endereco)) enderecos.set(endereco, caminho);
      }
    }

    const lista = [...enderecos.entries()];
    const quebrados: string[] = [];
    const simultaneos = 8;
    for (let inicio = 0; inicio < lista.length; inicio += simultaneos) {
      await Promise.all(
        lista.slice(inicio, inicio + simultaneos).map(async ([endereco, origem]) => {
          const resposta = await request.get(endereco, { failOnStatusCode: false });
          if (resposta.status() >= 400) quebrados.push(`${resposta.status()} ${new URL(endereco).pathname} (em ${origem})`);
        }),
      );
    }

    expect(lista.length).toBeGreaterThan(10);
    expect(quebrados, `Links quebrados:\n${quebrados.join('\n')}`).toEqual([]);
  });
});

test.describe('Layout', () => {
  for (const rota of paginasPrincipais) {
    test(`${nomeDaRota(rota)} não tem rolagem horizontal`, async ({ page }) => {
      await abrir(page, rota);
      await page.evaluate(() => document.fonts.ready);
      const largura = page.viewportSize()?.width ?? 0;
      const conteudo = await page.evaluate(() => Math.max(document.documentElement.scrollWidth, document.body.scrollWidth));
      expect(conteudo, `largura do conteúdo em tela de ${largura}px`).toBeLessThanOrEqual(largura + 1);
    });
  }
});

test.describe('Dados estruturados', () => {
  for (const rota of ['', 'faq/', 'proposta/']) {
    test(`${nomeDaRota(rota)} tem JSON-LD válido`, async ({ page }) => {
      await abrir(page, rota);
      const blocos = await page.locator('script[type="application/ld+json"]').allTextContents();
      expect(blocos.length).toBeGreaterThan(0);
      for (const bloco of blocos) {
        const dados = JSON.parse(bloco);
        const itens = Array.isArray(dados) ? dados : [dados];
        for (const item of itens) {
          expect(item['@context'], 'JSON-LD sem @context').toBeTruthy();
          expect(item['@type'] || item['@graph'], 'JSON-LD sem @type').toBeTruthy();
        }
      }
    });
  }
});
