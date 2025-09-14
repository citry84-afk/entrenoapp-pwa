const fs = require('fs');
const path = require('path');

// SVG del logo
const logoSvg = `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="fondoAzul" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2196f3"/>
      <stop offset="100%" stop-color="#00bcd4"/>
    </linearGradient>
    <filter id="sombra">
      <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#000" flood-opacity="0.2"/>
    </filter>
  </defs>
  <rect width="512" height="512" rx="100" ry="100" fill="url(#fondoAzul)"/>
  <path d="M384 168h-36v-20a12 12 0 0 0-24 0v20h-48v-20a12 12 0 0 0-24 0v20h-48v-20a12 12 0 0 0-24 0v20h-36a12 12 0 0 0-12 12v24a12 12 0 0 0 12 12h36v20a12 12 0 0 0 24 0v-20h48v20a12 12 0 0 0 24 0v-20h48v20a12 12 0 0 0 24 0v-20h36a12 12 0 0 0 12-12v-24a12 12 0 0 0-12-12zm-128 92c-10 0-23 6-31 10-5-4-13-6-22-6-15 0-27 5-33 9-2-1-4-1-6-1-11 0-18 9-18 18 0 3 0 6 2 9-11 8-14 20-14 28 0 12 8 24 20 26 10 2 20 2 30 2 8 0 17 0 25-1 22-3 35-15 50-30 14-13 30-24 36-36 5-8 4-14 1-19-4-5-12-9-25-9z" 
        fill="#ffffff" filter="url(#sombra)"/>
</svg>`;

// Crear directorio de iconos si no existe
const iconsDir = path.join(__dirname, 'assets', 'icons');
if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
}

// Guardar el SVG actualizado
fs.writeFileSync(path.join(iconsDir, 'logo-custom.svg'), logoSvg);

console.log('✅ Logo SVG actualizado');
console.log('📝 Para generar los PNG, usa una herramienta online como:');
console.log('   - https://convertio.co/svg-png/');
console.log('   - https://cloudconvert.com/svg-to-png');
console.log('');
console.log('Tamaños necesarios:');
console.log('- 192x192px para icon-192x192.png');
console.log('- 512x512px para icon-512x512.png');
console.log('- 180x180px para apple-touch-icon.png');
console.log('- 144x144px para icon-144x144.png');
