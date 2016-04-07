var DialRing = (function() {
    'use strict';
    // SVG arcs cannot form a complete circle so a value close to 1 is used
    var WHOLECIRCLE = 0.99999;

    var dial, path;

    function init() {
        dial = $('#dial-ring');
        path = $('#dial-ring path');
    }

    function scaleIn() {
        dial
            .velocity('stop')
            .velocity({
                opacity: [1, 0],
                scale: [1, 0]
            }, {
                easing: globals.EASE_OUT,
                duration: globals.ANIMATION_DURATION,
                display: 'block'
            });
    }

    function fadeOut() {
        dial
            .velocity('stop')
            .velocity('fadeOut', 100);
    }

    function fadeIn() {
        dial
            .velocity('stop')
            .velocity({
                opacity: 1
            }, {
                easing: globals.EASE_OUT,
                duration: globals.ANIMATION_DURATION
            });
    }

    function halfFade() {
        $('#dial-ring')
            .velocity('stop')
            .velocity({
                opacity: 0.25
            }, {
                easing: globals.EASE_OUT,
                duration: globals.ANIMATION_DURATION
            });
    }

    /**
     * Initiate the timer
     * @param {number} sec - Number of seconds to time
     * @param {boolean} resume - If true, timer will resume from stored state
     */
    function wind(sec, resume) {
        // Convert seconds to milliseconds
        var dialTime = resume ? path.data('timeLeft') : sec * 1000;
        var initialProgress = resume ? path.data('progress') : 0;

        path
            .velocity('stop')
            .velocity({
            // Can't go to 1 with SVG arc
            tween: [WHOLECIRCLE, initialProgress]
            }, {
                duration: dialTime,
                easing: 'linear',
                begin: function () {
                    localStorage.setItem('timeStarted', (new Date()).getTime());
                    localStorage.setItem('durationSet', dialTime);
                },
                progress: function (e, c, r, s, t) {
                    // setDial($('#dial-ring path'), 40, t);
                    var boxRadius = 50;
                    var arcRadius = 40;

                    // Calculate path parameters
                    var offset = boxRadius - arcRadius;
                    var sweep = t >= 0.5 ? 1 : 0;
                    var arcPosX = offset + arcRadius * (1 + Math.sin(2 * Math.PI * t));
                    var arcPosY = offset + arcRadius * (1 - Math.cos(2 * Math.PI * t));
                    var arcPos = arcPosX + ' ' + arcPosY;
                    var arcDimensions = arcRadius + ' ' + arcRadius;
                    var arcParameters = ' 0 ' + sweep + ' 1 ';

                    // Calculate path segments
                    var moveToCenter = 'M' + boxRadius + ' ' + boxRadius;
                    var moveToStart = 'm0 ' + (-arcRadius);
                    var makeArc = 'A' + arcDimensions + arcParameters + arcPos;

                    // Set path
                    path
                        .attr('d', moveToCenter + moveToStart + makeArc)
                        .data('progress', t)
                        .data('timeLeft', r);
                    // Find seconds rounded up
                    var totalSeconds = Math.ceil(r / 1000);
                    // Find minutes rounded down
                    var minutes = Math.floor(totalSeconds / 60) % 60;
                    // Find hours rounded down
                    var hours = Math.floor(totalSeconds / 3600);
                    // Find remaining seconds
                    var seconds = totalSeconds % 60;
                    // Force 2 digits
                    seconds = ('0' + seconds).slice(-2);
                    minutes = ('0' + minutes).slice(-2);
                    hours = ('0' + hours).slice(-2);
                    var times = [hours, minutes, seconds];
                    if (r !== 0) {
                        // Send time text to display
                        DisplayText.setTime(times.join(''), 'crossfade');
                    }
                },
                complete: function () {
                    Events.publish('done');
                    localStorage.setItem('timeStarted', 0);
                    localStorage.setItem('durationSet', 0);
                }
        });
    }

    function stop() {
        path.velocity('stop');
    }

    Events.subscribe('start', scaleIn);
    Events.subscribe('edit', stop);
    Events.subscribe('edit', fadeOut);
    Events.subscribe('pause', stop);
    Events.subscribe('pause', halfFade);
    Events.subscribe('resume', fadeIn);

    return {
        init: init,
        wind: wind
    };
})();
