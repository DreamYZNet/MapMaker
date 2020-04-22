
let MapView = function () {
		
	// events
	let on_setSquareSize = []
		
	// elements
	let c_grid;
	let c_map;
	let ctx_grid;
	let ctx_map;
	
	// display
	let zoom = 1;
	let square_size = 30;
	let org_square_size = square_size
	let grid_width;
	let grid_height;
	
	// settings
	let wall_width = square_size*.4
	let wall_length = square_size+wall_width;
	let grid_opacity_default = 0.3;
	
	
	(function bindElements() {
		c_grid = document.getElementById("c_grid");
		c_map = document.getElementById("c_map");
		ctx_grid = c_grid.getContext("2d");
		ctx_map = c_map.getContext("2d");
		toggleGrid(true);
	})();
	
	function draw(map) {
		drawWallsFromArrays(map.horizontal_walls, map.vertical_walls)
		drawGrid()
	}
	
	function drawWallsFromArrays(horizontal_walls, vertical_walls) {
		ctx_map.clearRect(0, 0, c_map.width, c_map.height);
		for (let y = 0; y < horizontal_walls.length; y++) {
			for (let x = 0; x < horizontal_walls[y].length; x++) {
				if (horizontal_walls[y][x] == 1) {
					let r = getWallRect(x, y, true);
					ctx_map.fillRect(r.x, r.y, r.width, r.height);
				}
			}
		}
		for (let y = 0; y < vertical_walls.length; y++) {
			for (let x = 0; x < vertical_walls[y].length; x++) {
				if (vertical_walls[y][x] == 1) {
					let r = getWallRect(x, y, false);
					ctx_map.fillRect(r.x, r.y, r.width, r.height);
				}
			}
		}
	}
	function drawWall(x, y, is_horizontal) {
		let r = getWallRect(x, y, is_horizontal);
		ctx_map.fillRect(r.x, r.y, r.width, r.height);
	}
	/*
	function eraseWall(x, y, is_horizontal) {// WIP WE DONT EVEN HAVE THE WALL MAPS HOW ARE WE SUPPOSED TO BE CLEVER
		let skip_start = false;
		let skip_end = false;
		let r = getWallRect(x, y, is_horizontal, skip_start, skip_end);
		ctx_map.clearRect(r.x, r.y, r.width, r.height);
		//WIP WE NEED TO ACTUALLY CHECK WHAT WE CAN DELETE AND WHAT NEEDS TO BE LEFTOVER
	}*/

	function drawGrid(){
		// vertical
		for(let i = 0; i < grid_width+1; i++)
			drawLine(i*square_size, 0, i*square_size, grid_height*square_size);
		// horizontal
		for(let i = 0; i < grid_height+1; i++)
			drawLine(0, i*square_size, grid_width*square_size, i*square_size);
	}

	function setZoom (add = 0, mult = 1) {
		zoom *= mult;
		zoom += add;
		// Make sure zoom doesnt get too low
		if (org_square_size*zoom < 1)
			zoom = 1/org_square_size
		//if (org_square_size*(zoom*mult + add) < 1)
		setSquareSize(org_square_size*zoom);
	}
	function zoomIn (){ setZoom(0.1); }
	function zoomOut (){ setZoom(-0.1); }

	// Resize canvas, and redraw (as canvas becomes empty when resized)
	function resize(grid_width_, grid_height_, map){
		grid_width = grid_width_;
		grid_height = grid_height_;
		wall_width = square_size*.4
		wall_length = square_size+wall_width
		
		c_map.width = grid_width*square_size
		c_map.height = grid_height*square_size
		c_grid.width = grid_width*square_size
		c_grid.height = grid_height*square_size
		
		// Set top margins to overlap the canvases
		c_map.style.marginTop = "0px";
		c_grid.style.marginTop = -grid_height*square_size+"px";
		draw(map);
	}
	
	// Get the rect of a wall, given its grid (x,y) location, such as 1,1 horizontal
	function getWallRect(x, y, horizontal, skip_start = false, skip_end = false) {
		let start_offset = 0;
		if (skip_start)
			start_offset = wall_width;
		let end_offset = -start_offset;
		if (skip_end)
			end_offset -= wall_width;
		if (horizontal)
			return {'x':x*square_size+(square_size-wall_length)/2 +start_offset, 
					'y':y*square_size-wall_width/2, 
					'width':wall_length +end_offset, 
					'height':wall_width, 
					'fill':"#c00"}
		else
			return {'x':x*square_size-wall_width/2, 
					'y':y*square_size+(square_size-wall_length)/2 +start_offset, 
					'width':wall_width, 
					'height':wall_length +end_offset, 
					'fill':"#c00"}
	}
	
	function drawLine(x,y,x2,y2){
		ctx_grid.beginPath();
		ctx_grid.moveTo(x, y);
		ctx_grid.lineTo(x2, y2);
		ctx_grid.stroke();
	}
	
	function setSquareSize(value) {
		square_size = value;
		for (f of on_setSquareSize)
			f(square_size);
	}
	
	function toggleGrid(visible) {
		if (visible === undefined)
			if (c_grid.style.opacity === '0')
				visible = true;
			else
				visible = false;
		if (visible)
			c_grid.style.opacity = grid_opacity_default;
		else
			c_grid.style.opacity = 0;
	}
	
	return {
		constructor:this.constructor,
		
		// events
		on_setSquareSize:on_setSquareSize,
		
		// elements
		c_grid:c_grid,
		c_map:c_map,
		ctx_grid:ctx_grid,
		ctx_map:ctx_map,
		
		// variables
		get square_size(){ return square_size },
		set square_size(v){ setSquareSize(v) },
		get org_square_size(){ return org_square_size },
		set org_square_size(v){ org_square_size = v },
		get zoom(){ return zoom },
		set zoom(v){ zoom = v; setSquareSize(org_square_size*zoom); }, //somehow 1317 is the maximum zoom. thats 39510 square_size
		get wall_width(){ return wall_width },
		set wall_width(v){ wall_width(v) },
		get wall_length(){ return wall_length },
		set wall_length(v){ wall_length(v) },
		
		// methods
		draw:draw,
		drawWall:drawWall,
		//eraseWall:eraseWall,
		drawWallsFromArrays:drawWallsFromArrays,
		drawGrid:drawGrid,
		getWallRect:getWallRect,
		zoomIn:zoomIn,
		zoomOut:zoomOut,
		setZoom:setZoom,
		resize:resize,
		toggleGrid:toggleGrid
	}
};


