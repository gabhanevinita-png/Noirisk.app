# Festival Noise Watch — Mumbai & Pune

Predicting hour-by-hour festival noise levels and translating them into a risk score for
vulnerable groups (children, the elderly, pregnant people, and pets), using real municipal
noise-monitoring data from Mumbai and a from-scratch spatial + temporal modeling pipeline.

**[Live demo  https://leafy-travesseiro-ed37e3.netlify.app

> Replace the links above once this is pushed to GitHub / hosted.

---

## Why this exists

Every Diwali and Ganesh Chaturthi, Mumbai's noise levels spike well past WHO-recommended
thresholds — but the only public data is a handful of fixed MPCB monitoring stations, checked
after the fact. This project asks: **can you turn a small, messy, real government dataset into
something a resident can actually use *before* the festival, for *their* specific street?**

The honest answer, and the more interesting one to write up, is: *partially* — and figuring out
exactly where the data runs out, and being upfront about it in the product itself, was most of
the actual work.

---

## What it does

1. Takes a location — an existing MPCB monitoring point, or any lat/lon
2. Matches it to the nearest real monitoring station (haversine distance)
3. Predicts a 24-hour noise curve for that spot, for a chosen festival + day-stage
4. Converts each hour into a Low / Medium / High risk label per vulnerable group, using
   threshold-based rules
5. Renders it as an interactive chart — solid bars where the hour is backed by real
   measured data, faded bars where it's a modeled assumption

## Demo

<p align="center">
  <img src="docs/demo.gif" width="640" alt="App demo" />
</p>

*(Add a screen recording here — GIFs get meaningfully more engagement on LinkedIn than a
link-only post.)*

---

## Data — and its real limitations

| Source | Coverage | What it actually contains |
|---|---|---|
| `mumbai_diwali_2023_2024.csv` | 15 Mumbai locations, 2 years | **Day/night averages only** — no true hourly data |
| `mumbai_ganesh_2024_hourly.csv` | 25 Mumbai locations, 2024 | **Real hourly readings**, but only for 18:00–24:00 (the immersion window) |
| `navratri_jabalpur_2017_NOT_MUMBAI.csv` | 3 Jabalpur locations, 2017 | Real hourly readings for Navratri — **but a different city entirely** |
| `pune_diwali_SYNTHETIC_placeholder.csv` | 15 Pune locations | **Fabricated** — randomly generated around Mumbai-like zone patterns, since no real Pune data was available |

None of these overlaps cleanly (different cities, different hours-of-day, different years),
which is the actual modeling problem here — not fitting a curve to clean data, but deciding
**what's safe to infer, what's a reasonable proxy, and what has to be flagged as unmeasured.**

Every prediction in the app is tagged internally as one of:
- `measured (local)` — a real reading from that city's own dataset
- `measured (proxy)` — a real reading, but borrowed from a different city/festival as a shape reference
- `assumed` — a generic diurnal pattern with no ground truth backing it at all

This tagging drives the bar opacity in the UI. **The goal was to never let a modeled number look
as confident as a measured one.**

---

## Methodology

- **Spatial matching**: haversine nearest-neighbor against the known station list (no reverse
  geocoding dependency required for the core prediction)
- **Baseline model**: Random Forest Regressor (scikit-learn) trained on `zone_type × festival_stage
  → day_leq, night_leq`, validated with **leave-one-out cross-validation** given the small sample
  size (~90 rows) rather than a train/test split that would leave almost nothing to validate on
- **Temporal shaping**: real hourly deviation-from-mean, computed directly from the Ganesh dataset,
  applied as an additive dB offset (not a naive multiplicative scale, since Leq is already a
  log-domain average)
- **Cross-festival transfer**: Navratri's *absolute* levels are anchored to Mumbai's own
  pre-Diwali baseline; only the *escalation pattern* (how much louder the final day gets) is
  borrowed from Jabalpur — chosen deliberately so no out-of-city number is ever shown as if it
  were a Mumbai reading
- **Risk translation**: threshold lookup per vulnerable group, not part of the model itself —
  kept as an explicit, editable rule table rather than learned, since there's no labeled
  ground truth for "risk" to fit against

## Known limitations (stated plainly, on purpose)

- ~90 rows is not enough data for the Random Forest to meaningfully outperform a zone-average
  baseline — LOO-CV confirms this (~4–4.5 dB MAE), and the app's browser version uses the
  averaged lookup table directly rather than re-running the forest client-side
- Coordinates for all monitoring points are approximate, not surveyed
- Every hour outside a dataset's real measurement window uses an assumed generic diurnal
  pattern
- Pune has **no real data at all** yet — see the CSV note above

## What I'd do with more data

- Replace the zone-type category with continuous features (distance to nearest major road,
  population density) to see if the RF actually earns its complexity
- Get even a few real Mumbai Navratri readings to replace the Jabalpur proxy
- Multi-year Ganesh data to check whether the hourly shape is stable year-to-year or noisy

---

## Repo structure

```
.
├── mumbai_festival_noise_risk.ipynb   # Full pipeline: EDA → model → validation → ipywidgets UI
├── NoiseWatch.jsx                     # Standalone React app (Recharts), browser-only version
├── data/
│   ├── mumbai_diwali_2023_2024.csv
│   ├── mumbai_ganesh_2024_hourly.csv
│   ├── navratri_jabalpur_2017_NOT_MUMBAI.csv
│   └── pune_diwali_SYNTHETIC_placeholder.csv
├── docs/
│   └── demo.gif
└── README.md
```

## Running it

**Notebook (Colab):**
1. Open `mumbai_festival_noise_risk.ipynb` in [Google Colab](https://colab.research.google.com)
2. Run all cells — it will prompt you to upload the CSVs from `data/`
3. The last cell renders an interactive `ipywidgets` chart inline

**App (React):**
```bash
# in a Vite/CRA project with recharts installed
npm install recharts
# drop NoiseWatch.jsx into src/, render <NoiseWatch /> from App.jsx
```

## Stack

`pandas` · `scikit-learn` · `numpy` · `matplotlib` / `ipywidgets` (notebook) · `React` · `Recharts` (app)

---

## License

MIT — see [`LICENSE`](LICENSE).

## Author

Built by [Your Name] — [LinkedIn](#) · [Portfolio](#)

If you're a recruiter or engineer reading this: the interesting part isn't the Random Forest,
it's the data-honesty layer — deciding what a small, messy, real dataset can and can't support,
and building the UI so it never overstates its own confidence.
