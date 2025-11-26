/* --------------------------
   CONFIG
--------------------------- */
const OPENWEATHER_API_KEY = "c368040ce39d305547014657e08dd988";
const DEFAULT_CITY = "Kigali";

/* --------------------------
   DOM ELEMENTS
--------------------------- */
const temperatureEl = document.getElementById("temperature");
const descriptionEl = document.getElementById("description");
const cityNameEl = document.getElementById("city-name");
const weatherIconEl = document.getElementById("weather-icon");

const windEl = document.getElementById("wind");
const humidityEl = document.getElementById("humidity");
const pressureEl = document.getElementById("pressure");
const visibilityEl = document.getElementById("visibility");
const sunriseEl = document.getElementById("sunrise");
const sunsetEl = document.getElementById("sunset");

const updatedTimeEl = document.getElementById("updated-time");

const searchBtn = document.getElementById("search-btn");
const geoBtn = document.getElementById("geo-btn");
const cityInput = document.getElementById("city-input");

/* --------------------------
   UI UPDATE FUNCTION
--------------------------- */
function updateUI(data) {
    console.log("Updating UI with:", data);

    temperatureEl.textContent = `${data.main.temp} °C`;
    descriptionEl.textContent = data.weather[0].description;
    cityNameEl.textContent = `${data.name}, ${data.sys.country}`;

    weatherIconEl.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

    windEl.textContent = `${data.wind.speed} m/s`;
    humidityEl.textContent = `${data.main.humidity}%`;
    pressureEl.textContent = `${data.main.pressure} hPa`;
    visibilityEl.textContent = `${data.visibility / 1000} km`;

    sunriseEl.textContent = new Date(data.sys.sunrise * 1000).toLocaleTimeString();
    sunsetEl.textContent = new Date(data.sys.sunset * 1000).toLocaleTimeString();

    updatedTimeEl.textContent = new Date().toLocaleTimeString();
}

/* --------------------------
   FETCH WEATHER (CITY)
--------------------------- */
async function fetchWeatherByCity(city) {
    console.log("Fetching weather for city:", city);

    try {
        const res = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${OPENWEATHER_API_KEY}`
        );

        const data = await res.json();
        console.log("City weather result:", data);

        if (data.cod !== 200) {
            alert("City not found. Try again.");
            return;
        }

        updateUI(data);

    } catch (err) {
        console.error("City weather error:", err);
        descriptionEl.textContent = "Failed to load weather";
    }
}

/* --------------------------
   FETCH WEATHER (GPS)
--------------------------- */
async function fetchWeatherByCoords(lat, lon) {
    console.log("Fetching weather for coords:", lat, lon);

    try {
        const res = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${OPENWEATHER_API_KEY}`
        );

        const data = await res.json();
        console.log("GPS weather result:", data);

        if (data.cod !== 200) {
            console.warn("GPS weather failed, falling back to default city.");
            fetchWeatherByCity(DEFAULT_CITY);
            return;
        }

        updateUI(data);

    } catch (err) {
        console.error("GPS fetch failed:", err);
        fetchWeatherByCity(DEFAULT_CITY);
    }
}

/* --------------------------
   TRY GPS FIRST
--------------------------- */
function initWeatherSystem() {
    console.log("Initializing weather system...");

    if (!navigator.geolocation) {
        console.warn("Geolocation NOT supported — using default city.");
        fetchWeatherByCity(DEFAULT_CITY);
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (pos) => {
            console.log("GPS success:", pos.coords);
            fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude);
        },
        (err) => {
            console.warn("GPS denied:", err);
            console.log("Using default city instead:", DEFAULT_CITY);
            fetchWeatherByCity(DEFAULT_CITY);
        }
    );
}

/* --------------------------
   EVENT LISTENERS
--------------------------- */

// Search button
searchBtn.addEventListener("click", () => {
    const city = cityInput.value.trim();
    if (city.length === 0) {
        alert("Enter a valid city name");
        return;
    }
    fetchWeatherByCity(city);
});

// "Use My Location" button
geoBtn.addEventListener("click", () => {
    console.log("Manual GPS request...");
    initWeatherSystem();
});

/* --------------------------
   START SYSTEM
--------------------------- */
initWeatherSystem();
