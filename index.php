<?php
// SERVEROVÁ ČÁST 
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $jmeno = htmlspecialchars($_POST['jmeno']);
    $text = htmlspecialchars($_POST['text']);
    $datum = date("Y-m-d H:i:s");
    $radek = "[$datum] $jmeno: $text\n";
    file_put_contents("feedback.txt", $radek, FILE_APPEND);
    echo "ok";
    exit;
}
?>

<!DOCTYPE html>
<html lang="cs">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MarekWeather Pro Dashboard</title>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="style.css">
</head>
<body>

<div class="app-wrapper">
    
    <header>
        <div class="logo">
            <i class="fa-solid fa-cloud-bolt"></i> MarekWeather <span>Pro</span>
        </div>
        <div class="search-bar">
            <input type="text" id="city-input" placeholder="Hledat město...">
            <button id="search-btn"><i class="fa-solid fa-magnifying-glass"></i></button>
            <button id="locate-btn" class="secondary"><i class="fa-solid fa-location-crosshairs"></i></button>
        </div>
    </header>

    <div class="dashboard-grid">
        
        <aside class="info-sidebar">
            <div class="card current-weather">
                <div class="error-msg" style="display: none; color: red; font-weight: bold; background: #ffe6e6; padding: 10px; border-radius: 5px; margin-bottom: 10px;">
                    ❌ Město nenalezeno!
                </div>
                
                <div class="city-header">
                    <h2 id="city">Zvolte lokaci</h2>
                    <i id="star-btn" class="fa-regular fa-star" title="Přidat do oblíbených"></i>
                </div>
                
                <div class="local-time-wrapper">
                    <i class="fa-regular fa-clock"></i> <span id="local-time">--:--</span>
                </div>

                <p id="description" class="desc">Čekám na data...</p>
                
                <div class="main-temp-wrapper">
                    <img src="https://openweathermap.org/img/wn/02d@4x.png" id="weather-icon" alt="Ikona">
                    <h1 id="temp">--°</h1>
                </div>

                <div class="details-grid">
                    <div class="detail-item">
                        <i class="fa-solid fa-temperature-half"></i>
                        <div><span id="feels-like">--°</span><small>Pocitově</small></div>
                    </div>
                    <div class="detail-item">
                        <i class="fa-solid fa-droplet"></i>
                        <div><span id="humidity">--%</span><small>Vlhkost</small></div>
                    </div>
                    <div class="detail-item">
                        <i class="fa-solid fa-wind"></i>
                        <div><span id="wind">--</span><small>Vítr</small></div>
                    </div>
                    <div class="detail-item">
                        <i class="fa-solid fa-gauge-high"></i>
                        <div><span id="pressure">--</span><small>Tlak</small></div>
                    </div>
                    <div class="detail-item">
                        <i class="fa-regular fa-sun"></i>
                        <div><span id="sunrise">--:--</span><small>Východ</small></div>
                    </div>
                    <div class="detail-item">
                        <i class="fa-regular fa-moon"></i>
                        <div><span id="sunset">--:--</span><small>Západ</small></div>
                    </div>
                </div>
            </div>

            <div class="card history-card">
                <h3><i class="fa-solid fa-star"></i> Oblíbené</h3>
                <div id="favorites-list" class="tags-container"></div>
                
                <h3 style="margin-top: 20px; border-top: 1px solid #eee; padding-top: 10px;"><i class="fa-solid fa-clock-rotate-left"></i> Historie (Posl. 10)</h3>
                <div id="history-list" class="tags-container"></div>
            </div>
        </aside>

        <main class="map-section">
            <div class="map-wrapper">
                <div id="map"></div>
                <div class="map-overlay-controls">
                    <button onclick="changeLayer('clouds_new')" class="active">☁️ Mraky</button>
                    <button onclick="changeLayer('precipitation_new')">☔ Srážky</button>
                    <button onclick="changeLayer('temp_new')">🌡️ Teplota</button>
                </div>
            </div>
        </main>

    </div>

    <div class="feedback-bar">
        <div id="form-message" style="display:none;" class="success-bubble">✅ Zpráva odeslána!</div>
        <form id="feedback-form">
            <span>Našli jste chybu?</span>
            <input type="text" name="jmeno" id="inp-jmeno" placeholder="Vaše jméno" required>
            <input type="text" name="text" id="inp-text" placeholder="Popis problému..." required>
            <button type="submit">Odeslat hlášení</button>
        </form>
    </div>

</div>

<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script src="script.js"></script>
</body>
</html>