"use strict";

// SVG arcs cannot form a complete circle so a value close to 1 is used
var WHOLE_CIRCLE = 0.99999999;

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

    // Hide keyboard help when anything is tapped
    $("#keyboard-help").on("tap", function() {
        toggleKeyboardHelp(true);
    });

    // Enable keyboard input
    $(document).on("keydown", function(e) {
        // Get the keycode
        var key = e.keyCode;

        // Handle a number
        if (48 <= key && key <= 57 && $("#display").data("input_mode")) {
            var key_value = String.fromCharCode(key);
            var new_time = (getDisplayTime() + key_value).slice(-6);
            setDisplayTime(new_time);

        // Handle "Enter"
        } else if (key == 13) {
            if ($("#display").data("input_mode")) {
                startTimer();
            } else {
                editTime();
            }

        // Handle "Backspace"
        } else if (key == 8) {
            e.preventDefault();
            if ($("#display").data("input_mode")) {
                var deleted_time = ("0" + getDisplayTime()).slice(-7,-1);
                setDisplayTime(deleted_time);
            }
        // Handle "Spacebar"
        } else if (key == 32) {
            toggleKeyboardHelp();
        }
    });
});

$(window).on('load resize orientationChange', function() {
    // Maximize size of text
    var max_length = Math.min(window.innerHeight, window.innerWidth);
    $("html").css("font-size", max_length / 9);
});

function startupAnimation() {
    var startup_duration = 400;

    // Animate display text
    $("#display-text").velocity({
        translateY: ["-50%", "-100%"]
    }, {
        easing: "easeOutExpo",
        duration: startup_duration * 2
    });

    // Animate dispay
    $("#display").velocity({
        translateY: [0, "-100%"]
    }, {
        easing: "easeOutExpo",
        duration: startup_duration * 2
    });

    // Animate keypad
    $.Velocity.hook($("#keypad td"), "scale", "0");
    // Remove with fancy transition
    $.Velocity.hook($("#keypad td"), "opacity", "0");
    // Experimental startup transition MAY BE REMOVED
    $.Velocity.RegisterEffect("transition.pop", { calls: [[{
        scale: [1, 0],
        opacity: [1, 0]
     }]]});
    // Turn on and off fancy transition
    var transition = true;
    $("#keypad td")
        .velocity(transition ? "transition.pop" : {scale: [1, 0]}, {
            easing: "easeOutExpo",
            duration: startup_duration / 2,
            delay: startup_duration / 2,
            // Remove with fancy transition
            stagger: startup_duration / 2 / 9,
            // Remove with fancy transition
            drag: true
        });
}

/** Set dial of given radius to given progress */
function setDial(dial, radius, progress) {
    // Calculate path parameters
    var sweep = progress >= 0.5 ? 1 : 0;
    var arc_pos_x = radius*(1 + Math.sin(2*Math.PI*progress));
    var arc_pos_y = radius*(1 - Math.cos(2*Math.PI*progress));
    var arc_pos = arc_pos_x + " " + arc_pos_y;
    var arc_dimensions = radius + " " + radius;
    var arc_parameters = " 0 " + sweep + " 1 ";

    // Calculate path segments
    var move_to_center = "M" + radius + " " + radius;
    var move_to_start = "L" + radius + " 0";
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
                setDial($("#dial-ring path"), 50, t);
                // Find seconds rounded up
                var seconds = Math.ceil(r/1000);
                // Find minutes rounded down
                var minutes = Math.floor(seconds/60) % 60;
                // Find hours rounded down
                var hours = Math.floor(seconds/3600);
                // Find remaining seconds
                seconds = seconds % 60;
                // Force 2 digits
                seconds = ("0" + seconds).slice(-2);
                minutes = ("0" + minutes).slice(-2);
                hours = ("0" + hours).slice(-2);
                var times = [hours, minutes, seconds];
                // Send time text to display
                setDisplayTime(times.join(""), false);
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
            .text(text)
            .css("font-family","roboto_condensedregular");
    } else if (text === "") {
        display
            .data("current_time", "000000")
            .text("Enter a time")
            .css("font-family","roboto_condensedregular");
    } else {
        display
            .data("current_time", text)
            .css("font-family","robotoregular");
        var current_time = getDisplayTime();
        var time_array = [];
        var unit_array = ["h","m","s"];
        for (var i = 0; i < 3; i++) {
            var time_value = current_time.slice(2*i,2*i+2);
            if (time_value > 0 || time_array[0] || i == 2) {
                if (time_value < 10 && !time_array[0]) {
                    time_value = time_value.slice(-1);
                }
                time_array.push(time_value + unit_array[i]);
            }
        }
        var new_time = time_array.join(" ");
        if (new_time != display.text()) {
            display.text(new_time);
        }
    }
}

function startTimer() {
    $("#display").data("input_mode", false);
    // Shrink display
    $("#display")
        .velocity("stop")
        .velocity({
            height: "90%"
        }, {
            duration: 400,
            easing: "easeOutExpo",
        });

    // Fade out keys
    $("#keypad")
        .velocity("stop")
        .velocity({
            translateY: "10%",
            opacity: 0
        }, {
            easing: "easeOutExpo",
            duration: 400,
            display: "none"
        });

    // Fade in edit button
    $("#edit-button")
        .velocity("stop")
        .velocity({
            translateY: [0, "100%"],
            opacity: [1, 0]
        }, {
            easing: "easeOutExpo",
            duration: 400,
            display: "block"
        });

    // Fade in ring
    $("#dial-ring")
        .velocity("stop")
        .velocity({
            opacity: [1, 0],
            scale: [1, 0]
        }, {
            easing: "easeOutExpo",
            duration: 400,
            display: "block"
        });

    // Convert display input to seconds
    var time_string = getDisplayTime();
    var hours_to_seconds = time_string.slice(-6,-4)*3600;
    var minutes_to_seconds = time_string.slice(-4,-2)*60;
    var seconds = time_string.slice(-2)*1;
    var total_seconds = hours_to_seconds + minutes_to_seconds + seconds;
    // Set timer to specified seconds
    setTime(total_seconds);
}

function editTime() {
    $("#display").data("input_mode", true);
    $("#dial-ring path")
        .velocity("stop");
    $("#display")
        .velocity("stop")
        .velocity({
            height: "20%"
        }, {
            duration: 400,
            easing: "easeOutExpo",
        });
    $("#keypad")
        .velocity("stop")
        .velocity({
            translateY: 0,
            opacity: 1
        }, {
            easing: "easeOutExpo",
            duration: 400,
            display: "table"
        });
    $("#edit-button")
        .velocity("stop")
        .velocity({
            opacity: 0,
            translateY: "-700%"
        }, {
            easing: "easeOutExpo",
            display: "none",
            duration: 400
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
            // .velocity(show ? "fadeIn" : "fadeOut", show ? 200 : 100);
            .velocity({
                scale: (show ? [1, 0] : [0, 1]),
                opacity: (show ? [1, 0] : [0, 1])
            }, {
                easing: "easeOutExpo",
                display: (show ? "block" : "none"),
                duration: 400
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
