import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useExpeditions } from '@/lib/hooks';

export default function Expeditions() {
  const { data: expeditions, loading } = useExpeditions();
  const [filterRegion, setFilterRegion] = useState<string>('all');
  const [filterStation, setFilterStation] = useState<string>('all');

  const regions = useMemo(() => {
    const set = new Set(expeditions.map((e) => e.region));
    return ['all', ...Array.from(set)];
  }, [expeditions]);

  const stations = useMemo(() => {
    const set = new Set(
      expeditions
        .filter((e) => e.station)
        .map((e) => e.station!.name)
    );
    return ['all', ...Array.from(set)];
  }, [expeditions]);

  const filtered = useMemo(() => {
    return expeditions.filter((e) => {
      if (filterRegion !== 'all' && e.region !== filterRegion) return false;
      if (filterStation !== 'all' && (!e.station || e.station.name !== filterStation)) return false;
      return true;
    });
  }, [expeditions, filterRegion, filterStation]);

  // Group by year for timeline
  const yearGroups = useMemo(() => {
    const groups: Record<number, typeof filtered> = {};
    filtered.forEach((e) => {
      if (!groups[e.year]) groups[e.year] = [];
      groups[e.year].push(e);
    });
    return Object.entries(groups).sort((a, b) => Number(b[0]) - Number(a[0]));
  }, [filtered]);

  return (
    <div className="min-h-screen bg-[#080B0F]/85 backdrop-blur-[2px] relative z-10 pt-20">
      <div className="px-6 md:px-12 py-16 md:py-24">
        <p className="font-mono text-xs tracking-[0.3em] text-[#8FD8E8] mb-6">EXPEDITIONS</p>
        <h1 className="font-display font-bold text-5xl md:text-7xl lg:text-8xl text-[#F4F5F2] tracking-tight mb-6">
          INDIA'S POLAR
          <br />
          EXPEDITIONS
        </h1>
        <p className="text-[#9BA6B2] text-lg max-w-xl">
          A timeline of India's scientific missions to the Arctic and Antarctic.
        </p>
      </div>

      {/* Filters */}
      <div className="px-6 md:px-12 pb-12">
        <div className="flex flex-col md:flex-row gap-6 md:gap-12 border-t border-white/10 pt-6">
          <div>
            <p className="font-mono text-xs text-[#9BA6B2] mb-3 tracking-widest">REGION</p>
            <div className="flex flex-wrap gap-2">
              {regions.map((r) => (
                <button
                  key={r}
                  onClick={() => setFilterRegion(r)}
                  className={`font-mono text-xs tracking-widest px-3 py-1 transition-colors ${
                    filterRegion === r
                      ? 'text-[#8FD8E8] border-b border-[#8FD8E8]'
                      : 'text-[#9BA6B2] hover:text-[#F4F5F2]'
                  }`}
                >
                  {r === 'all' ? 'ALL' : r.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="font-mono text-xs text-[#9BA6B2] mb-3 tracking-widest">STATION</p>
            <div className="flex flex-wrap gap-2">
              {stations.map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterStation(s)}
                  className={`font-mono text-xs tracking-widest px-3 py-1 transition-colors ${
                    filterStation === s
                      ? 'text-[#8FD8E8] border-b border-[#8FD8E8]'
                      : 'text-[#9BA6B2] hover:text-[#F4F5F2]'
                  }`}
                >
                  {s === 'all' ? 'ALL' : s.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="px-6 md:px-12 pb-24">
        {loading ? (
          <p className="font-mono text-sm text-[#9BA6B2]">Loading expeditions...</p>
        ) : yearGroups.length === 0 ? (
          <p className="font-mono text-sm text-[#9BA6B2]">No expeditions match these filters.</p>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-px bg-white/10" />

            {yearGroups.map(([year, exps]) => (
              <div key={year} className="relative mb-16">
                <div className="font-display font-bold text-3xl md:text-5xl text-[#9BA6B2]/30 mb-8">
                  {year}
                </div>
                <div className="space-y-6 pl-8 md:pl-0">
                  {exps.map((exp) => (
                    <Link
                      key={exp.id}
                      to={`/expeditions/${exp.slug}`}
                      className="group block relative"
                    >
                      {/* Timeline dot */}
                      <div className="absolute -left-8 md:left-1/2 top-2 w-2 h-2 rounded-full bg-[#8FD8E8] md:-translate-x-1" />

                      <div className="md:w-1/2 md:pr-12 md:text-right md:ml-0 ml-0">
                        <div className="border border-white/10 p-6 hover:border-[#8FD8E8] transition-colors bg-[#11161C]/50">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <p className="font-mono text-xs text-[#8FD8E8] mb-2 tracking-widest">
                                {exp.expedition_number} · {exp.region.toUpperCase()}
                              </p>
                              <h3 className="font-display font-bold text-xl text-[#F4F5F2] group-hover:text-[#8FD8E8] transition-colors mb-2">
                                {exp.title}
                              </h3>
                              <p className="text-sm text-[#9BA6B2] line-clamp-2">
                                {exp.description}
                              </p>
                              <div className="flex flex-wrap gap-2 mt-3">
                                {exp.research_areas.slice(0, 3).map((a) => (
                                  <span key={a} className="font-mono text-xs text-[#9BA6B2]/70 border border-white/10 px-2 py-0.5">
                                    {a}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <ArrowRight size={18} className="text-[#9BA6B2] group-hover:text-[#8FD8E8] transition-colors flex-shrink-0" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
