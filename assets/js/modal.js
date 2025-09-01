document.addEventListener("DOMContentLoaded", () => {
  const openTab = document.querySelector(".modal-tab");
  const closeBtn = document.getElementById("closeModalBtn");
  const overlay = document.getElementById("modalOverlay");
  const modal = document.getElementById("contactModal");
  const hero = document.querySelector(".hero");
  const footer = document.querySelector(".site-footer");

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

  const openModalLinks = document.querySelectorAll(".open-modal-link");
  openModalLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      openModal();
    });
  });

  // ESC key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });

  // --- Hide tab when hero OR footer is visible ---
  if (openTab) {
    // prepare tab for fade
    openTab.style.transition = "opacity 0.3s ease";
    openTab.style.opacity = "1";

    const observer = new IntersectionObserver(
      (entries) => {
        let shouldHide = entries.some((entry) => entry.isIntersecting);
        if (shouldHide) {
          openTab.style.opacity = "0";
          setTimeout(() => {
            openTab.style.pointerEvents = "none";
          }, 300); // match transition time
        } else {
          openTab.style.opacity = "1";
          openTab.style.pointerEvents = "auto";
        }
      },
      { threshold: 0.2 }
    );

    if (hero) observer.observe(hero);
    if (footer) observer.observe(footer);
  }
});
