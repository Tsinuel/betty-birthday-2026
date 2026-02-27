/* ============================================================
   main.js — shared utilities & scroll-reveal
   ============================================================ */

// ------------------------------------------------------------------
// BIRTHDAY LOCK SYSTEM
// Locks content until March 2, 2026
// ------------------------------------------------------------------
(function initBirthdayLock() {
  const lockOverlay = document.getElementById('birthday-lock');
  const lockDaysEl = document.getElementById('lock-days');
  
  if (!lockOverlay || !lockDaysEl) return;

  function isBirthdayOrAfter() {
    const now = new Date();
    const birthday = new Date(2026, 2, 2, 0, 0, 0, 0); // March 2, 2026
    return now >= birthday;
  }

  function getDaysUntilBirthday() {
    const now = new Date();
    const birthday = new Date(2026, 2, 2, 0, 0, 0, 0);
    const diffMs = birthday - now;
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  }

  function updateLockCountdown() {
    const days = getDaysUntilBirthday();
    if (days > 0) {
      lockDaysEl.textContent = days;
    }
  }

  // Check if it's her birthday or after
  if (isBirthdayOrAfter()) {
    // Unlock everything - hide lock overlay
    lockOverlay.classList.add('hidden');
    document.body.classList.remove('content-locked');
  } else {
    // Lock content - show lock overlay after entrance
    document.body.classList.add('content-locked');
    
    // Show lock overlay after a brief delay
    setTimeout(() => {
      lockOverlay.classList.remove('hidden');
    }, 100);
    
    // Update countdown
    updateLockCountdown();
    
    // Check every hour if birthday has arrived
    setInterval(() => {
      if (isBirthdayOrAfter()) {
        lockOverlay.classList.add('hidden');
        document.body.classList.remove('content-locked');
      } else {
        updateLockCountdown();
      }
    }, 3600000); // Check every hour
  }
})();

// ------------------------------------------------------------------
// ENTRANCE OVERLAY & BACKGROUND MUSIC
// ------------------------------------------------------------------
(function initEntrance() {
  const overlay = document.getElementById('entrance-overlay');
  const entranceBtn = document.getElementById('entrance-btn');
  const bgMusic = document.getElementById('bg-music');
  const musicToggle = document.getElementById('music-toggle');

  if (!overlay || !entranceBtn || !bgMusic) return;

  // Ensure page starts at top
  window.scrollTo(0, 0);
  document.body.style.overflow = 'hidden'; // Prevent scrolling while overlay is visible

  entranceBtn.addEventListener('click', () => {
    // Start the music
    bgMusic.play().catch(err => {
      console.log('Autoplay prevented:', err);
      // If autoplay fails, user can still use the toggle button
    });

    // Fade out overlay
    overlay.classList.add('fade-out');

    // Re-enable scrolling and ensure we're at top
    setTimeout(() => {
      document.body.style.overflow = '';
      window.scrollTo(0, 0);
    }, 100);

    // Show music toggle button
    setTimeout(() => {
      musicToggle.classList.remove('hidden');
    }, 800);

    // Remove overlay from DOM after transition
    setTimeout(() => {
      overlay.remove();
    }, 1000);
  });

  // Music toggle button
  if (musicToggle) {
    musicToggle.addEventListener('click', () => {
      if (bgMusic.paused) {
        bgMusic.play();
        musicToggle.classList.remove('paused');
      } else {
        bgMusic.pause();
        musicToggle.classList.add('paused');
      }
    });
  }
})();

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

