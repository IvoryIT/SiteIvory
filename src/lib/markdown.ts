// Versão Markdown das páginas para agentes de IA (Accept: text/markdown e /llms.txt).
import type { Pagina } from "./conteudo";
import { site } from "./site";

/** Markdown editorial da página: agentes.md, ou o corpo MDX sem os componentes. */
export function markdownDaPagina(p: Pagina): string {
  if (p.markdownAgentes?.trim()) return p.markdownAgentes.trim() + "\n";
  const corpo = p.corpo
    // <Imagem src="x" alt="y" /> -> ![y](x)
    .replace(/<Imagem\s[^>]*src="([^"]+)"[^>]*alt="([^"]*)"[^>]*\/>/g, (_, src, alt) => `![${alt}](${site.url}${src})`)
    // Demais tags de componente somem; o texto dentro delas fica.
    .replace(/<\/?[A-Z][A-Za-z]*(\s[^>]*)?\/?>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return `# ${p.dados.titulo}\n\n> ${p.dados.seo.descricao}\n\n${corpo}\n`;
}
