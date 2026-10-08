// Animovaný přechod mezi sekcemi (Hudební akce ↔ Stránky školy), jen desktop.
// Klik na vlaječku (nebo popisek vedle ní):
//   1) vlaječka se nejdřív přebarví do barvy druhé sekce,
//   2) pak přejede na opačnou stranu a za sebou „přemaže“ horní lištu
//      i menu obsahem druhé sekce (skryté záhlaví .hlavicka-druha),
//   3) nakonec se načte stránka druhé sekce — vypadá stejně jako konec animace.
// Bez JavaScriptu, na mobilu a při vypnutých animacích v systému funguje
// odkaz normálně (okamžité přepnutí).
(function () {
  'use strict';
  var BARVA_MS = 280, POHYB_MS = 720;
  var desktop = window.matchMedia('(min-width: 1025px)');
  var klid = window.matchMedia('(prefers-reduced-motion: reduce)');
  var bezi = false;

  function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

  // stránku druhé sekce načíst předem, ať je přechod plynulý
  var prednacteno = false;
  function prednacti(href) {
    if (prednacteno) return;
    prednacteno = true;
    var l = document.createElement('link');
    l.rel = 'prefetch'; l.href = href;
    document.head.appendChild(l);
  }

  function prechod(href) {
    var hlavicka = document.querySelector('.site-header');
    var druha = hlavicka && hlavicka.querySelector('.hlavicka-druha');
    var vlajka = hlavicka && hlavicka.querySelector(':scope > .lista > .vlajka');
    if (!druha || !vlajka) { location.href = href; return; }
    bezi = true;

    var zleva = vlajka.getBoundingClientRect().left < window.innerWidth / 2;
    druha.style.display = 'block';
    druha.style.clipPath = zleva ? 'inset(0 100% 0 0)' : 'inset(0 0 0 100%)';
    var cilVlajka = druha.querySelector('.vlajka');
    var cs = getComputedStyle(cilVlajka);
    var cilBarva = cs.backgroundColor, cilLogo = getComputedStyle(druha).getPropertyValue('--bg').trim();

    // 1) přebarvení vlaječky
    vlajka.style.transition = 'background-color ' + BARVA_MS + 'ms ease, --vl-logo ' + BARVA_MS + 'ms ease';
    vlajka.style.backgroundColor = cilBarva;
    if (cilLogo) vlajka.style.setProperty('--vl-logo', cilLogo);

    // 2) přejezd a přemazání lišt
    setTimeout(function () {
      var W = hlavicka.clientWidth, w = vlajka.offsetWidth, draha = W - w, t0 = null;
      function krok(cas) {
        if (t0 === null) t0 = cas;
        var p = Math.min(1, (cas - t0) / POHYB_MS), x = ease(p) * draha;
        vlajka.style.transform = 'translateX(' + (zleva ? x : -x) + 'px)';
        if (zleva) druha.style.clipPath = 'inset(0 ' + Math.max(0, W - x - w / 2) + 'px 0 0)';
        else druha.style.clipPath = 'inset(0 0 0 ' + Math.max(0, draha - x + w / 2) + 'px)';
        if (p < 1) requestAnimationFrame(krok);
        else { druha.style.clipPath = 'none'; location.href = href; }
      }
      requestAnimationFrame(krok);
    }, BARVA_MS);
  }

  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[data-prechod]');
    if (!a || bezi) return;
    if (e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
    if (!desktop.matches || klid.matches) return;
    e.preventDefault();
    prechod(a.href);
  });
  ['mouseover', 'focusin'].forEach(function (typ) {
    document.addEventListener(typ, function (e) {
      var a = e.target.closest && e.target.closest('a[data-prechod]');
      if (a) prednacti(a.href);
    });
  });

  // návrat tlačítkem Zpět (stránka z mezipaměti) — vrátit lištu do klidu
  window.addEventListener('pageshow', function (e) {
    if (!e.persisted) return;
    bezi = false;
    var h = document.querySelector('.site-header');
    if (!h) return;
    var v = h.querySelector(':scope > .lista > .vlajka'), d = h.querySelector('.hlavicka-druha');
    if (v) { v.style.transition = ''; v.style.transform = ''; v.style.backgroundColor = ''; v.style.removeProperty('--vl-logo'); }
    if (d) { d.style.display = ''; d.style.clipPath = ''; }
  });
})();
