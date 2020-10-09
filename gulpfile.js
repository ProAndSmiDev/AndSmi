const gulp = require('gulp'),
  sass = require('gulp-sass'),
  pug = require('gulp-pug'),
  pugbem = require('gulp-pugbem'),
  rename = require('gulp-rename'),
  fs = require('fs'),
  csso = require('gulp-csso'),
  concat = require('gulp-concat'),
  imgMin = require('gulp-imagemin'),
  prefix = require('gulp-autoprefixer'),
  pngQuant = require('imagemin-pngquant'),
  uglJS = require('gulp-uglify'),
  uglES = require('gulp-uglify-es').default(),
  sync = require('browser-sync'),
  data = require('gulp-data'),
  ttf2woff = require('gulp-ttf2woff'),
  ttf2woff2 = require('gulp-ttf2woff2'),
  root = {
    "dev": "./app/",
    "prod": "./docs/"
  },
  dev = {
    "sass": root.dev + "assets/sass/styles.sass",
    "js": root.dev + "assets/js/*.js",
    "pug": root.dev + "views/index.pug",
    "fonts": root.dev + "assets/fonts/**/*.ttf",
    "img": root.dev + "assets/img/**/*.{jpg|jpeg|png|svg|gif|ico}",
    "data": root.dev + "data/all.json"
  },
  prod = {
    "css": root.prod + "css/",
    "js": root.prod + "js/",
    "fonts": root.prod + "fonts/",
    "img": root.prod + "img/"
  };

gulp.task("es", () => {
  gulp.src(dev.js)
    .pipe(concat("app.min.js"))
    .pipe(gulp.dest(prod.js));

  return gulp.src(dev.js)
    .pipe(concat("app.min.js"))
    .pipe(uglES)
    .pipe(gulp.dest(prod.js));
});
gulp.task("sass", () => {
  gulp.src(dev.sass)
    .pipe(sass({
      outputStyle: 'expanded',
    }).on('error', sass.logError))
    .pipe(prefix([
      '> 1%',
      'ie 8',
      'ie 7',
      'last 15 versions'
    ]))
    .pipe(rename({
      basename: 'styles',
      extname: '.css',
    }))
    .pipe(gulp.dest(prod.css));

  return gulp.src(dev.sass)
    .pipe(sass({
      outputStyle: 'compressed',
    }).on('error', sass.logError))
    .pipe(prefix([
      '> 1%',
      'ie 8',
      'ie 7',
      'last 15 versions'
    ]))
    .pipe(rename({
      basename: 'styles',
      suffix: '.min',
      extname: '.css',
    }))
    .pipe(gulp.dest(prod.css));
});
gulp.task("fonts", () => {
  gulp.src(dev.fonts)
    .pipe(ttf2woff())
    .pipe(gulp.dest(prod.fonts));

  return gulp.src(dev.fonts)
    .pipe(ttf2woff2())
    .pipe(gulp.dest(prod.fonts));
});
gulp.task("pug", () => {
  return gulp.src(dev.pug)
    .pipe(data(() => JSON.parse(fs.readFileSync(dev.data, 'utf-8'))))
    .pipe(pug({
      pretty: true, // поменять, если заказчику нужен html
      locals: dev.data,
      plugins: [pugbem],
    }))
    .pipe(gulp.dest(root.prod));
});
gulp.task("img", () => {
  return gulp.src(dev.img)
    .pipe(imgMin({
      interlaced: true,
      progressive: true,
      svgoPlugins: {removeViewBox: false},
      use: pngQuant(),
    }))
    .pipe(gulp.dest(prod.img));
});
gulp.task("watch", () => {
  gulp.watch(dev.js, gulp.series(['es']));
  gulp.watch(root.dev + '**/*.sass', gulp.series(['sass']));
  gulp.watch([dev.data, root.dev + '**/*.pug'], gulp.series(['pug']));
});
gulp.task("build", gulp.series([
  gulp.parallel([
    'img',
    'fonts'
  ]),
  gulp.parallel([
    'es',
    'pug',
    'sass',
  ]),
]));
gulp.task("serve", () => {
  sync({
    server: {
      baseDir: root.prod,
    },
    notify: false,
  });

  sync.watch(root.dev);
});
gulp.task("default", gulp.series([
  gulp.parallel('build'),
  gulp.parallel(['serve', 'watch'])
]));