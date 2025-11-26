async function loadAlerts() {
    const { data } = await supabase
      .from("pest_alerts")
      .select("*, profiles(username)")
      .order("created_at", { ascending: false });
  
    const list = document.getElementById("alert-list");
    list.innerHTML = "";
  
    data.forEach(a => {
      const div = document.createElement("div");
      div.className = "card officer";
  
      div.innerHTML = `
        <h4>Alert by ${a.profiles.username}</h4>
        <p>${a.text}</p>
        <small>${new Date(a.created_at).toLocaleString()}</small>
      `;
  
      list.appendChild(div);
    });
  }
  
  async function postAlert() {
    const profile = await getProfile();
    if (!profile.is_officer) return alert("Only officers may post alerts!");
  
    const text = document.getElementById("alert-text").value;
  
    await supabase.from("pest_alerts").insert({
      user_id: profile.id,
      text
    });
  
    document.getElementById("alert-text").value = "";
    loadAlerts();
  }
  
  loadAlerts();
  