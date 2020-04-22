
// Tab behaviour
$(function(){ 
	document.getElementById("pathfind").click();
});

function openTab(e, id) {
	let open_tabs = document.getElementsByClassName("open_tab");
	for (let open_tab of open_tabs)
		open_tab.className = open_tab.className.replace(" open_tab", "");
	
	e.currentTarget.className += " open_tab";
	
	let open_tab_contents = document.getElementsByClassName("open_tab_content")
	for (let open_tab_content of open_tab_contents) {
		open_tab_content.className = open_tab_content.className.replace(" open_tab_content", "");
	}
	
	document.getElementById(id).className += " open_tab_content";
}


// Modifies the darkness toggles text according to the opacity of the darkness screen
$(function() {
	// When the opacity of darkness changes, change the button text as well
	let element = document.getElementById("c_black");
	let button = document.getElementById("tog_ed_darkness");
	let observer = new MutationObserver(function(mutations) {
		for (mutation of mutations) {
			if (mutation.type == "attributes" && mutation.attributeName == "style") {
				setButtonText(button, mutation.target.style.opacity);
			}
		}
	});
	observer.observe(element, { attributes: true });
	let setButtonText = function (element, opacity) {
		if (opacity == 0)
			element.value = element.getAttribute("offtext");
		else if (opacity < 1)
			element.value = element.getAttribute("semitext");
		else
			element.value = element.getAttribute("ontext");
	};
	element.style.opacity = element.style.opacity;
});


// Creates a set of "radio" buttons
	$(function() {
		for (el of document.getElementsByClassName("number")) {
			el.onkeypress = (e)=>{return keyIs(e,[8,[48,57]])};
			el.onblur = (e)=>{onEmpty(e,0)};
		}
		let radioGroups = {};
		for (el of document.getElementsByClassName("radio")) {
			radioGroups[el.group] = radioGroups[el.group] || [];
			radioGroups[el.group].push(el);
			el.onclick = (e)=>{
				for (el of radioGroups[e.target.group])
					el.className = el.className.replace(" radio_selected", "");
				e.target.className += " radio_selected";
			};
		}
		document.getElementById("pathfind").click();
	});
	// Returns true if events key is within the list. Among values can be arrays of 2 representing a range of values
	function keyIs(e, list) {
		let code = e.charCode || e.keyCode;
		for (i of list) {
			if (Array.isArray(i) && i.length == 2) {
				if (code >= i[0] && code <= i[1])
					return true;
			}else{
				if (code == i)
					return true;
			}
		}
		return false;
	}
	function onEmpty(e, value) {
		if (e.target.value == '')
			e.target.value = value;
	}
	
	
	
	function openLogin() {
		document.getElementById("login_popup").style.display = 'block';
		for (el of document.getElementsByClassName("register"))
			el.style.display = 'none';
		document.getElementById("is_register").checked = false;
	}
	function openRegister() {
		document.getElementById("login_popup").style.display = 'block';
		for (el of document.getElementsByClassName("register"))
			el.style.display = 'block';
		document.getElementById("is_register").checked = true;
	}
	function closeLogin() {
		document.getElementById("login_popup").style.display = 'none';
		for (el of document.getElementsByClassName("login_error"))
			el.style.display = 'none';
	}
	
	
	