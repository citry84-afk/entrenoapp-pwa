// Sistema de ejecución de entrenamientos de gimnasio
// Registro de pesos, reps, series y seguimiento de progreso

let gymWorkoutState = {
    currentWorkout: null,
    isRunning: false,
    startTime: null,
    currentExercise: 0,
    exercises: [],
    completedExercises: [],
    timer: null,
    workoutData: {
        totalTime: 0,
        exercises: [],
        notes: '',
        difficulty: 'intermediate'
    }
};

// ===================================
// INICIALIZACIÓN
// ===================================

window.initGymWorkout = async function() {
    console.log('🏋️‍♂️ Inicializando workout de gimnasio');
    
    try {
        // Cargar workout desde localStorage o generar uno
        const workoutData = localStorage.getItem('currentGymWorkout');
        if (workoutData) {
            gymWorkoutState.currentWorkout = JSON.parse(workoutData);
        } else {
            // Generar workout de ejemplo si no hay uno
            gymWorkoutState.currentWorkout = generateExampleGymWorkout();
        }
        
        // Configurar estado inicial
        setupGymWorkoutState();
        
        // Renderizar interfaz
        renderGymWorkout();
        
        console.log('✅ Workout de gimnasio inicializado:', gymWorkoutState.currentWorkout);
        
    } catch (error) {
        console.error('❌ Error inicializando workout de gimnasio:', error);
        showError('Error cargando el entrenamiento de gimnasio');
    }
};

// ===================================
// CONFIGURACIÓN DEL ESTADO
// ===================================

function setupGymWorkoutState() {
    const workout = gymWorkoutState.currentWorkout;
    
    gymWorkoutState.exercises = workout.exercises || [];
    gymWorkoutState.currentExercise = 0;
    gymWorkoutState.completedExercises = [];
    gymWorkoutState.workoutData = {
        totalTime: 0,
        exercises: [],
        notes: '',
        difficulty: workout.difficulty || 'intermediate'
    };
}

// ===================================
// RENDERIZADO
// ===================================

