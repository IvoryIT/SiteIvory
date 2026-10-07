// Verificação de conteúdo e SEO antes de publicar.
//
//   npm run verificar                              -> todas as páginas
//   npm run verificar -- content/paginas/x/index.mdx  -> só os arquivos indicados
//   npm run verificar -- --build                   -> todas as páginas + next build
//   npm run verificar -- --json                    -> saída em JSON (usada pelos hooks)
//
// ERRO bloqueia a publicação (sai com código 1). AVISO só informa.
// As regras ficam aqui, num lugar só; os hooks do Claude Code e a skill revisar-seo usam este script.
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { compile } from "@mdx-js/mdx";
import remarkGfm from "remark-gfm";
import matter from "gray-matter";
import { imageSize } from "image-size";
import { frontmatterSchema, type Frontmatter } from "../src/lib/esquema";
import { componentesPorFamilia } from "../src/components/familias/registro";
import { validarJsx } from "../src/lib/mdx";

type Nivel = "ERRO" | "AVISO";
type Achado = { arquivo: string; nivel: Nivel; regra: string; mensagem: string };

const RAIZ = path.join(process.cwd(), "content", "paginas");
const PUBLIC = path.join(process.cwd(), "public");
const args = process.argv.slice(2);
const comBuild = args.includes("--build");
const emJson = args.includes("--json");
const alvos = args.filter((a) => !a.startsWith("--")).map((a) => path.resolve(a));

const achados: Achado[] = [];
const registrar = (arquivo: string, nivel: Nivel, regra: string, mensagem: string) => achados.push({ arquivo, nivel, regra, mensagem });

function coletar(dir: string): string[] {
  const saida: string[] = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const c = path.join(dir, e.name);
    if (e.isDirectory()) saida.push(...coletar(c));
    else if (e.name === "index.mdx") saida.push(c);
  }
  return saida;
}

type Pagina = { arquivo: string; rel: string; caminho: string; dados?: Frontmatter; corpo: string; bruto: Record<string, unknown> };

const todos = coletar(RAIZ);
const paginas: Pagina[] = todos.map((arq) => {
  const { data, content } = matter(fs.readFileSync(arq, "utf8"));
  const segmentos = path.relative(RAIZ, path.dirname(arq)).split(path.sep).filter(Boolean);
  const r = frontmatterSchema.safeParse(data);
  return {
    arquivo: arq,
    rel: path.relative(process.cwd(), arq).split(path.sep).join("/"),
    caminho: segmentos.length ? `/${segmentos.join("/")}/` : "/",
    dados: r.success ? r.data : undefined,
    corpo: content,
    bruto: data,
  };
});
const caminhos = new Set(paginas.map((p) => p.caminho));
const redirects: { de: string; para: string }[] = fs.existsSync("src/data/redirects.json") ? JSON.parse(fs.readFileSync("src/data/redirects.json", "utf8")) : [];
const destinosRedirect = new Set(redirects.map((r) => r.de));

const verificar = alvos.length ? paginas.filter((p) => alvos.includes(p.arquivo) || alvos.includes(path.dirname(p.arquivo))) : paginas;
if (alvos.length && !verificar.length) {
  // Arquivo fora de content/paginas (ex.: agentes.md): verifica a página da mesma pasta.
  for (const a of alvos) {
    const p = paginas.find((x) => path.dirname(x.arquivo) === path.dirname(a));
    if (p) verificar.push(p);
  }
}

function imagemExiste(src: string) {
  return fs.existsSync(path.join(PUBLIC, decodeURIComponent(src.split("?")[0])));
}

