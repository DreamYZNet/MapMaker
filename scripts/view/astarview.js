
let AstarView = function () {
	
	// elements
	let c_path;
	let ctx_path;
	
	// display
	let square_size;
	let grid_width;
	let grid_height;
	
	// state
	let current_id = 0; // prevents multiple simultaneous draws
	
	
	(function bindElements() {
		c_path = document.getElementById("c_path");
		ctx_path = c_path.getContext("2d");
	})();
	
	//Resize canvas, and redraw (as canvas becomes empty when resized)
	function resize(grid_width_, grid_height_) {
		grid_width = grid_width_;
		grid_height = grid_height_;
		
		c_path.width = grid_width*square_size
		c_path.height = grid_height*square_size
		
		// set top margin to overlap the canvases
		c_path.style.marginTop = -grid_height*square_size+"px";
	}
	
	function drawTile(tile, is_old) {
		if (is_old)
			ctx_path.fillStyle = "rgba(0, 0, 255, 0.3)";
		else
			ctx_path.fillStyle = "rgba(0, 255, 255, 0.3)";
		ctx_path.fillRect(tile.x*square_size, tile.y*square_size, square_size, square_size);
	}
	
	async function draw({start = null, end = null, path_tiles = null, old_tiles = null, new_tiles = null, animate_path = false, speed = 1}) {
		current_id++;
		let running_id = current_id;
		if (old_tiles)
			for (tile of old_tiles) {
				ctx_path.fillStyle = "rgba(0, 0, 255, 0.3)";
				ctx_path.fillRect(tile.x*square_size, tile.y*square_size, square_size, square_size);
			}
		if (new_tiles)
			for (tile of new_tiles) {
				ctx_path.fillStyle = "rgba(0, 255, 255, 0.3)";
				ctx_path.fillRect(tile.x*square_size, tile.y*square_size, square_size, square_size);
			}
		if (start) {
			ctx_path.fillStyle = "rgba(255, 255, 0, 1)";
			ctx_path.fillRect(start.x*square_size, start.y*square_size, square_size, square_size);
		}
		if (end) {
			ctx_path.fillStyle = "rgba(255, 255, 0, 1)";
			ctx_path.fillRect(end.x*square_size, end.y*square_size, square_size, square_size);
		}
		if (path_tiles) {
			let last = path_tiles[0]
			ctx_path.beginPath(); 
			ctx_path.moveTo(last.x*square_size+(square_size/2), last.y*square_size+(square_size/2));//+(square_size/2)
			for (let i = 1; i < path_tiles.length; i++) {
				if (running_id != current_id) {
					clear();
					return;
				}
				let tile = path_tiles[i]
				ctx_path.lineTo(tile.x*square_size+(square_size/2), tile.y*square_size+(square_size/2));
				ctx_path.lineWidth = square_size/5;
				ctx_path.strokeStyle = '#ff0000';
				//ctx_path.lineCap = 'round';
				last = tile
				ctx_path.stroke();
				if (animate_path) //imp should we add pathfind termination here?
					await new Promise(r => setTimeout(r, 20/speed));
			}
		}
	}
	
	function clear() {
		ctx_path.clearRect(0, 0, grid_width*square_size, grid_height*square_size);
	}
	
	return {
		constructor:this.constructor,
		
		c_path:c_path,
		ctx_path:ctx_path,
		get square_size(){ return square_size },
		set square_size(v){ square_size = v },
		
		resize:resize,
		draw:draw,
		drawTile:drawTile,
		clear:clear
	}
	
};