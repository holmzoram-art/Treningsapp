const PROGRAM_DATA = {
  meta: {
    programName: "OCR/Cardio Treningsprogram 2026 – Onitio",
    programStart: "2026-01-12",
    raceDate: "2026-05-09",
    navyRaceDate: "2026-08-29",
    totalWeeks: 50,
    testCalendar: [
      { weekNumber: 21, type: 'run20min',    label: 'Løpetest 20 min' },
      { weekNumber: 24, type: 'ocr_flytest', label: 'OCR flytest' },
      { weekNumber: 28, type: 'run20min',    label: 'Løpetest 20 min' },
      { weekNumber: 32, type: 'ocr_flytest', label: 'OCR flytest (før Navy Race)' },
      { weekNumber: 34, type: 'run20min',    label: 'Løpetest 20 min (etter Navy Race)' },
      { weekNumber: 40, type: 'run20min',    label: 'Løpetest 20 min (HM-block)' },
    ]
  },

  dagsformRules: {
    green:  "Grønn dag – Kjør som beskrevet. Full lengde på drag og runder.",
    yellow: "Gul dag – Hold samme tidsbruk, men lettere intensitet. Løp: −0.3–0.7 km/t eller −1–2% stigning. Roing: −10–20 watt. Styrke: 20–30% lettere vekter.",
    red:    "Rød dag – 50–70% av økten. Kortere drag, gå i stedet for løp, lettere vekter. Dropp hang/burpees ved behov."
  },

  weeks: [

    // ─── FASE 1: Januar–Februar 2026 (Uke 1–8) ───────────────────────────────

    {
      weekNumber: 1, phase: 1, label: "Uke 1", startDate: "2026-01-12", isDeload: false, note: null,
      sessions: {
        monday: {
          title: "Styrkesirkel", type: "strength", duration: "45–50 min",
          summary: "3 runder × 6 stasjoner × 60 sek",
          common: {
            rounds: 3, duration: "60 sek per stasjon", rest: "15 sek mellom stasjoner · 90 sek mellom runder",
            exercises: ["Hip thrust", "Utfall", "Roing (manualer/TRX)", "Push-ups", "Planke", "Dead hang"]
          },
          athletes: { sondre: null, knut: null, geir: null, kjetil: "geir" },
          dagsform: { yellow: "Bruk 20–30% lettere vekter. Behold repetisjoner og runder.", red: "2 runder i stedet for 3. 50% vekt. Dropp dead hang." }
        },
        tuesday: {
          title: "Intervaller", type: "intervals", duration: "40–45 min",
          summary: "Mølle: 8×2 min @ 3–5% · 1 min pause  ELLER  Romaskin: 10×250m · 60 sek rolig",
          common: {
            options: [
              "Mølle: 8×2 min @ 3–5% stigning · 1 min pause",
              "Romaskin: 10×250 m · 60 sek rolig mellom"
            ]
          },
          athletes: { sondre: null, knut: null, geir: null, kjetil: "geir" },
          dagsform: { yellow: "Senk fart 0.5 km/t eller stigning 1–2%. Behold antall drag.", red: "Halvér antall drag (4 i stedet for 8). Gå rolig mellom." }
        },
        thursday: {
          title: "OCR-Hybrid", type: "ocr", duration: "40–45 min",
          summary: "4 runder: 400m @ 5–6% → 10 burpees → 60–75s hang → 100m carry · Pause 2 min",
          common: {
            rounds: 4,
            circuit: ["400 m løp @ 5–6% stigning", "10 burpees", "60–75 sek hang", "100 m farmer's carry"],
            rest: "2 min pause mellom runder"
          },
          athletes: { sondre: null, knut: null, geir: null, kjetil: "geir" },
          dagsform: { yellow: "3 runder. Senk fart 0.5 km/t. Hang: −10–20 sek.", red: "2 runder. Dropp burpees. Hang 30–40 sek." }
        },
        friday: {
          title: "Rolig + mobilitet", type: "recovery", duration: "35–40 min",
          summary: "Mølle 30–35 min @ 5–8%  ELLER  Roing 20–25 min + 8–10 min mobilitet",
          common: {
            options: [
              "Mølle: 30–35 min @ 5–8% stigning, rolig tempo",
              "Romaskin: 20–25 min rolig + 8–10 min mobilitet"
            ],
            mobility: ["Hofter: 90/90 + pigeon stretch", "Brystrygg: rotasjonsdriller", "Skuldre/underarmer", "Ankler: dorsalfleksjonsdrill"]
          },
          athletes: { sondre: null, knut: null, geir: null, kjetil: "geir" },
          dagsform: { yellow: "Samme, men roligere. RPE 4–5.", red: "20 min rolig gange + tøying." }
        }
      }
    },

    {
      weekNumber: 2, phase: 1, label: "Uke 2", startDate: "2026-01-19", isDeload: false, note: null,
      sessions: {
        monday: {
          title: "Styrkesirkel", type: "strength", duration: "45–50 min",
          summary: "3 runder × 6 stasjoner × 70 sek",
          common: { rounds: 3, duration: "70 sek per stasjon", rest: "15 sek mellom stasjoner · 90 sek mellom runder", exercises: ["Hip thrust", "Utfall", "Roing (manualer/TRX)", "Push-ups", "Planke", "Dead hang"] },
          athletes: { sondre: null, knut: null, geir: null, kjetil: "geir" },
          dagsform: { yellow: "Bruk 20–30% lettere vekter.", red: "2 runder. 50% vekt." }
        },
        tuesday: {
          title: "Intervaller", type: "intervals", duration: "40–45 min",
          summary: "Samme som Uke 1",
          common: { options: ["Mølle: 8×2 min @ 3–5% stigning · 1 min pause", "Romaskin: 10×250 m · 60 sek rolig"] },
          athletes: { sondre: null, knut: null, geir: null, kjetil: "geir" },
          dagsform: { yellow: "Senk fart 0.5 km/t eller stigning 1–2%.", red: "Halvér antall drag." }
        },
        thursday: {
          title: "OCR-Hybrid", type: "ocr", duration: "40–45 min",
          summary: "4 runder: 400m @ 5–6% → 10 burpees → 65–70s hang → 100m carry · Pause 2 min",
          common: { rounds: 4, circuit: ["400 m løp @ 5–6% stigning", "10 burpees", "65–70 sek hang", "100 m farmer's carry"], rest: "2 min pause" },
          athletes: { sondre: null, knut: null, geir: null, kjetil: "geir" },
          dagsform: { yellow: "3 runder. Hang: −10 sek.", red: "2 runder. Dropp burpees." }
        },
        friday: {
          title: "Rolig + mobilitet", type: "recovery", duration: "35–40 min",
          summary: "35–40 min rolig + mobilitet",
          common: { options: ["Mølle: 35–40 min rolig", "Romaskin: 25 min rolig + mobilitet"] },
          athletes: { sondre: null, knut: null, geir: null, kjetil: "geir" },
          dagsform: { yellow: "Roligere tempo.", red: "20 min rolig gange." }
        }
      }
    },

    {
      weekNumber: 3, phase: 1, label: "Uke 3", startDate: "2026-01-26", isDeload: false, note: null,
      sessions: {
        monday: {
          title: "Styrkesirkel", type: "strength", duration: "45–50 min",
          summary: "3 runder × 6 stasjoner × 75 sek",
          common: { rounds: 3, duration: "75 sek per stasjon", rest: "15 sek mellom stasjoner · 90 sek mellom runder", exercises: ["Hip thrust", "Utfall", "Roing (manualer/TRX)", "Push-ups", "Planke", "Dead hang"] },
          athletes: { sondre: null, knut: null, geir: null, kjetil: "geir" },
          dagsform: { yellow: "Bruk 20–30% lettere vekter.", red: "2 runder. 50% vekt." }
        },
        tuesday: {
          title: "Intervaller (progresjon)", type: "intervals", duration: "40–45 min",
          summary: "+1 drag fra uke 2 ELLER +0.5–1% stigning",
          common: { options: ["Mølle: 9×2 min @ 3.5–5.5% stigning · 1 min pause", "Romaskin: 11×250 m · 60 sek rolig"] },
          athletes: { sondre: null, knut: null, geir: null, kjetil: "geir" },
          dagsform: { yellow: "Behold uke 2-volum. Senk intensitet litt.", red: "Halvér antall drag." }
        },
        thursday: {
          title: "OCR-Hybrid", type: "ocr", duration: "40–45 min",
          summary: "4 runder: 400m @ 5–6% → 10 burpees → 70–75s hang → 100m carry · Pause 2 min",
          common: { rounds: 4, circuit: ["400 m løp @ 5–6% stigning", "10 burpees", "70–75 sek hang", "100 m farmer's carry"], rest: "2 min pause" },
          athletes: { sondre: null, knut: null, geir: null, kjetil: "geir" },
          dagsform: { yellow: "3 runder. Hang: −10 sek.", red: "2 runder. Dropp burpees." }
        },
        friday: {
          title: "Rolig + mobilitet", type: "recovery", duration: "35–40 min",
          summary: "35–40 min rolig + mobilitet",
          common: { options: ["Mølle: 35–40 min rolig", "Romaskin: 25 min + mobilitet"] },
          athletes: { sondre: null, knut: null, geir: null, kjetil: "geir" },
          dagsform: { yellow: "Roligere tempo.", red: "20 min rolig gange." }
        }
      }
    },

    {
      weekNumber: 4, phase: 1, label: "Uke 4", startDate: "2026-02-02", isDeload: true, note: "Deload – lett uke, redusert volum",
      sessions: {
        monday: {
          title: "Styrkesirkel (deload)", type: "strength", duration: "35–40 min",
          summary: "3 runder × 60 sek (lett uke)",
          common: { rounds: 3, duration: "60 sek per stasjon", rest: "90 sek mellom runder", exercises: ["Hip thrust", "Utfall", "Roing (manualer/TRX)", "Push-ups", "Planke", "Dead hang"], note: "Lettere vekter enn normalt. RPE 6–7." },
          athletes: { sondre: null, knut: null, geir: null, kjetil: "geir" },
          dagsform: { yellow: "Allerede lett. Juster som du ønsker.", red: "2 runder. Fokus på mobilitet etterpå." }
        },
        tuesday: {
          title: "Intervaller (deload)", type: "intervals", duration: "35–40 min",
          summary: "−2 drag fra uke 3, eller roligere intensitet",
          common: { options: ["Mølle: 6×2 min @ 3% · 1 min pause (roligere)", "Romaskin: 8×250 m · 60 sek rolig"] },
          athletes: { sondre: null, knut: null, geir: null, kjetil: "geir" },
          dagsform: { yellow: "Ytterligere reduksjon OK.", red: "Gå/ro rolig 20 min." }
        },
        thursday: {
          title: "OCR-Hybrid (deload)", type: "ocr", duration: "35–40 min",
          summary: "4 runder: 400m @ 5–6% → 10 burpees → 60–65s hang → 100m carry · Pause 2 min",
          common: { rounds: 4, circuit: ["400 m løp @ 5–6% stigning", "10 burpees", "60–65 sek hang", "100 m farmer's carry"], rest: "2 min pause" },
          athletes: { sondre: null, knut: null, geir: null, kjetil: "geir" },
          dagsform: { yellow: "3 runder.", red: "2 runder. Dropp burpees." }
        },
        friday: {
          title: "Rolig + mobilitet", type: "recovery", duration: "30–35 min",
          summary: "Mølle 30–35 min eller roing 20–25 min + mobilitet",
          common: { options: ["Mølle: 30–35 min rolig", "Romaskin: 20–25 min + mobilitet"] },
          athletes: { sondre: null, knut: null, geir: null, kjetil: "geir" },
          dagsform: { yellow: "Roligere.", red: "Bare mobilitet." }
        }
      }
    },

    {
      weekNumber: 5, phase: 1, label: "Uke 5", startDate: "2026-02-09", isDeload: false, note: null,
      sessions: {
        monday: {
          title: "Styrkesirkel", type: "strength", duration: "50–55 min",
          summary: "4 runder × 6 stasjoner × 60 sek",
          common: { rounds: 4, duration: "60 sek per stasjon", rest: "15 sek mellom stasjoner · 90 sek mellom runder", exercises: ["Hip thrust", "Utfall", "Roing (manualer/TRX)", "Push-ups", "Planke", "Dead hang"] },
          athletes: { sondre: null, knut: null, geir: null, kjetil: "geir" },
          dagsform: { yellow: "3 runder. Lettere vekter.", red: "2 runder. 50% vekt." }
        },
        tuesday: {
          title: "Intervaller", type: "intervals", duration: "40–45 min",
          summary: "Tilbake til basis eller progresjon fra uke 3",
          common: { options: ["Mølle: 8×2 min @ 3–5% · 1 min pause", "Romaskin: 10×250 m · 60 sek rolig"] },
          athletes: { sondre: null, knut: null, geir: null, kjetil: "geir" },
          dagsform: { yellow: "Senk fart/stigning.", red: "Halvér drag." }
        },
        thursday: {
          title: "OCR-Hybrid", type: "ocr", duration: "40–45 min",
          summary: "4 runder: 400m @ 5–6% → 10 burpees → 60–65s hang → 100m carry",
          common: { rounds: 4, circuit: ["400 m løp @ 5–6% stigning", "10 burpees", "60–65 sek hang", "100 m farmer's carry"], rest: "2 min pause" },
          athletes: { sondre: null, knut: null, geir: null, kjetil: "geir" },
          dagsform: { yellow: "3 runder.", red: "2 runder." }
        },
        friday: {
          title: "Rolig + mobilitet", type: "recovery", duration: "35–40 min",
          summary: "35–40 min rolig + mobilitet",
          common: { options: ["Mølle: 35–40 min rolig", "Romaskin: 25 min + mobilitet"] },
          athletes: { sondre: null, knut: null, geir: null, kjetil: "geir" },
          dagsform: { yellow: "Roligere.", red: "20 min gange." }
        }
      }
    },

    {
      weekNumber: 6, phase: 1, label: "Uke 6", startDate: "2026-02-16", isDeload: false, note: null,
      sessions: {
        monday: {
          title: "Styrkesirkel", type: "strength", duration: "50–55 min",
          summary: "4 runder × 6 stasjoner × 70 sek",
          common: { rounds: 4, duration: "70 sek per stasjon", rest: "15 sek mellom stasjoner · 90 sek mellom runder", exercises: ["Hip thrust", "Utfall", "Roing (manualer/TRX)", "Push-ups", "Planke", "Dead hang"] },
          athletes: { sondre: null, knut: null, geir: null, kjetil: "geir" },
          dagsform: { yellow: "3 runder. Lettere vekter.", red: "2 runder." }
        },
        tuesday: {
          title: "Intervaller (+progresjon)", type: "intervals", duration: "40–45 min",
          summary: "+1 drag eller +0.5–1% stigning fra uke 5",
          common: { options: ["Mølle: 9×2 min @ 3.5–5.5% · 1 min pause", "Romaskin: 11×250 m · 60 sek rolig"] },
          athletes: { sondre: null, knut: null, geir: null, kjetil: "geir" },
          dagsform: { yellow: "Behold uke 5-volum.", red: "Halvér drag." }
        },
        thursday: {
          title: "OCR-Hybrid", type: "ocr", duration: "40–45 min",
          summary: "4 runder: 400m @ 5–6% → 10 burpees → 65–70s hang → 100m carry",
          common: { rounds: 4, circuit: ["400 m løp @ 5–6% stigning", "10 burpees", "65–70 sek hang", "100 m farmer's carry"], rest: "2 min pause" },
          athletes: { sondre: null, knut: null, geir: null, kjetil: "geir" },
          dagsform: { yellow: "3 runder.", red: "2 runder." }
        },
        friday: {
          title: "Rolig + mobilitet", type: "recovery", duration: "35–40 min",
          summary: "35–40 min rolig + mobilitet",
          common: { options: ["Mølle: 35–40 min rolig", "Romaskin: 25 min + mobilitet"] },
          athletes: { sondre: null, knut: null, geir: null, kjetil: "geir" },
          dagsform: { yellow: "Roligere.", red: "20 min gange." }
        }
      }
    },

    {
      weekNumber: 7, phase: 1, label: "Uke 7", startDate: "2026-02-23", isDeload: false, note: null,
      sessions: {
        monday: {
          title: "Styrkesirkel", type: "strength", duration: "50–55 min",
          summary: "4 runder × 6 stasjoner × 75 sek",
          common: { rounds: 4, duration: "75 sek per stasjon", rest: "15 sek mellom stasjoner · 90 sek mellom runder", exercises: ["Hip thrust", "Utfall", "Roing (manualer/TRX)", "Push-ups", "Planke", "Dead hang"] },
          athletes: { sondre: null, knut: null, geir: null, kjetil: "geir" },
          dagsform: { yellow: "3 runder. Lettere vekter.", red: "2 runder." }
        },
        tuesday: {
          title: "Intervaller (behold progresjon)", type: "intervals", duration: "40–45 min",
          summary: "Behold progresjon fra uke 6",
          common: { options: ["Mølle: 9×2 min @ 4–6% · 1 min pause", "Romaskin: 11×250 m · 60 sek rolig"] },
          athletes: { sondre: null, knut: null, geir: null, kjetil: "geir" },
          dagsform: { yellow: "Senk stigning 1–2%.", red: "Halvér drag." }
        },
        thursday: {
          title: "OCR-Hybrid", type: "ocr", duration: "40–45 min",
          summary: "4 runder: 400m @ 5–6% → 10 burpees → 70–75s hang → 100m carry",
          common: { rounds: 4, circuit: ["400 m løp @ 5–6% stigning", "10 burpees", "70–75 sek hang", "100 m farmer's carry"], rest: "2 min pause" },
          athletes: { sondre: null, knut: null, geir: null, kjetil: "geir" },
          dagsform: { yellow: "3 runder.", red: "2 runder." }
        },
        friday: {
          title: "Rolig + mobilitet", type: "recovery", duration: "35–40 min",
          summary: "35–40 min rolig + mobilitet",
          common: { options: ["Mølle: 35–40 min rolig", "Romaskin: 25 min + mobilitet"] },
          athletes: { sondre: null, knut: null, geir: null, kjetil: "geir" },
          dagsform: { yellow: "Roligere.", red: "20 min gange." }
        }
      }
    },

    {
      weekNumber: 8, phase: 1, label: "Uke 8", startDate: "2026-03-02", isDeload: true, note: "Deload + fasebytte – overgang til Fase 2",
      sessions: {
        tuesday: {
          title: "Styrkesirkel (deload)", type: "strength", duration: "40–45 min",
          summary: "3 runder × 5 stasjoner × 65 sek · RPE 6–7",
          common: {
            rounds: 3, duration: "65 sek per stasjon", rest: "60–75 sek mellom stasjoner · flyt mellom runder",
            exercises: ["Hip thrust", "Roing (manualer/TRX)", "Push-ups", "Planke", "Dead hang (lett)"],
            note: "Ingen failure. Lett–moderat innsats. Dynamisk oppvarming 8–10 min før."
          },
          athletes: { sondre: null, knut: null, geir: null, kjetil: "geir" },
          dagsform: { yellow: "2 runder.", red: "1 runde + mobilitet." }
        },
        thursday: {
          title: "OCR-Hybrid (deload)", type: "ocr", duration: "35–40 min",
          summary: "3–4 runder: 400m @ 3–4% → 8 burpees → 60s hang → 100m carry · Pause 2–2:30 min",
          common: {
            rounds: "3–4", circuit: ["400 m løp @ 3–4% stigning – RPE 6–7", "8 burpees – rolig rytme", "60 sek hang", "100 m farmer's carry – moderat vekt"],
            rest: "2:00–2:30 min pause"
          },
          athletes: { sondre: null, knut: null, geir: null, kjetil: "geir" },
          dagsform: { yellow: "3 runder.", red: "2 runder. Dropp burpees." }
        },
        friday: {
          title: "Rolig + mobilitet", type: "recovery", duration: "30–35 min",
          summary: "30–35 min rolig jogg/roing + 8–12 min mobilitet",
          common: {
            options: ["Mølle: 30–35 min @ 0–2% · RPE 5–6", "Romaskin: 20–25 min rolig"],
            mobility: ["Hofter: 90/90 + pigeon stretch", "Brystrygg: rotasjonsdriller", "Skuldre/underarmer", "Ankler: dorsalfleksjonsdrill"]
          },
          athletes: { sondre: null, knut: null, geir: null, kjetil: "geir" },
          dagsform: { yellow: "Bare rolig gange og tøying.", red: "Bare mobilitet." }
        }
      }
    },

    // ─── FASE 2: Mars–Mai 2026 (Uke 9–17 · Holmenkollstafetten) ─────────────

    {
      weekNumber: 9, phase: 2, label: "Uke 9", startDate: "2026-03-09", isDeload: false,
      note: "Utstyr: 2 møller + 2 romaskiner. Del 1: Sondre+Knut på mølle, Geir/Kjetil på romaskin. Del 2: BYTT.",
      sessions: {
        monday: {
          title: "Løpsstyrke", type: "strength", duration: "35–40 min",
          summary: "Individuell løpsstyrke · RPE 7–8",
          common: {
            exercises: [
              "Box step-ups 3×12/ben (30–45 cm)",
              "Hip thrust 3×8–10 (2–3 sek ned) – Sondre/Knut: 60–80 kg · Geir/Kjetil: 30–50 kg",
              "TRX-ro 3×10–12",
              "Dead hang 3×45–60 sek",
              "Farmer's carry 3×40–60 sek (20–30 kg)",
              "Core: Hollow hold 3×30 sek + sideplanke 3×30 sek/side"
            ]
          },
          athletes: { sondre: null, knut: null, geir: null, kjetil: "geir" },
          dagsform: { yellow: "Bruk 20–30% lettere vekter.", red: "2 sett per øvelse. 50% vekt." }
        },
        tuesday: {
          title: "Intervaller", type: "intervals", duration: "40–45 min",
          summary: "Del 1: Mølle (Sondre+Knut) / Romaskin (Geir/Kjetil) → Del 2: BYTT · RPE 8",
          common: null,
          athletes: {
            sondre: {
              part1: { machine: "Mølle", sets: "12×45 sek", speed: "12.0–12.5 km/t", incline: "1–3%", rest: "45 sek pause" },
              part2: { machine: "Romaskin", sets: "10×45 sek hard / 30 sek rolig" }
            },
            knut: {
              part1: { machine: "Mølle", sets: "8×60 sek", speed: "7.0 km/t", incline: "8%", rest: "60 sek pause" },
              part2: { machine: "Romaskin", sets: "10×45 sek hard / 30 sek rolig" }
            },
            geir: {
              part1: { machine: "Romaskin", sets: "10×45 sek hard / 30 sek rolig" },
              part2: { machine: "Mølle", options: ["A: 10×45 sek @ 0% · 6.5–7.0 km/t · 45 sek pause", "B: 12×30 sek @ 0% · 6.2–6.8 km/t · 45 sek pause"] }
            },
            kjetil: "geir"
          },
          dagsform: { yellow: "Senk fart 0.5 km/t eller stigning 1–2%. Behold antall drag.", red: "Halvér antall drag. Ro/løp rolig mellom." }
        },
        thursday: {
          title: "OCR-Hybrid", type: "ocr", duration: "40–45 min",
          summary: "5 runder · RPE 7–8",
          common: null,
          athletes: {
            sondre: { rounds: 5, circuit: ["500 m mølle @ 4–6% · 9–10 km/t", "10 burpees", "60 sek hang", "100–150 m farmer's carry"], rest: "90–120 sek" },
            knut:   { rounds: 5, circuit: ["500 m mølle @ 4–6% · 6.5–7.0 km/t", "10 burpees", "60 sek hang", "100–150 m farmer's carry"], rest: "90–120 sek" },
            geir:   { rounds: 5, circuit: ["500 m mølle @ 4–6% · 6.0–6.5 km/t", "10 burpees", "60 sek hang", "100–150 m farmer's carry"], rest: "90–120 sek" },
            kjetil: "geir"
          },
          dagsform: { yellow: "4 runder. Senk fart 0.5 km/t. Hang: −10 sek.", red: "3 runder. Dropp burpees." }
        },
        friday: {
          title: "Rolig + strides", type: "recovery", duration: "35–40 min",
          summary: "Del 1: 20 min rolig · Del 2: BYTT maskin · Strides etterpå",
          common: null,
          athletes: {
            sondre: {
              part1: "Mølle 20 min @ 3–5% · 8.8–9.5 km/t",
              part2: "Romaskin 10–12 min rolig (RPE 3–4)",
              strides: "6×12–15 sek @ 0–1% · 14–16 km/t"
            },
            knut: {
              part1: "Mølle 20 min @ 3–5% · 5.5–6.2 km/t",
              part2: "Romaskin 10–12 min rolig (RPE 3–4)",
              strides: "6×12–15 sek @ 0–1% · 10–12 km/t"
            },
            geir: {
              part1: "Romaskin 20 min rolig (RPE 3–4)",
              part2: "Mølle 10–12 min @ 0–1% · 5.5–6.2 km/t",
              strides: "6×12–15 sek @ 0–1% · 9–11 km/t"
            },
            kjetil: "geir"
          },
          dagsform: { yellow: "Dropp strides. Bare rolig.", red: "20 min rolig gange." }
        }
      }
    },

    {
      weekNumber: 10, phase: 2, label: "Uke 10", startDate: "2026-03-16", isDeload: false,
      note: "Utstyr: 2 møller + 2 romaskiner. Del 1: Sondre+Knut på mølle, Geir/Kjetil på romaskin. Del 2: BYTT.",
      sessions: {
        monday: {
          title: "Løpsstyrke", type: "strength", duration: "40–45 min",
          summary: "Økt volum fra uke 9 · RPE 7–8",
          common: {
            exercises: [
              "Box step-ups 4×10/ben",
              "Hip thrust 4×8–10 – Sondre/Knut: 60–80 kg · Geir/Kjetil: 30–50 kg",
              "Bulgarsk split squat 3×8/ben",
              "Dead hang 4×45–60 sek",
              "Farmer's carry 4×50–60 sek",
              "Pallof press 3×12/side"
            ]
          },
          athletes: { sondre: null, knut: null, geir: null, kjetil: "geir" },
          dagsform: { yellow: "3 sett per øvelse. Lettere vekter.", red: "2 sett. 50% vekt." }
        },
        tuesday: {
          title: "Intervaller", type: "intervals", duration: "40–45 min",
          summary: "Del 1: Mølle (Sondre+Knut) / Romaskin (Geir/Kjetil) → Del 2: BYTT · RPE 8",
          common: null,
          athletes: {
            sondre: {
              part1: { machine: "Mølle", sets: "10×60 sek", speed: "11.0–11.8 km/t", incline: "1–3%", rest: "45 sek pause" },
              part2: { machine: "Romaskin", sets: "8×60 sek hard / 45 sek rolig" }
            },
            knut: {
              part1: { machine: "Mølle", sets: "10×60 sek", speed: "6.8–7.0 km/t", incline: "8%", rest: "60 sek pause" },
              part2: { machine: "Romaskin", sets: "8×60 sek hard / 45 sek rolig" }
            },
            geir: {
              part1: { machine: "Romaskin", sets: "8×60 sek hard / 45 sek rolig" },
              part2: { machine: "Mølle", options: ["A: 8×60 sek @ 0% · 6.2–6.8 km/t · 60 sek pause", "B: 12×30 sek @ 0% · 6.2–6.8 km/t · 45 sek pause"] }
            },
            kjetil: "geir"
          },
          dagsform: { yellow: "Senk fart 0.5 km/t eller stigning 1–2%.", red: "Halvér antall drag." }
        },
        thursday: {
          title: "OCR-Hybrid", type: "ocr", duration: "40–45 min",
          summary: "5 runder · RPE 7–8 · lengre løpsdrag",
          common: null,
          athletes: {
            sondre: { rounds: 5, circuit: ["600 m mølle @ 4–6% · 9–10 km/t", "12 burpees", "60–70 sek hang", "150 m carry"], rest: "2 min" },
            knut:   { rounds: 5, circuit: ["600 m mølle @ 4–6% · 6.5–7.0 km/t", "12 burpees", "60–70 sek hang", "150 m carry"], rest: "2 min" },
            geir:   { rounds: 5, circuit: ["600 m mølle @ 4–6% · 6.0–6.5 km/t", "12 burpees", "60–70 sek hang", "150 m carry"], rest: "2 min" },
            kjetil: "geir"
          },
          dagsform: { yellow: "4 runder. Senk fart 0.5 km/t.", red: "3 runder. Dropp burpees." }
        },
        friday: {
          title: "Rolig + strides", type: "recovery", duration: "35–40 min",
          summary: "Del 1: 20 min rolig · Del 2: BYTT · Strides etterpå",
          common: null,
          athletes: {
            sondre: { part1: "Mølle 20 min @ 3–5% · 8.8–9.5 km/t", part2: "Romaskin 10–12 min rolig", strides: "6×15 sek @ 0–1% · 14–16 km/t" },
            knut:   { part1: "Mølle 20 min @ 3–5% · 5.5–6.2 km/t", part2: "Romaskin 10–12 min rolig", strides: "6×15 sek @ 0–1% · 10–12 km/t" },
            geir:   { part1: "Romaskin 20 min rolig", part2: "Mølle 10–12 min @ 0–1% · 5.5–6.2 km/t", strides: "6×15 sek @ 0–1% · 9–11 km/t" },
            kjetil: "geir"
          },
          dagsform: { yellow: "Dropp strides.", red: "20 min rolig gange." }
        }
      }
    },

    {
      weekNumber: 11, phase: 2, label: "Uke 11", startDate: "2026-03-23", isDeload: false,
      note: "Utstyr: 2 møller + 2 romaskiner. Del 1: Sondre+Knut på mølle, Geir/Kjetil på romaskin. Del 2: BYTT.",
      sessions: {
        monday: {
          title: "Løpsstyrke", type: "strength", duration: "40–45 min",
          summary: "Lengre varighet på carry og hang",
          common: {
            exercises: [
              "Step-ups 4×12",
              "Hip thrust 4×8–10 (2–3 sek ned)",
              "Goblet squat 3×10",
              "Dead hang 4×60 sek",
              "Farmer's carry 4×60 sek",
              "Sideplanke 3×40 sek/side"
            ]
          },
          athletes: { sondre: null, knut: null, geir: null, kjetil: "geir" },
          dagsform: { yellow: "3 sett. Lettere vekter.", red: "2 sett. 50% vekt." }
        },
        tuesday: {
          title: "Intervaller (lengre drag)", type: "intervals", duration: "40–45 min",
          summary: "Del 1: Mølle / Romaskin → Del 2: BYTT · RPE 8",
          common: null,
          athletes: {
            sondre: {
              part1: { machine: "Mølle", sets: "6×90 sek", speed: "10.5–11.2 km/t", incline: "1–3%", rest: "60 sek pause" },
              part2: { machine: "Romaskin", sets: "6×90 sek hard / 60 sek rolig" }
            },
            knut: {
              part1: { machine: "Mølle", sets: "6×75 sek", speed: "6.6–6.9 km/t", incline: "8%", rest: "75 sek pause" },
              part2: { machine: "Romaskin", sets: "6×90 sek hard / 60 sek rolig" }
            },
            geir: {
              part1: { machine: "Romaskin", sets: "6×90 sek hard / 60 sek rolig" },
              part2: { machine: "Mølle", options: ["A: 8×60 sek @ 0% · 6.2–6.8 km/t · 60 sek pause", "B: 10×30 sek @ 0% · 6.2–6.8 km/t · 45 sek pause"] }
            },
            kjetil: "geir"
          },
          dagsform: { yellow: "Senk fart 0.5 km/t.", red: "Halvér drag." }
        },
        thursday: {
          title: "OCR-Hybrid", type: "ocr", duration: "40–45 min",
          summary: "5 runder med goblet squats",
          common: null,
          athletes: {
            sondre: { rounds: 5, circuit: ["500–600 m @ 4–6% · 9–10 km/t", "10 burpees + 10 goblet squats", "60–70 sek hang", "100–150 m carry"], rest: "2 min" },
            knut:   { rounds: 5, circuit: ["500–600 m @ 4–6% · 6.5–7.0 km/t", "10 burpees + 10 goblet squats", "60–70 sek hang", "100–150 m carry"], rest: "2 min" },
            geir:   { rounds: 5, circuit: ["500–600 m @ 4–6% · 6.0–6.5 km/t", "10 burpees + 10 goblet squats", "60–70 sek hang", "100–150 m carry"], rest: "2 min" },
            kjetil: "geir"
          },
          dagsform: { yellow: "4 runder.", red: "3 runder. Dropp burpees." }
        },
        friday: {
          title: "Rolig + strides", type: "recovery", duration: "35–40 min",
          summary: "Del 1: 20 min rolig · Del 2: BYTT · Strides etterpå",
          common: null,
          athletes: {
            sondre: { part1: "Mølle 20 min @ 3–5% · 8.8–9.5 km/t", part2: "Romaskin 10–12 min rolig", strides: "6×15 sek @ 0–1% · 14–16 km/t" },
            knut:   { part1: "Mølle 20 min @ 3–5% · 5.5–6.2 km/t", part2: "Romaskin 10–12 min rolig", strides: "6×15 sek @ 0–1% · 10–12 km/t" },
            geir:   { part1: "Romaskin 20 min rolig", part2: "Mølle 10–12 min @ 0–1% · 5.5–6.2 km/t", strides: "6×15 sek @ 0–1% · 9–11 km/t" },
            kjetil: "geir"
          },
          dagsform: { yellow: "Dropp strides.", red: "20 min rolig gange." }
        }
      }
    },

    {
      weekNumber: 12, phase: 2, label: "Uke 12", startDate: "2026-03-30", isDeload: false, note: "Toppuke før deload – RPE 8–9",
      sessions: {
        monday: {
          title: "Løpsstyrke (tung)", type: "strength", duration: "40–45 min",
          summary: "Tyngste uke i syklusen",
          common: {
            exercises: [
              "Step-ups 4×12",
              "Hip thrust 4×8–10",
              "Bulgarsk split squat 4×8/ben",
              "Dead hang 4×60 sek",
              "Farmer's carry 4×60 sek",
              "Hollow hold 3×35 sek"
            ]
          },
          athletes: { sondre: null, knut: null, geir: null, kjetil: "geir" },
          dagsform: { yellow: "3 sett. Lettere vekter.", red: "2 sett. 50% vekt." }
        },
        tuesday: {
          title: "Intervaller (peak · RPE 8–9)", type: "intervals", duration: "40–45 min",
          summary: "Del 1: Mølle / Romaskin → Del 2: BYTT",
          common: null,
          athletes: {
            sondre: {
              part1: { machine: "Mølle", sets: "12×45 sek", speed: "12.0–12.5 km/t", incline: "0–2%", rest: "30 sek pause" },
              part2: { machine: "Romaskin", sets: "10×45 sek hard / 30 sek rolig" }
            },
            knut: {
              part1: { machine: "Mølle", sets: "8×75 sek", speed: "6.4–6.8 km/t", incline: "9–10%", rest: "60–75 sek pause" },
              part2: { machine: "Romaskin", sets: "10×45 sek hard / 30 sek rolig" }
            },
            geir: {
              part1: { machine: "Romaskin", sets: "10×45 sek hard / 30 sek rolig" },
              part2: { machine: "Mølle", options: ["A: 10×45 sek @ 0% · 6.5–7.0 km/t · 45 sek pause", "B: 12×30 sek @ 0% · 6.2–6.8 km/t · 45 sek pause"] }
            },
            kjetil: "geir"
          },
          dagsform: { yellow: "Senk fart 0.5 km/t.", red: "Halvér drag." }
        },
        thursday: {
          title: "OCR-Hybrid (5 runder · RPE 7–8)", type: "ocr", duration: "45–50 min",
          summary: "Lengste og tyngste OCR-økt",
          common: null,
          athletes: {
            sondre: { rounds: 5, circuit: ["600 m mølle @ 4–6% · 9–10 km/t", "12 burpees", "70–75 sek hang", "150–200 m carry"], rest: "2 min" },
            knut:   { rounds: 5, circuit: ["600 m mølle @ 4–6% · 6.5–7.0 km/t", "12 burpees", "70–75 sek hang", "150–200 m carry"], rest: "2 min" },
            geir:   { rounds: 5, circuit: ["600 m mølle @ 4–6% · 6.0–6.5 km/t", "12 burpees", "70–75 sek hang", "150–200 m carry"], rest: "2 min" },
            kjetil: "geir"
          },
          dagsform: { yellow: "4 runder.", red: "3 runder. Dropp burpees." }
        },
        friday: {
          title: "Rolig + strides", type: "recovery", duration: "45 min",
          summary: "45 min rolig + strides",
          common: null,
          athletes: {
            sondre: { part1: "Mølle 45 min @ 3–5% · 9.0–9.5 km/t", part2: null, strides: "6×12–15 sek @ 0–1% · 14–16 km/t" },
            knut:   { part1: "Mølle 45 min @ 3–5% · 5.6–6.2 km/t", part2: null, strides: "6×12–15 sek @ 0–1% · 10–12 km/t" },
            geir:   { part1: "Romaskin 45 min rolig", part2: null, strides: "6×12–15 sek @ 0–1% · 9–11 km/t" },
            kjetil: "geir"
          },
          dagsform: { yellow: "Dropp strides.", red: "20 min rolig." }
        }
      }
    },

    {
      weekNumber: 13, phase: 2, label: "Uke 13", startDate: "2026-04-06", isDeload: true, note: "Deload",
      sessions: {
        monday: {
          title: "Lett styrke", type: "strength", duration: "30–35 min",
          summary: "2 sett per øvelse",
          common: { exercises: ["Step-ups 2×10", "Hip thrust 2×8", "TRX-ro 2×10", "Dead hang 2×45 sek", "Farmer's carry 2×40 sek"] },
          athletes: { sondre: null, knut: null, geir: null, kjetil: "geir" },
          dagsform: { yellow: "1 sett.", red: "Bare mobilitet." }
        },
        tuesday: {
          title: "Intervaller (lett)", type: "intervals", duration: "30–35 min",
          summary: "Redusert volum og intensitet",
          common: null,
          athletes: {
            sondre: {
              part1: { machine: "Mølle", sets: "8×30 sek", speed: "12.0–12.5 km/t", incline: "0–2%", rest: "45 sek pause" },
              part2: { machine: "Romaskin", sets: "8×30 sek hard / 45 sek rolig" }
            },
            knut: {
              part1: { machine: "Mølle", sets: "8×45 sek", speed: "6.8–7.0 km/t", incline: "6–7%", rest: "60 sek pause" },
              part2: { machine: "Romaskin", sets: "8×30 sek hard / 45 sek rolig" }
            },
            geir: {
              part1: { machine: "Romaskin", sets: "8×30 sek hard / 45 sek rolig" },
              part2: { machine: "Mølle", options: ["A: 8×30 sek @ 0% · 6.5–7.0 km/t · 45 sek pause", "B: 10×20 sek @ 0% · 6.2–6.8 km/t · 40 sek pause"] }
            },
            kjetil: "geir"
          },
          dagsform: { yellow: "Ytterligere reduksjon.", red: "Rolig 20 min." }
        },
        thursday: {
          title: "Lett hybrid (deload)", type: "ocr", duration: "30–35 min",
          summary: "3 runder: 400m @ 3–4% → 8 burpees → 45–60s hang → 100m carry",
          common: { rounds: 3, circuit: ["400 m @ 3–4% stigning", "8 burpees", "45–60 sek hang", "100 m carry"], rest: "2 min" },
          athletes: { sondre: null, knut: null, geir: null, kjetil: "geir" },
          dagsform: { yellow: "2 runder.", red: "2 runder. Dropp burpees." }
        },
        friday: {
          title: "Rolig (ingen strides)", type: "recovery", duration: "30–35 min",
          summary: "30–35 min rolig @ 2–4%",
          common: { options: ["Mølle: 30–35 min @ 2–4% rolig", "Romaskin: 20 min rolig"] },
          athletes: { sondre: null, knut: null, geir: null, kjetil: "geir" },
          dagsform: { yellow: "Kortere.", red: "Bare tøying." }
        }
      }
    },

    {
      weekNumber: 14, phase: 2, label: "Uke 14", startDate: "2026-04-13", isDeload: false, note: null,
      sessions: {
        monday: {
          title: "Løpsstyrke", type: "strength", duration: "40–45 min",
          summary: "Tilbake til normal volum",
          common: {
            exercises: [
              "Step-ups 4×10–12",
              "Hip thrust 4×8–10",
              "Goblet squat 3×10–12",
              "Dead hang 4×60–70 sek",
              "Farmer's carry 4×60 sek",
              "Sideplanke 3×40–45 sek/side"
            ]
          },
          athletes: { sondre: null, knut: null, geir: null, kjetil: "geir" },
          dagsform: { yellow: "3 sett. Lettere vekter.", red: "2 sett." }
        },
        tuesday: {
          title: "Intervaller (etappe-spesifikk · RPE 8)", type: "intervals", duration: "40–45 min",
          summary: "Del 1: Mølle / Romaskin → Del 2: BYTT",
          common: null,
          athletes: {
            sondre: {
              part1: { machine: "Mølle", sets: "3×3 min", speed: "10.0–10.8 km/t", incline: "0–2%", rest: "2 min rolig" },
              part2: { machine: "Romaskin", sets: "6×60–75 sek hard / 60 sek rolig" }
            },
            knut: {
              part1: { machine: "Mølle", sets: "6×75 sek", speed: "6.6–6.9 km/t", incline: "8–10%", rest: "60–75 sek pause" },
              part2: { machine: "Romaskin", sets: "6×60–75 sek hard / 60 sek rolig" }
            },
            geir: {
              part1: { machine: "Romaskin", sets: "6×60–75 sek hard / 60 sek rolig" },
              part2: { machine: "Mølle", options: ["A: 6×60 sek @ 0% · 6.2–6.8 km/t · 60 sek pause", "B: 10×30 sek @ 0% · 6.2–6.8 km/t · 45 sek pause"] }
            },
            kjetil: "geir"
          },
          dagsform: { yellow: "Senk fart 0.5 km/t.", red: "Halvér drag." }
        },
        thursday: {
          title: "OCR-Hybrid (5 runder)", type: "ocr", duration: "45 min",
          summary: "5 runder med lengre hang",
          common: null,
          athletes: {
            sondre: { rounds: 5, circuit: ["600 m @ 4–6% · 9–10 km/t", "12 burpees", "70–80 sek hang", "150–200 m carry"], rest: "2 min" },
            knut:   { rounds: 5, circuit: ["600 m @ 4–6% · 6.5–7.0 km/t", "12 burpees", "70–80 sek hang", "150–200 m carry"], rest: "2 min" },
            geir:   { rounds: 5, circuit: ["600 m @ 4–6% · 6.0–6.5 km/t", "12 burpees", "70–80 sek hang", "150–200 m carry"], rest: "2 min" },
            kjetil: "geir"
          },
          dagsform: { yellow: "4 runder.", red: "3 runder." }
        },
        friday: {
          title: "Rolig + strides", type: "recovery", duration: "45–50 min",
          summary: "45–50 min rolig + strides",
          common: null,
          athletes: {
            sondre: { part1: "Mølle 45–50 min @ 3–4% · 9.0–9.5 km/t", part2: null, strides: "6×15 sek · 0–1% · 14–16 km/t" },
            knut:   { part1: "Mølle 45–50 min @ 3–4% · 5.6–6.2 km/t", part2: null, strides: "6×15 sek · 0–1% · 10–12 km/t" },
            geir:   { part1: "Romaskin 45–50 min rolig", part2: null, strides: "6×15 sek · 0–1% · 9–11 km/t" },
            kjetil: "geir"
          },
          dagsform: { yellow: "Dropp strides.", red: "20–30 min rolig." }
        }
      }
    },

    {
      weekNumber: 15, phase: 2, label: "Uke 15", startDate: "2026-04-20", isDeload: true, note: "Deload",
      sessions: {
        monday: {
          title: "Lett styrke", type: "strength", duration: "30–35 min",
          summary: "2–3 sett per øvelse, lett/moderat",
          common: { exercises: ["Step-ups 2×10", "Hip thrust 2×8", "Goblet squat 2×10", "Dead hang 2×45 sek", "Farmer's carry 2×40 sek"] },
          athletes: { sondre: null, knut: null, geir: null, kjetil: "geir" },
          dagsform: { yellow: "1–2 sett.", red: "Bare mobilitet." }
        },
        tuesday: {
          title: "Intervaller (ned volum)", type: "intervals", duration: "30–35 min",
          summary: "Redusert volum",
          common: null,
          athletes: {
            sondre: {
              part1: { machine: "Mølle", sets: "10×45 sek", speed: "11.5–12.3 km/t", incline: "0–2%", rest: "45 sek pause" },
              part2: { machine: "Romaskin", sets: "8×45 sek hard / 30 sek rolig" }
            },
            knut: {
              part1: { machine: "Mølle", sets: "6×60 sek", speed: "6.8–7.0 km/t", incline: "7–8%", rest: "60 sek pause" },
              part2: { machine: "Romaskin", sets: "8×45 sek hard / 30 sek rolig" }
            },
            geir: {
              part1: { machine: "Romaskin", sets: "8×45 sek hard / 30 sek rolig" },
              part2: { machine: "Mølle", options: ["A: 8×45 sek @ 0% · 6.5–7.0 km/t · 45 sek pause", "B: 10×25 sek @ 0% · 6.2–6.8 km/t · 40 sek pause"] }
            },
            kjetil: "geir"
          },
          dagsform: { yellow: "Ytterligere reduksjon.", red: "Rolig 20 min." }
        },
        thursday: {
          title: "Lett hybrid (4 runder)", type: "ocr", duration: "35–40 min",
          summary: "4 runder: 500m → 10 burpees → 60s hang → 120–150m carry",
          common: { rounds: 4, circuit: ["500 m løp", "10 burpees", "60 sek hang", "120–150 m carry"], rest: "2 min" },
          athletes: { sondre: null, knut: null, geir: null, kjetil: "geir" },
          dagsform: { yellow: "3 runder.", red: "2 runder." }
        },
        friday: {
          title: "Rolig", type: "recovery", duration: "35–40 min",
          summary: "35–40 min rolig @ 2–4% (ingen strides)",
          common: { options: ["Mølle: 35–40 min @ 2–4% rolig", "Romaskin: 25 min rolig"] },
          athletes: { sondre: null, knut: null, geir: null, kjetil: "geir" },
          dagsform: { yellow: "Kortere.", red: "Bare tøying." }
        }
      }
    },

    {
      weekNumber: 16, phase: 2, label: "Uke 16", startDate: "2026-04-27", isDeload: false, note: null,
      sessions: {
        monday: {
          title: "Løpsstyrke (kraft/eksentrisk)", type: "strength", duration: "40–45 min",
          summary: "Kraftfokus med eksentrisk betoning",
          common: {
            exercises: [
              "Step-ups 4×10",
              "Hip thrust 4×6–8 (3 sek ned)",
              "Bulgarsk split squat 3×8/ben",
              "Dead hang 4×60–75 sek",
              "Farmer's carry 4×60–75 sek",
              "Anti-rotasjon (Pallof) 3×12/side"
            ]
          },
          athletes: { sondre: null, knut: null, geir: null, kjetil: "geir" },
          dagsform: { yellow: "3 sett. Lettere vekter.", red: "2 sett." }
        },
        tuesday: {
          title: "Intervaller (skarpe drag · RPE 8)", type: "intervals", duration: "40–45 min",
          summary: "Del 1: Mølle / Romaskin → Del 2: BYTT",
          common: null,
          athletes: {
            sondre: {
              part1: { machine: "Mølle", sets: "8×60 sek", speed: "11.0–11.8 km/t", incline: "0–2%", rest: "45 sek pause" },
              part2: { machine: "Romaskin", sets: "8×60 sek hard / 45 sek rolig" }
            },
            knut: {
              part1: { machine: "Mølle", sets: "8×75 sek", speed: "6.4–6.8 km/t", incline: "9–10%", rest: "60 sek pause" },
              part2: { machine: "Romaskin", sets: "8×60 sek hard / 45 sek rolig" }
            },
            geir: {
              part1: { machine: "Romaskin", sets: "8×60 sek hard / 45 sek rolig" },
              part2: { machine: "Mølle", options: ["A: 6×60 sek @ 0% · 6.4–6.8 km/t · 60 sek pause", "B: 12×25 sek @ 0% · 6.2–6.8 km/t · 40 sek pause"] }
            },
            kjetil: "geir"
          },
          dagsform: { yellow: "Senk fart 0.5 km/t.", red: "Halvér drag." }
        },
        thursday: {
          title: "OCR-Hybrid (6 runder)", type: "ocr", duration: "45–50 min",
          summary: "6 runder med goblet squats og lengre hang",
          common: null,
          athletes: {
            sondre: { rounds: 6, circuit: ["500 m @ 4–6% · 9–10 km/t", "10 burpees + 10 goblet squats", "75–90 sek hang", "150–200 m carry"], rest: "2 min" },
            knut:   { rounds: 6, circuit: ["500 m @ 4–6% · 6.5–7.0 km/t", "10 burpees + 10 goblet squats", "75–90 sek hang", "150–200 m carry"], rest: "2 min" },
            geir:   { rounds: 6, circuit: ["500 m @ 4–6% · 6.0–6.5 km/t", "10 burpees + 10 goblet squats", "75–90 sek hang", "150–200 m carry"], rest: "2 min" },
            kjetil: "geir"
          },
          dagsform: { yellow: "4 runder.", red: "3 runder." }
        },
        friday: {
          title: "Rolig + strides", type: "recovery", duration: "45–50 min",
          summary: "45–50 min rolig + strides",
          common: null,
          athletes: {
            sondre: { part1: "Mølle 45–50 min @ 3–4%", part2: null, strides: "6×12–15 sek · 14–16 km/t" },
            knut:   { part1: "Mølle 45–50 min @ 3–4%", part2: null, strides: "6×12–15 sek · 10–12 km/t" },
            geir:   { part1: "Romaskin 45–50 min rolig", part2: null, strides: "6×12–15 sek · 9–11 km/t" },
            kjetil: "geir"
          },
          dagsform: { yellow: "Dropp strides.", red: "20–30 min rolig." }
        }
      }
    },

    {
      weekNumber: 17, phase: 2, label: "Uke 17", startDate: "2026-05-04", isDeload: true, note: "TAPER – Holmenkollstafetten lørdag 09.05",
      sessions: {
        monday: {
          title: "Lett løpsstyrke (taper)", type: "strength", duration: "30–35 min",
          summary: "Minimal belastning, bevar form",
          common: {
            exercises: [
              "Step-ups 2×8",
              "Hip thrust 2×6–8",
              "TRX-ro 2×10",
              "Dead hang 2×45 sek",
              "Farmer's carry 2×40 sek",
              "Lett mobilitet"
            ]
          },
          athletes: { sondre: null, knut: null, geir: null, kjetil: "geir" },
          dagsform: { yellow: "1 sett.", red: "Bare mobilitet." }
        },
        tuesday: {
          title: "Skarphet (kort og lett)", type: "intervals", duration: "25–30 min",
          summary: "Del 1: Mølle / Romaskin → Del 2: BYTT · Kort og aktiverende",
          common: null,
          athletes: {
            sondre: {
              part1: { machine: "Mølle", sets: "6×45 sek", speed: "11.5–12.3 km/t", incline: "0–2%", rest: "60 sek pause" },
              part2: { machine: "Romaskin", sets: "6×45 sek moderat / 45 sek rolig" }
            },
            knut: {
              part1: { machine: "Mølle", sets: "6×45–60 sek", speed: "6.8–7.0 km/t", incline: "7–8%", rest: "60–75 sek pause" },
              part2: { machine: "Romaskin", sets: "6×45 sek moderat / 45 sek rolig" }
            },
            geir: {
              part1: { machine: "Romaskin", sets: "6×45 sek moderat / 45 sek rolig" },
              part2: { machine: "Mølle", sets: "6×45 sek @ 0% · 6.4–6.8 km/t · 60 sek pause" }
            },
            kjetil: "geir"
          },
          dagsform: { yellow: "Allerede lett – kjør som planlagt.", red: "4 drag i stedet for 6. Rolig innsats." }
        },
        thursday: {
          title: "Lett hybrid (taper · 3 runder)", type: "ocr", duration: "25–30 min",
          summary: "3 runder: 400–500m rolig → 8 burpees → 45–60s hang → 100–120m carry",
          common: {
            rounds: 3,
            circuit: ["400–500 m @ 3–4% stigning (rolig)", "8 burpees", "45–60 sek hang", "100–120 m carry"],
            rest: "2 min"
          },
          athletes: { sondre: null, knut: null, geir: null, kjetil: "geir" },
          dagsform: { yellow: "2 runder.", red: "2 runder. Dropp burpees." }
        },
        friday: {
          title: "Rolig (taper)", type: "recovery", duration: "25–30 min",
          summary: "25–30 min veldig rolig + lett tøying",
          common: {
            options: ["Mølle: 25–30 min @ 2–3% (pratetempo)", "Romaskin: 20 min veldig rolig"],
            note: "Lett tøying av legg, ankel og hofter etterpå. Ingen høy intensitet."
          },
          athletes: { sondre: null, knut: null, geir: null, kjetil: "geir" },
          dagsform: { yellow: "Kortere.", red: "Bare tøying og mobilitet." }
        }
      }
    },

  ]
};

