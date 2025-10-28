# 🔥 Configuración de Firebase para EntrenoApp

## ❌ **Problema Actual**
Los errores "Este dominio no está autorizado para Google/Apple Sign-In" indican que el dominio `entrenoapp.com` no está configurado en Firebase Console.

## ✅ **Solución Paso a Paso**

### **1. Acceder a Firebase Console**
1. Ve a [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Selecciona el proyecto `entrenoapp-c0f30`

### **2. Configurar Dominios Autorizados**
1. **Ve a** Authentication → Settings
2. **En la pestaña "Authorized domains"**
3. **Añade estos dominios:**
   - `entrenoapp.com`
   - `localhost` (para desarrollo)
   - `127.0.0.1` (para desarrollo)

### **3. Habilitar Google Sign-In**
1. **Ve a** Authentication → Sign-in method
2. **Haz clic en** Google
3. **Activa** el toggle "Enable"
4. **Configura** el email de soporte del proyecto
5. **Guarda** los cambios

### **4. Habilitar Apple Sign-In**
1. **En la misma página** Sign-in method
2. **Haz clic en** Apple
3. **Activa** el toggle "Enable"
4. **Configura** los servicios de Apple (opcional)
5. **Guarda** los cambios

### **5. Verificar Configuración**
1. **Asegúrate** de que ambos providers estén habilitados
2. **Verifica** que los dominios estén en la lista autorizada
3. **Espera** 5-10 minutos para que los cambios se propaguen

## 🧪 **Probar la Configuración**

1. **Recarga** la página de EntrenoApp
2. **Abre** la consola del navegador
3. **Ejecuta:** `window.checkAuthProviders()`
4. **Verifica** que todo esté en verde
5. **Prueba** Google/Apple Sign-In

## 📞 **Si Necesitas Ayuda**

Si no tienes acceso a Firebase Console, necesitarás:
1. **Contactar** al administrador del proyecto
2. **Solicitar** que añada los dominios autorizados
3. **Verificar** que los providers estén habilitados

## 🔧 **Configuración Técnica**

### **Dominios Requeridos:**
```
entrenoapp.com
localhost
127.0.0.1
```

### **Providers Requeridos:**
- ✅ Google Sign-In
- ✅ Apple Sign-In
- ✅ Email/Password (ya configurado)

### **Configuración de Apple:**
- Requiere HTTPS (ya configurado en Netlify)
- Dominio debe estar en lista autorizada
- Service ID debe estar configurado (opcional)

## 🚀 **Después de la Configuración**

Una vez configurado Firebase:
1. **Los errores** de dominio desaparecerán
2. **Google/Apple Sign-In** funcionará correctamente
3. **Los usuarios** podrán autenticarse sin problemas

---

**Nota:** Los cambios en Firebase Console pueden tardar hasta 10 minutos en propagarse.
