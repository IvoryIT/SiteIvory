// /llms.txt (formato llmstxt.org): mapa do site para modelos de linguagem.
// Antes era gerado pelo Yoast e listava só 4 páginas; agora lista todas as públicas, por seção.
import { ehPublica, listarPaginas, type Pagina } from "@/lib/conteudo";
import type { Familia } from "@/lib/esquema";
import { site } from "@/lib/site";

const secoes: { titulo: string; familias: Familia[] }[] = [
  { titulo: "Páginas", familias: ["pagina"] },
  { titulo: "Soluções", familias: ["solucao"] },
  { titulo: "Cases por setor", familias: ["setor"] },
  { titulo: "Cases", familias: ["case"] },
  { titulo: "Blog", familias: ["artigo"] },
];

const item = (p: Pagina) => `- [${p.dados.titulo}](${site.url}${p.caminho}): ${p.dados.seo.descricao.replace(/\s+/g, " ").trim()}`;

export async function GET() {
  const paginas = (await listarPaginas()).filter(ehPublica);
  const linhas = [`# ${site.nome}: Desenvolvimento de software com IA Agêntica`, "", `> ${site.descricao}`, ""];
  linhas.push("Cada página também está disponível em Markdown na mesma URL, com o cabeçalho `Accept: text/markdown`.", "");
  for (const s of secoes) {
    const doGrupo = paginas
      .filter((p) => s.familias.includes(p.dados.familia))
      .sort((a, b) => (s.familias[0] === "artigo" ? b.dados.publicadoEm.getTime() - a.dados.publicadoEm.getTime() : a.caminho.localeCompare(b.caminho)));
    if (!doGrupo.length) continue;
    linhas.push(`## ${s.titulo}`, ...doGrupo.map(item), "");
  }
  linhas.push("## Optional", `- [Sitemap](${site.url}/sitemap.xml)`, "");
  return new Response(linhas.join("\n"), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
