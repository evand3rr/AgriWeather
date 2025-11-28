/* --------------------------
   CONFIG
--------------------------- */
// Avoid redeclaring if file is evaluated twice
window.OPENWEATHER_API_KEY =
  window.OPENWEATHER_API_KEY || "c368040ce39d305547014657e08dd988";

/* --------------------------
   DOM ELEMENTS (Weather)
--------------------------- */
window.tempEl = window.tempEl || document.getElementById("w-temp");
window.descEl = window.descEl || document.getElementById("w-desc");
window.iconEl = window.iconEl || document.getElementById("w-icon");

window.humidityEl = window.humidityEl || document.getElementById("w-humidity");
window.windEl = window.windEl || document.getElementById("w-wind");
window.rainEl = window.rainEl || document.getElementById("w-rain");

window.updatedEl =
  window.updatedEl || document.getElementById("updated-time");

window.searchBtn = window.searchBtn || document.getElementById("search-btn");
window.cityInput =
  window.cityInput || document.getElementById("city-input");
window.geoBtn = window.geoBtn || document.getElementById("geo-btn");

window.locationEl =
  window.locationEl || document.getElementById("user-location");

/* --------------------------
   DOM ELEMENTS (Profile)
--------------------------- */
window.userNameEl =
  window.userNameEl || document.getElementById("user-name");
window.userRoleEl =
  window.userRoleEl || document.getElementById("user-role");
window.activeCropsEl =
  window.activeCropsEl || document.getElementById("active-crops");
window.farmSizeEl =
  window.farmSizeEl || document.getElementById("farm-size");

// ---------- AUTH / CURRENT USER ----------
window.currentUser = window.currentUser || null;

async function loadCurrentUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    console.error("Error getting user", error);
    return;
  }
  window.currentUser = data.user;
}

/* --------------------------
   WEATHER UI UPDATE
--------------------------- */
function updateWeatherUI(data) {
  console.log("Updating dashboard UI:", data);

  if (
    !window.tempEl ||
    !window.descEl ||
    !window.humidityEl ||
    !window.windEl ||
    !window.rainEl ||
    !window.locationEl ||
    !window.updatedEl
  ) {
    console.warn("Weather UI elements missing – skipping update.");
    return;
  }

  window.tempEl.textContent = `${data.main.temp.toFixed(1)}°C`;
  window.descEl.textContent = data.weather[0].description;
  window.humidityEl.textContent = `${data.main.humidity}%`;
  window.windEl.textContent = `${data.wind.speed} m/s`;

  const rainChance = data.rain?.["1h"] ? `${data.rain["1h"]}%` : "0%";
  window.rainEl.textContent = rainChance;

  window.iconEl.textContent = "";
  window.iconEl.innerHTML = `<img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png">`;

  window.locationEl.textContent = `${data.name}, ${data.sys.country}`;
  window.updatedEl.textContent = new Date().toLocaleTimeString();
}

/* --------------------------
   FETCH WEATHER — CITY
--------------------------- */
async function fetchWeatherByCity(city) {
  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
        city
      )}&appid=${window.OPENWEATHER_API_KEY}&units=metric`
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
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${window.OPENWEATHER_API_KEY}&units=metric`
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
    (pos) =>
      fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude),
    (err) => {
      console.warn("GPS denied — using Kigali", err);
      fetchWeatherByCity("Kigali");
    }
  );
}

/* --------------------------
   LOAD USER PROFILE
--------------------------- */
async function loadUserProfile() {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      console.warn("No user logged in — redirecting to login");
      window.location.href = "index.html";
      return;
    }

    const userId = user.id;

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      // Likely 406 if profile row doesn't exist yet
      console.warn("No profile row yet, using defaults.");
      return;
    }

    if (window.userNameEl) {
      window.userNameEl.textContent = data.username || "Farmer";
    }
    if (window.userRoleEl) {
      window.userRoleEl.textContent = data.is_officer
        ? "Agriculture Officer"
        : "Farmer";
    }
    if (window.locationEl && data.location) {
      window.locationEl.textContent =
        data.location || window.locationEl.textContent;
    }
    if (window.activeCropsEl) {
      window.activeCropsEl.textContent = data.active_crops
        ? `${data.active_crops} Active Crops`
        : "-- Active Crops";
    }
    if (window.farmSizeEl) {
      window.farmSizeEl.textContent = data.farm_size
        ? `${data.farm_size} Hectares`
        : "-- Hectares";
    }
  } catch (err) {
    console.error("Error loading user profile:", err);
  }
}

/* --------------------------
   FARMER QUESTIONS
--------------------------- */
window.questionForm =
  window.questionForm || document.getElementById("question-form");
