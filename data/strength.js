const STRENGTH_PROGRAM = {
  meta: {
    name: "Styrkeprogram – Push/Pull/Legs",
    description: "3-dagers split: Mandag Push, Onsdag Pull, Fredag Bein. 70–75 min per økt."
  },

  days: {
    monday: {
      title: "Push – Bryst, Skuldre, Triceps",
      duration: "70–75 min",
      warmup: [
        "Lett cardio 5 min",
        "Band pull-aparts 2×15",
        "Armsirkler og skuldermobilitet",
        "Scapular push-ups 2×10"
      ],
      exercises: [
        { name: "Benkpress (stang)", sets: 4, reps: "6–8", note: "Fokus på eksplosiv opp, kontrollert ned" },
        { name: "Incline dumbell press", sets: 3, reps: "8–10", note: "" },
        { name: "Overhead press (stang)", sets: 4, reps: "6–8", note: "Sittende" },
        { name: "Sideheving (manualer)", sets: 3, reps: "12–15", note: "" },
        { name: "Kabelkorsflys", sets: 3, reps: "10–12", note: "Kan erstattes med dumbell flyes" },
        { name: "Triceps extension", sets: 3, reps: "8–10", note: "" },
        { name: "Skull crushers (manualer)", sets: 3, reps: "12–15", note: "" }
      ],
      finisher: "Push-up dropset til utmattelse – 1–2 sett (valgfritt)",
      hevyUrl: "https://hevy.com/routine/atYcTXceLkh",
      dagsform: {
        yellow: "Reduser vekt 20–30%. Behold sett og repetisjoner.",
        red: "3 sett i stedet for 4. 50% vekt. Dropp finisher."
      }
    },

    wednesday: {
      title: "Pull – Rygg, Biceps, Bakre Deltoider",
      duration: "70–75 min",
      warmup: [
        "Romaskin 5 min",
        "Band pull-aparts 2×15",
        "Scapula pull-ups 2×10",
        "Lette bakre deltoideheving"
      ],
      exercises: [
        { name: "Weighted pull-ups / lat pulldown", sets: 4, reps: "6–10", note: "Vektet pull-up hvis mulig, ellers lat pulldown" },
        { name: "Markløft (stang)", sets: 4, reps: "6–8", note: "Fokus på teknikk" },
        { name: "Enarms sittende ro (manualer)", sets: 3, reps: "8–10 per side", note: "" },
        { name: "Bakre deltoid flyes (kabel)", sets: 3, reps: "12–15", note: "" },
        { name: "Incline dumbell curls / stangcurl", sets: 3, reps: "10–12", note: "" },
        { name: "Hammer curls", sets: 3, reps: "10–12", note: "" },
        { name: "High row (manualer, albuene høyt)", sets: 3, reps: "12–15", note: "" }
      ],
      finisher: "Biceps 21s eller curl dropset – 1–2 sett (valgfritt)",
      hevyUrl: "https://hevy.com/routine/2NI1B795A2i",
      dagsform: {
        yellow: "Reduser vekt 20–30%. Dropp vektet pull-up, bruk lat pulldown.",
        red: "3 sett i stedet for 4. 50% vekt. Dropp markløft."
      }
    },

    friday: {
      title: "Bein – Quads, Hamstrings, Seter, Legg",
      duration: "70–75 min",
      warmup: [
        "Sykkel eller romaskin 5 min",
        "Glute bridges 2×15",
        "Kroppsvekt knebøy 2×10",
        "Dynamisk benstrekk"
      ],
      exercises: [
        { name: "Knebøy (stang)", sets: 4, reps: "6–8", note: "Full dybde" },
        { name: "Romanian deadlift (stang)", sets: 4, reps: "8–10", note: "Kontrollert ned, strekk i hamstring" },
        { name: "Bulgarian split squat", sets: 3, reps: "10–12 per ben", note: "" },
        { name: "Gliding leg curls", sets: 3, reps: "12–15", note: "" },
        { name: "Leggpress / leggcurl (maskin)", sets: 3, reps: "12–15", note: "Valgfritt tillegg" },
        { name: "Calf raises (hold tunge manualer)", sets: 4, reps: "15–20", note: "" }
      ],
      finisher: "Kroppsvekt jump squats – 1–2 runder (valgfritt)",
      hevyUrl: "https://hevy.com/routine/8ziCqtORzwN",
      dagsform: {
        yellow: "Reduser vekt 20–30%. Dropp valgfrie øvelser.",
        red: "2 sett i stedet for 4. 50% vekt. Dropp split squats og finisher."
      }
    }
  },

  equipment: [
    { category: "Stang og vekter", items: ["Stang til benkpress, knebøy, markløft og OHP", "Vektskiver (diverse)", "Power rack / løftestativ"] },
    { category: "Manualer", items: ["Manualer i forskjellige vekter", "Til press, flyes, curls, sidehevinger"] },
    { category: "Kabelmaskin", items: ["Kabelmaskin (korsflys, bakre deltoid, triceps)"] },
    { category: "Pull-up og TRX", items: ["Pull-up stang (vektet pull-up)", "TRX straps (ro og diverse)"] },
    { category: "Benker", items: ["Flat benk", "Justerbar benk (incline)"] },
    { category: "Cardio", items: ["2× tredemølle", "2× romaskin"] },
    { category: "Funksjonelt utstyr", items: ["Farmer's carry håndtak", "Sandsekk", "Boks/step", "Resistance bands"] }
  ]
};
