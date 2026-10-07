// Conversão da família "setor" (8 hubs /cases-de-sucesso-ivory/cases-<setor>/).
// Estrutura no Elementor: [capa: breadcrumbs + imagem com o nome do setor] [uma faixa por case:
// abertura (imagem + título/subtítulo/texto), tópicos (título + texto, cartões, depoimento,
// imagem ao lado) e o botão de chamada] [setas para o setor anterior/próximo] [formulário].
// As setas viram a `ordem` do setor (a navegação é montada pelo molde a partir dela).
import { attr, caminhoMidia, ehContainer, ehWidget, encontrar, encontrarTodos, estiloTituloCapa, fundoDe, ocultoSempre, textoPuro } from "../lib/wp.mjs";
import { blocoParaMdx, cartoesDoHub, converterBloco, cor, ehGrupoDeCartoes, ehTitulo, filhos, md, num, tam, topoPx, topoPxCelular } from "./case.mjs";

const SETAS = /Group-31[23]\.png/;

function ehNavegacao(no) {
  const imgs = encontrarTodos([no], (n) => ehWidget(n, "image"));
  return imgs.length === 2 && imgs.every((i) => SETAS.test(i.settings.image?.url ?? ""));
}

function proximoDe(p) {
  const img = encontrarTodos(p.elementor, (n) => ehWidget(n, "image") && /Group-312\.png/.test(n.settings.image?.url ?? ""))[0];
  return img?.settings?.link?.url;
}

let ordemCache;
/** Ordem circular dos hubs, seguindo a seta "próximo" a partir do hub mais antigo. */
function ordemDosSetores(ctx) {
  if (ordemCache) return ordemCache;
  const hubs = ctx.wp.paginas.filter((x) => x.caminho.startsWith("/cases-de-sucesso-ivory/") && x.caminho !== "/cases-de-sucesso-ivory/");
  const porCaminho = new Map(hubs.map((h) => [h.caminho, h]));
  ordemCache = new Map();
  let atual = [...hubs].sort((a, b) => a.id - b.id)[0];
  for (let i = 1; atual && !ordemCache.has(atual.caminho); i++) {
    ordemCache.set(atual.caminho, i);
    atual = porCaminho.get(ctx.resolverLink(proximoDe(atual) ?? ""));
  }
  let extra = ordemCache.size;
  for (const h of hubs) if (!ordemCache.has(h.caminho)) ordemCache.set(h.caminho, ++extra);
  return ordemCache;
}

// ------------------------------------------------------------------ componentes do hub
function ehDepoimentoHub(no) {
  const textos = filhos(no).filter((f) => ehWidget(f, "text-editor"));
  return ehContainer(no) && cor(no.settings) === "#FFFFFF70" && textos.length === 2 && textos.length === filhos(no).length && textPuroTem(textos[1], "|");
}
const textPuroTem = (n, s) => textoPuro(n.settings.editor).includes(s);

function converterDepoimentoHub(no, ctx) {
  const [citacao, autorNo] = filhos(no);
  const [autor, cargo] = textoPuro(autorNo.settings.editor)
    .replace(/[​]/g, "")
    .split("|")
    .map((x) => x.trim());
  const texto = md(ctx, citacao.settings.editor).replace(/[​]/g, "");
  return `<Depoimento autor="${attr(autor)}"${cargo ? ` cargo="${attr(cargo)}"` : ""}>\n${texto}\n</Depoimento>`;
}

const opcoesHub = { detectores: [[ehDepoimentoHub, converterDepoimentoHub]], tamanhoCartao: 1, hub: true };

const soImagem = (no) => ehContainer(no) && filhos(no).length === 1 && ehWidget(filhos(no)[0], "image");

/** Abertura do case: linha com uma coluna de imagem e outra com o título de 2.6em. */
function ehAbertura(no) {
  return ehContainer(no) && Boolean(encontrar(filhos(no), (n) => ehWidget(n, "text-editor") && tam(n.settings) === 2.6));
}

