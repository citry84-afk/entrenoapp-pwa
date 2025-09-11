// Sistema de entrenamiento por intervalos para EntrenoApp
let intervalTrainingState = {
    workout: null,
    isRunning: false,
    timer: null,
    currentInterval: 0,
    isWorkPhase: true,
    timeRemaining: 0
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
    
    document.getElementById('start-pause-btn').innerHTML = `
        <span class="btn-icon">⏸️</span>
        <span class="btn-text">Pausar</span>
    `;
    
    console.log('▶️ Timer de intervalos iniciado');
}

function pauseIntervalTimer() {
    intervalTrainingState.isRunning = false;
    clearInterval(intervalTrainingState.timer);
    
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
    } else {
        // Cambiar a trabajo y siguiente intervalo
        intervalTrainingState.isWorkPhase = true;
        intervalTrainingState.currentInterval++;
        intervalTrainingState.timeRemaining = workout.workTime * 60;
        document.getElementById('phase-indicator').innerHTML = '🏃‍♂️ TRABAJO';
        
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

function showError(message) {
    console.error('❌ Error:', message);
    alert(message);
}

console.log('⏱️ Sistema de entrenamiento por intervalos cargado');
