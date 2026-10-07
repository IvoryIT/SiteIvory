import Image from "next/image";
import type { ReactNode } from "react";

/**
 * Barra "COMPARTILHE" com os ícones das redes da Ivory. A margem negativa no celular e o respiro
 * menor embaixo compensam a faixa do topo do rodapé, que aqui tinha 1em a menos de espaço.
 */
export function TechRadarCompartilhe({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="fundo-ruido pt-4 max-md:-mb-4 md:pt-8 md:pb-4">
      <div className="flex items-center gap-5 lg:container-site">
        <p className="text-base leading-6 font-bold text-corpo italic">{titulo}</p>
        {children}
      </div>
    </section>
  );
}

/** Ícone de uma rede social, com link para o perfil da Ivory (abre em nova aba). */
export function TechRadarRede({ icone, nome, href }: { icone: string; nome: string; href: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" aria-label={nome}>
      <Image src={icone} alt={nome} width={32} height={32} />
    </a>
  );
}
