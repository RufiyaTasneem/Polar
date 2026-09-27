import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, FileText, Download, Sparkles } from 'lucide-react';
import { useExpedition, useDocuments, useMedia } from '@/lib/hooks';

export default function ExpeditionDetail() {
  const { slug } = useParams();
  const { data: expedition, loading } = useExpedition(slug);
  const { data: documents } = useDocuments();
  const { data: media } = useMedia();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080B0F]/85 backdrop-blur-[2px] relative z-10 pt-20 flex items-center justify-center">
        <p className="font-mono text-sm text-[#9BA6B2]">Loading expedition...</p>
      </div>
    );
  }

  if (!expedition) {
    return (
      <div className="min-h-screen bg-[#080B0F]/85 backdrop-blur-[2px] relative z-10 pt-20 flex items-center justify-center">
        <p className="text-[#9BA6B2]">Expedition not found.</p>
      </div>
    );
  }

  const expDocuments = documents.filter((d) => d.expedition_id === expedition.id);
  const expMedia = media.filter((m) => m.expedition_id === expedition.id);

  return (
    <div className="min-h-screen bg-[#080B0F]/85 backdrop-blur-[2px] relative z-10 pt-20">
      {/* Hero */}
      <div className="relative h-[50vh] md:h-[60vh] overflow-hidden">
        <img
          src={expedition.image_url}
          alt={expedition.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080B0F] via-[#080B0F]/50 to-transparent" />
        <div className="relative z-10 h-full flex flex-col justify-end p-6 md:p-12">
          <Link
            to="/expeditions"
            className="inline-flex items-center gap-2 text-[#9BA6B2] text-sm font-mono tracking-widest hover:text-[#8FD8E8] transition-colors mb-6"
          >
            <ArrowLeft size={16} /> BACK TO EXPEDITIONS
          </Link>
          <p className="font-mono text-xs tracking-[0.3em] text-[#8FD8E8] mb-3">
            {expedition.expedition_number} · {expedition.region.toUpperCase()} · {expedition.year}
          </p>
          <h1 className="font-display font-bold text-4xl md:text-6xl lg:text-7xl text-[#F4F5F2] tracking-tight mb-4">
            {expedition.title}
          </h1>
          {expedition.station && (
            <Link
              to={`/explore/${expedition.station.slug}`}
              className="font-mono text-sm text-[#9BA6B2] hover:text-[#8FD8E8] transition-colors"
            >
              Station: {expedition.station.name}
            </Link>
          )}
        </div>
      </div>

      <div className="px-6 md:px-12 py-16 md:py-24 max-w-5xl">
        {/* Objectives */}
        <section className="mb-16">
          <h2 className="font-mono text-xs tracking-[0.3em] text-[#8FD8E8] mb-6">OBJECTIVES</h2>
          <p className="text-[#F4F5F2] text-lg leading-relaxed">
            {expedition.objectives}
          </p>
        </section>

        {/* Description */}
        <section className="mb-16">
          <h2 className="font-mono text-xs tracking-[0.3em] text-[#8FD8E8] mb-6">OVERVIEW</h2>
          <p className="text-[#9BA6B2] text-lg leading-relaxed">
            {expedition.description}
          </p>
        </section>

        {/* Research Areas */}
        <section className="mb-16">
          <h2 className="font-mono text-xs tracking-[0.3em] text-[#8FD8E8] mb-6">RESEARCH AREAS</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {expedition.research_areas.map((area) => (
              <div key={area} className="border-t border-white/10 pt-4">
                <p className="font-display font-medium text-lg text-[#F4F5F2]">{area}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Institutions & Scientists */}
        <section className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="font-mono text-xs tracking-[0.3em] text-[#8FD8E8] mb-6">INSTITUTIONS</h2>
              <ul className="space-y-2">
                {expedition.institutions.map((inst) => (
                  <li key={inst} className="text-[#F4F5F2] border-b border-white/10 pb-2">
                    {inst}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="font-mono text-xs tracking-[0.3em] text-[#8FD8E8] mb-6">SCIENTISTS</h2>
              <ul className="space-y-2">
                {expedition.scientists.map((sci) => (
                  <li key={sci} className="text-[#F4F5F2] border-b border-white/10 pb-2">
                    {sci}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Reports */}
        {expDocuments.length > 0 && (
          <section className="mb-16">
            <h2 className="font-mono text-xs tracking-[0.3em] text-[#8FD8E8] mb-6">REPORTS & PUBLICATIONS</h2>
            <div className="space-y-4">
              {expDocuments.map((doc) => (
                <Link
                  key={doc.id}
                  to={`/knowledge/${doc.slug}`}
                  className="group flex items-center justify-between border border-white/10 p-5 hover:border-[#8FD8E8] transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <FileText size={20} className="text-[#9BA6B2] mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-display text-lg text-[#F4F5F2] group-hover:text-[#8FD8E8] transition-colors">
                        {doc.title}
                      </p>
                      <p className="font-mono text-xs text-[#9BA6B2] mt-1">
                        {doc.type} · {doc.year} · {doc.institution}
                      </p>
                    </div>
                  </div>
                  <ArrowRight size={18} className="text-[#9BA6B2] group-hover:text-[#8FD8E8] transition-colors" />
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Photographs */}
        {expMedia.length > 0 && (
          <section className="mb-16">
            <h2 className="font-mono text-xs tracking-[0.3em] text-[#8FD8E8] mb-6">PHOTOGRAPHS</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {expMedia.map((m) => (
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

        {/* AI Actions */}
        <section className="border-t border-white/10 pt-12">
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/ai"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-[#8FD8E8] text-[#8FD8E8] text-sm font-mono tracking-widest hover:bg-[#8FD8E8] hover:text-[#080B0F] transition-all"
            >
              <Sparkles size={16} /> ASK POLAR AI ABOUT THIS EXPEDITION
            </Link>
            <Link
              to="/studio"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-white/20 text-[#F4F5F2] text-sm font-mono tracking-widest hover:border-[#F4F5F2] transition-all"
            >
              GENERATE CONTENT
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
