import type { ReactNode } from 'react';
import { useState } from 'react';
import {
  Copy,
  Sparkles,
  RefreshCw,
  Check,
} from 'lucide-react';

import { useDocuments } from '@/lib/hooks';
import { generatePolarContent } from '@/lib/ai';

type ContentType =
  | 'Website Article'
  | 'Instagram Caption'
  | 'Social Media Post'
  | 'YouTube Description'
  | 'Short Video Script'
  | 'Outreach Article';

type Audience =
  | 'public'
  | 'student'
  | 'researcher'
  | 'educator';

const TYPES: ContentType[] = [
  'Website Article',
  'Instagram Caption',
  'Social Media Post',
  'YouTube Description',
  'Short Video Script',
  'Outreach Article',
];

const AUDIENCES: {
  value: Audience;
  label: string;
}[] = [
    {
      value: 'public',
      label: 'General Public',
    },
    {
      value: 'student',
      label: 'Students',
    },
    {
      value: 'researcher',
      label: 'Researchers',
    },
    {
      value: 'educator',
      label: 'Educators',
    },
  ];

function getPlatform(
  type: ContentType,
): string {
  switch (type) {
    case 'Instagram Caption':
      return 'instagram';

    case 'Social Media Post':
      return 'linkedin';

    case 'YouTube Description':
      return 'youtube';

    case 'Short Video Script':
      return 'instagram';

    case 'Website Article':
      return 'website';

    case 'Outreach Article':
      return 'website';

    default:
      return 'website';
  }
}

