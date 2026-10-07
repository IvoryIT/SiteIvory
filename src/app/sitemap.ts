import type { MetadataRoute } from "next";
import { ehPublica, listarPaginas } from "@/lib/conteudo";
import { site } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const paginas = (await listarPaginas()).filter(ehPublica);
  return paginas.map((p) => ({
    url: `${site.url}${p.caminho}`,
    lastModified: p.dados.atualizadoEm ?? p.dados.publicadoEm,
  }));
}
