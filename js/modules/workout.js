'use strict';
/* ── FitnessOS v4 — Workout Logger + Exercise Database ── */

/* ── Guidance System ── */
const GUIDANCE = {
  setsReps(goal) {
    const map = {
      hypertrophy: { sets:'3-4', reps:'8-12', rest:'60-90s', tempo:'2-0-1-0', note:'Last 2 reps should be hard' },
      fat_loss:    { sets:'3-4', reps:'12-15', rest:'45-60s', tempo:'2-0-1-0', note:'Keep rest short, heart rate up' },
      strength:    { sets:'4-5', reps:'3-6',   rest:'2-4min', tempo:'1-0-X-0', note:'Focus on moving weight fast' },
      recomp:      { sets:'3',   reps:'10-12', rest:'60-75s', tempo:'2-1-1-0', note:'Controlled throughout' },
      athletic:    { sets:'3-4', reps:'6-10',  rest:'90-120s',tempo:'1-0-X-0', note:'Explosive concentric' },
      maintenance: { sets:'3',   reps:'10-12', rest:'60s',    tempo:'2-0-1-0', note:'Consistent effort' }
    };
    return map[goal] || map.hypertrophy;
  },
  techniques(goal) {
    const t = {
      hypertrophy: ['Drop sets on last set','Rest-pause technique','Mechanical drop sets','2-3 forced reps with spotter'],
      fat_loss:    ['Giant sets (4 exercises back to back)','Supersets with opposing muscles','AMRAP last set','No rest between supersets'],
      strength:    ['Cluster sets (2-2-2 with 20s pause)','Heavy singles at 90-95%','Pause reps at bottom','Speed work at 60% 1RM'],
      recomp:      ['Supersets','Time under tension sets (3s eccentric)','Slow eccentrics','Mind-muscle connection focus'],
      athletic:    ['Contrast training (heavy + explosive)','Plyometric supersets','Velocity-based training'],
      maintenance: ['Straight sets','Occasional drop sets','Deload every 6th week']
    };
    return t[goal] || t.hypertrophy;
  },
  supersets: {
    chest:     ['Back — Barbell Row', 'Triceps — Tricep Pushdown'],
    back:      ['Chest — Push-Ups', 'Biceps — Barbell Curl'],
    shoulders: ['Core — Plank', 'Triceps — Overhead Tricep Extension'],
    biceps:    ['Triceps — Tricep Pushdown', 'Back — Lat Pulldown'],
    triceps:   ['Biceps — Barbell Curl', 'Chest — Cable Fly'],
    quads:     ['Hamstrings — Leg Curl', 'Glutes — Hip Thrust'],
    hamstrings:['Quads — Leg Extension', 'Glutes — Cable Glute Kickback'],
    glutes:    ['Quads — Back Squat', 'Hamstrings — Romanian Deadlift'],
    core:      ['Shoulders — Overhead Press', 'Back — Deadlift'],
    calves:    ['Quads — Leg Press', 'Hamstrings — Romanian Deadlift']
  },
  warmupSets(workingWeight) {
    const w = parseFloat(workingWeight) || 60;
    return [
      { pct:40, w:Math.round(w*0.4/2.5)*2.5, reps:10, label:'Activation' },
      { pct:60, w:Math.round(w*0.6/2.5)*2.5, reps:6,  label:'Warm-Up' },
      { pct:80, w:Math.round(w*0.8/2.5)*2.5, reps:3,  label:'Feeler' }
    ];
  },
  needsSpotter(exerciseName) {
    const spotted = ['Barbell Bench Press','Incline Barbell Bench Press','Decline Barbell Bench Press',
      'Back Squat','Front Squat','Close-Grip Bench Press','Skull Crushers','JM Press'];
    return spotted.includes(exerciseName);
  },
  diffLabel(diff) {
    return diff >= 3 ? { l:'Advanced', c:'#ff453a' } :
           diff === 2 ? { l:'Intermediate', c:'#ff9f0a' } :
                        { l:'Beginner', c:'#30d158' };
  }
};
window.GUIDANCE = GUIDANCE;

