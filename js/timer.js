"use strict";

// SVG arcs cannot form a complete circle so a value close to 1 is used
var WHOLE_CIRCLE = 0.99999;
var EASE_FUNC = "Expo";
var GLOBAL_EASE_OUT = "easeOut" + EASE_FUNC;
var GLOBAL_EASE_IN = "easeIn" + EASE_FUNC;
var GLOBAL_ANIMATION_DURATION = 400;

// Perform when document body is loaded
$(function() {
    // Hook Velocity to help menu translate properties
    $.Velocity.hook($("#keyboard-help"), "translateX", "-50%");
    $.Velocity.hook($("#keyboard-help"), "translateY", "-50%");

    // Change Backspce to Delete if on Mac or iOS devices
    if (navigator.platform.match(/(Mac|iPhone|iPod|iPad)/i)) {
        $("#keyboard-help > .shortcut.delete > span").text("Delete");
    }

    // Sticky hover fix
    hoverTouchUnstick();

    // Set input mode (whether keypad is displayed)
    $("#display").data("input_mode", true);

    // Startup animation
    startupAnimation();

    // Clear display and show default message
    setDisplayTime("");

    // Set click events for on-screen keys
    $("#keypad td").on("tap", function() {
        var key_value = $(this).text();
        if (key_value == "Clear") {
            setDisplayTime("000000");
        } else if (key_value == "Start") {
            startTimer();
        } else {
            var new_text = (getDisplayTime() + key_value).slice(-6);
            setDisplayTime(new_text);
        }
    });

    // Set click event for edit button
    $("#edit-button").on("tap", function() {
        editTime();
    });
});

// Enable keyboard input
$(document).on("keydown", function(e) {
    // Get the keycode
    var key = e.keyCode;
    // Perform events depending on keycode
    switch (key) {
        // Backspace - delete a character from display
        case 8:
            e.preventDefault();
            // Activate editing mode if not activated
            if (!$("#display").data("input_mode")) {
                editTime();
            }
            var deleted_time = ("0" + getDisplayTime()).slice(-7,-1);
            setDisplayTime(deleted_time);
            break;

        // Enter - start or cancel timer
        case 13:
            // Activate editing mode if not activated
            if ($("#display").data("input_mode")) {
                startTimer();
            } else {
                editTime();
            }
            break;

        // Escape - cancel timer
        case 27:
            // Activate editing mode if not activated
            if (!$("#display").data("input_mode")) {
                editTime();
            }
            break;

        // Space - toggle keyboard help menu
        case 32:
            toggleKeyboardHelp();
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
            if (!$("#display").data("input_mode")) {
                editTime();
            }
            // Obtain entered character
            var key_value = String.fromCharCode(key);
            var new_time = (getDisplayTime() + key_value).slice(-6);
            setDisplayTime(new_time);
            break;
    }

    // Hide help menu unless spacebar was clicked
    if (key !== 32) {
        toggleKeyboardHelp(true);
    }
});

// Hide keyboard help when anything is tapped
$(document).on("click", function() {
    toggleKeyboardHelp(true);
});

// Adjust font-sizes when viewport dimensions change
$(window).on('load resize orientationChange', function() {
    // Maximize size of text
    var max_length = Math.min($(window).height(), $(window).width());
    $("html").css("font-size", max_length / 9);
});

// Startup animation to be performed once when app is loaded
function startupAnimation() {
    var startup_duration = GLOBAL_ANIMATION_DURATION;
    var display_text = $("#display-text");
    var display = $("#display");
    var keypad = $("#keypad tr");
    var global_delay = 100;
    global_delay = 100;

    $.Velocity.hook(display_text, "translateY", "-100%");
    $.Velocity.hook(display_text, "opacity", "0");

    // Animate display text
    display_text.velocity({
        translateY: "-50%",
        opacity: 1
    }, {
        easing: GLOBAL_EASE_OUT,
        duration: startup_duration,
        delay: global_delay
    });

    $.Velocity.hook(display, "translateY", "-100%");
    $.Velocity.hook(display, "opacity", "0");

    // Animate display
    display.velocity({
        translateY: 0,
        opacity: 1
    }, {
        easing: GLOBAL_EASE_OUT,
        duration: startup_duration,
        delay: global_delay
    });

    $.Velocity.hook(keypad, "opacity", "0");
    $.Velocity.hook(keypad, "translateY", "-10%");

    // Animate keypad
    $.Velocity.RegisterEffect("transition.slideIn", { calls: [[{
        translateY: 0,
        opacity: 1
     }]]});
    keypad.velocity("transition.slideIn", {
        easing: GLOBAL_EASE_OUT,
        duration: startup_duration / 2,
        delay: startup_duration / 4 + global_delay,
        stagger: startup_duration / 4 / (keypad.length - 1),
        drag: true,
        display: null
    });
}

