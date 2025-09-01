document.addEventListener("DOMContentLoaded", () => {
    // ---- CONFIG ----
    const GA_ID = ""; // e.g. "G-XXXXXXX" when ready
    const CONSENT_KEY = "cookieConsent"; // 'granted' | 'denied' (stored for the session)
  
    // ---- Elements ----
    const modal   = document.getElementById("cookieModal");
    const overlay = document.getElementById("cookieOverlay");
    const btnAccept = document.getElementById("ckAccept");
    const btnReject = document.getElementById("ckReject");
    const btnClose  = document.getElementById("ckCloseBtn");
    const openLink  = document.getElementById("openCookiePrefs");
    const openLink2 = document.getElementById("ckOpenFromText");
  
    // ---- Consent Mode defaults (v2) ----
    window.dataLayer = window.dataLayer || [];
    function gtag(){ dataLayer.push(arguments); }
    gtag('consent', 'default', {
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      analytics_storage: 'denied',
      functionality_storage: 'granted',
      security_storage: 'granted'
    });
  
    let gaLoaded = false;
    function loadGA() {
      if (gaLoaded || !GA_ID) return;          // safe when GA_ID is empty
      const s = document.createElement("script");
      s.async = true;
      s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
      document.head.appendChild(s);
      gaLoaded = true;
      gtag('js', new Date());
      gtag('config', GA_ID, { anonymize_ip: true });
    }
  
    // ---- Bottom sheet open/close ----
    function openModal() {
      overlay.hidden = false; modal.hidden = false;
      requestAnimationFrame(() => { overlay.classList.add("open"); modal.classList.add("open"); });
    }
    function closeModal() {
      overlay.classList.remove("open"); modal.classList.remove("open");
      setTimeout(() => { overlay.hidden = true; modal.hidden = true; }, 280);
    }
  
    // Reopen from footer link(s)
    [openLink, openLink2].forEach(el => el && el.addEventListener("click", e => { e.preventDefault(); openModal(); }));
    overlay.addEventListener("click", closeModal);
    btnClose.addEventListener("click", closeModal);
    document.addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });
  
    // ---- Session memory (per session) ----
    function getConsent(){ return sessionStorage.getItem(CONSENT_KEY); }
    function setConsent(v){ sessionStorage.setItem(CONSENT_KEY, v); }
  
    function grantConsent() {
      setConsent("granted");
      gtag('consent', 'update', { analytics_storage: 'granted' });
      loadGA();
    }
    function denyConsent() {
      setConsent("denied");
      gtag('consent', 'update', { analytics_storage: 'denied' });
      // optional: clear GA cookies if any existed from past sessions
      document.cookie.split("; ").forEach(c => {
        const n = c.split("=")[0];
        if (n === "_ga" || n === "_gid" || n.startsWith("_ga_")) {
          document.cookie = `${n}=; Max-Age=0; path=/; SameSite=Lax`;
        }
      });
    }
  
    btnAccept.addEventListener("click", () => { grantConsent(); closeModal(); });
    btnReject .addEventListener("click", () => { denyConsent();  closeModal(); });
  
    // ---- Initial state ----
    const choice = getConsent();
    if (choice === "granted") {
      gtag('consent', 'update', { analytics_storage: 'granted' });
      loadGA();
    } else if (choice === "denied") {
      gtag('consent', 'update', { analytics_storage: 'denied' });
    } else {
      openModal(); // first visit this session
    }
  });
  