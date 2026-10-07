// Carrega as páginas de content/paginas. A pasta é a URL:
//   content/paginas/index.mdx                      -> /
//   content/paginas/blog/blog-ia-segura/index.mdx  -> /blog/blog-ia-segura/
// Ao lado de cada index.mdx pode existir agentes.md (versão em Markdown entregue a agentes de IA).
import fsSync from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { cacheLife } from "next/cache";
import { frontmatterSchema, type Familia, type Frontmatter } from "./esquema";

export const RAIZ_CONTEUDO = path.join(process.cwd(), "content", "paginas");

export type Pagina = {
  /** URL com barra final, ex.: "/blog/blog-ia-segura/". */
  caminho: string;
  /** Segmentos da URL, ex.: ["blog", "blog-ia-segura"]. Vazio na home. */
  segmentos: string[];
  /** Arquivo de origem relativo à raiz do projeto. */
  arquivo: string;
  dados: Frontmatter;
  /** Corpo MDX (sem o cabeçalho). */
  corpo: string;
  /** Conteúdo de agentes.md, se existir. */
  markdownAgentes?: string;
};

async function coletarArquivos(dir: string): Promise<string[]> {
  const entradas = await fs.readdir(dir, { withFileTypes: true });
  const arquivos: string[] = [];
  for (const e of entradas) {
    const completo = path.join(dir, e.name);
    if (e.isDirectory()) arquivos.push(...(await coletarArquivos(completo)));
    else if (e.name === "index.mdx") arquivos.push(completo);
  }
  return arquivos;
}

function formatarErro(arquivo: string, erro: { issues: { path: PropertyKey[]; message: string }[] }) {
  const linhas = erro.issues.map((i) => `  - ${i.path.map(String).join(".") || "(raiz)"}: ${i.message}`);
  return `Cabeçalho inválido em ${arquivo}:\n${linhas.join("\n")}`;
}

async function lerPagina(arquivoAbs: string): Promise<Pagina> {
  const bruto = await fs.readFile(arquivoAbs, "utf8");
  const { data, content } = matter(bruto);
  const arquivo = path.relative(process.cwd(), arquivoAbs).split(path.sep).join("/");
  const resultado = frontmatterSchema.safeParse(data);
  if (!resultado.success) throw new Error(formatarErro(arquivo, resultado.error));

  const pasta = path.dirname(arquivoAbs);
  const segmentos = path.relative(RAIZ_CONTEUDO, pasta).split(path.sep).filter(Boolean);
  const caminho = segmentos.length ? `/${segmentos.join("/")}/` : "/";
  const markdownAgentes = await fs.readFile(path.join(pasta, "agentes.md"), "utf8").catch(() => undefined);

  return { caminho, segmentos, arquivo, dados: resultado.data, corpo: content, markdownAgentes };
}

/**
 * Versão do conteúdo para a chave do cache. Em desenvolvimento muda a cada arquivo (ou pasta)
 * criado, alterado ou apagado em content/, para a prévia mostrar a edição na hora; no build é fixa.
 */
function versaoConteudo(): string {
  if (process.env.NODE_ENV !== "development") return "build";
  let maior = 0;
  const visitar = (dir: string) => {
    maior = Math.max(maior, fsSync.statSync(dir).mtimeMs);
    for (const e of fsSync.readdirSync(dir, { withFileTypes: true })) {
      const completo = path.join(dir, e.name);
      if (e.isDirectory()) visitar(completo);
      else maior = Math.max(maior, fsSync.statSync(completo).mtimeMs);
    }
  };
  visitar(path.join(process.cwd(), "content"));
  return String(maior);
}

async function listarPaginasVersao(versao: string): Promise<Pagina[]> {
  "use cache";
  // Conteúdo só muda a cada deploy: nada de regenerar periodicamente.
  cacheLife("max");
  void versao;
  const arquivos = await coletarArquivos(RAIZ_CONTEUDO);
  const paginas = await Promise.all(arquivos.map(lerPagina));
  return paginas.sort((a, b) => a.caminho.localeCompare(b.caminho));
}

export async function listarPaginas(): Promise<Pagina[]> {
  return listarPaginasVersao(versaoConteudo());
}

async function obterPaginaVersao(segmentos: string[], versao: string): Promise<Pagina | undefined> {
  "use cache";
  // Conteúdo só muda a cada deploy: nada de regenerar periodicamente.
  cacheLife("max");
  const caminho = segmentos.length ? `/${segmentos.map(decodeURIComponent).join("/")}/` : "/";
  return (await listarPaginasVersao(versao)).find((p) => p.caminho === caminho);
}

export async function obterPagina(segmentos: string[]): Promise<Pagina | undefined> {
  return obterPaginaVersao(segmentos, versaoConteudo());
}

export async function listarPorFamilia<F extends Familia>(familia: F) {
  const paginas = await listarPaginas();
  return paginas.filter((p) => p.dados.familia === familia) as (Pagina & { dados: Extract<Frontmatter, { familia: F }> })[];
}

/** Páginas visíveis em listagens, sitemap e llms.txt. */
export function ehPublica(p: Pagina) {
  return !p.dados.oculta && !p.dados.seo.noindex;
}

/** Blocos compartilhados entre páginas (ex.: "Insights recentes"), em content/blocos/<nome>.json. */
export async function lerBloco<T>(nome: string): Promise<T> {
  return lerBlocoVersao<T>(nome, versaoConteudo());
}

async function lerBlocoVersao<T>(nome: string, versao: string): Promise<T> {
  "use cache";
  // Conteúdo só muda a cada deploy: nada de regenerar periodicamente.
  cacheLife("max");
  void versao;
  const arquivo = path.join(process.cwd(), "content", "blocos", `${nome}.json`);
  return JSON.parse(await fs.readFile(arquivo, "utf8")) as T;
}

export type ItemBreadcrumb = { nome: string; caminho: string };

/** Trilha "Início » Pai » Página", igual à do Yoast no WordPress. */
export async function trilha(pagina: Pagina): Promise<ItemBreadcrumb[]> {
  const todas = await listarPaginas();
  const itens: ItemBreadcrumb[] = [{ nome: "Início", caminho: "/" }];
  for (let i = 1; i < pagina.segmentos.length; i++) {
    const caminho = `/${pagina.segmentos.slice(0, i).join("/")}/`;
    const pai = todas.find((p) => p.caminho === caminho);
    if (pai) itens.push({ nome: pai.dados.breadcrumb ?? pai.dados.titulo, caminho });
  }
  if (pagina.caminho !== "/") itens.push({ nome: pagina.dados.breadcrumb ?? pagina.dados.titulo, caminho: pagina.caminho });
  return itens;
}
