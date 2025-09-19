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
    try {
        loadUserPlan();
        renderDashboard();
        setupDashboardListeners();
    } catch (error) {
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
            return;
        }
        
        const user = auth.currentUser;
        if (!user) {
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
        
        // Cargar estadísticas del usuario
        await loadUserStats();
        
        // Generar mensaje motivacional
        dashboardState.motivationalMessage = generateMotivationalMessage();
        
        // Mostrar anuncio nativo en el dashboard
        if (window.adsManager) {
            setTimeout(() => {
                window.adsManager.createNativeAd('quick-actions');
            }, 2000);
        }
        
    } catch (error) {
        // Error silencioso
    } finally {
        dashboardState.isLoading = false;
        renderDashboard();
    }
}

// Generar entrenamiento de hoy
function generateTodaysWorkout(plan) {
    if (!plan) {
        return null;
    }
    
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Domingo, 1 = Lunes, etc.
    const currentWeek = plan.currentWeek || 1;
    
    // Para planes personalizados generados por onboarding, ser más flexible
    if (plan.metadata && plan.metadata.basedOnOnboarding) {
        // Siempre mostrar el entrenamiento correspondiente del plan personalizado
    } else {
        // Para planes predefinidos, usar lógica de días fijos
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
    // Usar el generador avanzado si está disponible
    if (window.generateFunctionalWod) {
        try {
            const advancedWorkout = window.generateFunctionalWod(plan, week);
            if (advancedWorkout) {
                console.log('✅ Workout funcional avanzado generado:', advancedWorkout);
                return advancedWorkout;
            }
        } catch (error) {
            console.error('❌ Error generando workout funcional avanzado:', error);
        }
    }
    
    // Fallback: generador básico mejorado
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
        icon: '⚡',
        duration: 45,
        exercises: todayWorkout.exercises,
        sets: todayWorkout.sets,
        reps: todayWorkout.reps,
        intensity: plan.intensity || 'moderate',
        structure: 'Circuito',
        movements: todayWorkout.exercises.map(exercise => ({
            exercise: exercise,
            reps: todayWorkout.reps,
            notes: 'Mantén técnica correcta'
        })),
        notes: ['Calienta bien antes de empezar', 'Mantén el ritmo constante']
    };
}

// Generar entrenamiento de gimnasio
function generateGymWorkout(plan, week) {
    // Usar el generador avanzado si está disponible
    if (window.generateTodaysGymWorkout && plan.routine) {
        try {
            const advancedWorkout = window.generateTodaysGymWorkout(plan);
            if (advancedWorkout) {
                console.log('✅ Workout avanzado generado:', advancedWorkout);
                return advancedWorkout;
            }
        } catch (error) {
            console.error('❌ Error generando workout avanzado:', error);
        }
    }
    
    // Fallback: generador básico mejorado
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
        description: `Rutina ${plan.split?.replace('_', ' ') || 'Gimnasio'} - Semana ${week} de ${plan.duration}`,
        icon: '🏋️‍♂️',
        duration: 60,
        muscleGroup: todayMuscleGroup,
        sets: plan.focus === 'strength' ? '4-6 series' : '3-4 series',
        reps: plan.focus === 'strength' ? '4-6 reps' : '8-12 reps',
        intensity: plan.focus === 'strength' ? 'high' : 'moderate',
        // Agregar información para el resumen mejorado
        exercises: generateBasicExerciseList(todayMuscleGroup)
    };
}