/* ── Exercise Database ── */
const ExDB = {
  db: [
    // CHEST (15)
    {n:'Barbell Bench Press',em:'🏋️',grp:'chest',diff:2,bw:false,eq:['barbell'],pri:'Chest',sec:'Triceps, Front Delts',cues:'Drive feet into floor, arch naturally, tuck elbows 45°',setup:'Lie flat, grip slightly wider than shoulder width',breathing:'Inhale on descent, exhale on press',mistakes:'Flaring elbows, bouncing off chest',joint:{shoulder:2,elbow:1,knee:0,spine:1,hip:0},cns:2,muscles:{primary:['chest'],secondary:['triceps','front_delts']},regressions:['Push-Ups','Dumbbell Bench Press'],progressions:['Weighted Dips','Close-Grip Bench Press'],met:5.0,tempoRec:'2-0-1-0'},
    {n:'Incline Barbell Bench Press',em:'📐',grp:'chest',diff:2,bw:false,eq:['barbell'],pri:'Upper Chest',sec:'Front Delts, Triceps',cues:'Set bench 30-45°, retract scapulae, control the eccentric',setup:'Bench at 30-45° incline, bar above upper chest',breathing:'Inhale down, exhale press',mistakes:'Too steep angle shifts load to delts',joint:{shoulder:2,elbow:1,knee:0,spine:1,hip:0},cns:2,muscles:{primary:['upper_chest'],secondary:['front_delts','triceps']},regressions:['Incline Push-Ups','Incline DB Press'],progressions:['Weighted Dips'],met:5.0,tempoRec:'2-0-1-0'},
    {n:'Dumbbell Bench Press',em:'💪',grp:'chest',diff:1,bw:false,eq:['dumbbell'],pri:'Chest',sec:'Triceps, Front Delts',cues:'Full stretch at bottom, squeeze at top, neutral or slightly pronated grip',setup:'Sit on bench, kick DBs up, lie back controlled',breathing:'Inhale down, exhale press',mistakes:'Losing shoulder retraction at bottom',joint:{shoulder:2,elbow:1,knee:0,spine:1,hip:0},cns:1,muscles:{primary:['chest'],secondary:['triceps','front_delts']},regressions:['Push-Ups'],progressions:['Barbell Bench Press'],met:4.5,tempoRec:'2-1-1-0'},
    {n:'Incline Dumbbell Press',em:'📐',grp:'chest',diff:1,bw:false,eq:['dumbbell'],pri:'Upper Chest',sec:'Front Delts, Triceps',cues:'Elbows slightly in, pause at bottom for stretch',setup:'30-45° bench, DBs at shoulder height',breathing:'Inhale down, exhale press',mistakes:'Going too heavy, losing form at bottom',joint:{shoulder:2,elbow:1,knee:0,spine:1,hip:0},cns:1,muscles:{primary:['upper_chest'],secondary:['front_delts','triceps']},regressions:['Incline Push-Ups'],progressions:['Incline Barbell Bench Press'],met:4.5,tempoRec:'2-1-1-0'},
    {n:'Dumbbell Fly',em:'🦋',grp:'chest',diff:1,bw:false,eq:['dumbbell'],pri:'Chest',sec:'Front Delts',cues:'Slight bend in elbows, feel the stretch, squeeze at top',setup:'Flat bench, wide arc motion',breathing:'Inhale wide, exhale squeeze',mistakes:'Turning into a press, excessive weight',joint:{shoulder:3,elbow:1,knee:0,spine:0,hip:0},cns:1,muscles:{primary:['chest'],secondary:['front_delts']},regressions:['Cable Fly'],progressions:['Weighted Dips'],met:4.0,tempoRec:'3-1-1-0'},
    {n:'Cable Fly',em:'⚡',grp:'chest',diff:1,bw:false,eq:['cables'],pri:'Chest',sec:'Front Delts',cues:'Constant tension, slight elbow bend, squeeze hard at peak',setup:'Cables at chest height, step forward, slight forward lean',breathing:'Exhale on fly',mistakes:'Bending elbows too much, turning into a row',joint:{shoulder:2,elbow:0,knee:0,spine:0,hip:0},cns:1,muscles:{primary:['chest'],secondary:['front_delts']},regressions:['DB Fly'],progressions:['Weighted Dips'],met:4.0,tempoRec:'2-1-2-0'},
    {n:'Push-Ups',em:'🤸',grp:'chest',diff:1,bw:true,eq:[],pri:'Chest',sec:'Triceps, Front Delts',cues:'Rigid plank, elbows 45°, full range of motion',setup:'Hands shoulder-width, body plank position',breathing:'Inhale down, exhale up',mistakes:'Sagging hips, partial reps',joint:{shoulder:1,elbow:1,knee:0,spine:1,hip:0},cns:1,muscles:{primary:['chest'],secondary:['triceps','front_delts']},regressions:['Knee Push-Ups'],progressions:['Weighted Push-Ups','Archer Push-Ups'],met:4.0,tempoRec:'2-0-1-0'},
    {n:'Chest Dip',em:'💎',grp:'chest',diff:2,bw:true,eq:['bar'],pri:'Lower Chest',sec:'Triceps, Front Delts',cues:'Lean forward 15-30° to hit chest, control descent',setup:'Parallel bars, slight forward lean throughout',breathing:'Inhale down, exhale up',mistakes:'Too upright (shifts to triceps)',joint:{shoulder:3,elbow:2,knee:0,spine:1,hip:0},cns:2,muscles:{primary:['lower_chest'],secondary:['triceps','front_delts']},regressions:['Bench Dip','Push-Ups'],progressions:['Weighted Dip'],met:5.0,tempoRec:'2-1-1-0'},
    {n:'Machine Chest Press',em:'🖥️',grp:'chest',diff:1,bw:false,eq:['machine'],pri:'Chest',sec:'Triceps, Front Delts',cues:'Adjust seat so handles align with mid-chest, full range',setup:'Seat height: handles at mid-chest level',breathing:'Exhale press, inhale return',mistakes:'Partial range of motion',joint:{shoulder:1,elbow:1,knee:0,spine:0,hip:0},cns:1,muscles:{primary:['chest'],secondary:['triceps','front_delts']},regressions:['DB Press'],progressions:['Barbell Bench Press'],met:4.0,tempoRec:'2-0-1-0'},
    {n:'Cable Crossover',em:'✖️',grp:'chest',diff:1,bw:false,eq:['cables'],pri:'Chest',sec:'Front Delts',cues:'High-to-low for lower chest, low-to-high for upper chest',setup:'Cables high, stand in centre, bring hands together',breathing:'Exhale on crossover',mistakes:'Using momentum, no pause at peak',joint:{shoulder:2,elbow:0,knee:0,spine:0,hip:0},cns:1,muscles:{primary:['chest'],secondary:['front_delts']},regressions:['DB Fly'],progressions:['Weighted Dips'],met:4.0,tempoRec:'2-2-1-0'},
    {n:'Decline Barbell Bench Press',em:'📉',grp:'chest',diff:2,bw:false,eq:['barbell'],pri:'Lower Chest',sec:'Triceps',cues:'Decline 15-30°, wider grip, control eccentric',setup:'Decline bench, feet secured',breathing:'Inhale down, exhale press',mistakes:'Excessive decline angle',joint:{shoulder:2,elbow:1,knee:0,spine:1,hip:0},cns:2,muscles:{primary:['lower_chest'],secondary:['triceps']},regressions:['Dumbbell Bench Press'],progressions:['Weighted Dip'],met:5.0,tempoRec:'2-0-1-0'},
    {n:'Close-Grip Bench Press',em:'🤏',grp:'chest',diff:2,bw:false,eq:['barbell'],pri:'Triceps',sec:'Chest, Front Delts',cues:'Grip shoulder-width, keep elbows tucked',setup:'Flat bench, narrow grip on barbell',breathing:'Inhale down, exhale press',mistakes:'Too narrow grip strains wrists',joint:{shoulder:2,elbow:2,knee:0,spine:1,hip:0},cns:2,muscles:{primary:['triceps'],secondary:['chest','front_delts']},regressions:['DB Tricep Press'],progressions:['Weighted Dip'],met:4.5,tempoRec:'2-0-1-0'},
    {n:'Landmine Press',em:'🔱',grp:'chest',diff:1,bw:false,eq:['barbell'],pri:'Upper Chest',sec:'Front Delts, Triceps',cues:'Single arm, squeeze upper chest at top',setup:'Bar in landmine attachment, kneel or stand',breathing:'Exhale press',mistakes:'Rotating torso excessively',joint:{shoulder:1,elbow:1,knee:0,spine:1,hip:0},cns:1,muscles:{primary:['upper_chest'],secondary:['front_delts','triceps']},regressions:['DB Press'],progressions:['Incline Barbell Press'],met:4.0,tempoRec:'2-0-1-0'},
    {n:'Pec Deck',em:'🦅',grp:'chest',diff:1,bw:false,eq:['machine'],pri:'Chest',sec:'Front Delts',cues:'Keep elbows slightly bent, squeeze fully at peak',setup:'Adjust seat, forearms on pads at chest height',breathing:'Exhale on squeeze',mistakes:'Going too heavy with jerky movement',joint:{shoulder:2,elbow:0,knee:0,spine:0,hip:0},cns:1,muscles:{primary:['chest'],secondary:['front_delts']},regressions:['DB Fly'],progressions:['Weighted Dip'],met:3.5,tempoRec:'2-2-1-0'},
    {n:'Front Delt Raise',em:'🙌',grp:'shoulders',diff:1,bw:false,eq:['dumbbell'],pri:'Front Delts',sec:'Upper Chest',cues:'Slight elbow bend, raise to eye level, controlled',setup:'Stand, dumbbells at sides',breathing:'Exhale raise',mistakes:'Using momentum, going above eye level',joint:{shoulder:2,elbow:0,knee:0,spine:1,hip:0},cns:1,muscles:{primary:['front_delts'],secondary:['upper_chest']},regressions:['Cable Front Raise'],progressions:['Plate Front Raise'],met:3.5,tempoRec:'2-1-2-0'},

    // BACK (18)
    {n:'Deadlift',em:'💀',grp:'back',diff:3,bw:false,eq:['barbell'],pri:'Lower Back',sec:'Glutes, Hamstrings, Traps, Lats',cues:'Neutral spine, bar close to body, push floor away',setup:'Hip-width stance, bar over mid-foot, hinge from hips',breathing:'Big breath in, brace core, exhale at top',mistakes:'Rounding lower back, bar drifting forward',joint:{shoulder:1,elbow:1,knee:2,spine:3,hip:3},cns:3,muscles:{primary:['lower_back'],secondary:['glutes','hamstrings','traps','lats']},regressions:['Romanian Deadlift','Trap Bar Deadlift'],progressions:['Deficit Deadlift'],met:7.0,tempoRec:'1-0-2-0'},
    {n:'Barbell Row',em:'🚣',grp:'back',diff:2,bw:false,eq:['barbell'],pri:'Lats',sec:'Rhomboids, Biceps, Rear Delts',cues:'Hinge to 45°, pull to lower chest, squeeze shoulder blades',setup:'Hip-width stance, overhand grip, hinge forward',breathing:'Exhale on pull',mistakes:'Too upright, using lower back momentum',joint:{shoulder:2,elbow:1,knee:1,spine:2,hip:2},cns:2,muscles:{primary:['lats'],secondary:['rhomboids','biceps','rear_delts']},regressions:['DB Row','Cable Row'],progressions:['Pendlay Row'],met:5.5,tempoRec:'1-1-2-0'},
    {n:'Lat Pulldown',em:'⬇️',grp:'back',diff:1,bw:false,eq:['cables'],pri:'Lats',sec:'Biceps, Rear Delts',cues:'Lean back slightly, pull to upper chest, squeeze lats',setup:'Overhand grip wider than shoulder-width, slight back lean',breathing:'Exhale on pull',mistakes:'Pulling to back of neck, excessive swing',joint:{shoulder:2,elbow:1,knee:0,spine:1,hip:0},cns:1,muscles:{primary:['lats'],secondary:['biceps','rear_delts']},regressions:['Band Pulldown'],progressions:['Pull-Ups','Weighted Pull-Ups'],met:4.5,tempoRec:'2-1-2-0'},
    {n:'Seated Cable Row',em:'🏹',grp:'back',diff:1,bw:false,eq:['cables'],pri:'Lats',sec:'Rhomboids, Biceps',cues:'Pull to lower chest, stretch forward on eccentric',setup:'V-bar attachment, sit upright, slight lean back at peak',breathing:'Exhale on pull',mistakes:'Rounding forward excessively',joint:{shoulder:2,elbow:1,knee:0,spine:1,hip:0},cns:1,muscles:{primary:['lats'],secondary:['rhomboids','biceps']},regressions:['Band Row'],progressions:['Barbell Row'],met:4.5,tempoRec:'2-1-2-0'},
    {n:'Pull-Ups',em:'🔝',grp:'back',diff:2,bw:true,eq:['bar'],pri:'Lats',sec:'Biceps, Rear Delts',cues:'Dead hang start, drive elbows to floor, chin over bar',setup:'Overhand grip shoulder-width or slightly wider',breathing:'Exhale on pull',mistakes:'Partial reps, kipping without skill',joint:{shoulder:2,elbow:1,knee:0,spine:1,hip:0},cns:2,muscles:{primary:['lats'],secondary:['biceps','rear_delts']},regressions:['Band-Assisted Pull-Ups','Lat Pulldown'],progressions:['Weighted Pull-Ups'],met:5.5,tempoRec:'2-1-1-1'},
    {n:'Chin-Ups',em:'🔝',grp:'back',diff:2,bw:true,eq:['bar'],pri:'Lats',sec:'Biceps',cues:'Supinated grip, elbows drive down and back',setup:'Underhand grip shoulder-width',breathing:'Exhale on pull',mistakes:'Not using full range of motion',joint:{shoulder:2,elbow:1,knee:0,spine:1,hip:0},cns:2,muscles:{primary:['lats'],secondary:['biceps']},regressions:['Band-Assisted Chin-Ups','Lat Pulldown'],progressions:['Weighted Chin-Ups'],met:5.5,tempoRec:'2-1-1-1'},
    {n:'T-Bar Row',em:'🎯',grp:'back',diff:2,bw:false,eq:['barbell'],pri:'Lats',sec:'Rhomboids, Biceps',cues:'Chest supported or free, pull to sternum',setup:'Barbell in corner or T-bar machine',breathing:'Exhale pull',mistakes:'Using lower back',joint:{shoulder:2,elbow:1,knee:1,spine:2,hip:2},cns:2,muscles:{primary:['lats'],secondary:['rhomboids','biceps']},regressions:['DB Row'],progressions:['Barbell Row'],met:5.0,tempoRec:'1-1-2-0'},
    {n:'Dumbbell Row',em:'💪',grp:'back',diff:1,bw:false,eq:['dumbbell'],pri:'Lats',sec:'Rhomboids, Biceps',cues:'Support on bench, row to hip, elbow close to body',setup:'One hand and knee on bench, neutral spine',breathing:'Exhale on pull',mistakes:'Rotating torso, pulling with arm only',joint:{shoulder:2,elbow:1,knee:0,spine:1,hip:0},cns:1,muscles:{primary:['lats'],secondary:['rhomboids','biceps']},regressions:['Band Row'],progressions:['Barbell Row'],met:4.5,tempoRec:'2-1-2-0'},
    {n:'Face Pulls',em:'🎭',grp:'back',diff:1,bw:false,eq:['cables'],pri:'Rear Delts',sec:'Rhomboids, Traps',cues:'Rope to face level, pull apart at peak, external rotation',setup:'Cable at face height, rope attachment',breathing:'Exhale on pull',mistakes:'Using too much weight, no external rotation',joint:{shoulder:1,elbow:0,knee:0,spine:0,hip:0},cns:1,muscles:{primary:['rear_delts'],secondary:['rhomboids','traps']},regressions:['Band Face Pulls'],progressions:['DB Rear Delt Fly'],met:3.5,tempoRec:'1-2-2-0'},
    {n:'Romanian Deadlift',em:'🦵',grp:'back',diff:2,bw:false,eq:['barbell'],pri:'Hamstrings',sec:'Glutes, Lower Back',cues:'Slight knee bend, hinge hips back, bar close to legs, feel stretch in hamstrings',setup:'Hip-width stance, overhand or mixed grip',breathing:'Inhale at top, exhale on return',mistakes:'Rounding back, squatting down instead of hinging',joint:{shoulder:1,elbow:1,knee:1,spine:2,hip:3},cns:2,muscles:{primary:['hamstrings'],secondary:['glutes','lower_back']},regressions:['KB Deadlift','Good Morning'],progressions:['Deficit RDL'],met:5.5,tempoRec:'1-1-3-0'},
    {n:'Pendlay Row',em:'🏊',grp:'back',diff:2,bw:false,eq:['barbell'],pri:'Lats',sec:'Rhomboids, Rear Delts',cues:'Parallel to floor, explosive pull from dead stop',setup:'Bar on floor, horizontal torso',breathing:'Exhale explosive pull',mistakes:'Not resetting bar each rep',joint:{shoulder:2,elbow:1,knee:1,spine:2,hip:2},cns:2,muscles:{primary:['lats'],secondary:['rhomboids','rear_delts']},regressions:['Barbell Row'],progressions:['Heavy Barbell Row'],met:5.5,tempoRec:'0-0-X-0'},
    {n:'Rear Delt Fly',em:'🦋',grp:'back',diff:1,bw:false,eq:['dumbbell'],pri:'Rear Delts',sec:'Rhomboids',cues:'Hinge 45°, lead with elbows, slight elbow bend',setup:'Seated or standing hinge, DBs hanging',breathing:'Exhale on fly',mistakes:'Using momentum, too heavy',joint:{shoulder:1,elbow:0,knee:0,spine:1,hip:1},cns:1,muscles:{primary:['rear_delts'],secondary:['rhomboids']},regressions:['Cable Rear Delt Fly'],progressions:['Heavy DB Rear Delt Fly'],met:3.5,tempoRec:'2-1-2-0'},
    {n:'Good Morning',em:'🌅',grp:'back',diff:2,bw:false,eq:['barbell'],pri:'Lower Back',sec:'Hamstrings, Glutes',cues:'Bar on traps, hip hinge, neutral spine throughout',setup:'Bar on upper traps, shoulder-width stance',breathing:'Inhale at top, exhale returning',mistakes:'Rounding spine, insufficient hip hinge',joint:{shoulder:1,elbow:0,knee:0,spine:3,hip:3},cns:2,muscles:{primary:['lower_back'],secondary:['hamstrings','glutes']},regressions:['Romanian Deadlift'],progressions:['Heavy RDL'],met:5.0,tempoRec:'2-1-1-0'},
    {n:'Hyperextensions',em:'🌈',grp:'back',diff:1,bw:true,eq:[],pri:'Lower Back',sec:'Glutes, Hamstrings',cues:'Hinge at hip pad, neutral spine, squeeze glutes at top',setup:'GHD or 45° back extension bench',breathing:'Exhale at top',mistakes:'Hyperextending lumbar at top',joint:{shoulder:0,elbow:0,knee:0,spine:2,hip:2},cns:1,muscles:{primary:['lower_back'],secondary:['glutes','hamstrings']},regressions:['Prone Superman'],progressions:['Weighted Hyperextension'],met:3.5,tempoRec:'2-1-1-0'},
    {n:'Trap Bar Deadlift',em:'🔷',grp:'back',diff:2,bw:false,eq:['machine'],pri:'Lower Back',sec:'Quads, Glutes, Traps',cues:'Sit into bar, neutral spine, push floor away',setup:'Trap/hex bar, handles at sides',breathing:'Big brace, exhale at top',mistakes:'Letting bar tip forward',joint:{shoulder:1,elbow:1,knee:2,spine:2,hip:3},cns:2,muscles:{primary:['lower_back'],secondary:['quads','glutes','traps']},regressions:['KB Deadlift'],progressions:['Barbell Deadlift'],met:6.0,tempoRec:'1-0-2-0'},
    {n:'Lat Pullover',em:'🌊',grp:'back',diff:1,bw:false,eq:['dumbbell'],pri:'Lats',sec:'Chest, Triceps',cues:'Slight elbow bend, feel lat stretch at top, squeeze at bottom',setup:'Bench perpendicular, shoulders on bench, hips low',breathing:'Inhale at stretch, exhale pull',mistakes:'Bending elbows too much',joint:{shoulder:2,elbow:1,knee:0,spine:0,hip:0},cns:1,muscles:{primary:['lats'],secondary:['chest','triceps']},regressions:['Cable Pullover'],progressions:['Straight-Arm Pulldown'],met:4.0,tempoRec:'3-1-1-0'},
    {n:'Straight-Arm Pulldown',em:'⬇️',grp:'back',diff:1,bw:false,eq:['cables'],pri:'Lats',sec:'Rear Delts',cues:'Straight arms, lat-initiated pull, squeeze at bottom',setup:'Cable high, rope or bar, slight forward lean',breathing:'Exhale on pull',mistakes:'Bending elbows',joint:{shoulder:2,elbow:0,knee:0,spine:0,hip:0},cns:1,muscles:{primary:['lats'],secondary:['rear_delts']},regressions:['Band Pulldown'],progressions:['Weighted Pull-Ups'],met:4.0,tempoRec:'2-1-2-0'},
    {n:'Shrugs',em:'🤷',grp:'back',diff:1,bw:false,eq:['barbell'],pri:'Traps',sec:'Rear Delts',cues:'Roll shoulders back not forward, squeeze at top',setup:'Barbell in front, shoulder-width grip',breathing:'Exhale on shrug',mistakes:'Rolling forward, using too heavy',joint:{shoulder:1,elbow:0,knee:0,spine:1,hip:0},cns:1,muscles:{primary:['traps'],secondary:['rear_delts']},regressions:['DB Shrugs'],progressions:['Heavy Barbell Shrugs'],met:3.5,tempoRec:'1-2-1-0'},

    // LEGS (20)
    {n:'Back Squat',em:'🏋️',grp:'legs',diff:3,bw:false,eq:['barbell'],pri:'Quads',sec:'Glutes, Hamstrings, Core',cues:'Chest up, knees track toes, depth below parallel, drive through heels',setup:'Bar on upper traps, shoulder-width stance',breathing:'Brace before descent, exhale on ascent',mistakes:'Knee cave, forward lean, partial depth',joint:{shoulder:1,elbow:1,knee:3,spine:2,hip:3},cns:3,muscles:{primary:['quads'],secondary:['glutes','hamstrings','core']},regressions:['Goblet Squat','Box Squat'],progressions:['Pause Squat','Front Squat'],met:6.0,tempoRec:'2-1-1-0'},
    {n:'Front Squat',em:'🔄',grp:'legs',diff:3,bw:false,eq:['barbell'],pri:'Quads',sec:'Core, Glutes',cues:'Elbows high, upright torso, knees out',setup:'Clean grip or cross-arm, bar on front delts',breathing:'Brace, exhale up',mistakes:'Dropping elbows, excessive forward lean',joint:{shoulder:2,elbow:2,knee:3,spine:1,hip:3},cns:3,muscles:{primary:['quads'],secondary:['core','glutes']},regressions:['Goblet Squat'],progressions:['Pause Front Squat'],met:6.0,tempoRec:'2-1-1-0'},
    {n:'Leg Press',em:'🦵',grp:'legs',diff:1,bw:false,eq:['machine'],pri:'Quads',sec:'Glutes, Hamstrings',cues:'Full range, don\'t lock out completely, feet shoulder-width',setup:'Seat back reclined, feet at shoulder width on platform',breathing:'Exhale press, inhale lower',mistakes:'Letting lower back peel off pad',joint:{shoulder:0,elbow:0,knee:2,spine:1,hip:2},cns:1,muscles:{primary:['quads'],secondary:['glutes','hamstrings']},regressions:['Goblet Squat'],progressions:['Back Squat'],met:4.5,tempoRec:'2-0-1-0'},
    {n:'Leg Extension',em:'📺',grp:'legs',diff:1,bw:false,eq:['machine'],pri:'Quads',sec:'',cues:'Full extension, squeeze VMO at top, slow eccentric',setup:'Back against pad, ankle pad at lower shins',breathing:'Exhale extend',mistakes:'Swinging, partial ROM',joint:{shoulder:0,elbow:0,knee:2,spine:0,hip:0},cns:1,muscles:{primary:['quads'],secondary:[]},regressions:['Goblet Squat'],progressions:['Leg Press'],met:3.5,tempoRec:'2-2-1-0'},
    {n:'Leg Curl',em:'🦵',grp:'legs',diff:1,bw:false,eq:['machine'],pri:'Hamstrings',sec:'',cues:'Full contraction, don\'t allow hips to rise',setup:'Lying face down, ankle pad above heels',breathing:'Exhale curl',mistakes:'Raising hips, partial range',joint:{shoulder:0,elbow:0,knee:2,spine:0,hip:0},cns:1,muscles:{primary:['hamstrings'],secondary:[]},regressions:['Nordic Curl'],progressions:['Romanian Deadlift'],met:3.5,tempoRec:'2-2-1-0'},
    {n:'Hip Thrust',em:'🍑',grp:'legs',diff:1,bw:false,eq:['barbell'],pri:'Glutes',sec:'Hamstrings',cues:'Drive hips up, squeeze glutes hard at top, chin tucked',setup:'Upper back on bench, bar across hips, feet flat',breathing:'Exhale thrust up',mistakes:'Overextending lumbar, not squeezing at top',joint:{shoulder:0,elbow:0,knee:1,spine:2,hip:2},cns:1,muscles:{primary:['glutes'],secondary:['hamstrings']},regressions:['Glute Bridge BW'],progressions:['Banded Hip Thrust'],met:4.5,tempoRec:'1-2-1-0'},
    {n:'Bulgarian Split Squat',em:'🇧🇬',grp:'legs',diff:2,bw:false,eq:['dumbbell'],pri:'Quads',sec:'Glutes, Hamstrings',cues:'Front foot far enough to stay vertical shin, knee over toe',setup:'Rear foot on bench, front foot stepped out',breathing:'Exhale on ascent',mistakes:'Front knee caving, leaning too far forward',joint:{shoulder:0,elbow:0,knee:3,spine:1,hip:3},cns:2,muscles:{primary:['quads'],secondary:['glutes','hamstrings']},regressions:['Reverse Lunge'],progressions:['Back Squat'],met:5.0,tempoRec:'2-1-1-0'},
    {n:'Goblet Squat',em:'🏆',grp:'legs',diff:1,bw:false,eq:['kettlebell'],pri:'Quads',sec:'Glutes, Core',cues:'Hold KB at chest, heels down, chest up, knees out',setup:'Feet shoulder-width, toes slightly out',breathing:'Brace, exhale up',mistakes:'Heels rising, forward lean',joint:{shoulder:1,elbow:1,knee:2,spine:1,hip:2},cns:1,muscles:{primary:['quads'],secondary:['glutes','core']},regressions:['Box Squat'],progressions:['Front Squat'],met:4.5,tempoRec:'2-1-1-0'},
    {n:'Standing Calf Raise',em:'🦶',grp:'legs',diff:1,bw:false,eq:['machine'],pri:'Calves',sec:'',cues:'Full range, pause at bottom stretch, squeeze at top',setup:'Balls of feet on edge, straight legs',breathing:'Exhale raise',mistakes:'Partial range, bouncing',joint:{shoulder:0,elbow:0,knee:0,spine:0,hip:0},cns:1,muscles:{primary:['calves'],secondary:[]},regressions:['BW Calf Raise'],progressions:['Donkey Calf Raise'],met:3.5,tempoRec:'1-2-1-2'},
    {n:'Seated Calf Raise',em:'💺',grp:'legs',diff:1,bw:false,eq:['machine'],pri:'Calves',sec:'',cues:'Full range, soleus focus',setup:'Knees at 90°, pad above knees',breathing:'Exhale raise',mistakes:'Bouncing at bottom',joint:{shoulder:0,elbow:0,knee:0,spine:0,hip:0},cns:1,muscles:{primary:['calves'],secondary:[]},regressions:['BW Calf Raise'],progressions:['Standing Calf Raise'],met:3.0,tempoRec:'2-2-1-2'},
    {n:'Hack Squat',em:'🔧',grp:'legs',diff:2,bw:false,eq:['machine'],pri:'Quads',sec:'Glutes',cues:'Full depth, heels elevated on plate for more quad',setup:'Machine hack squat, shoulder pads secure',breathing:'Exhale press',mistakes:'Knees caving, shallow depth',joint:{shoulder:0,elbow:0,knee:3,spine:1,hip:2},cns:2,muscles:{primary:['quads'],secondary:['glutes']},regressions:['Leg Press'],progressions:['Back Squat'],met:5.0,tempoRec:'2-0-1-0'},
    {n:'Reverse Lunge',em:'🔙',grp:'legs',diff:1,bw:false,eq:['dumbbell'],pri:'Quads',sec:'Glutes',cues:'Step back, vertical shin on front leg, control descent',setup:'Standing, DBs in hands',breathing:'Exhale return to start',mistakes:'Forward knee drift, leaning',joint:{shoulder:0,elbow:0,knee:2,spine:1,hip:2},cns:1,muscles:{primary:['quads'],secondary:['glutes']},regressions:['Bodyweight Squat'],progressions:['Bulgarian Split Squat'],met:4.5,tempoRec:'2-0-1-0'},
    {n:'Walking Lunge',em:'🚶',grp:'legs',diff:2,bw:false,eq:['dumbbell'],pri:'Quads',sec:'Glutes, Hamstrings',cues:'Long stride, torso upright, control each step',setup:'Open space, DBs in hands',breathing:'Exhale step forward',mistakes:'Short stride, knee cave',joint:{shoulder:0,elbow:0,knee:2,spine:1,hip:2},cns:1,muscles:{primary:['quads'],secondary:['glutes','hamstrings']},regressions:['Reverse Lunge'],progressions:['Barbell Lunge'],met:5.0,tempoRec:'1-0-1-0'},
    {n:'Box Jump',em:'📦',grp:'legs',diff:2,bw:true,eq:[],pri:'Quads',sec:'Glutes, Calves',cues:'Hinge and explode, land softly, step down',setup:'Stable box 18-24 inches',breathing:'Exhale jump',mistakes:'Landing with locked knees',joint:{shoulder:0,elbow:0,knee:2,spine:1,hip:2},cns:2,muscles:{primary:['quads'],secondary:['glutes','calves']},regressions:['Squat Jump'],progressions:['Depth Drop'],met:8.0,tempoRec:'0-0-X-0'},
    {n:'Nordic Curl',em:'🎿',grp:'legs',diff:3,bw:true,eq:[],pri:'Hamstrings',sec:'Glutes',cues:'Eccentric focus, lower as slowly as possible',setup:'Feet anchored, kneel',breathing:'Inhale lower, exhale pull back',mistakes:'Going too fast on eccentric',joint:{shoulder:0,elbow:0,knee:3,spine:0,hip:1},cns:2,muscles:{primary:['hamstrings'],secondary:['glutes']},regressions:['Leg Curl'],progressions:['Weighted Nordic Curl'],met:5.0,tempoRec:'4-0-1-0'},
    {n:'Step-Ups',em:'👆',grp:'legs',diff:1,bw:false,eq:['dumbbell'],pri:'Quads',sec:'Glutes',cues:'Drive through heel of lead leg, don\'t push off back foot',setup:'Stable box or bench 16-20 inches',breathing:'Exhale step up',mistakes:'Pushing off back foot',joint:{shoulder:0,elbow:0,knee:2,spine:1,hip:2},cns:1,muscles:{primary:['quads'],secondary:['glutes']},regressions:['Bodyweight Step-Ups'],progressions:['Bulgarian Split Squat'],met:4.5,tempoRec:'1-1-2-0'},
    {n:'Cable Pull-Through',em:'🔌',grp:'legs',diff:1,bw:false,eq:['cables'],pri:'Glutes',sec:'Hamstrings',cues:'Hip hinge, keep arms between legs, squeeze glutes at top',setup:'Cable at floor level, rope attachment, face away',breathing:'Exhale thrust forward',mistakes:'Squatting instead of hinging',joint:{shoulder:1,elbow:0,knee:1,spine:1,hip:2},cns:1,muscles:{primary:['glutes'],secondary:['hamstrings']},regressions:['Glute Bridge'],progressions:['Hip Thrust'],met:4.0,tempoRec:'1-1-2-0'},
    {n:'Sumo Deadlift',em:'🤼',grp:'legs',diff:2,bw:false,eq:['barbell'],pri:'Glutes',sec:'Quads, Hamstrings, Lower Back',cues:'Wide stance, toes out, knees out, short range of motion',setup:'Wide stance, toes pointed out, grip inside legs',breathing:'Brace, exhale at top',mistakes:'Knee cave, rounding back',joint:{shoulder:1,elbow:1,knee:2,spine:2,hip:3},cns:2,muscles:{primary:['glutes'],secondary:['quads','hamstrings','lower_back']},regressions:['KB Deadlift'],progressions:['Conventional Deadlift'],met:5.5,tempoRec:'1-0-2-0'},
    {n:'Leg Press Calf Raise',em:'🦵',grp:'legs',diff:1,bw:false,eq:['machine'],pri:'Calves',sec:'',cues:'Full range, slow and controlled',setup:'Leg press machine, toes on platform edge',breathing:'Exhale raise',mistakes:'Partial range',joint:{shoulder:0,elbow:0,knee:0,spine:0,hip:0},cns:1,muscles:{primary:['calves'],secondary:[]},regressions:['BW Calf Raise'],progressions:['Standing Calf Raise'],met:3.0,tempoRec:'1-2-1-2'},
    {n:'Glute Bridge',em:'🌉',grp:'legs',diff:1,bw:true,eq:[],pri:'Glutes',sec:'Hamstrings',cues:'Drive hips up, squeeze glutes at top, neutral spine',setup:'Lie on back, knees bent, feet flat',breathing:'Exhale thrust',mistakes:'Overextending lumbar',joint:{shoulder:0,elbow:0,knee:1,spine:1,hip:2},cns:1,muscles:{primary:['glutes'],secondary:['hamstrings']},regressions:['Prone Hip Extension'],progressions:['Hip Thrust'],met:3.5,tempoRec:'1-2-1-0'},

    // SHOULDERS (14)
    {n:'Overhead Press',em:'🏗️',grp:'shoulders',diff:2,bw:false,eq:['barbell'],pri:'Front Delts',sec:'Side Delts, Triceps, Traps',cues:'Bar path vertical, slight back lean, flare elbows at top',setup:'Shoulder-width grip, bar at upper chest',breathing:'Brace, exhale press',mistakes:'Excessive back arch, forward bar path',joint:{shoulder:2,elbow:1,knee:0,spine:2,hip:0},cns:2,muscles:{primary:['front_delts'],secondary:['side_delts','triceps','traps']},regressions:['DB Shoulder Press'],progressions:['Push Press'],met:5.0,tempoRec:'2-0-1-0'},
    {n:'Dumbbell Shoulder Press',em:'💪',grp:'shoulders',diff:1,bw:false,eq:['dumbbell'],pri:'Front Delts',sec:'Side Delts, Triceps',cues:'Neutral grip or pronated, full range, controlled',setup:'Seated or standing, DBs at shoulder height',breathing:'Exhale press',mistakes:'Partial range, elbows flaring too wide',joint:{shoulder:2,elbow:1,knee:0,spine:1,hip:0},cns:1,muscles:{primary:['front_delts'],secondary:['side_delts','triceps']},regressions:['Landmine Press'],progressions:['Barbell OHP'],met:4.5,tempoRec:'2-0-1-0'},
    {n:'Arnold Press',em:'💪',grp:'shoulders',diff:1,bw:false,eq:['dumbbell'],pri:'Front Delts',sec:'Side Delts, Rear Delts',cues:'Rotate palms as you press, full range of motion',setup:'Seated, start with DBs in front at chin height',breathing:'Exhale press',mistakes:'Partial rotation, too heavy',joint:{shoulder:2,elbow:1,knee:0,spine:1,hip:0},cns:1,muscles:{primary:['front_delts'],secondary:['side_delts','rear_delts']},regressions:['DB Shoulder Press'],progressions:['Barbell OHP'],met:4.5,tempoRec:'2-0-1-0'},
    {n:'Dumbbell Lateral Raise',em:'↔️',grp:'shoulders',diff:1,bw:false,eq:['dumbbell'],pri:'Side Delts',sec:'Traps',cues:'Lead with elbows not hands, raise to ear height, slight forward lean',setup:'Standing, DBs at sides, slight elbow bend',breathing:'Exhale raise',mistakes:'Using momentum, going too heavy, past parallel',joint:{shoulder:2,elbow:0,knee:0,spine:0,hip:0},cns:1,muscles:{primary:['side_delts'],secondary:['traps']},regressions:['Cable Lateral Raise'],progressions:['Machine Lateral Raise'],met:3.5,tempoRec:'2-1-2-0'},
    {n:'Cable Lateral Raise',em:'⚡',grp:'shoulders',diff:1,bw:false,eq:['cables'],pri:'Side Delts',sec:'Traps',cues:'Constant tension, controlled throughout full range',setup:'Cable at floor, D-ring, stand beside machine',breathing:'Exhale raise',mistakes:'Using momentum',joint:{shoulder:2,elbow:0,knee:0,spine:0,hip:0},cns:1,muscles:{primary:['side_delts'],secondary:['traps']},regressions:['DB Lateral Raise'],progressions:['Machine Lateral Raise'],met:3.5,tempoRec:'2-1-2-0'},
    {n:'Upright Row',em:'⬆️',grp:'shoulders',diff:2,bw:false,eq:['barbell'],pri:'Side Delts',sec:'Traps, Biceps',cues:'Elbows lead, pull to lower chin, wide grip',setup:'Shoulder-width or wider grip, bar against body',breathing:'Exhale pull',mistakes:'Narrow grip causes impingement',joint:{shoulder:3,elbow:1,knee:0,spine:1,hip:0},cns:1,muscles:{primary:['side_delts'],secondary:['traps','biceps']},regressions:['DB Lateral Raise'],progressions:['Heavy DB Lateral Raise'],met:4.0,tempoRec:'2-1-2-0'},
    {n:'Machine Shoulder Press',em:'🖥️',grp:'shoulders',diff:1,bw:false,eq:['machine'],pri:'Front Delts',sec:'Side Delts, Triceps',cues:'Adjust seat height, full range, controlled',setup:'Seat so handles align with upper chest',breathing:'Exhale press',mistakes:'Partial range',joint:{shoulder:1,elbow:1,knee:0,spine:0,hip:0},cns:1,muscles:{primary:['front_delts'],secondary:['side_delts','triceps']},regressions:['DB Shoulder Press'],progressions:['Barbell OHP'],met:4.0,tempoRec:'2-0-1-0'},
    {n:'Rear Delt Machine',em:'🔄',grp:'shoulders',diff:1,bw:false,eq:['machine'],pri:'Rear Delts',sec:'Rhomboids',cues:'Squeeze rear delts at peak contraction',setup:'Pec deck in reverse, chest against pad',breathing:'Exhale on fly',mistakes:'Going too heavy',joint:{shoulder:1,elbow:0,knee:0,spine:0,hip:0},cns:1,muscles:{primary:['rear_delts'],secondary:['rhomboids']},regressions:['DB Rear Delt Fly'],progressions:['Heavy Rear Delt Fly'],met:3.5,tempoRec:'2-2-1-0'},
    {n:'Push Press',em:'⬆️',grp:'shoulders',diff:2,bw:false,eq:['barbell'],pri:'Front Delts',sec:'Triceps, Legs',cues:'Dip and drive legs, lock out overhead',setup:'Barbell at shoulder height in rack',breathing:'Exhale drive',mistakes:'Excessive knee bend, bar path not vertical',joint:{shoulder:2,elbow:1,knee:1,spine:2,hip:1},cns:2,muscles:{primary:['front_delts'],secondary:['triceps','quads']},regressions:['Overhead Press'],progressions:['Push Jerk'],met:5.5,tempoRec:'0-0-X-0'},
    {n:'Lateral Raise Machine',em:'🖥️',grp:'shoulders',diff:1,bw:false,eq:['machine'],pri:'Side Delts',sec:'',cues:'Constant tension, no momentum',setup:'Arm pad at elbow level, seated',breathing:'Exhale raise',mistakes:'Leaning to one side',joint:{shoulder:1,elbow:0,knee:0,spine:0,hip:0},cns:1,muscles:{primary:['side_delts'],secondary:[]},regressions:['DB Lateral Raise'],progressions:['Cable Lateral Raise'],met:3.5,tempoRec:'2-1-2-0'},
    {n:'Dumbbell Y-Raise',em:'🔱',grp:'shoulders',diff:1,bw:false,eq:['dumbbell'],pri:'Rear Delts',sec:'Traps',cues:'Prone on incline bench, raise DBs to Y position',setup:'Incline bench 30-45°, lie prone',breathing:'Exhale raise',mistakes:'Using momentum',joint:{shoulder:1,elbow:0,knee:0,spine:0,hip:0},cns:1,muscles:{primary:['rear_delts'],secondary:['traps']},regressions:['Face Pulls'],progressions:['DB Rear Delt Fly'],met:3.5,tempoRec:'2-1-2-0'},
    {n:'Band Pull-Aparts',em:'↔️',grp:'shoulders',diff:1,bw:false,eq:['bands'],pri:'Rear Delts',sec:'Rhomboids',cues:'Straight arms, controlled pull apart at chest height',setup:'Band in front at chest height',breathing:'Exhale pull apart',mistakes:'Too much elbow bend',joint:{shoulder:1,elbow:0,knee:0,spine:0,hip:0},cns:1,muscles:{primary:['rear_delts'],secondary:['rhomboids']},regressions:['Cable Face Pulls'],progressions:['Face Pulls'],met:3.0,tempoRec:'1-2-2-0'},
    {n:'Seated DB Press',em:'💺',grp:'shoulders',diff:1,bw:false,eq:['dumbbell'],pri:'Front Delts',sec:'Side Delts, Triceps',cues:'Neutral back, full range press',setup:'Bench with back support, DBs at shoulder height',breathing:'Exhale press',mistakes:'Arching back',joint:{shoulder:2,elbow:1,knee:0,spine:1,hip:0},cns:1,muscles:{primary:['front_delts'],secondary:['side_delts','triceps']},regressions:['Landmine Press'],progressions:['Barbell OHP'],met:4.5,tempoRec:'2-0-1-0'},
    {n:'Cable Face Pull',em:'🎭',grp:'shoulders',diff:1,bw:false,eq:['cables'],pri:'Rear Delts',sec:'Traps, Rhomboids',cues:'Pull to face level, external rotation at peak',setup:'Rope at eye level',breathing:'Exhale pull',mistakes:'No external rotation',joint:{shoulder:1,elbow:0,knee:0,spine:0,hip:0},cns:1,muscles:{primary:['rear_delts'],secondary:['traps','rhomboids']},regressions:['Band Pull-Aparts'],progressions:['DB Rear Delt Fly'],met:3.5,tempoRec:'1-2-2-0'},

    // BICEPS (10)
    {n:'Barbell Curl',em:'💪',grp:'biceps',diff:1,bw:false,eq:['barbell'],pri:'Biceps',sec:'Brachialis',cues:'Elbows pinned at sides, full range, no swinging',setup:'Shoulder-width underhand grip, stand tall',breathing:'Exhale curl',mistakes:'Swinging body, partial range',joint:{shoulder:0,elbow:2,knee:0,spine:1,hip:0},cns:1,muscles:{primary:['biceps'],secondary:['brachialis']},regressions:['DB Curl'],progressions:['Incline DB Curl'],met:4.0,tempoRec:'2-1-1-0'},
    {n:'EZ Bar Curl',em:'〰️',grp:'biceps',diff:1,bw:false,eq:['barbell'],pri:'Biceps',sec:'Brachialis',cues:'Neutral shoulder, full range',setup:'EZ bar angled grip, elbows at sides',breathing:'Exhale curl',mistakes:'Swinging',joint:{shoulder:0,elbow:1,knee:0,spine:1,hip:0},cns:1,muscles:{primary:['biceps'],secondary:['brachialis']},regressions:['DB Curl'],progressions:['Barbell Curl'],met:4.0,tempoRec:'2-1-1-0'},
    {n:'Dumbbell Curl',em:'💪',grp:'biceps',diff:1,bw:false,eq:['dumbbell'],pri:'Biceps',sec:'',cues:'Supinate at top, full range',setup:'Alternate or simultaneously',breathing:'Exhale curl',mistakes:'Swinging, no supination',joint:{shoulder:0,elbow:1,knee:0,spine:0,hip:0},cns:1,muscles:{primary:['biceps'],secondary:[]},regressions:['Band Curl'],progressions:['Barbell Curl'],met:3.5,tempoRec:'2-1-1-0'},
    {n:'Hammer Curl',em:'🔨',grp:'biceps',diff:1,bw:false,eq:['dumbbell'],pri:'Brachialis',sec:'Biceps',cues:'Neutral grip, hammer position, controlled',setup:'Neutral grip, DBs at sides',breathing:'Exhale curl',mistakes:'Swinging',joint:{shoulder:0,elbow:1,knee:0,spine:0,hip:0},cns:1,muscles:{primary:['brachialis'],secondary:['biceps']},regressions:['Band Curl'],progressions:['Cross-Body Hammer Curl'],met:3.5,tempoRec:'2-1-1-0'},
    {n:'Incline Dumbbell Curl',em:'📐',grp:'biceps',diff:1,bw:false,eq:['dumbbell'],pri:'Biceps',sec:'',cues:'Full stretch at bottom, peak contraction at top',setup:'Incline bench 45-60°, arms hang straight',breathing:'Exhale curl',mistakes:'Not using full range',joint:{shoulder:1,elbow:1,knee:0,spine:0,hip:0},cns:1,muscles:{primary:['biceps'],secondary:[]},regressions:['DB Curl'],progressions:['Concentration Curl'],met:4.0,tempoRec:'3-1-1-0'},
    {n:'Cable Curl',em:'⚡',grp:'biceps',diff:1,bw:false,eq:['cables'],pri:'Biceps',sec:'',cues:'Constant tension, squeeze at top',setup:'Low pulley, straight bar or EZ attachment',breathing:'Exhale curl',mistakes:'Elbow drift',joint:{shoulder:0,elbow:1,knee:0,spine:0,hip:0},cns:1,muscles:{primary:['biceps'],secondary:[]},regressions:['Band Curl'],progressions:['Barbell Curl'],met:3.5,tempoRec:'2-1-2-0'},
    {n:'Preacher Curl',em:'🙏',grp:'biceps',diff:1,bw:false,eq:['machine'],pri:'Biceps',sec:'',cues:'Full extension, squeeze at top',setup:'Preacher bench, upper arms on pad',breathing:'Exhale curl',mistakes:'Not reaching full extension',joint:{shoulder:0,elbow:2,knee:0,spine:0,hip:0},cns:1,muscles:{primary:['biceps'],secondary:[]},regressions:['DB Curl'],progressions:['Barbell Curl'],met:3.5,tempoRec:'2-2-1-0'},
    {n:'Concentration Curl',em:'🎯',grp:'biceps',diff:1,bw:false,eq:['dumbbell'],pri:'Biceps',sec:'',cues:'Elbow against inner thigh, full range',setup:'Seated, elbow braced against inner thigh',breathing:'Exhale curl',mistakes:'Swinging arm off thigh',joint:{shoulder:0,elbow:1,knee:0,spine:1,hip:0},cns:1,muscles:{primary:['biceps'],secondary:[]},regressions:['DB Curl'],progressions:['Cable Curl'],met:3.5,tempoRec:'2-2-1-0'},
    {n:'Spider Curl',em:'🕷️',grp:'biceps',diff:1,bw:false,eq:['barbell'],pri:'Biceps',sec:'',cues:'Prone on incline bench, elbows hang straight down',setup:'Incline bench, chest against it facing down',breathing:'Exhale curl',mistakes:'Elbow drift backward',joint:{shoulder:0,elbow:1,knee:0,spine:0,hip:0},cns:1,muscles:{primary:['biceps'],secondary:[]},regressions:['DB Curl'],progressions:['Barbell Curl'],met:4.0,tempoRec:'2-2-1-0'},
    {n:'Cross-Body Hammer Curl',em:'↙️',grp:'biceps',diff:1,bw:false,eq:['dumbbell'],pri:'Brachialis',sec:'Biceps',cues:'Curl across body, neutral grip throughout',setup:'Standing, DB at side, curl across to opposite shoulder',breathing:'Exhale curl',mistakes:'Shoulder elevation',joint:{shoulder:0,elbow:1,knee:0,spine:0,hip:0},cns:1,muscles:{primary:['brachialis'],secondary:['biceps']},regressions:['Hammer Curl'],progressions:['Cross-Body Cable Curl'],met:3.5,tempoRec:'2-1-1-0'},

    // TRICEPS (10)
    {n:'Tricep Pushdown',em:'⬇️',grp:'triceps',diff:1,bw:false,eq:['cables'],pri:'Triceps',sec:'',cues:'Elbows pinned at sides, full extension, squeeze',setup:'High cable, rope or V-bar, elbows at sides',breathing:'Exhale push',mistakes:'Elbows drifting forward, partial range',joint:{shoulder:0,elbow:2,knee:0,spine:0,hip:0},cns:1,muscles:{primary:['triceps'],secondary:[]},regressions:['Band Pushdown'],progressions:['Close-Grip Bench Press'],met:3.5,tempoRec:'2-1-1-0'},
    {n:'Overhead Tricep Extension',em:'🔝',grp:'triceps',diff:1,bw:false,eq:['dumbbell'],pri:'Triceps',sec:'',cues:'Elbows point up, full stretch overhead, squeeze',setup:'Single DB, seated or standing, both hands',breathing:'Exhale extend',mistakes:'Elbows flaring, limited range',joint:{shoulder:1,elbow:2,knee:0,spine:1,hip:0},cns:1,muscles:{primary:['triceps'],secondary:[]},regressions:['Cable Overhead Extension'],progressions:['EZ Bar Skull Crusher'],met:4.0,tempoRec:'3-1-1-0'},
    {n:'Skull Crushers',em:'💀',grp:'triceps',diff:2,bw:false,eq:['barbell'],pri:'Triceps',sec:'',cues:'Lower to forehead or behind head, elbows point up',setup:'Flat bench, EZ bar or straight bar',breathing:'Exhale extend',mistakes:'Elbows flaring, bar hitting face',joint:{shoulder:1,elbow:2,knee:0,spine:0,hip:0},cns:1,muscles:{primary:['triceps'],secondary:[]},regressions:['DB Overhead Extension'],progressions:['Close-Grip Bench Press'],met:4.0,tempoRec:'2-1-1-0'},
    {n:'Tricep Dip',em:'💎',grp:'triceps',diff:2,bw:true,eq:['bar'],pri:'Triceps',sec:'Front Delts, Chest',cues:'Stay upright to target triceps, full range',setup:'Parallel bars, body straight',breathing:'Exhale dip',mistakes:'Leaning forward (shifts to chest)',joint:{shoulder:2,elbow:2,knee:0,spine:1,hip:0},cns:2,muscles:{primary:['triceps'],secondary:['front_delts','chest']},regressions:['Bench Dip'],progressions:['Weighted Tricep Dip'],met:5.0,tempoRec:'2-1-1-0'},
    {n:'Cable Overhead Extension',em:'⚡',grp:'triceps',diff:1,bw:false,eq:['cables'],pri:'Triceps',sec:'',cues:'Face away from cable, rope overhead, full stretch',setup:'Cable at low position, rope overhead',breathing:'Exhale extend',mistakes:'Elbows too wide',joint:{shoulder:1,elbow:2,knee:0,spine:1,hip:0},cns:1,muscles:{primary:['triceps'],secondary:[]},regressions:['DB Overhead Extension'],progressions:['Skull Crusher'],met:3.5,tempoRec:'3-1-1-0'},
    {n:'Bench Dip',em:'🪑',grp:'triceps',diff:1,bw:true,eq:[],pri:'Triceps',sec:'Front Delts',cues:'Hips close to bench, full range',setup:'Hands on bench edge, feet on floor',breathing:'Exhale dip',mistakes:'Hips drifting far from bench',joint:{shoulder:2,elbow:1,knee:0,spine:0,hip:0},cns:1,muscles:{primary:['triceps'],secondary:['front_delts']},regressions:['Seated Tricep Press'],progressions:['Tricep Dip'],met:4.0,tempoRec:'2-1-1-0'},
    {n:'Tricep Kickback',em:'↩️',grp:'triceps',diff:1,bw:false,eq:['dumbbell'],pri:'Triceps',sec:'',cues:'Upper arm parallel to floor, full extension',setup:'Bent over, elbow at side, upper arm parallel to floor',breathing:'Exhale kick back',mistakes:'Not locking upper arm',joint:{shoulder:0,elbow:1,knee:0,spine:1,hip:1},cns:1,muscles:{primary:['triceps'],secondary:[]},regressions:['Band Kickback'],progressions:['Cable Kickback'],met:3.5,tempoRec:'1-2-1-0'},
    {n:'Diamond Push-Ups',em:'💎',grp:'triceps',diff:2,bw:true,eq:[],pri:'Triceps',sec:'Chest',cues:'Hands form diamond shape, elbows track back',setup:'Push-up position with diamond hand formation',breathing:'Exhale push',mistakes:'Elbows flaring',joint:{shoulder:1,elbow:2,knee:0,spine:1,hip:0},cns:1,muscles:{primary:['triceps'],secondary:['chest']},regressions:['Close-Grip Push-Ups'],progressions:['Weighted Diamond Push-Ups'],met:4.5,tempoRec:'2-0-1-0'},
    {n:'JM Press',em:'🏗️',grp:'triceps',diff:2,bw:false,eq:['barbell'],pri:'Triceps',sec:'Chest',cues:'Cross between close-grip bench and skull crusher',setup:'Barbell, medium grip, lower to throat',breathing:'Exhale press',mistakes:'Bar path too vertical',joint:{shoulder:1,elbow:2,knee:0,spine:0,hip:0},cns:1,muscles:{primary:['triceps'],secondary:['chest']},regressions:['Close-Grip Bench Press'],progressions:['Skull Crusher'],met:4.5,tempoRec:'2-1-1-0'},
    {n:'Single-Arm Cable Pushdown',em:'🎯',grp:'triceps',diff:1,bw:false,eq:['cables'],pri:'Triceps',sec:'',cues:'Single arm, full extension, twist at bottom',setup:'High cable, D-ring attachment, single arm',breathing:'Exhale push',mistakes:'Elbow drift',joint:{shoulder:0,elbow:1,knee:0,spine:0,hip:0},cns:1,muscles:{primary:['triceps'],secondary:[]},regressions:['Band Pushdown'],progressions:['Tricep Pushdown'],met:3.5,tempoRec:'2-1-1-0'},

    // CORE (12)
    {n:'Plank',em:'🔲',grp:'core',diff:1,bw:true,eq:[],pri:'Core',sec:'Shoulders, Glutes',cues:'Rigid body, squeeze everything, neutral spine',setup:'Forearms on floor, body plank position',breathing:'Steady controlled breathing',mistakes:'Hips sagging or rising',joint:{shoulder:1,elbow:0,knee:0,spine:1,hip:1},cns:1,muscles:{primary:['core'],secondary:['shoulders','glutes']},regressions:['Knee Plank'],progressions:['Weighted Plank','RKC Plank'],met:3.5,tempoRec:'hold'},
    {n:'Cable Crunch',em:'⚡',grp:'core',diff:1,bw:false,eq:['cables'],pri:'Abs',sec:'',cues:'Round spine, crunch elbows to knees',setup:'High cable, rope, kneel facing cable',breathing:'Exhale crunch',mistakes:'Using hip flexors, not rounding spine',joint:{shoulder:0,elbow:0,knee:0,spine:1,hip:0},cns:1,muscles:{primary:['abs'],secondary:[]},regressions:['Crunch'],progressions:['Weighted Crunch'],met:3.5,tempoRec:'2-1-1-0'},
    {n:'Hanging Leg Raise',em:'🏋️',grp:'core',diff:2,bw:true,eq:['bar'],pri:'Abs',sec:'Hip Flexors',cues:'No swing, posterior pelvic tilt at top',setup:'Dead hang, raise legs to parallel or above',breathing:'Exhale raise',mistakes:'Swinging, not rounding at top',joint:{shoulder:1,elbow:0,knee:0,spine:1,hip:2},cns:1,muscles:{primary:['abs'],secondary:['hip_flexors']},regressions:['Knee Raise'],progressions:['Toes to Bar'],met:4.5,tempoRec:'2-1-2-0'},
    {n:'Russian Twist',em:'🌀',grp:'core',diff:1,bw:true,eq:[],pri:'Obliques',sec:'Abs',cues:'Rotate from torso, not just arms',setup:'Seated, feet off floor, slight lean back',breathing:'Exhale twist',mistakes:'Rotating from arms only',joint:{shoulder:0,elbow:0,knee:0,spine:1,hip:0},cns:1,muscles:{primary:['obliques'],secondary:['abs']},regressions:['Seated Twist'],progressions:['Weighted Russian Twist'],met:3.5,tempoRec:'1-0-1-0'},
    {n:'Ab Wheel Rollout',em:'🎡',grp:'core',diff:3,bw:true,eq:[],pri:'Abs',sec:'Shoulders, Lats',cues:'Neutral spine, don\'t let hips drop, roll from knees',setup:'Kneel, ab wheel in hands',breathing:'Inhale roll out, exhale return',mistakes:'Hips sagging, lower back arching',joint:{shoulder:2,elbow:0,knee:0,spine:2,hip:1},cns:2,muscles:{primary:['abs'],secondary:['shoulders','lats']},regressions:['Plank'],progressions:['Standing Ab Wheel'],met:5.0,tempoRec:'2-1-2-0'},
    {n:'Dead Bug',em:'🐛',grp:'core',diff:1,bw:true,eq:[],pri:'Core',sec:'Hip Flexors',cues:'Lower back pressed to floor throughout, opposite arm-leg extension',setup:'Lie on back, arms up, knees at 90°',breathing:'Exhale extend',mistakes:'Lower back arching off floor',joint:{shoulder:0,elbow:0,knee:0,spine:1,hip:0},cns:1,muscles:{primary:['core'],secondary:['hip_flexors']},regressions:['Bird Dog'],progressions:['Weighted Dead Bug'],met:3.5,tempoRec:'2-0-2-0'},
    {n:'Pallof Press',em:'🎯',grp:'core',diff:1,bw:false,eq:['cables'],pri:'Core',sec:'Obliques',cues:'Resist rotation, press out and return, square to cable',setup:'Cable at chest height, side on to machine',breathing:'Exhale press out',mistakes:'Rotating torso',joint:{shoulder:1,elbow:0,knee:0,spine:1,hip:0},cns:1,muscles:{primary:['core'],secondary:['obliques']},regressions:['Band Pallof Press'],progressions:['Overhead Pallof Press'],met:3.5,tempoRec:'2-2-2-0'},
    {n:'Mountain Climbers',em:'🧗',grp:'core',diff:2,bw:true,eq:[],pri:'Core',sec:'Hip Flexors, Shoulders',cues:'High plank, alternate knees to chest, hips level',setup:'Push-up position, alternate drive knees to chest',breathing:'Steady',mistakes:'Piking hips up',joint:{shoulder:2,elbow:0,knee:0,spine:1,hip:1},cns:1,muscles:{primary:['core'],secondary:['hip_flexors','shoulders']},regressions:['Plank'],progressions:['Explosive Mountain Climbers'],met:8.0,tempoRec:'explosive'},
    {n:'Bicycle Crunch',em:'🚴',grp:'core',diff:1,bw:true,eq:[],pri:'Obliques',sec:'Abs',cues:'Opposite elbow to opposite knee, fully extend',setup:'Lie on back, hands behind head',breathing:'Exhale crunch',mistakes:'Pulling neck, not extending leg',joint:{shoulder:0,elbow:0,knee:0,spine:1,hip:1},cns:1,muscles:{primary:['obliques'],secondary:['abs']},regressions:['Crunch'],progressions:['Weighted Bicycle Crunch'],met:5.0,tempoRec:'1-1-1-0'},
    {n:'Hollow Hold',em:'🥊',grp:'core',diff:2,bw:true,eq:[],pri:'Core',sec:'Hip Flexors',cues:'Lower back pressed down, slight hollow curve in back',setup:'Lie on back, arms overhead, legs extended',breathing:'Steady deep breathing',mistakes:'Lower back arching',joint:{shoulder:0,elbow:0,knee:0,spine:1,hip:1},cns:1,muscles:{primary:['core'],secondary:['hip_flexors']},regressions:['Dead Bug'],progressions:['Hollow Rock'],met:4.0,tempoRec:'hold'},
    {n:'Leg Raises',em:'🦵',grp:'core',diff:1,bw:true,eq:[],pri:'Abs',sec:'Hip Flexors',cues:'Posterior pelvic tilt at top, control descent',setup:'Lie on back, legs together',breathing:'Exhale raise',mistakes:'Lower back arching off floor',joint:{shoulder:0,elbow:0,knee:0,spine:1,hip:2},cns:1,muscles:{primary:['abs'],secondary:['hip_flexors']},regressions:['Knee Raise'],progressions:['Hanging Leg Raise'],met:3.5,tempoRec:'2-1-2-0'},
    {n:'Side Plank',em:'📐',grp:'core',diff:1,bw:true,eq:[],pri:'Obliques',sec:'Core, Shoulders',cues:'Straight line from head to heels, squeeze obliques',setup:'Side on floor, forearm down, stack feet',breathing:'Steady',mistakes:'Hips sagging',joint:{shoulder:1,elbow:0,knee:0,spine:1,hip:1},cns:1,muscles:{primary:['obliques'],secondary:['core','shoulders']},regressions:['Knee Side Plank'],progressions:['Weighted Side Plank'],met:3.5,tempoRec:'hold'},

    // GLUTES (10)
    {n:'Hip Thrust BW',em:'🍑',grp:'glutes',diff:1,bw:true,eq:[],pri:'Glutes',sec:'Hamstrings',cues:'Chin tucked, squeeze glutes hard at top',setup:'Upper back on bench, knees bent',breathing:'Exhale thrust',mistakes:'Hyperextending lower back',joint:{shoulder:0,elbow:0,knee:1,spine:1,hip:2},cns:1,muscles:{primary:['glutes'],secondary:['hamstrings']},regressions:['Glute Bridge'],progressions:['Hip Thrust'],met:3.5,tempoRec:'1-2-1-0'},
    {n:'Cable Glute Kickback',em:'🔌',grp:'glutes',diff:1,bw:false,eq:['cables'],pri:'Glutes',sec:'Hamstrings',cues:'Kick back and up, squeeze at peak',setup:'Cable at ankle, face cable, hold support',breathing:'Exhale kick',mistakes:'Hyperextending back',joint:{shoulder:0,elbow:0,knee:0,spine:1,hip:2},cns:1,muscles:{primary:['glutes'],secondary:['hamstrings']},regressions:['Donkey Kickback'],progressions:['Hip Thrust'],met:3.5,tempoRec:'2-2-1-0'},
    {n:'Banded Clamshell',em:'🐚',grp:'glutes',diff:1,bw:false,eq:['bands'],pri:'Glutes',sec:'',cues:'Open hip like a clamshell, keep pelvis stable',setup:'Lie on side, band above knees',breathing:'Exhale open',mistakes:'Rolling pelvis back',joint:{shoulder:0,elbow:0,knee:0,spine:0,hip:2},cns:1,muscles:{primary:['glutes'],secondary:[]},regressions:['Clamshell no band'],progressions:['Fire Hydrant'],met:3.0,tempoRec:'2-2-1-0'},
    {n:'Sumo Squat',em:'🤼',grp:'glutes',diff:1,bw:false,eq:['dumbbell'],pri:'Glutes',sec:'Quads, Inner Thighs',cues:'Wide stance, toes out, knees track toes',setup:'Wide stance, hold KB or DB between legs',breathing:'Brace, exhale up',mistakes:'Knee cave',joint:{shoulder:0,elbow:0,knee:2,spine:1,hip:2},cns:1,muscles:{primary:['glutes'],secondary:['quads','adductors']},regressions:['Bodyweight Squat'],progressions:['Barbell Sumo Squat'],met:4.5,tempoRec:'2-1-1-0'},
    {n:'Donkey Kickback',em:'🐴',grp:'glutes',diff:1,bw:true,eq:[],pri:'Glutes',sec:'Hamstrings',cues:'Kick back and up, squeeze at top, core tight',setup:'All fours on floor or bench',breathing:'Exhale kick',mistakes:'Rotating hip or arching back',joint:{shoulder:0,elbow:0,knee:0,spine:1,hip:2},cns:1,muscles:{primary:['glutes'],secondary:['hamstrings']},regressions:['Glute Bridge'],progressions:['Cable Glute Kickback'],met:3.5,tempoRec:'2-2-1-0'},
    {n:'Fire Hydrant',em:'🔥',grp:'glutes',diff:1,bw:true,eq:[],pri:'Glutes',sec:'',cues:'Open hip out, keep pelvis level',setup:'All fours, neutral spine',breathing:'Exhale raise',mistakes:'Twisting torso',joint:{shoulder:0,elbow:0,knee:0,spine:0,hip:2},cns:1,muscles:{primary:['glutes'],secondary:[]},regressions:['Clamshell'],progressions:['Banded Fire Hydrant'],met:3.0,tempoRec:'2-2-1-0'},
    {n:'Single Leg RDL',em:'🦩',grp:'glutes',diff:2,bw:false,eq:['dumbbell'],pri:'Glutes',sec:'Hamstrings, Core',cues:'Hip hinge, balance, feel hamstring stretch',setup:'Standing, DB in opposite hand to raised leg',breathing:'Inhale hinge, exhale stand',mistakes:'Rotating hip, rounding back',joint:{shoulder:0,elbow:0,knee:1,spine:2,hip:3},cns:1,muscles:{primary:['glutes'],secondary:['hamstrings','core']},regressions:['Romanian Deadlift'],progressions:['Barbell Single Leg RDL'],met:4.5,tempoRec:'2-1-1-0'},
    {n:'Lateral Band Walk',em:'↔️',grp:'glutes',diff:1,bw:false,eq:['bands'],pri:'Glutes',sec:'',cues:'Small steps, keep tension in band throughout',setup:'Band above knees, quarter squat position',breathing:'Steady',mistakes:'Steps too big losing tension',joint:{shoulder:0,elbow:0,knee:1,spine:0,hip:1},cns:1,muscles:{primary:['glutes'],secondary:[]},regressions:['Banded Clamshell'],progressions:['Weighted Lateral Walk'],met:4.0,tempoRec:'controlled'},
    {n:'Seated Hip Abduction',em:'🦋',grp:'glutes',diff:1,bw:false,eq:['machine'],pri:'Glutes',sec:'',cues:'Full range, slow eccentric',setup:'Machine, sit upright, pads on outer thighs',breathing:'Exhale open',mistakes:'Using momentum',joint:{shoulder:0,elbow:0,knee:0,spine:0,hip:2},cns:1,muscles:{primary:['glutes'],secondary:[]},regressions:['Banded Clamshell'],progressions:['Standing Cable Abduction'],met:3.5,tempoRec:'2-2-1-0'},
    {n:'Reverse Hyperextension',em:'🔄',grp:'glutes',diff:1,bw:true,eq:[],pri:'Glutes',sec:'Hamstrings, Lower Back',cues:'Swing legs back and up from hips',setup:'Lie prone on bench, hips at edge',breathing:'Exhale raise',mistakes:'Hyperextending lumbar',joint:{shoulder:0,elbow:0,knee:0,spine:2,hip:2},cns:1,muscles:{primary:['glutes'],secondary:['hamstrings','lower_back']},regressions:['Glute Bridge'],progressions:['Weighted Reverse Hyper'],met:4.0,tempoRec:'2-1-1-0'},

    // FULL BODY / OLYMPIC (8)
    {n:'Barbell Clean',em:'🏋️',grp:'fullbody',diff:3,bw:false,eq:['barbell'],pri:'Full Body',sec:'Traps, Legs, Core',cues:'Triple extension: ankles, knees, hips. Fast pull under.',setup:'Hip-width stance, bar over mid-foot',breathing:'Brace, explosive pull',mistakes:'Early arm pull, slow under the bar',joint:{shoulder:2,elbow:1,knee:3,spine:2,hip:3},cns:3,muscles:{primary:['full_body'],secondary:['traps','quads','core']},regressions:['DB Power Clean'],progressions:['Clean and Jerk'],met:9.0,tempoRec:'explosive'},
    {n:'Power Clean',em:'⚡',grp:'fullbody',diff:3,bw:false,eq:['barbell'],pri:'Full Body',sec:'Traps, Quads, Hamstrings',cues:'Aggressive hip extension, shrug, pull elbows high',setup:'Athletic position, bar off floor',breathing:'Exhale explosive',mistakes:'Arms pulling too early',joint:{shoulder:2,elbow:1,knee:3,spine:2,hip:3},cns:3,muscles:{primary:['full_body'],secondary:['traps','quads','hamstrings']},regressions:['Hang Clean'],progressions:['Full Clean'],met:9.0,tempoRec:'explosive'},
    {n:'KB Swing',em:'🔔',grp:'fullbody',diff:2,bw:false,eq:['kettlebell'],pri:'Glutes',sec:'Hamstrings, Core, Shoulders',cues:'Hip hinge not squat, explosive hip drive, soft knees',setup:'Shoulder-width stance, hinge and swing KB between legs',breathing:'Exhale swing up',mistakes:'Squatting the swing, rounding back',joint:{shoulder:1,elbow:0,knee:1,spine:2,hip:3},cns:2,muscles:{primary:['glutes'],secondary:['hamstrings','core','shoulders']},regressions:['Romanian Deadlift'],progressions:['KB Snatch'],met:9.5,tempoRec:'explosive'},
    {n:'Burpees',em:'🏃',grp:'fullbody',diff:2,bw:true,eq:[],pri:'Full Body',sec:'Chest, Core, Legs',cues:'Explosive throughout, modify as needed',setup:'Standing, drop to push-up, back up, jump',breathing:'Steady controlled',mistakes:'No jump at top, weak push-up',joint:{shoulder:2,elbow:1,knee:2,spine:1,hip:2},cns:2,muscles:{primary:['full_body'],secondary:['chest','core','quads']},regressions:['Step-Back Burpee'],progressions:['Weighted Burpee'],met:10.0,tempoRec:'explosive'},
    {n:'Turkish Get-Up',em:'🌅',grp:'fullbody',diff:3,bw:false,eq:['kettlebell'],pri:'Core',sec:'Shoulders, Glutes',cues:'Keep KB vertical above wrist throughout',setup:'Lie on back, KB in one hand directly overhead',breathing:'Controlled throughout',mistakes:'Losing vertical arm, rushing',joint:{shoulder:3,elbow:1,knee:2,spine:2,hip:2},cns:2,muscles:{primary:['core'],secondary:['shoulders','glutes']},regressions:['Get-Up no KB'],progressions:['Heavy KB TGU'],met:5.0,tempoRec:'slow_controlled'},
    {n:'Thruster',em:'🚀',grp:'fullbody',diff:3,bw:false,eq:['barbell'],pri:'Full Body',sec:'Legs, Shoulders, Core',cues:'Squat to parallel then drive bar overhead in one motion',setup:'Bar at front rack position',breathing:'Exhale drive',mistakes:'Two separate movements instead of one fluid',joint:{shoulder:2,elbow:1,knee:3,spine:2,hip:3},cns:3,muscles:{primary:['full_body'],secondary:['quads','front_delts','core']},regressions:['Goblet Squat + Press'],progressions:['Heavy Thruster'],met:9.0,tempoRec:'explosive'},
    {n:'Clean and Press',em:'🏗️',grp:'fullbody',diff:3,bw:false,eq:['barbell'],pri:'Full Body',sec:'Traps, Shoulders, Legs',cues:'Clean to rack position, then strict press',setup:'Floor position for clean',breathing:'Exhale clean, exhale press',mistakes:'Dipping with legs on press',joint:{shoulder:2,elbow:1,knee:3,spine:2,hip:3},cns:3,muscles:{primary:['full_body'],secondary:['traps','front_delts','quads']},regressions:['DB Clean and Press'],progressions:['Clean and Jerk'],met:8.0,tempoRec:'1-0-X-0'},
    {n:'Farmer\'s Walk',em:'🌾',grp:'fullbody',diff:1,bw:false,eq:['dumbbell'],pri:'Core',sec:'Traps, Forearms, Legs',cues:'Upright posture, small quick steps',setup:'Heavy DBs or KBs at sides',breathing:'Steady',mistakes:'Leaning to one side',joint:{shoulder:1,elbow:0,knee:1,spine:2,hip:1},cns:1,muscles:{primary:['core'],secondary:['traps','forearms','quads']},regressions:['Suitcase Carry'],progressions:['Trap Bar Carry'],met:6.0,tempoRec:'slow_controlled'},

    // WARMUP & REHAB DRILLS (14)
    {n:'Hip Circles',em:'🔄',grp:'warmup_drills',diff:1,bw:true,eq:[],pri:'Hips',sec:'',cues:'Full range of motion, slow and controlled',setup:'Hands on hips, make large circles',breathing:'Natural',mistakes:'None',joint:{shoulder:0,elbow:0,knee:0,spine:0,hip:1},cns:1,muscles:{primary:['hips'],secondary:[]},regressions:[],progressions:[],met:2.0,tempoRec:'controlled',warmup:true},
    {n:'Leg Swings',em:'🦵',grp:'warmup_drills',diff:1,bw:true,eq:[],pri:'Hip Flexors',sec:'Hamstrings',cues:'Forward-back and side-to-side, increasing range',setup:'Hold wall for balance',breathing:'Natural',mistakes:'Excessive speed',joint:{shoulder:0,elbow:0,knee:1,spine:0,hip:2},cns:1,muscles:{primary:['hip_flexors'],secondary:['hamstrings']},regressions:[],progressions:[],met:2.5,tempoRec:'controlled',warmup:true},
    {n:'Arm Circles',em:'🔵',grp:'warmup_drills',diff:1,bw:true,eq:[],pri:'Shoulders',sec:'',cues:'Both directions, gradually increase range',setup:'Arms extended, make circles',breathing:'Natural',mistakes:'None',joint:{shoulder:1,elbow:0,knee:0,spine:0,hip:0},cns:1,muscles:{primary:['shoulders'],secondary:[]},regressions:[],progressions:[],met:2.0,tempoRec:'controlled',warmup:true},
    {n:'Cat-Cow',em:'🐱',grp:'warmup_drills',diff:1,bw:true,eq:[],pri:'Spine',sec:'Core',cues:'Slow controlled transitions, full range',setup:'All fours, neutral spine',breathing:'Inhale arch, exhale round',mistakes:'Rushing through',joint:{shoulder:0,elbow:0,knee:0,spine:1,hip:0},cns:1,muscles:{primary:['spine'],secondary:['core']},regressions:[],progressions:[],met:2.0,tempoRec:'controlled',warmup:true},
    {n:'Ankle Rolls',em:'🦶',grp:'warmup_drills',diff:1,bw:true,eq:[],pri:'Ankles',sec:'',cues:'Full circles both directions',setup:'Seated or standing on one leg',breathing:'Natural',mistakes:'None',joint:{shoulder:0,elbow:0,knee:0,spine:0,hip:0},cns:1,muscles:{primary:['calves'],secondary:[]},regressions:[],progressions:[],met:1.5,tempoRec:'controlled',warmup:true},
    {n:'Jumping Jacks',em:'⭐',grp:'warmup_drills',diff:1,bw:true,eq:[],pri:'Full Body',sec:'',cues:'Land softly, controlled rhythm',setup:'Standing',breathing:'Steady',mistakes:'None',joint:{shoulder:1,elbow:0,knee:1,spine:0,hip:1},cns:1,muscles:{primary:['full_body'],secondary:[]},regressions:[],progressions:[],met:7.0,tempoRec:'controlled',warmup:true},
    {n:'Inchworm',em:'🐛',grp:'warmup_drills',diff:1,bw:true,eq:[],pri:'Hamstrings',sec:'Core, Shoulders',cues:'Walk hands out to plank, walk feet to hands',setup:'Standing, hinge forward',breathing:'Natural',mistakes:'Bending knees too much',joint:{shoulder:1,elbow:0,knee:0,spine:1,hip:1},cns:1,muscles:{primary:['hamstrings'],secondary:['core','shoulders']},regressions:[],progressions:[],met:3.5,tempoRec:'controlled',warmup:true},
    {n:'World\'s Greatest Stretch',em:'🌍',grp:'warmup_drills',diff:1,bw:true,eq:[],pri:'Full Body',sec:'',cues:'Lunge, rotate, reach overhead',setup:'Start in lunge position',breathing:'Natural',mistakes:'Rushing',joint:{shoulder:1,elbow:0,knee:2,spine:1,hip:2},cns:1,muscles:{primary:['hip_flexors'],secondary:['thoracic_spine','shoulders']},regressions:[],progressions:[],met:3.0,tempoRec:'controlled',warmup:true},
    {n:'Shoulder Rolls',em:'🔄',grp:'warmup_drills',diff:1,bw:true,eq:[],pri:'Shoulders',sec:'Traps',cues:'Both directions, full range',setup:'Standing or seated',breathing:'Natural',mistakes:'None',joint:{shoulder:1,elbow:0,knee:0,spine:0,hip:0},cns:1,muscles:{primary:['shoulders'],secondary:['traps']},regressions:[],progressions:[],met:1.5,tempoRec:'controlled',warmup:true},
    {n:'Hip Flexor Stretch',em:'🧎',grp:'warmup_drills',diff:1,bw:true,eq:[],pri:'Hip Flexors',sec:'',cues:'Posterior pelvic tilt, push hips forward',setup:'Low lunge position',breathing:'Deep',mistakes:'Not tilting pelvis',joint:{shoulder:0,elbow:0,knee:1,spine:0,hip:2},cns:1,muscles:{primary:['hip_flexors'],secondary:[]},regressions:[],progressions:[],met:2.0,tempoRec:'hold',warmup:true},
    {n:'Thoracic Rotation',em:'🔀',grp:'warmup_drills',diff:1,bw:true,eq:[],pri:'Thoracic Spine',sec:'',cues:'Rotation comes from mid-back, not lumbar',setup:'Seated or in lunge, hands behind head',breathing:'Exhale rotate',mistakes:'Rotating lumbar instead',joint:{shoulder:0,elbow:0,knee:0,spine:1,hip:0},cns:1,muscles:{primary:['thoracic_spine'],secondary:[]},regressions:[],progressions:[],met:2.0,tempoRec:'controlled',warmup:true},
    {n:'Dead Hang',em:'🙌',grp:'warmup_drills',diff:1,bw:true,eq:['bar'],pri:'Lats',sec:'Shoulders',cues:'Relaxed hang, decompress spine',setup:'Hang from pull-up bar',breathing:'Deep and relaxed',mistakes:'Tense shoulders',joint:{shoulder:1,elbow:0,knee:0,spine:0,hip:0},cns:1,muscles:{primary:['lats'],secondary:['shoulders']},regressions:[],progressions:[],met:2.5,tempoRec:'hold',warmup:true},
    {n:'Glute Bridge BW',em:'🌉',grp:'warmup_drills',diff:1,bw:true,eq:[],pri:'Glutes',sec:'',cues:'Activate glutes, not just lifting hips',setup:'Lie on back, knees bent',breathing:'Exhale thrust',mistakes:'Hyperextending lumbar',joint:{shoulder:0,elbow:0,knee:1,spine:1,hip:2},cns:1,muscles:{primary:['glutes'],secondary:[]},regressions:[],progressions:[],met:3.0,tempoRec:'1-2-1-0',warmup:true},
    {n:'Bodyweight Squat',em:'⬇️',grp:'warmup_drills',diff:1,bw:true,eq:[],pri:'Quads',sec:'Glutes',cues:'Full depth, arms out for balance',setup:'Shoulder-width stance',breathing:'Exhale up',mistakes:'Knee cave, heels rising',joint:{shoulder:0,elbow:0,knee:2,spine:1,hip:2},cns:1,muscles:{primary:['quads'],secondary:['glutes']},regressions:[],progressions:[],met:4.0,tempoRec:'2-1-1-0',warmup:true},

    // CHEST ADDITIONAL
    {n:'Svend Press',em:'🤲',grp:'chest',diff:1,bw:false,eq:['machine'],pri:'Inner Chest',sec:'Front Delts',cues:'Press plates together throughout entire movement, squeeze hard',setup:'Hold two plates sandwiched, press forward at chest height',breathing:'Exhale press',mistakes:'Losing plate compression mid-rep',joint:{shoulder:2,elbow:1,knee:0,spine:0,hip:0},cns:1,muscles:{primary:['chest'],secondary:['front_delts']},regressions:['Cable Fly'],progressions:['Weighted Dip'],met:3.5,tempoRec:'2-1-2-0'},
    {n:'Dumbbell Pullover',em:'🏊',grp:'chest',diff:1,bw:false,eq:['dumbbell'],pri:'Chest',sec:'Lats, Triceps',cues:'Keep slight elbow bend, stretch fully at top, feel chest and lat',setup:'Lie perpendicular on bench, shoulders on pad, hips dropped',breathing:'Inhale at stretch, exhale pull',mistakes:'Bending elbows too much, turning into tricep extension',joint:{shoulder:3,elbow:1,knee:0,spine:0,hip:0},cns:1,muscles:{primary:['chest'],secondary:['lats','triceps']},regressions:['Cable Pullover'],progressions:['Straight-Arm Pulldown'],met:4.0,tempoRec:'3-1-1-0'},
    {n:'Guillotine Press',em:'⚔️',grp:'chest',diff:3,bw:false,eq:['barbell'],pri:'Upper Chest',sec:'Front Delts',cues:'Wide grip, lower to neck/upper chest, requires shoulder mobility',setup:'Wide grip, bar path to upper chest/neck — requires spotter',breathing:'Inhale down, exhale press',mistakes:'Narrow grip, unstable shoulder position — HIGH INJURY RISK',joint:{shoulder:3,elbow:1,knee:0,spine:1,hip:0},cns:2,muscles:{primary:['upper_chest'],secondary:['front_delts']},regressions:['Incline Barbell Bench Press'],progressions:[],met:5.0,tempoRec:'2-1-1-0',assistanceRequired:true},
    {n:'Incline Cable Fly',em:'📐',grp:'chest',diff:1,bw:false,eq:['cables'],pri:'Upper Chest',sec:'Front Delts',cues:'Cables set low, press up and together, constant tension arc motion',setup:'Bench at 30-45° between cable towers, cables at floor level',breathing:'Exhale on fly',mistakes:'Too much elbow bend converting to press',joint:{shoulder:2,elbow:0,knee:0,spine:1,hip:0},cns:1,muscles:{primary:['upper_chest'],secondary:['front_delts']},regressions:['Incline DB Fly'],progressions:['Incline Barbell Bench Press'],met:4.0,tempoRec:'2-2-1-0'},
    {n:'Push-Up to Renegade Row',em:'🔁',grp:'chest',diff:3,bw:false,eq:['dumbbell'],pri:'Chest',sec:'Lats, Core',cues:'Plank position on DBs, push-up then row each arm alternately',setup:'Hex DBs shoulder-width, plank position',breathing:'Exhale push, exhale row',mistakes:'Rotating hips during row, losing plank',joint:{shoulder:3,elbow:1,knee:0,spine:2,hip:0},cns:2,muscles:{primary:['chest'],secondary:['lats','core']},regressions:['Push-Ups','DB Row'],progressions:[],met:6.5,tempoRec:'1-0-1-0'},

    // BACK ADDITIONAL
    {n:'Meadows Row',em:'🌾',grp:'back',diff:2,bw:false,eq:['barbell'],pri:'Lats',sec:'Rear Delts, Biceps',cues:'Single arm, barbell in landmine or corner, elbow flares out',setup:'Barbell in corner, staggered stance, row to hip',breathing:'Exhale pull',mistakes:'Using lower back, not getting full ROM',joint:{shoulder:2,elbow:1,knee:1,spine:2,hip:2},cns:2,muscles:{primary:['lats'],secondary:['rear_delts','biceps']},regressions:['Dumbbell Row'],progressions:['Barbell Row'],met:5.0,tempoRec:'1-1-2-0'},
    {n:'Chest-Supported Row',em:'🛋️',grp:'back',diff:1,bw:false,eq:['dumbbell'],pri:'Lats',sec:'Rhomboids, Rear Delts',cues:'Chest supported eliminates lower back, pure lat pull',setup:'Incline bench 30-45°, lie prone, DBs hanging',breathing:'Exhale pull',mistakes:'Shrugging instead of retracting',joint:{shoulder:2,elbow:1,knee:0,spine:0,hip:0},cns:1,muscles:{primary:['lats'],secondary:['rhomboids','rear_delts']},regressions:['Dumbbell Row'],progressions:['Barbell Row'],met:4.5,tempoRec:'2-1-2-0'},
    {n:'Single-Arm Lat Pulldown',em:'↘️',grp:'back',diff:1,bw:false,eq:['cables'],pri:'Lats',sec:'Biceps',cues:'Full stretch at top, drive elbow to hip, lean away slightly',setup:'High cable, D-ring, single arm, slight lean away from cable',breathing:'Exhale pull',mistakes:'Cutting range short, shoulder elevation',joint:{shoulder:2,elbow:1,knee:0,spine:1,hip:0},cns:1,muscles:{primary:['lats'],secondary:['biceps']},regressions:['Lat Pulldown'],progressions:['Pull-Ups'],met:4.0,tempoRec:'2-1-2-0'},
    {n:'Cable Pull-Apart',em:'↔️',grp:'back',diff:1,bw:false,eq:['cables'],pri:'Rear Delts',sec:'Rhomboids',cues:'Both cables at chest height, pull apart to T position',setup:'Stand between two cables set at chest height',breathing:'Exhale pull',mistakes:'Bending elbows, leaning forward',joint:{shoulder:1,elbow:0,knee:0,spine:0,hip:0},cns:1,muscles:{primary:['rear_delts'],secondary:['rhomboids']},regressions:['Band Pull-Aparts'],progressions:['Face Pulls'],met:3.5,tempoRec:'1-2-2-0'},
    {n:'Inverted Row',em:'🔄',grp:'back',diff:1,bw:true,eq:['bar'],pri:'Lats',sec:'Biceps, Rear Delts',cues:'Body plank, pull chest to bar, squeeze shoulder blades',setup:'Bar set waist height in rack, hang below it face up',breathing:'Exhale pull',mistakes:'Hips sagging, partial range',joint:{shoulder:2,elbow:1,knee:0,spine:1,hip:0},cns:1,muscles:{primary:['lats'],secondary:['biceps','rear_delts']},regressions:['Assisted Pull-Ups'],progressions:['Pull-Ups'],met:4.5,tempoRec:'2-1-1-0'},
    {n:'Rack Pull',em:'🏗️',grp:'back',diff:2,bw:false,eq:['barbell'],pri:'Traps',sec:'Lower Back, Glutes',cues:'Bar starts at knee height, focus on lockout, trap squeeze',setup:'Bar set in rack pins at knee level',breathing:'Big brace, exhale at top',mistakes:'Rounding upper back, no hip hinge',joint:{shoulder:1,elbow:1,knee:1,spine:2,hip:2},cns:2,muscles:{primary:['traps'],secondary:['lower_back','glutes']},regressions:['Deadlift'],progressions:['Deficit Deadlift'],met:6.0,tempoRec:'1-0-2-0'},

    // LEGS ADDITIONAL
    {n:'Sissy Squat',em:'🦵',grp:'legs',diff:3,bw:true,eq:[],pri:'Quads',sec:'',cues:'Lean back as knees go forward, hold support, full knee flexion',setup:'Hold support, lean back as you lower knees toward floor',breathing:'Exhale rise',mistakes:'Not leaning back, partial range',joint:{shoulder:0,elbow:0,knee:3,spine:1,hip:0},cns:2,muscles:{primary:['quads'],secondary:[]},regressions:['Leg Extension'],progressions:['Weighted Sissy Squat'],met:4.0,tempoRec:'3-1-1-0'},
    {n:'Copenhagen Plank',em:'🗺️',grp:'legs',diff:2,bw:true,eq:[],pri:'Adductors',sec:'Core',cues:'Side plank with top foot on bench, lift bottom leg',setup:'Side plank position, top foot on bench edge',breathing:'Steady',mistakes:'Hip dropping, not lifting bottom leg',joint:{shoulder:1,elbow:0,knee:0,spine:1,hip:2},cns:2,muscles:{primary:['adductors'],secondary:['core']},regressions:['Side Plank'],progressions:['Weighted Copenhagen'],met:4.0,tempoRec:'hold'},
    {n:'Leg Press — Wide Stance',em:'↔️',grp:'legs',diff:1,bw:false,eq:['machine'],pri:'Glutes',sec:'Adductors, Quads',cues:'Feet high and wide on platform, emphasizes glutes and adductors',setup:'Feet wider than shoulder-width, higher on platform',breathing:'Exhale press',mistakes:'Letting lower back round off pad at bottom',joint:{shoulder:0,elbow:0,knee:2,spine:1,hip:2},cns:1,muscles:{primary:['glutes'],secondary:['adductors','quads']},regressions:['Hip Thrust'],progressions:['Back Squat'],met:4.5,tempoRec:'2-1-1-0'},
    {n:'Smith Machine Squat',em:'🔩',grp:'legs',diff:1,bw:false,eq:['smith'],pri:'Quads',sec:'Glutes',cues:'Place feet slightly forward, use machine for stability',setup:'Smith machine, bar on traps, feet slightly forward of body',breathing:'Brace, exhale up',mistakes:'Feet too far forward causing knee stress',joint:{shoulder:1,elbow:0,knee:2,spine:1,hip:2},cns:1,muscles:{primary:['quads'],secondary:['glutes']},regressions:['Goblet Squat'],progressions:['Back Squat'],met:5.0,tempoRec:'2-1-1-0'},
    {n:'Jefferson Curl',em:'🌀',grp:'legs',diff:2,bw:false,eq:['dumbbell'],pri:'Hamstrings',sec:'Lower Back, Calves',cues:'Stand on platform, slowly curl spine down vertebra by vertebra',setup:'Stand elevated, DB in hands, slowly round down',breathing:'Exhale down, inhale up',mistakes:'Going too heavy, rushing the curl',joint:{shoulder:0,elbow:0,knee:1,spine:3,hip:3},cns:2,muscles:{primary:['hamstrings'],secondary:['lower_back','calves']},regressions:['Romanian Deadlift'],progressions:[],met:4.0,tempoRec:'4-2-4-0'},
    {n:'Pendulum Squat',em:'⏱️',grp:'legs',diff:1,bw:false,eq:['machine'],pri:'Quads',sec:'Glutes',cues:'Machine guides arc path, very quad dominant, go full depth',setup:'Stand in pendulum squat machine, pads on shoulders',breathing:'Exhale press',mistakes:'Partial depth',joint:{shoulder:0,elbow:0,knee:2,spine:0,hip:2},cns:1,muscles:{primary:['quads'],secondary:['glutes']},regressions:['Leg Press'],progressions:['Back Squat'],met:5.0,tempoRec:'2-1-1-0'},

    // SHOULDERS ADDITIONAL
    {n:'Pike Push-Up',em:'⛰️',grp:'shoulders',diff:2,bw:true,eq:[],pri:'Front Delts',sec:'Triceps',cues:'Hips high in inverted V, lower head toward floor',setup:'Push-up position, walk feet in, hips high',breathing:'Exhale press',mistakes:'Hips dropping to standard push-up',joint:{shoulder:2,elbow:1,knee:0,spine:1,hip:0},cns:1,muscles:{primary:['front_delts'],secondary:['triceps']},regressions:['Decline Push-Up'],progressions:['Handstand Push-Up'],met:4.5,tempoRec:'2-0-1-0'},
    {n:'Lateral Raise — Cable from Behind',em:'🔌',grp:'shoulders',diff:1,bw:false,eq:['cables'],pri:'Side Delts',sec:'',cues:'Cable behind back, cross-body lateral raise, better tension curve',setup:'Low cable behind body, reach across for D-ring',breathing:'Exhale raise',mistakes:'Torso rotation',joint:{shoulder:2,elbow:0,knee:0,spine:0,hip:0},cns:1,muscles:{primary:['side_delts'],secondary:[]},regressions:['DB Lateral Raise'],progressions:['Machine Lateral Raise'],met:3.5,tempoRec:'2-1-2-0'},
    {n:'Z Press',em:'🧘',grp:'shoulders',diff:3,bw:false,eq:['barbell'],pri:'Front Delts',sec:'Core, Triceps',cues:'Seated on floor, legs straight out, strict overhead press',setup:'Sit on floor legs extended, barbell at shoulder height',breathing:'Exhale press',mistakes:'Leaning back, core not braced',joint:{shoulder:2,elbow:1,knee:0,spine:2,hip:0},cns:2,muscles:{primary:['front_delts'],secondary:['core','triceps']},regressions:['Seated DB Press'],progressions:['Overhead Press'],met:5.0,tempoRec:'2-0-1-0'},
    {n:'Cuban Press',em:'🇨🇺',grp:'shoulders',diff:2,bw:false,eq:['dumbbell'],pri:'Rear Delts',sec:'Front Delts, Side Delts',cues:'Upright row to chin, external rotate, press overhead in one motion',setup:'DBs in front, upright row to chin, rotate, press',breathing:'Exhale through full movement',mistakes:'Using too heavy — this is a mobility/health exercise',joint:{shoulder:2,elbow:1,knee:0,spine:0,hip:0},cns:1,muscles:{primary:['rear_delts'],secondary:['front_delts','side_delts']},regressions:['Face Pulls'],progressions:['Barbell OHP'],met:4.0,tempoRec:'1-1-1-0'},

    // BICEPS ADDITIONAL
    {n:'Bayesian Curl',em:'📐',grp:'biceps',diff:1,bw:false,eq:['cables'],pri:'Biceps',sec:'',cues:'Cable behind you, constant stretch on bicep, lean forward slightly',setup:'Low cable behind body, curl forward',breathing:'Exhale curl',mistakes:'Not maintaining cable tension at bottom',joint:{shoulder:1,elbow:1,knee:0,spine:0,hip:0},cns:1,muscles:{primary:['biceps'],secondary:[]},regressions:['Cable Curl'],progressions:['Incline Dumbbell Curl'],met:3.5,tempoRec:'3-1-1-0'},
    {n:'21s Curl',em:'🔢',grp:'biceps',diff:1,bw:false,eq:['barbell'],pri:'Biceps',sec:'',cues:'7 lower half reps, 7 upper half reps, 7 full reps — burns!',setup:'Standard curl position with barbell or DBs',breathing:'Steady throughout',mistakes:'Going too heavy, compromising form in upper reps',joint:{shoulder:0,elbow:2,knee:0,spine:1,hip:0},cns:1,muscles:{primary:['biceps'],secondary:[]},regressions:['DB Curl'],progressions:['Barbell Curl'],met:4.5,tempoRec:'1-0-1-0'},
    {n:'Zottman Curl',em:'🔄',grp:'biceps',diff:1,bw:false,eq:['dumbbell'],pri:'Biceps',sec:'Brachialis, Brachioradialis',cues:'Curl up supinated, rotate to pronated at top, lower pronated',setup:'Standard curl start position',breathing:'Exhale curl up',mistakes:'Rushing the rotation',joint:{shoulder:0,elbow:1,knee:0,spine:0,hip:0},cns:1,muscles:{primary:['biceps'],secondary:['brachialis','brachioradialis']},regressions:['Hammer Curl'],progressions:['Barbell Curl'],met:4.0,tempoRec:'2-1-2-0'},

    // TRICEPS ADDITIONAL
    {n:'Board Press',em:'📋',grp:'triceps',diff:2,bw:false,eq:['barbell'],pri:'Triceps',sec:'Chest',cues:'Board on chest reduces ROM, loads lockout — powerlifting accessory',setup:'1-3 boards on chest, spotter holds, press to lockout',breathing:'Exhale press',mistakes:'Bouncing off board',joint:{shoulder:2,elbow:2,knee:0,spine:1,hip:0},cns:2,muscles:{primary:['triceps'],secondary:['chest']},regressions:['Close-Grip Bench Press'],progressions:['Barbell Bench Press'],met:5.0,tempoRec:'1-1-1-0',assistanceRequired:true},
    {n:'Tate Press',em:'🦋',grp:'triceps',diff:2,bw:false,eq:['dumbbell'],pri:'Triceps',sec:'',cues:'DBs point toward ceiling, lower to chest by hinging at elbow',setup:'Lie flat, DBs pointing up, elbows flare wide as you lower',breathing:'Exhale extend',mistakes:'Elbow position collapsing',joint:{shoulder:1,elbow:2,knee:0,spine:0,hip:0},cns:1,muscles:{primary:['triceps'],secondary:[]},regressions:['Skull Crushers'],progressions:['Close-Grip Bench Press'],met:4.0,tempoRec:'2-1-1-0'},
    {n:'Band Tricep Pushdown',em:'🎗️',grp:'triceps',diff:1,bw:false,eq:['bands'],pri:'Triceps',sec:'',cues:'Band overhead, full extension, great pump and activation',setup:'Band attached high, face away or toward anchor',breathing:'Exhale extend',mistakes:'Partial extension',joint:{shoulder:0,elbow:2,knee:0,spine:0,hip:0},cns:1,muscles:{primary:['triceps'],secondary:[]},regressions:[],progressions:['Cable Overhead Extension'],met:3.0,tempoRec:'2-1-1-0'},

    // CORE ADDITIONAL
    {n:'Dragon Flag',em:'🐉',grp:'core',diff:3,bw:true,eq:[],pri:'Core',sec:'Lats, Glutes',cues:'Hold bench above head, raise body in plank, lower slowly',setup:'Lie on bench, grip behind head, full body raise',breathing:'Inhale lower, exhale raise',mistakes:'Pike at hips, not maintaining plank',joint:{shoulder:2,elbow:0,knee:0,spine:2,hip:2},cns:3,muscles:{primary:['core'],secondary:['lats','glutes']},regressions:['Hollow Hold'],progressions:[],met:6.0,tempoRec:'3-1-3-0'},
    {n:'L-Sit Hold',em:'🪑',grp:'core',diff:3,bw:true,eq:[],pri:'Core',sec:'Quads, Hip Flexors',cues:'On parallettes or dip bars, lift legs to parallel, hold',setup:'Parallel bars or handles, arms locked, lift legs',breathing:'Steady',mistakes:'Bent knees taking pressure off core',joint:{shoulder:2,elbow:1,knee:0,spine:1,hip:2},cns:2,muscles:{primary:['core'],secondary:['quads','hip_flexors']},regressions:['Hanging Knee Raise'],progressions:['V-Sit Hold'],met:5.0,tempoRec:'hold'},
    {n:'Cable Woodchop',em:'🪓',grp:'core',diff:1,bw:false,eq:['cables'],pri:'Obliques',sec:'Core, Shoulders',cues:'Rotate from hips and torso, arms stay relatively straight',setup:'High cable, rope or handle, pull diagonally across body',breathing:'Exhale chop',mistakes:'Pulling with arms only, not rotating',joint:{shoulder:2,elbow:0,knee:0,spine:1,hip:1},cns:1,muscles:{primary:['obliques'],secondary:['core','shoulders']},regressions:['Russian Twist'],progressions:[],met:4.0,tempoRec:'1-1-1-0'},
    {n:'Stir The Pot',em:'🥘',grp:'core',diff:2,bw:true,eq:[],pri:'Core',sec:'Shoulders',cues:'Plank on stability ball, make circles with forearms',setup:'Forearms on stability ball, body plank position',breathing:'Steady',mistakes:'Hips swaying, circles too large',joint:{shoulder:2,elbow:0,knee:0,spine:1,hip:0},cns:1,muscles:{primary:['core'],secondary:['shoulders']},regressions:['Plank'],progressions:['Ab Wheel Rollout'],met:4.0,tempoRec:'controlled'},

    // CARDIO MACHINES
    {n:'Treadmill Run',em:'🏃',grp:'cardio',diff:1,bw:true,eq:['treadmill'],pri:'Cardiovascular',sec:'Quads, Calves',cues:'Land midfoot, slight forward lean, arms relaxed',setup:'Speed 8-12 km/h, incline 0-1%',breathing:'Rhythmic, in through nose out through mouth',mistakes:'Heel striking, looking down',joint:{shoulder:0,elbow:0,knee:2,spine:1,hip:2},cns:1,muscles:{primary:['quads'],secondary:['calves','hamstrings']},regressions:['Brisk Walk'],progressions:['Interval Sprints'],met:9.0,tempoRec:'steady'},
    {n:'Treadmill Incline Walk',em:'⛰️',grp:'cardio',diff:1,bw:true,eq:['treadmill'],pri:'Cardiovascular',sec:'Glutes, Calves',cues:'Do not hold handrails, lean slightly forward',setup:'Speed 5-6 km/h, incline 10-15%',breathing:'Steady deep breaths',mistakes:'Holding rails reduces calorie burn significantly',joint:{shoulder:0,elbow:0,knee:1,spine:1,hip:2},cns:1,muscles:{primary:['glutes'],secondary:['calves','hamstrings']},regressions:['Flat Walk'],progressions:['Treadmill Run'],met:6.0,tempoRec:'steady'},
    {n:'Rowing Machine',em:'🚣',grp:'cardio',diff:2,bw:true,eq:['rower'],pri:'Cardiovascular',sec:'Back, Legs, Arms',cues:'Legs push first, then lean back, then arms pull — legs drive 60%',setup:'Damper 4-6, target 2:00/500m pace',breathing:'Exhale drive, inhale recovery',mistakes:'Pulling with arms first, hunching back',joint:{shoulder:2,elbow:1,knee:2,spine:1,hip:2},cns:2,muscles:{primary:['back'],secondary:['quads','biceps','core']},regressions:['Seated Cable Row'],progressions:[],met:8.0,tempoRec:'1-1-1-1'},
    {n:'Stationary Bike',em:'🚴',grp:'cardio',diff:1,bw:true,eq:['bike'],pri:'Cardiovascular',sec:'Quads, Calves',cues:'Seat at hip height, pedal with ball of foot, 80-100 RPM',setup:'Seat height: slight knee bend at bottom, resistance 8-12',breathing:'Steady controlled',mistakes:'Seat too low, too much upper body involvement',joint:{shoulder:0,elbow:0,knee:1,spine:0,hip:1},cns:1,muscles:{primary:['quads'],secondary:['calves','glutes']},regressions:[],progressions:['Sprint Intervals'],met:7.0,tempoRec:'steady'},
    {n:'Ski Erg',em:'⛷️',grp:'cardio',diff:2,bw:true,eq:['ski_erg'],pri:'Cardiovascular',sec:'Lats, Core, Shoulders',cues:'Pull ropes down explosively, hinge hips, core tight',setup:'Stand facing machine, grip both handles overhead',breathing:'Exhale pull',mistakes:'Pulling with arms only, no hip hinge',joint:{shoulder:2,elbow:1,knee:1,spine:1,hip:2},cns:2,muscles:{primary:['lats'],secondary:['core','shoulders','glutes']},regressions:['Lat Pulldown'],progressions:[],met:8.5,tempoRec:'explosive'},
    {n:'Stair Climber',em:'🪜',grp:'cardio',diff:1,bw:true,eq:['stairclimber'],pri:'Cardiovascular',sec:'Glutes, Quads',cues:'Do not lean on rails, full step, drive through heel',setup:'Speed 60-80 steps/min',breathing:'Steady',mistakes:'Leaning on handrails, short steps',joint:{shoulder:0,elbow:0,knee:2,spine:1,hip:2},cns:1,muscles:{primary:['glutes'],secondary:['quads','calves']},regressions:['Step-Ups'],progressions:[],met:8.0,tempoRec:'steady'},
    {n:'Assault Bike',em:'💥',grp:'cardio',diff:2,bw:true,eq:['assault_bike'],pri:'Cardiovascular',sec:'Full Body',cues:'Push AND pull handles, drive legs, keep upright posture',setup:'Seat at hip height, arms and legs work together',breathing:'Controlled despite intensity',mistakes:'Arms only or legs only, not coordinating',joint:{shoulder:1,elbow:1,knee:2,spine:0,hip:2},cns:2,muscles:{primary:['full_body'],secondary:[]},regressions:['Stationary Bike'],progressions:[],met:11.0,tempoRec:'explosive'},
    {n:'Elliptical',em:'🔄',grp:'cardio',diff:1,bw:true,eq:['elliptical'],pri:'Cardiovascular',sec:'Quads, Glutes',cues:'Zero-impact, push and pull handles, maintain upright posture',setup:'Resistance 8-12, 60-80 RPM',breathing:'Steady',mistakes:'Hunching, relying on momentum',joint:{shoulder:0,elbow:0,knee:0,spine:0,hip:1},cns:1,muscles:{primary:['quads'],secondary:['glutes','calves']},regressions:[],progressions:['Stair Climber'],met:6.5,tempoRec:'steady'},

    // SPORTS / SWIMMING
    {n:'Swimming — Freestyle',em:'🏊',grp:'sports',diff:2,bw:true,eq:[],pri:'Cardiovascular',sec:'Back, Shoulders, Core',cues:'Bilateral breathing, hip rotation, long strokes',setup:'Pool, bilateral breathing every 3 strokes',breathing:'Every 3 strokes bilateral',mistakes:'No hip rotation, crossing midline with hands',joint:{shoulder:2,elbow:0,knee:0,spine:1,hip:1},cns:1,muscles:{primary:['lats'],secondary:['shoulders','core','triceps']},regressions:[],progressions:['Open Water Swim'],met:8.0,tempoRec:'steady'},
    {n:'Swimming — Breaststroke',em:'🐸',grp:'sports',diff:2,bw:true,eq:[],pri:'Cardiovascular',sec:'Inner Chest, Legs',cues:'Pullout, glide phase, frog kick — timing is everything',setup:'Pool, streamline off wall',breathing:'Breathe every stroke',mistakes:'No glide phase, excessive drag',joint:{shoulder:2,elbow:0,knee:2,spine:1,hip:2},cns:1,muscles:{primary:['chest'],secondary:['adductors','core']},regressions:[],progressions:['Competitive Breaststroke'],met:7.0,tempoRec:'steady'},
    {n:'Padel',em:'🎾',grp:'sports',diff:2,bw:true,eq:[],pri:'Cardiovascular',sec:'Shoulders, Core, Legs',cues:'Short backswing, wrist snap, use walls strategically',setup:'Padel court, partner/opponent',breathing:'Natural game pace',mistakes:'Tennis swing (too big), ignoring walls',joint:{shoulder:2,elbow:1,knee:2,spine:1,hip:2},cns:1,muscles:{primary:['full_body'],secondary:[]},regressions:[],progressions:[],met:7.5,tempoRec:'reactive'},
    {n:'Basketball',em:'🏀',grp:'sports',diff:2,bw:true,eq:[],pri:'Cardiovascular',sec:'Full Body',cues:'Stay low on defence, bent knees, explosive cuts',setup:'Court, ball',breathing:'Natural',mistakes:'Standing straight up defensively',joint:{shoulder:1,elbow:0,knee:3,spine:1,hip:2},cns:1,muscles:{primary:['full_body'],secondary:[]},regressions:[],progressions:[],met:8.5,tempoRec:'reactive'},
    {n:'Football / Soccer',em:'⚽',grp:'sports',diff:2,bw:true,eq:[],pri:'Cardiovascular',sec:'Full Body',cues:'First touch, positioning, explosive bursts',setup:'Pitch, ball',breathing:'Natural',mistakes:'Ball watching, not moving off ball',joint:{shoulder:0,elbow:0,knee:2,spine:1,hip:2},cns:1,muscles:{primary:['full_body'],secondary:[]},regressions:[],progressions:[],met:9.0,tempoRec:'reactive'},

    // OLYMPIC LIFTING
    {n:'Snatch',em:'🏅',grp:'fullbody',diff:3,bw:false,eq:['barbell'],pri:'Full Body',sec:'Traps, Legs, Shoulders',cues:'Wide grip, bar path close, explosive pull, receive in overhead squat',setup:'Wide grip, bar over mid-foot, hips above knees',breathing:'Brace, explosive exhale',mistakes:'Bar drifting forward, slow elbows',joint:{shoulder:3,elbow:1,knee:3,spine:2,hip:3},cns:3,muscles:{primary:['full_body'],secondary:['traps','shoulders','quads']},regressions:['Power Snatch','DB Power Snatch'],progressions:[],met:10.0,tempoRec:'explosive',assistanceRequired:true},
    {n:'Clean and Jerk',em:'🥇',grp:'fullbody',diff:3,bw:false,eq:['barbell'],pri:'Full Body',sec:'Everything',cues:'Clean to rack, split jerk or push jerk, full lockout overhead',setup:'Hip-width stance, aggressive pull',breathing:'Brace clean, exhale jerk',mistakes:'Soft lockout, poor rack position',joint:{shoulder:3,elbow:1,knee:3,spine:2,hip:3},cns:3,muscles:{primary:['full_body'],secondary:[]},regressions:['Power Clean','Push Press'],progressions:[],met:10.0,tempoRec:'explosive',assistanceRequired:true},
    {n:'Hang Power Clean',em:'⚡',grp:'fullbody',diff:2,bw:false,eq:['barbell'],pri:'Full Body',sec:'Traps, Quads',cues:'Start from hang at mid-thigh, explosive hip extension, high pull',setup:'Hip-width stance, bar at mid-thigh',breathing:'Exhale explosive',mistakes:'Pulling with arms too early',joint:{shoulder:2,elbow:1,knee:2,spine:2,hip:3},cns:2,muscles:{primary:['full_body'],secondary:['traps','quads']},regressions:['KB Swing'],progressions:['Power Clean'],met:9.0,tempoRec:'explosive'},

    // GLUTES ADDITIONAL
    {n:'Smith Machine Hip Thrust',em:'🔩',grp:'glutes',diff:1,bw:false,eq:['smith'],pri:'Glutes',sec:'Hamstrings',cues:'Smith bar for stability, full hip extension, squeeze at top',setup:'Upper back on bench, smith bar across hips with pad',breathing:'Exhale thrust',mistakes:'Hyperextending lumbar, not squeezing peak',joint:{shoulder:0,elbow:0,knee:1,spine:2,hip:2},cns:1,muscles:{primary:['glutes'],secondary:['hamstrings']},regressions:['Hip Thrust BW'],progressions:['Hip Thrust'],met:4.5,tempoRec:'1-2-1-0'},
    {n:'Frog Pump',em:'🐸',grp:'glutes',diff:1,bw:true,eq:[],pri:'Glutes',sec:'',cues:'Soles of feet together, pump hips up rapidly, high reps',setup:'Lie on back, soles of feet together, butterfly position',breathing:'Rapid rhythmic',mistakes:'Not getting full hip extension',joint:{shoulder:0,elbow:0,knee:0,spine:0,hip:2},cns:1,muscles:{primary:['glutes'],secondary:[]},regressions:['Glute Bridge'],progressions:['Hip Thrust BW'],met:3.0,tempoRec:'1-1-1-0'},
    {n:'Curtsy Lunge',em:'👸',grp:'glutes',diff:1,bw:false,eq:['dumbbell'],pri:'Glutes',sec:'Adductors, Quads',cues:'Step back and across, lower knee behind lead foot',setup:'Standing, step diagonally behind and across body',breathing:'Exhale return to start',mistakes:'Torso leaning too far forward',joint:{shoulder:0,elbow:0,knee:2,spine:1,hip:2},cns:1,muscles:{primary:['glutes'],secondary:['adductors','quads']},regressions:['Reverse Lunge'],progressions:['Bulgarian Split Squat'],met:4.5,tempoRec:'2-1-1-0'},

    // FOREARMS/GRIP
    {n:'Wrist Curl',em:'✊',grp:'forearms',diff:1,bw:false,eq:['barbell'],pri:'Forearms',sec:'',cues:'Full range, seated with wrists over knees, squeeze at top',setup:'Seated, forearms on thighs, wrists hanging over knees',breathing:'Exhale curl',mistakes:'Too heavy, wrist deviation',joint:{shoulder:0,elbow:0,knee:0,spine:0,hip:0},cns:1,muscles:{primary:['forearms'],secondary:[]},regressions:['DB Wrist Curl'],progressions:[],met:2.5,tempoRec:'2-2-1-0'},
    {n:'Reverse Wrist Curl',em:'🤜',grp:'forearms',diff:1,bw:false,eq:['barbell'],pri:'Forearms',sec:'',cues:'Overhand grip, full extension and contraction',setup:'Same as wrist curl but overhand grip',breathing:'Exhale extend',mistakes:'Wrist deviation, too heavy',joint:{shoulder:0,elbow:0,knee:0,spine:0,hip:0},cns:1,muscles:{primary:['forearms'],secondary:[]},regressions:['DB Reverse Curl'],progressions:[],met:2.5,tempoRec:'2-2-1-0'},
    {n:'Plate Pinch',em:'🤌',grp:'forearms',diff:1,bw:false,eq:['machine'],pri:'Forearms',sec:'',cues:'Pinch two plates smooth side out, hold as long as possible',setup:'Two plates (10kg each), smooth sides out, finger pinch',breathing:'Steady',mistakes:'Using palm instead of fingertips',joint:{shoulder:0,elbow:0,knee:0,spine:0,hip:0},cns:1,muscles:{primary:['forearms'],secondary:[]},regressions:[],progressions:['Thicker plates'],met:2.0,tempoRec:'hold'},
    {n:'Dead Hang — Active',em:'🙌',grp:'forearms',diff:1,bw:true,eq:['bar'],pri:'Forearms',sec:'Lats, Shoulders',cues:'Grip bar, depress scapulae (pull shoulders down), hang',setup:'Pull-up bar, full hang, activate scapulae',breathing:'Deep relaxed',mistakes:'Passive hang without scapular depression',joint:{shoulder:2,elbow:0,knee:0,spine:0,hip:0},cns:1,muscles:{primary:['forearms'],secondary:['lats','shoulders']},regressions:['Dead Hang'],progressions:['Pull-Ups'],met:2.5,tempoRec:'hold'},

    // NECK
    {n:'Neck Flexion',em:'🦒',grp:'neck',diff:1,bw:true,eq:[],pri:'Neck',sec:'',cues:'Slow controlled movement, no jerking, small range',setup:'Seated, chin tucks and forward flexion',breathing:'Natural',mistakes:'Fast jerky movement',joint:{shoulder:0,elbow:0,knee:0,spine:1,hip:0},cns:1,muscles:{primary:['neck'],secondary:[]},regressions:[],progressions:['Plate Neck Flexion'],met:2.0,tempoRec:'2-2-2-0'},
    {n:'Neck Extension',em:'🦒',grp:'neck',diff:1,bw:true,eq:[],pri:'Neck',sec:'Traps',cues:'Controlled extension, do not hyperextend, protect cervical spine',setup:'Seated or using neck harness',breathing:'Natural',mistakes:'Hyperextension, fast movement',joint:{shoulder:0,elbow:0,knee:0,spine:2,hip:0},cns:1,muscles:{primary:['neck'],secondary:['traps']},regressions:[],progressions:['Plate Neck Extension'],met:2.0,tempoRec:'2-2-2-0'}
  ],
  byName(name) { return this.db.find(e => e.n === name) || null; },
  byGroup(grp) { return this.db.filter(e => e.grp === grp); },
  search(q) { const s = q.toLowerCase(); return this.db.filter(e => e.n.toLowerCase().includes(s) || (e.pri||'').toLowerCase().includes(s)); }
};
window.ExDB = ExDB;