/** Set dial of given radius to given progress */
function setDial(dial, arc_radius, progress) {
    var box_radius = 50;

    // Calculate path parameters
    var offset = box_radius - arc_radius;
    var sweep = progress >= 0.5 ? 1 : 0;
    var arc_pos_x = offset + arc_radius*(1 + Math.sin(2*Math.PI*progress));
    var arc_pos_y = offset + arc_radius*(1 - Math.cos(2*Math.PI*progress));
    var arc_pos = arc_pos_x + " " + arc_pos_y;
    var arc_dimensions = arc_radius + " " + arc_radius;
    var arc_parameters = " 0 " + sweep + " 1 ";

    // Calculate path segments
    var move_to_center = "M" + box_radius + " " + box_radius;
    var move_to_start = "m0 " + (-arc_radius);
    var make_arc = "A" + arc_dimensions + arc_parameters + arc_pos;

    // Creath path from segments
    var dial_path = move_to_center + move_to_start + make_arc;

    // Set path
    dial.attr("d", dial_path);
}

function setTime(sec) {
    // Convert seconds to milliseconds
    var dial_time = sec*1000;
    $("#dial-ring path").velocity(
        {
            // Can't go to 1 with SVG arc
            tween: WHOLE_CIRCLE
        }, {
            duration: dial_time,
            easing: "linear",
            progress: function(e, c, r, s, t) {
                setDial($("#dial-ring path"), 40, t);
                // Find seconds rounded up
                var total_seconds = Math.ceil(r/1000);
                // Find minutes rounded down
                var minutes = Math.floor(total_seconds/60) % 60;
                // Find hours rounded down
                var hours = Math.floor(total_seconds/3600);
                // Find remaining seconds
                var seconds = total_seconds % 60;
                // Force 2 digits
                seconds = ("0" + seconds).slice(-2);
                minutes = ("0" + minutes).slice(-2);
                hours = ("0" + hours).slice(-2);
                var times = [hours, minutes, seconds];
                // Send time text to display
                setDisplayTime(times.join(""), false);
            },
            complete: function() {
                setDisplayTime("Done");
            }
        }
    );
}

function getDisplayTime(actual) {
    var display = $("#display-text");
    return actual ? display.text() : display.data("current_time");
}

function setDisplayTime(text, actual) {
    var display = $("#display-text");
    if (actual) {
        display
            .data("current_time", "000000")
            .text(text)
            .css("font-family","roboto_condensedregular");
    } else if (text === "") {
        display
            .data("current_time", "000000")
            .text("Enter a time")
            .css("font-family","roboto_condensedregular");
    } else if (text === "000000") {
        display
            .data("current_time", "000000")
            .text("0s")
            .css("font-family","robotoregular");
    } else if (text === "Done") {
        display
            .data("current_time", "000000")
            .text("Done")
            .css("font-family","robotoregular");
    } else {
        if (display.data("current_time") !== text) {
            display
                .data("current_time", text)
                .css("font-family","robotoregular");
            var current_time = getDisplayTime();
            var time_array = [];
            var unit_array = ["h","m","s"];
            for (var i = 0; i < 3; i++) {
                var time_value = current_time.slice(2*i,2*i+2);
                if (time_value > 0 || time_array[0] || i === 2) {
                    if (time_value < 10 && !time_array[0]) {
                        time_value = time_value.slice(-1);
                    }
                    time_array.push(time_value + unit_array[i]);
                }
            }
            var new_time = time_array.join(" ");
            display.text(new_time);
        }
    }
}

