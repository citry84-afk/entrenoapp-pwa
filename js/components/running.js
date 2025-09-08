// Componente de running con GPS real para EntrenoApp
import { auth, db } from '../config/firebase-config.js';
import { runningPlans, getPlanById } from '../data/running-plans.js';

// Estado global del running
let runningState = {
    currentMode: 'select', // 'select', 'active', 'finished'
    
    // Tracking GPS
    isTracking: false,
    startTime: null,
    endTime: null,
    watchId: null,
    route: [],
    lastPosition: null,
    
    // Métricas
    distance: 0, // metros
    duration: 0, // milisegundos
    pace: 0, // min/km actual
    avgPace: 0, // min/km promedio
    calories: 0,
    speed: 0, // km/h
    splits: [],
    
    // UI y mapa
    map: null,
    userMarker: null,
    routePolyline: null,
    intervalId: null,
    wakeLock: null,
    
    // Configuración
    targetDistance: null,
    targetTime: null,
    isVoiceEnabled: true,
    userWeight: 70,
    gpsAccuracy: 15,
    minDistanceUpdate: 5,
    
    // Estados
    isPaused: false,
    pausedTime: 0,
    pauseStart: null
};

// Constantes
const EARTH_RADIUS = 6371000;
const CALORIES_PER_KM_PER_KG = 1.036;

// Inicializar componente
window.initRunning = async function() {
    console.log('🏃‍♂️ Inicializando running GPS');
    if (window.debugLogger) {
        window.debugLogger.logInfo('RUNNING_INIT', 'Iniciando componente running');
    }
    
    try {
        console.log('📋 Cargando configuraciones...');
        await loadUserSettings();
        
        console.log('🎨 Renderizando página...');
        renderRunningPage();
        
        console.log('👂 Configurando listeners...');
        setupRunningListeners();
        
        console.log('📍 Inicializando GPS...');
        initializeGeolocation();
        
        console.log('✅ Running inicializado completamente');
        if (window.debugLogger) {
            window.debugLogger.logInfo('RUNNING_INIT_SUCCESS', 'Running inicializado correctamente');
        }
    } catch (error) {
        console.error('❌ Error inicializando running:', error);
        if (window.debugLogger) {
            window.debugLogger.logError('RUNNING_INIT_ERROR', 'Error en inicialización', { error });
        }
        throw error; // Re-throw para que se propague
    }
};

// Cargar configuraciones del usuario
async function loadUserSettings() {
    console.log('📋 Iniciando loadUserSettings...');
    try {
        console.log('👤 Verificando usuario autenticado...');
        if (!auth) {
            console.error('❌ Auth no disponible');
            return;
        }
        
        const user = auth.currentUser;
        console.log('👤 Usuario actual:', user ? user.email : 'No autenticado');
        
        if (user && window.getUserProfile) {
            console.log('📄 Cargando perfil de usuario...');
            const profile = await window.getUserProfile(user.uid);
            console.log('📄 Perfil obtenido:', profile ? 'Sí' : 'No');
            if (profile) {
                runningState.userWeight = profile.stats?.weight || 70;
                runningState.isVoiceEnabled = profile.preferences?.ttsEnabled !== false;
            }
        }
    } catch (error) {
        console.error('❌ Error cargando configuraciones:', error);
    }
}

// Renderizar página principal
function renderRunningPage() {
    console.log('🎨 Iniciando renderRunningPage...');
    const container = document.querySelector('.running-container');
    
    if (!container) {
        console.error('❌ Container .running-container no encontrado');
        return;
    }
    
    console.log('✅ Container encontrado, generando contenido...');
    let content = '';
    
    switch (runningState.currentMode) {
        case 'select':
            content = renderRunningSelection();
            break;
        case 'active':
            content = renderActiveRun();
            break;
        case 'finished':
            content = renderFinishedRun();
            break;
        default:
            content = renderRunningSelection();
    }
    
    container.innerHTML = content;
    
    // Inicializar mapa si es necesario
    setTimeout(() => {
        if (runningState.currentMode === 'active') {
            initializeMap();
        } else if (runningState.currentMode === 'finished') {
            initializeResultsMap();
        }
    }, 100);
}

