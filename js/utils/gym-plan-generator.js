// Generador inteligente de planes de gimnasio para EntrenoApp
// Basado en ciencia del entrenamiento y respuestas del onboarding

import { GYM_EXERCISES, GYM_ROUTINES, LEVEL_ADJUSTMENTS, TRAINING_GOALS } from '../data/gym-exercises.js';

// Hacer disponible globalmente para el onboarding
window.generateGymPlanAdvanced = generateGymPlan;
window.generateTodaysGymWorkout = generateTodaysGymWorkout;

// ===================================
// GENERADOR PRINCIPAL
// ===================================

export function generateGymPlan(onboardingData) {
    console.log('🏋️‍♂️ Generando plan de gimnasio personalizado...', onboardingData);
    
    // Extraer datos del onboarding
    const {
        experience = 'intermediate',
        frequency = 'medium',
        session_time = 'medium',
        equipment = [],
        goals = ['hypertrophy']
    } = onboardingData;
    
    // Determinar frecuencia semanal
    const weeklyFrequency = mapFrequencyToDays(frequency);
    
    // Seleccionar rutina base
    const baseRoutine = selectBaseRoutine(weeklyFrequency);
    
    // Adaptar por nivel de experiencia
    const adaptedRoutine = adaptRoutineForLevel(baseRoutine, experience);
    
    // Ajustar por tiempo disponible
    const timeAdjustedRoutine = adjustForSessionTime(adaptedRoutine, session_time);
    
    // Filtrar por equipo disponible
    const equipmentFilteredRoutine = filterByEquipment(timeAdjustedRoutine, equipment);
    
    // Generar plan completo
    const gymPlan = {
        type: 'gym',
        name: generatePlanName(weeklyFrequency, experience, goals[0]),
        description: generatePlanDescription(weeklyFrequency, experience),
        duration: calculatePlanDuration(experience),
        frequency: weeklyFrequency,
        currentWeek: 1,
        currentSession: 1,
        status: 'active',
        startDate: new Date().toISOString(),
        focus: mapGoalsToFocus(goals[0]),
        equipment: equipment,
        
        // Metadatos para tracking
        metadata: {
            planType: 'gym',
            experience: experience,
            sessionTime: session_time,
            frequency: frequency,
            equipment: equipment,
            goals: goals,
            generatedAt: new Date().toISOString(),
            basedOnOnboarding: true
        },
        
        // Rutina personalizada
        routine: equipmentFilteredRoutine,
        
        // Progresión automática
        progressTracking: {
            totalWorkouts: 0,
            totalVolume: 0,
            totalTime: 0,
            personalRecords: {},
            strengthProgression: {},
            lastWorkout: null
        },
        
        // Configuración de progresión
        progressionRules: generateProgressionRules(experience, goals[0])
    };
    
    console.log('✅ Plan de gimnasio generado:', gymPlan);
    return gymPlan;
}

// ===================================
// MAPEO DE FRECUENCIA
// ===================================

function mapFrequencyToDays(frequency) {
    const frequencyMap = {
        'low': 2,      // 2 días por semana
        'medium': 3,   // 3-4 días por semana  
        'high': 5      // 5+ días por semana
    };
    
    return frequencyMap[frequency] || 3;
}

// ===================================
// SELECCIÓN DE RUTINA BASE
// ===================================

function selectBaseRoutine(weeklyFrequency) {
    if (weeklyFrequency <= 2) {
        return JSON.parse(JSON.stringify(GYM_ROUTINES['2_days']));
    } else if (weeklyFrequency === 3) {
        return JSON.parse(JSON.stringify(GYM_ROUTINES['3_days']));
    } else if (weeklyFrequency === 4) {
        return JSON.parse(JSON.stringify(GYM_ROUTINES['4_days']));
    } else {
        return JSON.parse(JSON.stringify(GYM_ROUTINES['5_days']));
    }
}

// ===================================
// ADAPTACIÓN POR NIVEL
// ===================================

