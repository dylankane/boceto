document.addEventListener("DOMContentLoaded", () => {
    const openTab = document.querySelector(".modal-tab");
    const closeBtn = document.getElementById("closeModalBtn");
    const overlay = document.getElementById("modalOverlay");
    const modal = document.getElementById("contactModal");
    const hero = document.querySelector(".hero");
  
    // --- Modal functions ---
    function openModal() {
      overlay.style.display = "block";
      modal.style.display = "block";
    }
  
    function closeModal() {
      overlay.style.display = "none";
      modal.style.display = "none";
    }
  
    // --- Event listeners ---
    if (openTab) openTab.addEventListener("click", openModal);
    if (closeBtn) closeBtn.addEventListener("click", closeModal);
    if (overlay) overlay.addEventListener("click", closeModal);
  
    // ESC key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeModal();
    });
  
    // --- Hide tab when hero is visible ---
    if (hero && openTab) {
      // prepare tab for fade
      openTab.style.transition = "opacity 0.3s ease";
      openTab.style.opacity = "1";
  
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              // hero visible → fade out
              openTab.style.opacity = "0";
              setTimeout(() => {
                openTab.style.pointerEvents = "none";
              }, 300); // match transition time
            } else {
              // hero not visible → fade in
              openTab.style.opacity = "1";
              openTab.style.pointerEvents = "auto";
            }
          });
        },
        { threshold: 0.2 } // adjust how much of hero must be visible
      );
  
      observer.observe(hero);
    }
  });
  