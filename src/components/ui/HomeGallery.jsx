import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

const IMAGES = [
  '/gallery/0fbfb67a-f430-4ba8-8ea7-1bedd03b2863.JPG',
  '/gallery/542eabe7-d485-44dd-b8d7-c776d34e668d.JPG',
  '/gallery/ce573f84-3440-4bf9-9ccf-6b4b5b65fab9.JPG',
  '/gallery/aae49131-ab81-4616-bc06-909fd01906c3.JPG',
  '/gallery/e512539f-c2fa-4eae-afec-79aeb14722b9.JPG',
  '/gallery/2f8dd209-b073-4f4e-95e5-55b1124af5bb.JPG',
  '/gallery/42f98bc7-2f3d-4ac4-96ae-46d4047cac08.JPG',
  '/gallery/1e4b96da-aed3-4c8b-8307-ff21f964233b.JPG',
  '/gallery/2a18cc0b-5e45-4ca0-9ef9-013fdf3cb252.JPG',
  '/gallery/645193a4-cdee-460b-8a72-5cda0384eee0.JPG',
  '/gallery/c1cf9b12-53f2-465a-b947-b251b0e5fe92.JPG',
];

const SCROLL_IMAGES = IMAGES.slice(0, 5); // First 5 images for the cinematic scroll

const CinematicScrollSection = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  return (
    <div ref={containerRef} className="relative bg-black" style={{ height: `${SCROLL_IMAGES.length * 100}vh` }}>
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
        {SCROLL_IMAGES.map((src, index) => {
          // Each image takes up an equal segment of the scroll progress
          const segmentSize = 1 / SCROLL_IMAGES.length;
          const startFadeIn = (index - 1) * segmentSize;
          const fullOpacity = index * segmentSize;
          const startFadeOut = (index + 0.8) * segmentSize;
          const endFadeOut = (index + 1) * segmentSize;

          const opacity = useTransform(
            scrollYProgress,
            [startFadeIn, fullOpacity, startFadeOut, endFadeOut],
            [0, 1, 1, 0]
          );

          const scale = useTransform(
            scrollYProgress,
            [startFadeIn, endFadeOut],
            [1.1, 0.95] // Subtle scale down
          );

          // Ken Burns slow zoom (CSS animation layered with motion values)
          return (
            <motion.div
              key={src}
              className="absolute inset-0 w-full h-full will-change-transform"
              style={{ opacity, scale }}
            >
              <div 
                className="w-full h-full bg-cover bg-center origin-center"
                style={{ 
                  backgroundImage: `url('${src}')`,
                }}
              >
                <div className="absolute inset-0 bg-black/20" />
              </div>
            </motion.div>
          );
        })}
        
        {/* Overlay Text for Context (fades out as user scrolls deep) */}
        <motion.div 
          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10"
          style={{
            opacity: useTransform(scrollYProgress, [0, 0.15], [1, 0])
          }}
        >
          <h2 className="text-4xl md:text-6xl font-light text-white tracking-widest text-center">
            EXPERIENCE
          </h2>
          <div className="w-16 h-px bg-white/60 mx-auto my-6" />
          <p className="text-white/80 text-lg tracking-wide uppercase">The Essence of Coorg</p>
        </motion.div>
      </div>
    </div>
  );
};

const Lightbox = ({ images, currentIndex, onClose, onNext, onPrev }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onNext();
      if (e.key === 'ArrowLeft') onPrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onNext, onPrev]);

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md"
      >
        <button onClick={onClose} className="absolute top-6 right-6 text-white/70 hover:text-white z-50 transition-colors">
          <X className="w-8 h-8" />
        </button>
        
        <button onClick={onPrev} className="absolute left-4 md:left-12 text-white/50 hover:text-white z-50 transition-colors p-4">
          <ChevronLeft className="w-10 h-10" />
        </button>
        
        <div className="w-full h-full flex items-center justify-center p-4 md:p-16" onClick={onClose}>
          <motion.img 
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            src={images[currentIndex]} 
            alt="Gallery Fullscreen" 
            className="max-w-full max-h-full object-contain rounded-md shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>

        <button onClick={onNext} className="absolute right-4 md:right-12 text-white/50 hover:text-white z-50 transition-colors p-4">
          <ChevronRight className="w-10 h-10" />
        </button>
        
        <div className="absolute bottom-8 left-0 right-0 text-center text-white/50 text-sm tracking-widest font-light">
          {currentIndex + 1} / {images.length}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

const MasonryGallery = () => {
  const [lightboxIndex, setLightboxIndex] = useState(null);

  // Simple column splitting for masonry
  const columns = [[], [], []];
  IMAGES.forEach((src, i) => {
    columns[i % 3].push(src);
  });

  return (
    <section className="py-32 px-4 md:px-8 max-w-7xl mx-auto bg-white">
      <div className="text-center mb-24 space-y-6">
        <h2 className="text-4xl md:text-5xl font-light text-gray-800 tracking-wide">
          Curated Spaces
        </h2>
        <div className="w-16 h-px bg-amber-600 mx-auto" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        {columns.map((col, colIdx) => (
          <div key={colIdx} className="flex flex-col gap-6 md:gap-8">
            {col.map((src) => {
              const globalIndex = IMAGES.indexOf(src);
              return (
                <motion.div
                  key={src}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="relative overflow-hidden rounded-[20px] cursor-pointer group shadow-sm hover:shadow-2xl transition-shadow duration-500 bg-gray-100"
                  onClick={() => setLightboxIndex(globalIndex)}
                >
                  <div className="aspect-[4/5] md:aspect-auto">
                    <img 
                      src={src} 
                      alt="Casa Raihan Spaces" 
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out"
                    />
                  </div>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
                </motion.div>
              );
            })}
          </div>
        ))}
      </div>

      {lightboxIndex !== null && (
        <Lightbox 
          images={IMAGES}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNext={() => setLightboxIndex((lightboxIndex + 1) % IMAGES.length)}
          onPrev={() => setLightboxIndex((lightboxIndex - 1 + IMAGES.length) % IMAGES.length)}
        />
      )}
    </section>
  );
};

export default function HomeGallery() {
  return (
    <div className="w-full bg-white">
      <CinematicScrollSection />
      <MasonryGallery />
    </div>
  );
}
