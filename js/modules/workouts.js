/* === EXERCISE DATABASE === */
var DB = {
  chest: [
    {n:'Barbell Bench Press',em:'🏋️',eq:['barbell'],diff:2,pri:'Chest',sec:'Triceps, Delts',cues:'Retract scaps, arch, drive through chest',alts:['Dumbbell Bench Press','Push-Ups','Cable Chest Press'],bw:false},
    {n:'Incline Bench Press',em:'💪',eq:['barbell'],diff:2,pri:'Upper Chest',sec:'Triceps, Delts',cues:'30-45 degree incline, flare elbows',alts:['Incline Dumbbell Press','Incline Push-Ups'],bw:false},
    {n:'Dumbbell Bench Press',em:'💪',eq:['dumbbell'],diff:1,pri:'Chest',sec:'Triceps',cues:'Full ROM, controlled descent',alts:['Barbell Bench Press','Push-Ups'],bw:false},
    {n:'Dumbbell Fly',em:'🦋',eq:['dumbbell'],diff:1,pri:'Chest',sec:'Delts',cues:'Slight elbow bend, big arc motion',alts:['Cable Crossover','Pec Deck'],bw:false},
    {n:'Cable Crossover',em:'⚡',eq:['cables'],diff:1,pri:'Chest',sec:'Delts',cues:'Forward lean, squeeze at crossing point',alts:['Dumbbell Fly','Pec Deck'],bw:false},
    {n:'Push-Ups',em:'🤸',eq:[],diff:1,pri:'Chest',sec:'Triceps, Core',cues:'Straight body, full lockout',alts:['Dumbbell Bench Press','Wall Push-Ups'],bw:true},
    {n:'Chest Dips',em:'🏅',eq:['bar'],diff:2,pri:'Lower Chest',sec:'Triceps',cues:'Lean forward, wide elbows, deep dip',alts:['Decline Press','Diamond Push-Ups'],bw:true},
    {n:'Incline Dumbbell Press',em:'💪',eq:['dumbbell'],diff:1,pri:'Upper Chest',sec:'Delts',cues:'Slight incline, neutral or pronated grip',alts:['Incline Bench Press','Pike Push-Ups'],bw:false},
  ],
  back: [
    {n:'Deadlift',em:'🏋️',eq:['barbell'],diff:3,pri:'Entire Back',sec:'Hamstrings, Glutes',cues:'Bar mid-foot, neutral spine, lat engagement',alts:['Romanian Deadlift','Hex Bar Deadlift'],bw:false},
    {n:'Barbell Row',em:'💪',eq:['barbell'],diff:2,pri:'Mid Back',sec:'Biceps, Rear Delts',cues:'Hinge 45 degrees, pull elbows behind torso',alts:['Dumbbell Row','Seated Cable Row'],bw:false},
    {n:'Pull-Ups',em:'🏅',eq:['bar'],diff:2,pri:'Lats',sec:'Biceps',cues:'Dead hang, drive elbows to pockets',alts:['Lat Pulldown','Assisted Pull-Ups'],bw:true},
    {n:'Lat Pulldown',em:'⬇️',eq:['cables'],diff:1,pri:'Lats',sec:'Biceps',cues:'Slight lean back, pull to upper chest',alts:['Pull-Ups','Straight Arm Pulldown'],bw:false},
    {n:'Seated Cable Row',em:'⚡',eq:['cables'],diff:1,pri:'Mid Back',sec:'Biceps',cues:'Sit tall, drive elbows back, squeeze blades',alts:['Dumbbell Row','Barbell Row'],bw:false},
    {n:'T-Bar Row',em:'💪',eq:['barbell'],diff:2,pri:'Mid Back',sec:'Lats',cues:'Chest pad, neutral grip, elbows flared',alts:['Barbell Row','Dumbbell Row'],bw:false},
    {n:'Dumbbell Row',em:'🏋️',eq:['dumbbell'],diff:1,pri:'Lats',sec:'Biceps',cues:'Support hand on bench, row to hip',alts:['Barbell Row','Cable Row'],bw:false},
    {n:'Face Pull',em:'⚡',eq:['cables'],diff:1,pri:'Rear Delts',sec:'Traps',cues:'High cable, pull to forehead, externally rotate',alts:['Rear Delt Fly','Band Pull Apart'],bw:false},
  ],
  legs: [
    {n:'Barbell Squat',em:'🏋️',eq:['barbell'],diff:3,pri:'Quads',sec:'Glutes, Hamstrings',cues:'Chest up, knees track toes, depth to parallel',alts:['Goblet Squat','Leg Press'],bw:false},
    {n:'Romanian Deadlift',em:'💪',eq:['barbell'],diff:2,pri:'Hamstrings',sec:'Glutes',cues:'Hinge at hips, soft knees, feel the stretch',alts:['Nordic Curl','Lying Leg Curl'],bw:false},
    {n:'Leg Press',em:'🦵',eq:['machine'],diff:1,pri:'Quads',sec:'Glutes',cues:'Feet shoulder width, full ROM, no locked knees',alts:['Barbell Squat','Goblet Squat'],bw:false},
    {n:'Bulgarian Split Squat',em:'🏅',eq:['dumbbell'],diff:2,pri:'Quads',sec:'Glutes, Hamstrings',cues:'Front foot forward, vertical torso, knee to floor',alts:['Reverse Lunge','Step-Ups'],bw:false},
    {n:'Lying Leg Curl',em:'⚡',eq:['machine'],diff:1,pri:'Hamstrings',sec:'Calves',cues:'Slow eccentric, full range, no hip rise',alts:['Romanian Deadlift','Nordic Curl'],bw:false},
    {n:'Leg Extension',em:'⚡',eq:['machine'],diff:1,pri:'Quads',sec:'',cues:'Full extension, 1 sec pause at top',alts:['Wall Sit','Terminal Knee Extension'],bw:false},
    {n:'Hip Thrust',em:'🍑',eq:['barbell'],diff:2,pri:'Glutes',sec:'Hamstrings',cues:'Full hip extension, posterior pelvic tilt, squeeze',alts:['Glute Bridge','Cable Kickback'],bw:false},
    {n:'Walking Lunges',em:'🚶',eq:['dumbbell'],diff:2,pri:'Quads',sec:'Glutes',cues:'Long stride, back knee near floor, upright posture',alts:['Reverse Lunge','Step-Ups'],bw:false},
    {n:'Calf Raise',em:'👟',eq:['machine'],diff:1,pri:'Calves',sec:'',cues:'Full ROM, 2 sec pause at bottom stretch',alts:['Seated Calf Raise','Standing Calf Raise'],bw:false},
    {n:'Goblet Squat',em:'🏆',eq:['dumbbell'],diff:1,pri:'Quads',sec:'Glutes, Core',cues:'Goblet grip, elbows inside knees, sit tall',alts:['Barbell Squat','Bodyweight Squat'],bw:false},
    {n:'Glute Bridge',em:'🍑',eq:[],diff:1,pri:'Glutes',sec:'Hamstrings',cues:'Feet flat, drive through heels, squeeze at top',alts:['Hip Thrust','Cable Kickback'],bw:true},
  ],
  shoulders: [
    {n:'Overhead Press',em:'🏋️',eq:['barbell'],diff:3,pri:'Front Delts',sec:'Triceps, Traps',cues:'Bar path: forehead then back overhead',alts:['Dumbbell Shoulder Press','Pike Push-Up'],bw:false},
    {n:'Dumbbell Shoulder Press',em:'💪',eq:['dumbbell'],diff:1,pri:'Front Delts',sec:'Triceps',cues:'Elbows slightly forward, press to full lockout',alts:['Overhead Press','Arnold Press'],bw:false},
    {n:'Lateral Raise',em:'🦅',eq:['dumbbell'],diff:1,pri:'Side Delts',sec:'',cues:'Lead with elbows, slight forward lean, thumb down',alts:['Cable Lateral Raise','Machine Lateral Raise'],bw:false},
    {n:'Cable Lateral Raise',em:'⚡',eq:['cables'],diff:1,pri:'Side Delts',sec:'',cues:'Constant tension, controlled, cross body',alts:['Lateral Raise','Machine Lateral Raise'],bw:false},
    {n:'Rear Delt Fly',em:'🦋',eq:['dumbbell'],diff:1,pri:'Rear Delts',sec:'Traps',cues:'Hinge at hips, reverse fly arc, lead with elbows',alts:['Face Pull','Reverse Pec Deck'],bw:false},
    {n:'Arnold Press',em:'🏅',eq:['dumbbell'],diff:2,pri:'All Delts',sec:'Triceps',cues:'Start neutral grip, rotate as you press up',alts:['Dumbbell Shoulder Press','Overhead Press'],bw:false},
  ],
  biceps: [
    {n:'Barbell Curl',em:'💪',eq:['barbell'],diff:1,pri:'Biceps',sec:'Brachialis',cues:'Elbows pinned, supinate at top, control descent',alts:['Dumbbell Curl','Cable Curl'],bw:false},
    {n:'Incline Dumbbell Curl',em:'💪',eq:['dumbbell'],diff:1,pri:'Biceps Long Head',sec:'',cues:'Full stretch at bottom, supinate at top',alts:['Barbell Curl','Preacher Curl'],bw:false},
    {n:'Hammer Curl',em:'🔨',eq:['dumbbell'],diff:1,pri:'Brachialis',sec:'Forearms',cues:'Neutral grip, strict form, no swinging',alts:['Cross Body Curl','Rope Hammer Curl'],bw:false},
    {n:'Cable Curl',em:'⚡',eq:['cables'],diff:1,pri:'Biceps',sec:'',cues:'Constant tension, elbows pinned',alts:['Barbell Curl','Dumbbell Curl'],bw:false},
    {n:'Preacher Curl',em:'💺',eq:['machine'],diff:1,pri:'Biceps Short Head',sec:'',cues:'Full stretch at bottom, no swinging',alts:['Barbell Curl','Concentration Curl'],bw:false},
  ],
  triceps: [
    {n:'Close Grip Bench',em:'🏋️',eq:['barbell'],diff:2,pri:'Triceps',sec:'Chest',cues:'Shoulder width grip, elbows tucked, full lockout',alts:['Diamond Push-Up','Dumbbell Tricep Press'],bw:false},
    {n:'Rope Pushdown',em:'⚡',eq:['cables'],diff:1,pri:'Triceps',sec:'',cues:'Elbows fixed, spread rope at bottom, full extension',alts:['Bar Pushdown','Overhead Extension'],bw:false},
    {n:'Overhead Tricep Extension',em:'⚡',eq:['cables'],diff:1,pri:'Triceps Long Head',sec:'',cues:'Elbows close to head, full stretch overhead',alts:['Skull Crusher','Overhead DB Extension'],bw:false},
    {n:'Skull Crusher',em:'💀',eq:['barbell'],diff:2,pri:'Triceps',sec:'',cues:'Lower to forehead, elbows travel back slightly',alts:['Overhead Extension','DB Skull Crusher'],bw:false},
    {n:'Tricep Dips',em:'🏅',eq:['bar'],diff:2,pri:'Triceps',sec:'Chest',cues:'Upright torso, full lockout at top',alts:['Close Grip Bench','Diamond Push-Up'],bw:true},
    {n:'Diamond Push-Up',em:'🔷',eq:[],diff:2,pri:'Triceps',sec:'Chest',cues:'Hands form diamond, elbows flare back',alts:['Tricep Dips','Close Grip Bench'],bw:true},
  ],
  core: [
    {n:'Plank',em:'🧱',eq:[],diff:1,pri:'Core',sec:'Shoulders',cues:'Straight line head to heels, squeeze everything',alts:['Dead Bug','Hollow Body Hold'],bw:true},
    {n:'Cable Crunch',em:'⚡',eq:['cables'],diff:1,pri:'Abs',sec:'',cues:'Crunch toward hips, resist on way up',alts:['Decline Crunch','Ab Wheel'],bw:false},
    {n:'Leg Raise',em:'🦵',eq:[],diff:1,pri:'Lower Abs',sec:'Hip Flexors',cues:'Control the descent, do not swing',alts:['Hanging Leg Raise','Reverse Crunch'],bw:true},
    {n:'Ab Wheel',em:'⚙️',eq:['wheel'],diff:3,pri:'Abs',sec:'Lower Back',cues:'Straight arms, extend fully, controlled return',alts:['Plank','Fallout'],bw:false},
    {n:'Russian Twist',em:'🔄',eq:['dumbbell'],diff:1,pri:'Obliques',sec:'Abs',cues:'Lean back 45 degrees, rotate fully each side',alts:['Side Plank','Woodchop'],bw:false},
    {n:'Hanging Leg Raise',em:'🏅',eq:['bar'],diff:2,pri:'Lower Abs',sec:'Hip Flexors',cues:'Full hang, controlled raise, no swinging',alts:['Leg Raise','Reverse Crunch'],bw:true},
  ],
};

