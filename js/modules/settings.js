'use strict';

/* ═══════════════════════════════════════════════════
   SETTINGS SCREEN
═══════════════════════════════════════════════════ */
reg('settings', function() {
  const user = S.g('user') || {};
  const prefs = S.g('prefs') || {};
  const nav = S.g('nav') || {};
  const tabs = nav.tabs || ['dashboard','workouts','progress','ai','settings'];
  const split = S.g('user.split') || 'ppl';
  const splitDay = S.g('user.splitDay') || 1;
  const splitData = (typeof SPLITS !== 'undefined') ? SPLITS[split] : null;
  const tdee = calcTDEE(user);
  const themes = [
    { id:'electric', name:'Electric', colors:['#00d5ff','#6b5fff'] },
    { id:'forest', name:'Forest', colors:['#10B981','#059669'] },
    { id:'navy', name:'Navy', colors:['#3B82F6','#1D4ED8'] }
  ];
  const curTheme = user.theme || 'electric';

  function toggle(key, val) {
    return '<button class="toggle' + (val?' on':'') + '" onclick="togglePref(\'' + key + '\')" touch-action="manipulation"></button>';
  }

  function row(label, val, right) {
    return '<div class="settings-row"><div><div class="settings-row-l">' + esc(label) + '</div>' +
      (val ? '<div style="font-size:12px;color:var(--txt3);margin-top:2px">' + esc(val) + '</div>' : '') + '</div>' +
      (right||'') + '</div>';
  }

  const allScreens = [
    {id:'dashboard',l:'Home'},
    {id:'workouts',l:'Workout'},
    {id:'progress',l:'Progress'},
    {id:'ai',l:'AI Coach'},
    {id:'bodystats',l:'Body Stats'},
    {id:'cardio',l:'Cardio'},
    {id:'nutrition',l:'Nutrition'},
    {id:'injuries',l:'Injuries'},
    {id:'recovery',l:'Recovery'},
    {id:'settings',l:'Settings'}
  ];

  const navSlots = tabs.map((id,i) => {
    const m = (typeof NAV_META !== 'undefined') ? (NAV_META[id]||NAV_META.dashboard) : {};
    return '<div class="nav-slot">' +
      '<div style="display:flex;align-items:center;gap:12px;flex:1">' +
      '<div style="font-size:20px;color:var(--c1)">' + (m.icon ? '<svg width="20" height="20" viewBox="0 0 24 24" style="fill:none;stroke:var(--c1);stroke-width:1.8">' + '' + '</svg>' : '📌') + '</div>' +
      '<div class="nav-slot-name">' + esc(m.label || id) + '</div>' +
      '</div>' +
      '<div class="nav-slot-change" onclick="openNavPicker(' + i + ')">Change</div>' +
      '</div>';
  }).join('');

  return topbar('Settings') +

  '<div class="settings-section">' +
  '<div class="settings-section-title">Profile</div>' +
  row('Name', user.name||'Not set', '<button class="btn btn-s btn-sm" onclick="editProfile(\'name\')">Edit</button>') +
  row('Age', user.age ? user.age + ' years' : 'Not set', '<button class="btn btn-s btn-sm" onclick="editProfile(\'age\')">Edit</button>') +
  row('Gender', user.gender ? (user.gender.charAt(0).toUpperCase()+user.gender.slice(1)) : 'Not set') +
  row('Height', user.height ? user.height + (user.units==='imperial'?'in':'cm') : 'Not set') +
  row('Weight', user.weight ? user.weight + (user.units==='imperial'?'lb':'kg') : 'Not set') +
  row('Units', user.units||'metric', '<button class="btn btn-s btn-sm" onclick="toggleUnits()">Toggle</button>') +
  row('Goal', user.goal ? user.goal.charAt(0).toUpperCase()+user.goal.slice(1) : 'Hypertrophy') +
  row('TDEE', tdee + ' kcal/day', '<button class="btn btn-s btn-sm" onclick="recalcTDEE()">Recalc</button>') +
  '</div>' +

  '<div class="settings-section">' +
  '<div class="settings-section-title">Training</div>' +
  row('Split', splitData ? splitData.n : split, '<button class="btn btn-s btn-sm" onclick="openSplitPicker()">Change</button>') +
  row('Current Day', splitData ? 'Day ' + splitDay + ': ' + (splitData.schedule[splitDay-1]||{}).n : 'Day '+splitDay,
    '<div style="display:flex;gap:6px">' +
    '<button class="btn btn-s btn-sm" onclick="prevSplitDay()">←</button>' +
    '<button class="btn btn-s btn-sm" onclick="nextSplitDay()">→</button>' +
    '</div>') +
  row('Weekly Goal', (user.weeklyGoal||4) + ' workouts/week', '<button class="btn btn-s btn-sm" onclick="editProfile(\'weeklyGoal\')">Edit</button>') +
  '<div class="toggle-wrap" style="padding:14px 16px"><div class="toggle-info"><div class="toggle-label">Rest Timer</div><div class="toggle-sub">Auto-start rest between sets</div></div>' + toggle('restTimer', prefs.restTimer !== false) + '</div>' +
  '<div class="toggle-wrap" style="padding:14px 16px"><div class="toggle-info"><div class="toggle-label">Auto-Progression</div><div class="toggle-sub">Suggest weight increases</div></div>' + toggle('autoProgress', prefs.autoProgress !== false) + '</div>' +
  row('Rest Timer', (user.restSecs||90) + 's', '<button class="btn btn-s btn-sm" onclick="editRestTimer()">Edit</button>') +
  '</div>' +

  '<div class="settings-section">' +
  '<div class="settings-section-title">Targets</div>' +
  '<div style="padding:0 16px">' +
  '<div class="slider-wrap"><div style="display:flex;justify-content:space-between"><span style="font-size:14px;font-weight:600">🔥 Calories</span><span style="font-size:14px;font-weight:700;color:var(--c1)">' + (user.calorieTarget||2000) + ' kcal</span></div>' +
  '<input type="range" min="1200" max="4000" step="50" value="' + (user.calorieTarget||2000) + '" oninput="updateTarget(\'calorieTarget\',this.value,this)"></div>' +
  '<div class="slider-wrap"><div style="display:flex;justify-content:space-between"><span style="font-size:14px;font-weight:600">🥩 Protein</span><span style="font-size:14px;font-weight:700;color:var(--c1)">' + (user.proteinTarget||150) + 'g</span></div>' +
  '<input type="range" min="50" max="300" step="5" value="' + (user.proteinTarget||150) + '" oninput="updateTarget(\'proteinTarget\',this.value,this)"></div>' +
  '<div class="slider-wrap"><div style="display:flex;justify-content:space-between"><span style="font-size:14px;font-weight:600">🍞 Carbs</span><span style="font-size:14px;font-weight:700;color:var(--c5)">' + (user.carbTarget||200) + 'g</span></div>' +
  '<input type="range" min="50" max="500" step="5" value="' + (user.carbTarget||200) + '" oninput="updateTarget(\'carbTarget\',this.value,this)"></div>' +
  '<div class="slider-wrap"><div style="display:flex;justify-content:space-between"><span style="font-size:14px;font-weight:600">🥑 Fat</span><span style="font-size:14px;font-weight:700;color:var(--c4)">' + (user.fatTarget||65) + 'g</span></div>' +
  '<input type="range" min="20" max="200" step="5" value="' + (user.fatTarget||65) + '" oninput="updateTarget(\'fatTarget\',this.value,this)"></div>' +
  '<div class="slider-wrap"><div style="display:flex;justify-content:space-between"><span style="font-size:14px;font-weight:600">💧 Water</span><span style="font-size:14px;font-weight:700;color:var(--c1)">' + (user.waterTarget||8) + ' glasses</span></div>' +
  '<input type="range" min="4" max="16" step="1" value="' + (user.waterTarget||8) + '" oninput="updateTarget(\'waterTarget\',this.value,this)"></div>' +
  '</div></div>' +

  '<div class="settings-section">' +
  '<div class="settings-section-title">Navigation (Customise Tabs)</div>' +
  navSlots +
  '<div style="padding:12px 16px"><button class="btn btn-s btn-sm" onclick="resetNav()">Reset to default</button></div>' +
  '</div>' +

  '<div class="settings-section">' +
  '<div class="settings-section-title">Appearance</div>' +
  '<div class="theme-cards">' +
  themes.map(t =>
    '<div class="theme-card' + (curTheme===t.id?' on':'') + '" onclick="setTheme(\'' + t.id + '\')">' +
    '<div class="theme-swatch" style="background:linear-gradient(135deg,' + t.colors[0] + ',' + t.colors[1] + ')"></div>' +
    '<div class="theme-name">' + t.name + '</div>' +
    '</div>'
  ).join('') +
  '</div></div>' +

  '<div class="settings-section">' +
  '<div class="settings-section-title">Data</div>' +
  '<div style="padding:0 16px;display:flex;flex-direction:column;gap:8px;margin-bottom:14px">' +
  '<button class="btn btn-s" onclick="exportData()">📤 Export All Data (JSON)</button>' +
  '<button class="btn btn-s" onclick="importData()">📥 Import from JSON</button>' +
  '<button class="btn btn-r" onclick="clearData()">🗑️ Clear All Data</button>' +
  '</div></div>' +

  '<div class="settings-section">' +
  '<div class="settings-section-title">About</div>' +
  '<div style="padding:16px;text-align:center;color:var(--txt3);font-size:13px;line-height:1.8">' +
  '<div style="font-size:20px;margin-bottom:8px">⚡</div>' +
  '<div style="font-weight:700;color:var(--txt)">FitnessOS Pro v3.0</div>' +
  '<div>Built by Shamikh Ahmed</div>' +
  '<div style="margin-top:8px;color:var(--txt4)">Works offline · No server · Your data stays on device</div>' +
  '</div></div>' +
  '<div style="height:8px"></div>';
});

