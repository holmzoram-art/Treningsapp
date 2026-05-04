const { createApp, ref, computed, watch, onMounted } = Vue;

createApp({
  setup() {

    // ── STATE ──────────────────────────────────────────────────────────────
    const selectedAthlete = ref('sondre');
    const dagsform = ref('green');
    const view = ref('today');
    const viewWeek = ref(1);
    const showStrengthAlternative = ref(false);
    const deloadMode = ref(false);
    const shortMode = ref(false);
    const rpeLogged = ref(null);
    const todayNote = ref('');
    const noteSaved = ref(false);
    const newTest = ref({ athlete: 'sondre', type: 'cooper', value: '', date: today() });

    // localStorage keys
    const STORAGE = {
      athlete: 'onitio_athlete',
      dagsform: 'onitio_dagsform',
      rpe: (id) => `onitio_rpe_${id}`,
      note: (id) => `onitio_note_${id}`,
      tests: 'onitio_tests',
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
      const start = new Date(PROGRAM_DATA.meta.programStart + 'T00:00:00');
      const monday = new Date(start.getTime() + (weekNum - 1) * 7 * 86400000);
      const friday = new Date(monday.getTime() + 4 * 86400000);
      return monday.toLocaleDateString('nb-NO', { day: '2-digit', month: '2-digit' }) + ' – ' +
             friday.toLocaleDateString('nb-NO', { day: '2-digit', month: '2-digit' });
    }

    // ── CURRENT WEEK CALCULATION ───────────────────────────────────────────
    const currentWeekNumber = computed(() => {
      const start = new Date(PROGRAM_DATA.meta.programStart + 'T00:00:00');
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const days = Math.floor((now - start) / 86400000);
      const n = Math.floor(days / 7) + 1;
      return Math.max(1, Math.min(n, PROGRAM_DATA.totalWeeks));
    });

    const currentWeek = computed(() =>
      PROGRAM_DATA.weeks.find(w => w.weekNumber === currentWeekNumber.value)
    );

    const viewingWeekData = computed(() =>
      PROGRAM_DATA.weeks.find(w => w.weekNumber === viewWeek.value)
    );

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
    const NEXT_DAY = { 0: 'Mandag', 1: 'Tirsdag', 2: 'Tirsdag', 3: 'Torsdag', 4: 'Torsdag', 5: 'Fredag', 6: 'Mandag' };

    const todaySessionKey = computed(() => DAY_MAP[new Date().getDay()] || null);

    const todayLabel = computed(() => {
      const d = new Date();
      const dateStr = d.toLocaleDateString('nb-NO', { weekday: 'long', day: 'numeric', month: 'long' });
      return dateStr.charAt(0).toUpperCase() + dateStr.slice(1) + ` · Uke ${currentWeekNumber.value}`;
    });

    const nextTrainingDay = computed(() => NEXT_DAY[new Date().getDay()] || 'Mandag');

    const todaySession = computed(() => {
      if (!todaySessionKey.value || !currentWeek.value) return null;
      return currentWeek.value.sessions?.[todaySessionKey.value] || null;
    });

    // ── WORKOUT RESOLVER ───────────────────────────────────────────────────
    function resolveWorkout(session, athleteId) {
      if (!session) return null;
      const raw = session.athletes?.[athleteId];
      if (raw === null || raw === undefined) return session.common;
      if (typeof raw === 'string') return session.athletes[raw]; // e.g. kjetil -> geir
      return raw;
    }

    const todayWorkout = computed(() => resolveWorkout(todaySession.value, selectedAthlete.value));

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

    function sessionId() {
      return `${today()}_${selectedAthlete.value}_${todaySessionKey.value || 'rest'}`;
    }

    function logRpe(n) {
      rpeLogged.value = n;
      const history = JSON.parse(localStorage.getItem(STORAGE.rpe(selectedAthlete.value)) || '[]');
      history.push({ date: today(), rpe: n, session: todaySessionKey.value });
      localStorage.setItem(STORAGE.rpe(selectedAthlete.value), JSON.stringify(history));
    }

    function saveNote() {
      if (!todayNote.value.trim()) return;
      const history = JSON.parse(localStorage.getItem(STORAGE.note(selectedAthlete.value)) || '[]');
      history.push({ date: today(), text: todayNote.value.trim(), session: todaySessionKey.value });
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

    const completedSessions = computed(() => rpeHistory.value.length);

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

    // ── TESTS ─────────────────────────────────────────────────────────────
    const testTypes = [
      { id: 'cooper', label: 'Cooper-test (12 min)', unit: 'm' },
      { id: 'rowing2k', label: '2000m romaskin', unit: 'sek' },
      { id: 'deadhang', label: 'Maks dead hang', unit: 'sek' },
      { id: 'squat1rm', label: 'Knebøy 1RM', unit: 'kg' },
      { id: 'deadlift1rm', label: 'Markløft 1RM', unit: 'kg' },
      { id: 'bench1rm', label: 'Benkpress 1RM', unit: 'kg' },
    ];

    const testPlaceholder = computed(() => {
      const map = { cooper: 'Meter (f.eks. 2800)', rowing2k: 'Sekunder (f.eks. 420)', deadhang: 'Sekunder', squat1rm: 'Kilo', deadlift1rm: 'Kilo', bench1rm: 'Kilo' };
      return map[newTest.value.type] || '';
    });

    const testHistory = computed(() => JSON.parse(localStorage.getItem(STORAGE.tests) || '[]'));

    function testsOfType(type) {
      return testHistory.value.filter(t => t.type === type).sort((a, b) => a.date > b.date ? 1 : -1);
    }

    function isPR(entry, type) {
      const byAthlete = testsOfType(type).filter(t => t.athlete === entry.athlete);
      const isHigherBetter = type !== 'rowing2k';
      const best = isHigherBetter
        ? Math.max(...byAthlete.map(t => +t.value))
        : Math.min(...byAthlete.map(t => +t.value));
      return +entry.value === best;
    }

    function saveTest() {
      if (!newTest.value.value) return;
      const tests = JSON.parse(localStorage.getItem(STORAGE.tests) || '[]');
      tests.push({ ...newTest.value, value: +newTest.value.value });
      localStorage.setItem(STORAGE.tests, JSON.stringify(tests));
      newTest.value = { athlete: selectedAthlete.value, type: newTest.value.type, value: '', date: today() };
      // Force reactivity
      localStorage.setItem(STORAGE.tests + '_ts', Date.now());
    }

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

      // Register service worker for PWA
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js').catch(() => {});
      }
    });

    watch(dagsform, (v) => localStorage.setItem(STORAGE.dagsform, v));

    return {
      // state
      selectedAthlete, dagsform, view, viewWeek,
      showStrengthAlternative, deloadMode, shortMode,
      rpeLogged, todayNote, noteSaved, newTest,
      // computed
      athletes, currentWeek, viewingWeekData, totalWeeks,
      daysToRace, todaySessionKey, todayLabel, nextTrainingDay,
      todaySession, todayWorkout, todayStrengthDay, strengthDayTitle,
      dagsformHint, weekDays, rpeHistory, notesHistory,
      completedSessions, currentStreak, avgRpe,
      testTypes, testPlaceholder, testHistory, testReminders,
      equipment, currentAthleteName,
      // methods
      selectAthlete, navigateWeek, weekDates,
      rpeClass, logRpe, saveNote, saveTest,
      testsOfType, isPR, athleteName, athleteColor,
      formatDate, formatShortDate,
    };
  }
}).mount('#app');
