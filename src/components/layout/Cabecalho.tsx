"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ehExterno, menuPrincipal, site, type ItemMenu } from "@/lib/site";

function LinkMenu({ item, className, onClick }: { item: ItemMenu; className: string; onClick?: () => void }) {
  if (ehExterno(item.href)) {
    return (
      <a href={item.href} target="_blank" rel="noopener noreferrer" className={className} onClick={onClick}>
        {item.rotulo}
      </a>
    );
  }
  return (
    <Link href={item.href} className={className} onClick={onClick}>
      {item.rotulo}
    </Link>
  );
}

/**
 * Cabeçalho fixo sobre a capa. Depois de 50px de rolagem ganha o degradê creme
 * (equivalente ao script "Estilizador cabecalho" do WordPress).
 */
export function Cabecalho() {
  const [rolou, setRolou] = useState(false);
  const [aberto, setAberto] = useState(false);
  const caminho = usePathname();

  useEffect(() => {
    const analisar = () => setRolou(window.scrollY > 50);
    analisar();
    window.addEventListener("scroll", analisar, { passive: true });
    return () => window.removeEventListener("scroll", analisar);
  }, []);

  // Como no menu do Elementor, só o item da página exata fica sublinhado.
  const ativo = (href: string) => caminho === href;

  return (
    <header
      id="my-header"
      className={`fixed inset-x-0 top-0 z-50 transition-opacity duration-300 ${
        rolou ? "bg-[linear-gradient(to_bottom,#fdf5e1_0%,#fdf5e1_70%,#fdf5e100_100%)]" : "bg-transparent"
      }`}
    >
      <div className="flex items-start justify-between px-4 pt-4 pb-12 lg:container-site lg:items-center lg:px-0 lg:pt-8 lg:pb-16">
        <Link href="/" aria-label="Ivory — página inicial" className="mt-2 lg:mt-0">
          <Image src={site.logo} alt="Ivory" width={96} height={20} priority className="h-auto w-[96px]" />
        </Link>

        {/* Menu desktop (a partir de 1025px). */}
        <nav aria-label="Principal" className="hidden lg:block">
          <ul className="flex items-center">
            {menuPrincipal.map((item) =>
              item.destaque ? (
                <li key={item.rotulo}>
                  <LinkMenu
                    item={item}
                    className="block rounded-[18px] border-[3px] border-azul px-5 py-[13px] text-[20px] leading-5 font-bold text-azul italic transition-colors hover:bg-azul hover:text-white"
                  />
                </li>
              ) : (
                <li key={item.rotulo} className="group relative">
                  <LinkMenu
                    item={item}
                    className={`relative block px-[18px] py-[13px] text-[18px] leading-5 text-azul italic after:absolute after:inset-x-0 after:bottom-0 after:h-[3px] after:bg-azul after:opacity-0 after:transition-opacity hover:after:opacity-100 ${
                      ativo(item.href) ? "after:opacity-100" : ""
                    }`}
                  />
                  {item.filhos && (
                    <>
                      <span aria-hidden className="pointer-events-none absolute right-1 bottom-[14px] text-[0.6em] text-azul">
                        ◢
                      </span>
                      <ul className="invisible absolute top-full left-0 z-10 min-w-[200px] bg-azul opacity-0 transition-opacity group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                        {item.filhos.map((f) => (
                          <li key={f.rotulo}>
                            <LinkMenu item={f} className="block p-[13px] text-[13px] leading-5 text-white hover:bg-white/10" />
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </li>
              ),
            )}
          </ul>
        </nav>

        {/* Botão do menu mobile (até 1024px). */}
        <button
          type="button"
          aria-label={aberto ? "Fechar menu" : "Abrir menu"}
          aria-expanded={aberto}
          aria-controls="menu-mobile"
          onClick={() => setAberto((v) => !v)}
          className="flex h-[33px] w-[33px] items-center justify-center rounded-[3px] bg-black/5 text-[#33373d] lg:hidden"
        >
          {aberto ? (
            <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
              <path d="M5 5l14 14M19 5L5 19" stroke="currentColor" strokeWidth="2.5" />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
              <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2.5" />
            </svg>
          )}
        </button>
      </div>

      {aberto && (
        <nav id="menu-mobile" aria-label="Principal" className="absolute inset-x-0 top-[59px] bg-azul lg:hidden">
          <ul>
            {menuPrincipal.map((item) => (
              <li key={item.rotulo}>
                <LinkMenu
                  item={item}
                  onClick={() => setAberto(false)}
                  className={
                    item.destaque
                      ? "m-2 block rounded-[18px] border-[3px] border-white px-5 py-[10px] text-center text-[20px] leading-5 font-bold text-white italic"
                      : "block px-[18px] py-[10px] text-[18px] leading-5 text-white italic"
                  }
                />
                {item.filhos && (
                  <ul>
                    {item.filhos.map((f) => (
                      <li key={f.rotulo}>
                        <LinkMenu item={f} onClick={() => setAberto(false)} className="block py-2 pr-[18px] pl-9 text-[15px] leading-5 text-white" />
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
