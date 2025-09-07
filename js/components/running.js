// Componente de running de EntrenoApp
import { auth, db } from '../config/firebase-config.js';
import { runningPlans, getPlanById, calculatePace, calculateTime } from '../data/running-plans.js';

// Estado del componente de running
let runningState = {
    currentMode: 'select', // 'select', 'plan', 'active', 'finished'
    selectedPlan: null,
    currentRun: null,
    isTracking: false,
    startTime: null,
    watchId: null,
    route: [],
    distance: 0,
    pace: 0,
    calories: 0,
    map: null,
    userMarker: null,
    routePolyline: null,
    intervalId: null,
    wakeLock: null,
    isVoiceEnabled: true,
    lastVoiceAnnouncement: 0
};

// Inicializar componente de running
window.initRunning = function() {
    console.log('🏃 Inicializando running');
    renderRunningPage();
    setupRunningListeners();
};

// Renderizar página principal de running
function renderRunningPage() {
    const container = document.querySelector('.running-container');
    if (!container) return;
    
    let content = '';
    
    switch (runningState.currentMode) {
        case 'select':
            content = renderRunningSelection();
            break;
        case 'plan':
            content = renderPlanView();
            break;
        case 'active':
            content = renderActiveRun();
            break;
        case 'finished':
            content = renderRunSummary();
            break;
        default:
            content = renderRunningSelection();
    }
    
    container.innerHTML = content;
    
    // Inicializar mapa si estamos en modo activo
    if (runningState.currentMode === 'active') {
        setTimeout(initializeMap, 100);
    }
    
    // Añadir animaciones
    const cards = container.querySelectorAll('.glass-card');
    cards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
        card.classList.add('glass-fade-in');
    });
}