function adaptRoutineForLevel(routine, experience) {
    const adjustments = LEVEL_ADJUSTMENTS[experience];
    if (!adjustments) return routine;
    
    // Adaptar cada sesión
    routine.sessions.forEach(session => {
        session.exercises.forEach(exercise => {
            // Ajustar series
            exercise.sets = Math.round(exercise.sets * adjustments.setsMultiplier);
            
            // Ajustar descanso
            exercise.rest = Math.round(exercise.rest * adjustments.restMultiplier);
            
            // Ajustar repeticiones si es numérico
            if (typeof exercise.reps === 'string' && exercise.reps.includes('-')) {
                const [min, max] = exercise.reps.split('-').map(Number);
                const newMin = Math.max(1, min + adjustments.repsAdjustment);
                const newMax = Math.max(newMin + 2, max + adjustments.repsAdjustment);
                exercise.reps = `${newMin}-${newMax}`;
            }
        });
    });
    
    // Filtrar ejercicios complejos para principiantes
    if (experience === 'beginner') {
        routine.sessions.forEach(session => {
            session.exercises = session.exercises.filter(exercise => {
                const exerciseData = findExerciseById(exercise.exerciseId);
                return exerciseData && exerciseData.difficulty !== 'advanced';
            });
        });
    }
    
    return routine;
}

// ===================================
// AJUSTE POR TIEMPO DE SESIÓN
// ===================================

function adjustForSessionTime(routine, sessionTime) {
    const timeMultipliers = {
        'short': 0.7,    // 30-45 min
        'medium': 1,     // 45-60 min
        'long': 1.3      // 60+ min
    };
    
    const multiplier = timeMultipliers[sessionTime] || 1;
    
    routine.sessions.forEach(session => {
        const targetExercises = Math.round(session.exercises.length * multiplier);
        
        if (multiplier < 1) {
            // Reducir ejercicios priorizando compuestos
            session.exercises = session.exercises
                .sort((a, b) => getExercisePriority(a.exerciseId) - getExercisePriority(b.exerciseId))
                .slice(0, targetExercises);
        } else if (multiplier > 1) {
            // Agregar ejercicios de aislamiento
            const additionalExercises = generateAdditionalExercises(session, targetExercises - session.exercises.length);
            session.exercises.push(...additionalExercises);
        }
    });
    
    return routine;
}

// ===================================
// FILTRADO POR EQUIPO
// ===================================

function filterByEquipment(routine, availableEquipment) {
    if (!availableEquipment || availableEquipment.length === 0) {
        return routine; // Sin restricciones
    }
    
    // Mapear equipo del onboarding a equipos específicos
    const equipmentMap = {
        'gym_access': ['barbell', 'bench', 'dumbbells', 'incline_bench', 'parallel_bars', 'pull_up_bar', 
                      'cable_machine', 'leg_press_machine', 'leg_curl_machine', 'calf_raise_machine'],
        'home_gym': ['dumbbells', 'bench', 'pull_up_bar'],
        'basic_equipment': ['dumbbells'],
        'bodyweight_only': ['bodyweight'],
        'outdoor_space': ['bodyweight']
    };
    
    // Expandir equipos disponibles
    let expandedEquipment = [];
    availableEquipment.forEach(equip => {
        if (equipmentMap[equip]) {
            expandedEquipment.push(...equipmentMap[equip]);
        } else {
            expandedEquipment.push(equip);
        }
    });
    
    // Siempre incluir bodyweight
    expandedEquipment.push('bodyweight');
    
    console.log('🏋️‍♂️ Filtrado por equipo:', { 
        original: availableEquipment, 
        expanded: expandedEquipment 
    });
    
    routine.sessions.forEach(session => {
        const originalCount = session.exercises.length;
        
        session.exercises = session.exercises.filter(exercise => {
            const exerciseData = findExerciseById(exercise.exerciseId);
            if (!exerciseData) return false;
            
            // Verificar si el equipo del ejercicio está disponible
            const isAvailable = exerciseData.equipment.some(equip => 
                expandedEquipment.includes(equip)
            );
            
            return isAvailable;
        });
        
        console.log(`📋 Sesión ${session.name}: ${originalCount} → ${session.exercises.length} ejercicios`);
        
        // Si quedan muy pocos ejercicios, agregar alternativos
        if (session.exercises.length < 3) {
            const alternatives = findAlternativeExercises(session, expandedEquipment);
            session.exercises.push(...alternatives);
        }
    });
    
    return routine;
}

// ===================================
// FUNCIONES AUXILIARES
// ===================================

function findExerciseById(exerciseId) {
    for (const muscleGroup in GYM_EXERCISES) {
        const exercise = GYM_EXERCISES[muscleGroup].find(ex => ex.id === exerciseId);
        if (exercise) return exercise;
    }
    return null;
}

