// Sistema de entrenamiento por intervalos para EntrenoApp
let intervalTrainingState = {
    workout: null,
    isRunning: false,
    timer: null,
    currentInterval: 0,
    isWorkPhase: true,
    timeRemaining: 0,
    gps: {
        isTracking: false,
        watchId: null,
        currentPosition: null,
        distance: 0,
        pace: 0,
        lastPosition: null
    },
    audio: {
        workSound: null,
        restSound: null,
        isEnabled: true
    }
};

// ===================================
// INICIALIZACIÓN
// ===================================

window.renderIntervalTraining = async function() {
    console.log('⏱️ Renderizando entrenamiento por intervalos');
    
    try {
        // Cargar workout desde localStorage
        const workoutData = localStorage.getItem('intervalWorkout');
        if (!workoutData) {
            console.error('❌ No se encontró workout de intervalos');
            window.navigateToPage('dashboard');
            return;
        }
        
        intervalTrainingState.workout = JSON.parse(workoutData);
        intervalTrainingState.currentInterval = intervalTrainingState.workout.currentInterval || 0;
        intervalTrainingState.isWorkPhase = intervalTrainingState.workout.isWorkPhase || true;
        intervalTrainingState.timeRemaining = intervalTrainingState.workout.timeRemaining || (intervalTrainingState.workout.workTime * 60);
        
        // Renderizar interfaz
        renderIntervalPage();
        
        // Configurar swipe para volver atrás
        setupSwipeNavigation();
        
        // Inicializar audio y GPS
        initializeAudio();
        initializeGPS();
        
    } catch (error) {
        console.error('❌ Error cargando entrenamiento por intervalos:', error);
        showError('Error cargando el entrenamiento por intervalos');
    }
};

// ===================================
// RENDERIZADO
// ===================================