// Selección principal de running
function renderRunningSelection() {
    return `
        <div class="running-selection">
            <div class="run-types-grid">
                <div class="run-type-card glass-card glass-gradient-blue" onclick="startFreeRun()">
                    <div class="run-type-icon">🏃</div>
                    <h3 class="run-type-title">Carrera Libre</h3>
                    <p class="run-type-description">
                        Sal a correr sin plan específico. Rastrea tu ruta y métricas.
                    </p>
                    <div class="run-type-features">
                        <span class="feature-item">🗺️ GPS Tracking</span>
                        <span class="feature-item">📊 Métricas en tiempo real</span>
                        <span class="feature-item">🎵 Audio coaching</span>
                    </div>
                </div>
                
                <div class="run-type-card glass-card glass-gradient-green" onclick="selectRunningPlans()">
                    <div class="run-type-icon">📋</div>
                    <h3 class="run-type-title">Planes de Entrenamiento</h3>
                    <p class="run-type-description">
                        Sigue un plan estructurado desde 0 hasta maratón.
                    </p>
                    <div class="run-type-features">
                        <span class="feature-item">🎯 Objetivos claros</span>
                        <span class="feature-item">📈 Progresión gradual</span>
                        <span class="feature-item">🏁 Desde 0 a maratón</span>
                    </div>
                </div>
                
                <div class="run-type-card glass-card glass-gradient-orange" onclick="selectIntervalTraining()">
                    <div class="run-type-icon">⚡</div>
                    <h3 class="run-type-title">Entrenamientos por Intervalos</h3>
                    <p class="run-type-description">
                        Mejora velocidad y resistencia con intervalos estructurados.
                    </p>
                    <div class="run-type-features">
                        <span class="feature-item">🔥 Alta intensidad</span>
                        <span class="feature-item">⏱️ Intervalos guiados</span>
                        <span class="feature-item">🚀 Mejora rápida</span>
                    </div>
                </div>
            </div>
            
            <div class="recent-runs glass-card mt-lg">
                <div class="card-header">
                    <h3 class="card-title">🏃 Carreras Recientes</h3>
                    <button class="glass-button glass-button-sm" onclick="viewAllRuns()">
                        Ver Todas
                    </button>
                </div>
                
                <div class="recent-runs-list">
                    ${renderRecentRuns()}
                </div>
            </div>
            
            <div class="running-stats glass-card mt-lg">
                <div class="card-header">
                    <h3 class="card-title">📊 Estadísticas del Mes</h3>
                </div>
                
                <div class="stats-grid">
                    <div class="stat-item">
                        <div class="stat-value">24.8</div>
                        <div class="stat-label">km totales</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">8</div>
                        <div class="stat-label">carreras</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">5:32</div>
                        <div class="stat-label">pace promedio</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">1,240</div>
                        <div class="stat-label">calorías</div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Vista de carrera activa
function renderActiveRun() {
    return `
        <div class="active-run">
            <div class="run-header glass-header">
                <div class="run-info">
                    <h2 class="run-title">${runningState.currentRun?.name || 'Carrera Libre'}</h2>
                    <div class="run-status">
                        ${runningState.isTracking ? '🔴 Grabando' : '⏸️ Pausado'}
                    </div>
                </div>
                <div class="run-controls">
                    <button class="glass-button control-btn" onclick="toggleRunning()">
                        ${runningState.isTracking ? '⏸️' : '▶️'}
                    </button>
                    <button class="glass-button control-btn" onclick="stopRun()">
                        ⏹️
                    </button>
                </div>
            </div>
            
            <div class="run-metrics glass-card">
                <div class="metrics-grid">
                    <div class="metric-item">
                        <div class="metric-value" id="distance-value">${(runningState.distance / 1000).toFixed(2)}</div>
                        <div class="metric-label">km</div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-value" id="time-value">${formatRunTime(getElapsedTime())}</div>
                        <div class="metric-label">tiempo</div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-value" id="pace-value">${formatPace(runningState.pace)}</div>
                        <div class="metric-label">pace</div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-value" id="calories-value">${runningState.calories}</div>
                        <div class="metric-label">cal</div>
                    </div>
                </div>
            </div>
            
            <div class="run-map glass-card">
                <div id="running-map" style="height: 300px; border-radius: 12px; overflow: hidden;"></div>
            </div>
            
            <div class="run-controls-extended glass-card">
                <div class="controls-grid">
                    <button class="glass-button" onclick="toggleVoiceCoaching()">
                        ${runningState.isVoiceEnabled ? '🔊' : '🔇'} Audio
                    </button>
                    <button class="glass-button" onclick="addWaypoint()">
                        📍 Waypoint
                    </button>
                    <button class="glass-button" onclick="shareRun()">
                        📤 Compartir
                    </button>
                    <button class="glass-button" onclick="emergencyStop()">
                        🚨 Emergencia
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Resumen de carrera
function renderRunSummary() {
    if (!runningState.currentRun) return '';
    
    const run = runningState.currentRun;
    const avgPace = formatPace(run.avgPace || 0);
    const totalTime = formatRunTime(run.duration || 0);
    
    return `
        <div class="run-summary">
            <div class="summary-header glass-card glass-gradient-green">
                <div class="summary-icon">🏃</div>
                <h2 class="summary-title">¡Carrera Completada!</h2>
                <p class="summary-subtitle">Gran trabajo, sigue así 💪</p>
            </div>
            
            <div class="summary-stats glass-card">
                <div class="summary-stats-grid">
                    <div class="summary-stat">
                        <div class="summary-stat-value">${(run.distance / 1000).toFixed(2)}</div>
                        <div class="summary-stat-label">Kilómetros</div>
                    </div>
                    <div class="summary-stat">
                        <div class="summary-stat-value">${totalTime}</div>
                        <div class="summary-stat-label">Tiempo Total</div>
                    </div>
                    <div class="summary-stat">
                        <div class="summary-stat-value">${avgPace}</div>
                        <div class="summary-stat-label">Pace Promedio</div>
                    </div>
                    <div class="summary-stat">
                        <div class="summary-stat-value">${run.calories || 0}</div>
                        <div class="summary-stat-label">Calorías</div>
                    </div>
                </div>
            </div>
            
            <div class="summary-map glass-card">
                <h3 class="card-title">🗺️ Tu Ruta</h3>
                <div id="summary-map" style="height: 250px; border-radius: 12px; overflow: hidden;"></div>
            </div>
            
            <div class="summary-achievements glass-card">
                <h3 class="card-title">🏆 Logros de Esta Carrera</h3>
                <div class="achievements-list">
                    <div class="achievement-item">
                        <span class="achievement-icon">⭐</span>
                        <span class="achievement-text">Carrera completada</span>
                    </div>
                    ${run.distance > 5000 ? '<div class="achievement-item"><span class="achievement-icon">🎯</span><span class="achievement-text">Más de 5K corridos</span></div>' : ''}
                    ${run.duration > 1800 ? '<div class="achievement-item"><span class="achievement-icon">⏰</span><span class="achievement-text">Más de 30 minutos activo</span></div>' : ''}
                </div>
            </div>
            
            <div class="summary-actions glass-card">
                <div class="actions-grid">
                    <button class="glass-button glass-button-primary" onclick="saveRun()">
                        💾 Guardar Carrera
                    </button>
                    <button class="glass-button" onclick="shareRunResults()">
                        📤 Compartir Resultados
                    </button>
                    <button class="glass-button" onclick="startNewRun()">
                        🏃 Nueva Carrera
                    </button>
                    <button class="glass-button" onclick="backToRunningHome()">
                        🏠 Volver al Inicio
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Renderizar carreras recientes
function renderRecentRuns() {
    const recentRuns = getRecentRuns();
    
    if (recentRuns.length === 0) {
        return `
            <div class="no-runs">
                <p class="no-runs-text">Aún no has registrado ninguna carrera</p>
                <button class="glass-button glass-button-primary" onclick="startFreeRun()">
                    🏃 ¡Empezar Primera Carrera!
                </button>
            </div>
        `;
    }
    
    return recentRuns.map(run => `
        <div class="recent-run-item" onclick="viewRun('${run.id}')">
            <div class="run-date">${formatDate(run.date)}</div>
            <div class="run-details">
                <span class="run-distance">${(run.distance / 1000).toFixed(1)} km</span>
                <span class="run-time">${formatRunTime(run.duration)}</span>
                <span class="run-pace">${formatPace(run.avgPace)}</span>
            </div>
        </div>
    `).join('');
}

// Configurar listeners del running
function setupRunningListeners() {
    // Verificar permisos de geolocalización
    checkGeolocationPermission();
    
    // Actualizar métricas cada segundo
    if (runningState.currentMode === 'active') {
        runningState.intervalId = setInterval(updateRunMetrics, 1000);
    }
}

// Funciones de navegación
window.startFreeRun = function() {
    console.log('🏃 Iniciando carrera libre');
    
    runningState.currentRun = {
        id: 'free_run_' + Date.now(),
        name: 'Carrera Libre',
        type: 'free',
        startTime: Date.now(),
        distance: 0,
        duration: 0,
        calories: 0,
        route: []
    };
    
    runningState.currentMode = 'active';
    runningState.distance = 0;
    runningState.pace = 0;
    runningState.calories = 0;
    runningState.route = [];
    
    renderRunningPage();
    startGPSTracking();
    
    // Anuncio de inicio con TTS
    if (window.EntrenoTTS && runningState.isVoiceEnabled) {
        window.EntrenoTTS.announceRunStart();
    }
};

window.selectRunningPlans = function() {
    console.log('📋 Seleccionando planes de running');
    // Implementar navegación a planes
    showToast('Planes de running próximamente', 'info');
};

window.selectIntervalTraining = function() {
    console.log('⚡ Seleccionando entrenamientos por intervalos');
    // Implementar entrenamientos por intervalos
    showToast('Entrenamientos por intervalos próximamente', 'info');
};

// Funciones de GPS
function checkGeolocationPermission() {
    if (!navigator.geolocation) {
        showToast('Geolocalización no disponible en este dispositivo', 'error');
        return false;
    }
    return true;
}

function startGPSTracking() {
    if (!checkGeolocationPermission()) return;
    
    const options = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
    };
    
    runningState.watchId = navigator.geolocation.watchPosition(
        handleLocationUpdate,
        handleLocationError,
        options
    );
    
    runningState.isTracking = true;
    runningState.startTime = Date.now();
    
    // Mantener pantalla encendida
    enableWakeLock();
    
    showToast('GPS activado - Rastreando posición', 'success');
}

function handleLocationUpdate(position) {
    const { latitude, longitude, accuracy } = position.coords;
    
    // Filtrar coordenadas con poca precisión
    if (accuracy > 50) return;
    
    const newPoint = {
        lat: latitude,
        lng: longitude,
        timestamp: Date.now(),
        accuracy: accuracy
    };
    
    // Calcular distancia si no es el primer punto
    if (runningState.route.length > 0) {
        const lastPoint = runningState.route[runningState.route.length - 1];
        const distance = calculateDistance(lastPoint, newPoint);
        
        // Filtrar puntos muy cercanos (menos de 5 metros)
        if (distance < 5) return;
        
        runningState.distance += distance;
    }
    
    runningState.route.push(newPoint);
    
    // Actualizar mapa
    updateMapPosition(newPoint);
    updateRouteOnMap();
    
    // Calcular pace
    const elapsedTime = getElapsedTime();
    if (elapsedTime > 0 && runningState.distance > 0) {
        runningState.pace = (elapsedTime / 60) / (runningState.distance / 1000); // min/km
    }
    
    // Calcular calorías (estimación simple)
    runningState.calories = Math.floor((runningState.distance / 1000) * 70); // aprox 70 cal/km
    
    // Audio coaching cada kilómetro
    const currentKm = Math.floor(runningState.distance / 1000);
    if (currentKm > runningState.lastVoiceAnnouncement && runningState.isVoiceEnabled) {
        announceProgress(currentKm);
        runningState.lastVoiceAnnouncement = currentKm;
    }
}

function handleLocationError(error) {
    console.error('Error GPS:', error);
    
    let message = 'Error de GPS';
    switch (error.code) {
        case error.PERMISSION_DENIED:
            message = 'Permiso de GPS denegado';
            break;
        case error.POSITION_UNAVAILABLE:
            message = 'Posición GPS no disponible';
            break;
        case error.TIMEOUT:
            message = 'Timeout de GPS';
            break;
    }
    
    showToast(message, 'error');
}

// Funciones de mapa
function initializeMap() {
    if (!window.L) {
        console.error('Leaflet no está cargado');
        return;
    }
    
    // Obtener posición actual para centrar el mapa
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            
            runningState.map = L.map('running-map').setView([lat, lng], 16);
            
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(runningState.map);
            
            // Marcador del usuario
            runningState.userMarker = L.marker([lat, lng], {
                icon: L.divIcon({
                    className: 'user-location-marker',
                    html: '🏃',
                    iconSize: [30, 30]
                })
            }).addTo(runningState.map);
            
            // Inicializar polyline para la ruta
            runningState.routePolyline = L.polyline([], {
                color: '#007AFF',
                weight: 4,
                opacity: 0.8
            }).addTo(runningState.map);
            
        },
        (error) => {
            console.error('Error obteniendo posición inicial:', error);
            // Mapa por defecto en Madrid
            runningState.map = L.map('running-map').setView([40.4168, -3.7038], 13);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(runningState.map);
        }
    );
}

function updateMapPosition(position) {
    if (!runningState.map || !runningState.userMarker) return;
    
    const latLng = [position.lat, position.lng];
    
    // Actualizar marcador del usuario
    runningState.userMarker.setLatLng(latLng);
    
    // Centrar mapa en la nueva posición
    runningState.map.setView(latLng, runningState.map.getZoom());
}

function updateRouteOnMap() {
    if (!runningState.routePolyline || runningState.route.length < 2) return;
    
    const routePoints = runningState.route.map(point => [point.lat, point.lng]);
    runningState.routePolyline.setLatLngs(routePoints);
}

// Funciones de control
window.toggleRunning = function() {
    if (runningState.isTracking) {
        pauseRun();
    } else {
        resumeRun();
    }
};

function pauseRun() {
    if (runningState.watchId) {
        navigator.geolocation.clearWatch(runningState.watchId);
        runningState.watchId = null;
    }
    
    runningState.isTracking = false;
    disableWakeLock();
    
    showToast('Carrera pausada', 'info');
    renderRunningPage();
}

function resumeRun() {
    startGPSTracking();
    showToast('Carrera reanudada', 'success');
    renderRunningPage();
}

window.stopRun = function() {
    if (runningState.watchId) {
        navigator.geolocation.clearWatch(runningState.watchId);
        runningState.watchId = null;
    }
    
    if (runningState.intervalId) {
        clearInterval(runningState.intervalId);
        runningState.intervalId = null;
    }
    
    runningState.isTracking = false;
    
    // Finalizar datos de la carrera
    if (runningState.currentRun) {
        runningState.currentRun.distance = runningState.distance;
        runningState.currentRun.duration = getElapsedTime();
        runningState.currentRun.avgPace = runningState.pace;
        runningState.currentRun.calories = runningState.calories;
        runningState.currentRun.route = [...runningState.route];
        runningState.currentRun.endTime = Date.now();
    }
    
    disableWakeLock();
    
    // Anuncio de finalización con TTS
    if (window.EntrenoTTS && runningState.isVoiceEnabled && runningState.currentRun) {
        window.EntrenoTTS.announceRunComplete(
            runningState.currentRun.distance,
            runningState.currentRun.duration,
            runningState.currentRun.avgPace
        );
    }
    
    runningState.currentMode = 'finished';
    renderRunningPage();
};

// Audio coaching
function announceProgress(km) {
    if (!runningState.isVoiceEnabled) return;
    
    // Usar el sistema TTS integrado
    if (window.EntrenoTTS) {
        window.EntrenoTTS.announceDistance(km * 1000, runningState.pace, true);
    }
}

// Función de compatibilidad
function speak(text) {
    if (window.EntrenoTTS) {
        window.EntrenoTTS.speak(text);
    } else if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'es-ES';
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        utterance.volume = 0.8;
        
        speechSynthesis.speak(utterance);
    }
}

window.toggleVoiceCoaching = function() {
    runningState.isVoiceEnabled = !runningState.isVoiceEnabled;
    
    const message = runningState.isVoiceEnabled ? 
        'Audio coaching activado' : 'Audio coaching desactivado';
    
    showToast(message, 'info');
    renderRunningPage();
};

// Funciones de utilidad
function calculateDistance(point1, point2) {
    const R = 6371e3; // Radio de la Tierra en metros
    const φ1 = point1.lat * Math.PI/180;
    const φ2 = point2.lat * Math.PI/180;
    const Δφ = (point2.lat - point1.lat) * Math.PI/180;
    const Δλ = (point2.lng - point1.lng) * Math.PI/180;
    
    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    
    return R * c; // Distancia en metros
}

function getElapsedTime() {
    if (!runningState.startTime) return 0;
    return Math.floor((Date.now() - runningState.startTime) / 1000);
}

function formatRunTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
}

function formatPace(pace) {
    if (!pace || pace === 0) return '--:--';
    
    const minutes = Math.floor(pace);
    const seconds = Math.floor((pace - minutes) * 60);
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short'
    });
}

function updateRunMetrics() {
    // Actualizar elementos del DOM
    const distanceEl = document.getElementById('distance-value');
    const timeEl = document.getElementById('time-value');
    const paceEl = document.getElementById('pace-value');
    const caloriesEl = document.getElementById('calories-value');
    
    if (distanceEl) distanceEl.textContent = (runningState.distance / 1000).toFixed(2);
    if (timeEl) timeEl.textContent = formatRunTime(getElapsedTime());
    if (paceEl) paceEl.textContent = formatPace(runningState.pace);
    if (caloriesEl) caloriesEl.textContent = runningState.calories;
}

function getRecentRuns() {
    try {
        const runs = JSON.parse(localStorage.getItem('entrenoapp_runs') || '[]');
        return runs.slice(-5).reverse(); // Últimas 5 carreras
    } catch (error) {
        console.error('Error cargando carreras:', error);
        return [];
    }
}

function enableWakeLock() {
    if ('wakeLock' in navigator && window.keepScreenOn) {
        window.keepScreenOn().then(wakeLock => {
            runningState.wakeLock = wakeLock;
        });
    }
}

function disableWakeLock() {
    if (runningState.wakeLock && window.releaseScreenLock) {
        window.releaseScreenLock(runningState.wakeLock);
        runningState.wakeLock = null;
    }
}

// Funciones de guardado y compartir
window.saveRun = function() {
    if (!runningState.currentRun) return;
    
    try {
        const runs = JSON.parse(localStorage.getItem('entrenoapp_runs') || '[]');
        runs.push(runningState.currentRun);
        localStorage.setItem('entrenoapp_runs', JSON.stringify(runs));
        
        showToast('Carrera guardada exitosamente', 'success');
        
        // Volver al inicio
        setTimeout(() => {
            backToRunningHome();
        }, 1500);
        
    } catch (error) {
        console.error('Error guardando carrera:', error);
        showToast('Error guardando la carrera', 'error');
    }
};

window.shareRunResults = function() {
    if (!runningState.currentRun) return;
    
    const run = runningState.currentRun;
    const distance = (run.distance / 1000).toFixed(2);
    const time = formatRunTime(run.duration);
    const pace = formatPace(run.avgPace);
    
    const text = `¡Acabo de correr ${distance} km en ${time}! 🏃\nPace promedio: ${pace}\nCalorías quemadas: ${run.calories}\n\n#EntrenoApp #Running`;
    
    if (navigator.share) {
        navigator.share({
            title: 'Mi carrera en EntrenoApp',
            text: text
        });
    } else {
        // Fallback para copiar al portapapeles
        navigator.clipboard.writeText(text).then(() => {
            showToast('Resultado copiado al portapapeles', 'success');
        });
    }
};

window.startNewRun = function() {
    runningState.currentMode = 'select';
    runningState.currentRun = null;
    renderRunningPage();
};

window.backToRunningHome = function() {
    runningState.currentMode = 'select';
    runningState.currentRun = null;
    renderRunningPage();
};

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast glass-effect ${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

console.log('🏃 Componente Running cargado');
