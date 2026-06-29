<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once '../db.php';

$ADMIN_KEY = 'admin123';
$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['admin_key']) || $input['admin_key'] !== $ADMIN_KEY) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$version = $input['version'] ?? 'default';
$offsets = $input['offsets'] ?? [];

$data = loadData('offsets.json');
$data['offsets'][$version] = $offsets;
saveData('offsets.json', $data);

echo json_encode(['success' => true, 'message' => 'Offsets updated']);
?>
