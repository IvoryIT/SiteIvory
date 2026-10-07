// Rota única do site: cada arquivo content/paginas/**/index.mdx vira uma URL estática.
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Modelo } from "@/components/familias/Modelo";
import { listarPaginas, obterPagina } from "@/lib/conteudo";
import { jsonLdDaPagina, metadadosDaPagina } from "@/lib/seo";

type Props = { params: Promise<{ slug?: string[] }> };

// Todas as URLs são conhecidas no build (generateStaticParams) e saem como HTML estático;
// a validação de "navegação instantânea" não se aplica a esta rota.
export const instant = false;

export async function generateStaticParams() {
  const paginas = await listarPaginas();
  return paginas.map((p) => ({ slug: p.segmentos }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug = [] } = await params;
  const pagina = await obterPagina(slug);
  return pagina ? metadadosDaPagina(pagina) : {};
}

export default async function PaginaDoSite({ params }: Props) {
  const { slug = [] } = await params;
  const pagina = await obterPagina(slug);
  if (!pagina) notFound();
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdDaPagina(pagina)) }} />
      <Modelo pagina={pagina} />
    </>
  );
}
