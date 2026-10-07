// Conversão da família "case" (18 páginas /case-*/).
// Estrutura no Elementor (modelo "novo modelo cases", id 6815):
//   [cabeçalho: breadcrumbs + "Cases de X"] [capa: imagem com selo de logos + título]
//   [faixas de conteúdo: blocos com título, texto, texto+imagem, cartões, lista, depoimento]
//   [letreiro azul (opcional)] [botão de chamada] [template 2415 = formulário com área]
// O cartão do case (imagem, título, resumo, aba e ordem) vem da página /cases-de-sucesso-ivory/.
import { attr, caminhoMidia, ehContainer, ehWidget, encontrar, encontrarTodos, fundoDe, ocultoSempre, textoPuro } from "../lib/wp.mjs";

const AZUL = "#003D5B";
const CLARO = "#FFFFFF54";

export const tam = (s, chave = "typography_font_size") => {
  const c = s?.[chave];
  return c && c.size !== "" && c.size != null && c.unit === "em" ? Number(c.size) : undefined;
};
const pad = (s, lado, chave = "padding") => {
  const c = s?.[chave];
  return c && c[lado] !== "" && c[lado] != null ? { valor: Number(c[lado]), unidade: c.unit } : undefined;
};
export const filhos = (no) => (no.elements ?? []).filter((n) => !ocultoSempre(n));
const temBorda = (s) => s?.border_border === "solid";
export const cor = (s) => String(s?.background_color ?? "").toUpperCase();

/** Título de bloco: editor de texto de 1.4em em azul (h3 nos cases, parágrafo nos hubs). */
export function ehTitulo(no) {
  const s = no.settings ?? {};
  return ehWidget(no, "text-editor") && tam(s) === 1.4 && String(s.text_color ?? "").toUpperCase() === AZUL;
}

export function ehCartao(no) {
  return ehContainer(no) && [AZUL, CLARO, "#FFFFFF70"].includes(cor(no.settings)) && filhos(no).some((f) => ehWidget(f, "text-editor") || ehContainer(f));
}

/** Item de lista: container com borda azul de 1px. */
function ehItemLista(no) {
  const s = no.settings ?? {};
  return ehContainer(no) && temBorda(s) && String(s.border_color ?? "").toUpperCase() === AZUL && !cor(s);
}

function linhasDeCartoes(no) {
  // Wrapper (margem 1em 0 2em) > linhas (row) > cartões; ou a própria linha.
  const linhas = [];
  const visitar = (n) => {
    const fs = filhos(n);
    if (fs.length && fs.every(ehCartao)) {
      fs.linha = n; // container da linha (para ler o espaçamento)
      linhas.push(fs);
    } else fs.filter(ehContainer).forEach(visitar);
  };
  visitar(no);
  return linhas;
}

export function ehGrupoDeCartoes(no) {
  if (!ehContainer(no)) return false;
  const linhas = linhasDeCartoes(no);
  if (!linhas.length) return false;
  // Nada além de containers até os cartões.
  return encontrarTodos(filhos(no), (n) => ehWidget(n) && !linhas.flat().some((c) => encontrar([c], (x) => x === n))).length === 0;
}

/** Linha com uma coluna de cartões e outra só com uma imagem. */
function ehCartoesComImagem(no) {
  const fs = filhos(no);
  return ehContainer(no) && fs.length === 2 && fs.some(ehGrupoDeCartoes) && fs.some((f) => ehContainer(f) && filhos(f).length === 1 && ehWidget(filhos(f)[0], "image"));
}

function converterCartoesComImagem(no, ctx, tamanhoPadrao, hub) {
  const fs = filhos(no);
  const cartoes = fs.find(ehGrupoDeCartoes);
  const img = filhos(fs.find((f) => f !== cartoes))[0];
  const src = ctx.registrarImagem(caminhoMidia(img.settings.image?.url));
  const mdx = converterCartoes(cartoes, ctx, tamanhoPadrao, hub);
  return mdx.replace(/^<Destaques/, `<Destaques imagem="${attr(src)}" alt="${attr(img.settings.image?.alt || ctx.altDe(src) || "")}"`);
}

export function ehLista(no) {
  return ehContainer(no) && encontrarTodos(filhos(no), ehItemLista).length >= 2 && !filhos(no).some((f) => ehWidget(f));
}

