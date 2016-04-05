module.exports.tasks = {
    watch: {
        js: {
            files: ['scripts/src/**.js'],
            tasks: ['newer:jshint', 'newer:uglify']
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
            src: ['scripts/src/libs/core_libs.js', 'scripts/src/libs/events.js', 'scripts/src/libs/ripple.js', 'scripts/src/timer_*.js'],
            dest: 'scripts/dist/timer.js'
        },
        clock: {
            src: ['scripts/src/libs/core_libs.js', 'scripts/src/clock_*.js'],
            dest: 'scripts/dist/clock.js'
        },
        stars: {
            src: ['scripts/src/libs/core_libs.js', 'scripts/src/stars_*.js'],
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
        }
    },
    jshint: {
        files: 'scripts/src/*.js',
        options: {
            browser: true,
            globals: {
                '$': false,
                FastClick: false
            }
        }
    }
};
