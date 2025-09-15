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

// ===================================
// EJERCICIOS ESPECÍFICOS DE RUNNING
// ===================================

export const runningExercises = {
    // CALENTAMIENTO
    warmup: [
        {
            id: 'walking_warmup',
            name: 'Caminata de Calentamiento',
            description: 'Caminata suave para activar músculos',
            duration: '5-10 min',
            intensity: 'Muy fácil',
            instructions: [
                'Caminar a ritmo cómodo',
                'Movimientos suaves de brazos',
                'Respiración relajada'
            ],
            tips: ['Prepara el cuerpo para el ejercicio', 'No debe cansarte']
        },
        {
            id: 'jogging_warmup',
            name: 'Trote de Calentamiento',
            description: 'Trote suave para activar sistema cardiovascular',
            duration: '5-10 min',
            intensity: 'Fácil',
            instructions: [
                'Trotar a ritmo conversacional',
                'Movimientos naturales de brazos',
                'Respiración controlada'
            ],
            tips: ['Debes poder mantener conversación', 'Prepara el corazón']
        },
        {
            id: 'dynamic_stretches',
            name: 'Estiramientos Dinámicos',
            description: 'Movimientos activos para preparar músculos',
            duration: '5 min',
            intensity: 'Moderado',
            instructions: [
                'Círculos de brazos',
                'Elevaciones de rodillas',
                'Patadas al glúteo',
                'Zancadas dinámicas'
            ],
            tips: ['Movimientos controlados', 'No rebotes']
        }
    ],

    // ENFRIAMIENTO
    cooldown: [
        {
            id: 'walking_cooldown',
            name: 'Caminata de Enfriamiento',
            description: 'Caminata suave para bajar frecuencia cardíaca',
            duration: '5-10 min',
            intensity: 'Muy fácil',
            instructions: [
                'Caminar a ritmo muy suave',
                'Respiración profunda',
                'Relajar músculos'
            ],
            tips: ['Ayuda a la recuperación', 'Baja la frecuencia cardíaca']
        },
        {
            id: 'static_stretches',
            name: 'Estiramientos Estáticos',
            description: 'Estiramientos para mejorar flexibilidad',
            duration: '10-15 min',
            intensity: 'Suave',
            instructions: [
                'Estirar cuádriceps',
                'Estirar isquiotibiales',
                'Estirar pantorrillas',
                'Estirar glúteos'
            ],
            tips: ['Mantener 30 segundos cada estiramiento', 'No rebotes']
        }
    ],

    // EJERCICIOS DE TÉCNICA
    technique: [
        {
            id: 'high_knees',
            name: 'Elevaciones de Rodillas',
            description: 'Mejora la técnica de carrera y fuerza',
            duration: '30-60 seg',
            intensity: 'Moderado',
            instructions: [
                'Correr en el lugar',
                'Elevar rodillas al pecho',
                'Brazos activos',
                'Pies en punta'
            ],
            tips: ['Mantén el torso erguido', 'Ritmo controlado']
        },
        {
            id: 'butt_kicks',
            name: 'Patadas al Glúteo',
            description: 'Mejora la técnica de zancada posterior',
            duration: '30-60 seg',
            intensity: 'Moderado',
            instructions: [
                'Correr en el lugar',
                'Llevar talones al glúteo',
                'Brazos activos',
                'Ritmo constante'
            ],
            tips: ['Mantén el torso erguido', 'No rebotes']
        },
        {
            id: 'skipping',
            name: 'Skipping',
            description: 'Mejora la coordinación y técnica',
            duration: '30-60 seg',
            intensity: 'Moderado',
            instructions: [
                'Saltar alternando pies',
                'Elevar rodillas',
                'Brazos coordinados',
                'Ritmo constante'
            ],
            tips: ['Coordinación brazos-piernas', 'Ritmo controlado']
        },
        {
            id: 'carioca',
            name: 'Carioca',
            description: 'Mejora la movilidad y coordinación lateral',
            duration: '30-60 seg',
            intensity: 'Moderado',
            instructions: [
                'Movimiento lateral',
                'Cruzar piernas adelante y atrás',
                'Brazos coordinados',
                'Mantener ritmo'
            ],
            tips: ['Movimiento fluido', 'No apresures']
        },
        {
            id: 'side_shuffles',
            name: 'Desplazamientos Laterales',
            description: 'Fortalece músculos estabilizadores',
            duration: '30-60 seg',
            intensity: 'Moderado',
            instructions: [
                'Desplazamiento lateral',
                'Pies separados',
                'Brazos activos',
                'Ritmo constante'
            ],
            tips: ['Mantén posición baja', 'Movimiento controlado']
        }
    ],

    // EJERCICIOS DE FUERZA
    strength: [
        {
            id: 'squats',
            name: 'Sentadillas',
            description: 'Fortalece cuádriceps y glúteos',
            reps: '10-20',
            sets: '2-3',
            instructions: [
                'Pies separados al ancho de hombros',
                'Bajar como si te sentaras',
                'Rodillas en línea con pies',
                'Subir contrayendo glúteos'
            ],
            tips: ['Mantén pecho erguido', 'No dejes que las rodillas se vayan hacia adentro']
        },
        {
            id: 'lunges',
            name: 'Zancadas',
            description: 'Fortalece piernas unilateralmente',
            reps: '10-15 por pierna',
            sets: '2-3',
            instructions: [
                'Paso largo hacia adelante',
                'Bajar hasta 90 grados',
                'Empujar con pierna delantera',
                'Alternar piernas'
            ],
            tips: ['Mantén torso erguido', 'Controla la bajada']
        },
        {
            id: 'calf_raises',
            name: 'Elevaciones de Gemelos',
            description: 'Fortalece pantorrillas',
            reps: '15-25',
            sets: '2-3',
            instructions: [
                'De pie con pies juntos',
                'Subir sobre dedos de pies',
                'Mantener contracción arriba',
                'Bajar controladamente'
            ],
            tips: ['Rango completo de movimiento', 'Pausa arriba']
        },
        {
            id: 'single_leg_glute_bridges',
            name: 'Puente de Glúteos a Una Pierna',
            description: 'Fortalece glúteos y estabilizadores',
            reps: '8-12 por pierna',
            sets: '2-3',
            instructions: [
                'Acuéstate con una pierna extendida',
                'Otra pierna flexionada',
                'Levantar cadera con una pierna',
                'Contraer glúteos en la cima'
            ],
            tips: ['Una pierna extendida', 'Contrae glúteos']
        },
        {
            id: 'wall_sits',
            name: 'Sentadilla en Pared',
            description: 'Fortalece cuádriceps isométricamente',
            duration: '30-60 seg',
            sets: '2-3',
            instructions: [
                'Espalda contra la pared',
                'Deslizar hacia abajo hasta 90°',
                'Mantener posición',
                'Presionar contra la pared'
            ],
            tips: ['Posición 90 grados', 'Mantén tiempo']
        }
    ],

    // EJERCICIOS DE CORE
    core: [
        {
            id: 'plank',
            name: 'Plancha',
            description: 'Fortalece core completo',
            duration: '30-60 seg',
            sets: '2-3',
            instructions: [
                'Posición de flexión con antebrazos',
                'Codos bajo hombros',
                'Mantener cuerpo recto',
                'Contraer core y glúteos'
            ],
            tips: ['Cuerpo recto', 'Respiración normal']
        },
        {
            id: 'side_plank',
            name: 'Plancha Lateral',
            description: 'Fortalece oblicuos',
            duration: '20-30 seg por lado',
            sets: '2-3',
            instructions: [
                'De lado con antebrazo en suelo',
                'Cuerpo en línea recta',
                'Mantener posición',
                'Alternar lados'
            ],
            tips: ['Cuerpo recto', 'No dejes caer cadera']
        },
        {
            id: 'russian_twists',
            name: 'Giros Rusos',
            description: 'Fortalece oblicuos y rotación',
            reps: '20-30',
            sets: '2-3',
            instructions: [
                'Sentado con rodillas flexionadas',
                'Inclinarse hacia atrás 45°',
                'Girar torso de lado a lado',
                'Mantener core activo'
            ],
            tips: ['Movimiento controlado', 'Core activo']
        },
        {
            id: 'mountain_climbers',
            name: 'Escaladores de Montaña',
            description: 'Fortalece core y mejora cardio',
            duration: '30-60 seg',
            sets: '2-3',
            instructions: [
                'Posición de plancha',
                'Llevar rodilla al pecho',
                'Alternar piernas rápidamente',
                'Mantener core activo'
            ],
            tips: ['Movimiento rápido', 'Core activo']
        }
    ],

    // EJERCICIOS DE MOVILIDAD
    mobility: [
        {
            id: 'leg_swings',
            name: 'Balanceos de Piernas',
            description: 'Mejora movilidad de cadera',
            reps: '10-15 por pierna',
            sets: '2-3',
            instructions: [
                'Sujetarse a una pared',
                'Balancear pierna hacia adelante y atrás',
                'Balancear pierna hacia los lados',
                'Alternar piernas'
            ],
            tips: ['Movimiento controlado', 'No rebotes']
        },
        {
            id: 'hip_circles',
            name: 'Círculos de Cadera',
            description: 'Mejora movilidad de cadera',
            reps: '10-15 por dirección',
            sets: '2-3',
            instructions: [
                'Pies separados al ancho de hombros',
                'Manos en cintura',
                'Hacer círculos con cadera',
                'Cambiar dirección'
            ],
            tips: ['Movimiento fluido', 'Rango completo']
        },
        {
            id: 'ankle_circles',
            name: 'Círculos de Tobillo',
            description: 'Mejora movilidad de tobillo',
            reps: '10-15 por pie',
            sets: '2-3',
            instructions: [
                'Levantar un pie del suelo',
                'Hacer círculos con el tobillo',
                'Cambiar dirección',
                'Alternar pies'
            ],
            tips: ['Movimiento controlado', 'Rango completo']
        }
    ]
};

