# 📺 Guía de Integración de YouTube con EntrenoApp

## 🎯 **Descripción**
Guía completa para integrar tus videos de YouTube con un slider automático en la web de EntrenoApp.

---

## 🚀 **Pasos para Configurar**

### **1. Obtener API Key de YouTube** (Opcional pero Recomendado)

#### **Para uso automático de videos:**

1. **Ve a Google Cloud Console:**
   - URL: https://console.cloud.google.com/apis/credentials

2. **Crea un nuevo proyecto:**
   - Click en "Crear Proyecto"
   - Nombre: "EntrenoApp YouTube"
   - Click en "Crear"

3. **Habilita YouTube Data API v3:**
   - Ve a "APIs y Servicios" > "Biblioteca"
   - Busca "YouTube Data API v3"
   - Click en "Habilitar"

4. **Crea credenciales API Key:**
   - Ve a "APIs y Servicios" > "Credenciales"
   - Click en "Crear Credenciales" > "Clave de API"
   - Copia tu API Key

### **2. Obtener Channel ID de YouTube**

#### **Método 1: Desde tu canal**
1. Ve a tu canal de YouTube
2. Click en "Sobre" o "About"
3. Scroll hasta "Detalles del canal"
4. Copia el "ID del canal" (formato: UCxxxxx...)

#### **Método 2: Desde un video**
1. Ve a cualquier video de tu canal
2. Click derecho > "Ver código fuente"
3. Busca "channelId"
4. Copia el valor

### **3. Configurar la Galería de YouTube**

Abre el archivo `youtube-gallery.html` y busca la sección:

```javascript
const YOUTUBE_CONFIG = {
    // 👇 REEMPLAZA ESTOS VALORES
    
    apiKey: 'TU_API_KEY_YOUTUBE',  // ← Pega tu API Key aquí
    channelId: 'TU_CHANNEL_ID',    // ← Pega tu Channel ID aquí
    channelUrl: 'https://youtube.com/@TU_CANAL',  // ← URL de tu canal
};
```

### **4. Configurar Videos Destacados (Slider)**

En el mismo archivo, busca:

```javascript
featuredVideos: [
    'VIDEO_ID_1',  // ← ID del primer video destacado
    'VIDEO_ID_2',  // ← ID del segundo video
    'VIDEO_ID_3'   // ← ID del tercer video
]
```

**Cómo obtener el ID de un video:**
- URL del video: `https://www.youtube.com/watch?v=VIDEO_ID`
- Solo copia la parte después de `v=`

**Ejemplo:**
```
URL: https://www.youtube.com/watch?v=dQw4w9WgXcQ
ID: dQw4w9WgXcQ
```

### **5. Modo sin API Key (Manual)**

Si no quieres usar la API, puedes añadir videos manualmente:

1. Obtén los IDs de tus videos favoritos
2. Edita la función `getManualVideos()` en el archivo:

```javascript
function getManualVideos() {
    return [
        {
            id: 'TU_VIDEO_ID_1',
            title: 'Título del Video 1',
            description: 'Descripción del video',
            category: 'fitness',
            thumbnail: `https://img.youtube.com/vi/TU_VIDEO_ID_1/maxresdefault.jpg`
        },
        {
            id: 'TU_VIDEO_ID_2',
            title: 'Título del Video 2',
            description: 'Descripción del video',
            category: 'nutricion',
            thumbnail: `https://img.youtube.com/vi/TU_VIDEO_ID_2/maxresdefault.jpg`
        }
        // Añade más videos aquí
    ];
}
```

---

## 🎨 **Uso del Componente Reutilizable**

### **Integrar en cualquier página:**

1. **Importa el componente:**
```html
<script src="js/components/youtube-gallery.js"></script>
```

2. **Crea un contenedor:**
```html
<div id="youtube-gallery"></div>
```

3. **Inicializa el componente:**
```javascript
const gallery = new YouTubeGallery({
    containerId: 'youtube-gallery',
    apiKey: 'TU_API_KEY',
    channelId: 'TU_CHANNEL_ID',
    channelUrl: 'https://youtube.com/@TU_CANAL',
    featuredVideos: ['VIDEO_ID_1', 'VIDEO_ID_2', 'VIDEO_ID_3'],
    maxVideos: 12,
    autoPlay: false,
    showThumbnails: true
});
```

---

## 📱 **Agregar a Páginas Existentes**

### **En el Blog (`blog.html`):**

Añade al final del archivo, antes de `</body>`:

```html
<section id="youtube-section" style="padding: 40px 20px;">
    <div id="youtube-gallery"></div>
</section>

