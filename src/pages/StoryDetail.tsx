import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Clock } from 'lucide-react';
import { useStory } from '@/lib/hooks';

export default function StoryDetail() {
  const { slug } = useParams();
  const { data: story, loading } = useStory(slug);

  if (loading) return <PageState label="LOADING STORY" />;
  if (!story) return <PageState label="STORY NOT FOUND" back />;

  return (
    <main className="min-h-screen bg-[#080B0F]/85 backdrop-blur-[2px] relative z-10 text-[#F4F5F2]">
      <section className="relative min-h-[70vh] flex items-end overflow-hidden">
        {story.hero_image && <img src={story.hero_image} alt="" className="absolute inset-0 h-full w-full object-cover" />}
        <div className="absolute inset-0 bg-gradient-to-t from-[#080B0F] via-[#080B0F]/60 to-transparent" />
        <div className="relative z-10 w-full max-w-6xl mx-auto px-6 md:px-12 pb-20 pt-40">
          <Link to="/stories" className="inline-flex items-center gap-2 text-xs font-mono tracking-widest text-[#9BA6B2] hover:text-[#8FD8E8] mb-10"><ArrowLeft size={14}/> ALL STORIES</Link>
          <p className="text-[#8FD8E8] text-xs font-mono tracking-[0.25em] mb-5">POLAR STORIES</p>
          <h1 className="font-display text-4xl md:text-7xl font-semibold leading-[0.95] max-w-4xl">{story.title}</h1>
          <div className="mt-7 flex flex-wrap items-center gap-5 text-sm text-[#9BA6B2]">
            {story.author && <span>{story.author}</span>}
            {story.reading_time && <span className="inline-flex items-center gap-2"><Clock size={14}/> {story.reading_time} min read</span>}
            {story.published_date && <span>{story.published_date}</span>}
          </div>
        </div>
      </section>

      <article className="max-w-3xl mx-auto px-6 md:px-0 py-20 md:py-28">
        {story.introduction && <p className="text-xl md:text-2xl leading-relaxed text-[#F4F5F2]/90 mb-16">{story.introduction}</p>}
        <div className="space-y-14">
          {(story.sections || []).map((section, index) => (
            <section key={`${section.heading}-${index}`}>
              <p className="font-mono text-xs tracking-widest text-[#8FD8E8] mb-4">0{index + 1}</p>
              <h2 className="font-display text-2xl md:text-3xl mb-5">{section.heading}</h2>
              <p className="text-[#9BA6B2] leading-8 whitespace-pre-line">{section.body}</p>
            </section>
          ))}
        </div>
        {story.tags?.length > 0 && <div className="mt-20 pt-8 border-t border-white/10 flex flex-wrap gap-2">{story.tags.map(tag => <span key={tag} className="text-xs font-mono text-[#9BA6B2]">#{tag}</span>)}</div>}
      </article>

      <div className="max-w-6xl mx-auto px-6 md:px-12 pb-24">
        <Link to="/stories" className="inline-flex items-center gap-3 text-sm text-[#F4F5F2] hover:text-[#8FD8E8]">More stories <ArrowRight size={16}/></Link>
      </div>
    </main>
  );
}

function PageState({ label, back = false }: { label: string; back?: boolean }) {
  return <main className="min-h-screen bg-[#080B0F]/85 backdrop-blur-[2px] relative z-10 flex flex-col items-center justify-center text-[#F4F5F2] gap-6"><p className="font-mono text-xs tracking-[0.3em] text-[#9BA6B2]">{label}</p>{back && <Link to="/stories" className="text-sm text-[#8FD8E8]">Return to stories</Link>}</main>;
}
