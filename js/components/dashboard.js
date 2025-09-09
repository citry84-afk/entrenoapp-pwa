// Dashboard centrado en planificación personalizada para EntrenoApp
import { auth, db } from '../config/firebase-config.js';
import { 
    doc, 
    getDoc,
    updateDoc,
    serverTimestamp,
    increment
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Estado del dashboard personalizado
let dashboardState = {
    user: null,
    userProfile: null,
    activePlan: null,
    todaysWorkout: null,
    weekProgress: 0,
    todayChallenge: null,
    recentActivity: [],
    quickStats: {
        completedWorkouts: 0,
        currentStreak: 0,
        totalPoints: 0,
        nextMilestone: null
    },
    motivationalMessage: '',
    isLoading: true
};

// Inicializar dashboard
window.initDashboard = function() {
    console.log('🏠 Inicializando dashboard personalizado');
    try {
        loadUserPlan();
        renderDashboard();
        setupDashboardListeners();
    } catch (error) {
        console.error('❌ Error en initDashboard:', error);
        // Renderizar dashboard de error
        const container = document.querySelector('.dashboard-container');
        if (container) {
            container.innerHTML = `
                <div class="glass-card text-center">
                    <h2>Error cargando dashboard</h2>
                    <p>Reintentando en unos segundos...</p>
                    <button onclick="window.initDashboard()" class="glass-button glass-button-primary">
                        Reintentar
                    </button>
                </div>
            `;
        }
    }
};

// Cargar plan activo del usuario
async function loadUserPlan() {
    try {
        dashboardState.isLoading = true;
        
        // Verificar que auth esté disponible
        if (!auth) {
            console.error('❌ Firebase auth no está disponible');
            return;
        }
        
        const user = auth.currentUser;
        if (!user) {
            console.log('⚠️ No hay usuario autenticado');
            return;
        }
        
        dashboardState.user = user;
        
        // Cargar perfil y plan activo desde Firestore
        const userDoc = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userDoc);
        
        if (userSnap.exists()) {
            const userData = userSnap.data();
            dashboardState.userProfile = userData;
            dashboardState.activePlan = userData.activePlan;
            dashboardState.quickStats = {
                completedWorkouts: userData.stats?.totalWorkouts || 0,
                currentStreak: userData.stats?.currentStreak || 0,
                totalPoints: userData.stats?.totalPoints || 0,
                nextMilestone: calculateNextMilestone(userData.stats?.totalPoints || 0)
            };
        }
        
        // Si no hay plan activo, verificar localStorage (solo si viene del onboarding)
        if (!dashboardState.activePlan) {
            const savedPlan = localStorage.getItem('entrenoapp_active_plan');
            const onboardingData = localStorage.getItem('entrenoapp_onboarding');
            
            // Solo cargar plan guardado si viene de un onboarding completado recientemente
            if (savedPlan && !onboardingData) {
                try {
                    const plan = JSON.parse(savedPlan);
                    // Verificar que el plan tenga metadatos válidos
                    if (plan.metadata && plan.metadata.basedOnOnboarding) {
                        dashboardState.activePlan = plan;
                    } else {
                        // Limpiar plan inválido
                        localStorage.removeItem('entrenoapp_active_plan');
                    }
                } catch (error) {
                    console.error('❌ Error parsing plan guardado:', error);
                    localStorage.removeItem('entrenoapp_active_plan');
                }
            }
        }
        
        // Generar entrenamiento de hoy
        if (dashboardState.activePlan) {
            dashboardState.todaysWorkout = generateTodaysWorkout(dashboardState.activePlan);
            dashboardState.weekProgress = calculateWeekProgress(dashboardState.activePlan);
        }
        
        // Cargar reto diario (si está disponible)
        await loadTodayChallenge();
        
        // Generar mensaje motivacional
        dashboardState.motivationalMessage = generateMotivationalMessage();
        
        console.log('✅ Datos del dashboard cargados:', dashboardState);
        
    } catch (error) {
        console.error('❌ Error cargando datos del dashboard:', error);
    } finally {
        dashboardState.isLoading = false;
        renderDashboard();
    }
}

