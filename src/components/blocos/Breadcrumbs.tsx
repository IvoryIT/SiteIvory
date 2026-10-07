import Link from "next/link";
import { Fragment } from "react";
import type { ItemBreadcrumb } from "@/lib/conteudo";
import { site } from "@/lib/site";

/** Trilha de navegação (Início » Pai » Página) com o JSON-LD BreadcrumbList. */
export function Breadcrumbs({ itens, className = "" }: { itens: ItemBreadcrumb[]; className?: string }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: itens.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.nome,
      item: `${site.url}${item.caminho}`,
    })),
  };
  return (
    <nav aria-label="Você está aqui" className={`font-sistema text-[13.6px] leading-[20.4px] text-corpo ${className}`}>
      <p id="breadcrumbs">
        {itens.map((item, i) => {
          const ultimo = i === itens.length - 1;
          return (
            <Fragment key={item.caminho}>
              {i > 0 && " » "}
              {ultimo ? (
                <span aria-current="page">{item.nome}</span>
              ) : (
                <Link href={item.caminho} className="text-vinho">
                  {item.nome}
                </Link>
              )}
            </Fragment>
          );
        })}
      </p>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </nav>
  );
}
