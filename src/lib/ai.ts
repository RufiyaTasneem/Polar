import type {
  Document,
  Expedition,
  Station,
} from './types';
import scientificMLResults from './scientificMLResults.json';
import bhartiMLResults from './bhartiMLResults.json';
import himadriMLResults from './himadriMLResults.json';

// AI abstraction layer — supports external LLM API via environment variable,
// with a deterministic demo fallback using seeded knowledge base.

const AI_ENDPOINT = import.meta.env.VITE_POLAR_AI_ENDPOINT;
const AI_API_KEY = import.meta.env.VITE_POLAR_AI_API_KEY;

const POLAR_RAG_ENDPOINT =
  import.meta.env.VITE_POLAR_RAG_ENDPOINT || 'http://127.0.0.1:8000';

export type AISource = {
  documentSlug: string;
  title: string;
  page: string;
  excerpt: string;
  route?: string;
};

export type ScientificMLCardData = {
  datasetName: string;
  station: string;
  region: string;
  modelType: string;
  keyInsight: string;
  target: string;
  targetDescription: string;
  trainingPeriod: string;
  testingPeriod: string;
  trainSampleCount: number;
  testSampleCount: number;
  totalValidSamples: number;
  r2Score: number;
  mae: number;
  rmse: number;
  topFeatures: { name: string; importance: number }[];
  algorithm: string;
  datasetRoute: string;
  sourceAttribution: string;
};

export type AIResponse = {
  answer: string;
  sources: AISource[];
  scientificML?: ScientificMLCardData;
};

export type ContentType =
  | 'Website Article'
  | 'Instagram Caption'
  | 'Social Media Post'
  | 'YouTube Description'
  | 'Short Video Script'
  | 'Outreach Article';

type FastAPISource = {
  title?: unknown;
  type?: unknown;
  source_type?: unknown;
  excerpt?: unknown;
};

