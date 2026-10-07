---
name: revisar-seo
description: Use para auditar o SEO de uma página ou do site ivoryit.com.br inteiro — "como está o SEO dessa página?", "revisa o SEO antes de publicar", "por que essa página não aparece no Google?", "auditoria de SEO do blog", "melhora o título e a descrição". Junta a verificação automática com a revisão editorial pela rubrica do site e devolve um relatório em ordem de impacto.
---

# Revisar SEO

## 1. Verificação automática

```bash
npm run verificar -- content/paginas/<url>/index.mdx   # uma página
npm run verificar                                     # site todo
```

Erros (bloqueiam publicação) e avisos (recomendações) mecânicos: tamanho de título/descrição,
duplicidades, H1, hierarquia de títulos, imagens e `alt`, links internos quebrados, componentes.

## 2. Revisão editorial

Leia `references/rubrica-seo.md` e aplique às páginas do escopo: leia o `index.mdx` (cabeçalho +
corpo) e o `agentes.md` de cada uma. A rubrica separa GRAVE / IMPORTANTE / OBSERVAÇÃO — a mesma
régua do hook que roda antes de cada commit.

Para "por que não aparece no Google", confira também, nesta ordem: `seo.noindex`/`oculta` no
cabeçalho; presença em `/sitemap.xml` (`npm run dev` e abra a URL); canonical correto (view-source:
`<link rel="canonical">`); se a página é nova (indexação leva dias); concorrência da
palavra-chave (título e primeiro parágrafo respondem à busca?).

## 3. Relatório

Por página: veredito (ok / ajustar / bloquear) e os itens em ordem de impacto, cada um com o
trecho atual e o texto sugerido. Site todo: comece pelos padrões que se repetem (ex.: "23 títulos
acima de 60 caracteres") e liste as páginas.

Não altere nada sem a pessoa pedir. Quando pedir, aplique pela skill `publicar-conteudo`.