/* ── Cardio Protocols ── */
const CARDIO_PROTOCOLS = {
  hiit: {
    name: 'HIIT',
    full: 'High-Intensity Interval Training',
    emoji: '⚡',
    color: '#ff453a',
    tagline: 'Maximum burn in minimum time',
    duration: '20–30 min total',
    difficulty: 3,
    goal: ['fat_loss','athletic','recomp'],
    science: 'HIIT triggers EPOC (Excess Post-exercise Oxygen Consumption), elevating metabolism 6–24h post-session. Preserves muscle mass better than LISS when combined with resistance training.',
    protocols: [
      {
        name: 'Classic 20/10 Tabata',
        rounds: 8,
        work: 20,
        rest: 10,
        sets: 4,
        totalTime: '16 min',
        exercises: ['Jump Squats','Push-Ups','Burpees','Mountain Climbers'],
        intensity: '90–100% max HR',
        equipment: 'None — bodyweight',
        notes: 'Developed by Dr. Izumi Tabata. 8 rounds × 20s on / 10s off per exercise. 2 min rest between exercises.'
      },
      {
        name: '30/30 Intervals',
        rounds: 10,
        work: 30,
        rest: 30,
        sets: 1,
        totalTime: '20 min',
        exercises: ['Sprint or Assault Bike','Active rest (walk)'],
        intensity: '85–95% max HR',
        equipment: 'Treadmill, Assault Bike, or open space',
        notes: 'Sprint hard for 30s, active recovery for 30s. 10 rounds. Warm up 5 min, cool down 5 min.'
      },
      {
        name: '1:2 Work-Rest Pyramid',
        rounds: 6,
        work: 40,
        rest: 80,
        sets: 1,
        totalTime: '25 min',
        exercises: ['Rowing Machine','Rest'],
        intensity: '80–90% max HR',
        equipment: 'Rower or Bike',
        notes: 'Pyramid: 20s/40s → 30s/60s → 40s/80s → 40s/80s → 30s/60s → 20s/40s. Great for beginners.'
      }
    ],
    warmup: ['5 min easy jog or bike','Dynamic leg swings × 15','Arm circles × 10','High knees × 20'],
    cooldown: ['5 min walk','Quad stretch 30s each','Hip flexor stretch 30s each','Deep breathing 2 min'],
    warnings: ['Not suitable on consecutive days','Skip if readiness < 50','Stop if chest pain occurs','Beginners: start with 4 rounds, not 8']
  },

  liss: {
    name: 'LISS',
    full: 'Low-Intensity Steady-State',
    emoji: '🚶',
    color: '#30d158',
    tagline: 'Fat burning without muscle loss',
    duration: '30–60 min',
    difficulty: 1,
    goal: ['fat_loss','maintenance','recomp'],
    science: 'LISS primarily burns fat as fuel (65–75% fat oxidation at low intensity). Minimal cortisol response means muscle mass is preserved. Ideal on rest days or after weight training.',
    protocols: [
      {
        name: 'Incline Treadmill Walk',
        work: 45,
        totalTime: '45 min',
        exercises: ['Treadmill walk — 5–6 km/h, 10–15% incline'],
        intensity: '60–70% max HR',
        equipment: 'Treadmill',
        notes: 'The "Norwegian Method." Do NOT hold handrails — forces the glutes to work. Burns ~400–500 kcal/session.'
      },
      {
        name: 'Outdoor Fasted Walk',
        work: 45,
        totalTime: '45 min',
        exercises: ['Brisk outdoor walk — 5–6 km/h','Optional: weighted vest 5–10kg'],
        intensity: '55–65% max HR',
        equipment: 'None / weighted vest optional',
        notes: 'Best done fasted in the morning. Natural light also regulates cortisol. Low-impact, joint-friendly.'
      },
      {
        name: 'Steady Bike Ride',
        work: 40,
        totalTime: '40 min',
        exercises: ['Stationary bike — resistance 8–12','Maintain 70–80 RPM'],
        intensity: '60–70% max HR',
        equipment: 'Stationary Bike or Outdoor Bike',
        notes: 'Zero joint impact. Excellent active recovery. Pair with a podcast or audiobook.'
      }
    ],
    warmup: ['2 min easy pace to start','Gradual incline increase over 3 min'],
    cooldown: ['2 min easy pace','Calf stretch 30s each','Hip flexor stretch 30s each'],
    warnings: ['More than 60 min may increase cortisol','Pair with protein intake post-session','Can be done 5–6 days/week']
  },

  miss: {
    name: 'MISS',
    full: 'Moderate-Intensity Steady-State',
    emoji: '🏃',
    color: '#ff9f0a',
    tagline: 'The middle ground — aerobic base building',
    duration: '20–40 min',
    difficulty: 2,
    goal: ['athletic','maintenance','hypertrophy'],
    science: 'MISS targets aerobic capacity and VO2 max. Operates at 70–80% max HR — above fat-burning zone but sustainable. Builds cardiovascular base that improves lifting performance.',
    protocols: [
      {
        name: 'Tempo Run',
        work: 25,
        totalTime: '25 min',
        exercises: ['Run at 75–80% max HR','Conversational pace — you can speak in sentences'],
        intensity: '70–80% max HR',
        equipment: 'Treadmill or outdoor',
        notes: 'Controlled discomfort. If you cannot speak in sentences, slow down. 5 min warm-up jog, 20 min tempo, 5 min cool-down.'
      },
      {
        name: 'Rowing Machine MISS',
        work: 30,
        totalTime: '30 min',
        exercises: ['Row at 2:10–2:20 /500m pace','Damper setting 4–6'],
        intensity: '70–80% max HR',
        equipment: 'Rowing Machine',
        notes: 'Full body cardio. Maintain 22–24 strokes per minute. Check damper — too high increases injury risk.'
      },
      {
        name: 'Stair Climber MISS',
        work: 25,
        totalTime: '25 min',
        exercises: ['Stair climber — 60–70 steps/min','Arms free, no rail holding'],
        intensity: '70–80% max HR',
        equipment: 'Stair Climber',
        notes: 'Exceptional glute and cardiovascular stimulus. Step fully — no toe-stepping. Burns ~350 kcal/25 min.'
      }
    ],
    warmup: ['5 min easy jog or walk','Gradual pace increase to working pace'],
    cooldown: ['5 min easy pace','Full body stretch 5 min'],
    warnings: ['Best 3–4 days/week','Allow 1 day between MISS sessions']
  },

  sit: {
    name: 'SIT',
    full: 'Sprint Interval Training',
    emoji: '🔥',
    color: '#ff453a',
    tagline: 'All-out sprints. Maximum adaptation.',
    duration: '15–20 min total (short but brutal)',
    difficulty: 3,
    goal: ['athletic','fat_loss'],
    science: 'SIT uses 4–6 all-out supramaximal sprints (>100% VO2 max). Superior to HIIT for improving insulin sensitivity, VO2 max, and mitochondrial density. Sessions are short but extremely taxing on CNS.',
    protocols: [
      {
        name: '6×30s Wingate Protocol',
        rounds: 6,
        work: 30,
        rest: 270,
        totalTime: '30 min incl warm-up',
        exercises: ['All-out sprint — 30s','Complete rest — 4.5 min'],
        intensity: '100% max effort',
        equipment: 'Assault Bike, Rowing Machine, or Sprint track',
        notes: 'The original Wingate sprint test protocol. 6 rounds of absolute maximum effort. Between rounds: catch your breath, do not move around.'
      },
      {
        name: '4×20s Hill Sprints',
        rounds: 4,
        work: 20,
        rest: 180,
        totalTime: '20 min incl warm-up',
        exercises: ['Hill sprint — 20s absolute max','Walk down — 3 min recovery'],
        intensity: '100% max effort',
        equipment: 'Outdoor hill or treadmill at 8–10% incline',
        notes: 'Hill reduces impact force vs flat sprints. Drive knees high, lean into hill. Excellent for glute and hamstring development alongside cardio.'
      }
    ],
    warmup: ['10 min progressive warm-up (crucial)','3–4 strides at 70–80% before first sprint','Dynamic stretches'],
    cooldown: ['10 min easy walk','Full lower body stretch','Nutrition: protein + carbs within 30 min'],
    warnings: ['Maximum 2×/week','Never on consecutive days','Requires 48h+ recovery','NOT for beginners — build aerobic base first','Stop if any sharp pain']
  },

  fartlek: {
    name: 'Fartlek',
    full: 'Fartlek Training (Speed Play)',
    emoji: '🎲',
    color: 'var(--c1)',
    tagline: 'Unstructured speed play — listen to your body',
    duration: '20–45 min',
    difficulty: 2,
    goal: ['athletic','maintenance','hypertrophy'],
    science: 'Swedish for "speed play." Mixes intensities freely based on feel. Develops both aerobic and anaerobic systems simultaneously. The unstructured nature reduces mental fatigue and increases enjoyment — important for long-term adherence.',
    protocols: [
      {
        name: 'Classic Street Fartlek',
        work: 30,
        totalTime: '30 min',
        exercises: ['Easy jog baseline pace','Sprint to next lamppost/corner','Recovery jog to catch breath','Repeat at will'],
        intensity: 'Variable 60–100% max HR',
        equipment: 'Outdoor space or treadmill',
        notes: 'No structure — that is the point. Sprint when you feel good. Recover when you need. Use landmarks as sprint targets. Total time 30 min.'
      },
      {
        name: 'Music-Driven Fartlek',
        work: 25,
        totalTime: '25 min',
        exercises: ['Run easy during verses','Sprint during chorus','Recover during bridges'],
        intensity: 'Music-driven effort',
        equipment: 'Treadmill or outdoor. Good playlist essential.',
        notes: 'Sprint during every chorus, recover during verse. Makes cardio engaging. High-energy playlist recommended.'
      }
    ],
    warmup: ['5 min easy jog','Light dynamic warm-up'],
    cooldown: ['5 min easy jog','5 min stretching'],
    warnings: ['Great for beginners — intensity is self-regulated','Can replace one HIIT session per week']
  },

  circuit: {
    name: 'Circuit Training',
    full: 'Circuit Training',
    emoji: '🔄',
    color: '#bf5af2',
    tagline: 'Resistance + cardio combined — maximum efficiency',
    duration: '30–45 min',
    difficulty: 2,
    goal: ['fat_loss','recomp','maintenance','athletic'],
    science: 'Circuit training keeps heart rate elevated (65–80% max HR) throughout resistance exercises. Combines metabolic conditioning with strength stimulus. Produces significant EPOC while building functional strength.',
    protocols: [
      {
        name: 'Push-Pull-Legs Circuit',
        work: 40,
        rest: 15,
        rounds: 3,
        totalTime: '35 min',
        exercises: ['Push-Ups × 15','Dumbbell Row × 12 each','Goblet Squat × 15','Mountain Climbers × 20','Dumbbell Shoulder Press × 12','Hip Thrust BW × 20','Plank 30s'],
        intensity: '70–80% max HR',
        equipment: 'Dumbbells + bodyweight',
        notes: 'Move directly between exercises with no rest. 15s rest between rounds. 3 rounds total. Adjust DB weight to allow completion without breaking form.'
      },
      {
        name: 'Barbell Complex',
        work: 45,
        rest: 90,
        rounds: 5,
        totalTime: '30 min',
        exercises: ['Barbell Deadlift × 6','Barbell Row × 6','Barbell Hang Clean × 6','Barbell Front Squat × 6','Barbell Push Press × 6'],
        intensity: 'Moderate load — never set bar down',
        equipment: 'Barbell',
        notes: 'Never set the bar down during a round. Use a weight you can do all 5 movements with (typically 30–40% of your weakest lift). 90s rest between rounds.'
      },
      {
        name: 'AMRAP Circuit',
        work: 1200,
        rest: 0,
        rounds: 1,
        totalTime: '20 min AMRAP',
        exercises: ['10 × Push-Ups','15 × Air Squats','10 × DB Rows each side','20 × Jump Rope (or jumping jacks)','10 × Dips or Tricep Push-Ups'],
        intensity: 'Self-paced, continuous movement',
        equipment: 'Minimal — DB, jump rope optional',
        notes: 'As Many Rounds As Possible in 20 minutes. Log your rounds. Beat your score next session. Log rest only when absolutely needed.'
      }
    ],
    warmup: ['5 min light cardio','Joint circles head to toe','Light warm-up set of each movement'],
    cooldown: ['5 min easy movement','Full body stretch 5 min','Protein shake within 30 min'],
    warnings: ['Not ideal day before heavy leg day','Reduce weights vs normal training','Keep log of rounds/reps for progression']
  }
};
window.CARDIO_PROTOCOLS = CARDIO_PROTOCOLS;

