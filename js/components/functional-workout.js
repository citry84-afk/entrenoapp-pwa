// Sistema de ejecución de WODs funcionales
// Timer, registro de datos y seguimiento de progreso

let functionalWorkoutState = {
    currentWod: null,
    isRunning: false,
    startTime: null,
    currentRound: 0,
    totalRounds: 0,
    currentMovement: 0,
    movements: [],
    completedMovements: [],
    timer: null,
    workoutData: {
        totalTime: 0,
        rounds: [],
        notes: '',
        difficulty: 'intermediate'
    }
};

// ===================================
// INICIALIZACIÓN
// ===================================

window.initFunctionalWorkout = async function() {
    console.log('⚡ Inicializando workout funcional');
    
    try {
        // Cargar WOD desde localStorage o generar uno
        const wodData = localStorage.getItem('currentFunctionalWod');
        if (wodData) {
            functionalWorkoutState.currentWod = JSON.parse(wodData);
        } else {
            // Generar WOD de ejemplo si no hay uno
            functionalWorkoutState.currentWod = generateExampleWod();
        }
        
        // Configurar estado inicial
        setupWorkoutState();
        
        // Renderizar interfaz
        renderFunctionalWorkout();
        
        console.log('✅ Workout funcional inicializado:', functionalWorkoutState.currentWod);
        
    } catch (error) {
        console.error('❌ Error inicializando workout funcional:', error);
        showError('Error cargando el entrenamiento funcional');
    }
};

// ===================================
// CONFIGURACIÓN DEL ESTADO
// ===================================

function setupWorkoutState() {
    const wod = functionalWorkoutState.currentWod;
    
    functionalWorkoutState.movements = wod.movements || [];
    functionalWorkoutState.totalRounds = getTotalRounds(wod.structure);
    functionalWorkoutState.currentRound = 0;
    functionalWorkoutState.currentMovement = 0;
    functionalWorkoutState.completedMovements = [];
    functionalWorkoutState.workoutData = {
        totalTime: 0,
        rounds: [],
        notes: '',
        difficulty: wod.difficulty || 'intermediate'
    };
}

function getTotalRounds(structure) {
    // Extraer número de rondas del structure
    const match = structure.match(/(\d+)\s*rondas?/i);
    return match ? parseInt(match[1]) : 1;
}

// ===================================
// RENDERIZADO
// ===================================