function togglePref(key) {
  const prefs = S.g('prefs') || {};
  prefs[key] = !(prefs[key] !== false);
  S.set('prefs', prefs);
  go('settings');
}
window.togglePref = togglePref;

function updateTarget(key, val, input) {
  S.set('user.' + key, parseInt(val));
  const parent = input.parentElement;
  if (parent) {
    const span = parent.querySelector('span:last-child');
    const units = { calorieTarget:' kcal', proteinTarget:'g', carbTarget:'g', fatTarget:'g', waterTarget:' glasses' };
    if (span) span.textContent = val + (units[key]||'');
  }
}
window.updateTarget = updateTarget;

function setTheme(id) {
  S.set('user.theme', id);
  document.documentElement.setAttribute('data-theme', id);
  go('settings');
  toast('Theme changed to ' + id.charAt(0).toUpperCase() + id.slice(1), 'ok');
}
window.setTheme = setTheme;

function toggleUnits() {
  const cur = S.g('user.units') || 'metric';
  S.set('user.units', cur === 'metric' ? 'imperial' : 'metric');
  go('settings');
}
window.toggleUnits = toggleUnits;

function editProfile(key) {
  const user = S.g('user') || {};
  const labels = { name:'Name', age:'Age', weeklyGoal:'Weekly workout goal' };
  modal('Edit ' + (labels[key]||key),
    '<div class="field-wrap"><label class="field-label">' + esc(labels[key]||key) + '</label>' +
    '<input class="field" id="edit-val" type="' + (key==='name'?'text':'number') + '" value="' + esc(String(user[key]||'')) + '" autofocus></div>',
    '<button class="btn btn-p" onclick="saveProfileEdit(\'' + key + '\')">Save</button>');
}
window.editProfile = editProfile;

