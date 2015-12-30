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
	var prompt_text = 'There are currently ' + stars +
		' stars. Enter a new number of stars below:';
	// Get input from user
	var newStars = prompt(prompt_text);
	// If input was not empty, spawn given number of stars
	if (newStars) spawnStars(stars = newStars);
}

function spawnStars(num_stars) {
	// Remove all previous stars
	$('.star').remove()
	for (var i = num_stars; i > 0; i--) {
		// Spawn given number of stars in current round
		spawnStar();
	}
}

function spawnStar() {
	// Create new star
	var element = $('<div></div>');

	// Create randomized values for stars properties
	var startup_delay = Math.random()*stars*10;
	var twinkle_duration = 500 + Math.random()*500;
	var size = Math.ceil(Math.random()*5);
	var x_position = Math.random()*100 + '%';
	var y_position = Math.random()*100 + '%';
	var hue = 240 + Math.random()*120;
	var star_saturation = 75 + Math.random()*25;
	var star_brightness = 75 + Math.random()*25;
	var color = 'hsla(' + hue + ', ' + star_saturation + '%, ' +
		star_brightness + '%, 1)';
	var twinkle_intensity = Math.random();

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
			left: x_position,
			top: y_position,
			backgroundColor: color
		})
		// Add random delay to stagger fade in of stars
		.delay(startup_delay)
		// Fade in star to full size
		.velocity({
			scale: 1,
			opacity: 1
		}, twinkle_duration)
		// Fade out star
		.velocity({
			scale: 0,
			opacity: twinkle_intensity
		}, {
			duration: twinkle_duration,
			loop: true
		})
		// Append star to body
		.appendTo('body');
}
