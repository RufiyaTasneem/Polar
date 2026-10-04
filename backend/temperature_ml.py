from pathlib import Path
from datetime import datetime
import joblib
import numpy as np
import pandas as pd


MODEL_DIR = Path(__file__).resolve().parent / "models"

MODELS = {
    "maitri": joblib.load(MODEL_DIR / "maitri_rf.joblib"),
    "bharati": joblib.load(MODEL_DIR / "bharti_rf.joblib"),
    "himadri": joblib.load(MODEL_DIR / "himadri_rf.joblib"),
}


STATION_NAMES = {
    "maitri": "Maitri",
    "bharati": "Bharati",
    "himadri": "Himadri",
}


def predict_temperature(
    station: str,
    date_time: datetime,
    ap: float,
    rh: float,
    ws: float,
    wd: float,
) -> float:

    station_key = station.lower().strip()

    if station_key not in MODELS:
        raise ValueError(
            "Temperature prediction is available for Maitri, Bharati, and Himadri."
        )

    if not (500 < ap < 1100):
        raise ValueError("Pressure must be between 500 and 1100 hPa.")

    if not (0 <= rh <= 100):
        raise ValueError("Humidity must be between 0 and 100%.")

    if not (0 <= ws < 100):
        raise ValueError("Wind speed must be between 0 and 100 m/s.")

    if not (0 <= wd <= 360):
        raise ValueError("Wind direction must be between 0 and 360 degrees.")

    hour = date_time.hour
    month = date_time.month
    dayofyear = date_time.timetuple().tm_yday

    features = {
        "ap": ap,
        "rh": rh,
        "ws": ws,
        "wd": wd,
        "hour": hour,
        "month": month,
        "dayofyear": dayofyear,
        "sin_hour": np.sin(2 * np.pi * hour / 24),
        "cos_hour": np.cos(2 * np.pi * hour / 24),
        "sin_month": np.sin(2 * np.pi * (month - 1) / 12),
        "cos_month": np.cos(2 * np.pi * (month - 1) / 12),
    }

    input_df = pd.DataFrame([features])

    prediction = MODELS[station_key].predict(input_df)[0]

    return float(prediction)


def station_display_name(station: str) -> str:
    return STATION_NAMES.get(station.lower(), station.title())