function saveProfileEdit(key) {
  const el = document.getElementById('edit-val');
  if (!el) return;
  const val = key === 'name' ? el.value.trim() : parseFloat(el.value);
  if (!val && val !== 0) { toast('Enter a valid value', 'warn'); return; }
  S.set('user.' + key, val);
  closeModal();
  go('settings');
  toast('Updated!', 'ok');
}
window.saveProfileEdit = saveProfileEdit;

function editRestTimer() {
  const opts = [30,60,90,120,180];
  modal('Rest Timer Duration',
    '<div style="display:flex;flex-direction:column;gap:8px">' +
    opts.map(s =>
      '<button class="btn btn-s" onclick="S.set(\'user.restSecs\',' + s + ');closeModal();go(\'settings\')">' + s + 's</button>'
    ).join('') + '</div>', '');
}
window.editRestTimer = editRestTimer;

function openSplitPicker() {
  const splits = typeof SPLITS !== 'undefined' ? SPLITS : {};
  modal('Training Split',
    '<div style="display:flex;flex-direction:column;gap:8px">' +
    Object.entries(splits).map(([id, data]) =>
      '<button class="btn btn-s" onclick="S.set(\'user.split\',\'' + id + '\');S.set(\'user.splitDay\',1);closeModal();go(\'settings\')">' + esc(data.n) + ' (' + data.days + ' days)</button>'
    ).join('') + '</div>', '');
}
window.openSplitPicker = openSplitPicker;

function nextSplitDay() { if(typeof WE!=='undefined') WE.nextDay(); go('settings'); }
function prevSplitDay() {
  const split = S.g('user.split')||'ppl';
  const splitData = (typeof SPLITS!=='undefined')?SPLITS[split]:null;
  if(!splitData) return;
  const cur = S.g('user.splitDay')||1;
  const prev = cur <= 1 ? splitData.schedule.length : cur-1;
  S.set('user.splitDay', prev);
  go('settings');
}
window.nextSplitDay = nextSplitDay; window.prevSplitDay = prevSplitDay;

function recalcTDEE() {
  const user = S.g('user') || {};
  const tdee = calcTDEE(user);
  const prot = Math.round(user.weight * 2.2);
  const fat = Math.round(tdee * 0.25 / 9);
  const carb = Math.round((tdee - prot*4 - fat*9) / 4);
  S.set('user.calorieTarget', tdee);
  S.set('user.proteinTarget', prot);
  S.set('user.carbTarget', carb);
  S.set('user.fatTarget', fat);
  toast('Targets updated! TDEE: ' + tdee + ' kcal', 'ok');
  go('settings');
}
window.recalcTDEE = recalcTDEE;

function openNavPicker(slotIdx) {
  const allScreens = [
    {id:'dashboard',l:'Home'},{id:'workouts',l:'Workout'},{id:'progress',l:'Progress'},
    {id:'ai',l:'AI Coach'},{id:'bodystats',l:'Body Stats'},{id:'cardio',l:'Cardio'},
    {id:'nutrition',l:'Nutrition'},{id:'injuries',l:'Injuries'},{id:'recovery',l:'Recovery'},
    {id:'settings',l:'Settings'}
  ];
  modal('Choose Tab',
    '<div style="display:flex;flex-direction:column;gap:6px">' +
    allScreens.map(s =>
      '<button class="btn btn-s" onclick="setNavTab(' + slotIdx + ',\'' + s.id + '\')">' + esc(s.l) + '</button>'
    ).join('') + '</div>', '');
}
window.openNavPicker = openNavPicker;

