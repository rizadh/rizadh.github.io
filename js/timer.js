'use strict';

// SVG arcs cannot form a complete circle so a value close to 1 is used
var WHOLECIRCLE = 0.99999;
var EASEFUNC = 'Expo';
var EASE_OUT = 'easeOut' + EASEFUNC;
var EASE_IN = 'easeIn' + EASEFUNC;
var ANIMATION_DURATION = 400;

// Perform when document body is loaded
$(function () {
	// Create variables to access DOM elements
	var display = $('#display');
	var displayText = $('#display-text');
	var keypad = $('#keypad');
	var keypadButtons = keypad.find('td');
	var keyboardHelp = $('#keyboard-help');

	// Attach Fastlick
	FastClick.attach(document.body);

	// Hook Velocity to help menu and display-text translate properties
	$.Velocity.hook(keyboardHelp, 'translateX', '-50%');
	$.Velocity.hook(keyboardHelp, 'translateY', '-50%');
	$.Velocity.hook(displayText, 'translateY', '-50%');

	// Change Backspce to Delete if on Mac or iOS devices
	if (navigator.platform.match(/(Mac|iPhone|iPod|iPad)/i)) {
		keyboardHelp.find('.delete').text('Delete');
	}

	// Disable scrolling if running as full-screen iOS web app
	if (window.navigator.standalone) {
		$(document).on('touchmove', false);
	}

	// Sticky hover fix
	hoverTouchUnstick();

	// Initialize input mode variable represents whether keypad is displayed or
	// not
	display.data('inputMode', true);

	// Startup animation
	$.Velocity.hook(display, 'translateY', '-100%');

	// Handle if time is provided in URL
	var GETtime = GET('time');
	if (validTimeString(GETtime)) {
		// Immediately start timer
		setDisplayTime(('000000' + GETtime).slice(-6));
		$.Velocity.hook(keypad, 'opacity', '0');
		$.Velocity.hook(display, 'height', '90%');
		$.Velocity.hook(display, 'boxShadowblur', '0.2rem');
		$.Velocity.mock = 2;
		startTimer();
		$.Velocity.mock = 1;
	} else {
		$.Velocity.hook(keypadButtons, 'scale', '0');
		$.Velocity.hook(displayText, 'translateY', '-100%');

		// Create slideIn effect for keypad
		$.Velocity.RegisterEffect('swingIn', {
			calls: [
				[{
					scale: 1
				}, 1, {
					easing: EASE_OUT
				}]
			]
		});

		// Animate display
		displayText.velocity({
			translateY: '-50%'
		}, {
			easing: EASE_OUT,
			duration: ANIMATION_DURATION * 1.5,
		});

		// Animate display
		display.velocity({
			translateY: 0
		}, {
			easing: EASE_OUT,
			duration: ANIMATION_DURATION * 1.5,
			complete: function() {
				var timeStarted = parseInt(localStorage.getItem('timeStarted'));
				var durationSet = parseInt(localStorage.getItem('durationSet'));
				var noButton = {
					text: 'No',
					style: 'alert',
					clickFunction: function () {
						localStorage.setItem('timeStarted', '0');
						localStorage.setItem('durationSet', '0');
					}
				};
				var sureButton = {
					text: 'Sure',
					style: 'emphasize',
					clickFunction: function () {
						var progress = 1 - timeLeft() / durationSet;
						if (timeLeft() > 0) {
							$('#dial-ring path')
								.data('timeLeft', timeLeft())
								.data('progress', progress);
							startTimer(false, true);
						} else {
							showNotification(
								'Too late, the timer has already ended'
							);
						}
					}
				}
				if (timeStarted && durationSet) {
					var timeThresholdSec = 5;
					if (timeLeft() > timeThresholdSec * 1000) {
						var message = 'Seems like the timer was still running' +
							' when you last closed this app. Do you want to' +
							' restore the timer?';
						showNotification(message, [noButton, sureButton]);
					}
				}

				/** Returns time left until previous timer ends */
				function timeLeft() {
					return (timeStarted + durationSet) - (new Date()).getTime();
				}
			}
		});

		// Animate keypad
		keypadButtons.velocity('swingIn', {
			duration: ANIMATION_DURATION,
			stagger: ANIMATION_DURATION / 18,
			backwards: true,
			display: null
		});
	}

	// Clear display and show default message
	displayText.data('currentTime', '000000')

	// Set click events
	keypad.on('click', 'td', function () {
		var keyValue = $(this).text();
		if (keyValue === 'Clear') {
			setDisplayTime('');
		} else if (keyValue === 'Start') {
			startTimer();
		} else {
			addDigit(keyValue);
		}
	});
	$('#edit-button').click(editTime);
	display.on('click', '#display-text', togglePause);
	$('#notification-banner').on('click', '.button', hideNotification);

	// Enable keyboard input
	$(document).on('keydown', function (e) {
		var notificationBanner = $('#notification-banner');
		// Get the keycode
		var key = e.keyCode;
		// Do not allow keyboard input if a notification is show
		if (notificationBanner.data('shown')) {
			if (notificationBanner.find('div').text() !== '') {
				switch (key) {
					case 13:
						notificationBanner.find('.emphasize').click();
						break;
					case 27:
						notificationBanner.find('.alert').click();
						break;
				}
			} else {
				hideNotification();
			}
			return false;
		}
		// Perform events depending on keycode
		switch (key) {
			// Backspace - delete a character from display
			case 8:
				e.preventDefault();
				if ($('#display').data('inputMode')) {
					var deletedTime = ('0' + getDisplayTime()).slice(-7, -1);
					setDisplayTime(deletedTime);
				}
				break;

			// Enter - start or cancel timer
			case 13:
				// Activate editing mode if not activated
				if ($('#display').data('inputMode')) {
					startTimer();
				} else {
					editTime();
				}
				break;

			// Escape - cancel timer
			case 27:
				// Activate editing mode if not activated
				if (!$('#display').data('inputMode')) {
					editTime();
				}
				break;

			// Space - toggle keyboard help menu
			case 32:
				if (!$('#display').data('inputMode')) {
					togglePause();
				} else {
					toggleKeyboardHelp();
				}
				break;

			// 0 to 9 - input digits into display
			case 48:
			case 49:
			case 50:
			case 51:
			case 52:
			case 53:
			case 54:
			case 55:
			case 56:
			case 57:
				// Activate editing mode if not activated
				if ($('#display').data('inputMode')) {
					// Obtain entered character
					var keyValue = String.fromCharCode(key);
					addDigit(keyValue);
					break;
				}

		}

		// Hide help menu unless spacebar was clicked
		if (key !== 32) {
			toggleKeyboardHelp(false);
		}
	});

	// Disable suggesting a mouse if user has a touch device
	$(document).on('touchstart', function () {
		localStorage.setItem('touch-device', 'true');
	});

	// Hide keyboard help when anything is tapped
	$(document).click(function (e) {
		if (!$(e.target).hasClass('button')) {
			toggleKeyboardHelp(false);
		}
		var touchDevice = localStorage.getItem('touch-device');
		var suggestedMouse = localStorage.getItem('mouse-suggested');
		var suggestedMouseSession = sessionStorage.getItem('mouse-suggested');
		var tempSuggestion = suggestedMouse === 'temp';
		var showAgain = tempSuggestion && !suggestedMouseSession;

		if (!touchDevice && (!suggestedMouse || showAgain)) {
			localStorage.setItem('mouse-suggested', 'true');
			sessionStorage.setItem('mouse-suggested', 'true');
			showNotification(
				'Seems like you have a keyboard. ' +
				'Want to learn a few shortcuts?', [{
					text: 'Never',
					style: 'alert',
					clickFunction: function () {}
				}, {
					text: 'Not right now',
					style: 'normal',
					clickFunction: function () {
						localStorage.setItem('mouse-suggested', 'temp');
					}
				}, {
					text: 'Yes, show me',
					style: 'emphasize',
					clickFunction: function () {
						toggleKeyboardHelp(true);
					}
				}]
			);
		}
	});

	// Adjust font-sizes when viewport dimensions change
	$(window).on('load resize orientationChange', function () {
		// Maximize size of text
		var maxLength = Math.min($(window).height(), $(window).width()*1.5);
		$('html').css('font-size', maxLength / 9);
	});
});



