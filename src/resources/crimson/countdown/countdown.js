"use strict";

if (localStorage.reset == "on") {
    localStorage.clear();
}

var // Default time and label
    countTo = (localStorage.countLabel && localStorage.countTime && inputIsValid(localStorage.countTime)) ? localStorage.countTime : "07/14/2014 5:11 AM",
    countLabel = (localStorage.countLabel && localStorage.countTime && inputIsValid(localStorage.countTime)) ? localStorage.countLabel : "this app opened",
    time,
    stopTimer = false,
    
    units = [    
        ["year", 31556952000, true],          // 0
        ["month", 2628000000, true],          // 1
        ["week", 604800000, true],            // 2
        ["day", 86400000, true],              // 3
        ["hour", 3600000, true],              // 4
        ["minute", 60000, true],         	    // 5
        ["second", 1000, true]                // 6
    ],

    // Choose whether seconds should have decimal places
    showmills = false,

    //Duration of menu fades
    gad = 200,
    easing_ios = [0.2, 0.75, 0, 1],
    easing_iosreverse = [0.5, 0, 0.5, 0],
    easing_spring = [100, 10],
    
    // Holiday Database - FORMAT: [holiday, date]
    holidays = [
        ["New Year's Day", "January 1"],
        ["Valentine's Day", "February 14"],
        ["April Fool's Day", "April 1"],
        ["Earth Day", "April 22"],
        ["May Day", "May 1"],
        ["Canada Day", "July 1"],
        ["Halloween", "October 31"],
        ["Remembrance Day", "November 11"],
        ["Christmas", "December 25"],
        ["Boxing Day", "December 26"],
        ["New Year's Eve", "December 31"]
    ],

    // Arrow Database - In/Out
    arrows = [
        ["27.414,24.586 22.828,20 20,22.828 24.586,27.414 20,32 32,32 32,20",
            "12,0 0,0 0,12 4.586,7.414 9.129,11.953 11.957,9.125 7.414,4.586",
            "12,22.828 9.172,20 4.586,24.586 0,20 0,32 12,32 7.414,27.414",
            "32,0 20,0 24.586,4.586 20.043,9.125 22.871,11.953 27.414,7.414 32,12"
        ],
        ["24.586,27.414 29.172,32 32,29.172 27.414,24.586 32,20 20,20 20,32",
            "0,12 12,12 12,0 7.414,4.586 2.875,0.043 0.047,2.871 4.586,7.414",
            "0,29.172 2.828,32 7.414,27.414 12,32 12,20 0,20 4.586,24.586",
            "20,12 32,12 27.414,7.414 31.961,2.871 29.133,0.043 24.586,4.586 20,0"
        ]
    ];

$(window).resize(function() {
    setHeight();
});

$(window).scroll(function() {
    setHeight();
});

window.addEventListener('orientationchange', function() {
    setHeight();
});


    
    if (localStorage.unitsBool) {
        var unitsBoolean = localStorage.unitsBool.split(",");
        
        var booLength = unitsBoolean.length;
        for (var i = 0; i < booLength; i++) {
            units[i][2] = (unitsBoolean[i] === "true") ? true : false;
        }
    }

