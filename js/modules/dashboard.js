'use strict';
/* ── FitnessOS v4 — Dashboard (Session 1 redesign) ── */

reg('dashboard', function() {
  try {
    const user = S.g('user') || {};
    const ws = S.g('workouts') || [];
    const meals = S.g('meals') || [];
    const water = S.g('water') || [];
    const prs = S.g('prs') || [];

    const score = ReadinessEngine.score();
    const rl = ReadinessEngine.label(score);
    const streak = StreakEngine.get();
    const weekWkts = StreakEngine.weekWorkouts();
    const insights = CoachEngine.insights();
    const weekReport = CoachEngine.weeklyReport();
    const splitDay = SplitEngine.getSplitDay();
    const muscles = MuscleEngine.status();
    const dueSupps = SupplementEngine.getDueNow();

    const name = (user.name || 'Athlete').split(' ')[0];
    const hr = new Date().getHours();
    const greeting = hr < 12 ? 'Good morning' : hr < 17 ? 'Good afternoon' : 'Good evening';
    const todayStr = new Date().toLocaleDateString('en-GB', { weekday:'long', day:'numeric', month:'long' });

    // Metrics
    const todayCals = meals.filter(function(m) { return m.date === today(); }).reduce(function(a,m) { return a+(m.calories||0); }, 0);
    const calTarget = user.calorieTarget || 2200;
    const calTarget2 = S.g('goals.dailyCalories') || calTarget;
    const waterTarget2 = S.g('goals.dailyWater') || 2500;
    const weekGoal = user.weeklyGoal || 4;
    const weekGoal2 = S.g('goals.weeklyWorkouts') || weekGoal;
    const todayCalories2 = S.g('nutrition.todayCalories') || todayCals;
    const todayWaterMl = S.g('nutrition.todayWater') || 0;
    const weekVol = StreakEngine.weekVolume();
    const recoveryToday = S.g('recovery') || {};
    const loggedToday = recoveryToday.date === today();

    // ── 1. Topbar ────────────────────────────────────────
    const isDark = (S.g('user.mode') || 'dark') !== 'light';
    const modeIcon = isDark ? '🌙' : '☀️';
    const nextMode = isDark ? 'light' : 'dark';
    const activeProf = S.profiles().find(function(p){return p.id===S.activeId();}) || {avatar:'💪'};
    const isDemoMode = S.activeId() === 'demo';
    const demoBanner = isDemoMode ?
      '<div style="background:linear-gradient(135deg,rgba(123,95,255,0.15),rgba(0,213,255,0.1));' +
      'border-bottom:1px solid rgba(123,95,255,0.2);padding:10px 16px;' +
      'display:flex;align-items:center;justify-content:space-between;gap:12px">' +
      '<div style="font-size:13px;color:#7b5fff;font-weight:600">🤖 Demo Mode — exploring sample data</div>' +
      '<button onclick="go(\'profiles\')" style="font-size:12px;color:var(--c1);font-weight:600;' +
      'background:none;border:none;cursor:pointer;touch-action:manipulation;white-space:nowrap">Switch →</button>' +
      '</div>' : '';
    const topbarHTML = '<div class="topbar">' +
      '<div class="topbar-left" style="cursor:pointer;touch-action:manipulation" onclick="go(\'profiles\')">' +
      '<div style="display:flex;align-items:center;gap:8px">' +
      '<div style="font-size:20px">'+activeProf.avatar+'</div>' +
      '<div>' +
      '<div class="topbar-greeting">'+esc(greeting)+', '+esc(name)+' 👋</div>' +
      '<div class="topbar-date">'+esc(todayStr)+'</div>' +
      '</div></div></div>' +
      '<div class="topbar-right">' +
      '<button class="topbar-icon press" onclick="applyMode(\''+nextMode+'\')" aria-label="Toggle mode">'+modeIcon+'</button>' +
      '<button class="topbar-icon press" onclick="applyTheme(\''+_nextTheme(user.theme||'carbon')+'\')">🎨</button>' +
      '<button class="topbar-icon press" onclick="go(\'settings\')">⚙️</button>' +
      '</div></div>';

    // ── 2. Readiness hero card ───────────────────────────
    const r = S.g('recovery') || {};
    const rdColor = score >= 80 ? '#30d158' : score >= 60 ? 'var(--c1)' : score >= 40 ? '#ff9f0a' : '#ff453a';
    const sleepV = r.sleep != null ? r.sleep : 7.5;
    const sorenessV = r.soreness != null ? r.soreness : 3;
    const stressV = r.stress != null ? r.stress : 4;
    const energyV = r.energy != null ? r.energy : 7;
    const sleepC = sleepV >= 7 ? '#30d158' : sleepV >= 6 ? '#ff9f0a' : '#ff453a';
    const sorenessC = sorenessV <= 3 ? '#30d158' : sorenessV <= 6 ? '#ff9f0a' : '#ff453a';
    const stressC = stressV <= 3 ? '#30d158' : stressV <= 6 ? '#ff9f0a' : '#ff453a';
    const energyC = energyV >= 7 ? '#30d158' : energyV >= 5 ? '#ff9f0a' : '#ff453a';

    const readinessHTML =
      '<div class="readiness-card">' +
      '<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:140px;height:140px;border-radius:50%;background:'+rdColor+';animation:rdBreathe 3s ease-in-out infinite;pointer-events:none"></div>' +
      '<div style="position:relative;z-index:1">' +
      '<div style="text-align:center;margin-bottom:14px">' +
      '<div style="font-size:72px;font-weight:900;letter-spacing:-3px;line-height:1;background:var(--grad);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent">'+score+'</div>' +
      '<div class="readiness-label '+rl.cls+'" style="margin-top:4px">'+rl.l+'</div>' +
      '<div style="font-size:13px;color:var(--txt2);margin-top:10px;line-height:1.55;text-align:left">'+esc(ReadinessEngine.coachQuote(score, user.coachPersonality))+'</div>' +
      '</div>' +
      '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:4px">' +
      _miniMetric('😴', sleepV+'h', 'Sleep', sleepC) +
      _miniMetric('💪', sorenessV+'/10', 'Soreness', sorenessC) +
      _miniMetric('🧠', stressV+'/10', 'Stress', stressC) +
      _miniMetric('⚡', energyV+'/10', 'Energy', energyC) +
      '</div>' +
      (!loggedToday ?
        '<button class="readiness-log-btn" onclick="go(\'recovery\')">📊 Log today\'s recovery →</button>' :
        '<div style="margin-top:12px;text-align:center;font-size:12px;color:var(--txt3)">✅ Recovery logged today</div>'
      ) +
      '</div></div>';

    // ── 3. Today's workout card ──────────────────────────
    const exChips = (splitDay.exercises||[]).slice(0,4).map(function(e) {
      return '<span class="pill" style="margin:3px 4px 3px 0">'+esc(e)+'</span>';
    }).join('');
    const planHTML = '<div style="padding:0 16px 14px">' +
      '<div class="card card-grad-border" style="margin:0">' +
      '<div style="display:flex;align-items:center;gap:12px;margin-bottom:10px">' +
      '<div style="font-size:32px;animation:pulse 2s ease-in-out infinite">🏋️</div>' +
      '<div><div style="font-size:16px;font-weight:800;color:var(--txt)">'+esc(splitDay.n||'Rest Day')+'</div>' +
      '<div style="font-size:12px;color:var(--txt3);margin-top:2px">'+esc((splitDay.muscles||[]).join(', '))+'</div></div>' +
      '</div>' +
      (exChips ? '<div style="display:flex;flex-wrap:wrap;margin-bottom:14px">'+exChips+'</div>' : '') +
      '<div style="display:flex;gap:10px">' +
      '<button class="btn btn-primary" style="flex:1" onclick="go(\'workout\')">▶ Start Workout</button>' +
      '<button class="btn btn-secondary" style="width:auto;padding:16px 18px" onclick="showSubstitutes()">🔄</button>' +
      '</div></div></div>';

    // ── 4. Activity rings ────────────────────────────────
    const ringsHTML = sh('Activity') +
      '<div style="padding:0 16px">' +
      '<div class="rings-row" id="rings-row-dash">' +
      _animRing('ring-wkt', weekWkts.length, weekGoal2, '#00ff88', 'Workouts', weekWkts.length+'/'+weekGoal2) +
      _animRing('ring-cal', todayCalories2, calTarget2, 'var(--c1)', 'Calories', todayCalories2+'/'+calTarget2) +
      _animRing('ring-h2o', todayWaterMl, waterTarget2, 'var(--c2)', 'Water', todayWaterMl+'ml/'+(waterTarget2/1000).toFixed(1)+'L') +
      '</div></div>' +
      '<script>(function(){' +
      'var rings=[' +
      '{id:"ring-wkt",val:'+Math.min(weekWkts.length,weekGoal2)+',max:'+weekGoal2+',color:"#00ff88"},' +
      '{id:"ring-cal",val:'+Math.min(todayCalories2,calTarget2)+',max:'+calTarget2+'},' +
      '{id:"ring-h2o",val:'+Math.min(todayWaterMl,waterTarget2)+',max:'+waterTarget2+'}' +
      '];' +
      'var circ=188.5;' +
      'rings.forEach(function(ring){' +
      'var el=document.getElementById(ring.id+"-arc");' +
      'if(!el)return;' +
      'var start=Date.now(),dur=700,pct=ring.max>0?ring.val/ring.max:0,target=circ-(circ*Math.min(pct,1));' +
      'el.style.strokeDashoffset=circ;' +
      '(function tick(){' +
      'var t=Math.min((Date.now()-start)/dur,1),ease=1-Math.pow(1-t,3);' +
      'el.style.strokeDashoffset=circ+(target-circ)*ease;' +
      'if(t<1)requestAnimationFrame(tick);' +
      '})();' +
      '});' +
      '})();<\/script>';

    // ── 5. Stats row ─────────────────────────────────────
    const statsHTML = '<div class="stats-row">' +
      '<div class="stat stat-accent"><div class="stat-v">'+streak+'🔥</div><div class="stat-l">Streak</div></div>' +
      '<div class="stat"><div class="stat-v">'+prs.length+'</div><div class="stat-l">PRs</div></div>' +
      '<div class="stat"><div class="stat-v">'+(weekVol>1000?round2(weekVol/1000)+'t':weekVol+'kg')+'</div><div class="stat-l">Week Vol</div></div>' +
      '<div class="stat"><div class="stat-v">'+ws.length+'</div><div class="stat-l">Sessions</div></div>' +
      '</div>';

    // ── 6. AI Insights ───────────────────────────────────
    const _insightMeta = {
      recovery:   { color:'#7b5fff', emoji:'💤' },
      strength:   { color:'#00ff88', emoji:'💪' },
      nutrition:  { color:'#ff6b35', emoji:'🥗' },
      cardio:     { color:'#00d5ff', emoji:'🏃' },
      warning:    { color:'#ffaa00', emoji:'⚠️' },
      def:        { color:'var(--c1)', emoji:'✨' }
    };
    const insightHTML = sh('Daily Insights') +
      '<div style="padding:0 16px">' +
      insights.slice(0,3).map(function(ins) {
        const meta = _insightMeta[ins.type] || _insightMeta[ins.t] || _insightMeta.def;
        const col = ins.c || meta.color;
        const bg = col.startsWith('#') ?
          'rgba('+parseInt(col.slice(1,3),16)+','+parseInt(col.slice(3,5),16)+','+parseInt(col.slice(5,7),16)+',0.06)' :
          'rgba(0,213,255,0.06)';
        return '<div style="border-left:3px solid '+col+';background:'+bg+';padding:13px 14px;border-radius:0 12px 12px 0;margin-bottom:10px">' +
          '<div style="display:flex;align-items:center;gap:7px;margin-bottom:5px">' +
          '<span style="font-size:16px">'+meta.emoji+'</span>' +
          '<div style="font-size:12px;font-weight:700;color:'+col+';text-transform:uppercase;letter-spacing:0.07em">'+esc(ins.t)+'</div>' +
          '</div>' +
          '<div style="font-size:13px;color:var(--txt2);line-height:1.55">'+esc(ins.m)+'</div>' +
          '</div>';
      }).join('') +
      '</div>';

    // ── 7. Muscle recovery chips ─────────────────────────
    const muscleChips = muscles.slice(0,8).map(function(m) {
      return '<span class="mchip mchip-'+m.status+'">'+esc(m.name)+'</span>';
    }).join('');
    const muscleHTML = sh('Muscle Recovery') + '<div class="mchips-wrap">'+muscleChips+'</div>';

    // ── 8. Supplements due ───────────────────────────────
    let suppHTML = '';
    if (dueSupps.length) {
      suppHTML = sh('Due Soon', 'View all', 'go(\'nutrition\')') +
        dueSupps.slice(0,2).map(function(s) {
          return '<div class="supp-card due">' +
            '<div class="supp-icon">💊</div>' +
            '<div class="supp-info"><div class="supp-name">'+esc(s.name)+'</div><div class="supp-timing">'+esc(s.timing)+'</div></div>' +
            '<button class="supp-mark" onclick="SupplementEngine.markTaken(\''+s.id+'\');go(\'dashboard\')">Done</button></div>';
        }).join('');
    }

    // ── 9. Recent workouts ───────────────────────────────
    let recentHTML = '';
    if (ws.length) {
      recentHTML = sh('Recent Sessions', 'All', 'go(\'progress\')') +
        '<div style="padding:0 16px">' +
        ws.slice(-2).reverse().map(function(w) {
          return '<div class="card card-tap" onclick="go(\'progress\')" style="margin-bottom:10px">' +
            '<div class="row-between">' +
            '<div><div style="font-size:15px;font-weight:700;color:var(--txt)">'+esc(w.name||'Workout')+'</div>' +
            '<div style="font-size:12px;color:var(--txt3);margin-top:2px">'+fmtDate(w.date)+'</div></div>' +
            '<div style="text-align:right">' +
            '<div style="font-size:15px;font-weight:700;color:var(--c1)">'+(w.totalVol||0)+'kg</div>' +
            '<div style="font-size:11px;color:var(--txt3)">'+fmtMins(w.duration||0)+'</div>' +
            '</div></div></div>';
        }).join('') +
        '</div>';
    }

    // ── Monday weekly summary ────────────────────────────
    const isMonday = new Date().getDay() === 1;
    let weekSummaryHTML = '';
    if (isMonday && weekReport) {
      const vLabel = weekReport.thisVol > 1000 ? Math.round(weekReport.thisVol/100)/10+'t' : weekReport.thisVol+'kg';
      const chColor = weekReport.change > 0 ? '#30d158' : weekReport.change < 0 ? '#ff6b35' : 'var(--txt3)';
      const chLabel = weekReport.change !== 0 ? (weekReport.change>0?'↑':'↓')+Math.abs(weekReport.change)+'% vs last week' : 'Same volume as last week';
      weekSummaryHTML = sh('Weekly Review 📊', 'Full report', 'go(\'coach\')') +
        '<div class="card card-solid" style="margin:0 16px 14px">' +
        '<div style="font-size:12px;color:var(--txt3);margin-bottom:10px;text-transform:uppercase;letter-spacing:0.08em">Monday recap</div>' +
        '<div style="display:flex;flex-wrap:wrap;gap:16px">' +
        '<div style="flex:1;min-width:72px"><div style="font-size:20px;font-weight:900;color:var(--c1)">'+esc(vLabel)+'</div><div style="font-size:11px;color:var(--txt3)">Volume</div><div style="font-size:12px;color:'+chColor+'">'+esc(chLabel)+'</div></div>' +
        '<div style="flex:1;min-width:72px"><div style="font-size:20px;font-weight:900;color:var(--txt)">'+weekReport.weekWorkouts+'/'+weekReport.weeklyGoal+'</div><div style="font-size:11px;color:var(--txt3)">Sessions</div></div>' +
        (weekReport.mostImproved ? '<div style="flex:1;min-width:72px"><div style="font-size:16px;font-weight:800;color:#30d158">+'+weekReport.mostImproved.gain+'%</div><div style="font-size:11px;color:var(--txt3)">'+esc(weekReport.mostImproved.name)+' 1RM</div></div>' : '') +
        '</div></div>';
    }

    // ── 10. Explore grid ─────────────────────────────────
    const exploreHTML = sh('Explore') +
      '<div class="explore-grid">' +
      _eCard('💪', 'Workout', 'Log a session', 'workout') +
      _eCard('🫀', 'Body Map', 'Muscle visualiser', 'bodymap') +
      _eCard('📈', 'Progress', 'Charts & PRs', 'progress') +
      _eCard('💊', 'Nutrition', 'Stack & macros', 'nutrition') +
      _eCard('🏃', 'Recovery', 'Sleep & readiness', 'recovery') +
      _eCard('🤖', 'AI Coach', 'Insights & plans', 'coach') +
      '</div>';

    return demoBanner +
      topbarHTML +
      readinessHTML +
      planHTML +
      ringsHTML +
      statsHTML +
      insightHTML +
      muscleHTML +
      suppHTML +
      recentHTML +
      weekSummaryHTML +
      exploreHTML +
      '<div style="height:20px"></div>';

  } catch(e) {
    console.error('dashboard', e);
    return '<div style="padding:28px;color:var(--txt)">' +
      '<div style="font-size:48px;margin-bottom:16px">⚡</div>' +
      '<div style="font-size:22px;font-weight:800;margin-bottom:8px">FitnessOS</div>' +
      '<div style="color:var(--txt3);margin-bottom:24px">Ready to train.</div>' +
      '<button class="btn btn-primary" onclick="go(\'workout\')">Start Workout 💪</button>' +
      '</div>';
  }
});