/* ── Active Workout State ── */
let _wkt = null;
let _wktTimer = null;
let _wktElapsed = 0;
let _restTimer = null;
let _restRemaining = 0;
let _restInterval = null;
let _wktNotes = {};
let _supersetMode = false;
let _quickMode = false;

/* ── WORKOUT HOME SCREEN ── */
reg('workout', function() {
  const user = S.g('user') || {};
  const splitDay = SplitEngine.getSplitDay();
  const score = ReadinessEngine.score();
  const cardioRec = CoachEngine.cardioRec(splitDay, score);
  const readiness = ReadinessEngine.label(score);
  const suggestion = CoachEngine.insights()[0];

  const warmupItems = (splitDay.warmup || []).map(w =>
    '<div class="warmup-item"><span class="warmup-item-icon">🔥</span>'+esc(w)+'</div>'
  ).join('');

  const exPreviews = (splitDay.exercises || []).slice(0,5).map(name => {
    const ex = ExDB.byName(name);
    const prev = ProgEngine.prevString(name);
    const diff = ex ? GUIDANCE.diffLabel(ex.diff) : null;
    const needsSpot = GUIDANCE.needsSpotter(name);
    return '<div style="display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid var(--border)">' +
      '<div style="font-size:24px;width:36px;text-align:center">'+(ex?ex.em:'💪')+'</div>' +
      '<div style="flex:1">' +
      '<div style="display:flex;align-items:center;gap:8px">' +
      '<div style="font-size:14px;font-weight:700;color:var(--txt)">'+esc(name)+'</div>' +
      (diff ? '<span style="font-size:10px;font-weight:700;color:'+diff.c+';text-transform:uppercase;letter-spacing:0.06em">'+diff.l+'</span>' : '') +
      (needsSpot ? '<span style="font-size:10px;color:#ff453a;font-weight:700">⚠️ SPOTTER</span>' : '') +
      '</div>' +
      (ex?'<div style="font-size:12px;color:var(--txt3);margin-top:2px">'+esc(ex.pri)+(ex.sec?', '+ex.sec:'')+'</div>':'') +
      (prev?'<div style="font-size:12px;color:var(--c1);margin-top:2px">'+esc(prev)+'</div>':'') +
      '</div>' +
      '<button onclick="showExerciseDetail(\''+esc(name)+'\')" ' +
      'style="width:32px;height:32px;border-radius:50%;background:var(--bg4);border:1px solid var(--border);' +
      'font-size:14px;cursor:pointer;touch-action:manipulation;flex-shrink:0">ℹ️</button>' +
      '</div>';
  }).join('');

  return '<div class="topbar">' +
    '<div><div class="topbar-title">Workout</div><div class="topbar-date">'+esc(new Date().toLocaleDateString('en-GB',{weekday:'long',month:'short',day:'numeric'}))+'</div></div>' +
    '<div class="topbar-right"><button class="topbar-icon" onclick="go(\'workout\',{search:true})">🔍</button></div></div>' +

    '<div style="padding:0 16px 14px">' +
    '<div class="readiness-label '+readiness.cls+'" style="margin-bottom:12px">Readiness: '+score+' — '+readiness.l+'</div>' +
    '</div>' +

    sh('Today\'s Plan') +
    '<div class="card card-solid">' +
    '<div style="font-size:18px;font-weight:800;color:var(--txt);margin-bottom:4px">'+esc(splitDay.n||'Rest Day')+'</div>' +
    '<div style="font-size:13px;color:var(--txt3);margin-bottom:16px">'+esc((splitDay.muscles||[]).join(', '))+'</div>' +
    exPreviews + '</div>' +

    (splitDay.warmup&&splitDay.warmup.length?
      '<div class="warmup-card"><div class="warmup-title">Warm-Up</div>'+warmupItems+'</div>' : '') +

    '<div class="warmup-card">' +
    '<div class="warmup-title">Cardio Recommendation</div>' +
    '<div style="font-size:15px;font-weight:700;color:var(--c1);margin-bottom:4px">'+esc(cardioRec.machine)+'</div>' +
    '<div style="font-size:13px;color:var(--txt2)">'+esc(cardioRec.duration)+' — '+esc(cardioRec.details)+'</div>' +
    '<div style="font-size:12px;color:var(--txt3);margin-top:6px">🕐 Best performed after your lifting session</div>' +
    '</div>' +

    (suggestion?'<div class="ai-msg"><div class="ai-msg-header"><span>⚡</span><span class="ai-msg-label">Coach Insight</span></div><div class="ai-msg-text">'+esc(suggestion.m)+'</div></div>':'') +

    '<div style="padding:16px 16px 0">' +
    '<button class="btn btn-primary" onclick="startWorkout()">Start Workout 💪</button>' +
    '<button class="btn btn-secondary" style="margin-top:10px" onclick="startQuickWorkout()">⚡ Quick Workout (20 min)</button>' +
    '<button class="btn btn-secondary" style="margin-top:10px" onclick="showBrowseExercises()">🔍 Browse All Exercises</button>' +
    '<button class="btn" style="margin-top:10px;background:rgba(255,69,58,0.1);border:1px solid rgba(255,69,58,0.2);color:#ff453a;font-weight:700" onclick="go(\'cardio\')">❤️ Cardio Protocols</button>' +
    '<button class="btn" style="margin-top:10px;background:rgba(var(--c1-rgb),0.1);border:1px solid rgba(var(--c1-rgb),0.2);color:var(--c1)" onclick="showAddCustomExercise()">+ Add Custom Exercise</button>' +
    '</div>' +
    '<div style="height:20px"></div>';
});

