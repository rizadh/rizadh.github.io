// Setup onClick actions
$(document).ready(setUp);

//Reset grid on resize
$(window).resize(function () {
			setGrid();
		});

function setUp() {
	// Solve on click
	$("#solveButton").attr("onTouchStart","press(this);");
	$("#solveButton").attr("onMouseDown","press(this);");
	$("#solveButton").attr("onTouchEnd","unPress(this);");
	$("#solveButton").attr("onMouseUp","unPress(this);");
	$("#solveButton").attr("onMouseLeave","unPress(this);");
	$("#solveButton").attr("onClick","solve();");
	
	// Clear on click
	$("#clearButton").attr("onTouchStart","press(this);");
	$("#clearButton").attr("onMouseDown","press(this);");
	$("#clearButton").attr("onTouchEnd","unPress(this);");
	$("#clearButton").attr("onMouseUp","unPress(this);");
	$("#clearButton").attr("onMouseLeave","unPress(this);");
	$("#clearButton").attr("onClick","clearApp();");
	
	// Set layout
	setGrid();
}

// Makes button appear depressed
function press(id) {
	$(id).addClass('active');
}

// Makes button revert to regular state
function unPress(id) {
	$(id).removeClass('active');
}
		
function setGrid() {
	appWidth = window.innerWidth;
	appHeight = window.innerHeight;
	
	// Set positions
	x1 = 0;
	x2 = appWidth / 2;
	x2_5 = appWidth * (3/4);
	y1 = 0;
	y2 = Math.round(appHeight/8);
	y3 = 2*y2;
	y4 = 3*y2;
	y5 = 4*y2;
	y6 = 5*y2;
	y7 = 6*y2;
	y8 = 7*y2;
	$("#A_label").css("top",y1);
	$("#A_field").css("top",y1);
	$("#B_label").css("top",y2);
	$("#B_field").css("top",y2);
	$("#C_label").css("top",y3);
	$("#C_field").css("top",y3);
	$("#a_label").css("top",y4);
	$("#a_field").css("top",y4);
	$("#b_label").css("top",y5);
	$("#b_field").css("top",y5);
	$("#c_label").css("top",y6);
	$("#c_field").css("top",y6);
	$("#x_label").css("top",y7);
	$("#x_field").css("top",y7);
	$("#solveButton").css("top",y8);
	$("#clearButton").css("top",y8);
	$("#status").css("top",y8);
	$(".inputLabel").css("left",x1);
	$(".inputField").css("left",x2);
	$("#status").css("left",x1);
	$("#solveButton").css("left",x2);
	$("#clearButton").css("left",x2_5);
	
	// Set sizes
	gridWidth = appWidth / 2;
	gridHeight = y2;
	lastHeight = appHeight - y8;
	$(".inputLabel").css("width",gridWidth);
	$(".inputField").css("width",gridWidth);
	$("#solveButton").css("width",gridWidth/2);
	$("#clearButton").css("width",gridWidth/2);
	$("#status").css("width",gridWidth);
	$(".inputLabel").css("height",gridHeight);
	$(".inputField").css("height",gridHeight);
	$("#solveButton").css("height",lastHeight);
	$("#clearButton").css("height",lastHeight);
	$("#status").css("height",lastHeight);
	
	//Set alignments and size of fonts
	$("*").css("line-height",gridHeight + "px");
	fontSize = gridHeight / 3;
	$(".inputLabel").css("font-size",fontSize);
	$(".inputField").css("font-size",fontSize);
	$("#solveButton").css("font-size",fontSize);
	$("#clearButton").css("font-size",fontSize);
	if (fontSize < appWidth/40) {
		$("#status").css("font-size",fontSize);
	}
	else {
		$("#status").css("font-size",appWidth/40);
	}
	
}
function solve() {
	// Get values
	var A = $("#A_field").val();
	var B = $("#B_field").val();
	var C = $("#C_field").val();
	var a = $("#a_field").val();
	var b = $("#b_field").val();
	var c = $("#c_field").val();
	// Check for non-number values
	var A = check(A);
	var B = check(B);
	var C = check(C);
	var a = check(a);
	var b = check(b);
	var c = check(c);
	// Zero any non-number values
	$("#A_field").val(A);
	$("#B_field").val(B);
	$("#C_field").val(C);
	$("#a_field").val(a);
	$("#b_field").val(b);
	$("#c_field").val(c);
	var answers = checkLaw(A,B,C,a,b,c);
	//alert("A:" + answers[0] + "\nB:" + answers[1] + "\nC:" + answers[2] + "\na:" + answers[3] + "\nb:" + answers[4] + "\nc:" + answers[5]);
	if (answers) {
		r = Math.pow(10,$("#x_field").val());
		A = Math.round(answers[0]*r) / r;
		B = Math.round(answers[1]*r) / r;
		C = Math.round(answers[2]*r) / r;
		a = Math.round(answers[3]*r) / r;
		b = Math.round(answers[4]*r) / r;
		c = Math.round(answers[5]*r) / r;
		if (A && B && C && a && b && c) {
			$("#A_field").val(A);
			$("#B_field").val(B);
			$("#C_field").val(C);
			$("#a_field").val(a);
			$("#b_field").val(b);
			$("#c_field").val(c);
			alertStat("SOLVED");
		}
		else {
			alertStat("Unsolvable triangle");
		}
	}
}

