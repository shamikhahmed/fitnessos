'use strict';
/* ── FitnessOS v4 — Settings (7 sub-tabs) ── */

let _settingsTab = 'profile';

reg('settings', function(opts) {
  if (opts && opts.tab) _settingsTab = opts.tab;
  const user = S.g('user') || {};

  const tabContent = {
    profile: _tabProfile(user),
    training: _tabTraining(user),
    supplements: _tabSupplements(),
    nutrition: _tabNutrition(user),
    appearance: _tabAppearance(user),
    notifications: _tabNotifications(user),
    data: _tabData()
  };

  const tabs = [
    {id:'profile',l:'Profile'},{id:'training',l:'Training'},{id:'supplements',l:'Supplements'},
    {id:'nutrition',l:'Nutrition'},{id:'appearance',l:'Look'},{id:'notifications',l:'Alerts'},{id:'data',l:'Data'}
  ];

  const tabBar = '<div class="settings-tabs">' +
    tabs.map(t => '<button class="settings-tab'+(t.id===_settingsTab?' on':'')+'" onclick="go(\'settings\',{tab:\''+t.id+'\'})">'+t.l+'</button>').join('') +
    '</div>';

  return '<div class="topbar"><div class="topbar-title">Settings</div></div>' +
    tabBar +
    (tabContent[_settingsTab] || _tabProfile(user)) +
    '<div style="height:20px"></div>';
});

function _tabProfile(u) {
  const bmi = BodyEngine.bmi(u.weight||75, u.height||175);
  const tdee = BodyEngine.tdee(u);
  const bmr = BodyEngine.bmr(u);
  const healthyRange = BodyEngine.healthyWeightRange(u.height||175, u.gender||'male');

  return '<div style="padding:16px">' +
    _sectionTitle('Personal Info') +
    _fieldWrap('Name', '<input class="field" type="text" value="'+esc(u.name||'')+'" oninput="_setSetting(\'user.name\',this.value)" placeholder="Your name">') +
    '<div class="field-row">' +
    _fieldWrap('Age', '<input class="field" type="number" value="'+(u.age||25)+'" oninput="_setSetting(\'user.age\',parseInt(this.value))" min="14" max="80">') +
    _fieldWrap('Gender', '<div class="select-wrap"><select class="field" onchange="_setSetting(\'user.gender\',this.value)"><option value="male"'+(u.gender==='male'?' selected':'')+'>Male</option><option value="female"'+(u.gender==='female'?' selected':'')+'>Female</option></select></div>') +
    '</div>' +
    '<div class="field-row">' +
    _fieldWrap('Height (cm)', '<input class="field" type="number" value="'+(u.height||175)+'" oninput="_setSetting(\'user.height\',parseFloat(this.value))">') +
    _fieldWrap('Weight (kg)', '<input class="field" type="number" value="'+(u.weight||75)+'" step="0.1" oninput="_setSetting(\'user.weight\',parseFloat(this.value))">') +
    '</div>' +
    '<div class="field-row">' +
    _fieldWrap('Goal Weight (kg)', '<input class="field" type="number" value="'+(u.goalWeight||70)+'" step="0.1" oninput="_setSetting(\'user.goalWeight\',parseFloat(this.value))">') +
    _fieldWrap('Body Fat %', '<input class="field" type="number" value="'+(u.targetBodyFat||15)+'" oninput="_setSetting(\'user.targetBodyFat\',parseFloat(this.value))">') +
    '</div>' +

    _sectionTitle('Goal') +
    _selectWrap('Primary Goal', 'user.goal', u.goal||'hypertrophy', [
      {v:'hypertrophy',l:'Build Muscle'},{v:'fat_loss',l:'Lose Fat'},{v:'recomp',l:'Recomposition'},
      {v:'athletic',l:'Athletic'},{v:'strength',l:'Strength'},{v:'maintenance',l:'Maintain'}
    ]) +
    _selectWrap('Experience', 'user.exp', u.exp||'intermediate', [
      {v:'beginner',l:'Beginner'},{v:'intermediate',l:'Intermediate'},{v:'advanced',l:'Advanced'},{v:'athlete',l:'Athlete'}
    ]) +
    _selectWrap('Activity Level', 'user.activityLevel', u.activityLevel||'moderate', [
      {v:'sedentary',l:'Sedentary'},{v:'light',l:'Light Active'},{v:'moderate',l:'Moderately Active'},{v:'active',l:'Very Active'},{v:'veryActive',l:'Extremely Active'}
    ]) +

    _sectionTitle('Calculated Metrics') +
    '<div class="card card-solid" style="margin-top:8px">' +
    '<div style="display:flex;flex-wrap:wrap;gap:12px">' +
    _infoStat('BMI', bmi.bmi+'', bmi.cat) +
    _infoStat('BMR', bmr+' kcal', 'At rest') +
    _infoStat('TDEE', tdee+' kcal', 'Total daily') +
    _infoStat('Healthy wt', healthyRange.min+'–'+healthyRange.max+'kg', 'For your height') +
    '</div>' +
    '<div style="margin-top:12px;padding-top:12px;border-top:1px solid var(--border)">' +
    '<button class="btn btn-secondary btn-sm" onclick="showLogWeight()">📊 Log Weight Today</button>' +
    '</div></div>' +
    '</div>';
}