/* ── CARDIO HOME SCREEN ── */
reg('cardio', function() {
  const user = S.g('user') || {};
  const goal = user.goal || 'hypertrophy';
  const score = ReadinessEngine.score();

  function isRecommended(p) {
    if (score < 50 && p.difficulty >= 3) return false;
    return p.goal.includes(goal) || p.difficulty === 1;
  }

  const protocols = Object.values(CARDIO_PROTOCOLS);
  const keys = Object.keys(CARDIO_PROTOCOLS);

  const cards = protocols.map(function(p, idx) {
    const key = keys[idx];
    const rec = isRecommended(p);
    const diffLabel = p.difficulty >= 3 ? 'Advanced' : p.difficulty === 2 ? 'Intermediate' : 'Beginner';
    const diffColor = p.difficulty >= 3 ? '#ff453a' : p.difficulty === 2 ? '#ff9f0a' : '#30d158';
    return '<div onclick="showCardioProtocol(\''+key+'\')" ' +
      'style="background:var(--bg3);border:1.5px solid '+(rec?p.color:'var(--border)')+';border-radius:18px;padding:16px;margin-bottom:12px;cursor:pointer;touch-action:manipulation;position:relative">' +
      (rec ? '<div style="position:absolute;top:14px;right:14px;background:rgba(var(--c1-rgb),0.15);border-radius:20px;padding:3px 10px;font-size:10px;font-weight:700;color:var(--c1)">RECOMMENDED</div>' : '') +
      '<div style="display:flex;align-items:center;gap:14px;margin-bottom:10px">' +
      '<div style="font-size:36px;line-height:1">'+p.emoji+'</div>' +
      '<div>' +
      '<div style="font-size:18px;font-weight:800;color:var(--txt)">'+esc(p.name)+'</div>' +
      '<div style="font-size:12px;color:var(--txt3);margin-top:2px">'+esc(p.full)+'</div>' +
      '</div></div>' +
      '<div style="font-size:13px;color:var(--txt2);line-height:1.5;margin-bottom:10px">'+esc(p.tagline)+'</div>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
      '<span style="font-size:11px;font-weight:600;color:'+diffColor+';background:rgba(0,0,0,0.2);padding:3px 10px;border-radius:20px">'+diffLabel+'</span>' +
      '<span style="font-size:11px;color:var(--txt3);background:rgba(0,0,0,0.15);padding:3px 10px;border-radius:20px">⏱ '+esc(p.duration)+'</span>' +
      '<span style="font-size:11px;color:var(--txt3);background:rgba(0,0,0,0.15);padding:3px 10px;border-radius:20px">'+p.protocols.length+' protocols</span>' +
      '</div></div>';
  }).join('');

  return '<div class="topbar">' +
    '<button class="topbar-icon press" onclick="go(\'workout\')" style="margin-right:8px">←</button>' +
    '<div><div class="topbar-title">Cardio</div>' +
    '<div class="topbar-date">Choose your protocol</div></div></div>' +

    '<div style="padding:12px 16px;background:rgba(var(--c1-rgb),0.06);border-bottom:1px solid var(--border)">' +
    '<div style="font-size:13px;color:var(--txt2)">Readiness score: <strong style="color:var(--c1)">'+score+'</strong> · ' +
    'Goal: <strong style="color:var(--c1)">'+esc(goal.replace('_',' '))+'</strong></div>' +
    '</div>' +

    '<div style="padding:14px 16px">' + cards + '</div>' +
    '<div style="height:20px"></div>';
});

