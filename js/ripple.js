ripple = (function(){
    'use strict';

    // Store ripple attributes
    var rippleSize, rippleColor, rippleDuration;

    // Enable ripple effect
    function enable(size, color, duration) {
        // Set ripple attributes
        rippleSize = size;
        rippleColor = color;
        rippleDuration = duration;
        // Attach handler to click event
        $(document).on('click.ripple', function(event) {
            // Create ripple div
            var $ripple = $('<div class="ripple"></div>');
            // Hook initial properties
            $.Velocity.hook($ripple, 'translateX', '-50%');
            $.Velocity.hook($ripple, 'translateY', '-50%');
            $.Velocity.hook($ripple, 'scale', '0');
            // Set styling, including position and size
            $ripple.css({
                    position: 'absolute',
                    top: event.pageY,
                    left: event.pageX,
                    width: rippleSize,
                    height: rippleSize,
                    zIndex: 99,
                    opacity: 0.75,
                    background: rippleColor,
                    borderRadius: '100%',
                    pointerEvents: 'none'
                })
                // Animate to full size and zero opacity
                .velocity({
                    scale: 1,
                    opacity: 0
                }, {
                    duration: rippleDuration,
                    easing: 'easeOutExpo',
                    // Remove element after completion of animation
                    complete: function() {
                        $(this).remove();
                    }
                })
                .appendTo('body');
        });
    }

    // Disable ripple effect
    function disable() {
        $(document).off('click.ripple');
    }

    // Change size of ripple (with units)
    function changeSize(newSize) {
        rippleSize = newSize;
    }

    // Change color of ripple (any acceptable CSS color string)
    function changeColor(newColor) {
        rippleColor = newColor;
    }

    // Change duration of ripple
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
