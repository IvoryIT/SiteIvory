// Componentes MDX exclusivos da página "blog" (família "pagina").
// Os nomes levam o prefixo "Blog" porque todas as páginas da família dividem a mesma lista.
import { BlogIntroducao } from "./BlogIntroducao";
import { BlogListagem } from "./BlogListagem";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const componentes: Record<string, import("react").ComponentType<any>> = {
  BlogIntroducao,
  BlogListagem,
};
