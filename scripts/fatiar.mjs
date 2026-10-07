// Corta uma captura de página inteira em faixas, para inspeção visual.
// Uso: node scripts/fatiar.mjs <png> <alturaFaixa> <pastaSaida>
import fs from "node:fs";
import path from "node:path";
import { PNG } from "pngjs";
const [arq, alturaStr, saida] = process.argv.slice(2);
const png = PNG.sync.read(fs.readFileSync(arq));
const altura = Number(alturaStr);
fs.mkdirSync(saida, { recursive: true });
const base = path.basename(arq, ".png");
for (let y = 0, i = 0; y < png.height; y += altura, i++) {
  const h = Math.min(altura, png.height - y);
  const out = new PNG({ width: png.width, height: h });
  PNG.bitblt(png, out, 0, y, png.width, h, 0, 0);
  fs.writeFileSync(path.join(saida, `${base}-${String(i).padStart(2, "0")}.png`), PNG.sync.write(out));
}
console.log(`${png.width}x${png.height} -> ${Math.ceil(png.height / altura)} faixas`);
