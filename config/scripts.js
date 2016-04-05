module.exports.tasks = {
    watch: {
        js: {
            files: ['js/*.js', '!js/*.min.js'],
            tasks: ['newer:jshint', 'newer:js']
        }
    },
    uglify: {
        dist: {
            options: {
                sourceMap: true
            },
            files: [{
                expand: true,
                cwd: 'js/',
                src: ['*.js', '!*.min.js'],
                dest: 'js/',
                ext: '.min.js'
            }]
        }
    },
    jshint: {
        files: ['js/*.js', '!js/*.min.js', 'Gruntfile.js', '!js/libraries.js'],
        options: {
            browser: true,
            globals: {
                '$': false,
                FastClick: false
            }
        }
    }
};
