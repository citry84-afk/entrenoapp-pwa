/**
 * Copia los archivos de la web a www/ para Capacitor.
 * Ejecutar antes de "npx cap sync ios".
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const www = path.join(root, 'www');

const coreFiles = [
  'app.html',
  'index.html',
  'manifest.json',
  'sw.js',
  'ads.txt',
  'app-ads.txt',
  'robots.txt',
  'sitemap.xml',
  'privacy.html',
  'terms.html',
  'offline.html',
  '_redirects'
];

function mkdir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    mkdir(dest);
    for (const name of fs.readdirSync(src)) {
      copyRecursive(path.join(src, name), path.join(dest, name));
    }
  } else {
    mkdir(path.dirname(dest));
    fs.copyFileSync(src, dest);
  }
}

// Crear/actualizar www sin borrar todo el directorio: algunos archivos pueden
// estar gestionados por iCloud y una limpieza completa puede quedarse bloqueada.
mkdir(www);

// Archivos base para Capacitor. No copiamos todo el blog/SEO a la app nativa.
for (const f of coreFiles) {
  const src = path.join(root, f);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(www, f));
  }
}

// La app nativa entra por index.html y redirige a app.html. Para Capacitor
// basta con los assets que usa la app; el CSS/JS de la landing se queda en web.
for (const dir of ['assets']) {
  const srcDir = path.join(root, dir);
  if (fs.existsSync(srcDir)) {
    copyRecursive(srcDir, path.join(www, dir));
  }
}

console.log('✓ www/ actualizado para Capacitor');
