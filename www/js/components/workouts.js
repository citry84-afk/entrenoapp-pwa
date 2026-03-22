// Sistema completo de entrenamientos para EntrenoApp
import { auth, db } from '../config/firebase-config.js';
import { exerciseDatabase, getExercisesByGroup, searchExercises } from '../data/exercises.js';
import { crossfitWods, getWodsByType, searchWods } from '../data/crossfit-wods.js';
import { 
    doc, 
    collection,
    addDoc,
    updateDoc,
    getDoc,
    query,
    where,
    orderBy,
    limit,
    getDocs,
    serverTimestamp,
    increment
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Estado global del sistema de entrenamientos
let workoutState = {
    // Navegación y modos
    currentMode: 'select', // 'select', 'gym-plan', 'crossfit-plan', 'active-gym', 'active-crossfit', 'plan-management'
    workoutType: null, // 'gym', 'crossfit'
    
    // Planes activos
    activePlan: null,
    currentSession: null,
    sessionStartTime: null,
    
    // Ejercicio actual
    activeExercise: null,
    currentSet: 0,
    exerciseStartTime: null,
    
    // Timers
    workoutTimer: null,
    restTimer: null,
    exerciseTimer: null,
    intervalId: null,
    
    // Estados
    isWorkoutActive: false,
    isResting: false,
    isPaused: false,
    
    // Datos de la sesión
    workoutData: {},
    exerciseHistory: [],
    totalVolume: 0,
    totalTime: 0,
    
    // Configuración
    restTime: 60, // segundos por defecto
    autoRestStart: true,
    keepScreenOn: true,
    isVoiceEnabled: true,
    
    // UI
    wakeLock: null,
    
    // Progresión automática
    lastWorkoutData: null,
    suggestedProgressions: {}
};

// Constantes para planificación
const GYM_MUSCLE_GROUPS = [
    { id: 'chest', name: 'Pecho', icon: '💪', color: '#ef4444' },
    { id: 'back', name: 'Espalda', icon: '🦅', color: '#3b82f6' },
    { id: 'shoulders', name: 'Hombros', icon: '🔥', color: '#f59e0b' },
    { id: 'arms', name: 'Brazos', icon: '💪', color: '#8b5cf6' },
    { id: 'legs', name: 'Piernas', icon: '🦵', color: '#22c55e' },
    { id: 'core', name: 'Core', icon: '⚡', color: '#ef4444' }
];

const CROSSFIT_WOD_TYPES = [
    { id: 'amrap', name: 'AMRAP', description: 'As Many Rounds As Possible', icon: '🔄' },
    { id: 'emom', name: 'EMOM', description: 'Every Minute On the Minute', icon: '⏱️' },
    { id: 'tabata', name: 'Tabata', description: '20s trabajo, 10s descanso', icon: '⚡' },
    { id: 'for_time', name: 'For Time', description: 'Completar lo más rápido posible', icon: '🏃‍♂️' },
    { id: 'hero', name: 'Hero WODs', description: 'WODs dedicados a héroes caídos', icon: '🎖️' },
    { id: 'girls', name: 'Girl WODs', description: 'WODs clásicos con nombres femeninos', icon: '👩‍🎓' }
];

// Inicializar componente
window.initWorkouts = async function() {
    console.log('💪 Inicializando sistema de entrenamientos');
    await loadUserWorkoutSettings();
    renderWorkoutsPage();
    setupWorkoutListeners();
    
    // Cargar estadísticas semanales
    await loadWeeklyStats();
};

// Cargar configuraciones del usuario
async function loadUserWorkoutSettings() {
    try {
        const user = auth.currentUser;
        if (user && window.getUserProfile) {
            const profile = await window.getUserProfile(user.uid);
            if (profile) {
                workoutState.restTime = profile.preferences?.defaultRestTime || 60;
                workoutState.autoRestStart = profile.preferences?.autoRestStart !== false;
                workoutState.isVoiceEnabled = profile.preferences?.ttsEnabled !== false;
                
                // Cargar último entrenamiento para progresión
                await loadLastWorkoutData();
            }
        }
    } catch (error) {
        console.error('❌ Error cargando configuraciones:', error);
    }
}

// Cargar datos del último entrenamiento
async function loadLastWorkoutData() {
    try {
        const user = auth.currentUser;
        if (!user) return;
        
        const workoutsQuery = query(
            collection(db, 'user-workouts'),
            where('userId', '==', user.uid),
            where('type', 'in', ['gym', 'crossfit']),
            orderBy('date', 'desc'),
            limit(1)
        );
        
        const querySnapshot = await getDocs(workoutsQuery);
        if (!querySnapshot.empty) {
            workoutState.lastWorkoutData = querySnapshot.docs[0].data();
        }
        
    } catch (error) {
        console.error('❌ Error cargando último entrenamiento:', error);
    }
}

// Cargar estadísticas semanales
async function loadWeeklyStats() {
    try {
        const user = auth.currentUser;
        if (!user) return;
        
        // Calcular inicio de la semana (lunes)
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay() + 1);
        startOfWeek.setHours(0, 0, 0, 0);
        
        // Calcular fin de la semana (domingo)
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);
        
        console.log('📊 Cargando estadísticas semanales:', {
            startOfWeek: startOfWeek.toISOString(),
            endOfWeek: endOfWeek.toISOString()
        });
        
        // Consultar entrenamientos de esta semana
        const workoutsQuery = query(
            collection(db, 'user-workouts'),
            where('userId', '==', user.uid),
            where('date', '>=', startOfWeek),
            where('date', '<=', endOfWeek),
            orderBy('date', 'desc')
        );
        
        const querySnapshot = await getDocs(workoutsQuery);
        
        let weeklyStats = {
            workouts: 0,
            volume: 0,
            time: 0,
            streak: 0
        };
        
        // Procesar entrenamientos de la semana
        querySnapshot.forEach(doc => {
            const workout = doc.data();
            weeklyStats.workouts++;
            
            if (workout.totalVolume) {
                weeklyStats.volume += workout.totalVolume;
            }
            
            if (workout.duration) {
                weeklyStats.time += Math.round(workout.duration / 1000 / 60); // convertir a minutos
            }
        });
        
        // Calcular racha actual
        weeklyStats.streak = await calculateCurrentStreak();
        
        console.log('✅ Estadísticas semanales cargadas:', weeklyStats);
        
        // Actualizar UI
        updateWeeklyStatsUI(weeklyStats);
        
    } catch (error) {
        console.error('❌ Error cargando estadísticas semanales:', error);
    }
}

