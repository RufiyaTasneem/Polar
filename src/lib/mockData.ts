import type { Station, Expedition, Document, Media, Story } from './types';

export const MOCK_STATIONS: Station[] = [
  {
    id: 'st-himadri',
    slug: 'himadri',
    name: 'Himadri',
    region: 'Arctic',
    location: 'Ny-Ålesund, Svalbard, Norway',
    coordinates: "78°55'N 11°56'E",
    established_year: 2008,
    description: "India's first permanent Arctic research station, established in 2008 at Ny-Ålesund, Svalbard.",
    overview: "Located at 78°55'N in Ny-Ålesund, Svalbard, Himadri serves as India's gateway to Arctic science. Established in July 2008, the station provides laboratory space and living quarters for Indian scientists studying atmospheric chemistry, glaciology, marine biology, and auroral physics in the high Arctic environment.",
    research_focus: [
      'Atmospheric Chemistry',
      'Glaciology & Mass Balance',
      'Marine Ecosystems',
      'Space Weather & Aurora',
      'Aerosol Dynamics',
      'Permafrost Dynamics'
    ],
    image_url: 'https://images.pexels.com/photos/1663376/pexels-photo-1663376.jpeg?auto=compress&cs=tinysrgb&w=1920',
    hero_image_url: 'https://images.pexels.com/photos/1663376/pexels-photo-1663376.jpeg?auto=compress&cs=tinysrgb&w=1920',
    sort_order: 1
  },
  {
    id: 'st-maitri',
    slug: 'maitri',
    name: 'Maitri',
    region: 'Antarctica',
    location: 'Schirmacher Oasis, Queen Maud Land',
    coordinates: "70°45'S 11°44'E",
    established_year: 1989,
    description: "India's second permanent Antarctic research station, operational since 1989 in the Schirmacher Oasis.",
    overview: "Maitri was constructed in 1989 in the ice-free rocky area known as the Schirmacher Oasis. It features a main building housing accommodation, labs, and support systems, surrounded by fresh-water Priyadarshini Lake. It has served continuously for over three decades as a hub for geology, meteorology, and human physiology studies.",
    research_focus: [
      'Geology & Structural Tectonics',
      'Meteorology & Climate Dynamics',
      'Glaciology',
      'Polar Microbiology',
      'Human Physiology',
      'Seismology'
    ],
    image_url: 'https://images.pexels.com/photos/20558172/pexels-photo-20558172.jpeg?auto=compress&cs=tinysrgb&w=1920',
    hero_image_url: 'https://images.pexels.com/photos/20558172/pexels-photo-20558172.jpeg?auto=compress&cs=tinysrgb&w=1920',
    sort_order: 2
  },
  {
    id: 'st-bharati',
    slug: 'bharati',
    name: 'Bharati',
    region: 'Antarctica',
    location: 'Larsemann Hills, Prydz Bay',
    coordinates: "69°24'S 76°11'E",
    established_year: 2012,
    description: "India's state-of-the-art Antarctic station commissioned in 2012 in the Larsemann Hills.",
    overview: "Bharati represents a milestone in sustainable polar architectural design. Commissioned in 2012 in Prydz Bay, Larsemann Hills, Bharati is built using prefabricated shipping containers enclosed in an aerodynamic shell. It houses up to 25 scientists and supports cutting-edge oceanography, continental breakup studies, and atmospheric research.",
    research_focus: [
      'Oceanography & Sea Ice',
      'Gondwana Assembly Geology',
      'Polar Marine Biology',
      'Upper Atmospheric Science',
      'Environmental Chemistry',
      'Satellite Remote Sensing'
    ],
    image_url: 'https://images.pexels.com/photos/30251942/pexels-photo-30251942.jpeg?auto=compress&cs=tinysrgb&w=1920',
    hero_image_url: 'https://images.pexels.com/photos/30251942/pexels-photo-30251942.jpeg?auto=compress&cs=tinysrgb&w=1920',
    sort_order: 3
  }
];