// Renderizar selección de running
function renderRunningSelection() {
    return `
        <div class="running-selection glass-fade-in">
            <div class="running-header text-center mb-lg">
                <h2 class="page-title">🏃‍♂️ Running GPS</h2>
                <p class="page-subtitle text-secondary">Tracking profesional con OpenStreetMap</p>
            </div>
            
            <!-- Carrera libre -->
            <div class="quick-start glass-card mb-lg">
                <h3 class="section-title mb-md">🎯 Carrera Libre</h3>
                <div class="quick-options">
                    <button class="option-btn glass-button glass-button-primary" data-type="free">
                        <span class="option-icon">🏃</span>
                        <span class="option-text">Carrera libre</span>
                    </button>
                    <button class="option-btn glass-button glass-button-secondary" data-type="distance" data-target="5000">
                        <span class="option-icon">📍</span>
                        <span class="option-text">5K objetivo</span>
                    </button>
                    <button class="option-btn glass-button glass-button-secondary" data-type="time" data-target="1800000">
                        <span class="option-icon">⏱️</span>
                        <span class="option-text">30 min</span>
                    </button>
                </div>
            </div>
            
            <!-- Planes de entrenamiento -->
            <div class="running-plans glass-card mb-lg">
                <h3 class="section-title mb-md">📚 Planes de Entrenamiento</h3>
                <div class="plans-grid">
                    ${renderPlansList()}
                </div>
            </div>
            
            <!-- GPS Status -->
            <div class="gps-status glass-card">
                <h4 class="section-title mb-sm">📡 Estado GPS</h4>
                <div class="gps-info">
                    <div class="gps-indicator ${getGPSStatusClass()}" id="gps-indicator"></div>
                    <span class="gps-text" id="gps-text">${getGPSStatusText()}</span>
                </div>
                <button id="test-gps-btn" class="glass-button glass-button-outline btn-sm mt-sm">
                    Probar GPS
                </button>
            </div>
        </div>
    `;
}

// Renderizar lista de planes
function renderPlansList() {
    return runningPlans.slice(0, 4).map(plan => `
        <div class="plan-card glass-card-inner" data-plan-id="${plan.id}">
            <div class="plan-header">
                <h4 class="plan-title">${plan.name}</h4>
                <span class="plan-level ${plan.level}">${plan.level}</span>
            </div>
            <p class="plan-description">${plan.description}</p>
            <div class="plan-stats">
                <span class="stat">⏱️ ${plan.duration}</span>
                <span class="stat">📅 ${plan.frequency}</span>
            </div>
        </div>
    `).join('');
}

// Renderizar carrera activa
function renderActiveRun() {
    return `
        <div class="active-run glass-fade-in">
            <!-- Controles -->
            <div class="run-header glass-card mb-md">
                <div class="run-controls">
                    <button id="pause-btn" class="control-btn glass-button">
                        <span class="control-icon">${runningState.isPaused ? '▶️' : '⏸️'}</span>
                    </button>
                    <button id="stop-btn" class="control-btn glass-button glass-button-danger">
                        <span class="control-icon">⏹️</span>
                    </button>
                    <button id="voice-btn" class="control-btn glass-button ${runningState.isVoiceEnabled ? 'active' : ''}">
                        <span class="control-icon">${runningState.isVoiceEnabled ? '🔊' : '🔇'}</span>
                    </button>
                </div>
            </div>
            
            <!-- Métricas principales -->
            <div class="main-metrics glass-card mb-md">
                <div class="metric-grid">
                    <div class="metric-item main-metric">
                        <div class="metric-label">Distancia</div>
                        <div class="metric-value" id="distance-value">${formatDistance(runningState.distance)}</div>
                    </div>
                    <div class="metric-item main-metric">
                        <div class="metric-label">Tiempo</div>
                        <div class="metric-value" id="time-value">${formatDuration(runningState.duration)}</div>
                    </div>
                </div>
                <div class="pace-display">
                    <div class="pace-label">Ritmo Actual</div>
                    <div class="pace-value" id="pace-value">${formatPace(runningState.pace)}</div>
                </div>
            </div>
            
            <!-- Métricas secundarias -->
            <div class="secondary-metrics glass-card mb-md">
                <div class="metric-grid-2">
                    <div class="metric-item">
                        <div class="metric-label">Ritmo Medio</div>
                        <div class="metric-value" id="avg-pace-value">${formatPace(runningState.avgPace)}</div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-label">Velocidad</div>
                        <div class="metric-value" id="speed-value">${formatSpeed(runningState.speed)}</div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-label">Calorías</div>
                        <div class="metric-value" id="calories-value">${Math.round(runningState.calories)}</div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-label">GPS</div>
                        <div class="metric-value gps-status" id="gps-status">
                            <span class="gps-indicator ${getGPSStatusClass()}"></span>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Mapa -->
            <div class="map-container glass-card mb-md">
                <div id="run-map" class="run-map"></div>
                <div class="map-overlay">
                    <div class="map-stats">
                        <span class="map-stat">📍 ${runningState.route.length} puntos</span>
                        ${runningState.targetDistance ? `
                            <span class="map-stat">🎯 ${formatDistance(runningState.targetDistance - runningState.distance)} restantes</span>
                        ` : ''}
                    </div>
                </div>
            </div>
            
            <!-- Splits -->
            ${runningState.splits.length > 0 ? `
                <div class="splits-container glass-card">
                    <h4 class="splits-title">📊 Splits por KM</h4>
                    <div class="splits-list">
                        ${renderSplits()}
                    </div>
                </div>
            ` : ''}
        </div>
    `;
}

