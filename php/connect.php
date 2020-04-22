<?php
// Error handling
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
error_reporting(E_ALL);
ini_set('display_errors', 1);

$servername = "localhost";
$db_username = "user";
$db_password = "pass";
$db_name = "dbname";

// Create connection
$sql = new mysqli($servername, $db_username, $db_password, $db_name);
if ($sql->connect_error) {
    die("Connection failed: " . $sql->connect_error);
}
?>