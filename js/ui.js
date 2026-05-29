/* === AI ENGINE === */
var AI = {
  readiness: function() {
    var r = S.g('recovery') || {}; var s = 100;
    s -= Math.max(0, (8 - (r.sleep || 7.5)) * 8);
    s -= (r.soreness || 3) * 5;
    s -= (r.stress || 4) * 3;
    s += ((r.energy || 7) - 5) * 3;
    return Math.max(0, Math.min(100, Math.round(s)));
  },
  rl: function(s) {
    if (s >= 85) return {l:'Peak',c:'#00ff88',bg:'rgba(0,255,136,.08)'};
    if (s >= 70) return {l:'Ready',c:'#00d5ff',bg:'rgba(0,213,255,.08)'};
    if (s >= 50) return {l:'Moderate',c:'#ffb347',bg:'rgba(255,179,71,.08)'};
    return {l:'Rest',c:'#ff5f6d',bg:'rgba(255,95,109,.08)'};
  },
  coachMsg: function() {
    var s = this.readiness();
    if (s >= 85) return 'Readiness is at peak. Today is the perfect day to chase PRs and push hard.';
    if (s >= 70) return 'You are ready to train. Stick to your planned weights and listen to your body.';
    if (s >= 50) return 'Moderate readiness. Reduce intensity 10-15% and focus on quality movement today.';
    return 'Low readiness. Consider active recovery, mobility work, or a full rest day.';
  },
  insights: function() {
    var r = S.g('recovery') || {}; var s = this.readiness(); var msgs = [];
    if ((r.sleep || 7.5) < 6.5) msgs.push({t:'Sleep Debt',m:'Less than 6.5h detected. Recovery is compromised - reduce volume today.',i:'😴',c:'#ff5f6d'});
    else if ((r.sleep || 7.5) >= 8) msgs.push({t:'Well Rested',m:'8+ hours logged. Excellent base for high performance today.',i:'⚡',c:'#00ff88'});
    if ((r.soreness || 3) >= 7) msgs.push({t:'High Soreness',m:'Focus on different muscle groups or reduce intensity significantly.',i:'💊',c:'#ffb347'});
    if (s >= 85) msgs.push({t:'Peak Window',m:'All metrics optimal. Push hard and track PRs today.',i:'🔥',c:'#00ff88'});
    if (WE.getStreak() >= 5) msgs.push({t:'Deload Signal',m:WE.getStreak()+' consecutive days. Plan a deload week soon.',i:'⚠️',c:'#ffb347'});
    if ((r.hydration || 2.5) < 2) msgs.push({t:'Hydration Low',m:'Drink more water. Performance drops significantly when dehydrated.',i:'💧',c:'#00d5ff'});
    if (!msgs.length) msgs.push({t:'On Track',m:'Recovery metrics look solid. Stay consistent and trust the process.',i:'✅',c:'#00d5ff'});
    return msgs.slice(0, 3);
  },
  muscleStatus: function() {
    var ws = S.g('workouts') || [];
    var groups = {Chest:null,Back:null,Shoulders:null,Legs:null,Arms:null,Core:null};
    var now = new Date();
    ws.slice(-14).forEach(function(wo) {
      var hrs = (now - new Date(wo.date)) / 36e5;
      (wo.exercises || []).forEach(function(ex) {
        var e = exById(ex.name); var mu = (e.pri || '') + ',' + (e.sec || '');
        if (/chest/i.test(mu)) groups.Chest = Math.min(groups.Chest || 999, hrs);
        if (/back|lat|trap/i.test(mu)) groups.Back = Math.min(groups.Back || 999, hrs);
        if (/delt|shoulder/i.test(mu)) groups.Shoulders = Math.min(groups.Shoulders || 999, hrs);
        if (/quad|hamstring|glute|calf/i.test(mu)) groups.Legs = Math.min(groups.Legs || 999, hrs);
        if (/bicep|tricep/i.test(mu)) groups.Arms = Math.min(groups.Arms || 999, hrs);
        if (/core|ab/i.test(mu)) groups.Core = Math.min(groups.Core || 999, hrs);
      });
    });
    return Object.keys(groups).map(function(m) {
      var hrs = groups[m];
      if (!hrs || hrs === 999) return {m:m,s:'fresh',l:'Ready',pct:100};
      if (hrs < 24) return {m:m,s:'tired',l:'Recovering',pct:Math.round(hrs/48*100)};
      if (hrs < 48) return {m:m,s:'moderate',l:'Moderate',pct:Math.round(hrs/48*100)};
      return {m:m,s:'fresh',l:'Ready',pct:100};
    });
  },
};

