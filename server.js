const express = require("express");
const { julian, moonposition, solar } = require("astronomia");

const app = express();

const cors = require('cors'); // Import CORS middleware

// Enable CORS for all origins (or specify only your frontend)
// app.use(cors({ origin: 'https://panchang-puzzle.glitch.me' }));
// app.use(cors({ origin: 'https://pd2.github.io/' }));

// List of allowed origins
const allowedOrigins = [
  'https://panchang-puzzle.glitch.me',
  'https://pd2.github.io',
  // add more origins as needed
];

// Enable CORS dynamically based on origin
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like from curl or mobile apps)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  }
}));

let year, month, day;

// Convert Date to Julian Day
function getJulianDay(dateString) {
    [year, month, day] = dateString.split("-").map(Number);
    return julian.CalendarGregorianToJD(year, month, day, 0);
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

// var nakshatra_num, raashi_num, maasa_num;

function ayanamsha(year) {
  let ayan = 50.29 * (year - 285) / 3600; // from arc sec to deg
  return ayan;
}

const nakshatras = [
    "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
    "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
    "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
    "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha",
    "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
];

const nakshatras_dn = [
  "अश्विनी","भरणी","कृत्तिका","रोहिणी","मृगशिर","आर्द्रा","पुनर्वसु","पुष्य","आश्लेषा","मघा",
  "पूर्व फाल्गुनी","उत्तर फाल्गुनी","हस्त","चित्रा","स्वाति","विशाखा","अनुराधा","ज्येष्ठा",
  "मूल","पूर्व आषाढा", "उत्तर आषाढा","श्रवण","धनिष्ठा","शतभिष","पूर्व भाद्रपदा","उत्तर भाद्रपदा","रेवती"
];

// Get Nakshatra
function getNakshatra(moonLongitude) {
  let nakshatra_num = Math.floor( ((moonLongitude - ayanamsha(year) + 360)%360) / 13.3333);
  
  return nakshatra_num;
}

const rashis = [
    "Aries", "Taurus", "Gemini", "Cancer",
    "Leo", "Virgo", "Libra", "Scorpio",
    "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

const rashis_dn = [
  "मेष","वृषभ","मिथुन","कर्क","सिंह","कन्या","तुला","वृश्चिक","धनु","मकर","कुंभ","मीन"
];

// Get Rashi
function getRashi(moonLongitude) {
    // Check for edge cases at the boundary, where the longitude is near 360
    let raashi_num = Math.floor( ((moonLongitude - ayanamsha(year) + 360)%360) / 30);

    return raashi_num;
}

const maasas = [
    "Chaitra", "Vaishakha", "Jyeshtha", "Ashadha",
    "Shravana", "Bhadrapada", "Ashwina", "Kartika",
    "Margashirsha", "Pausha", "Magha", "Phalguna"
];

const maasas_dn = [
  "चैत्र","वैशाख","ज्येष्ठ","आषाढ़","श्रावण","भाद्रपद","अश्विन","कार्तिक","मार्गशीर्ष","पौष","माघ","फाल्गुन"
];

// Compute Solar Month (Maasa)
function getMaasa(sunLongitude) {
    // const sunRashi = Math.floor( (sunLongitude - ayanamsha) / 30);
    // const moonRashi = Math.floor( (moonLongitude - ayanamsha) / 30);
    
    let maasa_num = Math.floor( sunLongitude / 30);

    return maasa_num;
}

// let date;

// API Endpoint
app.get("/panchang", (req, res) => {
    // const date = new Date();
    let date = req.query.date || new Date().toISOString().split("T")[0]; // Defaults to today
  
    const julianDay = getJulianDay(date);
    const moonLongitude = getMoonLongitude(julianDay);
    const sunLongitude = getSunLongitude(julianDay);

    let nakshatra_no = getNakshatra(moonLongitude);
    let raashi_no = getRashi(moonLongitude);
    let maasa_no = getMaasa(sunLongitude);

    res.json({
        date: date,
        nakshatra: nakshatras[nakshatra_no],
        rashi: rashis[raashi_no],
        maasa: maasas[maasa_no],      
        nakshatra_num: nakshatra_no,
        raashi_num: raashi_no,
        maasa_num: maasa_no,
        नक्षत्र: nakshatras_dn[nakshatra_no],
        राशि: rashis_dn[raashi_no],
        मासा: maasas_dn[maasa_no],
    });
});

app.get("/debug", (req, res) => {
    // const date = new Date();
    let date = req.query.date || new Date().toISOString().split("T")[0]; // Defaults to today

    const julianDay = getJulianDay(date);
    const moonLongitude = getMoonLongitude(julianDay);
    const sunLongitude = getSunLongitude(julianDay);

    let nakshatra_no = getNakshatra(moonLongitude);
    let raashi_no = getRashi(moonLongitude);
    let maasa_no = getMaasa(sunLongitude);

    res.json({
        date: date,
        moonLongitude: moonLongitude,
        sunLongitude: sunLongitude,
        ayanamsha: ayanamsha(year),
        nakshatra_no: nakshatra_no,
        raashi_no: raashi_no,
        maasa_no: maasa_no,
        nakshatra_num: Math.floor(Math.random()*27),
        raashi_num: Math.floor(Math.random()*12),
        maasa_num: Math.floor(Math.random()*12)
    });
});

app.get('/moon', (req, res) => {
    // const date = new Date();
    let date = req.query.date || new Date().toISOString().split("T")[0]; // Defaults to today

    const julianDay = getJulianDay(date);
    const moonLongitude = getMoonLongitude(julianDay);
    res.json({ moonLongitude, date: date }); // Always fresh values
});

app.get('/sun', (req, res) => {
    // const date = new Date();
    let date = req.query.date || new Date().toISOString().split("T")[0]; // Defaults to today
    const julianDay = getJulianDay(date);
    const sunLongitude = getSunLongitude(julianDay);
    res.json({ sunLongitude, date: date }); // Always fresh values
});


// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