/**
 * Returns the value of the display.
 * @param {boolean} actual - True if the actual text of the display is wanted.
 */
function getDisplayTime() {
	return $('#display-text').data('currentTime');
}

/** Check if the supplied number represents a displayable amount of time */
function validTimeString(timeString) {
	var hoursToSeconds = timeString.slice(-6, -4) * 3600;
	var minutesToSeconds = timeString.slice(-4, -2) * 60;
	var seconds = timeString.slice(-2) * 1;
	var totalSeconds = hoursToSeconds + minutesToSeconds + seconds;
	return totalSeconds > 0 && totalSeconds < 360000;
}

/**
 * Sets the display time
 * @param (string) text - Value to be set
 * @param {boolean} actual - If true, display's text is changed directly to
 *                           specified value or if parsing is applied first
 * @param {boolean} fancy - Determines whether fancy animation is used
 */
function setDisplayTime(text, fancy) {
	var display = $('#display-text');
	var newDisplayText = display.clone(true).css('font-size', '1em');
	if (text === '000000' || text === '') {
		newDisplayText
			.data('currentTime', '000000')
			.text('0s')
			.css('font-family', 'robotoregular');
		changeDisplayText(newDisplayText, fancy ? 'fancy' : '');
	} else if (text === 'Done') {
		newDisplayText
			.data('currentTime', '000000')
			.text(text)
			.css('font-family', 'robotoregular');
		changeDisplayText(newDisplayText, fancy ? 'fancy' : '');
	} else if (text === 'Paused') {
		newDisplayText
			.text(text)
			.css('font-family', 'robotoregular');
		changeDisplayText(newDisplayText, fancy ? 'fancy' : '');
	} else if (display.data('currentTime') !== text ||
		display.text() === 'Paused') {
		newDisplayText
			.data('currentTime', text)
			.css('font-family', 'robotoregular');
		var timeArray = [];
		var unitArray = ['h', 'm', 's'];
		for (var i = 0; i < 3; i++) {
			var timeValue = text.slice(2 * i, 2 * i + 2);
			if (timeValue > 0 || timeArray[0] || i === 2) {
				if (timeValue < 10 && !timeArray[0]) {
					timeValue = timeValue.slice(-1);
				}
				timeArray.push(timeValue + unitArray[i]);
			}
		}
		var newTime = timeArray.join(' ');
		if ($(window).height()*0.9 > $(window).width()) {
			var newFontSize;
			if ($(window).height() < $(window).width()*1.5) {
				var lowerBound = 1/0.9; // Max size
				var upperBound = 1.5; // Min size
				var ratio = $(window).height() / $(window).width();
				var weight = (upperBound - ratio) / (upperBound - lowerBound);
				newFontSize = Math.min(8/newTime.length*(1-weight)+1*(weight), 1);
			} else {
				newFontSize = Math.min(8/newTime.length, 1);
			}
			newDisplayText.css('font-size', newFontSize + 'em');
		}
		newDisplayText.text(newTime);
		changeDisplayText(newDisplayText, fancy ? 'fancy' : '');
	}
}

