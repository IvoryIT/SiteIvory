import type { NextConfig } from "next";
import redirectsDoWordPress from "./src/data/redirects.json" with { type: "json" };

/**
 * Destino do formulário de contato. O navegador posta em /api/lead (mesmo domínio, sem CORS)
 * e a Vercel repassa para a function `lead-receiver` do motor de score.
 * Em preview e no ambiente local aponte para o mock ou a function local, nunca para produção.
 */
const MOTOR_SCORE_URL = process.env.MOTOR_SCORE_URL || "http://localhost:7071/api/lead";

const nextConfig: NextConfig = {
  cacheComponents: true,
  // Desligado de propósito: com ele, URL que não existe recebe a casca da página com status 200
  // antes do notFound() rodar. Sem ele, o 404 é real (e todas as páginas válidas são estáticas).
  partialPrefetching: false,
  // URLs com barra final, como no WordPress: /como-fazemos/
  trailingSlash: true,
  devIndicators: false,
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [390, 640, 768, 1024, 1280, 1440, 1920],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },

  // Links antigos /?p=ID e /?page_id=ID ficam em src/proxy.ts (aqui o destino herdaria a query).
  async redirects() {
    return redirectsDoWordPress.map((r) => ({ source: r.de, destination: r.para, permanent: true }));
  },

  async rewrites() {
    return {
      beforeFiles: [
        // Agentes de IA que pedem Markdown (Accept: text/markdown) recebem a versão editorial
        // da mesma URL (substitui o plugin Agent Markdown Responses).
        { source: "/", has: [{ type: "header", key: "accept", value: "(.*)text/markdown(.*)" }], destination: "/md" },
        { source: "/:caminho*/", has: [{ type: "header", key: "accept", value: "(.*)text/markdown(.*)" }], destination: "/md/:caminho*" },
      ],
      afterFiles: [{ source: "/api/lead/", destination: MOTOR_SCORE_URL }],
      fallback: [],
    };
  },

  async headers() {
    return [
      // A mesma URL serve HTML ou Markdown conforme o Accept: caches precisam saber disso.
      { source: "/:caminho*", headers: [{ key: "Vary", value: "Accept" }] },
      {
        source: "/:caminho*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
    ];
  },
};

export default nextConfig;