// Generar lista básica de ejercicios para fallback
function generateBasicExerciseList(muscleGroup) {
    const exercisesByGroup = {
        'Cuerpo Completo': [
            { name: 'Sentadillas', sets: 3, reps: '8-12' },
            { name: 'Press de Banca', sets: 3, reps: '8-12' },
            { name: 'Peso Muerto', sets: 3, reps: '6-10' }
        ],
        'Pecho': [
            { name: 'Press de Banca', sets: 4, reps: '8-12' },
            { name: 'Press Inclinado', sets: 3, reps: '8-12' },
            { name: 'Aperturas', sets: 3, reps: '10-15' }
        ],
        'Espalda': [
            { name: 'Dominadas', sets: 4, reps: '6-12' },
            { name: 'Remo con Barra', sets: 3, reps: '8-12' },
            { name: 'Jalón al Pecho', sets: 3, reps: '10-15' }
        ],
        'Piernas': [
            { name: 'Sentadillas', sets: 4, reps: '8-12' },
            { name: 'Prensa', sets: 3, reps: '12-15' },
            { name: 'Curl Femoral', sets: 3, reps: '10-15' }
        ],
        'Hombros': [
            { name: 'Press Militar', sets: 4, reps: '8-12' },
            { name: 'Elevaciones Laterales', sets: 3, reps: '12-15' },
            { name: 'Aperturas Posteriores', sets: 3, reps: '12-15' }
        ],
        'Brazos': [
            { name: 'Curl con Barra', sets: 3, reps: '10-12' },
            { name: 'Press Cerrado', sets: 3, reps: '8-12' },
            { name: 'Fondos', sets: 3, reps: '8-15' }
        ]
    };
    
    return exercisesByGroup[muscleGroup] || exercisesByGroup['Cuerpo Completo'];
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
        // Usar la misma función que challenges.js
        if (window.generateTodayChallenge && window.challengesState) {
            window.generateTodayChallenge();
            const challenge = window.challengesState.todayChallenge;
            if (challenge) {
                dashboardState.todayChallenge = {
                    name: challenge.name,
                    target: challenge.target,
                    points: challenge.points,
                    completed: challenge.completed || false,
                    type: challenge.type,
                    id: challenge.id,
                    description: challenge.description
                };
            }
        } else {
            // Fallback si challenges.js no está cargado
            const todayChallenge = generateDailyChallenge();
            dashboardState.todayChallenge = {
                name: todayChallenge.name,
                target: todayChallenge.target,
                points: todayChallenge.points,
                completed: todayChallenge.completed || false,
                type: todayChallenge.type,
                id: todayChallenge.id,
                description: todayChallenge.description
            };
        }
        
        console.log('🎯 Reto diario cargado en dashboard:', dashboardState.todayChallenge);
    } catch (error) {
        console.error('❌ Error cargando reto diario:', error);
        // Fallback si falla
        dashboardState.todayChallenge = {
            name: 'Flexiones',
            target: 20,
            points: 15,
            completed: false,
            type: 'reps'
        };
    }
}

// Cargar estadísticas del usuario
async function loadUserStats() {
    try {
        const user = auth.currentUser;
        if (!user) return;
        
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
            const userData = userDoc.data();
            dashboardState.userStats = {
                totalWorkouts: userData.totalWorkouts || 0,
                totalPoints: userData.totalPoints || 0,
                currentStreak: userData.currentStreak || 0,
                level: userData.level || 1,
                joinDate: userData.joinDate?.toDate() || new Date()
            };
        }
    } catch (error) {
        console.error('❌ Error cargando estadísticas del usuario:', error);
    }
}

// Calcular próximo hito
function getNextMilestone(currentWorkouts) {
    const milestones = [5, 10, 25, 50, 100, 250, 500, 1000];
    const nextMilestone = milestones.find(milestone => milestone > currentWorkouts);
    return nextMilestone || '¡Eres una leyenda!';
}