function setNavTab(idx, screenId) {
  const tabs = S.g('nav.tabs') || ['dashboard','workouts','progress','ai','settings'];
  tabs[idx] = screenId;
  S.set('nav.tabs', tabs);
  closeModal();
  if (typeof buildNav !== 'undefined') buildNav();
  go('settings');
  toast('Tab updated!', 'ok');
}
window.setNavTab = setNavTab;

function resetNav() {
  S.set('nav.tabs', ['dashboard','workouts','progress','ai','settings']);
  if (typeof buildNav !== 'undefined') buildNav();
  go('settings');
  toast('Navigation reset', 'ok');
}
window.resetNav = resetNav;

function exportData() {
  const data = JSON.stringify(S.d, null, 2);
  const blob = new Blob([data], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'fitnessos-backup-' + today() + '.json';
  a.click(); URL.revokeObjectURL(url);
  toast('Data exported!', 'ok');
}
window.exportData = exportData;

function importData() {
  const input = document.createElement('input');
  input.type = 'file'; input.accept = 'application/json';
  input.onchange = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const imported = JSON.parse(ev.target.result);
        Object.assign(S.d, imported);
        S.save();
        toast('Data imported!', 'ok');
        go('dashboard');
      } catch(err) { toast('Import failed — invalid file', 'err'); }
    };
    reader.readAsText(file);
  };
  input.click();
}
window.importData = importData;

function clearData() {
  modal('Clear All Data',
    '<div style="text-align:center;padding:16px">' +
    '<div style="font-size:40px;margin-bottom:12px">⚠️</div>' +
    '<div style="font-size:16px;font-weight:700;margin-bottom:8px">This cannot be undone</div>' +
    '<div style="font-size:14px;color:var(--txt3)">All workouts, body stats, and settings will be permanently deleted.</div>' +
    '</div>',
    '<button class="btn btn-r" onclick="confirmClearData()">Yes, Delete Everything</button>');
}
window.clearData = clearData;

function confirmClearData() {
  localStorage.removeItem('fos_v3');
  location.reload();
}
window.confirmClearData = confirmClearData;

/* ═══════════════════════════════════════════════════
   WELCOME SCREEN
═══════════════════════════════════════════════════ */
reg('welcome', function() {
  return '<div class="welcome-screen">' +
    '<div class="welcome-logo">' +
    '<svg width="48" height="48" viewBox="0 0 48 48" fill="white"><path d="M26 8L16 28h8l-6 12 16-22h-9z"/></svg>' +
    '</div>' +
    '<div class="welcome-title">FitnessOS Pro</div>' +
    '<div class="welcome-sub">The intelligent fitness system that learns, adapts, and evolves with you</div>' +
    '<div class="welcome-pills">' +
    ['AI Coaching','Smart Splits','PR Tracking','Recovery','Body Stats','Injury Guard'].map(f =>
      '<span class="welcome-pill">' + f + '</span>'
    ).join('') +
    '</div>' +
    '<button class="btn btn-p" style="width:100%;max-width:320px;padding:18px;font-size:17px" onclick="go(\'onboard\')">Get Started →</button>' +
    '<div style="margin-top:16px;font-size:14px;color:var(--txt3);cursor:pointer" onclick="skipOnboarding()">I have existing data</div>' +
    '</div>';
});

function skipOnboarding() {
  S.set('onboarded', true);
  const nav = document.getElementById('nav');
  if (nav) nav.style.display = '';
  if (typeof buildNav !== 'undefined') buildNav();
  go('dashboard');
}
window.skipOnboarding = skipOnboarding;

/* ═══════════════════════════════════════════════════
   ONBOARDING
═══════════════════════════════════════════════════ */
let _obStep = 1;
const _obData = {};
const OB_TOTAL = 10;

reg('onboard', function() {
  return renderObStep(_obStep);
});

function renderObStep(step) {
  _obStep = step;
  const dots = Array.from({length:OB_TOTAL}, (_,i) =>
    '<div class="ob-dot' + (i+1===step?' on':'') + '"></div>'
  ).join('');
  const header = '<div class="ob-header">' +
    (step > 1 ? '<button class="ob-back" onclick="go_ob(' + (step-1) + ')">←</button>' : '<div style="width:36px"></div>') +
    '<div class="ob-dots">' + dots + '</div>' +
    '<div style="width:36px"></div></div>';

  const steps = {
    1: obStep1, 2: obStep2, 3: obStep3, 4: obStep4, 5: obStep5,
    6: obStep6, 7: obStep7, 8: obStep8, 9: obStep9, 10: obStep10
  };
  return '<div class="ob-screen">' + header + (steps[step]||obStep1)() + '</div>';
}

function go_ob(step) { _obStep = step; go('onboard'); }
window.go_ob = go_ob;

function obStep1() {
  return '<div class="ob-body">' +
    '<div class="ob-title">What should we call you? 👋</div>' +
    '<div class="ob-sub">This is how your AI coach will address you.</div>' +
    '<div class="field-wrap"><input class="field" id="ob-name" type="text" placeholder="Your name" style="font-size:20px;padding:18px;text-align:center" value="' + esc(_obData.name||'') + '" autocomplete="given-name"></div>' +
    '</div>' +
    '<div class="ob-footer">' +
    '<button class="btn btn-p" onclick="ob1Next()">Continue →</button>' +
    '</div>';
}