// Generar entrenamiento de hoy
function generateTodaysWorkout(plan) {
    console.log('📅 Generando workout de hoy...', { plan: plan });
    if (window.debugLogger) {
        window.debugLogger.logInfo('DASHBOARD_GENERATE_WORKOUT', 'Generando workout de hoy', { plan: plan });
    }
    
    if (!plan) {
        console.log('❌ No hay plan para generar workout');
        return null;
    }
    
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Domingo, 1 = Lunes, etc.
    const currentWeek = plan.currentWeek || 1;
    
    console.log('📅 Info del día:', { dayOfWeek, currentWeek, planType: plan.type });
    
    // Mapear días de entrenamiento según frecuencia
    const trainingDays = getTrainingDays(plan.frequency);
    const isTrainingDay = trainingDays.includes(dayOfWeek);
    
    if (!isTrainingDay) {
        return {
            type: 'rest',
            title: 'Día de Descanso',
            description: 'Aprovecha para recuperarte y prepararte para el próximo entrenamiento',
            icon: '😴',
            duration: null,
            nextTrainingDay: getNextTrainingDay(dayOfWeek, trainingDays)
        };
    }
    
    // Generar entrenamiento específico según tipo de plan
    switch (plan.type) {
        case 'running':
            return generateRunningWorkout(plan, currentWeek);
        case 'functional':
            return generateFunctionalWorkout(plan, currentWeek);
        case 'gym':
        default:
            return generateGymWorkout(plan, currentWeek);
    }
}

// Generar entrenamiento de running
function generateRunningWorkout(plan, week) {
    const baseDistance = plan.targetDistance || 5;
    const progression = Math.min(week / plan.duration, 1);
    const todayDistance = Math.round((baseDistance * 0.3 + baseDistance * 0.7 * progression) * 10) / 10;
    
    return {
        type: 'running',
        title: `Sesión de Running - ${todayDistance}km`,
        description: `Corre ${todayDistance}km a ritmo cómodo. Semana ${week} de ${plan.duration}`,
        icon: '🏃‍♂️',
        duration: Math.round(todayDistance * 6), // Estimación 6 min/km
        distance: todayDistance,
        intensity: plan.focus === 'speed' ? 'high' : 'moderate',
        instructions: [
            'Calentamiento: 5 minutos caminando',
            `Correr ${todayDistance}km a ritmo constante`,
            'Enfriamiento: 5 minutos caminando',
            'Estiramientos: 10 minutos'
        ]
    };
}

// Generar entrenamiento funcional
function generateFunctionalWorkout(plan, week) {
    const workouts = [
        {
            title: 'Circuito de Fuerza',
            exercises: ['Burpees', 'Sentadillas', 'Flexiones', 'Mountain Climbers'],
            sets: 4,
            reps: '45s trabajo / 15s descanso'
        },
        {
            title: 'HIIT Metabólico',
            exercises: ['Jumping Jacks', 'High Knees', 'Plancha', 'Squat Jumps'],
            sets: 5,
            reps: '30s trabajo / 30s descanso'
        },
        {
            title: 'Fuerza Funcional',
            exercises: ['Lunges', 'Push-ups', 'Dead Bug', 'Russian Twists'],
            sets: 3,
            reps: '12-15 repeticiones'
        }
    ];
    
    const todayWorkout = workouts[week % workouts.length];
    
    return {
        type: 'functional',
        title: todayWorkout.title,
        description: `Entrenamiento funcional - Semana ${week} de ${plan.duration}`,
        icon: '💪',
        duration: 45,
        exercises: todayWorkout.exercises,
        sets: todayWorkout.sets,
        reps: todayWorkout.reps,
        intensity: plan.intensity || 'moderate'
    };
}

// Generar entrenamiento de gimnasio
function generateGymWorkout(plan, week) {
    const splits = {
        'full_body': ['Cuerpo Completo'],
        'upper_lower': ['Tren Superior', 'Tren Inferior'],
        'push_pull_legs': ['Empuje', 'Tirón', 'Piernas'],
        'body_parts': ['Pecho', 'Espalda', 'Piernas', 'Hombros', 'Brazos']
    };
    
    const currentSplit = splits[plan.split] || splits['full_body'];
    const today = new Date().getDay();
    const workoutIndex = today % currentSplit.length;
    const todayMuscleGroup = currentSplit[workoutIndex];
    
    return {
        type: 'gym',
        title: `Entrenamiento de ${todayMuscleGroup}`,
        description: `Rutina ${plan.split.replace('_', ' ')} - Semana ${week} de ${plan.duration}`,
        icon: '🏋️‍♂️',
        duration: 60,
        muscleGroup: todayMuscleGroup,
        sets: plan.focus === 'strength' ? '4-6 series' : '3-4 series',
        reps: plan.focus === 'strength' ? '4-6 reps' : '8-12 reps',
        intensity: plan.focus === 'strength' ? 'high' : 'moderate'
    };
}

