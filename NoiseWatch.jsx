import React, { useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ReferenceLine } from "recharts";

/* ---------------------------------------------------------
   Data derived from mumbai_diwali_2023_2024.csv (day/night Leq
   by zone type + festival stage) and mumbai_ganesh_2024_hourly.csv
   (real hourly readings, 18:00-24:00, averaged by zone).
--------------------------------------------------------- */

const LOCATIONS = [
  { name: "Colaba", lat: 18.9067, lon: 72.8147, zone: "Silence", city: "Mumbai" },
  { name: "Mantralaya", lat: 18.9257, lon: 72.8235, zone: "Silence", city: "Mumbai" },
  { name: "Mazgaon", lat: 18.9647, lon: 72.8479, zone: "Commercial", city: "Mumbai" },
  { name: "Girgaon", lat: 18.9515, lon: 72.8198, zone: "Commercial", city: "Mumbai" },
  { name: "Hindu Colony", lat: 19.0176, lon: 72.8479, zone: "Residential", city: "Mumbai" },
  { name: "Kamathipura", lat: 18.9647, lon: 72.8258, zone: "Commercial", city: "Mumbai" },
  { name: "Mahim", lat: 19.041, lon: 72.8397, zone: "Residential", city: "Mumbai" },
  { name: "Malabar Hills", lat: 18.9548, lon: 72.796, zone: "Residential", city: "Mumbai" },
  { name: "Matunga", lat: 19.0272, lon: 72.8547, zone: "Residential", city: "Mumbai" },
  { name: "Byculla", lat: 18.975, lon: 72.833, zone: "Commercial", city: "Mumbai" },
  { name: "Dadar", lat: 19.0178, lon: 72.8478, zone: "Commercial", city: "Mumbai" },
  { name: "Parel", lat: 19.008, lon: 72.841, zone: "Commercial", city: "Mumbai" },
  { name: "Prabhadevi", lat: 19.017, lon: 72.825, zone: "Residential", city: "Mumbai" },
  { name: "Sion", lat: 19.043, lon: 72.862, zone: "Residential", city: "Mumbai" },
  { name: "Worli", lat: 19.01, lon: 72.817, zone: "Residential", city: "Mumbai" },
  { name: "Andheri", lat: 19.1197, lon: 72.8468, zone: "Commercial", city: "Mumbai" },
  { name: "Bandra", lat: 19.0596, lon: 72.8295, zone: "Commercial", city: "Mumbai" },
  { name: "Bhandup", lat: 19.144, lon: 72.937, zone: "Residential", city: "Mumbai" },
  { name: "Borivali", lat: 19.2288, lon: 72.8567, zone: "Residential", city: "Mumbai" },
  { name: "Chembur (East)", lat: 19.0553, lon: 72.9042, zone: "Residential", city: "Mumbai" },
  { name: "Chembur (West)", lat: 19.05, lon: 72.895, zone: "Residential", city: "Mumbai" },
  { name: "Chinchpokali (E)", lat: 18.98, lon: 72.834, zone: "Commercial", city: "Mumbai" },
  { name: "Chinchpokali (W)", lat: 18.979, lon: 72.83, zone: "Commercial", city: "Mumbai" },
  { name: "Dadar (East)", lat: 19.0189, lon: 72.8508, zone: "Commercial", city: "Mumbai" },
  { name: "Dadar (West)", lat: 19.017, lon: 72.842, zone: "Commercial", city: "Mumbai" },
  { name: "Elphinstone", lat: 19.0, lon: 72.83, zone: "Commercial", city: "Mumbai" },
  { name: "Ghatkopar (E)", lat: 19.086, lon: 72.9081, zone: "Residential", city: "Mumbai" },
  { name: "Girgaon Chowpati", lat: 18.953, lon: 72.8138, zone: "Residential", city: "Mumbai" },
  { name: "Grant Road", lat: 18.963, lon: 72.8145, zone: "Commercial", city: "Mumbai" },
  { name: "Juhu Chowpati", lat: 19.1075, lon: 72.8263, zone: "Residential", city: "Mumbai" },
  { name: "Kandivali (East)", lat: 19.2039, lon: 72.8697, zone: "Residential", city: "Mumbai" },
  { name: "Kandivali (West)", lat: 19.2065, lon: 72.836, zone: "Residential", city: "Mumbai" },
  { name: "Khar", lat: 19.0728, lon: 72.837, zone: "Residential", city: "Mumbai" },
  { name: "Mulund", lat: 19.1726, lon: 72.9425, zone: "Residential", city: "Mumbai" },
  { name: "Mumbai Central", lat: 18.97, lon: 72.8194, zone: "Commercial", city: "Mumbai" },
  { name: "Santacruz (East)", lat: 19.0825, lon: 72.8562, zone: "Residential", city: "Mumbai" },
  { name: "Vikhroli", lat: 19.109, lon: 72.928, zone: "Residential", city: "Mumbai" },
  { name: "Wadala", lat: 19.017, lon: 72.861, zone: "Residential", city: "Mumbai" },

  // Pune -- coordinates approximate; zone data is SYNTHETIC (see pune_diwali_SYNTHETIC_placeholder.csv)
  { name: "Shivajinagar", lat: 18.5305, lon: 73.8524, zone: "Silence", city: "Pune" },
  { name: "Sassoon Hospital Area", lat: 18.5195, lon: 73.8553, zone: "Silence", city: "Pune" },
  { name: "Pune Cantonment", lat: 18.5074, lon: 73.8797, zone: "Silence", city: "Pune" },
  { name: "Camp", lat: 18.5122, lon: 73.8792, zone: "Commercial", city: "Pune" },
  { name: "Deccan Gymkhana", lat: 18.5195, lon: 73.8386, zone: "Commercial", city: "Pune" },
  { name: "Swargate", lat: 18.5, lon: 73.8567, zone: "Commercial", city: "Pune" },
  { name: "Market Yard", lat: 18.489, lon: 73.857, zone: "Commercial", city: "Pune" },
  { name: "Koregaon Park", lat: 18.5362, lon: 73.8938, zone: "Commercial", city: "Pune" },
  { name: "Kothrud", lat: 18.5074, lon: 73.8077, zone: "Residential", city: "Pune" },
  { name: "Aundh", lat: 18.559, lon: 73.8077, zone: "Residential", city: "Pune" },
  { name: "Baner", lat: 18.559, lon: 73.7868, zone: "Residential", city: "Pune" },
  { name: "Hadapsar", lat: 18.5089, lon: 73.926, zone: "Residential", city: "Pune" },
  { name: "Katraj", lat: 18.453, lon: 73.857, zone: "Residential", city: "Pune" },
  { name: "Viman Nagar", lat: 18.5679, lon: 73.9143, zone: "Residential", city: "Pune" },
  { name: "Hinjewadi", lat: 18.5913, lon: 73.7389, zone: "Residential", city: "Pune" },
];

