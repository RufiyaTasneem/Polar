import * as THREE from 'three';

export interface StationTimelineItem {
  year: string;
  title: string;
  description: string;
}

export interface PolarStationData {
  id: string;
  slug: string;
  name: string;
  region: 'Arctic' | 'Antarctica';
  locationLabel: string;
  coordinatesLabel: string;
  establishedYear: number;
  lat: number;
  lon: number;
  description: string;
  link: string;
  targetRotation: { x: number; y: number };
  purpose: string;
  researchFocus: string[];
  timeline: StationTimelineItem[];
}

export const POLAR_STATIONS: PolarStationData[] = [
  {
    id: 'himadri',
    slug: 'himadri',
    name: 'HIMADRI',
    region: 'Arctic',
    locationLabel: 'Ny-Ålesund, Svalbard, Norway',
    coordinatesLabel: "78°55'N 11°56'E",
    establishedYear: 2008,
    lat: 78.9167,
    lon: 11.9333,
    description: "India's pioneer Arctic research station at Ny-Ålesund, Svalbard, dedicated to atmospheric aerosols, glaciology, and space weather studies.",
    link: '/explore/himadri',
    targetRotation: { x: 1.22, y: -1.78 },
    purpose: "Himadri serves as India's premier High Arctic observation post, monitoring long-range atmospheric aerosol transport, glacier mass balance, and polar space weather dynamics.",
    researchFocus: [
      'Atmospheric Aerosols',
      'Glaciology & Mass Balance',
      'Space Weather & Ionosphere',
      'Marine Biogeochemistry',
      'Arctic Microbial Ecology',
    ],
    timeline: [
      {
        year: '2008',
        title: 'Station Established',
        description: 'Himadri inaugurated at Ny-Ålesund, Svalbard (78°55\'N).'
      },
      {
        year: '2014',
        title: 'IndARC Mooring System',
        description: 'First underwater multi-sensor observatory deployed in Kongsfjorden.'
      },
      {
        year: '2019',
        title: 'Glacier Mass Monitoring',
        description: 'Long-term baseline tracking of Svalbard glacier melt dynamics.'
      },
      {
        year: 'TODAY',
        title: 'Year-Round Research',
        description: 'Continuous High Arctic climate observation and atmospheric research.'
      }
    ]
  },
  {
    id: 'maitri',
    slug: 'maitri',
    name: 'MAITRI',
    region: 'Antarctica',
    locationLabel: 'Schirmacher Oasis, Queen Maud Land',
    coordinatesLabel: "70°45'S 11°44'E",
    establishedYear: 1989,
    lat: -70.75,
    lon: 11.7333,
    description: "India's second permanent Antarctic research hub, operational since 1989 in the Schirmacher Oasis for geology, meteorology, and human physiology.",
    link: '/explore/maitri',
    targetRotation: { x: -1.22, y: -1.78 },
    purpose: "Maitri operates as an inland Antarctic multidisciplinary observatory, maintaining over three decades of continuous geomagnetic, meteorological, and extreme physiological research.",
    researchFocus: [
      'Geomagnetism & Ionosphere',
      'Meteorology & Climate',
      'Limnology & Lake Ecology',
      'Human Extreme Physiology',
      'Structural Geology',
    ],
    timeline: [
      {
        year: '1989',
        title: 'Station Established',
        description: 'Maitri commissioned in the ice-free Schirmacher Oasis.'
      },
      {
        year: '1990',
        title: 'Priyadarshini Lake Studies',
        description: 'Freshwater ecology and sub-zero microbial monitoring initiated.'
      },
      {
        year: '2006',
        title: 'Geomagnetic Observatory',
        description: 'High-precision digital magnetometer array installed for space weather.'
      },
      {
        year: 'TODAY',
        title: 'Year-Round Science Hub',
        description: 'Over 35 years of continuous Antarctic scientific observation.'
      }
    ]
  },
  {
    id: 'bharati',
    slug: 'bharati',
    name: 'BHARATI',
    region: 'Antarctica',
    locationLabel: 'Larsemann Hills, Prydz Bay',
    coordinatesLabel: "69°24'S 76°11'E",
    establishedYear: 2012,
    lat: -69.4,
    lon: 76.1833,
    description: "India's state-of-the-art sustainable Antarctic station commissioned in 2012 for oceanography, Gondwana assembly geology, and continental ice research.",
    link: '/explore/bharati',
    targetRotation: { x: -1.18, y: -2.90 },
    purpose: "Bharati is a state-of-the-art Antarctic marine and continental hub, investigating Prydz Bay ocean circulation, Gondwana supercontinent breakup geology, and satellite telemetry.",
    researchFocus: [
      'Physical Oceanography',
      'Gondwana Tectonics',
      'Continental Ice Dynamics',
      'AGEOS Satellite Data Station',
      'Benthic Ecosystems',
    ],
    timeline: [
      {
        year: '2012',
        title: 'Station Commissioned',
        description: 'Sustainable modular facility operationalized at Larsemann Hills.'
      },
      {
        year: '2015',
        title: 'AGEOS Ground Station',
        description: 'Direct satellite telemetry ground station integrated for earth observations.'
      },
      {
        year: '2020',
        title: 'Prydz Bay Profiling',
        description: 'Deep ocean hydrographic and ocean-ice interaction studies.'
      },
      {
        year: 'TODAY',
        title: 'Polar Science Sentinel',
        description: 'Advanced Antarctic oceanographic and continental margin science.'
      }
    ]
  }
];

export const INDIA_TARGET_ROTATION = { x: 0.36, y: -2.95 };

export function latLonToVector3(lat: number, lon: number, radius = 1.015): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  return new THREE.Vector3(x, y, z);
}

