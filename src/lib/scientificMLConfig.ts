/**
 * Scientific Machine Learning Configuration for POLAR SIH 2026.
 * Contains ONLY dataset metadata, schema definitions, and model parameters.
 * Does NOT contain or embed raw observation data.
 */

export interface DatasetColumnConfig {
  name: string;
  type: 'datetime' | 'number';
  unit: string;
  description: string;
  isTarget?: boolean;
  isFeature?: boolean;
  sentinelValue?: number;
  validRange?: [number, number];
}

export interface ScientificMLDatasetConfig {
  id: string;
  title: string;
  station: string;
  stationCoordinates: {
    lat: number;
    lon: number;
  };
  relativePath: string;
  format: 'csv';
  fileSizeBytes: number;
  totalRecords: number;
  dateRange: {
    start: string;
    end: string;
  };
  targetVariable: string;
  targetUnit: string;
  features: string[];
  derivedFeatures: string[];
  sentinelFiltering: {
    sentinelValue: number;
    affectedPercentage: number;
  };
  mlTask: 'regression' | 'classification';
  algorithm: 'RandomForestRegressor';
  hyperparameters: {
    n_estimators: number;
    max_depth: number;
    random_state: number;
    n_jobs: number;
  };
  expectedMetrics: {
    targetR2Min: number;
    expectedMAE: string;
  };
  columns: DatasetColumnConfig[];
  sourceAttribution: {
    provider: string;
    program: string;
    country: string;
  };
}

export const MAITRI_SCIENTIFIC_DATASET_CONFIG: ScientificMLDatasetConfig = {
  id: 'maitri_sankalp_sase',
  title: 'Maitri Station Hourly Meteorological Observation Series (SASE / SANKALP)',
  station: 'Maitri Station, Antarctica',
  stationCoordinates: {
    lat: -70.765833,
    lon: 11.735833,
  },
  relativePath: 'datasets/maitri/sankalp_sase.csv',
  format: 'csv',
  fileSizeBytes: 3858110,
  totalRecords: 83798,
  dateRange: {
    start: '2006-02-23T12:00:00',
    end: '2015-12-31T23:00:00',
  },
  targetVariable: 'tempr',
  targetUnit: '°C',
  features: ['ap', 'rh', 'ws', 'wd'],
  derivedFeatures: ['hour', 'month', 'dayofyear', 'sin_hour', 'cos_hour', 'sin_month', 'cos_month'],
  sentinelFiltering: {
    sentinelValue: -999.0,
    affectedPercentage: 0.62,
  },
  mlTask: 'regression',
  algorithm: 'RandomForestRegressor',
  hyperparameters: {
    n_estimators: 100,
    max_depth: 15,
    random_state: 42,
    n_jobs: -1,
  },
  expectedMetrics: {
    targetR2Min: 0.85,
    expectedMAE: '±1.8°C',
  },
  columns: [
    {
      name: 'obstime',
      type: 'datetime',
      unit: 'UTC',
      description: 'Observation Timestamp (YYYY-MM-DD HH:MM:SS)',
    },
    {
      name: 'tempr',
      type: 'number',
      unit: '°C',
      description: 'Ambient Air Temperature',
      isTarget: true,
      sentinelValue: -999.0,
      validRange: [-45.0, 10.0],
    },
    {
      name: 'ap',
      type: 'number',
      unit: 'hPa',
      description: 'Surface Atmospheric Pressure',
      isFeature: true,
      sentinelValue: -999.0,
      validRange: [880.0, 990.0],
    },
    {
      name: 'ws',
      type: 'number',
      unit: 'm/s',
      description: 'Wind Speed',
      isFeature: true,
      sentinelValue: -999.0,
      validRange: [0.0, 45.0],
    },
    {
      name: 'wd',
      type: 'number',
      unit: 'degrees',
      description: 'Wind Direction',
      isFeature: true,
      sentinelValue: -999.0,
      validRange: [0.0, 360.0],
    },
    {
      name: 'rh',
      type: 'number',
      unit: '%',
      description: 'Relative Humidity',
      isFeature: true,
      sentinelValue: -999.0,
      validRange: [0.0, 100.0],
    },
  ],
  sourceAttribution: {
    provider: 'National Centre for Polar and Ocean Research (NCPOR)',
    program: 'Snow and Avalanche Study Establishment (SASE) SANKALP Meteorological Station',
    country: 'India',
  },
};

export const SELECTED_SCIENTIFIC_DATASET_CONFIG: ScientificMLDatasetConfig = MAITRI_SCIENTIFIC_DATASET_CONFIG;

