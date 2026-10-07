// Úvodní stránka sekce „Žijeme hudbou!“ (hudebni-zivot/index.html)
//  • karusel nejbližších akcí v hero
//  • aktuální program s filtrem podle typu + měsíční kalendář (klik na den = program dne)
//  • odpočet do nejbližší pořádané soutěže, počty akcí na jednotlivých místech
//
// Data: stejné zdroje jako stránka Kalendář akcí (kalendar.js) —
//   ../data/akce.json (Klasifikace, plní GitHub Actions) + ../data/akce-plakat.json (plakát).
// Když se data nepodaří načíst (např. stránka otevřená přímo ze souboru v počítači)
// nebo je akce.json prázdný, použije se SNAPSHOT níže (stav k 7. 10. 2026).
// Typ akce pro filtr zdroje neuvádějí — určuje se podle názvu (typAkce).
(function () {
  'use strict';

  var K = 'Koncertní sál GMHS', M = 'Komorní sál GMHS', W = 'Kostel CČSH, Wuchterlova 5, Praha 6';
  // [začátek, konec (vícedenní), čas, název, místo]
  var SNAPSHOT = [
    ['2026-09-29', '', '18:00', 'Koncert pěveckého oddělení', K],
    ['2026-10-06', '', '18:00', 'Koncert pěveckého oddělení', M],
    ['2026-10-12', '', '18:00', 'Koncert smyčcového oddělení', K],
    ['2026-10-13', '', '18:00', 'Koncert dechového oddělení', M],
    ['2026-10-13', '', '18:00', 'Koncert pěveckého oddělení', K],
    ['2026-10-14', '', '17:30', 'Koncert', K],
    ['2026-10-14', '', '18:00', 'Koncert klavírního oddělení HŠ', M],
    ['2026-10-15', '', '18:00', 'Koncert klavírního oddělení', K],
    ['2026-10-16', '2026-10-18', '', 'XXIV. ročník Písňové soutěže Bohuslava Martinů', K],
    ['2026-10-19', '', '18:00', 'Koncert pro prof. M. Hájkovou', K],
    ['2026-10-20', '', '18:00', 'Koncert dechového oddělení', K],
    ['2026-10-20', '', '18:00', 'Koncert pěveckého oddělení', M],
    ['2026-10-21', '', '17:30', 'Koncert', K],
    ['2026-10-22', '', '18:00', 'Koncert klavírního oddělení', K],
    ['2026-10-26', '', '18:00', 'Koncert smyčcového oddělení', K],
    ['2026-10-27', '', '18:00', 'Koncert dechového oddělení', M],
    ['2026-10-27', '', '18:00', 'Koncert pěveckého oddělení', K],
    ['2026-11-02', '', '18:00', 'Koncert smyčcového oddělení', K],
    ['2026-11-03', '', '18:00', 'Koncert dechového oddělení', K],
    ['2026-11-03', '', '18:00', 'Koncert pěveckého oddělení', M],
    ['2026-11-04', '', '17:30', 'Koncert', K],
    ['2026-11-04', '', '18:00', 'Koncert klavírního oddělení HŠ', M],
    ['2026-11-05', '', '18:00', 'Slavnostní koncert ke 100. výročí narození pedagožky Zdeny Janžurové', K],
    ['2026-11-07', '', '11:00', 'Koncert vítězů – Mladí pianisté hrají na klavír Steinway & Sons', K],
    ['2026-11-07', '', '14:00', 'Masterclass Ivan Klánský', K],
    ['2026-11-09', '', '18:00', 'Koncert smyčcového oddělení', K],
    ['2026-11-10', '', '18:00', 'Koncert dechového oddělení', M],
    ['2026-11-10', '', '18:00', 'Koncert pěveckého oddělení', K],
    ['2026-11-11', '', '18:00', 'Beseda s H. Blažíkovou, T. Jamníkem, D. Weiss Hoškovou', K],
    ['2026-11-12', '', '9:30', 'Workshopy zpěv, violoncello – H. Blažíková, T. Jamník', 'Koncertní a Komorní sál GMHS'],
    ['2026-11-12', '', '18:00', 'Koncert klavírního oddělení', K],
    ['2026-11-13', '', '19:00', '30 let spolu – koncert k výročí GMHS na Komenského náměstí', 'Kostel sv. Šimona a Judy'],
    ['2026-11-13', '2026-11-17', '', 'XX. ročník Mezinárodní violoncellové soutěže Jana Vychytila', K],
    ['2026-11-18', '', '17:30', 'Koncert', K],
    ['2026-11-19', '', '18:00', 'Koncert klavírního oddělení', K],
    ['2026-11-23', '', '18:00', 'Koncert smyčcového oddělení', K],
    ['2026-11-23', '', '19:00', 'Koncert vítězů Písňové soutěže B. Martinů', 'Sál Martinů'],
    ['2026-11-24', '', '19:00', 'Koncert – Symfonický orchestr GMHS a Konzervatoř J. Fuxe Graz', W],
    ['2026-11-25', '', '17:30', 'Koncert', K],
    ['2026-11-26', '', '18:00', 'Koncert klavírního oddělení', K],
    ['2026-11-30', '', '18:00', 'Koncert smyčcového oddělení', K],
    ['2026-12-01', '', '18:00', 'Koncert dechového oddělení', K],
    ['2026-12-01', '', '18:00', 'Koncert pěveckého oddělení', M],
    ['2026-12-02', '', '17:30', 'Koncert', K],
    ['2026-12-02', '', '18:00', 'Koncert klavírního oddělení HŠ', M],
    ['2026-12-03', '', '18:00', 'Koncert klavírního oddělení', K],
    ['2026-12-07', '', '18:00', 'Koncert smyčcového oddělení', K],
    ['2026-12-08', '', '18:00', 'Koncert dechového oddělení', K],
    ['2026-12-09', '', '19:00', 'Koncert Praha – Linec – Bolzano', W],
    ['2026-12-10', '', '18:00', 'Koncert klavírního oddělení', K],
    ['2026-12-10', '', '19:00', 'Koncert – Symfonický orchestr GMHS', 'Sušice'],
    ['2026-12-14', '', '18:00', 'Koncert smyčcového oddělení', K],
    ['2026-12-15', '', '18:00', 'Koncert dechového oddělení', M],
    ['2026-12-15', '', '18:00', 'Koncert pěveckého oddělení', K],
    ['2026-12-16', '', '19:00', 'Vánoční koncert GMHS', W],
    ['2026-12-17', '', '17:00', 'Koncert klavírního oddělení', K],
    ['2027-01-13', '', '18:00', 'Koncert klavírního oddělení HŠ', M],
    ['2027-02-10', '', '18:00', 'Koncert klavírního oddělení HŠ', M],
    ['2027-02-16', '', '9:00', 'Konkurz o FOKUS', K],
    ['2027-02-17', '', '19:00', 'Slavnostní koncert klavírního oddělení', 'Pálffyho palác'],
    ['2027-03-10', '', '18:00', 'Koncert klavírního oddělení HŠ', M],
    ['2027-03-12', '2027-03-14', '', 'XV. ročník Mezinárodní houslové soutěže PhDr. Josefa Micky', K],
    ['2027-03-14', '', '17:00', 'Koncert Mladé talenty Josefu Sukovi', 'zámek Průhonice'],
    ['2027-03-19', '2027-03-21', '', 'XVIII. ročník PRAGuitarra Clásica', K],
    ['2027-03-23', '', '19:00', 'Slavnostní koncert pěveckého oddělení', 'Modlitebna ČCE, Korunní ulice'],
    ['2027-04-02', '2027-04-04', '', 'Soutěž ZUŠ MŠMT Smyčce – krajské kolo', 'Koncertní a Komorní sál GMHS'],
    ['2027-04-14', '', '18:00', 'Koncert klavírního oddělení HŠ', M],
    ['2027-04-14', '', '19:00', 'Slavnostní koncert dechového oddělení', 'Refektář opatství v Emauzích'],
    ['2027-04-24', '2027-04-27', '', 'Koncerty – Symfonický orchestr GMHS', 'Graz'],
    ['2027-04-29', '', '19:30', 'FOKUS – Koncert sólistů GMHS se Symfonickým orchestrem hl. m. Prahy FOK', 'Obecní dům, Smetanova síň'],
    ['2027-05-10', '', '9:00', 'Maturitní koncert', K],
    ['2027-05-12', '', '18:00', 'Koncert klavírního oddělení HŠ', M],
    ['2027-05-14', '2027-05-16', '', 'XV. ročník klavírní soutěže Mladí pianisté hrají na klavír Steinway & Sons', K],
    ['2027-05-26', '', '19:00', 'Slavnostní koncert smyčcového oddělení', 'Libeňský zámeček'],
    ['2027-06-04', '2027-06-06', '', 'XIII. ročník přehlídky harfové mládeže PRAH-A-HARP FESTIVAL', K],
    ['2027-06-09', '', '18:00', 'Koncert klavírního oddělení HŠ', M],
    ['2027-06-16', '', '19:00', 'Slavnostní koncert GMHS', 'Betlémská kaple']
  ];

  // Vybrané akce do hero (4 z plakátu). Fotky zatím ze složky images/ — až budou
  // kvalitní koncertní snímky (spíš tmavší), stačí vyměnit cestu v „img“.
  var SLIDES = [
    { start: '2026-10-16', end: '2026-10-18', title: 'XXIV. ročník Písňové soutěže Bohuslava Martinů', when: 'pátek 16. – neděle 18. října 2026', where: 'Koncertní sál GMHS', img: '../images/orchestr-komorni.jpg', alt: 'Komorní orchestr Hudební školy GMHS' },
    { start: '2026-11-13', end: '', title: '30 let spolu – koncert k výročí GMHS na Komenského náměstí', when: 'pátek 13. listopadu 2026, 19:00', where: 'Kostel sv. Šimona a Judy', img: '../images/orchestr-zestovy.jpg', alt: 'Žesťový soubor GMHS' },
    { start: '2026-12-16', end: '', title: 'Vánoční koncert GMHS', when: 'středa 16. prosince 2026, 19:00', where: 'Kostel CČSH, Wuchterlova 5, Praha 6', img: '../images/orchestr-luxiuvenes.jpg', alt: 'Smyčcový soubor GMHS' },
    { start: '2027-04-29', end: '', title: 'FOKUS – sólisté GMHS se Symfonickým orchestrem hl. m. Prahy FOK', when: 'čtvrtek 29. dubna 2027, 19:30', where: 'Obecní dům, Smetanova síň', img: '../images/orchestr-symfonicky.jpg', alt: 'Symfonický orchestr GMHS' }
  ];

  var TYP = { o: 'Koncert oddělení', s: 'Slavnostní koncert', c: 'Soutěž', v: 'Kurz a beseda' };
  var CHIPS = [['all', 'Vše'], ['s', 'Slavnostní koncerty'], ['o', 'Koncerty oddělení'], ['c', 'Soutěže'], ['v', 'Kurzy a besedy'], ['mimo', 'Mimo školu']];
  var WD = ['ne', 'po', 'út', 'st', 'čt', 'pá', 'so'];
  var MN = ['leden', 'únor', 'březen', 'duben', 'květen', 'červen', 'červenec', 'srpen', 'září', 'říjen', 'listopad', 'prosinec'];
  var MN_GEN = ['ledna', 'února', 'března', 'dubna', 'května', 'června', 'července', 'srpna', 'září', 'října', 'listopadu', 'prosince'];
  // Kotvy měsíců na stránce Kalendář akcí (stejné jako v kalendar.js)
  var MONTH_ID = ['leden', 'unor', 'brezen', 'duben', 'kveten', 'cerven', '', '', 'zari', 'rijen', 'listopad', 'prosinec'];

  // Do hudebního programu nepatří akce školy jako instituce (patří do sekce školy).
  var NOT_MUSIC = /den otevřených dveří|ples|zápis|přijímací|třídní schůzk|prázdnin|ředitelské volno/i;

  function typAkce(title) {
    if (/soutěž|ročník|konkurz|festival|přehlídk|koncert vítězů/i.test(title)) return 'c';
    if (/masterclass|beseda|workshop|kurz|seminář/i.test(title)) return 'v';
    if (/oddělení/i.test(title) && !/slavnostní/i.test(title)) return 'o';
    if (/^koncert$/i.test(title.trim())) return 'o';
    return 's';
  }
  function inSchool(place) { return /GMHS/.test(place || ''); }
  function pad(n) { return String(n).padStart(2, '0'); }
  function iso(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function pd(s) { var a = s.split('-').map(Number); return new Date(a[0], a[1] - 1, a[2]); }
  function esc(s) {
    return String(s || '').replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function fromSnapshot() {
    return SNAPSHOT.map(function (e) {
      return { start: e[0], end: e[1] || e[0], time: e[2], title: e[3], place: e[4], typ: typAkce(e[3]) };
    });
  }
  // Převod záznamu z data/*.json (stejný formát jako pro kalendar.js)
  function fromJson(ev) {
    var s = String(ev.start || ''), en = String(ev.end || '');
    var day = s.slice(0, 10);
    var endDay = en ? en.slice(0, 10) : day;
    if (endDay < day) endDay = day;
    var time = (!ev.allDay && s.length > 10) ? String(Number(s.slice(11, 13))) + ':' + s.slice(14, 16) : '';
    return { start: day, end: endDay, time: time, title: ev.title || '', place: ev.location || '', typ: typAkce(ev.title || '') };
  }

  var TODAY = iso(new Date());
  var state = { events: [], filter: 'all', sel: null, cy: 0, cm: 0, slide: 0 };

  function match(e) {
    if (state.filter === 'all') return true;
    if (state.filter === 'mimo') return !inSchool(e.place);
    return e.typ === state.filter;
  }

  // ---------------------------------------------------------------- program
  function renderChips() {
    var box = document.getElementById('hz-chips');
    box.innerHTML = CHIPS.map(function (c) {
      var on = state.filter === c[0];
      return '<button type="button" class="hz-chip' + (on ? ' on' : '') + '" aria-pressed="' + on + '" data-f="' + c[0] + '">' + c[1] + '</button>';
    }).join('');
  }

  function detailHref(e) {
    var m = pd(e.start).getMonth();
    return '../kalendar-akci.html' + (MONTH_ID[m] ? '#' + MONTH_ID[m] : '');
  }

  function renderRows() {
    var upcoming = state.events.filter(function (e) { return e.end >= TODAY && match(e); });
    var list = state.sel
      ? state.events.filter(function (e) { return e.start <= state.sel && e.end >= state.sel && match(e); })
      : upcoming.slice(0, 6);
    var rows = document.getElementById('hz-rows');
    if (!list.length) {
      rows.innerHTML = '<div class="hz-empty">V tomto výběru nejsou naplánované žádné akce.</div>';
    } else {
      rows.innerHTML = list.map(function (e) {
        var a = pd(e.start), b = pd(e.end), multi = e.end !== e.start;
        var day = multi ? a.getDate() + '.–' + b.getDate() + '.' : a.getDate() + '.';
        var sub = (multi ? WD[a.getDay()] + '–' + WD[b.getDay()] : WD[a.getDay()]) + ' · ' + MN[a.getMonth()].slice(0, 3);
        return '<article class="hz-row">' +
          '<div><div class="hz-dnum">' + day + '</div><div class="hz-dsub">' + sub + '</div></div>' +
          '<div><div class="hz-rtags"><span class="hz-tag">' + TYP[e.typ] + '</span>' +
          (inSchool(e.place) ? '' : '<span class="hz-tag hz-tag-line">Mimo školu</span>') + '</div>' +
          '<h3 class="hz-rt">' + esc(e.title) + '</h3>' +
          '<div class="hz-rm"><b>' + (e.time || 'Celý den') + '</b><span>' + esc(e.place) + '</span></div></div>' +
          '<a class="hz-rbtn" href="' + detailHref(e) + '" aria-label="Podrobnosti: ' + esc(e.title) + '">Podrobnosti</a>' +
          '</article>';
      }).join('');
    }
    var dayBox = document.getElementById('hz-day');
    if (state.sel) {
      var d = pd(state.sel);
      document.getElementById('hz-day-label').textContent = WD[d.getDay()] + ' ' + d.getDate() + '. ' + (d.getMonth() + 1) + '. ' + d.getFullYear();
      dayBox.hidden = false;
    } else {
      dayBox.hidden = true;
    }
    document.getElementById('hz-count').textContent = state.sel ? '' :
      'Zobrazeno ' + Math.min(6, upcoming.length) + ' z ' + upcoming.length + ' nadcházejících akcí. Data z kalendáře školy (Klasifikace) a z plakátu akcí.';
  }

  // --------------------------------------------------------------- kalendář
  function seasonBounds() {
    var now = new Date();
    var y = now.getMonth() >= 8 ? now.getFullYear() : now.getFullYear() - 1;
    return { min: y * 12 + 8, max: (y + 1) * 12 + 5, y: y };
  }
  function renderCal() {
    var g = document.getElementById('hz-cal');
    // smazat buňky dnů, nechat záhlaví (po–ne)
    Array.prototype.slice.call(g.querySelectorAll('.hz-cd')).forEach(function (n) { n.remove(); });
    var cy = state.cy, cm = state.cm;
    var off = (new Date(cy, cm, 1).getDay() + 6) % 7;
    var dim = new Date(cy, cm + 1, 0).getDate();
    var html = '';
    for (var i = 0; i < off; i++) html += '<span class="hz-cd" aria-hidden="true"></span>';
    for (var d = 1; d <= dim; d++) {
      var s = cy + '-' + pad(cm + 1) + '-' + pad(d);
      var has = state.events.some(function (e) { return e.start <= s && e.end >= s && match(e); });
      var cls = 'hz-cd' + (has ? ' has' : '') + (s < TODAY ? ' past' : '') + (s === TODAY ? ' today' : '') + (state.sel === s ? ' sel' : '');
      html += '<button type="button" class="' + cls + '" data-d="' + s + '"' + (has ? '' : ' disabled') +
        ' aria-label="' + d + '. ' + MN_GEN[cm] + (has ? ', akce v programu' : '') + '"' +
        (state.sel === s ? ' aria-pressed="true"' : '') + '>' + d + '</button>';
    }
    g.insertAdjacentHTML('beforeend', html);
    var name = MN[cm];
    document.getElementById('hz-month').textContent = name[0].toUpperCase() + name.slice(1) + ' ' + cy;
    var b = seasonBounds(), idx = cy * 12 + cm;
    document.getElementById('hz-mprev').disabled = idx <= b.min;
    document.getElementById('hz-mnext').disabled = idx >= b.max;
  }

  // ------------------------------------------------------------------- hero
  function heroSlides() {
    var up = SLIDES.filter(function (s) { return (s.end || s.start) >= TODAY; });
    return up.length ? up : SLIDES;
  }
  function renderHero() {
    var slides = heroSlides();
    var s = slides[state.slide % slides.length];
    var img = document.getElementById('hz-img');
    if (img.getAttribute('src') !== s.img) { img.src = s.img; }
    img.alt = s.alt;
    document.getElementById('hz-title').textContent = s.title;
    document.getElementById('hz-when').textContent = s.when;
    document.getElementById('hz-where').textContent = s.where;
    var link = document.getElementById('hz-link');
    link.href = detailHref({ start: s.start });
    link.setAttribute('aria-label', 'Podrobnosti o akci: ' + s.title);
    document.getElementById('hz-dots').innerHTML = slides.map(function (x, i) {
      var on = i === state.slide % slides.length;
      return '<button type="button" class="hz-dot' + (on ? ' on' : '') + '" data-i="' + i + '" aria-label="Akce ' + (i + 1) + ': ' + esc(x.title) + '"' + (on ? ' aria-current="true"' : '') + '><i></i></button>';
    }).join('');
    var single = slides.length < 2;
    document.getElementById('hz-prev').hidden = single;
    document.getElementById('hz-next').hidden = single;
  }

  // ------------------------------------------------- soutěže + místa konání
  function renderExtras() {
    var soonDone = false;
    Array.prototype.slice.call(document.querySelectorAll('.hz-comp')).forEach(function (a) {
      var tag = a.querySelector('.hz-soon');
      var n = Math.round((pd(a.getAttribute('data-start')) - pd(TODAY)) / 86400000);
      if (!soonDone && n >= 0) {
        tag.textContent = n === 0 ? 'Dnes' : n === 1 ? 'Zítra' : (n <= 4 ? 'Za ' + n + ' dny' : 'Za ' + n + ' dní');
        tag.hidden = false;
        soonDone = true;
      } else {
        tag.hidden = true;
      }
    });
    var b = seasonBounds();
    var from = b.y + '-09-01', to = (b.y + 1) + '-08-31';
    var season = state.events.filter(function (e) { return e.start >= from && e.start <= to; });
    var label = 'v programu ' + b.y + '/' + String(b.y + 1).slice(2);
    Array.prototype.slice.call(document.querySelectorAll('[data-venue]')).forEach(function (el) {
      var key = el.getAttribute('data-venue');
      var n = season.filter(function (e) { return (e.place || '').indexOf(key) !== -1; }).length;
      el.textContent = n === 0 ? 'Letos zatím bez akce v programu' :
        (n === 1 ? '1 akce ' : n + (n >= 2 && n <= 4 ? ' akce ' : ' akcí ')) + label;
    });
    document.getElementById('hz-season').textContent = 'Školní rok ' + b.y + '/' + (b.y + 1);
  }

  function renderAll() { renderChips(); renderRows(); renderCal(); renderExtras(); }

  // ------------------------------------------------------------------ start
  function init(events) {
    state.events = events.filter(function (e) { return e.title && !NOT_MUSIC.test(e.title); })
      .sort(function (a, b) { return (a.start + (a.time.length < 5 ? '0' : '') + a.time).localeCompare(b.start + (b.time.length < 5 ? '0' : '') + b.time); });
    var now = new Date(), b = seasonBounds(), idx = now.getFullYear() * 12 + now.getMonth();
    if (idx < b.min || idx > b.max) idx = b.min;
    state.cy = Math.floor(idx / 12); state.cm = idx % 12;
    renderAll();
  }

  function load() {
    function get(url) {
      return fetch(url, { cache: 'no-cache' }).then(function (r) {
        if (!r.ok) throw new Error(url);
        return r.json();
      });
    }
    Promise.all([get('../data/akce.json'), get('../data/akce-plakat.json')]).then(function (res) {
      var klas = (res[0] && res[0].events) || [];
      var plak = (res[1] && res[1].events) || [];
      if (!klas.length) throw new Error('akce.json je prázdný');
      // Stejná akce v obou zdrojích (stejný začátek) → jen verze z plakátu
      var keys = {};
      plak.forEach(function (e) { keys[e.start] = true; });
      var all = plak.concat(klas.filter(function (e) { return !keys[e.start]; }));
      init(all.map(fromJson));
    }).catch(function () {
      init(fromSnapshot());
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    renderHero();

    document.getElementById('hz-prev').addEventListener('click', function () {
      var n = heroSlides().length; state.slide = (state.slide + n - 1) % n; renderHero();
    });
    document.getElementById('hz-next').addEventListener('click', function () {
      state.slide = (state.slide + 1) % heroSlides().length; renderHero();
    });
    document.getElementById('hz-dots').addEventListener('click', function (e) {
      var b = e.target.closest('.hz-dot'); if (!b) return;
      state.slide = Number(b.getAttribute('data-i')); renderHero();
    });
    document.getElementById('hz-chips').addEventListener('click', function (e) {
      var b = e.target.closest('.hz-chip'); if (!b) return;
      state.filter = b.getAttribute('data-f'); state.sel = null; renderAll();
    });
    document.getElementById('hz-day-clear').addEventListener('click', function () {
      state.sel = null; renderRows(); renderCal();
    });
    document.getElementById('hz-cal').addEventListener('click', function (e) {
      var b = e.target.closest('.hz-cd[data-d]'); if (!b || b.disabled) return;
      var d = b.getAttribute('data-d');
      state.sel = state.sel === d ? null : d; renderRows(); renderCal();
    });
    function shiftMonth(n) {
      var bnd = seasonBounds();
      var k = Math.min(bnd.max, Math.max(bnd.min, state.cy * 12 + state.cm + n));
      state.cy = Math.floor(k / 12); state.cm = k % 12; renderCal();
    }
    document.getElementById('hz-mprev').addEventListener('click', function () { shiftMonth(-1); });
    document.getElementById('hz-mnext').addEventListener('click', function () { shiftMonth(1); });

    load();
  });
})();
