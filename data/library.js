// Frittstående øktbibliotek — auto-skalerer med utøverens nivå via {{threshold}}/{{easy}}/{{strides}}/{{marathon_pace}}
const LIBRARY_SESSIONS = {

  // ── ROLIG ───────────────────────────────────────────────────────────────────
  easy_30:  {
    title: 'Rolig 30 min', category: 'Rolig', type: 'recovery', duration: '30 min',
    common: { options: ['Mølle: 30 min @ {{easy}} · 2–3% stigning', 'Utendørs: 30 min @ {{easy}} · flatt terreng'] },
    dagsform: { yellow: 'Gå i stedet – ingen løping i dag', red: 'Hvil' }
  },
  easy_45:  {
    title: 'Rolig 45 min', category: 'Rolig', type: 'recovery', duration: '45 min',
    common: { options: ['Mølle: 45 min @ {{easy}} · 2–3% stigning', 'Utendørs: 45 min @ {{easy}} · flatt terreng'] },
    dagsform: { yellow: '30 min i stedet', red: 'Hvil' }
  },

  // ── LANGTUR ──────────────────────────────────────────────────────────────────
  long_60:  {
    title: 'Langtur 60 min', category: 'Langtur', type: 'recovery', duration: '60 min',
    common: { options: ['Mølle: 60 min @ {{easy}} · 1–2%', 'Utendørs: 60 min @ {{easy}} · rolig terreng'] },
    dagsform: { yellow: '45 min', red: '30 min' }
  },
  long_90:  {
    title: 'Langtur 90 min', category: 'Langtur', type: 'recovery', duration: '90 min',
    common: { options: ['Mølle: 90 min @ {{easy}} · 1–2%', 'Utendørs: 90 min @ {{easy}} · rolig terreng'] },
    dagsform: { yellow: '60 min', red: '45 min' }
  },
  long_120: {
    title: 'Langtur 2 timer', category: 'Langtur', type: 'recovery', duration: '120 min',
    common: { options: ['Mølle: 120 min @ {{easy}} · 1%', 'Utendørs: 120 min @ {{easy}} · lett terreng'] },
    dagsform: { yellow: '90 min', red: '60 min' }
  },

  // ── TERSKEL ──────────────────────────────────────────────────────────────────
  tempo_20: {
    title: 'Tempoløp 20 min', category: 'Terskel', type: 'intervals', duration: '30–35 min',
    common: { part1: { machine: 'Mølle eller utendørs', sets: '1×20 min', speed: '{{threshold}}', incline: '0–1%', rest: '5 min rolig ned' } },
    dagsform: { yellow: '15 min', red: 'Bytt til rolig 30 min' }
  },
  tempo_30: {
    title: 'Tempoløp 30 min', category: 'Terskel', type: 'intervals', duration: '40–45 min',
    common: { part1: { machine: 'Mølle eller utendørs', sets: '1×30 min', speed: '{{threshold}}', incline: '0–1%', rest: '5 min rolig ned' } },
    dagsform: { yellow: '20 min', red: '15 min' }
  },
  tempo_2x15: {
    title: '2×15 min terskel', category: 'Terskel', type: 'intervals', duration: '45–50 min',
    common: {
      part1: { machine: 'Mølle eller utendørs', sets: '2×15 min', speed: '{{threshold}}', incline: '0–1%', rest: '5 min pause' },
      note: '5 min oppvarming + 5 min nedjogg'
    },
    dagsform: { yellow: '2×10 min', red: '20 min sammenhengende' }
  },

  // ── INTERVALL ────────────────────────────────────────────────────────────────
  int_400:  {
    title: '8×400m (fart)', category: 'Intervall', type: 'intervals', duration: '35–45 min',
    common: { part1: { machine: 'Mølle eller bane', sets: '8×90 sek', speed: '{{strides}}', incline: '0%', rest: '90 sek pause' } },
    dagsform: { yellow: '6×90 sek', red: 'Rolig løp i stedet' }
  },
  int_1k:   {
    title: '5×1km (terskel)', category: 'Intervall', type: 'intervals', duration: '40–50 min',
    common: { part1: { machine: 'Mølle eller bane', sets: '5×4 min', speed: '{{threshold}}', incline: '0–1%', rest: '2 min pause' } },
    dagsform: { yellow: '4×4 min', red: 'Rolig 30 min' }
  },
  int_3min: {
    title: '6×3 min terskel', category: 'Intervall', type: 'intervals', duration: '40–45 min',
    common: { part1: { machine: 'Mølle eller utendørs', sets: '6×3 min', speed: '{{threshold}}', incline: '0–1%', rest: '2 min pause' } },
    dagsform: { yellow: '5×3 min, −0.3 km/t', red: 'Halvér drag' }
  },
  int_hill: {
    title: 'Bakkeintervaller 8×45 sek', category: 'Intervall', type: 'intervals', duration: '35–40 min',
    common: { part1: { machine: 'Utendørs eller mølle', sets: '8×45 sek', speed: '{{threshold}}', incline: '6–8%', rest: '90 sek pause (gå ned)' } },
    dagsform: { yellow: '6×45 sek', red: 'Rolig bakkejogg' }
  },

  // ── MARATON ──────────────────────────────────────────────────────────────────
  mara_mp:  {
    title: 'Maratontempo 20 min', category: 'Maraton', type: 'intervals', duration: '35–40 min',
    common: { part1: { machine: 'Mølle eller utendørs', sets: '1×20 min', speed: '{{marathon_pace}}', incline: '0–1%', rest: '5 min rolig ned' } },
    dagsform: { yellow: '15 min', red: 'Bytt til rolig løp' }
  },
  mara_mp2: {
    title: '2×15 min maratontempo', category: 'Maraton', type: 'intervals', duration: '45–55 min',
    common: { part1: { machine: 'Mølle eller utendørs', sets: '2×15 min', speed: '{{marathon_pace}}', incline: '0–1%', rest: '5 min pause' } },
    dagsform: { yellow: '1×20 min', red: '30 min rolig' }
  },
  mara_long: {
    title: 'Langtur + MP-avslutning', category: 'Maraton', type: 'recovery', duration: '80–100 min',
    common: {
      options: ['Del 1: 60–70 min @ {{easy}} (rolig)', 'Del 2: 20 min @ {{marathon_pace}} (maratontempo)'],
      note: 'Start rolig – bytt til maratontempo de siste 20 minuttene. Simulerer siste del av et løp.'
    },
    dagsform: { yellow: 'Dropp MP-del, bare rolig 60 min', red: '45 min easy' }
  },
  mara_prog: {
    title: 'Progresjonslangtur 70 min', category: 'Maraton', type: 'recovery', duration: '70 min',
    common: {
      options: [
        'Del 1: 30 min @ {{easy}} (oppbygging)',
        'Del 2: 20 min @ {{marathon_pace}} (maratontempo)',
        'Del 3: 10 min @ {{threshold}} (terskelpush)',
        'Del 4: 10 min rolig nedjogg'
      ],
      note: 'Klassisk progresjonssøkt: hvert segment er raskere enn forrige.'
    },
    dagsform: { yellow: 'Kun del 1–2 (50 min)', red: '40 min rolig' }
  },
};

const LIBRARY_CATEGORIES = ['Rolig', 'Langtur', 'Terskel', 'Intervall', 'Maraton'];
