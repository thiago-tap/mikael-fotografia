import { defineConfig, devices } from '@playwright/test';

const porta = Number(process.env.PORTA ?? 4322);
const base = (process.env.BASE_PATH ?? '/').trim().replace(/^\/+|\/+$/g, '');
const emIntegracao = Boolean(process.env.CI);

export default defineConfig({
  testDir: 'tests',
  fullyParallel: true,
  forbidOnly: emIntegracao,
  retries: emIntegracao ? 1 : 0,
  workers: emIntegracao ? 2 : undefined,
  timeout: 45_000,
  reporter: emIntegracao
    ? [['list'], ['html', { open: 'never', outputFolder: 'relatorio-testes' }], ['json', { outputFile: 'relatorio-testes/resultado.json' }]]
    : [['list'], ['html', { open: 'never', outputFolder: 'relatorio-testes' }]],
  outputDir: 'resultados-testes',
  use: {
    baseURL: `http://127.0.0.1:${porta}/${base ? `${base}/` : ''}`,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    locale: 'pt-BR',
  },
  projects: [
    {
      name: 'celular',
      use: { ...devices['Desktop Chrome'], viewport: { width: 375, height: 667 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
    },
    {
      name: 'computador',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
  ],
  webServer: {
    command: 'node scripts/servir-dist.mjs',
    url: `http://127.0.0.1:${porta}/${base ? `${base}/` : ''}`,
    reuseExistingServer: !emIntegracao,
    env: { PORTA: String(porta), BASE_PATH: process.env.BASE_PATH ?? '/' },
  },
});
