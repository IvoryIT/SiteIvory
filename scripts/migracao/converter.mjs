// Converte as páginas exportadas do WordPress em content/paginas/**/index.mdx e copia as
// imagens usadas para public/. Pode ser rodado de novo sem perda: sobrescreve só o que gera.
//
// Uso:
//   node scripts/migracao/exportar-wp.mjs        (1. exporta do banco local)
//   node scripts/migracao/capturar-head.mjs      (2. lê o SEO renderizado pelo Yoast)
//   node scripts/migracao/converter.mjs [--familia artigo] [--pagina 3027] [--caminho /blog/] [--sem-imagens]
import fs from "node:fs";
import path from "node:path";
import { carregarExport, criarResolvedorLinks, caminhoMidia, encontrar, encontrarTodos, ehContainer, ehWidget, fundoDe, textoPuro, attr, ocultoSempre } from "./lib/wp.mjs";
import { criarConversor } from "./lib/markdown.mjs";
import { escreverPagina, tituloTexturizado } from "./lib/escrever.mjs";
import { ehArtigo, converterArtigo } from "./familias/artigo.mjs";

const args = process.argv.slice(2);
const opcao = (nome) => {
  const i = args.indexOf(`--${nome}`);
  return i >= 0 ? args[i + 1] : undefined;
};
const SO_FAMILIA = opcao("familia");
const SO_PAGINA = opcao("pagina") ? Number(opcao("pagina")) : undefined;
const SO_CAMINHO = opcao("caminho");
const SEM_IMAGENS = args.includes("--sem-imagens");

const WP_RAIZ = process.env.WP_RAIZ || path.resolve("..", "ivoryit.com.br");
const wp = carregarExport();
const resolverLink = criarResolvedorLinks(wp.paginas);
const htmlParaMd = criarConversor(resolverLink);

// ---------------------------------------------------------------- imagens
const imagens = new Set();
function registrarImagem(src) {
  if (!src) return undefined;
  imagens.add(src);
  return src;
}
const altPorArquivo = new Map(wp.midia.filter((m) => m.arquivo).map((m) => [`/wp-content/uploads/${m.arquivo}`, m.alt || ""]));
const altDe = (src) => altPorArquivo.get(src);

