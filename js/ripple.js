ripple = (function(){
    'use strict';

    var rippleSize, rippleColor, rippleDuration;

    function enable(size, color, duration) {
        rippleSize = size;
        rippleColor = color;
        rippleDuration = duration;
        $(document).on('click.ripple', function(event) {
            var $ripple = $('<div class="ripple"></div>');
            $.Velocity.hook($ripple, 'translateX', '-50%');
            $.Velocity.hook($ripple, 'translateY', '-50%');
            $.Velocity.hook($ripple, 'scale', '0');
            $ripple.css({
                    position: 'absolute',
                    top: event.pageY,
                    left: event.pageX,
                    width: rippleSize,
                    height: rippleSize,
                    zIndex: 99,
                    opacity: 1,
                    background: rippleColor,
                    borderRadius: '100%',
                    pointerEvents: 'none'
                })
                .velocity({
                    scale: 1,
                    opacity: 0
                }, {
                    duration: rippleDuration,
                    easing: 'easeOutExpo',
                    complete: function() { $(this).remove(); }
                })
                .appendTo('body');
        });
    }

    function disable() {
        $(document).off('click.ripple');
    }

    function changeSize(newSize) {
        rippleSize = newSize;
    }

    function changeColor(newColor) {
        rippleColor = newColor;
    }

    function changeDuration(newDuration) {
        rippleDuration = newDuration;
    }

    return {
        enable: enable,
        disable: disable,
        changeSize: changeSize,
        changeColor: changeColor,
        changeDuration: changeDuration
    };
})();
