# 🔧 Solución de Problemas - EntrenoApp

## Si no ves las mejoras después de actualizar

### Paso 1: Limpiar Caché del Navegador

**IMPORTANTE:** El Service Worker cachea archivos. Debes limpiar el caché para ver los cambios.

#### En Chrome/Edge (Desktop):
1. Abre las **Herramientas de Desarrollador** (F12)
2. Ve a **Application** → **Service Workers**
3. Haz clic en **Unregister** en el service worker
4. Ve a **Storage** → **Clear site data**
5. Marca todas las opciones y haz clic en **Clear site data**
6. Cierra las herramientas
7. Recarga con **Ctrl+Shift+R** (Windows) o **Cmd+Shift+R** (Mac)

#### En Móvil:
- **Chrome Android**: Configuración → Privacidad → Borrar datos de navegación → Caché
- **Safari iOS**: Configuración → Safari → Borrar historial y datos

### Paso 2: Verificar con el Diagnóstico

He añadido un script de diagnóstico automático. Para usarlo:

1. Abre la consola del navegador (F12 → Console)
2. Navega a la página de **Progreso** (desde el perfil o dashboard)
3. Espera 2-3 segundos
4. Verás un diagnóstico automático en la consola

O ejecuta manualmente:
```javascript
window.runDiagnostic()
```

### Paso 3: Revisar la Consola

La consola mostrará información detallada:

✅ **Si todo está bien:**
- Verás mensajes como "✅ ProgressPhotosManager creado"
- Verás "✅ Fotos renderizadas"
- El diagnóstico mostrará todo en verde

❌ **Si hay problemas:**
- Verás mensajes de error en rojo
- El diagnóstico mostrará qué falta

### Problemas Comunes y Soluciones

#### ❌ "ProgressPhotosManager no está disponible"
**Causa:** El script no se está cargando
**Solución:**
1. Verifica que `app.html` tenga esta línea:
   ```html
   <script type="module" src="js/components/progress-photos.js"></script>
   ```
2. Verifica que el archivo exista en `js/components/progress-photos.js`
3. Recarga la página con caché limpio

#### ❌ "progress-photos-container no encontrado"
**Causa:** La página no se ha cargado correctamente
**Solución:**
1. Navega a la página de Progreso desde el menú
2. Espera 1-2 segundos
3. Verifica que veas los tabs "📸 Fotos", "📏 Medidas", "📅 Calendario"

#### ❌ "No se puede acceder a la cámara"
**Causa:** Permisos o HTTPS
**Solución:**
1. Asegúrate de estar en HTTPS (no HTTP)
2. Da permisos de cámara al navegador
3. En móvil, verifica permisos en Configuración → Privacidad → Cámara

#### ❌ "Service Worker no se actualiza"
**Causa:** Caché persistente
**Solución:**
1. Desregistra el service worker (ver Paso 1)
2. Cierra todas las pestañas del sitio
3. Abre una nueva pestaña
4. Recarga con Ctrl+Shift+R

### Verificar que los Cambios se Aplicaron

1. **Service Worker:**
   - Abre F12 → Application → Service Workers
   - Debe mostrar versión `v1.0.4` o superior

2. **Archivos JS:**
   - Abre F12 → Network
   - Recarga la página
   - Busca `progress-photos.js`
   - Debe cargarse sin errores (código 200)

3. **Modal de Cámara:**
   - Ve a Progreso → Fotos
   - Haz clic en "📷 Frontal"
   - Debe abrirse un modal en pantalla completa (móvil) o centrado (desktop)
   - El video debe ser visible

### Si Nada Funciona

1. **Verifica la consola completa:**
   - Abre F12 → Console
   - Busca errores en rojo
   - Copia los mensajes de error

2. **Verifica la red:**
   - Abre F12 → Network
   - Recarga la página
   - Busca archivos con código 404 (no encontrado) o errores

3. **Prueba en modo incógnito:**
   - Abre una ventana incógnita
   - Ve a tu sitio
   - Esto descarta problemas de extensiones o caché

4. **Verifica los archivos:**
   - Asegúrate de que todos los archivos estén guardados
   - Verifica que no haya errores de sintaxis

### Contacto

Si después de seguir estos pasos sigues teniendo problemas, proporciona:
- Captura de pantalla de la consola (F12 → Console)
- Captura de pantalla del diagnóstico (`window.runDiagnostic()`)
- Qué navegador y versión estás usando
- Si es móvil o desktop


