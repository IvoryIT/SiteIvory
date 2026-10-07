// Hook PostToolUse (Write|Edit): toda vez que uma página do site é criada ou alterada,
// roda o verificador de conteúdo e SEO só nela.
//   - ERRO  -> sai com código 2: o Claude vê a lista e corrige antes de seguir.
//   - AVISO -> volta como contexto adicional (recomendação, não bloqueia).
import path from "node:path";
import { escrever, formatar, lerEntrada, RAIZ, verificar } from "./lib.mjs";

const entrada = await lerEntrada();
const arquivo = entrada.tool_input?.file_path || entrada.tool_response?.filePath;
if (!arquivo) process.exit(0);

const relativo = path.relative(RAIZ, path.resolve(RAIZ, arquivo)).split(path.sep).join("/");
if (!/^content\/paginas\/(.+\/)?(index\.mdx|agentes\.md)$/.test(relativo)) process.exit(0);

const r = verificar([relativo]);
if (r.falhou) {
  escrever(2, `Não consegui rodar o verificador em ${relativo}:\n${r.saida}`);
  process.exit(2);
}

const erros = r.achados.filter((a) => a.nivel === "ERRO");
const avisos = r.achados.filter((a) => a.nivel === "AVISO");

if (erros.length) {
  escrever(
    2,
    `A página ${relativo} tem ${erros.length} erro(s) que impedem a publicação. Corrija:\n${formatar(erros)}` +
      (avisos.length ? `\n\nRecomendações (avisos):\n${formatar(avisos, 15)}` : ""),
  );
  process.exit(2);
}

if (avisos.length) {
  escrever(
    1,
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PostToolUse",
        additionalContext: `Verificação de ${relativo}: sem erros. Recomendações de SEO/conteúdo:\n${formatar(avisos, 15)}`,
      },
    }),
  );
}
process.exit(0);