function renderIntervalPage() {
    const container = document.querySelector('.dashboard-container');
    if (!container) return;
    
    const workout = intervalTrainingState.workout;
    
    container.innerHTML = `
        <div class="interval-training-container">
            <!-- Botón atrás -->
            <div class="back-button-container">
                <button class="back-button glass-button" onclick="window.navigateBack()">
                    <span class="back-icon">←</span>
                    <span class="back-text">Atrás</span>
                </button>
            </div>
            
            <!-- Header -->
            <div class="interval-header glass-card">
                <h1 class="interval-title">⏱️ Entrenamiento por Intervalos</h1>
                <div class="interval-info">
                    <div class="info-item">
                        <span class="info-label">Tiempo total:</span>
                        <span class="info-value">${workout.totalTime} min</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Intensidad:</span>
                        <span class="info-value">${getIntensityLabel(workout.intensity)}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Intervalos:</span>
                        <span class="info-value">${workout.numIntervals}</span>
                    </div>
                </div>
            </div>
            
            <!-- Timer principal -->
            <div class="timer-section glass-card">
                <div class="timer-display" id="interval-timer">
                    ${formatTime(intervalTrainingState.timeRemaining)}
                </div>
                <div class="phase-indicator" id="phase-indicator">
                    ${intervalTrainingState.isWorkPhase ? '🏃‍♂️ TRABAJO' : '😴 DESCANSO'}
                </div>
                <div class="interval-progress">
                    <div class="progress-text">
                        Intervalo ${intervalTrainingState.currentInterval + 1} de ${workout.numIntervals}
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" id="interval-progress" style="width: 0%"></div>
                    </div>
                </div>
            </div>
            
            <!-- Controles -->
            <div class="controls-section glass-card">
                <div class="control-buttons">
                    <button class="glass-button glass-button-primary" id="start-pause-btn" onclick="toggleIntervalTimer()">
                        <span class="btn-icon">▶️</span>
                        <span class="btn-text" id="start-pause-text">Iniciar</span>
                    </button>
                    <button class="glass-button glass-button-secondary" id="stop-btn" onclick="stopIntervalTraining()">
                        <span class="btn-icon">⏹️</span>
                        <span class="btn-text">Detener</span>
                    </button>
                    <button class="glass-button glass-button-secondary" id="skip-btn" onclick="skipInterval()">
                        <span class="btn-icon">⏭️</span>
                        <span class="btn-text">Saltar</span>
                    </button>
                </div>
            </div>
            
            <!-- Métricas GPS -->
            <div class="gps-metrics glass-card">
                <h3>📍 Métricas GPS</h3>
                <div class="metrics-grid">
                    <div class="metric-item">
                        <div class="metric-icon">📏</div>
                        <div class="metric-value" id="distance">0.0 km</div>
                        <div class="metric-label">Distancia</div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-icon">⚡</div>
                        <div class="metric-value" id="pace">--:-- /km</div>
                        <div class="metric-label">Ritmo</div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-icon">📍</div>
                        <div class="metric-value" id="gps-status">🔴</div>
                        <div class="metric-label">GPS</div>
                    </div>
                </div>
            </div>
            
            <!-- Información del workout -->
            <div class="workout-info glass-card">
                <h3>📋 Detalles del Entrenamiento</h3>
                <div class="workout-details">
                    <div class="detail-item">
                        <span class="detail-label">Trabajo:</span>
                        <span class="detail-value">${workout.workTime} min</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Descanso:</span>
                        <span class="detail-value">${workout.restTime} min</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Total:</span>
                        <span class="detail-value">${workout.totalTime} min</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// ===================================
// FUNCIONES DE CONTROL
// ===================================

window.toggleIntervalTimer = function() {
    if (intervalTrainingState.isRunning) {
        pauseIntervalTimer();
    } else {
        startIntervalTimer();
    }
};

function startIntervalTimer() {
    intervalTrainingState.isRunning = true;
    intervalTrainingState.timer = setInterval(updateIntervalTimer, 1000);
    
    // Iniciar tracking GPS
    startGPSTracking();
    
    document.getElementById('start-pause-btn').innerHTML = `
        <span class="btn-icon">⏸️</span>
        <span class="btn-text">Pausar</span>
    `;
    
    console.log('▶️ Timer de intervalos iniciado');
}

function pauseIntervalTimer() {
    intervalTrainingState.isRunning = false;
    clearInterval(intervalTrainingState.timer);
    
    // Detener tracking GPS
    stopGPSTracking();
    
    document.getElementById('start-pause-btn').innerHTML = `
        <span class="btn-icon">▶️</span>
        <span class="btn-text">Continuar</span>
    `;
    
    console.log('⏸️ Timer de intervalos pausado');
}

window.stopIntervalTraining = function() {
    intervalTrainingState.isRunning = false;
    clearInterval(intervalTrainingState.timer);
    
    // Mostrar confirmación
    if (confirm('¿Estás seguro de que quieres detener el entrenamiento?')) {
        // Limpiar localStorage
        localStorage.removeItem('intervalWorkout');
        localStorage.removeItem('runningMode');
        
        // Volver al dashboard
        window.navigateToPage('dashboard');
    }
};

window.skipInterval = function() {
    if (intervalTrainingState.isRunning) {
        pauseIntervalTimer();
    }
    
    // Cambiar a la siguiente fase
    nextIntervalPhase();
};

function updateIntervalTimer() {
    intervalTrainingState.timeRemaining--;
    
    // Actualizar display
    document.getElementById('interval-timer').textContent = formatTime(intervalTrainingState.timeRemaining);
    
    // Actualizar progreso
    updateProgressBar();
    
    // Verificar si el tiempo se agotó
    if (intervalTrainingState.timeRemaining <= 0) {
        nextIntervalPhase();
    }
}

function nextIntervalPhase() {
    const workout = intervalTrainingState.workout;
    
    if (intervalTrainingState.isWorkPhase) {
        // Cambiar a descanso
        intervalTrainingState.isWorkPhase = false;
        intervalTrainingState.timeRemaining = workout.restTime * 60;
        document.getElementById('phase-indicator').innerHTML = '😴 DESCANSO';
        
        // Reproducir sonido de descanso
        playPhaseSound();
    } else {
        // Cambiar a trabajo y siguiente intervalo
        intervalTrainingState.isWorkPhase = true;
        intervalTrainingState.currentInterval++;
        intervalTrainingState.timeRemaining = workout.workTime * 60;
        document.getElementById('phase-indicator').innerHTML = '🏃‍♂️ TRABAJO';
        
        // Reproducir sonido de trabajo
        playPhaseSound();
        
        // Verificar si se completaron todos los intervalos
        if (intervalTrainingState.currentInterval >= workout.numIntervals) {
            completeIntervalTraining();
            return;
        }
    }
    
    // Actualizar display
    document.getElementById('interval-timer').textContent = formatTime(intervalTrainingState.timeRemaining);
    document.querySelector('.progress-text').textContent = 
        `Intervalo ${intervalTrainingState.currentInterval + 1} de ${workout.numIntervals}`;
    
    // Reiniciar timer si estaba corriendo
    if (intervalTrainingState.isRunning) {
        startIntervalTimer();
    }
}

function completeIntervalTraining() {
    intervalTrainingState.isRunning = false;
    clearInterval(intervalTrainingState.timer);
    
    // Mostrar pantalla de completado
    const container = document.querySelector('.dashboard-container');
    container.innerHTML = `
        <div class="interval-training-container">
            <!-- Botón atrás -->
            <div class="back-button-container">
                <button class="back-button glass-button" onclick="window.navigateBack()">
                    <span class="back-icon">←</span>
                    <span class="back-text">Atrás</span>
                </button>
            </div>
            
            <div class="workout-completed glass-card">
                <div class="completed-icon">🏃‍♂️</div>
                <h1>¡Entrenamiento Completado!</h1>
                <p>Has completado tu entrenamiento por intervalos. ¡Excelente trabajo! 💪</p>
                <p class="completed-message">Tiempo total: ${intervalTrainingState.workout.totalTime} minutos</p>
                
                <div class="completed-actions">
                    <button class="glass-button glass-button-primary" onclick="window.navigateToPage('dashboard')">
                        <span class="btn-icon">🏠</span>
                        <span class="btn-text">Volver al Dashboard</span>
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Limpiar localStorage
    localStorage.removeItem('intervalWorkout');
    localStorage.removeItem('runningMode');
    
    console.log('✅ Entrenamiento por intervalos completado');
}

