import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Link } from 'react-router-dom';

import {
  ArrowRight,
  Bot,
  Send,
  Sparkles,
} from 'lucide-react';

import {
  useDocuments,
  useExpeditions,
  useStations,
} from '@/lib/hooks';

import { askPolarAI, type AIResponse } from '@/lib/ai';

const SUGGESTIONS = [
  'What is studied at Himadri?',
  'Tell me about Maitri station',
  'What research happens at Bharati?',
  'What were the objectives of the 15th Indian Arctic Expedition?',
  'Which expeditions are associated with Himadri?',
  'What research was conducted during the 43rd Indian Antarctic Expedition?',
  'What is the Black Carbon study about?',
  'What is the Permafrost Temperature Monitoring in Svalbard dataset about?',
];

export default function PolarAI() {
  const { data: documents, loading: documentsLoading } = useDocuments();
  const { data: expeditions, loading: expeditionsLoading } = useExpeditions();
  const { data: stations, loading: stationsLoading } = useStations();
  const sourceDataLoading =
    documentsLoading || expeditionsLoading || stationsLoading;

  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<AIResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const pendingSourceQuery = useRef<string | null>(null);

  const executeAsk = useCallback(async (q: string) => {
    setLoading(true);

    try {
      const result = await askPolarAI(
        q,
        documents,
        expeditions,
        stations
      );
      setResponse(result);

      if (result.sources.length && pendingSourceQuery.current === q) {
        pendingSourceQuery.current = null;
      }
    } finally {
      setLoading(false);
    }
  }, [documents, expeditions, stations]);

  useEffect(() => {
    if (sourceDataLoading || loading || !pendingSourceQuery.current) return;

    const pendingQuery = pendingSourceQuery.current;
    pendingSourceQuery.current = null;
    void executeAsk(pendingQuery);
  }, [executeAsk, loading, sourceDataLoading]);

  async function handleAsk(targetQuery?: string) {
    const q = (targetQuery || query).trim();

    if (!q || loading) return;

    if (sourceDataLoading) {
      pendingSourceQuery.current = q;
      if (targetQuery) {
        setQuery(targetQuery);
      }
      return;
    }

    if (targetQuery) {
      setQuery(targetQuery);
    }

    await executeAsk(q);
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    void handleAsk();
  }

  return (
    <main className="min-h-screen bg-[#080B0F]/85 backdrop-blur-[2px] relative z-10 text-[#F4F5F2] pt-28 pb-24">
      <div className="max-w-6xl mx-auto px-6 md:px-12">
        <section className="max-w-3xl py-12 md:py-16">
          <p className="font-mono text-xs tracking-[0.3em] text-[#8FD8E8] mb-6">POLAR AI / RESEARCH INTERFACE</p>
          <h1 className="font-display font-bold text-5xl md:text-7xl leading-[0.95] tracking-tight">
            Ask the<br />
            <span className="text-[#8FD8E8]">polar archive.</span>
          </h1>
          <p className="mt-6 text-[#9BA6B2] text-lg leading-relaxed">
            Explore the knowledge repository through a retrieval-grounded polar research assistant.
          </p>
        </section>

        <section className="border-y border-white/10 py-8">
          <form onSubmit={submit} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 flex items-center border border-white/15 bg-[#11161C] focus-within:border-[#8FD8E8]/60">
              <Bot size={18} className="mx-4 text-[#8FD8E8] flex-shrink-0" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask about a station, expedition, document, or dataset..."
                className="w-full bg-transparent py-4 pr-4 outline-none text-sm placeholder:text-[#9BA6B2]/60"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="px-6 py-4 bg-[#8FD8E8] text-[#080B0F] disabled:opacity-40 font-mono text-xs tracking-widest flex items-center justify-center gap-2 hover:bg-[#8FD8E8]/90 transition-colors"
            >
              {loading ? 'THINKING...' : 'ASK'} <Send size={15} />
            </button>
          </form>
          <div className="flex flex-wrap gap-x-6 gap-y-3 mt-5">
            <span className="font-mono text-xs text-[#9BA6B2]/60">SUGGESTIONS:</span>
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => void handleAsk(s)}
                className="text-xs text-[#9BA6B2] hover:text-[#8FD8E8] transition-colors text-left font-mono"
              >
                "{s}"
              </button>
            ))}
          </div>
        </section>

        {response && (
          <section className="py-16">
            <div className="grid lg:grid-cols-[1fr_340px] gap-12">
              <div className="bg-[#11161C]/50 border border-white/10 p-6 md:p-8">
                <div className="flex items-center gap-3 text-xs font-mono tracking-widest text-[#8FD8E8] mb-6">
                  <Sparkles size={16} /> AI GENERATED RESPONSE
                </div>
                <div className="text-lg leading-relaxed text-[#F4F5F2]/90 whitespace-pre-line">
                  <ReactMarkdown>{response.answer}</ReactMarkdown>
                </div>
              </div>
              <aside className="border border-white/10 p-6 bg-[#11161C]/30 h-fit">
                <p className="font-mono text-xs tracking-widest text-[#8FD8E8] mb-6">CITED SOURCES</p>
                <div className="space-y-4">
                  {response.sources.length ? (
                    response.sources.map((source) => (
                      <Link
                        key={source.route || source.documentSlug}
                        to={source.route || `/knowledge/${source.documentSlug}`}
                        className="block border-t border-white/10 pt-4 hover:border-[#8FD8E8]/60 transition-colors group"
                      >
                        <p className="text-sm font-display text-[#F4F5F2] group-hover:text-[#8FD8E8] transition-colors">
                          {source.title}
                        </p>
                        <p className="text-xs font-mono text-[#9BA6B2] mt-2">
                          {source.page} · View in Repository →
                        </p>
                      </Link>
                    ))
                  ) : (
                    <p className="text-sm text-[#9BA6B2]">No specific repository source matched.</p>
                  )}
                </div>
              </aside>
            </div>
          </section>
        )}

        {!response && (
          <section className="py-20 grid md:grid-cols-3 gap-8 border-b border-white/10">
            <Info title="Repository Grounded" text="Answers are anchored directly in Indian polar scientific reports, datasets, and expedition records." />
            <Info title="Repository Sources" text="Answers include links to relevant station, expedition, document, and dataset records when available." />
            <Info title="Grounded Responses" text="Responses use information retrieved from the POLAR knowledge repository." />
          </section>
        )}

        <div className="pt-10">
          <Link to="/knowledge" className="inline-flex items-center gap-2 text-sm font-mono text-[#9BA6B2] hover:text-[#8FD8E8] transition-colors">
            BROWSE KNOWLEDGE REPOSITORY <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </main>
  );
}

function Info({ title, text }: { title: string; text: string }) {
  return (
    <div className="border border-white/10 p-6 bg-[#11161C]/20">
      <h3 className="font-display font-bold text-xl mb-3 text-[#F4F5F2]">{title}</h3>
      <p className="text-sm leading-relaxed text-[#9BA6B2]">{text}</p>
    </div>
  );
}
