import { useParams, Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Download, Sparkles, FileText, Edit3 } from 'lucide-react';
import { useDocument } from '@/lib/hooks';

export default function DocumentDetail() {
  const { slug } = useParams();
  const { data: doc, loading } = useDocument(slug);
  const [searchParams] = useSearchParams();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080B0F]/85 backdrop-blur-[2px] relative z-10 pt-20 flex items-center justify-center">
        <p className="font-mono text-sm text-[#9BA6B2]">Loading document...</p>
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="min-h-screen bg-[#080B0F]/85 backdrop-blur-[2px] relative z-10 pt-20 flex items-center justify-center">
        <p className="text-[#9BA6B2]">Document not found.</p>
      </div>
    );
  }

  const handleDownload = () => {
    const content = `${doc.title}\n\n${doc.abstract || doc.description}\n\nAuthors: ${(doc.authors || []).join(', ')}\nInstitution: ${doc.institution}\nSource: ${doc.source}\nYear: ${doc.year}\nDOI: ${doc.doi || 'N/A'}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${doc.slug}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#080B0F]/85 backdrop-blur-[2px] relative z-10 pt-20">
      <div className="px-6 md:px-12 py-16 md:py-24 max-w-4xl">
        <Link
          to="/knowledge"
          className="inline-flex items-center gap-2 text-[#9BA6B2] text-sm font-mono tracking-widest hover:text-[#8FD8E8] transition-colors mb-8"
        >
          <ArrowLeft size={16} /> BACK TO REPOSITORY
        </Link>

        <div className="flex items-start gap-4 mb-8">
          <FileText size={32} className="text-[#8FD8E8] flex-shrink-0 mt-1" />
          <div>
            <p className="font-mono text-xs tracking-[0.3em] text-[#8FD8E8] mb-3">
              {doc.type.toUpperCase()} · {doc.region.toUpperCase()} · {doc.year}
            </p>
            <h1 className="font-display font-bold text-3xl md:text-5xl text-[#F4F5F2] tracking-tight">
              {doc.title}
            </h1>
          </div>
        </div>

        {/* Metadata */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 border-t border-white/10 border-b border-white/10 py-6 mb-12">
          {doc.authors && doc.authors.length > 0 && (
            <div className="col-span-2">
              <p className="font-mono text-xs text-[#9BA6B2] mb-2">AUTHORS</p>
              <p className="text-sm text-[#F4F5F2]">{doc.authors.join(', ')}</p>
            </div>
          )}
          {doc.institution && (
            <div>
              <p className="font-mono text-xs text-[#9BA6B2] mb-2">INSTITUTION</p>
              <p className="text-sm text-[#F4F5F2]">{doc.institution}</p>
            </div>
          )}
          {doc.source && (
            <div>
              <p className="font-mono text-xs text-[#9BA6B2] mb-2">SOURCE</p>
              <p className="text-sm text-[#F4F5F2]">{doc.source}</p>
            </div>
          )}
          {doc.doi && (
            <div>
              <p className="font-mono text-xs text-[#9BA6B2] mb-2">DOI</p>
              <p className="text-sm text-[#8FD8E8] font-mono">{doc.doi}</p>
            </div>
          )}
          {doc.pages && (
            <div>
              <p className="font-mono text-xs text-[#9BA6B2] mb-2">PAGES</p>
              <p className="text-sm text-[#F4F5F2]">{doc.pages}</p>
            </div>
          )}
          <div>
            <p className="font-mono text-xs text-[#9BA6B2] mb-2">REGION</p>
            <p className="text-sm text-[#F4F5F2]">{doc.region}</p>
          </div>
        </div>

        {/* Abstract */}
        {doc.abstract && (
          <section className="mb-12">
            <h2 className="font-mono text-xs tracking-[0.3em] text-[#8FD8E8] mb-4">ABSTRACT</h2>
            <p className="text-[#F4F5F2] text-lg leading-relaxed">
              {doc.abstract}
            </p>
          </section>
        )}

        {/* Description */}
        <section className="mb-12">
          <h2 className="font-mono text-xs tracking-[0.3em] text-[#8FD8E8] mb-4">SUMMARY</h2>
          <p className="text-[#9BA6B2] text-lg leading-relaxed">
            {doc.description}
          </p>
        </section>

        {/* Research Areas */}
        {doc.research_areas && doc.research_areas.length > 0 && (
          <section className="mb-12">
            <h2 className="font-mono text-xs tracking-[0.3em] text-[#8FD8E8] mb-4">RESEARCH AREAS</h2>
            <div className="flex flex-wrap gap-3">
              {doc.research_areas.map((area) => (
                <span key={area} className="font-mono text-sm text-[#F4F5F2] border border-white/10 px-4 py-2">
                  {area}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Tags */}
        {doc.tags && doc.tags.length > 0 && (
          <section className="mb-12">
            <h2 className="font-mono text-xs tracking-[0.3em] text-[#8FD8E8] mb-4">TAGS</h2>
            <div className="flex flex-wrap gap-2">
              {doc.tags.map((tag) => (
                <span key={tag} className="font-mono text-xs text-[#9BA6B2] border border-white/10 px-3 py-1">
                  {tag}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Document Preview (simulated) */}
        <section className="mb-12">
          <h2 className="font-mono text-xs tracking-[0.3em] text-[#8FD8E8] mb-4">DOCUMENT PREVIEW</h2>
          <div className="border border-white/10 bg-[#11161C]/50 p-8 md:p-12">
            <div className="max-w-md mx-auto space-y-3">
              {[8, 12, 10, 14, 8, 12, 10, 6, 14, 8, 12, 10].map((w, i) => (
                <div
                  key={i}
                  className="h-2 bg-white/5"
                  style={{ width: `${w * 8}%` }}
                />
              ))}
              <div className="h-8" />
              {[10, 14, 8, 12, 10, 14, 8, 12].map((w, i) => (
                <div
                  key={i}
                  className="h-2 bg-white/5"
                  style={{ width: `${w * 8}%` }}
                />
              ))}
            </div>
            <p className="text-center font-mono text-xs text-[#9BA6B2]/50 mt-6">
              Preview · {doc.pages || '—'} pages
            </p>
          </div>
        </section>

        {/* Actions */}
        <section className="flex flex-col sm:flex-row gap-4 border-t border-white/10 pt-8">
          <button
            onClick={handleDownload}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-[#8FD8E8] text-[#8FD8E8] text-sm font-mono tracking-widest hover:bg-[#8FD8E8] hover:text-[#080B0F] transition-all"
          >
            <Download size={16} /> DOWNLOAD DOCUMENT
          </button>
          <Link
            to={`/ai?doc=${doc.slug}`}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-white/20 text-[#F4F5F2] text-sm font-mono tracking-widest hover:border-[#F4F5F2] transition-all"
          >
            <Sparkles size={16} /> ASK POLAR AI
          </Link>
          <Link
            to={`/studio?doc=${doc.slug}`}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-white/20 text-[#F4F5F2] text-sm font-mono tracking-widest hover:border-[#F4F5F2] transition-all"
          >
            <Edit3 size={16} /> GENERATE CONTENT
          </Link>
        </section>
      </div>
    </div>
  );
}
