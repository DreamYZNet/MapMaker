
let Login = function() {
	
	let on_login = [];
	let on_logout = [];
	let on_register = [];
	let on_wrong_password = [];
	let on_wrong_username = [];
	let on_username_taken = [];
	
	let username = "YamiZee1";
	let user_id;
	
	let path = "https://dreamyz.net/notwp/mapmaker/";
	
	//login();
	//register(); 
	$('#login_form').submit(function(e) {
		e.preventDefault();
		for (el of document.getElementsByClassName("login_error"))
			el.style.display = 'none';
		let username = document.getElementById("login_username").value;
		let password = document.getElementById("login_password").value;
		let email = document.getElementById("login_email").value;
		if (document.getElementById("is_register").checked)
			register(username, password, email);
		else
			login(username, password);
    });
	
	function logout() {
		$.ajax({
			type: 'POST',
			url: path+"php/logout.php",
			//contentType: 'application/json',
			dataType: null, //response type
			
			success: function (data) {
				console.log("Logged out");
				username = null;
				user_id = null;
				for (f of on_logout)
					f();
				//console.log(data);
			},
			
			error: function(data) {
				console.log("Error: " + data.responseText);
			},
			
			complete: function(data) {
			}
		});
	}
	
	function login(username, password) {
		$.ajax({
			type: 'POST',
			url: path+"php/login.php",
			//contentType: 'application/json',
			data: {user:username, pass:password}, 
			dataType: 'json', //response type
			
			success: function (data) {
				console.log("Logged in as " + data['user'] + "");
				setUser(data['id'], data['user']);
				for (f of on_login)
					f();
				//console.log(data);
			},
			
			error: function(data) {
				console.log("Error: " + data.responseText);
				if (data.responseText == "user not found") {
					for (f of on_wrong_username)
						f();
				}else if (data.responseText == "password is incorrect") {
					for (f of on_wrong_password)
						f();
				}
			},
			
			complete: function(data) {
			}
		});
	}
	function register(username, password, email) {
		$.ajax({
			type: 'POST',
			url: path+"php/register.php",
			//contentType: 'application/json',
			data: {user:username, pass:password, email:email}, 
			dataType: 'json', //response type
			
			success: function (data) {
				console.log("Registered as " + data['user'] + "");
				setUser(data['id'], data['user']);
				for (f of on_register)
					f();
				//console.log(data);
			},
			
			error: function(data) {
				console.log("error");
				console.log(data.responseText);
				if (data.responseText == "user already exists") {
					for (f of on_username_taken)
						f();
				}else if (data.responseText == "email already exists") {
				}
			},
			
			complete: function(data) {
			}
		});
	}
	
	function setUser(id, user) {
		username = user;
		user_id = id;
	}
	
	
	return {
		constructor:this.constructor,
		
		on_login: on_login,
		on_logout: on_logout,
		on_register: on_register,
		on_wrong_password: on_wrong_password,
		on_wrong_username: on_wrong_username,
		on_username_taken: on_username_taken,
		
		get user_id(){ return user_id },
		set user_id(v){ user_id = v },
		get username(){ return username },
		set username(v){ username = v },
		
		logout: logout
	}
};