// ─── FASE 3 SESJONBYGGERE (brukt av p3Week) ───────────────────────────────────

function _p3ath() { return { sondre: null, knut: null, geir: null, kjetil: "geir" }; }

function _p3Monday(wn) {
  const isDeload = wn === 24 || wn === 32;
  const rounds = isDeload ? 2 : wn >= 25 ? 4 : 3;
  return {
    title: isDeload ? "Grep & bæring (deload)" : "Grep & bæring",
    type: "strength", duration: isDeload ? "25–30 min" : "40–45 min",
    summary: `${rounds} runder – gripstyrke, bæring, core`,
    common: {
      exercises: [
        `Pull-up / TRX-roing ${rounds}×6–8`,
        `Farmer's carry ${rounds}×40 m @ {{carry}} kg`,
        `Dead hang ${rounds}×{{hang}} sek`,
        `Push-press ${rounds}×8–10 (manualer)`,
        `Sandsekk-squat ${rounds}×8`,
        `Planke med skuldertrykk ${rounds}×12`
      ]
    },
    athletes: _p3ath(),
    dagsform: { yellow: `${Math.max(2,rounds-1)} runder, 70% vekt`, red: "1–2 runder, dropp carry og hang" }
  };
}

function _p3Tuesday(wn) {
  const isDeload = wn === 24 || wn === 32;
  const rounds   = isDeload ? 3 : wn >= 29 ? 6 : wn >= 21 ? 5 : 4;
  const dist     = wn >= 29 ? 600 : 500;
  const burpees  = wn >= 29 ? 15  : wn >= 25 ? 12 : 10;
  const rest     = wn >= 25 ? "2–3 min" : "2 min";
  return {
    title: isDeload ? "OCR-Hybrid (deload)" : "OCR-Hybrid",
    type: "ocr", duration: isDeload ? "30–35 min" : "45–55 min",
    summary: `${rounds} runder: ${dist}m → ${burpees} burpees → hang → carry`,
    common: {
      rounds,
      circuit: [
        `${dist} m løp @ {{ocr_run}} · 1–3% stigning`,
        `${burpees} burpees`,
        "{{hang}} sek dead hang",
        "100–150 m farmer's carry @ {{carry}} kg"
      ],
      rest: `${rest} pause mellom runder`
    },
    athletes: _p3ath(),
    dagsform: {
      yellow: `${rounds-1} runder, −0.3 km/t, −10 sek hang`,
      red: `${Math.max(2,rounds-2)} runder, dropp burpees`
    }
  };
}

