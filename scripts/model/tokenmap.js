
let TokenMap = function({array2d:array2d}) {
	
	// events
	let on_set = []; //x y path
	let on_unset = []; //x y
	
	// data
	let token_map = [[]]; // 2darray // [id, size, color]
	
	// state
	let token_id = 0;
	let token_size = 1;
	
	
	function set(x, y, id = token_id, size = token_size) {
		if (isNaN(parseInt(id)))
			return;// unset(x, y);//consider not unsetting
		let token = [id];
		if (size)
			token.push(size);
		else
			size = 1;
		if (y+size > token_map.length || x+size > token_map[0].length)
			return;
		for (let oy = 0; oy < size; oy++)
			for (let ox = 0; ox < size; ox++) {
				if (token_map[y+oy][x+ox])
					unset(x+ox, y+oy);
				token_map[y+oy][x+ox] = token;
			}
		emitSet(x, y, id, size);
	}
	
	function unset(x, y) {
		let token = token_map[y][x];
		if (token) {
			if (token[1] > 1) {
				let rect = getTokenRect(x, y);
				for (let oy = 0; oy < rect.height; oy++)
					for (let ox = 0; ox < rect.width; ox++) {
						try{
						token_map[rect.y+oy][rect.x+ox] = undefined;}catch{alert(token_map); alert(token_map[rect.y+oy]); alert(rect.y+oy)}
					}
				emitUnset(rect.x, rect.y);
			}else{
				token_map[y][x] = undefined;
				emitUnset(x, y);
			}
		}
	}
	
	function clear() {//wip doing it all at once would be faster
		//token_map = array2d.createArray(token_map[0].length, token_map.length);
		for (y in token_map)
			for (x in token_map[y])
				unset(parseInt(x), parseInt(y));
	}
	
	function getTokenRect(x, y) {
		let token = token_map[y][x];
		while(x > 0 && token_map[y][x-1] == token)
			x--;
		while(y > 0 && token_map[y-1][x] == token)
			y--;
		let size = token[1] ? token[1] : 1;
		return {x:x, y:y, width:size, height:size};
	}
	
	function resize(width, height) {//wip account for size
		array2d.alterSize(token_map, 0, width - token_map[0].length, 0, height - token_map.length);
	}
	function alterSize(left, right, up, down) {
		array2d.alterSize(token_map, left, right, up, down);
	}
	
	function select(id) {
		token_id = id;
	}
	
	function getCleanTokenMap() {
		let copy_map = array2d.copy(token_map);
		for (y in copy_map) {
			y = parseInt(y);
			for (x in copy_map[y]) {
				x = parseInt(x);
				if (copy_map[y][x] && copy_map[y][x][1] > 1) {
					// Remove all but base (top leftmost)
					let rect = getTokenRect(x, y);
					for (let oy = 0; oy < rect.height; oy++) {
						for (let ox = 0; ox < rect.width; ox++) {
							if (oy != 0 || ox != 0) {
								copy_map[rect.y+oy][rect.x+ox] = undefined;
							}
						}
					}
				}
			}
		}
		return copy_map;
	}
	
	function emitSet(x, y, id, size) {
		for (f of on_set)
			f(x, y, id, size);
	}
	
	function emitUnset(x, y) {
		for (f of on_unset)
			f(x, y);
	}
	
	return {
		constructor:this.constructor,
		
		on_set:on_set,
		on_unset:on_unset,
		
		get token_map(){ return token_map },
		set token_map(v){ token_map = v },
		get token_size(){ return token_size },
		set token_size(v){ token_size = v },
		
		set:set,
		unset:unset,
		clear:clear,
		resize:resize,
		alterSize:alterSize,
		select:select,
		getCleanTokenMap:getCleanTokenMap,
	}
}