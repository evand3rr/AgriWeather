/* --------------------------
   CONFIG
--------------------------- */
const OPENWEATHER_API_KEY = "c368040ce39d305547014657e08dd988";

/* --------------------------
   DOM ELEMENTS (Weather)
--------------------------- */
const tempEl = document.getElementById("w-temp");
const descEl = document.getElementById("w-desc");
const iconEl = document.getElementById("w-icon");

const humidityEl = document.getElementById("w-humidity");
const windEl = document.getElementById("w-wind");
const rainEl = document.getElementById("w-rain");

const updatedEl = document.getElementById("updated-time");

const searchBtn = document.getElementById("search-btn");
const cityInput = document.getElementById("city-input");
const geoBtn = document.getElementById("geo-btn");

const locationEl = document.getElementById("user-location");

/* --------------------------
   DOM ELEMENTS (Profile)
--------------------------- */
const userNameEl = document.getElementById("user-name");
const userRoleEl = document.getElementById("user-role");
const activeCropsEl = document.getElementById("active-crops");
const farmSizeEl = document.getElementById("farm-size");

/* --------------------------
   WEATHER UI UPDATE
--------------------------- */
function updateWeatherUI(data) {
    console.log("Updating dashboard UI:", data);

    tempEl.textContent = `${data.main.temp.toFixed(1)}°C`;
    descEl.textContent = data.weather[0].description;
    humidityEl.textContent = `${data.main.humidity}%`;
    windEl.textContent = `${data.wind.speed} m/s`;

    const rainChance = data.rain?.["1h"] ? `${data.rain["1h"]}%` : "0%";
    rainEl.textContent = rainChance;

    iconEl.textContent = ""; // clear icon text
    iconEl.innerHTML = `<img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png">`;

    locationEl.textContent = `${data.name}, ${data.sys.country}`;

    updatedEl.textContent = new Date().toLocaleTimeString();
}

/* --------------------------
   FETCH WEATHER — CITY
--------------------------- */
async function fetchWeatherByCity(city) {
    try {
        const res = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${OPENWEATHER_API_KEY}&units=metric`
        );

        const data = await res.json();

        if (data.cod !== 200) {
            alert("City not found");
            return;
        }

        updateWeatherUI(data);
    } catch (err) {
        console.error("City fetch error:", err);
    }
}

/* --------------------------
   FETCH WEATHER — GPS
--------------------------- */
async function fetchWeatherByCoords(lat, lon) {
    try {
        const res = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`
        );

        const data = await res.json();
        updateWeatherUI(data);
    } catch (err) {
        console.error("GPS fetch error:", err);
    }
}

/* --------------------------
   INIT WEATHER
--------------------------- */
function initWeather() {
    if (!navigator.geolocation) {
        console.warn("GPS not supported — using Kigali");
        fetchWeatherByCity("Kigali");
        return;
    }

    navigator.geolocation.getCurrentPosition(
        pos => fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude),
        err => {
            console.warn("GPS denied — using Kigali");
            fetchWeatherByCity("Kigali");
        }
    );
}

/* --------------------------
   LOAD USER PROFILE
--------------------------- */
async function loadUserProfile() {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            console.warn("No user logged in — redirecting to login");
            window.location.href = "login.html";
            return;
        }

        const userId = user.id;

        const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", userId)
            .single();

        if (error) {
            console.error("Failed to fetch profile:", error);
            return;
        }

        // Update profile section
        userNameEl.textContent = data.username || "Farmer";
        userRoleEl.textContent = data.is_officer ? "Agriculture Officer" : "Farmer";
        locationEl.textContent = data.location || locationEl.textContent;
        activeCropsEl.textContent = data.active_crops ? `${data.active_crops} Active Crops` : "-- Active Crops";
        farmSizeEl.textContent = data.farm_size ? `${data.farm_size} Hectares` : "-- Hectares";

    } catch (err) {
        console.error("Error loading user profile:", err);
    }
}

/* --------------------------
   EVENT LISTENERS
--------------------------- */
if (searchBtn) {
    searchBtn.addEventListener("click", () => {
        const city = cityInput.value.trim();
        if (!city) return alert("Enter a city name");
        fetchWeatherByCity(city);
    });
}

if (geoBtn) {
    geoBtn.addEventListener("click", () => initWeather());
}

/* --------------------------
   START
--------------------------- */
initWeather();
loadUserProfile();
