var App = (function() {
    'use strict';

    var $window, $document;

    function init() {
        Ripple.enable('1.5em', 'white', 750);
        FastClick.attach(document.body);

        var $window = $(window);
        var $document = $(document);

        // Disable scrolling if running as full-screen iOS web app
        if (window.navigator.standalone) {
            $document.on('touchmove', false);
        }

        // Sticky hover fix
        // Check if the device supports touch events
        if ('ontouchstart' in document.documentElement) {
        // Loop through each stylesheet
        for (var sheetI = document.styleSheets.length-1;sheetI>= 0;sheetI--) {
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
            // Do not allow keyboard input if a Notification is show
            if (NotificationBanner.isShown) {
                if (NotificationBanner.isEmpty) {
                    switch (key) {
                        case 13:
                            NotificationBanner.clickButton('emphasize');
                            break;
                        case 27:
                            NotificationBanner.clickButton('alert');
                            break;
                    }
                    return false;
                } else {
                    NotificationBanner.hide();
                    if (key === 13) {
                        return false;
                    }
                }
            }
            // Perform events depending on keycode
            switch (key) {
                // Backspace - delete a character from Display
                case 8:
                    e.preventDefault();
                    if (Display.inputMode) {
                        var deletedTime = ('0' + DisplayText.time).slice(-7, -1);
                        DisplayText.setTime(deletedTime);
                    }
                    break;

                // Enter - start or cancel timer
                case 13:
                    // Activate editing mode if not activated
                    if (Display.inputMode) {
                        App.startTimer();
                    } else {
                        App.editTime();
                    }
                    break;

                // Escape - cancel timer
                case 27:
                    // Activate editing mode if not activated
                    if (!Display.inputMode) {
                        App.editTime();
                    }
                    break;

                // Space - toggle keyboard help menu
                case 32:
                    if (Display.inputMode) {
                        HelpMenu.toggle();
                    } else {
                        App.togglePause();
                    }
                    break;

                // 0 to 9 - input digits into Display
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
                    if (Display.inputMode) {
                        // Obtain entered character
                        var keyValue = String.fromCharCode(key);
                        DisplayText.addDigit(keyValue);
                        break;
                    }

            }

            // Hide help menu unless spacebar was clicked
            if (key !== 32) {
                HelpMenu.toggle(false);
            }
        });

        // Disable suggesting a mouse if user has a touch device
        $document.on('touchstart', function () {
            localStorage.setItem('touch-device', 'true');
        });

        // Adjust font-sizes when viewport dimensions change
        $window.on('load resize orientationChange', function () {
            globals.windowWidth = $window.width();
            globals.windowHeight = $window.height();
            // Maximize size of text
            var maxLength = Math.min(globals.windowWidth * 1.5, globals.windowHeight);
            $.Velocity.hook($('html'), 'fontSize', (maxLength / 9) + 'px');
        });

        $document.click(function (e) {
            // Hide keyboard help when anything is tapped
            if (!$(e.target).hasClass('button')) {
                HelpMenu.toggle(false);
            }
            var touchDevice = localStorage.getItem('touch-device');
            var suggestedMouse = localStorage.getItem('mouse-suggested');
            var suggestedMouseSession = sessionStorage.getItem('mouse-suggested');
            var tempSuggestion = suggestedMouse === 'temp';
            var showAgain = tempSuggestion && !suggestedMouseSession;

            if (!touchDevice && (!suggestedMouse || showAgain)) {
                localStorage.setItem('mouse-suggested', 'true');
                sessionStorage.setItem('mouse-suggested', 'true');
                NotificationBanner.show(
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
                            HelpMenu.toggle(true);
                        }
                    }]
                );
            }
        });
    }

    function startTimer(resume, restore) {
        // Convert Display input to seconds
        var timeString = DisplayText.time;
        var hoursToSeconds = timeString.slice(-6, -4) * 3600;
        var minutesToSeconds = timeString.slice(-4, -2) * 60;
        var seconds = timeString.slice(-2) * 1;
        var totalSeconds = hoursToSeconds + minutesToSeconds + seconds;

        // Limit seconds to less than 100 hours
        if (totalSeconds === 0 && !resume && !restore) {
            NotificationBanner.show('Please enter a time first');
        } else if (totalSeconds < 360000 || restore || resume) {
            // Start dial motion and set state to timing mode
            DialRing.wind(totalSeconds, resume || restore);
            Display.inputMode = false;
            if (!resume) Events.publish('start');
        } else {
            NotificationBanner.show(
                'The time entered was too high. Enter a time less than 100 hours'
            );
            DisplayText.setTime('');
        }
    }

    /** Activates input mode */
    function editTime() {
        localStorage.setItem('timeStarted', 0);
        localStorage.setItem('durationSet', 0);
        Events.publish('edit');
    }

    /** Toggles pause state of timer */
    function togglePause() {
        // Handle if Display is expanded
        if (!Display.inputMode) {
            // Handle if timer is paused
            if (Display.paused) {
                App.startTimer(true);
                Display.paused = false;
                Events.publish('resume');
            }
            // Handle if timer is running
            else if (Display.running) {
                DisplayText.setTime('Paused', 'crossfade');
                Display.paused = true;
                Events.publish('pause');
            }
            // Handle if timer is finished/not running
            else {
                App.editTime();
            }
        }
        // Handle contracted Display (edit mode)
        else {
            App.startTimer();
        }
    }

    /** Check if CSS property is supported on the browser and returns a boolean */
    function isSupportedCSS(prop) { return prop in document.body.style; }

    Events.subscribe('startup', function() {
        // Use special startup type if time is given in URL
        var s = window.location.search;
        var re = new RegExp('&amp;' + 'time' + '=([^&amp;]*)', 'i');
        s = (s = s.replace(/^\?/, '&amp;').match(re)) ? s[1] : '';
        if (DisplayText.validateTime(s)) {
            // Immediately start timer
            DisplayText.setTime(('000000' + s).slice(-6));
            startTimer();
        } else {
            Events.publish('startup.normal');
        }
    });

    return {
        init: init,
        startTimer: startTimer,
        editTime: editTime,
        togglePause: togglePause
    };
})();
