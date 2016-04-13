var Events = (function(){
    var topics = {};
    return {
        subscribe: function(topic, listener) {
            if (!(topic in topics)) topics[topic] = [];
            var index = topics[topic].push(listener) -1;
            return {
                remove: function() {
                    delete topics[topic][index];
                }
            };
        },
        publish: function(topic, info) {
            if (!(topic in topics)) return;
            topics[topic].forEach(function(item) {
                item(info || {});
            });
        }
    };
})();
