# 🔧 Instrucciones de Debug - Nuevas Features

## 🐛 Problema Reportado
- No se guardan entrenamientos
- No se ven las features (cámara, etc.)

## ✅ Soluciones Aplicadas

### 1. **Inicialización de Componentes Corregida**
- Los managers ahora se crean explícitamente cuando se carga la página de progreso
- Se añadieron logs de depuración para verificar la inicialización

### 2. **Guardado de Entrenamientos Mejorado**
- Los entrenamientos ahora se guardan directamente en localStorage
- Se disparan eventos en `window` y `document`
- El calendario carga entrenamientos de múltiples fuentes (últimos 30 días)

### 3. **Integración con Running**
- Añadida función `saveRun()` para guardar carreras
- Integrado con el calendario

## 🔍 Cómo Verificar que Funciona

### **Paso 1: Abrir la Consola del Navegador (F12)**

### **Paso 2: Ir a la Página de Progreso**
1. Click en "📊 Mi Progreso" desde el dashboard o perfil
2. En la consola deberías ver:
   ```
   📊 Inicializando página de progreso...
   📸 ProgressPhotosManager: Constructor llamado
   📏 BodyMeasurementsManager: Constructor llamado
   📅 WorkoutCalendarManager: Constructor llamado
   📸 ProgressPhotosManager: Renderizando...
   ```

### **Paso 3: Verificar que los Componentes se Renderizan**
- Deberías ver los botones de "📷 Frontal", "📷 Lateral", "📷 Trasera" en el tab de Fotos
- Deberías ver el botón "➕ Añadir Medidas" en el tab de Medidas
- Deberías ver el calendario en el tab de Calendario

### **Paso 4: Probar la Cámara**
1. Ir al tab "📸 Fotos"
2. Click en "📷 Frontal" (o cualquier otro)
3. Debería pedir permisos de cámara
4. Si no funciona, verificar:
   - Estás en HTTPS o localhost
   - El navegador soporta la cámara
   - Los permisos están concedidos

### **Paso 5: Completar un Entrenamiento**
1. Ir a "💪 Gimnasio" o "⚡ Funcional"
2. Completar un entrenamiento
3. En la consola deberías ver:
   ```
   🏋️ Disparando evento workout-completed: {...}
   💾 Entrenamiento guardado en localStorage para calendario
   📅 Calendario: Recibido evento workout-completed
   📅 Calendario: Nuevo entrenamiento añadido
   ```

### **Paso 6: Verificar en el Calendario**
1. Ir a "📊 Mi Progreso" → Tab "📅 Calendario"
2. Deberías ver el entrenamiento en el día de hoy (día marcado con borde)
3. El día debería tener un color (verde claro, medio u oscuro según intensidad)

## 🛠️ Comandos de Debug en Consola

### **Ver entrenamientos guardados:**
```javascript
JSON.parse(localStorage.getItem('entrenoapp_workout_history') || '[]')
```

### **Ver fotos guardadas:**
```javascript
JSON.parse(localStorage.getItem('entrenoapp_progress_photos') || '[]')
```

### **Ver medidas guardadas:**
```javascript
JSON.parse(localStorage.getItem('entrenoapp_body_measurements') || '[]')
```

### **Verificar que los managers existen:**
```javascript
console.log('ProgressPhotosManager:', window.ProgressPhotosManager);
console.log('BodyMeasurementsManager:', window.BodyMeasurementsManager);
console.log('WorkoutCalendarManager:', window.WorkoutCalendarManager);
```

### **Forzar renderizado manual:**
```javascript
// Si los componentes no se renderizan automáticamente
if (window.progressPhotosManager) {
    window.progressPhotosManager.render();
}
if (window.bodyMeasurementsManager) {
    window.bodyMeasurementsManager.render();
}
if (window.workoutCalendarManager) {
    window.workoutCalendarManager.render();
}
```

### **Simular un entrenamiento completado:**
```javascript
window.dispatchEvent(new CustomEvent('workout-completed', {
    detail: {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        type: 'gym',
        duration: 2700, // 45 minutos en segundos
        intensity: 'medium',
        exercises: ['Sentadilla', 'Press banca'],
        notes: 'Entrenamiento de prueba'
    }
}));
```

## ⚠️ Problemas Comunes

### **1. "Contenedor no encontrado"**
- **Causa:** La página no se ha cargado completamente
- **Solución:** Esperar a que se cargue la página o forzar renderizado manual

### **2. "Cámara no disponible"**
- **Causa:** No estás en HTTPS o el navegador no soporta la cámara
- **Solución:** Usar HTTPS o localhost, verificar permisos

### **3. "No se guardan entrenamientos"**
- **Causa:** Los eventos no se están disparando
- **Solución:** Verificar en consola si se disparan los eventos, verificar localStorage

### **4. "Calendario vacío"**
- **Causa:** No hay entrenamientos guardados
- **Solución:** Completar un entrenamiento primero, o verificar localStorage

## 📝 Checklist de Verificación

- [ ] Los scripts se cargan (verificar en Network tab)
- [ ] Los managers se crean (ver logs en consola)
- [ ] Los contenedores existen (verificar en Elements)
- [ ] Los componentes se renderizan (ver UI)
- [ ] La cámara funciona (probar en móvil o con permisos)
- [ ] Los entrenamientos se guardan (verificar localStorage)
- [ ] El calendario muestra entrenamientos (ver heatmap)

## 🚀 Si Aún No Funciona

1. **Limpiar caché del navegador**
2. **Recargar la página con Ctrl+Shift+R (o Cmd+Shift+R en Mac)**
3. **Verificar que los archivos se hayan guardado correctamente**
4. **Revisar la consola para errores específicos**

---

*Última actualización: 10 de Noviembre, 2025*

