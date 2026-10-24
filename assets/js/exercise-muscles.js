/*
 * EntrenoApp educational exercise profiles, reviewed 2026-10-23.
 * Original schematic artwork. No external illustrations, animations or photographs.
 * Primary/support are editorial movement-role categories, not measured activation,
 * recovery estimates, exhaustive anatomy, or an assessment of the user's technique.
 * Source links are retained per profile. Third-party media requires separate review.
 */
(function (root) {
  'use strict';

  const labels = {
    chest: {es:'Pecho', en:'Chest'},
    front_delts: {es:'Hombro anterior', en:'Front shoulders'},
    side_delts: {es:'Hombro lateral', en:'Side shoulders'},
    rear_delts: {es:'Hombro posterior', en:'Rear shoulders'},
    biceps: {es:'Bíceps', en:'Biceps'},
    triceps: {es:'Tríceps', en:'Triceps'},
    forearms: {es:'Antebrazos', en:'Forearms'},
    upper_back: {es:'Espalda alta y media', en:'Upper and middle back'},
    lats: {es:'Dorsales', en:'Lats'},
    lower_back: {es:'Espalda baja', en:'Lower back'},
    core: {es:'Zona abdominal', en:'Core'},
    glutes: {es:'Glúteos', en:'Glutes'},
    quads: {es:'Cuádriceps', en:'Quadriceps'},
    hamstrings: {es:'Isquiotibiales', en:'Hamstrings'},
    calves: {es:'Pantorrillas', en:'Calves'},
    adductors: {es:'Aductores', en:'Adductors'}
  };
  const source = {
    squat:'https://blog.nasm.org/sports-performance/front-squat-back-squat-choose',
    squatGuide:'https://www.acefitness.org/resources/everyone/exercise-library/11/back-squat/',
    goblet:'https://www.nasm.org/resource-center/blog/training/how-to-perform-goblet-squats',
    bench:'https://www.nasm.org/resource-center/exercise-library/barbell-bench-press',
    incline:'https://wger.de/api/v2/exerciseinfo/537/',
    row:'https://www.acefitness.org/resources/everyone/exercise-library/12/bent-over-row/',
    rowGroups:'https://www.acefitness.org/resources/everyone/exercise-library/body-part/back/rhomboids/',
    cableRow:'https://www.acefitness.org/resources/everyone/exercise-library/48/seated-row/',
    rdl:'https://www.acefitness.org/continuing-education/certified/may-2025/8865/the-ace-do-it-better-series-the-romanian-deadlift/',
    pulldown:'https://www.nasm.org/resource-center/blog/training/the-biomechanics-of-the-lat-pulldown-muscles-grip-and-form',
    shoulder:'https://www.acefitness.org/resources/everyone/exercise-library/43/seated-shoulder-press/',
    shoulderStudy:'https://www.acefitness.org/certifiednews/images/article/pdfs/ACEShoulderStudy.pdf',
    lateral:'https://www.acefitness.org/resources/everyone/exercise-library/26/lateral-raise/',
    curl:'https://www.acefitness.org/resources/everyone/exercise-library/70/bicep-curl/',
    armGroups:'https://blog.nasm.org/workout-plans/9-best-arm-exercises/',
    pushup:'https://www.nasm.org/resource-center/exercise-library/push-up',
    bands:'https://www.acefitness.org/getfit/rubrbndwkout.pdf',
    bandRow:'https://wger.de/api/v2/exerciseinfo/2635/',
    bandPulldown:'https://www.acefitness.org/resources/everyone/exercise-library/35/kneeling-lat-pulldown/',
    legExtension:'https://www.nsca.com/contentassets/8a9e72cb76d64bacaa439f088babc3e3/ptq-9.3.4-the-1x20-strength-training-program-for-older-adults.pdf',
    seatedLegCurl:'https://www.nasm.org/workout-exercise-guidance/how-to-seated-leg-curl',
    lyingLegCurl:'https://www.nasm.org/resource-center/exercise-library/lying-leg-curl',
    hipThrust:'https://www.acefitness.org/continuing-education/certified/november-2019/7403/understanding-the-barbell-hip-thrust/',
    hammerCurl:'https://www.acefitness.org/resources/everyone/exercise-library/10/hammer-curl/',
    supportedRow:'https://inspirefitnesssolutions.co.uk/wp-content/uploads/2015/10/Inspire-FT2-Exercise-Manual.pdf',
    seatedShoulder:'https://www.acefitness.org/resources/everyone/blog/6595/ace-s-kick-start-workout-phase-ii/'
  };
  const profiles = {};
  const fingerprints = new Map();
  const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[\s_-]+/g,' ').trim();
  const equipmentAliases = {gym:'gym',mancuernas:'mancuernas',bandas:'bandas',nada:'nada'};
  function register(key, equipment, names, primary, secondary, sources, es, en) {
    profiles[key] = {key,primary,secondary,sources,cue:{es,en}};
    equipment.forEach(material=>names.forEach(name=>{
      const fingerprint = `${material}|${normalize(name)}`;
      if(fingerprints.has(fingerprint))throw new Error('Duplicate reviewed exercise fingerprint');
      fingerprints.set(fingerprint,key);
    }));
  }

  register('squat_barbell',['gym'],['Sentadilla con barra','Sentadilla'],
    ['quads','glutes'],['adductors','core'],[source.squat,source.squatGuide],
    'Baja con control y mantén los pies apoyados.',
    'Lower under control and keep your feet planted.');
  register('squat_bodyweight',['nada'],['Sentadilla tempo','Sentadilla lenta','Sentadilla al aire','Sentadillas al aire'],
    ['quads','glutes'],['core'],[source.squat],
    'Baja despacio hasta un recorrido que puedas controlar.',
    'Lower slowly through a range you can control.');
  register('goblet_squat',['mancuernas'],['Sentadilla goblet','Goblet squat'],
    ['quads','glutes'],['core','upper_back'],[source.goblet],
    'Mantén la mancuerna cerca del pecho y el torso estable.',
    'Keep the dumbbell close to your chest and your torso steady.');
  register('bench_barbell',['gym'],['Press de banca','Press de banca plano'],
    ['chest'],['triceps','front_delts'],[source.bench],
    'Apoya los pies y baja la barra con control.',
    'Plant your feet and lower the bar under control.');
  register('bench_dumbbell_flat',['gym','mancuernas'],['Press pecho con mancuernas','Press con mancuernas'],
    ['chest'],['triceps','front_delts'],[source.bench],
    'Baja ambas mancuernas con control, sin cambiar la postura.',
    'Lower both dumbbells under control without shifting your position.');
  register('bench_dumbbell_incline',['gym','mancuernas'],['Press inclinado mancuernas','Press inclinado con mancuernas'],
    ['chest'],['front_delts','triceps'],[source.incline,source.bench],
    'Mantén la espalda apoyada y controla la bajada.',
    'Keep your back supported and control the lowering phase.');
  register('barbell_row',['gym'],['Remo con barra'],
    ['lats','upper_back'],['biceps','rear_delts'],[source.row,source.rowGroups],
    'Mantén el torso estable y lleva los codos hacia atrás.',
    'Keep your torso steady and draw your elbows back.');
  register('cable_row',['gym'],['Remo cable bajo','Remo en polea sentado'],
    ['lats','upper_back'],['biceps'],[source.cableRow,source.rowGroups],
    'Tira con los codos sin balancear el torso.',
    'Draw your elbows back without rocking your torso.');
  register('rdl_barbell',['gym'],['Peso muerto rumano'],
    ['hamstrings','glutes'],['lower_back','adductors','forearms'],[source.rdl],
    'Lleva la cadera atrás y mantén la barra cerca de las piernas.',
    'Move your hips back and keep the bar close to your legs.');
  register('rdl_dumbbell',['mancuernas'],['Peso muerto rumano con mancuernas','Peso muerto rumano mancuernas'],
    ['hamstrings','glutes'],['lower_back','adductors','forearms'],[source.rdl],
    'Lleva la cadera atrás sin redondear la espalda.',
    'Move your hips back without rounding your back.');
  register('lat_pulldown',['gym'],['Jalón agarre ancho','Jalón al pecho','Jalón agarre cerrado','Jalón agarre neutro'],
    ['lats'],['biceps','upper_back','rear_delts'],[source.pulldown],
    'Lleva los codos hacia abajo y evita balancearte.',
    'Drive your elbows down and avoid swinging.');
  register('overhead_barbell',['gym'],['Press hombros barra','Press hombros'],
    ['front_delts','side_delts'],['triceps','upper_back'],[source.shoulder,source.shoulderStudy],
    'Empuja hacia arriba sin arquear la espalda.',
    'Press upward without arching your back.');
  register('overhead_dumbbell',['mancuernas'],['Press hombro con mancuernas','Press hombros mancuernas'],
    ['front_delts','side_delts'],['triceps','upper_back'],[source.shoulderStudy,source.shoulder],
    'Mantén el torso estable mientras elevas las mancuernas.',
    'Keep your torso steady as you press the dumbbells up.');
  register('lateral_raise',['gym','mancuernas'],['Elevaciones laterales'],
    ['side_delts'],[],[source.lateral,source.shoulderStudy],
    'Eleva los brazos con control y sin impulso del torso.',
    'Raise your arms under control without swinging your torso.');
  register('biceps_curl_barbell',['gym'],['Curl bíceps barra','Curl bíceps con barra','Curl bíceps'],
    ['biceps'],['forearms'],[source.curl,source.armGroups],
    'Mantén los codos cerca del cuerpo y evita balancearte.',
    'Keep your elbows close to your body and avoid swinging.');
  register('biceps_curl_dumbbell',['mancuernas'],['Curl bíceps con mancuernas','Curl con mancuernas'],
    ['biceps'],['forearms'],[source.armGroups],
    'Mueve el antebrazo sin desplazar el codo.',
    'Move your forearm without shifting your elbow.');
  register('push_up',['nada'],['Flexiones','Flexiones controladas','Flexiones profundas'],
    ['chest','triceps'],['front_delts','core'],[source.pushup],
    'Mantén el cuerpo alineado y controla la bajada.',
    'Keep your body aligned and control the lowering phase.');
  register('band_chest_press',['bandas'],['Press de pecho con banda'],
    ['chest'],['triceps','front_delts'],[source.bands,source.bench],
    'Mantén el torso estable y vuelve despacio.',
    'Keep your torso steady and return slowly.');
  register('band_row',['bandas'],['Remo con banda','Remo sentado con banda'],
    ['lats','upper_back'],['biceps'],[source.bandRow,source.cableRow],
    'Lleva los codos atrás y controla la vuelta de la banda.',
    'Draw your elbows back and control the band on the return.');
  register('band_pulldown',['bandas'],['Jalón con banda'],
    ['lats'],['biceps','upper_back'],[source.bandPulldown,source.pulldown],
    'Comprueba el anclaje y lleva los codos hacia las costillas.',
    'Check the anchor and draw your elbows toward your ribs.');
  register('leg_extension',['gym'],['Extensión cuádriceps','Extensión de cuádriceps'],
    ['quads'],[],[source.legExtension],
    'Extiende las rodillas con control y evita dar impulso con el cuerpo.',
    'Extend your knees under control without using your body for momentum.');
  register('leg_curl',['gym'],['Curl femoral'],
    ['hamstrings'],['calves'],[source.seatedLegCurl,source.lyingLegCurl],
    'Flexiona las rodillas con control y mantén la cadera estable.',
    'Bend your knees under control and keep your hips steady.');
  register('hip_thrust',['gym'],['Hip thrust','Hip thrust barra'],
    ['glutes'],['hamstrings','adductors'],[source.hipThrust],
    'Eleva la cadera con control sin extender de más la espalda.',
    'Lift your hips under control without overextending your back.');
  register('band_squat',['bandas'],['Sentadilla con banda'],
    ['quads','glutes'],['core','adductors'],[source.bands,source.squat],
    'Comprueba la posición de la banda y baja con los pies apoyados.',
    'Check the band position and lower with your feet planted.');
  register('hammer_curl',['gym','mancuernas'],['Curl martillo'],
    ['biceps'],['forearms'],[source.hammerCurl,source.armGroups],
    'Mantén las palmas enfrentadas y los codos cerca del cuerpo.',
    'Keep your palms facing each other and your elbows close to your body.');
  // A generic machine row does not establish that a chest support is present.
  register('chest_supported_row',['gym'],['Remo máquina pecho','Remo en máquina con pecho apoyado'],
    ['lats','upper_back'],['biceps'],[source.supportedRow,source.rowGroups],
    'Mantén el pecho apoyado y tira sin separar el torso del soporte.',
    'Keep your chest supported and row without lifting your torso off the pad.');
  register('overhead_dumbbell_seated',['gym','mancuernas'],['Press hombro con mancuernas sentado','Press hombros con mancuernas sentado','Press hombros mancuernas sentado','Press hombros sentado con mancuernas','Press militar sentado con mancuernas'],
    ['front_delts','side_delts'],['triceps','upper_back'],[source.seatedShoulder,source.shoulderStudy],
    'Mantén el torso estable y sube las mancuernas sin arquear la espalda.',
    'Keep your torso steady and press the dumbbells up without arching your back.');

  function variantKey(ex) {
    if(!ex || typeof ex!=='object' || Array.isArray(ex))return null;
    const material=(typeof ex.equipment==='string'&&Object.prototype.hasOwnProperty.call(equipmentAliases,ex.equipment)?equipmentAliases[ex.equipment]:'') || (ex.type==='bodyweight'&&!ex.equipment?'nada':'');
    if(!material || typeof ex.name!=='string')return null;
    const name=normalize(ex.name);
    // Gym is an availability category: these generic names establish a barbell
    // variant only for their exact catalogue identity, not a custom exercise.
    const catalogueId=name==='sentadilla'?'sq':name==='press hombros'?'ph':name==='curl biceps'?'cb':null;
    if(material==='gym' && catalogueId && ex.id!==catalogueId)return null;
    return fingerprints.get(`${material}|${name}`) || null;
  }
  function label(zone,lang='es') {
    return labels[zone]?.[lang==='en'?'en':'es'] || '';
  }
  function profile(ex) {
    const key=variantKey(ex),item=key&&profiles[key];
    return item ? {key,primary:[...item.primary],secondary:[...item.secondary],sources:[...item.sources],cue:{...item.cue}} : null;
  }

  const front = [
    ['chest','M86 98 Q100 89 118 98 L117 126 Q98 133 85 119 Z M122 98 Q140 89 154 98 L155 119 Q142 133 123 126 Z'],
    ['front_delts','M78 91 Q91 90 86 117 L78 130 Q67 117 69 105 Q70 96 78 91 Z M162 91 Q149 90 154 117 L162 130 Q173 117 171 105 Q170 96 162 91 Z'],
    ['side_delts','M69 94 Q61 96 59 112 L63 133 L74 124 Q66 108 75 96 Z M171 94 Q179 96 181 112 L177 133 L166 124 Q174 108 165 96 Z'],
    ['biceps','M64 132 Q75 129 76 143 L70 167 Q58 174 57 160 Z M176 132 Q165 129 164 143 L170 167 Q182 174 183 160 Z'],
    ['triceps','M55 130 L61 135 L54 166 L48 174 Q48 150 55 130 Z M185 130 L179 135 L186 166 L192 174 Q192 150 185 130 Z'],
    ['forearms','M55 179 Q65 175 65 186 L58 221 L46 221 Q45 204 55 179 Z M185 179 Q175 175 175 186 L182 221 L194 221 Q195 204 185 179 Z'],
    ['core','M99 135 Q120 141 141 135 L139 190 L120 207 L101 190 Z'],
    ['quads','M87 222 Q101 214 112 225 L112 282 Q108 305 93 309 Q80 286 82 257 Z M153 222 Q139 214 128 225 L128 282 Q132 305 147 309 Q160 286 158 257 Z'],
    ['adductors','M113 226 L119 232 L119 270 L111 290 Q116 258 113 226 Z M127 226 L121 232 L121 270 L129 290 Q124 258 127 226 Z']
  ];
  const back = [
    ['upper_back','M100 83 L140 83 L153 112 L135 145 L120 153 L105 145 L87 112 Z'],
    ['rear_delts','M78 91 Q91 90 89 111 L77 130 Q66 117 69 105 Q70 96 78 91 Z M162 91 Q149 90 151 111 L163 130 Q174 117 171 105 Q170 96 162 91 Z'],
    ['side_delts','M69 94 Q61 96 59 112 L63 133 L74 124 Q66 108 75 96 Z M171 94 Q179 96 181 112 L177 133 L166 124 Q174 108 165 96 Z'],
    ['triceps','M63 131 Q75 128 76 141 L69 170 Q57 171 56 159 Z M177 131 Q165 128 164 141 L171 170 Q183 171 184 159 Z'],
    ['forearms','M55 179 Q65 175 65 186 L58 221 L46 221 Q45 204 55 179 Z M185 179 Q175 175 175 186 L182 221 L194 221 Q195 204 185 179 Z'],
    ['lats','M87 124 L109 150 L117 161 L109 194 L95 181 L88 153 Z M153 124 L131 150 L123 161 L131 194 L145 181 L152 153 Z'],
    ['lower_back','M111 169 L120 164 L129 169 L137 205 L120 214 L103 205 Z'],
    ['glutes','M91 210 Q107 202 118 218 L118 245 Q98 258 85 241 Z M149 210 Q133 202 122 218 L122 245 Q142 258 155 241 Z'],
    ['hamstrings','M86 251 Q102 262 114 250 L110 299 L95 314 Q81 291 86 251 Z M154 251 Q138 262 126 250 L130 299 L145 314 Q159 291 154 251 Z'],
    ['calves','M95 323 Q110 319 111 337 L104 375 L94 381 L89 353 Z M145 323 Q130 319 129 337 L136 375 L146 381 L151 353 Z']
  ];
  let serial=0;
  const escape = value => String(value).replace(/[&<>"']/g,character=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
  function mapHtml(input,view='front',lang='es') {
    const item=input&&Object.prototype.hasOwnProperty.call(profiles,input.key)?profiles[input.key]:null;
    if(!item)return '';
    const en=lang==='en',side=view==='back'?'back':'front',parts=side==='back'?back:front,id=`exercise-muscle-map-${++serial}`;
    const title=en?`${side==='back'?'Back':'Front'} view of involved muscle groups`:`Vista ${side==='back'?'dorsal':'frontal'} de grupos musculares`;
    const main=item.primary.map(zone=>label(zone,lang)).join(', '),support=item.secondary.map(zone=>label(zone,lang)).join(', ');
    const description=en?`Main groups: ${main}.${support?` Supporting groups: ${support}.`:''} Simplified educational diagram, not measured muscle activity. Only regions visible from this side are colored.`:`Grupos principales: ${main}.${support?` Grupos de apoyo: ${support}.`:''} Esquema educativo simplificado, no mide actividad muscular. Solo se colorean las zonas visibles desde esta vista.`;
    const paths=parts.map(([zone,d])=>{
      const role=item.primary.includes(zone)?'principal':item.secondary.includes(zone)?'apoyo':'neutral';
      const fill=role==='principal'?'#35b88b':role==='apoyo'?'#89aee9':'#dbe3ec';
      return `<path class="muscle-zone ${role}" data-muscle-zone="${zone}" d="${d}" fill="${fill}" stroke="#f7faff" stroke-width="1.3"/>`;
    }).join('');
    return `<svg class="exercise-muscle-map" data-muscle-view="${side}" viewBox="0 0 240 430" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="${id}-title ${id}-desc" focusable="false"><title id="${id}-title">${escape(title)}</title><desc id="${id}-desc">${escape(description)}</desc><defs><radialGradient id="${id}-glow"><stop offset="0" stop-color="#a7cadf" stop-opacity=".19"/><stop offset="1" stop-color="#a7cadf" stop-opacity="0"/></radialGradient></defs><ellipse cx="120" cy="221" rx="112" ry="188" fill="url(#${id}-glow)"/><path d="M120 65V393" stroke="#b8c7d9" stroke-opacity=".22" stroke-dasharray="3 6"/><g class="muscle-map-body" stroke="#a8b7c8" stroke-width="1.3" stroke-linejoin="round"><path d="M105 59 Q106 72 98 79 L77 87 Q61 91 55 110 L45 164 L39 214 L39 231 Q43 242 49 233 L52 224 L54 235 Q61 237 63 226 L67 186 L79 150 L87 186 L83 223 L77 270 L83 315 L83 376 L79 393 Q76 401 84 401 L102 400 L106 388 L112 329 L119 287 L120 263 L121 287 L128 329 L134 388 L138 400 L156 401 Q164 401 161 393 L157 376 L157 315 L163 270 L157 223 L153 186 L161 150 L173 186 L177 226 Q179 237 186 235 L188 224 L191 233 Q197 242 201 231 L201 214 L195 164 L185 110 Q179 91 163 87 L142 79 Q134 72 135 59 Z" fill="#edf2f7"/><path d="M102 35 Q102 16 120 16 Q138 16 138 35 L135 53 Q131 64 120 66 Q109 64 105 53 Z" fill="#edf2f7"/></g><g class="muscle-map-zones">${paths}</g><path d="M120 81V208" stroke="#f7faff" stroke-width="1.5" fill="none"/><text x="120" y="421" text-anchor="middle" fill="#7c8ca0" font-family="system-ui, sans-serif" font-size="10">${en?(side==='back'?'BACK · SIMPLIFIED VIEW':'FRONT · SIMPLIFIED VIEW'):(side==='back'?'DORSO · VISTA SIMPLIFICADA':'FRENTE · VISTA SIMPLIFICADA')}</text></svg>`;
  }

  root.exerciseMuscleProfile=profile;
  root.exerciseMuscleLabel=label;
  root.exerciseVisualVariantKey=variantKey;
  root.exerciseMuscleMapHtml=mapHtml;
})(globalThis);
