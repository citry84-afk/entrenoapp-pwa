// Componente de entrenamientos de EntrenoApp
import { auth, db } from '../config/firebase-config.js';
import { exerciseDatabase, getExercisesByGroup, searchExercises } from '../data/exercises.js';
import { crossfitWods, getWodsByType, searchWods } from '../data/crossfit-wods.js';

// Estado del componente de entrenamientos
let workoutState = {
    currentMode: 'select', // 'select', 'gym', 'crossfit', 'active'
    selectedWorkoutType: null,
    currentWorkout: null,
    activeExercise: null,
    workoutTimer: null,
    workoutStartTime: null,
    exerciseHistory: [],
    restTimer: null,
    isResting: false,
    wakeLock: null
};

// Inicializar página de entrenamientos
window.initWorkouts = function() {
    console.log('💪 Inicializando entrenamientos');
    renderWorkoutsPage();
    setupWorkoutListeners();
};

// Renderizar página principal de entrenamientos
function renderWorkoutsPage() {
    const container = document.querySelector('.workouts-container');
    if (!container) return;
    
    let content = '';
    
    switch (workoutState.currentMode) {
        case 'select':
            content = renderWorkoutSelection();
            break;
        case 'gym':
            content = renderGymWorkouts();
            break;
        case 'crossfit':
            content = renderCrossfitWorkouts();
            break;
        case 'active':
            content = renderActiveWorkout();
            break;
        default:
            content = renderWorkoutSelection();
    }
    
    container.innerHTML = content;
    
    // Añadir animaciones
    const cards = container.querySelectorAll('.glass-card');
    cards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
        card.classList.add('glass-fade-in');
    });
}

