# Mikael Fotografia

Site de fotografia de casamento do Mikael Vitor, feito com [Astro](https://astro.build) e Tailwind CSS e publicado no GitHub Pages.

## Rodar localmente

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # verifica tipos e gera dist/
```

## Publicação

Cada push na branch `main` roda `.github/workflows/deploy.yml`: gera o site, gera o PDF da proposta e publica tudo. No repositório, em **Settings → Pages**, a origem deve estar como **GitHub Actions**. O endereço e o caminho base são preenchidos pelo próprio workflow, então o site funciona em `https://<usuario>.github.io/<repo>/` e também com domínio próprio.

Cada alteração salva no painel é um commit na `main`, então o site se atualiza sozinho em 2 a 3 minutos.

## Painel de edição (Pages CMS)

O conteúdo é editado pelo [Pages CMS](https://pagescms.org), configurado em `.pages.yml`. Não é preciso instalar nada.

**Primeiro acesso (uma vez só, feito por quem administra o repositório):**

1. Entre em [app.pagescms.org](https://app.pagescms.org) com a conta do GitHub e instale o app do Pages CMS no repositório `mikael-fotografia`.
2. Em **Settings → Collaborators** do painel, convide o Mikael pelo e-mail. Ele entra pelo link recebido, sem precisar de conta no GitHub.

**No dia a dia, para o Mikael:**

1. Abra [app.pagescms.org](https://app.pagescms.org) e escolha o site **mikael-fotografia**.
2. No menu da esquerda, escolha o que quer mudar:
   - **Configurações:** WhatsApp, Instagram, IDs do Google Analytics e a foto de cada espaço fixo do site (topo da página inicial, pacotes, retrato etc.).
   - **Faixa de agenda:** liga ou desliga a faixa "Agenda 2026 · 2027" com o texto que quiser.
   - **Proposta:** pacotes (preço, itens, tabela de comparação), serviços extras, "Por que Mikael Fotografia?" e "Como funciona".
   - **Perguntas frequentes, Depoimentos e Blog:** cada item é uma página; use **Add an entry** para criar.
   - **Página Sobre**, **Portfólio** (ordem e legendas) e **Instagram** (até 6 fotos).
3. Edite e clique em **Save**. O site publica a mudança sozinho em poucos minutos, e o PDF da proposta é atualizado junto.

**Fotos:** em qualquer campo de foto, clique para enviar do computador ou escolher uma que já está no painel. Use JPG editado, em sRGB, de 1 a 4 MB. Na aba **Media** ficam as pastas: *Fotos do site*, *Portfólio*, *Instagram*, *Depoimentos* e *Blog*.

**Portfólio:** envie as fotos em *Media → Portfólio*. Todas aparecem no site. Para definir a ordem, a legenda e a descrição (para leitores de tela), adicione a foto em **Portfólio (ordem e legendas)**: as fotos da lista vêm primeiro, na ordem da lista, e as demais seguem pelo nome do arquivo.

**Depoimentos e Blog:** o menu do site só mostra esses itens quando existe pelo menos um depoimento ou post.

**Instagram:** a seção "Acompanhe no Instagram" aparece na página inicial quando há pelo menos uma foto cadastrada (até 6). Sem link, a foto leva ao perfil.

## Google Analytics e cookies (LGPD)

Por padrão o site não carrega nenhum script do Google nem mostra aviso de cookies.

Para ligar, preencha em **Configurações → Google Analytics / Tag Manager**:

- **ID do Google Analytics 4** (`G-XXXXXXXXXX`), criado em [analytics.google.com](https://analytics.google.com) → Administrador → Fluxos de dados; ou
- **ID do Google Tag Manager** (`GTM-XXXXXXX`), se o Analytics for configurado dentro do Tag Manager. Use só um dos dois para não contar visitas em dobro.

Com um ID preenchido, o site mostra o aviso de privacidade (Aceitar/Recusar). A escolha fica salva no navegador da pessoa. O Consent Mode v2 começa com tudo negado, e o Analytics/Tag Manager só é carregado depois de "Aceitar". A página `/privacidade/` explica o uso e tem um botão para mudar a escolha.

Eventos enviados (só com consentimento):

| Evento | Quando | Parâmetros |
| --- | --- | --- |
| `clique_whatsapp` | Qualquer botão de WhatsApp | `origem`: `hero`, `menu`, `flutuante`, `chamada`, `rodape`, `contato`, `pacote:<nome>` |
| `clique_instagram` | Links para o Instagram | `origem` |
| `envio_formulario` | Envio do formulário de contato | `origem`, `pacote` |
| `download_pdf` | Botão "Baixar proposta em PDF" | `origem`: `proposta`, `contato` |

No código, elementos com `data-evento="nome"` e `data-origem="..."` são rastreados automaticamente; para outros casos use `rastrear(nome, parametros)` de `src/lib/rastreamento.ts`, que não faz nada sem consentimento.

## PDF da proposta

O deploy gera o PDF e publica em `/proposta-mikael-fotografia.pdf` (no GitHub Pages: [thiago-tap.github.io/mikael-fotografia/proposta-mikael-fotografia.pdf](https://thiago-tap.github.io/mikael-fotografia/proposta-mikael-fotografia.pdf)). Os botões "Baixar proposta em PDF" da proposta e do contato apontam para esse arquivo. No `npm run dev` o arquivo não existe, então o botão dá 404 até rodar o deploy.

Para gerar no computador:

```bash
npm run pdf                # gera o site e cria proposta/Proposta-Mikael-Fotografia.pdf
npm run pdf -- --sem-build # reaproveita o dist/ já gerado (se o build usou BASE_PATH, defina a mesma variável)
npm run pdf -- --saida caminho/arquivo.pdf
```

O PDF sai da página `/proposta-pdf/` (fora do menu, do sitemap e com `noindex`), no mesmo formato da proposta original do Canva: páginas verticais de 810 × 1440 pt. São 9 páginas: capa, apresentação com índice, uma página por pacote, valores adicionais, "Por que Mikael Fotografia?" e perguntas frequentes com contato. Preços, itens, extras e textos vêm dos mesmos arquivos do site.

No PDF dá para clicar no índice (leva à página de cada pacote), em "Índice" no rodapé de cada página, em "Quero este pacote" (abre o WhatsApp com a mensagem do pacote), no WhatsApp, no Instagram e no endereço do site.

No computador, o script usa o Edge ou o Chrome instalado; no GitHub Actions, o Chromium do Playwright. Se algum texto passar do tamanho da página, o script avisa qual página estourou (no deploy, vira um aviso sem interromper a publicação). A pasta `proposta/` não vai para o repositório.

A imagem de compartilhamento (`public/og-padrao.png`, 1200 × 630) é gerada por `npm run og`.

## Onde fica cada conteúdo

Tudo isso é editável pelo painel; a tabela serve para quem mexe direto no código.

| O quê | Arquivo |
| --- | --- |
| WhatsApp, Instagram, Analytics e fotos das vagas | `src/content/configuracoes.json` |
| Faixa de agenda | `src/content/agenda.json` |
| Pacotes, preços e tabela de comparação | `src/content/pacotes.json` |
| Valores adicionais | `src/content/extras.json` |
| "Por que Mikael Fotografia?" | `src/content/diferenciais.json` |
| "Como funciona" | `src/content/comoFunciona.json` |
| Texto da página Sobre | `src/content/sobre.md` |
| Perguntas frequentes | `src/content/faq/*.md` (`naProposta: true` mostra a pergunta na proposta) |
| Depoimentos | `src/content/depoimentos/*.md` |
| Posts do blog | `src/content/blog/*.md` |
| Ordem e legendas do portfólio | `src/content/portfolio/legendas.json` |
| Fotos do Instagram | `src/content/instagram.json` (imagens em `src/assets/instagram/`) |

Exemplo de depoimento (`src/content/depoimentos/ana-e-pedro.md`):

```md
---
casal: Ana e Pedro
local: Brasília
ordem: 1
foto: /src/content/depoimentos/ana-e-pedro.jpg   # opcional; também aceita ./ana-e-pedro.jpg
---

Texto do depoimento.
```

Exemplo de post (`src/content/blog/casamento-ana-e-pedro.md`):

```md
---
titulo: Casamento de Ana e Pedro
descricao: Uma cerimônia ao pôr do sol.
data: 2026-10-02
capa: /src/content/blog/casamento-ana-e-pedro.jpg   # opcional
capaAlt: Ana e Pedro na saída da cerimônia
---

Texto do post.
```

## Fotos

JPG editado, cor sRGB, de 1 a 4 MB por arquivo. O site gera as versões menores (AVIF e WebP) sozinho. Enquanto a foto não existe, a página mostra um espaço tracejado com o nome do espaço e a medida.

Cada espaço fixo recebe a foto de um destes jeitos:

1. **Pelo painel:** em **Configurações → Fotos fixas do site**, escolha a foto do espaço. Fica salvo em `configuracoes.json`, no campo `fotos` (ex.: `"home-hero": "/src/assets/fotos/casal-no-lago.jpg"`).
2. **Pelo nome do arquivo:** coloque em `src/assets/fotos/` um arquivo com o nome do espaço (ex.: `home-hero.jpg`). Vale quando o espaço não tem foto escolhida no painel.

| Espaço | Onde aparece | Proporção | Mínimo |
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

As fotos do topo (`home-hero` e `proposta-hero`) ocupam a tela inteira e são cortadas a partir do centro: no celular aparece só a faixa central, em formato vertical; no computador, corta um pouco em cima e embaixo. Escolha fotos com o casal no centro, com folga ao redor e sem muito detalhe na parte de baixo, onde fica o título.

**Ampliar fotos:** no portfólio e na capa dos posts, clicar na foto abre a versão grande (até 2400 px) em tela cheia, com setas, teclado e deslizar no celular.

**Portfólio:** as fotos ficam em `src/content/portfolio/` (24 a 40 para começar, misturando 3:2 de 2400 × 1600 e 4:5 de 1600 × 2000). Ordem e textos em `legendas.json`:

```json
[
  { "imagem": "/src/content/portfolio/01.jpg", "alt": "Noiva entrando na cerimônia ao pôr do sol", "legenda": "Ana e Pedro" }
]
```

**Marca:** logo horizontal em `src/assets/marca/logo.png` (ou `.svg`/`.webp`), fundo transparente, largura mínima de 1200 px. Sem o arquivo, o cabeçalho usa o nome em texto. O ícone da aba fica em `public/favicon.svg`.
