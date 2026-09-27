import { useParams, Link } from 'react-router-dom';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { useStation, useExpeditions, useDocuments, useMedia } from '@/lib/hooks';
import { REAL_NPDC_DATASETS } from '@/lib/polarDatasetsCatalog';

export default function StationDetail() {
  const { slug } = useParams();
  const { data: station, loading } = useStation(slug);
  const { data: expeditions } = useExpeditions();
  const { data: documents } = useDocuments();
  const { data: media } = useMedia();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080B0F]/85 backdrop-blur-[2px] relative z-10 pt-20 flex items-center justify-center">
        <p className="font-mono text-sm text-[#9BA6B2]">Loading station...</p>
      </div>
    );
  }

  if (!station) {
    return (
      <div className="min-h-screen bg-[#080B0F]/85 backdrop-blur-[2px] relative z-10 pt-20 flex items-center justify-center">
        <p className="text-[#9BA6B2]">Station not found.</p>
      </div>
    );
  }

  const stationExpeditions = expeditions.filter((e) => e.station_id === station.id);
  const stationDocuments = documents.filter((d) => d.station_id === station.id);
  const stationMedia = media.filter((m) => m.station_id === station.id);

  return (
    <div className="min-h-screen bg-[#080B0F]/85 backdrop-blur-[2px] relative z-10 pt-20">
      {/* Hero */}
      <div className="relative h-[60vh] md:h-[70vh] overflow-hidden">
        <img
          src={station.hero_image_url}
          alt={station.name}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080B0F] via-[#080B0F]/50 to-transparent" />
        <div className="relative z-10 h-full flex flex-col justify-end p-6 md:p-12">
          <Link
            to="/explore"
            className="inline-flex items-center gap-2 text-[#9BA6B2] text-sm font-mono tracking-widest hover:text-[#8FD8E8] transition-colors mb-6"
          >
            <ArrowLeft size={16} /> BACK TO EXPLORE
          </Link>
          <p className="font-mono text-xs tracking-[0.3em] text-[#8FD8E8] mb-3">
            {station.region.toUpperCase()} RESEARCH STATION
          </p>
          <h1 className="font-display font-bold text-6xl md:text-8xl text-[#F4F5F2] tracking-tight mb-4">
            {station.name.toUpperCase()}
          </h1>
          <p className="font-mono text-sm text-[#9BA6B2]">
            {station.coordinates} · {station.location}
          </p>
        </div>
      </div>

      <div className="px-6 md:px-12 py-16 md:py-24 max-w-5xl">
        {/* Overview */}
        <section className="mb-20">
          <h2 className="font-mono text-xs tracking-[0.3em] text-[#8FD8E8] mb-6">STATION OVERVIEW</h2>
          <p className="text-[#F4F5F2] text-lg md:text-xl leading-relaxed mb-8">
            {station.overview}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t border-white/10">
            <div>
              <p className="font-mono text-xs text-[#9BA6B2] mb-1">ESTABLISHED</p>
              <p className="font-display text-2xl text-[#F4F5F2]">{station.established_year}</p>
            </div>
            <div>
              <p className="font-mono text-xs text-[#9BA6B2] mb-1">REGION</p>
              <p className="font-display text-2xl text-[#F4F5F2]">{station.region}</p>
            </div>
            <div>
              <p className="font-mono text-xs text-[#9BA6B2] mb-1">LATITUDE</p>
              <p className="font-mono text-sm text-[#F4F5F2]">{station.coordinates.split(' ')[0]}</p>
            </div>
            <div>
              <p className="font-mono text-xs text-[#9BA6B2] mb-1">LOCATION</p>
              <p className="font-mono text-sm text-[#F4F5F2]">{station.location}</p>
            </div>
          </div>
        </section>

        {/* Research Focus */}
        <section className="mb-20">
          <h2 className="font-mono text-xs tracking-[0.3em] text-[#8FD8E8] mb-6">RESEARCH FOCUS</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {station.research_focus.map((area) => (
              <div
                key={area}
                className="border-t border-white/10 pt-4"
              >
                <p className="font-display font-medium text-lg md:text-xl text-[#F4F5F2]">
                  {area}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Scientific Datasets (NCPOR / NPDC) */}
        {(() => {
          const npdcDatasets = REAL_NPDC_DATASETS.filter(
            (d) => d.stationSlug === station.slug || d.station.toLowerCase() === station.name.toLowerCase()
          );
          return (
            <section className="mb-20">
              <div className="flex items-center justify-between mb-6 pb-2 border-b border-white/10">
                <div>
                  <h2 className="font-mono text-xs tracking-[0.3em] text-[#8FD8E8]">NPDC SCIENTIFIC DATASETS</h2>
                  <p className="text-xs text-[#9BA6B2] font-mono mt-1">
                    {npdcDatasets.length} Archived Datasets from National Polar Data Centre
                  </p>
                </div>
                <Link
                  to={`/data?station=${station.name}`}
                  className="font-mono text-xs text-[#8FD8E8] hover:text-white transition-colors flex items-center gap-1"
                >
                  ALL {station.name.toUpperCase()} DATASETS ({npdcDatasets.length}) <ArrowRight size={14} />
                </Link>
              </div>

              <div className="space-y-4">
                {npdcDatasets.map((ds) => (
                  <Link
                    key={ds.id}
                    to={`/data/${ds.id}`}
                    className="group flex flex-col md:flex-row md:items-center justify-between border border-white/10 bg-[#11161C]/50 p-5 rounded-sm hover:border-[#8FD8E8] transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2 font-mono text-[10px] mb-1">
                        <span className="text-[#8FD8E8] uppercase">{ds.datasetType}</span>
                        <span className="text-white/20">•</span>
                        <span className="text-[#64748b]">{ds.dateStart.slice(0, 4)}–{ds.dateEnd.slice(0, 4)}</span>
                      </div>
                      <p className="font-display text-lg text-[#F4F5F2] group-hover:text-[#8FD8E8] transition-colors">
                        {ds.title}
                      </p>
                      <p className="font-mono text-xs text-[#9BA6B2] mt-1 line-clamp-1">
                        {ds.variables.join(' · ')}
                      </p>
                    </div>
                    <div className="mt-3 md:mt-0 font-mono text-xs text-[#8FD8E8] group-hover:text-white transition-colors flex items-center gap-1 shrink-0">
                      EXPLORE <ArrowRight size={14} />
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          );
        })()}

        {/* Expeditions */}
        {stationExpeditions.length > 0 && (
          <section className="mb-20">
            <h2 className="font-mono text-xs tracking-[0.3em] text-[#8FD8E8] mb-6">EXPEDITIONS</h2>
            <div className="space-y-4">
              {stationExpeditions.map((exp) => (
                <Link
                  key={exp.id}
                  to={`/expeditions/${exp.slug}`}
                  className="group flex items-center justify-between border-b border-white/10 pb-4 hover:border-[#8FD8E8] transition-colors"
                >
                  <div>
                    <p className="font-display text-lg text-[#F4F5F2] group-hover:text-[#8FD8E8] transition-colors">
                      {exp.title}
                    </p>
                    <p className="font-mono text-xs text-[#9BA6B2] mt-1">
                      {exp.year} · {exp.expedition_number}
                    </p>
                  </div>
                  <ArrowRight size={18} className="text-[#9BA6B2] group-hover:text-[#8FD8E8] transition-colors" />
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Related Publications */}
        {stationDocuments.length > 0 && (
          <section className="mb-20">
            <h2 className="font-mono text-xs tracking-[0.3em] text-[#8FD8E8] mb-6">RELATED PUBLICATIONS</h2>
            <div className="space-y-4">
              {stationDocuments.map((doc) => (
                <Link
                  key={doc.id}
                  to={`/knowledge/${doc.slug}`}
                  className="group flex items-start justify-between border-b border-white/10 pb-4 hover:border-[#8FD8E8] transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-display text-lg text-[#F4F5F2] group-hover:text-[#8FD8E8] transition-colors">
                      {doc.title}
                    </p>
                    <p className="font-mono text-xs text-[#9BA6B2] mt-1">
                      {doc.type} · {doc.year} · {doc.institution}
                    </p>
                  </div>
                  <ArrowRight size={18} className="text-[#9BA6B2] group-hover:text-[#8FD8E8] transition-colors mt-1" />
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Related Media */}
        {stationMedia.length > 0 && (
          <section className="mb-20">
            <h2 className="font-mono text-xs tracking-[0.3em] text-[#8FD8E8] mb-6">RELATED MEDIA</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stationMedia.slice(0, 8).map((m) => (
                <Link
                  key={m.id}
                  to="/media"
                  className="group relative aspect-square overflow-hidden"
                >
                  <img
                    src={m.image_url}
                    alt={m.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-[#080B0F]/40 group-hover:bg-[#080B0F]/20 transition-colors" />
                  <p className="absolute bottom-2 left-2 right-2 font-mono text-xs text-[#F4F5F2]/80">
                    {m.title}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
