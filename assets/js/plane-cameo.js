// plane-cameo.js — two independent SVG cameos, no rotation, scroll-linked
(() => {
    'use strict';
  
    // Define the cameos you want active
    const defs = [
      { id: 'plane2', startId: 'plane2-start', endId: 'plane2-end', path: 'TR_BL', speed: 2.5, out: 24 },
      { id: 'plane3', startId: 'plane3-start', endId: 'plane3-end', path: 'TL_BR', speed: 2.5, out: 24 },
    ];
  
    // Helpers
    const $ = (sel) => document.getElementById(sel);
    const clamp = (v,a,b)=>Math.max(a,Math.min(b,v));
    const lerp  = (a,b,t)=>a + (b - a) * t;
    const ease  = (t)=> (t < 0.5) ? 4*t*t*t : 1 - Math.pow(-2*t + 2, 3) / 2;
    const centerY = (el) => { const r = el.getBoundingClientRect(); return window.scrollY + r.top + r.height*0.5; };
  
    // Build runtime list (skip any missing wiring silently)
    const cameos = defs.map(d => {
      const el = $(d.id), start = $(d.startId), end = $(d.endId);
      if (!el || !start || !end) return null;
      return { el, start, end, path: d.path, speed: d.speed ?? 1, out: d.out ?? 24, pad: ((d.speed ?? 1) - 1) / 2 };
    }).filter(Boolean);
    if (!cameos.length) return;
  
    function endpoints(path, vw, vh, w, h, OUT){
      switch(path){
        case 'TR_BL': return { sx: vw + OUT, sy: -h - OUT, ex: -w - OUT, ey: vh + OUT };
        case 'TL_BR': return { sx: -w - OUT, sy: -h - OUT, ex: vw + OUT, ey: vh + OUT };
        default:      return { sx: vw + OUT, sy: -h - OUT, ex: -w - OUT, ey: vh + OUT };
      }
    }
  
    let ticking = false;
  
    function updateAll(){
      ticking = false;
      const vpC = window.scrollY + window.innerHeight * 0.5;
      const vw  = window.innerWidth;
      const vh  = window.innerHeight;
  
      for (const c of cameos){
        const startC = centerY(c.start);
        const endC   = centerY(c.end);
        const span   = endC - startC;
        if (span <= 1){ c.el.classList.remove('visible'); continue; }
  
        const raw = (vpC - startC) / span;
        if (raw <= -c.pad || raw >= 1 + c.pad){ c.el.classList.remove('visible'); continue; }
  
        c.el.classList.add('visible');
  
        const norm = clamp((raw + c.pad) / (1 + 2*c.pad), 0, 1);
        const t    = ease(norm);
  
        const r = c.el.getBoundingClientRect();
        const w = r.width  || parseFloat(getComputedStyle(c.el).width)  || 220;
        const h = r.height || parseFloat(getComputedStyle(c.el).height) || 220;
  
        const ep = endpoints(c.path, vw, vh, w, h, c.out);
        const x  = lerp(ep.sx, ep.ex, t);
        const y  = lerp(ep.sy, ep.ey, t);
  
        c.el.style.transform = `translate(${x}px, ${y}px)`; // no rotate; SVG handles orientation
      }
    }
  
    const onScrollResize = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(updateAll);
    };
  
    // Kick + listeners
    updateAll();
    window.addEventListener('scroll', onScrollResize, { passive: true });
    window.addEventListener('resize', onScrollResize);
  })();
  