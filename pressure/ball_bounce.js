var all_particles = new Array();
var gravity = -9.8;
var maxX = 800;
var maxY = 600;
var num_particles = 16;
var radius = 30;
var spring_length = 40;

function init()
{
	// First just initialize the graphix
	var b_canvas = document.getElementById("myCanvas");
	graphix_init(b_canvas, all_particles)
	
	// Next initialize the state vector
	var k = 1;
	
	for(var a = 0; a<num_particles; a++)
	{
		var angle = Math.PI * 2 / num_particles * a;

		var particle = new Object();
		particle.x = maxX/2 + Math.cos(angle) * radius;
		particle.y = maxY/2 + Math.sin(angle) * radius;
		particle.dx = 40;
		particle.dy = 20;
		particle.r = 8;
		particle.type = 1;
		particle.m = 10;
		
		particle.sprungTo = new Array();
		all_particles[all_particles.length] = particle;
		
	}
		
	setInterval(draw, 40);
	setInterval(update, .25);
	// update();
}


function flatten(list_of_particles)
{
	x_hat = [];
	var index = 0;
	for (var i = 0; i < list_of_particles.length; i++)
	{
		particle = list_of_particles[i];
		x_hat[index] = particle.x;
		index++;
		
		x_hat[index] = particle.dx;
		index++;

		x_hat[index] = particle.y;
		index++;

		x_hat[index] = particle.dy;
		index++;
	}
	return x_hat;
}

function expand(x_hat, list_of_particles)
{
	var index = 0;
	for (var i = 0; i < list_of_particles.length; i++)
	{
		particle = list_of_particles[i];
		particle.x = x_hat[index];
		index++;
		
		particle.dx = x_hat[index];
		index++;

		particle.y = x_hat[index];
		index++;

		particle.dy = x_hat[index];
		index++;
	}
	return list_of_particles;
}

function update()
{
	//for loop over all of the particles and update their positions
	update_particles();
}

// Propogates physics forward for all of the particles equally
function update_particles()
{
	// As you can see, we dispatch the hard work to the integrators.js file
	flattened = flatten(all_particles);
	// console.log(flattened);
	new_x_hat = rk4(flattened, generate_derivative, .012);
	// console.log(new_x_hat);
	expand(new_x_hat, all_particles);
}

function distance(x1, x2, y1, y2)
{
	dx = x2 - x1;
	dy = y2 - y1;
	return Math.sqrt(dx*dx + dy*dy);
}

// function Point(x, y)
// {
// 	var thisPoint = new Object();
// 	thisPoint.x = x;
// 	thisPoint.y = y;
// 	return thisPoint;
// }

var repulsive_coeff = 10000;
var spring_coeff = 1;

