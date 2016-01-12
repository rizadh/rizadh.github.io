(function() {
'use strict';

// SVG arcs cannot form a complete circle so a value close to 1 is used
var WHOLECIRCLE = 0.99999;
var EASEFUNC = 'Expo';
var EASE_OUT = 'easeOut' + EASEFUNC;
var EASE_IN = 'easeIn' + EASEFUNC;
var ANIMATION_DURATION = 300;
var windowWidth;
var windowHeight;

// Perform when document body is loaded
$(function () {
	// Create variables to access DOM elements
	var display = $('#display');
	var displayText = $('#display-text');
	var keypad = $('#keypad');
	var keyboardHelp = $('#keyboard-help');

	// Attach Fastlick
	FastClick.attach(document.body);

	// Hook Velocity to help menu and display-text translate properties
	$.Velocity.hook(keyboardHelp, 'translateX', '-50%');
	$.Velocity.hook(keyboardHelp, 'translateY', '-50%');
	$.Velocity.hook(displayText, 'translateX', '-50%');
	$.Velocity.hook(displayText, 'translateY', '-50%');
	$.Velocity.hook(keypad, 'translateX', '-50%');

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

	if (isSupportedCSS('-webkit-backdrop-filter') ||
		isSupportedCSS('-moz-backdrop-filter') ||
		isSupportedCSS('-o-backdrop-filter') ||
		isSupportedCSS('-ms-backdrop-filter') ||
	    isSupportedCSS('backdrop-filter') ) {
			$('body').addClass('backdrop-filter');
	}

	// Initialize input mode variable represents whether keypad is displayed or
	// not
	display.data('inputMode', true);

	// Startup animation
	$.Velocity.hook(display, 'translateY', '-100%');
	keypad.css('opacity', 0);

	// Handle if time is provided in URL
	var GETtime = GET('time');
	if (validTimeString(GETtime)) {
		// Immediately start timer
		setDisplayTime(('000000' + GETtime).slice(-6));
		display.css('height', '90%');
		startTimer();
	} else {
		$.Velocity.hook(keypad, 'translateY', '20%');
		$.Velocity.hook(displayText, 'translateY', '-100%');

		var startupAnimationDuration = ANIMATION_DURATION * 1.5;

		// Animate keypad
		keypad.velocity({
			opacity: 1,
			translateY: 0
		}, {
			easing: EASE_OUT,
			duration: startupAnimationDuration
		});

		// Animate display text
		displayText.velocity({
			translateY: '-50%',
			rotateX: 0
		}, {
			easing: EASE_OUT,
			duration: startupAnimationDuration
		});

		// Animate display
		display.velocity({
			translateY: 0
		}, {
			easing: EASE_OUT,
			duration: startupAnimationDuration,
			complete: function() {
				var timeStarted = parseInt(localStorage.getItem('timeStarted'));
				var durationSet = parseInt(localStorage.getItem('durationSet'));
				if (timeStarted && durationSet) {
					var timeThresholdSec = 5;
					if (timeLeft() > timeThresholdSec * 1000) {
						var message = 'Seems like the timer was still running' +
							' when you last closed this app. Do you want to' +
							' restore the timer?';
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
						};
						showNotification(message, [noButton, sureButton]);
					}
				}

				/** Returns time left until previous timer ends */
				function timeLeft() {
					return (timeStarted + durationSet) - (new Date()).getTime();
				}
			}
		});
	}

	// Clear display and show default message
	displayText.data('currentTime', '000000');

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
				return false;
			} else {
				hideNotification();
			}
		}
		// Perform events depending on keycode
		switch (key) {
			// Backspace - delete a character from display
			case 8:
				e.preventDefault();
				if ($('#display').data('inputMode')) {
					var deletedTime = ('0' + displayTime()).slice(-7, -1);
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
		var jWindow = $(window);
		windowWidth = jWindow.width();
		windowHeight = jWindow.height();
		// Maximize size of text
		var maxLength = Math.min(windowWidth * 1.5, windowHeight);
		$('html').css('font-size', maxLength / 9);
	});
});