function _miniMetric(icon, val, label, color) {
  return '<div style="background:rgba(255,255,255,0.04);border-radius:12px;padding:10px 6px;text-align:center">' +
    '<div style="font-size:18px;margin-bottom:4px">'+icon+'</div>' +
    '<div style="font-size:13px;font-weight:700;color:'+color+'">'+val+'</div>' +
    '<div style="font-size:10px;color:var(--txt3);margin-top:2px;text-transform:uppercase;letter-spacing:0.06em">'+esc(label)+'</div>' +
    '</div>';
}

function _animRing(id, val, max, color, label, sublabel) {
  const pct = max > 0 ? Math.min(Math.round((val / max) * 100), 100) : 0;
  return '<div class="ring-wrap">' +
    '<div class="ring-outer">' +
    '<svg width="80" height="80" viewBox="0 0 80 80" style="display:block">' +
    '<circle cx="40" cy="40" r="30" fill="none" stroke="'+color+'" stroke-width="7" stroke-opacity="0.15"/>' +
    '<circle id="'+id+'-arc" cx="40" cy="40" r="30" fill="none" stroke="'+color+'" stroke-width="7"' +
    ' stroke-dasharray="188.5" stroke-dashoffset="188.5" stroke-linecap="round"' +
    ' transform="rotate(-90 40 40)"/>' +
    '</svg>' +
    '<div class="ring-center">' +
    '<div style="font-size:12px;font-weight:700;color:var(--txt)">'+pct+'%</div>' +
    '</div></div>' +
    '<div style="font-size:10px;color:var(--txt3);text-align:center;margin-top:4px;line-height:1.3">'+esc(sublabel)+'</div>' +
    '<div style="font-size:9px;font-weight:700;color:'+color+';text-align:center;margin-top:2px;text-transform:uppercase;letter-spacing:0.06em">'+esc(label)+'</div>' +
    '</div>';
}

