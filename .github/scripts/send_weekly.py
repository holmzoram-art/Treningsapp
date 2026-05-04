#!/usr/bin/env python3
"""Sends weekly training message to Teams via Incoming Webhook."""

import json, os, sys
from datetime import date, datetime
import urllib.request

WEBHOOK = os.environ.get("TEAMS_WEBHOOK", "")
PROGRAM_START = date(2026, 1, 12)
APP_URL = "https://holmzoram-art.github.io/Treningsapp/"

def week_number():
    today = date.today()
    delta = (today - PROGRAM_START).days
    return max(1, (delta // 7) + 1)

def phase_for_week(n):
    if n <= 8: return 1
    if n <= 17: return 2
    return 3

def week_dates(n):
    monday = datetime.fromordinal(PROGRAM_START.toordinal() + (n - 1) * 7)
    friday = datetime.fromordinal(monday.toordinal() + 4)
    return f"{monday.strftime('%d.%m')}–{friday.strftime('%d.%m')}"

def days_to_race():
    race = date(2026, 5, 9)
    return (race - date.today()).days

# Summarized week data per week number
# Format: { week: { day: { athletes: { name: summary } } } }
# This is a simplified version — the full details are in the app
WEEK_SUMMARIES = {
    9:  {
        "tuesday": {
            "title": "Intervaller",
            "athletes": {
                "Sondre": "🟢 Mølle: 12×45 sek @ 12.0–12.5 km/t · 1–3% · 45s pause\n🟡 Gul: −0.5 km/t\n🔴 Rød: Halvér drag",
                "Knut":   "🟢 Mølle: 8×60 sek @ 7.0 km/t · 8% · 60s pause\n🟡 Gul: −0.5 km/t eller −1%\n🔴 Rød: Halvér drag",
                "Geir":   "🟢 Ro: 10×45s hard / 30s rolig → Mølle: 10×45s @ 6.5–7.0 km/t\n🟡 Gul: Lettere intensitet\n🔴 Rød: Halvér drag",
                "Kjetil": "🟢 Ro: 10×45s hard / 30s rolig → Mølle: 10×45s @ 6.5–7.0 km/t\n🟡 Gul: Lettere intensitet\n🔴 Rød: Halvér drag",
            }
        },
        "thursday": {
            "title": "OCR-Hybrid (5 runder)",
            "athletes": {
                "Sondre": "🟢 500m @ 9–10 km/t · 4–6% → 10 burpees → 60s hang → 100–150m carry\n🟡 Gul: 4 runder, −0.5 km/t\n🔴 Rød: 3 runder, dropp burpees",
                "Knut":   "🟢 500m @ 6.5–7.0 km/t · 4–6% → 10 burpees → 60s hang → 100–150m carry\n🟡 Gul: 4 runder\n🔴 Rød: 3 runder",
                "Geir":   "🟢 500m @ 6.0–6.5 km/t · 4–6% → 10 burpees → 60s hang → 100–150m carry\n🟡 Gul: 4 runder\n🔴 Rød: 3 runder",
                "Kjetil": "🟢 500m @ 6.0–6.5 km/t · 4–6% → 10 burpees → 60s hang → 100–150m carry\n🟡 Gul: 4 runder\n🔴 Rød: 3 runder",
            }
        }
    }
    # Add more weeks here as needed, or keep it generic below
}

def get_generic_message(athlete, week_num, phase):
    return (
        f"Se din fulle økt i appen: {APP_URL}\n"
        f"Velg dagsform: 🟢 Grønn (full økt) · 🟡 Gul (lettere) · 🔴 Rød (50–70%)"
    )

def build_card(week_num):
    phase = phase_for_week(week_num)
    dates = week_dates(week_num)
    race_days = days_to_race()

    race_line = f"🏁 {race_days} dager til Holmenkollstafetten!" if race_days > 0 else "🏆 Holmenkollstafetten er gjennomført!"

    week_data = WEEK_SUMMARIES.get(week_num, {})

    sections = []
    for athlete in ["Sondre", "Knut", "Geir", "Kjetil"]:
        facts = []
        if week_data:
            for day, session in week_data.items():
                athlete_text = session["athletes"].get(athlete, get_generic_message(athlete, week_num, phase))
                day_nb = {"tuesday": "Tirsdag", "thursday": "Torsdag", "monday": "Mandag", "friday": "Fredag"}.get(day, day)
                facts.append({"name": f"{day_nb} – {session['title']}", "value": athlete_text})
        else:
            facts.append({"name": "Full økt", "value": get_generic_message(athlete, week_num, phase)})

        sections.append({
            "activityTitle": f"**{athlete}** – Uke {week_num}",
            "facts": facts
        })

    card = {
        "@type": "MessageCard",
        "@context": "http://schema.org/extensions",
        "themeColor": "6C63FF",
        "summary": f"Treningsprogram uke {week_num}",
        "title": f"🏃 Treningsprogram uke {week_num} ({dates}) – Fase {phase}",
        "text": f"{race_line}\n\nÅpne appen for full oversikt: [{APP_URL}]({APP_URL})",
        "sections": sections,
        "potentialAction": [{
            "@type": "OpenUri",
            "name": "Åpne treningsappen",
            "targets": [{"os": "default", "uri": APP_URL}]
        }]
    }
    return card

def main():
    if not WEBHOOK:
        print("Ingen TEAMS_WEBHOOK_URL satt. Hopper over sending.")
        sys.exit(0)

    week_num = week_number()
    print(f"Sender treningsmelding for uke {week_num}...")

    card = build_card(week_num)
    data = json.dumps(card).encode("utf-8")

    req = urllib.request.Request(
        WEBHOOK,
        data=data,
        headers={"Content-Type": "application/json"},
        method="POST"
    )
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            print(f"Teams svarte: {resp.status}")
    except Exception as e:
        print(f"Feil ved sending: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
