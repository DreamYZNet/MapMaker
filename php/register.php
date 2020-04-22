<?php

session_start();
require "connect.php";

$_POST['user'] = trim($_POST['user']);
$_POST['pass'] = trim($_POST['pass']);
if (isset($_POST['email']))
	$_POST['email'] = trim($_POST['email']);
else
	$_POST['email'] = null;

if (empty($_POST['user'])) {
	$sql->close();
	header('HTTP/1.1 500');
	die("user field is empty");
}
if (empty($_POST['pass'])) {
	$sql->close();
	header('HTTP/1.1 500');
	die("pass field is empty");
}

// If user is already in the database
$stmt = $sql->prepare("SELECT username FROM users WHERE username = ?");
$stmt->bind_param('s', $_POST['user']);
$stmt->execute();
$result = $stmt->get_result();
$stmt->close();
if ($result->num_rows != 0) {
	$sql->close();
	header('HTTP/1.1 500');
	die("user already exists");
}

if (!empty($_POST['email'])) {
	// If email is already in the database
	$stmt = $sql->prepare("SELECT email FROM users WHERE email = ?");
	$stmt->bind_param('s', $_POST['email']);
	$stmt->execute();
	$result = $stmt->get_result();
	$stmt->close();
	if ($result->num_rows != 0) {
		$sql->close();
		header('HTTP/1.1 500');
		die("email already exists");
	}
}

// Create user
$hash = password_hash($_POST['pass'], PASSWORD_DEFAULT);
$stmt = $sql->prepare("INSERT INTO users (username, email, hash, ip_address) VALUES (?, ?, ?, ?)");
$stmt->bind_param('sssi', $_POST['user'], $_POST['email'], $hash, $_SERVER['REMOTE_ADDR']);
$stmt->execute();
$stmt->close();
$user_id = $sql->insert_id;

// Sign the user in
$_SESSION['id'] = $user_id;
$_SESSION['user'] = $_POST['user'];
echo(json_encode(array('id' => $user_id, 'user' => htmlspecialchars($_POST['user']))));

$sql->close();



?>