export const MOCK_EXPEDITIONS: Expedition[] = [
  {
    id: 'exp-43-antarctic',
    slug: '43rd-indian-antarctic-expedition',
    title: '43rd Indian Scientific Expedition to Antarctica',
    year: 2023,
    region: 'Antarctica',
    station_id: 'st-bharati',
    station: MOCK_STATIONS[2],
    expedition_number: '43rd IAE',
    objectives: 'Deep ice-core sampling, oceanographic surveys across Prydz Bay, and environmental monitoring at Maitri and Bharati.',
    research_areas: ['Glaciology', 'Oceanography', 'Climate Science'],
    institutions: ['NCPOR', 'IIT Kharagpur', 'IMD', 'NGRI'],
    scientists: ['Dr. M. Ravichandran', 'Dr. Thamban Meloth', 'Dr. Rahul Mohan'],
    description: 'The 43rd Indian Scientific Expedition to Antarctica focused on climate teleconnections between polar oceans and the Indian Summer Monsoon, conducting oceanographic transects and glaciological ice-core drilling.',
    image_url: 'https://images.pexels.com/photos/30251942/pexels-photo-30251942.jpeg?auto=compress&cs=tinysrgb&w=1920'
  },
  {
    id: 'exp-15-arctic',
    slug: '15th-indian-arctic-expedition',
    title: '15th Indian Arctic Expedition',
    year: 2022,
    region: 'Arctic',
    station_id: 'st-himadri',
    station: MOCK_STATIONS[0],
    expedition_number: '15th IndArc',
    objectives: 'Monitoring fjord dynamics, black carbon atmospheric deposition, and microbial diversity in Kongsfjorden.',
    research_areas: ['Atmospheric Chemistry', 'Marine Biology', 'Permafrost Studies'],
    institutions: ['NCPOR', 'IISER Pune', 'CSIR-NIO', 'University of Delhi'],
    scientists: ['Dr. K. P. Krishnan', 'Dr. N. Anil Kumar'],
    description: 'Conducted comprehensive summer and winter observation campaigns at Himadri station, focusing on black carbon impacts on glacial melting in Svalbard.',
    image_url: 'https://images.pexels.com/photos/1663376/pexels-photo-1663376.jpeg?auto=compress&cs=tinysrgb&w=1920'
  },
  {
    id: 'exp-40-antarctic',
    slug: '40th-indian-antarctic-expedition',
    title: '40th Indian Scientific Expedition to Antarctica',
    year: 2020,
    region: 'Antarctica',
    station_id: 'st-maitri',
    station: MOCK_STATIONS[1],
    expedition_number: '40th IAE',
    objectives: 'Long-term environmental monitoring, maintenance of Maitri infrastructure, and geological mapping of Schirmacher Oasis.',
    research_areas: ['Geology', 'Meteorology', 'Microbiology'],
    institutions: ['NCPOR', 'Geological Survey of India', 'IMD'],
    scientists: ['Dr. Yogesh Ray', 'Dr. Manish Tiwari'],
    description: 'A historic milestone marking 40 continuous years of Indian scientific endeavor on the frozen continent.',
    image_url: 'https://images.pexels.com/photos/20558172/pexels-photo-20558172.jpeg?auto=compress&cs=tinysrgb&w=1920'
  },
  {
    id: 'exp-so-2019',
    slug: 'southern-ocean-expedition-2019',
    title: '11th Southern Ocean Scientific Expedition',
    year: 2019,
    region: 'Southern Ocean',
    station_id: 'st-bharati',
    station: MOCK_STATIONS[2],
    expedition_number: '11th SOE',
    objectives: 'Biogeochemical flux measurement, sea-ice extent observations, and Antarctic Circumpolar Current profiling.',
    research_areas: ['Oceanography', 'Biogeochemistry', 'Remote Sensing'],
    institutions: ['NCPOR', 'Cochin University of Science and Technology', 'SAC ISRO'],
    scientists: ['Dr. Anoop Kumar', 'Dr. N. C. Pant'],
    description: 'Multidisciplinary oceanic expedition studying biogeochemical carbon sequestration and physical oceanography in the Southern Ocean.',
    image_url: 'https://images.pexels.com/photos/30429916/pexels-photo-30429916.jpeg?auto=compress&cs=tinysrgb&w=1920'
  }
];

