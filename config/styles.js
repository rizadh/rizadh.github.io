module.exports.tasks = {
    watch: {
        scss: {
            files: ['scss/*.scss'],
            tasks: ['newer:scss']
        }
    },
    sass: {
        dist: {
            files: [{
                expand: true,
                cwd: 'scss/',
                src: ['*.scss'],
                dest: 'css/',
                ext: '.css'
            }]
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
    }
};