function getExercisePriority(exerciseId) {
    const exerciseData = findExerciseById(exerciseId);
    if (!exerciseData) return 100;
    
    // Ejercicios compuestos tienen mayor prioridad
    const compoundExercises = ['squats', 'deadlift', 'bench_press', 'pull_ups', 'overhead_press'];
    if (compoundExercises.includes(exerciseId)) return 1;
    
    // Ejercicios básicos tienen prioridad media
    if (exerciseData.difficulty === 'beginner') return 2;
    
    // Ejercicios de aislamiento tienen menor prioridad
    return 3;
}

function generateAdditionalExercises(session, count) {
    // Implementar lógica para agregar ejercicios adicionales
    return [];
}

function findAlternativeExercises(session, availableEquipment) {
    console.log(`🔄 Buscando ejercicios alternativos para ${session.name}`);
    
    const alternatives = [];
    
    // Obtener ejercicios básicos que funcionen con el equipo disponible
    const basicExercises = [
        { exerciseId: 'push_ups', sets: 3, reps: '8-15', rest: 90 },
        { exerciseId: 'squats', sets: 3, reps: '10-15', rest: 120 },
        { exerciseId: 'lunges', sets: 3, reps: '10-15', rest: 120 }
    ];
    
    // Agregar ejercicios específicos según el tipo de sesión
    if (session.name.includes('Push') || session.name.includes('Pecho')) {
        if (availableEquipment.includes('barbell') && availableEquipment.includes('bench')) {
            alternatives.push({ exerciseId: 'bench_press', sets: 4, reps: '8-12', rest: 180 });
        }
        if (availableEquipment.includes('dumbbells')) {
            alternatives.push({ exerciseId: 'incline_dumbbell_press', sets: 3, reps: '8-12', rest: 150 });
        }
        alternatives.push({ exerciseId: 'push_ups', sets: 3, reps: '8-15', rest: 90 });
    }
    
    if (session.name.includes('Pull') || session.name.includes('Espalda')) {
        if (availableEquipment.includes('barbell')) {
            alternatives.push({ exerciseId: 'deadlift', sets: 4, reps: '5-8', rest: 180 });
            alternatives.push({ exerciseId: 'barbell_row', sets: 3, reps: '8-12', rest: 150 });
        }
        if (availableEquipment.includes('pull_up_bar')) {
            alternatives.push({ exerciseId: 'pull_ups', sets: 4, reps: '6-12', rest: 150 });
        }
    }
    
    if (session.name.includes('Legs') || session.name.includes('Piernas')) {
        if (availableEquipment.includes('barbell')) {
            alternatives.push({ exerciseId: 'squats', sets: 4, reps: '8-12', rest: 180 });
        }
        alternatives.push({ exerciseId: 'lunges', sets: 3, reps: '10-15', rest: 120 });
    }
    
    // Agregar ejercicios básicos si no hay específicos
    if (alternatives.length === 0) {
        alternatives.push(...basicExercises);
    }
    
    console.log(`✅ Agregados ${alternatives.length} ejercicios alternativos`);
    return alternatives.slice(0, 5); // Máximo 5 ejercicios
}

function generatePlanName(frequency, experience, goal) {
    const frequencyNames = {
        2: 'Full Body 2x',
        3: 'Push/Pull/Legs',
        4: 'Upper/Lower',
        5: 'Bro Split'
    };
    
    const levelNames = {
        'beginner': 'Principiante',
        'intermediate': 'Intermedio',
        'advanced': 'Avanzado'
    };
    
    const goalNames = {
        'strength': 'Fuerza',
        'hypertrophy': 'Masa Muscular',
        'endurance': 'Resistencia',
        'toning': 'Tonificación'
    };
    
    const routine = frequencyNames[frequency] || 'Personalizado';
    const level = levelNames[experience] || 'Intermedio';
    const goalName = goalNames[goal] || 'Desarrollo';
    
    return `${routine} ${level} - ${goalName}`;
}

function generatePlanDescription(frequency, experience) {
    const descriptions = {
        2: 'Rutina de cuerpo completo óptima para principiantes o personas con poco tiempo. Ejercicios compuestos para máxima eficiencia.',
        3: 'División clásica Push/Pull/Legs perfecta para desarrollo equilibrado. Ideal para nivel intermedio.',
        4: 'Rutina Upper/Lower que permite mayor volumen de entrenamiento. Excelente para progreso constante.',
        5: 'División especializada por grupos musculares. Máximo volumen para atletas avanzados.'
    };
    
    return descriptions[frequency] || 'Plan personalizado adaptado a tus necesidades específicas.';
}

