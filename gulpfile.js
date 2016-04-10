var gulp  = require('gulp');
var sass = require('gulp-sass');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var clean = require('gulp-clean');
var jshint = require('gulp-jshint');
var mainBowerFiles = require('main-bower-files');
var filter = require('gulp-filter');
var merge = require('merge-stream');

gulp.task('scss', function() {
    return gulp
        .src('./styles/src/*.scss')
        .pipe(sass({outputStyle: 'compressed'}))
        .pipe(gulp.dest('./styles/dist'));
});

gulp.task('js:timer', function() {
    return gulp
        .src(['./scripts/src/libs/events.js',
              './scripts/src/libs/ripple.js',
              './scripts/src/libs/sticky_hover_fix.js',
              './scripts/src/timer_*.js'])
        .pipe(concat('timer.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./scripts/dist'));
});

gulp.task('lint', function() {
    return gulp
        .src('./scripts/src/**/*.js')
        .pipe(jshint());
});

gulp.task('importLibs', function(){
    var scripts = gulp
        .src(mainBowerFiles(), {base: 'bower_components'})
        .pipe(filter('**/*.js'))
        .pipe(concat('core_libs.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./scripts/dist/libs'));

    var styles = gulp
        .src('./bower_components/normalize-css/normalize.css')
        .pipe(rename('_normalize.scss'))
        .pipe(gulp.dest('./styles/src/partials'));

    return merge(scripts, styles);
});

gulp.task('clean', function() {
    return gulp
        .src(['./scripts/dist', './styles/dist'])
        .pipe(clean());
});

gulp.task('watch', function() {
    gulp.watch('./scripts/src/*.js', ['js']);
    gulp.watch('./styles/src/*.js', ['scss']);
});

gulp.task('js', ['importLibs', 'js:timer'], function() {
    return gulp
        .src(['./scripts/src/*.js', '!./scripts/src/_*.js'])
        .pipe(uglify())
        .pipe(gulp.dest('./scripts/dist'));
});

gulp.task('default', ['scss', 'js', 'lint']);
