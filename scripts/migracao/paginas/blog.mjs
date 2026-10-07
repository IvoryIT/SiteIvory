// Conversor do /blog/ (id 52): capa, texto de apresentação e listagem com abas.
// Os cartões NÃO são copiados para o MDX: o componente <BlogListagem> monta a listagem a partir
// das páginas da família "artigo" (cartao + categorias). Daqui só saem a ordem manual dos cartões
// (herdada do WordPress) e os cartões que não são artigos (ex.: IA Tech Radar em "E-books").
import { caminhoMidia, ehContainer, ehWidget, encontrar, encontrarTodos, fundoDe, textoPuro, estiloTituloCapa } from "../lib/wp.mjs";
import { ehArtigo } from "../familias/artigo.mjs";

export const caminhos = ["/blog/"];

const js = (v) => JSON.stringify(v);

export function converter(p, ctx) {
  const avisos = [];

  // Capa: container com imagem de fundo e o título em editor de texto.
  const capaNo = encontrar(p.elementor, (n) => ehContainer(n) && fundoDe(n));
  const tituloCapa = textoPuro(encontrar([capaNo], (n) => ehWidget(n, "text-editor"))?.settings?.editor);
  const capa = ctx.registrarImagem(caminhoMidia(fundoDe(capaNo)));
  const capaMobile = ctx.registrarImagem(caminhoMidia(fundoDe(capaNo, "_mobile")));
  const capaTablet = ctx.registrarImagem(caminhoMidia(fundoDe(capaNo, "_tablet")));

  // Texto de apresentação: primeiro editor de texto fora da capa.
  const introNo = encontrar(p.elementor.slice(1), (n) => ehWidget(n, "text-editor"));
  const intro = ctx.htmlParaMd(introNo?.settings?.editor);

  // Abas.
  const abasNo = encontrar(p.elementor, (n) => ehWidget(n, "nested-tabs"));
  const nomes = (abasNo.settings.tabs ?? []).map((t) => t.tab_title);
  const tituloAbas = abasNo.settings.custom_css?.match(/content:\s*"([^"]+)"/)?.[1] ?? "Categorias";
  const cartoesDa = (i) =>
    encontrarTodos(abasNo.elements[i]?.elements, (n) => ehContainer(n) && n.settings?.link?.url && fundoDe(n)).map((c) => ({
      no: c,
      caminho: ctx.resolverLink(c.settings.link.url).replace(/[?#].*$/, ""),
    }));

  const paginaDe = (caminho) => ctx.wp.paginas.find((x) => x.caminho === caminho);
  const ordem = cartoesDa(0).map((c) => c.caminho);
  const extras = [];
  nomes.forEach((aba, i) => {
    for (const c of cartoesDa(i)) {
      const destino = paginaDe(c.caminho);
      if (destino && ehArtigo(destino)) {
        if (!ordem.includes(c.caminho)) {
          ordem.push(c.caminho);
          avisos.push(`${c.caminho} estava na aba "${aba}" mas não em "${nomes[0]}"; no site novo aparece também em "${nomes[0]}" (no fim da lista)`);
        }
        continue;
      }
      if (i === 0) avisos.push(`cartão de "${nomes[0]}" que não é artigo foi ignorado: ${c.caminho}`);
      if (extras.some((e) => e.href === c.caminho && e.aba === aba)) continue;
      const textos = encontrarTodos(c.no.elements, (n) => ehWidget(n, "text-editor")).map((t) => textoPuro(t.settings.editor));
      extras.push({
        aba,
        href: c.caminho,
        imagem: ctx.registrarImagem(caminhoMidia(fundoDe(c.no))),
        titulo: textos[0],
        ...(textos[1] ? { resumo: textos[1] } : {}),
      });
    }
  });

  // A ordem do WordPress é manual (não segue a data de publicação): fica registrada no MDX.
  const objeto = (o) => `{ ${Object.entries(o).map(([k, v]) => `${k}: ${js(v)}`).join(", ")} }`;
  const linhasExtras = extras.map((e) => `    ${objeto(e)},`);
  const corpo = [
    `<BlogIntroducao>\n${intro}\n</BlogIntroducao>`,
    [
      "<BlogListagem",
      `  titulo=${js(tituloAbas)}`,
      `  todos=${js(nomes[0])}`,
      `  abas={${js(nomes.slice(1)).replace(/","/g, '", "')}}`,
      ...(extras.length ? ["  extras={[", ...linhasExtras, "  ]}"] : []),
      "  ordem={[",
      ...ordem.map((c) => `    ${js(c)},`),
      "  ]}",
      "/>",
    ].join("\n"),
  ].join("\n\n");

  return {
    familia: "pagina",
    frontmatter: {
      familia: "pagina",
      titulo: p.titulo,
      tituloCapa: tituloCapa !== p.titulo ? tituloCapa : undefined,
      capa,
      capaMobile: capaMobile !== capa ? capaMobile : undefined,
      capaTablet: capaTablet && capaTablet !== capaMobile ? capaTablet : undefined,
      capaTitulo: estiloTituloCapa(encontrar([capaNo], (n) => ehWidget(n, "text-editor") || ehWidget(n, "heading"))),
    },
    corpo,
    avisos,
  };
}