function ob1Next() {
  const n = document.getElementById('ob-name').value.trim();
  if (!n) { toast('Enter your name', 'warn'); return; }
  _obData.name = n; go_ob(2);
}
window.ob1Next = ob1Next;

function obStep2() {
  const goals = [
    {id:'hypertrophy',i:'💪',t:'Build Muscle',s:'Hypertrophy focus'},
    {id:'strength',i:'🏋️',t:'Get Stronger',s:'Strength focus, heavy compounds'},
    {id:'fatloss',i:'🔥',t:'Lose Fat',s:'Fat loss + muscle preserve'},
    {id:'athletic',i:'⚡',t:'Athletic Performance',s:'Speed, power, conditioning'},
    {id:'recomp',i:'🔄',t:'Body Recomposition',s:'Build muscle while losing fat'},
    {id:'health',i:'🌿',t:'General Health',s:'Move well, feel great'},
  ];
  return '<div class="ob-body">' +
    '<div class="ob-title">What\'s your main goal?</div>' +
    '<div class="ob-sub">Your program, weights, and AI advice adapt to this.</div>' +
    goals.map(g =>
      '<button class="ob-opt' + (_obData.goal===g.id?' sel':'') + '" id="goal-' + g.id + '" onclick="obSelectGoal(\'' + g.id + '\')">' +
      '<div class="ob-opt-icon">' + g.i + '</div>' +
      '<div class="ob-opt-info"><div class="ob-opt-title">' + g.t + '</div><div class="ob-opt-sub">' + g.s + '</div></div>' +
      '</button>'
    ).join('') +
    '</div>' +
    '<div class="ob-footer">' +
    '<button class="btn btn-p" onclick="ob2Next()">Continue →</button>' +
    '<div class="ob-skip" onclick="go_ob(3)">Skip for now</div>' +
    '</div>';
}

function obSelectGoal(id) {
  _obData.goal = id;
  document.querySelectorAll('.ob-opt').forEach(b => b.classList.remove('sel'));
  const btn = document.getElementById('goal-'+id); if(btn) btn.classList.add('sel');
}
window.obSelectGoal = obSelectGoal;

function ob2Next() { if(!_obData.goal) _obData.goal='hypertrophy'; go_ob(3); }
window.ob2Next = ob2Next;

function obStep3() {
  const levels = [
    {id:'beginner',i:'🌱',t:'Beginner',s:'Less than 1 year training'},
    {id:'intermediate',i:'💪',t:'Intermediate',s:'1–3 years of consistent training'},
    {id:'advanced',i:'🏆',t:'Advanced',s:'3+ years, know your lifts'},
    {id:'elite',i:'👑',t:'Elite',s:'Competitive athlete'},
  ];
  return '<div class="ob-body">' +
    '<div class="ob-title">Experience level?</div>' +
    '<div class="ob-sub">This sets your starting weights and program complexity.</div>' +
    levels.map(l =>
      '<button class="ob-opt' + (_obData.exp===l.id?' sel':'') + '" id="exp-' + l.id + '" onclick="obSelectExp(\'' + l.id + '\')">' +
      '<div class="ob-opt-icon">' + l.i + '</div>' +
      '<div class="ob-opt-info"><div class="ob-opt-title">' + l.t + '</div><div class="ob-opt-sub">' + l.s + '</div></div>' +
      '</button>'
    ).join('') +
    '</div>' +
    '<div class="ob-footer">' +
    '<button class="btn btn-p" onclick="ob3Next()">Continue →</button>' +
    '<div class="ob-skip" onclick="go_ob(4)">Skip for now</div>' +
    '</div>';
}
function obSelectExp(id) { _obData.exp=id; document.querySelectorAll('.ob-opt').forEach(b=>b.classList.remove('sel')); const btn=document.getElementById('exp-'+id); if(btn) btn.classList.add('sel'); }
function ob3Next() { if(!_obData.exp) _obData.exp='intermediate'; go_ob(4); }
window.obSelectExp=obSelectExp; window.ob3Next=ob3Next;

function obStep4() {
  const splits = typeof SPLITS !== 'undefined' ? Object.entries(SPLITS) : [];
  return '<div class="ob-body">' +
    '<div class="ob-title">Training split?</div>' +
    '<div class="ob-sub">How many days per week and how you split muscle groups.</div>' +
    splits.map(([id,data]) =>
      '<button class="ob-opt' + (_obData.split===id?' sel':'') + '" id="split-' + id + '" onclick="obSelectSplit(\'' + id + '\')">' +
      '<div class="ob-opt-icon">📅</div>' +
      '<div class="ob-opt-info"><div class="ob-opt-title">' + esc(data.n) + '</div><div class="ob-opt-sub">' + data.days + ' days/week</div></div>' +
      '</button>'
    ).join('') +
    '</div>' +
    '<div class="ob-footer">' +
    '<button class="btn btn-p" onclick="ob4Next()">Continue →</button>' +
    '<div class="ob-skip" onclick="go_ob(5)">Skip for now</div>' +
    '</div>';
}
function obSelectSplit(id) { _obData.split=id; document.querySelectorAll('.ob-opt').forEach(b=>b.classList.remove('sel')); const btn=document.getElementById('split-'+id); if(btn) btn.classList.add('sel'); }
function ob4Next() { if(!_obData.split) _obData.split='ppl'; go_ob(5); }
window.obSelectSplit=obSelectSplit; window.ob4Next=ob4Next;

