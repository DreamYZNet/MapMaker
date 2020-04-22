
let MapFile = function({map_name, map, lightMap, tokenMap, tokenDB, array2d}) {
	
	let on_loadStart = [];
	let on_loadSuccess = [];
	let on_loadFailure = [];
	let on_rendering = [];
	let on_rendered = [];
	
	// dependencies
	var map;
	var lightMap;
	var tokenMap;
	var tokenDB;
	var array2d;
	
	//let path = window.location.hostname+"/notwp/mapmaker/";
	let path = "https://dreamyz.net/notwp/mapmaker/php/";
	
	// state
	var map_name //"pathfinding";
	let owner_id = null;
	let anyone_can_edit = false;
	
	let saving = false;
	let loading = false;
	let saveas_name = map_name;
	
	
	function newMap (confirmation = true, map_name = '') {
		if (confirmation == false || confirm("You will lose all unsaved progress.\nCreate new map?"))
			window.location.href = window.location.href.replace(/\/[^\/]*$/, '/'+map_name);
	}
	
	function loadFile() {
		if (!(window.File && window.FileReader && window.FileList && window.Blob)) {
			alert("File reading not supported on this device.");
			return;
		}
		let readFile = function(e) {
			let file = e.target.files[0];
			if (!file)
				return;
			let reader = new FileReader();
			reader.onload = function(e) {
				let data = JSON.parse(e.target.result);
				importData(data);
			}
			reader.readAsText(file);
		}
		let browse = document.createElement("input");
		browse.type = 'file';
		//browse.style.display='none'
		browse.onchange = readFile;
		//browse.func=func;
		//document.body.appendChild(browse)
		browse.click();
	}
	
	function saveFile() {
		let data = getData();
		let blob = new Blob([JSON.stringify(data,null,0)], { type: 'application/json' });//text/plain
		let file = document.createElement('a');
		file.download = data.name+".json";
		file.href = URL.createObjectURL(blob);
		//anchor.href = (window.webkitURL || window.URL).createObjectURL(blob);
		//anchor.dataset.downloadurl = ['text/plain', anchor.download, anchor.href].join(':');
		file.click();
	}
	
	function getData() {
		return { 
			name: name, 
			width: map.grid_width, 
			height: map.grid_height, 
			token_paths: tokenDB.id2path.length == 0 ? null : tokenDB.id2path,
			vertical_walls: map.vertical_walls, 
			horizontal_walls: map.horizontal_walls, 
			light_map: lightMap.light_map,
			token_map: tokenMap.getCleanTokenMap(),
		}
	}
	
	function importData(data, success_text = "Loading successfull") {
		for (f of on_rendering)
			f();
		// Size
		map.setSize(parseInt(data.width), parseInt(data.height))
		// Lightmaps
		if (!data.hasOwnProperty('light_map') || data.light_map == null){
			lightMap.reset();
		}else{
			array2d.numberfy(data.light_map);
			lightMap.light_map = data.light_map;
		}
		// Vertical walls
		//map.vertical_walls = data.vertical_walls;
		for (let y = 0; y < data.vertical_walls.length; y++) {
			for (let x = 0; x < data.vertical_walls[y].length; x++) {
				if (data.vertical_walls[y][x] == 1)
					map.setWall(parseInt(x), parseInt(y), false, parseInt(data.vertical_walls[y][x]));
			}
		}
		// Horizontal walls
		//map.horizontal_walls = data.horizontal_walls;
		for (let y = 0; y < data.horizontal_walls.length; y++) {
			for (let x = 0; x < data.horizontal_walls[y].length; x++) {
				if (data.horizontal_walls[y][x] == 1)
					map.setWall(parseInt(x), parseInt(y), true, parseInt(data.horizontal_walls[y][x]));
			}
		}
		// Token id to path
		tokenDB.id2path = data.token_paths || [];
		tokenDB.loadList(tokenDB.id2path).then(()=>{
			// Token maps
			tokenMap.clear();
			for (y in data.token_map) {
				for (x in data.token_map[y]) {
					//if (parseInt(data.token_map[y][x]) != parseInt(data.token_map[y][x][0])){
					/*if (parseInt(data.token_map[y][x][0]) == 0){
						alertj(parseInt(data.token_map[y][x]))
						alertj(parseInt(data.token_map[y][x][0]))
					}*/
					if (data.token_map[y][x])
						tokenMap.set(parseInt(x), parseInt(y), parseInt(data.token_map[y][x][0]), parseInt(data.token_map[y][x][1]));
				}
			}
			
			if (
				array2d.validate(lightMap.light_map, data.width, data.height)
				&& array2d.validate(map.vertical_walls, parseInt(data.width)+1, data.height)
				&& array2d.validate(map.horizontal_walls, data.width, parseInt(data.height)+1)
				&& array2d.validate(tokenMap.token_map, data.width, data.height)
			){
				for (f of on_rendered)
					f();
				if (success_text)
					alert(success_text);
			}
		});
		//resize();
		/*for(key in data){ //each key refers to a different row
			alert(key+":\n"+JSON.stringify(data[key], null, 4))
			for(key2 in data[key]){
				alert("2nd floor:\n"+key2+":\n"+JSON.stringify(data[key][key2], null, 4))
			}
		}*///helpful data checking loop
	}
	
	function saveas(){ return save(true); }
	function save(force_name_prompt = false){
		if (saving) return false;
		
		let overwrite = false;
		// Show prompt if name hasnt been set, or if "save as" was clicked
		if (map_name == null || force_name_prompt) {
			saveas_name = prompt("Give your map a name!");
			// If user hits cancel
			if (saveas_name == null)
				return false;
			// Allow overwrite if saving as current name
			if (saveas_name == map_name)
				overwrite = true;
		}else{
			overwrite = true;
			saveas_name = map_name;
		}
		
		let data = getData();
		data.overwrite = overwrite;
		data.name = saveas_name;
		
		let ajax = {
			type: 'POST',
			url: path+"savemap.php",
			//contentType: 'application/json',
			data: data, 
			dataType: null, //response type
			
			success: function (data) {
				try{
					JSON.parse(data);
					alert("Saved successfully!");
					if (map_name != saveas_name)
						newMap(false, saveas_name);
				}catch(e){
					ajax.error(data)
				}
			},
			
			error: function(data) {
				//console.log(JSON.stringify(data, null, 4));
				if (data.responseText == "file not new") {
					alert("This map name already exists! Please choose another.");
					saveas();
				}else if (data.responseText == "insufficient privilidges to overwrite data") {
					alert("You are not authorized to edit this map!");
				}else{
					console.log(data.responseText);
					console.log(data);
					alert("Save error:\n"+(data.responseText||data));//JSON.stringify(data, null, 4)); //whitelist/func: null, add 4 spaces
				}
			},
			
			complete: function(data) {
				saving = false;
			}
		};
		$.ajax(ajax);
	}
	
	function load(success_text = "Loading successfull"){
		if (loading) return false;
		// If load is somehow called without map_name being set
		if (map_name == null) {
			alert("The map name has not yet been set.");
			return false;
		}
		loading = true;
		for (f of on_loadStart)
			f();
		$.ajax({
			type: 'GET',
			url: path+"loadmap.php",
			data: {name: map_name},
			dataType: 'json', //response type
			cache: false,
			
			success: function (data) {
				console.log("Map data loaded from database.");
				anyone_can_edit = data.anyone_can_edit || false;
				owner_id = data.owner_id;
				for (f of on_loadSuccess)
					f();
				importData(data, success_text);
			},
			
			// If the map does not exist
			error: function(data) {
				for (f of on_loadFailure)
					f();
				console.log("Load error:\n"+JSON.stringify(data, null, 4)); //whitelist/func: null, add 4 spaces
				if (data.status == 200) {
					map_name = null;
					alert("This map does not exist.");
					// redirect
					newMap(false);
				}else{
					alert("Error connecting to database.");
				}
				return false;
			},
			
			complete: function(data) {
				loading = false;
			}
		});
	}
	
	return {
		constructor:this.constructor,
		
		on_loadStart:on_loadStart,
		on_loadSuccess:on_loadSuccess,
		on_loadFailure:on_loadFailure,
		on_rendering:on_rendering,
		on_rendered:on_rendered,
		
		get name(){ return map_name },
		set name(v){ map_name = v },
		get owner_id(){ return owner_id },
		set owner_id(v){ owner_id = v },
		get anyone_can_edit(){ return anyone_can_edit },
		set anyone_can_edit(v){ throw "Variable is read only" },
		
		newMap:newMap,
		saveas:saveas,
		save:save,
		load:load,
		saveFile:saveFile,
		loadFile:loadFile
	}
};