
let Astar = function({canMove, array2d, BinaryHeap}) {
	
	// events
	let on_step = [] //old_tiles new_tiles
	let on_finish = [] //path old_tiles new_tiles animate
	
	// dependencies
	var BinaryHeap;
	var array2d;
	var canMove; //func
	
	// If set to false the async function will terminate
	let pathfinding = false
	// Prevents multiple astars from running simutaneously
	let current_id = 0;
	
	// Maximum animation frames to skip before forcing a new draw
	let max_skippable_steps = 1000;
	let def_skippable_steps = 1;
	let skippable_steps = def_skippable_steps;
	let frame_ms = 10; // default frames to wait
	let halve_ms_count = 3000; // how many ms until we halve both frame_ms wait time and skippable_steps
	// If set to false the animation will terminate
	let animate_ = false;
	// A silly experimental feature thats not recommended to be turned on
	let phoenix_style = false;
	
	let start = {x:0, y:0};
	let end = {x:0, y:0};
	
	
	async function aStar(x1, y1, x2, y2, max_width, max_height, animate) { //imp swap list with binary heap
		
		// No sense in pathfinding to the starting location
		if (x1 == x2 && y1 == y2)
			return true;
		
		let algo_start_time = new Date();
		
		start.x = x1;
		start.y = y1;
		end.x = x2;
		end.y = y2;
		
		if (animate != null){
			animate_ = animate;
		}
		
		// If set to false the async function will terminate
		pathfinding = true
		
		// Prevent multiple of this function from running concurrently
		current_id += 1;
		let running_id = current_id;
		
		// Time stabilizing
		let step_start_time = new Date(); //refreshes each step
		let time_karma = 0;
		let anim_steps_skipped = 3;
		
		let draw_new_tiles = [];
		let draw_old_tiles = [];
		
		// Create a rectangular array encompassing the start and end coordinatates. (+1 inclusive, +1 eval room)
		let map = array2d.createArray(Math.max(3, Math.abs(x2-x1)+2), Math.max(3, Math.abs(y2-y1)+2));
		//let new_tiles = []
		let new_tiles_heap;
		
		// The strange feature that makes the algo undebatably worse (its fun to watch however)
		if (phoenix_style)
			new_tiles_heap = new BinaryHeap(true, "total");
		// Sort by the lower total, or if equal, by the closest tile to the destination
		else
			new_tiles_heap = new BinaryHeap(null, null, (better, worse) => {
				if (better["total"] != worse["total"])
					return better["total"] < worse["total"];
				else
					return better["to_dist"] < worse["to_dist"];
			});
		let old_tiles = []
		
		// Get the offset for the map
		let map_x
		let map_y
		if (x1-1 < x2)
			map_x = x1-1
		else
			map_x = x2
		if (y1-1 < y2)
			map_y = y1-1
		else
			map_y = y2
		
		// Create starting node
		let start_node = {x:x1, y:y1, from_dist:0, to_dist:null, total:null, parent:null, is_old:false}
		start_node.to_dist = find4AxisDistance(x1, y1, x2, y2)
		start_node.total = start_node.to_dist
		new_tiles_heap.insert(start_node)
		map[y1-map_y][x1-map_x] = start_node
		
		let count = 1;
		let time_out_count = -1;
		while(true) {
			
			// If there are no new tiles, abort
			if (new_tiles_heap.length == 0) {
				alert("No path found")
				return false
			}
			
			// Find tile with the lowest total value
			let cur = new_tiles_heap.popTop();
			// If tile has already been processed, look for another one (the alternative is deleting the duplicates)
			if (map[cur.y-map_y][cur.x-map_x].is_old)
				continue
			
			// If time out counter has been reached, abort
			if (time_out_count != -1 && count >= time_out_count) {
				alert("Process timed out")
				return false
			}
			
			// If a new astar process is running
			if (running_id != current_id) {
				return false
			}
			// If outside forces have set pathfinding to false
			if (pathfinding == false)
				return false
			
			// Emit to allow animating the process
			for (f of on_step)
				f(draw_old_tiles, draw_new_tiles);
			draw_old_tiles = [];
			draw_new_tiles = [];
			// Slowdown when animation is active
			if (animate_) {
				let end_time = new Date();
				let time_passed = end_time - step_start_time;
				
				let algo_time_passed = new Date() - algo_start_time;
				let wait_time = frame_ms / Math.pow(2, algo_time_passed/halve_ms_count); //wip technically this should be 0 on the first loop
				skippable_steps = def_skippable_steps * Math.pow(2, algo_time_passed/halve_ms_count);
				time_karma += wait_time - time_passed;
				
				step_start_time = new Date();
				if (time_karma > 0 || def_skippable_steps != -1 && (anim_steps_skipped >= skippable_steps || anim_steps_skipped >= max_skippable_steps)) {
					anim_steps_skipped = 0;
					await new Promise(r => setTimeout(r, time_karma) );
				}else{
					anim_steps_skipped++;
				}
			}
			
			// Evaluate all directions
			for (let ox = -1; ox <= 1; ox++) {
				for (let oy = -1; oy <= 1; oy++) {
					let dist = cur.from_dist
					
					// Diagonals have 14 distance, adjacent have 10, and staying in place is meaningless
					if (oy == 0 && ox == 0)
						continue
					else if (oy != 0 && ox != 0)
						dist += 14
					else
						dist += 10
					// Tiles that correspond to the next location
					let tile_x = cur.x+ox
					let tile_y = cur.y+oy
					
					// Check to make sure tile is within bounds (imp may be unnecessary)
					if (tile_x < 0 || tile_x >= max_width || tile_y < 0 || tile_y >= max_height)
						continue
					
					// Check if map needs to increase in size
					let expand = 20 // how many rows/columns to expand
					if (tile_x-map_x < 0) {
						let amount = Math.min(map_x, expand)
						if (array2d.alterSize(map, amount, 0, 0, 0))
							map_x -= amount
					}else if (tile_x-map_x >= map[0].length) {
						let distance_from_edge = max_width-map_x-map[0].length
						array2d.alterSize(map, 0, Math.min(distance_from_edge, expand), 0, 0)
					}if (tile_y-map_y < 0) {
						let amount = Math.min(map_y, expand)
						if (array2d.alterSize(map, 0, 0, amount, 0))
							map_y -= amount
					}else if (tile_y-map_y >= map.length) {
						let distance_from_edge = max_height-map_y-map.length
						array2d.alterSize(map, 0, 0, 0, Math.min(distance_from_edge, expand))
					}
					
					//if spot hasnt been checked before, or it has but it hasnt completed yet and its from_dist is too big 
					let tenant = map[tile_y-map_y][tile_x-map_x]
					if (tenant == null || tenant.from_dist > dist && !tenant.is_old) {
						if (canMove(cur.x, cur.y, ox, oy)) {
							
							// If we move to the destination we win
							if (tile_x == x2 && tile_y == y2){
								console.log("Astar passes: " + count + " | Milliseconds: " + (new Date() - algo_start_time))
								//alert(stripTotals(map))
								
								// Compose the full path
								let path = [{x:tile_x, y:tile_y}]
								let parent = cur
								while(parent != null) {
									path.unshift({x:parent.x, y:parent.y})
									parent = parent.parent
								}
								for (f of on_finish)
									f(path, old_tiles, new_tiles_heap.toArray())
									//drawPathMap(path, old_tiles, new_tiles, animate)
								return path
							}
							// Create the new tile
							let tile = {x: tile_x, y: tile_y, from_dist: dist, to_dist: null, total: null, parent: cur, is_old:false}
							tile.to_dist = find4AxisDistance(tile.x, tile.y, x2, y2)
							tile.total = tile.from_dist + tile.to_dist
							
							// If tile is new and should be drawn
							if (!tenant) //tenant is true when there is a duplicate somewhere
								draw_new_tiles.push(tile);
							// Make sure there are no 2 tiles sharing a spot (turn on/off as you like)
							//if (tenant) //if true there is a duplicate somewhere
								//new_tiles_heap.pop(new_tiles_heap.find(tenant));
							
							// Add tile to map and list
							new_tiles_heap.insert(tile);
							map[tile.y-map_y][tile.x-map_x] = tile
							
						}
					}
				}
			}
			// Move the current evaluated tile to old_tiles
			cur.is_old = true;
			old_tiles.push(cur)
			draw_old_tiles.push(cur)
			count += 1;
		}
	}
	
	function stripTotals(map, x2, y2) {
		let str = ""
		for (let y = 0; y < map.length; y++){
			for (let x = 0; x < map[0].length; x++){
				if (x == x2 && y == y2)
					str += "XX|"
				else if (map[y][x] == null)
					str += "___|"
				else
					str += map[y][x].total+"|"
			}
			str += "\n"
		}
		return str
	}
	

	function find4AxisDistance(x1, y1, x2, y2) {
		let abs_x = Math.abs(x2-x1) 
		let abs_y = Math.abs(y2-y1)
		// adjacent distance
		let distance = Math.abs(abs_x-abs_y)*10
		// diagonal distance
		if (abs_y < abs_x) {
			distance += abs_y*14
		}else{
			distance += abs_x*14
		}
		return distance
	}
	
	// While this is cool, its totally depracted in the algo in favor of binary heaps
	function findLowestElements (arr, prop = [], withIndex = false) {
		if (prop == null) prop = []
		let prop_len = prop.length
		let lowest = arr[0];
		let lowest_val = prop_len == 0 ? lowest : prop_len == 1 ? lowest[prop[0]] : prop_len == 2 ? lowest[prop[0]][prop[1]] :null;
		let elements = []
		for (let i = 0; i < arr.length; i++) {
			let e = arr[i]
			let e_val = prop_len == 0 ? e : prop_len == 1 ? e[prop[0]] : prop_len == 2 ? e[prop[0]][prop[1]] :null;
			// if we find a lower value
			if (e_val < lowest_val) {
				lowest = e
				// lowest_val updates when lowest updates
				lowest_val = prop_len == 0 ? lowest : prop_len == 1 ? lowest[prop[0]] : prop_len == 2 ? lowest[prop[0]][prop[1]] :null;
				elements = []
			}
			// this runs if the last if is successfull as well
			if (e_val == lowest_val){
				if (withIndex)
					elements.push({element:e, index:i})
				else
					elements.push(e)
			}
		}
		return elements;
	}
	
	return {
		constructor:this.constructor,
		
		on_step:on_step,
		on_finish:on_finish,
		
		get pathfinding(){ return pathfinding },
		set pathfinding(v){ pathfinding = v },
		get animate(){ return animate_ },
		set animate(v){ animate_ = v },
		get start(){ return start },
		set start(v){ start = v },
		get end(){ return end },
		set end(v){ end = v },
		
		aStar:aStar
	}
};