// Base de datos de WODs de Entrenamiento Funcional
// Heroes WODs, competiciones, Open, etc.

export const crossfitWods = {
    // HERO WODS - Entrenamientos en honor a héroes caídos
    heroes: [
        {
            id: 'hero_001',
            name: 'Murph',
            type: 'hero',
            description: 'En honor al Teniente Michael Murphy',
            difficulty: 'avanzado',
            timeNeeded: '45-60 min',
            equipment: ['barra_dominadas', 'peso_corporal'],
            workout: {
                structure: 'For Time',
                movements: [
                    { exercise: 'Correr', reps: '1 milla', notes: 'Inicio' },
                    { exercise: 'Dominadas', reps: '100', notes: 'Puede particionarse' },
                    { exercise: 'Flexiones', reps: '200', notes: 'Puede particionarse' },
                    { exercise: 'Sentadillas', reps: '300', notes: 'Puede particionarse' },
                    { exercise: 'Correr', reps: '1 milla', notes: 'Final' }
                ],
                notes: [
                    'Tradicionalmente se hace con chaleco de 20/14 lbs',
                    'Puede particionarse: 20 rounds de 5 dominadas, 10 flexiones, 15 sentadillas',
                    'Memorial Day workout'
                ]
            },
            scaling: {
                beginner: {
                    movements: [
                        { exercise: 'Correr', reps: '800m', notes: 'Inicio' },
                        { exercise: 'Dominadas asistidas', reps: '50', notes: '' },
                        { exercise: 'Flexiones rodillas', reps: '100', notes: '' },
                        { exercise: 'Sentadillas', reps: '150', notes: '' },
                        { exercise: 'Correr', reps: '800m', notes: 'Final' }
                    ]
                }
            },
            youtubeSearch: 'murph crossfit wod'
        },
        {
            id: 'hero_002',
            name: 'Fran',
            type: 'benchmark',
            description: 'Uno de los benchmarks más famosos del entrenamiento funcional',
            difficulty: 'intermedio',
            timeNeeded: '5-15 min',
            equipment: ['barra', 'barra_dominadas'],
            workout: {
                structure: '21-15-9',
                movements: [
                    { exercise: 'Thrusters', reps: '21-15-9', weight: '95/65 lbs' },
                    { exercise: 'Dominadas', reps: '21-15-9', notes: '' }
                ],
                notes: [
                    'Para tiempo',
                    'El peso estándar es 95 lbs hombres, 65 lbs mujeres',
                    'Sub-3 minutos es élite, sub-5 muy bueno'
                ]
            },
            scaling: {
                beginner: {
                    movements: [
                        { exercise: 'Thrusters', reps: '21-15-9', weight: '65/45 lbs' },
                        { exercise: 'Dominadas asistidas', reps: '21-15-9', notes: '' }
                    ]
                }
            },
            youtubeSearch: 'fran crossfit benchmark'
        },
        {
            id: 'hero_003',
            name: 'Grace',
            type: 'benchmark',
            description: 'Test de fuerza y resistencia',
            difficulty: 'intermedio',
            timeNeeded: '2-8 min',
            equipment: ['barra'],
            workout: {
                structure: 'For Time',
                movements: [
                    { exercise: 'Clean and Jerk', reps: '30', weight: '135/95 lbs' }
                ],
                notes: [
                    'Para tiempo',
                    'Sub-3 minutos es excelente',
                    'Enfoque en técnica perfecta'
                ]
            },
            scaling: {
                beginner: {
                    movements: [
                        { exercise: 'Clean and Jerk', reps: '30', weight: '95/65 lbs' }
                    ]
                }
            },
            youtubeSearch: 'grace crossfit wod'
        },
        {
            id: 'hero_004',
            name: 'Helen',
            type: 'benchmark',
            description: 'Combina running y gimnasia',
            difficulty: 'intermedio',
            timeNeeded: '12-20 min',
            equipment: ['kettlebell', 'barra_dominadas'],
            workout: {
                structure: '3 Rounds',
                movements: [
                    { exercise: 'Correr', reps: '400m', notes: '' },
                    { exercise: 'Kettlebell Swings', reps: '21', weight: '53/35 lbs' },
                    { exercise: 'Dominadas', reps: '12', notes: '' }
                ],
                notes: [
                    'Para tiempo',
                    'Sub-12 minutos es muy bueno',
                    'Mantén consistencia en las rondas'
                ]
            },
            scaling: {
                beginner: {
                    movements: [
                        { exercise: 'Correr', reps: '200m', notes: '' },
                        { exercise: 'Kettlebell Swings', reps: '21', weight: '35/25 lbs' },
                        { exercise: 'Dominadas asistidas', reps: '12', notes: '' }
                    ]
                }
            },
            youtubeSearch: 'helen crossfit wod'
        },
        {
            id: 'hero_005',
            name: 'Cindy',
            type: 'benchmark',
            description: 'AMRAP de peso corporal',
            difficulty: 'principiante',
            timeNeeded: '20 min',
            equipment: ['barra_dominadas', 'peso_corporal'],
            workout: {
                structure: 'AMRAP 20 min',
                movements: [
                    { exercise: 'Dominadas', reps: '5', notes: '' },
                    { exercise: 'Flexiones', reps: '10', notes: '' },
                    { exercise: 'Sentadillas', reps: '15', notes: '' }
                ],
                notes: [
                    'Tantas rondas como sea posible en 20 minutos',
                    '20+ rondas es excelente',
                    'Mantén ritmo constante'
                ]
            },
            scaling: {
                beginner: {
                    movements: [
                        { exercise: 'Dominadas asistidas', reps: '5', notes: '' },
                        { exercise: 'Flexiones rodillas', reps: '10', notes: '' },
                        { exercise: 'Sentadillas', reps: '15', notes: '' }
                    ]
                }
            },
            youtubeSearch: 'cindy crossfit wod'
        }
    ],

    // CROSSFIT GAMES WORKOUTS
    games: [
        {
            id: 'games_001',
            name: 'Double Grace',
            type: 'games',
            year: 2019,
            description: 'Dos veces Grace consecutivo',
            difficulty: 'avanzado',
            timeNeeded: '8-15 min',
            equipment: ['barra'],
            workout: {
                structure: 'For Time',
                movements: [
                    { exercise: 'Clean and Jerk', reps: '30', weight: '135/95 lbs', notes: 'Primera Grace' },
                    { exercise: 'Clean and Jerk', reps: '30', weight: '135/95 lbs', notes: 'Segunda Grace' }
                ],
                notes: [
                    'Sin descanso entre las dos Grace',
                    'Test definitivo de resistencia muscular',
                    'Usado en competiciones funcionales 2019'
                ]
            },
            youtubeSearch: 'double grace crossfit games'
        },
        {
            id: 'games_002',
            name: 'Fibonacci',
            type: 'games',
            year: 2020,
            description: 'Secuencia de Fibonacci en burpees',
            difficulty: 'avanzado',
            timeNeeded: '15-25 min',
            equipment: ['peso_corporal'],
            workout: {
                structure: 'For Time',
                movements: [
                    { exercise: 'Burpees', reps: '1, 1, 2, 3, 5, 8, 13, 21', notes: 'Secuencia Fibonacci' },
                    { exercise: 'Correr 200m', reps: 'Entre cada set', notes: '' }
                ],
                notes: [
                    'Correr 200m entre cada set de burpees',
                    'Total: 54 burpees + 1600m corriendo',
                    'Mental y físicamente desafiante'
                ]
            },
            youtubeSearch: 'fibonacci crossfit games'
        }
    ],

    // CROSSFIT OPEN WORKOUTS
    open: [
        {
            id: 'open_001',
            name: '21.1',
            type: 'open',
            year: 2021,
            description: 'Wall walks y double unders',
            difficulty: 'intermedio',
            timeNeeded: '15 min',
            equipment: ['cuerda', 'pared'],
            workout: {
                structure: 'AMRAP 15 min',
                movements: [
                    { exercise: 'Wall Walk', reps: '1, 2, 3, 4, 5, 6, 7, 8, 9, 10...', notes: 'Escalera' },
                    { exercise: 'Double Unders', reps: '10, 20, 30, 40, 50, 60, 70, 80, 90, 100...', notes: 'Escalera' }
                ],
                notes: [
                    'Escalera ascendente cada round',
                    'Score = total de repeticiones completadas',
                    'Workout muy técnico'
                ]
            },
            scaling: {
                beginner: {
                    movements: [
                        { exercise: 'Wall Walk parcial', reps: 'Escalera', notes: 'Hasta donde puedas' },
                        { exercise: 'Singles o attempts', reps: 'Escalera x2', notes: 'Doble cantidad' }
                    ]
                }
            },
            youtubeSearch: '21.1 crossfit open'
        },
        {
            id: 'open_002',
            name: '20.1',
            type: 'open',
            year: 2020,
            description: 'Ground to overhead y burpees',
            difficulty: 'intermedio',
            timeNeeded: '15 min',
            equipment: ['mancuernas'],
            workout: {
                structure: 'AMRAP 15 min',
                movements: [
                    { exercise: 'Ground to Overhead', reps: '8', weight: 'Mancuernas 50/35 lbs' },
                    { exercise: 'Burpee Box Step-ups', reps: '10', notes: 'Caja 24/20"' }
                ],
                notes: [
                    'Repetir por 15 minutos',
                    'Ground to overhead = cualquier técnica',
                    'Box step-ups, no saltos'
                ]
            },
            youtubeSearch: '20.1 crossfit open'
        }
    ],

    // WODS CLÁSICOS ADICIONALES
    classics: [
        {
            id: 'classic_001',
            name: 'Tabata Something Else',
            type: 'classic',
            description: 'Protocolo Tabata con 4 movimientos',
            difficulty: 'intermedio',
            timeNeeded: '20 min',
            equipment: ['barra_dominadas', 'peso_corporal', 'kettlebell'],
            workout: {
                structure: 'Tabata (20s work / 10s rest)',
                movements: [
                    { exercise: 'Dominadas', reps: 'Max reps', notes: '4 rounds Tabata' },
                    { exercise: 'Flexiones', reps: 'Max reps', notes: '4 rounds Tabata' },
                    { exercise: 'Sentadillas', reps: 'Max reps', notes: '4 rounds Tabata' },
                    { exercise: 'Sit-ups', reps: 'Max reps', notes: '4 rounds Tabata' }
                ],
                notes: [
                    '1 minuto descanso entre ejercicios',
                    'Score = suma de peores rounds de cada ejercicio',
                    'Máxima intensidad en cada intervalo'
                ]
            },
            youtubeSearch: 'tabata something else crossfit'
        },
        {
            id: 'classic_002',
            name: 'The Seven',
            type: 'classic',
            description: '7 rounds de 7 movimientos',
            difficulty: 'avanzado',
            timeNeeded: '25-35 min',
            equipment: ['barra', 'kettlebell', 'barra_dominadas'],
            workout: {
                structure: '7 Rounds',
                movements: [
                    { exercise: 'Handstand Push-ups', reps: '7', notes: '' },
                    { exercise: 'Thrusters', reps: '7', weight: '135/95 lbs' },
                    { exercise: 'Knees to Elbows', reps: '7', notes: '' },
                    { exercise: 'Deadlifts', reps: '7', weight: '245/165 lbs' },
                    { exercise: 'Burpees', reps: '7', notes: '' },
                    { exercise: 'Kettlebell Swings', reps: '7', weight: '70/53 lbs' },
                    { exercise: 'Pull-ups', reps: '7', notes: '' }
                ],
                notes: [
                    'Para tiempo',
                    'Workout muy demandante',
                    'Requiere buena técnica en todos los movimientos'
                ]
            },
            youtubeSearch: 'the seven crossfit'
        }
    ],

    // EMOM WORKOUTS
    emoms: [
        {
            id: 'emom_001',
            name: 'EMOM Burpees',
            type: 'emom',
            description: 'Escalera de burpees cada minuto',
            difficulty: 'principiante',
            timeNeeded: '10 min',
            equipment: ['peso_corporal'],
            workout: {
                structure: 'EMOM 10 min',
                movements: [
                    { exercise: 'Burpees', reps: '1 en min 1, 2 en min 2, etc.', notes: 'Hasta 10' }
                ],
                notes: [
                    'Cada minuto durante el minuto',
                    'Descanso = tiempo restante del minuto',
                    'Total: 55 burpees'
                ]
            },
            youtubeSearch: 'emom burpees crossfit'
        }
    ]
};

