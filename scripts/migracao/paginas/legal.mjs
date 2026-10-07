// Conversor das páginas legais: /politica-de-privacidade/ (id 3), /portal-de-privacidade/ (id 2825)
// e /politica-de-cookies/ (id 2849). Todas viram <LegalDocumento> (título centralizado + texto).
//
// A política de cookies, no WordPress, é gerada na hora pelo shortcode do Complianz
// [cmplz-document type="cookie-statement" region="br"]. O texto renderizado fica guardado em
// scripts/migracao/paginas/legal-cookies.html; para capturá-lo de novo do WordPress local:
//   node scripts/migracao/paginas/legal.mjs --capturar-cookies
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { attr, ehWidget, encontrarTodos, ocultoSempre, textoPuro } from "../lib/wp.mjs";

export const caminhos = ["/politica-de-privacidade/", "/portal-de-privacidade/", "/politica-de-cookies/"];

const ARQUIVO_COOKIES = path.join(path.dirname(fileURLToPath(import.meta.url)), "legal-cookies.html");
const URL_COOKIES = "http://localhost:8080/politica-de-cookies/";
const SITE = "https://ivoryit.com.br";

// ------------------------------------------------------------------ captura do Complianz

/** Conteúdo interno do primeiro <div> que casa com `abertura` (conta os <div> aninhados). */
function conteudoDoDiv(html, abertura) {
  const inicio = html.search(abertura);
  if (inicio < 0) return undefined;
  const corpoInicio = html.indexOf(">", inicio) + 1;
  const re = /<\/?div\b[^>]*>/g;
  re.lastIndex = corpoInicio;
  let nivel = 1;
  for (let m; (m = re.exec(html)); ) {
    nivel += m[0].startsWith("</") ? -1 : 1;
    if (nivel === 0) return html.slice(corpoInicio, m.index);
  }
  return undefined;
}

async function capturarCookies() {
  const html = await (await fetch(URL_COOKIES)).text();
  const documento = conteudoDoDiv(html, /<div id="cmplz-document"/);
  if (!documento) throw new Error(`não achei #cmplz-document em ${URL_COOKIES}`);
  const cabecalho = `<!-- Texto gerado pelo shortcode [cmplz-document type="cookie-statement" region="br"] do Complianz, capturado de ${URL_COOKIES} em ${new Date().toISOString().slice(0, 10)}. Revisar quando o banner de cookies do site novo for definido. -->`;
  fs.writeFileSync(ARQUIVO_COOKIES, `${cabecalho}\n${documento.replaceAll("http://localhost:8080", SITE).trim()}\n`);
  console.log(`declaração de cookies salva em ${path.relative(process.cwd(), ARQUIVO_COOKIES)}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href && process.argv.includes("--capturar-cookies")) {
  await capturarCookies();
}

// ------------------------------------------------------------------ conversão

/** <br><br> vira duas quebras no mesmo parágrafo ("\" no fim da linha); linha só com espaços viraria parágrafo novo. */
const markdown = (ctx, html) =>
  ctx
    .htmlParaMd(html)
    .replace(/ {2}\n {2}\n/g, "\\\n\\\n")
    // "## 1\. Introdução": o escape do número é desnecessário em título.
    .replace(/^(#{2,6} \d+)\\\./gm, "$1.");

/** Meta description: começo do texto corrido (só parágrafos, sem títulos), até 155 caracteres. */
function descricaoDe(html) {
  const texto = [...String(html).matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g)]
    .map((m) => textoPuro(m[1]))
    .filter((t) => t.length > 40)
    .join(" ");
  return texto.length > 155 ? `${texto.slice(0, 155).replace(/\s+\S*$/, "")}…` : texto || undefined;
}

/** Converte HTML de texto, mantendo parágrafos centralizados num <LegalCentralizado>. */
function textoParaMdx(ctx, html) {
  const partes = [];
  let resto = html;
  const centro = /<p[^>]*style="[^"]*text-align:\s*center[^"]*"[^>]*>([\s\S]*?)<\/p>/i;
  for (let m; (m = resto.match(centro)); ) {
    partes.push(markdown(ctx, resto.slice(0, m.index)));
    partes.push(`<LegalCentralizado>\n${markdown(ctx, `<p>${m[1]}</p>`)}\n</LegalCentralizado>`);
    resto = resto.slice(m.index + m[0].length);
  }
  partes.push(markdown(ctx, resto));
  return partes.filter(Boolean).join("\n\n");
}

const celula = (ctx, html) => markdown(ctx, html ?? "").replace(/\n+/g, " ").replace(/\|/g, "\\|") || " ";

/** Um <details> da lista "Cookies inseridos" do Complianz vira <LegalServicoCookie>. */
function servicoParaMdx(ctx, details) {
  const nome = textoPuro(details.match(/<summary[\s\S]*?<h3>([\s\S]*?)<\/h3>/)?.[1]);
  const finalidades = textoPuro(details.match(/<summary[\s\S]*?<\/h3>\s*<p>([\s\S]*?)<\/p>/)?.[1]);
  const [descricao, ...propositos] = details.replace(/<summary[\s\S]*?<\/summary>/, "").replace(/<\/?details[^>]*>/g, "").split('<div class="cookies-per-purpose">');
  const blocos = [markdown(ctx, descricao)];
  for (const bloco of propositos) {
    const proposito = textoPuro(bloco.match(/<h4>([\s\S]*?)<\/h4>/)?.[1]);
    const col = (classe) => [...bloco.matchAll(new RegExp(`<div class="${classe}">([\\s\\S]*?)</div>`, "g"))].map((m) => m[1]);
    const [nomes, validades, funcoes] = [col("name"), col("retention"), col("function")];
    const linhas = nomes.map((n, i) => `| ${celula(ctx, n)} | ${celula(ctx, validades[i])} | ${celula(ctx, funcoes[i])} |`);
    blocos.push(`#### ${proposito}\n\n| Nome | Expiração | Função |\n|---|---|---|\n${linhas.join("\n")}`);
  }
  return `<LegalServicoCookie nome="${attr(nome)}" finalidades="${attr(finalidades)}">\n${blocos.filter(Boolean).join("\n\n")}\n</LegalServicoCookie>`;
}

