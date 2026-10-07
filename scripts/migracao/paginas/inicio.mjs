// Conversão da home (WordPress 4177) para content/paginas/index.mdx.
// Estrutura no Elementor (ids dos contêineres de topo):
//   f76cf2f  capa (carrossel aninhado de um slide) + 7ca4fd2c mancha de luz decorativa
//   3e5aca5  "Soluções na medida do seu desafio" + grade de logos que viram (q10..q17) e a
//            versão de celular da grade (07f3654)
//   12d925cd carrossel de cases por setor (os links vêm do widget html 7d966ad)
//   4e1fc290 "Tecnologia que entende o seu negócio" + cartões de serviço que viram (q1..q7)
//   74414c8  faixa "Acesse nosso blog!" (só computador)
//   7522a5b  formulário de contato (template 2415) -> final: contato
import { attr, caminhoMidia, decodificarEntidades, encontrar, encontrarTodos, ehContainer, ehWidget, ocultoSempre, textoPuro } from "../lib/wp.mjs";

export const caminhos = ["/"];

const ZWSP = /[​﻿]/g;
const QUEBRA = "QQQUEBRAQQQ";

export function converter(p, ctx) {
  const avisos = [];
  const porId = (id) => {
    const no = encontrar(p.elementor, (n) => n.id === id);
    if (!no) avisos.push(`elemento ${id} não encontrado na árvore do Elementor`);
    return no;
  };
  const md = (html) => ctx.htmlParaMd(String(html ?? "").replace(ZWSP, "")).trim();
  /**
   * Título: o HTML de dentro do <h2>/<p> vira Markdown inline (preserva negrito, itálico e azul).
   * Um <br> vira <br /> (a quebra de linha do Markdown terminaria o título).
   */
  const titulo = (html, nivel) => {
    const interno = String(html ?? "").replace(/^\s*<(h[1-6]|p)[^>]*>([\s\S]*)<\/\1>\s*$/i, "$2").replace(/<br\s*\/?>/gi, QUEBRA);
    return `${"#".repeat(nivel)} ${md(`<p>${interno}</p>`).replace(/\s*\n+\s*/g, " ").replace(/[ \t]*QQQUEBRAQQQ[ \t]*/g, "<br />")}`;
  };
  const imagem = (url) => ctx.registrarImagem(caminhoMidia(url));
  const alt = (img, src) => img?.alt || ctx.altDe(src) || "";
  const link = (url) => ctx.resolverLink(url);
  const ehNovaAba = (...nos) => nos.some((n) => /\babrir-outra-aba\b/.test(`${n?.settings?._css_classes ?? ""} ${n?.settings?.css_classes ?? ""}`));
  const botao = (no, variante, ...ancestrais) => {
    const s = no.settings;
    const props = [`href="${attr(link(s.link?.url))}"`];
    if (variante !== "contorno") props.push(`variante="${variante}"`);
    if (ehNovaAba(no, ...ancestrais) || s.link?.is_external) props.push("novaAba");
    return `<BotaoIvory ${props.join(" ")}>${textoPuro(s.text)}</BotaoIvory>`;
  };
  const blocos = [];

  // ------------------------------------------------------------------ capa
  {
    const fundo = porId("61b3c951");
    const brilho = porId("82ebd5b");
    const tituloNo = porId("10912e04");
    const textoNo = porId("59d2cb42");
    const botaoNo = porId("7d5eac0c");
    const img = imagem(fundo?.settings?.background_image?.url);
    const luz = brilho && !ocultoSempre(brilho) ? imagem(brilho.settings.image?.url) : undefined;
    blocos.push(
      [
        `<InicioCapa imagem="${attr(img)}"${luz ? ` brilho="${attr(luz)}"` : ""}>`,
        titulo(tituloNo?.settings?.editor, 1),
        md(textoNo?.settings?.editor),
        botao(botaoNo, "contorno"),
        "</InicioCapa>",
      ].join("\n\n"),
    );
  }

  // ------------------------------------------------------------------ soluções + logos
  {
    const tituloNo = porId("2efc924");
    const textoNo = porId("09431a6");
    const botaoNo = porId("72931ca");
    const grade = porId("575f265");
    const gradeCelular = porId("07f3654");
    // Grade de computador: pares frente/verso ligados pela classe qN.
    const imagens = encontrarTodos(grade?.elements, (n) => ehWidget(n, "image"));
    const classes = (n) => String(n.settings?._css_classes ?? "");
    const colunas = (grade?.elements ?? []).filter(ehContainer).map((c) => encontrarTodos(c.elements, (n) => ehWidget(n, "image") && /\bfrente\b/.test(classes(n))).length);
    const frentes = imagens.filter((n) => /\bfrente\b/.test(classes(n)));
    const celulares = encontrarTodos(gradeCelular?.elements, (n) => ehWidget(n, "image"));
    if (celulares.length !== frentes.length) avisos.push(`grade de logos: ${frentes.length} no computador e ${celulares.length} no celular`);
    const logos = frentes.map((f, i) => {
      const q = classes(f).match(/\bq\d+\b/)?.[0];
      const v = imagens.find((n) => n !== f && q && new RegExp(`\\b${q}\\b`).test(classes(n)) && /\bverso\b/.test(classes(n)));
      const frente = imagem(f.settings.image?.url);
      const verso = imagem(v?.settings?.image?.url) ?? frente;
      if (!v) avisos.push(`logo ${q}: sem verso`);
      const cel = celulares[i];
      const srcCel = cel && imagem(cel.settings.image?.url);
      if (cel && srcCel !== frente) avisos.push(`logo ${q}: imagem do celular (${srcCel}) difere da do computador (${frente})`);
      const href = link(f.settings.link?.url);
      const hrefCel = cel?.settings?.link?.url ? link(cel.settings.link.url) : undefined;
      return `<InicioLogo frente="${attr(frente)}" verso="${attr(verso)}" alt="${attr(alt(f.settings.image, frente))}" href="${attr(href)}"${hrefCel && hrefCel !== href ? ` hrefCelular="${attr(hrefCel)}"` : ""} />`;
    });
    const novaAba = ehNovaAba(grade);
    blocos.push(
      [
        `<InicioSolucoes${colunas.join(",") !== "3,2,3" ? ` colunas="${colunas.join(",")}"` : ""}${novaAba ? " novaAba" : ""}>`,
        titulo(tituloNo?.settings?.editor, 2),
        md(textoNo?.settings?.editor),
        botao(botaoNo, "laranja"),
        logos.join("\n"),
        "</InicioSolucoes>",
      ].join("\n\n"),
    );
  }

  // ------------------------------------------------------------------ carrossel de setores
  {
    const carrossel = porId("37f283cd");
    const script = porId("7d966ad")?.settings?.html ?? "";
    // Os links de cada slide estavam num script ("slideUrls"), na mesma ordem das imagens.
    const urls = [...(script.match(/slideUrls\s*=\s*\[([\s\S]*?)\]/)?.[1] ?? "").matchAll(/["']([^"']+)["']/g)].map((m) => m[1]);
    const itens = carrossel?.settings?.carousel ?? [];
    if (urls.length !== itens.length) avisos.push(`carrossel: ${itens.length} imagens e ${urls.length} links no script`);
    const slides = itens.map((it, i) => {
      const src = imagem(it.url);
      const destino = urls[i] ? link(urls[i]) : link(carrossel.settings.link?.url);
      const existe = ctx.wp.paginas.some((pg) => pg.caminho === destino.replace(/[?#].*$/, ""));
      if (!existe) avisos.push(`carrossel: o slide ${i + 1} leva a ${destino}, que não é uma página publicada (404 para o visitante)`);
      return `<InicioSlide imagem="${attr(src)}" alt="${attr(ctx.altDe(src) || "")}" href="${attr(destino)}" />`;
    });
    blocos.push(["<InicioCarrossel>", slides.join("\n"), "</InicioCarrossel>"].join("\n\n"));
  }

  // ------------------------------------------------------------------ serviços
  {
    const tituloNo = porId("d0fcd3d");
    const textoNo = porId("c64aed8");
    const grade = porId("85e4c2a");
    const classes = (n) => String(n.settings?.css_classes ?? "");
    const quadros = encontrarTodos(grade?.elements, (n) => ehContainer(n) && /\bquadro-dinamico\b/.test(classes(n)));
    const frentes = quadros.filter((n) => /\bfrente\b/.test(classes(n)));
    let fundo;
    let fundoVerso;
    const itens = frentes.map((f) => {
      const q = classes(f).match(/\bq\d+\b/)?.[0];
      const v = quadros.find((n) => new RegExp(`\\b${q}\\b`).test(classes(n)) && /\bverso\b/.test(classes(n)));
      fundo ??= imagem(f.settings.background_image?.url);
      fundoVerso ??= imagem(v?.settings?.background_image?.url);
      const icone = imagem(encontrar(f.elements, (n) => ehWidget(n, "image"))?.settings?.image?.url);
      const nome = textoPuro(encontrar(f.elements, (n) => ehWidget(n, "text-editor"))?.settings?.editor).replace(ZWSP, "").trim();
      // O verso tinha várias listas de um item separadas por parágrafos vazios (colado do Word):
      // vira uma lista só.
      const htmlVerso = encontrar(v?.elements, (n) => ehWidget(n, "text-editor"))?.settings?.editor ?? "";
      const itensLista = [...htmlVerso.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)].map((m) => md(`<p>${m[1]}</p>`).replace(/\s+/g, " ").trim()).filter(Boolean);
      if (!itensLista.length) avisos.push(`serviço ${q}: verso sem lista`);
      return [`<InicioServico icone="${attr(icone)}" titulo="${attr(nome)}">`, itensLista.map((t) => `- ${t}`).join("\n"), "</InicioServico>"].join("\n");
    });
    blocos.push(
      [`<InicioServicos fundo="${attr(fundo)}" fundoVerso="${attr(fundoVerso)}">`, titulo(tituloNo?.settings?.editor, 2), md(textoNo?.settings?.editor), itens.join("\n\n"), "</InicioServicos>"].join("\n\n"),
    );
  }

  // ------------------------------------------------------------------ faixa do blog
  {
    const faixa = porId("74414c8");
    if (faixa && !ocultoSempre(faixa)) {
      const texto = porId("ecdb993");
      const chamada = porId("9d127ee");
      const arte = encontrar(faixa.elements, (n) => ehWidget(n, "image"));
      const src = imagem(arte?.settings?.image?.url);
      const s = faixa.settings ?? {};
      const soComputador = s.hide_mobile && s.hide_tablet && !s.hide_desktop;
      blocos.push(
        [
          `<InicioBlog imagem="${attr(src)}" alt="${attr(alt(arte?.settings?.image, src))}" href="${attr(link(chamada?.settings?.link?.url))}" link="${attr(decodificarEntidades(textoPuro(chamada?.settings?.title)))}"${ehNovaAba(chamada) ? " novaAba" : ""}${soComputador ? " somenteComputador" : ""}>`,
          md(texto?.settings?.editor),
          "</InicioBlog>",
        ].join("\n\n"),
      );
    }
  }

  // ------------------------------------------------------------------ fecho
  const template = encontrar(p.elementor, (n) => ehWidget(n, "template"));
  const idTemplate = Number(template?.settings?.template_id);
  const final = idTemplate === 5859 ? "contato-sem-area" : idTemplate === 2415 ? "contato" : "topo";
  if (!template) avisos.push("sem template de formulário no fim da página");

  return {
    familia: "pagina",
    frontmatter: { familia: "pagina", titulo: p.titulo, semCapa: true, final },
    corpo: blocos.join("\n\n"),
    avisos,
  };
}
