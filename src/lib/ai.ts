import type { Document } from './types';
import scientificMLResults from './scientificMLResults.json';

// AI abstraction layer — supports external LLM API via environment variable,
// with a deterministic demo fallback using seeded knowledge base.

const AI_ENDPOINT = import.meta.env.VITE_POLAR_AI_ENDPOINT;
const AI_API_KEY = import.meta.env.VITE_POLAR_AI_API_KEY;

export type AISource = {
  documentSlug: string;
  title: string;
  page: string;
  excerpt: string;
};

export type ScientificMLCardData = {
  datasetName: string;
  station: string;
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
  return scored.filter((s) => s.score > 0).slice(0, 3).map((s) => s.doc);
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
  const stationMap: Record<string, string> = {
    himadri: 'Himadri',
    maitri: 'Maitri',
    bharati: 'Bharati',
  };

  let answer = '';
  const q = query.toLowerCase();

  if (q.includes('himadri') || (top.region === 'Arctic' && q.includes('arctic'))) {
    answer = `Himadri is India's Arctic research station located in Ny-Ålesund, Svalbard, at 79°N latitude. Research at Himadri focuses on ${['climate science', 'atmospheric chemistry', 'glaciology', 'auroral studies'].join(', ')}. `;
    if (top.abstract) {
      answer += `According to ${top.title}, ${top.abstract.substring(0, 200)}...`;
    }
  } else if (q.includes('maitri') || q.includes('schirmacher')) {
    answer = `Maitri is India's Antarctic research station in the Schirmacher Oasis, operational since 1989. Research covers ${['geology', 'glaciology', 'meteorology', 'biology'].join(', ')}. `;
    if (top.abstract) {
      answer += `As documented in ${top.title}, ${top.abstract.substring(0, 200)}...`;
    }
  } else if (q.includes('bharati') || q.includes('larsemann')) {
    answer = `Bharati is India's newest Antarctic station, located in the Larsemann Hills since 2012. It focuses on ${['oceanography', 'polar biology', 'climate research'].join(', ')}. `;
    if (top.abstract) {
      answer += `${top.title} reports that ${top.abstract.substring(0, 200)}...`;
    }
  } else if (q.includes('climate') || q.includes('warming') || q.includes('temperature')) {
    answer = `Indian polar research has documented significant climate changes in both polar regions. ${top.abstract ? top.abstract.substring(0, 300) + '...' : ''}`;
  } else if (q.includes('glacier') || q.includes('ice')) {
    answer = `Glaciological studies by Indian scientists include ice core analysis, glacier monitoring, and sea ice dynamics. ${top.abstract ? top.abstract.substring(0, 300) + '...' : ''}`;
  } else if (q.includes('expedition')) {
    answer = `India has conducted over 40 Antarctic expeditions and 15 Arctic expeditions. ${top.description ? top.description.substring(0, 300) + '...' : ''}`;
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
  const q = query.toLowerCase();
  const directTerms = [
    'maitri temperature ml',
    'maitri temperature prediction',
    'maitri temperature model',
    'random forest',
    'scientific ml',
    'ml model',
    'maitri ml',
    'temperature model',
    'weather model',
    'temperature prediction',
    'sase model',
    'sankalp model',
    'forecasting model',
    'predict temperature',
    'ml accuracy',
    'r2 score',
    'explained variance',
    'dataset audit',
  ];
  if (directTerms.some((term) => q.includes(term))) return true;

  const mentionsStationOrTemp =
    q.includes('maitri') ||
    q.includes('temperature') ||
    q.includes('weather') ||
    q.includes('sase') ||
    q.includes('sankalp');
  const mentionsML =
    q.includes('ml') ||
    q.includes('model') ||
    q.includes('predict') ||
    q.includes('forecast') ||
    q.includes('forest') ||
    q.includes('r2') ||
    q.includes('r^2') ||
    q.includes('accuracy') ||
    q.includes('train') ||
    q.includes('regression') ||
    q.includes('evaluat');

  return mentionsStationOrTemp && mentionsML;
}

function getScientificMLResponse(): AIResponse {
  const rawImportances = scientificMLResults.feature_importances as Record<string, number>;
  const topFeatures = Object.entries(rawImportances)
    .slice(0, 5)
    .map(([name, importance]) => ({ name, importance: Number(importance) }));

  const scientificML: ScientificMLCardData = {
    datasetName: scientificMLResults.dataset_name,
    station: scientificMLResults.station,
    target: scientificMLResults.target,
    targetDescription: scientificMLResults.target_description,
    trainingPeriod: scientificMLResults.training_period,
    testingPeriod: scientificMLResults.testing_period,
    trainSampleCount: scientificMLResults.train_sample_count,
    testSampleCount: scientificMLResults.test_sample_count,
    totalValidSamples: scientificMLResults.total_valid_samples,
    r2Score: scientificMLResults.r2_score,
    mae: scientificMLResults.mae,
    rmse: scientificMLResults.rmse,
    topFeatures,
    algorithm: scientificMLResults.model_parameters.algorithm,
    datasetRoute: '/knowledge/data/maitri-sankalp-sase-meteorology',
    sourceAttribution: 'National Polar Data Centre (NCPOR) — Maitri scientific dataset',
  };

  const answer = `SCIENTIFIC INTELLIGENCE REPORT: Maitri Station Temperature Prediction Model

Evaluation results for the trained Random Forest Regressor on the Maitri SASE SANKALP meteorological observation series:

• Target Variable: Ambient Air Temperature (tempr in °C)
• Model Algorithm: RandomForestRegressor (n_estimators=100, max_depth=15, random_state=42)
• Training Chronological Period: 2006–2013 (${scientificMLResults.train_sample_count.toLocaleString()} valid hourly samples)
• Independent Test Period: 2014–2015 (${scientificMLResults.test_sample_count.toLocaleString()} valid hourly samples)
• Total Processed Observations: ${scientificMLResults.total_valid_samples.toLocaleString()} clean hourly weather readings

Model Performance Metrics:
- Explained variance (R²): ${scientificMLResults.r2_score.toFixed(4)}
- Mean absolute error: ${scientificMLResults.mae.toFixed(4)} °C
- Root mean squared error: ${scientificMLResults.rmse.toFixed(4)} °C

Top Contributing Predictor Variables:
1. ${topFeatures[0]?.name}: ${(topFeatures[0]?.importance * 100).toFixed(1)}% (Cos-encoded monthly solar cycle)
2. ${topFeatures[1]?.name}: ${(topFeatures[1]?.importance * 100).toFixed(1)}% (Day-of-year position)
3. ${topFeatures[2]?.name}: ${(topFeatures[2]?.importance * 100).toFixed(1)}% (Wind speed in m/s)
4. ${topFeatures[3]?.name}: ${(topFeatures[3]?.importance * 100).toFixed(1)}% (Relative humidity %)
5. ${topFeatures[4]?.name}: ${(topFeatures[4]?.importance * 100).toFixed(1)}% (Sin-encoded monthly cycle)`;

  return {
    answer,
    sources: [
      {
        documentSlug: 'maitri-sankalp-sase-meteorology',
        title: 'Maitri SASE Automatic Weather Station (SASE SANKALP)',
        page: 'Scientific ML Model Evaluation',
        excerpt: `RandomForestRegressor evaluation on 79,967 observations. R² = ${scientificMLResults.r2_score}, MAE = ${scientificMLResults.mae} °C.`,
      },
    ],
    scientificML,
  };
}

export async function askPolarAI(
  query: string,
  allDocs: Document[]
): Promise<AIResponse> {
  // Check for Scientific ML query intent first
  if (isScientificMLQuery(query)) {
    await new Promise((r) => setTimeout(r, 400));
    return getScientificMLResponse();
  }

  // Try external AI if configured
  if (AI_ENDPOINT && AI_API_KEY) {
    try {
      const relevant = retrieveRelevantDocs(query, allDocs);
      const context = relevant
        .map((d) => `Title: ${d.title}\nAbstract: ${d.abstract || d.description}`)
        .join('\n\n');

      const response = await fetch(AI_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${AI_API_KEY}`,
        },
        body: JSON.stringify({
          query,
          context,
          sources: relevant.map((d) => ({
            documentSlug: d.slug,
            title: d.title,
          })),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.answer && data.sources) {
          return data;
        }
      }
    } catch {
      // Fall through to demo
    }
  }

  // Demo fallback — simulate async
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

#PolarScience #IndiaAtThePoles #${region.replace(/\s+/g, '')} #NCPOR #ClimateScience #PolarResearch #IndianScience`;

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

#PolarScience #${region.replace(/\s+/g, '')} #IndianScience #ClimateChange #NCPOR`;

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

This research was conducted by scientists from ${doc.institution || 'NCPOR'}, working in some of the most challenging conditions on Earth. They traveled thousands of kilometers, endured extreme cold, and spent months away from home — all to bring back knowledge that benefits us all.

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
  const targetDoc = doc || (prompt ? retrieveRelevantDocs(prompt, allDocs)[0] : null) || (allDocs.length > 0 ? allDocs[0] : null);

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
