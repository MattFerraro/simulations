var all_particles = new Array();
var gravity = -9.8;
var maxX = 800;
var maxY = 600;

function init()
{
	// First just initialize the graphix
	var b_canvas = document.getElementById("myCanvas");
	graphix_init(b_canvas, all_particles)
	
	// Next initialize the state vector
	var k = 1;
	
	var num_particles = 16;
	for(var a = 0; a<num_particles; a++)
	{
		var particle = new Object();
		particle.x = a * 20 + maxX / 2;
		particle.y = 10 + a;
		particle.dx = 40;
		particle.dy = 20;
		particle.r = 8;
		particle.type = 1;
		particle.m = 10;
		
		particle.sprungTo = new Array();
		all_particles[all_particles.length] = particle;
		
	}
	
	//anchor to the center!
	var index = 0;
	
	//forward link everything
	//index++;
	for(var a = 0;a<num_particles;a++)
	{
		if (a == num_particles-1)
			continue;
	
		index = all_particles[a].sprungTo.length;
		var particle = all_particles[a];
		particle.sprungTo[index] = new Object();
		
		particle.sprungTo[index].point = all_particles[a+1]//new Point(maxX/2, maxY/2);
		
		particle.sprungTo[index].k = 100;
		particle.sprungTo[index].s_len = 20;
	}
	
	//backward link everything!
	for(var a = 0;a<num_particles;a++)
	{
		if (a == 0)
			continue;
		index = all_particles[a].sprungTo.length;
		var particle = all_particles[a];
		particle.sprungTo[index] = new Object();
		
		particle.sprungTo[index].point = all_particles[a-1]//new Point(maxX/2, maxY/2);
		
		particle.sprungTo[index].k = 100;
		particle.sprungTo[index].s_len = 20;
	}
	

	all_particles[0].type = 2;
	
	setInterval(draw, 40);
	setInterval(update, 1);
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
	//console.log("updating");
	//for loop over all of the particles and update their positions
	update_particles();
}

// Propogates physics forward for all of the particles equally
function update_particles()
{
	// console.log("updating");
	// As you can see, we dispatch the hard work to the integrators.js file
	flattened = flatten(all_particles);
	// console.log(flattened);
	new_x_hat = rk4(flattened, generate_derivative, .019);
	// console.log(new_x_hat);
	expand(new_x_hat, all_particles);
}

function distance(particleA, particleB)
{
	dx = particleB.x - particleA.x;
	dy = particleB.y - particleA.y;
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

function generate_derivative(x_hat)
{
	var x_dot = [];
	var index = 0;
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

		x_dot[index]   = particle_dx;
		x_dot[index+1] = particle_ddx;
		x_dot[index+2] = particle_dy;
		x_dot[index+3] = particle_ddy;

		index+=4;

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

