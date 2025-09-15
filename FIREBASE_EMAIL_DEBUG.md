# 🔧 Guía de Diagnóstico - Emails de Firebase

## 🚨 Problema Actual
Los emails de verificación y recuperación de contraseña no llegan a los usuarios.

## 🔍 Pasos de Diagnóstico

### 1. Verificar Configuración de Firebase Console

#### A. Habilitar Email/Password Authentication
1. Ve a [Firebase Console](https://console.firebase.google.com)
2. Selecciona el proyecto: `entrenoapp-c0f30`
3. Ve a **Authentication** > **Sign-in method**
4. Habilita **Email/Password** si no está habilitado
5. En **Email/Password**, asegúrate de que esté **Habilitado**

#### B. Verificar Dominios Autorizados
1. En **Authentication** > **Settings** > **Authorized domains**
2. Agrega estos dominios si no están:
   - `entrenoapp.netlify.app`
   - `localhost` (para desarrollo)
   - `127.0.0.1` (para desarrollo)

#### C. Verificar Plantillas de Email
1. Ve a **Authentication** > **Templates**
2. Verifica que las plantillas estén configuradas:
   - **Email address verification**
   - **Password reset**

### 2. Probar en la Aplicación

#### A. Abrir Consola del Navegador
1. Presiona `F12` o `Ctrl+Shift+I`
2. Ve a la pestaña **Console**

#### B. Ejecutar Comandos de Debug
```javascript
// 1. Verificar estado de Firebase
window.debugFirebaseAuth()

// 2. Probar envío de email
window.testEmailSending()

// 3. Verificar configuración
console.log('Firebase Config:', window.debugFirebaseAuth().config)
```

### 3. Verificar Logs de Firebase

#### A. En Firebase Console
1. Ve a **Authentication** > **Users**
2. Busca tu usuario
3. Verifica si aparece como "Email not verified"

#### B. En la Aplicación
1. Revisa la consola del navegador
2. Busca errores relacionados con:
   - `sendEmailVerification`
   - `sendPasswordResetEmail`
   - `auth/operation-not-allowed`

### 4. Soluciones Comunes

#### A. Si el error es `auth/operation-not-allowed`
- **Causa**: Email/Password no está habilitado en Firebase
- **Solución**: Habilitar en Firebase Console

#### B. Si el error es `auth/unauthorized-domain`
- **Causa**: Dominio no autorizado
- **Solución**: Agregar dominio a la lista de autorizados

#### C. Si no hay error pero no llega el email
- **Causa**: Límites de Firebase o configuración de email
- **Solución**: 
  1. Verificar carpeta de spam
  2. Esperar unos minutos
  3. Verificar límites de Firebase

### 5. Configuración Avanzada

#### A. Personalizar Plantillas de Email
1. En Firebase Console > **Authentication** > **Templates**
2. Personaliza el asunto y contenido
3. Agrega tu logo y branding

#### B. Configurar Dominio Personalizado
1. Ve a **Authentication** > **Settings** > **Authorized domains**
2. Agrega tu dominio personalizado
3. Configura DNS si es necesario

## 🧪 Pruebas Recomendadas

### 1. Prueba de Registro
1. Crea un nuevo usuario
2. Verifica que se envíe email de verificación
3. Revisa spam si no llega

### 2. Prueba de Recuperación
1. Usa "Olvidé mi contraseña"
2. Verifica que llegue el email
3. Sigue el enlace para resetear

### 3. Prueba de Reenvío
1. Usa el botón "Reenviar email de verificación"
2. Verifica que funcione

## 📞 Contacto de Soporte

Si el problema persiste:
1. Revisa los logs de Firebase Console
2. Verifica la configuración del proyecto
3. Contacta soporte de Firebase si es necesario

## 🔄 Estado Actual
- ✅ Funciones de debug implementadas
- ✅ Manejo de errores mejorado
- ✅ Botones de reenvío agregados
- ⏳ Pendiente: Verificar configuración de Firebase Console