function verificarImagem(p: Pagina, src: string, alt: string | undefined, onde: string) {
  if (!/^\/(imagens|wp-content\/uploads)\//.test(src)) {
    registrar(p.rel, "ERRO", "imagem-local", `${onde}: imagem "${src}" precisa estar em /imagens/ (public/imagens/).`);
    return;
  }
  if (!imagemExiste(src)) {
    registrar(p.rel, "ERRO", "imagem-existe", `${onde}: arquivo não encontrado em public${src}.`);
    return;
  }
  // Imagem nova (public/imagens) sem texto alternativo é erro; as migradas do WordPress que
  // vieram sem alt ficam como aviso, para corrigir aos poucos.
  if (alt !== undefined && !alt.trim()) {
    const legado = src.startsWith("/wp-content/uploads/");
    registrar(p.rel, legado ? "AVISO" : "ERRO", "imagem-alt", `${onde}: imagem "${src}" sem texto alternativo (descreva o que a imagem mostra).`);
  }
  const arq = path.join(PUBLIC, decodeURIComponent(src));
  const kb = fs.statSync(arq).size / 1024;
  if (src.startsWith("/imagens/") && kb > 400) registrar(p.rel, "AVISO", "imagem-peso", `${onde}: "${src}" tem ${Math.round(kb)} KB; otimize com \`node scripts/imagem.mjs\`.`);
  try {
    const d = imageSize(fs.readFileSync(arq));
    if (src.startsWith("/imagens/") && (d.width ?? 0) > 2400) registrar(p.rel, "AVISO", "imagem-tamanho", `${onde}: "${src}" tem ${d.width}px de largura; 1600–2000px bastam.`);
  } catch {
    /* svg ou formato sem cabeçalho de tamanho */
  }
}

const titulos = new Map<string, string[]>();
const descricoes = new Map<string, string[]>();