// Runs when page has loaded (initialization)
$(function() {

    // Remove 300ms touch delay on some devices
    FastClick.attach(document.body);

    // Begin auto-refreshing of countdown
    refreshTime();
    
    // Session Storage Functions
    if (localStorage.ripple === "on") {
        ripple = false;
        $("#drawer").find(":contains('Ripple')").text("Enable Ripple");
    }
    if (localStorage.lite === "on") {
        $.Velocity.mock = true;
        $("*").addClass("notransition");
        $("#drawer").find(":contains('Lite')").text("Disable Lite Mode");
    }
    if (localStorage.mills === "on") {
        showmills = true;
        $("#drawer").find(":contains('Milliseconds')").text("Hide Milliseconds");
    }
    
    $("#unit-selector span").addClass("active");
    
    if(localStorage.unitsBool) {
        var uLength = units.length;
        for (var i = 0; i < uLength; i++) {
            (units[i][2]) ? localStorage.unitsBool : $("#unit-selector span:eq(" + i + ")").removeClass("active") ;
        }
    }
    
    // Add Holidays into selector menu
    var hLength = holidays.length;
    for (var i = 0; i < hLength; i++) {
        $("#holiday_selector > table").append("<tr><td>" + holidays[i][0] + "</td></tr>");
    }

    // Sets up extra elements for future animating/displaying
    setHeight();
    $("#unit-selector").velocity({
        translateX: "-50%"
    }, 0).hide();
    $("#countdownwrapper").velocity({
        top: $("#menu.icon").outerHeight()
    }, 0);
    $("#countdown").velocity({
        translateY: "-50%"
    }, 0).hide();
    $(".selector").velocity({
        translateX: "-50%",
        top: "100%"
    }, 0).hide();
    $("#customInputD").add($("#customInputL").hide()).velocity({
        translateX: "-50%"
    }, 0);
    $("#drawer").velocity({
        scale: 0
    }, 0).hide();
    $("#alert").velocity({
        translateX: "-50%",
        opacity: 0
    }, 0).hide();
    $("#copyText").velocity({
        translateX: "-50%",
        translateY: "-50%",
        top: "100%"
    }, 0).hide();
    $("#goicon").velocity({
        translateX: "-50%",
        translateY: "50%",
        rotateZ: -90
    }, 0);
    $("#recents").velocity({
        translateX: "1.25rem",
        translateY: "-4rem"
    }, 0).hide();
    $("#hint").velocity({
        opacity: 0
    }, 0).hide();
    
    /*$("#countdown").on("contextmenu", function (event) {
    
        // Avoid the real one
        event.preventDefault();
        event.stopPropagation();#
        (stopTimer) ? localAlert("Resuming Countdown") : localAlert("Countown Paused");
        stopTimer = (stopTimer) ? false : true;
        refreshTime();

    });*/

    // Set click handlers for...
    
    // ...lower bar buttons
    $(".set").click(function() {
        
        closeAlert();
        
        var menu = $("#" + $(this).attr('id') + "_selector");

        if ($(this).hasClass("active")) {
            hideMenu();
        } else {
            
            if (!$("#countdownwrapper").hasClass("selectmode")) {
                
                menu.velocity("stop").velocity({
                    top: $("#menu.icon").outerHeight()
                }, { 
                    display: "auto", 
                    duration: gad*2, 
                    easing: easing_ios
                });

                $(".selector").not(menu).velocity("stop").velocity({
                    top: "100%"
                }, { 
                    display: "none", 
                    duration: gad,
                    easing: easing_iosreverse
                });
                
                $("#countdownwrapper").addClass("selectmode").velocity("stop").velocity({
                    scale: 0.8, 
                    opacity: 0.5
                }, { 
                    duration: gad*2, 
                    easing: easing_ios
                });
                
                if($("#unit-selector").is(":visible")) {
                    $("#unit-selector").velocity({top: "2.5rem", rotateX: "35deg"}, {duration: gad*2, easing: easing_ios, delay: 100});
                }
                
            } else {
                
                var incomingLeft,
                    outgoingLeft,
                    slideEasing = easing_ios,
                    slideDuration = gad*2;
                
                ($(this).index() > $(".set.active").index()) ? (function() {
                    outgoingLeft = "150%";
                    incomingLeft = "-50%";
                })()  : (function() {
                    outgoingLeft = "-50%";
                    incomingLeft = "150%";
                })();
                        
                menu.css("z-index", 2).velocity("stop").velocity({top: $("#menu.icon").outerHeight()}, 0).velocity({
                    left: ["50%", outgoingLeft]
                }, { 
                    display: "auto", 
                    duration: slideDuration, 
                    easing: slideEasing
                });
                
                $(".selector").not(menu).css("z-index", 1).velocity("stop").velocity({
                    left: incomingLeft
                }, { 
                    display: "none",
                    duration: slideDuration,
                    easing: slideEasing,
                    complete: function() {
                        $(".selector").not(menu).velocity({
                            top: "100%",
                            left: "50%"
                        }, 0);
                    }
                });
            }

            $(".set").removeClass("active").addClass("dead");
            $(this).removeClass("dead").addClass("active");

        }
    });

    // ...when a holiday is selected (holiday selection menu)
    $("#holiday_selector td").click(function() {
        var option = this.textContent;
        var holLength = holidays.length;
        for (var i = 0; i < holLength; i++) {
            if (holidays[i][0] === option) {
                countLabel = option /*+ getNextDate(holidays[i][1]).substr(getNextDate(holidays[i][1]).length - 5)*/;
                countTo = getNextDate(holidays[i][1]);
                break;
            }
        }
        hideMenu();
    });
    
    // ...go button (custom countdown menu)
    $("#goicon").click(function() {
        setCustomCount();
    });
    
    // ...recent button (custom countdown menu)
    $("#recenticon").click(function(e) {
        e.stopPropagation();
        
        if ( !$("#recents").is(":visible") ) {
            refreshRecents();
            $("#recents").velocity("stop").velocity({
                translateY: ["-5rem", "-4rem"],
                translateX: ["1.25rem","1.25rem"],
                opacity: [1,0]
            }, {
                duration: gad*2,
                easing: easing_ios,
                display: "block"
            });
        } else {
            hideRecents();
        }
    });
    
    // ...fullscreen button
    $("#full.icon").click(function() {

        var goingIn;

        //Close extra elements
        closeAlert();

        // Switch between inward and outward arrows
        if ($("#countdownwrapper").hasClass("full")) {

            // Change to outward arrow
            goingIn = false;

            // Show info button and contract countdownwrapper
            $(".subicon").css("pointer-events", "auto").velocity("stop").velocity({
                opacity: 1
            }, gad*2, easing_spring);
            
            startFancies();
            
            $("#countdownwrapper").velocity("stop").velocity({
                top: $("#menu.icon").outerHeight(),
                height: $(window).height() - $("#menu.icon").outerHeight()*2
            }, gad, easing_ios);
            
            if($("#unit-selector").is(":visible")) {
                $("#unit-selector").velocity({top: "5rem", translateY: "-50%"}, gad*2, easing_spring);
            }

        } else {

            // Change to inward arrow
            goingIn = true;

            // Hide info button
            $(".subicon").css("pointer-events", "none").velocity("stop").velocity({
                opacity: 0
            }, gad*2, easing_spring);

            // Expand countdownwrapper
            $("#countdownwrapper").velocity("stop").velocity({
                top: "0",
                scale: 1,
                opacity: 1,
                height: "100%"
            }, gad/2, easing_iosreverse);
            
            if($("#unit-selector").is(":visible")) {
                $("#unit-selector").velocity({top: "0", translateY: "-100%"}, gad*2, easing_spring);
            }

        }

        // Suck in button, then pop out
        $("#full.icon").velocity("stop").velocity({
            scale: 0,
            opacity: 0
        }, gad/2, "linear", function() {
            $("#full.icon path:nth-child(2)").attr("d", (goingIn) ? "M3 12.5h2.5v2.5h1.5v-4h-4v1.5zm2.5-7h-2.5v1.5h4v-4h-1.5v2.5zm5.5 9.5h1.5v-2.5h2.5v-1.5h-4v4zm1.5-9.5v-2.5h-1.5v4h4v-1.5h-2.5z" : "M4.5 11h-1.5v4h4v-1.5h-2.5v-2.5zm-1.5-4h1.5v-2.5h2.5v-1.5h-4v4zm10.5 6.5h-2.5v1.5h4v-4h-1.5v2.5zm-2.5-10.5v1.5h2.5v2.5h1.5v-4h-4z");
            $("#full.icon").attr("alt", (goingIn) ? "Exit Fullscreen" : "Enter Fullscreen");

        }).velocity({
            scale: 1,
            opacity: (goingIn) ? 0.5 : 1
        }, gad*2, easing_spring);

        $("#countdownwrapper").toggleClass("full");


    });
    
    $("#menu.icon").click(function(e) {
        if ($("#drawer").hasClass("active")) {
            $("#drawer").velocity("stop").velocity({ top: "1rem", left: "1rem"}, {duration: gad, easing: easing_ios, display: "block"});
            $("#drawer").css("transform-origin", "1rem 1rem");
        } else {
            $("#drawer").addClass("active");
            $("#drawer").css({ top: "1rem", left: "1rem"});
            $("#drawer").css("transform-origin", (e.pageX - window.scrollX - 16) + "px " + (e.pageY - window.scrollY  - 16) + "px");
            $("#drawer").velocity("stop").velocity({scale: 1}, {duration: gad, easing: easing_ios, display: "block", complete: function() {
                $("#drawer").css("transform-origin", "1rem 1rem");
            }});
        }
    });
    
    
    $(document).click(function(e) {
        if (!$(e.target).is("#menu.icon, #menu.icon *") && $("#drawer").hasClass("active")) {
            $("#drawer").removeClass("active");
            $("#drawer").velocity("stop").velocity({scale: 0}, {duration: gad, easing: easing_iosreverse, display: "none"});
        }
        
        hideRecents();
        if (!$(e.target).is(".selector, .selector *, .set, .set *, #alert, #alert *")) {
            hideMenu();
        }
    });
    
    $(document).scroll(function(e) {
        if (!$(e.target).is("#menu.icon, #menu.icon *") && $("#drawer").hasClass("active")) {
            $("#drawer").removeClass("active");
            $("#drawer").velocity("stop").velocity({scale: 0}, {duration: gad, easing: easing_iosreverse, display: "none"});
        }
    });
    
    $(document).on("contextmenu", function (e) {
        e.preventDefault();
        
        var farright = e.pageX - window.scrollX + $("#drawer").width() > $(window).width();
        var fardown = e.pageY - window.scrollY + $("#drawer").height() > $(window).height();
        var origin;
        
        origin = (farright) ? "100% " : "0 ";
        origin += (fardown) ? "100%" : "0";
        $("#drawer").css("transform-origin", origin);
        
        if ($("#drawer").hasClass("active")) {
            $("#drawer").velocity("stop");
            $("#drawer").velocity({ 
                left: farright ? (e.pageX - window.scrollX - $("#drawer").width()) : (e.pageX - window.scrollX),
                top: fardown ? (e.pageY - window.scrollY - $("#drawer").height()) : (e.pageY - window.scrollY)
            }, {duration: gad, easing: easing_ios, queue: false });
        } else {
            $("#drawer").addClass("active");
            $("#drawer").css({
                left: farright ? (e.pageX - window.scrollX - $("#drawer").width()) : (e.pageX - window.scrollX),
                top: fardown ? (e.pageY - window.scrollY - $("#drawer").height()) : (e.pageY - window.scrollY) 
            });
            $("#drawer").velocity("stop").velocity({scale: 1}, {duration: gad, easing: easing_ios, display: "block"});
        }
    });
    
    $(".icon").mousemove(function(e) {
        
        var farright = e.pageX + $("#hint").outerWidth() + 16 + 8 > $(window).width();
        var fardown = e.pageY + $("#hint").outerHeight() + 8 > $(window).height();
        var ogOpac = $("#hint").css("opacity");
        
        $("#hint").velocity("stop").velocity({
            opacity: [1, ogOpac]
        }, {
            duration: gad, 
            display: "block",
            delay: ($("#hint").is(":visible") ? 0 : gad*2.5) 
        }).velocity({
            left: farright ? (e.pageX - window.scrollX - $("#hint").outerWidth() - 16 ) : (e.pageX - window.scrollX + 16),
            top: fardown ? (e.pageY - window.scrollY - $("#hint").outerHeight()) : (e.pageY - window.scrollY) 
        }, {
            duration: gad*2, 
            easing: easing_ios,
            queue: false
        });
        
        
        $("#hint").html($(this).attr("alt"));
    });
    
    $(".icon").mouseout(function(e) {
        $("#hint").velocity("stop").velocity({opacity: 0}, {duration: gad, display: "none"});
    });
    
    $(".icon").click(function(e) {
        $("#hint").velocity("stop").velocity({opacity: 0}, {duration: gad, display: "none"});
    });

    // ...info button
    $("#info.icon").click(function() {

        var countword,
            format;

        if ($("#countdown").text().indexOf("since") > 0) {
            countword = "from ";
        } else {
            countword = "down to ";
        }

        localAlert("Counting " + countword + $.format.date(new Date(countTo).getTime(), "MMMM d yyyy h:mm:ss a"));
        $("#info.icon").addClass("active");
    });
    
    $("#refresh.icon").click(function() {
        $("body").velocity({scaleY: 0}, gad, easing_ios, function() {
            localStorage.reset = "on";
            document.location.reload(true);
        });
    });
    
    $("#settings.icon").click(function() {
        ( !$("#unit-selector").data("visible") )
            
        ?
            
        $("#unit-selector").velocity("stop").velocity({
            translateY: "-110%"
        }, {
            duration: gad/2,
            easing: easing_ios,
            display: "block",
            complete: function() {
                $("#unit-selector").css("z-index","4");
            },
            begin: function() {
                $("#unit-selector").data("visible", true);
                $("#settings.icon").addClass("active");
                $("#settings.icon").velocity("stop").velocity({
                    rotateZ: 180
                }, {
                    duration: gad*4,
                    easing: easing_ios
                });
            }
        }).velocity({
            translateY: "-50%"
        }, {
            duration: gad*2,
            easing: easing_spring
        })
        
        :
         
        $("#unit-selector").velocity("stop").velocity({
            translateY: "-110%",
            rotateX: 0,
            top: "5rem"
        }, {
            duration: gad/2,
            easing: easing_ios,
            complete: function() {
                $("#unit-selector").css("z-index","1");
            },
            begin: function() {
                $("#unit-selector").data("visible", false);
                $("#settings.icon").removeClass("active");
                $("#settings.icon").velocity("stop").velocity({
                    rotateZ: 0
                }, {
                    duration: gad*4,
                    easing: easing_ios
                });
            }
        }).velocity({
            translateY: "10%"
        }, {
            duration: gad*2,
            easing: easing_spring,
            display: "none"
        });
    });
    
    $("#speak.icon").click(function() {
        
        if ('speechSynthesis' in window) {
            if (!$(this).hasClass("active")) {
                var msg = new SpeechSynthesisUtterance($("#countdown").text());

                msg.onstart = function() {
                    $("#speak.icon").addClass("active");
                };

                msg.onend = function() {
                    $("#speak.icon").removeClass("active");
                };

                window.speechSynthesis.cancel();
                speechSynthesis.speak(msg);
                
            } else {
                window.speechSynthesis.cancel();
                $("#speak.icon").removeClass("active");
            }
            
        } else {
            localAlert("Sorry, your browser does not support speech.");
        }
    });
    
   

    // ... slide-in menu buttons
    $("#drawer > div").click(function() {
        switch ($(this).text().trim()) {
            case "Show Milliseconds":
                showmills = true;
                refreshTime();
                $(this).text("Hide Milliseconds");
                safeSetItem("mills", "on");
                break;
            case "Hide Milliseconds":
                showmills = false;
                refreshTime();
                $(this).text("Show Milliseconds");
                localStorage.removeItem("mills");
                break;
            case "Show Copyable Text":
                localAlert("Copy text, then dismiss this notification.", true);
                $("#copyText").show().velocity({
                    top: "50%"
                }, gad*2, easing_spring).text($("#countdown").text()).selectText();
                break;
            case "Enable Lite Mode":
                $.Velocity.mock = true;
                $("*").addClass("notransition");
                $(this).text("Disable Lite Mode");
                localAlert("Lite Mode Enabled");
                safeSetItem("lite", "on");
                break;
            case "Disable Lite Mode":
                $.Velocity.mock = false; // Turns off all Velocity animations
                $("*").removeClass("notransition"); // Removes all CSS transitions
                $(this).text("Enable Lite Mode");
                localAlert("Lite Mode Disabled");
                localStorage.removeItem("lite");
                break;
            case "Disable Ripple":
                ripple = false;
                localAlert("Ripple Disabled");
                $(this).text("Enable Ripple");
                safeSetItem("ripple", "on");
                break;
            case "Enable Ripple":
                ripple = true;
                localAlert("Ripple Enabled");
                $(this).text("Disable Ripple");
                localStorage.removeItem("ripple");
                break;
            case "Go to Home":
                $("body").velocity({scale: 0.8, opacity: 0}, gad, easing_ios, function() {
                    document.location.href = "../index.html";
                    $("body").velocity({scale: 1, opacity: 1}, 0);
                });
                break;
            default:
                localAlert('"' + $(this).text().trim() + '" is not a supported command in this version of the app');
                break;
        }
    });

    // ...alert box
    $("#alert").click(function() {
        closeAlert();
    });
    
    // ...unit selector box
    $("#unit-selector span").click(function() {
        $(this).toggleClass("active");
        if ($(this).hasClass("active")) {
            units[$(this).index()][2] = true;
        } else {
            units[$(this).index()][2] = false;
        }
        
        var unitLength = units.length;
        var unitsBoolean = [];
        
        for (var i = 0; i < unitLength; i++) {
            unitsBoolean[i]= units[i][2];
        }
        localStorage.unitsBool = unitsBoolean.join();
        refreshTime();
    });
    
    $("#unit-selector span").on("contextmenu", function(event) {
        
        event.preventDefault();
        event.stopPropagation();
        
        $("#unit-selector span").removeClass("active");
        $(this).toggleClass("active");
        
        var unitLength = units.length;
        var unitsBoolean = [];
        
        for (var i = 0; i < unitLength; i++) {
            units[i][2] = unitsBoolean[i] = false;
        }
        
        var ind = $(this).index();
        units[ind][2] = unitsBoolean[ind] = true;
        
        localStorage.unitsBool = unitsBoolean.join();
        
        refreshTime();
    });
    
    $("#unit-selector").on("contextmenu", function(event) {
        
        event.preventDefault();
        event.stopPropagation();
        
        $("#unit-selector span").addClass("active");
        
        var unitLength = units.length;
        var unitsBoolean = [];
        
        for (var i = 0; i < unitLength; i++) {
            units[i][2] = true;
            unitsBoolean[i] = true;
        }
        
        localStorage.unitsBool = unitsBoolean.join();
        
        refreshTime();
    });
    
    // When custom inputbox changes
    $("#customInputD").focus(function() {
        
        $("#overlay").velocity("fadeOut", 0);
        $(this).data("preventMouseUp", true).select();
        
    });
    
    // When custom inputbox changes
    $("#customInputD").blur(function() {
        
        $(this).val( $(this).val().trim() );
        if ($(this).val() === "") {
            $("#overlay").velocity("fadeIn", gad);
            $("#goicon").removeClass("valid");
        }
        
    });

    // Allows selecting all text on first click only
    $("#customInputD").add("#customInputL").mouseup(function(e) {

        if ($(this).data("preventMouseUp")) {
            e.preventDefault();
        }
        $(this).data("preventMouseUp", false);
        
    });
    
    // Turn submit button green if current input is valid
    $("#customInputD").keyup(function() {
        var text = $(this).val().trim();
        if (inputIsValid(text) || inputIsValid(getNextDate(text))) {
            $("#goicon").addClass("valid").velocity("stop").velocity({
                rotateZ: 0
            }, {
                duration: gad*2,
                easing: easing_ios
            });
        } else {
            $("#goicon").removeClass("valid").velocity("stop").velocity({
                rotateZ: -90
            }, {
                duration: gad*2,
                easing: easing_ios
            });
        }
        
    });
    
    // Activate input box for custom label
    $("#customLabel").click(function() {
        $(this).velocity("fadeOut", 0);
        $("#customInputL").velocity("fadeIn", {duration: 0, complete: function() { $("#customInputL").focus() } } );
    });
    
     $("#customInputL").focus(function() {
        $(this).data("preventMouseUp", true).select();
    });
    
    $("#customInputL").blur(function() {
        $(this).val( $(this).val().trim() );
        if ($(this).val() === "") {
            $("#customLabel").velocity("fadeIn", gad);
            $("#customInputL").velocity("fadeOut", gad);
        }
    });
    
    // Listen for "Enter" button press
    $("#customInputD").add("#customInputL").keyup(function(event) {
        if (event.which === 13) {
            setCustomCount();
        }
    });
    
    // Keyboard Support
    $(document).keyup(function(event) {
        var x = event.which;
        
        if (x === 27) { // Esc
            hideMenu();
            closeAlert();
            $("#customInputD").blur();
            if ($("#countdownwrapper").hasClass("full")) {
                $("#full.icon").noRippleClick();
            }
        }
        
        if(!$("input").is(":focus")) {
            
            if (x === 70) {  
                $("#full.icon").noRippleClick();
            }
            
            if (!$("#countdownwrapper").hasClass("full")) {
                if (x === 77) { // M
                    if ($("#drawer").is(":hidden")) {
                        $("#menu.icon").noRippleClick();
                    } else {
                        $(document).noRippleClick();
                    }
                } else if (x === 73) { // I
                    $("#info.icon").noRippleClick();
                } else if (x === 72) { // H
                    $("#holiday.icon").noRippleClick();
                } else if (x === 67) { // C
                    $("#custom.icon").noRippleClick();
                } else if (x === 32) { // space
                    $("input").focus();
                }
            }
            
        }
    });

    $("body").velocity({opacity: 1}, 0);
    $("#countdownwrapper").add(".set").add("#menu.icon").add("#full.icon").add(".subicon").hide()
    
    $("#countdownwrapper").velocity({scaleY: [1,0]}, { 
        duration: gad*2, 
        display: "auto",
        easing: easing_ios,
        complete: function() {
            
            $("#countdown").velocity({opacity: [1,0], scale: [1,0.8]}, { 
                duration: gad*2,
                display: "auto",
                easing: easing_ios
            });
            
            $(".subicon").velocity({opacity: [1,0], scale: [1,0]}, {
                duration: gad*2,
                display: "auto",
                easing: easing_ios
            });
            
            startFancies();
            
        }
    });
    
    $(".icon:not(.subicon, .set)").velocity({translateY: [0,"100%"], opacity: [1,0]}, {
        duration: gad*2,
        display: "auto",
        easing: easing_ios
    });
    
    $(".set").velocity({translateY: [0,"-100%"], opacity: [1,0]}, {
        duration: gad*2,
        display: "auto",
        easing: easing_ios
    });
            
    
    $("input").autosizeInput();
    
});

