(() => {
    const header  = document.getElementById('siteHeader');
    const toggle  = document.getElementById('menuToggle');
    const overlay = document.getElementById('siteMenu');
    const closeBtn= document.getElementById('menuClose');
  
    if(!header || !toggle || !overlay) return;
  
    let lastFocus = null;
    const firstLink = overlay.querySelector('a');
  
    function setOpen(open){
      header.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      document.documentElement.classList.toggle('no-scroll', open);
      document.body.classList.toggle('no-scroll', open);
  
      if(open){
        lastFocus = document.activeElement;
        if(firstLink) firstLink.focus({ preventScroll: true });
      } else {
        if(lastFocus) try{ lastFocus.focus({ preventScroll: true }); } catch{}
      }
    }
  
    toggle.addEventListener('click', () => setOpen(!header.classList.contains('open')));
  
    // Exit button
    if(closeBtn) closeBtn.addEventListener('click', () => setOpen(false));
  
    // ESC to close
    window.addEventListener('keydown', (e) => {
      if(e.key === 'Escape' && header.classList.contains('open')) setOpen(false);
    });
  
    // Click background to close (not on links or the exit button)
    overlay.addEventListener('click', (e) => {
      if(e.target === overlay) setOpen(false);
    });
  
    // Close after clicking any link
    overlay.addEventListener('click', (e) => {
      const a = e.target.closest('a');
      if(a) setOpen(false);
    });
  })();
  