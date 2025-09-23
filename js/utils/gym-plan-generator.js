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
        'short': 0.8,    // 30-45 min - Reducido de 0.7 a 0.8 para mantener más ejercicios
        'medium': 1,     // 45-60 min
        'long': 1.3      // 60+ min
    };
    
    const multiplier = timeMultipliers[sessionTime] || 1;
    
    routine.sessions.forEach(session => {
        const targetExercises = Math.round(session.exercises.length * multiplier);
        
        // Asegurar mínimo de 4 ejercicios por sesión
        const minExercises = 4;
        const finalTargetExercises = Math.max(targetExercises, minExercises);
        
        if (multiplier < 1) {
            // Reducir ejercicios priorizando compuestos, pero mantener mínimo
            if (session.exercises.length > finalTargetExercises) {
                session.exercises = session.exercises
                    .sort((a, b) => getExercisePriority(a.exerciseId) - getExercisePriority(b.exerciseId))
                    .slice(0, finalTargetExercises);
            }
        } else if (multiplier > 1) {
            // Agregar ejercicios de aislamiento
            const additionalExercises = generateAdditionalExercises(session, finalTargetExercises - session.exercises.length);
            session.exercises.push(...additionalExercises);
        }
        
        // Verificar que tenemos al menos 4 ejercicios
        if (session.exercises.length < minExercises) {
            const needed = minExercises - session.exercises.length;
            const additionalExercises = generateAdditionalExercises(session, needed);
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
        if (session.exercises.length < 4) {
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
    if (count <= 0) return [];
    
    console.log(`➕ Generando ${count} ejercicios adicionales para ${session.name}`);
    
    const additionalExercises = [];
    const sessionName = session.name.toLowerCase();
    
    // Obtener ejercicios ya usados en la sesión para evitar repeticiones
    const usedExerciseIds = session.exercises.map(ex => ex.exerciseId);
    console.log(`📋 Ejercicios ya usados:`, usedExerciseIds);
    
    // Ejercicios específicos por tipo de sesión con mayor variedad
    if (sessionName.includes('push') || sessionName.includes('pecho')) {
        const pushExercises = [
            { exerciseId: 'wide_push_ups', sets: 3, reps: '8-15', rest: 90 },
            { exerciseId: 'diamond_push_ups', sets: 3, reps: '5-10', rest: 90 },
            { exerciseId: 'incline_push_ups', sets: 3, reps: '10-20', rest: 90 },
            { exerciseId: 'decline_push_ups', sets: 3, reps: '8-12', rest: 90 },
            { exerciseId: 'pike_push_ups', sets: 3, reps: '5-10', rest: 90 },
            { exerciseId: 'archer_push_ups', sets: 3, reps: '3-8', rest: 120 },
            { exerciseId: 'hindu_push_ups', sets: 3, reps: '5-10', rest: 90 },
            { exerciseId: 'tricep_dips', sets: 3, reps: '8-15', rest: 90 },
            { exerciseId: 'dumbbell_flyes', sets: 3, reps: '10-15', rest: 90 },
            { exerciseId: 'incline_dumbbell_press', sets: 3, reps: '8-12', rest: 120 }
        ];
        additionalExercises.push(...pushExercises.filter(ex => !usedExerciseIds.includes(ex.exerciseId)));
        
    } else if (sessionName.includes('pull') || sessionName.includes('espalda')) {
        const pullExercises = [
            { exerciseId: 'pull_ups', sets: 3, reps: '6-12', rest: 150 },
            { exerciseId: 'inverted_rows', sets: 3, reps: '8-15', rest: 90 },
            { exerciseId: 'superman', sets: 3, reps: '10-15', rest: 60 },
            { exerciseId: 'bird_dog', sets: 3, reps: '10-15', rest: 60 },
            { exerciseId: 'cat_cow', sets: 3, reps: '10-15', rest: 30 },
            { exerciseId: 'reverse_hyperextensions', sets: 3, reps: '10-15', rest: 60 },
            { exerciseId: 'barbell_row', sets: 3, reps: '8-12', rest: 120 },
            { exerciseId: 'lat_pulldown', sets: 3, reps: '8-12', rest: 120 },
            { exerciseId: 'face_pulls', sets: 3, reps: '12-18', rest: 90 },
            { exerciseId: 'barbell_curl', sets: 3, reps: '8-12', rest: 90 }
        ];
        additionalExercises.push(...pullExercises.filter(ex => !usedExerciseIds.includes(ex.exerciseId)));
        
    } else if (sessionName.includes('leg') || sessionName.includes('pierna')) {
        const legExercises = [
            { exerciseId: 'bodyweight_squats', sets: 3, reps: '10-15', rest: 120 },
            { exerciseId: 'jump_squats', sets: 3, reps: '8-12', rest: 120 },
            { exerciseId: 'pistol_squats', sets: 3, reps: '3-8', rest: 150 },
            { exerciseId: 'bulgarian_split_squats', sets: 3, reps: '8-12', rest: 120 },
            { exerciseId: 'wall_sits', sets: 3, reps: '30-60s', rest: 90 },
            { exerciseId: 'lunges', sets: 3, reps: '10-15', rest: 120 },
            { exerciseId: 'lateral_lunges', sets: 3, reps: '8-12', rest: 90 },
            { exerciseId: 'reverse_lunges', sets: 3, reps: '8-12', rest: 90 },
            { exerciseId: 'walking_lunges', sets: 3, reps: '10-15', rest: 120 },
            { exerciseId: 'step_ups', sets: 3, reps: '10-15', rest: 90 },
            { exerciseId: 'single_leg_glute_bridges', sets: 3, reps: '8-12', rest: 90 },
            { exerciseId: 'glute_bridges', sets: 3, reps: '12-20', rest: 90 },
            { exerciseId: 'calf_raises', sets: 3, reps: '15-25', rest: 60 },
            { exerciseId: 'single_leg_calf_raises', sets: 3, reps: '10-15', rest: 60 },
            { exerciseId: 'mountain_climbers', sets: 3, reps: '20-30', rest: 60 },
            { exerciseId: 'burpees', sets: 3, reps: '5-10', rest: 120 }
        ];
        additionalExercises.push(...legExercises.filter(ex => !usedExerciseIds.includes(ex.exerciseId)));
        
    } else if (sessionName.includes('shoulder') || sessionName.includes('hombro')) {
        const shoulderExercises = [
            { exerciseId: 'reverse_plank', sets: 3, reps: '20-30s', rest: 60 },
            { exerciseId: 'handstand_push_ups', sets: 3, reps: '3-8', rest: 180 },
            { exerciseId: 'wall_walks', sets: 3, reps: '5-10', rest: 120 },
            { exerciseId: 'shoulder_taps', sets: 3, reps: '20-30', rest: 60 },
            { exerciseId: 'arm_circles', sets: 3, reps: '20-30', rest: 30 },
            { exerciseId: 'overhead_press', sets: 3, reps: '8-12', rest: 120 },
            { exerciseId: 'lateral_raises', sets: 3, reps: '12-18', rest: 90 },
            { exerciseId: 'front_raises', sets: 3, reps: '12-18', rest: 90 },
            { exerciseId: 'rear_delt_flyes', sets: 3, reps: '12-18', rest: 90 }
        ];
        additionalExercises.push(...shoulderExercises.filter(ex => !usedExerciseIds.includes(ex.exerciseId)));
        
    } else if (sessionName.includes('core') || sessionName.includes('abdominal')) {
        const coreExercises = [
            { exerciseId: 'plank', sets: 3, reps: '30-60s', rest: 60 },
            { exerciseId: 'side_plank', sets: 3, reps: '20-30s', rest: 60 },
            { exerciseId: 'russian_twists', sets: 3, reps: '20-30', rest: 60 },
            { exerciseId: 'bicycle_crunches', sets: 3, reps: '20-30', rest: 60 },
            { exerciseId: 'mountain_climbers', sets: 3, reps: '20-30', rest: 60 },
            { exerciseId: 'dead_bug', sets: 3, reps: '10-15', rest: 60 },
            { exerciseId: 'hollow_body', sets: 3, reps: '20-30s', rest: 90 },
            { exerciseId: 'leg_raises', sets: 3, reps: '10-15', rest: 60 },
            { exerciseId: 'flutter_kicks', sets: 3, reps: '20-30', rest: 60 },
            { exerciseId: 'bear_crawl', sets: 3, reps: '10-15', rest: 90 }
        ];
        additionalExercises.push(...coreExercises.filter(ex => !usedExerciseIds.includes(ex.exerciseId)));
        
    } else {
        // Para sesiones full body o no específicas - mezcla de todo
        const fullBodyExercises = [
            { exerciseId: 'push_ups', sets: 3, reps: '8-15', rest: 90 },
            { exerciseId: 'bodyweight_squats', sets: 3, reps: '10-15', rest: 120 },
            { exerciseId: 'lunges', sets: 3, reps: '10-15', rest: 120 },
            { exerciseId: 'plank', sets: 3, reps: '30-60s', rest: 60 },
            { exerciseId: 'mountain_climbers', sets: 3, reps: '20-30', rest: 60 },
            { exerciseId: 'burpees', sets: 3, reps: '5-10', rest: 120 },
            { exerciseId: 'jumping_jacks', sets: 3, reps: '20-30', rest: 60 },
            { exerciseId: 'pull_ups', sets: 3, reps: '6-12', rest: 150 },
            { exerciseId: 'inverted_rows', sets: 3, reps: '8-15', rest: 90 },
            { exerciseId: 'glute_bridges', sets: 3, reps: '12-20', rest: 90 },
            { exerciseId: 'calf_raises', sets: 3, reps: '15-25', rest: 60 },
            { exerciseId: 'russian_twists', sets: 3, reps: '20-30', rest: 60 },
            { exerciseId: 'bicycle_crunches', sets: 3, reps: '20-30', rest: 60 },
            { exerciseId: 'dead_bug', sets: 3, reps: '10-15', rest: 60 }
        ];
        additionalExercises.push(...fullBodyExercises.filter(ex => !usedExerciseIds.includes(ex.exerciseId)));
    }
    
    // Si no hay suficientes ejercicios específicos, agregar ejercicios básicos
    const basicExercises = [
        { exerciseId: 'push_ups', sets: 3, reps: '8-15', rest: 90 },
        { exerciseId: 'bodyweight_squats', sets: 3, reps: '10-15', rest: 120 },
        { exerciseId: 'lunges', sets: 3, reps: '10-15', rest: 120 },
        { exerciseId: 'plank', sets: 3, reps: '30-60s', rest: 60 },
        { exerciseId: 'mountain_climbers', sets: 3, reps: '20-30', rest: 60 },
        { exerciseId: 'burpees', sets: 3, reps: '5-10', rest: 120 },
        { exerciseId: 'jumping_jacks', sets: 3, reps: '20-30', rest: 60 },
        { exerciseId: 'glute_bridges', sets: 3, reps: '12-20', rest: 90 },
        { exerciseId: 'calf_raises', sets: 3, reps: '15-25', rest: 60 }
    ];
    
    while (additionalExercises.length < count) {
        const basicExercise = basicExercises[additionalExercises.length % basicExercises.length];
        if (!usedExerciseIds.includes(basicExercise.exerciseId)) {
            additionalExercises.push({ ...basicExercise });
        }
    }
    
    // Mezclar para mayor variabilidad
    const shuffled = additionalExercises.sort(() => Math.random() - 0.5);
    const result = shuffled.slice(0, count);
    
    console.log(`✅ Generados ${result.length} ejercicios adicionales:`, result.map(ex => ex.exerciseId));
    return result;
}

function findAlternativeExercises(session, availableEquipment) {
    console.log(`🔄 Buscando ejercicios alternativos para ${session.name}`);
    console.log(`🏋️‍♂️ Equipo disponible:`, availableEquipment);
    
    const alternatives = [];
    
    // Ejercicios básicos de peso corporal que siempre funcionan
    const bodyweightExercises = [
        // PECHO
        { exerciseId: 'push_ups', sets: 3, reps: '8-15', rest: 90 },
        { exerciseId: 'wide_push_ups', sets: 3, reps: '8-15', rest: 90 },
        { exerciseId: 'diamond_push_ups', sets: 3, reps: '5-10', rest: 90 },
        { exerciseId: 'incline_push_ups', sets: 3, reps: '10-20', rest: 90 },
        { exerciseId: 'pike_push_ups', sets: 3, reps: '5-10', rest: 90 },
        
        // ESPALDA
        { exerciseId: 'pull_ups', sets: 3, reps: '6-12', rest: 150 },
        { exerciseId: 'inverted_rows', sets: 3, reps: '8-15', rest: 90 },
        { exerciseId: 'superman', sets: 3, reps: '10-15', rest: 60 },
        { exerciseId: 'bird_dog', sets: 3, reps: '10-15', rest: 60 },
        
        // HOMBROS
        { exerciseId: 'reverse_plank', sets: 3, reps: '20-30s', rest: 60 },
        { exerciseId: 'shoulder_taps', sets: 3, reps: '20-30', rest: 60 },
        { exerciseId: 'arm_circles', sets: 3, reps: '20-30', rest: 30 },
        
        // PIERNAS
        { exerciseId: 'bodyweight_squats', sets: 3, reps: '10-15', rest: 120 },
        { exerciseId: 'jump_squats', sets: 3, reps: '8-12', rest: 120 },
        { exerciseId: 'lunges', sets: 3, reps: '10-15', rest: 120 },
        { exerciseId: 'bulgarian_split_squats', sets: 3, reps: '8-12', rest: 120 },
        { exerciseId: 'wall_sits', sets: 3, reps: '30-60s', rest: 90 },
        { exerciseId: 'step_ups', sets: 3, reps: '10-15', rest: 90 },
        { exerciseId: 'lateral_lunges', sets: 3, reps: '8-12', rest: 90 },
        { exerciseId: 'reverse_lunges', sets: 3, reps: '8-12', rest: 90 },
        { exerciseId: 'walking_lunges', sets: 3, reps: '10-15', rest: 120 },
        { exerciseId: 'single_leg_glute_bridges', sets: 3, reps: '8-12', rest: 90 },
        { exerciseId: 'single_leg_calf_raises', sets: 3, reps: '10-15', rest: 60 },
        
        // CORE
        { exerciseId: 'plank', sets: 3, reps: '30-60s', rest: 60 },
        { exerciseId: 'side_plank', sets: 3, reps: '20-30s', rest: 60 },
        { exerciseId: 'russian_twists', sets: 3, reps: '20-30', rest: 60 },
        { exerciseId: 'bicycle_crunches', sets: 3, reps: '20-30', rest: 60 },
        { exerciseId: 'mountain_climbers', sets: 3, reps: '20-30', rest: 60 },
        { exerciseId: 'dead_bug', sets: 3, reps: '10-15', rest: 60 },
        { exerciseId: 'leg_raises', sets: 3, reps: '10-15', rest: 60 },
        { exerciseId: 'flutter_kicks', sets: 3, reps: '20-30', rest: 60 },
        { exerciseId: 'bear_crawl', sets: 3, reps: '10-15', rest: 90 },
        
        // CARDIO/FUNCIONAL
        { exerciseId: 'burpees', sets: 3, reps: '5-10', rest: 120 },
        { exerciseId: 'jumping_jacks', sets: 3, reps: '20-30', rest: 60 }
    ];
    
    // Si solo tenemos peso corporal, usar ejercicios específicos por grupo muscular
    if (availableEquipment.includes('bodyweight') && availableEquipment.length === 1) {
        console.log('💪 Solo peso corporal disponible, usando ejercicios específicos');
        
        if (session.name.includes('Push') || session.name.includes('Pecho')) {
            alternatives.push(
                { exerciseId: 'push_ups', sets: 4, reps: '8-15', rest: 90 },
                { exerciseId: 'wide_push_ups', sets: 3, reps: '8-15', rest: 90 },
                { exerciseId: 'diamond_push_ups', sets: 3, reps: '5-10', rest: 90 },
                { exerciseId: 'incline_push_ups', sets: 3, reps: '10-20', rest: 90 },
                { exerciseId: 'pike_push_ups', sets: 3, reps: '5-10', rest: 90 },
                { exerciseId: 'tricep_dips', sets: 3, reps: '8-15', rest: 90 }
            );
        } else if (session.name.includes('Pull') || session.name.includes('Espalda')) {
            alternatives.push(
                { exerciseId: 'pull_ups', sets: 4, reps: '6-12', rest: 150 },
                { exerciseId: 'inverted_rows', sets: 3, reps: '8-15', rest: 90 },
                { exerciseId: 'superman', sets: 3, reps: '10-15', rest: 60 },
                { exerciseId: 'bird_dog', sets: 3, reps: '10-15', rest: 60 },
                { exerciseId: 'cat_cow', sets: 3, reps: '10-15', rest: 30 },
                { exerciseId: 'reverse_hyperextensions', sets: 3, reps: '10-15', rest: 60 }
            );
        } else if (session.name.includes('Legs') || session.name.includes('Piernas')) {
            alternatives.push(
                { exerciseId: 'bodyweight_squats', sets: 4, reps: '10-15', rest: 120 },
                { exerciseId: 'jump_squats', sets: 3, reps: '8-12', rest: 120 },
                { exerciseId: 'lunges', sets: 3, reps: '10-15', rest: 120 },
                { exerciseId: 'bulgarian_split_squats', sets: 3, reps: '8-12', rest: 120 },
                { exerciseId: 'wall_sits', sets: 3, reps: '30-60s', rest: 90 },
                { exerciseId: 'lateral_lunges', sets: 3, reps: '8-12', rest: 90 },
                { exerciseId: 'single_leg_glute_bridges', sets: 3, reps: '8-12', rest: 90 },
                { exerciseId: 'calf_raises', sets: 3, reps: '15-25', rest: 60 }
            );
        } else if (session.name.includes('Shoulder') || session.name.includes('Hombro')) {
            alternatives.push(
                { exerciseId: 'reverse_plank', sets: 3, reps: '20-30s', rest: 60 },
                { exerciseId: 'shoulder_taps', sets: 3, reps: '20-30', rest: 60 },
                { exerciseId: 'arm_circles', sets: 3, reps: '20-30', rest: 30 },
                { exerciseId: 'wall_walks', sets: 3, reps: '5-10', rest: 120 }
            );
        } else if (session.name.includes('Core') || session.name.includes('Abdominal')) {
            alternatives.push(
                { exerciseId: 'plank', sets: 3, reps: '30-60s', rest: 60 },
                { exerciseId: 'side_plank', sets: 3, reps: '20-30s', rest: 60 },
                { exerciseId: 'russian_twists', sets: 3, reps: '20-30', rest: 60 },
                { exerciseId: 'bicycle_crunches', sets: 3, reps: '20-30', rest: 60 },
                { exerciseId: 'mountain_climbers', sets: 3, reps: '20-30', rest: 60 },
                { exerciseId: 'dead_bug', sets: 3, reps: '10-15', rest: 60 },
                { exerciseId: 'leg_raises', sets: 3, reps: '10-15', rest: 60 },
                { exerciseId: 'flutter_kicks', sets: 3, reps: '20-30', rest: 60 }
            );
        } else {
            // Para sesiones full body o no específicas
            alternatives.push(
                { exerciseId: 'push_ups', sets: 3, reps: '8-15', rest: 90 },
                { exerciseId: 'bodyweight_squats', sets: 3, reps: '10-15', rest: 120 },
                { exerciseId: 'lunges', sets: 3, reps: '10-15', rest: 120 },
                { exerciseId: 'plank', sets: 3, reps: '30-60s', rest: 60 },
                { exerciseId: 'mountain_climbers', sets: 3, reps: '20-30', rest: 60 },
                { exerciseId: 'burpees', sets: 3, reps: '5-10', rest: 120 },
                { exerciseId: 'pull_ups', sets: 3, reps: '6-12', rest: 150 },
                { exerciseId: 'inverted_rows', sets: 3, reps: '8-15', rest: 90 }
            );
        }
    } else {
        // Si tenemos más equipo, usar ejercicios específicos según el tipo de sesión
        if (session.name.includes('Push') || session.name.includes('Pecho')) {
            if (availableEquipment.includes('barbell') && availableEquipment.includes('bench')) {
                alternatives.push({ exerciseId: 'bench_press', sets: 4, reps: '8-12', rest: 180 });
            }
            if (availableEquipment.includes('dumbbells')) {
                alternatives.push({ exerciseId: 'incline_dumbbell_press', sets: 3, reps: '8-12', rest: 150 });
                alternatives.push({ exerciseId: 'dumbbell_flyes', sets: 3, reps: '10-15', rest: 90 });
            }
            if (availableEquipment.includes('parallel_bars')) {
                alternatives.push({ exerciseId: 'dips', sets: 3, reps: '8-15', rest: 120 });
            }
            // Siempre agregar ejercicios de peso corporal
            alternatives.push(
                { exerciseId: 'push_ups', sets: 3, reps: '8-15', rest: 90 },
                { exerciseId: 'wide_push_ups', sets: 3, reps: '8-15', rest: 90 },
                { exerciseId: 'diamond_push_ups', sets: 3, reps: '5-10', rest: 90 }
            );
        }
        
        if (session.name.includes('Pull') || session.name.includes('Espalda')) {
            if (availableEquipment.includes('barbell')) {
                alternatives.push({ exerciseId: 'deadlift', sets: 4, reps: '5-8', rest: 180 });
                alternatives.push({ exerciseId: 'barbell_row', sets: 3, reps: '8-12', rest: 150 });
            }
            if (availableEquipment.includes('pull_up_bar')) {
                alternatives.push({ exerciseId: 'pull_ups', sets: 4, reps: '6-12', rest: 150 });
            }
            if (availableEquipment.includes('cable_machine')) {
                alternatives.push({ exerciseId: 'lat_pulldown', sets: 3, reps: '8-12', rest: 120 });
                alternatives.push({ exerciseId: 'face_pulls', sets: 3, reps: '12-18', rest: 90 });
            }
            // Siempre agregar ejercicios de peso corporal
            alternatives.push(
                { exerciseId: 'inverted_rows', sets: 3, reps: '8-15', rest: 90 },
                { exerciseId: 'superman', sets: 3, reps: '10-15', rest: 60 },
                { exerciseId: 'bird_dog', sets: 3, reps: '10-15', rest: 60 }
            );
        }
        
        if (session.name.includes('Legs') || session.name.includes('Piernas')) {
            if (availableEquipment.includes('barbell')) {
                alternatives.push({ exerciseId: 'squats', sets: 4, reps: '8-12', rest: 180 });
            }
            if (availableEquipment.includes('leg_press_machine')) {
                alternatives.push({ exerciseId: 'leg_press', sets: 3, reps: '12-20', rest: 150 });
            }
            if (availableEquipment.includes('leg_curl_machine')) {
                alternatives.push({ exerciseId: 'leg_curls', sets: 3, reps: '10-15', rest: 120 });
            }
            // Siempre agregar ejercicios de peso corporal
            alternatives.push(
                { exerciseId: 'bodyweight_squats', sets: 3, reps: '10-15', rest: 120 },
                { exerciseId: 'lunges', sets: 3, reps: '10-15', rest: 120 },
                { exerciseId: 'bulgarian_split_squats', sets: 3, reps: '8-12', rest: 120 },
                { exerciseId: 'wall_sits', sets: 3, reps: '30-60s', rest: 90 },
                { exerciseId: 'lateral_lunges', sets: 3, reps: '8-12', rest: 90 }
            );
        }
        
        if (session.name.includes('Shoulder') || session.name.includes('Hombro')) {
            if (availableEquipment.includes('barbell')) {
                alternatives.push({ exerciseId: 'overhead_press', sets: 3, reps: '8-12', rest: 120 });
            }
            if (availableEquipment.includes('dumbbells')) {
                alternatives.push({ exerciseId: 'lateral_raises', sets: 3, reps: '12-18', rest: 90 });
                alternatives.push({ exerciseId: 'front_raises', sets: 3, reps: '12-18', rest: 90 });
            }
            // Siempre agregar ejercicios de peso corporal
            alternatives.push(
                { exerciseId: 'reverse_plank', sets: 3, reps: '20-30s', rest: 60 },
                { exerciseId: 'shoulder_taps', sets: 3, reps: '20-30', rest: 60 },
                { exerciseId: 'arm_circles', sets: 3, reps: '20-30', rest: 30 }
            );
        }
        
        if (session.name.includes('Core') || session.name.includes('Abdominal')) {
            // Siempre agregar ejercicios de peso corporal
            alternatives.push(
                { exerciseId: 'plank', sets: 3, reps: '30-60s', rest: 60 },
                { exerciseId: 'side_plank', sets: 3, reps: '20-30s', rest: 60 },
                { exerciseId: 'russian_twists', sets: 3, reps: '20-30', rest: 60 },
                { exerciseId: 'bicycle_crunches', sets: 3, reps: '20-30', rest: 60 },
                { exerciseId: 'mountain_climbers', sets: 3, reps: '20-30', rest: 60 },
                { exerciseId: 'dead_bug', sets: 3, reps: '10-15', rest: 60 },
                { exerciseId: 'leg_raises', sets: 3, reps: '10-15', rest: 60 }
            );
        }
        
        // Agregar ejercicios básicos si no hay específicos
        if (alternatives.length === 0) {
            alternatives.push(...bodyweightExercises.slice(0, 4));
        }
    }
    
    // Asegurar que tenemos al menos 4 ejercicios
    while (alternatives.length < 4) {
        const basicExercise = bodyweightExercises[alternatives.length % bodyweightExercises.length];
        alternatives.push({ ...basicExercise });
    }
    
    console.log(`✅ Agregados ${alternatives.length} ejercicios alternativos`);
    return alternatives.slice(0, 6); // Máximo 6 ejercicios
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
    
    // Verificar si ya hay un workout para hoy
    const todayKey = `gym_workout_${plan.type}_${new Date().toDateString()}`;
    const storedWorkout = localStorage.getItem(todayKey);
    
    if (storedWorkout) {
        console.log('📅 Workout de gimnasio del día ya existe, usando el guardado:', JSON.parse(storedWorkout).title);
        return JSON.parse(storedWorkout);
    }
    
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
    
    // Calcular duración basada en la selección del usuario
    const targetDuration = plan.sessionDuration || 45; // Duración de la sesión en minutos
    const actualDuration = Math.min(targetDuration, 90); // Máximo 90 minutos
    
    // Ajustar número de ejercicios según duración
    const adjustedExercises = adjustExercisesForDuration(todaysSession.exercises, actualDuration);
    
    // Generar workout del día
    const workout = {
        type: 'gym',
        title: `${todaysSession.name} - Semana ${currentWeek}`,
        description: `${adjustedExercises.length} ejercicios • ${actualDuration} min`,
        icon: '🏋️‍♂️',
        session: todaysSession,
        muscleGroups: getMuscleGroupsFromSession(todaysSession),
        estimatedDuration: actualDuration,
        exercises: adjustedExercises.map(ex => {
            const exerciseData = findExerciseById(ex.exerciseId);
            return {
                ...ex,
                name: exerciseData?.name || ex.exerciseId,
                exerciseData: exerciseData
            };
        })
    };
    
    // Guardar el workout para hoy
    localStorage.setItem(todayKey, JSON.stringify(workout));
    console.log('💾 Workout de gimnasio del día guardado:', workout.title);
    
    return workout;
}

function adjustExercisesForDuration(exercises, targetDuration) {
    if (!exercises || exercises.length === 0) return [];
    
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
    
    const availableTime = targetDuration - warmupTime - cooldownTime;
    
    // Calcular número óptimo de ejercicios y series
    let bestConfig = { exercises: 3, sets: 3 };
    let bestTime = 0;
    
    // Probar diferentes combinaciones
    for (let ex = 2; ex <= Math.min(6, exercises.length); ex++) {
        for (let sets = 2; sets <= 5; sets++) {
            const totalTime = ex * (sets * (timePerSet + restBetweenSets) + restBetweenExercises) - restBetweenExercises;
            
            if (totalTime <= availableTime && totalTime > bestTime) {
                bestTime = totalTime;
                bestConfig = { exercises: ex, sets: sets };
            }
        }
    }
    
    // Ajustar para que no exceda el tiempo disponible
    const adjustedExercises = exercises.slice(0, bestConfig.exercises).map(exercise => ({
        ...exercise,
        sets: bestConfig.sets
    }));
    
    console.log(`⏱️ Ajustando entrenamiento para ${targetDuration}min:`, {
        ejercicios: bestConfig.exercises,
        series: bestConfig.sets,
        tiempoCalculado: bestTime + warmupTime + cooldownTime,
        tiempoDisponible: targetDuration
    });
    
    return adjustedExercises;
}

function estimateWorkoutDuration(session) {
    if (!session || !session.exercises) return 45;
    
    const warmupTime = 5; // minutos
    const cooldownTime = 5; // minutos
    const timePerSet = 1; // minuto por serie
    const restBetweenSets = 0.75; // 45 segundos
    const restBetweenExercises = 2; // 2 minutos
    
    let totalTime = warmupTime + cooldownTime;
    
    session.exercises.forEach((exercise, index) => {
        // Tiempo por ejercicio: series * (tiempo ejecución + descanso entre series)
        const exerciseTime = exercise.sets * (timePerSet + restBetweenSets);
        totalTime += exerciseTime;
        
        // Agregar descanso entre ejercicios (excepto el último)
        if (index < session.exercises.length - 1) {
            totalTime += restBetweenExercises;
        }
    });
    
    return Math.round(totalTime);
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
