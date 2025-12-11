// KONFIGURACE
var map = L.map('map').setView([49.8175, 15.4730], 6);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
}).addTo(map);

var weatherLayer;
function addWeatherLayer(layerName) {
    if (weatherLayer) map.removeLayer(weatherLayer);
    weatherLayer = L.tileLayer(`proxy.php?type=map&layer=${layerName}&z={z}&x={x}&y={y}`, {
        opacity: 0.6
    }).addTo(map);
}
addWeatherLayer('clouds_new');

function changeLayer(type) {
    document.querySelectorAll('.map-overlay-controls button').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    addWeatherLayer(type);
}

var marker;

// POČASÍ 
const elements = {
    city: document.getElementById('city'),
    temp: document.getElementById('temp'),
    desc: document.getElementById('description'),
    icon: document.getElementById('weather-icon'),
    feels: document.getElementById('feels-like'),
    humidity: document.getElementById('humidity'),
    wind: document.getElementById('wind'),
    pressure: document.getElementById('pressure'),
    sunrise: document.getElementById('sunrise'),
    sunset: document.getElementById('sunset'),
    error: document.querySelector('.error-msg'),
    favorites: document.getElementById('favorites-list'),
    history: document.getElementById('history-list'),
    starBtn: document.getElementById('star-btn'),
    localTime: document.getElementById('local-time')
};

let currentCityName = "";

async function checkWeather(cityQuery) {
    try {
        const url = `proxy.php?type=weather&q=${cityQuery}`;
        const response = await fetch(url);
        
        const data = await response.json();

        // KONTROLA CHYBY
        if (Number(data.cod) !== 200) {
            elements.error.style.display = "block";
            elements.city.innerText = "Nenalezeno";
            elements.desc.innerText = "Zkontrolujte název";
            elements.temp.innerText = "--°";
            return;
        }
        
        elements.error.style.display = "none";
        updateUI(data);
        addToHistory(data.name);

    } catch (err) {
        console.error("Kritická chyba:", err);
    }
}

function updateUI(data) {
    currentCityName = data.name;

    elements.city.innerText = `${data.name}, ${data.sys.country}`;
    elements.temp.innerText = Math.round(data.main.temp) + "°";
    elements.desc.innerText = data.weather[0].description;
    
    elements.feels.innerText = Math.round(data.main.feels_like) + "°";
    elements.humidity.innerText = data.main.humidity + "%";
    elements.wind.innerText = data.wind.speed + " km/h";
    elements.pressure.innerText = data.main.pressure + " hPa";
    
    elements.sunrise.innerText = new Date(data.sys.sunrise * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    elements.sunset.innerText = new Date(data.sys.sunset * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

    elements.icon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`;

    // Místní čas
    const d = new Date();
    const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
    const localDate = new Date(utc + (1000 * data.timezone));
    elements.localTime.innerText = localDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

    // Mapa
    const lat = data.coord.lat;
    const lon = data.coord.lon;
    map.invalidateSize(); 
    map.flyTo([lat, lon], 10, { duration: 1.5 });

    if (marker) map.removeLayer(marker);
    marker = L.marker([lat, lon]).addTo(map)
        .bindPopup(`<b>${data.name}</b><br>${Math.round(data.main.temp)}°C`)
        .openPopup();

    updateStarState();
}

// HISTORIE Vyhledávání
function addToHistory(city) {
    let history = JSON.parse(localStorage.getItem('weatherHistory')) || [];
    history = history.filter(item => item !== city);
    history.unshift(city);
    if (history.length > 10) history = history.slice(0, 10);
    localStorage.setItem('weatherHistory', JSON.stringify(history));
    renderHistory();
}

function renderHistory() {
    elements.history.innerHTML = "";
    let history = JSON.parse(localStorage.getItem('weatherHistory')) || [];
    if (history.length === 0) {
        elements.history.innerHTML = "<span style='color:#aaa; font-size:12px;'>Historie je prázdná...</span>";
        return;
    }
    history.forEach(city => {
        let btn = document.createElement('button');
        btn.innerHTML = `<i class="fa-solid fa-clock-rotate-left"></i> ${city}`;
        btn.onclick = () => checkWeather(city);
        elements.history.appendChild(btn);
    });
}
renderHistory();

// OBLÍBENÉ
function updateStarState() {
    let favorites = JSON.parse(localStorage.getItem('weatherFavorites')) || [];
    if (favorites.includes(currentCityName)) {
        elements.starBtn.classList.remove('fa-regular'); 
        elements.starBtn.classList.add('fa-solid');      
        elements.starBtn.style.color = "#f1c40f";        
    } else {
        elements.starBtn.classList.remove('fa-solid');
        elements.starBtn.classList.add('fa-regular');
        elements.starBtn.style.color = "#ccc";           
    }
}

elements.starBtn.addEventListener('click', () => {
    if (!currentCityName) return;
    let favorites = JSON.parse(localStorage.getItem('weatherFavorites')) || [];
    if (favorites.includes(currentCityName)) {
        favorites = favorites.filter(city => city !== currentCityName);
    } else {
        favorites.push(currentCityName);
    }
    localStorage.setItem('weatherFavorites', JSON.stringify(favorites));
    updateStarState();
    renderFavorites();
});

function renderFavorites() {
    elements.favorites.innerHTML = "";
    let favorites = JSON.parse(localStorage.getItem('weatherFavorites')) || [];
    if (favorites.length === 0) {
        elements.favorites.innerHTML = "<span style='color:#aaa; font-size:12px;'>Zatím žádná oblíbená města...</span>";
        return;
    }
    favorites.forEach(city => {
        let btn = document.createElement('button');
        btn.innerHTML = `<i class="fa-solid fa-star" style="color:#f1c40f; font-size:10px;"></i> ${city}`;
        btn.onclick = () => checkWeather(city);
        elements.favorites.appendChild(btn);
    });
}
renderFavorites();

// Eventy
document.getElementById('search-btn').addEventListener('click', () => {
    checkWeather(document.getElementById('city-input').value);
});
document.getElementById('city-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') checkWeather(document.getElementById('city-input').value);
});
document.getElementById('locate-btn').addEventListener('click', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (pos) => {
            const url = `proxy.php?type=weather&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`;
            const res = await fetch(url);
            const data = await res.json();
            updateUI(data);
            addToHistory(data.name);
        });
    }
});

// AJAX
const feedbackForm = document.getElementById('feedback-form');
const feedbackMsg = document.getElementById('form-message');
feedbackForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const formData = new FormData(feedbackForm);
    fetch('index.php', { method: 'POST', body: formData })
    .then(response => response.text())
    .then(data => {
        if (data.trim() === "ok") {
            feedbackMsg.style.display = 'block';
            feedbackForm.reset();
            setTimeout(() => { feedbackMsg.style.display = 'none'; }, 3000);
        }
    });
});