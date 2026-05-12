const { createApp, ref, computed, watch, onMounted, nextTick } = Vue;

const SESSION_LOG_FIELDS = {
  intervals: [
    { key: 'sets_done',    label: 'Drag fullført', unit: 'stk',  integer: true },
    { key: 'speed_kmh',    label: 'Snittfart',     unit: 'km/t', step: 0.1 },
    { key: 'incline_pct',  label: 'Stigning',      unit: '%',    step: 0.5 },
    { key: 'duration_min', label: 'Varighet',       unit: 'min',  integer: true },
  ],
  ocr: [
    { key: 'rounds_done',  label: 'Runder fullført', unit: 'stk', integer: true },
    { key: 'burpees_done', label: 'Burpees gjort',   unit: 'stk', integer: true },
    { key: 'hang_sec',     label: 'Beste hang',      unit: 'sek', integer: true },
    { key: 'carry_kg',     label: 'Carry-vekt',      unit: 'kg',  step: 0.5 },
    { key: 'duration_min', label: 'Varighet',         unit: 'min', integer: true },
  ],
  strength: [
    { key: 'sets_done',    label: 'Sett fullført',    unit: 'stk', integer: true },
    { key: 'weight_pct',   label: 'Vekt (% av plan)', unit: '%',   integer: true },
    { key: 'duration_min', label: 'Varighet',          unit: 'min', integer: true },
  ],
  circuit: [
    { key: 'rounds_done',  label: 'Runder fullført', unit: 'stk', integer: true },
    { key: 'duration_min', label: 'Varighet',         unit: 'min', integer: true },
  ],
  recovery: [
    { key: 'duration_min', label: 'Varighet',  unit: 'min', integer: true },
    { key: 'speed_kmh',    label: 'Snittfart', unit: 'km/t', step: 0.1 },
    { key: 'incline_pct',  label: 'Stigning',  unit: '%',   step: 0.5 },
  ],
};