var EX_ALL = [];
Object.keys(DB).forEach(function(grp) { DB[grp].forEach(function(e) { EX_ALL.push(Object.assign({grp:grp}, e)); }); });

function exById(name) {
  return EX_ALL.find(function(e) { return e.n === name; }) || {n:name,em:'💪',eq:[],diff:1,pri:'Muscles',sec:'',cues:'Focus on form',alts:[],bw:false,grp:'other'};
}

function exSearch(q, grp) {
  var r = EX_ALL;
  if (grp && grp !== 'all') r = r.filter(function(e) { return e.grp === grp; });
  if (q) {
    q = q.toLowerCase();
    r = r.filter(function(e) { return e.n.toLowerCase().includes(q) || e.pri.toLowerCase().includes(q) || (e.sec || '').toLowerCase().includes(q); });
  }
  return r;
}

/* === TRAINING SPLITS === */
var SPLITS = {
  ppl: {n:'Push Pull Legs',days:6,label:'PPL - 6 days/week',icon:'🔄',schedule:[
    {n:'Push A',muscles:['Chest','Shoulders','Triceps'],exercises:['Barbell Bench Press','Overhead Press','Incline Bench Press','Lateral Raise','Rope Pushdown','Overhead Tricep Extension']},
    {n:'Pull A',muscles:['Back','Biceps'],exercises:['Deadlift','Barbell Row','Lat Pulldown','Face Pull','Barbell Curl','Hammer Curl']},
    {n:'Legs A',muscles:['Quads','Hamstrings','Glutes','Calves'],exercises:['Barbell Squat','Romanian Deadlift','Leg Press','Lying Leg Curl','Calf Raise','Plank']},
    {n:'Push B',muscles:['Chest','Shoulders','Triceps'],exercises:['Dumbbell Bench Press','Arnold Press','Incline Dumbbell Press','Cable Lateral Raise','Skull Crusher','Tricep Dips']},
    {n:'Pull B',muscles:['Back','Biceps'],exercises:['T-Bar Row','Pull-Ups','Seated Cable Row','Rear Delt Fly','Incline Dumbbell Curl','Cable Curl']},
    {n:'Legs B',muscles:['Quads','Hamstrings','Glutes','Calves'],exercises:['Bulgarian Split Squat','Hip Thrust','Leg Extension','Walking Lunges','Calf Raise','Cable Crunch']},
  ]},
  ul: {n:'Upper Lower',days:4,label:'Upper/Lower - 4 days/week',schedule:[
    {n:'Upper A',muscles:['Chest','Back','Shoulders','Arms'],exercises:['Barbell Bench Press','Barbell Row','Overhead Press','Barbell Curl','Rope Pushdown','Lateral Raise']},
    {n:'Lower A',muscles:['Quads','Hamstrings','Glutes','Calves'],exercises:['Barbell Squat','Romanian Deadlift','Leg Press','Lying Leg Curl','Calf Raise','Plank']},
    {n:'Upper B',muscles:['Chest','Back','Shoulders','Arms'],exercises:['Incline Bench Press','Pull-Ups','Dumbbell Shoulder Press','Incline Dumbbell Curl','Skull Crusher','Face Pull']},
    {n:'Lower B',muscles:['Quads','Hamstrings','Glutes','Calves'],exercises:['Bulgarian Split Squat','Hip Thrust','Leg Extension','Walking Lunges','Calf Raise','Hanging Leg Raise']},
  ]},
  fb: {n:'Full Body',days:3,label:'Full Body - 3 days/week',schedule:[
    {n:'Full Body A',muscles:['Chest','Back','Legs','Shoulders','Arms'],exercises:['Barbell Bench Press','Barbell Row','Barbell Squat','Overhead Press','Barbell Curl','Rope Pushdown']},
    {n:'Full Body B',muscles:['Chest','Back','Legs','Shoulders','Arms'],exercises:['Incline Bench Press','Deadlift','Leg Press','Lateral Raise','Hammer Curl','Tricep Dips']},
    {n:'Full Body C',muscles:['Chest','Back','Legs','Shoulders','Arms'],exercises:['Dumbbell Bench Press','Pull-Ups','Goblet Squat','Arnold Press','Cable Curl','Overhead Tricep Extension']},
  ]},
  bro: {n:'Bro Split',days:5,label:'Bro Split - 5 days/week',schedule:[
    {n:'Chest',muscles:['Chest','Triceps'],exercises:['Barbell Bench Press','Incline Bench Press','Dumbbell Fly','Cable Crossover','Chest Dips','Rope Pushdown']},
    {n:'Back',muscles:['Back','Biceps'],exercises:['Deadlift','Barbell Row','Pull-Ups','Lat Pulldown','Seated Cable Row','Barbell Curl']},
    {n:'Shoulders',muscles:['Shoulders','Traps'],exercises:['Overhead Press','Dumbbell Shoulder Press','Lateral Raise','Rear Delt Fly','Arnold Press','Face Pull']},
    {n:'Legs',muscles:['Quads','Hamstrings','Glutes','Calves'],exercises:['Barbell Squat','Romanian Deadlift','Leg Press','Bulgarian Split Squat','Lying Leg Curl','Calf Raise']},
    {n:'Arms',muscles:['Biceps','Triceps'],exercises:['Barbell Curl','Incline Dumbbell Curl','Hammer Curl','Cable Curl','Skull Crusher','Close Grip Bench','Tricep Dips']},
  ]},
  str: {n:'Strength',days:4,label:'Strength - 4 days/week',schedule:[
    {n:'Squat',muscles:['Quads','Glutes','Core'],exercises:['Barbell Squat','Romanian Deadlift','Barbell Row','Bulgarian Split Squat','Barbell Curl','Plank']},
    {n:'Press',muscles:['Chest','Shoulders','Triceps'],exercises:['Barbell Bench Press','Overhead Press','Incline Bench Press','Close Grip Bench','Lateral Raise','Rope Pushdown']},
    {n:'Deadlift',muscles:['Back','Hamstrings'],exercises:['Deadlift','Pull-Ups','T-Bar Row','Romanian Deadlift','Face Pull','Cable Curl']},
    {n:'Accessory',muscles:['All'],exercises:['Dumbbell Bench Press','Arnold Press','Dumbbell Row','Leg Press','Incline Dumbbell Curl','Skull Crusher']},
  ]},
  glute: {n:'Glute Focus',days:4,label:'Glute Focus - 4 days/week',schedule:[
    {n:'Glute A',muscles:['Glutes','Hamstrings'],exercises:['Hip Thrust','Romanian Deadlift','Glute Bridge','Walking Lunges','Lying Leg Curl','Calf Raise']},
    {n:'Upper',muscles:['Back','Shoulders','Arms'],exercises:['Lat Pulldown','Dumbbell Row','Lateral Raise','Cable Curl','Rope Pushdown','Face Pull']},
    {n:'Glute B',muscles:['Glutes','Quads'],exercises:['Bulgarian Split Squat','Hip Thrust','Leg Press','Leg Extension','Goblet Squat','Hanging Leg Raise']},
    {n:'Full Body',muscles:['All'],exercises:['Barbell Squat','Incline Dumbbell Press','Barbell Row','Romanian Deadlift','Arnold Press','Plank']},
  ]},
  cali: {n:'Calisthenics',days:4,label:'Calisthenics - 4 days/week',schedule:[
    {n:'Push',muscles:['Chest','Shoulders','Triceps'],exercises:['Push-Ups','Diamond Push-Up','Chest Dips','Tricep Dips']},
    {n:'Pull',muscles:['Back','Biceps'],exercises:['Pull-Ups','Hanging Leg Raise']},
    {n:'Legs',muscles:['Quads','Glutes','Hamstrings'],exercises:['Goblet Squat','Walking Lunges','Glute Bridge','Calf Raise']},
    {n:'Core',muscles:['Core','Abs'],exercises:['Plank','Ab Wheel','Russian Twist','Leg Raise','Hanging Leg Raise']},
  ]},
};

