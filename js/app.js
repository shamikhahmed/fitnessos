

/* === BACKGROUND === */
(function(){
  var c=document.getElementById('bg-canvas'),ctx=c.getContext('2d'),W=0,H=0,orbs=[];
  function resize(){W=c.width=window.innerWidth;H=c.height=window.innerHeight;}
  function mk(){return{x:Math.random()*W,y:Math.random()*H,r:120+Math.random()*220,vx:(Math.random()-.5)*.22,vy:(Math.random()-.5)*.22,hue:Math.random()<.33?195:Math.random()<.5?260:320,a:.025+Math.random()*.04};}
  resize();for(var i=0;i<5;i++)orbs.push(mk());
  window.addEventListener('resize',resize);
  (function loop(){
    ctx.clearRect(0,0,W,H);
    orbs.forEach(function(o){
      o.x+=o.vx;o.y+=o.vy;
      if(o.x<-o.r)o.x=W+o.r;if(o.x>W+o.r)o.x=-o.r;
      if(o.y<-o.r)o.y=H+o.r;if(o.y>H+o.r)o.y=-o.r;
      var g=ctx.createRadialGradient(o.x,o.y,0,o.x,o.y,o.r);
      g.addColorStop(0,'hsla('+o.hue+',100%,60%,'+o.a+')');
      g.addColorStop(1,'hsla('+o.hue+',100%,60%,0)');
      ctx.beginPath();ctx.arc(o.x,o.y,o.r,0,Math.PI*2);ctx.fillStyle=g;ctx.fill();
    });
    requestAnimationFrame(loop);
  })();
})();

/* === STATE === */
var S={
  _k:'fos4',d:null,
  _def:function(){return{onboarding:false,user:{name:'',age:25,weight:75,height:175,goal:'hypertrophy',exp:'intermediate',gender:'male',units:'metric',equipment:['barbell','dumbbell','cables','machine']},training:{split:'ppl',day:1},workouts:[],recovery:{sleep:7.5,soreness:3,stress:4,hydration:2.5,energy:7},metrics:[],achievements:[],prefs:{restTimer:true,restSecs:90}};},
  init:function(){try{var s=localStorage.getItem(this._k);this.d=s?JSON.parse(s):this._def();}catch(e){this.d=this._def();}return this;},
  save:function(){try{localStorage.setItem(this._k,JSON.stringify(this.d));}catch(e){}},
  g:function(k){return k.split('.').reduce(function(o,p){return o&&o[p]!==undefined?o[p]:null;},S.d);},
  set:function(k,v){var ks=k.split('.'),o=S.d;ks.slice(0,-1).forEach(function(p){if(!o[p])o[p]={};o=o[p];});o[ks[ks.length-1]]=v;S.save();}
};
S.init();

/* === ROUTER === */
var _scr='',_screens={};
function reg(id,fn){_screens[id]=fn;}
function go(id){
  if(!_screens[id])return;_scr=id;
  document.querySelectorAll('.nb').forEach(function(b){b.classList.remove('on');});
  var nb=document.getElementById('nb-'+id);if(nb)nb.classList.add('on');
  var v=document.getElementById('view');v.scrollTop=0;
  var d=document.createElement('div');d.className='screen';d.innerHTML=_screens[id]()||'';
  v.innerHTML='';v.appendChild(d);
}

/* === TOAST === */
var _tt;
function toast(msg,type){
  var t=document.getElementById('toast');
  var icon=type==='warn'?'⚠️':type==='trophy'?'🏆':type==='pr'?'💥':'✅';
  t.innerHTML='<span style="font-size:20px">'+icon+'</span><span style="font-size:14px;font-weight:700">'+msg+'</span>';
  t.classList.add('show');clearTimeout(_tt);_tt=setTimeout(function(){t.classList.remove('show');},3500);
}

