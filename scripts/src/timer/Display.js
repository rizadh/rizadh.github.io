var Display = (function() {
    'use strict';

    var display;

    function init() {
        display = $('#display');
        // Represents if keypad is displayed
        display.data('inputMode', true);
    }

    function expand() {
        display
            .velocity('stop')
            .velocity({
                height: '90%',
                translateY: 0
            }, {
                duration: globals.ANIMATION_DURATION,
                easing: globals.EASE_OUT
            });
    }

    function shrink() {
        display
            .data('inputMode', true)
            .data('paused', false)
            .removeClass('running')
            .velocity('stop')
            .velocity({
                height: '20%'
            }, {
                duration: globals.ANIMATION_DURATION,
                easing: globals.EASE_OUT,
            });
    }

    function done() {
        display.removeClass('running');
    }

    Events.subscribe('startup.given', function() {
        $.Velocity.hook(display, 'translateY', '-100%');
    });

    Events.subscribe('startup.normal', function() {
        $.Velocity.hook(display, 'height', '100%');
        display.velocity({
            height: '20%'
        }, {
            easing: globals.EASE_OUT,
            duration: globals.ANIMATION_DURATION,
            complete: function() {
                var timeStarted = parseInt(localStorage.getItem('timeStarted'));
                var durationSet = parseInt(localStorage.getItem('durationSet'));
                if (timeStarted && durationSet) {
                    var timeThresholdSec = 5;
                    if (timeLeft() > timeThresholdSec * 1000) {
                        var message = 'Seems like the timer was still running' +
                            ' when you last closed this app. Do you want to' +
                            ' restore the timer?';
                        var noButton = {
                            text: 'No',
                            style: 'alert',
                            clickFunction: function () {
                                localStorage.setItem('timeStarted', '0');
                                localStorage.setItem('durationSet', '0');
                            }
                        };
                        var sureButton = {
                            text: 'Sure',
                            style: 'emphasize',
                            clickFunction: function () {
                                var progress = 1 - timeLeft() / durationSet;
                                if (timeLeft() > 0) {
                                    $('#dial-ring path')
                                        .data('timeLeft', timeLeft())
                                        .data('progress', progress);
                                    App.startTimer(false, true);
                                } else {
                                    NotificationBanner.show(
                                        'Too late, the timer has already ended'
                                    );
                                }
                            }
                        };
                        NotificationBanner.show(message, [noButton, sureButton]);
                    }
                }

                /** Returns time left until previous timer ends */
                function timeLeft() {
                    return (timeStarted + durationSet) - (new Date()).getTime();
                }
            }
        });
    });

    Events.subscribe('start', expand);
    Events.subscribe('edit', shrink);
    Events.subscribe('done', done);

    return {
        init: init,
        get inputMode() {
            return display.data('inputMode');
        },
        set inputMode(mode) {
            if (mode) {
                display.data('inputMode', true).data('paused', false).removeClass('running');
            } else {
                display.data('inputMode', false).addClass('running');
            }
        },
        get paused() {
            return display.data('paused');
        },
        set paused(state) {
            display.data('paused', state);
        },
        get running() {
            return display.hasClass('running');
        },
        done: done
    };
})();
