// Archiv sekce „Žijeme hudbou!“ (hudebni-zivot/archiv.html) — katalog záznamů
// z proběhlých akcí. Data: ../data/archiv.json (popis formátu je přímo v souboru).
// Zobrazí se jen akce, ke které je aspoň jeden záznam (odkaz s vyplněným url);
// položky „ukazka: true“ jsou jen ukázka vzhledu a zobrazí se vždy.
// Filtry: školní rok, soubor/orchestr, typ akce. Řazení od nejnovější akce.
(function () {
  'use strict';

  var TYP = { s: 'Slavnostní koncert', o: 'Koncert oddělení', c: 'Soutěž', v: 'Kurz a beseda' };
  var TYP_CHIPS = [['s', 'Slavnostní koncerty'], ['o', 'Koncerty oddělení'], ['c', 'Soutěže'], ['v', 'Kurzy a besedy']];
  var DRUH = { foto: 'Fotografie', video: 'Video', zvuk: 'Zvukový záznam', program: 'Program (PDF)', jine: 'Záznam' };
  var MN3 = ['led', 'úno', 'bře', 'dub', 'kvě', 'čvn', 'čvc', 'srp', 'zář', 'říj', 'lis', 'pro'];
  var state = { items: [], typ: 'all', rok: 'all', soubor: 'all' };

  // stejné určení typu podle názvu jako v programu (hudba.js)
  function typAkce(title) {
    if (/soutěž|ročník|konkurz|festival|přehlídk|koncert vítězů/i.test(title)) return 'c';
    if (/masterclass|beseda|workshop|kurz|seminář/i.test(title)) return 'v';
    if (/oddělení/i.test(title) && !/slavnostní/i.test(title)) return 'o';
    return 's';
  }
  function pd(s) { var a = s.split('-').map(Number); return new Date(a[0], a[1] - 1, a[2]); }
  function esc(s) {
    return String(s || '').replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function skolniRok(d) {
    if (!d) return '';
    var y = Number(d.slice(0, 4)), m = Number(d.slice(5, 7));
    return m >= 9 ? y + '/' + (y + 1) : (y - 1) + '/' + y;
  }
  function $(id) { return document.getElementById(id); }

  function prepare(z) {
    var start = String(z.start || '').slice(0, 10), end = String(z.end || '').slice(0, 10) || start;
    var odkazy = (z.odkazy || []).filter(function (o) { return z.ukazka || (o && o.url); });
    return {
      ukazka: !!z.ukazka, start: start, end: end < start ? start : end,
      title: z.title || '', place: z.location || '', popis: z.popis || '',
      typ: TYP[z.typ] ? z.typ : typAkce(z.title || ''),
      soubory: (z.soubory || []).filter(Boolean), odkazy: odkazy, rok: skolniRok(start)
    };
  }

  function match(z) {
    return (state.typ === 'all' || z.typ === state.typ) &&
      (state.rok === 'all' || z.rok === state.rok) &&
      (state.soubor === 'all' || z.soubory.indexOf(state.soubor) !== -1);
  }

  function fillSelect(sel, values, allLabel) {
    sel.innerHTML = '<option value="all">' + allLabel + '</option>' + values.map(function (v) {
      return '<option value="' + esc(v) + '">' + esc(v) + '</option>';
    }).join('');
  }

  function renderChips() {
    var chips = [['all', 'Vše']].concat(TYP_CHIPS);
    $('ar-typ').innerHTML = chips.map(function (c) {
      var on = state.typ === c[0];
      return '<button type="button" class="hz-chip' + (on ? ' on' : '') + '" aria-pressed="' + on + '" data-f="' + c[0] + '">' + c[1] + '</button>';
    }).join('');
  }

  function dateCol(z) {
    if (!z.start) return '<div class="hz-dnum hz-dnum-ph ph">[DATUM]</div>';
    var a = pd(z.start), b = pd(z.end), multi = z.end !== z.start;
    var day = multi ? a.getDate() + '.–' + b.getDate() + '.' : a.getDate() + '.';
    return '<div class="hz-dnum">' + day + '</div><div class="hz-dsub">' + MN3[a.getMonth()] + ' ' + a.getFullYear() + '</div>';
  }

  function renderList() {
    var list = state.items.filter(match);
    if (!list.length) {
      $('ar-list').innerHTML = '<div class="hz-empty">V tomto výběru zatím nejsou žádné záznamy.</div>';
    } else {
      $('ar-list').innerHTML = list.map(function (z) {
        var ph = z.ukazka ? ' ph' : '';
        var tags = '<span class="hz-tag">' + TYP[z.typ] + '</span>' + z.soubory.map(function (s) {
          return '<span class="hz-tag hz-tag-line' + ph + '">' + esc(s) + '</span>';
        }).join('');
        var links = z.odkazy.map(function (o) {
          var label = esc(o.popisek || DRUH[o.druh] || DRUH.jine);
          return o.url
            ? '<a class="hz-rbtn" href="' + esc(o.url) + '" target="_blank" rel="noopener">' + label + '</a>'
            : '<span class="hz-rbtn hz-rbtn-ph">' + label + '</span>';
        }).join('');
        return '<article class="hz-row hz-arow">' +
          '<div>' + dateCol(z) + '</div>' +
          '<div><div class="hz-rtags">' + tags + '</div>' +
          '<h3 class="hz-rt' + ph + '">' + esc(z.title) + '</h3>' +
          '<div class="hz-rm"><span class="' + ph.trim() + '">' + esc(z.place) + '</span></div>' +
          (z.popis ? '<p class="hz-apopis' + ph + '">' + esc(z.popis) + '</p>' : '') +
          '<div class="hz-alinks">' + links + '</div></div>' +
          '</article>';
      }).join('');
    }
    var real = list.filter(function (z) { return !z.ukazka; }).length;
    $('ar-count').textContent = state.items.some(function (z) { return z.ukazka; })
      ? 'Ukázka vzhledu — skutečné záznamy se doplní do data/archiv.json.'
      : 'Akcí se záznamy ve výběru: ' + real + '.';
  }

  function init(data) {
    state.items = ((data && data.zaznamy) || []).map(prepare)
      .filter(function (z) { return z.ukazka || z.odkazy.length; })
      .sort(function (a, b) { return (b.start || '9999').localeCompare(a.start || '9999'); });
    var roky = [], soubory = [];
    state.items.forEach(function (z) {
      if (z.rok && roky.indexOf(z.rok) === -1) roky.push(z.rok);
      z.soubory.forEach(function (s) { if (soubory.indexOf(s) === -1) soubory.push(s); });
    });
    roky.sort().reverse(); soubory.sort(function (a, b) { return a.localeCompare(b, 'cs'); });
    fillSelect($('ar-rok'), roky, 'Všechny roky');
    fillSelect($('ar-soubor'), soubory, 'Všechny');
    renderChips(); renderList();
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (!$('ar-list')) return;
    $('ar-typ').addEventListener('click', function (e) {
      var b = e.target.closest('.hz-chip'); if (!b) return;
      state.typ = b.getAttribute('data-f'); renderChips(); renderList();
    });
    $('ar-rok').addEventListener('change', function () { state.rok = this.value; renderList(); });
    $('ar-soubor').addEventListener('change', function () { state.soubor = this.value; renderList(); });
    fetch('../data/archiv.json', { cache: 'no-cache' })
      .then(function (r) { if (!r.ok) throw new Error(); return r.json(); })
      .then(init)
      .catch(function () {
        $('ar-list').innerHTML = '<div class="hz-empty">Archiv se nepodařilo načíst.</div>';
      });
  });
})();
