// Kalendář akcí — sloučí akce ze dvou zdrojů a vykreslí je do oddílů po měsících
// aktuálního školního roku (září–červen) + doplní lištu s odkazy na měsíce:
//  • data/akce.json — ze systému Klasifikace, plní ho GitHub Actions (tools/stahni_kalendar.py)
//  • data/akce-plakat.json — ručně přepsaný plakát akcí školy; tyto akce mají tmavší pozadí
// Když je stejná akce v obou zdrojích (stejný den i čas začátku), zobrazí se jen verze z plakátu.
(function () {
  var MONTHS = [
    { m: 8, id: 'zari', name: 'Září' },
    { m: 9, id: 'rijen', name: 'Říjen' },
    { m: 10, id: 'listopad', name: 'Listopad' },
    { m: 11, id: 'prosinec', name: 'Prosinec' },
    { m: 0, id: 'leden', name: 'Leden' },
    { m: 1, id: 'unor', name: 'Únor' },
    { m: 2, id: 'brezen', name: 'Březen' },
    { m: 3, id: 'duben', name: 'Duben' },
    { m: 4, id: 'kveten', name: 'Květen' },
    { m: 5, id: 'cerven', name: 'Červen' }
  ];
  var WEEKDAYS = ['neděle', 'pondělí', 'úterý', 'středa', 'čtvrtek', 'pátek', 'sobota'];

  function esc(s) {
    return String(s || '').replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function richText(s) {
    return esc(s)
      .replace(/(https?:\/\/[^\s<]+[^\s<.,;:!?)])/g, '<a href="$1" target="_blank" rel="noopener">$1</a>')
      .replace(/\n/g, '<br>');
  }
  // "2026-10-12" nebo "2026-10-12T18:00" -> Date v místním čase (bez převodu časových pásem)
  function parseLocal(s) {
    if (!s) return null;
    var p = s.split(/[-T:]/).map(Number);
    return new Date(p[0], p[1] - 1, p[2], p[3] || 0, p[4] || 0);
  }
  function dayOnly(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
  function hhmm(d) { return d.getHours() + ':' + String(d.getMinutes()).padStart(2, '0'); }
  function dm(d) { return d.getDate() + '. ' + (d.getMonth() + 1) + '.'; }

  function schoolYearStart(now) {
    return now.getMonth() >= 8 ? now.getFullYear() : now.getFullYear() - 1;
  }

  function normalize(ev) {
    var start = parseLocal(ev.start);
    var end = parseLocal(ev.end) || start;
    if (end < start) end = start;
    return {
      title: ev.title, location: ev.location, description: ev.description, url: ev.url,
      allDay: !!ev.allDay, start: start, end: end, plakat: !!ev.plakat,
      firstDay: dayOnly(start), lastDay: dayOnly(ev.allDay ? end : (end > start ? new Date(end - 1) : start))
    };
  }

  function eventHtml(ev, now) {
    var multiDay = ev.lastDay > ev.firstDay;
    var past = (ev.allDay ? new Date(ev.lastDay.getFullYear(), ev.lastDay.getMonth(), ev.lastDay.getDate() + 1) : ev.end) <= now;

    var dateBig = multiDay
      ? ev.firstDay.getDate() + '.–' + ev.lastDay.getDate() + '.'
      : ev.firstDay.getDate() + '.';
    var dateSmall = multiDay
      ? dm(ev.firstDay) + ' – ' + dm(ev.lastDay)
      : WEEKDAYS[ev.firstDay.getDay()];

    var time;
    if (ev.allDay) time = multiDay ? 'Vícedenní akce' : 'Celý den';
    else if (multiDay) time = dm(ev.start) + ' ' + hhmm(ev.start) + ' – ' + dm(ev.end) + ' ' + hhmm(ev.end);
    else time = hhmm(ev.start) + (ev.end > ev.start ? '–' + hhmm(ev.end) : '');

    var meta = '<span class="cal-time">' + esc(time) + '</span>';
    if (ev.location) meta += '<span class="cal-place">' + esc(ev.location) + '</span>';

    var title = ev.url
      ? '<a href="' + esc(ev.url) + '" target="_blank" rel="noopener">' + esc(ev.title) + '</a>'
      : esc(ev.title);

    return '<article class="cal-event' + (ev.plakat ? ' is-plakat' : '') + (past ? ' is-past' : '') + '">' +
      '<div class="cal-date"><span class="cal-day display">' + esc(dateBig) + '</span>' +
      '<span class="cal-weekday">' + esc(dateSmall) + '</span></div>' +
      '<div class="cal-body"><h3 class="cal-title">' + title + '</h3>' +
      '<div class="cal-meta">' + meta + '</div>' +
      (ev.description ? '<p class="cal-desc">' + richText(ev.description) + '</p>' : '') +
      (past ? '<span class="cal-past-label">Proběhlo</span>' : '') +
      '</div></article>';
  }

  function render(events) {
    var nav = document.getElementById('cal-nav');
    var box = document.getElementById('cal-months');
    if (!nav || !box) return;

    var now = new Date();
    var y0 = schoolYearStart(now);
    var list = events.map(normalize).sort(function (a, b) { return a.start - b.start; });

    var navHtml = '', boxHtml = '';
    MONTHS.forEach(function (mo, i) {
      var year = mo.m >= 8 ? y0 : y0 + 1;
      var monthStart = new Date(year, mo.m, 1);
      var monthEnd = new Date(year, mo.m + 1, 0);
      var inMonth = list.filter(function (ev) {
        return ev.firstDay <= monthEnd && ev.lastDay >= monthStart;
      });

      navHtml += '<a href="#' + mo.id + '">' + mo.name + '</a>';
      boxHtml += '<section id="' + mo.id + '" class="cal-month' + (i === 0 ? ' first' : '') + '">' +
        '<h2 class="cal-month-title display">' + mo.name + ' ' + year + '</h2>' +
        (inMonth.length
          ? '<div class="cal-list">' + inMonth.map(function (ev) { return eventHtml(ev, now); }).join('') + '</div>'
          : '<p class="cal-empty">V tomto měsíci nejsou naplánované žádné akce.</p>') +
        '</section>';
    });

    nav.innerHTML = navHtml;
    box.innerHTML = boxHtml;

    if (typeof updateScrollPadding === 'function') updateScrollPadding();
    if (location.hash) {
      var target = document.getElementById(location.hash.slice(1));
      if (target) target.scrollIntoView();
    }
  }

  function showError() {
    var box = document.getElementById('cal-months');
    if (box) box.innerHTML = '<p class="cal-empty">Kalendář akcí se nepodařilo načíst. Zkuste prosím stránku obnovit.</p>';
  }

  function load(url) {
    return fetch(url, { cache: 'no-cache' })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (data) { return data.events || []; })
      .catch(function () { return null; });   // výpadek jednoho zdroje nezablokuje ten druhý
  }

  document.addEventListener('DOMContentLoaded', function () {
    Promise.all([load('data/akce.json'), load('data/akce-plakat.json')]).then(function (res) {
      var feed = res[0], plakat = res[1];
      if (feed === null && plakat === null) { showError(); return; }
      plakat = (plakat || []).map(function (ev) { var c = {}; for (var k in ev) c[k] = ev[k]; c.plakat = true; return c; });
      var plakatStarts = {};
      plakat.forEach(function (ev) { if (!ev.allDay) plakatStarts[ev.start] = true; });
      feed = (feed || []).filter(function (ev) { return ev.allDay || !plakatStarts[ev.start]; });
      render(feed.concat(plakat));
    });
  });
})();