// Generar reto diario (misma lógica que challenges.js)
function generateDailyChallenge() {
    // Base de datos de retos (copiada de challenges.js)
    const DAILY_CHALLENGES = {
        cardio: [
            {
                id: 'jumping_jacks',
                name: 'Jumping Jacks',
                description: 'Salta abriendo y cerrando brazos y piernas',
                type: 'reps',
                difficulty: {
                    beginner: { target: 20, points: 10 },
                    intermediate: { target: 30, points: 15 },
                    advanced: { target: 50, points: 20 }
                }
            },
            {
                id: 'mountain_climbers',
                name: 'Escaladores',
                description: 'Alterna rodillas al pecho en posición de plancha',
                type: 'reps',
                difficulty: {
                    beginner: { target: 15, points: 10 },
                    intermediate: { target: 25, points: 15 },
                    advanced: { target: 40, points: 20 }
                }
            }
        ],
        strength: [
            {
                id: 'push_ups',
                name: 'Flexiones',
                description: 'Flexiones de pecho tradicionales',
                type: 'reps',
                difficulty: {
                    beginner: { target: 10, points: 15 },
                    intermediate: { target: 20, points: 20 },
                    advanced: { target: 30, points: 25 }
                }
            },
            {
                id: 'squats',
                name: 'Sentadillas',
                description: 'Sentadillas con peso corporal',
                type: 'reps',
                difficulty: {
                    beginner: { target: 15, points: 10 },
                    intermediate: { target: 25, points: 15 },
                    advanced: { target: 40, points: 20 }
                }
            }
        ]
    };

    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
    
    const categories = Object.keys(DAILY_CHALLENGES);
    const selectedCategory = categories[dayOfYear % categories.length];
    const categoryExercises = DAILY_CHALLENGES[selectedCategory];
    const selectedExercise = categoryExercises[dayOfYear % categoryExercises.length];
    
    // Asumir nivel intermedio por defecto
    const userLevel = 'intermediate';
    const userDifficulty = selectedExercise.difficulty[userLevel];
    
    return {
        ...selectedExercise,
        target: userDifficulty.target,
        points: userDifficulty.points,
        date: today.toISOString().split('T')[0],
        completed: false
    };
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
        <button class="back-button" onclick="window.navigateBack()" title="Atrás">
            ←
        </button>
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
            
            <!-- Sección de monetización -->
            ${renderMonetizationSection()}
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
    const plan = dashboardState.activePlan;
    const currentDay = getCurrentTrainingDay();
    const trainingDays = getTrainingDays(plan.frequency);
    const dayInWeek = trainingDays.indexOf(new Date().getDay()) + 1;

    return `
        <div class="enhanced-workout-section">
            <!-- Frase motivacional del plan -->
            <div class="motivational-header glass-card mb-md">
                <h2 class="plan-title-enhanced">${plan.name}</h2>
                <p class="motivational-message-enhanced">${dashboardState.motivationalMessage}</p>
            </div>
            
            <!-- Barra de progreso del plan -->
            <div class="plan-progress-enhanced glass-card mb-md">
                <div class="progress-info-row">
                    <div class="current-position">
                        <span class="day-week-display">Día ${dayInWeek || 1} • Semana ${plan.currentWeek || 1}</span>
                        <span class="plan-duration">de ${plan.duration} semanas</span>
                    </div>
                    <div class="progress-percentage">
                        ${Math.round(((plan.currentWeek || 1) / plan.duration) * 100)}%
                    </div>
                </div>
                <div class="progress-bar-enhanced">
                    <div class="progress-fill-enhanced" style="width: ${((plan.currentWeek || 1) / plan.duration) * 100}%"></div>
                </div>
            </div>
            
            <!-- Entrenamiento de hoy -->
            <div class="todays-workout-card glass-card">
                <div class="workout-header-enhanced">
                    <h3 class="workout-title-enhanced">${workout.icon} ${workout.title}</h3>
                    <p class="workout-description-enhanced">${workout.description}</p>
                </div>
                
                <!-- Resumen específico por tipo de entrenamiento -->
                <div class="workout-summary-enhanced">
                    ${renderWorkoutSummaryByType(workout)}
                </div>
                
                <!-- Botón de acción principal -->
                <div class="workout-action-primary">
                    <button class="glass-button glass-button-primary btn-lg enhanced-start-btn" onclick="window.startTodaysWorkout()">
                        <span class="btn-icon">🚀</span>
                        <span class="btn-text">Comenzar Entrenamiento</span>
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Renderizar resumen específico por tipo de entrenamiento
function renderWorkoutSummaryByType(workout) {
    switch (workout.type) {
        case 'running':
            return `
                <div class="summary-grid running-summary">
                    <div class="summary-item primary">
                        <div class="summary-icon">📏</div>
                        <div class="summary-content">
                            <div class="summary-value">${workout.distance} km</div>
                            <div class="summary-label">Distancia</div>
                        </div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-icon">⏱️</div>
                        <div class="summary-content">
                            <div class="summary-value">${workout.duration} min</div>
                            <div class="summary-label">Tiempo estimado</div>
                        </div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-icon">💨</div>
                        <div class="summary-content">
                            <div class="summary-value">${getIntensityLabel(workout.intensity)}</div>
                            <div class="summary-label">Intensidad</div>
                        </div>
                    </div>
                </div>
                <div class="instructions-preview">
                    <h4 class="instructions-title">📝 Plan de hoy:</h4>
                    <ul class="instructions-list">
                        ${workout.instructions ? workout.instructions.slice(0, 2).map(instruction => 
                            `<li class="instruction-item">${instruction}</li>`
                        ).join('') : ''}
                        ${workout.instructions && workout.instructions.length > 2 ? 
                            `<li class="instruction-more">+${workout.instructions.length - 2} pasos más...</li>` : ''}
                    </ul>
                </div>
            `;
        
        case 'gym':
            return `
                <div class="summary-grid gym-summary">
                    <div class="summary-item primary">
                        <div class="summary-icon">💪</div>
                        <div class="summary-content">
                            <div class="summary-value">${workout.muscleGroup || workout.session?.name || 'Múltiples'}</div>
                            <div class="summary-label">Grupo muscular</div>
                        </div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-icon">🔢</div>
                        <div class="summary-content">
                            <div class="summary-value">${calculateTotalSets(workout)}</div>
                            <div class="summary-label">Series totales</div>
                        </div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-icon">🏋️‍♂️</div>
                        <div class="summary-content">
                            <div class="summary-value">${getExerciseCount(workout)} ejercicios</div>
                            <div class="summary-label">Ejercicios</div>
                        </div>
                    </div>
                </div>
                ${renderGymExerciseList(workout)}
            `;
        
        case 'functional':
            return `
                <div class="summary-grid functional-summary">
                    <div class="summary-item primary">
                        <div class="summary-icon">🔥</div>
                        <div class="summary-content">
                            <div class="summary-value">${workout.name || 'WOD'}</div>
                            <div class="summary-label">Entrenamiento</div>
                        </div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-icon">⏱️</div>
                        <div class="summary-content">
                            <div class="summary-value">${workout.duration || '15-20'} min</div>
                            <div class="summary-label">Duración</div>
                        </div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-icon">🎯</div>
                        <div class="summary-content">
                            <div class="summary-value">${workout.rounds || 3} rondas</div>
                            <div class="summary-label">Rondas</div>
                        </div>
                    </div>
                </div>
            `;
        
        default:
            return `
                <div class="summary-grid default-summary">
                    <div class="summary-item">
                        <div class="summary-icon">⏱️</div>
                        <div class="summary-content">
                            <div class="summary-value">${workout.duration || 30} min</div>
                            <div class="summary-label">Duración</div>
                        </div>
                    </div>
                </div>
            `;
    }
}

// Obtener día de entrenamiento actual
function getCurrentTrainingDay() {
    const plan = dashboardState.activePlan;
    if (!plan) return 1;
    
    const startDate = new Date(plan.startDate);
    const today = new Date();
    const diffTime = Math.abs(today - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays + 1;
}

// Obtener etiqueta de intensidad
function getIntensityLabel(intensity) {
    switch (intensity) {
        case 'low': return 'Suave';
        case 'moderate': return 'Moderada';
        case 'high': return 'Intensa';
        case 'very_high': return 'Muy intensa';
        default: return 'Moderada';
    }
}

// Calcular total de series para workout de gimnasio
function calculateTotalSets(workout) {
    if (workout.session && workout.session.exercises) {
        return workout.session.exercises.reduce((total, exercise) => total + (exercise.sets || 0), 0);
    }
    if (workout.exercises) {
        return workout.exercises.reduce((total, exercise) => total + (exercise.sets || 0), 0);
    }
    return workout.sets || '12-16 series';
}

// Obtener número de ejercicios
function getExerciseCount(workout) {
    if (workout.session && workout.session.exercises) {
        return workout.session.exercises.length;
    }
    if (workout.exercises) {
        return workout.exercises.length;
    }
    return '5-7';
}

// Renderizar lista de ejercicios para gimnasio
function renderGymExerciseList(workout) {
    let exercisesList = [];
    
    if (workout.session && workout.session.exercises) {
        exercisesList = workout.session.exercises;
    } else if (workout.exercises) {
        exercisesList = workout.exercises;
    }
    
    if (exercisesList.length === 0) return '';
    
    return `
        <div class="instructions-preview">
            <h4 class="instructions-title">🏋️‍♂️ Ejercicios de hoy:</h4>
            <ul class="instructions-list">
                ${exercisesList.map(exercise => {
                    const exerciseName = exercise.exerciseData?.name || exercise.name || `Ejercicio ${exercise.exerciseId}`;
                    const sets = exercise.sets || 3;
                    const reps = exercise.reps || '8-12';
                    return `<li class="instruction-item">${exerciseName} - ${sets} x ${reps}</li>`;
                }).join('')}
            </ul>
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

// Renderizar acciones rápidas (simplificadas)
function renderQuickActions() {
    const plan = dashboardState.activePlan;
    
    // Solo mostrar estadísticas si hay un plan activo
    if (plan) {
        const stats = dashboardState.userStats || {};
        return `
            <div class="quick-actions glass-card">
                <h3 class="actions-title">📊 Tu Progreso</h3>
                <div class="progress-stats">
                    <div class="stat-item">
                        <div class="stat-icon">🏋️‍♂️</div>
                        <div class="stat-value">${stats.totalWorkouts || 0}</div>
                        <div class="stat-label">Entrenamientos</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-icon">🔥</div>
                        <div class="stat-value">${stats.currentStreak || 0}</div>
                        <div class="stat-label">Racha</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-icon">⭐</div>
                        <div class="stat-value">${stats.totalPoints || 0}</div>
                        <div class="stat-label">Puntos</div>
                    </div>
                </div>
                <div class="next-milestone">
                    <div class="milestone-text">Próximo hito: ${getNextMilestone(stats.totalWorkouts || 0)} entrenamientos</div>
                </div>
                <div class="actions-grid">
                    <button class="action-btn glass-button" onclick="window.viewProgressStats()">
                        <span class="action-icon">📈</span>
                        <span class="action-text">Ver Gráficas</span>
                    </button>
                </div>
            </div>
        `;
    }
    
    // Si no hay plan, no mostrar acciones
    return '';
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
    // Verificar si ya se completó el entrenamiento de hoy
    const plan = dashboardState.activePlan;
    if (plan) {
        const todayKey = `${plan.type}_workout_completed_${new Date().toDateString()}`;
        const completedToday = localStorage.getItem(todayKey);
        
        if (completedToday) {
            alert('¡Ya completaste tu entrenamiento de hoy! Vuelve mañana para tu próximo entrenamiento. 💪');
            return;
        }
    }
    
    let workout = dashboardState.todaysWorkout;
    
    // Si no hay workout, intentar generarlo
    if (!workout && dashboardState.activePlan) {
        workout = generateTodaysWorkout(dashboardState.activePlan);
        dashboardState.todaysWorkout = workout;
    }
    
    if (!workout) {
        // Fallback: ir directamente a workouts basado en el plan activo
        if (dashboardState.activePlan) {
            const planType = dashboardState.activePlan.type;
            switch (planType) {
                case 'running':
                    const runningWorkout = generateRunningWorkout(dashboardState.activePlan, 1);
                    localStorage.setItem('runningMode', 'plannedWorkout');
                    localStorage.setItem('todaysWorkout', JSON.stringify(runningWorkout));
                    window.navigateToPage('running');
                    break;
                case 'functional':
                    const functionalWorkout = generateFunctionalWorkout(dashboardState.activePlan, 1);
                    localStorage.setItem('currentFunctionalWod', JSON.stringify(functionalWorkout));
                    window.navigateToPage('functional-workout');
                    break;
                case 'gym':
                    const gymWorkout = generateGymWorkout(dashboardState.activePlan, 1);
                    localStorage.setItem('currentGymWorkout', JSON.stringify(gymWorkout));
                    window.navigateToPage('gym-workout');
                    break;
                default:
                    window.navigateToPage('dashboard');
                    break;
            }
        } else {
            window.navigateToPage('dashboard');
        }
        return;
    }
    
    try {
        switch (workout.type) {
            case 'running':
                localStorage.setItem('runningMode', 'plannedWorkout');
                localStorage.setItem('todaysWorkout', JSON.stringify(workout));
                window.navigateToPage('running');
                break;
            case 'functional':
                localStorage.setItem('currentFunctionalWod', JSON.stringify(workout));
                window.navigateToPage('functional-workout');
                break;
            case 'gym':
                localStorage.setItem('currentGymWorkout', JSON.stringify(workout));
                window.navigateToPage('gym-workout');
                break;
            default:
                window.navigateToPage('workouts');
                break;
        }
    } catch (error) {
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
// FUNCIONES DE MONETIZACIÓN
// ===================================

// Renderizar sección de monetización
function renderMonetizationSection() {
    const isPremium = window.premiumManager?.hasPremium() || false;
    
    if (isPremium) {
        return `
            <div class="monetization-section glass-card">
                <h3 class="section-title">💎 Premium Activo</h3>
                <div class="premium-status">
                    <div class="premium-icon">✨</div>
                    <div class="premium-info">
                        <h4>¡Disfruta de todas las funciones premium!</h4>
                        <p>Sin anuncios, análisis avanzados y mucho más</p>
                    </div>
                </div>
                <div class="premium-actions">
                    <button class="glass-button glass-button-secondary" onclick="window.affiliateStore.showStore()">
                        🛍️ Tienda Fitness
                    </button>
                    <button class="glass-button glass-button-secondary" onclick="window.donationManager.showDonationModal()">
                        💝 Apoyar App
                    </button>
                </div>
            </div>
        `;
    }
    
    return `
        <div class="monetization-section glass-card">
            <h3 class="section-title">🚀 Desbloquea Más</h3>
            <div class="monetization-options">
                <div class="monetization-card premium-card">
                    <div class="card-header">
                        <div class="card-icon">💎</div>
                        <h4>Premium</h4>
                    </div>
                    <div class="card-content">
                        <p>Sin anuncios, análisis avanzados y funciones exclusivas</p>
                        <div class="card-price">Desde 4.99€/mes</div>
                    </div>
                    <button class="glass-button glass-button-primary" onclick="window.premiumManager.showPremiumModal()">
                        Ver Planes
                    </button>
                </div>
                
                <div class="monetization-card store-card">
                    <div class="card-header">
                        <div class="card-icon">🛍️</div>
                        <h4>Tienda Fitness</h4>
                    </div>
                    <div class="card-content">
                        <p>Equipamiento y suplementos con descuentos exclusivos</p>
                        <div class="card-price">Hasta 30% descuento</div>
                    </div>
                    <button class="glass-button glass-button-secondary" onclick="window.affiliateStore.showStore()">
                        Ver Tienda
                    </button>
                </div>
                
                <div class="monetization-card donation-card">
                    <div class="card-header">
                        <div class="card-icon">💝</div>
                        <h4>Apoyar App</h4>
                    </div>
                    <div class="card-content">
                        <p>Ayuda a mantener la app gratuita y mejorar</p>
                        <div class="card-price">Desde 2€</div>
                    </div>
                    <button class="glass-button glass-button-secondary" onclick="window.donationManager.showDonationModal()">
                        Donar
                    </button>
                </div>
            </div>
        </div>
    `;
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

// Ver estadísticas de progreso
window.viewProgressStats = function() {
    window.navigateToPage('progress-stats');
};

// Mostrar opciones de running
window.showRunningOptions = function() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content glass-card">
            <h2>🏃‍♂️ Opciones de Running</h2>
            <div class="running-options">
                <button class="glass-button glass-button-primary" onclick="window.startFreeRun(); this.closest('.modal-overlay').remove();">
                    <span class="btn-icon">🏃‍♂️</span>
                    <span class="btn-text">Carrera Libre</span>
                </button>
                <button class="glass-button glass-button-primary" onclick="window.startIntervalTraining(); this.closest('.modal-overlay').remove();">
                    <span class="btn-icon">⏱️</span>
                    <span class="btn-text">Entrenamiento por Intervalos</span>
                </button>
            </div>
            <button class="glass-button glass-button-secondary" onclick="this.closest('.modal-overlay').remove()">
                Cancelar
            </button>
        </div>
    `;
    document.body.appendChild(modal);
};

// Iniciar entrenamiento por intervalos
window.startIntervalTraining = function() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content glass-card">
            <h2>⏱️ Entrenamiento por Intervalos</h2>
            <div class="interval-options">
                <div class="option-group">
                    <label>Tiempo total:</label>
                    <select id="totalTime" class="glass-input">
                        <option value="15">15 minutos</option>
                        <option value="20" selected>20 minutos</option>
                        <option value="30">30 minutos</option>
                        <option value="45">45 minutos</option>
                        <option value="60">60 minutos</option>
                    </select>
                </div>
                <div class="option-group">
                    <label>Intensidad:</label>
                    <select id="intensity" class="glass-input">
                        <option value="easy">Fácil (2:1)</option>
                        <option value="medium" selected>Medio (1:1)</option>
                        <option value="hard">Intenso (1:2)</option>
                    </select>
                </div>
            </div>
            <div class="modal-actions">
                <button class="glass-button glass-button-primary" onclick="window.startIntervalWorkout()">
                    <span class="btn-icon">🚀</span>
                    <span class="btn-text">Comenzar</span>
                </button>
                <button class="glass-button glass-button-secondary" onclick="this.closest('.modal-overlay').remove()">
                    Cancelar
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
};

// Iniciar el workout de intervalos
window.startIntervalWorkout = function() {
    const totalTime = parseInt(document.getElementById('totalTime').value);
    const intensity = document.getElementById('intensity').value;
    
    // Calcular intervalos basado en intensidad
    let workTime, restTime;
    switch(intensity) {
        case 'easy':
            workTime = 2; // 2 minutos trabajo
            restTime = 1; // 1 minuto descanso
            break;
        case 'medium':
            workTime = 1.5; // 1.5 minutos trabajo
            restTime = 1.5; // 1.5 minutos descanso
            break;
        case 'hard':
            workTime = 1; // 1 minuto trabajo
            restTime = 2; // 2 minutos descanso
            break;
    }
    
    // Calcular número de intervalos
    const intervalDuration = workTime + restTime;
    const numIntervals = Math.floor(totalTime / intervalDuration);
    
    // Crear workout de intervalos
    const intervalWorkout = {
        type: 'interval',
        totalTime: totalTime,
        intensity: intensity,
        workTime: workTime,
        restTime: restTime,
        numIntervals: numIntervals,
        currentInterval: 0,
        isWorkPhase: true,
        timeRemaining: workTime * 60, // en segundos
        isRunning: false
    };
    
    // Guardar en localStorage y navegar
    localStorage.setItem('runningMode', 'intervalTraining');
    localStorage.setItem('intervalWorkout', JSON.stringify(intervalWorkout));
    
    // Cerrar modal y navegar directamente a intervalos
    document.querySelector('.modal-overlay').remove();
    window.navigateToPage('interval-training');
};

// Mostrar reto del día
window.showDailyChallenge = function() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content glass-card challenge-modal">
            <h2>🏆 Reto del Día</h2>
            <div class="challenge-content">
                <div class="challenge-info">
                    <h3 id="challengeName">Cargando...</h3>
                    <p id="challengeDescription">Cargando descripción...</p>
                    <div class="challenge-target">
                        <span class="target-label">Objetivo:</span>
                        <span class="target-value" id="challengeTarget">-</span>
                    </div>
                    <div class="challenge-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" id="challengeProgress" style="width: 0%"></div>
                        </div>
                        <span class="progress-text" id="challengeProgressText">0 / 0</span>
                    </div>
                </div>
                <div class="challenge-actions">
                    <button class="glass-button glass-button-primary" onclick="window.startChallenge()" id="startChallengeBtn">
                        <span class="btn-icon">🚀</span>
                        <span class="btn-text">Comenzar Reto</span>
                    </button>
                    <button class="glass-button glass-button-secondary" onclick="this.closest('.modal-overlay').remove(); window.navigateToPage('dashboard');">
                        Cerrar
                    </button>
                </div>
            </div>
            <div class="upcoming-challenges">
                <h4>📅 Próximos Retos</h4>
                <div class="challenges-list" id="upcomingChallenges">
                    <p>Cargando próximos retos...</p>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    // Cargar datos del reto
    loadChallengeData();
};

// Cargar datos del reto
function loadChallengeData() {
    const challenge = dashboardState.todayChallenge;
    if (challenge) {
        document.getElementById('challengeName').textContent = challenge.name;
        document.getElementById('challengeDescription').textContent = challenge.description;
        document.getElementById('challengeTarget').textContent = challenge.target;
        
        // Actualizar progreso
        const progress = challenge.completed ? 100 : 0;
        document.getElementById('challengeProgress').style.width = progress + '%';
        document.getElementById('challengeProgressText').textContent = 
            challenge.completed ? `${challenge.target} / ${challenge.target}` : `0 / ${challenge.target}`;
        
        // Actualizar botón
        const startBtn = document.getElementById('startChallengeBtn');
        if (challenge.completed) {
            startBtn.innerHTML = '<span class="btn-icon">✅</span><span class="btn-text">Completado</span>';
            startBtn.disabled = true;
        }
    }
    
    // Cargar próximos retos
    loadUpcomingChallenges();
}

// Cargar próximos retos
function loadUpcomingChallenges() {
    const upcomingContainer = document.getElementById('upcomingChallenges');
    const challenges = [
        { name: 'Flexiones', target: 25, day: 'Mañana' },
        { name: 'Sentadillas', target: 30, day: 'Pasado mañana' },
        { name: 'Plancha', target: 60, day: 'En 3 días' }
    ];
    
    upcomingContainer.innerHTML = challenges.map(challenge => `
        <div class="upcoming-challenge">
            <span class="challenge-name">${challenge.name}</span>
            <span class="challenge-target">${challenge.target}</span>
            <span class="challenge-day">${challenge.day}</span>
        </div>
    `).join('');
}

// Iniciar reto
window.startChallenge = function() {
    // Cerrar modal y navegar a challenges
    document.querySelector('.modal-overlay').remove();
    window.navigateToPage('challenges');
};

// Mostrar logros
window.showAchievements = function() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content glass-card achievements-modal">
            <h2>🏅 Mis Logros</h2>
            <div class="achievements-content">
                <div class="achievements-stats">
                    <div class="stat-item">
                        <span class="stat-icon">🏆</span>
                        <span class="stat-value" id="totalAchievements">0</span>
                        <span class="stat-label">Logros Desbloqueados</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-icon">⭐</span>
                        <span class="stat-value" id="totalPoints">0</span>
                        <span class="stat-label">Puntos Totales</span>
                    </div>
                </div>
                <div class="achievements-tabs">
                    <button class="tab-button active" onclick="showAchievementCategory('all')">Todos</button>
                    <button class="tab-button" onclick="showAchievementCategory('running')">Running</button>
                    <button class="tab-button" onclick="showAchievementCategory('gym')">Gym</button>
                    <button class="tab-button" onclick="showAchievementCategory('functional')">Funcional</button>
                </div>
                <div class="achievements-list" id="achievementsList">
                    <p>Cargando logros...</p>
                </div>
            </div>
            <button class="glass-button glass-button-secondary" onclick="this.closest('.modal-overlay').remove(); window.navigateToPage('dashboard');">
                Cerrar
            </button>
        </div>
    `;
    document.body.appendChild(modal);
    
    // Cargar logros
    loadAchievements();
};

// Cargar logros
window.loadAchievements = function() {
    const achievements = [
        {
            id: 'first_workout',
            name: 'Primer Entrenamiento',
            description: 'Completa tu primer entrenamiento',
            icon: '🎯',
            category: 'all',
            unlocked: true,
            points: 10,
            date: '2024-01-15'
        },
        {
            id: 'week_streak',
            name: 'Racha Semanal',
            description: 'Entrena 7 días seguidos',
            icon: '🔥',
            category: 'all',
            unlocked: false,
            points: 50,
            progress: 3,
            target: 7
        },
        {
            id: 'running_5k',
            name: 'Corredor 5K',
            description: 'Completa una carrera de 5K',
            icon: '🏃‍♂️',
            category: 'running',
            unlocked: false,
            points: 25,
            progress: 0,
            target: 1
        },
        {
            id: 'gym_100kg',
            name: 'Centurión',
            description: 'Levanta 100kg en press banca',
            icon: '💪',
            category: 'gym',
            unlocked: false,
            points: 100,
            progress: 0,
            target: 100
        },
        {
            id: 'wod_hero',
            name: 'Héroe Funcional',
            description: 'Completa 10 WODs diferentes',
            icon: '⚡',
            category: 'functional',
            unlocked: false,
            points: 75,
            progress: 2,
            target: 10
        }
    ];
    
    // Actualizar estadísticas
    const unlocked = achievements.filter(a => a.unlocked);
    document.getElementById('totalAchievements').textContent = unlocked.length;
    document.getElementById('totalPoints').textContent = unlocked.reduce((sum, a) => sum + a.points, 0);
    
    // Mostrar logros
    showAchievementCategory('all', achievements);
}

// Mostrar categoría de logros
window.showAchievementCategory = function(category, achievements = null) {
    if (!achievements) {
        // Recargar logros si no se pasan
        loadAchievements();
        return;
    }
    
    // Actualizar tabs
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    // Filtrar logros
    const filtered = category === 'all' ? achievements : achievements.filter(a => a.category === category);
    
    // Renderizar logros
    const container = document.getElementById('achievementsList');
    container.innerHTML = filtered.map(achievement => `
        <div class="achievement-item ${achievement.unlocked ? 'unlocked' : 'locked'}">
            <div class="achievement-icon">${achievement.icon}</div>
            <div class="achievement-info">
                <h4 class="achievement-name">${achievement.name}</h4>
                <p class="achievement-description">${achievement.description}</p>
                ${achievement.unlocked ? 
                    `<span class="achievement-date">Desbloqueado: ${achievement.date}</span>` :
                    `<div class="achievement-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${(achievement.progress / achievement.target) * 100}%"></div>
                        </div>
                        <span class="progress-text">${achievement.progress} / ${achievement.target}</span>
                    </div>`
                }
            </div>
            <div class="achievement-points">
                <span class="points-value">${achievement.points}</span>
                <span class="points-label">pts</span>
            </div>
        </div>
    `).join('');
}


