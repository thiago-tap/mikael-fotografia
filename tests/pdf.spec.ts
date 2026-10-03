import { existsSync, readFileSync, statSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import { abrir, caminhoNoDist } from './apoio';

test.describe('PDF da proposta', () => {
  test('o PDF linkado no site foi gerado e é válido', async ({ page }, info) => {
    test.skip(info.project.name !== 'computador', 'O arquivo é o mesmo nos dois tamanhos de tela.');
    await abrir(page, 'contato/');
    const link = page.locator('a[href$=".pdf"]').first();
    await expect(link, 'link para baixar o PDF').toHaveCount(1);
    const caminho = new URL((await link.getAttribute('href')) ?? '', page.url()).pathname;
    const arquivo = caminhoNoDist(caminho);

    expect(existsSync(arquivo), `${arquivo} não existe. Gere com: node scripts/gerar-pdf.mjs --sem-build --saida dist/...`).toBe(true);
    expect(statSync(arquivo).size, 'PDF muito pequeno').toBeGreaterThan(50 * 1024);
    const conteudo = readFileSync(arquivo);
    expect(conteudo.subarray(0, 5).toString('latin1')).toBe('%PDF-');
    const paginas = conteudo.toString('latin1').match(/\/Type\s*\/Page(?!s)/g)?.length ?? 0;
    expect(paginas, 'quantidade de páginas do PDF').toBeGreaterThanOrEqual(8);
  });
});
