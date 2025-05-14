"use strict";

const gulp = require("gulp");
const nunjucksRender = require("gulp-nunjucks-render");
const plumber = require("gulp-plumber");
const notify = require("gulp-notify");
const fileinclude = require("gulp-file-include");
const sass = require("gulp-sass")(require("sass"));
const sourcemaps = require("gulp-sourcemaps");
const autoprefixer = require("gulp-autoprefixer");
const bs = require("browser-sync").create();
const rimraf = require("rimraf");
const comments = require("gulp-header-comment");
const jshint = require("gulp-jshint");
const rename = require("gulp-rename");
const fs = require("fs");
const yaml = require("js-yaml");

var path = {
  src: {
    html: "source/*.html",
    njk: "source/*.njk",
    htminc: "source/partials/**/*.htm",
    yml: "source/data/*.yml",
    incdir: "source/partials/",
    docs: "source/docs/**/*.htm",
    scss: "source/scss/**/*.scss",
    js: "source/js/*.js",
    images: "source/images/**/*.+(png|jpg|gif|svg)",
    fonts: "source/fonts/**/*.+(eot|ttf|woff|woff2|otf)",
    plugins: "plugins/**/*",  // Ajout pour surveiller les plugins
  },
  build: {
    dir: "theme/",
  },
};

// Clean Task
gulp.task("clean", function (done) {
  rimraf(path.build.dir, done);
});

// HTML avec Nunjucks
gulp.task("nunjucks", function () {
  return gulp
    .src(path.src.njk)
    .pipe(plumber({ errorHandler: notify.onError("Erreur: <%= error.message %>") }))
    .pipe(nunjucksRender({ 
      path: ["source/partials"],
     }))
    .pipe(gulp.dest(path.build.dir))
    .pipe(bs.reload({ stream: true }))
    .on('data', function(file) {
      console.log("Rendu de Nunjucks : ", file.path);  // Log pour vérifier le fichier rendu
    });
});

// Tâche “docs”
gulp.task("docs", function() {
  return gulp
    .src("source/docs/**/*.njk")              // 1) tous les NJK
    .pipe(plumber({ /* … */ }))
    .pipe(nunjucksRender({
      path: ["source/partials", "source/docs"]
    }))                                        // 2) rendu Nunjucks
    .pipe(rename({ extname: ".html" }))        // 3) .njk → .html
    .pipe(gulp.dest(path.build.dir + "docs/")) // 4) vers theme/docs/
    .pipe(bs.reload({ stream: true }));
});

// Tâche JS - Construction des fichiers JavaScript
gulp.task("js:build", function () {
  return gulp
    .src(path.src.js)
    .pipe(plumber({ errorHandler: notify.onError("Erreur: <%= error.message %>") }))
    .pipe(jshint())
    .pipe(jshint.reporter("default"))
    .pipe(gulp.dest(path.build.dir + "js/"))
    .pipe(bs.reload({ stream: true }));
});

// Tâche SCSS - Compilation des fichiers SCSS
gulp.task("scss:build", function () {
  return gulp
    .src(path.src.scss)
    .pipe(plumber({ errorHandler: notify.onError("Erreur: <%= error.message %>") }))
    .pipe(sourcemaps.init())
    .pipe(sass({ outputStyle: "expanded" }).on("error", sass.logError))
    .pipe(autoprefixer({ cascade: false }))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(path.build.dir + "css/"))
    .pipe(bs.reload({ stream: true }));
});

// Tâche Images - Traitement des images
gulp.task("images:build", function () {
  return gulp
    .src(path.src.images)
    .pipe(gulp.dest(path.build.dir + "images/"))
    .pipe(bs.reload({ stream: true }));
});

// Tâche Fonts - Traitement des polices
gulp.task("fonts:build", function () {
  return gulp
    .src(path.src.fonts)
    .pipe(gulp.dest(path.build.dir + "fonts/"))
    .pipe(bs.reload({ stream: true }));
});

// Tâche HTML - Copie des fichiers HTML
gulp.task('html:build', function() {
  return gulp.src('source/*.html')
    .pipe(gulp.dest('theme/'));
});

// Tâche pour copier les plugins
gulp.task("plugin:build", () => {
  return gulp.src('plugins/**/*')  // Sélectionner tous les fichiers du dossier plugins
    .pipe(gulp.dest('theme/plugins')); // Copier les fichiers dans theme/plugins
});

// Tâche pour lire le fichier YML et afficher son contenu
gulp.task('read-yml', function (done) {
  try {
    const filePath = "source/data/documentation.yml";  // Utilise le chemin défini dans path.src.yml
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const ymlData = yaml.load(fileContents);  // Charge le fichier YAML en tant qu'objet JavaScript

    // Génère un fichier JS avec les données YAML
    const jsData = `export const ymlData = ${JSON.stringify(ymlData)};`;

    // Crée un fichier JS dans le dossier de build
    fs.writeFileSync('source/js/ymlData.js', jsData);

    console.log('Fichier ymlData.js généré avec succès');
  } catch (e) {
    console.log(e);
  }
  done();
});

// Watch Task
gulp.task("watch:build", function () {
  gulp.watch(path.src.html, gulp.series("html:build"));  
  gulp.watch(path.src.njk, gulp.series("nunjucks"));
  gulp.watch(path.src.docs, gulp.series("nunjucks"));
  gulp.watch(path.src.htminc, gulp.series("html:build"));
  gulp.watch(path.src.scss, gulp.series("scss:build"));
  gulp.watch(path.src.js, gulp.series("js:build"));
  gulp.watch(path.src.images, gulp.series("images:build"));
  gulp.watch(path.src.fonts, gulp.series("fonts:build"));
  gulp.watch(path.src.plugins, gulp.series("plugin:build"));  
  gulp.watch(path.src.plugins, gulp.series("read-yml")); 
});

// Dev Task
gulp.task(
  "default",
  gulp.series(
    "clean",
    "nunjucks",
    "docs",  
    "read-yml",
    "js:build",
    "scss:build",
    "images:build",
    "fonts:build",
    "html:build",  
    "plugin:build",    
    gulp.parallel("watch:build", function () {
      bs.init({
        server: {
          baseDir: path.build.dir,
        },
        host: '0.0.0.0', // Écouter sur toutes les interfaces
        port: 3000, // Port utilisé
        open: false, // Ne pas ouvrir automatiquement dans le navigateur
        notify: false // Désactive les notifications de BrowserSync
      });
    })
  )
);
