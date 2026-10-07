// Conversor do /carreiras/ (id 54). Seções do Elementor, na ordem:
//   capa | 3 cartões com imagem de fundo (o 1º é um mailto com alert do e-mail de currículos)
//   | "Por que escolher a Ivory?" | "Benefícios" (mosaico colorido + botão) | "Nossas frentes de impacto"
//   | topo do rodapé (template 2421 = final "topo", padrão do molde)
import { attr, caminhoMidia, ehContainer, ehWidget, encontrar, encontrarTodos, fundoDe, ocultoSempre, textoPuro, estiloTituloCapa } from "../lib/wp.mjs";

export const caminhos = ["/carreiras/"];

const CORES = { "#003d5b": "azul", "#861657": "vinho", "#f35b04": "laranja" };

/** Markdown do editor de texto do Elementor (conversor comum). */
const md = (ctx, html) => ctx.htmlParaMd(html);

const textos = (no) => encontrarTodos(no.elements, (n) => ehWidget(n, "text-editor") && !ocultoSempre(n));

export function converter(p, ctx) {
  const avisos = [];
  const [capaSecao, cartoesSecao, motivosSecao, beneficiosSecao, frentesSecao, ...resto] = p.elementor;
  if (resto.some((n) => !encontrar([n], (x) => ehWidget(x, "template") && Number(x.settings.template_id) === 2421))) {
    avisos.push("há seções depois de 'Nossas frentes de impacto' que não foram convertidas");
  }

  // Capa.
  const capaNo = encontrar([capaSecao], (n) => ehContainer(n) && fundoDe(n));
  const tituloCapa = textoPuro(textos(capaNo)[0]?.settings.editor);
  const capa = ctx.registrarImagem(caminhoMidia(fundoDe(capaNo)));
  const capaMobile = ctx.registrarImagem(caminhoMidia(fundoDe(capaNo, "_mobile")));
  const capaTablet = ctx.registrarImagem(caminhoMidia(fundoDe(capaNo, "_tablet")));

  const blocos = [];

  // Cartões de abertura.
  const cartoes = cartoesSecao.elements.filter(ehContainer).map((c) => {
    const imagem = ctx.registrarImagem(caminhoMidia(fundoDe(c)));
    const texto = textos(c)
      .map((t) => md(ctx, t.settings.editor))
      .filter(Boolean)
      .join("\n\n");
    const script = encontrar(c.elements, (n) => ehWidget(n, "html"))?.settings?.html ?? "";
    const alerta = script.match(/alert\(\s*["'`]([^"'`]+)["'`]\s*\)/)?.[1];
    if (alerta) {
      const email = alerta.match(/[\w.+-]+@[\w.-]+/)?.[0];
      if (email && email !== "genteegestao@ivoryit.com.br") avisos.push(`o alert do cartão usa ${email}, diferente de site.emailCurriculos`);
      if (c.settings.link?.url && !/^mailto:/.test(c.settings.link.url)) avisos.push(`cartão do currículo tem link inesperado: ${c.settings.link.url}`);
      const aviso = alerta.replace(email ?? "", "").trim();
      return `<CarreirasCurriculo imagem="${attr(imagem)}" aviso="${attr(aviso)}">\n${texto}\n</CarreirasCurriculo>`;
    }
    if (!texto) {
      const descricao = c.settings.background_image?.alt || ctx.altDe(imagem) || "Logotipos de clientes da Ivory";
      return `<CarreirasCartao imagem="${attr(imagem)}" descricao="${attr(descricao)}" />`;
    }
    return `<CarreirasCartao imagem="${attr(imagem)}">\n${texto}\n</CarreirasCartao>`;
  });
  blocos.push(`<CarreirasCartoes>\n${cartoes.join("\n\n")}\n</CarreirasCartoes>`);

  // "Por que escolher a Ivory?"
  const [tituloMotivos] = textos(motivosSecao);
  const linhaMotivos = motivosSecao.elements.find(ehContainer);
  const motivos = linhaMotivos.elements.filter(ehContainer).map((m) => {
    const [t, d] = textos(m);
    return `<CarreirasMotivo titulo="${attr(textoPuro(t.settings.editor))}">\n${md(ctx, d.settings.editor)}\n</CarreirasMotivo>`;
  });
  blocos.push(`<CarreirasMotivos titulo="${attr(textoPuro(tituloMotivos.settings.editor))}">\n${motivos.join("\n\n")}\n</CarreirasMotivos>`);

  // Benefícios: colunas com blocos coloridos (altura de 260px = bloco alto) e o botão.
  const [tituloBeneficios] = textos(beneficiosSecao);
  const linhaBeneficios = beneficiosSecao.elements.find(ehContainer);
  const colunas = linhaBeneficios.elements.filter(ehContainer);
  const porColuna = new Set(colunas.map((c) => c.elements.filter(ehContainer).length));
  if (porColuna.size > 1) avisos.push("benefícios: colunas com quantidades diferentes de blocos; <CarreirasBeneficios> distribui por igual");
  const beneficios = colunas.flatMap((col) =>
    col.elements.filter(ehContainer).map((b) => {
      const cor = CORES[String(b.settings.background_color).toLowerCase()];
      if (!cor) avisos.push(`benefício com cor fora da paleta: ${b.settings.background_color}`);
      const alto = Number(b.settings.min_height?.size) >= 200 ? " alto" : "";
      const texto = md(ctx, textos(b)[0].settings.editor).replace(/ {2}\n/g, "<br />");
      return `<CarreirasBeneficio cor="${cor ?? "azul"}"${alto}>${texto}</CarreirasBeneficio>`;
    }),
  );
  const botao = encontrar(beneficiosSecao.elements, (n) => ehWidget(n, "button"));
  if (botao && !/^mailto:genteegestao@/.test(botao.settings.link?.url ?? "")) avisos.push(`botão dos benefícios aponta para ${botao.settings.link?.url}; o componente usa o e-mail de currículos`);
  blocos.push(
    `<CarreirasBeneficios titulo="${attr(textoPuro(tituloBeneficios.settings.editor))}"${botao ? ` botao="${attr(textoPuro(botao.settings.text))}"` : ""}${colunas.length !== 3 ? ` colunas={${colunas.length}}` : ""}>\n${beneficios.join("\n")}\n</CarreirasBeneficios>`,
  );

  // Nossas frentes de impacto: título com a última palavra em destaque e duas colunas de itens.
  const caixa = frentesSecao.elements.find(ehContainer);
  const tituloHtml = textos(caixa)[0].settings.editor;
  const destaque = textoPuro(tituloHtml.match(/<(em|strong)[\s\S]*$/)?.[0] ?? "");
  const tituloFrentes = textoPuro(tituloHtml).replace(destaque, "").trim();
  const itens = encontrarTodos(caixa.elements, (n) => ehContainer(n) && Number(n.settings.min_height?.size) === 11).map((item) => {
    const html = textos(item)[0].settings.editor;
    const [, primeiro, restoHtml] = html.match(/^\s*(<p>[\s\S]*?<\/p>)([\s\S]*)$/) ?? [];
    // A linha em branco entre o título e o texto é desenhada pelo <CarreirasFrente>.
    const corpo = md(ctx, restoHtml ?? "").replace(/^(&nbsp;\s*)+/, "");
    return `<CarreirasFrente titulo="${attr(textoPuro(primeiro))}">\n${corpo}\n</CarreirasFrente>`;
  });
  blocos.push(`<CarreirasFrentes titulo="${attr(tituloFrentes)}" destaque="${attr(destaque)}">\n${itens.join("\n\n")}\n</CarreirasFrentes>`);

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
    corpo: blocos.join("\n\n"),
    avisos,
  };
}
