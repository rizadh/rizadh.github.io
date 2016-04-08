module.exports = function(grunt) {
    require('time-grunt')(grunt);
    require('jit-grunt')(grunt, {
        htmllint: 'grunt-html'
    });

    grunt.initConfig({
        watch: {
            js: {
                files: ['scripts/src/**/*.js'],
                tasks: ['newer:concat']
            },
            scss: {
                files: ['styles/src/*.scss'],
                tasks: ['newer:scss']
            },
            html: {
              files: ['*.html'],
              tasks: ['newer:htmllint']
            }
        },
        bower_concat: {
            libs: {
                dest: 'scripts/src/libs/core_libs.js',
                include: ['jquery', 'velocity', 'fastclick'],
                dependencies: {
                    'velocity': 'jquery'
                }
            }
        },
        concat: {
            timer: {
                src: ['scripts/src/libs/events.js',
                      'scripts/src/libs/ripple.js',
                      'scripts/src/libs/sticky_hover_fix.js',
                      'scripts/src/timer_*.js'],
                dest: 'scripts/dist/timer.js'
            },
            clock: {
                src: 'scripts/src/clock_*.js',
                dest: 'scripts/dist/clock.js'
            },
            stars: {
                src: 'scripts/src/stars_*.js',
                dest: 'scripts/dist/stars.js'
            },
        },
        uglify: {
            dist: {
                files: [{
                    expand: true,
                    cwd: 'scripts/dist',
                    src: '*.js',
                    dest: 'scripts/dist',
                    ext: '.js'
                }]
            },
            libs: {
                src: 'scripts/src/libs/core_libs.js',
                dest: 'scripts/dist/libs/core_libs.js'
            }
        },
        jshint: {
            files: ['scripts/src/**/*.js', '!scripts/src/libs/**/*.js'],
            options: {
                browser: true,
                globals: {
                    '$': false,
                    FastClick: false
                }
            }
        },
        copy: {
            normalize: {
              src: 'bower_components/normalize-css/normalize.css',
              dest: 'styles/src/partials/_normalize.scss'
            }
        },
        sass: {
            options: {
                style: 'compressed',
                sourcemap: 'none'
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: 'styles/src/',
                    src: '*.scss',
                    dest: 'styles/dist/',
                    ext: '.css'
                }]
            }
        },
        'bower-update': {
            options: {
                pickAll: true,
                forceLatest: true
            }
        }
    });

    grunt.registerTask('default', ['scss', 'js']);

    grunt.registerTask('full', ['update', 'lint', 'scss', 'js']);
        grunt.registerTask('update', ['bower-update', 'bower_concat:libs', 'copy:normalize', 'uglify:libs']);
        grunt.registerTask('lint', 'jshint');
        grunt.registerTask('scss', 'sass:dist');
        grunt.registerTask('js', ['concat', 'uglify:dist']);
};
