# Mikael Vt Fotógrafo

Site de fotografia de casamento do Mikael Vt (Mikael Vt Fotógrafo), feito com [Astro](https://astro.build) e Tailwind CSS e publicado no GitHub Pages.

## Rodar localmente

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # verifica tipos e gera dist/
```

## Publicação

Cada push na branch `main` roda `.github/workflows/deploy.yml`: gera o site, gera o PDF da proposta e publica tudo. No repositório, em **Settings → Pages**, a origem deve estar como **GitHub Actions**. O endereço e o caminho base são preenchidos pelo próprio workflow, então o site funciona em `https://<usuario>.github.io/<repo>/` e também com domínio próprio.

Cada alteração salva no painel é um commit na `main`, então o site se atualiza sozinho em 2 a 3 minutos.

## Testes automáticos antes de publicar

Antes de publicar, o workflow abre o site recém-gerado num navegador de verdade (Chromium, em tela de celular 375 × 667 e de computador 1440 × 900) e confere se nada quebrou. **Se algum teste falhar, nada é publicado e o site no ar continua sendo a versão anterior.**

O que é conferido (os testes não dependem de textos ou preços exatos, então editar o conteúdo pelo painel não quebra nada):

- Todas as páginas principais abrem e têm título; endereço inexistente mostra a página 404.
- Todos os links internos do menu, do rodapé e das páginas (incluindo imagens, CSS, JS e o PDF) funcionam.
- Nenhuma página tem rolagem para o lado no celular ou no computador.
- Todos os botões do WhatsApp usam o número cadastrado em **Configurações** e têm mensagem pronta; links do Instagram vão para instagram.com.
- Proposta: cada pacote tem nome, pelo menos 3 itens, o valor depois dos itens e o botão do WhatsApp com o nome do pacote. A vitrine da página inicial não mostra preços.
- Formulário de contato: gera a mensagem do WhatsApp com os dados do casal e recusa datas inexistentes (ex.: 31/02).
- Ampliação de fotos (quando há fotos no portfólio), menu do celular abrindo e fechando com Esc.
- Acessibilidade sem problemas graves (axe) no início, proposta e contato; dados estruturados (JSON-LD) válidos.
- PDF da proposta gerado, com tamanho e número de páginas coerentes.
- Lighthouse (celular) no início e na proposta: acessibilidade e SEO abaixo de 95 bloqueiam a publicação; desempenho abaixo de 85 e boas práticas abaixo de 90 só geram aviso.

**Quando falha:**

1. O GitHub manda um e-mail automático para o dono do repositório avisando que o workflow falhou.
2. Em **Actions**, abra a execução com ❌. O resumo no topo lista quais testes falharam e por quê. No fim da página, baixe o artefato **relatorio-testes** (abra o `index.html` de dentro dele para ver capturas de tela). O relatório do Lighthouse fica no artefato **relatorio-lighthouse**.
3. Para desfazer uma edição que quebrou o site: corrija pelo painel (o campo editado por último, normalmente) e salve de novo; ou, no GitHub, abra o arquivo alterado → **History**, veja o commit do painel e restaure o conteúdo anterior (editar e colar a versão antiga, ou `git revert <commit>`). Cada novo salvamento roda os testes de novo e, passando, publica.

**Rodar localmente:**

```bash
npx playwright install chromium   # uma vez só
npm test                          # gera o site, gera o PDF e roda os testes (celular + computador)
npm run test:e2e                  # só os testes, usando o dist/ já gerado
npm run lighthouse                # notas do Lighthouse; relatórios em relatorio-lighthouse/
```

Para simular o caminho do GitHub Pages, defina `BASE_PATH=/mikael-fotografia` antes de `npm test`. O relatório HTML dos testes fica em `relatorio-testes/` (`npx playwright show-report relatorio-testes`).

## Painel de edição (Pages CMS)

O conteúdo é editado pelo [Pages CMS](https://pagescms.org), configurado em `.pages.yml`. Não é preciso instalar nada.

**Primeiro acesso (uma vez só, feito por quem administra o repositório):**

1. Entre em [app.pagescms.org](https://app.pagescms.org) com a conta do GitHub e instale o app do Pages CMS no repositório `mikael-fotografia`.
2. Em **Settings → Collaborators** do painel, convide o Mikael pelo e-mail. Ele entra pelo link recebido, sem precisar de conta no GitHub.

**No dia a dia, para o Mikael:**

1. Abra [app.pagescms.org](https://app.pagescms.org) e escolha o site **mikael-fotografia**.
2. No menu da esquerda, escolha o que quer mudar:
   - **Configurações:** WhatsApp, Instagram, IDs do Google Analytics, a foto de cada espaço fixo do site (topo da página inicial, pacotes, retrato etc.) e o ponto de foco de cada uma.
   - **Agenda e disponibilidade:** liga ou desliga a faixa "Agenda 2026 · 2027" e marca a situação de cada mês na página `/agenda/`.
   - **Proposta:** pacotes (preço, itens, tabela de comparação), serviços extras, "Por que Mikael Vt?" e "Como funciona".
   - **Casamentos reais, Perguntas frequentes, Depoimentos e Blog:** cada item é uma página; use **Add an entry** para criar.
   - **Página Sobre**, **Portfólio** (ordem, legendas, tamanho e foco) e **Instagram** (até 6 fotos).
3. Edite e clique em **Save**. O site publica a mudança sozinho em poucos minutos, e o PDF da proposta é atualizado junto.

**Fotos:** em qualquer campo de foto, clique para enviar do computador ou escolher uma que já está no painel. Use JPG editado, em sRGB, lado maior de 2400 a 3000 px, até 3 MB (veja [Fotos: tamanho e otimização](#fotos-tamanho-e-otimização)). Na aba **Media** ficam as pastas: *Fotos do site*, *Portfólio*, *Casamentos reais*, *Instagram*, *Depoimentos* e *Blog*.

**Ponto de foco:** o site corta as fotos para caber em cada espaço (vertical no celular, horizontal no computador). O campo **Ponto de foco** diz qual parte nunca pode sumir: centro, topo, base, esquerda, direita ou um dos cantos. Existe para cada espaço fixo (**Configurações → Ponto de foco das fotos fixas**), para cada foto do portfólio e dos casamentos, para a capa dos posts e para a foto dos depoimentos. Vazio = centro. Ex.: retrato vertical com o rosto no alto → **Topo**.

**Portfólio:** envie as fotos em *Media → Portfólio*. Todas aparecem no site. Para definir a ordem, a legenda, a descrição (para leitores de tela), o tamanho e o foco, adicione a foto em **Portfólio (ordem e legendas)**: as fotos da lista vêm primeiro, na ordem da lista, e as demais seguem pelo nome do arquivo.

A grade é editorial, em linhas de tamanhos diferentes. O campo **Tamanho na grade** decide o papel de cada foto:

- **Automático** (padrão): fotos verticais viram *vertical*; as horizontais alternam *grande, médio, médio*.
- **Grande:** ocupa 2/3 da linha ao lado de uma vertical, ou a linha inteira.
- **Médio:** fica em par com outra média (ou ao lado de uma vertical).
- **Vertical:** fica ao lado de uma grande, em trio com outras duas verticais ou em par. Entre pares de verticais, a grade intercala frases curtas do site (lema e assinatura).

A legenda aparece pequena, em itálico, embaixo da foto, e também no modo ampliado. Clicar em qualquer foto abre o modo ampliado na ordem da página.

**Casamentos reais:** cada casamento vira uma página em `/casamentos/<nome>/` com capa, dados (data, local, cidade), resumo, texto e galeria separada por etapa (*Making of, Cerimônia, O casal, Festa*; fotos sem etapa ficam no fim). Envie as fotos em *Media → Casamentos reais* e escolha-as na galeria (até 80 por casamento). Marque **Mostrar na página inicial** para aparecer na faixa "Casamentos reais" da home (até 3). O item "Casamentos" do menu e do rodapé só aparece quando existe pelo menos um casamento.

**Agenda:** em **Agenda e disponibilidade → Disponibilidade por mês**, adicione o ano e marque cada mês: *Sem informação* (mostra "Consulte"), *Datas disponíveis*, *Poucas datas* ou *Esgotado*. Só marque o que for verdade. Enquanto todos os meses estiverem sem informação, a página `/agenda/` fica fora do Google e nenhum link leva até ela. Com pelo menos um mês preenchido, aparecem os links na faixa de agenda, na proposta e no contato. Meses que já passaram aparecem como encerrados.

**Limites do painel:** os campos avisam antes de salvar quando passam do tamanho que cabe no layout (ex.: nome do pacote até 24 caracteres, frase de chamada até 90, de 3 a 14 itens por pacote com até 120 caracteres cada, depoimento até 900, resumo do casamento até 220, legenda de foto até 80, descrição de foto até 160, texto da faixa de agenda até 140). O número do WhatsApp precisa estar no formato `55` + DDD + número (ex.: `5561982042153`) e os links começam com `https://`. O build confere as mesmas regras, então um arquivo editado à mão fora do padrão também é barrado com a mensagem do campo.

**Depoimentos e Blog:** o menu do site só mostra esses itens quando existe pelo menos um depoimento ou post. Os primeiros depoimentos (pela ordem) aparecem num carrossel na página inicial e na proposta, logo depois dos pacotes.

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
| `view_proposta` | Abertura da página `/proposta/` (uma vez por visita à página) | — |
| `ver_pacote` | Um card de pacote fica pelo menos metade visível na proposta (uma vez por pacote), ou clique em "Ver o que está incluso" na home | `pacote`; `origem`: `inicio` no clique da home |
| `clique_quero_pacote` | Botão "Consultar data para este pacote" | `pacote`, `origem`: `pacote:<nome>` |
| `clique_whatsapp` | Qualquer botão de WhatsApp (inclusive o do pacote, que manda os dois eventos) | `origem`: `hero`, `menu`, `flutuante`, `chamada`, `rodape`, `contato`, `pacote:<nome>`, `casamento:<slug>`, `agenda`, `agenda:<mês>-<ano>` |
| `envio_formulario` | Envio do formulário de contato | `origem`, `pacote` |
| `download_pdf` | Botão "Baixar proposta em PDF" | `origem`: `proposta`, `contato` |
| `ver_casamento` | Abertura da página de um casamento | `slug` |
| `clique_agenda` | Links para a página `/agenda/` | `origem`: `faixa`, `proposta`, `contato` |
| `clique_instagram` | Links para o Instagram | `origem` |

No código, elementos com `data-evento="nome"` (vários nomes separados por espaço) e `data-origem`, `data-pacote` ou `data-slug` são rastreados no clique; eventos de página vêm do `eventoPagina` do layout `Base`. Para outros casos use `rastrear(nome, parametros)` de `src/lib/rastreamento.ts`, que não faz nada sem consentimento. Os links "Quero este pacote" dentro do PDF não são rastreáveis (o PDF não roda script).

**Funil no GA4.** Os parâmetros `origem`, `pacote` e `slug` precisam ser registrados uma vez em **Administrador → Definições personalizadas → Criar dimensão personalizada** (escopo *Evento*) para aparecer nos relatórios. Depois:

1. **Eventos-chave:** em **Administrador → Eventos**, marque como evento-chave `clique_whatsapp`, `envio_formulario`, `clique_quero_pacote` e `download_pdf`. Os outros (`view_proposta`, `ver_pacote`, `ver_casamento`, `clique_agenda`) são etapas, não conversões.
2. **Funil da proposta:** em **Explorar → Exploração de funil**, crie as etapas *Viu a proposta* (`view_proposta`) → *Viu um pacote* (`ver_pacote`) → *Quis o pacote* (`clique_quero_pacote`) → *Falou no WhatsApp* (`clique_whatsapp`). Marque **Funil aberto** desligado (o visitante precisa passar pela primeira etapa) e use `pacote` como detalhamento para ver qual pacote mais converte.
3. **Funil do portfólio:** `ver_casamento` → `clique_whatsapp`, com `origem` começando por `casamento:` no filtro da última etapa.
4. **Agenda:** `clique_agenda` → `clique_whatsapp` com `origem` começando por `agenda`.

## PDF da proposta

O deploy gera o PDF e publica em `/proposta-mikael-vt-fotografo.pdf` (no GitHub Pages: [thiago-tap.github.io/mikael-fotografia/proposta-mikael-vt-fotografo.pdf](https://thiago-tap.github.io/mikael-fotografia/proposta-mikael-vt-fotografo.pdf)). Os botões "Baixar proposta em PDF" da proposta e do contato apontam para esse arquivo. No `npm run dev` o arquivo não existe, então o botão dá 404 até rodar o deploy.

Para gerar no computador:

```bash
npm run pdf                # gera o site e cria proposta/Proposta-Mikael-Vt-Fotografo.pdf
npm run pdf -- --sem-build # reaproveita o dist/ já gerado (se o build usou BASE_PATH, defina a mesma variável)
npm run pdf -- --saida caminho/arquivo.pdf
```

O PDF sai da página `/proposta-pdf/` (fora do menu, do sitemap e com `noindex`), no mesmo formato da proposta original do Canva: páginas verticais de 810 × 1440 pt. São 10 páginas: capa, apresentação com índice, uma página por pacote, valores adicionais (os extras sem preço aparecem em "Também sob consulta"), "Por que Mikael Vt?", perguntas frequentes e contato. Preços, itens, extras e textos vêm dos mesmos arquivos do site.

No PDF dá para clicar no índice (leva à página de cada pacote), em "Índice" no rodapé de cada página, em "Quero este pacote" (abre o WhatsApp com a mensagem do pacote), no WhatsApp, no Instagram e no endereço do site.

No computador, o script usa o Edge ou o Chrome instalado; no GitHub Actions, o Chromium do Playwright. Se algum texto passar do tamanho da página, o script avisa qual página estourou (no deploy, vira um aviso sem interromper a publicação). A pasta `proposta/` não vai para o repositório.

A imagem de compartilhamento (`public/og-padrao.png`, 1200 × 630) é gerada por `npm run og`.

## Monograma e tipografia

O monograma "MV" (M reto e V itálico cruzando um fio fino) é desenhado a partir da própria fonte Cormorant Garamond do site, sem SVG feito à mão:

```bash
npm run monograma   # gera src/assets/monograma.svg, src/assets/marca/icone.svg e public/favicon.svg
npm run og          # refaz public/og-padrao.png com o monograma
```

Ele aparece nos divisores de seção, no rodapé, na capa e na página de contato do PDF, na imagem de compartilhamento e como ícone padrão (aba do navegador e atalho do celular). Um ícone enviado em **Configurações → Ícone** continua tendo prioridade; o arquivo `src/assets/marca/icone.svg` só vale enquanto nada for escolhido no painel.

A fonte de títulos é um token só: `--font-serif` em `src/styles/global.css` (o texto corrido é Jost, em `--font-sans`). A página escondida [`/tipografia/`](https://thiago-tap.github.io/mikael-fotografia/tipografia/) (fora do menu, do sitemap e com `noindex`) mostra o topo, os títulos e os nomes dos pacotes em quatro opções gratuitas: Cormorant Garamond (atual), Bodoni Moda, Playfair Display e Gloock. Para trocar, instale o pacote `@fontsource` escolhido, importe em `global.css` e mude `--font-serif`; depois rode `npm run monograma` e `npm run og` se quiser o monograma na nova fonte (o script lê os arquivos da Cormorant em `node_modules/@fontsource/cormorant-garamond`).

## Onde fica cada conteúdo

Tudo isso é editável pelo painel; a tabela serve para quem mexe direto no código.

| O quê | Arquivo |
| --- | --- |
| WhatsApp, Instagram, Analytics e fotos das vagas | `src/content/configuracoes.json` |
| Faixa de agenda e situação de cada mês | `src/content/agenda.json` (`anos`: `sem-info`, `disponivel`, `poucas-datas` ou `esgotado` por mês) |
| Casamentos reais | `src/content/casamentos/<nome>.md` ou `src/content/casamentos/<nome>/index.md` (com as fotos na mesma pasta) |
| Pacotes, preços e tabela de comparação | `src/content/pacotes.json` (`destaque: true` mostra "O mais escolhido"; `selo` mostra outra etiqueta, como "Melhor custo-benefício") |
| Valores adicionais | `src/content/extras.json` (sem `preco`, o extra aparece como "Sob consulta") |
| "Por que Mikael Vt?" | `src/content/diferenciais.json` |
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

Exemplo de casamento (`src/content/casamentos/ana-e-pedro/index.md`, com as fotos na mesma pasta):

```md
---
casal: Ana e Pedro
local: Capela Dom Bosco
cidade: Brasília, DF
data: 2026-09-20
capa:
  imagem: ./capa.jpg
  alt: Ana e Pedro saindo da capela
  foco: topo
resumo: Uma tarde de setembro com luz dourada e a família reunida.
destaque: true
galeria:
  - imagem: ./making-of-01.jpg
    etapa: making-of            # making-of, cerimonia, casal ou festa
    legenda: Os últimos detalhes
  - imagem: ./cerimonia-01.jpg
    etapa: cerimonia
    tamanho: grande             # auto, grande, medio ou vertical
    foco: base
---

Texto opcional contando o dia.
```

Pelo painel, o arquivo é criado como `src/content/casamentos/<casal>.md` e as fotos ficam em *Media → Casamentos reais* (caminhos `/src/content/casamentos/...`); os dois formatos funcionam.

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

JPG editado, cor sRGB, lado maior de 2400 a 3000 px, até 3 MB por arquivo. O site gera as versões menores (AVIF e WebP) sozinho. Enquanto a foto não existe, a página mostra um espaço tracejado com o nome do espaço e a medida.

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
| `pdf-capa` | Capa do PDF da proposta (sem ela, usa `proposta-hero`) | 9:16 vertical | 1690 × 3000 px |
| `pdf-extras` | Página de valores adicionais do PDF (sem ela, usa `faixa`) | 3:2 horizontal | 2400 × 1600 px |
| `pdf-diferenciais` | Página "Por que Mikael Vt?" do PDF (sem ela, usa `sobre-retrato`) | 2:3 vertical | 1600 × 2400 px |

As fotos do topo (`home-hero` e `proposta-hero`) ocupam a tela inteira e são cortadas a partir do centro: no celular aparece só a faixa central, em formato vertical; no computador, corta um pouco em cima e embaixo. Escolha fotos com o casal no centro, com folga ao redor e sem muito detalhe na parte de baixo, onde fica o título.

**Ampliar fotos:** no portfólio, na galeria dos casamentos e na capa dos posts, clicar na foto abre a versão grande (até 2400 px) em tela cheia, com setas, teclado e deslizar no celular.

**Portfólio:** as fotos ficam em `src/content/portfolio/` (24 a 40 para começar, misturando 3:2 de 2400 × 1600 e 4:5 de 1600 × 2000). Ordem e textos em `legendas.json`:

```json
[
  { "imagem": "/src/content/portfolio/01.jpg", "alt": "Noiva entrando na cerimônia ao pôr do sol", "legenda": "Ana e Pedro", "tamanho": "grande", "foco": "topo" }
]
```

**Carregamento suave:** cada foto mostra antes uma miniatura desfocada de 20 px (embutida no HTML), que dá lugar à foto quando ela carrega. O espaço da foto já tem a proporção certa, então nada pula na página; sem JavaScript, a foto aparece direto.

**Logo e ícone:** enviados em **Configurações** no painel (só PNG, SVG ou WebP; ficam em `src/assets/marca/`).

| Campo | Arquivo | Onde aparece | Sem o arquivo |
| --- | --- | --- | --- |
| **Logo** | PNG com fundo transparente ou SVG, horizontal, mínimo 1200 px de largura (ideal 2000 × 600 px). Versão escura, para fundo claro | Cabeçalho (36 px de altura no celular, 48 px no computador), rodapé e dados estruturados do Google (`logo`) | Nome "MIKAEL VT / FOTÓGRAFO" em texto |
| **Logo para fundo escuro** (opcional) | Mesma logo em branco/clara, PNG transparente ou SVG, mínimo 1200 px de largura | Capa e bloco de contato do PDF da proposta | Capa com o nome em texto claro; contato sem logo |
| **Ícone** | Quadrado, PNG transparente ou SVG, mínimo 512 × 512 px (ideal 1024 × 1024), com uma pequena margem ao redor do desenho | Aba do navegador, atalho do celular (`apple-touch-icon`) e `site.webmanifest` | `public/favicon.svg` (monograma MV) |

No build, o ícone vira `icones/favicon-32.png`, `icones/apple-touch-icon.png` (180 px, com fundo papel) e `icones/icone-192.png`/`icone-512.png` do manifesto; se for SVG, ele também é usado direto na aba. Sem escolha no painel, o site procura em `src/assets/marca/` os arquivos `logo`, `logo-claro` e `icone` (`.png`, `.svg` ou `.webp`). A otimização automática não reduz as imagens dessa pasta: só recomprime PNG e WebP sem perda, e não mexe em SVG. A imagem de compartilhamento (`public/og-padrao.png`) continua sendo gerada à parte, com `npm run og`.

## Fotos: tamanho e otimização

**Como exportar no Lightroom (Mikael):**

- Formato **JPG**, espaço de cor **sRGB**, qualidade **80 a 85**.
- Redimensionar: **lado maior 3000 px** (2400 px já basta para pacotes, portfólio e blog). Resolução (ppi) não importa.
- Nitidez de saída: **tela, padrão**.
- Sem marca d'água grande no meio da foto. Se quiser, uma assinatura pequena no canto.
- Nada de RAW (`.cr3`, `.nef`, `.dng`...), HEIC (foto direto do iPhone) ou TIFF. O painel só aceita JPG, PNG e WebP.

Cada campo de foto do painel mostra a medida ideal daquele espaço (topo: horizontal 3:2 com o casal no centro; retrato: vertical 4:5; pacotes: 3:2; portfólio: livre; Instagram: quadrada).

**O que o site faz sozinho:**

1. **Otimiza o arquivo enviado**, como o TinyPNG faz: a cada envio pelo painel, o deploy roda `npm run otimizar-imagens`, que gira a foto pela orientação da câmera, reduz para no máximo 3000 px no lado maior, converte para sRGB, remove os metadados (EXIF, GPS) e recomprime no mesmo formato e com o mesmo nome (JPG com mozjpeg qualidade 82, PNG com paleta, WebP qualidade 82). Só substitui quando a foto foi reduzida ou ficou mais de 5% menor, então rodar de novo não muda nada. A versão otimizada volta para a `main` num commit "Otimiza imagens enviadas [skip ci]" do `github-actions[bot]`, e o site publicado já usa essa versão. O resumo com antes/depois aparece na página da execução em **Actions**.
2. **Gera as versões para o navegador:** no build, o Astro cria AVIF e WebP em vários tamanhos, e cada aparelho baixa só o tamanho de que precisa.

Uma foto de câmera de 15 a 20 MB costuma virar 1 a 2 MB no repositório e 100 a 300 KB no site.

**TinyPNG ou Squoosh:** opcionais. Dá para passar a foto em [tinypng.com](https://tinypng.com) ou [squoosh.app](https://squoosh.app) antes de enviar, mas o site já faz o equivalente.

**No computador (Thiago):**

```bash
npm run otimizar-imagens   # otimiza as fotos das pastas do painel e mostra a tabela antes/depois
npm run verificar-imagens  # só confere: lista fotos acima de 3000 px ou 3 MB e sai com erro
node scripts/otimizar-imagens.mjs --pasta caminho/da/pasta   # outra pasta
```

As pastas ficam no início de `scripts/otimizar-imagens.mjs`. No deploy, a verificação é só um aviso. Se aparecer um arquivo HEIC/RAW/TIFF nessas pastas (enviado fora do painel), o deploy falha com a lista dos arquivos: exporte como JPG, envie de novo e apague o original.

**Tamanho do repositório:** o GitHub recomenda manter o repositório abaixo de cerca de 1 GB. Com fotos otimizadas (1 a 2 MB cada), isso dá para centenas de fotos. Foto apagada pelo painel sai do site, mas continua no histórico do git e ocupando espaço; trocar a mesma foto muitas vezes também acumula. Envie a versão final e evite subir e apagar lotes de teste. Essas versões antigas são removidas do histórico de tempos em tempos (próxima seção).

## Limpeza automática do histórico de imagens

**O que faz:** o workflow `.github/workflows/limpar-historico-imagens.yml` procura no histórico inteiro as imagens (`jpg`, `jpeg`, `png`, `webp`, `gif`, `avif`, `heic`, `heif`, `tif`, `tiff`, `raw`, `dng`, `cr2`, `cr3`, `nef`, `arw`) que **não estão na versão atual** do site: fotos apagadas pelo painel, originais antes da otimização e versões trocadas. Se elas somarem **15 MB ou mais**, reescreve o histórico com `git filter-repo` removendo só esses arquivos e faz force push na `main`. O conteúdo atual não muda (o script confere que a árvore da HEAD fica idêntica e aborta se não ficar); mudam os hashes dos commits, e commits que só mexiam nessas imagens somem. Depois dispara o deploy e apaga os caches do Actions. A lista de arquivos removidos, com tamanho e commits, aparece no resumo da execução em **Actions**.

**Quando:** dia 1º a cada 2 meses (jan, mar, mai, jul, set, nov), às 04:00 de Brasília. Também dá para rodar em **Actions → Limpar histórico de imagens → Run workflow**, com `forcar` (limpa mesmo abaixo de 15 MB) e `simular` (só mostra o que seria removido e testa a reescrita numa cópia, sem alterar a `main`). Pelo terminal:

```bash
gh workflow run limpar-historico-imagens.yml -f simular=true
gh workflow run limpar-historico-imagens.yml -f forcar=true
```

**Segurança:**

- Antes de reescrever, guarda um `git bundle` com o repositório completo como artefato da execução (`backup-historico-<id>`), por **30 dias**. O repositório é público, então qualquer pessoa logada no GitHub pode baixar o artefato, mas ele só contém o que já era público no histórico.
- O deploy e a limpeza usam o mesmo grupo de concorrência (`main-escrita`): nunca rodam ao mesmo tempo.
- Se a `main` mudar durante a limpeza (Mikael salvou algo no painel), nada é enviado; a próxima execução faz a limpeza. O push usa `--force-with-lease` com o commit lido no início.
- A `main` não pode ter proteção contra force push; se um dia for protegida, a limpeza falha no envio sem alterar nada.

**Restaurar pelo backup** (até 30 dias depois): baixe o artefato na página da execução, descompacte e rode:

```bash
git clone mikael-fotografia-historico.bundle restaurado
cd restaurado
git push --force https://github.com/thiago-tap/mikael-fotografia.git main
```

**IMPORTANTE (Thiago):** depois de uma limpeza, o clone local fica com o histórico antigo. Faça commit e push de tudo **antes** e então ressincronize (alterações não commitadas ou não enviadas seriam perdidas):

```bash
git fetch origin
git reset --hard origin/main
git reflog expire --expire=now --all
git gc --prune=now
```

**No computador:** `npm run limpar-historico-imagens` faz o mesmo localmente (exige `pip install git-filter-repo`, a branch `main` ativa, sem alterações pendentes e igual à `origin/main`). Use `-- --simular` para só ver a lista, `-- --forcar` para ignorar o limite e `-- --limite-mb 30` para mudar o limite. O backup local vai para a pasta temporária do sistema (o caminho aparece na saída) ou para `-- --backup arquivo.bundle`.

**Mikael:** não precisa fazer nada. Evite só editar no painel às 04:00 do dia 1º dos meses ímpares; mesmo nesse horário é seguro, porque a limpeza desiste se a `main` mudar.