function _eCard(icon, title, sub, screen) {
  return '<button class="explore-card press" onclick="go(\''+screen+'\')">' +
    '<div class="explore-card-icon">'+icon+'</div>' +
    '<div class="explore-card-t">'+esc(title)+'</div>' +
    '<div class="explore-card-s">'+esc(sub)+'</div>' +
    '</button>';
}

const THEMES = ['carbon','stealth','forest','aurora','electric','sunset','midnight'];
function _nextTheme(current) {
  const idx = THEMES.indexOf(current);
  return THEMES[(idx+1) % THEMES.length];
}
window._nextTheme = _nextTheme;

window.showSubstitutes = function() {
  const day = SplitEngine.getSplitDay();
  const subs = (day.exercises||[]).slice(0,4).map(function(e) {
    const alts = SplitEngine.getSubstitutes(e, '');
    return '<div style="padding:12px 0;border-bottom:1px solid var(--border)">' +
      '<div style="font-size:13px;font-weight:700;color:var(--txt);margin-bottom:6px">'+esc(e)+'</div>' +
      (alts.length ? alts.map(function(a) { return '<div style="font-size:13px;color:var(--txt2);padding:3px 0">→ '+esc(a)+'</div>'; }).join('') :
        '<div style="font-size:12px;color:var(--txt3)">No substitutes available</div>') +
      '</div>';
  }).join('');
  modal('Exercise Alternatives', subs,
    '<button class="btn btn-secondary" onclick="closeModal()" style="margin-top:16px">Close</button>');
};
