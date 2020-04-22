<?php

session_start();
require_once "connect.php";

$_POST['user'] = trim($_POST['user']);
$_POST['pass'] = trim($_POST['pass']);

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

// Fetch related data
$stmt = $sql->prepare("SELECT id, username, hash FROM users WHERE username = ?");
$stmt->bind_param('s', $_POST['user']);
$stmt->execute();
$result = $stmt->get_result();
$stmt->close();

if ($result->num_rows == 1) {
	$row = $result->fetch_assoc();
	
	// If user is authenticated
	if (password_verify($_POST['pass'], $row['hash'])) {
		// User is signed in by the session[user] being set
		$_SESSION['user'] = htmlspecialchars($row['username']);
		$_SESSION['id'] = $row['id'];
		echo json_encode(array('id' => $_SESSION['id'], 'user' => $_SESSION['user']));
	}else{
		$sql->close();
		header('HTTP/1.1 500');
		die("password is incorrect");
	}
}else{
	$sql->close();
	header('HTTP/1.1 500');
	die("user not found");
}

$sql->close();
session_write_close();

?>