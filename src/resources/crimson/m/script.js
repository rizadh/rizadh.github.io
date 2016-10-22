function menuToggle()
{
alert("This da big menu");
}

function menuToggle2()
{
var men = document.getElementById("menu").className;
if (men != "gone")
{
document.getElementById("menu").className = "hide";
setTimeout(function() {document.getElementById("menu").className = "gone";}, 250);
document.getElementById("link3").className = "link";
}
else
{
document.getElementById("menu").className = "here";
setTimeout(function() {document.getElementById("menu").className = "show";}, 1);
document.getElementById("link3").className = "link clicked";
}
}

function touchOn(el)
{
if (document.getElementById("link3").className == "link clicked")
{
el.className = "link touch clicked";
}
else if(document.getElementById("link3").className == "link pushed")
{
el.className = "link touch pushed";
}
else
{
el.className = "link touch";
}
}

function touchOn2(el)
{
el.style.color = "rgb(255,255,255)";
}

function touchOff(el)
{
if (document.getElementById("link3").className == "link touch clicked")
{
el.className = "link clicked";
}
else
{
el.className = "link";
}
}

function touchOff2(el)
{
el.style.color = "rgb(200,200,200)";
}

function start_maze()
{
var board = document.createElement("div");
board.id = "maze_board";
document.getElementById("content").appendChild(board);
document.getElementById("content_in").style.display = "none";
document.getElementById("link2").className = "link push";
paged = true;
makeBox();
}

function goBack()
{
if (paged)
{
close_maze();
paged = false;
}
else
{
history.back();
}
}

function close_maze()
{
var maze = document.getElementById("maze_board");
maze.parentNode.removeChild(maze);
document.getElementById("content_in").style.display = "block";
document.getElementById("link2").className = "link";
}

function makeBox()
{
var x=0;
var y=0;
var z=1;
while (z<=400 && y<20)
{
if (x<19)
{
var box = document.createElement("div");
box.id = z;
document.getElementById("maze_board").appendChild(box);
box.style.position = "absolute";
document.getElementById(z).style.top = y*16+"px";
document.getElementById(z).style.left = x*16+"px";
document.getElementById(z).className = "square";
x = x+1;
}

else if (x==19)
{
var box = document.createElement("div");
box.id = z;
document.getElementById("maze_board").appendChild(box);
document.getElementById(z).style.position = "absolute";
document.getElementById(z).style.top = y*16+"px";
document.getElementById(z).style.left = x*16+"px";
document.getElementById(z).className = "square";
x = 0;
y = y+1;
}
z=z+1;
}
setBoard();
}

function setBoard()
{
document.getElementById("400").style.background = "#072";
var player = document.createElement("div");
player.id = "player";
document.getElementById("maze_board").appendChild(player);
document.getElementById("player").style.position = "absolute";
document.getElementById("player").style.top = "0px";
document.getElementById("player").style.left = "0px";
setMaze(1);
}

function setMaze(o)
{
if (o==1)
{
document.getElementById("2").className = "square path";
document.getElementById("3").className = "square path";
document.getElementById("4").className = "square path";
document.getElementById("5").className = "square path";
document.getElementById("6").className = "square path";
document.getElementById("26").className = "square path";
document.getElementById("46").className = "square path";
document.getElementById("66").className = "square path";
document.getElementById("86").className = "square path";
document.getElementById("106").className = "square path";
document.getElementById("126").className = "square path";
document.getElementById("127").className = "square path";
document.getElementById("128").className = "square path";
document.getElementById("129").className = "square path";
document.getElementById("130").className = "square path";
document.getElementById("131").className = "square path";
document.getElementById("132").className = "square path";
document.getElementById("133").className = "square path";
document.getElementById("134").className = "square path";
document.getElementById("154").className = "square path";
document.getElementById("174").className = "square path";
document.getElementById("194").className = "square path";
document.getElementById("214").className = "square path";
document.getElementById("213").className = "square path";
document.getElementById("212").className = "square path";
document.getElementById("211").className = "square path";
document.getElementById("210").className = "square path";
document.getElementById("209").className = "square path";
document.getElementById("208").className = "square path";
document.getElementById("207").className = "square path";
document.getElementById("206").className = "square path";
document.getElementById("226").className = "square path";
document.getElementById("246").className = "square path";
document.getElementById("266").className = "square path";
document.getElementById("286").className = "square path";
document.getElementById("287").className = "square path";
document.getElementById("288").className = "square path";
document.getElementById("289").className = "square path";
document.getElementById("290").className = "square path";
document.getElementById("291").className = "square path";
document.getElementById("292").className = "square path";
document.getElementById("293").className = "square path";
document.getElementById("294").className = "square path";
document.getElementById("295").className = "square path";
document.getElementById("296").className = "square path";
document.getElementById("297").className = "square path";
document.getElementById("298").className = "square path";
document.getElementById("299").className = "square path";
document.getElementById("300").className = "square path";
document.getElementById("320").className = "square path";
document.getElementById("340").className = "square path";
document.getElementById("360").className = "square path";
document.getElementById("380").className = "square path";
}
var rand = checkDead(400) - 150;
while (rand>=0)
{
var r = Math.floor((Math.random()*400)+1);
if (document.getElementById(r).className != "square path" && r!=1 && r!=400)
{
document.getElementById(r).className = "square path";
rand = rand-1;
}
}
setControls();
}

