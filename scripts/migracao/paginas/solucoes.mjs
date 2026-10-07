// Conversão do hub /solucoes/ (família "pagina").
// Estrutura no Elementor: [capa "Soluções"] [texto de abertura] [template "Quadro de soluções" (4754)]
// [banner Power Platform: versão tablet/desktop + versão celular] [formulário de contato (2415)].
// Os cartões do quadro não são copiados: o <QuadroSolucoes> monta-os a partir do cabeçalho das
// páginas de solução (campo `cartao`, preenchido pelo conversor da família "solucao").
import { attr, caminhoMidia, ehContainer, ehWidget, encontrar, fundoDe, textoPuro } from "../lib/wp.mjs";

export const caminhos = ["/solucoes/"];

const FINAIS = { 2415: "contato", 5859: "contato-sem-area", 2421: "topo" };
const limpar = (s) => String(s ?? "").replace(/​/g, "").replace(/\s+/g, " ").trim();
const ehTexto = (n) => ehWidget(n, "text-editor");
const ocultoNoCelular = (n) => n.settings?.hide_mobile && !n.settings?.hide_desktop;
const soNoCelular = (n) => n.settings?.hide_desktop && n.settings?.hide_tablet && !n.settings?.hide_mobile;

export function converter(p, ctx) {
  const avisos = [];
  const [capaNo, ...secoes] = p.elementor;
  const blocos = [];
  let final = "contato";

  // Capa
  const caixa = encontrar([capaNo], (n) => ehContainer(n) && fundoDe(n));
  const tituloNo = encontrar([caixa], ehTexto);
  const t = tituloNo.settings;
  const props = {
    titulo: limpar(textoPuro(t.editor)),
    imagem: ctx.registrarImagem(caminhoMidia(fundoDe(caixa))),
    imagemMobile: ctx.registrarImagem(caminhoMidia(fundoDe(caixa, "_tablet") ?? fundoDe(caixa, "_mobile"))),
    tamanho: t.typography_font_size?.unit === "em" && Number(t.typography_font_size.size) !== 2.4 ? t.typography_font_size.size : undefined,
    margemTopo: t._margin?.unit === "%" && Number(t._margin.top) !== 9 ? t._margin.top : undefined,
  };
  blocos.push(`<CapaSolucoes${props2jsx(props)} />`);

  // Banner: a versão do celular só fornece o fundo e o texto do botão.
  const bannerCelular = secoes.find(soNoCelular);
  for (const sec of secoes) {
    if (sec === bannerCelular) continue;
    const template = encontrar([sec], (n) => ehWidget(n, "template"));
    if (template) {
      const id = Number(template.settings.template_id);
      if (id === 4754) {
        const cartao = encontrar(ctx.wp.templatesPorId.get(4754).elementor, (n) => ehContainer(n) && n.settings?.link?.url && fundoDe(n));
        const fundo = ctx.registrarImagem(caminhoMidia(fundoDe(cartao)));
        const novaAba = /abrir-outra-aba/.test(cartao.settings.css_classes ?? "");
        blocos.push(`<QuadroSolucoes${props2jsx({ fundo, novaAba })} />`);
      } else if (FINAIS[id]) final = FINAIS[id];
      else avisos.push(`template ${id} não tratado`);
      continue;
    }
    const filhos = sec.elements ?? [];
    if (filhos.length && filhos.every((f) => ehTexto(f))) {
      blocos.push(`<TextoSolucoes>\n\n${filhos.map((f) => ctx.htmlParaMd(f.settings.editor)).join("\n\n")}\n\n</TextoSolucoes>`);
      continue;
    }
    if (ocultoNoCelular(sec) && encontrar([sec], (n) => ehWidget(n, "heading"))) {
      const link = encontrar([sec], (n) => ehContainer(n) && n.settings?.link?.url);
      const heading = encontrar([sec], (n) => ehWidget(n, "heading"));
      const texto = encontrar([sec], ehTexto);
      const imagem = encontrar([sec], (n) => ehWidget(n, "image"));
      const botao = bannerCelular && encontrar([bannerCelular], (n) => ehWidget(n, "button"));
      const titulo = String(heading.settings.title).replace(/<br\s*\/?>/gi, "@@BR@@");
      const props = {
        href: ctx.resolverLink(link.settings.link.url),
        imagem: ctx.registrarImagem(caminhoMidia(imagem.settings.image.url)),
        imagemMobile: ctx.registrarImagem(caminhoMidia(bannerCelular ? fundoDe(bannerCelular, "_mobile") : undefined)),
        botao: botao ? limpar(textoPuro(botao.settings.text)) : "Saiba mais",
        novaAba: /abrir-outra-aba/.test(link.settings.css_classes ?? ""),
      };
      const md = `## ${limpar(textoPuro(titulo)).replace(/@@BR@@/g, "<br />")}\n\n${ctx.htmlParaMd(texto.settings.editor)}`;
      blocos.push(`<BannerSolucoes${props2jsx(props)}>\n\n${md}\n\n</BannerSolucoes>`);
      continue;
    }
    avisos.push(`seção ${sec.id} não reconhecida (ignorada)`);
  }

  return {
    familia: "pagina",
    frontmatter: { familia: "pagina", semCapa: true, final },
    corpo: blocos.join("\n\n"),
    avisos,
  };
}

function props2jsx(props) {
  return Object.entries(props)
    .filter(([, v]) => v !== undefined && v !== false && v !== "")
    .map(([k, v]) => (v === true ? ` ${k}` : ` ${k}="${attr(v)}"`))
    .join("");
}

