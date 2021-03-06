// Represents density of stars to be display initially (stars/pixel)
var STAR_DENSITY = 0.0005;
// Represents how many stars are to be display on screen
var stars;

$(function() {
    // Attach Fastlick
    FastClick.attach(document.body);
    // Set initial star count based on window size
    stars = Math.round($(window).height() * $(window).width() * STAR_DENSITY);
    // Spawn initial stars
    spawnStars();
    // Clicking on document opens up prompt to change number of stars
    $(document).click(changeNumberOfStars);
});

function changeNumberOfStars() {
    // Text to display to user
    var prompt_text = 'There are currently ' + stars +
        ' stars. Enter a new number of stars below:';
    // Spawn given number of stars
    spawnStars(prompt(prompt_text));
}

function spawnStars(num_stars) {
    // Set number of stars to given stars, if none given, to previously set
    // number, if no previously set, then use resolution of window
    stars = num_stars || stars;
    // Remove all previous stars
    $('.star').remove();
    // Spawn given number of stars in current round
    for (var i = stars; i > 0; i--) {
        spawnStar();
    }
}

function spawnStar() {
    // Create new star
    var element = $('<div></div>');

    // Create randomized values for stars properties
    var startup_delay = Math.random() * Math.max(Math.min(stars, 1000), 200) * 10;
    var twinkle_duration = 1500 + Math.random() * 500;
    var size = Math.ceil(Math.random() * 4);
    var x_position = Math.random() * 100 + '%';
    var y_position = Math.random() * 100 + '%';
    var raw_hue = Math.random() > 0.5 ? 200 : 360;
    var hue_shift = Math.random() * 10;
    var hue = raw_hue === 360 ? raw_hue - hue_shift : raw_hue + hue_shift;
    var star_saturation = 80 + Math.random() * 20;
    var star_brightness = 60 + Math.random() * 30;
    var color = 'hsla(' + hue + ', ' + star_saturation + '%, ' +
        star_brightness + '%, 1)';
    var glow_color = 'hsla(' + hue + ', 100%, 50%, 1)';

    // Hook variable properties of star
    $.Velocity.hook(element, 'scale', 0);
    $.Velocity.hook(element, 'opacity', 0);

    // Set properties of star
    element
        .addClass('star')
        // Set constant properties of star
        .css({
            width: size,
            height: size,
            fontSize: size,
            left: x_position,
            top: y_position,
            backgroundColor: color,
            boxShadowColor: glow_color
        })
        // Add random delay to stagger fade in of stars
        // Fade in star to full size
        .velocity({
            scale: 1,
            opacity: 1,
        }, {
            delay: startup_delay,
            duration: twinkle_duration
        })
        // Fade out star
        .velocity({
            scale: 0,
            opacity: 0
        }, {
            duration: twinkle_duration,
            loop: true,
            progress: function(e, c, r) {
                var randomizer = Math.random() > 0;
                if (c === 1 && r === 0) {
                    $(e).data('scalingDown', !$(e).data('scalingDown'));
                    if ($(e).data('scalingDown')) {
                        $(e).css({
                            left: Math.random() * 100 + '%',
                            top: Math.random() * 100 + '%',
                        });
                    }
                }
            }
        })
        // Append star to body
        .appendTo('body');
}
