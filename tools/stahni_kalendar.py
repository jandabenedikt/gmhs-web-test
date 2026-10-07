#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Stáhne iCal feed akcí ze systému Klasifikace a uloží ho jako data/akce.json,
ze kterého stránka kalendar-akci.html (skript kalendar.js) vykresluje akce.

Navíc sestaví data/kalendar.ics — společný kalendář ke stažení/odběru, který
slučuje VŠECHNY zdroje (Klasifikace + plakát z data/akce-plakat.json) stejně
jako stránka: při shodě dne i času začátku má přednost akce z plakátu.
Na tento soubor vedou tlačítka „Přidat do Google Kalendáře“ / „Přidat do Apple / Outlook“.

Spouští ho automaticky GitHub Actions (.github/workflows/kalendar-akci.yml).
Jde spustit i ručně:  python3 tools/stahni_kalendar.py
Pro test z lokálního souboru:  python3 tools/stahni_kalendar.py soubor.ics

Používá jen standardní knihovnu Pythonu (bez instalace balíčků).
"""
import json
import os
import sys
import urllib.request
from datetime import date, datetime, timedelta, timezone
from zoneinfo import ZoneInfo

FEED_URL = "https://klasifikace.jphsw.cz/calendar/ical/?hash=6da9003b743b65f4c0ccd295cc484e57"
LOCAL_TZ = ZoneInfo("Europe/Prague")
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_PATH = os.path.join(ROOT, "data", "akce.json")
EXTRA_SOURCES = [os.path.join(ROOT, "data", "akce-plakat.json")]   # další ručně spravované zdroje
ICS_PATH = os.path.join(ROOT, "data", "kalendar.ics")
CAL_NAME = "GMHS – Kalendář akcí"


def load_ics(source=None):
    if source:
        with open(source, "rb") as f:
            raw = f.read()
    else:
        req = urllib.request.Request(FEED_URL, headers={"User-Agent": "gmhs.cz kalendar-akci"})
        with urllib.request.urlopen(req, timeout=60) as resp:
            raw = resp.read()
    return raw.decode("utf-8-sig", errors="replace")


def unfold(text):
    """Spojí zalomené řádky podle RFC 5545 (pokračovací řádek začíná mezerou/tabulátorem)."""
    lines = []
    for line in text.replace("\r\n", "\n").replace("\r", "\n").split("\n"):
        if line[:1] in (" ", "\t") and lines:
            lines[-1] += line[1:]
        else:
            lines.append(line)
    return lines


def parse_line(line):
    """'DTSTART;TZID=Europe/Prague:20260923T180000' -> ('DTSTART', {'TZID': ...}, '2026...')"""
    in_quotes = False
    for i, ch in enumerate(line):
        if ch == '"':
            in_quotes = not in_quotes
        elif ch == ":" and not in_quotes:
            head, value = line[:i], line[i + 1:]
            break
    else:
        return None
    parts = head.split(";")
    params = {}
    for p in parts[1:]:
        if "=" in p:
            k, v = p.split("=", 1)
            params[k.upper()] = v.strip('"')
    return parts[0].upper(), params, value


def unescape(value):
    out, i = [], 0
    while i < len(value):
        ch = value[i]
        if ch == "\\" and i + 1 < len(value):
            nxt = value[i + 1]
            out.append("\n" if nxt in "nN" else nxt)
            i += 2
        else:
            out.append(ch)
            i += 1
    return "".join(out).strip()


def parse_dt(value, params):
    """Vrátí (datetime v místním čase nebo date, all_day)."""
    value = value.strip()
    if params.get("VALUE") == "DATE" or (len(value) == 8 and value.isdigit()):
        return date(int(value[0:4]), int(value[4:6]), int(value[6:8])), True
    dt = datetime.strptime(value[:15], "%Y%m%dT%H%M%S")
    if value.endswith("Z"):
        dt = dt.replace(tzinfo=timezone.utc)
    else:
        tzid = params.get("TZID")
        try:
            dt = dt.replace(tzinfo=ZoneInfo(tzid) if tzid else LOCAL_TZ)
        except Exception:
            dt = dt.replace(tzinfo=LOCAL_TZ)
    return dt.astimezone(LOCAL_TZ).replace(tzinfo=None), False


def parse_events(text):
    events, cur = [], None
    for line in unfold(text):
        if line == "BEGIN:VEVENT":
            cur = {}
            continue
        if line == "END:VEVENT":
            if cur is not None:
                events.append(cur)
            cur = None
            continue
        if cur is None:
            continue
        parsed = parse_line(line)
        if not parsed:
            continue
        name, params, value = parsed
        if name in ("DTSTART", "DTEND"):
            try:
                cur[name] = parse_dt(value, params)
            except ValueError:
                pass
        elif name in ("SUMMARY", "LOCATION", "DESCRIPTION", "URL", "UID", "STATUS"):
            cur[name] = unescape(value)
        elif name == "DURATION":
            cur[name] = value
    return events


def parse_duration(value):
    """Jednoduchý převod ISO 8601 trvání (např. PT1H30M, P1D) na timedelta."""
    import re
    m = re.fullmatch(r"([+-])?P(?:(\d+)W)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?", value or "")
    if not m:
        return None
    sign = -1 if m.group(1) == "-" else 1
    w, d, h, mi, s = (int(x) if x else 0 for x in m.groups()[1:])
    return sign * timedelta(weeks=w, days=d, hours=h, minutes=mi, seconds=s)


def to_json_event(ev):
    if "DTSTART" not in ev or ev.get("STATUS", "").upper() == "CANCELLED":
        return None
    start, all_day = ev["DTSTART"]
    end = ev.get("DTEND", (None, all_day))[0]
    if end is None and ev.get("DURATION"):
        dur = parse_duration(ev["DURATION"])
        if dur is not None:
            end = start + dur
    if all_day:
        # DTEND je u celodenních akcí podle standardu exkluzivní -> poslední den = DTEND - 1 den
        last = (end - timedelta(days=1)) if isinstance(end, date) and end > start else start
        return {
            "title": ev.get("SUMMARY", "") or "Akce",
            "allDay": True,
            "start": start.isoformat(),
            "end": last.isoformat(),
            "location": ev.get("LOCATION", ""),
            "description": ev.get("DESCRIPTION", ""),
            "url": ev.get("URL", ""),
        }
    return {
        "title": ev.get("SUMMARY", "") or "Akce",
        "allDay": False,
        "start": start.isoformat(timespec="minutes"),
        "end": end.isoformat(timespec="minutes") if isinstance(end, datetime) else None,
        "location": ev.get("LOCATION", ""),
        "description": ev.get("DESCRIPTION", ""),
        "url": ev.get("URL", ""),
    }


# ------------------------------------------------- společný kalendář (.ics) ---

def ics_escape(text):
    return (text or "").replace("\\", "\\\\").replace(";", "\\;").replace(",", "\\,").replace("\n", "\\n")


def ics_fold(line):
    """Zalomí řádek na max. 75 bajtů (RFC 5545), bez rozdělení vícebajtového znaku."""
    out, cur, size = [], "", 0
    for ch in line:
        n = len(ch.encode("utf-8"))
        if size + n > (75 if not out else 74):
            out.append(cur)
            cur, size = "", 0
        cur += ch
        size += n
    out.append(cur)
    return "\r\n ".join(out)


def to_utc_stamp(local_iso):
    dt = datetime.fromisoformat(local_iso).replace(tzinfo=LOCAL_TZ)
    return dt.astimezone(timezone.utc).strftime("%Y%m%dT%H%M%SZ")


def merged_events():
    """Akce ze všech zdrojů; při shodě začátku (akce s časem) vyhrává ruční zdroj."""
    def read(path):
        try:
            with open(path, encoding="utf-8") as f:
                return json.load(f).get("events", [])
        except (OSError, ValueError):
            return []
    extra = []
    for path in EXTRA_SOURCES:
        extra += read(path)
    extra_starts = {e["start"] for e in extra if not e.get("allDay")}
    feed = [e for e in read(OUT_PATH) if e.get("allDay") or e["start"] not in extra_starts]
    events = feed + extra
    events.sort(key=lambda e: (e["start"], e["title"]))
    return events


def build_ics(events):
    import hashlib
    lines = [
        "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//GMHS//Kalendar akci//CS", "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH", "X-WR-CALNAME:" + ics_escape(CAL_NAME), "X-WR-TIMEZONE:Europe/Prague",
        "REFRESH-INTERVAL;VALUE=DURATION:PT3H", "X-PUBLISHED-TTL:PT3H",
    ]
    for e in events:
        uid = hashlib.sha1((e["start"] + "|" + e["title"]).encode("utf-8")).hexdigest()[:20] + "@gmhs.cz"
        lines += ["BEGIN:VEVENT", "UID:" + uid]
        if e.get("allDay"):
            first = date.fromisoformat(e["start"][:10])
            last = date.fromisoformat((e.get("end") or e["start"])[:10])
            lines += ["DTSTAMP:" + first.strftime("%Y%m%dT000000Z"),
                      "DTSTART;VALUE=DATE:" + first.strftime("%Y%m%d"),
                      "DTEND;VALUE=DATE:" + (last + timedelta(days=1)).strftime("%Y%m%d")]
        else:
            start = to_utc_stamp(e["start"])
            lines += ["DTSTAMP:" + start, "DTSTART:" + start]
            if e.get("end"):
                lines.append("DTEND:" + to_utc_stamp(e["end"]))
        lines.append("SUMMARY:" + ics_escape(e.get("title")))
        if e.get("location"):
            lines.append("LOCATION:" + ics_escape(e["location"]))
        if e.get("description"):
            lines.append("DESCRIPTION:" + ics_escape(e["description"]))
        if e.get("url"):
            lines.append("URL:" + e["url"])
        lines.append("END:VEVENT")
    lines.append("END:VCALENDAR")
    return "\r\n".join(ics_fold(l) for l in lines) + "\r\n"


def write_ics():
    events = merged_events()
    content = build_ics(events)
    old = None
    if os.path.exists(ICS_PATH):
        with open(ICS_PATH, encoding="utf-8", newline="") as f:
            old = f.read()
    if old == content:
        print(f"data/kalendar.ics beze změny ({len(events)} akcí).")
        return
    with open(ICS_PATH, "w", encoding="utf-8", newline="") as f:
        f.write(content)
    print(f"Uloženo {len(events)} akcí do data/kalendar.ics.")


def main():
    if "--jen-ics" in sys.argv:          # jen přegenerovat společný kalendář z uložených dat
        write_ics()
        return
    source = sys.argv[1] if len(sys.argv) > 1 else None
    try:
        text = load_ics(source)
    except Exception as exc:
        print(f"Kalendář z Klasifikace se nepodařilo stáhnout ({exc}) — použijí se uložená data.")
        write_ics()
        sys.exit(1)
    if "BEGIN:VCALENDAR" not in text:
        write_ics()
        sys.exit("Stažený soubor nevypadá jako iCal kalendář — data/akce.json se nemění.")
    events = [e for e in (to_json_event(ev) for ev in parse_events(text)) if e]
    events.sort(key=lambda e: (e["start"], e["title"]))
    payload = {"events": events}

    os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)
    new = json.dumps(payload, ensure_ascii=False, indent=1)
    old = None
    if os.path.exists(OUT_PATH):
        with open(OUT_PATH, encoding="utf-8") as f:
            old = f.read()
    if old == new:
        print(f"data/akce.json beze změny ({len(events)} akcí).")
    else:
        with open(OUT_PATH, "w", encoding="utf-8") as f:
            f.write(new)
        print(f"Uloženo {len(events)} akcí do data/akce.json.")
    write_ics()


if __name__ == "__main__":
    main()
