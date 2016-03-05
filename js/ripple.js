ripple = (function(){

    rippleSize = '1em';
    rippleColor = 'white';

    function enable(size, color) {
        rippleSize = size;
        rippleColor = color;
        $(document).on('click.ripple', function(event) {
            $('<div class="ripple"></div>').appendTo('body')
                .css({
                    position: 'absolute',
                    borderRadius: '100%',
                    zIndex: 99,
                    background: rippleColor,
                    pointerEvents: 'none'
                })
                .velocity({
                    width: 0,
                    height: 0,
                    opacity: 0.5,
                    translateX: '-50%',
                    translateY: '-50%'
                }, 0, function() {
                    $(this).css({
                        top: event.pageY,
                        left: event.pageX
                    });
                }).velocity({
                    width: rippleSize,
                    height: rippleSize,
                    opacity: 0
                }, {
                    duration: 1000,
                    easing: [0.2, 0.75, 0, 1],
                    complete: function() { $(this).remove(); }
                });
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

    return {
        enable: enable,
        disable: disable,
        changeSize: changeSize,
        changeColor: changeColor
    };
})();
