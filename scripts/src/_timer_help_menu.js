var HelpMenu = (function() {
    'use strict';

    var menu;

    function init() {
        menu = $('#keyboard-help');

        $.Velocity.hook(menu, 'translateX', '-50%');
        $.Velocity.hook(menu, 'translateY', '-50%');

        // Change Backspce to Delete if on Mac or iOS devices
        if (navigator.platform.match(/(Mac|iPhone|iPod|iPad)/i)) {
            menu.find('.delete').text('Delete');
        }
    }



    function toggle(forceState) {
        if (arguments.length === 0) {
            var show = !menu.data('shown');

            menu
                .data('shown', show)
                .velocity('stop')
                .velocity({
                    scaleY: (show ? [1, 0] : [0, 1]),
                    scaleX: (show ? [1, 0.5] : [0, 1]),
                    opacity: (show ? [1, 0] : [0, 1])
                }, {
                    easing: show ? globals.EASE_OUT : globals.EASE_IN,
                    display: show ? 'block' : 'none',
                    duration: (show ? globals.ANIMATION_DURATION : globals.ANIMATION_DURATION / 2)
                });
        } else if ((menu.data('shown') || false) !== forceState){
            toggle();
        }
    }

    return {
        init: init,
        toggle: toggle
    };
})();
