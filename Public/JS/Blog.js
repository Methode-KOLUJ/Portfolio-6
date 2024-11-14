// Fonction pour transformer les URLs en liens cliquables
function convertirLien(description) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return description.replace(
    urlRegex,
    (url) => `<a href="${url}" target="_blank">${url}</a>`
  );
}

// Fonction pour transformer les mots entre (*) en texte stylé
function appliquerStyleSpecial(description) {
  return description.replace(/\(\*(.*?)\*\)/g, "<strong>$1</strong>");
}

// Fonction pour traiter la description : liens, retours à la ligne et style spécial
function traiterDescription(description) {
  const descriptionStylée = appliquerStyleSpecial(description);
  const descriptionAvecLien = convertirLien(descriptionStylée);
  return descriptionAvecLien.split("\n").join("<br>");
}

// Charger les articles depuis l'API
async function chargerArticles() {
  const response = await fetch("/articles");
  const articles = await response.json();

  // Afficher chaque article
  articles.forEach((article) => {
    afficherArticle(article);
  });
}

// Afficher un article dans le DOM
function afficherArticle(article) {
  const articleContainer = document.getElementById("blog-articles");

  const articleElement = document.createElement("div");
  articleElement.classList.add("article");
  articleElement.id = `article-${article._id}`;

  // Traiter la description
  const descriptionTraitee = traiterDescription(article.description);

  // Structure des boutons dans un conteneur
  articleElement.innerHTML = `
    <h2>${article.titre}</h2>
    <img src="${article.image}" alt="${article.titre}" />
    <p class="description">
      ${descriptionTraitee}
    </p>
    <div class="button-container">
      <button id="like-button-${article._id}" onclick="ajouterLike('${article._id}')">
        <i class="bx bx-like"></i> ${article.likes}
      </button>
      <button id="delete-button-${article._id}" data-clicks="0" onclick="compterClicsSuppression('${article._id}')">
        Supprimer cet article
      </button>
    </div>
  `;

  articleContainer.appendChild(articleElement);
  const buttonContainer = articleElement.querySelector(".button-container");
  buttonContainer.style.display = "flex";
  buttonContainer.style.alignItems = "center";
  buttonContainer.style.gap = "10px";

  const likeButton = document.getElementById(`like-button-${article._id}`);
  likeButton.style.display = "flex";
  likeButton.style.alignItems = "center";
  likeButton.style.gap = "5px";
  likeButton.style.backgroundColor = "#4CAF50";
  likeButton.style.color = "white";
  likeButton.style.border = "none";
  likeButton.style.padding = "10px 15px";
  likeButton.style.cursor = "pointer";
  likeButton.style.marginRight = "5px";
  likeButton.style.borderRadius = "5px";

  const deleteButton = document.getElementById(`delete-button-${article._id}`);
  deleteButton.style.backgroundColor = "white";
  deleteButton.style.color = "white";
  deleteButton.style.border = "none";
  deleteButton.style.padding = "10px 15px";
  deleteButton.style.borderRadius = "5px";

  // Désactiver le changement de curseur pour le bouton supprimer
  deleteButton.style.cursor = "default";
}

// Compter les clics avant de supprimer l'article
function compterClicsSuppression(articleId) {
  const deleteButton = document.getElementById(`delete-button-${articleId}`);
  let clicks = parseInt(deleteButton.getAttribute("data-clicks")) || 0;
  clicks += 1;
  deleteButton.setAttribute("data-clicks", clicks);

  if (clicks === 10) {
    supprimerArticle(articleId);
  } else {
    return;
  }
}

// Supprimer un article
async function supprimerArticle(articleId) {
  const response = await fetch(`/articles/${articleId}`, {
    method: "DELETE",
  });

  const result = await response.json();
  if (result.message === "Article supprimé") {
    document.getElementById(`article-${articleId}`).remove();
  }
}

// Ajouter un like
async function ajouterLike(articleId) {
  const likedArticles = JSON.parse(localStorage.getItem("likedArticles")) || [];

  if (likedArticles.includes(articleId)) {
    alert("Vous avez déjà liké cet article.");
    return;
  }

  const response = await fetch(`/articles/${articleId}/like`, {
    method: "POST",
  });

  const article = await response.json();

  if (article && article.likes !== undefined) {
    likedArticles.push(articleId);
    localStorage.setItem("likedArticles", JSON.stringify(likedArticles));

    const likeButton = document.querySelector(`#article-${articleId} button`);
    likeButton.innerHTML = `<i class="bx bx-like"></i> ${article.likes}`;
  }
}

// Ajouter un commentaire
async function ajouterCommentaire(articleId) {
  const commentText = document.getElementById(
    `comment-input-${articleId}`
  ).value;

  const response = await fetch(`/articles/${articleId}/comment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: "Utilisateur",
      text: commentText,
    }),
  });

  const article = await response.json();
  afficherCommentaires(article._id);
}

// Afficher les commentaires pour un article
async function afficherCommentaires(articleId) {
  const response = await fetch(`/articles/${articleId}`);
  const article = await response.json();

  const commentsContainer = document.getElementById(`comments-${articleId}`);
  commentsContainer.innerHTML = "";

  article.comments.forEach((comment) => {
    const commentTextStylée = traiterDescription(comment.text); // Traiter le texte du commentaire
    const commentElement = document.createElement("div");
    commentElement.innerHTML = `
      <p><strong>${comment.name}</strong>: ${commentTextStylée}</p>
      <button onclick="supprimerCommentaire('${articleId}', '${comment._id}')">Supprimer</button>
    `;
    commentsContainer.appendChild(commentElement);
  });
}

// Supprimer un commentaire
async function supprimerCommentaire(articleId, commentId) {
  const response = await fetch(`/articles/${articleId}/comment/${commentId}`, {
    method: "DELETE",
  });

  const result = await response.json();
  if (result.message === "Commentaire supprimé") {
    afficherCommentaires(articleId); // Rafraîchir les commentaires
  }
}

// Ajouter un article
document
  .getElementById("articleForm")
  .addEventListener("submit", async (event) => {
    event.preventDefault();

    const titre = document.getElementById("title").value;
    const description = document.getElementById("description").value;

    let image = "";
    const imageSource = document.getElementById("imageSource").value;

    if (imageSource === "url") {
      image = document.getElementById("imageUrl").value;
    } else if (imageSource === "local") {
      const localImageFile = document.getElementById("localImage").files[0];
      if (localImageFile) {
        const formData = new FormData();
        formData.append("image", localImageFile);

        const uploadResponse = await fetch("/upload-image", {
          method: "POST",
          body: formData,
        });

        const uploadResult = await uploadResponse.json();
        image = uploadResult.imageUrl;
      }
    }

    const response = await fetch("/articles", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        titre: titre,
        image: image,
        description: description,
      }),
    });

    const newArticle = await response.json();
    afficherArticle(newArticle);

    document.getElementById("articleForm").reset();
  });

// Charger les articles lorsque la page se charge
document.addEventListener("DOMContentLoaded", chargerArticles);
