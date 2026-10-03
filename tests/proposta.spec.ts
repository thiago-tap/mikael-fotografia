import { expect, test } from '@playwright/test';
import { abrir, numeroWhatsApp } from './apoio';

test.describe('Proposta', () => {
  test('cada pacote tem nome, itens, preço depois dos itens e botão do WhatsApp com o nome do pacote', async ({ page }) => {
    await abrir(page, 'proposta/');
    const cartoes = page.locator('#pacotes article');
    const total = await cartoes.count();
    expect(total, 'nenhum pacote encontrado em #pacotes').toBeGreaterThan(0);

    for (let indice = 0; indice < total; indice++) {
      const analise = await cartoes.nth(indice).evaluate((cartao) => {
        const nome = cartao.querySelector('h2, h3')?.textContent?.trim() ?? '';
        const lista = cartao.querySelector('ul');
        const itens = lista ? [...lista.querySelectorAll('li')].filter((item) => item.textContent?.trim()) : [];
        const primeiroItem = itens[0];
        const ultimoItem = itens[itens.length - 1];
        const precos = [...cartao.querySelectorAll('*')].filter(
          (elemento) => elemento.children.length === 0 && /R\$\s*\d/.test(elemento.textContent ?? ''),
        );
        const depois = (a: Node, b: Node) => Boolean(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);
        const whatsapp = [...cartao.querySelectorAll<HTMLAnchorElement>('a[href*="wa.me"]')].map((link) => ({
          texto: link.textContent?.replace(/\s+/g, ' ').trim() ?? '',
          mensagem: new URL(link.href).searchParams.get('text') ?? '',
          caminho: new URL(link.href).pathname,
        }));
        return {
          nome,
          itens: itens.length,
          precos: precos.length,
          precoDepoisDosItens: Boolean(ultimoItem) && precos.length > 0 && precos.every((preco) => depois(ultimoItem, preco)),
          precoAntesDosItens: Boolean(primeiroItem) && precos.some((preco) => depois(preco, primeiroItem)),
          whatsapp,
        };
      });

      const rotulo = `pacote ${indice + 1} (${analise.nome || 'sem nome'})`;
      expect(analise.nome, `${rotulo}: sem nome`).not.toBe('');
      expect(analise.itens, `${rotulo}: menos de 3 itens`).toBeGreaterThanOrEqual(3);
      expect(analise.precos, `${rotulo}: sem preço`).toBeGreaterThan(0);
      expect(analise.precoAntesDosItens, `${rotulo}: preço aparece antes dos itens`).toBe(false);
      expect(analise.precoDepoisDosItens, `${rotulo}: preço precisa vir depois dos itens`).toBe(true);
      expect(analise.whatsapp.length, `${rotulo}: sem botão do WhatsApp`).toBeGreaterThan(0);
      const botao = analise.whatsapp.find((link) => link.mensagem.toLowerCase().includes(analise.nome.toLowerCase()));
      expect(botao, `${rotulo}: mensagem do WhatsApp não cita o pacote`).toBeTruthy();
      expect(botao?.caminho).toMatch(/^\/\d{10,15}$/);
      expect(botao?.caminho).toBe(`/${numeroWhatsApp()}`);
      expect(botao?.texto, `${rotulo}: botão sem texto`).not.toBe('');
    }
  });

  test('a vitrine da página inicial mostra benefícios, sem preços', async ({ page }) => {
    await abrir(page, '');
    const textos = await page.locator('main a[href*="proposta/#"]').evaluateAll((links) =>
      [...new Set(links.map((link) => link.closest('li, article') ?? link.parentElement))]
        .filter((cartao): cartao is Element => Boolean(cartao))
        .map((cartao) => cartao.textContent?.replace(/\s+/g, ' ').trim() ?? ''),
    );
    test.skip(textos.length === 0, 'A página inicial não tem vitrine de pacotes.');
    for (const texto of textos) expect(texto, 'a vitrine da página inicial não deve mostrar preço').not.toMatch(/R\$/);
  });
});
