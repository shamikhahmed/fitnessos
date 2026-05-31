'use strict';

reg('dashboard', function() {
  const user = S.g('user') || {};
  const ws = S.g('workouts') || [];
  const meals = S.g('meals') || [];
  const water = S.g('water') || [];
  const prs = S.g('prs') || [];
  const recovery = S.g('recovery') || {};

  const score = ReadinessEngine.score();
  const rl = ReadinessEngine.label(score);
  const streak = StreakEngine.get();
  const weekWkts = StreakEngine.weekWorkouts();
  const muscles = MuscleEngine.status();
  const insights = CoachEngine.insights();

  const hr = new Date().getHours();
  const greeting = hr < 12 ? 'Good Morning' : hr < 17 ? 'Good Afternoon' : 'Good Evening';
  const name = user.name || 'Athlete';
  const todayStr = new Date().toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long'});

  // Today calories
  const todayCals = meals.filter(m => m.date === today()).reduce((a,m) => a + (m.calories||0), 0);
  const calTarget = user.calorieTarget || 2000;
  const calPct = Math.min(Math.round((todayCals / calTarget) * 100), 100);

  // Water today
  const todayWater = water.filter(w => w.date === today()).length;
  const waterTarget = user.waterTarget || 8;
  const waterPct = Math.min(Math.round((todayWater / waterTarget) * 100), 100);

  // Weekly workout rings
  const weekGoal = user.weeklyGoal || 4;
  const weekPct = Math.min(Math.round((weekWkts.length / weekGoal) * 100), 100);

  // Today's split suggestion
  let splitCard = '';
  if (typeof WE !== 'undefined') {
    try {
      const day = WE.getSplitDay();
      if (day) {
        const exList = (day.exercises || []).slice(0, 4).map(e => '<span class="pill">' + esc(e) + '</span>').join('');
        const muscles_pills = (day.muscles || []).map(m => '<span class="mchip fresh">' + esc(m) + '</span>').join('');
        splitCard = '<div class="card card-tap card-dark" onclick="go(\'workouts\')">' +
          '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">' +
          '<div><div style="font-size:18px;font-weight:800">' + esc(day.n) + '</div>' +
          '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:6px">' + muscles_pills + '</div></div>' +
          '<span style="font-size:28px">💪</span></div>' +
          '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px">' + exList + '</div>' +
          '<button class="btn btn-p" onclick="event.stopPropagation();go(\'workouts\')">Start Workout →</button></div>';
      }
    } catch(e) {}
  }

  // Last workout timer
  let lastWktStr = '';
  if (ws.length) {
    const d = daysAgo(ws[ws.length-1].date);
    lastWktStr = d === 0 ? 'Trained today' : d === 1 ? 'Last trained yesterday' : 'Last trained ' + d + ' days ago';
  }

  // Rings HTML
  function ring(pct, color, label, sub) {
    const r = 28, circ = 2*Math.PI*r, dash = circ*(pct/100);
    return '<div class="ring-wrap"><div class="ring-outer">' +
      '<svg class="ring-svg" width="72" height="72" viewBox="0 0 72 72">' +
      '<circle cx="36" cy="36" r="' + r + '" fill="none" stroke="var(--bg4)" stroke-width="6"/>' +
      '<circle cx="36" cy="36" r="' + r + '" fill="none" stroke="' + color + '" stroke-width="6" stroke-linecap="round" stroke-dasharray="' + circ.toFixed(1) + '" stroke-dashoffset="' + (circ - dash).toFixed(1) + '"/>' +
      '</svg>' +
      '<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:800;transform:rotate(90deg)">' + pct + '%</div>' +
      '</div><div class="ring-label">' + esc(label) + '<br><span style="color:var(--txt3);font-size:10px">' + esc(sub) + '</span></div></div>';
  }

  // Muscle chips
  const muscleChips = muscles.map(m =>
    '<div class="mchip ' + m.status + '" style="margin:4px">' + esc(m.name) + '</div>'
  ).join('');

  // AI insights
  const insightCards = insights.map(ins =>
    '<div class="ai-msg" style="border-left-color:' + ins.c + '">' +
    '<div class="ai-msg-i">' + ins.i + '</div>' +
    '<div class="ai-msg-t" style="color:' + ins.c + '">' + esc(ins.t) + '</div>' +
    '<div class="ai-msg-m">' + esc(ins.m) + '</div></div>'
  ).join('');

  // Recent workouts
  const recentWkts = ws.slice(-2).reverse().map(w =>
    '<div class="ex-row" style="padding:12px 16px" onclick="go(\'progress\')">' +
    '<div class="ex-icon">💪</div>' +
    '<div class="ex-info"><div class="ex-name">' + esc(w.name||'Workout') + '</div>' +
    '<div class="ex-sub">' + fmtDate(w.date) + ' · ' + (w.exercises||[]).length + ' exercises</div></div>' +
    '<div style="text-align:right"><div style="font-size:14px;font-weight:700;color:var(--c1)">' + ((w.totalVol||0)/1000).toFixed(1) + 't</div>' +
    '<div style="font-size:11px;color:var(--txt3)">volume</div></div></div>'
  ).join('') || emptyState('💪', 'No workouts yet', 'Start your first session', 'Start Workout', "go('workouts')");

  return topbar(greeting + ', ' + esc(name), todayStr,
    '<button class="topbar-icon" onclick="go(\'recovery\')" title="Log Recovery">😴</button>' +
    '<button class="topbar-icon" onclick="go(\'settings\')" title="Settings">⚙️</button>') +

  // Readiness hero
  '<div class="readiness-card card-tap" onclick="go(\'recovery\')" style="margin:12px 16px 14px;border:1.5px solid ' + rl.c + '">' +
  '<div style="display:flex;align-items:flex-start;justify-content:space-between">' +
  '<div><div class="readiness-score">' + score + '</div>' +
  '<div class="readiness-label" style="color:' + rl.c + ';background:' + rl.bg + '">' + esc(rl.l) + '</div>' +
  '<div class="readiness-msg">' + esc(ReadinessEngine.message(score)) + '</div></div>' +
  '<div style="text-align:right"><div style="font-size:36px">⚡</div>' +
  (lastWktStr ? '<div style="font-size:11px;color:var(--txt3);margin-top:4px">' + esc(lastWktStr) + '</div>' : '') +
  '</div></div>' +
  '<div class="readiness-metrics">' +
  '<div class="readiness-metric"><div class="readiness-metric-v">' + (recovery.sleep||'—') + '</div><div class="readiness-metric-l">Sleep (h)</div></div>' +
  '<div class="readiness-metric"><div class="readiness-metric-v" style="color:' + ((recovery.soreness||3)>=7?'var(--c4)':'var(--txt)') + '">' + (recovery.soreness||'—') + '</div><div class="readiness-metric-l">Soreness</div></div>' +
  '<div class="readiness-metric"><div class="readiness-metric-v">' + (recovery.stress||'—') + '</div><div class="readiness-metric-l">Stress</div></div>' +
  '<div class="readiness-metric"><div class="readiness-metric-v" style="color:var(--c3)">' + (recovery.energy||'—') + '</div><div class="readiness-metric-l">Energy</div></div>' +
  '</div>' +
  (recovery.date !== today() ? '<div style="font-size:12px;color:var(--c1);margin-top:10px;text-align:center">Tap to log today\'s recovery →</div>' : '') +
  '</div>' +

  // Today's workout
  (splitCard ? sh('Today\'s Plan') + splitCard : '') +

  // Activity rings
  sh('Activity') +
  '<div class="card card-dark" style="margin:0 16px 14px">' +
  '<div style="display:flex;justify-content:space-around;padding:8px 0">' +
  ring(weekPct, 'var(--c3)', 'Workouts', weekWkts.length + '/' + weekGoal) +
  ring(calPct, 'var(--c1)', 'Calories', todayCals + ' kcal') +
  ring(waterPct, 'var(--c2)', 'Water', todayWater + '/' + waterTarget) +
  '</div></div>' +

  // Stats row
  sh('Stats') +
  '<div class="stats-grid">' +
  '<div class="stat cyan"><div class="stat-v">' + streak + '🔥</div><div class="stat-l">Day Streak</div></div>' +
  '<div class="stat purple"><div class="stat-v">' + (weekWkts.reduce((a,w)=>a+(w.totalVol||0),0)/1000).toFixed(1) + 't</div><div class="stat-l">Week Volume</div></div>' +
  '<div class="stat green"><div class="stat-v">' + ws.length + '</div><div class="stat-l">Workouts</div></div>' +
  '<div class="stat amber"><div class="stat-v">' + prs.length + '</div><div class="stat-l">PRs Set</div></div>' +
  '</div>' +

  // Muscle recovery
  sh('Muscle Recovery', 'Details', "go('progress')") +
  '<div class="card card-dark" style="margin:0 16px 14px">' +
  '<div style="display:flex;flex-wrap:wrap;gap:4px">' + muscleChips + '</div></div>' +

  // AI insights
  sh('AI Insights', 'Full Analysis', "go('ai')") +
  insightCards +

  // Recent workouts
  sh('Recent Workouts', 'All', "go('progress')") +
  '<div class="card card-dark" style="margin:0 16px 14px;padding:0 4px">' + recentWkts + '</div>' +

  // Explore
  sh('Explore FitnessOS') +
  '<div class="module-list">' +
  '<button class="module-card" onclick="go(\'bodystats\')">' +
    '<div class="module-card-icon">📏</div>' +
    '<div class="module-card-body"><div class="module-card-title">Body Stats</div><div class="module-card-sub">Weight & measurements</div></div>' +
    '<div class="module-card-arrow">→</div>' +
  '</button>' +
  '<button class="module-card" onclick="go(\'cardio\')">' +
    '<div class="module-card-icon">🏃</div>' +
    '<div class="module-card-body"><div class="module-card-title">Cardio</div><div class="module-card-sub">Track runs & sessions</div></div>' +
    '<div class="module-card-arrow">→</div>' +
  '</button>' +
  '<button class="module-card" onclick="go(\'nutrition\')">' +
    '<div class="module-card-icon">🥗</div>' +
    '<div class="module-card-body"><div class="module-card-title">Nutrition</div><div class="module-card-sub">Calories & macros</div></div>' +
    '<div class="module-card-arrow">→</div>' +
  '</button>' +
  '<button class="module-card" onclick="go(\'injuries\')">' +
    '<div class="module-card-icon">🩹</div>' +
    '<div class="module-card-body"><div class="module-card-title">Injuries</div><div class="module-card-sub">Smart injury guard</div></div>' +
    '<div class="module-card-arrow">→</div>' +
  '</button>' +
  '<button class="module-card" onclick="go(\'progress\')">' +
    '<div class="module-card-icon">📊</div>' +
    '<div class="module-card-body"><div class="module-card-title">Progress</div><div class="module-card-sub">Charts & PRs</div></div>' +
    '<div class="module-card-arrow">→</div>' +
  '</button>' +
  '<button class="module-card" onclick="go(\'settings\')">' +
    '<div class="module-card-icon">⚙️</div>' +
    '<div class="module-card-body"><div class="module-card-title">Settings</div><div class="module-card-sub">Profile & preferences</div></div>' +
    '<div class="module-card-arrow">→</div>' +
  '</button>' +
  '</div>' +
  '<div style="height:8px"></div>';
});

