// Helper: render one advice card
function renderAdviceCard(list, author, isOfficer, text, tag) {
  const div = document.createElement("div");
  div.className = "card " + (isOfficer ? "officer" : "");
  div.innerHTML = `
    <h4>${author} ${isOfficer ? "(Officer)" : ""}</h4>
    <p>${text}</p>
    ${tag ? `<small><em>${tag}</em></small>` : ""}
  `;
  list.appendChild(div);
}

// Fallback dummy data if there is no Supabase advice yet
function renderDummyAdvice(list) {
  list.innerHTML = "";

  renderAdviceCard(
    list,
    "Officer Amina",
    true,
    "Rainy season (March–May): For maize, avoid applying fertilizer just before heavy rain. It will wash away. Focus on weeding and check for waterlogging in low spots.",
    "Maize • Rainy season • Central Kenya"
  );

  renderAdviceCard(
    list,
    "Officer Joseph",
    true,
    "Rainy season: For beans, use mulch (dry grass) around the base of the plants to reduce soil splash and prevent fungal diseases when rain is frequent.",
    "Beans • Rainy season • Western region"
  );

  renderAdviceCard(
    list,
    "Farmer Grace",
    false,
    "Dry season (July–September): We irrigate tomatoes very early in the morning and avoid midday watering. It reduces water loss and keeps the leaves healthier.",
    "Tomatoes • Dry season • Rift Valley"
  );

  renderAdviceCard(
    list,
    "Officer Njeri",
    true,
    "Dry, hot conditions: Reduce nitrogen fertilizer on stressed crops and prioritize saving water for young plants and high-value crops like horticulture.",
    "General advice • Dry spell management"
  );
}

// Load advice from Supabase, or use dummy data if empty
async function loadAdvice() {
  const list = document.getElementById("advice-list");
  if (!list) return;

  try {
    const { data, error } = await supabase
      .from("advice")
      .select("*, profiles(username)")
      .order("created_at", { ascending: false });

    list.innerHTML = "";

    if (error) {
      console.error("Error loading advice:", error);
      // Show dummy cards for demo
      renderDummyAdvice(list);
      return;
    }

    if (!data || data.length === 0) {
      // No rows yet → dummy content
      renderDummyAdvice(list);
      return;
    }

    // Real data
    data.forEach((a) => {
      renderAdviceCard(
        list,
        a.profiles?.username || "Farmer",
        a.is_officer,
        a.text,
        ""
      );
    });
  } catch (err) {
    console.error("Unexpected error loading advice:", err);
    renderDummyAdvice(list);
  }
}

// Post new advice to Supabase
async function postAdvice() {
  try {
    const profile = await getProfile(); // from auth.js
    if (!profile) {
      alert("Please log in first.");
      return;
    }

    const textArea = document.getElementById("advice-text");
    const text = textArea.value.trim();
    if (!text) return;

    const { error } = await supabase.from("advice").insert({
      user_id: profile.id,
      text,
      is_officer: profile.is_officer,
    });

    if (error) {
      console.error("Error posting advice:", error);
      alert("Could not post advice, please try again.");
      return;
    }

    textArea.value = "";
    loadAdvice();
  } catch (err) {
    console.error("Unexpected error posting advice:", err);
    alert("Something went wrong, please try again.");
  }
}

// Initial load
loadAdvice();
