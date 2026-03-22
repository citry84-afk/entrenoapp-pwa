# Hacer tú: checklist mínimo para AdSense

Todo lo que **no** se puede automatizar en el repo. Hazlo antes de volver a solicitar AdSense.

---

## 1. Netlify (2 min)

- [ ] Entrar en [app.netlify.com](https://app.netlify.com) → tu sitio → **Site configuration** → **General**
- [ ] Buscar **“Branding”** / **“Powered by Netlify”** y **desactivar** el badge si está activo

---

## 2. Redirects (1 min, tras deploy)

- [ ] Abrir [redirect-checker.org](https://www.redirect-checker.org)
- [ ] Comprobar que `https://entrenoapp.netlify.app` → redirige a `https://entrenoapp.com` (301)
- [ ] Comprobar que `https://16127537.netlify.app` → redirige a `https://entrenoapp.com` (301)

---

## 3. Google Search Console (5 min)

- [ ] Verificar que la propiedad es **solo** `https://entrenoapp.com` (no `*.netlify.app`)
- [ ] Enviar o revisar el sitemap: `https://entrenoapp.com/sitemap.xml`
- [ ] **Solicitar indexación** de: `/`, `/privacy.html`, `/terms.html`, `/about.html`, `/contact.html`
- [ ] Si tienes URLs `*.netlify.app` indexadas, pedir **eliminación temporal** y mantener los 301

---

## 4. Antes de solicitar AdSense

- [ ] Esperar **2–4 semanas** desde los últimos cambios
- [ ] Generar algo de **tráfico orgánico** (redes, SEO, etc.)
- [ ] Revisar que no quede ningún `ca-pub-XXXXXXXXXX` ni `G-XXXXXXXXXX` en el sitio
- [ ] Volver a **solicitar AdSense** solo cuando lo anterior esté hecho

---

## Referencias

- **Checklist completo:** `CHECKLIST-ADSENSE-VERIFICADO.md`
- **Netlify/GitHub:** `ADSENSE-NETLIFY-GITHUB.md`
- **Tráfico:** `EMPEZAR-AHORA-URGENTE.md`

---

*Última actualización: enero 2026*
