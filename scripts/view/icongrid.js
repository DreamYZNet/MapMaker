
let IconGrid = function() {
	
	// events
	let on_select = [];
	
	// element div
	let container;
	
	// list of all elements to be put inside container
	let elements = [];
	
	// promises
	let prom_load;
	
	(function bindElements() {
		container = document.getElementById("token_grid");
	})();
	
	function add(path2element) {
		if (!prom_load) {
			prom_load = new Promise((res,rej) => {
				for (path in path2element) {
					let element = path2element[path];
					// Prepare element
					element.id = path;
					element.style.width = '50px';
					element.addEventListener('click', (e) => { select(e.currentTarget.id) });
					let div = document.createElement('div');
					div.style.margin = '5px';
					div.style.border = '2px solid #aaaaaa';
					div.style.borderRadius = '10px';
					div.style.float = 'left';
					div.appendChild(element);
					elements.push(div);
					container.appendChild(div);
				}
				res();
			});
		}
		return prom_load;
	}
	
	function select(path) {
		for (f of on_select)
			f(path);
	}
	
	return {
		constructor:this.constructor,
		
		on_select:on_select,
		
		//loaded:loaded,
		
		add:add
	}
}