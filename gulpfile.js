var gulp  = require('gulp');
var plugins = require('gulp-load-plugins')({
    pattern: ['gulp-*', 'gulp.*', 'main-bower-files', 'merge-stream']
});

gulp.task('scss', function() {
    processors = [
        require('autoprefixer')(),
        require('pixrem')(),
        require('cssnano')()
    ];

    return gulp
        .src('./styles/src/*.scss')
        .pipe(plugins.sass({outputStyle: 'compressed'}))
        .pipe(plugins.postcss(processors))
        .pipe(gulp.dest('./styles/dist'));
});

gulp.task('lint', function() {
    return gulp
        .src('./scripts/src/**/*.js')
        .pipe(plugins.jshint());
});

gulp.task('importLibs', function(){
    var js_filter = plugins.filter(
        ['**/jquery.js', '**/velocity*.js', '**/fastclick.js'],
        { restore: true }
    );

    return gulp
        .src(plugins.mainBowerFiles(), {base: 'bower_components'})
        .pipe(js_filter)
        .pipe(plugins.concat('core_libs.js'))
        .pipe(plugins.uglify())
        .pipe(gulp.dest('./scripts/dist/libs'))
        .pipe(js_filter.restore)
        .pipe(plugins.filter('**/normalize.css'))
        .pipe(plugins.rename('_normalize.scss'))
        .pipe(gulp.dest('./styles/src/partials'));
});

gulp.task('clean', function() {
    return gulp
        .src(['./scripts/dist', './styles/dist'])
        .pipe(plugins.clean());
});

gulp.task('watch', function() {
    gulp.watch('./scripts/src/*.js', ['js']);
    gulp.watch('./styles/src/*.js', ['scss']);
});

gulp.task('js', function() {
    var general = gulp
        .src(['./scripts/src/*.js', '!./scripts/src/_*.js'])
        .pipe(plugins.uglify())
        .pipe(gulp.dest('./scripts/dist'));

    var timer = gulp
            .src(['./scripts/src/libs/events.js',
                  './scripts/src/libs/ripple.js',
                  './scripts/src/libs/sticky_hover_fix.js',
                  './scripts/src/_timer_*.js'])
            .pipe(plugins.concat('timer.js'))
            .pipe(plugins.uglify())
            .pipe(gulp.dest('./scripts/dist'));

    return plugins.mergeStream(general, timer);
});

gulp.task('default', plugins.sequence(
    'clean',
    'importLibs',
    ['lint', 'js', 'scss']
));
gulp.task('quick', ['js', 'scss']);
