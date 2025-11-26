async function loadAdvice() {
    const { data } = await supabase
      .from("advice")
      .select("*, profiles(username)")
      .order("created_at", { ascending: false });
  
    const list = document.getElementById("advice-list");
    list.innerHTML = "";
  
    data.forEach(a => {
      const div = document.createElement("div");
      div.className = "card " + (a.is_officer ? "officer" : "");
  
      div.innerHTML = `
        <h4>${a.profiles.username} ${a.is_officer ? "(Officer)" : ""}</h4>
        <p>${a.text}</p>
        <small>${new Date(a.created_at).toLocaleString()}</small>
      `;
  
      list.appendChild(div);
    });
  }
  
  async function postAdvice() {
    const profile = await getProfile();
    const text = document.getElementById("advice-text").value;
  
    await supabase.from("advice").insert({
      user_id: profile.id,
      text,
      is_officer: profile.is_officer
    });
  
    document.getElementById("advice-text").value = "";
    loadAdvice();
  }
  
  loadAdvice();
  