// Trained from mumbai_diwali_2023_2024.csv: mean day_leq / night_leq per zone x stage
const DIWALI_MODEL_MUMBAI = {
  Commercial: {
    pre_diwali: { day: 74.9, night: 67.1 },
    diwali: { day: 76.7, night: 71.2 },
    post_diwali: { day: 75.9, night: 70.3 },
  },
  Residential: {
    pre_diwali: { day: 75.4, night: 68.9 },
    diwali: { day: 73.5, night: 66.1 },
    post_diwali: { day: 72.9, night: 68.1 },
  },
  Silence: {
    pre_diwali: { day: 79.0, night: 69.8 },
    diwali: { day: 83.6, night: 74.8 },
    post_diwali: { day: 81.1, night: 69.3 },
  },
};

// From pune_diwali_SYNTHETIC_placeholder.csv -- FABRICATED for demo purposes, not a real
// MPCB reading. Same structure as the Mumbai model so it can be swapped for real data later.
const DIWALI_MODEL_PUNE = {
  Commercial: {
    pre_diwali: { day: 74.6, night: 66.0 },
    diwali: { day: 75.6, night: 68.9 },
    post_diwali: { day: 75.0, night: 67.9 },
  },
  Residential: {
    pre_diwali: { day: 75.3, night: 66.7 },
    diwali: { day: 72.6, night: 64.7 },
    post_diwali: { day: 71.4, night: 66.6 },
  },
  Silence: {
    pre_diwali: { day: 77.5, night: 67.8 },
    diwali: { day: 82.6, night: 72.6 },
    post_diwali: { day: 78.3, night: 67.2 },
  },
};

