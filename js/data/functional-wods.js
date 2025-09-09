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
        },
        {
            id: 'josh',
            name: 'Josh',
            type: 'hero',
            description: 'En honor al Sargento Joshua Brennan',
            difficulty: 'avanzado',
            timeNeeded: '35-45 min',
            equipment: ['barra_olimpica', 'barra_dominadas', 'kettlebell'],
            workout: {
                structure: 'For Time',
                movements: [
                    { exercise: 'Overhead Squats', reps: '21', weight: '40kg/30kg' },
                    { exercise: 'Pull-ups', reps: '42' },
                    { exercise: 'Kettlebell Swings', reps: '63', weight: '24kg/16kg' },
                    { exercise: 'Overhead Squats', reps: '21', weight: '40kg/30kg' },
                    { exercise: 'Pull-ups', reps: '42' },
                    { exercise: 'Kettlebell Swings', reps: '63', weight: '24kg/16kg' }
                ],
                notes: ['Hero WOD', 'Partition como necesites']
            }
        },
        {
            id: 'michael',
            name: 'Michael',
            type: 'hero',
            description: 'En honor al Sargento Michael C. Pezzulo',
            difficulty: 'avanzado',
            timeNeeded: '25-35 min',
            equipment: ['barra_olimpica', 'barra_dominadas'],
            workout: {
                structure: 'For Time',
                movements: [
                    { exercise: 'Run', reps: '800m' },
                    { exercise: 'Back Squats', reps: '50', weight: '50kg/35kg' },
                    { exercise: 'Pull-ups', reps: '50' },
                    { exercise: 'Run', reps: '800m' }
                ],
                notes: ['Hero WOD', 'Mantén el ritmo']
            }
        },
        {
            id: 'nancy',
            name: 'Nancy',
            type: 'benchmark',
            description: 'Overhead squats y running',
            difficulty: 'intermedio',
            timeNeeded: '15-25 min',
            equipment: ['barra_olimpica'],
            workout: {
                structure: '5 rondas for time',
                movements: [
                    { exercise: 'Run', reps: '400m' },
                    { exercise: 'Overhead Squats', reps: '15', weight: '43kg/30kg' }
                ],
                notes: ['Alternar running y squats', 'Mantén técnica']
            }
        },
        {
            id: 'diane',
            name: 'Diane',
            type: 'benchmark',
            description: 'Deadlifts y handstand push-ups',
            difficulty: 'avanzado',
            timeNeeded: '5-15 min',
            equipment: ['barra_olimpica'],
            workout: {
                structure: '21-15-9 reps for time',
                movements: [
                    { exercise: 'Deadlifts', reps: '21-15-9', weight: '100kg/70kg' },
                    { exercise: 'Handstand Push-ups', reps: '21-15-9' }
                ],
                notes: ['Alternar ejercicios', 'Sub-5 min = élite']
            }
        },
        {
            id: 'elizabeth',
            name: 'Elizabeth',
            type: 'benchmark',
            description: 'Cleans y ring dips',
            difficulty: 'avanzado',
            timeNeeded: '8-15 min',
            equipment: ['barra_olimpica', 'anillas'],
            workout: {
                structure: '21-15-9 reps for time',
                movements: [
                    { exercise: 'Cleans', reps: '21-15-9', weight: '60kg/40kg' },
                    { exercise: 'Ring Dips', reps: '21-15-9' }
                ],
                notes: ['Alternar ejercicios', 'Mantén técnica']
            }
        },
        {
            id: 'isabel',
            name: 'Isabel',
            type: 'benchmark',
            description: 'Snatches puros',
            difficulty: 'avanzado',
            timeNeeded: '3-8 min',
            equipment: ['barra_olimpica'],
            workout: {
                structure: 'For Time',
                movements: [
                    { exercise: 'Snatches', reps: '30', weight: '60kg/40kg' }
                ],
                notes: ['Sin parar', 'Máxima velocidad', 'Sub-3 min = élite']
            }
        },
        {
            id: 'jackie',
            name: 'Jackie',
            type: 'benchmark',
            description: 'Row, thrusters y pull-ups',
            difficulty: 'intermedio',
            timeNeeded: '8-15 min',
            equipment: ['remo', 'barra_olimpica', 'barra_dominadas'],
            workout: {
                structure: 'For Time',
                movements: [
                    { exercise: 'Row', reps: '1000m' },
                    { exercise: 'Thrusters', reps: '50', weight: '20kg/15kg' },
                    { exercise: 'Pull-ups', reps: '30' }
                ],
                notes: ['Sin descanso entre ejercicios', 'Mantén ritmo']
            }
        },
        {
            id: 'linda',
            name: 'Linda',
            type: 'benchmark',
            description: 'The "Three Bars of Death"',
            difficulty: 'avanzado',
            timeNeeded: '15-30 min',
            equipment: ['barra_olimpica'],
            workout: {
                structure: '10-9-8-7-6-5-4-3-2-1 reps for time',
                movements: [
                    { exercise: 'Deadlifts', reps: '10-9-8-7-6-5-4-3-2-1', weight: '1.5x peso corporal' },
                    { exercise: 'Bench Press', reps: '10-9-8-7-6-5-4-3-2-1', weight: '1x peso corporal' },
                    { exercise: 'Cleans', reps: '10-9-8-7-6-5-4-3-2-1', weight: '0.75x peso corporal' }
                ],
                notes: ['Pesos basados en peso corporal', 'Muy pesado']
            }
        },
        {
            id: 'mary',
            name: 'Mary',
            type: 'benchmark',
            description: 'AMRAP con handstand push-ups',
            difficulty: 'avanzado',
            timeNeeded: '20 min',
            equipment: ['barra_dominadas', 'cajón'],
            workout: {
                structure: 'AMRAP 20 minutos',
                movements: [
                    { exercise: 'Handstand Push-ups', reps: '5' },
                    { exercise: 'Pull-ups', reps: '10' },
                    { exercise: 'Box Jumps', reps: '15', height: '60cm/50cm' }
                ],
                notes: ['Tantas rondas como sea posible', 'Mantén técnica']
            }
        },
        {
            id: 'nasty_girls',
            name: 'Nasty Girls',
            type: 'benchmark',
            description: '3 rondas de puro sufrimiento',
            difficulty: 'avanzado',
            timeNeeded: '15-25 min',
            equipment: ['barra_olimpica', 'barra_dominadas', 'kettlebell'],
            workout: {
                structure: '3 rondas for time',
                movements: [
                    { exercise: 'Squat Cleans', reps: '50', weight: '40kg/30kg' },
                    { exercise: 'Pull-ups', reps: '50' },
                    { exercise: 'Kettlebell Swings', reps: '50', weight: '24kg/16kg' }
                ],
                notes: ['Sin descanso entre rondas', 'Muy intenso']
            }
        },
        {
            id: 'badger',
            name: 'Badger',
            type: 'hero',
            description: 'En honor al Sargento Andrew Badger',
            difficulty: 'avanzado',
            timeNeeded: '30-45 min',
            equipment: ['barra_olimpica', 'barra_dominadas', 'cajón'],
            workout: {
                structure: '3 rondas for time',
                movements: [
                    { exercise: 'Squat Cleans', reps: '30', weight: '40kg/30kg' },
                    { exercise: 'Pull-ups', reps: '30' },
                    { exercise: 'Box Jumps', reps: '30', height: '60cm/50cm' }
                ],
                notes: ['Hero WOD', 'Mantén el ritmo']
            }
        },
        {
            id: 'tommy_v',
            name: 'Tommy V',
            type: 'hero',
            description: 'En honor al Teniente Thomas Valentine',
            difficulty: 'avanzado',
            timeNeeded: '20-30 min',
            equipment: ['barra_olimpica', 'barra_dominadas'],
            workout: {
                structure: 'For Time',
                movements: [
                    { exercise: 'Thrusters', reps: '21', weight: '40kg/30kg' },
                    { exercise: 'Pull-ups', reps: '21' },
                    { exercise: 'Thrusters', reps: '15', weight: '40kg/30kg' },
                    { exercise: 'Pull-ups', reps: '15' },
                    { exercise: 'Thrusters', reps: '9', weight: '40kg/30kg' },
                    { exercise: 'Pull-ups', reps: '9' }
                ],
                notes: ['Hero WOD', 'Alternar ejercicios']
            }
        },
        {
            id: 'joshua',
            name: 'Joshua',
            type: 'hero',
            description: 'En honor al Sargento Joshua Brennan',
            difficulty: 'avanzado',
            timeNeeded: '25-35 min',
            equipment: ['barra_olimpica', 'barra_dominadas'],
            workout: {
                structure: 'For Time',
                movements: [
                    { exercise: 'Overhead Squats', reps: '21', weight: '40kg/30kg' },
                    { exercise: 'Pull-ups', reps: '42' },
                    { exercise: 'Overhead Squats', reps: '21', weight: '40kg/30kg' },
                    { exercise: 'Pull-ups', reps: '42' }
                ],
                notes: ['Hero WOD', 'Partition como necesites']
            }
        },
        {
            id: 'jason',
            name: 'Jason',
            type: 'hero',
            description: 'En honor al Sargento Jason Peto',
            difficulty: 'avanzado',
            timeNeeded: '20-30 min',
            equipment: ['barra_olimpica', 'barra_dominadas'],
            workout: {
                structure: '100 rondas for time',
                movements: [
                    { exercise: 'Squat Cleans', reps: '3', weight: '40kg/30kg' },
                    { exercise: 'Pull-ups', reps: '3' }
                ],
                notes: ['Hero WOD', '100 rondas total', 'Mantén ritmo constante']
            }
        },
        {
            id: 'war_frank',
            name: 'War Frank',
            type: 'hero',
            description: 'En honor al Sargento Frank Waterhouse',
            difficulty: 'avanzado',
            timeNeeded: '15-25 min',
            equipment: ['barra_olimpica', 'barra_dominadas'],
            workout: {
                structure: '3 rondas for time',
                movements: [
                    { exercise: 'Thrusters', reps: '21', weight: '40kg/30kg' },
                    { exercise: 'Pull-ups', reps: '21' },
                    { exercise: 'Thrusters', reps: '15', weight: '40kg/30kg' },
                    { exercise: 'Pull-ups', reps: '15' },
                    { exercise: 'Thrusters', reps: '9', weight: '40kg/30kg' },
                    { exercise: 'Pull-ups', reps: '9' }
                ],
                notes: ['Hero WOD', 'Muy similar a Fran']
            }
        },
        {
            id: 'gator',
            name: 'Gator',
            type: 'hero',
            description: 'En honor al Sargento Gator',
            difficulty: 'avanzado',
            timeNeeded: '25-35 min',
            equipment: ['barra_olimpica', 'barra_dominadas'],
            workout: {
                structure: 'For Time',
                movements: [
                    { exercise: 'Deadlifts', reps: '21', weight: '100kg/70kg' },
                    { exercise: 'Pull-ups', reps: '21' },
                    { exercise: 'Deadlifts', reps: '15', weight: '100kg/70kg' },
                    { exercise: 'Pull-ups', reps: '15' },
                    { exercise: 'Deadlifts', reps: '9', weight: '100kg/70kg' },
                    { exercise: 'Pull-ups', reps: '9' }
                ],
                notes: ['Hero WOD', 'Muy pesado']
            }
        },
        {
            id: 'hot_shots_19',
            name: 'Hot Shots 19',
            type: 'hero',
            description: 'En honor a los 19 bomberos de Hot Shots',
            difficulty: 'avanzado',
            timeNeeded: '30-45 min',
            equipment: ['barra_olimpica', 'barra_dominadas', 'cajón'],
            workout: {
                structure: '6 rondas for time',
                movements: [
                    { exercise: 'Squat Cleans', reps: '19', weight: '40kg/30kg' },
                    { exercise: 'Pull-ups', reps: '19' },
                    { exercise: 'Box Jumps', reps: '19', height: '60cm/50cm' }
                ],
                notes: ['Hero WOD', 'En honor a los bomberos caídos']
            }
        },
        {
            id: 'mccafferty',
            name: 'McCafferty',
            type: 'hero',
            description: 'En honor al Sargento McCafferty',
            difficulty: 'avanzado',
            timeNeeded: '20-30 min',
            equipment: ['barra_olimpica', 'barra_dominadas'],
            workout: {
                structure: 'For Time',
                movements: [
                    { exercise: 'Thrusters', reps: '21', weight: '40kg/30kg' },
                    { exercise: 'Pull-ups', reps: '21' },
                    { exercise: 'Thrusters', reps: '15', weight: '40kg/30kg' },
                    { exercise: 'Pull-ups', reps: '15' },
                    { exercise: 'Thrusters', reps: '9', weight: '40kg/30kg' },
                    { exercise: 'Pull-ups', reps: '9' }
                ],
                notes: ['Hero WOD', 'Similar a Fran']
            }
        },
        {
            id: 'michael_murphy',
            name: 'Michael Murphy',
            type: 'hero',
            description: 'En honor al Teniente Michael Murphy (diferente a Murph)',
            difficulty: 'avanzado',
            timeNeeded: '25-35 min',
            equipment: ['barra_olimpica', 'barra_dominadas'],
            workout: {
                structure: 'For Time',
                movements: [
                    { exercise: 'Run', reps: '1 milla (1.6 km)' },
                    { exercise: 'Back Squats', reps: '100', weight: '50kg/35kg' },
                    { exercise: 'Pull-ups', reps: '100' },
                    { exercise: 'Run', reps: '1 milla (1.6 km)' }
                ],
                notes: ['Hero WOD', 'Muy pesado y largo']
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
        },
        {
            id: 'open_20_1',
            name: 'Open 20.1',
            type: 'competition',
            description: 'CrossFit Open 2020 - Workout 1',
            difficulty: 'intermedio',
            timeNeeded: '10 min',
            equipment: ['barra_olimpica', 'barra_dominadas'],
            workout: {
                structure: '10 rondas for time',
                movements: [
                    { exercise: 'Thrusters', reps: '8', weight: '40kg/30kg' },
                    { exercise: 'Bar Muscle-ups', reps: '10' }
                ],
                notes: ['Time cap: 10 minutos', 'Muy técnico']
            }
        },
        {
            id: 'open_19_1',
            name: 'Open 19.1',
            type: 'competition',
            description: 'CrossFit Open 2019 - Workout 1',
            difficulty: 'intermedio',
            timeNeeded: '15 min',
            equipment: ['wallball', 'barra_dominadas'],
            workout: {
                structure: 'AMRAP 15 minutos',
                movements: [
                    { exercise: 'Wall Ball Shots', reps: '19', weight: '9kg/6kg' },
                    { exercise: 'Pull-ups', reps: '19' }
                ],
                notes: ['Tantas rondas como sea posible']
            }
        },
        {
            id: 'open_18_1',
            name: 'Open 18.1',
            type: 'competition',
            description: 'CrossFit Open 2018 - Workout 1',
            difficulty: 'avanzado',
            timeNeeded: '20 min',
            equipment: ['barra_olimpica', 'barra_dominadas'],
            workout: {
                structure: 'AMRAP 20 minutos',
                movements: [
                    { exercise: 'Toes-to-bars', reps: '8' },
                    { exercise: 'Hang Power Cleans', reps: '10', weight: '40kg/30kg' },
                    { exercise: 'Push-ups', reps: '12' }
                ],
                notes: ['Tantas rondas como sea posible']
            }
        },
        {
            id: 'open_17_1',
            name: 'Open 17.1',
            type: 'competition',
            description: 'CrossFit Open 2017 - Workout 1',
            difficulty: 'intermedio',
            timeNeeded: '20 min',
            equipment: ['barra_olimpica', 'barra_dominadas'],
            workout: {
                structure: 'AMRAP 20 minutos',
                movements: [
                    { exercise: 'Dumbbell Snatches', reps: '10', weight: '22kg/15kg' },
                    { exercise: 'Burpee Box Jump Overs', reps: '15', height: '60cm/50cm' }
                ],
                notes: ['Tantas rondas como sea posible']
            }
        },
        {
            id: 'open_16_1',
            name: 'Open 16.1',
            type: 'competition',
            description: 'CrossFit Open 2016 - Workout 1',
            difficulty: 'avanzado',
            timeNeeded: '20 min',
            equipment: ['barra_olimpica', 'barra_dominadas'],
            workout: {
                structure: 'AMRAP 20 minutos',
                movements: [
                    { exercise: 'Overhead Walking Lunges', reps: '25', weight: '40kg/30kg' },
                    { exercise: 'Bar-facing Burpees', reps: '25' },
                    { exercise: 'Overhead Walking Lunges', reps: '25', weight: '40kg/30kg' },
                    { exercise: 'Chest-to-bar Pull-ups', reps: '50' }
                ],
                notes: ['Tantas rondas como sea posible']
            }
        },
        {
            id: 'open_15_1',
            name: 'Open 15.1',
            type: 'competition',
            description: 'CrossFit Open 2015 - Workout 1',
            difficulty: 'intermedio',
            timeNeeded: '9 min',
            equipment: ['barra_olimpica', 'barra_dominadas'],
            workout: {
                structure: '9 minutos AMRAP',
                movements: [
                    { exercise: 'Toes-to-bars', reps: '15' },
                    { exercise: 'Deadlifts', reps: '10', weight: '100kg/70kg' },
                    { exercise: 'Snatches', reps: '5', weight: '60kg/40kg' }
                ],
                notes: ['Tantas rondas como sea posible']
            }
        },
        {
            id: 'open_14_1',
            name: 'Open 14.1',
            type: 'competition',
            description: 'CrossFit Open 2014 - Workout 1',
            difficulty: 'intermedio',
            timeNeeded: '10 min',
            equipment: ['barra_olimpica', 'barra_dominadas'],
            workout: {
                structure: '10 minutos AMRAP',
                movements: [
                    { exercise: 'Double-unders', reps: '30' },
                    { exercise: 'Power Snatches', reps: '15', weight: '40kg/30kg' }
                ],
                notes: ['Tantas rondas como sea posible']
            }
        },
        {
            id: 'open_13_1',
            name: 'Open 13.1',
            type: 'competition',
            description: 'CrossFit Open 2013 - Workout 1',
            difficulty: 'intermedio',
            timeNeeded: '17 min',
            equipment: ['barra_olimpica', 'barra_dominadas'],
            workout: {
                structure: '17 minutos AMRAP',
                movements: [
                    { exercise: 'Burpees', reps: '40' },
                    { exercise: 'Snatches', reps: '30', weight: '40kg/30kg' },
                    { exercise: 'Burpees', reps: '30' },
                    { exercise: 'Snatches', reps: '30', weight: '40kg/30kg' },
                    { exercise: 'Burpees', reps: '20' },
                    { exercise: 'Snatches', reps: '30', weight: '40kg/30kg' }
                ],
                notes: ['Tantas rondas como sea posible']
            }
        },
        {
            id: 'open_12_1',
            name: 'Open 12.1',
            type: 'competition',
            description: 'CrossFit Open 2012 - Workout 1',
            difficulty: 'intermedio',
            timeNeeded: '7 min',
            equipment: ['barra_olimpica'],
            workout: {
                structure: '7 minutos AMRAP',
                movements: [
                    { exercise: 'Burpees', reps: '7' },
                    { exercise: 'Thrusters', reps: '7', weight: '40kg/30kg' }
                ],
                notes: ['Tantas rondas como sea posible']
            }
        }
    ],

    // WODS DE ESCALADO Y ADAPTACIÓN
    scaling: {
        levels: {
            principiante: {
                name: 'Principiante',
                description: 'Para personas que empiezan en el entrenamiento funcional',
                modifications: {
                    'Pull-ups': 'Ring Rows o Band-assisted Pull-ups',
                    'Handstand Push-ups': 'Pike Push-ups o Wall Walks',
                    'Muscle-ups': 'Ring Rows + Dips',
                    'Double-unders': 'Single-unders',
                    'Toes-to-bars': 'Knee Raises',
                    'Box Jumps': 'Step-ups',
                    'Burpees': 'Burpees modificados'
                },
                weightReduction: 0.5,
                timeExtension: 1.5
            },
            intermedio: {
                name: 'Intermedio',
                description: 'Para personas con experiencia en entrenamiento funcional',
                modifications: {
                    'Pull-ups': 'Pull-ups estándar',
                    'Handstand Push-ups': 'Handstand Push-ups con kipping',
                    'Muscle-ups': 'Muscle-ups con kipping',
                    'Double-unders': 'Double-unders',
                    'Toes-to-bars': 'Toes-to-bars',
                    'Box Jumps': 'Box Jumps',
                    'Burpees': 'Burpees estándar'
                },
                weightReduction: 0.8,
                timeExtension: 1.2
            },
            avanzado: {
                name: 'Avanzado',
                description: 'Para atletas experimentados',
                modifications: {
                    'Pull-ups': 'Strict Pull-ups',
                    'Handstand Push-ups': 'Strict Handstand Push-ups',
                    'Muscle-ups': 'Strict Muscle-ups',
                    'Double-unders': 'Double-unders',
                    'Toes-to-bars': 'Toes-to-bars',
                    'Box Jumps': 'Box Jumps',
                    'Burpees': 'Burpees estándar'
                },
                weightReduction: 1.0,
                timeExtension: 1.0
            },
            elite: {
                name: 'Élite',
                description: 'Para atletas de competición',
                modifications: {
                    'Pull-ups': 'Strict Pull-ups',
                    'Handstand Push-ups': 'Strict Handstand Push-ups',
                    'Muscle-ups': 'Strict Muscle-ups',
                    'Double-unders': 'Double-unders',
                    'Toes-to-bars': 'Toes-to-bars',
                    'Box Jumps': 'Box Jumps',
                    'Burpees': 'Burpees estándar'
                },
                weightReduction: 1.2,
                timeExtension: 0.8
            }
        },
        equipment: {
            'barra_dominadas': 'Ring Rows, Band-assisted Pull-ups, Lat Pulldown',
            'barra_olimpica': 'Dumbbells, Kettlebells, Sandbags',
            'kettlebell': 'Dumbbells, Sandbags',
            'wallball': 'Dumbbell Thrusters, Sandbag Thrusters',
            'cajón': 'Step-ups, Stairs, Bench',
            'anillas': 'Barra de dominadas, TRX',
            'remo': 'Assault Bike, Rowing Machine, Running'
        }
    }
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
