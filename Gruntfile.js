module.exports = function(grunt) {
    require('load-grunt-tasks')(grunt);
    require('time-grunt')(grunt);

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        sass: {
            dist: {
                files: [
                    {
                        expand: true,
                        cwd: 'scss/',
                        src: ['*.scss'],
                        dest: 'css/',
                        ext: '.css'
                    }
                ]
            }
        },

        uglify: {
            dist: {
                options: {
                    sourceMap: true
                },
                files: [
                    {
                        expand: true,
                        cwd: 'js/',
                        src: ['*.js', '!*.min.js'],
                        dest: 'js/',
                        ext: '.min.js'
                    }
                ]
            }
        },

        watch: {
            scss: {
                files: ['scss/*.scss'],
                tasks: ['newer:sass', 'newer:postcss']
            },
            js: {
                files: ['js/*.js', '!js/*.min.js'],
                tasks: ['newer:uglify:dist']
            }
        },

        jshint: {
            files: ['js/*.js', '!js/*.min.js', 'Gruntfile.js', '!js/libraries.js'],
            options: {
                browser: true,
                globals: {
                    '$': false,
                    'FastClick': false
                }
            }
        },

        htmllint: {
            all: ['*.html', '!index.html']
        },

        bower_concat: {
            all: {
                dest: 'js/libraries.js',
                include: [
                    'jquery',
                    'velocity',
                    'fastclick'
                ],
                dependencies: {
                    'velocity': 'jquery'
                },
            }
        },

        'bower-update': {
            options: {
                pickAll: true,
                forceLatest: true
            }
        },

        postcss: {
            options: {
                processors: [
                    require('pixrem')(),
                    require('autoprefixer')(),
                    require('cssnano')()
                ]
            },
            dist: {
                files: [
                    {
                        expand: true,
                        cwd: 'css/',
                        src: ['*.css'],
                        dest: 'css/',
                        ext: '.css'
                    }
                ]
            }
        },

        copy: {
            normalize: {
                src: 'bower_components/normalize-css/normalize.css',
                dest: 'scss/partials/_normalize.scss'
            }
        }
    });

    grunt.registerTask('default', ['compile']);
    grunt.registerTask('compile', ['scss', 'uglify:dist']);
    grunt.registerTask('full', ['update', 'default']);
    grunt.registerTask('scss', ['sass:dist', 'postcss:dist']);
    grunt.registerTask('update', ['bower-update', 'bower_concat', 'copy:normalize']);
    grunt.registerTask('lint', ['htmllint', 'jshint']);
};
