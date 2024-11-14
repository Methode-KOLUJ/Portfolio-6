const fs = require("fs");
const path = require("path");
const terser = require("terser");
const CleanCSS = require("clean-css");
const htmlMinifier = require("html-minifier").minify;

// Minify JavaScript files
const minifyJS = (filePath) => {
  try {
    const code = fs.readFileSync(filePath, "utf-8");
    const result = terser.minify(code, {
      compress: true,
      mangle: true,
    });
    if (result.error) {
      throw new Error(result.error);
    }
    return result.code;
  } catch (err) {
    console.error(`Error minifying JS file ${filePath}:`, err);
    return null;
  }
};

// Minify CSS files
const minifyCSS = (filePath) => {
  try {
    const code = fs.readFileSync(filePath, "utf-8");
    const result = new CleanCSS().minify(code);
    return result.styles;
  } catch (err) {
    console.error(`Error minifying CSS file ${filePath}:`, err);
    return null;
  }
};

// Minify HTML files
const minifyHTML = (filePath) => {
  try {
    const code = fs.readFileSync(filePath, "utf-8");
    const result = htmlMinifier(code, {
      collapseWhitespace: true,
      removeComments: true,
      removeEmptyAttributes: true,
      minifyCSS: true,
      minifyJS: true,
    });
    return result;
  } catch (err) {
    console.error(`Error minifying HTML file ${filePath}:`, err);
    return null;
  }
};

// Save minified file as `.min.ext`
const saveMinifiedFile = (filePath, content) => {
  const dir = path.dirname(filePath);
  const base = path.basename(filePath, path.extname(filePath));
  const ext = path.extname(filePath);
  const minifiedFilePath = path.join(dir, `${base}.min${ext}`);

  fs.writeFileSync(minifiedFilePath, content);
  console.log(`Minified file saved as: ${minifiedFilePath}`);
};

// Minify all files in a directory recursively
const minifyDirectory = (dirPath) => {
  fs.readdirSync(dirPath).forEach((file) => {
    const filePath = path.join(dirPath, file);

    // Skip certain directories or files
    if (file.startsWith("node_modules") || file.startsWith("vendor")) {
      return;
    }

    if (fs.lstatSync(filePath).isDirectory()) {
      minifyDirectory(filePath); // Recurse into subdirectories
    } else {
      const extname = path.extname(filePath);
      let minifiedContent = null;

      if (extname === ".js") {
        minifiedContent = minifyJS(filePath);
      } else if (extname === ".css") {
        minifiedContent = minifyCSS(filePath);
      } else if (extname === ".html") {
        minifiedContent = minifyHTML(filePath);
      } else {
        return; // Skip unsupported file types
      }

      if (minifiedContent) {
        saveMinifiedFile(filePath, minifiedContent);
      }
    }
  });
};

// Main script execution
const publicDir = path.join(__dirname, "public");
console.log(`Starting minification in directory: ${publicDir}`);
minifyDirectory(publicDir);
console.log("Minification completed.");
