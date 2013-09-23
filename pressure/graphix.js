// Author: Matt Ferraro
// Description: Utility file that can draw particles on a canvas
// Date: Originally sometime in spring 2012. Revised Sept 22, 2013


// TODO: OOP, yo. Make this a class
var target_canvas;
var all_particles;
function graphix_init(canvas, particles)
{
	target_canvas = canvas
	all_particles = particles
}


function draw()
{
	//grab some necessary variables
	// var b_canvas = document.getElementById("myCanvas");
	var context = target_canvas.getContext("2d");

	// clear the canvas
	draw_background(target_canvas, context);
	
	// for loop over all of the particles and draw them one by one
	draw_particles(context);
}


function draw_background(b_canvas, context)
{
	context.fillStyle = "#FFFFFF";
	context.fillRect(0, 0, b_canvas.width, b_canvas.height);
}


/*
	Relies on particle objects having:
	type
	x
	y
	r

*/
function draw_particles(context)
{
	context.fillStyle = "#0000FF";
	
	for(var a = 0;a<all_particles.length;a++)
	{
		particle = all_particles[a];
		
		if (particle.type == 2)
			context.fillStyle="#FF0000";
		else
			context.fillStyle="#0000FF";
		
		var percent = (1.0 * a)/all_particles.length;
		var red = Math.floor(255 * percent);
		var green = 0;
		var blue = 255-Math.floor(255 * percent);
		
		context.fillStyle="rgb("+red+","+green+","+blue+")";
		
		context.beginPath();
		context.arc(particle.x, particle.y, particle.r, 0, Math.PI*2, true);
		context.closePath();
		context.fill();
	}	
}