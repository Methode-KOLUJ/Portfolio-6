// Animation des balles avec lettres
anime({
  targets: ".ball",
  translateY: [
    { value: -70, duration: 500, easing: "easeOutQuad" },
    { value: 0, duration: 500, easing: "easeInQuad" },
  ],
  rotate: [{ value: 360, duration: 1000, easing: "easeInOutSine" }],
  delay: anime.stagger(500), // Délai entre chaque balle
  loop: true,
  duration: 15000, // Durée totale de l'animation (10 secondes)
});

// Masquer l'overlay après 10 secondes
setTimeout(() => {
  const loadingOverlay = document.getElementById("loading-overlay");

  // Ajouter une transition fluide pour masquer l'overlay
  loadingOverlay.style.transition = "opacity 0.8s ease";
  loadingOverlay.style.opacity = "0";

  // Masquer après la transition
  setTimeout(() => {
    loadingOverlay.style.display = "none";
    document.body.style.overflow = "auto";
  }, 800);
}, 10000);
