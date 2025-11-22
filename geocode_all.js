import fs from "fs";

// === LOAD FULL LIST ===
const addresses = JSON.parse(fs.readFileSync("./all.json", "utf-8"));

// === Ensure data/ folder exists ===
if (!fs.existsSync("./data")) {
    fs.mkdirSync("./data");
}

// --- Load progress ---
let progress = 0;
if (fs.existsSync("./data/progress.json")) {
    progress = JSON.parse(fs.readFileSync("./data/progress.json", "utf-8")).index;
    console.log("▶ Продовжуємо з адреси:", progress);
}

// --- Load partial results ---
let withCoords = [];
let withoutCoords = [];

if (fs.existsSync("./data/with_coords_temp.json")) {
    withCoords = JSON.parse(fs.readFileSync("./data/with_coords_temp.json", "utf-8"));
}
if (fs.existsSync("./data/unknown_temp.json")) {
    withoutCoords = JSON.parse(fs.readFileSync("./data/unknown_temp.json", "utf-8"));
}

// === Geocoder (Львів лише) ===
async function geocode(address) {
    const query = encodeURIComponent(`${address.building}, ${address.street}, Львів, Україна`);
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1&bounded=1&viewbox=23.9000,49.9100,24.1500,49.7900&countrycodes=ua`;

    try {
        const res = await fetch(url, {
            headers: {
                "User-Agent": "LvivElectricityMap/1.0 (bonace3003@gamepec.com)"
            }
        });

        const contentType = res.headers.get("content-type") || "";
        if (!contentType.includes("application/json")) {
            console.log("HTML returned, skipping:", address.street, address.building);
            return { lat: null, lng: null };
        }

        const data = await res.json();
        if (!data || data.length === 0) return { lat: null, lng: null };

        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);

        // Перевірка, що координати всередині Львова
        if (lat < 49.7900 || lat > 49.9100 || lon < 23.9000 || lon > 24.1500) {
            return { lat: null, lng: null };
        }

        return { lat, lng: lon };
    } catch (e) {
        console.log("Fetch error:", address.street, address.building, e);
        return { lat: null, lng: null };
    }
}

// === SAFE SAVE FUNCTIONS ===
function saveProgress(index) {
    fs.writeFileSync("./data/progress.json", JSON.stringify({ index }), "utf-8");
}

function savePartials() {
    fs.writeFileSync("./data/with_coords_temp.json", JSON.stringify(withCoords, null, 2), "utf-8");
    fs.writeFileSync("./data/unknown_temp.json", JSON.stringify(withoutCoords, null, 2), "utf-8");
}

// === MAIN ===
async function main() {
    for (let i = progress; i < addresses.length; i++) {
        const addr = addresses[i];
        console.log(`(${i + 1}/${addresses.length}) Geocoding: ${addr.street} ${addr.building}`);

        const coords = await geocode(addr);

        const record = {
            street: addr.street,
            building: addr.building,
            group: addr.group,
            lat: coords.lat,
            lng: coords.lng
        };

        if (coords.lat != null && coords.lng != null) {
            withCoords.push(record);
        } else {
            withoutCoords.push(record);
        }

        // save state after each address
        savePartials();
        saveProgress(i + 1);

        // пауза між запитами
        await new Promise(r => setTimeout(r, 0));
    }

    console.log("\n=== Геокодування завершено ===");
    console.log(`З координатами: ${withCoords.length}`);
    console.log(`Без координат: ${withoutCoords.length}`);

    // --- final JSON files ---
    fs.writeFileSync("./data/addresses_with_coords.json", JSON.stringify(withCoords, null, 2), "utf-8");

    // all.json без будинків з unknown coordinates, без lat/lng
    const allClean = withCoords.map(({ street, building, group }) => ({ street, building, group }));
    fs.writeFileSync("./data/all_sorted.json", JSON.stringify(allClean, null, 2), "utf-8");

    // unknown coordinates
    fs.writeFileSync("./data/unknown_coordinates.json", JSON.stringify(withoutCoords, null, 2), "utf-8");

    console.log("Фінальні файли збережені в /data/");
}

main();
