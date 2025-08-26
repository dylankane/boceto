// theme-switcher.js
(() => {
    const markers = Array.from(document.querySelectorAll('.theme-marker[data-theme]'));
    if (!markers.length) return;
  
    const applyTheme = (name) => {
      if (document.body.dataset.theme !== name) {
        document.body.dataset.theme = name;
      }
    };
  
    const pickFromCenter = () => {
      const cy = window.innerHeight / 2;
      let best = null, bestDist = Infinity;
  
      for (const m of markers) {
        const r = m.getBoundingClientRect();
        const my = r.top + r.height / 2;
        const d = Math.abs(my - cy);
        if (d < bestDist) { bestDist = d; best = m; }
      }
      if (best) applyTheme(best.dataset.theme);
    };
  
    // initial pick (covers reloads mid-page)
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', pickFromCenter, { once: true });
    } else {
      pickFromCenter();
    }
  
    // update on scroll/resize (throttled via rAF)
    let ticking = false;
    const onScrollResize = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => { pickFromCenter(); ticking = false; });
    };
    window.addEventListener('scroll', onScrollResize, { passive: true });
    window.addEventListener('resize', onScrollResize);
  })();
  