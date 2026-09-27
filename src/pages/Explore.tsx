import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useStations } from '@/lib/hooks';

export default function Explore() {
  const { data: stations, loading } = useStations();

  return (
    <div className="min-h-screen bg-[#080B0F]/85 backdrop-blur-[2px] relative z-10 pt-20">
      <div className="px-6 md:px-12 py-16 md:py-24">
        <p className="font-mono text-xs tracking-[0.3em] text-[#8FD8E8] mb-6">
          EXPLORE
        </p>
        <h1 className="font-display font-bold text-5xl md:text-7xl lg:text-8xl text-[#F4F5F2] tracking-tight mb-6">
          THREE POLAR
          <br />
          FRONTIERS
        </h1>
        <p className="text-[#9BA6B2] text-lg max-w-xl">
          India's research stations span both ends of the Earth — from the Arctic
          at 79°N to Antarctica at 70°S.
        </p>
      </div>

      {loading ? (
        <div className="px-6 md:px-12 pb-24">
          <p className="font-mono text-sm text-[#9BA6B2]">Loading stations...</p>
        </div>
      ) : (
        <div className="space-y-0">
          {stations.map((station, idx) => (
            <Link
              key={station.id}
              to={`/explore/${station.slug}`}
              className="group block relative h-[70vh] md:h-[80vh] overflow-hidden"
            >
              <img
                src={station.hero_image_url}
                alt={station.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading={idx < 2 ? 'eager' : 'lazy'}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#080B0F] via-[#080B0F]/40 to-transparent" />

              <div className="relative z-10 h-full flex flex-col justify-end p-6 md:p-12">
                <div className="max-w-2xl">
                  <p className="font-mono text-xs tracking-[0.3em] text-[#8FD8E8] mb-3">
                    {station.region.toUpperCase()} RESEARCH STATION
                  </p>
                  <h2 className="font-display font-bold text-5xl md:text-7xl text-[#F4F5F2] tracking-tight mb-4">
                    {station.name.toUpperCase()}
                  </h2>
                  <p className="font-mono text-sm text-[#9BA6B2] mb-4">
                    {station.coordinates} · {station.location}
                  </p>
                  <p className="text-[#9BA6B2] text-base md:text-lg max-w-md mb-6">
                    {station.description}
                  </p>
                  <span className="inline-flex items-center gap-2 text-[#8FD8E8] text-sm font-mono tracking-widest group-hover:gap-4 transition-all">
                    EXPLORE {station.name.toUpperCase()} <ArrowRight size={16} />
                  </span>
                </div>
              </div>

              <div className="absolute top-6 right-6 md:top-12 md:right-12 z-10">
                <p className="font-mono text-xs text-[#9BA6B2]/60 tracking-widest">
                  EST. {station.established_year}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
