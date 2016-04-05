module.exports = function(grunt) {
    require('time-grunt')(grunt);
    require('jit-grunt')(grunt, {
        htmllint: 'grunt-html'
    });

    var configs = require('load-grunt-configs')(grunt);
    grunt.initConfig(configs);

    grunt.registerTask('default', ['compile']);
    grunt.registerTask('full', ['update', 'compile', 'lint']);
    grunt.registerTask('update', ['bower-update', 'bower_concat',
                                  'copy:normalize']);
    grunt.registerTask('compile', ['scss', 'js']);
    grunt.registerTask('scss', ['sass:dist', 'postcss:dist']);
    grunt.registerTask('js', ['uglify:dist']);
    grunt.registerTask('lint', ['htmllint', 'jshint']);
};
