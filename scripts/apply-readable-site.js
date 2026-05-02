/**
 * Unifica legibilidad y nav "Novedades" en HTML de la raíz del proyecto.
 * Ejecutar desde la raíz: node scripts/apply-readable-site.js
 * Luego: npm run build (sincroniza www/)
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

const SKIP_FILES = new Set([
  'app.html',
  'diagnostico-youtube.html',
  'test-youtube-api.html',
  'download-icons.html',
  'convert_svg_to_png.html',
]);

function patchMainNav(html) {
  return html.replace(/<nav class="main-navigation">[\s\S]*?<\/nav>/, (nav) => {
    if (/blog\.html#novedades/.test(nav)) return nav;

    let n = nav.replace(
      /<li><a href="\/blog\.html">Blog<\/a><\/li>/,
      '<li><a href="/blog.html#novedades">Novedades</a></li>\n                <li><a href="/blog.html">Blog</a></li>'
    );
    if (n !== nav) return n;

    n = nav.replace(
      /<a href="\/blog\.html">Blog<\/a>/,
      '<a href="/blog.html#novedades">Novedades</a>\n                <a href="/blog.html">Blog</a>'
    );
    return n;
  });
}

function insertReadableShell(html, fname) {
  if (SKIP_FILES.has(fname)) return html;
  if (html.includes('readable-shell.css')) return html;
  if (html.includes('content-pages.css')) return html;
  if (!html.includes('css/styles.css')) return html;

  const line = '    <link rel="stylesheet" href="css/readable-shell.css">\n';
  if (html.includes('css/glassmorphism.css')) {
    return html.replace(
      /(<link rel="stylesheet" href="css\/glassmorphism\.css">)/,
      `$1\n${line.trimEnd()}`
    );
  }
  return html.replace(
    /(<link rel="stylesheet" href="css\/styles\.css">)/,
    `$1\n${line.trimEnd()}`
  );
}

function main() {
  const files = fs.readdirSync(root).filter((f) => f.endsWith('.html'));
  let n = 0;
  for (const f of files) {
    if (SKIP_FILES.has(f)) continue;
    const p = path.join(root, f);
    let html = fs.readFileSync(p, 'utf8');
    const before = html;
    html = patchMainNav(html);
    html = insertReadableShell(html, f);
    if (html !== before) {
      fs.writeFileSync(p, html);
      console.log('updated:', f);
      n++;
    }
  }
  console.log(`Done. ${n} file(s) changed.`);
}

main();