function declaracaoCookies(ctx, avisos) {
  if (!fs.existsSync(ARQUIVO_COOKIES)) {
    avisos.push("declaração de cookies não capturada: rode `node scripts/migracao/paginas/legal.mjs --capturar-cookies`");
    return "";
  }
  avisos.push(
    "política de cookies: texto do shortcode do Complianz gravado como conteúdo fixo (capturado do WordPress). REVISAR quando o banner de cookies novo for definido (serviços, cookies e e-mail de contato mudam)",
  );
  const html = fs
    .readFileSync(ARQUIVO_COOKIES, "utf8")
    .replace(/<!--[\s\S]*?-->/g, "")
    // O Complianz ofusca o e-mail com um trecho escondido (classe cmplz-fmail-domain).
    .replace(/<span class="cmplz-fmail-domain">[\s\S]*?<\/span>/g, "")
    .replace(/<label[\s\S]*?<\/label>|<input[^>]*>/g, "");
  const lista = conteudoDoDiv(html, /<div id="cmplz-cookies-overview"/);
  const inicioLista = html.indexOf('<div id="cmplz-cookies-overview"');
  const antes = html.slice(0, inicioLista);
  const depois = html.slice(inicioLista + html.slice(inicioLista).indexOf(lista) + lista.length).replace(/^<\/div>/, "");
  const servicos = [...lista.matchAll(/<details[\s\S]*?<\/details>/g)].map((m) => servicoParaMdx(ctx, m[0]));
  return `<LegalCookies>\n${[markdown(ctx, antes), ...servicos, markdown(ctx, depois)].filter(Boolean).join("\n\n")}\n</LegalCookies>`;
}

export function converter(p, ctx) {
  const avisos = [];
  let titulo;
  const blocos = [];
  const textosHtml = [];
  const temDescricao = Boolean(ctx.wp.head[p.id]?.descricao || p.seoDescricao);

  const widgets = p.elementor?.length
    ? encontrarTodos(p.elementor, (n) => n.elType === "widget" && !ocultoSempre(n))
    : // Página do editor clássico: título no primeiro <h2>, o resto é texto (ou o shortcode).
      [{ widgetType: "text-editor", settings: { editor: p.conteudoWp ?? "" } }];

  for (const w of widgets) {
    if (ehWidget(w, "template") && Number(w.settings.template_id) === 2421) continue; // topo do rodapé = final padrão
    if (w.widgetType === "heading") {
      if (!titulo) titulo = textoPuro(w.settings.title);
      else blocos.push(`## ${textoPuro(w.settings.title)}`);
      continue;
    }
    if (w.widgetType === "shortcode" || /\[cmplz-document/.test(w.settings.editor ?? "")) {
      const texto = w.settings.shortcode ?? w.settings.editor;
      if (/\[cmplz-document[^\]]*cookie-statement/.test(texto)) {
        blocos.push(declaracaoCookies(ctx, avisos));
        if (fs.existsSync(ARQUIVO_COOKIES)) textosHtml.push(fs.readFileSync(ARQUIVO_COOKIES, "utf8"));
      } else avisos.push(`shortcode não convertido: ${textoPuro(texto).slice(0, 80)}`);
      continue;
    }
    if (w.widgetType === "text-editor") {
      let html = w.settings.editor ?? "";
      if (!titulo && !p.elementor?.length) {
        const h = html.match(/^\s*<h2[^>]*>([\s\S]*?)<\/h2>/);
        if (h) {
          titulo = textoPuro(h[1]);
          html = html.slice(h[0].length);
        }
      }
      if (/\[cmplz-document/.test(html)) {
        blocos.push(declaracaoCookies(ctx, avisos));
        html = html.replace(/\[cmplz-document[^\]]*\]/g, "");
      }
      textosHtml.push(html);
      const md = textoParaMdx(ctx, html);
      if (md) blocos.push(md);
      continue;
    }
    avisos.push(`widget não tratado: ${w.widgetType}`);
  }

  // Sem título (Portal de Privacidade): a primeira frase centralizada em negrito faz o papel de H1.
  if (!titulo) {
    const frase = /(?<=^|\n)<LegalCentralizado>\n\*\*([^*\n]+)\*\*\n(?=<\/LegalCentralizado>)/;
    const i = blocos.findIndex((b) => frase.test(b));
    if (i >= 0) blocos[i] = blocos[i].replace(frase, "<LegalCentralizado>\n# $1\n");
    else avisos.push("página legal sem título nem frase centralizada para servir de H1");
  }
  const corpo = `<LegalDocumento${titulo ? ` titulo="${attr(titulo)}"` : ""}>\n${blocos.join("\n\n")}\n</LegalDocumento>`;
  // Sem meta description no WordPress: usa o começo do texto (o padrão do orquestrador mistura títulos).
  const descricao = temDescricao ? undefined : descricaoDe(textosHtml.join("\n"));
  return {
    familia: "pagina",
    frontmatter: { familia: "pagina", titulo: p.titulo, semCapa: true, ...(descricao ? { seo: { descricao } } : {}) },
    corpo,
    avisos,
  };
}
