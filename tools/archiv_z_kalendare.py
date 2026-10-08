#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Předvyplní Archiv (data/archiv.json) proběhlými akcemi z kalendáře.

    python tools/archiv_z_kalendare.py

Projde data/akce-plakat.json a data/akce.json (stejná data jako Kalendář akcí
a Program) a každou akci, která už skončila a v archivu ještě není, připíše
do data/archiv.json s prázdnými odkazy na záznamy. Na webu se akce objeví,
až u ní vyplníte aspoň jeden odkaz (url) — fotky, video, zvuk nebo program.

Akce školy jako instituce (den otevřených dveří, ples, přijímačky…) se
přeskočí — do hudebního archivu nepatří (stejné pravidlo jako v Programu).
Stačí obyčejný Python 3.
"""
import json
import os
import re
from datetime import date

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "data")
NEHUDEBNI = re.compile(r"den otevřených dveří|ples|zápis|přijímací|třídní schůzk|prázdnin|ředitelské volno", re.I)


def nacti(jmeno):
    cesta = os.path.join(DATA, jmeno)
    if not os.path.exists(cesta):
        return {}
    with open(cesta, encoding="utf-8") as f:
        return json.load(f)


def main():
    archiv = nacti("archiv.json") or {"zaznamy": []}
    zaznamy = archiv.setdefault("zaznamy", [])
    znam = {(z.get("start", "")[:10], z.get("title", "")) for z in zaznamy}
    dnes = date.today().isoformat()

    plakat = nacti("akce-plakat.json").get("events", [])
    klas = nacti("akce.json").get("events", [])
    zacatky = {str(e.get("start", ""))[:10] for e in plakat}
    # stejná akce v obou zdrojích (stejný den) → verze z plakátu
    akce = plakat + [e for e in klas if str(e.get("start", ""))[:10] not in zacatky]

    pridano = 0
    for e in sorted(akce, key=lambda e: str(e.get("start", ""))):
        start = str(e.get("start", ""))[:10]
        konec = str(e.get("end", "") or start)[:10]
        nazev = (e.get("title") or "").strip()
        if not start or not nazev or konec >= dnes or NEHUDEBNI.search(nazev):
            continue
        if (start, nazev) in znam:
            continue
        zaznamy.append({
            "start": start, "end": konec if konec != start else "", "title": nazev,
            "location": e.get("location", ""), "typ": "", "soubory": [], "popis": "",
            "odkazy": [{"druh": "foto", "url": "", "popisek": ""},
                       {"druh": "video", "url": "", "popisek": ""}],
        })
        znam.add((start, nazev))
        pridano += 1

    with open(os.path.join(DATA, "archiv.json"), "w", encoding="utf-8", newline="\n") as f:
        json.dump(archiv, f, ensure_ascii=False, indent=1)
        f.write("\n")
    print(f"Přidáno {pridano} proběhlých akcí. Doplňte k nim odkazy na záznamy v data/archiv.json.")


if __name__ == "__main__":
    main()