function obStep5() {
  const locs = [
    {id:'full',i:'🏋️',t:'Full Gym',s:'Barbells, cables, machines, everything',eq:['barbell','dumbbell','cables','machine','bar','kettlebell']},
    {id:'home_db',i:'🏠',t:'Home with Dumbbells',s:'Dumbbells, bench, maybe a pull-up bar',eq:['dumbbell','bar','bands']},
    {id:'bw',i:'🤸',t:'Bodyweight Only',s:'No equipment needed',eq:['none','bar']},
    {id:'mixed',i:'🔄',t:'Mixed',s:'Sometimes gym, sometimes home',eq:['barbell','dumbbell','cables','machine','bar','bands','none']},
  ];
  return '<div class="ob-body">' +
    '<div class="ob-title">Where do you train?</div>' +
    '<div class="ob-sub">Determines which exercises appear in your workouts.</div>' +
    locs.map(l =>
      '<button class="ob-opt' + (_obData.location===l.id?' sel':'') + '" id="loc-' + l.id + '" onclick="obSelectLoc(\'' + l.id + '\')">' +
      '<div class="ob-opt-icon">' + l.i + '</div>' +
      '<div class="ob-opt-info"><div class="ob-opt-title">' + l.t + '</div><div class="ob-opt-sub">' + l.s + '</div></div>' +
      '</button>'
    ).join('') +
    '</div>' +
    '<div class="ob-footer">' +
    '<button class="btn btn-p" onclick="ob5Next()">Continue →</button>' +
    '<div class="ob-skip" onclick="go_ob(6)">Skip for now</div>' +
    '</div>';
}
function obSelectLoc(id) {
  const equipMap = {
    full: ['barbell','dumbbell','cables','machine','bar','kettlebell'],
    home_db: ['dumbbell','bar','bands'],
    bw: ['none','bar'],
    mixed: ['barbell','dumbbell','cables','machine','bar','bands','none']
  };
  _obData.location = id;
  _obData.equipment = equipMap[id] || [];
  document.querySelectorAll('.ob-opt').forEach(b => b.classList.remove('sel'));
  const btn = document.getElementById('loc-' + id);
  if (btn) btn.classList.add('sel');
}
function ob5Next() { if(!_obData.equipment) _obData.equipment=['barbell','dumbbell','cables','machine','bar']; go_ob(6); }
window.obSelectLoc=obSelectLoc; window.ob5Next=ob5Next;

function obStep6() {
  const user = S.g('user')||{};
  return '<div class="ob-body">' +
    '<div class="ob-title">Your stats</div>' +
    '<div class="ob-sub">Used to calculate your TDEE and personalise your program.</div>' +
    '<div style="display:flex;gap:12px;margin-bottom:12px">' +
    '<button class="pill' + (!_obData.units||_obData.units==='metric'?' on':'') + '" onclick="obSetUnits(\'metric\')">Metric (kg/cm)</button>' +
    '<button class="pill' + (_obData.units==='imperial'?' on':'') + '" onclick="obSetUnits(\'imperial\')">Imperial (lb/in)</button>' +
    '</div>' +
    '<div class="field-wrap"><label class="field-label">Age</label><input class="field" id="ob-age" type="number" min="13" max="100" placeholder="25" value="' + (_obData.age||user.age||'') + '" inputmode="numeric"></div>' +
    '<div class="field-wrap"><label class="field-label">Weight (' + (_obData.units==='imperial'?'lb':'kg') + ')</label><input class="field" id="ob-weight" type="number" step="0.5" placeholder="75" value="' + (_obData.weight||user.weight||'') + '" inputmode="decimal"></div>' +
    '<div class="field-wrap"><label class="field-label">Height (' + (_obData.units==='imperial'?'in':'cm') + ')</label><input class="field" id="ob-height" type="number" step="1" placeholder="175" value="' + (_obData.height||user.height||'') + '" inputmode="numeric"></div>' +
    '<div style="display:flex;gap:8px;margin-bottom:12px">' +
    '<button class="pill' + (!_obData.gender||_obData.gender==='male'?' on':'') + '" onclick="obSetGender(\'male\')">Male</button>' +
    '<button class="pill' + (_obData.gender==='female'?' on':'') + '" onclick="obSetGender(\'female\')">Female</button>' +
    '</div>' +
    '</div>' +
    '<div class="ob-footer">' +
    '<button class="btn btn-p" onclick="ob6Next()">Continue →</button>' +
    '<div class="ob-skip" onclick="go_ob(7)">Skip for now</div>' +
    '</div>';
}
function obSetUnits(u) { _obData.units=u; go_ob(6); }
function obSetGender(g) { _obData.gender=g; document.querySelectorAll('.pill').forEach(p=>{ if(p.textContent==='Male'||p.textContent==='Female') p.classList.remove('on'); }); }
function ob6Next() { _obData.age=parseInt(document.getElementById('ob-age').value)||25; _obData.weight=parseFloat(document.getElementById('ob-weight').value)||75; _obData.height=parseInt(document.getElementById('ob-height').value)||175; if(!_obData.gender) _obData.gender='male'; go_ob(7); }
window.obSetUnits=obSetUnits; window.obSetGender=obSetGender; window.ob6Next=ob6Next;