type FastAPIResponse = {
  answer?: unknown;
  sources?: unknown;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

const normalizeTitle = (value: string) => value.trim().toLowerCase();

// Keyword-based retrieval from local document set (demo RAG)
function retrieveRelevantDocs(query: string, docs: Document[]): Document[] {
  const q = query.toLowerCase();
  const keywords = q.split(/\s+/).filter((w) => w.length > 3);

  const scored = docs.map((doc) => {
    let score = 0;

    const haystack = (
      doc.title +
      ' ' +
      doc.description +
      ' ' +
      doc.abstract +
      ' ' +
      (doc.tags || []).join(' ') +
      ' ' +
      (doc.research_areas || []).join(' ') +
      ' ' +
      doc.region
    ).toLowerCase();

    for (const kw of keywords) {
      if (haystack.includes(kw)) score += 1;
    }

    // Boost for title match
    if (doc.title.toLowerCase().includes(q)) score += 3;

    return { doc, score };
  });

  scored.sort((a, b) => b.score - a.score);

  return scored
    .filter((s) => s.score > 0)
    .slice(0, 3)
    .map((s) => s.doc);
}

function generateDemoAnswer(query: string, docs: Document[]): AIResponse {
  const relevant = docs.length > 0 ? docs : [];

  if (relevant.length === 0) {
    return {
      answer:
        'I could not find specific information about that in the current knowledge repository. Try asking about research at Himadri, Maitri, or Bharati stations, or about Indian polar expeditions.',
      sources: [],
    };
  }

  // Build a contextual answer from the top documents
  const top = relevant[0];

  let answer = '';
  const q = query.toLowerCase();

  if (
    q.includes('himadri') ||
    (top.region === 'Arctic' && q.includes('arctic'))
  ) {
    answer = `Himadri is India's Arctic research station located in Ny-Ålesund, Svalbard, at 79°N latitude. Research at Himadri focuses on ${[
      'climate science',
      'atmospheric chemistry',
      'glaciology',
      'auroral studies',
    ].join(', ')}. `;

    if (top.abstract) {
      answer += `According to ${top.title}, ${top.abstract.substring(0, 200)}...`;
    }
  } else if (q.includes('maitri') || q.includes('schirmacher')) {
    answer = `Maitri is India's Antarctic research station in the Schirmacher Oasis, operational since 1989. Research covers ${[
      'geology',
      'glaciology',
      'meteorology',
      'biology',
    ].join(', ')}. `;

    if (top.abstract) {
      answer += `As documented in ${top.title}, ${top.abstract.substring(0, 200)}...`;
    }
  } else if (q.includes('bharati') || q.includes('larsemann')) {
    answer = `Bharati is India's newest Antarctic station, located in the Larsemann Hills since 2012. It focuses on ${[
      'oceanography',
      'polar biology',
      'climate research',
    ].join(', ')}. `;

    if (top.abstract) {
      answer += `${top.title} reports that ${top.abstract.substring(0, 200)}...`;
    }
  } else if (
    q.includes('climate') ||
    q.includes('warming') ||
    q.includes('temperature')
  ) {
    answer = `Indian polar research has documented significant climate changes in both polar regions. ${top.abstract ? top.abstract.substring(0, 300) + '...' : ''
      }`;
  } else if (q.includes('glacier') || q.includes('ice')) {
    answer = `Glaciological studies by Indian scientists include ice core analysis, glacier monitoring, and sea ice dynamics. ${top.abstract ? top.abstract.substring(0, 300) + '...' : ''
      }`;
  } else if (q.includes('expedition')) {
    answer = `India has conducted over 40 Antarctic expeditions and 15 Arctic expeditions. ${top.description ? top.description.substring(0, 300) + '...' : ''
      }`;
  } else {
    answer = top.abstract
      ? top.abstract.substring(0, 400) + '...'
      : top.description.substring(0, 400) + '...';
  }

  const sources: AISource[] = relevant.map((d, i) => ({
    documentSlug: d.slug,
    title: d.title,
    page: i === 0 ? 'Summary' : `Page ${Math.floor(i * 15) + 12}`,
    excerpt: (d.abstract || d.description).substring(0, 150) + '...',
  }));

  return { answer, sources };
}

export function isScientificMLQuery(query: string): boolean {
  const hasModelIntent =
    /\b(?:ml|machine learning|model|predict(?:ion|ive)?|forecast(?:ing)?|random forest|regression)\b/i.test(
      query
    );
  const hasPolarWeatherContext =
    /\b(?:maitri|bharti|bharati|himadri|temperature|weather|sase|sankalp)\b/i.test(
      query
    );

  return hasModelIntent && hasPolarWeatherContext;
}

function getScientificMLResponse(query: string = ''): AIResponse {
  const q = query.toLowerCase();

  // Decide which station model to return
  let results = scientificMLResults;
  let datasetRoute = '/knowledge/data/maitri-sankalp-sase-meteorology';
  let sourceDocSlug = 'maitri-sankalp-sase-meteorology';
  let sourceDocTitle = 'Maitri SASE Automatic Weather Station (SASE SANKALP)';
  let sourceAttribution =
    'National Polar Data Centre (NCPOR) — Maitri scientific dataset';

  if (q.includes('bharti') || q.includes('bharati')) {
    results = bhartiMLResults;
    datasetRoute = '/knowledge/data/bharati-isea-expedition-series';
    sourceDocSlug = 'bharati-isea-expedition-series';
    sourceDocTitle = 'Bharati Automatic Weather Station Series';
    sourceAttribution =
      'National Polar Data Centre (NCPOR) — Bharati scientific dataset';
  } else if (q.includes('himadri')) {
    results = himadriMLResults;
    datasetRoute = '/knowledge/data/himadri-ott-weather-2018-2021';
    sourceDocSlug = 'himadri-ott-weather-2018-2021';
    sourceDocTitle = 'Himadri High Arctic Meteorological Series';
    sourceAttribution =
      'National Polar Data Centre (NCPOR) — Himadri scientific dataset';
  }

  const rawImportances =
    results.feature_importances as Record<string, number>;

  const topFeatures = Object.entries(rawImportances)
    .slice(0, 5)
    .map(([name, importance]) => ({
      name,
      importance: Number(importance),
    }));

  const [stationLabel, region = 'Polar'] = results.station
    .split(',')
    .map((part: string) => part.trim());
  const stationName = stationLabel.replace(/^bharti/i, 'Bharati');
  const modelType =
    results.model_parameters.algorithm === 'RandomForestRegressor'
      ? 'Random Forest'
      : results.model_parameters.algorithm;
  const hasSeasonalPredictor = topFeatures.some((feature) =>
    feature.name.includes('month')
  );
  const hasAnnualCyclePredictor = topFeatures.some(
    (feature) => feature.name === 'dayofyear'
  );
  const keyInsight =
    hasSeasonalPredictor && hasAnnualCyclePredictor
      ? `Seasonal and time-of-year variation are the strongest predictors of temperature at ${stationName}.`
      : `The model identifies patterns in meteorological observations that help explain temperature variation at ${stationName}.`;

  const scientificML: ScientificMLCardData = {
    datasetName: results.dataset_name,
    station: stationName,
    region,
    modelType,
    keyInsight,
    target: results.target,
    targetDescription: results.target_description,
    trainingPeriod: results.training_period,
    testingPeriod: results.testing_period,
    trainSampleCount: results.train_sample_count,
    testSampleCount: results.test_sample_count,
    totalValidSamples: results.total_valid_samples,
    r2Score: results.r2_score,
    mae: results.mae,
    rmse: results.rmse,
    topFeatures,
    algorithm: results.model_parameters.algorithm,
    datasetRoute,
    sourceAttribution,
  };

  const featureLabels: Record<string, string> = {
    cos_month: 'Cos-encoded monthly solar cycle',
    sin_month: 'Sin-encoded monthly cycle',
    dayofyear: 'Day-of-year position',
    ws: 'Wind speed (m/s)',
    rh: 'Relative humidity (%)',
    wd: 'Wind direction (degrees)',
    ap: 'Surface atmospheric pressure (hPa)',
    hour: 'Hour of day (0-23)',
    cos_hour: 'Cos-encoded diurnal cycle',
    sin_hour: 'Sin-encoded diurnal cycle',
    month: 'Month indicator (1-12)',
  };

  const answer = `SCIENTIFIC INTELLIGENCE REPORT: ${stationName}, ${region} Temperature Prediction Model

Evaluation results for the trained ${results.model_parameters.algorithm} on the ${stationName}, ${region} meteorological observation series:

• Target Variable: Ambient Air Temperature (${results.target} in °C)
• Model Algorithm: ${results.model_parameters.algorithm} (n_estimators=${results.model_parameters.n_estimators}, max_depth=${results.model_parameters.max_depth}, random_state=${results.model_parameters.random_state})
• Training Chronological Period: ${results.training_period} (${results.train_sample_count.toLocaleString()} valid hourly samples)
• Independent Test Period: ${results.testing_period} (${results.test_sample_count.toLocaleString()} valid hourly samples)
• Total Processed Observations: ${results.total_valid_samples.toLocaleString()} clean hourly weather readings

Model Performance Metrics:
- Explained variance (R²): ${results.r2_score.toFixed(4)}
- Mean absolute error: ${results.mae.toFixed(4)} °C
- Root mean squared error: ${results.rmse.toFixed(4)} °C

Top Contributing Predictor Variables:
${topFeatures
      .map(
        (feature, index) =>
          `${index + 1}. ${feature.name}: ${(feature.importance * 100).toFixed(1)}% (${featureLabels[feature.name] || 'Meteorological feature'})`
      )
      .join('\n')}`;

  return {
    answer,
    sources: [
      {
        documentSlug: sourceDocSlug,
        title: sourceDocTitle,
        page: 'Scientific ML Model Evaluation',
        excerpt: `RandomForestRegressor evaluation on ${results.total_valid_samples.toLocaleString()} observations. R² = ${results.r2_score}, MAE = ${results.mae} °C.`,
      },
    ],
    scientificML,
  };
}

export async function askPolarAI(
  query: string,
  allDocs: Document[],
  allExpeditions: Expedition[] = [],
  allStations: Station[] = []
): Promise<AIResponse> {
  // ============================================================
  // 1. SCIENTIFIC ML MODE
  // Only explicit ML/model/prediction questions use this path.
  // ============================================================
  if (isScientificMLQuery(query)) {
    await new Promise((r) => setTimeout(r, 400));
    return getScientificMLResponse(query);
  }

  // ============================================================
  // 2. NORMAL POLAR RAG MODE
  // ============================================================
  try {
    const response = await fetch(
      `${POLAR_RAG_ENDPOINT}/api/ask?query=${encodeURIComponent(query)}`
    );

    if (response.ok) {
      const payload: unknown = await response.json();
      const data: FastAPIResponse = isRecord(payload) ? payload : {};

      const backendSources: FastAPISource[] = Array.isArray(data.sources)
        ? data.sources.filter(isRecord)
        : [];

      const sources: AISource[] = [];
      const seenRoutes = new Set<string>();

      for (const item of backendSources) {
        if (typeof item.title !== 'string' || !item.title.trim()) {
          continue;
        }

        const sourceTitle = item.title.trim();
        const normalizedTitle = normalizeTitle(sourceTitle);

        const sourceType =
          typeof item.source_type === 'string'
            ? item.source_type.toLowerCase()
            : '';

        const excerpt =
          typeof item.excerpt === 'string'
            ? item.excerpt
            : '';

        // --------------------------------------------------------
        // DOCUMENT
        // --------------------------------------------------------
        const matchingDoc =
          !sourceType || sourceType === 'documents'
            ? allDocs.find(
                (doc) =>
                  normalizeTitle(doc.title) === normalizedTitle
              )
            : undefined;

        if (matchingDoc) {
          const route = `/knowledge/${matchingDoc.slug}`;

          if (!seenRoutes.has(route)) {
            seenRoutes.add(route);

            sources.push({
              documentSlug: matchingDoc.slug,
              title: matchingDoc.title,
              page:
                typeof item.type === 'string' && item.type
                  ? item.type
                  : 'Repository',
              excerpt:
                excerpt ||
                matchingDoc.description ||
                matchingDoc.abstract ||
                '',
              route,
            });
          }

          continue;
        }

        // --------------------------------------------------------
        // EXPEDITION
        // --------------------------------------------------------
        const matchingExpedition =
          !sourceType || sourceType === 'expeditions'
            ? allExpeditions.find(
                (expedition) =>
                  normalizeTitle(expedition.title) === normalizedTitle
              )
            : undefined;

        if (matchingExpedition) {
          const route = `/expeditions/${matchingExpedition.slug}`;

          if (!seenRoutes.has(route)) {
            seenRoutes.add(route);

            sources.push({
              documentSlug: matchingExpedition.slug,
              title: matchingExpedition.title,
              page: 'Expedition',
              excerpt:
                excerpt ||
                matchingExpedition.description ||
                '',
              route,
            });
          }

          continue;
        }

        // --------------------------------------------------------
        // STATION
        // --------------------------------------------------------
        const matchingStation =
          !sourceType || sourceType === 'stations'
            ? allStations.find(
                (station) =>
                  normalizeTitle(station.name) === normalizedTitle ||
                  normalizeTitle(`${station.name} station`) ===
                    normalizedTitle
              )
            : undefined;

        if (matchingStation) {
          const route = `/explore/${matchingStation.slug}`;

          if (!seenRoutes.has(route)) {
            seenRoutes.add(route);

            sources.push({
              documentSlug: matchingStation.slug,
              title: matchingStation.name,
              page: 'Station',
              excerpt:
                excerpt ||
                matchingStation.description ||
                '',
              route,
            });
          }

          continue;
        }
      }

      // --------------------------------------------------------
      // IMPORTANT:
      // Use the REAL FastAPI answer.
      // Do NOT replace it with the station description.
      // --------------------------------------------------------
      const answer =
        typeof data.answer === 'string' && data.answer.trim()
          ? data.answer.trim()
          : 'I found relevant information in the POLAR knowledge repository.';

      return {
        answer,
        sources,
      };
    }
  } catch (error) {
    console.error('POLAR RAG connection failed:', error);
  }

  // ============================================================
  // 3. LOCAL FALLBACK
  // Only used when FastAPI genuinely fails.
  // ============================================================
  await new Promise((r) => setTimeout(r, 600));

  const relevant = retrieveRelevantDocs(query, allDocs);

  return generateDemoAnswer(query, relevant);
}

function generateDemoContent(
  type: ContentType,
  doc: Document | null,
  prompt: string
): string {
  if (!doc) {
    return 'Please select a document or expedition to generate content.';
  }

  const title = doc.title;
  const desc = doc.description || doc.abstract || '';
  const region = doc.region;
  const year = doc.year;

  switch (type) {
    case 'Website Article':
      return `# ${title}: India's Polar Research in ${region}

India's polar science program continues to push the boundaries of what we know about Earth's most extreme environments. The ${year} research documented in "${title}" represents a significant contribution to our understanding of ${region}.

## Key Findings

${desc}

## Why This Matters

The research conducted by Indian scientists at our polar stations — Himadri in the Arctic, Maitri and Bharati in Antarctica — helps us understand climate patterns that affect the entire planet. What happens at the poles does not stay at the poles.

## Looking Forward

This work is part of India's long-term commitment to polar science, building on decades of expedition data and contributing to global climate research networks.

*Source: ${doc.source || 'NCPOR'}*`;

    case 'Instagram Caption':
      return `India at the poles. ${title} documents groundbreaking ${region} research from ${year}.

${desc.substring(0, 100)}...

#PolarScience #IndiaAtThePoles #${region.replace(
        /\s+/g,
        ''
      )} #NCPOR #ClimateScience #PolarResearch #IndianScience`;

    case 'Social Media Post':
      return `New from India's polar science program: "${title}"

${desc.substring(0, 200)}

Region: ${region} | Year: ${year}
Published by ${doc.institution || 'NCPOR'}

Read more in the POLAR Knowledge Repository.`;

    case 'YouTube Description':
      return `${title}
India's Polar Science | ${region} | ${year}

In this video, we explore the findings from "${title}", a key research document from India's polar science program.

${desc}

About the research:
- Region: ${region}
- Year: ${year}
- Institution: ${doc.institution || 'NCPOR'}
- Research areas: ${(doc.research_areas || []).join(', ')}

Learn more about India's polar research at the POLAR Knowledge Repository.

#PolarScience #${region.replace(
        /\s+/g,
        ''
      )} #IndianScience #ClimateChange #NCPOR`;

    case 'Short Video Script':
      return `[SCENE 1 — OPENING]
Visual: Aerial shot of ${region} ice landscape
Narrator: "In the frozen extremes of ${region}, Indian scientists are uncovering secrets of our planet's past — and its future."

[SCENE 2 — RESEARCH]
Visual: Scientists working at station, collecting samples
Narrator: "${desc.substring(0, 150)}"

[SCENE 3 — IMPACT]
Visual: Data visualization, climate graphs
Narrator: "This research from ${year} helps us understand how polar changes affect the entire globe — including India's monsoons and sea levels."

[SCENE 4 — CLOSING]
Visual: India flag at polar station, sunset
Narrator: "India's polar journey continues. From Himadri to Bharati, science at the extremes, for the benefit of all."

Source: ${title} (${year})`;

    case 'Outreach Article':
      return `# ${title}: Science from the Ends of the Earth

*An outreach article making polar research accessible to everyone.*

## The Story

In ${year}, a team of Indian scientists working in ${region} produced research that helps us understand our changing planet. Their work, documented in "${title}," is part of India's ongoing polar science program — one of the world's most important efforts to study the polar regions.

## What They Found

${desc}

## What It Means for You

You might wonder: why does research in ${region} matter to someone in India? The answer is connections. Polar ice affects ocean currents, which affect monsoons, which affect agriculture, which affects food security. The science done at India's polar stations — Himadri, Maitri, and Bharati — ripples outward to touch every part of our lives.

## The People Behind the Science

This research was conducted by scientists from ${doc.institution || 'NCPOR'
        }, working in some of the most challenging conditions on Earth. They traveled thousands of kilometers, endured extreme cold, and spent months away from home — all to bring back knowledge that benefits us all.

*This article is based on "${title}" from the POLAR Knowledge Repository.*`;

    default:
      return desc;
  }
}

export async function generateContent(
  type: ContentType,
  doc: Document | null,
  prompt: string = '',
  allDocs: Document[] = []
): Promise<string> {
  const targetDoc =
    doc ||
    (prompt ? retrieveRelevantDocs(prompt, allDocs)[0] : null) ||
    (allDocs.length > 0 ? allDocs[0] : null);

  if (AI_ENDPOINT && AI_API_KEY) {
    try {
      const response = await fetch(AI_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${AI_API_KEY}`,
        },
        body: JSON.stringify({
          task: 'generate_content',
          type,
          documentSlug: targetDoc?.slug,
          prompt,
        }),
      });

      if (response.ok) {
        const data = await response.json();

        if (data.text) return data.text;
      }
    } catch {
      // Fall through to demo
    }
  }

  await new Promise((r) => setTimeout(r, 600));

  return generateDemoContent(type, targetDoc, prompt);
}