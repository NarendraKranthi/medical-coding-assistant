const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

/* ---------------- CACHE ---------------- */
// simple in-memory cache
const cache = {};
const CACHE_TTL = 1000 * 60 * 60 * 24; // 24 hours

function getCache(key){
  const item = cache[key];
  if(!item) return null;

  if(Date.now() - item.time > CACHE_TTL){
    delete cache[key];
    return null;
  }
  return item.data;
}

function setCache(key, data){
  cache[key] = {
    data,
    time: Date.now()
  };
}

/* ---------------- CPT → LCD MAP ---------------- */
// Extend this over time
const CPT_LCD_MAP = {

  "97810": {
    CA: "L35036",
    TX: "L36402",
    general: "L35036"
  },

  "20553": {
    CA: "L34587",
    TX: "L34587",
    general: "L34587"
  },

  "20550": {
    CA: "L34587",
    TX: "L34587",
    general: "L34587"
  }

  // E/M codes intentionally not mapped
};

/* ---------------- HELPERS ---------------- */

function isEM(cpt){
  return /^99/.test(cpt);
}

function extractICDsFromHTML($){
  let icds = new Set();

  $("table tr").each((i, row) => {
    const text = $(row).text();

    // Match ICD-10 pattern
    const matches = text.match(/\b[A-Z][0-9][0-9A-Z.]{0,6}\b/g);

    if(matches){
      matches.forEach(code => {
        // Filter junk
        if(code.length >= 3 && code.length <= 8){
          icds.add(code.trim());
        }
      });
    }
  });

  return Array.from(icds);
}

/* ---------------- MAIN API ---------------- */

app.get("/lcd/:cpt/:state", async (req, res) => {

  const { cpt, state } = req.params;

  /* -------- E/M HANDLING -------- */
  if(isEM(cpt)){
    return res.json({
      type: "EM",
      message: "E/M service – generally covered",
      icds: [],
      lcd: null
    });
  }

  /* -------- FIND LCD -------- */
  const lcdId =
    CPT_LCD_MAP[cpt]?.[state] ||
    CPT_LCD_MAP[cpt]?.["general"];

  if(!lcdId){
    return res.json({
      error: "No LCD mapping available",
      cpt,
      state
    });
  }

  const cacheKey = `${cpt}_${state}_${lcdId}`;

  /* -------- CHECK CACHE -------- */
  const cached = getCache(cacheKey);
  if(cached){
    return res.json({ ...cached, cached: true });
  }

  try {

    const url = `https://www.cms.gov/medicare-coverage-database/view/lcd.aspx?LCDId=${lcdId}`;

    const response = await axios.get(url, {
      timeout: 15000
    });

    const $ = cheerio.load(response.data);

    /* -------- EXTRACT ICDs -------- */
    const icds = extractICDsFromHTML($);

    const result = {
      cpt,
      state,
      lcd: lcdId,
      icds: icds.slice(0, 200) // limit for performance
    };

    /* -------- SAVE CACHE -------- */
    setCache(cacheKey, result);

    res.json(result);

  } catch (err) {

    res.json({
      error: "CMS fetch failed",
      details: err.message
    });
  }

});

/* ---------------- HEALTH CHECK ---------------- */
app.get("/", (req, res) => {
  res.send("Medical Coding Backend Running ✅");
});

/* ---------------- START SERVER ---------------- */
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
