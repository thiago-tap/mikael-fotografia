# Especificação — refinamento do site Mikael Fotografia

Direção aprovada: **manter o estilo claro, editorial e em tons de areia, refinando-o** (não é um redesenho). Movimento **discreto**. Base: auditoria de outubro de 2026.

## Fase 1 — refinamento visual, conversão e SEO local

| # | Item | Decisão |
| --- | --- | --- |
| 1 | Hero | Tela cheia (`100svh` menos o cabeçalho), foto em `object-cover` com véu em gradiente na base, sobrelinha + H1 + CTAs sobre a foto. Funciona também sem foto (fundo areia + véu). No celular, a foto 3:2 é cortada no centro para a tela vertical; `sizes` calculado pela proporção da tela. |
| 2 | CTA principal | "Consultar disponibilidade da minha data" → WhatsApp com mensagem pronta que cita a página/pacote de origem. Secundário: "Ver a proposta" (na proposta: "Ver os pacotes"). |
| 3 | WhatsApp flutuante | Pílula "Consultar data" (só ícone em telas < 380 px), aparece depois do hero (IntersectionObserver) e some sobre CTAs, formulário e rodapé. Sem JS, fica sempre visível. |
| 4 | Menu | Portfólio · Proposta · Sobre · FAQ · Contato. Depoimentos e Blog entram no menu, no rodapé e na home só quando as coleções têm itens (calculado no build). |
| 5 | Como funciona | Linha do tempo em 6 etapas (home e proposta), em `src/content/comoFunciona.json`, com textos tirados do FAQ/Sobre. |
| 6 | Comparativo | Tabela abaixo dos pacotes na proposta, a partir de `pacotes[].comparativo` (campos em texto). Valor desconhecido = "—"; linha some se nenhum pacote tiver valor. No celular: rolagem horizontal com 1ª coluna fixa. Itens do Eternidade não informados pelo Mikael ficam em branco. |
| 7 | Agenda 2026/2027 | `src/content/agenda.json` `{ ativo, texto }`. Faixa elegante na home e na proposta só quando `ativo` e `texto`. Começa desligada. |
| 8 | Tipografia e contraste | Escala fluida com `clamp()` em tokens (`text-rotulo`, `text-corpo`, `text-titulo-4…1`, `text-manchete`, `text-preco`). Cormorant itálico como voz emocional. Corpo em peso 400; peso 500 removido. `taupe` escurecido para `#6f5f4e` (≥ 4,5:1 em papel e areia). |
| 9 | Movimento | Revelar ao rolar (`data-revelar`, fade + 14 px), zoom lento nas fotos ao passar o mouse, sublinhado animado nos links, transição entre páginas via CSS `@view-transition { navigation: auto }` (sem `ClientRouter`, para não reiniciar scripts). Estado oculto só existe com a classe `js` no `<html>`; tudo desligado em `prefers-reduced-motion`. |
| 10 | Atmosfera | Linhas finas entre seções, faixa escura (tinta) com manifesto tirado do texto Sobre, grão de papel em CSS muito sutil. |
| 11 | SEO local | "Brasília/DF" em títulos, descrições e rodapé. JSON-LD: `ProfessionalService` (todas as páginas), `FAQPage` (/faq), `OfferCatalog` dos pacotes (/proposta), `BreadcrumbList`. OG padrão 1200×630 em PNG (`public/og-padrao.png`), `og:locale pt_BR`, `robots.txt` com o sitemap respeitando o `base`. Preload do Cormorant 300 latino. Fotos em AVIF + WebP via `<Picture>`. |
| 12 | Código | Menu móvel: Esc, foco preso e retorno do foco. Formulário: fallback `location.href` se `window.open` for bloqueado; campo "Número de convidados". Lógica de preço/chamada do pacote unificada. Classes de link extraídas em utilities. |
| 13 | PDF | `proposta-pdf` e `npm run pdf` continuam funcionando. |

## Fase 2 — autonomia e medição

| # | Item | Decisão |
| --- | --- | --- |
| 14 | Pages CMS | `.pages.yml` na raiz, com mídias separadas (fotos do site, portfólio, Instagram, depoimentos, blog) e entradas para pacotes, extras, diferenciais, como funciona, agenda, FAQ, depoimentos, blog, sobre, legendas do portfólio, Instagram e Configurações. `src/content/configuracoes.json` guarda WhatsApp, Instagram, IDs de GA/GTM e um mapa opcional *vaga → foto enviada* (o nome do arquivo deixa de importar). |
| 15 | Instagram | `src/content/instagram.json` (até 6 itens `{ imagem, link, alt }`), fotos em `src/assets/instagram/` otimizadas pelo Astro. Grade "Acompanhe no Instagram" na home, escondida quando vazia. |
| 16 | Analytics + LGPD | Com `gaId` ou `gtmId`: banner Aceitar/Recusar (localStorage), Consent Mode v2 com tudo negado por padrão, GA4/GTM carregados só depois do aceite, página `/privacidade`. Eventos por `data-evento` (WhatsApp com `origem`, Instagram, envio do formulário, download do PDF) via `rastrear()`. Sem IDs: sem banner e sem scripts. |
| 17 | PDF no deploy | O workflow instala o Chromium do Playwright, gera `dist/proposta-mikael-fotografia.pdf` depois do build e publica junto. Botão "Baixar proposta em PDF" na proposta e no contato. `npm run pdf` local continua usando o Edge. |
| 18 | README | Instruções do painel para o Mikael, analytics e PDF. |

## Fora do escopo (depende do Mikael)

Fotos, depoimentos, datas livres da agenda, faixa de convidados por pacote, itens que faltam no Eternidade, domínio próprio e decisões de preço.
