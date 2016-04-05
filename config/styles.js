module.exports.tasks = {
    watch: {
        scss: {
            files: ['styles/src/*.scss'],
            tasks: ['newer:scss']
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
            update: true,
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
                    cwd: 'styles/dist/',
                    src: '*.css',
                    dest: 'styles/dist/',
                    ext: '.css'
                }
            ]
        }
    }
};
