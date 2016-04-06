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
