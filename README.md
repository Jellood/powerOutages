# ⚡ Lviv Electricity Map

Visualize electricity shutdowns in Lviv!  
Get coordinates for addresses and display them interactively on a map.

---

## 🗂 Project Structure

```
.
├── all.json                 # Full list of addresses (street, building, group)
├── geocode_all.js           # Script to geocode all houses
├── map.html                 # Interactive map visualization
├── data/                    # Temporary and final JSON files
│   ├── with_coords_temp.json
│   ├── unknown_temp.json
│   ├── addresses_with_coords.json
│   ├── all_sorted.json
│   └── unknown_coordinates.json
└── package.json
```

---

## ⚙️ Installation

1. Clone the repository or copy files to a local directory.  
2. Install **Node.js 18+** (needed for `fetch`).  
3. Install dependencies (if any):

```bash
npm install
```

4. Make sure `all.json` contains the full list of addresses.

---

## 🚀 Usage

### 🏠 Geocoding Houses

```bash
node geocode_all.js
```

- Progress is saved in `data/progress.json` → you can **stop and resume** anytime.  
- Temporary results stored in:  
  - `data/with_coords_temp.json`  
  - `data/unknown_temp.json`  
- Final files after completion:  
  - `addresses_with_coords.json` — all houses with coordinates  
  - `all_sorted.json` — sorted houses with coordinates  
  - `unknown_coordinates.json` — houses not found  

✅ The console shows **status per house** and percentage of successful geocoding.

---

### 🗺 Map Visualization

Start a local server:

```bash
npx http-server . -p 5500
```

Open in browser:

```
http://localhost:5500/map.html
```

- **Red markers** show houses with coordinates.  
- Click a marker → see **street, building, electricity group**.  
- Map loads latest data from `data/with_coords_temp.json`.  
- Auto-refreshes every **15 seconds** to show updated info.

---

## 💡 Tips

- The script includes a **1.2-second delay** between requests → prevents Nominatim overload.  
- Expand abbreviations in `all.json` (e.g., `"B."` → `"Bohdana"`) for better accuracy.  
- Coordinates limited to **Lviv only** → more precise results.  
- If the browser shows a cached map → press **Shift+F5** or clear cache.

---