/* ── ACTIVE WORKOUT SCREEN ── */
reg('active', function() {
  if (!_wkt) { go('workout'); return ''; }
  const user = S.g('user') || {};
  const goal = user.goal || 'hypertrophy';
  const restSecs = user.restSecs || 120;
  const totalSets = _wkt.exercises.reduce(function(a,ex){return a+(ex.sets||[]).length;},0);
  const doneSets = _wkt.exercises.reduce(function(a,ex){return a+(ex.sets||[]).filter(function(s){return s.done;}).length;},0);
  const progress = totalSets > 0 ? Math.round((doneSets/totalSets)*100) : 0;

  const header =
    '<div class="wkt-header" id="wkt-header">' +
    '<div class="wkt-progress-bar-wrap"><div class="wkt-progress-bar" id="wkt-pb" style="width:'+progress+'%"></div></div>' +
    '<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 16px 8px">' +
    '<div>' +
    '<div style="font-size:11px;color:var(--txt3);font-weight:700;text-transform:uppercase;letter-spacing:0.08em">'+esc(_wkt.name)+'</div>' +
    '<div style="font-size:22px;font-weight:900;color:var(--c1);font-variant-numeric:tabular-nums" id="wkt-timer-display">'+fmtTime(_wktElapsed)+'</div>' +
    '</div>' +
    '<div style="text-align:center">' +
    '<div style="font-size:18px;font-weight:800;color:var(--txt)">'+doneSets+'/'+totalSets+'</div>' +
    '<div style="font-size:10px;color:var(--txt3);text-transform:uppercase;letter-spacing:0.06em">Sets Done</div>' +
    '</div>' +
    '<div style="display:flex;gap:8px">' +
    '<button onclick="toggleSupersetMode()" style="padding:8px 12px;border-radius:20px;font-size:12px;font-weight:600;cursor:pointer;touch-action:manipulation;border:1px solid var(--border);background:'+(_supersetMode?'var(--grad)':'var(--bg3)')+';color:'+(_supersetMode?'#fff':'var(--txt3)')+'">SS</button>' +
    '<button onclick="confirmFinishWorkout()" style="padding:8px 16px;border-radius:20px;background:var(--grad);color:#fff;font-size:13px;font-weight:700;cursor:pointer;touch-action:manipulation;border:none">Finish</button>' +
    '</div></div></div>';

  const cards = _wkt.exercises.map(function(ex, exIdx) {
    const exData = ExDB.byName(ex.name);
    const prev = ProgEngine.prevString(ex.name);
    const suggest = WeightEngine.suggest(ex.name, user);
    const diff = exData ? GUIDANCE.diffLabel(exData.diff) : null;
    const needsSpot = GUIDANCE.needsSpotter(ex.name);
    const allDone = (ex.sets||[]).length > 0 && (ex.sets||[]).every(function(s){return s.done;});
    const rec = GUIDANCE.setsReps(goal);

    const setsHTML = (ex.sets||[]).map(function(set, sIdx) {
      const isDone = set.done;
      const isPR = set._isPR;
      return '<div class="set-row' + (isDone?' done':'') + (isPR?' pr':'') + '" id="set-'+exIdx+'-'+sIdx+'">' +
        '<div class="set-num">'+(sIdx+1)+'</div>' +
        '<div class="set-inputs">' +
        '<div style="display:flex;flex-direction:column;align-items:center">' +
        '<div style="font-size:9px;color:var(--txt3);margin-bottom:3px;text-transform:uppercase;letter-spacing:0.06em">KG</div>' +
        '<input type="number" class="set-inp" placeholder="'+(suggest||0)+'" value="'+(set.weight||'')+'" ' +
        'onchange="_setVal('+exIdx+','+sIdx+',\'weight\',parseFloat(this.value)||0)" ' +
        'inputmode="decimal" style="width:64px">' +
        '</div>' +
        '<div style="font-size:16px;color:var(--txt3);margin:0 4px">×</div>' +
        '<div style="display:flex;flex-direction:column;align-items:center">' +
        '<div style="font-size:9px;color:var(--txt3);margin-bottom:3px;text-transform:uppercase;letter-spacing:0.06em">REPS</div>' +
        '<input type="number" class="set-inp" placeholder="'+rec.reps.split('-')[0]+'" value="'+(set.reps||'')+'" ' +
        'onchange="_setVal('+exIdx+','+sIdx+',\'reps\',parseInt(this.value)||0)" ' +
        'inputmode="numeric" style="width:56px">' +
        '</div>' +
        '</div>' +
        '<button class="set-check'+(isDone?' done':'')+'" onclick="_doneSet('+exIdx+','+sIdx+')">' +
        (isPR ? '🏆' : isDone ? '✓' : '') +
        '</button>' +
        (isPR ? '<div style="position:absolute;top:-8px;right:40px;background:linear-gradient(135deg,#ffd60a,#ff9f0a);color:#000;font-size:9px;font-weight:800;padding:2px 8px;border-radius:10px;letter-spacing:0.06em;animation:prBounce 0.4s var(--spring) both">PR!</div>' : '') +
        '</div>';
    }).join('');

    const noteVal = _wktNotes[ex.name] || '';

    return '<div class="ex-card' + (allDone?' done':'') + '" id="ex-card-'+exIdx+'">' +
      '<div class="ex-card-header">' +
      '<div style="font-size:28px;width:40px;text-align:center;transition:all 0.3s">'+(allDone?'✅':(exData?exData.em:'💪'))+'</div>' +
      '<div style="flex:1;min-width:0">' +
      '<div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">' +
      '<div style="font-size:15px;font-weight:700;color:var(--txt)">'+esc(ex.name)+'</div>' +
      (diff ? '<span style="font-size:9px;font-weight:700;color:'+diff.c+';text-transform:uppercase">'+diff.l+'</span>' : '') +
      (needsSpot ? '<span style="font-size:9px;color:#ff453a;font-weight:700">⚠️SPOT</span>' : '') +
      '</div>' +
      (prev ? '<div style="font-size:12px;color:var(--c1);margin-top:2px">'+esc(prev)+'</div>' : '') +
      (exData ? '<div style="font-size:11px;color:var(--txt3);margin-top:1px">'+esc(exData.cues.slice(0,60))+'...</div>' : '') +
      '</div>' +
      '<button onclick="showExerciseDetail(\''+esc(ex.name)+'\')" style="width:30px;height:30px;border-radius:50%;background:var(--bg4);border:1px solid var(--border);font-size:12px;cursor:pointer;touch-action:manipulation;flex-shrink:0">ℹ️</button>' +
      '</div>' +
      '<div style="display:grid;grid-template-columns:28px 1fr 36px;gap:8px;padding:8px 16px 4px;border-bottom:1px solid var(--border)">' +
      '<div style="font-size:10px;color:var(--txt3);font-weight:700;text-align:center">SET</div>' +
      '<div style="font-size:10px;color:var(--txt3);font-weight:700;text-align:center">WEIGHT × REPS</div>' +
      '<div style="font-size:10px;color:var(--txt3);font-weight:700;text-align:center">✓</div>' +
      '</div>' +
      '<div class="sets-list">'+setsHTML+'</div>' +
      '<div style="padding:10px 16px;display:flex;gap:8px;border-top:1px solid var(--border)">' +
      '<button onclick="_addSet('+exIdx+')" style="flex:1;padding:10px;border-radius:10px;background:var(--bg4);border:1px solid var(--border);color:var(--txt2);font-size:13px;font-weight:600;cursor:pointer;touch-action:manipulation">+ Set</button>' +
      '<button onclick="_toggleNote('+exIdx+')" style="padding:10px 14px;border-radius:10px;background:var(--bg4);border:1px solid var(--border);color:var(--txt2);font-size:13px;cursor:pointer;touch-action:manipulation">📝</button>' +
      '</div>' +
      '<div id="note-'+exIdx+'" style="display:'+(noteVal?'block':'none')+';padding:0 16px 12px">' +
      '<textarea class="field" placeholder="How did this feel? Form notes, energy level..." ' +
      'style="height:72px;resize:none;font-size:13px" ' +
      'oninput="_wktNotes[\''+esc(ex.name)+'\'] = this.value">'+esc(noteVal)+'</textarea>' +
      '</div>' +
      '</div>';
  }).join('');

  const restBar =
    '<div id="rest-sheet" style="position:fixed;bottom:0;left:0;right:0;z-index:400;' +
    'background:var(--bg2);border-radius:24px 24px 0 0;border-top:1px solid var(--border);' +
    'padding:16px 24px calc(20px + var(--safe));transform:translateY(100%);' +
    'transition:transform 0.4s var(--ease);will-change:transform">' +
    '<div style="width:36px;height:4px;background:var(--border2);border-radius:2px;margin:0 auto 16px"></div>' +
    '<div style="text-align:center;margin-bottom:14px">' +
    '<div style="font-size:13px;font-weight:700;color:var(--txt3);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:6px">Rest Timer</div>' +
    '<div style="position:relative;width:100px;height:100px;margin:0 auto">' +
    '<svg width="100" height="100" viewBox="0 0 100 100">' +
    '<circle cx="50" cy="50" r="44" fill="none" stroke="var(--bg4)" stroke-width="8"/>' +
    '<circle id="rest-ring" cx="50" cy="50" r="44" fill="none" stroke="var(--c1)" stroke-width="8" ' +
    'stroke-dasharray="276.5" stroke-dashoffset="0" stroke-linecap="round" transform="rotate(-90 50 50)"/>' +
    '</svg>' +
    '<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center">' +
    '<div style="font-size:28px;font-weight:900;color:var(--txt);font-variant-numeric:tabular-nums" id="rest-countdown">'+fmtTime(restSecs)+'</div>' +
    '<div style="font-size:10px;color:var(--txt3);text-transform:uppercase;letter-spacing:0.06em">seconds</div>' +
    '</div></div></div>' +
    '<div style="display:flex;gap:10px">' +
    '<button onclick="skipRest()" style="flex:1;padding:14px;border-radius:14px;background:var(--bg4);border:1px solid var(--border);color:var(--txt2);font-size:15px;font-weight:600;cursor:pointer;touch-action:manipulation">Skip</button>' +
    '<button onclick="addRestTime(30)" style="flex:1;padding:14px;border-radius:14px;background:rgba(var(--c1-rgb),0.1);border:1px solid rgba(var(--c1-rgb),0.2);color:var(--c1);font-size:15px;font-weight:600;cursor:pointer;touch-action:manipulation">+30s</button>' +
    '</div></div>';

  return header + '<div style="padding:12px 16px 4px">' + cards + '</div>' + restBar + '<div style="height:32px"></div>';
});