// ===================================
// PLANES DE ENTRENAMIENTO ESPECÍFICOS
// ===================================

export const specializedRunningPlans = {
    // PLAN DE VELOCIDAD 5K
    speed_5k_advanced: {
        id: 'speed_5k_advanced',
        name: '5K Velocidad Avanzado',
        description: 'Plan intensivo para mejorar tiempo en 5K',
        level: 'avanzado',
        duration: 8,
        daysPerWeek: 5,
        goal: 'Mejorar tiempo personal en 5K',
        focus: 'Velocidad y resistencia anaeróbica',
        weeks: [
            {
                week: 1,
                description: 'Base de velocidad con intervalos cortos',
                sessions: [
                    {
                        day: 1,
                        type: 'easy',
                        name: 'Carrera Fácil',
                        duration: 30,
                        intensity: 'Fácil',
                        tips: ['Ritmo conversacional', 'Recuperación activa']
                    },
                    {
                        day: 2,
                        type: 'intervals',
                        name: 'Intervalos 400m',
                        warmup: { duration: 10, intensity: 'Fácil' },
                        main: {
                            intervals: [
                                { distance: '400m', intensity: 'Fuerte', rest: '90 seg' }
                            ],
                            rounds: 6,
                            totalTime: 24
                        },
                        cooldown: { duration: 10, intensity: 'Fácil' },
                        tips: ['Ritmo de 5K', 'Recuperación completa']
                    },
                    {
                        day: 3,
                        type: 'easy',
                        name: 'Carrera de Recuperación',
                        duration: 25,
                        intensity: 'Muy fácil',
                        tips: ['Recuperación activa', 'Ritmo muy cómodo']
                    },
                    {
                        day: 4,
                        type: 'tempo',
                        name: 'Tempo 5K',
                        warmup: { duration: 10, intensity: 'Fácil' },
                        main: {
                            duration: 20,
                            intensity: 'Tempo',
                            pace: 'Ritmo de 10K'
                        },
                        cooldown: { duration: 10, intensity: 'Fácil' },
                        tips: ['Esfuerzo controlado', 'Ritmo sostenible']
                    },
                    {
                        day: 5,
                        type: 'long',
                        name: 'Carrera Larga',
                        duration: 45,
                        intensity: 'Fácil',
                        tips: ['Ritmo conversacional', 'Desarrollo aeróbico']
                    }
                ]
            }
        ]
    },

    // PLAN DE TRAIL RUNNING
    trail_running_advanced: {
        id: 'trail_running_advanced',
        name: 'Trail Running Avanzado',
        description: 'Preparación completa para carreras de montaña',
        level: 'avanzado',
        duration: 12,
        daysPerWeek: 5,
        goal: 'Prepararse para trail running competitivo',
        focus: 'Fuerza, técnica y adaptación al terreno',
        weeks: [
            {
                week: 1,
                description: 'Adaptación al terreno irregular',
                sessions: [
                    {
                        day: 1,
                        type: 'easy',
                        name: 'Carrera en Terreno Plano',
                        duration: 30,
                        intensity: 'Fácil',
                        terrain: 'Plano',
                        tips: ['Ritmo conversacional', 'Adaptación gradual']
                    },
                    {
                        day: 2,
                        type: 'hill',
                        name: 'Repeticiones en Cuesta',
                        warmup: { duration: 10, intensity: 'Fácil' },
                        main: {
                            intervals: [
                                { duration: '2 min', intensity: 'Fuerte', terrain: 'Cuesta', rest: '2 min' }
                            ],
                            rounds: 6,
                            totalTime: 24
                        },
                        cooldown: { duration: 10, intensity: 'Fácil' },
                        tips: ['Técnica de subida', 'Recuperación en bajada']
                    },
                    {
                        day: 3,
                        type: 'easy',
                        name: 'Carrera de Recuperación',
                        duration: 25,
                        intensity: 'Muy fácil',
                        terrain: 'Plano',
                        tips: ['Recuperación activa', 'Técnica relajada']
                    },
                    {
                        day: 4,
                        type: 'trail',
                        name: 'Carrera en Senderos',
                        duration: 40,
                        intensity: 'Moderado',
                        terrain: 'Senderos',
                        tips: ['Técnica de trail', 'Atención al terreno']
                    },
                    {
                        day: 5,
                        type: 'long',
                        name: 'Carrera Larga en Montaña',
                        duration: 60,
                        intensity: 'Fácil',
                        terrain: 'Montaña',
                        tips: ['Ritmo conversacional', 'Gestión de energía']
                    }
                ]
            }
        ]
    },

    // PLAN DE RECUPERACIÓN
    recovery_plan: {
        id: 'recovery_plan',
        name: 'Plan de Recuperación',
        description: 'Recuperación activa y mantenimiento',
        level: 'todos',
        duration: 4,
        daysPerWeek: 3,
        goal: 'Recuperación y mantenimiento',
        focus: 'Recuperación activa y prevención de lesiones',
        weeks: [
            {
                week: 1,
                description: 'Recuperación activa y estiramientos',
                sessions: [
                    {
                        day: 1,
                        type: 'easy',
                        name: 'Carrera Muy Fácil',
                        duration: 20,
                        intensity: 'Muy fácil',
                        tips: ['Ritmo muy cómodo', 'Solo si te sientes bien']
                    },
                    {
                        day: 2,
                        type: 'cross_training',
                        name: 'Entrenamiento Cruzado',
                        duration: 30,
                        activity: 'Ciclismo/Natación',
                        intensity: 'Fácil',
                        tips: ['Actividad diferente', 'Mantener forma física']
                    },
                    {
                        day: 3,
                        type: 'stretching',
                        name: 'Sesión de Estiramientos',
                        duration: 45,
                        activity: 'Yoga/Estiramientos',
                        intensity: 'Suave',
                        tips: ['Flexibilidad', 'Relajación']
                    }
                ]
            }
        ]
    }
};

console.log('🏃 Planes de running cargados');

export default runningPlans;