function startTimer() {
    // Convert display input to seconds
    var time_string = getDisplayTime();
    var hours_to_seconds = time_string.slice(-6,-4)*3600;
    var minutes_to_seconds = time_string.slice(-4,-2)*60;
    var seconds = time_string.slice(-2)*1;
    var total_seconds = hours_to_seconds + minutes_to_seconds + seconds;

    // Limit seconds to less than 100 hours
    if (total_seconds < 360000) {
        // Start dial motion and set state to timing mode
        setTime(total_seconds);
        $("#display").data("input_mode", false);

        // Shrink display
        $("#display")
            .velocity("stop")
            .velocity({
                height: "90%"
            }, {
                duration: GLOBAL_ANIMATION_DURATION,
                easing: GLOBAL_EASE_OUT
            });

        // Fade out keys
        $("#keypad")
            .velocity("stop")
            .velocity({
                translateY: "10%",
                opacity: 0
            }, {
                easing: GLOBAL_EASE_OUT,
                duration: GLOBAL_ANIMATION_DURATION,
                display: "none"
            });

        // Fade in edit button
        $("#edit-button")
            .velocity("stop")
            .velocity({
                translateY: [0, "100%"],
                opacity: [1, 0]
            }, {
                easing: GLOBAL_EASE_OUT,
                duration: GLOBAL_ANIMATION_DURATION,
                display: "block"
            });

        // Fade in ring
        $("#dial-ring")
            .velocity("stop")
            .velocity({
                opacity: [1, 0],
                scale: [1, 0]
            }, {
                easing: GLOBAL_EASE_OUT,
                duration: GLOBAL_ANIMATION_DURATION,
                display: "block"
            });
    } else {
        setDisplayTime("Time too high", true);
    }
}

function editTime() {
    setDisplayTime(getDisplayTime());
    $("#display").data("input_mode", true);
    $("#dial-ring path")
        .velocity("stop");
    $("#display")
        .velocity("stop")
        .velocity({
            height: "20%"
        }, {
            duration: GLOBAL_ANIMATION_DURATION,
            easing: GLOBAL_EASE_OUT,
        });
    $("#keypad")
        .velocity("stop")
        .velocity({
            translateY: 0,
            opacity: 1
        }, {
            easing: GLOBAL_EASE_OUT,
            duration: GLOBAL_ANIMATION_DURATION,
            display: "table"
        });
    $("#edit-button")
        .velocity("stop")
        .velocity({
            opacity: 0,
            translateY: "-700%"
        }, {
            easing: GLOBAL_EASE_OUT,
            display: "none",
            duration: GLOBAL_ANIMATION_DURATION
        });
    $("#dial-ring")
        .velocity("stop")
        .velocity("fadeOut", 100);
}

function toggleKeyboardHelp(force_hide) {
    var help_menu = $("#keyboard-help");
    if (force_hide) {
        if (help_menu.data("shown")) {
            toggleKeyboardHelp();
        }
    } else {
      	var show;
        if (help_menu.data("shown")) {
            show = false;
        } else {
            show = true;
        }

        help_menu
            .data("shown", show)
            .velocity("stop")
            .velocity({
                scale: (show ? [1, 0] : [0, 1]),
                opacity: (show ? [1, 0] : [0, 1])
            }, {
                easing: show ? GLOBAL_EASE_OUT : GLOBAL_EASE_IN,
                display: show ? "block" : "none",
                duration: (show ? GLOBAL_ANIMATION_DURATION :
                    GLOBAL_ANIMATION_DURATION / 4)
            });
    }
}

function hoverTouchUnstick() {
  // Check if the device supports touch events
  if('ontouchstart' in document.documentElement) {
    // Loop through each stylesheet
    for(var sheetI = document.styleSheets.length - 1; sheetI >= 0; sheetI--) {
      var sheet = document.styleSheets[sheetI];
      // Verify if cssRules exists in sheet
      if(sheet.cssRules) {
        // Loop through each rule in sheet
        for(var ruleI = sheet.cssRules.length - 1; ruleI >= 0; ruleI--) {
          var rule = sheet.cssRules[ruleI];
          // Verify rule has selector text
          if(rule.selectorText) {
            // Replace hover psuedo-class with active psuedo-class
            rule.selectorText = rule.selectorText.replace(":hover", ":active");
          }
        }
      }
    }
  }
}