/* ── Workout control functions ── */
window._setVal = function(exIdx, sIdx, field, val) {
  if (!_wkt || !_wkt.exercises[exIdx]) return;
  if (!_wkt.exercises[exIdx].sets[sIdx]) return;
  _wkt.exercises[exIdx].sets[sIdx][field] = val;
};

window._doneSet = function(exIdx, sIdx) {
  if (!_wkt) return;
  const ex = _wkt.exercises[exIdx];
  if (!ex || !ex.sets[sIdx]) return;
  const set = ex.sets[sIdx];
  const w = set.weight || 0;
  const r = set.reps || 0;

  set.done = !set.done;

  if (set.done && w > 0 && r > 0) {
    const isPR = ProgEngine.checkPR(ex.name, w, r);
    set._isPR = isPR;
    if (isPR) {
      ProgEngine.savePR(ex.name, w, r, today());
      toast('🏆 New PR on ' + ex.name + '!', 'pr', 5000);
      haptic([50, 50, 100]);
    } else {
      haptic(25);
    }

    const nextSet = ex.sets[sIdx + 1];
    if (nextSet && !nextSet.done && !nextSet.weight) {
      nextSet.weight = w;
      nextSet.reps = r;
    }

    const restSecs = (S.g('user.restSecs') || 120);
    if (restSecs > 0) startRestTimer(restSecs);
  } else {
    set._isPR = false;
    haptic(15);
  }

  _updateSetRow(exIdx, sIdx, set);
  _updateProgress();
  AchEngine.check();
};

function _updateSetRow(exIdx, sIdx, set) {
  const row = document.getElementById('set-'+exIdx+'-'+sIdx);
  if (!row) { go('active'); return; }
  row.className = 'set-row' + (set.done?' done':'') + (set._isPR?' pr':'');
  const btn = row.querySelector('.set-check');
  if (btn) {
    btn.className = 'set-check' + (set.done?' done':'');
    btn.textContent = set._isPR ? '🏆' : set.done ? '✓' : '';
  }
  const exCard = document.getElementById('ex-card-'+exIdx);
  if (exCard && _wkt.exercises[exIdx]) {
    const ex = _wkt.exercises[exIdx];
    const allDone = ex.sets.length > 0 && ex.sets.every(function(s){return s.done;});
    exCard.className = 'ex-card' + (allDone?' done':'');
    const emojiEl = exCard.querySelector('.ex-card-header > div:first-child');
    const exData = ExDB.byName(ex.name);
    if (emojiEl) emojiEl.textContent = allDone ? '✅' : (exData ? exData.em : '💪');
  }
}

function _updateProgress() {
  const totalSets = _wkt.exercises.reduce(function(a,ex){return a+(ex.sets||[]).length;},0);
  const doneSets = _wkt.exercises.reduce(function(a,ex){return a+(ex.sets||[]).filter(function(s){return s.done;}).length;},0);
  const pct = totalSets > 0 ? Math.round((doneSets/totalSets)*100) : 0;
  const pb = document.getElementById('wkt-pb');
  if (pb) pb.style.width = pct + '%';
}

window._addSet = function(exIdx) {
  if (!_wkt || !_wkt.exercises[exIdx]) return;
  const ex = _wkt.exercises[exIdx];
  const lastSet = ex.sets[ex.sets.length - 1] || {};
  ex.sets.push({ weight: lastSet.weight || 0, reps: lastSet.reps || 0, done: false });
  go('active');
};

window._toggleNote = function(exIdx) {
  const el = document.getElementById('note-' + exIdx);
  if (!el) return;
  el.style.display = el.style.display === 'none' ? 'block' : 'none';
  if (el.style.display === 'block') {
    const ta = el.querySelector('textarea');
    if (ta) setTimeout(function(){ta.focus();}, 100);
  }
};

window.toggleSupersetMode = function() {
  _supersetMode = !_supersetMode;
  toast(_supersetMode ? '🔗 Superset mode ON' : 'Superset mode off', 'info');
  const btn = document.querySelector('[onclick="toggleSupersetMode()"]');
  if (btn) {
    btn.style.background = _supersetMode ? 'var(--grad)' : 'var(--bg3)';
    btn.style.color = _supersetMode ? '#fff' : 'var(--txt3)';
  }
};

window.swapExercise = function(exIdx) {
  if (!_wkt || !_wkt.exercises[exIdx]) return;
  const name = _wkt.exercises[exIdx].name;
  const subs = SplitEngine.getSubstitutes(name, '');
  if (!subs.length) { toast('No substitutes available', 'warn'); return; }
  const body = subs.map(function(s, i) {
    return '<button class="btn btn-secondary" style="margin-bottom:10px;text-align:left" onclick="_wkt.exercises['+exIdx+'].name=\''+esc(s)+'\';closeModal();go(\'active\')">'+esc(s)+'</button>';
  }).join('');
  modal('Swap: ' + name, body, '<button class="btn btn-ghost" onclick="closeModal()" style="margin-top:8px">Keep original</button>');
};

window.confirmFinishWorkout = function() {
  const totalSets = _wkt.exercises.reduce(function(a,ex){return a+(ex.sets||[]).filter(function(s){return s.done;}).length;},0);
  const prs = _wkt.exercises.reduce(function(a,ex){
    return a + (ex.sets||[]).filter(function(s){return s._isPR;}).length;
  },0);
  const totalVol = _wkt.exercises.reduce(function(a,ex){
    return a + (ex.sets||[]).filter(function(s){return s.done;}).reduce(function(b,s){return b+((s.weight||0)*(s.reps||0));},0);
  },0);

  modal('Finish Workout?',
    '<div style="text-align:center;padding:8px 0 20px">' +
    '<div style="font-size:48px;margin-bottom:12px">💪</div>' +
    '<div style="font-size:20px;font-weight:800;color:var(--txt);margin-bottom:4px">'+esc(_wkt.name)+'</div>' +
    '<div style="font-size:13px;color:var(--txt3)">'+fmtMins(Math.round(_wktElapsed/60))+' · '+totalSets+' sets</div>' +
    '</div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:14px">' +
    '<div style="background:var(--bg3);border-radius:12px;padding:12px;text-align:center">' +
    '<div style="font-size:20px;font-weight:800;color:var(--c1)">'+totalSets+'</div>' +
    '<div style="font-size:10px;color:var(--txt3);text-transform:uppercase;letter-spacing:0.06em;margin-top:4px">Sets</div></div>' +
    '<div style="background:var(--bg3);border-radius:12px;padding:12px;text-align:center">' +
    '<div style="font-size:20px;font-weight:800;color:var(--txt)">'+(totalVol>1000?round2(totalVol/1000)+'t':totalVol+'kg')+'</div>' +
    '<div style="font-size:10px;color:var(--txt3);text-transform:uppercase;letter-spacing:0.06em;margin-top:4px">Volume</div></div>' +
    '<div style="background:var(--bg3);border-radius:12px;padding:12px;text-align:center">' +
    '<div style="font-size:20px;font-weight:800;color:#ffd60a">'+prs+'</div>' +
    '<div style="font-size:10px;color:var(--txt3);text-transform:uppercase;letter-spacing:0.06em;margin-top:4px">PRs</div></div>' +
    '</div>' +
    '<div class="field-wrap" style="margin-bottom:8px">' +
    '<label class="field-label">Workout Notes</label>' +
    '<textarea id="wkt-final-note" class="field" placeholder="Overall feeling, energy, anything to remember..." style="height:80px;resize:none;font-size:14px"></textarea>' +
    '</div>',
    '<button class="btn btn-primary" onclick="saveWorkout()" style="margin-top:4px">💾 Save Workout</button>' +
    '<button class="btn btn-secondary" onclick="closeModal()" style="margin-top:8px">Keep Training</button>'
  );
};

window.saveWorkout = function() {
  clearInterval(_wktTimer);
  clearInterval(_restInterval);
  const finalNote = (document.getElementById('wkt-final-note')||{}).value || '';
  const totalVol = _wkt.exercises.reduce(function(a,ex){
    return a + (ex.sets||[]).filter(function(s){return s.done;}).reduce(function(b,s){return b+((s.weight||0)*(s.reps||0));},0);
  },0);
  const workout = {
    id: 'wkt_' + Date.now(),
    name: _wkt.name,
    date: today(),
    duration: Math.round(_wktElapsed / 60),
    totalVol: totalVol,
    exercises: _wkt.exercises,
    notes: finalNote,
    exerciseNotes: Object.assign({}, _wktNotes),
    splitDay: S.g('user.splitDay') || 1
  };
  S.push('workouts', workout);
  SplitEngine.nextDay();
  AchEngine.check();
  _wkt = null;
  _wktElapsed = 0;
  _wktNotes = {};
  closeModal();
  const prCount = workout.exercises.reduce(function(a,ex){
    return a + (ex.sets||[]).filter(function(s){return s._isPR;}).length;
  },0);
  toast('Workout saved! 💪' + (prCount>0?' '+prCount+' PRs!':''), 'ok', 4000);
  go('dashboard');
};

function _startWktTimer() {
  clearInterval(_wktTimer);
  _wktElapsed = 0;
  _wktTimer = setInterval(function() {
    _wktElapsed++;
    const el = document.getElementById('wkt-timer-display');
    if (el) el.textContent = fmtTime(_wktElapsed);
  }, 1000);
}

window.startWorkout = function(templateName) {
  const splitDay = SplitEngine.getSplitDay();
  const user = S.g('user') || {};
  const goal = user.goal || 'hypertrophy';
  const rec = GUIDANCE.setsReps(goal);
  const defaultSets = goal === 'strength' ? 5 : 4;

  const exercises = (splitDay.exercises || []).map(function(name) {
    const ex = ExDB.byName(name);
    const sets = [];
    for (var i = 0; i < defaultSets; i++) {
      const suggest = WeightEngine.suggest(name, user);
      sets.push({ weight: suggest || 0, reps: parseInt(rec.reps.split('-')[0]) || 8, done: false });
    }
    return { name: name, sets: sets, muscles: ex ? ex.muscles : { primary:[], secondary:[] } };
  });

  _wkt = { name: splitDay.n || 'Workout', exercises: exercises, startTime: Date.now() };
  _wktNotes = {};
  _supersetMode = false;
  _quickMode = false;
  _startWktTimer();
  go('active');
};

window.startQuickWorkout = function() {
  const splitDay = SplitEngine.getSplitDay();
  const user = S.g('user') || {};
  const goal = user.goal || 'hypertrophy';
  const rec = GUIDANCE.setsReps(goal);
  const exercises = (splitDay.exercises || []).slice(0, 4).map(function(name) {
    const sets = [];
    for (var i = 0; i < 3; i++) {
      const suggest = WeightEngine.suggest(name, user);
      sets.push({ weight: suggest || 0, reps: parseInt(rec.reps.split('-')[0]) || 8, done: false });
    }
    return { name: name, sets: sets, muscles: {} };
  });
  _wkt = { name: '⚡ Quick — ' + (splitDay.n || 'Workout'), exercises: exercises, startTime: Date.now() };
  _wktNotes = {};
  _quickMode = true;
  _startWktTimer();
  go('active');
};

/* ── Rest Timer ── */
window.startRestTimer = function(secs) {
  clearInterval(_restInterval);
  _restRemaining = secs;
  const sheet = document.getElementById('rest-sheet');
  if (sheet) sheet.style.transform = 'translateY(0)';
  const circ = 276.5;

  _restInterval = setInterval(function() {
    _restRemaining--;
    const cd = document.getElementById('rest-countdown');
    if (cd) cd.textContent = fmtTime(Math.max(0,_restRemaining));
    const ring = document.getElementById('rest-ring');
    if (ring) {
      const pct = Math.max(0, _restRemaining / secs);
      ring.style.strokeDashoffset = circ * (1 - pct);
    }
    if (_restRemaining <= 0) {
      clearInterval(_restInterval);
      haptic([100, 50, 100, 50, 200]);
      const sheet2 = document.getElementById('rest-sheet');
      if (sheet2) setTimeout(function(){sheet2.style.transform='translateY(100%)';},1200);
    }
  }, 1000);
};

window.skipRest = function() {
  clearInterval(_restInterval);
  const sheet = document.getElementById('rest-sheet');
  if (sheet) sheet.style.transform = 'translateY(100%)';
};

window.addRestTime = function(secs) {
  _restRemaining += secs;
  const cd = document.getElementById('rest-countdown');
  if (cd) cd.textContent = fmtTime(_restRemaining);
};

window.stopRestTimer = function() {
  clearInterval(_restInterval);
  _restInterval = null;
};

window.toggleExInfo = function(exIdx) {
  const el = document.getElementById('ex-info-'+exIdx);
  if (el) el.style.display = el.style.display === 'none' ? 'block' : 'none';
};

/* ── Exercise Picker ── */
window.showExercisePicker = function(grp) {
  const groups = ['chest','back','legs','shoulders','biceps','triceps','core','glutes','fullbody'];
  const curGrp = grp || 'chest';
  const exercises = ExDB.byGroup(curGrp);
  const tabs = groups.map(g =>
    '<button class="pill'+(g===curGrp?' on':'')+'" onclick="showExercisePicker(\''+g+'\')" style="flex-shrink:0">'+g.charAt(0).toUpperCase()+g.slice(1)+'</button>'
  ).join('');
  const list = exercises.map(ex =>
    '<div style="display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid var(--border)">' +
    '<div style="font-size:24px">'+esc(ex.em||'💪')+'</div>' +
    '<div style="flex:1"><div style="font-size:14px;font-weight:700;color:var(--txt)">'+esc(ex.n)+'</div>' +
    '<div style="font-size:12px;color:var(--txt3)">'+esc(ex.pri)+(ex.sec?', '+ex.sec:'')+'</div></div>' +
    '<button style="font-size:12px;color:var(--c1);background:none;border:none;cursor:pointer;padding:8px;font-weight:700" onclick="addExerciseToWorkout(\''+esc(ex.n)+'\')">+ Add</button>' +
    '</div>'
  ).join('');
  modal('Exercise Library',
    '<div style="display:flex;gap:8px;overflow-x:auto;padding-bottom:12px;margin-bottom:4px">'+tabs+'</div>' + list);
};

