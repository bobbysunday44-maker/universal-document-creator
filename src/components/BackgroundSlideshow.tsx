import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BackgroundSlideshowProps {
  images: string[];
  interval?: number;
  overlayOpacity?: number;
  className?: string;
}

export function BackgroundSlideshow({
  images,
  interval = 6000,
  overlayOpacity = 0.75,
  className = '',
}: BackgroundSlideshowProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const [allLoaded, setAllLoaded] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  // Auto-advance slides
  useEffect(() => {
    const timer = setInterval(nextSlide, interval);
    return () => clearInterval(timer);
  }, [interval, nextSlide]);

  // Preload all images
  useEffect(() => {
    let loadedCount = 0;
    
    images.forEach((src, index) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        loadedCount++;
        setLoadedImages((prev) => new Set([...prev, index]));
        if (loadedCount === images.length) {
          setAllLoaded(true);
        }
      };
      img.onerror = () => {
        // If image fails to load, still count it to prevent hanging
        loadedCount++;
        if (loadedCount === images.length) {
          setAllLoaded(true);
        }
      };
    });
  }, [images]);

  // Show first slide immediately when loaded
  const canShowSlide = loadedImages.has(currentIndex);

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      {/* All images pre-rendered but hidden, for caching */}
      <div className="hidden">
        {images.map((src, i) => (
          <img key={i} src={src} alt="" />
        ))}
      </div>

      {/* Active Slide */}
      <AnimatePresence mode="sync">
        {canShowSlide && (
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              opacity: { duration: 1.5, ease: [0.4, 0, 0.2, 1] },
            }}
            className="absolute inset-0"
          >
            <motion.img
              src={images[currentIndex]}
              alt={`Background ${currentIndex + 1}`}
              className="w-full h-full object-cover"
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 8, ease: 'easeOut' }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fallback background while loading */}
      {!allLoaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100" />
      )}

      {/* Gradient Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(
            180deg,
            hsl(40 33% 97% / ${overlayOpacity}) 0%,
            hsl(40 33% 97% / ${overlayOpacity * 0.85}) 40%,
            hsl(40 33% 97% / ${overlayOpacity * 0.75}) 60%,
            hsl(40 33% 97% / ${overlayOpacity}) 100%
          )`,
        }}
      />

      {/* Warm tint overlay */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 30% 20%, hsl(17 65% 55% / 0.05) 0%, transparent 50%)',
        }}
      />

      {/* Slide indicators */}
      <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2 z-10">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? 'w-6 sm:w-8 bg-primary'
                : 'w-1.5 sm:w-2 bg-primary/30 hover:bg-primary/50'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
