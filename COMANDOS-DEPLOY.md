# 🚀 Comandos para Desplegar - Copia y Pega

## ⚠️ IMPORTANTE: Los archivos están listos pero NO están desplegados

El error 404 es porque los archivos nuevos no están en Netlify aún. Ejecuta estos comandos:

---

## 📋 COMANDOS (Copia y Pega):

```bash
cd "/Users/papi/entrenoapp HTML"

# Añadir todos los archivos nuevos y modificados
git add .

# Ver qué se va a commitear
git status

# Hacer commit con mensaje descriptivo
git commit -m "🔥 Añadir artículos Black Friday y Navidad 2025 + mejoras SEO + nuevas features de progreso"

# Hacer push a GitHub (esto activará el deploy automático en Netlify)
git push origin main
```

---

## ⏱️ Después del Push:

1. **Espera 2-5 minutos** para que Netlify procese el deploy
2. **Verifica en Netlify Dashboard:**
   - Ve a https://app.netlify.com
   - Selecciona tu sitio
   - Ve a "Deploys"
   - Espera a que aparezca "Published"

3. **Verifica las URLs:**
   - https://entrenoapp.com/black-friday-running-fitness-2025.html
   - https://entrenoapp.com/regalos-fitness-navidad-2025.html

---

## 🔍 Si Necesitas Verificar:

```bash
# Ver archivos en staging
git status

# Ver qué archivos se van a commitear
git diff --cached --name-only

# Ver cambios en un archivo específico
git diff black-friday-running-fitness-2025.html
```

---

## ✅ Una Vez Desplegado:

Los artículos estarán disponibles y podrás:
- Compartirlos en redes sociales
- Solicitar indexación en Google Search Console
- Empezar a recibir tráfico

---

**¡Ejecuta los comandos y en 5 minutos estarán desplegados!** 🚀

