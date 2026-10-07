// Lê o <head> renderizado pelo WordPress local de cada página publicada (título, description,
// Open Graph, canonical) para a migração reproduzir o SEO exatamente como o Yoast entrega hoje.
// Uso: node scripts/migracao/capturar-head.mjs [export.json] [saida.json]
import fs from "node:fs";

const [entrada = ".tmp/wp-export.json", saida = ".tmp/wp-head.json"] = process.argv.slice(2);
const BASE = process.env.WP_LOCAL || "http://localhost:8080";
const { paginas } = JSON.parse(fs.readFileSync(entrada, "utf8"));

const decodificar = (s) =>
  s
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ");

const meta = (html, atributo, valor) => {
  const re = new RegExp(`<meta[^>]+${atributo}=["']${valor}["'][^>]*>`, "i");
  const tag = html.match(re)?.[0];
  const conteudo = tag?.match(/content=["']([^"']*)["']/i)?.[1];
  return conteudo ? decodificar(conteudo) : undefined;
};

const resultado = {};
const fila = [...paginas];
async function trabalhador() {
  while (fila.length) {
    const p = fila.shift();
    const caminho = new URL(p.permalink).pathname;
    try {
      const html = await (await fetch(BASE + caminho)).text();
      const head = html.slice(0, html.indexOf("</head>"));
      const jsonLd = [...head.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)].map((m) => m[1].trim());
      resultado[p.id] = {
        caminho,
        titulo: decodificar(head.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? "").trim(),
        descricao: meta(head, "name", "description"),
        canonico: head.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)/i)?.[1],
        robots: meta(head, "name", "robots"),
        ogTitulo: meta(head, "property", "og:title"),
        ogDescricao: meta(head, "property", "og:description"),
        ogImagem: meta(head, "property", "og:image"),
        ogTipo: meta(head, "property", "og:type"),
        publicado: meta(head, "property", "article:published_time"),
        modificado: meta(head, "property", "article:modified_time"),
        jsonLd,
      };
      console.log(`ok ${caminho}`);
    } catch (e) {
      console.log(`ERRO ${caminho}: ${e.message}`);
    }
  }
}
await Promise.all([trabalhador(), trabalhador(), trabalhador()]);
fs.writeFileSync(saida, JSON.stringify(resultado, null, 1));
console.log(`${Object.keys(resultado).length} páginas -> ${saida}`);