function _p3Thursday(wn) {
  const isDeload = wn === 24 || wn === 32;
  const isTest   = wn === 28;
  if (isTest) return {
    title: "Løpetest 20 min", type: "intervals", duration: "40 min",
    summary: "Oppvarming 10 min → 20 min maks bærekraftig fart → 10 min rolig ned",
    common: {
      part1: { machine: "Mølle eller utendørs", sets: "20 min steady", speed: "Maks bærekraftig fart (test)", incline: "0%" },
      note: "Registrer distansen i Tester-fanen → sonene oppdateres automatisk"
    },
    athletes: _p3ath(),
    dagsform: { yellow: "Utsett til neste uke", red: "Utsett – kroppen er ikke klar" }
  };
  if (isDeload) return {
    title: "Lett intervall (deload)", type: "intervals", duration: "30 min",
    summary: "4×2 min @ {{threshold}} · 2 min pause",
    common: { part1: { machine: "Mølle eller utendørs", sets: "4×2 min", speed: "{{threshold}}", incline: "0%", rest: "2 min pause" } },
    athletes: _p3ath(),
    dagsform: { yellow: "3×2 min", red: "Rolig gange 20 min" }
  };
  const sets    = wn >= 29 ? "3×4 min" : wn >= 25 ? "2 serier × 4×3 min" : wn >= 21 ? "7×3 min" : "6×3 min";
  const rest    = wn >= 29 ? "3 min pause" : wn >= 25 ? "2 min / 4 min mellom serier" : "2 min pause";
  const strides = wn >= 29 ? "4×100 m @ {{strides}} etter intervalldragene · full hvile mellom" : null;
  return {
    title: "Terskelintervaller", type: "intervals", duration: "40–50 min",
    summary: `${sets} @ {{threshold}} · ${rest}${strides ? ' + strides' : ''}`,
    common: {
      part1: { machine: "Mølle eller utendørs", sets, speed: "{{threshold}}", incline: "0–1%", rest },
      ...(strides ? { strides } : {})
    },
    athletes: _p3ath(),
    dagsform: { yellow: "Én serie færre, −0.3 km/t", red: "Halvér drag, rolig tempo" }
  };
}

