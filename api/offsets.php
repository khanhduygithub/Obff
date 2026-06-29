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

$version = $_GET['version'] ?? '1.114.1';
$offsetsData = loadData('offsets.json');
$offsets = $offsetsData['offsets'][$version] ?? $offsetsData['offsets']['default'] ?? [];

if (empty($offsets)) {
    $offsets = [
        'get_main' => '0x123456',
        'get_transform' => '0x123457',
        'get_transformNode' => '0x123458',
        'WorldToViewpoint' => '0x123459',
        'get_position' => '0x12345A',
        'Team' => '0x12345B',
        'Local' => '0x12345C',
        'get_HP' => '0x12345D',
        'get_maxHP' => '0x12345E',
        'get_IsDieing' => '0x12345F',
        'get_IsVisible' => '0x123460',
        'GetLocalPlayer' => '0x123461',
        'CurrentMatch' => '0x123462',
        'Camera_main' => '0x123463',
        'GetRotation' => '0x123464',
        'get_isLocalTeam' => '0x123465',
        'get_IsSighting' => '0x123466',
        'get_IsFiring' => '0x123467',
        'WorldToScreenPoint' => '0x123468',
        'GetHeadPositions' => '0x123469',
        'Component_GetTransform' => '0x12346A',
        'GetForward' => '0x12346B',
        'Player_GetHeadCollider' => '0x12346C',
        'Transform_GetPosition' => '0x12346D',
        'GetAnimator' => '0x12346E',
        'Physics_Raycast' => '0x12346F',
        'set_aim' => '0x123470',
        'HipPosition' => '0x123471',
        'LeftShoulderPosition' => '0x123472',
        'RightShoulderPosition' => '0x123473',
        'LeftAnklePosition' => '0x123474',
        'RightAnklePosition' => '0x123475',
        'LeftToePosition' => '0x123476',
        'RightToePosition' => '0x123477',
        'LeftHandPosition' => '0x123478',
        'RightHandPosition' => '0x123479',
        'RightForeArmPosition' => '0x12347A',
        'LeftForeArmPosition' => '0x12347B',
        'CameraMain' => '0x12347C',
        'IsClientBot' => '0x12347D',
        'IsAvatarInit' => '0x12347E',
        'MatchPlayers' => '0x12347F'
    ];
}

echo encryptAES(['success' => true, 'offsets' => $offsets]);
?>