const DIWALI_MODEL_BY_CITY = { Mumbai: DIWALI_MODEL_MUMBAI, Pune: DIWALI_MODEL_PUNE };

// From mumbai_ganesh_2024_hourly.csv: mean real Leq per zone during the 18:00-24:00
// immersion/procession window (the only hours Ganesh data actually measured).
const GANESH_EVENING_REAL = {
  Commercial: 72.8,
  Residential: 73.6,
  Silence: 73.2, // no Silence-zone rows in Ganesh data; blended estimate
};
// Real dB deviation from that evening mean, hour by hour (18-23), derived from the
// Ganesh hourly columns directly -- these ARE measured, not assumed.
const GANESH_EVENING_OFFSET = {
  18: -1.27, 19: 1.21, 20: 2.33, 21: 2.31, 22: 0.1, 23: -4.68,
};

// Generic urban diurnal offsets for hours with NO ground truth in any dataset
// (assumption only -- used to shape the "ordinary" part of the day for every festival).
const GENERIC_OFFSET = {
  0: -8, 1: -10, 2: -11, 3: -11, 4: -9, 5: -6,
  6: -2, 7: 1, 8: 2, 9: 2, 10: 1, 11: 1, 12: 1, 13: 1, 14: 0, 15: 0, 16: 0, 17: 1,
};

// From navratri_jabalpur_2017_NOT_MUMBAI.csv. This is a DIFFERENT CITY -- Mumbai has
// no Navratri readings in the data provided. We use Jabalpur only as a shape/escalation
// PROXY (how much louder the final day gets vs the early days, and the hour-by-hour
// pattern within the measured slots), never as an absolute Mumbai reading.
// Real hours measured: 8-9AM, 9-10AM, 6-7PM, 7-8PM, 8-9PM, 9-10PM.
const NAVRATRI_STAGE_DELTA = { early: 0, dussehra: 16.71 }; // dB, dussehra vs early-day mean
const NAVRATRI_HOUR_OFFSET = {
  early:    { 8: 0.21, 9: 0.11, 18: -2.69, 19: -0.89, 20: 1.31, 21: 2.01 },
  dussehra: { 8: -9.6, 9: -8.2, 18: 1.0,   19: 5.0,   20: 5.0,  21: 6.8 },
};
const NAVRATRI_REAL_HOURS = new Set([8, 9, 18, 19, 20, 21]);

const THRESHOLDS = {
  general: { low: 55, medium: 70 },
  child: { low: 50, medium: 65 },
  elderly: { low: 50, medium: 63 },
  pregnant: { low: 50, medium: 63 },
  pet: { low: 45, medium: 60 },
};

const RISK_COLOR = { Low: "#4E9A6B", Medium: "#D9A441", High: "#C4483B" };

const GROUPS = [
  { id: "general", label: "General" },
  { id: "child", label: "Child" },
  { id: "elderly", label: "Elderly" },
  { id: "pregnant", label: "Pregnant" },
  { id: "pet", label: "Pet" },
];

