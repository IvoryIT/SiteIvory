// Markdown de cada página para agentes de IA. Acessado pela mesma URL da página quando o
// cliente envia "Accept: text/markdown" (rewrite em next.config.ts), substituindo o plugin
// Agent Markdown Responses do WordPress.
import { listarPaginas, obterPagina } from "@/lib/conteudo";
import { markdownDaPagina } from "@/lib/markdown";

export async function generateStaticParams() {
  return (await listarPaginas()).map((p) => ({ slug: p.segmentos }));
}

export async function GET(_req: Request, { params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug = [] } = await params;
  const pagina = await obterPagina(slug);
  if (!pagina) return new Response("Página não encontrada.\n", { status: 404, headers: { "Content-Type": "text/markdown; charset=utf-8" } });
  return new Response(markdownDaPagina(pagina), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      Vary: "Accept",
      // A versão Markdown não deve aparecer na busca como página separada.
      "X-Robots-Tag": "noindex",
      Link: `<https://ivoryit.com.br${pagina.caminho}>; rel="canonical"`,
    },
  });
}
