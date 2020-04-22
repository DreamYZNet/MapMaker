
let StageMap = function({width, height, array2d}={}) {
	
	// events
	let on_resize = [] //w, h
	let on_alterSize = [] //left right up down
	let on_setWall = [] //x, y, is_horizontal, value
	
	// dependencies
	var array2d;
	
	// data
	let horizontal_walls = [[],[]];
	let vertical_walls = [[0]];
	let grid_width = horizontal_walls[0].length;
	let grid_height = vertical_walls.length;
	
	
	function setWall(x, y, is_horizontal, value) {
		if (is_horizontal)
			setHorizontalWall(x, y, value);
		else
			setVerticalWall(x, y, value);
	}
	
	function setHorizontalWall(x, y, value) {
		horizontal_walls[y][x] = value;
		for (f of on_setWall)
			f(x, y, true, value);
	}
	
	function setVerticalWall(x, y, value) {
		vertical_walls[y][x] = value;
		for (f of on_setWall)
			f(x, y, false, value);
	}
	
	function setSize(width, height) {
		horizontal_walls = array2d.createArray(width, height+1, 0)
		vertical_walls = array2d.createArray(width+1, height, 0)
		emitAlterSize(0, width-grid_width, 0, height-grid_height);
		grid_width = width;
		grid_height = height;
		emitResize();
	}
	
	function alterSize(left, right, up, down) {
		// horizontal_walls and vertical_walls have a different shape so we need to check their minimums first
		if (horizontal_walls[0].length+left+right < 1 || vertical_walls.length+up+down < 1)
			return false;
		// Make sure both return without errors to proceed
		if (array2d.alterSize(horizontal_walls, left, right, up, down, 0)
				&& array2d.alterSize(vertical_walls, left, right, up, down, 0)) {
			grid_width += left+right;
			grid_height += up+down;
			emitAlterSize(left, right, up, down);
			emitResize();
		}
	}
	
	function canMove(x, y, ox, oy) {
		// If the destination isnt inside the map, then false
		if (!(x+ox >= 0 && y+oy >= 0 && x+ox < grid_width && y+oy < grid_height))
			return false
		// If we are trying to move left/right
		if (ox != 0){
			// Make sure there isnt a wall there
			let oxmax = Math.max(0, ox)
			if (vertical_walls[y][x+oxmax] != 0)
				return false;
			// Check diagonal
			if (oy != 0){
				let oymax = Math.max(0, oy)
				if (horizontal_walls[y+oymax][x+ox] != 0)
					return false;
			}
		}
		// If we are trying to move up/down
		if (oy != 0){
			// Make sure there isnt a wall there
			let oymax = Math.max(0, oy)
			if (horizontal_walls[y+oymax][x] != 0)
				return false;
			// Check diagonal
			if (ox != 0){
				// Make sure there isnt a wall there
				let oxmax = Math.max(0, ox)
				if (vertical_walls[y+oy][x+oxmax] != 0)
					return false;
			}
		}
		return true
	}
	
	function emitResize() {
		for (f of on_resize)
			f(grid_width, grid_height);
	}
	
	function emitAlterSize(left, right, up, down) {
		for (f of on_alterSize)
			f(left, right, up, down);
	}
	
	return {
		constructor:this.constructor,
		
		// events
		on_resize:on_resize,
		on_alterSize:on_alterSize,
		on_setWall:on_setWall,
		
		// variables
		get horizontal_walls(){ return horizontal_walls },
		set horizontal_walls(v){ throw "Variable is read only" },
		get vertical_walls(){ return vertical_walls },
		set vertical_walls(v){ throw "Variable is read only" },
		get grid_width(){ return grid_width },
		set grid_width(v){ grid_width = v },
		get grid_height(){ return grid_height },
		set grid_height(v){ grid_height = v },
		
		// methods
		canMove:canMove,
		setWall:setWall,
		alterSize:alterSize,
		setSize:setSize,
		emitResize:emitResize,
		emitAlterSize:emitAlterSize
	}
};