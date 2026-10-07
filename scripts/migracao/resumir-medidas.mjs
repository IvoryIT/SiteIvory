// Resume o JSON de medir.mjs numa linha curta por elemento.
// Uso: node scripts/migracao/resumir-medidas.mjs <medidas.json> [yMin] [yMax]
import fs from "node:fs";
const [arq, yMin = "0", yMax = "99999"] = process.argv.slice(2);
const d = JSON.parse(fs.readFileSync(arq, "utf8"));
const px = (v) => (v ? v.replace(/px/g, "").replace(/\.\d+/g, "") : "");
const cor = (v) => {
  if (!v) return "";
  const m = v.match(/rgba?\((\d+), (\d+), (\d+)(?:, ([\d.]+))?\)/);
  if (!m) return v;
  const hex = "#" + [m[1], m[2], m[3]].map((n) => Number(n).toString(16).padStart(2, "0")).join("");
  return m[4] !== undefined ? `${hex}/${m[4]}` : hex;
};
for (const e of d) {
  if (e.cls && /cmplz/.test(e.cls)) continue;
  if (e.y < Number(yMin) || e.y > Number(yMax)) continue;
  const p = [e.paddingTop, e.paddingRight, e.paddingBottom, e.paddingLeft].map(px).join("/");
  const m = [e.marginTop, e.marginRight, e.marginBottom, e.marginLeft].map(px).join("/");
  const partes = [
    `${e.tag}${e.tipo ? "[" + e.tipo.replace(".default", "") + "]" : ""}`,
    `@${e.x},${e.y} ${e.w}x${e.h}`,
    e.fontSize && e.texto ? `f=${px(e.fontSize)}/${e.fontWeight}${e.fontStyle === "italic" ? "i" : ""}/lh${px(e.lineHeight)}${e.fontFamily && !e.fontFamily.startsWith("Poppins") ? "/" + e.fontFamily.split(",")[0] : ""}` : "",
    e.color && e.texto ? `c=${cor(e.color)}` : "",
    e.backgroundColor ? `bg=${cor(e.backgroundColor)}` : "",
    e.backgroundImage ? `bgi=${e.backgroundImage.replace(/url\("?[^"]*\/([^/"]+)"?\)/, "$1").slice(0, 40)}` : "",
    p !== "///" && p !== "0/0/0/0" ? `p=${p}` : "",
    m !== "///" && m !== "0/0/0/0" ? `m=${m}` : "",
    e.borderTopLeftRadius ? `r=${px(e.borderTopLeftRadius)}` : "",
    e.borderTopWidth && e.borderTopStyle && e.borderTopStyle !== "none" ? `b=${px(e.borderTopWidth)} ${cor(e.borderTopColor)}` : "",
    e.gap ? `gap=${px(e.gap)}` : "",
    e.textAlign && e.textAlign !== "left" ? `ta=${e.textAlign}` : "",
    e.textTransform ? `tt=${e.textTransform}` : "",
    e.letterSpacing ? `ls=${e.letterSpacing}` : "",
    e.texto ? `"${e.texto.slice(0, 38)}"` : "",
  ].filter(Boolean);
  console.log(partes.join(" "));
}