/**
 * Changes the text displayed
 * @param (jQuery) newDisplayText - The new #display element
 * @param {string} style - The style of animation to use when changing text
 */
function changeDisplayText(newDisplayText, style) {
	$('#display-text-old').remove();
	var displayText = $('#display-text');
	if (style === 'fancy') {
		var displayHTML = displayText.text();
		var newDisplayHTML = newDisplayText.text();
		var displayNewHTML = '';
		var newDisplayNewHTML = '';
		if (displayHTML.length === newDisplayHTML.length) {
			for (var i = 0; i < displayHTML.length; i++) {
				if (displayHTML[i] === newDisplayHTML[i]) {
					displayNewHTML += displayHTML[i];
					newDisplayNewHTML += newDisplayHTML[i];
				} else {
					displayNewHTML += '<span>' + displayHTML[i] + '</span>';
					newDisplayNewHTML += '<span>' + newDisplayHTML[i] + '</span>';
				}
			}
		} else {
			displayNewHTML += '<span>' + displayHTML + '</span>';
			newDisplayNewHTML += '<span>' + newDisplayHTML + '</span>';
		}

		var replaceSpan = /<\/span><span>/gi;
		displayText
			.attr('id', 'display-text-old')
			.html(displayNewHTML.replace(replaceSpan, ''))
			.children('span')
			.velocity({
				opacity: 0,
				scale: 0.5
			}, {
				easing: EASE_OUT,
				duration: ANIMATION_DURATION,
				queue: false,
				display: 'inline-block',
				complete: function () {
					$(this).parent().remove();
				}
			});

		newDisplayText
			.html(newDisplayNewHTML.replace(replaceSpan, ''))
			.children('span')
			.css('opacity', 0)
			.velocity({
				opacity: [1, 0],
				scale: [1, 0.5]
			}, {
				easing: EASE_OUT,
				duration: ANIMATION_DURATION,
				queue: false,
				display: 'inline-block'
			});
		newDisplayText.appendTo('#display')
	} else {
		displayText.remove();
		newDisplayText.appendTo('#display');
	}
}

