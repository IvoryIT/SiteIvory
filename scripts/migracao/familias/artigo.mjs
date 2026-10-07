// Conversão da família "artigo" (61 páginas do blog).
// Estrutura no Elementor: [capa com título] [corpo: textos, imagens e divisores de 40%]
// [COMPARTILHE] [Insights recentes] [topo do rodapé].
import { atributosImagem, attr, caminhoMidia, dimensoesNoWordPress, ehContainer, ehWidget, encontrar, estiloTituloCapa, fundoDe, ocultoSempre, tamanho, textoPuro } from "../lib/wp.mjs";

export function ehArtigo(p) {
  return /^Artigo/i.test(p.titulo);
}

function ehDivisor(no) {
  const largura = no.settings?.width;
  return ehContainer(no) && !(no.elements?.length) && largura?.unit === "%" && Number(largura.size) <= 60;
}

function ehBarraCompartilhe(no) {
  // Texto exato: o corpo de vários artigos fala em "compartilhe" e não pode ser confundido com a barra.
  return Boolean(encontrar([no], (n) => ehWidget(n, "text-editor") && textoPuro(n.settings?.editor).toUpperCase() === "COMPARTILHE"));
}

export function converterArtigo(p, ctx) {
  const [capaNo, ...resto] = p.elementor;
  const avisos = [];

  // Capa: container com imagem de fundo + título (heading ou editor de texto).
  const caixa = encontrar([capaNo], (n) => ehContainer(n) && fundoDe(n)) ?? capaNo;
  const tituloNo = encontrar([caixa], (n) => ehWidget(n, "heading") || ehWidget(n, "text-editor"));
  const titulo = textoPuro(tituloNo?.settings?.title ?? tituloNo?.settings?.editor);
  const fonte = tamanho(tituloNo?.settings?.typography_font_size);
  const capa = ctx.registrarImagem(caminhoMidia(fundoDe(caixa)));
  const capaMobile = ctx.registrarImagem(caminhoMidia(fundoDe(caixa, "_mobile")));

  // Corpo: tudo até a barra "COMPARTILHE".
  const blocos = [];
  const fimCorpo = resto.findIndex(ehBarraCompartilhe);
  const corpoNos = fimCorpo >= 0 ? resto.slice(0, fimCorpo) : resto;
  const percorrer = (nos) => {
    for (const no of nos ?? []) {
      if (ocultoSempre(no)) continue;
      if (ehContainer(no)) {
        if (ehDivisor(no)) blocos.push("<Divisor />");
        else if (ehTextoComImagem(no)) blocos.push(textoComImagem(no));
        else percorrer(no.elements);
        continue;
      }
      const s = no.settings ?? {};
      switch (no.widgetType) {
        case "text-editor": {
          const md = ctx.htmlParaMd(s.editor);
          if (md) blocos.push(md);
          break;
        }
        case "heading": {
          const t = textoPuro(s.title);
          if (t) blocos.push(`## ${t}`);
          break;
        }
        case "image": {
          const src = ctx.registrarImagem(caminhoMidia(s.image?.url));
          if (src) {
            const alt = s.image?.alt || ctx.altDe(src) || "";
            const href = s.link_to === "custom" && s.link?.url ? ` href="${attr(ctx.resolverLink(s.link.url))}"` : "";
            const extras = Object.entries(atributosImagem(no, src, dimensoesNoWordPress(src)))
              .map(([k, v]) => (typeof v === "number" ? ` ${k}={${v}}` : ` ${k}="${v}"`))
              .join("");
            blocos.push(`<Imagem src="${attr(src)}" alt="${attr(alt)}"${extras}${href} />`);
          }
          break;
        }
        case "button": {
          const href = ctx.resolverLink(s.link?.url || "#");
          blocos.push(`<Botao href="${attr(href)}">${textoPuro(s.text)}</Botao>`);
          break;
        }
        case "html":
          // Só havia lixo de edição (<span style="display:none">) nos artigos.
          if (textoPuro(s.html).replace(/hhjghjgjhgj/g, "").trim()) avisos.push(`HTML ignorado: ${textoPuro(s.html).slice(0, 80)}`);
          break;
        default:
          avisos.push(`widget não tratado: ${no.widgetType}`);
      }
    }
  };
  // Linha com texto à esquerda e imagem à direita (molde "página com fotos" do Elementor).
  function ehTextoComImagem(no) {
    const filhos = (no.elements ?? []).filter((f) => !ocultoSempre(f));
    return no.settings?.flex_direction === "row" && filhos.some((f) => ehWidget(f, "text-editor")) && filhos.filter((f) => ehWidget(f, "image")).length === 1 && filhos.every((f) => ehWidget(f, "text-editor") || ehWidget(f, "image"));
  }
  function textoComImagem(no) {
    const filhos = no.elements.filter((f) => !ocultoSempre(f));
    const img = filhos.find((f) => ehWidget(f, "image"));
    const textos = filhos.filter((f) => ehWidget(f, "text-editor"));
    const src = ctx.registrarImagem(caminhoMidia(img.settings.image?.url));
    const alt = img.settings.image?.alt || ctx.altDe(src) || "";
    const largura = Number(textos[0].settings?._element_custom_width?.size) || 60;
    const larguraImg = Number(img.settings?._element_custom_width?.size);
    const extras = [
      larguraImg && larguraImg !== 100 - largura ? ` larguraImagem={${larguraImg}}` : "",
      no.settings?.flex_justify_content === "center" ? " centralizar" : "",
    ].join("");
    const md = textos.map((t) => ctx.htmlParaMd(t.settings.editor)).filter(Boolean).join("\n\n");
    return `<TextoComImagem imagem="${attr(src)}" alt="${attr(alt)}" larguraTexto={${largura}}${extras}>\n\n${md}\n\n</TextoComImagem>`;
  }

  percorrer(corpoNos);

  // Remove divisores no começo e repetidos. O do fim fica: no WordPress ele aparece antes do COMPARTILHE.
  const corpo = blocos
    .filter((b, i, arr) => !(b === "<Divisor />" && (i === 0 || arr[i - 1] === "<Divisor />")))
    .join("\n\n");

  const cartao = ctx.cartoesBlog.get(p.caminho);
  if (!cartao) avisos.push("sem cartão no /blog/ (usando a capa como imagem do cartão)");

  return {
    familia: "artigo",
    frontmatter: {
      familia: "artigo",
      titulo,
      ...(fonte && fonte.unidade === "em" && fonte.valor !== 2.4 ? { tamanhoTitulo: fonte.valor } : {}),
      capa,
      capaMobile: capaMobile !== capa ? capaMobile : undefined,
      capaTablet: (() => {
        const t = ctx.registrarImagem(caminhoMidia(fundoDe(caixa, "_tablet")));
        return t && t !== capaMobile ? t : undefined;
      })(),
      capaTitulo: estiloTituloCapa(tituloNo),
      cartao: cartao ? { imagem: cartao.imagem, titulo: cartao.titulo, rotulo: cartao.rotulo, resumo: cartao.resumo, imagemAlt: cartao.imagemAlt } : { imagem: capa, titulo },
      categorias: cartao?.categorias ?? [],
    },
    corpo,
    avisos,
  };
}
