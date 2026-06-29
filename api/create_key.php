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

$plan = $input['plan'] ?? 'monthly';
$duration = intval($input['duration'] ?? 30);
$version_name = $input['version_name'] ?? '1.0.7-FFProduct';

$key = 'KEY-' . strtoupper(bin2hex(random_bytes(16)));

$keys = loadData('keys.json');
$newKey = [
    'key' => $key,
    'plan' => $plan,
    'created' => time(),
    'expires_at' => time() + ($duration * 86400),
    'active' => true,
    'used_by' => null,
    'last_used' => null,
    'version_name' => $version_name,
    'version' => time()
];
$keys['keys'][] = $newKey;
saveData('keys.json', $keys);

echo json_encode(['success' => true, 'key' => $newKey]);
?>
