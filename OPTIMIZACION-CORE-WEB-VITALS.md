# ⚡ Optimización Core Web Vitals - EntrenoApp

## 📊 Objetivos Core Web Vitals

### Métricas Objetivo:
- **LCP (Largest Contentful Paint):** < 2.5s ✅
- **FID (First Input Delay):** < 100ms ✅
- **CLS (Cumulative Layout Shift):** < 0.1 ✅

---

## ✅ Optimizaciones Implementadas

### 1. Preload de Recursos Críticos
```html
<!-- Añadido en index.html -->
<link rel="preload" href="css/styles.css" as="style">
<link rel="preload" href="css/glassmorphism.css" as="style">
<link rel="preload" href="js/app.js" as="script">
```

**Beneficio:** Los recursos críticos se cargan antes, mejorando el LCP.

---

### 2. Optimización de CSS

#### A. Minificar CSS
- [ ] Minificar `styles.css`
- [ ] Minificar `glassmorphism.css`
- [ ] Minificar `content-pages.css`

#### B. Defer CSS no crítico
```html
<link rel="stylesheet" href="css/styles.css" media="print" onload="this.media='all'">
<noscript><link rel="stylesheet" href="css/styles.css"></noscript>
```

#### C. Inline CSS crítico
- [ ] Extraer CSS crítico (above-the-fold) e inlinarlo en `<head>`

---

### 3. Optimización de JavaScript

#### A. Defer/Async Scripts
```html
<!-- Scripts no críticos -->
<script defer src="js/app.js"></script>
<script async src="js/components/youtube-gallery.js"></script>
```

#### B. Minificar JavaScript
- [ ] Minificar todos los archivos JS
- [ ] Usar tree-shaking para eliminar código no usado

#### C. Code Splitting
- [ ] Cargar componentes solo cuando se necesiten
- [ ] Lazy load de módulos no críticos

---

### 4. Optimización de Imágenes

#### A. Lazy Loading
```html
<img src="image.jpg" loading="lazy" alt="Descripción">
```

#### B. Formatos Modernos
- [ ] Convertir imágenes a WebP
- [ ] Usar `<picture>` con fallback
```html
<picture>
  <source srcset="image.webp" type="image/webp">
  <img src="image.jpg" alt="Descripción">
</picture>
```

#### C. Tamaños Responsivos
```html
<img srcset="image-320w.jpg 320w,
             image-640w.jpg 640w,
             image-1024w.jpg 1024w"
     sizes="(max-width: 320px) 280px,
            (max-width: 640px) 600px,
            1024px"
     src="image-1024w.jpg"
     alt="Descripción">
```

#### D. Alt Text
- [x] Todas las imágenes tienen alt text descriptivo
- [x] Alt text incluye keywords relevantes cuando es apropiado

---

### 5. Optimización de Fuentes

#### A. Font Display
```css
@font-face {
  font-family: 'CustomFont';
  src: url('font.woff2') format('woff2');
  font-display: swap; /* o 'optional' para fuentes no críticas */
}
```

#### B. Preload de Fuentes Críticas
```html
<link rel="preload" href="fonts/font.woff2" as="font" type="font/woff2" crossorigin>
```

#### C. Subset de Fuentes
- [ ] Usar solo caracteres necesarios (español: a-z, A-Z, 0-9, acentos)

---

### 6. Reducir CLS (Cumulative Layout Shift)

#### A. Dimensiones Explícitas
```html
<img src="image.jpg" width="800" height="600" alt="Descripción">
```

#### B. Reservar Espacio para Anuncios
```html
<div style="min-height: 250px;">
  <!-- Ad container -->
</div>
```

#### C. Evitar Insertar Contenido Dinámico Arriba
- [ ] No insertar contenido dinámico en la parte superior de la página
- [ ] Usar skeleton loaders para contenido que se carga dinámicamente

---

### 7. Optimización de Red

#### A. HTTP/2 Server Push
- [ ] Configurar en Netlify (si está disponible)

#### B. CDN
- [x] Netlify CDN ya está activo

#### C. Compresión
- [x] Gzip/Brotli activado en Netlify

---

### 8. Service Worker (PWA)

#### A. Cache Strategy
- [x] Network First para HTML/JS
- [x] Cache First para assets estáticos

#### B. Precache de Recursos Críticos
- [x] Implementado en `sw.js`

---

## 🔧 Comandos para Optimizar

### Minificar CSS
```bash
# Usar herramienta online o npm package
npx clean-css-cli -o css/styles.min.css css/styles.css
```

### Minificar JavaScript
```bash
# Usar terser
npx terser js/app.js -o js/app.min.js -c -m
```

### Convertir Imágenes a WebP
```bash
# Usar cwebp (ImageMagick)
cwebp -q 80 image.jpg -o image.webp
```

---

## 📈 Verificación

### Herramientas:
1. **PageSpeed Insights:** https://pagespeed.web.dev/
2. **Lighthouse (Chrome DevTools):** F12 → Lighthouse
3. **WebPageTest:** https://www.webpagetest.org/
4. **Chrome User Experience Report:** Google Search Console

### Checklist de Verificación:
- [ ] LCP < 2.5s
- [ ] FID < 100ms
- [ ] CLS < 0.1
- [ ] TTI (Time to Interactive) < 3.5s
- [ ] TBT (Total Blocking Time) < 200ms
- [ ] Speed Index < 3.4s

---

## 🎯 Próximos Pasos

1. **Inmediato:**
   - [ ] Minificar CSS y JS
   - [ ] Añadir lazy loading a todas las imágenes
   - [ ] Verificar con PageSpeed Insights

2. **Corto Plazo:**
   - [ ] Convertir imágenes a WebP
   - [ ] Implementar code splitting
   - [ ] Optimizar fuentes

3. **Medio Plazo:**
   - [ ] Inline CSS crítico
   - [ ] Implementar skeleton loaders
   - [ ] Optimizar Service Worker

---

**Última actualización:** 25 de Noviembre, 2025

