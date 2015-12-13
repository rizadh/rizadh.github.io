var stars = 100;
$(function() {
    spawnStars(stars);
    $(document).on("tap", function() {
        var prompt_text = "There are currently " + stars + " stars. Enter a new number of stars below:";
        spawnStars(stars = prompt(prompt_text));
    });
});

function spawnStars(num_stars) {
    $("svg").not(":nth-child(1)").remove();
    for (var i = 0; i < num_stars; i++) {
        var element = $("svg:nth-child(1)").clone().appendTo("body");
        var size = 5 + Math.random()*5;
        var x_position = Math.random()*100;
        var y_position = Math.random()*100;
        var twinkle_duration = 500 + Math.random()*1500;
        var rotation_angle = -5 + Math.random()*10;
        var rotation_intensity = -45 + Math.random()*90;
        var color = 240 + Math.random()*120;
        var startup_delay = Math.random()*num_stars*10;
        var twinkle_intensity = 0.25 + Math.random()*0.25
        var start_brightness = 75 + Math.random()*25;
        var hook = $.Velocity.hook;

        element.css({
            display: "block",
            width: size,
            height: size,
            left: x_position+"%",
            top: y_position+"%",
            fill: "hsla(" + color + ", 100%, " + start_brightness + "%, 1)"
        });

        hook(element, "rotateZ", (rotation_angle + rotation_intensity)+"deg");
        hook(element, "scale", "0");
        hook(element, "opacity", "0");
        element
            .delay(startup_delay)
            .velocity({
                scale: 1,
                opacity: 1,
                rotateZ: rotation_angle
            }, twinkle_duration)
            .velocity({
                scale: twinkle_intensity,
                opacity: twinkle_intensity,
                rotateZ: rotation_angle + rotation_intensity
            }, {
                duration: twinkle_duration,
                loop: true
            });
    }
}
