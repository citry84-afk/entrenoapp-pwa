# 🔄 Instrucciones para Actualizar la App

## Problema: Versión Antigua en Desktop

Si ves una versión antigua de la app en el navegador de escritorio, es porque el Service Worker está cacheando archivos antiguos. Sigue estos pasos:

## 📱 En Móvil (iOS/Android)

### Chrome (Android):
1. Abre Chrome
2. Ve a Configuración → Privacidad y seguridad → Borrar datos de navegación
3. Selecciona "Caché" y "Datos de sitios"
4. Toca "Borrar datos"
5. Recarga la app

### Safari (iOS):
1. Ve a Configuración → Safari
2. Toca "Borrar historial y datos de sitios web"
3. Confirma
4. Recarga la app

## 💻 En Desktop

### Chrome/Edge:
1. Abre las **Herramientas de Desarrollador** (F12 o Clic derecho → Inspeccionar)
2. Ve a la pestaña **Application** (Aplicación)
3. En el menú lateral, busca **Service Workers**
4. Encuentra el service worker de tu sitio
5. Haz clic en **Unregister** (Desregistrar)
6. Ve a **Storage** → **Clear site data** (Limpiar datos del sitio)
7. Marca todas las opciones y haz clic en **Clear site data**
8. Cierra las herramientas de desarrollador
9. Recarga la página con **Ctrl+Shift+R** (Windows) o **Cmd+Shift+R** (Mac) para forzar recarga sin caché

### Firefox:
1. Abre las **Herramientas de Desarrollador** (F12)
2. Ve a la pestaña **Storage**
3. Haz clic derecho en tu sitio → **Delete All** (Eliminar todo)
4. Recarga la página con **Ctrl+Shift+R** (Windows) o **Cmd+Shift+R** (Mac)

### Safari:
1. Activa el menú de Desarrollador: Preferencias → Avanzado → "Mostrar menú de Desarrollador"
2. Ve a Desarrollador → Vaciar cachés
3. Recarga la página con **Cmd+Option+R**

## 🔧 Solución Rápida (Forzar Actualización)

Si no quieres limpiar todo el caché, puedes forzar la actualización del Service Worker:

1. Abre las **Herramientas de Desarrollador** (F12)
2. Ve a la pestaña **Application** (Chrome) o **Storage** (Firefox)
3. Busca **Service Workers**
4. Haz clic en **Update** (Actualizar) o **Unregister** (Desregistrar)
5. Recarga la página con **Ctrl+Shift+R** o **Cmd+Shift+R**

## ✅ Verificar que Funciona

Después de limpiar el caché, deberías ver:
- ✅ Los botones de "📷 Frontal", "📷 Lateral", "📷 Trasera" en la página de Progreso
- ✅ El modal de cámara en pantalla completa en móvil
- ✅ El video de la cámara visible y funcionando
- ✅ Los entrenamientos guardándose en el calendario

## 🐛 Si Sigue Sin Funcionar

1. Verifica la consola del navegador (F12 → Console) para ver errores
2. Asegúrate de que estás usando HTTPS (la cámara requiere HTTPS)
3. Verifica que has dado permisos de cámara al navegador
4. Intenta en modo incógnito para descartar extensiones

## 📝 Notas Técnicas

- El Service Worker ahora usa la versión `v1.0.4`
- Los archivos JS nuevos están incluidos en el caché
- Se usa estrategia "Network First" para archivos JS/HTML (siempre obtiene la versión más reciente)
- Se usa estrategia "Cache First" para assets estáticos (imágenes, CSS)

