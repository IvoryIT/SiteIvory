// Grava uma página convertida em content/paginas/<caminho>/index.mdx (+ agentes.md).
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const RAIZ = path.join(process.cwd(), "content", "paginas");

function data(d) {
  return d ? String(d).slice(0, 10) : undefined;
}

/** Remove chaves vazias para o cabeçalho ficar limpo. */
function limpar(obj) {
  if (Array.isArray(obj)) return obj.map(limpar);
  if (obj && typeof obj === "object") {
    const r = {};
    for (const [k, v] of Object.entries(obj)) {
      if (v === undefined || v === null || v === "" || (Array.isArray(v) && v.length === 0 && k !== "categorias")) continue;
      r[k] = limpar(v);
    }
    return r;
  }
  return obj;
}

export function escreverPagina({ caminho, frontmatter, corpo, agentes }) {
  const pasta = path.join(RAIZ, ...caminho.split("/").filter(Boolean));
  fs.mkdirSync(pasta, { recursive: true });
  const fm = limpar({ ...frontmatter, publicadoEm: data(frontmatter.publicadoEm), atualizadoEm: data(frontmatter.atualizadoEm) });
  const texto = matter.stringify(`\n${corpo.trim()}\n`, fm, { lineWidth: -1 });
  fs.writeFileSync(path.join(pasta, "index.mdx"), texto.replace(/\r\n/g, "\n"));
  if (agentes && agentes.trim()) fs.writeFileSync(path.join(pasta, "agentes.md"), agentes.replace(/\r\n/g, "\n").trim() + "\n");
  return path.join(pasta, "index.mdx");
}

/** Título do WordPress como o Yoast mostra no breadcrumb (wptexturize troca " - " por " – "). */
export function tituloTexturizado(titulo) {
  return String(titulo).replace(/ - /g, " – ").replace(/ -(\S)/g, " –$1");
}