function _p3Friday(wn) {
  const isDeload = wn === 24 || wn === 32;
  const isTest   = wn === 28;
  const min = isDeload || isTest ? 30 : wn >= 29 ? 60 : wn >= 25 ? 55 : wn >= 21 ? 50 : 45;
  return {
    title: "Rolig langtur", type: "recovery", duration: `${min}–${min+5} min`,
    summary: `${min}–${min+5} min @ {{easy}} · aerob base`,
    common: {
      options: [
        `Mølle: ${min}–${min+5} min @ {{easy}} · 2–4% stigning`,
        `Utendørs: ${min}–${min+5} min @ {{easy}} · lett terreng`
      ],
      mobility: ["Hofteåpner 2×45 sek", "Leggstrekk 2×45 sek", "Thorax-rotasjon 2×10"]
    },
    athletes: _p3ath(),
    dagsform: { yellow: `${min-5} min, −0.5 km/t`, red: "20–30 min gange + mobilitet" }
  };
}

function _p3Week(wn) {
  const startMs   = new Date('2026-01-12T00:00:00').getTime() + (wn - 1) * 7 * 86400000;
  const startDate = new Date(startMs).toISOString().split('T')[0];
  const isDeload  = wn === 24 || wn === 32;
  const noteMap   = {
    21: '⚡ Testuke – Løpetest 20 min (torsdag). Sonene oppdateres automatisk.',
    24: 'Deload + OCR flytest – jobb teknikk, ikke intensitet',
    28: '⚡ Testuke – Løpetest 20 min (torsdag). Ny fartskalibrering.',
    32: 'Deload + OCR flytest · Navy Race 29. august'
  };
  return {
    weekNumber: wn, phase: 3, label: `Uke ${wn}`, startDate, isDeload,
    note: noteMap[wn] || null,
    sessions: { monday: _p3Monday(wn), tuesday: _p3Tuesday(wn), thursday: _p3Thursday(wn), friday: _p3Friday(wn) }
  };
}

