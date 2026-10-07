// Captura telas de página inteira de uma lista de caminhos em várias larguras.
// Uso: node scripts/capturar.mjs <baseUrl> <pastaSaida> <caminho> [caminho...]
//      LARGURAS=1440,390 (padrão 1440,768,390)   PULAR_EXISTENTES=1 (retoma uma captura interrompida)
//      node scripts/capturar.mjs <baseUrl> <pastaSaida> --lista arquivo.txt
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const [baseUrl, outDir, ...rest] = process.argv.slice(2);
if (!baseUrl || !outDir || rest.length === 0) {
  console.error("Uso: node scripts/capturar.mjs <baseUrl> <pastaSaida> <caminho...> | --lista arquivo");
  process.exit(1);
}
const caminhos =
  rest[0] === "--lista"
    ? fs.readFileSync(rest[1], "utf8").split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
    : rest;
const larguras = (process.env.LARGURAS || "1440,768,390").split(",").map(Number);
fs.mkdirSync(outDir, { recursive: true });

const nomeArquivo = (caminho, largura) =>
  `${caminho.replace(/^\/|\/$/g, "").replace(/\//g, "__") || "inicio"}-${largura}.png`;

const browser = await chromium.launch();
for (const largura of larguras) {
  const context = await browser.newContext({ viewport: { width: largura, height: 900 }, reducedMotion: "reduce" });
  // Banner de cookies e scripts de terceiros só atrapalham a comparação.
  await context.route(/(clarity\.ms|googletagmanager|google-analytics|complianz.*\.js)/, (r) => r.abort());
  const page = await context.newPage();
  for (const caminho of caminhos) {
    const destino = path.join(outDir, nomeArquivo(caminho, largura));
    if (process.env.PULAR_EXISTENTES === "1" && fs.existsSync(destino)) continue;
    try {
      await page.goto(new URL(caminho, baseUrl).href, { waitUntil: "networkidle", timeout: 120_000 });
      // O LiteSpeed só carrega JS (e parte das fontes) depois de interação do usuário:
      // mexe o mouse e rola com a roda para disparar scripts e lazy load.
      await page.mouse.move(200, 200);
      const altura = await page.evaluate(() => document.body.scrollHeight);
      for (let y = 0; y < altura; y += 400) {
        await page.mouse.wheel(0, 400);
        await page.waitForTimeout(120);
      }
      await page.waitForLoadState("networkidle", { timeout: 60_000 }).catch(() => {});
      // No WordPress a Poppins só é injetada (Google Fonts) depois de interação e com atraso;
      // garante a fonte para a captura não sair em Arial.
      if (process.env.INJETAR_POPPINS !== "0") {
        const temPoppins = await page.evaluate(() => document.fonts.check("16px Poppins") && [...document.fonts].some((f) => f.family.includes("Poppins") && f.status === "loaded"));
        if (!temPoppins) {
          await page.addStyleTag({ url: "https://fonts.googleapis.com/css?family=Poppins:300,300italic,400,400italic,500,500italic,600,600italic,700,700italic,800,800italic&display=swap" }).catch(() => {});
        }
      }
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(300);
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.mouse.move(0, 0);
      await page.addStyleTag({ content: "*,*::before,*::after{animation:none!important;transition:none!important} #cmplz-cookiebanner-container,.cmplz-cookiebanner,[aria-labelledby=consentimento-titulo]{display:none!important}" });
      await page.waitForTimeout(500);
      await page.screenshot({ path: destino, fullPage: true });
      console.log(`ok  ${largura}  ${caminho}`);
    } catch (e) {
      console.log(`ERRO ${largura} ${caminho}: ${e.message.split("\n")[0]}`);
    }
  }
  await context.close();
}
await browser.close();
