import { dimensoesImagem } from "@/lib/imagens";
import { ImagemAmpliavel } from "./ImagemAmpliavel";

/** Faixa branca com a imagem do radar na largura do conteúdo; clicar abre a imagem ampliada. */
export function TechRadarImagem({ src, alt }: { src: string; alt: string }) {
  const { width, height } = dimensoesImagem(src);
  return (
    <section className="bg-white px-4 py-16 md:pt-4 md:pb-8 lg:px-0 lg:py-16">
      <div className="lg:container-site">
        <ImagemAmpliavel src={src} alt={alt} width={width} height={height} />
      </div>
    </section>
  );
}
