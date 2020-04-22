
let LightMapView = function () {

	// elements
	let c_black;
	let ctx_black;
	
	// display
	let grid_width;
	let grid_height;
	let square_size;
	
	
	(function bindElements() {
		c_black = document.getElementById("c_black");
		ctx_black = c_black.getContext("2d");
	})();
	
	function drawChanged(tiles) {
		let darkness_range = 5.0;
		ctx_black.fillStyle = "rgba(0, 0, 0, 1)";
		for (y in tiles) { y = parseInt(y);
			for (x in tiles[y]) { x = parseInt(x);
				let distance = tiles[y][x];
				drawTile(x, y, distance, darkness_range);
			}
		}
	}
	
	function drawTile(x, y, distance, darkness_range) {
		if (distance > 0) {
			let r = getBoxRect(x, y, square_size);
			let alpha = 1-distance/(darkness_range+1);
			alpha = easeOutExpo(alpha, 0, 1.1);
			ctx_black.clearRect(r.x, r.y, r.width, r.height);
			ctx_black.fillStyle = "rgba(0, 0, 0, "+alpha+")";
			ctx_black.fillRect(r.x, r.y, r.width, r.height);
			//levels += alpha+", ";
		}
	}
	
	function draw(light_map) {
		let darkness_range = 5.0;
		ctx_black.fillStyle = "rgba(0, 0, 0, 1)";
		ctx_black.fillRect(0, 0, c_black.width, c_black.height);
		for (let y = 0; y < grid_height; y++) {
			for (let x = 0; x < grid_width; x++) {
				drawTile(x, y, light_map[y][x], darkness_range);
			}
		}
	}
	
	function toggleEditorDarkness (value) {
		if (value == null) {
			if (c_black.style.opacity == 1)
				c_black.style.opacity = 0;
			else if (c_black.style.opacity == 0)
				c_black.style.opacity = 0.8;
			else
				c_black.style.opacity = 1;
		}else{
			c_black.style.opacity = value;
		}
	}
	
	function getEditorDarkness() {
		return c_black.style.opacity || 1;
	}
	
	// Progress is 0 to 1
	function easeOutExpo(progress, start_val, end_val, max_in = 1) {
		let base = 2; //1.1
		let exp = 1; //.1
		let mult = Math.pow(base, exp* (progress/max_in-1))
		let smallest = Math.pow(base, -exp)
		mult = (mult-smallest)/ (1-smallest); //exponents cant go to 0. this fixes it. 
		return (end_val-start_val) * mult + start_val;
		//return (end_val-start_val) * ( Math.pow(base, 1* (progress/max_in-1) ) ) + start_val;
		//return (end_val-start_val) * ( -Math.pow(2, -10* (progress/max_in) ) +1 ) + start_val;
	}
	// Progress is 0 to 1
	function easeInExpo(progress, start_val, end_val, max_in = 1) {
		let base = 2;
		let exp = 1;
		let mult = 1 -Math.pow(base, -exp* (progress/max_in))
		let largest = 1 -Math.pow(base, -exp)
		mult = mult / largest; //exponents cant go to 0. this fixes it. 
		return (end_val-start_val) * mult + start_val;
		//return (end_val-start_val) * ( Math.pow(base, 1* (progress/max_in-1) ) ) + start_val;
		//return (end_val-start_val) * ( 1 -Math.pow(2, -10* (progress/max_in) ) ) + start_val;
	}
	
	// Resize canvas, and redraw (as canvas becomes empty when resized)
	function resize(grid_width_, grid_height_, light_map){
		grid_width = grid_width_;
		grid_height = grid_height_;
		
		c_black.width = grid_width*square_size
		c_black.height = grid_height*square_size
		
		// Set top margin to overlap the canvases
		c_black.style.marginTop = -grid_height*square_size+"px";
		draw(light_map);
	}
	
	return {
		constructor:this.constructor,
		
		// elements
		c_black:c_black,
		ctx_black:ctx_black,
		
		// variables
		get square_size(){ return square_size },
		set square_size(v){ square_size = v },
		
		// methods
		draw:draw,
		drawChanged:drawChanged,
		toggleEditorDarkness:toggleEditorDarkness,
		getEditorDarkness:getEditorDarkness,
		resize:resize
	}
};