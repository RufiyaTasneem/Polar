# Scientific ML Plan for POLAR

## Overview
POLAR incorporates machine-learned micro-climate models for all three major Indian polar research stations:
1. **Maitri Station** (Schirmacher Oasis, Queen Maud Land, Antarctica)
2. **Bharati Station** (Larsemann Hills, Prydz Bay, Antarctica)
3. **Himadri Station** (Ny-Ålesund, Spitsbergen, Svalbard, Arctic)

---

## 1. Station Profiles & Datasets

### A. Maitri Station (Antarctica)
- **Relative Path**: `datasets/maitri/sankalp_sase.csv`
- **Dataset Title**: Maitri Station Hourly Meteorological Observation Series (SASE / SANKALP)
- **Coordinates**: 70°45'57"S, 11°44'09"E
- **Climate Regime**: High-altitude coastal polar climate regime with extreme temperature swings, katabatic winds, and atmospheric pressure dynamics.
- **Total Records**: 83,798 continuous hourly weather observations (Feb 2006 – Dec 2015)
- **Results Artifact**: `src/lib/scientificMLResults.json`

### B. Bharati Station (Antarctica)
- **Relative Path**: `datasets/bharti/bharti.csv`
- **Dataset Title**: Bharati Station Surface Meteorological Observation Series (AWS)
- **Coordinates**: 69°24'25"S, 76°11'42"E
- **Climate Regime**: Coastal Antarctic oasis on Prydz Bay with circumpolar marine interaction, katabatic blizzards, and seasonal sea-ice dynamics.
- **Total Records**: 83,798 continuous hourly weather observations (Feb 2006 – Dec 2015)
- **Results Artifact**: `src/lib/bhartiMLResults.json`

### C. Himadri Station (Arctic)
- **Relative Path**: `datasets/himadri/himadri.csv`
- **Dataset Title**: Himadri High Arctic Surface Meteorological Observation Series
- **Coordinates**: 78°55'N, 11°56'E
- **Climate Regime**: High Arctic maritime fjord environment (Kongsfjorden) influenced by the warm West Spitsbergen Current, polar night inversions, and midnight sun cycles.
- **Total Records**: 83,798 continuous hourly weather observations (Feb 2006 – Dec 2015)
- **Results Artifact**: `src/lib/himadriMLResults.json`

---

## 2. Variables & Features
- `obstime`: Date and time of observation (`YYYY-MM-DD HH:MM:SS`)
- `tempr`: Ambient Air Temperature (°C) — **Target Variable** (Continuous Regression)
- `ap`: Surface Atmospheric Pressure (hPa / mbar)
- `ws`: Wind Speed (m/s)
- `wd`: Wind Direction (0.0° – 360.0°)
- `rh`: Relative Humidity (%)

### Derived Temporal Features
1. `hour`: Hour of day (0–23)
2. `month`: Month of year (1–12)
3. `dayofyear`: Day of year (1–366)
4. `sin_hour`, `cos_hour`: Cyclical diurnal transformation
5. `sin_month`, `cos_month`: Cyclical seasonal transformation

---

## 3. Preprocessing & Splitting Pipeline
1. **Sentinel Value Filtering**: Filter out missing value flags where values are set to `-999.0` (`tempr < -70.0`, `ap < 500.0`, `ws < 0.0`, `rh < 0.0`).
2. **Datetime Feature Engineering**: Parse `obstime` to extract temporal indicators and calculate cyclical trigonometric representations for continuous seasonal/diurnal transitions.
3. **Chronological Splitting**:
   - **Training Set**: 2006–2013 (~64,000–67,000 observations)
   - **Testing Set**: 2014–2015 (~15,500–16,500 observations)
   - Guarantees strict chronological evaluation without temporal data leakage.

---

## 4. Model Architecture & Hyperparameters
- **Algorithm**: `RandomForestRegressor` (Scikit-Learn)
- **Hyperparameters**:
  - `n_estimators`: 100
  - `max_depth`: 15
  - `random_state`: 42
  - `n_jobs`: -1 (Parallel core utilization)

---

## 5. Trained Model Performance Summary

| Station | Region | R² Score | MAE (°C) | RMSE (°C) | Primary Atmospheric Driver |
| :--- | :--- | :---: | :---: | :---: | :--- |
| **Maitri** | Antarctica | **0.6998** | 3.22 °C | 4.31 °C | `cos_month` (58.8%), `dayofyear` (10.7%), `ws` (8.7%) |
| **Bharati** | Antarctica | **0.9456** | 1.68 °C | 2.11 °C | `cos_month` (89.5%), `dayofyear` (6.8%), `ws` (0.9%) |
| **Himadri** | Arctic | **0.9397** | 1.52 °C | 1.90 °C | `cos_month` (87.0%), `dayofyear` (8.9%), `ws` (0.8%) |

---

## 6. Execution Scripts
- **Maitri**: `python scripts/train_maitri_rf.py`
- **Bharati**: `python scripts/train_bharti_rf.py`
- **Himadri**: `python scripts/train_himadri_rf.py`

## 7. Source Attribution
- **Dataset Provider**: National Centre for Polar and Ocean Research (NCPOR), Ministry of Earth Sciences, Govt. of India / NPDC.
- **Maitri Program**: Snow and Avalanche Study Establishment (SASE) SANKALP Meteorological Station.
- **Bharati Program**: Bharati Atmospheric & Meteorological Observatory (Larsemann Hills).
- **Himadri Program**: Himadri Arctic Research Station (Ny-Ålesund, Svalbard).
