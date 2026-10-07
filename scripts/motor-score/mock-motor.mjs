// Mock local do motor de score (POST /api/lead) para testar o formulário de contato do site.
//
// Valida cada corpo com o validatePayload REAL do motor, importado direto de
// D:\Ivory\Marketing\MKT_function_lead_receiver_processor\src\lib\validate.ts (Node 24 remove
// os tipos do .ts sozinho). Não altera nada no repositório de Marketing.
//
// Uso (na raiz do projeto):
//   node .\scripts\motor-score\mock-motor.mjs

//
// Modo de resposta (só para teste): GET http://127.0.0.1:7071/__modo?set=normal|500|400|403|404|sleep
//   normal = 202 se o validate passar, 400 se não; 500, 400, 403, 404 = sempre esse código
//   (403/404 simulam a plataforma: Function App parada, rota indisponível);
//   sleep  = espera 8 s e responde 202 (simula motor lento, acima do timeout de 5 s).
// Registro: uma linha JSON por requisição em scripts\motor-score\tmp\mock-log.jsonl
// (dados de teste; apagar a pasta tmp depois).

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const VALIDATE_TS =
  process.env.IMS_VALIDATE_TS ??
  "D:\\Ivory\\Marketing\\MKT_function_lead_receiver_processor\\src\\lib\\validate.ts";
const { validatePayload } = await import(pathToFileURL(VALIDATE_TS).href);

const here = path.dirname(fileURLToPath(import.meta.url));
const logDir = path.join(here, "..", "..", ".tmp");
const logFile = path.join(logDir, "mock-motor.jsonl");
fs.mkdirSync(logDir, { recursive: true });

const PORT = Number(process.env.IMS_MOCK_PORT ?? 7071);
// Só loopback: o Docker Desktop encaminha host.docker.internal para o 127.0.0.1 do Windows.
const HOST = process.env.IMS_MOCK_HOST ?? "127.0.0.1";
let modo = "normal";

function registra(entry) {
  fs.appendFileSync(logFile, JSON.stringify(entry) + "\n", "utf8");
  console.log(JSON.stringify(entry));
}

function responde(res, status, body) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(body));
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, "http://mock");

  if (req.method === "GET" && url.pathname === "/__modo") {
    const novo = url.searchParams.get("set");
    if (["normal", "500", "400", "403", "404", "sleep"].includes(novo)) modo = novo;
    return responde(res, 200, { modo });
  }

  if (req.method !== "POST" || url.pathname !== "/api/lead") {
    return responde(res, 404, { error: "not found" });
  }

  const partes = [];
  req.on("data", (c) => partes.push(c));
  req.on("end", () => {
    const raw = Buffer.concat(partes).toString("utf8");
    let body;
    let validacao;
    try {
      body = JSON.parse(raw);
      validacao = validatePayload(body);
    } catch {
      validacao = { ok: false, error: "invalid JSON" };
    }

    const tipos = body && typeof body === "object"
      ? Object.fromEntries(Object.entries(body).map(([k, v]) => [k, typeof v]))
      : {};

    let status;
    if (["500", "400", "403", "404"].includes(modo)) status = Number(modo);
    else status = validacao.ok ? 202 : 400;

    const fim = () => {
      registra({
        hora: new Date().toISOString(),
        modo,
        status,
        content_type: req.headers["content-type"] ?? null,
        validate_real: validacao.ok ? "ok" : validacao.error,
        tipos,
        body,
      });
      if (status === 202) return responde(res, 202, { ok: true });
      if (status === 400) return responde(res, 400, { error: validacao.ok ? "forçado pelo mock" : validacao.error });
      if (status === 403 || status === 404) return responde(res, status, { error: "plataforma simulada" });
      return responde(res, 500, { error: "erro simulado" });
    };

    if (modo === "sleep") setTimeout(fim, 8000);
    else fim();
  });
});

server.listen(PORT, HOST, () => {
  console.log(`mock-motor ouvindo em http://${HOST}:${PORT}/api/lead (validate real: ${VALIDATE_TS})`);
});
