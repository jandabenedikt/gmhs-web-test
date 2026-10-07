#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generuje HTML stránky pro sekce Gymnázium, Hudební škola, Hudební život,
Galerie a Kalendář akcí (+ pomocné funkce pro hlavičku/patičku, které se dají
znovu použít i pro ruční údržbu úvodní stránky a sekce O nás).
"""
import os
from datetime import datetime

from aktuality_data import AKTUALITY

ROOT = os.path.dirname(os.path.abspath(__file__))

NAV = [
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
        ("https://klasifikace.jphsw.cz/?hash=6da9003b743b65f4c0ccd295cc484e57", "Klasifikace"),
        ("https://klasifikace.jphsw.cz/application/default?hash=6da9003b743b65f4c0ccd295cc484e57", "Přihláška ke studiu"),
        ("hudebni-skola/faq.html", "Často kladené dotazy"),
    ]),
    ("Hudební život", "hudebni-zivot/orchestry-a-soubory.html", [
        ("hudebni-zivot/orchestry-a-soubory.html", "Orchestry a soubory"),
        ("hudebni-zivot/poradane-souteze.html", "Pořádané soutěže"),
        ("hudebni-zivot/projekty-eu.html", "Projekty EU"),
        ("hudebni-zivot/hudebni-uspechy.html", "Hudební úspěchy"),
    ]),
    ("Galerie", "galerie.html", None),
    ("Kalendář akcí", "kalendar-akci.html", None),
]

SOCIAL_IG = "https://www.instagram.com/gmhs_official/"
SOCIAL_FB = "https://www.facebook.com/GMHS.ZUS/?locale=cs_CZ"

ORG_JSONLD = """<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  "name": "Gymnázium a Hudební škola hlavního města Prahy",
  "alternateName": "GMHS",
  "url": "https://gmhs.cz/",
  "logo": "https://gmhs.cz/images/logo.png",
  "image": "https://gmhs.cz/images/building.jpg",
  "telephone": "+420221434711",
  "email": "sekretariat@gmhs.cz",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Komenského náměstí 400/9",
    "postalCode": "130 00",
    "addressLocality": "Praha 3",
    "addressCountry": "CZ"
  },
  "sameAs": [
    "https://www.instagram.com/gmhs_official/",
    "https://www.facebook.com/GMHS.ZUS/?locale=cs_CZ"
  ]
}
</script>"""


def nav_html(depth, active_path=None):
    prefix = "../" if depth == 1 else ""
    parts = ['    <nav class="main-nav">']
    for label, main_href, dropdown in NAV:
        is_active_top = active_path is not None and (
            active_path == main_href or (dropdown and any(p == active_path for p, _ in dropdown))
        )
        active_cls = " active" if is_active_top else ""
        if dropdown:
            parts.append('      <div class="nav-item">')
            parts.append(f'        <button type="button" class="nav-link{active_cls}" aria-haspopup="true" aria-expanded="false">{label}</button>')
            parts.append('        <div class="dropdown-menu">')
            for href, item_label in dropdown:
                is_external = href.startswith("http://") or href.startswith("https://")
                full_href = href if is_external else f"{prefix}{href}"
                item_active = " active" if (not is_external and href == active_path) else ""
                cls_attr = f' class="{item_active.strip()}"' if item_active else ""
                extra_attrs = ' target="_blank" rel="noopener"' if is_external else ""
                parts.append(f'          <a{cls_attr} href="{full_href}"{extra_attrs}>{item_label}</a>')
            parts.append('        </div>')
            parts.append('      </div>')
        else:
            parts.append(f'      <a class="nav-link{active_cls}" href="{prefix}{main_href}">{label}</a>')
    parts.append('    </nav>')
    return "\n".join(parts)


def header_html(depth, active_path=None):
    prefix = "../" if depth == 1 else ""
    return f"""  <header class="site-header">
    <a class="brand" href="{prefix}index.html">
      <img src="{prefix}images/logo.png" alt="Logo GMHS">
      <span class="brand-text">
        <span class="brand-title display">Gymnázium a Hudební škola</span><br>
        <span class="brand-sub">hlavního města Prahy, ZUŠ</span>
      </span>
    </a>
{nav_html(depth, active_path)}
    <a class="btn-bakalari" href="https://gmhs.bakalari.cz/login" target="_blank" rel="noopener">Bakaláři</a>
  </header>"""


def footer_html(depth):
    prefix = "../" if depth == 1 else ""
    return f"""  <footer class="site-footer">
    <div class="footer-top">
      <div class="footer-brand">
        <img src="{prefix}images/logo.png" alt="Logo GMHS">
        <div class="footer-brand-text">
          <div class="footer-brand-name display">Gymnázium a Hudební škola hlavního města Prahy, ZUŠ</div>
          <div class="footer-brand-address">Komenského náměstí 400/9, 130 00 Praha 3</div>
        </div>
      </div>
      <div class="footer-contact">
        <div><a href="tel:+420221434711">+420 221 434 711</a></div>
        <div><a href="mailto:sekretariat@gmhs.cz">sekretariat@gmhs.cz</a></div>
      </div>
      <div class="footer-social">
        <a class="social-icon" href="{SOCIAL_IG}" target="_blank" rel="noopener" aria-label="Instagram">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="5"></rect><circle cx="12" cy="12" r="4.2"></circle><circle cx="17.2" cy="6.8" r="1"></circle></svg>
        </a>
        <a class="social-icon" href="{SOCIAL_FB}" target="_blank" rel="noopener" aria-label="Facebook">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9.5"></circle><path d="M13.8 9.2h1.7V6.6h-1.9c-1.9 0-2.9 1.1-2.9 2.9v1.5H9v2.6h1.7V18h2.6v-4.4h1.8l.4-2.6h-2.2v-1.1c0-.5.2-.7.7-.7z"></path></svg>
        </a>
      </div>
    </div>
    <div class="footer-copyright">© 2026 Gymnázium a Hudební škola hlavního města Prahy. Všechna práva vyhrazena.</div>
  </footer>"""


CATEGORY_LABELS = {
    "gymnazium": "Gymnázium",
    "hudebni-skola": "Hudební škola",
}


def format_date_cz(iso_date):
    d = datetime.strptime(iso_date, "%Y-%m-%d")
    return f"{d.day}. {d.month}. {d.year}"


def sorted_aktuality():
    return sorted(AKTUALITY, key=lambda p: p["date"], reverse=True)


def aktualita_label(categories):
    return ", ".join(CATEGORY_LABELS.get(c, c) for c in categories)


def aktualita_bg_class(categories):
    # Tmavší odstín patří výhradně příspěvkům pouze pro gymnázium — samotná
    # hudební škola i příspěvky pro obě školy dostávají základní (světlejší)
    # odstín pozadí webu.
    if categories == ["gymnazium"]:
        return "aktualita-gymnazium"
    return "aktualita-hudebni-skola"


FB_ICON_SVG = (
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">'
    '<circle cx="12" cy="12" r="9.5"></circle>'
    '<path d="M13.8 9.2h1.7V6.6h-1.9c-1.9 0-2.9 1.1-2.9 2.9v1.5H9v2.6h1.7V18h2.6v-4.4h1.8l.4-2.6h-2.2v-1.1c0-.5.2-.7.7-.7z"></path></svg>'
)


def aktualita_fb_button_html(post):
    """Tlačítko s odkazem na původní FB příspěvek (volitelné pole fb_url)."""
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


def aktuality_section_html(post):
    label = aktualita_label(post["category"])
    bg_class = aktualita_bg_class(post["category"])
    date_display = format_date_cz(post["date"])
    return f"""  <div id="{post['slug']}" class="aktualita-block {bg_class}">
    <div class="aktualita-inner">
      <div class="aktualita-tag">{label}</div>
      <h2 class="aktualita-title display">{post['title']}</h2>
      <div class="aktualita-date">{date_display}</div>
      {post['body_html']}{aktualita_fb_button_html(post)}
    </div>
  </div>"""


def aktuality_boxes_html(depth=0, count=3):
    prefix = "../" if depth == 1 else ""
    parts = []
    for post in sorted_aktuality()[:count]:
        label = aktualita_label(post["category"])
        date_display = format_date_cz(post["date"])
        parts.append(f"""      <a class="news-card" href="{prefix}o-nas/aktuality.html#{post['slug']}">
        <span class="news-tag">{label}</span>
        <div class="news-title">{post['title']}</div>
        <div class="news-date">{date_display}</div>
        <p class="news-excerpt">{post['excerpt']}</p>
      </a>""")
    return "\n".join(parts)


def page(out_path, depth, active_path, title, eyebrow, h1, lead, body_html, description="", h1_extra="", extra_head=""):
    prefix = "../" if depth == 1 else ""
    lead_html = f'\n    <p class="page-lead">{lead}</p>' if lead else ""
    if h1_extra:
        h1_html = f'''<div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:20px 28px;">
      <h1 class="page-title display" style="margin:10px 0 0;">{h1}</h1>
      {h1_extra}
    </div>'''
    else:
        h1_html = f'<h1 class="page-title display">{h1}</h1>'
    canonical_url = f"https://gmhs.cz/{out_path}"
    html = f"""<!doctype html>
