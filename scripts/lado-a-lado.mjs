// Junta duas capturas (referência e novo) lado a lado, cortando a faixa [y, y+altura).
// Uso: node scripts/lado-a-lado.mjs <ref.png> <novo.png> <saida.png> [y] [altura]
import fs from "node:fs";
import { PNG } from "pngjs";
const [refArq, novoArq, saida, yStr = "0", hStr = "1400"] = process.argv.slice(2);
const a = PNG.sync.read(fs.readFileSync(refArq));
const b = PNG.sync.read(fs.readFileSync(novoArq));
const y = Number(yStr);
const h = Number(hStr);
const out = new PNG({ width: a.width + b.width + 12, height: h });
out.data.fill(255);
const ha = Math.max(0, Math.min(h, a.height - y));
const hb = Math.max(0, Math.min(h, b.height - y));
if (ha) PNG.bitblt(a, out, 0, y, a.width, ha, 0, 0);
if (hb) PNG.bitblt(b, out, 0, y, b.width, hb, a.width + 12, 0);
fs.writeFileSync(saida, PNG.sync.write(out));
