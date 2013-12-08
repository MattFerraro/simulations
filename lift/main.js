
function main_init() {
	canvas = document.getElementById("myCanvas");
	// math = mathjs();	
	context = canvas.getContext("2d");
	
	// This only needs to happen once
	orientGrid();

	// This gets called regularly
	renderEverything();
}

// Translates, scales, and flips the grid so that we have
// a much more reasonable canvas to work with, one that 
// has x range (-1, 1) and y range (-1, 1), and is oriented
// rightside up instead of upside down
function orientGrid() {
	// Translate to the middle of the canvas
	// Our 600x600 grid used to have corner coordinates:
	//
	//      (0, 0)         (600, 0)
	//
	// 		(0, 600)       (600, 600)
	//
	// But after this translation, it has the coordinates:
	//
	//      (-300, -300)   (300, -300)
	//
	// 		(-300, 300)    (300, 300)
	//
	context.translate(canvas.width / 2, canvas.height / 2);

	// Flip the context vertically, and scale.
	// The scale 300 means zoom in by a factor of 300.
	// The new coordinates are:
	//
	//      (-1, 1)        (1, 1)
	//
	// 		(-1, -1)       (1, -1)
	//
	pixel_scale = 300;
	context.scale(pixel_scale, -pixel_scale);
	
	// Set color to a pleasant blue
	context.lineWidth = 1/pixel_scale;
}

// Clears the canvas with a white rectangle, then
// draws the grid in a pleasant light blue
function renderGrid() {
	// Clears the background to white
	context.fillStyle="#FFFFFF";
	context.fillRect(-1, -1, 2, 2);

	// Draws the pleasant light blue grid lines
	context.strokeStyle = '#A3A3FF';
	context.beginPath();
	for (var a = -1; a < 1; a += .1) {
		context.moveTo(a, -1);
		context.lineTo(a, 1);
	}
	for (var a = -1; a < 1; a += .1) {
		context.moveTo(-1, a);
		context.lineTo(1, a);
	}
	context.stroke();
	vector_scale = .1;
}

function renderField() {
	var input_0 = document.getElementById("eq_0");
	var input_1 = document.getElementById("eq_1");
	context.strokeStyle = '#AA0000';
	context.beginPath();
	for (var x = -1; x < 1; x += .1) {
		for (var y = -1; y < 1; y += .1) {
			// It may prove a poor decision to simply eval() as code
			// whatever the user entered in a text box.
			// OH WELL I'M SURE IT WILL BE FINE.
			var i_val = eval(input_0.value);
			var j_val = eval(input_1.value);
			var x_f = i_val * vector_scale + x;
			var y_f = j_val * vector_scale + y;

			context.moveTo(x, y);
			context.lineTo(x_f, y_f);

			var headlen = .02;   // length of head
		    var angle = Math.atan2(y_f - y, x_f - x);

		    if (Math.abs(x_f - x) < .00000001) {
		    	if (Math.abs(y_f - y) < .00000001) {
		    		continue;
		    	}
		    }

		    var arrow_x_0 = x_f - headlen * Math.cos(angle - Math.PI/6);
		    var arrow_y_0 = y_f - headlen * Math.sin(angle - Math.PI/6);
		    context.lineTo(arrow_x_0, arrow_y_0);

		    context.moveTo(x_f, y_f);
		    var arrow_x_1 = x_f - headlen * Math.cos(angle + Math.PI/6);
		    var arrow_y_1 = y_f - headlen * Math.sin(angle + Math.PI/6);
		    context.lineTo(arrow_x_1, arrow_y_1);
		}
	}
	context.stroke();
}

function renderEverything() {
	renderGrid();
	renderField();
}

function keypressed() {
	if (window.event.keyCode == 13) {
		renderEverything();
	}
}