// Función para obtener WODs por tipo
export function getWodsByType(type) {
    return crossfitWods[type] || [];
}

// Función para obtener un WOD específico por ID
export function getWodById(wodId) {
    for (const type in crossfitWods) {
        const wod = crossfitWods[type].find(w => w.id === wodId);
        if (wod) return wod;
    }
    return null;
}

// Función para buscar WODs
export function searchWods(query) {
    const results = [];
    const searchTerm = query.toLowerCase();
    
    for (const type in crossfitWods) {
        const typeWods = crossfitWods[type].filter(wod => 
            wod.name.toLowerCase().includes(searchTerm) ||
            wod.description.toLowerCase().includes(searchTerm)
        );
        results.push(...typeWods);
    }
    
    return results;
}

// Función para obtener WODs por dificultad
export function getWodsByDifficulty(difficulty) {
    const results = [];
    
    for (const type in crossfitWods) {
        const typeWods = crossfitWods[type].filter(wod => 
            wod.difficulty === difficulty
        );
        results.push(...typeWods);
    }
    
    return results;
}

// Función para obtener WODs por equipo necesario
export function getWodsByEquipment(equipment) {
    const results = [];
    
    for (const type in crossfitWods) {
        const typeWods = crossfitWods[type].filter(wod => 
            wod.equipment.includes(equipment)
        );
        results.push(...typeWods);
    }
    
    return results;
}

// Función para obtener WODs por duración
export function getWodsByDuration(maxMinutes) {
    const results = [];
    
    for (const type in crossfitWods) {
        const typeWods = crossfitWods[type].filter(wod => {
            const duration = parseInt(wod.timeNeeded.split('-')[0]) || 
                           parseInt(wod.timeNeeded.split(' ')[0]);
            return duration <= maxMinutes;
        });
        results.push(...typeWods);
    }
    
    return results;
}

// Tipos de WODs disponibles
export const wodTypes = [
    'heroes',
    'games', 
    'open',
    'classics',
    'emoms'
];

// Niveles de dificultad
export const difficultyLevels = [
    'principiante',
    'intermedio',
    'avanzado'
];

// Equipamiento común en entrenamiento funcional
export const crossfitEquipment = [
    'barra',
    'mancuernas',
    'kettlebell',
    'barra_dominadas',
    'peso_corporal',
    'cuerda',
    'pared',
    'caja',
    'anillas',
    'remo'
];

console.log('⚡ Base de datos de WODs Funcionales cargada');
