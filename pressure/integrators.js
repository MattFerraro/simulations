// Author: Matt Ferraro
// Description: Utility file that contains an rk4 integration function
// Date: Originally sometime in spring 2012. Revised Sept 22, 2013


/*
	Utility function, basically a for loop, that takes in a vector,
	a delta to that vector, and a gain by which to multiple the delta
	before adding it to the vector.

	Inputs:
	x_hat 		Array		Some vector
	x_dot		Array		The derivative of x_hat
	gain		float		The gain by which to multiply x_dot before adding

	Outputs:
	new_x_hat	Array		The new vector

	Mutations to Inputs:
	None
*/
function scalar_add(x_hat, x_dot, gain)
{
	var new_x_hat = [];
	for (var i = 0; i<x_hat.length; i++)
	{
		new_x_hat[i] = x_hat[i] + x_dot[i] * gain;
	}
	return new_x_hat;
}


/*
	An implementation of the Euler 1st order integration method
	as described here http://en.wikipedia.org/wiki/Euler%27s_method
	Note that this is here only as a comparison with RK4.
	
	Inputs:
	x_hat 		Array		the vector of all variables in the state
	deriv_func	function	a function which takes in x_hat and returns x_dot, the
							derivative of the state
	dt 			float		the total amount of time you want me to integrate over

	Outputs:
	new_x_hat	Array		the new vector of all variables in the state

	Mutations to Inputs:
	None

*/
function euler(x_hat, deriv_func, dt)
{
	// First, find the derivative of the state, yielding x_dot
	var x_dot = deriv_func(x_hat);
	
	// Second, multiply x_dot by dt and add it to x_hat
	var new_x_hat = scalar_add(x_hat, x_dot, dt);

	return new_x_hat;
}



/*
	An implementation of the Runge-Kutta 4th order integration method
	as described here http://en.wikipedia.org/wiki/Runge%E2%80%93Kutta_methods
	
	Inputs:
	x_hat 		Array		the vector of all variables in the state
	deriv_func	function	a function which takes in x_hat and returns x_dot, the
							derivative of the state
	dt 			float		the total amount of time you want me to integrate over

	Outputs:
	new_x_hat	Array		the new vector of all variables in the state

	Mutations to Inputs:
	None
*/
function rk4(x_hat, deriv_func, dt)
{
	// Find the derivative of course, just like euler
	var k1 = deriv_func(x_hat);
	
	// Imagine euler is correct, but only for dt/2.
	// Jump to that position with that derivative, and
	// then grab the derivative there
	var x_hat_at_midpoint_k1 = scalar_add(x_hat, k1, dt/2);
	var k2 = deriv_func(x_hat_at_midpoint_k1);
	
	// Now go back to the beginning and move to the midpoint again,
	// But this time using k2 as x_dot. Once there, pull a
	// third estimate of x_dot
	var x_hat_at_midpoint_k2 = scalar_add(x_hat, k2, dt/2);
	var k3 = deriv_func(x_hat_at_midpoint_k2);
		
	// Lastly we go back to the beginning and fast forward all
	// the way to the end, using k3 as our estimated x_dot
	// Once there, pull a fourth estimate of x_dot
	var x_hat_at_end_k3 = scalar_add(x_hat, k3, dt);
	var k4 = deriv_func(x_hat_at_end_k3);

	// Now that the hard math is done, we have four different
	// estimates of what the derivative should be. All we do
	// is pull a weighted average of the 4 different estimates
	// And voila, we have our overall RK4 estimate of the derivative.
	var k_final = new Array();
	for(var i = 0; i<k1.length; i++)
	{
		k_final[i] = 1/6 * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]);
	}

	// With our estimate of the derivative in hand, all we do
	// is multiply the deriv by dt and add it to the state,
	// Then return our answer

	var new_x_hat = scalar_add(x_hat, k_final, dt);
	return new_x_hat;
}