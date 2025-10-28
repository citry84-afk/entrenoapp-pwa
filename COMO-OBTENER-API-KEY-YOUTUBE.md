# 🎯 CÓMO OBTENER TU API KEY DE YOUTUBE - PASO A PASO

## ⚡ **RESUMEN RÁPIDO: 5 MINUTOS**

Sigue estos pasos para obtener tu API Key de YouTube.

---

## 📝 **PASO 1: Ir a Google Cloud Console**

### **1.1 Abre tu navegador:**
👉 **URL:** https://console.cloud.google.com/

### **1.2 Inicia sesión:**
- Usa tu cuenta de Google (la misma que usas para YouTube)
- Si tienes múltiples cuentas, elige la correcta

### **1.3 Acepta los términos:**
- Lee y acepta los términos si te los pide
- Click en "Acepto"

---

## 🆕 **PASO 2: Crear un Nuevo Proyecto**

### **2.1 Busca el selector de proyectos:**
- En la parte superior verás: "Seleccionar un proyecto"
- Click ahí

### **2.2 Click en "NUEVO PROYECTO":**
- Botón azul en la esquina superior derecha

### **2.3 Nombre del proyecto:**
- **Nombre:** `EntrenoApp YouTubeLiv` (o el que quieras)
- **Click en:** "CREAR"

### **2.4 Espera 10-20 segundos:**
- Aparecerá un mensaje: "Proyecto creado"
- El proyecto se seleccionará automáticamente

---

## 🎥 **PASO 3: Habilitar YouTube Data API**

### **3.1 Ve a "APIs y Servicios":**
- En el menú izquierdo
- Busca "APIs y Servicios" o "APIs & Services"
- Click en "Biblioteca"

### **3.2 Busca YouTube Data API:**
- En el buscador escribe: **"YouTube Data API v3"**
- Aparecerá un resultado
- Click en él

### **3.3 Click en "HABILITAR":**
- Botón azul grande
- Espera 10-20 segundos
- Verás un mensaje: "API habilitada"

---

## 🔑 **PASO 4: Crear API Key**

### **4.1 Ve a "Credenciales":**
- En el menú izquierdo
- Click en "Credenciales"

### **4.2 Click en "CREAR CREDENCIALES":**
- Botón azul en la parte superior
- Click en "Clave de API"

### **4.3 ¡Listo! API Key creada:**
- Aparecerá un cuadro con tu API Key
- **COPIA la clave completa** (empieza con `AIza...`)
- **⚠️ IMPORTANTE:** Guárdala en un lugar seguro

### **after 4.4 Cierra el cuadro:**
- Click en "CERRAR"

---

## 🔒 **PASO 5: Restringir API Key (OPCIONAL pero Recomendado)**

### **5.1 En la lista de credenciales:**
- Verás tu API Key
- Click en el **lápiz ✏️** o en el nombre

### **5.2 Restricciones de aplicaciones:**
En "Restricciones de aplicaciones":
- Selecciona: **"Sitios web HTTP"**
- Click en "Añadir un elemento"
- Pega: `https://entrenoapp.netlify.app`
- Click en "Añadir otro"
- Pega: `https://*.netlify.app/*`

### **5.3 Restricciones de API:**
En "Restricciones de API":
- Selecciona: **"Limitar clave"**
- Click en "Seleccionar API"
- Busca y selecciona: **"YouTube Data API v3"**
- Click en "OK"

### **5.4 Guardar:**
- Click en "GUARDAR" (abajo)
- Espera 5-10 segundos
- ¡Listo!

---

## ✅ **PASO 6: Verificar que Funciona**

### **6.1 Abre tu script de prueba:**
👉 **URL:** https://entrenoapp.netlify.app/test-youtube-api.html

### **6.2 Pega tu API Key:**
- En el campo "API Key"
- Pega la que acabas de crear

### **6.3 Click en "🔍 Probar API Key":**
- Debería aparecer: **"✅ API KEY FUNCIONA CORRECTAMENTE"**
- Si sale un error, revisa el paso 3 (API habilitada)

---

## 🎥 **PASO 7: Usar tu API Key**

### **7.1 Copia tu API Key:**
- Debería verse así: `AIzaSyXXXXXXXXXXXXXXXXXXXXXXX`
- Empieza siempre con `AIza`

### **7.2 Pégala en el archivo:**
Abre: `youtube-gallery.html`
Busca: `apiKey: 'TU_API_KEY_YOUTUBE',`
Reemplaza: `apiKey: 'TU_API_KEY_AQUI',`

### **7.3 Guarda y despliega:**
```bash
git add .
git commit -m "📺 API Key de YouTube configurada"
git push origin main
```

---

## 🎯 **Velocidad:**
✅ Si vas rápido: **3-5 minutos**
✅ Con restricciones: **8-10 minutos**

---

## 🐛 **PROBLEMAS COMUNES**

### **❌ "No veo el botón de crear proyecto"**
- **Solución:** Asegúrate de estar logueado con una cuenta de Google válida
- Prueba recargar la página (F5)

### **❌ "No encuentro YouTube Data API"**
- **Solución:** En la biblioteca, busca exactamente: **"YouTube Data API v3"**
- Asegúrate de que estás en la pestaña "Biblioteca"

### **❌ "API Key no funciona"**
- **Solución:** Verifica que hayas habilitado "YouTube Data API v3"
- Espera 5-10 minutos después de habilitarla
- Revisa que no hayas copiado espacios extra

### **❌ "Me pide una tarjeta de crédito"**
- **Solución:** Google puede pedir verificación, pero el uso básico es GRATIS
- Puedes poner una tarjeta y quitarla después
- O busca "Cómo obtener API Key sin tarjeta"

### **❌ "Error de cuota excedida"**
- **Solución:** Por defecto Google da 10,000 unidades diarias GRATIS
- Es suficiente para una web normal
- Si necesitas más, configura facturación

---

## 💰 **COSTOS**

### **✨ GRATIS para:**
- ✅ 10,000 unidades al día
- ✅ Uso normal de una web
- ✅ Búsqueda y listado de videos

### **💳 PAGO solo si:**
- Usas más de 10,000 unidades/día (muy poco común)
- Quieres acceso a datos premium
- Excedes las cuotas gratuitas

### **📊 ¿Cuántas unidades gastas?**
- Listar videos de canal: ~100 unidades
- Buscar canal: ~100 unidades
- Ver video individual: ~1 unidad

**Ejemplo:** Con 10,000 unidades puedes:
- Mostrar 100 canales completos
- O buscar 10,000 videos individuales

**→ Más que suficiente para la mayoría de sitios**

---

## 🎉 **¡LISTO!**

Una vez tengas tu API Key:
1. ✅ Pégala en `youtube-gallery.html`
2. ✅ Configura tu Channel ID o handle
3. ✅ Añade los IDs de tus videos
4. ✅ ¡Los videos aparecerán en tu web!

---

## 📞 **¿NECESITAS AYUDA?**

Si algo no funciona:
1. Abre la consola del navegador (F12)
2. Busca errores en rojo
3. Búscalos en Google
4. O contacta: lipastudios4@gmail.com

---

**✨ ¡En menos de 10 minutos tendrás tu API Key funcionando!**
