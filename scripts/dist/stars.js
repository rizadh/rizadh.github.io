function changeNumberOfStars(){var a="There are currently "+stars+" stars. Enter a new number of stars below:";spawnStars(prompt(a))}function spawnStars(a){stars=a||stars,$(".star").remove();for(var b=stars;b>0;b--)spawnStar()}function spawnStar(){var a=$("<div></div>"),b=Math.random()*Math.max(Math.min(stars,1e3),200)*10,c=1500+500*Math.random(),d=Math.ceil(4*Math.random()),e=100*Math.random()+"%",f=100*Math.random()+"%",g=Math.random()>.5?200:360,h=10*Math.random(),i=360===g?g-h:g+h,j=80+20*Math.random(),k=60+30*Math.random(),l="hsla("+i+", "+j+"%, "+k+"%, 1)",m="hsla("+i+", 100%, 50%, 1)";$.Velocity.hook(a,"scale",0),$.Velocity.hook(a,"opacity",0),a.addClass("star").css({width:d,height:d,fontSize:d,left:e,top:f,backgroundColor:l,boxShadowColor:m}).velocity({scale:1,opacity:1},{delay:b,duration:c}).velocity({scale:0,opacity:0},{duration:c,loop:!0,progress:function(a,b,c){Math.random()>0,1===b&&0===c&&($(a).data("scalingDown",!$(a).data("scalingDown")),$(a).data("scalingDown")&&$(a).css({left:100*Math.random()+"%",top:100*Math.random()+"%"}))}}).appendTo("body")}var STAR_DENSITY=5e-4,stars;$(function(){FastClick.attach(document.body),stars=Math.round($(window).height()*$(window).width()*STAR_DENSITY),spawnStars(),$(document).click(changeNumberOfStars)});