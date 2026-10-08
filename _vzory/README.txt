VZORY NOVÝCH STRÁNEK (generátor je nečte — jen se z nich kopíruje)

Nová stránka = zkopírovat vzor do _obsah/ pod cestu, kde má stránka být,
vyplnit údaje nahoře a obsah, pak spustit „python build.py“.

Sekce se určí podle cesty: _obsah/hudebni-zivot/… = Žijeme hudbou!,
cokoli jiného = Stránky školy. Jinak lze nastavit údajem „sekce: hudba“
nebo „sekce: skola“. Nezapomenout přidat stránku do MENU v build.py
(pokud má být v menu) a do sitemap.xml.

  textova-stranka.html   běžná podstránka (nadpis, úvod, obsah v HTML)
  program.html           stránka s programem akcí (blok {{blok:program}},
                         data z data/akce.json + data/akce-plakat.json)
  katalog.html           katalog záznamů (blok {{blok:archiv}},
                         data z data/archiv.json)
