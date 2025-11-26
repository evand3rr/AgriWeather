const API_KEY = "c368040ce39d305547014657e08dd988";

document.getElementById("search-btn").onclick = () => {
  const city = document.getElementById("city-input").value;
  if (city.trim() !== "") fetchWeatherByCity(city);
};

document.getElementById("geo-btn").onclick = () => {
  navigator.geolocation.getCurrentPosition(pos => {
    fetchWeather(pos.coords.latitude, pos.coords.longitude);
  });
};

async function fetchWeather(lat, lon) {
  const url = 
    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;

  const res = await fetch(url);
  const w = await res.json();

  displayWeather(w);
}

async function fetchWeatherByCity(city) {
  const url = 
    `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`;

  const res = await fetch(url);
  const w = await res.json();

  displayWeather(w);
}

function displayWeather(w) {
  document.getElementById("city-name").textContent = w.name + ", " + w.sys.country;
  document.getElementById("temperature").textContent = w.main.temp + " °C";
  document.getElementById("description").textContent = w.weather[0].description;

  document.getElementById("wind").textContent = w.wind.speed + " m/s";
  document.getElementById("humidity").textContent = w.main.humidity + "%";
  document.getElementById("pressure").textContent = w.main.pressure + " hPa";
  document.getElementById("visibility").textContent = w.visibility / 1000 + " km";

  document.getElementById("sunrise").textContent = 
    new Date(w.sys.sunrise * 1000).toLocaleTimeString();
  document.getElementById("sunset").textContent = 
    new Date(w.sys.sunset * 1000).toLocaleTimeString();

  document.getElementById("weather-icon").src = 
    `https://openweathermap.org/img/wn/${w.weather[0].icon}@2x.png`;

  document.getElementById("updated-time").textContent =
    new Date().toLocaleTimeString();
}

// Load default city
fetchWeatherByCity("Kigali");
