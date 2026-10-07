// robots.txt igual ao que o Yoast gerava, incluindo a declaração Content-Signal
// (o site autoriza busca, uso como contexto de IA e treinamento).
import { site } from "@/lib/site";

export function GET() {
  const corpo = ["User-agent: *", "Disallow:", "", "Content-Signal: ai-train=yes, search=yes, ai-input=yes", "", `Sitemap: ${site.url}/sitemap.xml`, ""].join("\n");
  return new Response(corpo, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
