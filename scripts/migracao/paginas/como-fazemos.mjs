// Conversão da "Como fazemos" (WordPress 5451) para content/paginas/como-fazemos/index.mdx.
// Estrutura no Elementor (ids dos contêineres de topo):
//   4e093ac  capa (breadcrumb + faixa com imagem e título)       -> frontmatter capa/capaMobile
//   3a420f9  abertura em duas colunas                           -> <ComoFazemosIntro>
//   46fe8ba  "Processo / Agentic AI — Inovação Agêntica"        -> <ComoFazemosChamada>
//   1274e29  etapas com linha tracejada (rolagem horizontal)    -> <ComoFazemosEtapas>
//   3a1125b  números em degradê + botão                         -> <ComoFazemosIndicadores>
//   22823f5  "Modelos de Entrega"                               -> <ComoFazemosModelos>
//   4af9a90  bloco azul "Qualidade não é etapa"                 -> <ComoFazemosQualidade>
//   7ec5466  "Capacidades…" (#expertises)                       -> <ComoFazemosCapacidades>
//   a9e58d5  formulário (template 5859, sem área)               -> final: contato-sem-area
import { attr, caminhoMidia, encontrar, encontrarTodos, ehContainer, ehWidget, estiloTituloCapa, ocultoSempre, tamanho, textoPuro } from "../lib/wp.mjs";

export const caminhos = ["/como-fazemos/"];

const ZWSP = /[​﻿]/g;
const QUEBRA = "QQQUEBRAQQQ";

