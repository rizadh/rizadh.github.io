var EditButton = (function() {
    'use strict';

    var button;

    function init() {
        button = $('#edit-button');
        button.click(App.editTime);
    }

    function slideIn() {
        button
            .velocity('stop')
            .velocity({
                translateY: [0, '100%'],
                opacity: [1, 0]
            }, {
                easing: globals.EASE_OUT,
                duration: globals.ANIMATION_DURATION,
                display: 'block'
            });
    }

    function zoomOut() {
        button
            .velocity('stop')
            .velocity({
                opacity: 0,
                translateY: '-700%'
            }, {
                easing: globals.EASE_OUT,
                display: 'none',
                duration: globals.ANIMATION_DURATION,
                complete: function() {
                    $.Velocity.hook($(this), 'translateY', '0');
                }
            });
    }

    Events.subscribe('start', slideIn);
    Events.subscribe('edit', zoomOut);

    return {
        init: init
    };
})();
