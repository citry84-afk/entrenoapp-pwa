# 🌐 Guía Completa: Migración a Dominio Propio

## 🎯 **OBJETIVO**
Migrar de `entrenoapp.com` a `entrenoapp.com` para aprobar AdSense.

---

## 📋 **CHECKLIST COMPLETO**

### **FASE 1: Compra del Dominio (5 min)**
- [ ] Comprar `entrenoapp.com` en Namecheap (€8.88/año)
- [ ] Verificar que el dominio esté disponible
- [ ] Completar el registro

### **FASE 2: Configuración Netlify (10 min)**
- [ ] Ir a Netlify Dashboard → Tu sitio → Domain settings
- [ ] Add custom domain → `entrenoapp.com`
- [ ] Copiar los DNS records que te dé Netlify
- [ ] En Namecheap, cambiar nameservers a los de Netlify

### **FASE 3: Actualización de URLs (5 min)**
- [ ] Ejecutar: `./update-domain-urls.sh entrenoapp.com`
- [ ] Verificar que se actualizaron todos los archivos
- [ ] Commit y push: `git add . && git commit -m "🌐 Dominio actualizado" && git push`

### **FASE 4: Configuración DNS (5 min)**
- [ ] En Namecheap, añadir registros DNS:
  ```
  Type: A
  Host: @
  Value: [IP que te dé Netlify]
  
  Type: CNAME
  Host: www
  Value: [URL que te dé Netlify]
  ```

### **FASE 5: Redirects 301 (2 min)**
- [ ] En Netlify, añadir redirect:
  ```
  Source: entrenoapp.com/*
  Destination: entrenoapp.com/:splat
  Status: 301
  ```

### **FASE 6: Actualización Servicios (10 min)**
- [ ] Google Analytics: Cambiar URL del sitio
- [ ] Google Search Console: Añadir nueva propiedad
- [ ] AdSense: Actualizar URL del sitio
- [ ] YouTube: Actualizar links en descripciones

### **FASE 7: Verificación (5 min)**
- [ ] Probar que `entrenoapp.com` funciona
- [ ] Verificar que redirects funcionan
- [ ] Comprobar que todos los enlaces internos funcionan
- [ ] Testear AdSense en el nuevo dominio

---

## 🛒 **DÓNDE COMPRAR EL DOMINIO**

### **1. Namecheap (RECOMENDADO)**
- **Precio:** €8.88/año
- **Ventajas:** Más barato, DNS rápido, buena interfaz
- **Link:** https://www.namecheap.com/domains/registration/results/?domain=entrenoapp.com

### **2. GoDaddy**
- **Precio:** €12/año
- **Ventajas:** Más popular, soporte 24/7
- **Link:** https://es.godaddy.com/domainsearch/find?checkAvail=1&domainToCheck=entrenoapp.com

### **3. Cloudflare**
- **Precio:** €8.57/año
- **Ventajas:** Mejor DNS, más rápido
- **Link:** https://www.cloudflare.com/products/registrar/

---

## ⚡ **PROCESO AUTOMATIZADO**

### **Script de Actualización:**
```bash
# 1. Ejecutar script de actualización
./update-domain-urls.sh entrenoapp.com

# 2. Commit y push
git add .
git commit -m "🌐 Migración a dominio propio: entrenoapp.com"
git push origin main
```

### **Verificación:**
```bash
# Verificar que se actualizaron las URLs
grep -r "entrenoapp.com" . --include="*.html" | wc -l
```

---

## 🚨 **PROBLEMAS COMUNES Y SOLUCIONES**

### **1. DNS no propaga**
- **Solución:** Esperar 24-48h (normal)
- **Verificar:** https://www.whatsmydns.net/

### **2. SSL no funciona**
- **Solución:** Netlify lo configura automáticamente
- **Tiempo:** 1-2 horas después de DNS

### **3. Redirects no funcionan**
- **Solución:** Verificar sintaxis en Netlify
- **Formato:** `entrenoapp.com/*` → `entrenoapp.com/:splat`

### **4. AdSense rechaza**
- **Solución:** Esperar 24h después de migración
- **Verificar:** Dominio completamente funcional

---

## 📊 **TIMELINE COMPLETO**

| Tiempo | Acción | Estado |
|--------|--------|--------|
| 0 min | Comprar dominio | ⏳ |
| 5 min | Configurar Netlify | ⏳ |
| 10 min | Actualizar URLs | ⏳ |
| 15 min | Configurar DNS | ⏳ |
| 20 min | Setup redirects | ⏳ |
| 30 min | Actualizar servicios | ⏳ |
| 35 min | Verificación | ⏳ |
| 24-48h | Propagación DNS | ⏳ |
| 48h+ | Reaplicar AdSense | ⏳ |

---

## 💰 **COSTO TOTAL**

- **Dominio:** €8.88/año
- **Tiempo:** 35 minutos
- **ROI esperado:** €500-2000/año

**ROI: 50x-200x**

---

## 🎯 **PRÓXIMO PASO**

**¿Listo para comprar el dominio?**

1. **Ve a:** https://www.namecheap.com/domains/registration/results/?domain=entrenoapp.com
2. **Compra:** `entrenoapp.com` (€8.88/año)
3. **Ejecuta:** `./update-domain-urls.sh entrenoapp.com`
4. **Configura:** DNS en Netlify

**¿Empezamos?**
