# EngageIQ — Game Acquisition Dashboard

EngageIQ is the executive dashboard for the GameVault Publishing acquisition
watchlist: 23 games,
14,617 Steam reviews, one transparent Acquisition Score per game.

## Run it

```bash
cd Dashboard
npm install
npm run dev
```

Then open the printed local URL (default http://localhost:5173). Built with
Vite + React, Tailwind CSS and Recharts — no backend, the app runs entirely on
a static JSON file.

## Data

Data is generated from the analysis notebooks via `prepare_data.py` — re-run it
if the notebooks are re-run:

```bash
# from the repo root
python Dashboard/prepare_data.py
```

It reads the notebook outputs in `Data analysis/data/` and rewrites
`Dashboard/src/data/dashboard_data.json`, the app's single source of truth.