export const MOCK_DOCUMENTS: Document[] = [
  {
    id: 'doc-01',
    slug: 'indian-arctic-black-carbon-report-2023',
    title: 'Aerosol Deposition and Black Carbon Dynamics in High Arctic Fjords',
    type: 'Research Paper',
    region: 'Arctic',
    year: 2023,
    research_areas: ['Atmospheric Science', 'Glaciology'],
    description: 'Comprehensive measurements of atmospheric black carbon at Himadri station and its quantitative impact on radiative forcing and glacier melt rates in Kongsfjorden.',
    abstract: 'Atmospheric black carbon (BC) transport to the High Arctic accelerates ice sheet surface melt through snow albedo reduction. This study presents continuous five-year optical absorption measurements collected at Himadri research station (78°55\'N, Ny-Ålesund). Findings indicate seasonal spikes during long-range transport events from Eurasia, contributing up to 0.4 W/m² local radiative heating.',
    authors: ['Dr. K. P. Krishnan', 'Dr. R. Lal', 'Dr. Thamban Meloth'],
    institution: 'National Centre for Polar and Ocean Research (NCPOR)',
    tags: ['Aerosol', 'Black Carbon', 'Himadri', 'Svalbard', 'Glacier Melt'],
    source: 'NCPOR Scientific Report Series',
    expedition_id: 'exp-15-arctic',
    station_id: 'st-himadri',
    file_url: '#',
    pages: 42,
    doi: '10.1007/s12040-023-02145-x'
  },
  {
    id: 'doc-02',
    slug: 'prydz-bay-oceanographic-survey-2023',
    title: 'Prydz Bay Coastal Circulation and Ocean-Ice Shelf Interaction',
    type: 'Expedition Report',
    region: 'Antarctica',
    year: 2023,
    research_areas: ['Oceanography', 'Climate Science'],
    description: 'CTD oceanographic profiles and mooring data collected offshore from Bharati station studying Modified Circumpolar Deep Water intrusion.',
    abstract: 'Observations near Bharati station, Larsemann Hills, demonstrate warm saline Modified Circumpolar Deep Water (MCDW) seasonal intrusions into the Prydz Bay cavity. Hydrographic transects conducted during the 43rd Indian Antarctic Expedition highlight key drivers of basal melt beneath nearby ice tongues.',
    authors: ['Dr. M. Ravichandran', 'Dr. S. Rajan', 'Dr. A. K. Mitra'],
    institution: 'NCPOR / Ministry of Earth Sciences',
    tags: ['Prydz Bay', 'Bharati', 'Oceanography', 'MCDW', 'Ice Shelf'],
    source: '43rd IAE Expedition Data Volume',
    expedition_id: 'exp-43-antarctic',
    station_id: 'st-bharati',
    file_url: '#',
    pages: 68,
    doi: '10.1016/j.dsr2.2023.105210'
  },
  {
    id: 'doc-03',
    slug: 'schirmacher-oasis-microbial-diversity',
    title: 'Extreme Adaptation Mechanisms of Psychrophilic Microorganisms in Schirmacher Oasis',
    type: 'Publication',
    region: 'Antarctica',
    year: 2021,
    research_areas: ['Biology', 'Microbiology'],
    description: 'Genome sequencing and cold-active enzymatic analysis of bacterial isolates from Priyadarshini Lake near Maitri station.',
    abstract: 'Priyadarshini Lake in the Schirmacher Oasis hosts unique microbial mats adapted to sub-zero temperatures and intense UV radiation. Isolates retrieved during Antarctic operations exhibit novel cold-adapted proteases and UV-repair enzymes with significant biotechnological applications.',
    authors: ['Dr. S. Shiv Mohan', 'Dr. G. S. Reddy'],
    institution: 'Centre for Cellular and Molecular Biology / NCPOR',
    tags: ['Microbiology', 'Maitri', 'Schirmacher Oasis', 'Enzymes'],
    source: 'Polar Biology Journal',
    expedition_id: 'exp-40-antarctic',
    station_id: 'st-maitri',
    file_url: '#',
    pages: 28,
    doi: '10.1007/s00300-021-02890-w'
  },
  {
    id: 'doc-04',
    slug: 'southern-ocean-carbon-flux-dataset',
    title: 'Biogeochemical Carbon Flux Dataset: Indian Sector of Southern Ocean',
    type: 'Dataset',
    region: 'Southern Ocean',
    year: 2020,
    research_areas: ['Oceanography', 'Biogeochemistry'],
    description: 'High-resolution surface pCO2 and particulate organic carbon flux measurements collected along 57°E transect.',
    abstract: 'This dataset compiles underway pCO2, chlorophyll-a, nutrients, and sediment trap organic carbon fluxes recorded aboard ORV Sagar Nidhi across the Sub-Tropical and Polar Fronts in the Indian sector of the Southern Ocean.',
    authors: ['Dr. Anoop Kumar', 'Dr. N. Anil Kumar'],
    institution: 'NCPOR',
    tags: ['Dataset', 'Southern Ocean', 'Carbon Sink', 'pCO2'],
    source: 'NCPOR Data Portal',
    expedition_id: 'exp-so-2019',
    station_id: 'st-bharati',
    file_url: '#',
    pages: 14,
    doi: '10.5281/zenodo.4091234'
  }
];

