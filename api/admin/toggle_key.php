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

$key = $input['key'] ?? '';
$keys = loadData('keys.json');

$found = false;
foreach ($keys['keys'] as &$k) {
    if ($k['key'] === $key) {
        $k['active'] = !$k['active'];
        $found = true;
        break;
    }
}

if (!$found) {
    http_response_code(404);
    echo json_encode(['error' => 'Key not found']);
    exit;
}

saveData('keys.json', $keys);
echo json_encode(['success' => true]);
?>
