<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once '../db.php';

$ADMIN_KEY = 'admin123';
$admin_key = $_GET['admin_key'] ?? '';

if ($admin_key !== $ADMIN_KEY) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$keys = loadData('keys.json');
echo json_encode($keys);
?>