export const MOCK_MEDIA: Media[] = [
  {
    id: 'med-01',
    slug: 'himadri-station-arctic-winter',
    title: 'Himadri Research Station under Northern Lights',
    type: 'photograph',
    category: 'Stations',
    station_id: 'st-himadri',
    expedition_id: 'exp-15-arctic',
    region: 'Arctic',
    year: 2022,
    description: "India's Himadri station in Ny-Ålesund, Svalbard, lit by the aurora borealis during winter research observations.",
    image_url: 'https://images.pexels.com/photos/1663376/pexels-photo-1663376.jpeg?auto=compress&cs=tinysrgb&w=1920',
    video_url: '',
    photographer: 'NCPOR Expedition Team',
    metadata: { resolution: '3840x2160', camera: 'Canon EOS R5' }
  },
  {
    id: 'med-02',
    slug: 'maitri-station-schirmacher-oasis',
    title: 'Maitri Station Overview and Priyadarshini Lake',
    type: 'photograph',
    category: 'Stations',
    station_id: 'st-maitri',
    expedition_id: 'exp-40-antarctic',
    region: 'Antarctica',
    year: 2020,
    description: "Aerial perspective of Maitri station located in the rocky terrain of Schirmacher Oasis, East Antarctica.",
    image_url: 'https://images.pexels.com/photos/20558172/pexels-photo-20558172.jpeg?auto=compress&cs=tinysrgb&w=1920',
    video_url: '',
    photographer: 'Indian Antarctic Expedition',
    metadata: { resolution: '4000x3000', camera: 'DJI Mavic 2 Pro' }
  },
  {
    id: 'med-03',
    slug: 'bharati-station-larsemann-hills',
    title: 'Bharati Station at Sunset, Larsemann Hills',
    type: 'photograph',
    category: 'Landscapes',
    station_id: 'st-bharati',
    expedition_id: 'exp-43-antarctic',
    region: 'Antarctica',
    year: 2023,
    description: 'Aerodynamic architecture of Bharati station set against Prydz Bay icebergs during midnight sun.',
    image_url: 'https://images.pexels.com/photos/30251942/pexels-photo-30251942.jpeg?auto=compress&cs=tinysrgb&w=1920',
    video_url: '',
    photographer: 'Dr. Thamban Meloth',
    metadata: { resolution: '3840x2160', camera: 'Sony A7R IV' }
  },
  {
    id: 'med-04',
    slug: 'icebreaker-oceanographic-sampling',
    title: 'Ice-Core Sampling Field Operations',
    type: 'photograph',
    category: 'Field Research',
    station_id: 'st-bharati',
    expedition_id: 'exp-43-antarctic',
    region: 'Antarctica',
    year: 2023,
    description: 'Indian scientists retrieving a 100-meter ice core on the Antarctic ice sheet near Larsemann Hills.',
    image_url: 'https://images.pexels.com/photos/30429916/pexels-photo-30429916.jpeg?auto=compress&cs=tinysrgb&w=1920',
    video_url: '',
    photographer: 'NCPOR Media Team',
    metadata: { resolution: '3840x2160' }
  }
];

