// Grab DOM elements
const usernameEl = document.getElementById("username");
const farmSizeEl = document.getElementById("farm-size");
const cropsEl = document.getElementById("active-crops");
const locationEl = document.getElementById("location");
const soilEl = document.getElementById("soil-type");
const irrigationEl = document.getElementById("irrigation");
const experienceEl = document.getElementById("experience");
const statusEl = document.getElementById("status");
const profileForm = document.getElementById("profile-form");

let userId;

// Check if user is logged in
async function loadProfile() {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        window.location.href = "index.html";
        return;
    }

    userId = user.id;

    const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

    if (error) {
        console.error(error);
        statusEl.textContent = "Failed to load profile";
        return;
    }

    usernameEl.value = data.username || "";
    farmSizeEl.value = data.farm_size || "";
    cropsEl.value = data.active_crops || "";
    locationEl.value = data.location || "";
    soilEl.value = data.soil_type || "";
    irrigationEl.value = data.irrigation_system || "";
    experienceEl.value = data.farming_experience || "";
}

// Update profile
profileForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const updates = {
        farm_size: farmSizeEl.value,
        active_crops: cropsEl.value,
        location: locationEl.value,
        soil_type: soilEl.value,
        irrigation_system: irrigationEl.value,
        farming_experience: experienceEl.value,
        updated_at: new Date()
    };

    const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", userId);

    if (error) {
        console.error(error);
        statusEl.textContent = "Failed to update profile";
    } else {
        statusEl.textContent = "Profile updated successfully!";
    }
});

// Initial load
loadProfile();
