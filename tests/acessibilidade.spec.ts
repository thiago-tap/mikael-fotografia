import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { abrir, nomeDaRota } from './apoio';

test.describe('Acessibilidade', () => {
  for (const rota of ['', 'proposta/', 'contato/']) {
    test(`${nomeDaRota(rota)} não tem problemas graves de acessibilidade`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await abrir(page, rota);
      await page.evaluate(() => document.fonts.ready);
      const resultado = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
      const graves = resultado.violations
        .filter((violacao) => violacao.impact === 'serious' || violacao.impact === 'critical')
        .map((violacao) => `${violacao.impact}: ${violacao.id} — ${violacao.help} (${violacao.nodes.map((no) => no.target.join(' ')).slice(0, 5).join(', ')})`);
      expect(graves, graves.join('\n')).toEqual([]);
    });
  }
});
