"use strict";

// SVG arcs cannot form a complete circle so a value close to 1 is used
var WHOLE_CIRCLE = 0.99999;
var EASE_FUNC = "Expo";
var GLOBAL_EASE_OUT = "easeOut" + EASE_FUNC;
var GLOBAL_EASE_IN = "easeIn" + EASE_FUNC;
var GLOBAL_ANIMATION_DURATION = 400;

// Perform when document body is loaded
$(function() {
    // Attach Fastlick
    FastClick.attach(document.body);

    // Hook Velocity to help menu and display-text translate properties
    $.Velocity.hook($("#keyboard-help"), "translateX", "-50%");
    $.Velocity.hook($("#keyboard-help"), "translateY", "-50%");
    $.Velocity.hook($("#display-text"), "translateY", "-50%");


    // Change Backspce to Delete if on Mac or iOS devices
    if (navigator.platform.match(/(Mac|iPhone|iPod|iPad)/i)) {
        $("#keyboard-help > .shortcut.delete > span").text("Delete");
    }

    // Sticky hover fix
    hoverTouchUnstick();

    // Disable scrolling
    // $(document).bind('touchmove', false);

    // Set input mode (whether keypad is displayed)
    $("#display").data("input_mode", true);

    // Startup animation
    startupAnimation();

    // Clear display and show default message
    setDisplayTime("");

    // Set click events for on-screen keys
    $("#keypad td").click(function() {
        var key_value = $(this).text();
        if (key_value == "Clear") {
            setDisplayTime("000000");
        } else if (key_value == "Start") {
            startTimer();
        } else {
            addDigit(key_value);
        }
    });

    // Set click event for edit button
    $("#edit-button").click(editTime);

    // Set click event for edit button
    $("#display-text").click(function() {
        if (!$("#display").data("input_mode")) {
            togglePause();
        }
    });

    $("#sure").click(function() {
        toggleKeyboardHelp(true);
    });

    $("#nope").click(function() {
        localStorage.setItem("mouse-suggested", "temp");
    });

    $("#keyboard-suggest .button").click(function(e) {
        e.stopPropagation();
        toggleKeyboardSuggest(false);
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
            if ($("#display").data("input_mode")) {
                var deleted_time = ("0" + getDisplayTime()).slice(-7,-1);
                setDisplayTime(deleted_time);
            }
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
            if (!$("#display").data("input_mode")) {
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
            if ($("#display").data("input_mode")) {
                // Obtain entered character
                var key_value = String.fromCharCode(key);
                addDigit(key_value);
                break;
            }

    }

    // Hide help menu unless spacebar was clicked
    if (key !== 32) {
        toggleKeyboardHelp(false);
    }
});

// Disable suggesting a mouse if user has a touch device
$(document).on("touchstart", function() {
    localStorage.setItem("touch-device", "true");
});

// Hide keyboard help when anything is tapped
$(document).click(function() {
    toggleKeyboardHelp(false);
    var touch_device = localStorage.getItem("touch-device");
    var suggested_mouse = localStorage.getItem("mouse-suggested");
    var suggested_mouse_session = sessionStorage.getItem("mouse-suggested");

    if (!touch_device) {
        if (!suggested_mouse) {
            localStorage.setItem("mouse-suggested", "true");
            sessionStorage.setItem("mouse-suggested", "true");
            toggleKeyboardSuggest(true);
        } else {
            if (suggested_mouse === "temp") {
                if (!suggested_mouse_session) {
                    localStorage.setItem("mouse-suggested", "true");
                    sessionStorage.setItem("mouse-suggested", "true");
                    toggleKeyboardSuggest(true);
                }
            }
        }
    }
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
    var display = $("#display");
    var display_text = $("#display-text");
    var keypad = $("#keypad tr");
    var startup_delay = 20;

    if ($_GET("time").length) {
        // Immediately start timer
        setDisplayTime(("000000" + $_GET("time")).slice(-6), false, true);
        $.Velocity.hook(display, "height", "0");
        $.Velocity.hook(display, "opacity", "0");
        $.Velocity.hook(display, "fontSize", "0");
        $.Velocity.hook($("#keypad"), "opacity", "0");
        startTimer();
    } else {
        // Hook display and display text
        $.Velocity.hook(display_text, "translateY", "-100%");
        $.Velocity.hook(display_text, "opacity", "0");
        $.Velocity.hook(display, "translateY", "-100%");
        $.Velocity.hook(display, "opacity", "0");
        $.Velocity.hook(keypad, "opacity", "0");
        $.Velocity.hook(keypad, "translateY", "-10%");
        $.Velocity.RegisterEffect("transition.slideIn", { calls: [[{
            translateY: 0,
            opacity: 1
        }]]});

        // Animate display text
        display_text.velocity({
            translateY: "-50%",
            opacity: 1
        }, {
            easing: GLOBAL_EASE_OUT,
            duration: startup_duration,
            delay: startup_delay
        });

        // Animate display
        display.velocity({
            translateY: 0,
            opacity: 1
        }, {
            easing: GLOBAL_EASE_OUT,
            duration: startup_duration,
            delay: startup_delay
        });

        // Animate keypad
        keypad.velocity("transition.slideIn", {
            easing: GLOBAL_EASE_OUT,
            duration: startup_duration / 2,
            delay: startup_duration / 4 + startup_delay,
            stagger: startup_duration / 4 / (keypad.length - 1),
            drag: true,
            display: null
        });
    }
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

function setTime(sec, resume) {
    // Convert seconds to milliseconds
    var dial_path = $("#dial-ring path");
    var dial_time = resume ? dial_path.data("time_left") : sec*1000;
    var initial_progress = resume ? dial_path.data("progress") : 0;

    dial_path.velocity(
        {
            // Can't go to 1 with SVG arc
            tween: [WHOLE_CIRCLE, initial_progress]
        }, {
            duration: dial_time,
            easing: "linear",
            progress: function(e, c, r, s, t) {
                setDial(dial_path, 40, t);
                // Store progress in data
                dial_path.data("progress", t);
                dial_path.data("time_left", r);
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
                if (r !== 0) {
                    // Send time text to display
                    setDisplayTime(times.join(""), false, true);
                }
            },
            complete: function() {
                setDisplayTime("Done", false, true);
            }
        }
    );
}

function getDisplayTime(actual) {
    var display = $("#display-text");
    return actual ? display.text() : display.data("current_time");
}

function setDisplayTime(text, actual, fancy) {
    var display = $("#display-text");
    var new_display_text = display.clone(true);
    if (actual) {
        new_display_text
            .data("current_time", "000000")
            .text(text)
            .css("font-family","roboto_condensedregular");
        changeDisplayText(new_display_text, fancy ? "fancy" : "");
    } else if (text === "") {
        $("#display-text")
            .data("current_time", "000000")
            .text("Enter a time")
            .css("font-family","roboto_condensedregular");
    } else if (text === "000000") {
        new_display_text
            .data("current_time", "000000")
            .text("0s")
            .css("font-family","robotoregular");
        changeDisplayText(new_display_text, fancy ? "fancy" : "");
    } else if (text === "Done") {
        new_display_text
            .data("current_time", "000000")
            .text(text)
            .css("font-family","robotoregular");
        changeDisplayText(new_display_text, fancy ? "fancy" : "");
    } else if (text === "Paused") {
        new_display_text = display
            .clone(true)
            .text(text)
            .css("font-family","robotoregular");
        changeDisplayText(new_display_text, fancy ? "fancy" : "");
    } else {
        if (display.data("current_time") !== text || display.text() === "Paused") {
            new_display_text
                .data("current_time", text)
                .css("font-family","robotoregular");
            var time_array = [];
            var unit_array = ["h","m","s"];
            for (var i = 0; i < 3; i++) {
                var time_value = text.slice(2*i,2*i+2);
                if (time_value > 0 || time_array[0] || i === 2) {
                    if (time_value < 10 && !time_array[0]) {
                        time_value = time_value.slice(-1);
                    }
                    time_array.push(time_value + unit_array[i]);
                }
            }
            var new_time = time_array.join(" ");
            new_display_text.text(new_time);
            changeDisplayText(new_display_text, fancy ? "fancy" : "");
        }
    }
}

function addDigit(digit) {
    var new_time = (getDisplayTime() + digit).slice(-6);
    setDisplayTime(new_time);
}

function startTimer(resume) {
    // Convert display input to seconds
    var time_string = getDisplayTime();
    var hours_to_seconds = time_string.slice(-6,-4)*3600;
    var minutes_to_seconds = time_string.slice(-4,-2)*60;
    var seconds = time_string.slice(-2)*1;
    var total_seconds = hours_to_seconds + minutes_to_seconds + seconds;

    // Limit seconds to less than 100 hours
    if (total_seconds < 360000) {
        var timer_delay = 20;
        // Start dial motion and set state to timing mode
        setTime(total_seconds, resume);
        $("#display").data("input_mode", false);
        $("#display").addClass("running");

        if (!resume) {
            // Shrink display
            $("#display")
                .velocity("stop")
                .velocity({
                    height: "90%",
                    opacity: 1,
                    fontSize: "1em"
                }, {
                    duration: GLOBAL_ANIMATION_DURATION,
                    easing: GLOBAL_EASE_OUT,
                    delay: timer_delay
                });

            // Fade out keys
            $("#keypad")
                .velocity("stop")
                .velocity({
                    scale: 0.8,
                    opacity: 0
                }, {
                    easing: GLOBAL_EASE_OUT,
                    duration: GLOBAL_ANIMATION_DURATION,
                    display: "none",
                    delay: timer_delay
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
                    display: "block",
                    delay: timer_delay
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
                    display: "block",
                    delay: timer_delay
                });
        }
    } else {
        setDisplayTime("Time too high", true, true);
    }
}

function editTime() {
    setDisplayTime(getDisplayTime(), false, true);
    $("#display").data("input_mode", true).data("paused", false);
    $("#display").removeClass("running");
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
            scale: [1, 0.5],
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

function togglePause() {
    if ($("#display").data("paused")) {
        resumeTimer();
    } else {
        pauseTimer();
    }
}

function pauseTimer() {
    var ring_classes = $("#dial-ring path").attr('class');
    var is_animating = ~ring_classes.indexOf('velocity-animating');
    if (is_animating) {
        $("#dial-ring path").velocity("stop");
        setDisplayTime("Paused", false, true);
        $("#display").data("paused", true);
        $("#dial-ring")
            .velocity("stop")
            .velocity({
                opacity: 0.25
            }, {
                easing: GLOBAL_EASE_OUT,
                duration: GLOBAL_ANIMATION_DURATION
            });

    }
}

function resumeTimer() {
    startTimer(true);
    $("#display").data("paused", false);
    $("#dial-ring")
        .velocity("stop")
        .velocity({
            opacity: 1
        }, {
            easing: GLOBAL_EASE_OUT,
            duration: GLOBAL_ANIMATION_DURATION
        });
}

function toggleKeyboardHelp(force_state) {
    var help_menu = $("#keyboard-help");
    if (arguments.length > 0) {
        if (!!help_menu.data("shown") === !force_state) {
            toggleKeyboardHelp();
        }
    } else {
      	var show = !help_menu.data("shown");

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

function toggleKeyboardSuggest(force_state) {
    var suggest_banner = $("#keyboard-suggest");
    if (arguments.length > 0) {
        if (!!suggest_banner.data("shown") === !force_state) {
            toggleKeyboardSuggest();
        }
    } else {
        var show = !suggest_banner.data("shown");

        if (show) {
            $.Velocity.hook(suggest_banner, "translateY", "-100%");
        }
        suggest_banner
            .data("shown", show)
            .velocity("stop")
            .velocity({
                translateY: (show ? [0, "-100%"] : ["-100%", 0])
            }, {
                easing: show ? GLOBAL_EASE_OUT : GLOBAL_EASE_IN,
                display: show ? "block" : "none",
                duration: (show ? GLOBAL_ANIMATION_DURATION :
                    GLOBAL_ANIMATION_DURATION / 4)
            });
    }
}

function changeDisplayText(new_display_text, style) {
    $("#display-text-old").remove();
    var display_text = $("#display-text");
    if (style === "fancy") {
        var display_html = display_text.text();
        var new_display_html = new_display_text.text();
        var display_html_array = [];
        var new_display_html_array = [];
        if (display_html.length === new_display_html.length) {
            for (var i = 0; i < display_html.length; i++) {
                if (display_html[i] === new_display_html[i]) {
                    display_html_array.push(display_html[i]);
                    new_display_html_array.push(new_display_html[i]);
                } else {
                    display_html_array.push("<span>");
                    display_html_array.push(display_html[i]);
                    display_html_array.push("</span>");
                    new_display_html_array.push("<span>");
                    new_display_html_array.push(new_display_html[i]);
                    new_display_html_array.push("</span>");
                }
            }
        } else {
            display_html_array.push("<span>");
            display_html_array.push(display_html);
            display_html_array.push("</span>");
            new_display_html_array.push("<span>");
            new_display_html_array.push(new_display_html);
            new_display_html_array.push("</span>");
        }

        display_text
            .attr("id", "display-text-old")
            .html(display_html_array.join("").replace("</span><span>",""))
            .children("span")
            .velocity({
                opacity: 0,
                scale: 0.5
            }, {
                easing: GLOBAL_EASE_OUT,
                duration: GLOBAL_ANIMATION_DURATION,
                queue: false,
                display: "inline-block",
                complete: function() {
                    $(this).parent().remove();
                }
            });

        new_display_text
            .html(new_display_html_array.join("").replace("</span><span>",""))
            .appendTo("#display")
            .children("span")
            .css("opacity", 0)
            .velocity({
                opacity: [1, 0],
                scale: [1, 0.5]
            }, {
                easing: GLOBAL_EASE_OUT,
                duration: GLOBAL_ANIMATION_DURATION,
                queue: false,
                display: "inline-block"
            });
    } else {
        display_text.remove();
        new_display_text.appendTo("#display");
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

function $_GET(q,s) {
    s = (s) ? s : window.location.search;
    var re = new RegExp('&amp;'+q+'=([^&amp;]*)','i');
    return (s = s.replace(/^\?/,'&amp;').match(re)) ? s = s[1] : s = '';
}
