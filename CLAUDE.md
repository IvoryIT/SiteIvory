# Site ivoryit.com.br (Next.js)

Site institucional da Ivory, migrado do WordPress/Elementor. Conteúdo praticamente estático,
publicado na Vercel. Responder sempre em português do Brasil.

## Comandos

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor local em http://localhost:3000 |
| `npm run build` | Build de produção (valida cabeçalhos e componentes de todas as páginas) |
| `npm run verificar` | Verificação completa antes de publicar: schema, SEO, links, imagens e build |
| `npm run verificar -- content/paginas/<caminho>/index.mdx` | Verificação rápida de uma página |
| `node scripts/smoke.mjs http://localhost:3000` | Teste de fumaça do build rodando (`npm run build && npm start`) |

## Como o site é organizado

- **A pasta é a URL.** `content/paginas/blog/blog-ia-segura-e-eficaz/index.mdx` é publicado em
  `/blog/blog-ia-segura-e-eficaz/`. A home é `content/paginas/index.mdx`. URLs têm barra final.
- Ao lado de cada `index.mdx` pode haver `agentes.md`: a versão em Markdown que o site entrega a
  agentes de IA (`Accept: text/markdown`) e que alimenta o `/llms.txt`.
- O cabeçalho (frontmatter) de cada página é validado por `src/lib/esquema.ts`. Página fora do
  schema não entra no build.
- Cada página pertence a uma **família**, que define o molde visual:

| Família | Molde | Exemplo |
|---|---|---|
| `artigo` | Capa com título, texto, Compartilhe, Insights recentes | `/blog/blog-ia-segura-e-eficaz/` |
| `case` | Setor, cartão do case, desafio, entregas, impacto, formulário | `/case-mineracao-anglo-american/` |
| `setor` | Hub de cases de um setor | `/cases-de-sucesso-ivory/cases-mineracao/` |
| `solucao` | Capa, introdução, blocos de serviço com cartões | `/solucoes/solucoes-dados/` |
| `pagina` | Livre: seções compostas no MDX (home, institucionais, hubs, legais) | `/como-fazemos/` |

## Regras do conteúdo (MDX)

1. Texto em Markdown: `**negrito**`, `_itálico_`, listas, `## títulos`, `[links](/caminho/)`.
2. Só os componentes da família da página (lista em `src/components/familias/registro.ts`).
   Componente fora da lista, HTML solto (`<div>`, `<span>`…) ou atributo `style`/`className`
   **quebram o build** — de propósito. Se o que se quer não cabe em nenhum componente, é caso
   de criar componente novo (skill `novo-componente`), não de improvisar.
3. `<Azul>texto</Azul>` é o destaque em azul da marca. Não use cores fora dos tokens.
4. Imagens em `public/imagens/AAAA/MM/` (novas) ou `public/wp-content/uploads/…` (migradas),
   sempre com texto alternativo que descreva a imagem.
5. Links internos com barra final: `/solucoes/solucoes-dados/`.

## Design system

Tokens em `src/app/globals.css` (`@theme`): `azul` #003D5B, `texto` #242424, `corpo` #333333,
`laranja` #F35B04, `creme` #FFEEC2, `fundo` #FFF6DF, `vinho` #861657, `linha` #AAAAAA. Paleta
estendida, de uso pontual herdado do site antigo: `areia`, `rosa-claro`, `azul-claro`, `preto`,
`erro`, `whatsapp` (botão flutuante) e as cores das páginas legais (`link-legal`, `borda-tabela`, `cinza-claro`). Exceção
documentada: o banner de cookies imita o visual do Complianz e usa cores próprias.
Fonte Poppins (itálico é marca do site em títulos, menu e botões). Container de 1140px
(`container-site`). Breakpoints do Elementor: celular < 768px, tablet 768–1024px, desktop ≥ 1025px
(`md:` e `lg:`). Textura de ruído em todas as faixas (`fundo-ruido`).

## Regras de código

- Estilo só com classes Tailwind e os tokens acima. **CSS Modules não funcionam** neste projeto
  (a regra `*.css` do Turbopack no `next.config.ts` passa todo CSS pelo Tailwind).
- Componentes de conteúdo são server components; `"use client"` só onde há interação.
- O conteúdo é lido com `"use cache"`; em desenvolvimento a chave inclui a data dos arquivos de
  `content/`, então editar um MDX aparece na hora no `npm run dev`.
- `partialPrefetching` fica desligado no `next.config.ts`: ligado, uma URL inexistente recebe a
  casca da página com status 200 antes do `notFound()`. `node scripts/smoke.mjs` confere o 404.

## Onde mora cada coisa

| O quê | Onde |
|---|---|
| Menu, contatos, endereços, redes | `src/lib/site.ts` |
| Schema do cabeçalho das páginas | `src/lib/esquema.ts` |
| Moldes das famílias | `src/components/familias/<familia>/` |
| Componentes exclusivos de páginas únicas | `src/components/paginas/<pagina>/` |
| Blocos comuns (capa, formulário, insights…) | `src/components/blocos/` |
| SEO (title, description, Open Graph, JSON-LD) | `src/lib/seo.ts` |
| Redirects herdados do WordPress | `src/data/redirects.json` + `next.config.ts`; links `/?p=ID` em `src/proxy.ts` |
| Formulário → motor de score | `src/components/blocos/FormularioContato.tsx` (posta em `/api/lead/`, repassado pelo `next.config.ts` à function `lead-receiver`) |
| Migração do WordPress (só até a virada) | `scripts/migracao/` |

## Segurança e dados

- Nunca coloque credenciais no repositório. Configuração sensível vai nas variáveis de ambiente da
  Vercel (`MOTOR_SCORE_URL`).
- Em preview e local, `MOTOR_SCORE_URL` aponta para o mock (`scripts/motor-score/mock-motor.mjs` do
  projeto antigo) ou a function local — **nunca** para a de produção.
