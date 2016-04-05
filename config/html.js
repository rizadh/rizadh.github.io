module.exports.tasks = {
    watch: {
        html: {
          files: ['*.html'],
          tasks: ['newer:htmllint']
        }
    },
    htmllint: {
        all: ['*.html', '!index.html']
    }
};
