
function euler(x_hat, dt)
{
	//x_hat is the vector of all variables
	//d_x_fn is the function that when you call d_x_fn(x_hat), returns the derivatives of the x_hat
	//d_t is the total dt you want me to integrate over
	d_x_vector = x_hat.getDeriv();
	//console.log("Vector: ");
	//console.log(d_x_vector);
	x_hat.add(d_x_vector, dt)
	//console.log("Euler Finished!"); 
}

function rk4(x_vector, dt)
{
	//find the increment based on euler's method
	k1 = x_vector.getDeriv();
	
	//imagine euler is correct, but only go to the midpoint of the step
	//then grab the derivative there
	x_vector.add(k1, dt/2);
	k2 = x_vector.getDeriv();
	
	//now rewind what we just did, then use k2's slope:
	x_vector.add(k1, -dt/2);//rewinds what we just did
	x_vector.add(k2, dt/2);//step to the midpoint again, but with
	//fore-knowledge of what the midpoint's slop is going to look like!
	k3 = x_vector.getDeriv();
	
	x_vector.add(k2, -dt/2);//rewind to the start again
	x_vector.add(k3, dt);//ff to the end!
	k4 = x_vector.getDeriv();
	
	x_vector.add(k3, -dt);//rewind one last time
	
	final_increment = new Array();
	for(var i = 0;i<k1.length;i++)
	{
		final_increment[i] = 1/6 * (k1[i] + 2*k2[i] + 2*k3[i] + k4[i]);
	}
	
	
	x_vector.add(final_increment, dt);
}