/*todo list

-code refactoring
-return object
in general go over public vars and methods (deleting them if possible)
every public var access should be an internal getter and setter and be modifiable, 
  for readonly, use functions, or throw an error in the setter NO EXCEPTIONS
  (essentially there should never be a situation where the developer (thats you)
    believes they are modifying the value of a variable, when in fact they are not) (endless debugging)
decide whether to use spaces after columns in return objects or not (i recommend yes just because thats the standard)
-function
order functions to an order that makes sense
reduce public functions
go through all files searching for 'wip' or 'imp' and finishing it
clean up heavily commented code
(make access of sensitive variables more safe for saving and loading)
make classes more independent by removing stuff like element bindings, or better yet, having them create them in the first place

-small but important
turn map into an object instead of array to save space and bandwidth
turn lightmap also into object. dark tiles are empty. however fill light should turn off the entire data
tokens should have categories
dragging with touch doesnt respect select_on_drag
the "loading..." popup should freeze the program for its duration
split style and js into files

-ui
turns out the software doesnt look that great on mobile afterall
(make everything look nicer)

-security
php sessions & passwords: disable editing with wrong pass
disable import export json if locked by pass
sanitize hacking in invalid variables (eg. custom svg path names)

~map features
add doors and windows (id have to draw them somehow)
add smart auto loading (every 5 or 10 seconds)

~show off extras
add a chat tab
add a feedback tab

-game mode
create a player character that can move etc (and how much light the player gives off)
add player move distance and dm next turn button

~neat but maybe later
maybe combine the two types of wall selection modes for a nicer experience (this sounds easy actually so lets try it)
make pinch zoom not super slow (in other words make zooming not redraw every single thing each time or something)
maybe get the connect mode to show a line to cursor
make dragging pathfinder not work or give it the immediate pathfind functionality
reduce token paths when saving if the token path isnt even used in the token map
add preset light sources (that carry through blackout resets)(would they be extinguishable?)(dynamic lighting?)
optimize eraser
make lightmap be 0 to 1, not to 10;

~i dont really care about these
add rooms (for room specific behaviour)
consider adding a timeout to a* using promises
blackout controls (turn on/off for player)
play mode and edit mode
estimated time... 378 days

done but could be relevant later on:
(fix large map sizes)(fixed but could become a problem if we try to add side bars or any of the sort)

*/

// If name is null, then default. If name is 'new', then null (for new map).
let default_name = "house";//"pathfinding";
map_name = map_name || default_name;
if (map_name == 'new')
	map_name = null;

