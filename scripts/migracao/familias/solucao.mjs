// Conversão da família "solucao" (7 páginas em /solucoes/solucoes-*/).
//
// Estrutura no Elementor (as seções variam de página para página; cada uma é reconhecida pelo
// conteúdo, não pela posição):
//   [capa: breadcrumbs + caixa com imagem e frase]                -> frontmatter (capa*, frase, corFrase...)
//   [ícone + texto de abertura]                                    -> <Introducao>
//   [galeria de uma imagem num quadro branco]                      -> <QuadroImagem>
//   [título 40% | descrição] + linhas de cartões (3 por linha)     -> <BlocoServico> + <GradeCartoes>/<Cartao>
//   ["Nossos Serviços"] + linhas 40%/60% alternadas + botão        -> <ListaServicos>/<Servico>
//   [faixa creme com título e 2x2 itens com ícone]                 -> <Diferenciais>/<Diferencial>
//   [banner de e-book com botão]                                   -> <BannerEbook>
//   [template de formulário/topo do rodapé]                        -> campo `final`
// O cartão de cada solução no hub /solucoes/ vem do template "Quadro de soluções" (4754).
import { attr, caminhoMidia, ehContainer, ehWidget, encontrar, encontrarTodos, fundoDe, ocultoSempre, textoPuro } from "../lib/wp.mjs";

const TEMPLATE_QUADRO = 4754;
const FINAIS = { 2415: "contato", 5859: "contato-sem-area", 2421: "topo" };

// Imagens de conteúdo sem texto alternativo no WordPress.
const ALT_CONHECIDO = {
  "/wp-content/uploads/2025/09/Group-564.png":
    "Diagrama da arquitetura de dados: fontes de dados (bancos, SAP, Salesforce, APIs, arquivos e planilhas) ligadas por carregadores a um data lake com dados brutos, confiáveis e de serviço, catálogo, descoberta e linhagem; à direita, compartilhamento de dados, visualização, Insights Store, desenvolvimento de ML e A.I. Store.",
};

const limpar = (s) => String(s ?? "").replace(/​/g, "").replace(/\s+/g, " ").trim();

/** Parágrafos de um HTML curto (frase da capa). */
function paragrafos(html) {
  return [...String(html ?? "").matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)].map((m) => limpar(textoPuro(m[1]))).filter(Boolean);
}

/**
 * HTML do editor -> Markdown, preservando o que dá o espaçamento vertical no WordPress:
 *  - parágrafo vazio vira `&nbsp;` (um parágrafo com espaço ocupa uma linha, como no WordPress);
 *  - quebras de linha no início/fim de um parágrafo viram linhas vazias (`&nbsp;`) antes/depois dele
 *    (n quebras no início = n linhas; n no fim = n-1 linhas, porque a última não abre linha nova);
 *  - quebras no meio do parágrafo viram `<br />`.
 * O `htmlParaMd` comum transformaria `<br>` em "  \n\n" (parágrafo novo no MDX) e descartaria o resto.
 */
function md(html, ctx) {
  const VAZIO = "<p>@@VAZIO@@</p>";
  const BR = /<br\s*\/?>/gi;
  const h = String(html ?? "")
    .replace(/<p>(\s|&nbsp;| )*<\/p>/gi, VAZIO)
    .replace(/<p([^>]*)>([\s\S]*?)<\/p>/gi, (original, atributos, dentro) => {
      // Parágrafo que começa com texto: as quebras ficam como `<br />` mesmo (a linha do MDX começa
      // com texto e continua sendo parágrafo). Se o conteúdo começa com uma tag (ex.: <Azul>), uma
      // linha só de JSX viraria bloco no MDX, então as quebras das pontas viram linhas vazias.
      if (!dentro.replace(/^(?:\s|&nbsp;|<br\s*\/?>)*/i, "").startsWith("<")) return original;
      let inicio = 0;
      let fim = 0;
      dentro = dentro
        .replace(/^(?:(?:\s|&nbsp;)*<br\s*\/?>)+/i, (x) => ((inicio = x.match(BR).length), ""))
        .replace(/(?:(?:\s|&nbsp;)*<br\s*\/?>)+(?:\s|&nbsp;)*$/i, (x) => ((fim = x.match(BR).length), ""));
      return VAZIO.repeat(inicio) + `<p${atributos}>${dentro}</p>` + VAZIO.repeat(Math.max(0, fim - 1));
    })
    .replace(BR, "@@BR@@");
  return ctx
    .htmlParaMd(h)
    .replace(/^@@VAZIO@@$/gm, "&nbsp;")
    .replace(/[ \t]*@@BR@@[ \t]*/g, "<br />")
    .replace(/[ \t]+$/gm, "");
}

