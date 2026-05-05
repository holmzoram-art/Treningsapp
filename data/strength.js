const STRENGTH_PROGRAM = {
  meta: {
    name: "Styrkeprogram",
    description: "3-dagers split: Mandag Pull+Bein, Onsdag Push+Bein, Fredag Helkropp/Tillegg"
  },

  days: {
    monday: {
      title: "Pull + Bein",
      duration: "60–75 min",
      exercises: [
        { name: "Lat Pulldown Close Grip", sets: 3, reps: "8–12", restSec: 120, note: "" },
        { name: "Landmine Row",             sets: 3, reps: "10–12", restSec: 135, note: "" },
        { name: "Face Pull",                sets: 3, reps: "12–15", restSec: 60,  note: "Kabel, albuene høyt" },
        { name: "Seated Leg Curl",          sets: 3, reps: "12–15", restSec: 180, note: "" },
        { name: "Markløft (stang)",         sets: 3, reps: "5–6",   restSec: 150, note: "Fokus på teknikk" }
      ],
      dagsform: {
        yellow: "Reduser vekt 20%. Behold sett og reps.",
        red:    "2 sett i stedet for 3. 50% vekt."
      }
    },

    wednesday: {
      title: "Push + Bein",
      duration: "60–75 min",
      exercises: [
        { name: "Benkpress (manualer)",       sets: 4, reps: "8–10",  restSec: 120, note: "" },
        { name: "Incline manualer",            sets: 3, reps: "8–10",  restSec: 120, note: "" },
        { name: "Arnold Press",                sets: 3, reps: "10–12", restSec: 120, note: "" },
        { name: "Chest Dip",                   sets: 3, reps: "8–12",  restSec: 180, note: "Legg deg fremover" },
        { name: "Seated Chest Flys (kabel)",   sets: 3, reps: "12–15", restSec: 120, note: "" },
        { name: "Leg Extension (maskin)",      sets: 3, reps: "12–15", restSec: 165, note: "" }
      ],
      dagsform: {
        yellow: "Reduser vekt 20%. Behold sett og reps.",
        red:    "2 sett i stedet for 3–4. 50% vekt. Dropp dips."
      }
    },

    friday: {
      title: "Helkropp / Tillegg",
      duration: "45–60 min",
      exercises: [
        { name: "Seated Cable Row (V-grep)", sets: 3, reps: "8–12",  restSec: 120, note: "" },
        { name: "Low Cable Fly Crossovers",  sets: 3, reps: "12–15", restSec: 90,  note: "" },
        { name: "Behind the Back Curl",      sets: 3, reps: "12–15", restSec: 135, note: "" },
        { name: "Lateral Raise Incline",     sets: 3, reps: "12–15", restSec: 90,  note: "" },
        { name: "Planke",                    sets: 3, reps: "30–60 sek", restSec: 90, note: "", tags: ["timed"] }
      ],
      dagsform: {
        yellow: "Reduser vekt 20%. Behold sett og reps.",
        red:    "2 sett i stedet for 3. 50% vekt."
      }
    }
  },

  equipment: [
    { category: "Stang og vekter", items: ["Stang til markløft og benkpress", "Vektskiver (diverse)", "Power rack / løftestativ"] },
    { category: "Manualer", items: ["Manualer i forskjellige vekter", "Til press, curls, sidehevinger"] },
    { category: "Kabelmaskin", items: ["Kabelmaskin (rows, flyes, crossovers, biceps)"] },
    { category: "Maskiner", items: ["Seated leg curl (maskin)", "Leg extension (maskin)"] },
    { category: "Pull-up og dips", items: ["Pull-up/lat pulldown stang", "Dips-stativ eller parallelle stenger"] },
    { category: "Benker", items: ["Flat benk", "Justerbar benk (incline)"] },
    { category: "Cardio", items: ["2× tredemølle", "2× romaskin"] },
    { category: "Funksjonelt utstyr", items: ["Farmer's carry håndtak", "Sandsekk", "Boks/step", "Resistance bands"] }
  ]
};
