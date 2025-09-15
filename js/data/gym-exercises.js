// Base de datos completa de ejercicios de gimnasio para EntrenoApp
// Basado en ciencia del entrenamiento y mejores prácticas 2024

// ===================================
// EJERCICIOS POR GRUPO MUSCULAR
// ===================================

export const GYM_EXERCISES = {
    // PECHO
    chest: [
        {
            id: 'bench_press',
            name: 'Press de Banca',
            description: 'Ejercicio fundamental para desarrollo del pecho',
            difficulty: 'intermediate',
            equipment: ['barbell', 'bench'],
            primaryMuscles: ['chest'],
            secondaryMuscles: ['triceps', 'shoulders'],
            instructions: [
                'Acuéstate en el banco con los pies firmes en el suelo',
                'Agarra la barra con un agarre más ancho que los hombros',
                'Baja la barra controladamente hasta el pecho',
                'Empuja explosivamente hasta extensión completa'
            ],
            tips: ['Mantén los omóplatos retraídos', 'No rebotes la barra en el pecho'],
            videoSearch: 'press banca técnica correcta gym'
        },
        {
            id: 'incline_dumbbell_press',
            name: 'Press Inclinado con Mancuernas',
            description: 'Enfoque en pectoral superior',
            difficulty: 'intermediate',
            equipment: ['dumbbells', 'incline_bench'],
            primaryMuscles: ['chest_upper'],
            secondaryMuscles: ['triceps', 'shoulders'],
            instructions: [
                'Ajusta el banco a 30-45 grados',
                'Sujeta las mancuernas con agarre neutro',
                'Baja controladamente hasta sentir estiramiento',
                'Empuja hacia arriba contrayendo el pecho'
            ],
            tips: ['Banco entre 30-45°', 'Controla la bajada'],
            videoSearch: 'press inclinado mancuernas pecho superior gym'
        },
        {
            id: 'dips',
            name: 'Fondos en Paralelas',
            description: 'Ejercicio compuesto para pecho inferior',
            difficulty: 'intermediate',
            equipment: ['parallel_bars'],
            primaryMuscles: ['chest_lower'],
            secondaryMuscles: ['triceps', 'shoulders'],
            instructions: [
                'Agárrate a las barras paralelas',
                'Baja el cuerpo flexionando los codos',
                'Inclínate ligeramente hacia adelante',
                'Empuja hasta posición inicial'
            ],
            tips: ['Inclínate para enfocar pecho', 'Controla la bajada'],
            videoSearch: 'fondos paralelas pecho gym'
        },
        {
            id: 'dumbbell_flyes',
            name: 'Aperturas con Mancuernas',
            description: 'Aislamiento y estiramiento del pecho',
            difficulty: 'beginner',
            equipment: ['dumbbells', 'bench'],
            primaryMuscles: ['chest'],
            secondaryMuscles: [],
            instructions: [
                'Acuéstate con mancuernas sobre el pecho',
                'Abre los brazos en arco amplio',
                'Baja hasta sentir estiramiento',
                'Cierra el arco contrayendo el pecho'
            ],
            tips: ['Mantén ligera flexión en codos', 'Movimiento fluido'],
            videoSearch: 'aperturas mancuernas pecho gym'
        },
        {
            id: 'push_ups',
            name: 'Flexiones',
            description: 'Ejercicio básico de peso corporal',
            difficulty: 'beginner',
            equipment: ['bodyweight'],
            primaryMuscles: ['chest'],
            secondaryMuscles: ['triceps', 'shoulders', 'core'],
            instructions: [
                'Posición de plancha con manos bajo hombros',
                'Baja el pecho hacia el suelo',
                'Mantén el cuerpo recto',
                'Empuja hasta posición inicial'
            ],
            tips: ['Núcleo firme', 'Rango completo de movimiento'],
            videoSearch: 'flexiones técnica correcta'
        },
        {
            id: 'pike_push_ups',
            name: 'Flexiones Pike',
            description: 'Flexiones con elevación de cadera para hombros',
            difficulty: 'intermediate',
            equipment: ['bodyweight'],
            primaryMuscles: ['shoulders'],
            secondaryMuscles: ['triceps', 'core'],
            instructions: [
                'Posición de plancha con cadera elevada',
                'Forma una V invertida con el cuerpo',
                'Baja la cabeza hacia el suelo',
                'Empuja hacia arriba manteniendo la posición'
            ],
            tips: ['Cadera alta', 'Movimiento controlado'],
            videoSearch: 'flexiones pike hombros peso corporal'
        },
        {
            id: 'diamond_push_ups',
            name: 'Flexiones Diamante',
            description: 'Flexiones con manos juntas para tríceps',
            difficulty: 'intermediate',
            equipment: ['bodyweight'],
            primaryMuscles: ['triceps'],
            secondaryMuscles: ['chest', 'shoulders'],
            instructions: [
                'Posición de plancha con manos juntas',
                'Forma un diamante con los dedos',
                'Baja el pecho hacia las manos',
                'Empuja hacia arriba contrayendo tríceps'
            ],
            tips: ['Manos juntas', 'Enfoque en tríceps'],
            videoSearch: 'flexiones diamante tríceps peso corporal'
        }
    ],

    // ESPALDA
    back: [
        {
            id: 'deadlift',
            name: 'Peso Muerto',
            description: 'Rey de los ejercicios para espalda y cadena posterior',
            difficulty: 'advanced',
            equipment: ['barbell'],
            primaryMuscles: ['back_lower', 'glutes'],
            secondaryMuscles: ['hamstrings', 'traps', 'rhomboids'],
            instructions: [
                'Pies a anchura de cadera, barra sobre medios pies',
                'Agarra la barra con agarre mixto o doble prono',
                'Pecho arriba, espalda neutra',
                'Levanta extendiendo cadera y rodillas simultáneamente'
            ],
            tips: ['Espalda siempre neutra', 'Fuerza desde talones'],
            videoSearch: 'peso muerto técnica correcta gym'
        },
        {
            id: 'pull_ups',
            name: 'Dominadas',
            description: 'Ejercicio fundamental para dorsal ancho',
            difficulty: 'intermediate',
            equipment: ['pull_up_bar'],
            primaryMuscles: ['back_upper'],
            secondaryMuscles: ['biceps', 'rhomboids'],
            instructions: [
                'Agarra la barra con palmas hacia afuera',
                'Cuelga con brazos completamente extendidos',
                'Tira hasta que barbilla pase la barra',
                'Baja controladamente'
            ],
            tips: ['Movimiento controlado', 'Activar dorsales'],
            videoSearch: 'dominadas técnica correcta'
        },
        {
            id: 'barbell_row',
            name: 'Remo con Barra',
            description: 'Desarrollo de espalda media y grosor',
            difficulty: 'intermediate',
            equipment: ['barbell'],
            primaryMuscles: ['back_middle'],
            secondaryMuscles: ['biceps', 'rhomboids', 'rear_delts'],
            instructions: [
                'Posición inclinada con barra en manos',
                'Mantén espalda neutra',
                'Tira de la barra hacia abdomen',
                'Contrae omóplatos en la parte superior'
            ],
            tips: ['No uses impulso', 'Aprieta omóplatos'],
            videoSearch: 'remo barra espalda gym'
        },
        {
            id: 'lat_pulldown',
            name: 'Jalón al Pecho',
            description: 'Alternativa a dominadas para desarrollar dorsales',
            difficulty: 'beginner',
            equipment: ['cable_machine'],
            primaryMuscles: ['back_upper'],
            secondaryMuscles: ['biceps', 'rhomboids'],
            instructions: [
                'Siéntate con muslos bajo almohadillas',
                'Agarra la barra más ancho que hombros',
                'Tira hacia el pecho superior',
                'Controla la subida'
            ],
            tips: ['Pecho hacia fuera', 'No uses impulso'],
            videoSearch: 'jalón pecho dorsales gym'
        },
        {
            id: 'seated_cable_row',
            name: 'Remo en Polea Baja',
            description: 'Ejercicio para espalda media con control total',
            difficulty: 'beginner',
            equipment: ['cable_machine'],
            primaryMuscles: ['back_middle'],
            secondaryMuscles: ['biceps', 'rhomboids'],
            instructions: [
                'Siéntate con piernas ligeramente flexionadas',
                'Agarra el mango con ambas manos',
                'Tira hacia abdomen manteniendo torso erguido',
                'Aprieta omóplatos al final'
            ],
            tips: ['Torso estable', 'Movimiento controlado'],
            videoSearch: 'remo polea baja espalda gym'
        },
        {
            id: 'inverted_rows',
            name: 'Remo Invertido',
            description: 'Ejercicio de peso corporal para espalda',
            difficulty: 'beginner',
            equipment: ['bodyweight'],
            primaryMuscles: ['back_middle'],
            secondaryMuscles: ['biceps', 'rhomboids'],
            instructions: [
                'Acuéstate bajo una barra o mesa',
                'Agarra la barra con agarre supino',
                'Mantén cuerpo recto',
                'Tira del pecho hacia la barra'
            ],
            tips: ['Cuerpo recto', 'Contrae omóplatos'],
            videoSearch: 'remo invertido peso corporal espalda'
        },
        {
            id: 'superman',
            name: 'Superman',
            description: 'Ejercicio de extensión lumbar',
            difficulty: 'beginner',
            equipment: ['bodyweight'],
            primaryMuscles: ['back_lower'],
            secondaryMuscles: ['glutes', 'rhomboids'],
            instructions: [
                'Acuéstate boca abajo',
                'Extiende brazos hacia adelante',
                'Levanta pecho y piernas simultáneamente',
                'Mantén la posición 2-3 segundos'
            ],
            tips: ['Movimiento controlado', 'Respiración normal'],
            videoSearch: 'superman ejercicio espalda baja'
        }
    ],

    // HOMBROS
    shoulders: [
        {
            id: 'overhead_press',
            name: 'Press Militar',
            description: 'Ejercicio fundamental para hombros',
            difficulty: 'intermediate',
            equipment: ['barbell'],
            primaryMuscles: ['shoulders'],
            secondaryMuscles: ['triceps', 'core'],
            instructions: [
                'De pie con barra a altura de hombros',
                'Agarre más ancho que hombros',
                'Empuja la barra directamente hacia arriba',
                'Bloquea brazos arriba'
            ],
            tips: ['Núcleo firme', 'Trayectoria recta'],
            videoSearch: 'press militar hombros gym'
        },
        {
            id: 'lateral_raises',
            name: 'Elevaciones Laterales',
            description: 'Aislamiento para deltoides lateral',
            difficulty: 'beginner',
            equipment: ['dumbbells'],
            primaryMuscles: ['shoulders_lateral'],
            secondaryMuscles: [],
            instructions: [
                'De pie con mancuernas a los lados',
                'Eleva brazos hasta altura de hombros',
                'Mantén ligera flexión en codos',
                'Baja controladamente'
            ],
            tips: ['No uses impulso', 'Pausa arriba'],
            videoSearch: 'elevaciones laterales hombros gym'
        },
        {
            id: 'rear_delt_flyes',
            name: 'Aperturas Posteriores',
            description: 'Desarrollo del deltoides posterior',
            difficulty: 'beginner',
            equipment: ['dumbbells'],
            primaryMuscles: ['shoulders_rear'],
            secondaryMuscles: ['rhomboids'],
            instructions: [
                'Inclinado con mancuernas colgando',
                'Abre brazos hacia los lados',
                'Aprieta omóplatos',
                'Controla la bajada'
            ],
            tips: ['Mantén pecho hacia afuera', 'Movimiento controlado'],
            videoSearch: 'aperturas posteriores deltoides gym'
        },
        {
            id: 'front_raises',
            name: 'Elevaciones Frontales',
            description: 'Aislamiento del deltoides anterior',
            difficulty: 'beginner',
            equipment: ['dumbbells'],
            primaryMuscles: ['shoulders_front'],
            secondaryMuscles: [],
            instructions: [
                'De pie con mancuernas al frente',
                'Eleva un brazo hacia adelante',
                'Hasta altura de hombro',
                'Alterna brazos'
            ],
            tips: ['No uses impulso', 'Controla todo el rango'],
            videoSearch: 'elevaciones frontales hombros gym'
        },
        {
            id: 'shrugs',
            name: 'Encogimientos',
            description: 'Desarrollo del trapecio superior',
            difficulty: 'beginner',
            equipment: ['dumbbells'],
            primaryMuscles: ['traps'],
            secondaryMuscles: [],
            instructions: [
                'De pie con mancuernas a los lados',
                'Encoge hombros hacia arriba',
                'Mantén brazos relajados',
                'Baja lentamente'
            ],
            tips: ['Solo movimiento vertical', 'Pausa arriba'],
            videoSearch: 'encogimientos trapecio gym'
        },
        {
            id: 'reverse_plank',
            name: 'Plancha Inversa',
            description: 'Ejercicio de peso corporal para hombros posteriores',
            difficulty: 'intermediate',
            equipment: ['bodyweight'],
            primaryMuscles: ['shoulders_rear'],
            secondaryMuscles: ['triceps', 'core'],
            instructions: [
                'Siéntate con piernas extendidas',
                'Apoya manos detrás de la cadera',
                'Levanta cadera hacia arriba',
                'Mantén cuerpo recto'
            ],
            tips: ['Cuerpo recto', 'Hombros estables'],
            videoSearch: 'plancha inversa hombros peso corporal'
        }
    ],

    // BRAZOS
    arms: [
        {
            id: 'barbell_curl',
            name: 'Curl con Barra',
            description: 'Ejercicio básico para bíceps',
            difficulty: 'beginner',
            equipment: ['barbell'],
            primaryMuscles: ['biceps'],
            secondaryMuscles: ['forearms'],
            instructions: [
                'De pie con barra en posición baja',
                'Codos pegados al torso',
                'Flexiona antebrazos hacia arriba',
                'Controla la bajada'
            ],
            tips: ['No uses impulso', 'Rango completo'],
            videoSearch: 'curl barra bíceps gym'
        },
        {
            id: 'hammer_curls',
            name: 'Curl Martillo',
            description: 'Desarrollo del bíceps y braquial',
            difficulty: 'beginner',
            equipment: ['dumbbells'],
            primaryMuscles: ['biceps', 'brachialis'],
            secondaryMuscles: ['forearms'],
            instructions: [
                'De pie con mancuernas en agarre neutro',
                'Flexiona alternando brazos',
                'Mantén codos estables',
                'Controla la bajada'
            ],
            tips: ['Agarre neutro', 'Movimiento controlado'],
            videoSearch: 'curl martillo bíceps gym'
        },
        {
            id: 'tricep_dips',
            name: 'Fondos de Tríceps',
            description: 'Ejercicio compuesto para tríceps',
            difficulty: 'intermediate',
            equipment: ['bench'],
            primaryMuscles: ['triceps'],
            secondaryMuscles: ['shoulders'],
            instructions: [
                'Manos en borde del banco',
                'Pies apoyados al frente',
                'Baja flexionando codos',
                'Empuja hasta extensión'
            ],
            tips: ['Codos hacia atrás', 'Rango controlado'],
            videoSearch: 'fondos tríceps banco gym'
        },
        {
            id: 'close_grip_press',
            name: 'Press Cerrado',
            description: 'Desarrollo de tríceps con barra',
            difficulty: 'intermediate',
            equipment: ['barbell', 'bench'],
            primaryMuscles: ['triceps'],
            secondaryMuscles: ['chest', 'shoulders'],
            instructions: [
                'Como press banca pero agarre cerrado',
                'Manos a anchura de hombros',
                'Baja a pecho manteniendo codos cerca',
                'Empuja enfocando tríceps'
            ],
            tips: ['Codos pegados', 'Agarre firme'],
            videoSearch: 'press banca agarre cerrado tríceps gym'
        },
        {
            id: 'overhead_tricep_extension',
            name: 'Extensión de Tríceps',
            description: 'Aislamiento del tríceps',
            difficulty: 'beginner',
            equipment: ['dumbbell'],
            primaryMuscles: ['triceps'],
            secondaryMuscles: [],
            instructions: [
                'Sentado con mancuerna sobre cabeza',
                'Baja mancuerna detrás de la cabeza',
                'Solo mueve antebrazos',
                'Extiende hasta arriba'
            ],
            tips: ['Codos estables', 'Rango completo'],
            videoSearch: 'extensión tríceps mancuerna gym'
        }
    ],

    // PIERNAS
    legs: [
        {
            id: 'squats',
            name: 'Sentadillas',
            description: 'Rey de ejercicios para piernas',
            difficulty: 'intermediate',
            equipment: ['barbell'],
            primaryMuscles: ['quadriceps', 'glutes'],
            secondaryMuscles: ['hamstrings', 'calves', 'core'],
            instructions: [
                'Barra en trapecio superior',
                'Pies a anchura de hombros',
                'Baja como si te sentaras',
                'Empuja desde talones para subir'
            ],
            tips: ['Rodillas en línea con pies', 'Pecho arriba'],
            videoSearch: 'sentadillas técnica correcta gym'
        },
        {
            id: 'leg_press',
            name: 'Prensa de Piernas',
            description: 'Desarrollo seguro de cuádriceps',
            difficulty: 'beginner',
            equipment: ['leg_press_machine'],
            primaryMuscles: ['quadriceps'],
            secondaryMuscles: ['glutes', 'hamstrings'],
            instructions: [
                'Sentado en máquina con pies en plataforma',
                'Baja peso flexionando rodillas',
                'Hasta 90 grados',
                'Empuja hasta extensión'
            ],
            tips: ['Rango controlado', 'No bloquees rodillas'],
            videoSearch: 'prensa piernas cuádriceps gym'
        },
        {
            id: 'lunges',
            name: 'Zancadas',
            description: 'Ejercicio unilateral para piernas',
            difficulty: 'intermediate',
            equipment: ['dumbbells'],
            primaryMuscles: ['quadriceps', 'glutes'],
            secondaryMuscles: ['hamstrings', 'calves'],
            instructions: [
                'De pie con mancuernas',
                'Da paso largo hacia adelante',
                'Baja hasta que ambas rodillas estén a 90°',
                'Empuja para volver'
            ],
            tips: ['Mantén torso erguido', 'No toques suelo con rodilla'],
            videoSearch: 'zancadas mancuernas piernas gym'
        },
        {
            id: 'leg_curls',
            name: 'Curl de Piernas',
            description: 'Aislamiento de isquiotibiales',
            difficulty: 'beginner',
            equipment: ['leg_curl_machine'],
            primaryMuscles: ['hamstrings'],
            secondaryMuscles: [],
            instructions: [
                'Acostado boca abajo en máquina',
                'Almohadilla en talones',
                'Flexiona piernas hacia glúteos',
                'Controla la bajada'
            ],
            tips: ['Movimiento controlado', 'Contrae en la cima'],
            videoSearch: 'curl piernas isquiotibiales gym'
        },
        {
            id: 'calf_raises',
            name: 'Elevaciones de Gemelos',
            description: 'Desarrollo de pantorrillas',
            difficulty: 'beginner',
            equipment: ['calf_raise_machine'],
            primaryMuscles: ['calves'],
            secondaryMuscles: [],
            instructions: [
                'De pie en máquina o escalón',
                'Sube sobre dedos de pies',
                'Mantén contracción arriba',
                'Baja sintiendo estiramiento'
            ],
            tips: ['Rango completo', 'Pausa arriba'],
            videoSearch: 'elevaciones gemelos pantorrillas gym'
        }
    ]
};

