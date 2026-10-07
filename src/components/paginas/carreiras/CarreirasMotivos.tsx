import type { ReactNode } from "react";

/** Título de seção do /carreiras/ ("Por que escolher a Ivory?", "Benefícios", "Nossas frentes de…"). */
export function TituloCarreiras({ children, centralizarNoCelular }: { children: ReactNode; centralizarNoCelular?: boolean }) {
  return (
    <h2 className={`mb-[0.9rem] text-[2em] leading-normal font-medium text-corpo italic ${centralizarNoCelular ? "max-md:text-center" : ""}`}>
      {children}
    </h2>
  );
}

/** "Por que escolher a Ivory?": título e colunas separadas por fios (uma embaixo da outra no tablet e no celular). */
export function CarreirasMotivos({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="fundo-ruido px-4 pt-12 md:pt-4 md:pb-8 lg:px-0 lg:py-4">
      <div className="flex flex-col gap-8 md:gap-4 lg:container-site">
        <TituloCarreiras>{titulo}</TituloCarreiras>
        <div className="flex flex-col gap-5 lg:flex-row">{children}</div>
      </div>
    </section>
  );
}

/** Um motivo: título em azul e o texto logo abaixo. */
export function CarreirasMotivo({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col justify-center gap-5 border-b-2 border-areia px-4 pb-4 text-texto last:border-b-0 lg:min-h-[14em] lg:border-r-2 lg:border-b-0 lg:p-4 lg:last:border-r-0">
      <p className="text-[1.2em] leading-normal font-bold text-azul italic">{titulo}</p>
      <div className="text-base leading-normal md:text-[1.2em] md:[&_p]:mb-[0.9rem]">{children}</div>
    </div>
  );
}
