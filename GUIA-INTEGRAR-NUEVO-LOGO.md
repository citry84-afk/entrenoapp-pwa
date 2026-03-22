# Guía: Integrar Nuevo Logo EntrenoApp

## Descripción del nuevo logo

Escudo heráldico con:
- **Microscopio** azul oscuro (izquierda)
- **Mancuerna roja** (cruzando el microscopio, placa superior agrietada)
- **ADN** (doble hélice azul debajo)
- **Texto "ENTRENOAPP"** (ENTRENO en blanco con borde azul, APP en rojo con borde blanco)
- **Icono de libro** con flechas hacia arriba (parte inferior)
- **Fondo dividido** diagonalmente (azul oscuro izquierda, blanco/gris claro derecha)
- **Líneas orbitales** en el lado azul

**Colores:** Azul oscuro (#0B1426 o similar), rojo vibrante, blanco.

---

## Archivos que necesitas generar

Coloca estos archivos en `assets/icons/`:

| Archivo | Tamaño | Uso |
|---------|--------|-----|
| `icon-192x192.png` | 192×192 px | Favicon, PWA icon pequeño |
| `icon-512x512.png` | 512×512 px | PWA icon grande, og:image, twitter:image, Schema.org logo |
| `apple-touch-icon.png` | 180×180 px | iOS home screen |
| `icon.svg` | SVG (escalable) | Favicon moderno, logo vectorial |
| `logo-custom.svg` | SVG (escalable) | Logo completo para PWA manifest |
| `favicon.ico` | 16×16, 32×32, 48×48 | Favicon legacy (opcional) |

**Recomendación:** Genera primero el SVG del logo completo, luego exporta PNGs desde ahí para mantener calidad.

---

## Dónde se usa el logo actualmente

### 1. **Favicon / Iconos** (en `<head>` de HTML)

```html
<link rel="icon" type="image/png" href="assets/icons/icon-192x192.png">
<link rel="icon" type="image/png" sizes="192x192" href="assets/icons/icon-192x192.png">
<link rel="icon" type="image/png" sizes="512x512" href="assets/icons/icon-512x512.png">
<link rel="apple-touch-icon" href="assets/icons/apple-touch-icon.png">
```

**Archivos afectados:** Todos los `.html` (index, app, blog, artículos, etc.)

### 2. **Open Graph / Twitter Cards** (meta tags)

```html
<meta property="og:image" content="https://entrenoapp.com/assets/icons/icon-512x512.png">
<meta property="twitter:image" content="https://entrenoapp.com/assets/icons/icon-512x512.png">
```

**Archivos afectados:** Todos los `.html` con og:image / twitter:image

### 3. **Schema.org Logo** (JSON-LD)

```json
"logo": {
  "@type": "ImageObject",
  "url": "https://entrenoapp.com/assets/icons/icon-512x512.png"
}
```

**Archivos afectados:** index.html, app.html, algunos artículos con Schema Organization

### 4. **PWA Manifest** (`manifest.json`)

```json
"icons": [
  {"src": "assets/icons/logo-custom.svg", "sizes": "any", "type": "image/svg+xml"},
  {"src": "assets/icons/icon-192x192.png", "sizes": "192x192"},
  {"src": "assets/icons/icon-512x512.png", "sizes": "512x512"},
  {"src": "assets/icons/apple-touch-icon.png", "sizes": "180x180"}
]
```

**Archivo:** `manifest.json`

### 5. **Nav Logo** (navegación - actualmente texto)

Actualmente usa texto: `<a href="/" class="nav-logo">💪 EntrenoApp</a>`

**Opciones:**
- **Opción A:** Mantener texto (más rápido, no requiere cambios)
- **Opción B:** Reemplazar por imagen del logo (requiere actualizar CSS y HTML)

---

## Pasos para integrar

### Paso 1: Generar archivos de imagen

1. Exporta el logo en **SVG** (vectorial, escalable)
2. Exporta **PNGs** desde el SVG:
   - 192×192 px → `icon-192x192.png`
   - 512×512 px → `icon-512x512.png`
   - 180×180 px → `apple-touch-icon.png`
3. (Opcional) Genera `favicon.ico` con múltiples tamaños (16, 32, 48 px)

### Paso 2: Colocar archivos

Coloca todos los archivos en:
```
assets/icons/
  ├── icon-192x192.png
  ├── icon-512x512.png
  ├── apple-touch-icon.png
  ├── icon.svg
  └── logo-custom.svg
```

### Paso 3: Actualizar referencias (si cambias nombres)

Si los nombres de archivo son diferentes, actualiza:
- Todos los `<link rel="icon">` en HTML
- Todos los `og:image` y `twitter:image`
- Schema.org `logo` URLs
- `manifest.json` `icons`

### Paso 4: (Opcional) Actualizar nav logo

Si quieres usar el logo en la navegación en lugar de "💪 EntrenoApp":

1. **CSS:** Añade estilos para `.nav-logo img`
2. **HTML:** Reemplaza `<a class="nav-logo">💪 EntrenoApp</a>` por `<a class="nav-logo"><img src="assets/icons/logo-custom.svg" alt="EntrenoApp"></a>`

---

## Verificación

Tras colocar los archivos y hacer deploy:

1. **Favicon:** Abre `https://entrenoapp.com` y verifica que el favicon aparece en la pestaña
2. **PWA:** Instala la app en móvil y verifica el icono en home screen
3. **Open Graph:** Comparte una URL en Facebook/Twitter y verifica la imagen
4. **Schema:** Usa [Google Rich Results Test](https://search.google.com/test/rich-results) para verificar el logo en Schema.org

---

## Notas

- **Formato recomendado:** SVG para escalabilidad, PNG para compatibilidad
- **Fondo:** Si el logo tiene fondo transparente, asegúrate de que se vea bien sobre fondos claros y oscuros
- **Tamaño mínimo:** 192×192 px es el mínimo para PWA; 512×512 es ideal para redes sociales
- **Apple Touch Icon:** 180×180 px es el estándar actual de iOS

---

*Última actualización: enero 2026*
