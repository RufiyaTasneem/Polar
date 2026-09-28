import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Bot, Cpu, ExternalLink, Send, Sparkles } from 'lucide-react';
import { useDocuments } from '@/lib/hooks';
import { askPolarAI, type AIResponse } from '@/lib/ai';

const SUGGESTIONS = [
  'Maitri temperature ML prediction model',
  'What is studied at Himadri?',
  'Tell me about Maitri station',
  'What research happens at Bharati?',
  'How does polar research matter to India?'
];

export default function PolarAI() {
  const { data: documents } = useDocuments();
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<AIResponse | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleAsk(targetQuery?: string) {
    const q = (targetQuery || query).trim();
    if (!q || loading) return;
    if (targetQuery) setQuery(targetQuery);
    setLoading(true);
    try {
      const res = await askPolarAI(q, documents);
      setResponse(res);
    } finally {
      setLoading(false);
    }
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
            Explore the knowledge repository through a retrieval-grounded polar research assistant with scientific ML intelligence.
          </p>
        </section>

        <section className="border-y border-white/10 py-8">
          <form onSubmit={submit} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 flex items-center border border-white/15 bg-[#11161C] focus-within:border-[#8FD8E8]/60">
              <Bot size={18} className="mx-4 text-[#8FD8E8] flex-shrink-0" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask about a station, temperature ML model, expedition, or dataset..."
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
            {response.scientificML && (
              <div className="mb-10 border border-[#8FD8E8]/30 bg-[#0E1520] p-6 md:p-8 relative overflow-hidden shadow-2xl">
                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                  <div className="flex items-center gap-2 text-xs font-mono text-[#8FD8E8] tracking-[0.2em] uppercase">
                    <Cpu size={16} /> SCIENTIFIC INTELLIGENCE
                  </div>
                  <span className="text-[10px] font-mono text-[#8FD8E8]/80 bg-[#8FD8E8]/10 px-2.5 py-1 border border-[#8FD8E8]/20 uppercase">
                    Trained Model Output
                  </span>
                </div>

                <div className="mb-6">
                  <h3 className="font-display font-bold text-2xl md:text-3xl text-[#F4F5F2]">
                    {response.scientificML.station} — Temperature Model
                  </h3>
                  <p className="text-sm font-mono text-[#8FD8E8] mt-1">
                    {response.scientificML.algorithm} (Supervised Machine Learning)
                  </p>
                </div>

                <div className="grid sm:grid-cols-3 gap-4 my-6 p-4 bg-[#11161C] border border-white/10">
                  <div>
                    <span className="text-xs font-mono text-[#9BA6B2] block uppercase tracking-wider">Explained variance (R²)</span>
                    <span className="font-mono text-2xl font-bold text-[#8FD8E8]">{response.scientificML.r2Score.toFixed(4)}</span>
                  </div>
                  <div>
                    <span className="text-xs font-mono text-[#9BA6B2] block uppercase tracking-wider">Mean absolute error</span>
                    <span className="font-mono text-2xl font-bold text-[#F4F5F2]">{response.scientificML.mae.toFixed(4)} °C</span>
                  </div>
                  <div>
                    <span className="text-xs font-mono text-[#9BA6B2] block uppercase tracking-wider">Root mean squared error</span>
                    <span className="font-mono text-2xl font-bold text-[#F4F5F2]">{response.scientificML.rmse.toFixed(4)} °C</span>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 text-sm py-2">
                  <div className="space-y-2.5">
                    <p className="font-mono text-xs text-[#8FD8E8] uppercase tracking-widest">Model Partitioning</p>
                    <div className="bg-[#11161C]/60 p-3 border border-white/5 space-y-1.5 text-xs font-mono">
                      <p className="text-[#9BA6B2]"><strong className="text-[#F4F5F2]">Training Period:</strong> {response.scientificML.trainingPeriod} ({response.scientificML.trainSampleCount.toLocaleString()} samples)</p>
                      <p className="text-[#9BA6B2]"><strong className="text-[#F4F5F2]">Independent Test Period:</strong> {response.scientificML.testingPeriod} ({response.scientificML.testSampleCount.toLocaleString()} samples)</p>
                      <p className="text-[#9BA6B2]"><strong className="text-[#F4F5F2]">Total Clean Observations:</strong> {response.scientificML.totalValidSamples.toLocaleString()}</p>
                    </div>
                  </div>

                  <div>
                    <p className="font-mono text-xs text-[#8FD8E8] uppercase tracking-widest mb-2.5">Top Contributing Variables</p>
                    <div className="space-y-2 bg-[#11161C]/60 p-3 border border-white/5">
                      {response.scientificML.topFeatures.map((feat) => (
                        <div key={feat.name} className="flex items-center justify-between text-xs font-mono">
                          <span className="text-[#F4F5F2]">{feat.name}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-white/10 h-1.5 overflow-hidden">
                              <div className="bg-[#8FD8E8] h-full" style={{ width: `${Math.round(feat.importance * 100)}%` }} />
                            </div>
                            <span className="text-[#9BA6B2] text-[11px] w-10 text-right">{(feat.importance * 100).toFixed(1)}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <span className="text-[#9BA6B2] font-mono">
                    Source: {response.scientificML.sourceAttribution}
                  </span>
                  <Link
                    to={response.scientificML.datasetRoute}
                    className="inline-flex items-center gap-1.5 font-mono text-[#8FD8E8] hover:underline hover:text-white transition-colors"
                  >
                    View Dataset Entry <ExternalLink size={13} />
                  </Link>
                </div>
              </div>
            )}

            <div className="grid lg:grid-cols-[1fr_340px] gap-12">
              <div className="bg-[#11161C]/50 border border-white/10 p-6 md:p-8">
                <div className="flex items-center gap-3 text-xs font-mono tracking-widest text-[#8FD8E8] mb-6">
                  <Sparkles size={16} /> AI GENERATED RESPONSE
                </div>
                <p className="text-lg leading-relaxed text-[#F4F5F2]/90 whitespace-pre-line">
                  {response.answer}
                </p>
              </div>
              <aside className="border border-white/10 p-6 bg-[#11161C]/30 h-fit">
                <p className="font-mono text-xs tracking-widest text-[#8FD8E8] mb-6">CITED SOURCES</p>
                <div className="space-y-4">
                  {response.sources.length ? (
                    response.sources.map((source) => (
                      <Link
                        key={source.documentSlug}
                        to={`/knowledge/${source.documentSlug}`}
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
            <Info title="Scientific ML Intelligence" text="Integrates real trained machine learning models derived from local scientific observation data." />
            <Info title="Autonomous Demo Mode" text="Runs locally with deterministic semantic fallback when external LLM endpoints are unconfigured." />
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
