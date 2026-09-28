import os
import json
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score

def main():
    dataset_path = 'datasets/maitri/sankalp_sase.csv'
    output_json_path = 'src/lib/scientificMLResults.json'
    
    print(f"Loading dataset from {dataset_path}...")
    df = pd.read_csv(dataset_path)
    
    # 1. Datetime conversion
    df['obstime'] = pd.to_datetime(df['obstime'])
    
    # 2. Filter out sentinel values (-999 or lower, or invalid values)
    initial_len = len(df)
    valid_mask = (
        (df['tempr'] > -70.0) & (df['tempr'] < 40.0) &
        (df['ap'] > 500.0) & (df['ap'] < 1100.0) &
        (df['ws'] >= 0.0) & (df['ws'] < 100.0) &
        (df['wd'] >= 0.0) & (df['wd'] <= 360.0) &
        (df['rh'] >= 0.0) & (df['rh'] <= 100.0)
    )
    
    df_clean = df[valid_mask].copy()
    cleaned_len = len(df_clean)
    print(f"Initial rows: {initial_len}, Cleaned rows: {cleaned_len}, Removed sentinel rows: {initial_len - cleaned_len}")
    
    # 3. Create temporal features
    df_clean['hour'] = df_clean['obstime'].dt.hour
    df_clean['month'] = df_clean['obstime'].dt.month
    df_clean['dayofyear'] = df_clean['obstime'].dt.dayofyear
    
    # Cyclical features
    df_clean['sin_hour'] = np.sin(2 * np.pi * df_clean['hour'] / 24.0)
    df_clean['cos_hour'] = np.cos(2 * np.pi * df_clean['hour'] / 24.0)
    df_clean['sin_month'] = np.sin(2 * np.pi * (df_clean['month'] - 1) / 12.0)
    df_clean['cos_month'] = np.cos(2 * np.pi * (df_clean['month'] - 1) / 12.0)
    
    # Feature & Target column definitions
    feature_cols = [
        'ap', 'rh', 'ws', 'wd',
        'hour', 'month', 'dayofyear',
        'sin_hour', 'cos_hour', 'sin_month', 'cos_month'
    ]
    target_col = 'tempr'
    
    # 4. Chronological train/test split (Train: 2006-2013, Test: 2014-2015)
    train_mask = df_clean['obstime'].dt.year <= 2013
    test_mask = df_clean['obstime'].dt.year >= 2014
    
    train_df = df_clean[train_mask]
    test_df = df_clean[test_mask]
    
    X_train = train_df[feature_cols]
    y_train = train_df[target_col]
    X_test = test_df[feature_cols]
    y_test = test_df[target_col]
    
    train_count = len(X_train)
    test_count = len(X_test)
    
    print(f"Training samples (2006-2013): {train_count}")
    print(f"Testing samples (2014-2015): {test_count}")
    
    # 5. Train RandomForestRegressor
    print("Training RandomForestRegressor...")
    model = RandomForestRegressor(
        n_estimators=100,
        max_depth=15,
        random_state=42,
        n_jobs=-1
    )
    model.fit(X_train, y_train)
    
    # 6. Evaluation
    print("Evaluating model performance on test set...")
    y_pred = model.predict(X_test)
    
    r2 = float(r2_score(y_test, y_pred))
    mae = float(mean_absolute_error(y_test, y_pred))
    rmse = float(np.sqrt(mean_squared_error(y_test, y_pred)))
    
    print("\n=== MODEL RESULTS ===")
    print(f"R² Score: {r2:.4f}")
    print(f"MAE (°C): {mae:.4f}")
    print(f"RMSE (°C): {rmse:.4f}")
    
    # 7. Feature importances
    importances = model.feature_importances_
    feature_imp_dict = {col: float(imp) for col, imp in zip(feature_cols, importances)}
    
    # Sort feature importances
    sorted_importances = dict(sorted(feature_imp_dict.items(), key=lambda item: item[1], reverse=True))
    
    print("\nFeature Importances:")
    for feat, imp in sorted_importances.items():
        print(f"  {feat:12s}: {imp:.4f}")
        
    # Build payload for scientificMLResults.json
    results_payload = {
        "dataset_name": "sankalp_sase.csv",
        "station": "Maitri Station, Antarctica",
        "target": "tempr",
        "target_description": "Ambient Air Temperature (°C)",
        "training_period": "2006-2013",
        "testing_period": "2014-2015",
        "train_sample_count": train_count,
        "test_sample_count": test_count,
        "total_valid_samples": cleaned_len,
        "r2_score": round(r2, 4),
        "mae": round(mae, 4),
        "rmse": round(rmse, 4),
        "feature_importances": {k: round(v, 4) for k, v in sorted_importances.items()},
        "features_used": feature_cols,
        "model_parameters": {
            "algorithm": "RandomForestRegressor",
            "n_estimators": 100,
            "max_depth": 15,
            "random_state": 42,
            "n_jobs": -1
        },
        "generated_at": pd.Timestamp.now().isoformat()
    }
    
    os.makedirs(os.path.dirname(output_json_path), exist_ok=True)
    with open(output_json_path, 'w', encoding='utf-8') as f:
        json.dump(results_payload, f, indent=2)
        
    print(f"\nModel results successfully written to {output_json_path}")

if __name__ == '__main__':
    main()