function updateProgressBar() {
    const workout = intervalTrainingState.workout;
    const phaseTime = intervalTrainingState.isWorkPhase ? workout.workTime : workout.restTime;
    const totalPhaseTime = phaseTime * 60;
    const progress = ((totalPhaseTime - intervalTrainingState.timeRemaining) / totalPhaseTime) * 100;
    
    document.getElementById('interval-progress').style.width = `${progress}%`;
}

// ===================================
// FUNCIONES AUXILIARES
// ===================================

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function getIntensityLabel(intensity) {
    const labels = {
        'easy': 'Fácil (2:1)',
        'medium': 'Medio (1:1)',
        'hard': 'Intenso (1:2)'
    };
    return labels[intensity] || 'Medio';
}

function setupSwipeNavigation() {
    let startX = 0;
    let startY = 0;
    
    document.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
    });
    
    document.addEventListener('touchend', (e) => {
        if (!startX || !startY) return;
        
        const endX = e.changedTouches[0].clientX;
        const endY = e.changedTouches[0].clientY;
        
        const diffX = startX - endX;
        const diffY = startY - endY;
        
        // Swipe horizontal de derecha a izquierda (volver atrás)
        if (Math.abs(diffX) > Math.abs(diffY) && diffX > 50) {
            if (window.navigateBack) {
                window.navigateBack();
            }
        }
        
        startX = 0;
        startY = 0;
    });
}

// ===================================
// AUDIO Y GPS
// ===================================

// Inicializar sistema de audio
function initializeAudio() {
    try {
        // Crear sonidos usando Web Audio API
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Sonido para trabajo (tono alto)
        intervalTrainingState.audio.workSound = createTone(audioContext, 800, 0.3);
        
        // Sonido para descanso (tono bajo)
        intervalTrainingState.audio.restSound = createTone(audioContext, 400, 0.3);
        
        console.log('🔊 Sistema de audio inicializado');
    } catch (error) {
        console.error('❌ Error inicializando audio:', error);
        intervalTrainingState.audio.isEnabled = false;
    }
}

// Crear tono usando Web Audio API
function createTone(audioContext, frequency, duration) {
    return function() {
        if (!intervalTrainingState.audio.isEnabled) return;
        
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
    };
}