// AI Coach screen
reg('ai', function() {
  const user = S.g('user') || {};
  const recovery = S.g('recovery') || {};
  const score = ReadinessEngine.score();
  const rl = ReadinessEngine.label(score);
  const muscles = MuscleEngine.status();
  const insights = CoachEngine.insights();
  const weekInsights = CoachEngine.weeklyInsights();
  const ws = S.g('workouts') || [];
  const prs = S.g('prs') || [];
  const weekWkts = StreakEngine.weekWorkouts();
  const weekGoal = user.weeklyGoal || 4;
  const consistency = ws.length ? Math.round((weekWkts.length / weekGoal) * 100) : 0;

  const insightCards = insights.map(ins =>
    '<div class="ai-msg" style="border-left-color:' + ins.c + ';margin-bottom:10px">' +
    '<div class="ai-msg-i">' + ins.i + '</div>' +
    '<div class="ai-msg-t" style="color:' + ins.c + '">' + esc(ins.t) + '</div>' +
    '<div class="ai-msg-m">' + esc(ins.m) + '</div></div>'
  ).join('');

  const muscleMap = muscles.map(m => {
    const colors = { fresh:'var(--c3)', moderate:'var(--c5)', tired:'var(--c4)' };
    const pct = m.pct || 0;
    return '<div style="margin-bottom:10px">' +
      '<div style="display:flex;justify-content:space-between;margin-bottom:4px">' +
      '<span style="font-size:13px;font-weight:600">' + esc(m.name) + '</span>' +
      '<span style="font-size:12px;color:' + colors[m.status] + '">' + esc(m.label) + (m.hrs ? ' (' + Math.round(m.hrs) + 'h ago)' : '') + '</span>' +
      '</div>' +
      '<div style="height:6px;background:var(--bg4);border-radius:3px;overflow:hidden">' +
      '<div style="width:' + pct + '%;height:100%;background:' + colors[m.status] + ';border-radius:3px;transition:width 0.5s"></div>' +
      '</div></div>';
  }).join('');

  const sliders = [
    { k:'sleep', l:'Sleep', range:'0-12h', v: recovery.sleep||7.5 },
    { k:'soreness', l:'Soreness', range:'0=none 10=severe', v: recovery.soreness||3 },
    { k:'stress', l:'Stress', range:'0=calm 10=burnt out', v: recovery.stress||4 },
    { k:'energy', l:'Energy', range:'0=exhausted 10=peak', v: recovery.energy||7 },
    { k:'hydration', l:'Hydration', range:'litres', v: recovery.hydration||2.5 },
  ];

  return topbar('AI Coach') +
  '<div class="readiness-card" style="margin:12px 16px 14px;border:1.5px solid ' + rl.c + '">' +
  '<div style="display:flex;align-items:center;gap:20px">' +
  '<div><div class="readiness-score">' + score + '</div>' +
  '<div class="readiness-label" style="color:' + rl.c + ';background:' + rl.bg + '">' + esc(rl.l) + '</div></div>' +
  '<div style="flex:1"><div style="font-size:14px;color:var(--txt2);line-height:1.6">' + esc(ReadinessEngine.message(score)) + '</div></div>' +
  '</div>' +
  '<div class="readiness-metrics" style="margin-top:16px">' +
  sliders.map(s => '<div class="readiness-metric"><div class="readiness-metric-v">' + s.v + '</div><div class="readiness-metric-l">' + esc(s.l) + '</div></div>').join('') +
  '</div></div>' +

  sh('Today\'s Insights') +
  '<div style="padding:0 16px">' + insightCards + '</div>' +

  sh('Muscle Recovery') +
  '<div class="card card-dark" style="margin:0 16px 14px">' + muscleMap + '</div>' +

  sh('Progression Analysis') +
  '<div class="stats-grid" style="margin-bottom:14px">' +
  '<div class="stat cyan"><div class="stat-v">' + StreakEngine.weekVolume().toLocaleString() + '</div><div class="stat-l">Week Volume kg</div></div>' +
  '<div class="stat purple"><div class="stat-v">' + prs.length + '</div><div class="stat-l">Total PRs</div></div>' +
  '<div class="stat green"><div class="stat-v">' + consistency + '%</div><div class="stat-l">Consistency</div></div>' +
  '<div class="stat amber"><div class="stat-v">' + ws.length + '</div><div class="stat-l">Total Sessions</div></div>' +
  '</div>' +

  (weekInsights.length ? sh('Weekly Insights') + weekInsights.map(i => '<div class="ai-msg" style="margin:0 16px 10px"><div class="ai-msg-m">' + esc(i) + '</div></div>').join('') : '') +

  sh('Quick Actions') +
  '<div class="btn-row">' +
  '<button class="btn btn-p btn-sm" onclick="go(\'workouts\')">💪 Workout</button>' +
  '<button class="btn btn-s btn-sm" onclick="go(\'recovery\')">😴 Recovery</button>' +
  '</div>' +
  '<div class="btn-row">' +
  '<button class="btn btn-s btn-sm" onclick="go(\'progress\')">📈 Progress</button>' +
  '<button class="btn btn-s btn-sm" onclick="go(\'bodystats\')">📏 Body Stats</button>' +
  '</div>' +
  '<div style="height:8px"></div>';
});