export function ehDepoimento(no) {
  const s = no.settings ?? {};
  return ehContainer(no) && temBorda(s) && !s.border_color && filhos(no).length === 1 && ehWidget(filhos(no)[0], "text-editor");
}

export function ehTextoImagem(no) {
  if (!ehContainer(no) || no.settings?.flex_direction !== "row") return false;
  const fs = filhos(no);
  return fs.length >= 1 && fs.length <= 2 && fs.every((f) => ehWidget(f, "text-editor") || ehWidget(f, "image")) && fs.some((f) => ehWidget(f, "text-editor"));
}

/** Markdown do editor de texto, pronto para ir dentro de um componente. */
export function md(ctx, html) {
  return ctx.htmlParaMd(html).trim();
}

export function num(v) {
  return Number.isInteger(v) ? String(v) : String(Number(v.toFixed(2)));
}

// ------------------------------------------------------------------ componentes
export function converterTextoImagem(no, ctx) {
  const fs = filhos(no);
  const texto = fs.find((f) => ehWidget(f, "text-editor"));
  const img = fs.find((f) => ehWidget(f, "image"));
  const t = tam(texto.settings) ?? 1.1;
  const props = [];
  if (img) {
    const src = ctx.registrarImagem(caminhoMidia(img.settings.image?.url));
    props.push(`imagem="${attr(src)}"`, `alt="${attr(img.settings.image?.alt || ctx.altDe(src) || "")}"`);
    const imagemAntes = fs.indexOf(img) < fs.indexOf(texto);
    const lado = img.settings._flex_order === "end" || !imagemAntes ? "direita" : "esquerda";
    if (lado !== "direita") props.push(`lado="${lado}"`);
  }
  if (t !== 1.2) props.push(`tamanho={${num(t)}}`);
  return `<TextoImagem${props.length ? " " + props.join(" ") : ""}>\n${md(ctx, texto.settings.editor)}\n</TextoImagem>`;
}

export function converterCartao(c, ctx) {
  const s = c.settings ?? {};
  const escuro = cor(s) === AZUL;
  const textos = encontrarTodos(filhos(c), (n) => ehWidget(n, "text-editor"));
  const html = textos.map((t) => t.settings.editor).join("");
  const textoEscuro = !escuro && /color:\s*#242424/i.test(html);
  let corpo;
  if (textos.length >= 2) {
    // Cartão com título grande + texto menor (ex.: Digital CD).
    const titulo = textos[0].settings.editor
      .split(/<\/p>\s*<p>/i)
      .map((parte) => textoPuro(parte))
      .filter(Boolean)
      .join("<br />");
    corpo = `### ${titulo}\n\n${md(ctx, textos.slice(1).map((t) => t.settings.editor).join(""))}`;
  } else {
    corpo = md(ctx, html);
  }
  const imagemFundo = fundoDe(c) ? ctx.registrarImagem(caminhoMidia(fundoDe(c))) : undefined;
  const props = [escuro ? "escuro" : "", textoEscuro ? "textoEscuro" : "", imagemFundo ? `fundo="${attr(imagemFundo)}"` : ""].filter(Boolean).join(" ");
  return `<Destaque${props ? " " + props : ""}>\n${corpo}\n</Destaque>`;
}

export function converterCartoes(no, ctx, tamanhoPadrao = 1.1, hub = false) {
  const linhas = linhasDeCartoes(no);
  const primeiroTexto = encontrar(linhas[0], (n) => ehWidget(n, "text-editor"));
  const textos = linhas.flat().map((c) => encontrarTodos(filhos(c), (n) => ehWidget(n, "text-editor")));
  // Tamanho do texto principal (o último editor do cartão quando há título).
  const t = tam(textos[0][textos[0].length - 1].settings) ?? tam(primeiroTexto.settings) ?? 1;
  return linhas
    .map((linha) => {
      const props = [];
      if (t !== tamanhoPadrao) props.push(`tamanho={${num(t)}}`);
      // Nos hubs a linha de cartões tem 1em em cima e embaixo, salvo quando o padding é zerado.
      const topo = linha.linha?.settings?.padding?.top;
      if (hub && topo !== undefined && topo !== "" && Number(topo) === 0) props.push(`espaco="nenhum"`);
      return `<Destaques${props.length ? " " + props.join(" ") : ""}>\n${linha.map((c) => converterCartao(c, ctx)).join("\n")}\n</Destaques>`;
    })
    .join("\n\n");
}

