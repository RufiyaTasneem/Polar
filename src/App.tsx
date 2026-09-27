import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';
import GlobalPolarBackground from '@/components/PolarJourney/GlobalPolarBackground';

const Home = lazy(() => import('@/pages/Home'));
const Explore = lazy(() => import('@/pages/Explore'));
const StationDetail = lazy(() => import('@/pages/StationDetail'));
const Expeditions = lazy(() => import('@/pages/Expeditions'));
const ExpeditionDetail = lazy(() => import('@/pages/ExpeditionDetail'));
const Knowledge = lazy(() => import('@/pages/Knowledge'));
const DocumentDetail = lazy(() => import('@/pages/DocumentDetail'));
const MediaPage = lazy(() => import('@/pages/MediaPage'));
const Stories = lazy(() => import('@/pages/Stories'));
const StoryDetail = lazy(() => import('@/pages/StoryDetail'));
const PolarAI = lazy(() => import('@/pages/PolarAI'));
const ContentStudio = lazy(() => import('@/pages/ContentStudio'));
const AdminLogin = lazy(() => import('@/pages/AdminLogin'));
const AdminDashboard = lazy(() => import('@/pages/AdminDashboard'));
const ScientificDataExplorer = lazy(() => import('@/pages/ScientificDataExplorer'));
const DatasetDetail = lazy(() => import('@/pages/DatasetDetail'));

function PageLoader() {
  return (
    <div className="min-h-screen bg-[#080B0F] flex items-center justify-center">
      <div className="text-[#9BA6B2] font-mono text-sm tracking-widest animate-pulse">
        LOADING
      </div>
    </div>
  );
}

function GlobalBackgroundController() {
  const location = useLocation();
  if (location.pathname === '/') {
    return null;
  }
  return <GlobalPolarBackground />;
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <GlobalBackgroundController />
      <Navigation />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/explore/:slug" element={<StationDetail />} />
          <Route path="/expeditions" element={<Expeditions />} />
          <Route path="/expeditions/:slug" element={<ExpeditionDetail />} />
          <Route path="/knowledge" element={<Knowledge />} />
          <Route path="/knowledge/data" element={<ScientificDataExplorer />} />
          <Route path="/knowledge/data/:id" element={<DatasetDetail />} />
          <Route path="/data" element={<ScientificDataExplorer />} />
          <Route path="/data/:id" element={<DatasetDetail />} />
          <Route path="/knowledge/:slug" element={<DocumentDetail />} />
          <Route path="/media" element={<MediaPage />} />
          <Route path="/stories" element={<Stories />} />
          <Route path="/stories/:slug" element={<StoryDetail />} />
          <Route path="/ai" element={<PolarAI />} />
          <Route path="/studio" element={<ContentStudio />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </Suspense>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
