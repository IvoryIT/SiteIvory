// Converte o HTML do editor de texto do Elementor em Markdown/MDX limpo:
// sem atributos de estilo; negrito vira **, itálico vira _, texto azul vira <Azul>.
import TurndownService from "turndown";
import { decodificarEntidades } from "./wp.mjs";

const AZUL = /color:\s*(#003d5b|rgb\(\s*0,\s*61,\s*91\s*\))/i;
const NEGRITO = /font-weight:\s*(bold(er)?|[6-9]00)/i;
const NORMAL = /font-weight:\s*(normal|[1-4]00)/i;

export function criarConversor(resolverLink) {
  const td = new TurndownService({
    headingStyle: "atx",
    emDelimiter: "_",
    strongDelimiter: "**",
    bulletListMarker: "-",
    hr: "---",
    // O turndown já acrescenta "\n" depois deste valor: "  " + "\n" = quebra de linha (não parágrafo).
    br: "  ",
  });

  // Escapa também o que o MDX interpreta (chaves de expressão e "<" de JSX).
  const escapar = td.escape.bind(td);
  td.escape = (s) => escapar(s).replace(/[{}]/g, (c) => `\\${c}`).replace(/</g, "\\<");

  td.addRule("titulos", {
    filter: ["h1", "h2", "h3", "h4", "h5", "h6"],
    replacement: (conteudo, no) => {
      const nivel = { H1: 2, H2: 2, H3: 3, H4: 4, H5: 4, H6: 4 }[no.nodeName];
      const texto = conteudo.replace(/\*\*/g, "").trim();
      return texto ? `\n\n${"#".repeat(nivel)} ${texto}\n\n` : "";
    },
  });

  td.addRule("span-estilo", {
    filter: (no) => ["SPAN", "FONT", "MARK"].includes(no.nodeName),
    replacement: (conteudo, no) => {
      if (!conteudo.trim()) return conteudo;
      const estilo = no.getAttribute("style") || "";
      let saida = conteudo;
      const [, ini, meio, fim] = saida.match(/^(\s*)([\s\S]*?)(\s*)$/);
      saida = meio;
      if (NEGRITO.test(estilo) && !/^\*\*[\s\S]*\*\*$/.test(saida)) saida = `**${saida}**`;
      if (AZUL.test(estilo) && !dentroDeAzul(no)) saida = envolverAzul(saida);
      return ini + saida + fim;
    },
  });

  td.addRule("negrito", {
    filter: (no) => ["STRONG", "B"].includes(no.nodeName) && !NORMAL.test(no.getAttribute("style") || ""),
    replacement: (conteudo, no) => {
      const [, ini, meio, fim] = conteudo.match(/^(\s*)([\s\S]*?)(\s*)$/);
      if (!meio || dentroDe(no, ["STRONG", "B"])) return conteudo;
      const azul = AZUL.test(no.getAttribute("style") || "") && !dentroDeAzul(no);
      const marcado = `**${meio.replace(/^\*\*|\*\*$/g, "")}**`;
      return ini + (azul ? envolverAzul(marcado) : marcado) + fim;
    },
  });

  td.addRule("italico", {
    filter: ["em", "i"],
    replacement: (conteudo, no) => {
      const [, ini, meio, fim] = conteudo.match(/^(\s*)([\s\S]*?)(\s*)$/);
      if (!meio || dentroDe(no, ["EM", "I"])) return conteudo;
      return `${ini}_${meio}_${fim}`;
    },
  });

  td.addRule("link", {
    filter: (no) => no.nodeName === "A" && no.getAttribute("href"),
    replacement: (conteudo, no) => {
      const href = resolverLink(decodificarEntidades(no.getAttribute("href")));
      const texto = conteudo.trim();
      if (!texto) return "";
      const azul = AZUL.test(no.getAttribute("style") || "") && !dentroDeAzul(no) && !/<Azul>/.test(texto);
      const link = `[${texto}](${href.replace(/ /g, "%20").replace(/\)/g, "%29")})`;
      return azul ? envolverAzul(link) : link;
    },
  });

  td.addRule("div-como-paragrafo", {
    filter: "div",
    replacement: (conteudo) => `\n\n${conteudo.trim()}\n\n`,
  });

  td.addRule("sublinhado", { filter: "u", replacement: (c) => c });

  return function htmlParaMd(html) {
    if (!html) return "";
    const limpo = String(html)
      .replace(/<!--[\s\S]*?-->/g, "")
      .replace(/​/g, "")
      // Parágrafo sem texto: com &nbsp; ou <br> ocupa uma linha no navegador (espaçamento intencional
      // dos autores) e vira "&nbsp;"; totalmente vazio (ex.: <p><!--ScriptorStartFragment--></p> do
      // Word Online) não ocupa nada no WordPress e é descartado.
      .replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, (p, dentro) => {
        if (/<img/i.test(dentro)) return p;
        const texto = dentro.replace(/<br\s*\/?>/gi, "&nbsp;").replace(/<[^>]+>/g, "");
        if (texto.replace(/&nbsp;|\s/g, "")) return p;
        return /&nbsp;| /.test(texto) ? "<p>ESPACOVAZIO</p>" : "";
      })
      // O Word Online cola linhas em branco como <div>&nbsp;</div>. Como o texto dele vem em <div>
      // sem margem e aqui vira parágrafo (com margem), só a linha em branco depois de uma lista é
      // mantida — senão o parágrafo seguinte cola na lista; as outras já equivalem à margem.
      .replace(/(<\/[ou]l>\s*)<div[^>]*>(?:&nbsp;| |\s|<br\s*\/?>)*(?:&nbsp;| |<br\s*\/?>)(?:&nbsp;| |\s|<br\s*\/?>)*<\/div>/gi, "$1<p>ESPACOVAZIO</p>");
    return td
      .turndown(limpo)
      .replace(/^ESPACOVAZIO$/gm, "&nbsp;")
      .replace(/ /g, " ")
      .replace(/[ \t]+\n/g, (m) => (m.startsWith("  ") ? "  \n" : "\n"))
      // Ênfase vazia ou colada na seguinte ("**a****b**" → "**ab**"). Só na mesma linha: com \s a
      // regra atravessava parágrafos e fundia "_A IA sugere._\n\n_Mas quem…_" num parágrafo só.
      .replace(/\*\*([ \t]*)\*\*/g, "$1")
      .replace(/_([ \t]*)_/g, "$1")
      .replace(/<\/Azul>([ \t]*)<Azul>/g, "$1")
      // O editor do WordPress gera um <ul> por item: junta em lista compacta, como aparece no site.
      .replace(/^([ \t]*)(-|\d+\.)[ \t]{2,}/gm, "$1$2 ")
      .replace(/^([ \t]*(?:-|\d+\.) .+)\n\n(?=[ \t]*(?:-|\d+\.) )/gm, "$1\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  };
}

/**
 * Aplica <Azul> parágrafo a parágrafo (e linha a linha em listas), mantendo marcadores de
 * lista e de título fora da tag — senão o MDX gera HTML inválido (<p> dentro de <span>).
 */
function envolverAzul(md) {
  return md
    .split(/(\n{2,})/)
    .map((bloco) =>
      /^\n+$/.test(bloco) || !bloco.trim()
        ? bloco
        : bloco
            .split("\n")
            .map((linha) => {
              const m = linha.match(/^(\s*(?:[-*+]|\d+\.)\s+|\s*#{1,6}\s+)?(.*?)(\s*)$/);
              return m[2] ? `${m[1] ?? ""}<Azul>${m[2]}</Azul>${m[3]}` : linha;
            })
            .join("\n"),
    )
    .join("");
}

function dentroDe(no, nomes) {
  for (let p = no.parentNode; p; p = p.parentNode) if (nomes.includes(p.nodeName)) return true;
  return false;
}

function dentroDeAzul(no) {
  for (let p = no.parentNode; p; p = p.parentNode) if (p.getAttribute && AZUL.test(p.getAttribute("style") || "")) return true;
  return false;
}
