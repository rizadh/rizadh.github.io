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

    // Create varibles to acces each hand
    var hour_hand = $("#hour-hand");
    var minute_hand = $("#minute-hand");
    var second_hand = $("#second-hand");

    // Prevent clock from spinning back to return to zero
    if (hour_progress == 0) {
        $.Velocity.hook(hour_hand, "rotateZ", "-30deg");
    }
    if (minute_progress == 0) {
        $.Velocity.hook($minute_hand, "rotateZ", "-6deg");
    }
    if (second_progress == 0) {
        $.Velocity.hook(second_hand, "rotateZ", "-6deg");
    }

    if (startup) {
        var clock = $("svg");
        $.Velocity.hook(clock, "scale", 0);
        $.Velocity.hook(clock, "opacity", 0);
        clock.velocity({
            scale: 1,
            opacity: 1
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
        [hour_hand, hour_progress],
        [minute_hand, minute_progress],
        [second_hand, second_progress]
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
    var highest_progress = progress_array[2][1];

    progress_array.forEach(function(unit, index) {
        unit[0].velocity({
            rotateZ: unit[1]
        }, {
            easing: easing,
            // Duration of rotation depends on how far it has to go
            duration: startup ? (duration*(unit[1]/highest_progress)) : duration
        });
    });

    // Refresh clock in 1 second
    setTimeout(updateClock, 1000);
}
