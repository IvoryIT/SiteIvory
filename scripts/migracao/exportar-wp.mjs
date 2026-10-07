// Exporta do banco do WordPress local (Docker do projeto "Site Ivory") tudo o que a migração
// precisa, num único JSON. Somente leitura. Rode de novo antes da virada para pegar as últimas
// edições feitas no WordPress.
//
// Uso: node scripts/migracao/exportar-wp.mjs [saida.json]
// Requer: container `siteivory-db-1` no ar (docker compose up -d na pasta do WordPress).
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const saida = process.argv[2] || ".tmp/wp-export.json";
const CONTAINER = process.env.WP_DB_CONTAINER || "siteivory-db-1";

function consulta(sql) {
  const bruto = execFileSync(
    "docker",
    ["exec", CONTAINER, "mysql", "--default-character-set=utf8mb4", "-uwp", "-pwp_local", "wordpress", "-N", "-B", "-r", "-e", sql],
    { encoding: "utf8", maxBuffer: 512 * 1024 * 1024, stdio: ["ignore", "pipe", "ignore"] },
  );
  return bruto
    .split("\n")
    .filter((l) => l.trim())
    .map((l) => JSON.parse(l));
}

const meta = (chave) => `(SELECT meta_value FROM wp_postmeta m WHERE m.post_id = p.ID AND m.meta_key = '${chave}' LIMIT 1)`;

// Páginas publicadas: conteúdo do Elementor, SEO do Yoast e Markdown para agentes.
// Dados pessoais (usuários, envios de formulário, logs) ficam de fora por regra.
const paginas = consulta(`
  SELECT JSON_OBJECT(
    'id', p.ID, 'slug', p.post_name, 'titulo', p.post_title, 'pai', p.post_parent,
    'status', p.post_status, 'data', p.post_date, 'modificado', p.post_modified,
    'ordem', p.menu_order, 'conteudoWp', p.post_content,
    'permalink', (SELECT permalink FROM wp_yoast_indexable i WHERE i.object_id = p.ID AND i.object_type = 'post' LIMIT 1),
    'seoTitulo', ${meta("_yoast_wpseo_title")},
    'seoDescricao', ${meta("_yoast_wpseo_metadesc")},
    'seoFocoKw', ${meta("_yoast_wpseo_focuskw")},
    'seoCanonico', ${meta("_yoast_wpseo_canonical")},
    'seoNoindex', ${meta("_yoast_wpseo_meta-robots-noindex")},
    'markdownAgentes', ${meta("_agent_markdown")},
    'elementor', ${meta("_elementor_data")},
    'template', ${meta("_wp_page_template")}
  ) FROM wp_posts p
  WHERE p.post_type = 'page' AND p.post_status = 'publish'
  ORDER BY p.ID`);

for (const p of paginas) {
  p.elementor = p.elementor ? JSON.parse(p.elementor) : null;
}

// Templates do Theme Builder e blocos reutilizáveis.
const templates = consulta(`
  SELECT JSON_OBJECT(
    'id', p.ID, 'titulo', p.post_title, 'tipo', ${meta("_elementor_template_type")},
    'condicoes', ${meta("_elementor_conditions")}, 'elementor', ${meta("_elementor_data")}
  ) FROM wp_posts p
  WHERE p.post_type = 'elementor_library' AND p.post_status = 'publish'`);
for (const t of templates) t.elementor = t.elementor ? JSON.parse(t.elementor) : null;

// Biblioteca de mídia (só o necessário para resolver imagens e textos alternativos).
const midia = consulta(`
  SELECT JSON_OBJECT('id', p.ID, 'arquivo', ${meta("_wp_attached_file")}, 'alt', ${meta("_wp_attachment_image_alt")},
    'titulo', p.post_title, 'mime', p.post_mime_type)
  FROM wp_posts p WHERE p.post_type = 'attachment'`);

// Menu principal.
const menu = consulta(`
  SELECT JSON_OBJECT('id', p.ID, 'titulo', p.post_title, 'ordem', p.menu_order,
    'pai', ${meta("_menu_item_menu_item_parent")}, 'tipo', ${meta("_menu_item_type")},
    'objeto', ${meta("_menu_item_object")}, 'objetoId', ${meta("_menu_item_object_id")},
    'url', ${meta("_menu_item_url")}, 'classes', ${meta("_menu_item_classes")})
  FROM wp_posts p
  JOIN wp_term_relationships tr ON tr.object_id = p.ID
  JOIN wp_term_taxonomy tt ON tt.term_taxonomy_id = tr.term_taxonomy_id AND tt.taxonomy = 'nav_menu'
  WHERE p.post_type = 'nav_menu_item' AND p.post_status = 'publish'
  ORDER BY p.menu_order`);

// Estrutura dos formulários (campos e textos; sem envios).
const formularios = consulta(`
  SELECT JSON_OBJECT('id', ID, 'titulo', post_title, 'conteudo', post_content)
  FROM wp_posts WHERE post_type = 'wpforms' AND post_status = 'publish'`);
for (const f of formularios) {
  const d = JSON.parse(f.conteudo);
  f.campos = Object.values(d.fields || {}).map((c) => ({ id: c.id, tipo: c.type, rotulo: c.label, obrigatorio: c.required === "1", placeholder: c.placeholder || "" }));
  f.botao = d.settings?.submit_text;
  f.confirmacao = Object.values(d.settings?.confirmations || {})[0]?.message;
  delete f.conteudo;
}

// Snippets ativos do Code Snippets (código que vira componente).
const snippets = consulta(`SELECT JSON_OBJECT('id', id, 'nome', name, 'escopo', scope, 'codigo', code) FROM wp_snippets WHERE active = 1`);

fs.mkdirSync(path.dirname(saida), { recursive: true });
fs.writeFileSync(saida, JSON.stringify({ exportadoEm: new Date().toISOString(), paginas, templates, midia, menu, formularios, snippets }, null, 1));
console.log(`${paginas.length} páginas, ${templates.length} templates, ${midia.length} mídias, ${menu.length} itens de menu -> ${saida}`);
