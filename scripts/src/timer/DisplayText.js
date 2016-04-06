var DisplayText = (function() {
    'use strict';

    var displayText;

    function init() {
        displayText = $('#display-text');

        // Clear display and show default message
        displayText.data('currentTime', '000000');
        $.Velocity.hook(displayText, 'translateX', '-50%');
        $.Velocity.hook(displayText, 'translateY', '-50%');

        displayText.click(App.togglePause);
    }

    Events.subscribe('startup.normal', function() {
        $.Velocity.hook(displayText, 'opacity', 0);
        displayText.velocity({
            opacity: 1
        }, {
            easing: globals.EASE_OUT,
            duration: globals.ANIMATION_DURATION
        });
    });

    Events.subscribe('edit', function() {
        setTime(displayText.data('currentTime'), 'crossfade');
    });

    Events.subscribe('done', function() {
        setTime('Done', 'crossfade');
    });

    /** Check if the supplied number represents a displayable amount of time */
    function validateTime(timeString) {
        var hoursToSeconds = timeString.slice(-6, -4) * 3600;
        var minutesToSeconds = timeString.slice(-4, -2) * 60;
        var seconds = timeString.slice(-2) * 1;
        var totalSeconds = hoursToSeconds + minutesToSeconds + seconds;
        return totalSeconds > 0 && totalSeconds < 360000;
    }

    /**
     * Sets the display time
     * @param (string) text - Value to be set
     * @param {string} style - Determines style of animation used
     */
    function setTime(text, style) {
        // Determines whether display needs to be updated
        var update = false;
        // New text to be show on display
        var newText = '';
        // New font size of display
        var newFontSize = '1rem';
        // 6-digit represntation of stored display time
        var currentTime = '';
        // jQuery variables for easy access
        var oldDisplayText = $('#display-text').clone(true).attr('id', 'display-text-old');

        // Handle special cases
        switch (text) {
            case '000000': // Handle zero input
            case '': // Handle empty input
                text = '0s';
            /* falls through */
            case 'Done': // Handle timer completion
                currentTime = '000000';
            /* falls through */
            case 'Paused': // Handle timer pause
                newText = text;
                update = true;
                break;
            default: // Handle regular text change (timing or inputting)
                if (displayText.data('currentTime') !== text ||
                    displayText.text() === 'Paused') {
                    var timeArray = [];
                    var unitArray = ['h', 'm', 's'];
                    for (var i = 0; i < 3; i++) {
                        var timeValue = text.slice(2 * i, 2 * i + 2);
                        if (timeValue > 0 || timeArray[0] || i === 2) {
                            if (timeValue < 10 && !timeArray[0]) {
                                timeValue = timeValue.slice(-1);
                            }
                            timeArray.push(timeValue + unitArray[i]);
                        }
                    }
                    var newTime = timeArray.join(' ');

                    // Shrink text to fit into dial ring for narrower windows
                    if (globals.windowHeight * 0.9 > globals.windowWidth && newTime.length > 8) {
                        // Gradually scale down to shrunken size
                        if (globals.windowHeight < globals.windowWidth * 1.5) {
                            // Max possible ratio
                            var lowerBound = 1 / 0.9;
                            // Min possible ratio
                            var upperBound = 1.5;
                            var ratio = globals.windowHeight / globals.windowWidth;
                            var weight = (upperBound - ratio) / (upperBound - lowerBound);
                            newFontSize = 8 / newTime.length * (1 - weight) + weight;
                        }
                        // Limit width to width of 8 characters
                        else {
                            newFontSize = 8 / newTime.length;
                        }
                        newFontSize += 'rem';
                    }

                    currentTime = text;
                    newText = newTime;
                    update = true;
                }
        }

        // Update display only if it needs to be updated
        if (update) {
            // Remove stray elements
            $('#display-text-old').remove();
            // Crossfade style animation
            if (style === 'crossfade') {
                var oldDisplayHTML = $('#display-text').text();
                var newDisplayHTML = newText;
                var spannedOldDisplayHTML = '';
                var spannedNewDisplayHTML = '';

                // Selective crossfading only if text is same length
                if (oldDisplayHTML.length === newDisplayHTML.length) {
                    // Iterate through every letter in each text for matches
                    for (var n = 0; n < oldDisplayHTML.length; n++) {
                        // Add matched text normally to new text
                        if (oldDisplayHTML[n] === newDisplayHTML[n]) {
                            spannedOldDisplayHTML += oldDisplayHTML[n];
                            spannedNewDisplayHTML += newDisplayHTML[n];
                        }
                        // Wrap altered text with span for subsequent animation
                        else {
                            spannedOldDisplayHTML += '<span>' + oldDisplayHTML[n] +
                                '</span>';
                            spannedNewDisplayHTML += '<span>' + newDisplayHTML[n] +
                                '</span>';
                        }
                    }
                }
                // Crossfade entire text if lengths differ from each other
                else {
                    spannedOldDisplayHTML = '<span>' + oldDisplayHTML + '</span>';
                    spannedNewDisplayHTML = '<span>' + newDisplayHTML + '</span>';
                }

                // Regex to find duplicate spans
                var replaceSpan = /<\/span><span>/gi;
                oldDisplayText
                    .html(spannedOldDisplayHTML
                        .replace(replaceSpan, '')
                        .replace(' ', '&nbsp;')
                    )
                    .children('span')
                    .velocity({
                        opacity: [0, 1],
                        scale: 0
                    }, {
                        easing: globals.EASE_OUT,
                        duration: Math.min(globals.ANIMATION_DURATION, 1000),
                        queue: false,
                        display: 'inline-block',
                        complete: function () {
                            $(this).parent().remove();
                        }
                    })
                    .end()
                    .prependTo(displayText.parent());

                displayText
                    .html(
                        spannedNewDisplayHTML
                            .replace(replaceSpan, '')
                            .replace(' ', '&nbsp;')
                    )
                    .css({
                        fontFamily: 'robotoregular'
                    })
                    .children('span')
                    .css('opacity', 0)
                    .velocity({
                        opacity: 1,
                        scale: [1, 0]
                    }, {
                        easing: globals.EASE_OUT,
                        duration: Math.min(globals.ANIMATION_DURATION, 1000),
                        queue: false,
                        display: 'inline-block',
                        complete: function() {
                            $(this).contents().unwrap();
                        }
                    });


            }
            // Default "animation" (solid transition)
            else {
                displayText
                    .css({
                        fontFamily: 'robotoregular'
                    })
                    .html(newText);
            }

            // Change font-size if needed
            displayText
                .data('currentTime', currentTime)
                .add(oldDisplayText)
                .velocity({
                    fontSize: newFontSize
                }, {
                    easing: globals.EASE_OUT,
                    duration: globals.ANIMATION_DURATION,
                    queue: false
                });
        }
    }

    function addDigit(digit) {
        setTime((displayText.data('currentTime') + digit).slice(-6));
    }

    return {
        init: init,
        addDigit: addDigit,
        setTime: setTime,
        validateTime: validateTime,
        get time() {
            return displayText.data('currentTime');
        }
    };
})();
