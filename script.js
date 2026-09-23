/* ============================================================
   PORTFOLIO — script.js
   Three small jobs:
   1. open and close the mobile menu
   2. give the nav a background once you scroll past the top
   3. fade sections in as they come into view
   ============================================================ */

(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var nav     = document.getElementById('nav');
  var toggle  = document.getElementById('navToggle');
  var menu    = document.getElementById('navMenu');

  /* ---------- 1. mobile menu ---------- */
  function setMenu(open) {
    if (!nav || !toggle) return;
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.querySelector('.nav__toggle-text').textContent = open ? 'Close' : 'Menu';
  }

  if (toggle) {
    toggle.addEventListener('click', function () {
      setMenu(!nav.classList.contains('is-open'));
    });
  }

  // tapping a link should close the menu, not leave it covering the page
  if (menu) {
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });
  }

  // escape closes it too, for keyboard users
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setMenu(false);
  });

  // if the window is widened past the desktop breakpoint while the
  // menu is open, reset it so the inline links show up correctly
  var desktop = window.matchMedia('(min-width: 900px)');
  function onBreakpoint(e) { if (e.matches) setMenu(false); }
  if (desktop.addEventListener) desktop.addEventListener('change', onBreakpoint);
  else desktop.addListener(onBreakpoint); // older Safari

  /* ---------- 2. sticky nav background ---------- */
  function onScroll() {
    if (nav) nav.classList.toggle('is-stuck', window.scrollY > 40);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- 3. website/UI project sliders ----------
     NOTE: this runs BEFORE the reveal-on-scroll block below,
     because that block can `return` early (reduced-motion
     users, older browsers) and anything placed after it would
     never run. Sliders need to work for everyone regardless. */
  document.querySelectorAll('.webproj').forEach(function (proj) {
    var track   = proj.querySelector('.webproj__track');
    var slides  = proj.querySelectorAll('.webproj__slide');
    var prev    = proj.querySelector('.webproj__arrow--prev');
    var next    = proj.querySelector('.webproj__arrow--next');
    var current = proj.querySelector('.webproj__counter .is-current');
    if (!track || !slides.length) return;

    function activeIndex() {
      var i = Math.round(track.scrollLeft / track.clientWidth);
      return Math.max(0, Math.min(slides.length - 1, i));
    }

    function goTo(i) {
      i = Math.max(0, Math.min(slides.length - 1, i));
      track.scrollTo({ left: i * track.clientWidth, behavior: reduced ? 'auto' : 'smooth' });
    }

    function update() {
      var i = activeIndex();
      if (current) current.textContent = String(i + 1);
      if (prev) prev.disabled = (i === 0);
      if (next) next.disabled = (i === slides.length - 1);
    }

    if (prev) prev.addEventListener('click', function () { goTo(activeIndex() - 1); });
    if (next) next.addEventListener('click', function () { goTo(activeIndex() + 1); });

    var scrollTimer;
    track.addEventListener('scroll', function () {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(update, 60);
    }, { passive: true });

    window.addEventListener('resize', function () { goTo(activeIndex()); });

    if (slides.length < 2) {
      if (prev) prev.style.display = 'none';
      if (next) next.style.display = 'none';
      var counterEl = proj.querySelector('.webproj__counter');
      if (counterEl) counterEl.style.display = 'none';
    }

    update();
  });

    /* ---------- 4. UI/UX portrait card rails ---------- */
  document.querySelectorAll('.uxrail').forEach(function (rail) {
    var track = rail.querySelector('.uxrail__track');
    var prev  = rail.querySelector('.uxrail__arrow--prev');
    var next  = rail.querySelector('.uxrail__arrow--next');
    if (!track) return;

    function step() {
      var card = track.querySelector('.uxrail__card');
      return card ? card.getBoundingClientRect().width + 14 : track.clientWidth * 0.8;
    }

    function updateArrows() {
      var max = track.scrollWidth - track.clientWidth - 2;
      if (prev) prev.disabled = track.scrollLeft <= 2;
      if (next) next.disabled = track.scrollLeft >= max;
    }

    if (prev) prev.addEventListener('click', function () {
      track.scrollBy({ left: -step(), behavior: reduced ? 'auto' : 'smooth' });
    });
    if (next) next.addEventListener('click', function () {
      track.scrollBy({ left: step(), behavior: reduced ? 'auto' : 'smooth' });
    });

    var scrollTimer;
    track.addEventListener('scroll', function () {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(updateArrows, 60);
    }, { passive: true });
    window.addEventListener('resize', updateArrows);

    updateArrows();
  });

    /* ---------- 5. show a scroll hint on tall UI/UX screenshots ---------- */
  document.querySelectorAll('.uxrail__frame').forEach(function (frame) {
    // run after the image has loaded so scrollHeight is accurate
    function check() {
      var card = frame.closest('.uxrail__card');
      if (!card) return;
      card.classList.toggle('has-more', frame.scrollHeight > frame.clientHeight + 4);
    }
    var img = frame.querySelector('img');
    if (img && img.complete) check();
    else if (img) img.addEventListener('load', check);
    frame.addEventListener('scroll', function () {
      // hide the hint once they've scrolled down at all
      frame.closest('.uxrail__card').classList.toggle(
        'has-more',
        frame.scrollTop < 8 && frame.scrollHeight > frame.clientHeight + 4
      );
    }, { passive: true });
    window.addEventListener('resize', check);
  });

  /* ---------- 4. reveal sections on scroll ---------- */
  var targets = document.querySelectorAll('.about__top, .about__cols, .logos__grid, .case, .contact__rows');

  if (reduced || !('IntersectionObserver' in window)) {
    return; // leave everything visible
  }

  targets.forEach(function (el) { el.classList.add('reveal'); });

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });

  targets.forEach(function (el) { io.observe(el); });
})();