let MapMaker = (function () {

	//window.onload = init;
	$(init);
	
	// misc
	let array2d
	
	// models
	let map
	let lightMap
	let file
	let pathfinder
	
	// views
	let mapView
	let lightMapView
	let pathfinderView
	let gridSelector
	let scrollDrag
	
	function init() { //alert("src: "+$(document).currentScript.src);
		// helper functions
		array2d = new Array2D();
		
		// models
		map = disallowUndefinedProperties( new StageMap({array2d:array2d}) );
		lightMap = disallowUndefinedProperties( new LightMap({map:map, array2d:array2d}) );
		tokenMap = disallowUndefinedProperties( new TokenMap({array2d:array2d}) );
		tokenDB = disallowUndefinedProperties( new TokenDB() );
		file = disallowUndefinedProperties( new MapFile({map_name:map_name, map:map, lightMap:lightMap, tokenMap:tokenMap, tokenDB:tokenDB, array2d:array2d}) );
		login = disallowUndefinedProperties( new Login() );
		pathfinder = disallowUndefinedProperties( new Astar({canMove:map.canMove, array2d:array2d, BinaryHeap:BinaryHeap}) );
		
		// views
		mapView = disallowUndefinedProperties( new MapView() );
		lightMapView = disallowUndefinedProperties( new LightMapView() );
		gridSelector = disallowUndefinedProperties( new GridSelector({square_size:mapView.square_size, wall_width:mapView.wall_width, wall_length:mapView.wall_length}) );///////////////
		pathfinderView = disallowUndefinedProperties( new AstarView() );
		tokenView = disallowUndefinedProperties( new TokenView({array2d:array2d}) );
		tokenGrid = disallowUndefinedProperties( new IconGrid() );
		scrollDrag = disallowUndefinedProperties( new ScrollDrag(gridSelector.screen) );
		
		// grid selection modes
		gridSelector.addCustomMode(tokenMap, {type:gridSelector.SELECT_TYPE.BOX, select_on_drag:true, width:tokenMap.token_size, height:tokenMap.token_size});
		gridSelector.addCustomMode(map, {type:gridSelector.SELECT_TYPE.CONNECT, reset_on_up:true, select_on_drag:true, selections:2});
		gridSelector.addCustomMode(pathfinder, {type:gridSelector.SELECT_TYPE.BOX, selections:2});
		gridSelector.addCustomMode(lightMap, {type:gridSelector.SELECT_TYPE.BOX, select_on_drag:true});
		gridSelector.addCustomMode(scrollDrag, {type:gridSelector.SELECT_TYPE.COORDINATE, reset_on_up:true});
		gridSelector.addCustomMode("eraser", {type:gridSelector.SELECT_TYPE.BOX, select_on_drag:true});
		
		// events
		addViewListeners();
		addModelListeners();
		
		// settings
		lightMapView.toggleEditorDarkness(0);
		pathfinderView.c_path.style.opacity = 1;
		lightMap.light_distance = document.getElementById("light_distance").value;
		pathfinder.animate = document.getElementById("animate_pathfind").checked;
		scrollDrag.enable_zoom = true;
		if (sess_id && sess_user) {
			login.user_id = sess_id;
			login.username = sess_user;
			on_login_register();
		}
		
		// set sizes (a little hacky)(after events because the events handle propagating the size changes)
		mapView.square_size = mapView.square_size;
		map.setSize(40, 20);
		
		// Load file if the name isn't null
		if (file.name != null) {
			file.load(null);
		// New map
		}else{
			enableEditorControls();
			// Display the bar with all the buttons
			document.getElementById("tab_edit").click();
		}
		
	}
	
	function on_login_register() {
		if (login.user_id == file.owner_id) {
			enableEditorControls();
			lightMapView.toggleEditorDarkness(0);
			lightMapView.toggleEditorDarkness();
		}
		document.getElementById('username').innerHTML = login.username;
		for (el of document.getElementsByClassName("logged_out"))
			el.style.display = "none";
		for (el of document.getElementsByClassName("logged_in"))
			el.style.display = "inline";
		document.getElementById("login_close").click();
	}
	
	function enableEditorControls() {
		for (el of document.getElementsByClassName("editor"))
			el.style.display = 'inline';
	}
	
	function fillTokenGrid() {
		document.getElementById("loading_text").innerHTML = "Loading...";
		document.getElementById("loading").style.display = "block";
		return tokenDB.loadall().then( (value) => {
			document.getElementById("loading").style.display = "none";
			return tokenGrid.add(tokenDB.path2element);
		});
	}
	
	function addModelListeners() {
		// map resize
		map.on_resize.push(function(width, height){ 
			mapView.resize(width, height, map);
			lightMapView.resize(width, height, lightMap.light_map);
			pathfinderView.resize(width, height);
			gridSelector.resize(width, height);
		});
		map.on_alterSize.push( lightMap.alterSize );
		map.on_alterSize.push( tokenMap.alterSize );
		map.on_alterSize.push( tokenView.alterSize );
		map.on_alterSize.push(() => {
			document.getElementById("left_value").value = map.grid_width;
			document.getElementById("right_value").value = map.grid_width;
			document.getElementById("top_value").value = map.grid_height;
			document.getElementById("bot_value").value = map.grid_height;
		});
		
		// editor events
		map.on_setWall.push(function(x, y, is_horizontal, value){ 
			if (value == 1)
				mapView.drawWall(x, y, is_horizontal);
			else
				mapView.drawWallsFromArrays(map.horizontal_walls, map.vertical_walls); //wip inefficient
				//mapView.eraseWall(x, y, is_horizontal) 
		});
		lightMap.on_drawAll.push(lightMapView.draw);
		lightMap.on_lightUp.push(lightMapView.drawChanged);
		tokenMap.on_set.push(function(x, y, id, size){ tokenView.draw(x, y, tokenDB.idToElement(id), size) });
		tokenMap.on_unset.push(tokenView.clear);
		
		// animate pathfind
		pathfinder.on_step.push(function(old_tiles, new_tiles){ 
			pathfinderView.draw({start:pathfinder.start, end:pathfinder.end, old_tiles:old_tiles, new_tiles:new_tiles}) 
		});
		// pathfinder.on_finish.push(function(path, old_tiles, new_tiles, animate){
			// pathfinderView.draw({start:pathfinder.start, end:pathfinder.end, path_tiles:path, old_tiles:old_tiles, new_tiles:new_tiles, animate_path:animate}) 
		// });
		// pathfinder.on_tile.push(function(tile, is_old){
			// pathfinderView.drawTile(tile, is_old); 
		// });
		pathfinder.on_finish.push(function(path, old_tiles, new_tiles, animate){
			pathfinderView.draw({start:pathfinder.start, end:pathfinder.end, path_tiles:path, animate_path:pathfinder.animate}) 
		});
		
		//loading
		file.on_loadStart.push(()=>{
			document.getElementById("loading_text").innerHTML = "Loading...";
			document.getElementById("loading").style.display = "block";
		});
		file.on_loadSuccess.push(()=>{
			document.getElementById("loading").style.display = "none";
			// Display all editor buttons if authorized
			if (file.anyone_can_edit || file.owner_id == login.user_id) {
				enableEditorControls();
			}else{
				document.getElementById("pan_mode").click();
			}
			// Make map dark if it's not the owner (if editing and saving isnt allowed)
			if (!file.owner_id || file.owner_id != login.user_id) {
				lightMapView.toggleEditorDarkness(1);
				mapView.toggleGrid(false);
			}
			// Display the bar with all the buttons
			document.getElementById("tab_edit").click();
		});
		file.on_loadFailure.push(()=>{
			document.getElementById("loading").style.display = "none";
		});
		file.on_rendering.push(()=>{
			document.getElementById("loading_text").innerHTML = "Rendering...";
			document.getElementById("loading").style.display = "block";
		});
		file.on_rendered.push(()=>{
			fitMapToView();
			document.getElementById("loading").style.display = "none";
		});
		
		//login
		login.on_login.push(()=>{
			on_login_register();
		});
		login.on_register.push(()=>{
			on_login_register();
		});
		login.on_logout.push(()=>{
			for (el of document.getElementsByClassName("logged_out"))
				el.style.display = "inline";
			for (el of document.getElementsByClassName("logged_in"))
				el.style.display = "none";
		});
		login.on_wrong_username.push(()=>{
			document.getElementById("login_error_username_invalid").style.display = "inline";
		});
		login.on_wrong_password.push(()=>{
			document.getElementById("login_error_password_invalid").style.display = "inline";
		});
		login.on_username_taken.push(()=>{
			document.getElementById("login_error_username_taken").style.display = "inline";
		});
	}
	
	function fitMapToView() {
		let view_ratio = document.getElementById("graphics").offsetHeight / document.getElementById("graphics").offsetWidth;
		let map_ratio = map.grid_height / map.grid_width;
		if (map_ratio < view_ratio)
			mapView.square_size = Math.floor(document.getElementById("graphics").offsetWidth / map.grid_width);
		else if (map_ratio > view_ratio)
			mapView.square_size = Math.floor(document.getElementById("graphics").offsetHeight / map.grid_height);
		mapView.org_square_size = mapView.square_size;
	}
	
	function addViewListeners() {
		// window
		window.addEventListener('resize', function(){ mapView.resize(map.grid_width, map.grid_height, map, lightMap) }, false);
		
		// square size (zoom)
		mapView.on_setSquareSize.push(function(size) { 
			gridSelector.square_size = size;
			lightMapView.square_size = size;
			pathfinderView.square_size = size;
			tokenView.square_size = size;
			map.emitResize(); //wip we shouldnt need to do this
			map.emitAlterSize(); //wip we shouldnt need to do this
			document.getElementById("zoom_value").value = parseInt(mapView.zoom*100);
		});
		
		// grid selector events
		gridSelector.getCustomMode(map).on_select.push(function(select) { 
			map.setWall(select.x, select.y, select.horizontal, 1);
		});
		gridSelector.getCustomMode(map).on_deselect.push(function(select) { 
			map.setWall(select.x, select.y, select.horizontal, 0);
		});
		gridSelector.getCustomMode(lightMap).on_select.push(function(select) { 
			lightMap.lightUp(select.x, select.y);
			if (lightMapView.c_black.style.opacity == 0)
				lightMapView.toggleEditorDarkness();
		});
		gridSelector.getCustomMode(tokenMap).on_select.push(function(select) { 
			tokenMap.set(select.x, select.y);
		});
		gridSelector.getCustomMode(tokenMap).on_deselect.push(function(select) { 
			tokenMap.unset(select.x, select.y);
		});
		gridSelector.getCustomMode(pathfinder).on_select.push(function(selects) {
			pathfinder.pathfinding = false;
			pathfinderView.clear();
			pathfinder.aStar(selects[0].x, selects[0].y, selects[1].x, selects[1].y, map.grid_width, map.grid_height);
		});
		gridSelector.getCustomMode(scrollDrag).on_select.push(function(select) {
			scrollDrag.dragStart(select);
		});
		gridSelector.getCustomMode(scrollDrag).on_select_drag.push(function(select) {
			scrollDrag.dragMove(select);
		});
		gridSelector.getCustomMode(scrollDrag).on_select_up.push(function(select) {
			scrollDrag.dragEnd();
		});
		gridSelector.getCustomMode("eraser").on_select.push(function(select) {
			tokenMap.unset(select.x, select.y);
			map.setWall(select.x, select.y, false, 0);
			map.setWall(select.x+1, select.y, false, 0);
			map.setWall(select.x, select.y, true, 0);
			map.setWall(select.x, select.y+1, true, 0);
		});
		
		gridSelector.on_modeSwitch.push(function() {
			pathfinderView.clear();
		});
		
		// mouse
		gridSelector.screen.addEventListener('mousedown', gridSelector.mouseDown );
		document.addEventListener('mouseup', gridSelector.mouseUp );
		gridSelector.screen.addEventListener('mousemove', gridSelector.mouseMove );
		gridSelector.screen.addEventListener('mouseleave', gridSelector.mouseLeave );
		//gridSelector.screen.addEventListener('mouseleave', gridSelector.mouseUp );
		gridSelector.screen.addEventListener('contextmenu', function(e){ e.preventDefault() });
		
		// dragging controls
		scrollDrag.on_drag.push(function(){ gridSelector.mouseLeave() });
		
		// zoom controls
		scrollDrag.on_zoom.push(function(mult){ mapView.setZoom(0, mult) });
		
		// touchscreen
		gridSelector.screen.addEventListener('touchstart', function(e){
			scrollDrag.execute(()=>{
				gridSelector.mouseMove(e);
				gridSelector.mouseDown(e, 1);
			});
		});
		gridSelector.screen.addEventListener('touchend', function(e){
			if (e.targetTouches.length == 0)
				gridSelector.mouseUp(e, 1);
				gridSelector.mouseLeave(e);
		});
		gridSelector.screen.addEventListener('touchmove', function(e){ 
			if (e.targetTouches.length == 1) {
				scrollDrag.execute(()=>{
					gridSelector.mouseMove(e);
					gridSelector.mouseDown(e, 1);
				});
			}
		});
		
		// file buttons
		document.getElementById("save").addEventListener('click', function(){ file.save() });
		document.getElementById("saveas").addEventListener('click', function(){ file.saveas() });
		document.getElementById("load").addEventListener('click', function(){ file.load()} );
		document.getElementById("new").addEventListener('click', function(){ file.newMap(true, 'new') });
		document.getElementById("import").addEventListener('click', function(){ file.loadFile() });
		document.getElementById("export").addEventListener('click', function(){ file.saveFile() });
		
		// resize buttons
		document.getElementById("zoom_in").addEventListener('click', function(){ mapView.zoomIn() });
		document.getElementById("zoom_out").addEventListener('click', function(){ mapView.zoomOut() });
		document.getElementById("zoom_value").addEventListener('input', function(){ 
			if (parseFloat(event.currentTarget.value))
				mapView.zoom = parseFloat(event.currentTarget.value)/100;
		});
		document.getElementById("buff_left").addEventListener('click', function(){ map.alterSize(1, 0, 0, 0) });
		document.getElementById("nerf_left").addEventListener('click', function(){ map.alterSize(-1, 0, 0, 0) });
		document.getElementById("left_value").addEventListener('keydown', function(e){
			if (e.which == 13 && parseFloat(event.currentTarget.value) > 0)
				map.alterSize(event.currentTarget.value - map.grid_width,0,0,0);
		});
		document.getElementById("buff_right").addEventListener('click', function(){ map.alterSize(0, 1, 0, 0) });
		document.getElementById("nerf_right").addEventListener('click', function(){ map.alterSize(0, -1, 0, 0) });
		document.getElementById("right_value").addEventListener('keydown', function(e){
			if (e.which == 13 && parseFloat(event.currentTarget.value) > 0)
				map.alterSize(0,event.currentTarget.value - map.grid_width,0,0);
		});
		document.getElementById("buff_top").addEventListener('click', function(){ map.alterSize(0, 0, 1, 0) });
		document.getElementById("nerf_top").addEventListener('click', function(){ map.alterSize(0, 0, -1, 0) });
		document.getElementById("top_value").addEventListener('keydown', function(e){
			if (e.which == 13 && parseFloat(event.currentTarget.value) > 0)
				map.alterSize(0,0,event.currentTarget.value - map.grid_height,0);
		});
		document.getElementById("buff_bot").addEventListener('click', function(){ map.alterSize(0, 0, 0, 1) });
		document.getElementById("nerf_bot").addEventListener('click', function(){ map.alterSize(0, 0, 0, -1) });
		document.getElementById("bot_value").addEventListener('keydown', function(e){
			if (e.which == 13 && parseFloat(event.currentTarget.value) > 0)
				map.alterSize(0,0,0,event.currentTarget.value - map.grid_height);
		});
		
		// misc buttons
		document.getElementById("grid_toggle").addEventListener('click', function(){ mapView.toggleGrid() });
		
		document.getElementById("wall_mode").addEventListener('click', function(){ gridSelector.setCustomMode(map) });
		
		document.getElementById("logout").addEventListener('click', function(){ login.logout() });
		
		// token controls
		document.getElementById("token_mode").addEventListener('click', function(){
			if (document.getElementById("token_menu").style.display == 'block') {
				document.getElementById("token_menu").style.display = 'none';
			}else{
				fillTokenGrid().then((v) => {
					// token mode selected
					document.getElementById("token_menu").style.display = 'block';
					gridSelector.setCustomMode(tokenMap);
				});
			}
		});
		document.getElementById("token_size").addEventListener('input', function(){ 
			tokenMap.token_size = parseInt(event.currentTarget.value);
			let token_map_mode = gridSelector.getCustomMode(tokenMap);
			token_map_mode.width = tokenMap.token_size;
			token_map_mode.height = tokenMap.token_size;
		});
		
		// token grid selections
		tokenGrid.on_select.push(function(path){ 
			tokenMap.select(tokenDB.pathToID(path));
			document.getElementById("token_menu").style.display = 'none';
		});
		
		// light controls
		document.getElementById("light_mode").addEventListener('click', function(){ gridSelector.setCustomMode(lightMap) });
		document.getElementById("light_distance").addEventListener('input', function(){ lightMap.light_distance = parseFloat(event.currentTarget.value) });
		document.getElementById("blackout").addEventListener('click', function(){ 
			lightMap.reset(); 
			if (lightMapView.getEditorDarkness() == 0)
				lightMapView.toggleEditorDarkness();
		});
		document.getElementById("lightout").addEventListener('click', function(){ lightMap.fillLight() });
		document.getElementById("tog_ed_darkness").addEventListener('click', function(){ lightMapView.toggleEditorDarkness() });
		
		document.getElementById("pan_mode").addEventListener('click', function(){ gridSelector.setCustomMode(scrollDrag)});
		document.getElementById("eraser").addEventListener('click', function(){ gridSelector.setCustomMode("eraser") });
		
		// pathfind
		document.getElementById("pathfind").addEventListener('click', function(){
			gridSelector.setCustomMode(pathfinder);
			// stop and clear the pathfinding visual if its on
			if (pathfinder.pathfinding) {
				pathfinder.pathfinding = false
				pathfinderView.clear();
			}
		});
		document.getElementById("animate_pathfind").addEventListener('click', function(e){
			cnsl(document.getElementById("animate_pathfind").checked)
			pathfinder.animate = document.getElementById("animate_pathfind").checked;
		});
	}
	return this;
})();