function renderGymWorkout() {
    const container = document.querySelector('.dashboard-container');
    if (!container) return;
    
    const workout = gymWorkoutState.currentWorkout;
    
    container.innerHTML = `
        <div class="gym-workout-container">
            <!-- Header del workout -->
            <div class="workout-header glass-card">
                <div class="workout-title-section">
                    <h1 class="workout-name">${workout.title}</h1>
                    <p class="workout-description">${workout.description}</p>
                </div>
                <div class="workout-meta">
                    <div class="workout-muscle-group">
                        <span class="muscle-label">Grupo muscular:</span>
                        <span class="muscle-value">${workout.muscleGroup || 'Múltiples'}</span>
                    </div>
                    <div class="workout-difficulty">
                        <span class="difficulty-label">Dificultad:</span>
                        <span class="difficulty-value ${workout.difficulty}">${getDifficultyLabel(workout.difficulty)}</span>
                    </div>
                </div>
            </div>
            
            <!-- Lista de ejercicios -->
            <div class="exercises-list glass-card">
                <h3>Ejercicios del día</h3>
                <div class="exercises-container">
                    ${workout.exercises.map((exercise, index) => `
                        <div class="exercise-item ${index === 0 ? 'current' : ''}" data-exercise-index="${index}">
                            <div class="exercise-header">
                                <div class="exercise-name">${exercise.name}</div>
                                <div class="exercise-sets-reps">${exercise.sets} series • ${exercise.reps} reps</div>
                            </div>
                            <div class="exercise-notes">${exercise.notes || ''}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <!-- Timer y controles -->
            <div class="workout-controls glass-card">
                <div class="timer-section">
                    <div class="timer-display" id="gym-timer">00:00</div>
                    <div class="exercise-info">
                        <span id="current-exercise">Ejercicio 1 de ${gymWorkoutState.exercises.length}</span>
                    </div>
                </div>
                
                <div class="control-buttons">
                    <button class="glass-button glass-button-primary" id="start-gym-workout" onclick="startGymWorkout()">
                        <span class="btn-icon">▶️</span>
                        <span class="btn-text">Iniciar Entrenamiento</span>
                    </button>
                    <button class="glass-button glass-button-secondary" id="pause-gym-workout" onclick="pauseGymWorkout()" style="display: none;">
                        <span class="btn-icon">⏸️</span>
                        <span class="btn-text">Pausar</span>
                    </button>
                    <button class="glass-button glass-button-danger" id="stop-gym-workout" onclick="stopGymWorkout()" style="display: none;">
                        <span class="btn-icon">⏹️</span>
                        <span class="btn-text">Finalizar</span>
                    </button>
                </div>
            </div>
            
            <!-- Registro de series -->
            <div class="exercise-recording glass-card" id="exercise-recording" style="display: none;">
                <h3>Registro de Series</h3>
                <div class="current-exercise-info">
                    <h4 id="recording-exercise-name">-</h4>
                    <p id="recording-exercise-sets">-</p>
                </div>
                
                <div class="series-recording" id="series-recording">
                    <!-- Se llenará dinámicamente -->
                </div>
                
                <div class="recording-actions">
                    <button class="glass-button glass-button-primary" onclick="completeExercise()">
                        <span class="btn-icon">✅</span>
                        <span class="btn-text">Completar Ejercicio</span>
                    </button>
                    <button class="glass-button glass-button-secondary" onclick="skipExercise()">
                        <span class="btn-icon">⏭️</span>
                        <span class="btn-text">Saltar Ejercicio</span>
                    </button>
                </div>
            </div>
            
            <!-- Progreso del workout -->
            <div class="workout-progress glass-card" id="gym-workout-progress" style="display: none;">
                <h3>Progreso del Entrenamiento</h3>
                <div class="progress-exercises">
                    <div class="exercises-completed">
                        <span class="exercises-label">Ejercicios completados:</span>
                        <span class="exercises-value" id="exercises-completed">0 / ${gymWorkoutState.exercises.length}</span>
                    </div>
                    <div class="exercise-progress-bar">
                        <div class="exercise-progress-fill" id="exercise-progress-fill" style="width: 0%"></div>
                    </div>
                </div>
            </div>
            
            <!-- Finalización -->
            <div class="workout-completion glass-card" id="gym-workout-completion" style="display: none;">
                <h3>¡Entrenamiento Completado! 🎉</h3>
                <div class="completion-stats">
                    <div class="stat-item">
                        <span class="stat-label">Tiempo total:</span>
                        <span class="stat-value" id="gym-final-time">00:00</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Ejercicios completados:</span>
                        <span class="stat-value" id="gym-final-exercises">0</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Series totales:</span>
                        <span class="stat-value" id="gym-final-sets">0</span>
                    </div>
                </div>
                
                <div class="completion-notes">
                    <label for="gym-workout-notes">Notas del entrenamiento:</label>
                    <textarea id="gym-workout-notes" placeholder="¿Cómo te sentiste? ¿Algún PR? ¿Observaciones?"></textarea>
                </div>
                
                <div class="completion-actions">
                    <button class="glass-button glass-button-primary" onclick="saveGymWorkout()">
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

function startGymWorkout() {
    console.log('🏋️‍♂️ Iniciando entrenamiento de gimnasio');
    
    gymWorkoutState.isRunning = true;
    gymWorkoutState.startTime = Date.now();
    
    // Mostrar controles de pausa/stop
    document.getElementById('start-gym-workout').style.display = 'none';
    document.getElementById('pause-gym-workout').style.display = 'inline-flex';
    document.getElementById('stop-gym-workout').style.display = 'inline-flex';
    document.getElementById('gym-workout-progress').style.display = 'block';
    document.getElementById('exercise-recording').style.display = 'block';
    
    // Iniciar timer
    startGymTimer();
    
    // Mostrar primer ejercicio
    showCurrentExercise();
}

function pauseGymWorkout() {
    console.log('⏸️ Pausando entrenamiento');
    
    gymWorkoutState.isRunning = false;
    
    if (gymWorkoutState.timer) {
        clearInterval(gymWorkoutState.timer);
    }
    
    // Cambiar botones
    document.getElementById('pause-gym-workout').style.display = 'none';
    document.getElementById('start-gym-workout').style.display = 'inline-flex';
    document.getElementById('start-gym-workout').innerHTML = '<span class="btn-icon">▶️</span><span class="btn-text">Reanudar</span>';
}

function stopGymWorkout() {
    console.log('⏹️ Finalizando entrenamiento');
    
    gymWorkoutState.isRunning = false;
    
    if (gymWorkoutState.timer) {
        clearInterval(gymWorkoutState.timer);
    }
    
    // Calcular tiempo total
    const totalTime = Date.now() - gymWorkoutState.startTime;
    gymWorkoutState.workoutData.totalTime = totalTime;
    
    // Mostrar pantalla de finalización
    showGymWorkoutCompletion();
}

function startGymTimer() {
    gymWorkoutState.timer = setInterval(() => {
        if (gymWorkoutState.isRunning) {
            const elapsed = Date.now() - gymWorkoutState.startTime;
            updateGymTimerDisplay(elapsed);
        }
    }, 1000);
}

function updateGymTimerDisplay(elapsed) {
    const minutes = Math.floor(elapsed / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);
    
    const timerDisplay = document.getElementById('gym-timer');
    if (timerDisplay) {
        timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
}

// ===================================
// GESTIÓN DE EJERCICIOS
// ===================================

function showCurrentExercise() {
    const currentExercise = gymWorkoutState.exercises[gymWorkoutState.currentExercise];
    if (!currentExercise) return;
    
    // Actualizar información del ejercicio
    const exerciseName = document.getElementById('recording-exercise-name');
    const exerciseSets = document.getElementById('recording-exercise-sets');
    
    if (exerciseName && exerciseSets) {
        exerciseName.textContent = currentExercise.name;
        exerciseSets.textContent = `${currentExercise.sets} series • ${currentExercise.reps} reps`;
    }
    
    // Actualizar contador de ejercicios
    const exerciseInfo = document.getElementById('current-exercise');
    if (exerciseInfo) {
        exerciseInfo.textContent = `Ejercicio ${gymWorkoutState.currentExercise + 1} de ${gymWorkoutState.exercises.length}`;
    }
    
    // Crear formulario de registro de series
    createSeriesRecordingForm(currentExercise);
    
    // Actualizar progreso
    updateGymProgress();
}

function createSeriesRecordingForm(exercise) {
    const container = document.getElementById('series-recording');
    if (!container) return;
    
    const sets = parseInt(exercise.sets) || 1;
    
    container.innerHTML = `
        <div class="series-form">
            ${Array.from({ length: sets }, (_, index) => `
                <div class="series-item">
                    <div class="series-number">Serie ${index + 1}</div>
                    <div class="series-inputs">
                        <div class="input-group">
                            <label>Peso (kg)</label>
                            <input type="number" class="weight-input" data-series="${index}" placeholder="0" step="0.5">
                        </div>
                        <div class="input-group">
                            <label>Reps</label>
                            <input type="number" class="reps-input" data-series="${index}" placeholder="${exercise.reps}" step="1">
                        </div>
                        <div class="input-group">
                            <label>RPE</label>
                            <select class="rpe-input" data-series="${index}">
                                <option value="">-</option>
                                <option value="1">1 - Muy fácil</option>
                                <option value="2">2 - Fácil</option>
                                <option value="3">3 - Muy fácil</option>
                                <option value="4">4 - Fácil</option>
                                <option value="5">5 - Moderado</option>
                                <option value="6">6 - Moderado</option>
                                <option value="7">7 - Difícil</option>
                                <option value="8">8 - Muy difícil</option>
                                <option value="9">9 - Casi máximo</option>
                                <option value="10">10 - Máximo</option>
                            </select>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function completeExercise() {
    console.log('✅ Ejercicio completado');
    
    // Recopilar datos de las series
    const seriesData = collectSeriesData();
    
    // Agregar ejercicio completado
    gymWorkoutState.completedExercises.push({
        exercise: gymWorkoutState.exercises[gymWorkoutState.currentExercise],
        series: seriesData,
        completedAt: Date.now()
    });
    
    // Avanzar al siguiente ejercicio
    gymWorkoutState.currentExercise++;
    
    if (gymWorkoutState.currentExercise >= gymWorkoutState.exercises.length) {
        // Entrenamiento completado
        stopGymWorkout();
    } else {
        // Siguiente ejercicio
        showCurrentExercise();
    }
}

function skipExercise() {
    console.log('⏭️ Saltando ejercicio');
    
    // Marcar como saltado
    gymWorkoutState.completedExercises.push({
        exercise: gymWorkoutState.exercises[gymWorkoutState.currentExercise],
        series: [],
        completedAt: Date.now(),
        skipped: true
    });
    
    // Avanzar al siguiente ejercicio
    gymWorkoutState.currentExercise++;
    
    if (gymWorkoutState.currentExercise >= gymWorkoutState.exercises.length) {
        // Entrenamiento completado
        stopGymWorkout();
    } else {
        // Siguiente ejercicio
        showCurrentExercise();
    }
}

function collectSeriesData() {
    const seriesData = [];
    const seriesItems = document.querySelectorAll('.series-item');
    
    seriesItems.forEach((item, index) => {
        const weightInput = item.querySelector('.weight-input');
        const repsInput = item.querySelector('.reps-input');
        const rpeInput = item.querySelector('.rpe-input');
        
        seriesData.push({
            series: index + 1,
            weight: parseFloat(weightInput.value) || 0,
            reps: parseInt(repsInput.value) || 0,
            rpe: parseInt(rpeInput.value) || null
        });
    });
    
    return seriesData;
}

function updateGymProgress() {
    const exercisesCompleted = document.getElementById('exercises-completed');
    const progressFill = document.getElementById('exercise-progress-fill');
    
    if (exercisesCompleted && progressFill) {
        const completed = gymWorkoutState.currentExercise;
        const total = gymWorkoutState.exercises.length;
        
        exercisesCompleted.textContent = `${completed} / ${total}`;
        
        const progress = (completed / total) * 100;
        progressFill.style.width = `${progress}%`;
    }
}

// ===================================
// FINALIZACIÓN
// ===================================

function showGymWorkoutCompletion() {
    const completionDiv = document.getElementById('gym-workout-completion');
    const finalTime = document.getElementById('gym-final-time');
    const finalExercises = document.getElementById('gym-final-exercises');
    const finalSets = document.getElementById('gym-final-sets');
    
    if (completionDiv && finalTime && finalExercises && finalSets) {
        // Calcular tiempo final
        const totalMinutes = Math.floor(gymWorkoutState.workoutData.totalTime / 60000);
        const totalSeconds = Math.floor((gymWorkoutState.workoutData.totalTime % 60000) / 1000);
        
        finalTime.textContent = `${totalMinutes.toString().padStart(2, '0')}:${totalSeconds.toString().padStart(2, '0')}`;
        finalExercises.textContent = gymWorkoutState.completedExercises.length;
        
        // Calcular series totales
        const totalSets = gymWorkoutState.completedExercises.reduce((total, exercise) => {
            return total + exercise.series.length;
        }, 0);
        finalSets.textContent = totalSets;
        
        completionDiv.style.display = 'block';
    }
}

function saveGymWorkout() {
    console.log('💾 Guardando resultado del entrenamiento');
    
    const notes = document.getElementById('gym-workout-notes').value;
    gymWorkoutState.workoutData.notes = notes;
    gymWorkoutState.workoutData.exercises = gymWorkoutState.completedExercises;
    
    // Aquí guardarías en Firebase
    // Por ahora solo mostrar mensaje
    alert('¡Entrenamiento guardado exitosamente! 🎉');
    
    // Volver al dashboard
    window.navigateToPage('dashboard');
}

// ===================================
// FUNCIONES AUXILIARES
// ===================================

function generateExampleGymWorkout() {
    return {
        title: 'Push (Empuje) - Semana 1',
        description: 'Entrenamiento de tren superior - Empuje',
        muscleGroup: 'Pecho, Hombros, Tríceps',
        difficulty: 'intermediate',
        exercises: [
            {
                name: 'Press de Banca',
                sets: 4,
                reps: '8-12',
                notes: 'Peso moderado, técnica perfecta'
            },
            {
                name: 'Press Militar',
                sets: 3,
                reps: '10-14',
                notes: 'De pie, core activado'
            },
            {
                name: 'Elevaciones Laterales',
                sets: 3,
                reps: '12-15',
                notes: 'Control en la bajada'
            }
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
window.startGymWorkout = startGymWorkout;
window.pauseGymWorkout = pauseGymWorkout;
window.stopGymWorkout = stopGymWorkout;
window.completeExercise = completeExercise;
window.skipExercise = skipExercise;
window.saveGymWorkout = saveGymWorkout;

console.log('🏋️‍♂️ Sistema de gimnasio cargado');
