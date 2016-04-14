var Events=function(){var t={};return{subscribe:function(e,i){e in t||(t[e]=[]);var n=t[e].push(i)-1;return{remove:function(){delete t[e][n]}}},publish:function(e,i){e in t&&t[e].forEach(function(t){t(i||{})})}}}(),Ripple=function(){"use strict";function t(t,e,i){o=t,s=e,l=i,$(document).on("click.Ripple",function(t){var e=$('<div class="ripple"></div>');$.Velocity.hook(e,"translateX","-50%"),$.Velocity.hook(e,"translateY","-50%"),$.Velocity.hook(e,"scale","0"),e.css({position:"absolute",top:t.pageY,left:t.pageX,width:o,height:o,zIndex:99,opacity:.75,background:s,borderRadius:"100%",pointerEvents:"none"}).velocity({scale:1,opacity:0},{duration:l,easing:"easeOutExpo",complete:function(){$(this).remove()}}).appendTo("body")})}function e(){$(document).off("click.Ripple")}function i(t){o=t}function n(t){s=t}function a(t){l=t}var o,s,l;return{enable:t,disable:e,changeSize:i,changeColor:n,changeDuration:a}}();$(function(){if("ontouchstart"in document.documentElement)for(var t=document.styleSheets.length-1;t>=0;t--){var e=document.styleSheets[t];if(e.cssRules)for(var i=e.cssRules.length-1;i>=0;i--){var n=e.cssRules[i];n.selectorText&&(n.selectorText=n.selectorText.replace(":hover",":active"))}}});var App=function(){"use strict";function t(){Ripple.enable("1.5em","white",750),FastClick.attach(document.body);var t=$(window),e=$(document);window.navigator.standalone&&e.on("touchmove",!1),(a("-webkit-backdrop-filter")||a("-moz-backdrop-filter")||a("-o-backdrop-filter")||a("-ms-backdrop-filter")||a("backdrop-filter"))&&$("body").addClass("backdrop-filter"),e.on("keydown",function(t){var e=t.keyCode;if(NotificationBanner.isShown){if(NotificationBanner.isEmpty){switch(e){case 13:NotificationBanner.clickButton("emphasize");break;case 27:NotificationBanner.clickButton("alert")}return!1}if(NotificationBanner.hide(),13===e)return!1}switch(e){case 8:if(t.preventDefault(),Display.inputMode){var i=("0"+DisplayText.time).slice(-7,-1);DisplayText.setTime(i)}break;case 13:Display.inputMode?App.startTimer():App.editTime();break;case 27:Display.inputMode||App.editTime();break;case 32:Display.inputMode?HelpMenu.toggle():App.togglePause();break;case 48:case 49:case 50:case 51:case 52:case 53:case 54:case 55:case 56:case 57:if(Display.inputMode){var n=String.fromCharCode(e);DisplayText.addDigit(n);break}}32!==e&&HelpMenu.toggle(!1)}),e.on("touchstart",function(){localStorage.setItem("touch-device","true")}),t.on("load resize orientationChange",function(){globals.windowWidth=t.width(),globals.windowHeight=t.height();var e=Math.min(1.5*globals.windowWidth,globals.windowHeight);$.Velocity.hook($("html"),"fontSize",e/9+"px")}),e.click(function(t){$(t.target).hasClass("button")||HelpMenu.toggle(!1);var e=localStorage.getItem("touch-device"),i=localStorage.getItem("mouse-suggested"),n=sessionStorage.getItem("mouse-suggested"),a="temp"===i,o=a&&!n;e||i&&!o||(localStorage.setItem("mouse-suggested","true"),sessionStorage.setItem("mouse-suggested","true"),NotificationBanner.show("Seems like you have a keyboard. Want to learn a few shortcuts?",[{text:"Never",style:"alert",clickFunction:function(){}},{text:"Not right now",style:"normal",clickFunction:function(){localStorage.setItem("mouse-suggested","temp")}},{text:"Yes, show me",style:"emphasize",clickFunction:function(){HelpMenu.toggle(!0)}}]))})}function e(t,e){var i=DisplayText.time,n=3600*i.slice(-6,-4),a=60*i.slice(-4,-2),o=1*i.slice(-2),s=n+a+o;0!==s||t||e?36e4>s||e||t?(DialRing.wind(s,t||e),Display.inputMode=!1,t||Events.publish("start")):(NotificationBanner.show("The time entered was too high. Enter a time less than 100 hours"),DisplayText.setTime("")):NotificationBanner.show("Please enter a time first")}function i(){localStorage.setItem("timeStarted",0),localStorage.setItem("durationSet",0),Events.publish("edit")}function n(){Display.inputMode?App.startTimer():Display.paused?(App.startTimer(!0),Display.paused=!1,Events.publish("resume")):Display.running?(DisplayText.setTime("Paused","crossfade"),Display.paused=!0,Events.publish("pause")):App.editTime()}function a(t){return t in document.body.style}return Events.subscribe("startup",function(){var t=window.location.search,i=new RegExp("&amp;time=([^&amp;]*)","i");t=(t=t.replace(/^\?/,"&amp;").match(i))?t[1]:"",DisplayText.validateTime(t)?(DisplayText.setTime(("000000"+t).slice(-6)),e()):Events.publish("startup.normal")}),{init:t,startTimer:e,editTime:i,togglePause:n}}(),DialRing=function(){"use strict";function t(){l=$("#dial-ring"),c=$("#dial-ring path")}function e(){l.velocity("stop").velocity({opacity:[1,0],scale:[1,0]},{easing:globals.EASE_OUT,duration:globals.ANIMATION_DURATION,display:"block"})}function i(){l.velocity("stop").velocity("fadeOut",100)}function n(){l.velocity("stop").velocity({opacity:1},{easing:globals.EASE_OUT,duration:globals.ANIMATION_DURATION})}function a(){$("#dial-ring").velocity("stop").velocity({opacity:.25},{easing:globals.EASE_OUT,duration:globals.ANIMATION_DURATION})}function o(t,e){var i=e?c.data("timeLeft"):1e3*t,n=e?c.data("progress"):0;c.velocity("stop").velocity({tween:[r,n]},{duration:i,easing:"linear",begin:function(){localStorage.setItem("timeStarted",(new Date).getTime()),localStorage.setItem("durationSet",i)},progress:function(t,e,i,n,a){var o=50,s=40,l=o-s,r=a>=.5?1:0,u=l+s*(1+Math.sin(2*Math.PI*a)),d=l+s*(1-Math.cos(2*Math.PI*a)),p=u+" "+d,g=s+" "+s,f=" 0 "+r+" 1 ",b="M"+o+" "+o,h="m0 "+-s,v="A"+g+f+p;c.attr("d",b+h+v).data("progress",a).data("timeLeft",i);var m=Math.ceil(i/1e3),y=Math.floor(m/60)%60,T=Math.floor(m/3600),A=m%60;A=("0"+A).slice(-2),y=("0"+y).slice(-2),T=("0"+T).slice(-2);var I=[T,y,A];0!==i&&DisplayText.setTime(I.join(""),"crossfade")},complete:function(){Events.publish("done"),localStorage.setItem("timeStarted",0),localStorage.setItem("durationSet",0)}})}function s(){c.velocity("stop")}var l,c,r=.99999;return Events.subscribe("start",e),Events.subscribe("edit",s),Events.subscribe("edit",i),Events.subscribe("pause",s),Events.subscribe("pause",a),Events.subscribe("resume",n),{init:t,wind:o}}(),Display=function(){"use strict";function t(){a=$("#display"),a.data("inputMode",!0)}function e(){a.velocity("stop").velocity({height:"90%",translateY:0},{duration:globals.ANIMATION_DURATION,easing:globals.EASE_OUT})}function i(){a.data("inputMode",!0).data("paused",!1).removeClass("running").velocity("stop").velocity({height:"20%"},{duration:globals.ANIMATION_DURATION,easing:globals.EASE_OUT})}function n(){a.removeClass("running")}var a;return Events.subscribe("startup.given",function(){$.Velocity.hook(a,"translateY","-100%")}),Events.subscribe("startup.normal",function(){$.Velocity.hook(a,"height","100%"),a.velocity({height:"20%"},{easing:globals.EASE_OUT,duration:globals.ANIMATION_DURATION,complete:function(){function t(){return e+i-(new Date).getTime()}var e=parseInt(localStorage.getItem("timeStarted")),i=parseInt(localStorage.getItem("durationSet"));if(e&&i){var n=5;if(t()>1e3*n){var a="Seems like the timer was still running when you last closed this app. Do you want to restore the timer?",o={text:"No",style:"alert",clickFunction:function(){localStorage.setItem("timeStarted","0"),localStorage.setItem("durationSet","0")}},s={text:"Sure",style:"emphasize",clickFunction:function(){var e=1-t()/i;t()>0?($("#dial-ring path").data("timeLeft",t()).data("progress",e),App.startTimer(!1,!0)):NotificationBanner.show("Too late, the timer has already ended")}};NotificationBanner.show(a,[o,s])}}}})}),Events.subscribe("start",e),Events.subscribe("edit",i),Events.subscribe("done",n),{init:t,get inputMode(){return a.data("inputMode")},set inputMode(t){t?a.data("inputMode",!0).data("paused",!1).removeClass("running"):a.data("inputMode",!1).addClass("running")},get paused(){return a.data("paused")},set paused(t){a.data("paused",t)},get running(){return a.hasClass("running")},done:n}}(),DisplayText=function(){"use strict";function t(){a=$("#display-text"),a.data("currentTime","000000"),$.Velocity.hook(a,"translateX","-50%"),$.Velocity.hook(a,"translateY","-50%"),a.click(App.togglePause)}function e(t){var e=3600*t.slice(-6,-4),i=60*t.slice(-4,-2),n=1*t.slice(-2),a=e+i+n;return a>0&&36e4>a}function i(t,e){var i=!1,n="",o="1rem",s="",l=$("#display-text").clone(!0).attr("id","display-text-old");switch(t){case"000000":case"":t="0s";case"Done":s="000000";case"Paused":n=t,i=!0;break;default:if(a.data("currentTime")!==t||"Paused"===a.text()){for(var c=[],r=["h","m","s"],u=0;3>u;u++){var d=t.slice(2*u,2*u+2);(d>0||c[0]||2===u)&&(10>d&&!c[0]&&(d=d.slice(-1)),c.push(d+r[u]))}var p=c.join(" ");if(.9*globals.windowHeight>globals.windowWidth&&p.length>8){if(globals.windowHeight<1.5*globals.windowWidth){var g=1/.9,f=1.5,b=globals.windowHeight/globals.windowWidth,h=(f-b)/(f-g);o=8/p.length*(1-h)+h}else o=8/p.length;o+="rem"}s=t,n=p,i=!0}}if(i){if($("#display-text-old").remove(),"crossfade"===e){var v=$("#display-text").text(),m=n,y="",T="";if(v.length===m.length)for(var A=0;A<v.length;A++)v[A]===m[A]?(y+=v[A],T+=m[A]):(y+="<span>"+v[A]+"</span>",T+="<span>"+m[A]+"</span>");else y="<span>"+v+"</span>",T="<span>"+m+"</span>";var I=/<\/span><span>/gi;l.html(y.replace(I,"").replace(" ","&nbsp;")).children("span").velocity({opacity:[0,1],scale:0},{easing:globals.EASE_OUT,duration:Math.min(globals.ANIMATION_DURATION,1e3),queue:!1,display:"inline-block",complete:function(){$(this).parent().remove()}}).end().prependTo(a.parent()),a.html(T.replace(I,"").replace(" ","&nbsp;")).css({fontFamily:"robotoregular"}).children("span").css("opacity",0).velocity({opacity:1,scale:[1,0]},{easing:globals.EASE_OUT,duration:Math.min(globals.ANIMATION_DURATION,1e3),queue:!1,display:"inline-block",complete:function(){$(this).contents().unwrap()}})}else a.css({fontFamily:"robotoregular"}).html(n);a.data("currentTime",s).add(l).velocity({fontSize:o},{easing:globals.EASE_OUT,duration:globals.ANIMATION_DURATION,queue:!1})}}function n(t){i((a.data("currentTime")+t).slice(-6))}var a;return Events.subscribe("startup.normal",function(){$.Velocity.hook(a,"opacity",0),a.velocity({opacity:1},{easing:globals.EASE_OUT,duration:globals.ANIMATION_DURATION})}),Events.subscribe("edit",function(){i(a.data("currentTime"),"crossfade")}),Events.subscribe("done",function(){i("Done","crossfade")}),{init:t,addDigit:n,setTime:i,validateTime:e,get time(){return a.data("currentTime")}}}(),EditButton=function(){"use strict";function t(){n=$("#edit-button"),n.click(App.editTime)}function e(){n.velocity("stop").velocity({translateY:[0,"100%"],opacity:[1,0]},{easing:globals.EASE_OUT,duration:globals.ANIMATION_DURATION,display:"block"})}function i(){n.velocity("stop").velocity({opacity:0,translateY:"-700%"},{easing:globals.EASE_OUT,display:"none",duration:globals.ANIMATION_DURATION,complete:function(){$.Velocity.hook($(this),"translateY","0")}})}var n;return Events.subscribe("start",e),Events.subscribe("edit",i),{init:t}}(),HelpMenu=function(){"use strict";function t(){i=$("#keyboard-help"),$.Velocity.hook(i,"translateX","-50%"),$.Velocity.hook(i,"translateY","-50%"),navigator.platform.match(/(Mac|iPhone|iPod|iPad)/i)&&i.find(".delete").text("Delete")}function e(t){if(0===arguments.length){var n=!i.data("shown");i.data("shown",n).velocity("stop").velocity({scaleY:n?[1,0]:[0,1],scaleX:n?[1,.5]:[0,1],opacity:n?[1,0]:[0,1]},{easing:n?globals.EASE_OUT:globals.EASE_IN,display:n?"block":"none",duration:n?globals.ANIMATION_DURATION:globals.ANIMATION_DURATION/2})}else(i.data("shown")||!1)!==t&&e()}var i;return{init:t,toggle:e}}(),Keypad=function(){"use strict";function t(){n=$("#keypad"),$.Velocity.hook(n,"translateX","-50%"),$.Velocity.hook(n,"translateY","20%"),$.Velocity.hook(n,"opacity",0),n.on("click","td",function(){var t=$(this).text();"Clear"===t?DisplayText.setTime(""):"Start"===t?App.startTimer():DisplayText.addDigit(t)})}function e(){n.velocity("stop").velocity({translateY:"20%",opacity:0},{easing:globals.EASE_OUT,duration:globals.ANIMATION_DURATION,display:"none"})}function i(){n.velocity("stop").velocity({translateY:0,opacity:1},{easing:globals.EASE_OUT,duration:globals.ANIMATION_DURATION,display:"table"})}var n;return Events.subscribe("startup.normal",i),Events.subscribe("start",e),Events.subscribe("edit",i),{init:t}}(),globals={EASE_OUT:"easeOutExpo",EASE_IN:"easeInExpo",ANIMATION_DURATION:300,windowWidth:null,windowHeight:null,startupType:null,startupTime:null};$(function(){"use strict";App.init(),Display.init(),Keypad.init(),DisplayText.init(),NotificationBanner.init(),HelpMenu.init(),EditButton.init(),DialRing.init(),Events.publish("startup")});var NotificationBanner=function(){"use strict";function t(){a=$("#notification-banner"),o=a.find("span"),a.on("click",".button",i)}function e(t,e){o.text(t);var i=o.siblings("div").empty();if(e){$("#content").css("pointer-events","none");for(var n=e.length-1;n>=0;n--){var l=e[n];$("<div></div>").text(l.text).addClass(l.style+" button").click(l.clickFunction).prependTo(i)}}else clearTimeout(s),s=setTimeout(NotificationBanner.hide,5e3);a.velocity("stop").velocity({translateY:a.data("shown")?0:[0,"-100%"]},{easing:globals.EASE_OUT,display:"block",duration:globals.ANIMATION_DURATION,complete:function(){e?$("#content").on("click.bannerhide",NotificationBanner.hide):$(document).on("click.bannerhide",NotificationBanner.hide)}}).data("shown",!0)}function i(){$(document).off("click.bannerhide",NotificationBanner.hide),$("#content").off("click.bannerhide",NotificationBanner.hide).css("pointer-events",""),a.data("shown")&&a.data("shown",!1).velocity("stop").velocity({translateY:"-100%"},{easing:globals.EASE_IN,display:"none",duration:globals.ANIMATION_DURATION/2})}function n(t){a.find("."+t).click()}var a,o,s;return{init:t,show:e,hide:i,clickButton:n,get isShown(){return a.data("shown")},get isEmpty(){return""!==a.find("div").text()}}}();