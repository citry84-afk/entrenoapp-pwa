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
        },
        {
            id: 'wide_push_ups',
            name: 'Flexiones Amplias',
            description: 'Flexiones con manos separadas para pecho',
            difficulty: 'beginner',
            equipment: ['bodyweight'],
            primaryMuscles: ['chest'],
            secondaryMuscles: ['triceps', 'shoulders'],
            instructions: [
                'Posición de plancha con manos más separadas',
                'Manos a 1.5x ancho de hombros',
                'Baja el pecho hacia el suelo',
                'Empuja hacia arriba contrayendo pecho'
            ],
            tips: ['Manos separadas', 'Enfoque en pecho'],
            videoSearch: 'flexiones amplias pecho peso corporal'
        },
        {
            id: 'decline_push_ups',
            name: 'Flexiones Declinadas',
            description: 'Flexiones con pies elevados para pecho superior',
            difficulty: 'intermediate',
            equipment: ['bodyweight'],
            primaryMuscles: ['chest_upper'],
            secondaryMuscles: ['triceps', 'shoulders'],
            instructions: [
                'Pies en banco o superficie elevada',
                'Manos en el suelo',
                'Mantén cuerpo recto',
                'Baja pecho hacia manos'
            ],
            tips: ['Pies elevados', 'Cuerpo recto'],
            videoSearch: 'flexiones declinadas pecho superior'
        },
        {
            id: 'incline_push_ups',
            name: 'Flexiones Inclinadas',
            description: 'Flexiones con manos elevadas para principiantes',
            difficulty: 'beginner',
            equipment: ['bodyweight'],
            primaryMuscles: ['chest'],
            secondaryMuscles: ['triceps', 'shoulders'],
            instructions: [
                'Manos en banco o superficie elevada',
                'Pies en el suelo',
                'Mantén cuerpo recto',
                'Baja pecho hacia manos'
            ],
            tips: ['Manos elevadas', 'Más fácil que flexiones normales'],
            videoSearch: 'flexiones inclinadas principiantes'
        },
        {
            id: 'archer_push_ups',
            name: 'Flexiones Arquero',
            description: 'Flexiones unilaterales avanzadas',
            difficulty: 'advanced',
            equipment: ['bodyweight'],
            primaryMuscles: ['chest'],
            secondaryMuscles: ['triceps', 'shoulders', 'core'],
            instructions: [
                'Posición de flexión normal',
                'Desplaza peso hacia un lado',
                'Extiende el otro brazo',
                'Baja hacia el lado cargado'
            ],
            tips: ['Movimiento unilateral', 'Muy avanzado'],
            videoSearch: 'flexiones arquero avanzadas'
        },
        {
            id: 'hindu_push_ups',
            name: 'Flexiones Hindúes',
            description: 'Flexiones dinámicas con movimiento fluido',
            difficulty: 'intermediate',
            equipment: ['bodyweight'],
            primaryMuscles: ['chest'],
            secondaryMuscles: ['shoulders', 'core', 'triceps'],
            instructions: [
                'Posición de perro boca abajo',
                'Baja hacia cobra',
                'Arquea hacia arriba',
                'Regresa a posición inicial'
            ],
            tips: ['Movimiento fluido', 'Trabaja movilidad'],
            videoSearch: 'flexiones hindúes dinámicas'
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
        },
        {
            id: 'reverse_hyperextensions',
            name: 'Hiperextensiones Inversas',
            description: 'Ejercicio para glúteos y espalda baja',
            difficulty: 'beginner',
            equipment: ['bodyweight'],
            primaryMuscles: ['back_lower'],
            secondaryMuscles: ['glutes', 'hamstrings'],
            instructions: [
                'Acuéstate boca abajo',
                'Brazos extendidos hacia adelante',
                'Levanta piernas y pecho simultáneamente',
                'Mantén la posición 2-3 segundos'
            ],
            tips: ['Movimiento controlado', 'Contrae glúteos'],
            videoSearch: 'hiperextensiones inversas espalda baja'
        },
        {
            id: 'bird_dog',
            name: 'Perro Pájaro',
            description: 'Ejercicio de estabilidad para espalda y core',
            difficulty: 'beginner',
            equipment: ['bodyweight'],
            primaryMuscles: ['back_lower'],
            secondaryMuscles: ['core', 'glutes'],
            instructions: [
                'Posición de cuatro patas',
                'Extiende brazo derecho y pierna izquierda',
                'Mantén equilibrio 3-5 segundos',
                'Alterna lados'
            ],
            tips: ['Mantén core activo', 'Movimiento controlado'],
            videoSearch: 'perro pájaro estabilidad core'
        },
        {
            id: 'cat_cow',
            name: 'Gato Vaca',
            description: 'Movilidad de columna vertebral',
            difficulty: 'beginner',
            equipment: ['bodyweight'],
            primaryMuscles: ['back_lower'],
            secondaryMuscles: ['core'],
            instructions: [
                'Posición de cuatro patas',
                'Arquea espalda hacia arriba (gato)',
                'Hunde espalda hacia abajo (vaca)',
                'Repite movimiento fluido'
            ],
            tips: ['Movimiento fluido', 'Respiración coordinada'],
            videoSearch: 'gato vaca movilidad columna'
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
        },
        {
            id: 'handstand_push_ups',
            name: 'Flexiones en Parada de Manos',
            description: 'Ejercicio avanzado para hombros',
            difficulty: 'advanced',
            equipment: ['bodyweight'],
            primaryMuscles: ['shoulders'],
            secondaryMuscles: ['triceps', 'core'],
            instructions: [
                'Parada de manos contra la pared',
                'Baja cabeza hacia el suelo',
                'Empuja hacia arriba',
                'Mantén equilibrio'
            ],
            tips: ['Muy avanzado', 'Requiere fuerza y equilibrio'],
            videoSearch: 'flexiones parada manos hombros'
        },
        {
            id: 'wall_walks',
            name: 'Caminatas en Pared',
            description: 'Progresión hacia parada de manos',
            difficulty: 'intermediate',
            equipment: ['bodyweight'],
            primaryMuscles: ['shoulders'],
            secondaryMuscles: ['core', 'triceps'],
            instructions: [
                'Posición de plancha con pies en pared',
                'Camina pies hacia arriba',
                'Acerca manos a la pared',
                'Regresa a posición inicial'
            ],
            tips: ['Progresión gradual', 'Mantén core activo'],
            videoSearch: 'caminatas pared parada manos'
        },
        {
            id: 'shoulder_taps',
            name: 'Toques de Hombro',
            description: 'Ejercicio de estabilidad para hombros',
            difficulty: 'beginner',
            equipment: ['bodyweight'],
            primaryMuscles: ['shoulders'],
            secondaryMuscles: ['core'],
            instructions: [
                'Posición de plancha',
                'Toca hombro izquierdo con mano derecha',
                'Regresa a plancha',
                'Alterna lados'
            ],
            tips: ['Mantén core firme', 'Movimiento controlado'],
            videoSearch: 'toques hombro plancha estabilidad'
        },
        {
            id: 'arm_circles',
            name: 'Círculos de Brazos',
            description: 'Calentamiento y movilidad de hombros',
            difficulty: 'beginner',
            equipment: ['bodyweight'],
            primaryMuscles: ['shoulders'],
            secondaryMuscles: [],
            instructions: [
                'De pie con brazos extendidos',
                'Haz círculos hacia adelante',
                'Cambia dirección hacia atrás',
                'Aumenta gradualmente el tamaño'
            ],
            tips: ['Movimiento controlado', 'Calentamiento ideal'],
            videoSearch: 'círculos brazos calentamiento hombros'
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
        },
        {
            id: 'bodyweight_squats',
            name: 'Sentadillas de Peso Corporal',
            description: 'Sentadillas sin peso para principiantes',
            difficulty: 'beginner',
            equipment: ['bodyweight'],
            primaryMuscles: ['quadriceps', 'glutes'],
            secondaryMuscles: ['hamstrings', 'calves', 'core'],
            instructions: [
                'Pies a anchura de hombros',
                'Brazos extendidos al frente',
                'Baja como si te sentaras',
                'Empuja desde talones para subir'
            ],
            tips: ['Rodillas en línea con pies', 'Pecho arriba'],
            videoSearch: 'sentadillas peso corporal principiantes'
        },
        {
            id: 'jump_squats',
            name: 'Sentadillas con Salto',
            description: 'Sentadillas explosivas con salto',
            difficulty: 'intermediate',
            equipment: ['bodyweight'],
            primaryMuscles: ['quadriceps', 'glutes'],
            secondaryMuscles: ['calves', 'core'],
            instructions: [
                'Posición de sentadilla',
                'Salta explosivamente hacia arriba',
                'Aterriza suavemente',
                'Inmediatamente baja a sentadilla'
            ],
            tips: ['Aterrizaje suave', 'Movimiento explosivo'],
            videoSearch: 'sentadillas salto explosivas'
        },
        {
            id: 'pistol_squats',
            name: 'Sentadillas Pistola',
            description: 'Sentadillas unilaterales avanzadas',
            difficulty: 'advanced',
            equipment: ['bodyweight'],
            primaryMuscles: ['quadriceps', 'glutes'],
            secondaryMuscles: ['core', 'calves'],
            instructions: [
                'De pie sobre una pierna',
                'Extiende la otra pierna al frente',
                'Baja en sentadilla con una pierna',
                'Empuja para volver arriba'
            ],
            tips: ['Muy avanzado', 'Requiere equilibrio'],
            videoSearch: 'sentadillas pistola unilateral'
        },
        {
            id: 'bulgarian_split_squats',
            name: 'Sentadillas Búlgaras',
            description: 'Sentadillas unilaterales con pie trasero elevado',
            difficulty: 'intermediate',
            equipment: ['bodyweight'],
            primaryMuscles: ['quadriceps', 'glutes'],
            secondaryMuscles: ['hamstrings', 'core'],
            instructions: [
                'Pie trasero en banco o superficie elevada',
                'Pie delantero adelante',
                'Baja en sentadilla unilateral',
                'Empuja con pierna delantera'
            ],
            tips: ['Pie trasero elevado', 'Enfoque en pierna delantera'],
            videoSearch: 'sentadillas búlgaras unilateral'
        },
        {
            id: 'wall_sits',
            name: 'Sentadilla en Pared',
            description: 'Isométrico para cuádriceps y glúteos',
            difficulty: 'beginner',
            equipment: ['bodyweight'],
            primaryMuscles: ['quadriceps', 'glutes'],
            secondaryMuscles: ['core'],
            instructions: [
                'Espalda contra la pared',
                'Desliza hacia abajo hasta 90°',
                'Mantén posición isométrica',
                'Presiona contra la pared'
            ],
            tips: ['Posición 90°', 'Mantén tiempo'],
            videoSearch: 'sentadilla pared isométrico'
        },
        {
            id: 'step_ups',
            name: 'Subidas al Escalón',
            description: 'Ejercicio unilateral para piernas',
            difficulty: 'beginner',
            equipment: ['bodyweight'],
            primaryMuscles: ['quadriceps', 'glutes'],
            secondaryMuscles: ['hamstrings', 'calves'],
            instructions: [
                'Pie en escalón o banco',
                'Sube con una pierna',
                'Baja controladamente',
                'Alterna piernas'
            ],
            tips: ['Movimiento controlado', 'Alterna piernas'],
            videoSearch: 'subidas escalón piernas'
        },
        {
            id: 'single_leg_glute_bridges',
            name: 'Puente de Glúteos a Una Pierna',
            description: 'Puente unilateral para glúteos',
            difficulty: 'intermediate',
            equipment: ['bodyweight'],
            primaryMuscles: ['glutes'],
            secondaryMuscles: ['hamstrings', 'core'],
            instructions: [
                'Acuéstate con una pierna extendida',
                'Otra pierna flexionada',
                'Levanta cadera con una pierna',
                'Contrae glúteos en la cima'
            ],
            tips: ['Una pierna extendida', 'Contrae glúteos'],
            videoSearch: 'puente glúteos una pierna'
        },
        {
            id: 'lateral_lunges',
            name: 'Zancadas Laterales',
            description: 'Zancadas hacia los lados para abductores',
            difficulty: 'beginner',
            equipment: ['bodyweight'],
            primaryMuscles: ['quadriceps', 'glutes'],
            secondaryMuscles: ['abductors', 'adductors'],
            instructions: [
                'De pie con pies juntos',
                'Da paso largo hacia un lado',
                'Baja en zancada lateral',
                'Empuja para volver al centro'
            ],
            tips: ['Paso lateral', 'Mantén torso erguido'],
            videoSearch: 'zancadas laterales abductores'
        },
        {
            id: 'reverse_lunges',
            name: 'Zancadas Hacia Atrás',
            description: 'Zancadas hacia atrás para mayor control',
            difficulty: 'beginner',
            equipment: ['bodyweight'],
            primaryMuscles: ['quadriceps', 'glutes'],
            secondaryMuscles: ['hamstrings', 'calves'],
            instructions: [
                'De pie con pies juntos',
                'Da paso hacia atrás',
                'Baja en zancada',
                'Empuja con pierna delantera'
            ],
            tips: ['Paso hacia atrás', 'Controla la bajada'],
            videoSearch: 'zancadas atrás control'
        },
        {
            id: 'walking_lunges',
            name: 'Zancadas Caminando',
            description: 'Zancadas dinámicas caminando',
            difficulty: 'intermediate',
            equipment: ['bodyweight'],
            primaryMuscles: ['quadriceps', 'glutes'],
            secondaryMuscles: ['hamstrings', 'calves', 'core'],
            instructions: [
                'De pie con pies juntos',
                'Da paso largo hacia adelante',
                'Baja en zancada',
                'Continúa caminando con zancadas'
            ],
            tips: ['Movimiento continuo', 'Mantén ritmo'],
            videoSearch: 'zancadas caminando dinámicas'
        },
        {
            id: 'single_leg_calf_raises',
            name: 'Elevaciones de Gemelos a Una Pierna',
            description: 'Elevaciones unilaterales de pantorrillas',
            difficulty: 'intermediate',
            equipment: ['bodyweight'],
            primaryMuscles: ['calves'],
            secondaryMuscles: [],
            instructions: [
                'De pie sobre una pierna',
                'Otra pierna flexionada',
                'Sube sobre dedos de pie',
                'Baja controladamente'
            ],
            tips: ['Una pierna', 'Movimiento controlado'],
            videoSearch: 'elevaciones gemelos una pierna'
        },
        {
            id: 'mountain_climbers',
            name: 'Escaladores de Montaña',
            description: 'Ejercicio cardiovascular para piernas y core',
            difficulty: 'intermediate',
            equipment: ['bodyweight'],
            primaryMuscles: ['quadriceps', 'glutes'],
            secondaryMuscles: ['core', 'shoulders'],
            instructions: [
                'Posición de plancha',
                'Lleva rodilla al pecho',
                'Alterna piernas rápidamente',
                'Mantén core activo'
            ],
            tips: ['Movimiento rápido', 'Core activo'],
            videoSearch: 'escaladores montaña cardio'
        },
        {
            id: 'burpees',
            name: 'Burpees',
            description: 'Ejercicio completo de cuerpo entero',
            difficulty: 'intermediate',
            equipment: ['bodyweight'],
            primaryMuscles: ['quadriceps', 'glutes'],
            secondaryMuscles: ['chest', 'shoulders', 'core'],
            instructions: [
                'De pie con pies juntos',
                'Baja a sentadilla y pon manos en suelo',
                'Salta pies hacia atrás a plancha',
                'Haz flexión, salta pies adelante y salta arriba'
            ],
            tips: ['Movimiento completo', 'Muy intenso'],
            videoSearch: 'burpees ejercicio completo'
        }
    ],

    // CORE Y ABDOMINALES
    core: [
        {
            id: 'plank',
            name: 'Plancha',
            description: 'Ejercicio isométrico fundamental para core',
            difficulty: 'beginner',
            equipment: ['bodyweight'],
            primaryMuscles: ['core'],
            secondaryMuscles: ['shoulders', 'glutes'],
            instructions: [
                'Posición de flexión con antebrazos',
                'Codos bajo hombros',
                'Mantén cuerpo recto',
                'Contrae core y glúteos'
            ],
            tips: ['Cuerpo recto', 'Respiración normal'],
            videoSearch: 'plancha core abdominales'
        },
        {
            id: 'side_plank',
            name: 'Plancha Lateral',
            description: 'Plancha de lado para oblicuos',
            difficulty: 'intermediate',
            equipment: ['bodyweight'],
            primaryMuscles: ['obliques'],
            secondaryMuscles: ['core', 'shoulders'],
            instructions: [
                'De lado con antebrazo en suelo',
                'Cuerpo en línea recta',
                'Mantén posición',
                'Alterna lados'
            ],
            tips: ['Cuerpo recto', 'No dejes caer cadera'],
            videoSearch: 'plancha lateral oblicuos'
        },
        {
            id: 'russian_twists',
            name: 'Giros Rusos',
            description: 'Ejercicio rotacional para oblicuos',
            difficulty: 'intermediate',
            equipment: ['bodyweight'],
            primaryMuscles: ['obliques'],
            secondaryMuscles: ['core'],
            instructions: [
                'Sentado con rodillas flexionadas',
                'Inclínate hacia atrás 45°',
                'Gira torso de lado a lado',
                'Mantén core activo'
            ],
            tips: ['Movimiento controlado', 'Core activo'],
            videoSearch: 'giros rusos oblicuos'
        },
        {
            id: 'bicycle_crunches',
            name: 'Crunches en Bicicleta',
            description: 'Crunches dinámicos para oblicuos',
            difficulty: 'intermediate',
            equipment: ['bodyweight'],
            primaryMuscles: ['obliques'],
            secondaryMuscles: ['core'],
            instructions: [
                'Acuéstate con manos en nuca',
                'Lleva rodilla al codo opuesto',
                'Alterna lados',
                'Mantén core activo'
            ],
            tips: ['Movimiento controlado', 'No tires del cuello'],
            videoSearch: 'crunches bicicleta oblicuos'
        },
        {
            id: 'mountain_climbers',
            name: 'Escaladores de Montaña',
            description: 'Ejercicio cardiovascular para core',
            difficulty: 'intermediate',
            equipment: ['bodyweight'],
            primaryMuscles: ['core'],
            secondaryMuscles: ['quadriceps', 'shoulders'],
            instructions: [
                'Posición de plancha',
                'Lleva rodilla al pecho',
                'Alterna piernas rápidamente',
                'Mantén core activo'
            ],
            tips: ['Movimiento rápido', 'Core activo'],
            videoSearch: 'escaladores montaña core'
        },
        {
            id: 'dead_bug',
            name: 'Bicho Muerto',
            description: 'Ejercicio de estabilidad para core',
            difficulty: 'beginner',
            equipment: ['bodyweight'],
            primaryMuscles: ['core'],
            secondaryMuscles: [],
            instructions: [
                'Acuéstate con brazos hacia arriba',
                'Rodillas a 90°',
                'Extiende brazo y pierna opuestos',
                'Regresa y alterna'
            ],
            tips: ['Movimiento controlado', 'Mantén core activo'],
            videoSearch: 'bicho muerto estabilidad core'
        },
        {
            id: 'hollow_body',
            name: 'Cuerpo Hueco',
            description: 'Isométrico avanzado para core',
            difficulty: 'advanced',
            equipment: ['bodyweight'],
            primaryMuscles: ['core'],
            secondaryMuscles: ['hip_flexors'],
            instructions: [
                'Acuéstate con brazos y piernas extendidos',
                'Levanta hombros y piernas del suelo',
                'Mantén posición hueca',
                'Respira normalmente'
            ],
            tips: ['Muy avanzado', 'Posición hueca'],
            videoSearch: 'cuerpo hueco core avanzado'
        },
        {
            id: 'leg_raises',
            name: 'Elevaciones de Piernas',
            description: 'Ejercicio para abdominales inferiores',
            difficulty: 'intermediate',
            equipment: ['bodyweight'],
            primaryMuscles: ['lower_abs'],
            secondaryMuscles: ['hip_flexors'],
            instructions: [
                'Acuéstate con manos bajo glúteos',
                'Levanta piernas rectas',
                'Hasta 90° o más',
                'Baja controladamente'
            ],
            tips: ['Piernas rectas', 'Movimiento controlado'],
            videoSearch: 'elevaciones piernas abdominales'
        },
        {
            id: 'flutter_kicks',
            name: 'Patadas Alternadas',
            description: 'Ejercicio dinámico para core',
            difficulty: 'intermediate',
            equipment: ['bodyweight'],
            primaryMuscles: ['core'],
            secondaryMuscles: ['hip_flexors'],
            instructions: [
                'Acuéstate con manos bajo glúteos',
                'Levanta piernas ligeramente',
                'Alterna patadas pequeñas',
                'Mantén core activo'
            ],
            tips: ['Patadas pequeñas', 'Core activo'],
            videoSearch: 'patadas alternadas core'
        },
        {
            id: 'bear_crawl',
            name: 'Gateo de Oso',
            description: 'Ejercicio de movilidad para core',
            difficulty: 'intermediate',
            equipment: ['bodyweight'],
            primaryMuscles: ['core'],
            secondaryMuscles: ['shoulders', 'quadriceps'],
            instructions: [
                'Posición de cuatro patas',
                'Rodillas ligeramente elevadas',
                'Gatea hacia adelante y atrás',
                'Mantén core activo'
            ],
            tips: ['Rodillas elevadas', 'Core activo'],
            videoSearch: 'gateo oso movilidad core'
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