function _tabTraining(u) {
  const equipment = [
    {v:'barbell',l:'Barbell & Rack'},{v:'dumbbell',l:'Dumbbells'},{v:'cables',l:'Cable Machine'},
    {v:'machine',l:'Weight Machines'},{v:'bar',l:'Pull-up Bar'},{v:'kettlebell',l:'Kettlebell'},
    {v:'bands',l:'Resistance Bands'},{v:'legpress',l:'Leg Press'},{v:'smith',l:'Smith Machine'}
  ];
  const eq = u.equipment || [];
  return '<div style="padding:16px">' +
    _sectionTitle('Split & Schedule') +
    _selectWrap('Training Split', 'user.split', u.split||'ppl', [
      {v:'ppl',l:'Push Pull Legs (6d)'},{v:'ul',l:'Upper Lower (4d)'},{v:'fb',l:'Full Body (3d)'},
      {v:'bro',l:'Bro Split (5d)'},{v:'str',l:'Strength (4d)'},{v:'home',l:'Home Warrior (4d)'}
    ]) +

    _sectionTitle('Rest Timer') +
    _fieldWrap('Default Rest (seconds)', '<input class="field" type="number" value="'+(u.restSecs||120)+'" min="30" max="600" step="15" oninput="_setSetting(\'user.restSecs\',parseInt(this.value))">') +

    _sectionTitle('Toggles') +
    _toggle('Auto Progression', 'user.autoProgression', u.autoProgression!==false) +
    _toggle('Show Warmup Protocol', 'user.warmupEnabled', u.warmupEnabled!==false) +
    _toggle('Cardio Recommendations', 'user.cardioEnabled', u.cardioEnabled!==false) +
    _toggle('Deload Reminders', 'user.deloadReminder', u.deloadReminder!==false) +

    _sectionTitle('Equipment') +
    equipment.map(e => {
      const on = eq.includes(e.v);
      return '<div class="toggle-row">' +
        '<div class="toggle-info"><div class="toggle-label">'+esc(e.l)+'</div></div>' +
        '<button class="toggle'+(on?' on':'')+'" onclick="toggleEquipment(\''+e.v+'\')"></button>' +
        '</div>';
    }).join('') + '</div>';
}

function _tabSupplements() {
  const userSupps = S.g('supplements') || [];
  return '<div style="padding:16px">' +
    _sectionTitle('My Stack') +
    (userSupps.length ? userSupps.map(s =>
      '<div class="toggle-row">' +
      '<div class="toggle-info"><div class="toggle-label">'+esc(s.name)+'</div>' +
      '<div class="toggle-sub">'+esc(s.timing)+' · '+esc(s.dose||'')+'</div></div>' +
      '<button onclick="removeSupp(\''+esc(s.id)+'\')" style="color:#ff4444;background:none;border:none;cursor:pointer;padding:8px;font-size:13px;font-weight:600;min-height:44px">Remove</button>' +
      '</div>'
    ).join('') : '<div style="color:var(--txt3);padding:12px 0;font-size:14px">No supplements in stack. Add them via Nutrition.</div>') +
    '<div class="spacer-sm"></div>' +
    '<button class="btn btn-secondary btn-sm" onclick="go(\'nutrition\')" style="width:100%">Manage in Nutrition →</button>' +
    '</div>';
}

