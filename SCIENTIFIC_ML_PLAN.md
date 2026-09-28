# Scientific ML Plan for POLAR

## Selected Dataset
- **Relative Path**: `datasets/maitri/sankalp_sase.csv`
- **Dataset Title**: Maitri Station Hourly Meteorological Observation Series (SASE / SANKALP)
- **Format**: Tabular CSV
- **File Size**: ~3.86 MB
- **Total Records**: 83,798 continuous hourly weather observations (Feb 2006 – Dec 2015)

## Station
- **Station Name**: Maitri Station, Schirmacher Oasis, Queen Maud Land, Antarctica
- **Coordinates**: 70°45'57"S, 11°44'09"E
- **Environment**: High-altitude coastal polar climate regime with extreme temperature swings, katabatic winds, and atmospheric pressure dynamics.

## Variables
- `obstime`: Date and time of observation (`YYYY-MM-DD HH:MM:SS`)
- `tempr`: Ambient Air Temperature (°C)
- `ap`: Surface Atmospheric Pressure (hPa / mbar)
- `ws`: Wind Speed (m/s)
- `wd`: Wind Direction (0.0° – 360.0°)
- `rh`: Relative Humidity (%)

## Target Variable
- **Target Feature**: `tempr` (Ambient Air Temperature in °C)
- **Target Type**: Continuous Numerical Variable (Regression)

## Input Features
1. `ap`: Atmospheric Pressure (hPa)
2. `rh`: Relative Humidity (%)
3. `ws`: Wind Speed (m/s)
4. `wd`: Wind Direction (degrees)
5. `hour`: Hour of day (0–23)
6. `month`: Month of year (1–12)
7. `dayofyear`: Day of year (1–366)
8. `sin_hour`, `cos_hour`: Cyclical diurnal transformation
9. `sin_month`, `cos_month`: Cyclical seasonal transformation

## Preprocessing Required
1. **Sentinel Value Filtering**: Filter out missing value flags where values are set to `-999.0` (`tempr < -50.0`, `ap < 500.0`, `ws < 0.0`, `rh < 0.0`). Affects <0.7% of total records.
2. **Datetime Engineering**: Parse `obstime` to extract temporal indicators (`hour`, `month`, `dayofyear`) and calculate sine/cosine cyclical features for smooth periodic transitions.
3. **Train / Test Splitting**: Chronological 80/20 split (Train: 2006–2013 [~67,000 rows], Test: 2014–2015 [~16,000 rows]) to evaluate forecasting generalization without temporal leakage.

## Exact ML Task
- **Task**: Supervised Micro-climate Temperature Regression (`RandomForestRegressor`).
- **Objective**: Predict Antarctic surface temperature based on barometric pressure, humidity, wind dynamics, and temporal cycle variables.

## Why Random Forest is Suitable
1. **Non-linear Dynamics**: Captures complex non-linear meteorological interactions between pressure, wind vector, seasonal variation, and temperature.
2. **Feature Scale Invariance**: Decision tree ensembles do not require complex feature scaling or normalization across differing scales (pressure ~930 hPa vs humidity ~50%).
3. **Speed & Efficiency**: Trains in under 3 seconds on ~80,000 tabular rows without GPU hardware requirements.
4. **Explainability**: Yields direct feature importance rankings quantifying atmospheric drivers of Antarctic temperature changes.
5. **Robustness**: Resilient to residual extreme climate anomalies and noisy observations.

## Expected Output
- Model Evaluation Metrics: R² Score (target > 0.85), MAE (°C), RMSE (°C).
- Feature Importance Dictionary mapping features to relative importance scores.
- Standardized inference signature for single-point or batch temperature prediction.

## Source Attribution
- **Dataset Provider**: National Centre for Polar and Ocean Research (NCPOR), Ministry of Earth Sciences, Govt. of India / NPDC.
- **Observation Program**: Snow and Avalanche Study Establishment (SASE) SANKALP Meteorological Station, Maitri, Antarctica.
