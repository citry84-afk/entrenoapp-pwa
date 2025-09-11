// Sistema de ejecución de entrenamientos de gimnasio
// Registro de pesos, reps, series y seguimiento de progreso

import { auth, db } from '../config/firebase-config.js';
import { 
    doc, 
    addDoc,
    collection,
    updateDoc,
    serverTimestamp,
    increment
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

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
        // Verificar si ya se completó el entrenamiento de hoy
        const todayKey = `gym_workout_completed_${new Date().toDateString()}`;
        const completedToday = localStorage.getItem(todayKey);
        
        if (completedToday) {
            console.log('✅ Entrenamiento de gimnasio ya completado hoy');
            renderGymWorkoutCompleted();
            setupSwipeNavigation();
            return;
        }
        
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
        
        // Configurar swipe para volver atrás
        setupSwipeNavigation();
        
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
        title: workout.title,
        description: workout.description,
        muscleGroup: workout.muscleGroup,
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
            <!-- Botón atrás -->
            <div class="back-button-container">
                <button class="back-button glass-button" onclick="window.navigateBack()">
                    <span class="back-icon">←</span>
                    <span class="back-text">Atrás</span>
                </button>
            </div>
            
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
                                <div class="exercise-name">${exercise.exerciseData?.name || exercise.name || 'Ejercicio'}</div>
                                <div class="exercise-sets-reps">${exercise.sets} series • ${exercise.reps} reps</div>
                            </div>
                            <div class="exercise-notes">${exercise.exerciseData?.description || exercise.notes || ''}</div>
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

// Renderizar pantalla de entrenamiento completado
function renderGymWorkoutCompleted() {
    const container = document.querySelector('.dashboard-container');
    if (!container) return;
    
    container.innerHTML = `
        <div class="gym-workout-container">
            <!-- Botón atrás -->
            <div class="back-button-container">
                <button class="back-button glass-button" onclick="window.navigateBack()">
                    <span class="back-icon">←</span>
                    <span class="back-text">Atrás</span>
                </button>
            </div>
            
            <div class="workout-completed glass-card">
                <div class="completed-icon">✅</div>
                <h1>¡Entrenamiento Completado!</h1>
                <p>Has completado tu sesión de gimnasio de hoy. ¡Excelente trabajo! 💪</p>
                <p class="completed-message">Vuelve mañana para tu próxima sesión de entrenamiento.</p>
                
                <div class="completed-actions">
                    <button class="glass-button glass-button-primary" onclick="window.navigateToPage('dashboard')">
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
        exerciseName.textContent = currentExercise.exerciseData?.name || currentExercise.name || 'Ejercicio';
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
    
    // Generar opciones de peso (0-200kg en incrementos de 2.5kg)
    const weightOptions = Array.from({ length: 81 }, (_, i) => (i * 2.5).toFixed(1));
    
    // Generar opciones de reps (1-50)
    const repsOptions = Array.from({ length: 50 }, (_, i) => i + 1);
    
    container.innerHTML = `
        <div class="series-form">
            ${Array.from({ length: sets }, (_, index) => `
                <div class="series-item">
                    <div class="series-number">Serie ${index + 1}</div>
                    <div class="series-inputs">
                        <div class="input-group">
                            <label>Peso (kg)</label>
                            <div class="scroll-select-container">
                                <select class="weight-input scroll-select" data-series="${index}">
                                    <option value="0">0 kg</option>
                                    ${weightOptions.map(weight => 
                                        `<option value="${weight}">${weight} kg</option>`
                                    ).join('')}
                                </select>
                            </div>
                        </div>
                        <div class="input-group">
                            <label>Reps</label>
                            <div class="scroll-select-container">
                                <select class="reps-input scroll-select" data-series="${index}">
                                    ${repsOptions.map(rep => 
                                        `<option value="${rep}" ${rep == exercise.reps ? 'selected' : ''}>${rep}</option>`
                                    ).join('')}
                                </select>
                            </div>
                        </div>
                        <div class="input-group">
                            <label>RPE</label>
                            <div class="scroll-select-container">
                                <select class="rpe-input scroll-select" data-series="${index}">
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

async function saveGymWorkout() {
    console.log('💾 Guardando resultado del entrenamiento');
    
    const notes = document.getElementById('gym-workout-notes').value;
    gymWorkoutState.workoutData.notes = notes;
    gymWorkoutState.workoutData.exercises = gymWorkoutState.completedExercises;
    
    try {
        // Guardar en Firestore
        await saveGymWorkoutToFirestore(gymWorkoutState.workoutData);
        
        // Marcar como completado para hoy
        const todayKey = `gym_workout_completed_${new Date().toDateString()}`;
        localStorage.setItem(todayKey, JSON.stringify({
            completed: true,
            completedAt: new Date().toISOString(),
            workoutData: gymWorkoutState.workoutData
        }));
        
        // Mostrar mensaje de éxito
        alert('¡Entrenamiento guardado exitosamente! 🎉');
        
        // Volver al dashboard
        window.navigateToPage('dashboard');
        
    } catch (error) {
        console.error('❌ Error guardando entrenamiento:', error);
        alert('Error guardando el entrenamiento. Inténtalo de nuevo.');
    }
}

// Guardar entrenamiento de gimnasio en Firestore
async function saveGymWorkoutToFirestore(workoutData) {
    try {
        const user = auth.currentUser;
        if (!user) throw new Error('Usuario no autenticado');
        
        // Calcular estadísticas del entrenamiento
        const totalVolume = calculateTotalVolume(workoutData.exercises);
        const duration = workoutData.totalTime || 0;
        
        const workoutDoc = {
            userId: user.uid,
            type: 'gym',
            date: serverTimestamp(),
            title: workoutData.title,
            description: workoutData.description,
            muscleGroup: workoutData.muscleGroup,
            difficulty: workoutData.difficulty,
            exercises: workoutData.exercises,
            totalVolume: totalVolume,
            duration: duration,
            notes: workoutData.notes,
            createdAt: serverTimestamp()
        };
        
        const docRef = await addDoc(collection(db, 'user-workouts'), workoutDoc);
        console.log('✅ Entrenamiento de gimnasio guardado con ID:', docRef.id);
        
        // Actualizar estadísticas del usuario
        await updateUserGymStats(totalVolume, duration);
        
    } catch (error) {
        console.error('❌ Error guardando entrenamiento de gimnasio:', error);
        throw error;
    }
}

// Calcular volumen total del entrenamiento
function calculateTotalVolume(exercises) {
    let totalVolume = 0;
    
    exercises.forEach(exercise => {
        if (exercise.sets) {
            exercise.sets.forEach(set => {
                if (set.weight && set.reps) {
                    totalVolume += set.weight * set.reps;
                }
            });
        }
    });
    
    return totalVolume;
}

// Actualizar estadísticas del usuario
async function updateUserGymStats(totalVolume, duration) {
    try {
        const user = auth.currentUser;
        if (!user) return;
        
        const userDoc = doc(db, 'users', user.uid);
        
        await updateDoc(userDoc, {
            'stats.totalWorkouts': increment(1),
            'stats.totalVolume': increment(totalVolume),
            'stats.totalTime': increment(Math.round(duration / 1000 / 60)), // en minutos
            'stats.lastWorkout': serverTimestamp(),
            'updatedAt': serverTimestamp()
        });
        
        console.log('✅ Estadísticas de gimnasio actualizadas');
        
    } catch (error) {
        console.error('❌ Error actualizando estadísticas de gimnasio:', error);
    }
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

// Configurar navegación por swipe
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
