# 🔧 Solución de Problemas de Caché

## Problema: Versión Antigua en el Navegador

Si ves la versión anterior en el navegador del ordenador, es un problema de caché.

## Soluciones:

### **1. Limpiar Caché del Navegador**

#### Chrome/Edge:
1. Presiona `Ctrl + Shift + Delete` (Windows) o `Cmd + Shift + Delete` (Mac)
2. Selecciona "Caché" o "Imágenes y archivos en caché"
3. Selecciona "Última hora" o "Todo el tiempo"
4. Click en "Borrar datos"

#### Firefox:
1. Presiona `Ctrl + Shift + Delete` (Windows) o `Cmd + Shift + Delete` (Mac)
2. Selecciona "Caché"
3. Click en "Limpiar ahora"

#### Safari:
1. Presiona `Cmd + Option + E` para limpiar caché
2. O ve a Safari > Preferencias > Avanzado > "Mostrar menú Desarrollar"
3. Click en "Vaciar cachés"

### **2. Recarga Forzada (Hard Refresh)**

- **Windows/Linux:** `Ctrl + Shift + R` o `Ctrl + F5`
- **Mac:** `Cmd + Shift + R`

### **3. Modo Incógnito/Privado**

Abre la app en modo incógnito para evitar caché:
- **Chrome:** `Ctrl + Shift + N` (Windows) o `Cmd + Shift + N` (Mac)
- **Firefox:** `Ctrl + Shift + P` (Windows) o `Cmd + Shift + P` (Mac)
- **Safari:** `Cmd + Shift + N`

### **4. Desactivar Caché en DevTools**

1. Abre DevTools (F12)
2. Ve a la pestaña "Network" o "Red"
3. Marca la casilla "Disable cache" o "Desactivar caché"
4. Mantén DevTools abierto mientras navegas

### **5. Limpiar Service Worker (PWA)**

Si la app está instalada como PWA:

1. Abre DevTools (F12)
2. Ve a la pestaña "Application" o "Aplicación"
3. En el menú lateral, busca "Service Workers"
4. Click en "Unregister" o "Anular registro"
5. Recarga la página

### **6. Verificar que los Archivos se Hayan Actualizado**

En DevTools:
1. Ve a la pestaña "Network" o "Red"
2. Recarga la página (F5)
3. Busca los archivos JS (progress-photos.js, body-measurements.js, workout-calendar.js)
4. Verifica que la fecha de modificación sea reciente
5. Si ves "304 Not Modified", el navegador está usando caché

## Para Móviles:

### **Android (Chrome):**
1. Abre Chrome
2. Ve a Configuración > Privacidad > Borrar datos de navegación
3. Selecciona "Caché" y "Cookies"
4. Click en "Borrar datos"

### **iOS (Safari):**
1. Ve a Configuración > Safari
2. Click en "Borrar historial y datos de sitios web"
3. Confirma

## Verificar que Funciona:

Después de limpiar caché, deberías ver:

1. **En la consola:**
   ```
   📊 Inicializando página de progreso...
   📸 ProgressPhotosManager: Constructor llamado
   ```

2. **En la página de progreso:**
   - Botones grandes y visibles: "📷 Frontal", "📷 Lateral", "📷 Trasera"
   - Tabs: "📋 Lista", "⚖️ Comparar", "📅 Timeline"
   - Estilos glassmorphism aplicados

3. **Al hacer click en un botón de cámara:**
   - Debería pedir permisos de cámara
   - O abrir el selector de archivos (si no hay cámara)

## Si Aún No Funciona:

1. Verifica que los archivos se hayan guardado correctamente
2. Verifica que el servidor esté sirviendo los archivos nuevos
3. Revisa la consola para errores
4. Intenta en otro navegador

---

*Última actualización: 10 de Noviembre, 2025*

