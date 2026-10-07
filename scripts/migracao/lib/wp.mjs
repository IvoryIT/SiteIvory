// Utilitários para ler a exportação do WordPress e a árvore do Elementor.
import fs from "node:fs";
import { imageSize } from "image-size";

export function carregarExport(arquivo = ".tmp/wp-export.json") {
  const dados = JSON.parse(fs.readFileSync(arquivo, "utf8"));
  const head = fs.existsSync(".tmp/wp-head.json") ? JSON.parse(fs.readFileSync(".tmp/wp-head.json", "utf8")) : {};
  const porId = new Map(dados.paginas.map((p) => [p.id, p]));
  const templates = new Map(dados.templates.map((t) => [t.id, t]));
  const midiaPorArquivo = new Map(dados.midia.filter((m) => m.arquivo).map((m) => [m.arquivo, m]));
  const midiaPorId = new Map(dados.midia.map((m) => [m.id, m]));
  for (const p of dados.paginas) p.caminho = new URL(p.permalink).pathname;
  return { ...dados, head, porId, templatesPorId: templates, midiaPorArquivo, midiaPorId };
}

/** Percorre a árvore do Elementor (pré-ordem). */
export function* percorrer(nos, profundidade = 0, pai = null) {
  for (const no of nos ?? []) {
    yield { no, profundidade, pai };
    yield* percorrer(no.elements, profundidade + 1, no);
  }
}

export function encontrar(nos, filtro) {
  for (const { no } of percorrer(nos)) if (filtro(no)) return no;
  return undefined;
}

export function encontrarTodos(nos, filtro) {
  const lista = [];
  for (const { no } of percorrer(nos)) if (filtro(no)) lista.push(no);
  return lista;
}

/** Elemento oculto em todos os dispositivos: não existe para o visitante. */
export function ocultoSempre(no) {
  const s = no.settings ?? {};
  return Boolean(s.hide_desktop && s.hide_tablet && s.hide_mobile);
}

/** Classes Tailwind equivalentes às opções "ocultar em" do Elementor (desktop >=1025, tablet 768-1024, mobile <768). */
export function classesVisibilidade(no) {
  const s = no.settings ?? {};
  const c = [];
  if (s.hide_mobile) c.push("max-md:hidden");
  if (s.hide_tablet) c.push("md:max-lg:hidden");
  if (s.hide_desktop) c.push("lg:hidden");
  return c.join(" ");
}

export const ehWidget = (no, tipo) => no.elType === "widget" && (!tipo || no.widgetType === tipo);
export const ehContainer = (no) => no.elType === "container";

/** Valor em em/px de um controle de tamanho do Elementor. */
export function tamanho(controle) {
  if (!controle || controle.size === "" || controle.size == null) return undefined;
  return { valor: Number(controle.size), unidade: controle.unit };
}

const TEXTURA = /Noise-Texture-1\.png$/;

/** Imagem de fundo "de conteúdo" de um container (ignora a textura de ruído aplicada em todo o site). */
export function fundoDe(no, dispositivo = "") {
  const url = no.settings?.[`background_image${dispositivo}`]?.url;
  if (!url || TEXTURA.test(url)) return undefined;
  return url;
}

/** Normaliza URL de mídia para o caminho público do site novo (/wp-content/uploads/...). */
export function caminhoMidia(url) {
  if (!url) return undefined;
  const m = String(url).match(/\/wp-content\/uploads\/(.+)$/);
  return m ? `/wp-content/uploads/${decodeURIComponent(m[1]).replace(/\?.*$/, "")}` : undefined;
}

/** Links que já estavam quebrados no WordPress (404 lá também) e o destino certo. */
// "/case-construcao-apia-app/" é uma página privada no WordPress (404 para o visitante).
const LINKS_CORRIGIDOS = { "/insights/": "/blog/", "/case-construcao-apia-app/": "/cases-de-sucesso-ivory/cases-construcao/" };

