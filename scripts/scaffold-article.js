#!/usr/bin/env node
/**
 * Genera un HTML nuevo desde templates/seo-article.html
 *
 * Uso:
 *   node scripts/scaffold-article.js mi-articulo-2026 "Título página" "Meta description de ~150 caracteres."
 *
 * El archivo se crea en la raíz como mi-articulo-2026.html si no existe.
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const args = process.argv.slice(2);

if (args.length < 3) {
  console.error('Uso: node scripts/scaffold-article.js <nombre-archivo> "Título" "Meta description"');
  console.error('Ejemplo: node scripts/scaffold-article.js fuerza-en-casa-2026 "Fuerza en casa 2026" "Guía práctica para ganar fuerza en casa con poco equipo."');
  process.exit(1);
}

let fileBase = args[0].replace(/\.html$/i, '');
const title = args[1];
const metaDesc = args[2];
const fileName = `${fileBase}.html`;
const canonicalPath = `/${fileName}`;

const templatePath = path.join(root, 'templates', 'seo-article.html');
const outPath = path.join(root, fileName);

if (fs.existsSync(outPath)) {
  console.error(`Ya existe: ${fileName}`);
  process.exit(1);
}

const today = new Date().toISOString().slice(0, 10);
const faqQ1 = '¿Para quién es esta guía?';
const faqA1 = 'Para personas que buscan entrenar de forma segura y progresiva, con explicaciones claras y sin necesidad de equipo caro.';
const faqQ2 = '¿Necesito experiencia previa?';
const faqA2 = 'No es obligatorio; adapta la intensidad y prioriza la técnica correcta desde el primer día.';

let tpl = fs.readFileSync(templatePath, 'utf8');

const lead = `Esta guía sobre <strong>${title.replace(/<[^>]+>/g, '')}</strong> está en borrador: amplía cada sección con tu experiencia y datos útiles para el lector.`;

const map = {
  __META_DESCRIPTION__: metaDesc,
  __PAGE_TITLE__: title,
  __CANONICAL_PATH__: canonicalPath,
  __OG_TITLE__: title,
  __OG_DESCRIPTION__: metaDesc,
  __ARTICLE_HEADLINE__: title,
  __ARTICLE_DESC__: metaDesc,
  __DATE_ISO__: today,
  __H1_TEXT__: title,
  __LEAD_PARAGRAPH__: lead,
  __FAQ_Q1__: faqQ1,
  __FAQ_A1__: faqA1,
  __FAQ_Q2__: faqQ2,
  __FAQ_A2__: faqA2,
};

for (const [k, v] of Object.entries(map)) {
  tpl = tpl.split(k).join(v);
}

fs.writeFileSync(outPath, tpl, 'utf8');
console.log(`✓ Creado ${fileName}`);
console.log('  Siguiente: edita contenido, añade URL al sitemap.xml y netlify.toml si usas URL sin .html, luego npm run verify');