function _tabNutrition(u) {
  const tdee = BodyEngine.tdee(u);
  const macros = TDEEEngine.macroSplit(u.goal||'hypertrophy', tdee);
  return '<div style="padding:16px">' +
    _sectionTitle('Daily Targets') +
    _fieldWrap('Calories (kcal)', '<input class="field" type="number" value="'+(u.calorieTarget||2200)+'" oninput="_setSetting(\'user.calorieTarget\',parseInt(this.value))">') +
    '<div class="field-row">' +
    _fieldWrap('Protein (g)', '<input class="field" type="number" value="'+(u.proteinTarget||165)+'" oninput="_setSetting(\'user.proteinTarget\',parseInt(this.value))">') +
    _fieldWrap('Carbs (g)', '<input class="field" type="number" value="'+(u.carbTarget||220)+'" oninput="_setSetting(\'user.carbTarget\',parseInt(this.value))">') +
    '</div>' +
    '<div class="field-row">' +
    _fieldWrap('Fat (g)', '<input class="field" type="number" value="'+(u.fatTarget||70)+'" oninput="_setSetting(\'user.fatTarget\',parseInt(this.value))">') +
    _fieldWrap('Water (glasses)', '<input class="field" type="number" value="'+(u.waterTarget||8)+'" min="4" max="20" oninput="_setSetting(\'user.waterTarget\',parseInt(this.value))">') +
    '</div>' +
    _sectionTitle('Macro Presets') +
    '<div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:4px">' +
    ['hypertrophy','fat_loss','strength','maintenance','athletic'].map(g =>
      '<button class="btn btn-secondary btn-sm" onclick="applyMacroPreset(\''+g+'\')" style="flex:1;min-width:100px">'+esc(g.replace('_',' '))+'</button>'
    ).join('') + '</div>' +
    '<div style="padding:12px 0;font-size:13px;color:var(--txt3)">Calculated TDEE: '+tdee+' kcal/day</div>' +
    '</div>';
}

function _tabAppearance(u) {
  const themes = [
    {id:'carbon',label:'Carbon',grad:'linear-gradient(135deg,#00d5ff,#6b5fff)'},
    {id:'stealth',label:'Stealth',grad:'linear-gradient(135deg,#f5c842,#e8a020)'},
    {id:'forest',label:'Forest',grad:'linear-gradient(135deg,#10B981,#059669)'},
    {id:'arctic',label:'Arctic',grad:'linear-gradient(135deg,#007AFF,#5856D6)'},
    {id:'electric',label:'Electric',grad:'linear-gradient(135deg,#00f0ff,#0080ff)'},
    {id:'sunset',label:'Sunset',grad:'linear-gradient(135deg,#ff6b35,#f7931e)'}
  ];
  const coaches = [
    {id:'alex',e:'🔥',n:'Alex — Drill Sergeant'},
    {id:'maya',e:'🧪',n:'Maya — Sports Scientist'},
    {id:'sam',e:'⚡',n:'Sam — The Motivator'},
    {id:'zen',e:'🧘',n:'Zen — Mindful Coach'},
    {id:'rex',e:'💪',n:'Rex — The Powerlifter'}
  ];
  const cur = u.theme || 'carbon';
  const curCoach = u.coachPersonality || 'maya';

  return '<div style="padding:16px">' +
    _sectionTitle('Theme') +
    '<div class="theme-swatches">' +
    themes.map(t =>
      '<div class="theme-item" onclick="applyTheme(\''+t.id+'\');_setSetting(\'user.theme\',\''+t.id+'\');go(\'settings\',{tab:\'appearance\'})">' +
      '<div class="theme-swatch'+(cur===t.id?' on':'')+'" style="background:'+t.grad+'"></div>' +
      '<div class="theme-label">'+esc(t.label)+'</div>' +
      '</div>'
    ).join('') + '</div>' +

    _sectionTitle('Coach Personality') +
    coaches.map(c =>
      '<div class="toggle-row card-tap" onclick="_setSetting(\'user.coachPersonality\',\''+c.id+'\');go(\'settings\',{tab:\'appearance\'})" style="cursor:pointer">' +
      '<div class="toggle-info">' +
      '<div style="font-size:18px;margin-bottom:2px">'+c.e+'</div>' +
      '<div class="toggle-label">'+esc(c.n)+'</div>' +
      '</div>' +
      '<div style="font-size:18px">'+(curCoach===c.id?'✅':'○')+'</div>' +
      '</div>'
    ).join('') +

    _sectionTitle('Coach Tone') +
    (function() {
      const curTone = S.g('settings.coachTone') || 'motivational';
      const tones = [{v:'motivational',l:'🔥 Motivational'},{v:'scientific',l:'🧪 Scientific'},{v:'hardcore',l:'💪 Hardcore'}];
      const examples = {
        motivational:'"🔥 You\'re crushing it — shoulders are 92% recovered!"',
        scientific:'"Deltoid recovery index: 92%. Optimal training window active."',
        hardcore:'"Shoulders are ready. No excuses. Get in there."'
      };
      return '<div style="display:flex;gap:8px;margin-bottom:8px">' +
        tones.map(t=>'<button class="btn btn-'+(curTone===t.v?'primary':'secondary')+' btn-sm" style="flex:1" onclick="_setSetting(\'settings.coachTone\',\''+t.v+'\');go(\'settings\',{tab:\'appearance\'})">'+esc(t.l)+'</button>').join('') +
        '</div>' +
        '<div style="font-size:13px;color:var(--txt3);font-style:italic;padding:8px 12px;background:var(--bg3);border-radius:8px;margin-bottom:4px">'+esc(examples[curTone]||examples.motivational)+'</div>';
    })() +

    _sectionTitle('Units') +
    '<div style="display:flex;gap:8px">' +
    ['metric','imperial'].map(unit =>
      '<button class="btn btn-'+(u.units===unit?'primary':'secondary')+' btn-sm" style="flex:1" onclick="_setSetting(\'user.units\',\''+unit+'\');go(\'settings\',{tab:\'appearance\'})">'+unit.charAt(0).toUpperCase()+unit.slice(1)+'</button>'
    ).join('') + '</div>' + '</div>';
}

