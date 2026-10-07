import type { ReactNode } from "react";
import { classesCartao, fundoCartao } from "./CarreirasCartoes";
import { LinkCurriculo } from "./LinkCurriculo";

type Props = {
  /** Imagem de fundo do cartão (o botão "Envie seu currículo!" vem desenhado nela). */
  imagem: string;
  /** Texto do alerta mostrado ao clicar; o e-mail de currículos (site.emailCurriculos) é acrescentado no fim. */
  aviso: string;
  children: ReactNode;
};

/** Cartão inteiro clicável que abre o e-mail de currículos e mostra o endereço num alerta. */
export function CarreirasCurriculo({ imagem, aviso, children }: Props) {
  return (
    <LinkCurriculo aviso={aviso} className={classesCartao} style={fundoCartao(imagem)}>
      {children}
    </LinkCurriculo>
  );
}
