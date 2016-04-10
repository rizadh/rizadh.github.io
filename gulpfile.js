var gulp  = require('gulp');
var sass = require('gulp-sass');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var clean = require('gulp-clean');
var jshint = require('gulp-jshint');
var mainBowerFiles = require('main-bower-files');
var filter = require('gulp-filter');

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

gulp.task('js:clock', function() {
    return gulp
        .src('./scripts/src/clock_*.js')
        .pipe(uglify())
        .pipe(rename('clock.js'))
        .pipe(gulp.dest('./scripts/dist'));
});

gulp.task('js:stars', function() {
    return gulp
        .src('./scripts/src/stars_*.js')
        .pipe(uglify())
        .pipe(rename('stars.js'))
        .pipe(gulp.dest('./scripts/dist'));
});

gulp.task('lint', function() {
    return gulp
        .src('./scripts/src/**/*.js')
        .pipe(jshint());
});

gulp.task('importLibs:js', function(){
    var scripts =  gulp
        .src(mainBowerFiles(), {base: 'bower_components'})
        .pipe(filter('./**/*.js'))
        .pipe(concat('core_libs.js'))
        .pipe(uglify())
        .pipe(gulp.dest('scripts/dist/libs'));

    var styles = gulp
        .src('./bower_components/normalize-css/normalize.css')
        .pipe(rename('_normalize.scss'))
        .pipe(gulp.dest('./styles/src/partials'));
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

gulp.task('js', ['importLibs:js', 'js:timer', 'js:clock', 'js:stars']);
gulp.task('default', ['scss', 'js']);
