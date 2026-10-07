// Metadados de SEO (substitui o Yoast): <title>, description, canonical, Open Graph,
// Twitter e o JSON-LD de cada página.
import type { Metadata } from "next";
import type { Pagina } from "./conteudo";
import { site } from "./site";

const IMAGEM_PADRAO = "/wp-content/uploads/2025/09/section-bg.svg.png";

export function imagemCompartilhamento(p: Pagina): string {
  const d = p.dados;
  if (d.seo.imagem) return d.seo.imagem;
  if ("capa" in d && d.capa) return d.capa;
  if ("imagem" in d && d.imagem) return d.imagem;
  return IMAGEM_PADRAO;
}

export function metadadosDaPagina(p: Pagina): Metadata {
  const d = p.dados;
  const url = `${site.url}${p.caminho}`;
  const imagem = `${site.url}${imagemCompartilhamento(p)}`;
  const ehArtigo = d.familia === "artigo";
  return {
    title: { absolute: d.seo.titulo },
    description: d.seo.descricao,
    alternates: { canonical: url },
    robots: d.seo.noindex ? { index: false, follow: true } : { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
    openGraph: {
      type: ehArtigo ? "article" : "website",
      locale: "pt_BR",
      siteName: site.nome,
      url,
      title: d.seo.titulo,
      description: d.seo.descricao,
      images: [{ url: imagem }],
      ...(ehArtigo ? { publishedTime: d.publicadoEm.toISOString(), modifiedTime: (d.atualizadoEm ?? d.publicadoEm).toISOString() } : {}),
    },
    twitter: { card: "summary_large_image", title: d.seo.titulo, description: d.seo.descricao, images: [imagem] },
  };
}

/** JSON-LD da página: Organization + WebSite + WebPage (ou Article). Breadcrumb vem do componente. */
export function jsonLdDaPagina(p: Pagina) {
  const d = p.dados;
  const url = `${site.url}${p.caminho}`;
  const organizacao = {
    "@type": "Organization",
    "@id": `${site.url}/#organization`,
    name: site.nome,
    url: `${site.url}/`,
    logo: { "@type": "ImageObject", url: `${site.url}${site.logo}` },
    sameAs: site.redes.map((r) => r.url),
  };
  const webSite = {
    "@type": "WebSite",
    "@id": `${site.url}/#website`,
    url: `${site.url}/`,
    name: site.nome,
    description: site.descricao,
    publisher: { "@id": `${site.url}/#organization` },
    inLanguage: "pt-BR",
  };
  const pagina = {
    "@type": d.familia === "artigo" ? ["WebPage", "Article"] : "WebPage",
    "@id": url,
    url,
    name: d.seo.titulo,
    headline: d.titulo,
    description: d.seo.descricao,
    isPartOf: { "@id": `${site.url}/#website` },
    primaryImageOfPage: { "@type": "ImageObject", url: `${site.url}${imagemCompartilhamento(p)}` },
    datePublished: d.publicadoEm.toISOString(),
    dateModified: (d.atualizadoEm ?? d.publicadoEm).toISOString(),
    inLanguage: "pt-BR",
    ...(d.familia === "artigo" ? { author: { "@id": `${site.url}/#organization` }, publisher: { "@id": `${site.url}/#organization` } } : {}),
  };
  return { "@context": "https://schema.org", "@graph": [organizacao, webSite, pagina] };
}
