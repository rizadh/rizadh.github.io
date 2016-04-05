module.exports.tasks = {
    watch: {
        html: {
          iles: ['*.html'],
          tasks: ['newer:htmllint']
        }
    },
    htmllint: {
        all: ['*.html', '!index.html']
    }
};