function obStep7() {
  const parts = ['None','Shoulder (L)','Shoulder (R)','Elbow (L)','Elbow (R)','Wrist','Lower Back','Upper Back','Hip','Knee','Ankle'];
  return '<div class="ob-body">' +
    '<div class="ob-title">Any current injuries?</div>' +
    '<div class="ob-sub">We\'ll filter dangerous exercises automatically.</div>' +
    '<div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px">' +
    parts.map(p => '<button class="pill" id="ip-' + p.replace(/[\s()]/g,'') + '" onclick="obToggleInjury(\'' + p + '\')">' + p + '</button>').join('') +
    '</div>' +
    '</div>' +
    '<div class="ob-footer">' +
    '<button class="btn btn-p" onclick="go_ob(8)">Continue →</button>' +
    '<div class="ob-skip" onclick="go_ob(8)">No injuries, skip</div>' +
    '</div>';
}
if (!window._obInjuries) window._obInjuries = [];
function obToggleInjury(p) {
  if (!window._obInjuries) window._obInjuries = [];
  const idx = window._obInjuries.indexOf(p);
  if (p==='None') window._obInjuries=[];
  else if(idx>=0) window._obInjuries.splice(idx,1);
  else window._obInjuries.push(p);
  document.querySelectorAll('[id^="ip-"]').forEach(b=>b.classList.remove('on'));
  window._obInjuries.forEach(part=>{ const b=document.getElementById('ip-'+part.replace(/[\s()]/g,'')); if(b) b.classList.add('on'); });
}
window.obToggleInjury=obToggleInjury;
window.renderObStep7=obStep7;

function obStep8() {
  return '<div class="ob-body">' +
    '<div class="ob-title">Set your goals</div>' +
    '<div class="ob-sub">We\'ll track your progress toward these targets.</div>' +
    '<div class="field-wrap"><label class="field-label">Goal Weight (kg) — optional</label><input class="field" id="ob-goalw" type="number" step="0.5" placeholder="70" value="' + (_obData.goalWeight||'') + '" inputmode="decimal"></div>' +
    '<div class="field-wrap"><label class="field-label">Weekly workout target: <span id="wg-val" style="color:var(--c1)">' + (_obData.weeklyGoal||4) + ' days</span></label>' +
    '<input type="range" min="1" max="7" step="1" value="' + (_obData.weeklyGoal||4) + '" oninput="document.getElementById(\'wg-val\').textContent=this.value+\' days\';_obData.weeklyGoal=parseInt(this.value)"></div>' +
    '<div class="field-wrap"><label class="field-label">Preferred session length</label>' +
    '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
    [30,45,60,75,90].map(m => '<button class="pill' + ((_obData.sessionLen||60)===m?' on':'') + '" onclick="obSetSession(' + m + ')">' + m + 'min</button>').join('') +
    '</div></div>' +
    '</div>' +
    '<div class="ob-footer">' +
    '<button class="btn btn-p" onclick="ob8Next()">Continue →</button>' +
    '<div class="ob-skip" onclick="go_ob(9)">Skip for now</div>' +
    '</div>';
}
function obSetSession(m) { _obData.sessionLen=m; document.querySelectorAll('.pill').forEach(p=>{if([30,45,60,75,90].map(x=>x+'min').includes(p.textContent)){p.classList.remove('on');}});  const btns=document.querySelectorAll('.pill'); btns.forEach(b=>{if(b.textContent===m+'min')b.classList.add('on');}); }
function ob8Next() { _obData.goalWeight=parseFloat(document.getElementById('ob-goalw').value)||null; if(!_obData.weeklyGoal) _obData.weeklyGoal=4; go_ob(9); }
window.obSetSession=obSetSession; window.ob8Next=ob8Next;