<script src="js/components/youtube-gallery.js"></script>
<script>
    document.addEventListener('DOMContentLoaded', function() {
        new YouTubeGallery({
            containerId: 'youtube-gallery',
            featuredVideos: ['VIDEO_ID_1', 'VIDEO_ID_2'],
            maxVideos: 6
        });
    });
</script>
```

### **En el Dashboard de la App (`app.html`):**

Añade una sección de videos en el dashboard:

```html
<section class="dashboard-section">
    <h2>📺 Videos de Entrenamiento</h2>
    <div id="youtube-gallery"></div>
</section>

<script src="js/components/youtube-gallery.js"></script>
<script>
    // Inicializar después de que cargue la app
    setTimeout(() => {
        new YouTubeGallery({
            containerId: 'youtube-gallery',
            featuredVideos: ['VIDEO_ID_1', 'VIDEO_ID_2', 'VIDEO_ID_3'],
            maxVideos: 12,
            autoPlay: false
        });
    }, 1000);
</script>
```

---

## 🎯 **Características Implementadas**

### **✅ Slider Automático**
- Videos destacados en slider grande
- Navegación con botones anterior/siguiente
- Reproducción automática opcional

### **✅ Galería de Videos**
- Grid responsive con thumbnails
- Categorías y filtros
- Play icon en hover
- Click para reproducir

### **✅ Integraciones**
- Google Analytics tracking
- YouTube API v3
- Lazy loading de imágenes
- Responsive design

### **✅ Botón de Suscripción**
- Link directo a tu canal
- Estilo profesional
- Call-to-action prominente

---

## 🔧 **Configuraciones Avanzadas**

### **Personalizar Colores:**

Edita los estilos en el archivo:

```css
/* Color principal del tema */
.youtube-gallery-header h2 {
    color: #667eea;  /* Cambia este color */
}

/* Color del botón de YouTube */
.youtube-subscribe-btn {
    background: linear-gradient(135deg, #ff0000, #cc0000);  /* Rojo YouTube */
}
```

### **Límite de Videos:**

```javascript
const gallery = new YouTubeGallery({
    maxVideos: 12,  // Cambia este número
    // ...
});
```

### **Autoplay:**

```javascript
const gallery = new YouTubeGallery({
    autoPlay: true,  // true para autoplay, false para no
    // ...
});
```

---

## 📊 **Analytics y Tracking**

### **Google Analytics:**

Los eventos se trackean automáticamente:

```javascript
// Eventos automáticos:
{
    'event': 'video_play',
    'video_id': 'VIDEO_ID',
    'event_category': 'youtube',
    'event_label': 'slider' o 'gallery'
}
```

### **Ver métricas en Analytics:**

1. Ve a Google Analytics
2. Eventos > youtube > video_play
3. Analiza qué videos se reproducen más

---

## 🐛 **Solución de Problemas**

### **❌ Error: "API Key no válida"**
- Verifica que copiaste la API Key correctamente
- Asegúrate de que la API Key tenga acceso a YouTube Data API v3
- Verifica que no hay espacios extra

### **❌ Error: "Channel ID no encontrado"**
- Verifica que el Channel ID sea correcto (formato UCxxxxx...)
- Prueba obtener el ID de nuevo desde tu canal

### **❌ Videos no se cargan**
- Verifica tu conexión a internet
- Revisa la consola del navegador (F12) para errores
- Usa el modo manual si la API no funciona

### **❌ Slider no funciona**
- Verifica que los IDs de videos destacados sean correctos
- Asegúrate de tener al menos 1 video
- Revisa que el JavaScript se esté cargando

---

## 🚀 **Próximos Pasos**

### **1. Desplegar:**
```bash
git add .
git commit -mclosed "📺 Integración de YouTube implementada"
git push origin main
```

### **2. Verificar en producción:**
- Ve a: https://entrenoapp.netlify.app/youtube-gallery.html
- Verifica que los videos se cargan
- Prueba la navegación del slider

### **3. Promocionar:**
- Comparte el link en redes sociales
- Añade el link al menú de navegación
- Integra en otras páginas del sitio

---

## 📝 **Archivos Creados**

1. **`youtube-gallery.html`** - Página completa de galería de videos
2. **`js/components/youtube-gallery.js`** - Componente reutilizable
3. **`YOUTUBE-INTEGRATION-GUIDE.md`** - Esta guía

---

## 🎉 **¡Listo!**

Tu integración de YouTube está completa. Los usuarios ahora pueden:
- ✅ Ver videos destacados en slider
- ✅ Navegar por todos tus videos
- ✅ Suscribirse a tu canal
- ✅ Interactuar con contenido de calidad

**¿Necesitas ayuda?** Contacta a través de: lipastudios4@gmail.com

---

**Fecha:** 16 de Enero, 2025  
**Versión:** 1.0  
**Estado:** ✅ Completamente funcional
