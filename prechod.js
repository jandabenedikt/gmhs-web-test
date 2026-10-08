// Animovaný přechod mezi sekcemi (Hudební akce ↔ Stránky školy), jen desktop.
// Najetí myší na vlaječku: z vlaječky dolů vybíhá stín (pruh šířky vlaječky
// v jejím tónu). Klik (i na popisek vedle): vlaječka se stínem se nejdřív
// přebarví do tónu druhé sekce a pak spolu přejedou na opačnou stranu.
//  • Prohlížeče s přechody mezi stránkami (Chrome, Edge, nové Safari):
//    za vlaječkou se jako opona odkrývá celá úvodní stránka druhé sekce
//    (lišty i obsah), hrana opony má stín v nové barvě vlaječky. Animaci
//    kreslí prohlížeč podle style.css (::view-transition…); nová stránka se
//    zapojí skriptem v <head> (šablona stranka.html).
//  • Ostatní prohlížeče: přemaže se jen horní lišta a menu (skryté záhlaví
//    .hlavicka-druha) a pak se načte stránka druhé sekce.
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

  var umiStranky = 'CSSViewTransitionRule' in window;

  // 1. fáze: vlaječka i stín pod ní se přebarví do tónu druhé sekce
  function prebarvi(vlajka) {
    var hd = document.querySelector('.site-header .hlavicka-druha');
    var druha = hd && hd.querySelector('.vlajka');
    if (!druha) return;
    var d0 = hd.style.display, v0 = hd.style.visibility;
    hd.style.display = 'block'; hd.style.visibility = 'hidden';
    var barva = getComputedStyle(druha).backgroundColor, logo = getComputedStyle(hd).getPropertyValue('--bg').trim();
    hd.style.display = d0; hd.style.visibility = v0;
    var t = BARVA_MS + 'ms ease';
    vlajka.style.transition = 'background-color ' + t + ', --vl-logo ' + t;
    vlajka.style.backgroundColor = barva;
    if (logo) vlajka.style.setProperty('--vl-logo', logo);
    var stin = document.querySelector('.site-header > .vlajka-stin > span');
    if (stin) {
      stin.style.transition = 'background-color ' + t;
      stin.style.backgroundColor = 'color-mix(in srgb, ' + barva + ' 50%, transparent)';
    }
  }

  // přechod s oponou přes celou stránku (animaci dokončí prohlížeč)
  function prechodStranky(href, vlajka) {
    var zleva = vlajka.getBoundingClientRect().left < window.innerWidth / 2;
    var h = document.documentElement;
    prebarvi(vlajka);
    setTimeout(function () {
      try { sessionStorage.setItem('gmhs-prechod', zleva ? 'vpravo' : 'vlevo'); } catch (e) { location.href = href; return; }
      var st = document.createElement('style');
      st.id = 'prechod-ven';
      st.textContent = '@view-transition{navigation:auto}';
      document.head.appendChild(st);
      h.classList.add('prechod-ven');
      location.href = href;
    }, BARVA_MS);
  }

  function prechod(href) {
    var hlavicka = document.querySelector('.site-header');
    var druha = hlavicka && hlavicka.querySelector('.hlavicka-druha');
    var vlajka = hlavicka && hlavicka.querySelector(':scope > .lista > .vlajka');
    if (!druha || !vlajka) { location.href = href; return; }
    bezi = true;
    var stin = hlavicka.querySelector(':scope > .vlajka-stin');
    if (stin) { stin.style.height = (window.innerHeight + window.scrollY) + 'px'; stin.classList.add('bezi'); }
    if (umiStranky) { prechodStranky(href, vlajka); return; }

    var zleva = vlajka.getBoundingClientRect().left < window.innerWidth / 2;
    druha.style.display = 'block';
    druha.style.clipPath = zleva ? 'inset(0 100% 0 0)' : 'inset(0 0 0 100%)';

    // 1) přebarvení vlaječky a stínu
    prebarvi(vlajka);

    // 2) přejezd a přemazání lišt
    setTimeout(function () {
      var W = hlavicka.clientWidth, w = vlajka.offsetWidth, draha = W - w, t0 = null;
      function krok(cas) {
        if (t0 === null) t0 = cas;
        var p = Math.min(1, (cas - t0) / POHYB_MS), x = ease(p) * draha;
        vlajka.style.transform = 'translateX(' + (zleva ? x : -x) + 'px)';
        if (stin) stin.style.transform = vlajka.style.transform;
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
      if (a) {
        prednacti(a.href);
        var st = document.querySelector('.site-header > .vlajka-stin');
        if (st) st.style.height = (window.innerHeight + window.scrollY) + 'px';
      }
    });
  });

  // návrat tlačítkem Zpět (stránka z mezipaměti) — vrátit lištu do klidu
  window.addEventListener('pageshow', function (e) {
    if (!e.persisted) return;
    bezi = false;
    var st = document.getElementById('prechod-ven');
    if (st) st.remove();
    document.documentElement.classList.remove('prechod-ven');
    var h = document.querySelector('.site-header');
    if (!h) return;
    var v = h.querySelector(':scope > .lista > .vlajka'), d = h.querySelector('.hlavicka-druha');
    if (v) { v.style.transition = ''; v.style.transform = ''; v.style.backgroundColor = ''; v.style.removeProperty('--vl-logo'); }
    if (d) { d.style.display = ''; d.style.clipPath = ''; }
    var s2 = h.querySelector(':scope > .vlajka-stin');
    if (s2) { s2.classList.remove('bezi'); s2.style.transform = ''; s2.style.height = ''; }
    var s3 = h.querySelector(':scope > .vlajka-stin > span');
    if (s3) { s3.style.transition = ''; s3.style.backgroundColor = ''; }
  });
})();
