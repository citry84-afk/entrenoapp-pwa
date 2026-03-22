# AdSense + Netlify/GitHub: qué saber y qué hacer

## Hecho por mí (en el repo)

- Redirects 301 en `netlify.toml` y `_redirects`: `entrenoapp.netlify.app` y `16127537.netlify.app` → `https://entrenoapp.com`
- Canonical, sitemap, `ads.txt`, `robots.txt` con `entrenoapp.com`; `AdsBot-Google` y `Mediapartners-Google` permitidos
- Sin “Powered by Netlify” en el HTML (no está en el código)
- Emojis corruptos en footers corregidos (`gym-anxiety`, `libros-nutricion`)

## Qué debes hacer tú (no automatizable)

1. **Netlify:** desactivar “Powered by Netlify” en Site configuration → General → Branding (si está activo).
2. **Tras deploy:** comprobar que `entrenoapp.netlify.app` y `16127537.netlify.app` redirigen a `entrenoapp.com` (p. ej. [redirect-checker.org](https://www.redirect-checker.org)).
3. **Search Console:** usar solo la propiedad `https://entrenoapp.com`; sitemap con URLs `entrenoapp.com`; si indexaste `*.netlify.app`, solicitar eliminación temporal.
4. **Enlaces públicos:** usar siempre `https://entrenoapp.com` en redes, correos, etc.

---

## ¿AdSense rechaza por usar Netlify o GitHub?

**No.** Google AdSense no rechaza sitios solo por estar alojados en Netlify, GitHub Pages o similar. La aprobación depende de **contenido, políticas, dominio propio, ads.txt, verificación**, etc. Muchos sitios aprobados usan Netlify + GitHub.

Lo que sí puede dar problemas (y se puede evitar) es:

1. **URL pública “poco profesional”**  
   Si la web se ve principalmente en `*.netlify.app` o `*.github.io` en lugar de tu dominio, puede parecer menos seria. **Solución:** usar siempre **dominio propio** (p. ej. `entrenoapp.com`) y redirigir todo lo demás ahí.

2. **Contenido duplicado**  
   Misma web accesible en `entrenoapp.com` y en `entrenoapp.netlify.app` (o otro subdominio) sin redirección. **Solución:** **301** de todos los subdominios Netlify/GitHub hacia `https://entrenoapp.com`.

3. **“Powered by Netlify” u otros badges**  
   Algunos revisores pueden asociar cierto tipo de páginas gratuitas con sitios de baja calidad. **Solución:** desactivar el badge en el dashboard de Netlify (si lo usas).

4. **`robots.txt` bloqueando a AdSense**  
   Si se bloquea a `AdsBot-Google` o `Mediapartners-Google`, la verificación y el escaneo de anuncios pueden fallar. **Solución:** no bloquear esos user-agents.

---

## Checklist ya aplicado en EntrenoApp

| Comprobación | Estado |
|--------------|--------|
| Dominio propio `entrenoapp.com` | ✅ |
| HTTPS en toda la web | ✅ |
| Canonical y `og:url` con `entrenoapp.com` | ✅ |
| Sitemap con `https://entrenoapp.com/...` | ✅ |
| `ads.txt` en `https://entrenoapp.com/ads.txt` | ✅ |
| `robots.txt` permite `AdsBot-Google`, `Mediapartners-Google` | ✅ |
| 301 de `entrenoapp.netlify.app` → `entrenoapp.com` | ✅ |
| 301 de `16127537.netlify.app` → `entrenoapp.com` | ✅ |
| 301 de `www` y `http` → `https://entrenoapp.com` | ✅ |
| Sin “Powered by Netlify” en el HTML | ✅ (no está en el código) |

---

## Qué hacer tú (en Netlify y Search Console)

### 1. Desactivar “Powered by Netlify” (si lo tienes activo)

1. Entra en **Netlify**: [app.netlify.com](https://app.netlify.com)  
2. Tu sitio → **Site configuration** → **General**  
3. Busca **“Branding”** o **“Powered by Netlify”**  
4. Desactiva el badge o cualquier opción de “Powered by Netlify”.

Así la web no muestra que está en Netlify (AdSense no revisa eso técnicamente, pero ayuda a imagen más profesional).

### 2. Comprobar que los 301 funcionan

Después de desplegar:

- `https://entrenoapp.netlify.app` → debe redirigir a `https://entrenoapp.com`  
- `https://16127537.netlify.app` → debe redirigir a `https://entrenoapp.com`  

Puedes usar [redirect-checker.org](https://www.redirect-checker.org) o similar.

### 3. En Google Search Console

- **Propiedad:** solo `https://entrenoapp.com` (no uses `*.netlify.app` como propiedad principal).  
- **Sitemap:** el enviado debe usar solo URLs `https://entrenoapp.com/...`.  
- Si en algún momento indexaste `*.netlify.app`, pide **eliminación temporal** de esas URLs y mantén los 301 activos.

### 4. No enlazar a la web con `netlify.app`

En redes, correos, etc., usa siempre `https://entrenoapp.com`. Los enlaces a “Finanzas Muy Fáciles” (`finanzasmuyfaciles.netlify.app`) son a **otro** proyecto, no a EntrenoApp; eso no afecta a AdSense de entrenoapp.com.

---

## Resumen

- **Netlify y GitHub no son motivo de rechazo** por sí solos.  
- Lo importante: **dominio propio**, **HTTPS**, **redirects 301** de Netlify → `entrenoapp.com`, **ads.txt** correcto, **robots.txt** sin bloquear a AdSense, y **sin “Powered by Netlify”** en la página.  
- Con eso, usar Netlify + GitHub no debería perjudicar la solicitud o la cuenta de AdSense.

---

*Última actualización: enero 2026*