function refreshTime() {
    
    if (stopTimer) {
        return;
    }
    
    var t, // Time until next refresh
        i, // Current unit
        countdownHTML = "", // Text to be inserted into #countdown
        dif = getDif(countTo), // Time in milliseconds till target
        timeword, // "untill" or "since"
        now, // True if target is ± 1 second from now
        values = new Array(); // Holds raw values to be inserted into #countdown [ARRAY]
    
    
    safeSetItem("countTime", countTo);
    safeSetItem("countLabel", countLabel);

    // Set time until next refresh
    if (showmills || localStorage.mills) {
        t = 1;
    } else {
        t = 1000;
    }
    
    // Set next refresh
    setTimeout(function() {
        refreshTime();
    }, t);
    
    (dif < 0) ? (dif = 0 - dif, timeword = "since") : timeword = "until";
    
    now = (Math.floor(dif / 1000) === 0) ? true : false;

    // Create values to be inserted (will not run if 'now' is true)
    var uLength = units.length;
    for (i = 0; i < uLength && !now; i++) {
        
        if (units[i][2]) {
            if (units[i][0] == "year") {
                
                var newDate = new Date(countTo);
                var yearDif = new Date().getFullYear() - new Date(countTo).getFullYear();
                newDate = new Date(newDate.setFullYear(newDate.getFullYear() + yearDif));
                var newDif = getDif(newDate);
                var realDif = getDif(new Date(countTo));
                
                dif = (timeword == "since") ? dif : 0-dif;
                
                while ( sameSign(newDif,dif) ) {
                    (timeword == "until") ? yearDif++ : yearDif--
                    newDate = new Date(newDate.setFullYear(new Date(countTo).getFullYear() + yearDif));
                    newDif = getDif(newDate);
                }
                
                n = Math.abs(yearDif);
                dif = Math.abs(newDif);
                
            } else if (units[i][0] == "month") {
                
                var newDate = new Date(countTo);
                var ogDate = new Date(countTo);
                
                if (values.length > 0) {
                    var yearDif = values[values.length-1][1];
                    ogDate = new Date(newDate.setFullYear(new Date(countTo).getFullYear() + ((timeword == "until") ? (0-yearDif): yearDif)));
                }
                
                var newDif = getDif(newDate);
                
                dif = (timeword == "since") ? 0-dif : dif;
                
                var f = 0;
                
                while (sameSign(newDif,dif)) {
                    (timeword == "until") ? f-- : f++;
                    newDate = new Date(ogDate);
                    newDate.setMonth(ogDate.getMonth() + f);
                    newDif = getDif(newDate);
                }
                
                (timeword == "until") ? f++ : f--
                newDate = new Date(ogDate);
                newDate.setMonth(ogDate.getMonth() + f)
                newDif = getDif(newDate);
                
                n = Math.abs(f);
                dif = Math.abs(newDif);
                
                
            } else {
                var n = Math.floor(dif / units[i][1]);
                dif = dif - n * units[i][1];
            }

            if (units[i][0] === "second" && showmills) {
                dif = (dif + "000").substring(0,3);
                n = n + "." + dif;
            }

            if (n > 0) {
                values[values.length] = [units[i][0],n];
            }
        }
        
    }
    
    // Create HTML to be inserted from values
    var vLength = values.length;
    for (var g = 0; g < vLength && !now; g++) {
        if (g + 1 === vLength) {
            countdownHTML += makeHTML(values[g][1], values[g][0]);
        } else if (g + 2 === vLength) {
            countdownHTML += makeHTML(values[g][1], values[g][0]) + " and ";
        } else {
            countdownHTML += makeHTML(values[g][1], values[g][0]) + ", ";
        }  
    }

    // Finalize HTML
    if (now) { // If target is ± 1 second from now
        countdownHTML = "it is <span id='countTo'>" + countLabel + "</span> right now";
    } else if (countdownHTML === "") {
        countdownHTML = "Cannot count down to '" + countLabel + "' with selected units";
    } else { // Add  "since"/"until" and event name
        countdownHTML += "<br /> " + timeword + " <span id='countTo'>" + countLabel + "</span>";
    }

    // Insert HTML
    $("#countdown").html(countdownHTML);
    
}