const FESTIVALS = [
  {
    id: "diwali",
    label: "Diwali",
    stages: [
      { id: "pre_diwali", label: "Pre-Diwali" },
      { id: "diwali", label: "Main night" },
      { id: "post_diwali", label: "Post-Diwali" },
    ],
  },
  {
    id: "ganesh",
    label: "Ganesh Chaturthi",
    stages: [{ id: "immersion", label: "Immersion day" }],
  },
  {
    id: "navratri",
    label: "Navratri",
    stages: [
      { id: "early", label: "Early Navratri" },
      { id: "dussehra", label: "Final day (Dussehra)" },
    ],
  },
];

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dphi = toRad(lat2 - lat1);
  const dlmb = toRad(lon2 - lon1);
  const a =
    Math.sin(dphi / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dlmb / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function riskLevel(db, group) {
  const t = THRESHOLDS[group];
  if (db < t.low) return "Low";
  if (db < t.medium) return "Medium";
  return "High";
}

function nearestLocation(lat, lon) {
  let best = null;
  let bestDist = Infinity;
  for (const loc of LOCATIONS) {
    const d = haversine(lat, lon, loc.lat, loc.lon);
    if (d < bestDist) {
      bestDist = d;
      best = loc;
    }
  }
  return { ...best, distKm: bestDist };
}

const INPUT_MODES = [
  { id: "known", label: "Known spot" },
  { id: "latlon", label: "Lat / lon" },
];

export default function NoiseWatch() {
  const [inputMode, setInputMode] = useState("known");

  const [selectedLocName, setSelectedLocName] = useState("Dadar (West)");
  const [customLat, setCustomLat] = useState("19.017");
  const [customLon, setCustomLon] = useState("72.842");
  const [festival, setFestival] = useState("diwali");
  const [stage, setStage] = useState("pre_diwali");
  const [group, setGroup] = useState("general");

  const activeFestival = FESTIVALS.find((f) => f.id === festival);

  const point = useMemo(() => {
    if (inputMode === "latlon") {
      const lat = parseFloat(customLat);
      const lon = parseFloat(customLon);
      if (Number.isNaN(lat) || Number.isNaN(lon)) return null;
      return { lat, lon };
    }
    const loc = LOCATIONS.find((l) => l.name === selectedLocName);
    return loc ? { lat: loc.lat, lon: loc.lon } : null;
  }, [inputMode, customLat, customLon, selectedLocName]);

  const match = useMemo(() => {
    if (!point) return null;
    return nearestLocation(point.lat, point.lon);
  }, [point]);

  const hourlyData = useMemo(() => {
    if (!match) return [];
    const zone = match.zone;
    const cityModel = DIWALI_MODEL_BY_CITY[match.city] || DIWALI_MODEL_MUMBAI;
    const dayNightAt = (h, stageKey) => {
      const table = cityModel[zone] || cityModel.Residential;
      const { day, night } = table[stageKey] || table.pre_diwali;
      return h >= 7 && h < 21 ? day : night;
    };

    return Array.from({ length: 24 }, (_, h) => {
      let db, measuredTier; // "local" (real Mumbai hourly), "proxy" (real but different city), "assumed"

      if (festival === "diwali") {
        // Diwali has no true hourly readings, only day/night averages -- always assumed shape.
        db = dayNightAt(h, stage) + (GENERIC_OFFSET[h] ?? (h >= 18 ? GANESH_EVENING_OFFSET[h] : 0));
        measuredTier = "assumed";
      } else if (festival === "ganesh") {
        if (h >= 18 && h <= 23) {
          // Real Mumbai Ganesh readings for this window.
          db = GANESH_EVENING_REAL[zone] + GANESH_EVENING_OFFSET[h];
          measuredTier = "local";
        } else {
          // No Ganesh reading for this hour -- anchor to Mumbai's own pre-Diwali ambient
          // day/night level (closest available "ordinary festival day" baseline) + generic shape.
          db = dayNightAt(h, "pre_diwali") + GENERIC_OFFSET[h];
          measuredTier = "assumed";
        }
      } else {
        // navratri
        const anchor = dayNightAt(h, "pre_diwali") + NAVRATRI_STAGE_DELTA[stage];
        if (NAVRATRI_REAL_HOURS.has(h)) {
          // Real reading, but from Jabalpur (different city) -- used as a shape proxy only.
          db = anchor + NAVRATRI_HOUR_OFFSET[stage][h];
          measuredTier = "proxy";
        } else {
          db = anchor + GENERIC_OFFSET[h];
          measuredTier = "assumed";
        }
      }

      db = Math.round(db * 10) / 10;
      return {
        hour: h,
        label: `${h.toString().padStart(2, "0")}:00`,
        db,
        risk: riskLevel(db, group),
        measuredTier,
      };
    });
  }, [match, festival, stage, group]);

  const peak = hourlyData.reduce(
    (acc, row) => (row.db > acc.db ? row : acc),
    { db: -Infinity }
  );
  const highHours = hourlyData.filter((r) => r.risk === "High").length;

  return (
    <div style={styles.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=IBM+Plex+Sans:wght@400;500;600&display=swap');
      `}</style>

      <header style={styles.header}>
        <div style={styles.kicker}>Mumbai & Pune · Festival noise</div>
        <h1 style={styles.h1}>How loud will tonight get, where you are?</h1>
        <p style={styles.sub}>
          A predicted 24-hour noise curve for your spot, built from MPCB's real
          Diwali and Ganesh Chaturthi readings — not a live sensor feed.
        </p>
      </header>

      <section style={styles.panel}>
        <div style={styles.row}>
          <label style={styles.label}>Location</label>
          <div style={styles.toggleGroup}>
            {INPUT_MODES.map((m) => (
              <button
                key={m.id}
                style={{ ...styles.toggleBtnSm, ...(inputMode === m.id ? styles.toggleBtnActive : {}) }}
                onClick={() => setInputMode(m.id)}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {inputMode === "known" && (
          <select
            style={styles.select}
            value={selectedLocName}
            onChange={(e) => setSelectedLocName(e.target.value)}
          >
            <optgroup label="Mumbai">
              {LOCATIONS.filter((l) => l.city === "Mumbai").map((l) => (
                <option key={l.name} value={l.name}>
                  {l.name} · {l.zone}
                </option>
              ))}
            </optgroup>
            <optgroup label="Pune (synthetic placeholder data)">
              {LOCATIONS.filter((l) => l.city === "Pune").map((l) => (
                <option key={l.name} value={l.name}>
                  {l.name} · {l.zone}
                </option>
              ))}
            </optgroup>
          </select>
        )}

        {inputMode === "latlon" && (
          <div style={{ display: "flex", gap: 10 }}>
            <input
              style={styles.input}
              value={customLat}
              onChange={(e) => setCustomLat(e.target.value)}
              placeholder="Latitude"
              inputMode="decimal"
            />
            <input
              style={styles.input}
              value={customLon}
              onChange={(e) => setCustomLon(e.target.value)}
              placeholder="Longitude"
              inputMode="decimal"
            />
          </div>
        )}

        <div style={styles.row}>
          <label style={styles.label}>Festival</label>
          <div style={styles.toggleGroup}>
            {FESTIVALS.map((f) => (
              <button
                key={f.id}
                style={{ ...styles.toggleBtn, ...(festival === f.id ? styles.toggleBtnActive : {}) }}
                onClick={() => {
                  setFestival(f.id);
                  setStage(f.stages[0].id);
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {activeFestival.stages.length > 1 && (
          <div style={styles.toggleGroup}>
            {activeFestival.stages.map((s) => (
              <button
                key={s.id}
                style={{ ...styles.toggleBtnSm, ...(stage === s.id ? styles.toggleBtnActive : {}) }}
                onClick={() => setStage(s.id)}
              >
                {s.label}
              </button>
            ))}
          </div>
        )}

        <div style={styles.row}>
          <label style={styles.label}>Watching for</label>
        </div>
        <div style={styles.toggleGroup}>
          {GROUPS.map((g) => (
            <button
              key={g.id}
              style={{ ...styles.toggleBtnSm, ...(group === g.id ? styles.toggleBtnActive : {}) }}
              onClick={() => setGroup(g.id)}
            >
              {g.label}
            </button>
          ))}
        </div>
      </section>

      {match && (
        <>
          <section style={styles.matchStrip}>
            <span>
              Matched to <strong style={{ color: "#F1EEE4" }}>{match.name}, {match.city}</strong> (
              {match.zone} zone), {match.distKm.toFixed(1)} km away
            </span>
            {match.city === "Pune" && (
              <div style={{ ...styles.hintText, marginTop: 4 }}>
                Pune's underlying noise data is a synthetic placeholder, not a real MPCB reading — see the footer.
              </div>
            )}
          </section>

          <section style={styles.chartCard}>
            <div style={styles.statsRow}>
              <div>
                <div style={styles.statNum}>{peak.db.toFixed(1)}</div>
                <div style={styles.statLabel}>peak dB predicted</div>
              </div>
              <div>
                <div style={{ ...styles.statNum, color: highHours ? RISK_COLOR.High : RISK_COLOR.Low }}>
                  {highHours}
                </div>
                <div style={styles.statLabel}>high-risk hours for {group}</div>
              </div>
            </div>

            <BarChart width={640} height={280} data={hourlyData} barCategoryGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2B335C" vertical={false} />
              <XAxis
                dataKey="label"
                interval={2}
                tick={{ fill: "#8D93B8", fontSize: 11, fontFamily: "IBM Plex Sans" }}
                axisLine={{ stroke: "#343B63" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#8D93B8", fontSize: 11, fontFamily: "IBM Plex Sans" }}
                axisLine={false}
                tickLine={false}
                width={32}
              />
              <ReferenceLine y={THRESHOLDS[group].low} stroke="#4E9A6B" strokeDasharray="4 4" />
              <ReferenceLine y={THRESHOLDS[group].medium} stroke="#D9A441" strokeDasharray="4 4" />
              <Tooltip
                cursor={{ fill: "rgba(255,255,255,0.04)" }}
                contentStyle={{
                  background: "#1B2140",
                  border: "1px solid #343B63",
                  borderRadius: 8,
                  fontFamily: "IBM Plex Sans",
                  fontSize: 12,
                  color: "#F1EEE4",
                }}
                formatter={(value, name, props) => [`${value} dB`, props.payload.risk + " risk"]}
                labelFormatter={(l) => l}
              />
              <Bar dataKey="db" radius={[3, 3, 0, 0]}>
                {hourlyData.map((row, i) => (
                  <Cell
                    key={i}
                    fill={RISK_COLOR[row.risk]}
                    fillOpacity={
                      row.measuredTier === "local" ? 1 : row.measuredTier === "proxy" ? 0.85 : 0.65
                    }
                  />
                ))}
              </Bar>
            </BarChart>

            <div style={styles.legend}>
              <span><i style={{ ...styles.dot, background: RISK_COLOR.Low }} /> Low</span>
              <span><i style={{ ...styles.dot, background: RISK_COLOR.Medium }} /> Medium</span>
              <span><i style={{ ...styles.dot, background: RISK_COLOR.High }} /> High</span>
              <span style={styles.legendNote}>
                {festival === "ganesh" &&
                  "solid bars = real Mumbai hourly readings (18:00–24:00)"}
                {festival === "navratri" &&
                  "solid bars = real hourly readings from Jabalpur, used as a shape proxy — Mumbai has no Navratri readings"}
                {festival === "diwali" &&
                  "all hours are a derived shape — Diwali data has day/night averages only, no true hourly readings"}
              </span>
            </div>
          </section>
        </>
      )}

      <footer style={styles.footer}>
        Mumbai: built from MPCB's 2023–24 Diwali readings (15 locations, day/night average),
        2024 Ganesh Chaturthi readings (25 locations, real hourly 18:00–24:00), and 2017
        Navratri readings from <strong>Jabalpur</strong> (different city, used as a shape
        proxy only). Pune: the Diwali day/night numbers are a <strong>synthetic placeholder</strong>
        {" "}(randomly generated around plausible zone-type patterns) since no real Pune
        MPCB data was provided — swap in real Pune readings whenever they're available.
        Hours without real readings use an assumed diurnal pattern. Coordinates are
        approximate. Treat every number here as an estimate, not a live reading.
      </footer>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#12172B",
    color: "#F1EEE4",
    fontFamily: "'IBM Plex Sans', sans-serif",
    padding: "40px 20px 60px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  header: { maxWidth: 560, textAlign: "left", width: "100%" },
  kicker: {
    fontFamily: "'IBM Plex Sans', sans-serif",
    fontSize: 13,
    color: "#D9A441",
    marginBottom: 10,
    letterSpacing: "0.02em",
  },
  h1: {
    fontFamily: "'Fraunces', serif",
    fontWeight: 600,
    fontSize: "clamp(28px, 4vw, 38px)",
    lineHeight: 1.15,
    margin: "0 0 14px",
  },
  sub: { color: "#9098B5", fontSize: 15, lineHeight: 1.5, margin: 0 },

  panel: {
    maxWidth: 560,
    width: "100%",
    marginTop: 32,
    background: "#1B2140",
    border: "1px solid #2B335C",
    borderRadius: 14,
    padding: 24,
  },
  row: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 18, marginBottom: 10 },
  label: { fontSize: 13, color: "#9098B5", fontWeight: 500 },

  toggleGroup: { display: "flex", gap: 8, flexWrap: "wrap" },
  toggleBtn: {
    background: "transparent",
    border: "1px solid #343B63",
    color: "#9098B5",
    borderRadius: 8,
    padding: "7px 14px",
    fontSize: 13,
    cursor: "pointer",
    fontFamily: "'IBM Plex Sans', sans-serif",
  },
  toggleBtnSm: {
    background: "transparent",
    border: "1px solid #343B63",
    color: "#9098B5",
    borderRadius: 8,
    padding: "6px 12px",
    fontSize: 12.5,
    cursor: "pointer",
    fontFamily: "'IBM Plex Sans', sans-serif",
  },
  toggleBtnActive: { background: "#2B335C", color: "#F1EEE4", borderColor: "#4E5794" },

  select: {
    width: "100%",
    background: "#12172B",
    border: "1px solid #343B63",
    color: "#F1EEE4",
    borderRadius: 8,
    padding: "10px 12px",
    fontSize: 14,
    fontFamily: "'IBM Plex Sans', sans-serif",
  },
  input: {
    flex: 1,
    background: "#12172B",
    border: "1px solid #343B63",
    color: "#F1EEE4",
    borderRadius: 8,
    padding: "10px 12px",
    fontSize: 14,
    fontFamily: "'IBM Plex Sans', sans-serif",
  },
  hintText: { color: "#5C6389", fontSize: 11.5, marginTop: 10, lineHeight: 1.5 },

  matchStrip: {
    maxWidth: 560,
    width: "100%",
    marginTop: 16,
    fontSize: 13,
    color: "#9098B5",
  },

  chartCard: {
    maxWidth: 640,
    width: "100%",
    marginTop: 16,
    background: "#1B2140",
    border: "1px solid #2B335C",
    borderRadius: 14,
    padding: 24,
    overflowX: "auto",
  },
  statsRow: { display: "flex", gap: 40, marginBottom: 16 },
  statNum: { fontFamily: "'Fraunces', serif", fontSize: 32, fontWeight: 600, lineHeight: 1 },
  statLabel: { fontSize: 12.5, color: "#9098B5", marginTop: 4 },

  legend: {
    display: "flex",
    gap: 18,
    alignItems: "center",
    marginTop: 12,
    fontSize: 12.5,
    color: "#9098B5",
    flexWrap: "wrap",
  },
  dot: { display: "inline-block", width: 9, height: 9, borderRadius: "50%", marginRight: 6 },
  legendNote: { fontSize: 11.5, color: "#5C6389" },

  footer: {
    maxWidth: 560,
    width: "100%",
    marginTop: 28,
    fontSize: 12,
    color: "#5C6389",
    lineHeight: 1.6,
  },
};