function addDigit(digit) {
	var newTime = (getDisplayTime() + digit).slice(-6);
	setDisplayTime(newTime);
}

function startTimer(resume, restore) {
	// Create variable to reduce jQuery calls
	var display = $('#display');
	var displayText = display.find('#display-text');
	// Fixed alignment issues if startup animation was interrupted
	$.Velocity.hook(displayText, 'translateY', '-50%');
	// Convert display input to seconds
	var timeString = getDisplayTime();
	var hoursToSeconds = timeString.slice(-6, -4) * 3600;
	var minutesToSeconds = timeString.slice(-4, -2) * 60;
	var seconds = timeString.slice(-2) * 1;
	var totalSeconds = hoursToSeconds + minutesToSeconds + seconds;

	// Limit seconds to less than 100 hours
	if (totalSeconds === 0 && !resume && !restore) {
		showNotification('Please enter a time first');
	} else if (totalSeconds < 360000 || restore || resume) {
		// Start dial motion and set state to timing mode
		setTime(totalSeconds, resume || restore);
		display.data('inputMode', false);
		display.addClass('running');

		if (!resume) {
			// Expand display
			display
				.velocity('stop')
				.velocity({
					height: '90%',
					translateY: 0,
					boxShadowBlur: '0.2rem'
				}, {
					duration: ANIMATION_DURATION,
					easing: EASE_OUT
				});

			// Fade out keys
			$('#keypad')
				.velocity('stop')
				.velocity({
					translateY: '10%',
					opacity: 0
				}, {
					easing: EASE_OUT,
					duration: ANIMATION_DURATION,
					display: 'none'
				});

			// Fade in edit button
			$('#edit-button')
				.velocity('stop')
				.velocity({
					translateY: [0, '100%'],
					opacity: [1, 0]
				}, {
					easing: EASE_OUT,
					duration: ANIMATION_DURATION,
					display: 'block'
				});

			// Fade in ring
			$('#dial-ring')
				.velocity('stop')
				.velocity({
					opacity: [1, 0],
					scale: [1, 0]
				}, {
					easing: EASE_OUT,
					duration: ANIMATION_DURATION,
					display: 'block'
				});
		}
	} else {
		showNotification(
			'The time entered was too high. Enter a time less than 100 hours'
		);
		setDisplayTime('');
	}
}

/**
 * Initiate the timer
 * @param {number} sec - Number of seconds to time
 * @param {boolean} resume - If true, timer will resume from stored state
 */
