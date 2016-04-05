module.exports.tasks = {
    'bower-update': {
        options: {
            pickAll: true,
            forceLatest: true
        }
    },
    bower_concat: {
        all: {
            dest: 'js/libraries.js',
            include: ['jquery', 'velocity', 'fastclick'],
            dependencies: {
                velocity: 'jquery'
            }
        }
    },
    copy: {
        normalize: {
          src: 'bower_components/normalize-css/normalize.css',
          dest: 'scss/partials/_normalize.scss'
        }
    }
};