// Obtener días de entrenamiento según frecuencia
function getTrainingDays(frequency) {
    const schedules = {
        3: [1, 3, 5], // Lunes, Miércoles, Viernes
        4: [1, 2, 4, 5], // Lunes, Martes, Jueves, Viernes
        5: [1, 2, 3, 4, 5], // Lunes a Viernes
        6: [1, 2, 3, 4, 5, 6] // Lunes a Sábado
    };
    return schedules[frequency] || schedules[3];
}

// Obtener próximo día de entrenamiento
function getNextTrainingDay(currentDay, trainingDays) {
    for (let i = 1; i <= 7; i++) {
        const nextDay = (currentDay + i) % 7;
        if (trainingDays.includes(nextDay)) {
            const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
            return dayNames[nextDay];
        }
    }
    return 'Próximamente';
}

// Calcular progreso de la semana
function calculateWeekProgress(plan) {
    if (!plan) return 0;
    
    const today = new Date();
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 1));
    const currentDay = new Date().getDay();
    
    const trainingDays = getTrainingDays(plan.frequency);
    const completedDays = trainingDays.filter(day => day < currentDay).length;
    
    return Math.round((completedDays / trainingDays.length) * 100);
}

// Cargar reto diario
async function loadTodayChallenge() {
    try {
        // Esto se integrará con el sistema de challenges
        dashboardState.todayChallenge = {
            name: 'Flexiones',
            target: 20,
            points: 15,
            completed: false,
            type: 'reps'
        };
    } catch (error) {
        console.error('❌ Error cargando reto diario:', error);
    }
}

// Generar mensaje motivacional
function generateMotivationalMessage() {
    const messages = [
        '¡Es hora de superar tus límites! 💪',
        '¡Cada entrenamiento te acerca a tu objetivo! 🎯',
        '¡Tu única competencia es quien fuiste ayer! 🚀',
        '¡La constancia es la clave del éxito! ⭐',
        '¡Hoy es el día perfecto para entrenar! 🔥',
        '¡Tu futuro yo te lo agradecerá! 💯'
    ];
    
    const today = new Date().getDate();
    return messages[today % messages.length];
}

// Calcular próximo hito
function calculateNextMilestone(currentPoints) {
    const milestones = [100, 250, 500, 1000, 2500, 5000, 10000];
    const nextMilestone = milestones.find(milestone => milestone > currentPoints);
    return nextMilestone || null;
}

// Renderizar dashboard
function renderDashboard() {
    const container = document.querySelector('.dashboard-container');
    if (!container) return;
    
    if (dashboardState.isLoading) {
        container.innerHTML = `
            <div class="loading-dashboard">
                <div class="loading-spinner"></div>
                <p>Cargando tu plan personalizado...</p>
            </div>
        `;
        return;
    }
    
    if (!dashboardState.activePlan) {
        container.innerHTML = renderNoPlan();
        return;
    }
    
    container.innerHTML = `
        <div class="personalized-dashboard glass-fade-in">
            <!-- Header personalizado -->
            ${renderPersonalizedHeader()}
            
            <!-- Plan activo central -->
            ${renderActivePlan()}
            
            <!-- Entrenamiento de hoy -->
            ${renderTodaysWorkout()}
            
            <!-- Progreso semanal -->
            ${renderWeeklyProgress()}
            
            <!-- Reto diario y estadísticas -->
            <div class="dashboard-grid">
                ${renderTodayChallenge()}
                ${renderQuickStats()}
            </div>
            
            <!-- Acciones rápidas -->
            ${renderQuickActions()}
        </div>
    `;
}