function setTime(sec, resume) {
	// Convert seconds to milliseconds
	var dialPath = $('#dial-ring path');
	var dialTime = resume ? dialPath.data('timeLeft') : sec * 1000;
	var initialProgress = resume ? dialPath.data('progress') : 0;

	dialPath.velocity('stop').velocity({
		// Can't go to 1 with SVG arc
		tween: [WHOLECIRCLE, initialProgress]
	}, {
		duration: dialTime,
		easing: 'linear',
		begin: function () {
			localStorage.setItem('timeStarted', (new Date()).getTime());
			localStorage.setItem('durationSet', dialTime);
		},
		progress: function (e, c, r, s, t) {
			setDial(dialPath, 40, t);
			// Store progress in data
			dialPath.data('progress', t);
			dialPath.data('timeLeft', r);
			// Find seconds rounded up
			var totalSeconds = Math.ceil(r / 1000);
			// Find minutes rounded down
			var minutes = Math.floor(totalSeconds / 60) % 60;
			// Find hours rounded down
			var hours = Math.floor(totalSeconds / 3600);
			// Find remaining seconds
			var seconds = totalSeconds % 60;
			// Force 2 digits
			seconds = ('0' + seconds).slice(-2);
			minutes = ('0' + minutes).slice(-2);
			hours = ('0' + hours).slice(-2);
			var times = [hours, minutes, seconds];
			if (r !== 0) {
				// Send time text to display
				setDisplayTime(times.join(''), true);
			}
		},
		complete: function () {
			setDisplayTime('Done', true);
			$('#display').removeClass('running');
			localStorage.setItem('timeStarted', 0);
			localStorage.setItem('durationSet', 0);
		}
	});
}

/** Set dial of given radius to given progress */
function setDial(dial, arcRadius, progress) {
	var boxRadius = 50;

	// Calculate path parameters
	var offset = boxRadius - arcRadius;
	var sweep = progress >= 0.5 ? 1 : 0;
	var arcPosX = offset + arcRadius * (1 + Math.sin(2 * Math.PI * progress));
	var arcPosY = offset + arcRadius * (1 - Math.cos(2 * Math.PI * progress));
	var arcPos = arcPosX + ' ' + arcPosY;
	var arcDimensions = arcRadius + ' ' + arcRadius;
	var arcParameters = ' 0 ' + sweep + ' 1 ';

	// Calculate path segments
	var moveToCenter = 'M' + boxRadius + ' ' + boxRadius;
	var moveToStart = 'm0 ' + (-arcRadius);
	var makeArc = 'A' + arcDimensions + arcParameters + arcPos;

	// Creath path from segments
	var dialPath = moveToCenter + moveToStart + makeArc;

	// Set path
	dial.attr('d', dialPath);
}

/** Activates input mode */
function editTime() {
	setDisplayTime(getDisplayTime(), true);
	$('#display').data('inputMode', true).data('paused', false);
	$('#display').removeClass('running');
	localStorage.setItem('timeStarted', 0);
	localStorage.setItem('durationSet', 0);
	$('#dial-ring path')
		.velocity('stop');
	$('#display')
		.velocity('stop')
		.velocity({
			height: '20%',
			boxShadowBlur: '0.1rem'
		}, {
			duration: ANIMATION_DURATION,
			easing: EASE_OUT,
		});
	$('#keypad')
		.velocity('stop')
		.velocity({
			translateY: 0,
			opacity: 1
		}, {
			easing: EASE_OUT,
			duration: ANIMATION_DURATION,
			display: 'table'
		});
	$('#edit-button')
		.velocity('stop')
		.velocity({
			opacity: 0,
			translateY: '-700%'
		}, {
			easing: EASE_OUT,
			display: 'none',
			duration: ANIMATION_DURATION
		});
	$('#dial-ring')
		.velocity('stop')
		.velocity('fadeOut', 100);
}

