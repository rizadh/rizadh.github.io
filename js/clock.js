'use strict';

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
    if (hours > 12) hours -= 12;

    // Get progress of each hand around clock
    var hour_progress = 30*hours;
    var minute_progress = 6*minutes;
    var second_progress = 6*seconds;

    // Create varibles to access each hand
    var hour_hand = $('#hour-hand');
    var minute_hand = $('#minute-hand');
    var second_hand = $('#second-hand');

    // Create array to easily iterate over hands and their progress
    var progress_array = [
        [hour_hand, hour_progress],
        [minute_hand, minute_progress],
        [second_hand, second_progress]
    ];

    if (startup) {
        var clock = $('svg');
        $.Velocity.hook(clock, 'scale', 0);
        $.Velocity.hook(clock, 'opacity', 0);
        clock.velocity({
            scale: 1,
            opacity: 1
        }, {
            easing: 'easeOutExpo',
            duration: 800
        });
    }

    // Adjust animation parameters for startup
    var duration = startup ? 800 : 400;
    var easing = startup ? 'easeOutExpo' : [100, 5];

    progress_array.forEach(function(unit, index) {
        var old_progress  = parseInt($.Velocity.hook(unit[0], 'rotateZ'));
        if (old_progress > unit[1]) {
            $.Velocity.hook(unit[0], 'rotateZ', (old_progress - 360) + 'deg');
        }

        if (old_progress !== unit[1]) {
            unit[0].velocity('stop').velocity({
                rotateZ: unit[1]
            }, {
                easing: easing,
                duration: duration
            });
        }
    });

    // Refresh clock in 1 second
    setTimeout(updateClock, 1000);
}
