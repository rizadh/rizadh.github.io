var Keypad = (function() {
    'use strict';

    var keypad;

    function init() {
        keypad = $('#keypad');

        $.Velocity.hook(keypad, 'translateX', '-50%');
        $.Velocity.hook(keypad, 'scaleX', 0.5);
        $.Velocity.hook(keypad, 'scaleY', 0);
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
                scaleX: 0,
                scaleY: 0,
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
                // Emphasize y-axis animation
                scaleX: [1, 0.5],
                scaleY: 1,
                opacity: 1
            }, {
                easing: globals.EASE_OUT,
                duration: globals.ANIMATION_DURATION,
                display: 'table'
            });
    }

    Events.subscribe('startup.normal', function() {
        keypad.velocity({
            opacity: 1,
            scaleX: 1,
            scaleY: 1
        }, {
            easing: globals.EASE_OUT,
            duration: globals.ANIMATION_DURATION
        });
    });

    Events.subscribe('start', shrink);
    Events.subscribe('edit', expand);

    return {
        init: init
    };
})();
