/* === ACHIEVEMENTS === */
var ACHS = [
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

function checkAchs() {
  var earned = S.g('achievements') || []; var changed = false;
  ACHS.forEach(function(a) {
    if (earned.indexOf(a.id) < 0 && a.check()) {
      earned.push(a.id); changed = true;
      setTimeout(function() { toast('Unlocked: ' + a.n, 'trophy'); }, 600);
    }
  });
  if (changed) S.set('achievements', earned);
}

/* === PROGRESS SCREEN === */
reg('progress', function() {
  var ws = S.g('workouts') || []; var metrics = S.g('metrics') || [];
  var today = new Date().getDay(); var last7 = [0,0,0,0,0,0,0]; var days = ['S','M','T','W','T','F','S'];
  ws.forEach(function(w) { var diff = Math.floor((new Date() - new Date(w.date)) / 864e5); if (diff < 7) last7[(today - diff + 7) % 7]++; });
  var maxB = Math.max.apply(null, last7.concat([1]));
  var tVol = ws.reduce(function(a, w) { return a + (w.totalVol || 0); }, 0);
  var tPR = ws.reduce(function(a, w) { return a + (w.prCount || 0); }, 0);
  var h = '';
  h += topbar('Progress');
  h += '<div class="screen">';
  h += '<div style="padding:12px 12px 0"><div class="g2" style="gap:10px;margin-bottom:10px">';
  h += statBox(ws.length, 'Total Workouts', 'cyan');
  h += statBox(WE.getStreak(), 'Streak', 'green');
  h += statBox(Math.round(tVol / 1000) + 't', 'Total Volume', 'purple');
  h += statBox(tPR, 'Total PRs', 'red');
  h += '</div></div>';
  h += sh('Training This Week');
  h += '<div class="card"><div class="bar-chart">';
  last7.forEach(function(v, i) {
    var bh = Math.max(3, Math.round(v / maxB * 74));
    h += '<div style="flex:1;display:flex;flex-direction:column;gap:4px;align-items:center"><div class="bar' + (v > 0 ? ' on' : '') + '" style="width:100%;height:' + bh + 'px"></div><div class="bar-l">' + days[(today - 6 + i + 7) % 7] + '</div></div>';
  });
  h += '</div></div>';
  if (tPR > 0) {
    h += sh('Personal Records'); h += '<div class="card">';
    ws.filter(function(w) { return w.prCount > 0; }).slice(-6).reverse().forEach(function(w) {
      h += '<div class="exr"><div class="ex-ic">🏆</div><div class="ex-inf"><div class="ex-nm">' + (w.splitDay || 'Workout') + '</div>';
      h += '<div class="ex-sub">' + new Date(w.date).toLocaleDateString() + '</div></div>';
      h += '<div class="ex-tag">' + w.prCount + ' PR' + (w.prCount > 1 ? 's' : '') + '</div></div>';
    });
    h += '</div>';
  }
  h += sh('Body Metrics', '+ Add', 'logMetricModal()');
  h += '<div class="card">';
  if (!metrics.length) { h += '<p style="color:rgba(255,255,255,.35);font-size:14px;padding:6px 0">No metrics yet. Start tracking your weight and measurements.</p>'; }
  metrics.slice(-6).reverse().forEach(function(m) {
    h += '<div class="exr"><div class="ex-ic">⚖️</div><div class="ex-inf"><div class="ex-nm">' + m.weight + (m.unit || 'kg') + '</div>';
    h += '<div class="ex-sub">' + new Date(m.date).toLocaleDateString() + (m.bf ? ' &middot; ' + m.bf + '% BF' : '') + '</div></div>';
    if (m.bmi) h += '<div class="ex-tag">BMI ' + m.bmi + '</div>';
    h += '</div>';
  });
  h += '<button class="btn btn-s" style="margin-top:10px" onclick="logMetricModal()">+ Log Today</button></div>';
  h += sh('Achievements'); h += card(achHTML());
  h += '<div style="height:18px"></div></div>';
  return h;
});

function gv(id) { var e = document.getElementById(id); return e && e.value ? parseFloat(e.value) : null; }
function gvs(id) { var e = document.getElementById(id); return e ? e.value : ''; }

function logMetricModal() {
  var u = S.g('user') || {}; var m = document.createElement('div'); m.className = 'overlay'; m.id = 'met-modal';
  var h = '<div class="sheet"><div class="sheet-handle"></div><div style="font-size:22px;font-weight:800;margin-bottom:18px">Log Body Metrics</div>';
  h += '<div class="g2" style="gap:10px">';
  h += '<div class="fw"><label class="field-label">Weight (' + ((u.units || 'metric') === 'imperial' ? 'lbs' : 'kg') + ')</label><input class="field" type="number" id="m-w" step=".1" placeholder="75"></div>';
  h += '<div class="fw"><label class="field-label">Body Fat %</label><input class="field" type="number" id="m-bf" step=".1" placeholder="18"></div>';
  h += '<div class="fw"><label class="field-label">Chest (cm)</label><input class="field" type="number" id="m-chest" step=".5" placeholder="100"></div>';
  h += '<div class="fw"><label class="field-label">Waist (cm)</label><input class="field" type="number" id="m-waist" step=".5" placeholder="82"></div>';
  h += '<div class="fw"><label class="field-label">Hips (cm)</label><input class="field" type="number" id="m-hips" step=".5" placeholder="100"></div>';
  h += '<div class="fw"><label class="field-label">Bicep (cm)</label><input class="field" type="number" id="m-bicep" step=".5" placeholder="38"></div>';
  h += '<div class="fw"><label class="field-label">Thigh (cm)</label><input class="field" type="number" id="m-thigh" step=".5" placeholder="58"></div>';
  h += '<div class="fw"><label class="field-label">Shoulders (cm)</label><input class="field" type="number" id="m-shld" step=".5" placeholder="120"></div>';
  h += '<div class="fw"><label class="field-label">Calf (cm)</label><input class="field" type="number" id="m-calf" step=".5" placeholder="36"></div>';
  h += '<div class="fw"><label class="field-label">Neck (cm)</label><input class="field" type="number" id="m-neck" step=".5" placeholder="38"></div>';
  h += '</div>';
  h += '<div class="fw"><label class="field-label">Notes</label><input class="field" id="m-note" placeholder="Morning fasted, post workout..."></div>';
  h += '<button class="btn btn-p mb12" onclick="saveMetric()">Save Metrics</button>';
  h += '<button class="btn btn-s" onclick="document.getElementById(\'met-modal\').remove()">Cancel</button></div>';
  m.innerHTML = h; m.addEventListener('click', function(e) { if (e.target === m) m.remove(); }); document.body.appendChild(m);
}

function saveMetric() {
  var w = gv('m-w'); if (!w) { toast('Enter weight', 'warn'); return; }
  var bh = (S.g('user.height') || 175) / 100; var bmi = Math.round(w / (bh * bh) * 10) / 10;
  var ms = S.g('metrics') || [];
  ms.push({date:new Date().toISOString(),weight:w,unit:(S.g('user.units')||'metric')==='imperial'?'lbs':'kg',
    bf:gv('m-bf'),chest:gv('m-chest'),waist:gv('m-waist'),hips:gv('m-hips'),
    bicep:gv('m-bicep'),thigh:gv('m-thigh'),shoulders:gv('m-shld'),calf:gv('m-calf'),neck:gv('m-neck'),
    note:gvs('m-note'),bmi:bmi});
  S.set('metrics', ms); checkAchs(); document.getElementById('met-modal').remove(); toast('Metrics saved!'); go('progress');
}