createApp({
  setup() {

    // ── STATE ──────────────────────────────────────────────────────────────
    const selectedAthlete = ref('sondre');
    const dagsform = ref('green');
    const view = ref('today');
    const viewWeek = ref(1);
    const selectedSessionKey = ref(null);
    const selectedStrengthKey = ref(null); // 'monday' | 'wednesday' | 'friday' | null
    const selectedLibraryKey  = ref(null); // key from LIBRARY_SESSIONS or null
    const libraryCategory     = ref('Intervall');
    const deloadMode = ref(false);
    const shortMode = ref(false);
    const isOutdoor = ref(false);
    const todayNote = ref('');
    const noteSaved = ref(false);
    const newTest = ref({ athlete: 'sondre', type: 'cooper', value: '', carry_weight_kg: 20, date: today() });
    const workoutMetrics = ref({});
    const refreshKey = ref(0); // incremented after saving to force computed re-eval of localStorage
    const currentExerciseSets = ref({}); // { [exerciseName]: [{ weight, reps, done }] }
    const historikkFilter = ref('alle'); // 'alle' | 'strength' | 'intervals' | 'ocr'
    const doneVersion = ref(0); // incremented on every done-state change to force template re-eval
    const selectedRpe = ref(null);
    const editingLog = ref(false);

    // localStorage keys
    const STORAGE = {
      athlete: 'onitio_athlete',
      dagsform: 'onitio_dagsform',
      outdoor: 'onitio_outdoor',
      rpe: (id) => `onitio_rpe_${id}`,
      note: (id) => `onitio_note_${id}`,
      tests: 'onitio_tests',
      wlog:  (id) => `onitio_wlog_${id}`,
    };

    // ── DATE HELPERS ───────────────────────────────────────────────────────
    function today() {
      return new Date().toISOString().split('T')[0];
    }

    function formatDate(d) {
      if (!d) return '';
      const dt = new Date(d + 'T00:00:00');
      return dt.toLocaleDateString('nb-NO', { day: '2-digit', month: '2-digit', year: '2-digit' });
    }

    function formatShortDate(d) {
      if (!d) return '';
      const dt = new Date(d + 'T00:00:00');
      return dt.toLocaleDateString('nb-NO', { day: '2-digit', month: '2-digit' });
    }

    function weekDates(weekNum) {
      const [sy, sm, sd] = PROGRAM_DATA.meta.programStart.split('-').map(Number);
      const startMs = Date.UTC(sy, sm - 1, sd);
      const mondayMs = startMs + (weekNum - 1) * 7 * 86400000;
      const fridayMs = mondayMs + 4 * 86400000;
      const fmt = ms => new Date(ms).toLocaleDateString('nb-NO', { day: '2-digit', month: '2-digit', timeZone: 'UTC' });
      return fmt(mondayMs) + ' – ' + fmt(fridayMs);
    }

    // ── CURRENT WEEK CALCULATION ───────────────────────────────────────────
    const currentWeekNumber = computed(() => {
      const [sy, sm, sd] = PROGRAM_DATA.meta.programStart.split('-').map(Number);
      const startMs = Date.UTC(sy, sm - 1, sd);
      const [ny, nm, nd] = today().split('-').map(Number);
      const nowMs = Date.UTC(ny, nm - 1, nd);
      const days = Math.floor((nowMs - startMs) / 86400000);
      const n = Math.floor(days / 7) + 1;
      return Math.max(1, Math.min(n, PROGRAM_DATA.meta.totalWeeks));
    });

    const currentWeek = computed(() =>
      PROGRAM_DATA.weeks.find(w => w.weekNumber === currentWeekNumber.value)
    );

    const viewingWeekData = computed(() =>
      PROGRAM_DATA.weeks.find(w => w.weekNumber === viewWeek.value)
    );

    const viewingWeekWorkouts = computed(() => {
      const out = {};
      const sessions = viewingWeekData.value?.sessions || {};
      for (const [key, session] of Object.entries(sessions)) {
        if (!session) continue;
        const w = resolveWorkout(session, selectedAthlete.value);
        out[key] = replaceTokensDeep(w, athleteLevels.value);
      }
      return out;
    });

    const totalWeeks = computed(() => PROGRAM_DATA.meta.totalWeeks);

    // ── EVENTS / COUNTDOWNS ────────────────────────────────────────────────
    const DEFAULT_EVENTS = [
      { name: 'Holmenkollstafetten', date: PROGRAM_DATA.meta.raceDate, icon: '🏁' },
      { name: 'Fjelltur',             date: '2026-07-01',               icon: '⛰️' },
      { name: 'Navy Race',            date: '2026-08-08',               icon: '⚓' },
    ];
    const events = ref(JSON.parse(localStorage.getItem('onitio_events') || 'null') || DEFAULT_EVENTS);
    const newEvent = ref({ name: '', date: '', icon: '🎯' });

    function daysUntilDate(dateStr) {
      const d = new Date(dateStr + 'T00:00:00');
      const now = new Date(); now.setHours(0, 0, 0, 0);
      return Math.ceil((d - now) / 86400000);
    }

    const upcomingEvents = computed(() =>
      events.value
        .map(e => ({ ...e, days: daysUntilDate(e.date) }))
        .sort((a, b) => a.days - b.days)
    );

    function addEvent() {
      if (!newEvent.value.name.trim() || !newEvent.value.date) return;
      events.value = [...events.value, { ...newEvent.value, name: newEvent.value.name.trim() }];
      newEvent.value = { name: '', date: '', icon: '🎯' };
    }

    function removeEvent(i) {
      events.value = events.value.filter((_, idx) => idx !== i);
    }

    // ── DATA MANAGEMENT ────────────────────────────────────────────────────
    const clearConfirm = ref(null); // 'athlete' | 'all' | null

    function clearAthleteData(athleteId) {
      const weekKeys = Object.keys(localStorage).filter(k => k.startsWith(`onitio_done_w`) && k.endsWith(`_${athleteId}`));
      weekKeys.forEach(k => localStorage.removeItem(k));
      localStorage.removeItem(STORAGE.wlog(athleteId));
      localStorage.removeItem(STORAGE.rpe(athleteId));
      localStorage.removeItem(STORAGE.note(athleteId));
      refreshKey.value++;
      doneVersion.value++;
    }

    function confirmClear(scope) {
      if (scope === 'athlete') {
        clearAthleteData(selectedAthlete.value);
      } else {
        ATHLETES.forEach(a => clearAthleteData(a.id));
      }
      clearConfirm.value = null;
    }

    function downloadBackup() {
      const data = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('onitio_')) {
          try { data[key] = JSON.parse(localStorage.getItem(key)); }
          catch { data[key] = localStorage.getItem(key); }
        }
      }
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `onitio-backup-${today()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }

    const backupRestoreMsg = ref('');
    function restoreBackup(event) {
      const file = event.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          let count = 0;
          for (const [key, value] of Object.entries(data)) {
            if (key.startsWith('onitio_')) {
              localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
              count++;
            }
          }
          refreshKey.value++;
          backupRestoreMsg.value = `✓ ${count} elementer gjenopprettet`;
          setTimeout(() => { backupRestoreMsg.value = ''; }, 4000);
        } catch {
          backupRestoreMsg.value = '✗ Ugyldig backup-fil';
          setTimeout(() => { backupRestoreMsg.value = ''; }, 4000);
        }
        event.target.value = '';
      };
      reader.readAsText(file);
    }

    watch(events, v => localStorage.setItem('onitio_events', JSON.stringify(v)), { deep: true });

    // ── TODAY'S SESSION ────────────────────────────────────────────────────
    const DAY_MAP = { 1: 'monday', 2: 'tuesday', 4: 'thursday', 5: 'friday' };
    const DAY_NAMES = { monday: 'Mandag', tuesday: 'Tirsdag', thursday: 'Torsdag', friday: 'Fredag' };

    const selectedSession = computed(() => {
      if (!selectedSessionKey.value || !currentWeek.value) return null;
      return currentWeek.value.sessions?.[selectedSessionKey.value] || null;
    });

    function selectSession(key) {
      selectedSessionKey.value = key;
      selectedStrengthKey.value = null;
      selectedLibraryKey.value = null;
      deloadMode.value = false;
      shortMode.value = false;
      cancelRestTimer();
      cancelWorkTimer();
      selectedRpe.value = null;
      editingLog.value = false;
      currentExerciseSets.value = {};
      initExerciseSets();
      if (displayedWorkout.value?.circuitMode) loadCircuitSettings();
    }

    function selectStrengthSession(key) {
      const newKey = selectedStrengthKey.value === key ? null : key;
      selectedStrengthKey.value = newKey;
      selectedSessionKey.value = null;
      selectedLibraryKey.value = null;
      deloadMode.value = false;
      shortMode.value = false;
      cancelRestTimer();
      cancelWorkTimer();
      if (newKey) { prefillStrengthMetrics(); initExerciseSets(); }
      else workoutMetrics.value = {};
    }

    function selectLibrarySession(key) {
      const newKey = selectedLibraryKey.value === key ? null : key;
      selectedLibraryKey.value = newKey;
      selectedSessionKey.value = null;
      selectedStrengthKey.value = null;
      deloadMode.value = false;
      shortMode.value = false;
      cancelRestTimer();
      cancelWorkTimer();
      selectedRpe.value = null;
      editingLog.value = false;
      currentExerciseSets.value = {};
      if (newKey) workoutMetrics.value = {};
    }
    function doneKey(weekNum, athleteId) {
      return `onitio_done_w${weekNum}_${athleteId}`;
    }

    function isSessionDone(sessionKey) {
      doneVersion.value; // reactive dependency
      if (!sessionKey) return false;
      const done = JSON.parse(localStorage.getItem(doneKey(currentWeekNumber.value, selectedAthlete.value)) || '[]');
      return done.includes(sessionKey);
    }

    function isStrengthDone(strengthKey) {
      doneVersion.value;
      if (!strengthKey) return false;
      const done = JSON.parse(localStorage.getItem(doneKey(currentWeekNumber.value, selectedAthlete.value)) || '[]');
      return done.includes('strength_' + strengthKey);
    }

    function isSessionDoneForWeek(weekNum, sessionKey) {
      if (!sessionKey) return false;
      const done = JSON.parse(localStorage.getItem(doneKey(weekNum, selectedAthlete.value)) || '[]');
      return done.includes(sessionKey);
    }

    function markSessionDone(sessionKey) {
      if (!sessionKey) return;
      const key = doneKey(currentWeekNumber.value, selectedAthlete.value);
      const done = JSON.parse(localStorage.getItem(key) || '[]');
      if (!done.includes(sessionKey)) done.push(sessionKey);
      else done.splice(done.indexOf(sessionKey), 1);
      localStorage.setItem(key, JSON.stringify(done));
      doneVersion.value++;
    }

    function markStrengthDone(strengthKey) {
      if (!strengthKey) return;
      const sk = 'strength_' + strengthKey;
      const key = doneKey(currentWeekNumber.value, selectedAthlete.value);
      const done = JSON.parse(localStorage.getItem(key) || '[]');
      if (!done.includes(sk)) done.push(sk);
      else done.splice(done.indexOf(sk), 1);
      localStorage.setItem(key, JSON.stringify(done));
      doneVersion.value++;
    }

    // ── EXERCISE DEFAULT WEIGHTS ───────────────────────────────────────────
    function getExerciseDefaultWeight(exName, athleteId) {
      const athlete = ATHLETES.find(a => a.id === athleteId);
      const d = athlete?.strengthDefaults || {};
      const n = (exName || '').toLowerCase();
      if (n.includes('hip thrust'))  return d.hip_thrust_kg ?? 0;
      if (n.includes('carry'))       return d.carry_kg      ?? 0;
      if (n.includes('goblet'))      return d.goblet_kg     ?? 0;
      return 0;
    }

    // ── EXERCISE PARSER ────────────────────────────────────────────────────
    function parseExercise(str) {
      if (!str || typeof str !== 'string') return { name: str, sets: null, reps: null, time: null, note: null };
      // Match: "Name N×AMOUNT unit (note)"
      const m = str.match(/^(.*?)\s+(\d+)×([\d–\-\/]+)\s*(sek|min)?\s*(?:\(([^)]+)\))?/);
      if (!m) return { name: str, sets: null, reps: null, time: null, note: null };
      const [, rawName, sets, amount, unit, paren] = m;
      const isTime = !!unit || str.toLowerCase().includes('sek') || str.toLowerCase().includes('min');
      const weightM = paren?.match(/([\d–\-]+)\s*kg/);
      return {
        name: rawName.trim(),
        sets: parseInt(sets),
        reps: !isTime ? amount : null,
        time: isTime ? amount + (unit ? ' ' + unit : ' sek') : null,
        weight: weightM ? weightM[0] : null,
        note: paren && !weightM ? paren : (paren && weightM && paren.replace(weightM[0],'').trim() ? paren.replace(weightM[0],'').trim() : null),
      };
    }

    function parseExercises(exercises) {
      if (!exercises) return [];
      return exercises.map(parseExercise);
    }

    // ── EXERCISE TAG SYSTEM ────────────────────────────────────────────────
    // Tags decide UI: 'timed' → timer button + Sek column; 'weighted' → weight input; 'reps' → reps input
    const EXERCISE_TAGS = {
      // Timed – no reps, use countdown timer
      'planke':           ['timed'],
      'sideplanke':       ['timed'],
      'dead hang':        ['timed'],
      'hollow hold':      ['timed'],
      'wall sit':         ['timed'],
      'hofteåpner':       ['timed'],
      "farmer's carry":   ['timed', 'weighted'],
      'carry':            ['timed', 'weighted'],
      // Bodyweight – reps-based, no external load
      'push-up':          ['bodyweight', 'reps'],
      'pull-up':          ['bodyweight', 'reps'],
      'chest dip':        ['bodyweight', 'reps'],
      'dip':              ['bodyweight', 'reps'],
      'trx':              ['bodyweight', 'reps'],
      'shoulder cars':    ['bodyweight', 'reps'],
      'cars':             ['bodyweight', 'reps'],
      // Weighted – external load + reps
      'hip thrust':       ['weighted', 'reps'],
      'utfall':           ['weighted', 'reps'],
      'roing':            ['weighted', 'reps'],
      'step-ups':         ['weighted', 'reps'],
      'step-up':          ['weighted', 'reps'],
      'box step':         ['weighted', 'reps'],
      'goblet squat':     ['weighted', 'reps'],
      'split squat':      ['weighted', 'reps'],
      'pallof press':     ['weighted', 'reps'],
      'push-press':       ['weighted', 'reps'],
      'press':            ['weighted', 'reps'],
      'squat':            ['weighted', 'reps'],
    };

    function getExTags(ex) {
      if (ex.tags) return ex.tags;                          // explicit tags win
      const key = (ex.name || '').toLowerCase();
      for (const [pat, tags] of Object.entries(EXERCISE_TAGS)) {
        if (key.includes(pat)) return tags;
      }
      return ex.time ? ['timed'] : ['weighted', 'reps'];   // fallback: derive from parsed data
    }


    function deloadExercises(exercises) {
      return parseExercises(exercises).map(ex => ({
        ...ex,
        sets: ex.sets ? Math.ceil(ex.sets * 0.5) : null,
        weight: ex.weight ? ex.weight + ' (50%)' : null,
        time: ex.time ? ex.time.replace(/(\d+)–(\d+)/, (_, a, b) => `${Math.ceil(+a*0.6)}–${Math.ceil(+b*0.6)}`) : null,
        deload: true,
      }));
    }

    function deloadCircuit(circuit, rounds) {
      return {
        rounds: Math.ceil((parseInt(rounds) || 3) * 0.5),
        circuit: circuit?.map(s => s
          .replace(/(\d+)\s*burpees/, (_, n) => `${Math.ceil(n*0.5)} burpees`)
          .replace(/(\d+)–(\d+)\s*sek\s*hang/, (_, a, b) => `${Math.ceil(+a*0.6)}–${Math.ceil(+b*0.6)} sek hang`)
        ),
        note: 'Deload: redusert volum og intensitet',
      };
    }

    // ── ADJUST WORKOUT (dagsform / deload / short) ────────────────────────────
    function adjustSetsStr(s, vf) {
      if (!s || vf === 1) return s;
      // "6×3 min", "3×4 min" osv.
      const r1 = s.replace(/^(\d+)(×)/, (_, n, x) => `${Math.max(1, Math.round(+n * vf))}${x}`);
      if (r1 !== s) return r1;
      // "2 serier × 4×3 min" — reduser antall serier
      return s.replace(/^(\d+)(\s+serier\s+×\s+)/i, (_, n, mid) => `${Math.max(1, Math.round(+n * vf))}${mid}`);
    }
    function adjustSpeedInStr(s, sd) {
      if (!s || sd === 0) return s;
      return s.replace(/(\d+(?:\.\d+)?)–(\d+(?:\.\d+)?)\s*km\/t/g, (_, a, b) =>
        `${Math.max(1, parseFloat(a) + sd).toFixed(1)}–${Math.max(1, parseFloat(b) + sd).toFixed(1)} km/t`
      );
    }
    function adjustCircuitStep(s, vf, sd) {
      if (!s) return s;
      let r = s;
      r = r.replace(/(\d+)–(\d+)\s*sek\s*hang/i, (_, a, b) =>
        `${Math.round(+a * vf)}–${Math.round(+b * vf)} sek hang`);
      r = r.replace(/(\d+)\s*sek\s*hang/i, (_, n) => `${Math.round(+n * vf)} sek hang`);
      r = r.replace(/(\d+)\s*burpees/i, (_, n) => `${Math.max(1, Math.round(+n * vf))} burpees`);
      if (sd !== 0) r = adjustSpeedInStr(r, sd);
      return r;
    }
    function adjustOptionStr(s, vf, sd) {
      if (!s) return s;
      let r = s.replace(/(\d+)(×)/, (_, n, x) => `${Math.max(1, Math.round(+n * vf))}${x}`);
      if (sd !== 0) r = adjustSpeedInStr(r, sd);
      return r;
    }
    function adjustWorkout(w, dgForm, isDeload, isShort) {
      if (!w) return w;
      let vf = 1;
      let sd = 0;
      if (isDeload)            { vf *= 0.5; sd -= 1.0; }
      if (dgForm === 'yellow') { vf *= 0.8; sd -= 0.5; }
      if (dgForm === 'red')    { vf *= 0.5; sd -= 1.0; }
      if (isShort)             { vf *= 0.5; }
      if (vf === 1 && sd === 0 && !isShort) return w;
      const w2 = { ...w };
      if (w2.rounds != null) w2.rounds = Math.max(1, Math.round(w2.rounds * vf));
      if (w2.exercises) w2.exercises = w2.exercises.map(s =>
        s.replace(/(\d+)(×)/, (_, n, x) => `${Math.max(1, Math.round(+n * vf))}${x}`)
      );
      if (w2.circuit) w2.circuit = w2.circuit.map(s => adjustCircuitStep(s, vf, sd));
      if (w2.options) w2.options = w2.options.map(o => adjustOptionStr(o, vf, sd));
      if (w2.part1) {
        w2.part1 = typeof w2.part1 === 'string'
          ? adjustSpeedInStr(w2.part1, sd)
          : { ...w2.part1,
              sets:    adjustSetsStr(w2.part1.sets, vf),
              speed:   adjustSpeedInStr(w2.part1.speed, sd),
              options: w2.part1.options?.map(o => adjustOptionStr(o, vf, sd)) };
      }
      if (isShort) {
        w2.part2   = null;
        w2.strides = null;
        if (w2.mobility) w2.mobility = w2.mobility.slice(0, 2);
        if (w2.rounds != null) w2.rounds = Math.min(w2.rounds, 2);
      } else if (w2.part2) {
        w2.part2 = typeof w2.part2 === 'string'
          ? adjustSpeedInStr(w2.part2, sd)
          : { ...w2.part2,
              sets:    adjustSetsStr(w2.part2.sets, vf),
              speed:   adjustSpeedInStr(w2.part2.speed, sd),
              options: w2.part2.options?.map(o => adjustOptionStr(o, vf, sd)) };
      }
      return w2;
    }

    // ── AUDIO ──────────────────────────────────────────────────────────────────
    const audioMuted = ref(false);
    const audioVolume = ref(parseFloat(localStorage.getItem('onitio_volume') || '0.7'));
    let _audioCtx = null;

    function getAudioCtx() {
      if (!_audioCtx) _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      return _audioCtx;
    }

    function beep(freq = 880, durationMs = 150) {
      if (audioMuted.value) return;
      try {
        const ctx = getAudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.frequency.value = freq;
        const v = audioVolume.value;
        gain.gain.setValueAtTime(v, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationMs / 1000);
        osc.start(); osc.stop(ctx.currentTime + durationMs / 1000);
      } catch (e) {}
    }

    let _preferredVoice = null;
    function _initPreferredVoice() {
      if (!window.speechSynthesis) return;
      const voices = window.speechSynthesis.getVoices();
      const nb = voices.filter(v => v.lang.startsWith('nb') || v.lang.startsWith('no'));
      if (!nb.length) return;
      nb.sort((a, b) => {
        const rank = v => v.name.includes('Online') ? 2 : v.name.includes('Microsoft') ? 1 : 0;
        return rank(b) - rank(a);
      });
      _preferredVoice = nb[0];
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.addEventListener('voiceschanged', _initPreferredVoice);
      _initPreferredVoice();
    }

    function speak(text) {
      if (audioMuted.value || !window.speechSynthesis) return;
      const utt = new SpeechSynthesisUtterance(text);
      utt.lang = 'nb-NO'; utt.rate = 1.0;
      utt.volume = audioVolume.value;
      if (_preferredVoice) utt.voice = _preferredVoice;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utt);
    }

    watch(audioVolume, v => localStorage.setItem('onitio_volume', v));

    // ── FULLSCREEN TIMER ────────────────────────────────────────────────────────
    const fullscreenTimer = ref(false);
    let _wakeLock = null;

    async function requestWakeLock() {
      try {
        if ('wakeLock' in navigator) _wakeLock = await navigator.wakeLock.request('screen');
      } catch (e) {}
    }
    function releaseWakeLock() {
      if (_wakeLock) { _wakeLock.release(); _wakeLock = null; }
    }
    function toggleFullscreenTimer(on) {
      fullscreenTimer.value = on;
      if (on) requestWakeLock();
      else releaseWakeLock();
    }

    // ── GPS ────────────────────────────────────────────────────────────────────
    const gpsEnabled = ref(false);
    const gpsActive = ref(false);
    const gpsPromptState = ref('idle'); // 'idle' | 'ask' | 'waiting' | 'timeout'
    const gpsWaitCountdown = ref(20);
    let _gpsWaitTimer = null;
    const gpsSpeed = ref(null);
    const gpsDistance = ref(0);
    const gpsPace = ref(null);
    const gpsSpeedSamples = ref([]);
    const mapsApiReady = ref(false);
    let _gpsWatchId = null;
    let _gpsLastPos = null;
    let _mapObj = null;
    let _mapPolyline = null;
    let _mapMarker = null;
    let _mapInitialized = false;
    let _lastKmAnnounced = 0;
    let _routeCoords = [];   // samle alle koordinater for ettertegning

    window.__mapsReady = () => { mapsApiReady.value = true; };

    function loadMapsScript() {
      if (window.google?.maps || document.getElementById('gmap-script')) return;
      const s = document.createElement('script');
      s.id = 'gmap-script';
      s.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&callback=__mapsReady`;
      s.async = true;
      document.head.appendChild(s);
    }

    function initMap(lat, lng) {
      if (_mapInitialized || !window.google?.maps) return;
      const el = document.getElementById('gps-map');
      if (!el) return;
      _mapObj = new google.maps.Map(el, {
        center: { lat, lng }, zoom: 16,
        mapTypeId: 'roadmap', disableDefaultUI: true,
        zoomControl: true, gestureHandling: 'greedy',
      });
      _mapMarker = new google.maps.Marker({
        position: { lat, lng }, map: _mapObj,
        icon: { path: google.maps.SymbolPath.CIRCLE, scale: 8, fillColor: '#2196F3', fillOpacity: 1, strokeColor: '#fff', strokeWeight: 2 },
      });
      _mapPolyline = new google.maps.Polyline({
        path: [], geodesic: true, strokeColor: '#2196F3', strokeOpacity: 0.9, strokeWeight: 4, map: _mapObj,
      });
      _mapInitialized = true;
    }

    function updateMap(lat, lng) {
      if (!_mapObj || !_mapMarker || !_mapPolyline) return;
      const pos = { lat, lng };
      _mapMarker.setPosition(pos);
      _mapObj.panTo(pos);
      _mapPolyline.getPath().push(new google.maps.LatLng(lat, lng));
    }

    const gpsAvgSpeed = computed(() => {
      const s = gpsSpeedSamples.value.filter(v => v > 0.5);
      if (!s.length) return null;
      return Math.round((s.reduce((a, b) => a + b, 0) / s.length) * 10) / 10;
    });

    function haversineKm(lat1, lon1, lat2, lon2) {
      const R = 6371, toRad = x => x * Math.PI / 180;
      const dLat = toRad(lat2 - lat1), dLon = toRad(lon2 - lon1);
      const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLon/2)**2;
      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    function startGps() {
      if (!navigator.geolocation) return;
      gpsDistance.value = 0; _gpsLastPos = null; gpsActive.value = false;
      gpsSpeedSamples.value = [];
      _routeCoords = [];
      _mapInitialized = false; _mapObj = null; _mapPolyline = null; _mapMarker = null;
      _lastKmAnnounced = 0;
      _gpsWatchId = navigator.geolocation.watchPosition(
        (pos) => {
          const { latitude: lat, longitude: lng, speed } = pos.coords;
          gpsActive.value = true;
          _routeCoords.push({ lat, lng });
          gpsSpeed.value = speed != null ? Math.round(speed * 3.6 * 10) / 10 : null;
          if (_gpsLastPos) {
            const d = haversineKm(_gpsLastPos.lat, _gpsLastPos.lng, lat, lng);
            if (d < 0.3) gpsDistance.value += d;
          }
          _gpsLastPos = { lat, lng };
          if (gpsSpeed.value && gpsSpeed.value > 0.5) {
            gpsPace.value = Math.round(3600 / gpsSpeed.value);
            if (timerState.value === 'work') gpsSpeedSamples.value.push(gpsSpeed.value);
          }
          if (!_mapInitialized) { /* kart tegnes ved done */ }
          // Per-KM voice announcement
          const kmNow = Math.floor(gpsDistance.value);
          if (kmNow > _lastKmAnnounced && gpsDistance.value >= 0.95) {
            _lastKmAnnounced = kmNow;
            const speedTxt = gpsSpeed.value ? `. Fart ${String(gpsSpeed.value).replace('.', ' komma')} kilometer i timen` : '';
            const paceTxt = gpsPace.value ? (() => { const m = Math.floor(gpsPace.value/60), s = gpsPace.value%60; return `. Tempo ${m}:${String(s).padStart(2,'0')} per kilometer`; })() : '';
            speak(`${kmNow} kilometer${speedTxt}${paceTxt}`);
          }
        },
        () => { gpsActive.value = false; },
        { enableHighAccuracy: true, maximumAge: 1000, timeout: 15000 }
      );
    }

    function stopGps() {
      if (_gpsWatchId != null) navigator.geolocation.clearWatch(_gpsWatchId);
      _gpsWatchId = null; gpsActive.value = false;
    }

    function toggleGps() {
      gpsEnabled.value = !gpsEnabled.value;
      if (gpsEnabled.value) startGps();
      else stopGps();
    }

    // ── OCR GPS LAP TRACKER ─────────────────────────────────────────────────────
    const lapStartDist  = ref(0);
    const lapHistory    = ref([]);
    const savedCourseLengthM = ref(parseInt(localStorage.getItem('onitio_course_m') || '0') || null);
    const lapDist = computed(() => Math.round((gpsDistance.value - lapStartDist.value) * 1000));

    function recordLap() {
      lapHistory.value.push(lapDist.value);
      lapStartDist.value = gpsDistance.value;
    }
    function resetLaps() {
      lapHistory.value = [];
      lapStartDist.value = gpsDistance.value;
    }
    function saveCourseLengthM() {
      const m = lapDist.value;
      if (m > 10) {
        savedCourseLengthM.value = m;
        localStorage.setItem('onitio_course_m', String(m));
      }
    }

    function formatPace(secPerKm) {
      if (!secPerKm) return '–';
      return `${Math.floor(secPerKm/60)}:${String(secPerKm%60).padStart(2,'0')} /km`;
    }

    function formatDist(km) {
      if (km < 1) return Math.round(km * 1000) + ' m';
      return km.toFixed(2) + ' km';
    }


    // ── REST TIMER (pauseteller mellom styrkeøvelser) ─────────────────────
    const restTimer = ref({ active: false, remaining: 0, total: 0, exerciseName: '' });
    let _restInterval = null;

    // ── WORK TIMER (nedtelling under tidsbaserte øvelser) ─────────────────
    const PREP_SECS = 10;
    const workTimer = ref({ active: false, phase: 'prep', remaining: 0, total: 0, setIdx: null, exName: null, tickId: null });
    const workTimerDone = ref(false);

    function startWorkTimer(seconds, exName, setIdx, restSec, onComplete) {
      cancelWorkTimer();
      const secs = Math.max(1, Math.round(+seconds || 30));
      let phase = 'prep';
      let remaining = PREP_SECS;

      beep(440, 80); setTimeout(() => beep(440, 80), 120);
      toggleFullscreenTimer(true);

      workTimer.value = { active: true, phase: 'prep', remaining: PREP_SECS, total: PREP_SECS, setIdx, exName, tickId: null };

      const tickId = setInterval(() => {
        remaining--;

        if (phase === 'prep') {
          workTimer.value.remaining = remaining;
          if (remaining === 3) beep(660, 120);
          else if (remaining === 2) beep(660, 120);
          else if (remaining === 1) beep(660, 120);
          if (remaining <= 0) {
            phase = 'work';
            remaining = secs;
            beep(880, 80); setTimeout(() => beep(1100, 200), 100);
            workTimer.value = { active: true, phase: 'work', remaining: secs, total: secs, setIdx, exName, tickId };
          }
        } else {
          workTimer.value.remaining = remaining;
          const half = Math.ceil(secs / 2);
          if (remaining === half)            { beep(880, 100); setTimeout(() => beep(880, 100), 150); speak('Halvveis!'); }
          if (remaining === 10 && secs > 15)   beep(660, 200);
          if      (remaining === 3) { beep(660, 120); speak('Tre'); }
          else if (remaining === 2) { beep(660, 120); speak('To'); }
          else if (remaining === 1) { beep(660, 120); speak('En'); }
          if (remaining <= 0) {
            clearInterval(tickId);
            workTimer.value.active = false;
            workTimerDone.value = true;
            beep(880, 200); setTimeout(() => beep(1100, 300), 220);
            speak('Bra jobbet!');
            setTimeout(() => {
              workTimerDone.value = false;
              toggleFullscreenTimer(false);
              const sets = currentExerciseSets.value[exName];
              if (sets?.[setIdx]) {
                if (onComplete) {
                  onComplete();
                } else {
                  sets[setIdx].done = true;
                  if (restSec > 0) startRestTimer(restSec, exName);
                  triggerLenaToast();
                }
              }
            }, 2500);
          }
        }
      }, 1000);

      workTimer.value.tickId = tickId;
    }

    function cancelWorkTimer() {
      if (workTimer.value.tickId) clearInterval(workTimer.value.tickId);
      workTimer.value = { active: false, phase: 'prep', remaining: 0, total: 0, setIdx: null, exName: null, tickId: null };
      toggleFullscreenTimer(false);
    }

    function formatRestTime(sec) {
      const m = Math.floor(sec / 60), s = sec % 60;
      return m > 0 ? `${m}:${String(s).padStart(2, '0')}` : `${s}s`;
    }

    const MOTIVATION_MESSAGES = {
      lena: [
        'YOU GO GIRL! 💪✨', 'SLAY QUEEN! 👑💅', 'KILLING IT! 🔥💕',
        'YAAAS! 💃🎀', 'OMG DU ER SÅ STERK! 🏋️‍♀️', 'WERK IT BESTIE! 👊🌸',
        'TOTAL BOSS! 👸✨', 'DET HER ER DIN DAG! 🌟', 'POWERGIRRRL! 💥💗',
        'INGEN STOPPER DEG NÅ! 🚀🎀', 'SÅ PROUD OF YOU! 🥹💖', 'LETS GOOOO! 🙌🔥',
      ],
      sondre: [
        'Du kunne klart litt til! 🏃', 'Burde kanskje ha løpt litt fortere? 😏',
        'Neste gang setter du opp tempoet! ⚡', 'Du har mer i tanken, Sondre! 💨',
        'Bra gjort – men du VET du hadde mer! 🔥', 'Neste runde: gir du litt ekstra? 👊',
        'Akkurat så fort som du turte 😅', 'Komfortabelt er bra, men hardt er bedre! 💪',
        'Nesten raskeste du har vært – prøv å slå det! 🏅',
        'Hadde vært kult med litt mer drag på slutten! 🚀',
        'Solid! Neste gang vet du hva du er god for 😤',
        'Bra innsats – du stoppet akkurat ett minutt for tidlig 🤔',
      ],
      geir: [
        'Pushe litt til så blir driven ekstra lang! 🏌️',
        'Veldig bra jobba! Så kan du løpe hele golfrunden! ⛳🏃',
        'Drivetrening i skjul – neste slag går lengre! 🏌️‍♂️',
        'Kondisen din spiser birdie til frokost! 🐦⛳',
        'Sånn trener de proffene på PGA Tour! 🏆',
        'Legger du til dette hvert sett, er du over 300 yards! 💪',
        'Under par på trening – under par på banen! 🥇',
        'Neste golfrunde: 18 hull, ingen problemer! 🚶‍♂️⛳',
        'Driver blir lengre for hvert steg du tar! 🏌️💨',
        'Ace på trening – eagle på banen! 🦅',
        'Bra jobba! Runden din blir kortere for hvert sett! ⏱️⛳',
        'Nå bygger vi golfmuskler med turbotrening! 🔥',
      ],
      kjetil: [
        'Se der ja! Litt tungt kanskje, men ferdig er ferdig! 🤷',
        'Det var det som sto i programmet, så må jo være bra nok det! 📋',
        'Ikke verst for et program ingen valgte selv 😅',
        'Krysse av i skjemaet – dette teller! ✅',
        'Akkurat passe tungt til at det teller som trening 💪',
        'Gjort er bedre enn perfekt – og du er ferdig! 🏁',
        'Godt du holdt ut – det var jo litt vel mange reps der 😬',
        'Programmet sa det, du gjorde det. Enkelt! 🤝',
        'Bra! Og du trengte ikke like det heller 😤',
        'Tung dag, men tunge dager gir fremgang. Nesten sikkert 🔬',
        'Se der ja! Ikke sikkert du likte det, men du GJORDE det! 👍',
        'Helt etter planen – selv om planen var hard 📝',
      ],
      knut: [
        'BEVEG DEG SOLDAT! 🪖', 'SMERTE ER SVAKHET SOM FORLATER KROPPEN! 💀',
        'RASKERE! DU BEVEGER DEG SOM EN SLITEN SNEGL! 🐌',
        'SLUTT Å KLAGE OG BEGYNN Å LØFTE! 🏋️',
        'DET ER IKKE TID FOR HVILE NÅ, SOLDAT! ⏰',
        'JEG HAR SETT BEDRE INNSATS FRA BESTEFORELDRE! 👴',
        'DET DER KALLER DU EN INNSATS?! KOM IGJEN! 😤',
        'SMIL ER FORBUDT TIL ALLE REP ER FERDIG! 😠',
        'DEN SÅ NESTEN UT SOM EN SKIKKELIG ØVELSE! 💪',
        'HVILE ER BARE FOR DE SVAKE! NESTE SETT NÅ! ⚔️',
        'KROPPEN LYVER – DU HAR MER! PUSH! 🔥',
        'HUSKER DU HVORFOR DU ER HER? NEI? LØFT TYNGRE! 🎯',
      ],
    };
    const motivationToast = ref(null);
    let _motivationToastTimer = null;
    let _lastMotivationMsg = null;

    function triggerLenaToast() {
      const msgs = MOTIVATION_MESSAGES[selectedAthlete.value];
      if (!msgs) return;
      if (_motivationToastTimer) clearTimeout(_motivationToastTimer);
      const pool = msgs.length > 1 ? msgs.filter(m => m !== _lastMotivationMsg) : msgs;
      const msg = pool[Math.floor(Math.random() * pool.length)];
      _lastMotivationMsg = msg;
      motivationToast.value = msg;
      _motivationToastTimer = setTimeout(() => { motivationToast.value = null; }, 2500);
    }

    function completeSet(s, restSec, exName) {
      s.done = true;
      startRestTimer(restSec, exName);
      triggerLenaToast();
    }

    // ── CIRCUIT TRAINING ───────────────────────────────────────────────────────
    const circuitSettings = ref({ stationSec: 60, transitionSec: 15, roundRestSec: 120, rounds: 3 });

    const _circuitSettingsKey = computed(() =>
      `onitio_circuit_${selectedAthlete.value}_${selectedSession.value?.key ?? 'default'}`
    );

    function loadCircuitSettings() {
      const wo = displayedWorkout.value;
      if (!wo?.circuitMode) return;
      const defaults = {
        stationSec:    wo.stationSec    ?? 60,
        transitionSec: wo.transitionSec ?? 15,
        roundRestSec:  wo.roundRestSec  ?? 120,
        rounds:        wo.rounds        ?? 3,
      };
      const saved = JSON.parse(localStorage.getItem(_circuitSettingsKey.value) || 'null');
      circuitSettings.value = saved ? { ...defaults, ...saved } : { ...defaults };
    }

    function saveCircuitSettings() {
      localStorage.setItem(_circuitSettingsKey.value, JSON.stringify(circuitSettings.value));
    }

    function completeCircuitStation(ex, setIdx) {
      const set = currentExerciseSets.value[ex.name]?.[setIdx];
      if (!set || set.done) return;
      set.done = true;
      triggerLenaToast();

      const wo = displayedWorkout.value;
      const stations = wo?.exercises_raw ?? [];
      const numStations = stations.length;
      const numRounds   = circuitSettings.value.rounds;
      const stIdx       = stations.findIndex(s => s.name === ex.name);
      const isLastStation = stIdx === numStations - 1;
      const isLastRound   = setIdx === numRounds - 1;

      if (isLastStation && isLastRound) {
        beep(880, 200); setTimeout(() => beep(1100, 300), 220);
        speak('Treningsøkt fullført! Bra jobbet!');
      } else if (isLastStation) {
        const nextName = stations[0].speakName || stations[0].name;
        startRestTimer(
          circuitSettings.value.roundRestSec,
          `Runde ${setIdx + 1} ferdig`,
          `Runde ${setIdx + 1} fullført! Neste: ${nextName}`
        );
      } else {
        const nextSt = stations[stIdx + 1];
        const nextName = nextSt.speakName || nextSt.name;
        startRestTimer(circuitSettings.value.transitionSec, nextSt.name, `Neste: ${nextName}`);
      }
    }

    function startRestTimer(sec, name, startSpeech) {
      cancelRestTimer();
      restTimer.value = { active: true, remaining: sec, total: sec, exerciseName: name };
      speak(startSpeech ?? `Pause – ${sec >= 60 ? Math.floor(sec/60) + ' minutt' : sec + ' sekunder'}`);
      _restInterval = setInterval(() => {
        restTimer.value.remaining--;
        const r = restTimer.value.remaining;
        if (r === 10) speak('Ti sekunder');
        if (r === 3) beep(660, 120);
        else if (r === 2) beep(660, 120);
        else if (r === 1) beep(660, 120);
        if (r <= 0) {
          cancelRestTimer();
          beep(880, 200); setTimeout(() => beep(1100, 300), 220);
          speak('Klar!');
        }
      }, 1000);
    }

    function cancelRestTimer() {
      if (_restInterval) { clearInterval(_restInterval); _restInterval = null; }
      restTimer.value = { active: false, remaining: 0, total: 0, exerciseName: '' };
    }

    function extractTimerConfig(workout) {
      if (!workout) return { count: 8, workSec: 60, restSec: 60 };
      const toSec = (n, u) => u === 'min' ? n * 60 : n;

      // Phase 2: part1 has sets and rest
      if (workout.part1?.sets) {
        const m = workout.part1.sets.match(/(\d+)[×x](\d+)\s*(sek|min)?/);
        const r = (workout.part1.rest || '').match(/(\d+)\s*(sek|min)/);
        if (m) return {
          count: +m[1],
          workSec: toSec(+m[2], m[3] || 'sek'),
          restSec: r ? toSec(+r[1], r[2]) : 45,
        };
      }
      // Phase 1: options string "8×2 min @ ... · 1 min pause"
      const src = workout.options?.[0] || '';
      const m = src.match(/(\d+)[×x](\d+)\s*(min|sek)/);
      const r = src.match(/(\d+)\s*(min|sek)\s*pause/);
      if (m) return {
        count: +m[1],
        workSec: toSec(+m[2], m[3]),
        restSec: r ? toSec(+r[1], r[2]) : 60,
      };
      return { count: 8, workSec: 60, restSec: 60 };
    }

    // ── TIMER STATE ────────────────────────────────────────────────────────
    const timerState = ref('config'); // config | warmup | work | rest | done
    const timerPhase = ref(0);        // current interval number (1-based)
    const timerSec = ref(0);
    const timerElapsed = ref(0);      // seconds elapsed in current phase
    const timerResults = ref([]);
    const timerTick = ref(null);
    const timerConfig = ref({ count: 8, workSec: 60, restSec: 60 });
    const timerEditing = ref(false);

    const timerPct = computed(() => {
      const total = timerState.value === 'work' ? timerConfig.value.workSec
                  : timerState.value === 'rest' ? timerConfig.value.restSec
                  : timerState.value === 'warmup' ? 10 : 1;
      return Math.round((1 - timerSec.value / total) * 100);
    });

    function formatSec(s) {
      const m = Math.floor(s / 60), sec = s % 60;
      return `${m}:${String(sec).padStart(2,'0')}`;
    }

    function stopTick() { if (timerTick.value) { clearInterval(timerTick.value); timerTick.value = null; } }

    function startTimer() {
      // If GPS is already active, go straight to countdown
      if (gpsActive.value) { _launchTimer(); return; }
      // Otherwise ask user if they want GPS
      gpsPromptState.value = 'ask';
    }

    function gpsPromptChoose(withGps) {
      if (!withGps) { gpsEnabled.value = false; gpsPromptState.value = 'idle'; _launchTimer(); return; }
      gpsEnabled.value = true;
      gpsPromptState.value = 'waiting';
      gpsWaitCountdown.value = 20;
      startGps();
      // Watch for first GPS fix
      const unwatch = watch(gpsActive, (active) => {
        if (!active) return;
        unwatch(); clearInterval(_gpsWaitTimer); _gpsWaitTimer = null;
        gpsPromptState.value = 'idle';
        _launchTimer();
      });
      _gpsWaitTimer = setInterval(() => {
        gpsWaitCountdown.value--;
        if (gpsWaitCountdown.value <= 0) {
          clearInterval(_gpsWaitTimer); _gpsWaitTimer = null;
          unwatch();
          gpsPromptState.value = 'timeout';
        }
      }, 1000);
    }

    function gpsTimeoutChoose(continueAnyway) {
      gpsPromptState.value = 'idle';
      if (!continueAnyway) { stopGps(); gpsEnabled.value = false; }
      _launchTimer();
    }

    function _launchTimer() {
      const cfg = extractTimerConfig(selectedWorkout.value);
      timerConfig.value = { ...cfg };
      timerResults.value = [];
      timerPhase.value = 0;
      timerState.value = 'warmup';
      timerSec.value = 15;
      timerElapsed.value = 0;
      stopTick();
      speak('Gjør deg klar');
      timerTick.value = setInterval(() => {
        timerSec.value--;
        timerElapsed.value++;
        const s = timerSec.value;
        // 3-2-1 countdown beeps for any phase
        if (s === 3) beep(660, 120);
        else if (s === 2) beep(660, 120);
        else if (s === 1) beep(660, 120);
        // 10-second warning (work/rest phases only)
        if (s === 10 && timerState.value !== 'warmup') speak('Ti sekunder');
        // Halfway through work phase + periodic speed update for long intervals
        if (timerState.value === 'work') {
          const half = Math.round(timerConfig.value.workSec / 2);
          if (s === half && timerConfig.value.workSec >= 20) {
            const speedNote = gpsEnabled.value && gpsSpeed.value ? ` – ${gpsSpeed.value} km/t` : '';
            speak(`Halvveis${speedNote}`);
          }
          // Every 30s speed update for intervals longer than 90s
          if (timerConfig.value.workSec >= 90 && timerElapsed.value > 0 && timerElapsed.value % 30 === 0) {
            if (gpsEnabled.value && gpsSpeed.value) speak(`${String(gpsSpeed.value).replace('.', ' komma')} kilometer i timen`);
          }
        }
        if (timerSec.value <= 0) advanceTimer(false);
      }, 1000);
    }

    function advanceTimer(early) {
      const elapsed = timerConfig.value.workSec - timerSec.value;
      if (timerState.value === 'warmup') {
        timerState.value = 'work';
        timerPhase.value = 1;
        timerSec.value = timerConfig.value.workSec;
        timerElapsed.value = 0;
        beep(880, 200); setTimeout(() => beep(1100, 300), 220);
        const targetNote = intervalTargetSpeed.value ? ` – mål ${intervalTargetSpeed.value}` : '';
        speak(`Start${targetNote}`);
      } else if (timerState.value === 'work') {
        timerResults.value.push({
          n: timerPhase.value,
          sec: early ? elapsed : timerConfig.value.workSec,
          early,
        });
        if (timerPhase.value >= timerConfig.value.count) {
          timerState.value = 'done'; stopTick();
          if (gpsEnabled.value) stopGps();
          beep(880, 150); setTimeout(() => beep(1100, 150), 180); setTimeout(() => beep(1320, 400), 360);
          const avgNote = gpsAvgSpeed.value ? ` Snittfart ${String(gpsAvgSpeed.value).replace('.', ' komma')} km/t.` : '';
          speak(`Ferdig! ${timerConfig.value.count} drag gjennomført.${avgNote}`);
          if (gpsAvgSpeed.value) {
            workoutMetrics.value = { ...workoutMetrics.value, speed_kmh: gpsAvgSpeed.value };
          }
        } else {
          timerState.value = 'rest';
          timerSec.value = timerConfig.value.restSec;
          timerElapsed.value = 0;
          beep(440, 300);
          const restSec = timerConfig.value.restSec;
          const restTxt = restSec >= 60 ? `${Math.floor(restSec/60)} minutt` : `${restSec} sekunder`;
          speak(`Pause – neste drag om ${restTxt}`);
        }
      } else if (timerState.value === 'rest') {
        timerPhase.value++;
        timerState.value = 'work';
        timerSec.value = timerConfig.value.workSec;
        timerElapsed.value = 0;
        beep(880, 200); setTimeout(() => beep(1100, 300), 220);
        const isLast = timerPhase.value >= timerConfig.value.count;
        speak(isLast ? `Siste drag! Alt du har!` : `Drag ${timerPhase.value}`);
      }
    }

    function endIntervalEarly() { advanceTimer(true); }

    function pauseTimer() {
      if (timerTick.value) { stopTick(); }
      else {
        timerTick.value = setInterval(() => {
          timerSec.value--;
          if (timerSec.value <= 0) advanceTimer(false);
        }, 1000);
      }
    }

    function resetTimer() { stopTick(); stopGps(); timerState.value = 'config'; timerResults.value = []; }

    const isPaused = computed(() => timerState.value !== 'config' && timerState.value !== 'done' && !timerTick.value);

    const selectedStrengthDay = computed(() =>
      selectedStrengthKey.value ? STRENGTH_PROGRAM.days[selectedStrengthKey.value] : null
    );

    const selectedLibrarySession = computed(() =>
      selectedLibraryKey.value ? LIBRARY_SESSIONS[selectedLibraryKey.value] : null
    );

    // The active cardio session: either a free library session or the scheduled session
    const effectiveCardioSession = computed(() =>
      selectedLibrarySession.value || selectedSession.value
    );

    const displayedWorkout = computed(() => {
      if (selectedLibraryKey.value) {
        const libSess = selectedLibrarySession.value;
        if (!libSess) return null;
        const raw = replaceTokensDeep(libSess.common, athleteLevels.value);
        return adjustWorkout(raw, dagsform.value, deloadMode.value, shortMode.value);
      }
      if (selectedStrengthKey.value) {
        const sd = selectedStrengthDay.value;
        if (!sd) return null;
        let exs = sd.exercises.map(ex => ({ ...ex }));
        // Apply dagsform/deload adjustments to strength exercises
        let setFactor = 1;
        if (deloadMode.value)            setFactor *= 0.5;
        if (dagsform.value === 'yellow') setFactor *= 0.8;
        if (dagsform.value === 'red')    setFactor *= 0.5;
        if (setFactor !== 1) {
          exs = exs.map(ex => ({ ...ex, sets: Math.max(1, Math.round(ex.sets * setFactor)) }));
        }
        return { exercises_raw: exs.map(ex => ({ ...ex, tags: getExTags(ex) })) };
      }
      const workout = adjustWorkout(selectedWorkout.value, dagsform.value, deloadMode.value, shortMode.value);
      // Circuit mode: Grep & bæring og lignende sirkeltrening
      if (selectedSession.value?.type === 'strength' && workout?.circuitMode && workout?.stations?.length) {
        const stationsRaw = workout.stations.map(s => ({
          name: s.name, note: s.note || null,
          sets: workout.rounds ?? 3,
          reps: s.reps != null ? String(s.reps) : null,
          time: s.time != null ? String(s.time) : null,
          weight: null,
          restSec: workout.transitionSec ?? 15,
          tags: getExTags({ name: s.name, time: s.time }),
          speakName: s.speakName || s.name,
          circuitStation: true,
        }));
        return { ...workout, exercises_raw: stationsRaw };
      }
      // Circuit/program.js strength sessions: build exercises_raw so per-set UI can be used
      if (selectedSession.value?.type === 'strength' && workout?.exercises?.length) {
        const parsed = parseExercises(workout.exercises)
          .filter(ex => ex.sets && ex.name)
          .map(ex => ({ ...ex, restSec: ex.restSec ?? 60, tags: getExTags(ex) }));
        if (parsed.length) return { ...workout, exercises_raw: parsed };
      }
      return workout;
    });

    const circuitRounds = computed(() => {
      const wo = displayedWorkout.value;
      if (!wo?.circuitMode || !wo.exercises_raw?.length) return null;
      const stations = wo.exercises_raw;
      const numRounds = circuitSettings.value.rounds;
      return Array.from({ length: numRounds }, (_, r) => ({
        roundNum: r + 1,
        stations: stations.map(ex => ({
          ex, setIdx: r,
          set: currentExerciseSets.value[ex.name]?.[r],
        })),
      }));
    });

    const circuitStatus = computed(() => {
      const rounds = circuitRounds.value;
      if (!rounds) return null;
      let done = 0, total = 0;
      rounds.forEach(r => r.stations.forEach(s => { total++; if (s.set?.done) done++; }));
      return { totalRounds: rounds.length, stationsPerRound: rounds[0]?.stations.length ?? 0, done, total };
    });

    const circuitCurrentRound = computed(() => {
      const rounds = circuitRounds.value;
      if (!rounds) return 0;
      const idx = rounds.findIndex(r => !r.stations.every(s => s.set?.done));
      return idx >= 0 ? idx : rounds.length - 1;
    });


    // ── PER-ACTIVITY LOGGING (intervals/recovery) ─────────────────────────
    function parseActivityPart(id, part, isIntervals) {
      const text = typeof part === 'string'
        ? part
        : [part.machine, part.sets, part.speed, part.incline, part.rest].filter(Boolean).join(' · ');
      const machM = text.match(/^([A-ZÆØÅa-zæøå]+(?:[\s-][A-ZÆØÅa-zæøå]+)?)/);
      const machine = machM ? machM[1] : (id === 'st' ? 'Strides' : id.toUpperCase());
      const mid = (a, b) => b != null ? Math.round(((+a + +b) / 2) * 10) / 10 : +a;
      const durM  = text.match(/(\d+)(?:–(\d+))?\s*min/);
      const spdM  = text.match(/(\d+\.?\d*)(?:–(\d+\.?\d*))?\s*km\/?t/i);
      const inclM = text.match(/(\d+\.?\d*)(?:–(\d+\.?\d*))?\s*%/);
      const setsM = text.match(/(\d+)×/);
      const fields = [];
      if (setsM || isIntervals)
        fields.push({ key: id+'_sets', label: isIntervals ? 'Drag fullført' : 'Drag', unit: 'stk', integer: true, defaultVal: setsM ? +setsM[1] : null });
      fields.push({ key: id+'_dur', label: 'Varighet', unit: 'min', integer: true, defaultVal: durM ? mid(durM[1], durM[2]) : null });
      if (spdM)  fields.push({ key: id+'_spd',  label: 'Fart',     unit: 'km/t', step: 0.1, defaultVal: mid(spdM[1],  spdM[2])  });
      if (inclM) fields.push({ key: id+'_incl', label: 'Stigning', unit: '%',    step: 0.5, defaultVal: mid(inclM[1], inclM[2]) });
      return { id, machine, planText: text, fields };
    }

    const activityCards = computed(() => {
      const wo = displayedWorkout.value;
      const sess = effectiveCardioSession.value;
      if (!wo || !sess) return [];
      if (selectedStrengthKey.value || sess.type === 'strength' || sess.type === 'ocr') return [];
      const isInt = sess.type === 'intervals';
      const cards = [];
      if (wo.options?.length) {
        wo.options.forEach((opt, i) => {
          const c = parseActivityPart('opt' + i, opt, isInt);
          c.optLabel = ['A', 'B', 'C'][i];
          cards.push(c);
        });
      } else {
        if (wo.part1) cards.push(parseActivityPart('p1', wo.part1, isInt));
        if (wo.part2) cards.push(parseActivityPart('p2', wo.part2, false));
        if (wo.strides) cards.push(parseActivityPart('st', wo.strides, false));
      }
      return cards;
    });

    // ── PER-STEP LOGGING (OCR circuit) ────────────────────────────────────
    function parseCircuitStep(stepText, idx) {
      const t = stepText;
      const p = 'cs' + idx + '_';
      const mid = (a, b) => b != null ? Math.round(((+a + +b) / 2) * 10) / 10 : +a;
      const distM = t.match(/(\d+)(?:–(\d+))?\s*m(?!\w)/i);
      const inclM = t.match(/(\d+(?:\.\d+)?)(?:–(\d+(?:\.\d+)?))?\s*%/);
      const spdM  = t.match(/(\d+(?:\.\d+)?)(?:–(\d+(?:\.\d+)?))?\s*km\/?t/i);
      const sekM  = t.match(/(\d+)(?:–(\d+))?\s*sek/i);
      const kgM   = t.match(/(\d+(?:\.\d+)?)(?:–(\d+(?:\.\d+)?))?\s*kg/);
      const fields = [];
      if (/hang/i.test(t)) {
        fields.push({ key: p+'sek', label: 'Hang', unit: 'sek', step: 5,
          defaultVal: sekM ? mid(sekM[1], sekM[2]) : 60, isTimed: true });
      } else if (/carry/i.test(t)) {
        if (distM) fields.push({ key: p+'dist', label: 'Distanse', unit: 'm', step: 10, defaultVal: mid(distM[1], distM[2]) });
        else if (sekM) fields.push({ key: p+'sek', label: 'Tid', unit: 'sek', step: 5, defaultVal: mid(sekM[1], sekM[2]) });
        fields.push({ key: p+'kg', label: 'Vekt', unit: 'kg', step: 2.5, defaultVal: kgM ? mid(kgM[1], kgM[2]) : null });
      } else if (distM && (inclM || spdM)) {
        fields.push({ key: p+'dist', label: 'Distanse', unit: 'm', step: 50, defaultVal: mid(distM[1], distM[2]) });
        if (inclM) fields.push({ key: p+'incl', label: 'Stigning', unit: '%',    step: 0.5, defaultVal: mid(inclM[1], inclM[2]) });
        if (spdM)  fields.push({ key: p+'spd',  label: 'Fart',     unit: 'km/t', step: 0.1, defaultVal: mid(spdM[1], spdM[2]) });
      } else {
        // Count-based: "10 burpees", "10 burpees + 10 goblet squats", etc.
        const parts = t.split(/\s*\+\s*/);
        for (const [j, part] of parts.entries()) {
          const cM = part.trim().match(/^(\d+)\s+(.+)/);
          if (cM) {
            const raw = cM[2].trim();
            const label = raw.charAt(0).toUpperCase() + raw.slice(1);
            fields.push({ key: p+'reps'+j, label, unit: 'stk', integer: true, defaultVal: +cM[1] });
            const kgPartM = part.match(/\((\d+(?:\.\d+)?)\s*kg\)/);
            if (kgPartM) fields.push({ key: p+'kg'+j, label: 'Vekt', unit: 'kg', step: 2.5, defaultVal: +kgPartM[1] });
          }
        }
        if (!fields.length) fields.push({ key: p+'note', label: t, unit: '', defaultVal: null });
      }
      return { stepText: t, fields };
    }

    const circuitStepCards = computed(() => {
      const circuit = displayedWorkout.value?.circuit;
      if (!circuit?.length) return [];
      return circuit.map((step, i) => parseCircuitStep(step, i));
    });

    const displayedTitle = computed(() =>
      selectedStrengthDay.value?.title || selectedLibrarySession.value?.title || selectedSession.value?.title
    );

    const displayedDuration = computed(() => {
      if (shortMode.value) return '20 min';
      if (selectedStrengthDay.value) return selectedStrengthDay.value.duration;
      return selectedLibrarySession.value?.duration || selectedSession.value?.duration;
    });

    const showTimer = computed(() => {
      if (selectedStrengthKey.value) return false;
      return effectiveCardioSession.value?.type === 'intervals';
    });

    const intervalTargetSpeed = computed(() => {
      if (effectiveCardioSession.value?.type !== 'intervals') return null;
      const w = selectedWorkout.value;
      const src = w?.part1?.speed || w?.options?.[0] || '';
      const m = src.match(/(\d+\.?\d*)\s*[–\-]\s*(\d+\.?\d*)\s*km/);
      if (m) return `${m[1]} til ${m[2]} kilometer i timen`;
      const m2 = src.match(/(\d+\.?\d*)\s*km/);
      if (m2) return `${m2[1]} kilometer i timen`;
      return null;
    });

    // ── OUTDOOR RUN TIMER ──────────────────────────────────────────────────
    const outdoorState    = ref('idle'); // 'idle' | 'countdown' | 'warmup' | 'main' | 'done'
    const outdoorWarmupMin  = ref(10);
    const outdoorWarmupKm   = ref(1.0);
    const outdoorWarmupType = ref('time'); // 'time' | 'distance'
    const outdoorMainMin    = ref(30);
    const outdoorElapsed    = ref(0);
    const outdoorCountdown  = ref(15);
    let _outdoorTick = null;

    function parseMinFromDuration(durStr) {
      if (!durStr) return 30;
      const m = durStr.match(/(\d+)(?:–(\d+))?\s*min/);
      if (!m) return 30;
      return m[2] ? Math.round((+m[1] + +m[2]) / 2) : +m[1];
    }

    function outdoorFormatElapsed(sec) {
      const m = Math.floor(sec / 60);
      const s = sec % 60;
      return `${m}:${String(s).padStart(2, '0')}`;
    }

    function transitionToMain() {
      outdoorState.value = 'main';
      outdoorElapsed.value = 0;
      beep(880, 200); setTimeout(() => beep(1100, 300), 220);
      speak(`Oppvarming ferdig – start hoveddelen. ${outdoorMainMin.value} minutter.`);
    }

    function startOutdoorTimer() {
      if (!gpsEnabled.value) toggleGps();
      outdoorState.value = 'countdown';
      outdoorCountdown.value = 15;
      outdoorElapsed.value = 0;
      speak('Gjør deg klar');
      _outdoorTick = setInterval(() => {
        if (outdoorState.value === 'countdown') {
          outdoorCountdown.value--;
          if ([3,2,1].includes(outdoorCountdown.value)) beep(660, 120);
          if (outdoorCountdown.value <= 0) {
            outdoorState.value = 'warmup';
            outdoorElapsed.value = 0;
            beep(880, 200); setTimeout(() => beep(1100, 300), 220);
            const desc = outdoorWarmupType.value === 'time'
              ? `${outdoorWarmupMin.value} minutters oppvarming`
              : `${outdoorWarmupKm.value} kilometer oppvarming`;
            speak(`Start – ${desc}`);
          }
        } else if (outdoorState.value === 'warmup') {
          outdoorElapsed.value++;
          const e = outdoorElapsed.value;
          if (outdoorWarmupType.value === 'time') {
            const total = outdoorWarmupMin.value * 60;
            if (e === Math.floor(total / 2)) speak('Halvveis i oppvarming – senk farten litt');
            if (e >= total) transitionToMain();
          } else {
            if (gpsDistance.value >= outdoorWarmupKm.value) transitionToMain();
          }
        } else if (outdoorState.value === 'main') {
          outdoorElapsed.value++;
          const e = outdoorElapsed.value;
          const total = outdoorMainMin.value * 60;
          if (gpsSpeed.value && gpsSpeed.value > 0.5) gpsSpeedSamples.value.push(gpsSpeed.value);
          if (e === Math.floor(total / 2)) {
            const speedNote = gpsSpeed.value ? ` Fart ${gpsSpeed.value} km/t.` : '';
            speak(`Halvveis i hoveddelen.${speedNote}`);
          }
          if (e >= total) {
            outdoorState.value = 'done';
            clearInterval(_outdoorTick); _outdoorTick = null;
            beep(880, 150); setTimeout(() => beep(1100, 150), 180); setTimeout(() => beep(1320, 400), 360);
            const distNote = gpsDistance.value > 0.1 ? ` ${formatDist(gpsDistance.value)} løpt.` : '';
            const avgNote = gpsAvgSpeed.value ? ` Snittfart ${gpsAvgSpeed.value} km/t.` : '';
            speak(`Ferdig! Bra jobbet!${distNote}${avgNote}`);
          }
        }
      }, 1000);
    }

    function resetOutdoorTimer() {
      clearInterval(_outdoorTick); _outdoorTick = null;
      outdoorState.value = 'idle';
      outdoorElapsed.value = 0;
      outdoorCountdown.value = 15;
    }

    function prefillTimerConfig() {
      if (effectiveCardioSession.value?.type !== 'intervals') return;
      const w = displayedWorkout.value;
      const src = w?.part1?.sets || w?.options?.[0] || '';
      const setsM   = src.match(/(\d+)[×x]/);
      const secM    = src.match(/(\d+)\s*sek/);
      const restSrc = w?.part1?.rest || '';
      const restSecM = restSrc.match(/(\d+)\s*sek/);
      const restMinM = restSrc.match(/(\d+)\s*min/);
      timerConfig.value = {
        count:   setsM    ? +setsM[1]    : timerConfig.value.count,
        workSec: secM     ? +secM[1]     : timerConfig.value.workSec,
        restSec: restSecM ? +restSecM[1] : restMinM ? +restMinM[1] * 60 : timerConfig.value.restSec,
      };
    }
    function resolveWorkout(session, athleteId) {
      if (!session) return null;
      if (isOutdoor.value && session.outdoor) {
        const src = session.outdoor;
        // Athlete-map format (e.g. {sondre:{...}, knut:{...}}) vs direct workout object
        const isAthleteMap = src.sondre !== undefined || src.knut !== undefined || src.geir !== undefined;
        if (isAthleteMap) {
          const raw = src[athleteId];
          if (raw === null || raw === undefined) return session.common;
          if (typeof raw === 'string') {
            const resolved = src[raw];
            return (resolved === null || resolved === undefined) ? session.common : resolved;
          }
          return raw;
        }
        return src;
      }
      const raw = session.athletes?.[athleteId];
      if (raw === null || raw === undefined) return session.common;
      if (typeof raw === 'string') {
        const resolved = session.athletes[raw];
        return (resolved === null || resolved === undefined) ? session.common : resolved;
      }
      return raw;
    }

    const selectedWorkout = computed(() => {
      const w = resolveWorkout(selectedSession.value, selectedAthlete.value);
      return replaceTokensDeep(w, athleteLevels.value);
    });

    watch(() => circuitSettings.value.rounds, () => { if (displayedWorkout.value?.circuitMode) initExerciseSets(); });

    // ── LEVEL CALCULATION ──────────────────────────────────────────────────
    function replaceTokensDeep(obj, levels) {
      if (!levels || obj === null || obj === undefined) return obj;
      if (typeof obj === 'string') {
        return obj
          .replace(/\{\{threshold\}\}/g, levels.threshold_run_kmh + ' km/t')
          .replace(/\{\{easy\}\}/g,      levels.easy_run_kmh      + ' km/t')
          .replace(/\{\{ocr_run\}\}/g,   levels.ocr_run_kmh       + ' km/t')
          .replace(/\{\{strides\}\}/g,   levels.strides_kmh       + ' km/t')
          .replace(/\{\{marathon_pace\}\}/g, levels.marathon_pace_kmh + ' km/t')
          .replace(/\{\{hang\}\}/g,      String(levels.max_hang_sec ?? 60))
          .replace(/\{\{carry\}\}/g,     String(levels.carry_kg    ?? 20));
      }
      if (Array.isArray(obj)) return obj.map(v => replaceTokensDeep(v, levels));
      if (typeof obj === 'object') {
        const out = {};
        for (const [k, v] of Object.entries(obj)) out[k] = replaceTokensDeep(v, levels);
        return out;
      }
      return obj;
    }

    // ── DAGSFORM HINT ──────────────────────────────────────────────────────
    const dagsformHint = computed(() => {
      const libDgf = selectedLibrarySession.value?.dagsform;
      if (dagsform.value === 'yellow') return libDgf?.yellow || PROGRAM_DATA.dagsformRules.yellow;
      if (dagsform.value === 'red') return libDgf?.red || PROGRAM_DATA.dagsformRules.red;
      return '';
    });

    // ── WEEK NAVIGATION ────────────────────────────────────────────────────
    function navigateWeek(dir) {
      const next = viewWeek.value + dir;
      if (next >= 1 && next <= totalWeeks.value) viewWeek.value = next;
    }

    const weekDays = { monday: 'Mandag', tuesday: 'Tirsdag', thursday: 'Torsdag', friday: 'Fredag' };

    // ── RPE LOGGING ────────────────────────────────────────────────────────
    function rpeClass(n) {
      if (n <= 4) return 'low';
      if (n <= 7) return 'mid';
      return 'high';
    }

    function prefillMetrics(session, workout) {
      if (!session) { workoutMetrics.value = {}; return; }
      const type = session.type || 'recovery';
      const m = {};
      const durM = (session.duration || '').match(/(\d+)(?:–(\d+))?\s*min/);
      if (durM) m.duration_min = durM[2] ? Math.round((+durM[1] + +durM[2]) / 2) : +durM[1];
      if (type === 'intervals') {
        const setsM = (workout?.part1?.sets || '').match(/^(\d+)×/);
        if (setsM) m.sets_done = +setsM[1];
        const speedM = (workout?.part1?.speed || '').match(/(\d+\.?\d*)(?:–(\d+\.?\d*))?/);
        if (speedM) m.speed_kmh = speedM[2] ? Math.round(((+speedM[1] + +speedM[2]) / 2) * 10) / 10 : +speedM[1];
        const inclM = (workout?.part1?.incline || '').match(/(\d+\.?\d*)(?:–(\d+\.?\d*))?/);
        if (inclM) m.incline_pct = inclM[2] ? Math.round((+inclM[1] + +inclM[2]) / 2) : +inclM[1];
      } else if (type === 'ocr') {
        if (workout?.rounds) m.rounds_done = workout.rounds;
        // Prefill per-step fields from circuit
        if (workout?.circuit) {
          workout.circuit.forEach((step, i) => {
            parseCircuitStep(step, i).fields.forEach(f => {
              if (f.defaultVal != null) m[f.key] = f.defaultVal;
            });
          });
        }
      } else if (type === 'strength') {
        // program.js strength sessions are circuits — prefill rounds from session data
        if (session.common?.rounds != null) {
          m.rounds_done = session.common.rounds;
        } else {
          const firstEx = workout?.exercises?.[0] ? parseExercise(workout.exercises[0]) : null;
          m.rounds_done = firstEx?.sets ?? 3;
        }
      }
      // Per-activity pre-fill for intervals and recovery
      if (type === 'intervals' || type === 'recovery') {
        const isInt = type === 'intervals';
        const prefillCard = (part, id) => {
          const c = parseActivityPart(id, part, isInt);
          c.fields.forEach(f => { if (f.defaultVal != null) m[f.key] = f.defaultVal; });
        };
        if (workout?.options?.length) {
          prefillCard(workout.options[0], 'opt0');
        } else {
          if (workout?.part1) prefillCard(workout.part1, 'p1');
          if (workout?.part2) prefillCard(workout.part2, 'p2');
          if (workout?.strides) prefillCard(workout.strides, 'st');
        }
      }
      workoutMetrics.value = m;
    }

    function prefillStrengthMetrics() {
      const sd = selectedStrengthDay.value;
      if (!sd) { workoutMetrics.value = {}; return; }
      const durM = (sd.duration || '').match(/(\d+)(?:–(\d+))?\s*min/);
      workoutMetrics.value = {
        sets_done: sd.exercises?.[0]?.sets ?? null,
        weight_pct: 100,
        duration_min: durM ? (durM[2] ? Math.round((+durM[1] + +durM[2]) / 2) : +durM[1]) : null,
      };
    }

    // ── PER-SET LOGGING (Hevy-inspired) ────────────────────────────────────

    const previousExerciseSets = computed(() => {
      const key = selectedStrengthKey.value
        ? 'strength_' + selectedStrengthKey.value
        : selectedLibraryKey.value
          ? 'library_' + selectedLibraryKey.value
          : selectedSessionKey.value;
      if (!key) return {};
      const relevant = [...workoutLogs.value].reverse().filter(l => l.sessionKey === key && l.metrics?.exercise_sets);
      // Prefer a green/yellow day log — skip deload and red dagsform so reduced weights don't overwrite the baseline
      const baseline = relevant.find(l => !l.deloadMode && l.dagsform !== 'red') ?? relevant[0];
      return baseline?.metrics?.exercise_sets || {};
    });

    const lastLoggedRpe = computed(() => {
      const key = selectedStrengthKey.value
        ? 'strength_' + selectedStrengthKey.value
        : selectedLibraryKey.value
          ? 'library_' + selectedLibraryKey.value
          : selectedSessionKey.value;
      if (!key) return null;
      const last = [...workoutLogs.value].reverse().find(l => l.sessionKey === key);
      return last?.rpe || null;
    });

    function initExerciseSets() {
      const exs = displayedWorkout.value?.exercises_raw;
      if (!exs?.length) { currentExerciseSets.value = {}; return; }
      const prev = previousExerciseSets.value;
      const isCircuit = displayedWorkout.value?.circuitMode;
      const result = {};
      for (const ex of exs) {
        const prevSets = prev[ex.name] || [];
        const numSets = isCircuit ? circuitSettings.value.rounds : ex.sets;
        result[ex.name] = Array.from({ length: numSets }, (_, i) => ({
          weight: prevSets[i]?.weight ?? (parseInt(ex.weight) || getExerciseDefaultWeight(ex.name, selectedAthlete.value)),
          reps:   prevSets[i]?.reps   ?? (ex.time ? (parseInt(ex.time) || 0) : (parseInt(ex.reps) || 0)),
          done:   false,
        }));
      }
      currentExerciseSets.value = result;
    }

    function resyncExerciseSets() {
      const exs = displayedWorkout.value?.exercises_raw;
      if (!exs?.length) return;
      const current = currentExerciseSets.value;
      if (!Object.keys(current).length) { initExerciseSets(); return; }
      for (const ex of exs) {
        const sets = current[ex.name];
        if (!sets) continue;
        const anyDone = sets.some(s => s.done);
        if (anyDone) continue;
        const targetReps = ex.time ? (parseInt(ex.time) || 0) : (parseInt(ex.reps) || 0);
        // update reps from program
        for (let i = 0; i < sets.length; i++) sets[i].reps = targetReps;
        // trim excess sets
        if (sets.length > ex.sets) sets.splice(ex.sets);
        // add missing sets
        while (sets.length < ex.sets) {
          sets.push({ weight: sets.at(-1)?.weight ?? 0, reps: targetReps, done: false });
        }
      }
    }

    const exerciseSetsForDisplay = computed(() => {
      const exs = displayedWorkout.value?.exercises_raw;
      if (!exs?.length) return currentExerciseSets.value;
      const out = {};
      for (const ex of exs) {
        const stored = currentExerciseSets.value[ex.name];
        if (!stored) continue;
        out[ex.name] = stored.length <= ex.sets ? stored : stored.slice(0, ex.sets);
      }
      return out;
    });

    // Returns true if weight×reps is a new 3RM-record for this exercise (ignores sets with 0 weight)
    function isSetPR(exerciseName, weight, reps) {
      if (!weight || !reps) return false;
      const score = weight * reps;
      for (const log of workoutLogs.value) {
        const sets = log.metrics?.exercise_sets?.[exerciseName];
        if (!sets) continue;
        for (const s of sets) {
          if (s.weight && s.reps && s.weight * s.reps >= score) return false;
        }
      }
      return true;
    }

    function startEditLog() {
      const key = selectedStrengthKey.value
        ? 'strength_' + selectedStrengthKey.value
        : selectedSessionKey.value;
      const logs = JSON.parse(localStorage.getItem(STORAGE.wlog(selectedAthlete.value)) || '[]');
      const last = [...logs].reverse().find(l => l.sessionKey === key);
      if (last) {
        selectedRpe.value = last.rpe || null;
        workoutMetrics.value = { ...last.metrics };
        // Restore per-set data if present
        if (last.metrics?.exercise_sets) {
          const restored = {};
          for (const [name, sets] of Object.entries(last.metrics.exercise_sets)) {
            restored[name] = sets.map(s => ({ ...s }));
          }
          currentExerciseSets.value = restored;
        }
      }
      editingLog.value = true;
    }

    function saveWorkoutAndNote() {
      if (!selectedRpe.value) return;
      saveWorkoutLog(selectedRpe.value);
      saveNote();
      selectedRpe.value = null;
      editingLog.value = false;
    }

    function saveWorkoutLog(rpe) {
      if (selectedStrengthKey.value) {
        if (!editingLog.value) markStrengthDone(selectedStrengthKey.value);
        const sessionKey = 'strength_' + selectedStrengthKey.value;
        const rpeHist = JSON.parse(localStorage.getItem(STORAGE.rpe(selectedAthlete.value)) || '[]');
        rpeHist.push({ date: today(), rpe, session: sessionKey });
        localStorage.setItem(STORAGE.rpe(selectedAthlete.value), JSON.stringify(rpeHist));
        const logs = JSON.parse(localStorage.getItem(STORAGE.wlog(selectedAthlete.value)) || '[]');
        const exSets = currentExerciseSets.value;
        const setsDone = Object.values(exSets).reduce((t, sets) => t + sets.filter(s => s.done).length, 0);
        const newEntry = {
          date: today(), weekNumber: currentWeekNumber.value,
          sessionKey, type: 'strength', rpe,
          dagsform: dagsform.value, deloadMode: deloadMode.value,
          metrics: {
            ...workoutMetrics.value,
            sets_done: setsDone || workoutMetrics.value.sets_done,
            exercise_sets: JSON.parse(JSON.stringify(exSets)),
          },
        };
        const existingIdx = editingLog.value ? logs.map((l,i)=>[l,i]).filter(([l])=>l.sessionKey===sessionKey).at(-1)?.[1] : -1;
        if (existingIdx >= 0) logs[existingIdx] = newEntry; else logs.push(newEntry);
        localStorage.setItem(STORAGE.wlog(selectedAthlete.value), JSON.stringify(logs));
        refreshKey.value++;
        return;
      }
      if (!editingLog.value && selectedSessionKey.value) markSessionDone(selectedSessionKey.value);
      const sessKey = selectedLibraryKey.value ? ('library_' + selectedLibraryKey.value) : selectedSessionKey.value;
      const rpeHist = JSON.parse(localStorage.getItem(STORAGE.rpe(selectedAthlete.value)) || '[]');
      rpeHist.push({ date: today(), rpe, session: sessKey });
      localStorage.setItem(STORAGE.rpe(selectedAthlete.value), JSON.stringify(rpeHist));
      const logs = JSON.parse(localStorage.getItem(STORAGE.wlog(selectedAthlete.value)) || '[]');
      const exSetsCardio = currentExerciseSets.value;
      const hasExSets = Object.keys(exSetsCardio).length > 0;
      const cardioMetrics = { ...workoutMetrics.value };
      // Compute backward-compat fields from per-activity cards (for Fremgang graphs)
      if (activityCards.value.length) {
        const dur = ['p1','p2','st','opt0','opt1'].reduce((s, id) => s + (cardioMetrics[id+'_dur'] || 0), 0);
        if (dur > 0) cardioMetrics.duration_min = dur;
        const spd = cardioMetrics.p1_spd ?? cardioMetrics.opt0_spd;
        if (spd != null) cardioMetrics.speed_kmh = spd;
        const sets = cardioMetrics.p1_sets ?? cardioMetrics.opt0_sets;
        if (sets != null) cardioMetrics.sets_done = sets;
        const incl = cardioMetrics.p1_incl ?? cardioMetrics.opt0_incl;
        if (incl != null) cardioMetrics.incline_pct = incl;
      }
      // Compute backward-compat fields from circuit step cards (for Fremgang graphs)
      if (circuitStepCards.value.length) {
        const circuit = displayedWorkout.value?.circuit || [];
        circuit.forEach((step, i) => {
          const p = 'cs' + i + '_';
          if (/hang/i.test(step)   && cardioMetrics[p+'sek']  != null) cardioMetrics.hang_sec     = cardioMetrics[p+'sek'];
          if (/carry/i.test(step)  && cardioMetrics[p+'kg']   != null) cardioMetrics.carry_kg      = cardioMetrics[p+'kg'];
          if (/carry/i.test(step)  && cardioMetrics[p+'dist'] != null) cardioMetrics.carry_dist_m  = cardioMetrics[p+'dist'];
          if (/burpee/i.test(step) && cardioMetrics[p+'reps0']!= null) cardioMetrics.burpees_done  = cardioMetrics[p+'reps0'];
        });
      }
      if (hasExSets) {
        cardioMetrics.exercise_sets = JSON.parse(JSON.stringify(exSetsCardio));
        cardioMetrics.sets_done = Object.values(exSetsCardio).reduce((t, s) => t + s.filter(x => x.done).length, 0);
      }
      const newEntry = {
        date: today(), weekNumber: currentWeekNumber.value,
        sessionKey: sessKey,
        type: effectiveCardioSession.value?.type || 'unknown',
        dagsform: dagsform.value, deloadMode: deloadMode.value,
        rpe, metrics: cardioMetrics,
      };
      const sk = sessKey;
      const existingIdx = editingLog.value ? logs.map((l,i)=>[l,i]).filter(([l])=>l.sessionKey===sk).at(-1)?.[1] : -1;
      if (existingIdx >= 0) logs[existingIdx] = newEntry; else logs.push(newEntry);
      localStorage.setItem(STORAGE.wlog(selectedAthlete.value), JSON.stringify(logs));
      refreshKey.value++;
    }

    function saveNote() {
      if (todayNote.value.trim()) {
        const history = JSON.parse(localStorage.getItem(STORAGE.note(selectedAthlete.value)) || '[]');
        history.push({ date: today(), text: todayNote.value.trim(), session: selectedSessionKey.value || ('strength_' + selectedStrengthKey.value) });
        localStorage.setItem(STORAGE.note(selectedAthlete.value), JSON.stringify(history));
        todayNote.value = '';
      }
      noteSaved.value = true;
      setTimeout(() => { noteSaved.value = false; }, 2000);
    }

    // ── PROGRESS ───────────────────────────────────────────────────────────
    const rpeHistory = computed(() => {
      refreshKey.value;
      return JSON.parse(localStorage.getItem(STORAGE.rpe(selectedAthlete.value)) || '[]');
    });

    const notesHistory = computed(() => {
      return JSON.parse(localStorage.getItem(STORAGE.note(selectedAthlete.value)) || '[]');
    });

    const completedSessions = computed(() => {
      // Count all weeks where at least one session is done
      return rpeHistory.value.length;
    });

    const currentStreak = computed(() => {
      const history = rpeHistory.value;
      if (!history.length) return 0;
      const dates = [...new Set(history.map(h => h.date))].sort().reverse();
      let streak = 0;
      let prev = null;
      for (const d of dates) {
        if (!prev) { streak = 1; prev = d; continue; }
        const diff = (new Date(prev + 'T00:00:00') - new Date(d + 'T00:00:00')) / 86400000;
        if (diff <= 4) { streak++; prev = d; } else break;
      }
      return streak;
    });

    const avgRpe = computed(() => {
      const h = rpeHistory.value;
      if (!h.length) return null;
      return (h.reduce((s, e) => s + e.rpe, 0) / h.length).toFixed(1);
    });

    // ── WORKOUT LOGS + GRAPHS ──────────────────────────────────────────────
    const workoutLogs = computed(() => {
      refreshKey.value;
      return JSON.parse(localStorage.getItem(STORAGE.wlog(selectedAthlete.value)) || '[]');
    });

    const logFields = computed(() => {
      if (selectedStrengthKey.value) return SESSION_LOG_FIELDS.strength;
      const sess = effectiveCardioSession.value;
      // program.js sessions with type='strength' are circuits (exercises as text), not PPL gym
      if (sess?.type === 'strength') return SESSION_LOG_FIELDS.circuit;
      // OCR sessions with circuit steps: hang/carry/burpees shown inline — only rounds + duration in log card
      if (sess?.type === 'ocr' && sess?.common?.circuit) {
        return SESSION_LOG_FIELDS.ocr.filter(f => ['rounds_done', 'duration_min'].includes(f.key));
      }
      return SESSION_LOG_FIELDS[sess?.type] || SESSION_LOG_FIELDS.recovery;
    });

    const sortByDate = arr => [...arr].sort((a, b) => a.date.localeCompare(b.date));
    const intervalSpeedLogs = computed(() =>
      sortByDate(workoutLogs.value
        .filter(l => l.type === 'intervals' && l.metrics?.speed_kmh)
        .map(l => ({ date: l.date, value: l.metrics.speed_kmh, week: l.weekNumber })))
    );
    // Belastning = drag × km/t — viser reell progresjon uavhengig av intervalformat
    const intervalLoadLogs = computed(() =>
      sortByDate(workoutLogs.value
        .filter(l => l.type === 'intervals' && l.metrics?.sets_done && l.metrics?.speed_kmh)
        .map(l => ({
          date: l.date,
          value: Math.round(l.metrics.sets_done * l.metrics.speed_kmh),
          sets: l.metrics.sets_done,
          speed: l.metrics.speed_kmh,
          rpe: l.metrics.rpe || 0
        })))
    );
    const intervalLogs = computed(() =>
      sortByDate(workoutLogs.value.filter(l => l.type === 'intervals' && l.metrics?.sets_done)
        .map(l => ({ date: l.date, value: l.metrics.sets_done })))
    );
    const hangLogs = computed(() =>
      sortByDate(workoutLogs.value
        .filter(l => l.type === 'ocr' && l.metrics?.hang_sec)
        .map(l => ({ date: l.date, value: l.metrics.hang_sec, week: l.weekNumber })))
    );
    const ocrRoundsLogs = computed(() =>
      sortByDate(workoutLogs.value
        .filter(l => l.type === 'ocr' && l.metrics?.rounds_done)
        .map(l => ({ date: l.date, value: l.metrics.rounds_done, week: l.weekNumber })))
    );
    const recoveryLogs = computed(() =>
      workoutLogs.value.filter(l => l.type === 'recovery' && l.metrics?.duration_min)
        .map(l => ({ date: l.date, value: l.metrics.duration_min }))
    );
    const strengthLogs = computed(() =>
      workoutLogs.value.filter(l => l.type === 'strength' && l.metrics?.sets_done)
        .map(l => ({ date: l.date, value: l.metrics.sets_done }))
    );

    const exerciseProgressLogs = computed(() => {
      const byEx = {};
      for (const log of workoutLogs.value) {
        if (log.type !== 'strength' || !log.metrics?.exercise_sets) continue;
        for (const [name, sets] of Object.entries(log.metrics.exercise_sets)) {
          const best = sets.filter(s => s.weight && s.reps)
                           .reduce((b, s) => (s.weight > (b?.weight ?? 0) ? s : b), null);
          if (!best) continue;
          if (!byEx[name]) byEx[name] = [];
          byEx[name].push({ date: log.date, week: log.weekNumber, weight: best.weight, reps: best.reps });
        }
      }
      return Object.entries(byEx)
        .filter(([, e]) => e.length >= 1)
        .map(([name, entries]) => ({ name, entries: entries.sort((a, b) => a.date.localeCompare(b.date)) }));
    });

    // ── HISTORIKK (Strava-inspired activity feed) ──────────────────────────

    const TYPE_ICON = { intervals: '🏃', ocr: '🧗', strength: '🏋️', recovery: '🚶' };
    const TYPE_LABEL = { intervals: 'Intervall', ocr: 'OCR', strength: 'Styrke', recovery: 'Rolig' };

    function sessionTitle(log) {
      if (log.type === 'strength') {
        const key = log.sessionKey.replace('strength_', '');
        return STRENGTH_PROGRAM.days[key]?.title || 'Styrkeøkt';
      }
      for (const week of PROGRAM_DATA.weeks) {
        for (const [, sess] of Object.entries(week.sessions || {})) {
          if (sess && log.sessionKey && Object.keys(week.sessions).some(k => k === log.sessionKey)) {
            return week.sessions[log.sessionKey]?.title || log.type;
          }
        }
      }
      return log.type;
    }

    function sessionTitleFast(log) {
      if (log.type === 'strength') {
        const key = log.sessionKey.replace('strength_', '');
        return STRENGTH_PROGRAM.days[key]?.title || 'Styrkeøkt';
      }
      const anyWeek = PROGRAM_DATA.weeks.find(w => w.sessions?.[log.sessionKey]);
      return anyWeek?.sessions?.[log.sessionKey]?.title || log.sessionKey || log.type;
    }

    function hasPRInLog(log) {
      if (!log.metrics?.exercise_sets) return false;
      for (const [name, sets] of Object.entries(log.metrics.exercise_sets)) {
        for (const s of sets) {
          if (!s.weight || !s.reps) continue;
          const score = s.weight * s.reps;
          const allLogs = workoutLogs.value.filter(l => l.date < log.date);
          const prInHistory = allLogs.every(l => {
            const hist = l.metrics?.exercise_sets?.[name] || [];
            return hist.every(hs => !hs.weight || !hs.reps || hs.weight * hs.reps < score);
          });
          if (prInHistory) return true;
        }
      }
      return false;
    }

    function prExerciseNames(log) {
      if (!log.metrics?.exercise_sets) return [];
      const prs = [];
      for (const [name, sets] of Object.entries(log.metrics.exercise_sets)) {
        for (const s of sets) {
          if (!s.weight || !s.reps) continue;
          const score = s.weight * s.reps;
          const allLogs = workoutLogs.value.filter(l => l.date < log.date);
          const isPrSet = allLogs.every(l => {
            const hist = l.metrics?.exercise_sets?.[name] || [];
            return hist.every(hs => !hs.weight || !hs.reps || hs.weight * hs.reps < score);
          });
          if (isPrSet && !prs.includes(name)) prs.push(name);
        }
      }
      return prs;
    }

    const historikkEntries = computed(() => {
      refreshKey.value;
      return [...workoutLogs.value]
        .reverse()
        .filter(l => historikkFilter.value === 'alle' || l.type === historikkFilter.value)
        .map(l => {
          const m = l.metrics || {};
          let keyMetric = '', keyMetricLabel = '';
          if (l.type === 'intervals') { keyMetric = m.speed_kmh ? m.speed_kmh + ' km/t' : ''; keyMetricLabel = m.sets_done ? m.sets_done + ' drag' : ''; }
          else if (l.type === 'ocr')  { keyMetric = m.rounds_done ? m.rounds_done + ' runder' : ''; keyMetricLabel = m.hang_sec ? m.hang_sec + 's hang' : ''; }
          else if (l.type === 'strength') { keyMetric = m.sets_done ? m.sets_done + ' sett' : ''; keyMetricLabel = m.duration_min ? m.duration_min + ' min' : ''; }
          else if (l.type === 'recovery') { keyMetric = m.duration_min ? m.duration_min + ' min' : ''; keyMetricLabel = m.speed_kmh ? m.speed_kmh + ' km/t' : ''; }
          return {
            ...l,
            icon: TYPE_ICON[l.type] || '📋',
            typeLabel: TYPE_LABEL[l.type] || l.type,
            title: sessionTitleFast(l),
            keyMetric, keyMetricLabel,
            prs: prExerciseNames(l),
          };
        });
    });

    const historikkByWeek = computed(() => {
      const byWeek = {};
      for (const e of historikkEntries.value) {
        const wn = e.weekNumber || 0;
        if (!byWeek[wn]) byWeek[wn] = { weekNumber: wn, entries: [] };
        byWeek[wn].entries.push(e);
      }
      return Object.values(byWeek).sort((a, b) => b.weekNumber - a.weekNumber);
    });

    const weeklyReport = computed(() => {
      refreshKey.value;
      const todayStr = today();
      const d7  = new Date(todayStr); d7.setDate(d7.getDate() - 7);
      const d14 = new Date(todayStr); d14.setDate(d14.getDate() - 14);
      const s7  = d7.toISOString().slice(0, 10);
      const s14 = d14.toISOString().slice(0, 10);

      const thisW = workoutLogs.value.filter(l => l.date > s7  && l.date <= todayStr);
      const lastW = workoutLogs.value.filter(l => l.date > s14 && l.date <= s7);
      const name  = currentAthleteName.value;

      if (!thisW.length && !lastW.length) {
        return { text: `Logg dine første økter fra «I dag»-fanen, ${name} — så genereres ukentlig analyse her automatisk.`, stats: null };
      }

      const rpeArr  = v => v.filter(l => l.metrics?.rpe).map(l => l.metrics.rpe);
      const avgRpe  = arr => arr.length ? +(arr.reduce((s, v) => s + v, 0) / arr.length).toFixed(1) : null;
      const loadSum = v => v.filter(l => l.metrics?.sets_done && l.metrics?.speed_kmh)
                           .reduce((s, l) => s + l.metrics.sets_done * l.metrics.speed_kmh, 0);

      const sessThis = thisW.length, sessLast = lastW.length;
      const avgRpeThis = avgRpe(rpeArr(thisW)), avgRpeLast = avgRpe(rpeArr(lastW));
      const loadThis = Math.round(loadSum(thisW)), loadLast = Math.round(loadSum(lastW));

      const weekPrs = [...new Set(thisW.flatMap(l => prExerciseNames(l)))];

      const lines = [];
      if (sessThis === 0) {
        lines.push(`Ingen loggede økter de siste 7 dagene, ${name}.`);
        if (sessLast > 0) lines.push(`Forrige uke var det ${sessLast} økt${sessLast > 1 ? 'er' : ''} — kom tilbake på sporet!`);
      } else {
        const badge = sessThis >= 4 ? ' 🔥' : sessThis >= 3 ? ' 💪' : '';
        lines.push(`${name} har logget ${sessThis} økt${sessThis > 1 ? 'er' : ''} de siste 7 dagene${badge}.`);
        if (sessLast > 0) {
          if (sessThis > sessLast)      lines.push(`${sessThis - sessLast} mer enn uken før — bra fremgang!`);
          else if (sessThis < sessLast) lines.push(`Litt færre enn uken før (${sessLast}), men alle uker teller.`);
          else                          lines.push(`Samme treningsrytme som forrige uke — konsistent!`);
        }
      }

      if (loadThis && loadLast) {
        const pct = Math.round((loadThis - loadLast) / loadLast * 100);
        if      (pct >  10) lines.push(`Intervall-belastningen økte ${pct}% — kroppen din håndterer mer!`);
        else if (pct < -10) lines.push(`Intervall-belastningen var ${Math.abs(pct)}% lavere enn forrige uke — fint å variere intensiteten.`);
        else                lines.push(`Intervall-belastningen holder seg stabil.`);
      }

      if (avgRpeThis !== null) {
        if      (avgRpeThis <= 5) lines.push(`Snitt-RPE ${avgRpeThis} — kontrollert trening. Vurder å øke intensiteten litt.`);
        else if (avgRpeThis <= 7) lines.push(`Snitt-RPE ${avgRpeThis} — god balanse mellom belastning og restitusjon.`);
        else if (avgRpeThis <= 8) lines.push(`Snitt-RPE ${avgRpeThis} — høy innsats! Sørg for nok søvn og hvile.`);
        else                      lines.push(`Snitt-RPE ${avgRpeThis} — veldig høy intensitet. Prioriter restitusjon nå.`);
      }

      if (weekPrs.length) lines.push(`🏆 Ny rekord: ${weekPrs.slice(0, 3).join(', ')}!`);

      return {
        text: lines.join(' '),
        stats: { sessThis, sessLast, avgRpeThis, avgRpeLast, loadThis, loadLast }
      };
    });

    function fmtVal(v) {
      if (v == null || isNaN(v)) return '–';
      return v % 1 === 0 ? String(Math.round(v)) : v.toFixed(1);
    }

    // SVG coordinate system: viewBox "0 0 320 80"
    // Graph area: x 40–316 (drawW=276), y 10–60 (drawH=50). Grid lines at y=10,35,60.
    // Y scale: adds 10% padding below min so small variations don't fill the full height.
    function graphScale(vals) {
      const max = Math.max(...vals);
      const dataMin = Math.min(...vals);
      const padding = (max - dataMin) * 0.15 || max * 0.05 || 1;
      const min = dataMin - padding;
      return { min, max, range: max - min || 1 };
    }
    function sparkPoints(data, drawW = 276, drawH = 50, xOff = 40, yOff = 10) {
      if (!data.length) return '';
      const { min, range } = graphScale(data.map(d => d.value));
      return data.map((d, i) => {
        const x = xOff + (data.length === 1 ? drawW / 2 : (i / (data.length - 1)) * drawW);
        const y = yOff + drawH * (1 - (d.value - min) / range);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      }).join(' ');
    }
    function sparkDots(data, drawW = 276, drawH = 50, xOff = 40, yOff = 10) {
      if (!data.length) return [];
      const { min, range } = graphScale(data.map(d => d.value));
      return data.map((d, i) => {
        const x = xOff + (data.length === 1 ? drawW / 2 : (i / (data.length - 1)) * drawW);
        const y = yOff + drawH * (1 - (d.value - min) / range);
        return { x: +x.toFixed(1), y: +y.toFixed(1), value: d.value, date: d.date };
      });
    }

    // Bar chart: viewBox "0 0 300 90", bars x:[16,284] (drawW=268), y:[8,73] (drawH=65)
    function barChart(data, drawW = 268, drawH = 65, xOff = 16, yOff = 8) {
      if (!data.length) return [];
      const max = Math.max(...data.map(d => d.value)) || 1;
      const n = data.length;
      const slot = drawW / n;
      const bw = Math.min(slot * 0.7, 28);
      return data.map((d, i) => {
        const bh = Math.max(3, drawH * (d.value / max));
        return {
          x: +(xOff + i * slot + (slot - bw) / 2).toFixed(1),
          y: +(yOff + drawH - bh).toFixed(1),
          w: +bw.toFixed(1),
          h: +bh.toFixed(1),
          label: String(d.value),
          date: d.date, rpe: d.rpe || 0, sets: d.sets || 0, speed: d.speed || 0
        };
      });
    }
    function rpeColor(rpe) {
      if (!rpe) return '#2196F3';
      if (rpe <= 5) return '#4CAF50';
      if (rpe <= 7) return '#2196F3';
      if (rpe <= 8) return '#FF9800';
      return '#F44336';
    }

    const testTypes = [
      {
        id: 'run20min', label: 'Løpetest 20 min', unit: 'm', higherBetter: true,
        hint: 'Distanse løpt på 20 min (meter)',
        targetRpe: '8–9',
        effect: '✅ Oppdaterer alle intervall- og løpefarter automatisk',
        description: 'Varm opp 10 min rolig. Løp på mølla (0–1% stigning) i nøyaktig 20 min – så langt du klarer. Registrer meter. Brukes til å beregne sonene dine automatisk.',
      },
      {
        id: 'cooper', label: 'Cooper (12 min)', unit: 'm', higherBetter: true,
        hint: 'Distanse løpt på 12 min (meter)',
        targetRpe: '9',
        effect: '✅ Oppdaterer treningssoner (brukes om Løpetest 20 min mangler)',
        description: 'Løp så langt du klarer på 12 minutter – utendørs eller på mølle. Jevn ut tempoet underveis. Registrer meter. Brukes som reserve-terskel om 20 min-test ikke er utført.',
      },
      {
        id: 'ocr_flytest', label: 'OCR flytest', unit: 'sek', higherBetter: false,
        hint: 'Total tid i sekunder',
        targetRpe: '9',
        effect: '📊 Kun historikk/fremgang — ingen live effekt',
        description: 'Gjennomfør en fast OCR-runde med forhåndsbestemt rute og hindringer. Mål total tid fra start til mål i sekunder. Bruk samme rute hver gang.',
      },
      {
        id: 'deadhang', label: 'Maks dead hang', unit: 'sek', higherBetter: true,
        hint: 'Sekunder',
        targetRpe: '9',
        effect: '✅ Oppdaterer hang-mål i OCR-øktene',
        description: 'Heng i pullup-stang med rett kropp og aktive skuldre – ingen kipping. Mål sekunder til du slipper. Gjør to forsøk med 3 min pause, registrer beste.',
      },
      {
        id: 'carry', label: 'Carry-test', unit: 'sek', higherBetter: true,
        hint: 'Sekunder holdt',
        targetRpe: '8–9',
        effect: '✅ Oppdaterer anbefalt carry-vekt i øktene',
        description: 'Velg en fast testvekt (f.eks. 20 kg) og gå/stå med Farmer\'s carry så lenge du klarer uten å sette ned. Mål sekunder. Testresultatet bestemmer hvilken vekt du anbefales i øktene.',
      },
      {
        id: 'rowing2k', label: 'Roing 2000m', unit: 'sek', higherBetter: false,
        hint: 'Tid i sekunder (t.eks. 420 = 7:00)',
        targetRpe: '9',
        effect: '📊 Kun historikk/fremgang — ingen live effekt',
        description: 'Ro 2000 meter på romaskin så raskt du klarer. Varm opp 5–10 min rolig. Registrer total tid i sekunder. Hold igjen de første 500m, press på de siste 500m.',
      },
      {
        id: 'squat3rm', label: 'Knebøy 3RM', unit: 'kg', higherBetter: true,
        hint: 'Kilo',
        targetRpe: '9',
        effect: '📊 Kun historikk/fremgang + PR-varsling',
        description: 'Varm opp gradvis (50%×5, 70%×3, 85%×2). Finn høyeste vekt for 3 rene reps med dyp nok knebøy. Ha alltid spotter.',
      },
      {
        id: 'deadlift3rm', label: 'Markløft 3RM', unit: 'kg', higherBetter: true,
        hint: 'Kilo',
        targetRpe: '9',
        effect: '📊 Kun historikk/fremgang + PR-varsling',
        description: 'Varm opp grundig med lette vekter. Finn høyeste vekt for 3 rene repetisjoner med god rygglinje og benstopp. Stopp umiddelbart om teknikken svikter.',
      },
      {
        id: 'bench3rm', label: 'Benkpress 3RM', unit: 'kg', higherBetter: true,
        hint: 'Kilo',
        targetRpe: '9',
        effect: '📊 Kun historikk/fremgang + PR-varsling',
        description: 'Varm opp med lett vekt. Finn høyeste vekt for 3 kontrollerte repetisjoner med full bevegelsesbane – bryst til stangen, full strekk opp. Ha alltid spotter.',
      },
    ];

    const testPlaceholder = computed(() => testTypes.find(t => t.id === newTest.value.type)?.hint || '');
    const selectedTestType = computed(() => testTypes.find(t => t.id === newTest.value.type) || null);

    // Reactive test history — updated in-memory so computed downstream re-evaluates immediately
    const testHistoryRef = ref(JSON.parse(localStorage.getItem(STORAGE.tests) || '[]'));
    const testHistory = computed(() => testHistoryRef.value);

    function testsOfType(type) {
      return testHistory.value.filter(t => t.type === type).sort((a, b) => a.date > b.date ? 1 : -1);
    }
    function myTestsOfType(type) {
      return testHistory.value.filter(t => t.type === type && t.athlete === selectedAthlete.value)
        .sort((a, b) => a.date > b.date ? 1 : -1);
    }

    function isPR(entry, type) {
      const byAthlete = testsOfType(type).filter(t => t.athlete === entry.athlete);
      const def = testTypes.find(t => t.id === type);
      const higherBetter = def ? def.higherBetter : type !== 'rowing2k';
      const best = higherBetter
        ? Math.max(...byAthlete.map(t => +t.value))
        : Math.min(...byAthlete.map(t => +t.value));
      return +entry.value === best;
    }

    function saveTest() {
      if (!newTest.value.value) return;
      const entry = { ...newTest.value, value: +newTest.value.value };
      if (entry.type !== 'carry') delete entry.carry_weight_kg;
      testHistoryRef.value = [...testHistoryRef.value, entry];
      localStorage.setItem(STORAGE.tests, JSON.stringify(testHistoryRef.value));
      newTest.value = { athlete: selectedAthlete.value, type: newTest.value.type, value: '', carry_weight_kg: 20, date: today() };
    }

    function deleteTest(type, date) {
      testHistoryRef.value = testHistoryRef.value.filter(t => !(t.type === type && t.date === date && t.athlete === selectedAthlete.value));
      localStorage.setItem(STORAGE.tests, JSON.stringify(testHistoryRef.value));
    }

    // ── ATHLETE LEVELS (beregnet fra tester, fallback til nivåprofil) ─────────
    const athleteLevels = computed(() => {
      const id = selectedAthlete.value;
      const sorted = t => testHistory.value.filter(t2 => t2.athlete === id && t2.type === t).sort((a, b) => a.date > b.date ? 1 : -1);
      const runTests    = sorted('run20min');
      const cooperTests = sorted('cooper');
      const hangTests   = sorted('deadhang');
      const carryTests  = sorted('carry');

      // Derive carry_kg from carry test: if hold ≥ 60s use test weight, else scale proportionally
      function deriveCarryKg(carryTest) {
        if (!carryTest?.carry_weight_kg) return null;
        const target = 60;
        const ratio = Math.min(1, carryTest.value / target);
        return Math.max(10, Math.round(carryTest.carry_weight_kg * ratio / 2.5) * 2.5);
      }
      const carryKgFromTest = carryTests.length ? deriveCarryKg(carryTests[carryTests.length - 1]) : null;

      const athlete = ATHLETES.find(a => a.id === id);
      const profile = athlete?.level ? TRAINING_LEVELS[athlete.level] : null;

      // Beregn terskel fra test — Løpetest 20 min har prioritet over Cooper
      let thresholdData = null;
      if (runTests.length) {
        const latest = runTests[runTests.length - 1];
        // 20-min test: løper på terskelfart → speed = distance/20min direkte
        thresholdData = { threshold: Math.round(latest.value * 3 / 1000 * 10) / 10, date: latest.date, label: 'Løpetest 20 min' };
      } else if (cooperTests.length) {
        const latest = cooperTests[cooperTests.length - 1];
        // Cooper 12-min: maks aerob fart = distance/200 km/t, terskel ≈ 85%
        const maxSpeed = latest.value / 200;
        thresholdData = { threshold: Math.round(maxSpeed * 0.85 * 10) / 10, date: latest.date, label: 'Cooper-test' };
      }

      if (!thresholdData) {
        if (!profile) return null;
        return {
          threshold_run_kmh:  profile.threshold_kmh,
          marathon_pace_kmh:  Math.round(profile.threshold_kmh * 0.92 * 10) / 10,
          easy_run_kmh:       profile.easy_run_kmh,
          ocr_run_kmh:        profile.ocr_run_kmh,
          strides_kmh:        profile.strides_kmh,
          max_hang_sec:       hangTests.length ? hangTests[hangTests.length-1].value : profile.hang_sec,
          carry_kg:           carryKgFromTest ?? profile.carry_kg,
          level_label:        profile.label,
          last_updated:       null,
          from_profile:       true,
        };
      }

      const { threshold, date: testDate, label: testLabel } = thresholdData;
      return {
        threshold_run_kmh:  threshold,
        marathon_pace_kmh:  Math.round(threshold * 0.92 * 10) / 10,
        easy_run_kmh:       Math.round(threshold * 0.88 * 10) / 10,
        ocr_run_kmh:        Math.round(threshold * 0.96 * 10) / 10,
        strides_kmh:        Math.round(threshold * 1.15 * 10) / 10,
        max_hang_sec:       hangTests.length ? hangTests[hangTests.length-1].value : (profile?.hang_sec ?? null),
        carry_kg:           carryKgFromTest ?? (profile?.carry_kg ?? null),
        level_label:        'Beregnet fra ' + testLabel,
        last_updated:       testDate,
        from_profile:       false,
      };
    });

    // ── TEST CALENDAR ──────────────────────────────────────────────────────
    const testCalendar = computed(() => PROGRAM_DATA.meta.testCalendar || []);

    const upcomingTests = computed(() => {
      const [sy, sm, sd] = PROGRAM_DATA.meta.programStart.split('-').map(Number);
      const startMs = Date.UTC(sy, sm - 1, sd);
      return testCalendar.value
        .filter(t => t.weekNumber >= currentWeekNumber.value)
        .slice(0, 3)
        .map(t => {
          const weeksAway = t.weekNumber - currentWeekNumber.value;
          const dateMs = startMs + (t.weekNumber - 1) * 7 * 86400000;
          const dateStr = new Date(dateMs).toLocaleDateString('nb-NO', { day: '2-digit', month: '2-digit', timeZone: 'UTC' });
          return { ...t, weeksAway, dateStr };
        });
    });

    // ── TEST REMINDERS (90 dager) ──────────────────────────────────────────
    const testReminders = computed(() => {
      const reminders = [];
      const now = new Date();
      for (const type of testTypes) {
        const myTests = testsOfType(type.id).filter(t => t.athlete === selectedAthlete.value);
        if (!myTests.length) continue;
        const last = new Date(myTests[myTests.length - 1].date + 'T00:00:00');
        const daysAgo = Math.floor((now - last) / 86400000);
        if (daysAgo > 90) reminders.push({ type: type.id, label: type.label, daysAgo });
      }
      return reminders;
    });

    // ── ATHLETES ───────────────────────────────────────────────────────────
    const athletes = ATHLETES;

    function selectAthlete(id) {
      selectedAthlete.value = id;
      selectedStrengthKey.value = null;
      selectedLibraryKey.value = null;
      deloadMode.value = false;
      shortMode.value = false;
      cancelRestTimer();
      localStorage.setItem(STORAGE.athlete, id);
    }

    function athleteName(id) { return ATHLETES.find(a => a.id === id)?.name || id; }
    function athleteColor(id) { return ATHLETES.find(a => a.id === id)?.color || '#fff'; }

    const currentAthleteName = computed(() => athleteName(selectedAthlete.value));

    // ── EQUIPMENT ──────────────────────────────────────────────────────────
    const equipment = STRENGTH_PROGRAM.equipment;

    // ── INIT ───────────────────────────────────────────────────────────────
    onMounted(() => {
      const savedAthlete = localStorage.getItem(STORAGE.athlete);
      if (savedAthlete) selectedAthlete.value = savedAthlete;

      const savedDagsform = localStorage.getItem(STORAGE.dagsform);
      if (savedDagsform) dagsform.value = savedDagsform;

      const savedOutdoor = localStorage.getItem(STORAGE.outdoor);
      if (savedOutdoor !== null) isOutdoor.value = JSON.parse(savedOutdoor);

      viewWeek.value = currentWeekNumber.value;
      selectedSessionKey.value = null;

      // Register service worker for PWA
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js').catch(() => {});
      }
      loadMapsScript();
    });

    watch(dagsform, (v) => localStorage.setItem(STORAGE.dagsform, v));
    watch(isOutdoor, (v) => localStorage.setItem(STORAGE.outdoor, JSON.stringify(v)));
    watch(outdoorState, (s) => {
      if (s === 'done' && _routeCoords.length > 0) {
        nextTick(() => {
          const mid = _routeCoords[Math.floor(_routeCoords.length / 2)];
          initMap(mid.lat, mid.lng);
          if (_mapPolyline) {
            _routeCoords.forEach(c => _mapPolyline.getPath().push(new google.maps.LatLng(c.lat, c.lng)));
          }
        });
      }
    });
    watch(selectedWorkout, () => { prefillTimerConfig(); });
    watch(selectedSessionKey, (key) => {
      if (key) {
        prefillMetrics(selectedSession.value, displayedWorkout.value);
        prefillTimerConfig();
        outdoorMainMin.value = parseMinFromDuration(selectedSession.value?.duration);
        resetOutdoorTimer();
      } else workoutMetrics.value = {};
      cancelRestTimer();
    });

    watch(selectedStrengthKey, (key) => {
      if (key) { prefillStrengthMetrics(); initExerciseSets(); }
      else if (!selectedSessionKey.value) workoutMetrics.value = {};
      cancelRestTimer();
    });

    watch(selectedLibraryKey, (key) => {
      if (key) {
        prefillMetrics(selectedLibrarySession.value, displayedWorkout.value);
        prefillTimerConfig();
        outdoorMainMin.value = parseMinFromDuration(selectedLibrarySession.value?.duration);
        resetOutdoorTimer();
      } else workoutMetrics.value = {};
      cancelRestTimer();
    });

    watch(displayedWorkout, (newW) => {
      if (newW?.exercises_raw?.length) resyncExerciseSets();
      // Re-prefill metrics when dagsform/deload changes for cardio sessions
      if ((selectedSessionKey.value || selectedLibraryKey.value) && !selectedStrengthKey.value) {
        prefillMetrics(effectiveCardioSession.value, newW);
        prefillTimerConfig();
      }
    });
    watch(selectedAthlete, (id) => {
      newTest.value.athlete = id;
      const a = ATHLETES.find(x => x.id === id);
      if (a) {
        document.documentElement.style.setProperty('--accent', a.color);
        document.documentElement.style.setProperty('--accent-light', a.colorLight);
      }
    }, { immediate: true });

    return {
      // state
      selectedAthlete, dagsform, view, viewWeek, selectedSessionKey, selectedStrengthKey,
      selectedLibraryKey, libraryCategory,
      deloadMode, shortMode, isOutdoor,
      todayNote, noteSaved, newTest, workoutMetrics,
      currentExerciseSets, exerciseSetsForDisplay, historikkFilter, doneVersion, selectedRpe, editingLog,
      previousExerciseSets, lastLoggedRpe,
      // computed
      athletes, currentWeek, currentWeekNumber, viewingWeekData, viewingWeekWorkouts, totalWeeks,
      events, newEvent, upcomingEvents, addEvent, removeEvent,
      clearConfirm, confirmClear, downloadBackup, restoreBackup, backupRestoreMsg,
      selectedSession,
      selectedStrengthDay,
      selectedLibrarySession, effectiveCardioSession, LIBRARY_SESSIONS, LIBRARY_CATEGORIES,
      selectLibrarySession,
      selectedWorkout, displayedWorkout, displayedTitle, displayedDuration,
      dagsformHint, weekDays, rpeHistory, notesHistory,
      completedSessions, currentStreak, avgRpe,
      testTypes, testPlaceholder, selectedTestType, testHistory, testReminders,
      athleteLevels, upcomingTests, testCalendar,
      equipment, currentAthleteName,
      logFields, activityCards, circuitStepCards, workoutLogs, intervalSpeedLogs, intervalLoadLogs, intervalLogs, hangLogs, ocrRoundsLogs, recoveryLogs, strengthLogs, exerciseProgressLogs,
      historikkEntries, historikkByWeek, weeklyReport, TYPE_ICON, TYPE_LABEL,
      SESSION_LOG_FIELDS,
      // exercise parser
      parseExercise, parseExercises, deloadExercises, deloadCircuit, fmtVal,
      // timer
      timerState, timerPhase, timerSec, timerResults, timerConfig, timerEditing,
      timerPct, isPaused, showTimer,
      outdoorState, outdoorWarmupMin, outdoorWarmupKm, outdoorWarmupType,
      outdoorMainMin, outdoorElapsed, outdoorCountdown,
      outdoorFormatElapsed, startOutdoorTimer, resetOutdoorTimer,
      audioMuted, audioVolume, beep, fullscreenTimer, toggleFullscreenTimer,
      gpsEnabled, gpsActive, gpsSpeed, gpsDistance, gpsPace, gpsAvgSpeed, mapsApiReady,
      gpsPromptState, gpsWaitCountdown, gpsPromptChoose, gpsTimeoutChoose,
      lapDist, lapHistory, savedCourseLengthM, recordLap, resetLaps, saveCourseLengthM,
      formatSec, formatPace, formatDist,
      startTimer, endIntervalEarly, pauseTimer, resetTimer, toggleGps,
      // methods
      selectAthlete, selectSession, selectStrengthSession, navigateWeek, weekDates,
      rpeClass, saveWorkoutLog, saveWorkoutAndNote, saveNote, saveTest, deleteTest, startEditLog,
      isSessionDone, isSessionDoneForWeek, isStrengthDone, markSessionDone, markStrengthDone,
      testsOfType, myTestsOfType, isPR, athleteName, athleteColor,
      sparkPoints, sparkDots, barChart, rpeColor,
      formatDate, formatShortDate,
      isSetPR,
      // rest timer
      restTimer, startRestTimer, cancelRestTimer, formatRestTime,
      // motivasjon
      motivationToast, completeSet,
      // circuit
      circuitSettings, circuitRounds, circuitStatus, circuitCurrentRound,
      completeCircuitStation, saveCircuitSettings,
      // work timer
      workTimer, workTimerDone, startWorkTimer, cancelWorkTimer,
    };
  }
}).mount('#app');
