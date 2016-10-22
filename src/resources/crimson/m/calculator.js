//Elimintate 300ms delay on some devices
$(function() {
    FastClick.attach(document.body);
});

//Crucial variables
var x = "";
var symPressed = true;
var sumDisplayed = false;
var butPressed = false;

//Kill scrolling no mobile devices
document.ontouchmove = function(e) {e.preventDefault()};

//Keyboard support (finally!) and simulates pressing of button
document.addEventListener('keydown', function(event) {
    if (event.shiftKey) {
        if(event.keyCode == 57) {
            butClick($("#calBraL"));
            press($("#calBraL"));
        }
        else if(event.keyCode == 48) {
            butClick($("#calBraR"));
            press($("#calBraR"));
        }
        else if(event.keyCode == 56) {
            butClick($("#calMul"));
            press($("#calMul"));
        }
    }
    else if(event.keyCode == 48 || event.keyCode == 96) {
        butClick($("#cal0"));
        press($("#cal0"));
    }
    else if(event.keyCode == 49 || event.keyCode == 97) {
        butClick($("#cal1"));
        press($("#cal1"));
    }
    else if(event.keyCode == 50 || event.keyCode == 98) {
        butClick($("#cal2"));
        press($("#cal2"));
    }
    else if(event.keyCode == 51 || event.keyCode == 99) {
        butClick($("#cal3"));
        press($("#cal3"));
    }
    else if(event.keyCode == 52 || event.keyCode == 100) {
        butClick($("#cal4"));
        press($("#cal4"));
    }
    else if(event.keyCode == 53 || event.keyCode == 101) {
        butClick($("#cal5"));
        press($("#cal5"));
    }
    else if(event.keyCode == 54 || event.keyCode == 102) {
        butClick($("#cal6"));
        press($("#cal6"));
    }
    else if(event.keyCode == 55 || event.keyCode == 103) {
        butClick($("#cal7"));
        press($("#cal7"));
    }
    else if(event.keyCode == 56 || event.keyCode == 104) {
        butClick($("#cal8"));
        press($("#cal8"));
    }
    else if(event.keyCode == 57 || event.keyCode == 105) {
        butClick($("#cal9"));
        press($("#cal9"));
    }
    else if(event.keyCode == 106) {
        butClick($("#calMul"));
        press($("#calMul"));
    }
    else if(event.keyCode == 107) {
        butClick($("#calAdd"));
        press($("#calAdd"));
    }
    else if(event.keyCode == 109) {
        butClick($("#calSub"));
        press($("#calSub"));
    }
    else if(event.keyCode == 110) {
        butClick($("#calDot"));
        press($("#calDot"));
    }
    else if(event.keyCode == 111 || event.keyCode == 190) {
        butClick($("#calDiv"));
        press($("#calDiv"));
    }
    else if(event.keyCode == 219) {
        butClick($("#calBraL"));
        press($("#calBraL"));
    }
    else if(event.keyCode == 221) {
        butClick($("#calBraR"));
        press($("#calBraR"));
    }
    else if(event.keyCode == 13) {
        if (!$("#error").hasClass('hidden')) {
            manualInput('enter');
            press($("#errorAccept"));
        }
        else {
            butClick($("#calEqual"));
            press($("#calEqual"));
        }
    }
    else if(event.keyCode == 8) {
        if ($("#inputField").is(':focus')) {

        }
        else {
            event.preventDefault();
        }
        clearDisplay();
    }
    else if(event.keyCode == 27) {
        manualInput("hide");
        clearDisplay();
    }
    else {
    return;
    }

});

//Simulate release of buttons
document.addEventListener('keyup', function(event) {
    unPress($("*"));

});

// Only start laying out when everything has loaded
$(document).ready(function () {
    setSize();
    $('#error').addClass('hidden');
    $('#disable').addClass('hidden');
    $('#errortext').addClass('hidden');
    $('#entrytext').addClass('hidden');
});


// Re-layout when window is resized
$(window).resize(function () {
    setSize();
    fitScreen(0);
});