/* === WORKOUT ENGINE === */
var WE = {
  getSplitDay: function() {
    var sp = SPLITS[S.g('training.split')] || SPLITS.ppl;
    return sp.schedule[((S.g('training.day') || 1) - 1) % sp.schedule.length];
  },
  getWorkout: function() {
    var day = this.getSplitDay();
    if (!day) return [];
    var goal = S.g('user.goal') || 'hypertrophy';
    return day.exercises.map(function(name) {
      var ex = exById(name);
      var prev = WE.getPrev(name);
      var sets = goal === 'strength' ? (ex.diff >= 2 ? 5 : 4) : ex.diff >= 2 ? 4 : 3;
      var reps = goal === 'strength' ? '3-5' : goal === 'hypertrophy' ? '8-12' : goal === 'fat_loss' ? '12-15' : '6-8';
      var w = WE.suggestW(ex);
      if (prev && prev.sets && prev.sets[0]) w = prev.sets[0].weight;
      if (prev && prev.sets && prev.sets.every(function(s) { return s.done; })) w = Math.round(w * 1.025 * 2) / 2;
      return {n:ex.n,em:ex.em||'💪',pri:ex.pri,sec:ex.sec,cues:ex.cues,alts:ex.alts,bw:ex.bw,diff:ex.diff,sets:sets,reps:reps,weight:w,prev:prev};
    });
  },
  suggestW: function(ex) {
    var bw = S.g('user.weight') || 75;
    var g = S.g('user.gender') || 'male';
    var exp = S.g('user.exp') || 'intermediate';
    var m = exp === 'beginner' ? .42 : exp === 'intermediate' ? .67 : .9;
    if (g === 'female') m *= .65;
    var map = {'Barbell Bench Press':bw*.75,'Barbell Squat':bw,'Deadlift':bw*1.2,'Overhead Press':bw*.5,'Barbell Row':bw*.7,'Romanian Deadlift':bw*.85,'Hip Thrust':bw,'Leg Press':bw*1.5};
    return Math.round((map[ex.n] || (bw * .4)) * m / 2.5) * 2.5;
  },
  getPrev: function(name) {
    var ws = S.g('workouts') || [];
    for (var i = ws.length - 1; i >= 0; i--) {
      var exs = ws[i].exercises || [];
      for (var j = 0; j < exs.length; j++) {
        if (exs[j].name === name && exs[j].sets && exs[j].sets.length) return exs[j];
      }
    }
    return null;
  },
  calcVol: function(sets) { return sets.filter(function(s) { return s.done; }).reduce(function(a, s) { return a + (s.weight * s.reps); }, 0); },
  epley: function(w, r) { return r === 1 ? w : Math.round(w * (1 + r / 30)); },
  checkPR: function(name, w, r) {
    var ws = S.g('workouts') || [];
    var best = 0;
    ws.forEach(function(wo) {
      (wo.exercises || []).forEach(function(ex) {
        if (ex.name === name) (ex.sets || []).forEach(function(s) { if (s.done) { var e = WE.epley(s.weight, s.reps); if (e > best) best = e; } });
      });
    });
    return WE.epley(w, r) > best && best > 0;
  },
  nextDay: function() {
    var sp = SPLITS[S.g('training.split')] || SPLITS.ppl;
    var cur = S.g('training.day') || 1;
    S.set('training.day', cur >= sp.days ? 1 : cur + 1);
  },
  getStreak: function() {
    var ws = S.g('workouts') || [];
    if (!ws.length) return 0;
    var now = new Date(); var streak = 0;
    var dates = ws.map(function(w) { return w.date.slice(0, 10); }).filter(function(v, i, a) { return a.indexOf(v) === i; }).sort().reverse();
    for (var i = 0; i < dates.length; i++) {
      var diff = Math.round((now - new Date(dates[i])) / 864e5);
      if (diff === i || diff === i + 1) streak++;
      else break;
    }
    return streak;
  },
  getWeekVol: function() {
    var ws = S.g('workouts') || [];
    var cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 7);
    return ws.filter(function(w) { return new Date(w.date) > cutoff; }).reduce(function(a, w) { return a + (w.totalVol || 0); }, 0);
  },
  bmi: function() { var w = S.g('user.weight') || 75; var h = (S.g('user.height') || 175) / 100; return Math.round(w / (h * h) * 10) / 10; },
  bmr: function() {
    var w = S.g('user.weight') || 75; var h = S.g('user.height') || 175; var a = S.g('user.age') || 25; var g = S.g('user.gender') || 'male';
    return g === 'male' ? Math.round(10*w + 6.25*h - 5*a + 5) : Math.round(10*w + 6.25*h - 5*a - 161);
  },
};

