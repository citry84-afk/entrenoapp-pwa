// Base de datos de WODs de Entrenamiento Funcional
// Heroes WODs reales de wodwell.com y benchmarks famosos

export const functionalWods = {
    // HERO WODS - Entrenamientos en honor a héroes caídos
    heroes: [
        {
            id: 'murph',
            name: 'Murph',
            type: 'hero',
            description: 'En honor al Teniente Michael Murphy, Navy SEAL',
            difficulty: 'avanzado',
            timeNeeded: '45-60 min',
            equipment: ['barra_dominadas', 'peso_corporal', 'chaleco_opcional'],
            workout: {
                structure: 'For Time',
                movements: [
                    { exercise: 'Correr', reps: '1 milla (1.6 km)', notes: 'Calentamiento' },
                    { exercise: 'Pull-ups', reps: '100', notes: 'Particionar como desees' },
                    { exercise: 'Push-ups', reps: '200', notes: 'Particionar como desees' },
                    { exercise: 'Air Squats', reps: '300', notes: 'Particionar como desees' },
                    { exercise: 'Correr', reps: '1 milla (1.6 km)', notes: 'Final' }
                ],
                rx: 'Con chaleco de 9kg (hombres) / 6kg (mujeres)',
                notes: [
                    'Memorial Day workout',
                    'Sugerencia: 20 rondas de 5 pull-ups, 10 push-ups, 15 squats',
                    'Se puede hacer sin chaleco'
                ]
            },
            scaling: {
                principiante: {
                    movements: [
                        { exercise: 'Correr', reps: '800m' },
                        { exercise: 'Ring Rows', reps: '50' },
                        { exercise: 'Push-ups (rodillas)', reps: '100' },
                        { exercise: 'Air Squats', reps: '150' },
                        { exercise: 'Correr', reps: '800m' }
                    ]
                }
            }
        },
        {
            id: 'fran',
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
                    { exercise: 'Pull-ups', reps: '21-15-9', notes: 'Alternando con thrusters' }
                ],
                rx: 'Thruster 43kg hombres, 30kg mujeres',
                notes: [
                    'Tan rápido como sea posible',
                    'Sub-3 min = élite, sub-5 min = muy bueno'
                ]
            },
            scaling: {
                principiante: {
                    movements: [
                        { exercise: 'Thrusters', reps: '21-15-9', weight: '20kg/15kg' },
                        { exercise: 'Ring Rows', reps: '21-15-9' }
                    ]
                }
            }
        },
        {
            id: 'helen',
            name: 'Helen',
            type: 'benchmark',
            description: 'Combinación perfecta de cardio y fuerza',
            difficulty: 'intermedio',
            timeNeeded: '8-12 min',
            equipment: ['kettlebell', 'barra_dominadas'],
            workout: {
                structure: '3 rondas for time',
                movements: [
                    { exercise: 'Correr', reps: '400m', notes: 'Cada ronda' },
                    { exercise: 'Kettlebell Swings', reps: '21', weight: '24kg/16kg' },
                    { exercise: 'Pull-ups', reps: '12', notes: 'Cada ronda' }
                ],
                rx: 'KB 24kg hombres, 16kg mujeres',
                notes: ['Mantén ritmo constante', 'No rompas las series']
            }
        },
        {
            id: 'grace',
            name: 'Grace',
            type: 'benchmark',
            description: 'Puro poder y velocidad',
            difficulty: 'intermedio',
            timeNeeded: '2-5 min',
            equipment: ['barra_olimpica'],
            workout: {
                structure: 'For Time',
                movements: [
                    { exercise: 'Clean and Jerks', reps: '30', weight: '60kg/40kg' }
                ],
                rx: 'C&J 60kg hombres, 40kg mujeres',
                notes: ['Sin parar', 'Máxima velocidad', 'Sub-3 min = élite']
            }
        },
        {
            id: 'cindy',
            name: 'Cindy',
            type: 'benchmark',
            description: 'AMRAP clásico con peso corporal',
            difficulty: 'principiante',
            timeNeeded: '20 min',
            equipment: ['barra_dominadas'],
            workout: {
                structure: 'AMRAP 20 minutos',
                movements: [
                    { exercise: 'Pull-ups', reps: '5', notes: 'Cada ronda' },
                    { exercise: 'Push-ups', reps: '10', notes: 'Cada ronda' },
                    { exercise: 'Air Squats', reps: '15', notes: 'Cada ronda' }
                ],
                notes: ['Tantas rondas como sea posible', 'Ritmo sostenible']
            }
        },
        {
            id: 'daniel',
            name: 'Daniel',
            type: 'hero',
            description: 'En honor al Sargento Daniel Sakai',
            difficulty: 'avanzado',
            timeNeeded: '25-35 min',
            equipment: ['barra_olimpica', 'barra_dominadas'],
            workout: {
                structure: 'For Time',
                movements: [
                    { exercise: 'Pull-ups', reps: '50', notes: 'Inicio' },
                    { exercise: 'Correr', reps: '400m' },
                    { exercise: 'Thrusters', reps: '95', weight: '20kg' },
                    { exercise: 'Correr', reps: '400m' },
                    { exercise: 'Pull-ups', reps: '50', notes: 'Final' }
                ],
                notes: ['Partition como necesites', 'Hero WOD']
            }
        },
        {
            id: 'angie',
            name: 'Angie',
            type: 'benchmark',
            description: 'Test de resistencia muscular',
            difficulty: 'intermedio',
            timeNeeded: '15-25 min',
            equipment: ['barra_dominadas'],
            workout: {
                structure: 'For Time',
                movements: [
                    { exercise: 'Pull-ups', reps: '100', notes: 'Completar antes del siguiente' },
                    { exercise: 'Push-ups', reps: '100', notes: 'Completar antes del siguiente' },
                    { exercise: 'Sit-ups', reps: '100', notes: 'Completar antes del siguiente' },
                    { exercise: 'Air Squats', reps: '100', notes: 'Último ejercicio' }
                ],
                notes: ['Un ejercicio a la vez', 'No alternar']
            }
        },
        {
            id: 'karen',
            name: 'Karen',
            type: 'benchmark',
            description: 'Wall ball puro',
            difficulty: 'intermedio',
            timeNeeded: '8-15 min',
            equipment: ['wallball'],
            workout: {
                structure: 'For Time',
                movements: [
                    { exercise: 'Wall Ball Shots', reps: '150', weight: '9kg/6kg', target: '3m/2.7m' }
                ],
                notes: ['Sin descanso', 'Mantén el ritmo', 'Sub-10 min = bueno']
            }
        }
    ],

    // WODS DE COMPETICIÓN (Open, etc.)
    competition: [
        {
            id: 'open_21_1',
            name: 'Open 21.1',
            type: 'competition',
            description: 'CrossFit Open 2021 - Workout 1',
            difficulty: 'intermedio',
            timeNeeded: '15 min',
            equipment: ['wallball', 'cajón'],
            workout: {
                structure: 'AMRAP 15 minutos',
                movements: [
                    { exercise: 'Wall Ball Shots', reps: '10', weight: '9kg/6kg' },
                    { exercise: 'Box Jump Overs', reps: '10', height: '60cm/50cm' }
                ],
                notes: ['Tantas rondas como sea posible']
            }
        }
    ]
};

// Equipamiento común en entrenamiento funcional
export const functionalEquipment = [
    { id: 'peso_corporal', name: 'Peso Corporal', icon: '🤸‍♂️' },
    { id: 'barra_dominadas', name: 'Barra de Dominadas', icon: '🏋️‍♂️' },
    { id: 'barra_olimpica', name: 'Barra Olímpica', icon: '🏋️‍♀️' },
    { id: 'kettlebell', name: 'Kettlebell', icon: '⚖️' },
    { id: 'mancuernas', name: 'Mancuernas', icon: '💪' },
    { id: 'cajón', name: 'Cajón de Salto', icon: '📦' },
    { id: 'wallball', name: 'Wall Ball', icon: '⚽' },
    { id: 'anillas', name: 'Anillas', icon: '⭕' },
    { id: 'soga', name: 'Soga de Saltar', icon: '🪢' },
    { id: 'chaleco_peso', name: 'Chaleco con Peso', icon: '🦺' },
    { id: 'remo', name: 'Remo / Assault Bike', icon: '🚣‍♂️' }
];

console.log('⚡ Base de datos de WODs Funcionales cargada desde wodwell.com');