function converterAbertura(no, ctx, avisos) {
  const colunas = filhos(no).filter(ehContainer);
  const colImagem = colunas.find(soImagem);
  const textos = encontrarTodos(
    colunas.filter((c) => c !== colImagem),
    (n) => ehWidget(n, "text-editor"),
  );
  const titulos = [];
  let subtitulo;
  const corpo = [];
  for (const t of textos) {
    const s = t.settings ?? {};
    if (tam(s) === 2.6 && !corpo.length && !subtitulo) titulos.push(textoPuro(s.editor));
    else if (tam(s) === 1.2 && String(s.text_color ?? "").toUpperCase() === "#003D5B" && !subtitulo && !corpo.length) subtitulo = textoPuro(s.editor);
    else if (ehTitulo(t)) corpo.push(`### ${textoPuro(s.editor)}`);
    else corpo.push(md(ctx, s.editor));
  }
  const props = [`titulo=${titulos.length > 1 ? `{${JSON.stringify(titulos.join("\n"))}}` : `"${attr(titulos[0])}"`}`];
  if (subtitulo) props.push(`subtitulo="${attr(subtitulo)}"`);
  const tituloNo = textos.find((t) => tam(t.settings) === 2.6);
  const tt = tam(tituloNo?.settings, "typography_font_size_tablet");
  const tc = tam(tituloNo?.settings, "typography_font_size_mobile");
  if (tt && tt !== 2.6) props.push(`tamanhoTituloTablet={${num(tt)}}`);
  if (tc && tc !== 1.8) props.push(`tamanhoTituloCelular={${num(tc)}}`);
  if (colImagem) {
    const img = filhos(colImagem)[0];
    const src = ctx.registrarImagem(caminhoMidia(img.settings.image?.url));
    const alt = img.settings.image?.alt || ctx.altDe(src) || `Imagem do case ${titulos.join(" ").replace(/:$/, "")}`;
    props.push(`imagem="${attr(src)}"`, `alt="${attr(alt)}"`);
    if (colunas.indexOf(colImagem) > 0) props.push(`lado="direita"`);
    const largura = tam(img.settings, "space");
    if (largura) props.push(`larguraImagem={${num(largura)}}`);
    const larguraTablet = tam(img.settings, "space_tablet");
    if (largura && larguraTablet && larguraTablet !== largura) props.push(`larguraImagemTablet={${num(larguraTablet)}}`);
    if (colImagem.settings?.flex_align_items === "center") props.push("centralizarImagem");
    const pi = img.settings._padding;
    if (pi && Number(pi.left) > 0) props.push(`recuo="esquerda"`);
    else if (pi && Number(pi.right) > 0) props.push(`recuo="direita"`);
  } else avisos.push(`abertura sem imagem: ${titulos[0]}`);
  const acima = Math.round(topoPx(no.settings));
  if (acima) props.push(`espacoAcima={${acima}}`);
  return `<CaseDoHub ${props.join(" ")}>${corpo.length ? `\n\n${corpo.join("\n\n")}\n\n` : ""}</CaseDoHub>`;
}

function ehBotao(no) {
  const ws = encontrarTodos([no], (n) => ehWidget(n));
  return ws.length === 1 && ehWidget(ws[0], "button");
}

function converterChamadaHub(no, ctx) {
  const s = encontrar([no], (n) => ehWidget(n, "button")).settings;
  const t = tam(s);
  return `<Chamada href="${attr(ctx.resolverLink(s.link?.url || "#"))}"${t && t !== 1.4 ? ` tamanho={${num(t)}}` : ""}>${textoPuro(s.text)}</Chamada>`;
}

/** Linha de tópico: uma coluna de conteúdo e, às vezes, uma coluna só com imagem (vira `imagem` do bloco). */
function converterLinha(no, ctx, avisos, tituloCase) {
  const colunas = filhos(no).filter(ehContainer);
  const colImagem = colunas.length === 2 ? colunas.find(soImagem) : undefined;
  const conteudo = colImagem ? colunas.find((c) => c !== colImagem) : colunas.length === 1 && !filhos(no).some((f) => ehWidget(f)) ? colunas[0] : no;
  // Linha só de cartões: o espaço de cima já vem do <Destaques> (1em), conta só a margem.
  const soMargem = (n) => topoPx({ margin: n.settings?.margin });
  const acima = conteudo === no && ehGrupoDeCartoes(no) ? soMargem(no) : topoPx(no.settings) + (conteudo !== no ? topoPx(conteudo.settings) : 0);
  const acimaCelular = conteudo === no && ehGrupoDeCartoes(no) ? undefined : topoPxCelular(no.settings) + (conteudo !== no ? topoPxCelular(conteudo.settings) : 0);
  const blocos = converterBloco(conteudo, ctx, false, acima, avisos, opcoesHub);
  blocos[0].acimaCelular = acimaCelular;
  if (colImagem) {
    const img = filhos(colImagem)[0];
    const src = ctx.registrarImagem(caminhoMidia(img.settings.image?.url));
    blocos[0].imagem = { src, alt: img.settings.image?.alt || ctx.altDe(src) || `Ilustração do case ${tituloCase}` };
  }
  return blocos.map((b) => {
    const mdx = blocoParaMdx(b);
    return b.imagem ? mdx.replace(/^<Bloco/, `<Bloco imagem="${attr(b.imagem.src)}" alt="${attr(b.imagem.alt)}"`) : mdx;
  });
}

