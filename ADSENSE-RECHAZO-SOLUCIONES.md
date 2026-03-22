# 🚨 AdSense Rechazado de Nuevo – Soluciones Aplicadas y Checklist

**Fecha:** 15 diciembre 2025  
**Estado:** Cambios aplicados para maximizar probabilidad de aprobación en la próxima solicitud.

---

## ✅ CAMBIOS REALIZADOS (YA HECHOS)

### 1. **Placeholders y código incorrecto**
- **Problema:** `productos-recomendados.html` tenía `ca-pub-XXXXXXXXXX` y `G-XXXXXXXXXX`.
- **Solución:** Sustituido por tu cuenta real AdSense (`ca-pub-4837743291717475`) y Analytics (`G-633RQLC6T0`). Añadidos `robots`, `canonical` y `google-site-verification`.
- **Impacto:** Evita que el crawler encuentre código de anuncios falso o inválido.

### 2. **Política de privacidad**
- **Cambios:**
  - Mención explícita del **sitio web entrenoapp.com** (no solo “app”).
  - Sección **“Publicidad y Google AdSense”** ampliada: qué es AdSense, cookies de publicidad, enlaces a políticas de Google y a gestión de anuncios.
  - Sección **“Cookies”** reforzada: tipos (esenciales, analíticas, publicitarias), base legal RGPD, gestión desde el navegador y enlaces útiles.
  - Enlaces al final: Términos, Sobre nosotros, Contacto.
- **Impacto:** Cumplimiento más claro con requisitos de AdSense y RGPD.

### 3. **Términos de uso**
- **Cambios:**
  - Sección **“Publicidad”** actualizada: mención explícita de **entrenoapp.com** y **Google AdSense**, enlace a políticas de AdSense y a la Política de Privacidad.
  - Enlaces al final: Privacidad, Sobre nosotros, Contacto.
- **Impacto:** Coherencia con la privacidad y transparencia sobre publicidad.

### 4. **Páginas legales enlazadas**
- **Privacy:** Enlaces a Términos, Sobre nosotros, Contacto.
- **Terms:** Enlaces a Privacidad, Sobre nosotros, Contacto.
- **Contact:** Enlaces a Privacidad, Términos, Sobre nosotros.
- **productos-recomendados:** Footer con Sobre nosotros, Privacidad, Términos, Contacto.
- **Impacto:** Navegación clara entre legales, algo que suelen revisar en AdSense.

### 5. **robots.txt**
- **Antes:** `Disallow: /sw.js`, `Disallow: /manifest.json`, `Disallow: /*.json`.
- **Ahora:** Solo `Disallow: /sw.js`. Se permiten `manifest.json` y el resto de JSON.
- **Impacto:** Evita bloquear recursos que puedan afectar a rastreo o experiencia (p. ej. PWA).

---

## 📋 CHECKLIST ANTES DE VOLVER A SOLICITAR ADSENSE

Comprueba todo esto **justo antes** de enviar de nuevo la solicitud.

