import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Menu, X } from 'lucide-react';

const NAV_ITEMS = [
  { label: 'HOME', path: '/' },
  { label: 'EXPLORE', path: '/explore' },
  { label: 'EXPEDITIONS', path: '/expeditions' },
  { label: 'KNOWLEDGE', path: '/knowledge' },
  { label: 'MEDIA', path: '/media' },
  { label: 'POLAR AI', path: '/ai' },
];

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/knowledge?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setSearchOpen(false);
    }
  };

  const isHome = location.pathname === '/';

  const handleHomeClick = () => {
    if (isHome) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled || !isHome
            ? 'bg-[#080B0F]/90 backdrop-blur-md border-b border-white/5'
            : 'bg-transparent'
        }`}
      >
        <nav className="flex items-center justify-between px-6 md:px-12 h-16 md:h-20">
          <Link
            to="/"
            onClick={handleHomeClick}
            className="font-display font-bold text-lg md:text-xl tracking-[0.2em] text-[#F4F5F2] hover:text-[#8FD8E8] transition-colors"
          >
            POLAR
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {NAV_ITEMS.map((item) => {
              const isActive =
                item.path === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={item.path === '/' ? handleHomeClick : undefined}
                  className={`text-xs font-medium tracking-[0.15em] transition-colors ${
                    isActive
                      ? 'text-[#8FD8E8]'
                      : 'text-[#9BA6B2] hover:text-[#F4F5F2]'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="text-[#9BA6B2] hover:text-[#F4F5F2] transition-colors"
              aria-label="Search"
            >
              <Search size={18} />
            </button>
          </div>

          <button
            className="md:hidden text-[#F4F5F2]"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </nav>

        {searchOpen && (
          <div className="absolute top-full left-0 right-0 bg-[#080B0F]/95 backdrop-blur-md border-b border-white/5 px-6 md:px-12 py-4">
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto flex gap-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search reports, datasets, publications..."
                autoFocus
                className="flex-1 bg-transparent border-b border-white/20 text-[#F4F5F2] placeholder-[#9BA6B2] py-2 px-1 text-sm focus:outline-none focus:border-[#8FD8E8]"
              />
              <button
                type="submit"
                className="text-[#8FD8E8] text-xs font-medium tracking-widest hover:text-[#F4F5F2]"
              >
                SEARCH
              </button>
            </form>
          </div>
        )}

        {mobileOpen && (
          <div className="md:hidden bg-[#080B0F]/95 backdrop-blur-md border-b border-white/5">
            <div className="flex flex-col py-4">
              {NAV_ITEMS.map((item) => {
                const isActive =
                  item.path === '/'
                    ? location.pathname === '/'
                    : location.pathname.startsWith(item.path);

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={item.path === '/' ? handleHomeClick : undefined}
                    className={`px-6 py-3 text-sm font-medium tracking-[0.15em] transition-colors ${
                      isActive
                        ? 'text-[#8FD8E8]'
                        : 'text-[#9BA6B2] hover:text-[#8FD8E8]'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
              <button
                onClick={() => {
                  setMobileOpen(false);
                  setSearchOpen(true);
                }}
                className="px-6 py-3 text-sm font-medium tracking-[0.15em] text-[#9BA6B2] hover:text-[#8FD8E8] transition-colors text-left flex items-center gap-2"
              >
                <Search size={16} /> SEARCH
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
