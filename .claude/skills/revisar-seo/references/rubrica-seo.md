# Rubrica de SEO do site ivoryit.com.br

Usada pela skill `revisar-seo` e pelo hook de revisão antes do commit. As regras mecânicas
(tamanhos, links, imagens, H1, componentes) já são checadas por `npm run verificar`; esta
rubrica cobre o que exige leitura e julgamento.

Público do site: decisores de TI e de negócio de médias e grandes empresas brasileiras
(logística, mineração, indústria, energia, construção, educação). Posicionamento:
"Desenvolvimento de software com IA agêntica no Brasil para automatizar processos, integrar
sistemas e impulsionar o crescimento das empresas."

## GRAVE (bloqueia a publicação)

1. **Título SEO ou descrição que não correspondem ao conteúdo** da página (promessa que o texto
   não cumpre, assunto diferente, texto de outra página copiado).
2. **Título SEO genérico** que não diz do que a página trata ("Novo artigo", "Case", "Página").
3. **Conteúdo duplicado**: o corpo repete outra página do site quase por inteiro.
4. **Dado sensível ou indevido** no texto: nome de cliente que não autorizou (quando o texto
   indica sigilo), dado pessoal, preço/contrato interno, credencial.
5. **Erro factual evidente** ou afirmação jurídica arriscada apresentada como certa.
6. **Português com erros que comprometem a credibilidade** (vários erros de grafia ou
   concordância no título, na descrição ou no primeiro parágrafo).
7. **`agentes.md` que contradiz a página** ou descreve outra coisa.

## IMPORTANTE (recomendar, não bloqueia)

- Palavra-chave principal ausente do título SEO, do primeiro parágrafo ou de um `##`.
- Descrição sem chamada clara (o que o leitor ganha ao clicar).
- Primeiro parágrafo que não responde logo "do que se trata e para quem".
- Seções longas sem `##` (parede de texto); listas que deveriam ser listas.
- Nenhum link interno para soluções, cases ou artigos relacionados; texto de link vago
  ("clique aqui", "saiba mais").
- Texto alternativo de imagem que não descreve a imagem ("imagem", "foto", nome de arquivo).
- Artigo sem fechamento com próximo passo (contato, solução relacionada).
- Termos em inglês sem explicação na primeira ocorrência quando o público pode não conhecer.

## OBSERVAÇÃO (só mencionar se houver tempo)

- Oportunidades de dados estruturados adicionais (FAQ, HowTo) quando o texto já tem o formato.
- Título SEO que poderia ser mais específico com número, setor ou resultado.

## Como reportar

Para cada página: uma linha de veredito (ok / ajustar / bloquear) e os itens em ordem de impacto,
cada um com o trecho atual e a sugestão concreta de texto. Não reescreva a página inteira.