export function converterLista(no, ctx) {
  const colunas = filhos(no).filter(ehContainer);
  const colItens = colunas.find((c) => encontrar([c], ehItemLista));
  const colImagem = colunas.find((c) => c !== colItens && encontrar([c], (n) => ehWidget(n, "image")));
  const itens = filhos(colItens).filter(ehItemLista);
  let tamanho;
  const saida = itens.map((it) => {
    const partes = filhos(it);
    const caixaNumero = partes.find((p) => ehContainer(p) && cor(p.settings) === AZUL);
    const texto = encontrarTodos(partes.filter((p) => p !== caixaNumero), (n) => ehWidget(n, "text-editor"))[0];
    tamanho ??= tam(texto.settings);
    const numero = caixaNumero ? textoPuro(encontrar([caixaNumero], (n) => ehWidget(n, "text-editor")).settings.editor) : undefined;
    return `<Item${numero ? ` numero="${attr(numero)}"` : ""}>\n${md(ctx, texto.settings.editor)}\n</Item>`;
  });
  const props = [];
  if (colImagem) {
    const img = encontrar([colImagem], (n) => ehWidget(n, "image"));
    const src = ctx.registrarImagem(caminhoMidia(img.settings.image?.url));
    props.push(`imagem="${attr(src)}"`, `alt="${attr(img.settings.image?.alt || ctx.altDe(src) || "")}"`);
    if (colunas.indexOf(colImagem) < colunas.indexOf(colItens)) props.push(`lado="esquerda"`);
  }
  if (tamanho && tamanho !== 0.9) props.push(`tamanho={${num(tamanho)}}`);
  return `<Lista${props.length ? " " + props.join(" ") : ""}>\n${saida.join("\n")}\n</Lista>`;
}

export function converterDepoimento(no, ctx) {
  const html = filhos(no)[0].settings.editor;
  const paragrafos = html.split(/<\/p>/i).map((p) => p.replace(/^\s*<p>/i, "")).filter((p) => textoPuro(p).replace(/[​\s]/g, ""));
  const autorHtml = paragrafos.pop();
  const [autor, cargo] = textoPuro(autorHtml).split("|").map((x) => x.trim());
  const texto = paragrafos.map((p) => md(ctx, `<p>${p}</p>`)).join("\n\n").replace(/[​]/g, "");
  return `<Depoimento autor="${attr(autor)}"${cargo ? ` cargo="${attr(cargo)}"` : ""}>\n${texto}\n</Depoimento>`;
}

// ------------------------------------------------------------------------ blocos
/** Container que segura conteúdo diretamente (widgets ou componentes reconhecidos). */
export function ehBlocoDireto(no) {
  return filhos(no).some((f) => ehWidget(f) || ehTextoImagem(f) || ehGrupoDeCartoes(f) || ehLista(f) || ehDepoimento(f));
}

/** Margem + padding de cima no celular (o Elementor herda do tablet e depois do desktop). */
export function topoPxCelular(s) {
  const val = (k) => {
    for (const d of ["_mobile", "_tablet", ""]) {
      const c = s?.[`${k}${d}`];
      if (c && c.top !== "" && c.top != null) return Number(c.top) * (c.unit === "em" ? 16 : 1);
    }
    return 0;
  };
  return val("margin") + val("padding");
}

/** Margem + padding de cima de um container, em px (em = 16px). */
export function topoPx(s) {
  const px = (c) => (c && c.top !== "" && c.top != null ? Number(c.top) * (c.unit === "em" ? 16 : 1) : 0);
  return px(s?.margin) + px(s?.padding);
}

export function novoBloco(no, junto, acima = 0) {
  const s = no.settings ?? {};
  const divisor = temBorda(s) && Number(s.border_width?.bottom || 0) > 0;
  const pb = pad(s, "bottom");
  const pbEm = pb ? (pb.unidade === "em" ? pb.valor : pb.valor / 16) : 0;
  const respiro = pbEm >= 1.5 ? "grande" : pbEm >= 0.5 ? "pequeno" : "nenhum";
  return { titulo: undefined, divisor, respiro, junto, acima: Math.round(acima), partes: [] };
}

