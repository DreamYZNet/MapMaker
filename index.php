<?php session_start(); ?>

<script> 
let sess_id = "<?php echo $_SESSION['id'] ?>";
let sess_user = "<?php echo $_SESSION['user'] ?>";
let map_name
/*<?php echo '*'.'/'. 'map_name = "'.htmlspecialchars($_GET['id']).'";' .'/'.'*' ?>*/
console.log("SESS ID: "+sess_id)
console.log("SESS USER: "+sess_user)
console.log("GET ID: " + map_name);
</script>

<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">

	<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
	
	<script src="./scripts/misc/array2d.js"></script>
	<script src="./scripts/misc/scrolldrag.js"></script>
	<script src="./scripts/misc/binaryheap.js"></script>
	
	<script src="./scripts/view/astarview.js"></script>
	<script src="./scripts/view/gridselector.js"></script>
	<script src="./scripts/view/lightmapview.js"></script>
	<script src="./scripts/view/mapview.js"></script>
	<script src="./scripts/view/tokenview.js"></script>
	<script src="./scripts/view/icongrid.js"></script>
	
	<script src="./scripts/model/astar.js"></script>
	<script src="./scripts/model/lightmap.js"></script>
	<script src="./scripts/model/map.js"></script>
	<script src="./scripts/model/tokenmap.js"></script>
	<script src="./scripts/model/tokendb.js"></script>
	<script src="./scripts/model/mapfile.js"></script>
	<script src="./scripts/login.js"></script>
	<script src="./scripts/tokenfiles.js"></script>
	
	<script src="./scripts/mapmaker.js"></script>
	
	<script src="./index.js"></script>
	
	<link rel="stylesheet" href="./index.css">
</head>

