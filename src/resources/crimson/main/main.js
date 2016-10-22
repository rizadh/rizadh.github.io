"use strict";

var gad = 200,
    easing_ios = [0.2, 0.75, 0, 1],
    easing_iosreverse = [0.5, 0, 0.5, 0],
    easing_spring = [100, 10];

$(function() {
    FastClick.attach(document.body);    
    
    $("#cardwrapper").velocity({
        translateX: "-50%"
    }, 0);
    $("#menu").velocity({
        scale: 0
    }, 0).hide();
    
    $("#menubutton").click(function(e) {
        if ($("#menu").hasClass("active")) {
            $("#menu").velocity("stop").velocity({ top: "1rem", left: "1rem"}, {duration: gad, easing: easing_ios});
            $("#menu").css("transform-origin", "1rem 1rem");
        } else {
            $("#menu").addClass("active");
            $("#menu").css({ top: "1rem", left: "1rem"});
            $("#menu").css("transform-origin", (e.pageX - window.scrollX - 16) + "px " + (e.pageY - window.scrollY  - 16) + "px");
            $("#menu").velocity("stop").velocity({scale: 1}, {duration: gad, easing: easing_ios, display: "block", complete: function() {
                $("#menu").css("transform-origin", "1rem 1rem");
            }});
        }
    });
    
    
    $(document).click(function(e) {
        if (!$(e.target).is("#menubutton, #menubutton *") && $("#menu").hasClass("active")) {
            $("#menu").removeClass("active");
            $("#menu").velocity("stop").velocity({scale: 0}, {duration: gad, easing: easing_iosreverse, display: "none"});
        }
    });
    
    $(document).scroll(function(e) {
        if (!$(e.target).is("#menubutton, #menubutton *") && $("#menu").hasClass("active")) {
            $("#menu").removeClass("active");
            $("#menu").velocity("stop").velocity({scale: 0}, {duration: gad, easing: easing_iosreverse, display: "none"});
        }
    });
    
    $(document).on("contextmenu", function (e) {
        e.preventDefault();
        
        var farright = e.pageX - window.scrollX + 8 + $("#menu").width() > $(window).width();
        var fardown = e.pageY - window.scrollY + 8 + $("#menu").height() > $(window).height();
        var origin;
        
        origin = (farright) ? "100% " : "0 ";
        origin += (fardown) ? "100%" : "0";
        $("#menu").css("transform-origin", origin);
        
        if ($("#menu").hasClass("active")) {
            $("#menu").velocity("stop");
            $("#menu").velocity({ 
                left: farright ? (e.pageX - window.scrollX - $("#menu").width()) : (e.pageX - window.scrollX),
                top: fardown ? (e.pageY - window.scrollY - $("#menu").height()) : (e.pageY - window.scrollY)
            }, {duration: gad, easing: easing_ios, queue: false });
        } else {
            $("#menu").addClass("active");
            $("#menu").css({
                left: farright ? (e.pageX - window.scrollX - $("#menu").width()) : (e.pageX - window.scrollX),
                top: fardown ? (e.pageY - window.scrollY - $("#menu").height()) : (e.pageY - window.scrollY) 
            });
            $("#menu").velocity("stop").velocity({scale: 1}, {duration: gad, easing: easing_ios, display: "block"});
        }
    });
    
    $("#menu > div").click(function() {
        switch ($(this).text().trim()) {
            case "Disable Ripple":
                ripple = false;
                $(this).text("Enable Ripple");
                break;
            case "Enable Ripple":
                ripple = true;
                $(this).text("Disable Ripple");
                break;
            default:  
                scrollToHeading($(this).text().trim());
                console.log("SCROLLING to " + $(this).text().trim());
                break;
        }
    });
    
    $("a section").click(function(e) {
        
        e.preventDefault();
        
        var navHref = $(this).parent().attr("href");
        console.log(navHref);
        
        $("header")
            .add($("#cardwrapper").children())
            .velocity("stop")
            .velocity("reverse", function() {
                document.location.href = navHref;
                initiate();
        });
    });
    
    $("body").velocity({opacity: 1}, 0);
    $("#cardwrapper").children().add("header").hide();
    
    initiate();
    
});

function initiate() {
    $("header").velocity({
        translateY: [0,"-100%"]
    }, {
        duration: gad*2,
        display: "auto",
        easing: easing_ios,
        complete: function() {
            $("#cardwrapper").children().velocity("transition.slideUpIn", {
                duration: gad,
                stagger: gad/4,
                display: "block"
            });
        }
    });
}

function scrollToHeading(heading) {
    var headings = $(".cardlabel").toArray();
    for (var i = 0; i < headings.length; i++) {
        if($(headings[i]).text().trim() == heading) {
            $(headings[i]).velocity("scroll", {
                duration: gad*2,
                offset: -72,
                easing: easing_ios
            }).velocity({
                color: "#fff"
            }, {
                duration: gad/2,
                loop: 2
            });
            
        }
    }
}