/* === HTML HELPERS === */
function topbar(t, sub, right) {
  return '<div class="topbar"><div>' + (sub ? '<div class="tb-sub">' + sub + '</div>' : '') + '<div class="tb-title">' + t + '</div></div>' + (right || '') + '</div>';
}
function sh(t, a, act) {
  return '<div class="sh"><div class="sh-t">' + t + '</div>' + (a ? '<span class="sh-a" onclick="' + act + '">' + a + '</span>' : '') + '</div>';
}
function card(c, extra, click) {
  return '<div class="card' + (extra ? ' ' + extra : '') + '"' + (click ? ' onclick="' + click + '"' : '') + '>' + c + '</div>';
}
function statBox(v, l, col, click) {
  return '<div class="stat' + (col ? ' ' + col : '') + '"' + (click ? ' onclick="' + click + '" style="cursor:pointer"' : '') + '><div class="sv">' + v + '</div><div class="sl">' + l + '</div></div>';
}
function insCard(ins) {
  return card('<div style="display:flex;align-items:flex-start;gap:13px"><span style="font-size:26px">' + ins.i + '</span><div><div style="font-size:14px;font-weight:700;color:' + ins.c + ';margin-bottom:4px">' + ins.t + '</div><p style="font-size:13px;line-height:1.55;margin:0;color:rgba(255,255,255,.6)">' + ins.m + '</p></div></div>');
}

function achHTML() {
  var earned = S.g('achievements') || [];
  return ACHS.map(function(a) {
    var e = earned.indexOf(a.id) >= 0;
    var r = '<div class="ach' + (e ? ' earn' : '') + '">';
    r += '<div class="ach-ic"' + (e ? '' : ' style="opacity:.25"') + '>' + a.i + '</div>';
    r += '<div style="flex:1"><div style="font-size:14px;font-weight:700;color:' + (e ? '#fff' : 'rgba(255,255,255,0.3)') + '">' + a.n + '</div><div style="font-size:12px;color:rgba(255,255,255,0.35)">' + a.d + '</div></div>';
    if (e) r += '<span style="color:#00ff88;font-size:18px">&#10003;</span>';
    r += '</div>';
    return r;
  }).join('');
}

/* === BODY AVATAR === */
var _bodyView = 'front';

function toggleBodyView() { _bodyView = _bodyView === 'front' ? 'back' : 'front'; go('body'); }