function converterSecao(no, ctx, avisos) {
  const s = no.settings ?? {};
  const id = s._element_id || encontrar(filhos(no), (n) => ehContainer(n) && n.settings?._element_id)?.settings?._element_id;
  const topo = s.padding?.top !== "" && s.padding?.top != null ? Number(s.padding.top) : 4;
  const espaco = topo >= 5 ? "amplo" : topo <= 2 ? "colado" : "medio";
  const partes = [];
  const tituloNo = encontrar([no], (n) => ehWidget(n, "text-editor") && tam(n.settings) === 2.6);
  const tituloCase = tituloNo ? textoPuro(tituloNo.settings.editor).replace(/:$/, "") : "";
  for (const linha of filhos(no)) {
    if (ehWidget(linha)) {
      avisos.push(`widget solto na faixa: ${linha.widgetType}`);
      continue;
    }
    if (ehBotao(linha)) partes.push(converterChamadaHub(linha, ctx));
    else if (ehAbertura(linha)) partes.push(converterAbertura(linha, ctx, avisos));
    else partes.push(...converterLinha(linha, ctx, avisos, tituloCase));
  }
  const props = [id ? `id="${attr(id)}"` : "", `espaco="${espaco}"`, cor(s) === "#FFEEC2" ? `fundo="creme"` : ""].filter(Boolean);
  return `<Faixa${props.length ? " " + props.join(" ") : ""}>\n\n${partes.join("\n\n")}\n\n</Faixa>`;
}

// ------------------------------------------------------------------- cases sem página
/** Cartões de /cases-de-sucesso-ivory/ que apontam para um case sem página, mas que existe no hub. */
function casosDoHub(p, ctx) {
  const existentes = new Set(ctx.wp.paginas.map((x) => x.caminho));
  const casos = [];
  for (const [destino, card] of cartoesDoHub(ctx)) {
    // Cartão de case com página própria; os demais (ex.: "Ápia APP", cujo link do WordPress dá 404
    // ou cai no hub) viram case do hub, com o cartão apontando para a âncora dele.
    if (/^\/case-/.test(destino) && existentes.has(destino)) continue;
    // Procura o título curto do cartão (sem "APP", "2.0"…) numa abertura deste hub.
    const chave = card.cartao.titulo.split(" ")[0].toLowerCase();
    const secao = filhos({ elements: p.elementor }).find((sec) =>
      encontrar([sec], (n) => ehWidget(n, "text-editor") && tam(n.settings) === 2.6 && textoPuro(n.settings.editor).toLowerCase().startsWith(chave)),
    );
    if (!secao) continue;
    const ancora = secao.settings?._element_id || encontrar(filhos(secao), (n) => ehContainer(n) && n.settings?._element_id)?.settings?._element_id;
    if (!ancora) continue;
    casos.push({ ...card.cartao, categoria: card.categoria, ordem: card.ordem, ancora });
  }
  return casos;
}

// ---------------------------------------------------------------------- converter
export function converter(p, ctx) {
  const avisos = [];
  const nos = p.elementor.filter((n) => !ocultoSempre(n));
  const [cabecalho, ...resto] = nos;
  const caixa = encontrar([cabecalho], (n) => ehContainer(n) && fundoDe(n));
  const capa = ctx.registrarImagem(caminhoMidia(fundoDe(caixa)));
  const capaMobile = ctx.registrarImagem(caminhoMidia(fundoDe(caixa, "_mobile") ?? fundoDe(caixa, "_tablet")));
  const capaTablet = ctx.registrarImagem(caminhoMidia(fundoDe(caixa, "_tablet")));
  const tituloNo = encontrar([caixa], (n) => ehWidget(n, "text-editor"));
  const titulo = textoPuro(tituloNo.settings.editor);

  const corpo = [];
  let final = "contato";
  for (const no of resto) {
    const tpl = encontrar([no], (n) => ehWidget(n, "template"));
    if (tpl) {
      const id = Number(tpl.settings.template_id);
      final = id === 5859 ? "contato-sem-area" : id === 2421 ? "topo" : "contato";
      continue;
    }
    if (ehNavegacao(no)) {
      // Setas montadas pelo molde (NavegacaoSetores); só garante a cópia das imagens.
      for (const i of encontrarTodos([no], (n) => ehWidget(n, "image"))) ctx.registrarImagem(caminhoMidia(i.settings.image.url));
      continue;
    }
    corpo.push(converterSecao(no, ctx, avisos));
  }

  return {
    familia: "setor",
    frontmatter: {
      familia: "setor",
      titulo,
      capa,
      capaMobile: capaMobile !== capa ? capaMobile : undefined,
      capaTablet: capaTablet && capaTablet !== capaMobile ? capaTablet : undefined,
      capaTitulo: estiloTituloCapa(tituloNo),
      ordem: ordemDosSetores(ctx).get(p.caminho),
      ...(final !== "contato" ? { final } : {}),
      casosDoHub: casosDoHub(p, ctx),
    },
    corpo: corpo.join("\n\n"),
    avisos,
  };
}
