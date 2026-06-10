'use strict';
/* ── PulseCap — Knowledge & Explore Hub ── */

reg('hub', function() {
  const user = S.g('user') || {};
  const ws = S.g('workouts') || [];
  const xp = typeof KnowledgeAcademy !== 'undefined' ? KnowledgeAcademy.totalXP() : 0;
  const level = typeof KnowledgeAcademy !== 'undefined' ? KnowledgeAcademy.level() : { level: 1, title: 'Novice', color: 'var(--txt3)' };
  const completedLessons = typeof KnowledgeAcademy !== 'undefined' ? KnowledgeAcademy.completed().length : 0;
  const totalLessons = typeof KnowledgeAcademy !== 'undefined' ? KnowledgeAcademy.LESSONS.length : 8;
  const activeQuests = typeof QuestEngine !== 'undefined' ? QuestEngine.getActive().length : 0;
  const badges = (S.g('earnedBadges') || []).length;

  function hubSection(label) {
    return '<div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:var(--txt3);padding:0 16px;margin-top:24px;margin-bottom:10px">' + label + '</div>';
  }

  function hubRow(icon, title, sub, screen, badge) {
    return '<div role="button" tabindex="0" onclick="go(\'' + screen + '\')" onkeydown="if(event.key===\'Enter\'||event.key===\' \')go(\'' + screen + '\')" aria-label="' + title + '" style="display:flex;align-items:center;gap:14px;padding:13px 16px;cursor:pointer;touch-action:manipulation;border-bottom:1px solid var(--border)">' +
      '<div style="width:40px;height:40px;border-radius:12px;background:var(--bg3);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0">' + icon + '</div>' +
      '<div style="flex:1;min-width:0">' +
      '<div style="font-size:14px;font-weight:700;color:var(--txt)">' + esc(title) + '</div>' +
      '<div style="font-size:11px;color:var(--txt3);margin-top:1px">' + esc(sub) + '</div>' +
      '</div>' +
      (badge ? '<div style="font-size:11px;font-weight:700;color:var(--c1);background:rgba(var(--c1-rgb),0.12);padding:3px 8px;border-radius:8px;flex-shrink:0">' + esc(badge) + '</div>' : '') +
      '<div style="font-size:16px;color:var(--txt3);flex-shrink:0">›</div>' +
      '</div>';
  }

  const xpBar = '<div onclick="go(\'academy\')" style="margin:16px 16px 0;background:linear-gradient(135deg,rgba(var(--c1-rgb),0.12),rgba(0,213,255,0.06));border:1px solid rgba(var(--c1-rgb),0.2);border-radius:18px;padding:14px 16px;cursor:pointer;touch-action:manipulation">' +
    '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">' +
    '<div>' +
    '<div style="font-size:14px;font-weight:800;color:' + level.color + '">Level ' + level.level + ' · ' + esc(level.title) + '</div>' +
    '<div style="font-size:11px;color:var(--txt3)">' + xp + ' XP · ' + completedLessons + '/' + totalLessons + ' lessons · ' + badges + ' badges</div>' +
    '</div>' +
    '<div style="font-size:32px">🎓</div>' +
    '</div>' +
    '<div style="width:100%;height:5px;background:rgba(255,255,255,0.06);border-radius:3px">' +
    '<div style="width:' + Math.min(100, Math.round((xp / 500) * 100)) + '%;height:5px;border-radius:3px;background:' + level.color + '"></div>' +
    '</div>' +
    '</div>';

  return '<div class="topbar"><div class="topbar-title">Explore</div>' +
    '<button onclick="go(\'search\')" style="background:none;border:none;color:var(--txt3);font-size:20px;cursor:pointer;padding:0 16px;touch-action:manipulation">🔍</button>' +
    '</div>' +

    xpBar +

    hubSection('Intelligence') +
    '<div style="background:var(--bg3);border-top:1px solid var(--border)">' +
    hubRow('🧬', 'Body Intelligence', 'Recovery · Joints · DNA Profile', 'body-intelligence', '') +
    hubRow('🧠', 'Training Intel', 'Training age · Volume · Specialization', 'training-intel', '') +
    hubRow('📊', 'Physique Analysis', 'Scores · Growth simulator · Radar', 'physique', '') +
    hubRow('🦴', 'Joint Health', 'Injury risk monitor · 7 joints', 'injury-risk', '') +
    hubRow('📡', 'Visualizations', 'Heatmaps · Fatigue map · Radar', 'visualizations', '') +
    hubRow('🤖', 'Smart Coach', 'Ask anything about training', 'assistant', '') +
    '</div>' +

    hubSection('Train') +
    '<div style="background:var(--bg3);border-top:1px solid var(--border)">' +
    hubRow('📚', 'Exercise Library', (typeof ExDB !== 'undefined' ? ExDB.db.length + ' exercises' : 'Browse all') + ' · wger sync', 'workout', '') +
    hubRow('💪', 'Workout Logger', 'Log sets · PRs · Volume tracking', 'workout', '') +
    hubRow('🔄', 'Smart Rotation', 'Exercise swap suggestions', 'training-style', '') +
    hubRow('🤸', 'Calisthenics', 'Skill progressions', 'calisthenics', '') +
    hubRow('❤️', 'Cardio', 'Protocols · Zone 2 · HIIT', 'cardio', '') +
    '</div>' +

    hubSection('Physique') +
    '<div style="background:var(--bg3);border-top:1px solid var(--border)">' +
    hubRow('🎯', 'Physique Archetype', '6 archetypes · Target measurements', 'physique-archetype', '') +
    hubRow('📸', 'Physique Timeline', 'Transformation history', 'physique-timeline', '') +
    hubRow('🔬', 'Muscle Anatomy', '80+ muscles · Origins · Functions', 'anatomy', '') +
    hubRow('🫀', 'Body Map', 'Recovery map · Muscle status', 'bodymap', '') +
    '</div>' +

    hubSection('Recovery') +
    '<div style="background:var(--bg3);border-top:1px solid var(--border)">' +
    hubRow('😴', 'Recovery Check-In', 'Sleep · Soreness · Energy', 'recovery', '') +
    hubRow('📊', 'Recovery Debt', 'Fatigue forecast · 14-day outlook', 'recovery-debt', '') +
    hubRow('🩹', 'Rehab Protocols', 'Injury recovery programs', 'rehab', '') +
    '</div>' +

    hubSection('Knowledge') +
    '<div style="background:var(--bg3);border-top:1px solid var(--border)">' +
    hubRow('📖', 'Encyclopedia', 'Mobility · Stretching · Sports · Warmups', 'encyclopedia', '') +
    hubRow('🎓', 'Knowledge Academy', 'Lessons · Quizzes · XP', 'academy', completedLessons + '/' + totalLessons) +
    hubRow('🔍', 'Global Search', 'Find anything instantly', 'search', '') +
    '</div>' +

    hubSection('Missions') +
    '<div style="background:var(--bg3);border-top:1px solid var(--border)">' +
    hubRow('⚔️', 'Quests & Missions', 'Auto-generated challenges', 'quests', activeQuests > 0 ? activeQuests + ' active' : '') +
    hubRow('🏆', 'Achievements', 'Milestones · Badges · History', 'progress', '') +
    hubRow('📈', 'Progress & PRs', 'Charts · Volume · History', 'progress', '') +
    '</div>' +

    '<div style="height:30px"></div>';
});

window.HubModule = { registered: true };