for (const p of verificar) {
  // ---------------------------------------------------------------- cabeçalho
  if (!p.dados) {
    const r = frontmatterSchema.safeParse(p.bruto);
    if (!r.success) for (const i of r.error.issues) registrar(p.rel, "ERRO", "cabecalho", `${i.path.map(String).join(".") || "(raiz)"}: ${i.message}`);
    continue;
  }
  const d = p.dados;

  // ---------------------------------------------------------------- URL
  const slug = p.caminho.split("/").filter(Boolean).pop() ?? "";
  if (slug && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) registrar(p.rel, "ERRO", "url", `A pasta "${slug}" vira URL: use só letras minúsculas sem acento, números e hífens.`);
  if (slug.length > 75) registrar(p.rel, "AVISO", "url", `URL longa (${slug.length} caracteres); prefira até 60.`);

  // ---------------------------------------------------------------- SEO
  const t = d.seo.titulo.trim();
  const ds = d.seo.descricao.trim();
  if (t.length > 70) registrar(p.rel, "ERRO", "seo-titulo", `Título SEO com ${t.length} caracteres: o Google corta em ~60. Encurte para até 60.`);
  else if (t.length > 60) registrar(p.rel, "AVISO", "seo-titulo", `Título SEO com ${t.length} caracteres; o ideal é até 60.`);
  else if (t.length < 25) registrar(p.rel, "AVISO", "seo-titulo", `Título SEO curto (${t.length} caracteres); aproveite até 60 com a palavra-chave.`);
  if (ds.length < 50) registrar(p.rel, "ERRO", "seo-descricao", `Meta description com ${ds.length} caracteres: escreva entre 120 e 160.`);
  else if (ds.length > 200) registrar(p.rel, "ERRO", "seo-descricao", `Meta description com ${ds.length} caracteres: o Google corta em ~160.`);
  else if (ds.length < 110 || ds.length > 165) registrar(p.rel, "AVISO", "seo-descricao", `Meta description com ${ds.length} caracteres; o ideal é entre 120 e 160.`);
  if (/[*_#`<>]/.test(t + ds)) registrar(p.rel, "ERRO", "seo-texto", "Título ou descrição SEO com marcação (*, _, #, <…>): use texto puro.");
  if (d.seo.palavraChave) {
    const kw = d.seo.palavraChave.toLowerCase();
    const primeiraPalavra = kw.split(/\s+/)[0];
    if (!t.toLowerCase().includes(primeiraPalavra)) registrar(p.rel, "AVISO", "seo-palavra-chave", `A palavra-chave "${d.seo.palavraChave}" não aparece no título SEO.`);
  }
  if (!d.seo.noindex && !d.oculta) {
    titulos.set(t, [...(titulos.get(t) ?? []), p.rel]);
    descricoes.set(ds, [...(descricoes.get(ds) ?? []), p.rel]);
  }

  // ---------------------------------------------------------------- imagens do cabeçalho
  const d2 = d as Record<string, unknown>;
  for (const campo of ["capa", "capaMobile", "imagem", "logo", "icone"]) {
    if (typeof d2[campo] === "string") verificarImagem(p, d2[campo] as string, undefined, `cabeçalho "${campo}"`);
  }
  const cartao = d2.cartao as { imagem?: string; imagemAlt?: string } | undefined;
  if (cartao?.imagem) verificarImagem(p, cartao.imagem, undefined, 'cabeçalho "cartao.imagem"');
  if (d.seo.imagem) verificarImagem(p, d.seo.imagem, undefined, 'cabeçalho "seo.imagem"');

  // ---------------------------------------------------------------- corpo
  const corpo = p.corpo;
  const h1s = (corpo.match(/^#\s/gm) ?? []).length;
  const capaPropria = d.familia === "pagina" && d.semCapa;
  if (capaPropria && h1s > 1) registrar(p.rel, "ERRO", "h1", `A página tem ${h1s} títulos de nível 1 (# ...). Deve haver só um H1; use ## para as seções.`);
  else if (!capaPropria && h1s) registrar(p.rel, "ERRO", "h1", "O corpo tem título de nível 1 (# ...). A página já tem um H1 (o título da capa); use ## para seções.");
  const niveis = [...corpo.matchAll(/^(#{2,6})\s/gm)].map((m) => m[1].length);
  for (let i = 1; i < niveis.length; i++) {
    if (niveis[i] > niveis[i - 1] + 1) {
      registrar(p.rel, "AVISO", "hierarquia", `Títulos pulam de nível (h${niveis[i - 1]} para h${niveis[i]}); não pule níveis.`);
      break;
    }
  }
  if (/lorem ipsum|hhjghjgjhgj|\[inserir/i.test(corpo) || /\b(TODO|FIXME|XXX)\b/.test(corpo)) registrar(p.rel, "ERRO", "texto-provisorio", "Há texto provisório no conteúdo (lorem ipsum, TODO, [inserir…]).");

  // Imagens no corpo: <Imagem src alt> e Markdown ![alt](src).
  for (const m of corpo.matchAll(/<Imagem\b([^>]*)\/?>/g)) {
    const src = m[1].match(/src="([^"]+)"/)?.[1];
    const alt = m[1].match(/alt="([^"]*)"/)?.[1];
    if (src) verificarImagem(p, src, alt ?? "", "<Imagem>");
  }
  for (const m of corpo.matchAll(/!\[([^\]]*)\]\(([^)\s]+)\)/g)) verificarImagem(p, m[2], m[1], "imagem em Markdown");

  // Links internos.
  const links = [...corpo.matchAll(/\]\(([^)\s]+)\)/g), ...corpo.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
  for (const href of links) {
    if (/^(https?:|mailto:|tel:|#)/.test(href)) {
      if (href.startsWith("http://") && !href.includes("localhost")) registrar(p.rel, "AVISO", "link-http", `Link sem HTTPS: ${href}`);
      if (/^https?:\/\/(www\.)?ivoryit\.com\.br/.test(href)) registrar(p.rel, "AVISO", "link-absoluto", `Link interno com domínio (${href}); use o caminho, ex.: /blog/.`);
      continue;
    }
    if (href.startsWith("/wp-content/") || href.startsWith("/imagens/")) {
      if (!imagemExiste(href)) registrar(p.rel, "ERRO", "link-arquivo", `Link para arquivo inexistente: ${href}`);
      continue;
    }
    const caminho = href.replace(/[?#].*$/, "");
    if (!caminho.endsWith("/")) registrar(p.rel, "AVISO", "link-barra", `Link interno sem barra final: ${href} (use ${caminho}/).`);
    const normal = caminho.endsWith("/") ? caminho : `${caminho}/`;
    if (!caminhos.has(normal) && !destinosRedirect.has(normal)) registrar(p.rel, "ERRO", "link-quebrado", `Link interno para página que não existe: ${href}`);
  }

  // Componentes permitidos e HTML solto (a mesma regra do build).
  const permitidos = new Set(Object.keys(componentesPorFamilia[d.familia]));
  try {
    await compile(corpo, { remarkPlugins: [remarkGfm, validarJsx(permitidos, p.rel)] });
  } catch (e) {
    registrar(p.rel, "ERRO", "mdx", (e as Error).message.replace(/^.*?:\d+:\d+-?\d*:?\d*:?\s*/, ""));
  }

  // ---------------------------------------------------------------- por família
  if (d.familia === "artigo") {
    const palavras = corpo.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
    if (palavras < 300) registrar(p.rel, "AVISO", "artigo-tamanho", `Artigo com ${palavras} palavras; abaixo de 300 o Google tende a considerar conteúdo raso.`);
    if (!d.categorias.length) registrar(p.rel, "AVISO", "artigo-categoria", 'Artigo sem categoria: não aparece nas abas do /blog/ (use "Artigos", "White Papers" ou "E-books").');
    if (!/\]\(\/[^)]*\)/.test(corpo)) registrar(p.rel, "AVISO", "link-interno", "Artigo sem nenhum link interno; aponte para uma solução, case ou outro artigo relacionado.");
  }

  // ---------------------------------------------------------------- agentes.md
  const agentes = path.join(path.dirname(p.arquivo), "agentes.md");
  if (!fs.existsSync(agentes)) registrar(p.rel, "AVISO", "agentes-md", "Sem agentes.md: agentes de IA recebem uma versão automática, menos cuidada.");
}

// ---------------------------------------------------------------- duplicidades (no site todo)
for (const [t, arqs] of titulos) {
  if (arqs.length > 1) for (const a of arqs) registrar(a, "ERRO", "seo-titulo-duplicado", `Título SEO "${t}" repetido em ${arqs.length} páginas.`);
}
if (!alvos.length) {
  for (const [ds, arqs] of descricoes) {
    if (arqs.length > 1) for (const a of arqs) registrar(a, "AVISO", "seo-descricao-duplicada", `Meta description repetida em ${arqs.length} páginas: "${ds.slice(0, 60)}…"`);
  }
}

// ---------------------------------------------------------------- build
if (comBuild && !achados.some((a) => a.nivel === "ERRO")) {
  try {
    execSync("npx next build", { stdio: emJson ? "pipe" : "inherit" });
  } catch (e) {
    registrar("(build)", "ERRO", "build", `next build falhou: ${(e as { stdout?: Buffer }).stdout?.toString().slice(-1500) ?? ""}`);
  }
}

// ---------------------------------------------------------------- saída
const erros = achados.filter((a) => a.nivel === "ERRO");
const avisos = achados.filter((a) => a.nivel === "AVISO");
if (emJson) {
  console.log(JSON.stringify({ paginas: verificar.length, erros: erros.length, avisos: avisos.length, achados }, null, 1));
} else {
  const porArquivo = new Map<string, Achado[]>();
  for (const a of achados) porArquivo.set(a.arquivo, [...(porArquivo.get(a.arquivo) ?? []), a]);
  for (const [arq, lista] of porArquivo) {
    console.log(`\n${arq}`);
    for (const a of lista.sort((x, y) => x.nivel.localeCompare(y.nivel))) console.log(`  ${a.nivel === "ERRO" ? "ERRO " : "aviso"} [${a.regra}] ${a.mensagem}`);
  }
  console.log(`\n${verificar.length} página(s) verificada(s): ${erros.length} erro(s), ${avisos.length} aviso(s).`);
  if (erros.length) console.log("Corrija os ERROS antes de publicar. Avisos são recomendações.");
}
process.exitCode = erros.length ? 1 : 0;
