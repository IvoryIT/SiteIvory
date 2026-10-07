// Posição vertical (y) de trechos de texto numa página — para achar onde dois layouts divergem.
// Uso: node scripts/marcos.mjs <url> <largura> "texto 1" "texto 2" ...
import { chromium } from "playwright";
const [url, largura, ...textos] = process.argv.slice(2);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: Number(largura), height: 900 } });
await p.route(/(clarity\.ms|googletagmanager|google-analytics|doubleclick|cloudfront)/, (r) => r.abort());
await p.goto(url, { waitUntil: "networkidle", timeout: 120000 });
await p.mouse.move(100, 100);
for (let i = 0; i < 20; i++) { await p.mouse.wheel(0, 500); await p.waitForTimeout(50); }
await p.addStyleTag({ url: "https://fonts.googleapis.com/css?family=Poppins:300,300italic,400,400italic,500,500italic,600,600italic,700,700italic,800,800italic&display=swap" }).catch(() => {});
await p.evaluate(() => document.fonts.ready);
await p.waitForTimeout(500);
const r = await p.evaluate((ts) => ts.map((t) => {
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let n; while ((n = w.nextNode())) { if (n.textContent.trim().startsWith(t)) { const rr = n.parentElement.getBoundingClientRect(); return `${t.slice(0, 28).padEnd(28)} y=${Math.round(rr.top + scrollY)} h=${Math.round(rr.height)}`; } }
  return `${t.slice(0, 28).padEnd(28)} (não achado)`;
}), textos);
console.log(r.join("\n"));
await b.close();
