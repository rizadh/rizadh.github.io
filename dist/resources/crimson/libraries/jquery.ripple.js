// REQUIRES JQUERY AND VELOCITY.JS
var ripple = true,
    rippleSize = "8em",
    rippleColor = "#fff",
    rippleIntensity = 0.5;

// Ripple effect on click
$(document).on("click", function(event) {
    if (ripple) {
        $("body").append("<div class='ripple'></div>");
        $(".ripple").last()
            .css("position","absolute")
            .css("border-radius","100%")
            .css("z-index","99")
            .css("background",rippleColor)
            .css("pointer-events","none")
            .velocity("stop")
            .velocity({
                width: 0,
                height: 0,
                opacity: rippleIntensity,
                translateX: "-50%",
                translateY: "-50%"
            }, 0, function() {
                // Update position of ripple
                $(this).css("top", event.pageY);
                $(this).css("left", event.pageX);
            }).velocity({
                width: rippleSize,
                height: rippleSize,
                opacity: 0
            }, {
                duration: 1000,
                easing: [0.2, 0.75, 0, 1],
                complete: function() { $(this).remove() }
            });
    }
});

$(document).on("contextmenu", function(event) {
    if (ripple) {
        $("body").append("<div class='ripple'></div>");
        $(".ripple").last()
            .css("position","absolute")
            .css("border-radius","100%")
            .css("z-index","99")
            .css("background",rippleColor)
            .css("pointer-events","none")
            .velocity("stop")
            .velocity({
                width: 0,
                height: 0,
                opacity: rippleIntensity,
                translateX: "-50%",
                translateY: "-50%"
            }, 0, function() {
                // Update position of ripple
                $(this).css("top", event.pageY);
                $(this).css("left", event.pageX);
            }).velocity({
                width: rippleSize,
                height: rippleSize,
                opacity: 0
            }, {
                duration: 1000,
                easing: [0.2, 0.75, 0, 1],
                complete: function() { $(this).remove() }
            });
    }
});