export function converter(p, ctx) {
  const avisos = [];
  const porId = (id) => {
    const no = encontrar(p.elementor, (n) => n.id === id);
    if (!no) avisos.push(`elemento ${id} não encontrado na árvore do Elementor`);
    return no;
  };
  const editor = (id) => porId(id)?.settings?.editor ?? "";
  const md = (html) => ctx.htmlParaMd(String(html ?? "").replace(ZWSP, "")).trim();
  /** Texto de uma linha em Markdown inline (para títulos); <br> vira <br />, já que a quebra do Markdown terminaria o título. */
  const inline = (html) => {
    const interno = String(html ?? "").replace(/^\s*<(h[1-6]|p)[^>]*>([\s\S]*)<\/\1>\s*$/i, "$2").replace(/<br\s*\/?>/gi, QUEBRA);
    return md(`<p>${interno}</p>`).replace(/\s*\n+\s*/g, " ").replace(/[ \t]*QQQUEBRAQQQ[ \t]*/g, "<br />");
  };
  const titulo = (html, nivel = 2) => `${"#".repeat(nivel)} ${inline(html)}`;
  const texto = (html) => textoPuro(String(html ?? "").replace(ZWSP, ""));
  const imagem = (url) => ctx.registrarImagem(caminhoMidia(url));
  const link = (url) => ctx.resolverLink(url);
  const novaAba = (no) => /\babrir-outra-aba\b/.test(`${no?.settings?._css_classes ?? ""} ${no?.settings?.css_classes ?? ""}`) || Boolean(no?.settings?.link?.is_external);
  const confereLink = (destino, onde) => {
    if (/^(#|mailto:|tel:|https?:)/.test(destino)) return;
    const caminho = destino.replace(/[?#].*$/, "");
    if (!ctx.wp.paginas.some((pg) => pg.caminho === caminho)) avisos.push(`${onde}: o link ${destino} não leva a uma página publicada (404 para o visitante)`);
  };
  const botao = (no, variante, extra = "") => {
    const s = no.settings;
    const href = link(s.link?.url);
    confereLink(href, `botão "${texto(s.text)}"`);
    const compacto = /padding-top:\s*0\.5em/.test(s.custom_css ?? "") && variante !== "branco";
    const props = [`href="${attr(href)}"`, variante !== "contorno" ? `variante="${variante}"` : "", novaAba(no) ? "novaAba" : "", compacto ? "compacto" : "", s._element_id ? `id="${attr(s._element_id)}"` : "", extra]
      .filter(Boolean)
      .join(" ");
    return `<BotaoIvory ${props}>${texto(s.text)}</BotaoIvory>`;
  };
  const widgets = (no, tipo) => encontrarTodos(no?.elements, (n) => ehWidget(n, tipo) && !ocultoSempre(n));
  const blocos = [];

  // ------------------------------------------------------------------ capa (frontmatter)
  const faixa = porId("4d48f8f");
  const capa = imagem(faixa?.settings?.background_image?.url);
  const capaMobile = imagem(faixa?.settings?.background_image_mobile?.url || faixa?.settings?.background_image_tablet?.url);
  const tituloCapaNo = porId("824d11e");
  const tamanhoTitulo = tamanho(tituloCapaNo?.settings?.typography_font_size);

  // ------------------------------------------------------------------ abertura
  {
    const botoes = widgets(porId("168d89f"), "button").map((b) => botao(b, "azul"));
    blocos.push(["<ComoFazemosIntro>", titulo(editor("ce83ee6")), md(editor("c4602b1")), ...botoes, "</ComoFazemosIntro>"].join("\n\n"));
  }

  // ------------------------------------------------------------------ chamada do processo
  blocos.push([`<ComoFazemosChamada etiqueta="${attr(texto(editor("1e69781")))}">`, titulo(editor("8135fad")), md(editor("ed9af9c")), "</ComoFazemosChamada>"].join("\n\n"));

  // ------------------------------------------------------------------ etapas
  {
    const linha = porId("3514ca5");
    const etapas = (linha?.elements ?? []).filter((n) => ehContainer(n) && !ocultoSempre(n)).map((c) => {
      const [nome, descricao] = widgets(c, "text-editor");
      const icone = imagem(widgets(c, "image")[0]?.settings?.image?.url);
      return [`<ComoFazemosEtapa icone="${attr(icone)}" titulo="${attr(texto(nome?.settings?.editor))}">`, md(descricao?.settings?.editor), "</ComoFazemosEtapa>"].join("\n");
    });
    blocos.push(["<ComoFazemosEtapas>", etapas.join("\n\n"), "</ComoFazemosEtapas>"].join("\n\n"));
  }

  // ------------------------------------------------------------------ indicadores
  {
    const caixa = porId("acf2235");
    const itens = (caixa?.elements ?? []).filter(ehContainer).map((c) => {
      const [valor, legenda] = widgets(c, "text-editor");
      return `<ComoFazemosIndicador valor="${attr(texto(valor?.settings?.editor))}">${texto(legenda?.settings?.editor)}</ComoFazemosIndicador>`;
    });
    blocos.push(["<ComoFazemosIndicadores>", itens.join("\n"), botao(porId("cafb105"), "azul"), "</ComoFazemosIndicadores>"].join("\n\n"));
  }

  // ------------------------------------------------------------------ modelos de entrega
  {
    const cartoes = (porId("9e392df")?.elements ?? []).filter((n) => ehContainer(n) && !ocultoSempre(n)).map((c) => {
      const [rotulo, nome, descricao, lista, rotuloQuando, quando] = widgets(c, "text-editor");
      const s = c.settings;
      const fundo = imagem(s.background_image?.url);
      const props = [
        `rotulo="${attr(texto(rotulo?.settings?.editor))}"`,
        `titulo="${attr(texto(nome?.settings?.editor))}"`,
        fundo ? `fundo="${attr(fundo)}"` : "",
        fundo && /right/.test(s.background_position ?? "") ? 'fundoPosicao="direita"' : "",
        `rotuloQuando="${attr(texto(rotuloQuando?.settings?.editor))}"`,
        `quando="${attr(texto(quando?.settings?.editor))}"`,
      ].filter(Boolean);
      return [`<ComoFazemosModelo ${props.join(" ")}>`, md(descricao?.settings?.editor), md(lista?.settings?.editor), "</ComoFazemosModelo>"].join("\n\n");
    });
    blocos.push(["<ComoFazemosModelos>", titulo(editor("6791a8b")), md(editor("5db3514")), cartoes.join("\n\n"), "</ComoFazemosModelos>"].join("\n\n"));
  }

  // ------------------------------------------------------------------ qualidade (bloco azul)
  {
    const clientes = widgets(porId("cdabafc"), "button").map((b) => {
      const href = link(b.settings.link?.url);
      confereLink(href, `cliente "${texto(b.settings.text)}"`);
      return `<ComoFazemosCliente href="${attr(href)}"${novaAba(b) ? " novaAba" : ""}>${texto(b.settings.text)}</ComoFazemosCliente>`;
    });
    const casas = encontrarTodos(porId("32df2ce")?.elements, (n) => ehContainer(n) && !(n.elements ?? []).some(ehContainer) && !ocultoSempre(n));
    const pilares = casas.map((c) => {
      const botoes = widgets(c, "button");
      if (botoes.length) return botoes.map((b) => botao(b, "branco")).join("\n\n");
      const [nome, corpo] = widgets(c, "text-editor");
      return ["<ComoFazemosPilar>", titulo(nome?.settings?.editor, 3), md(corpo?.settings?.editor), "</ComoFazemosPilar>"].join("\n\n");
    });
    blocos.push(
      [
        `<ComoFazemosQualidade etiqueta="${attr(texto(editor("64448e7")))}" tituloClientes="${attr(texto(editor("8513b59")))}">`,
        titulo(editor("6b4d7e8")),
        md(editor("345df5a")),
        clientes.join("\n"),
        pilares.join("\n\n"),
        "</ComoFazemosQualidade>",
      ].join("\n\n"),
    );
  }

  // ------------------------------------------------------------------ capacidades
  {
    const secao = porId("7ec5466");
    const cartoes = encontrarTodos(porId("ab548da")?.elements, (n) => ehContainer(n) && n.settings?.background_image?.url && !ocultoSempre(n));
    const fundo = imagem(cartoes[0]?.settings?.background_image?.url);
    const itens = cartoes.map((c) => {
      const [nome, lista] = widgets(c, "text-editor");
      return [`<ComoFazemosCapacidade titulo="${attr(texto(nome?.settings?.editor))}">`, md(lista?.settings?.editor), "</ComoFazemosCapacidade>"].join("\n");
    });
    const id = secao?.settings?._element_id;
    blocos.push([`<ComoFazemosCapacidades${id ? ` id="${attr(id)}"` : ""}${fundo ? ` fundo="${attr(fundo)}"` : ""}>`, titulo(editor("d1082cc")), itens.join("\n\n"), "</ComoFazemosCapacidades>"].join("\n\n"));
  }

  // ------------------------------------------------------------------ fecho
  const template = encontrar(p.elementor, (n) => ehWidget(n, "template"));
  const idTemplate = Number(template?.settings?.template_id);
  const final = idTemplate === 5859 ? "contato-sem-area" : idTemplate === 2415 ? "contato" : "topo";

  return {
    familia: "pagina",
    frontmatter: {
      familia: "pagina",
      titulo: p.titulo,
      tituloCapa: texto(tituloCapaNo?.settings?.editor) !== p.titulo ? texto(tituloCapaNo?.settings?.editor) : undefined,
      capa,
      capaMobile: capaMobile !== capa ? capaMobile : undefined,
      ...(tamanhoTitulo?.unidade === "em" && tamanhoTitulo.valor !== 2.4 ? { tamanhoTitulo: tamanhoTitulo.valor } : {}),
      capaTitulo: estiloTituloCapa(tituloCapaNo),
      final,
    },
    corpo: blocos.join("\n\n"),
    avisos,
  };
}
