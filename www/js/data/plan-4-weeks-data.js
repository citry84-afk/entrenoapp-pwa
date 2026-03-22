/**
 * Plan 4 semanas - 5 días (Pull, Push, Pierna, Hombros+Core, CrossFit/MetCon)
 * Progresión: semanas 1-3 subir reps/peso, semana 4 descarga
 */
export const PLAN_4_WEEKS = {
  noteOrder: 'Puedes cambiar el orden de los días según el gym esté lleno o no.',
  progression: {
    weeks1to3: 'Semanas 1–3: intenta subir reps o peso',
    week4: 'Semana 4: descarga — 20–30% menos volumen, 1–2 reps en recámara, WOD más suave'
  },
  days: [
    {
      id: 1,
      name: 'Pull',
      subtitle: 'Espalda + Bíceps',
      goal: 'Espalda fuerte y densa, buena tracción para CrossFit.',
      exercises: [
        { name: 'Dominadas o jalón', sets: '4×6–10' },
        { name: 'Remo con barra o mancuerna', sets: '4×8' },
        { name: 'Jalón agarre neutro', sets: '3×10' },
        { name: 'Curl bíceps barra o mancuernas', sets: '3×8–12' }
      ],
      miniWod: {
        type: 'EMOM',
        duration: 8,
        unit: 'min',
        description: 'EMOM 8\'',
        rounds: [
          'Min 1: 12 KB swings',
          'Min 2: 10 sit-ups'
        ]
      }
    },
    {
      id: 2,
      name: 'Push',
      subtitle: 'Pecho + Tríceps',
      goal: 'Masa y fuerza de empuje.',
      exercises: [
        { name: 'Press banca plano', sets: '4×6–8' },
        { name: 'Press inclinado mancuernas', sets: '3×8–10' },
        { name: 'Fondos en paralelas', sets: '3×8–12' },
        { name: 'Tríceps en polea', sets: '3×10–12' }
      ],
      miniWod: {
        type: 'AMRAP',
        duration: 6,
        unit: 'min',
        description: 'AMRAP 6\'',
        rounds: ['10 flexiones', '10 wall balls', '10 box jumps']
      }
    },
    {
      id: 3,
      name: 'Pierna',
      subtitle: '',
      goal: 'Base fuerte para correr, saltar y WODs.',
      exercises: [
        { name: 'Prensa o sentadilla goblet/hack', sets: '4×8–10' },
        { name: 'Peso muerto rumano', sets: '4×8' },
        { name: 'Zancadas o step-ups', sets: '3×10/10' },
        { name: 'Curl femoral', sets: '3×10–12' },
        { name: 'Gemelos', sets: '3×12–15' }
      ],
      miniWod: {
        type: 'AMRAP',
        duration: 6,
        unit: 'min',
        description: 'AMRAP 6\'',
        rounds: ['10 air squats', '10 KB swings', '200 m remo o 30" bici']
      }
    },
    {
      id: 4,
      name: 'Hombros + Core',
      subtitle: '',
      goal: 'Hombro estable, fuerte y resistente.',
      exercises: [
        { name: 'Press hombro mancuernas', sets: '4×6–8' },
        { name: 'Elevaciones laterales', sets: '4×12–15' },
        { name: 'Face pull', sets: '3×15' },
        { name: 'Deltoide posterior / pájaros', sets: '3×12' },
        { name: 'Core: Plancha', sets: '3×40–50"' },
        { name: 'Core: Elevaciones de piernas', sets: '3×12' },
        { name: 'Core: Russian twist', sets: '3×20' }
      ],
      miniWod: {
        type: 'FOR_TIME',
        cap: 6,
        unit: 'min',
        description: 'For time (cap 6\')',
        rounds: ['20 DB snatch alternos', '20 push-ups', '20 air squats']
      }
    },
    {
      id: 5,
      name: 'CrossFit / MetCon',
      subtitle: '',
      goal: '',
      exercises: [],
      weekVariations: true,
      weekWods: [
        {
          week: 1,
          label: 'Semana 1',
          type: 'FOR_TIME',
          cap: 25,
          unit: 'min',
          description: 'For Time (cap 22–25\')',
          rounds: ['500 m remo', '40 wall balls', '30 goblet squats', '20 burpees', '10 dominadas']
        },
        {
          week: 2,
          label: 'Semana 2',
          type: 'AMRAP',
          duration: 20,
          unit: 'min',
          description: 'AMRAP 20\'',
          rounds: ['10 cal bike', '15 KB swings', '10 push-ups']
        },
        {
          week: 3,
          label: 'Semana 3',
          type: 'EMOM',
          duration: 24,
          unit: 'min',
          description: 'EMOM 24\'',
          rounds: ['Min 1: 12 wall balls', 'Min 2: 10 toes to bar', 'Min 3: 12 lunges']
        },
        {
          week: 4,
          label: 'Semana 4 (Descarga)',
          type: 'AMRAP',
          duration: 15,
          unit: 'min',
          description: 'AMRAP 15\' suave',
          rounds: ['200 m carrera o remo', '10 KB swings', '10 sit-ups']
        }
      ]
    }
  ]
};