/** Toggles pause state of timer */
function togglePause() {
	if (!$('#display').data('inputMode')) {
		if ($('#display').data('paused')) {
			startTimer(true);
			$('#display').data('paused', false);
			$('#dial-ring')
				.velocity('stop')
				.velocity({
					opacity: 1
				}, {
					easing: EASE_OUT,
					duration: ANIMATION_DURATION
				});
		} else if ($('#display').hasClass('running')) {
			$('#dial-ring path').velocity('stop');
			setDisplayTime('Paused', true);
			$('#display').data('paused', true);
			$('#dial-ring')
				.velocity('stop')
				.velocity({
					opacity: 0.25
				}, {
					easing: EASE_OUT,
					duration: ANIMATION_DURATION
				});
		}
	}
}

/** Toggles keyboard */
function toggleKeyboardHelp(forceState) {
	var helpMenu = $('#keyboard-help');
	if (arguments.length === 0) {
		var show = !helpMenu.data('shown');

		helpMenu
			.data('shown', show)
			.velocity('stop')
			.velocity({
				scale: (show ? [1, 0] : [0.5, 1]),
				opacity: (show ? [1, 0] : [0, 1])
			}, {
				easing: show ? EASE_OUT : EASE_IN,
				display: show ? 'block' : 'none',
				duration: (show ? ANIMATION_DURATION :
					ANIMATION_DURATION / 4)
			});

	} else if (!!helpMenu.data('shown') === !forceState){
		toggleKeyboardHelp();
	}
}

/** Show a notification with given message and buttons */
function showNotification(message, buttons) {
	var bannerText = $('#notification-banner span').text(message);
	var button_wrapper = bannerText.siblings('div').empty();

	if (buttons) {
		$('#content').css('pointer-events', 'none');
		for (var i = buttons.length - 1; i >= 0; i--) {
			var button = buttons[i];
			$('<div></div>')
				.text(button.text)
				.addClass(button.style + ' button')
				.click(button.clickFunction)
				.prependTo(button_wrapper);
		}
	}

	bannerText.parent()
		.velocity('stop')
		.velocity({
			translateY: bannerText.parent().data('shown') ? 0 : [0, '-100%']
		}, {
			easing: EASE_OUT,
			display: 'block',
			duration: ANIMATION_DURATION,
			complete: function() {
				if (buttons) {
					$('#content').on('click.bannerhide', hideNotification);
				} else {
					$(document).on('click.bannerhide', hideNotification);
				}
			}
		})
		.data('shown', true);
}

/** Hide any notifications that are present */
function hideNotification() {
	$(document).off('click.bannerhide', hideNotification);
	$('#content').off('click.bannerhide', hideNotification);
	$('#content').css('pointer-events', '');
	var banner = $('#notification-banner');
	if (banner.data('shown')) {
		$('#notification-banner')
			.data('shown', false)
			.velocity('stop')
			.velocity({
				translateY: '-100%'
			}, {
				easing: EASE_IN,
				display: 'none',
				duration: ANIMATION_DURATION / 4
			});
	}
}

/** Prevent sticker hover state on some devices */
function hoverTouchUnstick() {
	// Check if the device supports touch events
	if ('ontouchstart' in document.documentElement) {
	// Loop through each stylesheet
	for (var sheetI = document.styleSheets.length - 1; sheetI >= 0; sheetI--) {
	var sheet = document.styleSheets[sheetI];
	// Verify if cssRules exists in sheet
	if (sheet.cssRules) {
	// Loop through each rule in sheet
	for (var ruleI = sheet.cssRules.length - 1; ruleI >= 0; ruleI--) {
	var rule = sheet.cssRules[ruleI];
	// Verify rule has selector text
	if (rule.selectorText) {
	// Replace hover psuedo-class with active psuedo-class
	rule.selectorText = rule.selectorText.replace(':hover', ':active');
	}
	}
	}
	}
	}
}

/** Retrive GET request from URL */
function GET(q, s) {
	s = (s) ? s : window.location.search;
	var re = new RegExp('&amp;' + q + '=([^&amp;]*)', 'i');
	return (s = s.replace(/^\?/, '&amp;').match(re)) ? s = s[1] : s = '';
}
