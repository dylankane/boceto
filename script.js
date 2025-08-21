// JS-only positioning: both images start at the same origin (left:0; bottom:0).
// Adjust start positions with HAND_OFFSET_* and PLANE_OFFSET_*.
// Wheel/touch drives a horizontal pan; unlocks to vertical at the end.
(() => {
  const body  = document.body;
  const scene = document.querySelector('.scene');
  const plane = document.getElementById('plane');
  const hand  = document.getElementById('hand');

  // ===== CONFIG =====
  const H_PAN_PAGES = 1;              // 1 => pan 100vw (use 2 for 200vw)
  const TARGET_X_START = 0.35;        // plane screen-x at start (0..1 of viewport width)
  const TARGET_X_END   = 0.88;        // plane screen-x at end
  const Y_START = 0.55;               // plane screen-y at start (0 top .. 1 bottom)
  const Y_END   = 0.10;               // plane screen-y at end
  const ROT_START = -6;               // degrees
  const ROT_END   = -24;              // degrees
  const VIRTUAL_DISTANCE = 1800;      // higher = longer interaction

  // >>> Your manual start adjustments (pixels) <<<
  // Hand starts at (0,0) + these offsets
  const HAND_OFFSET_X  = 0;    // push right  (+), left (-)
  const HAND_OFFSET_Y  = 0;    // push up     (-), down (+)

  // Plane starts exactly on top of the hand + these extra offsets
  const PLANE_OFFSET_X = 0;    // e.g. 12 to start a bit right
  const PLANE_OFFSET_Y = 0;    // e.g. -8 to start a bit higher
  // ===================

  let progress = 0;   // 0..1 across the horizontal sequence
  let released = false;

  // Ensure scene is wide enough (pan distance + one viewport)
  function sizeScene() {
    scene.style.width = `${(H_PAN_PAGES + 1) * 100}vw`;
  }
  sizeScene();

  // helpers
  const clamp = (v,a,b)=>Math.max(a,Math.min(b,v));
  const lerp  = (a,b,t)=>a + (b - a) * t;
  const ease  = t => 1 - Math.pow(1 - t, 3); // easeOutCubic

  function render(p) {
    const W = window.innerWidth;
    const H = window.innerHeight;

    const t = clamp(p, 0, 1);
    const panMax = H_PAN_PAGES * W;   // 100vw when H_PAN_PAGES=1
    const pan = t * panMax;

    // Screen-anchored plane path (keeps it visible while we pan)
    const targetX = lerp(TARGET_X_START, TARGET_X_END, ease(t)) * W;
    const yScreen = lerp(Y_START, Y_END, ease(t)) * H;
    const rot     = lerp(ROT_START, ROT_END, ease(t));

    // Baseline = where the plane SHOULD be at t=0 on screen,
    // then we subtract it so the plane starts exactly at (0,0) + PLANE_OFFSET_*
    const baseX0 = TARGET_X_START * W + PLANE_OFFSET_X;
    const baseY0 = Y_START * H     + PLANE_OFFSET_Y;

    // World coords so camera pan keeps plane at targetX
    const worldX = pan + targetX;

    // Deltas from the baseline => initial transform is (PLANE_OFFSET_X, PLANE_OFFSET_Y)
    const dx = worldX - baseX0;
    const dy = yScreen - baseY0;

    // Apply transforms
    if (hand) {
      hand.style.transform = `translate(${HAND_OFFSET_X}px, ${HAND_OFFSET_Y}px)`;
    }
    plane.style.transform = `translate(${dx}px, ${dy}px) rotate(${rot}deg)`;
    scene.style.transform = `translateX(${-pan}px)`;

    // Release to vertical scroll at end of pan
    if (!released && pan >= panMax - 1) {
      released = true;
      body.classList.remove('no-scroll');
    }
  }

  // input
  function onWheel(e) {
    if (released) return;
    e.preventDefault();
    progress = clamp(progress + e.deltaY / VIRTUAL_DISTANCE, 0, 1);
    render(progress);
  }
  let lastY = null;
  function onTouchStart(e){ lastY = e.touches[0].clientY; }
  function onTouchMove(e){
    if (released) return;
    const y  = e.touches[0].clientY;
    const dy = lastY !== null ? (lastY - y) : 0;
    lastY = y;
    progress = clamp(progress + dy / (VIRTUAL_DISTANCE * 0.9), 0, 1);
    render(progress);
    if (!released) e.preventDefault();
  }
  function onTouchEnd(){ lastY = null; }

  // init
  window.addEventListener('wheel', onWheel, { passive:false });
  document.addEventListener('touchstart', onTouchStart, { passive:true });
  document.addEventListener('touchmove', onTouchMove, { passive:false });
  document.addEventListener('touchend', onTouchEnd, { passive:true });

  render(progress);                 // set initial pose (both start at the same origin + offsets)
  body.classList.add('no-scroll');  // lock during the horizontal sequence

  window.addEventListener('resize', () => { sizeScene(); render(progress); }, { passive:true });
})();
