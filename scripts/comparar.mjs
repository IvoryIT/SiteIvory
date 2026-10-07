// Compara capturas do WordPress (referência) com as do site novo.
// Gera, por página e largura, uma imagem lado a lado (referência | novo | diferença) e um
// relatório com a porcentagem de pixels diferentes.
//
// Uso: node scripts/comparar.mjs <pastaReferencia> <pastaNovo> <pastaSaida> [limitePercentual]
import fs from "node:fs";
import path from "node:path";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";

const [refDir, novoDir, saida, limiteStr = "5"] = process.argv.slice(2);
if (!refDir || !novoDir || !saida) {
  console.error("Uso: node scripts/comparar.mjs <pastaReferencia> <pastaNovo> <pastaSaida> [limite%]");
  process.exit(1);
}
fs.mkdirSync(saida, { recursive: true });
const limite = Number(limiteStr);
const linhas = [];
let reprovadas = 0;

function ajustar(png, largura, altura) {
  const out = new PNG({ width: largura, height: altura, fill: true });
  out.data.fill(255);
  PNG.bitblt(png, out, 0, 0, Math.min(png.width, largura), Math.min(png.height, altura), 0, 0);
  return out;
}

for (const arq of fs.readdirSync(refDir).filter((f) => f.endsWith(".png")).sort()) {
  const novoArq = path.join(novoDir, arq);
  if (!fs.existsSync(novoArq)) {
    linhas.push(`| ${arq} | — | sem captura do site novo |`);
    continue;
  }
  const ref = PNG.sync.read(fs.readFileSync(path.join(refDir, arq)));
  const novo = PNG.sync.read(fs.readFileSync(novoArq));
  const largura = Math.max(ref.width, novo.width);
  const altura = Math.max(ref.height, novo.height);
  const a = ajustar(ref, largura, altura);
  const b = ajustar(novo, largura, altura);
  const diff = new PNG({ width: largura, height: altura });
  const n = pixelmatch(a.data, b.data, diff.data, largura, altura, { threshold: 0.15, includeAA: false });
  const pct = (100 * n) / (largura * altura);
  const alturaDif = ((novo.height - ref.height) / ref.height) * 100;
  const ok = pct <= limite && Math.abs(alturaDif) <= 3;
  if (!ok) reprovadas++;

  const lado = new PNG({ width: largura * 3, height: altura, fill: true });
  PNG.bitblt(a, lado, 0, 0, largura, altura, 0, 0);
  PNG.bitblt(b, lado, 0, 0, largura, altura, largura, 0);
  PNG.bitblt(diff, lado, 0, 0, largura, altura, largura * 2, 0);
  fs.writeFileSync(path.join(saida, arq), PNG.sync.write(lado));
  linhas.push(`| ${arq} | ${pct.toFixed(2)}% | altura ${ref.height}→${novo.height} (${alturaDif >= 0 ? "+" : ""}${alturaDif.toFixed(1)}%) ${ok ? "ok" : "REVISAR"} |`);
}

const relatorio = ["| Captura | Pixels diferentes | Situação |", "|---|---|---|", ...linhas].join("\n");
fs.writeFileSync(path.join(saida, "relatorio.md"), relatorio + "\n");
console.log(relatorio);
console.log(`\n${reprovadas} captura(s) acima do limite de ${limite}% ou com altura diferente em mais de 3%.`);
process.exitCode = reprovadas ? 1 : 0;