// Set sizes of elements based on available space
function setSize() {
    calWidth = window.innerWidth;
    calHeight = window.innerHeight;
    cutLine = 2.3; //Maximum height:width ratio before shrinking textsize
    // Button's are too narrow
    if (cutLine*calWidth > calHeight){
        size = calHeight;
    }
    // Buttons are wide enough
    else {
        size = calWidth*cutLine;
    }
    popSize = calWidth / 20 + "px";
    butSize = size / 8 + "px";
    butWidth = calWidth / 4;
    butHeight = Math.round(calHeight/6);
    $('.calButton').css('line-height',butHeight + "px");
    $('#calBraL').css('line-height',butHeight*0.9 + "px");
    $('#calBraR').css('line-height',butHeight*0.9 + "px");
    $('.calButton').css('font-size',butSize);
    $('.calButton').css('width',butWidth);
    $('.calButton').css('height',butHeight);
    $('#calEqual').css('width',butWidth*2);
    $('#calDisplay').css('line-height',butHeight + "px");
    $('#calDisplay').css('height',butHeight);
    $('#calDisplay').css('font-size',butSize);
    $('#calDisplay').css('width',calWidth);
    // Pop-up styling
    $('#error').css('width',calWidth);
    $('#error').css('height',calHeight*0.5);
    $('#error').css('top',calHeight*0.25);
    $('#error').css('left',0);
    $('#error').css('font-size',popSize);
    $('#error').css('width',calWidth);
    $('#errorMessage').css('height',calHeight*0.5/3);
    $('#errorMessage').css('width',calWidth);
    $('#errorMessage').css('left',0);
    $('#errorMessage').css('line-height',calHeight*0.5/3 + "px");
    $('#inputField').css('height',calHeight*0.5/3);
    $('#inputField').css('width',calWidth);
    $('#inputField').css('top',calHeight*0.5/3);
    $('#inputField').css('left',0);
    $('#inputField').css('line-height',calHeight*0.5/3 + "px");
    $('#inputField').css('font-size',popSize);
    $('#errorCancel').css('height',calHeight*0.5/3);
    $('#errorCancel').css('width',calWidth/2);
    $('#errorCancel').css('top',(calHeight*0.5)/(3/2));
    $('#errorCancel').css('left',0);
    $('#errorCancel').css('line-height',calHeight*0.5/3 + "px");
    $('#errorAccept').css('height',calHeight*0.5/3);
    $('#errorAccept').css('width',calWidth/2);
    $('#errorAccept').css('top',(calHeight*0.5)/(3/2));
    $('#errorAccept').css('left',calWidth/2);
    $('#errorAccept').css('line-height',calHeight*0.5/3 + "px");
    // Hide popups
    setPos(calWidth,calHeight);
}

// Position elements according to available space
function setPos(calWidth,calHeight) {
    x1 = 0;
    x2 = x1 + calWidth/4;
    x3 = x2 + calWidth/4;
    x4 = calWidth * (3/4);
    y1 = Math.round(calHeight/6);
    y2 = y1 + y1;
    y3 = y2 + y1;
    y4 = y3 + y1;
    y5 = y1*5;
    lastHeight = calHeight - y5;
    $('#calDot').css('height',lastHeight);
    $('#cal0').css('height',lastHeight);
    $('#calEqual').css('height',lastHeight);
    $('#calClear').css('left',x1);
    $('#calBraL').css('left',x2);
    $('#calBraR').css('left',x3);
    $('#calDiv').css('left',x4);
    $('#calDiv').css('left',x4);
    $('#cal7').css('left',x1);
    $('#cal8').css('left',x2);
    $('#cal9').css('left',x3);
    $('#calMul').css('left',x4);
    $('#cal4').css('left',x1);
    $('#cal5').css('left',x2);
    $('#cal6').css('left',x3);
    $('#calAdd').css('left',x4);
    $('#cal1').css('left',x1);
    $('#cal2').css('left',x2);
    $('#cal3').css('left',x3);
    $('#calSub').css('left',x4);
    $('#calDot').css('left',x1);
    $('#cal0').css('left',x2);
    $('#calEqual').css('left',x3);
    $('#calClear').css('top',y1);
    $('#cal7').css('top',y2);
    $('#cal4').css('top',y3);
    $('#cal1').css('top',y4);
    $('#calDot').css('top',y5);
    $('#calBraL').css('top',y1);
    $('#cal8').css('top',y2);
    $('#cal5').css('top',y3);
    $('#cal2').css('top',y4);
    $('#cal0').css('top',y5);
    $('#calBraR').css('top',y1);
    $('#cal9').css('top',y2);
    $('#cal6').css('top',y3);
    $('#cal3').css('top',y4);
    // $('#cal0').css('top',y5); Caused by extra large equal button
    $('#calDiv').css('top',y1);
    $('#calMul').css('top',y2);
    $('#calAdd').css('top',y3);
    $('#calSub').css('top',y4);
    $('#calEqual').css('top',y5);
    setFunc();
}

