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

## PDF da proposta

```bash
npm run pdf                # gera o site e cria proposta/Proposta-Mikael-Fotografia.pdf
npm run pdf -- --sem-build # reaproveita o dist/ já gerado
```

O PDF sai da página `/proposta-pdf/` (fora do menu, do sitemap e com `noindex`), no mesmo formato da proposta original do Canva: páginas verticais de 810 × 1440 pt. São 9 páginas: capa, apresentação com índice, uma página por pacote, valores adicionais, "Por que Mikael Fotografia?" e perguntas frequentes com contato. Preços, itens, extras e textos vêm dos mesmos arquivos do site, então basta editar o conteúdo e rodar de novo.

No PDF dá para clicar no índice (leva à página de cada pacote), em "Índice" no rodapé de cada página, em "Quero este pacote" (abre o WhatsApp com a mensagem do pacote), no WhatsApp, no Instagram e no endereço do site.

**Depois de receber as fotos do Mikael:** coloque os arquivos em `src/assets/fotos/` com os nomes da tabela de [Fotos](#fotos) (os `pacote-*`, `sobre-retrato` e, se quiser fotos próprias no PDF, `pdf-capa`, `pdf-extras` e `pdf-diferenciais`) e rode `npm run pdf`. Enquanto a foto não existe, o PDF mostra um bloco bege com o nome do arquivo esperado.

O script usa o Edge ou o Chrome instalado no computador. Se nenhum for encontrado, rode `npx playwright install chromium` uma vez. Se algum texto passar do tamanho da página, o script avisa qual página estourou. A pasta `proposta/` não vai para o repositório.

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
| `pdf-capa` | Capa do PDF da proposta (sem ela, usa `proposta-hero`) | 9:16 vertical | 1800 × 3200 px |
| `pdf-extras` | Página de valores adicionais do PDF (sem ela, usa `faixa`) | 3:2 horizontal | 2400 × 1600 px |
| `pdf-diferenciais` | Página "Por que Mikael Fotografia?" do PDF (sem ela, usa `sobre-retrato`) | 2:3 vertical | 1600 × 2400 px |

As fotos do topo (`home-hero` e `proposta-hero`) usam o mesmo arquivo em todas as telas, cortado a partir do centro: no celular aparecem em formato vertical (4:5), mostrando só a faixa central, cerca de metade da largura; no tablet ficam em 2:1 e no computador em 12:5, cortando um pouco em cima e embaixo. Escolha fotos com o casal no centro e com folga ao redor. A `faixa` fica 3:2 no celular e 12:5 a partir do tablet.

**Ampliar fotos:** no portfólio e na capa dos posts, clicar na foto abre a versão grande (até 2400 px) em tela cheia, com setas, teclado e deslizar no celular.

**Portfólio:** coloque as fotos em `src/content/portfolio/` (24 a 40 para começar, misturando 3:2 de 2400 × 1600 e 4:5 de 1600 × 2000). A ordem segue o nome do arquivo (`01.jpg`, `02.jpg`…). Texto alternativo e legenda são opcionais, em `src/content/portfolio/legendas.json`:

```json
{
  "01": { "alt": "Noiva entrando na cerimônia ao pôr do sol", "legenda": "Ana e Pedro" }
}
```

**Marca:** logo horizontal em `src/assets/marca/logo.png` (ou `.svg`/`.webp`), fundo transparente, largura mínima de 1200 px. Sem o arquivo, o cabeçalho usa o nome em texto. O ícone da aba fica em `public/favicon.svg`.
