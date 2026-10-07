---
name: migracao-wordpress
description: Use somente até a virada do WordPress para este site Next.js — "atualiza com o que mudou no WordPress", "roda a migração de novo", "compara o site novo com o antigo", "essa página ficou diferente do WordPress", "faltou alguma página/imagem". Reexporta do banco local do WordPress, reconverte para MDX e compara visualmente página a página.
---

# Migração do WordPress

O WordPress antigo roda localmente pelo Docker do projeto "Site Ivory" (pasta irmã
`../ivoryit.com.br`, http://localhost:8080, banco no container `siteivory-db-1`). **Somente
leitura** — nunca altere o WordPress nem o banco. Ele é lento (~20 s por página no primeiro
acesso) e só executa JavaScript e carrega a Poppins após interação; os scripts já tratam isso.

## Atualizar o conteúdo (antes da virada)

1. Peça um dump novo de produção importado no Docker local (é o processo do projeto antigo).
2. ```bash
   npm run migracao:exportar            # .tmp/wp-export.json + .tmp/wp-head.json (SEO renderizado)
   npm run migracao:converter           # reescreve content/paginas e copia imagens para public/
   ```
   Para uma parte só: `node scripts/migracao/converter.mjs --familia artigo` ou
   `--caminho /blog/` (no Git Bash, prefixe `MSYS_NO_PATHCONV=1`).
3. Leia `.tmp/relatorio-migracao.md`: cada aviso precisa de explicação.
4. **Atenção:** a conversão sobrescreve os MDX gerados. Alterações feitas à mão depois da
   migração se perdem — confira `git diff content/` e reaplique o que for intencional.

Conversores: `scripts/migracao/familias/<familia>.mjs` e, para páginas únicas,
`scripts/migracao/paginas/<pagina>.mjs`. Utilitários em `scripts/migracao/lib/`.

## Comparar com o WordPress

```bash
# referência (WordPress) e site novo, mesmas URLs (uma por linha em lista.txt)
node scripts/capturar.mjs http://localhost:8080 .tmp/ref --lista lista.txt
INJETAR_POPPINS=0 node scripts/capturar.mjs http://localhost:3000 .tmp/novo --lista lista.txt
node scripts/comparar.mjs .tmp/ref .tmp/novo .tmp/comparacao     # % de pixels + lado a lado
node scripts/fatiar.mjs .tmp/comparacao/<arquivo>.png 1000 .tmp/faixas
```

Para ajustar um componente, meça o original: `node scripts/migracao/medir.mjs <url-wp> saida.json 1440`
e `node scripts/migracao/resumir-medidas.mjs saida.json [yMin] [yMax]`. A árvore do Elementor de
uma página: `python -I scripts/migracao/arvore.py .tmp/inventario/elementor_data.tsv <id>`.

## Na virada

Rode a exportação/conversão uma última vez com o conteúdo congelado no WordPress, compare as 104
URLs (lista em `.tmp/caminhos.txt`) e só então aponte o DNS. Depois da virada, esta skill e
`scripts/migracao/` podem ser removidos.
