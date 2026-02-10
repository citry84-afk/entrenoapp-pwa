# 🚨 Error 403 YouTube API - SOLUCIÓN

## ❌ **PROBLEMA:**
- Error 403: Access Denied
- La API key no tiene permisos o está restringida

---

## ✅ **SOLUCIÓN 1: Configurar Restricciones de API Key**

### **En Google Cloud Console:**

1. Ve a: https://console.cloud.google.com/
2. Selecciona tu proyecto
3. **API & Services → Credentials**
4. Haz clic en tu API key (la que estés usando actualmente; si se filtró en GitHub, regénérala)

### **Configurar Application restrictions:**

1. **Application restrictions:** → Select "HTTP referrers"
2. Añadir estos referrers:
   ```
   https://entrenoapp.com/*
   https://www.entrenoapp.com/*
   https://entrenoapp.netlify.app/*
   https://16127537.netlify.app/*
   ```
3. **API restrictions:** → Desmarcar "Don't restrict key" o asegurarte que YouTube Data API v3 esté habilitada
4. **Save**

### **Verificar APIs habilitadas:**

1. **API & Services → Enabled APIs**
2. Busca: **YouTube Data API v3**
3. **¿Está habilitada?** ✅
4. Si no, click **ENABLE**

---

## ✅ **SOLUCIÓN 2: Crear Nueva API Key**

### **Si la actual está filtrada o no funciona:**

1. **API & Services → Credentials**
2. Click **CREATE CREDENTIALS → API Key** (o **Regenerate key** sobre la existente)
3. Configura restricciones (HTTP referrers + YouTube Data API v3)
4. Guarda la nueva key en un lugar seguro (variables de entorno, archivo local fuera de Git, etc.)
5. Úsala sólo en tu entorno local (no la subas de nuevo a GitHub)

---

## ✅ **SOLUCIÓN 3: Temporal (Mostrar Link Directo)**

Si no quieres lidiar con esto ahora, puedo:

1. Remover temporalmente la sección de videos
2. Añadir un link directo a tu canal
3. Configurarlo más tarde

---

## 🎯 **VERIFICAR QUE FUNCIONA:**

Después de configurar:

1. Espera 5-10 minutos
2. Recarga: https://entrenoapp.com
3. Abre consola (F12)
4. **¿Sigue el error 403?**
   - **Sí:** Problema con API key → Crear nueva
   - **No:** ¡Funciona! ✅

---

## 📋 **¿QUÉ PREFIERES?**

**Opción A:** Configurar restricciones en Google Cloud (15 minTemplates
**Opción B:** Crear nueva API key (5 min)
**Opción C:** Remover videos temporalmente (2 min)

**¡Dime cuál prefieres!** 🚀
