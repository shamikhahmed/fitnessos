'use strict';
/* ── FitnessOS — Dashboard ── */

const THEMES = ['carbon','aurora','sunset','midnight','electric','stealth','forest','light'];
function _nextTheme(t) { const i = THEMES.indexOf(t); return THEMES[(i+1)%THEMES.length]; }

reg('dashboard', function() {
  try {
    const user = S.g('user') || {};
    const ws = S.g('workouts') || [];
    const prs = S.g('prs') || [];
    const score = ReadinessEngine.score();
    const rl = ReadinessEngine.label(score);
    const streak = StreakEngine.get();
    const weekWkts = StreakEngine.weekWorkouts();
    const insights = CoachEngine.insights();
    const splitDay = SplitEngine.getSplitDay();
    const muscles = MuscleEngine.status();
    const dueSupps = SupplementEngine.getDueNow();
    const name = (user.name || 'Athlete').split(' ')[0];
    const hr = new Date().getHours();
    const greeting = hr < 12 ? 'Good morning' : hr < 17 ? 'Good afternoon' : 'Good evening';
    const todayStr = new Date().toLocaleDateString('en-GB', { weekday:'long', day:'numeric', month:'long' });
    const isDark = (user.mode || 'dark') !== 'light';
    const modeIcon = isDark ? '🌙' : '☀️';
    const nextMode = isDark ? 'light' : 'dark';
    const personality = user.coachPersonality || 'maya';
    const coachMeta = {maya:{e:'🧪',n:'Maya'},alex:{e:'🔥',n:'Alex'},sam:{e:'⚡',n:'Sam'},zen:{e:'🧘',n:'Zen'},rex:{e:'💪',n:'Rex'}};
    const cm = coachMeta[personality] || coachMeta.maya;
    const isDemoMode = S.activeId() === 'demo';
    const scoreColor = score >= 80 ? 'var(--c3)' : score >= 60 ? 'var(--c1)' : score >= 40 ? 'var(--c5)' : 'var(--c4)';

    const demoBanner = isDemoMode ?
      '<div style="background:linear-gradient(135deg,rgba(123,95,255,0.15),rgba(0,213,255,0.08));border-bottom:1px solid rgba(123,95,255,0.2);padding:10px 16px;display:flex;align-items:center;justify-content:space-between">' +
      '<div style="font-size:13px;color:var(--c2);font-weight:600">🤖 Demo Mode</div>' +
      '<button onclick="go(\'profiles\')" style="font-size:12px;color:var(--c1);font-weight:600;background:none;border:none;cursor:pointer;touch-action:manipulation">Switch →</button>' +
      '</div>' : '';

    /* ── TOPBAR ── */
    const topbar = '<div class="topbar">' +
      '<div class="topbar-left" style="cursor:pointer;touch-action:manipulation" onclick="go(\'profiles\')">' +
      '<div style="display:flex;align-items:center;gap:10px">' +
      '<div style="width:36px;height:36px;border-radius:50%;background:var(--grad);display:flex;align-items:center;justify-content:center;font-size:18px">' +
      (S.profiles().find(function(p){return p.id===S.activeId();})||{avatar:'💪'}).avatar +
      '</div>' +
      '<div><div style="font-size:13px;font-weight:700;color:var(--txt)">'+esc(greeting)+', '+esc(name)+'</div>' +
      '<div style="font-size:11px;color:var(--txt3)">'+esc(todayStr)+'</div></div>' +
      '</div></div>' +
      '<div class="topbar-right">' +
      '<button class="topbar-icon press" onclick="go(\'briefing\')" aria-label="Briefing">📋</button>' +
      '<button class="topbar-icon press" onclick="applyMode(\''+nextMode+'\');go(\'dashboard\')" aria-label="Mode">'+modeIcon+'</button>' +
      '<button class="topbar-icon press" onclick="applyTheme(_nextTheme(S.g(\'user.theme\')||\'carbon\'));go(\'dashboard\')">🎨</button>' +
      '<button class="topbar-icon press" onclick="go(\'settings\')">⚙️</button>' +
      '</div></div>';

    /* ── READINESS HERO ── */
    const hero = '<div style="margin:0 16px 14px;border-radius:24px;background:var(--bg3);border:1px solid var(--border);overflow:hidden;position:relative;padding:20px">' +
      '<div style="position:absolute;top:-40px;right:-40px;width:160px;height:160px;border-radius:50%;background:radial-gradient(circle,'+scoreColor.replace(')',',0.15)')+',transparent);pointer-events:none"></div>' +
      '<div style="display:flex;align-items:center;justify-content:space-between">' +
      '<div>' +
      '<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:var(--txt3);margin-bottom:4px">Readiness Score</div>' +
      '<div style="font-size:64px;font-weight:900;line-height:1;color:'+scoreColor+';letter-spacing:-3px">'+score+'</div>' +
      '<div style="font-size:13px;font-weight:600;color:'+scoreColor+';margin-top:4px">'+rl.l+'</div>' +
      '</div>' +
      '<div style="text-align:right">' +
      '<div style="font-size:32px;margin-bottom:4px">'+cm.e+'</div>' +
      '<div style="font-size:12px;font-weight:600;color:var(--txt)">'+esc(cm.n)+'</div>' +
      '<div style="font-size:11px;color:var(--txt3)">Your Coach</div>' +
      '</div></div>' +
      '<div style="margin-top:14px;height:4px;background:var(--bg4);border-radius:2px;overflow:hidden">' +
      '<div style="width:'+score+'%;height:100%;background:'+scoreColor+';border-radius:2px;transition:width 0.8s ease"></div>' +
      '</div></div>';

    /* ── DAILY DECISION MINI-CARD ── */
    const dd = typeof DailyDecision !== 'undefined' ? DailyDecision.decide() : null;
    const dailyDecisionCard = dd ? '<div onclick="go(\'recovery-debt\')" style="margin:0 16px 14px;background:var(--bg3);border:1px solid var(--border);border-radius:16px;padding:14px 16px;cursor:pointer;touch-action:manipulation;display:flex;align-items:center;gap:14px">' +
      '<div style="font-size:32px">' + dd.emoji + '</div>' +
      '<div style="flex:1">' +
      '<div style="font-size:13px;font-weight:700;color:' + dd.color + '">' + esc(dd.title) + '</div>' +
      '<div style="font-size:11px;color:var(--txt3);margin-top:2px">' + esc(dd.actions[0]) + '</div>' +
      '</div>' +
      '<div style="font-size:12px;color:var(--txt3)">›</div>' +
      '</div>' : '';

    /* ── TODAY'S WORKOUT ── */
    const todayWorkout = '<div style="margin:0 16px 14px;border-radius:20px;background:var(--grad);padding:18px 20px;position:relative;overflow:hidden">' +
      '<div style="position:absolute;top:-20px;right:-20px;width:100px;height:100px;border-radius:50%;background:rgba(255,255,255,0.06)"></div>' +
      '<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:rgba(255,255,255,0.7);margin-bottom:6px">Today\'s Session</div>' +
      '<div style="font-size:18px;font-weight:800;color:#fff;margin-bottom:4px">'+esc(splitDay.n||'Rest & Recover')+'</div>' +
      '<div style="font-size:12px;color:rgba(255,255,255,0.7);margin-bottom:14px">'+esc((splitDay.muscles||[]).join(' · '))+'</div>' +
      '<div style="display:flex;gap:10px">' +
      '<button onclick="startWorkout&&startWorkout()" style="flex:1;padding:12px;border-radius:12px;background:rgba(255,255,255,0.2);border:1.5px solid rgba(255,255,255,0.3);color:#fff;font-size:14px;font-weight:700;cursor:pointer;touch-action:manipulation">▶ Start</button>' +
      '<button onclick="startQuickWorkout&&startQuickWorkout()" style="padding:12px 16px;border-radius:12px;background:rgba(255,255,255,0.1);border:1.5px solid rgba(255,255,255,0.2);color:#fff;font-size:14px;font-weight:700;cursor:pointer;touch-action:manipulation">⚡</button>' +
      '</div></div>';

    /* ── STATS ROW ── */
    function statCard(val, label, icon, color) {
      return '<div style="flex:1;background:var(--bg3);border:1px solid var(--border);border-radius:16px;padding:14px;text-align:center">' +
        '<div style="font-size:10px;color:var(--txt3);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:6px">'+icon+'</div>' +
        '<div style="font-size:26px;font-weight:900;color:'+(color||'var(--c1)')+';line-height:1">'+val+'</div>' +
        '<div style="font-size:10px;color:var(--txt3);margin-top:4px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em">'+label+'</div>' +
        '</div>';
    }
    const statsRow = '<div style="display:flex;gap:10px;padding:0 16px;margin-bottom:14px">' +
      statCard(streak, 'Streak', '🔥', 'var(--c5)') +
      statCard(weekWkts.length + '/' + (user.weeklyGoal||4), 'This Week', '📅', 'var(--c1)') +
      statCard(prs.length, 'Total PRs', '🏆', 'var(--c3)') +
      '</div>';

    /* ── MUSCLE RECOVERY CHIPS ── */
    const topMuscles = muscles.slice(0,6);
    const muscleChips = topMuscles.length ? '<div style="padding:0 16px;margin-bottom:14px">' +
      '<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:var(--txt3);margin-bottom:10px">Muscle Recovery</div>' +
      '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">' +
      topMuscles.map(function(m) {
        const c = m.status === 'fresh' ? 'var(--c3)' : m.status === 'recovering' ? 'var(--c5)' : 'var(--c4)';
        return '<div onclick="go(\'bodymap\')" style="background:var(--bg3);border:1px solid '+c+';border-radius:12px;padding:10px 8px;text-align:center;cursor:pointer;touch-action:manipulation">' +
          '<div style="font-size:16px;font-weight:800;color:'+c+'">'+m.pct+'%</div>' +
          '<div style="font-size:10px;color:var(--txt3);margin-top:2px;font-weight:600">'+esc(m.name)+'</div>' +
          '</div>';
      }).join('') + '</div></div>' : '';

    /* ── AI INSIGHT ── */
    const topInsight = insights[0];
    const insightCard = topInsight ? '<div style="margin:0 16px 14px;border-left:3px solid '+(topInsight.c||'var(--c1)')+';background:var(--bg3);border-radius:0 14px 14px 0;padding:14px 16px">' +
      '<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:'+(topInsight.c||'var(--c1)')+';margin-bottom:4px">'+esc(topInsight.t||'AI Insight')+'</div>' +
      '<div style="font-size:13px;color:var(--txt2);line-height:1.55">'+esc(topInsight.m||'')+'</div>' +
      '</div>' : '';

    /* ── DUE SUPPLEMENTS ── */
    const suppRow = dueSupps.length ? '<div style="padding:0 16px;margin-bottom:14px">' +
      '<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:var(--txt3);margin-bottom:8px">Due Now 💊</div>' +
      dueSupps.slice(0,2).map(function(s) {
        return '<div class="supp-card due" style="margin-bottom:8px">' +
          '<div class="supp-icon">💊</div>' +
          '<div class="supp-info"><div class="supp-name">'+esc(s.name)+'</div><div class="supp-timing">'+esc(s.timing)+'</div></div>' +
          '<button class="supp-mark" onclick="SupplementEngine.markTaken(\''+s.id+'\');go(\'dashboard\')">Done</button>' +
          '</div>';
      }).join('') + '</div>' : '';

    /* ── LAST WORKOUT ── */
    const lastWkt = ws[ws.length-1];
    const lastWktCard = lastWkt ? '<div style="margin:0 16px 14px">' +
      '<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:var(--txt3);margin-bottom:8px">Last Session</div>' +
      '<div onclick="go(\'progress\')" style="background:var(--bg3);border:1px solid var(--border);border-radius:16px;padding:14px 16px;cursor:pointer;touch-action:manipulation;display:flex;align-items:center;justify-content:space-between">' +
      '<div>' +
      '<div style="font-size:14px;font-weight:700;color:var(--txt);margin-bottom:2px">'+esc(lastWkt.name||'Workout')+'</div>' +
      '<div style="font-size:12px;color:var(--txt3)">'+esc(lastWkt.date||'')+(lastWkt.duration?' · '+lastWkt.duration+'min':'')+(lastWkt.totalVol?' · '+Math.round(lastWkt.totalVol)+'kg vol':'')+'</div>' +
      '</div>' +
      '<div style="color:var(--txt3);font-size:18px">›</div>' +
      '</div></div>' : '';

    /* ── WEEKLY VOLUME CHART ── */
    const ws7 = S.g('workouts') || [];
    const days7 = Array.from({length:7}, function(_,i) {
      const d = new Date(); d.setDate(d.getDate() - (6-i));
      return d.toISOString().slice(0,10);
    });
    const vols = days7.map(function(d) {
      const wkts = ws7.filter(function(x) { return (x.date||'').slice(0,10) === d; });
      return wkts.reduce(function(a,x) { return a + (x.totalVol||0); }, 0);
    });
    const maxVol = Math.max.apply(null, vols.concat([1]));
    const dayLabels = ['M','T','W','T','F','S','S'];
    const todayIdx = (new Date().getDay() + 6) % 7;
    const weeklyVolumeChart = '<div style="margin:0 16px 14px;background:var(--bg3);border:1px solid var(--border);border-radius:20px;padding:16px">' +
      '<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:var(--txt3);margin-bottom:12px">Weekly Volume</div>' +
      '<div style="display:flex;align-items:flex-end;gap:6px;height:60px">' +
      vols.map(function(v,i) {
        const h = Math.max(4, Math.round((v/maxVol)*56));
        const isToday = i === todayIdx;
        const hasWkt = v > 0;
        return '<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px">' +
          '<div style="width:100%;height:'+h+'px;background:'+(hasWkt?'var(--c1)':'var(--bg4)')+';border-radius:4px 4px 0 0;transition:height 0.5s ease;opacity:'+(isToday?'1':'0.7')+'"'+(isToday?' title="Today"':'')+' ></div>' +
          '<div style="font-size:9px;color:'+(isToday?'var(--c1)':'var(--txt3)')+';font-weight:'+(isToday?'800':'500')+'">'+dayLabels[i]+'</div>' +
          '</div>';
      }).join('') +
      '</div>' +
      '<div style="margin-top:10px;font-size:12px;color:var(--txt3)">Total: <span style="color:var(--txt);font-weight:700">'+Math.round(vols.reduce(function(a,v){return a+v;},0))+'kg</span> this week</div>' +
      '</div>';

    /* ── GOAL PROGRESS BAR ── */
    const goalBar = (function() {
      const w = user.weight, gw = user.goalWeight;
      if (!w || !gw || Math.abs(w-gw) < 0.5) return '';
      const startW = Math.max(w, gw) + 5;
      const pct = Math.min(100, Math.max(0, Math.round(((startW-w)/(startW-gw))*100)));
      const losing = gw < w;
      return '<div style="margin:0 16px 14px;padding:12px 16px;background:var(--bg3);border:1px solid var(--border);border-radius:16px">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">' +
        '<div style="font-size:11px;font-weight:700;color:var(--txt3);text-transform:uppercase;letter-spacing:0.08em">Goal Progress</div>' +
        '<div style="font-size:12px;color:var(--txt2)">'+w+'kg → '+gw+'kg</div>' +
        '</div>' +
        '<div style="height:6px;background:var(--bg4);border-radius:3px;overflow:hidden">' +
        '<div style="width:'+pct+'%;height:100%;background:var(--grad);border-radius:3px;transition:width 0.8s ease"></div>' +
        '</div>' +
        '<div style="font-size:11px;color:var(--txt3);margin-top:6px">'+Math.abs(Math.round((w-gw)*10)/10)+'kg to go · '+(losing?'Fat loss':'Muscle gain')+' mode</div>' +
        '</div>';
    })();

    /* ── QUICK ACTIONS ── */
    const quickActions = '<div style="display:flex;gap:8px;padding:0 16px;margin-bottom:14px">' +
      '<button onclick="logWater&&logWater((S.g(\'water\')||[]).filter(function(w){return w.date===today();}).length+1);go(\'dashboard\')" style="flex:1;padding:12px 8px;border-radius:14px;background:var(--bg3);border:1px solid var(--border);color:var(--txt);font-size:12px;font-weight:700;cursor:pointer;touch-action:manipulation;text-align:center">💧<br><span style="font-size:10px;color:var(--txt3);font-weight:500">+Water</span></button>' +
      '<button onclick="showQuickWeight&&showQuickWeight()" style="flex:1;padding:12px 8px;border-radius:14px;background:var(--bg3);border:1px solid var(--border);color:var(--txt);font-size:12px;font-weight:700;cursor:pointer;touch-action:manipulation;text-align:center">⚖️<br><span style="font-size:10px;color:var(--txt3);font-weight:500">Weight</span></button>' +
      '<button onclick="go(\'recovery\')" style="flex:1;padding:12px 8px;border-radius:14px;background:var(--bg3);border:1px solid var(--border);color:var(--txt);font-size:12px;font-weight:700;cursor:pointer;touch-action:manipulation;text-align:center">❤️<br><span style="font-size:10px;color:var(--txt3);font-weight:500">Recovery</span></button>' +
      '<button onclick="go(\'briefing\')" style="flex:1;padding:12px 8px;border-radius:14px;background:var(--bg3);border:1px solid var(--border);color:var(--txt);font-size:12px;font-weight:700;cursor:pointer;touch-action:manipulation;text-align:center">📋<br><span style="font-size:10px;color:var(--txt3);font-weight:500">Briefing</span></button>' +
      '</div>';

    /* ── EXPLORE GRID ── */
    function eCard(icon, title, sub, screen) {
      return '<div onclick="go(\''+screen+'\')" style="background:var(--bg3);border:1px solid var(--border);border-radius:16px;padding:16px;cursor:pointer;touch-action:manipulation;position:relative;overflow:hidden">' +
        '<div style="position:absolute;bottom:0;left:0;right:0;height:3px;background:var(--grad)"></div>' +
        '<div style="font-size:28px;margin-bottom:8px">'+icon+'</div>' +
        '<div style="font-size:13px;font-weight:700;color:var(--txt);margin-bottom:2px">'+title+'</div>' +
        '<div style="font-size:11px;color:var(--txt3)">'+sub+'</div>' +
        '</div>';
    }
    const exploreGrid = '<div style="padding:0 16px;margin-bottom:14px">' +
      '<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:var(--txt3);margin-bottom:10px">Explore</div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">' +
      eCard('❤️','Cardio','6 protocols','cardio') +
      eCard('📈','Progress','Charts & PRs','progress') +
      eCard('🫀','Body Map','Recovery & stats','bodymap') +
      eCard('💊','Nutrition','Macros & supps','nutrition') +
      eCard('🩹','Rehab Hub','Injury protocols','rehab') +
      eCard('💪','Muscle Atlas','80+ muscles','anatomy') +
      eCard('🤸','Skills','Calisthenics progressions','calisthenics') +
      '</div></div>';

    return demoBanner + topbar + hero + dailyDecisionCard + todayWorkout + statsRow +
      goalBar + quickActions + weeklyVolumeChart + muscleChips + insightCard + suppRow + lastWktCard + exploreGrid +
      '<div style="height:20px"></div>';

  } catch(e) {
    console.error('dashboard', e);
    return '<div style="padding:28px;color:var(--txt)">Loading...</div>';
  }
});

window._nextTheme = _nextTheme;
window._eCard = function(i,t,s,sc){ return ''; };

window.showQuickWeight = function() {
  const user = S.g('user') || {};
  modal('⚖️ Log Weight',
    '<div class="field-wrap"><label class="field-label">Weight ('+(user.units==='imperial'?'lbs':'kg')+')</label>' +
    '<input id="qw-val" class="field" type="number" step="0.1" placeholder="'+(user.weight||70)+'" style="font-size:24px;text-align:center;font-weight:800"></div>',
    '<button class="btn btn-primary" onclick="saveQuickWeight()">Save</button>'
  );
};
window.saveQuickWeight = function() {
  const val = parseFloat(document.getElementById('qw-val')?.value);
  if (!val || val < 20 || val > 300) { toast('Enter a valid weight', 'warn'); return; }
  const user = S.g('user') || {};
  S.set('user', {...user, weight: val});
  S.push('bodyStats', { weight: val, date: today(), time: isoNow() });
  closeModal();
  toast('Weight logged: '+val+(user.units==='imperial'?'lbs':'kg'), 'ok');
  go('dashboard');
};