function _tabNotifications(u) {
  return '<div style="padding:16px">' +
    _sectionTitle('Alerts') +
    _toggle('Supplement Reminders', 'user.suppReminders', u.suppReminders!==false) +
    _toggle('Rest Day Reminders', 'user.restDayReminders', u.restDayReminders!==false) +
    _toggle('Streak Alerts', 'user.streakAlerts', u.streakAlerts!==false) +
    _toggle('Caffeine Warning', 'user.caffeineWarning', u.caffeineWarning!==false) +
    '</div>';
}

function _tabData() {
  const ws = S.g('workouts') || [];
  const joinDate = S.g('user.joinDate');
  return '<div style="padding:16px">' +
    _sectionTitle('My Data') +
    '<div class="card card-solid" style="margin-bottom:14px">' +
    '<div style="display:flex;flex-wrap:wrap;gap:12px">' +
    _infoStat('Workouts', String(ws.length), 'logged') +
    _infoStat('Member since', joinDate ? new Date(joinDate).toLocaleDateString('en-GB',{month:'short',year:'numeric'}) : '—', '') +
    _infoStat('Version', 'v4.0', 'FitnessOS') +
    '</div></div>' +

    _sectionTitle('Profiles') +
    '<button class="btn btn-secondary" onclick="go(\'profiles\')" style="margin-bottom:10px">👤 Manage Profiles</button>' +
    '<button class="btn btn-danger" onclick="confirmClearData()" style="margin-bottom:10px">🗑️ Reset This Profile</button>' +

    _sectionTitle('Export & Import') +
    '<button class="btn btn-secondary" onclick="exportData()" style="margin-bottom:10px">📤 Export Backup (JSON)</button>' +
    '<div class="field-wrap">' +
    '<label class="field-label">Import Backup</label>' +
    '<input class="field" type="file" accept=".json" onchange="importData(this)" style="font-size:14px">' +
    '</div>' +

    _sectionTitle('Danger Zone') +
    '<button class="btn btn-danger" onclick="confirmClearData()">🗑️ Clear All Data</button>' +

    '<div style="margin-top:32px;text-align:center;color:var(--txt3);font-size:13px">FitnessOS v4 · by <strong>Shamikh Ahmed</strong></div>' +
    '</div>';
}

