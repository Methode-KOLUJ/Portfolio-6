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
    Logo.style.display = "block";
  }
});

// GESTION DU FORMULAIRE

document.addEventListener("DOMContentLoaded", () => {
  const logoLink = document.getElementById("logoLink");
  const articleForm = document.getElementById("articleForm");
  let clickCount = 0;
  const revealThreshold = 10;
  const hideThreshold = 1;
  let isFormVisible = false;

  logoLink.addEventListener("click", () => {
    clickCount++;

    if (!isFormVisible && clickCount === revealThreshold) {
      articleForm.style.display = "block";
      isFormVisible = true;
      clickCount = 0;
    } else if (isFormVisible && clickCount === hideThreshold) {
      articleForm.style.display = "none";
      isFormVisible = false;
      clickCount = 0;
    }
  });
});