// Selección principal de tipo de entrenamiento
function renderWorkoutSelection() {
    return `
        <div class="workout-selection">
            <div class="workout-types-grid">
                <div class="workout-type-card glass-card glass-gradient-orange" onclick="selectWorkoutType('gym')">
                    <div class="workout-type-icon">🏋️</div>
                    <h3 class="workout-type-title">Gimnasio</h3>
                    <p class="workout-type-description">
                        Entrenamiento con pesas tradicional. Grupos musculares específicos.
                    </p>
                    <div class="workout-type-stats">
                        <span class="stat-item">📊 20 ejercicios por grupo</span>
                        <span class="stat-item">⏱️ 45-90 min</span>
                        <span class="stat-item">💪 Fuerza & Masa</span>
                    </div>
                </div>
                
                <div class="workout-type-card glass-card glass-gradient-red" onclick="selectWorkoutType('crossfit')">
                    <div class="workout-type-icon">⚡</div>
                    <h3 class="workout-type-title">CrossFit</h3>
                    <p class="workout-type-description">
                        Entrenamientos funcionales de alta intensidad. WODs famosos.
                    </p>
                    <div class="workout-type-stats">
                        <span class="stat-item">🏆 Heroes & Games</span>
                        <span class="stat-item">⏱️ 5-45 min</span>
                        <span class="stat-item">🔥 Intensidad máxima</span>
                    </div>
                </div>
                
                <div class="workout-type-card glass-card glass-gradient-green" onclick="selectWorkoutType('custom')">
                    <div class="workout-type-icon">🎯</div>
                    <h3 class="workout-type-title">Personalizado</h3>
                    <p class="workout-type-description">
                        Crea tu propio entrenamiento combinando ejercicios.
                    </p>
                    <div class="workout-type-stats">
                        <span class="stat-item">⚙️ Totalmente flexible</span>
                        <span class="stat-item">📝 Tu diseño</span>
                        <span class="stat-item">🎨 Sin límites</span>
                    </div>
                </div>
            </div>
            
            <div class="quick-workouts glass-card mt-lg">
                <div class="card-header">
                    <h3 class="card-title">🚀 Entrenamientos Rápidos</h3>
                </div>
                
                <div class="quick-workouts-grid">
                    <button class="quick-workout-btn glass-button" onclick="startQuickWorkout('upper_body')">
                        <span class="quick-workout-icon">💪</span>
                        <span class="quick-workout-name">Tren Superior</span>
                        <span class="quick-workout-time">30 min</span>
                    </button>
                    
                    <button class="quick-workout-btn glass-button" onclick="startQuickWorkout('lower_body')">
                        <span class="quick-workout-icon">🦵</span>
                        <span class="quick-workout-name">Tren Inferior</span>
                        <span class="quick-workout-time">35 min</span>
                    </button>
                    
                    <button class="quick-workout-btn glass-button" onclick="startQuickWorkout('full_body')">
                        <span class="quick-workout-icon">🏃</span>
                        <span class="quick-workout-name">Cuerpo Completo</span>
                        <span class="quick-workout-time">45 min</span>
                    </button>
                    
                    <button class="quick-workout-btn glass-button" onclick="startQuickWorkout('hiit')">
                        <span class="quick-workout-icon">🔥</span>
                        <span class="quick-workout-name">HIIT</span>
                        <span class="quick-workout-time">20 min</span>
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Entrenamientos de gimnasio
function renderGymWorkouts() {
    const muscleGroups = [
        { id: 'chest', name: 'Pecho', icon: '💪', color: 'orange' },
        { id: 'back', name: 'Espalda', icon: '🦅', color: 'blue' },
        { id: 'legs', name: 'Piernas', icon: '🦵', color: 'green' },
        { id: 'shoulders', name: 'Hombros', icon: '🔺', color: 'purple' },
        { id: 'arms', name: 'Brazos', icon: '💪', color: 'red' },
        { id: 'core', name: 'Core', icon: '⭐', color: 'yellow' }
    ];
    
    return `
        <div class="gym-workouts">
            <div class="workout-header">
                <button class="glass-button back-button" onclick="backToWorkoutSelection()">
                    ← Volver
                </button>
                <h2 class="workout-title">🏋️ Entrenamiento de Gimnasio</h2>
            </div>
            
            <div class="muscle-groups-grid">
                ${muscleGroups.map(group => `
                    <div class="muscle-group-card glass-card glass-gradient-${group.color}" onclick="selectMuscleGroup('${group.id}')">
                        <div class="muscle-group-icon">${group.icon}</div>
                        <h3 class="muscle-group-name">${group.name}</h3>
                        <p class="muscle-group-count">${getExercisesByGroup(group.id).length} ejercicios</p>
                        <div class="muscle-group-difficulty">
                            <span class="difficulty-badge principiante">🟢 Principiante</span>
                            <span class="difficulty-badge intermedio">🟡 Intermedio</span>
                            <span class="difficulty-badge avanzado">🔴 Avanzado</span>
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <div class="gym-programs glass-card mt-lg">
                <div class="card-header">
                    <h3 class="card-title">📋 Rutinas Predefinidas</h3>
                </div>
                
                <div class="programs-grid">
                    <div class="program-card glass-effect" onclick="selectProgram('push_pull_legs')">
                        <h4 class="program-name">Push/Pull/Legs</h4>
                        <p class="program-description">Rutina clásica de 3 días</p>
                        <div class="program-details">
                            <span>📅 3 días/semana</span>
                            <span>⏱️ 60-90 min</span>
                            <span>🎯 Intermedio</span>
                        </div>
                    </div>
                    
                    <div class="program-card glass-effect" onclick="selectProgram('upper_lower')">
                        <h4 class="program-name">Upper/Lower</h4>
                        <p class="program-description">Dividir tren superior e inferior</p>
                        <div class="program-details">
                            <span>📅 4 días/semana</span>
                            <span>⏱️ 45-75 min</span>
                            <span>🎯 Principiante</span>
                        </div>
                    </div>
                    
                    <div class="program-card glass-effect" onclick="selectProgram('full_body')">
                        <h4 class="program-name">Full Body</h4>
                        <p class="program-description">Cuerpo completo cada sesión</p>
                        <div class="program-details">
                            <span>📅 3 días/semana</span>
                            <span>⏱️ 45-60 min</span>
                            <span>🎯 Principiante</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Entrenamientos de CrossFit
function renderCrossfitWorkouts() {
    const wodTypes = [
        { id: 'heroes', name: 'Heroes', icon: '🏅', description: 'WODs en honor a héroes caídos' },
        { id: 'games', name: 'CrossFit Games', icon: '🏆', description: 'WODs de competiciones oficiales' },
        { id: 'open', name: 'CrossFit Open', icon: '🌍', description: 'WODs del Open mundial' },
        { id: 'classics', name: 'Clásicos', icon: '⭐', description: 'WODs fundamentales' },
        { id: 'emoms', name: 'EMOMs', icon: '⏰', description: 'Every Minute On the Minute' }
    ];
    
    return `
        <div class="crossfit-workouts">
            <div class="workout-header">
                <button class="glass-button back-button" onclick="backToWorkoutSelection()">
                    ← Volver
                </button>
                <h2 class="workout-title">⚡ CrossFit WODs</h2>
            </div>
            
            <div class="wod-types-grid">
                ${wodTypes.map(type => `
                    <div class="wod-type-card glass-card" onclick="selectWodType('${type.id}')">
                        <div class="wod-type-icon">${type.icon}</div>
                        <h3 class="wod-type-name">${type.name}</h3>
                        <p class="wod-type-description">${type.description}</p>
                        <p class="wod-type-count">${getWodsByType(type.id).length} WODs disponibles</p>
                    </div>
                `).join('')}
            </div>
            
            <div class="featured-wods glass-card mt-lg">
                <div class="card-header">
                    <h3 class="card-title">🔥 WODs Destacados</h3>
                </div>
                
                <div class="featured-wods-list">
                    <div class="featured-wod glass-effect" onclick="startWod('hero_001')">
                        <div class="wod-info">
                            <h4 class="wod-name">Murph</h4>
                            <p class="wod-description">El WOD Hero más famoso</p>
                            <div class="wod-meta">
                                <span class="wod-time">45-60 min</span>
                                <span class="wod-difficulty avanzado">🔴 Avanzado</span>
                            </div>
                        </div>
                        <div class="wod-preview">
                            <span>1 milla + 100 dominadas + 200 flexiones + 300 sentadillas + 1 milla</span>
                        </div>
                    </div>
                    
                    <div class="featured-wod glass-effect" onclick="startWod('hero_002')">
                        <div class="wod-info">
                            <h4 class="wod-name">Fran</h4>
                            <p class="wod-description">Benchmark clásico</p>
                            <div class="wod-meta">
                                <span class="wod-time">5-15 min</span>
                                <span class="wod-difficulty intermedio">🟡 Intermedio</span>
                            </div>
                        </div>
                        <div class="wod-preview">
                            <span>21-15-9 Thrusters (95/65) + Pull-ups</span>
                        </div>
                    </div>
                    
                    <div class="featured-wod glass-effect" onclick="startWod('hero_005')">
                        <div class="wod-info">
                            <h4 class="wod-name">Cindy</h4>
                            <p class="wod-description">Perfecto para principiantes</p>
                            <div class="wod-meta">
                                <span class="wod-time">20 min</span>
                                <span class="wod-difficulty principiante">🟢 Principiante</span>
                            </div>
                        </div>
                        <div class="wod-preview">
                            <span>AMRAP 20 min: 5 Pull-ups + 10 Push-ups + 15 Squats</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Entrenamiento activo
function renderActiveWorkout() {
    if (!workoutState.currentWorkout) {
        return '<div class="error">No hay entrenamiento activo</div>';
    }
    
    const workout = workoutState.currentWorkout;
    const exercise = workoutState.activeExercise;
    
    return `
        <div class="active-workout">
            <div class="workout-header glass-header">
                <div class="workout-info">
                    <h2 class="workout-name">${workout.name}</h2>
                    <div class="workout-timer" id="workout-timer">
                        ${formatTime(getWorkoutElapsedTime())}
                    </div>
                </div>
                <div class="workout-controls">
                    <button class="glass-button control-btn" onclick="pauseWorkout()">
                        ${workoutState.workoutTimer ? '⏸️' : '▶️'}
                    </button>
                    <button class="glass-button control-btn" onclick="stopWorkout()">
                        ⏹️
                    </button>
                </div>
            </div>
            
            ${exercise ? renderActiveExercise(exercise) : renderWorkoutOverview(workout)}
            
            <div class="workout-progress glass-card">
                <div class="progress-header">
                    <h3>📊 Progreso del Entrenamiento</h3>
                    <span class="exercise-count">${workoutState.exerciseHistory.length}/${workout.exercises?.length || 'N/A'} ejercicios</span>
                </div>
                
                <div class="exercise-list">
                    ${workout.exercises?.map((ex, index) => `
                        <div class="exercise-item ${index < workoutState.exerciseHistory.length ? 'completed' : index === workoutState.exerciseHistory.length ? 'active' : ''}">
                            <span class="exercise-name">${ex.name}</span>
                            <span class="exercise-sets">${ex.sets || ex.reps || ex.duration}</span>
                            ${index < workoutState.exerciseHistory.length ? '<span class="exercise-status">✅</span>' : index === workoutState.exerciseHistory.length ? '<span class="exercise-status">🔄</span>' : '<span class="exercise-status">⏳</span>'}
                        </div>
                    `).join('') || ''}
                </div>
            </div>
        </div>
    `;
}

// Ejercicio activo
function renderActiveExercise(exercise) {
    return `
        <div class="active-exercise glass-card glass-card-active">
            <div class="exercise-header">
                <h3 class="exercise-name">${exercise.name}</h3>
                <span class="exercise-group">${exercise.muscleGroup}</span>
            </div>
            
            <div class="exercise-description">
                <p>${exercise.description}</p>
            </div>
            
            <div class="exercise-instructions">
                <h4>📝 Instrucciones:</h4>
                <ol>
                    ${exercise.instructions?.map(instruction => `<li>${instruction}</li>`).join('') || '<li>Sigue la técnica adecuada</li>'}
                </ol>
            </div>
            
            <div class="exercise-controls">
                <div class="sets-reps-control">
                    <div class="control-group">
                        <label>Series</label>
                        <div class="control-buttons">
                            <button class="glass-button control-btn" onclick="adjustSets(-1)">-</button>
                            <span class="control-value" id="current-sets">${exercise.currentSets || 1}</span>
                            <button class="glass-button control-btn" onclick="adjustSets(1)">+</button>
                        </div>
                    </div>
                    
                    <div class="control-group">
                        <label>Repeticiones</label>
                        <div class="control-buttons">
                            <button class="glass-button control-btn" onclick="adjustReps(-1)">-</button>
                            <span class="control-value" id="current-reps">${exercise.currentReps || 10}</span>
                            <button class="glass-button control-btn" onclick="adjustReps(1)">+</button>
                        </div>
                    </div>
                    
                    <div class="control-group">
                        <label>Peso (kg)</label>
                        <div class="control-buttons">
                            <button class="glass-button control-btn" onclick="adjustWeight(-2.5)">-</button>
                            <span class="control-value" id="current-weight">${exercise.currentWeight || 0}</span>
                            <button class="glass-button control-btn" onclick="adjustWeight(2.5)">+</button>
                        </div>
                    </div>
                </div>
                
                <div class="exercise-actions">
                    <button class="glass-button glass-button-primary" onclick="completeSet()">
                        ✅ Completar Serie
                    </button>
                    <button class="glass-button" onclick="startRestTimer()">
                        ⏰ Descanso (${exercise.restTime || 60}s)
                    </button>
                    <button class="glass-button" onclick="nextExercise()">
                        ⏭️ Siguiente Ejercicio
                    </button>
                </div>
                
                <div class="exercise-video">
                    <button class="glass-button" onclick="showExerciseVideo('${exercise.youtubeSearch || exercise.name + ' gym'}')">
                        📹 Ver Técnica
                    </button>
                </div>
            </div>
            
            ${workoutState.isResting ? renderRestTimer() : ''}
        </div>
    `;
}

// Timer de descanso
function renderRestTimer() {
    return `
        <div class="rest-timer glass-card glass-gradient-blue">
            <div class="rest-timer-content">
                <h3>💤 Descansando</h3>
                <div class="rest-timer-display" id="rest-timer-display">
                    01:00
                </div>
                <div class="rest-timer-controls">
                    <button class="glass-button" onclick="addRestTime(30)">+30s</button>
                    <button class="glass-button glass-button-primary" onclick="skipRest()">Saltar</button>
                    <button class="glass-button" onclick="addRestTime(-30)">-30s</button>
                </div>
            </div>
        </div>
    `;
}

// Configurar listeners de entrenamientos
function setupWorkoutListeners() {
    // Mantener pantalla encendida durante entrenamientos
    if (workoutState.currentMode === 'active') {
        enableWakeLock();
    }
    
    // Actualizar timer cada segundo
    if (workoutState.currentMode === 'active') {
        setInterval(updateWorkoutTimer, 1000);
    }
}

// Funciones de navegación
window.selectWorkoutType = function(type) {
    workoutState.selectedWorkoutType = type;
    workoutState.currentMode = type;
    renderWorkoutsPage();
};

window.backToWorkoutSelection = function() {
    workoutState.currentMode = 'select';
    workoutState.selectedWorkoutType = null;
    renderWorkoutsPage();
};

window.selectMuscleGroup = function(muscleGroup) {
    const exercises = getExercisesByGroup(muscleGroup);
    
    // Crear entrenamiento personalizado del grupo muscular
    const workout = {
        id: `${muscleGroup}_workout`,
        name: `Entrenamiento de ${muscleGroup.charAt(0).toUpperCase() + muscleGroup.slice(1)}`,
        type: 'gym',
        muscleGroup: muscleGroup,
        exercises: exercises.slice(0, 6), // Primeros 6 ejercicios
        estimatedTime: 45
    };
    
    startWorkout(workout);
};

window.startWorkout = function(workout) {
    workoutState.currentWorkout = workout;
    workoutState.currentMode = 'active';
    workoutState.workoutStartTime = Date.now();
    workoutState.exerciseHistory = [];
    workoutState.activeExercise = workout.exercises?.[0] || null;
    
    // Inicializar valores del ejercicio
    if (workoutState.activeExercise) {
        workoutState.activeExercise.currentSets = 1;
        workoutState.activeExercise.currentReps = 10;
        workoutState.activeExercise.currentWeight = 0;
        workoutState.activeExercise.restTime = 60;
    }
    
    enableWakeLock();
    renderWorkoutsPage();
    
    // Anuncio de inicio con TTS
    if (window.EntrenoTTS) {
        window.EntrenoTTS.announceWorkoutStart(workout.name);
    }
    
    console.log('🏋️ Entrenamiento iniciado:', workout.name);
};

window.startWod = function(wodId) {
    // Buscar el WOD por ID en todas las categorías
    let wod = null;
    for (const type in crossfitWods) {
        wod = crossfitWods[type].find(w => w.id === wodId);
        if (wod) break;
    }
    
    if (!wod) {
        console.error('WOD no encontrado:', wodId);
        return;
    }
    
    // Convertir WOD a formato de entrenamiento
    const workout = {
        id: wod.id,
        name: wod.name,
        type: 'crossfit',
        description: wod.description,
        structure: wod.workout.structure,
        movements: wod.workout.movements,
        exercises: wod.workout.movements || [],
        estimatedTime: parseInt(wod.timeNeeded) || 20
    };
    
    startWorkout(workout);
};

// Funciones de control de ejercicios
window.adjustSets = function(delta) {
    if (!workoutState.activeExercise) return;
    
    const newSets = Math.max(1, (workoutState.activeExercise.currentSets || 1) + delta);
    workoutState.activeExercise.currentSets = newSets;
    
    document.getElementById('current-sets').textContent = newSets;
};

window.adjustReps = function(delta) {
    if (!workoutState.activeExercise) return;
    
    const newReps = Math.max(1, (workoutState.activeExercise.currentReps || 10) + delta);
    workoutState.activeExercise.currentReps = newReps;
    
    document.getElementById('current-reps').textContent = newReps;
};

window.adjustWeight = function(delta) {
    if (!workoutState.activeExercise) return;
    
    const newWeight = Math.max(0, (workoutState.activeExercise.currentWeight || 0) + delta);
    workoutState.activeExercise.currentWeight = newWeight;
    
    document.getElementById('current-weight').textContent = newWeight;
};

window.completeSet = function() {
    if (!workoutState.activeExercise) return;
    
    const setData = {
        exercise: workoutState.activeExercise.name,
        sets: workoutState.activeExercise.currentSets,
        reps: workoutState.activeExercise.currentReps,
        weight: workoutState.activeExercise.currentWeight,
        timestamp: Date.now()
    };
    
    workoutState.exerciseHistory.push(setData);
    
    // Anuncio TTS de serie completada
    if (window.EntrenoTTS) {
        const currentSet = workoutState.activeExercise.currentSets;
        const totalSets = 3; // Por defecto, podría ser configurable
        window.EntrenoTTS.announceSetComplete(currentSet, totalSets);
    }
    
    // Mostrar feedback
    showToast('✅ Serie completada', 'success');
    
    console.log('✅ Serie completada:', setData);
};

window.nextExercise = function() {
    if (!workoutState.currentWorkout?.exercises) return;
    
    const currentIndex = workoutState.currentWorkout.exercises.findIndex(
        ex => ex.id === workoutState.activeExercise?.id
    );
    
    const nextIndex = currentIndex + 1;
    
    if (nextIndex < workoutState.currentWorkout.exercises.length) {
        workoutState.activeExercise = workoutState.currentWorkout.exercises[nextIndex];
        workoutState.activeExercise.currentSets = 1;
        workoutState.activeExercise.currentReps = 10;
        workoutState.activeExercise.currentWeight = 0;
        renderWorkoutsPage();
    } else {
        // Entrenamiento completado
        completeWorkout();
    }
};

window.completeWorkout = function() {
    const workoutData = {
        workout: workoutState.currentWorkout,
        duration: getWorkoutElapsedTime(),
        exerciseHistory: workoutState.exerciseHistory,
        completedAt: Date.now()
    };
    
    // Guardar en localStorage temporalmente
    saveWorkoutData(workoutData);
    
    disableWakeLock();
    
    showToast('🎉 ¡Entrenamiento completado!', 'success');
    
    // Volver al dashboard
    setTimeout(() => {
        navigateToPage('dashboard');
    }, 2000);
    
    console.log('🎉 Entrenamiento completado:', workoutData);
};

// Funciones de temporizadores
window.startRestTimer = function(duration = 60) {
    workoutState.isResting = true;
    let timeLeft = duration;
    
    workoutState.restTimer = setInterval(() => {
        timeLeft--;
        
        const display = document.getElementById('rest-timer-display');
        if (display) {
            display.textContent = formatTime(timeLeft);
        }
        
        if (timeLeft <= 0) {
            clearInterval(workoutState.restTimer);
            workoutState.isResting = false;
            showToast('⏰ ¡Descanso terminado!', 'info');
            renderWorkoutsPage();
        }
    }, 1000);
    
    renderWorkoutsPage();
};

window.skipRest = function() {
    if (workoutState.restTimer) {
        clearInterval(workoutState.restTimer);
        workoutState.restTimer = null;
    }
    workoutState.isResting = false;
    renderWorkoutsPage();
};

window.showExerciseVideo = function(searchTerm) {
    const youtubeUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchTerm)}`;
    window.open(youtubeUrl, '_blank');
};

// Funciones de utilidad
function getWorkoutElapsedTime() {
    if (!workoutState.workoutStartTime) return 0;
    return Math.floor((Date.now() - workoutState.workoutStartTime) / 1000);
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function updateWorkoutTimer() {
    const timerElement = document.getElementById('workout-timer');
    if (timerElement && workoutState.workoutStartTime) {
        timerElement.textContent = formatTime(getWorkoutElapsedTime());
    }
}

function enableWakeLock() {
    if ('wakeLock' in navigator && window.keepScreenOn) {
        window.keepScreenOn().then(wakeLock => {
            workoutState.wakeLock = wakeLock;
        });
    }
}

function disableWakeLock() {
    if (workoutState.wakeLock && window.releaseScreenLock) {
        window.releaseScreenLock(workoutState.wakeLock);
        workoutState.wakeLock = null;
    }
}

function saveWorkoutData(workoutData) {
    try {
        const existingWorkouts = JSON.parse(localStorage.getItem('entrenoapp_workouts') || '[]');
        existingWorkouts.push(workoutData);
        localStorage.setItem('entrenoapp_workouts', JSON.stringify(existingWorkouts));
    } catch (error) {
        console.error('Error guardando entrenamiento:', error);
    }
}

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

console.log('💪 Componente de entrenamientos cargado');
