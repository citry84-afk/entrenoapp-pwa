# 💪 EntrenoApp - Tu Entrenador Personal

**Una Progressive Web App (PWA) de fitness integral desarrollada por LIPA Studios**

## 🚀 Características Principales

### 🏃 Running
- **Planes desde nivel 0**: De no correr nada hasta maratón completo
- **GPS tracking**: Con OpenStreetMap para seguimiento de rutas
- **Audio coaching**: TTS dinámico con tu nombre personalizado
- **Métricas completas**: Distancia, tiempo, pace, calorías

### 💪 Entrenamiento de Fuerza
- **Gimnasio tradicional**: 20 ejercicios básicos por grupo muscular
- **Seguimiento de progreso**: Peso, repeticiones y series
- **Videos integrados**: Enlaces directos a YouTube
- **Sugerencias inteligentes**: Basadas en tu historial

### ⚡ CrossFit/Funcional
- **WODs famosos**: Heroes, CrossFit Games, Open
- **Temporizadores**: Para AMRAPs, EMOMs, y For Time
- **Escalamiento automático**: Adaptado a tu nivel
- **Base de datos completa**: Movimientos y técnicas

### 🏆 Gamificación
- **Retos diarios**: Adaptados a tu nivel y progreso
- **Sistema de logros**: Desbloquea badges y niveles
- **Ranking social**: Compite con amigos de forma saludable
- **Progresión visual**: Seguimiento motivacional

## 🎨 Diseño
- **Glassmorphism**: Estilo Apple moderno y elegante
- **Mobile-first**: Optimizado para dispositivos móviles
- **PWA completa**: Se instala como app nativa
- **Modo offline**: Funciona sin conexión por hasta 1 semana

## 🔧 Tecnologías

### Frontend
- **HTML5/CSS3/JavaScript**: Vanilla, sin frameworks pesados
- **PWA**: Service Workers, Web App Manifest
- **Glassmorphism CSS**: Efectos visuales modernos
- **Responsive Design**: Adaptable a todos los dispositivos

### Backend
- **Firebase**: Firestore, Authentication, Analytics
- **OpenStreetMap**: Mapas y tracking GPS
- **Web Speech API**: TTS para audio coaching
- **YouTube API**: Integración de videos

### Monetización
- **Google AdSense**: Banners discretos e intersticiales
- **Anuncios bonificados**: Recompensas por ver ads
- **Analytics**: G-633RQLC6T0

## 🏗️ Estructura del Proyecto

```
entrenoapp HTML/
├── index.html              # Página principal
├── manifest.json          # PWA manifest
├── sw.js                  # Service Worker
├── offline.html           # Página offline
├── css/
│   ├── styles.css         # Estilos principales
│   ├── glassmorphism.css  # Efectos glassmorphism
│   ├── auth.css          # Estilos de autenticación
│   └── dashboard.css     # Estilos del dashboard
├── js/
│   ├── app.js            # Aplicación principal
│   ├── config/
│   │   └── firebase-config.js
│   ├── auth/
│   │   └── auth.js       # Sistema de autenticación
│   ├── components/
│   │   ├── dashboard.js  # Dashboard principal
│   │   ├── workouts.js   # Entrenamientos
│   │   ├── running.js    # Running
│   │   ├── challenges.js # Retos
│   │   └── profile.js    # Perfil
│   └── data/
│       ├── exercises.js     # Base de datos ejercicios
│       ├── crossfit-wods.js # WODs de CrossFit
│       └── running-plans.js # Planes de carrera
└── assets/
    └── icons/            # Iconos PWA
```

## 🚀 Cómo Usar

### 1. Instalación Local
```bash
# Clonar o descargar el proyecto
cd "entrenoapp HTML"

# Servir con cualquier servidor HTTP
python3 -m http.server 8000
# o
npx serve .
# o
live-server
```

### 2. Configuración de Firebase
1. Crear proyecto en Firebase Console
2. Habilitar Authentication (Email, Google)
3. Crear base de datos Firestore
4. Actualizar `js/config/firebase-config.js` con tus credenciales

### 3. Instalación como PWA
1. Abrir en navegador móvil
2. "Agregar a pantalla de inicio"
3. ¡Listo! Se comporta como app nativa

## 📱 Funcionalidades PWA

### ✅ Implementadas
- [x] **Service Worker**: Caché inteligente y offline
- [x] **Web App Manifest**: Instalable como app
- [x] **Responsive Design**: Funciona en todos los dispositivos
- [x] **Offline Support**: Hasta 1 semana sin conexión
- [x] **Background Sync**: Sincronización automática
- [x] **Push Notifications**: Notificaciones nativas

### 🔄 En Desarrollo
- [ ] **Background GPS**: Tracking en segundo plano
- [ ] **Apple Sign-In**: Autenticación completa
- [ ] **Wearables**: Integración con smartwatches
- [ ] **Camera API**: Fotos de progreso
- [ ] **Payments**: Suscripciones premium

## 🎯 Roadmap

### Fase 1 (Actual) ✅
- [x] Estructura base PWA
- [x] Sistema de autenticación
- [x] Dashboard glassmorphism
- [x] Base de datos de ejercicios
- [x] WODs de CrossFit
- [x] Planes de running

### Fase 2 (Próxima)
- [ ] Componentes de entrenamientos
- [ ] Sistema de tracking GPS
- [ ] Audio coaching TTS
- [ ] Retos diarios
- [ ] Sistema social básico

### Fase 3 (Futuro)
- [ ] Inteligencia artificial
- [ ] Integración wearables
- [ ] Modo entrenador personal
- [ ] Competiciones globales

## 🛠️ Configuración de Desarrollo

### Prerrequisitos
- Navegador moderno (Chrome, Safari, Firefox)
- Servidor HTTP local
- Cuenta de Firebase (opcional para testing)

### Variables de Entorno
Actualizar en `firebase-config.js`:
```javascript
const firebaseConfig = {
    apiKey: "tu-api-key",
    authDomain: "tu-proyecto.firebaseapp.com",
    projectId: "tu-proyecto-id",
    // ... resto de configuración
};
```

## 📄 Licencia
Desarrollado por **LIPA Studios** para uso personal y comercial.

## 🤝 Contribuir
1. Fork del proyecto
2. Crear feature branch
3. Commit cambios
4. Push a la branch
5. Crear Pull Request

## 📞 Soporte
- **Email**: soporte@lipastudios.com
- **Web**: https://entrenoapp.com
- **GitHub**: Issues en este repositorio

---

**¡Comienza tu viaje fitness hoy mismo! 💪🚀**
