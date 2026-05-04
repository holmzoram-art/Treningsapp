const { createApp, ref, computed, watch, onMounted } = Vue;

const SESSION_LOG_FIELDS = {
  intervals: [
    { key: 'sets_done',    label: 'Drag fullført', unit: 'stk',  integer: true },
    { key: 'speed_kmh',    label: 'Snittfart',     unit: 'km/t', step: 0.1 },
    { key: 'incline_pct',  label: 'Stigning',      unit: '%',    step: 0.5 },
    { key: 'duration_min', label: 'Varighet',       unit: 'min',  integer: true },
  ],
  ocr: [
    { key: 'rounds_done',  label: 'Runder fullført', unit: 'stk', integer: true },
    { key: 'hang_sec',     label: 'Beste hang',      unit: 'sek', integer: true },
    { key: 'carry_kg',     label: 'Carry-vekt',      unit: 'kg',  step: 0.5 },
    { key: 'duration_min', label: 'Varighet',         unit: 'min', integer: true },
  ],
  strength: [
    { key: 'sets_done',    label: 'Sett fullført',    unit: 'stk', integer: true },
    { key: 'weight_pct',   label: 'Vekt (% av plan)', unit: '%',   integer: true },
    { key: 'duration_min', label: 'Varighet',          unit: 'min', integer: true },
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
    const showStrengthAlternative = ref(false);
    const deloadMode = ref(false);
    const shortMode = ref(false);
    const todayNote = ref('');
    const noteSaved = ref(false);
    const newTest = ref({ athlete: 'sondre', type: 'cooper', value: '', date: today() });
    const workoutMetrics = ref({});

    // localStorage keys
    const STORAGE = {
      athlete: 'onitio_athlete',
      dagsform: 'onitio_dagsform',
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

    const daysToRace = computed(() => {
      const race = new Date(PROGRAM_DATA.meta.raceDate + 'T00:00:00');
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      return Math.ceil((race - now) / 86400000);
    });

    // ── TODAY'S SESSION ────────────────────────────────────────────────────
    const DAY_MAP = { 1: 'monday', 2: 'tuesday', 4: 'thursday', 5: 'friday' };
    const DAY_NAMES = { monday: 'Mandag', tuesday: 'Tirsdag', thursday: 'Torsdag', friday: 'Fredag' };

    const selectedSession = computed(() => {
      if (!selectedSessionKey.value || !currentWeek.value) return null;
      return currentWeek.value.sessions?.[selectedSessionKey.value] || null;
    });

    function selectSession(key) {
      selectedSessionKey.value = key;
      showStrengthAlternative.value = false;
      deloadMode.value = false;
      shortMode.value = false;
    }

    // ── DONE TRACKING ──────────────────────────────────────────────────────
    function doneKey(weekNum, athleteId) {
      return `onitio_done_w${weekNum}_${athleteId}`;
    }

    function isSessionDone(sessionKey) {
      if (!sessionKey) return false;
      const done = JSON.parse(localStorage.getItem(doneKey(currentWeekNumber.value, selectedAthlete.value)) || '[]');
      return done.includes(sessionKey);
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
      else done.splice(done.indexOf(sessionKey), 1); // toggle off
      localStorage.setItem(key, JSON.stringify(done));
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

    // ── DELOAD CALCULATOR ──────────────────────────────────────────────────
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
      return s.replace(/^(\d+)(×)/, (_, n, x) => `${Math.max(1, Math.round(+n * vf))}${x}`);
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
    let _audioCtx = null;

    function getAudioCtx() {
      if (!_audioCtx) _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      return _audioCtx;
    }

    function beep(freq = 880, durationMs = 150, vol = 0.4) {
      if (audioMuted.value) return;
      try {
        const ctx = getAudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(vol, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationMs / 1000);
        osc.start(); osc.stop(ctx.currentTime + durationMs / 1000);
      } catch (e) {}
    }

    function speak(text) {
      if (audioMuted.value || !window.speechSynthesis) return;
      const utt = new SpeechSynthesisUtterance(text);
      utt.lang = 'nb-NO'; utt.rate = 1.05;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utt);
    }

    // ── GPS ────────────────────────────────────────────────────────────────────
    const gpsEnabled = ref(false);
    const gpsActive = ref(false);
    const gpsSpeed = ref(null);
    const gpsDistance = ref(0);
    const gpsPace = ref(null);
    let _gpsWatchId = null;
    let _gpsLastPos = null;

    function haversineKm(lat1, lon1, lat2, lon2) {
      const R = 6371, toRad = x => x * Math.PI / 180;
      const dLat = toRad(lat2 - lat1), dLon = toRad(lon2 - lon1);
      const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLon/2)**2;
      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    function startGps() {
      if (!navigator.geolocation) return;
      gpsDistance.value = 0; _gpsLastPos = null; gpsActive.value = false;
      _gpsWatchId = navigator.geolocation.watchPosition(
        (pos) => {
          const { latitude: lat, longitude: lng, speed } = pos.coords;
          gpsActive.value = true;
          gpsSpeed.value = speed != null ? Math.round(speed * 3.6 * 10) / 10 : null;
          if (_gpsLastPos) {
            const d = haversineKm(_gpsLastPos.lat, _gpsLastPos.lng, lat, lng);
            if (d < 0.3) gpsDistance.value += d;
          }
          _gpsLastPos = { lat, lng };
          if (gpsSpeed.value && gpsSpeed.value > 0.5) {
            gpsPace.value = Math.round(3600 / gpsSpeed.value);
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

    function formatPace(secPerKm) {
      if (!secPerKm) return '–';
      return `${Math.floor(secPerKm/60)}:${String(secPerKm%60).padStart(2,'0')} /km`;
    }

    function formatDist(km) {
      if (km < 1) return Math.round(km * 1000) + ' m';
      return km.toFixed(2) + ' km';
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
      const cfg = extractTimerConfig(selectedWorkout.value);
      timerConfig.value = { ...cfg };
      timerResults.value = [];
      timerPhase.value = 0;
      timerState.value = 'warmup';
      timerSec.value = 10;
      timerElapsed.value = 0;
      if (gpsEnabled.value) startGps();
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
        // Halfway through work phase
        if (timerState.value === 'work') {
          const half = Math.round(timerConfig.value.workSec / 2);
          if (s === half && timerConfig.value.workSec >= 20) speak('Halvveis');
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
        speak(`Start`);
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
          speak(`Ferdig! ${timerConfig.value.count} drag gjennomført`);
        } else {
          timerState.value = 'rest';
          timerSec.value = timerConfig.value.restSec;
          timerElapsed.value = 0;
          beep(440, 300);
          speak('Pause');
        }
      } else if (timerState.value === 'rest') {
        timerPhase.value++;
        timerState.value = 'work';
        timerSec.value = timerConfig.value.workSec;
        timerElapsed.value = 0;
        beep(880, 200); setTimeout(() => beep(1100, 300), 220);
        speak(`Drag ${timerPhase.value}`);
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

    const displayedWorkout = computed(() => {
      if (showStrengthAlternative.value) {
        const sd = todayStrengthDay.value;
        if (!sd) return null;
        const w = {
          exercises: (sd.exercises || []).map(ex =>
            `${ex.name} ${ex.sets}×${ex.reps}${ex.note ? ' (' + ex.note + ')' : ''}`
          ),
          note: sd.finisher ? `Finisher: ${sd.finisher}` : null,
        };
        return adjustWorkout(w, dagsform.value, deloadMode.value, shortMode.value);
      }
      return adjustWorkout(selectedWorkout.value, dagsform.value, deloadMode.value, shortMode.value);
    });

    const displayedTitle = computed(() =>
      showStrengthAlternative.value ? strengthDayTitle.value : selectedSession.value?.title
    );

    const displayedDuration = computed(() => {
      if (shortMode.value) return '20 min';
      if (showStrengthAlternative.value) return todayStrengthDay.value?.duration || '70–75 min';
      return selectedSession.value?.duration;
    });

    const showTimer = computed(() => {
      if (showStrengthAlternative.value) return false;
      return selectedSession.value?.type === 'intervals' ||
        (selectedSession.value?.type === 'ocr' && selectedWorkout.value?.circuit);
    });
    function resolveWorkout(session, athleteId) {
      if (!session) return null;
      const raw = session.athletes?.[athleteId];
      if (raw === null || raw === undefined) return session.common;
      if (typeof raw === 'string') return session.athletes[raw];
      return raw;
    }

    const selectedWorkout = computed(() => {
      const w = resolveWorkout(selectedSession.value, selectedAthlete.value);
      return replaceTokensDeep(w, athleteLevels.value);
    });

    // ── LEVEL CALCULATION ──────────────────────────────────────────────────
    function replaceTokensDeep(obj, levels) {
      if (!levels || obj === null || obj === undefined) return obj;
      if (typeof obj === 'string') {
        return obj
          .replace(/\{\{threshold\}\}/g, levels.threshold_run_kmh + ' km/t')
          .replace(/\{\{easy\}\}/g,      levels.easy_run_kmh      + ' km/t')
          .replace(/\{\{ocr_run\}\}/g,   levels.ocr_run_kmh       + ' km/t')
          .replace(/\{\{strides\}\}/g,   levels.strides_kmh       + ' km/t')
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

    // ── STRENGTH ALTERNATIVE ───────────────────────────────────────────────
    const STRENGTH_DAYS = { 1: 'monday', 3: 'wednesday', 5: 'friday' };
    const STRENGTH_FALLBACK = { 0: 'monday', 2: 'monday', 4: 'monday', 6: 'monday' };

    const todayStrengthKey = computed(() => {
      const d = new Date().getDay();
      return STRENGTH_DAYS[d] || STRENGTH_FALLBACK[d];
    });

    const todayStrengthDay = computed(() => STRENGTH_PROGRAM.days[todayStrengthKey.value]);

    const strengthDayTitle = computed(() => todayStrengthDay.value?.title || 'Styrkeøkt');

    // ── DAGSFORM HINT ──────────────────────────────────────────────────────
    const dagsformHint = computed(() => {
      if (dagsform.value === 'yellow') return PROGRAM_DATA.dagsformRules.yellow;
      if (dagsform.value === 'red') return PROGRAM_DATA.dagsformRules.red;
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
        const hangStep = workout?.circuit?.find(s => /hang/i.test(s));
        if (hangStep) { const hm = hangStep.match(/(\d+)(?:–(\d+))?/); if (hm) m.hang_sec = hm[2] ? Math.round((+hm[1] + +hm[2]) / 2) : +hm[1]; }
        const carryStep = workout?.circuit?.find(s => /carry/i.test(s));
        if (carryStep) { const cm = carryStep.match(/(\d+\.?\d*)\s*kg/); if (cm) m.carry_kg = +cm[1]; }
      } else if (type === 'strength') {
        m.weight_pct = 100;
        const firstEx = workout?.exercises?.[0] ? parseExercise(workout.exercises[0]) : null;
        if (firstEx?.sets) m.sets_done = firstEx.sets;
      }
      workoutMetrics.value = m;
    }

    function saveWorkoutLog(rpe) {
      markSessionDone(selectedSessionKey.value);
      const rpeHist = JSON.parse(localStorage.getItem(STORAGE.rpe(selectedAthlete.value)) || '[]');
      rpeHist.push({ date: today(), rpe, session: selectedSessionKey.value });
      localStorage.setItem(STORAGE.rpe(selectedAthlete.value), JSON.stringify(rpeHist));
      const logs = JSON.parse(localStorage.getItem(STORAGE.wlog(selectedAthlete.value)) || '[]');
      logs.push({
        date: today(), weekNumber: currentWeekNumber.value,
        sessionKey: selectedSessionKey.value,
        type: selectedSession.value?.type || 'unknown',
        rpe, metrics: { ...workoutMetrics.value },
      });
      localStorage.setItem(STORAGE.wlog(selectedAthlete.value), JSON.stringify(logs));
    }

    function saveNote() {

    function saveNote() {
      if (!todayNote.value.trim()) return;
      const history = JSON.parse(localStorage.getItem(STORAGE.note(selectedAthlete.value)) || '[]');
      history.push({ date: today(), text: todayNote.value.trim(), session: selectedSessionKey.value });
      localStorage.setItem(STORAGE.note(selectedAthlete.value), JSON.stringify(history));
      noteSaved.value = true;
      setTimeout(() => { noteSaved.value = false; }, 2000);
    }

    // ── PROGRESS ───────────────────────────────────────────────────────────
    const rpeHistory = computed(() => {
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
    const workoutLogs = computed(() =>
      JSON.parse(localStorage.getItem(STORAGE.wlog(selectedAthlete.value)) || '[]')
    );

    const logFields = computed(() =>
      SESSION_LOG_FIELDS[selectedSession.value?.type] || SESSION_LOG_FIELDS.recovery
    );

    const speedLogs = computed(() =>
      workoutLogs.value.filter(l => l.metrics?.speed_kmh)
        .map(l => ({ date: l.date, value: l.metrics.speed_kmh, type: l.type })).slice(-15)
    );
    const intervalLogs = computed(() =>
      workoutLogs.value.filter(l => l.type === 'intervals' && l.metrics?.sets_done)
        .map(l => ({ date: l.date, value: l.metrics.sets_done })).slice(-15)
    );
    const recoveryLogs = computed(() =>
      workoutLogs.value.filter(l => l.type === 'recovery' && l.metrics?.duration_min)
        .map(l => ({ date: l.date, value: l.metrics.duration_min })).slice(-15)
    );
    const strengthLogs = computed(() =>
      workoutLogs.value.filter(l => l.type === 'strength' && l.metrics?.weight_pct)
        .map(l => ({ date: l.date, value: l.metrics.weight_pct })).slice(-15)
    );

    function sparkPoints(data, w = 280, h = 50) {
      if (!data.length) return '';
      const vals = data.map(d => d.value);
      const min = Math.min(...vals); const max = Math.max(...vals); const range = max - min || 1;
      return data.map((d, i) => {
        const x = data.length === 1 ? w / 2 : (i / (data.length - 1)) * w;
        const y = h - ((d.value - min) / range) * (h - 12) - 6;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      }).join(' ');
    }
    function sparkDots(data, w = 280, h = 50) {
      if (!data.length) return [];
      const vals = data.map(d => d.value);
      const min = Math.min(...vals); const max = Math.max(...vals); const range = max - min || 1;
      return data.map((d, i) => {
        const x = data.length === 1 ? w / 2 : (i / (data.length - 1)) * w;
        const y = h - ((d.value - min) / range) * (h - 12) - 6;
        return { x: +x.toFixed(1), y: +y.toFixed(1), value: d.value, date: d.date };
      });
    }
    const testTypes = [
      {
        id: 'run20min', label: 'Løpetest 20 min', unit: 'm', higherBetter: true,
        hint: 'Distanse løpt på 20 min (meter)',
        targetRpe: '8–9',
        description: 'Varm opp 10 min rolig. Løp på mølla (0–1% stigning) i nøyaktig 20 min – så langt du klarer. Registrer meter. Brukes til å beregne sonene dine automatisk.',
      },
      {
        id: 'ocr_flytest', label: 'OCR flytest', unit: 'sek', higherBetter: false,
        hint: 'Total tid i sekunder',
        targetRpe: '9',
        description: 'Gjennomfør en fast OCR-runde med forhåndsbestemt rute og hindringer. Mål total tid fra start til mål i sekunder. Bruk samme rute hver gang.',
      },
      {
        id: 'deadhang', label: 'Maks dead hang', unit: 'sek', higherBetter: true,
        hint: 'Sekunder',
        targetRpe: '10',
        description: 'Heng i pullup-stang med rett kropp og aktive skuldre – ingen kipping. Mål sekunder til du slipper. Gjør to forsøk med 3 min pause, registrer beste.',
      },
      {
        id: 'carry', label: 'Carry-tid', unit: 'sek', higherBetter: true,
        hint: 'Sekunder',
        targetRpe: '8–9',
        description: 'Bær Farmer\'s carry-vekt (se ditt nivå i kg) og gå så lenge du klarer uten å sette ned. Mål sekunder. Alternativt: fast distanse, mål tid.',
      },
      {
        id: 'cooper', label: 'Cooper-test (12 min)', unit: 'm', higherBetter: true,
        hint: 'Meter (f.eks. 2800)',
        targetRpe: '8–9',
        description: 'Varm opp 10 min. Løp utendørs eller på mølla i nøyaktig 12 min – så langt du klarer. Mål total distanse i meter.',
      },
      {
        id: 'rowing2k', label: '2000m romaskin', unit: 'sek', higherBetter: false,
        hint: 'Sekunder (f.eks. 420)',
        targetRpe: '9',
        description: 'Varm opp 5 min rolig roing. Ro 2000m for best mulig tid. Hold igjen de første 500m – legg ut på ~70% og bygg gradvis. Mål tid i sekunder.',
      },
      {
        id: 'squat3rm', label: 'Knebøy 3RM', unit: 'kg', higherBetter: true,
        hint: 'Kilo',
        targetRpe: '9',
        description: 'Varm opp gradvis (50%, 65%, 75%, 85%). Finn høyeste vekt du klarer 3 teknisk rene repetisjoner. Bruk 3–5 minutter pause mellom forsøk. Stopp om teknikken svikter.',
      },
      {
        id: 'deadlift3rm', label: 'Markløft 3RM', unit: 'kg', higherBetter: true,
        hint: 'Kilo',
        targetRpe: '9',
        description: 'Varm opp grundig med lette vekter. Finn høyeste vekt for 3 rene repetisjoner med god rygglinje og benstopp. Stopp umiddelbart om teknikken svikter.',
      },
      {
        id: 'bench3rm', label: 'Benkpress 3RM', unit: 'kg', higherBetter: true,
        hint: 'Kilo',
        targetRpe: '9',
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
      testHistoryRef.value = [...testHistoryRef.value, entry];
      localStorage.setItem(STORAGE.tests, JSON.stringify(testHistoryRef.value));
      newTest.value = { athlete: selectedAthlete.value, type: newTest.value.type, value: '', date: today() };
    }

    // ── ATHLETE LEVELS (beregnet fra tester, fallback til nivåprofil) ─────────
    const athleteLevels = computed(() => {
      const id = selectedAthlete.value;
      const runTests = testHistory.value.filter(t => t.athlete === id && t.type === 'run20min')
        .sort((a, b) => a.date > b.date ? 1 : -1);
      const hangTests = testHistory.value.filter(t => t.athlete === id && t.type === 'deadhang')
        .sort((a, b) => a.date > b.date ? 1 : -1);

      const athlete  = ATHLETES.find(a => a.id === id);
      const profile  = athlete?.level ? TRAINING_LEVELS[athlete.level] : null;

      if (!runTests.length) {
        if (!profile) return null;
        return {
          threshold_run_kmh: profile.threshold_kmh,
          easy_run_kmh:      profile.easy_run_kmh,
          ocr_run_kmh:       profile.ocr_run_kmh,
          strides_kmh:       profile.strides_kmh,
          max_hang_sec:      hangTests.length ? hangTests[hangTests.length-1].value : profile.hang_sec,
          carry_kg:          profile.carry_kg,
          level_label:       profile.label,
          last_updated:      null,
          from_profile:      true,
        };
      }

      const latest    = runTests[runTests.length - 1];
      const threshold = Math.round(latest.value * 3 / 1000 * 10) / 10;
      return {
        threshold_run_kmh: threshold,
        easy_run_kmh:      Math.round(threshold * 0.88 * 10) / 10,
        ocr_run_kmh:       Math.round(threshold * 0.96 * 10) / 10,
        strides_kmh:       Math.round(threshold * 1.15 * 10) / 10,
        max_hang_sec:      hangTests.length ? hangTests[hangTests.length-1].value : (profile?.hang_sec ?? null),
        carry_kg:          profile?.carry_kg ?? null,
        level_label:       'Beregnet fra test',
        last_updated:      latest.date,
        from_profile:      false,
        from_distance_m:   latest.value,
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
      rpeLogged.value = null;
      showStrengthAlternative.value = false;
      deloadMode.value = false;
      shortMode.value = false;
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

      viewWeek.value = currentWeekNumber.value;
      selectedSessionKey.value = null;

      // Register service worker for PWA
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js').catch(() => {});
      }
    });

    watch(dagsform, (v) => localStorage.setItem(STORAGE.dagsform, v));
    watch(selectedSessionKey, (key) => {
      if (key) prefillMetrics(selectedSession.value, selectedWorkout.value);
      else workoutMetrics.value = {};
    });
    watch(selectedAthlete, (id) => { newTest.value.athlete = id; });

    return {
      // state
      selectedAthlete, dagsform, view, viewWeek, selectedSessionKey,
      showStrengthAlternative, deloadMode, shortMode,
      todayNote, noteSaved, newTest, workoutMetrics,
      // computed
      athletes, currentWeek, currentWeekNumber, viewingWeekData, viewingWeekWorkouts, totalWeeks,
      daysToRace, selectedSession,
      todayStrengthDay, strengthDayTitle,
      selectedWorkout, displayedWorkout, displayedTitle, displayedDuration,
      dagsformHint, weekDays, rpeHistory, notesHistory,
      completedSessions, currentStreak, avgRpe,
      testTypes, testPlaceholder, selectedTestType, testHistory, testReminders,
      athleteLevels, upcomingTests, testCalendar,
      equipment, currentAthleteName,
      logFields, workoutLogs, speedLogs, intervalLogs, recoveryLogs, strengthLogs,
      SESSION_LOG_FIELDS,
      // exercise parser
      parseExercise, parseExercises, deloadExercises, deloadCircuit,
      // timer
      timerState, timerPhase, timerSec, timerResults, timerConfig, timerEditing,
      timerPct, isPaused, showTimer,
      audioMuted,
      gpsEnabled, gpsActive, gpsSpeed, gpsDistance, gpsPace,
      formatSec, formatPace, formatDist,
      startTimer, endIntervalEarly, pauseTimer, resetTimer, toggleGps,
      // methods
      selectAthlete, selectSession, navigateWeek, weekDates,
      rpeClass, saveWorkoutLog, saveNote, saveTest,
      isSessionDone, isSessionDoneForWeek, markSessionDone,
      testsOfType, myTestsOfType, isPR, athleteName, athleteColor,
      sparkPoints, sparkDots,
      formatDate, formatShortDate,
    };
  }
}).mount('#app');
