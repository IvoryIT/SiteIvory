import { NextResponse, type NextRequest } from "next/server";
import idsWordPress from "@/data/ids-wordpress.json" with { type: "json" };

const ids: Record<string, string> = idsWordPress;

/**
 * Links antigos do WordPress no formato /?p=ID e /?page_id=ID vão para a URL atual, sem a query
 * (como o WordPress fazia). Fica aqui e não em redirects() do next.config porque lá o Next
 * sempre repassa a query de origem ao destino (/politica-de-privacidade/?p=3).
 */
export function proxy(request: NextRequest) {
  const busca = request.nextUrl.searchParams;
  const caminho = ids[busca.get("p") ?? ""] ?? ids[busca.get("page_id") ?? ""];
  if (!caminho) return NextResponse.next();
  return NextResponse.redirect(new URL(caminho, request.url), 301);
}

// Só roda na home com ?p= ou ?page_id=; o resto do site nem passa por aqui.
export const config = {
  matcher: [
    { source: "/", has: [{ type: "query", key: "p" }] },
    { source: "/", has: [{ type: "query", key: "page_id" }] },
  ],
};