// Renderizar splits
function renderSplits() {
    return runningState.splits.map((split, index) => `
        <div class="split-item">
            <span class="split-km">KM ${index + 1}</span>
            <span class="split-time">${formatPace(split.pace)}</span>
            <span class="split-duration">${formatDuration(split.duration)}</span>
        </div>
    `).join('');
}

// Renderizar carrera finalizada
function renderFinishedRun() {
    const avgPace = runningState.distance > 0 ? (runningState.duration / 1000 / 60) / (runningState.distance / 1000) : 0;
    
    return `
        <div class="finished-run glass-fade-in">
            <div class="finish-header text-center mb-lg">
                <div class="finish-icon mb-md">🏆</div>
                <h2 class="finish-title">¡Carrera Completada!</h2>
                <p class="finish-subtitle text-secondary">Excelente trabajo</p>
            </div>
            
            <!-- Resumen -->
            <div class="run-summary glass-card mb-lg">
                <div class="summary-grid">
                    <div class="summary-stat">
                        <div class="stat-label">Distancia Total</div>
                        <div class="stat-value large">${formatDistance(runningState.distance)}</div>
                    </div>
                    <div class="summary-stat">
                        <div class="stat-label">Tiempo Total</div>
                        <div class="stat-value large">${formatDuration(runningState.duration)}</div>
                    </div>
                    <div class="summary-stat">
                        <div class="stat-label">Ritmo Promedio</div>
                        <div class="stat-value large">${formatPace(avgPace)}</div>
                    </div>
                    <div class="summary-stat">
                        <div class="stat-label">Calorías</div>
                        <div class="stat-value large">${Math.round(runningState.calories)}</div>
                    </div>
                </div>
            </div>
            
            <!-- Mapa de resultados -->
            <div class="results-map glass-card mb-lg">
                <div id="results-map" class="results-map"></div>
            </div>
            
            <!-- Acciones -->
            <div class="finish-actions">
                <button id="save-run-btn" class="glass-button glass-button-primary btn-full mb-sm">
                    💾 Guardar Carrera
                </button>
                <button id="share-run-btn" class="glass-button glass-button-secondary btn-full mb-sm">
                    📤 Compartir
                </button>
                <button id="new-run-btn" class="glass-button glass-button-outline btn-full">
                    🏃‍♂️ Nueva Carrera
                </button>
            </div>
        </div>
    `;
}

// ===================================
// FUNCIONES DE GPS Y TRACKING
// ===================================

// Inicializar geolocalización
function initializeGeolocation() {
    console.log('📍 Inicializando geolocalización...');
    if (!navigator.geolocation) {
        console.error('❌ Geolocalización no soportada');
        return;
    }
    console.log('✅ Geolocalización disponible');
    
    navigator.permissions.query({name: 'geolocation'}).then(result => {
        console.log('📍 Estado GPS:', result.state);
        updateGPSStatus(result.state);
    });
}

// Solicitar permisos de ubicación
async function requestLocationPermission() {
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                runningState.lastPosition = position;
                resolve(position);
            },
            (error) => {
                console.error('❌ Error GPS:', error);
                reject(error);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    });
}

