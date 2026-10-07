// Teste de fumaça do site (local ou publicado): todas as páginas, 404, redirects herdados do
// WordPress, Markdown para agentes, arquivos de SEO e o encaminhamento do formulário.
// Uso: node scripts/smoke.mjs [baseUrl]   (padrão http://localhost:3000)
import fs from "node:fs";
import path from "node:path";

const BASE = (process.argv[2] || "http://localhost:3000").replace(/\/$/, "");
const falhas = [];
let total = 0;
const checar = (ok, descricao) => {
  total++;
  if (!ok) falhas.push(descricao);
};

async function pegar(caminho, opcoes = {}) {
  return fetch(BASE + caminho, { redirect: "manual", ...opcoes });
}

// 1. Todas as páginas de content/paginas respondem 200 com <title> e canonical corretos.
const raiz = path.join(process.cwd(), "content", "paginas");
const caminhos = [];
(function coletar(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) coletar(path.join(dir, e.name));
    else if (e.name === "index.mdx") {
      const seg = path.relative(raiz, dir).split(path.sep).filter(Boolean);
      caminhos.push(seg.length ? `/${seg.join("/")}/` : "/");
    }
  }
})(raiz);
for (const c of caminhos) {
  const r = await pegar(c);
  const html = r.status === 200 ? await r.text() : "";
  checar(r.status === 200, `${c} respondeu ${r.status}`);
  checar(/<title>[^<]+<\/title>/.test(html), `${c} sem <title>`);
  checar(html.includes(`<link rel="canonical" href="https://ivoryit.com.br${c}"`), `${c} sem canonical correto`);
  checar((html.match(/<h1[\s>]/g) || []).length === 1, `${c} não tem exatamente um <h1> (${(html.match(/<h1[\s>]/g) || []).length})`);
}

// 2. 404 com a página própria, já na primeira visita (URL nova a cada execução, sem cache).
for (const inexistente of [`/nao-existe-${Date.now()}/`, `/blog/nao-existe-${Date.now()}/`]) {
  const r404 = await pegar(inexistente);
  checar(r404.status === 404, `URL inexistente ${inexistente} respondeu ${r404.status} (esperado 404)`);
}

// 3. Redirects herdados do WordPress.
const redirects = JSON.parse(fs.readFileSync("src/data/redirects.json", "utf8"));
const ids = JSON.parse(fs.readFileSync("src/data/ids-wordpress.json", "utf8"));
const amostra = [...redirects.slice(0, 8), ...redirects.filter((r) => r.de.startsWith("/blog-")).slice(0, 3)];
for (const { de, para } of amostra) {
  const r = await pegar(de);
  checar([301, 308].includes(r.status) && (r.headers.get("location") || "").endsWith(para), `redirect ${de} -> ${para} falhou (${r.status} ${r.headers.get("location")})`);
}
const [idQualquer, caminhoDoId] = Object.entries(ids)[0];
const rId = await pegar(`/?p=${idQualquer}`);
checar([301, 308].includes(rId.status) && (rId.headers.get("location") || "").endsWith(caminhoDoId), `/?p=${idQualquer} não redirecionou para ${caminhoDoId} (${rId.status} ${rId.headers.get("location")})`);
const rPageId = await pegar(`/?page_id=${idQualquer}`);
checar([301, 308].includes(rPageId.status) && (rPageId.headers.get("location") || "").endsWith(caminhoDoId), `/?page_id=${idQualquer} não redirecionou para ${caminhoDoId}`);
const rIdDesconhecido = await pegar("/?p=999999");
checar(rIdDesconhecido.status === 200, `/?p= com ID desconhecido respondeu ${rIdDesconhecido.status} (esperado a home)`);
const rSemBarra = await pegar("/como-fazemos");
checar([301, 308].includes(rSemBarra.status), "URL sem barra final não redirecionou para a versão com barra");

// 4. Markdown para agentes na mesma URL.
const rMd = await pegar("/como-fazemos/", { headers: { Accept: "text/markdown" } });
checar(rMd.status === 200 && (rMd.headers.get("content-type") || "").includes("text/markdown"), `Accept: text/markdown não devolveu Markdown (${rMd.status} ${rMd.headers.get("content-type")})`);
const rHtml = await pegar("/como-fazemos/", { headers: { Accept: "text/html" } });
checar((rHtml.headers.get("content-type") || "").includes("text/html"), "navegador não recebeu HTML");

// 5. Arquivos de SEO.
for (const [arq, tipo] of [["/robots.txt", "text/plain"], ["/sitemap.xml", "xml"], ["/llms.txt", "text/plain"], ["/google0ffaa3c48c734a05.html", "text/html"]]) {
  const r = await pegar(arq);
  checar(r.status === 200 && (r.headers.get("content-type") || "").includes(tipo), `${arq} respondeu ${r.status} ${r.headers.get("content-type")}`);
}
const sitemap = await (await pegar("/sitemap.xml")).text();
checar((sitemap.match(/<loc>/g) || []).length >= caminhos.length - 5, `sitemap com ${(sitemap.match(/<loc>/g) || []).length} URLs para ${caminhos.length} páginas`);

// 6. Formulário: /api/lead/ é repassado ao motor (o mock responde 202 a um lead válido).
if (process.env.TESTAR_FORMULARIO === "1") {
  const r = await pegar("/api/lead/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ campaign_id: "site_institucional", nome: "Teste Smoke", email: "smoke@empresa-teste.com.br", formulario_id: "342" }),
  });
  checar(r.status === 202, `/api/lead/ respondeu ${r.status} (esperado 202 do mock)`);
}

console.log(`${total - falhas.length}/${total} verificações ok em ${BASE}`);
for (const f of falhas) console.log(`FALHOU: ${f}`);
process.exitCode = falhas.length ? 1 : 0;