/** Returns the value of the display. */
function displayTime() {
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
 * @param {boolean} style - Determines style of animation used
 */
function setDisplayTime(text, style) {
	// Determines whether display needs to be updated
	var update = false;
	// New text to be show on display
	var newText = '';
	// New font size of display
	var newFontSize = '1rem';
	// 6-digit represntation of stored display time
	var currentTime = '';
	// jQuery variables for easy access
	var displayText = $('#display-text');
	var oldDisplayText = displayText.clone(true).attr('id', 'display-text-old');

	// Handle special cases
	switch (text) {
		case '000000': // Handle zero input
		case '': // Handle empty input
			text = '0s';
		/* falls through */
		case 'Done': // Handle timer completion
			currentTime = '000000';
		/* falls through */
		case 'Paused': // Handle timer pause
			newText = text;
			update = true;
			break;
		default: // Handle regular text change (timing or inputting)
			if (displayText.data('currentTime') !== text ||
				displayText.text() === 'Paused') {
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

				// Shrink text to fit into dial ring for narrower windows
				if (windowHeight * 0.9 > windowWidth && newTime.length > 8) {
					// Gradually scale down to shrunken size
					if (windowHeight < windowWidth * 1.5) {
						// Max possible ratio
						var lowerBound = 1 / 0.9;
						// Min possible ratio
						var upperBound = 1.5;
						var ratio = windowHeight / windowWidth;
						var weight = (upperBound - ratio) / (upperBound - lowerBound);
						newFontSize = 8 / newTime.length * (1 - weight) + weight;
					}
					// Limit width to width of 8 characters
					else {
						newFontSize = 8 / newTime.length;
					}
					newFontSize += 'rem';
				}

				currentTime = text;
				newText = newTime;
				update = true;
			}
	}

	// Update display only if it needs to be updated
	if (update) {
		// Remove stray elements
		$('#display-text-old').remove();
		// Crossfade style animation
		if (style === 'crossfade') {
			var oldDisplayHTML = displayText.text();
			var newDisplayHTML = newText;
			var spannedOldDisplayHTML = '';
			var spannedNewDisplayHTML = '';

			// Selective crossfading only if text is same length
			if (oldDisplayHTML.length === newDisplayHTML.length) {
				// Iterate through every letter in each text for matches
				for (var n = 0; n < oldDisplayHTML.length; n++) {
					// Add matched text normally to new text
					if (oldDisplayHTML[n] === newDisplayHTML[n]) {
						spannedOldDisplayHTML += oldDisplayHTML[n];
						spannedNewDisplayHTML += newDisplayHTML[n];
					}
					// Wrap altered text with span for subsequent animation
					else {
						spannedOldDisplayHTML += '<span>' + oldDisplayHTML[n] +
							'</span>';
						spannedNewDisplayHTML += '<span>' + newDisplayHTML[n] +
							'</span>';
					}
				}
			}
			// Crossfade entire text if lengths differ from each other
			else {
				spannedOldDisplayHTML = '<span>' + oldDisplayHTML + '</span>';
				spannedNewDisplayHTML = '<span>' + newDisplayHTML + '</span>';
			}

			// Regex to find duplicate spans
			var replaceSpan = /<\/span><span>/gi;
			oldDisplayText
				.html(spannedOldDisplayHTML
					.replace(replaceSpan, '')
					.replace(' ', '&nbsp;')
				)
				.children('span')
				.velocity({
					opacity: [0, 1],
					scale: 0.5
				}, {
					easing: EASE_OUT,
					duration: Math.min(ANIMATION_DURATION, 1000),
					queue: false,
					display: 'inline-block',
					complete: function () {
						$(this).parent().remove();
					}
				})
				.end()
				.prependTo(displayText.parent());

			displayText
				.data('currentTime', currentTime)
				.html(spannedNewDisplayHTML
					.replace(replaceSpan, '')
				 	.replace(' ', '&nbsp;')
				)
				.css({
					fontFamily: 'robotoregular'
				})
				.children('span')
				.css('opacity', 0)
				.velocity({
					opacity: 1,
					scale: [1, 0.5]
				}, {
					easing: EASE_OUT,
					duration: Math.min(ANIMATION_DURATION, 1000),
					queue: false,
					display: 'inline-block',
					complete: function() {
						$(this).contents().unwrap();
					}
				});

			displayText.add(oldDisplayText)
				.velocity({
					fontSize: newFontSize
				}, {
					easing: [100, 10],
					duration: ANIMATION_DURATION,
					queue: false
				});
		}
		// Default "animation" (solid transition)
		else {
			displayText
				.data('currentTime', currentTime)
				.css({
					fontFamily: 'robotoregular',
					fontSize: newFontSize
				})
				.html(newText);
		}
	}
}

function addDigit(digit) {
	var newTime = (displayTime() + digit).slice(-6);
	setDisplayTime(newTime);
}

function startTimer(resume, restore) {
	// Create variables to reduce jQuery calls
	var display = $('#display');
	var displayText = display.find('#display-text');
	// Convert display input to seconds
	var timeString = displayTime();
	var hoursToSeconds = timeString.slice(-6, -4) * 3600;
	var minutesToSeconds = timeString.slice(-4, -2) * 60;
	var seconds = timeString.slice(-2) * 1;
	var totalSeconds = hoursToSeconds + minutesToSeconds + seconds;

	// Fixed alignment issues if startup animation was interrupted
	$.Velocity.hook(displayText, 'translateY', '-50%');

	// Limit seconds to less than 100 hours
	if (totalSeconds === 0 && !resume && !restore) {
		showNotification('Please enter a time first');
	} else if (totalSeconds < 360000 || restore || resume) {
		// Start dial motion and set state to timing mode
		setTime(totalSeconds, resume || restore);
		display
			.data('inputMode', false)
			.addClass('running');

		if (!resume) {
			// Expand display
			display
				.velocity('stop')
				.velocity({
					height: '90%',
					translateY: 0
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
				setDisplayTime(times.join(''), 'crossfade');
			}
		},
		complete: function () {
			setDisplayTime('Done', 'crossfade');
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
	var display = $('#display');
	setDisplayTime(displayTime(), 'crossfade');
	display
		.data('inputMode', true)
		.data('paused', false)
		.removeClass('running');
	localStorage.setItem('timeStarted', 0);
	localStorage.setItem('durationSet', 0);
	$('#dial-ring path')
		.velocity('stop');
	display
		.velocity('stop')
		.velocity({
			height: '20%'
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
	var display = $('#display');
	// Handle if display is expanded
	if (!display.data('inputMode')) {
		// Handle if timer is expanded
		if (display.data('paused')) {
			startTimer(true);
			display.data('paused', false);
			$('#dial-ring')
				.velocity('stop')
				.velocity({
					opacity: 1
				}, {
					easing: EASE_OUT,
					duration: ANIMATION_DURATION
				});
		}
		// Handle if timer is running
		else if (display.hasClass('running')) {
			$('#dial-ring path').velocity('stop');
			setDisplayTime('Paused', 'crossfade');
			display.data('paused', true);
			$('#dial-ring')
				.velocity('stop')
				.velocity({
					opacity: 0.25
				}, {
					easing: EASE_OUT,
					duration: ANIMATION_DURATION
				});
		}
		// Handle if timer is finished/not running
		else {
			editTime();
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
				scaleY: (show ? [1, 0] : [0, 1]),
				scaleX: (show ? [1, 0.5] : [0.5, 1]),
				opacity: (show ? [1, 0] : [0, 1])
			}, {
				easing: show ? EASE_OUT : EASE_IN,
				display: show ? 'block' : 'none',
				duration: (show ? ANIMATION_DURATION : ANIMATION_DURATION / 2)
			});
	} else if ((helpMenu.data('shown') || false) !== forceState){
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
	} else {
		clearTimeout(bannerText.data('hideTimeout'));
		bannerText.data('hideTimeout', setTimeout(hideNotification, 5000));
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
	var content = $('#content');
	var banner = $('#notification-banner');

	$(document).off('click.bannerhide', hideNotification);
	content
		.off('click.bannerhide', hideNotification)
		.css('pointer-events', '');

	if (banner.data('shown')) {
		$('#notification-banner')
			.data('shown', false)
			.velocity('stop')
			.velocity({
				translateY: '-100%'
			}, {
				easing: EASE_IN,
				display: 'none',
				duration: ANIMATION_DURATION / 2
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

/** Check if CSS property is supported on the browser and returns a boolean */
function isSupportedCSS(prop) { return prop in document.body.style; }
})();
