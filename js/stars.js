// Represents how many stars are to be display on screen
var stars = Math.round($(window).height() * $(window).width() / 2000);

$(function() {
    // Spawn initial stars
    spawnStars(stars);
    // Clicking on document opens up prompt to change number of stars
    $(document).click(changeNumberOfStars);
});

function changeNumberOfStars() {
    // Text to display to user
    var prompt_text = 'There are currently ' + stars + ' stars. Enter a new number of stars below:';
    // Change number of stars to given input and spawn
    spawnStars(stars = prompt(prompt_text));
}

function spawnStars(num_stars) {
    // Remove all previous stars
    $('svg').not(':nth-child(1)').remove()
    for (var i = num_stars; i > 0; i--) {
        // Spawn given number of stars in current round
        spawnStar(true);
    }
}

function spawnStar(delay) {
    // Clone master star
    var element = $('svg:nth-child(1)').clone().appendTo('body');

    // Create randomized values for stars properties
    var size = 5 + Math.random()*5;
    var x_position = Math.random()*100;
    var y_position = Math.random()*100;
    var twinkle_duration = 500 + Math.random()*1500;
    var rotation_angle = -5 + Math.random()*10;
    var rotation_intensity = -45 + Math.random()*90;
    var color = 240 + Math.random()*120;
    var startup_delay = delay ? Math.random()*stars*10 : Math.random()*stars;
    var twinkle_intensity = Math.random();
    var twinkle = Math.random() > 0.5;
    var start_brightness = 80 + Math.random()*20;


    // Create shortcut to hook
    var hook = $.Velocity.hook;

    // Set constant properties of star
    element.css({
        display: 'block',
        width: size,
        height: size,
        left: x_position+'%',
        top: y_position+'%',
        fill: 'hsla(' + color + ', 100%, ' + start_brightness + '%, 1)'
    });

    // Hook variable properties of star
    hook(element, 'rotateZ', (rotation_angle - rotation_intensity) + 'deg');
    hook(element, 'scale', '0');
    hook(element, 'opacity', '0');

    // Animate variable properties of star
    element
        // Add random delay to stagger fade in of stars
        .delay(startup_delay)
        // Fade in star to full size
        .velocity({
            scale: 1,
            opacity: 1,
            rotateZ: rotation_angle
        }, twinkle_duration)
        // Fade out star
        .velocity({
            scale: twinkle ? twinkle_intensity : 0,
            opacity: twinkle ? 0 : twinkle_intensity,
            rotateZ: rotation_angle + rotation_intensity
        }, {
            duration: twinkle_duration,
            loop: true
        });
}
