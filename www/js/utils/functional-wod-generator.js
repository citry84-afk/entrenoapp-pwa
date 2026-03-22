// Generador inteligente de WODs funcionales
// Utiliza la base de datos expandida de Hero WODs y WODs de competencia

import { functionalWods } from '../data/functional-wods.js';

// ===================================
// GENERADOR DE WODS FUNCIONALES
// ===================================

export function generateFunctionalWod(plan, week, userLevel = 'intermedio') {
    if (!plan || plan.type !== 'functional') return null;
    
    const currentWeek = week || plan.currentWeek || 1;
    const difficulty = plan.difficulty || userLevel;
    
    console.log('⚡ Generando WOD funcional:', { 
        week: currentWeek, 
        difficulty,
        planType: plan.type 
    });
    
    // Verificar si ya hay un WOD para hoy
    const todayKey = `functional_wod_${plan.type}_${new Date().toDateString()}`;
    const storedWorkout = localStorage.getItem(todayKey);
    
    if (storedWorkout) {
        console.log('📅 WOD del día ya existe, usando el guardado:', JSON.parse(storedWorkout).title);
        return JSON.parse(storedWorkout);
    }
    
    // Seleccionar tipo de WOD basado en la semana
    const wodType = selectWodType(currentWeek, plan.frequency);
    const selectedWod = selectWodByType(wodType, difficulty);
    
    if (!selectedWod) {
        console.warn('⚠️ No se encontró WOD apropiado, usando fallback');
        return generateFallbackWod(difficulty);
    }
    
    // Aplicar escalado según nivel del usuario
    const scaledWod = applyScaling(selectedWod, difficulty, plan.equipment || []);
    
    // Generar workout del día
    const workout = {
        type: 'functional',
        title: `${scaledWod.name} - Semana ${currentWeek}`,
        description: scaledWod.description,
        icon: '⚡',
        wod: scaledWod,
        difficulty: difficulty,
        timeNeeded: scaledWod.timeNeeded,
        equipment: scaledWod.equipment,
        structure: scaledWod.workout.structure,
        movements: scaledWod.workout.movements,
        notes: scaledWod.workout.notes,
        scaling: scaledWod.scaling || null,
        week: currentWeek,
        totalWeeks: plan.duration || 12
    };
    
    // Guardar el workout para hoy
    localStorage.setItem(todayKey, JSON.stringify(workout));
    console.log('💾 WOD del día guardado:', workout.title);
    
    console.log('✅ WOD funcional generado:', workout.title);
    return workout;
}

// ===================================
// SELECCIÓN DE TIPO DE WOD
// ===================================

function selectWodType(week, frequency) {
    // Rotar entre tipos de WOD según la semana
    const wodTypes = ['hero', 'benchmark', 'competition', 'beginner'];
    const typeIndex = (week - 1) % wodTypes.length;
    return wodTypes[typeIndex];
}

function selectWodByType(type, difficulty) {
    const wods = functionalWods[type === 'hero' ? 'heroes' : 
                                type === 'benchmark' ? 'heroes' : 
                                type === 'competition' ? 'competition' :
                                type === 'beginner' ? 'beginner' :
                                'heroes'];
    
    if (!wods || wods.length === 0) return null;
    
    // Filtrar por dificultad
    const difficultyMap = {
        'principiante': ['principiante'],
        'intermedio': ['intermedio', 'principiante'],
        'avanzado': ['avanzado', 'intermedio', 'principiante'],
        'elite': ['avanzado', 'intermedio', 'principiante']
    };
    
    const allowedDifficulties = difficultyMap[difficulty] || ['intermedio'];
    const filteredWods = wods.filter(wod => 
        allowedDifficulties.includes(wod.difficulty)
    );
    
    if (filteredWods.length === 0) {
        // Si no hay WODs para la dificultad, usar cualquier WOD
        return wods[Math.floor(Math.random() * wods.length)];
    }
    
    // Seleccionar WOD aleatorio de los filtrados
    return filteredWods[Math.floor(Math.random() * filteredWods.length)];
}

// ===================================
// APLICAR ESCALADO
// ===================================

function applyScaling(wod, userLevel, availableEquipment) {
    const scalingLevels = functionalWods.scaling.levels;
    const level = scalingLevels[userLevel] || scalingLevels['intermedio'];
    
    if (!level) return wod;
    
    // Crear copia del WOD para modificar
    const scaledWod = JSON.parse(JSON.stringify(wod));
    
    // Aplicar modificaciones de ejercicios
    if (level.modifications) {
        scaledWod.workout.movements = scaledWod.workout.movements.map(movement => {
            const exercise = movement.exercise;
            if (level.modifications[exercise]) {
                return {
                    ...movement,
                    exercise: level.modifications[exercise],
                    notes: [...(movement.notes || []), `Escalado para ${level.name}`]
                };
            }
            return movement;
        });
    }
    
    // Ajustar pesos
    if (level.weightReduction && level.weightReduction !== 1.0) {
        scaledWod.workout.movements = scaledWod.workout.movements.map(movement => {
            if (movement.weight) {
                const weights = movement.weight.split('/');
                const scaledWeights = weights.map(weight => {
                    const numWeight = parseFloat(weight.replace(/[^\d.]/g, ''));
                    if (!isNaN(numWeight)) {
                        const scaledWeight = Math.round(numWeight * level.weightReduction);
                        return `${scaledWeight}kg`;
                    }
                    return weight;
                });
                return {
                    ...movement,
                    weight: scaledWeights.join('/')
                };
            }
            return movement;
        });
    }
    
    // Ajustar tiempo
    if (level.timeExtension && level.timeExtension !== 1.0) {
        const timeMatch = scaledWod.timeNeeded.match(/(\d+)-(\d+)/);
        if (timeMatch) {
            const minTime = parseInt(timeMatch[1]);
            const maxTime = parseInt(timeMatch[2]);
            const scaledMinTime = Math.round(minTime * level.timeExtension);
            const scaledMaxTime = Math.round(maxTime * level.timeExtension);
            scaledWod.timeNeeded = `${scaledMinTime}-${scaledMaxTime} min`;
        }
    }
    
    // Filtrar por equipo disponible
    if (availableEquipment && availableEquipment.length > 0) {
        const equipmentMap = functionalWods.scaling.equipment;
        const hasRequiredEquipment = scaledWod.equipment.every(required => 
            availableEquipment.includes(required) || 
            availableEquipment.some(available => 
                equipmentMap[required] && equipmentMap[required].includes(available)
            )
        );
        
        if (!hasRequiredEquipment) {
            // Si no tiene el equipo, usar alternativas
            scaledWod.workout.movements = scaledWod.workout.movements.map(movement => {
                const exercise = movement.exercise;
                const alternative = findEquipmentAlternative(exercise, availableEquipment);
                if (alternative) {
                    return {
                        ...movement,
                        exercise: alternative,
                        notes: [...(movement.notes || []), 'Adaptado al equipo disponible']
                    };
                }
                return movement;
            });
        }
    }
    
    return scaledWod;
}

