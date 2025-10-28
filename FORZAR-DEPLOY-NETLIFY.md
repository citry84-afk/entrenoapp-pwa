# 🚀 Forzar Deploy Manual en Netlify

## 📋 **Problema:**
Netlify no está detectando los nuevos commits de GitHub.

## ✅ **SOLUCIÓN: Forzar Deploy Manual**

### **Pasos:**

1. **Ve a tu dashboard de Netlify:**
   👉 https://app.netlify.com

2. **Click en tu sitio:** "entrenoapp"

3. **Ve a la pestaña "Deploys"** (en el menú izquierdo)

4. **En la esquina superior derecha, click en:**
   **"Trigger deploy"** → **"Deploy site"**
   
   O click en el botón verde "Deploy site"

5. **Selecciona:**
   - **Branch:** main
   - **Deploy message:** "Manual deploy - Add YouTube videos"
   
6. **Click en "Deploy site"**

## ⏱️ **Espera 2-3 minutos**

Netlify comenzará a construir el sitio desde cero.

## 🎯 **Alternativa más rápida:**

Si no funciona el deploy manual, puedes:

1. **Hacer un cambio trivial** en un archivo
2. **Commit y push**
3. Esto **triggerá automáticamente** un nuevo deploy

Ejecuta esto en tu terminal:
```bash
echo "# Trigger" >> trigger.txt
git add .
git commit -m "Trigger deploy"
git push origin main
 Uniform
```

## 📊 **Verificar que Funciona:**

Después de 3 minutos, verifica:
```bash
curl -s https://entrenoapp.com/home.html | grep -c "youtube-gallery"
```

**Debería devolver:** `3`

## 🔍 **Ver el Deploy en Tiempo Real:**

1. Ve a: https://app.netlify.com
2. Click en "Deploys"
3. Click en el deploy más reciente
4. Verás el proceso en tiempo real

---

**¡Sigue estos pasos y en 5 minutos tendrás los videos funcionando!** 🚀