// Renderizar header personalizado
function renderPersonalizedHeader() {
    const user = dashboardState.userProfile;
    const plan = dashboardState.activePlan;
    
    return `
        <div class="personalized-header glass-card mb-lg">
            <div class="header-content">
                <div class="user-welcome">
                    <h1 class="welcome-title">
                        ¡Hola, ${user?.displayName || 'Atleta'}! 👋
                    </h1>
                    <p class="motivational-message">${dashboardState.motivationalMessage}</p>
                </div>
                <div class="plan-info">
                    <div class="active-plan-badge">
                        <span class="plan-icon">${getPlanIcon(plan.type)}</span>
                        <div class="plan-details">
                            <div class="plan-name">${plan.name}</div>
                            <div class="plan-progress">
                                Semana ${plan.currentWeek || 1} de ${plan.duration}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Renderizar plan activo
function renderActivePlan() {
    const plan = dashboardState.activePlan;
    const progressPercentage = ((plan.currentWeek || 1) / plan.duration) * 100;
    
    return `
        <div class="active-plan-card glass-card mb-lg">
            <div class="plan-header">
                <h2 class="plan-title">📋 Tu Plan Activo</h2>
                <button class="plan-menu-btn glass-button glass-button-secondary btn-sm" onclick="window.showPlanMenu()">
                    ⚙️ Gestionar
                </button>
            </div>
            
            <div class="plan-overview">
                <div class="plan-main-info">
                    <div class="plan-type-badge ${plan.type}">
                        ${getPlanIcon(plan.type)} ${getActivityLabel(plan.type)}
                    </div>
                    <h3 class="plan-name">${plan.name}</h3>
                    <p class="plan-description">${plan.description}</p>
                </div>
                
                <div class="plan-progress-section">
                    <div class="progress-info">
                        <span class="progress-label">Progreso del Plan</span>
                        <span class="progress-value">${Math.round(progressPercentage)}%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progressPercentage}%"></div>
                    </div>
                    <div class="plan-stats-grid">
                        <div class="plan-stat">
                            <span class="stat-value">${plan.frequency}x</span>
                            <span class="stat-label">por semana</span>
                        </div>
                        <div class="plan-stat">
                            <span class="stat-value">${plan.duration}</span>
                            <span class="stat-label">semanas</span>
                        </div>
                        <div class="plan-stat">
                            <span class="stat-value">${plan.currentWeek || 1}</span>
                            <span class="stat-label">semana actual</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Renderizar entrenamiento de hoy
function renderTodaysWorkout() {
    const workout = dashboardState.todaysWorkout;
    if (!workout) return '';
    
    return `
        <div class="todays-workout glass-card mb-lg">
            <div class="workout-header">
                <h2 class="workout-title">🎯 Entrenamiento de Hoy</h2>
                <div class="workout-date">${new Date().toLocaleDateString('es-ES', { 
                    weekday: 'long', 
                    day: 'numeric', 
                    month: 'long' 
                })}</div>
            </div>
            
            ${workout.type === 'rest' ? renderRestDay(workout) : renderActiveWorkout(workout)}
        </div>
    `;
}

// Renderizar día de descanso
function renderRestDay(workout) {
    return `
        <div class="rest-day-card">
            <div class="rest-icon">${workout.icon}</div>
            <h3 class="rest-title">${workout.title}</h3>
            <p class="rest-description">${workout.description}</p>
            <div class="next-training">
                <span class="next-label">Próximo entrenamiento:</span>
                <span class="next-day">${workout.nextTrainingDay}</span>
            </div>
        </div>
    `;
}

