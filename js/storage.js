'use strict';
const S = {
  _key: 'fos_profiles',
  _metaKey: 'fos_meta',
  _pid: null,
  d: {},

  /* ── Meta (profile list) ── */
  getMeta() {
    try { return JSON.parse(localStorage.getItem(this._metaKey)||'{}'); } catch(e) { return {}; }
  },
  saveMeta(meta) {
    localStorage.setItem(this._metaKey, JSON.stringify(meta));
  },

  /* ── Profile list ── */
  profiles() {
    const meta = this.getMeta();
    return meta.profiles || [];
  },
  activeId() {
    const meta = this.getMeta();
    return meta.activeId || null;
  },

  /* ── Init ── */
  init() {
    const meta = this.getMeta();
    /* Migration: carry over old single-profile data */
    const legacyKey = 'fos_v4';
    const legacyRaw = localStorage.getItem(legacyKey);
    if (legacyRaw && (!meta.profiles || !meta.profiles.length)) {
      const id = 'p_' + Date.now();
      const newMeta = {
        profiles: [{ id, name: 'My Profile', avatar: '💪', created: new Date().toISOString() }],
        activeId: id
      };
      this.saveMeta(newMeta);
      this._pid = id;
      try { this.d = JSON.parse(legacyRaw); } catch(e) { this.d = {}; }
      this._save();
      return;
    }
    /* First ever launch — create default profile */
    if (!meta.profiles || !meta.profiles.length) {
      const id = 'p_' + Date.now();
      const newMeta = {
        profiles: [{ id, name: 'My Profile', avatar: '💪', created: new Date().toISOString() }],
        activeId: id
      };
      this.saveMeta(newMeta);
      this._pid = id;
      this.d = {};
      this._save();
      return;
    }
    this._pid = meta.activeId || meta.profiles[0].id;
    this._load();
  },

  /* ── Switch profile ── */
  switchProfile(id) {
    const meta = this.getMeta();
    const found = (meta.profiles||[]).find(p => p.id === id);
    if (!found) return false;
    meta.activeId = id;
    this.saveMeta(meta);
    this._pid = id;
    this._load();
    return true;
  },

  /* ── Create profile ── */
  createProfile(name, avatar) {
    const meta = this.getMeta();
    if (!meta.profiles) meta.profiles = [];
    const id = 'p_' + Date.now();
    meta.profiles.push({ id, name: name||'Athlete', avatar: avatar||'💪', created: new Date().toISOString() });
    meta.activeId = id;
    this.saveMeta(meta);
    this._pid = id;
    this.d = {};
    this._save();
    return id;
  },

  /* ── Delete profile ── */
  deleteProfile(id) {
    const meta = this.getMeta();
    meta.profiles = (meta.profiles||[]).filter(p => p.id !== id);
    localStorage.removeItem(this._key + '_' + id);
    if (meta.activeId === id) {
      meta.activeId = meta.profiles.length ? meta.profiles[0].id : null;
    }
    this.saveMeta(meta);
    if (meta.activeId) {
      this._pid = meta.activeId;
      this._load();
    } else {
      this.d = {};
    }
  },

  /* ── Update profile info ── */
  updateProfileInfo(id, name, avatar) {
    const meta = this.getMeta();
    const p = (meta.profiles||[]).find(p => p.id === id);
    if (p) {
      if (name) p.name = name;
      if (avatar) p.avatar = avatar;
      this.saveMeta(meta);
    }
  },

  /* ── Demo profile ── */
  createDemo() {
    const meta = this.getMeta();
    if (!meta.profiles) meta.profiles = [];
    const existing = meta.profiles.find(p => p.id === 'demo');
    if (!existing) {
      meta.profiles.push({ id:'demo', name:'Demo Mode', avatar:'🤖', created: new Date().toISOString(), isDemo:true });
      this.saveMeta(meta);
    }
    /* Inject rich demo data */
    const demoData = {
      onboarded: true,
      user: {
        name: 'Alex Demo', goal: 'hypertrophy', exp: 'intermediate',
        gender: 'male', age: 26, units: 'metric', height: 180, weight: 82,
        goalWeight: 78, split: 'ppl', weeklyGoal: 4,
        equipment: ['barbell','dumbbell','cables','machine','bar'],
        coachPersonality: 'maya', theme: 'carbon', mode: 'dark',
        splitDay: 2, joinDate: new Date(Date.now()-60*864e5).toISOString()
      },
      recovery: {
        sleep: 7.5, soreness: 3, stress: 4, energy: 8, hydration: 2.5,
        date: new Date().toISOString().slice(0,10)
      },
      workouts: _demoWorkouts(),
      prs: [
        { exercise:'Barbell Bench Press', weight:100, reps:5, e1rm:111, date: new Date(Date.now()-7*864e5).toISOString() },
        { exercise:'Back Squat', weight:120, reps:5, e1rm:134, date: new Date(Date.now()-5*864e5).toISOString() },
        { exercise:'Deadlift', weight:150, reps:3, e1rm:158, date: new Date(Date.now()-3*864e5).toISOString() },
        { exercise:'Overhead Press', weight:70, reps:5, e1rm:78, date: new Date(Date.now()-2*864e5).toISOString() }
      ],
      bodyStats: [
        { date: new Date(Date.now()-30*864e5).toISOString().slice(0,10), weight:85 },
        { date: new Date(Date.now()-20*864e5).toISOString().slice(0,10), weight:83.5 },
        { date: new Date(Date.now()-10*864e5).toISOString().slice(0,10), weight:82 },
        { date: new Date().toISOString().slice(0,10), weight:82 }
      ],
      supplements: [
        { id:'creatine', name:'Creatine Monohydrate', timing:'anytime', dose:'5g', active:true },
        { id:'whey', name:'Whey Protein', timing:'post', dose:'1 scoop', active:true }
      ],
      achievements: ['first_workout','streak_3','workouts_10','pr_first']
    };
    localStorage.setItem(this._key + '_demo', JSON.stringify(demoData));
    meta.activeId = 'demo';
    this.saveMeta(meta);
    this._pid = 'demo';
    this._load();
  },

  /* ── Core data ops ── */
  _load() {
    try {
      const raw = localStorage.getItem(this._key + '_' + this._pid);
      this.d = raw ? JSON.parse(raw) : {};
    } catch(e) { this.d = {}; }
  },
  _save() {
    if (!this._pid) return;
    localStorage.setItem(this._key + '_' + this._pid, JSON.stringify(this.d));
  },
  save() { this._save(); },

  g(path) {
    const keys = path.split('.');
    let v = this.d;
    for (const k of keys) { if (v == null) return null; v = v[k]; }
    return v === undefined ? null : v;
  },
  set(path, val) {
    const keys = path.split('.');
    let v = this.d;
    for (let i = 0; i < keys.length - 1; i++) {
      if (v[keys[i]] == null || typeof v[keys[i]] !== 'object') v[keys[i]] = {};
      v = v[keys[i]];
    }
    v[keys[keys.length-1]] = val;
    this._save();
  },
  push(path, item) {
    const arr = this.g(path) || [];
    arr.push(item);
    this.set(path, arr);
  },
  reset() {
    if (!this._pid) return;
    localStorage.removeItem(this._key + '_' + this._pid);
    this.d = {};
    toast('All data cleared', 'ok');
    location.reload();
  }
};
window.S = S;

