var NotificationBanner = (function() {
    'use strict';

    var banner, bannerSpan, timeout;

    function init() {
        banner = $('#notification-banner');
        bannerSpan = banner.find('span');

        banner.on('click', '.button', hide);
    }

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
            timeout = setTimeout(NotificationBanner.hide, 5000);
        }

        banner
            .velocity('stop')
            .velocity({
                translateY: banner.data('shown') ? 0 : [0, '-100%']
            }, {
                easing: globals.EASE_OUT,
                display: 'block',
                duration: globals.ANIMATION_DURATION,
                complete: function() {
                    if (buttons) {
                        $('#content').on('click.bannerhide', NotificationBanner.hide);
                    } else {
                        $(document).on('click.bannerhide', NotificationBanner.hide);
                    }
                }
            })
            .data('shown', true);
    }

    /** Hide any notifications that are present */
    function hide() {
        $(document).off('click.bannerhide', NotificationBanner.hide);
        $('#content')
            .off('click.bannerhide', NotificationBanner.hide)
            .css('pointer-events', '');

        if (banner.data('shown')) {
            banner
                .data('shown', false)
                .velocity('stop')
                .velocity({
                    translateY: '-100%'
                }, {
                    easing: globals.EASE_IN,
                    display: 'none',
                    duration: globals.ANIMATION_DURATION / 2
                });
        }
    }

    function clickButton(type) {
        banner.find('.' + type).click();
    }

    return {
        init: init,
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
