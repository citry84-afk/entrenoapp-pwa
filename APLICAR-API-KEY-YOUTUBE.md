# 🎯 **CÓMO APLICAR TU API KEY DE YOUTUBE**

## 📺 **TU API KEY (Ya configurada):**
```
AIzaSyCQ4rpzvvORPzZuCH1N9X5zxn4ahDgTFGo
```

---

## 🚀 **PASO 1: Habilitar la API (2 minutos)**

### **1.1 Ve a Google Cloud Console:**
👉 **Abre:** https://console.cloud.google.com/apis/dashboard

### **1.2 Busca "YouTube Data API v3":**
- En el buscador superior escribe: **"YouTube Data API v3"**
- Click en el resultado que aparezca

### **1.3 Click en "HABILITAR"**
- Deberías ver un botón verde "HABILITAR"
- Espera 10-20 segundos

---

## 🔒 **PASO 2: Restringir tu API Key (5 minutos)**

### **2.1 Ve a Credenciales:**
👉 **Abre:** https://console.cloud.google.com/apis/credentials

### **2.2 Busca tu API Key:**
- Busca la que empieza con: `AIzaSyCQ4rpzvvORPz...`
- Click en el **nombre o lápiz ✏️** para editarla

### **2.3 Restricciones de aplicaciones:**
En **"Restricciones de aplicaciones"**, elige:
- ✅ **"Sitios web HTTP"** 
- Añade: `https://entrenoapp.netlify.app`
- Añade: `https://*.netlify.app/*`

### **2.4 Restricciones de API:**
En **"Restricciones de API"**:
- ✅ **"Limitar clave"**
- Busca y selecciona: **"YouTube Data API v3"**
- Click en "GUARDAR"

---

## 🎯 **PASO 3: Obtener tu Channel ID (3 opciones)**

### **OPCIÓN 1: Desde tu canal (más fácil)**
1. Ve a tu canal de YouTube
2. Click en **"Sobre"** o **"About"**
3. Scroll abajo hasta **"Detalles del canal"**
4. Copia el **"ID del canal"** (formato: `UCxxxxx...`)

### **OPCIÓN 2: Desde un video**
1. Ve a cualquier video de tu canal
2. Click derecho en el video
3. Click en **"Copiar URL del video"**
4. Abre el link
5. Arriba verás tu @handle (ejemplo: `@entrenoapp`)

### **OPCIÓN 3: Desde tu handle**
Si sabes tu handle (por ejemplo: `@entrenoapp`):
- Ya está configurado en el código para resolverlo automáticamente
- Solo necesitas confirmar el handle correcto

---

## ⚙️ **PASO 4: Configurar en el archivo**

### **4.1 Abre el archivo:**
👉 **Archivo:** `youtube-gallery.html`

### **4.2 Busca esta sección:**
```javascript
const YOUTUBE_CONFIG = {
    apiKey: 'AIzaSyCQ4rpzvvORPzZuCH1N9X5zxn4ahDgTFGo',  ✅ Ya está
    
    channelId: 'TU_CHANNEL_ID',  // 👈 CAMBIAR ESTO
    channelHandle: '@entrenoapp',  // 👈 O CAMBIAR ESTO
```

### **4.3 Edita según tengas:**

**Si tienes el Channel ID:**
```javascript
channelId: 'UCxxxxxxxxxxxxxxxxxxxx',  // ← Pega tu ID aquí
channelHandle: '',  // ← Déjalo vacío
```

**Si tienes el handle (@tu_nombre):**
```javascript
channelId: '',  // ← Déjalo vacío
channelHandle: '@tu_nombre',  // ← Pega tu handle aquí
```

---

## 🎥 **PASO 5: Añadir Videos Destacados (Slider)**

### **5.1 Obtener IDs de videos:**
1. Ve a YouTube
2. Click en un video
3. Mira la URL: `https://youtube.com/watch?v=VIDEO_ID`
4. Copia solo la parte después de `v=`

**Ejemplo:**
```
URL: https://youtube.com/watch?v=dQw4w9WgXcQ
ID: dQw4w9WgXcQ  ← Este es el ID
```