window.questionTextEl =
  window.questionTextEl || document.getElementById("question-text");
window.myQuestionsList =
  window.myQuestionsList || document.getElementById("my-questions-list");

window.questionForm?.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!window.currentUser) {
    alert("You must be logged in to ask a question.");
    return;
  }

  const question = window.questionTextEl.value.trim();
  if (!question) return;

  const { error } = await supabase.from("questions").insert({
    user_id: window.currentUser.id,
    question,
  });

  if (error) {
    console.error(error);
    alert("Could not send your question. Please try again.");
    return;
  }

  window.questionTextEl.value = "";
  await loadMyQuestions();
});

async function loadMyQuestions() {
  if (!window.currentUser) return;
  if (!window.myQuestionsList) {
    console.warn(
      "my-questions-list element not found – skipping questions render."
    );
    return;
  }

  const { data, error } = await supabase
    .from("questions")
    .select("*")
    .eq("user_id", window.currentUser.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return;
  }

  window.myQuestionsList.innerHTML = data
    .map((q) => {
      return `
        <div class="question-card">
          <p><strong>Question:</strong> ${q.question}</p>
          <p><strong>Status:</strong> ${q.status}</p>
          ${
            q.answer
              ? `<p><strong>Answer:</strong> ${q.answer}</p>`
              : `<p><em>No answer yet.</em></p>`
          }
        </div>
      `;
    })
    .join("");
}

/* --------------------------
   EVENT LISTENERS
--------------------------- */
if (window.searchBtn) {
  window.searchBtn.addEventListener("click", () => {
    const city = window.cityInput.value.trim();
    if (!city) return alert("Enter a city name");
    fetchWeatherByCity(city);
  });
}

if (window.geoBtn) {
  window.geoBtn.addEventListener("click", () => initWeather());
}

async function logout() {
  try {
    await supabase.auth.signOut();
  } catch (err) {
    console.error("Error during logout", err);
  } finally {
    window.location.href = "index.html";
  }
}

/* --------------------------
   DASHBOARD: Alerts & Advice
--------------------------- */
window.alertsGridEl =
  window.alertsGridEl || document.getElementById("alerts-grid");
window.cropGridEl =
  window.cropGridEl || document.getElementById("crop-grid");
window.alertCountEl =
  window.alertCountEl || document.getElementById("alert-count");

async function loadDashboardAlerts() {
  if (!window.alertsGridEl) return;

  try {
    const { data, error } = await supabase
      .from("pest_alerts")
      .select("*, profiles(username)")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to load dashboard alerts:", error);
      return;
    }

    if (!data || data.length === 0) {
      window.alertsGridEl.innerHTML = `
        <div class="question-card">
          No active alerts right now.
        </div>
      `;
      if (window.alertCountEl) window.alertCountEl.textContent = "0";
      return;
    }

    window.alertsGridEl.innerHTML = data
      .map((a) => {
        const created = new Date(a.created_at).toLocaleString();
        return `
          <div class="alert-card">
            <div class="section-header">
              <strong>${a.profiles?.username || "Officer"}</strong>
              <span>${created}</span>
            </div>
            <p>${a.text}</p>
          </div>
        `;
      })
      .join("");

    if (window.alertCountEl)
      window.alertCountEl.textContent = String(data.length);
  } catch (err) {
    console.error("Error loading dashboard alerts:", err);
  }
}

async function loadDashboardAdvice() {
  if (!window.cropGridEl) return;

  try {
    const { data, error } = await supabase
      .from("advice")
      .select("*, profiles(username)")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to load dashboard advice:", error);
      return;
    }

    if (!data || data.length === 0) {
      window.cropGridEl.innerHTML = `
        <div class="question-card">
          No crop advice has been posted yet.
        </div>
      `;
      return;
    }

    window.cropGridEl.innerHTML = data
      .map((a) => {
        const created = new Date(a.created_at).toLocaleString();
        return `
          <div class="crop-card ${a.is_officer ? "officer" : ""}">
            <h4>${a.profiles?.username || "Farmer"} ${
          a.is_officer ? "(Officer)" : ""
        }</h4>
            <p>${a.text}</p>
            <small>${created}</small>
          </div>
        `;
      })
      .join("");
  } catch (err) {
    console.error("Error loading dashboard advice:", err);
  }
}

/* --------------------------
   START
--------------------------- */
initWeather();
loadUserProfile();

window.addEventListener("load", () => {
  loadCurrentUser().then(() => {
    loadMyQuestions();
    loadDashboardAlerts();
    loadDashboardAdvice();
  });
});