function generate_derivative(x_hat)
{
	var x_dot = [];
	var index = 0;
	var ball_index = 0;
	while (index < x_hat.length)
	{
		var particle_x =  x_hat[index];
		var particle_dx = x_hat[index+1];
		var particle_ddx = 0;

		var particle_y =  x_hat[index+2];
		var particle_dy = x_hat[index+3];
		var particle_ddy = -gravity


		// There is a force-field at the bottom of the screen
		// We simulate it as a repulsive force that scales as 1/r^4
		var dist_from_bottom = maxY - particle_y;
		if (dist_from_bottom < 10)
		{
			var repulsive_force = repulsive_coeff / (dist_from_bottom * dist_from_bottom);
			particle_ddy -= repulsive_force;
		}

		var dist_from_right = maxX - particle_x;
		if (dist_from_right < 10)
		{
			var repulsive_force = repulsive_coeff / (dist_from_right * dist_from_right);
			particle_ddx -= repulsive_force;
		}

		var dist_from_top = particle_y;
		if (dist_from_top < 10)
		{
			var repulsive_force = repulsive_coeff / (dist_from_top * dist_from_top);
			particle_ddy += repulsive_force;
		}

		var dist_from_left = particle_x;
		if (dist_from_left < 10)
		{
			var repulsive_force = repulsive_coeff / (dist_from_left * dist_from_left);
			particle_ddx += repulsive_force;
		}

		var ball_to_left_index = ball_index - 1;
		var ball_to_right_index = ball_index + 1;
		if (ball_to_left_index < 0){
			ball_to_left_index = num_particles - 1;
		}
		if (ball_to_right_index >= num_particles)
		{
			ball_to_right_index = 0;
		}

		var ball_to_left_x = x_hat[ball_to_left_index * 4];
		var ball_to_left_y = x_hat[ball_to_left_index * 4 + 2];
		var ball_to_left_dist_x = ball_to_left_x - particle_x;
		var ball_to_left_dist_y = ball_to_left_y - particle_y;
		var ball_to_left_dist = Math.sqrt(ball_to_left_dist_x * ball_to_left_dist_x + ball_to_left_dist_y * ball_to_left_dist_y);
		var e_dist_left = ball_to_left_dist - spring_length;
		particle_ddx += ball_to_left_dist_x / ball_to_left_dist * e_dist_left;
		particle_ddy += ball_to_left_dist_y / ball_to_left_dist * e_dist_left;


		var ball_to_right_x = x_hat[ball_to_right_index * 4];
		var ball_to_right_y = x_hat[ball_to_right_index * 4 + 2];
		var ball_to_right_dist_x = ball_to_right_x - particle_x;
		var ball_to_right_dist_y = ball_to_right_y - particle_y;
		var ball_to_right_dist = Math.sqrt(ball_to_right_dist_x * ball_to_right_dist_x + ball_to_right_dist_y * ball_to_right_dist_y);
		var e_dist_right = ball_to_right_dist - spring_length;
		particle_ddx += ball_to_right_dist_x / ball_to_right_dist * e_dist_right;
		particle_ddy += ball_to_right_dist_y / ball_to_right_dist * e_dist_right;


		// var e_dist_right = dist_ball_right - 30;
		// var ball_to_right_x = x_hat[ball_to_right_index * 4];
		// var ball_to_right_y = x_hat[ball_to_right_index * 4 + 2];

		// var dist_ball_right = distance(ball_to_right_x, particle_x, ball_to_right_y, particle_y);



		x_dot[index]   = particle_dx;
		x_dot[index+1] = particle_ddx;
		x_dot[index+2] = particle_dy;
		x_dot[index+3] = particle_ddy;

		index+=4;
		ball_index++;
	}
	return x_dot;
}


// function generate_derivative()
// {
// 	//This function will take in the state (an array of objects!)
// 	//and generates a plain old array of numbers as the derivative
// 	output = new Array();
// 	//console.log(gain);
// 	for (var a = 0;a<all_particles.length;a++)
// 	{
// 		output[output.length] = all_particles[a].dx;
// 		output[output.length] = all_particles[a].dy;
		
// 		if (all_particles[a].type == 2) //that means fixed!
// 		{
// 			output[output.length] = 0;//ddx - there would actually be spring logic in here :)
// 			output[output.length] = 0;//ddy - there would actually be spring and gravity logic in here :)
// 		}
// 		else if (all_particles[a].type == 1)
// 		{
			
// 			//we need to sum up the x and y forces from all springs:
// 			var f_x = 0;
// 			var f_y = 0;
// 			for(var b = 0;b<all_particles[a].sprungTo.length;b++)
// 			{
// 				var temp_sprung_to = all_particles[a].sprungTo[b];
// 				var x_dist = all_particles[a].x - temp_sprung_to.point.x;
// 				var y_dist = all_particles[a].y - temp_sprung_to.point.y;
// 				var dist = Math.sqrt(x_dist * x_dist + y_dist * y_dist);
// 				var e_dist = dist - temp_sprung_to.s_len;
// 				//console.log(e_dist);
// 				var f_tot = -e_dist * temp_sprung_to.k;
// 				f_x += x_dist / dist * f_tot;
// 				f_y += y_dist / dist * f_tot;
// 				//force in X = cos(angl) * f_total
// 				//cos = adjacent / hypot = x_dist / dist
// 				//force in X = adj / hypot * f_total
// 			}
			
// 			a_x = f_x / all_particles[a].m;
// 			a_y = f_y / all_particles[a].m;
			
// 			output[output.length] = a_x;//ddx - there would actually be spring logic in here :)
// 			output[output.length] = a_y-gravity;//ddy - there would actually be spring and gravity logic in here :)
// 			//maybe there would be electrostatic force logic!		
// 		}
		
// 	}
	
// 	return output;
// }

