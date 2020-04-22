
let TokenDB = function() {
	
	// Unique to each map
	let id2path = [];
	
	let path2element = {};
	
	// promises (these will be undefined until loading initiates.)
	//(however we could choose make them promises and store their resolve to call it after loading)
	let prom_loadMapTokens = loadList(id2path);
	let prom_loadall;// = loadall(); // wip im not sure i like these
	
	
	function idToElement(id) {
		return pathToElement(id2path[id]);
	}
	
	function pathToElement(path) {
		let el = path2element[path];
		if (el)
			return el.cloneNode(true);
		return null;
	}
	
	function pathToID(path) {
		for (id in id2path)
			if (id2path[id] == path)
				return id;
		// Add path to id2path
		if (path2element[path] != null) {
			id2path.push(path);
			return id2path.length-1;
		}
		return null;
	}
	
	/*function getPath2Element() {
		let obj = {};
		for (path in path2element)
			obj[path] = pathToElement(path);
		return obj;
	}*/
	
	// Get a clone of the id2element object
	/*function getAll() {
		let obj = {};
		for (id in id2element)
			obj[id] = get(id);
		//alert(JSON.stringify(obj));
		return obj;
	}*/
	
	function loadall() {
		if (!prom_loadall)
			prom_loadall = loadList(tokenlist);//.then(loaded = true);
		return prom_loadall;
	}
	
	function loadList(list) {
		let load_promises = [];
		for (path of list)
			load_promises.push(load(path))
		return Promise.all(load_promises);
	}
	
	function load(path) {
		return new Promise((res,rej) => {
			if (path2element[path] != null)
				res(path2element[path]);
			$.ajax({
				url: 'icons/'+path,
				dataType: 'html',
				success: (data) => {
					// Create temporary div to access the new element
					let div = document.createElement('div');
					div.innerHTML = data;
					path2element[path] = div.firstChild;
					res(path2element[path]);
				}
			});
		});
	}
	
	return {
		constructor:this.constructor,
		
		get path2element() { 
			let obj = {};
			for (path in path2element)
				obj[path] = pathToElement(path);
			return obj;
		},
		get id2path() { return id2path },
		set id2path(v) { id2path = v },
		
		idToElement:idToElement,
		pathToElement:pathToElement,
		loadall:loadall,
		load:load,
		loadList:loadList,
		pathToID:pathToID,
	}
}