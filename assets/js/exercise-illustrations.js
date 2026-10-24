/* Original, static posture/equipment sketches. Educational orientation, not a
 * continuous demonstration or an assessment of technique. No remote assets. */
(function(root){
  'use strict';
  let serial=0;
  const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  // h=head, s=shoulders, p=pelvis; each arm/leg has its own elbow/knee and end.
  const standing={h:[153,39],s:[153,66],p:[151,122],arms:[[[130,93],[123,121]],[[176,91],[184,119]]],legs:[[[133,155],[125,193]],[[171,156],[181,193]]]};
  const squat={h:[124,49],s:[130,75],p:[159,124],arms:[[[152,84],[167,69]],[[144,90],[159,73]]],legs:[[[110,137],[111,191]],[[183,148],[190,191]]]};
  const hinge={h:[104,68],s:[125,86],p:[179,118],arms:[[[129,123],[129,153]],[[143,126],[144,156]]],legs:[[[165,155],[161,193]],[[193,153],[197,193]]]};
  const bench={h:[73,103],s:[98,105],p:[172,108],arms:[[[112,69],[115,35]],[[126,70],[130,36]]],legs:[[[200,143],[211,191]],[[187,145],[194,192]]]};
  const floor={h:[66,179],s:[91,182],p:[162,182],arms:[[[110,145],[109,104]],[[124,148],[125,107]]],legs:[[[189,140],[225,190]],[[180,150],[210,190]]]};
  const lunge={h:[139,35],s:[143,61],p:[149,117],arms:[[[121,91],[117,119]],[[169,91],[174,118]]],legs:[[[100,142],[99,192]],[[191,164],[223,188]]]};
  const seated={h:[128,38],s:[131,65],p:[143,129],arms:[[[157,96],[186,91]],[[146,96],[175,91]]],legs:[[[186,134],[192,191]],[[174,140],[179,192]]]};
  const push={h:[85,80],s:[107,100],p:[181,129],arms:[[[100,142],[118,185]],[[114,141],[133,185]]],legs:[[[218,153],[257,186]],[[212,157],[247,189]]]};
  const bridge={h:[58,181],s:[85,182],p:[146,130],arms:[[[103,188],[129,188]],[[107,185],[133,185]]],legs:[[[192,133],[222,187]],[[183,141],[207,190]]]};
  const poses={
    squat, goblet:{...squat,arms:[[[145,97],[138,78]],[[157,94],[144,79]]]},
    lunge, split_squat:{...lunge,legs:[[[100,142],[99,192]],[[191,142],[223,157]]]}, wall_sit:{...seated,h:[130,54],s:[132,81],p:[133,139]},
    step_up:{...standing,p:[151,116],legs:[[[180,127],[193,165]],[[131,155],[119,193]]]},
    hinge,deadlift:hinge,rdl:hinge,single_rdl:{...hinge,legs:[[[169,156],[164,193]],[[222,107],[270,105]]]},
    hinge_hands_thighs:{...hinge,arms:[[[148,117],[172,145]],[[158,115],[187,143]]]},
    bridge,hip_thrust:{...bridge,h:[65,105],s:[88,125]},
    single_bridge:{...bridge,legs:[bridge.legs[0],[[187,111],[222,78]]]},
    leg_press:{...seated,h:[78,112],s:[101,130],p:[141,158],legs:[[[189,119],[218,86]],[[178,126],[205,87]]]},
    leg_extension:{...seated,legs:[[[186,132],[234,138]],[[178,140],[226,147]]]},
    leg_curl:{...seated,legs:[[[186,134],[157,181]],[[176,140],[150,180]]]},
    sliding_curl:{...bridge,legs:[[[197,159],[252,180]],[[191,169],[241,188]]]},
    calf:{...standing,legs:[[[137,153],[133,185]],[[169,153],[174,184]]]},
    single_calf:{...standing,legs:[[[141,153],[139,185]],[[180,128],[168,151]]]},
    bench_press:bench, incline_press:{...bench,h:[85,61],s:[111,83],p:[169,119]},
    floor_press:floor,
    floor_pullover:{...floor,arms:[[[76,151],[43,119]],[[88,156],[56,124]]]},
    standing_press:{...standing,arms:[[[178,78],[217,78]],[[179,94],[218,94]]]},
    band_incline_press:{...standing,arms:[[[178,69],[217,36]],[[179,81],[224,48]]]},
    standing_fly:{...standing,arms:[[[115,81],[155,101]],[[190,80],[161,101]]]},
    fly:{...bench,arms:[[[104,66],[132,45]],[[151,93],[183,76]]]},
    floor_fly:{...floor,arms:[[[119,144],[143,116]],[[113,165],[150,152]]]},
    chest_machine:{...seated,arms:[[[156,69],[186,73]],[[153,86],[182,89]]]},
    dip:{...standing,h:[136,38],s:[143,64],p:[159,118],arms:[[[125,97],[145,129]],[[158,97],[177,128]]],legs:[[[191,155],[170,175]],[[180,160],[159,181]]]},
    bench_dip:{...seated,h:[147,55],s:[151,82],p:[165,139],arms:[[[135,111],[129,143]],[[148,112],[141,144]]],legs:[[[202,159],[244,190]],[[193,164],[235,194]]]},
    push_up:push,
    incline_push:{...push,h:[107,46],s:[125,68],p:[179,117],arms:[[[122,100],[132,136]],[[133,103],[145,138]]]},
    wall_push:{...standing,h:[175,40],s:[171,67],p:[144,120],arms:[[[201,77],[241,75]],[[199,92],[241,91]]]},
    pike_push:{...push,h:[93,126],s:[112,111],p:[170,58],legs:[[[213,120],[246,187]],[[202,122],[234,187]]]},
    overhead_press:{...standing,arms:[[[127,57],[128,16]],[[177,57],[178,16]]]},
    kneeling_press:{...standing,p:[154,117],arms:[[[129,60],[130,18]],[[180,91],[186,119]]],legs:[[[191,131],[194,184]],[[127,170],[86,184]]]},
    arnold:{...seated,arms:[[[114,66],[133,54]],[[159,64],[147,52]]]},
    raise:{...standing,arms:[[[103,81],[62,72]],[[203,81],[248,71]]]},
    reverse_fly:{...hinge,arms:[[[103,111],[65,121]],[[162,91],[206,78]]]},
    triceps_extension:{...standing,arms:[[[153,16],[177,43]],[[164,20],[185,48]]]},
    triceps_pushdown:{...standing,arms:[[[176,92],[177,136]],[[161,91],[163,137]]]},
    pull_up:{...standing,h:[153,72],s:[153,99],p:[152,153],arms:[[[124,65],[110,32]],[[183,65],[195,32]]],legs:[[[134,179],[116,187]],[[173,179],[191,187]]]},
    pulldown:{...seated,arms:[[[112,52],[91,18]],[[163,52],[184,18]]]},
    row:{...hinge,arms:[[[157,102],[164,125]],[[146,98],[152,119]]]},
    chest_row:{...hinge,h:[104,64],s:[126,81],p:[177,111]},
    cable_row:{...seated,arms:[[[161,98],[183,111]],[[151,104],[176,119]]]},
    inverted_row:{...push,h:[86,117],s:[110,132],p:[177,158],arms:[[[122,96],[127,58]],[[136,100],[142,59]]],legs:[[[219,173],[258,187]],[[212,181],[244,193]]]},
    prone_row:{...push,h:[73,154],s:[101,168],p:[180,171],arms:[[[119,141],[104,118]],[[139,153],[128,130]]],legs:[[[221,175],[259,181]],[[218,184],[251,190]]]},
    face_pull:{...standing,arms:[[[190,67],[173,53]],[[184,84],[168,66]]]},
    pullover:{...bench,arms:[[[85,65],[54,47]],[[96,72],[63,53]]]},
    curl:{...standing,arms:[[[125,96],[138,69]],[[179,96],[167,69]]]},
    towel_curl:{...standing,arms:[[[132,94],[145,103]],[[177,94],[162,103]]],legs:[[[137,155],[130,193]],[[188,124],[196,160]]]},
    plank:{...push,arms:[[[107,178],[142,184]],[[119,184],[153,190]]]},
    side_plank:{...push,h:[96,82],s:[115,105],p:[180,141],arms:[[[111,162],[143,178]],[[153,81],[162,44]]]},
    dead_bug:{...floor,arms:[[[94,124],[76,99]],[[116,132],[136,101]]],legs:[[[179,124],[189,82]],[[208,164],[253,184]]]},
    crunch:{...floor,h:[84,125],s:[107,143],arms:[[[98,104],[80,114]],[[122,118],[103,126]]]},
    swing:{...hinge,arms:[[[111,116],[102,143]],[[126,118],[116,145]]]},
    clean_press:{...standing,arms:[[[124,64],[134,51]],[[177,60],[179,17]]]},
    halo:{...standing,arms:[[[126,32],[149,20]],[[185,36],[168,20]]]},
    carry:{...standing,arms:[[[130,96],[128,133]],[[175,96],[179,133]]]},
    walk:{...standing,h:[159,38],s:[158,64],arms:[[[131,88],[146,111]],[[182,90],[167,110]]],legs:[[[124,153],[108,190]],[[178,153],[200,184]]]},
    run:{...standing,h:[165,34],s:[157,60],p:[145,112],arms:[[[122,79],[143,65]],[[184,83],[168,105]]],legs:[[[178,128],[202,166]],[[116,153],[83,137]]]},
    march:{...standing,legs:[[[133,153],[126,192]],[[184,117],[186,158]]]},
    balance:{...standing,arms:[[[127,90],[103,105]],[[186,86],[223,83]]],legs:[[[142,155],[139,193]],[[183,133],[169,159]]]},
    mobility:{...standing,arms:[[[115,66],[119,37]],[[190,66],[186,37]]]},
    chair_squat:{...seated,arms:[[[158,88],[185,89]],[[149,98],[177,101]]]},
    erg_row:{...seated,h:[113,67],s:[124,93],p:[150,146],legs:[[[192,150],[234,174]],[[181,158],[220,183]]]},
    ski:{...standing,h:[135,46],s:[144,72],p:[158,126],arms:[[[125,101],[120,133]],[[140,109],[135,143]]]},
    sled_push:{...push,h:[132,50],s:[151,73],p:[190,123],arms:[[[178,85],[215,91]],[[176,101],[215,109]]],legs:[[[225,151],[255,190]],[[174,163],[156,193]]]},
    sled_pull:{...standing,h:[177,47],s:[173,73],p:[150,129],arms:[[[138,93],[111,112]],[[154,105],[123,121]]]},
    wall_ball:{...squat,arms:[[[142,68],[156,51]],[[160,74],[171,55]]]},
    burpee:push
  };
  function illustration(entry,lang='es'){
    entry=entry&&typeof entry==='object'&&!Array.isArray(entry)?entry:{};
    const en=lang==='en',kind=typeof entry.pose==='string'&&(Object.prototype.hasOwnProperty.call(poses,entry.pose)||['circuit','choice'].includes(entry.pose))?entry.pose:'custom',id=`exercise-sketch-${++serial}`;
    let pose=poses[kind];
    if(pose&&kind==='row'&&(entry.support===true||entry.unilateral===true))pose={...pose,arms:[[[106,110],entry.support===true?[95,137]:[166,129]],pose.arms[1]]};
    if(pose&&entry.unilateral===true&&kind==='floor_press')pose={...pose,arms:[[[112,187],[143,188]],pose.arms[1]]};
    if(pose&&entry.unilateral===true&&kind==='overhead_press')pose={...pose,arms:[pose.arms[0],[[176,91],[184,119]]]};
    const label=escape(entry?.label|| (en?'Your exercise':'Tu ejercicio'));
    const description=en?'Original simplified posture and equipment sketch. A static orientation, not a complete movement demonstration.':'Esquema original simplificado de postura y material. Orientación estática, no una demostración completa del movimiento.';
    const line=(points,stroke='#b4e8df',width=9)=>`<polyline points="${points.map(p=>p.join(',')).join(' ')}" fill="none" stroke="${stroke}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/>`;
    const tool=['barbell','dumbbell','kettlebell','band','machine','chair','towel','slider','bodyweight','ball','sled','ergometer','none'].includes(entry?.tool)?entry.tool:'none';
    let scene='',body='',props='';
    if(pose){
      if(['bench_press','fly','pullover'].includes(kind))scene+='<path data-sketch-bench="flat" d="M74 117H184M86 118V185M174 118V185" stroke="#8296b2" stroke-width="7" fill="none"/>';
      if(kind==='incline_press')scene+='<path data-sketch-bench="incline" d="M81 75L177 133M121 100V184M175 133V184" stroke="#8296b2" stroke-width="7" fill="none"/>';
      if(kind==='chest_row')scene+='<path data-sketch-bench="chest-support" d="M108 81L185 128M121 92V184M175 122V184" stroke="#8296b2" stroke-width="7" fill="none"/>';
      if(['chair_squat','cable_row','leg_extension','leg_curl','chest_machine','arnold','pulldown','erg_row'].includes(kind))scene+='<path data-sketch-seat="true" d="M109 74V142H170M120 142V190M160 142V190" stroke="#8296b2" stroke-width="7" fill="none"/>';
      if(kind==='hip_thrust')scene+='<path d="M38 133H109V187H38Z" fill="#273b56" stroke="#8296b2" stroke-width="3"/>';
      if(kind==='row'&&entry.support===true)scene+='<path data-sketch-support="row" d="M70 142H116M79 142V191M108 142V191" stroke="#8296b2" stroke-width="6" fill="none"/>';
      if(['floor_press','floor_fly','floor_pullover','bridge','single_bridge','hip_thrust','sliding_curl','dead_bug','crunch','plank','side_plank','push_up','pike_push','burpee','prone_row'].includes(kind))scene+='<path d="M39 195H274" stroke="#506c8f" stroke-width="5" stroke-linecap="round"/>';
      if(kind==='wall_push'||kind==='wall_sit')scene+=`<path d="M${kind==='wall_push'?248:119} 23V196" stroke="#8296b2" stroke-width="8"/>`;
      if(kind==='incline_push')scene+='<path d="M105 146H161V191H105Z" fill="#273b56" stroke="#8296b2" stroke-width="3"/>';
      if(kind==='step_up')scene+='<path d="M172 168H228V196H172Z" fill="#273b56" stroke="#8296b2" stroke-width="3"/>';
      if(kind==='split_squat')scene+='<path d="M211 188V160H247V194" fill="#273b56" stroke="#8296b2" stroke-width="4"/>';
      if(kind==='bench_dip')scene+='<path d="M87 151H146M96 151V191M137 151V191" stroke="#8296b2" stroke-width="7"/>';
      if(kind==='pull_up'||kind==='inverted_row')scene+=`<path d="M70 ${kind==='pull_up'?25:51}H240" stroke="#8296b2" stroke-width="7"/>`;
      if(kind==='dip')scene+='<path d="M118 135H161M164 137H204M131 136V194M188 138V194" stroke="#8296b2" stroke-width="6"/>';
      if(kind==='balance'||(entry?.support&&['calf','single_calf','hinge','march'].includes(kind)))scene+='<path d="M223 78V149H258M232 149V193M251 149V193" fill="none" stroke="#8296b2" stroke-width="5"/>';
      if(['pulldown','triceps_pushdown','face_pull','cable_row','chest_machine','leg_press','leg_extension','leg_curl'].includes(kind)&&tool==='machine')scene+='<path d="M267 25V191H290M253 25H282M276 119H289V174H276Z" fill="none" stroke="#8296b2" stroke-width="5"/>';
      if(kind==='leg_press')scene+='<path d="M210 76L243 109M237 94L277 35M61 151L118 187H177" fill="none" stroke="#8296b2" stroke-width="7"/>';
      if(kind==='sled_push'||kind==='sled_pull')scene+='<path d="M220 89V183H284M228 181V191M273 181V191" fill="none" stroke="#8296b2" stroke-width="6"/>';
      if(kind==='ski')scene+='<path d="M251 18V190H290M230 21H270M257 145L280 180" stroke="#8296b2" stroke-width="6" fill="none"/>';
      if(kind==='erg_row')scene+='<path d="M144 180H275M260 157V185" stroke="#8296b2" stroke-width="6"/><circle cx="267" cy="148" r="23" fill="#273b56" stroke="#8296b2" stroke-width="4"/>';
      pose.legs.forEach(leg=>body+=line([pose.p,...leg],'#79a9df',10));
      body+=line([pose.s,pose.p],'#d6f6ee',15)+line([pose.h,pose.s],'#d6f6ee',8);
      pose.arms.forEach(arm=>body+=line([pose.s,...arm]));
      body+=`<circle cx="${pose.h[0]}" cy="${pose.h[1]}" r="14" fill="#d6f6ee" stroke="#111e31" stroke-width="2"/>`;
      pose.legs.forEach((leg,index)=>{const foot=leg[1];body+=line([foot,[foot[0]+12,kind==='calf'||kind==='single_calf'&&index===0?196:foot[1]]],'#79a9df',6);});
      const hands=pose.arms.map(arm=>arm[1]);
      const hipLoaded=['bridge','single_bridge','hip_thrust'].includes(kind);
      if(tool==='barbell'){
        const center=hipLoaded?pose.p:kind==='squat'?[153,76]:[(hands[0][0]+hands[1][0])/2,(hands[0][1]+hands[1][1])/2];
        props+=`<g stroke="#70adff" stroke-linecap="round"><path d="M${center[0]-49} ${center[1]}h98" stroke-width="5"/><path d="M${center[0]-34} ${center[1]-14}v28M${center[0]+34} ${center[1]-14}v28" stroke-width="10"/></g>`;
      }
      if(tool==='dumbbell'){
        const places=hipLoaded?[pose.p]:['goblet','pullover','floor_pullover'].includes(kind)?[[ (hands[0][0]+hands[1][0])/2,(hands[0][1]+hands[1][1])/2]]:entry.toolCount===1||entry.unilateral===true?[hands[1]]:hands;
        places.forEach(([x,y])=>props+=`<g transform="translate(${x} ${y})${kind==='goblet'?' rotate(90)':''}" stroke="#70adff" stroke-linecap="round"><path d="M-11 0H11" stroke-width="4"/><path d="M-12-7V7M12-7V7" stroke-width="7"/></g>`);
      }
      if(tool==='kettlebell'){
        const handsTogether=['goblet','swing','halo','deadlift','rdl','curl','pullover','floor_pullover'].includes(kind)||entry.closeGrip===true,places=hipLoaded?[[pose.p[0],pose.p[1]-12]]:handsTogether?[[ (hands[0][0]+hands[1][0])/2,(hands[0][1]+hands[1][1])/2]]:entry.toolCount===2?hands:[hands[kind==='kneeling_press'||kind==='overhead_press'&&entry.unilateral===true?0:1]];
        places.forEach(([x,y])=>props+=`<g transform="translate(${x} ${y})" stroke="#70adff" stroke-width="3"><rect x="-7" y="-6" width="14" height="14" rx="6" fill="none"/><circle cx="0" cy="13" r="12" fill="#3269a8"/></g>`);
      }
      if(tool==='band'){
        if(kind==='bridge'||kind==='hip_thrust')props+='<ellipse data-band-anchor="knees" cx="187" cy="139" rx="20" ry="9" fill="none" stroke="#f6bb77" stroke-width="4"/>';
        else if(kind==='hinge')props+=`<g data-band-anchor="feet-back">${line([[161,192],pose.s,[197,192]],'#f6bb77',3)}</g>`;
        else hands.forEach(([x,y],index)=>{const anchor=['standing_press','band_incline_press'].includes(kind)?[136,88]:kind==='standing_fly'?[index?255:64,65]:['row','cable_row','face_pull','pulldown'].includes(kind)?[265,kind==='pulldown'?22:110]:kind==='push_up'?[110,101]:[151,191];props+=line([anchor,[x,y]],'#f6bb77',3);});
      }
      if(tool==='towel')props+=line([hands[0],[191,155],hands[1]],'#f6bb77',4);
      if(tool==='ball')props+=`<circle cx="166" cy="36" r="18" fill="#3269a8" stroke="#70adff" stroke-width="3"/>`;
    }else{
      // Mixed blocks and custom entries must not be mistaken for a technique demo.
      scene='<rect x="75" y="46" width="171" height="132" rx="18" fill="#1c304b" stroke="#6584ab" stroke-width="2"/>';
      for(let i=0;i<3;i++)scene+=`<circle cx="103" cy="${80+i*32}" r="6" fill="#9fe4d1"/><path d="M122 ${80+i*32}H216" stroke="#79a9df" stroke-width="7" stroke-linecap="round"/>`;
      if(tool==='band')props='<ellipse cx="246" cy="166" rx="25" ry="15" fill="none" stroke="#f6bb77" stroke-width="5"/>';
      if(tool==='kettlebell')props='<rect x="230" y="136" width="23" height="25" rx="9" fill="none" stroke="#70adff" stroke-width="4"/><circle cx="242" cy="173" r="20" fill="#3269a8" stroke="#70adff" stroke-width="3"/>';
      if(tool==='dumbbell'||tool==='barbell')props='<path d="M216 177H275M225 165V189M266 165V189" stroke="#70adff" stroke-width="7" stroke-linecap="round"/>';
    }
    return `<svg class="exercise-reference-illustration" data-exercise-pose="${kind}" data-exercise-tool="${tool}" viewBox="0 0 320 220" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="${id}-title ${id}-desc" focusable="false"><title id="${id}-title">${label}</title><desc id="${id}-desc">${escape(description)}</desc><defs><linearGradient id="${id}-bg" x2="1" y2="1"><stop stop-color="#14283d"/><stop offset="1" stop-color="#111625"/></linearGradient></defs><rect width="320" height="220" rx="12" fill="url(#${id}-bg)"/><ellipse cx="165" cy="199" rx="117" ry="7" fill="#79a9df" opacity=".1"/>${scene}${body}${props}<path d="M38 200H288" stroke="#5f7694" stroke-opacity=".35"/><text x="160" y="215" text-anchor="middle" fill="#a6bdd5" font-family="system-ui,sans-serif" font-size="8">${en?'STATIC SCHEMATIC · NOT A FULL DEMONSTRATION':'ESQUEMA ESTÁTICO · NO ES UNA DEMOSTRACIÓN COMPLETA'}</text></svg>`;
  }
  root.exerciseIllustrationHtml=illustration;
  root.exerciseIllustrationPoseKeys=()=>[...Object.keys(poses),'circuit','choice','custom'];
})(globalThis);