// Calcular racha actual
async function calculateCurrentStreak() {
    try {
        const user = auth.currentUser;
        if (!user) return 0;
        
        // Consultar todos los entrenamientos ordenados por fecha
        const workoutsQuery = query(
            collection(db, 'user-workouts'),
            where('userId', '==', user.uid),
            orderBy('date', 'desc')
        );
        
        const querySnapshot = await getDocs(workoutsQuery);
        let streak = 0;
        let currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);
        
        // Agrupar entrenamientos por día
        const workoutsByDay = {};
        querySnapshot.forEach(doc => {
            const workout = doc.data();
            const workoutDate = workout.date.toDate();
            const dayKey = workoutDate.toISOString().split('T')[0];
            
            if (!workoutsByDay[dayKey]) {
                workoutsByDay[dayKey] = [];
            }
            workoutsByDay[dayKey].push(workout);
        });
        
        // Calcular racha hacia atrás
        while (true) {
            const dayKey = currentDate.toISOString().split('T')[0];
            
            if (workoutsByDay[dayKey] && workoutsByDay[dayKey].length > 0) {
                streak++;
                currentDate.setDate(currentDate.getDate() - 1);
            } else {
                break;
            }
        }
        
        return streak;
        
    } catch (error) {
        console.error('❌ Error calculando racha:', error);
        return 0;
    }
}

// Actualizar UI de estadísticas semanales
function updateWeeklyStatsUI(stats) {
    const weeklyWorkoutsEl = document.getElementById('weekly-workouts');
    const weeklyVolumeEl = document.getElementById('weekly-volume');
    const weeklyTimeEl = document.getElementById('weekly-time');
    const weeklyStreakEl = document.getElementById('weekly-streak');
    
    if (weeklyWorkoutsEl) {
        weeklyWorkoutsEl.textContent = stats.workouts;
    }
    
    if (weeklyVolumeEl) {
        weeklyVolumeEl.textContent = `${stats.volume}kg`;
    }
    
    if (weeklyTimeEl) {
        weeklyTimeEl.textContent = `${stats.time}min`;
    }
    
    if (weeklyStreakEl) {
        weeklyStreakEl.textContent = stats.streak;
    }
}

// Renderizar página principal
function renderWorkoutsPage() {
    const container = document.querySelector('.workouts-container');
    if (!container) return;
    
    let content = '';
    
    switch (workoutState.currentMode) {
        case 'select':
            content = renderWorkoutSelection();
            break;
        case 'gym-plan':
            content = renderGymPlanning();
            break;
        case 'crossfit-plan':
            content = renderCrossfitPlanning();
            break;
        case 'active-gym':
            content = renderActiveGymWorkout();
            break;
        case 'active-crossfit':
            content = renderActiveCrossfitWorkout();
            break;
        case 'plan-management':
            content = renderPlanManagement();
            break;
        default:
            content = renderWorkoutSelection();
    }
    
    container.innerHTML = content;
    
    // Inicializar componentes específicos
    setTimeout(() => {
        initializeModeSpecificComponents();
    }, 100);
}

