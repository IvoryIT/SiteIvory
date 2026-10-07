// Família "pagina": cada página única (home, institucionais, hubs, legais) tem seu conversor em
// scripts/migracao/paginas/<nome>.mjs, que exporta `caminhos` (URLs que trata) e `converter`.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const pasta = path.resolve("scripts/migracao/paginas");
const modulos = [];
for (const arq of fs.existsSync(pasta) ? fs.readdirSync(pasta).filter((f) => f.endsWith(".mjs")) : []) {
  modulos.push(await import(pathToFileURL(path.join(pasta, arq)).href));
}

export function converter(p, ctx) {
  const mod = modulos.find((m) => m.caminhos?.includes(p.caminho));
  if (mod) return mod.converter(p, ctx);
  return ctx.converterGenerico(p, ctx);
}
