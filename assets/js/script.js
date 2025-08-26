(() => {
  'use strict';

  // Elements
  const body     = document.body;
  const hero     = document.getElementById('hero') || document.querySelector('.hero');
  const flier    = document.getElementById('flier');     // plane (fixed)
  const base     = document.getElementById('base');      // hand  (fixed)
  const subtitle = document.getElementById('subtitle');  // fixed
  const quote    = document.getElementById('quote');     // fixed
  const details  = document.querySelector('.details');   // fixed

  // State
  let p = 0;                 // progress 0 → 1
  let introActive = true;    // animating hero?
  let detailsLatched = false;
  let touchY = null;

  // Tunables
  const SPEED = 0.0006, KEY_STEP = 0.02, MAX_DELTA = 60;
  const BOTTOM_HIDE_P = 0.25;

  // Finish a touch early to avoid the “dead beat”
  const FINISH_P = 0.92;     // consider done slightly before 1.00

  // Fade windows
  const SUB_OUT_A=0.35, SUB_OUT_B=0.60;
  const Q_IN_A =0.50, Q_IN_B =0.75;
  // Fade quote OUT earlier, ending right at FINISH_P
  const Q_OUT_A=0.88, Q_OUT_B=FINISH_P;

  // Details windows
  const D_IN_A  = BOTTOM_HIDE_P + 0.02; // 0.27
  const D_IN_B  = BOTTOM_HIDE_P + 0.16; // 0.41
  const D_OUT_A = BOTTOM_HIDE_P - 0.14; // 0.11
  const D_OUT_B = BOTTOM_HIDE_P - 0.02; // 0.23

  // Utils
  const clamp = (v,a,b)=>Math.max(a,Math.min(b,v));
  const smoothstep=(a,b,x)=>{ const t=clamp((x-a)/(b-a),0,1); return t*t*(3-2*t); };
  const clampDelta = d => clamp(d, -MAX_DELTA, MAX_DELTA);
  const atTop = () => window.scrollY <= 0;

  function showAnimParts(show){
    [flier, base, subtitle, quote].forEach(el => { if (el) el.style.display = show ? '' : 'none'; });
  }

  function lockScroll(lock){
    body.style.overflowX = 'hidden';
    body.style.overflowY = lock ? 'hidden' : 'auto';
  }

  function render(){
    // DETAILS — always update
    if (details) {
      if (!detailsLatched && p >= D_IN_B) detailsLatched = true;
      if (detailsLatched && p <= D_OUT_B) detailsLatched = false;

      let op = 0;
      if (p >= BOTTOM_HIDE_P) op = detailsLatched ? 1 : smoothstep(D_IN_A, D_IN_B, p);
      else                    op = detailsLatched ? (1 - smoothstep(D_OUT_A, D_OUT_B, p)) : 0;
      details.style.opacity = String(op);
    }

    // Only show animating bits when:
    // - we're animating, OR
    // - we're at absolute top and NOT finished
    const shouldShow = introActive || (atTop() && p < FINISH_P);
    showAnimParts(shouldShow);

    if (!shouldShow) { lockScroll(false); return; }

    // Plane (viewport path; fixed positioning)
    if (flier) {
      const fx = p * window.innerWidth;
      const fy = -p * window.innerHeight;
      flier.style.transform = `translate(${fx}px, ${fy}px)`;
    }

    // Hand (slide left over first quarter)
    if (base) {
      const w = base.getBoundingClientRect().width || parseFloat(getComputedStyle(base).width) || 220;
      const dist = w + 60;
      const t = clamp(p / BOTTOM_HIDE_P, 0, 1);
      base.style.transform = `translateX(${-dist * t}px)`;
    }

    // Subtitle fades out mid-flight
    if (subtitle) subtitle.style.opacity = String(1 - smoothstep(SUB_OUT_A, SUB_OUT_B, p));

    // Quote fades in > halfway, then out by FINISH_P
    if (quote) {
      const inOp  = smoothstep(Q_IN_A,  Q_IN_B,  p);
      const outOp = 1 - smoothstep(Q_OUT_A, Q_OUT_B, p);
      quote.style.opacity = String(inOp * outOp);
    }

    // Lock vertical scroll only while at top, animating, and before finish
    lockScroll(atTop() && introActive && p < FINISH_P);
  }

  function completeIntroIfNeeded(){
    if (p >= FINISH_P) introActive = false; // finish a tad early
    lockScroll(atTop() && introActive && p < FINISH_P);
  }

  // Re-arm reverse when user is at top and scrolling upward
  function maybeReactivateReverse(deltaY){
    if (!introActive && atTop() && deltaY < 0) {
      p = FINISH_P;          // restart from finish point
      introActive = true;
      lockScroll(true);
    }
  }

  // Handlers
  function onWheel(e){
    if (!atTop() && !introActive) return;

    if (introActive){
      e.preventDefault();
      p = clamp(p + clampDelta(e.deltaY) * SPEED, 0, 1);
      render(); completeIntroIfNeeded();
    } else if (atTop() && e.deltaY < 0){
      e.preventDefault();
      maybeReactivateReverse(e.deltaY);
      p = clamp(p + clampDelta(e.deltaY) * SPEED, 0, 1);
      render();
    }
  }

  function onTouchStart(e){
    if (!atTop() && !introActive) return;
    if (e.touches && e.touches.length){
      touchY = e.touches[0].clientY;
      addEventListener('touchmove', onTouchMove, { passive:false });
      addEventListener('touchend',  onTouchEnd,  { passive:true  });
    }
  }
  function onTouchMove(e){
    if (!atTop() && !introActive) return;
    const y = e.touches[0].clientY, dy = touchY - y; touchY = y;

    if (introActive){
      e.preventDefault();
      p = clamp(p + dy * SPEED, 0, 1);
      render(); completeIntroIfNeeded();
    } else if (atTop() && dy < 0){
      e.preventDefault();
      maybeReactivateReverse(dy);
      p = clamp(p + dy * SPEED, 0, 1);
      render();
    }
  }
  function onTouchEnd(){
    removeEventListener('touchmove', onTouchMove);
    removeEventListener('touchend',  onTouchEnd);
  }

  function onKey(e){
    if (!atTop() && !introActive) return;
    const fwd=['PageDown','ArrowDown',' ','Spacebar'], back=['PageUp','ArrowUp'];

    if (introActive){
      if (fwd.includes(e.key)){ e.preventDefault(); p = clamp(p + KEY_STEP, 0, 1); render(); completeIntroIfNeeded(); }
      if (back.includes(e.key)){ e.preventDefault(); p = clamp(p - KEY_STEP, 0, 1); render(); }
    } else if (atTop() && back.includes(e.key)){
      e.preventDefault();
      p = FINISH_P; introActive = true;
      p = clamp(p - KEY_STEP, 0, 1); render();
    }
  }

  // Keep visuals in sync on resize and when leaving the top
  addEventListener('resize', render);
  addEventListener('scroll', () => {
    if (!atTop() && !introActive) showAnimParts(false);
  });

  // Init
  if (!atTop()){
    // Reloaded mid-page: start “done”
    p = 1; introActive = false; detailsLatched = true;
    showAnimParts(false);
  } else {
    p = 0; introActive = true;
    showAnimParts(true);
  }

  lockScroll(atTop() && introActive && p < FINISH_P);
  render();

  // Inputs
  addEventListener('wheel',      onWheel,      { passive:false });
  addEventListener('touchstart', onTouchStart, { passive:false });
  addEventListener('keydown',    onKey,        { passive:false });
})();
