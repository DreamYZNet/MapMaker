
let TokenView = function({array2d:array2d}) {
	
	// elements
	let svg;
	
	// data
	let grid_width;
	let grid_height;
	let square_size;
	
	//let path = "https://dreamyz.net/notwp/mapmaker/";
	
	let token_element_map = [[]]; //array2d
	
	
	(function bindElements() {
		svg = document.getElementById("svg");
		
		/*let fs = require('fs'); //maybe just have a php script fetch a list of all icons
		let files = fs.readdirSync('icons/');
		alert(files)*/
		
	})();
	
	function draw(x, y, svg_element, size_mult) {
		svg_element.setAttribute('width', square_size*size_mult);
		svg_element.setAttribute('height', square_size*size_mult);
		svg_element.setAttribute('x', x*square_size);
		svg_element.setAttribute('y', y*square_size);
		
		// Replace already set elements
		clear(x, y);
		token_element_map[y][x] = [svg_element, size_mult];
		svg.appendChild(svg_element);
	}
	
	function clear(x, y) {
		if (x != undefined && y != undefined){
			if (token_element_map[y][x])
				token_element_map[y][x][0].remove();
			token_element_map[y][x] = undefined;
		}else if (x == null && y == null){
			console.log("Token view cleared entirely.");
			// Delete all elements
			for (row of token_element_map)
				for (el of row)
					if (el)
						el.remove();
			token_element_map = array2d.createArray(grid_width, grid_height);
		}
	}
	
	// Resize canvas
	function resize(width, height){
		alterSize(0, width - token_element_map[0].length, 0, height - token_element_map.length);
	}
	function alterSize(left=0, right=0, up=0, down=0) { //wip we should remove outted tokena from here
		// Clone token map to preserve it post alter size
		let cloned_token_map = array2d.copy(token_element_map);
		// If alteration is a success
		if (array2d.alterSize(token_element_map, left, right, up, down)) {
			grid_width = token_element_map[0].length;
			grid_height = token_element_map.length;
			// Check each element and alter their position, or delete them if they are out of bounds
			for (y in cloned_token_map) {
				y = parseInt(y);
				for (x in cloned_token_map[y]) {
					x = parseInt(x);
					let el = cloned_token_map[y][x];
					if (el) {
						let elx = (left+x)*square_size;
						let ely = (up+y)*square_size;
						if (elx >= 0 && elx < grid_width*square_size && ely >= 0 && ely < grid_height*square_size) { //wip wouldnt it be better to use the array?
							el[0].setAttribute('x', elx);
							el[0].setAttribute('y', ely);
							el[0].setAttribute('width', el[1]*square_size);
							el[0].setAttribute('height', el[1]*square_size);
						}else{
							el[0].remove(); // wip doesnt this only remove the svg, not from the array?
						}
					}
				}
			}
		}
	}
	
	return {
		constructor:this.constructor,
		
		// variables
		get square_size(){ return square_size },
		set square_size(v){ square_size = v },
		
		resize:resize,
		alterSize:alterSize,
		draw:draw,
		clear:clear,
	}
}