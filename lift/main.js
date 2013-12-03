
function init() {
	var canvas = document.getElementById("myCanvas");
	console.log("hi");

	var context = canvas.getContext("2d");

	// Translate to the middle of the canvas
	context.translate(canvas.width / 2, canvas.height / 2);

	// Flip the context vertically, and scale
	var scale = 50;
	context.scale(scale, -scale);
	
	// Set color to gray
	context.strokeStyle = '#3333F3';
	context.lineWidth = .02;

	context.beginPath();
	for (var a = -canvas.width / scale / 2; a<canvas.width / scale / 2 + 1; a++) {
		context.moveTo(a, -canvas.height / scale);
		context.lineTo(a, canvas.height / scale);
	}
	for (var a = -canvas.height / scale / 2; a<canvas.height / scale / 2 + 1; a++) {
		context.moveTo(-canvas.width / scale, a);
		context.lineTo(canvas.width / scale, a);
	}
	context.stroke();
}

function keypressed() {
	if (window.event.keyCode == 13) {
		console.log(window.event);
	}
}