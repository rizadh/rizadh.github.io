"use strict";

$(function() {
    updateClock(true);
});

function updateClock(startup) {
    // Obtain values of each time unit
    var date = new Date();
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var seconds = date.getSeconds();

    // Convert 24-hour to 12-hour time
    hours = hours > 12 ? hours - 12 : hours;

    // Get progress of each hand around clock
    var hour_progress = 30*hours;
    var minute_progress = 6*minutes;
    var second_progress = 6*seconds;

    // Prevent clock from spinning back to return to zero
    if (hour_progress == 0) {
        $.Velocity.hook($("#hour-hand"), "rotateZ", "-30deg");
    }
    if (minute_progress == 0) {
        $.Velocity.hook($("#minute-hand"), "rotateZ", "-6deg");
    }
    if (second_progress == 0) {
        $.Velocity.hook($("#second-hand"), "rotateZ", "-6deg");
    }

    if (startup) {
        $.Velocity.hook($("svg"), "scale", 0);
        $("svg").velocity({
            scale: 1
        }, {
            easing: "easeOutExpo",
            duration: 800
        })
    }

    // Adjust animation parameters for startup
    var duration = startup ? 800 : 400;
    var easing = startup ? "easeOutExpo" : [100, 10];

    // Sort hands in order of progress
    var progress_array = [
        ["#hour-hand", hour_progress],
        ["#minute-hand", minute_progress],
        ["#second-hand", second_progress]
    ];
    progress_array.sort(function(a, b) {
        var value = 0;
        if (a[1] > a[1]) {
            value = 1;
        } else if (a[1] < b[1]) {
            value = -1;
        }
        return value;
    });

    // Reduce duration of animation according to highest hand progress
    var duration_array = [1.2, 1.1, 1];
    progress_array.forEach(function(unit, index) {
        $(unit[0]).velocity({
            rotateZ: unit[1]
        }, {
            easing: easing,
            duration: startup ? duration / duration_array[index] : duration
        });
    });

    // Refresh clock in 1 second
    setTimeout(updateClock, 1000);
}
