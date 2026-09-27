import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, ShieldCheck, Database, Info, Sparkles, Layers } from 'lucide-react';
import { REAL_NPDC_DATASETS, PolarDataset } from '@/lib/polarDatasetsCatalog';

export default function DatasetDetail() {
  const { id } = useParams();
  const dataset: PolarDataset | undefined = REAL_NPDC_DATASETS.find((d) => d.id === id);

  if (!dataset) {
    return (
      <div className="min-h-screen bg-[#080B0F]/90 backdrop-blur-md relative z-10 pt-24 px-6 md:px-12 flex flex-col items-center justify-center text-[#F4F5F2]">
        <Database size={48} className="text-[#8FD8E8] mb-4 animate-bounce" />
        <h1 className="font-display font-bold text-3xl mb-2">DATASET NOT FOUND</h1>
        <p className="font-mono text-xs text-[#9BA6B2] mb-6">
          The requested scientific dataset entry does not exist in the NCPOR index.
        </p>
        <Link
          to="/data"
          className="px-6 py-3 border border-[#8FD8E8] text-[#8FD8E8] font-mono text-xs tracking-widest hover:bg-[#8FD8E8] hover:text-[#080B0F] transition-all"
        >
          BACK TO DATA EXPLORER
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080B0F]/90 backdrop-blur-md relative z-10 pt-20 text-[#F4F5F2]">
      {/* Top Navigation */}
      <div className="border-b border-white/10 bg-[#0b1017]/80 px-6 md:px-12 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between font-mono text-xs">
          <Link
            to="/data"
            className="inline-flex items-center gap-2 text-[#9BA6B2] hover:text-[#8FD8E8] transition-colors tracking-widest"
          >
            <ArrowLeft size={14} /> BACK TO SCIENTIFIC DATA EXPLORER
          </Link>
          <span className="text-[#64748b]">
            DATASET METADATA ID: {dataset.id}
          </span>
        </div>
      </div>

      {/* Dataset Header Overview */}
      <div className="px-6 md:px-12 py-10 border-b border-white/10 bg-[#0b1017]/40">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs mb-3">
            <span className="px-2.5 py-1 bg-[#8FD8E8]/10 border border-[#8FD8E8]/40 text-[#8FD8E8] uppercase tracking-wider font-semibold">
              {dataset.station} STATION
            </span>
            <span className="px-2.5 py-1 bg-[#080B0F] border border-white/10 text-[#9BA6B2]">
              {dataset.region}
            </span>
            <span className="px-2.5 py-1 bg-[#080B0F] border border-white/10 text-[#9BA6B2]">
              {dataset.scientificDomain}
            </span>
            <span className="px-2.5 py-1 bg-[#080B0F] border border-white/10 text-[#8FD8E8]/80">
              COVERAGE: {dataset.dateStart} — {dataset.dateEnd}
            </span>
          </div>

          <h1 className="font-display font-bold text-3xl md:text-5xl text-white tracking-tight mb-4 leading-tight">
            {dataset.title}
          </h1>

          <p className="font-mono text-xs md:text-sm text-[#9BA6B2] max-w-3xl leading-relaxed mb-6">
            {dataset.description}
          </p>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/10 font-mono text-xs">
            <div className="flex items-center gap-2 text-[#8FD8E8]">
              <ShieldCheck size={16} />
              <span>OFFICIAL DATA SOURCE: {dataset.source}</span>
            </div>

            <a
              href={dataset.officialSourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#8FD8E8] text-[#080B0F] font-bold tracking-widest hover:bg-white transition-all shadow-md"
            >
              VIEW OFFICIAL SOURCE <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto px-6 md:px-12 py-10 space-y-10">
        {/* DATASET ACCESS & VISUALIZATION NOTICE */}
        <section className="bg-[#11161C]/80 border border-white/10 p-6 md:p-8 rounded-sm shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-white/10 mb-6 gap-3">
            <div>
              <span className="font-mono text-xs tracking-[0.25em] text-[#8FD8E8] uppercase block mb-1 font-semibold">
                NCPOR DATASET ACCESS & LICENSING
              </span>
              <h2 className="font-display font-bold text-2xl text-white">
                Official Portal Access
              </h2>
            </div>
          </div>

          <div className="p-8 border border-[#8FD8E8]/30 bg-[#080B0F]/80 text-center rounded-xs font-mono text-xs">
            <Info size={28} className="text-[#8FD8E8] mx-auto mb-3" />
            <p className="text-white font-semibold text-sm md:text-base mb-2">
              Visualization available from the official NPDC dataset.
            </p>
            <p className="text-[#9BA6B2] max-w-xl mx-auto leading-relaxed mb-6">
              In accordance with the National Polar Data Centre (NCPOR) data licensing terms, raw observation files are restricted to official research usage and are accessible directly via the official NPDC portal.
            </p>
            <a
              href={dataset.officialSourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#8FD8E8] text-[#080B0F] font-mono text-xs font-bold tracking-widest hover:bg-white transition-all shadow-lg"
            >
              VIEW OFFICIAL SOURCE <ExternalLink size={14} />
            </a>
          </div>
        </section>

        {/* DATASET METADATA SPECIFICATIONS TABLE */}
        <section className="bg-[#11161C]/80 border border-white/10 p-6 md:p-8 rounded-sm">
          <span className="font-mono text-xs tracking-[0.25em] text-[#8FD8E8] uppercase block mb-2 font-semibold">
            TECHNICAL METADATA SPECIFICATIONS
          </span>
          <h3 className="font-display font-bold text-2xl text-white mb-6">
            OBSERVATIONAL PARAMETERS & ATTRIBUTES
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs">
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-white/10">
                <span className="text-[#9BA6B2]">RESEARCH STATION:</span>
                <span className="text-white font-semibold">{dataset.station}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/10">
                <span className="text-[#9BA6B2]">GEOGRAPHIC REGION:</span>
                <span className="text-white">{dataset.region}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/10">
                <span className="text-[#9BA6B2]">SCIENTIFIC DOMAIN:</span>
                <span className="text-[#8FD8E8]">{dataset.scientificDomain}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/10">
                <span className="text-[#9BA6B2]">DATASET TYPE:</span>
                <span className="text-white">{dataset.datasetType}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-white/10">
                <span className="text-[#9BA6B2]">START DATE:</span>
                <span className="text-white">{dataset.dateStart}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/10">
                <span className="text-[#9BA6B2]">END DATE:</span>
                <span className="text-white">{dataset.dateEnd}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/10">
                <span className="text-[#9BA6B2]">FILE FORMAT:</span>
                <span className="text-white">{dataset.fileFormat}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/10">
                <span className="text-[#9BA6B2]">DATA SOURCE:</span>
                <span className="text-[#8FD8E8]">{dataset.source}</span>
              </div>
            </div>
          </div>

          {/* Variables Table */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <h4 className="font-mono text-xs text-[#8FD8E8] uppercase tracking-wider mb-3 font-semibold">
              OBSERVED VARIABLES & UNITS
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-white/15 text-[#64748b] uppercase">
                    <th className="py-2 px-3">#</th>
                    <th className="py-2 px-3">Variable Name</th>
                    <th className="py-2 px-3">Scientific Unit</th>
                  </tr>
                </thead>
                <tbody>
                  {dataset.variables.map((v, i) => (
                    <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                      <td className="py-2 px-3 text-[#64748b]">0{i + 1}</td>
                      <td className="py-2 px-3 text-white font-semibold">{v}</td>
                      <td className="py-2 px-3 text-[#8FD8E8]">{dataset.units[i] || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* RELATED POLAR LINKS */}
        <section className="flex flex-col sm:flex-row gap-4 justify-between bg-[#11161C]/50 border border-white/10 p-6 rounded-sm">
          <div>
            <span className="font-mono text-[10px] text-[#8FD8E8] tracking-widest uppercase block mb-1">
              CONNECTED STATION ARCHIVE
            </span>
            <h4 className="font-display font-bold text-xl text-white mb-1">
              {dataset.station} Station Hub
            </h4>
            <p className="font-mono text-xs text-[#9BA6B2]">
              Explore expedition reports, publications, and media connected to {dataset.station}.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              to={`/explore/${dataset.stationSlug}`}
              className="px-5 py-2.5 border border-[#8FD8E8] text-[#8FD8E8] font-mono text-xs tracking-wider hover:bg-[#8FD8E8] hover:text-[#080B0F] transition-all flex items-center gap-1.5"
            >
              <Layers size={14} /> STATION DETAILS
            </Link>
            <Link
              to={`/ai?q=Tell me about ${dataset.title} at ${dataset.station}`}
              className="px-5 py-2.5 bg-[#8FD8E8] text-[#080B0F] font-mono text-xs font-bold tracking-wider hover:bg-white transition-all flex items-center gap-1.5"
            >
              <Sparkles size={14} /> ASK POLAR AI
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
