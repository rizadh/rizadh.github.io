var stars = 100;
$(function() {
    spawnStars(stars);
    $(document).click(changeNumberOfStars);
});

function changeNumberOfStars() {
    var prompt_text = 'There are currently ' + stars + ' stars. Enter a new number of stars below:';
    spawnStars(stars = prompt(prompt_text));
}

function spawnStars(num_stars) {
    $('svg').not(':nth-child(1)').remove();
    for (var i = num_stars; i > 0; i--) {
        spawnStar(true);
    }
}

function spawnStar(delay) {
    var element = $('svg:nth-child(1)').clone().appendTo('body');
    var size = 5 + Math.random()*5;
    var x_position = Math.random()*100;
    var y_position = Math.random()*100;
    var twinkle_duration = 500 + Math.random()*1500;
    var rotation_angle = -5 + Math.random()*10;
    var rotation_intensity = -45 + Math.random()*90;
    var color = 240 + Math.random()*120;
    var startup_delay = delay ? Math.random()*stars*10 : 0;
    var twinkle_intensity = 0 + Math.random()*0.5
    var start_brightness = 80 + Math.random()*20;
    var hook = $.Velocity.hook;

    element.css({
        display: 'block',
        width: size,
        height: size,
        left: x_position+'%',
        top: y_position+'%',
        fill: 'hsla(' + color + ', 100%, ' + start_brightness + '%, 1)'
    });

    hook(element, 'rotateZ', (rotation_angle - rotation_intensity)+'deg');
    hook(element, 'scale', '0');
    hook(element, 'opacity', '0');
    element
        .delay(startup_delay)
        .velocity({
            scale: 1,
            opacity: 1,
            rotateZ: rotation_angle
        }, twinkle_duration)
        .velocity({
            scale: twinkle_intensity,
            opacity: 0,
            rotateZ: rotation_angle + rotation_intensity
        }, {
            duration: twinkle_duration,
            complete: function() {
                $(this).remove();
                spawnStar(false);
            }
        });
}
