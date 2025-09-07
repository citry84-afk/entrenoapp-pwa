// Planes de carrera de EntrenoApp
// Desde nivel 0 hasta maratón

export const runningPlans = {
    // PLAN: DE 0 A 5K (Para principiantes absolutos)
    couch_to_5k: {
        id: 'couch_to_5k',
        name: 'De 0 a 5K',
        description: 'Plan para principiantes que nunca han corrido',
        level: 'principiante',
        duration: 8, // semanas
        daysPerWeek: 3,
        goal: 'Correr 5K sin parar',
        requirements: [
            'No se requiere experiencia previa',
            'Capacidad para caminar 30 minutos',
            'Ganas de empezar a correr'
        ],
        weeks: [
            {
                week: 1,
                description: 'Introducción al running con intervalos de caminar/correr',
                sessions: [
                    {
                        day: 1,
                        type: 'intervals',
                        warmup: { activity: 'Caminar', duration: 5, intensity: 'fácil' },
                        main: {
                            activity: 'Alternar',
                            intervals: [
                                { activity: 'Correr', duration: 1, intensity: 'fácil' },
                                { activity: 'Caminar', duration: 2, intensity: 'recuperación' }
                            ],
                            rounds: 8,
                            totalTime: 24
                        },
                        cooldown: { activity: 'Caminar', duration: 5, intensity: 'fácil' },
                        totalDuration: 34,
                        tips: [
                            'Mantén un ritmo conversacional al correr',
                            'No te preocupes por la velocidad',
                            'Enfócate en completar los intervalos'
                        ]
                    },
                    {
                        day: 2,
                        type: 'intervals',
                        warmup: { activity: 'Caminar', duration: 5, intensity: 'fácil' },
                        main: {
                            activity: 'Alternar',
                            intervals: [
                                { activity: 'Correr', duration: 1, intensity: 'fácil' },
                                { activity: 'Caminar', duration: 2, intensity: 'recuperación' }
                            ],
                            rounds: 8,
                            totalTime: 24
                        },
                        cooldown: { activity: 'Caminar', duration: 5, intensity: 'fácil' },
                        totalDuration: 34,
                        tips: [
                            'Misma estructura que el día 1',
                            'Debe sentirse más fácil que la primera vez'
                        ]
                    },
                    {
                        day: 3,
                        type: 'intervals',
                        warmup: { activity: 'Caminar', duration: 5, intensity: 'fácil' },
                        main: {
                            activity: 'Alternar',
                            intervals: [
                                { activity: 'Correr', duration: 1, intensity: 'fácil' },
                                { activity: 'Caminar', duration: 2, intensity: 'recuperación' }
                            ],
                            rounds: 8,
                            totalTime: 24
                        },
                        cooldown: { activity: 'Caminar', duration: 5, intensity: 'fácil' },
                        totalDuration: 34,
                        tips: [
                            '¡Última sesión de la semana!',
                            'Deberías sentirte más cómodo corriendo'
                        ]
                    }
                ]
            },
            {
                week: 2,
                description: 'Aumentamos el tiempo de carrera gradualmente',
                sessions: [
                    {
                        day: 1,
                        type: 'intervals',
                        warmup: { activity: 'Caminar', duration: 5, intensity: 'fácil' },
                        main: {
                            activity: 'Alternar',
                            intervals: [
                                { activity: 'Correr', duration: 1.5, intensity: 'fácil' },
                                { activity: 'Caminar', duration: 2, intensity: 'recuperación' }
                            ],
                            rounds: 6,
                            totalTime: 21
                        },
                        cooldown: { activity: 'Caminar', duration: 5, intensity: 'fácil' },
                        totalDuration: 31,
                        tips: [
                            'Ahora corres 1.5 minutos seguidos',
                            'El descanso sigue siendo el mismo'
                        ]
                    },
                    {
                        day: 2,
                        type: 'intervals',
                        warmup: { activity: 'Caminar', duration: 5, intensity: 'fácil' },
                        main: {
                            activity: 'Alternar',
                            intervals: [
                                { activity: 'Correr', duration: 1.5, intensity: 'fácil' },
                                { activity: 'Caminar', duration: 2, intensity: 'recuperación' }
                            ],
                            rounds: 6,
                            totalTime: 21
                        },
                        cooldown: { activity: 'Caminar', duration: 5, intensity: 'fácil' },
                        totalDuration: 31
                    },
                    {
                        day: 3,
                        type: 'intervals',
                        warmup: { activity: 'Caminar', duration: 5, intensity: 'fácil' },
                        main: {
                            activity: 'Alternar',
                            intervals: [
                                { activity: 'Correr', duration: 1.5, intensity: 'fácil' },
                                { activity: 'Caminar', duration: 2, intensity: 'recuperación' }
                            ],
                            rounds: 6,
                            totalTime: 21
                        },
                        cooldown: { activity: 'Caminar', duration: 5, intensity: 'fácil' },
                        totalDuration: 31
                    }
                ]
            },
            // ... continuaría con las semanas 3-8
            {
                week: 8,
                description: 'Semana final: ¡Ya puedes correr 5K!',
                sessions: [
                    {
                        day: 1,
                        type: 'continuous',
                        warmup: { activity: 'Caminar', duration: 5, intensity: 'fácil' },
                        main: {
                            activity: 'Correr',
                            duration: 25,
                            intensity: 'fácil',
                            distance: '4K aproximadamente'
                        },
                        cooldown: { activity: 'Caminar', duration: 5, intensity: 'fácil' },
                        totalDuration: 35,
                        tips: [
                            'Penúltima semana de preparación',
                            'Ya casi dominas los 5K'
                        ]
                    },
                    {
                        day: 2,
                        type: 'continuous',
                        warmup: { activity: 'Caminar', duration: 5, intensity: 'fácil' },
                        main: {
                            activity: 'Correr',
                            duration: 25,
                            intensity: 'fácil',
                            distance: '4K aproximadamente'
                        },
                        cooldown: { activity: 'Caminar', duration: 5, intensity: 'fácil' },
                        totalDuration: 35
                    },
                    {
                        day: 3,
                        type: 'test',
                        warmup: { activity: 'Caminar', duration: 5, intensity: 'fácil' },
                        main: {
                            activity: 'Correr',
                            duration: 30,
                            intensity: 'cómodo',
                            distance: '5K',
                            notes: '¡Tu primer 5K completo!'
                        },
                        cooldown: { activity: 'Caminar', duration: 5, intensity: 'fácil' },
                        totalDuration: 40,
                        tips: [
                            '¡El gran día ha llegado!',
                            'Corre a ritmo cómodo, no te apresures',
                            '¡Celebra tu logro!'
                        ]
                    }
                ]
            }
        ],
        nextPlan: 'improve_5k'
    },

    // PLAN: MEJORAR 5K (Para quienes ya pueden correr 5K)
    improve_5k: {
        id: 'improve_5k',
        name: 'Mejorar 5K',
        description: 'Mejora tu tiempo en 5K y prepárate para distancias mayores',
        level: 'principiante-intermedio',
        duration: 6,
        daysPerWeek: 4,
        goal: 'Mejorar tiempo en 5K y aumentar resistencia',
        requirements: [
            'Capacidad para correr 5K sin parar',
            'Al menos 4 semanas de experiencia corriendo',
            'Sin lesiones actuales'
        ],
        weeks: [
            {
                week: 1,
                description: 'Base aeróbica y introducción a entrenamientos estructurados',
                sessions: [
                    {
                        day: 1,
                        type: 'easy',
                        name: 'Carrera Fácil',
                        warmup: { activity: 'Caminar/Trotar', duration: 5, intensity: 'fácil' },
                        main: {
                            activity: 'Correr',
                            duration: 25,
                            intensity: 'fácil',
                            pace: 'Conversacional',
                            distance: '4-5K'
                        },
                        cooldown: { activity: 'Caminar', duration: 5, intensity: 'fácil' },
                        totalDuration: 35,
                        tips: [
                            'Debes poder mantener una conversación',
                            'Este es tu ritmo base'
                        ]
                    },
                    {
                        day: 2,
                        type: 'intervals',
                        name: 'Intervalos Cortos',
                        warmup: { activity: 'Trotar', duration: 10, intensity: 'fácil' },
                        main: {
                            activity: 'Intervalos',
                            intervals: [
                                { activity: 'Correr fuerte', duration: 1, intensity: 'fuerte' },
                                { activity: 'Recuperación', duration: 2, intensity: 'fácil' }
                            ],
                            rounds: 6,
                            totalTime: 18
                        },
                        cooldown: { activity: 'Trotar', duration: 10, intensity: 'fácil' },
                        totalDuration: 38,
                        tips: [
                            'El ritmo fuerte debe ser sostenible por 1 minuto',
                            'Recupera completamente entre intervalos'
                        ]
                    },
                    {
                        day: 3,
                        type: 'easy',
                        name: 'Carrera de Recuperación',
                        warmup: { activity: 'Caminar', duration: 5, intensity: 'fácil' },
                        main: {
                            activity: 'Correr',
                            duration: 20,
                            intensity: 'muy fácil',
                            pace: 'Más lento que el día 1'
                        },
                        cooldown: { activity: 'Caminar', duration: 5, intensity: 'fácil' },
                        totalDuration: 30,
                        tips: [
                            'Carrera muy relajada',
                            'Ayuda a la recuperación'
                        ]
                    },
                    {
                        day: 4,
                        type: 'tempo',
                        name: 'Carrera Tempo',
                        warmup: { activity: 'Trotar', duration: 10, intensity: 'fácil' },
                        main: {
                            activity: 'Correr',
                            duration: 15,
                            intensity: 'moderadamente fuerte',
                            pace: 'Ritmo de 10K',
                            notes: 'Esfuerzo controlado pero sostenido'
                        },
                        cooldown: { activity: 'Trotar', duration: 10, intensity: 'fácil' },
                        totalDuration: 35,
                        tips: [
                            'Ritmo que podrías mantener por 1 hora',
                            'Respiración controlada pero trabajada'
                        ]
                    }
                ]
            }
            // ... continuaría con las semanas 2-6
        ],
        nextPlan: 'couch_to_10k'
    },

    // PLAN: DE 5K A 10K
    couch_to_10k: {
        id: 'couch_to_10k',
        name: 'De 5K a 10K',
        description: 'Duplica tu distancia de carrera de manera segura',
        level: 'intermedio',
        duration: 8,
        daysPerWeek: 4,
        goal: 'Correr 10K sin parar',
        requirements: [
            'Capacidad para correr 5K cómodamente',
            'Al menos 2 meses de experiencia corriendo',
            'Correr al menos 3 veces por semana'
        ],
        weeks: [
            {
                week: 1,
                description: 'Aumentamos volumen gradualmente',
                sessions: [
                    {
                        day: 1,
                        type: 'long',
                        name: 'Carrera Larga',
                        warmup: { activity: 'Trotar', duration: 5, intensity: 'fácil' },
                        main: {
                            activity: 'Correr',
                            duration: 35,
                            intensity: 'fácil',
                            distance: '5.5-6K',
                            notes: 'Primera extensión de distancia'
                        },
                        cooldown: { activity: 'Caminar', duration: 5, intensity: 'fácil' },
                        totalDuration: 45,
                        tips: [
                            'Solo 10% más que tu 5K habitual',
                            'Mantén el mismo ritmo fácil'
                        ]
                    }
                    // ... otros días de la semana
                ]
            }
            // ... continúa hasta la semana 8 donde se corre el primer 10K
        ],
        nextPlan: 'half_marathon'
    },

    // PLAN: MEDIO MARATÓN
    half_marathon: {
        id: 'half_marathon',
        name: 'Medio Maratón',
        description: 'Prepárate para correr 21K',
        level: 'intermedio-avanzado',
        duration: 12,
        daysPerWeek: 5,
        goal: 'Completar un medio maratón',
        requirements: [
            'Capacidad para correr 10K cómodamente',
            'Al menos 6 meses de experiencia corriendo',
            'Base de 30-40K semanales'
        ],
        weeks: [
            // ... 12 semanas de entrenamiento progresivo
        ],
        nextPlan: 'marathon'
    },

    // PLAN: MARATÓN
    marathon: {
        id: 'marathon',
        name: 'Maratón',
        description: 'El desafío definitivo: 42.195K',
        level: 'avanzado',
        duration: 16,
        daysPerWeek: 6,
        goal: 'Completar un maratón',
        requirements: [
            'Capacidad para correr medio maratón',
            'Al menos 1 año de experiencia corriendo',
            'Base de 50-60K semanales',
            'Sin historial de lesiones recientes'
        ],
        weeks: [
            // ... 16 semanas de entrenamiento intensivo
        ],
        nextPlan: null // Meta final
    }
};

