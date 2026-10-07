// Rozbalovací menu v hlavičce — funguje na najetí myší i na klik, ale
// nezavírá se předčasně: jakmile je seznam otevřený, zůstává otevřený,
// dokud návštěvník nenajede na jinou hlavní položku, neklikne mimo menu,
// nebo nestiskne Escape. Neexistuje žádný "mezerový" okamžik, kdy by se
// seznam zavřel jen proto, že myš na cestě k položce chvíli opustí menu.
document.addEventListener('DOMContentLoaded', function () {
  var items = Array.prototype.slice.call(document.querySelectorAll('.nav-item'));

  function closeAll(except) {
    items.forEach(function (item) {
      if (item === except) return;
      item.classList.remove('open');
      var btn = item.querySelector('button.nav-link');
      if (btn) btn.setAttribute('aria-expanded', 'false');
    });
  }

  function openItem(item) {
    closeAll(item);
    item.classList.add('open');
    var btn = item.querySelector('button.nav-link');
    if (btn) btn.setAttribute('aria-expanded', 'true');
  }

  items.forEach(function (item) {
    var btn = item.querySelector('button.nav-link');
    if (!btn) return;

    // Najetí myší otevře menu (a přepne z jiné otevřené položky) — jen na
    // desktopu. Na mobilu/tabletu (≤1024px, rozbalovací hamburger menu) by
    // "hover" simulovaný prvním tapem jinak srazil s kliknutím a submenu by
    // se po jednom ťuknutí hned samo zavřelo.
    item.addEventListener('mouseenter', function () {
      if (window.innerWidth > 1024) openItem(item);
    });

    // Klik menu otevře, nebo ho zavře, pokud je zrovna tahle položka otevřená.
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      if (item.classList.contains('open')) {
        closeAll(null);
      } else {
        openItem(item);
      }
    });
  });

  // ---------- Mobilní hamburger menu (≤1024px, viz style.css) ----------
  // Tlačítko se do hlavičky vkládá přes JS, takže není potřeba upravovat
  // každou jednotlivou HTML stránku — .site-header a .main-nav mají všechny
  // stránky společné.
  // Ve verzi se dvěma sekcemi je menu v pruhu .snav pod lištou sekcí —
  // tlačítko menu patří tam (starší hlavička: přímo do .site-header).
  var header = document.querySelector('.snav') || document.querySelector('.site-header');
  var mainNav = document.querySelector('.main-nav');
  var mobileToggle = null;

  function closeMobileNav() {
    if (!mainNav || !mobileToggle) return;
    mainNav.classList.remove('mobile-open');
    mobileToggle.classList.remove('open');
    mobileToggle.setAttribute('aria-expanded', 'false');
  }

  if (header && mainNav) {
    mobileToggle = document.createElement('button');
    mobileToggle.type = 'button';
    mobileToggle.className = 'nav-toggle';
    mobileToggle.setAttribute('aria-label', 'Otevřít menu');
    mobileToggle.setAttribute('aria-expanded', 'false');
    mobileToggle.innerHTML = '<span class="bars"><span></span><span></span><span></span></span><span class="lbl">Menu</span>';

    if (header.classList.contains('snav')) {
      header.insertBefore(mobileToggle, header.firstChild);
    } else {
      // Starší hlavička: tlačítko Bakaláři zůstává mimo rozbalovací menu.
      var bakalariBtn = header.querySelector('.btn-bakalari');
      header.insertBefore(mobileToggle, bakalariBtn || null);
    }

    mobileToggle.addEventListener('click', function (e) {
      e.stopPropagation();
      var willOpen = !mainNav.classList.contains('mobile-open');
      if (willOpen) {
        mainNav.classList.add('mobile-open');
        mobileToggle.classList.add('open');
        mobileToggle.setAttribute('aria-expanded', 'true');
      } else {
        closeMobileNav();
      }
    });

    // Klik dovnitř otevřeného menu ho nesmí hned zase zavřít přes
    // globální "klikni mimo" posluchač níže.
    mainNav.addEventListener('click', function (e) { e.stopPropagation(); });

    // Nad hranicí mobilního zobrazení menu vždy zavřít (pro jistotu při
    // otočení tabletu nebo zvětšení okna prohlížeče).
    window.addEventListener('resize', function () {
      if (window.innerWidth > 1024) closeMobileNav();
    });
  }

  // Kliknutí mimo menu (rozbalovací i mobilní hamburger) ho zavře.
  document.addEventListener('click', function () {
    closeAll(null);
    closeMobileNav();
  });

  // Escape zavře obojí taky.
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      closeAll(null);
      closeMobileNav();
    }
  });
});