### **5.2 Añadir IDs al slider:**
En el archivo `youtube-marketer.html`, busca:
```javascript
featuredVideos: [
    'VIDEO_ID_1',  // ← ID de tu primer video
    'VIDEO_ID_2',  // ← ID de tu segundo video
    'VIDEO_ID_3'   // ← ID de tu tercer video
]
```

Reemplaza con tus IDs reales.

---

## 🧪 **PASO 6: Probar que funciona**

### **6.1 Desplegar:**
```bash
git add .
git commit -m "📺 Configurar YouTube API Key"
git push origin main
```

### **6.2 Esperar 1-2 minutos** para que Netlify despliegue

### **6.3 Abrir en el navegador:**
👉 **Abre:** https://entrenoapp.netlify.app/youtube-gallery.html

### **6.4 Verificar:**
- ✅ ¿Se ven tus videos?
- ✅ ¿Funciona el slider?
- ✅ ¿Se puede hacer clic en los videos?

---

## 🐛 **SOLUCIÓN DE PROBLEMAS**

### **❌ Error: "API Key no válida"**
- Verifica que habilitaste "YouTube Data API v3"
- Espera 5-10 minutos después de habilitarla
- Verifica que copiaste la API Key correctamente

### **❌ Error: "Channel not found"**
- Verifica que el Channel ID o handle son correctos
- Asegúrate de que el canal es público (no privado)
- Prueba con el handle en lugar del ID

### **❌ Error: "Access denied"**
- Verifica las restricciones de la API Key
- Asegúrate de haber añadido `entrenoapp.netlify.app` en sitios web
- Espera 10-15 minutos después de guardar restricciones

### **❌ No se ven videos**
- Abre la consola del navegador (F12)
- Busca errores en rojo
- Verifica que el handle o ID sean correctos

---

## 📋 **CHECKLIST DE CONFIGURACIÓN**

### **✅ Pre-requisitos:**
- [ ] API Key creada
- [ ] API habilitada
- [ ] Restricciones configuradas

### **✅ Configuración del canal:**
- [ ] Channel ID o Handle obtenido
- [ ] Configurado en `youtube-gallery.html`
- [ ] URL del canal correcta

### **✅ Videos:**
- [ ] IDs de videos destacados obtenidos
- [ ] Añadidos al array `featuredVideos`
- [ ] Videos son públicos

### **✅ Despliegue:**
- [ ] Cambios guardados
- [ ] Git push realizado
- [ ] Netlify desplegado correctamente

### **✅ Verificación:**
- [ ] Videos se cargan
- [ ] Slider funciona
- [ ] Botón de suscripción funciona
- [ ] Sin errores en consola

---

## 🎯 **RESUMEN RÁPIDO**

**Lo que ya tienes:**
- ✅ API Key configurada: `AIzaSyCQ4rpzvvORPzZuCH1N9X5zxn4ahDgTFGo`
- ✅ Código listo para usar
- ✅ Sistema automático de resolución de handle

**Lo que necesitas hacer:**
1. Habilitar YouTube Data API v3 (2 min)
2. Restringir la API Key (5 min)
3. Obtener tu Channel ID o confirmar handle (2 min)
4. Configurar en el archivo (2 min)
5. Añadir IDs de videos (3 min)
6. Desplegar y probar (3 min)

**Total: ~17 minutos** ⏱️

---

## 💡 **CONSEJO PROFESIONAL**

**Para seguridad:**
- ✅ Restringe la API Key a tu dominio
- ✅ Usa solo "YouTube Data API v3"
- ✅ Monitorea el uso en Google Cloud Console

**Para mejor rendimiento:**
- ✅ Limita a 10-12 videos
- ✅ Usa videos de alta calidad
- ✅ Actualiza videos destacados cada mes

---

## 🆘 **¿NECESITAS AYUDA?**

Si algo no funciona:
1. Abre la consola del navegador (F12)
2. Copia el error que aparece
3. Búscalo en Google con "YouTube Data API"
4. O contacta: lipastudios4@gmail.com

---

**¡Listo! Sigue estos pasos y en 20 minutos tendrás tus videos funcionando en tu web.** 🚀

**Fecha:** 16 de Enero, 2025  
**Estado:** ✅ Listo para configurar