/* Demo workout generator — called once during demo setup */
function _demoWorkouts() {
  const days = [1,3,5,7,10,12,14,17,19,21,24,26,28,31,33,35];
  const templates = [
    { name:'Push A — Upper Chest', exercises:[
      { name:'Barbell Bench Press', sets:[{weight:95,reps:8,done:true},{weight:97.5,reps:7,done:true},{weight:100,reps:6,done:true}], muscles:{primary:['chest']} },
      { name:'Overhead Press', sets:[{weight:65,reps:8,done:true},{weight:67.5,reps:7,done:true},{weight:70,reps:5,done:true}], muscles:{primary:['front_delts']} },
      { name:'Incline Dumbbell Press', sets:[{weight:32,reps:10,done:true},{weight:32,reps:9,done:true},{weight:30,reps:10,done:true}], muscles:{primary:['upper_chest']} }
    ]},
    { name:'Pull A — Lats & Biceps', exercises:[
      { name:'Deadlift', sets:[{weight:140,reps:5,done:true},{weight:145,reps:5,done:true},{weight:150,reps:3,done:true}], muscles:{primary:['lower_back']} },
      { name:'Barbell Row', sets:[{weight:80,reps:8,done:true},{weight:82.5,reps:7,done:true},{weight:85,reps:6,done:true}], muscles:{primary:['lats']} },
      { name:'Lat Pulldown', sets:[{weight:70,reps:10,done:true},{weight:72.5,reps:9,done:true},{weight:75,reps:8,done:true}], muscles:{primary:['lats']} }
    ]},
    { name:'Legs A — Quads & Calves', exercises:[
      { name:'Back Squat', sets:[{weight:110,reps:8,done:true},{weight:115,reps:6,done:true},{weight:120,reps:5,done:true}], muscles:{primary:['quads']} },
      { name:'Leg Press', sets:[{weight:160,reps:10,done:true},{weight:160,reps:10,done:true},{weight:160,reps:8,done:true}], muscles:{primary:['quads']} },
      { name:'Standing Calf Raise', sets:[{weight:60,reps:15,done:true},{weight:60,reps:14,done:true},{weight:60,reps:12,done:true}], muscles:{primary:['calves']} }
    ]}
  ];
  return days.map(function(daysAgo, i) {
    const t = templates[i % templates.length];
    const totalVol = t.exercises.reduce(function(sum,ex) {
      return sum + ex.sets.reduce(function(s2,st) { return s2+(st.weight*st.reps); }, 0);
    }, 0);
    return {
      id: 'demo_wkt_'+i,
      name: t.name,
      date: new Date(Date.now() - daysAgo*864e5).toISOString().slice(0,10),
      duration: 45 + Math.floor(Math.random()*30),
      totalVol: totalVol,
      exercises: t.exercises
    };
  });
}
