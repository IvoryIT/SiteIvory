// Utilitários comuns dos hooks do Claude Code deste projeto.
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

export const RAIZ = process.env.CLAUDE_PROJECT_DIR || process.cwd();

export async function lerEntrada() {
  let texto = "";
  for await (const parte of process.stdin) texto += parte;
  try {
    return JSON.parse(texto || "{}");
  } catch {
    return {};
  }
}

/** Roda `scripts/verificar.mts` e devolve o resultado em JSON. */
export function verificar(arquivos = []) {
  const require = createRequire(path.join(RAIZ, "package.json"));
  const cli = require.resolve("tsx/cli");
  const r = spawnSync(process.execPath, [cli, "scripts/verificar.mts", ...arquivos, "--json"], {
    cwd: RAIZ,
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
  try {
    return JSON.parse(r.stdout);
  } catch {
    return { falhou: true, saida: `${r.stdout || ""}\n${r.stderr || ""}`.trim().slice(-3000) };
  }
}

export function formatar(achados, limite = 40) {
  const linhas = achados.slice(0, limite).map((a) => `- ${a.nivel} [${a.regra}] ${a.arquivo}: ${a.mensagem}`);
  if (achados.length > limite) linhas.push(`- ... e mais ${achados.length - limite}.`);
  return linhas.join("\n");
}

/** Escrita síncrona (process.exit logo depois não pode cortar a saída num pipe do Windows). */
export function escrever(fd, texto) {
  fs.writeSync(fd, String(texto) + "\n");
}
