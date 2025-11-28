// Login
async function login() {
    const email = document.getElementById("email").value;
    const pass = document.getElementById("password").value;
  
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: pass
    });
  
    if (error) return alert(error.message);
    location.href = "dashboard.html";
  }
 
  // Signup
  async function signup() {
    const email = document.getElementById("su-email").value;
    const username = document.getElementById("su-username").value;
    const pass = document.getElementById("su-password").value;
    const isOfficer = document.getElementById("su-officer").checked;
  
    const { data, error } = await supabase.auth.signUp({
      email,
      password: pass,
    });
  
    if (error) {
      alert(error.message);
      return;
    }
  
    const userId = data.user?.id || data.session?.user?.id;
  
    if (!userId) {
      alert("Account created! Please check your email to verify before logging in.");
      return;
    }
  
    const { error: profileError } = await supabase.from("profiles").insert({
      id: userId,
      username,
      is_officer: isOfficer,
    });
  
    if (profileError) {
      console.error(profileError);
      alert("Account created, but failed to save profile.");
      return;
    }
  
    alert("Account created! Please verify your email, then log in.");
  }
  
  // Get user + profile
  async function getProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) location.href = "index.html";
  
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
  
    return data;
  }
  
  // Logout
  async function logout() {
    await supabase.auth.signOut();
    location.href = "index.html";
  }
  