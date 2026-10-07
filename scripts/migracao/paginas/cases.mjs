// Conversor do hub /cases-de-sucesso-ivory/ (id 50): capa, abas por setor com os cartões dos
// cases e a faixa de depoimentos. Os cartões NÃO são copiados para o MDX: o <CasesListagem> monta
// as abas a partir das páginas da família "case" (cartao, categoria, ordem) e dos `casosDoHub`
// dos setores. Daqui só sai a ordem das abas.
import { attr, caminhoMidia, ehContainer, ehWidget, encontrar, encontrarTodos, estiloTituloCapa, fundoDe, textoPuro } from "../lib/wp.mjs";

export const caminhos = ["/cases-de-sucesso-ivory/"];

const MOLDURA = "/wp-content/uploads/2025/09/Group-574-1.png";

export function converter(p, ctx) {
  const avisos = [];

  // Capa: container com imagem de fundo e o título (h1 num editor de texto).
  const capaNo = encontrar(p.elementor, (n) => ehContainer(n) && fundoDe(n));
  const tituloNo = encontrar([capaNo], (n) => ehWidget(n, "text-editor"));
  const tituloCapa = textoPuro(tituloNo?.settings?.editor);
  const capa = ctx.registrarImagem(caminhoMidia(fundoDe(capaNo)));
  const capaMobile = ctx.registrarImagem(caminhoMidia(fundoDe(capaNo, "_mobile")));
  const capaTablet = ctx.registrarImagem(caminhoMidia(fundoDe(capaNo, "_tablet")));

  // Abas: só a ordem dos nomes (os cartões vêm dos cases).
  const abasNo = encontrar(p.elementor, (n) => ehWidget(n, "nested-tabs"));
  const nomes = (abasNo.settings.tabs ?? []).map((t) => t.tab_title);
  const tituloAbas = abasNo.settings.custom_css?.match(/content:\s*"([^"]+)"/)?.[1] ?? "Categorias";
  ctx.registrarImagem(MOLDURA);
  for (const c of encontrarTodos(abasNo.elements, (n) => ehContainer(n) && n.settings?.link?.url)) {
    const destino = ctx.resolverLink(c.settings.link.url).replace(/[?#].*$/, "");
    if (!/^\/case-/.test(destino) || !ctx.wp.paginas.some((x) => x.caminho === destino)) {
      avisos.push(`cartão "${c.settings.link.url}" não leva a uma página de case (no WordPress dá 404); no site novo ele vem de "casosDoHub" do setor e leva à âncora do case no hub`);
    }
    const moldura = caminhoMidia(fundoDe(c));
    if (moldura && moldura !== MOLDURA && !/Group-574\.png$/.test(moldura)) avisos.push(`moldura diferente no cartão ${destino}: ${moldura}`);
  }

  // Depoimentos (carrossel aninhado).
  const carrossel = encontrar(p.elementor, (n) => ehWidget(n, "nested-carousel"));
  const faixaDep = p.elementor.find((n) => encontrar([n], (x) => x === carrossel));
  const tituloDep = textoPuro(encontrar([faixaDep], (n) => ehWidget(n, "text-editor") && !encontrar([carrossel], (x) => x === n))?.settings?.editor);
  const nomesSlides = (carrossel?.settings?.carousel_items ?? []).map((s) => s.slide_title);
  const depoimentos = (carrossel?.elements ?? []).map((slide, i) => {
    const img = encontrar([slide], (n) => ehWidget(n, "image"));
    const texto = encontrar([slide], (n) => ehWidget(n, "text-editor"))?.settings?.editor ?? "";
    // "“Citação”<br><br><strong>Autor</strong><br>Cargo"
    const partes = texto
      .replace(/^\s*<p>|<\/p>\s*$/g, "")
      .split(/<br\s*\/?>/i)
      .map((x) => x.trim())
      .filter((x) => textoPuro(x));
    const iAutor = partes.findIndex((x) => /<strong>/i.test(x));
    const citacao = partes.slice(0, iAutor).map((x) => ctx.htmlParaMd(`<p>${x}</p>`)).join("\n\n");
    const autor = textoPuro(partes[iAutor]);
    const cargo = textoPuro(partes.slice(iAutor + 1).join(" "));
    const logo = img ? ctx.registrarImagem(caminhoMidia(img.settings.image?.url)) : undefined;
    const empresa = textoPuro(img?.settings?.image?.alt) || nomesSlides[i] || "";
    return { logo, empresa, autor, cargo, citacao };
  });

  const corpo = [
    `<CasesListagem titulo="${attr(tituloAbas)}" categorias={${JSON.stringify(nomes)}} />`,
    `<CasesDepoimentos titulo="${attr(tituloDep)}">\n${depoimentos
      .map(
        (d) =>
          `<CasesDepoimento${d.logo ? ` logo="${attr(d.logo)}"` : ""} empresa="${attr(d.empresa)}" autor="${attr(d.autor)}"${d.cargo ? ` cargo="${attr(d.cargo)}"` : ""}>\n${d.citacao}\n</CasesDepoimento>`,
      )
      .join("\n")}\n</CasesDepoimentos>`,
  ];

  return {
    familia: "pagina",
    frontmatter: {
      familia: "pagina",
      titulo: tituloCapa,
      capa,
      capaMobile: capaMobile !== capa ? capaMobile : undefined,
      capaTablet: capaTablet && capaTablet !== capaMobile ? capaTablet : undefined,
      // O título é um <h1> dentro do editor de texto: o tema fixa 2.5rem (entrelinha 1.2) em todas as telas.
      ...(/<h1/i.test(tituloNo?.settings?.editor ?? "")
        ? { tamanhoTitulo: 2.5, capaTitulo: { ...estiloTituloCapa(tituloNo), entrelinha: 1.2, tamanhoTablet: 2.5, tamanhoMobile: 2.5 } }
        : { capaTitulo: estiloTituloCapa(tituloNo) }),
      final: "contato",
    },
    corpo: corpo.join("\n\n"),
    avisos,
  };
}