window.addExerciseToWorkout = function(name) {
  if (!_wkt) {
    closeModal();
    toast('Start a workout first', 'warn');
    return;
  }
  const user = S.g('user') || {};
  const suggested = WeightEngine.suggest(name, user);
  const sets = Array.from({length:4}, (_, i) => ({ setNum:i+1, weight:suggested||'', reps:'', done:false }));
  _wkt.exercises.push({ name: name, sets: sets, muscles: (ExDB.byName(name) || {}).muscles || {} });
  closeModal();
  go('active');
};

window.svgCheck = function() {
  return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
};

/* ── Exercise Detail Modal ── */
function showExerciseDetail(name) {
  const ex = ExDB.byName(name);
  if (!ex) return;
  const goal = S.g('user.goal') || 'hypertrophy';
  const rec = GUIDANCE.setsReps(goal);
  const diff = GUIDANCE.diffLabel(ex.diff);
  const needsSpotter = GUIDANCE.needsSpotter(name);
  const supersetWith = GUIDANCE.supersets[ex.grp] || [];
  const techs = GUIDANCE.techniques(goal);

  const html =
    '<div style="display:flex;align-items:center;gap:14px;margin-bottom:20px">' +
    '<div style="font-size:48px">'+ex.em+'</div>' +
    '<div>' +
    '<div style="font-size:19px;font-weight:800;color:var(--txt)">'+esc(ex.n)+'</div>' +
    '<div style="font-size:12px;color:'+diff.c+';font-weight:700;text-transform:uppercase;letter-spacing:0.06em;margin-top:4px">'+diff.l+'</div>' +
    '<div style="font-size:12px;color:var(--txt3);margin-top:2px">'+esc(ex.pri)+(ex.sec?' · '+ex.sec:'')+'</div>' +
    '</div></div>' +

    (needsSpotter || ex.assistanceRequired ?
      '<div style="background:rgba(255,69,58,0.1);border:1px solid rgba(255,69,58,0.25);border-radius:12px;padding:12px;margin-bottom:14px;display:flex;gap:10px">' +
      '<span style="font-size:18px">⚠️</span>' +
      '<div style="font-size:13px;color:#ff453a;line-height:1.5">' +
      (needsSpotter ? '<strong>Spotter recommended</strong> for this exercise. Do not attempt heavy sets alone.' :
        '<strong>Assistance required.</strong> Ensure proper coaching before loading.') +
      '</div></div>' : '') +

    '<div style="background:rgba(var(--c1-rgb),0.06);border:1px solid rgba(var(--c1-rgb),0.15);border-radius:14px;padding:14px;margin-bottom:14px">' +
    '<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:var(--c1);margin-bottom:10px">AI Recommendation for '+esc(goal.replace('_',' '))+'</div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">' +
    _recStat2('📦','Sets',rec.sets) +
    _recStat2('🔁','Reps',rec.reps) +
    _recStat2('⏱️','Rest',rec.rest) +
    _recStat2('🎵','Tempo',rec.tempo) +
    '</div>' +
    '<div style="font-size:12px;color:var(--txt2);margin-top:10px;font-style:italic">💡 '+esc(rec.note)+'</div>' +
    '</div>' +

    '<div style="margin-bottom:14px">' +
    '<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:var(--txt3);margin-bottom:6px">Setup</div>' +
    '<div style="font-size:14px;color:var(--txt2);line-height:1.6">'+esc(ex.setup)+'</div>' +
    '</div>' +

    '<div style="margin-bottom:14px">' +
    '<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:var(--txt3);margin-bottom:6px">Coaching Cues</div>' +
    '<div style="font-size:14px;color:var(--txt2);line-height:1.6">'+esc(ex.cues)+'</div>' +
    '</div>' +

    '<div style="margin-bottom:14px">' +
    '<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#ff9f0a;margin-bottom:6px">Common Mistakes</div>' +
    '<div style="font-size:14px;color:var(--txt2);line-height:1.6">⚠️ '+esc(ex.mistakes)+'</div>' +
    '</div>' +

    '<div style="margin-bottom:14px">' +
    '<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:var(--txt3);margin-bottom:6px">Breathing</div>' +
    '<div style="font-size:14px;color:var(--txt2)">'+esc(ex.breathing)+'</div>' +
    '</div>' +

    '<div style="margin-bottom:14px">' +
    '<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:var(--txt3);margin-bottom:6px">Intensity Techniques</div>' +
    techs.slice(0,2).map(function(t) {
      return '<div style="font-size:13px;color:var(--txt2);padding:6px 0;border-bottom:1px solid var(--border)">⚡ '+esc(t)+'</div>';
    }).join('') +
    '</div>' +

    (supersetWith.length ?
      '<div style="margin-bottom:14px">' +
      '<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:var(--txt3);margin-bottom:6px">Superset With</div>' +
      supersetWith.slice(0,2).map(function(s) {
        return '<div style="font-size:13px;color:var(--c1);padding:6px 0;border-bottom:1px solid var(--border)">🔗 '+esc(s)+'</div>';
      }).join('') +
      '</div>' : '') +

    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px">' +
    '<div><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:#30d158;margin-bottom:6px">Progressions</div>' +
    (ex.progressions||[]).map(function(p){return '<div style="font-size:12px;color:var(--txt2);padding:3px 0">↑ '+esc(p)+'</div>';}).join('') +
    '</div>' +
    '<div><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:#ff9f0a;margin-bottom:6px">Regressions</div>' +
    (ex.regressions||[]).map(function(r){return '<div style="font-size:12px;color:var(--txt2);padding:3px 0">↓ '+esc(r)+'</div>';}).join('') +
    '</div></div>' +

    '<div style="margin-bottom:4px">' +
    '<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:var(--txt3);margin-bottom:8px">Joint Stress</div>' +
    '<div style="display:flex;flex-wrap:wrap;gap:6px">' +
    Object.entries(ex.joint||{}).filter(function(e){return e[1]>0;}).map(function(e){
      const j = e[0], v = e[1];
      const c = v >= 3 ? '#ff453a' : v >= 2 ? '#ff9f0a' : '#30d158';
      return '<div style="background:rgba(0,0,0,0.2);border:1px solid '+c+';border-radius:8px;padding:4px 10px;font-size:11px;font-weight:600;color:'+c+'">' +
        j.charAt(0).toUpperCase()+j.slice(1)+' ●'.repeat(v)+'</div>';
    }).join('') +
    '</div></div>';

  modal(ex.n, html,
    '<div style="display:flex;gap:10px;margin-top:16px">' +
    '<button class="btn btn-primary" onclick="closeModal()" style="flex:1">Got it</button>' +
    '</div>'
  );
}
window.showExerciseDetail = showExerciseDetail;

function _recStat2(icon, label, val) {
  return '<div style="background:rgba(255,255,255,0.04);border-radius:10px;padding:10px;text-align:center">' +
    '<div style="font-size:18px">'+icon+'</div>' +
    '<div style="font-size:14px;font-weight:700;color:var(--c1);margin-top:4px">'+esc(val)+'</div>' +
    '<div style="font-size:10px;color:var(--txt3);margin-top:2px;text-transform:uppercase;letter-spacing:0.06em">'+esc(label)+'</div>' +
    '</div>';
}

/* ── Custom Exercise Adding ── */
function showAddCustomExercise() {
  const groups = ['chest','back','legs','shoulders','biceps','triceps','core','glutes','forearms','cardio','fullbody'];
  modal('Add Custom Exercise',
    '<div class="field-wrap"><label class="field-label">Exercise Name *</label>' +
    '<input id="cx-name" class="field" type="text" placeholder="e.g. Smith Machine Row"></div>' +

    '<div class="field-wrap"><label class="field-label">Muscle Group *</label>' +
    '<div class="select-wrap"><select id="cx-grp" class="field">' +
    groups.map(function(g){return '<option value="'+g+'">'+g.charAt(0).toUpperCase()+g.slice(1)+'</option>';}).join('') +
    '</select></div></div>' +

    '<div class="field-wrap"><label class="field-label">Primary Muscle</label>' +
    '<input id="cx-pri" class="field" type="text" placeholder="e.g. Lats"></div>' +

    '<div class="field-wrap"><label class="field-label">Coaching Cues</label>' +
    '<input id="cx-cues" class="field" type="text" placeholder="Key technique points"></div>' +

    '<div class="field-wrap"><label class="field-label">Equipment</label>' +
    '<div class="select-wrap"><select id="cx-eq" class="field">' +
    '<option value="barbell">Barbell</option><option value="dumbbell">Dumbbell</option>' +
    '<option value="cables">Cables</option><option value="machine">Machine</option>' +
    '<option value="bands">Bands</option><option value="">Bodyweight</option>' +
    '</select></div></div>' +

    '<div class="field-wrap"><label class="field-label">Difficulty</label>' +
    '<div style="display:flex;gap:8px">' +
    '<button class="btn btn-secondary btn-sm cx-diff-btn" onclick="setCxDiff(1,this)">Beginner</button>' +
    '<button class="btn btn-secondary btn-sm cx-diff-btn" onclick="setCxDiff(2,this)">Intermediate</button>' +
    '<button class="btn btn-secondary btn-sm cx-diff-btn" onclick="setCxDiff(3,this)">Advanced</button>' +
    '</div></div>',

    '<button class="btn btn-primary" onclick="saveCustomExercise()" style="margin-top:14px">Add Exercise</button>'
  );
  window._cxDiff = 1;
}
window.showAddCustomExercise = showAddCustomExercise;

window.setCxDiff = function(d, btn) {
  window._cxDiff = d;
  document.querySelectorAll('.cx-diff-btn').forEach(function(b){b.style.background='var(--bg4)';b.style.color='var(--txt)';});
  if (btn) { btn.style.background='var(--grad)'; btn.style.color='#fff'; }
};

window.saveCustomExercise = function() {
  const name = (document.getElementById('cx-name')||{}).value||'';
  const grp  = (document.getElementById('cx-grp')||{}).value||'chest';
  const pri  = (document.getElementById('cx-pri')||{}).value||'Custom';
  const cues = (document.getElementById('cx-cues')||{}).value||'Focus on form';
  const eq   = (document.getElementById('cx-eq')||{}).value||'';
  if (!name.trim()) { toast('Enter exercise name','warn'); return; }
  if (ExDB.byName(name.trim())) { toast('Exercise already exists','warn'); return; }
  const custom = {
    n:name.trim(), em:'⭐', grp:grp, diff:window._cxDiff||1,
    bw:!eq, eq:eq?[eq]:[],
    pri:pri||'Custom', sec:'',
    cues:cues, setup:'Set up as needed', breathing:'Exhale exertion',
    mistakes:'Maintain form', joint:{shoulder:0,elbow:0,knee:0,spine:0,hip:0},
    cns:1, muscles:{primary:[grp],secondary:[]},
    regressions:[], progressions:[], met:4.0, tempoRec:'2-0-1-0',
    custom:true
  };
  ExDB.db.push(custom);
  const saved = S.g('customExercises') || [];
  saved.push(custom);
  S.set('customExercises', saved);
  closeModal();
  toast('✅ '+name.trim()+' added!', 'ok');
};

function loadCustomExercises() {
  const saved = S.g('customExercises') || [];
  saved.forEach(function(ex) {
    if (!ExDB.byName(ex.n)) ExDB.db.push(ex);
  });
}
window.loadCustomExercises = loadCustomExercises;

/* ── Browse Exercises Screen ── */
function showBrowseExercises(filterGrp, filterQuery) {
  const grp = filterGrp || '';
  const query = filterQuery || '';
  const groups = ['all','chest','back','legs','shoulders','biceps','triceps','core','glutes','cardio','sports','fullbody','forearms'];

  let exercises = ExDB.db;
  if (grp && grp !== 'all') exercises = exercises.filter(function(e){return e.grp===grp;});
  if (query) exercises = exercises.filter(function(e){
    return e.n.toLowerCase().includes(query.toLowerCase()) || (e.pri||'').toLowerCase().includes(query.toLowerCase());
  });

  const filterTabs = '<div style="display:flex;overflow-x:auto;gap:8px;padding:0 16px 14px;-webkit-overflow-scrolling:touch">' +
    groups.map(function(g) {
      const active = (grp||'all') === g;
      return '<button onclick="showBrowseExercises(\''+g+'\',\''+esc(query)+'\')" style="flex-shrink:0;padding:7px 14px;border-radius:20px;font-size:12px;font-weight:600;cursor:pointer;touch-action:manipulation;white-space:nowrap;' +
        (active ? 'background:var(--grad);color:#fff;border:none' : 'background:var(--bg3);border:1px solid var(--border);color:var(--txt3)') + '">' +
        g.charAt(0).toUpperCase()+g.slice(1)+'</button>';
    }).join('') + '</div>';

  const searchBar = '<div style="padding:0 16px 12px">' +
    '<input class="field" type="text" placeholder="Search exercises..." value="'+esc(query)+'" ' +
    'oninput="showBrowseExercises(\''+esc(grp||'all')+'\',this.value)" ' +
    'style="padding:12px 16px"></div>';

  const exList = exercises.slice(0,80).map(function(ex) {
    const diff = GUIDANCE.diffLabel(ex.diff);
    const needsSpot = GUIDANCE.needsSpotter(ex.n);
    return '<div style="display:flex;align-items:center;gap:12px;padding:12px 16px;border-bottom:1px solid var(--border);cursor:pointer;touch-action:manipulation" onclick="showExerciseDetail(\''+esc(ex.n)+'\')">' +
      '<div style="font-size:24px;width:36px;text-align:center">'+ex.em+'</div>' +
      '<div style="flex:1">' +
      '<div style="display:flex;align-items:center;gap:6px">' +
      '<div style="font-size:14px;font-weight:700;color:var(--txt)">'+esc(ex.n)+'</div>' +
      (ex.custom ? '<span style="font-size:10px;background:rgba(var(--c1-rgb),0.15);color:var(--c1);border-radius:4px;padding:2px 6px;font-weight:700">CUSTOM</span>' : '') +
      '</div>' +
      '<div style="font-size:12px;margin-top:2px">' +
      '<span style="color:'+diff.c+';font-weight:600">'+diff.l+'</span>' +
      '<span style="color:var(--txt3)"> · '+esc(ex.pri)+'</span>' +
      (needsSpot ? '<span style="color:#ff453a;font-weight:700"> · ⚠️ Spotter</span>' : '') +
      '</div></div>' +
      '<div style="color:var(--txt3);font-size:16px">›</div>' +
      '</div>';
  }).join('');

  const v = document.getElementById('view');
  if (!v) return;
  v.scrollTop = 0;
  const div = document.createElement('div');
  div.className = 'screen';
  div.innerHTML =
    '<div class="topbar"><div class="topbar-title">Exercise Library</div>' +
    '<div class="topbar-right"><button class="topbar-icon press" onclick="go(\'workout\')">✕</button></div></div>' +
    filterTabs + searchBar +
    '<div style="font-size:12px;color:var(--txt3);padding:0 16px 8px">'+exercises.length+' exercises</div>' +
    exList +
    '<div style="padding:16px"><button class="btn btn-secondary" onclick="showAddCustomExercise()">+ Add Custom Exercise</button></div>' +
    '<div style="height:20px"></div>';
  v.innerHTML = '';
  v.appendChild(div);

  const nav = document.getElementById('nav');
  if (nav) nav.style.display = 'flex';
}
window.showBrowseExercises = showBrowseExercises;

/* ── Cardio stat tile helper ── */
function _cStat(icon, label, val) {
  return '<div style="background:rgba(0,0,0,0.2);border-radius:10px;padding:8px;text-align:center">' +
    '<div style="font-size:14px">'+icon+'</div>' +
    '<div style="font-size:13px;font-weight:700;color:var(--txt)">'+val+'</div>' +
    '<div style="font-size:10px;color:var(--txt3);margin-top:1px;text-transform:uppercase;letter-spacing:0.06em">'+label+'</div>' +
    '</div>';
}

/* ── Cardio Protocol Detail ── */
window.showCardioProtocol = function(key) {
  const p = CARDIO_PROTOCOLS[key];
  if (!p) return;

  const diffLabel = p.difficulty >= 3 ? 'Advanced' : p.difficulty === 2 ? 'Intermediate' : 'Beginner';
  const diffColor = p.difficulty >= 3 ? '#ff453a' : p.difficulty === 2 ? '#ff9f0a' : '#30d158';

  const protocolCards = p.protocols.map(function(pr, i) {
    return '<div style="background:var(--bg4);border-radius:14px;padding:14px;margin-bottom:12px;border:1px solid var(--border)">' +
      '<div style="font-size:15px;font-weight:800;color:var(--txt);margin-bottom:8px">'+esc(pr.name)+'</div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:10px">' +
      (pr.work && pr.rest ? _cStat('⏱','Intervals',fmtTime(pr.work)+' / '+fmtTime(pr.rest)) : '') +
      (pr.rounds ? _cStat('🔁','Rounds',pr.rounds+'×') : '') +
      _cStat('📍','Total',esc(pr.totalTime)) +
      _cStat('💓','Intensity',esc(pr.intensity)) +
      '</div>' +
      '<div style="margin-bottom:8px">' +
      '<div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:var(--txt3);margin-bottom:4px">Exercises</div>' +
      pr.exercises.map(function(e){return '<div style="font-size:13px;color:var(--txt2);padding:3px 0;border-bottom:1px solid var(--border)">• '+esc(e)+'</div>';}).join('') +
      '</div>' +
      '<div style="margin-bottom:8px">' +
      '<div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:var(--txt3);margin-bottom:4px">Equipment</div>' +
      '<div style="font-size:13px;color:var(--txt2)">'+esc(pr.equipment)+'</div>' +
      '</div>' +
      '<div style="background:rgba(var(--c1-rgb),0.06);border-radius:10px;padding:10px">' +
      '<div style="font-size:12px;color:var(--txt2);line-height:1.6">💡 '+esc(pr.notes)+'</div>' +
      '</div>' +
      '<button onclick="startCardioSession(\''+key+'\','+i+')" style="width:100%;margin-top:12px;padding:12px;border-radius:12px;background:'+p.color+';color:#fff;font-size:14px;font-weight:700;border:none;cursor:pointer;touch-action:manipulation">▶ Start This Protocol</button>' +
      '</div>';
  }).join('');

  const v = document.getElementById('view');
  if (!v) return;
  v.scrollTop = 0;
  const div = document.createElement('div');
  div.className = 'screen';
  div.innerHTML =
    '<div class="topbar">' +
    '<button class="topbar-icon press" onclick="go(\'cardio\')" style="margin-right:8px">←</button>' +
    '<div><div class="topbar-title">'+esc(p.name)+'</div>' +
    '<div class="topbar-date">'+esc(p.full)+'</div></div></div>' +

    '<div style="padding:16px;background:linear-gradient(180deg,rgba(0,0,0,0.3),transparent)">' +
    '<div style="display:flex;align-items:center;gap:14px;margin-bottom:12px">' +
    '<div style="font-size:48px">'+p.emoji+'</div>' +
    '<div>' +
    '<div style="font-size:22px;font-weight:900;color:'+p.color+'">'+esc(p.name)+'</div>' +
    '<div style="font-size:13px;color:var(--txt3)">'+esc(p.tagline)+'</div>' +
    '<div style="display:flex;gap:8px;margin-top:6px">' +
    '<span style="font-size:11px;font-weight:600;color:'+diffColor+';background:rgba(0,0,0,0.3);padding:3px 10px;border-radius:20px">'+diffLabel+'</span>' +
    '<span style="font-size:11px;color:var(--txt3);background:rgba(0,0,0,0.2);padding:3px 10px;border-radius:20px">'+esc(p.duration)+'</span>' +
    '</div></div></div>' +

    '<div style="font-size:13px;color:var(--txt2);line-height:1.65;background:rgba(0,0,0,0.2);border-radius:12px;padding:12px;margin-bottom:14px">' +
    '🔬 '+esc(p.science)+'</div>' +

    sh('Protocols') +
    '<div style="padding:0 16px">'+protocolCards+'</div>' +

    sh('Warm-Up') +
    '<div style="padding:0 16px 12px">' +
    p.warmup.map(function(w){return '<div style="font-size:13px;color:var(--txt2);padding:6px 0;border-bottom:1px solid var(--border)">🔥 '+esc(w)+'</div>';}).join('') +
    '</div>' +

    sh('Cool-Down') +
    '<div style="padding:0 16px 12px">' +
    p.cooldown.map(function(c){return '<div style="font-size:13px;color:var(--txt2);padding:6px 0;border-bottom:1px solid var(--border)">❄️ '+esc(c)+'</div>';}).join('') +
    '</div>' +

    sh('Warnings') +
    '<div style="padding:0 16px 14px">' +
    p.warnings.map(function(w){return '<div style="font-size:13px;color:#ff9f0a;padding:6px 0;border-bottom:1px solid var(--border)">⚠️ '+esc(w)+'</div>';}).join('') +
    '</div>' +

    '</div>' +
    '<div style="height:20px"></div>';

  v.innerHTML = '';
  v.appendChild(div);
  const nav = document.getElementById('nav');
  if (nav) nav.style.display = 'flex';
};

/* ── Cardio Session Starter ── */
window.startCardioSession = function(key, protocolIdx) {
  const p = CARDIO_PROTOCOLS[key];
  if (!p) return;
  const pr = p.protocols[protocolIdx];
  if (!pr) return;

  const session = {
    id: 'cardio_' + Date.now(),
    type: key,
    name: p.name + ' — ' + pr.name,
    date: today(),
    duration: pr.work || 30,
    protocol: pr.name,
    intensity: pr.intensity
  };
  S.push('cardio', session);

  const workSecs = pr.work || 30;
  const restSecs = pr.rest || 60;
  const rounds = pr.rounds || 1;

  modal('🏃 ' + esc(pr.name),
    '<div style="text-align:center;padding:16px 0">' +
    '<div style="font-size:48px;margin-bottom:10px">'+p.emoji+'</div>' +
    '<div style="font-size:14px;color:var(--txt3);margin-bottom:16px">Session logged. Use timer below.</div>' +
    '<div style="background:var(--bg3);border-radius:14px;padding:16px;margin-bottom:12px">' +
    '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px">' +
    _cStat('⏱','Work',fmtTime(workSecs)) +
    _cStat('😮‍💨','Rest',fmtTime(restSecs)) +
    _cStat('🔁','Rounds',rounds+'×') +
    '</div></div>' +
    '<div style="font-size:13px;color:var(--txt2);line-height:1.6;margin-bottom:14px">'+esc(pr.notes)+'</div>' +
    '<div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center">' +
    pr.exercises.map(function(e){return '<span style="font-size:12px;background:rgba(var(--c1-rgb),0.1);color:var(--c1);border-radius:20px;padding:4px 12px;font-weight:600">'+esc(e)+'</span>';}).join('') +
    '</div></div>',
    '<button class="btn btn-primary" onclick="closeModal();go(\'cardio\')">Done ✓</button>' +
    '<button class="btn btn-secondary" onclick="closeModal()" style="margin-top:8px">Keep Viewing</button>'
  );
  toast('💪 '+p.name+' session logged!', 'ok', 4000);
};