// Inicializar GPS
function initializeGPS() {
    if (!navigator.geolocation) {
        console.warn('⚠️ GPS no disponible');
        updateGPSStatus('❌', 'GPS no disponible');
        return;
    }
    
    console.log('📍 Inicializando GPS...');
    updateGPSStatus('🟡', 'Obteniendo ubicación...');
    
    // Obtener posición inicial
    navigator.geolocation.getCurrentPosition(
        (position) => {
            intervalTrainingState.gps.currentPosition = position;
            intervalTrainingState.gps.lastPosition = position;
            updateGPSStatus('🟢', 'GPS activo');
            console.log('✅ GPS inicializado correctamente');
        },
        (error) => {
            console.error('❌ Error GPS:', error);
            updateGPSStatus('🔴', 'Error GPS');
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        }
    );
}

// Iniciar tracking GPS
function startGPSTracking() {
    if (!navigator.geolocation) return;
    
    intervalTrainingState.gps.isTracking = true;
    intervalTrainingState.gps.watchId = navigator.geolocation.watchPosition(
        (position) => {
            updateGPSPosition(position);
        },
        (error) => {
            console.error('❌ Error tracking GPS:', error);
            updateGPSStatus('🔴', 'Error tracking');
        },
        {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 1000
        }
    );
}

// Detener tracking GPS
function stopGPSTracking() {
    if (intervalTrainingState.gps.watchId) {
        navigator.geolocation.clearWatch(intervalTrainingState.gps.watchId);
        intervalTrainingState.gps.watchId = null;
    }
    intervalTrainingState.gps.isTracking = false;
}

// Actualizar posición GPS
function updateGPSPosition(position) {
    const lastPos = intervalTrainingState.gps.lastPosition;
    const currentPos = position;
    
    if (lastPos) {
        // Calcular distancia
        const distance = calculateDistance(
            lastPos.coords.latitude,
            lastPos.coords.longitude,
            currentPos.coords.latitude,
            currentPos.coords.longitude
        );
        
        intervalTrainingState.gps.distance += distance;
        
        // Calcular ritmo (km/h)
        const timeDiff = (currentPos.timestamp - lastPos.timestamp) / 1000; // segundos
        if (timeDiff > 0) {
            const speed = (distance / 1000) / (timeDiff / 3600); // km/h
            intervalTrainingState.gps.pace = speed > 0 ? 60 / speed : 0; // min/km
        }
    }
    
    intervalTrainingState.gps.lastPosition = currentPos;
    intervalTrainingState.gps.currentPosition = currentPos;
    
    // Actualizar UI
    updateGPSMetrics();
}

// Calcular distancia entre dos puntos (fórmula de Haversine)
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000; // Radio de la Tierra en metros
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distancia en metros
}

// Actualizar métricas GPS en la UI
function updateGPSMetrics() {
    const distanceEl = document.getElementById('distance');
    const paceEl = document.getElementById('pace');
    
    if (distanceEl) {
        distanceEl.textContent = `${(intervalTrainingState.gps.distance / 1000).toFixed(2)} km`;
    }
    
    if (paceEl) {
        if (intervalTrainingState.gps.pace > 0) {
            const minutes = Math.floor(intervalTrainingState.gps.pace);
            const seconds = Math.floor((intervalTrainingState.gps.pace - minutes) * 60);
            paceEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')} /km`;
        } else {
            paceEl.textContent = '--:-- /km';
        }
    }
}

// Actualizar estado GPS en la UI
function updateGPSStatus(icon, text) {
    const statusEl = document.getElementById('gps-status');
    if (statusEl) {
        statusEl.textContent = icon;
        statusEl.title = text;
    }
}

// Reproducir sonido según la fase
function playPhaseSound() {
    if (!intervalTrainingState.audio.isEnabled) return;
    
    if (intervalTrainingState.isWorkPhase) {
        if (intervalTrainingState.audio.workSound) {
            intervalTrainingState.audio.workSound();
        }
    } else {
        if (intervalTrainingState.audio.restSound) {
            intervalTrainingState.audio.restSound();
        }
    }
}

function showError(message) {
    console.error('❌ Error:', message);
    alert(message);
}

console.log('⏱️ Sistema de entrenamiento por intervalos cargado');
