# 🇳🇵 Nepal Weather & Bay of Bengal Rain Tracker
### नेपाल मौसम, वर्षा तथा बाढी पूर्वसूचना प्रणाली

A production-ready meteorological web application built to monitor cyclonic systems, depressions, and monsoon low-pressure areas forming in the **Bay of Bengal** and track rainfall accumulation, river discharge, and landslide hazards across all **7 provinces and 77 districts of Nepal**.

Engineered with a **Nepal National Flag Theme** (Crimson Red `#DC143C`, Deep Royal Blue `#003893`, and Pure White `#FFFFFF`).

---

## 🌟 Key Features

1. **🌀 Bay of Bengal Synoptic System Tracker**
   * Real-time depression classification, central barometric pressure (hPa), maximum wind gusts, and movement vector.
   * Proximity tracking indicating distance and travel time of moisture fronts entering Eastern Nepal (Jhapa / Biratnagar / Koshi Basin).
   * Synoptic explanation of the Himalayan orographic lift effect.

2. **🗺️ Interactive Nepal Meteorological Radar Map**
   * High-contrast CartoDB Dark Matter basemap centered on Nepal and expandable to the Bay of Bengal.
   * **Live RainViewer Radar Layer**: Scrubbable and animated weather radar loop showing real-time rain clouds.
   * **Satellite Cloud Cover Layer**: South Asia regional infrared cloud imagery.
   * **District Risk Choropleth**: Color-coded risk markers for all 77 districts based on 24h, 48h, and 72h forecasted precipitation.
   * **River Basins Overlay**: Major river paths (Koshi, Bagmati, Narayani/Gandaki, Karnali).

3. **🌊 River Basin Flood Hazard Index & Highway Advisories**
   * Real-time risk categorization for key basins: **Koshi Basin**, **Bagmati River Basin**, **Gandaki/Narayani Basin**, **Terai Flash-Flood Streams**, and **Karnali Basin**.
   * Department of Hydrology & Meteorology (DHM) aligned alert thresholds (🟢 Normal, 🟡 Watch, 🟠 Warning, 🔴 Extreme Danger).
   * Highway vulnerability status for **Prithvi Highway**, **Narayanghat-Mugling Highway**, and **BP Highway**.

4. **📊 77-District Rain Explorer & 48-Hour Hourly Profile**
   * Fast fuzzy search and province filter tabs across all 77 districts.
   * Click any district to open the detailed forecast drawer with **Recharts hourly rainfall intensity (mm/hr) and cumulative accumulation (mm)** curves.
   * 7-day extended synoptic trend with temperature, humidity, surface pressure, and rain probabilities.

5. **🚨 Emergency Hotline & Public Safety Center**
   * One-tap phone links to DHM Flood Toll-Free (`1155`), Nepal Police (`100`), Armed Police Force Disaster Management (`1114`), Ambulance (`1130`), and Highway Police (`103`).
   * Essential flash flood, cloudburst, and landslide safety checklists.

---

## 🆓 100% Free & Open Resources (Zero API Keys Required)

* **Open-Meteo API**: Global ECMWF & GFS ensemble models providing hourly precipitation, wind gusts, and pressure with **no API key and no credit card required**.
* **RainViewer API**: Public radar and satellite tile feeds for animated live radar loops.
* **CartoDB & OpenStreetMap**: Free dark-mode map tiles for Leaflet.
* **Vercel**: Deployable on Vercel's free Hobby plan with zero configuration.

---

## 🚀 How to Run Locally

```bash
# Navigate to the project directory
cd nepal-weather-tracker

# Install dependencies (already installed)
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📦 How to Push to GitHub and Deploy to Vercel

### Step 1: Create a GitHub Repository
1. Go to [github.com/new](https://github.com/new).
2. Name your repository (e.g. `nepal-weather-tracker`).
3. Leave "Initialize with a README" unchecked (since we already have one).
4. Click **Create repository**.

### Step 2: Push Your Local Code to GitHub
Run the following commands in your terminal inside `/Users/success/nepal-weather-tracker`:

```bash
# Add all files to git
git add .

# Commit your changes
git commit -m "Initial commit: Nepal Weather & Bay of Bengal Rain Tracker"

# Set default branch to main
git branch -M main

# Link your local repo to your GitHub repo (replace with your GitHub URL)
git remote add origin https://github.com/YOUR_USERNAME/nepal-weather-tracker.git

# Push to GitHub
git push -u origin main
```

### Step 3: Deploy to Vercel (1-Click)
1. Go to [vercel.com](https://vercel.com) and log in with your GitHub account.
2. Click **"Add New..."** &rarr; **"Project"**.
3. Select your `nepal-weather-tracker` repository from the list.
4. Leave all settings at default (Vercel automatically detects Next.js).
5. Click **"Deploy"**.

Your live website will be generated and available on a free `*.vercel.app` domain with automatic HTTPS in less than 60 seconds!

---

## 🛠️ Tech Stack

* **Framework**: Next.js 15+ (App Router)
* **Language**: TypeScript
* **Styling**: Tailwind CSS v4 (Nepal Flag Palette: Crimson `#DC143C`, Navy Blue `#003893`, Pure White)
* **Interactive Maps**: Leaflet.js (CartoDB Dark Matter basemap)
* **Charts**: Recharts (48-hour hourly curves & cumulative precipitation)
* **Icons**: Lucide React
* **Weather Data**: Open-Meteo & RainViewer
