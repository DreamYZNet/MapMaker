
let GridSelector = function({square_size, wall_width, wall_length}) {
	
	// events
	let on_modeSwitch = [];
	
	// elements
	let screen = null; //top layer to detect mouse
	let svg;
	let markers = [];
	
	// display properties
	var square_size;
	let grid_width;
	let grid_height;
	
	// selection modes
	let SELECT_TYPE = {BOX: 0, WALL:1, CONNECT:2, COORDINATE:3}
	let custom_modes = new Map();
	
	// state
	let select = {x:-1, y:-1, horizontal:false, mode:null}
	let prev_selects = []
	let mouse_down = false;

	// selection properties
	let wall_select_width = square_size/2; //even or not even?
	let wall_select_length = square_size-wall_select_width;
	let wall_marker_width;
	let wall_marker_length;
	
	
	(function bindElements() {
		screen = document.getElementById("graphics");
		svg = document.getElementById("svg");
		markers = [document.getElementById("marker2")];
	})();
	
	function resetSelect() {
		select.x = -1;
		select.y = -1;
		select.horizontal = false;
		select.mode = null;
	}
	
	// Add a custom mode to be retrieved via key {type(select_type), size}
	function addCustomMode(key, mode) {
		// on_select & on_deselect events: x, y, wall_select_horizontal
		mode = Object.assign({
			type:SELECT_TYPE.BOX, 
			width:1, 
			height:1, 
			reset_on_up:false, // reset on letgo
			select_on_drag:false, // clicking and moving mouse causes more "clicks"
			select_on_up:false, 
			selections:1, 
			on_select:[], // both down and move left click
			//on_select_down:[],
			on_select_up:[],
			on_select_drag:[],
			on_deselect:[], // both down and move right click
			//on_deselect_down:[]
			on_deselect_up:[],
			on_deselect_drag:[],
		},mode);
		custom_modes.set(key, mode);
	}
	function getCustomMode(key) {
		return custom_modes.get(key);
	}
	function setCustomMode(key) {
		setSelectMode(getCustomMode(key));
	}
	function setSelectMode(mode) {
		if (select.mode != mode) {
			select.mode = mode;
			empty();
			for (f of on_modeSwitch)
				f(mode);
		}
	}
	
	function clearMarker() {
		setAttributes(markers[0], {'x':0, 'y':0, 'width':0, 'height':0, 'fill':"#c00"});
	}
	function empty() {
		prev_selects = [];
		for (let i = 1; i < markers.length; i++)
			markers[i].remove();
		markers = [markers[0]]
	}

	function mouseDown(event, mouse_button_id) {
		//alert(event.buttons)//1 2 //alert(event.button)// 0 2 //alert(event.which)//  1 3
		mouse_down = mouse_button_id || event.buttons;
		if (validateSelection() && (mouse_down == 1 || mouse_down == 2)) {
			// If we have not done every selection yet
			let selections_so_far = prev_selects.length+1;
			if ((select.mode.selections||1) > selections_so_far) {
				// Copy current select into prev_selects
				let prev_select = Object.assign({}, select);
				prev_selects.push(prev_select);
				// Copy marker to keep it on screen
				let parent = markers[0].parentElement
				let new_marker = markers[0].cloneNode(true);
				markers.unshift(new_marker);
				parent.appendChild(new_marker);
			// If final selection
			}else{
				// emit event
				if (select.mode.type == SELECT_TYPE.CONNECT) {
					if (mouse_down == 1)
						emitConnectSelect(select, prev_selects[0], true);
					else if (mouse_down == 2)
						emitConnectSelect(select, prev_selects[0], false);
					empty();
					mouseDown(event, mouse_button_id);
				// If non specific select type
				}else{
					let send = getSelects();
					if (mouse_down == 1) {
						for (f of select.mode.on_select)
							f(send);
					}else if (mouse_down == 2) {
						for (f of select.mode.on_deselect){
							f(send);
						}
					}
					empty();
				}
			}
		}
	}
	
	function getSelects() {
		return prev_selects.length == 0 ? select : prev_selects.concat([select]);
	}
	
	function mouseUp(event, button) {
		//let send = getSelects();
		if (!button) {
			button = event.which;
			if (button == 2) button = 3;
			else if (button == 3) button = 2;
		}
		//if (button == 1 || button == 2) {
		if (mouse_down == button && select.mode) {
			// if select_on_up then emit button down events
			if (select.mode.select_on_up) {
				mouseDown(event, button);
			}
			// emit button up events
			if (button == 1) {
				for (f of select.mode.on_select_up)
					f(select);
			}
			if (button == 2) {
				for (f of select.mode.on_deselect_up)
					f(select);
			}
			if (select.mode.reset_on_up)
				empty();
			// turn mouse down off
			mouse_down = null;
		}
		
	}
	
	function mouseMove(event) {
		if (!select.mode) return;
		let prev_x = select.x; // wip i recommend we reset these every time we change select mode
		let prev_y = select.y;
		let prev_horizontal = select.horizontal;
		// Find x and y on canvas
		let pos = getPositionInsideElement(screen, event);
		clearMarker();
		if (select.mode.type == SELECT_TYPE.BOX) { //wip turn this into a switch
			selectBox(pos.x, pos.y);
			// Draw box marker
			if (validateSelection()) {
				setAttributes(markers[0], {
					x: select.x*square_size, 
					y: select.y*square_size, 
					width: select.mode.width*square_size, 
					height: select.mode.height*square_size
				})
			}
		}else if (select.mode.type == SELECT_TYPE.WALL) {
			// Determine which wall is being selected
			selectWall(pos.x, pos.y);
			// Draw wall marker
			if (validateSelection()) {
				setAttributes(markers[0], getWallRect(select.x, select.y, select.horizontal, square_size, wall_marker_width, wall_marker_length));
			}
		}else if (select.mode.type == SELECT_TYPE.CONNECT) {
			// Determine which wall is being selected
			selectBox(pos.x, pos.y, true);
			// Draw box marker
			if (validateSelection()) {
				setAttributes(markers[0], {
					x: select.x*square_size-wall_marker_width/2, 
					y: select.y*square_size-wall_marker_width/2, 
					width: wall_marker_width, 
					height: wall_marker_width})
			}
		}else if (select.mode.type == SELECT_TYPE.COORDINATE) {
			select.x = pos.x;
			select.y = pos.y;
		}
		$('#debug_text').html("Selection: ("+select.x+", "+select.y+") | Position: ("+pos.x+", "+pos.y+")");
		
		// Execute mouse events if its being held
		if (mouse_down) {
			// Only if something changed
			if (prev_x != select.x || prev_y != select.y || prev_horizontal != select.horizontal) {
				// Emit mouse drag
				if (mouse_down == 1)
					for (f of select.mode.on_select_drag)
						f(select)
				else if (mouse_down == 2)
					for (f of select.mode.on_deselect_drag)
						f(select)
				// Execute mouse down
				if (select.mode.select_on_drag)
					mouseDown(event)
			}
		}
	}
	
	function mouseLeave(event) {
		clearMarker();
	}
	
	function selectBox(x, y, corner = false) {
		let box_width = select.mode.width || 1;
		let box_height = select.mode.height || 1;
		let extra_size = 0;
		if (corner) {
			x += square_size/2;
			y += square_size/2;
			extra_size = 1;
		}
		select.x = Math.floor((x/square_size)-((box_width-1)/2));
		select.y = Math.floor((y/square_size)-((box_height-1)/2));
		if (select.x < 0)
			select.x = 0;
		if (select.y < 0)
			select.y = 0;
		if (select.x + box_width > grid_width + extra_size)
			select.x = grid_width - box_width + extra_size;
		if (select.y + box_height > grid_height + extra_size)
			select.y = grid_height - box_height + extra_size;
	}
	
	// Determine which wall is at (x,y)
	function selectWall(x, y) {
		select.x = -1;
		select.y = -1;
		select.horizontal = false;
		
		// Check vertical, and if false, check horizontal
		if (!checkWall(x, y, false))
			checkWall(x, y, true)
	}
	
	function checkWall (x, y, check_horizontal = false){
		// If we're checking for horizontal instead, then swap the values
		if (check_horizontal) {
			let temp = x;
			x = y;
			y = temp;
		}
		// Adjust x so the wall starts from x.0
		let adj_x = x + wall_select_width/2;
		// If x is within the width of a possible selection
		if (adj_x%square_size < wall_select_width) { //treats them as even numbers i think
			// Adjust y so the wall starts from y.0
			let adj_y = y - (square_size-wall_select_length)/2;
			// If y is within the height of a possible selection
			if (adj_y%square_size < wall_select_length) {
				// Set x & y coordinates of the selection
				if (!check_horizontal) {
					select.x = Math.floor(adj_x/square_size);
					select.y = Math.floor(adj_y/square_size);
				}else{
					select.x = Math.floor(adj_y/square_size);
					select.y = Math.floor(adj_x/square_size);
				}
				// Set the selection orientation
				select.horizontal = check_horizontal;
				return true;
			}
		}
	}
	
	function emitConnectSelect(select1, select2, value = false) {
		let on_event = value ? select.mode.on_select : select.mode.on_deselect;
		let positions = findStraightPath(select1, select2);
		for (let i = 0; i < positions.length-1; i++) {
			let pos1 = positions[i];
			let pos2 = positions[i+1];
			if (pos1.x == pos2.x)
				for (f of on_event)
					f({horizontal: false, mode:select.mode, x: pos1.x, y: Math.min(pos1.y, pos2.y)});
			else if (pos1.y == pos2.y)
				for (f of on_event)
					f({horizontal: true, mode:select.mode, y: pos1.y, x: Math.min(pos1.x, pos2.x)});
		}
	}
	
	function findStraightPath(pos1, pos2) {
		pos1 = {x: pos1.x, y: pos1.y}; // clone
		let slope = (pos2.y - pos1.y) / (pos2.x - pos1.x);
		let abs_slope = Math.abs(slope);
		let y_inc = pos1.y < pos2.y ? 1 : -1;
		let x_inc = pos1.x < pos2.x ? 1 : -1;
		let positions = [{x: pos1.x, y: pos1.y}];
		// While we havent reached the destination
		while (pos1.x != pos2.x || pos1.y != pos2.y) {
			let new_slope = (pos2.y - pos1.y) / (pos2.x - pos1.x);
			// if new slope is taller then we need to move vertically
			if (Math.abs(new_slope) > abs_slope) {
				pos1.y += y_inc;
			}else if (Math.abs(new_slope) < abs_slope) {
				pos1.x += x_inc;
			}else{
				if (abs_slope > 1)
					pos1.y += y_inc;
				else
					pos1.x += x_inc;
			}
			positions.push({x: pos1.x, y: pos1.y})
		}
		return positions;
	}
	
	function checkAdjacent(pos1, pos2) {
		if ((pos1.x == pos2.x && Math.abs(pos1.y-pos2.y) == 1)
		|| (pos1.y == pos2.y && Math.abs(pos1.x-pos2.x) == 1))
			return true;
		return false;
	}

	//Resize canvas, and redraw (as canvas becomes empty when resized)
	function resize(grid_width_, grid_height_) {
		grid_width = grid_width_;
		grid_height = grid_height_;
		wall_marker_width = square_size*.4
		wall_marker_length = square_size+wall_marker_width
		wall_select_width = square_size/2;
		wall_select_length = square_size-wall_select_width;
		
		svg.setAttribute('width', grid_width*square_size);
		svg.setAttribute('height', grid_height*square_size);
		
		// set top margins to overlap the canvases
		svg.style.marginTop = -grid_height*square_size+"px";
	}
	
	//Get the rect of a wall, given its grid (x,y) location, such as 1,1 horizontal
	function getWallRect(x, y, horizontal, square_size, wall_width, wall_length) {
		if (horizontal)
			return {'x':x*square_size+(square_size-wall_length)/2, 'y':y*square_size-wall_width/2
			, 'width':wall_length, 'height':wall_width, 'fill':"#c00"}
		else
			return {'x':x*square_size-wall_width/2, 'y':y*square_size+(square_size-wall_length)/2
			, 'width':wall_width, 'height':wall_length, 'fill':"#c00"}
	}
	
	function validateSelection() {
		//return true
		return (select.x != -1 && select.y != -1);
	}
	
	return {
		constructor:this.constructor,
		
		on_modeSwitch:on_modeSwitch,
		
		// elements
		screen:screen,
		
		// variables
		get select_mode(){ return select.mode },
		set select_mode(v){ setSelectMode(v) },
		SELECT_TYPE:SELECT_TYPE,
		get square_size(){ return square_size },
		set square_size(v){ square_size = v },
		//get selections(){ return select.selections||1 },
		//set selections(v){ throw "This variable is read only." },
		//get select_size(){ return select.mode.width },
		//set select_size(v){ select.mode.width = v; select.mode.height = v; },
		
		// methods
		addCustomMode:addCustomMode,
		getCustomMode:getCustomMode,
		setCustomMode:setCustomMode,
		mouseDown:mouseDown,
		mouseUp:mouseUp,
		mouseMove:mouseMove,
		mouseLeave:mouseLeave,
		resize:resize,
	}
};