// Legg til fase 3-uker og re-eksporter
PROGRAM_DATA.weeks.push(
  // ─── FASE 3: Mai–August 2026 (Uke 18–32) ─────────────────────────────────
  ...[18,19,20,21,22,23,24,25,26,27,28,29,30,31,32].map(_p3Week),

  // ─── FASE 4: Overgang etter Navy Race (Uke 33–36) ────────────────────────
  // Uke 34: Løpetest → nye terskelfarter · Langtur øker mot 110–120 min
  ...Array.from({ length: 4 }, (_, i) => {
    const wn = 33 + i;
    const startMs = new Date('2026-01-12T00:00:00').getTime() + (wn - 1) * 7 * 86400000;
    const startDate = new Date(startMs).toISOString().split('T')[0];
    const isDeload = wn === 33, isTest = wn === 34;
    const ath = { sondre: null, knut: null, geir: null, kjetil: "geir" };
    return {
      weekNumber: wn, phase: 4, label: `Uke ${wn}`, startDate, isDeload,
      note: isTest ? '⚡ Testuke 34 – Løpetest 20 min: nye terskelfarter for HM-blokken' : isDeload ? 'Deload etter Navy Race – gjenoppretting' : 'Fase 4 – Overgang: 1×OCR/uke, løpsmengde øker',
      sessions: {
        monday:   { title: "Styrke (lett)", type: "strength", duration: "30–35 min", summary: "Vedlikeholdsstyrke – grep og core", common: { exercises: ["Pull-up / TRX-roing 3×6","Dead hang 3×{{hang}} sek","Farmer's carry 2×40 m @ {{carry}} kg","Push-press 3×8","Planke 3×45 sek"] }, athletes: ath, dagsform: { yellow: "2 runder", red: "Dropp, ta hvile" } },
        tuesday:  { title: isTest ? "Løpetest 20 min" : "Terskeløkt", type: "intervals", duration: isTest ? "40 min" : "45 min",
          summary: isTest ? "Testdag: 20 min maks bærekraftig fart" : "5×5 min @ {{threshold}} · 2–3 min pause",
          common: isTest
            ? { part1: { machine: "Mølle eller utendørs", sets: "20 min steady", speed: "Maks", incline: "0%" }, note: "Registrer distansen i Tester-fanen etter testen" }
            : { part1: { machine: "Mølle eller utendørs", sets: "5×5 min", speed: "{{threshold}}", incline: "0–1%", rest: "2–3 min pause" } },
          athletes: ath, dagsform: { yellow: "4×5 min, −0.3 km/t", red: "3×4 min, rolig" }
        },
        thursday: { title: "OCR vedlikehold", type: "ocr", duration: "35–40 min", summary: "4 runder: 400m → burpees → hang → carry", common: { rounds: 4, circuit: ["400 m løp @ {{ocr_run}}","10 burpees","{{hang}} sek hang","100 m carry @ {{carry}} kg"], rest: "2 min pause" }, athletes: ath, dagsform: { yellow: "3 runder", red: "2 runder, dropp burpees" } },
        friday:   { title: "Langtur", type: "recovery", duration: "90–110 min", summary: "90–110 min @ {{easy}} · bygg aerob base", common: { options: ["Mølle: 90–110 min @ {{easy}} · 2–3%","Utendørs: 90–110 min @ {{easy}}"] }, athletes: ath, dagsform: { yellow: "70–80 min", red: "45–60 min rolig" } }
      }
    };
  }),

  // ─── FASE 5: Halvmaraton-spesifikk (Uke 37–44) ───────────────────────────
  // Terskel + progresjonsøkt + langtur · Uke 40: Løpetest · Uke 44: Deload
  ...Array.from({ length: 8 }, (_, i) => {
    const wn = 37 + i;
    const startMs = new Date('2026-01-12T00:00:00').getTime() + (wn - 1) * 7 * 86400000;
    const startDate = new Date(startMs).toISOString().split('T')[0];
    const isDeload = wn === 44, isTest = wn === 40;
    const ltMin = isDeload ? 70 : wn >= 42 ? 130 : wn >= 40 ? 125 : wn >= 38 ? 120 : 115;
    const thrSets = isDeload ? "4×5 min" : wn >= 42 ? "2×15 min" : wn >= 39 ? "3×10 min" : "4×8 min";
    const thrRest = wn >= 39 ? "3 min pause" : "2 min pause";
    const ath = { sondre: null, knut: null, geir: null, kjetil: "geir" };
    return {
      weekNumber: wn, phase: 5, label: `Uke ${wn}`, startDate, isDeload,
      note: isTest ? '⚡ Testuke 40 – Løpetest 20 min: fartskalibrering for HM' : isDeload ? 'Deload – avslutt HM-blokk, forb. maratonbase' : 'Fase 5 – HM-spesifikk',
      sessions: {
        monday:   { title: "Styrke (minimal)", type: "strength", duration: "25–30 min", summary: "Vedlikehold – grep og stabilitet", common: { exercises: ["Dead hang 3×{{hang}} sek","Farmer's carry 2×30 m @ {{carry}} kg","TRX-roing 3×8","Planke 3×45 sek"] }, athletes: ath, dagsform: { yellow: "2 runder", red: "Dropp" } },
        tuesday:  { title: isTest ? "Løpetest 20 min" : `Terskeløkt (${thrSets})`, type: "intervals", duration: isTest ? "40 min" : "50–55 min",
          summary: isTest ? "20 min maks bærekraftig fart" : `${thrSets} @ {{threshold}} · ${thrRest}`,
          common: isTest
            ? { part1: { machine: "Mølle eller utendørs", sets: "20 min steady", speed: "Maks", incline: "0%" }, note: "Registrer distansen i Tester-fanen" }
            : { part1: { machine: "Mølle eller utendørs", sets: thrSets, speed: "{{threshold}}", incline: "0%", rest: thrRest } },
          athletes: ath, dagsform: { yellow: "−1 drag, −0.3 km/t", red: "Halvér drag" }
        },
        thursday: { title: "Progresjonsøkt", type: "intervals", duration: "55–60 min",
          summary: "Start {{easy}}, bygg til {{threshold}} siste 20 min · strides etterpå",
          common: {
            part1: { machine: "Mølle eller utendørs", sets: "35–40 min", speed: "Start @ {{easy}} → bygg til {{ocr_run}} halvveis → {{threshold}} siste 20 min", incline: "0–1%" },
            strides: "4×100 m @ {{strides}} etter progresjonsøkten · full hvile mellom"
          },
          athletes: ath, dagsform: { yellow: "Dropp byggfasen, kjør jevn {{easy}}", red: "30 min rolig @ {{easy}}" }
        },
        friday:   { title: "Langtur", type: "recovery", duration: `${ltMin}–${ltMin+10} min`,
          summary: `${ltMin}–${ltMin+10} min @ {{easy}} · lang aerob base`,
          common: { options: [`Utendørs: ${ltMin}–${ltMin+10} min @ {{easy}} · flatt`,`Mølle: ${ltMin}–${ltMin+10} min @ {{easy}} · 1–2%`] },
          athletes: ath, dagsform: { yellow: `${ltMin-15} min`, red: `${Math.round(ltMin*0.6)} min rolig` }
        }
      }
    };
  }),

  // ─── FASE 6: Maratonbase (Uke 45–50) ─────────────────────────────────────
  // Volum + robusthet · Hang/carry annenhver uke · Ingen harde tester
  ...Array.from({ length: 6 }, (_, i) => {
    const wn = 45 + i;
    const startMs = new Date('2026-01-12T00:00:00').getTime() + (wn - 1) * 7 * 86400000;
    const startDate = new Date(startMs).toISOString().split('T')[0];
    const isDeload = wn === 50, hangWeek = wn % 2 === 1;
    const ltMin = isDeload ? 90 : wn >= 48 ? 150 : wn >= 46 ? 140 : 130;
    const ath = { sondre: null, knut: null, geir: null, kjetil: "geir" };
    return {
      weekNumber: wn, phase: 6, label: `Uke ${wn}`, startDate, isDeload,
      note: isDeload ? 'Deload – avslutt maratonbase' : `Fase 6 – Maratonbase${hangWeek ? ' · Hang/carry denne uka' : ''}`,
      sessions: {
        monday:   hangWeek
          ? { title: "Grep & robusthet", type: "strength", duration: "35–40 min", summary: "Vedlikehold – grep, carry og stabilitet", common: { exercises: ["Dead hang 3×{{hang}} sek","Farmer's carry 3×40 m @ {{carry}} kg","TRX-roing 3×8","Planke 3×45 sek","Push-press 3×8"] }, athletes: ath, dagsform: { yellow: "2 runder", red: "Dropp" } }
          : { title: "Lett styrke / mobilitet", type: "strength", duration: "25–30 min", summary: "Core og mobilitet", common: { exercises: ["Planke 3×60 sek","Hofteåpner 3×45 sek","TRX-roing 3×8","Shoulder CARs 3×8"] }, athletes: ath, dagsform: { yellow: "Bare mobilitet", red: "Dropp" } },
        tuesday:  { title: "Rolig løp", type: "recovery", duration: "60–80 min", summary: "60–80 min @ {{easy}} · bygge volum", common: { options: ["Utendørs: 60–80 min @ {{easy}} · lett terreng","Mølle: 60–80 min @ {{easy}} · 1–2%"] }, athletes: ath, dagsform: { yellow: "50 min", red: "30–40 min gange" } },
        thursday: { title: "Lett intervall / aerob", type: "intervals", duration: "45–50 min", summary: "6×4 min @ {{ocr_run}} · 2 min pause · rolig base", common: { part1: { machine: "Mølle eller utendørs", sets: "6×4 min", speed: "{{ocr_run}}", incline: "0–1%", rest: "2 min pause" }, note: "Fase 6 – roligere arbeid, ingen maks-innsats" }, athletes: ath, dagsform: { yellow: "4×4 min", red: "Rolig jogg 30 min" } },
        friday:   { title: "Langtur", type: "recovery", duration: `${ltMin}–${ltMin+10} min`,
          summary: `${ltMin}–${ltMin+10} min @ {{easy}} · lang aerob tur`,
          common: { options: [`Utendørs: ${ltMin}–${ltMin+10} min @ {{easy}}`,`Mølle/løyper: ${ltMin}–${ltMin+10} min @ {{easy}} · variert underlag`] },
          athletes: ath, dagsform: { yellow: `${ltMin-20} min`, red: `${Math.round(ltMin*0.6)} min rolig` }
        }
      }
    };
  })
);
