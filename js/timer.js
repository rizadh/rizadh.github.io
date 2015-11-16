$(function() {
    // Automatically begin demo mode when page is loaded
    $("body").velocity(
        {
            tween: 0.999999
        }, {
            duration: 5000,
            progress: function(elements, complete, remaining, start, tweenValue) {
                setDial($("#dial-ring path"), 50, tweenValue);
                var second = ("00"+(60-Math.round(tweenValue*60))).slice(-2);
                $("#dial-text").html("0:"+second);
            },
            loop: true,
            easing: "linear"
        }
    );
});

$(window).on('load resize orientationChange', function(event) {
    var max_length = Math.min($(window).width(), $(window).height());
    $("#dial-text").velocity({
        fontSize: max_length/4
    }, 0)
});

function setDial(dial, radius, progress) {
    /*
    Set given SVG path element (dial) to be a partial circle with a given
    radius. The progress parameter represents the partiality of the circle,
    1 creating a complete circle, 0.5 creating a semi-circle and 0 creating no
    circle. Assumes that the circle assumes full width of the viewbox.
    */
    var sweep = progress >= 0.5 ? 1 : 0;
    dial.attr({
        d: "M" + radius + " " + radius + "L" + radius + " 0A" + radius + " " + radius + " 0 " + sweep + " 1 " + (radius + radius*Math.sin(2*Math.PI*progress)) + " " + (radius - radius*Math.cos(2*Math.PI*progress)),
        fill: "hsla(" + (120 * (1 - progress)) + ", 100%, 50%, 1)"
    });
    dial.siblings("circle").attr("fill", "hsla(" + (120 * (1 - progress)) + ", 100%, 50%, 0.1)");
}