function setControls()
{
var left = document.createElement("div");
left.id = "left_control";
left.className = "control";
left.innerHTML = "<img src='arrow.svg' class='control_arrow'>";
left.setAttribute("onTouchStart","conpress(this)");
left.setAttribute("onTouchEnd","condepress(this);movePlayer('left');");
document.getElementById("maze_board").appendChild(left);
var right = document.createElement("div");
right.id = "right_control";
right.className = "control";
right.innerHTML = "<img src='arrow.svg' class='control_arrow'>";
right.setAttribute("onTouchStart","conpress(this)");
right.setAttribute("onTouchEnd","condepress(this);movePlayer('right');");
document.getElementById("maze_board").appendChild(right);
var up = document.createElement("div");
up.id = "up_control";
up.className = "control";
up.innerHTML = "<img src='arrow.svg' class='control_arrow'>";
up.setAttribute("onTouchStart","conpress(this)");
up.setAttribute("onTouchEnd","condepress(this);movePlayer('up');");
document.getElementById("maze_board").appendChild(up);
var down = document.createElement("div");
down.id = "down_control";
down.className = "control";
down.innerHTML = "<img src='arrow.svg' class='control_arrow'>";
down.setAttribute("onTouchStart","conpress(this)");
down.setAttribute("onTouchEnd","condepress(this);movePlayer('down');");
document.getElementById("maze_board").appendChild(down);
}

function conpress(el)
{
el.className = "control pressed";
}

function condepress(el)
{
el.className = "control";
}

function checkDead(total)
{
var alive = 0;
var s = 1;
while (s<=total)
{
var check = document.getElementById(s).className;
if (check == "square path" || s == 1 || s == 40)
{
alive = alive+1;
}
s = s+1;
}
var dead = total - alive;
return dead;
}

function movePlayer(d)
{
if (d=="right")
{
var x = (parseFloat(document.getElementById("player").style.left)/16)+1;
var y = (parseFloat(document.getElementById("player").style.top)/16)+1;
var squarenumber = 20*(y-1)+x;
if ((document.getElementById(squarenumber+1).className == "square path" || squarenumber+1 == 400) && x<20)
{
document.getElementById("player").style.left = x*16+"px";
}
else if (document.getElementById(squarenumber+1).className == "square" || document.getElementById(squarenumber+1).className == "square flash")
{
document.getElementById(squarenumber+1).className = "square";
setTimeout(function(){document.getElementById(squarenumber+1).className = "square flash";},1);
}
}
else if (d=="left")
{
var x = (parseFloat(document.getElementById("player").style.left)/16)+1;
var y = (parseFloat(document.getElementById("player").style.top)/16)+1;
var squarenumber = 20*(y-1)+x;
if ((document.getElementById(squarenumber-1).className == "square path" || squarenumber-1 == 1) && x>1)
{
document.getElementById("player").style.left = (x-2)*16+"px";
}
else if (document.getElementById(squarenumber-1).className == "square" || document.getElementById(squarenumber-1).className == "square flash")
{
document.getElementById(squarenumber-1).className = "square";
setTimeout(function(){document.getElementById(squarenumber-1).className = "square flash";},1);
}
}
else if (d=="down")
{
var x = (parseFloat(document.getElementById("player").style.left)/16)+1;
var y = (parseFloat(document.getElementById("player").style.top)/16)+1;
var squarenumber = 20*(y-1)+x;
if ((document.getElementById(squarenumber+20).className == "square path" || squarenumber+20 == 400) && y<20)
{
document.getElementById("player").style.top = y*16+"px";
}
else if (document.getElementById(squarenumber+20).className == "square" || document.getElementById(squarenumber+20).className == "square flash")
{
document.getElementById(squarenumber+20).className = "square";
setTimeout(function(){document.getElementById(squarenumber+20).className = "square flash";},1);
}
}
else if (d=="up")
{
var x = (parseFloat(document.getElementById("player").style.left)/16)+1;
var y = (parseFloat(document.getElementById("player").style.top)/16)+1;
var squarenumber = 20*(y-1)+x;
if ((document.getElementById(squarenumber-20).className == "square path" || squarenumber-20 == 1) && y>1)
{
document.getElementById("player").style.top = (y-2)*16+"px";
}
else if (document.getElementById(squarenumber-20).className == "square" || document.getElementById(squarenumber-20).className == "square flash")
{
document.getElementById(squarenumber-20).className = "square";
setTimeout(function(){document.getElementById(squarenumber-20).className = "square flash";},1);
}
}

}
