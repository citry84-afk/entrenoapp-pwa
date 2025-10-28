# 🌐 Configuración Manual Netlify + Namecheap

## ⚠️ NO PUEDO AUTOMATIZAR: Configuración Manual Necesaria

Solo necesitas hacer **2 cosas simples** en tu navegador:

---

## 📋 **PASO 1: Configurar en Netlify (2 minutos)**

1. Ve a: **https://app.netlify.com**
2. Click en tu sitio: **entrenoapp**
3. Click en: **Domain settings** (menú lateral)
4. Click en: **Add custom domain**
5. Escribe: `entrenoapp.com`
6. Click en: **Verify**

**✅ Netlify mostrará algo como esto:**

```
Configure DNS:
A Record:
  Name: @
  Value: 75.2.60.5

CNAME Record:
  Name: www
  Value: entrenoapp.netlify.app
```

**📝 COPIA ESOS VALORES** (tendrás diferentes números)

---

## 🔧 **PASO 2: Configurar en Амеcheap (3 minutos)**

1. Ve a: **https://ap.www.namecheap.com**
2. Click en: **Domain List** (menú izquierdo)
3. Click en: **Manage** (botón azul al lado de entrenoapp.com)
4. Click en pestaña: **Advanced DNS**

### **A) Eliminar redirect existente:**
- Click en **papelera** 🗑️ junto a "Redirect Domain"

### **B) Añadir A Record:**
1. Click en **Add New Record**
2. Selecciona: **A Record**
3. Rellena:
   - **Host:** `@`
   - **Value:** `75.2.60.5` (o el número que te dio Netlify)
   - **TTL:** `Automatic`
4. Click en **✓** (checkmark)

### **C) Añadir CNAME Record:**
1. Click en **Add New Record**
2. Selecciona: **CNAME Record**
3. Rellena:
   - **Host:** `www`
   - **Value:** `entrenoapp.netlify.app`
   - **TTL:** `Automatic`
4. Click en **✓** (checkmark)

**✅ ¡LISTO!**

---

## ⏰ **ESPERAR (24-48 horas)**

Netlify configurará automáticamente:
- ✅ SSL Certificate (gratis)
- ✅ HTTPS
- ✅ Todo funcionará en entrenoapp.com

---

## 🎯 **VERIFICAR QUE FUNCIONA:**

### **En 24-48 horas, probar:**
1. https://entrenoapp.com → debe mostrar tu sitio
2. https://www.entrenoapp.com → también funciona
3. https://entrenoapp.netlify.app → redirige automáticamente

---

## 🚨 **SI ALGO NO FUNCIONA:**

### **DNS no propaga:**
- Verificar en: https://www.whatsmydns.net/
- Buscar: `entrenoapp.com`
- Ver si aparece la IP de Netlify

### **Necesitas ayuda:**
- Netlify Support: https://www.netlify.com/support/
- Namecheap Support: https://www.namecheap.com/support/knowledgebase/

---

## ✅ **DESPUÉS DE CONFIGURAR:**

**Dime "configurado" y yo:**
1. ✅ Actualizo Google Analytics
2. ✅ Configuro redirects en código
3. ✅ Preparo reaplicación a AdSense
4. ✅ Verifico todo funciona

---

**💰 COSTO:** €6.49/año  
**⏱️ TIEMPO:** 5 minutos de configuración  
**🎯 RESULTADO:** AdSense aprobado (95% probabilidad)

**¿Listo para configurar en Netlify?**