// Odsazení pro skoky na kotvy — na stránkách s lištou rychlých odkazů
// (.anchor-nav, position: sticky nahoře) by se jinak nadpis cílové sekce
// po kliknutí na kotvu schoval pod touto lištou. Odsazení se počítá podle
// skutečné výšky lišty, aby fungovalo na všech velikostech obrazovky.
function updateScrollPadding() {
  var bar = document.querySelector('.anchor-nav');
  document.documentElement.style.scrollPaddingTop = bar ? (bar.offsetHeight + 16) + 'px' : '0px';
}
window.addEventListener('DOMContentLoaded', updateScrollPadding);
window.addEventListener('load', updateScrollPadding);
window.addEventListener('resize', updateScrollPadding);

// Schovávání kotvové lišty (.anchor-nav) při scrollu — jen na mobilu/tabletu
// (≤1024px, stejná hranice jako zbytek mobilních úprav v style.css). Při
// scrollu dolů lišta zajede nahoru z cesty, při scrollu nahoru se hned
// vrátí zpět — stejné chování jako dřív jen na stránce Orchestry a soubory,
// teď sjednocené na všech stránkách s kotvovou lištou. Nad 1024px zůstává
// lišta klasicky přilepená nahoře bez schovávání.
(function () {
  var bar = document.querySelector('.anchor-nav');
  if (!bar) return;

  var mq = window.matchMedia('(max-width: 1024px)');
  var lastY = window.scrollY;
  var ticking = false;

  function onScroll() {
    if (!mq.matches) {
      bar.classList.remove('anchor-hidden');
      lastY = window.scrollY;
      return;
    }
    var y = window.scrollY;
    if (y > lastY && y > bar.offsetHeight) {
      bar.classList.add('anchor-hidden');
    } else {
      bar.classList.remove('anchor-hidden');
    }
    lastY = y;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(function () {
        onScroll();
        ticking = false;
      });
    }
  }, { passive: true });
})();

// ---------- Tlačítko „Zpět nahoru" ----------
// Stejně jako mobilní hamburger tlačítko se vkládá přes JS, takže není
// potřeba upravovat žádnou jednotlivou HTML stránku — objeví se automaticky
// všude, kde je nav.js načtený (tedy na celém webu). Kulaté, bez výplně,
// jen obrys — viz .back-to-top ve style.css. Skryté, dokud uživatel nesjede
// pod spodní okraj záhlaví, pak se plynule zobrazí.
(function () {
  document.addEventListener('DOMContentLoaded', function () {
    var header = document.querySelector('.site-header');
    if (!header) return;

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'back-to-top';
    btn.setAttribute('aria-label', 'Zpět nahoru');
    btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5"></path><path d="M5 12l7-7 7 7"></path></svg>';
    document.body.appendChild(btn);

    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    var ticking = false;
    function onScroll() {
      var headerBottom = header.getBoundingClientRect().bottom + window.scrollY;
      var visible = window.scrollY > headerBottom;
      btn.classList.toggle('back-to-top-visible', visible);
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(function () {
          onScroll();
          ticking = false;
        });
      }
    }, { passive: true });

    onScroll();
  });
})();