// Iniciar tracking GPS
async function startTracking() {
    if (runningState.isTracking) return;
    
    console.log('📍 Iniciando tracking GPS');
    
    runningState.isTracking = true;
    runningState.startTime = Date.now();
    runningState.route = [];
    runningState.distance = 0;
    runningState.splits = [];
    runningState.pausedTime = 0;
    
    const options = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 1000
    };
    
    runningState.watchId = navigator.geolocation.watchPosition(
        handlePositionUpdate,
        handlePositionError,
        options
    );
    
    runningState.intervalId = setInterval(updateMetrics, 1000);
    
    // Habilitar wake lock
    if ('wakeLock' in navigator) {
        try {
            runningState.wakeLock = await navigator.wakeLock.request('screen');
        } catch (error) {
            console.warn('⚠️ Wake lock no disponible:', error);
        }
    }
}

// Manejar actualización de posición
function handlePositionUpdate(position) {
    const { latitude, longitude, accuracy } = position.coords;
    
    if (accuracy > runningState.gpsAccuracy) {
        console.warn(`⚠️ GPS poco preciso: ${accuracy}m`);
        return;
    }
    
    const newPoint = {
        lat: latitude,
        lng: longitude,
        accuracy,
        timestamp: position.timestamp,
        altitude: position.coords.altitude || 0
    };
    
    if (runningState.route.length > 0) {
        const lastPoint = runningState.route[runningState.route.length - 1];
        const segmentDistance = calculateDistance(lastPoint, newPoint);
        
        if (segmentDistance >= runningState.minDistanceUpdate) {
            runningState.distance += segmentDistance;
            runningState.route.push(newPoint);
            
            updateMapPosition(newPoint);
            updateRoutePolyline();
            checkKilometerSplit();
            checkDistanceTarget();
        }
    } else {
        runningState.route.push(newPoint);
        updateMapPosition(newPoint);
    }
    
    runningState.lastPosition = position;
    updateGPSStatus('granted');
}

// Manejar errores de posición
function handlePositionError(error) {
    console.error('❌ Error GPS:', error);
    updateGPSStatus('error');
    
    switch (error.code) {
        case error.PERMISSION_DENIED:
            showError('Permisos GPS denegados');
            break;
        case error.POSITION_UNAVAILABLE:
            showError('Ubicación no disponible');
            break;
        case error.TIMEOUT:
            console.warn('⚠️ Timeout GPS');
            break;
    }
}

// Actualizar métricas
function updateMetrics() {
    if (!runningState.isTracking || runningState.isPaused) return;
    
    const now = Date.now();
    runningState.duration = now - runningState.startTime - runningState.pausedTime;
    
    if (runningState.distance > 0 && runningState.duration > 0) {
        const durationMinutes = runningState.duration / 1000 / 60;
        const distanceKm = runningState.distance / 1000;
        
        runningState.avgPace = durationMinutes / distanceKm;
        runningState.speed = (distanceKm / durationMinutes) * 60;
        runningState.calories = distanceKm * runningState.userWeight * CALORIES_PER_KM_PER_KG;
        
        // Ritmo actual (últimos 30 segundos)
        const recentPoints = runningState.route.slice(-10);
        if (recentPoints.length >= 2) {
            const recentDistance = calculateTotalDistance(recentPoints);
            const recentTimeMs = recentPoints[recentPoints.length - 1].timestamp - recentPoints[0].timestamp;
            const recentTimeMin = recentTimeMs / 1000 / 60;
            if (recentTimeMin > 0 && recentDistance > 0) {
                runningState.pace = recentTimeMin / (recentDistance / 1000);
            }
        }
    }
    
    if (runningState.currentMode === 'active') {
        updateActiveRunUI();
    }
    
    checkTimeTarget();
}

// ===================================
// FUNCIONES DE CONTROL
// ===================================

// Iniciar carrera libre
async function startFreeRun() {
    console.log('🏃‍♂️ Iniciando carrera libre');
    
    try {
        await requestLocationPermission();
        
        runningState.currentMode = 'active';
        runningState.targetDistance = null;
        runningState.targetTime = null;
        
        await startTracking();
        renderRunningPage();
        
        if (runningState.isVoiceEnabled && window.EntrenoTTS) {
            window.EntrenoTTS.speak('¡Carrera iniciada! GPS activado.');
        }
        
    } catch (error) {
        console.error('❌ Error iniciando carrera:', error);
        showError('No se pudo iniciar el GPS. Verifica los permisos.');
    }
}

