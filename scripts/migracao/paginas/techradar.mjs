// Conversor do /techradar/ (id 2249). Seções do Elementor, na ordem:
//   capa (o título "IA tech radar" vem desenhado na imagem) | texto de introdução | caixa com os
//   quadrantes | galeria com a imagem do radar | contribuidores (uma versão para computador, sobre
//   imagem de fundo, e outra para tablet/celular) | COMPARTILHE | topo do rodapé.
// Seções ocultas em todos os dispositivos ("Faça o download do PDF", "Fique por dentro") são ignoradas.
import { attr, caminhoMidia, ehContainer, ehWidget, encontrar, encontrarTodos, fundoDe, ocultoSempre, textoPuro } from "../lib/wp.mjs";

export const caminhos = ["/techradar/"];

const ALT_RADAR =
  "IA Tech Radar: tecnologias de IA posicionadas nos quadrantes Visão, Fala, Texto e Tomada de decisão, nos anéis Adotamos, Experimentando, Avaliando e Evitamos";

/** <br><br> do Elementor viram duas quebras de linha dentro do mesmo parágrafo (com "\" no fim da linha). */
function markdown(ctx, html) {
  return ctx
    .htmlParaMd(html)
    .replace(/ {2}\n {2}\n/g, "\\\n\\\n");
}

const widgets = (no, tipo) => encontrarTodos(no.elements, (n) => ehWidget(n, tipo) && !ocultoSempre(n));