// GLOBALS consider putting them in objects
// Prevents undefined properties from being accessed without throwing an error
function disallowUndefinedProperties(obj) {
    const handler = {
        get(target, property) {
            if (property in target)
                return target[property];
            else
				throw new Error(`Property '${property}' is not defined in '${target.constructor.name}'`);
        }
    };
    return new Proxy(obj, handler);
}
function setAttributes(el, dict) {
	for (let key in dict) {
		el.setAttribute(key, dict[key]);
	}
}
function getPositionInsideElement(el, event) {
	//let clientX = event.clientX || event.targetTouches && event.targetTouches[0].pageX;
	let clientX = 0;
	let clientY = 0;
	// For multitouch, get average of all touches
	if (event.targetTouches) {
		for (touch of event.targetTouches) {
			clientX += touch.clientX;//pageX
			clientY += touch.clientY;//pageY
		}
		clientX /= event.targetTouches.length;
		clientY /= event.targetTouches.length;
	}else{
		clientX = event.clientX
		clientY = event.clientY
	}
	let jqel = $(el);
	return {
		x: clientX - jqel.offset().left + jqel.scrollLeft(),
		y: clientY - jqel.offset().top + jqel.scrollTop()
	};
	//let graphics_rect = screen.getBoundingClientRect() //in case we wanna convert to pure js
	//let x =  event.clientX - graphics_rect.left
}
function getBoxRect (x = select_x, y = select_y, square_size) {
	return {x: x*square_size, y: y*square_size, width: square_size, height: square_size}
}
function alertj(obj) {
	alert(JSON.stringify(obj));
}
function cnsl(str) {
	console.log(str);
}
function objectRes(object) {
	let count = 0;
	for (y in object)
		for (x in object[y])
			count++;
	return count;
}
