'use strict';

/* ══════════════════════════════════════════════════════
   ROUTER
══════════════════════════════════════════════════════ */
const _screens = {};
let _currentScreen = null;

function reg(id, fn) { _screens[id] = fn; }
window.reg = reg;

function go(id, data) {
  try {
    if (!_screens[id]) throw new Error('Screen "' + id + '" not registered');
    _currentScreen = id;
    const html = _screens[id](data) || '';
    const v = document.getElementById('view');
    if (!v) return;
    v.scrollTop = 0;
    const div = document.createElement('div');
    div.className = 'screen';
    div.innerHTML = html;
    v.innerHTML = '';
    v.appendChild(div);
    const nav = document.getElementById('nav');
    const noNav = ['onboarding'];
    if (nav) nav.style.display = noNav.includes(id) ? 'none' : 'flex';
    document.querySelectorAll('.nb').forEach(b => b.classList.remove('on'));
    const nb = document.getElementById('nb-' + id);
    if (nb) nb.classList.add('on');
  } catch(e) {
    console.error('go(' + id + ')', e);
    const v = document.getElementById('view');
    if (v) v.innerHTML = '<div style="padding:28px 20px;color:#ff4444;font-size:14px;line-height:1.6">' +
      '<div style="font-size:32px;margin-bottom:12px">⚠️</div>' +
      '<strong>Screen error: ' + id + '</strong><br>' + e.message +
      '<br><br><button onclick="go(\'dashboard\')" style="background:var(--bg3);border:1px solid var(--border);color:var(--txt);padding:10px 20px;border-radius:12px;font-size:14px;cursor:pointer">← Back to Home</button>' +
      '</div>';
  }
}
window.go = go;