// Set functions of buttons
function setFunc() {
    $(".calButton").attr("onTouchStart","press(this);");
    $(".calButton").attr("onMouseDown","press(this);");
    $(".calButton").attr("onTouchEnd","unPress(this);");
    $(".calButton").attr("onMouseUp","unPress(this);");
    $(".calButton").attr("onMouseLeave","unPress(this);");
    $(".calButton").attr("onClick","butClick(this)");
    $("#errorCancel").attr("onTouchStart","press(this);");
    $("#errorCancel").attr("onMouseDown","press(this);");
    $("#errorCancel").attr("onTouchEnd","unPress(this);");
    $("#errorCancel").attr("onMouseUp","unPress(this);");
    $("#errorCancel").attr("onMouseLeave","unPress(this);");
    $("#errorAccept").attr("onTouchStart","press(this);");
    $("#errorAccept").attr("onMouseDown","press(this);");
    $("#errorAccept").attr("onTouchEnd","unPress(this);");
    $("#errorAccept").attr("onMouseUp","unPress(this);");
    $("#errorAccept").attr("onMouseLeave","unPress(this);");
}

// Makes button appear depressed
function press(id) {
    $(id).addClass('active');
}

// Makes button revert to regular state
function unPress(id) {
    $(id).removeClass('active');
}

function butClick(id) {
    // Detect any button click except equal
    if ($(id).attr("data-val")) {
        x = x + $(id).attr("data-val");
        // Detect input of numerical value 0-9 or . that would change display
        if ($(id).attr("data-val") >= 0 || $(id).attr("data-val") == ".") {
            // Start over calculation if already summed
            if (sumDisplayed == true) {
                x = "";
                x = $(id).attr("data-val");
                symPressed = false;
                sumDisplayed = false;
                disNumber(x);
            }
            // Start new number if operation selected
            else if (symPressed == true) {
                temp = $(id).attr("data-val");
                disNumber(temp);
                symPressed = false;
            }
            // Add to existing digits
            else {
                temp = $("#calNumbers").text() + $(id).attr("data-val");
                disNumber(temp);
            }
        }
        else {
            // Detect arithmetic operation
            if ($(id).attr("data-val") != "(" && $(id).attr("data-val") != ")") {
                // Overide previous operation
                if (butPressed && symPressed) {
                    var lengthx = x.length;
                    var barex = x.substring(0,lengthx-2);
                    x = barex + $(id).attr("data-val");
                }
                // tell checkOperation() selected operation
                butPressed = $(id).attr("id");
            }
            else {
                butPressed = false;
            }
            // Symbol has been pressed and the sum is not displayed
            symPressed = true;
            sumDisplayed = false;
        }
    }
    // Detect equal button click
    else if ($(id).attr("id") == "calEqual") {
        // Check if input is equatable
        try {
            //var equ = eval(x);
            //Better math parser - support exponents
            var equ = Parser.evaluate(x);
            disNumber(equ);
            x = equ;
            symPressed = true;
            fitScreen(0);
            sumDisplayed = true;
            butPressed = false;
        }
        // Give user chance to fix input error through prompt
        catch(err) {
            manualInput("error");
        }
    }
    // Extraneous buttons autmatically zero to prevent glitches :)
    else {
        clearDisplay()
    }
    autoScroll(); // FUTURE: Automatically scroll if input is longer than display
    checkOperation(); // Highlight selected operation
}

// Outputs num to display
function disNumber(num)
{
    $("#calNumbers").text(num);
}

// FUTURE: Automatically scroll if input is longer than display
function autoScroll() {

}

// Automatically shrink output if larger than display
function fitScreen(done) {
    var disWidth = $('#calNumbers').innerWidth();
    var texWidth = $('#calNumbers')[0].scrollWidth;
    // Check if output is larger than display
    if (texWidth > disWidth) {
        var sumLength = toString(x).length;
        if (toString(x).indexOf(".") != -1) {
            sumLength = sumLength - 1;
        }
        var displayedNumber = parseFloat(x).toPrecision(sumLength-done);
        disNumber(displayedNumber);
        fitScreen(done+1);
    }
}

// Highlight selected operation
function checkOperation() {
    $(".calButton").removeClass("inuse");
    if (butPressed) {
        pressedId = "#" + butPressed
        $(pressedId).addClass("inuse");
    }
}

// Clears display
function clearDisplay() {
    x = "";
    disNumber(0);
    symPressed = true;
    butPressed = false;
    $(".calButton").removeClass("inuse");
}

// Error handler with multiple commands
// ERROR - display error prompt
// ENTER - evaluate manual input
// HIDE - end manual input process and clear display
function manualInput(command) {
    $('#error').addClass('hidden');
    $('#disable').addClass('hidden');
    if (command == "error") {
        $('#disable').removeClass('hidden');
        $('#error').removeClass('hidden');
        setTimeout(function(){$('#disable').addClass('fadein')}, 1);
        setTimeout(function(){$('#error').addClass('fadein')}, 1);
        $("#inputField").val(x);
        $("#inputField").select();
    }
    if (command == "enter") {
        x = $("#inputField").val();
        butClick($("#calEqual"));
    }
    if (command == "hide") {
        clearDisplay();
    }
}