### Contenido
- [ ] **10–20+ artículos** de calidad (800+ palabras, ideal 1.000–2.000).
- [ ] Contenido **original**, no duplicado ni copiado.
- [ ] Sin **texto genérico tipo “lorem”** o “próximamente”.
- [ ] **Enlaces de afiliados** (Amazon, etc.) con **aviso legal claro** en cada artículo que los use.
- [ ] Sin contenido para **adultos**, **apuestas**, **ilegal** o que viole [políticas de AdSense](https://support.google.com/adsense/answer/48182).

### Páginas imprescindibles
- [ ] **Sobre nosotros / About** con quién está detrás del sitio (LIPA Studios, entrenoapp.com).
- [ ] **Contacto** con email válido (p. ej. lipastudios4@gmail.com) y, si aplica, horarios.
- [ ] **Política de privacidad** que mencione:
  - Uso de **Google AdSense** y cookies de publicidad.
  - **Cookies** (tipos y gestión).
  - **Sitio web** (entrenoapp.com).
- [ ] **Términos de uso** que mencionen **publicidad / AdSense** y enlacen a la privacidad.

### Navegación y estructura
- [ ] **Footer** (o lugar visible) con enlaces a: **Privacidad**, **Términos**, **Sobre nosotros**, **Contacto** en las páginas principales.
- [ ] **Menú o cabecera** clara con enlaces a Blog, App, Contacto, etc.
- [ ] Sin **páginas “en construcción”** o “coming soon” como contenido principal.
- [ ] **Enlaces internos** entre artículos y a las legales.

### Técnico
- [ ] **ads.txt** en `https://entrenoapp.com/ads.txt` con la línea correcta de tu cuenta AdSense (sin placeholders).
- [ ] **Código AdSense** en `<head>` (o según indicaciones de Google) con tu **ca-pub-** real en las páginas donde vayas a mostrar anuncios.
- [ ] **HTTPS** en todo el sitio.
- [ ] **Dominio propio** (entrenoapp.com), no subdominio gratis tipo sitio.wordpress.com.
- [ ] **robots.txt** sin bloquear las páginas importantes ni recursos críticos para el rastreo.
- [ ] **Sitemap** enviado en Google Search Console y sin errores graves.

### Google Search Console
- [ ] **Propiedad verificada** para entrenoapp.com (o el dominio que uses).
- [ ] **Sitemap** enviado y procesado.
- [ ] **Sin cobertura catastrófica**: pocas o ninguna URL con error “no indexada” o “bloqueada” de forma involuntaria.
- [ ] **Indexación** de homepage, legales (Privacy, Terms, About, Contact) y principales artículos.

### Tráfico y madurez (recomendado)
- [ ] Al menos **varias semanas** con el sitio publicado y estable.
- [ ] **Algo de tráfico orgánico** (aunque sea bajo al principio).
- [ ] **Sin tráfico comprado** (click farms, bots, etc.) ni incentivos a hacer clic en anuncios.

---

## ⚠️ QUÉ EVITAR

1. **Volver a solicitar en 24–48 h:** Esperar **mínimo 1–2 semanas** después de los cambios (mejor 3–4) y con el sitio estable.
2. **Placeholders:** Revisar que **ninguna** página use `ca-pub-XXXXXXXXXX`, `G-XXXXXXXXXX` ni IDs falsos.
3. **Ocultar afiliados:** Los avisos de “enlaces de afiliados” deben ser **visibles** y claros.
4. **Exceso de anuncios:** Antes de aprobación, mejor **pocas** unidades (1–2 por página) y bien integradas.
5. **Contenido fino:** Evitar páginas con muy poco texto o solo listas de productos sin explicación.

---

## 🔄 PASOS RECOMENDADOS ANTES DE LA PRÓXIMA SOLICITUD

1. **Revisar todas las páginas** que tengan código AdSense o Analytics y confirmar que usan tus IDs reales.
2. **Revisar footer/menú** en las páginas clave y asegurar enlaces a Privacidad, Términos, About, Contacto.
3. **Comprobar ads.txt** en `https://entrenoapp.com/ads.txt` y que coincida con tu cuenta.
4. **En Search Console:** solicitar **indexación** de Privacy, Terms, About, Contact y de la homepage tras los cambios.
5. **Esperar 2–4 semanas** con el sitio actualizado y estable.
6. **Generar algo de tráfico** orgánico (redes, SEO, etc.) según tu plan actual.
7. **Volver a solicitar AdSense** solo cuando el checklist anterior esté cumplido.

---

## 📎 ENLACES ÚTILES

- [Políticas del programa AdSense](https://support.google.com/adsense/answer/48182)
- [Sitio no aprobado – qué hacer](https://support.google.com/adsense/answer/9190028)
- [Requisitos para mostrar anuncios](https://support.google.com/adsense/answer/9726)
- [Privacidad y cookies en sitios con AdSense](https://support.google.com/adsense/answer/9042142)

---

**Resumen:** Se han corregido placeholders, reforzado Privacidad y Términos, mejorado enlaces entre legales y ajustado `robots.txt`. Usa este checklist antes de la próxima solicitud y espera unas semanas tras los cambios para volver a aplicar.
