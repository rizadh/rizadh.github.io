"use strict"
// SVG arcs cannot form a complete circle so a value close to 1 is used
var WHOLE_CIRCLE = 0.99999999;

$(function() {
    hoverTouchUnstick();
    // Set input mode (whether keypad is displayed)
    $("#display").data("input_mode", true);
    $.Velocity.hook($("#display"), "translateY", "-100%");
    $("#display").velocity({
        translateY: 0
    }, {
        easing: "easeOutExpo",
        duration: 600
    });
    $.Velocity.hook($("#keypad td"), "scale", "0");
    $("#keypad td").velocity({
        scale: 1
    }, {
        easing: "easeOutExpo",
        duration: 200,
        delay: 400
    });
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
    // Enable keyboard input
    $(document).on("keydown", function(e) {
        e.preventDefault();
        var key = e.keyCode;
        // Handle a number being pressed
        if (48 <= key && key <= 57 && $("#display").data("input_mode")) {
            var key_value = String.fromCharCode(key);
            var new_text = (getDisplayTime() + key_value).slice(-6);
            setDisplayTime(new_text);
        // Handle "Enter" key being pressed
        } else if (key == 13) {
            if ($("#display").data("input_mode")) {
                startTimer();
            } else {
                editTime();
            }
        // Handle "Backspace" key being pressed
        } else if (key == 8 && $("#display").data("input_mode")) {
            var new_text = ("0" + getDisplayTime()).slice(-7,-1);
            setDisplayTime(new_text);
        }
    });
});

$(window).on('load resize orientationChange', function() {
    // Maximize size of text
    var max_length = Math.min(window.innerHeight, window.innerWidth);
    $("body").css("font-size", max_length / 9);
});

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
            progress: function(elements, complete, remaining, start, tweenValue) {
                setDial($("#dial-ring path"), 50, tweenValue);
                // Find seconds rounded up
                var seconds = Math.ceil(remaining/1000);
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
                // Send time text to display
                setDisplayTime([hours, minutes, seconds].join(""), false);
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
            .css("font-family","roboto_condensedregular");;
    } else if (text == "") {
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
        .velocity("fadeOut", 200);

    // Fade in edit button
    $("#edit-button")
        .velocity("stop")
        .velocity("fadeIn", 100);

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
        .velocity("fadeIn", 200);
    $("#edit-button")
        .velocity("stop")
        .velocity("fadeOut", 100);
    $("#dial-ring")
        .velocity("stop")
        .velocity("fadeOut", 100);
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
