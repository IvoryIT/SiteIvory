# Campos do cabeçalho por família

A fonte da verdade é `src/lib/esquema.ts` (o build recusa cabeçalho inválido). Aqui fica o
"como preencher". Datas no formato `AAAA-MM-DD`. Imagens começam com `/imagens/` (novas) ou
`/wp-content/uploads/` (migradas).

## Campos comuns (todas as famílias)

```yaml
familia: artigo            # artigo | case | setor | solucao | pagina
titulo: "Título visível (H1)"
breadcrumb: "Nome curto no breadcrumb"   # opcional; padrão = titulo
seo:
  titulo: "Até 60 caracteres, palavra-chave no início"
  descricao: "120 a 160 caracteres, sem marcação, dizendo o que o leitor ganha."
  palavraChave: "expressão principal"   # opcional, recomendado
  imagem: /imagens/2026/10/og.webp      # opcional; padrão = capa/imagem da página
  noindex: true                         # opcional; só para página que não deve ir ao Google
publicadoEm: 2026-10-07
atualizadoEm: 2026-10-07                # em alterações
oculta: true                            # opcional; fora de sitemap, llms.txt e listagens
final: contato                          # opcional; topo | contato | contato-sem-area | nenhum
```

`wpId` só existe nas páginas migradas (redirects de `/?p=ID`); não preencha em página nova.

## artigo

```yaml
familia: artigo
titulo: "Título do artigo"
capa: /imagens/2026/10/capa-<slug>.webp          # faixa do topo, 1138x327 (o recorte de "pasta" vem desenhado na imagem)
capaMobile: /imagens/2026/10/capa-<slug>-mobile.webp  # opcional; celular e tablet, ~500x275, sem recorte
cartao:                                           # cartão nas abas do /blog/
  imagem: /imagens/2026/10/cartao-<slug>.webp     # ~362x358, com o fundo do cartão desenhado
  titulo: "Título curto para o cartão"
  rotulo: "Coluna do CEO"                         # opcional, texto pequeno acima do título
  resumo: "Subtítulo do cartão"                   # opcional, texto abaixo do título
  imagemAlt: "Descrição da imagem do cartão"
categorias: [Artigos]                             # abas do /blog/: Artigos | White Papers | E-books
```

Corpo: Markdown com `<Azul>` para destaques e `<Divisor />` entre blocos de assunto (é o padrão
dos artigos atuais: abertura em `<Azul>_**…**_</Azul>`, depois blocos separados por divisor, cada
um começando com um subtítulo em `<Azul>_**…**_</Azul>`). Imagens com `<Imagem src alt />`.
O fecho (Compartilhe + Insights recentes) é automático.