function makeHTML(value, unit) {
    
    var HTML = "<span>" + value + "</span>\u00a0" + unit;
    HTML += (value === 1) ? "" : "s";
    
    return HTML;

}

// Hide selection menus
function hideMenu() {

    if ($("#countdownwrapper").hasClass("selectmode")) {
        
        refreshTime();
        
        $("#countdownwrapper").removeClass("selectmode").velocity("stop").velocity({
            scale: 1,
            opacity: 1
        }, { 
            duration: gad*2, 
            easing: easing_ios
        });
        
        $(".selector").velocity("stop").velocity({
            top: "100%"
        }, { 
            display: "none", 
            duration: gad,
            easing: easing_iosreverse,
            complete: function() {
                $(this).velocity({left: "50%"},0);
            }
        });
        
        if($("#unit-selector").is(":visible")) {
                $("#unit-selector").velocity({top: "5rem", rotateX: 0}, gad);
        }
        
        $(".set").removeClass("active").removeClass("dead");
        $("#customInputD").blur();
    }  
}

// Set text in inputbox as countdown
function setCustomCount() {

    var datestring = $("#customInputD").val().trim();
    var labelstring = $("#customInputL").val().trim();

    if (datestring === "") { // Empty
        localAlert("No date entered!");
        shakeWrapper();
    } else if (inputIsValid(datestring)) { // Valid

        hideMenu();
        countTo = datestring;
        countLabel = (labelstring === "") ? datestring : labelstring;
        addToRecents(countTo, countLabel);

    } else if (inputIsValid(getNextDate(datestring))) { // Valid but no year

        hideMenu();
        countTo = getNextDate(datestring);
        countLabel = (labelstring === "") ? getNextDate(datestring) : labelstring;
        addToRecents(countTo, countLabel);
        localAlert("No year entered. The next occurence of the date was used");

    } else if (datestring === "now") { // NOW (special)

        countTo = new Date().getTime();
        countLabel = $.format.date(countTo, "MMMM d yyyy h:mm:ss a");
        hideMenu();

    } else { // Nope
        localAlert("Invalid input. Please follow a standard date format.");
       shakeWrapper();
    }

    refreshTime();
}

