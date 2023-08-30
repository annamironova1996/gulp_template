const gulp = require("gulp");

const fileInclude = require("gulp-file-include");

const sass = require("gulp-sass")(require("sass"));

const server = require("gulp-server-livereload");

const clean = require("gulp-clean");

const fs = require("fs");

const sourceMaps = require("gulp-sourcemaps");

/* const groupMedia = require("gulp-group-css-media-queries"); */

const plumber = require("gulp-plumber");

const notify = require("gulp-notify");

const webpack = require("webpack-stream");

const babel = require("gulp-babel");

const imagemin = require("gulp-imagemin");

const changed = require("gulp-changed");

const sassGlob = require("gulp-sass-glob");

gulp.task("html", function () {
  return gulp
    .src(["./src/html/**/*.html", "!./src/html/blocks/*.html"])
    .pipe(changed("./dist/"))
    .pipe(
      plumber({
        errorHandler: notify.onError({
          title: "HTML",
          message: "Error <%=error.message %>",
          sound: false,
        }),
      })
    )
    .pipe(
      fileInclude({
        prefix: "@@",
        basepath: "@file",
      })
    )
    .pipe(gulp.dest("./dist/"));
});

gulp.task("sass", function () {
  return (
    gulp
      .src("./src/scss/*.scss")
      .pipe(changed("./dist/css/"))
      .pipe(
        plumber({
          errorHandler: notify.onError({
            title: "styles",
            message: "Error <%=error.message %>",
            sound: false,
          }),
        })
      )
      .pipe(sourceMaps.init())
      .pipe(sassGlob())
      .pipe(sass())
      /* .pipe(groupMedia()) */
      .pipe(sourceMaps.write())
      .pipe(gulp.dest("./dist/css/"))
  );
});

gulp.task("images", function () {
  return gulp
    .src("./src/img/**/*")
    .pipe(changed("./dist/img/"))
    .pipe(imagemin({ verbose: true }))
    .pipe(gulp.dest("./dist/img/"));
});

gulp.task("fonts", function () {
  return gulp
    .src("./src/fonts/**/*")
    .pipe(changed("./dist/fonts/"))
    .pipe(gulp.dest("./dist/fonts/"));
});

gulp.task("files", function () {
  return gulp
    .src("./src/files/**/*")
    .pipe(changed("./dist/files/"))
    .pipe(gulp.dest("./dist/files/"));
});

gulp.task("js", function () {
  return gulp
    .src("./src/js/*.js")
    .pipe(changed("./dist/js/"))
    .pipe(
      plumber({
        errorHandler: notify.onError({
          title: "js",
          message: "Error <%=error.message %>",
          sound: false,
        }),
      })
    )
    .pipe(
      babel({
        presets: ["@babel/preset-env"],
      })
    )
    .pipe(webpack(require("./webpack.config.js")))
    .pipe(gulp.dest("./dist/js"));
});

gulp.task("server", function () {
  return gulp.src("./dist/").pipe(
    server({
      livereload: true,
      open: true,
    })
  );
});

gulp.task("clean", function (done) {
  if (fs.existsSync("dist")) {
    return gulp.src("./dist/", { read: false }).pipe(clean({ forse: true }));
  }
  done();
});

gulp.task("watch", function () {
  gulp.watch("./src/scss/**/*.scss", gulp.parallel("sass"));
  gulp.watch("./src/**/*.html", gulp.parallel("html"));
  gulp.watch("./src/img/**/*", gulp.parallel("images"));
  gulp.watch("./src/fonts/**/*", gulp.parallel("fonts"));
  gulp.watch("./src/files/**/*", gulp.parallel("files"));
  gulp.watch("./src/js/**/*", gulp.parallel("js"));
});

gulp.task(
  "default",
  gulp.series(
    "clean",
    gulp.parallel("html", "sass", "images", "fonts", "files", "js"),
    gulp.parallel("server", "watch")
  )
);