// Renderizar entrenamiento activo
function renderActiveWorkout(workout) {
    return `
        <div class="active-workout-card">
            <div class="workout-info">
                <div class="workout-icon">${workout.icon}</div>
                <div class="workout-details">
                    <h3 class="workout-name">${workout.title}</h3>
                    <p class="workout-description">${workout.description}</p>
                    
                    <div class="workout-specs">
                        ${workout.duration ? `
                            <div class="spec-item">
                                <span class="spec-icon">⏱️</span>
                                <span class="spec-text">${workout.duration} min</span>
                            </div>
                        ` : ''}
                        
                        ${workout.distance ? `
                            <div class="spec-item">
                                <span class="spec-icon">📏</span>
                                <span class="spec-text">${workout.distance} km</span>
                            </div>
                        ` : ''}
                        
                        ${workout.sets ? `
                            <div class="spec-item">
                                <span class="spec-icon">🔢</span>
                                <span class="spec-text">${workout.sets} ${workout.reps || 'series'}</span>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
            
            <div class="workout-actions">
                <button class="glass-button glass-button-primary" onclick="window.startTodaysWorkout()">
                    🚀 Empezar Entrenamiento
                </button>
                <button class="glass-button glass-button-secondary" onclick="window.viewWorkoutDetails()">
                    📋 Ver Detalles
                </button>
            </div>
        </div>
    `;
}

// Renderizar progreso semanal
function renderWeeklyProgress() {
    return `
        <div class="weekly-progress glass-card mb-lg">
            <h3 class="progress-title">📊 Progreso de esta Semana</h3>
            <div class="week-progress-bar">
                <div class="week-progress-fill" style="width: ${dashboardState.weekProgress}%"></div>
            </div>
            <div class="progress-text">
                ${dashboardState.weekProgress}% completado esta semana
            </div>
        </div>
    `;
}

// Renderizar reto diario
function renderTodayChallenge() {
    const challenge = dashboardState.todayChallenge;
    if (!challenge) return '';
    
    return `
        <div class="today-challenge glass-card">
            <h3 class="challenge-title">🎯 Reto Diario</h3>
            <div class="challenge-content">
                <div class="challenge-name">${challenge.name}</div>
                <div class="challenge-target">
                    ${challenge.type === 'reps' ? 
                        `${challenge.target} repeticiones` : 
                        `${challenge.target} segundos`
                    }
                </div>
                <div class="challenge-points">+${challenge.points} puntos</div>
                <button class="glass-button glass-button-primary btn-sm" onclick="window.navigateToPage('challenges')">
                    ${challenge.completed ? '✅ Completado' : '🎯 Hacer Reto'}
                </button>
            </div>
        </div>
    `;
}

// Renderizar estadísticas rápidas
function renderQuickStats() {
    const stats = dashboardState.quickStats;
    
    return `
        <div class="quick-stats glass-card">
            <h3 class="stats-title">📈 Tus Estadísticas</h3>
            <div class="stats-grid">
                <div class="stat-item">
                    <div class="stat-value">${stats.completedWorkouts}</div>
                    <div class="stat-label">Entrenamientos</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${stats.currentStreak}</div>
                    <div class="stat-label">Racha</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${stats.totalPoints}</div>
                    <div class="stat-label">Puntos</div>
                </div>
                ${stats.nextMilestone ? `
                    <div class="stat-item">
                        <div class="stat-value">${stats.nextMilestone}</div>
                        <div class="stat-label">Próximo hito</div>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}

// Renderizar acciones rápidas
function renderQuickActions() {
    const plan = dashboardState.activePlan;
    
    // Acciones específicas para running
    if (plan?.type === 'running') {
        return `
            <div class="quick-actions glass-card">
                <h3 class="actions-title">⚡ Acciones de Running</h3>
                <div class="actions-grid">
                    <button class="action-btn glass-button" onclick="window.startFreeRun()">
                        <span class="action-icon">🏃‍♂️</span>
                        <span class="action-text">Carrera Libre</span>
                    </button>
                    <button class="action-btn glass-button" onclick="window.startIntervalTraining()">
                        <span class="action-icon">⏱️</span>
                        <span class="action-text">Intervalos</span>
                    </button>
                    <button class="action-btn glass-button" onclick="window.viewRunningPlans()">
                        <span class="action-icon">📋</span>
                        <span class="action-text">Planes Running</span>
                    </button>
                    <button class="action-btn glass-button" onclick="window.viewRunningHistory()">
                        <span class="action-icon">📈</span>
                        <span class="action-text">Historial</span>
                    </button>
                </div>
            </div>
        `;
    }
    
    // Acciones específicas para funcional
    if (plan?.type === 'functional') {
        return `
            <div class="quick-actions glass-card">
                <h3 class="actions-title">⚡ Acciones Funcionales</h3>
                <div class="actions-grid">
                    <button class="action-btn glass-button" onclick="window.startFunctionalWOD()">
                        <span class="action-icon">🔥</span>
                        <span class="action-text">WOD del Día</span>
                    </button>
                    <button class="action-btn glass-button" onclick="window.browseWODs()">
                        <span class="action-icon">📋</span>
                        <span class="action-text">Explorar WODs</span>
                    </button>
                    <button class="action-btn glass-button" onclick="window.customWorkout()">
                        <span class="action-icon">⚙️</span>
                        <span class="action-text">Crear WOD</span>
                    </button>
                    <button class="action-btn glass-button" onclick="window.viewPRs()">
                        <span class="action-icon">🏆</span>
                        <span class="action-text">Mis Records</span>
                    </button>
                </div>
            </div>
        `;
    }
    
    // Acciones específicas para gym
    if (plan?.type === 'gym') {
        return `
            <div class="quick-actions glass-card">
                <h3 class="actions-title">⚡ Acciones de Gym</h3>
                <div class="actions-grid">
                    <button class="action-btn glass-button" onclick="window.startGymSession()">
                        <span class="action-icon">🏋️‍♂️</span>
                        <span class="action-text">Sesión de Hoy</span>
                    </button>
                    <button class="action-btn glass-button" onclick="window.browsePlans()">
                        <span class="action-icon">📋</span>
                        <span class="action-text">Planes Gym</span>
                    </button>
                    <button class="action-btn glass-button" onclick="window.exerciseLibrary()">
                        <span class="action-icon">📚</span>
                        <span class="action-text">Ejercicios</span>
                    </button>
                    <button class="action-btn glass-button" onclick="window.viewProgress()">
                        <span class="action-icon">📈</span>
                        <span class="action-text">Progreso</span>
                    </button>
                </div>
            </div>
        `;
    }
    
    // Acciones generales si no hay plan
    return `
        <div class="quick-actions glass-card">
            <h3 class="actions-title">⚡ Acciones Rápidas</h3>
            <div class="actions-grid">
                <button class="action-btn glass-button" onclick="window.createNewPlan()">
                    <span class="action-icon">🎯</span>
                    <span class="action-text">Crear Plan</span>
                </button>
                <button class="action-btn glass-button" onclick="window.browsePlans()">
                    <span class="action-icon">📋</span>
                    <span class="action-text">Explorar Planes</span>
                </button>
                <button class="action-btn glass-button" onclick="window.quickWorkout()">
                    <span class="action-icon">⚡</span>
                    <span class="action-text">Entreno Rápido</span>
                </button>
                <button class="action-btn glass-button" onclick="window.viewStats()">
                    <span class="action-icon">📊</span>
                    <span class="action-text">Estadísticas</span>
                </button>
            </div>
        </div>
    `;
}

// Renderizar cuando no hay plan
function renderNoPlan() {
    return `
        <div class="no-plan-state glass-card text-center">
            <div class="no-plan-icon mb-lg">📋</div>
            <h2 class="no-plan-title">No tienes un plan activo</h2>
            <p class="no-plan-description text-secondary">
                Completa el cuestionario para generar tu plan personalizado
            </p>
            <button class="glass-button glass-button-primary" onclick="window.restartOnboarding()">
                🎯 Crear Mi Plan
            </button>
        </div>
    `;
}

// Funciones auxiliares
function getPlanIcon(type) {
    const icons = {
        'running': '🏃‍♂️',
        'functional': '💪',
        'gym': '🏋️‍♂️'
    };
    return icons[type] || '🎯';
}

function getActivityLabel(type) {
    const labels = {
        'running': 'Running',
        'functional': 'Funcional',
        'gym': 'Gimnasio'
    };
    return labels[type] || 'Entrenamiento';
}

// Configurar listeners
function setupDashboardListeners() {
    // Los listeners se configurarán cuando se implementen las funciones
}

// Funciones globales para interacción
window.showPlanMenu = function() {
    const plan = dashboardState.activePlan;
    if (!plan) return;
    
    const options = [
        { text: '📊 Ver detalles del plan', action: 'details' },
        { text: '🔄 Reiniciar plan', action: 'restart' },
        { text: '⏸️ Pausar plan', action: 'pause' },
        { text: '🗑️ Eliminar plan', action: 'delete', danger: true },
        { text: '🎯 Crear nuevo plan', action: 'new' }
    ];
    
    const menuHTML = `
        <div class="plan-menu-overlay" onclick="closePlanMenu()">
            <div class="plan-menu glass-card" onclick="event.stopPropagation()">
                <div class="plan-menu-header">
                    <h3>Gestionar Plan</h3>
                    <button class="close-btn" onclick="closePlanMenu()">✕</button>
                </div>
                <div class="plan-menu-options">
                    ${options.map(option => `
                        <button class="plan-menu-option ${option.danger ? 'danger' : ''}" 
                                onclick="handlePlanAction('${option.action}')">
                            ${option.text}
                        </button>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', menuHTML);
};

window.startTodaysWorkout = function() {
    console.log('🎯 startTodaysWorkout ejecutado');
    if (window.debugLogger) {
        window.debugLogger.logInfo('DASHBOARD_START_WORKOUT', 'Función startTodaysWorkout ejecutada', {
            dashboardState: dashboardState,
            todaysWorkout: dashboardState.todaysWorkout
        });
    }
    
    const workout = dashboardState.todaysWorkout;
    
    if (!workout) {
        console.log('❌ No hay workout definido');
        if (window.debugLogger) {
            window.debugLogger.logError('DASHBOARD_NO_WORKOUT', 'todaysWorkout es null o undefined', {
                dashboardState: dashboardState,
                activePlan: dashboardState.activePlan
            });
        }
        
        // Fallback: ir directamente a workouts basado en el plan activo
        if (dashboardState.activePlan) {
            const planType = dashboardState.activePlan.type;
            console.log(`🔄 Fallback: navegando a ${planType} basado en activePlan`);
            switch (planType) {
                case 'running':
                    window.navigateToPage('running');
                    break;
                case 'functional':
                case 'gym':
                default:
                    window.navigateToPage('workouts');
                    break;
            }
        } else {
            console.log('❌ No hay plan activo tampoco');
            // Último fallback: ir a workouts genérico
            window.navigateToPage('workouts');
        }
        return;
    }
    
    console.log('✅ Workout encontrado, navegando...', workout);
    
    try {
        switch (workout.type) {
            case 'running':
                console.log('🏃‍♂️ Navegando a página de running...');
                if (window.debugLogger) {
                    window.debugLogger.logInfo('DASHBOARD_NAVIGATE', 'Navegando a running', { workout });
                }
                // Marcar que venimos del dashboard con el workout específico
                localStorage.setItem('runningMode', 'plannedWorkout');
                localStorage.setItem('todaysWorkout', JSON.stringify(workout));
                window.navigateToPage('running');
                break;
            case 'functional':
            case 'gym':
                console.log('💪 Navegando a página de workouts...');
                if (window.debugLogger) {
                    window.debugLogger.logInfo('DASHBOARD_NAVIGATE', 'Navegando a workouts', { workout });
                }
                window.navigateToPage('workouts');
                break;
            default:
                console.log('❓ Tipo de workout desconocido:', workout.type);
                if (window.debugLogger) {
                    window.debugLogger.logWarn('DASHBOARD_UNKNOWN_WORKOUT', 'Tipo desconocido', { workout });
                }
                // Fallback to workouts
                window.navigateToPage('workouts');
                break;
        }
    } catch (error) {
        console.error('❌ Error navegando:', error);
        if (window.debugLogger) {
            window.debugLogger.logError('DASHBOARD_NAVIGATION_ERROR', 'Error en navegación', { error, workout });
        }
        // Último fallback
        window.navigateToPage('workouts');
    }
};

window.viewWorkoutDetails = function() {
    console.log('Viendo detalles del entrenamiento:', dashboardState.todaysWorkout);
    // TODO: Implementar vista de detalles
};

window.restartOnboarding = function() {
    if (confirm('¿Quieres crear un nuevo plan personalizado? Esto reemplazará tu plan actual.')) {
        localStorage.removeItem('entrenoapp_active_plan');
        window.navigateToPage('onboarding');
    }
};

// Cerrar menú del plan
window.closePlanMenu = function() {
    const overlay = document.querySelector('.plan-menu-overlay');
    if (overlay) {
        overlay.remove();
    }
};

// Manejar acciones del plan
window.handlePlanAction = function(action) {
    switch (action) {
        case 'details':
            showPlanDetails();
            break;
        case 'restart':
            restartCurrentPlan();
            break;
        case 'pause':
            pauseCurrentPlan();
            break;
        case 'delete':
            deleteCurrentPlan();
            break;
        case 'new':
            createNewPlan();
            break;
    }
    closePlanMenu();
};

// Mostrar detalles del plan
function showPlanDetails() {
    const plan = dashboardState.activePlan;
    alert(`Plan: ${plan.name}\nDuración: ${plan.duration} semanas\nFrecuencia: ${plan.frequency}x por semana\nTipo: ${getActivityLabel(plan.type)}`);
}

// Reiniciar plan actual
function restartCurrentPlan() {
    if (confirm('¿Estás seguro de que quieres reiniciar tu plan? Perderás todo el progreso actual.')) {
        const plan = dashboardState.activePlan;
        plan.currentWeek = 1;
        plan.currentSession = 1;
        plan.startDate = new Date().toISOString();
        
        // Guardar en Firebase y localStorage
        savePlanToStorage(plan);
        
        // Recargar dashboard
        loadUserPlan();
        
        alert('Plan reiniciado exitosamente');
    }
}

// Pausar plan actual
function pauseCurrentPlan() {
    const plan = dashboardState.activePlan;
    plan.status = plan.status === 'paused' ? 'active' : 'paused';
    
    savePlanToStorage(plan);
    loadUserPlan();
    
    alert(plan.status === 'paused' ? 'Plan pausado' : 'Plan reanudado');
}

// Eliminar plan actual
function deleteCurrentPlan() {
    if (confirm('¿Estás seguro de que quieres eliminar tu plan? Esta acción no se puede deshacer.')) {
        // Limpiar de Firebase y localStorage
        deletePlanFromStorage();
        
        // Limpiar estado
        dashboardState.activePlan = null;
        dashboardState.todaysWorkout = null;
        
        // Recargar dashboard
        renderDashboard();
        
        alert('Plan eliminado exitosamente');
    }
}

// Crear nuevo plan
function createNewPlan() {
    if (confirm('¿Quieres crear un nuevo plan? Esto reemplazará tu plan actual.')) {
        window.navigateToPage('onboarding');
    }
}

// Guardar plan en storage
async function savePlanToStorage(plan) {
    try {
        const user = auth.currentUser;
        if (user) {
            const userDoc = doc(db, 'users', user.uid);
            await updateDoc(userDoc, {
                activePlan: plan,
                updatedAt: serverTimestamp()
            });
        }
        
        localStorage.setItem('entrenoapp_active_plan', JSON.stringify(plan));
    } catch (error) {
        console.error('❌ Error guardando plan:', error);
    }
}

// Eliminar plan de storage
async function deletePlanFromStorage() {
    try {
        const user = auth.currentUser;
        if (user) {
            const userDoc = doc(db, 'users', user.uid);
            await updateDoc(userDoc, {
                activePlan: null,
                updatedAt: serverTimestamp()
            });
        }
        
        localStorage.removeItem('entrenoapp_active_plan');
    } catch (error) {
        console.error('❌ Error eliminando plan:', error);
    }
}

// ===================================
// FUNCIONES DE ACCIONES RÁPIDAS
// ===================================

// Funciones de Running
window.startFreeRun = function() {
    // Ir a running con modo libre
    localStorage.setItem('entrenoapp_running_mode', 'free');
    window.navigateToPage('running');
};

window.startIntervalTraining = function() {
    // Ir a running con modo intervalos
    localStorage.setItem('entrenoapp_running_mode', 'intervals');
    window.navigateToPage('running');
};

window.viewRunningPlans = function() {
    // Ir a running con vista de planes
    localStorage.setItem('entrenoapp_running_mode', 'plans');
    window.navigateToPage('running');
};

window.viewRunningHistory = function() {
    // Ir a perfil con vista de historial
    localStorage.setItem('entrenoapp_profile_mode', 'history');
    window.navigateToPage('profile');
};

// Funciones de Funcional
window.startFunctionalWOD = function() {
    localStorage.setItem('entrenoapp_workout_mode', 'functional');
    localStorage.setItem('entrenoapp_functional_mode', 'wod');
    window.navigateToPage('workouts');
};

window.browseWODs = function() {
    localStorage.setItem('entrenoapp_workout_mode', 'functional');
    localStorage.setItem('entrenoapp_functional_mode', 'browse');
    window.navigateToPage('workouts');
};

window.customWorkout = function() {
    localStorage.setItem('entrenoapp_workout_mode', 'functional');
    localStorage.setItem('entrenoapp_functional_mode', 'custom');
    window.navigateToPage('workouts');
};

window.viewPRs = function() {
    localStorage.setItem('entrenoapp_profile_mode', 'records');
    window.navigateToPage('profile');
};

// Funciones de Gym
window.startGymSession = function() {
    localStorage.setItem('entrenoapp_workout_mode', 'gym');
    localStorage.setItem('entrenoapp_gym_mode', 'session');
    window.navigateToPage('workouts');
};

window.browsePlans = function() {
    localStorage.setItem('entrenoapp_workout_mode', 'gym');
    localStorage.setItem('entrenoapp_gym_mode', 'plans');
    window.navigateToPage('workouts');
};

window.exerciseLibrary = function() {
    localStorage.setItem('entrenoapp_workout_mode', 'gym');
    localStorage.setItem('entrenoapp_gym_mode', 'library');
    window.navigateToPage('workouts');
};

window.viewProgress = function() {
    localStorage.setItem('entrenoapp_profile_mode', 'progress');
    window.navigateToPage('profile');
};

// Funciones generales
window.createNewPlan = function() {
    window.navigateToPage('onboarding');
};

window.quickWorkout = function() {
    localStorage.setItem('entrenoapp_workout_mode', 'quick');
    window.navigateToPage('workouts');
};

window.viewStats = function() {
    localStorage.setItem('entrenoapp_profile_mode', 'stats');
    window.navigateToPage('profile');
};

console.log('🏠 Dashboard personalizado cargado');