<body> 

	<!-- TABS AND MENU BUTTONS -->
	<span style="width:100%;">
		<button class="tab" onclick="openTab(event, 'tab_content_file')" >File</button>
		<button id="tab_edit" class="tab open_tab" onclick="openTab(event, 'tab_content_edit')" >Edit</button>
		<button class="tab editor" onclick="openTab(event, 'tab_content_light')" >Light</button>
		<button class="tab" onclick="openTab(event, 'tab_content_size')" >Resize</button>
		<button class="tab" onclick="openTab(event, 'tab_content_misc')" >Misc</button>
		
		<button class="tab logged_out" onclick="openRegister()" style="float:right;">Register</button>
		<button class="tab logged_out" onclick="openLogin()" style="float:right;">Login</button>
		<button id="logout" class="tab logged_in" style="float:right;">Logout</button>
		<div id="username" class="logged_in" style="float:right; background-color:white; height:100%; padding:3px 5px 0">Guest</div>
	</span>
	
	<table id="bar" class="bar" style="width:100%; overflow:auto;"><tr><td>
		<div id="tab_content_file" class="tab_content">
			<input type="button" id="new" value="New"/>
			<input type="button" id="save" value="Save" class="editor"/>
			<input type="button" id="saveas" value="Save as" class="editor"/>
			<input type="button" id="load" value="Load"/>
			<input type="button" id="import" value="Import File" class="editor"/>
			<input type="button" id="export" value="Export File" class="editor"/>
		</div>
		<div id="tab_content_edit" class="tab_content">
			<input type="button" id="wall_mode" class="radio editor" group="mode" value="Walls"/>
			<input type="button" id="token_mode" class="radio editor" group="mode" value="Tokens"/>
			<span style="color:white; margin:4px;" class="editor">Size:
				<input type="text" id="token_size" class="number" value="1" autocomplete="off" style="width:20px; text-align:center"/>
			</span>
			<input type="button" id="eraser" class="radio editor" group="mode" value="Eraser"/>
			<input type="button" id="pathfind" class="radio editor" group="mode" value="Pathfinder"/>
			<span class="input_object editor">
				<label for="animate_pathfind">Animate:</label>
				<input type="checkbox" id="animate_pathfind" checked style="margin-right:5px; height:auto; width:auto;">
			</span>
			<input type="button" id="pan_mode" class="radio" group="mode" value="Pan"/>
		</div>
		<div id="tab_content_light" class="tab_content">
			<span class="editor">
			<input type="button" id="light_mode" class="radio" group="mode" value="Light"/>
			<span style="color:white; margin:4px;">Travel:
				<input type="text" id="light_distance" class="number" value="7" autocomplete="off" style="width:20px; text-align:center"/>
			</span>
			<input type="button" id="tog_ed_darkness" value="Darkness Off" offtext="Darkness Off" semitext="Partially Dark" ontext="Fully Dark"/>
			<input type="button" id="blackout" value="Fill Dark"/>
			<input type="button" id="lightout" value="Fill Light"/>
			</span>
		</div>
		<div id="tab_content_size" class="tab_content">
			<span class="plus_minus">Zoom:
				<input type="button" id="zoom_in" class="zoom" value="+"/>
				<input type="text" id="zoom_value" class="number" value="100" style="width:25px; text-align:center"/>
				<input type="button" id="zoom_out" class="zoom" value="-"/>
			</span>
			<span class="plus_minus editor">Left:
				<input type="button" id="buff_left" class="zoom" value="+"/>
				<input type="text" id="left_value" class="number" value="" style="width:25px; text-align:center"/>
				<input type="button" id="nerf_left" class="zoom" value="-"/>
			</span>
			<span class="plus_minus editor">Right:
				<input type="button" id="buff_right" class="zoom" value="+"/>
				<input type="text" id="right_value" class="number" value="" style="width:25px; text-align:center"/>
				<input type="button" id="nerf_right" class="zoom" value="-"/>
			</span>
			<span class="plus_minus editor">Top:
				<input type="button" id="buff_top" class="zoom" value="+"/>
				<input type="text" id="top_value" class="number" value="" style="width:25px; text-align:center"/>
				<input type="button" id="nerf_top" class="zoom" value="-"/>
			</span>
			<span class="plus_minus editor">Bottom:
				<input type="button" id="buff_bot" class="zoom" value="+"/>
				<input type="text" id="bot_value" class="number" value="" style="width:25px; text-align:center"/>
				<input type="button" id="nerf_bot" class="zoom" value="-"/>
			</span>
		</div>
		<div id="tab_content_misc" class="tab_content">
			<input type="button" id="grid_toggle" value="Toggle Grid"/>
			<span style="color:white; margin:4px;">All icon credits can be found at 
				<a target="_blank" style="color:white;" href="https://game-icons.net">https://game-icons.net</a>
			</span>
			<span id="debug_text" style="background:white; width:200px; height:100%;"></span>
		</div>
	</td></tr></table>
	
	<!-- CANVASES -->
	<div id="graphics" style="overflow:auto; max-width:100vw; margin:0px; padding:0px; border:1px solid #d3d3d3;">
		<table class="graphics_table" style="overflow:hidden; margin:0px; padding:0px;"><tr><td>
				<canvas id="c_map" style="z-index:0; position:relative;">Your browser does not support the HTML5 canvas tag.</canvas>
			</td></tr><tr><td>
				<svg width="0" height="0" id="svg" style="z-index:1; position:relative;">
					<desc>Test description</desc>
					<rect id="marker2" x="0" y="0" width="0" height="0" fill="#c00"></rect>
				</svg>
			</td></tr><tr><td>
				<canvas id="c_grid" style="z-index:4; position:relative;"></canvas>
			</td></tr><tr><td>
				<canvas id="c_black" style="z-index:2; position:relative;"></canvas>
			</td></tr><tr><td>
				<canvas id="c_path" style="z-index:3; position:relative;"></canvas>
		</td></tr></table>
	</div>
	
	<!-- TOKEN POPUP MENU -->
	
	<div id="token_menu" class="token_menu">
		<div id="token_grid" class="token_grid">
		</div>
	</div>
	
	<!-- LOADING POPUP -->
	
	<div id="loading" class="loading popup">
	<div class="loading_inner">
		<div id="loading_text" style="display:inline-block; marging:0 auto; font-size:50px;">Loading...</div>
		</div>
	</div>
	
	<!-- LOGIN -->
	<div id="login_popup" class="popup">
	<form id="login_form">
		<div id="login_inner">
			<input type="button" id="login_close" class="close_button" value="X" onclick="closeLogin()">
			<div style="display:inner-block; text-align:center;">
			
				<label for="login_username">Username</label><br>
				<input type="text" id="login_username" class="login_field" name="username"><br>
				<span id="login_error_username_invalid" class="login_error">No such user exists!&nbsp;</span>
				<span id="login_error_username_taken" class="login_error">Username already taken!</span><br>
				
				<label for="login_password">Password</label><br>
				<input type="password" id="login_password" class="login_field" name="password"><br>
				<span id="login_error_password_invalid" class="login_error">Password is incorrect!&nbsp;</span><br>
				
				<span class="register">
					<label for="login_email">Email (not required)</label><br>
					<input type="text" id="login_email" class="login_field" name="email"><br>
					<br>
				</span>
				<input type="checkbox" id="is_register" style="display:none;">
			</div>
		</div>
		<input id="login_submit" type="submit" value="Submit">
	</form>

</body>

















