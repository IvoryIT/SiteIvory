# ivoryit.com.br

Site institucional da Ivory em Next.js 16 (App Router, React 19, Tailwind CSS 4, MDX),
migrado do WordPress/Elementor. As páginas são arquivos MDX em `content/paginas/` e saem como
HTML estático no build.

## Rodar localmente

```bash
npm install
npm run dev        # http://localhost:3000
```

O formulário de contato posta em `/api/lead/`, que o `next.config.ts` repassa para
`MOTOR_SCORE_URL`. Sem a variável, vai para `http://localhost:7071/api/lead` — suba o mock do
motor de score com `node scripts/motor-score/mock-motor.mjs` (valida o corpo com o contrato real
do repositório do Marketing).

## Publicar conteúdo

Pelo Claude Code, com a skill `publicar-conteudo` ("publica um artigo sobre…", "novo case
do cliente…"). Ela parte do molde da família, prepara imagens, preenche o SEO e abre o PR.
Antes de cada commit, os hooks de `.claude/settings.json` verificam todas as páginas
(`npm run verificar`) e o Claude revisa o SEO das páginas alteradas.

Detalhes de estrutura, regras do conteúdo e design system: [`CLAUDE.md`](CLAUDE.md).

## Scripts

| Comando | O que faz |
|---|---|
| `npm run dev` / `npm run build` / `npm start` | Desenvolvimento, build e servidor de produção |
| `npm run verificar` | Conteúdo e SEO de todas as páginas (`-- <arquivo>` para uma; `-- --build` inclui o build) |
| `npx tsx scripts/catalogo.mts [familia]` | Componentes permitidos por família, com exemplos reais |
| `node scripts/imagem.mjs <arquivo> <nome>` | Converte imagem nova para WebP em `public/imagens/AAAA/MM/` |
| `node scripts/smoke.mjs [url]` | Teste de fumaça de um build rodando (`npm start` ou um preview): todas as páginas, 404, redirects herdados, Markdown para agentes, arquivos de SEO; `TESTAR_FORMULARIO=1` inclui o envio ao motor (use o mock) |
| `node scripts/capturar.mjs` / `comparar.mjs` / `fatiar.mjs` | Capturas de tela e comparação visual |
| `npm run migracao:exportar` / `migracao:converter` | Reimportação do WordPress (só até a virada) |

## Variáveis de ambiente

| Variável | Onde | Valor |
|---|---|---|
| `MOTOR_SCORE_URL` | Vercel (Production) | URL do `POST /api/lead` da function `lead-receiver` de produção |
| `MOTOR_SCORE_URL` | Vercel (Preview) e local | Mock ou function de teste — nunca a de produção |

GTM, Google tag e Clarity só carregam quando `VERCEL_ENV=production` (definido pela Vercel).