export function converter(p, ctx) {
  const avisos = [];
  const blocos = [];
  const frontmatter = { familia: "pagina", titulo: p.titulo, semCapa: true };
  let contribuidores; // { fundo, titulo, pessoas, posicao }

  for (const secao of p.elementor) {
    if (ocultoSempre(secao)) continue;

    // Capa (breadcrumb + imagem com o título desenhado).
    if (encontrar([secao], (n) => ehWidget(n, "breadcrumbs"))) {
      const capaNo = encontrar([secao], (n) => ehContainer(n) && fundoDe(n));
      const imagem = ctx.registrarImagem(caminhoMidia(fundoDe(capaNo)));
      const mobile = ctx.registrarImagem(caminhoMidia(fundoDe(capaNo, "_mobile")));
      if (widgets(capaNo, "text-editor").length) avisos.push("a capa tem texto; o conversor espera o título desenhado na imagem");
      blocos.push(
        `<TechRadarCapa imagem="${attr(imagem)}"${mobile && mobile !== imagem ? ` imagemMobile="${attr(mobile)}"` : ""} titulo="IA Tech Radar" caminho="${attr(p.caminho)}" />`,
      );
      continue;
    }

    // Topo do rodapé: é o fecho padrão do molde (final: topo).
    if (encontrar([secao], (n) => ehWidget(n, "template") && Number(n.settings.template_id) === 2421)) continue;

    // Galeria com a imagem do radar.
    const galeria = encontrar([secao], (n) => ehWidget(n, "image-gallery"));
    if (galeria) {
      const fotos = galeria.settings.wp_gallery ?? [];
      if (fotos.length !== 1) avisos.push(`galeria com ${fotos.length} imagens; <TechRadarImagem> mostra uma por vez`);
      for (const f of fotos) {
        const src = ctx.registrarImagem(caminhoMidia(f.url));
        blocos.push(`<TechRadarImagem src="${attr(src)}" alt="${attr(ctx.altDe(src) || ALT_RADAR)}" />`);
      }
      continue;
    }

    const textos = widgets(secao, "text-editor");
    const imagens = widgets(secao, "image");

    // COMPARTILHE: texto + ícones com link.
    if (textos.length === 1 && /COMPARTILHE/i.test(textoPuro(textos[0].settings.editor))) {
      const redes = imagens.map((i) => {
        const href = i.settings.link?.url ?? "";
        const nome = /instagram/i.test(href) ? "Instagram" : /linkedin/i.test(href) ? "LinkedIn" : /facebook/i.test(href) ? "Facebook" : "Rede social";
        return `<TechRadarRede icone="${attr(ctx.registrarImagem(caminhoMidia(i.settings.image.url)))}" nome="${nome}" href="${attr(href)}" />`;
      });
      blocos.push(`<TechRadarCompartilhe titulo="${attr(textoPuro(textos[0].settings.editor))}">\n${redes.join("\n")}\n</TechRadarCompartilhe>`);
      continue;
    }

    // Contribuidores: fotos + nomes. Há duas versões (computador e tablet/celular); vira um bloco só.
    if (imagens.length >= 2) {
      const pessoas = imagens.map((img) => {
        const nomeNo = encontrarTodos(secao.elements, (n) => ehContainer(n) && n.elements?.includes(img))[0]?.elements.find((n) => ehWidget(n, "text-editor"));
        return { foto: ctx.registrarImagem(caminhoMidia(img.settings.image.url)), nome: textoPuro(nomeNo?.settings.editor) };
      });
      const fundoNo = encontrar([secao], (n) => ehContainer(n) && fundoDe(n));
      const titulo = textos.map((t) => textoPuro(t.settings.editor)).find((t) => !pessoas.some((pp) => pp.nome === t));
      if (!contribuidores) {
        contribuidores = { pessoas, posicao: blocos.length };
        blocos.push(null);
      } else if (JSON.stringify(contribuidores.pessoas) !== JSON.stringify(pessoas)) {
        avisos.push("as duas versões de 'Contribuidores' têm pessoas diferentes; usada a primeira");
      }
      if (fundoNo) contribuidores.fundo = ctx.registrarImagem(caminhoMidia(fundoDe(fundoNo)));
      if (titulo) contribuidores.titulo = titulo;
      continue;
    }

    // Quadrantes: linhas com número + descrição.
    const linhas = encontrarTodos(secao.elements, (n) => ehContainer(n) && n.settings?.flex_direction === "row" && widgets(n, "text-editor").length === 2);
    if (linhas.length) {
      const itens = linhas.map((l) => {
        const [num, desc] = widgets(l, "text-editor");
        return `<TechRadarQuadrante numero="${attr(textoPuro(num.settings.editor))}">\n${markdown(ctx, desc.settings.editor)}\n</TechRadarQuadrante>`;
      });
      blocos.push(`<TechRadarQuadrantes>\n${itens.join("\n\n")}\n</TechRadarQuadrantes>`);
      continue;
    }

    // Texto corrido. O WordPress não tem meta description: usa o começo do texto (sem o título "Introdução").
    if (textos.length) {
      if (!frontmatter.seo && !(ctx.wp.head[p.id]?.descricao || p.seoDescricao)) {
        const texto = textoPuro(textos[0].settings.editor.replace(/<strong>[^<]*<\/strong>/, ""));
        frontmatter.seo = { descricao: texto.length > 155 ? `${texto.slice(0, 155).replace(/\s+\S*$/, "")}…` : texto };
      }
      blocos.push(`<TechRadarTexto>\n${textos.map((t) => markdown(ctx, t.settings.editor)).join("\n\n")}\n</TechRadarTexto>`);
      continue;
    }

    avisos.push(`seção não convertida: ${secao.id}`);
  }

  if (contribuidores) {
    const { fundo, titulo = "Contribuidores", pessoas, posicao } = contribuidores;
    if (!fundo) avisos.push("contribuidores sem imagem de fundo para o computador");
    blocos[posicao] = `<TechRadarContribuidores titulo="${attr(titulo)}" fundo="${attr(fundo ?? "")}">\n${pessoas
      .map((pp) => `<TechRadarPessoa foto="${attr(pp.foto)}" nome="${attr(pp.nome)}" />`)
      .join("\n")}\n</TechRadarContribuidores>`;
  }

  return { familia: "pagina", frontmatter, corpo: blocos.filter(Boolean).join("\n\n"), avisos };
}
