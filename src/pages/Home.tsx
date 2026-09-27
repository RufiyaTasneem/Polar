import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, ArrowUpRight } from 'lucide-react';
import PolarGlobe, { PolarGlobeHandle } from '@/components/PolarJourney/PolarGlobe';
import { POLAR_STATIONS } from '@/components/PolarJourney/polarStationData';
import { MOCK_EXPEDITIONS, MOCK_STORIES, MOCK_MEDIA } from '@/lib/mockData';

export default function Home() {
  const rootRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<PolarGlobeHandle>(null);
  const earthRef = useRef<HTMLDivElement>(null);
  const heroTextRef = useRef<HTMLDivElement>(null);
  const scrollHintRef = useRef<HTMLDivElement>(null);

  // Reusable Station Panel & Timeline Refs
  const panelRef = useRef<HTMLDivElement>(null);
  const panelTagRef = useRef<HTMLSpanElement>(null);
  const panelYearRef = useRef<HTMLSpanElement>(null);
  const panelTitleRef = useRef<HTMLHeadingElement>(null);
  const panelDescRef = useRef<HTMLParagraphElement>(null);
  const panelLinkRef = useRef<HTMLAnchorElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  // Active Station State for React overlays
  const [activeStationId, setActiveStationId] = useState<string | null>(null);
  const activeStation = POLAR_STATIONS.find((s) => s.id === activeStationId);

  useEffect(() => {
    let cancelled = false;
    let ctx: { revert: () => void } | null = null;

    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    const initGSAP = async () => {
      const gsapMod = await import('gsap');
      const stMod = await import('gsap/ScrollTrigger');

      // React StrictMode may have already cleaned up this effect
      // while the dynamic imports were loading.
      if (cancelled) return;

      const gsap = gsapMod.default;
      const ScrollTrigger = stMod.default;

      gsap.registerPlugin(ScrollTrigger);

      if (reducedMotion) {
        if (heroTextRef.current) {
          gsap.set(heroTextRef.current, { opacity: 1 });
        }

        if (earthRef.current) {
          gsap.set(earthRef.current, {
            opacity: 1,
            scale: 1,
          });
        }

        if (panelRef.current) {
          gsap.set(panelRef.current, { opacity: 1 });
        }

        if (timelineRef.current) {
          gsap.set(timelineRef.current, { opacity: 1 });
        }

        return;
      }

      ctx = gsap.context(() => {
        // ===== ACT 1: PLANET & HERO CINEMATIC JOURNEY =====
        const DEFAULT_AXIAL_TILT = (-23.4 * Math.PI) / 180;

        const globeState = {
          x: 0,
          y: 0,
          z: DEFAULT_AXIAL_TILT,
          dist: 4.2,
        };

        let currentActiveId: string | null = null;

        const updateActiveStation = (id: string | null) => {
          if (currentActiveId === id) return;

          currentActiveId = id;

          if (globeRef.current) {
            globeRef.current.setActiveStation(id);
          }

          setActiveStationId(id);

          if (id && panelRef.current) {
            const st = POLAR_STATIONS.find((s) => s.id === id);

            if (st) {
              if (panelTagRef.current) {
                panelTagRef.current.textContent =
                  `${st.region.toUpperCase()} • ${st.coordinatesLabel}`;
              }

              if (panelYearRef.current) {
                panelYearRef.current.textContent =
                  `EST. ${st.establishedYear}`;
              }

              if (panelTitleRef.current) {
                panelTitleRef.current.textContent = st.name;
              }

              if (panelDescRef.current) {
                panelDescRef.current.textContent = st.description;
              }

              if (panelLinkRef.current) {
                panelLinkRef.current.setAttribute('href', st.link);
              }
            }
          }
        };

        const updateGlobe = () => {
          if (globeRef.current) {
            const time = earthTl.time();
            // GSAP controls Earth orientation ONLY during active station journey (0.12 <= time < 0.84)
            const isStationJourneyActive = time >= 0.12 && time < 0.84;

            if (isStationJourneyActive) {
              globeRef.current.setAutoRotate(false);
              globeRef.current.setRotation(
                globeState.y,
                globeState.x,
                globeState.z
              );
              globeRef.current.setCameraDistance(globeState.dist);
            } else {
              globeRef.current.setAutoRotate(true);
            }
          }

          const time = earthTl.time();

          if (time < 0.12) {
            updateActiveStation(null);
          } else if (time < 0.32) {
            updateActiveStation('himadri');
          } else if (time < 0.58) {
            updateActiveStation('maitri');
          } else if (time < 0.84) {
            updateActiveStation('bharati');
          } else {
            updateActiveStation(null);
          }
        };

        const earthTl = gsap.timeline({
          scrollTrigger: {
            trigger: '#earth-section',
            start: 'top top',
            end: '+=200%',
            scrub: 1,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onLeave: () => {
              if (globeRef.current) {
                globeRef.current.setAutoRotate(true);
              }
            },
            onLeaveBack: () => {
              if (globeRef.current) {
                globeRef.current.setAutoRotate(true);
              }
            },
          },
        });

        // HERO FADE OUT
        earthTl
          .to(
            heroTextRef.current,
            {
              opacity: 0,
              y: -30,
              duration: 0.08,
              ease: 'power1.inOut',
            },
            0
          )
          .to(
            scrollHintRef.current,
            {
              opacity: 0,
              duration: 0.06,
              ease: 'power1.out',
            },
            0
          )

          // STATION 1 — HIMADRI
          .to(
            globeState,
            {
              x: 1.22,
              y: -1.78,
              duration: 0.16,
              onUpdate: updateGlobe,
              ease: 'power1.inOut',
            },
            0
          )
          .to(
            globeState,
            {
              dist: 3.2,
              duration: 0.06,
              onUpdate: updateGlobe,
              ease: 'power1.inOut',
            },
            0.14
          )
          .fromTo(
            [panelRef.current, timelineRef.current],
            { opacity: 0, y: 30 },
            {
              opacity: 1,
              y: 0,
              duration: 0.05,
              ease: 'power2.out',
            },
            0.16
          )
          .to(
            [panelRef.current, timelineRef.current],
            {
              opacity: 0,
              y: -20,
              duration: 0.05,
              ease: 'power1.in',
            },
            0.28
          )
          .to(
            globeState,
            {
              dist: 4.2,
              duration: 0.06,
              onUpdate: updateGlobe,
              ease: 'power1.inOut',
            },
            0.28
          )

          // STATION 2 — MAITRI
          .to(
            globeState,
            {
              x: -1.22,
              y: -1.78,
              duration: 0.12,
              onUpdate: updateGlobe,
              ease: 'power1.inOut',
            },
            0.32
          )
          .to(
            globeState,
            {
              dist: 3.2,
              duration: 0.06,
              onUpdate: updateGlobe,
              ease: 'power1.inOut',
            },
            0.40
          )
          .fromTo(
            [panelRef.current, timelineRef.current],
            { opacity: 0, y: 30 },
            {
              opacity: 1,
              y: 0,
              duration: 0.05,
              ease: 'power2.out',
            },
            0.42
          )
          .to(
            [panelRef.current, timelineRef.current],
            {
              opacity: 0,
              y: -20,
              duration: 0.05,
              ease: 'power1.in',
            },
            0.54
          )
          .to(
            globeState,
            {
              dist: 4.2,
              duration: 0.06,
              onUpdate: updateGlobe,
              ease: 'power1.inOut',
            },
            0.54
          )

          // STATION 3 — BHARATI
          .to(
            globeState,
            {
              x: -1.18,
              y: -2.90,
              duration: 0.12,
              onUpdate: updateGlobe,
              ease: 'power1.inOut',
            },
            0.58
          )
          .to(
            globeState,
            {
              dist: 3.2,
              duration: 0.06,
              onUpdate: updateGlobe,
              ease: 'power1.inOut',
            },
            0.66
          )
          .fromTo(
            [panelRef.current, timelineRef.current],
            { opacity: 0, y: 30 },
            {
              opacity: 1,
              y: 0,
              duration: 0.05,
              ease: 'power2.out',
            },
            0.68
          )
          .to(
            [panelRef.current, timelineRef.current],
            {
              opacity: 0,
              y: -20,
              duration: 0.05,
              ease: 'power1.in',
            },
            0.80
          )
          .to(
            globeState,
            {
              dist: 4.2,
              duration: 0.06,
              onUpdate: updateGlobe,
              ease: 'power1.inOut',
            },
            0.80
          );
      }, rootRef);
    };

    initGSAP();

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, []);

  return (
    <div ref={rootRef} className="bg-[#080B0F] text-[#F4F5F2] selection:bg-[#8FD8E8] selection:text-[#080B0F]">
      {/* Persistent 3D Globe Background */}
      <div
        ref={earthRef}
        className="fixed inset-0 z-0 pointer-events-none overflow-hidden"
        style={{ willChange: 'transform, opacity' }}
      >
        <PolarGlobe
          ref={globeRef}
          onReady={(handle) => {
            (globeRef as React.MutableRefObject<PolarGlobeHandle | null>).current = handle;
          }}
          autoRotate={true}
          rotationSpeed={0.0012}
          className="w-full h-full"
        />
        <div className="absolute inset-0 polar-vignette pointer-events-none opacity-75" />
      </div>

      {/* ===== 1-5: HERO & 3D EARTH SCROLL JOURNEY (HIMADRI, MAITRI, BHARATI) ===== */}
      <section id="earth-section" className="relative z-10" style={{ height: '100vh' }}>
        <div className="relative h-full w-full overflow-hidden flex items-center justify-center pointer-events-none">
          {/* ===== LEFT COLUMN: ORIGINAL STATION CARD (TOP-LEFT) + WHAT IS THIS STATION ACTUALLY FOR? (LOWER-LEFT) ===== */}
          <div
            ref={panelRef}
            className="absolute inset-0 pointer-events-none z-20 opacity-0 flex flex-col justify-between p-4 sm:p-6 md:px-12 md:py-10 lg:px-16 lg:py-12 overflow-y-auto sm:overflow-visible"
            style={{ willChange: 'opacity, transform' }}
          >
            {/* TOP-LEFT: Original Station Information Panel */}
            <div className="pt-14 sm:pt-16 md:pt-20 lg:pt-20 max-w-sm md:max-w-md pointer-events-auto">
              <div className="bg-[#0b1017]/90 backdrop-blur-md border border-[#1e293b]/70 p-5 sm:p-6 md:p-8 rounded-lg shadow-2xl">
                <div className="flex items-center justify-between mb-3">
                  <span ref={panelTagRef} className="font-mono text-xs tracking-[0.25em] text-[#8FD8E8] uppercase">
                    ARCTIC • 78°55'N
                  </span>
                  <span ref={panelYearRef} className="font-mono text-xs text-[#64748b]">
                    EST. 2008
                  </span>
                </div>

                <h3 ref={panelTitleRef} className="font-display font-bold text-3xl md:text-4xl text-[#F4F5F2] tracking-tight mb-3">
                  HIMADRI
                </h3>

                <p ref={panelDescRef} className="font-mono text-xs md:text-sm text-[#94a3b8] leading-relaxed mb-6">
                  India's pioneer Arctic research station at Ny-Ålesund, Svalbard studying atmospheric chemistry, aerosols, and space weather.
                </p>

                <Link
                  ref={panelLinkRef}
                  to="/explore/himadri"
                  className="inline-flex items-center gap-2 font-mono text-xs tracking-wider text-[#8FD8E8] hover:text-white transition-colors group"
                >
                  EXPLORE STATION
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>

            {/* LOWER-LEFT: WHAT IS THIS STATION ACTUALLY FOR? */}
            <div className="pb-2 md:pb-4 max-w-sm md:max-w-md pointer-events-auto mt-4 md:mt-0">
              {activeStation && (
                <div className="bg-[#0b1017]/85 backdrop-blur-md border border-white/10 p-4 sm:p-5 rounded-lg shadow-2xl">
                  <p className="font-mono text-[10px] tracking-[0.25em] text-[#8FD8E8] uppercase mb-1 font-semibold">
                    EDITORIAL BRIEFING
                  </p>
                  <h4 className="font-display font-bold text-sm md:text-base text-white tracking-tight leading-snug mb-2 uppercase">
                    WHAT IS THIS STATION<br />ACTUALLY FOR?
                  </h4>
                  <p className="font-mono text-xs text-[#94a3b8] leading-relaxed">
                    {activeStation.purpose}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ===== RIGHT COLUMN: VERTICAL STATION TIMELINE ===== */}
          <div
            ref={timelineRef}
            className="absolute top-20 bottom-8 right-4 sm:right-6 md:right-12 lg:right-16 z-20 pointer-events-auto opacity-0 hidden sm:flex flex-col justify-center max-w-[260px] sm:max-w-[280px] md:max-w-[300px]"
            style={{ willChange: 'opacity, transform' }}
          >
            {activeStation && (
              <div className="bg-[#0b1017]/85 backdrop-blur-md border border-white/10 p-5 md:p-6 rounded-lg shadow-2xl">
                <p className="font-mono text-[11px] tracking-[0.25em] text-[#8FD8E8] uppercase mb-4 border-b border-white/10 pb-2.5 font-semibold">
                  STATION TIMELINE
                </p>
                <div className="relative pl-4 space-y-4 before:absolute before:left-1.5 before:top-1 before:bottom-1 before:w-[1px] before:bg-white/15">
                  {activeStation.timeline.map((item, idx) => {
                    const isLatest = idx === activeStation.timeline.length - 1;
                    return (
                      <div key={idx} className="relative group">
                        {/* Timeline node */}
                        <span
                          className={`absolute -left-[17px] top-1 w-2.5 h-2.5 rounded-full border transition-all duration-300 ${
                            isLatest
                              ? 'bg-[#8FD8E8] border-[#8FD8E8] shadow-[0_0_10px_#8fd8e8]'
                              : 'bg-[#080B0F] border-[#64748b] group-hover:border-[#8FD8E8] group-hover:bg-[#8FD8E8]'
                          }`}
                        />
                        <span className={`font-mono text-xs font-bold block ${isLatest ? 'text-[#8FD8E8]' : 'text-[#94a3b8]'}`}>
                          {item.year}
                        </span>
                        <h5 className="font-display font-semibold text-xs text-white leading-snug mt-0.5">
                          {item.title}
                        </h5>
                        <p className="font-mono text-[11px] text-[#64748b] leading-tight mt-0.5">
                          {item.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Hero text */}
          <div
            ref={heroTextRef}
            className="relative z-10 text-center px-6 max-w-4xl pointer-events-auto py-8"
            style={{ willChange: 'opacity, transform' }}
          >
            {/* Soft dark radial backdrop glow behind text - zero box boundaries, preserves Earth visibility */}
            <div className="absolute inset-0 -m-8 bg-[radial-gradient(ellipse_at_center,rgba(8,11,15,0.85)_0%,rgba(8,11,15,0.45)_55%,transparent_80%)] pointer-events-none -z-10 rounded-full blur-xl" />

            <p className="font-mono text-xs tracking-[0.35em] text-[#8FD8E8] mb-6 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
              INDIA'S POLAR SCIENCE
            </p>
            <h1 className="font-display font-bold text-6xl sm:text-7xl md:text-8xl lg:text-9xl leading-[0.9] tracking-tight mb-8 text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)]">
              POLAR
            </h1>
            <p className="text-[#F4F5F2] text-lg md:text-2xl font-light max-w-2xl mx-auto leading-relaxed drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
              Explore the science, people and stories shaping our understanding of the polar regions.
            </p>
          </div>

          {/* Scroll hint */}
          <div
            ref={scrollHintRef}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 pointer-events-none"
            style={{ willChange: 'opacity' }}
          >
            <p className="font-mono text-xs tracking-[0.25em] text-[#8FD8E8] animate-pulse text-center drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
              SCROLL TO EXPLORE ↓
            </p>
          </div>
        </div>
      </section>

      {/* ===== 6: INTO THE EXTREME — EXPEDITIONS ===== */}
      <section id="expeditions-section" className="relative z-10 py-16 md:py-20 bg-[#080B0F]/85 backdrop-blur-[2px]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-10 pb-4 border-b border-white/10">
            <div>
              <p className="font-mono text-xs tracking-[0.3em] text-[#8FD8E8] mb-2">EXPEDITIONS & FIELD MISSIONS</p>
              <h2 className="font-display font-bold text-4xl md:text-6xl text-[#F4F5F2] tracking-tight">
                INTO THE EXTREME.
              </h2>
            </div>
            <p className="text-[#9BA6B2] text-xs md:text-sm max-w-md mt-3 md:mt-0 leading-relaxed font-mono">
              Decades of continuous scientific expeditions across the High Arctic, Antarctic continental ice, and Southern Ocean.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {MOCK_EXPEDITIONS.slice(0, 4).map((exp) => (
              <div
                key={exp.id}
                className="group relative bg-[#11161C]/60 border border-white/10 rounded-sm overflow-hidden flex flex-col justify-between hover:border-[#8FD8E8]/60 transition-all duration-300"
              >
                <div className="relative h-36 w-full overflow-hidden">
                  <img
                    src={exp.image_url}
                    alt={exp.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#11161C] via-[#11161C]/30 to-transparent" />
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="font-mono text-[10px] tracking-wider px-2 py-0.5 bg-[#080B0F]/80 border border-white/10 text-[#8FD8E8] uppercase">
                      {exp.expedition_number}
                    </span>
                    <span className="font-mono text-[10px] text-[#9BA6B2] px-2 py-0.5 bg-[#080B0F]/60">
                      {exp.year}
                    </span>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="font-mono text-[10px] tracking-widest text-[#8FD8E8] uppercase block mb-1">
                      {exp.region}
                    </span>
                    <h3 className="font-display font-bold text-base text-[#F4F5F2] group-hover:text-[#8FD8E8] transition-colors line-clamp-2 mb-2">
                      {exp.title}
                    </h3>
                    <p className="text-xs text-[#9BA6B2] line-clamp-3 leading-relaxed mb-4">
                      {exp.description}
                    </p>
                  </div>

                  <Link
                    to={`/expeditions/${exp.slug}`}
                    className="inline-flex items-center gap-1.5 font-mono text-xs text-[#8FD8E8] group-hover:text-white tracking-wider transition-colors pt-2 border-t border-white/5"
                  >
                    EXPLORE MISSION <ArrowRight size={12} className="transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 7: SCIENCE AT THE EDGE — KNOWLEDGE ===== */}
      <section id="science-section" className="relative z-10 py-16 md:py-20 bg-[#080B0F]/85 backdrop-blur-[2px]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Heading & Core Text */}
            <div className="lg:col-span-5">
              <p className="font-mono text-xs tracking-[0.3em] text-[#8FD8E8] mb-3">POLAR RESEARCH DOMAINS</p>
              <h2 className="font-display font-bold text-4xl md:text-6xl text-[#F4F5F2] tracking-tight leading-[1.05] mb-6">
                SCIENCE AT THE EDGE.
              </h2>
              <p className="text-[#9BA6B2] text-sm leading-relaxed mb-8 font-mono">
                India's scientific inquiries bridge atmospheric physics, deep glaciology, Southern Ocean biogeochemistry, and polar ecosystems.
              </p>
              <Link
                to="/knowledge"
                className="inline-flex items-center gap-2 px-6 py-3.5 border border-[#8FD8E8] text-[#8FD8E8] font-mono text-xs tracking-widest hover:bg-[#8FD8E8] hover:text-[#080B0F] transition-all"
              >
                EXPLORE SCIENCE REPOSITORY <ArrowRight size={14} />
              </Link>
            </div>

            {/* Right Column: Editorial Research Topic Layout */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  num: '01',
                  domain: 'ATMOSPHERIC PHYSICS',
                  title: 'Aerosols & Black Carbon',
                  station: 'Himadri • Ny-Ålesund',
                  desc: 'Monitoring long-range transport of black carbon aerosols and radiative heating across Arctic snow cover.',
                },
                {
                  num: '02',
                  domain: 'OCEANOGRAPHY',
                  title: 'Prydz Bay Circulation',
                  station: 'Bharati • Larsemann Hills',
                  desc: 'Hydrographic profiling of Modified Circumpolar Deep Water intrusion accelerating basal ice melt.',
                },
                {
                  num: '03',
                  domain: 'TECTONICS',
                  title: 'Gondwana Breakup',
                  station: 'Maitri & Bharati',
                  desc: 'Structural geological mapping demonstrating ancient continental continuity between East Antarctica and India.',
                },
                {
                  num: '04',
                  domain: 'MICROBIOLOGY',
                  title: 'Extremophile Genomics',
                  station: 'Maitri • Schirmacher Oasis',
                  desc: 'Sequencing sub-zero bacterial isolates from Priyadarshini Lake with novel cold-adapted enzyme mechanisms.',
                },
              ].map((item) => (
                <div
                  key={item.num}
                  className="p-5 border border-white/10 bg-[#11161C]/50 rounded-sm hover:border-[#8FD8E8]/50 transition-colors flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-[11px] text-[#8FD8E8] tracking-widest">{item.domain}</span>
                      <span className="font-mono text-[10px] text-[#64748b]">[{item.num}]</span>
                    </div>
                    <h3 className="font-display font-bold text-lg text-[#F4F5F2] mb-2">{item.title}</h3>
                    <p className="text-xs text-[#9BA6B2] leading-relaxed mb-4">{item.desc}</p>
                  </div>
                  <span className="font-mono text-[10px] text-[#8FD8E8]/70 tracking-wider pt-2 border-t border-white/5">
                    {item.station}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== 8: STORIES FROM THE POLES — STORIES + MEDIA ===== */}
      <section id="stories-section" className="relative z-10 py-16 md:py-20 bg-[#080B0F]/85 backdrop-blur-[2px]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-white/10">
            <div>
              <p className="font-mono text-xs tracking-[0.3em] text-[#8FD8E8] mb-2">EDITORIAL & JOURNALISM</p>
              <h2 className="font-display font-bold text-4xl md:text-6xl text-[#F4F5F2] tracking-tight">
                STORIES FROM THE POLES.
              </h2>
            </div>
            <div className="flex items-center gap-4 mt-3 md:mt-0 font-mono text-xs">
              <Link to="/stories" className="text-[#8FD8E8] hover:text-white transition-colors flex items-center gap-1">
                ALL STORIES <ArrowRight size={12} />
              </Link>
              <span className="text-white/20">•</span>
              <Link to="/media" className="text-[#8FD8E8] hover:text-white transition-colors flex items-center gap-1">
                MEDIA GALLERY <ArrowRight size={12} />
              </Link>
            </div>
          </div>

          {/* Asymmetric Magazine-like Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Main Featured Article (Left 7 Cols) */}
            <div className="lg:col-span-7 bg-[#11161C]/60 border border-white/10 rounded-sm overflow-hidden flex flex-col justify-between group hover:border-[#8FD8E8]/60 transition-all">
              <div className="relative h-52 sm:h-60 w-full overflow-hidden">
                <img
                  src={MOCK_STORIES[0].hero_image}
                  alt={MOCK_STORIES[0].title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#11161C] via-[#11161C]/20 to-transparent" />
                <span className="absolute top-4 left-4 font-mono text-[10px] tracking-widest px-2.5 py-1 bg-[#080B0F]/80 border border-white/10 text-[#8FD8E8] uppercase">
                  FEATURED ARTICLE • {MOCK_STORIES[0].reading_time} MIN READ
                </span>
              </div>
              <div className="p-6">
                <h3 className="font-display font-bold text-2xl md:text-3xl text-[#F4F5F2] group-hover:text-[#8FD8E8] transition-colors mb-3 leading-tight">
                  {MOCK_STORIES[0].title}
                </h3>
                <p className="text-xs md:text-sm text-[#9BA6B2] leading-relaxed line-clamp-2 mb-6">
                  {MOCK_STORIES[0].introduction}
                </p>
                <div className="flex items-center justify-between border-t border-white/10 pt-4 font-mono text-xs">
                  <span className="text-[#64748b]">{MOCK_STORIES[0].author} • {MOCK_STORIES[0].published_date}</span>
                  <Link
                    to={`/stories/${MOCK_STORIES[0].slug}`}
                    className="inline-flex items-center gap-1.5 text-[#8FD8E8] group-hover:text-white transition-colors"
                  >
                    READ STORY <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Secondary Story & Media Spotlight (Right 5 Cols) */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              {/* Secondary Story Card */}
              <div className="bg-[#11161C]/60 border border-white/10 p-6 rounded-sm group hover:border-[#8FD8E8]/60 transition-all flex-1 flex flex-col justify-between">
                <div>
                  <span className="font-mono text-[10px] tracking-widest text-[#8FD8E8] uppercase block mb-2">
                    HISTORICAL ARCHIVE • {MOCK_STORIES[1].reading_time} MIN READ
                  </span>
                  <h4 className="font-display font-bold text-xl text-[#F4F5F2] group-hover:text-[#8FD8E8] transition-colors mb-2">
                    {MOCK_STORIES[1].title}
                  </h4>
                  <p className="text-xs text-[#9BA6B2] line-clamp-2 leading-relaxed mb-4">
                    {MOCK_STORIES[1].introduction}
                  </p>
                </div>
                <Link
                  to={`/stories/${MOCK_STORIES[1].slug}`}
                  className="inline-flex items-center gap-1.5 font-mono text-xs text-[#8FD8E8] group-hover:text-white transition-colors pt-3 border-t border-white/5"
                >
                  READ ARTICLE <ArrowRight size={12} className="transition-transform group-hover:translate-x-1" />
                </Link>
              </div>

              {/* Media Spotlight Card */}
              <div className="bg-[#11161C]/60 border border-white/10 p-5 rounded-sm flex items-center gap-4 group hover:border-[#8FD8E8]/60 transition-all">
                <div className="w-24 h-20 overflow-hidden rounded-xs shrink-0 relative">
                  <img
                    src={MOCK_MEDIA[2].image_url}
                    alt={MOCK_MEDIA[2].title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-mono text-[10px] text-[#8FD8E8] tracking-widest block uppercase mb-1">
                    MEDIA SPOTLIGHT
                  </span>
                  <h5 className="font-display font-bold text-sm text-[#F4F5F2] truncate group-hover:text-[#8FD8E8] transition-colors">
                    {MOCK_MEDIA[2].title}
                  </h5>
                  <p className="text-[11px] text-[#9BA6B2] font-mono truncate mt-0.5">
                    {MOCK_MEDIA[2].photographer}
                  </p>
                  <Link to="/media" className="inline-flex items-center gap-1 font-mono text-[11px] text-[#8FD8E8] mt-2">
                    VIEW GALLERY <ArrowUpRight size={12} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 9: ASK THE POLES — POLAR AI ===== */}
      <section id="ai-section" className="relative z-10 py-16 md:py-20 bg-[#080B0F]/85 backdrop-blur-[2px]">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <p className="font-mono text-xs tracking-[0.3em] text-[#8FD8E8] mb-3">POLAR AI INTELLIGENCE LAYER</p>
            <h2 className="font-display font-bold text-4xl md:text-6xl text-[#F4F5F2] tracking-tight mb-4">
              ASK THE POLES.
            </h2>
            <p className="text-[#9BA6B2] text-xs md:text-sm font-mono leading-relaxed">
              Trained on decades of Indian polar research papers, expedition reports, and climate observations, POLAR AI synthesizes scientific knowledge instantly.
            </p>
          </div>

          <div className="border border-white/10 bg-[#11161C]/80 p-6 md:p-8 rounded-sm shadow-2xl relative mb-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-[#8FD8E8]" />
                <span className="font-mono text-xs text-[#F4F5F2] font-semibold tracking-wider">POLAR AI RESEARCH ASSISTANT</span>
              </div>
              <span className="font-mono text-[10px] text-[#8FD8E8] px-2 py-0.5 border border-[#8FD8E8]/40 bg-[#8FD8E8]/10 uppercase">
                ACTIVE RETRIEVAL
              </span>
            </div>

            {/* Sample Prompt Chips */}
            <div className="mb-6">
              <p className="font-mono text-[11px] text-[#64748b] uppercase tracking-wider mb-2">SAMPLE RESEARCH QUERIES:</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {[
                  "What research happens at Himadri station in the Arctic?",
                  "How does black carbon impact High Arctic glacier melt rates?",
                  "What oceanographic profiles were captured near Bharati station?",
                ].map((query, idx) => (
                  <Link
                    key={idx}
                    to="/ai"
                    className="p-3 border border-white/10 bg-[#080B0F]/60 rounded-xs text-xs font-mono text-[#9BA6B2] hover:border-[#8FD8E8] hover:text-[#8FD8E8] transition-all flex items-start justify-between group"
                  >
                    <span className="line-clamp-2">"{query}"</span>
                    <ArrowRight size={12} className="shrink-0 ml-2 mt-0.5 text-[#8FD8E8] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                ))}
              </div>
            </div>

            {/* AI Response Preview */}
            <div className="bg-[#080B0F]/80 border border-white/5 p-4 rounded-xs">
              <div className="flex items-center justify-between font-mono text-[11px] text-[#8FD8E8] mb-2">
                <span>SYNTHESIZED RESPONSE PREVIEW</span>
                <span>DOC #15-ARC • DOI 10.1007/s12040</span>
              </div>
              <p className="text-xs text-[#9BA6B2] leading-relaxed font-mono">
                "Himadri research station in Ny-Ålesund (78°55'N) conducts long-term monitoring of atmospheric aerosol optical depth, sea-ice mass balance, and marine microbial diversity, linking High Arctic climate feedback to planetary monsoon systems."
              </p>
            </div>
          </div>

          <div className="text-center">
            <Link
              to="/ai"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#8FD8E8] text-[#080B0F] font-mono text-xs font-bold tracking-widest hover:bg-white transition-all shadow-lg"
            >
              OPEN POLAR AI INTERFACE <Sparkles size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* ===== 10: THE POLAR RECORD CONTINUES — FINAL CTA ===== */}
      <section id="final-section" className="relative z-10 pt-16 md:pt-20 pb-8 md:pb-10 bg-[#080B0F]/80 backdrop-blur-[2px]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="font-mono text-xs tracking-[0.35em] text-[#8FD8E8] mb-6">POLAR SCIENCE FOR ALL</p>
          <h2 className="font-display font-bold text-4xl md:text-7xl lg:text-8xl text-[#F4F5F2] tracking-tight mb-6 leading-[0.95]">
            THE POLAR RECORD CONTINUES.
          </h2>
          <p className="text-[#9BA6B2] text-sm md:text-base font-mono max-w-xl mx-auto leading-relaxed mb-10">
            Explore decades of Indian scientific research, expeditions, and observations across the Arctic, Antarctica, and Southern Ocean.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/knowledge"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-[#8FD8E8] text-[#8FD8E8] text-xs font-mono tracking-widest hover:bg-[#8FD8E8] hover:text-[#080B0F] transition-all"
            >
              EXPLORE KNOWLEDGE <ArrowRight size={14} />
            </Link>
            <Link
              to="/ai"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-white/20 text-[#F4F5F2] text-xs font-mono tracking-widest hover:border-[#F4F5F2] hover:bg-white/5 transition-all"
            >
              OPEN POLAR AI <Sparkles size={14} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

