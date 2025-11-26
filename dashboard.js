// dashboard.js

// ---------------------------
fetch(`https://api.openweathermap.org/data/2.5/weather?q=Kigali&units=metric&appid=${OPENWEATHER_API_KEY}`)
  .then(res => res.json())
  .then(console.log)
  .catch(console.error);

// Configuration
// ---------------------------
const OPENWEATHER_API_KEY = "c368040ce39d305547014657e08dd988"; // replace with your key
const OPENWEATHER_BASE = "https://api.openweathermap.org/data/2.5";

// DOM Elements
const cityInput = document.getElementById("city-input");
const searchBtn = document.getElementById("search-btn");
const geoBtn = document.getElementById("geo-btn");
const weatherIcon = document.getElementById("weather-icon");
const temperatureEl = document.getElementById("temperature");
const descriptionEl = document.getElementById("description");
const cityNameEl = document.getElementById("city-name");
const windEl = document.getElementById("wind");
const humidityEl = document.getElementById("humidity");
const pressureEl = document.getElementById("pressure");
const visibilityEl = document.getElementById("visibility");
const sunriseEl = document.getElementById("sunrise");
const sunsetEl = document.getElementById("sunset");
const updatedTimeEl = document.getElementById("updated-time");

// ---------------------------
// Helper Functions
// ---------------------------
function formatTime(timestamp, timezoneOffset) {
  const date = new Date((timestamp + timezoneOffset) * 1000);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function updateWeatherUI(data) {
  const { main, weather, wind, visibility, sys, name } = data;
  const timezoneOffset = data.timezone; // in seconds

  weatherIcon.src = `https://openweathermap.org/img/wn/${weather[0].icon}@2x.png`;
  temperatureEl.textContent = `${Math.round(main.temp)} °C`;
  descriptionEl.textContent = weather[0].description;
  cityNameEl.textContent = name;

  windEl.textContent = `${wind.speed} m/s`;
  humidityEl.textContent = `${main.humidity}%`;
  pressureEl.textContent = `${main.pressure} hPa`;
  visibilityEl.textContent = `${visibility / 1000} km`;
  sunriseEl.textContent = formatTime(sys.sunrise, timezoneOffset);
  sunsetEl.textContent = formatTime(sys.sunset, timezoneOffset);

  const now = new Date();
  updatedTimeEl.textContent = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

async function fetchWeatherByCoords(lat, lon) {
  try {
    const res = await fetch(`${OPENWEATHER_BASE}/weather?lat=${lat}&lon=${lon}&units=metric&appid=${OPENWEATHER_API_KEY}`);
    const data = await res.json();
    if (data.cod !== 200) throw new Error(data.message);
    updateWeatherUI(data);
  } catch (err) {
    alert("Error fetching weather: " + err.message);
  }
}

async function fetchWeatherByCity(city) {
  try {
    const res = await fetch(`${OPENWEATHER_BASE}/weather?q=${city}&units=metric&appid=${OPENWEATHER_API_KEY}`);
    const data = await res.json();
    if (data.cod !== 200) throw new Error(data.message);
    updateWeatherUI(data);
  } catch (err) {
    alert("Error fetching weather: " + err.message);
  }
}

// ---------------------------
// GPS / Fallback
// ---------------------------
function tryLoadWeatherWithGPS() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        fetchWeatherByCoords(latitude, longitude);
      },
      (error) => {
        console.warn("GPS denied or unavailable. Please enter a city.");
      }
    );
  } else {
    console.warn("Geolocation not supported. Please enter a city.");
  }
}

// ---------------------------
// Event Listeners
// ---------------------------
searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (city) fetchWeatherByCity(city);
});

geoBtn.addEventListener("click", tryLoadWeatherWithGPS);

// ---------------------------
// Initialize
// ---------------------------
window.addEventListener("DOMContentLoaded", () => {
  tryLoadWeatherWithGPS();
});
