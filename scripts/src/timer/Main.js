var globals =  {
    EASE_OUT: 'easeOutExpo',
    EASE_IN: 'easeInExpo',
    ANIMATION_DURATION: 300,
    windowWidth: null,
    windowHeight: null,
    startupType: null,
    startupTime: null
};

$(function() {
    'use strict';

    App.init();
    Display.init();
    Keypad.init();
    DisplayText.init();
    NotificationBanner.init();
    HelpMenu.init();
    EditButton.init();
    DialRing.init();

    Events.publish('startup');
});
