var WHOLE_CIRCLE = 0.99999;

$(function() {
    // Automatically begin demo mode when page is loaded
    setTime(prompt("Enter seconds"));
});

$(window).on('load resize orientationChange', function(event) {
    var max_length = Math.min(window.innerHeight, window.innerWidth);
    $("#dial-text").css("font-size",max_length/5);
});

/** Sets dial of given radius to given progress */
function setDial(dial, radius, progress) {
    var sweep = progress >= 0.5 ? 1 : 0;
    dial.attr({
        d: "M" + radius + " " + radius + "L" + radius + " 0A" + radius + " " + radius + " 0 " + sweep + " 1 " + (radius + radius*Math.sin(2*Math.PI*progress)) + " " + (radius - radius*Math.cos(2*Math.PI*progress)),
        fill: "hsla(" + (120 * (1 - progress)) + ", 100%, 50%, 1)"
    });
    dial.data("complete", progress);
    dial.siblings("circle").attr("fill", "hsla(" + (120 * (1 - progress)) + ", 100%, 50%, 0.1)");
}

function closeDial() {
    $("#Clip circle").css("transform-origin", "50% 50%").velocity({
        scale: 0
    }, 500);
    $("#dial").velocity("stop");

    var cur_complete = $("#dial-ring path").data("complete");
    $("#dial").velocity({
        tween: [1,0]
    }, {
        duration: 500,
        progress: function(elements, complete, remaining, start, tweenValue) {
            setDial($("#dial-ring path"), 50, cur_complete + tweenValue * (WHOLE_CIRCLE - cur_complete));
        }
    });
}

function openDial() {
    $("#dial-text").velocity({
        opacity: 1
    }, {
        duration: 200
    });
    $("#Clip circle").css("transform-origin", "50% 50%").velocity({
        scale: 1
    }, 500);
    $("#dial").velocity("stop");
}

function changeDialText(new_text) {
    $("#dial-text.old").remove();
    $("#dial-text").clone().addClass("old").appendTo($("#dial"));
    $("#dial-text").data("text",new_text).css("opacity",0).html(new_text).velocity({
        tween: 1
    }, {
        duration: 0,
        progress: function(e, c, r, s, t) {
            $("#dial-text").not(".old").css("opacity",t);
            $("#dial-text.old").css("opacity",1-t);
        },
        finish: function() {
            $("#dial-text.old").remove();
        },
        easing: "linear"
    });

}

function setTime(sec) {
    if (sec > 36000) {
        alert("Too high input")
        return;
    }
    // Convert seconds to milliseconds
    dial_time = sec*1000;
    $("#dial").velocity(
        {
            // Can't go to 1 with SVG arc
            tween: WHOLE_CIRCLE
        }, {
            duration: dial_time,
            progress: function(elements, complete, remaining, start, tweenValue) {
                setDial($("#dial-ring path"), 50, tweenValue);
                // Find seconds rounded up
                var seconds = Math.ceil((remaining/1000));
                // Find minutes rounded down
                var minutes = Math.floor(seconds/60) % 60;
                // Find hours rounded down
                var hours = Math.floor(seconds/3600);
                seconds = seconds % 60;
                // Force 2 digits for seconds if minutes are present
                if (minutes > 0) {
                    seconds = ("0"+ seconds).slice(-2);
                }
                // Force 2 digits for minutes if hours are present
                if (hours > 0) {
                    minutes = ("0"+ minutes).slice(-2);
                }
                // Create text to be inserted into dial
                var dial_text = (hours > 0 ? hours + ":" : "") + (hours + minutes  > 0 ? minutes + ":" : "") + seconds;
                if ($("#dial-text").data("text") != dial_text) {
                    console.log("Minutes: " + minutes);
                    console.log("Seconds: " + seconds);
                    console.log("Hours: " + hours);
                    changeDialText(dial_text);
                }
            },
            easing: "linear",
            complete: function() {
                changeDialText("Done");
            }
        }
    );
}