export default function ContentStudio() {
  const { data: docs = [] } =
    useDocuments();

  const [docId, setDocId] =
    useState('');

  const [type, setType] =
    useState<ContentType>(
      'Website Article',
    );

  const [audience, setAudience] =
    useState<Audience>('public');

  const [prompt, setPrompt] =
    useState('');

  const [output, setOutput] =
    useState('');

  const [citations, setCitations] =
    useState<
      Array<{
        title: string;
        source: string;
        route: string;
        score?: number;
      }>
    >([]);

  const [busy, setBusy] =
    useState(false);

  const [copied, setCopied] =
    useState(false);

  const [error, setError] =
    useState('');

  const selected =
    docs.find(
      (d) => d.id === docId,
    ) || null;

  const canGenerate =
    selected ||
    prompt.trim().length > 0;

  async function handleGenerate() {
    if (!canGenerate || busy) {
      return;
    }

    setBusy(true);
    setCopied(false);
    setError('');

    try {
      /*
       * If a repository document is selected,
       * use its title as the primary POLAR
       * knowledge query.
       *
       * Otherwise use the user's topic.
       */
      const query = selected
        ? `${selected.title}${prompt.trim()
          ? ` ${prompt.trim()}`
          : ''
        }`
        : prompt.trim();

      const platform =
        getPlatform(type);

      const result =
        await generatePolarContent(
          query,
          audience,
          platform,
        );

      setOutput(
        result.content || '',
      );

      setCitations(
        Array.isArray(
          result.citations,
        )
          ? result.citations
          : [],
      );
    } catch (err) {
      console.error(
        'POLAR content generation failed:',
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : 'Unable to generate content.',
      );

      setOutput('');
      setCitations([]);
    } finally {
      setBusy(false);
    }
  }

  async function handleCopy() {
    if (!output) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        output,
      );

      setCopied(true);

      setTimeout(
        () => setCopied(false),
        2000,
      );
    } catch (error) {
      console.error(
        'Failed to copy content:',
        error,
      );
    }
  }

  return (
    <main className="min-h-screen bg-[#080B0F]/85 backdrop-blur-[2px] relative z-10 text-[#F4F5F2] pt-28 pb-24">
      <div className="max-w-6xl mx-auto px-6 md:px-12">

        {/* HEADER */}
        <section className="py-12 md:py-16 max-w-3xl">
          <p className="font-mono text-xs tracking-[0.3em] text-[#8FD8E8] mb-6">
            POLAR SCIENCE OUTREACH
          </p>

          <h1 className="font-display font-bold text-5xl md:text-7xl leading-[0.95] tracking-tight">
            Turn research
            <br />
            <span className="text-[#8FD8E8]">
              into stories.
            </span>
          </h1>

          <p className="mt-6 text-[#9BA6B2] text-lg leading-relaxed">
            Generate outreach articles, social media
            captions, video scripts, and public-facing
            content grounded in the POLAR knowledge
            repository.
          </p>
        </section>

        {/* MAIN CONTENT */}
        <section className="grid lg:grid-cols-[380px_1fr] gap-8 border-t border-white/10 pt-8">

          {/* LEFT CONTROLS */}
          <aside className="space-y-6 bg-[#11161C]/40 p-6 border border-white/10 h-fit">

            {/* SOURCE DOCUMENT */}
            <Field label="SOURCE DOCUMENT (OPTIONAL)">
              <select
                value={docId}
                onChange={(e) =>
                  setDocId(e.target.value)
                }
                className="w-full bg-[#080B0F] border border-white/15 text-[#F4F5F2] text-sm p-3 focus:outline-none focus:border-[#8FD8E8]"
              >
                <option value="">
                  Select a repository document...
                </option>

                {docs.map((d) => (
                  <option
                    key={d.id}
                    value={d.id}
                  >
                    {d.title} ({d.year})
                  </option>
                ))}
              </select>
            </Field>

            {/* CONTENT TYPE */}
            <Field label="OUTPUT CONTENT TYPE">
              <select
                value={type}
                onChange={(e) =>
                  setType(
                    e.target
                      .value as ContentType,
                  )
                }
                className="w-full bg-[#080B0F] border border-white/15 text-[#F4F5F2] text-sm p-3 focus:outline-none focus:border-[#8FD8E8]"
              >
                {TYPES.map((t) => (
                  <option
                    key={t}
                    value={t}
                  >
                    {t}
                  </option>
                ))}
              </select>
            </Field>

            {/* AUDIENCE */}
            <Field label="TARGET AUDIENCE">
              <select
                value={audience}
                onChange={(e) =>
                  setAudience(
                    e.target
                      .value as Audience,
                  )
                }
                className="w-full bg-[#080B0F] border border-white/15 text-[#F4F5F2] text-sm p-3 focus:outline-none focus:border-[#8FD8E8]"
              >
                {AUDIENCES.map(
                  (item) => (
                    <option
                      key={item.value}
                      value={item.value}
                    >
                      {item.label}
                    </option>
                  ),
                )}
              </select>
            </Field>

            {/* PROMPT */}
            <Field label="DIRECTION / TOPIC CONTEXT">
              <textarea
                value={prompt}
                onChange={(e) =>
                  setPrompt(
                    e.target.value,
                  )
                }
                placeholder="Enter a topic, key facts, or what you want to emphasize..."
                className="w-full bg-[#080B0F] border border-white/15 text-[#F4F5F2] text-sm p-3 min-h-28 resize-y focus:outline-none focus:border-[#8FD8E8]"
              />
            </Field>

            {/* GENERATE BUTTON */}
            <button
              onClick={
                handleGenerate
              }
              disabled={
                busy || !canGenerate
              }
              className="w-full py-4 bg-[#8FD8E8] text-[#080B0F] font-mono text-xs tracking-widest disabled:opacity-40 inline-flex justify-center items-center gap-2 hover:bg-[#8FD8E8]/90 transition-colors"
            >
              {busy ? (
                <>
                  GENERATING CONTENT...
                  <RefreshCw
                    size={15}
                    className="animate-spin"
                  />
                </>
              ) : output ? (
                <>
                  REGENERATE
                  <RefreshCw
                    size={15}
                  />
                </>
              ) : (
                <>
                  GENERATE CONTENT
                  <Sparkles
                    size={15}
                  />
                </>
              )}
            </button>

            {/* ERROR */}
            {error && (
              <div className="border border-red-400/30 bg-red-400/5 p-4 text-xs text-red-300 font-mono leading-relaxed">
                {error}
              </div>
            )}
          </aside>

          {/* RIGHT OUTPUT */}
          <article className="min-h-[540px] bg-[#11161C]/60 border border-white/10 p-6 md:p-10 flex flex-col justify-between">

            <div>

              {/* OUTPUT HEADER */}
              <div className="flex justify-between items-center pb-4 border-b border-white/10 mb-6">

                <p className="font-mono text-xs tracking-widest text-[#8FD8E8]">
                  GENERATED{' '}
                  {type.toUpperCase()}
                </p>

                {output && (
                  <button
                    onClick={
                      handleCopy
                    }
                    className="font-mono text-xs tracking-widest text-[#9BA6B2] hover:text-[#8FD8E8] transition-colors inline-flex items-center gap-2"
                  >
                    {copied ? (
                      <>
                        COPIED!
                        <Check
                          size={14}
                          className="text-[#8FD8E8]"
                        />
                      </>
                    ) : (
                      <>
                        COPY CONTENT
                        <Copy
                          size={14}
                        />
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* OUTPUT */}
              {output ? (
                <div className="space-y-8">

                  <div className="whitespace-pre-wrap font-mono text-xs md:text-sm leading-relaxed text-[#F4F5F2]/90">
                    {output}
                  </div>

                  {/* CITATIONS */}
                  {citations.length >
                    0 && (
                      <div className="pt-6 border-t border-white/10">

                        <p className="font-mono text-[10px] tracking-widest text-[#8FD8E8] mb-4">
                          VERIFIED POLAR SOURCES
                        </p>

                        <div className="space-y-3">
                          {citations.map(
                            (
                              citation,
                              index,
                            ) => (
                              <a
                                key={`${citation.title}-${index}`}
                                href={
                                  citation.route
                                }
                                className="block border border-white/10 p-4 hover:border-[#8FD8E8]/50 transition-colors"
                              >
                                <div className="flex items-center justify-between gap-4">

                                  <div>
                                    <p className="text-sm text-[#F4F5F2]">
                                      {
                                        citation.title
                                      }
                                    </p>

                                    <p className="text-[10px] font-mono text-[#9BA6B2] mt-1 uppercase">
                                      {
                                        citation.source
                                      }
                                    </p>
                                  </div>

                                  {typeof citation.score ===
                                    'number' && (
                                      <span className="text-[10px] font-mono text-[#8FD8E8]">
                                        {Math.round(
                                          citation.score *
                                          100,
                                        )}
                                        %
                                      </span>
                                    )}
                                </div>
                              </a>
                            ),
                          )}
                        </div>
                      </div>
                    )}
                </div>
              ) : (
                <div className="h-[360px] flex flex-col items-center justify-center text-center text-[#9BA6B2] text-sm gap-3">

                  <Sparkles
                    size={32}
                    className="text-[#8FD8E8]/40"
                  />

                  <p className="max-w-md">
                    Select a repository
                    document or enter a
                    topic to generate
                    publication-ready
                    outreach material
                    grounded in POLAR
                    research.
                  </p>
                </div>
              )}
            </div>

            {/* COPY BUTTON */}
            {output && (
              <div className="pt-6 border-t border-white/10 mt-8 flex justify-end">
                <button
                  onClick={
                    handleCopy
                  }
                  className="px-6 py-3 border border-[#8FD8E8] text-[#8FD8E8] font-mono text-xs tracking-widest hover:bg-[#8FD8E8] hover:text-[#080B0F] transition-all"
                >
                  {copied
                    ? 'COPIED TO CLIPBOARD'
                    : 'COPY TO CLIPBOARD'}
                </button>
              </div>
            )}
          </article>
        </section>
      </div>
    </main>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="block font-mono text-[10px] tracking-widest text-[#9BA6B2] mb-2">
        {label}
      </span>

      {children}
    </label>
  );
}