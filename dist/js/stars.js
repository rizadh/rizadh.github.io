"use strict";function changeNumberOfStars(){var a="There are currently "+stars+" stars. Enter a new number of stars below:";spawnStars(prompt(a))}function spawnStars(a){stars=a||stars,$(".star").remove();for(var t=stars;t>0;t--)spawnStar()}function spawnStar(){var a=$("<div></div>"),t=Math.random()*Math.max(Math.min(stars,1e3),200)*10,o=1500+500*Math.random(),r=Math.ceil(4*Math.random()),n=100*Math.random()+"%",s=100*Math.random()+"%",e=Math.random()>.5?200:360,d=10*Math.random(),c=360===e?e-d:e+d,h=80+20*Math.random(),i=60+30*Math.random(),l="hsla("+c+", "+h+"%, "+i+"%, 1)",m="hsla("+c+", 100%, 50%, 1)";$.Velocity.hook(a,"scale",0),$.Velocity.hook(a,"opacity",0),a.addClass("star").css({width:r,height:r,fontSize:r,left:n,top:s,backgroundColor:l,boxShadowColor:m}).velocity({scale:1,opacity:1},{delay:t,duration:o}).velocity({scale:0,opacity:0},{duration:o,loop:!0,progress:function(a,t,o){Math.random()>0;1===t&&0===o&&($(a).data("scalingDown",!$(a).data("scalingDown")),$(a).data("scalingDown")&&$(a).css({left:100*Math.random()+"%",top:100*Math.random()+"%"}))}}).appendTo("body")}var STAR_DENSITY=5e-4,stars;$(function(){FastClick.attach(document.body),stars=Math.round($(window).height()*$(window).width()*STAR_DENSITY),spawnStars(),$(document).click(changeNumberOfStars)});