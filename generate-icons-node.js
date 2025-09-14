const fs = require('fs');
const path = require('path');

// Verificar si canvas está disponible
let Canvas;
try {
    Canvas = require('canvas');
} catch (error) {
    console.log('❌ Canvas no está disponible. Instalando...');
    console.log('Ejecuta: npm install canvas');
    process.exit(1);
}

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

// Función para crear icono PNG
function createIcon(size, filename) {
    const canvas = Canvas.createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    
    // Crear gradiente de fondo
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, '#2196f3');
    gradient.addColorStop(1, '#00bcd4');
    
    // Dibujar fondo redondeado
    ctx.fillStyle = gradient;
    const radius = (size * 100) / 512; // Proporcional al SVG original
    roundRect(ctx, 0, 0, size, size, radius);
    ctx.fill();
    
    // Dibujar el corredor con kettlebell
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    ctx.shadowBlur = (size * 4) / 512;
    ctx.shadowOffsetY = (size * 4) / 512;
    
    drawRunner(ctx, size);
    
    // Guardar como PNG
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(path.join(iconsDir, filename), buffer);
    console.log(`✅ ${filename} generado (${size}x${size}px)`);
}

// Función para dibujar el corredor
function drawRunner(ctx, size) {
    const scale = size / 512;
    const centerX = size / 2;
    const centerY = size / 2;
    
    // Dibujar figura del corredor (simplificada)
    ctx.beginPath();
    
    // Cabeza
    ctx.arc(centerX, centerY - 80 * scale, 20 * scale, 0, 2 * Math.PI);
    
    // Cuerpo
    ctx.moveTo(centerX, centerY - 60 * scale);
    ctx.lineTo(centerX, centerY + 40 * scale);
    
    // Brazos
    ctx.moveTo(centerX, centerY - 40 * scale);
    ctx.lineTo(centerX - 30 * scale, centerY - 20 * scale);
    ctx.moveTo(centerX, centerY - 40 * scale);
    ctx.lineTo(centerX + 30 * scale, centerY - 20 * scale);
    
    // Piernas
    ctx.moveTo(centerX, centerY + 40 * scale);
    ctx.lineTo(centerX - 25 * scale, centerY + 80 * scale);
    ctx.moveTo(centerX, centerY + 40 * scale);
    ctx.lineTo(centerX + 25 * scale, centerY + 80 * scale);
    
    // Kettlebell (círculo con asa)
    ctx.moveTo(centerX + 40 * scale, centerY + 20 * scale);
    ctx.arc(centerX + 40 * scale, centerY + 20 * scale, 15 * scale, 0, 2 * Math.PI);
    
    ctx.fill();
}

// Función para rectángulo redondeado
function roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
}

// Generar todos los iconos
console.log('🎨 Generando iconos PNG...');

const iconSizes = [
    { size: 192, filename: 'icon-192x192.png' },
    { size: 512, filename: 'icon-512x512.png' },
    { size: 180, filename: 'apple-touch-icon.png' },
    { size: 144, filename: 'icon-144x144.png' }
];

iconSizes.forEach(({ size, filename }) => {
    createIcon(size, filename);
});

console.log('🎉 ¡Todos los iconos generados exitosamente!');
console.log('📁 Iconos guardados en: assets/icons/');
