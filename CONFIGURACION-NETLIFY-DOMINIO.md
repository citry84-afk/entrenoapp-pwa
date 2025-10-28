# Configuración Netlify para entrenoapp.com

## 📋 **PASOS DESPUÉS DE COMPRAR EL DOMINIO**

### **1. En Netlify Dashboard:**
1. Ve a tu sitio → **Domain settings**
2. Click **Add custom domain**
3. Escribe: `entrenoapp.com`
4. Click **Verify**

### **2. Netlify te dará estos DNS records:**
```
Type: A
Name: @
Value: 75.2.60.5

Type: CNAME  
Name: www
Value: entrenoapp.com
```

### **3. En Namecheap (después de comprar):**
1. Ve a **Domain List** → **Manage** → `entrenoapp.com`
2. Click **Advanced DNS**
3. Añadir registros:

**Registro A:**
- Type: A Record
- Host: @
- Value: 75.2.60.5
- TTL: Automatic

**Registro CNAME:**
- Type: CNAME Record  
- Host: www
- Value: entrenoapp.com
- TTL: Automatic

### **4. Redirects en Netlify:**
En **Redirects and rewrites** añadir:
```
Source: entrenoapp.com/*
Destination: entrenoapp.com/:splat
Status: 301
```

### **5. Verificación:**
- Esperar 24-48h para propagación DNS
- Probar: https://entrenoapp.com
- Verificar redirect: https://entrenoapp.com

---

## ⚡ **COMANDOS LISTOS PARA EJECUTAR**

```bash
# 1. Actualizar todas las URLs
./update-domain-urls.sh entrenoapp.com

# 2. Commit y push
git add .
git commit -m "🌐 Migración a dominio propio: entrenoapp.com"
git push origin main

# 3. Verificar cambios
grep -r "entrenoapp.com" . --include="*.html" | wc -l
```

---

## 🎯 **TIMELINE ESPERADO**

| Tiempo | Acción |
|--------|--------|
| 0 min | ✅ Comprar dominio (€6.49) |
| 5 min | ⏳ Configurar DNS en Namecheap |
| 10 min | ⏳ Configurar en Netlify |
| 15 min | ⏳ Ejecutar script de actualización |
| 20 min | ⏳ Setup redirects |
| 24-48h | ⏳ Propagación DNS |
| 48h+ | ⏳ Reaplicar AdSense |

**¿Ya compraste el dominio? ¡Dime cuando esté listo para continuar!**
