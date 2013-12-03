var all_particles = new Array();
var gravity = -9.8;
gravity = 0;
var maxX = 800;
var maxY = 600;
var num_particles = 5;
var radius = 60;
var spring_length = 50;
var ball_resting_area = 1000;
var repulsive_coeff = 10000;
var spring_coeff = 5;
var pressure_coeff = 10;

function init()
{
	// First just initialize the graphix
	var b_canvas = document.getElementById("myCanvas");
	graphix_init(b_canvas, all_particles)
	
	// Next initialize the state vector
	var k = 1;
	
	for(var a = 0; a<num_particles; a++)
	{
		var angle = Math.PI * 2 - (Math.PI * 2 / num_particles * a) + Math.PI / 4;

		var particle = new Object();
		particle.x = maxX/2 + Math.cos(angle) * radius;
		particle.y = maxY/2 + Math.sin(angle) * radius;
		particle.dx = 0;
		particle.dy = 10;
		particle.r = 8;
		particle.type = 1;
		particle.m = 10;
		
		particle.sprungTo = new Array();
		all_particles[all_particles.length] = particle;
		
	}
		
	setInterval(draw, 40);
	setInterval(update, .25); //.25 is a good rate
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

var print_ind = 0;
function generate_derivative(x_hat)
{
	print_ind ++;

	var x_dot = [];
	var index = 0;
	var ball_index = 0;

	var Xs = []
	var Ys = []
	var modulo;
	for (var i = 0; i < x_hat.length; i++)
	{
		modulo = i % 4;
		if (modulo == 0)
		{
			Xs.push(x_hat[i]);
		}
		else if (modulo == 2)
		{
			Ys.push(x_hat[i]);
		}
	}
	var area = polygon_area(Xs, Ys);
	var pressure = 2 * ball_resting_area / (area);
	pressure *= pressure_coeff;
	if (print_ind % 100 == 0)
	{
		console.log(area + "    " + pressure);
	}

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
		var k_force_left = e_dist_left * spring_coeff;
		particle_ddx += ball_to_left_dist_x / ball_to_left_dist * (k_force_left);
		particle_ddy += ball_to_left_dist_y / ball_to_left_dist * (k_force_left);


		var ball_to_right_x = x_hat[ball_to_right_index * 4];
		var ball_to_right_y = x_hat[ball_to_right_index * 4 + 2];
		var ball_to_right_dist_x = ball_to_right_x - particle_x;
		var ball_to_right_dist_y = ball_to_right_y - particle_y;
		var ball_to_right_dist = Math.sqrt(ball_to_right_dist_x * ball_to_right_dist_x + ball_to_right_dist_y * ball_to_right_dist_y);
		var e_dist_right = ball_to_right_dist - spring_length
		var k_force_right = e_dist_right * spring_coeff;
		particle_ddx += ball_to_right_dist_x / ball_to_right_dist * (k_force_right);
		particle_ddy += ball_to_right_dist_y / ball_to_right_dist * (k_force_right);

		var Fn_right = ball_to_right_dist * pressure;
		particle_ddy -= ball_to_right_dist_y / ball_to_right_dist * Fn_right;
		particle_ddx -= ball_to_right_dist_x / ball_to_right_dist * Fn_right;

		var Fn_left = ball_to_left_dist * pressure;
		particle_ddy -= ball_to_left_dist_y / ball_to_left_dist * Fn_left;
		particle_ddx -= ball_to_left_dist_x / ball_to_left_dist * Fn_left;

		x_dot[index]   = particle_dx;
		x_dot[index+1] = particle_ddx;
		x_dot[index+2] = particle_dy;
		x_dot[index+3] = particle_ddy;

		index+=4;
		ball_index++;
	}
	return x_dot;
}


// Copied from http://www.mathopenref.com/coordpolygonarea2.html
// damn this is a cool algo
function polygon_area(Xs, Ys)
{
	area = 0;           // Accumulates area in the loop
	j = Xs.length - 1;  // The last vertex is the 'previous' one to the first

	for (i = 0; i < Xs.length; i++)
	{
		area = area + (Xs[j]+Xs[i]) * (Ys[j]-Ys[i]);
		j = i;  //j is previous vertex to i
	}
	return area/2;
}
