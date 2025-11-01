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
        
        // Intentar cargar desde Firestore solo si hay auth y usuario
        if (auth && auth.currentUser) {
            const user = auth.currentUser;
            dashboardState.user = user;
            
            // Cargar perfil y plan activo desde Firestore
            const userDoc = doc(db, 'users', user.uid);
            const userSnap = await getDoc(userDoc);
            
            if (userSnap.exists()) {
                const userData = userSnap.data();
                dashboardState.userProfile = userData;
                dashboardState.activePlan = userData.activePlan;
                
                // Verificar si el plan tiene sessionDuration, si no, agregarlo
                if (dashboardState.activePlan && !dashboardState.activePlan.sessionDuration) {
                    dashboardState.activePlan.sessionDuration = getDefaultSessionDuration(dashboardState.activePlan);
                    console.log('🔄 Plan actualizado con sessionDuration:', dashboardState.activePlan.sessionDuration);
                }
                
                dashboardState.quickStats = {
                    completedWorkouts: userData.stats?.totalWorkouts || 0,
                    currentStreak: userData.stats?.currentStreak || 0,
                    totalPoints: userData.stats?.totalPoints || 0,
                    nextMilestone: calculateNextMilestone(userData.stats?.totalPoints || 0)
                };
            }
        }
        
        // Si no hay plan activo, intentar siempre cargar desde localStorage
        if (!dashboardState.activePlan) {
            const savedPlan = localStorage.getItem('entrenoapp_active_plan');
            try { console.log('🔎 Buscando plan en localStorage:', !!savedPlan); } catch(e) {}
            if (savedPlan) {
                try {
                    const plan = JSON.parse(savedPlan);
                    dashboardState.activePlan = plan;
                } catch (error) {
                    console.error('❌ Error parsing plan guardado:', error);
                    localStorage.removeItem('entrenoapp_active_plan');
                }
            } else {
                // Fallback: si el onboarding se marcó como completado pero no hay plan, crear uno básico
                const onboardingDone = localStorage.getItem('entrenoapp_onboarding_complete') === 'true';
                if (onboardingDone) {
                    console.warn('⚠️ Onboarding completado pero sin plan guardado. Creando plan por defecto...');
                    const defaultPlan = {
                        type: 'functional',
                        name: 'Plan Funcional Básico',
                        description: 'Plan general de fitness funcional',
                        duration: 8,
                        frequency: 4,
                        currentWeek: 1,
                        currentSession: 1,
                        status: 'active',
                        startDate: new Date().toISOString(),
                        sessionDuration: 45,
                        metadata: { generatedAt: new Date().toISOString(), basedOnOnboarding: false }
                    };
                    try {
                        localStorage.setItem('entrenoapp_active_plan', JSON.stringify(defaultPlan));
                        dashboardState.activePlan = defaultPlan;
                        console.log('✅ Plan por defecto creado y guardado en localStorage');
                    } catch (e) {
                        console.error('❌ No fue posible guardar el plan por defecto en localStorage:', e);
                    }
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
    
    // Calcular duración basada en la selección del usuario
    const targetDuration = plan.sessionDuration || 45; // Duración de la sesión en minutos
    const actualDuration = Math.min(targetDuration, 90); // Máximo 90 minutos
    
    // Ajustar distancia según duración objetivo
    const pacePerKm = 6; // 6 minutos por km
    const warmupCooldown = 10; // 10 minutos de calentamiento + enfriamiento
    const availableTime = actualDuration - warmupCooldown;
    const adjustedDistance = Math.round((availableTime / pacePerKm) * 10) / 10;
    
    return {
        type: 'running',
        title: `Sesión de Running - ${adjustedDistance}km`,
        description: `Corre ${adjustedDistance}km a ritmo cómodo. Semana ${week} de ${plan.duration} semanas (${actualDuration} min)`,
        icon: '🏃‍♂️',
        duration: actualDuration,
        distance: adjustedDistance,
        intensity: plan.focus === 'speed' ? 'high' : 'moderate',
        instructions: [
            'Calentamiento: 5 minutos caminando',
            `Correr ${adjustedDistance}km a ritmo constante`,
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
    
    // Calcular duración basada en la selección del usuario
    const targetDuration = plan.sessionDuration || 45; // Duración de la sesión en minutos
    const actualDuration = Math.min(targetDuration, 90); // Máximo 90 minutos
    
    // Calcular series basado en tiempo real
    const warmupTime = 5; // minutos
    const cooldownTime = 5; // minutos
    const timePerSet = 0.5; // 30 segundos por serie (funcional es más rápido)
    const restBetweenSets = 0.5; // 30 segundos descanso
    const restBetweenExercises = 1; // 1 minuto entre ejercicios
    
    const availableTime = actualDuration - warmupTime - cooldownTime;
    
    // Calcular número óptimo de series
    let bestSets = 3;
    let bestTime = 0;
    
    for (let sets = 2; sets <= 6; sets++) {
        const totalTime = todayWorkout.exercises.length * (sets * (timePerSet + restBetweenSets) + restBetweenExercises) - restBetweenExercises;
        
        if (totalTime <= availableTime && totalTime > bestTime) {
            bestTime = totalTime;
            bestSets = sets;
        }
    }
    
    const adjustedSets = bestSets;
    
    return {
        type: 'functional',
        title: todayWorkout.title,
        description: `Entrenamiento funcional - Semana ${week} de ${plan.duration} semanas (${actualDuration} min)`,
        icon: '⚡',
        duration: actualDuration,
        exercises: todayWorkout.exercises,
        sets: adjustedSets,
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
    console.log('🔍 DEBUG generateGymWorkout - Plan recibido:', {
        planSessionDuration: plan.sessionDuration,
        planType: plan.type,
        planMetadata: plan.metadata,
        hasRoutine: !!plan.routine
    });
    
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
    
    console.log('🔄 Usando generador básico (fallback)');
    
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
    
    // Calcular duración basada en la selección del usuario
    const targetDuration = plan.sessionDuration || 45; // Duración de la sesión en minutos
    const actualDuration = Math.min(targetDuration, 90); // Máximo 90 minutos
    
    console.log('🔍 DEBUG generador básico:', {
        targetDuration,
        actualDuration,
        todayMuscleGroup
    });
    
    return {
        type: 'gym',
        title: `Entrenamiento de ${todayMuscleGroup}`,
        description: `Rutina ${plan.split?.replace('_', ' ') || 'Gimnasio'} - Semana ${week} de ${plan.duration} semanas (${actualDuration} min)`,
        icon: '🏋️‍♂️',
        duration: actualDuration,
        muscleGroup: todayMuscleGroup,
        sets: plan.focus === 'strength' ? '4-6 series' : '3-4 series',
        reps: plan.focus === 'strength' ? '4-6 reps' : '8-12 reps',
        intensity: plan.focus === 'strength' ? 'high' : 'moderate',
        // Agregar información para el resumen mejorado
        exercises: generateBasicExerciseList(todayMuscleGroup, actualDuration)
    };
}

// Generar lista básica de ejercicios para fallback
function generateBasicExerciseList(muscleGroup, duration = 45) {
    // Calcular tiempo real basado en:
    // - 1 minuto por serie (ejecución)
    // - 45 segundos de descanso entre series
    // - 2 minutos de descanso entre ejercicios
    // - 5 minutos de calentamiento
    // - 5 minutos de estiramientos
    
    const warmupTime = 5; // minutos
    const cooldownTime = 5; // minutos
    const timePerSet = 1; // minuto por serie
    const restBetweenSets = 0.75; // 45 segundos
    const restBetweenExercises = 2; // 2 minutos
    
    const availableTime = duration - warmupTime - cooldownTime;
    
    // Calcular número óptimo de ejercicios y series
    let bestConfig = { exercises: 3, sets: 3 };
    let bestTime = 0;
    
    // Probar diferentes combinaciones
    for (let ex = 2; ex <= 6; ex++) {
        for (let sets = 2; sets <= 5; sets++) {
            const totalTime = ex * (sets * (timePerSet + restBetweenSets) + restBetweenExercises) - restBetweenExercises;
            
            if (totalTime <= availableTime && totalTime > bestTime) {
                bestTime = totalTime;
                bestConfig = { exercises: ex, sets: sets };
            }
        }
    }
    
    const exerciseCount = bestConfig.exercises;
    
    const exercisesByGroup = {
        'Cuerpo Completo': [
            { name: 'Sentadillas', sets: 3, reps: '8-12', time: 8 },
            { name: 'Press de Banca', sets: 3, reps: '8-12', time: 8 },
            { name: 'Peso Muerto', sets: 3, reps: '6-10', time: 8 },
            { name: 'Press Militar', sets: 3, reps: '8-12', time: 6 },
            { name: 'Remo con Barra', sets: 3, reps: '8-12', time: 6 },
            { name: 'Plancha', sets: 3, reps: '30-60s', time: 4 },
            { name: 'Curl con Barra', sets: 3, reps: '10-12', time: 5 },
            { name: 'Fondos', sets: 3, reps: '8-15', time: 5 }
        ],
        'Pecho': [
            { name: 'Press de Banca', sets: 4, reps: '8-12', time: 10 },
            { name: 'Press Inclinado', sets: 3, reps: '8-12', time: 8 },
            { name: 'Aperturas', sets: 3, reps: '10-15', time: 6 },
            { name: 'Press Declinado', sets: 3, reps: '8-12', time: 8 },
            { name: 'Fondos', sets: 3, reps: '8-15', time: 6 },
            { name: 'Cruces con Mancuernas', sets: 3, reps: '12-15', time: 5 },
            { name: 'Flexiones', sets: 3, reps: '10-20', time: 4 },
            { name: 'Pullover', sets: 3, reps: '10-12', time: 5 }
        ],
        'Espalda': [
            { name: 'Dominadas', sets: 4, reps: '6-12', time: 10 },
            { name: 'Remo con Barra', sets: 3, reps: '8-12', time: 8 },
            { name: 'Jalón al Pecho', sets: 3, reps: '10-15', time: 6 },
            { name: 'Peso Muerto', sets: 3, reps: '6-10', time: 8 },
            { name: 'Remo con Mancuerna', sets: 3, reps: '8-12', time: 6 },
            { name: 'Hiperextensiones', sets: 3, reps: '12-15', time: 5 },
            { name: 'Curl de Bíceps', sets: 3, reps: '10-12', time: 5 },
            { name: 'Face Pulls', sets: 3, reps: '12-15', time: 4 }
        ],
        'Piernas': [
            { name: 'Sentadillas', sets: 4, reps: '8-12', time: 10 },
            { name: 'Prensa', sets: 3, reps: '12-15', time: 8 },
            { name: 'Curl Femoral', sets: 3, reps: '10-15', time: 6 },
            { name: 'Zancadas', sets: 3, reps: '10-12', time: 6 },
            { name: 'Peso Muerto Rumano', sets: 3, reps: '8-12', time: 8 },
            { name: 'Extensiones de Cuádriceps', sets: 3, reps: '12-15', time: 5 },
            { name: 'Elevaciones de Gemelos', sets: 3, reps: '15-20', time: 4 },
            { name: 'Sentadilla Búlgara', sets: 3, reps: '8-10', time: 6 }
        ],
        'Hombros': [
            { name: 'Press Militar', sets: 4, reps: '8-12', time: 10 },
            { name: 'Elevaciones Laterales', sets: 3, reps: '12-15', time: 6 },
            { name: 'Aperturas Posteriores', sets: 3, reps: '12-15', time: 5 },
            { name: 'Press Arnold', sets: 3, reps: '8-12', time: 8 },
            { name: 'Elevaciones Frontales', sets: 3, reps: '10-12', time: 5 },
            { name: 'Remo al Mentón', sets: 3, reps: '8-12', time: 6 },
            { name: 'Elevaciones Laterales Inclinado', sets: 3, reps: '12-15', time: 5 },
            { name: 'Press con Mancuernas', sets: 3, reps: '8-12', time: 8 }
        ],
        'Brazos': [
            { name: 'Curl con Barra', sets: 3, reps: '10-12', time: 6 },
            { name: 'Press Cerrado', sets: 3, reps: '8-12', time: 6 },
            { name: 'Fondos', sets: 3, reps: '8-15', time: 5 },
            { name: 'Curl con Mancuernas', sets: 3, reps: '10-12', time: 5 },
            { name: 'Extensión de Tríceps', sets: 3, reps: '10-12', time: 5 },
            { name: 'Curl Martillo', sets: 3, reps: '10-12', time: 5 },
            { name: 'Press Francés', sets: 3, reps: '8-12', time: 6 },
            { name: 'Curl 21s', sets: 3, reps: '21', time: 4 }
        ]
    };
    
    const allExercises = exercisesByGroup[muscleGroup] || exercisesByGroup['Cuerpo Completo'];
    return allExercises.slice(0, exerciseCount).map(exercise => ({
        ...exercise,
        sets: bestConfig.sets
    }));
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

// Obtener duración por defecto basada en el plan existente
function getDefaultSessionDuration(plan) {
    // Si el plan tiene metadatos de onboarding, usar la disponibilidad
    if (plan.metadata && plan.metadata.availability) {
        const availability = plan.metadata.availability;
        const sessionDurationMap = {
            'low': 30,     // 15-30 min -> 30 min
            'medium': 45,  // 30-60 min -> 45 min
            'high': 60,    // 60+ min -> 60 min
            'athlete': 75  // Atleta -> 75 min
        };
        return sessionDurationMap[availability] || 45;
    }
    
    // Si no hay metadatos, inferir basado en la frecuencia
    if (plan.frequency <= 3) return 60;  // Menos frecuencia = sesiones más largas
    if (plan.frequency <= 4) return 45;  // Frecuencia media = sesiones medias
    return 30;  // Más frecuencia = sesiones más cortas
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
            <!-- 1. Bienvenida -->
            ${renderPersonalizedHeader()}
            
            <!-- 2. Entrenamiento del día -->
            ${renderTodaysWorkout()}
            
            <!-- 3. Reto del día -->
            ${renderTodayChallenge()}
            
            <!-- 4. Progreso de esta semana -->
            ${renderWeeklyProgress()}
            
            <!-- 4.5. Calendario Mensual con Heat Map -->
            ${renderMonthlyCalendar()}
            
            <!-- 4.6. Gráficos de Progreso -->
            ${renderProgressCharts()}
            
            <!-- 4.7. Comparación Semana Anterior -->
            ${renderWeekComparison()}
            
            <!-- 5. Tu progreso (estadísticas rápidas) -->
            ${renderQuickStats()}
            
            <!-- 6. Tus estadísticas (estadísticas detalladas) -->
            ${renderDetailedStats()}
            
            <!-- 7. Mi salud -->
            ${renderHealthSection()}
            
            <!-- 8. Tu plan activo -->
            ${renderActivePlan()}
            
            <!-- 9. Desbloquea más -->
            ${renderMonetizationSection()}

            <!-- Legal -->
            ${renderLegalBlock()}
        </div>
    `;
    
    // Inicializar gráficos después de renderizar
    setTimeout(() => {
        initProgressCharts();
    }, 100);
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

// Bloque Legal al final del dashboard
function renderLegalBlock() {
    return `
        <div style="height:12px"></div>
        <div class="glass-card" style="margin:12px 0 84px; padding:12px; opacity:0.95;">
            <div style="display:flex; flex-wrap:wrap; gap:12px; align-items:center; justify-content:center;">
                <a href="/privacy.html" class="glass-button glass-button-secondary" style="padding:8px 12px;">Privacidad</a>
                <a href="/terms.html" class="glass-button glass-button-secondary" style="padding:8px 12px;">Términos</a>
                <a href="/contact.html" class="glass-button glass-button-secondary" style="padding:8px 12px;">Contacto</a>
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
                    <button id="start-workout-btn" class="glass-button glass-button-primary btn-lg enhanced-start-btn" onclick="window.startTodaysWorkoutWithCountdown()">
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
    const plan = dashboardState.activePlan;
    if (!plan) return '';
    
    // Generar plan semanal de 7 días
    const weeklyPlan = generateWeeklyPlan(plan);
    const todayIndex = new Date().getDay(); // 0 = Domingo, 1 = Lunes, etc.
    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const fullDayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    
    return `
        <div class="weekly-plan-card glass-card mb-lg">
            <div class="weekly-plan-header">
                <h3 class="weekly-plan-title">📅 Plan Semanal</h3>
                <span class="weekly-progress-text">${dashboardState.weekProgress}% completado</span>
            </div>
            <div class="week-progress-bar mb-md">
                <div class="week-progress-fill" style="width: ${dashboardState.weekProgress}%"></div>
            </div>
            <div class="weekly-calendar">
                ${weeklyPlan.map((day, index) => {
                    const isToday = index === todayIndex;
                    const isCompleted = day.completed || false;
                    const dayName = dayNames[index];
                    const dayNumber = new Date().getDate() + (index - todayIndex);
                    
                    return `
                        <div class="week-day-card ${isToday ? 'today' : ''} ${isCompleted ? 'completed' : ''}" 
                             onclick="${day.workout ? `window.showDayWorkout(${index})` : ''}">
                            <div class="day-header">
                                <div class="day-name">${dayName}</div>
                                <div class="day-number">${dayNumber}</div>
                            </div>
                            <div class="day-content">
                                ${day.workout ? `
                                    <div class="day-workout-icon">${getWorkoutIcon(day.workout.type)}</div>
                                    <div class="day-workout-type">${getWorkoutTypeLabel(day.workout.type)}</div>
                                    ${day.workout.duration ? `<div class="day-workout-duration">${day.workout.duration} min</div>` : ''}
                                ` : `
                                    <div class="day-rest">${day.isRest ? '😌' : '⚪'}</div>
                                    <div class="day-rest-label">${day.isRest ? 'Descanso' : 'No planificado'}</div>
                                `}
                            </div>
                            ${isToday ? '<div class="today-badge">Hoy</div>' : ''}
                            ${isCompleted ? '<div class="completed-badge">✓</div>' : ''}
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
}

// Generar plan semanal de 7 días
function generateWeeklyPlan(plan) {
    const trainingDays = getTrainingDays(plan.frequency);
    const weeklyPlan = [];
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Domingo
    
    // Generar 7 días empezando desde hoy
    for (let i = 0; i < 7; i++) {
        const currentDay = (dayOfWeek + i) % 7;
        const isTrainingDay = trainingDays.includes(currentDay);
        
        if (isTrainingDay) {
            // Generar workout para este día
            const workout = generateDayWorkout(plan, i + 1);
            weeklyPlan.push({
                dayIndex: currentDay,
                workout: workout,
                isRest: false,
                completed: checkIfDayCompleted(i) // TODO: implementar tracking de días completados
            });
        } else {
            weeklyPlan.push({
                dayIndex: currentDay,
                workout: null,
                isRest: true,
                completed: false
            });
        }
    }
    
    return weeklyPlan;
}

// Generar workout para un día específico
function generateDayWorkout(plan, dayOffset) {
    if (plan.type === 'running') {
        return {
            type: 'running',
            title: 'Entrenamiento de Running',
            duration: 30,
            distance: '5 km',
            intensity: 'moderate'
        };
    } else if (plan.type === 'gym') {
        return {
            type: 'gym',
            title: 'Entrenamiento de Gimnasio',
            duration: plan.sessionDuration || 45,
            muscleGroup: getRandomMuscleGroup()
        };
    } else if (plan.type === 'functional') {
        return {
            type: 'functional',
            title: 'WOD Funcional',
            duration: 20,
            rounds: 3
        };
    }
    
    return {
        type: 'general',
        title: 'Entrenamiento',
        duration: 30
    };
}

// Verificar si un día está completado
function checkIfDayCompleted(dayOffset) {
    const today = new Date();
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + dayOffset);
    
    const dateKey = targetDate.toISOString().split('T')[0];
    const completedDays = JSON.parse(localStorage.getItem('entrenoapp_completed_days') || '[]');
    return completedDays.includes(dateKey);
}

// Obtener icono de workout
function getWorkoutIcon(type) {
    const icons = {
        'running': '🏃‍♂️',
        'gym': '🏋️‍♂️',
        'functional': '⚡',
        'general': '💪'
    };
    return icons[type] || '💪';
}

// Obtener etiqueta de tipo de workout
function getWorkoutTypeLabel(type) {
    const labels = {
        'running': 'Running',
        'gym': 'Gimnasio',
        'functional': 'Funcional',
        'general': 'Entrenamiento'
    };
    return labels[type] || 'Entrenamiento';
}

// Obtener grupo muscular aleatorio
function getRandomMuscleGroup() {
    const groups = ['Pecho', 'Espalda', 'Piernas', 'Hombros', 'Brazos', 'Full Body'];
    return groups[Math.floor(Math.random() * groups.length)];
}

// Mostrar workout de un día específico
window.showDayWorkout = function(dayIndex) {
    const weeklyPlan = generateWeeklyPlan(dashboardState.activePlan);
    const day = weeklyPlan[dayIndex];
    
    if (day && day.workout) {
        // Guardar workout y navegar
        localStorage.setItem('selectedDayWorkout', JSON.stringify(day.workout));
        window.startTodaysWorkout();
    }
};

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
            <h3 class="stats-title">📈 Tu Progreso</h3>
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

// Renderizar estadísticas detalladas
function renderDetailedStats() {
    const stats = dashboardState.quickStats;
    const plan = dashboardState.activePlan;
    
    return `
        <div class="detailed-stats glass-card">
            <h3 class="section-title">📊 Tus Estadísticas Detalladas</h3>
            <div class="detailed-stats-grid">
                <div class="stat-card">
                    <div class="stat-icon">🏋️‍♂️</div>
                    <div class="stat-content">
                        <div class="stat-value">${stats.completedWorkouts}</div>
                        <div class="stat-label">Entrenamientos Completados</div>
                        <div class="stat-progress">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${Math.min((stats.completedWorkouts / 100) * 100, 100)}%"></div>
                            </div>
                            <span class="progress-text">${stats.completedWorkouts}/100</span>
                        </div>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon">🔥</div>
                    <div class="stat-content">
                        <div class="stat-value">${stats.currentStreak}</div>
                        <div class="stat-label">Racha Actual</div>
                        <div class="stat-subtitle">¡Sigue así!</div>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon">⭐</div>
                    <div class="stat-content">
                        <div class="stat-value">${stats.totalPoints}</div>
                        <div class="stat-label">Puntos Totales</div>
                        ${stats.nextMilestone ? `
                            <div class="stat-subtitle">Próximo hito: ${stats.nextMilestone} puntos</div>
                        ` : ''}
                    </div>
                </div>
                
                ${plan ? `
                    <div class="stat-card">
                        <div class="stat-icon">📅</div>
                        <div class="stat-content">
                            <div class="stat-value">${plan.currentWeek || 1}</div>
                            <div class="stat-label">Semana Actual</div>
                            <div class="stat-subtitle">de ${plan.duration || 12} semanas</div>
                        </div>
                    </div>
                ` : ''}
                
                <div class="stat-card">
                    <div class="stat-icon">🎯</div>
                    <div class="stat-content">
                        <div class="stat-value">${Math.round((stats.completedWorkouts / Math.max(1, (plan?.duration || 12) * 3)) * 100)}%</div>
                        <div class="stat-label">Objetivo Semanal</div>
                        <div class="stat-subtitle">Basado en tu plan</div>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon">🏆</div>
                    <div class="stat-content">
                        <div class="stat-value">${Math.floor(stats.totalPoints / 100)}</div>
                        <div class="stat-label">Logros Desbloqueados</div>
                        <div class="stat-subtitle">¡Sigue entrenando!</div>
                    </div>
                </div>
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
    const hasLocalPlan = !!localStorage.getItem('entrenoapp_active_plan');
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
            <div style="height:12px"></div>
            <div class="text-secondary" style="font-size:.85rem; opacity:.7;">Modo invitado activo</div>
            <div style="margin-top:8px; display:flex; gap:8px; justify-content:center; flex-wrap:wrap;">
                <button class="glass-button glass-button-secondary btn-sm" onclick="window.debugCreateTestPlan()">⚡ Forzar plan de prueba</button>
                <button class="glass-button glass-button-secondary btn-sm" onclick="window.debugShowPlanStatus()">🔎 Estado plan</button>
            </div>
            ${hasLocalPlan ? '<div class="text-secondary" style="margin-top:8px; font-size:.8rem;">Se detectó plan en localStorage, vuelve a cargar si no aparece.</div>' : ''}
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
window.debugCreateTestPlan = function() {
    const testPlan = {
        type: 'functional',
        name: 'Plan Test (Temporal)',
        description: 'Plan de prueba para validar UI',
        duration: 8,
        frequency: 4,
        currentWeek: 1,
        currentSession: 1,
        status: 'active',
        startDate: new Date().toISOString(),
        sessionDuration: 45,
        metadata: { generatedAt: new Date().toISOString(), basedOnOnboarding: true }
    };
    localStorage.setItem('entrenoapp_active_plan', JSON.stringify(testPlan));
    renderDashboard();
};

window.debugShowPlanStatus = function() {
    const saved = localStorage.getItem('entrenoapp_active_plan');
    if (!saved) {
        alert('No hay plan en localStorage');
        return;
    }
    try {
        const plan = JSON.parse(saved);
        alert(`Plan detectado: ${plan.name} (${plan.type})`);
    } catch (e) {
        alert('Error leyendo plan en localStorage');
    }
};

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

// Iniciar workout con cuenta regresiva
window.startTodaysWorkoutWithCountdown = function() {
    const btn = document.getElementById('start-workout-btn');
    if (!btn || btn.classList.contains('countdown')) return;
    
    // Agregar overlay de cuenta regresiva
    btn.classList.add('countdown');
    btn.disabled = true;
    let countdown = 3;
    
    const overlay = document.createElement('div');
    overlay.className = 'countdown-overlay';
    overlay.innerHTML = `<span class="countdown-number">${countdown}</span>`;
    btn.appendChild(overlay);
    
    const interval = setInterval(() => {
        countdown--;
        if (countdown > 0) {
            overlay.querySelector('.countdown-number').textContent = countdown;
        } else {
            clearInterval(interval);
            btn.classList.remove('countdown');
            btn.disabled = false;
            overlay.remove();
            window.startTodaysWorkout();
        }
    }, 1000);
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
// FUNCIONES DE SALUD
// ===================================

// Renderizar sección de salud
function renderHealthSection() {
    if (!window.healthManager) {
        return '';
    }
    
    const healthData = window.healthManager.getHealthData();
    const achievements = window.healthManager.getAchievements();
    const recentAchievements = achievements.slice(-2).reverse();
    const hasData = healthData.steps > 0 || healthData.sleepHours > 0 || healthData.activeMinutes > 0;
    
    if (!hasData) {
        return `
            <div class="health-section glass-card mb-lg">
                <div class="health-header">
                    <h3>🏥 Mi Salud</h3>
                    <div class="health-status-badge">
                        <span class="status-icon">📊</span>
                        <span class="status-text">Introducir Datos</span>
                    </div>
                </div>
                
                <div class="health-empty-state">
                    <div class="empty-icon">📊</div>
                    <h4>¡Empieza a seguir tu salud!</h4>
                    <p>Introduce tus datos de salud para llevar un seguimiento completo y desbloquear logros.</p>
                    
                    <div class="health-benefits">
                        <div class="benefit-item">
                            <span class="benefit-icon">👣</span>
                            <span>Seguir tus pasos diarios</span>
                        </div>
                        <div class="benefit-item">
                            <span class="benefit-icon">😴</span>
                            <span>Monitorear tu sueño</span>
                        </div>
                        <div class="benefit-item">
                            <span class="benefit-icon">❤️</span>
                            <span>Frecuencia cardíaca</span>
                        </div>
                        <div class="benefit-item">
                            <span class="benefit-icon">🏆</span>
                            <span>Logros y gamificación</span>
                        </div>
                    </div>
                    
                    <div class="health-actions">
                        <button class="glass-button glass-button-primary" onclick="window.showManualHealthInput()">
                            ✏️ Introducir Datos Manualmente
                        </button>
                        <button class="glass-button glass-button-secondary" onclick="window.showHealthDashboard()">
                            📊 Ver Dashboard
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    return `
        <div class="health-section glass-card mb-lg">
            <div class="health-header">
                <h3>🏥 Mi Salud</h3>
                <button class="glass-button glass-button-secondary btn-sm" onclick="window.showHealthDashboard()">
                    📊 Ver Detalles
                </button>
            </div>
            
            <div class="health-metrics-mini">
                <div class="health-metric ${healthData.steps > 0 ? 'has-data' : 'no-data'}">
                    <div class="metric-icon">👣</div>
                    <div class="metric-info">
                        <div class="metric-value">${healthData.steps > 0 ? healthData.steps.toLocaleString() : '--'}</div>
                        <div class="metric-label">Pasos</div>
                        ${healthData.steps === 0 ? '<div class="metric-hint">Introducir datos</div>' : ''}
                    </div>
                </div>
                
                <div class="health-metric ${healthData.sleepHours > 0 ? 'has-data' : 'no-data'}">
                    <div class="metric-icon">😴</div>
                    <div class="metric-info">
                        <div class="metric-value">${healthData.sleepHours > 0 ? `${healthData.sleepHours}h` : '--'}</div>
                        <div class="metric-label">Sueño</div>
                        ${healthData.sleepHours === 0 ? '<div class="metric-hint">Introducir datos</div>' : ''}
                    </div>
                </div>
                
                <div class="health-metric ${healthData.activeMinutes > 0 ? 'has-data' : 'no-data'}">
                    <div class="metric-icon">⚡</div>
                    <div class="metric-info">
                        <div class="metric-value">${healthData.activeMinutes > 0 ? healthData.activeMinutes : '--'}</div>
                        <div class="metric-label">Min Activos</div>
                        ${healthData.activeMinutes === 0 ? '<div class="metric-hint">Entrena con la app</div>' : ''}
                    </div>
                </div>
                
                <div class="health-metric ${healthData.heartRate > 0 ? 'has-data' : 'no-data'}">
                    <div class="metric-icon">❤️</div>
                    <div class="metric-info">
                        <div class="metric-value">${healthData.heartRate > 0 ? healthData.heartRate : '--'}</div>
                        <div class="metric-label">BPM</div>
                        ${healthData.heartRate === 0 ? '<div class="metric-hint">Introducir datos</div>' : ''}
                    </div>
                </div>
            </div>
            
            ${recentAchievements.length > 0 ? `
                <div class="recent-achievements-mini">
                    <h4>🏆 Logros Recientes</h4>
                    <div class="achievements-list-mini">
                        ${recentAchievements.map(achievement => `
                            <div class="achievement-mini">
                                <span class="achievement-icon">${achievement.title.split(' ')[0]}</span>
                                <span class="achievement-title">${achievement.title}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : `
                <div class="no-achievements-mini">
                    <div class="no-achievements-icon">🏆</div>
                    <p>¡Completa entrenamientos para desbloquear logros!</p>
                </div>
            `}
        </div>
    `;
}

// Mostrar dashboard de salud completo
window.showHealthDashboard = function() {
    const container = document.querySelector('.dashboard-container');
    if (!container) return;
    
    container.innerHTML = `
        <button class="back-button" onclick="window.initDashboard()" title="Volver al Dashboard">
            ←
        </button>
        <div id="health-dashboard-container"></div>
    `;
    
    // Inicializar dashboard de salud
    if (window.healthDashboard) {
        window.healthDashboard.render();
    }
};

// Mostrar setup de salud
window.showHealthSetup = function() {
    const modal = document.createElement('div');
    modal.className = 'health-setup-modal';
    modal.innerHTML = `
        <div class="modal-content glass-effect">
            <div class="modal-header">
                <h2>🔗 Conectar Dispositivo de Salud</h2>
                <button class="modal-close" onclick="this.closest('.health-setup-modal').remove()">×</button>
            </div>
            <div class="modal-body">
                <div class="setup-steps">
                    <div class="setup-step">
                        <div class="step-icon">📱</div>
                        <div class="step-content">
                            <h3>1. Activa los permisos</h3>
                            <p>Ve a Configuración > Privacidad > Salud y permite el acceso a EntrenoApp</p>
                        </div>
                    </div>
                    
                    <div class="setup-step">
                        <div class="step-icon">🔄</div>
                        <div class="step-content">
                            <h3>2. Sincronización automática</h3>
                            <p>Los datos se actualizarán automáticamente cada hora</p>
                        </div>
                    </div>
                    
                    <div class="setup-step">
                        <div class="step-icon">🏆</div>
                        <div class="step-content">
                            <h3>3. Desbloquea logros</h3>
                            <p>Completa objetivos para ganar XP y desbloquear logros</p>
                        </div>
                    </div>
                </div>
                
                <div class="setup-actions">
                    <button class="glass-button glass-button-primary" onclick="window.showManualHealthInput()">
                        ✏️ Introducir Datos
                    </button>
                    <button class="glass-button glass-button-secondary" onclick="this.closest('.health-setup-modal').remove()">
                        Más tarde
                    </button>
                </div>
                
                <div class="setup-note">
                    <p>💡 <strong>Nota:</strong> Para un seguimiento completo de tu salud, puedes introducir tus datos manualmente desde la app Salud de tu iPhone.</p>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
};

// Mostrar entrada manual de datos de salud
window.showManualHealthInput = function() {
    const modal = document.createElement('div');
    modal.className = 'manual-health-input-modal';
    modal.innerHTML = `
        <div class="modal-content glass-effect">
            <div class="modal-header">
                <h2>📊 Introducir Datos de Salud</h2>
                <button class="modal-close" onclick="this.closest('.manual-health-input-modal').remove()">×</button>
            </div>
            <div class="modal-body">
                <div class="input-section">
                    <h3>📅 Datos de Hoy</h3>
                    <p>Introduce tus datos de salud de hoy para llevar un seguimiento completo:</p>
                    
                    <div class="health-inputs">
                        <div class="input-group">
                            <label for="manual-steps">👣 Pasos:</label>
                            <input type="number" id="manual-steps" placeholder="Ej: 8500" min="0" max="50000">
                        </div>
                        
                        <div class="input-group">
                            <label for="manual-sleep">😴 Horas de Sueño:</label>
                            <input type="number" id="manual-sleep" placeholder="Ej: 7.5" min="0" max="12" step="0.5">
                        </div>
                        
                        <div class="input-group">
                            <label for="manual-heart-rate">❤️ Frecuencia Cardíaca (BPM):</label>
                            <input type="number" id="manual-heart-rate" placeholder="Ej: 72" min="40" max="200">
                        </div>
                        
                        <div class="input-group">
                            <label for="manual-weight">⚖️ Peso (kg):</label>
                            <input type="number" id="manual-weight" placeholder="Ej: 70" min="30" max="200" step="0.1">
                        </div>
                        
                        <div class="input-group">
                            <label for="manual-water">💧 Vasos de Agua:</label>
                            <input type="number" id="manual-water" placeholder="Ej: 8" min="0" max="20">
                        </div>
                    </div>
                </div>
                
                <div class="input-actions">
                    <button class="glass-button glass-button-primary" onclick="window.saveManualHealthData()">
                        💾 Guardar Datos
                    </button>
                    <button class="glass-button glass-button-secondary" onclick="this.closest('.manual-health-input-modal').remove()">
                        Cancelar
                    </button>
                </div>
                
                <div class="input-note">
                    <p>💡 <strong>Consejo:</strong> Puedes encontrar estos datos en la app Salud de tu iPhone o en tu dispositivo wearable.</p>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
};

// Guardar datos de salud manuales
window.saveManualHealthData = function() {
    const steps = parseInt(document.getElementById('manual-steps').value) || 0;
    const sleep = parseFloat(document.getElementById('manual-sleep').value) || 0;
    const heartRate = parseInt(document.getElementById('manual-heart-rate').value) || 0;
    const weight = parseFloat(document.getElementById('manual-weight').value) || 0;
    const water = parseInt(document.getElementById('manual-water').value) || 0;
    
    if (steps === 0 && sleep === 0 && heartRate === 0 && weight === 0 && water === 0) {
        alert('⚠️ Por favor, introduce al menos un dato de salud.');
        return;
    }
    
    // Guardar datos en localStorage
    const healthData = {
        steps: steps,
        sleepHours: sleep,
        heartRate: heartRate,
        weight: weight,
        waterGlasses: water,
        caloriesBurned: Math.floor(steps * 0.04 + (sleep * 50)), // Estimación básica
        activeMinutes: Math.floor(steps / 100), // Estimación básica
        distance: Math.round((steps * 0.7) / 1000 * 10) / 10, // Estimación básica
        timestamp: new Date().toISOString(),
        source: 'manual'
    };
    
    localStorage.setItem('entrenoapp_health_data', JSON.stringify(healthData));
    
    // Actualizar health manager si existe
    if (window.healthManager) {
        window.healthManager.healthData = healthData;
        window.healthManager.saveHealthData();
        window.healthManager.checkAchievements();
    }
    
    // Cerrar modal
    document.querySelector('.manual-health-input-modal').remove();
    
    // Mostrar confirmación
    alert('✅ Datos de salud guardados correctamente!');
    
    // Recargar dashboard
    window.initDashboard();
};

// Solicitar permisos de salud
window.requestHealthPermissions = function() {
    if (window.healthManager) {
        window.healthManager.requestPermissions().then(() => {
            // Mostrar modal con instrucciones específicas
            showHealthSetupInstructions();
            document.querySelector('.health-setup-modal').remove();
        });
    }
};

// Mostrar instrucciones específicas para activar permisos
function showHealthSetupInstructions() {
    const modal = document.createElement('div');
    modal.className = 'health-instructions-modal';
    modal.innerHTML = `
        <div class="modal-content glass-effect">
            <div class="modal-header">
                <h2>📱 Activar Permisos de Salud</h2>
                <button class="modal-close" onclick="this.closest('.health-instructions-modal').remove()">×</button>
            </div>
            <div class="modal-body">
                <div class="instructions-content">
                    <div class="instruction-step">
                        <div class="step-number">1</div>
                        <div class="step-content">
                            <h3>📱 Abrir Configuración del iPhone</h3>
                            <p>Ve a <strong>Configuración</strong> en tu iPhone</p>
                        </div>
                    </div>
                    
                    <div class="instruction-step">
                        <div class="step-number">2</div>
                        <div class="step-content">
                            <h3>🔒 Ir a Privacidad y Seguridad</h3>
                            <p>Busca y toca <strong>Privacidad y Seguridad</strong></p>
                        </div>
                    </div>
                    
                    <div class="instruction-step">
                        <div class="step-number">3</div>
                        <div class="step-content">
                            <h3>🏥 Seleccionar Salud</h3>
                            <p>Toca <strong>Salud</strong> en la lista</p>
                        </div>
                    </div>
                    
                    <div class="instruction-step">
                        <div class="step-number">4</div>
                        <div class="step-content">
                            <h3>🔍 Buscar EntrenoApp</h3>
                            <p>Busca <strong>EntrenoApp</strong> en la lista de apps</p>
                        </div>
                    </div>
                    
                    <div class="instruction-step">
                        <div class="step-number">5</div>
                        <div class="step-content">
                            <h3>✅ Activar Permisos</h3>
                            <p>Activa los permisos para: Pasos, Frecuencia Cardíaca, Sueño, Actividad</p>
                        </div>
                    </div>
                </div>
                
                <div class="instructions-actions">
                    <button class="glass-button glass-button-primary" onclick="window.openHealthSettings()">
                        🔗 Abrir Configuración
                    </button>
                    <button class="glass-button glass-button-secondary" onclick="this.closest('.health-instructions-modal').remove()">
                        Entendido
                    </button>
                </div>
                
                <div class="instructions-note">
                    <p>💡 <strong>Importante:</strong> Para que EntrenoApp aparezca en la lista:</p>
                    <ul>
                        <li>✅ Debe estar instalada como PWA desde Safari</li>
                        <li>✅ Debe haberse usado al menos una vez</li>
                        <li>✅ Debe estar en modo standalone (no en Safari)</li>
                        <li>🔄 Si no aparece, reinicia el iPhone y vuelve a intentar</li>
                    </ul>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Abrir configuración de salud
window.openHealthSettings = function() {
    // Intentar abrir configuración de salud en iOS
    const iOSHealthURL = 'x-apple-health://';
    const settingsURL = 'App-prefs:HEALTH';
    
    // Intentar abrir configuración de salud
    try {
        window.location.href = settingsURL;
    } catch (error) {
        try {
            window.location.href = iOSHealthURL;
        } catch (error2) {
            // Fallback: mostrar instrucciones manuales
            alert('No se puede abrir automáticamente. Ve manualmente a:\nConfiguración > Privacidad y Seguridad > Salud');
        }
    }
};

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

// ==========================================
// MEJORAS FASE 1: Calendario Mensual con Heat Map
// ==========================================

function renderMonthlyCalendar() {
    const plan = dashboardState.activePlan;
    if (!plan) return '';
    
    // Obtener datos de entrenamientos del mes actual
    const workoutData = getMonthlyWorkoutData();
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay(); // 0 = Domingo
    
    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    
    return `
        <div class="monthly-calendar-card glass-card mb-lg">
            <div class="calendar-header">
                <h3 class="calendar-title">🔥 Calendario de Actividad</h3>
                <div class="calendar-month">${monthNames[today.getMonth()]} ${today.getFullYear()}</div>
            </div>
            
            <div class="heat-map-legend mb-md">
                <span class="legend-label">Menos</span>
                <div class="legend-colors">
                    <div class="legend-color" style="background: #ebedf0;"></div>
                    <div class="legend-color" style="background: #c6e48b;"></div>
                    <div class="legend-color" style="background: #7bc96f;"></div>
                    <div class="legend-color" style="background: #239a3b;"></div>
                    <div class="legend-color" style="background: #196127;"></div>
                </div>
                <span class="legend-label">Más</span>
            </div>
            
            <div class="monthly-calendar-grid">
                ${['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(day => 
                    `<div class="calendar-weekday">${day}</div>`
                ).join('')}
                
                ${Array(startDayOfWeek === 0 ? 6 : (startDayOfWeek === 1 ? 0 : startDayOfWeek - 1)).fill(null).map(() => 
                    `<div class="calendar-day empty"></div>`
                ).join('')}
                
                ${Array.from({ length: daysInMonth }, (_, i) => {
                    const day = i + 1;
                    const date = new Date(today.getFullYear(), today.getMonth(), day);
                    const dateKey = date.toISOString().split('T')[0];
                    const workoutCount = workoutData[dateKey] || 0;
                    const isToday = day === today.getDate();
                    const isPast = date < today && date.toDateString() !== today.toDateString();
                    
                    // Calcular intensidad del color (0-4)
                    let intensity = 0;
                    if (workoutCount > 0) {
                        intensity = Math.min(4, workoutCount); // Máximo 4 entrenamientos = verde muy oscuro
                    }
                    
                    const intensityColors = [
                        '#ebedf0', // Gris claro (sin entrenamientos)
                        '#c6e48b', // Verde muy claro (1 entrenamiento)
                        '#7bc96f', // Verde claro (2 entrenamientos)
                        '#239a3b', // Verde medio (3 entrenamientos)
                        '#196127'  // Verde oscuro (4+ entrenamientos)
                    ];
                    
                    return `
                        <div class="calendar-day ${isToday ? 'today' : ''} ${isPast && workoutCount > 0 ? 'completed' : ''}" 
                             style="background-color: ${intensityColors[intensity]};"
                             title="${day} ${monthNames[today.getMonth()]}: ${workoutCount} ${workoutCount === 1 ? 'entrenamiento' : 'entrenamientos'}">
                            <span class="day-number">${day}</span>
                            ${workoutCount > 0 ? `<span class="workout-count">${workoutCount}</span>` : ''}
                        </div>
                    `;
                }).join('')}
            </div>
            
            <div class="calendar-stats mt-md">
                <div class="calendar-stat">
                    <span class="stat-value">${Object.values(workoutData).reduce((a, b) => a + b, 0)}</span>
                    <span class="stat-label">Entrenamientos este mes</span>
                </div>
                <div class="calendar-stat">
                    <span class="stat-value">${getCurrentStreak(workoutData)}</span>
                    <span class="stat-label">Racha actual</span>
                </div>
                <div class="calendar-stat">
                    <span class="stat-value">${getBestStreak(workoutData)}</span>
                    <span class="stat-label">Mejor racha</span>
                </div>
            </div>
        </div>
    `;
}

// Obtener datos de entrenamientos del mes actual desde localStorage
function getMonthlyWorkoutData() {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    const workoutData = {};
    const completedDays = JSON.parse(localStorage.getItem('entrenoapp_completed_days') || '[]');
    const completedWorkouts = JSON.parse(localStorage.getItem('entrenoapp_completed_workouts') || '[]');
    
    // Contar entrenamientos por día
    completedWorkouts.forEach(workout => {
        if (workout.date) {
            const workoutDate = new Date(workout.date);
            if (workoutDate >= firstDay && workoutDate <= lastDay) {
                const dateKey = workoutDate.toISOString().split('T')[0];
                workoutData[dateKey] = (workoutData[dateKey] || 0) + 1;
            }
        }
    });
    
    // También contar días completados
    completedDays.forEach(dateKey => {
        const date = new Date(dateKey);
        if (date >= firstDay && date <= lastDay) {
            if (!workoutData[dateKey]) {
                workoutData[dateKey] = 1;
            }
        }
    });
    
    return workoutData;
}

// Calcular racha actual
function getCurrentStreak(workoutData) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let streak = 0;
    let currentDate = new Date(today);
    
    // Contar hacia atrás desde hoy
    while (true) {
        const dateKey = currentDate.toISOString().split('T')[0];
        if (workoutData[dateKey] && workoutData[dateKey] > 0) {
            streak++;
            currentDate.setDate(currentDate.getDate() - 1);
        } else {
            break;
        }
    }
    
    return streak;
}

// Calcular mejor racha del mes
function getBestStreak(workoutData) {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    let bestStreak = 0;
    let currentStreak = 0;
    
    for (let day = 1; day <= lastDay.getDate(); day++) {
        const date = new Date(today.getFullYear(), today.getMonth(), day);
        const dateKey = date.toISOString().split('T')[0];
        
        if (workoutData[dateKey] && workoutData[dateKey] > 0) {
            currentStreak++;
            bestStreak = Math.max(bestStreak, currentStreak);
        } else {
            currentStreak = 0;
        }
    }
    
    return bestStreak;
}

// ==========================================
// MEJORAS FASE 1: Gráficos de Progreso
// ==========================================

function renderProgressCharts() {
    const plan = dashboardState.activePlan;
    if (!plan) return '';
    
    // Obtener datos de las últimas 4 semanas
    const weeklyData = getWeeklyProgressData(4);
    
    return `
        <div class="progress-charts-card glass-card mb-lg">
            <div class="charts-header">
                <h3 class="charts-title">📈 Tu Progreso</h3>
                <div class="charts-subtitle">Últimas 4 semanas</div>
            </div>
            
            <div class="charts-container">
                <div class="chart-wrapper">
                    <canvas id="weeklyWorkoutsChart" class="progress-chart"></canvas>
                </div>
                
                <div class="chart-wrapper">
                    <canvas id="weeklyMinutesChart" class="progress-chart"></canvas>
                </div>
            </div>
        </div>
    `;
}

// Obtener datos de progreso semanal
function getWeeklyProgressData(weeksCount = 4) {
    const today = new Date();
    const data = {
        weeks: [],
        workouts: [],
        minutes: []
    };
    
    // Obtener entrenamientos completados
    const completedWorkouts = JSON.parse(localStorage.getItem('entrenoapp_completed_workouts') || '[]');
    
    // Calcular datos para cada semana
    for (let i = weeksCount - 1; i >= 0; i--) {
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - (today.getDay() - 1) - (i * 7));
        weekStart.setHours(0, 0, 0, 0);
        
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);
        
        const weekWorkouts = completedWorkouts.filter(workout => {
            if (!workout.date) return false;
            const workoutDate = new Date(workout.date);
            return workoutDate >= weekStart && workoutDate <= weekEnd;
        });
        
        const weekMinutes = weekWorkouts.reduce((total, workout) => {
            return total + (workout.duration || 0);
        }, 0);
        
        data.weeks.push(`Sem ${weeksCount - i}`);
        data.workouts.push(weekWorkouts.length);
        data.minutes.push(weekMinutes);
    }
    
    return data;
}

// Inicializar gráficos después de renderizar el dashboard
function initProgressCharts() {
    if (typeof Chart === 'undefined') {
        console.warn('Chart.js no está cargado');
        return;
    }
    
    const weeklyData = getWeeklyProgressData(4);
    
    // Gráfico de entrenamientos semanales
    const workoutsCtx = document.getElementById('weeklyWorkoutsChart');
    if (workoutsCtx) {
        new Chart(workoutsCtx, {
            type: 'line',
            data: {
                labels: weeklyData.weeks,
                datasets: [{
                    label: 'Entrenamientos',
                    data: weeklyData.workouts,
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointRadius: 5,
                    pointHoverRadius: 7,
                    pointBackgroundColor: '#667eea',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    title: {
                        display: true,
                        text: 'Entrenamientos por Semana',
                        color: '#667eea',
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }
    
    // Gráfico de minutos semanales
    const minutesCtx = document.getElementById('weeklyMinutesChart');
    if (minutesCtx) {
        new Chart(minutesCtx, {
            type: 'bar',
            data: {
                labels: weeklyData.weeks,
                datasets: [{
                    label: 'Minutos',
                    data: weeklyData.minutes,
                    backgroundColor: 'rgba(102, 126, 234, 0.6)',
                    borderColor: '#667eea',
                    borderWidth: 2,
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    title: {
                        display: true,
                        text: 'Minutos de Entrenamiento',
                        color: '#667eea',
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }
}

// ==========================================
// MEJORAS FASE 1: Comparación Semana Anterior
// ==========================================

function renderWeekComparison() {
    const plan = dashboardState.activePlan;
    if (!plan) return '';
    
    const comparison = getWeekComparison();
    
    if (!comparison.hasData) {
        return ''; // No mostrar si no hay datos suficientes
    }
    
    const workoutsDiff = comparison.current.workouts - comparison.previous.workouts;
    const minutesDiff = comparison.current.minutes - comparison.previous.minutes;
    const workoutsPercent = comparison.previous.workouts > 0 
        ? Math.round((workoutsDiff / comparison.previous.workouts) * 100)
        : comparison.current.workouts > 0 ? 100 : 0;
    const minutesPercent = comparison.previous.minutes > 0
        ? Math.round((minutesDiff / comparison.previous.minutes) * 100)
        : comparison.current.minutes > 0 ? 100 : 0;
    
    return `
        <div class="week-comparison-card glass-card mb-lg">
            <div class="comparison-header">
                <h3 class="comparison-title">⚖️ Comparación Semanal</h3>
                <div class="comparison-subtitle">Esta semana vs Semana anterior</div>
            </div>
            
            <div class="comparison-grid">
                <div class="comparison-item">
                    <div class="comparison-label">Entrenamientos</div>
                    <div class="comparison-values">
                        <div class="comparison-value">
                            <span class="value-current">${comparison.current.workouts}</span>
                            <span class="value-label">Esta semana</span>
                        </div>
                        <div class="comparison-arrow ${workoutsDiff >= 0 ? 'positive' : 'negative'}">
                            ${workoutsDiff >= 0 ? '↑' : '↓'}
                        </div>
                        <div class="comparison-value">
                            <span class="value-previous">${comparison.previous.workouts}</span>
                            <span class="value-label">Semana anterior</span>
                        </div>
                    </div>
                    <div class="comparison-change ${workoutsDiff >= 0 ? 'positive' : 'negative'}">
                        ${workoutsDiff >= 0 ? '+' : ''}${workoutsDiff} entrenamientos
                        ${workoutsPercent !== 0 ? `(${workoutsDiff >= 0 ? '+' : ''}${workoutsPercent}%)` : ''}
                    </div>
                </div>
                
                <div class="comparison-item">
                    <div class="comparison-label">Minutos de entrenamiento</div>
                    <div class="comparison-values">
                        <div class="comparison-value">
                            <span class="value-current">${comparison.current.minutes}</span>
                            <span class="value-label">Esta semana</span>
                        </div>
                        <div class="comparison-arrow ${minutesDiff >= 0 ? 'positive' : 'negative'}">
                            ${minutesDiff >= 0 ? '↑' : '↓'}
                        </div>
                        <div class="comparison-value">
                            <span class="value-previous">${comparison.previous.minutes}</span>
                            <span class="value-label">Semana anterior</span>
                        </div>
                    </div>
                    <div class="comparison-change ${minutesDiff >= 0 ? 'positive' : 'negative'}">
                        ${minutesDiff >= 0 ? '+' : ''}${minutesDiff} minutos
                        ${minutesPercent !== 0 ? `(${minutesDiff >= 0 ? '+' : ''}${minutesPercent}%)` : ''}
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Obtener datos de comparación entre semana actual y anterior
function getWeekComparison() {
    const today = new Date();
    
    // Semana actual (lunes a domingo)
    const currentWeekStart = new Date(today);
    currentWeekStart.setDate(today.getDate() - (today.getDay() - 1));
    currentWeekStart.setHours(0, 0, 0, 0);
    
    const currentWeekEnd = new Date(currentWeekStart);
    currentWeekEnd.setDate(currentWeekStart.getDate() + 6);
    currentWeekEnd.setHours(23, 59, 59, 999);
    
    // Semana anterior
    const previousWeekStart = new Date(currentWeekStart);
    previousWeekStart.setDate(currentWeekStart.getDate() - 7);
    
    const previousWeekEnd = new Date(previousWeekStart);
    previousWeekEnd.setDate(previousWeekStart.getDate() + 6);
    previousWeekEnd.setHours(23, 59, 59, 999);
    
    const completedWorkouts = JSON.parse(localStorage.getItem('entrenoapp_completed_workouts') || '[]');
    
    const currentWorkouts = completedWorkouts.filter(workout => {
        if (!workout.date) return false;
        const workoutDate = new Date(workout.date);
        return workoutDate >= currentWeekStart && workoutDate <= currentWeekEnd;
    });
    
    const previousWorkouts = completedWorkouts.filter(workout => {
        if (!workout.date) return false;
        const workoutDate = new Date(workout.date);
        return workoutDate >= previousWeekStart && workoutDate <= previousWeekEnd;
    });
    
    const currentMinutes = currentWorkouts.reduce((total, workout) => total + (workout.duration || 0), 0);
    const previousMinutes = previousWorkouts.reduce((total, workout) => total + (workout.duration || 0), 0);
    
    return {
        hasData: currentWorkouts.length > 0 || previousWorkouts.length > 0,
        current: {
            workouts: currentWorkouts.length,
            minutes: currentMinutes
        },
        previous: {
            workouts: previousWorkouts.length,
            minutes: previousMinutes
        }
    };
}