/* ── Helpers ── */
function _sectionTitle(t) {
  return '<div class="settings-section-title">'+esc(t)+'</div>';
}
function _fieldWrap(label, inputHTML) {
  return '<div class="field-wrap"><label class="field-label">'+esc(label)+'</label>'+inputHTML+'</div>';
}
function _selectWrap(label, key, current, opts) {
  return _fieldWrap(label,
    '<div class="select-wrap"><select class="field" onchange="_setSetting(\''+key+'\',this.value)">' +
    opts.map(o=>'<option value="'+o.v+'"'+(current===o.v?' selected':'')+'>'+esc(o.l)+'</option>').join('') +
    '</select></div>'
  );
}
function _toggle(label, key, current) {
  return '<div class="toggle-row">' +
    '<div class="toggle-info"><div class="toggle-label">'+esc(label)+'</div></div>' +
    '<button class="toggle'+(current?' on':'')+'" onclick="toggleSetting(\''+key+'\')"></button>' +
    '</div>';
}
function _infoStat(label, val, sub) {
  return '<div style="flex:1;min-width:80px">' +
    '<div style="font-size:18px;font-weight:800;color:var(--c1)">'+esc(val)+'</div>' +
    '<div style="font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:var(--txt3)">'+esc(label)+'</div>' +
    (sub?'<div style="font-size:12px;color:var(--txt3)">'+esc(sub)+'</div>':'') +
    '</div>';
}

/* ── Actions ── */
window._setSetting = function(key, val) { S.set(key, val); };

window.toggleSetting = function(key) {
  const cur = S.g(key);
  S.set(key, !cur);
  go('settings', { tab: _settingsTab });
};

window.toggleEquipment = function(val) {
  const eq = S.g('user.equipment') || [];
  const idx = eq.indexOf(val);
  if (idx >= 0) eq.splice(idx, 1); else eq.push(val);
  S.set('user.equipment', eq);
  go('settings', { tab: _settingsTab });
};

window.removeSupp = function(id) {
  const supps = (S.g('supplements')||[]).filter(s=>s.id!==id);
  S.set('supplements', supps);
  go('settings', { tab: 'supplements' });
};

window.applyMacroPreset = function(goal) {
  const tdee = BodyEngine.tdee(S.g('user')||{});
  const macros = TDEEEngine.macroSplit(goal, tdee);
  S.set('user.calorieTarget', tdee);
  S.set('user.proteinTarget', macros.protein);
  S.set('user.carbTarget', macros.carbs);
  S.set('user.fatTarget', macros.fat);
  toast('Macro preset applied for '+goal.replace('_',' '), 'ok');
  go('settings', { tab: 'nutrition' });
};

window.showLogWeight = function() {
  modal('Log Weight',
    '<div class="field-wrap"><label class="field-label">Weight (kg)</label>' +
    '<input id="wt-inp" class="field" type="number" step="0.1" placeholder="'+(S.g('user.weight')||75)+'" style="font-size:22px;font-weight:700"></div>',
    '<button class="btn btn-primary" onclick="saveWeight()" style="margin-top:12px">Save</button>'
  );
};

window.saveWeight = function() {
  const w = parseFloat(document.getElementById('wt-inp')?.value);
  if (!w) { toast('Enter a weight', 'warn'); return; }
  S.set('user.weight', w);
  S.push('bodyStats', { date: today(), weight: w });
  closeModal();
  toast('Weight logged: '+w+'kg', 'ok');
};

window.exportData = function() {
  const data = JSON.stringify(S.d, null, 2);
  const blob = new Blob([data], { type:'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'fitnessos-backup-'+today()+'.json';
  document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
  toast('Backup exported!', 'ok');
};

window.importData = function(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = JSON.parse(e.target.result);
      Object.assign(S.d, data); S.save();
      toast('Data imported!', 'ok');
      location.reload();
    } catch(err) { toast('Invalid backup file', 'err'); }
  };
  reader.readAsText(file);
};

window.confirmClearData = function() {
  modal('Clear All Data?',
    '<div style="font-size:15px;color:var(--txt2);line-height:1.6">This will permanently delete all workouts, progress, and settings. This cannot be undone.</div>',
    '<button class="btn btn-danger" onclick="S.reset()" style="margin-top:12px">Delete Everything</button>' +
    '<button class="btn btn-ghost" onclick="closeModal()" style="margin-top:8px">Cancel</button>'
  );
};