// PLANES ESPECIALIZADOS
export const specializedPlans = {
    // VELOCIDAD 5K
    speed_5k: {
        id: 'speed_5k',
        name: '5K Velocidad',
        description: 'Mejora tu tiempo en 5K con entrenamientos de velocidad',
        level: 'intermedio-avanzado',
        duration: 8,
        daysPerWeek: 5,
        goal: 'Mejorar tiempo personal en 5K',
        focus: 'Velocidad y resistencia anaeróbica'
    },

    // TRAIL RUNNING
    trail_running: {
        id: 'trail_running',
        name: 'Trail Running',
        description: 'Adaptación para correr en montaña y terrenos irregulares',
        level: 'intermedio',
        duration: 10,
        daysPerWeek: 4,
        goal: 'Prepararse para trail running',
        focus: 'Fuerza, técnica y adaptación al terreno'
    }
};

// Funciones de utilidad
export function getPlanById(planId) {
    return runningPlans[planId] || specializedPlans[planId] || null;
}

export function getPlansByLevel(level) {
    const plans = [];
    
    for (const planId in runningPlans) {
        const plan = runningPlans[planId];
        if (plan.level.includes(level)) {
            plans.push(plan);
        }
    }
    
    for (const planId in specializedPlans) {
        const plan = specializedPlans[planId];
        if (plan.level.includes(level)) {
            plans.push(plan);
        }
    }
    
    return plans;
}

