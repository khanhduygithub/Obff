<?php
$GLOBALS['AES_KEY'] = hex2bin('A1B2C3D4E5F60718293A4B5C6D7E8F90122334566778899AABBCDDEEFF001');

function encryptAES($data) {
    global $AES_KEY;
    $salt = random_bytes(16);
    $iv = random_bytes(16);
    $ciphertext = openssl_encrypt(json_encode($data), 'aes-256-cbc', $AES_KEY, OPENSSL_RAW_DATA, $iv);
    $mac = hash_hmac('sha256', $salt . $iv . $ciphertext, $AES_KEY, true);
    return base64_encode($salt . $iv . $ciphertext . $mac);
}

function decryptAES($base64Data) {
    global $AES_KEY;
    $decoded = base64_decode($base64Data);
    if (strlen($decoded) < 64) return null;
    $salt = substr($decoded, 0, 16);
    $iv = substr($decoded, 16, 16);
    $ciphertext = substr($decoded, 32, -32);
    $mac = substr($decoded, -32);
    $mac_data = $salt . $iv . $ciphertext;
    $computed_mac = hash_hmac('sha256', $mac_data, $AES_KEY, true);
    if (!hash_equals($mac, $computed_mac)) return null;
    $decrypted = openssl_decrypt($ciphertext, 'aes-256-cbc', $AES_KEY, OPENSSL_RAW_DATA, $iv);
    if ($decrypted === false) return null;
    return json_decode($decrypted, true);
}
?>
