var Keypad = (function() {
    'use strict';

    var keypad;

    function init() {
        keypad = $('#keypad');

        $.Velocity.hook(keypad, 'translateX', '-50%');
        $.Velocity.hook(keypad, 'translateY', '20%');
        $.Velocity.hook(keypad, 'opacity', 0);

        // Set click events
        keypad.on('click', 'td', function () {
            var keyValue = $(this).text();
            if (keyValue === 'Clear') {
                DisplayText.setTime('');
            } else if (keyValue === 'Start') {
                App.startTimer();
            } else {
                DisplayText.addDigit(keyValue);
            }
        });
    }

    function shrink() {
        keypad
            .velocity('stop')
            .velocity({
                translateY: '20%',
                opacity: 0
            }, {
                easing: globals.EASE_OUT,
                duration: globals.ANIMATION_DURATION,
                display: 'none'
            });
    }

    function expand() {
        keypad
            .velocity('stop')
            .velocity({
                translateY: 0,
                opacity: 1
            }, {
                easing: globals.EASE_OUT,
                duration: globals.ANIMATION_DURATION,
                display: 'table'
            });
    }

    Events.subscribe('startup.normal', expand);
    Events.subscribe('start', shrink);
    Events.subscribe('edit', expand);

    return {
        init: init
    };
})();
