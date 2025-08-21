(() => {
    const body  = document.body;
    const scene = document.getElementById('scene');
    const flier = document.getElementById('flier');
    const base  = document.getElementById('base');
  
    // Scene text
    const subtitle = document.getElementById('subtitle');
    const quote    = document.getElementById('quote');
    const hint     = document.getElementById('hint'); // optional
  
    // p: 0 → 1 (0 = start, 1 = flier off top-right)
    let p = 0;
    let introActive = true;
  
    const SPEED = 0.0003;
    const BOTTOM_HIDE_P = 0.25;
  
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    const smoothstep = (e0, e1, x) => {
      const t = clamp((x - e0) / (e1 - e0), 0, 1);
      return t * t * (3 - 2 * t);
    };
  
    function setIntro(active) {
      introActive = active;
      if (active) {
        scene.classList.remove('hidden');
        body.style.overflow = 'hidden';
        render();
      } else {
        scene.classList.add('hidden');
        body.style.overflow = 'auto';
      }
    }
  
    function render() {
      // Top image: fly to top-right
      const fx = p * window.innerWidth;
      const fy = -p * window.innerHeight;
      flier.style.transform = `translate(${fx}px,${fy}px)`;
  
      // Bottom image: slide off-left over first quarter of progress
      const baseRectW = base.getBoundingClientRect().width;
      const fallbackW = parseFloat(getComputedStyle(base).width) || 220;
      const baseWidth = baseRectW || fallbackW;
      const dist = baseWidth + 60; // push fully off-screen
      const t = clamp(p / BOTTOM_HIDE_P, 0, 1);
      base.style.transform = `translateX(${-dist * t}px)`;
  
      // Subtitle fades out around halfway
      if (subtitle) {
        const subOpacity = 1 - smoothstep(0.35, 0.6, p); // 1→0 between 0.35..0.6
        subtitle.style.opacity = String(subOpacity);
      }
  
      // Quote fades in after halfway
      if (quote) {
        const quoteOpacity = smoothstep(0.5, 0.75, p);   // 0→1 between 0.5..0.75
        quote.style.opacity = String(quoteOpacity);
      }
  
      // Optional hint
      if (hint) hint.style.display = (p > 0.02) ? "none" : "block";
    }
  
    function completeIntroIfNeeded() {
      if (p >= 1 && introActive) setIntro(false);
    }
  
    function maybeReactivateIntroOnTop(deltaY) {
      if (!introActive && window.scrollY <= 0 && deltaY < 0) {
        p = 1;           // restart from completed state; reverse feels natural
        setIntro(true);
      }
    }
  
    function onWheel(e) {
      if (introActive) {
        e.preventDefault();
        p = clamp(p + e.deltaY * SPEED, 0, 1);
        render();
        completeIntroIfNeeded();
      } else {
        if (window.scrollY <= 0 && e.deltaY < 0) {
          e.preventDefault();
          maybeReactivateIntroOnTop(e.deltaY);
          p = clamp(p + e.deltaY * SPEED, 0, 1);
          render();
        }
      }
    }
  
    // Touch support
    let touchY = null;
    function onTouchStart(e) {
      if (e.touches && e.touches.length) {
        touchY = e.touches[0].clientY;
        window.addEventListener('touchmove', onTouchMove, { passive: false });
        window.addEventListener('touchend', onTouchEnd, { passive: true });
      }
    }
    function onTouchMove(e) {
      const y  = e.touches[0].clientY;
      const dy = touchY - y; // swipe up => positive
      touchY = y;
  
      if (introActive) {
        e.preventDefault();
        p = clamp(p + dy * SPEED, 0, 1);
        render();
        completeIntroIfNeeded();
      } else {
        if (window.scrollY <= 0 && dy < 0) {
          e.preventDefault();
          maybeReactivateIntroOnTop(dy);
          p = clamp(p + dy * SPEED, 0, 1);
          render();
        }
      }
    }
    function onTouchEnd() {
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    }
  
    // Keyboard (optional)
    function onKey(e) {
      const fwd  = ['PageDown', 'ArrowDown', ' ', 'Spacebar'];
      const back = ['PageUp', 'ArrowUp'];
      if (introActive) {
        if (fwd.includes(e.key))  { e.preventDefault(); p = clamp(p + 0.02, 0, 1); render(); completeIntroIfNeeded(); }
        if (back.includes(e.key)) { e.preventDefault(); p = clamp(p - 0.02, 0, 1); render(); }
      } else if (window.scrollY <= 0 && back.includes(e.key)) {
        e.preventDefault();
        p = 1; setIntro(true);
        p = clamp(p - 0.08, 0, 1); render();
      }
    }
  
    // Listeners
    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: false });
    window.addEventListener('keydown', onKey, { passive: false });
    window.addEventListener('resize', render);
  
    // Start
    setIntro(true);
    render();
  })();
  