export function getNextPlan(currentPlanId) {
    const plan = getPlanById(currentPlanId);
    return plan?.nextPlan ? getPlanById(plan.nextPlan) : null;
}

// Calculadoras de ritmo y pace
export function calculatePace(distance, time) {
    // distance en km, time en minutos
    const paceMinutes = time / distance;
    const minutes = Math.floor(paceMinutes);
    const seconds = Math.round((paceMinutes - minutes) * 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')} min/km`;
}

export function calculateTime(distance, paceMinutes, paceSeconds) {
    const totalPaceMinutes = paceMinutes + (paceSeconds / 60);
    const totalTime = distance * totalPaceMinutes;
    const hours = Math.floor(totalTime / 60);
    const minutes = Math.round(totalTime % 60);
    
    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')} h`;
    } else {
        return `${minutes} min`;
    }
}

// Zonas de entrenamiento
export const trainingZones = {
    recovery: {
        name: 'Recuperación',
        intensity: '50-60% FCMax',
        description: 'Carrera muy fácil, recuperación activa',
        pace: 'Muy conversacional'
    },
    easy: {
        name: 'Fácil/Base',
        intensity: '60-70% FCMax',
        description: 'Ritmo base, desarrollo aeróbico',
        pace: 'Conversacional'
    },
    tempo: {
        name: 'Tempo',
        intensity: '70-80% FCMax',
        description: 'Esfuerzo moderadamente fuerte',
        pace: 'Controladamente difícil'
    },
    threshold: {
        name: 'Umbral',
        intensity: '80-90% FCMax',
        description: 'Umbral anaeróbico',
        pace: 'Difícil pero sostenible'
    },
    vo2max: {
        name: 'VO2 Max',
        intensity: '90-95% FCMax',
        description: 'Máximo consumo de oxígeno',
        pace: 'Muy difícil'
    },
    anaerobic: {
        name: 'Anaeróbico',
        intensity: '95-100% FCMax',
        description: 'Velocidad máxima',
        pace: 'Sprint'
    }
};

// Tipos de entrenamiento
export const workoutTypes = {
    easy: 'Carrera Fácil',
    long: 'Carrera Larga',
    tempo: 'Tempo Run',
    intervals: 'Intervalos',
    fartlek: 'Fartlek',
    hill: 'Repeticiones en Cuesta',
    recovery: 'Recuperación',
    race: 'Simulacro de Carrera',
    test: 'Test/Evaluación'
};

console.log('🏃 Planes de running cargados');

export default runningPlans;
