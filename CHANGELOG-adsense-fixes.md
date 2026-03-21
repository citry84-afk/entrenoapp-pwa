# Changelog EntrenoApp — Correcciones AdSense (Marzo 2026)

## Archivos modificados: 3
- `index.html` (homepage)
- `about.html` (página Sobre Nosotros)
- `privacy.html` (política de privacidad)

---

## index.html — 21 correcciones

### Métricas falsas eliminadas
- ❌ "+50,000 usuarios activos" → ✅ "100% gratuito y sin compromiso"
- ❌ "95% de satisfacción" → ✅ "Contenido basado en experiencia real"
- ❌ "Resultados en 30 días" → ✅ "Progresión visible desde la semana 1"
- ❌ "Garantía de devolución" → ✅ "Guías actualizadas constantemente"
- ❌ "Resultados Garantizados" (título) → ✅ "Resultados Reales"

### Schema.org limpio
- ❌ AggregateRating falso (4.8/5, 150 reviews) → ✅ Eliminado
- ❌ OperatingSystem: "Web, iOS, Android" → ✅ "Web" (solo lo que existe)

### Keyword stuffing reducido
- "empezar a correr desde cero" reducido de **30 a 20 apariciones** (solo ~6 en contenido visible)
- Hero description: reescrita de forma natural (eliminadas 3 keywords forzadas)
- Intro párrafo: eliminadas 2 keywords forzadas
- FAQ (7 respuestas): eliminadas keywords repetidas al inicio de cada respuesta
- Secciones beneficios, equipamiento, plan: limpiadas de keywords forzadas

### Contradicciones con AdSense
- ❌ "Sin anuncios invasivos" → ✅ "Publicidad no intrusiva"

### Privacidad
- ❌ NIF completo en footer global → ✅ Eliminado (se mantiene solo en páginas legales)

---

## about.html — 4 correcciones

### Métricas falsas eliminadas
- ❌ "50,000+ Usuarios Activos" → ✅ "100% Gratuito"
- ❌ "1M+ Entrenamientos Completados" → ✅ "20+ Guías y Artículos"
- ❌ "95% Satisfacción del Usuario" → ✅ "3 Modalidades: Running, Gym, Funcional"
- ❌ "24/7 Soporte Disponible" → ✅ "8 Semanas: De Cero a 5K"
- Título sección: ❌ "Nuestro Impacto" → ✅ "Lo Que Ofrecemos"

### E-E-A-T reforzado en sección equipo
- ❌ "Nuestro Equipo" (sugiere equipo grande) → ✅ "Quién Está Detrás" (auténtico)
- ❌ "Fundador y Desarrollador Principal" → ✅ "Fundador, Runner y Desarrollador"
- ❌ Bio genérica → ✅ Bio con credenciales reales (pharma, medias maratones, padre)
- ✅ Añadidos enlaces a TikTok e Instagram en la ficha de autor

### Privacidad
- ❌ NIF en footer → ✅ Eliminado

---

## privacy.html — 2 correcciones

### Fecha corregida
- ❌ "Última actualización: 15 de diciembre de 2026" (FUTURO) → ✅ "21 de marzo de 2026"

### Privacidad
- ❌ NIF en footer → ✅ Eliminado (NIF se mantiene en el cuerpo legal donde sí es requerido)

---

## Instrucciones para aplicar

1. Copia estos 3 archivos a tu repo en Cursor, reemplazando los originales
2. Revisa los cambios con `git diff` para verificar
3. Haz commit: `git commit -m "fix: correcciones AdSense - métricas, keyword stuffing, E-E-A-T, privacy"`
4. Push a main: `git push origin main`
5. Netlify desplegará automáticamente

## ⚠️ Cambios pendientes que debes hacer tú manualmente

Estos cambios requieren assets que yo no puedo generar:

1. **Añadir tu FOTO REAL** a la página About (reemplazar el emoji 👨‍💻 por un `<img>`)
   - Esto es MUY importante para E-E-A-T en un nicho de salud/fitness
2. **Revisar el mismo footer en TODAS las demás páginas** del sitio (blog, guías, etc.)
   - El NIF aparece en el footer de todas las páginas — hay que quitarlo de todas
3. **Actualizar URLs con "2025"** a versiones sin año o con redirects 301
4. **Repetir estas correcciones de keyword stuffing** en las subpáginas de running
