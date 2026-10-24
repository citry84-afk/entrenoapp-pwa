/*
 * Explicit built-in exercise/material catalogue, reviewed 2026-10-24.
 * 304 current reference identities from audits/2026-10-24/inventario-imagenes.json.
 * Runtime matching is the complete (id, name, equipment) triplet: no ID fallback,
 * partial-name recognition, hint parsing, equipment guessing, or raw-form aliases.
 * Empty equipment is an explicit inventory value, never a missing-value default.
 * "choice"/"circuit" deliberately avoid depicting one unconfirmed technique.
 * The illustrations are static orientation, not full movement demonstrations.
 */
(function(root){
  'use strict';
  // id, exact display name, actual reference equipment, pose, tool, support, mediaKey?, options?, generatedMediaKey?
  const rows=[
  [
    "ap",
    "Aperturas con banda",
    "bandas",
    "standing_fly",
    "band",
    false,
    "band_fly",
    null,
    "positions-standing-fly-band-free-bilateral-load1"
  ],
  [
    "pm",
    "Buenos días con banda",
    "bandas",
    "hinge",
    "band",
    false,
    null,
    null,
    "positions-hinge-band-free-bilateral-load1"
  ],
  [
    "pmr",
    "Buenos días con banda",
    "bandas",
    "hinge",
    "band",
    false,
    null,
    null,
    "positions-hinge-band-free-bilateral-load1"
  ],
  [
    "vital_hip_hinge",
    "Buenos días con banda suave",
    "bandas",
    "hinge",
    "band",
    false,
    null,
    null,
    "positions-hinge-band-free-bilateral-load1"
  ],
  [
    "cb",
    "Curl bíceps con banda",
    "bandas",
    "curl",
    "band",
    false,
    null,
    null,
    "positions-curl-band-free-bilateral-load1-supinated-grip"
  ],
  [
    "curl_banda",
    "Curl con banda",
    "bandas",
    "curl",
    "band",
    false,
    null,
    null,
    "positions-curl-band-free-bilateral-load1-supinated-grip"
  ],
  [
    "band_legcurl",
    "Curl femoral banda",
    "bandas",
    "choice",
    "band",
    false,
    null,
    null,
    "positions-band-hamstring-curl-prone",
    {
      "es": "Curl femoral con banda, ejemplo tumbado: dos posiciones de una variante de ejemplo; respeta el material mostrado.",
      "en": "Banded hamstring curl, lying example: two positions of an example variant; use the equipment shown."
    }
  ],
  [
    "cf",
    "Curl femoral con banda",
    "bandas",
    "choice",
    "band",
    false,
    null,
    null,
    "positions-band-hamstring-curl-prone",
    {
      "es": "Curl femoral con banda, ejemplo tumbado: dos posiciones de una variante de ejemplo; respeta el material mostrado.",
      "en": "Banded hamstring curl, lying example: two positions of an example variant; use the equipment shown."
    }
  ],
  [
    "cm",
    "Curl martillo con banda",
    "bandas",
    "curl",
    "band",
    false,
    null,
    null,
    "positions-curl-band-free-bilateral-load1-hammer-grip"
  ],
  [
    "et",
    "Elevación de talones",
    "bandas",
    "calf",
    "band",
    false,
    null,
    null,
    "positions-band-calf-raise",
    {
      "es": "Elevación de talones con banda, ejemplo de pie: dos posiciones de una variante de ejemplo; respeta el material mostrado.",
      "en": "Banded calf raise, standing example: two positions of an example variant; use the equipment shown."
    }
  ],
  [
    "el",
    "Elevaciones laterales con banda",
    "bandas",
    "raise",
    "band",
    false,
    null,
    null,
    "positions-raise-band-free-bilateral-load1"
  ],
  [
    "tp",
    "Extensión tríceps con banda",
    "bandas",
    "triceps_extension",
    "band",
    false,
    null,
    null,
    "positions-band-triceps-overhead-extension",
    {
      "es": "Extensión de tríceps con banda, ejemplo sobre cabeza: dos posiciones de una variante de ejemplo; respeta el material mostrado.",
      "en": "Band triceps extension, overhead example: two positions of an example variant; use the equipment shown."
    }
  ],
  [
    "band_face",
    "Face pull con banda",
    "bandas",
    "face_pull",
    "band",
    false,
    null,
    null,
    "positions-face-pull-band-free-bilateral-load1"
  ],
  [
    "fp",
    "Face pull con banda",
    "bandas",
    "face_pull",
    "band",
    false,
    null,
    null,
    "positions-face-pull-band-free-bilateral-load1"
  ],
  [
    "fd",
    "Flexiones con banda",
    "bandas",
    "push_up",
    "band",
    false,
    null,
    null,
    "positions-push-up-band-free-bilateral-load1"
  ],
  [
    "band_pulldown",
    "Jalón con banda",
    "bandas",
    "pulldown",
    "band",
    false,
    null,
    null,
    "positions-pulldown-band-free-bilateral-load1-front-grip-unspecified"
  ],
  [
    "dm",
    "Jalón con banda",
    "bandas",
    "pulldown",
    "band",
    false,
    null,
    null,
    "positions-pulldown-band-free-bilateral-load1-front-grip-unspecified"
  ],
  [
    "jl",
    "Jalón con banda",
    "bandas",
    "pulldown",
    "band",
    false,
    null,
    null,
    "positions-pulldown-band-free-bilateral-load1-front-grip-unspecified"
  ],
  [
    "vital_carry",
    "Marcha con banda suave",
    "bandas",
    "choice",
    "band",
    false,
    null,
    null,
    "overview-band"
  ],
  [
    "pb",
    "Press de pecho con banda",
    "bandas",
    "standing_press",
    "band",
    false,
    null,
    null,
    "positions-standing-press-band-free-bilateral-load1"
  ],
  [
    "pa",
    "Press hombro con banda",
    "bandas",
    "overhead_press",
    "band",
    false,
    null,
    null,
    "positions-overhead-press-band-free-bilateral-load1"
  ],
  [
    "ph",
    "Press hombro con banda",
    "bandas",
    "overhead_press",
    "band",
    false,
    null,
    null,
    "positions-overhead-press-band-free-bilateral-load1"
  ],
  [
    "phm",
    "Press hombro con banda",
    "bandas",
    "overhead_press",
    "band",
    false,
    null,
    null,
    "positions-overhead-press-band-free-bilateral-load1"
  ],
  [
    "pi",
    "Press inclinado con banda",
    "bandas",
    "band_incline_press",
    "band",
    false,
    null,
    null,
    "positions-band-incline-press-band-free-bilateral-load1"
  ],
  [
    "pim",
    "Press inclinado con banda",
    "bandas",
    "band_incline_press",
    "band",
    false,
    null,
    null,
    "positions-band-incline-press-band-free-bilateral-load1"
  ],
  [
    "ht",
    "Puente glúteo con banda",
    "bandas",
    "bridge",
    "band",
    false,
    null,
    null,
    "positions-bridge-band-free-bilateral-load1-glute"
  ],
  [
    "band_row",
    "Remo con banda",
    "bandas",
    "row",
    "band",
    false,
    null,
    null,
    "positions-band-standing-row",
    {
      "es": "Remo con banda, ejemplo de pie y anclaje frontal: dos posiciones de una variante de ejemplo; respeta el material mostrado.",
      "en": "Resistance-band row, standing front-anchor example: two positions of an example variant; use the equipment shown."
    }
  ],
  [
    "rb",
    "Remo con banda",
    "bandas",
    "row",
    "band",
    false,
    null,
    null,
    "positions-band-standing-row",
    {
      "es": "Remo con banda, ejemplo de pie y anclaje frontal: dos posiciones de una variante de ejemplo; respeta el material mostrado.",
      "en": "Resistance-band row, standing front-anchor example: two positions of an example variant; use the equipment shown."
    }
  ],
  [
    "rc",
    "Remo con banda",
    "bandas",
    "row",
    "band",
    false,
    null,
    null,
    "positions-band-standing-row",
    {
      "es": "Remo con banda, ejemplo de pie y anclaje frontal: dos posiciones de una variante de ejemplo; respeta el material mostrado.",
      "en": "Resistance-band row, standing front-anchor example: two positions of an example variant; use the equipment shown."
    }
  ],
  [
    "rm",
    "Remo con banda",
    "bandas",
    "row",
    "band",
    false,
    null,
    null,
    "positions-band-standing-row",
    {
      "es": "Remo con banda, ejemplo de pie y anclaje frontal: dos posiciones de una variante de ejemplo; respeta el material mostrado.",
      "en": "Resistance-band row, standing front-anchor example: two positions of an example variant; use the equipment shown."
    }
  ],
  [
    "vital_row",
    "Remo con banda",
    "bandas",
    "row",
    "band",
    false,
    null,
    null,
    "positions-band-standing-row",
    {
      "es": "Remo con banda, ejemplo de pie y anclaje frontal: dos posiciones de una variante de ejemplo; respeta el material mostrado.",
      "en": "Resistance-band row, standing front-anchor example: two positions of an example variant; use the equipment shown."
    }
  ],
  [
    "jc",
    "Remo sentado con banda",
    "bandas",
    "cable_row",
    "band",
    true,
    null,
    null,
    "positions-cable-row-band-supported-bilateral-load1"
  ],
  [
    "sq",
    "Sentadilla con banda",
    "bandas",
    "choice",
    "band",
    false,
    null,
    null,
    "positions-band-squat",
    {
      "es": "Sentadilla con banda, ejemplo bajo los pies: dos posiciones de una variante de ejemplo; respeta el material mostrado.",
      "en": "Band squat, under-foot example: two positions of an example variant; use the equipment shown."
    }
  ],
  [
    "ec",
    "Sentadilla tempo con banda",
    "bandas",
    "choice",
    "band",
    false,
    null,
    null,
    "positions-band-squat",
    {
      "es": "Sentadilla con banda, ejemplo bajo los pies: dos posiciones de una variante de ejemplo; respeta el material mostrado.",
      "en": "Band squat, under-foot example: two positions of an example variant; use the equipment shown."
    }
  ],
  [
    "pr",
    "Zancada con banda",
    "bandas",
    "lunge",
    "band",
    false,
    null,
    null,
    "positions-lunge-band-free-bilateral-load1-alternating"
  ],
  [
    "su",
    "Zancadas con banda",
    "bandas",
    "lunge",
    "band",
    false,
    null,
    null,
    "positions-lunge-band-free-bilateral-load1-alternating"
  ],
  [
    "za",
    "Zancadas con banda",
    "bandas",
    "lunge",
    "band",
    false,
    null,
    null,
    "positions-lunge-band-free-bilateral-load1-alternating"
  ],
  [
    "ap",
    "Aperturas mancuernas",
    "gym",
    "choice",
    "dumbbell",
    false,
    null,
    null,
    "positions-dumbbell-fly-bench-example",
    {
      "es": "Aperturas con mancuernas, ejemplo en banco: dos posiciones de una variante de ejemplo; respeta el material mostrado.",
      "en": "Dumbbell fly, flat-bench example: two positions of an example variant; use the equipment shown."
    }
  ],
  [
    "ap",
    "Aperturas polea",
    "gym",
    "choice",
    "machine",
    false,
    null,
    null,
    "positions-cable-fly-standing",
    {
      "es": "Aperturas en polea, ejemplo de pie: dos posiciones de una variante de ejemplo; respeta el material mostrado.",
      "en": "Standing cable chest fly example: two positions of an example variant; use the equipment shown."
    }
  ],
  [
    "cb",
    "Curl bíceps",
    "gym",
    "curl",
    "barbell",
    false,
    "biceps_curl_barbell",
    null,
    "positions-curl-barbell-free-bilateral-load1-supinated-grip"
  ],
  [
    "cb",
    "Curl bíceps barra",
    "gym",
    "curl",
    "barbell",
    false,
    "biceps_curl_barbell",
    null,
    "positions-curl-barbell-free-bilateral-load1-supinated-grip"
  ],
  [
    "cf",
    "Curl femoral",
    "gym",
    "choice",
    "machine",
    false,
    null,
    null,
    "positions-hamstring-curl-machine-seated",
    {
      "es": "Curl femoral, ejemplo en máquina sentada: dos posiciones de una variante de ejemplo; respeta el material mostrado.",
      "en": "Hamstring curl, seated-machine example: two positions of an example variant; use the equipment shown."
    }
  ],
  [
    "cm",
    "Curl martillo",
    "gym",
    "curl",
    "none",
    false,
    null,
    null,
    "positions-curl-dumbbell-free-bilateral-load2-hammer-grip",
    {
      "es": "Ejemplo de curl martillo con dos mancuernas; confirma el material de tu variante.",
      "en": "Example of hammer curl with two dumbbells; confirm your variant’s equipment."
    }
  ],
  [
    "dm",
    "Dominadas",
    "gym",
    "pull_up",
    "bodyweight",
    false,
    "pull_up_bodyweight",
    null,
    "positions-pull-up-bodyweight-free-bilateral-no-load"
  ],
  [
    "dm",
    "Dominadas / Jalón",
    "gym",
    "choice",
    "none",
    false,
    null,
    null,
    "overview-none"
  ],
  [
    "dm",
    "Dominadas lastradas",
    "gym",
    "pull_up",
    "none",
    false,
    null,
    null,
    "positions-weighted-pull-up",
    {
      "es": "Dominada lastrada, ejemplo con cinturón: dos posiciones de una variante de ejemplo; respeta el material mostrado.",
      "en": "Weighted pull-up, dip-belt example: two positions of an example variant; use the equipment shown."
    }
  ],
  [
    "et",
    "Elevación de talones",
    "gym",
    "calf",
    "none",
    false,
    null,
    null,
    "positions-calf-bodyweight-supported-bilateral-no-load",
    {
      "es": "Ejemplo de elevación de talones sin carga y con apoyo; no implica una carga concreta.",
      "en": "Example of unloaded supported calf raises; no specific load is implied."
    }
  ],
  [
    "el",
    "Elevaciones laterales",
    "gym",
    "raise",
    "dumbbell",
    false,
    "lateral_raise",
    null,
    "positions-raise-dumbbell-free-bilateral-load2"
  ],
  [
    "elc",
    "Elevaciones laterales cable",
    "gym",
    "raise",
    "machine",
    false,
    null,
    null,
    "positions-raise-machine-free-bilateral-no-load"
  ],
  [
    "elm",
    "Elevaciones laterales máquina",
    "gym",
    "choice",
    "machine",
    false,
    null,
    null,
    "positions-lateral-raise-machine",
    {
      "es": "Elevación lateral en máquina, ejemplo sentado: dos posiciones de una variante de ejemplo; respeta el material mostrado.",
      "en": "Machine lateral raise, seated example: two positions of an example variant; use the equipment shown."
    }
  ],
  [
    "ec",
    "Extensión cuádriceps",
    "gym",
    "leg_extension",
    "machine",
    true,
    "leg_extension",
    null,
    "positions-leg-extension-machine-supported-bilateral-no-load"
  ],
  [
    "fp",
    "Face pulls",
    "gym",
    "face_pull",
    "machine",
    false,
    null,
    null,
    "positions-face-pull-machine-free-bilateral-no-load"
  ],
  [
    "fp",
    "Face pulls polea",
    "gym",
    "face_pull",
    "machine",
    false,
    null,
    null,
    "positions-face-pull-machine-free-bilateral-no-load"
  ],
  [
    "fd",
    "Fondos",
    "gym",
    "choice",
    "none",
    false,
    null,
    null,
    "positions-parallel-bar-dip",
    {
      "es": "Fondos, ejemplo en barras paralelas: dos posiciones de una variante de ejemplo; respeta el material mostrado.",
      "en": "Bodyweight dip, parallel-bar example: two positions of an example variant; use the equipment shown."
    }
  ],
  [
    "fd",
    "Fondos lastrados",
    "gym",
    "choice",
    "none",
    false,
    null,
    null,
    "positions-weighted-dip",
    {
      "es": "Fondos lastrados, ejemplo en paralelas con cinturón: dos posiciones de una variante de ejemplo; respeta el material mostrado.",
      "en": "Weighted dip, parallel bars and belt example: two positions of an example variant; use the equipment shown."
    }
  ],
  [
    "calf_press",
    "Gemelo en prensa",
    "gym",
    "choice",
    "machine",
    false,
    null,
    null,
    "positions-calf-leg-press-machine",
    {
      "es": "Gemelos en prensa, ejemplo en plataforma: dos posiciones de una variante de ejemplo; respeta el material mostrado.",
      "en": "Calf press on leg-press platform example: two positions of an example variant; use the equipment shown."
    }
  ],
  [
    "ht",
    "Hip thrust",
    "gym",
    "hip_thrust",
    "none",
    true,
    null,
    null,
    "positions-hip-thrust-bodyweight-bench",
    {
      "es": "Hip thrust, ejemplo sin carga sobre banco: dos posiciones de una variante de ejemplo; respeta el material mostrado.",
      "en": "Hip thrust, unloaded bench example: two positions of an example variant; use the equipment shown."
    }
  ],
  [
    "ht",
    "Hip thrust barra",
    "gym",
    "hip_thrust",
    "barbell",
    true,
    null,
    null,
    "positions-hip-thrust-barbell-supported-bilateral-load1"
  ],
  [
    "jl",
    "Jalón agarre ancho",
    "gym",
    "pulldown",
    "machine",
    true,
    null,
    null,
    "positions-pulldown-machine-supported-bilateral-no-load-wide-grip"
  ],
  [
    "jc",
    "Jalón agarre cerrado",
    "gym",
    "pulldown",
    "machine",
    true,
    null,
    null,
    "positions-pulldown-machine-supported-bilateral-no-load-close-grip"
  ],
  [
    "jl",
    "Jalón al pecho",
    "gym",
    "pulldown",
    "machine",
    true,
    null,
    null,
    "positions-pulldown-machine-supported-bilateral-no-load-front-grip-unspecified"
  ],
  [
    "pecdeck",
    "Pec deck",
    "gym",
    "choice",
    "machine",
    true,
    "pec_deck",
    null,
    "positions-pec-deck-machine",
    {
      "es": "Pec deck, ejemplo de aperturas en máquina: dos posiciones de una variante de ejemplo; respeta el material mostrado.",
      "en": "Pec-deck machine fly example: two positions of an example variant; use the equipment shown."
    }
  ],
  [
    "pm",
    "Peso muerto",
    "gym",
    "deadlift",
    "barbell",
    false,
    "deadlift_barbell",
    null,
    "positions-deadlift-barbell-free-bilateral-load1"
  ],
  [
    "pmr",
    "Peso muerto rumano",
    "gym",
    "rdl",
    "barbell",
    false,
    "rdl_barbell",
    null,
    "positions-rdl-barbell-free-bilateral-load1"
  ],
  [
    "trap",
    "Peso muerto trap bar",
    "gym",
    "choice",
    "barbell",
    false,
    null,
    null,
    "positions-trap-bar-deadlift",
    {
      "es": "Peso muerto con trap bar: dos posiciones de una variante de ejemplo; respeta el material mostrado.",
      "en": "Hex trap-bar deadlift: two positions of an example variant; use the equipment shown."
    }
  ],
  [
    "pr",
    "Prensa de piernas",
    "gym",
    "leg_press",
    "machine",
    true,
    "leg_press",
    null,
    "positions-leg-press-machine-supported-bilateral-no-load"
  ],
  [
    "pa",
    "Press Arnold",
    "gym",
    "choice",
    "dumbbell",
    false,
    null,
    null,
    "positions-arnold-press-standing",
    {
      "es": "Press Arnold, ejemplo de pie con mancuernas: dos posiciones de una variante de ejemplo; respeta el material mostrado.",
      "en": "Arnold press, standing dumbbell example: two positions of an example variant; use the equipment shown."
    }
  ],
  [
    "pb",
    "Press de banca",
    "gym",
    "bench_press",
    "barbell",
    true,
    "bench_barbell",
    null,
    "positions-bench-press-barbell-supported-bilateral-load1"
  ],
  [
    "phm",
    "Press en máquina",
    "gym",
    "choice",
    "machine",
    false,
    null,
    null,
    "positions-shoulder-press-machine",
    {
      "es": "Press de hombros, ejemplo en máquina sentada: dos posiciones de una variante de ejemplo; respeta el material mostrado.",
      "en": "Shoulder press, seated-machine example: two positions of an example variant; use the equipment shown."
    }
  ],
  [
    "ph",
    "Press hombros",
    "gym",
    "overhead_press",
    "barbell",
    false,
    null,
    null,
    "positions-overhead-press-barbell-free-bilateral-load1"
  ],
  [
    "ph",
    "Press hombros barra",
    "gym",
    "overhead_press",
    "barbell",
    false,
    null,
    null,
    "positions-overhead-press-barbell-free-bilateral-load1"
  ],
  [
    "phm",
    "Press hombros máquina",
    "gym",
    "choice",
    "machine",
    false,
    null,
    null,
    "positions-shoulder-press-machine",
    {
      "es": "Press de hombros, ejemplo en máquina sentada: dos posiciones de una variante de ejemplo; respeta el material mostrado.",
      "en": "Shoulder press, seated-machine example: two positions of an example variant; use the equipment shown."
    }
  ],
  [
    "pi",
    "Press inclinado barra",
    "gym",
    "incline_press",
    "barbell",
    true,
    "incline_barbell",
    null,
    "positions-incline-press-barbell-supported-bilateral-load1"
  ],
  [
    "pim",
    "Press inclinado mancuernas",
    "gym",
    "incline_press",
    "dumbbell",
    true,
    "bench_dumbbell_incline",
    null,
    "positions-incline-press-dumbbell-supported-bilateral-load2"
  ],
  [
    "phm",
    "Press inclinado máquina",
    "gym",
    "choice",
    "machine",
    false,
    null,
    null,
    "positions-incline-press-machine",
    {
      "es": "Press inclinado en máquina, ejemplo con respaldo: dos posiciones de una variante de ejemplo; respeta el material mostrado.",
      "en": "Incline machine chest press example: two positions of an example variant; use the equipment shown."
    }
  ],
  [
    "neutral_machine_press",
    "Press máquina agarre neutro",
    "gym",
    "choice",
    "machine",
    false,
    null,
    null,
    "positions-neutral-chest-press-machine",
    {
      "es": "Press en máquina, ejemplo de agarre neutro: dos posiciones de una variante de ejemplo; respeta el material mostrado.",
      "en": "Machine chest press, neutral-grip example: two positions of an example variant; use the equipment shown."
    }
  ],
  [
    "pullthrough",
    "Pull-through polea",
    "gym",
    "choice",
    "machine",
    false,
    null,
    null,
    "positions-cable-pull-through",
    {
      "es": "Pull-through en polea, ejemplo con cuerda: dos posiciones de una variante de ejemplo; respeta el material mostrado.",
      "en": "Cable pull-through with rope example: two positions of an example variant; use the equipment shown."
    }
  ],
  [
    "remo_alto",
    "Remo alto cable",
    "gym",
    "choice",
    "machine",
    false,
    null,
    null,
    "positions-cable-high-row",
    {
      "es": "Remo alto en polea, ejemplo frontal: dos posiciones de una variante de ejemplo; respeta el material mostrado.",
      "en": "High cable row, front-anchor example: two positions of an example variant; use the equipment shown."
    }
  ],
  [
    "rc",
    "Remo cable bajo",
    "gym",
    "cable_row",
    "machine",
    true,
    "cable_row",
    null,
    "positions-cable-row-machine-supported-bilateral-no-load"
  ],
  [
    "rb",
    "Remo con barra",
    "gym",
    "row",
    "barbell",
    false,
    null,
    null,
    "positions-row-barbell-free-bilateral-load1"
  ],
  [
    "barbell_row_heavy",
    "Remo con barra pesado",
    "gym",
    "row",
    "barbell",
    false,
    null,
    null,
    "positions-row-barbell-free-bilateral-load1"
  ],
  [
    "cable_row",
    "Remo en polea sentado",
    "gym",
    "cable_row",
    "machine",
    true,
    "cable_row",
    null,
    "positions-cable-row-machine-supported-bilateral-no-load"
  ],
  [
    "rm",
    "Remo máquina",
    "gym",
    "choice",
    "machine",
    false,
    null,
    null,
    "positions-chest-row-machine-supported-bilateral-no-load",
    {
      "es": "Ejemplo de remo en máquina con el pecho apoyado.",
      "en": "Example of a chest-supported machine row."
    }
  ],
  [
    "rm",
    "Remo máquina pecho",
    "gym",
    "chest_row",
    "machine",
    true,
    null,
    null,
    "positions-chest-row-machine-supported-bilateral-no-load"
  ],
  [
    "sq",
    "Sentadilla",
    "gym",
    "squat",
    "barbell",
    false,
    "squat_barbell",
    null,
    "positions-squat-barbell-free-bilateral-load1"
  ],
  [
    "sq",
    "Sentadilla con barra",
    "gym",
    "squat",
    "barbell",
    false,
    "squat_barbell",
    null,
    "positions-squat-barbell-free-bilateral-load1"
  ],
  [
    "su",
    "Step-up con mancuernas",
    "gym",
    "step_up",
    "dumbbell",
    true,
    "step_up_dumbbell",
    null,
    "positions-step-up-dumbbell-supported-bilateral-load2-step"
  ],
  [
    "su",
    "Step-up unilateral",
    "gym",
    "step_up",
    "none",
    true,
    null,
    null,
    "positions-step-up-bodyweight-supported-bilateral-no-load-low-step",
    {
      "es": "Ejemplo de step-up sin carga sobre escalón bajo y estable.",
      "en": "Example of an unloaded step-up on a low stable step."
    }
  ],
  [
    "tp",
    "Tríceps polea",
    "gym",
    "triceps_pushdown",
    "machine",
    false,
    null,
    null,
    "positions-triceps-pushdown-machine-free-bilateral-no-load"
  ],
  [
    "za",
    "Zancadas",
    "gym",
    "lunge",
    "none",
    false,
    null,
    null,
    "positions-lunge-bodyweight-free-bilateral-no-load-alternating",
    {
      "es": "Ejemplo de zancada sin carga; confirma el material de tu rutina.",
      "en": "Example of an unloaded lunge; confirm your routine’s equipment."
    }
  ],
  [
    "za",
    "Zancadas caminando",
    "gym",
    "lunge",
    "none",
    false,
    null,
    null,
    "positions-bodyweight-walking-lunge",
    {
      "es": "Zancadas caminando, ejemplo sin carga: dos posiciones de una variante de ejemplo; respeta el material mostrado.",
      "en": "Walking lunge, unloaded example: two positions of an example variant; use the equipment shown."
    }
  ],
  [
    "kb_push_floor",
    "Flexiones o floor press con kettlebell",
    "kettlebell",
    "choice",
    "kettlebell",
    false,
    null,
    {
      "toolCount": 1
    },
    "overview-kettlebell-push-options",
    {
      "es": "Opciones de empuje: flexión o press en suelo: vista orientativa de las opciones.",
      "en": "Push-up or kettlebell floor-press options: indicative overview of the options."
    }
  ],
  [
    "kb_goblet",
    "Goblet squat",
    "kettlebell",
    "goblet",
    "kettlebell",
    false,
    null,
    {
      "toolCount": 1
    },
    "positions-goblet-kettlebell-free-bilateral-load1"
  ],
  [
    "kb_goblet_pause",
    "Goblet squat con pausa",
    "kettlebell",
    "goblet",
    "kettlebell",
    false,
    null,
    {
      "toolCount": 1
    },
    "positions-goblet-kettlebell-free-bilateral-load1"
  ],
  [
    "kb_goblet_tempo",
    "Goblet squat tempo",
    "kettlebell",
    "goblet",
    "kettlebell",
    false,
    null,
    {
      "toolCount": 1
    },
    "positions-goblet-kettlebell-free-bilateral-load1"
  ],
  [
    "kb_calf",
    "Kettlebell calf raise",
    "kettlebell",
    "calf",
    "kettlebell",
    false,
    null,
    {
      "toolCount": 1
    },
    "positions-calf-kettlebell-free-bilateral-load1"
  ],
  [
    "kb_clean_press",
    "Kettlebell clean & press",
    "kettlebell",
    "clean_press",
    "kettlebell",
    false,
    null,
    {
      "toolCount": 1
    },
    "positions-clean-press-kettlebell-free-bilateral-load1"
  ],
  [
    "kb_curl",
    "Kettlebell curl",
    "kettlebell",
    "curl",
    "kettlebell",
    false,
    null,
    {
      "toolCount": 1
    },
    "positions-curl-kettlebell-free-bilateral-load1-supinated-grip"
  ],
  [
    "kb_dead",
    "Kettlebell deadlift",
    "kettlebell",
    "deadlift",
    "kettlebell",
    false,
    null,
    {
      "toolCount": 1
    },
    "positions-deadlift-kettlebell-free-bilateral-load1"
  ],
  [
    "kb_floor_press",
    "Kettlebell floor press",
    "kettlebell",
    "floor_press",
    "kettlebell",
    false,
    null,
    {
      "toolCount": 1,
      "unilateral": true
    },
    "positions-floor-press-kettlebell-free-unilateral-load1"
  ],
  [
    "kb_floor_press",
    "Kettlebell floor press unilateral",
    "kettlebell",
    "floor_press",
    "kettlebell",
    false,
    null,
    {
      "toolCount": 1,
      "unilateral": true
    },
    "positions-floor-press-kettlebell-free-unilateral-load1"
  ],
  [
    "kb_glute_bridge",
    "Kettlebell glute bridge",
    "kettlebell",
    "bridge",
    "kettlebell",
    false,
    null,
    {
      "toolCount": 1
    },
    "positions-bridge-kettlebell-free-bilateral-load1-glute"
  ],
  [
    "kb_halo",
    "Kettlebell halo",
    "kettlebell",
    "halo",
    "kettlebell",
    false,
    null,
    {
      "toolCount": 1
    },
    "positions-halo-kettlebell-free-bilateral-load1"
  ],
  [
    "kb_halo",
    "Kettlebell halo ligero",
    "kettlebell",
    "halo",
    "kettlebell",
    false,
    null,
    {
      "toolCount": 1
    },
    "positions-halo-kettlebell-free-bilateral-load1"
  ],
  [
    "kb_curl",
    "Kettlebell hammer curl",
    "kettlebell",
    "curl",
    "kettlebell",
    false,
    null,
    {
      "toolCount": 1
    },
    "positions-curl-kettlebell-free-bilateral-load1-hammer-grip"
  ],
  [
    "kb_lunge",
    "Kettlebell lunge",
    "kettlebell",
    "lunge",
    "kettlebell",
    false,
    null,
    {
      "toolCount": 1
    },
    "positions-lunge-kettlebell-free-bilateral-load1-alternating"
  ],
  [
    "kb_press",
    "Kettlebell press",
    "kettlebell",
    "overhead_press",
    "kettlebell",
    false,
    null,
    {
      "toolCount": 1,
      "unilateral": true
    },
    "positions-overhead-press-kettlebell-free-unilateral-load1"
  ],
  [
    "kb_close_press",
    "Kettlebell press cerrado en suelo",
    "kettlebell",
    "floor_press",
    "kettlebell",
    false,
    null,
    {
      "toolCount": 1,
      "closeGrip": true
    },
    "positions-floor-press-kettlebell-free-bilateral-load1-close"
  ],
  [
    "kb_press_half",
    "Kettlebell press medio arrodillado",
    "kettlebell",
    "kneeling_press",
    "kettlebell",
    false,
    null,
    {
      "toolCount": 1
    },
    "positions-kneeling-press-kettlebell-free-bilateral-load1"
  ],
  [
    "kb_pullover",
    "Kettlebell pullover en suelo",
    "kettlebell",
    "floor_pullover",
    "kettlebell",
    false,
    null,
    {
      "toolCount": 1
    },
    "positions-floor-pullover-kettlebell-free-bilateral-load1"
  ],
  [
    "kb_rdl",
    "Kettlebell Romanian deadlift",
    "kettlebell",
    "rdl",
    "kettlebell",
    false,
    null,
    {
      "toolCount": 1
    },
    "positions-rdl-kettlebell-free-bilateral-load1"
  ],
  [
    "kb_row",
    "Kettlebell row",
    "kettlebell",
    "row",
    "kettlebell",
    false,
    null,
    {
      "toolCount": 1,
      "unilateral": true
    },
    "positions-row-kettlebell-free-unilateral-load1"
  ],
  [
    "kb_row",
    "Kettlebell row apoyado",
    "kettlebell",
    "row",
    "kettlebell",
    true,
    null,
    {
      "toolCount": 1,
      "unilateral": true
    },
    "positions-row-kettlebell-supported-unilateral-load1"
  ],
  [
    "kb_row",
    "Kettlebell row unilateral",
    "kettlebell",
    "row",
    "kettlebell",
    false,
    null,
    {
      "toolCount": 1,
      "unilateral": true
    },
    "positions-row-kettlebell-free-unilateral-load1"
  ],
  [
    "kb_stepup",
    "Kettlebell step-up",
    "kettlebell",
    "step_up",
    "kettlebell",
    true,
    null,
    {
      "toolCount": 1
    },
    "positions-step-up-kettlebell-supported-bilateral-load1-step"
  ],
  [
    "vital_carry",
    "Paseo con kettlebell",
    "kettlebell",
    "carry",
    "kettlebell",
    false,
    null,
    {
      "toolCount": 1
    },
    "positions-carry-kettlebell-free-bilateral-load1"
  ],
  [
    "vital_hip_hinge",
    "Peso muerto con kettlebell",
    "kettlebell",
    "deadlift",
    "kettlebell",
    false,
    null,
    {
      "toolCount": 1
    },
    "positions-deadlift-kettlebell-free-bilateral-load1"
  ],
  [
    "vital_row",
    "Remo con kettlebell apoyado",
    "kettlebell",
    "row",
    "kettlebell",
    true,
    null,
    {
      "toolCount": 1,
      "unilateral": true
    },
    "positions-row-kettlebell-supported-unilateral-load1"
  ],
  [
    "apm",
    "Aperturas con mancuernas",
    "mancuernas",
    "choice",
    "dumbbell",
    false,
    null,
    null,
    "positions-dumbbell-fly-bench-example",
    {
      "es": "Aperturas con mancuernas, ejemplo en banco: dos posiciones de una variante de ejemplo; respeta el material mostrado.",
      "en": "Dumbbell fly, flat-bench example: two positions of an example variant; use the equipment shown."
    }
  ],
  [
    "ap",
    "Aperturas con mancuernas en el suelo",
    "mancuernas",
    "floor_fly",
    "dumbbell",
    false,
    null,
    null,
    "positions-floor-fly-dumbbell-free-bilateral-load2"
  ],
  [
    "hip_hinge",
    "Bisagra con mancuernas",
    "mancuernas",
    "hinge",
    "dumbbell",
    false,
    null,
    null,
    "positions-hinge-dumbbell-free-bilateral-load2"
  ],
  [
    "hip_hinge_db",
    "Bisagra con mancuernas",
    "mancuernas",
    "hinge",
    "dumbbell",
    false,
    null,
    null,
    "positions-hinge-dumbbell-free-bilateral-load2"
  ],
  [
    "cb",
    "Curl bíceps con mancuernas",
    "mancuernas",
    "curl",
    "dumbbell",
    false,
    "biceps_curl_dumbbell",
    null,
    "positions-curl-dumbbell-free-bilateral-load2-supinated-grip"
  ],
  [
    "curl_manc",
    "Curl con mancuernas",
    "mancuernas",
    "curl",
    "dumbbell",
    false,
    "biceps_curl_dumbbell",
    null,
    "positions-curl-dumbbell-free-bilateral-load2-supinated-grip"
  ],
  [
    "cm",
    "Curl martillo",
    "mancuernas",
    "curl",
    "dumbbell",
    false,
    "hammer_curl_dumbbell",
    null,
    "positions-curl-dumbbell-free-bilateral-load2-hammer-grip"
  ],
  [
    "et",
    "Elevación de talones con mancuernas",
    "mancuernas",
    "calf",
    "dumbbell",
    false,
    null,
    null,
    "positions-calf-dumbbell-free-bilateral-load2"
  ],
  [
    "el",
    "Elevaciones laterales",
    "mancuernas",
    "raise",
    "dumbbell",
    false,
    "lateral_raise",
    null,
    "positions-raise-dumbbell-free-bilateral-load2"
  ],
  [
    "tp",
    "Extensión tríceps con mancuerna",
    "mancuernas",
    "triceps_extension",
    "dumbbell",
    false,
    null,
    {
      "toolCount": 1
    },
    "positions-triceps-extension-dumbbell-free-bilateral-load1"
  ],
  [
    "tpm",
    "Extensión tríceps mancuerna",
    "mancuernas",
    "triceps_extension",
    "dumbbell",
    false,
    null,
    {
      "toolCount": 1
    },
    "positions-triceps-extension-dumbbell-free-bilateral-load1"
  ],
  [
    "floor_press_db",
    "Floor press con mancuernas",
    "mancuernas",
    "floor_press",
    "dumbbell",
    false,
    null,
    null,
    "positions-floor-press-dumbbell-free-bilateral-load2"
  ],
  [
    "fd",
    "Fondos",
    "mancuernas",
    "choice",
    "none",
    false,
    null,
    null,
    "positions-parallel-bar-dip",
    {
      "es": "Fondos, ejemplo en barras paralelas: dos posiciones de una variante de ejemplo; respeta el material mostrado.",
      "en": "Bodyweight dip, parallel-bar example: two positions of an example variant; use the equipment shown."
    }
  ],
  [
    "fd",
    "Fondos lastrados",
    "mancuernas",
    "choice",
    "none",
    false,
    null,
    null,
    "positions-weighted-dip",
    {
      "es": "Fondos lastrados, ejemplo en paralelas con cinturón: dos posiciones de una variante de ejemplo; respeta el material mostrado.",
      "en": "Weighted dip, parallel bars and belt example: two positions of an example variant; use the equipment shown."
    }
  ],
  [
    "calf_db",
    "Gemelo con mancuernas",
    "mancuernas",
    "calf",
    "dumbbell",
    false,
    null,
    null,
    "positions-calf-dumbbell-free-bilateral-load2"
  ],
  [
    "ht",
    "Hip thrust con mancuerna",
    "mancuernas",
    "hip_thrust",
    "dumbbell",
    true,
    null,
    {
      "toolCount": 1
    },
    "positions-hip-thrust-dumbbell-supported-bilateral-load1"
  ],
  [
    "fp",
    "Pájaros con mancuernas",
    "mancuernas",
    "reverse_fly",
    "dumbbell",
    false,
    null,
    null,
    "positions-reverse-fly-dumbbell-free-bilateral-load2"
  ],
  [
    "pajaro",
    "Pájaros mancuernas",
    "mancuernas",
    "reverse_fly",
    "dumbbell",
    false,
    null,
    null,
    "positions-reverse-fly-dumbbell-free-bilateral-load2"
  ],
  [
    "vital_carry",
    "Paseo con mancuernas ligeras",
    "mancuernas",
    "carry",
    "dumbbell",
    false,
    null,
    null,
    "positions-carry-dumbbell-free-bilateral-load2"
  ],
  [
    "cf",
    "Peso muerto rumano a una pierna",
    "mancuernas",
    "single_rdl",
    "dumbbell",
    false,
    null,
    null,
    "positions-single-rdl-dumbbell-free-bilateral-load2"
  ],
  [
    "pm",
    "Peso muerto rumano con mancuernas",
    "mancuernas",
    "rdl",
    "dumbbell",
    false,
    null,
    null,
    "positions-rdl-dumbbell-free-bilateral-load2"
  ],
  [
    "pmr",
    "Peso muerto rumano con mancuernas",
    "mancuernas",
    "rdl",
    "dumbbell",
    false,
    null,
    null,
    "positions-rdl-dumbbell-free-bilateral-load2"
  ],
  [
    "hip_hinge",
    "Peso muerto rumano mancuernas",
    "mancuernas",
    "rdl",
    "dumbbell",
    false,
    null,
    null,
    "positions-rdl-dumbbell-free-bilateral-load2"
  ],
  [
    "pa",
    "Press Arnold",
    "mancuernas",
    "choice",
    "dumbbell",
    false,
    null,
    null,
    "positions-arnold-press-standing",
    {
      "es": "Press Arnold, ejemplo de pie con mancuernas: dos posiciones de una variante de ejemplo; respeta el material mostrado.",
      "en": "Arnold press, standing dumbbell example: two positions of an example variant; use the equipment shown."
    }
  ],
  [
    "pim",
    "Press con mancuernas",
    "mancuernas",
    "bench_press",
    "dumbbell",
    true,
    "bench_dumbbell_flat",
    null,
    "positions-bench-press-dumbbell-supported-bilateral-load2"
  ],
  [
    "ph",
    "Press hombro con mancuernas",
    "mancuernas",
    "overhead_press",
    "dumbbell",
    false,
    null,
    null,
    "positions-overhead-press-dumbbell-free-bilateral-load2"
  ],
  [
    "phm",
    "Press hombro con mancuernas",
    "mancuernas",
    "overhead_press",
    "dumbbell",
    false,
    null,
    null,
    "positions-overhead-press-dumbbell-free-bilateral-load2"
  ],
  [
    "phd",
    "Press hombros mancuernas",
    "mancuernas",
    "overhead_press",
    "dumbbell",
    false,
    null,
    null,
    "positions-overhead-press-dumbbell-free-bilateral-load2"
  ],
  [
    "pi",
    "Press inclinado con mancuernas",
    "mancuernas",
    "incline_press",
    "dumbbell",
    true,
    "bench_dumbbell_incline",
    null,
    "positions-incline-press-dumbbell-supported-bilateral-load2"
  ],
  [
    "pim",
    "Press inclinado mancuernas",
    "mancuernas",
    "incline_press",
    "dumbbell",
    true,
    "bench_dumbbell_incline",
    null,
    "positions-incline-press-dumbbell-supported-bilateral-load2"
  ],
  [
    "pb",
    "Press pecho con mancuernas",
    "mancuernas",
    "bench_press",
    "dumbbell",
    true,
    "bench_dumbbell_flat",
    null,
    "positions-bench-press-dumbbell-supported-bilateral-load2"
  ],
  [
    "jl",
    "Pullover con mancuerna",
    "mancuernas",
    "pullover",
    "dumbbell",
    true,
    null,
    {
      "toolCount": 1
    },
    "positions-pullover-dumbbell-supported-bilateral-load1"
  ],
  [
    "vital_row",
    "Remo con mancuerna apoyado",
    "mancuernas",
    "row",
    "dumbbell",
    true,
    null,
    {
      "unilateral": true,
      "toolCount": 1
    },
    "positions-row-dumbbell-supported-unilateral-load1"
  ],
  [
    "rb",
    "Remo con mancuernas",
    "mancuernas",
    "row",
    "dumbbell",
    false,
    null,
    null,
    "positions-row-dumbbell-free-bilateral-load2"
  ],
  [
    "rm",
    "Remo con mancuernas",
    "mancuernas",
    "row",
    "dumbbell",
    false,
    null,
    null,
    "positions-row-dumbbell-free-bilateral-load2"
  ],
  [
    "remo_manc",
    "Remo mancuerna",
    "mancuernas",
    "row",
    "dumbbell",
    false,
    null,
    {
      "unilateral": true,
      "toolCount": 1
    },
    "positions-row-dumbbell-free-unilateral-load1"
  ],
  [
    "jc",
    "Remo mancuerna a una mano",
    "mancuernas",
    "row",
    "dumbbell",
    false,
    null,
    {
      "unilateral": true,
      "toolCount": 1
    },
    "positions-row-dumbbell-free-unilateral-load1"
  ],
  [
    "rc",
    "Remo mancuerna apoyado",
    "mancuernas",
    "row",
    "dumbbell",
    true,
    null,
    {
      "unilateral": true,
      "toolCount": 1
    },
    "positions-row-dumbbell-supported-unilateral-load1"
  ],
  [
    "dm",
    "Remo renegado o remo mancuerna",
    "mancuernas",
    "choice",
    "dumbbell",
    false,
    null,
    null,
    "overview-dumbbell-row-options",
    {
      "es": "Opciones de remo con mancuernas: vista orientativa de las opciones.",
      "en": "Dumbbell row options: indicative overview of the options."
    }
  ],
  [
    "pr",
    "Sentadilla búlgara",
    "mancuernas",
    "split_squat",
    "dumbbell",
    true,
    null,
    null,
    "positions-split-squat-dumbbell-supported-bilateral-load2"
  ],
  [
    "sq",
    "Sentadilla goblet",
    "mancuernas",
    "goblet",
    "dumbbell",
    false,
    null,
    null,
    "positions-goblet-dumbbell-free-bilateral-load1"
  ],
  [
    "su",
    "Step-up con mancuernas",
    "mancuernas",
    "step_up",
    "dumbbell",
    true,
    "step_up_dumbbell",
    null,
    "positions-step-up-dumbbell-supported-bilateral-load2-step"
  ],
  [
    "su",
    "Step-up unilateral",
    "mancuernas",
    "step_up",
    "dumbbell",
    true,
    null,
    null,
    "positions-step-up-dumbbell-supported-bilateral-load2-step"
  ],
  [
    "ec",
    "Zancada con mancuernas",
    "mancuernas",
    "lunge",
    "dumbbell",
    false,
    "lunge_dumbbell",
    null,
    "positions-lunge-dumbbell-free-bilateral-load2-alternating"
  ],
  [
    "za",
    "Zancadas",
    "mancuernas",
    "lunge",
    "dumbbell",
    false,
    null,
    null,
    "positions-lunge-dumbbell-free-bilateral-load2-alternating"
  ],
  [
    "za",
    "Zancadas caminando",
    "mancuernas",
    "lunge",
    "dumbbell",
    false,
    "walking_lunge_dumbbell",
    null,
    "positions-lunge-dumbbell-free-bilateral-load2-walking"
  ],
  [
    "starter_hip_hinge",
    "Bisagra de cadera",
    "nada",
    "hinge",
    "bodyweight",
    false,
    null,
    null,
    "positions-hinge-bodyweight-free-bilateral-no-load"
  ],
  [
    "pm",
    "Buenos días sin peso",
    "nada",
    "hinge",
    "bodyweight",
    false,
    null,
    null,
    "positions-hinge-bodyweight-free-bilateral-no-load"
  ],
  [
    "pmr",
    "Buenos días sin peso",
    "nada",
    "hinge",
    "bodyweight",
    false,
    null,
    null,
    "positions-hinge-bodyweight-free-bilateral-no-load"
  ],
  [
    "cf",
    "Curl femoral deslizante",
    "nada",
    "sliding_curl",
    "slider",
    false,
    null,
    null,
    "positions-sliding-curl-slider-free-bilateral-load1"
  ],
  [
    "cb",
    "Curl isométrico con toalla",
    "nada",
    "towel_curl",
    "towel",
    false,
    null,
    null,
    "positions-towel-curl-towel-free-bilateral-load1-bilateral-isometric"
  ],
  [
    "cm",
    "Curl toalla unilateral",
    "nada",
    "towel_curl",
    "towel",
    false,
    null,
    null,
    "positions-towel-curl-towel-free-unilateral-load1-unilateral-isometric"
  ],
  [
    "starter_dead_bug",
    "Dead bug",
    "nada",
    "dead_bug",
    "bodyweight",
    false,
    null,
    null,
    "positions-dead-bug-bodyweight-free-bilateral-no-load"
  ],
  [
    "et",
    "Elevación de talones a una pierna",
    "nada",
    "single_calf",
    "bodyweight",
    false,
    null,
    null,
    "positions-single-calf-bodyweight-free-bilateral-no-load"
  ],
  [
    "el",
    "Elevaciones Y-T-W en el suelo",
    "nada",
    "prone_row",
    "bodyweight",
    false,
    null,
    null,
    "positions-prone-row-bodyweight-free-bilateral-no-load-y-t-w"
  ],
  [
    "starter_incline_push",
    "Flexión inclinada",
    "nada",
    "incline_push",
    "bodyweight",
    true,
    null,
    null,
    "positions-incline-push-bodyweight-supported-bilateral-no-load"
  ],
  [
    "pb",
    "Flexiones",
    "nada",
    "push_up",
    "bodyweight",
    false,
    "push_up",
    null,
    "positions-push-up-bodyweight-free-bilateral-no-load"
  ],
  [
    "pushup",
    "Flexiones",
    "nada",
    "push_up",
    "bodyweight",
    false,
    "push_up",
    null,
    "positions-push-up-bodyweight-free-bilateral-no-load"
  ],
  [
    "ap",
    "Flexiones abiertas",
    "nada",
    "push_up",
    "bodyweight",
    false,
    null,
    null,
    "positions-push-up-bodyweight-free-bilateral-no-load-wide"
  ],
  [
    "pi",
    "Flexiones con pies elevados",
    "nada",
    "choice",
    "bodyweight",
    false,
    null,
    null,
    "positions-decline-push-up",
    {
      "es": "Flexiones con pies elevados, ejemplo en plataforma baja: dos posiciones de una variante de ejemplo; respeta el material mostrado.",
      "en": "Feet-elevated push-up, low-platform example: two positions of an example variant; use the equipment shown."
    }
  ],
  [
    "pushup",
    "Flexiones controladas",
    "nada",
    "push_up",
    "bodyweight",
    false,
    "push_up",
    null,
    "positions-push-up-bodyweight-free-bilateral-no-load"
  ],
  [
    "tp",
    "Flexiones diamante",
    "nada",
    "push_up",
    "bodyweight",
    false,
    null,
    null,
    "positions-push-up-bodyweight-free-bilateral-no-load-diamond"
  ],
  [
    "incline_pushup",
    "Flexiones inclinadas",
    "nada",
    "incline_push",
    "bodyweight",
    true,
    null,
    null,
    "positions-incline-push-bodyweight-supported-bilateral-no-load"
  ],
  [
    "pushup_feet",
    "Flexiones pies elevados",
    "nada",
    "choice",
    "bodyweight",
    false,
    null,
    null,
    "positions-decline-push-up",
    {
      "es": "Flexiones con pies elevados, ejemplo en plataforma baja: dos posiciones de una variante de ejemplo; respeta el material mostrado.",
      "en": "Feet-elevated push-up, low-platform example: two positions of an example variant; use the equipment shown."
    }
  ],
  [
    "pim",
    "Flexiones profundas",
    "nada",
    "push_up",
    "bodyweight",
    false,
    null,
    null,
    "positions-push-up-bodyweight-free-bilateral-no-load-deficit"
  ],
  [
    "fd",
    "Fondos entre sillas o flexiones cerradas",
    "nada",
    "choice",
    "bodyweight",
    false,
    null,
    null,
    "overview-bodyweight"
  ],
  [
    "calf_single",
    "Gemelo unilateral",
    "nada",
    "single_calf",
    "bodyweight",
    false,
    null,
    null,
    "positions-single-calf-bodyweight-free-bilateral-no-load"
  ],
  [
    "pa",
    "Pike push-up",
    "nada",
    "pike_push",
    "bodyweight",
    false,
    null,
    null,
    "positions-pike-push-bodyweight-free-bilateral-no-load"
  ],
  [
    "ph",
    "Pike push-up",
    "nada",
    "pike_push",
    "bodyweight",
    false,
    null,
    null,
    "positions-pike-push-bodyweight-free-bilateral-no-load"
  ],
  [
    "phm",
    "Pike push-up",
    "nada",
    "pike_push",
    "bodyweight",
    false,
    null,
    null,
    "positions-pike-push-bodyweight-free-bilateral-no-load"
  ],
  [
    "pike",
    "Pike push-up",
    "nada",
    "pike_push",
    "bodyweight",
    false,
    null,
    null,
    "positions-pike-push-bodyweight-free-bilateral-no-load"
  ],
  [
    "starter_glute_bridge",
    "Puente de glúteos",
    "nada",
    "bridge",
    "bodyweight",
    false,
    null,
    null,
    "positions-bridge-bodyweight-free-bilateral-no-load-glute"
  ],
  [
    "glute_bridge",
    "Puente glúteo",
    "nada",
    "bridge",
    "bodyweight",
    false,
    null,
    null,
    "positions-bridge-bodyweight-free-bilateral-no-load-glute"
  ],
  [
    "ht",
    "Puente glúteo unilateral",
    "nada",
    "single_bridge",
    "bodyweight",
    false,
    null,
    null,
    "positions-single-bridge-bodyweight-free-bilateral-no-load"
  ],
  [
    "starter_floor_row",
    "Remo boca abajo",
    "nada",
    "prone_row",
    "bodyweight",
    false,
    null,
    null,
    "positions-prone-row-bodyweight-free-bilateral-no-load-prone-elbow-row"
  ],
  [
    "rc",
    "Remo invertido",
    "nada",
    "inverted_row",
    "bodyweight",
    true,
    null,
    null,
    "positions-inverted-row-bodyweight-supported-bilateral-no-load"
  ],
  [
    "jc",
    "Remo invertido agarre cerrado",
    "nada",
    "inverted_row",
    "bodyweight",
    true,
    null,
    null,
    "positions-inverted-row-bodyweight-supported-bilateral-no-load-close-grip"
  ],
  [
    "rb",
    "Remo invertido bajo mesa",
    "nada",
    "choice",
    "bodyweight",
    true,
    null,
    null,
    "positions-table-inverted-row",
    {
      "es": "Remo invertido, ejemplo bajo estructura estable: dos posiciones de una variante de ejemplo; respeta el material mostrado.",
      "en": "Under-table inverted row, stable-frame example: two positions of an example variant; use the equipment shown."
    }
  ],
  [
    "dm",
    "Remo invertido o dominada asistida",
    "nada",
    "choice",
    "bodyweight",
    false,
    null,
    null,
    "overview-bodyweight"
  ],
  [
    "pr",
    "Sentadilla búlgara",
    "nada",
    "split_squat",
    "bodyweight",
    true,
    null,
    null,
    "positions-split-squat-bodyweight-supported-bilateral-no-load"
  ],
  [
    "starter_squat",
    "Sentadilla lenta",
    "nada",
    "squat",
    "bodyweight",
    false,
    null,
    null,
    "positions-squat-bodyweight-free-bilateral-no-load"
  ],
  [
    "sq",
    "Sentadilla tempo",
    "nada",
    "squat",
    "bodyweight",
    false,
    null,
    null,
    "positions-squat-bodyweight-free-bilateral-no-load"
  ],
  [
    "su",
    "Step-up en silla estable",
    "nada",
    "step_up",
    "chair",
    true,
    null,
    null,
    "positions-step-up-chair-supported-bilateral-no-load-stable-chair"
  ],
  [
    "starter_step_up",
    "Subir un escalón bajo",
    "nada",
    "step_up",
    "bodyweight",
    true,
    null,
    null,
    "positions-step-up-bodyweight-supported-bilateral-no-load-low-step"
  ],
  [
    "jl",
    "Superman pull",
    "nada",
    "prone_row",
    "bodyweight",
    false,
    null,
    null,
    "positions-prone-row-bodyweight-free-bilateral-no-load-superman-row"
  ],
  [
    "rm",
    "Superman row",
    "nada",
    "prone_row",
    "bodyweight",
    false,
    null,
    null,
    "positions-prone-row-bodyweight-free-bilateral-no-load-superman-row"
  ],
  [
    "ec",
    "Wall sit",
    "nada",
    "wall_sit",
    "bodyweight",
    true,
    null,
    null,
    "positions-wall-sit-bodyweight-supported-bilateral-no-load"
  ],
  [
    "fp",
    "Y-T-W prone",
    "nada",
    "prone_row",
    "bodyweight",
    false,
    null,
    null,
    "positions-prone-row-bodyweight-free-bilateral-no-load-y-t-w"
  ],
  [
    "za",
    "Zancadas alternas",
    "nada",
    "lunge",
    "bodyweight",
    false,
    null,
    null,
    "positions-lunge-bodyweight-free-bilateral-no-load-alternating"
  ],
  [
    "run_intervals",
    "Bloque de cambios",
    "run",
    "run",
    "bodyweight",
    false,
    null,
    null,
    "positions-run-bodyweight-free-bilateral-no-load"
  ],
  [
    "run_tempo",
    "Bloque tempo",
    "run",
    "run",
    "bodyweight",
    false,
    null,
    null,
    "positions-run-bodyweight-free-bilateral-no-load"
  ],
  [
    "run_easy_warm",
    "Calentamiento",
    "run",
    "run",
    "bodyweight",
    false,
    null,
    null,
    "positions-run-bodyweight-free-bilateral-no-load"
  ],
  [
    "run_int_warm",
    "Calentamiento",
    "run",
    "run",
    "bodyweight",
    false,
    null,
    null,
    "positions-run-bodyweight-free-bilateral-no-load"
  ],
  [
    "run_tempo_warm",
    "Calentamiento",
    "run",
    "run",
    "bodyweight",
    false,
    null,
    null,
    "positions-run-bodyweight-free-bilateral-no-load"
  ],
  [
    "run_warm",
    "Calentamiento",
    "run",
    "run",
    "bodyweight",
    false,
    null,
    null,
    "positions-run-bodyweight-free-bilateral-no-load"
  ],
  [
    "run_warm2",
    "Calentamiento",
    "run",
    "run",
    "bodyweight",
    false,
    null,
    null,
    "positions-run-bodyweight-free-bilateral-no-load"
  ],
  [
    "run_hyrox_sim_1",
    "Carrera 1",
    "run",
    "run",
    "bodyweight",
    false,
    null,
    null,
    "positions-run-bodyweight-free-bilateral-no-load"
  ],
  [
    "run_hyrox_sim_2",
    "Carrera 2",
    "run",
    "run",
    "bodyweight",
    false,
    null,
    null,
    "positions-run-bodyweight-free-bilateral-no-load"
  ],
  [
    "run_hyrox_easy",
    "Carrera cómoda",
    "run",
    "run",
    "bodyweight",
    false,
    null,
    null,
    "positions-run-bodyweight-free-bilateral-no-load"
  ],
  [
    "run_hyrox_mini_start",
    "Carrera inicial",
    "run",
    "run",
    "bodyweight",
    false,
    null,
    null,
    "positions-run-bodyweight-free-bilateral-no-load"
  ],
  [
    "run_hyrox_mini_mid",
    "Carrera media",
    "run",
    "run",
    "bodyweight",
    false,
    null,
    null,
    "positions-run-bodyweight-free-bilateral-no-load"
  ],
  [
    "run_hyrox_warm",
    "Entrada suave",
    "run",
    "run",
    "bodyweight",
    false,
    null,
    null,
    "positions-run-bodyweight-free-bilateral-no-load"
  ],
  [
    "run_long_warm",
    "Entrada suave",
    "run",
    "run",
    "bodyweight",
    false,
    null,
    null,
    "positions-run-bodyweight-free-bilateral-no-load"
  ],
  [
    "run_int",
    "Fartlek controlado",
    "run",
    "run",
    "bodyweight",
    false,
    null,
    null,
    "positions-run-bodyweight-free-bilateral-no-load"
  ],
  [
    "run_base",
    "Rodaje cómodo",
    "run",
    "run",
    "bodyweight",
    false,
    null,
    null,
    "positions-run-bodyweight-free-bilateral-no-load"
  ],
  [
    "run_long",
    "Rodaje largo fácil",
    "run",
    "run",
    "bodyweight",
    false,
    null,
    null,
    "positions-run-bodyweight-free-bilateral-no-load"
  ],
  [
    "run_rec",
    "Rodaje recuperación",
    "run",
    "run",
    "bodyweight",
    false,
    null,
    null,
    "positions-run-bodyweight-free-bilateral-no-load"
  ],
  [
    "run_tempo_cool",
    "Soltar",
    "run",
    "run",
    "bodyweight",
    false,
    null,
    null,
    "positions-run-bodyweight-free-bilateral-no-load"
  ],
  [
    "run_long_cool",
    "Soltar piernas",
    "run",
    "run",
    "bodyweight",
    false,
    null,
    null,
    "positions-run-bodyweight-free-bilateral-no-load"
  ],
  [
    "run_tempo",
    "Tempo controlado",
    "run",
    "run",
    "bodyweight",
    false,
    null,
    null,
    "positions-run-bodyweight-free-bilateral-no-load"
  ],
  [
    "run_long",
    "Tirada larga fácil",
    "run",
    "run",
    "bodyweight",
    false,
    null,
    null,
    "positions-run-bodyweight-free-bilateral-no-load"
  ],
  [
    "run_cool",
    "Vuelta a la calma",
    "run",
    "run",
    "bodyweight",
    false,
    null,
    null,
    "positions-run-bodyweight-free-bilateral-no-load"
  ],
  [
    "run_cool2",
    "Vuelta a la calma",
    "run",
    "run",
    "bodyweight",
    false,
    null,
    null,
    "positions-run-bodyweight-free-bilateral-no-load"
  ],
  [
    "run_easy_cool",
    "Vuelta a la calma",
    "run",
    "run",
    "bodyweight",
    false,
    null,
    null,
    "positions-run-bodyweight-free-bilateral-no-load"
  ],
  [
    "run_int_cool",
    "Vuelta a la calma",
    "run",
    "run",
    "bodyweight",
    false,
    null,
    null,
    "positions-run-bodyweight-free-bilateral-no-load"
  ],
  [
    "run_tempo_cool",
    "Vuelta a la calma",
    "run",
    "run",
    "bodyweight",
    false,
    null,
    null,
    "positions-run-bodyweight-free-bilateral-no-load"
  ],
  [
    "run_hyrox_zone2",
    "Zona 2 / caminar rápido",
    "run",
    "choice",
    "bodyweight",
    false,
    null,
    null,
    "overview-run-walk-options",
    {
      "es": "Opciones de carrera suave y caminar rápido: vista orientativa de las opciones.",
      "en": "Easy running and brisk-walking options: indicative overview of the options."
    }
  ],
  [
    "run_easy",
    "Zona 2 cómoda",
    "run",
    "run",
    "bodyweight",
    false,
    null,
    null,
    "positions-run-bodyweight-free-bilateral-no-load"
  ],
  [
    "time_cross_12_amrap",
    "AMRAP 12",
    "time",
    "circuit",
    "none",
    false,
    null,
    null,
    "overview-circuit"
  ],
  [
    "time_wod_annie_cap20",
    "Annie · cap 20",
    "time",
    "circuit",
    "none",
    false,
    null,
    null,
    "overview-circuit"
  ],
  [
    "time_cross_benchmark_20",
    "Benchmark 20",
    "time",
    "circuit",
    "none",
    false,
    null,
    null,
    "overview-circuit"
  ],
  [
    "time_hyrox_burpee",
    "Burpee broad jump escalado",
    "time",
    "choice",
    "bodyweight",
    false,
    null,
    null,
    "positions-scaled-burpee-broad-jump",
    {
      "es": "Burpee con salto, puntos orientativos escalados: dos posiciones de una variante de ejemplo; respeta el material mostrado.",
      "en": "Scaled burpee broad jump, orientation points: two positions of an example variant; use the equipment shown."
    }
  ],
  [
    "time_cross_carry",
    "Cargar y caminar",
    "time",
    "choice",
    "none",
    false,
    null,
    null,
    "overview-none"
  ],
  [
    "time_wod_chipper_20",
    "Chipper 20 · cap 20",
    "time",
    "circuit",
    "none",
    false,
    null,
    null,
    "overview-circuit"
  ],
  [
    "time_wod_cindy_20",
    "Cindy 20 · AMRAP",
    "time",
    "circuit",
    "none",
    false,
    null,
    null,
    "overview-circuit"
  ],
  [
    "time_hyrox_core",
    "Core anti-rotación",
    "time",
    "choice",
    "none",
    false,
    null,
    null,
    "overview-none"
  ],
  [
    "time_wod_dt_light_cap20",
    "DT ligero · cap 20",
    "time",
    "circuit",
    "none",
    false,
    null,
    null,
    "overview-circuit"
  ],
  [
    "time_cross_emom_15",
    "EMOM 15",
    "time",
    "circuit",
    "none",
    false,
    null,
    null,
    "overview-circuit"
  ],
  [
    "time_hyrox_sled_push",
    "Empuje sustituto",
    "time",
    "choice",
    "none",
    false,
    null,
    null,
    "overview-none"
  ],
  [
    "time_hyrox_farmer",
    "Farmer carry",
    "time",
    "choice",
    "none",
    false,
    null,
    null,
    "positions-carry-dumbbell-free-bilateral-load2",
    {
      "es": "Ejemplo de paseo del granjero con dos mancuernas; confirma el material indicado para tu estación.",
      "en": "Example of farmer carry with two dumbbells; confirm your station’s specified equipment."
    }
  ],
  [
    "time_wod_fgb_17",
    "Fight Gone Bad · 3 rondas",
    "time",
    "circuit",
    "none",
    false,
    null,
    null,
    "overview-circuit"
  ],
  [
    "time_wod_helen_cap20",
    "Helen · 3 rondas cap 20",
    "time",
    "circuit",
    "none",
    false,
    null,
    null,
    "overview-circuit"
  ],
  [
    "time_hyrox_mobility",
    "Movilidad específica",
    "time",
    "mobility",
    "bodyweight",
    false,
    null,
    null,
    "overview-mobility"
  ],
  [
    "time_cross_mobility",
    "Movilidad final",
    "time",
    "mobility",
    "bodyweight",
    false,
    null,
    null,
    "overview-mobility"
  ],
  [
    "time_hyrox_row",
    "Remo ergómetro",
    "time",
    "erg_row",
    "ergometer",
    true,
    null,
    null,
    "positions-erg-row-ergometer-supported-bilateral-no-load"
  ],
  [
    "time_hyrox_row",
    "Remo sustituto",
    "time",
    "choice",
    "none",
    false,
    null,
    null,
    "overview-none"
  ],
  [
    "time_hyrox_skierg",
    "SkiErg controlado",
    "time",
    "ski",
    "ergometer",
    false,
    null,
    null,
    "positions-ski-ergometer-free-bilateral-no-load"
  ],
  [
    "time_hyrox_skierg",
    "SkiErg sustituto",
    "time",
    "choice",
    "none",
    false,
    null,
    null,
    "overview-none"
  ],
  [
    "time_hyrox_sled_pull",
    "Sled pull / tirón",
    "time",
    "sled_pull",
    "sled",
    false,
    null,
    null,
    "positions-sled-pull-sled-free-bilateral-no-load"
  ],
  [
    "time_hyrox_sled_push",
    "Sled push / empuje",
    "time",
    "sled_push",
    "sled",
    false,
    null,
    null,
    "positions-sled-push-sled-free-bilateral-no-load"
  ],
  [
    "time_cross_skill_squat",
    "Técnica de sentadilla",
    "time",
    "choice",
    "none",
    false,
    null,
    null,
    "overview-none"
  ],
  [
    "time_hyrox_sled_pull",
    "Tirón sustituto",
    "time",
    "choice",
    "none",
    false,
    null,
    null,
    "overview-none"
  ],
  [
    "time_hyrox_wallball",
    "Wall balls escalados",
    "time",
    "choice",
    "none",
    false,
    null,
    null,
    "overview-none"
  ],
  [
    "time_hyrox_lunge",
    "Zancadas / sandbag lunges",
    "time",
    "choice",
    "none",
    false,
    null,
    null,
    "overview-none"
  ],
  [
    "slider_curl",
    "Curl femoral sliders",
    "",
    "sliding_curl",
    "slider",
    false,
    null,
    null,
    "positions-sliding-curl-slider-free-bilateral-load1"
  ],
  [
    "dm",
    "Dominadas asistidas",
    "",
    "choice",
    "none",
    false,
    null,
    null,
    "positions-assisted-pull-up-machine",
    {
      "es": "Dominadas asistidas, ejemplo en máquina: dos posiciones de una variante de ejemplo; respeta el material mostrado.",
      "en": "Assisted pull-up, machine example: two positions of an example variant; use the equipment shown."
    }
  ],
  [
    "weighted_pullup",
    "Dominadas con menos asistencia",
    "",
    "choice",
    "none",
    false,
    null,
    null,
    "positions-assisted-pull-up-machine",
    {
      "es": "Dominadas asistidas, ejemplo en máquina: dos posiciones de una variante de ejemplo; respeta el material mostrado.",
      "en": "Assisted pull-up, machine example: two positions of an example variant; use the equipment shown."
    }
  ],
  [
    "leg_extension_light",
    "Extensión cuádriceps ligera",
    "",
    "leg_extension",
    "machine",
    true,
    null,
    null,
    "positions-leg-extension-machine-supported-bilateral-no-load"
  ],
  [
    "fd",
    "Fondos asistidos",
    "",
    "choice",
    "none",
    false,
    null,
    null,
    "positions-assisted-dip-machine",
    {
      "es": "Fondos asistidos, ejemplo en máquina: dos posiciones de una variante de ejemplo; respeta el material mostrado.",
      "en": "Assisted dip, machine example: two positions of an example variant; use the equipment shown."
    }
  ],
  [
    "fondos_banco",
    "Fondos en banco",
    "",
    "bench_dip",
    "bodyweight",
    true,
    null,
    null,
    "positions-bench-dip-bodyweight-supported-bilateral-no-load"
  ],
  [
    "goblet",
    "Goblet squat",
    "",
    "choice",
    "none",
    false,
    null,
    null,
    "overview-none"
  ],
  [
    "neutral_pulldown",
    "Jalón agarre neutro",
    "",
    "pulldown",
    "machine",
    true,
    null,
    null,
    "positions-pulldown-machine-supported-bilateral-no-load-neutral-grip"
  ],
  [
    "deadlift_heavy",
    "Peso muerto pesado técnico",
    "",
    "deadlift",
    "none",
    false,
    null,
    null,
    "overview-none"
  ],
  [
    "pb",
    "Press de banca plano",
    "",
    "bench_press",
    "none",
    true,
    null,
    null,
    "overview-none"
  ],
  [
    "hamstring_bridge",
    "Puente isquios",
    "",
    "bridge",
    "bodyweight",
    false,
    null,
    null,
    "positions-bridge-bodyweight-free-bilateral-no-load-hamstring-bias"
  ],
  [
    "chest_supported_row",
    "Remo con pecho apoyado",
    "",
    "chest_row",
    "none",
    true,
    null,
    null,
    "overview-none"
  ],
  [
    "remo_inv",
    "Remo invertido",
    "",
    "inverted_row",
    "bodyweight",
    true,
    null,
    null,
    "positions-inverted-row-bodyweight-supported-bilateral-no-load"
  ],
  [
    "box_squat",
    "Sentadilla a caja",
    "",
    "chair_squat",
    "none",
    true,
    null,
    null,
    "positions-box-squat-unloaded",
    {
      "es": "Sentadilla a caja, ejemplo sin carga: dos posiciones de una variante de ejemplo; respeta el material mostrado.",
      "en": "Box squat, unloaded example: two positions of an example variant; use the equipment shown."
    }
  ],
  [
    "split",
    "Sentadilla búlgara",
    "",
    "split_squat",
    "none",
    true,
    null,
    null,
    "overview-none"
  ],
  [
    "sissy",
    "Sissy squat asistida",
    "",
    "choice",
    "none",
    true,
    null,
    null,
    "positions-supported-sissy-squat",
    {
      "es": "Sissy squat asistida, ejemplo de rango corto con apoyo: dos posiciones de una variante de ejemplo; respeta el material mostrado.",
      "en": "Assisted sissy squat, supported short-range example: two positions of an example variant; use the equipment shown."
    }
  ],
  [
    "su",
    "Step-up",
    "",
    "step_up",
    "none",
    true,
    null,
    null,
    "positions-step-up-bodyweight-supported-bilateral-no-load-low-step",
    {
      "es": "Ejemplo de step-up sin carga sobre escalón bajo y estable.",
      "en": "Example of an unloaded step-up on a low stable step."
    }
  ],
  [
    "lunge_reverse",
    "Zancada atrás",
    "",
    "lunge",
    "none",
    false,
    null,
    null,
    "positions-reverse-lunge-unloaded",
    {
      "es": "Zancada atrás, ejemplo sin carga: dos posiciones de una variante de ejemplo; respeta el material mostrado.",
      "en": "Reverse lunge, unloaded example: two positions of an example variant; use the equipment shown."
    }
  ],
  [
    "reverse_lunge",
    "Zancada atrás",
    "",
    "lunge",
    "none",
    false,
    null,
    null,
    "positions-reverse-lunge-unloaded",
    {
      "es": "Zancada atrás, ejemplo sin carga: dos posiciones de una variante de ejemplo; respeta el material mostrado.",
      "en": "Reverse lunge, unloaded example: two positions of an example variant; use the equipment shown."
    }
  ],
  [
    "vital_hip_hinge",
    "Bisagra de cadera con apoyo",
    "vital",
    "hinge",
    "bodyweight",
    true,
    null,
    null,
    "positions-hinge-bodyweight-supported-bilateral-no-load"
  ],
  [
    "vital_hip_hinge",
    "Bisagra de cadera con manos en muslos",
    "vital",
    "hinge_hands_thighs",
    "bodyweight",
    false,
    null,
    null,
    "positions-hinge-hands-thighs-bodyweight-free-bilateral-no-load"
  ],
  [
    "vital_march",
    "Caminar en el sitio",
    "vital",
    "march",
    "bodyweight",
    false,
    null,
    null,
    "positions-march-bodyweight-free-bilateral-no-load"
  ],
  [
    "vital_wall_push",
    "Empujar una pared",
    "vital",
    "wall_push",
    "bodyweight",
    true,
    null,
    null,
    "positions-wall-push-bodyweight-supported-bilateral-no-load"
  ],
  [
    "vital_sit_stand",
    "Levantarte mejor de una silla",
    "vital",
    "chair_squat",
    "chair",
    true,
    null,
    null,
    "positions-chair-squat-chair-supported-bilateral-no-load"
  ],
  [
    "vital_carry",
    "Marcha erguida en el sitio",
    "vital",
    "march",
    "bodyweight",
    false,
    null,
    null,
    "positions-march-bodyweight-free-bilateral-no-load"
  ],
  [
    "vital_hip_hinge",
    "Peso muerto rumano muy ligero",
    "vital",
    "rdl",
    "dumbbell",
    false,
    null,
    null,
    "positions-rdl-dumbbell-free-bilateral-load2"
  ],
  [
    "vital_heel_raise",
    "Ponerte de puntillas",
    "vital",
    "calf",
    "bodyweight",
    true,
    null,
    null,
    "positions-calf-bodyweight-supported-bilateral-no-load"
  ],
  [
    "vital_balance",
    "Practicar equilibrio",
    "vital",
    "balance",
    "bodyweight",
    true,
    null,
    null,
    "positions-balance-bodyweight-supported-bilateral-no-load"
  ],
  [
    "vital_row",
    "Remo con toalla sentado",
    "vital",
    "cable_row",
    "towel",
    true,
    null,
    null,
    "positions-cable-row-towel-supported-bilateral-load1"
  ],
  [
    "vital_row",
    "Remo sentado suave",
    "vital",
    "cable_row",
    "none",
    true,
    null,
    null,
    "positions-vital-seated-row-unloaded",
    {
      "es": "Remo sentado suave, ejemplo sin resistencia externa: dos posiciones de una variante de ejemplo; respeta el material mostrado.",
      "en": "Gentle seated row, unloaded example: two positions of an example variant; use the equipment shown."
    }
  ],
  [
    "vital_mobility",
    "Soltar hombros y cadera",
    "vital",
    "mobility",
    "bodyweight",
    false,
    null,
    null,
    "overview-mobility"
  ],
  [
    "vital_step_up",
    "Subir un escalón bajo",
    "vital",
    "step_up",
    "bodyweight",
    true,
    null,
    null,
    "positions-step-up-bodyweight-supported-bilateral-no-load-low-step"
  ],
  [
    "walk_brisk",
    "Caminar alegre",
    "walk",
    "walk",
    "bodyweight",
    false,
    null,
    null,
    "positions-walk-bodyweight-free-bilateral-no-load"
  ],
  [
    "walk_warm",
    "Entrada suave",
    "walk",
    "walk",
    "bodyweight",
    false,
    null,
    null,
    "positions-walk-bodyweight-free-bilateral-no-load"
  ],
  [
    "walk_cross_easy",
    "Paseo activo",
    "walk",
    "walk",
    "bodyweight",
    false,
    null,
    null,
    "positions-walk-bodyweight-free-bilateral-no-load"
  ],
  [
    "walk_easy_start",
    "Paseo cómodo",
    "walk",
    "walk",
    "bodyweight",
    false,
    null,
    null,
    "positions-walk-bodyweight-free-bilateral-no-load"
  ],
  [
    "vital_walk",
    "Paseo de confianza",
    "walk",
    "walk",
    "bodyweight",
    false,
    null,
    null,
    "positions-walk-bodyweight-free-bilateral-no-load"
  ],
  [
    "walk_long",
    "Paseo largo cómodo",
    "walk",
    "walk",
    "bodyweight",
    false,
    null,
    null,
    "positions-walk-bodyweight-free-bilateral-no-load"
  ],
  [
    "walk_free",
    "Paseo libre",
    "walk",
    "walk",
    "bodyweight",
    false,
    null,
    null,
    "positions-walk-bodyweight-free-bilateral-no-load"
  ],
  [
    "walk_short",
    "Paseo mínimo viable",
    "walk",
    "walk",
    "bodyweight",
    false,
    null,
    null,
    "positions-walk-bodyweight-free-bilateral-no-load"
  ],
  [
    "walk_cool2",
    "Soltar",
    "walk",
    "walk",
    "bodyweight",
    false,
    null,
    null,
    "positions-walk-bodyweight-free-bilateral-no-load"
  ],
  [
    "walk_cool",
    "Vuelta tranquila",
    "walk",
    "walk",
    "bodyweight",
    false,
    null,
    null,
    "positions-walk-bodyweight-free-bilateral-no-load"
  ]
];
  const normalize=value=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();
  const key=(id,name,equipment)=>JSON.stringify([normalize(id),normalize(name),normalize(equipment)]);
  const index=new Map();
  rows.forEach(row=>{
    const identity=key(row[0],row[1],row[2]);
    if(index.has(identity))throw new Error('Duplicate built-in illustration identity');
    index.set(identity,row);
  });
  function cloneProfile(row){
    return {pose:row[3],tool:row[4],label:row[1],support:row[5],...(row[6]?{mediaKey:row[6]}:{}),...(row[7]?{...row[7]}:{}),...(row[8]?{generatedMediaKey:row[8]}:{}),...(row[9]?{generatedMediaAlt:{...row[9]}}:{}),known:true};
  }
  function profile(ex){
    if(!ex||typeof ex!=='object'||Array.isArray(ex))return null;
    if(!['id','name','equipment'].every(field=>Object.prototype.hasOwnProperty.call(ex,field)&&typeof ex[field]==='string'))return null;
    const row=index.get(key(ex.id,ex.name,ex.equipment));
    return row?cloneProfile(row):null;
  }
  function catalogue(){
    return rows.map(row=>({id:row[0],name:row[1],equipment:row[2],...cloneProfile(row)}));
  }
  root.exerciseIllustrationProfile=profile;
  root.exerciseIllustrationCatalogue=catalogue;
})(globalThis);

