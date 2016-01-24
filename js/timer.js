$(function() {
    'use strict';

    // SVG arcs cannot form a complete circle so a value close to 1 is used
    var WHOLECIRCLE = 0.99999;
    var EASEFUNC = 'Expo';
    var EASE_OUT = 'easeOut' + EASEFUNC;
    var EASE_IN = 'easeIn' + EASEFUNC;
    var ANIMATION_DURATION = 300;
    var windowWidth;
    var windowHeight;
    var startupType;
    var startupTime;

    // Adapted from David Walsh (davidwalsh.com)
    var events = (function(){
        var topics = {};
        var hOP = topics.hasOwnProperty;
        return {
            subscribe: function(topic, listener) {
                // Create the topic's object if not yet created
                if(!hOP.call(topics, topic)) topics[topic] = [];

                // Add the listener to queue
                var index = topics[topic].push(listener) -1;

                // Provide handle back for removal of topic
                return {
                    remove: function() {
                        delete topics[topic][index];
                    }
                };
            },
            publish: function(topic, info) {
                // If the topic doesn't exist, or there's no listeners in queue,
                // just leave
                if(!hOP.call(topics, topic)) return;

                // Cycle through topics queue, fire!
                topics[topic].forEach(function(item) {
                    item(info != undefined ? info : {});
                });
            }
        };
    })();

    var app = (function() {
        var $window = $(window);
        var $document = $(document);
        // Attach Fastlick
        FastClick.attach(document.body);

        // Sticky hover fix
        // Check if the device supports touch events
        if ('ontouchstart' in document.documentElement) {
        // Loop through each stylesheet
        for (var sheetI = document.styleSheets.length - 1; sheetI >= 0; sheetI--) {
        var sheet = document.styleSheets[sheetI];
        // Verify if cssRules exists in sheet
        if (sheet.cssRules) {
        // Loop through each rule in sheet
        for (var ruleI = sheet.cssRules.length - 1; ruleI >= 0; ruleI--) {
        var rule = sheet.cssRules[ruleI];
        // Verify rule has selector text
        if (rule.selectorText) {
        // Replace hover psuedo-class with active psuedo-class
        rule.selectorText = rule.selectorText.replace(':hover', ':active');
        }
        }
        }
        }
        }

        // Disable scrolling if running as full-screen iOS web app
        if (window.navigator.standalone) {
            $document.on('touchmove', false);
        }

        // Enable the use of backdrop filters if supported
        if (isSupportedCSS('-webkit-backdrop-filter') ||
            isSupportedCSS('-moz-backdrop-filter') ||
            isSupportedCSS('-o-backdrop-filter') ||
            isSupportedCSS('-ms-backdrop-filter') ||
            isSupportedCSS('backdrop-filter') ) {
                $('body').addClass('backdrop-filter');
        }

        // Enable keyboard input
        $document.on('keydown', function (e) {
            // Get the keycode
            var key = e.keyCode;
            // Do not allow keyboard input if a notification is show
            if (notification.isShown) {
                if (notification.isEmpty) {
                    switch (key) {
                        case 13:
                            notification.clickButton('emphasize');
                            break;
                        case 27:
                            notification.clickButton('alert');
                            break;
                    }
                    return false;
                } else {
                    notification.hide();
                    if (key === 13) {
                        return false;
                    }
                }
            }
            // Perform events depending on keycode
            switch (key) {
                // Backspace - delete a character from display
                case 8:
                    e.preventDefault();
                    if (display.inputMode) {
                        var deletedTime = ('0' + displayText.time).slice(-7, -1);
                        displayText.setTime(deletedTime);
                    }
                    break;

                // Enter - start or cancel timer
                case 13:
                    // Activate editing mode if not activated
                    if (display.inputMode) {
                        app.startTimer();
                    } else {
                        app.editTime();
                    }
                    break;

                // Escape - cancel timer
                case 27:
                    // Activate editing mode if not activated
                    if (!display.inputMode) {
                        app.editTime();
                    }
                    break;

                // Space - toggle keyboard help menu
                case 32:
                    if (display.inputMode) {
                        helpMenu.toggle();
                    } else {
                        app.togglePause();
                    }
                    break;

                // 0 to 9 - input digits into display
                case 48:
                case 49:
                case 50:
                case 51:
                case 52:
                case 53:
                case 54:
                case 55:
                case 56:
                case 57:
                    // Activate editing mode if not activated
                    if (display.inputMode) {
                        // Obtain entered character
                        var keyValue = String.fromCharCode(key);
                        displayText.addDigit(keyValue);
                        break;
                    }

            }

            // Hide help menu unless spacebar was clicked
            if (key !== 32) {
                helpMenu.toggle(false);
            }
        });

        // Disable suggesting a mouse if user has a touch device
        $document.on('touchstart', function () {
            localStorage.setItem('touch-device', 'true');
        });

        // Adjust font-sizes when viewport dimensions change
        $window.on('load resize orientationChange', function () {
            windowWidth = $window.width();
            windowHeight = $window.height();
            // Maximize size of text
            var maxLength = Math.min(windowWidth * 1.5, windowHeight);
            $.Velocity.hook($('html'), 'fontSize', (maxLength / 9) + 'px');
        });

        $document.click(function (e) {
            // Hide keyboard help when anything is tapped
            if (!$(e.target).hasClass('button')) {
                helpMenu.toggle(false);
            }
            var touchDevice = localStorage.getItem('touch-device');
            var suggestedMouse = localStorage.getItem('mouse-suggested');
            var suggestedMouseSession = sessionStorage.getItem('mouse-suggested');
            var tempSuggestion = suggestedMouse === 'temp';
            var showAgain = tempSuggestion && !suggestedMouseSession;

            if (!touchDevice && (!suggestedMouse || showAgain)) {
                localStorage.setItem('mouse-suggested', 'true');
                sessionStorage.setItem('mouse-suggested', 'true');
                notification.show(
                    'Seems like you have a keyboard. ' +
                    'Want to learn a few shortcuts?', [{
                        text: 'Never',
                        style: 'alert',
                        clickFunction: function () {}
                    }, {
                        text: 'Not right now',
                        style: 'normal',
                        clickFunction: function () {
                            localStorage.setItem('mouse-suggested', 'temp');
                        }
                    }, {
                        text: 'Yes, show me',
                        style: 'emphasize',
                        clickFunction: function () {
                            helpMenu.toggle(true);
                        }
                    }]
                );
            }
        });

        function startTimer(resume, restore) {
            // Convert display input to seconds
            var timeString = displayText.time;
            var hoursToSeconds = timeString.slice(-6, -4) * 3600;
            var minutesToSeconds = timeString.slice(-4, -2) * 60;
            var seconds = timeString.slice(-2) * 1;
            var totalSeconds = hoursToSeconds + minutesToSeconds + seconds;

            // Limit seconds to less than 100 hours
            if (totalSeconds === 0 && !resume && !restore) {
                notification.show('Please enter a time first');
            } else if (totalSeconds < 360000 || restore || resume) {
                // Start dial motion and set state to timing mode
                dialRing.wind(totalSeconds, resume || restore);
                display.inputMode = false;
                if (!resume) events.publish('start');
            } else {
                notification.show(
                    'The time entered was too high. Enter a time less than 100 hours'
                );
                displayText.setTime('');
            }
        }

        /** Activates input mode */
        function editTime() {
            localStorage.setItem('timeStarted', 0);
            localStorage.setItem('durationSet', 0);
            events.publish('edit');
        }

        /** Toggles pause state of timer */
        function togglePause() {
            // Handle if display is expanded
            if (!display.inputMode) {
                // Handle if timer is paused
                if (display.paused) {
                    app.startTimer(true);
                    display.paused = false;
                    events.publish('resume');
                }
                // Handle if timer is running
                else if (display.running) {
                    displayText.setTime('Paused', 'crossfade');
                    display.paused = true;
                    events.publish('pause');
                }
                // Handle if timer is finished/not running
                else {
                    app.editTime();
                }
            }
        }

        /** Check if CSS property is supported on the browser and returns a boolean */
        function isSupportedCSS(prop) { return prop in document.body.style; }

        events.subscribe('startup', function() {
            // Use special startup type if time is given in URL
            var s = window.location.search;
            var re = new RegExp('&amp;' + 'time' + '=([^&amp;]*)', 'i');
            (s = s.replace(/^\?/, '&amp;').match(re)) ? s = s[1] : s = '';
            if (displayText.validateTime(s)) {
                startupType = 'given';
                startupTime = s;
            } else {
                startupType = 'normal';
            }
        });

        events.subscribe('startup.given', function() {
            // Immediately start timer
            displayText.setTime(('000000' + startupTime).slice(-6));
            startTimer();
        });

        return {
            startTimer: startTimer,
            editTime: editTime,
            togglePause: togglePause
        }
    })();

    var display = (function() {
        var display = $('#display');

        // Represents if keypad is displayed
        display.data('inputMode', true);

        function expand() {
            display
                .velocity('stop')
                .velocity({
                    height: '90%',
                    translateY: 0
                }, {
                    duration: ANIMATION_DURATION,
                    easing: EASE_OUT
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
                    duration: ANIMATION_DURATION,
                    easing: EASE_OUT,
                });
        }

        function done() {
            display.removeClass('running');
        }

        events.subscribe('startup.given', function() {
            $.Velocity.hook(display, 'translateY', '-100%');
        });

        events.subscribe('startup.normal', function() {
            $.Velocity.hook(display, 'height', '100%');
            display.velocity({
                height: '20%'
            }, {
                easing: EASE_OUT,
                duration: ANIMATION_DURATION,
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
                                        app.startTimer(false, true);
                                    } else {
                                        notification.show(
                                            'Too late, the timer has already ended'
                                        );
                                    }
                                }
                            };
                            notification.show(message, [noButton, sureButton]);
                        }
                    }

                    /** Returns time left until previous timer ends */
                    function timeLeft() {
                        return (timeStarted + durationSet) - (new Date()).getTime();
                    }
                }
            });
        });

        events.subscribe('start', expand);
        events.subscribe('edit', shrink);

        return {
            expand: expand,
            shrink: shrink,
            get inputMode() {
                return display.data('inputMode');
            },
            set inputMode(mode) {
                mode ? display.data('inputMode', true).data('paused', false).removeClass('running') : display.data('inputMode', false).addClass('running');
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
        }
    })();

    var keypad = (function() {
        var keypad = $('#keypad');

        $.Velocity.hook(keypad, 'translateX', '-50%');
        $.Velocity.hook(keypad, 'scaleX', 0.5);
        $.Velocity.hook(keypad, 'scaleY', 0);
        $.Velocity.hook(keypad, 'opacity', 0);

        function shrink() {
            keypad
                .velocity('stop')
                .velocity({
                    scaleX: 0,
                    scaleY: 0,
                    opacity: 0
                }, {
                    easing: EASE_OUT,
                    duration: ANIMATION_DURATION,
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
                    easing: EASE_OUT,
                    duration: ANIMATION_DURATION,
                    display: 'table'
                });
        }

        // Set click events
        keypad.on('click', 'td', function () {
            var keyValue = $(this).text();
            if (keyValue === 'Clear') {
                displayText.setTime('');
            } else if (keyValue === 'Start') {
                app.startTimer();
            } else {
                displayText.addDigit(keyValue);
            }
        });

        events.subscribe('startup.normal', function() {
            keypad.velocity({
                opacity: 1,
                scaleX: 1,
                scaleY: 1
            }, {
                easing: EASE_OUT,
                duration: ANIMATION_DURATION
            });
        });

        events.subscribe('start', shrink);
        events.subscribe('edit', expand);

        return {
            shrink: shrink,
            expand: expand
        }
    })();

    var displayText = (function() {
        var displayText = $('#display-text');

        // Clear display and show default message
        displayText.data('currentTime', '000000');
        $.Velocity.hook(displayText, 'translateX', '-50%');
        $.Velocity.hook(displayText, 'translateY', '-50%');

        displayText.click(app.togglePause);

        events.subscribe('startup.normal', function() {
            $.Velocity.hook(displayText, 'opacity', 0);
            displayText.velocity({
                opacity: 1
            }, {
                easing: EASE_OUT,
                duration: ANIMATION_DURATION
            });
        });

        events.subscribe('edit', function() {
            setTime(displayText.data('currentTime'), 'crossfade');
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
                        if (windowHeight * 0.9 > windowWidth && newTime.length > 8) {
                            // Gradually scale down to shrunken size
                            if (windowHeight < windowWidth * 1.5) {
                                // Max possible ratio
                                var lowerBound = 1 / 0.9;
                                // Min possible ratio
                                var upperBound = 1.5;
                                var ratio = windowHeight / windowWidth;
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
                            easing: EASE_OUT,
                            duration: Math.min(ANIMATION_DURATION, 1000),
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
                            easing: EASE_OUT,
                            duration: Math.min(ANIMATION_DURATION, 1000),
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
                        easing: EASE_OUT,
                        duration: ANIMATION_DURATION,
                        queue: false
                    });
            }
        }

        function addDigit(digit) {
            setTime((displayText.data('currentTime') + digit).slice(-6));
        };

        return {
            addDigit: addDigit,
            setTime: setTime,
            validateTime: validateTime,
            get time() {
                return displayText.data('currentTime');
            }
        }
    })();

    var notification = (function() {
        var banner = $('#notification-banner');
        var bannerSpan = banner.find('span');
        var timeout;

        /** Show a notification with given message and buttons */
        function show(message, buttons) {
            bannerSpan.text(message);
            var button_wrapper = bannerSpan.siblings('div').empty();

            if (buttons) {
                $('#content').css('pointer-events', 'none');
                for (var i = buttons.length - 1; i >= 0; i--) {
                    var button = buttons[i];
                    $('<div></div>')
                        .text(button.text)
                        .addClass(button.style + ' button')
                        .click(button.clickFunction)
                        .prependTo(button_wrapper);
                }
            } else {
                clearTimeout(timeout);
                timeout = setTimeout(notification.hide, 5000);
            }

            banner
                .velocity('stop')
                .velocity({
                    translateY: banner.data('shown') ? 0 : [0, '-100%']
                }, {
                    easing: EASE_OUT,
                    display: 'block',
                    duration: ANIMATION_DURATION,
                    complete: function() {
                        if (buttons) {
                            $('#content').on('click.bannerhide', notification.hide);
                        } else {
                            $(document).on('click.bannerhide', notification.hide);
                        }
                    }
                })
                .data('shown', true);
        };

        /** Hide any notifications that are present */
        function hide() {
            $(document).off('click.bannerhide', notification.hide);
            $('#content')
                .off('click.bannerhide', notification.hide)
                .css('pointer-events', '');

            if (banner.data('shown')) {
                banner
                    .data('shown', false)
                    .velocity('stop')
                    .velocity({
                        translateY: '-100%'
                    }, {
                        easing: EASE_IN,
                        display: 'none',
                        duration: ANIMATION_DURATION / 2
                    });
            }
        };

        function clickButton(type) {
            banner.find('.' + type).click();
        };

        banner.on('click', '.button', hide);

        return {
            show: show,
            hide: hide,
            clickButton: clickButton,
            get isShown() {
                return banner.data('shown');
            },
            get isEmpty() {
                return banner.find('div').text() !== '';
            }
        };
    })();

    var helpMenu = (function() {
        var menu = $('#keyboard-help');

        $.Velocity.hook(menu, 'translateX', '-50%');
        $.Velocity.hook(menu, 'translateY', '-50%');

        // Change Backspce to Delete if on Mac or iOS devices
        if (navigator.platform.match(/(Mac|iPhone|iPod|iPad)/i)) {
            menu.find('.delete').text('Delete');
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
                        easing: show ? EASE_OUT : EASE_IN,
                        display: show ? 'block' : 'none',
                        duration: (show ? ANIMATION_DURATION : ANIMATION_DURATION / 2)
                    });
            } else if ((menu.data('shown') || false) !== forceState){
                toggle();
            }
        };

        return {
            toggle: toggle
        }
    })();

    var editButton = (function() {
        var button = $('#edit-button');

        function slideIn() {
            button
                .velocity('stop')
                .velocity({
                    translateY: [0, '100%'],
                    opacity: [1, 0]
                }, {
                    easing: EASE_OUT,
                    duration: ANIMATION_DURATION,
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
                    easing: EASE_OUT,
                    display: 'none',
                    duration: ANIMATION_DURATION,
                    complete: function() {
                        $.Velocity.hook($(this), 'translateY', '0');
                    }
                });
        }

        button.click(app.editTime);

        events.subscribe('start', slideIn);
        events.subscribe('edit', zoomOut);

        return {
            slideIn: slideIn,
            zoomOut: zoomOut
        }
    })();

    var dialRing = (function() {
        var dial = $('#dial-ring');
        var path = $('#dial-ring path');

        function scaleIn() {
            dial
                .velocity('stop')
                .velocity({
                    opacity: [1, 0],
                    scale: [1, 0]
                }, {
                    easing: EASE_OUT,
                    duration: ANIMATION_DURATION,
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
                    easing: EASE_OUT,
                    duration: ANIMATION_DURATION
                });
        }

        function halfFade() {
            $('#dial-ring')
                .velocity('stop')
                .velocity({
                    opacity: 0.25
                }, {
                    easing: EASE_OUT,
                    duration: ANIMATION_DURATION
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

                        // Creath path from segments
                        var dialPath = moveToCenter + moveToStart + makeArc;

                        // Set path
                        path.attr('d', dialPath);
                        // Store progress in data
                        path.data('progress', t);
                        path.data('timeLeft', r);
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
                            displayText.setTime(times.join(''), 'crossfade');
                        }
                    },
                    complete: function () {
                        displayText.setTime('Done', 'crossfade');
                        display.done();
                        localStorage.setItem('timeStarted', 0);
                        localStorage.setItem('durationSet', 0);
                    }
            });
        }

        function stop() {
            path.velocity('stop');
        }

        events.subscribe('start', scaleIn);
        events.subscribe('edit', stop);
        events.subscribe('edit', fadeOut);
        events.subscribe('pause', stop);
        events.subscribe('pause', halfFade);
        events.subscribe('pause', halfFade);
        events.subscribe('resume', fadeIn);

        return {
            scaleIn: scaleIn,
            fadeOut: fadeOut,
            stop: stop,
            wind: wind,
            fadeIn: fadeIn,
            halfFade: halfFade
        }
    })();



    events.publish('startup');
    events.publish('startup.' + startupType);
});
