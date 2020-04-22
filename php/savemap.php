<?php

session_start();
require 'connect.php';

//header('Access-Control-Allow-Origin: *');
//header('Access-Control-Allow-Methods: POST,GET,OPTIONS');
//header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept');

//header('HTTP/1.1 500');
//die(json_encode($_POST['token_map']));
	
$_POST['name'] = rawurlencode($_POST['name']);
$path = '../maps/'.$_POST['name'].'.json'; 

$map = array(
	'width' => $_POST['width'], 
	'height' => $_POST['height'],
	'vertical_walls' => $_POST['vertical_walls'], 
	'horizontal_walls' => $_POST['horizontal_walls'],
	'light_map' => $_POST['light_map'],
	'token_paths' => $_POST['token_paths'],
	'token_map' => $_POST['token_map']
);

if ( $_POST['overwrite'] == 'false' && file_exists($path) ) {
	$sql->close(); 
	header('HTTP/1.1 500');
	die("file not new");
}

// Fetch map permissions
$stmt = $sql->prepare("SELECT owner_id, anyone_can_save FROM maps WHERE name = ?");
$stmt->bind_param('s', $_POST['name']);
$stmt->execute();
$result = $stmt->get_result();
$stmt->close();

// If map exists
if ($result->num_rows != 0) {
	$row = $result->fetch_assoc();
	// If map permissions allow saving
	if (isset($_SESSION['id']) && $_SESSION['id'] == $row['owner_id'] || $row['anyone_can_save']) {
		$fw = fopen($path, 'w') or die("cant create file");
		fwrite($fw, json_encode($map));
		fclose($fw);
	}else{
		$sql->close();
		header('HTTP/1.1 500');
		//die($_SESSION['id']);
		die("insufficient privilidges to overwrite data");
	}
}else{
	$anyone_can_save = isset($_SESSION['id']) ? 0 : 1;
	$anyone_can_edit = $anyone_can_save;
	$stmt = $sql->prepare("INSERT INTO maps (name, owner_id, anyone_can_edit, anyone_can_save, ip_address) VALUES (?, ?, ?, ?, ?)");
	$stmt->bind_param('siiis', $_POST['name'], $_SESSION['id'], $anyone_can_edit, $anyone_can_save, $_SERVER['REMOTE_ADDR']);
	$stmt->execute();
	$stmt->close();
	if ($sql->affected_rows) {
		$fw = fopen($path, 'w') or die("cant create file");
		fwrite($fw, json_encode($map));
		fclose($fw);
		//file_put_contents('maps/map1.json', json_encode($map));
	}
}

echo '{}';
$sql->close();
//session_write_close(); 

?>