// Check if text in inputbox can be used as countdown
function inputIsValid(date) {
    
    return (isNaN(new Date(date).getTime())) ? false : true;
    
}

// Custom alert system
function localAlert(msg, stayopen) {
    
    $("#alert").velocity("stop");
    
    if ($("#alert").is(":visible")) {
        if (msg === $("#alerttext").text() )
        {
            $("#alert").velocity({
            scale: 0.8
            }, gad/2, easing_ios);
        } else {
            $("#alert").velocity({
                scale: 0
            }, gad/2, easing_ios, function() {
                $("#alerttext").text(msg);
            });
        }
        
        $("#alert").velocity({
            scale: 1
        }, gad*2, easing_spring);
        
    } else {
        $("#alerttext").text(msg);
        $("#alert").show().velocity({
            opacity: 1,
            translateY: [0,10]
        }, {
            duration: gad*2,
            easing: easing_ios//spring
        });
    }
    
    if(stayopen) {
        $.doTimeout('alert');
    } else {
        $.doTimeout('alert', gad*20, function() {
            closeAlert();
        }, true);
    }
}

// Close localAlert
function closeAlert() {
    
    $("#copyText").velocity("stop").velocity({
        top: "100%"
    }, gad, easing_iosreverse, function() {
        $(this).hide();
    });
    
    $("#alert").velocity("stop").velocity({
        opacity: 0
    }, gad, easing_iosreverse, function() {
        $(this).hide();
    });
    
    $("#info.icon").removeClass("active");
    
}

