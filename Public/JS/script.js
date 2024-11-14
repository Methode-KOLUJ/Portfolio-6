const hamburger = document.querySelector(".hamburger");
const menu = document.querySelector(".menu");

hamburger.addEventListener("click", (event) => {
  event.stopPropagation();
  menu.classList.toggle("active");
});

// Fermer le menu en cliquant à l'extérieur
document.addEventListener("click", (event) => {
  if (!menu.contains(event.target) && !hamburger.contains(event.target)) {
    menu.classList.remove("active");
  }
});
