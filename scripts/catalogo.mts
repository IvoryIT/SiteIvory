// Catálogo vivo dos componentes MDX: para cada família, quais componentes são permitidos,
// onde está o código (para ler as props) e um exemplo real de uso tirado do conteúdo.
//
// Uso: npx tsx scripts/catalogo.mts [familia]      (artigo | case | setor | solucao | pagina)
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { componentesPorFamilia } from "../src/components/familias/registro";

const RAIZ = path.join(process.cwd(), "content", "paginas");
const filtro = process.argv[2];

function coletar(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const c = path.join(dir, e.name);
    return e.isDirectory() ? coletar(c) : e.name === "index.mdx" ? [c] : [];
  });
}

const paginas = coletar(RAIZ).map((arq) => {
  const { data, content } = matter(fs.readFileSync(arq, "utf8"));
  return { arq: path.relative(process.cwd(), arq).split(path.sep).join("/"), familia: data.familia as string, corpo: content };
});

/** Primeiro bloco JSX completo do componente no corpo (auto-fechado ou com filhos). */
function exemplo(corpo: string, nome: string): string | undefined {
  const ini = corpo.search(new RegExp(`<${nome}[\\s/>]`));
  if (ini < 0) return undefined;
  const resto = corpo.slice(ini);
  const auto = resto.match(new RegExp(`^<${nome}\\b[^>]*?/>`, "s"));
  if (auto) return auto[0];
  const fim = resto.indexOf(`</${nome}>`);
  const bloco = fim >= 0 ? resto.slice(0, fim + nome.length + 3) : resto.split("\n").slice(0, 12).join("\n");
  const linhas = bloco.split("\n");
  return linhas.length > 25 ? [...linhas.slice(0, 22), "  …", ...linhas.slice(-2)].join("\n") : bloco;
}

/** Arquivo onde o componente é definido (busca por "function Nome" em src/components). */
function definicao(nome: string): string | undefined {
  const base = path.join(process.cwd(), "src", "components");
  const arquivos = (function listar(d: string): string[] {
    return fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? listar(path.join(d, e.name)) : /\.tsx?$/.test(e.name) ? [path.join(d, e.name)] : []));
  })(base);
  for (const a of arquivos) {
    if (new RegExp(`(function|const)\\s+${nome}\\b`).test(fs.readFileSync(a, "utf8"))) return path.relative(process.cwd(), a).split(path.sep).join("/");
  }
  return undefined;
}

for (const [familia, mapa] of Object.entries(componentesPorFamilia)) {
  if (filtro && familia !== filtro) continue;
  const daFamilia = paginas.filter((p) => p.familia === familia);
  console.log(`\n## Família "${familia}" — ${daFamilia.length} página(s)`);
  if (daFamilia.length) console.log(`Exemplos de página: ${daFamilia.slice(0, 3).map((p) => p.arq).join(", ")}`);
  for (const nome of Object.keys(mapa).sort()) {
    const usos = daFamilia.filter((p) => new RegExp(`<${nome}[\\s/>]`).test(p.corpo));
    console.log(`\n### <${nome}>  (${usos.length} página(s) usam; código: ${definicao(nome) ?? "?"})`);
    const ex = usos.length ? exemplo(usos[0].corpo, nome) : undefined;
    if (ex) console.log("```mdx\n" + ex + "\n```" + `\n(de ${usos[0].arq})`);
  }
}