// e is number to be checked
function check(e) {
	// Return null if e is not a numeber
	if (!parseFloat(e)) {
		return null;
	}
	// Return number if e is a number
	else {
		return parseFloat(e);
	}
}

function checkLaw(A,B,C,a,b,c) {
	var sides = (a != null) + (b != null) + (c != null);
	var angles = (A != null) + (B != null) + (C != null);
	//alert(sides + " side(s) and " + angles + " angle(s)");
	A = A*(Math.PI/180);
	B = B*(Math.PI/180);
	C = C*(Math.PI/180);
	if (angles + sides < 3 || angles + sides > 3) {
		alertStat("Enter at least three values!");
		return null;
	}
	else if (sides == 0) {
		alertStat("Enter at least one side!");
		return null;
	}
	else if (A + B + C > Math.PI) {
		alertStat("Impossible triangle");
		return null;
	}
	else if (sides == 3) {
		if ((a + b < c) || (b + c < a) || (c + a < b)) {
			alertStat("Impossible triangle");
			return null;
		}
		else {
			A = (c*c+b*b-a*a)/(2*b*c);
			A = Math.acos(A);
			B = (c*c+a*a-b*b)/(2*a*c);
			B = Math.acos(B);
			C = (a*a+b*b-c*c)/(2*b*a);
			C = Math.acos(C);
		}
	}
	else if (sides == 2) {
		if (a && b) {
			if (A) {
				B = b*(Math.sin(A)/a);
				B = Math.asin(B);
				C = Math.PI - A - B;
				c = Math.sqrt(a*a+b*b-2*a*b*Math.cos(C));
			}
			else if (B) {
				A = a*(Math.sin(B)/b);
				A = Math.asin(A);
				C = Math.PI - A - B;
				c = Math.sqrt(a*a+b*b-2*a*b*Math.cos(C));
			}
			else if (C) {
				c = Math.sqrt(a*a+b*b-2*a*b*Math.cos(C));
				A = (c*c+b*b-a*a)/(2*b*c);
				A = Math.acos(A);
				B = (c*c+a*a-b*b)/(2*a*c);
				B = Math.acos(B);
				C = (a*a+b*b-c*c)/(2*b*a);
				C = Math.acos(C);
			}
		}
		else if (b && c) {
			if (B) {
				C = c*(Math.sin(B)/b);
				C = Math.asin(C);
				A = Math.PI - B - C;
				a = Math.sqrt(c*c+b*b-2*c*b*Math.cos(A));
			}
			else if (C) {
				B = b*(Math.sin(C)/c);
				B = Math.asin(B);
				A = Math.PI - B - C;
				a = Math.sqrt(c*c+b*b-2*c*b*Math.cos(A));
			}
			else if (A) {
				a = Math.sqrt(c*c+b*b-2*c*b*Math.cos(A));
				A = (c*c+b*b-a*a)/(2*b*c);
				A = Math.acos(A);
				B = (c*c+a*a-b*b)/(2*a*c);
				B = Math.acos(B);
				C = (a*a+b*b-c*c)/(2*b*a);
				C = Math.acos(C);
			}
		}
		else if (a && c) {
			if (A) {
				C = c*(Math.sin(A)/a);
				C = Math.asin(C);
				B = Math.PI - A - A;
				b = Math.sqrt(c*c+a*a-2*a*c*Math.cos(B));
			}
			else if (C) {
				A = a*(Math.sin(C)/c);
				A = Math.asin(A);
				B = Math.PI - A - C;
				b = Math.sqrt(c*c+a*a-2*a*c*Math.cos(B));
			}
			else if (B) {
				b = Math.sqrt(c*c+a*a-2*a*c*Math.cos(B));
				A = (c*c+b*b-a*a)/(2*b*c);
				A = Math.acos(A);
				B = (c*c+a*a-b*b)/(2*a*c);
				B = Math.acos(B);
				C = (a*a+b*b-c*c)/(2*b*a);
				C = Math.acos(C);
			}
		}
	}
	else if (sides == 1) {
		if (A && B) {
			C = Math.PI - A - B;
		}
		else if (B && C) {
			A = Math.PI - B - C ;
		}
		else if (A && C) {
			B = Math.PI - A - C;
		}
		if (a) {
			b = (Math.sin(B)*a)/(Math.sin(A));
			c = (Math.sin(C)*a)/(Math.sin(A));
		}
		else if (b) {
			a = (Math.sin(A)*b)/(Math.sin(B));
			c = (Math.sin(C)*b)/(Math.sin(B));
		}
		else if (c) {
			b = (Math.sin(B)*c)/(Math.sin(C));
			a = (Math.sin(A)*c)/(Math.sin(C));
		}
	}
	else {
		alertStat("Unsolvable");
		return null;
	}
	var ans = [A*(180/Math.PI),B*(180/Math.PI),C*(180/Math.PI),a,b,c];
	return ans;
}

function alertStat(m) {
	$("#msg").html(m);
}

function clearApp() {
		$("#A_field").val(null);
		$("#B_field").val(null);
		$("#C_field").val(null);
		$("#a_field").val(null);
		$("#b_field").val(null);
		$("#c_field").val(null);
		alertStat("CLEARED");
}
