"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";

export type SlideCarrossel = { src: string; alt: string; href: string; largura: number; altura: number };

/** Cópias de cada ponta para o giro infinito (o máximo de slides visíveis ao mesmo tempo). */
const COPIAS = 4;
const INTERVALO = 5000;
const ARRASTE_MINIMO = 40;

/**
 * Carrossel de imagens com giro infinito, troca automática a cada 5s (pausa com o mouse em cima,
 * para depois que o visitante interage e não roda com "reduzir movimento"), arraste no toque e
 * bolinhas de navegação. Reproduz o "Carrossel de imagens" do Elementor (Swiper): 4 slides no
 * computador, 3 no tablet e 1 no celular, 20px entre slides + o espaço extra do CSS do site antigo.
 * A geometria vem de variáveis CSS por tamanho de tela, então o primeiro desenho (antes do JS) já
 * sai na posição certa.
 */
export function InicioCarrosselCliente({ itens, rotulo }: { itens: SlideCarrossel[]; rotulo: string }) {
  const total = itens.length;
  const lista = [...itens.slice(-COPIAS), ...itens, ...itens.slice(0, COPIAS)];
  const [pos, setPos] = useState(COPIAS);
  const [animar, setAnimar] = useState(true);
  const [arraste, setArraste] = useState(0);
  const [automatico, setAutomatico] = useState(true);
  const [pausado, setPausado] = useState(false);
  const inicio = useRef<{ x: number; y: number } | null>(null);
  const arrastou = useRef(false);
  // Deslocamento do arraste também num ref: o pointerup pode chegar antes de o React redesenhar.
  const deslocamento = useRef(0);

  const ir = useCallback((destino: number) => {
    setAnimar(true);
    setPos(destino);
  }, []);

  // Troca automática.
  useEffect(() => {
    if (!automatico || pausado) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setInterval(() => ir(pos + 1), INTERVALO);
    return () => window.clearInterval(t);
  }, [automatico, pausado, pos, ir]);

  // Ao terminar a transição numa cópia, salta (sem animação) para o slide real equivalente.
  function aoTerminar() {
    if (pos >= COPIAS + total) {
      setAnimar(false);
      setPos(pos - total);
    } else if (pos < COPIAS) {
      setAnimar(false);
      setPos(pos + total);
    }
  }
  useEffect(() => {
    if (animar) return;
    const r = requestAnimationFrame(() => requestAnimationFrame(() => setAnimar(true)));
    return () => cancelAnimationFrame(r);
  }, [animar]);

  function interagiu() {
    setAutomatico(false);
  }

  function aoPressionar(e: PointerEvent) {
    inicio.current = { x: e.clientX, y: e.clientY };
    arrastou.current = false;
    deslocamento.current = 0;
  }
  function aoMover(e: PointerEvent) {
    if (!inicio.current) return;
    const dx = e.clientX - inicio.current.x;
    if (!arrastou.current && Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(e.clientY - inicio.current.y)) {
      arrastou.current = true;
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    }
    if (arrastou.current) {
      deslocamento.current = dx;
      setArraste(dx);
    }
  }
  function aoSoltar() {
    if (arrastou.current) {
      interagiu();
      if (deslocamento.current <= -ARRASTE_MINIMO) ir(pos + 1);
      else if (deslocamento.current >= ARRASTE_MINIMO) ir(pos - 1);
    }
    inicio.current = null;
    deslocamento.current = 0;
    setArraste(0);
  }

  const atual = (((pos - COPIAS) % total) + total) % total;
  const estiloTrilho = {
    "--pos": pos,
    transform: `translateX(calc(var(--recuo) - var(--pos) * ((100% - (var(--n) - 1) * 20px) / var(--n) + var(--espaco)) + ${arraste}px))`,
    transition: animar && !arraste ? "transform 500ms ease" : "none",
  } as CSSProperties;

  return (
    <div
      role="region"
      aria-roledescription="carrossel"
      aria-label={rotulo}
      className="[--espaco:36px] [--n:4] [--recuo:64px] max-lg:[--espaco:32.8px] max-lg:[--n:3] max-lg:[--recuo:38.4px] max-md:[--espaco:20px] max-md:[--n:1] max-md:[--recuo:0px]"
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
    >
      <div className="overflow-hidden">
        <div
          className="flex touch-pan-y gap-[var(--espaco)] select-none"
          style={estiloTrilho}
          onTransitionEnd={aoTerminar}
          onPointerDown={aoPressionar}
          onPointerMove={aoMover}
          onPointerUp={aoSoltar}
          onPointerCancel={aoSoltar}
          onClickCapture={(e) => {
            if (arrastou.current) e.preventDefault();
          }}
        >
          {lista.map((s, i) => {
            const real = i >= COPIAS && i < COPIAS + total;
            return (
              <div
                key={i}
                className="flex shrink-0 basis-[calc((100%_-_(var(--n)_-_1)_*_20px)_/_var(--n))] justify-center"
                aria-hidden={!real || undefined}
                role="group"
                aria-roledescription="slide"
                aria-label={real ? `${i - COPIAS + 1} de ${total}` : undefined}
              >
                <Link href={s.href} tabIndex={real ? undefined : -1} draggable={false} className="block w-60 min-w-60">
                  <Image src={s.src} alt={s.alt} width={s.largura} height={s.altura} sizes="240px" draggable={false} className="block h-auto w-60" />
                </Link>
              </div>
            );
          })}
        </div>
      </div>
      <div className="mt-[13px] flex h-[23px] justify-center gap-[2px] pl-[10px]">
        {itens.map((s, i) => (
          <button
            key={s.src}
            type="button"
            aria-label={`Ir para o slide ${i + 1}`}
            aria-current={i === atual || undefined}
            onClick={() => {
              interagiu();
              ir(COPIAS + i);
            }}
            className={`size-4 rounded-full border border-azul ${i === atual ? "bg-transparent" : "bg-azul"}`}
          />
        ))}
      </div>
    </div>
  );
}