const ehTexto = (n) => ehWidget(n, "text-editor");
const largura = (n) => (n.settings?.width?.unit === "%" ? Number(n.settings.width.size) : undefined);
const temFilhos = (n) => (n.elements ?? []).some((f) => !ocultoSempre(f));

function imagemDe(no, ctx) {
  const src = ctx.registrarImagem(caminhoMidia(no?.settings?.image?.url));
  return src;
}

/** Bloco JSX com conteúdo Markdown: em linha se for uma frase só, senão em parágrafos. */
function jsx(nome, props, md) {
  const p = Object.entries(props)
    .filter(([, v]) => v !== undefined && v !== false && v !== "")
    .map(([k, v]) => (v === true ? ` ${k}` : ` ${k}="${attr(v)}"`))
    .join("");
  if (md === undefined) return `<${nome}${p} />`;
  if (!md.includes("\n") && !/^[-*#>]|^\d+\./.test(md)) return `<${nome}${p}>${md}</${nome}>`;
  return `<${nome}${p}>\n\n${md}\n\n</${nome}>`;
}

// --------------------------------------------------------------------------- seções

function ehIntroducao(sec) {
  const filhos = (sec.elements ?? []).filter((f) => !ocultoSempre(f));
  return filhos.length > 0 && filhos.every((f) => ehWidget(f)) && filhos.some(ehTexto) && !filhos.some((f) => ehWidget(f, "button"));
}

function converterIntroducao(sec, ctx) {
  const img = sec.elements.find((f) => ehWidget(f, "image"));
  const txt = sec.elements.find(ehTexto);
  const icone = imagemDe(img, ctx);
  const compacto = Number(txt.settings?.paragraph_spacing?.size) === 0 && txt.settings?.paragraph_spacing?.size !== "";
  return jsx("Introducao", { icone, compacto }, md(txt.settings.editor, ctx));
}

function converterQuadroImagem(sec, ctx) {
  const galeria = encontrar([sec], (n) => ehWidget(n, "image-gallery"));
  const itens = galeria.settings?.wp_gallery ?? [];
  const avisos = itens.length > 1 ? [`galeria com ${itens.length} imagens: só a primeira foi usada`] : [];
  const src = ctx.registrarImagem(caminhoMidia(itens[0]?.url));
  const alt = ctx.altDe(src) || ALT_CONHECIDO[src] || "";
  if (!alt) avisos.push(`imagem da galeria sem texto alternativo: ${src}`);
  return { md: jsx("QuadroImagem", { src, alt }), avisos };
}

/** Linha "título 40% | descrição" (BlocoServico). */
function linhaDeTitulo(sec) {
  return encontrar([sec], (n) => {
    const cs = (n.elements ?? []).filter(ehContainer);
    return ehContainer(n) && cs.length === 2 && largura(cs[0]) === 40 && !fundoDe(cs[0]) && encontrar([cs[0]], ehTexto) && encontrar([cs[1]], ehTexto);
  });
}

/** Cartões com min-height (os da grade e os da lista de serviços). */
const ehCartao = (n) => ehContainer(n) && n.settings?.min_height?.size === 10;

function converterCartao(c, ctx) {
  const txt = encontrar([c], ehTexto);
  const imagem = ctx.registrarImagem(caminhoMidia(fundoDe(c)));
  if (imagem) {
    const ajuste = c.settings.background_size === "cover" ? undefined : "original";
    return jsx("Cartao", { imagem, ajuste }, attrTexto(limpar(textoPuro(txt?.settings?.editor))));
  }
  return jsx("Cartao", {}, md(txt?.settings?.editor, ctx));
}

/** Texto puro dentro de JSX: escapa o que o MDX interpretaria. */
const attrTexto = (s) => s.replace(/[{}<>]/g, (c) => `\\${c}`);

function converterBlocoServico(sec, ctx, avisos) {
  const linha = linhaDeTitulo(sec);
  const [colTitulo, colDescricao] = linha.elements.filter(ehContainer);
  const titulo = limpar(textoPuro(encontrar([colTitulo], ehTexto).settings.editor));
  const descricao = md(encontrar([colDescricao], ehTexto).settings.editor, ctx);
  const saida = [jsx("BlocoServico", { titulo }, descricao)];
  // O WordPress completa a última linha com um cartão vazio (oculto no tablet/celular) só para manter
  // 3 colunas no desktop; a <GradeCartoes> já faz isso sozinha, então os vazios são descartados.
  const cartoes = encontrarTodos(sec.elements, ehCartao).filter((c) => !ocultoSempre(c) && temFilhos(c));
  if (cartoes.length) {
    // Cartões de uma linha ficam indentados (mais legível); os de vários parágrafos, sem indentação.
    const corpo = cartoes.map((c) => converterCartao(c, ctx)).map((i) => (i.includes("\n") ? `\n${i}\n` : `  ${i}`));
    saida.push(`<GradeCartoes>\n${corpo.join("\n")}\n</GradeCartoes>`);
  } else avisos.push(`bloco "${titulo}" sem cartões`);
  return saida.join("\n\n");
}

function ehListaServicos(sec) {
  const cartoes = encontrarTodos(sec.elements, ehCartao);
  return cartoes.length > 0 && cartoes.some((c) => largura(c) === 60);
}

function converterListaServicos(sec, ctx, avisos) {
  const filhos = sec.elements.filter((f) => !ocultoSempre(f));
  const tituloNo = filhos.find((f) => ehContainer(f) && !encontrar([f], ehCartao) && encontrar([f], ehTexto));
  const titulo = tituloNo ? limpar(textoPuro(encontrar([tituloNo], ehTexto).settings.editor)) : undefined;
  const botao = filhos.find((f) => ehWidget(f, "button"));
  const linhas = filhos.filter((f) => ehContainer(f) && encontrar([f], ehCartao));
  const servicos = linhas.map((linha, i) => {
    const cs = linha.elements.filter(ehCartao);
    const destaque = cs.find((c) => fundoDe(c));
    const texto = cs.find((c) => !fundoDe(c));
    const destaquePrimeiro = cs.indexOf(destaque) === 0;
    if (destaquePrimeiro !== (i % 2 === 0)) avisos.push(`serviço ${i + 1}: lado do destaque não segue a alternância (a <ListaServicos> alterna sozinha)`);
    const imagem = ctx.registrarImagem(caminhoMidia(fundoDe(destaque)));
    const ajuste = destaque.settings.background_size === "cover" ? undefined : "original";
    const tituloServico = limpar(textoPuro(encontrar([destaque], ehTexto).settings.editor));
    return jsx("Servico", { titulo: tituloServico, imagem, ajuste }, md(encontrar([texto], ehTexto).settings.editor, ctx));
  });
  const props = {
    titulo,
    chamada: botao ? limpar(textoPuro(botao.settings.text)) : undefined,
    chamadaHref: botao ? ctx.resolverLink(botao.settings.link?.url) : undefined,
  };
  return jsx("ListaServicos", props, servicos.join("\n\n"));
}

function converterDiferenciais(sec, ctx) {
  // O título é o primeiro editor de texto da faixa (vem antes dos itens).
  const tituloNo = encontrar([sec], ehTexto);
  const titulo = md(tituloNo.settings.editor, ctx);
  const itens = encontrarTodos(sec.elements, (n) => ehContainer(n) && (n.elements ?? []).some((f) => ehWidget(f, "image")) && (n.elements ?? []).some(ehTexto));
  const corpo = itens.map((it) => {
    const icone = imagemDe(it.elements.find((f) => ehWidget(f, "image")), ctx);
    return jsx("Diferencial", { icone }, md(it.elements.find(ehTexto).settings.editor, ctx));
  });
  return `<Diferenciais>\n\n## ${titulo.replace(/\n+/g, " ")}\n\n${corpo.join("\n\n")}\n\n</Diferenciais>`;
}

function ehBannerEbook(sec) {
  const filhos = sec.elements.filter((f) => !ocultoSempre(f));
  return filhos.length === 1 && ehContainer(filhos[0]) && fundoDe(filhos[0]) && encontrar(filhos, (n) => ehWidget(n, "button"));
}

function converterBannerEbook(sec, ctx) {
  const caixa = sec.elements.find((f) => !ocultoSempre(f));
  const textos = encontrarTodos([caixa], ehTexto).map((t) => limpar(textoPuro(t.settings.editor)));
  const botao = encontrar([caixa], (n) => ehWidget(n, "button"));
  const [rotulo, titulo, subtitulo] = textos.length >= 3 ? textos : [undefined, ...textos];
  const respiro = Number(sec.settings?.padding?.bottom) > 0;
  return jsx("BannerEbook", {
    imagem: ctx.registrarImagem(caminhoMidia(fundoDe(caixa))),
    imagemMobile: ctx.registrarImagem(caminhoMidia(fundoDe(caixa, "_tablet") ?? fundoDe(caixa, "_mobile"))),
    rotulo,
    titulo,
    subtitulo,
    botao: limpar(textoPuro(botao.settings.text)),
    href: ctx.resolverLink(botao.settings.link?.url),
    respiro,
  });
}

// --------------------------------------------------------------------------- cartão do hub

function cartaoNoQuadro(p, ctx, avisos) {
  const quadro = ctx.wp.templatesPorId.get(TEMPLATE_QUADRO);
  const cartoes = encontrarTodos(quadro?.elementor ?? [], (n) => ehContainer(n) && n.settings?.link?.url);
  const i = cartoes.findIndex((c) => ctx.resolverLink(c.settings.link.url).replace(/[?#].*$/, "") === p.caminho);
  if (i < 0) {
    avisos.push(`solução fora do "Quadro de soluções" (template ${TEMPLATE_QUADRO}): cartão montado com o título da página`);
    return undefined;
  }
  const c = cartoes[i];
  return {
    titulo: limpar(textoPuro(encontrar([c], ehTexto)?.settings?.editor)),
    icone: imagemDe(encontrar([c], (n) => ehWidget(n, "image")), ctx),
    ordem: i + 1,
  };
}

// --------------------------------------------------------------------------- página

export function converter(p, ctx) {
  const avisos = [];
  const [capaNo, ...secoes] = p.elementor;

  // Capa: caixa com imagem de fundo + frase.
  const caixa = encontrar([capaNo], (n) => ehContainer(n) && fundoDe(n));
  const fraseNo = encontrar([caixa], ehTexto);
  const fs = fraseNo.settings;
  const capa = ctx.registrarImagem(caminhoMidia(fundoDe(caixa)));
  const capaMobile = ctx.registrarImagem(caminhoMidia(fundoDe(caixa, "_mobile") ?? fundoDe(caixa, "_tablet")));
  const capaTablet = ctx.registrarImagem(caminhoMidia(fundoDe(caixa, "_tablet")));
  const posicao = caixa.settings.background_position_tablet || caixa.settings.background_position_mobile;
  const larguraFrase = fs._element_width === "initial" && fs._element_custom_width?.unit === "%" ? Number(fs._element_custom_width.size) : undefined;
  if (tamanhoDif(fs.typography_font_size, 2)) avisos.push(`frase da capa com tamanho ${fs.typography_font_size.size}${fs.typography_font_size.unit} (o molde usa 2em)`);
  if (fs._margin?.top && fs._margin.top !== "7") avisos.push(`frase da capa com margem superior ${fs._margin.top}${fs._margin.unit} (o molde usa 7%)`);

  const blocos = [];
  let final = "contato";
  for (const sec of secoes) {
    if (ocultoSempre(sec)) continue;
    const template = encontrar([sec], (n) => ehWidget(n, "template"));
    if (template) {
      final = FINAIS[template.settings.template_id];
      if (!final) {
        avisos.push(`template ${template.settings.template_id} no fim da página não reconhecido (usando o formulário de contato)`);
        final = "contato";
      }
      continue;
    }
    if (encontrar([sec], (n) => ehWidget(n, "image-gallery"))) {
      const r = converterQuadroImagem(sec, ctx);
      blocos.push(r.md);
      avisos.push(...r.avisos);
    } else if (String(sec.settings?.background_color).toUpperCase() === "#FFEEC2") {
      blocos.push(converterDiferenciais(sec, ctx));
    } else if (ehBannerEbook(sec)) {
      blocos.push(converterBannerEbook(sec, ctx));
    } else if (ehIntroducao(sec)) {
      blocos.push(converterIntroducao(sec, ctx));
    } else if (ehListaServicos(sec)) {
      blocos.push(converterListaServicos(sec, ctx, avisos));
    } else if (linhaDeTitulo(sec)) {
      blocos.push(converterBlocoServico(sec, ctx, avisos));
    } else {
      avisos.push(`seção ${sec.id} não reconhecida (ignorada): ${limpar(textoPuro(encontrarTodos([sec], ehTexto).map((t) => t.settings.editor).join(" "))).slice(0, 80)}`);
    }
  }

  const cartao = cartaoNoQuadro(p, ctx, avisos) ?? { titulo: p.titulo.replace(/^Soluções\s*-\s*/i, ""), icone: undefined };
  if (!cartao.icone) {
    const iconeIntro = blocos.join("\n").match(/<Introducao icone="([^"]+)"/)?.[1];
    if (iconeIntro) cartao.icone = iconeIntro;
  }

  return {
    familia: "solucao",
    frontmatter: {
      familia: "solucao",
      capa,
      capaMobile: capaMobile !== capa ? capaMobile : undefined,
      capaTablet: capaTablet && capaTablet !== capaMobile ? capaTablet : undefined,
      capaPosicao: /center/.test(posicao ?? "") ? undefined : "topo",
      frase: paragrafos(fs.editor).join("\n"),
      corFrase: /^#?fff(fff)?$/i.test(String(fs.text_color ?? "").replace("#", "")) ? "clara" : "escura",
      larguraFrase: larguraFrase && larguraFrase !== 90 ? larguraFrase : undefined,
      cartao,
      ...(final !== "contato" ? { final } : {}),
    },
    corpo: blocos.join("\n\n"),
    avisos,
  };
}

function tamanhoDif(controle, em) {
  return controle && controle.size !== "" && !(controle.unit === "em" && Number(controle.size) === em);
}