/* ══════════════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════════════ */
function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function isoNow() { return new Date().toISOString(); }
function today() { return new Date().toISOString().slice(0,10); }
function fmtDate(d) { try { return new Date(d).toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short'}); } catch(e){return d||'';} }
function fmtTime(secs) { const m=Math.floor(secs/60),s=secs%60; return (m<10?'0':'')+m+':'+(s<10?'0':'')+s; }
function fmtMins(mins) { return mins<60?mins+'m':Math.floor(mins/60)+'h '+(mins%60?mins%60+'m':''); }
function daysAgo(d) { return Math.floor((Date.now() - new Date(d)) / 864e5); }
function greet() { const h=new Date().getHours(); return h<12?'Good morning':h<17?'Good afternoon':'Good evening'; }
function round2(n) { return Math.round(n*100)/100; }
window.esc=esc;window.isoNow=isoNow;window.today=today;window.fmtDate=fmtDate;
window.fmtTime=fmtTime;window.fmtMins=fmtMins;window.daysAgo=daysAgo;window.greet=greet;

/* ══════════════════════════════════════════════════════
   TOAST
══════════════════════════════════════════════════════ */
let _toastTimer = null;
function toast(msg, type, dur) {
  const t = document.getElementById('toast');
  if (!t) return;
  const icons = { ok:'✅', err:'❌', pr:'🏆', achieve:'🎖️', warn:'⚠️', info:'ℹ️' };
  t.querySelector('.toast-icon').textContent = icons[type||'ok']||'✅';
  t.querySelector('.toast-msg').textContent = msg;
  t.className = 't-' + (type||'ok') + ' show';
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => { t.className = ''; }, dur||3200);
}
window.toast = toast;

function haptic(p) { if (navigator.vibrate) navigator.vibrate(p||25); }
window.haptic = haptic;

/* ══════════════════════════════════════════════════════
   UI BUILDERS
══════════════════════════════════════════════════════ */
function sh(title, action, onclick) {
  return '<div class="sh"><div class="sh-t">' + esc(title) + '</div>' +
    (action?'<div class="sh-s tappable" onclick="'+onclick+'">'+esc(action)+'</div>':'') + '</div>';
}
function emptyState(icon, title, sub, btnLabel, btnCb) {
  return '<div class="empty"><div class="empty-icon">'+icon+'</div>' +
    '<div class="empty-title">'+esc(title)+'</div>' +
    '<div class="empty-sub">'+esc(sub)+'</div>' +
    (btnLabel?'<button class="btn btn-secondary btn-sm" onclick="'+btnCb+'">'+esc(btnLabel)+'</button>':'') + '</div>';
}
function modal(title, bodyHtml, footerHtml) {
  closeModal();
  const d = document.createElement('div');
  d.className = 'modal-overlay'; d.id = '_modal';
  d.onclick = e => { if(e.target===d) closeModal(); };
  d.innerHTML = '<div class="modal-sheet"><div class="modal-handle"></div>' +
    (title?'<div class="modal-title">'+esc(title)+'</div>':'') +
    bodyHtml + (footerHtml||'') + '</div>';
  document.body.appendChild(d);
}
function closeModal() { const m = document.getElementById('_modal'); if(m) m.remove(); }
window.sh=sh;window.emptyState=emptyState;window.modal=modal;window.closeModal=closeModal;

/* ══════════════════════════════════════════════════════
   RING HTML HELPER
══════════════════════════════════════════════════════ */
function buildRing(pct, color, label, sublabel) {
  const r=30, circ=2*Math.PI*r, dash=circ*Math.min(pct,100)/100;
  return '<div class="ring-wrap">' +
    '<div class="ring-outer">' +
    '<svg class="ring-svg" width="76" height="76" viewBox="0 0 76 76">' +
    '<circle class="ring-track" cx="38" cy="38" r="'+r+'"/>' +
    '<circle class="ring-prog" cx="38" cy="38" r="'+r+'" stroke="'+color+'" stroke-dasharray="'+circ+'" stroke-dashoffset="'+(circ-dash)+'"/>' +
    '</svg>' +
    '<div class="ring-center"><div class="ring-pct">'+Math.round(pct)+'%</div>' +
    (sublabel?'<div class="ring-sub">'+esc(sublabel)+'</div>':'') + '</div></div>' +
    '<div class="ring-label">'+esc(label)+'</div></div>';
}
window.buildRing = buildRing;

/* ══════════════════════════════════════════════════════
   CANVAS ANIMATION
══════════════════════════════════════════════════════ */
function initCanvas() {
  const c = document.getElementById('bg-canvas');
  if (!c) return;
  const ctx = c.getContext('2d');
  let W, H;
  const orbs = [];
  function resize() { W=c.width=window.innerWidth; H=c.height=window.innerHeight; }
  function initOrbs() {
    orbs.length = 0;
    for (let i=0; i<4; i++) {
      orbs.push({
        x:Math.random()*W, y:Math.random()*H,
        r:Math.random()*180+120,
        vx:(Math.random()-0.5)*0.4, vy:(Math.random()-0.5)*0.4,
        primary:i<2
      });
    }
  }
  function getColor(primary) {
    const s = getComputedStyle(document.documentElement);
    const rgb = s.getPropertyValue(primary?'--c1-rgb':'--c2-rgb').trim();
    return rgb || (primary?'0,213,255':'107,95,255');
  }
  function draw() {
    ctx.clearRect(0,0,W,H);
    orbs.forEach(o => {
      const grad = ctx.createRadialGradient(o.x,o.y,0,o.x,o.y,o.r);
      const rgb = getColor(o.primary);
      grad.addColorStop(0,'rgba('+rgb+','+(o.primary?'0.07':'0.05')+')');
      grad.addColorStop(1,'rgba('+rgb+',0)');
      ctx.beginPath(); ctx.arc(o.x,o.y,o.r,0,Math.PI*2);
      ctx.fillStyle=grad; ctx.fill();
      o.x+=o.vx; o.y+=o.vy;
      if(o.x<-o.r||o.x>W+o.r) o.vx*=-1;
      if(o.y<-o.r||o.y>H+o.r) o.vy*=-1;
    });
    requestAnimationFrame(draw);
  }
  resize(); initOrbs(); draw();
  window.addEventListener('resize', () => { resize(); initOrbs(); });
}

/* ══════════════════════════════════════════════════════
   THEME MANAGER
══════════════════════════════════════════════════════ */
function applyTheme(t) {
  document.documentElement.setAttribute('data-theme', t||'carbon');
  S.set('user.theme', t||'carbon');
}
window.applyTheme = applyTheme;

/* ══════════════════════════════════════════════════════
   ENGINE — READINESS
══════════════════════════════════════════════════════ */
const ReadinessEngine = {
  score() {
    try {
      const r = S.g('recovery') || {};
      const ws = S.g('workouts') || [];
      let score = 100;
      const sleep = r.sleep || 7.5;
      if (sleep < 5) score -= 35;
      else if (sleep < 6) score -= 22;
      else if (sleep < 7) score -= 12;
      else if (sleep >= 8) score += 5;
      const soreness = r.soreness || 3;
      score -= soreness * 4;
      const stress = r.stress || 4;
      score -= stress * 2.5;
      const energy = r.energy || 7;
      score += (energy - 5) * 3;
      const hydration = r.hydration || 2.5;
      if (hydration < 1.5) score -= 8;
      else if (hydration >= 3) score += 3;
      const recentTraining = ws.filter(w => daysAgo(w.date) < 3).length;
      if (recentTraining >= 3) score -= 15;
      else if (recentTraining >= 2) score -= 5;
      const streak = StreakEngine.get();
      if (streak >= 7) score -= 15;
      else if (streak >= 5) score -= 8;
      return Math.max(0, Math.min(100, Math.round(score)));
    } catch(e) { return 70; }
  },
  label(s) {
    if (s >= 85) return { l:'Peak', cls:'rl-peak' };
    if (s >= 70) return { l:'Ready', cls:'rl-ready' };
    if (s >= 50) return { l:'Moderate', cls:'rl-moderate' };
    return { l:'Rest Day', cls:'rl-rest' };
  },
  message(score) {
    if (score >= 85) return 'All systems optimal. Chase PRs and push hard today — your body is primed.';
    if (score >= 70) return 'Ready to train. Stick to your planned weights and listen to your body.';
    if (score >= 50) return 'Moderate readiness. Reduce intensity 10-15% and focus on quality over quantity.';
    return 'Recovery is low. Consider rest or a light mobility session today.';
  },
  recommendation(score) {
    if (score >= 85) return 'train heavy';
    if (score >= 70) return 'train normal';
    if (score >= 50) return 'train light';
    return 'rest or mobility';
  },
  coachQuote(score, personality) {
    const p = personality || S.g('user.coachPersonality') || 'maya';
    const quotes = {
      alex: [
        score >= 85 ? 'Peak condition. No excuses — max weights today. Let\'s go.' : '',
        score >= 70 ? 'Enough sleep to grind. Weak is a choice. Not yours.' : '',
        score >= 50 ? 'Moderate today. Still hit the gym. Pain is just data.' : '',
        'Rest is strategic retreat. Come back stronger tomorrow.'
      ],
      maya: [
        score >= 85 ? 'Recovery metrics are optimal. Your neuromuscular system is primed for high-intensity output.' : '',
        score >= 70 ? 'Recovery data shows readiness for standard training. Execute the plan precisely.' : '',
        score >= 50 ? 'Reduced HRV indicators suggest lowering intensity. Quality beats volume today.' : '',
        'Physiological data supports active recovery. Mobility and sleep optimisation recommended.'
      ],
      sam: [
        score >= 85 ? 'Oh yeah! You are FIRED UP today! Every single rep is going to count. Let\'s crush it!' : '',
        score >= 70 ? 'You\'ve got this! Your body is ready — now let your mind follow. Make it count!' : '',
        score >= 50 ? 'Hey, showing up is already a win. Do what you can — even 60% effort builds momentum!' : '',
        'Rest days are part of the journey too. You\'re still being a champion by choosing recovery!'
      ],
      zen: [
        score >= 85 ? 'Your body and mind are in harmony today. Move with intention, breathe with purpose.' : '',
        score >= 70 ? 'Listen to your body as you train today. It will tell you exactly what it needs.' : '',
        score >= 50 ? 'Honour where you are, not where you wish you were. Gentle movement today serves you.' : '',
        'True strength includes knowing when to rest. This is wisdom, not weakness.'
      ],
      rex: [
        score >= 85 ? 'Bar is loaded. You\'re ready. Strength is built on days like this.' : '',
        score >= 70 ? 'Strong enough to train. Weak enough to be careful. Hit the numbers, nothing fancy.' : '',
        score >= 50 ? 'Under-recovered athletes get hurt. Reduce the load, keep the frequency.' : '',
        'Even powerlifters take deload weeks. Rest is programming, not laziness.'
      ]
    };
    const arr = quotes[p] || quotes.maya;
    if (score >= 85) return arr[0] || arr[arr.length-1];
    if (score >= 70) return arr[1] || arr[arr.length-1];
    if (score >= 50) return arr[2] || arr[arr.length-1];
    return arr[3] || arr[arr.length-1];
  }
};
window.ReadinessEngine = ReadinessEngine;

/* ══════════════════════════════════════════════════════
   ENGINE — STREAK
══════════════════════════════════════════════════════ */
const StreakEngine = {
  get() {
    try {
      const ws = S.g('workouts') || [];
      if (!ws.length) return 0;
      const dates = [...new Set(ws.map(w => w.date.slice(0,10)))].sort().reverse();
      let streak = 0;
      for (let i=0; i<dates.length; i++) {
        const diff = Math.round((Date.now() - new Date(dates[i])) / 864e5);
        if (diff === i || diff === i+1) streak++;
        else break;
      }
      return streak;
    } catch(e) { return 0; }
  },
  weekWorkouts() {
    const ws = S.g('workouts') || [];
    const cutoff = Date.now() - 7*864e5;
    return ws.filter(w => new Date(w.date) > cutoff);
  },
  totalVolume() { return (S.g('workouts')||[]).reduce((a,w)=>a+(w.totalVol||0),0); },
  weekVolume() { return this.weekWorkouts().reduce((a,w)=>a+(w.totalVol||0),0); }
};
window.StreakEngine = StreakEngine;

/* ══════════════════════════════════════════════════════
   ENGINE — PROGRESSION
══════════════════════════════════════════════════════ */
const ProgEngine = {
  epley(w, r) { if(!w||!r) return 0; return r===1 ? w : Math.round(w*(1+r/30)); },
  checkPR(name, weight, reps) {
    const ws = S.g('workouts') || [];
    let best = 0;
    ws.forEach(wo => (wo.exercises||[]).forEach(ex => {
      if (ex.name===name) (ex.sets||[]).forEach(s => {
        if (s.done) best = Math.max(best, this.epley(s.weight||0, s.reps||0));
      });
    }));
    return this.epley(weight,reps) > best && best > 0;
  },
  savePR(name, weight, reps, date) {
    const prs = S.g('prs') || [];
    const idx = prs.findIndex(p => p.exercise===name);
    const entry = { exercise:name, weight, reps, e1rm:this.epley(weight,reps), date };
    if (idx>=0) prs[idx]=entry; else prs.push(entry);
    S.set('prs', prs);
  },
  suggest(name, goal) {
    const ws = S.g('workouts') || [];
    for (let i=ws.length-1; i>=0; i--) {
      const ex = (ws[i].exercises||[]).find(e=>e.name===name);
      if (ex && ex.sets && ex.sets.length) {
        const allDone = ex.sets.filter(s=>s.reps).every(s=>s.done);
        const w = ex.sets[0].weight || 0;
        if (allDone) {
          const inc = goal==='strength'?2.5:goal==='hypertrophy'?1.25:1.25;
          return round2(w + inc);
        }
        return w;
      }
    }
    return null;
  },
  prevString(name) {
    const ws = S.g('workouts') || [];
    for (let i=ws.length-1; i>=0; i--) {
      const ex = (ws[i].exercises||[]).find(e=>e.name===name);
      if (ex && ex.sets && ex.sets.length) {
        const s = ex.sets[0];
        const u = S.g('user.units')==='imperial'?'lb':'kg';
        return 'Last: '+(s.weight||0)+u+' × '+(s.reps||0)+' reps';
      }
    }
    return null;
  },
  doubleProgression(name, goal) {
    const ws = S.g('workouts') || [];
    let lastEx = null;
    for (let i=ws.length-1; i>=0; i--) {
      const ex = (ws[i].exercises||[]).find(e=>e.name===name);
      if (ex) { lastEx=ex; break; }
    }
    if (!lastEx || !lastEx.sets || !lastEx.sets.length) return null;
    const reps = lastEx.sets.map(s=>s.reps||0);
    const goalReps = goal==='strength' ? 5 : 12;
    const allHit = reps.every(r=>r>=goalReps);
    const w = lastEx.sets[0].weight || 0;
    if (allHit) {
      const inc = goal==='strength'?2.5:1.25;
      return { weight:round2(w+inc), reps:goalReps, note:'Add '+(goal==='strength'?'2.5':'1.25')+'kg — you hit all reps last session!' };
    }
    return { weight:w, reps:goalReps, note:'Hit all '+goalReps+' reps on every set before adding weight.' };
  }
};
window.ProgEngine = ProgEngine;

/* ══════════════════════════════════════════════════════
   ENGINE — SPLIT
══════════════════════════════════════════════════════ */
const SplitEngine = {
  _ppl: [
    { n:'Push A — Upper Chest & Front Delts', muscles:['upper_chest','front_delts'],
      exercises:['Incline Barbell Bench Press','Overhead Press','Cable Lateral Raise','Incline Dumbbell Fly','Front Delt Raise'],
      warmup:['Band Pull-Aparts × 15','Arm Circles × 10 each','Light Shoulder Press × 15 BW'] },
    { n:'Pull A — Lats & Bicep Thickness', muscles:['lats','biceps'],
      exercises:['Barbell Row','Lat Pulldown','Cable Row','EZ Bar Curl','Deadlift'],
      warmup:['Dead Hangs × 30s','Band Pull-Aparts × 15','Cat-Cow × 10'] },
    { n:'Legs A — Quads & Calves', muscles:['quads','calves'],
      exercises:['Back Squat','Leg Press','Leg Extension','Standing Calf Raise','Goblet Squat'],
      warmup:['Hip Circles × 10 each','Leg Swings × 15 each','Goblet Squat × 10 BW','Ankle Rolls × 10'] },
    { n:'Push B — Chest & Side Delts', muscles:['lower_chest','side_delts','triceps'],
      exercises:['Flat Barbell Bench Press','Dumbbell Lateral Raise','Machine Chest Press','Tricep Pushdown','Overhead Tricep Extension'],
      warmup:['Arm Circles × 10','Band Pull-Aparts × 15','Push-Ups × 10 BW'] },
    { n:'Pull B — Upper Back & Rear Delts', muscles:['upper_back','rear_delts','biceps'],
      exercises:['Seated Cable Row','Face Pulls','Rear Delt Fly','Hammer Curl','Incline Dumbbell Curl'],
      warmup:['Band Pull-Aparts × 15','Cat-Cow × 10','Dead Hangs × 20s'] },
    { n:'Legs B — Hamstrings & Glutes', muscles:['hamstrings','glutes','calves'],
      exercises:['Romanian Deadlift','Leg Curl','Hip Thrust','Seated Calf Raise','Cable Pull-Through'],
      warmup:['Hip Circles × 10 each','Glute Bridges × 20 BW','Leg Swings × 15','Hip Flexor Stretch × 30s'] }
  ],
  _ul: [
    { n:'Upper A — Chest & Back', muscles:['chest','back','biceps','triceps'],
      exercises:['Barbell Bench Press','Barbell Row','Overhead Press','Lat Pulldown','Dumbbell Curl','Tricep Pushdown'],
      warmup:['Arm Circles × 10','Band Pull-Aparts × 15','Light Rows × 15 BW'] },
    { n:'Lower A — Quads Focus', muscles:['quads','hamstrings','calves'],
      exercises:['Back Squat','Romanian Deadlift','Leg Press','Leg Curl','Calf Raise'],
      warmup:['Hip Circles × 10','Leg Swings × 15','Goblet Squat × 10 BW'] },
    { n:'Upper B — Shoulders & Arms', muscles:['shoulders','biceps','triceps'],
      exercises:['Overhead Press','Dumbbell Lateral Raise','Face Pulls','EZ Bar Curl','Skull Crushers','Cable Curl'],
      warmup:['Shoulder Rolls × 10','Band Pull-Aparts × 15','Arm Circles × 10'] },
    { n:'Lower B — Posterior Chain', muscles:['glutes','hamstrings','calves'],
      exercises:['Deadlift','Hip Thrust','Leg Curl','Good Morning','Seated Calf Raise'],
      warmup:['Hip Circles × 10','Glute Bridges × 20 BW','Leg Swings × 15'] }
  ],
  _fb: [
    { n:'Full Body A', muscles:['chest','back','legs','shoulders'],
      exercises:['Back Squat','Barbell Row','Barbell Bench Press','Overhead Press','Dumbbell Curl','Tricep Pushdown'],
      warmup:['Hip Circles × 10','Arm Circles × 10','Jumping Jacks × 20'] },
    { n:'Full Body B', muscles:['legs','back','chest','core'],
      exercises:['Deadlift','Lat Pulldown','Incline Dumbbell Press','Dumbbell Lateral Raise','Face Pulls','Plank 60s'],
      warmup:['Leg Swings × 15','Band Pull-Aparts × 15','Light Squats × 15 BW'] },
    { n:'Full Body C', muscles:['legs','chest','shoulders','arms'],
      exercises:['Leg Press','Dumbbell Bench Press','Arnold Press','Cable Row','EZ Bar Curl','Overhead Tricep Extension'],
      warmup:['Hip Circles × 10','Arm Circles × 10','Bodyweight Squats × 15'] }
  ],
  _bro: [
    { n:'Chest Day', muscles:['chest'], exercises:['Barbell Bench Press','Incline Barbell Bench Press','Cable Fly','Dumbbell Fly','Chest Dip'],
      warmup:['Arm Circles × 10','Push-Ups × 10'] },
    { n:'Back Day', muscles:['back'], exercises:['Deadlift','Barbell Row','Lat Pulldown','Seated Cable Row','Face Pulls'],
      warmup:['Dead Hangs × 20s','Band Pull-Aparts × 15'] },
    { n:'Shoulders Day', muscles:['shoulders'], exercises:['Overhead Press','Dumbbell Lateral Raise','Front Delt Raise','Rear Delt Fly','Upright Row'],
      warmup:['Shoulder Rolls × 10','Band Pull-Aparts × 15'] },
    { n:'Arms Day', muscles:['biceps','triceps'], exercises:['Barbell Curl','Hammer Curl','Incline Dumbbell Curl','Tricep Pushdown','Skull Crushers','Overhead Tricep Extension'],
      warmup:['Arm Circles × 10','Wrist Rolls × 10'] },
    { n:'Legs Day', muscles:['legs'], exercises:['Back Squat','Leg Press','Romanian Deadlift','Leg Curl','Leg Extension','Calf Raise'],
      warmup:['Hip Circles × 10','Leg Swings × 15','Goblet Squat × 10 BW'] }
  ],
  _str: [
    { n:'Squat Day', muscles:['quads','glutes','core'], exercises:['Back Squat','Front Squat','Leg Press','Leg Extension','Core Work'],
      warmup:['Hip Circles × 10','Goblet Squat × 10 BW','Leg Swings × 15'] },
    { n:'Press Day', muscles:['chest','shoulders','triceps'], exercises:['Barbell Bench Press','Overhead Press','Tricep Pushdown','Dumbbell Lateral Raise'],
      warmup:['Arm Circles × 10','Band Pull-Aparts × 15'] },
    { n:'Pull Day', muscles:['back','biceps'], exercises:['Deadlift','Barbell Row','Lat Pulldown','EZ Bar Curl','Face Pulls'],
      warmup:['Dead Hangs × 20s','Cat-Cow × 10'] },
    { n:'Accessory Day', muscles:['shoulders','arms','core'], exercises:['Overhead Press','Hammer Curl','Tricep Pushdown','Face Pulls','Plank'],
      warmup:['Shoulder Rolls × 10','Arm Circles × 10'] }
  ],
  _home: [
    { n:'Push Day', muscles:['chest','shoulders','triceps'], exercises:['Push-Ups','Pike Push-Ups','Dumbbell Press','Dumbbell Lateral Raise','Tricep Dip'],
      warmup:['Arm Circles × 10','Shoulder Rolls × 10'] },
    { n:'Pull Day', muscles:['back','biceps'], exercises:['Resistance Band Row','Band Pull-Aparts','Dumbbell Row','Dumbbell Curl'],
      warmup:['Cat-Cow × 10','Band Pull-Aparts × 15'] },
    { n:'Legs Day', muscles:['legs','glutes'], exercises:['Bodyweight Squat','Bulgarian Split Squat','Hip Thrust BW','Single Leg RDL','Calf Raise'],
      warmup:['Hip Circles × 10','Leg Swings × 15'] },
    { n:'Core & Cardio', muscles:['core','full_body'], exercises:['Plank','Mountain Climbers','Russian Twists','Burpees','Dead Bug'],
      warmup:['Jumping Jacks × 20','Arm Circles × 10'] }
  ],
  getSplitDay() {
    try {
      const user = S.g('user') || {};
      const split = user.split || 'ppl';
      const dayIdx = ((user.splitDay || 1) - 1);
      const days = this._getSplitDays(split);
      return days[dayIdx % days.length] || days[0];
    } catch(e) { return { n:'Rest Day', muscles:[], exercises:[], warmup:[] }; }
  },
  getNextDay() {
    try {
      const user = S.g('user') || {};
      const split = user.split || 'ppl';
      const dayIdx = user.splitDay || 1;
      const days = this._getSplitDays(split);
      return days[dayIdx % days.length] || days[0];
    } catch(e) { return null; }
  },
  _getSplitDays(split) {
    const m = { ppl:this._ppl, ul:this._ul, fb:this._fb, bro:this._bro, str:this._str, home:this._home };
    return m[split] || this._ppl;
  },
  nextDay() {
    const user = S.g('user') || {};
    const split = user.split || 'ppl';
    const days = this._getSplitDays(split);
    const next = ((user.splitDay || 1) % days.length) + 1;
    S.set('user.splitDay', next);
    return next;
  },
  getSubstitutes(exerciseName, reason) {
    if (typeof ExDB === 'undefined') return [];
    const ex = ExDB.byName(exerciseName);
    if (!ex) return [];
    return ExDB.db.filter(e =>
      e.n !== exerciseName &&
      (e.grp === ex.grp || (ex.pri && e.pri === ex.pri)) &&
      (!reason || !reason.includes('shoulder') || (e.joint && (e.joint.shoulder||0) < 2))
    ).slice(0,3).map(e => e.n);
  }
};
window.SplitEngine = SplitEngine;

/* ══════════════════════════════════════════════════════
   ENGINE — WEIGHT SUGGESTIONS
══════════════════════════════════════════════════════ */
const WeightEngine = {
  suggest(exerciseName, user) {
    const prev = ProgEngine.suggest(exerciseName, user.goal);
    if (prev !== null) return prev;
    const bw = user.weight || 75;
    const isMale = user.gender !== 'female';
    const ratios = {
      'Back Squat': isMale?[0.6,0.8,1.1,1.4]:[0.45,0.6,0.85,1.1],
      'Barbell Bench Press': isMale?[0.45,0.6,0.9,1.2]:[0.3,0.45,0.65,0.85],
      'Deadlift': isMale?[0.7,1.0,1.5,2.0]:[0.5,0.75,1.1,1.5],
      'Overhead Press': isMale?[0.3,0.4,0.6,0.8]:[0.2,0.3,0.45,0.6],
      'Barbell Row': isMale?[0.4,0.55,0.75,1.0]:[0.3,0.4,0.6,0.8]
    };
    const expMap = { beginner:0, intermediate:1, advanced:2, athlete:3 };
    const expIdx = expMap[user.exp || 'intermediate'] || 1;
    if (ratios[exerciseName]) return Math.round(bw * ratios[exerciseName][expIdx] / 2.5) * 2.5;
    return isMale ? Math.round(bw * 0.4) : Math.round(bw * 0.25);
  },
  warmupSets(workingWeight) {
    const w = parseFloat(workingWeight) || 20;
    return [
      { pct:40, weight:Math.round(w*0.4/2.5)*2.5, reps:8, label:'Warm-up 1' },
      { pct:60, weight:Math.round(w*0.6/2.5)*2.5, reps:5, label:'Warm-up 2' },
      { pct:80, weight:Math.round(w*0.8/2.5)*2.5, reps:3, label:'Feeler' }
    ];
  },
  progressionNote(exerciseName, workouts) {
    const ws = workouts || S.g('workouts') || [];
    let consecutive = 0;
    for (let i=ws.length-1; i>=0; i--) {
      const ex = (ws[i].exercises||[]).find(e=>e.name===exerciseName);
      if (ex && ex.sets && ex.sets.every(s=>s.done)) consecutive++;
      else break;
    }
    if (consecutive >= 2) return '🔥 Add weight — you\'ve hit all reps ' + consecutive + ' sessions in a row';
    if (consecutive === 1) return '✅ 1 more clean session → add weight next time';
    return null;
  },
  deloadCheck(user, workouts) {
    const ws = workouts || S.g('workouts') || [];
    if (ws.length < 5) return false;
    const last5 = ws.slice(-5);
    const monday = new Date(); monday.setDate(monday.getDate() - monday.getDay() + 1);
    const weeksTraining = Math.floor(daysAgo(ws[0].date) / 7);
    return weeksTraining >= 5 && last5.every(w => (w.totalVol||0) < (ws[0].totalVol||0));
  }
};
window.WeightEngine = WeightEngine;

/* ══════════════════════════════════════════════════════
   ENGINE — BODY CALCULATIONS
══════════════════════════════════════════════════════ */
const BodyEngine = {
  bmi(weight, height) {
    const h = height / 100;
    const bmi = round2(weight / (h*h));
    let cat = 'Normal';
    if (bmi < 18.5) cat='Underweight';
    else if (bmi < 25) cat='Normal';
    else if (bmi < 30) cat='Overweight';
    else cat='Obese';
    return { bmi, cat };
  },
  bmr(user) {
    const w=user.weight||75, h=user.height||175, a=user.age||25, g=user.gender||'male';
    return Math.round(g==='male' ? (10*w)+(6.25*h)-(5*a)+5 : (10*w)+(6.25*h)-(5*a)-161);
  },
  tdee(user) {
    const m = { sedentary:1.2, light:1.375, moderate:1.55, active:1.725, veryActive:1.9 };
    return Math.round(this.bmr(user) * (m[user.activityLevel||'moderate']||1.55));
  },
  healthyWeightRange(height, gender) {
    const h = height/100;
    return { min:Math.round(18.5*h*h), max:Math.round(24.9*h*h) };
  },
  fatLossProjection(user) {
    const weeks = [];
    let w = user.weight || 75;
    const target = user.goalWeight || (w - 5);
    for (let i=1; i<=12; i++) {
      w = round2(Math.max(target, w - 0.5));
      weeks.push({ week:i, weight:w, totalLost:round2((user.weight||75)-w) });
    }
    return weeks;
  },
  muscleBuildProjection(user) {
    const gainPerMonth = { beginner:1.5, intermediate:0.75, advanced:0.375, athlete:0.25 };
    return gainPerMonth[user.exp||'intermediate'] || 0.75;
  },
  timeToGoal(user) {
    const diff = Math.abs((user.weight||75) - (user.goalWeight||70));
    const rate = (user.goal==='hypertrophy'||user.goal==='strength') ? 0.75 : 0.5;
    return Math.ceil(diff / (rate * 4.33)) + ' months';
  }
};
window.BodyEngine = BodyEngine;

/* ══════════════════════════════════════════════════════
   ENGINE — MUSCLE RECOVERY
══════════════════════════════════════════════════════ */
const MuscleEngine = {
  _groups: ['Chest','Back','Shoulders','Quads','Hamstrings','Glutes','Biceps','Triceps','Core','Calves'],
  status() {
    try {
      const ws = S.g('workouts') || [];
      const now = Date.now();
      const lastTrained = {};
      ws.slice(-20).forEach(wo => {
        const hrs = (now - new Date(wo.date)) / 36e5;
        (wo.exercises||[]).forEach(ex => {
          if (!ex.muscles) return;
          (ex.muscles.primary||[]).forEach(m => {
            const key = m.charAt(0).toUpperCase()+m.slice(1);
            if (!lastTrained[key] || hrs < lastTrained[key]) lastTrained[key] = hrs;
          });
        });
      });
      return this._groups.map(name => {
        const hrs = lastTrained[name] || null;
        if (!hrs) return { name, status:'fresh', label:'Ready', pct:100, hrs:null, color:'var(--c1)' };
        if (hrs < 24) return { name, status:'sore', label:'Recovering', pct:Math.round(hrs/48*100), hrs:Math.round(hrs), color:'#ff6b35' };
        if (hrs < 48) return { name, status:'recovering', label:'Moderate', pct:Math.round(hrs/48*100), hrs:Math.round(hrs), color:'#f5c842' };
        return { name, status:'fresh', label:'Ready', pct:100, hrs:Math.round(hrs), color:'#10B981' };
      });
    } catch(e) { return []; }
  },
  injuryWarning(exerciseName) {
    const injuries = (S.g('injuries')||[]).filter(i=>!i.recovered);
    if (!injuries.length || typeof ExDB === 'undefined') return null;
    const ex = ExDB.byName(exerciseName);
    if (!ex || !ex.joint) return null;
    for (const inj of injuries) {
      const j = ex.joint;
      if (/shoulder/i.test(inj.bodyPart) && (j.shoulder||0)>=2) return inj.bodyPart;
      if (/knee/i.test(inj.bodyPart) && (j.knee||0)>=2) return inj.bodyPart;
      if (/back/i.test(inj.bodyPart) && (j.spine||0)>=2) return inj.bodyPart;
      if (/elbow/i.test(inj.bodyPart) && (j.elbow||0)>=2) return inj.bodyPart;
    }
    return null;
  },
  bodyMapColors() {
    const st = this.status();
    const map = {};
    st.forEach(m => { map[m.name.toLowerCase()] = m.color; });
    return map;
  }
};
window.MuscleEngine = MuscleEngine;

/* ══════════════════════════════════════════════════════
   ENGINE — SUPPLEMENT
══════════════════════════════════════════════════════ */
const SupplementDB = [
  { id:'creatine', name:'Creatine Monohydrate', cat:'Performance', timing:'anytime', dose:'5g', notes:'Daily consistency matters most. Time is irrelevant.', caffeine:false, halfLife:0 },
  { id:'whey', name:'Whey Protein', cat:'Protein', timing:'post', dose:'1 scoop (25-30g protein)', notes:'Take within 60 min post-workout.', caffeine:false, halfLife:0 },
  { id:'iso100', name:'ISO 100 Dymatize', cat:'Protein', timing:'post', dose:'1 scoop', notes:'Take within 30 min for optimal muscle protein synthesis.', caffeine:false, halfLife:0 },
  { id:'c4', name:'Pre-Workout C4', cat:'Pre-Workout', timing:'pre', dose:'1 scoop', notes:'Take 20-30 min before training. Avoid after 2pm if sleeping by 10pm.', caffeine:true, halfLife:5 },
  { id:'ghost', name:'Pre-Workout Ghost', cat:'Pre-Workout', timing:'pre', dose:'1 scoop', notes:'Take 20-30 min before. Contains caffeine.', caffeine:true, halfLife:5 },
  { id:'casein', name:'Casein Protein', cat:'Protein', timing:'night', dose:'1 scoop', notes:'Before bed — slow-digesting for overnight recovery.', caffeine:false, halfLife:0 },
  { id:'mass', name:'Mass Gainer', cat:'Protein', timing:'post', dose:'2 scoops', notes:'Post-workout or between meals for caloric surplus.', caffeine:false, halfLife:0 },
  { id:'bcaa', name:'BCAAs', cat:'Recovery', timing:'intra', dose:'5-10g', notes:'During training or post-workout.', caffeine:false, halfLife:0 },
  { id:'glutamine', name:'Glutamine', cat:'Recovery', timing:'post', dose:'5g', notes:'Post-workout to support recovery.', caffeine:false, halfLife:0 },
  { id:'omega3', name:'Omega-3 Fish Oil', cat:'Health', timing:'with_meal', dose:'2-3g', notes:'Take with meals to reduce GI issues.', caffeine:false, halfLife:0 },
  { id:'vitd', name:'Vitamin D3 + K2', cat:'Health', timing:'morning', dose:'2000-4000 IU', notes:'Morning with food for best absorption.', caffeine:false, halfLife:0 },
  { id:'zinc', name:'Zinc', cat:'Health', timing:'night', dose:'25-30mg', notes:'Before bed — enhances testosterone and sleep quality.', caffeine:false, halfLife:0 },
  { id:'magnesium', name:'Magnesium Glycinate', cat:'Recovery', timing:'night', dose:'300-400mg', notes:'Before bed — improves sleep quality and recovery.', caffeine:false, halfLife:0 },
  { id:'multi', name:'Multivitamin', cat:'Health', timing:'morning', dose:'1 serving', notes:'Morning with breakfast.', caffeine:false, halfLife:0 },
  { id:'collagen', name:'Collagen Peptides', cat:'Recovery', timing:'morning', dose:'10-15g', notes:'Morning with vitamin C for absorption.', caffeine:false, halfLife:0 },
  { id:'ashwa', name:'Ashwagandha', cat:'Adaptogen', timing:'night', dose:'300-600mg', notes:'Before bed — reduces cortisol, improves stress resilience.', caffeine:false, halfLife:0 },
  { id:'beta', name:'Beta-Alanine', cat:'Performance', timing:'pre', dose:'3.2g', notes:'Pre-workout. May cause harmless tingling.', caffeine:false, halfLife:0 },
  { id:'citrulline', name:'Citrulline Malate', cat:'Performance', timing:'pre', dose:'6-8g', notes:'Pre-workout for pump and endurance.', caffeine:false, halfLife:0 },
  { id:'caffeine', name:'Caffeine Pills', cat:'Stimulant', timing:'pre', dose:'100-200mg', notes:'Pre-workout. Limit after 2pm. Max 400mg/day.', caffeine:true, halfLife:5 },
  { id:'melatonin', name:'Melatonin', cat:'Sleep', timing:'night', dose:'0.5-3mg', notes:'30 min before bed. Start with lowest dose.', caffeine:false, halfLife:0 }
];
window.SupplementDB = SupplementDB;

const SupplementEngine = {
  getDueNow() {
    const userSupps = S.g('supplements') || [];
    const logs = S.g('supplementLogs') || [];
    const now = new Date();
    const h = now.getHours();
    return userSupps.filter(s => {
      const todayLogs = logs.filter(l => l.suppId===s.id && l.date===today());
      if (todayLogs.length > 0) return false;
      const timing = s.timing || '';
      if (timing==='morning' && h>=6 && h<10) return true;
      if (timing==='pre' && h>=7 && h<21) return true;
      if (timing==='post' && h>=7 && h<22) return true;
      if (timing==='night' && h>=19) return true;
      if (timing==='anytime' && h>=7 && h<22 && h%4===0) return true;
      return false;
    });
  },
  checkCaffeineWarning(supp, sleepHour) {
    if (!supp.caffeine) return null;
    const now = new Date().getHours();
    const cutoff = (sleepHour||22) - (supp.halfLife||5);
    if (now >= cutoff) return 'Caffeine now may affect sleep at ' + (sleepHour||22) + ':00. Consider half dose or skip.';
    return null;
  },
  getStack(goal) {
    const stacks = {
      hypertrophy: ['creatine','whey','bcaa','vitd','magnesium','zinc'],
      strength: ['creatine','c4','casein','omega3','vitd','zinc'],
      fat_loss: ['c4','bcaa','omega3','vitd','magnesium','multi'],
      recovery: ['glutamine','magnesium','omega3','vitd','ashwa','melatonin'],
      athletic: ['creatine','beta','citrulline','whey','omega3','vitd']
    };
    return (stacks[goal]||stacks.hypertrophy).map(id => SupplementDB.find(s=>s.id===id)).filter(Boolean);
  },
  markTaken(suppId) {
    S.push('supplementLogs', { suppId, date:today(), time:isoNow() });
    toast('Supplement logged ✅', 'ok');
  }
};
window.SupplementEngine = SupplementEngine;

/* ══════════════════════════════════════════════════════
   ENGINE — AI COACH
══════════════════════════════════════════════════════ */
const CoachEngine = {
  insights() {
    try {
      const r = S.g('recovery') || {};
      const score = ReadinessEngine.score();
      const streak = StreakEngine.get();
      const ws = S.g('workouts') || [];
      const weeklyGoal = S.g('user.weeklyGoal') || 4;
      const weekWkts = StreakEngine.weekWorkouts();
      const msgs = [];
      if ((r.sleep||7.5) < 6) msgs.push({t:'Critical Sleep Debt',m:'Under 6 hours impairs muscle protein synthesis and performance. Prioritise 8+ hours tonight.',i:'😴',c:'#ff4444'});
      else if ((r.sleep||7.5) >= 8) msgs.push({t:'Optimal Recovery',m:'8+ hours logged. Sleep is your most powerful performance tool.',i:'⚡',c:'#10B981'});
      if ((r.soreness||3) >= 7) msgs.push({t:'High Soreness Alert',m:'Significant soreness detected. Target fresh muscle groups or reduce volume 25%.',i:'💊',c:'#f5c842'});
      if (score >= 85) msgs.push({t:'Peak Performance Window',m:'Every metric is optimal. Today is the day to attempt PRs and push your working weights.',i:'🔥',c:'#10B981'});
      if (streak >= 5) msgs.push({t:'Deload Signal',m:streak+' consecutive training days. Schedule a deload — same frequency, 50% volume.',i:'⚠️',c:'#f5c842'});
      const rem = weeklyGoal - weekWkts.length;
      if (rem > 0 && rem <= 2) msgs.push({t:'Weekly Goal In Reach',m:weekWkts.length+'/'+weeklyGoal+' done. '+rem+' more to hit your target.',i:'🎯',c:'var(--c1)'});
      if ((r.hydration||2.5) < 1.5) msgs.push({t:'Hydration Critical',m:'Low water intake detected. Dehydration reduces strength up to 20%. Drink 500ml now.',i:'💧',c:'var(--c1)'});
      if (!msgs.length) msgs.push({t:'Looking Strong',m:'Recovery metrics solid. Execute the plan, track sets, keep the streak alive.',i:'✅',c:'#10B981'});
      return msgs.slice(0,4);
    } catch(e) { return []; }
  },
  cardioRec(splitDay, readiness) {
    const score = readiness || ReadinessEngine.score();
    const muscles = (splitDay && splitDay.muscles) || [];
    const isLegDay = muscles.some(m=>/quad|hamstring|leg/i.test(m));
    const protocols = {
      high: { machine:'Treadmill', duration:'25 min', details:'Speed 10-11 km/h, Incline 1%, Zone 3 cardio post-workout' },
      normal: { machine:'Stationary Bike', duration:'20 min', details:'Resistance 8-10, 80-90 RPM, steady state' },
      low: { machine:'Treadmill Walking', duration:'30 min', details:'5.5 km/h, Incline 2%, brisk walk — active recovery' },
      legDay: { machine:'Rowing Machine', duration:'15 min', details:'2:00/500m pace — upper body emphasis, minimal leg fatigue' }
    };
    if (isLegDay) return protocols.legDay;
    if (score >= 80) return protocols.high;
    if (score >= 60) return protocols.normal;
    return protocols.low;
  },
  motivationalQuote() {
    const quotes = [
      '"The pain you feel today will be the strength you feel tomorrow."',
      '"Success is the sum of small efforts, repeated day in and day out."',
      '"The only bad workout is the one that didn\'t happen."',
      '"Your body can stand almost anything. It\'s your mind you have to convince."',
      '"What seems impossible today will one day become your warm-up."',
      '"Strive for progress, not perfection."',
      '"The clock is ticking. Are you becoming the person you want to be?"',
      '"Champions aren\'t made in the gyms. Champions are made from something they have deep inside."',
      '"It never gets easier, you just get better."',
      '"Train hard, recover harder."'
    ];
    return quotes[new Date().getDate() % quotes.length];
  },
  weeklyReport() {
    const ws = S.g('workouts') || [];
    if (ws.length < 2) return null;
    const thisVol = StreakEngine.weekVolume();
    const lastVol = ws.filter(w => { const d=daysAgo(w.date); return d>=7&&d<14; }).reduce((a,w)=>a+(w.totalVol||0),0);
    const change = lastVol > 0 ? Math.round(((thisVol-lastVol)/lastVol)*100) : 0;
    return { thisVol, lastVol, change, weekWorkouts: StreakEngine.weekWorkouts().length };
  }
};
window.CoachEngine = CoachEngine;

/* ══════════════════════════════════════════════════════
   ENGINE — ACHIEVEMENTS
══════════════════════════════════════════════════════ */
const AchEngine = {
  all: [
    {id:'first_workout',n:'First Rep',d:'Complete your first workout',i:'🎯'},
    {id:'streak_3',n:'Hat Trick',d:'3-day workout streak',i:'🔥'},
    {id:'streak_7',n:'Week Warrior',d:'7-day streak',i:'⚡'},
    {id:'streak_14',n:'Fortnight Fighter',d:'14-day streak',i:'💥'},
    {id:'streak_30',n:'Iron Will',d:'30-day streak',i:'🏆'},
    {id:'workouts_10',n:'Getting Consistent',d:'10 workouts completed',i:'💪'},
    {id:'workouts_25',n:'On a Roll',d:'25 workouts completed',i:'🎱'},
    {id:'workouts_50',n:'Dedicated',d:'50 workouts completed',i:'🥇'},
    {id:'workouts_100',n:'Century Club',d:'100 workouts completed',i:'👑'},
    {id:'pr_first',n:'Record Breaker',d:'Set your first PR',i:'🏅'},
    {id:'pr_10',n:'PR Machine',d:'10 PRs set',i:'🎖️'},
    {id:'pr_25',n:'Elite Lifter',d:'25 PRs set',i:'💎'},
    {id:'vol_10k',n:'Volume Starter',d:'10,000kg total lifted',i:'🏋️'},
    {id:'vol_50k',n:'Volume Builder',d:'50,000kg total lifted',i:'🦍'},
    {id:'vol_100k',n:'Volume King',d:'100,000kg total lifted',i:'🦁'},
    {id:'early_bird',n:'Early Bird',d:'Complete a workout before 7am',i:'🌅'},
    {id:'night_owl',n:'Night Owl',d:'Complete a workout after 9pm',i:'🦉'},
    {id:'supp_7',n:'Supplement Consistent',d:'Log supplements 7 days in a row',i:'💊'},
    {id:'full_split',n:'Full Cycle',d:'Complete a full training split cycle',i:'♻️'},
    {id:'recovery_5',n:'Recovery Focused',d:'Log recovery check-in 5 times',i:'🧘'},
    {id:'bodymap',n:'Body Aware',d:'Track muscle recovery in Body Map',i:'🫀'},
  ],
  check() {
    try {
      const earned = S.g('achievements') || [];
      const ws = S.g('workouts') || [];
      const prs = S.g('prs') || [];
      const streak = StreakEngine.get();
      const totalVol = StreakEngine.totalVolume();
      const checks = {
        first_workout: ws.length>=1, streak_3:streak>=3, streak_7:streak>=7,
        streak_14:streak>=14, streak_30:streak>=30,
        workouts_10:ws.length>=10, workouts_25:ws.length>=25,
        workouts_50:ws.length>=50, workouts_100:ws.length>=100,
        pr_first:prs.length>=1, pr_10:prs.length>=10, pr_25:prs.length>=25,
        vol_10k:totalVol>=10000, vol_50k:totalVol>=50000, vol_100k:totalVol>=100000,
        early_bird:ws.some(w=>new Date(w.date).getHours()<7),
        night_owl:ws.some(w=>new Date(w.date).getHours()>=21),
      };
      this.all.forEach(a => {
        if (!earned.includes(a.id) && checks[a.id]) {
          earned.push(a.id);
          setTimeout(() => toast('🎖️ Achievement: '+a.n+'!', 'achieve', 5000), 800);
        }
      });
      S.set('achievements', earned);
    } catch(e) { console.warn('AchEngine.check', e); }
  }
};
window.AchEngine = AchEngine;

/* ══════════════════════════════════════════════════════
   ENGINE — TDEE
══════════════════════════════════════════════════════ */
const TDEEEngine = {
  calculate(user) {
    const bmr = BodyEngine.bmr(user);
    const tdee = BodyEngine.tdee(user);
    return { bmr, tdee, maintenance:tdee };
  },
  macroSplit(goal, tdee) {
    const splits = {
      hypertrophy: { p:0.3, c:0.45, f:0.25 },
      strength:    { p:0.35, c:0.4, f:0.25 },
      fat_loss:    { p:0.4, c:0.35, f:0.25 },
      maintenance: { p:0.3, c:0.4, f:0.3 },
      athletic:    { p:0.3, c:0.5, f:0.2 }
    };
    const s = splits[goal] || splits.maintenance;
    return {
      protein: Math.round((tdee * s.p) / 4),
      carbs:   Math.round((tdee * s.c) / 4),
      fat:     Math.round((tdee * s.f) / 9)
    };
  },
  deficitPlan(user) {
    const tdee = BodyEngine.tdee(user);
    const deficit = 500;
    const calories = tdee - deficit;
    return { calories, deficit, weeklyLoss:0.5, weeks:Math.ceil(((user.weight||75)-(user.goalWeight||70))/0.5) };
  },
  surplusPlan(user) {
    const tdee = BodyEngine.tdee(user);
    const surplus = 250;
    const monthlyGain = BodyEngine.muscleBuildProjection(user);
    return { calories:tdee+surplus, surplus, monthlyGain };
  }
};
window.TDEEEngine = TDEEEngine;

/* ══════════════════════════════════════════════════════
   NAV
══════════════════════════════════════════════════════ */
const NAV_TABS = [
  { id:'dashboard', label:'Home', icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>' },
  { id:'workout',   label:'Train', icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="5.5" cy="12" r="2.5"/><circle cx="18.5" cy="12" r="2.5"/><line x1="8" y1="12" x2="16" y2="12"/><circle cx="5.5" cy="7" r="1.5"/><circle cx="5.5" cy="17" r="1.5"/><circle cx="18.5" cy="7" r="1.5"/><circle cx="18.5" cy="17" r="1.5"/></svg>' },
  { id:'bodymap',   label:'Body', icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="5" r="2"/><path d="M12 7v4m-4 2l4-2 4 2m-8 0l-2 6m10-6l2 6M8 13l-1 6m10-6l1 6"/></svg>' },
  { id:'coach',     label:'Coach', icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>' },
  { id:'settings',  label:'Settings', icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>' }
];

function buildNav() {
  const nav = document.getElementById('nav');
  if (!nav) return;
  nav.innerHTML = NAV_TABS.map(t =>
    '<button class="nb" id="nb-'+t.id+'" onclick="go(\''+t.id+'\')">' +
    t.icon + '<span>'+t.label+'</span></button>'
  ).join('');
}
window.buildNav = buildNav;

/* ══════════════════════════════════════════════════════
   APP INIT
══════════════════════════════════════════════════════ */
// DISABLED window.addEventListener("load", () => {
  S.init();
  applyTheme(S.g('user.theme') || 'carbon');
  buildNav();
  initCanvas();
  if (!S.g('onboarded')) {
    go('onboarding');
  } else {
    go('dashboard');
  }
});
