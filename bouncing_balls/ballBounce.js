var allParticles = new Array();
var maxX = 800;
var maxY = 600;
var gravity = -9.8;
var stateVect = new Array();
var k = 1;

function init()
{

	var numParticles = 16;
	var angle = 3.14159 * 2 / numParticles;
	var radius = 80;
	
	for(var a = 0;a<numParticles;a++)
	{
		var newParticle = new Object();
		//newParticle.x = maxX / 2 + radius * Math.cos(a * angle);
		//newParticle.y = maxY / 2 + radius * Math.sin(a * angle);
		newParticle.x = a * 20 + maxX/2;
		newParticle.y = 10;
		newParticle.dx = 0;
		newParticle.dy = 0;
		newParticle.r = 8;
		newParticle.type = 1;
		newParticle.m = 10;
		
		newParticle.sprungTo = new Array();
		allParticles[allParticles.length] = newParticle;
		
		
	}
	
	//anchor to the center!
	var index = 0;
	/*
	for(var a = 0;a<numParticles;a++)
	{
		var newParticle = allParticles[a];
		newParticle.sprungTo[index] = new Object();
		
		newParticle.sprungTo[index].point = new Point(maxX/2, maxY/2);
		newParticle.sprungTo[index].k = 10;
		newParticle.sprungTo[index].s_len = radius;
	}*/
	
	//forward link everything
	//index++;
	for(var a = 0;a<numParticles;a++)
	{
		if (a == numParticles-1)
			continue;
	
		index = allParticles[a].sprungTo.length;
		var newParticle = allParticles[a];
		newParticle.sprungTo[index] = new Object();
		
		newParticle.sprungTo[index].point = allParticles[a+1]//new Point(maxX/2, maxY/2);
		
		newParticle.sprungTo[index].k = 100;
		newParticle.sprungTo[index].s_len = 20;
	}
	
	//backward link everything!
	for(var a = 0;a<numParticles;a++)
	{
		if (a == 0)
			continue;
		index = allParticles[a].sprungTo.length;
		var newParticle = allParticles[a];
		newParticle.sprungTo[index] = new Object();
		
		newParticle.sprungTo[index].point = allParticles[a-1]//new Point(maxX/2, maxY/2);
		
		newParticle.sprungTo[index].k = 100;
		newParticle.sprungTo[index].s_len = 20;
	}
	

	allParticles[0].type = 2;
	
	allParticles.getDeriv = generate_derivative;
	allParticles.add = add;
	
	setInterval(draw, 10);
	setInterval(update, 5);
}


function update()
{
	//console.log("updating");
	//for loop over all of the particles and update their positions
	updateParticles();
}
function Point(x, y)
{
	var thisPoint = new Object();
	thisPoint.x = x;
	thisPoint.y = y;
	return thisPoint;
}




function distance(particleA, particleB)
{
	dx = particleB.x - particleA.x;
	dy = particleB.y - particleA.y;
	return Math.sqrt(dx*dx + dy*dy);
}

function generate_derivative()
{
	//This function will take in the state (an array of objects!)
	//and generates a plain old array of numbers as the derivative
	output = new Array();
	//console.log(gain);
	for (var a = 0;a<allParticles.length;a++)
	{
		output[output.length] = allParticles[a].dx;
		output[output.length] = allParticles[a].dy;
		
		if (allParticles[a].type == 2) //that means fixed!
		{
			output[output.length] = 0;//ddx - there would actually be spring logic in here :)
			output[output.length] = 0;//ddy - there would actually be spring and gravity logic in here :)
		}
		else if (allParticles[a].type == 1)
		{
			
			//we need to sum up the x and y forces from all springs:
			var f_x = 0;
			var f_y = 0;
			for(var b = 0;b<allParticles[a].sprungTo.length;b++)
			{
				var temp_sprung_to = allParticles[a].sprungTo[b];
				var x_dist = allParticles[a].x - temp_sprung_to.point.x;
				var y_dist = allParticles[a].y - temp_sprung_to.point.y;
				var dist = Math.sqrt(x_dist * x_dist + y_dist * y_dist);
				var e_dist = dist - temp_sprung_to.s_len;
				//console.log(e_dist);
				var f_tot = -e_dist * temp_sprung_to.k;
				f_x += x_dist / dist * f_tot;
				f_y += y_dist / dist * f_tot;
				//force in X = cos(angl) * f_total
				//cos = adjacent / hypot = x_dist / dist
				//force in X = adj / hypot * f_total
			}
			
			a_x = f_x / allParticles[a].m;
			a_y = f_y / allParticles[a].m;
			
			output[output.length] = a_x;//ddx - there would actually be spring logic in here :)
			output[output.length] = a_y-gravity;//ddy - there would actually be spring and gravity logic in here :)
			//maybe there would be electrostatic force logic!		
		}
		
	}
	
	return output;
}
function add(d_state, gain)
{
	//This function takes in an array of numbers and knows how to
	//add those numbers to the current state. Nothing is returned
	var index = 0;
	for (var a = 0;a<allParticles.length;a++)
	{
		allParticles[a].x += d_state[index] * gain;
		index++;
		allParticles[a].y += d_state[index] * gain;
		index++;
		allParticles[a].dx += d_state[index] * gain;
		index++;
		allParticles[a].dy += d_state[index] * gain;
		index++;
	}
}


function updateParticles()
{
	rk4(allParticles, .03);
	//console.log(allParticles[0].x);
}









function draw()
{
	//grab some necessary variables
	var b_canvas = document.getElementById("myCanvas");
	var context = b_canvas.getContext("2d");

	//clear the canvas
	drawBackground(b_canvas, context);
	
	//for loop over all of the particles and draw them one by one
	drawParticles(context);
}


function drawBackground(b_canvas, context)
{
	context.fillStyle = "#FFFFFF";
	context.fillRect(0, 0, b_canvas.width, b_canvas.height);
}

function drawParticles(context)
{
	context.fillStyle = "#FFFFFF";
	context.fillStyle="#0000FF";
	for(var a = 0;a<allParticles.length;a++)
	{
		tempPart = allParticles[a];
		
		if (tempPart.type == 2)
			context.fillStyle="#FF0000";
		else
			context.fillStyle="#0000FF";
		
		var percent = (1.0 * a)/allParticles.length;
		var red = Math.floor(255 * percent);
		var green = 0;
		var blue = 255-Math.floor(255 * percent);
		
		context.fillStyle="rgb("+red+","+green+","+blue+")";
		
		context.beginPath();
		context.arc(tempPart.x, tempPart.y, tempPart.r, 0, Math.PI*2,true);
		context.closePath();
		context.fill();
	}	
}