// ===================================
// RUTINAS INTELIGENTES POR FRECUENCIA
// ===================================

export const GYM_ROUTINES = {
    // 2 DÍAS POR SEMANA - FULL BODY
    '2_days': {
        name: 'Full Body 2x Semana',
        description: 'Rutina de cuerpo completo para máxima eficiencia',
        sessions: [
            {
                day: 1,
                name: 'Full Body A',
                exercises: [
                    { exerciseId: 'squats', sets: 3, reps: '8-12', rest: 180 },
                    { exerciseId: 'bench_press', sets: 3, reps: '8-12', rest: 180 },
                    { exerciseId: 'barbell_row', sets: 3, reps: '8-12', rest: 180 },
                    { exerciseId: 'overhead_press', sets: 3, reps: '8-12', rest: 120 },
                    { exerciseId: 'barbell_curl', sets: 2, reps: '10-15', rest: 90 },
                    { exerciseId: 'tricep_dips', sets: 2, reps: '10-15', rest: 90 }
                ]
            },
            {
                day: 2,
                name: 'Full Body B',
                exercises: [
                    { exerciseId: 'deadlift', sets: 3, reps: '5-8', rest: 180 },
                    { exerciseId: 'incline_dumbbell_press', sets: 3, reps: '8-12', rest: 180 },
                    { exerciseId: 'pull_ups', sets: 3, reps: '6-12', rest: 180 },
                    { exerciseId: 'lunges', sets: 3, reps: '10-15', rest: 120 },
                    { exerciseId: 'lateral_raises', sets: 3, reps: '12-18', rest: 90 },
                    { exerciseId: 'hammer_curls', sets: 2, reps: '10-15', rest: 90 }
                ]
            }
        ]
    },

    // 3 DÍAS POR SEMANA - PUSH/PULL/LEGS
    '3_days': {
        name: 'Push/Pull/Legs',
        description: 'División clásica y eficiente',
        sessions: [
            {
                day: 1,
                name: 'Push (Empuje)',
                exercises: [
                    { exerciseId: 'bench_press', sets: 4, reps: '6-10', rest: 180 },
                    { exerciseId: 'incline_dumbbell_press', sets: 3, reps: '8-12', rest: 150 },
                    { exerciseId: 'overhead_press', sets: 3, reps: '8-12', rest: 150 },
                    { exerciseId: 'dips', sets: 3, reps: '8-15', rest: 120 },
                    { exerciseId: 'lateral_raises', sets: 3, reps: '12-18', rest: 90 },
                    { exerciseId: 'close_grip_press', sets: 3, reps: '8-12', rest: 120 },
                    { exerciseId: 'overhead_tricep_extension', sets: 3, reps: '10-15', rest: 90 }
                ]
            },
            {
                day: 2,
                name: 'Pull (Tirón)',
                exercises: [
                    { exerciseId: 'deadlift', sets: 4, reps: '5-8', rest: 180 },
                    { exerciseId: 'pull_ups', sets: 4, reps: '6-12', rest: 150 },
                    { exerciseId: 'barbell_row', sets: 3, reps: '8-12', rest: 150 },
                    { exerciseId: 'lat_pulldown', sets: 3, reps: '10-15', rest: 120 },
                    { exerciseId: 'seated_cable_row', sets: 3, reps: '10-15', rest: 120 },
                    { exerciseId: 'barbell_curl', sets: 3, reps: '8-12', rest: 90 },
                    { exerciseId: 'hammer_curls', sets: 3, reps: '10-15', rest: 90 },
                    { exerciseId: 'shrugs', sets: 3, reps: '12-18', rest: 90 }
                ]
            },
            {
                day: 3,
                name: 'Legs (Piernas)',
                exercises: [
                    { exerciseId: 'squats', sets: 4, reps: '6-10', rest: 180 },
                    { exerciseId: 'leg_press', sets: 3, reps: '12-20', rest: 150 },
                    { exerciseId: 'lunges', sets: 3, reps: '10-15', rest: 120 },
                    { exerciseId: 'leg_curls', sets: 4, reps: '10-15', rest: 120 },
                    { exerciseId: 'calf_raises', sets: 4, reps: '15-25', rest: 90 }
                ]
            }
        ]
    },

    // 4 DÍAS POR SEMANA - UPPER/LOWER
    '4_days': {
        name: 'Upper/Lower Split',
        description: 'División superior/inferior para mayor volumen',
        sessions: [
            {
                day: 1,
                name: 'Upper A (Pecho enfoque)',
                exercises: [
                    { exerciseId: 'bench_press', sets: 4, reps: '6-10', rest: 180 },
                    { exerciseId: 'barbell_row', sets: 4, reps: '6-10', rest: 180 },
                    { exerciseId: 'incline_dumbbell_press', sets: 3, reps: '8-12', rest: 150 },
                    { exerciseId: 'pull_ups', sets: 3, reps: '6-12', rest: 150 },
                    { exerciseId: 'overhead_press', sets: 3, reps: '8-12', rest: 120 },
                    { exerciseId: 'barbell_curl', sets: 3, reps: '8-12', rest: 90 },
                    { exerciseId: 'close_grip_press', sets: 3, reps: '8-12', rest: 90 }
                ]
            },
            {
                day: 2,
                name: 'Lower A (Cuádriceps enfoque)',
                exercises: [
                    { exerciseId: 'squats', sets: 4, reps: '6-10', rest: 180 },
                    { exerciseId: 'leg_curls', sets: 4, reps: '10-15', rest: 120 },
                    { exerciseId: 'leg_press', sets: 3, reps: '12-20', rest: 150 },
                    { exerciseId: 'lunges', sets: 3, reps: '10-15', rest: 120 },
                    { exerciseId: 'calf_raises', sets: 4, reps: '15-25', rest: 90 }
                ]
            },
            {
                day: 3,
                name: 'Upper B (Espalda enfoque)',
                exercises: [
                    { exerciseId: 'deadlift', sets: 4, reps: '5-8', rest: 180 },
                    { exerciseId: 'incline_dumbbell_press', sets: 3, reps: '8-12', rest: 150 },
                    { exerciseId: 'lat_pulldown', sets: 4, reps: '8-12', rest: 150 },
                    { exerciseId: 'dips', sets: 3, reps: '8-15', rest: 120 },
                    { exerciseId: 'seated_cable_row', sets: 3, reps: '10-15', rest: 120 },
                    { exerciseId: 'lateral_raises', sets: 3, reps: '12-18', rest: 90 },
                    { exerciseId: 'hammer_curls', sets: 3, reps: '10-15', rest: 90 },
                    { exerciseId: 'overhead_tricep_extension', sets: 3, reps: '10-15', rest: 90 }
                ]
            },
            {
                day: 4,
                name: 'Lower B (Posterior enfoque)',
                exercises: [
                    { exerciseId: 'deadlift', sets: 3, reps: '6-10', rest: 180 },
                    { exerciseId: 'squats', sets: 3, reps: '8-12', rest: 180 },
                    { exerciseId: 'leg_curls', sets: 4, reps: '10-15', rest: 120 },
                    { exerciseId: 'lunges', sets: 3, reps: '12-18', rest: 120 },
                    { exerciseId: 'calf_raises', sets: 4, reps: '15-25', rest: 90 }
                ]
            }
        ]
    },

    // 5+ DÍAS POR SEMANA - BRO SPLIT
    '5_days': {
        name: 'Bro Split',
        description: 'División por grupos musculares específicos',
        sessions: [
            {
                day: 1,
                name: 'Pecho',
                exercises: [
                    { exerciseId: 'bench_press', sets: 4, reps: '6-10', rest: 180 },
                    { exerciseId: 'incline_dumbbell_press', sets: 4, reps: '8-12', rest: 150 },
                    { exerciseId: 'dips', sets: 3, reps: '8-15', rest: 120 },
                    { exerciseId: 'dumbbell_flyes', sets: 3, reps: '10-15', rest: 120 },
                    { exerciseId: 'push_ups', sets: 3, reps: 'al fallo', rest: 90 }
                ]
            },
            {
                day: 2,
                name: 'Espalda',
                exercises: [
                    { exerciseId: 'deadlift', sets: 4, reps: '5-8', rest: 180 },
                    { exerciseId: 'pull_ups', sets: 4, reps: '6-12', rest: 150 },
                    { exerciseId: 'barbell_row', sets: 4, reps: '8-12', rest: 150 },
                    { exerciseId: 'lat_pulldown', sets: 3, reps: '10-15', rest: 120 },
                    { exerciseId: 'seated_cable_row', sets: 3, reps: '10-15', rest: 120 },
                    { exerciseId: 'shrugs', sets: 3, reps: '12-18', rest: 90 }
                ]
            },
            {
                day: 3,
                name: 'Hombros',
                exercises: [
                    { exerciseId: 'overhead_press', sets: 4, reps: '6-10', rest: 180 },
                    { exerciseId: 'lateral_raises', sets: 4, reps: '12-18', rest: 90 },
                    { exerciseId: 'rear_delt_flyes', sets: 4, reps: '12-18', rest: 90 },
                    { exerciseId: 'front_raises', sets: 3, reps: '10-15', rest: 90 },
                    { exerciseId: 'shrugs', sets: 3, reps: '12-18', rest: 90 }
                ]
            },
            {
                day: 4,
                name: 'Brazos',
                exercises: [
                    { exerciseId: 'close_grip_press', sets: 4, reps: '8-12', rest: 120 },
                    { exerciseId: 'barbell_curl', sets: 4, reps: '8-12', rest: 120 },
                    { exerciseId: 'tricep_dips', sets: 3, reps: '8-15', rest: 120 },
                    { exerciseId: 'hammer_curls', sets: 3, reps: '10-15', rest: 90 },
                    { exerciseId: 'overhead_tricep_extension', sets: 3, reps: '10-15', rest: 90 }
                ]
            },
            {
                day: 5,
                name: 'Piernas',
                exercises: [
                    { exerciseId: 'squats', sets: 4, reps: '6-10', rest: 180 },
                    { exerciseId: 'leg_press', sets: 4, reps: '12-20', rest: 150 },
                    { exerciseId: 'leg_curls', sets: 4, reps: '10-15', rest: 120 },
                    { exerciseId: 'lunges', sets: 3, reps: '10-15', rest: 120 },
                    { exerciseId: 'calf_raises', sets: 4, reps: '15-25', rest: 90 }
                ]
            }
        ]
    }
};

