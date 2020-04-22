
let LightMap = function({map, array2d}) {
	
	// events
	let on_lightUp = []
	let on_drawAll = []
	
	// dependencies
	var array2d;
	var map;
	
	// data
	let light_map;
	let light_distance = 5;
	let changed = {};
	
	reset();
	
	
	function emitUpdate() {
		for (f of on_lightUp)
			f(changed);
	}
	function emitDrawAll() {
		for (f of on_drawAll)
			f(light_map);
	}
	
	function lightUp(x, y, distance = parseFloat(light_distance)) { //wip this is actually way slower somehow
		changed = {};
		let calculated = {};
		let bh = new BinaryHeap();
		bh.setMinHeap(false);
		bh.setKey("distance");
		let count = 0;
		let start_time = new Date();
		while (true) {
			count++;
			if (x >= 0 && y >= 0 && x < light_map[0].length && y < light_map.length) {
				calculated[y] = calculated[y] || {};
				if (calculated[y][x] == null) {
					calculated[y][x] = distance;
					if (light_map[y][x] < distance) { // wip actually if the map changes the light wont update correctly
						light_map[y][x] = distance;
						changed[y] = changed[y] || {};
						changed[y][x] = distance;
					}
					let new_distance = distance-1.414;
					if (distance > 1.414) {
						// diagonals
						lightUpDirection(x, y, -1, -1, new_distance, bh, calculated);
						lightUpDirection(x, y, 1, -1, new_distance, bh, calculated);
						lightUpDirection(x, y, -1, 1, new_distance, bh, calculated);
						lightUpDirection(x, y, 1, 1, new_distance, bh, calculated);
					}
					new_distance = distance-1;
					if (distance > 1) {
						// adjacent
						lightUpDirection(x, y, 0, -1, new_distance, bh, calculated);
						lightUpDirection(x, y, 0, 1, new_distance, bh, calculated);
						lightUpDirection(x, y, -1, 0, new_distance, bh, calculated);
						lightUpDirection(x, y, 1, 0, new_distance, bh, calculated);
					}
				}
			}
			if (bh.length == 0)
				break;
			let next_tile = bh.popTop();
			x = next_tile.x;
			y = next_tile.y;
			distance = next_tile.distance;
		}
		
		console.log("Lightup count: " + count + " | Milliseconds: " + (new Date() - start_time));
		for (key in changed) {
			emitUpdate();
			break;
		}
	}
	function lightUpDirection(x, y, ox, oy, new_distance, bh, calculated) {
		//if (light_map[y+oy][x+ox] < new_distance && map.canMove(x, y, ox, oy))
		if (!(calculated[y+oy] && calculated[y+oy][x+ox]) && map.canMove(x, y, ox, oy)) //sqrt of 2 is approx 1.414
			bh.insert({x:x+ox, y:y+oy, distance:new_distance});
	}
	
	function reset() {
		light_map = array2d.createArray(map.grid_width, map.grid_height, 0);
		emitDrawAll();
	}
	
	function fillLight() {
		light_map = array2d.createArray(map.grid_width, map.grid_height, 10);
		emitDrawAll();
	}
	
	function alterSize(left, right, up, down) {
		array2d.alterSize(light_map, left, right, up, down, 0);
	}
	
	function resize(width, height) {
		alterSize(0, width - light_map[0].length, 0, height - light_map.length);
	}
	
	return {
		constructor:this.constructor,
		
		// events
		on_lightUp:on_lightUp,
		on_drawAll:on_drawAll,
		
		// variables
		light_map:light_map,
		get light_map(){ return light_map },
		set light_map(v){ light_map = v; emitDrawAll(); },
		get light_distance(){ return light_distance },
		set light_distance(v){ light_distance = v },
		
		// methods
		lightUp:lightUp,
		fillLight:fillLight,
		reset:reset,
		alterSize:alterSize,
		resize:resize
	}
};