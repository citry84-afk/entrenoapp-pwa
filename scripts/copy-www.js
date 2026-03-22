/**
 * Copia los archivos de la web a www/ para Capacitor.
 * Ejecutar antes de "npx cap sync ios".
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const www = path.join(root, 'www');

const skipHtml = [
  'diagnostico-youtube.html',
  'test-youtube-api.html',
  'download-icons.html',
  'convert_svg_to_png.html'
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

// Limpiar y crear www
if (fs.existsSync(www)) {
  fs.rmSync(www, { recursive: true });
}
mkdir(www);

// HTML
const files = fs.readdirSync(root);
for (const f of files) {
  if (f.endsWith('.html') && !skipHtml.includes(f)) {
    fs.copyFileSync(path.join(root, f), path.join(www, f));
  }
}

// manifest.json
if (fs.existsSync(path.join(root, 'manifest.json'))) {
  fs.copyFileSync(path.join(root, 'manifest.json'), path.join(www, 'manifest.json'));
}

// Carpetas
for (const dir of ['css', 'js', 'assets']) {
  const srcDir = path.join(root, dir);
  if (fs.existsSync(srcDir)) {
    copyRecursive(srcDir, path.join(www, dir));
  }
}

console.log('✓ www/ actualizado para Capacitor');