// Renderizar selección de tipo de entrenamiento
function renderWorkoutSelection() {
    return `
        <div class="workout-selection glass-fade-in">
            <div class="workout-header text-center mb-lg">
                <h2 class="page-title">💪 Entrenamientos</h2>
                <p class="page-subtitle text-secondary">Gym tradicional y entrenamiento funcional</p>
            </div>
            
            <!-- Planes activos -->
            ${renderActivePlansSection()}
            
            <!-- Tipos de entrenamiento -->
            <div class="workout-types glass-card mb-lg">
                <h3 class="section-title mb-md">🎯 Tipos de Entrenamiento</h3>
                <div class="workout-type-grid">
                    <div class="workout-type-card gym-card" data-type="gym">
                        <div class="type-icon">🏋️‍♀️</div>
                        <h4 class="type-title">Gym Tradicional</h4>
                        <p class="type-description">Entrenamiento con pesas por grupos musculares</p>
                        <div class="type-features">
                            <span class="feature-tag">📊 Seguimiento de peso</span>
                            <span class="feature-tag">🔄 Progresión automática</span>
                            <span class="feature-tag">⏱️ Descansos inteligentes</span>
                        </div>
                    </div>
                    
                    <div class="workout-type-card crossfit-card" data-type="crossfit">
                        <div class="type-icon">🤸‍♂️</div>
                        <h4 class="type-title">Entrenamiento Funcional</h4>
                        <p class="type-description">WODs, AMRAP, EMOM y entrenamientos funcionales</p>
                        <div class="type-features">
                            <span class="feature-tag">⏰ Timers especializados</span>
                            <span class="feature-tag">🔥 WODs famosos</span>
                            <span class="feature-tag">📈 Puntuación por rendimiento</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Entrenamiento rápido -->
            <div class="quick-workout glass-card mb-lg">
                <h3 class="section-title mb-md">⚡ Entrenamiento Rápido</h3>
                <div class="quick-options">
                    <button class="quick-btn glass-button glass-button-primary" data-quick="upper">
                        <span class="quick-icon">💪</span>
                        <span class="quick-text">Tren Superior (20 min)</span>
                    </button>
                    <button class="quick-btn glass-button glass-button-secondary" data-quick="lower">
                        <span class="quick-icon">🦵</span>
                        <span class="quick-text">Tren Inferior (20 min)</span>
                    </button>
                    <button class="quick-btn glass-button glass-button-secondary" data-quick="hiit">
                        <span class="quick-icon">🔥</span>
                        <span class="quick-text">HIIT (15 min)</span>
                    </button>
                </div>
            </div>
            
            <!-- Estadísticas rápidas -->
            <div class="workout-stats glass-card">
                <h3 class="section-title mb-md">📊 Esta Semana</h3>
                <div class="stats-grid">
                    <div class="stat-item">
                        <div class="stat-value" id="weekly-workouts">0</div>
                        <div class="stat-label">Entrenamientos</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value" id="weekly-volume">0kg</div>
                        <div class="stat-label">Volumen</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value" id="weekly-time">0min</div>
                        <div class="stat-label">Tiempo</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value" id="weekly-streak">0</div>
                        <div class="stat-label">Racha</div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Renderizar sección de planes activos
function renderActivePlansSection() {
    const savedPlan = localStorage.getItem('entrenoapp_active_plan');
    let plan = null;
    if (savedPlan) {
        try {
            const p = JSON.parse(savedPlan);
            if (p && p.status !== 'paused') plan = p;
        } catch (e) {}
    }
    
    const totalWeeks = plan ? (plan.duration || plan.totalWeeks || 8) : 0;
    const currentWeek = plan ? (plan.currentWeek || 1) : 0;
    const progressPct = totalWeeks > 0 ? Math.min(100, (currentWeek / totalWeeks) * 100) : 0;
    
    return `
        <div class="active-plans glass-card mb-lg">
            <div class="section-header" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
                <h3 class="section-title">🎯 Planes Activos</h3>
                <button id="manage-plans-btn" class="glass-button glass-button-outline btn-sm" aria-label="Gestionar planes de entrenamiento">
                    Gestionar
                </button>
            </div>
            <div class="active-plans-list">
                ${plan ? `
                    <div class="plan-preview glass-card-inner" style="padding: 1rem;">
                        <h4 style="margin: 0 0 8px;">${plan.name || 'Mi Plan'}</h4>
                        <p class="text-secondary" style="font-size: 0.9rem; margin: 0 0 12px;">${plan.description || ''}</p>
                        <div class="progress-bar" style="height: 6px; border-radius: 3px; background: rgba(255,255,255,0.2); overflow: hidden;">
                            <div class="progress-fill" style="height: 100%; width: ${progressPct}%; background: #00D4FF; transition: width 0.3s;"></div>
                        </div>
                        <p class="text-secondary" style="font-size: 0.85rem; margin: 8px 0 0;">Semana ${currentWeek} de ${totalWeeks}</p>
                    </div>
                ` : `
                    <p class="text-secondary" style="font-size: 0.9rem; margin: 0;">No tienes un plan activo. Ve a <strong>Gestionar</strong> para crear uno.</p>
                `}
            </div>
        </div>
    `;
}

// Renderizar planificación de gym
function renderGymPlanning() {
    return `
        <div class="gym-planning glass-fade-in">
            <div class="planning-header">
                <button id="back-to-selection" class="glass-button glass-button-outline">
                    ← Volver
                </button>
                <h2 class="page-title">🏋️‍♀️ Planificación Gym</h2>
            </div>
            
            <!-- Grupos musculares -->
            <div class="muscle-groups glass-card mb-lg">
                <h3 class="section-title mb-md">🎯 Selecciona Grupos Musculares</h3>
                <div class="muscle-group-grid">
                    ${renderMuscleGroups()}
                </div>
            </div>
            
            <!-- Configuración del entrenamiento -->
            <div class="workout-config glass-card mb-lg">
                <h3 class="section-title mb-md">⚙️ Configuración</h3>
                <div class="config-grid">
                    <div class="config-item">
                        <label class="config-label">Tiempo de descanso</label>
                        <select id="rest-time-select" class="glass-input">
                            <option value="30">30 segundos</option>
                            <option value="60" selected>1 minuto</option>
                            <option value="90">1.5 minutos</option>
                            <option value="120">2 minutos</option>
                            <option value="180">3 minutos</option>
                        </select>
                    </div>
                    <div class="config-item">
                        <label class="config-label">Progresión automática</label>
                        <label class="toggle-container">
                            <input type="checkbox" id="auto-progression" checked>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                    <div class="config-item">
                        <label class="config-label">Audio coaching</label>
                        <label class="toggle-container">
                            <input type="checkbox" id="voice-coaching" checked>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                </div>
            </div>
            
            <!-- Ejercicios seleccionados -->
            <div class="selected-exercises glass-card mb-lg" id="selected-exercises" style="display: none;">
                <h3 class="section-title mb-md">📋 Ejercicios Seleccionados</h3>
                <div class="exercises-list" id="exercises-list">
                    <!-- Ejercicios se cargan dinámicamente -->
                </div>
            </div>
            
            <!-- Botón de inicio -->
            <div class="start-workout-section">
                <button id="start-gym-workout" class="glass-button glass-button-primary btn-full" disabled>
                    🏋️‍♀️ Iniciar Entrenamiento
                </button>
            </div>
        </div>
    `;
}

// Renderizar grupos musculares
function renderMuscleGroups() {
    return GYM_MUSCLE_GROUPS.map(group => `
        <div class="muscle-group-card" data-group="${group.id}" style="--group-color: ${group.color}">
            <div class="group-icon">${group.icon}</div>
            <div class="group-name">${group.name}</div>
            <div class="group-exercises-count">${getExercisesByGroup(group.id).length} ejercicios</div>
        </div>
    `).join('');
}

// Renderizar planificación Funcional
function renderCrossfitPlanning() {
    return `
        <div class="crossfit-planning glass-fade-in">
            <div class="planning-header">
                <button id="back-to-selection" class="glass-button glass-button-outline">
                    ← Volver
                </button>
                <h2 class="page-title">🤸‍♂️ Entrenamiento Funcional</h2>
            </div>
            
            <!-- Tipos de WOD -->
            <div class="wod-types glass-card mb-lg">
                <h3 class="section-title mb-md">🎯 Tipos de WOD</h3>
                <div class="wod-type-grid">
                    ${renderWodTypes()}
                </div>
            </div>
            
            <!-- WODs destacados -->
            <div class="featured-wods glass-card mb-lg">
                <h3 class="section-title mb-md">⭐ WODs Destacados</h3>
                <div class="wods-list">
                    ${renderFeaturedWods()}
                </div>
            </div>
            
            <!-- Crear WOD personalizado -->
            <div class="custom-wod glass-card mb-lg">
                <h3 class="section-title mb-md">🎨 Crear WOD Personalizado</h3>
                <div class="custom-wod-form">
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Nombre del WOD</label>
                            <input type="text" id="wod-name" class="glass-input" placeholder="Mi WOD personalizado">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Tipo</label>
                            <select id="wod-type" class="glass-input">
                                <option value="amrap">AMRAP</option>
                                <option value="emom">EMOM</option>
                                <option value="for_time">For Time</option>
                                <option value="tabata">Tabata</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Duración (minutos)</label>
                        <input type="number" id="wod-duration" class="glass-input" value="20" min="1" max="60">
                    </div>
                    <button id="create-custom-wod" class="glass-button glass-button-secondary btn-full">
                        🎨 Crear WOD
                    </button>
                </div>
            </div>
            
            <!-- Configuración del entrenamiento -->
            <div class="crossfit-config glass-card">
                <h3 class="section-title mb-md">⚙️ Configuración</h3>
                <div class="config-grid">
                    <div class="config-item">
                        <label class="config-label">Audio coaching</label>
                        <label class="toggle-container">
                            <input type="checkbox" id="crossfit-voice-coaching" checked>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                    <div class="config-item">
                        <label class="config-label">Mostrar form tips</label>
                        <label class="toggle-container">
                            <input type="checkbox" id="show-form-tips" checked>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Renderizar tipos de WOD
function renderWodTypes() {
    return CROSSFIT_WOD_TYPES.map(type => `
        <div class="wod-type-card" data-type="${type.id}">
            <div class="wod-type-icon">${type.icon}</div>
            <div class="wod-type-content">
                <h4 class="wod-type-name">${type.name}</h4>
                <p class="wod-type-description">${type.description}</p>
            </div>
        </div>
    `).join('');
}

// Renderizar WODs destacados
function renderFeaturedWods() {
    const featuredWods = crossfitWods.filter(wod => wod.featured).slice(0, 6);
    
    return featuredWods.map(wod => `
        <div class="wod-card" data-wod-id="${wod.id}">
            <div class="wod-header">
                <h4 class="wod-name">${wod.name}</h4>
                <span class="wod-type ${wod.type}">${wod.type.toUpperCase()}</span>
            </div>
            <p class="wod-description">${wod.description}</p>
            <div class="wod-details">
                <span class="wod-duration">⏱️ ${wod.duration || wod.timeLimit}min</span>
                <span class="wod-difficulty ${wod.difficulty}">🔥 ${wod.difficulty}</span>
            </div>
            <div class="wod-exercises">
                ${wod.exercises.slice(0, 3).map(ex => `<span class="exercise-tag">${ex.name}</span>`).join('')}
                ${wod.exercises.length > 3 ? `<span class="more-exercises">+${wod.exercises.length - 3} más</span>` : ''}
            </div>
        </div>
    `).join('');
}

// Renderizar entrenamiento de gym activo
function renderActiveGymWorkout() {
    if (!workoutState.currentSession) {
        return '<div class="error">❌ No hay sesión activa</div>';
    }
    
    const currentExercise = workoutState.activeExercise;
    const exerciseData = workoutState.currentSession.exercises[workoutState.currentSession.currentExerciseIndex];
    
    return `
        <div class="active-gym-workout glass-fade-in">
            <!-- Header con controles -->
            <div class="workout-header glass-card mb-md">
                <div class="workout-controls">
                    <button id="pause-workout" class="control-btn glass-button">
                        <span class="control-icon">${workoutState.isPaused ? '▶️' : '⏸️'}</span>
                    </button>
                    <div class="workout-time">
                        <span class="time-label">Tiempo</span>
                        <span class="time-value" id="workout-time">${formatWorkoutTime(workoutState.totalTime)}</span>
                    </div>
                    <button id="finish-workout" class="control-btn glass-button glass-button-danger">
                        <span class="control-icon">✅</span>
                    </button>
                </div>
            </div>
            
            <!-- Progreso del entrenamiento -->
            <div class="workout-progress glass-card mb-md">
                <div class="progress-info">
                    <span class="progress-text">
                        Ejercicio ${workoutState.currentSession.currentExerciseIndex + 1} de ${workoutState.currentSession.exercises.length}
                    </span>
                    <span class="progress-percentage">
                        ${Math.round(((workoutState.currentSession.currentExerciseIndex) / workoutState.currentSession.exercises.length) * 100)}%
                    </span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${((workoutState.currentSession.currentExerciseIndex) / workoutState.currentSession.exercises.length) * 100}%"></div>
                </div>
            </div>
            
            <!-- Ejercicio actual -->
            <div class="current-exercise glass-card mb-md">
                <div class="exercise-header">
                    <h3 class="exercise-name">${exerciseData.name}</h3>
                    <button id="exercise-info" class="info-btn glass-button glass-button-outline btn-sm">
                        📹 Ver video
                    </button>
                </div>
                
                <div class="exercise-details">
                    <div class="target-info">
                        <span class="target-sets">${exerciseData.sets} series</span>
                        <span class="target-reps">${exerciseData.reps} repeticiones</span>
                        ${exerciseData.weight ? `<span class="target-weight">${exerciseData.weight}kg</span>` : ''}
                    </div>
                </div>
                
                <!-- Sets completados -->
                <div class="sets-tracker">
                    <h4 class="sets-title">Series (${workoutState.currentSet + 1}/${exerciseData.sets})</h4>
                    <div class="sets-grid">
                        ${renderSetsTracker(exerciseData)}
                    </div>
                </div>
                
                <!-- Input de peso y reps actuales -->
                <div class="current-set-input">
                    <div class="input-row">
                        <div class="input-group">
                            <label class="input-label">Peso (kg)</label>
                            <input type="number" id="current-weight" class="glass-input" 
                                   value="${exerciseData.weight || ''}" step="0.5" min="0">
                        </div>
                        <div class="input-group">
                            <label class="input-label">Repeticiones</label>
                            <input type="number" id="current-reps" class="glass-input" 
                                   value="${exerciseData.reps || ''}" min="1">
                        </div>
                    </div>
                    <button id="complete-set" class="glass-button glass-button-primary btn-full">
                        ✅ Completar Serie ${workoutState.currentSet + 1}
                    </button>
                </div>
            </div>
            
            <!-- Timer de descanso -->
            ${workoutState.isResting ? renderRestTimer() : ''}
            
            <!-- Progresión sugerida -->
            ${renderProgressionSuggestion(exerciseData)}
            
            <!-- Navegación de ejercicios -->
            <div class="exercise-navigation">
                <button id="prev-exercise" class="glass-button glass-button-outline" 
                        ${workoutState.currentSession.currentExerciseIndex === 0 ? 'disabled' : ''}>
                    ← Anterior
                </button>
                <button id="next-exercise" class="glass-button glass-button-outline"
                        ${workoutState.currentSession.currentExerciseIndex === workoutState.currentSession.exercises.length - 1 ? 'disabled' : ''}>
                    Siguiente →
                </button>
            </div>
        </div>
    `;
}

// Renderizar tracker de series
function renderSetsTracker(exerciseData) {
    const sets = [];
    for (let i = 0; i < exerciseData.sets; i++) {
        const setData = exerciseData.completedSets?.[i];
        const isCompleted = setData != null;
        const isCurrent = i === workoutState.currentSet;
        
        sets.push(`
            <div class="set-item ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}">
                <div class="set-number">${i + 1}</div>
                ${isCompleted ? `
                    <div class="set-data">
                        <span class="set-weight">${setData.weight}kg</span>
                        <span class="set-reps">${setData.reps}r</span>
                    </div>
                ` : `
                    <div class="set-pending">-</div>
                `}
            </div>
        `);
    }
    return sets.join('');
}

// Renderizar timer de descanso
function renderRestTimer() {
    return `
        <div class="rest-timer glass-card mb-md">
            <div class="rest-header">
                <h4 class="rest-title">⏱️ Descanso</h4>
                <button id="skip-rest" class="glass-button glass-button-outline btn-sm">
                    Saltar
                </button>
            </div>
            <div class="rest-display">
                <div class="rest-time" id="rest-time-display">${workoutState.restTime}</div>
                <div class="rest-progress">
                    <div class="rest-progress-bar">
                        <div class="rest-progress-fill" id="rest-progress-fill"></div>
                    </div>
                </div>
            </div>
            <div class="rest-controls">
                <button id="add-rest-time" class="glass-button glass-button-outline">+30s</button>
                <button id="finish-rest" class="glass-button glass-button-primary">✅ Listo</button>
            </div>
        </div>
    `;
}

// Renderizar sugerencia de progresión
function renderProgressionSuggestion(exerciseData) {
    if (!workoutState.suggestedProgressions[exerciseData.id]) {
        return '';
    }
    
    const suggestion = workoutState.suggestedProgressions[exerciseData.id];
    
    return `
        <div class="progression-suggestion glass-card mb-md">
            <div class="suggestion-header">
                <h4 class="suggestion-title">💡 Progresión Sugerida</h4>
            </div>
            <div class="suggestion-content">
                <p class="suggestion-text">
                    ${suggestion.message}
                </p>
                <div class="suggestion-actions">
                    <button id="accept-progression" class="glass-button glass-button-primary btn-sm">
                        ✅ Aceptar
                    </button>
                    <button id="decline-progression" class="glass-button glass-button-outline btn-sm">
                        ❌ Rechazar
                    </button>
                </div>
            </div>
        </div>
    `;
}

// ===================================
// FUNCIONES DE CONTROL DE PLANES
// ===================================

// Renderizar gestión de planes
function renderPlanManagement() {
    return `
        <div class="plan-management glass-fade-in">
            <div class="management-header">
                <button id="back-to-selection" class="glass-button glass-button-outline">
                    ← Volver
                </button>
                <h2 class="page-title">📋 Gestión de Planes</h2>
            </div>
            
            <!-- Planes activos -->
            <div class="active-plans-management glass-card mb-lg">
                <h3 class="section-title mb-md">🎯 Planes Activos</h3>
                <div class="plans-list">
                    ${renderActivePlansList()}
                </div>
            </div>
            
            <!-- Historial de planes -->
            <div class="plans-history glass-card mb-lg">
                <h3 class="section-title mb-md">📊 Historial de Planes</h3>
                <div class="history-list">
                    ${renderPlansHistory()}
                </div>
            </div>
            
            <!-- Crear nuevo plan -->
            <div class="create-plan glass-card">
                <h3 class="section-title mb-md">➕ Crear Nuevo Plan</h3>
                <div class="create-plan-options">
                    <button class="plan-option-btn" data-plan-type="gym" title="Plan de gimnasio con rutinas divididas">
                        <span class="option-icon">🏋️‍♀️</span>
                        <span class="option-text">Plan de Gym</span>
                    </button>
                    <button class="plan-option-btn" data-plan-type="functional" title="WODs, CrossFit, entrenamiento funcional">
                        <span class="option-icon">🤸‍♂️</span>
                        <span class="option-text">Plan Funcional</span>
                    </button>
                    <button class="plan-option-btn" data-plan-type="running" title="Planes de carrera desde 5K a maratón">
                        <span class="option-icon">🏃</span>
                        <span class="option-text">Plan de Carrera</span>
                    </button>
                    <button class="plan-option-btn" data-plan-type="personalized" title="Crear plan personalizado completo">
                        <span class="option-icon">🎯</span>
                        <span class="option-text">Plan Personalizado</span>
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Renderizar lista de planes activos
function renderActivePlansList() {
    // Obtener plan activo de localStorage (y Firestore si hay auth)
    const activePlans = [];
    const savedPlan = localStorage.getItem('entrenoapp_active_plan');
    if (savedPlan) {
        try {
            const plan = JSON.parse(savedPlan);
            if (plan && plan.status !== 'paused') {
                plan.id = plan.id || 'active';
                activePlans.push(plan);
            }
        } catch (e) {
            console.warn('Error parsing active plan:', e);
        }
    }
    
    if (activePlans.length === 0) {
        return `
            <div class="empty-state">
                <p class="text-secondary">No tienes planes activos</p>
                <p class="text-secondary text-sm">Crea tu primer plan personalizado más abajo</p>
                <button class="glass-button glass-button-primary mt-md" onclick="window.navigateToPage && navigateToPage('onboarding')">
                    🎯 Crear plan personalizado
                </button>
            </div>
        `;
    }
    
    const totalWeeks = (p) => p.duration || p.totalWeeks || 8;
    const progressPct = (p) => Math.min(100, ((p.currentWeek || 1) / totalWeeks(p)) * 100);
    
    return activePlans.map(plan => `
        <div class="plan-item glass-card-inner" data-plan-id="${plan.id || 'active'}">
            <div class="plan-info">
                <h4 class="plan-name">${plan.name || 'Mi Plan'}</h4>
                <p class="plan-description">${plan.description || ''}</p>
                <div class="plan-progress">
                    <span class="progress-text">Semana ${plan.currentWeek || 1} de ${totalWeeks(plan)}</span>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progressPct(plan)}%"></div>
                    </div>
                </div>
            </div>
            <div class="plan-actions">
                <button class="plan-action-btn continue-btn" data-plan-id="${plan.id || 'active'}" data-action="continue" title="Ir al dashboard">
                    ▶️ Continuar
                </button>
                <button class="plan-action-btn restart-btn" data-plan-id="${plan.id || 'active'}" data-action="restart" title="Reiniciar plan">
                    🔄 Reiniciar
                </button>
                <button class="plan-action-btn close-btn" data-plan-id="${plan.id || 'active'}" data-action="delete" title="Eliminar plan">
                    ❌ Cerrar
                </button>
            </div>
        </div>
    `).join('');
}

// Renderizar historial de planes
function renderPlansHistory() {
    // TODO: Obtener de Firestore
    const completedPlans = []; // Placeholder
    
    if (completedPlans.length === 0) {
        return `
            <div class="empty-state">
                <p class="text-secondary">No hay planes completados</p>
            </div>
        `;
    }
    
    return completedPlans.map(plan => `
        <div class="history-item">
            <div class="history-info">
                <h5 class="history-name">${plan.name}</h5>
                <span class="history-date">${formatDate(plan.completedAt)}</span>
            </div>
            <div class="history-stats">
                <span class="stat">${plan.totalWorkouts} entrenamientos</span>
                <span class="stat">${plan.totalDuration} minutos</span>
            </div>
        </div>
    `).join('');
}

// ===================================
// CONFIGURAR LISTENERS
// ===================================

function setupWorkoutListeners() {
    document.addEventListener('click', (e) => {
        const target = e.target.closest('button, .workout-type-card, .muscle-group-card, .wod-card, .wod-type-card');
        if (!target) return;
        
        // Navegación principal
        if (target.classList.contains('workout-type-card')) {
            e.preventDefault();
            const workoutType = target.dataset.type;
            startWorkoutPlanning(workoutType);
        }
        
        // Botones de navegación
        if (target.id === 'back-to-selection') {
            e.preventDefault();
            workoutState.currentMode = 'select';
            renderWorkoutsPage();
        }
        
        if (target.id === 'manage-plans-btn') {
            e.preventDefault();
            workoutState.currentMode = 'plan-management';
            renderWorkoutsPage();
        }
        
        // Planificación de gym
        if (target.classList.contains('muscle-group-card')) {
            e.preventDefault();
            toggleMuscleGroup(target.dataset.group);
        }
        
        if (target.id === 'start-gym-workout') {
            e.preventDefault();
            startGymWorkout();
        }
        
        // Planificación Funcional
        if (target.classList.contains('wod-type-card')) {
            e.preventDefault();
            selectWodType(target.dataset.type);
        }
        
        if (target.classList.contains('wod-card')) {
            e.preventDefault();
            selectWod(target.dataset.wodId);
        }
        
        // Controles de entrenamiento activo
        if (target.id === 'pause-workout') {
            e.preventDefault();
            toggleWorkoutPause();
        }
        
        if (target.id === 'finish-workout') {
            e.preventDefault();
            finishWorkout();
        }
        
        if (target.id === 'complete-set') {
            e.preventDefault();
            completeSet();
        }
        
        if (target.id === 'skip-rest' || target.id === 'finish-rest') {
            e.preventDefault();
            finishRest();
        }
        
        // Gestión de planes
        if (target.classList.contains('continue-btn')) {
            e.preventDefault();
            continuePlan(target.dataset.planId);
        }
        
        if (target.classList.contains('restart-btn')) {
            e.preventDefault();
            restartPlan(target.dataset.planId);
        }
        
        if (target.classList.contains('close-btn') && target.classList.contains('plan-action-btn')) {
            e.preventDefault();
            closePlan(target.dataset.planId);
        }
        
        // Crear nuevo plan (abre onboarding con tipo pre-seleccionado)
        if (target.classList.contains('plan-option-btn')) {
            e.preventDefault();
            const planType = target.dataset.planType || 'personalized';
            startOnboardingWithPlanType(planType);
        }
    });
}

// ===================================
// FUNCIONES DE LÓGICA DE NEGOCIO
// ===================================

// Iniciar onboarding con tipo de plan pre-seleccionado (desde Gestión de Planes)
window.startOnboardingWithPlanType = function(planType) {
    try {
        localStorage.removeItem('entrenoapp_onboarding');
        localStorage.setItem('entrenoapp_onboarding_preset', JSON.stringify({
            plan_type: planType === 'personalized' ? null : planType,
            timestamp: new Date().toISOString()
        }));
        if (window.navigateToPage) {
            window.navigateToPage('onboarding');
        }
    } catch (e) {
        console.error('Error iniciando onboarding con preset:', e);
        if (window.navigateToPage) window.navigateToPage('onboarding');
    }
};

// Iniciar planificación de entrenamiento
function startWorkoutPlanning(type) {
    workoutState.workoutType = type;
    
    if (type === 'gym') {
        workoutState.currentMode = 'gym-plan';
    } else if (type === 'crossfit') {
        workoutState.currentMode = 'crossfit-plan';
    }
    
    renderWorkoutsPage();
}

// Alternar selección de grupo muscular
function toggleMuscleGroup(groupId) {
    const card = document.querySelector(`[data-group="${groupId}"]`);
    if (!card) return;
    
    card.classList.toggle('selected');
    updateSelectedExercises();
}

// Actualizar ejercicios seleccionados
function updateSelectedExercises() {
    const selectedGroups = Array.from(document.querySelectorAll('.muscle-group-card.selected'))
        .map(card => card.dataset.group);
    
    if (selectedGroups.length === 0) {
        document.getElementById('selected-exercises').style.display = 'none';
        document.getElementById('start-gym-workout').disabled = true;
        return;
    }
    
    let allExercises = [];
    selectedGroups.forEach(groupId => {
        const exercises = getExercisesByGroup(groupId);
        allExercises = allExercises.concat(exercises.slice(0, 3)); // 3 ejercicios por grupo
    });
    
    const exercisesList = document.getElementById('exercises-list');
    exercisesList.innerHTML = allExercises.map(exercise => `
        <div class="exercise-item">
            <div class="exercise-info">
                <h5 class="exercise-name">${exercise.name}</h5>
                <span class="exercise-muscle">${exercise.muscleGroup}</span>
            </div>
            <div class="exercise-config">
                <span class="exercise-sets">3 series</span>
                <span class="exercise-reps">8-12 reps</span>
            </div>
        </div>
    `).join('');
    
    document.getElementById('selected-exercises').style.display = 'block';
    document.getElementById('start-gym-workout').disabled = false;
}

// Iniciar entrenamiento de gym
async function startGymWorkout() {
    try {
        console.log('🏋️‍♀️ Iniciando entrenamiento de gym');
        
        const selectedGroups = Array.from(document.querySelectorAll('.muscle-group-card.selected'))
            .map(card => card.dataset.group);
        
        if (selectedGroups.length === 0) {
            showError('Selecciona al menos un grupo muscular');
            return;
        }
        
        // Preparar ejercicios
        let exercises = [];
        selectedGroups.forEach(groupId => {
            const groupExercises = getExercisesByGroup(groupId);
            exercises = exercises.concat(groupExercises.slice(0, 3).map(exercise => ({
                ...exercise,
                sets: 3,
                reps: exercise.defaultReps || 10,
                weight: exercise.defaultWeight || null,
                completedSets: []
            })));
        });
        
        // Crear sesión de entrenamiento
        workoutState.currentSession = {
            type: 'gym',
            exercises: exercises,
            currentExerciseIndex: 0,
            startTime: Date.now(),
            muscleGroups: selectedGroups
        };
        
        workoutState.activeExercise = exercises[0];
        workoutState.currentSet = 0;
        workoutState.isWorkoutActive = true;
        workoutState.currentMode = 'active-gym';
        
        // Configuraciones
        workoutState.restTime = parseInt(document.getElementById('rest-time-select').value);
        workoutState.isVoiceEnabled = document.getElementById('voice-coaching').checked;
        
        // Habilitar wake lock
        await enableWakeLock();
        
        // Iniciar timer del entrenamiento
        startWorkoutTimer();
        
        renderWorkoutsPage();
        
        // Anuncio de inicio
        if (workoutState.isVoiceEnabled && window.EntrenoTTS) {
            window.EntrenoTTS.speak(`¡Entrenamiento iniciado! Empezamos con ${exercises[0].name}.`);
        }
        
    } catch (error) {
        console.error('❌ Error iniciando entrenamiento:', error);
        showError('Error iniciando el entrenamiento');
    }
}

// Completar serie
function completeSet() {
    if (!workoutState.currentSession || !workoutState.activeExercise) return;
    
    const weight = parseFloat(document.getElementById('current-weight').value) || 0;
    const reps = parseInt(document.getElementById('current-reps').value) || 0;
    
    if (reps <= 0) {
        showError('Ingresa el número de repeticiones');
        return;
    }
    
    const exerciseIndex = workoutState.currentSession.currentExerciseIndex;
    const exercise = workoutState.currentSession.exercises[exerciseIndex];
    
    // Guardar datos de la serie
    if (!exercise.completedSets) {
        exercise.completedSets = [];
    }
    
    exercise.completedSets.push({
        set: workoutState.currentSet + 1,
        weight: weight,
        reps: reps,
        timestamp: Date.now()
    });
    
    // Calcular volumen
    workoutState.totalVolume += weight * reps;
    
    // Anuncio de serie completada
    if (workoutState.isVoiceEnabled && window.EntrenoTTS) {
        window.EntrenoTTS.speak(`Serie ${workoutState.currentSet + 1} completada. ${reps} repeticiones con ${weight} kilos.`);
    }
    
    workoutState.currentSet++;
    
    // Verificar si se completó el ejercicio
    if (workoutState.currentSet >= exercise.sets) {
        completeExercise();
    } else {
        // Iniciar descanso
        startRest();
    }
}

// Completar ejercicio
function completeExercise() {
    console.log('✅ Ejercicio completado');
    
    if (workoutState.isVoiceEnabled && window.EntrenoTTS) {
        window.EntrenoTTS.speak(`¡Ejercicio completado! Excelente trabajo.`);
    }
    
    // Mover al siguiente ejercicio
    workoutState.currentSession.currentExerciseIndex++;
    workoutState.currentSet = 0;
    
    if (workoutState.currentSession.currentExerciseIndex >= workoutState.currentSession.exercises.length) {
        // Entrenamiento completado
        finishWorkout();
    } else {
        // Siguiente ejercicio
        workoutState.activeExercise = workoutState.currentSession.exercises[workoutState.currentSession.currentExerciseIndex];
        
        if (workoutState.isVoiceEnabled && window.EntrenoTTS) {
            window.EntrenoTTS.speak(`Siguiente ejercicio: ${workoutState.activeExercise.name}`);
        }
        
        renderWorkoutsPage();
    }
}

// Iniciar descanso
function startRest() {
    workoutState.isResting = true;
    workoutState.restTimer = workoutState.restTime;
    
    if (workoutState.isVoiceEnabled && window.EntrenoTTS) {
        window.EntrenoTTS.speak(`Descanso de ${workoutState.restTime} segundos.`);
    }
    
    renderWorkoutsPage();
    
    // Countdown del descanso
    const restInterval = setInterval(() => {
        workoutState.restTimer--;
        
        const restDisplay = document.getElementById('rest-time-display');
        const progressFill = document.getElementById('rest-progress-fill');
        
        if (restDisplay) {
            restDisplay.textContent = workoutState.restTimer;
        }
        
        if (progressFill) {
            const progress = ((workoutState.restTime - workoutState.restTimer) / workoutState.restTime) * 100;
            progressFill.style.width = `${progress}%`;
        }
        
        if (workoutState.restTimer <= 0) {
            clearInterval(restInterval);
            finishRest();
        }
    }, 1000);
}

// Finalizar descanso
function finishRest() {
    workoutState.isResting = false;
    workoutState.restTimer = null;
    
    if (workoutState.isVoiceEnabled && window.EntrenoTTS) {
        window.EntrenoTTS.speak('¡Descanso terminado! Vamos con la siguiente serie.');
    }
    
    renderWorkoutsPage();
}

// ===================================
// GESTIÓN DE PLANES
// ===================================

// Continuar plan
async function continuePlan(planId) {
    try {
        console.log('▶️ Continuando plan:', planId);
        if (window.navigateToPage) {
            window.navigateToPage('dashboard');
        }
        if (typeof showSuccess === 'function') showSuccess('Ir al Inicio');
    } catch (error) {
        console.error('❌ Error continuando plan:', error);
        if (typeof showError === 'function') showError('Error continuando el plan');
    }
}

// Reiniciar plan
async function restartPlan(planId) {
    try {
        const confirmed = confirm('¿Estás seguro de que quieres reiniciar este plan? Perderás todo el progreso actual.');
        if (!confirmed) return;
        
        const savedPlan = localStorage.getItem('entrenoapp_active_plan');
        if (!savedPlan) {
            renderWorkoutsPage();
            return;
        }
        const plan = JSON.parse(savedPlan);
        plan.currentWeek = 1;
        plan.currentSession = 1;
        plan.startDate = new Date().toISOString();
        localStorage.setItem('entrenoapp_active_plan', JSON.stringify(plan));
        
        if (typeof showSuccess === 'function') showSuccess('Plan reiniciado');
        renderWorkoutsPage();
    } catch (error) {
        console.error('❌ Error reiniciando plan:', error);
        if (typeof showError === 'function') showError('Error reiniciando el plan');
    }
}

// Cerrar plan
async function closePlan(planId) {
    try {
        const confirmed = confirm('¿Estás seguro de que quieres cerrar este plan? Tendrás que crear uno nuevo.');
        if (!confirmed) return;
        
        localStorage.removeItem('entrenoapp_active_plan');
        if (typeof showSuccess === 'function') showSuccess('Plan cerrado');
        renderWorkoutsPage();
    } catch (error) {
        console.error('❌ Error cerrando plan:', error);
        if (typeof showError === 'function') showError('Error cerrando el plan');
    }
}

// ===================================
// FUNCIONES AUXILIARES
// ===================================

// Habilitar wake lock
async function enableWakeLock() {
    try {
        if ('wakeLock' in navigator && workoutState.keepScreenOn) {
            workoutState.wakeLock = await navigator.wakeLock.request('screen');
            console.log('🔒 Pantalla bloqueada para mantener encendida');
        }
    } catch (error) {
        console.warn('⚠️ No se pudo habilitar wake lock:', error);
    }
}

// Iniciar timer del entrenamiento
function startWorkoutTimer() {
    workoutState.sessionStartTime = Date.now();
    
    workoutState.intervalId = setInterval(() => {
        if (!workoutState.isPaused) {
            workoutState.totalTime = Date.now() - workoutState.sessionStartTime;
            
            const timeDisplay = document.getElementById('workout-time');
            if (timeDisplay) {
                timeDisplay.textContent = formatWorkoutTime(workoutState.totalTime);
            }
        }
    }, 1000);
}

// Pausar/reanudar entrenamiento
function toggleWorkoutPause() {
    workoutState.isPaused = !workoutState.isPaused;
    
    const pauseBtn = document.getElementById('pause-workout');
    if (pauseBtn) {
        pauseBtn.querySelector('.control-icon').textContent = workoutState.isPaused ? '▶️' : '⏸️';
    }
    
    if (workoutState.isVoiceEnabled && window.EntrenoTTS) {
        window.EntrenoTTS.speak(workoutState.isPaused ? 'Entrenamiento pausado' : 'Entrenamiento reanudado');
    }
}

// Finalizar entrenamiento
async function finishWorkout() {
    try {
        console.log('✅ Finalizando entrenamiento');
        
        workoutState.isWorkoutActive = false;
        
        if (workoutState.intervalId) {
            clearInterval(workoutState.intervalId);
        }
        
        if (workoutState.wakeLock) {
            workoutState.wakeLock.release();
        }
        
        // Calcular estadísticas finales
        const sessionData = {
            type: workoutState.currentSession.type,
            startTime: new Date(workoutState.currentSession.startTime),
            endTime: new Date(),
            duration: workoutState.totalTime,
            exercises: workoutState.currentSession.exercises,
            totalVolume: workoutState.totalVolume,
            muscleGroups: workoutState.currentSession.muscleGroups || [],
            completed: true
        };
        
        // Guardar en Firestore
        await saveWorkoutToFirestore(sessionData);
        
        // Anuncio de finalización
        if (workoutState.isVoiceEnabled && window.EntrenoTTS) {
            window.EntrenoTTS.speak(`¡Entrenamiento completado! Duración: ${formatWorkoutTime(workoutState.totalTime)}. Volumen total: ${Math.round(workoutState.totalVolume)} kilos.`);
        }
        
        // Mostrar resumen y volver a selección
        showWorkoutSummary(sessionData);
        
        // Reset del estado
        resetWorkoutState();
        
    } catch (error) {
        console.error('❌ Error finalizando entrenamiento:', error);
        showError('Error guardando el entrenamiento');
    }
}

// Guardar entrenamiento en Firestore
async function saveWorkoutToFirestore(sessionData) {
    try {
        const user = auth.currentUser;
        if (!user) throw new Error('Usuario no autenticado');
        
        const workoutDoc = {
            userId: user.uid,
            date: serverTimestamp(),
            ...sessionData,
            createdAt: serverTimestamp()
        };
        
        const docRef = await addDoc(collection(db, 'user-workouts'), workoutDoc);
        console.log('✅ Entrenamiento guardado con ID:', docRef.id);
        
        // Actualizar estadísticas del usuario
        await updateUserWorkoutStats(sessionData);
        
    } catch (error) {
        console.error('❌ Error guardando entrenamiento:', error);
        throw error;
    }
}

// Actualizar estadísticas del usuario
async function updateUserWorkoutStats(sessionData) {
    try {
        const user = auth.currentUser;
        if (!user) return;
        
        const userDoc = doc(db, 'users', user.uid);
        
        await updateDoc(userDoc, {
            'stats.totalWorkouts': increment(1),
            'stats.totalVolume': increment(sessionData.totalVolume),
            'stats.totalTime': increment(sessionData.duration / 1000 / 60), // en minutos
            'stats.lastWorkout': serverTimestamp(),
            'updatedAt': serverTimestamp()
        });
        
        // Actualizar estadísticas semanales en la UI
        await loadWeeklyStats();
        
    } catch (error) {
        console.error('❌ Error actualizando estadísticas:', error);
    }
}

// Mostrar resumen del entrenamiento
function showWorkoutSummary(sessionData) {
    const summary = `
        🏆 ¡Entrenamiento Completado!
        
        ⏱️ Duración: ${formatWorkoutTime(sessionData.duration)}
        💪 Ejercicios: ${sessionData.exercises.length}
        📊 Volumen: ${Math.round(sessionData.totalVolume)}kg
        🎯 Grupos: ${sessionData.muscleGroups.join(', ')}
    `;
    
    alert(summary); // TODO: Usar sistema de notificaciones
}

// Reset del estado del entrenamiento
function resetWorkoutState() {
    workoutState.currentSession = null;
    workoutState.activeExercise = null;
    workoutState.currentSet = 0;
    workoutState.totalVolume = 0;
    workoutState.totalTime = 0;
    workoutState.isWorkoutActive = false;
    workoutState.isResting = false;
    workoutState.isPaused = false;
    workoutState.currentMode = 'select';
    
    renderWorkoutsPage();
}

// Formatear tiempo del entrenamiento
function formatWorkoutTime(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Formatear fecha
function formatDate(timestamp) {
    return new Date(timestamp).toLocaleDateString('es-ES');
}

// Inicializar componentes específicos del modo
function initializeModeSpecificComponents() {
    // TODO: Inicializar componentes específicos según el modo actual
}

// Mostrar error
function showError(message) {
    console.error('❌', message);
    alert(message); // TODO: Sistema de notificaciones
}

// Mostrar éxito
function showSuccess(message) {
    console.log('✅', message);
    // TODO: Sistema de notificaciones
}


console.log('💪 Módulo de entrenamientos cargado');