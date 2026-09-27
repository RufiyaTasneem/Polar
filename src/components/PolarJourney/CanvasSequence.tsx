import { useEffect, useRef } from 'react';

interface CanvasSequenceProps {
  totalFrames?: number;
  frameUrls?: string[];
  scrollDistance?: string;
  className?: string;
  overlayChildren?: React.ReactNode;
}

export default function CanvasSequence({
  totalFrames = 60,
  frameUrls = [],
  scrollDistance = '+=400%',
  className = '',
  overlayChildren,
}: CanvasSequenceProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let ctx: { revert: () => void } | null = null;
    const canvas = canvasRef.current;
    if (!canvas || !containerRef.current) return;

    const renderCtx = canvas.getContext('2d');
    if (!renderCtx) return;

    // Image preloader pool if frameUrls provided
    const loadedImages: HTMLImageElement[] = [];
    if (frameUrls.length > 0) {
      frameUrls.forEach((url) => {
        const img = new Image();
        img.src = url;
        loadedImages.push(img);
      });
    }

    // Canvas resize handling with HiDPI support
    const handleResize = () => {
      if (!canvas || !containerRef.current) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = containerRef.current.clientWidth || window.innerWidth;
      const height = containerRef.current.clientHeight || window.innerHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      renderCtx.scale(dpr, dpr);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // Frame Drawing Function
    const drawFrame = (frameIndex: number) => {
      if (!canvas || !containerRef.current) return;
      const width = containerRef.current.clientWidth || window.innerWidth;
      const height = containerRef.current.clientHeight || window.innerHeight;

      renderCtx.clearRect(0, 0, width, height);

      // If preloaded image available for frameIndex
      if (loadedImages[frameIndex] && loadedImages[frameIndex].complete && loadedImages[frameIndex].naturalWidth > 0) {
        const img = loadedImages[frameIndex];
        const hRatio = width / img.width;
        const vRatio = height / img.height;
        const ratio = Math.max(hRatio, vRatio);
        const centerShiftX = (width - img.width * ratio) / 2;
        const centerShiftY = (height - img.height * ratio) / 2;

        renderCtx.drawImage(
          img,
          0,
          0,
          img.width,
          img.height,
          centerShiftX,
          centerShiftY,
          img.width * ratio,
          img.height * ratio
        );
      } else {
        // Procedural Test Frame Engine (Proof of concept test asset)
        const progress = frameIndex / (totalFrames - 1 || 1);
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) * (0.2 + progress * 0.15);

        // Background space glow
        const bgGradient = renderCtx.createRadialGradient(
          centerX,
          centerY,
          radius * 0.2,
          centerX,
          centerY,
          Math.max(width, height) * 0.8
        );
        bgGradient.addColorStop(0, '#11161C');
        bgGradient.addColorStop(1, '#080B0F');
        renderCtx.fillStyle = bgGradient;
        renderCtx.fillRect(0, 0, width, height);

        // Rotating Test Sphere
        renderCtx.save();
        renderCtx.translate(centerX, centerY);
        renderCtx.rotate(progress * Math.PI * 2);

        const sphereGrad = renderCtx.createRadialGradient(-radius * 0.3, -radius * 0.3, radius * 0.1, 0, 0, radius);
        sphereGrad.addColorStop(0, '#8FD8E8');
        sphereGrad.addColorStop(0.7, '#11161C');
        sphereGrad.addColorStop(1, '#080B0F');

        renderCtx.fillStyle = sphereGrad;
        renderCtx.beginPath();
        renderCtx.arc(0, 0, radius, 0, Math.PI * 2);
        renderCtx.fill();

        // Longitudinal grid lines
        renderCtx.strokeStyle = 'rgba(143, 216, 232, 0.25)';
        renderCtx.lineWidth = 1.5;
        for (let i = -3; i <= 3; i++) {
          renderCtx.beginPath();
          renderCtx.ellipse(0, 0, Math.abs(radius * (i / 3.5)), radius, 0, 0, Math.PI * 2);
          renderCtx.stroke();
        }

        renderCtx.restore();

        // Frame number test badge
        renderCtx.fillStyle = '#8FD8E8';
        renderCtx.font = '12px monospace';
        renderCtx.fillText(
          `CANVAS ENGINE FRAME: ${String(frameIndex + 1).padStart(3, '0')} / ${totalFrames} (${Math.round(progress * 100)}%)`,
          24,
          height - 24
        );
      }
    };

    // Draw initial frame
    drawFrame(0);

    // Initialize GSAP ScrollTrigger Sequence Engine
    (async () => {
      const gsapMod = await import('gsap');
      const stMod = await import('gsap/ScrollTrigger');
      const gsap = gsapMod.default;
      const ScrollTrigger = stMod.default;
      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {
        const frameObj = { currentFrame: 0 };

        gsap.to(frameObj, {
          currentFrame: totalFrames - 1,
          snap: 'currentFrame',
          ease: 'none',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top top',
            end: scrollDistance,
            scrub: 1,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              const current = Math.round(frameObj.currentFrame);
              drawFrame(current);
            },
          },
        });
      }, containerRef);
    })();

    return () => {
      window.removeEventListener('resize', handleResize);
      ctx?.revert();
    };
  }, [totalFrames, frameUrls, scrollDistance]);

  return (
    <div ref={containerRef} className={`relative w-full h-screen overflow-hidden ${className}`}>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />
      {overlayChildren && <div className="relative z-10 w-full h-full pointer-events-none">{overlayChildren}</div>}
    </div>
  );
}
