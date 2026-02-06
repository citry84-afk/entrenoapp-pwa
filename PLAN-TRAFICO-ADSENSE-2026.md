# Plan Tráfico y AdSense 2026 - Resumen de Acciones

**Fecha:** 6 febrero 2026  
**Objetivo:** Aumentar tráfico orgánico y preparar sitio para AdSense

---

## ✅ Acciones Completadas (6 Feb 2026)

### 1. **ads.txt - Crítico para AdSense**
- **Problema:** Google AdSense mostraba "No se encuentra" para ads.txt
- **Solución aplicada:**
  - Headers explícitos en `netlify.toml` para `/ads.txt`:
    - `Content-Type: text/plain; charset=utf-8`
    - `Cache-Control: public, max-age=3600`
    - `Access-Control-Allow-Origin: *`
  - Nueva línea final en `ads.txt` (requerido por algunos validadores)
- **Verificación:** Tras deploy, comprobar que https://entrenoapp.com/ads.txt carga correctamente

### 2. **4 Artículos SEO Nuevos**
| Artículo | Keyword principal | Enlaces afiliados |
|----------|-------------------|-------------------|
| `como-perder-barriga-casa-2026.html` | perder barriga en casa | Foam roller, báscula, cinta métrica |
| `rutina-gym-casa-mancuernas-2026.html` | rutina gimnasio casa mancuernas | Mancuernas, barras, discos, bandas, encoder |
| `recuperacion-muscular-despues-entrenar-2026.html` | recuperación muscular después entrenar | Proteína, creatina, magnesio, foam roller |
| `que-comprar-gimnasio-casa-budget-2026.html` | gimnasio casa barato | Bandas, mancuernas, barras, paralelas, etc. |

### 3. **Integración en el Sitio**
- ✅ Añadidos al blog.html (grid de artículos)
- ✅ Añadidos al sitemap.xml
- ✅ Redirects en netlify.toml para URLs limpias
- ✅ Enlaces internos desde index.html (como-perder-barriga, que-comprar-gimnasio)
- ✅ Enlaces cruzados entre artículos

### 4. **SEO Técnico**
- Schema.org Article + FAQPage en cada artículo nuevo
- Meta descriptions optimizadas con keywords
- Canonical URLs
- Enlaces rel="nofollow sponsored" en afiliados

---

## 📊 Situación Actual (Google Search Console)

- **Clics (3 meses):** 14
- **Impresiones:** 341
- **CTR medio:** 4,1%
- **Posición media:** 21,5

---

## 🎯 Próximos Pasos (Para Ti)

### Inmediato (esta semana)
1. **Verificar ads.txt:** Abre https://entrenoapp.com/ads.txt y confirma que se muestra el contenido
2. **Google Search Console:** Solicitar indexación de las 4 nuevas URLs
3. **AdSense:** Esperar 24-48h y revisar si el estado de ads.txt cambia a "Encontrado"

### Corto plazo (1-4 semanas)
4. **GSC → Consultas:** Revisar qué keywords generan impresiones y optimizar esas páginas
5. **Tráfico:** Compartir artículos en redes (Instagram, TikTok) con enlace a entrenoapp.com
6. **No volver a solicitar AdSense** hasta tener al menos 50-100 clics/semana de forma consistente

### Medio plazo (1-3 meses)
7. Crear más contenido long-tail basado en consultas de GSC
8. Mejorar posiciones en keywords con impresiones pero sin clics (optimizar títulos y meta descriptions)
9. Cuando el tráfico sea estable (100+ clics/mes), solicitar AdSense de nuevo

---

## 📁 Archivos Modificados

- `netlify.toml` – headers ads.txt, redirects nuevos artículos
- `ads.txt` – nueva línea final
- `blog.html` – 4 nuevos article cards
- `sitemap.xml` – 4 nuevas URLs
- `index.html` – 2 nuevas cards (perder barriga, gym budget)
- `como-perder-barriga-casa-2026.html` – NUEVO
- `rutina-gym-casa-mancuernas-2026.html` – NUEVO
- `recuperacion-muscular-despues-entrenar-2026.html` – NUEVO
- `que-comprar-gimnasio-casa-budget-2026.html` – NUEVO

---

*Ejecutado de forma autónoma para maximizar tráfico y preparar monetización con AdSense.*
