// Dimensões das imagens em public/, lidas no build (o <Image> do Next precisa delas
// para reservar o espaço e não deslocar o layout enquanto carrega).
import fs from "node:fs";
import path from "node:path";
import { imageSize } from "image-size";

const cache = new Map<string, { width: number; height: number }>();

export function caminhoPublico(src: string) {
  return path.join(process.cwd(), "public", decodeURIComponent(src.split("?")[0]));
}

export function dimensoesImagem(src: string): { width: number; height: number } {
  const salvo = cache.get(src);
  if (salvo) return salvo;
  let dims = { width: 1200, height: 800 };
  try {
    const r = imageSize(fs.readFileSync(caminhoPublico(src)));
    if (r.width && r.height) dims = { width: r.width, height: r.height };
  } catch {
    throw new Error(`Imagem não encontrada em public/: ${src}. Coloque o arquivo em public${src} ou corrija o caminho.`);
  }
  cache.set(src, dims);
  return dims;
}

/** Versão .webp gerada na migração, quando existe (usada em fundos CSS, que o next/image não otimiza). */
export function versaoWebp(src: string) {
  if (/\.webp$/i.test(src)) return src;
  const webp = `${src}.webp`;
  return fs.existsSync(caminhoPublico(webp)) ? webp : src;
}
