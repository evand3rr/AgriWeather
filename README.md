# AgriWeather 🌾☁️

AgriWeather is a prototype web app that gives smallholder farmers simple, local weather insights, crop advice, and flood/incident alerts.  
It’s built as a **pure frontend** (HTML/CSS/JS) using **Supabase** for auth + data and **OpenWeather** for live weather.

---

## 1. Features

**For Farmers**
- 🔐 Email-based signup & login (via Supabase Auth)
- 📊 Dashboard with:
  - Current weather (auto-GPS or manual city search)
  - Quick summary of active alerts
  - Latest crop advice
  - “Your Questions” list – see answers from officers
- ❓ Ask a question to an extension officer
- 👤 Profile page to store:
  - Location
  - Farm size
  - Main crops
  - Soil and risk information

**For Extension Officers**
- ✏️ Post personalized **crop advice** (advice board)
- 🚨 Post **alerts** (e.g. pests, disease, floods) that show on:
  - Alerts page
  - Farmer dashboards

**For Admins**
- 🧩 Admin view (admin.html) to:
  - See all farmer questions
  - Mark questions as answered

SIGN-UP/LOG IN:
Go to index.html.

For a farmer account:

Enter email, username, password.

Leave “Extension Officer” unchecked.

For an officer account:

Enter email, username, password.

Tick “Extension Officer” – this sets is_officer = true.

Click Sign Up.

(Depending on Supabase settings) confirm your email.

Log in via the Login form (same page).

On successful login you’ll be redirected to dashboard.html.