// Iniciar carrera con objetivo
async function startTargetRun(type, target) {
    console.log(`🎯 Iniciando carrera ${type}:`, target);
    
    try {
        await requestLocationPermission();
        
        runningState.currentMode = 'active';
        
        if (type === 'distance') {
            runningState.targetDistance = target;
        } else if (type === 'time') {
            runningState.targetTime = target;
        }
        
        await startTracking();
        renderRunningPage();
        
        if (runningState.isVoiceEnabled && window.EntrenoTTS) {
            const targetText = type === 'distance' 
                ? formatDistance(target)
                : formatDuration(target);
            window.EntrenoTTS.speak(`¡Carrera iniciada! Objetivo: ${targetText}`);
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
        showError('No se pudo iniciar el GPS.');
    }
}

// Pausar/reanudar
function togglePause() {
    if (runningState.isPaused) {
        runningState.isPaused = false;
        runningState.pausedTime += Date.now() - runningState.pauseStart;
        
        if (runningState.isVoiceEnabled && window.EntrenoTTS) {
            window.EntrenoTTS.speak('Carrera reanudada');
        }
    } else {
        runningState.isPaused = true;
        runningState.pauseStart = Date.now();
        
        if (runningState.isVoiceEnabled && window.EntrenoTTS) {
            window.EntrenoTTS.speak('Carrera pausada');
        }
    }
    
    const pauseBtn = document.getElementById('pause-btn');
    if (pauseBtn) {
        pauseBtn.querySelector('.control-icon').textContent = runningState.isPaused ? '▶️' : '⏸️';
    }
}

// Detener carrera
function stopRun() {
    console.log('⏹️ Deteniendo carrera');
    
    if (runningState.watchId) {
        navigator.geolocation.clearWatch(runningState.watchId);
        runningState.watchId = null;
    }
    
    if (runningState.intervalId) {
        clearInterval(runningState.intervalId);
        runningState.intervalId = null;
    }
    
    if (runningState.wakeLock) {
        runningState.wakeLock.release();
        runningState.wakeLock = null;
    }
    
    runningState.isTracking = false;
    runningState.endTime = Date.now();
    
    if (runningState.isVoiceEnabled && window.EntrenoTTS) {
        const announcement = `¡Carrera finalizada! Distancia: ${formatDistance(runningState.distance)}. Tiempo: ${formatDuration(runningState.duration)}`;
        window.EntrenoTTS.speak(announcement);
    }
    
    runningState.currentMode = 'finished';
    renderRunningPage();
}

// Alternar audio
function toggleVoice() {
    runningState.isVoiceEnabled = !runningState.isVoiceEnabled;
    
    const voiceBtn = document.getElementById('voice-btn');
    if (voiceBtn) {
        voiceBtn.classList.toggle('active', runningState.isVoiceEnabled);
        voiceBtn.querySelector('.control-icon').textContent = runningState.isVoiceEnabled ? '🔊' : '🔇';
    }
}

// ===================================
// FUNCIONES AUXILIARES
// ===================================

// Configurar listeners
function setupRunningListeners() {
    console.log('👂 Configurando listeners para running...');
    try {
        document.addEventListener('click', (e) => {
        const target = e.target.closest('button');
        if (!target) return;
        
        if (target.classList.contains('option-btn')) {
            e.preventDefault();
            const type = target.dataset.type;
            const targetValue = target.dataset.target;
            
            switch (type) {
                case 'free':
                    startFreeRun();
                    break;
                case 'distance':
                    startTargetRun('distance', parseInt(targetValue));
                    break;
                case 'time':
                    startTargetRun('time', parseInt(targetValue));
                    break;
            }
        }
        
        if (target.id === 'pause-btn') {
            e.preventDefault();
            togglePause();
        } else if (target.id === 'stop-btn') {
            e.preventDefault();
            stopRun();
        } else if (target.id === 'voice-btn') {
            e.preventDefault();
            toggleVoice();
        } else if (target.id === 'new-run-btn') {
            e.preventDefault();
            newRun();
        } else if (target.id === 'test-gps-btn') {
            e.preventDefault();
            testGPS();
        }
    });
        console.log('✅ Listeners configurados correctamente');
    } catch (error) {
        console.error('❌ Error configurando listeners:', error);
    }
}

// Calcular distancia entre dos puntos (Haversine)
function calculateDistance(point1, point2) {
    const lat1 = point1.lat * Math.PI / 180;
    const lon1 = point1.lng * Math.PI / 180;
    const lat2 = point2.lat * Math.PI / 180;
    const lon2 = point2.lng * Math.PI / 180;
    
    const dlat = lat2 - lat1;
    const dlon = lon2 - lon1;
    
    const a = Math.sin(dlat/2) * Math.sin(dlat/2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(dlon/2) * Math.sin(dlon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    
    return EARTH_RADIUS * c;
}

// Calcular distancia total
function calculateTotalDistance(points) {
    if (points.length < 2) return 0;
    
    let total = 0;
    for (let i = 1; i < points.length; i++) {
        total += calculateDistance(points[i-1], points[i]);
    }
    return total;
}

// Formatear distancia
function formatDistance(meters) {
    if (meters < 1000) {
        return `${Math.round(meters)}m`;
    } else {
        return `${(meters / 1000).toFixed(2)}km`;
    }
}

// Formatear duración
function formatDuration(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else {
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
}

// Formatear ritmo
function formatPace(minutesPerKm) {
    if (!minutesPerKm || minutesPerKm === Infinity || isNaN(minutesPerKm)) {
        return '--:--';
    }
    
    const minutes = Math.floor(minutesPerKm);
    const seconds = Math.round((minutesPerKm - minutes) * 60);
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Formatear velocidad
function formatSpeed(kmh) {
    if (!kmh || isNaN(kmh)) return '0.0 km/h';
    return `${kmh.toFixed(1)} km/h`;
}

// Obtener clase GPS
function getGPSStatusClass() {
    if (!runningState.lastPosition) return 'gps-searching';
    
    const accuracy = runningState.lastPosition.coords.accuracy;
    if (accuracy <= 5) return 'gps-excellent';
    if (accuracy <= 10) return 'gps-good';
    if (accuracy <= 20) return 'gps-fair';
    return 'gps-poor';
}

// Obtener texto GPS
function getGPSStatusText() {
    if (!runningState.lastPosition) return 'Buscando GPS...';
    
    const accuracy = runningState.lastPosition.coords.accuracy;
    if (accuracy <= 5) return 'GPS Excelente';
    if (accuracy <= 10) return 'GPS Bueno';
    if (accuracy <= 20) return 'GPS Regular';
    return 'GPS Pobre';
}

// Actualizar estado GPS
function updateGPSStatus(status) {
    const indicator = document.getElementById('gps-indicator');
    const text = document.getElementById('gps-text');
    
    if (indicator) {
        indicator.className = `gps-indicator ${getGPSStatusClass()}`;
    }
    
    if (text) {
        text.textContent = getGPSStatusText();
    }
}

// Probar GPS
async function testGPS() {
    console.log('🧪 Probando GPS...');
    
    try {
        const position = await requestLocationPermission();
        console.log('✅ GPS funcional:', position);
        updateGPSStatus('granted');
        showSuccess('GPS funcionando correctamente');
    } catch (error) {
        console.error('❌ GPS no funcional:', error);
        updateGPSStatus('error');
        showError('GPS no disponible');
    }
}

// ===================================
// FUNCIONES DE MAPA
// ===================================

// Inicializar mapa
function initializeMap() {
    try {
        const mapContainer = document.getElementById('run-map');
        if (!mapContainer) return;
        
        console.log('🗺️ Inicializando mapa con Leaflet...');
        
        // Crear mapa
        runningState.map = L.map('run-map', {
            zoomControl: false,
            attributionControl: false
        }).setView([40.4168, -3.7038], 15); // Madrid por defecto
        
        // Agregar tiles de OpenStreetMap
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 18,
            attribution: '© OpenStreetMap contributors'
        }).addTo(runningState.map);
        
        // Controles personalizados
        L.control.zoom({
            position: 'bottomright'
        }).addTo(runningState.map);
        
        // Centrar en ubicación actual si está disponible
        if (runningState.lastPosition) {
            const { latitude, longitude } = runningState.lastPosition.coords;
            runningState.map.setView([latitude, longitude], 16);
            addUserMarker(latitude, longitude);
        }
        
        console.log('✅ Mapa inicializado correctamente');
        
    } catch (error) {
        console.error('❌ Error inicializando mapa:', error);
        // Mostrar mensaje de error en el contenedor del mapa
        const mapContainer = document.getElementById('run-map');
        if (mapContainer) {
            mapContainer.innerHTML = `
                <div class="map-error">
                    <p>❌ No se pudo cargar el mapa</p>
                    <p class="text-secondary">Verifica tu conexión a internet</p>
                </div>
            `;
        }
    }
}

// Actualizar posición en mapa
function updateMapPosition(point) {
    if (!runningState.map) return;
    
    try {
        const { lat, lng } = point;
        
        // Actualizar o crear marcador del usuario
        if (runningState.userMarker) {
            runningState.userMarker.setLatLng([lat, lng]);
        } else {
            addUserMarker(lat, lng);
        }
        
        // Centrar mapa en la nueva posición (suavemente)
        runningState.map.panTo([lat, lng]);
        
    } catch (error) {
        console.error('❌ Error actualizando posición en mapa:', error);
    }
}

// Agregar marcador de usuario
function addUserMarker(lat, lng) {
    try {
        runningState.userMarker = L.marker([lat, lng], {
            icon: L.divIcon({
                className: 'user-marker',
                html: '<div class="user-dot"></div>',
                iconSize: [20, 20],
                iconAnchor: [10, 10]
            }),
            zIndexOffset: 1000
        }).addTo(runningState.map);
        
    } catch (error) {
        console.error('❌ Error agregando marcador:', error);
    }
}

// Actualizar ruta en mapa
function updateRoutePolyline() {
    if (!runningState.map || runningState.route.length < 2) return;
    
    try {
        const coordinates = runningState.route.map(point => [point.lat, point.lng]);
        
        if (runningState.routePolyline) {
            // Actualizar línea existente
            runningState.routePolyline.setLatLngs(coordinates);
        } else {
            // Crear nueva línea de ruta
            runningState.routePolyline = L.polyline(coordinates, {
                color: '#667eea',
                weight: 4,
                opacity: 0.8,
                smoothFactor: 1,
                lineCap: 'round',
                lineJoin: 'round'
            }).addTo(runningState.map);
        }
        
    } catch (error) {
        console.error('❌ Error actualizando ruta:', error);
    }
}

// Inicializar mapa de resultados
function initializeResultsMap() {
    try {
        const mapContainer = document.getElementById('results-map');
        if (!mapContainer || runningState.route.length === 0) {
            console.log('⚠️ No hay datos para el mapa de resultados');
            return;
        }
        
        console.log('🗺️ Inicializando mapa de resultados...');
        
        // Crear mapa de resultados
        const resultsMap = L.map('results-map', {
            zoomControl: true,
            attributionControl: false
        });
        
        // Agregar tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 18,
            attribution: '© OpenStreetMap contributors'
        }).addTo(resultsMap);
        
        // Agregar ruta completa
        const coordinates = runningState.route.map(point => [point.lat, point.lng]);
        
        if (coordinates.length > 1) {
            const routeLine = L.polyline(coordinates, {
                color: '#667eea',
                weight: 4,
                opacity: 0.8,
                smoothFactor: 1
            }).addTo(resultsMap);
            
            // Marcador de inicio
            L.marker(coordinates[0], {
                icon: L.divIcon({
                    className: 'start-marker',
                    html: '<div class="marker-inner">🏁</div>',
                    iconSize: [30, 30],
                    iconAnchor: [15, 15]
                })
            }).addTo(resultsMap).bindPopup('Inicio');
            
            // Marcador de fin
            L.marker(coordinates[coordinates.length - 1], {
                icon: L.divIcon({
                    className: 'end-marker',
                    html: '<div class="marker-inner">🏆</div>',
                    iconSize: [30, 30],
                    iconAnchor: [15, 15]
                })
            }).addTo(resultsMap).bindPopup('Fin');
            
            // Ajustar vista a la ruta completa
            resultsMap.fitBounds(routeLine.getBounds(), { 
                padding: [20, 20],
                maxZoom: 16
            });
            
            // Agregar marcadores de splits cada kilómetro
            addSplitMarkers(resultsMap, coordinates);
        }
        
        console.log('✅ Mapa de resultados inicializado');
        
    } catch (error) {
        console.error('❌ Error inicializando mapa de resultados:', error);
        const mapContainer = document.getElementById('results-map');
        if (mapContainer) {
            mapContainer.innerHTML = `
                <div class="map-error">
                    <p>❌ No se pudo cargar el mapa de resultados</p>
                </div>
            `;
        }
    }
}

// Agregar marcadores de splits
function addSplitMarkers(map, coordinates) {
    try {
        let accumulatedDistance = 0;
        let lastSplitPoint = null;
        
        for (let i = 1; i < coordinates.length; i++) {
            const prevCoord = coordinates[i - 1];
            const currentCoord = coordinates[i];
            
            // Calcular distancia del segmento
            const segmentDistance = calculateDistance(
                { lat: prevCoord[0], lng: prevCoord[1] },
                { lat: currentCoord[0], lng: currentCoord[1] }
            );
            
            accumulatedDistance += segmentDistance;
            
            // Si hemos pasado un kilómetro, agregar marcador
            const currentKm = Math.floor(accumulatedDistance / 1000);
            const lastKm = lastSplitPoint ? Math.floor((accumulatedDistance - segmentDistance) / 1000) : 0;
            
            if (currentKm > lastKm && currentKm <= runningState.splits.length) {
                const split = runningState.splits[currentKm - 1];
                if (split) {
                    L.marker(currentCoord, {
                        icon: L.divIcon({
                            className: 'split-marker',
                            html: `<div class="split-marker-inner">${currentKm}</div>`,
                            iconSize: [24, 24],
                            iconAnchor: [12, 12]
                        })
                    }).addTo(map).bindPopup(`
                        <div class="split-popup">
                            <strong>Kilómetro ${currentKm}</strong><br>
                            Ritmo: ${formatPace(split.pace)}<br>
                            Tiempo: ${formatDuration(split.duration)}
                        </div>
                    `);
                }
                
                lastSplitPoint = currentCoord;
            }
        }
        
    } catch (error) {
        console.error('❌ Error agregando marcadores de splits:', error);
    }
}

// ===================================
// FUNCIONES DE UI Y UTILIDADES
// ===================================

// Actualizar UI activa
function updateActiveRunUI() {
    const elements = {
        distance: document.getElementById('distance-value'),
        time: document.getElementById('time-value'),
        pace: document.getElementById('pace-value'),
        avgPace: document.getElementById('avg-pace-value'),
        speed: document.getElementById('speed-value'),
        calories: document.getElementById('calories-value')
    };
    
    if (elements.distance) elements.distance.textContent = formatDistance(runningState.distance);
    if (elements.time) elements.time.textContent = formatDuration(runningState.duration);
    if (elements.pace) elements.pace.textContent = formatPace(runningState.pace);
    if (elements.avgPace) elements.avgPace.textContent = formatPace(runningState.avgPace);
    if (elements.speed) elements.speed.textContent = formatSpeed(runningState.speed);
    if (elements.calories) elements.calories.textContent = Math.round(runningState.calories);
}

// Verificar split por kilómetro
function checkKilometerSplit() {
    const currentKm = Math.floor(runningState.distance / 1000);
    const completedSplits = runningState.splits.length;
    
    if (currentKm > completedSplits) {
        const splitTime = runningState.duration;
        const previousSplitTime = completedSplits > 0 ? runningState.splits[completedSplits - 1].totalTime : 0;
        const segmentTime = splitTime - previousSplitTime;
        const segmentPace = (segmentTime / 1000 / 60);
        
        const split = {
            km: currentKm,
            duration: segmentTime,
            pace: segmentPace,
            totalTime: splitTime
        };
        
        runningState.splits.push(split);
        
        if (runningState.isVoiceEnabled && window.EntrenoTTS) {
            window.EntrenoTTS.speak(`Kilómetro ${currentKm} completado. Ritmo: ${formatPace(segmentPace)}`);
        }
    }
}

// Verificar objetivo de distancia
function checkDistanceTarget() {
    if (runningState.targetDistance && runningState.distance >= runningState.targetDistance) {
        if (runningState.isVoiceEnabled && window.EntrenoTTS) {
            window.EntrenoTTS.speak('¡Objetivo de distancia alcanzado!');
        }
        stopRun();
    }
}

// Verificar objetivo de tiempo
function checkTimeTarget() {
    if (runningState.targetTime && runningState.duration >= runningState.targetTime) {
        if (runningState.isVoiceEnabled && window.EntrenoTTS) {
            window.EntrenoTTS.speak('¡Objetivo de tiempo alcanzado!');
        }
        stopRun();
    }
}

// Nueva carrera
function newRun() {
    runningState = {
        ...runningState,
        currentMode: 'select',
        isTracking: false,
        startTime: null,
        endTime: null,
        route: [],
        distance: 0,
        duration: 0,
        pace: 0,
        avgPace: 0,
        calories: 0,
        splits: [],
        targetDistance: null,
        targetTime: null,
        isPaused: false,
        pausedTime: 0
    };
    
    renderRunningPage();
}

// Mostrar error
function showError(message) {
    console.error('❌', message);
    // TODO: Sistema de notificaciones
}

// Mostrar éxito
function showSuccess(message) {
    console.log('✅', message);
    // TODO: Sistema de notificaciones
}

console.log('🏃‍♂️ Módulo de running GPS cargado');
