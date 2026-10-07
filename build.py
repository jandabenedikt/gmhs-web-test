#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
GENERÁTOR WEBU GMHS — jeden příkaz vyrobí celý web.

    python build.py             vyrobí (přepíše) všechny stránky webu
    python build.py --kontrola  nic nezapisuje, jen ohlásí stránky, které se
                                liší od toho, co by vyrobil generátor
                                (= někdo upravil HTML ručně, nebo se zapomnělo
                                spustit build). Vrací chybový kód 1, když něco
                                nesedí — hodí se i pro GitHub Actions.

Stačí obyčejný Python 3 (žádné další knihovny se neinstalují).

KDE CO UPRAVOVAT
  _obsah/…            obsah stránek — jeden soubor na stránku, stejná cesta
                      jako výsledná stránka (_obsah/gymnazium/maturita.html
                      → gymnazium/maturita.html). Nahoře mezi řádky „---“
                      jsou údaje o stránce, pod nimi obsah v HTML.
  _sablony/…          kostra stránky, hlavička (lišta + menu), patičky sekcí,
                      záhlaví podstránky, SEO značky. Změna se projeví na
                      všech stránkách.
  MENU níže           položky menu obou sekcí.
  aktuality_data.py   příspěvky do Aktualit (stránka o-nas/aktuality.html
                      i tři boxy na úvodní stránce se z nich vyrábí samy).

PRAVIDLO: vygenerované .html soubory se nikdy neupravují ručně — vždy
_obsah/ nebo _sablony/ a pak „python build.py“. Jinak je příští build přepíše.