// ---------------------------------------------------------------- cartões do /blog/
function cartoesDoBlog() {
  const blog = wp.paginas.find((p) => p.caminho === "/blog/");
  const mapa = new Map();
  if (!blog) return mapa;
  const abasNo = encontrar(blog.elementor, (n) => ehWidget(n, "nested-tabs"));
  const nomes = (abasNo?.settings?.tabs ?? []).map((t) => t.tab_title);
  (abasNo?.elements ?? []).forEach((aba, i) => {
    const nomeAba = nomes[i];
    for (const c of encontrarTodos(aba.elements, (n) => ehContainer(n) && n.settings?.link?.url && fundoDe(n))) {
      const destino = resolverLink(c.settings.link.url).replace(/[?#].*$/, "");
      const editores = encontrarTodos(c.elements, (n) => ehWidget(n, "text-editor"));
      const textos = editores.map((t) => textoPuro(t.settings.editor));
      // Rótulo ("Coluna do CEO", "White Paper") é o texto pequeno (0.8em) antes do título.
      // Se o primeiro texto tem o tamanho de título, ele é o título e o segundo é um resumo.
      const primeiroPequeno = Number(editores[0]?.settings?.typography_font_size?.size) < 1;
      const [titulo, rotulo, resumo] =
        textos.length < 2 ? [textos[0], undefined, undefined] : primeiroPequeno ? [textos[textos.length - 1], textos[0], undefined] : [textos[0], undefined, textos.slice(1).join(" ")];
      const atual = mapa.get(destino) ?? {
        imagem: registrarImagem(caminhoMidia(fundoDe(c))),
        imagemAlt: c.settings.background_image?.alt || undefined,
        titulo,
        rotulo,
        resumo,
        categorias: [],
      };
      if (nomeAba && nomeAba !== "Ver todos" && !atual.categorias.includes(nomeAba)) atual.categorias.push(nomeAba);
      mapa.set(destino, atual);
    }
  });
  return mapa;
}

// ---------------------------------------------------------------- famílias
function familiaDe(p) {
  if (ehArtigo(p)) return "artigo";
  if (/^case-/.test(p.slug)) return "case";
  if (p.caminho.startsWith("/cases-de-sucesso-ivory/") && p.caminho !== "/cases-de-sucesso-ivory/") return "setor";
  if (p.caminho.startsWith("/solucoes/") && p.caminho !== "/solucoes/") return "solucao";
  return "pagina";
}

/** Conversão provisória (texto corrido) para famílias ainda sem conversor próprio. */
function converterGenerico(p, c) {
  const blocos = [];
  for (const no of p.elementor ?? []) {
    for (const n of encontrarTodos([no], () => true)) {
      if (ocultoSempre(n)) continue;
      if (ehWidget(n, "text-editor")) blocos.push(c.htmlParaMd(n.settings.editor));
      else if (ehWidget(n, "heading")) blocos.push(`## ${textoPuro(n.settings.title)}`);
      else if (ehWidget(n, "image") && n.settings.image?.url) {
        const src = c.registrarImagem(caminhoMidia(n.settings.image.url));
        if (src) blocos.push(`<Imagem src="${attr(src)}" alt="${attr(n.settings.image.alt || c.altDe(src) || "")}" />`);
      }
    }
  }
  return { familia: "pagina", frontmatter: { familia: "pagina", titulo: p.titulo }, corpo: blocos.filter(Boolean).join("\n\n"), avisos: ["conversão provisória (genérica)"] };
}

const conversores = { artigo: converterArtigo };
// Conversores das demais famílias são carregados se existirem.
for (const f of ["case", "setor", "solucao", "pagina"]) {
  const arq = path.resolve("scripts/migracao/familias", `${f}.mjs`);
  if (fs.existsSync(arq)) {
    const mod = await import(`./familias/${f}.mjs`);
    if (mod.converter) conversores[f] = mod.converter;
  }
}

const ctx = { wp, resolverLink, htmlParaMd, registrarImagem, altDe, cartoesBlog: cartoesDoBlog(), converterGenerico };

// ---------------------------------------------------------------- conversão
const relatorio = [];
for (const p of wp.paginas) {
  const familia = familiaDe(p);
  if (SO_FAMILIA && familia !== SO_FAMILIA) continue;
  if (SO_PAGINA && p.id !== SO_PAGINA) continue;
  if (SO_CAMINHO && p.caminho !== SO_CAMINHO) continue;
  const converter = conversores[familia] ?? converterGenerico;
  const r = converter(p, ctx);
  const head = wp.head[p.id] ?? {};
  const avisos = [...(r.avisos ?? [])];

  let descricao = r.frontmatter.seo?.descricao || head.descricao || p.seoDescricao;
  if (!descricao) {
    avisos.push("sem meta description no WordPress (gerada do primeiro parágrafo)");
    const texto = textoPuro(
      r.corpo
        .replace(/<[^>]+>/g, " ")
        .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
        .replace(/[*_#>`\\]+/g, " ")
        .replace(/&nbsp;/g, " "),
    );
    descricao = texto.length > 155 ? `${texto.slice(0, 152).replace(/\s+\S*$/, "")}...` : texto;
  }
  const seoTitulo = head.titulo || p.seoTitulo || `${p.titulo} - Ivory`;

  const frontmatter = {
    ...r.frontmatter,
    titulo: r.frontmatter.titulo || p.titulo,
    breadcrumb: tituloTexturizado(p.titulo),
    seo: {
      titulo: seoTitulo,
      descricao,
      ...(p.seoFocoKw ? { palavraChave: p.seoFocoKw } : {}),
      ...(head.robots && /noindex/.test(head.robots) ? { noindex: true } : {}),
      ...r.frontmatter.seo,
    },
    publicadoEm: p.data,
    atualizadoEm: p.modificado,
    wpId: p.id,
  };
  const arquivo = escreverPagina({ caminho: p.caminho, frontmatter, corpo: r.corpo, agentes: p.markdownAgentes });
  relatorio.push({ id: p.id, caminho: p.caminho, familia: r.familia, arquivo: path.relative(process.cwd(), arquivo), avisos });
}

// ---------------------------------------------------------------- blocos compartilhados
if (!SO_PAGINA && !SO_CAMINHO) {
  const insights = wp.templatesPorId.get(2210);
  const cartoes = encontrarTodos(insights.elementor, (n) => ehContainer(n) && encontrar([n], (x) => ehWidget(x, "image")) && n.elements?.length <= 4 && !n.elements.some(ehContainer));
  const itens = cartoes.map((c) => {
    const img = encontrar([c], (x) => ehWidget(x, "image"));
    const textos = encontrarTodos(c.elements, (x) => ehWidget(x, "text-editor"));
    const link = textos.map((t) => t.settings.editor.match(/href="([^"]+)"/)?.[1]).find(Boolean);
    return {
      caminho: resolverLink(link),
      imagem: registrarImagem(caminhoMidia(img.settings.image.url)),
      imagemAlt: img.settings.image.alt || "",
      rotulo: textos.length > 1 ? textoPuro(textos[0].settings.editor) : undefined,
      titulo: textoPuro(textos[textos.length - 1].settings.editor),
    };
  });
  fs.mkdirSync("content/blocos", { recursive: true });
  fs.writeFileSync("content/blocos/insights-recentes.json", JSON.stringify(itens, null, 2) + "\n");

  // Fotos sorteadas ao lado do formulário de contato (mídias com texto alternativo "rodape").
  const fotos = wp.midia.filter((m) => m.alt === "rodape" && m.arquivo).map((m) => registrarImagem(`/wp-content/uploads/${m.arquivo}`));
  fs.writeFileSync("content/blocos/fotos-formulario.json", JSON.stringify(fotos, null, 2) + "\n");
}

// ---------------------------------------------------------------- redirects
if (!SO_FAMILIA && !SO_PAGINA && !SO_CAMINHO) {
  const redirects = [
    { de: "/sitemap_index.xml", para: "/sitemap.xml" },
    { de: "/page-sitemap.xml", para: "/sitemap.xml" },
    { de: "/post-sitemap.xml", para: "/sitemap.xml" },
    { de: "/feed/", para: "/blog/" },
    { de: "/comments/feed/", para: "/blog/" },
  ];
  // O WordPress achava páginas filhas pelo slug na raiz (ex.: /blog-queda-AWS/ -> /blog/blog-queda-aws/).
  for (const p of wp.paginas) {
    const partes = p.caminho.split("/").filter(Boolean);
    if (partes.length > 1) redirects.push({ de: `/${p.slug}/`, para: p.caminho });
  }
  fs.mkdirSync("src/data", { recursive: true });
  fs.writeFileSync("src/data/redirects.json", JSON.stringify(redirects, null, 2) + "\n");
  // /?p=ID e /?page_id=ID (links antigos do WordPress), tratados no next.config.
  const ids = Object.fromEntries(wp.paginas.map((p) => [p.id, p.caminho]));
  fs.writeFileSync("src/data/ids-wordpress.json", JSON.stringify(ids, null, 2) + "\n");
}

// ---------------------------------------------------------------- cópia das imagens
const IMAGENS_FIXAS = [
  "/wp-content/uploads/2025/09/Noise-Texture-1.png",
  "/wp-content/uploads/2025/09/logo.png",
  "/wp-content/uploads/2025/09/Group-318.png",
  "/wp-content/uploads/2025/09/Group-317.png",
  "/wp-content/uploads/2025/09/Group-316.png",
  "/wp-content/uploads/2025/09/Group-315.png",
  "/wp-content/uploads/2025/09/section-bg.svg.png",
];
IMAGENS_FIXAS.forEach((i) => imagens.add(i));
if (!SEM_IMAGENS) {
  let copiadas = 0;
  const faltando = [];
  for (const src of imagens) {
    for (const variante of [src, `${src}.webp`]) {
      const origem = path.join(WP_RAIZ, variante);
      const destino = path.join("public", variante);
      if (!fs.existsSync(origem)) {
        if (variante === src) faltando.push(src);
        continue;
      }
      if (fs.existsSync(destino) && fs.statSync(destino).size === fs.statSync(origem).size) continue;
      fs.mkdirSync(path.dirname(destino), { recursive: true });
      fs.copyFileSync(origem, destino);
      copiadas++;
    }
  }
  if (faltando.length) relatorio.push({ id: 0, caminho: "(imagens)", familia: "-", avisos: faltando.map((f) => `imagem não encontrada no WordPress: ${f}`) });
  console.log(`${imagens.size} imagens referenciadas, ${copiadas} arquivos copiados, ${faltando.length} faltando`);
}

// ---------------------------------------------------------------- relatório
const linhas = ["# Relatório da conversão", "", `Gerado em ${new Date().toISOString()}`, ""];
for (const r of relatorio) {
  linhas.push(`- \`${r.caminho}\` (${r.familia})${r.avisos.length ? "" : " — ok"}`);
  for (const a of r.avisos) linhas.push(`  - ${a}`);
}
fs.writeFileSync(".tmp/relatorio-migracao.md", linhas.join("\n") + "\n");
const comAviso = relatorio.filter((r) => r.avisos.length).length;
console.log(`${relatorio.length} páginas convertidas (${comAviso} com avisos) -> .tmp/relatorio-migracao.md`);
