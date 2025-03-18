const express = require("express");
const { julian, moonposition, solar } = require("astronomia");

const app = express();

// const swisseph = require('swisseph');

// let sun_Lon;
/*
async function getSun_Longitude() {
    return new Promise((resolve, reject) => {
        const now = new Date();
        
        // Convert current date to Julian Day
        swisseph.swe_julday(
            now.getFullYear(), 
            now.getMonth() + 1, 
            now.getDate() + now.getHours() / 24, 
            swisseph.SE_GREG_CAL, 
            (jd) => {
                // Compute Sun's longitude
              swisseph.swe_calc_ut(jd, swisseph.SE_SUN, 0, (res) => {
                    if (res.error) {
                        reject(new Error(res.error));
                    } else {
                        resolve(res.longitude || res[0]); // Return longitude in degrees
                    }
                });
            }
        );
    });
}

(async () => {
    try {
        const sunLon = await getSun_Longitude();
        console.log("Sun True Longitude:", sunLon);
    } catch (error) {
        console.error("Error computing Sun longitude:", error);
    }
})();

//getSunLongitude().then(lon => console.log("Sun True Longitude:", lon));
*/

const cors = require('cors'); // Import CORS middleware

// Enable CORS for all origins (or specify only your frontend)
app.use(cors({ origin: 'https://panchang-puzzle.glitch.me' }));

// Convert Date to Julian Day
function getJulianDay(date) {
    return julian.CalendarGregorianToJD(date.getFullYear(), date.getMonth() + 1, date.getDate());
}

// import {data, planetposition} from 'astronomia'
// const {vsop87Bearth} = require('astronomia').data;
// Load VSOP87 data for Earth
// const earth = new planetposition.Planet('earth');

// Moon's Longitude Function
function getMoonLongitude(julianDay) {
    const moonPos = moonposition.position(julianDay);
    return ((moonPos.lon * 180 / Math.PI + 360) % 360); // Moon's longitude
}

// Sun Longitude Function
function getSunLongitude(julianDay) {
    const sunPos = solar.apparentEquatorial(julianDay);
    return ((sunPos.lon * 180 / Math.PI + 360) % 360); // Sun's longitude
}

var nakshatra_num, raashi_num, maasa_num;

var ayanamsha = 50.29 * (new Date().getFullYear() - 285) / 3600; // from arc sec to deg

// Get Nakshatra
function getNakshatra(moonLongitude) {
    const nakshatras = [
        "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
        "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
        "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
        "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha",
        "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
    ];
  
  nakshatra_num = Math.floor( ((moonLongitude - ayanamsha + 360)%360) / 13.3333);
  
  return nakshatras[nakshatra_num];
}

// Get Rashi
function getRashi(moonLongitude) {
    const rashis = [
        "Mesha (Aries)", "Vrishabha (Taurus)", "Mithuna (Gemini)", "Karka (Cancer)",
        "Simha (Leo)", "Kanya (Virgo)", "Tula (Libra)", "Vrishchika (Scorpio)",
        "Dhanu (Sagittarius)", "Makara (Capricorn)", "Kumbha (Aquarius)", "Meena (Pisces)"
    ];

    // Check for edge cases at the boundary, where the longitude is near 360
    raashi_num = Math.floor( ((moonLongitude - ayanamsha + 360)%360) / 30);

    return rashis[raashi_num];
}




// Compute Solar Month (Maasa)
function getMaasa(sunLongitude, moonLongitude) {
    const maasas = [
        "Chaitra", "Vaishakha", "Jyeshtha", "Ashadha",
        "Shravana", "Bhadrapada", "Ashwina", "Kartika",
        "Margashirsha", "Pausha", "Magha", "Phalguna"
    ];
    // const sunRashi = Math.floor( (sunLongitude - ayanamsha) / 30);
    // const moonRashi = Math.floor( (moonLongitude - ayanamsha) / 30);
    
    maasa_num = Math.floor( sunLongitude / 30);

    return maasas[maasa_num];
}


// API Endpoint
app.get("/panchang", (req, res) => {
    const date = new Date();
    const julianDay = getJulianDay(date);
    const moonLongitude = getMoonLongitude(julianDay);
    const sunLongitude = getSunLongitude(julianDay);

    res.json({
        date: date.toISOString(),
        nakshatra: getNakshatra(moonLongitude),
        rashi: getRashi(moonLongitude),
        maasa: getMaasa(sunLongitude, moonLongitude),
        nakshatra_num: nakshatra_num,
        raashi_num: raashi_num,
        maasa_num: maasa_num
    });
});

app.get("/debug", (req, res) => {
    const date = new Date();
    const julianDay = getJulianDay(date);
    const moonLongitude = getMoonLongitude(julianDay);
    const sunLongitude = getSunLongitude(julianDay);

    res.json({
        date: date.toISOString(),
        moonLongitude: moonLongitude,
        sunLongitude: sunLongitude,
        ayanamsha: ayanamsha,
        nakshatra_no: nakshatra_num,
        raashi_no: raashi_num,
        maasa_no: maasa_num,
        nakshatra_num: Math.floor(Math.random()*27),
        raashi_num: Math.floor(Math.random()*12),
        maasa_num: Math.floor(Math.random()*12)
    });
});

app.get('/moon', (req, res) => {
    const date = new Date();
    const julianDay = getJulianDay(date);
    const moonLongitude = getMoonLongitude(julianDay);
    res.json({ moonLongitude, date: new Date().toISOString() }); // Always fresh values
});


// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
