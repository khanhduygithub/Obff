<?php
header('Content-Type: text/plain');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');

require_once 'crypto.php';

$raw = file_get_contents('php://input');
$decrypted = decryptAES($raw);

echo encryptAES([
    'success' => true,
    'allowed' => true,
    'message' => 'Access granted'
]);
?>
