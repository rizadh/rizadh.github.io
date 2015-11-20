// SVG arcs cannot form a complete circle so a value close to 1 is used
var WHOLE_CIRCLE = 0.99999;

$(function() {
    // Automatically begin demo mode when page is loaded
    setTime(prompt("Enter time you want to countdown to (in seconds):"));
});

// Set size of text to maximize use of dial area when page is loaded and when viewport changes
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

/** Change text of dial smoothly */
function changeDialText(new_text) {
    var current_text = $("#dial-text").text();
    var diff_chars = differentChars(new_text, current_text);

    if (new_text.length !== current_text.length) {
        var fill_array = [];
        for (var i = 0; i < (Math.abs(current_text.length - new_text.length)); i++) {
            fill_array[i] = Math.min(new_text.length,current_text.length) + i;
        }

        console.log("Diff char was: " + diff_chars);
        console.log("Fill arry was: " + fill_array);
        diff_chars = diff_chars.concat(fill_array);
        console.log("Now they are: " + diff_chars);
    }

    $("#dial-text.old").remove();
    $("#dial-text")
        .clone()
        .addClass("old")
        .appendTo($("#dial"))
        .html(spanAtIndexes(current_text, diff_chars));
    $("#dial-text")
    .data("text", new_text)
    .html(spanAtIndexes(new_text, diff_chars))
    .children("span")
    .css("opacity",0)
    .velocity({
        tween: 1
    }, {
        duration: 250,
        progress: function(e, c, r, s, t) {
            $("#dial-text:not(.old) span").css("opacity", t);
            $("#dial-text.old span").css("opacity",1-t);
        },
        complete: function() {
            $("#dial-text.old").remove();
        },
        easing: "easeInOut"
    });
}

/** Given some text, wrap characters at the given indexes with span tags */
function spanAtIndexes(text, indexes) {
    var new_text = text.split("");
    for (var i = 0; i < indexes.length; i++) {
        if (indexes[i] < new_text.length) {
            new_text[indexes[i]] = "<span class='same-text'>" + text[indexes[i]] + "</span>"
        }
    }
    return new_text
}

/** Find different characters between two string and return their indexes */
function differentChars(string1, string2) {
    var different_character_index_list = [];
    for (i = 0; i < Math.min(string1.length,string2.length); i++) {
        if (string1[i] !== string2[i]) {
            different_character_index_list.push(i);
        }
    }

    return different_character_index_list;
}

function setTime(sec) {
    // More than 36000 seconds equates to 10 hours+, which does not fit in the dial
    if (sec >= 36000) {
        setTime(prompt("The time you entered was too high. Enter a time less than 36000 seconds"));
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
