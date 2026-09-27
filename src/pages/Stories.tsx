import { Link } from 'react-router-dom';
import { ArrowRight, Clock } from 'lucide-react';
import { useStories } from '@/lib/hooks';

export default function Stories() {
  const { data: stories, loading } = useStories();

  return (
    <div className="min-h-screen bg-[#080B0F]/85 backdrop-blur-[2px] relative z-10 pt-20">
      <div className="px-6 md:px-12 py-16 md:py-24">
        <p className="font-mono text-xs tracking-[0.3em] text-[#8FD8E8] mb-6">STORIES</p>
        <h1 className="font-display font-bold text-5xl md:text-7xl lg:text-8xl text-[#F4F5F2] tracking-tight mb-6">
          POLAR
          <br />
          STORIES
        </h1>
        <p className="text-[#9BA6B2] text-lg max-w-xl">
          Science should travel. These stories transform complex polar research into
          narratives everyone can understand.
        </p>
      </div>

      {loading ? (
        <div className="px-6 md:px-12 pb-24">
          <p className="font-mono text-sm text-[#9BA6B2]">Loading stories...</p>
        </div>
      ) : (
        <div className="space-y-0">
          {stories.map((story, idx) => (
            <Link
              key={story.id}
              to={`/stories/${story.slug}`}
              className="group block relative"
            >
              {idx % 2 === 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 min-h-[60vh]">
                  <div className="relative overflow-hidden">
                    <img
                      src={story.hero_image}
                      alt={story.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  <div className="flex items-center p-8 md:p-16 bg-[#11161C]/30">
                    <div>
                      <p className="font-mono text-xs text-[#8FD8E8] mb-4 tracking-widest">
                        STORY · {story.reading_time} MIN READ
                      </p>
                      <h2 className="font-display font-bold text-3xl md:text-4xl text-[#F4F5F2] group-hover:text-[#8FD8E8] transition-colors mb-4 leading-tight">
                        {story.title}
                      </h2>
                      <p className="text-[#9BA6B2] text-base md:text-lg leading-relaxed mb-6 line-clamp-3">
                        {story.introduction}
                      </p>
                      <span className="inline-flex items-center gap-2 text-[#8FD8E8] text-sm font-mono tracking-widest group-hover:gap-4 transition-all">
                        READ STORY <ArrowRight size={16} />
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 min-h-[60vh]">
                  <div className="flex items-center p-8 md:p-16 bg-[#11161C]/30 md:order-1">
                    <div>
                      <p className="font-mono text-xs text-[#8FD8E8] mb-4 tracking-widest">
                        STORY · {story.reading_time} MIN READ
                      </p>
                      <h2 className="font-display font-bold text-3xl md:text-4xl text-[#F4F5F2] group-hover:text-[#8FD8E8] transition-colors mb-4 leading-tight">
                        {story.title}
                      </h2>
                      <p className="text-[#9BA6B2] text-base md:text-lg leading-relaxed mb-6 line-clamp-3">
                        {story.introduction}
                      </p>
                      <span className="inline-flex items-center gap-2 text-[#8FD8E8] text-sm font-mono tracking-widest group-hover:gap-4 transition-all">
                        READ STORY <ArrowRight size={16} />
                      </span>
                    </div>
                  </div>
                  <div className="relative overflow-hidden md:order-2">
                    <img
                      src={story.hero_image}
                      alt={story.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