export function blocoParaMdx(b) {
  const props = [];
  if (b.titulo) props.push(`titulo="${attr(b.titulo)}"`);
  if (b.divisor) props.push("divisor");
  const padraoRespiro = b.divisor ? "grande" : "nenhum";
  if (b.respiro !== padraoRespiro) props.push(`respiro="${b.respiro}"`);
  if (b.junto) props.push("junto");
  if (b.acima !== (b.junto ? 30 : 0)) props.push(`espacoAcima={${b.acima}}`);
  if (b.acimaCelular !== undefined && Math.round(b.acimaCelular) !== b.acima) props.push(`espacoAcimaCelular={${Math.round(b.acimaCelular)}}`);
  const corpo = b.partes.join("\n\n");
  return `<Bloco${props.length ? " " + props.join(" ") : ""}>${corpo ? `\n\n${corpo}\n\n` : ""}</Bloco>`;
}

/** Converte o conteúdo de um container "bloco" em um ou mais <Bloco> (título no meio abre outro). */
export function converterBloco(no, ctx, junto, acima, avisos, opcoes = {}) {
  const { detectores = [], tamanhoCartao = 1.1, hub = false } = opcoes;
  const blocos = [novoBloco(no, junto, acima)];
  let atual = blocos[0];
  if (ehGrupoDeCartoes(no)) {
    atual.respiro = "nenhum"; // o espaço em volta dos cartões vem do <Destaques>
    atual.partes.push(converterCartoes(no, ctx, tamanhoCartao, hub));
    return blocos;
  }
  const adicionar = (n) => {
    const extra = detectores.find(([eh]) => eh(n));
    if (extra) return atual.partes.push(extra[1](n, ctx));
    if (ehTitulo(n)) {
      const titulo = textoPuro(n.settings.editor);
      if (atual.titulo || atual.partes.length) {
        // Título no meio do container: fecha o bloco atual e abre outro colado.
        const anterior = atual;
        const m = n.settings?._margin;
        const margem = m && m.top !== "" && m.top != null ? Number(m.top) * (m.unit === "em" ? 16 : 1) : 0;
        atual = { ...novoBloco(no, true, margem), divisor: anterior.divisor, respiro: anterior.respiro };
        anterior.divisor = false;
        anterior.respiro = "nenhum";
        blocos.push(atual);
      }
      atual.titulo = titulo;
      return;
    }
    if (ehWidget(n, "text-editor")) {
      const t = tam(n.settings);
      const texto = md(ctx, n.settings.editor);
      if (t && t !== 1.1) avisos.push(`texto com ${t}em fora de componente: "${texto.slice(0, 50)}"`);
      if (texto) atual.partes.push(texto);
      return;
    }
    if (ehWidget(n, "image")) {
      const src = ctx.registrarImagem(caminhoMidia(n.settings.image?.url));
      atual.partes.push(`<Imagem src="${attr(src)}" alt="${attr(n.settings.image?.alt || ctx.altDe(src) || "")}" />`);
      return;
    }
    if (ehWidget(n)) {
      avisos.push(`widget não tratado no bloco: ${n.widgetType}`);
      return;
    }
    if (ehDepoimento(n)) return atual.partes.push(converterDepoimento(n, ctx));
    if (ehTextoImagem(n)) return atual.partes.push(converterTextoImagem(n, ctx));
    if (ehGrupoDeCartoes(n)) return atual.partes.push(converterCartoes(n, ctx, tamanhoCartao, hub));
    if (ehCartoesComImagem(n)) return atual.partes.push(converterCartoesComImagem(n, ctx, tamanhoCartao, hub));
    if (ehLista(n)) return atual.partes.push(converterLista(n, ctx));
    // Container de agrupamento: o conteúdo segue no mesmo bloco.
    filhos(n).forEach(adicionar);
  };
  filhos(no).forEach(adicionar);
  return blocos;
}

