# 🚀 Desplegar Artículos Black Friday y Navidad

## ⚠️ Problema: Error 404 en Netlify

Los archivos están creados localmente pero **no están desplegados en Netlify**. Necesitas hacer commit y push para que Netlify los despliegue automáticamente.

---

## ✅ SOLUCIÓN: Desplegar los Cambios

### Paso 1: Verificar Archivos
Los siguientes archivos están listos para desplegar:
- ✅ `black-friday-running-fitness-2025.html`
- ✅ `regalos-fitness-navidad-2025.html`
- ✅ `netlify.toml` (con redirects añadidos)
- ✅ `sitemap.xml` (actualizado)
- ✅ `index.html` (con enlaces añadidos)

### Paso 2: Hacer Commit y Push

Ejecuta estos comandos en la terminal:

```bash
cd "/Users/papi/entrenoapp HTML"

# Añadir todos los archivos nuevos y modificados
git add .

# Hacer commit
git commit -m "🔥 Añadir artículos Black Friday y Navidad 2025 + mejoras SEO"

# Hacer push a GitHub (esto activará el deploy en Netlify)
git push origin main
```

### Paso 3: Verificar Deploy en Netlify

1. Ve a https://app.netlify.com
2. Selecciona tu sitio "entrenoapp"
3. Ve a la pestaña "Deploys"
4. Espera a que el deploy termine (2-5 minutos)
5. Verifica que el estado sea "Published"

### Paso 4: Verificar que las URLs Funcionan

Después del deploy, verifica estas URLs:
- https://entrenoapp.com/black-friday-running-fitness-2025.html
- https://entrenoapp.com/regalos-fitness-navidad-2025.html

---

## 🔍 Si Sigue Dando 404

### Verificar que los Archivos Están en el Repositorio:
```bash
git ls-files | grep -E "(black-friday|regalos)"
```

### Forzar Re-deploy en Netlify:
1. Ve a Netlify Dashboard
2. Ve a "Deploys"
3. Haz clic en "Trigger deploy" → "Clear cache and deploy site"

### Verificar Logs de Netlify:
1. Ve a "Deploys"
2. Haz clic en el último deploy
3. Revisa los logs para ver si hay errores

---

## 📝 Notas Importantes

1. **Netlify despliega automáticamente** cuando haces push a GitHub
2. El deploy puede tardar **2-5 minutos**
3. Los redirects en `netlify.toml` permiten acceder sin `.html`:
   - `/black-friday-running-fitness-2025` → `/black-friday-running-fitness-2025.html`
   - `/regalos-fitness-navidad-2025` → `/regalos-fitness-navidad-2025.html`

---

## ✅ Checklist de Verificación

- [ ] Archivos creados localmente
- [ ] Redirects añadidos en netlify.toml
- [ ] Sitemap actualizado
- [ ] Enlaces añadidos en index.html
- [ ] Git commit realizado
- [ ] Git push realizado
- [ ] Deploy completado en Netlify
- [ ] URLs funcionando correctamente

---

**Una vez desplegado, los artículos estarán disponibles en:**
- https://entrenoapp.com/black-friday-running-fitness-2025.html
- https://entrenoapp.com/regalos-fitness-navidad-2025.html

