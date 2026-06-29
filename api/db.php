<?php
function getDataPath($file) {
    return __DIR__ . '/../data/' . $file;
}

function loadData($file) {
    $path = getDataPath($file);
    if (!file_exists($path)) {
        $default = match($file) {
            'keys.json' => ['keys' => []],
            'usage.json' => ['usage' => []],
            'offsets.json' => ['offsets' => []],
            default => []
        };
        file_put_contents($path, json_encode($default, JSON_PRETTY_PRINT));
        return $default;
    }
    return json_decode(file_get_contents($path), true);
}

function saveData($file, $data) {
    $path = getDataPath($file);
    file_put_contents($path, json_encode($data, JSON_PRETTY_PRINT));
}
?>
