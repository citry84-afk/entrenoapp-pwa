# ✅ Checklist Final: Nuevo Logo EntrenoApp

## 📋 Estado actual

**Referencias verificadas:** ✅ 191 referencias a iconos en 56 archivos  
**Rutas consistentes:** ✅ Todas apuntan a `assets/icons/`  
**Manifest.json:** ✅ Configurado correctamente  
**Schema.org:** ✅ Logo URLs correctas  

---

## 🎯 Archivos que necesitas generar

Coloca estos archivos en `assets/icons/` (sobrescribe los existentes):

| Archivo | Tamaño | Estado | Uso |
|---------|--------|--------|-----|
| `icon-192x192.png` | 192×192 px | ⏳ Pendiente | Favicon, PWA pequeño |
| `icon-512x512.png` | 512×512 px | ⏳ Pendiente | og:image, twitter:image, Schema.org |
| `apple-touch-icon.png` | 180×180 px | ⏳ Pendiente | iOS home screen |
| `icon.svg` | SVG escalable | ⏳ Pendiente | Favicon moderno |
| `logo-custom.svg` | SVG completo | ⏳ Pendiente | PWA manifest |
| `icon-144x144.png` | 144×144 px | ⏳ Pendiente | Usado en manifest.json |

**Nota:** Si usas los mismos nombres de archivo, no necesitas cambiar código. Solo reemplaza los archivos.

---

## ✅ Lo que ya está hecho (en el código)

### 1. Referencias en HTML (56 archivos)
- ✅ `<link rel="icon">` → `assets/icons/icon-192x192.png`
- ✅ `<link rel="apple-touch-icon">` → `assets/icons/apple-touch-icon.png`
- ✅ `og:image` y `twitter:image` → `assets/icons/icon-512x512.png`

### 2. Schema.org Logo
- ✅ `index.html`, `app.html`, artículos → `https://entrenoapp.com/assets/icons/icon-512x512.png`

### 3. PWA Manifest
- ✅ `manifest.json` → `logo-custom.svg`, `icon-192x192.png`, `icon-512x512.png`, `apple-touch-icon.png`

### 4. Nav Logo (actualmente texto)
- ✅ Usa texto "💪 EntrenoApp" o "🏃‍♂️ EntrenoApp"
- ⏳ **Opcional:** Si quieres usar imagen del logo en nav, avísame y lo cambio

---

## 🚀 Pasos para ti

### Paso 1: Generar archivos
Exporta el nuevo logo desde tu diseño en:
- PNG: 192×192, 512×512, 180×180 (y 144×144 si quieres)
- SVG: versión escalable

### Paso 2: Reemplazar archivos
Copia los nuevos archivos a `assets/icons/` con los mismos nombres.

### Paso 3: Deploy
Haz commit y push → Netlify desplegará automáticamente.

### Paso 4: Verificar
- [ ] Favicon aparece en `https://entrenoapp.com`
- [ ] og:image funciona (comparte una URL en Facebook/Twitter)
- [ ] PWA icon aparece al instalar en móvil
- [ ] Schema.org logo verificado en [Rich Results Test](https://search.google.com/test/rich-results)

---

## 📝 Archivos que referencian el logo (no necesitas cambiarlos)

Si usas los mismos nombres de archivo, estos archivos ya están correctos:

- **56 archivos HTML** con `<link rel="icon">` y meta tags
- **`manifest.json`** con icons array
- **Schema.org** en index.html, app.html, artículos

---

## 🎨 (Opcional) Actualizar colores del sitio

El nuevo logo usa:
- **Azul oscuro:** #0B1426 (fondo, microscopio, ADN)
- **Rojo vibrante:** #FF1744 o #F5576C (mancuerna, "APP")
- **Blanco:** #FFFFFF (fondo derecha, "ENTRENO")

El sitio actual usa:
- `theme-color: #00D4FF` (azul claro)
- Gradientes `#667eea` → `#764ba2` (azul-púrpura)

**Si quieres actualizar los colores del sitio** para que coincidan con el nuevo logo, avísame y lo hago.

---

## 📚 Documentación relacionada

- **Guía completa:** `GUIA-INTEGRAR-NUEVO-LOGO.md`
- **Resumen ejecutivo:** `ACTUALIZAR-LOGO-RESUMEN.md`

---

*Última actualización: enero 2026*
