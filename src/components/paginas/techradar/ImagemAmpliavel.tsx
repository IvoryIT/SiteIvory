"use client";

import Image from "next/image";
import { useRef } from "react";

/**
 * Imagem que abre ampliada numa janela sobre a página (substitui o "lightbox" da galeria do
 * Elementor). Sem JavaScript, o link abre o arquivo da imagem.
 */
export function ImagemAmpliavel({ src, alt, width, height }: { src: string; alt: string; width: number; height: number }) {
  const janela = useRef<HTMLDialogElement>(null);
  return (
    <>
      <a
        href={src}
        className="block cursor-zoom-in"
        onClick={(e) => {
          e.preventDefault();
          janela.current?.showModal();
        }}
      >
        <Image src={src} alt={alt} width={width} height={height} sizes="(max-width: 1160px) 100vw, 1140px" className="h-auto w-full" />
      </a>
      <dialog
        ref={janela}
        aria-label={alt}
        className="m-auto max-h-[95vh] max-w-[95vw] cursor-zoom-out bg-transparent p-0 backdrop:bg-black/85"
        onClick={() => janela.current?.close()}
      >
        <Image src={src} alt="" width={width} height={height} sizes="95vw" className="h-auto max-h-[95vh] w-auto max-w-[95vw]" />
      </dialog>
    </>
  );
}
