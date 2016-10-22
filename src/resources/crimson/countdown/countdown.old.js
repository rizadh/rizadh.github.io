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

    // Exam times
    examtimes = ["8:30 AM", "12:00 PM"],

    // Exam Database - FORMAT: [course, level, n[date, time]]
    exams = [
        ["English", "HL", ["05/04/2015", "morning"],
            ["05/05/2015", "afternoon"]
        ],
        ["Chemistry", "HL", ["05/14/2015", "afternoon"],
            ["05/14/2015", "afternoon"],
            ["05/15/2015", "morning"]
        ],
        ["Chemistry", "SL", ["05/14/2015", "afternoon"],
            ["05/14/2015", "afternoon"],
            ["05/15/2015", "morning"]
        ],
        ["Biology", "HL", ["05/06/2015", "morning"],
            ["05/06/2015", "morning"],
            ["05/07/2015", "afternoon"]
        ],
        ["Biology", "SL", ["05/06/2015", "morning"],
            ["05/06/2015", "morning"],
            ["05/07/2015", "afternoon"]
        ],
        ["Physics", "SL", ["05/08/2015", "morning"],
            ["05/08/2015", "morning"],
            ["05/11/2015", "afternoon"]
        ],
        ["Economics", "HL", ["05/04/2015", "afternoon"],
            ["05/05/2015", "morning"],
            ["05/05/2015", "morning"]
        ],
        ["History", "HL", ["05/14/2015", "morning"],
            ["5/15/2015", "afternoon"],
            ["05/18/2015", "morning"]
        ]
    ],

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

    exams.sort();

    // Remove 300ms touch delay on some devices
    FastClick.attach(document.body);

    // Begin auto-refreshing of countdown
    refreshTime();
    
    // Session Storage Functions
    if (localStorage.ripple === "on") {
        ripple = false;
        $("#menu").find(":contains('Ripple')").text("Enable Ripple");
    }
    if (localStorage.lite === "on") {
        $.Velocity.mock = true;
        $("*").addClass("notransition");
        $("#menu").find(":contains('Lite')").text("Disable Lite Mode");
    }
    if (localStorage.mills === "on") {
        showmills = true;
        $("#menu").find(":contains('Milliseconds')").text("Hide Milliseconds");
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

    // Add Exams into selector menu
    var eLength = exams.length;
    for (var j = 0; j < eLength; j++) {
        // Add subjects
        $("#exam_selector > table").append("<tr id='" +
            exams[j][0].toLowerCase() +
            "_" +
            exams[j][1].toLowerCase() +
            "'><td class='subject'>" +
            exams[j][0] +
            " " +
            exams[j][1] +
            "</td></tr>");
        
        var p = exams[j].length - 1;

        // Add papers
        for (var n = 1; n < p; n++) {
            $("#exam_selector tr").last().append("<td class='paper'>P" + n + "</td>");
        }
    }

    // Sets up extra elements for future animating/displaying
    setHeight();
    $("#shade").velocity({
        translateX: "-50%",
        translateY: "-50%"
    }, 0).hide();
    $("#unit-selector").velocity({
        translateX: "-50%"
    }, 0).hide();
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
    $("#menu").velocity({
        translateX: "-100%"
    }, 0).hide();
    $("#alert").velocity({
        translateY: "-100%",
        translateX: "-50%"
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
    
    $("#countdownwrapper").on("contextmenu", function (event) {
    
        // Avoid the real one
        event.preventDefault();
        if ($("#shade").is(":hidden")) {
            $("#menuicon").noRippleClick();
        }

    });
    
    $("#countdown").on("contextmenu", function (event) {
    
        // Avoid the real one
        event.preventDefault();
        event.stopPropagation();
        (stopTimer) ? localAlert("Resuming Countdown") : localAlert("Countown Paused");
        stopTimer = (stopTimer) ? false : true;
        refreshTime();

    });

    // Set click handlers for...
    
    // ...lower bar buttons
    $(".set").click(function() {
        
        closeAlert();
        
        var menu = getMenu($(this).attr('id'));

        if ($(this).hasClass("active")) {
            hideMenu();
        } else {
            
            if (!$("#countdownwrapper").hasClass("selectmode")) {
                
                menu.velocity("stop").velocity({
                    top: "5em"
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
                    easing: easing_iosreverse,
                    complete: function() {
                        $(".paper").hide();
                        $(".subject").show();
                    }
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
                        
                menu.css("z-index", 2).velocity("stop").velocity({top: "5em"}, 0).velocity({
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
                        $(".paper").hide();
                        $(".subject").show();
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

    // ...when a subject is selected (exam selection menu)
    $(".subject").click(function() {
        var subjectid = "#" + $(this).closest("tr").attr("id");

        $(".subject:hidden").closest("tr").add($(this).closest("tr")).velocity({
            scaleY: 0
        }, gad / 2, function() {
            $(subjectid + " .subject").add(".paper").not(subjectid + " .paper").hide();
            $(subjectid + " .paper").add(".subject").not(subjectid + " .subject").show();
        }).velocity({
            scaleY: 1
        }, gad / 2);
    });

    // ...when a paper is selected (exam selection menu)
    $(".paper").click(function() {
        
        var subjectid = $(this).closest("tr").attr("id"),
            subject = subjectid.charAt(0).toUpperCase() + subjectid.slice(1, subjectid.lastIndexOf("_")),
            level = subjectid.slice(subjectid.lastIndexOf("_") + 1, subjectid.length).toUpperCase(),
            paper = parseInt(this.textContent.substr(1)),
            eLength = exams.length;
        for (var i = 0; i < eLength; i++) {
            if (exams[i][0] === subject && exams[i][1] === level) {
                break;
            }
        }
        if (exams[i][1 + paper][1] === "morning") {
            time = examtimes[0];"7:00";
        } else {
            time = examtimes[1];"12:00";
        }
        var numberToText = ["One", "Two", "Three"];
        countTo = exams[i][1 + paper][0] + " " + time;
        countLabel = exams[i][0] + " " + exams[i][1] + " Paper " + numberToText[paper - 1];
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
    
    $(document).click(function(e) {
        hideRecents();
        if (!$(e.target).is(".selector, .selector *, .set, .set *, #alert, #alert *")) {
            hideMenu();
        }
    });
    
    // ...fullscreen button
    $("#fullicon").click(function() {

        var k, o;

        //Close extra elements
        closeAlert();

        // Switch between inward and outward arrows
        if ($("#countdownwrapper").hasClass("full")) {

            // Change to outward arrow
            k = 0;

            // Show info button and contract countdownwrapper
            $(".subicon").css("pointer-events", "auto").velocity("stop").velocity({
                opacity: 1,
                scale: 1
            }, gad*2, easing_spring);
            startFancies();
            
            $("#countdownwrapper").velocity("stop").velocity({
                top: "5em",
                height: $(window).height() - 160
            }, {
                duration: gad*2,
                easing: easing_spring
            });
            
            if($("#unit-selector").is(":visible")) {
                $("#unit-selector").velocity({top: "5rem", translateY: "-50%"}, gad*2, easing_spring);
            }

        } else {

            // Change to inward arrow
            k = 1;

            // Hide info button
            $(".subicon").css("pointer-events", "none").velocity("stop").velocity({
                opacity: 0,
                scale: 0
            }, gad*2, easing_spring);

            // Expand countdownwrapper
            $("#countdownwrapper").velocity("stop").velocity({
                top: "0",
                scale: 1,
                opacity: 1,
                height: "100%"
            }, {
                duration: gad*2,
                easing: easing_spring
            });
            
            if($("#unit-selector").is(":visible")) {
                $("#unit-selector").velocity({top: "0", translateY: "-100%"}, gad*2, easing_spring);
            }

        }

        if (k === 1) {
            o = 0.5;
        } else {
            o = 1;
        }

        // Suck in button, then pop out
        $("#fullicon").velocity("stop").velocity({
            scale: 0,
            opacity: 0
        }, gad/2, "linear", function() {

            // Loops 4 times, for each arrow using array database
            for (var i = 0; i < 4; i++) {
                $("#poly" + (i + 1)).attr("points", arrows[k][i]);
            }

        }).velocity({
            scale: 1,
            opacity: o
        }, gad*2, easing_spring);

        $("#countdownwrapper").toggleClass("full");


    });

    // ...menu button
    $("#menuicon").click(function() {
        // Slide in side-menu
        $("#menu").velocity("stop").velocity({
            translateX: "0%"
        }, {
            duration: gad*2,
            easing: easing_ios,
            //delay: 100,
            display: "block"
        });
       
        // Darken app in background via shade (new Lollipop effect)
        $("#shade").velocity("stop").velocity({
            opacity: 1
        }, 0).velocity({
            scale: [1,0]
        }, {
            display: "block",
            duration: gad*2,
            easing: easing_ios
        });
        
        // Hide extra elements
        closeAlert();
        
    });

    // ...info button
    $("#infoicon").click(function() {

        var countword,
            format;

        if ($("#countdown").text().indexOf("since") > 0) {
            countword = "from ";
        } else {
            countword = "down to ";
        }

        localAlert("Counting " + countword + $.format.date(new Date(countTo).getTime(), "MMMM d yyyy h:mm:ss a"));
        $("#infoicon").addClass("active");
    });
    
    $("#refreshicon").click(function() {
        $("body").velocity({scaleY: 0}, gad, function() {
            localStorage.reset = "on";
            document.location.reload(true);
        });
    });
    
    $("#settingicon").click(function() {
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
                $("#settingicon").addClass("active");
                $("#settingicon").velocity("stop").velocity({
                    rotateZ: 90
                }, {
                    duration: gad,
                    easing: "easeOutSine"
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
                $("#settingicon").removeClass("active");
                $("#settingicon").velocity("stop").velocity({
                    rotateZ: 0
                }, {
                    duration: gad,
                    easing: "easeOutSine"
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
    
    $("#speakicon").click(function() {
        
        function endAudio() {
            $("#speakicon").removeClass("active").velocity("stop").velocity({
                rotateZ: 0,
                scale: 1
            }, {
                duration: gad,
                easing: "easeOutSine"
            });
        }
        
        if ('speechSynthesis' in window) {
            if (!$(this).hasClass("active")) {
                var msg = new SpeechSynthesisUtterance($("#countdown").text());

                msg.onstart = function() {
                    $("#speakicon").addClass("active").velocity("stop").velocity({
                        rotateZ: -135,
                        scale: 1.2
                    }, {
                        duration: gad,
                        easing: "easeOutSine"
                    });
                };

                msg.onend = function() {
                    endAudio();
                };

                window.speechSynthesis.cancel();
                speechSynthesis.speak(msg);
            } else {
                window.speechSynthesis.cancel();
                endAudio();
            }
            
        } else {
            localAlert("Sorry, your browser does not support speech.");
        }
    });
    
   

    // ... slide-in menu buttons
    $("#menu > div").not("#close").click(function() {
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
                localAlert("Copy text below, then dismiss this notification.", true);
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
                duration: gad,
                easing: "easeOutSine"
            });
        } else {
            $("#goicon").removeClass("valid").velocity("stop").velocity({
                rotateZ: -90
            }, {
                duration: gad,
                easing: "easeOutSine"
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

    // Clicking close button, shade or any button in menu will close slide-in menu
    $("#close").add("#shade").add("#menu > div").click(function() {
        $("#menu").velocity("stop").velocity({
            translateX: "-100%"
        }, {
            duration: gad,
            easing: easing_iosreverse,
            complete: function() {
                $(this).hide();
            }
        });
        $("#shade").velocity("stop").velocity("fadeOut", gad);
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
            $("#close").noRippleClick();
            $("#customInputD").blur();
            if ($("#countdownwrapper").hasClass("full")) {
                $("#fullicon").noRippleClick();
            }
        }
        
        if(!$("input").is(":focus")) {
            
            if ($("#shade").is(":hidden") && x === 70) {  
                $("#fullicon").noRippleClick();
            }
            
            if (!$("#countdownwrapper").hasClass("full")) {
                if (x === 77) { // M
                    if ($("#shade").is(":hidden")) {
                        $("#menuicon").noRippleClick();
                    } else {
                        $("#close").noRippleClick();
                    }
                } else if ($("#shade").is(":hidden")) {
                    if (x === 73) { // I
                        $("#infoicon").noRippleClick();
                    } else if (x === 69) { // E
                        $("#exams").noRippleClick();
                    } else if (x === 72) { // H
                        $("#holidays").noRippleClick();
                    } else if (x === 67) { // C
                        $("#custom").noRippleClick();
                    } else if (x === 32) { // space
                        $("input").focus();
                    }
                }
            }
            
        }
    });

    $(".subject").attr("colspan", "3");
    $("body").velocity({opacity: 1}, 0);
    $("#countdownwrapper").add("#dateselector").add("#menuicon").add("#fullicon").add(".subicon").hide()
    
    $("#countdownwrapper").velocity({scaleY: [1,0]}, { 
        duration: gad*2, 
        display: "auto",
        easing: "easeQuad",
        complete: function() {
            
            $("#countdown").velocity({opacity: [1,0], scale: [1,0.8]}, { 
                duration: gad,
                display: "auto"
            });
            
            $("#dateselector").add("#menuicon").add("#fullicon").add(".subicon").velocity({opacity: [1,0]}, {
                duration: gad*2,
                display: "auto"
            });
            
            startFancies();
            
        }
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
                $(".paper").hide();
                $(".subject").show();
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
            }, gad/2, easing_iosreverse);
        } else {
            $("#alert").velocity({
                scale: 0
            }, gad/2, easing_iosreverse, function() {
                $("#alerttext").text(msg);
            });
        }
        
        $("#alert").velocity({
            scale: 1
        }, gad*2, easing_spring);
        
    } else {
        $("#alerttext").text(msg);
        $("#alert").show().velocity({
            translateY: 0
        }, {
            duration: gad*2,
            easing: easing_spring
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
    
    $("#copyText").velocity("finish").velocity({
        top: "100%"
    }, gad, easing_iosreverse, function() {
        $(this).hide();
    });
    
    $("#alert").velocity("finish").velocity({
        translateY: "-100%"
    }, gad, easing_iosreverse, function() {
        $(this).hide();
    });
    
    $("#infoicon").removeClass("active");
    
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
        $(".wrapper").css('height', $(window).height() - 160);
    }
    
    var shadeRadius = Math.ceil(2*( Math.sqrt( Math.pow( $(window).height(), 2 ) + Math.pow( $(window).width(), 2) ) ));
    $("#shade").css('height', shadeRadius);
    $("#shade").css('width', shadeRadius);
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
    $("#refreshicon").velocity({rotateZ: 0}, {duration: 0, queue: false}).velocity({
        rotateZ: 360
    }, {
        duration: 60*1000,
        loop: true,
        easing: "linear"
    })
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
            ["holidays", $("#holiday_selector")],
            ["exams", $("#exam_selector")],
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
    try {
        safeSetItem(key, value);
    } catch (err) {}
}