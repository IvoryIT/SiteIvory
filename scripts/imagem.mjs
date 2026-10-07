// Prepara uma imagem nova para o site: converte para WebP, limita a largura e grava em
// public/imagens/AAAA/MM/<nome>.webp. Imprime o caminho público e as dimensões.
//
// Uso: node scripts/imagem.mjs <arquivo-de-origem> [nome-sem-extensao] [--largura 1600] [--qualidade 82]
// Ex.:  node scripts/imagem.mjs ~/Downloads/foto.png capa-ia-na-logistica
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const args = process.argv.slice(2);
const opcao = (n, padrao) => {
  const i = args.indexOf(`--${n}`);
  return i >= 0 ? Number(args[i + 1]) : padrao;
};
const posicionais = args.filter((a, i) => !a.startsWith("--") && !args[i - 1]?.startsWith("--"));
const [origem, nomeInformado] = posicionais;
if (!origem || !fs.existsSync(origem)) {
  console.error("Uso: node scripts/imagem.mjs <arquivo-de-origem> [nome] [--largura 1600] [--qualidade 82]");
  process.exit(1);
}

const largura = opcao("largura", 1600);
const qualidade = opcao("qualidade", 82);
const slug = (nomeInformado || path.parse(origem).name)
  .normalize("NFD")
  .replace(/[̀-ͯ]/g, "")
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-|-$/g, "");

const agora = new Date();
const pasta = path.join("public", "imagens", String(agora.getFullYear()), String(agora.getMonth() + 1).padStart(2, "0"));
fs.mkdirSync(pasta, { recursive: true });
let destino = path.join(pasta, `${slug}.webp`);
for (let n = 2; fs.existsSync(destino); n++) destino = path.join(pasta, `${slug}-${n}.webp`);

const ehSvg = /\.svg$/i.test(origem);
if (ehSvg) {
  destino = destino.replace(/\.webp$/, ".svg");
  fs.copyFileSync(origem, destino);
} else {
  await sharp(origem).rotate().resize({ width: largura, withoutEnlargement: true }).webp({ quality: qualidade }).toFile(destino);
}
const meta = ehSvg ? {} : await sharp(destino).metadata();
const kb = Math.round(fs.statSync(destino).size / 1024);
const publico = "/" + path.relative("public", destino).split(path.sep).join("/");
console.log(JSON.stringify({ caminho: publico, largura: meta.width, altura: meta.height, kb }));
