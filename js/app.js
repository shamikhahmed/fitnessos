'use strict';

const App = (function () {
  const routes = {};
  const afterRenderHooks = {};
  let _currentRoute = null;
  let _toastTimer = null;

  async function go(id, params) {
    const fn = routes[id];
    if (!fn) return;
    _currentRoute = id;

    document.querySelectorAll('.nb').forEach(function (b) { b.classList.remove('on'); });
    const nb = document.querySelector('[data-route="' + id + '"]');
    if (nb) nb.classList.add('on');

    const view = document.getElementById('view');
    if (view) {
      view.scrollTop = 0;
      view.innerHTML = '<div class="screen loading-center"><div class="spinner"></div></div>';
    }

    try {
      const html = await fn(params);
      if (!view) return;
      const d = document.createElement('div');
      d.className = 'screen';
      d.innerHTML = html || '';
      view.innerHTML = '';
      view.appendChild(d);
      if (afterRenderHooks[id]) afterRenderHooks[id](params);
    } catch (err) {
      console.error('[App] route error:', id, err);
      if (view) view.innerHTML = '<div class="screen" style="padding:24px;color:var(--err)">Error loading page.</div>';
    }
  }

  function toast(msg, type) {
    type = type || 'ok';
    const el = document.getElementById('toast');
    if (!el) return;
    const icons   = { ok: '✓', warn: '⚠', err: '✕', pr: '🏆', info: 'ℹ' };
    const colors  = { ok: 'var(--ok)', warn: 'var(--warn)', err: 'var(--err)', pr: '#FFD700', info: 'var(--info)' };
    const c = colors[type] || colors.ok;
    el.style.borderColor = c;
    el.innerHTML =
      '<span class="toast-icon" style="color:' + c + '">' + (icons[type] || '✓') + '</span>' +
      '<span class="toast-msg">' + msg + '</span>';
    el.className = 'toast show';
    clearTimeout(_toastTimer);
    _toastTimer = setTimeout(function () { el.classList.remove('show'); }, 3500);
  }

  function haptic(pattern) {
    try { if (navigator.vibrate) navigator.vibrate(pattern || 30); } catch (e) {}
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme || 'dark');
    const meta = document.querySelector('meta[name="theme-color"]');
    const bg = { dark: '#080808', forest: '#050c08', ocean: '#050810', rose: '#0d0508', slate: '#06080c', amber: '#0c0800' };
    if (meta) meta.content = bg[theme] || '#080808';
  }

  function fmtDate(iso) {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' });
  }
  function fmtTime(iso) {
    if (!iso) return '';
    return new Date(iso).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' });
  }
  function today() { return new Date().toISOString().slice(0, 10); }
  function isoNow() { return new Date().toISOString(); }
  function esc(str) { return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

  function topbar(title, sub, right) {
    return '<div class="topbar"><div>' +
      (sub ? '<div class="tb-sub">' + esc(sub) + '</div>' : '') +
      '<div class="tb-title">' + esc(title) + '</div>' +
      '</div>' + (right || '') + '</div>';
  }
  function sh(title, linkText, linkAction) {
    return '<div class="sh"><div class="sh-t">' + esc(title) + '</div>' +
      (linkText ? '<span class="sh-a" onclick="' + linkAction + '">' + linkText + '</span>' : '') +
      '</div>';
  }
  function statBox(value, label, cls, onclick) {
    return '<div class="stat' + (cls ? ' ' + cls : '') + '"' +
      (onclick ? ' onclick="' + onclick + '" style="cursor:pointer"' : '') + '>' +
      '<div class="sv">' + value + '</div>' +
      '<div class="sl">' + label + '</div></div>';
  }
  function svgCheck() {
    return '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
  }

  /* ── Onboarding ── */
  let _obStep = 0;
  let _obData = {};
  const OB_STEPS = [
    { q: 'What is your name?', sub: 'We personalise everything for you.', type: 'text', key: 'name', ph: 'Your name' },
    { q: 'Your gender?', sub: 'Used for calorie and strength recommendations.', type: 'choice', key: 'gender', opts: [
      { v: 'male', i: '👨', l: 'Male', s: '' },
      { v: 'female', i: '👩', l: 'Female', s: '' },
      { v: 'neutral', i: '🧑', l: 'Non-binary / Other', s: '' }
    ]},
    { q: 'Your primary goal?', sub: 'We build your program around this.', type: 'choice', key: 'goal', opts: [
      { v: 'hypertrophy', i: '💪', l: 'Build Muscle', s: 'Maximize size and strength' },
      { v: 'strength', i: '🏋️', l: 'Get Stronger', s: 'Heavy compound lifts focus' },
      { v: 'fat_loss', i: '🔥', l: 'Lose Fat', s: 'Burn fat while preserving muscle' },
      { v: 'recomp', i: '🔄', l: 'Body Recomposition', s: 'Build muscle and lose fat' }
    ]},
    { q: 'Training experience?', sub: 'Honest answer leads to better programming.', type: 'choice', key: 'exp', opts: [
      { v: 'beginner', i: '🌱', l: 'Beginner', s: 'Less than 1 year' },
      { v: 'intermediate', i: '📈', l: 'Intermediate', s: '1–3 years' },
      { v: 'advanced', i: '🏆', l: 'Advanced', s: '3+ years' }
    ]},
    { q: 'Training split', sub: 'You can change this anytime in Settings.', type: 'choice', key: 'split', opts: [
      { v: 'ppl', i: '🔄', l: 'Push Pull Legs', s: '6 days/week — Best for hypertrophy' },
      { v: 'ul',  i: '⬆️', l: 'Upper Lower', s: '4 days/week — Great balance' },
      { v: 'fb',  i: '🌟', l: 'Full Body', s: '3 days/week — Perfect for beginners' },
      { v: 'bro', i: '💯', l: 'Bro Split', s: '5 days/week — Classic bodybuilding' }
    ]},
    { q: 'Your body stats', sub: 'Used for weight recommendations and TDEE.', type: 'stats', key: 'stats' }
  ];

  function renderOnboard() {
    const step = OB_STEPS[_obStep];
    const pct = Math.round((_obStep / OB_STEPS.length) * 100);
    let h = '<div class="ob">';
    h += '<div class="ob-prog"><div class="ob-bar" style="width:' + pct + '%"></div></div>';
    h += '<p class="ob-step">Step ' + (_obStep + 1) + ' of ' + OB_STEPS.length + '</p>';
    h += '<div class="ob-title">' + step.q + '</div>';
    if (step.sub) h += '<p class="ob-sub">' + step.sub + '</p>';
    if (step.type === 'text') {
      h += '<div style="margin-top:26px"><input id="ob-inp" class="field" style="font-size:22px;padding:17px" placeholder="' + (step.ph || '') + '" value="' + esc(_obData[step.key] || '') + '" oninput="App._obI(this.value)" inputmode="text"></div>';
    }
    if (step.type === 'choice') {
      h += '<div class="ob-opts">';
      step.opts.forEach(function (o) {
        const sel = _obData[step.key] === o.v;
        h += '<div class="ob-opt' + (sel ? ' on' : '') + '" onclick="App._obS(\'' + o.v + '\')">';
        h += '<span class="ob-oi">' + o.i + '</span><div><div class="ob-ot">' + o.l + '</div>';
        if (o.s) h += '<div class="ob-os">' + o.s + '</div>';
        h += '</div></div>';
      });
      h += '</div>';
    }
    if (step.type === 'stats') {
      h += '<div style="margin-top:22px"><div class="g2 mb12">';
      h += '<div class="fw"><label class="field-label">Age</label><input class="field" type="number" inputmode="numeric" placeholder="25" value="' + (_obData.age || '') + '" oninput="App._obD(\'age\',this.value)"></div>';
      h += '<div class="fw"><label class="field-label">Units</label><select class="field" onchange="App._obD(\'units\',this.value)"><option value="metric"' + ((_obData.units || 'metric') === 'metric' ? ' selected' : '') + '>kg / cm</option><option value="imperial"' + (_obData.units === 'imperial' ? ' selected' : '') + '>lbs / in</option></select></div>';
      h += '<div class="fw"><label class="field-label">Weight</label><input class="field" type="number" inputmode="decimal" placeholder="75" value="' + (_obData.weight || '') + '" oninput="App._obD(\'weight\',this.value)"></div>';
      h += '<div class="fw"><label class="field-label">Height</label><input class="field" type="number" inputmode="decimal" placeholder="175" value="' + (_obData.height || '') + '" oninput="App._obD(\'height\',this.value)"></div>';
      h += '</div></div>';
    }
    h += '<div class="ob-act">';
    h += '<button class="btn btn-primary mb12" onclick="App._obN()">' + (_obStep < OB_STEPS.length - 1 ? 'Continue →' : 'Start Training ⚡') + '</button>';
    if (_obStep > 0) h += '<button class="btn btn-secondary" onclick="App._obB()">← Back</button>';
    h += '</div></div>';
    return h;
  }

  function _showOb() {
    const view = document.getElementById('view');
    if (!view) return;
    const d = document.createElement('div');
    d.className = 'screen';
    d.innerHTML = renderOnboard();
    view.innerHTML = '';
    view.appendChild(d);
  }

  async function boot() {
    await Storage.init();
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js').catch(function () {});
    }
    const user = await Storage.getUser();
    applyTheme(user.theme || 'dark');
    const nav = document.getElementById('nav');
    if (user.onboarded) {
      if (nav) nav.style.display = '';
      go('dashboard');
    } else {
      if (nav) nav.style.display = 'none';
      _showOb();
    }
  }

  return {
    register: function (id, fn) { routes[id] = fn; },
    afterRender: function (id, fn) { afterRenderHooks[id] = fn; },
    go: go,
    toast: toast,
    haptic: haptic,
    applyTheme: applyTheme,
    fmtDate: fmtDate,
    fmtTime: fmtTime,
    today: today,
    isoNow: isoNow,
    esc: esc,
    topbar: topbar,
    sh: sh,
    statBox: statBox,
    svgCheck: svgCheck,
    currentRoute: function () { return _currentRoute; },

    _obI: function (v) { _obData[OB_STEPS[_obStep].key] = v; },
    _obS: function (v) { _obData[OB_STEPS[_obStep].key] = v; _showOb(); },
    _obD: function (k, v) { _obData[k] = v; },
    _obN: async function () {
      const step = OB_STEPS[_obStep];
      if (step.type === 'text' && !(_obData[step.key] || '').trim()) { toast('Please enter your ' + step.key, 'warn'); return; }
      if (step.type === 'choice' && !_obData[step.key]) { toast('Please make a selection', 'warn'); return; }
      if (_obStep < OB_STEPS.length - 1) { _obStep++; _showOb(); return; }
      const user = await Storage.getUser();
      if (_obData.name)   user.name   = _obData.name.trim();
      if (_obData.gender) user.gender = _obData.gender;
      if (_obData.goal)   user.goal   = _obData.goal;
      if (_obData.exp)    user.exp    = _obData.exp;
      if (_obData.split)  user.split  = _obData.split;
      if (_obData.age)    user.age    = parseInt(_obData.age) || 25;
      if (_obData.weight) user.weight = parseFloat(_obData.weight) || 75;
      if (_obData.height) user.height = parseFloat(_obData.height) || 175;
      if (_obData.units)  user.units  = _obData.units;
      user.onboarded = true;
      user.splitDay = 1;
      await Storage.setUser(user);
      _obStep = 0; _obData = {};
      const nav = document.getElementById('nav');
      if (nav) nav.style.display = '';
      go('dashboard');
      toast('Welcome to FitnessOS, ' + (user.name || 'Athlete') + '!');
    },
    _obB: function () { if (_obStep > 0) { _obStep--; _showOb(); } }
  };
})();

function go(id, params) { App.go(id, params); }
function toast(msg, type) { App.toast(msg, type); }
function haptic(p) { App.haptic(p); }
function reg(id, fn) { App.register(id, fn); }

window.go = go;
window.toast = toast;
window.haptic = haptic;
window.reg = reg;
window.App = App;

/* Init is handled by inline script in index.html */
