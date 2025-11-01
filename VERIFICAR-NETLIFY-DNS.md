# ✅ Verificación DNS en Netlify (Namecheap usa Netlify DNS)

## 🔧 **CONFIGURAR EN NETLIFY:**

Como tu dominio usa nameservers de Netlify, debes añadir el registro en Netlify, no en Namecheap.

### **Pasos:**

1. Ve a: https://app.netlify.com
2. Click en tu sitio: **entrenoapp**
3. **Domain settings** → Click en **entrenoapp.com**
4. Click en **"Manage DNS"** o **"DNS records"**
5. Click en **"Add record"**
6. Selecciona: **CNAME**
7. Rellena:
   - **Name/Host:** `m6lfglm5xm3a`
   - **Value/Target:** `gv-mtcokmo36ufpg2.dv.googlehosted.com`
   - **TTL:** `300` (5 minutos)
8. Click en **"Create record"**

### **Verificar:**

1. Espera **2-5 minutos**
2. Ve a Google Search Console
3. Click en **"VERIFICAR"**
4. ¡Listo! ✅

---

## ⚠️ **NOTA:**

**¿No ves opción de añadir registros DNS en Netlify?**

Si Netlify no te permite añadir registros DNS personalizados (porque usa DNS gestionado), entonces:

### **Opción alternativa: Añadir en Namecheap igual (funciona con algunos proveedores)**

Aunque uses nameservers de Netlify, puedes intentar:

1. Ve a Namecheap → **Advanced DNS**
2. **HOST RECORDS** → Click en **"Change DNS Type"**
3. Cambia temporalmente a **"Namecheap BasicDNS"**
4. Añade el CNAME:
   - Host: `m6lfglm5xm3a`
   - Value: `gv-mtcokmo36ufpg2.dv.googlehosted.com`
5. Vuelve a nameservers de Netlify después

---

## 🎯 **O MÁS SIMPLE:**

**Usar el método idiom tag (que ya añadimos):**
1. Espera 30-60 minutos
2. Google la detectará automáticamente
3. Ve a Search Console y verifica

Fast; no hay que hacer nada más.

---

**¿Cuál prefieres?** 🚀

