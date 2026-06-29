<?php
header('Content-Type: text/plain');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');

require_once 'crypto.php';
require_once 'db.php';

$raw = file_get_contents('php://input');
if (empty($raw)) {
    echo encryptAES(['success' => false, 'message' => 'Invalid request']);
    exit;
}

$decrypted = decryptAES($raw);
if (!$decrypted) {
    echo encryptAES(['success' => false, 'message' => 'Decryption failed']);
    exit;
}

$id = $decrypted['id'] ?? '';
$key = $decrypted['key'] ?? '';
$game = $decrypted['game'] ?? '';
$game_uid = $decrypted['game_uid'] ?? '';
$timestamp = $decrypted['timestamp'] ?? time();

$keys = loadData('keys.json');
$keyData = null;
foreach ($keys['keys'] as $k) {
    if ($k['key'] === $key) {
        $keyData = $k;
        break;
    }
}

if (!$keyData) {
    echo encryptAES(['success' => false, 'message' => 'Invalid key']);
    exit;
}

if (!$keyData['active']) {
    echo encryptAES(['success' => false, 'message' => 'Key is inactive']);
    exit;
}

if (time() > $keyData['expires_at']) {
    echo encryptAES(['success' => false, 'message' => 'Key expired']);
    exit;
}

$usage = loadData('usage.json');
$usage['usage'][] = [
    'key' => $key,
    'udid' => $id,
    'game' => $game,
    'game_uid' => $game_uid,
    'timestamp' => $timestamp,
    'time' => date('Y-m-d H:i:s')
];
saveData('usage.json', $usage);

echo encryptAES([
    'success' => true,
    'key' => $keyData['key'],
    'version_name' => $keyData['version_name'] ?? '1.0.7-FFProduct',
    'version' => $keyData['version'] ?? time(),
    'expires_at' => $keyData['expires_at'],
    'message' => 'Login successful'
]);
?>