export const MOCK_STORIES: Story[] = [
  {
    id: 'st-01',
    slug: 'life-at-79-degrees-north',
    title: 'Life at 79° North: Inside India’s Arctic Sentinel',
    hero_image: 'https://images.pexels.com/photos/1663376/pexels-photo-1663376.jpeg?auto=compress&cs=tinysrgb&w=1920',
    introduction: 'In the international scientific settlement of Ny-Ålesund, Svalbard, Indian researchers at Himadri study how warming at the pole echoes into global climate systems and monsoon dynamics.',
    sections: [
      {
        heading: 'The World’s Northernmost Research Community',
        body: 'Ny-Ålesund is a place where radio silence is enforced to protect sensitive instruments, polar bears roam the fjord edges, and scientists from over eleven nations live side by side. Here, India established Himadri in 2008.'
      },
      {
        heading: 'Why the Arctic Matters to India',
        body: 'Changes in Arctic sea-ice volume alter jet stream behavior and planetary wave patterns. Indian atmospheric physicists at Himadri monitor black carbon particles blown from mid-latitudes that settle on pristine snow, accelerating thaw.'
      },
      {
        heading: 'A Day in the Polar Night',
        body: 'During four months of winter darkness, research continues unbroken. Laser-lidar beams shoot green beams into the stratosphere to probe cloud particle size and auroral emissions.'
      }
    ],
    related_expedition_id: 'exp-15-arctic',
    related_document_ids: ['doc-01'],
    related_media_ids: ['med-01'],
    author: 'Editorial Science Desk',
    published_date: '2024-02-15',
    tags: ['Himadri', 'Arctic', 'Climate', 'Svalbard'],
    reading_time: 5
  },
  {
    id: 'st-02',
    slug: 'voices-from-the-ice-maitri-to-bharati',
    title: 'Voices from the Ice: Four Decades in Antarctica',
    hero_image: 'https://images.pexels.com/photos/20558172/pexels-photo-20558172.jpeg?auto=compress&cs=tinysrgb&w=1920',
    introduction: 'From the establishment of Dakshin Gangotri in 1983 to the modern glass-and-steel architecture of Bharati, India has built a continuous legacy of exploration on the southern continent.',
    sections: [
      {
        heading: 'From Canvas Tents to High-Tech Modules',
        body: 'Early Indian Antarctic pioneers lived through harsh blizzards in portable shelters. Today, Bharati station features heat-recovery systems, automated meteorological sensors, and satellite connectivity.'
      },
      {
        heading: 'Decoding Gondwana Supercontinent',
        body: 'Geological samples collected by Indian geologists at Schirmacher Oasis and Larsemann Hills prove that East Antarctica was once joined directly to the east coast of India millions of years ago.'
      }
    ],
    related_expedition_id: 'exp-43-antarctic',
    related_document_ids: ['doc-02', 'doc-03'],
    related_media_ids: ['med-02', 'med-03'],
    author: 'NCPOR Historical Archive',
    published_date: '2023-11-20',
    tags: ['Antarctica', 'Maitri', 'Bharati', 'History'],
    reading_time: 7
  }
];