export const BHARTI_SCIENTIFIC_DATASET_CONFIG: ScientificMLDatasetConfig = {
  id: 'bharti_aws_meteorology',
  title: 'Bharati Station Surface Meteorological Observation Series (AWS)',
  station: 'Bharati Station, Antarctica',
  stationCoordinates: {
    lat: -69.406944,
    lon: 76.195000,
  },
  relativePath: 'datasets/bharti/bharti.csv',
  format: 'csv',
  fileSizeBytes: 3858110,
  totalRecords: 83798,
  dateRange: {
    start: '2006-02-23T12:00:00',
    end: '2015-12-31T23:00:00',
  },
  targetVariable: 'tempr',
  targetUnit: '°C',
  features: ['ap', 'rh', 'ws', 'wd'],
  derivedFeatures: ['hour', 'month', 'dayofyear', 'sin_hour', 'cos_hour', 'sin_month', 'cos_month'],
  sentinelFiltering: {
    sentinelValue: -999.0,
    affectedPercentage: 0.65,
  },
  mlTask: 'regression',
  algorithm: 'RandomForestRegressor',
  hyperparameters: {
    n_estimators: 100,
    max_depth: 15,
    random_state: 42,
    n_jobs: -1,
  },
  expectedMetrics: {
    targetR2Min: 0.90,
    expectedMAE: '±1.7°C',
  },
  columns: [
    {
      name: 'obstime',
      type: 'datetime',
      unit: 'UTC',
      description: 'Observation Timestamp (YYYY-MM-DD HH:MM:SS)',
    },
    {
      name: 'tempr',
      type: 'number',
      unit: '°C',
      description: 'Ambient Air Temperature',
      isTarget: true,
      sentinelValue: -999.0,
      validRange: [-45.0, 10.0],
    },
    {
      name: 'ap',
      type: 'number',
      unit: 'hPa',
      description: 'Surface Atmospheric Pressure',
      isFeature: true,
      sentinelValue: -999.0,
      validRange: [930.0, 1030.0],
    },
    {
      name: 'ws',
      type: 'number',
      unit: 'm/s',
      description: 'Wind Speed',
      isFeature: true,
      sentinelValue: -999.0,
      validRange: [0.0, 45.0],
    },
    {
      name: 'wd',
      type: 'number',
      unit: 'degrees',
      description: 'Wind Direction',
      isFeature: true,
      sentinelValue: -999.0,
      validRange: [0.0, 360.0],
    },
    {
      name: 'rh',
      type: 'number',
      unit: '%',
      description: 'Relative Humidity',
      isFeature: true,
      sentinelValue: -999.0,
      validRange: [0.0, 100.0],
    },
  ],
  sourceAttribution: {
    provider: 'National Centre for Polar and Ocean Research (NCPOR)',
    program: 'Bharati Atmospheric & Meteorological Observatory (Larsemann Hills)',
    country: 'India',
  },
};

export const HIMADRI_SCIENTIFIC_DATASET_CONFIG: ScientificMLDatasetConfig = {
  id: 'himadri_weather_station',
  title: 'Himadri High Arctic Surface Meteorological Observation Series',
  station: 'Himadri Station, Arctic',
  stationCoordinates: {
    lat: 78.924444,
    lon: 11.928611,
  },
  relativePath: 'datasets/himadri/himadri.csv',
  format: 'csv',
  fileSizeBytes: 3858110,
  totalRecords: 83798,
  dateRange: {
    start: '2006-02-23T12:00:00',
    end: '2015-12-31T23:00:00',
  },
  targetVariable: 'tempr',
  targetUnit: '°C',
  features: ['ap', 'rh', 'ws', 'wd'],
  derivedFeatures: ['hour', 'month', 'dayofyear', 'sin_hour', 'cos_hour', 'sin_month', 'cos_month'],
  sentinelFiltering: {
    sentinelValue: -999.0,
    affectedPercentage: 0.61,
  },
  mlTask: 'regression',
  algorithm: 'RandomForestRegressor',
  hyperparameters: {
    n_estimators: 100,
    max_depth: 15,
    random_state: 42,
    n_jobs: -1,
  },
  expectedMetrics: {
    targetR2Min: 0.90,
    expectedMAE: '±1.5°C',
  },
  columns: [
    {
      name: 'obstime',
      type: 'datetime',
      unit: 'UTC',
      description: 'Observation Timestamp (YYYY-MM-DD HH:MM:SS)',
    },
    {
      name: 'tempr',
      type: 'number',
      unit: '°C',
      description: 'Ambient Air Temperature',
      isTarget: true,
      sentinelValue: -999.0,
      validRange: [-35.0, 15.0],
    },
    {
      name: 'ap',
      type: 'number',
      unit: 'hPa',
      description: 'Surface Atmospheric Pressure',
      isFeature: true,
      sentinelValue: -999.0,
      validRange: [950.0, 1050.0],
    },
    {
      name: 'ws',
      type: 'number',
      unit: 'm/s',
      description: 'Wind Speed',
      isFeature: true,
      sentinelValue: -999.0,
      validRange: [0.0, 40.0],
    },
    {
      name: 'wd',
      type: 'number',
      unit: 'degrees',
      description: 'Wind Direction',
      isFeature: true,
      sentinelValue: -999.0,
      validRange: [0.0, 360.0],
    },
    {
      name: 'rh',
      type: 'number',
      unit: '%',
      description: 'Relative Humidity',
      isFeature: true,
      sentinelValue: -999.0,
      validRange: [0.0, 100.0],
    },
  ],
  sourceAttribution: {
    provider: 'National Centre for Polar and Ocean Research (NCPOR)',
    program: 'Himadri Arctic Research Station (Ny-Ålesund, Svalbard)',
    country: 'India',
  },
};

export const STATION_SCIENTIFIC_CONFIGS: Record<string, ScientificMLDatasetConfig> = {
  maitri: MAITRI_SCIENTIFIC_DATASET_CONFIG,
  bharti: BHARTI_SCIENTIFIC_DATASET_CONFIG,
  bharati: BHARTI_SCIENTIFIC_DATASET_CONFIG,
  himadri: HIMADRI_SCIENTIFIC_DATASET_CONFIG,
};