function renderFunctionalWorkout() {
    const container = document.querySelector('.dashboard-container');
    if (!container) return;
    
    const wod = functionalWorkoutState.currentWod;
    
    container.innerHTML = `
        <div class="functional-workout-container">
            <!-- Header del WOD -->
            <div class="wod-header glass-card">
                <div class="wod-title-section">
                    <h1 class="wod-name">${wod.title}</h1>
                    <p class="wod-description">${wod.description}</p>
                </div>
                <div class="wod-meta">
                    <div class="wod-difficulty">
                        <span class="difficulty-label">Dificultad:</span>
                        <span class="difficulty-value ${wod.difficulty}">${getDifficultyLabel(wod.difficulty)}</span>
                    </div>
                    <div class="wod-time">
                        <span class="time-label">Tiempo estimado:</span>
                        <span class="time-value">${wod.timeNeeded}</span>
                    </div>
                </div>
            </div>
            
            <!-- Estructura del WOD -->
            <div class="wod-structure glass-card">
                <h3>Estructura: ${wod.structure}</h3>
                <div class="movements-list">
                    ${wod.movements.map((movement, index) => `
                        <div class="movement-item">
                            <div class="movement-exercise">${movement.exercise}</div>
                            <div class="movement-reps">${movement.reps}</div>
                            ${movement.weight ? `<div class="movement-weight">${movement.weight}</div>` : ''}
                            ${movement.notes ? `<div class="movement-notes">${movement.notes}</div>` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <!-- Timer y controles -->
            <div class="workout-controls glass-card">
                <div class="timer-section">
                    <div class="timer-display" id="workout-timer">00:00</div>
                    <div class="round-info">
                        <span id="current-round">Ronda 0 de ${functionalWorkoutState.totalRounds}</span>
                    </div>
                </div>
                
                <div class="control-buttons">
                    <button class="glass-button glass-button-primary" id="start-workout" onclick="startFunctionalWorkout()">
                        <span class="btn-icon">▶️</span>
                        <span class="btn-text">Iniciar WOD</span>
                    </button>
                    <button class="glass-button glass-button-secondary" id="pause-workout" onclick="pauseFunctionalWorkout()" style="display: none;">
                        <span class="btn-icon">⏸️</span>
                        <span class="btn-text">Pausar</span>
                    </button>
                    <button class="glass-button glass-button-danger" id="stop-workout" onclick="stopFunctionalWorkout()" style="display: none;">
                        <span class="btn-icon">⏹️</span>
                        <span class="btn-text">Finalizar</span>
                    </button>
                </div>
            </div>
            
            <!-- Progreso del workout -->
            <div class="workout-progress glass-card" id="workout-progress" style="display: none;">
                <h3>Progreso del WOD</h3>
                <div class="progress-rounds">
                    <div class="rounds-completed">
                        <span class="rounds-label">Rondas completadas:</span>
                        <span class="rounds-value" id="rounds-completed">0 / ${functionalWorkoutState.totalRounds}</span>
                    </div>
                    <div class="round-progress-bar">
                        <div class="round-progress-fill" id="round-progress-fill" style="width: 0%"></div>
                    </div>
                </div>
                
                <div class="current-movement" id="current-movement-display">
                    <h4>Movimiento actual:</h4>
                    <div class="movement-current" id="current-movement-name">-</div>
                    <div class="movement-reps-current" id="current-movement-reps">-</div>
                </div>
            </div>
            
            <!-- Registro de datos finales -->
            <div class="workout-completion glass-card" id="workout-completion" style="display: none;">
                <h3>¡WOD Completado! 🎉</h3>
                <div class="completion-stats">
                    <div class="stat-item">
                        <span class="stat-label">Tiempo total:</span>
                        <span class="stat-value" id="final-time">00:00</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Rondas completadas:</span>
                        <span class="stat-value" id="final-rounds">0</span>
                    </div>
                </div>
                
                <div class="completion-notes">
                    <label for="workout-notes">Notas del entrenamiento:</label>
                    <textarea id="workout-notes" placeholder="¿Cómo te sentiste? ¿Algún PR? ¿Observaciones?"></textarea>
                </div>
                
                <div class="completion-actions">
                    <button class="glass-button glass-button-primary" onclick="saveFunctionalWorkout()">
                        <span class="btn-icon">💾</span>
                        <span class="btn-text">Guardar Resultado</span>
                    </button>
                    <button class="glass-button glass-button-secondary" onclick="window.navigateToPage('dashboard')">
                        <span class="btn-icon">🏠</span>
                        <span class="btn-text">Volver al Dashboard</span>
                    </button>
                </div>
            </div>
        </div>
    `;
}

// ===================================
// CONTROL DEL TIMER
// ===================================

function startFunctionalWorkout() {
    console.log('⚡ Iniciando WOD funcional');
    
    functionalWorkoutState.isRunning = true;
    functionalWorkoutState.startTime = Date.now();
    
    // Mostrar controles de pausa/stop
    document.getElementById('start-workout').style.display = 'none';
    document.getElementById('pause-workout').style.display = 'inline-flex';
    document.getElementById('stop-workout').style.display = 'inline-flex';
    document.getElementById('workout-progress').style.display = 'block';
    
    // Iniciar timer
    startTimer();
    
    // Actualizar movimiento actual
    updateCurrentMovement();
}

function pauseFunctionalWorkout() {
    console.log('⏸️ Pausando WOD');
    
    functionalWorkoutState.isRunning = false;
    
    if (functionalWorkoutState.timer) {
        clearInterval(functionalWorkoutState.timer);
    }
    
    // Cambiar botones
    document.getElementById('pause-workout').style.display = 'none';
    document.getElementById('start-workout').style.display = 'inline-flex';
    document.getElementById('start-workout').innerHTML = '<span class="btn-icon">▶️</span><span class="btn-text">Reanudar</span>';
}

function stopFunctionalWorkout() {
    console.log('⏹️ Finalizando WOD');
    
    functionalWorkoutState.isRunning = false;
    
    if (functionalWorkoutState.timer) {
        clearInterval(functionalWorkoutState.timer);
    }
    
    // Calcular tiempo total
    const totalTime = Date.now() - functionalWorkoutState.startTime;
    functionalWorkoutState.workoutData.totalTime = totalTime;
    
    // Mostrar pantalla de finalización
    showWorkoutCompletion();
}

function startTimer() {
    functionalWorkoutState.timer = setInterval(() => {
        if (functionalWorkoutState.isRunning) {
            const elapsed = Date.now() - functionalWorkoutState.startTime;
            updateTimerDisplay(elapsed);
        }
    }, 1000);
}

function updateTimerDisplay(elapsed) {
    const minutes = Math.floor(elapsed / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);
    
    const timerDisplay = document.getElementById('workout-timer');
    if (timerDisplay) {
        timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
}

// ===================================
// PROGRESO DEL WORKOUT
// ===================================

function updateCurrentMovement() {
    const currentRound = functionalWorkoutState.currentRound + 1;
    const totalRounds = functionalWorkoutState.totalRounds;
    const currentMovement = functionalWorkoutState.movements[functionalWorkoutState.currentMovement];
    
    // Actualizar información de ronda
    const roundDisplay = document.getElementById('current-round');
    if (roundDisplay) {
        roundDisplay.textContent = `Ronda ${currentRound} de ${totalRounds}`;
    }
    
    // Actualizar movimiento actual
    const movementName = document.getElementById('current-movement-name');
    const movementReps = document.getElementById('current-movement-reps');
    
    if (movementName && movementReps && currentMovement) {
        movementName.textContent = currentMovement.exercise;
        movementReps.textContent = currentMovement.reps;
    }
    
    // Actualizar barra de progreso
    const progressFill = document.getElementById('round-progress-fill');
    if (progressFill) {
        const progress = (functionalWorkoutState.currentRound / totalRounds) * 100;
        progressFill.style.width = `${progress}%`;
    }
}

function completeMovement() {
    console.log('✅ Movimiento completado');
    
    // Marcar movimiento como completado
    functionalWorkoutState.completedMovements.push({
        movement: functionalWorkoutState.movements[functionalWorkoutState.currentMovement],
        completedAt: Date.now()
    });
    
    // Avanzar al siguiente movimiento
    functionalWorkoutState.currentMovement++;
    
    if (functionalWorkoutState.currentMovement >= functionalWorkoutState.movements.length) {
        // Ronda completada
        completeRound();
    } else {
        // Siguiente movimiento de la misma ronda
        updateCurrentMovement();
    }
}

function completeRound() {
    console.log('🎉 Ronda completada');
    
    functionalWorkoutState.currentRound++;
    functionalWorkoutState.currentMovement = 0;
    
    // Actualizar rondas completadas
    const roundsCompleted = document.getElementById('rounds-completed');
    if (roundsCompleted) {
        roundsCompleted.textContent = `${functionalWorkoutState.currentRound} / ${functionalWorkoutState.totalRounds}`;
    }
    
    if (functionalWorkoutState.currentRound >= functionalWorkoutState.totalRounds) {
        // WOD completado
        stopFunctionalWorkout();
    } else {
        // Siguiente ronda
        updateCurrentMovement();
    }
}

// ===================================
// FINALIZACIÓN
// ===================================

function showWorkoutCompletion() {
    const completionDiv = document.getElementById('workout-completion');
    const finalTime = document.getElementById('final-time');
    const finalRounds = document.getElementById('final-rounds');
    
    if (completionDiv && finalTime && finalRounds) {
        // Calcular tiempo final
        const totalMinutes = Math.floor(functionalWorkoutState.workoutData.totalTime / 60000);
        const totalSeconds = Math.floor((functionalWorkoutState.workoutData.totalTime % 60000) / 1000);
        
        finalTime.textContent = `${totalMinutes.toString().padStart(2, '0')}:${totalSeconds.toString().padStart(2, '0')}`;
        finalRounds.textContent = functionalWorkoutState.currentRound;
        
        completionDiv.style.display = 'block';
    }
}

function saveFunctionalWorkout() {
    console.log('💾 Guardando resultado del WOD');
    
    const notes = document.getElementById('workout-notes').value;
    functionalWorkoutState.workoutData.notes = notes;
    functionalWorkoutState.workoutData.rounds = functionalWorkoutState.completedMovements;
    
    // Aquí guardarías en Firebase
    // Por ahora solo mostrar mensaje
    alert('¡WOD guardado exitosamente! 🎉');
    
    // Volver al dashboard
    window.navigateToPage('dashboard');
}

// ===================================
// FUNCIONES AUXILIARES
// ===================================

function generateExampleWod() {
    return {
        title: 'Nancy - Semana 1',
        description: 'Overhead squats y running',
        difficulty: 'intermediate',
        timeNeeded: '18-30 min',
        structure: '5 rondas for time',
        movements: [
            { exercise: 'Run', reps: '400m' },
            { exercise: 'Overhead Squats', reps: '15', weight: '34kg/24kg' }
        ]
    };
}

function getDifficultyLabel(difficulty) {
    const labels = {
        'principiante': 'Principiante',
        'intermediate': 'Intermedio',
        'avanzado': 'Avanzado',
        'elite': 'Élite'
    };
    return labels[difficulty] || 'Intermedio';
}

function showError(message) {
    console.error('❌ Error:', message);
    // Aquí podrías mostrar un toast o modal de error
}

// ===================================
// EVENTOS GLOBALES
// ===================================

// Hacer funciones globales
window.startFunctionalWorkout = startFunctionalWorkout;
window.pauseFunctionalWorkout = pauseFunctionalWorkout;
window.stopFunctionalWorkout = stopFunctionalWorkout;
window.completeMovement = completeMovement;
window.saveFunctionalWorkout = saveFunctionalWorkout;

console.log('⚡ Sistema de WOD funcional cargado');
