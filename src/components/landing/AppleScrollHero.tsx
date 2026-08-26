import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, ChevronDown, HelpCircle, Pause, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fadeUp, stagger } from '@/components/landing/motion';

const TOTAL_FRAMES = 5;
const FRAME_SEQUENCE = Array.from({ length: TOTAL_FRAMES }, (_, i) => {
  const n = String(i + 1).padStart(3, '0');
  return `/fotos-efecto/frame_${n}.jpg`;
});

const VIDEO_SRC = '/fotos-efecto/Coastal_village_on_rocky_cliffs_202608151450.mp4';

/** Altura del runway de scroll en viewports tras el vídeo (>1 = efecto más lento) */
const SCROLL_HEIGHT_VH = 180;

const AppleScrollHero = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const frameRef = useRef(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [videoEnded, setVideoEnded] = useState(false);
  const [videoPaused, setVideoPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const userPausedRef = useRef(false);
  const reduceMotion = useReducedMotion();

  const drawFrame = useCallback((index: number) => {
    const canvas = canvasRef.current;
    const img = imagesRef.current[index];
    if (!canvas || !img?.complete || !img.naturalWidth) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const parent = canvas.parentElement;
    const w = parent?.clientWidth || window.innerWidth;
    const h = parent?.clientHeight || window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const scaleBoost = w < 768 ? 1.08 : 1.02;
    const canvasAspect = w / h;
    const imgAspect = img.naturalWidth / img.naturalHeight;

    let drawWidth: number;
    let drawHeight: number;
    if (imgAspect > canvasAspect) {
      drawHeight = h * scaleBoost;
      drawWidth = drawHeight * imgAspect;
    } else {
      drawWidth = w * scaleBoost;
      drawHeight = drawWidth / imgAspect;
    }

    const offsetX = (w - drawWidth) / 2;
    const offsetY = (h - drawHeight) / 2;

    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    frameRef.current = index;
  }, []);

  // Precarga frames mientras suena el vídeo
  useEffect(() => {
    let loaded = 0;

    FRAME_SEQUENCE.forEach((src, index) => {
      const img = new Image();
      img.src = src;
      img.decoding = 'async';
      img.onload = () => {
        imagesRef.current[index] = img;
        loaded += 1;
        if (loaded === TOTAL_FRAMES) {
          setIsLoaded(true);
          drawFrame(0);
        }
      };
      img.onerror = () => {
        loaded += 1;
        if (loaded === TOTAL_FRAMES) {
          setIsLoaded(true);
          if (imagesRef.current[0]) drawFrame(0);
        }
      };
    });
  }, [drawFrame]);

  // Al terminar el vídeo, dibujar frame 0 listo para el scroll
  useEffect(() => {
    if (videoEnded && isLoaded) {
      drawFrame(0);
    }
  }, [videoEnded, isLoaded, drawFrame]);

  // Scroll → frames solo cuando el vídeo ha terminado
  useEffect(() => {
    if (!isLoaded || !videoEnded) return;

    if (reduceMotion) {
      drawFrame(0);
      setProgress(0);
      return;
    }

    const onScroll = () => {
      const section = sectionRef.current;
      if (!section) return;

      const rect = section.getBoundingClientRect();
      const total = section.offsetHeight - window.innerHeight;
      const scrolled = Math.min(Math.max(-rect.top, 0), total);
      const p = total > 0 ? scrolled / total : 0;
      setProgress(p);

      const frameIndex = Math.min(
        TOTAL_FRAMES - 1,
        Math.max(0, Math.round(p * (TOTAL_FRAMES - 1)))
      );
      if (frameIndex !== frameRef.current) {
        requestAnimationFrame(() => drawFrame(frameIndex));
      }
    };

    const onResize = () => {
      drawFrame(frameRef.current);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, [isLoaded, videoEnded, reduceMotion, drawFrame]);

  const finishVideo = useCallback(() => {
    setVideoEnded(true);
  }, []);

  const toggleVideoPlayback = useCallback(() => {
    const video = videoRef.current;
    if (!video || videoEnded) return;
    if (video.paused) {
      userPausedRef.current = false;
      video.play().catch(finishVideo);
      setVideoPaused(false);
    } else {
      userPausedRef.current = true;
      video.pause();
      setVideoPaused(true);
    }
  }, [videoEnded, finishVideo]);

  useEffect(() => {
    const section = sectionRef.current;
    const video = videoRef.current;
    if (!section || !video || reduceMotion || videoEnded) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          video.pause();
          return;
        }
        if (!userPausedRef.current) {
          video.play().catch(finishVideo);
        }
      },
      { threshold: 0.35 }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, [reduceMotion, videoEnded, finishVideo]);

  const textOpacity =
    !videoEnded || reduceMotion ? 1 : Math.max(0, 1 - progress * 1.35);
  const textY = !videoEnded || reduceMotion ? 0 : progress * 48;

  const sectionHeight =
    reduceMotion || !videoEnded ? '100svh' : `${SCROLL_HEIGHT_VH}vh`;

  return (
    <section
      ref={sectionRef}
      className="relative z-30"
      style={{ height: sectionHeight }}
      aria-label="Vídeo y secuencia visual Quincenalia"
    >
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden bg-[#0a1628]">
        {/* Capas de frames (debajo del vídeo) */}
        {!isLoaded && videoEnded && (
          <img
            src={FRAME_SEQUENCE[0]}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            style={{ filter: 'brightness(0.92)' }}
          />
        )}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 z-[1] block h-full w-full"
          style={{
            filter: 'brightness(0.92)',
            opacity: videoEnded && isLoaded ? 1 : 0,
            transition: 'opacity 0.5s ease-out',
          }}
        />

        {/* Vídeo primero */}
        {!reduceMotion && (
          <video
            ref={videoRef}
            className="absolute inset-0 z-[2] h-full w-full object-cover"
            style={{
              filter: 'brightness(0.92)',
              opacity: videoEnded ? 0 : 1,
              transition: 'opacity 0.5s ease-out',
              pointerEvents: videoEnded ? 'none' : 'auto',
            }}
            muted
            playsInline
            preload="auto"
            poster={FRAME_SEQUENCE[0]}
            onLoadedData={() => {
              videoRef.current?.play().catch(() => {
                finishVideo();
              });
            }}
            onEnded={finishVideo}
            onError={finishVideo}
          >
            <source src={VIDEO_SRC} type="video/mp4" />
          </video>
        )}

        {/* Si reduce motion: saltar al primer frame estático */}
        {reduceMotion && (
          <img
            src={FRAME_SEQUENCE[0]}
            alt=""
            className="absolute inset-0 z-[2] h-full w-full object-cover"
            style={{ filter: 'brightness(0.92)' }}
            onLoad={() => setVideoEnded(true)}
          />
        )}

        <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/70 via-black/30 to-black/25 pointer-events-none" />

        <motion.div
          className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none"
          style={{
            opacity: textOpacity,
            transform: `translateY(${textY}px)`,
          }}
        >
          <div className="pointer-events-auto text-center text-white max-w-4xl mx-auto px-5 pt-16 sm:pt-8 w-full">
            <motion.div
              initial={reduceMotion ? false : 'hidden'}
              animate={reduceMotion ? undefined : 'show'}
              variants={stagger}
            >
              <motion.h1
                variants={fadeUp}
                className="landing-display text-[1.85rem] leading-tight xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold mb-3 sm:mb-6"
                style={{ textShadow: '0 2px 16px rgba(0,0,0,0.55)' }}
              >
                Ha llegado otra manera de{' '}
                <span className="relative inline-block">
                  <span className="text-white font-semibold">veranear</span>
                  <svg
                    viewBox="0 0 180 12"
                    width="180"
                    height="12"
                    className="absolute left-1/2 -translate-x-1/2 top-full mt-0.5 w-[120px] sm:w-[180px]"
                    aria-hidden="true"
                  >
                    <linearGradient id="linea-grad-apple" x1="0" y1="0" x2="180" y2="0" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#CDB6FC" />
                      <stop offset="0.5" stopColor="#CDB6FC" />
                      <stop offset="1" stopColor="#CDB6FC" />
                    </linearGradient>
                    <path
                      d="M 0 6 Q 45 0, 90 6 T 180 6"
                      fill="none"
                      stroke="url(#linea-grad-apple)"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
                <span className="text-primary">.</span>
              </motion.h1>
              <motion.p
                variants={fadeUp}
                className="text-[0.95rem] sm:text-xl md:text-2xl mb-6 sm:mb-10 font-light max-w-2xl mx-auto leading-relaxed"
                style={{ textShadow: '0 1px 5px rgba(0,0,0,0.4)' }}
              >
                Accede a propiedades exclusivas por una fracción del coste. Disfruta, rentabiliza e intercambia.
              </motion.p>
              <motion.div
                variants={fadeUp}
                className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center w-full max-w-sm sm:max-w-none mx-auto mb-2"
              >
                <Button
                  size="lg"
                  className="min-h-11 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-7 py-3 text-sm sm:text-base font-semibold shadow-lg w-full sm:w-auto"
                  asChild
                >
                  <Link to="/properties">
                    Explorar propiedades
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="min-h-11 rounded-full px-7 py-3 text-sm sm:text-base font-semibold shadow-lg border-white/80 bg-white/15 text-white hover:bg-white/25 hover:text-white backdrop-blur-md w-full sm:w-auto"
                  onClick={() => {
                    document.getElementById('reinventada')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  <HelpCircle className="w-5 h-5 mr-2 inline-block" aria-hidden="true" />
                  Cómo funciona
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>

        {!reduceMotion && !videoEnded && (
          <button
            type="button"
            onClick={toggleVideoPlayback}
            aria-label={videoPaused ? 'Reproducir vídeo' : 'Pausar vídeo'}
            className="absolute bottom-6 right-5 z-30 flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-white/15 text-white backdrop-blur-md cursor-pointer transition-colors duration-200 hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            {videoPaused ? <Play className="h-5 w-5" aria-hidden="true" /> : <Pause className="h-5 w-5" aria-hidden="true" />}
          </button>
        )}

        <a
          href="#zonas-destacadas"
          className="absolute bottom-6 left-1/2 z-30 hidden -translate-x-1/2 sm:flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white backdrop-blur-md cursor-pointer transition-colors duration-200 hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <ChevronDown className="h-5 w-5" aria-hidden="true" />
          <span className="sr-only">Ir a la propuesta de valor</span>
        </a>
      </div>
    </section>
  );
};

export default AppleScrollHero;
