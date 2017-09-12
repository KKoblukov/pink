"use strict";

var gulp = require("gulp");
var less = require("gulp-less");
var plumber = require("gulp-plumber");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var server = require("browser-sync").create();
var mqpacker = require("css-mqpacker");
var minify = require("gulp-csso");
var rename = require("gulp-rename");
var imagemin = require('gulp-imagemin');
var svgmin = require("gulp-svgmin");
var svgstore = require("gulp-svgstore");
/*Для сборки в продакшн*/
var run = require("run-sequence"); /*Для запуска тасков друг за другом*/
var del = require("del");

gulp.task("style", function() {
  gulp.src("less/style.less")
      .pipe(plumber())
      .pipe(less())
      .pipe(postcss([
        autoprefixer({browsers: [
          "last 1 version",
          "last 2 Chrome versions",
          "last 2 Firefox versions",
          "last 2 Opera versions",
          "last 2 Edge versions"
        ]}),
        mqpacker({
          sort: true
        })
      ]))
      .pipe(gulp.dest("build/css"))
      .pipe(minify())
      .pipe(rename("style.min.css"))
      .pipe(gulp.dest("build/css"))
      .pipe(server.stream());
});

gulp.task("images", function() {
  return gulp.src("build/img/**/*.{png,jpg,gif}")
    .pipe(imagemin([
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.jpegtran({progressive: true})
      ]))
    .pipe(gulp.dest("build/img"));
});

gulp.task("symbols", function() {
  return gulp.src("build/img/icons/*.svg")
    .pipe(svgmin())
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(rename("symbols.svg"))
    .pipe(gulp.dest("build/img"));
});

gulp.task("serve", ["style"], function() {
  server.init({
    server: "build",
    notify: false,
    cors: true,
    open: true,
    ui: false
  });

  gulp.watch("less/**/*.less", ["style:update"]);
  gulp.watch("*.html", ["html:update"]);
  gulp.watch("js/*.js", ["js:update"]);
  //gulp.watch("build/*.html")
  //    .on("change", server.reload);
});

gulp.task("copy", function() {
  return gulp.src([
    "fonts/**/*.{woff,woff2}",
    "img/**",
    "js/*.js",
    "*.html"
  ], {
    base: "."
  })
  .pipe(gulp.dest("build"));
});

gulp.task("html:copy", function() {
  return gulp.src("*.html")
  .pipe(gulp.dest("build"));
});

gulp.task("html:update", ["html:copy"], function(done) {
  server.reload();
  done();
});

gulp.task("style:update", ["style"], function(done) {
  server.reload();
  done();
});

gulp.task("js:copy", function() {
  return gulp.src("js/*.js")
  .pipe(gulp.dest("build/js"));
});

gulp.task("js:update", ["js:copy"], function(done) {
  server.reload();
  done();
});

gulp.task("clean", function() {
  return del("build/**/*.*");
});

gulp.task("build", function(fn) {
  run(
    "clean",
    "copy",
    "style",
    "images",
    "symbols",
    fn
  );
});