// ===================================
// ALTERNATIVAS DE EQUIPAMIENTO
// ===================================

function findEquipmentAlternative(exercise, availableEquipment) {
    const alternatives = {
        'Pull-ups': 'Ring Rows',
        'Bar Muscle-ups': 'Ring Rows + Dips',
        'Handstand Push-ups': 'Pike Push-ups',
        'Wall Ball Shots': 'Dumbbell Thrusters',
        'Box Jumps': 'Step-ups',
        'Kettlebell Swings': 'Dumbbell Swings',
        'Double-unders': 'Single-unders',
        'Toes-to-bars': 'Knee Raises'
    };
    
    return alternatives[exercise] || null;
}

// ===================================
// WOD DE FALLBACK
// ===================================

function generateFallbackWod(difficulty) {
    const fallbackWods = [
        {
            id: 'fallback_1',
            name: 'Cindy',
            type: 'benchmark',
            description: 'AMRAP clásico con peso corporal',
            difficulty: 'principiante',
            timeNeeded: '20 min',
            equipment: ['barra_dominadas'],
            workout: {
                structure: 'AMRAP 20 minutos',
                movements: [
                    { exercise: 'Pull-ups', reps: '5' },
                    { exercise: 'Push-ups', reps: '10' },
                    { exercise: 'Air Squats', reps: '15' }
                ],
                notes: ['Tantas rondas como sea posible', 'Ritmo sostenible']
            }
        },
        {
            id: 'fallback_2',
            name: 'Fran',
            type: 'benchmark',
            description: 'El benchmark más famoso del mundo',
            difficulty: 'intermedio',
            timeNeeded: '3-8 min',
            equipment: ['barra_olimpica', 'barra_dominadas'],
            workout: {
                structure: '21-15-9 reps for time',
                movements: [
                    { exercise: 'Thrusters', reps: '21-15-9', weight: '43kg/30kg' },
                    { exercise: 'Pull-ups', reps: '21-15-9' }
                ],
                notes: ['Tan rápido como sea posible', 'Sub-3 min = élite']
            }
        }
    ];
    
    return fallbackWods[Math.floor(Math.random() * fallbackWods.length)];
}

// ===================================
// GENERADOR DE PLAN FUNCIONAL
// ===================================

export function generateFunctionalPlan(config) {
    const { experience, frequency, sessionTime, equipment = [] } = config;
    
    const plan = {
        type: 'functional',
        name: `Plan de Entrenamiento Funcional ${getExperienceLabel(experience)}`,
        description: 'Plan personalizado de entrenamiento funcional con Hero WODs y benchmarks',
        duration: 12,
        frequency: mapFrequencyToNumber(frequency),
        currentWeek: 1,
        currentSession: 1,
        status: 'active',
        startDate: new Date().toISOString(),
        difficulty: experience,
        equipment: equipment,
        metadata: {
            planType: 'functional',
            experience: experience,
            sessionTime: sessionTime,
            frequency: frequency,
            equipment: equipment,
            generatedAt: new Date().toISOString(),
            basedOnOnboarding: true
        },
        progressTracking: {
            totalWorkouts: 0,
            totalTime: 0,
            personalRecords: {},
            wodsCompleted: [],
            averageScore: 0
        }
    };
    
    console.log('⚡ Plan funcional generado:', plan.name);
    return plan;
}

// ===================================
// FUNCIONES AUXILIARES
// ===================================

function getExperienceLabel(experience) {
    const labels = {
        'principiante': 'Principiante',
        'intermedio': 'Intermedio', 
        'avanzado': 'Avanzado',
        'elite': 'Élite'
    };
    return labels[experience] || 'Intermedio';
}

function mapFrequencyToNumber(frequency) {
    const mapping = {
        'low': 2,
        'medium': 3,
        'high': 4
    };
    return mapping[frequency] || 3;
}

// ===================================
// EXPORTAR FUNCIONES GLOBALES
// ===================================

// Hacer disponibles globalmente para el dashboard
window.generateFunctionalWod = generateFunctionalWod;
window.generateFunctionalPlan = generateFunctionalPlan;

console.log('⚡ Generador de WODs funcionales cargado');
