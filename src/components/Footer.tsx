import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-[#080B0F]/85 backdrop-blur-[2px] relative z-10 border-t border-white/5 px-6 md:px-12 py-16">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-2">
            <div className="font-display font-bold text-2xl tracking-[0.2em] text-[#F4F5F2] mb-4">
              POLAR
            </div>
            <p className="text-[#9BA6B2] text-sm leading-relaxed max-w-md">
              India's integrated polar science platform — exploring the extremes,
              understanding our planet. An initiative for polar science outreach,
              knowledge dissemination, and research accessibility.
            </p>
            <p className="text-[#9BA6B2]/60 text-xs font-mono mt-4 tracking-wider">
              NATIONAL CENTRE FOR POLAR AND OCEAN RESEARCH
            </p>
          </div>

          <div>
            <h4 className="text-[#9BA6B2] text-xs font-mono tracking-widest mb-4">
              EXPLORE
            </h4>
            <ul className="space-y-2">
              <li><Link to="/explore" className="text-[#F4F5F2]/70 text-sm hover:text-[#8FD8E8] transition-colors">Stations</Link></li>
              <li><Link to="/expeditions" className="text-[#F4F5F2]/70 text-sm hover:text-[#8FD8E8] transition-colors">Expeditions</Link></li>
              <li><Link to="/knowledge" className="text-[#F4F5F2]/70 text-sm hover:text-[#8FD8E8] transition-colors">Knowledge Repository</Link></li>
              <li><Link to="/media" className="text-[#F4F5F2]/70 text-sm hover:text-[#8FD8E8] transition-colors">Media Archive</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[#9BA6B2] text-xs font-mono tracking-widest mb-4">
              ENGAGE
            </h4>
            <ul className="space-y-2">
              <li><Link to="/ai" className="text-[#F4F5F2]/70 text-sm hover:text-[#8FD8E8] transition-colors">Polar AI</Link></li>
              <li><Link to="/studio" className="text-[#F4F5F2]/70 text-sm hover:text-[#8FD8E8] transition-colors">Content Studio</Link></li>
              <li><Link to="/stories" className="text-[#F4F5F2]/70 text-sm hover:text-[#8FD8E8] transition-colors">Polar Stories</Link></li>
              <li><Link to="/admin/login" className="text-[#F4F5F2]/70 text-sm hover:text-[#8FD8E8] transition-colors">Admin</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[#9BA6B2]/50 text-xs font-mono tracking-wider">
            SIH PROTOTYPE · POLAR SCIENCE PLATFORM · 2026
          </p>
          <p className="text-[#9BA6B2]/50 text-xs font-mono tracking-wider">
            78°55'N · 70°45'S · 69°24'S
          </p>
        </div>
      </div>
    </footer>
  );
}
