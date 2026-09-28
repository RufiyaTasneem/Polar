import { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, ArrowRight, ExternalLink, Filter, Database, BarChart2, ShieldCheck } from 'lucide-react';
import { REAL_NPDC_DATASETS, PolarDataset } from '@/lib/polarDatasetsCatalog';

const STATIONS = ['All', 'Himadri', 'Maitri', 'Bharati'];
const REGIONS = ['All', 'Arctic', 'Antarctica'];
const DOMAINS = ['All', 'Atmosphere', 'Cryosphere', 'Ocean', 'Geophysics', 'Environment'];
const DATASET_TYPES = [
  'All',
  'Meteorology',
  'Hydrography',
  'Black Carbon & Aerosols',
  'Radiation & Optics',
  'Geochemistry',
  'Expedition Records',
  'Ocean Currents',
  'Marine Biology',
];

export default function ScientificDataExplorer() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [selectedStation, setSelectedStation] = useState(searchParams.get('station') || 'All');
  const [selectedRegion, setSelectedRegion] = useState(searchParams.get('region') || 'All');
  const [selectedDomain, setSelectedDomain] = useState(searchParams.get('domain') || 'All');
  const [selectedType, setSelectedType] = useState(searchParams.get('type') || 'All');

  useEffect(() => {
    const stationParam = searchParams.get('station');
    if (stationParam) {
      const found = STATIONS.find(s => s.toLowerCase() === stationParam.toLowerCase());
      if (found) setSelectedStation(found);
    }
  }, [searchParams]);

  const filteredDatasets = useMemo(() => {
    return REAL_NPDC_DATASETS.filter((ds) => {
      if (query) {
        const q = query.toLowerCase();
        const haystack = (
          ds.title +
          ' ' +
          ds.description +
          ' ' +
          ds.station +
          ' ' +
          ds.datasetType +
          ' ' +
          ds.scientificDomain +
          ' ' +
          ds.variables.join(' ')
        ).toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      if (selectedStation !== 'All' && ds.station.toLowerCase() !== selectedStation.toLowerCase()) {
        return false;
      }
      if (selectedRegion !== 'All' && ds.region.toLowerCase() !== selectedRegion.toLowerCase()) {
        return false;
      }
      if (selectedDomain !== 'All' && ds.scientificDomain.toLowerCase() !== selectedDomain.toLowerCase()) {
        return false;
      }
      if (selectedType !== 'All' && !ds.datasetType.toLowerCase().includes(selectedType.toLowerCase())) {
        return false;
      }

      return true;
    });
  }, [query, selectedStation, selectedRegion, selectedDomain, selectedType]);

  const clearFilters = () => {
    setQuery('');
    setSelectedStation('All');
    setSelectedRegion('All');
    setSelectedDomain('All');
    setSelectedType('All');
    setSearchParams({});
  };

  return (
    <div className="min-h-screen bg-[#080B0F]/90 backdrop-blur-md relative z-10 pt-20 text-[#F4F5F2]">
      {/* Header Banner */}
      <div className="border-b border-white/10 bg-[#0b1017]/80 px-6 md:px-12 py-12 md:py-16">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 font-mono text-xs text-[#8FD8E8] tracking-[0.25em] uppercase mb-3">
            <Database size={14} />
            <span>KNOWLEDGE ARCHIVE • POLAR SCIENTIFIC DATA</span>
          </div>
          <h1 className="font-display font-bold text-4xl md:text-6xl text-white tracking-tight mb-4 leading-none">
            SCIENTIFIC DATA EXPLORER
          </h1>
          <p className="text-[#9BA6B2] text-sm md:text-base font-mono max-w-2xl leading-relaxed mb-6">
            Explore authentic observational datasets, meteorology logs, aerosol profiles, and oceanographic records from India's Arctic and Antarctic research stations.
          </p>

          <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-white/10 font-mono text-xs">
            <div className="flex items-center gap-2 text-[#8FD8E8]">
              <ShieldCheck size={14} />
              <span>OFFICIAL ATTRIBUTION: NATIONAL POLAR DATA CENTRE (NCPOR)</span>
            </div>
            <a
              href="https://npdc.ncpor.res.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[#9BA6B2] hover:text-white transition-colors"
            >
              NPDC PORTAL <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </div>

      {/* Search & Main Layout */}
      <div className="max-w-6xl mx-auto px-6 md:px-12 py-10">
        {/* Search Bar */}
        <div className="relative mb-8">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8FD8E8]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search datasets by variable (temperature, black carbon, salinity), station, or keyword..."
            className="w-full bg-[#11161C]/90 border border-white/15 rounded-sm py-3.5 pl-11 pr-4 text-sm font-mono text-white placeholder-[#64748b] focus:outline-none focus:border-[#8FD8E8] transition-colors"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Filter Sidebar */}
          <aside className="lg:col-span-3 space-y-6 bg-[#11161C]/60 border border-white/10 p-5 rounded-sm h-fit">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="font-mono text-xs font-semibold tracking-wider text-[#8FD8E8] uppercase flex items-center gap-1.5">
                <Filter size={13} /> FILTERS
              </span>
              {(selectedStation !== 'All' || selectedRegion !== 'All' || selectedDomain !== 'All' || selectedType !== 'All' || query) && (
                <button
                  onClick={clearFilters}
                  className="font-mono text-[10px] text-[#9BA6B2] hover:text-[#8FD8E8] uppercase tracking-wider"
                >
                  RESET
                </button>
              )}
            </div>

            {/* Station Filter */}
            <div>
              <label className="font-mono text-[11px] text-[#9BA6B2] uppercase tracking-widest block mb-2 font-semibold">
                STATION
              </label>
              <div className="space-y-1">
                {STATIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedStation(s)}
                    className={`w-full text-left font-mono text-xs px-3 py-1.5 rounded-xs transition-colors flex items-center justify-between ${selectedStation.toLowerCase() === s.toLowerCase()
                        ? 'bg-[#8FD8E8]/15 border border-[#8FD8E8]/40 text-[#8FD8E8] font-bold'
                        : 'text-[#9BA6B2] hover:bg-white/5 hover:text-white'
                      }`}
                  >
                    <span>{s}</span>
                    {s !== 'All' && (
                      <span className="text-[10px] opacity-60">
                        ({REAL_NPDC_DATASETS.filter((d) => d.station === s).length})
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Region Filter */}
            <div>
              <label className="font-mono text-[11px] text-[#9BA6B2] uppercase tracking-widest block mb-2 font-semibold">
                REGION
              </label>
              <div className="space-y-1">
                {REGIONS.map((r) => (
                  <button
                    key={r}
                    onClick={() => setSelectedRegion(r)}
                    className={`w-full text-left font-mono text-xs px-3 py-1.5 rounded-xs transition-colors ${selectedRegion.toLowerCase() === r.toLowerCase()
                        ? 'bg-[#8FD8E8]/15 border border-[#8FD8E8]/40 text-[#8FD8E8] font-bold'
                        : 'text-[#9BA6B2] hover:bg-white/5 hover:text-white'
                      }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Scientific Domain Filter */}
            <div>
              <label className="font-mono text-[11px] text-[#9BA6B2] uppercase tracking-widest block mb-2 font-semibold">
                SCIENTIFIC DOMAIN
              </label>
              <div className="space-y-1">
                {DOMAINS.map((d) => (
                  <button
                    key={d}
                    onClick={() => setSelectedDomain(d)}
                    className={`w-full text-left font-mono text-xs px-3 py-1.5 rounded-xs transition-colors ${selectedDomain.toLowerCase() === d.toLowerCase()
                        ? 'bg-[#8FD8E8]/15 border border-[#8FD8E8]/40 text-[#8FD8E8] font-bold'
                        : 'text-[#9BA6B2] hover:bg-white/5 hover:text-white'
                      }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Dataset Type Filter */}
            <div>
              <label className="font-mono text-[11px] text-[#9BA6B2] uppercase tracking-widest block mb-2 font-semibold">
                DATASET TYPE
              </label>
              <div className="space-y-1">
                {DATASET_TYPES.map((t) => (
                  <button
                    key={t}
                    onClick={() => setSelectedType(t)}
                    className={`w-full text-left font-mono text-xs px-3 py-1.5 rounded-xs transition-colors ${selectedType.toLowerCase() === t.toLowerCase()
                        ? 'bg-[#8FD8E8]/15 border border-[#8FD8E8]/40 text-[#8FD8E8] font-bold'
                        : 'text-[#9BA6B2] hover:bg-white/5 hover:text-white'
                      }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Dataset Cards Grid */}
          <main className="lg:col-span-9">
            <div className="flex items-center justify-between mb-4 font-mono text-xs">
              <span className="text-[#9BA6B2]">
                SHOWING {filteredDatasets.length} SCIENTIFIC DATASET{filteredDatasets.length !== 1 ? 'S' : ''}
              </span>
              <span className="text-[#64748b]">
                AUTHENTIC NPDC / NCPOR ARCHIVE
              </span>
            </div>

            {filteredDatasets.length === 0 ? (
              <div className="p-12 text-center border border-white/10 bg-[#11161C]/40 rounded-sm">
                <p className="font-mono text-sm text-[#9BA6B2] mb-4">
                  No NPDC datasets match your filter criteria.
                </p>
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 border border-[#8FD8E8] text-[#8FD8E8] font-mono text-xs tracking-wider hover:bg-[#8FD8E8] hover:text-[#080B0F] transition-all"
                >
                  RESET ALL FILTERS
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredDatasets.map((dataset: PolarDataset) => (
                  <div
                    key={dataset.id}
                    className="bg-[#11161C]/70 border border-white/10 p-6 rounded-sm hover:border-[#8FD8E8]/50 transition-all duration-300 group flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 font-mono text-[10px]">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-[#8FD8E8]/10 border border-[#8FD8E8]/30 text-[#8FD8E8] uppercase tracking-wider font-semibold">
                            {dataset.datasetType}
                          </span>
                          <span className="px-2 py-0.5 bg-[#080B0F] text-[#9BA6B2] border border-white/10">
                            {dataset.scientificDomain}
                          </span>
                        </div>
                        <span className="text-[#64748b] tracking-wider uppercase">
                          FORMAT: {dataset.fileFormat}
                        </span>
                      </div>

                      {/* Title */}
                      <Link to={`/data/${dataset.id}`}>
                        <h3 className="font-display font-bold text-xl text-white group-hover:text-[#8FD8E8] transition-colors mb-2 leading-tight">
                          {dataset.title}
                        </h3>
                      </Link>

                      {/* Description */}
                      <p className="font-mono text-xs text-[#9BA6B2] line-clamp-2 leading-relaxed mb-4">
                        {dataset.description}
                      </p>

                      {/* Variables & Metadata */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 bg-[#080B0F]/60 border border-white/5 rounded-xs font-mono text-xs mb-4">
                        <div>
                          <span className="text-[10px] text-[#64748b] block uppercase">STATION</span>
                          <span className="text-white font-semibold">{dataset.station}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-[#64748b] block uppercase">REGION</span>
                          <span className="text-white">{dataset.region}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-[#64748b] block uppercase">COVERAGE</span>
                          <span className="text-[#8FD8E8]">{dataset.dateStart.slice(0, 4)}–{dataset.dateEnd.slice(0, 4)}</span>
                        </div>
                      </div>

                      {/* Key Variables Tags */}
                      <div className="mb-4">
                        <span className="font-mono text-[10px] text-[#64748b] uppercase tracking-wider block mb-1">
                          OBSERVED VARIABLES:
                        </span>
                        <div className="flex flex-wrap gap-1.5 font-mono text-[10px]">
                          {dataset.variables.map((v, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-[#080B0F] border border-white/10 text-[#cbd5e1]">
                              {v} ({dataset.units[idx] || 'units'})
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action Bar */}
                    <div className="flex items-center justify-between pt-4 border-t border-white/5 font-mono text-xs">
                      <div className="flex items-center gap-1.5 text-[11px] text-[#64748b]">
                        <span>Source:</span>
                        <span className="text-[#9BA6B2]">{dataset.source}</span>
                      </div>

                      <div className="flex items-center gap-4">
                        <a
                          href={dataset.officialSourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#64748b] hover:text-white transition-colors flex items-center gap-1 text-[11px]"
                        >
                          NPDC SOURCE <ExternalLink size={11} />
                        </a>
                        <Link
                          to={`/data/${dataset.id}`}
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#8FD8E8]/10 border border-[#8FD8E8]/40 text-[#8FD8E8] hover:bg-[#8FD8E8] hover:text-[#080B0F] transition-all font-semibold tracking-wider text-xs"
                        >
                          <Database size={13} /> VIEW METADATA
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
