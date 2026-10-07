// Mede estilos computados dos elementos do Elementor numa página do WordPress (fonte de verdade
// do layout durante a migração). Saída: JSON com um registro por elemento visível.
// Uso: node scripts/migracao/medir.mjs <url> <saida.json> [largura]
import { chromium } from "playwright";
import fs from "node:fs";

const [url, saida, larguraStr = "1440"] = process.argv.slice(2);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: Number(larguraStr), height: 900 } });
await page.route(/(clarity\.ms|googletagmanager|google-analytics|doubleclick|cloudfront)/, (r) => r.abort());
await page.goto(url, { waitUntil: "networkidle", timeout: 120_000 });
await page.mouse.move(100, 100);
for (let i = 0; i < 30; i++) { await page.mouse.wheel(0, 400); await page.waitForTimeout(60); }
await page.waitForLoadState("networkidle").catch(() => {});
await page.addStyleTag({ url: "https://fonts.googleapis.com/css?family=Poppins:300,300italic,400,400italic,500,500italic,600,600italic,700,700italic,800,800italic&display=swap" }).catch(() => {});
await page.evaluate(() => document.fonts.ready);
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(300);

const dados = await page.evaluate(() => {
  const props = ["display", "flexDirection", "flexWrap", "justifyContent", "alignItems", "gap", "fontFamily", "fontSize", "fontWeight", "fontStyle", "lineHeight", "letterSpacing", "textAlign", "textTransform", "color", "backgroundColor", "backgroundImage", "backgroundSize", "backgroundPosition", "paddingTop", "paddingRight", "paddingBottom", "paddingLeft", "marginTop", "marginRight", "marginBottom", "marginLeft", "borderTopLeftRadius", "borderTopRightRadius", "borderBottomLeftRadius", "borderBottomRightRadius", "borderTopWidth", "borderTopColor", "borderTopStyle", "maxWidth", "width", "minHeight", "position", "opacity", "boxShadow", "textDecorationLine"];
  const ignorar = ["normal", "none", "0px", "auto", "static", "rgba(0, 0, 0, 0)", "start", "nowrap", "visible", "1", "stretch", "row"];
  const out = [];
  const els = document.querySelectorAll("[data-id], [data-id] > h1, [data-id] > h2, [data-id] > h3, [data-id] > h4, [data-id] > div > h1, [data-id] p, [data-id] li, [data-id] a, [data-id] strong, [data-id] em, [data-id] span[style], header, footer, img, button, input, textarea, label");
  for (const el of els) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) continue;
    const cs = getComputedStyle(el);
    const cls = typeof el.className === "string" ? el.className : "";
    const o = { tag: el.tagName.toLowerCase(), id: el.getAttribute("data-id") || undefined, tipo: el.getAttribute("data-widget_type") || el.getAttribute("data-element_type") || undefined, cls: cls.split(" ").filter((c) => c && !c.startsWith("elementor-element-")).slice(0, 6).join(" ") || undefined, x: Math.round(r.x), y: Math.round(r.y + window.scrollY), w: Math.round(r.width), h: Math.round(r.height), texto: (el.innerText || el.getAttribute("alt") || "").trim().replace(/\s+/g, " ").slice(0, 70) || undefined };
    for (const p of props) {
      const v = cs[p];
      if (v && !ignorar.includes(v)) o[p] = v.length > 140 ? v.slice(0, 140) + "…" : v;
    }
    out.push(o);
  }
  return out;
});
fs.writeFileSync(saida, JSON.stringify(dados, null, 1));
console.log(`${dados.length} elementos -> ${saida}`);
await browser.close();
