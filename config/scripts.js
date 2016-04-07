module.exports.tasks = {
    watch: {
        js: {
            files: ['scripts/src/**/*.js'],
            tasks: ['newer:jshint', 'newer:concat', 'newer:uglify']
        }
    },
    bower_concat: {
        all: {
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
                  'scripts/src/timer/*.js'],
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
    }
};
