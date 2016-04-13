var gulp  = require('gulp');
var plugins = require('gulp-load-plugins')({
    pattern: ['gulp-*', 'gulp.*', 'main-bower-files', 'merge-stream']
});

gulp.task('scss', function() {
    return gulp
        .src('./src/scss/*.scss')
        .pipe(plugins.sass())
        .pipe(plugins.postcss([
            require('autoprefixer')(),
            require('pixrem')(),
            require('cssnano')()
        ]))
        .pipe(gulp.dest('./dist/css/'));
});

gulp.task('lint', function() {
    return gulp
        .src('./src/js/**/*.js')
        .pipe(plugins.jshint());
});

gulp.task('importLibs', function(){
    var jsFilter = plugins.filter('**/+(jquery|velocity|fastclick)*.js', {
        restore: true
    });

    return gulp
        .src(plugins.mainBowerFiles(), {base: 'bower_components'})
        .pipe(jsFilter)
        .pipe(plugins.concat('core_libs.js'))
        .pipe(plugins.uglify())
        .pipe(gulp.dest('./dist/js/libs/'))
        .pipe(jsFilter.restore)
        .pipe(plugins.filter('**/normalize.css'))
        .pipe(plugins.rename('_normalize.scss'))
        .pipe(gulp.dest('./src/scss/partials/'));
});

gulp.task('clean', function() {
    return gulp
        .src(['./dist'])
        .pipe(plugins.clean());
});

gulp.task('watch', function() {
    gulp.watch('./src/js/**/*.js', ['js']);
    gulp.watch('./src/scss/**/*.scss', ['scss']);
    gulp.watch('./src/jade/**/*.jade', ['jade']);
});

gulp.task('js', function() {
    return plugins.mergeStream(
        gulp
            .src([
                './src/js/*.js',
                '!**/_*.js'
            ])
            .pipe(plugins.uglify())
            .pipe(gulp.dest('./dist/js/')),
        gulp
            .src([
                './src/js/libs/events.js',
                './src/js/libs/ripple.js',
                './src/js/libs/sticky_hover_fix.js',
                './src/js/_timer_*.js'
            ])
            .pipe(plugins.concat('timer.js'))
            .pipe(plugins.uglify())
            .pipe(gulp.dest('./dist/js/'))
    );
});

gulp.task('jade', function() {
    return gulp
        .src('./src/jade/*.jade')
        .pipe(plugins.jade())
        .pipe(gulp.dest('./dist/'));
});

gulp.task('default',
    plugins.sequence('clean', 'importLibs', ['jade', 'lint', 'js', 'scss'])
);
gulp.task('quick', ['js', 'scss']);