function bodyAvatar(gender, muscles, view) {
  var g = gender || 'male';
  function mc(name) {
    var found = muscles.find(function(m) { return m.m === name; });
    if (!found || found.s === 'fresh') return 'rgba(0,213,255,.22)';
    if (found.s === 'tired') return 'rgba(255,95,109,.65)';
    return 'rgba(255,179,71,.45)';
  }
  var chC = mc('Chest'), bkC = mc('Back'), lgC = mc('Legs'), shC = mc('Shoulders'), arC = mc('Arms'), coC = mc('Core');
  var sk = g === 'female' ? '#c4956a' : '#a07252'; var bs = 'rgba(0,213,255,.45)';
  var svg = '<svg viewBox="0 0 120 260" xmlns="http://www.w3.org/2000/svg" style="height:210px;filter:drop-shadow(0 0 18px rgba(0,213,255,.25))">';
  svg += '<defs><radialGradient id="sg" cx="50%" cy="30%"><stop offset="0%" stop-color="#1a1a2e"/><stop offset="100%" stop-color="#0a0a14"/></radialGradient></defs>';
  if (view === 'front') {
    svg += '<ellipse cx="60" cy="28" rx="17" ry="19" fill="' + sk + '" stroke="' + bs + '" stroke-width="1.2"/>';
    svg += '<rect x="44" y="46" width="32" height="6" rx="3" fill="' + sk + '"/>';
    svg += '<path d="M31,52 Q26,68 29,118 Q33,128 60,130 Q87,128 91,118 Q94,68 89,52 Z" fill="url(#sg)" stroke="' + bs + '" stroke-width="1.2"/>';
    svg += '<ellipse cx="47" cy="70" rx="13" ry="9" fill="' + chC + '" opacity=".85"/><ellipse cx="73" cy="70" rx="13" ry="9" fill="' + chC + '" opacity=".85"/>';
    svg += '<rect x="50" y="83" width="8" height="6" rx="2" fill="' + coC + '" opacity=".75"/><rect x="62" y="83" width="8" height="6" rx="2" fill="' + coC + '" opacity=".75"/>';
    svg += '<rect x="50" y="92" width="8" height="6" rx="2" fill="' + coC + '" opacity=".7"/><rect x="62" y="92" width="8" height="6" rx="2" fill="' + coC + '" opacity=".7"/>';
    svg += '<rect x="50" y="101" width="8" height="6" rx="2" fill="' + coC + '" opacity=".6"/><rect x="62" y="101" width="8" height="6" rx="2" fill="' + coC + '" opacity=".6"/>';
    svg += '<ellipse cx="27" cy="66" rx="9" ry="8" fill="' + shC + '" stroke="' + bs + '" stroke-width="1"/><ellipse cx="93" cy="66" rx="9" ry="8" fill="' + shC + '" stroke="' + bs + '" stroke-width="1"/>';
    svg += '<path d="M20,74 Q14,93 17,118 Q19,123 24,123 Q29,123 31,118 Q33,93 27,74 Z" fill="' + arC + '" stroke="' + bs + '" stroke-width="1"/>';
    svg += '<path d="M100,74 Q106,93 103,118 Q101,123 96,123 Q91,123 89,118 Q87,93 93,74 Z" fill="' + arC + '" stroke="' + bs + '" stroke-width="1"/>';
    svg += '<path d="M17,118 Q14,138 16,152 Q18,156 23,156 Q28,156 30,152 Q32,138 29,118 Z" fill="' + sk + '" stroke="' + bs + '" stroke-width="1"/>';
    svg += '<path d="M103,118 Q106,138 104,152 Q102,156 97,156 Q92,156 90,152 Q88,138 91,118 Z" fill="' + sk + '" stroke="' + bs + '" stroke-width="1"/>';
    svg += '<path d="M29,128 Q25,133 27,143 Q35,150 60,152 Q85,150 93,143 Q95,133 91,128 Z" fill="' + lgC + '" stroke="' + bs + '" stroke-width="1.2"/>';
    svg += '<path d="M31,150 Q27,173 29,202 Q31,212 39,212 Q47,212 49,202 Q51,173 47,150 Z" fill="' + lgC + '" stroke="' + bs + '" stroke-width="1"/>';
    svg += '<path d="M89,150 Q93,173 91,202 Q89,212 81,212 Q73,212 71,202 Q69,173 73,150 Z" fill="' + lgC + '" stroke="' + bs + '" stroke-width="1"/>';
    svg += '<path d="M29,202 Q26,220 28,232 Q30,237 38,237 Q46,237 48,232 Q50,220 47,202 Z" fill="' + sk + '" stroke="' + bs + '" stroke-width="1"/>';
    svg += '<path d="M91,202 Q94,220 92,232 Q90,237 82,237 Q74,237 72,232 Q70,220 73,202 Z" fill="' + sk + '" stroke="' + bs + '" stroke-width="1"/>';
    svg += '<ellipse cx="37" cy="239" rx="10" ry="5" fill="' + sk + '"/><ellipse cx="83" cy="239" rx="10" ry="5" fill="' + sk + '"/>';
  } else {
    svg += '<ellipse cx="60" cy="28" rx="17" ry="19" fill="' + sk + '" stroke="' + bs + '" stroke-width="1.2"/>';
    svg += '<rect x="44" y="46" width="32" height="6" rx="3" fill="' + sk + '"/>';
    svg += '<path d="M31,52 Q26,68 29,118 Q33,128 60,130 Q87,128 91,118 Q94,68 89,52 Z" fill="url(#sg)" stroke="' + bs + '" stroke-width="1.2"/>';
    svg += '<path d="M36,58 Q31,78 34,103 Q41,113 56,113 Q60,110 60,110 Q60,110 64,113 Q79,113 86,103 Q89,78 84,58 Z" fill="' + bkC + '" opacity=".72"/>';
    svg += '<path d="M42,52 Q60,60 78,52 Q78,68 60,70 Q42,68 42,52 Z" fill="' + shC + '" opacity=".65"/>';
    svg += '<ellipse cx="27" cy="66" rx="9" ry="8" fill="' + shC + '" stroke="' + bs + '" stroke-width="1"/><ellipse cx="93" cy="66" rx="9" ry="8" fill="' + shC + '" stroke="' + bs + '" stroke-width="1"/>';
    svg += '<path d="M20,74 Q14,93 17,118 Q19,123 24,123 Q29,123 31,118 Q33,93 27,74 Z" fill="' + arC + '" stroke="' + bs + '" stroke-width="1"/>';
    svg += '<path d="M100,74 Q106,93 103,118 Q101,123 96,123 Q91,123 89,118 Q87,93 93,74 Z" fill="' + arC + '" stroke="' + bs + '" stroke-width="1"/>';
    svg += '<path d="M17,118 Q14,138 16,152 Q18,156 23,156 Q28,156 30,152 Q32,138 29,118 Z" fill="' + sk + '" stroke="' + bs + '" stroke-width="1"/>';
    svg += '<path d="M103,118 Q106,138 104,152 Q102,156 97,156 Q92,156 90,152 Q88,138 91,118 Z" fill="' + sk + '" stroke="' + bs + '" stroke-width="1"/>';
    svg += '<ellipse cx="46" cy="135" rx="15" ry="13" fill="' + lgC + '" opacity=".85"/><ellipse cx="74" cy="135" rx="15" ry="13" fill="' + lgC + '" opacity=".85"/>';
    svg += '<path d="M31,148 Q27,173 29,202 Q31,212 39,212 Q47,212 49,202 Q51,173 47,148 Z" fill="' + lgC + '" stroke="' + bs + '" stroke-width="1"/>';
    svg += '<path d="M89,148 Q93,173 91,202 Q89,212 81,212 Q73,212 71,202 Q69,173 73,148 Z" fill="' + lgC + '" stroke="' + bs + '" stroke-width="1"/>';
    svg += '<path d="M29,202 Q26,220 28,232 Q30,237 38,237 Q46,237 48,232 Q50,220 47,202 Z" fill="' + sk + '" stroke="' + bs + '" stroke-width="1"/>';
    svg += '<path d="M91,202 Q94,220 92,232 Q90,237 82,237 Q74,237 72,232 Q70,220 73,202 Z" fill="' + sk + '" stroke="' + bs + '" stroke-width="1"/>';
    svg += '<ellipse cx="37" cy="239" rx="10" ry="5" fill="' + sk + '"/><ellipse cx="83" cy="239" rx="10" ry="5" fill="' + sk + '"/>';
  }
  svg += '</svg>';
  return svg;
}