// Get next occurence of month and date
function getNextDate(date) {
    
    if (date === "") {
        return date;
    }
    
    for (var year = 2000; getDif(date + " " + year) < 0; year++) {}
    var fulldate = date.charAt(0).toUpperCase() + date.substring(1) + " " + year;
    return fulldate;

}

// Get time in milliseconds until or from date 'h'
function getDif(h) {
    
    return new Date(h).getTime() - new Date().getTime();
    
}

function setHeight() {
    if (!$("#countdownwrapper").hasClass("full")) {
        $(".wrapper").css('height', $(window).height() - $("#menu.icon").outerHeight()*2 );
    }
}

// Shake selector
function shakeWrapper() {
    $("#selectorwrapper").velocity("stop").velocity({
        marginLeft: "10px",
        rotateZ: "1deg"
    }, gad/4, "easeInSine").velocity({
        marginLeft: "-10px",
        rotateZ: "-1deg"
    }, {
        duration: gad/4,
        easing: "easeInOutSine",
        loop: 2
    }).velocity({
        marginLeft: "0",
        rotateZ: "0"
    }, gad/4, "easeOutSine");
}

function sameSign(x,y) {
    return ((x<0) == (y<0));
}

function startFancies() {
    /*$("#refresh.icon").velocity({rotateZ: 0}, {duration: 0, queue: false}).velocity({
        rotateZ: 360
    }, {
        duration: 60*1000,
        loop: true,
        easing: "linear"
    })*/
}

