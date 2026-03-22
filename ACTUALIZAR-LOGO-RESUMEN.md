# Actualizar Logo: Resumen Ejecutivo

## ✅ Lo que debes hacer

### 1. Generar archivos de imagen (desde tu diseño)

Exporta el nuevo logo en estos formatos y colócalos en `assets/icons/`:

- `icon-192x192.png` (192×192 px)
- `icon-512x512.png` (512×512 px)
- `apple-touch-icon.png` (180×180 px)
- `icon.svg` (SVG escalable)
- `logo-custom.svg` (SVG completo)

### 2. Reemplazar archivos

Simplemente **sobrescribe** los archivos existentes en `assets/icons/` con los nuevos. Los nombres deben ser exactamente iguales para que no haya que cambiar código.

### 3. (Opcional) Actualizar nav logo

Si quieres usar el logo en la navegación en lugar de "💪 EntrenoApp", avísame y lo cambio en todos los HTML.

---

## 📋 Archivos que referencian el logo (ya configurados)

No necesitas cambiar nada en estos archivos si usas los mismos nombres de archivo. Solo reemplaza las imágenes:

### Iconos / Favicon
- Todos los `.html` tienen `<link rel="icon">` apuntando a `assets/icons/icon-192x192.png`
- Todos los `.html` tienen `<link rel="apple-touch-icon">` apuntando a `assets/icons/apple-touch-icon.png`

### Open Graph / Twitter
- Todos los `.html` con `og:image` y `twitter:image` apuntan a `assets/icons/icon-512x512.png`

### Schema.org
- `index.html`, `app.html`, algunos artículos tienen `"logo": {"url": "https://entrenoapp.com/assets/icons/icon-512x512.png"}`

### PWA Manifest
- `manifest.json` referencia `logo-custom.svg`, `icon-192x192.png`, `icon-512x512.png`, `apple-touch-icon.png`

---

## 🎨 Colores del nuevo logo (para referencia)

Según la descripción:
- **Azul oscuro:** #0B1426 (o similar) - fondo izquierda, microscopio, ADN
- **Rojo vibrante:** #FF1744 o #F5576C (o similar) - mancuerna, texto "APP"
- **Blanco:** #FFFFFF - fondo derecha, texto "ENTRENO", bordes

**Nota:** Si quieres actualizar `theme-color` en HTML o colores del CSS para que coincidan con el nuevo logo, avísame.

---

## ✅ Verificación tras actualizar

1. **Favicon:** Abre `https://entrenoapp.com` → verifica icono en pestaña
2. **PWA:** Instala en móvil → verifica icono en home screen
3. **Redes sociales:** Comparte una URL → verifica imagen en preview
4. **Schema:** Usa [Rich Results Test](https://search.google.com/test/rich-results) → verifica logo

---

**Guía completa:** Ver `GUIA-INTEGRAR-NUEVO-LOGO.md` para detalles técnicos.

*Última actualización: enero 2026*