/** Percorre os grupos de uma faixa e devolve a lista de blocos. */
export function blocosDaFaixa(no, ctx, avisos) {
  const blocos = [];
  // `acima` acumula margem/padding de cima dos containers do caminho até o primeiro bloco.
  const visitar = (n, junto, acima) => {
    const total = acima + topoPx(n.settings);
    if (ehBlocoDireto(n)) {
      blocos.push(...converterBloco(n, ctx, junto, total, avisos));
      return;
    }
    filhos(n)
      .filter(ehContainer)
      .forEach((f, i) => visitar(f, junto || i > 0, i === 0 ? total : 0));
  };
  filhos(no)
    .filter(ehContainer)
    .forEach((grupo) => visitar(grupo, false, 0));
  return blocos;
}

// ------------------------------------------------------------------------ faixas
function ehChamada(no) {
  const fs = encontrarTodos(filhos(no), () => true);
  return fs.some((n) => ehWidget(n, "button")) && fs.filter((n) => ehWidget(n)).length === 1;
}

function ehLetreiro(no) {
  return cor(no.settings) === AZUL && Boolean(encontrar(filhos(no), (n) => ehWidget(n, "text-editor") && /white-space:\s*nowrap/.test(n.settings.custom_css ?? "")));
}

export function converterChamada(no, ctx) {
  const botao = encontrar(filhos(no), (n) => ehWidget(n, "button"));
  const s = botao.settings;
  const href = ctx.resolverLink(s.link?.url || "#");
  const t = tam(s);
  const topo = pad(no.settings, "top");
  const props = [`href="${attr(href)}"`];
  if (t && t !== 1.8) props.push(`tamanho={${num(t)}}`);
  if (topo && topo.unidade === "em" && topo.valor >= 4) props.push(`espaco="amplo"`);
  return `<Chamada ${props.join(" ")}>${textoPuro(s.text)}</Chamada>`;
}

export function converterLetreiro(no) {
  const texto = textoPuro(encontrar(filhos(no), (n) => ehWidget(n, "text-editor")).settings.editor);
  const frase = texto.split(" . ")[0].trim();
  return frase === "Case de Sucesso Ivory" ? "<Letreiro />" : `<Letreiro texto="${attr(frase)}" />`;
}

function converterFaixa(no, ctx, avisos) {
  const s = no.settings ?? {};
  const fs = filhos(no);
  const painelNo = fs.length === 1 && ehContainer(fs[0]) && /^#FFFFFF(C9|B[0-9A-F]|D[0-9A-F])$/.test(cor(fs[0].settings)) ? fs[0] : undefined;
  const props = [];
  if (cor(s) === "#FFEEC2") props.push(`fundo="creme"`);
  if (painelNo) props.push("painel");
  const blocos = blocosDaFaixa(painelNo ? { elements: [painelNo] } : no, ctx, avisos);
  return `<Faixa${props.length ? " " + props.join(" ") : ""}>\n\n${blocos.map(blocoParaMdx).join("\n\n")}\n\n</Faixa>`;
}