function calculatePlanDuration(experience) {
    const durations = {
        'beginner': 12,      // 12 semanas
        'intermediate': 16,   // 16 semanas
        'advanced': 20       // 20 semanas
    };
    
    return durations[experience] || 16;
}

function mapGoalsToFocus(goal) {
    const focusMap = {
        'strength': 'fuerza',
        'hypertrophy': 'hipertrofia',
        'endurance': 'resistencia',
        'toning': 'tonificación'
    };
    
    return focusMap[goal] || 'hipertrofia';
}

function generateProgressionRules(experience, goal) {
    const baseRules = {
        weeklyIncrease: 2.5,  // kg por semana para ejercicios básicos
        volumeIncrease: 5,    // % aumento volumen por semana
        deloadWeek: 4,        // cada 4 semanas
        maxFailures: 2        // fallos consecutivos antes de deload
    };
    
    // Ajustar por experiencia
    if (experience === 'beginner') {
        baseRules.weeklyIncrease = 5;
        baseRules.volumeIncrease = 10;
    } else if (experience === 'advanced') {
        baseRules.weeklyIncrease = 1.25;
        baseRules.volumeIncrease = 2.5;
    }
    
    // Ajustar por objetivo
    if (goal === 'strength') {
        baseRules.weeklyIncrease *= 1.5;
        baseRules.volumeIncrease *= 0.5;
    } else if (goal === 'endurance') {
        baseRules.weeklyIncrease *= 0.5;
        baseRules.volumeIncrease *= 1.5;
    }
    
    return baseRules;
}

// ===================================
// GENERADOR DE WORKOUT DIARIO
// ===================================

export function generateTodaysGymWorkout(plan) {
    if (!plan || plan.type !== 'gym') return null;
    
    const currentWeek = plan.currentWeek || 1;
    const routine = plan.routine;
    
    if (!routine || !routine.sessions) return null;
    
    // Calcular qué sesión corresponde hoy basado en días transcurridos
    const startDate = new Date(plan.startDate);
    const today = new Date();
    const daysSinceStart = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
    
    // Para planes de gimnasio, rotar entre sesiones automáticamente
    // Cada día de entrenamiento es una sesión diferente
    const sessionIndex = daysSinceStart % routine.sessions.length;
    const todaysSession = routine.sessions[sessionIndex];
    
    console.log('🏋️‍♂️ Calculando sesión de hoy:', {
        daysSinceStart,
        sessionIndex,
        sessionName: todaysSession?.name,
        totalSessions: routine.sessions.length
    });
    
    if (!todaysSession) return null;
    
    // Generar workout del día
    const workout = {
        type: 'gym',
        title: `${todaysSession.name} - Semana ${currentWeek}`,
        description: `${todaysSession.exercises.length} ejercicios • ${estimateWorkoutDuration(todaysSession)} min`,
        icon: '🏋️‍♂️',
        session: todaysSession,
        muscleGroups: getMuscleGroupsFromSession(todaysSession),
        estimatedDuration: estimateWorkoutDuration(todaysSession),
        exercises: todaysSession.exercises.map(ex => ({
            ...ex,
            exerciseData: findExerciseById(ex.exerciseId)
        }))
    };
    
    return workout;
}

function estimateWorkoutDuration(session) {
    if (!session || !session.exercises) return 45;
    
    let totalTime = 0;
    
    session.exercises.forEach(exercise => {
        // Tiempo por serie (incluyendo ejecución + descanso)
        const timePerSet = 60 + (exercise.rest || 120); // 60s ejecución + descanso
        totalTime += exercise.sets * timePerSet;
    });
    
    // Agregar tiempo de calentamiento y cooldown
    totalTime += 600; // 10 minutos
    
    return Math.round(totalTime / 60); // Convertir a minutos
}

function getMuscleGroupsFromSession(session) {
    if (!session || !session.exercises) return [];
    
    const muscleGroups = new Set();
    
    session.exercises.forEach(exercise => {
        const exerciseData = findExerciseById(exercise.exerciseId);
        if (exerciseData && exerciseData.primaryMuscles) {
            exerciseData.primaryMuscles.forEach(muscle => muscleGroups.add(muscle));
        }
    });
    
    return Array.from(muscleGroups);
}
