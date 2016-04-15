var gulp  = require('gulp');
var plugins = require('gulp-load-plugins')({
    pattern: ['gulp-*', 'gulp.*', 'main-bower-files']
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

gulp.task('importJS', function() {
    return gulp
        .src(plugins.mainBowerFiles(), {base: 'bower_components'})
        .pipe(plugins.filter('**/+(jquery|velocity|fastclick)*.js'))
        .pipe(plugins.concat('core_libs.js'))
        .pipe(plugins.uglify())
        .pipe(gulp.dest('./dist/js/'));
});

gulp.task('importSCSS', function() {
    return gulp
        .src(plugins.mainBowerFiles(), {base: 'bower_components'})
        .pipe(plugins.filter('**/normalize.css'))
        .pipe(plugins.rename({dirname: ''}))
        .pipe(gulp.dest('./dist/css/'));
});

gulp.task('importResources', function() {
    return gulp
        .src('./src/resources/**/*')
        .pipe(gulp.dest('./dist/resources/'));
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
    return gulp
        .src([
            './src/js/libs/events.js',
            './src/js/libs/ripple.js',
            './src/js/libs/sticky_hover_fix.js',
            './src/js/_timer_*.js'
        ])
        .pipe(plugins.concat('timer.js'))
        .pipe(plugins.addSrc(['./src/js/!(_)*.js']))
        .pipe(plugins.uglify())
        .pipe(gulp.dest('./dist/js/'));
});

gulp.task('jade', function() {
    return gulp
        .src('./src/jade/*.jade')
        .pipe(plugins.jade())
        .pipe(gulp.dest('./dist/'));
});

gulp.task('default', plugins.sequence('clean', [
    'importResources',
    'importJS',
    'importSCSS',
    'jade',
    'lint',
    'js',
    'scss'
]));