/* === WORKOUT SCREEN === */
var _wkt = [], _wktOn = false;

reg('workout', function() {
  if (!_wktOn || !_wkt.length) {
    _wkt = WE.getWorkout().map(function(ex) {
      var rn = parseInt((ex.reps || '8').split('-')[0]);
      var sets = Array.from({length: ex.sets}, function(_, i) { return {n:i+1,w:ex.weight,r:rn,rpe:7,done:false}; });
      return {n:ex.n,em:ex.em||'💪',pri:ex.pri||'Muscles',sec:ex.sec||'',cues:ex.cues||'',alts:ex.alts||[],sets:sets,reps:ex.reps||'8-12',expanded:true,prev:ex.prev,bw:ex.bw};
    });
    _wktOn = true;
  }
  var day = WE.getSplitDay(); var sp = SPLITS[S.g('training.split')] || SPLITS.ppl; var prog = wktProg();
  var h = '';
  h += topbar(day ? day.n : 'Workout', sp.n, '<button class="btn btn-g btn-sm" onclick="finishWkt()">Finish &#10003;</button>');
  h += '<div class="screen">';
  h += '<div style="padding:9px 12px;display:flex;align-items:center;gap:10px">';
  h += '<div style="flex:1;height:5px;background:#1e1e2a;border-radius:3px;overflow:hidden"><div id="wkt-pb" style="height:5px;background:linear-gradient(135deg,#00d5ff,#7c6fff);border-radius:3px;width:' + prog + '%;transition:width .4s"></div></div>';
  h += '<span style="font-size:12px;color:rgba(255,255,255,.35);font-weight:600">' + prog + '%</span></div>';
  _wkt.forEach(function(ex, ei) {
    var dn = setsDone(ex);
    h += '<div class="card" style="margin-bottom:10px">';
    h += '<div style="display:flex;align-items:center;gap:11px;margin-bottom:' + (ex.expanded ? 13 : 0) + 'px;cursor:pointer" onclick="tglEx(' + ei + ')">';
    h += '<div class="ex-ic">' + ex.em + '</div>';
    h += '<div style="flex:1"><div style="font-size:15px;font-weight:800">' + ex.n + '</div>';
    h += '<div style="font-size:11px;color:rgba(255,255,255,.35);margin-top:2px">' + ex.pri + ' &middot; ' + ex.sets.length + ' sets &middot; ' + ex.reps + '</div></div>';
    h += '<div style="text-align:right"><div style="font-size:16px;font-weight:800;color:' + (dn === ex.sets.length ? '#00ff88' : '#fff') + '">' + dn + '/' + ex.sets.length + '</div>';
    h += '<div style="font-size:10px;color:rgba(255,255,255,.3)">done</div></div></div>';
    if (ex.expanded) {
      if (ex.prev && ex.prev.sets && ex.prev.sets[0]) {
        h += '<div style="background:rgba(0,213,255,.06);border-radius:9px;padding:7px 11px;margin-bottom:9px;font-size:12px;color:rgba(255,255,255,.4)">Previous: ' + ex.prev.sets[0].weight + 'kg &times; ' + ex.prev.sets[0].reps + ' reps</div>';
      }
      h += '<div style="display:grid;grid-template-columns:34px 1fr 1fr 1fr 40px;gap:6px;padding:0 0 5px;margin-bottom:3px">';
      h += '<span></span><span style="font-size:10px;color:rgba(255,255,255,.3);text-align:center;font-weight:700">KG</span>';
      h += '<span style="font-size:10px;color:rgba(255,255,255,.3);text-align:center;font-weight:700">REPS</span>';
      h += '<span style="font-size:10px;color:rgba(255,255,255,.3);text-align:center;font-weight:700">RPE</span><span></span></div>';
      ex.sets.forEach(function(set, si) {
        h += '<div class="set-row" id="sr' + ei + 'x' + si + '">';
        h += '<div class="set-n' + (set.done ? ' done' : '') + '">' + set.n + '</div>';
        h += '<input class="set-inp" type="number" value="' + set.w + '" step="2.5"' + (set.done ? ' disabled' : '') + ' oninput="sv(' + ei + ',' + si + ',0,this.value)">';
        h += '<input class="set-inp" type="number" value="' + set.r + '" step="1"' + (set.done ? ' disabled' : '') + ' oninput="sv(' + ei + ',' + si + ',1,this.value)">';
        h += '<input class="set-inp" type="number" value="' + set.rpe + '" step=".5" min="5" max="10"' + (set.done ? ' disabled' : '') + ' oninput="sv(' + ei + ',' + si + ',2,this.value)">';
        h += '<button class="set-chk' + (set.done ? ' done' : '') + '" onclick="doneSet(' + ei + ',' + si + ')">';
        if (set.done) h += '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
        h += '</button></div>';
      });
      h += '<div style="margin-top:9px;padding-top:9px;border-top:1px solid rgba(255,255,255,.05)">';
      h += '<div style="font-size:12px;color:rgba(255,255,255,.4);font-style:italic;margin-bottom:7px">' + ex.cues + '</div>';
      if (ex.alts && ex.alts.length) {
        h += '<div style="font-size:10px;color:rgba(255,255,255,.3);font-weight:700;letter-spacing:.08em;margin-bottom:5px">ALTERNATIVES</div>';
        h += '<div style="display:flex;gap:6px;flex-wrap:wrap">';
        ex.alts.slice(0, 3).forEach(function(alt) {
          h += '<span style="padding:4px 10px;border-radius:20px;background:rgba(124,111,255,.1);border:1px solid rgba(124,111,255,.25);font-size:11px;color:#7c6fff;cursor:pointer" onclick="swapEx(' + ei + ',\'' + alt.replace(/'/g, '&#39;') + '\')">' + alt + '</span>';
        });
        h += '</div>';
      }
      h += '</div>';
    }
    h += '</div>';
  });
  h += '<div class="rest-pop" id="rest-pop">';
  h += '<div style="font-size:36px;font-weight:900;color:#00d5ff;min-width:60px;font-variant-numeric:tabular-nums" id="rest-n">1:30</div>';
  h += '<div style="flex:1"><div style="font-size:13px;font-weight:700;margin-bottom:4px">Rest Timer</div>';
  h += '<div style="height:4px;background:#1e1e2a;border-radius:2px;overflow:hidden"><div id="rest-bar" style="height:4px;background:#00d5ff;border-radius:2px"></div></div></div>';
  h += '<button class="btn btn-s btn-sm" onclick="skipRest()">Skip</button></div>';
  h += '<div style="height:18px"></div></div>';
  return h;
});

function wktProg() {
  if (!_wkt.length) return 0;
  var tot = _wkt.reduce(function(a, e) { return a + e.sets.length; }, 0);
  var dn = _wkt.reduce(function(a, e) { return a + setsDone(e); }, 0);
  return tot ? Math.round(dn / tot * 100) : 0;
}
function setsDone(ex) { return ex.sets.filter(function(s) { return s.done; }).length; }
function tglEx(ei) { _wkt[ei].expanded = !_wkt[ei].expanded; go('workout'); }
function sv(ei, si, k, v) { var keys = ['w','r','rpe']; _wkt[ei].sets[si][keys[k]] = parseFloat(v) || 0; }
function swapEx(ei, altName) {
  var e = exById(altName); var old = _wkt[ei];
  _wkt[ei] = Object.assign({}, old, {n:e.n,em:e.em||'💪',pri:e.pri,sec:e.sec,cues:e.cues,alts:e.alts,bw:e.bw});
  toast('Swapped to ' + e.n); go('workout');
}
function doneSet(ei, si) {
  var set = _wkt[ei].sets[si]; set.done = !set.done;
  if (set.done) {
    if (WE.checkPR(_wkt[ei].n, set.w, set.r)) {
      var sr = document.getElementById('sr' + ei + 'x' + si);
      if (sr) {
        var fl = document.createElement('div'); fl.className = 'pr-fl';
        fl.innerHTML = '<span style="font-size:20px">🏆</span><span style="font-size:14px;font-weight:700;color:#00ff88">New PR! ' + set.w + 'kg x ' + set.r + ' reps (' + WE.epley(set.w, set.r) + 'kg est. 1RM)</span>';
        sr.insertAdjacentElement('afterend', fl);
        setTimeout(function() { if (fl.parentNode) fl.parentNode.removeChild(fl); }, 5000);
      }
      toast('New Personal Record!', 'pr');
    }
    if (S.g('prefs.restTimer') !== false) startRest(S.g('prefs.restSecs') || 90);
  }
  var pb = document.getElementById('wkt-pb'); if (pb) pb.style.width = wktProg() + '%';
  var sr = document.getElementById('sr' + ei + 'x' + si);
  if (sr) {
    var sn = sr.querySelector('.set-n'); if (sn) sn.className = 'set-n' + (set.done ? ' done' : '');
    var btn = sr.querySelector('.set-chk');
    if (btn) { btn.className = 'set-chk' + (set.done ? ' done' : ''); btn.innerHTML = set.done ? '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>' : ''; }
    sr.querySelectorAll('.set-inp').forEach(function(inp) { inp.disabled = set.done; });
  }
}
function finishWkt() {
  if (!confirm('Save this workout?')) return;
  var exData = _wkt.map(function(ex) {
    var sets = ex.sets.map(function(s) { return {weight:s.w,reps:s.r,rpe:s.rpe,done:s.done}; });
    return {name:ex.n,sets:sets,vol:ex.sets.filter(function(s){return s.done;}).reduce(function(a,s){return a+(s.w*s.r);},0),prCount:ex.sets.filter(function(s){return s.done&&WE.checkPR(ex.n,s.w,s.r);}).length};
  });
  var vol = exData.reduce(function(a, e) { return a + e.vol; }, 0);
  var ws = S.g('workouts') || [];
  ws.push({date:new Date().toISOString(),splitDay:(WE.getSplitDay()||{}).n,exercises:exData,totalVol:vol,prCount:exData.reduce(function(a,e){return a+e.prCount;},0)});
  S.set('workouts', ws); WE.nextDay(); _wktOn = false; _wkt = []; checkAchs();
  toast('Saved! ' + Math.round(vol) + 'kg total volume 💪'); go('home');
}

/* === EXERCISES SCREEN === */
var _exGrp = 'all', _exQ = '';

reg('exercises', function() {
  var results = exSearch(_exQ, _exGrp);
  var h = '';
  h += topbar('Exercise Library', '' + EX_ALL.length + ' exercises');
  h += '<div class="screen">';
  h += '<div style="padding:10px 12px 0"><div style="position:relative"><span style="position:absolute;left:14px;top:50%;transform:translateY(-50%);font-size:16px;color:rgba(255,255,255,.3)">🔍</span>';
  h += '<input class="field" style="padding-left:40px" placeholder="Search exercises, muscles..." value="' + _exQ + '" oninput="exQ(this.value)"></div></div>';
  h += '<div class="scroll-row" style="margin:8px 0 4px">';
  [{v:'all',l:'All'},{v:'chest',l:'Chest'},{v:'back',l:'Back'},{v:'legs',l:'Legs'},{v:'shoulders',l:'Shoulders'},{v:'biceps',l:'Biceps'},{v:'triceps',l:'Triceps'},{v:'core',l:'Core'}].forEach(function(f) {
    h += '<button class="pill' + (_exGrp === f.v ? ' on' : '') + '" onclick="exGrp(\'' + f.v + '\')">' + f.l + '</button>';
  });
  h += '</div>';
  h += '<div style="padding:2px 12px 6px;font-size:12px;color:rgba(255,255,255,.3)">' + results.length + ' exercises</div>';
  h += '<div class="card">';
  if (!results.length) { h += '<p style="color:rgba(255,255,255,.35);text-align:center;padding:18px">No exercises found</p>'; }
  results.slice(0, 50).forEach(function(e) {
    h += '<div class="exr card-tap" onclick="showExDetail(\'' + e.n.replace(/'/g, '\\x27') + '\')">';
    h += '<div class="ex-ic">' + e.em + '</div>';
    h += '<div class="ex-inf"><div class="ex-nm">' + e.n + '</div>';
    h += '<div class="ex-sub">' + e.pri + (e.sec ? ' &middot; ' + e.sec : '') + '</div></div>';
    h += '<div style="font-size:11px;padding:3px 8px;border-radius:20px;background:rgba(255,255,255,.05);color:rgba(255,255,255,.4)">' + ['Beg','Int','Adv'][e.diff-1] + '</div></div>';
  });
  h += '</div><div style="height:18px"></div></div>';
  return h;
});

function exQ(v) { _exQ = v; go('exercises'); }
function exGrp(v) { _exGrp = v; go('exercises'); }
function showExDetail(name) {
  var e = exById(name);
  var m = document.createElement('div'); m.className = 'overlay'; m.id = 'ex-det';
  var h = '<div class="sheet"><div class="sheet-handle"></div>';
  h += '<div style="display:flex;align-items:center;gap:13px;margin-bottom:18px">';
  h += '<div style="width:54px;height:54px;border-radius:18px;background:#1e1e2a;display:flex;align-items:center;justify-content:center;font-size:26px">' + e.em + '</div>';
  h += '<div><div style="font-size:20px;font-weight:800">' + e.n + '</div><div style="font-size:13px;color:rgba(255,255,255,.4)">' + e.pri + (e.sec ? ' &middot; ' + e.sec : '') + '</div></div></div>';
  h += '<div class="g2" style="gap:10px;margin-bottom:14px">';
  h += '<div class="stat"><div class="sv" style="font-size:14px">' + ['Beginner','Intermediate','Advanced'][e.diff-1] + '</div><div class="sl">Difficulty</div></div>';
  h += '<div class="stat"><div class="sv" style="font-size:13px">' + (e.bw ? 'Bodyweight' : (e.eq || []).join(', ') || 'Any') + '</div><div class="sl">Equipment</div></div></div>';
  h += '<div style="font-size:11px;font-weight:700;letter-spacing:.1em;color:rgba(255,255,255,.4);text-transform:uppercase;margin-bottom:6px">COACHING CUES</div>';
  h += '<div class="ai-msg" style="margin-bottom:14px"><p>' + e.cues + '</p></div>';
  if (e.alts && e.alts.length) {
    h += '<div style="font-size:11px;font-weight:700;letter-spacing:.1em;color:rgba(255,255,255,.4);text-transform:uppercase;margin-bottom:7px">ALTERNATIVES</div>';
    h += '<div style="display:flex;gap:7px;flex-wrap:wrap;margin-bottom:14px">';
    e.alts.forEach(function(a) { h += '<span style="padding:5px 12px;border-radius:20px;background:rgba(124,111,255,.1);border:1px solid rgba(124,111,255,.25);font-size:13px;color:#7c6fff">' + a + '</span>'; });
    h += '</div>';
  }
  h += '<button class="btn btn-p mb12" onclick="document.getElementById(\'ex-det\').remove()">Close</button>';
  h += '</div>';
  m.innerHTML = h; m.addEventListener('click', function(ev) { if (ev.target === m) m.remove(); }); document.body.appendChild(m);
}

/* === SETTINGS SCREEN === */
reg('settings', function() {
  var u = S.g('user') || {}; var p = S.g('prefs') || {}; var sp = S.g('training.split') || 'ppl';
  var h = '';
  h += topbar('Settings');
  h += '<div class="screen">';
  h += sh('Profile'); h += '<div class="card">';
  h += '<div class="fw"><label class="field-label">Name</label><input class="field" value="' + (u.name || '') + '" placeholder="Your name" onchange="S.set(\'user.name\',this.value)"></div>';
  h += '<div class="g2" style="gap:10px">';
  h += '<div class="fw"><label class="field-label">Age</label><input class="field" type="number" value="' + (u.age || '') + '" onchange="S.set(\'user.age\',parseInt(this.value))"></div>';
  h += '<div class="fw"><label class="field-label">Gender</label><select class="field" onchange="S.set(\'user.gender\',this.value)">';
  [{v:'male',l:'Male'},{v:'female',l:'Female'},{v:'neutral',l:'Neutral'}].forEach(function(o) { h += '<option value="' + o.v + '"' + (u.gender === o.v ? ' selected' : '') + '>' + o.l + '</option>'; });
  h += '</select></div>';
  h += '<div class="fw"><label class="field-label">Weight (kg)</label><input class="field" type="number" value="' + (u.weight || '') + '" step=".5" onchange="S.set(\'user.weight\',parseFloat(this.value))"></div>';
  h += '<div class="fw"><label class="field-label">Height (cm)</label><input class="field" type="number" value="' + (u.height || '') + '" onchange="S.set(\'user.height\',parseFloat(this.value))"></div>';
  h += '</div>';
  h += '<div class="fw"><label class="field-label">Goal</label><select class="field" onchange="S.set(\'user.goal\',this.value)">';
  [{v:'hypertrophy',l:'Build Muscle'},{v:'strength',l:'Get Stronger'},{v:'fat_loss',l:'Lose Fat'},{v:'athletic',l:'Athletic'},{v:'recomp',l:'Body Recomposition'}].forEach(function(o) { h += '<option value="' + o.v + '"' + (u.goal === o.v ? ' selected' : '') + '>' + o.l + '</option>'; });
  h += '</select></div>';
  h += '<div class="fw"><label class="field-label">Experience</label><select class="field" onchange="S.set(\'user.exp\',this.value)">';
  [{v:'beginner',l:'Beginner'},{v:'intermediate',l:'Intermediate'},{v:'advanced',l:'Advanced'}].forEach(function(o) { h += '<option value="' + o.v + '"' + (u.exp === o.v ? ' selected' : '') + '>' + o.l + '</option>'; });
  h += '</select></div>';
  h += '<div class="fw"><label class="field-label">Units</label><select class="field" onchange="S.set(\'user.units\',this.value)">';
  h += '<option value="metric"' + ((u.units || 'metric') === 'metric' ? ' selected' : '') + '>Metric (kg / cm)</option>';
  h += '<option value="imperial"' + (u.units === 'imperial' ? ' selected' : '') + '>Imperial (lbs / in)</option>';
  h += '</select></div></div>';
  h += sh('Training Program'); h += '<div class="card">';
  h += '<div class="fw"><label class="field-label">Training Split</label><select class="field" onchange="S.set(\'training.split\',this.value);S.set(\'training.day\',1);_wktOn=false;_wkt=[];toast(\'Split updated!\')">';
  Object.keys(SPLITS).forEach(function(k) { h += '<option value="' + k + '"' + (sp === k ? ' selected' : '') + '>' + SPLITS[k].label + '</option>'; });
  h += '</select></div>';
  h += '<div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0"><div><div style="font-size:14px;font-weight:600">Current Day</div>';
  h += '<div style="font-size:11px;color:rgba(255,255,255,.35)">Day ' + (S.g('training.day') || 1) + ' of ' + (SPLITS[sp] ? SPLITS[sp].days : 7) + '</div></div>';
  h += '<div style="display:flex;gap:8px"><button class="btn btn-s btn-sm" onclick="adjDay(-1)">&larr;</button><button class="btn btn-s btn-sm" onclick="adjDay(1)">&rarr;</button></div></div></div>';
  h += sh('Equipment'); h += '<div class="card">';
  var ce = u.equipment || [];
  [{v:'barbell',l:'Barbell & Plates'},{v:'dumbbell',l:'Dumbbells'},{v:'cables',l:'Cable Machine'},{v:'machine',l:'Machines'},{v:'bar',l:'Pull-Up Bar'},{v:'bands',l:'Resistance Bands'}].forEach(function(eq) {
    var has = ce.indexOf(eq.v) >= 0;
    h += '<div class="tog-row"><div class="tog-t">' + eq.l + '</div>';
    h += '<label class="tgl"><input type="checkbox"' + (has ? ' checked' : '') + ' onchange="togEquip(\'' + eq.v + '\',this.checked)"><div class="tgl-track"></div><div class="tgl-thumb"></div></label></div>';
  });
  h += '</div>';
  h += sh('Preferences'); h += '<div class="card">';
  h += '<div class="tog-row"><div><div class="tog-t">Rest Timer</div><div class="tog-s">Auto-start after each set</div></div><label class="tgl"><input type="checkbox"' + (p.restTimer !== false ? ' checked' : '') + ' onchange="S.set(\'prefs.restTimer\',this.checked)"><div class="tgl-track"></div><div class="tgl-thumb"></div></label></div>';
  h += '<div class="tog-row"><div class="tog-t">Rest Duration</div><select class="field" style="width:90px;padding:8px" onchange="S.set(\'prefs.restSecs\',parseInt(this.value))">';
  [{v:60,l:'60s'},{v:90,l:'90s'},{v:120,l:'2 min'},{v:180,l:'3 min'}].forEach(function(o) { h += '<option value="' + o.v + '"' + ((p.restSecs || 90) === o.v ? ' selected' : '') + '>' + o.l + '</option>'; });
  h += '</select></div></div>';
  h += sh('Data'); h += '<div class="card">';
  h += '<button class="btn btn-s mb12" onclick="exportData()">📥 Export Backup</button>';
  h += '<button class="btn btn-s mb12" onclick="importData()">📤 Import Backup</button>';
  h += '<button class="btn btn-r" onclick="clearAll()">🗑️ Clear All Data</button></div>';
  h += sh('About'); h += '<div class="card" style="text-align:center;margin-bottom:18px">';
  h += '<div style="font-size:40px;margin-bottom:8px">&#9889;</div>';
  h += '<div style="font-size:19px;font-weight:900;letter-spacing:-.4px">FitnessOS Pro</div>';
  h += '<div style="font-size:12px;color:rgba(255,255,255,.35);margin-top:5px">Version 4.0 &middot; Standalone &middot; Offline capable<br>8 tabs &middot; Body Clone &middot; AI Coach &middot; 60+ exercises</div></div>';
  h += '</div>';
  return h;
});

function togEquip(eq, on) {
  var cur = S.g('user.equipment') || []; var idx = cur.indexOf(eq);
  if (on && idx < 0) cur.push(eq);
  if (!on && idx >= 0) cur.splice(idx, 1);
  S.set('user.equipment', cur);
}
function adjDay(d) {
  var sp = SPLITS[S.g('training.split')] || SPLITS.ppl; var cur = S.g('training.day') || 1; var next = cur + d;
  if (next < 1) next = sp.days; if (next > sp.days) next = 1;
  S.set('training.day', next); _wktOn = false; _wkt = []; go('settings');
}
function exportData() {
  var b = new Blob([JSON.stringify(S.d, null, 2)], {type:'application/json'});
  var u = URL.createObjectURL(b); var a = document.createElement('a');
  a.href = u; a.download = 'fitnessos-' + new Date().toISOString().slice(0, 10) + '.json'; a.click(); URL.revokeObjectURL(u); toast('Exported!');
}
function importData() {
  var inp = document.createElement('input'); inp.type = 'file'; inp.accept = '.json';
  inp.onchange = function(e) {
    var f = e.target.files[0]; if (!f) return;
    var r = new FileReader();
    r.onload = function(ev) { try { Object.assign(S.d, JSON.parse(ev.target.result)); S.save(); toast('Imported!'); go('home'); } catch(e) { toast('Invalid file', 'warn'); } };
    r.readAsText(f);
  };
  inp.click();
}
function clearAll() { if (confirm('Delete all data? Cannot be undone.')) { localStorage.removeItem(S._k); location.reload(); } }
