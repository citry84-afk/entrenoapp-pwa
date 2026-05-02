/**
 * Verificación rápida antes de deploy (Netlify).
 * Uso: npm run verify
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const PHANTOM_PUB = 'ca-pub-4129506161314540';
const ACTIVE_PUB = 'ca-pub-4837743291717475';

function die(msg) {
  console.error('❌', msg);
  process.exit(1);
}

function warn(msg) {
  console.warn('⚠️ ', msg);
}

const requiredRoot = [
  'netlify.toml',
  'sitemap.xml',
  'robots.txt',
  'ads.txt',
  'manifest.json',
];

console.log('🔍 verify-pre-deploy — EntrenoApp\n');

for (const f of requiredRoot) {
  const p = path.join(root, f);
  if (!fs.existsSync(p)) die(`Falta archivo obligatorio en la raíz: ${f}`);
}

const ads = fs.readFileSync(path.join(root, 'ads.txt'), 'utf8');
if (!ads.includes(ACTIVE_PUB.split(':')[1]) && !ads.includes('pub-4837743291717475')) {
  warn('ads.txt no parece contener el publisher activo esperado (revisa manualmente).');
}

const scanDirs = [
  path.join(root, 'js'),
  path.join(root, 'www', 'js'),
];
for (const dir of scanDirs) {
  if (!fs.existsSync(dir)) continue;
  const walk = (d) => {
    for (const name of fs.readdirSync(d)) {
      const full = path.join(d, name);
      const st = fs.statSync(full);
      if (st.isDirectory()) walk(full);
      else if (name.endsWith('.js')) {
        const c = fs.readFileSync(full, 'utf8');
        if (c.includes(PHANTOM_PUB)) {
          die(`ID fantasma ${PHANTOM_PUB} encontrado en ${path.relative(root, full)}`);
        }
      }
    }
  };
  walk(dir);
}

const htmlFiles = fs.readdirSync(root).filter((f) => f.endsWith('.html'));
const issues = [];
for (const f of htmlFiles) {
  const c = fs.readFileSync(path.join(root, f), 'utf8');
  if (!/<title[^>]*>[\s\S]*?<\/title>/i.test(c)) issues.push(`${f}: sin <title>`);
  const hasDesc =
    /<meta[^>]*name\s*=\s*["']description["'][^>]*>/i.test(c) ||
    /<meta[^>]*property\s*=\s*["']description["'][^>]*>/i.test(c);
  if (!hasDesc) issues.push(`${f}: sin meta description`);
}

if (issues.length) {
  console.warn(`\n⚠️  ${issues.length} aviso(s) en HTML de la raíz (no bloquean el deploy):\n`);
  issues.slice(0, 25).forEach((x) => warn(x));
  if (issues.length > 25) warn(`… y ${issues.length - 25} más`);
}

// Sitemap: comprobar que cada .html listado exista en la raíz
const sm = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
const locs = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
let badLoc = 0;
for (const loc of locs) {
  let u;
  try {
    u = new URL(loc);
  } catch {
    badLoc++;
    warn(`URL inválida en sitemap: ${loc}`);
    continue;
  }
  if (!u.hostname.endsWith('entrenoapp.com')) continue;
  const pathname = u.pathname;
  if (pathname === '/' || pathname === '') continue;
  if (!pathname.endsWith('.html')) continue;
  const file = pathname.replace(/^\//, '');
  const fp = path.join(root, file);
  if (!fs.existsSync(fp)) {
    badLoc++;
    warn(`Sitemap apunta a archivo inexistente: ${file}`);
  }
}

if (badLoc) die(`Sitemap: ${badLoc} problema(s) grave(s) con rutas.`);

console.log('\n✅ verify-pre-deploy OK (sin errores bloqueantes).\n');
process.exit(0);