// ===================================
// ADAPTACIONES POR NIVEL
// ===================================

export const LEVEL_ADJUSTMENTS = {
    beginner: {
        setsMultiplier: 0.75,
        repsAdjustment: -2,
        restMultiplier: 1.2,
        exerciseComplexity: 'simple'
    },
    intermediate: {
        setsMultiplier: 1,
        repsAdjustment: 0,
        restMultiplier: 1,
        exerciseComplexity: 'moderate'
    },
    advanced: {
        setsMultiplier: 1.25,
        repsAdjustment: 2,
        restMultiplier: 0.9,
        exerciseComplexity: 'complex'
    }
};

// ===================================
// OBJETIVOS ESPECÍFICOS
// ===================================

export const TRAINING_GOALS = {
    strength: {
        name: 'Fuerza',
        repsRange: '3-6',
        setsRange: '3-5',
        restTime: '180-300',
        intensity: 'high'
    },
    hypertrophy: {
        name: 'Hipertrofia',
        repsRange: '8-12',
        setsRange: '3-4',
        restTime: '90-150',
        intensity: 'moderate-high'
    },
    endurance: {
        name: 'Resistencia',
        repsRange: '12-20',
        setsRange: '2-3',
        restTime: '60-90',
        intensity: 'moderate'
    },
    toning: {
        name: 'Tonificación',
        repsRange: '10-15',
        setsRange: '2-3',
        restTime: '60-120',
        intensity: 'moderate'
    }
};
