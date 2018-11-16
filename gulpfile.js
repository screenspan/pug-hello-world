var src =   "src/",
    dest =  "dist/"




// Include gulp
var gulp = require('gulp');

// Include Our Plugins
var jshint =        require('gulp-jshint'),
    sass =          require('gulp-sass'),
    concat =        require('gulp-concat'),
    uglify =        require('gulp-uglify'),
    rename =        require('gulp-rename'),
    pug =           require('gulp-pug'),
    data =          require('gulp-data'),
    runSequence =   require('run-sequence'),
    // del =           require('del'),
    fs =            require('fs'),
    browserSync =   require ('browser-sync'),
    svgSprite =     require('gulp-svg-sprites'),
    responsive =    require('gulp-responsive');



// Sprite task
gulp.task('sprites', function () {
    return gulp.src(src + 'img/svg/*.svg')
        .pipe(svgSprite({
          preview: false,
          mode: "symbols"
        }))
        .pipe(rename("_symbols.pug"))
        .pipe(gulp.dest(src + "img/svg"));
});

// Lint Task
gulp.task('lint', function() {
    return gulp.src(src + 'js/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
})

// Compile Our Sass
gulp.task('sass', function() {
  return gulp.src(src + 'scss/*.scss')
  .pipe(sass().on('error', sass.logError))
  .pipe(gulp.dest(dest + 'css'))
  // Reload browser
  .pipe(browserSync.reload({stream: true}));
})

// Concatenate & Minify JS
gulp.task('scripts', function() {
    return gulp.src(src + 'js/*.js')
        .pipe(concat('all.js'))
        .pipe(gulp.dest(dest + 'js'))
        .pipe(rename('all.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest(dest + 'js'))
        // Reload browser
        .pipe(browserSync.reload({stream: true}));
})

// Pass through images
gulp.task('images', function() {
  return gulp.src(src + "img/**/*.*")
      .pipe(gulp.dest(dest + "img"));
});

// Compile pug files
gulp.task('templates', function buildHTML() {
  return gulp.src(src + 'pages/*.pug')
    // Get data from local JSON
    .pipe(data(function (file) {
      return JSON.parse(fs.readFileSync(src + 'data/data.json'))
    }))
  .pipe(pug({
    // Your options in here.
    pretty: true,
    verbose: false
  }))
  .pipe(gulp.dest(dest))
  // Reload browser
  .pipe(browserSync.reload({stream: true}));
})

// Resize images
gulp.task('img:resize', function () {
  return gulp.src(src + 'img/bitmaps/*.{png,jpg}')
    .pipe(responsive({
      '*': [
        {
          width: 700,
          quality: 80,
          rename: {
            suffix: '-700'
          }
        }, {
          width: 320,
          quality: 80,
          rename: {
            suffix: '-320'
          }
        }
      ]
    }))
    .pipe(gulp.dest(dest + '/img'));
});


// Watch Files For Changes
gulp.task('watch', function() {
  browserSync.init({
    server: {
      baseDir: dest
    }
  })
  console.log("===============")
  console.log("Starting Server")
  console.log("---------------")
  gulp.watch(src + 'data/*.json', ['data'])
  gulp.watch(src + 'img/**/*.*', ['images'])
  gulp.watch(src + 'img/svg/*.*', ['sprites'])
  gulp.watch(src + 'js/*.js', ['lint', 'scripts'])
  gulp.watch(src + 'scss/*.scss', ['sass'])
  gulp.watch(src + 'scss/*/*.scss', ['sass'])
  gulp.watch(src + 'templates/*.pug', ['templates'])
  gulp.watch(src + 'pages/*.pug', ['templates'])
  gulp.watch(src + '*.pug', ['templates'])
})


// Default Task
// gulp.task('default', ['lint', 'sass', 'scripts', 'templates', 'reloader'])
gulp.task('default', function(callback){
    runSequence(['images', 'lint', 'sass', 'scripts', 'sprites', 'templates'], ['watch'], callback)
  }
)

// Build task
gulp.task('build', function (callback) {
  runSequence(['img:resize', 'lint', 'sass', 'scripts', 'sprites', 'templates'], callback)
  }
)