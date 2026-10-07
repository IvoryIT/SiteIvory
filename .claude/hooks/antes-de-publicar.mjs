// Hook PreToolUse (git commit / git push): antes de qualquer commit ou push, verifica todas
// as páginas do site. Com qualquer ERRO, bloqueia o comando (código 2) e mostra o que corrigir.
import { escrever, formatar, lerEntrada, verificar } from "./lib.mjs";

await lerEntrada();
const r = verificar();
if (r.falhou) {
  escrever(2, `Publicação bloqueada: o verificador não rodou.\n${r.saida}`);
  process.exit(2);
}

const erros = r.achados.filter((a) => a.nivel === "ERRO");
if (erros.length) {
  escrever(
    2,
    `Publicação bloqueada: ${erros.length} erro(s) em ${new Set(erros.map((e) => e.arquivo)).size} arquivo(s). ` +
      `Corrija e tente de novo (detalhes: npm run verificar).\n${formatar(erros)}`,
  );
  process.exit(2);
}
process.exit(0);
