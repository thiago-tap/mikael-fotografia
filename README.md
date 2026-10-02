# Mikael Fotografia

Site de fotografia de casamento do Mikael Vitor, feito com [Astro](https://astro.build) e Tailwind CSS e publicado no GitHub Pages.

## Rodar localmente

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # verifica tipos e gera dist/
```

## Publicação

Cada push na branch `main` roda `.github/workflows/deploy.yml` e publica o site. No repositório, em **Settings → Pages**, a origem deve estar como **GitHub Actions**. O endereço e o caminho base são preenchidos pelo próprio workflow, então o site funciona em `https://<usuario>.github.io/<repo>/` e também com domínio próprio.

## Onde editar o conteúdo

| O quê | Arquivo |
| --- | --- |
| Pacotes e preços | `src/content/pacotes.json` |
| Valores adicionais | `src/content/extras.json` |
| "Por que Mikael Fotografia?" | `src/content/diferenciais.json` |
| Texto da página Sobre | `src/content/sobre.md` |
| Perguntas frequentes | `src/content/faq/*.md` (`naProposta: true` mostra a pergunta na proposta) |
| Depoimentos | `src/content/depoimentos/*.md` |
| Posts do blog | `src/content/blog/*.md` |
| WhatsApp, Instagram e menu | `src/lib/site.ts` |

Exemplo de depoimento (`src/content/depoimentos/ana-e-pedro.md`):

```md
---
casal: Ana e Pedro
local: Brasília
ordem: 1
foto: ./ana-e-pedro.jpg   # opcional, na mesma pasta
---

Texto do depoimento.
```

Exemplo de post (`src/content/blog/casamento-ana-e-pedro.md`):

```md
---
titulo: Casamento de Ana e Pedro
descricao: Uma cerimônia ao pôr do sol.
data: 2026-10-02
capa: ./casamento-ana-e-pedro.jpg   # opcional
capaAlt: Ana e Pedro na saída da cerimônia
---

Texto do post.
```

## Fotos

JPG editado, cor sRGB, de 1 a 4 MB por arquivo. O site gera as versões menores sozinho. Enquanto a foto não existe, a página mostra um espaço tracejado com o nome do arquivo esperado e a medida.

Fotos fixas vão em `src/assets/fotos/`, com exatamente estes nomes (extensão `.jpg`, `.png` ou `.webp`):

| Arquivo | Onde aparece | Proporção | Mínimo |
| --- | --- | --- | --- |
| `home-hero` | Topo da página inicial | 3:2 horizontal | 3000 × 2000 px |
| `proposta-hero` | Topo da proposta | 3:2 horizontal | 3000 × 2000 px |
| `faixa` | Faixa larga entre extras e diferenciais | 3:2 horizontal | 3000 × 2000 px |
| `sobre-retrato` | Página Sobre e apresentação na proposta | 4:5 vertical | 1600 × 2000 px |
| `pacote-micro-wedding` | Pacote Micro Wedding | 3:2 horizontal | 2400 × 1600 px |
| `pacote-mini-wedding` | Pacote Mini Wedding | 3:2 horizontal | 2400 × 1600 px |
| `pacote-promessa` | Pacote Promessa | 3:2 horizontal | 2400 × 1600 px |
| `pacote-eternidade` | Pacote Eternidade | 3:2 horizontal | 2400 × 1600 px |

As fotos do topo são cortadas nas laterais e em cima/embaixo conforme a tela. Mantenha o casal no centro.

**Portfólio:** coloque as fotos em `src/content/portfolio/` (24 a 40 para começar, misturando 3:2 de 2400 × 1600 e 4:5 de 1600 × 2000). A ordem segue o nome do arquivo (`01.jpg`, `02.jpg`…). Texto alternativo e legenda são opcionais, em `src/content/portfolio/legendas.json`:

```json
{
  "01": { "alt": "Noiva entrando na cerimônia ao pôr do sol", "legenda": "Ana e Pedro" }
}
```

**Marca:** logo horizontal em `src/assets/marca/logo.png` (ou `.svg`/`.webp`), fundo transparente, largura mínima de 1200 px. Sem o arquivo, o cabeçalho usa o nome em texto. O ícone da aba fica em `public/favicon.svg`.