**Listagem do /blog/**: o artigo novo aparece sozinho no topo das abas das `categorias` dele
(os migrados seguem a ordem manual gravada na prop `ordem` de `<BlogListagem>` em
`content/paginas/blog/index.mdx`; artigos fora dessa lista entram antes, do mais recente para o
mais antigo). Para mudar a posição de um artigo, edite essa lista.

**Insights recentes** (faixa no fim de todos os artigos) é fixa em
`content/blocos/insights-recentes.json` (4 itens: caminho, imagem, imagemAlt, rotulo, titulo).
Se o artigo novo deve aparecer ali, pergunte à pessoa e atualize o arquivo.

## case

```yaml
familia: case
titulo: "Conexão Anglo American: Aplicativo corporativo…"   # o trecho até ":" sai em azul negrito na capa
setor: cases-mineracao              # slug do hub do setor
setorTitulo: "Cases de Mineração"   # mostrado acima do case
categoria: Mineração                # aba em /cases-de-sucesso-ivory/
ordem: 10                           # posição do cartão na aba (menor primeiro; padrão 100)
imagem: /imagens/…                  # capa arredondada no topo
imagemAlt: "…"
logo: /imagens/…                    # selo "cliente + Ivory" no canto da capa (opcional)
logoAlt: "logos <cliente> + ivory"
logoLargura: 8.5                    # em em (opcional)
logoCelular: esquerda               # esquerda | centro | oculto
centralizarNoCelular: true          # opcional
cartao:
  imagem: /imagens/…                # cartão no hub geral
  titulo: "Portal de Governança"
  resumo: "Uma ou duas frases; aceita **negrito**."
  tamanhoTitulo: 1.8                # opcional, para títulos longos
final: contato                      # padrão dos cases
```

Corpo (ordem dos cases atuais): `<Faixa fundo="creme">` com a introdução → `<Bloco titulo="O desafio" imagem="…" alt="…">` → `<Faixa>` com
`<Bloco titulo="O que entregamos">`, `<Destaques>` (cada `<Destaque escuro>…</Destaque>` é um cartão; `### 865` vira número
grande), `<Bloco titulo="O impacto">`, `<Bloco titulo="Por que isso importa">` → `<Chamada href="…">frase do botão final</Chamada>`.
Também existem `<TextoImagem>`, `<Lista>`/`<Item>`, `<Depoimento autor cargo>` e `<Letreiro texto>`.
Confirme com a pessoa que o cliente autorizou a publicação antes de criar o case.

## setor

Hub de um setor (`/cases-de-sucesso-ivory/cases-<setor>/`). Campos: `capa`, `capaMobile`, `capaTablet`, `capaTitulo`,
`ordem` (posição nas setas entre setores) e `casosDoHub` (cases sem página própria, com `ancora`). Os cases do setor
entram no corpo com `<CaseDoHub titulo subtitulo imagem alt lado>`; o cartão no hub geral vem do `cartao` de cada case.

## solucao

```yaml
familia: solucao
titulo: "Soluções – Dados"        # nome da página (breadcrumb, llms.txt)
frase: "Transformamos dados em decisões estratégicas."   # H1 na capa; cada linha vira parágrafo
corFrase: clara                   # clara (padrão, texto branco) | escura
larguraFrase: 90                  # % da largura da capa (padrão 90)
capa: /imagens/…                  # desktop
capaMobile: /imagens/…            # celular
capaTablet: /imagens/…            # só se diferente da do celular
capaPosicao: centro               # centro (padrão) | topo — recorte no tablet/celular
cartao:                           # cartão no hub /solucoes/
  titulo: "Dados"
  icone: /imagens/…
  ordem: 3                        # opcional; posição no hub
final: contato                    # padrão das soluções
```

Corpo (na ordem das páginas atuais): `<Introducao icone="…" iconeAlt="…">texto</Introducao>`,
`<QuadroImagem src alt />` (logos de tecnologias), um ou mais `<BlocoServico titulo="…">descrição</BlocoServico>`
seguidos de `<GradeCartoes>` com `<Cartao imagem="…">Título branco</Cartao>` (o primeiro, de destaque)
e `<Cartao>item</Cartao>`; opcionalmente `<ListaServicos>`/`<Servico>`, `<Diferenciais>`/`<Diferencial>`
e `<BannerEbook …/>`. Uma solução nova aparece sozinha no hub `/solucoes/` (pelo `cartao`).

## pagina

```yaml
familia: pagina
capa: /imagens/…            # opcional; sem capa, o topo mostra só o título
capaMobile: /imagens/…      # opcional
tituloCapa: "…"             # opcional; título da capa diferente do titulo
tamanhoTitulo: 2.4          # opcional, em em
semCapa: true               # a página monta o próprio topo no MDX (ex.: home)
semBreadcrumb: true         # opcional
final: topo                 # padrão topo
```

Corpo: seções com `<Secao fundo="padrao|creme|branco" espaco="nenhum|pequeno|medio|grande">`
mais os componentes listados pelo catálogo (`npx tsx scripts/catalogo.mts pagina`).

<!-- As seções de case, setor e solucao são completadas a partir dos moldes migrados. -->