ÚDAJE O STRÁNCE (hlavička obsahového souboru, vše kromě „nazev“ nepovinné)
  nazev:        text do <title> (a do náhledů pro sociální sítě)
  popis:        meta description
  nadrazena:    malý nápis nad nadpisem (např. „Gymnázium“)
  nadpis:       hlavní nadpis H1 podstránky
  uvod:         odstavec pod nadpisem
  vedle_nadpisu: HTML vpravo vedle nadpisu (tlačítka, odkazy na PDF)
  zahlavi: ne   stránka nemá standardní záhlaví (úvodní stránky — nadpis
                si stránka řeší sama v obsahu)
  sekce:        hudba / skola — jinak se určí podle cesty (viz sekce_pro())
  obal:         vlastní atributy obalu .page (např. style="…")
  indexovat: ne stránka se nemá objevit ve vyhledávačích (404)
  adresa:       vlastní kanonická adresa (jinak https://gmhs.cz/<cesta>)
  generuj: aktuality   obsah stránky se vyrobí z aktuality_data.py
  verze_stylu:  verze style.css jen pro tuto stránku (viz VERZE_STYLU)
  hlava: |      řádky navíc do <head> (styly a skripty jen pro tuto stránku),
                každý řádek odsazený dvěma mezerami
"""
import os
import re
import sys
from datetime import datetime

ROOT = os.path.dirname(os.path.abspath(__file__))
OBSAH = os.path.join(ROOT, "_obsah")
SABLONY = os.path.join(ROOT, "_sablony")

sys.path.insert(0, ROOT)
from aktuality_data import AKTUALITY  # noqa: E402

# =============================================================== NASTAVENÍ ===

HUDBA_HOME = "hudebni-zivot/index.html"
SKOLA_HOME = "index.html"
WEB = "https://gmhs.cz/"

# Verze stylopisu pro všechny stránky („style.css?v=…“). Po změně style.css ji
# zvýšit, aby prohlížeče návštěvníků nepoužily starou verzi z mezipaměti.
# Prázdné = bez verze. Jednotlivá stránka ji může přebít údajem „verze_stylu“.
VERZE_STYLU = "2026-10-07-12"

# Položka menu: (popisek, odkaz, podnabídka nebo None).
# V podnabídce: (odkaz, popisek); odkaz None = neaktivní šedý text (připravuje se).
MENU = {
    # Žijeme hudbou! — bez rozbalovacích nabídek
    "hudba": [
        ("Program", "hudebni-zivot/index.html#program", None),
        ("Koncerty", "hudebni-zivot/index.html#program", None),
        ("Soutěže", "hudebni-zivot/poradane-souteze.html", None),
        ("Soubory a orchestry", "hudebni-zivot/orchestry-a-soubory.html", None),
        ("Galerie", "galerie.html", None),
    ],
    # Stránky školy — zatím s rozbalovacími nabídkami
    "skola": [
        ("O nás", "o-nas/uredni-deska.html", [
            ("o-nas/aktuality.html", "Aktuality"),
            ("o-nas/kontakt.html", "Kontakt"),
            ("o-nas/personal.html", "Personál školy"),
            ("o-nas/srp-gmhs.html", "Sdružení rodičů a přátel GMHS"),
            ("o-nas/historie.html", "Historie"),
            ("o-nas/nasi-partnere.html", "Naši partneři"),
            ("o-nas/uredni-deska.html", "Úřední deska"),
        ]),
        ("Gymnázium", "gymnazium/jak-funguje-studium.html", [
            ("gymnazium/jak-funguje-studium.html", "Jak funguje studium na gymnáziu"),
            ("gymnazium/prijimaci-zkousky.html", "Přijímací zkoušky"),
            ("gymnazium/den-otevrenych-dveri.html", "Den otevřených dveří"),
            ("gymnazium/maturita.html", "Maturita"),
            ("gymnazium/cambridge.html", "Cambridge English Preparation Centre"),
            ("gymnazium/skolska-rada.html", "Školská rada gymnázia"),
        ]),
        ("Hudební škola", "hudebni-skola/jak-funguje-studium.html", [
            ("hudebni-skola/jak-funguje-studium.html", "Jak funguje studium na HŠ"),
            ("hudebni-skola/hudebni-nauka-phv.html", "Hudební nauka a přípravná hudební výchova"),
            ("hudebni-skola/prijimaci-zkousky-uplata.html", "Přijímací zkoušky a úplata"),
            ("https://klasifikace.jphsw.cz/application/default?hash=6da9003b743b65f4c0ccd295cc484e57", "Přihláška ke studiu"),
            ("hudebni-skola/faq.html", "Často kladené dotazy"),
        ]),
        ("Galerie", "galerie.html", None),
        ("Kalendář akcí", "kalendar-akci.html", None),
        ("Intranet", None, [
            ("https://gmhs.bakalari.cz/login", "Bakaláři"),
            ("https://klasifikace.jphsw.cz/?hash=6da9003b743b65f4c0ccd295cc484e57", "Klasifikace"),
            (None, "Žák GM"),
            (None, "Žák HŠ"),
            (None, "Hudební pedagog"),
        ]),
    ],
}

LOCK_SVG = ('<svg class="nav-lock-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" '
            'stroke="currentColor" stroke-width="1.7" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="1"></rect>'
            '<path d="M8 11V7a4 4 0 0 1 8 0v4"></path></svg>')


def sekce_pro(cesta):
    """Do které sekce stránka patří: 'hudba', nebo 'skola'."""
    if cesta.startswith("hudebni-zivot/") or cesta == "galerie.html":
        return "hudba"
    return "skola"


# ================================================================ ŠABLONY ===

def sablona(nazev, orezat=True):
    with open(os.path.join(SABLONY, nazev), encoding="utf-8") as f:
        text = f.read()
    return text.rstrip("\n") if orezat else text


def dosad(text, hodnoty):
    """Nahradí {{klic}} hodnotou. Dosazený text se už dál neprochází."""
    return re.sub(r"\{\{(\w+)\}\}", lambda m: str(hodnoty.get(m.group(1), m.group(0))), text)


def _externi(href):
    return href.startswith("http://") or href.startswith("https://")


def menu_html(koren, cesta, sekce):
    label = "Žijeme hudbou!" if sekce == "hudba" else "Stránky školy"
    parts = [f'      <nav class="main-nav" aria-label="Menu – {label}">']
    for popisek, odkaz, podnabidka in MENU[sekce]:
        aktivni = (odkaz is not None and "#" not in odkaz and odkaz == cesta) or \
                  bool(podnabidka and any(p == cesta for p, _ in podnabidka))
        akt = " active" if aktivni else ""
        if podnabidka:
            zamek = popisek == "Intranet"
            parts.append(f'        <div class="{"nav-item nav-lock" if zamek else "nav-item"}">')
            parts.append(f'          <button type="button" class="nav-link{akt}" aria-haspopup="true" aria-expanded="false">{LOCK_SVG if zamek else ""}{popisek}</button>')
            parts.append(f'          <div class="{"dropdown-menu dropdown-right" if zamek else "dropdown-menu"}">')
            for href, pol in podnabidka:
                if href is None:
                    parts.append(f'            <span class="dd-soon" aria-disabled="true">{pol}</span>')
                    continue
                ext = _externi(href)
                full = href if ext else koren + href
                je = not ext and href == cesta
                cls = ' class="active"' if je else ""
                cur = ' aria-current="page"' if je else ""
                extra = ' target="_blank" rel="noopener"' if ext else ""
                parts.append(f'            <a{cls} href="{full}"{extra}{cur}>{pol}</a>')
            parts.append('          </div>')
            parts.append('        </div>')
        else:
            cur = ' aria-current="page"' if aktivni else ""
            parts.append(f'        <a class="nav-link{akt}" href="{koren}{odkaz}"{cur}>{popisek}</a>')
    parts.append('      </nav>')
    return "\n".join(parts)


def hlavicka_html(koren, cesta, sekce):
    hudba = sekce == "hudba"
    return dosad(sablona("hlavicka.html"), {
        "koren": koren,
        "trida_hudba": "stab on" if hudba else "stab",
        "trida_skola": "stab" if hudba else "stab on",
        "aktivni_hudba": ' aria-current="true"' if hudba else "",
        "aktivni_skola": "" if hudba else ' aria-current="true"',
        "menu": menu_html(koren, cesta, sekce),
    })


# =============================================================== AKTUALITY ===
# (stejné vykreslení jako dřív v build_site.py — viz claude/aktuality-workflow.md)

CATEGORY_LABELS = {"gymnazium": "Gymnázium", "hudebni-skola": "Hudební škola"}

FB_ICON_SVG = (
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">'
    '<circle cx="12" cy="12" r="9.5"></circle>'
    '<path d="M13.8 9.2h1.7V6.6h-1.9c-1.9 0-2.9 1.1-2.9 2.9v1.5H9v2.6h1.7V18h2.6v-4.4h1.8l.4-2.6h-2.2v-1.1c0-.5.2-.7.7-.7z"></path></svg>'
)


def format_date_cz(iso_date):
    d = datetime.strptime(iso_date, "%Y-%m-%d")
    return f"{d.day}. {d.month}. {d.year}"


def sorted_aktuality():
    return sorted(AKTUALITY, key=lambda p: p["date"], reverse=True)


def aktualita_label(categories):
    return ", ".join(CATEGORY_LABELS.get(c, c) for c in categories)


def aktualita_bg_class(index):
    # Odstíny se střídají podle pořadí (nejnovější = tmavší); názvy tříd jsou historické.
    return "aktualita-gymnazium" if index % 2 == 0 else "aktualita-hudebni-skola"


def aktualita_fb_button_html(post):
    url = post.get("fb_url")
    if not url:
        return ""
    return f"""
      <div class="aktualita-actions">
        <a class="btn btn-outline" href="{url}" target="_blank" rel="noopener">
          {FB_ICON_SVG}
          Zobrazit na Facebooku
        </a>
      </div>"""


def aktuality_section_html(post, index=0):
    return f"""  <div id="{post['slug']}" class="aktualita-block {aktualita_bg_class(index)}">
    <div class="aktualita-inner">
      <div class="aktualita-tag">{aktualita_label(post["category"])}</div>
      <h2 class="aktualita-title display">{post['title']}</h2>
      <div class="aktualita-date">{format_date_cz(post["date"])}</div>
      {post['body_html']}{aktualita_fb_button_html(post)}
    </div>
  </div>"""


def aktuality_boxes_html(koren="", count=3):
    parts = []
    for post in sorted_aktuality()[:count]:
        parts.append(f"""      <a class="news-card" href="{koren}o-nas/aktuality.html#{post['slug']}">
        <span class="news-tag">{aktualita_label(post["category"])}</span>
        <div class="news-title">{post['title']}</div>
        <div class="news-date">{format_date_cz(post["date"])}</div>
        <p class="news-excerpt">{post['excerpt']}</p>
      </a>""")
    return "\n".join(parts)


# ========================================================= OBSAHOVÉ SOUBORY ===

def nacti_obsah(soubor):
    """Vrátí (údaje, obsah). Údaje jsou mezi prvními dvěma řádky „---“."""
    with open(soubor, encoding="utf-8") as f:
        text = f.read()
    if not text.startswith("---\n"):
        raise ValueError(f"{soubor}: chybí hlavička s údaji (řádek ---)")
    konec = text.index("\n---\n", 3)
    hlavicka, obsah = text[4:konec], text[konec + 5:]
    udaje, klic = {}, None
    for radek in hlavicka.split("\n"):
        if klic and (radek.startswith("  ") or radek == ""):
            udaje[klic].append(radek[2:])
            continue
        klic = None
        if not radek.strip() or radek.lstrip().startswith("#"):
            continue
        k, _, v = radek.partition(":")
        k, v = k.strip(), v.strip()
        if v == "|":
            klic = k
            udaje[k] = []
        else:
            udaje[k] = v
    for k, v in list(udaje.items()):
        if isinstance(v, list):
            while v and v[-1] == "":
                v.pop()
            udaje[k] = "\n".join(v)
    if obsah.endswith("\n"):
        obsah = obsah[:-1]
    return udaje, obsah


def vyrob_stranku(cesta, udaje, obsah):
    koren = "../" * cesta.count("/")
    sekce = udaje.get("sekce") or sekce_pro(cesta)

    if udaje.get("generuj") == "aktuality":
        obsah = "\n\n".join(aktuality_section_html(p, i) for i, p in enumerate(sorted_aktuality()))
    if "<!-- AKTUALITY:START -->" in obsah:
        a = obsah.index("<!-- AKTUALITY:START -->") + len("<!-- AKTUALITY:START -->")
        b = obsah.index("<!-- AKTUALITY:END -->")
        obsah = obsah[:a] + "\n" + aktuality_boxes_html(koren) + "\n" + obsah[b:]

    if udaje.get("zahlavi") == "ne":
        zahlavi = ""
    else:
        nadpis = udaje.get("nadpis", "")
        if udaje.get("vedle_nadpisu"):
            nadpis_html = (
                '<div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:20px 28px;">\n'
                f'      <h1 class="page-title display" style="margin:10px 0 0;">{nadpis}</h1>\n'
                f'      {udaje["vedle_nadpisu"]}\n'
                '    </div>')
        else:
            nadpis_html = f'<h1 class="page-title display">{nadpis}</h1>'
        uvod_html = f'\n    <p class="page-lead">{udaje["uvod"]}</p>' if udaje.get("uvod") else ""
        zahlavi = dosad(sablona("zahlavi.html", orezat=False), {
            "nadrazena": udaje.get("nadrazena", ""), "nadpis_html": nadpis_html, "uvod_html": uvod_html})

    if udaje.get("indexovat") == "ne":
        robots, seo = '<meta name="robots" content="noindex">\n', ""
    else:
        robots = ""
        adresa = udaje.get("adresa") or WEB + cesta
        seo = dosad(sablona("seo.html", orezat=False),
                    {"adresa": adresa, "nazev": udaje["nazev"], "popis": udaje.get("popis", "")})

    hlava = udaje.get("hlava", "")
    obal = f'<div class="page" {udaje["obal"]}>' if udaje.get("obal") else '<div class="page">'

    return dosad(sablona("stranka.html", orezat=False), {
        "nazev": udaje["nazev"],
        "popis": udaje.get("popis", ""),
        "robots": robots,
        "koren": koren,
        "verze_stylu": ("?v=" + verze) if (verze := udaje.get("verze_stylu", VERZE_STYLU)) else "",
        "seo": seo,
        "hlava": "\n" + hlava if hlava else "",
        "sekce": sekce,
        "hlavicka": hlavicka_html(koren, cesta, sekce),
        "obal": obal,
        "zahlavi": zahlavi,
        "obsah": obsah,
        "paticka": dosad(sablona(f"paticka-{sekce}.html"), {"koren": koren}),
    })


def vsechny_stranky():
    for slozka, _, soubory in os.walk(OBSAH):
        for jmeno in sorted(soubory):
            if not jmeno.endswith(".html"):
                continue
            zdroj = os.path.join(slozka, jmeno)
            cesta = os.path.relpath(zdroj, OBSAH).replace("\\", "/")
            udaje, obsah = nacti_obsah(zdroj)
            yield cesta, vyrob_stranku(cesta, udaje, obsah)


def main():
    kontrola = "--kontrola" in sys.argv
    zmenene, chybi = [], []
    pocet = 0
    for cesta, html in sorted(vsechny_stranky()):
        pocet += 1
        cil = os.path.join(ROOT, cesta)
        stavajici = None
        if os.path.exists(cil):
            with open(cil, encoding="utf-8", newline="") as f:
                stavajici = f.read().replace("\r\n", "\n")
        if stavajici == html:
            continue
        (chybi if stavajici is None else zmenene).append(cesta)
        if not kontrola:
            os.makedirs(os.path.dirname(cil) or ROOT, exist_ok=True)
            with open(cil, "w", encoding="utf-8", newline="\n") as f:
                f.write(html)

    if kontrola:
        if not zmenene and not chybi:
            print(f"V pořádku — všech {pocet} stránek odpovídá zdrojům v _obsah/ a _sablony/.")
            return 0
        for c in zmenene:
            print("LIŠÍ SE:", c, "(HTML upravené ručně, nebo chybí build)")
        for c in chybi:
            print("CHYBÍ:", c)
        print("Pokud jsou zdroje správně, spusť „python build.py“. Ruční úpravy HTML nejdřív přenes do _obsah/.")
        return 1
    for c in chybi + zmenene:
        print("zapsáno:", c)
    print(f"Hotovo — {pocet} stránek, změněno {len(zmenene) + len(chybi)}.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
