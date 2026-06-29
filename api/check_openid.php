<?php
header('Content-Type: text/plain');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');

require_once 'crypto.php';
require_once 'db.php';

$raw = file_get_contents('php://input');
$decrypted = decryptAES($raw);

if (!$decrypted || !isset($decrypted['open_id'])) {
    echo encryptAES(['status' => 'error', 'message' => 'Invalid request']);
    exit;
}

$open_id = $decrypted['open_id'];

// Tìm UDID từ open_id trong usage
$usage = loadData('usage.json');
$udid = 'UDID-' . substr($open_id, 0, 8);

echo encryptAES([
    'status' => 'exists',
    'udid' => $udid,
    'message' => 'Device found'
]);
?>
