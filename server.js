// Importer les modules nécessaires
const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const bodyParser = require("body-parser");
require("dotenv").config();

// Initialiser l'application Express
const app = express();
const port = 3000;

// Middleware pour gérer le parsing des requêtes JSON
app.use(bodyParser.json());

// Connecter à MongoDB
mongoose
  .connect(
    "mongodb+srv://METHODE_KOLUJ:Aua105o68D45xVwh@cluster0.mnke4cu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
  )
  .then(() => console.log("Connecté à Mongo DB"))
  .catch((err) => console.error("Impossible de se connecter à Mongo DB", err));

// Modèle de données pour les articles
const articleSchema = new mongoose.Schema({
  titre: String,
  image: String,
  description: String,
  likes: { type: Number, default: 0 },
  comments: [
    {
      name: String,
      text: String,
      date: { type: Date, default: Date.now },
    },
  ],
});

const Article = mongoose.model("Article", articleSchema);

// Configuration de Multer pour gérer les fichiers téléchargés (images locales)
const upload = multer({ dest: "uploads/" });

// Middleware pour servir les fichiers statiques (Blog.html)
app.use(express.static(path.join(__dirname, "public")));

// Route pour servir Blog.html à la racine
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Route pour ajouter un article
app.post("/articles", async (req, res) => {
  const { titre, image, description } = req.body;

  const article = new Article({
    titre,
    image,
    description,
  });

  try {
    const savedArticle = await article.save();
    res.status(201).json(savedArticle);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de l'ajout de l'article" });
  }
});

// Route pour récupérer tous les articles
app.get("/articles", async (req, res) => {
  try {
    const articles = await Article.find();
    res.json(articles);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Erreur lors de la récupération des articles" });
  }
});

// Route pour ajouter un like à un article
app.post("/articles/:id/like", async (req, res) => {
  const { id } = req.params;

  try {
    const article = await Article.findById(id);
    if (!article) {
      return res.status(404).json({ error: "Article non trouvé" });
    }

    article.likes += 1;
    const updatedArticle = await article.save();
    res.json(updatedArticle);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de l'ajout du like" });
  }
});

// Route pour ajouter un commentaire à un article
app.post("/articles/:id/comment", async (req, res) => {
  const { id } = req.params;
  const { name, text } = req.body;

  try {
    const article = await Article.findById(id);
    if (!article) {
      return res.status(404).json({ error: "Article non trouvé" });
    }

    article.comments.push({ name, text });
    const updatedArticle = await article.save();
    res.json(updatedArticle);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de l'ajout du commentaire" });
  }
});

// Route pour supprimer un commentaire d'un article
app.delete("/articles/:id/comment/:commentId", async (req, res) => {
  const { id, commentId } = req.params;

  try {
    const article = await Article.findById(id);
    if (!article) {
      return res.status(404).json({ error: "Article non trouvé" });
    }

    article.comments.id(commentId).remove();
    const updatedArticle = await article.save();
    res.json(updatedArticle);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Erreur lors de la suppression du commentaire" });
  }
});

// Route pour supprimer un article
app.delete("/articles/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const article = await Article.findByIdAndDelete(id);
    if (!article) {
      return res.status(404).json({ error: "Article non trouvé" });
    }
    res.json({ message: "Article supprimé" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Erreur lors de la suppression de l'article" });
  }
});

// Route pour télécharger une image locale
app.post("/upload-image", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Aucun fichier téléchargé" });
  }

  const imageUrl = `/uploads/${req.file.filename}`;
  res.json({ imageUrl });
});

// Servir les fichiers statiques (images téléchargées)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Démarrer le serveur
app.listen(port, () => {
  console.log(`Le serveur tourne sur http://localhost:${port}`);
});