<html lang="cs">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{description}">
<link rel="stylesheet" href="{prefix}style.css">
<script src="{prefix}nav.js" defer></script>
<link rel="icon" href="{prefix}favicon.ico" sizes="any">
<link rel="icon" href="{prefix}favicon-32x32.png" type="image/png" sizes="32x32">
<link rel="icon" href="{prefix}favicon-16x16.png" type="image/png" sizes="16x16">
<link rel="apple-touch-icon" href="{prefix}apple-touch-icon.png">
<link rel="canonical" href="{canonical_url}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Gymnázium a Hudební škola hlavního města Prahy">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{description}">
<meta property="og:image" content="https://gmhs.cz/images/building.jpg">
<meta property="og:url" content="{canonical_url}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{title}">
<meta name="twitter:description" content="{description}">
<meta name="twitter:image" content="https://gmhs.cz/images/building.jpg">
{ORG_JSONLD}{extra_head}
</head>
<body>
<div class="page">

{header_html(depth, active_path)}

  <div class="page-header">
    <div class="eyebrow">{eyebrow}</div>
    {h1_html}{lead_html}
  </div>

{body_html}

{footer_html(depth)}

</div>
</body>
</html>
"""
    full_path = os.path.join(ROOT, out_path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(html)
    print("written", out_path)
