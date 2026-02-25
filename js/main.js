/* ============================================================
   main.js — shared utilities & scroll-reveal
   ============================================================ */

// ------------------------------------------------------------------
// Scroll-reveal: adds `.visible` to elements with [data-reveal]
// when they enter the viewport. Sections will use this later.
// ------------------------------------------------------------------
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target); // animate only once
      }
    });
  },
  { threshold: 0.15 }
);

document.querySelectorAll('[data-reveal]').forEach((el) => {
  revealObserver.observe(el);
});

// ------------------------------------------------------------------
// BIRTHDAY COUNTDOWN
// Target: March 2, 2000 → but we celebrate the next occurrence,
// i.e. March 2, 2026 (or 2027 if somehow past it).
// ------------------------------------------------------------------
(function initCountdown() {
  const elDays    = document.getElementById('cd-days');
  const elHours   = document.getElementById('cd-hours');
  const elMinutes = document.getElementById('cd-minutes');
  const elSeconds = document.getElementById('cd-seconds');
  const preBd     = document.getElementById('countdown-pre');
  const onBd      = document.getElementById('countdown-birthday');

  if (!elDays) return; // section not in DOM

  /** Get the next (or current) March 2 at midnight local time */
  function getNextBirthday() {
    const now   = new Date();
    const year  = now.getFullYear();
    let   bd    = new Date(year, 2, 2, 0, 0, 0, 0); // month is 0-indexed → 2 = March
    if (now >= bd) bd = new Date(year + 1, 2, 2, 0, 0, 0, 0);
    return bd;
  }

  /** Pad a number to 2 digits */
  const pad = (n) => String(n).padStart(2, '0');

  /** Animate a number changing */
  function setNum(el, value) {
    const padded = pad(value);
    if (el.textContent !== padded) {
      el.textContent = padded;
      el.classList.remove('tick');
      void el.offsetWidth; // reflow to restart animation
      el.classList.add('tick');
    }
  }

  function tick() {
    const now      = new Date();
    const target   = getNextBirthday();
    const diffMs   = target - now;

    // It's her birthday today! (within the calendar day)
    const todayBd  = new Date(now.getFullYear(), 2, 2, 0, 0, 0, 0);
    const tomorrowBd = new Date(now.getFullYear(), 2, 3, 0, 0, 0, 0);
    const isBirthday = now >= todayBd && now < tomorrowBd;

    if (isBirthday) {
      preBd.hidden = true;
      onBd.hidden  = false;
      return; // stop ticking
    }

    if (diffMs <= 0) {
      preBd.hidden = true;
      onBd.hidden  = false;
      return;
    }

    const totalSeconds = Math.floor(diffMs / 1000);
    const days    = Math.floor(totalSeconds / 86400);
    const hours   = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600)  / 60);
    const seconds = totalSeconds % 60;

    setNum(elDays,    days);
    setNum(elHours,   hours);
    setNum(elMinutes, minutes);
    setNum(elSeconds, seconds);

    setTimeout(tick, 1000);
  }

  tick(); // kick off immediately
})();

