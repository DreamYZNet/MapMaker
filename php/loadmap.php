<?php

session_start();
require 'connect.php';

//header('Access-Control-Allow-Origin: *, *');

$path = "../maps/".rawurlencode($_GET['name']).".json";

$fr = fopen($path, "r") or die("Unable to open file!");
$data = json_decode(fread($fr, filesize($path)), true);
fclose($fr);

// Append extra data from the database
$stmt = $sql->prepare("SELECT id, owner_id, anyone_can_edit FROM maps WHERE name = ?");
$stmt->bind_param('s', $_GET['name']);
$stmt->execute();
$result = $stmt->get_result();
if ($result->num_rows != 0) {
	$row = $result->fetch_assoc();
	$data['id'] = $row['id'];
	$data['owner_id'] = $row['owner_id'];
	$data['anyone_can_edit'] = $row['anyone_can_edit'];
}

echo json_encode($data);
//file_get_contents("maps/map1.json");

?>