function obStep9() {
  const tmpUser = Object.assign({}, S.g('user')||{}, _obData);
  const tdee = calcTDEE(tmpUser);
  const prot = Math.round((tmpUser.weight||75)*2);
  const fat = Math.round(tdee*0.25/9);
  const carb = Math.round((tdee - prot*4 - fat*9)/4);
  if(!_obData.calorieTarget) { _obData.calorieTarget=tdee; _obData.proteinTarget=prot; _obData.carbTarget=carb; _obData.fatTarget=fat; }
  return '<div class="ob-body">' +
    '<div class="ob-title">Nutrition targets</div>' +
    '<div class="ob-sub">Your estimated TDEE is <strong style="color:var(--c1)">' + tdee + ' kcal</strong>. You can customise below.</div>' +
    '<div style="margin-bottom:12px"><button class="btn btn-s btn-sm" onclick="obAutoMacros(' + tdee + ',' + prot + ',' + carb + ',' + fat + ')">Auto-set from TDEE</button></div>' +
    '<div class="field-wrap"><label class="field-label">Daily Calories</label><input class="field" id="ob-cals" type="number" value="' + (_obData.calorieTarget||tdee) + '" inputmode="numeric"></div>' +
    '<div class="field-wrap"><label class="field-label">Protein (g)</label><input class="field" id="ob-prot" type="number" value="' + (_obData.proteinTarget||prot) + '" inputmode="numeric"></div>' +
    '</div>' +
    '<div class="ob-footer">' +
    '<button class="btn btn-p" onclick="ob9Next()">Continue →</button>' +
    '<div class="ob-skip" onclick="go_ob(10)">Skip for now</div>' +
    '</div>';
}
function obAutoMacros(cal,prot,carb,fat) { _obData.calorieTarget=cal;_obData.proteinTarget=prot;_obData.carbTarget=carb;_obData.fatTarget=fat; const c=document.getElementById('ob-cals'); if(c)c.value=cal; const p=document.getElementById('ob-prot'); if(p)p.value=prot; toast('Macros set!','ok'); }
function ob9Next() { _obData.calorieTarget=parseInt(document.getElementById('ob-cals').value)||2000; _obData.proteinTarget=parseInt(document.getElementById('ob-prot').value)||150; go_ob(10); }
window.obAutoMacros=obAutoMacros; window.ob9Next=ob9Next;

function obStep10() {
  const goal_map = { hypertrophy:'Build Muscle', strength:'Get Stronger', fatloss:'Lose Fat', athletic:'Athletic', recomp:'Recomp', health:'General Health' };
  const split_map = typeof SPLITS !== 'undefined' ? SPLITS : {};
  return '<div class="ob-body">' +
    '<div class="ob-title">You\'re ready! 🎉</div>' +
    '<div class="ob-sub">Here\'s what we\'ve set up for you.</div>' +
    '<div class="card card-dark" style="margin:0 0 16px">' +
    '<div class="ex-row" style="padding:10px 0;border:none"><div class="ex-icon">👤</div><div class="ex-info"><div class="ex-name">' + esc(_obData.name||'Athlete') + '</div><div class="ex-sub">' + esc((_obData.exp||'intermediate').charAt(0).toUpperCase()+(_obData.exp||'intermediate').slice(1)) + '</div></div></div>' +
    '<div class="ex-row" style="padding:10px 0;border:none"><div class="ex-icon">🎯</div><div class="ex-info"><div class="ex-name">' + esc(goal_map[_obData.goal||'hypertrophy']) + '</div><div class="ex-sub">Primary goal</div></div></div>' +
    '<div class="ex-row" style="padding:10px 0;border:none"><div class="ex-icon">📅</div><div class="ex-info"><div class="ex-name">' + esc((split_map[_obData.split||'ppl']||{}).n||'Push Pull Legs') + '</div><div class="ex-sub">' + (_obData.weeklyGoal||4) + 'x per week target</div></div></div>' +
    (_obData.weight ? '<div class="ex-row" style="padding:10px 0;border:none"><div class="ex-icon">⚖️</div><div class="ex-info"><div class="ex-name">' + _obData.weight + (_obData.units==='imperial'?'lb':'kg') + '</div><div class="ex-sub">Current weight</div></div></div>' : '') +
    '</div>' +
    '</div>' +
    '<div class="ob-footer">' +
    '<button class="btn btn-p" style="font-size:17px;padding:18px" onclick="completeOnboarding()">Start Training ⚡</button>' +
    '</div>';
}
window.obStep10=obStep10;

function completeOnboarding() {
  const user = Object.assign({}, S.g('user')||{}, {
    name: _obData.name || 'Athlete',
    goal: _obData.goal || 'hypertrophy',
    exp: _obData.exp || 'intermediate',
    split: _obData.split || 'ppl',
    splitDay: 1,
    weeklyGoal: _obData.weeklyGoal || 4,
    equipment: _obData.equipment || ['barbell','dumbbell','cables','machine','bar'],
    age: _obData.age || 25,
    weight: _obData.weight || 75,
    height: _obData.height || 175,
    gender: _obData.gender || 'male',
    units: _obData.units || 'metric',
    goalWeight: _obData.goalWeight,
    calorieTarget: _obData.calorieTarget || 2000,
    proteinTarget: _obData.proteinTarget || 150,
    carbTarget: _obData.carbTarget || 200,
    fatTarget: _obData.fatTarget || 65,
  });
  S.set('user', user);
  if (window._obInjuries && window._obInjuries.length) {
    const injuries = window._obInjuries.map(p => ({ bodyPart:p, severity:'Mild', date:isoNow(), note:'', recovered:false }));
    S.set('injuries', injuries);
  }
  S.set('onboarded', true);
  const nav = document.getElementById('nav');
  if (nav) nav.style.display = '';
  if (typeof buildNav !== 'undefined') buildNav();
  document.documentElement.setAttribute('data-theme', 'electric');
  toast('Welcome to FitnessOS, ' + esc(user.name) + '! 🎉', 'ok', 4000);
  haptic([50,30,50]);
  go('dashboard');
}
window.completeOnboarding = completeOnboarding;
