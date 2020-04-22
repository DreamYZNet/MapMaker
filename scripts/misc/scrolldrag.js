
let ScrollDrag = function(element) {
	
	// events
	let on_end = [];
	let on_drag = [];
	let on_zoom = [];
	
	// settings
	let enable_zoom = false;
	let enable_drag = true;
	let enable_left_click_drag = false;
	let zoom_sensitivity = .3; //in percentage, less is more sensitive
	
	// state
	let dragging = false;
	let timeout = false;
	let click_pos;
	let touches = 0;
	let mouse_button;
	
	let funcs = [];
	let events = [];
	
	
	function dragStart(pos) {
		click_pos = {x:pos.x, y:pos.y};
		if (!dragging)
			for (f of on_drag)
				f();
		dragging = true;
		timeout = false;
	}
	
	function dragEnd() {
		if (dragging) {
			for (f of on_end)
				f();
		}
		dragging = false;
	}
	
	function dragMove(position) {
		let jqscreen = $(element);
		jqscreen.scrollTop(jqscreen.scrollTop() + (click_pos.y - position.y));
		jqscreen.scrollLeft(jqscreen.scrollLeft() + (click_pos.x - position.x));
	}
	
	function execute(func, event) {
		if (!dragging) {
			if (timeout) {
				funcs.push(func);
				events.push(event)
			}else{
				func(event);
			}
		}
	}
	
	function runExecutions() {
		for (let i = 0; i < funcs.length; i++)
			funcs[i](events[i]);
		cleanExecutions();
	}
	
	function cleanExecutions() {
		funcs = [];
		events = [];
	}
	
	let bindListeners = (function() {
		
		// middle mouse button dragging
		element.addEventListener('mousedown', function(e){ 
			if (enable_drag) {
				if (event.buttons == 3 || enable_left_click_drag && event.buttons == 1) {
					//e.preventDefault();
					dragStart(getPositionInsideElement(element, e));
					mouse_button = event.buttons;
				}
			}
		});
		document.addEventListener('mouseup', function(e){ 
			if (event.buttons == 3 || enable_left_click_drag && event.buttons == 1) {
				dragEnd();
				mouse_button = 0;
			}
		});
		document.addEventListener('mousemove', function(e){ 
			//if (dragging)
			//	e.preventDefault();
			if (dragging) {
				if (event.buttons == 3 || enable_left_click_drag && event.buttons == 1) {
					dragMove(getPositionInsideElement(element, e));
				}
			}
		});
		
		// touchscreen double touch dragging
		element.addEventListener('touchstart', function(e){
			if (enable_drag) {
				touches = e.targetTouches.length;
				if (e.targetTouches.length == 1) {
					e.preventDefault();
					timeout = true;
					setTimeout(()=>{ 
						timeout = false;
						runExecutions();
					}, 100); //wip we need to handle rapid input, so promises are required
				}
				else if (e.targetTouches.length > 1) {
					e.preventDefault(); 
					dragStart(getPositionInsideElement(element, e));
					cleanExecutions();
				}
			}
		});
		element.addEventListener('touchend', function(e){
			touches = e.targetTouches.length;
			if (e.targetTouches.length == 0) {
				dragEnd();
				timeout = false;
				runExecutions();
			}else{
				click_pos = getPositionInsideElement(element, e);
			}
		});
		element.addEventListener('touchmove', function(e){ 
			// touchmove will activate before touchend, which is bad so dont let it happen
			if (dragging && touches == e.targetTouches.length) {
				e.preventDefault();
				dragMove(getPositionInsideElement(element, e));
			}
			if (dragging || timeout)
				e.preventDefault();
		});
		
		// pinch zoom (wip dragging should disable unwanted zooms)
		let starting_distance;
		element.addEventListener('touchstart', function(e){
			if (enable_zoom) {
				if (e.targetTouches.length == 2) {
					starting_distance = Math.sqrt(
						(e.targetTouches[0].clientX-e.targetTouches[1].clientX)**2
						+ (e.targetTouches[0].clientY-e.targetTouches[1].clientY)**2
					);
				}else{
					starting_distance = null;
				}
			}
		});
		element.addEventListener('touchend', function(e){
			if (e.targetTouches.length == 2) {
				starting_distance = Math.sqrt(
					(e.targetTouches[0].clientX-e.targetTouches[1].clientX)**2
					+ (e.targetTouches[0].clientY-e.targetTouches[1].clientY)**2
				);
			}
		});
		element.addEventListener('touchmove', function(e){ 
			if (e.targetTouches.length == 2)
				e.preventDefault();
			if (e.targetTouches.length == 2 && starting_distance) {
				distance = Math.sqrt(
					(e.targetTouches[0].clientX-e.targetTouches[1].clientX)**2
					+ (e.targetTouches[0].clientY-e.targetTouches[1].clientY)**2
				);
				// zooming is expensive so dont push it (wip we should make it less expensive somehow)
				if (distance/starting_distance < 1-zoom_sensitivity || distance/starting_distance > 1+zoom_sensitivity) {
					let multiplier = distance/starting_distance;
					for (f of on_zoom)
						f(multiplier);
					starting_distance = distance;
					click_pos.x *= multiplier;
					click_pos.y *= multiplier;
				}
			}
		});
	})();

	function busy() {
		return dragging || timeout;
	}
		
	return {
		constructor:this.constructor,
		
		on_end:on_end,
		on_drag:on_drag,
		on_zoom:on_zoom,
		
		get busy(){ return busy() },
		set busy(v){ throw 'This variable is read only.' },
		get position(){ return Object.freeze({x: click_pos.x, y: click_pos.y}) },
		set position(v){ throw 'This variable is read only.' },
		get enable_drag(){ return enable_drag },
		set enable_drag(v){ enable_drag = v },
		get enable_zoom(){ return enable_zoom },
		set enable_zoom(v){ enable_zoom = v },
		
		execute:execute,
		dragStart:dragStart,
		dragEnd:dragEnd,
		dragMove:dragMove
	}
	
};