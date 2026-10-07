#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Datový zdroj pro sekci Aktuality.

Nový příspěvek se přidá jako další slovník do seznamu AKTUALITY níže.
Po úpravě spusťte `python3 generate_pages.py` — znovu se vygeneruje stránka
o-nas/aktuality.html i náhledové boxy s aktualitami na úvodní stránce
(automaticky se zobrazí 3 nejnovější příspěvky, řazeno podle data sestupně;
při stejném datu zůstávají příspěvky v pořadí, v jakém jsou zapsané níže).

Pole u každého příspěvku:
  slug      - jedinečný identifikátor (bez diakritiky a mezer), použije se
              jako kotva v URL (o-nas/aktuality.html#slug)
  category  - seznam s jednou nebo oběma hodnotami "gymnazium" a
              "hudebni-skola" — určuje štítek/y nad nadpisem. Barevné
              odlišení oddílu na stránce Aktuality dostává tmavší odstín
              pouze příspěvek s jedinou kategorií ["gymnazium"], všechny
              ostatní (samotná "hudebni-skola" i oba štítky současně)
              mají základní (světlejší) odstín pozadí webu.
  date      - datum ve formátu "RRRR-MM-DD" (podle něj se řadí, nejnovější nahoře)
  title     - nadpis příspěvku
  excerpt   - krátký popis (1–2 věty) pro box na úvodní stránce
  body_html - plný text příspěvku (HTML, typicky jeden nebo více
              odstavců s třídou "aktualita-text")
  fb_url    - (volitelné) odkaz na původní příspěvek na Facebooku; pokud je
              vyplněn, pod textem se zobrazí tlačítko „Zobrazit na Facebooku“
"""

AKTUALITY = [
    {
        "slug": "zaciname",
        "category": ["gymnazium"],
        "date": "2026-08-28",
        "title": "Začínáme!",
        "excerpt": "V úterý 1. 9. 2026 společně zahájíme nový školní.",
        "body_html": (
            '<p class="aktualita-text">V úterý 1. 9. 2026 společně zahájíme nový školní rok '
            'a zároveň přivítáme žáky prim. Jako každý rok, tak i letos se mohou žáci těšit '
            'na výpravné přivítání, které si připravili žáci oktáv.</p>\n'
            '      <p class="aktualita-text">Na to, jak první školní den vypadal před rokem '
            'se můžete podívat v <a href="https://www.rajce.idnes.cz/avuwalub/album/2025-09-01-zacatek-skolniho-roku" '
            'target="_blank" rel="noopener">galerii</a>.</p>'
        ),
    },
    {
        "slug": "novy-web",
        "category": ["gymnazium", "hudebni-skola"],
        "date": "2026-08-28",
        "title": "Nový web",
        "excerpt": "Došlo k vizuální obměně a reorganizaci webu.",
        "body_html": (
            '<p class="aktualita-text">S novým školním rokem spouštíme i nový web školy. '
            'V první fázi bylo reorganizovat obsah webu původního a dát mu nový grafický háv. '
            'Postupně budeme přidávat nové funkce i nový obsah. Proto bychom Vás rádi poprosili '
            'o zpětnou vazbu.</p>\n'
            '      <p class="aktualita-text">Vyplňte prosím krátký dotazník (1 min.) na '
            '<a href="https://forms.gle/nyZUg3oy5QUhtQn67" target="_blank" rel="noopener">tomto odkaze</a>.</p>\n'
            '      <p class="aktualita-text">Předem děkujeme za Váš čas :)</p>'
        ),
    },
    {
        "slug": "zahajeni-skolniho-roku-2026",
        "fb_url": "https://www.facebook.com/GMHS.ZUS/posts/pfbid0WoKuvYZUKK81qDDxVs9FioTex1prGcfWha7jrESxang4tobgMkBh5Dp1aggrqC1Yl",
        "category": ["gymnazium"],
        "date": "2026-09-01",
        "title": "Zahájení školního roku v duchu džungle",
        "excerpt": "Nové studenty přivítali letošní oktaváni školním pralesem, úkoly a domorodou snídaní.",
        "body_html": (
            '<p class="aktualita-text">Tradiční zahájení školního roku v atriu Gymnázia a Hudební školy '
            'hl. m. Prahy okořenili letošní oktaváni tématem džungle. Po projití "školním pralesem", '
            'splnění řady úkolů a ochutnávce domorodé snídaně uvítala nové studenty prim celá škola '
            'v čele s ředitelem Filipem Magramem. Moc se na ně těšíme a přejeme hodně úspěchů, '
            'nejen těch studijních a hudebních❤️</p>'
        ),
    },
    {
        "slug": "ema-adamkova-viden",
        "fb_url": "https://www.facebook.com/GMHS.ZUS/posts/pfbid02WCAFC4dsx5eMd9JrYT8YM9SADMVszooxgLCpcCK8j9g3hwBgJXPofDfBVQdYupcpl",
        "category": ["gymnazium", "hudebni-skola"],
        "date": "2026-09-03",
        "title": "Ema Adamková vítězkou kytarové soutěže ve Vídni",
        "excerpt": "Studentka GMHS Ema Adamková zvítězila v mezinárodní kytarové soutěži ve Vídni.",
        "body_html": (
            '<p class="aktualita-text">Vynikající úspěch studentky GMHS Emy Adámkové, GRATULUJEME!!!</p>\n'
            '      <p class="aktualita-text"><a href="https://www.klasikaplus.cz/ema-adamkova-vitezkou-mezinarodni-kytarove-souteze-ve-vidni/" '
            'target="_blank" rel="noopener">Ema Adamková vítězkou mezinárodní kytarové soutěže ve Vídni</a></p>'
        ),
    },
    {
        "slug": "koncertni-sezona-zlonice",
        "fb_url": "https://www.facebook.com/GMHS.ZUS/posts/pfbid0U55gEsx37JfgSnk2MB4vsjqAXvuh8wZQf3GqpH5Lq9xrNWQvNjNfGfgxEV1uZve6l",
        "category": ["gymnazium", "hudebni-skola"],
        "date": "2026-09-15",
        "title": "Koncertní sezonu začínáme ve Zlonicích",
        "excerpt": "Novou koncertní sezonu tradičně zahajujeme u Antonína Dvořáka ve Zlonicích.",
        "body_html": (
            '<p class="aktualita-text">Koncertní sezonu začínáme tradičně ve Zlonicích u Antonína Dvořáka.</p>'
        ),
    },
    {
        "slug": "pocta-antoninu-dvorakovi",
        "fb_url": "https://www.facebook.com/GMHS.ZUS/posts/pfbid0mWaumzJdfnx3mw7p5Um5sRJBiScpfh7xpiTP9kLtu2881B9tq6WEVfLwtWDLBmE3l",
        "category": ["gymnazium", "hudebni-skola"],
        "date": "2026-09-20",
        "title": "Pocta Antonínu Dvořákovi",
        "excerpt": "Ohlédnutí za koncertem ve Zlonicích, kterým jsme zahájili novou koncertní sezonu.",
        "body_html": (
            '<p class="aktualita-text">Gratulujeme žákům gymnázia a hudební školy ke krásnému koncertu! '
            'Díla nejen Dvořáka, ale i Beethovena, Liszta a dalších předvedli: Evelína Klasnová (HŠ), '
            'Helena Vydrová (sexta), Ondřej Skopový (sekunda), Matouš Zaplatílek (septima), '
            'Luna Hovorková (kvinta), Ondřej Petrášek (oktáva) a Viola Lukášová (septima).</p>\n'
            '      <p class="aktualita-text">Speciální díky Pavel Voráček za klavírní spolupráci celým programem 🌹</p>'
        ),
    },
]
