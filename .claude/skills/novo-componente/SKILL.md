---
name: novo-componente
description: Use quando um conteúdo do site ivoryit.com.br pedir algo que nenhum componente existente faz — "preciso de um bloco de depoimentos", "quero uma tabela comparativa", "um carrossel de logos nessa página", "a skill de publicação disse que precisa de componente novo" — ou para mudar o visual de um componente existente. Cria o componente dentro do design system e o registra para as famílias certas.
---

# Novo componente

Componente novo é a única porta para visual novo no site. Ele vira "vocabulário" que qualquer
pessoa usa pelo Claude depois — por isso precisa ser genérico, previsível e documentado.

## 1. Confirmar que não existe

`npx tsx scripts/catalogo.mts` lista tudo o que já existe por família. Se um componente faz
quase o que se quer, prefira **uma prop nova** nele a um componente paralelo.

## 2. Onde criar

| Escopo | Pasta | Registro |
|---|---|---|
| Qualquer família (texto, imagem, botão…) | `src/components/conteudo/` | `basicos` em `src/components/familias/registro.ts` |
| Uma família | `src/components/familias/<familia>/` | `src/components/familias/<familia>/mdx.ts` |
| Uma página única (família `pagina`) | `src/components/paginas/<pagina>/` | `src/components/paginas/<pagina>/mdx.ts` |
| Faixa estrutural comum (capa, formulário, rodapé) | `src/components/blocos/` | usado pelos moldes, não pelo MDX |

## 3. Regras de construção

- **Tokens apenas** (`src/app/globals.css`): `text-azul`, `bg-creme`, `bg-laranja`,
  `text-corpo`, `fundo-ruido`, `container-site`, `texto-rico`, `botao`. Cor ou fonte nova só
  entra como token novo em `@theme`, com justificativa.
- Poppins, itálico nos títulos/botões como no resto do site; container de 1140px.
- Responsivo nos três tamanhos do site: celular (< 768), tablet (`md:`), desktop (`lg:`, ≥ 1025).
- **Server component por padrão**; `"use client"` só para interação (abas, carrossel, hover que
  precisa de estado). Sem bibliotecas pesadas para coisas simples.
- **Props tipadas com JSDoc** em cada prop: é a documentação que a skill de publicação lê.
  Conteúdo entra por props ou `children`, nunca fixo no componente.
- Acessibilidade: imagens com `alt` obrigatório na prop, títulos na hierarquia certa, contraste,
  navegação por teclado em elementos interativos.
- Imagens com `next/image` (use `dimensoesImagem` de `src/lib/imagens.ts` para largura/altura).

## 4. Registrar e exemplificar

1. Exporte no `mdx.ts` certo (tabela acima). Sem isso o build recusa o componente.
2. Use-o em pelo menos uma página (ou crie a página que motivou o pedido) — é daí que o
   catálogo tira o exemplo de uso.
3. Mudou props de um componente existente? `grep -rn "<Nome" content` e ajuste todos os usos.

## 5. Validar

```bash
npm run verificar
npm run dev   # e capture 1440/768/390 com scripts/capturar.mjs
```

Mostre as capturas à pessoa antes de publicar. Componente novo vai num commit separado do
conteúdo (`componente: <nome>`), para facilitar revisão.