// ------------------------------------------------------------------- cartões do hub
let cartoesCache;
/** Cartões da página /cases-de-sucesso-ivory/ (abas do nested-tabs), indexados pelo destino. */
export function cartoesDoHub(ctx) {
  if (cartoesCache) return cartoesCache;
  cartoesCache = new Map();
  const hub = ctx.wp.paginas.find((p) => p.caminho === "/cases-de-sucesso-ivory/");
  const abas = encontrar(hub.elementor, (n) => ehWidget(n, "nested-tabs"));
  const nomes = (abas.settings.tabs ?? []).map((t) => t.tab_title);
  abas.elements.forEach((aba, i) => {
    const cards = encontrarTodos(aba.elements, (n) => ehContainer(n) && n.settings?.link?.url && n.settings?.html_tag === "a");
    cards.forEach((c, ordem) => {
      const img = encontrar([c], (n) => ehWidget(n, "image"));
      const [tituloNo, resumoNo] = encontrarTodos(c.elements, (n) => ehWidget(n, "text-editor"));
      const destino = ctx.resolverLink(c.settings.link.url).replace(/[?#].*$/, "");
      const t = tam(tituloNo.settings);
      cartoesCache.set(destino, {
        categoria: nomes[i],
        ordem: ordem + 1,
        cartao: {
          imagem: ctx.registrarImagem(caminhoMidia(img.settings.image?.url)),
          imagemAlt: img.settings.image?.alt || undefined,
          titulo: textoPuro(tituloNo.settings.editor),
          resumo: ctx.htmlParaMd(resumoNo.settings.editor).replace(/\s*\n\s*/g, " ").trim(),
          ...(t && t !== 2 ? { tamanhoTitulo: t } : {}),
        },
        novaAba: /abrir-outra-aba/.test(c.settings.css_classes ?? ""),
      });
    });
  });
  return cartoesCache;
}

/** Hub de setor que traz o case (procura o título curto do case no conteúdo de cada hub). */
function setorDoCase(p, ctx, tituloCurto) {
  const hubs = ctx.wp.paginas.filter((x) => x.caminho.startsWith("/cases-de-sucesso-ivory/") && x.caminho !== "/cases-de-sucesso-ivory/");
  const normal = (s) => textoPuro(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  const alvo = normal(tituloCurto.replace(/:$/, ""));
  const achado = hubs.find((h) => normal(JSON.stringify(h.elementor)).includes(alvo));
  if (achado) return achado.slug;
  const m = p.slug.match(/^case-([a-z]+)/);
  return m ? `cases-${m[1]}` : undefined;
}

// ---------------------------------------------------------------------- converter
export function converter(p, ctx) {
  const avisos = [];
  const nos = p.elementor.filter((n) => !ocultoSempre(n));
  const [cabecalho, capa, ...resto] = nos;

  const heading = encontrar([cabecalho], (n) => ehWidget(n, "heading"));
  const setorTitulo = textoPuro(heading?.settings?.title);

  const caixa = encontrar([capa], (n) => ehContainer(n) && fundoDe(n));
  const imagem = ctx.registrarImagem(caminhoMidia(fundoDe(caixa)));
  const imagemAlt = caixa.settings.background_image?.alt || undefined;
  const selo = filhos(caixa).find(ehContainer);
  const logoNo = selo && encontrar([selo], (n) => ehWidget(n, "image"));
  const logo = logoNo ? ctx.registrarImagem(caminhoMidia(logoNo.settings.image?.url)) : undefined;
  const logoLargura = tam(logoNo?.settings, "_element_custom_width");
  const logoCelular = selo?.settings?.hide_mobile ? "oculto" : /max-width:\s*766px[\s\S]*translateX/.test(selo?.settings?.custom_css ?? "") ? "centro" : undefined;
  const tituloNo = encontrar([capa], (n) => ehWidget(n, "text-editor") && tam(n.settings) === 2.6);
  const titulo = textoPuro(tituloNo.settings.editor);
  const centralizarNoCelular = tituloNo.settings.align_mobile === "center" || undefined;

  const corpo = [];
  let final = "contato";
  for (const no of resto) {
    if (encontrar([no], (n) => ehWidget(n, "template"))) {
      const id = Number(encontrar([no], (n) => ehWidget(n, "template")).settings.template_id);
      final = id === 2415 ? "contato" : id === 5859 ? "contato-sem-area" : id === 2421 ? "topo" : "contato";
      if (![2415, 5859, 2421].includes(id)) avisos.push(`template ${id} no fim da página`);
      continue;
    }
    if (ehChamada(no)) corpo.push(converterChamada(no, ctx));
    else if (ehLetreiro(no)) corpo.push(converterLetreiro(no));
    else corpo.push(converterFaixa(no, ctx, avisos));
  }

  const card = cartoesDoHub(ctx).get(p.caminho);
  if (!card) avisos.push("sem cartão em /cases-de-sucesso-ivory/ (cartão gerado da capa)");
  const tituloCurto = titulo.includes(":") ? titulo.slice(0, titulo.indexOf(":")) : titulo;
  const setor = setorDoCase(p, ctx, card?.cartao.titulo ?? tituloCurto);

  return {
    familia: "case",
    frontmatter: {
      familia: "case",
      titulo,
      setor,
      setorTitulo,
      categoria: card?.categoria ?? setorTitulo.replace(/^Cases de /, ""),
      ordem: card?.ordem ?? 100,
      imagem,
      imagemAlt,
      logo,
      logoAlt: logoNo?.settings?.image?.alt || undefined,
      logoLargura: logoLargura && logoLargura !== 8.5 ? logoLargura : undefined,
      logoCelular,
      centralizarNoCelular,
      ...(final !== "contato" ? { final } : {}),
      cartao: card?.cartao ?? { imagem, titulo: tituloCurto },
    },
    corpo: corpo.join("\n\n"),
    avisos,
  };
}
