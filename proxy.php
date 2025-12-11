<?php
$API_KEY = "93d1def29291ba4b6a844616958bd313"; // klíč

$options = [
    "http" => [
        "ignore_errors" => true // chyba (404)
    ],
    "ssl" => [
        "verify_peer" => false,
        "verify_peer_name" => false,
    ]
];
$context = stream_context_create($options);

$type = isset($_GET['type']) ? $_GET['type'] : '';

if ($type === 'weather') {
    // POČASÍ
    header('Content-Type: application/json');
    
    if (isset($_GET['q'])) {
        $city = urlencode($_GET['q']);
        $url = "https://api.openweathermap.org/data/2.5/weather?q={$city}&units=metric&lang=cz&appid={$API_KEY}";
    } elseif (isset($_GET['lat'])) {
        $lat = $_GET['lat'];
        $lon = $_GET['lon'];
        $url = "https://api.openweathermap.org/data/2.5/weather?lat={$lat}&lon={$lon}&units=metric&lang=cz&appid={$API_KEY}";
    } else {
        die('{}');
    }

    echo file_get_contents($url, false, $context);

} elseif ($type === 'map') {
    // MAPA
    header('Content-Type: image/png');
    $layer = $_GET['layer'];
    $z = $_GET['z'];
    $x = $_GET['x'];
    $y = $_GET['y'];
    $url = "https://tile.openweathermap.org/map/{$layer}/{$z}/{$x}/{$y}.png?appid={$API_KEY}";
    echo file_get_contents($url, false, $context);
}
?>