/* === EXERCISE DB === */
var DB={
  chest:[
    {n:'Barbell Bench Press',em:'🏋️',eq:['barbell'],diff:2,pri:'Chest',sec:'Triceps, Delts',cues:'Retract scaps, arch, drive through chest',alts:['Dumbbell Bench Press','Push-Ups','Cable Chest Press'],bw:false},
    {n:'Incline Bench Press',em:'💪',eq:['barbell'],diff:2,pri:'Upper Chest',sec:'Triceps, Delts',cues:'30-45 degree incline, flare elbows',alts:['Incline Dumbbell Press','Incline Push-Ups'],bw:false},
    {n:'Dumbbell Bench Press',em:'💪',eq:['dumbbell'],diff:1,pri:'Chest',sec:'Triceps',cues:'Full ROM, controlled descent',alts:['Barbell Bench Press','Push-Ups'],bw:false},
    {n:'Dumbbell Fly',em:'🦋',eq:['dumbbell'],diff:1,pri:'Chest',sec:'Delts',cues:'Slight elbow bend, big arc motion',alts:['Cable Crossover','Pec Deck'],bw:false},
    {n:'Cable Crossover',em:'⚡',eq:['cables'],diff:1,pri:'Chest',sec:'Delts',cues:'Forward lean, squeeze at crossing point',alts:['Dumbbell Fly','Pec Deck'],bw:false},
    {n:'Push-Ups',em:'🤸',eq:[],diff:1,pri:'Chest',sec:'Triceps, Core',cues:'Straight body, full lockout',alts:['Dumbbell Bench Press','Wall Push-Ups'],bw:true},
    {n:'Chest Dips',em:'🏅',eq:['bar'],diff:2,pri:'Lower Chest',sec:'Triceps',cues:'Lean forward, wide elbows, deep dip',alts:['Decline Press','Diamond Push-Ups'],bw:true},
    {n:'Incline Dumbbell Press',em:'💪',eq:['dumbbell'],diff:1,pri:'Upper Chest',sec:'Delts',cues:'Slight incline, neutral or pronated grip',alts:['Incline Bench Press','Pike Push-Ups'],bw:false},
  ],
  back:[
    {n:'Deadlift',em:'🏋️',eq:['barbell'],diff:3,pri:'Entire Back',sec:'Hamstrings, Glutes',cues:'Bar mid-foot, neutral spine, lat engagement',alts:['Romanian Deadlift','Hex Bar Deadlift'],bw:false},
    {n:'Barbell Row',em:'💪',eq:['barbell'],diff:2,pri:'Mid Back',sec:'Biceps, Rear Delts',cues:'Hinge 45 degrees, pull elbows behind torso',alts:['Dumbbell Row','Seated Cable Row'],bw:false},
    {n:'Pull-Ups',em:'🏅',eq:['bar'],diff:2,pri:'Lats',sec:'Biceps',cues:'Dead hang, drive elbows to pockets',alts:['Lat Pulldown','Assisted Pull-Ups'],bw:true},
    {n:'Lat Pulldown',em:'⬇️',eq:['cables'],diff:1,pri:'Lats',sec:'Biceps',cues:'Slight lean back, pull to upper chest',alts:['Pull-Ups','Straight Arm Pulldown'],bw:false},
    {n:'Seated Cable Row',em:'⚡',eq:['cables'],diff:1,pri:'Mid Back',sec:'Biceps',cues:'Sit tall, drive elbows back, squeeze blades',alts:['Dumbbell Row','Barbell Row'],bw:false},
    {n:'T-Bar Row',em:'💪',eq:['barbell'],diff:2,pri:'Mid Back',sec:'Lats',cues:'Chest pad, neutral grip, elbows flared',alts:['Barbell Row','Dumbbell Row'],bw:false},
    {n:'Dumbbell Row',em:'🏋️',eq:['dumbbell'],diff:1,pri:'Lats',sec:'Biceps',cues:'Support hand on bench, row to hip',alts:['Barbell Row','Cable Row'],bw:false},
    {n:'Face Pull',em:'⚡',eq:['cables'],diff:1,pri:'Rear Delts',sec:'Traps',cues:'High cable, pull to forehead, externally rotate',alts:['Rear Delt Fly','Band Pull Apart'],bw:false},
  ],
  legs:[
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
  shoulders:[
    {n:'Overhead Press',em:'🏋️',eq:['barbell'],diff:3,pri:'Front Delts',sec:'Triceps, Traps',cues:'Bar path: forehead then back overhead',alts:['Dumbbell Shoulder Press','Pike Push-Up'],bw:false},
    {n:'Dumbbell Shoulder Press',em:'💪',eq:['dumbbell'],diff:1,pri:'Front Delts',sec:'Triceps',cues:'Elbows slightly forward, press to full lockout',alts:['Overhead Press','Arnold Press'],bw:false},
    {n:'Lateral Raise',em:'🦅',eq:['dumbbell'],diff:1,pri:'Side Delts',sec:'',cues:'Lead with elbows, slight forward lean, thumb down',alts:['Cable Lateral Raise','Machine Lateral Raise'],bw:false},
    {n:'Cable Lateral Raise',em:'⚡',eq:['cables'],diff:1,pri:'Side Delts',sec:'',cues:'Constant tension, controlled, cross body',alts:['Lateral Raise','Machine Lateral Raise'],bw:false},
    {n:'Rear Delt Fly',em:'🦋',eq:['dumbbell'],diff:1,pri:'Rear Delts',sec:'Traps',cues:'Hinge at hips, reverse fly arc, lead with elbows',alts:['Face Pull','Reverse Pec Deck'],bw:false},
    {n:'Arnold Press',em:'🏅',eq:['dumbbell'],diff:2,pri:'All Delts',sec:'Triceps',cues:'Start neutral grip, rotate as you press up',alts:['Dumbbell Shoulder Press','Overhead Press'],bw:false},
  ],
  biceps:[
    {n:'Barbell Curl',em:'💪',eq:['barbell'],diff:1,pri:'Biceps',sec:'Brachialis',cues:'Elbows pinned, supinate at top, control descent',alts:['Dumbbell Curl','Cable Curl'],bw:false},
    {n:'Incline Dumbbell Curl',em:'💪',eq:['dumbbell'],diff:1,pri:'Biceps Long Head',sec:'',cues:'Full stretch at bottom, supinate at top',alts:['Barbell Curl','Preacher Curl'],bw:false},
    {n:'Hammer Curl',em:'🔨',eq:['dumbbell'],diff:1,pri:'Brachialis',sec:'Forearms',cues:'Neutral grip, strict form, no swinging',alts:['Cross Body Curl','Rope Hammer Curl'],bw:false},
    {n:'Cable Curl',em:'⚡',eq:['cables'],diff:1,pri:'Biceps',sec:'',cues:'Constant tension, elbows pinned',alts:['Barbell Curl','Dumbbell Curl'],bw:false},
    {n:'Preacher Curl',em:'💺',eq:['machine'],diff:1,pri:'Biceps Short Head',sec:'',cues:'Full stretch at bottom, no swinging',alts:['Barbell Curl','Concentration Curl'],bw:false},
  ],
  triceps:[
    {n:'Close Grip Bench',em:'🏋️',eq:['barbell'],diff:2,pri:'Triceps',sec:'Chest',cues:'Shoulder width grip, elbows tucked, full lockout',alts:['Diamond Push-Up','Dumbbell Tricep Press'],bw:false},
    {n:'Rope Pushdown',em:'⚡',eq:['cables'],diff:1,pri:'Triceps',sec:'',cues:'Elbows fixed, spread rope at bottom, full extension',alts:['Bar Pushdown','Overhead Extension'],bw:false},
    {n:'Overhead Tricep Extension',em:'⚡',eq:['cables'],diff:1,pri:'Triceps Long Head',sec:'',cues:'Elbows close to head, full stretch overhead',alts:['Skull Crusher','Overhead DB Extension'],bw:false},
    {n:'Skull Crusher',em:'💀',eq:['barbell'],diff:2,pri:'Triceps',sec:'',cues:'Lower to forehead, elbows travel back slightly',alts:['Overhead Extension','DB Skull Crusher'],bw:false},
    {n:'Tricep Dips',em:'🏅',eq:['bar'],diff:2,pri:'Triceps',sec:'Chest',cues:'Upright torso, full lockout at top',alts:['Close Grip Bench','Diamond Push-Up'],bw:true},
    {n:'Diamond Push-Up',em:'🔷',eq:[],diff:2,pri:'Triceps',sec:'Chest',cues:'Hands form diamond, elbows flare back',alts:['Tricep Dips','Close Grip Bench'],bw:true},
  ],
  core:[
    {n:'Plank',em:'🧱',eq:[],diff:1,pri:'Core',sec:'Shoulders',cues:'Straight line head to heels, squeeze everything',alts:['Dead Bug','Hollow Body Hold'],bw:true},
    {n:'Cable Crunch',em:'⚡',eq:['cables'],diff:1,pri:'Abs',sec:'',cues:'Crunch toward hips, resist on way up',alts:['Decline Crunch','Ab Wheel'],bw:false},
    {n:'Leg Raise',em:'🦵',eq:[],diff:1,pri:'Lower Abs',sec:'Hip Flexors',cues:'Control the descent, do not swing',alts:['Hanging Leg Raise','Reverse Crunch'],bw:true},
    {n:'Ab Wheel',em:'⚙️',eq:['wheel'],diff:3,pri:'Abs',sec:'Lower Back',cues:'Straight arms, extend fully, controlled return',alts:['Plank','Fallout'],bw:false},
    {n:'Russian Twist',em:'🔄',eq:['dumbbell'],diff:1,pri:'Obliques',sec:'Abs',cues:'Lean back 45 degrees, rotate fully each side',alts:['Side Plank','Woodchop'],bw:false},
    {n:'Hanging Leg Raise',em:'🏅',eq:['bar'],diff:2,pri:'Lower Abs',sec:'Hip Flexors',cues:'Full hang, controlled raise, no swinging',alts:['Leg Raise','Reverse Crunch'],bw:true},
  ],
};
var EX_ALL=[];
Object.keys(DB).forEach(function(grp){DB[grp].forEach(function(e){EX_ALL.push(Object.assign({grp:grp},e));});});
function exById(name){return EX_ALL.find(function(e){return e.n===name;})||{n:name,em:'💪',eq:[],diff:1,pri:'Muscles',sec:'',cues:'Focus on form',alts:[],bw:false,grp:'other'};}
function exSearch(q,grp){var r=EX_ALL;if(grp&&grp!=='all')r=r.filter(function(e){return e.grp===grp;});if(q){q=q.toLowerCase();r=r.filter(function(e){return e.n.toLowerCase().includes(q)||e.pri.toLowerCase().includes(q)||(e.sec||'').toLowerCase().includes(q);});}return r;}

/* === SPLITS === */
var SPLITS={
  ppl:{n:'Push Pull Legs',days:6,label:'PPL - 6 days/week',icon:'🔄',schedule:[
    {n:'Push A',muscles:['Chest','Shoulders','Triceps'],exercises:['Barbell Bench Press','Overhead Press','Incline Bench Press','Lateral Raise','Rope Pushdown','Overhead Tricep Extension']},
    {n:'Pull A',muscles:['Back','Biceps'],exercises:['Deadlift','Barbell Row','Lat Pulldown','Face Pull','Barbell Curl','Hammer Curl']},
    {n:'Legs A',muscles:['Quads','Hamstrings','Glutes','Calves'],exercises:['Barbell Squat','Romanian Deadlift','Leg Press','Lying Leg Curl','Calf Raise','Plank']},
    {n:'Push B',muscles:['Chest','Shoulders','Triceps'],exercises:['Dumbbell Bench Press','Arnold Press','Incline Dumbbell Press','Cable Lateral Raise','Skull Crusher','Tricep Dips']},
    {n:'Pull B',muscles:['Back','Biceps'],exercises:['T-Bar Row','Pull-Ups','Seated Cable Row','Rear Delt Fly','Incline Dumbbell Curl','Cable Curl']},
    {n:'Legs B',muscles:['Quads','Hamstrings','Glutes','Calves'],exercises:['Bulgarian Split Squat','Hip Thrust','Leg Extension','Walking Lunges','Calf Raise','Cable Crunch']},
  ]},
  ul:{n:'Upper Lower',days:4,label:'Upper/Lower - 4 days/week',schedule:[
    {n:'Upper A',muscles:['Chest','Back','Shoulders','Arms'],exercises:['Barbell Bench Press','Barbell Row','Overhead Press','Barbell Curl','Rope Pushdown','Lateral Raise']},
    {n:'Lower A',muscles:['Quads','Hamstrings','Glutes','Calves'],exercises:['Barbell Squat','Romanian Deadlift','Leg Press','Lying Leg Curl','Calf Raise','Plank']},
    {n:'Upper B',muscles:['Chest','Back','Shoulders','Arms'],exercises:['Incline Bench Press','Pull-Ups','Dumbbell Shoulder Press','Incline Dumbbell Curl','Skull Crusher','Face Pull']},
    {n:'Lower B',muscles:['Quads','Hamstrings','Glutes','Calves'],exercises:['Bulgarian Split Squat','Hip Thrust','Leg Extension','Walking Lunges','Calf Raise','Hanging Leg Raise']},
  ]},
  fb:{n:'Full Body',days:3,label:'Full Body - 3 days/week',schedule:[
    {n:'Full Body A',muscles:['Chest','Back','Legs','Shoulders','Arms'],exercises:['Barbell Bench Press','Barbell Row','Barbell Squat','Overhead Press','Barbell Curl','Rope Pushdown']},
    {n:'Full Body B',muscles:['Chest','Back','Legs','Shoulders','Arms'],exercises:['Incline Bench Press','Deadlift','Leg Press','Lateral Raise','Hammer Curl','Tricep Dips']},
    {n:'Full Body C',muscles:['Chest','Back','Legs','Shoulders','Arms'],exercises:['Dumbbell Bench Press','Pull-Ups','Goblet Squat','Arnold Press','Cable Curl','Overhead Tricep Extension']},
  ]},
  bro:{n:'Bro Split',days:5,label:'Bro Split - 5 days/week',schedule:[
    {n:'Chest',muscles:['Chest','Triceps'],exercises:['Barbell Bench Press','Incline Bench Press','Dumbbell Fly','Cable Crossover','Chest Dips','Rope Pushdown']},
    {n:'Back',muscles:['Back','Biceps'],exercises:['Deadlift','Barbell Row','Pull-Ups','Lat Pulldown','Seated Cable Row','Barbell Curl']},
    {n:'Shoulders',muscles:['Shoulders','Traps'],exercises:['Overhead Press','Dumbbell Shoulder Press','Lateral Raise','Rear Delt Fly','Arnold Press','Face Pull']},
    {n:'Legs',muscles:['Quads','Hamstrings','Glutes','Calves'],exercises:['Barbell Squat','Romanian Deadlift','Leg Press','Bulgarian Split Squat','Lying Leg Curl','Calf Raise']},
    {n:'Arms',muscles:['Biceps','Triceps'],exercises:['Barbell Curl','Incline Dumbbell Curl','Hammer Curl','Cable Curl','Skull Crusher','Close Grip Bench','Tricep Dips']},
  ]},
  str:{n:'Strength',days:4,label:'Strength - 4 days/week',schedule:[
    {n:'Squat',muscles:['Quads','Glutes','Core'],exercises:['Barbell Squat','Romanian Deadlift','Barbell Row','Bulgarian Split Squat','Barbell Curl','Plank']},
    {n:'Press',muscles:['Chest','Shoulders','Triceps'],exercises:['Barbell Bench Press','Overhead Press','Incline Bench Press','Close Grip Bench','Lateral Raise','Rope Pushdown']},
    {n:'Deadlift',muscles:['Back','Hamstrings'],exercises:['Deadlift','Pull-Ups','T-Bar Row','Romanian Deadlift','Face Pull','Cable Curl']},
    {n:'Accessory',muscles:['All'],exercises:['Dumbbell Bench Press','Arnold Press','Dumbbell Row','Leg Press','Incline Dumbbell Curl','Skull Crusher']},
  ]},
  glute:{n:'Glute Focus',days:4,label:'Glute Focus - 4 days/week',schedule:[
    {n:'Glute A',muscles:['Glutes','Hamstrings'],exercises:['Hip Thrust','Romanian Deadlift','Glute Bridge','Walking Lunges','Lying Leg Curl','Calf Raise']},
    {n:'Upper',muscles:['Back','Shoulders','Arms'],exercises:['Lat Pulldown','Dumbbell Row','Lateral Raise','Cable Curl','Rope Pushdown','Face Pull']},
    {n:'Glute B',muscles:['Glutes','Quads'],exercises:['Bulgarian Split Squat','Hip Thrust','Leg Press','Leg Extension','Goblet Squat','Hanging Leg Raise']},
    {n:'Full Body',muscles:['All'],exercises:['Barbell Squat','Incline Dumbbell Press','Barbell Row','Romanian Deadlift','Arnold Press','Plank']},
  ]},
  cali:{n:'Calisthenics',days:4,label:'Calisthenics - 4 days/week',schedule:[
    {n:'Push',muscles:['Chest','Shoulders','Triceps'],exercises:['Push-Ups','Diamond Push-Up','Chest Dips','Tricep Dips']},
    {n:'Pull',muscles:['Back','Biceps'],exercises:['Pull-Ups','Hanging Leg Raise']},
    {n:'Legs',muscles:['Quads','Glutes','Hamstrings'],exercises:['Goblet Squat','Walking Lunges','Glute Bridge','Calf Raise']},
    {n:'Core',muscles:['Core','Abs'],exercises:['Plank','Ab Wheel','Russian Twist','Leg Raise','Hanging Leg Raise']},
  ]},
};

/* === WORKOUT ENGINE === */
var WE={
  getSplitDay:function(){var sp=SPLITS[S.g('training.split')]||SPLITS.ppl;return sp.schedule[((S.g('training.day')||1)-1)%sp.schedule.length];},
  getWorkout:function(){var day=this.getSplitDay();if(!day)return[];var goal=S.g('user.goal')||'hypertrophy';return day.exercises.map(function(name){var ex=exById(name);var prev=WE.getPrev(name);var sets=goal==='strength'?(ex.diff>=2?5:4):ex.diff>=2?4:3;var reps=goal==='strength'?'3-5':goal==='hypertrophy'?'8-12':goal==='fat_loss'?'12-15':'6-8';var w=WE.suggestW(ex);if(prev&&prev.sets&&prev.sets[0])w=prev.sets[0].weight;if(prev&&prev.sets&&prev.sets.every(function(s){return s.done;}))w=Math.round(w*1.025*2)/2;return{n:ex.n,em:ex.em||'💪',pri:ex.pri,sec:ex.sec,cues:ex.cues,alts:ex.alts,bw:ex.bw,diff:ex.diff,sets:sets,reps:reps,weight:w,prev:prev};});},
  suggestW:function(ex){var bw=S.g('user.weight')||75;var g=S.g('user.gender')||'male';var exp=S.g('user.exp')||'intermediate';var m=exp==='beginner'?.42:exp==='intermediate'?.67:.9;if(g==='female')m*=.65;var map={'Barbell Bench Press':bw*.75,'Barbell Squat':bw,'Deadlift':bw*1.2,'Overhead Press':bw*.5,'Barbell Row':bw*.7,'Romanian Deadlift':bw*.85,'Hip Thrust':bw,'Leg Press':bw*1.5};return Math.round((map[ex.n]||(bw*.4))*m/2.5)*2.5;},
  getPrev:function(name){var ws=S.g('workouts')||[];for(var i=ws.length-1;i>=0;i--){var exs=ws[i].exercises||[];for(var j=0;j<exs.length;j++){if(exs[j].name===name&&exs[j].sets&&exs[j].sets.length)return exs[j];}}return null;},
  calcVol:function(sets){return sets.filter(function(s){return s.done;}).reduce(function(a,s){return a+(s.weight*s.reps);},0);},
  epley:function(w,r){return r===1?w:Math.round(w*(1+r/30));},
  checkPR:function(name,w,r){var ws=S.g('workouts')||[];var best=0;ws.forEach(function(wo){(wo.exercises||[]).forEach(function(ex){if(ex.name===name)(ex.sets||[]).forEach(function(s){if(s.done){var e=WE.epley(s.weight,s.reps);if(e>best)best=e;}});});});return WE.epley(w,r)>best&&best>0;},
  nextDay:function(){var sp=SPLITS[S.g('training.split')]||SPLITS.ppl;var cur=S.g('training.day')||1;S.set('training.day',cur>=sp.days?1:cur+1);},
  getStreak:function(){var ws=S.g('workouts')||[];if(!ws.length)return 0;var now=new Date();var streak=0;var dates=ws.map(function(w){return w.date.slice(0,10);}).filter(function(v,i,a){return a.indexOf(v)===i;}).sort().reverse();for(var i=0;i<dates.length;i++){var diff=Math.round((now-new Date(dates[i]))/864e5);if(diff===i||diff===i+1)streak++;else break;}return streak;},
  getWeekVol:function(){var ws=S.g('workouts')||[];var cutoff=new Date();cutoff.setDate(cutoff.getDate()-7);return ws.filter(function(w){return new Date(w.date)>cutoff;}).reduce(function(a,w){return a+(w.totalVol||0);},0);},
  bmi:function(){var w=S.g('user.weight')||75;var h=(S.g('user.height')||175)/100;return Math.round(w/(h*h)*10)/10;},
  bmr:function(){var w=S.g('user.weight')||75;var h=S.g('user.height')||175;var a=S.g('user.age')||25;var g=S.g('user.gender')||'male';return g==='male'?Math.round(10*w+6.25*h-5*a+5):Math.round(10*w+6.25*h-5*a-161);},
};

/* === AI ENGINE === */
var AI={
  readiness:function(){var r=S.g('recovery')||{};var s=100;s-=Math.max(0,(8-(r.sleep||7.5))*8);s-=(r.soreness||3)*5;s-=(r.stress||4)*3;s+=((r.energy||7)-5)*3;return Math.max(0,Math.min(100,Math.round(s)));},
  rl:function(s){if(s>=85)return{l:'Peak',c:'#00ff88',bg:'rgba(0,255,136,.08)'};if(s>=70)return{l:'Ready',c:'#00d5ff',bg:'rgba(0,213,255,.08)'};if(s>=50)return{l:'Moderate',c:'#ffb347',bg:'rgba(255,179,71,.08)'};return{l:'Rest',c:'#ff5f6d',bg:'rgba(255,95,109,.08)'};},
  coachMsg:function(){var s=this.readiness();if(s>=85)return'Readiness is at peak. Today is the perfect day to chase PRs and push hard.';if(s>=70)return'You are ready to train. Stick to your planned weights and listen to your body.';if(s>=50)return'Moderate readiness. Reduce intensity 10-15% and focus on quality movement today.';return'Low readiness. Consider active recovery, mobility work, or a full rest day.';},
  insights:function(){var r=S.g('recovery')||{};var s=this.readiness();var msgs=[];if((r.sleep||7.5)<6.5)msgs.push({t:'Sleep Debt',m:'Less than 6.5h detected. Recovery is compromised - reduce volume today.',i:'😴',c:'#ff5f6d'});else if((r.sleep||7.5)>=8)msgs.push({t:'Well Rested',m:'8+ hours logged. Excellent base for high performance today.',i:'⚡',c:'#00ff88'});if((r.soreness||3)>=7)msgs.push({t:'High Soreness',m:'Focus on different muscle groups or reduce intensity significantly.',i:'💊',c:'#ffb347'});if(s>=85)msgs.push({t:'Peak Window',m:'All metrics optimal. Push hard and track PRs today.',i:'🔥',c:'#00ff88'});if(WE.getStreak()>=5)msgs.push({t:'Deload Signal',m:WE.getStreak()+' consecutive days. Plan a deload week soon.',i:'⚠️',c:'#ffb347'});if((r.hydration||2.5)<2)msgs.push({t:'Hydration Low',m:'Drink more water. Performance drops significantly when dehydrated.',i:'💧',c:'#00d5ff'});if(!msgs.length)msgs.push({t:'On Track',m:'Recovery metrics look solid. Stay consistent and trust the process.',i:'✅',c:'#00d5ff'});return msgs.slice(0,3);},
  muscleStatus:function(){var ws=S.g('workouts')||[];var groups={Chest:null,Back:null,Shoulders:null,Legs:null,Arms:null,Core:null};var now=new Date();ws.slice(-14).forEach(function(wo){var hrs=(now-new Date(wo.date))/36e5;(wo.exercises||[]).forEach(function(ex){var e=exById(ex.name);var mu=(e.pri||'')+','+(e.sec||'');if(/chest/i.test(mu))groups.Chest=Math.min(groups.Chest||999,hrs);if(/back|lat|trap/i.test(mu))groups.Back=Math.min(groups.Back||999,hrs);if(/delt|shoulder/i.test(mu))groups.Shoulders=Math.min(groups.Shoulders||999,hrs);if(/quad|hamstring|glute|calf/i.test(mu))groups.Legs=Math.min(groups.Legs||999,hrs);if(/bicep|tricep/i.test(mu))groups.Arms=Math.min(groups.Arms||999,hrs);if(/core|ab/i.test(mu))groups.Core=Math.min(groups.Core||999,hrs);});});return Object.keys(groups).map(function(m){var hrs=groups[m];if(!hrs||hrs===999)return{m:m,s:'fresh',l:'Ready',pct:100};if(hrs<24)return{m:m,s:'tired',l:'Recovering',pct:Math.round(hrs/48*100)};if(hrs<48)return{m:m,s:'moderate',l:'Moderate',pct:Math.round(hrs/48*100)};return{m:m,s:'fresh',l:'Ready',pct:100};});},
};

/* === ACHIEVEMENTS === */
var ACHS=[
  {id:'first',n:'First Step',d:'Log your first workout',i:'🎯',check:function(){return(S.g('workouts')||[]).length>=1;}},
  {id:'s3',n:'Hat Trick',d:'3 day streak',i:'🔥',check:function(){return WE.getStreak()>=3;}},
  {id:'s7',n:'Week Warrior',d:'7 day streak',i:'⚡',check:function(){return WE.getStreak()>=7;}},
  {id:'s30',n:'Iron Will',d:'30 day streak',i:'🏆',check:function(){return WE.getStreak()>=30;}},
  {id:'w10',n:'Consistent',d:'10 workouts',i:'💪',check:function(){return(S.g('workouts')||[]).length>=10;}},
  {id:'w50',n:'Dedicated',d:'50 workouts',i:'🥇',check:function(){return(S.g('workouts')||[]).length>=50;}},
  {id:'pr1',n:'Record Breaker',d:'Set your first PR',i:'🏅',check:function(){return(S.g('workouts')||[]).some(function(w){return w.prCount>0;});}},
  {id:'pr10',n:'PR Machine',d:'10 total PRs',i:'🔱',check:function(){return(S.g('workouts')||[]).reduce(function(a,w){return a+(w.prCount||0);},0)>=10;}},
  {id:'met5',n:'Body Tracker',d:'Log 5 body metrics',i:'📏',check:function(){return(S.g('metrics')||[]).length>=5;}},
];
function checkAchs(){var earned=S.g('achievements')||[];var changed=false;ACHS.forEach(function(a){if(earned.indexOf(a.id)<0&&a.check()){earned.push(a.id);changed=true;setTimeout(function(){toast('Unlocked: '+a.n,'trophy');},600);}});if(changed)S.set('achievements',earned);}

/* === BODY AVATAR === */
var _bodyView='front';
function toggleBodyView(){_bodyView=_bodyView==='front'?'back':'front';go('body');}
function bodyAvatar(gender,muscles,view){
  var g=gender||'male';
  function mc(name){var found=muscles.find(function(m){return m.m===name;});if(!found||found.s==='fresh')return'rgba(0,213,255,.22)';if(found.s==='tired')return'rgba(255,95,109,.65)';return'rgba(255,179,71,.45)';}
  var chC=mc('Chest'),bkC=mc('Back'),lgC=mc('Legs'),shC=mc('Shoulders'),arC=mc('Arms'),coC=mc('Core');
  var sk=g==='female'?'#c4956a':'#a07252';var bs='rgba(0,213,255,.45)';
  var svg='<svg viewBox="0 0 120 260" xmlns="http://www.w3.org/2000/svg" style="height:210px;filter:drop-shadow(0 0 18px rgba(0,213,255,.25))">';
  svg+='<defs><radialGradient id="sg" cx="50%" cy="30%"><stop offset="0%" stop-color="#1a1a2e"/><stop offset="100%" stop-color="#0a0a14"/></radialGradient></defs>';
  if(view==='front'){
    svg+='<ellipse cx="60" cy="28" rx="17" ry="19" fill="'+sk+'" stroke="'+bs+'" stroke-width="1.2"/>';
    svg+='<rect x="44" y="46" width="32" height="6" rx="3" fill="'+sk+'"/>';
    svg+='<path d="M31,52 Q26,68 29,118 Q33,128 60,130 Q87,128 91,118 Q94,68 89,52 Z" fill="url(#sg)" stroke="'+bs+'" stroke-width="1.2"/>';
    svg+='<ellipse cx="47" cy="70" rx="13" ry="9" fill="'+chC+'" opacity=".85"/><ellipse cx="73" cy="70" rx="13" ry="9" fill="'+chC+'" opacity=".85"/>';
    svg+='<rect x="50" y="83" width="8" height="6" rx="2" fill="'+coC+'" opacity=".75"/><rect x="62" y="83" width="8" height="6" rx="2" fill="'+coC+'" opacity=".75"/>';
    svg+='<rect x="50" y="92" width="8" height="6" rx="2" fill="'+coC+'" opacity=".7"/><rect x="62" y="92" width="8" height="6" rx="2" fill="'+coC+'" opacity=".7"/>';
    svg+='<rect x="50" y="101" width="8" height="6" rx="2" fill="'+coC+'" opacity=".6"/><rect x="62" y="101" width="8" height="6" rx="2" fill="'+coC+'" opacity=".6"/>';
    svg+='<ellipse cx="27" cy="66" rx="9" ry="8" fill="'+shC+'" stroke="'+bs+'" stroke-width="1"/><ellipse cx="93" cy="66" rx="9" ry="8" fill="'+shC+'" stroke="'+bs+'" stroke-width="1"/>';
    svg+='<path d="M20,74 Q14,93 17,118 Q19,123 24,123 Q29,123 31,118 Q33,93 27,74 Z" fill="'+arC+'" stroke="'+bs+'" stroke-width="1"/>';
    svg+='<path d="M100,74 Q106,93 103,118 Q101,123 96,123 Q91,123 89,118 Q87,93 93,74 Z" fill="'+arC+'" stroke="'+bs+'" stroke-width="1"/>';
    svg+='<path d="M17,118 Q14,138 16,152 Q18,156 23,156 Q28,156 30,152 Q32,138 29,118 Z" fill="'+sk+'" stroke="'+bs+'" stroke-width="1"/>';
    svg+='<path d="M103,118 Q106,138 104,152 Q102,156 97,156 Q92,156 90,152 Q88,138 91,118 Z" fill="'+sk+'" stroke="'+bs+'" stroke-width="1"/>';
    svg+='<path d="M29,128 Q25,133 27,143 Q35,150 60,152 Q85,150 93,143 Q95,133 91,128 Z" fill="'+lgC+'" stroke="'+bs+'" stroke-width="1.2"/>';
    svg+='<path d="M31,150 Q27,173 29,202 Q31,212 39,212 Q47,212 49,202 Q51,173 47,150 Z" fill="'+lgC+'" stroke="'+bs+'" stroke-width="1"/>';
    svg+='<path d="M89,150 Q93,173 91,202 Q89,212 81,212 Q73,212 71,202 Q69,173 73,150 Z" fill="'+lgC+'" stroke="'+bs+'" stroke-width="1"/>';
    svg+='<path d="M29,202 Q26,220 28,232 Q30,237 38,237 Q46,237 48,232 Q50,220 47,202 Z" fill="'+sk+'" stroke="'+bs+'" stroke-width="1"/>';
    svg+='<path d="M91,202 Q94,220 92,232 Q90,237 82,237 Q74,237 72,232 Q70,220 73,202 Z" fill="'+sk+'" stroke="'+bs+'" stroke-width="1"/>';
    svg+='<ellipse cx="37" cy="239" rx="10" ry="5" fill="'+sk+'"/><ellipse cx="83" cy="239" rx="10" ry="5" fill="'+sk+'"/>';
  } else {
    svg+='<ellipse cx="60" cy="28" rx="17" ry="19" fill="'+sk+'" stroke="'+bs+'" stroke-width="1.2"/>';
    svg+='<rect x="44" y="46" width="32" height="6" rx="3" fill="'+sk+'"/>';
    svg+='<path d="M31,52 Q26,68 29,118 Q33,128 60,130 Q87,128 91,118 Q94,68 89,52 Z" fill="url(#sg)" stroke="'+bs+'" stroke-width="1.2"/>';
    svg+='<path d="M36,58 Q31,78 34,103 Q41,113 56,113 Q60,110 60,110 Q60,110 64,113 Q79,113 86,103 Q89,78 84,58 Z" fill="'+bkC+'" opacity=".72"/>';
    svg+='<path d="M42,52 Q60,60 78,52 Q78,68 60,70 Q42,68 42,52 Z" fill="'+shC+'" opacity=".65"/>';
    svg+='<ellipse cx="27" cy="66" rx="9" ry="8" fill="'+shC+'" stroke="'+bs+'" stroke-width="1"/><ellipse cx="93" cy="66" rx="9" ry="8" fill="'+shC+'" stroke="'+bs+'" stroke-width="1"/>';
    svg+='<path d="M20,74 Q14,93 17,118 Q19,123 24,123 Q29,123 31,118 Q33,93 27,74 Z" fill="'+arC+'" stroke="'+bs+'" stroke-width="1"/>';
    svg+='<path d="M100,74 Q106,93 103,118 Q101,123 96,123 Q91,123 89,118 Q87,93 93,74 Z" fill="'+arC+'" stroke="'+bs+'" stroke-width="1"/>';
    svg+='<path d="M17,118 Q14,138 16,152 Q18,156 23,156 Q28,156 30,152 Q32,138 29,118 Z" fill="'+sk+'" stroke="'+bs+'" stroke-width="1"/>';
    svg+='<path d="M103,118 Q106,138 104,152 Q102,156 97,156 Q92,156 90,152 Q88,138 91,118 Z" fill="'+sk+'" stroke="'+bs+'" stroke-width="1"/>';
    svg+='<ellipse cx="46" cy="135" rx="15" ry="13" fill="'+lgC+'" opacity=".85"/><ellipse cx="74" cy="135" rx="15" ry="13" fill="'+lgC+'" opacity=".85"/>';
    svg+='<path d="M31,148 Q27,173 29,202 Q31,212 39,212 Q47,212 49,202 Q51,173 47,148 Z" fill="'+lgC+'" stroke="'+bs+'" stroke-width="1"/>';
    svg+='<path d="M89,148 Q93,173 91,202 Q89,212 81,212 Q73,212 71,202 Q69,173 73,148 Z" fill="'+lgC+'" stroke="'+bs+'" stroke-width="1"/>';
    svg+='<path d="M29,202 Q26,220 28,232 Q30,237 38,237 Q46,237 48,232 Q50,220 47,202 Z" fill="'+sk+'" stroke="'+bs+'" stroke-width="1"/>';
    svg+='<path d="M91,202 Q94,220 92,232 Q90,237 82,237 Q74,237 72,232 Q70,220 73,202 Z" fill="'+sk+'" stroke="'+bs+'" stroke-width="1"/>';
    svg+='<ellipse cx="37" cy="239" rx="10" ry="5" fill="'+sk+'"/><ellipse cx="83" cy="239" rx="10" ry="5" fill="'+sk+'"/>';
  }
  svg+='</svg>';return svg;
}

/* === HTML HELPERS === */
function topbar(t,sub,right){return '<div class="topbar"><div>'+(sub?'<div class="tb-sub">'+sub+'</div>':'')+'<div class="tb-title">'+t+'</div></div>'+(right||'')+'</div>';}
function sh(t,a,act){return '<div class="sh"><div class="sh-t">'+t+'</div>'+(a?'<span class="sh-a" onclick="'+act+'">'+a+'</span>':'')+'</div>';}
function card(c,extra,click){return '<div class="card'+(extra?' '+extra:'')+'"'+(click?' onclick="'+click+'"':'')+'>'+c+'</div>';}
function statBox(v,l,col,click){return '<div class="stat'+(col?' '+col:'')+'"'+(click?' onclick="'+click+'" style="cursor:pointer"':'')+' ><div class="sv">'+v+'</div><div class="sl">'+l+'</div></div>';}
function insCard(ins){return card('<div style="display:flex;align-items:flex-start;gap:13px"><span style="font-size:26px">'+ins.i+'</span><div><div style="font-size:14px;font-weight:700;color:'+ins.c+';margin-bottom:4px">'+ins.t+'</div><p style="font-size:13px;line-height:1.55;margin:0;color:rgba(255,255,255,.6)">'+ins.m+'</p></div></div>');}

function achHTML(){
  var earned=S.g('achievements')||[];
  return ACHS.map(function(a){
    var e=earned.indexOf(a.id)>=0;
    var r='<div class="ach'+(e?' earn':'')+'">';
    r+='<div class="ach-ic"'+(e?'':' style="opacity:.25"')+'>'+a.i+'</div>';
    r+='<div style="flex:1"><div style="font-size:14px;font-weight:700;color:'+(e?'#fff':'rgba(255,255,255,0.3)')+'">'+a.n+'</div><div style="font-size:12px;color:rgba(255,255,255,0.35)">'+a.d+'</div></div>';
    if(e)r+='<span style="color:#00ff88;font-size:18px">&#10003;</span>';
    r+='</div>';return r;
  }).join('');
}
/* === SCREENS === */

/* WELCOME */
reg('welcome',function(){
  var h='<div class="welcome">';
  h+='<div class="logo">&#9889;</div>';
  h+='<div class="w-title">FitnessOS<br>Pro</div>';
  h+='<p class="w-sub">The intelligent fitness system that learns, adapts, and grows with you.</p>';
  h+='<div class="feat-row"><span class="feat">AI Coach</span><span class="feat">Body Clone</span><span class="feat">Smart Splits</span><span class="feat">PR Tracking</span><span class="feat">Recovery</span><span class="feat">Analytics</span></div>';
  h+='<div style="width:100%;max-width:340px;padding:0 0 50px">';
  h+='<button class="btn btn-p mb12" onclick="go(\'onboard\')">Get Started &rarr;</button>';
  h+='<button class="btn btn-s" onclick="go(\'home\')">Continue with Saved Data</button>';
  h+='</div></div>';
  return h;
});

/* ONBOARDING */
var _obStep=0,_obData={};
var _obSteps=[
  {q:'What is your name?',sub:'We will personalise everything for you.',type:'text',key:'name',ph:'Your name'},
  {q:'Your gender?',sub:'Used for your personalised avatar and recommendations.',type:'choice',key:'gender',opts:[{v:'male',i:'👨',l:'Male',s:''},{v:'female',i:'👩',l:'Female',s:''},{v:'neutral',i:'🧑',l:'Prefer not to say',s:''}]},
  {q:'Your primary goal?',sub:'We will design your training program around this.',type:'choice',key:'goal',opts:[
    {v:'hypertrophy',i:'💪',l:'Build Muscle',s:'Maximize size and strength'},
    {v:'strength',i:'🏋️',l:'Get Stronger',s:'Focus on powerlifting and heavy lifts'},
    {v:'fat_loss',i:'🔥',l:'Lose Fat',s:'Burn fat while preserving muscle'},
    {v:'athletic',i:'⚡',l:'Athletic Performance',s:'Speed, power, endurance'},
    {v:'recomp',i:'🔄',l:'Body Recomposition',s:'Build muscle and lose fat simultaneously'},
  ]},
  {q:'Training experience?',sub:'Honest answer leads to better programming.',type:'choice',key:'exp',opts:[
    {v:'beginner',i:'🌱',l:'Beginner',s:'Less than 1 year of consistent training'},
    {v:'intermediate',i:'📈',l:'Intermediate',s:'1 to 3 years of consistent training'},
    {v:'advanced',i:'🏆',l:'Advanced',s:'3+ years with good technique'},
  ]},
  {q:'Where do you train?',sub:'We will select appropriate exercises for your setup.',type:'choice',key:'location',opts:[
    {v:'full',i:'🏋️',l:'Full Gym',s:'All equipment available'},
    {v:'home_dumb',i:'🏠',l:'Home - Dumbbells',s:'Dumbbells and basic kit only'},
    {v:'home_bw',i:'🤸',l:'Home - Bodyweight',s:'No equipment needed'},
    {v:'hotel',i:'🏨',l:'Hotel / Minimal',s:'Bands, light dumbbells, bodyweight'},
  ]},
  {q:'Choose your training split',sub:'You can change this anytime in Settings.',type:'choice',key:'split',opts:[
    {v:'ppl',i:'🔄',l:'Push Pull Legs',s:'6 days/week — Best for hypertrophy'},
    {v:'ul',i:'⬆️',l:'Upper Lower',s:'4 days/week — Great balance of strength and size'},
    {v:'fb',i:'🌟',l:'Full Body',s:'3 days/week — Perfect for beginners'},
    {v:'bro',i:'💯',l:'Bro Split',s:'5 days/week — Classic bodybuilding'},
    {v:'str',i:'🏅',l:'Strength Focus',s:'4 days/week — Big lifts centred'},
    {v:'glute',i:'🍑',l:'Glute Focus',s:'4 days/week — Lower body emphasis'},
    {v:'cali',i:'🤸',l:'Calisthenics',s:'4 days/week — Bodyweight mastery'},
  ]},
  {q:'Your body stats',sub:'Used for weight recommendations and progress tracking.',type:'stats',key:'stats'},
];
reg('onboard',function(){
  var step=_obSteps[_obStep];
  var pct=Math.round((_obStep/_obSteps.length)*100);
  var h='<div class="ob">';
  h+='<div class="ob-prog"><div class="ob-bar" style="width:'+pct+'%"></div></div>';
  h+='<p style="font-size:12px;color:rgba(255,255,255,0.3)">Step '+(_obStep+1)+' of '+_obSteps.length+'</p>';
  h+='<div class="ob-title">'+step.q+'</div>';
  if(step.sub)h+='<p class="ob-sub">'+step.sub+'</p>';
  if(step.type==='text'){
    h+='<div style="margin-top:26px"><input id="ob-inp" class="field" style="font-size:22px;padding:17px" placeholder="'+(step.ph||'')+'" value="'+(_obData[step.key]||'')+'" oninput="obInput(this.value)"></div>';
  }
  if(step.type==='choice'){
    h+='<div class="ob-opts">';
    step.opts.forEach(function(o){
      var sel=_obData[step.key]===o.v;
      h+='<div class="ob-opt'+(sel?' on':'')+'" onclick="obSel(\''+o.v+'\')">';
      h+='<span class="ob-oi">'+o.i+'</span><div><div class="ob-ot">'+o.l+'</div>';
      if(o.s)h+='<div class="ob-os">'+o.s+'</div>';
      h+='</div></div>';
    });
    h+='</div>';
  }
  if(step.type==='stats'){
    h+='<div style="margin-top:22px">';
    h+='<div class="g2" style="gap:10px;margin-bottom:10px">';
    h+='<div><label class="field-label">Age</label><input class="field" type="number" placeholder="25" value="'+(_obData.age||'')+'" oninput="obD(\'age\',this.value)"></div>';
    h+='<div><label class="field-label">Units</label><select class="field" onchange="obD(\'units\',this.value)"><option value="metric"'+((_obData.units||'metric')==='metric'?' selected':'')+'>kg / cm</option><option value="imperial"'+(_obData.units==='imperial'?' selected':'')+'>lbs / in</option></select></div>';
    h+='<div><label class="field-label">Weight</label><input class="field" type="number" placeholder="75" value="'+(_obData.weight||'')+'" oninput="obD(\'weight\',this.value)"></div>';
    h+='<div><label class="field-label">Height (cm)</label><input class="field" type="number" placeholder="175" value="'+(_obData.height||'')+'" oninput="obD(\'height\',this.value)"></div>';
    h+='</div></div>';
  }
  h+='<div class="ob-act">';
  h+='<button class="btn btn-p mb12" onclick="obNext()">'+(_obStep<_obSteps.length-1?'Continue &rarr;':'Start Training &#9889;')+'</button>';
  if(_obStep>0)h+='<button class="btn btn-s" onclick="obBack()">&larr; Back</button>';
  h+='</div></div>';
  return h;
});
function obInput(v){_obData[_obSteps[_obStep].key]=v;}
function obSel(v){_obData[_obSteps[_obStep].key]=v;go('onboard');}
function obD(k,v){_obData[k]=v;}
function obNext(){
  var step=_obSteps[_obStep];
  if(step.type==='text'&&!_obData[step.key]){toast('Please enter your '+step.key,'warn');return;}
  if(step.type==='choice'&&!_obData[step.key]){toast('Please make a selection','warn');return;}
  if(_obStep<_obSteps.length-1){_obStep++;go('onboard');return;}
  var u=S.g('user')||{};
  ['name','gender','goal','exp'].forEach(function(k){if(_obData[k])u[k]=_obData[k];});
  if(_obData.age)u.age=parseInt(_obData.age);
  if(_obData.weight)u.weight=parseFloat(_obData.weight);
  if(_obData.height)u.height=parseFloat(_obData.height);
  if(_obData.units)u.units=_obData.units;
  var locMap={full:['barbell','dumbbell','cables','machine','bar'],home_dumb:['dumbbell','bar'],home_bw:['bar'],hotel:['dumbbell','bands']};
  u.equipment=locMap[_obData.location]||locMap.full;
  S.set('user',u);
  if(_obData.split)S.set('training.split',_obData.split);
  S.set('onboarding',true);S.set('training.day',1);
  _obStep=0;_obData={};
  go('home');toast('Welcome to FitnessOS, '+(u.name||'Athlete')+'!');
}
function obBack(){if(_obStep>0){_obStep--;go('onboard');}}

/* HOME */
reg('home',function(){
  var u=S.g('user')||{};var ws=S.g('workouts')||[];
  var readiness=AI.readiness();var rl=AI.rl(readiness);
  var streak=WE.getStreak();var wvol=WE.getWeekVol();
  var insights=AI.insights();var day=WE.getSplitDay();var muscles=AI.muscleStatus();
  var hr=new Date().getHours();
  var greeting=hr<12?'Good Morning':hr<17?'Good Afternoon':'Good Evening';
  var h='';
  h+=topbar(u.name||'Athlete',greeting,'<div style="display:flex;gap:8px"><div class="tb-ic" onclick="go(\'recovery\')">💊</div><div class="tb-ic" onclick="go(\'settings\')">⚙️</div></div>');
  h+='<div class="screen">';
  h+='<div class="card card-glow" style="margin-top:12px;background:'+rl.bg+'">';
  h+='<div class="ch"><span class="ct">Readiness Score</span><span class="cbadge b-c">'+rl.l+'</span></div>';
  h+='<div style="display:flex;align-items:center;gap:18px">';
  h+='<div><div class="hero-n">'+readiness+'</div><div class="hero-l">out of 100</div></div>';
  h+='<p style="flex:1;font-size:13px;color:rgba(255,255,255,.6);line-height:1.5">'+AI.coachMsg()+'</p></div></div>';
  h+=sh('Todays Workout');
  if(day){
    h+='<div class="card card-tap" onclick="go(\'workout\')">';
    h+='<div style="display:flex;align-items:center;justify-content:space-between">';
    h+='<div><div style="font-size:20px;font-weight:800;margin-bottom:3px">'+day.n+'</div>';
    h+='<div style="font-size:13px;color:rgba(255,255,255,.35)">'+(day.muscles||[]).join(' &middot; ')+'</div></div>';
    h+='<div style="width:52px;height:52px;background:linear-gradient(135deg,#00d5ff,#7c6fff);border-radius:18px;display:flex;align-items:center;justify-content:center;font-size:26px">💪</div></div>';
    h+='<div style="margin-top:11px;display:flex;gap:6px;flex-wrap:wrap">';
    day.exercises.slice(0,4).forEach(function(e){h+='<span style="padding:4px 9px;border-radius:20px;background:rgba(255,255,255,.06);font-size:12px;color:rgba(255,255,255,.55)">'+e+'</span>';});
    if(day.exercises.length>4)h+='<span style="padding:4px 9px;border-radius:20px;background:rgba(0,213,255,.1);font-size:12px;color:#00d5ff">+'+(day.exercises.length-4)+' more</span>';
    h+='</div><button class="btn btn-p" style="margin-top:12px">Start Workout &rarr;</button></div>';
  }
  h+=sh('This Week');
  h+='<div style="padding:0 12px 12px"><div class="g4">';
  h+=statBox(ws.length,'Workouts','cyan');h+=statBox(streak,'Streak','green');
  h+=statBox(Math.round(wvol/1000)+'t','Volume','purple');h+=statBox((S.g('achievements')||[]).length,'Badges');
  h+='</div></div>';
  h+=sh('Muscle Recovery','Body &rarr;','go(\'body\')');
  h+='<div class="card"><div style="display:flex;gap:7px;flex-wrap:wrap">';
  muscles.forEach(function(m){h+='<span class="mchip '+m.s+'">'+m.m+': '+m.l+'</span>';});
  h+='</div></div>';
  h+=sh('AI Insights','Coach &rarr;','go(\'ai\')');
  insights.forEach(function(ins){h+=insCard(ins);});
  h+=sh('Quick Actions');
  h+='<div style="padding:0 12px 12px"><div class="g2">';
  h+='<button class="btn btn-s" onclick="go(\'body\')" style="font-size:13px">🧬 Body Clone</button>';
  h+='<button class="btn btn-s" onclick="go(\'exercises\')" style="font-size:13px">📚 Exercises</button>';
  h+='<button class="btn btn-g" onclick="go(\'recovery\')" style="font-size:13px">😴 Recovery</button>';
  h+='<button class="btn btn-s" onclick="go(\'progress\')" style="font-size:13px">📈 Progress</button>';
  h+='</div></div>';
  if(ws.length){
    h+=sh('Recent Workouts','All &rarr;','go(\'progress\')');h+='<div class="card">';
    ws.slice(-3).reverse().forEach(function(w){
      h+='<div class="exr"><div class="ex-ic">💪</div>';
      h+='<div class="ex-inf"><div class="ex-nm">'+(w.splitDay||'Workout')+'</div>';
      h+='<div class="ex-sub">'+new Date(w.date).toLocaleDateString('en',{weekday:'short',month:'short',day:'numeric'})+'</div></div>';
      h+='<div class="ex-tag">'+((w.exercises||[]).length)+' ex.</div></div>';
    });
    h+='</div>';
  }
  h+='<div style="height:18px"></div></div>';
  return h;
});

/* WORKOUT */
var _wkt=[],_wktOn=false,_restT=null,_restS=0,_restTot=90;
reg('workout',function(){
  if(!_wktOn||!_wkt.length){
    _wkt=WE.getWorkout().map(function(ex){
      var rn=parseInt((ex.reps||'8').split('-')[0]);
      var sets=Array.from({length:ex.sets},function(_,i){return{n:i+1,w:ex.weight,r:rn,rpe:7,done:false};});
      return{n:ex.n,em:ex.em||'💪',pri:ex.pri||'Muscles',sec:ex.sec||'',cues:ex.cues||'',alts:ex.alts||[],sets:sets,reps:ex.reps||'8-12',expanded:true,prev:ex.prev,bw:ex.bw};
    });
    _wktOn=true;
  }
  var day=WE.getSplitDay();var sp=SPLITS[S.g('training.split')]||SPLITS.ppl;var prog=wktProg();
  var h='';
  h+=topbar(day?day.n:'Workout',sp.n,'<button class="btn btn-g btn-sm" onclick="finishWkt()">Finish &#10003;</button>');
  h+='<div class="screen">';
  h+='<div style="padding:9px 12px;display:flex;align-items:center;gap:10px">';
  h+='<div style="flex:1;height:5px;background:#1e1e2a;border-radius:3px;overflow:hidden"><div id="wkt-pb" style="height:5px;background:linear-gradient(135deg,#00d5ff,#7c6fff);border-radius:3px;width:'+prog+'%;transition:width .4s"></div></div>';
  h+='<span style="font-size:12px;color:rgba(255,255,255,.35);font-weight:600">'+prog+'%</span></div>';
  _wkt.forEach(function(ex,ei){
    var dn=setsDone(ex);
    h+='<div class="card" style="margin-bottom:10px">';
    h+='<div style="display:flex;align-items:center;gap:11px;margin-bottom:'+(ex.expanded?13:0)+'px;cursor:pointer" onclick="tglEx('+ei+')">';
    h+='<div class="ex-ic">'+ex.em+'</div>';
    h+='<div style="flex:1"><div style="font-size:15px;font-weight:800">'+ex.n+'</div>';
    h+='<div style="font-size:11px;color:rgba(255,255,255,.35);margin-top:2px">'+ex.pri+' &middot; '+ex.sets.length+' sets &middot; '+ex.reps+'</div></div>';
    h+='<div style="text-align:right"><div style="font-size:16px;font-weight:800;color:'+(dn===ex.sets.length?'#00ff88':'#fff')+'">'+dn+'/'+ex.sets.length+'</div>';
    h+='<div style="font-size:10px;color:rgba(255,255,255,.3)">done</div></div></div>';
    if(ex.expanded){
      if(ex.prev&&ex.prev.sets&&ex.prev.sets[0]){
        h+='<div style="background:rgba(0,213,255,.06);border-radius:9px;padding:7px 11px;margin-bottom:9px;font-size:12px;color:rgba(255,255,255,.4)">Previous: '+ex.prev.sets[0].weight+'kg &times; '+ex.prev.sets[0].reps+' reps</div>';
      }
      h+='<div style="display:grid;grid-template-columns:34px 1fr 1fr 1fr 40px;gap:6px;padding:0 0 5px;margin-bottom:3px">';
      h+='<span></span>';
      h+='<span style="font-size:10px;color:rgba(255,255,255,.3);text-align:center;font-weight:700">KG</span>';
      h+='<span style="font-size:10px;color:rgba(255,255,255,.3);text-align:center;font-weight:700">REPS</span>';
      h+='<span style="font-size:10px;color:rgba(255,255,255,.3);text-align:center;font-weight:700">RPE</span>';
      h+='<span></span></div>';
      ex.sets.forEach(function(set,si){
        h+='<div class="set-row" id="sr'+ei+'x'+si+'">';
        h+='<div class="set-n'+(set.done?' done':'')+'">'+set.n+'</div>';
        h+='<input class="set-inp" type="number" value="'+set.w+'" step="2.5"'+(set.done?' disabled':'')+' oninput="sv('+ei+','+si+',0,this.value)">';
        h+='<input class="set-inp" type="number" value="'+set.r+'" step="1"'+(set.done?' disabled':'')+' oninput="sv('+ei+','+si+',1,this.value)">';
        h+='<input class="set-inp" type="number" value="'+set.rpe+'" step=".5" min="5" max="10"'+(set.done?' disabled':'')+' oninput="sv('+ei+','+si+',2,this.value)">';
        h+='<button class="set-chk'+(set.done?' done':'')+'" onclick="doneSet('+ei+','+si+')">';
        if(set.done)h+='<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
        h+='</button></div>';
      });
      h+='<div style="margin-top:9px;padding-top:9px;border-top:1px solid rgba(255,255,255,.05)">';
      h+='<div style="font-size:12px;color:rgba(255,255,255,.4);font-style:italic;margin-bottom:7px">'+ex.cues+'</div>';
      if(ex.alts&&ex.alts.length){
        h+='<div style="font-size:10px;color:rgba(255,255,255,.3);font-weight:700;letter-spacing:.08em;margin-bottom:5px">ALTERNATIVES</div>';
        h+='<div style="display:flex;gap:6px;flex-wrap:wrap">';
        ex.alts.slice(0,3).forEach(function(alt){
          h+='<span style="padding:4px 10px;border-radius:20px;background:rgba(124,111,255,.1);border:1px solid rgba(124,111,255,.25);font-size:11px;color:#7c6fff;cursor:pointer" onclick="swapEx('+ei+',\''+alt.replace(/\'/g,'&#39;')+'\')">'+alt+'</span>';
        });
        h+='</div>';
      }
      h+='</div>';
    }
    h+='</div>';
  });
  h+='<div class="rest-pop" id="rest-pop">';
  h+='<div style="font-size:36px;font-weight:900;color:#00d5ff;min-width:60px;font-variant-numeric:tabular-nums" id="rest-n">1:30</div>';
  h+='<div style="flex:1"><div style="font-size:13px;font-weight:700;margin-bottom:4px">Rest Timer</div>';
  h+='<div style="height:4px;background:#1e1e2a;border-radius:2px;overflow:hidden"><div id="rest-bar" style="height:4px;background:#00d5ff;border-radius:2px"></div></div></div>';
  h+='<button class="btn btn-s btn-sm" onclick="skipRest()">Skip</button></div>';
  h+='<div style="height:18px"></div></div>';
  return h;
});
function wktProg(){if(!_wkt.length)return 0;var tot=_wkt.reduce(function(a,e){return a+e.sets.length;},0);var dn=_wkt.reduce(function(a,e){return a+setsDone(e);},0);return tot?Math.round(dn/tot*100):0;}
function setsDone(ex){return ex.sets.filter(function(s){return s.done;}).length;}
function tglEx(ei){_wkt[ei].expanded=!_wkt[ei].expanded;go('workout');}
function sv(ei,si,k,v){var keys=['w','r','rpe'];_wkt[ei].sets[si][keys[k]]=parseFloat(v)||0;}
function swapEx(ei,altName){var e=exById(altName);var old=_wkt[ei];_wkt[ei]=Object.assign({},old,{n:e.n,em:e.em||'💪',pri:e.pri,sec:e.sec,cues:e.cues,alts:e.alts,bw:e.bw});toast('Swapped to '+e.n);go('workout');}
function doneSet(ei,si){
  var set=_wkt[ei].sets[si];set.done=!set.done;
  if(set.done){
    if(WE.checkPR(_wkt[ei].n,set.w,set.r)){
      var sr=document.getElementById('sr'+ei+'x'+si);
      if(sr){var fl=document.createElement('div');fl.className='pr-fl';fl.innerHTML='<span style="font-size:20px">🏆</span><span style="font-size:14px;font-weight:700;color:#00ff88">New PR! '+set.w+'kg x '+set.r+' reps ('+WE.epley(set.w,set.r)+'kg est. 1RM)</span>';sr.insertAdjacentElement('afterend',fl);setTimeout(function(){if(fl.parentNode)fl.parentNode.removeChild(fl);},5000);}
      toast('New Personal Record!','pr');
    }
    if(S.g('prefs.restTimer')!==false)startRest(S.g('prefs.restSecs')||90);
  }
  var pb=document.getElementById('wkt-pb');if(pb)pb.style.width=wktProg()+'%';
  var sr=document.getElementById('sr'+ei+'x'+si);
  if(sr){
    var sn=sr.querySelector('.set-n');if(sn)sn.className='set-n'+(set.done?' done':'');
    var btn=sr.querySelector('.set-chk');
    if(btn){btn.className='set-chk'+(set.done?' done':'');btn.innerHTML=set.done?'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>':'';}
    sr.querySelectorAll('.set-inp').forEach(function(inp){inp.disabled=set.done;});
  }
}
function startRest(s){_restTot=s;_restS=s;clearInterval(_restT);var el=document.getElementById('rest-pop');if(el)el.style.display='flex';updRest();_restT=setInterval(function(){_restS--;updRest();if(_restS<=0){clearInterval(_restT);var el=document.getElementById('rest-pop');if(el)el.style.display='none';}},1000);}
function updRest(){var m=Math.floor(_restS/60),s=_restS%60;var n=document.getElementById('rest-n');if(n)n.textContent=m+':'+(s<10?'0':'')+s;var b=document.getElementById('rest-bar');if(b)b.style.width=Math.round(_restS/_restTot*100)+'%';}
function skipRest(){clearInterval(_restT);var el=document.getElementById('rest-pop');if(el)el.style.display='none';}
function finishWkt(){
  if(!confirm('Save this workout?'))return;
  var exData=_wkt.map(function(ex){
    var sets=ex.sets.map(function(s){return{weight:s.w,reps:s.r,rpe:s.rpe,done:s.done};});
    return{name:ex.n,sets:sets,vol:ex.sets.filter(function(s){return s.done;}).reduce(function(a,s){return a+(s.w*s.r);},0),prCount:ex.sets.filter(function(s){return s.done&&WE.checkPR(ex.n,s.w,s.r);}).length};
  });
  var vol=exData.reduce(function(a,e){return a+e.vol;},0);
  var ws=S.g('workouts')||[];
  ws.push({date:new Date().toISOString(),splitDay:(WE.getSplitDay()||{}).n,exercises:exData,totalVol:vol,prCount:exData.reduce(function(a,e){return a+e.prCount;},0)});
  S.set('workouts',ws);WE.nextDay();_wktOn=false;_wkt=[];checkAchs();
  toast('Saved! '+Math.round(vol)+'kg total volume 💪');go('home');
}

/* EXERCISES */
var _exGrp='all',_exQ='';
reg('exercises',function(){
  var results=exSearch(_exQ,_exGrp);
  var h='';
  h+=topbar('Exercise Library',''+EX_ALL.length+' exercises');
  h+='<div class="screen">';
  h+='<div style="padding:10px 12px 0">';
  h+='<div style="position:relative"><span style="position:absolute;left:14px;top:50%;transform:translateY(-50%);font-size:16px;color:rgba(255,255,255,.3)">🔍</span>';
  h+='<input class="field" style="padding-left:40px" placeholder="Search exercises, muscles..." value="'+_exQ+'" oninput="exQ(this.value)"></div></div>';
  h+='<div class="scroll-row" style="margin:8px 0 4px">';
  [{v:'all',l:'All'},{v:'chest',l:'Chest'},{v:'back',l:'Back'},{v:'legs',l:'Legs'},{v:'shoulders',l:'Shoulders'},{v:'biceps',l:'Biceps'},{v:'triceps',l:'Triceps'},{v:'core',l:'Core'}].forEach(function(f){
    h+='<button class="pill'+(_exGrp===f.v?' on':'')+'" onclick="exGrp(\''+f.v+'\')">'+f.l+'</button>';
  });
  h+='</div>';
  h+='<div style="padding:2px 12px 6px;font-size:12px;color:rgba(255,255,255,.3)">'+results.length+' exercises</div>';
  h+='<div class="card">';
  if(!results.length){h+='<p style="color:rgba(255,255,255,.35);text-align:center;padding:18px">No exercises found</p>';}
  results.slice(0,50).forEach(function(e){
    h+='<div class="exr card-tap" onclick="showExDetail(\''+e.n.replace(/'/g,'\\x27')+'\')">';
    h+='<div class="ex-ic">'+e.em+'</div>';
    h+='<div class="ex-inf"><div class="ex-nm">'+e.n+'</div>';
    h+='<div class="ex-sub">'+e.pri+(e.sec?' &middot; '+e.sec:'')+'</div></div>';
    h+='<div style="font-size:11px;padding:3px 8px;border-radius:20px;background:rgba(255,255,255,.05);color:rgba(255,255,255,.4)">'+['Beg','Int','Adv'][e.diff-1]+'</div></div>';
  });
  h+='</div><div style="height:18px"></div></div>';
  return h;
});
function exQ(v){_exQ=v;go('exercises');}
function exGrp(v){_exGrp=v;go('exercises');}
function showExDetail(name){
  var e=exById(name);
  var m=document.createElement('div');m.className='overlay';m.id='ex-det';
  var h='<div class="sheet"><div class="sheet-handle"></div>';
  h+='<div style="display:flex;align-items:center;gap:13px;margin-bottom:18px">';
  h+='<div style="width:54px;height:54px;border-radius:18px;background:#1e1e2a;display:flex;align-items:center;justify-content:center;font-size:26px">'+e.em+'</div>';
  h+='<div><div style="font-size:20px;font-weight:800">'+e.n+'</div><div style="font-size:13px;color:rgba(255,255,255,.4)">'+e.pri+(e.sec?' &middot; '+e.sec:'')+'</div></div></div>';
  h+='<div class="g2" style="gap:10px;margin-bottom:14px">';
  h+='<div class="stat"><div class="sv" style="font-size:14px">'+['Beginner','Intermediate','Advanced'][e.diff-1]+'</div><div class="sl">Difficulty</div></div>';
  h+='<div class="stat"><div class="sv" style="font-size:13px">'+(e.bw?'Bodyweight':(e.eq||[]).join(', ')||'Any')+'</div><div class="sl">Equipment</div></div></div>';
  h+='<div style="font-size:11px;font-weight:700;letter-spacing:.1em;color:rgba(255,255,255,.4);text-transform:uppercase;margin-bottom:6px">COACHING CUES</div>';
  h+='<div class="ai-msg" style="margin-bottom:14px"><p>'+e.cues+'</p></div>';
  if(e.alts&&e.alts.length){
    h+='<div style="font-size:11px;font-weight:700;letter-spacing:.1em;color:rgba(255,255,255,.4);text-transform:uppercase;margin-bottom:7px">ALTERNATIVES</div>';
    h+='<div style="display:flex;gap:7px;flex-wrap:wrap;margin-bottom:14px">';
    e.alts.forEach(function(a){h+='<span style="padding:5px 12px;border-radius:20px;background:rgba(124,111,255,.1);border:1px solid rgba(124,111,255,.25);font-size:13px;color:#7c6fff">'+a+'</span>';});
    h+='</div>';
  }
  h+='<button class="btn btn-p mb12" onclick="document.getElementById(\'ex-det\').remove()">Close</button>';
  h+='</div>';
  m.innerHTML=h;m.addEventListener('click',function(ev){if(ev.target===m)m.remove();});document.body.appendChild(m);
}

/* PROGRESS */
reg('progress',function(){
  var ws=S.g('workouts')||[];var metrics=S.g('metrics')||[];
  var today=new Date().getDay();var last7=[0,0,0,0,0,0,0];var days=['S','M','T','W','T','F','S'];
  ws.forEach(function(w){var diff=Math.floor((new Date()-new Date(w.date))/864e5);if(diff<7)last7[(today-diff+7)%7]++;});
  var maxB=Math.max.apply(null,last7.concat([1]));
  var tVol=ws.reduce(function(a,w){return a+(w.totalVol||0);},0);
  var tPR=ws.reduce(function(a,w){return a+(w.prCount||0);},0);
  var h='';
  h+=topbar('Progress');
  h+='<div class="screen">';
  h+='<div style="padding:12px 12px 0"><div class="g2" style="gap:10px;margin-bottom:10px">';
  h+=statBox(ws.length,'Total Workouts','cyan');h+=statBox(WE.getStreak(),'Streak','green');
  h+=statBox(Math.round(tVol/1000)+'t','Total Volume','purple');h+=statBox(tPR,'Total PRs','red');
  h+='</div></div>';
  h+=sh('Training This Week');
  h+='<div class="card"><div class="bar-chart">';
  last7.forEach(function(v,i){var bh=Math.max(3,Math.round(v/maxB*74));h+='<div style="flex:1;display:flex;flex-direction:column;gap:4px;align-items:center"><div class="bar'+(v>0?' on':'')+'" style="width:100%;height:'+bh+'px"></div><div class="bar-l">'+days[(today-6+i+7)%7]+'</div></div>';});
  h+='</div></div>';
  if(tPR>0){
    h+=sh('Personal Records');h+='<div class="card">';
    ws.filter(function(w){return w.prCount>0;}).slice(-6).reverse().forEach(function(w){
      h+='<div class="exr"><div class="ex-ic">🏆</div><div class="ex-inf"><div class="ex-nm">'+(w.splitDay||'Workout')+'</div>';
      h+='<div class="ex-sub">'+new Date(w.date).toLocaleDateString()+'</div></div>';
      h+='<div class="ex-tag">'+w.prCount+' PR'+(w.prCount>1?'s':'')+'</div></div>';
    });
    h+='</div>';
  }
  h+=sh('Body Metrics','+ Add','logMetricModal()');
  h+='<div class="card">';
  if(!metrics.length){h+='<p style="color:rgba(255,255,255,.35);font-size:14px;padding:6px 0">No metrics yet. Start tracking your weight and measurements.</p>';}
  metrics.slice(-6).reverse().forEach(function(m){
    h+='<div class="exr"><div class="ex-ic">⚖️</div><div class="ex-inf"><div class="ex-nm">'+m.weight+(m.unit||'kg')+'</div>';
    h+='<div class="ex-sub">'+new Date(m.date).toLocaleDateString()+(m.bf?' &middot; '+m.bf+'% BF':'')+'</div></div>';
    if(m.bmi)h+='<div class="ex-tag">BMI '+m.bmi+'</div>';
    h+='</div>';
  });
  h+='<button class="btn btn-s" style="margin-top:10px" onclick="logMetricModal()">+ Log Today</button></div>';
  h+=sh('Achievements');h+=card(achHTML());
  h+='<div style="height:18px"></div></div>';
  return h;
});
function logMetricModal(){
  var u=S.g('user')||{};var m=document.createElement('div');m.className='overlay';m.id='met-modal';
  var h='<div class="sheet"><div class="sheet-handle"></div><div style="font-size:22px;font-weight:800;margin-bottom:18px">Log Body Metrics</div>';
  h+='<div class="g2" style="gap:10px">';
  h+='<div class="fw"><label class="field-label">Weight ('+( (u.units||'metric')==='imperial'?'lbs':'kg')+')</label><input class="field" type="number" id="m-w" step=".1" placeholder="75"></div>';
  h+='<div class="fw"><label class="field-label">Body Fat %</label><input class="field" type="number" id="m-bf" step=".1" placeholder="18"></div>';
  h+='<div class="fw"><label class="field-label">Chest (cm)</label><input class="field" type="number" id="m-chest" step=".5" placeholder="100"></div>';
  h+='<div class="fw"><label class="field-label">Waist (cm)</label><input class="field" type="number" id="m-waist" step=".5" placeholder="82"></div>';
  h+='<div class="fw"><label class="field-label">Hips (cm)</label><input class="field" type="number" id="m-hips" step=".5" placeholder="100"></div>';
  h+='<div class="fw"><label class="field-label">Bicep (cm)</label><input class="field" type="number" id="m-bicep" step=".5" placeholder="38"></div>';
  h+='<div class="fw"><label class="field-label">Thigh (cm)</label><input class="field" type="number" id="m-thigh" step=".5" placeholder="58"></div>';
  h+='<div class="fw"><label class="field-label">Shoulders (cm)</label><input class="field" type="number" id="m-shld" step=".5" placeholder="120"></div>';
  h+='<div class="fw"><label class="field-label">Calf (cm)</label><input class="field" type="number" id="m-calf" step=".5" placeholder="36"></div>';
  h+='<div class="fw"><label class="field-label">Neck (cm)</label><input class="field" type="number" id="m-neck" step=".5" placeholder="38"></div>';
  h+='</div>';
  h+='<div class="fw"><label class="field-label">Notes</label><input class="field" id="m-note" placeholder="Morning fasted, post workout..."></div>';
  h+='<button class="btn btn-p mb12" onclick="saveMetric()">Save Metrics</button>';
  h+='<button class="btn btn-s" onclick="document.getElementById(\'met-modal\').remove()">Cancel</button></div>';
  m.innerHTML=h;m.addEventListener('click',function(e){if(e.target===m)m.remove();});document.body.appendChild(m);
}
function gv(id){var e=document.getElementById(id);return e&&e.value?parseFloat(e.value):null;}
function gvs(id){var e=document.getElementById(id);return e?e.value:'';}
function saveMetric(){
  var w=gv('m-w');if(!w){toast('Enter weight','warn');return;}
  var bh=(S.g('user.height')||175)/100;var bmi=Math.round(w/(bh*bh)*10)/10;
  var ms=S.g('metrics')||[];
  ms.push({date:new Date().toISOString(),weight:w,unit:(S.g('user.units')||'metric')==='imperial'?'lbs':'kg',
    bf:gv('m-bf'),chest:gv('m-chest'),waist:gv('m-waist'),hips:gv('m-hips'),
    bicep:gv('m-bicep'),thigh:gv('m-thigh'),shoulders:gv('m-shld'),calf:gv('m-calf'),neck:gv('m-neck'),
    note:gvs('m-note'),bmi:bmi});
  S.set('metrics',ms);checkAchs();document.getElementById('met-modal').remove();toast('Metrics saved!');go('progress');
}

/* BODY CLONE */
reg('body',function(){
  var u=S.g('user')||{};var muscles=AI.muscleStatus();var metrics=S.g('metrics')||[];
  var latest=metrics[metrics.length-1]||{};var bw=u.weight||75;var bh=u.height||175;
  var bmi=Math.round(bw/((bh/100)*(bh/100))*10)/10;var bmr=WE.bmr();var tdee=Math.round(bmr*1.55);
  var h='';
  h+=topbar('Body Clone','Your Digital Twin');
  h+='<div class="screen">';
  h+='<div class="card" style="margin-top:12px">';
  h+='<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">';
  h+='<div><div style="font-size:18px;font-weight:800">'+(u.name||'Athlete')+' <span>'+(u.gender==='female'?'👩':u.gender==='male'?'👨':'🧑')+'</span></div>';
  h+='<div style="font-size:12px;color:rgba(255,255,255,.4)">'+_bodyView.charAt(0).toUpperCase()+_bodyView.slice(1)+' view</div></div>';
  h+='<button class="btn btn-s btn-sm" onclick="toggleBodyView()">Flip 🔄</button></div>';
  h+='<div style="display:flex;justify-content:center;margin:8px 0">'+bodyAvatar(u.gender,muscles,_bodyView)+'</div>';
  h+='<div style="display:flex;gap:7px;flex-wrap:wrap;justify-content:center;margin-top:10px">';
  h+='<span class="mchip fresh">Ready</span><span class="mchip moderate">Moderate</span><span class="mchip tired">Recovering</span>';
  h+='</div></div>';
  h+=sh('Muscle Status');h+='<div class="card">';
  muscles.forEach(function(m){
    var pc=m.pct||100;var cl=m.s==='fresh'?'#00ff88':m.s==='moderate'?'#ffb347':'#ff5f6d';
    h+='<div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.05)">';
    h+='<div><div style="font-size:14px;font-weight:600">'+m.m+'</div><div style="font-size:11px;color:rgba(255,255,255,.35)">'+m.l+'</div></div>';
    h+='<div style="display:flex;align-items:center;gap:10px"><div style="width:70px;height:5px;background:#1e1e2a;border-radius:3px;overflow:hidden">';
    h+='<div style="height:5px;background:'+cl+';border-radius:3px;width:'+pc+'%"></div></div>';
    h+='<span class="mchip '+m.s+'" style="font-size:11px">'+m.l+'</span></div></div>';
  });
  h+='</div>';
  h+=sh('Body Stats');
  h+='<div class="card"><div class="g2" style="gap:10px">';
  h+=statBox(bmi,'BMI','cyan');h+=statBox(bw+'kg','Weight','green');
  h+=statBox(bh+'cm','Height','purple');h+=statBox(bmr,'BMR kcal');
  h+=statBox(tdee,'TDEE kcal','yellow');h+=statBox(WE.getStreak()+'d','Streak','red');
  h+='</div></div>';
  if(latest.chest||latest.waist||latest.bicep){
    h+=sh('Latest Measurements');h+='<div class="card"><div class="g2" style="gap:10px">';
    var mf=[['chest','Chest'],['waist','Waist'],['hips','Hips'],['bicep','Bicep'],['thigh','Thigh'],['shoulders','Shoulders'],['calf','Calf'],['neck','Neck']];
    mf.forEach(function(f){if(latest[f[0]])h+='<div class="met-box"><div class="met-val">'+latest[f[0]]+'<span style="font-size:12px;color:rgba(255,255,255,.35)">cm</span></div><div class="met-lbl">'+f[1]+'</div></div>';});
    if(latest.bf)h+='<div class="met-box"><div class="met-val">'+latest.bf+'<span style="font-size:12px;color:rgba(255,255,255,.35)">%</span></div><div class="met-lbl">Body Fat</div></div>';
    h+='</div></div>';
  }
  h+=sh('Strength Targets');
  h+='<div class="card"><div style="font-size:12px;color:rgba(255,255,255,.4);margin-bottom:10px">Based on your stats and goal</div>';
  var exp=u.exp||'intermediate';var g=u.gender||'male';
  var m2=exp==='beginner'?.42:exp==='intermediate'?.68:.92;if(g==='female')m2*=.65;
  [['Bench Press',bw*.75],['Squat',bw*1],['Deadlift',bw*1.25],['Overhead Press',bw*.5],['Barbell Row',bw*.7]].forEach(function(lift){
    var target=Math.round(lift[1]*m2/2.5)*2.5;
    var prev=WE.getPrev(lift[0]);var cur=prev&&prev.sets&&prev.sets[0]?prev.sets[0].weight:null;
    h+='<div style="display:flex;align-items:center;justify-content:space-between;padding:9px 0;border-bottom:1px solid rgba(255,255,255,.05)">';
    h+='<div><div style="font-size:14px;font-weight:600">'+lift[0]+'</div>';
    h+='<div style="font-size:11px;color:rgba(255,255,255,.35)">Target for '+exp+'</div></div>';
    h+='<div style="text-align:right"><div style="font-size:16px;font-weight:800;color:#00d5ff">'+target+'kg</div>';
    if(cur)h+='<div style="font-size:11px;color:rgba(255,255,255,.35)">Current: '+cur+'kg</div>';
    h+='</div></div>';
  });
  h+='</div>';
  h+='<div style="padding:12px 12px 20px"><button class="btn btn-p" onclick="logMetricModal()">+ Log Body Metrics</button></div>';
  h+='<div style="height:18px"></div></div>';
  return h;
});

/* AI COACH */
reg('ai',function(){
  var readiness=AI.readiness();var rl=AI.rl(readiness);
  var insights=AI.insights();var muscles=AI.muscleStatus();var ws=S.g('workouts')||[];
  var h='';
  h+=topbar('AI Coach');
  h+='<div class="screen">';
  h+='<div class="card card-glow" style="margin-top:12px;background:rgba(124,111,255,.07)">';
  h+='<div style="display:flex;align-items:center;gap:13px;margin-bottom:13px">';
  h+='<div style="width:54px;height:54px;background:linear-gradient(135deg,#7c6fff,#ff5f6d);border-radius:20px;display:flex;align-items:center;justify-content:center;font-size:28px">🤖</div>';
  h+='<div><div style="font-size:18px;font-weight:800">Coach AI</div><div style="font-size:13px;color:#7c6fff">Readiness '+readiness+'% &middot; '+rl.l+'</div></div></div>';
  h+='<div class="ai-msg"><p>'+AI.coachMsg()+'</p></div></div>';
  h+=sh('Todays Insights');insights.forEach(function(ins){h+=insCard(ins);});
  h+=sh('Muscle Recovery');h+='<div class="card">';
  muscles.forEach(function(m){
    h+='<div style="display:flex;align-items:center;justify-content:space-between;padding:9px 0;border-bottom:1px solid rgba(255,255,255,.05)">';
    h+='<div><div style="font-size:14px;font-weight:600">'+m.m+'</div>';
    h+='<div style="font-size:11px;color:rgba(255,255,255,.35)">'+(m.s==='tired'?'24-48hr recovery needed':m.s==='moderate'?'Light training OK':'Fully recovered')+'</div></div>';
    h+='<span class="mchip '+m.s+'">'+m.l+'</span></div>';
  });
  h+='</div>';
  h+=sh('Your Progress');h+='<div class="card">';
  if(!ws.length){h+='<p style="color:rgba(255,255,255,.35)">Log workouts to get AI analysis.</p>';}
  else{
    h+='<div class="g2" style="gap:10px;margin-bottom:12px">';
    h+=statBox(ws.length,'Workouts','cyan');h+=statBox(ws.filter(function(w){return w.prCount>0;}).length,'PR Days','green');
    h+=statBox(WE.getStreak(),'Streak','purple');h+=statBox(Math.round(WE.getWeekVol()/1000)+'t','Week Vol');h+='</div>';
    h+='<div class="ai-msg"><p>You have completed '+ws.length+' workouts with a '+WE.getStreak()+' day streak. '+(WE.getStreak()>=7?'Outstanding consistency! Keep it up.':'Aim for 3+ sessions per week for best results.')+'</p></div>';
  }
  h+='</div>';
  h+=sh('Quick Actions');h+='<div class="card">';
  h+='<button class="btn btn-p mb12" onclick="go(\'workout\')">💪 Start Workout</button>';
  h+='<button class="btn btn-s mb12" onclick="go(\'recovery\')">😴 Log Recovery</button>';
  h+='<button class="btn btn-s mb12" onclick="go(\'body\')">🧬 Body Clone</button>';
  h+='<button class="btn btn-s" onclick="go(\'exercises\')">📚 Exercise Library</button>';
  h+='</div><div style="height:18px"></div></div>';
  return h;
});

/* RECOVERY */
reg('recovery',function(){
  var r=S.g('recovery')||{};var readiness=AI.readiness();var rl=AI.rl(readiness);
  var h='';
  h+=topbar('Recovery');
  h+='<div class="screen">';
  h+='<div class="card card-glow" style="margin-top:12px;background:'+rl.bg+';text-align:center">';
  h+='<div class="hero-n">'+readiness+'</div><div class="hero-l">Recovery Score</div>';
  h+='<p style="margin-top:9px;font-size:14px;color:rgba(255,255,255,.6)">'+(readiness>=80?'Excellent. Ready to push hard.':readiness>=60?'Good. Train as planned.':readiness>=40?'Moderate. Reduce intensity.':'Rest or active recovery recommended.')+'</p></div>';
  h+=sh('Log Today');h+='<div class="card">';
  function sldr(id,lbl,min,max,step,val,unit,color){var s='<div style="margin-bottom:16px"><label class="field-label">'+lbl+'</label><div style="display:flex;align-items:center;gap:11px;margin:5px 0"><span style="font-size:20px;font-weight:800;color:'+color+';min-width:50px;flex-shrink:0" id="'+id+'-v">'+val+(unit||'')+'</span><input class="sldr" type="range" min="'+min+'" max="'+max+'" step="'+step+'" value="'+val+'" oninput="updSl(\''+id+'\',this.value,\''+unit+'\')"></div></div>';return s;}
  h+=sldr('sleep','Sleep (hours)',4,10,.5,r.sleep||7.5,'h','#00d5ff');
  h+=sldr('soreness','Muscle Soreness',1,10,1,r.soreness||3,'','#ff5f6d');
  h+=sldr('stress','Stress Level',1,10,1,r.stress||4,'','#ffb347');
  h+=sldr('energy','Energy Level',1,10,1,r.energy||7,'','#00ff88');
  h+=sldr('hydration','Water Intake',.5,5,.5,r.hydration||2.5,'L','#7c6fff');
  h+='<button class="btn btn-p" onclick="saveRecovery()">Save Recovery Data</button></div>';
  h+=sh('Coach Tips');h+='<div class="card">';
  AI.insights().forEach(function(ins){h+='<div style="margin-bottom:10px;padding-bottom:10px;border-bottom:1px solid rgba(255,255,255,.05)"><div style="font-size:14px;font-weight:700;color:'+ins.c+';margin-bottom:3px">'+ins.i+' '+ins.t+'</div><p style="font-size:13px;color:rgba(255,255,255,.55);margin:0;line-height:1.5">'+ins.m+'</p></div>';});
  h+='</div><div style="height:18px"></div></div>';
  return h;
});
function updSl(id,val,unit){var el=document.getElementById(id+'-v');if(el)el.textContent=val+(unit||'');S.set('recovery.'+id,parseFloat(val));}
function saveRecovery(){toast('Recovery logged!');go('home');}

/* SETTINGS */
reg('settings',function(){
  var u=S.g('user')||{};var p=S.g('prefs')||{};var sp=S.g('training.split')||'ppl';
  var h='';
  h+=topbar('Settings');
  h+='<div class="screen">';
  h+=sh('Profile');h+='<div class="card">';
  h+='<div class="fw"><label class="field-label">Name</label><input class="field" value="'+(u.name||'')+'" placeholder="Your name" onchange="S.set(\'user.name\',this.value)"></div>';
  h+='<div class="g2" style="gap:10px">';
  h+='<div class="fw"><label class="field-label">Age</label><input class="field" type="number" value="'+(u.age||'')+'" onchange="S.set(\'user.age\',parseInt(this.value))"></div>';
  h+='<div class="fw"><label class="field-label">Gender</label><select class="field" onchange="S.set(\'user.gender\',this.value)">';
  [{v:'male',l:'Male'},{v:'female',l:'Female'},{v:'neutral',l:'Neutral'}].forEach(function(o){h+='<option value="'+o.v+'"'+(u.gender===o.v?' selected':'')+'>'+o.l+'</option>';});
  h+='</select></div>';
  h+='<div class="fw"><label class="field-label">Weight (kg)</label><input class="field" type="number" value="'+(u.weight||'')+'" step=".5" onchange="S.set(\'user.weight\',parseFloat(this.value))"></div>';
  h+='<div class="fw"><label class="field-label">Height (cm)</label><input class="field" type="number" value="'+(u.height||'')+'" onchange="S.set(\'user.height\',parseFloat(this.value))"></div>';
  h+='</div>';
  h+='<div class="fw"><label class="field-label">Goal</label><select class="field" onchange="S.set(\'user.goal\',this.value)">';
  [{v:'hypertrophy',l:'Build Muscle'},{v:'strength',l:'Get Stronger'},{v:'fat_loss',l:'Lose Fat'},{v:'athletic',l:'Athletic'},{v:'recomp',l:'Body Recomposition'}].forEach(function(o){h+='<option value="'+o.v+'"'+(u.goal===o.v?' selected':'')+'>'+o.l+'</option>';});
  h+='</select></div>';
  h+='<div class="fw"><label class="field-label">Experience</label><select class="field" onchange="S.set(\'user.exp\',this.value)">';
  [{v:'beginner',l:'Beginner'},{v:'intermediate',l:'Intermediate'},{v:'advanced',l:'Advanced'}].forEach(function(o){h+='<option value="'+o.v+'"'+(u.exp===o.v?' selected':'')+'>'+o.l+'</option>';});
  h+='</select></div>';
  h+='<div class="fw"><label class="field-label">Units</label><select class="field" onchange="S.set(\'user.units\',this.value)">';
  h+='<option value="metric"'+((u.units||'metric')==='metric'?' selected':'')+'>Metric (kg / cm)</option>';
  h+='<option value="imperial"'+(u.units==='imperial'?' selected':'')+'>Imperial (lbs / in)</option>';
  h+='</select></div></div>';
  h+=sh('Training Program');h+='<div class="card">';
  h+='<div class="fw"><label class="field-label">Training Split</label><select class="field" onchange="S.set(\'training.split\',this.value);S.set(\'training.day\',1);_wktOn=false;_wkt=[];toast(\'Split updated!\')">';
  Object.keys(SPLITS).forEach(function(k){h+='<option value="'+k+'"'+(sp===k?' selected':'')+'>'+SPLITS[k].label+'</option>';});
  h+='</select></div>';
  h+='<div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0"><div><div style="font-size:14px;font-weight:600">Current Day</div>';
  h+='<div style="font-size:11px;color:rgba(255,255,255,.35)">Day '+(S.g('training.day')||1)+' of '+(SPLITS[sp]?SPLITS[sp].days:7)+'</div></div>';
  h+='<div style="display:flex;gap:8px"><button class="btn btn-s btn-sm" onclick="adjDay(-1)">&larr;</button><button class="btn btn-s btn-sm" onclick="adjDay(1)">&rarr;</button></div></div></div>';
  h+=sh('Equipment');h+='<div class="card">';
  var ce=u.equipment||[];
  [{v:'barbell',l:'Barbell & Plates'},{v:'dumbbell',l:'Dumbbells'},{v:'cables',l:'Cable Machine'},{v:'machine',l:'Machines'},{v:'bar',l:'Pull-Up Bar'},{v:'bands',l:'Resistance Bands'}].forEach(function(eq){
    var has=ce.indexOf(eq.v)>=0;
    h+='<div class="tog-row"><div class="tog-t">'+eq.l+'</div>';
    h+='<label class="tgl"><input type="checkbox"'+(has?' checked':'')+' onchange="togEquip(\''+eq.v+'\',this.checked)"><div class="tgl-track"></div><div class="tgl-thumb"></div></label></div>';
  });
  h+='</div>';
  h+=sh('Preferences');h+='<div class="card">';
  h+='<div class="tog-row"><div><div class="tog-t">Rest Timer</div><div class="tog-s">Auto-start after each set</div></div><label class="tgl"><input type="checkbox"'+(p.restTimer!==false?' checked':'')+' onchange="S.set(\'prefs.restTimer\',this.checked)"><div class="tgl-track"></div><div class="tgl-thumb"></div></label></div>';
  h+='<div class="tog-row"><div class="tog-t">Rest Duration</div><select class="field" style="width:90px;padding:8px" onchange="S.set(\'prefs.restSecs\',parseInt(this.value))">';
  [{v:60,l:'60s'},{v:90,l:'90s'},{v:120,l:'2 min'},{v:180,l:'3 min'}].forEach(function(o){h+='<option value="'+o.v+'"'+((p.restSecs||90)===o.v?' selected':'')+'>'+o.l+'</option>';});
  h+='</select></div></div>';
  h+=sh('Data');h+='<div class="card">';
  h+='<button class="btn btn-s mb12" onclick="exportData()">📥 Export Backup</button>';
  h+='<button class="btn btn-s mb12" onclick="importData()">📤 Import Backup</button>';
  h+='<button class="btn btn-r" onclick="clearAll()">🗑️ Clear All Data</button></div>';
  h+=sh('About');h+='<div class="card" style="text-align:center;margin-bottom:18px">';
  h+='<div style="font-size:40px;margin-bottom:8px">&#9889;</div>';
  h+='<div style="font-size:19px;font-weight:900;letter-spacing:-.4px">FitnessOS Pro</div>';
  h+='<div style="font-size:12px;color:rgba(255,255,255,.35);margin-top:5px">Version 4.0 &middot; Standalone &middot; Offline capable<br>8 tabs &middot; Body Clone &middot; AI Coach &middot; 60+ exercises</div></div>';
  h+='</div>';
  return h;
});
function togEquip(eq,on){var cur=S.g('user.equipment')||[];var idx=cur.indexOf(eq);if(on&&idx<0)cur.push(eq);if(!on&&idx>=0)cur.splice(idx,1);S.set('user.equipment',cur);}
function adjDay(d){var sp=SPLITS[S.g('training.split')]||SPLITS.ppl;var cur=S.g('training.day')||1;var next=cur+d;if(next<1)next=sp.days;if(next>sp.days)next=1;S.set('training.day',next);_wktOn=false;_wkt=[];go('settings');}
function exportData(){var b=new Blob([JSON.stringify(S.d,null,2)],{type:'application/json'});var u=URL.createObjectURL(b);var a=document.createElement('a');a.href=u;a.download='fitnessos-'+new Date().toISOString().slice(0,10)+'.json';a.click();URL.revokeObjectURL(u);toast('Exported!');}
function importData(){var inp=document.createElement('input');inp.type='file';inp.accept='.json';inp.onchange=function(e){var f=e.target.files[0];if(!f)return;var r=new FileReader();r.onload=function(ev){try{Object.assign(S.d,JSON.parse(ev.target.result));S.save();toast('Imported!');go('home');}catch(e){toast('Invalid file','warn');}};r.readAsText(f);};inp.click();}
function clearAll(){if(confirm('Delete all data? Cannot be undone.')){localStorage.removeItem(S._k);location.reload();}}

/* BOOT */
window.addEventListener('DOMContentLoaded',function(){
  var nb=document.getElementById('nb-home');if(nb)nb.classList.add('on');
  if(!S.g('onboarding')){document.getElementById('nav').style.display='none';go('welcome');}
  else{go('home');}
});