/* === WELCOME SCREEN === */
reg('welcome', function() {
  var h = '<div class="welcome">';
  h += '<div class="logo">&#9889;</div>';
  h += '<div class="w-title">FitnessOS<br>Pro</div>';
  h += '<p class="w-sub">The intelligent fitness system that learns, adapts, and grows with you.</p>';
  h += '<div class="feat-row"><span class="feat">AI Coach</span><span class="feat">Body Clone</span><span class="feat">Smart Splits</span><span class="feat">PR Tracking</span><span class="feat">Recovery</span><span class="feat">Analytics</span></div>';
  h += '<div style="width:100%;max-width:340px;padding:0 0 50px">';
  h += '<button class="btn btn-p mb12" onclick="go(\'onboard\')">Get Started &rarr;</button>';
  h += '<button class="btn btn-s" onclick="go(\'home\')">Continue with Saved Data</button>';
  h += '</div></div>';
  return h;
});

/* === ONBOARDING === */
var _obStep = 0, _obData = {};
var _obSteps = [
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

reg('onboard', function() {
  var step = _obSteps[_obStep];
  var pct = Math.round((_obStep / _obSteps.length) * 100);
  var h = '<div class="ob">';
  h += '<div class="ob-prog"><div class="ob-bar" style="width:' + pct + '%"></div></div>';
  h += '<p style="font-size:12px;color:rgba(255,255,255,0.3)">Step ' + (_obStep + 1) + ' of ' + _obSteps.length + '</p>';
  h += '<div class="ob-title">' + step.q + '</div>';
  if (step.sub) h += '<p class="ob-sub">' + step.sub + '</p>';
  if (step.type === 'text') {
    h += '<div style="margin-top:26px"><input id="ob-inp" class="field" style="font-size:22px;padding:17px" placeholder="' + (step.ph || '') + '" value="' + (_obData[step.key] || '') + '" oninput="obInput(this.value)"></div>';
  }
  if (step.type === 'choice') {
    h += '<div class="ob-opts">';
    step.opts.forEach(function(o) {
      var sel = _obData[step.key] === o.v;
      h += '<div class="ob-opt' + (sel ? ' on' : '') + '" onclick="obSel(\'' + o.v + '\')">';
      h += '<span class="ob-oi">' + o.i + '</span><div><div class="ob-ot">' + o.l + '</div>';
      if (o.s) h += '<div class="ob-os">' + o.s + '</div>';
      h += '</div></div>';
    });
    h += '</div>';
  }
  if (step.type === 'stats') {
    h += '<div style="margin-top:22px"><div class="g2" style="gap:10px;margin-bottom:10px">';
    h += '<div><label class="field-label">Age</label><input class="field" type="number" placeholder="25" value="' + (_obData.age || '') + '" oninput="obD(\'age\',this.value)"></div>';
    h += '<div><label class="field-label">Units</label><select class="field" onchange="obD(\'units\',this.value)"><option value="metric"' + ((_obData.units || 'metric') === 'metric' ? ' selected' : '') + '>kg / cm</option><option value="imperial"' + (_obData.units === 'imperial' ? ' selected' : '') + '>lbs / in</option></select></div>';
    h += '<div><label class="field-label">Weight</label><input class="field" type="number" placeholder="75" value="' + (_obData.weight || '') + '" oninput="obD(\'weight\',this.value)"></div>';
    h += '<div><label class="field-label">Height (cm)</label><input class="field" type="number" placeholder="175" value="' + (_obData.height || '') + '" oninput="obD(\'height\',this.value)"></div>';
    h += '</div></div>';
  }
  h += '<div class="ob-act">';
  h += '<button class="btn btn-p mb12" onclick="obNext()">' + (_obStep < _obSteps.length - 1 ? 'Continue &rarr;' : 'Start Training &#9889;') + '</button>';
  if (_obStep > 0) h += '<button class="btn btn-s" onclick="obBack()">&larr; Back</button>';
  h += '</div></div>';
  return h;
});

function obInput(v) { _obData[_obSteps[_obStep].key] = v; }
function obSel(v) { _obData[_obSteps[_obStep].key] = v; go('onboard'); }
function obD(k, v) { _obData[k] = v; }
function obNext() {
  var step = _obSteps[_obStep];
  if (step.type === 'text' && !_obData[step.key]) { toast('Please enter your ' + step.key, 'warn'); return; }
  if (step.type === 'choice' && !_obData[step.key]) { toast('Please make a selection', 'warn'); return; }
  if (_obStep < _obSteps.length - 1) { _obStep++; go('onboard'); return; }
  var u = S.g('user') || {};
  ['name','gender','goal','exp'].forEach(function(k) { if (_obData[k]) u[k] = _obData[k]; });
  if (_obData.age) u.age = parseInt(_obData.age);
  if (_obData.weight) u.weight = parseFloat(_obData.weight);
  if (_obData.height) u.height = parseFloat(_obData.height);
  if (_obData.units) u.units = _obData.units;
  var locMap = {full:['barbell','dumbbell','cables','machine','bar'],home_dumb:['dumbbell','bar'],home_bw:['bar'],hotel:['dumbbell','bands']};
  u.equipment = locMap[_obData.location] || locMap.full;
  S.set('user', u);
  if (_obData.split) S.set('training.split', _obData.split);
  S.set('onboarding', true); S.set('training.day', 1);
  _obStep = 0; _obData = {};
  go('home'); toast('Welcome to FitnessOS, ' + (u.name || 'Athlete') + '!');
}
function obBack() { if (_obStep > 0) { _obStep--; go('onboard'); } }

/* === HOME SCREEN === */
reg('home', function() {
  var u = S.g('user') || {}; var ws = S.g('workouts') || [];
  var readiness = AI.readiness(); var rl = AI.rl(readiness);
  var streak = WE.getStreak(); var wvol = WE.getWeekVol();
  var insights = AI.insights(); var day = WE.getSplitDay(); var muscles = AI.muscleStatus();
  var hr = new Date().getHours();
  var greeting = hr < 12 ? 'Good Morning' : hr < 17 ? 'Good Afternoon' : 'Good Evening';
  var h = '';
  h += topbar(u.name || 'Athlete', greeting, '<div style="display:flex;gap:8px"><div class="tb-ic" onclick="go(\'recovery\')">💊</div><div class="tb-ic" onclick="go(\'settings\')">⚙️</div></div>');
  h += '<div class="screen">';
  h += '<div class="card card-glow" style="margin-top:12px;background:' + rl.bg + '">';
  h += '<div class="ch"><span class="ct">Readiness Score</span><span class="cbadge b-c">' + rl.l + '</span></div>';
  h += '<div style="display:flex;align-items:center;gap:18px">';
  h += '<div><div class="hero-n">' + readiness + '</div><div class="hero-l">out of 100</div></div>';
  h += '<p style="flex:1;font-size:13px;color:rgba(255,255,255,.6);line-height:1.5">' + AI.coachMsg() + '</p></div></div>';
  h += sh('Todays Workout');
  if (day) {
    h += '<div class="card card-tap" onclick="go(\'workout\')">';
    h += '<div style="display:flex;align-items:center;justify-content:space-between">';
    h += '<div><div style="font-size:20px;font-weight:800;margin-bottom:3px">' + day.n + '</div>';
    h += '<div style="font-size:13px;color:rgba(255,255,255,.35)">' + (day.muscles || []).join(' &middot; ') + '</div></div>';
    h += '<div style="width:52px;height:52px;background:linear-gradient(135deg,#00d5ff,#7c6fff);border-radius:18px;display:flex;align-items:center;justify-content:center;font-size:26px">💪</div></div>';
    h += '<div style="margin-top:11px;display:flex;gap:6px;flex-wrap:wrap">';
    day.exercises.slice(0, 4).forEach(function(e) { h += '<span style="padding:4px 9px;border-radius:20px;background:rgba(255,255,255,.06);font-size:12px;color:rgba(255,255,255,.55)">' + e + '</span>'; });
    if (day.exercises.length > 4) h += '<span style="padding:4px 9px;border-radius:20px;background:rgba(0,213,255,.1);font-size:12px;color:#00d5ff">+' + (day.exercises.length - 4) + ' more</span>';
    h += '</div><button class="btn btn-p" style="margin-top:12px">Start Workout &rarr;</button></div>';
  }
  h += sh('This Week');
  h += '<div style="padding:0 12px 12px"><div class="g4">';
  h += statBox(ws.length, 'Workouts', 'cyan');
  h += statBox(streak, 'Streak', 'green');
  h += statBox(Math.round(wvol / 1000) + 't', 'Volume', 'purple');
  h += statBox((S.g('achievements') || []).length, 'Badges');
  h += '</div></div>';
  h += sh('Muscle Recovery', 'Body &rarr;', 'go(\'body\')');
  h += '<div class="card"><div style="display:flex;gap:7px;flex-wrap:wrap">';
  muscles.forEach(function(m) { h += '<span class="mchip ' + m.s + '">' + m.m + ': ' + m.l + '</span>'; });
  h += '</div></div>';
  h += sh('AI Insights', 'Coach &rarr;', 'go(\'ai\')');
  insights.forEach(function(ins) { h += insCard(ins); });
  h += sh('Quick Actions');
  h += '<div style="padding:0 12px 12px"><div class="g2">';
  h += '<button class="btn btn-s" onclick="go(\'body\')" style="font-size:13px">🧬 Body Clone</button>';
  h += '<button class="btn btn-s" onclick="go(\'exercises\')" style="font-size:13px">📚 Exercises</button>';
  h += '<button class="btn btn-g" onclick="go(\'recovery\')" style="font-size:13px">😴 Recovery</button>';
  h += '<button class="btn btn-s" onclick="go(\'progress\')" style="font-size:13px">📈 Progress</button>';
  h += '</div></div>';
  if (ws.length) {
    h += sh('Recent Workouts', 'All &rarr;', 'go(\'progress\')'); h += '<div class="card">';
    ws.slice(-3).reverse().forEach(function(w) {
      h += '<div class="exr"><div class="ex-ic">💪</div>';
      h += '<div class="ex-inf"><div class="ex-nm">' + (w.splitDay || 'Workout') + '</div>';
      h += '<div class="ex-sub">' + new Date(w.date).toLocaleDateString('en', {weekday:'short',month:'short',day:'numeric'}) + '</div></div>';
      h += '<div class="ex-tag">' + ((w.exercises || []).length) + ' ex.</div></div>';
    });
    h += '</div>';
  }
  h += '<div style="height:18px"></div></div>';
  return h;
});

/* === BODY CLONE SCREEN === */
reg('body', function() {
  var u = S.g('user') || {}; var muscles = AI.muscleStatus(); var metrics = S.g('metrics') || [];
  var latest = metrics[metrics.length - 1] || {}; var bw = u.weight || 75; var bh = u.height || 175;
  var bmi = Math.round(bw / ((bh/100) * (bh/100)) * 10) / 10; var bmr = WE.bmr(); var tdee = Math.round(bmr * 1.55);
  var h = '';
  h += topbar('Body Clone', 'Your Digital Twin');
  h += '<div class="screen">';
  h += '<div class="card" style="margin-top:12px">';
  h += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">';
  h += '<div><div style="font-size:18px;font-weight:800">' + (u.name || 'Athlete') + ' <span>' + (u.gender === 'female' ? '👩' : u.gender === 'male' ? '👨' : '🧑') + '</span></div>';
  h += '<div style="font-size:12px;color:rgba(255,255,255,.4)">' + _bodyView.charAt(0).toUpperCase() + _bodyView.slice(1) + ' view</div></div>';
  h += '<button class="btn btn-s btn-sm" onclick="toggleBodyView()">Flip 🔄</button></div>';
  h += '<div style="display:flex;justify-content:center;margin:8px 0">' + bodyAvatar(u.gender, muscles, _bodyView) + '</div>';
  h += '<div style="display:flex;gap:7px;flex-wrap:wrap;justify-content:center;margin-top:10px">';
  h += '<span class="mchip fresh">Ready</span><span class="mchip moderate">Moderate</span><span class="mchip tired">Recovering</span>';
  h += '</div></div>';
  h += sh('Muscle Status'); h += '<div class="card">';
  muscles.forEach(function(m) {
    var pc = m.pct || 100; var cl = m.s === 'fresh' ? '#00ff88' : m.s === 'moderate' ? '#ffb347' : '#ff5f6d';
    h += '<div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.05)">';
    h += '<div><div style="font-size:14px;font-weight:600">' + m.m + '</div><div style="font-size:11px;color:rgba(255,255,255,.35)">' + m.l + '</div></div>';
    h += '<div style="display:flex;align-items:center;gap:10px"><div style="width:70px;height:5px;background:#1e1e2a;border-radius:3px;overflow:hidden">';
    h += '<div style="height:5px;background:' + cl + ';border-radius:3px;width:' + pc + '%"></div></div>';
    h += '<span class="mchip ' + m.s + '" style="font-size:11px">' + m.l + '</span></div></div>';
  });
  h += '</div>';
  h += sh('Body Stats');
  h += '<div class="card"><div class="g2" style="gap:10px">';
  h += statBox(bmi, 'BMI', 'cyan');
  h += statBox(bw + 'kg', 'Weight', 'green');
  h += statBox(bh + 'cm', 'Height', 'purple');
  h += statBox(bmr, 'BMR kcal');
  h += statBox(tdee, 'TDEE kcal', 'yellow');
  h += statBox(WE.getStreak() + 'd', 'Streak', 'red');
  h += '</div></div>';
  if (latest.chest || latest.waist || latest.bicep) {
    h += sh('Latest Measurements'); h += '<div class="card"><div class="g2" style="gap:10px">';
    var mf = [['chest','Chest'],['waist','Waist'],['hips','Hips'],['bicep','Bicep'],['thigh','Thigh'],['shoulders','Shoulders'],['calf','Calf'],['neck','Neck']];
    mf.forEach(function(f) { if (latest[f[0]]) h += '<div class="met-box"><div class="met-val">' + latest[f[0]] + '<span style="font-size:12px;color:rgba(255,255,255,.35)">cm</span></div><div class="met-lbl">' + f[1] + '</div></div>'; });
    if (latest.bf) h += '<div class="met-box"><div class="met-val">' + latest.bf + '<span style="font-size:12px;color:rgba(255,255,255,.35)">%</span></div><div class="met-lbl">Body Fat</div></div>';
    h += '</div></div>';
  }
  h += sh('Strength Targets');
  h += '<div class="card"><div style="font-size:12px;color:rgba(255,255,255,.4);margin-bottom:10px">Based on your stats and goal</div>';
  var exp = u.exp || 'intermediate'; var g = u.gender || 'male';
  var m2 = exp === 'beginner' ? .42 : exp === 'intermediate' ? .68 : .92; if (g === 'female') m2 *= .65;
  [['Bench Press',bw*.75],['Squat',bw*1],['Deadlift',bw*1.25],['Overhead Press',bw*.5],['Barbell Row',bw*.7]].forEach(function(lift) {
    var target = Math.round(lift[1] * m2 / 2.5) * 2.5;
    var prev = WE.getPrev(lift[0]); var cur = prev && prev.sets && prev.sets[0] ? prev.sets[0].weight : null;
    h += '<div style="display:flex;align-items:center;justify-content:space-between;padding:9px 0;border-bottom:1px solid rgba(255,255,255,.05)">';
    h += '<div><div style="font-size:14px;font-weight:600">' + lift[0] + '</div>';
    h += '<div style="font-size:11px;color:rgba(255,255,255,.35)">Target for ' + exp + '</div></div>';
    h += '<div style="text-align:right"><div style="font-size:16px;font-weight:800;color:#00d5ff">' + target + 'kg</div>';
    if (cur) h += '<div style="font-size:11px;color:rgba(255,255,255,.35)">Current: ' + cur + 'kg</div>';
    h += '</div></div>';
  });
  h += '</div>';
  h += '<div style="padding:12px 12px 20px"><button class="btn btn-p" onclick="logMetricModal()">+ Log Body Metrics</button></div>';
  h += '<div style="height:18px"></div></div>';
  return h;
});

/* === AI COACH SCREEN === */
reg('ai', function() {
  var readiness = AI.readiness(); var rl = AI.rl(readiness);
  var insights = AI.insights(); var muscles = AI.muscleStatus(); var ws = S.g('workouts') || [];
  var h = '';
  h += topbar('AI Coach');
  h += '<div class="screen">';
  h += '<div class="card card-glow" style="margin-top:12px;background:rgba(124,111,255,.07)">';
  h += '<div style="display:flex;align-items:center;gap:13px;margin-bottom:13px">';
  h += '<div style="width:54px;height:54px;background:linear-gradient(135deg,#7c6fff,#ff5f6d);border-radius:20px;display:flex;align-items:center;justify-content:center;font-size:28px">🤖</div>';
  h += '<div><div style="font-size:18px;font-weight:800">Coach AI</div><div style="font-size:13px;color:#7c6fff">Readiness ' + readiness + '% &middot; ' + rl.l + '</div></div></div>';
  h += '<div class="ai-msg"><p>' + AI.coachMsg() + '</p></div></div>';
  h += sh('Todays Insights'); insights.forEach(function(ins) { h += insCard(ins); });
  h += sh('Muscle Recovery'); h += '<div class="card">';
  muscles.forEach(function(m) {
    h += '<div style="display:flex;align-items:center;justify-content:space-between;padding:9px 0;border-bottom:1px solid rgba(255,255,255,.05)">';
    h += '<div><div style="font-size:14px;font-weight:600">' + m.m + '</div>';
    h += '<div style="font-size:11px;color:rgba(255,255,255,.35)">' + (m.s === 'tired' ? '24-48hr recovery needed' : m.s === 'moderate' ? 'Light training OK' : 'Fully recovered') + '</div></div>';
    h += '<span class="mchip ' + m.s + '">' + m.l + '</span></div>';
  });
  h += '</div>';
  h += sh('Your Progress'); h += '<div class="card">';
  if (!ws.length) { h += '<p style="color:rgba(255,255,255,.35)">Log workouts to get AI analysis.</p>'; }
  else {
    h += '<div class="g2" style="gap:10px;margin-bottom:12px">';
    h += statBox(ws.length, 'Workouts', 'cyan');
    h += statBox(ws.filter(function(w) { return w.prCount > 0; }).length, 'PR Days', 'green');
    h += statBox(WE.getStreak(), 'Streak', 'purple');
    h += statBox(Math.round(WE.getWeekVol() / 1000) + 't', 'Week Vol');
    h += '</div>';
    h += '<div class="ai-msg"><p>You have completed ' + ws.length + ' workouts with a ' + WE.getStreak() + ' day streak. ' + (WE.getStreak() >= 7 ? 'Outstanding consistency! Keep it up.' : 'Aim for 3+ sessions per week for best results.') + '</p></div>';
  }
  h += '</div>';
  h += sh('Quick Actions'); h += '<div class="card">';
  h += '<button class="btn btn-p mb12" onclick="go(\'workout\')">💪 Start Workout</button>';
  h += '<button class="btn btn-s mb12" onclick="go(\'recovery\')">😴 Log Recovery</button>';
  h += '<button class="btn btn-s mb12" onclick="go(\'body\')">🧬 Body Clone</button>';
  h += '<button class="btn btn-s" onclick="go(\'exercises\')">📚 Exercise Library</button>';
  h += '</div><div style="height:18px"></div></div>';
  return h;
});

/* === RECOVERY SCREEN === */
reg('recovery', function() {
  var r = S.g('recovery') || {}; var readiness = AI.readiness(); var rl = AI.rl(readiness);
  var h = '';
  h += topbar('Recovery');
  h += '<div class="screen">';
  h += '<div class="card card-glow" style="margin-top:12px;background:' + rl.bg + ';text-align:center">';
  h += '<div class="hero-n">' + readiness + '</div><div class="hero-l">Recovery Score</div>';
  h += '<p style="margin-top:9px;font-size:14px;color:rgba(255,255,255,.6)">' + (readiness >= 80 ? 'Excellent. Ready to push hard.' : readiness >= 60 ? 'Good. Train as planned.' : readiness >= 40 ? 'Moderate. Reduce intensity.' : 'Rest or active recovery recommended.') + '</p></div>';
  h += sh('Log Today'); h += '<div class="card">';
  function sldr(id, lbl, min, max, step, val, unit, color) {
    return '<div style="margin-bottom:16px"><label class="field-label">' + lbl + '</label><div style="display:flex;align-items:center;gap:11px;margin:5px 0"><span style="font-size:20px;font-weight:800;color:' + color + ';min-width:50px;flex-shrink:0" id="' + id + '-v">' + val + (unit || '') + '</span><input class="sldr" type="range" min="' + min + '" max="' + max + '" step="' + step + '" value="' + val + '" oninput="updSl(\'' + id + '\',this.value,\'' + unit + '\')"></div></div>';
  }
  h += sldr('sleep', 'Sleep (hours)', 4, 10, .5, r.sleep || 7.5, 'h', '#00d5ff');
  h += sldr('soreness', 'Muscle Soreness', 1, 10, 1, r.soreness || 3, '', '#ff5f6d');
  h += sldr('stress', 'Stress Level', 1, 10, 1, r.stress || 4, '', '#ffb347');
  h += sldr('energy', 'Energy Level', 1, 10, 1, r.energy || 7, '', '#00ff88');
  h += sldr('hydration', 'Water Intake', .5, 5, .5, r.hydration || 2.5, 'L', '#7c6fff');
  h += '<button class="btn btn-p" onclick="saveRecovery()">Save Recovery Data</button></div>';
  h += sh('Coach Tips'); h += '<div class="card">';
  AI.insights().forEach(function(ins) { h += '<div style="margin-bottom:10px;padding-bottom:10px;border-bottom:1px solid rgba(255,255,255,.05)"><div style="font-size:14px;font-weight:700;color:' + ins.c + ';margin-bottom:3px">' + ins.i + ' ' + ins.t + '</div><p style="font-size:13px;color:rgba(255,255,255,.55);margin:0;line-height:1.5">' + ins.m + '</p></div>'; });
  h += '</div><div style="height:18px"></div></div>';
  return h;
});

function updSl(id, val, unit) { var el = document.getElementById(id + '-v'); if (el) el.textContent = val + (unit || ''); S.set('recovery.' + id, parseFloat(val)); }
function saveRecovery() { toast('Recovery logged!'); go('home'); }