function addToRecents(date, label) {
    localStorage.recentDates = localStorage.recentDates ?  date + ";" + localStorage.recentDates: date;
    localStorage.recentLabels = localStorage.recentLabels ?  label + ";" + localStorage.recentLabels : label;
}

function refreshRecents() {
    if (localStorage.recentDates && localStorage.recentLabels) {
        var dates = localStorage.recentDates.split(";");
        var labels = localStorage.recentLabels.split(";");
        $("#recents").empty();
    
        var dLength = dates.length;
        for (var i = 0; i < dLength; i++) {
            $("#recents").append('<div data="' + dates[i] +  '">' + labels[i] + "</div>");
        }
    
        $("#recents div").click(function() {
            countTo = $(this).attr("data");
            countLabel = $(this).text();
            hideMenu();
            refreshTime();
        });
        
    } else {
        localAlert("No recent dates");
    }
}

function hideRecents() {
    $("#recents").velocity("stop").velocity("reverse", {
        duration: gad,
        easing: easing_iosreverse,
        display: "none"
    });
}

function getMenu(id) {
    var menus = [
            ["holiday", $("#holiday_selector")],
            ["custom", $("#custom_selector")]
        ],
        selector;
    
    for (var i = 0; i < menus.length; i++) {
        (id == menus[i][0]) ? selector = menus[i][1] : null ;
    }
    
    return selector;
}

(function ( $ ) {
    $.fn.noRippleClick = function() {
        var oripple = ripple;
        ripple = false;
        this.click();
        ripple = oripple;
    };
}( jQuery ));

function safeSetItem(key, value) {
    
    /*try {
        safeSetItem(key, value);
    } catch (err) {}*/
}