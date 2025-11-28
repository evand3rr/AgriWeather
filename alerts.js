// Helper: render one alert card
function renderAlertCard(list, author, text, tag) {
  const div = document.createElement("div");
  div.className = "card officer";
  div.innerHTML = `
    <h4>Alert by ${author}</h4>
    <p>${text}</p>
    ${tag ? `<small><em>${tag}</em></small>` : ""}
  `;
  list.appendChild(div);
}

// Fallback dummy data: flood alerts
function renderDummyAlerts(list) {
  list.innerHTML = "";

  renderAlertCard(
    list,
    "Officer Musa",
    "FLOOD ALERT: River levels are rising in the lower valley. Move livestock and stored grain away from low-lying areas and riverbanks within the next 24 hours.",
    "Flood risk • Lowland farms"
  );

  renderAlertCard(
    list,
    "Officer Achieng",
    "HEAVY RAIN & FLOODING: Avoid entering flooded fields with machinery. Wait for water to recede to prevent soil compaction and equipment damage.",
    "Safety • Tractors & equipment"
  );

  renderAlertCard(
    list,
    "Officer Kamau",
    "POST-FLOOD ADVICE: After floods, check maize and beans for root rot and lodging. Prioritize drainage for fields where water is still standing.",
    "After-flood management • Maize & beans"
  );
}

// Load alerts from Supabase, or use dummy flood alerts if empty
async function loadAlerts() {
  const list = document.getElementById("alert-list");
  if (!list) return;

  try {
    const { data, error } = await supabase
      .from("pest_alerts")
      .select("*, profiles(username)")
      .order("created_at", { ascending: false });

    list.innerHTML = "";

    if (error) {
      console.error("Error loading alerts:", error);
      renderDummyAlerts(list);
      return;
    }

    if (!data || data.length === 0) {
      renderDummyAlerts(list);
      return;
    }

    // Real data
    data.forEach((a) => {
      renderAlertCard(
        list,
        a.profiles?.username || "Officer",
        a.text,
        ""
      );
    });
  } catch (err) {
    console.error("Unexpected error loading alerts:", err);
    renderDummyAlerts(list);
  }
}

// Post new alert – only officers allowed
async function postAlert() {
  try {
    const profile = await getProfile(); // from auth.js
    if (!profile) {
      alert("Please log in first.");
      return;
    }

    if (!profile.is_officer) {
      alert("Only officers may post alerts!");
      return;
    }

    const textArea = document.getElementById("alert-text");
    const text = textArea.value.trim();
    if (!text) return;

    const { error } = await supabase.from("pest_alerts").insert({
      user_id: profile.id,
      text,
    });

    if (error) {
      console.error("Error posting alert:", error);
      alert("Could not post alert, please try again.");
      return;
    }

    textArea.value = "";
    loadAlerts();
  } catch (err) {
    console.error("Unexpected error posting alert:", err);
    alert("Something went wrong, please try again.");
  }
}

// Initial load
loadAlerts();
