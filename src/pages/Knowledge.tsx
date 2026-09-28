import { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, ArrowRight, FileText, Download, Sparkles, X } from 'lucide-react';
import { useDocuments } from '@/lib/hooks';
import type { Document } from '@/lib/types';

const REGIONS = ['Arctic', 'Antarctica', 'Himalaya', 'Southern Ocean'];
const TYPES = ['Expedition Report', 'Research Paper', 'Publication', 'Dataset', 'Photograph', 'Video', 'Educational Resource'];
const RESEARCH_AREAS = ['Climate', 'Glaciology', 'Oceanography', 'Atmospheric Science', 'Biology', 'Geology'];

export default function Knowledge() {
  const { data: documents, loading } = useDocuments();
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [activeRegions, setActiveRegions] = useState<string[]>([]);
  const [activeTypes, setActiveTypes] = useState<string[]>([]);
  const [activeAreas, setActiveAreas] = useState<string[]>([]);
  const [yearRange, setYearRange] = useState<[number, number]>([1980, 2030]);

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) setQuery(q);
  }, [searchParams]);

  const filtered = useMemo(() => {
    return documents.filter((doc) => {
      if (query) {
        const q = query.toLowerCase();
        const haystack = (doc.title + ' ' + doc.description + ' ' + (doc.tags || []).join(' ') + ' ' + (doc.authors || []).join(' ')).toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (activeRegions.length && !activeRegions.includes(doc.region)) return false;
      if (activeTypes.length && !activeTypes.includes(doc.type)) return false;
      if (activeAreas.length && !doc.research_areas.some((a) => activeAreas.includes(a))) return false;
      if (doc.year && (doc.year < yearRange[0] || doc.year > yearRange[1])) return false;
      return true;
    });
  }, [documents, query, activeRegions, activeTypes, activeAreas, yearRange]);

  const toggle = (arr: string[], setArr: (v: string[]) => void, val: string) => {
    setArr(arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val]);
  };

  return (
    <div className="min-h-screen bg-[#080B0F]/85 backdrop-blur-[2px] relative z-10 pt-20">
      <div className="px-6 md:px-12 py-16 md:py-24">
        <p className="font-mono text-xs tracking-[0.3em] text-[#8FD8E8] mb-6">KNOWLEDGE</p>
        <h1 className="font-display font-bold text-5xl md:text-7xl lg:text-8xl text-[#F4F5F2] tracking-tight mb-6">
          POLAR KNOWLEDGE
          <br />
          REPOSITORY
        </h1>
        <p className="text-[#9BA6B2] text-lg max-w-xl mb-6">
          Search India's polar science reports, datasets, publications, and educational resources.
        </p>

        <div className="flex flex-wrap items-center gap-4 mb-12">
          <Link
            to="/data"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#8FD8E8] text-[#080B0F] font-mono text-xs font-bold tracking-widest hover:bg-white transition-all shadow-lg"
          >
            EXPLORE REAL SCIENTIFIC DATASETS <ArrowRight size={14} />
          </Link>
        </div>

        {/* Search bar */}
        <div className="relative max-w-2xl mb-12">
          <Search size={20} className="absolute left-0 top-1/2 -translate-y-1/2 text-[#9BA6B2]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search reports, datasets, publications..."
            className="w-full bg-transparent border-b border-white/20 text-[#F4F5F2] placeholder-[#9BA6B2] py-3 pl-8 pr-8 text-lg focus:outline-none focus:border-[#8FD8E8]"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-0 top-1/2 -translate-y-1/2 text-[#9BA6B2] hover:text-[#F4F5F2]"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      <div className="px-6 md:px-12 pb-24 flex flex-col lg:flex-row gap-12">
        {/* Filters sidebar */}
        <aside className="lg:w-64 flex-shrink-0 space-y-8">
          <div>
            <h3 className="font-mono text-xs tracking-widest text-[#9BA6B2] mb-4">REGION</h3>
            <div className="space-y-2">
              {REGIONS.map((r) => (
                <button
                  key={r}
                  onClick={() => toggle(activeRegions, setActiveRegions, r)}
                  className={`block text-sm transition-colors ${activeRegions.includes(r) ? 'text-[#8FD8E8]' : 'text-[#F4F5F2]/70 hover:text-[#F4F5F2]'
                    }`}
                >
                  <span className="mr-2">{activeRegions.includes(r) ? '◆' : '◇'}</span>
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-mono text-xs tracking-widest text-[#9BA6B2] mb-4">TYPE</h3>
            <div className="space-y-2">
              {TYPES.map((t) => (
                <button
                  key={t}
                  onClick={() => toggle(activeTypes, setActiveTypes, t)}
                  className={`block text-sm transition-colors ${activeTypes.includes(t) ? 'text-[#8FD8E8]' : 'text-[#F4F5F2]/70 hover:text-[#F4F5F2]'
                    }`}
                >
                  <span className="mr-2">{activeTypes.includes(t) ? '◆' : '◇'}</span>
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-mono text-xs tracking-widest text-[#9BA6B2] mb-4">RESEARCH AREA</h3>
            <div className="space-y-2">
              {RESEARCH_AREAS.map((a) => (
                <button
                  key={a}
                  onClick={() => toggle(activeAreas, setActiveAreas, a)}
                  className={`block text-sm transition-colors ${activeAreas.includes(a) ? 'text-[#8FD8E8]' : 'text-[#F4F5F2]/70 hover:text-[#F4F5F2]'
                    }`}
                >
                  <span className="mr-2">{activeAreas.includes(a) ? '◆' : '◇'}</span>
                  {a}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-mono text-xs tracking-widest text-[#9BA6B2] mb-4">YEAR</h3>
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={yearRange[0]}
                onChange={(e) => setYearRange([Number(e.target.value), yearRange[1]])}
                className="w-20 bg-[#11161C] border border-white/10 text-[#F4F5F2] text-sm px-2 py-1 font-mono focus:outline-none focus:border-[#8FD8E8]"
              />
              <span className="text-[#9BA6B2]">—</span>
              <input
                type="number"
                value={yearRange[1]}
                onChange={(e) => setYearRange([yearRange[0], Number(e.target.value)])}
                className="w-20 bg-[#11161C] border border-white/10 text-[#F4F5F2] text-sm px-2 py-1 font-mono focus:outline-none focus:border-[#8FD8E8]"
              />
            </div>
          </div>

          {(activeRegions.length > 0 || activeTypes.length > 0 || activeAreas.length > 0 || query) && (
            <button
              onClick={() => {
                setActiveRegions([]);
                setActiveTypes([]);
                setActiveAreas([]);
                setQuery('');
              }}
              className="font-mono text-xs text-[#9BA6B2] hover:text-[#8FD8E8] tracking-widest"
            >
              CLEAR ALL FILTERS
            </button>
          )}
        </aside>

        {/* Results */}
        <div className="flex-1">
          <p className="font-mono text-xs text-[#9BA6B2] mb-6 tracking-widest">
            {loading ? 'LOADING...' : `${filtered.length} RESULT${filtered.length !== 1 ? 'S' : ''}`}
          </p>

          {loading ? (
            <p className="text-[#9BA6B2]">Loading documents...</p>
          ) : filtered.length === 0 ? (
            <p className="text-[#9BA6B2]">No documents match your search. Try adjusting filters.</p>
          ) : (
            <div className="space-y-0">
              {filtered.map((doc: Document) => (
                <div
                  key={doc.id}
                  className="group border-t border-white/10 py-6 hover:border-[#8FD8E8]/30 transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-start gap-4">
                    <div className="flex-1">
                      <Link to={`/knowledge/${doc.slug}`}>
                        <h3 className="font-display text-xl md:text-2xl text-[#F4F5F2] group-hover:text-[#8FD8E8] transition-colors mb-2">
                          {doc.title}
                        </h3>
                      </Link>
                      <p className="text-sm text-[#9BA6B2] mb-3 line-clamp-2">
                        {doc.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs text-[#9BA6B2]/70">
                        <span className="text-[#8FD8E8]">{doc.type}</span>
                        <span>·</span>
                        <span>{doc.region}</span>
                        {doc.year && (<><span>·</span><span>{doc.year}</span></>)}
                        {doc.institution && (<><span>·</span><span>{doc.institution}</span></>)}
                      </div>
                      {doc.tags && doc.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {doc.tags.slice(0, 5).map((tag) => (
                            <span key={tag} className="font-mono text-xs text-[#9BA6B2]/60 border border-white/10 px-2 py-0.5">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex md:flex-col gap-2 flex-shrink-0">
                      <Link
                        to={`/knowledge/${doc.slug}`}
                        className="font-mono text-xs text-[#9BA6B2] hover:text-[#8FD8E8] tracking-widest flex items-center gap-1"
                      >
                        VIEW <ArrowRight size={12} />
                      </Link>
                      <button
                        onClick={() => {
                          const blob = new Blob([doc.abstract || doc.description], { type: 'text/plain' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `${doc.slug}.txt`;
                          a.click();
                          URL.revokeObjectURL(url);
                        }}
                        className="font-mono text-xs text-[#9BA6B2] hover:text-[#8FD8E8] tracking-widest flex items-center gap-1"
                      >
                        <Download size={12} /> DOWNLOAD
                      </button>
                      <Link
                        to={`/ai?doc=${doc.slug}`}
                        className="font-mono text-xs text-[#9BA6B2] hover:text-[#8FD8E8] tracking-widest flex items-center gap-1"
                      >
                        <Sparkles size={12} /> ASK AI
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
