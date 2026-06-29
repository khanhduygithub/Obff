<?php
header('Content-Type: text/plain');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');

require_once 'crypto.php';

$open_id = 'OPEN-' . bin2hex(random_bytes(8));
$url = 'https://' . $_SERVER['HTTP_HOST'] . '/udid?open_id=' . $open_id;

echo encryptAES([
    'open_id' => $open_id,
    'url' => $url,
    'status' => 'success'
]);
?>
