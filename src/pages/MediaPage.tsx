import { useState, useMemo } from 'react';
import { X, ArrowLeft } from 'lucide-react';
import { useMedia } from '@/lib/hooks';
import type { Media } from '@/lib/types';

const CATEGORIES = ['Expeditions', 'Stations', 'Field Research', 'Scientists', 'Landscapes', 'Wildlife'];
const TABS = ['Photographs', 'Videos'];

export default function MediaPage() {
  const { data: media, loading } = useMedia();
  const [activeTab, setActiveTab] = useState('Photographs');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<Media | null>(null);

  const filtered = useMemo(() => {
    return media.filter((m) => {
      if (activeTab === 'Videos' && m.type !== 'video') return false;
      if (activeTab === 'Photographs' && m.type !== 'photograph') return false;
      if (activeCategory && m.category !== activeCategory) return false;
      return true;
    });
  }, [media, activeTab, activeCategory]);

  return (
    <div className="min-h-screen bg-[#080B0F]/85 backdrop-blur-[2px] relative z-10 pt-20">
      <div className="px-6 md:px-12 py-16 md:py-24">
        <p className="font-mono text-xs tracking-[0.3em] text-[#8FD8E8] mb-6">MEDIA</p>
        <h1 className="font-display font-bold text-5xl md:text-7xl lg:text-8xl text-[#F4F5F2] tracking-tight mb-6">
          THE POLAR
          <br />
          ARCHIVE
        </h1>
        <p className="text-[#9BA6B2] text-lg max-w-xl">
          Photographs and videos from India's polar expeditions, stations, and field research.
        </p>
      </div>

      {/* Tabs */}
      <div className="px-6 md:px-12 border-t border-b border-white/10 py-4 mb-8">
        <div className="flex items-center gap-8">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`font-mono text-sm tracking-widest transition-colors ${
                activeTab === tab ? 'text-[#8FD8E8] border-b border-[#8FD8E8] pb-1' : 'text-[#9BA6B2] hover:text-[#F4F5F2]'
              }`}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div className="px-6 md:px-12 pb-8">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveCategory(null)}
            className={`font-mono text-xs tracking-widest px-3 py-1 transition-colors ${
              !activeCategory ? 'text-[#8FD8E8]' : 'text-[#9BA6B2] hover:text-[#F4F5F2]'
            }`}
          >
            ALL
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`font-mono text-xs tracking-widest px-3 py-1 transition-colors ${
                activeCategory === cat ? 'text-[#8FD8E8]' : 'text-[#9BA6B2] hover:text-[#F4F5F2]'
              }`}
            >
              {cat.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Gallery */}
      <div className="px-6 md:px-12 pb-24">
        {loading ? (
          <p className="font-mono text-sm text-[#9BA6B2]">Loading media...</p>
        ) : filtered.length === 0 ? (
          <p className="font-mono text-sm text-[#9BA6B2]">No media found in this category.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {filtered.map((item, idx) => (
              <button
                key={item.id}
                onClick={() => setLightbox(item)}
                className="group relative overflow-hidden aspect-[4/3]"
              >
                <img
                  src={item.image_url}
                  alt={item.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading={idx < 6 ? 'eager' : 'lazy'}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#080B0F]/90 via-transparent to-transparent opacity-60 group-hover:opacity-90 transition-opacity" />
                <div className="absolute bottom-0 left-0 right-0 p-4 text-left">
                  <p className="font-mono text-xs text-[#8FD8E8] mb-1 tracking-widest">
                    {item.category.toUpperCase()} · {item.year}
                  </p>
                  <p className="font-display text-lg text-[#F4F5F2]">{item.title}</p>
                  <p className="font-mono text-xs text-[#9BA6B2] mt-1">{item.region}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[100] bg-[#080B0F]/95 backdrop-blur-md flex items-center justify-center p-4 md:p-12"
          onClick={() => setLightbox(null)}
        >
          <button
            onClick={() => setLightbox(null)}
            className="absolute top-6 right-6 text-[#9BA6B2] hover:text-[#F4F5F2] z-10"
            aria-label="Close"
          >
            <X size={28} />
          </button>

          <div
            className="max-w-5xl w-full max-h-full flex flex-col md:flex-row gap-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex-1 min-h-0">
              <img
                src={lightbox.image_url}
                alt={lightbox.title}
                className="w-full h-full object-contain max-h-[70vh]"
              />
            </div>
            <div className="md:w-72 flex-shrink-0 space-y-4">
              <button
                onClick={() => setLightbox(null)}
                className="flex items-center gap-2 text-[#9BA6B2] text-sm font-mono tracking-widest hover:text-[#8FD8E8] transition-colors"
              >
                <ArrowLeft size={16} /> CLOSE
              </button>
              <div>
                <p className="font-mono text-xs text-[#8FD8E8] mb-2 tracking-widest">
                  {lightbox.category.toUpperCase()} · {lightbox.year}
                </p>
                <h2 className="font-display text-2xl text-[#F4F5F2] mb-3">{lightbox.title}</h2>
                <p className="text-sm text-[#9BA6B2] leading-relaxed">{lightbox.description}</p>
              </div>
              <div className="border-t border-white/10 pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="font-mono text-xs text-[#9BA6B2]">Region</span>
                  <span className="font-mono text-xs text-[#F4F5F2]">{lightbox.region}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-mono text-xs text-[#9BA6B2]">Photographer</span>
                  <span className="font-mono text-xs text-[#F4F5F2]">{lightbox.photographer}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-mono text-xs text-[#9BA6B2]">Type</span>
                  <span className="font-mono text-xs text-[#F4F5F2]">{lightbox.type}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