/** Resolve um link do WordPress para o caminho canônico do site novo. */
export function criarResolvedorLinks(paginas) {
  const porCaminho = new Map(paginas.map((p) => [p.caminho.toLowerCase(), p.caminho]));
  const porSlug = new Map(paginas.map((p) => [p.slug.toLowerCase(), p.caminho]));
  return function resolver(href) {
    if (!href) return href;
    let h = href.trim();
    if (/^(mailto:|tel:|#)/i.test(h)) return h;
    const interno = h.match(/^(https?:\/\/(?:www\.)?ivoryit\.com\.br|http:\/\/localhost:8080)?(\/[^?#]*)?([?#].*)?$/i);
    if (!interno) return h; // link externo
    if (!interno[2] && !interno[3]) return interno[1] ? "/" : h; // só o domínio = home
    interno.splice(1, 1);
    const caminho = (interno[1] || "/").replace(/\/?$/, "/");
    const sufixo = interno[2] || "";
    if (caminho.startsWith("/wp-content/")) return caminho.replace(/\/$/, "") + sufixo;
    if (LINKS_CORRIGIDOS[caminho.toLowerCase()]) return LINKS_CORRIGIDOS[caminho.toLowerCase()] + sufixo;
    const exato = porCaminho.get(caminho.toLowerCase());
    if (exato) return exato + sufixo;
    // O WordPress acha a página pelo último segmento (redirect_guess_404_permalink).
    const slug = caminho.split("/").filter(Boolean).pop()?.toLowerCase();
    const achado = slug && porSlug.get(slug);
    if (achado) return achado + sufixo;
    return caminho + sufixo;
  };
}

/** Escapa texto para atributo JSX entre aspas. */
export function attr(v) {
  return String(v ?? "").replace(/\\/g, "\\\\").replace(/"/g, "&quot;");
}

/** Texto puro de um HTML curto (títulos de cartão, rótulos). */
export function textoPuro(html) {
  return decodificarEntidades(String(html ?? "").replace(/<br\s*\/?>/gi, " ").replace(/<[^>]+>/g, ""))
    .replace(/\s+/g, " ")
    .trim();
}

export function decodificarEntidades(s) {
  return String(s ?? "")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

/**
 * Ajustes do título da capa (frontmatter `capaTitulo`) a partir do widget do Elementor:
 * tamanhos por dispositivo, margens e largura no desktop, entrelinha e alinhamento no celular.
 * Só devolve o que difere do padrão da <Capa> (título com entrelinha 1, 6em/2em, 90%).
 */
export function estiloTituloCapa(no) {
  const s = no?.settings ?? {};
  const emEm = (c) => {
    const t = tamanho(c);
    if (!t) return undefined;
    return t.unidade === "px" ? Math.round((t.valor / 16) * 100) / 100 : t.valor;
  };
  const m = s._margin;
  const lado = (v) => (m && v !== "" && v != null ? `${v}${m.unit}` : undefined);
  const largura = s._element_custom_width?.size ? `${s._element_custom_width.size}${s._element_custom_width.unit || "%"}` : undefined;
  const entrelinha = tamanho(s.typography_line_height)?.valor ?? (no?.widgetType === "heading" ? 1 : 1.5);
  const e = {
    entrelinha: entrelinha !== 1 ? entrelinha : undefined,
    tamanhoTablet: emEm(s.typography_font_size_tablet),
    tamanhoMobile: emEm(s.typography_font_size_mobile),
    margemTopo: lado(m?.top) !== "6em" ? lado(m?.top) : undefined,
    margemEsquerda: lado(m?.left) !== "2em" ? lado(m?.left) : undefined,
    largura: largura !== "90%" ? largura : undefined,
    alinharMobile: s.align_mobile === "center" ? "centro" : undefined,
    // Título todo dentro de <em>/<i> (ou com fonte itálica no widget).
    italico: /^\s*(<p[^>]*>)?\s*<(em|i)\b[^>]*>[\s\S]*<\/(em|i)>\s*(<\/p>)?\s*$/i.test(s.editor ?? s.title ?? "") || s.typography_font_style === "italic" || undefined,
  };
  for (const k of Object.keys(e)) if (e[k] === undefined) delete e[k];
  if (e.tamanhoMobile === 1.4) delete e.tamanhoMobile;
  return Object.keys(e).length ? e : undefined;
}

/**
 * Atributos do <Imagem> equivalentes a um widget de imagem do Elementor:
 * - os tamanhos do WordPress cabem numa caixa: "large" (padrão) 1024x1024, "medium" 300x300,
 *   "medium_large" 768 de largura, "thumbnail" 150x150 — uma imagem alta é limitada pela altura;
 *   além disso a largura nunca passa de 800px, a largura de conteúdo do tema Hello; "full" usa o
 *   arquivo como está;
 * - largura personalizada em % (só quando o widget está em modo "initial") vira `porcento`;
 * - `_flex_align_self: flex-start` alinha à esquerda; o padrão do widget é centralizado.
 */
export function atributosImagem(no, src, original) {
  const s = no.settings ?? {};
  const caixas = { "": [1024, 1024], large: [1024, 1024], medium: [300, 300], medium_large: [768, Infinity], thumbnail: [150, 150] };
  const tamanhoImagem = s.image_size ?? "";
  const caixa = tamanhoImagem === "full" ? undefined : caixas[tamanhoImagem];
  const attrs = {};
  if (caixa && original?.largura && original?.altura) {
    const escala = Math.min(1, caixa[0] / original.largura, caixa[1] / original.altura);
    const largura = Math.min(Math.round(original.largura * escala), 800);
    if (largura < original.largura) attrs.largura = largura;
  }
  if (s._element_width === "initial" && s._element_custom_width?.unit === "%" && s._element_custom_width.size) attrs.porcento = Number(s._element_custom_width.size);
  else if (s.width?.unit === "%" && s.width.size) attrs.porcento = Number(s.width.size);
  else if (s.width?.unit === "px" && s.width.size) attrs.largura = Number(s.width.size);
  if (s._flex_align_self === "flex-start" || s.align === "left") attrs.alinhar = "esquerda";
  else if (s._flex_align_self === "flex-end" || s.align === "right") attrs.alinhar = "direita";
  return attrs;
}

/** Dimensões do arquivo original no WordPress (pasta ../ivoryit.com.br). */
export function dimensoesNoWordPress(src) {
  try {
    const raiz = process.env.WP_RAIZ || new URL("../../../../ivoryit.com.br", import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1");
    const d = imageSize(fs.readFileSync(decodeURIComponent(`${raiz}${src}`)));
    if (d.width && d.height) return { largura: d.width, altura: d.height };
  } catch {
    /* arquivo ausente */
  }
  return undefined;
}
