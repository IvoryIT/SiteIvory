---
name: publicar-conteudo
description: Use para criar, alterar ou remover conteúdo do site ivoryit.com.br (projeto Next.js) — "publica um artigo sobre X", "tem um case novo do cliente Y", "cria a página da solução Z", "troca o texto/imagem da página W", "tira essa página do ar", "atualiza o blog", "coloca essas fotos no case". Conduz do molde da família até o commit/pull request, mantendo o padrão visual e o SEO.
---

# Publicar conteúdo

O site não tem painel de edição: cada página é um arquivo MDX e o padrão visual vem de
componentes prontos. O seu trabalho é **encaixar o conteúdo no molde certo** — nunca inventar
layout. Leia `CLAUDE.md` do projeto se ainda não leu nesta sessão.

## 0. Pré-requisitos (confira uma vez por sessão)

- `node -v` (≥ 20) e `git --version`. Sem `node_modules`: `npm install`.
- `git config user.email` deve ser o e-mail da conta do GitHub que publica (a Vercel confere o
  autor do commit). Se não for, pare e avise a pessoa.
- `git status` limpo; atualize: `git switch main && git pull`.

## 1. Entender o pedido e escolher a família

| Pedido | Família | Onde criar (a pasta é a URL) |
|---|---|---|
| Artigo, coluna, white paper, e-book | `artigo` | `content/paginas/blog/<slug>/index.mdx` |
| Case de cliente | `case` | `content/paginas/case-<setor>-<slug>/index.mdx` |
| Setor novo de cases | `setor` | `content/paginas/cases-de-sucesso-ivory/cases-<setor>/index.mdx` |
| Solução/serviço | `solucao` | `content/paginas/solucoes/solucoes-<area>/index.mdx` |
| Landing, institucional, legal | `pagina` | `content/paginas/<slug>/index.mdx` |

Slug: minúsculas, sem acento, hífens, até ~60 caracteres, com a palavra-chave
(ex.: `ia-na-logistica-de-carga`). Falta informação essencial (texto, cliente, imagens,
autorização para citar o cliente)? Pergunte antes de escrever.

## 2. Partir do molde, não do zero

```bash
npx tsx scripts/catalogo.mts <familia>
```

Mostra os componentes permitidos na família, onde está o código de cada um (leia as props lá)
e um exemplo real de uso. Abra 1–2 páginas da mesma família listadas pelo catálogo e use a mais
parecida como esqueleto. Campos do cabeçalho de cada família: `references/familias.md` e
`src/lib/esquema.ts`.

Regras que o build impõe (não tente contornar):
- Só componentes da lista da família. Nada de `<div>`, `<span>`, `style`, `className`.
- Texto em Markdown; destaque azul com `<Azul>`; `##` para seções (nunca `#`: o H1 é o título).
- No MDX, uma linha que só contém um componente vira bloco, não parágrafo (`<Azul>` é exceção:
  sozinho na linha continua parágrafo). Quebra de linha dentro do parágrafo: termine a linha com
  dois espaços.
- Se o pedido exige algo que nenhum componente faz, **pare** e use a skill `novo-componente`.

## 3. Imagens

```bash
node scripts/imagem.mjs "<arquivo enviado>" <nome-descritivo>
```

Converte para WebP, limita a 1600px e grava em `public/imagens/AAAA/MM/`. Use o caminho que o
script imprimir. Todo `alt` descreve a imagem para quem não a vê (não "imagem", não o nome do
arquivo). Capa e cartão de artigo/case seguem as proporções das páginas existentes — compare
`largura x altura` com as de uma página da mesma família.

## 4. SEO e versão para agentes

- `seo.titulo`: até 60 caracteres, palavra-chave no início, sem "| Ivory" duplicado.
- `seo.descricao`: 120–160 caracteres, diz o que o leitor ganha, sem marcação.
- `seo.palavraChave`: a expressão principal; aparece no primeiro parágrafo e num `##`.
- Pelo menos um link interno para solução, case ou artigo relacionado (com barra final).
- `publicadoEm` = hoje (AAAA-MM-DD) em página nova; em alteração, só `atualizadoEm` = hoje.
- Escreva `agentes.md` na mesma pasta: `# Título`, um parágrafo de resumo objetivo e as seções
  principais em Markdown limpo (sem componentes). É o que agentes de IA e o `/llms.txt` leem.

## 5. Verificar

Ao salvar, o hook do projeto já roda `npm run verificar` na página: **erros precisam ser
corrigidos**; avisos são recomendações (resolva os que forem fáceis). Depois:

```bash
npm run dev            # http://localhost:3000/<caminho>/
node scripts/capturar.mjs http://localhost:3000 .tmp/previa --lista <arquivo-com-o-caminho>
```

Abra as capturas `-1440` e `-390` com Read e confira com a pessoa: título, imagens, quebras de
linha no celular, cartão aparecendo na listagem (blog/hub). Ajuste antes de seguir.

## 6. Publicar

```bash
git switch -c conteudo/<slug>
git add content/paginas/<pasta> public/imagens
git commit -m "conteudo: <o que foi publicado>"
```

O commit dispara dois hooks: verificação de todas as páginas e revisão de SEO feita pelo Claude
com a rubrica do site. Se bloquear, corrija o que o motivo indicar e faça o commit de novo —
nunca use `--no-verify`. Depois: `git push -u origin conteudo/<slug>` e abra o PR
(`gh pr create`); a Vercel comenta o link de prévia. Mostre o link, e só faça o merge quando a
pessoa aprovar. (Se o repositório remoto ou a Vercel ainda não estiverem configurados, pare no
commit e diga isso.)

## Alterar ou remover

- **Alterar**: localize o arquivo pela URL (`content/paginas/<url>/index.mdx`), mude só o que foi
  pedido, atualize `atualizadoEm` e o `agentes.md` se o sentido mudou.
- **Remover**: apague a pasta, adicione redirect 301 em `src/data/redirects.json` para a página
  mais próxima (nunca deixe 404) e procure links que apontavam para ela:
  `grep -rn "/<url-antiga>/" content`. Imagens só saem se nenhuma outra página as usa.
- **Mudar URL**: mova a pasta e adicione o redirect da URL antiga para a nova.

## Nunca

Editar componentes, estilos ou `globals.css` nesta skill; publicar com ERRO; usar cor, fonte ou
tamanho fora dos componentes; publicar nome de cliente sem confirmação de que pode.
