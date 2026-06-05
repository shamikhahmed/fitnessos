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
    const streak = StreakEngine.get();
    const weekWkts = StreakEngine.weekWorkouts();
    const splitDay = SplitEngine.getSplitDay();
    const muscles = MuscleEngine.status();
    const name = (user.name || 'Athlete').split(' ')[0];
    const hr = new Date().getHours();
    const greeting = hr < 12 ? 'Good morning' : hr < 17 ? 'Good afternoon' : 'Good evening';
    const todayStr = new Date().toLocaleDateString('en-GB', { weekday:'long', day:'numeric', month:'long' });
    const isDemoMode = S.activeId() === 'demo';
    const scoreColor = score >= 80 ? 'var(--c3)' : score >= 60 ? 'var(--c1)' : score >= 40 ? 'var(--c5)' : 'var(--c4)';

    /* ── DEMO BANNER ── */
    const demoBanner = isDemoMode ?
      '<div style="background:linear-gradient(135deg,rgba(123,95,255,0.15),rgba(0,213,255,0.08));border-bottom:1px solid rgba(123,95,255,0.2);padding:10px 16px;display:flex;align-items:center;justify-content:space-between">' +
      '<div style="font-size:13px;color:var(--c2);font-weight:600">🤖 Demo Mode</div>' +
      '<button onclick="go(\'profiles\')" style="font-size:12px;color:var(--c1);font-weight:600;background:none;border:none;cursor:pointer;touch-action:manipulation">Switch →</button>' +
      '</div>' : '';

    /* ── TOPBAR ── */
    const avatarLetter = (user.name || 'A').charAt(0).toUpperCase();
    const topbar = '<div class="topbar">' +
      '<div class="topbar-left">' +
      '<div><div style="font-size:13px;font-weight:700;color:var(--txt)">' + esc(greeting) + ', ' + esc(name) + '</div>' +
      '<div style="font-size:11px;color:var(--txt3)">' + esc(todayStr) + '</div></div>' +
      '</div>' +
      '<div class="topbar-right">' +
      '<button class="topbar-icon press" onclick="go(\'hub\')" aria-label="Explore">🔍</button>' +
      '<div onclick="go(\'profiles\')" style="width:32px;height:32px;border-radius:50%;background:var(--grad);display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:800;color:#fff;cursor:pointer;touch-action:manipulation;flex-shrink:0">' + avatarLetter + '</div>' +
      '</div></div>';

    /* ── HERO CARD ── */
    const dd = typeof DailyDecision !== 'undefined' ? DailyDecision.decide() : null;
    const debtVal = (function() {
      try { return typeof RecoveryDebtEngine !== 'undefined' ? RecoveryDebtEngine.getDebt() : 0; } catch(e) { return 0; }
    })();
    const heroGrad = (function() {
      if (!dd) return 'linear-gradient(135deg,rgba(123,95,255,0.15),rgba(0,213,255,0.08))';
      const t = (dd.type || dd.title || '').toLowerCase();
      if (t.includes('rest') || t.includes('light') || t.includes('recover')) {
        return 'linear-gradient(135deg,rgba(255,69,58,0.12),rgba(255,159,10,0.06))';
      } else if (t.includes('deload') || t.includes('easy')) {
        return 'linear-gradient(135deg,rgba(245,200,66,0.12),rgba(175,82,222,0.06))';
      }
      return 'linear-gradient(135deg,rgba(123,95,255,0.15),rgba(0,213,255,0.08))';
    })();
    const radius = 22;
    const circ = 2 * Math.PI * radius;
    const arcLen = (score / 100) * circ;
    const scoreArc = '<svg width="52" height="52" viewBox="0 0 52 52" style="flex-shrink:0">' +
      '<circle cx="26" cy="26" r="' + radius + '" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="4"/>' +
      '<circle cx="26" cy="26" r="' + radius + '" fill="none" stroke="' + scoreColor + '" stroke-width="4" stroke-linecap="round" stroke-dasharray="' + arcLen.toFixed(1) + ' ' + circ.toFixed(1) + '" transform="rotate(-90 26 26)"/>' +
      '<text x="26" y="30" text-anchor="middle" font-size="12" font-weight="800" fill="' + scoreColor + '">' + score + '</text>' +
      '</svg>';
    const heroTap = (dd && (dd.type || dd.title || '').toLowerCase().match(/rest|recover|light/)) ? 'recovery-debt' : 'body-intelligence';
    const heroCard = '<div onclick="go(\'' + heroTap + '\')" style="margin:0 16px 14px;border-radius:24px;background:' + heroGrad + ';border:1px solid var(--border);padding:18px 20px;cursor:pointer;touch-action:manipulation">' +
      '<div style="display:flex;align-items:flex-start;gap:12px;margin-bottom:12px">' +
      '<div style="font-size:48px;line-height:1;flex-shrink:0">' + (dd ? dd.emoji : '💪') + '</div>' +
      '<div style="flex:1;min-width:0">' +
      '<div style="font-size:20px;font-weight:800;color:var(--txt);line-height:1.2">' + esc(dd ? dd.title : 'Ready to Train') + '</div>' +
      '<div style="font-size:12px;color:var(--txt3);margin-top:4px;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical">' + esc(dd ? (dd.reason || (dd.actions && dd.actions[0]) || '') : 'Tap to see your recommendation') + '</div>' +
      '</div>' +
      scoreArc +
      '</div>' +
      '<div style="display:flex;gap:8px">' +
      '<div style="flex:1;background:rgba(255,255,255,0.06);border-radius:10px;padding:8px;text-align:center">' +
      '<div style="font-size:13px;font-weight:800;color:' + scoreColor + '">' + score + '/100</div>' +
      '<div style="font-size:9px;color:var(--txt3);font-weight:600;text-transform:uppercase;letter-spacing:0.06em;margin-top:2px">Readiness</div>' +
      '</div>' +
      '<div style="flex:1;background:rgba(255,255,255,0.06);border-radius:10px;padding:8px;text-align:center">' +
      '<div style="font-size:13px;font-weight:800;color:var(--c4)">' + debtVal + '</div>' +
      '<div style="font-size:9px;color:var(--txt3);font-weight:600;text-transform:uppercase;letter-spacing:0.06em;margin-top:2px">Debt</div>' +
      '</div>' +
      '<div style="flex:1;background:rgba(255,255,255,0.06);border-radius:10px;padding:8px;text-align:center">' +
      '<div style="font-size:13px;font-weight:800;color:var(--c5)">' + streak + ' 🔥</div>' +
      '<div style="font-size:9px;color:var(--txt3);font-weight:600;text-transform:uppercase;letter-spacing:0.06em;margin-top:2px">Streak</div>' +
      '</div>' +
      '</div>' +
      '</div>';

    /* ── QUICK ACTIONS ── */
    const quickActions = '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;padding:0 16px;margin-bottom:14px">' +
      '<button onclick="go(\'workout\')" class="press" style="background:var(--bg3);border:1px solid var(--border);border-radius:16px;padding:14px 8px;text-align:center;cursor:pointer;touch-action:manipulation;display:flex;flex-direction:column;align-items:center;gap:6px;width:100%">' +
      '<span style="font-size:26px">💪</span>' +
      '<span style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:var(--txt3)">Start</span>' +
      '</button>' +
      '<button onclick="go(\'recovery\')" class="press" style="background:var(--bg3);border:1px solid var(--border);border-radius:16px;padding:14px 8px;text-align:center;cursor:pointer;touch-action:manipulation;display:flex;flex-direction:column;align-items:center;gap:6px;width:100%">' +
      '<span style="font-size:26px">📊</span>' +
      '<span style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:var(--txt3)">Check In</span>' +
      '</button>' +
      '<button onclick="go(\'assistant\')" class="press" style="background:var(--bg3);border:1px solid var(--border);border-radius:16px;padding:14px 8px;text-align:center;cursor:pointer;touch-action:manipulation;display:flex;flex-direction:column;align-items:center;gap:6px;width:100%">' +
      '<span style="font-size:26px">🤖</span>' +
      '<span style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:var(--txt3)">Ask AI</span>' +
      '</button>' +
      '<button onclick="go(\'search\')" class="press" style="background:var(--bg3);border:1px solid var(--border);border-radius:16px;padding:14px 8px;text-align:center;cursor:pointer;touch-action:manipulation;display:flex;flex-direction:column;align-items:center;gap:6px;width:100%">' +
      '<span style="font-size:26px">🔍</span>' +
      '<span style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:var(--txt3)">Search</span>' +
      '</button>' +
      '</div>';

    /* ── TODAY'S WORKOUT ── */
    const todayWorkout = '<div style="margin:0 16px 14px;border-radius:20px;background:var(--grad);padding:16px 18px;position:relative;overflow:hidden">' +
      '<div style="position:absolute;top:-20px;right:-20px;width:100px;height:100px;border-radius:50%;background:rgba(255,255,255,0.06)"></div>' +
      '<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:rgba(255,255,255,0.7);margin-bottom:4px">Today\'s Session</div>' +
      '<div style="font-size:18px;font-weight:800;color:#fff;margin-bottom:2px">' + esc(splitDay.n || 'Rest & Recover') + '</div>' +
      '<div style="font-size:12px;color:rgba(255,255,255,0.7);margin-bottom:12px">' +
      esc((splitDay.muscles || []).slice(0, 3).join(' · ')) +
      (splitDay.exercises && splitDay.exercises.length ? ' · ' + splitDay.exercises.length + ' exercises' : '') +
      '</div>' +
      '<button onclick="startWorkout&&startWorkout()" style="width:100%;padding:11px;border-radius:12px;background:rgba(255,255,255,0.2);border:1.5px solid rgba(255,255,255,0.3);color:#fff;font-size:14px;font-weight:700;cursor:pointer;touch-action:manipulation">▶ Start Workout</button>' +
      '</div>';

    /* ── RECOVERY SNAPSHOT ── */
    const debtColor = debtVal >= 70 ? 'var(--c4)' : debtVal >= 40 ? 'var(--c5)' : 'var(--c3)';
    const readinessLabel = score >= 80 ? 'Peak' : score >= 60 ? 'Good' : score >= 40 ? 'Fair' : 'Low';
    const recoverySnapshot = '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;padding:0 16px;margin-bottom:14px">' +
      '<div onclick="go(\'recovery-debt\')" style="background:var(--bg3);border:1px solid var(--border);border-radius:16px;padding:14px;text-align:center;cursor:pointer;touch-action:manipulation">' +
      '<div style="width:8px;height:8px;border-radius:50%;background:' + debtColor + ';margin:0 auto 6px"></div>' +
      '<div style="font-size:26px;font-weight:900;color:' + debtColor + ';line-height:1">' + debtVal + '</div>' +
      '<div style="font-size:10px;color:var(--txt3);margin-top:4px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em">Rec. Debt</div>' +
      '</div>' +
      '<div onclick="go(\'body-intelligence\')" style="background:var(--bg3);border:1px solid var(--border);border-radius:16px;padding:14px;text-align:center;cursor:pointer;touch-action:manipulation">' +
      '<div style="width:8px;height:8px;border-radius:50%;background:' + scoreColor + ';margin:0 auto 6px"></div>' +
      '<div style="font-size:26px;font-weight:900;color:' + scoreColor + ';line-height:1">' + score + '</div>' +
      '<div style="font-size:10px;color:var(--txt3);margin-top:4px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em">' + readinessLabel + '</div>' +
      '</div>' +
      '<div style="background:var(--bg3);border:1px solid var(--border);border-radius:16px;padding:14px;text-align:center">' +
      '<div style="font-size:16px;margin-bottom:2px">🔥</div>' +
      '<div style="font-size:26px;font-weight:900;color:var(--c5);line-height:1">' + streak + '</div>' +
      '<div style="font-size:10px;color:var(--txt3);margin-top:4px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em">Streak</div>' +
      '</div>' +
      '</div>';

    /* ── MUSCLE RECOVERY MINI ── */
    const trainedMuscles = muscles
      .filter(function(m) { return m.hoursSince !== null && m.hoursSince !== undefined; })
      .sort(function(a, b) { return a.pct - b.pct; })
      .slice(0, 5);
    const muscleRecoveryMini = trainedMuscles.length ?
      '<div style="margin-bottom:14px">' +
      '<div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:var(--txt3);padding:0 16px;margin-bottom:8px">Muscle Recovery</div>' +
      '<div style="display:flex;gap:8px;padding:0 16px;overflow-x:auto;scrollbar-width:none;-webkit-overflow-scrolling:touch">' +
      trainedMuscles.map(function(m) {
        const c = m.pct >= 80 ? 'var(--c3)' : m.pct >= 50 ? 'var(--c5)' : 'var(--c4)';
        return '<div onclick="go(\'body-intelligence\')" style="flex-shrink:0;background:var(--bg3);border:1px solid var(--border);border-radius:12px;padding:10px 12px;cursor:pointer;touch-action:manipulation;min-width:84px">' +
          '<div style="display:flex;align-items:center;gap:6px;margin-bottom:6px">' +
          '<div style="width:8px;height:8px;border-radius:50%;background:' + c + ';flex-shrink:0"></div>' +
          '<div style="font-size:11px;color:var(--txt);font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:58px">' + esc(m.name) + '</div>' +
          '</div>' +
          '<div style="height:3px;background:var(--bg4);border-radius:2px;overflow:hidden;margin-bottom:4px">' +
          '<div style="width:' + m.pct + '%;height:3px;background:' + c + ';border-radius:2px"></div>' +
          '</div>' +
          '<div style="font-size:11px;font-weight:700;color:' + c + '">' + m.pct + '%</div>' +
          '</div>';
      }).join('') +
      '</div></div>' : '';

    /* ── ACTIVE QUEST CARD ── */
    if (typeof AchievementEngine2 !== 'undefined') { try { AchievementEngine2.checkAll(); } catch(e) {} }
    const activeQuestCard = (function() {
      try {
        const noCTA = '<div onclick="go(\'quests\')" style="margin:0 16px 14px;background:var(--bg3);border:1px solid var(--border);border-radius:16px;padding:12px 16px;cursor:pointer;touch-action:manipulation;display:flex;align-items:center;justify-content:space-between">' +
          '<div style="font-size:13px;color:var(--txt2)">⚔️ Start a Quest</div>' +
          '<div style="font-size:12px;color:var(--txt3)">→</div></div>';
        if (typeof QuestEngine === 'undefined') return noCTA;
        QuestEngine.updateProgress();
        const active = QuestEngine.getActive();
        if (!active.length) return noCTA;
        const q = active[0];
        const pct = QuestEngine.questProgress(q);
        return '<div onclick="go(\'quests\')" style="margin:0 16px 14px;background:linear-gradient(135deg,rgba(123,95,255,0.1),rgba(0,213,255,0.06));border:1px solid rgba(123,95,255,0.25);border-radius:16px;padding:14px 16px;cursor:pointer;touch-action:manipulation;display:flex;align-items:center;gap:12px">' +
          '<div style="font-size:28px">' + q.icon + '</div>' +
          '<div style="flex:1">' +
          '<div style="font-size:13px;font-weight:700;color:var(--txt)">' + esc(q.title) + '</div>' +
          '<div style="width:100%;height:4px;background:rgba(255,255,255,0.06);border-radius:2px;margin-top:6px"><div style="width:' + pct + '%;height:4px;border-radius:2px;background:var(--c1)"></div></div>' +
          '<div style="font-size:10px;color:var(--txt3);margin-top:3px">' + pct + '% complete</div>' +
          '</div><div style="font-size:12px;color:var(--txt3)">›</div></div>';
      } catch(e) { return ''; }
    })();

    /* ── PROGRESS SNAPSHOT ── */
    const now = new Date();
    const thisMonthPRs = prs.filter(function(p) {
      const d = new Date(p.date || 0);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    }).length;
    const weekVol = ws.filter(function(w) {
      return (now - new Date(w.date || 0)) < 7 * 24 * 60 * 60 * 1000;
    }).reduce(function(a, w) { return a + (w.totalVol || 0); }, 0);
    const progressSnapshot = '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;padding:0 16px;margin-bottom:14px">' +
      '<div onclick="go(\'progress\')" style="background:var(--bg3);border:1px solid var(--border);border-radius:16px;padding:14px;text-align:center;cursor:pointer;touch-action:manipulation">' +
      '<div style="font-size:22px;font-weight:900;color:var(--c1);line-height:1">' + weekWkts.length + '/' + (user.weeklyGoal || 4) + '</div>' +
      '<div style="font-size:9px;color:var(--txt3);margin-top:4px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em">Sessions</div>' +
      '</div>' +
      '<div onclick="go(\'progress\')" style="background:var(--bg3);border:1px solid var(--border);border-radius:16px;padding:14px;text-align:center;cursor:pointer;touch-action:manipulation">' +
      '<div style="font-size:22px;font-weight:900;color:var(--c2);line-height:1">' + Math.round(weekVol) + '</div>' +
      '<div style="font-size:9px;color:var(--txt3);margin-top:4px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em">Vol (kg)</div>' +
      '</div>' +
      '<div onclick="go(\'progress\')" style="background:var(--bg3);border:1px solid var(--border);border-radius:16px;padding:14px;text-align:center;cursor:pointer;touch-action:manipulation">' +
      '<div style="font-size:22px;font-weight:900;color:var(--c3);line-height:1">' + thisMonthPRs + '</div>' +
      '<div style="font-size:9px;color:var(--txt3);margin-top:4px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em">PRs / mo</div>' +
      '</div>' +
      '</div>';

    /* ── LAST WORKOUT ── */
    const lastWkt = ws[ws.length - 1];
    const lastWktCard = lastWkt ?
      '<div style="margin:0 16px 14px">' +
      '<div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:var(--txt3);margin-bottom:8px">Last Session</div>' +
      '<div onclick="go(\'progress\')" style="background:var(--bg3);border:1px solid var(--border);border-radius:16px;padding:14px 16px;cursor:pointer;touch-action:manipulation;display:flex;align-items:center;justify-content:space-between">' +
      '<div>' +
      '<div style="font-size:14px;font-weight:700;color:var(--txt);margin-bottom:2px">' + esc(lastWkt.name || 'Workout') + '</div>' +
      '<div style="font-size:12px;color:var(--txt3)">' +
      esc(lastWkt.date || '') +
      (lastWkt.duration ? ' · ' + lastWkt.duration + 'min' : '') +
      (lastWkt.totalVol ? ' · ' + Math.round(lastWkt.totalVol) + 'kg' : '') +
      '</div>' +
      '</div>' +
      '<div style="color:var(--txt3);font-size:18px">›</div>' +
      '</div></div>' : '';

    /* ── EXPLORE GRID (grouped) ── */
    function eCard(icon, title, sub, screen) {
      return '<div onclick="go(\'' + screen + '\')" class="card-press" style="background:var(--bg3);border:1px solid var(--border);border-radius:16px;padding:16px;cursor:pointer;touch-action:manipulation;position:relative;overflow:hidden">' +
        '<div style="position:absolute;bottom:0;left:0;right:0;height:3px;background:var(--grad)"></div>' +
        '<div style="font-size:28px;margin-bottom:8px">' + icon + '</div>' +
        '<div style="font-size:13px;font-weight:700;color:var(--txt);margin-bottom:2px">' + title + '</div>' +
        '<div style="font-size:11px;color:var(--txt3)">' + sub + '</div>' +
        '</div>';
    }
    function grpLabel(label) {
      return '<div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:var(--txt3);padding:0 16px;margin-top:20px;margin-bottom:8px">' + label + '</div>';
    }
    const exploreGridGrouped =
      grpLabel('Train') +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:0 16px;margin-bottom:4px">' +
      eCard('💪', 'Workout', 'Log your session', 'workout') +
      eCard('🤸', 'Skills', 'Calisthenics', 'calisthenics') +
      eCard('🔄', 'Rotation', 'Exercise swaps', 'training-style') +
      '</div>' +
      grpLabel('Analyze') +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:0 16px;margin-bottom:4px">' +
      eCard('📊', 'Physique', 'Scores & growth', 'physique') +
      eCard('🧬', 'Body Intel', 'Recovery · DNA', 'body-intelligence') +
      eCard('🧠', 'Training', 'Age & volume', 'training-intel') +
      eCard('🦴', 'Joints', 'Injury risk', 'injury-risk') +
      eCard('📡', 'Visuals', 'Heatmaps & radar', 'visualizations') +
      '</div>' +
      grpLabel('Know') +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:0 16px;margin-bottom:4px">' +
      eCard('📖', 'Encyclopedia', 'Mobility & sports', 'encyclopedia') +
      eCard('🎓', 'Academy', 'Learn & earn XP', 'academy') +
      eCard('🩹', 'Rehab', 'Injury protocols', 'rehab') +
      eCard('🔬', 'Anatomy', '80+ muscles', 'anatomy') +
      '</div>' +
      grpLabel('Me') +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:0 16px;margin-bottom:14px">' +
      eCard('🎯', 'Archetype', 'Physique goals', 'physique-archetype') +
      eCard('⚔️', 'Quests', 'Missions & rewards', 'quests') +
      eCard('📸', 'Timeline', 'Transformation', 'physique-timeline') +
      eCard('📈', 'Progress', 'Charts & PRs', 'progress') +
      '</div>';

    return demoBanner + topbar + heroCard + quickActions + todayWorkout + recoverySnapshot +
      muscleRecoveryMini + activeQuestCard + progressSnapshot + lastWktCard + exploreGridGrouped +
      '<div style="height:20px"></div>';

  } catch(e) {
    console.error('dashboard', e);
    return '<div style="padding:28px;color:var(--txt)">Loading...</div>';
  }
});

window._nextTheme = _nextTheme;
window._eCard = function(i, t, s, sc) { return ''; };
