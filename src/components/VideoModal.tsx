import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, Play, Volume2, VolumeX, Pause, ChevronLeft, ChevronRight } from 'lucide-react';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const demoSlides = [
  {
    image: '/demo-1.jpg',
    caption: 'Choose from 50+ document templates',
    duration: 3000,
  },
  {
    image: '/demo-2.jpg',
    caption: 'Enter your prompt or description',
    duration: 3000,
  },
  {
    image: '/demo-3.jpg',
    caption: 'AI generates your document in seconds',
    duration: 4000,
  },
  {
    image: '/demo-4.jpg',
    caption: 'Review and edit your document',
    duration: 4000,
  },
  {
    image: '/demo-5.jpg',
    caption: 'Export in multiple formats',
    duration: 3000,
  },
];

export function VideoModal({ isOpen, onClose }: VideoModalProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [progress, setProgress] = useState(0);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsPlaying(false);
      setCurrentSlide(0);
      setProgress(0);
    }
  }, [isOpen]);

  // Auto-advance slides when playing
  useEffect(() => {
    if (!isPlaying) return;

    const slideDuration = demoSlides[currentSlide].duration;
    const progressInterval = 50;
    const progressStep = (progressInterval / slideDuration) * 100;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          if (currentSlide < demoSlides.length - 1) {
            setCurrentSlide((s) => s + 1);
            return 0;
          } else {
            setIsPlaying(false);
            return 100;
          }
        }
        return prev + progressStep;
      });
    }, progressInterval);

    return () => clearInterval(interval);
  }, [isPlaying, currentSlide]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handlePlay = () => {
    setIsPlaying(true);
    if (currentSlide === demoSlides.length - 1 && progress >= 100) {
      setCurrentSlide(0);
      setProgress(0);
    }
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleNext = () => {
    if (currentSlide < demoSlides.length - 1) {
      setCurrentSlide((s) => s + 1);
      setProgress(0);
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide((s) => s - 1);
      setProgress(0);
    }
  };

  const handleSlideClick = (index: number) => {
    setCurrentSlide(index);
    setProgress(0);
    setIsPlaying(false);
  };

  const overallProgress = ((currentSlide * 100 + progress) / (demoSlides.length * 100)) * 100;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 lg:p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-5xl max-h-[95vh] bg-card rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-3 sm:p-4 lg:p-5 border-b bg-card shrink-0">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center">
                    <Play className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm sm:text-base lg:text-lg">Universal Doc Demo</h3>
                    <p className="text-xs text-muted-foreground hidden sm:block">See how AI creates documents in seconds</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 sm:p-2 rounded-lg hover:bg-muted transition-colors"
                  aria-label="Close modal"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>

              {/* Demo Slideshow */}
              <div className="relative flex-1 bg-muted overflow-hidden min-h-[200px] sm:min-h-[300px] lg:min-h-[400px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 flex flex-col"
                  >
                    {/* Demo Image */}
                    <div className="flex-1 relative flex items-center justify-center p-2 sm:p-4">
                      <img
                        src={demoSlides[currentSlide].image}
                        alt={`Demo step ${currentSlide + 1}`}
                        className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                      />
                      
                      {/* Caption overlay */}
                      <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-auto">
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                          className="bg-card/95 backdrop-blur-sm px-3 py-2 sm:px-4 sm:py-2 rounded-lg border shadow-lg"
                        >
                          <p className="text-xs sm:text-sm font-medium text-foreground">
                            Step {currentSlide + 1}: {demoSlides[currentSlide].caption}
                          </p>
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Navigation arrows */}
                <button
                  onClick={handlePrev}
                  disabled={currentSlide === 0}
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-card/90 backdrop-blur flex items-center justify-center shadow-lg hover:bg-card transition-colors disabled:opacity-30 disabled:cursor-not-allowed z-10"
                  aria-label="Previous slide"
                >
                  <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <button
                  onClick={handleNext}
                  disabled={currentSlide === demoSlides.length - 1}
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-card/90 backdrop-blur flex items-center justify-center shadow-lg hover:bg-card transition-colors disabled:opacity-30 disabled:cursor-not-allowed z-10"
                  aria-label="Next slide"
                >
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>

              {/* Controls */}
              <div className="p-3 sm:p-4 lg:p-5 border-t bg-card shrink-0 space-y-3 sm:space-y-4">
                {/* Progress bar */}
                <div className="space-y-1.5 sm:space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Progress</span>
                    <span>{Math.round(overallProgress)}%</span>
                  </div>
                  <div className="h-1.5 sm:h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-primary to-orange-400"
                      style={{ width: `${overallProgress}%` }}
                      transition={{ duration: 0.1 }}
                    />
                  </div>
                </div>

                {/* Slide thumbnails */}
                <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-hide">
                  {demoSlides.map((slide, index) => (
                    <button
                      key={index}
                      onClick={() => handleSlideClick(index)}
                      className={`relative flex-shrink-0 w-14 h-10 sm:w-20 sm:h-14 rounded-lg overflow-hidden border-2 transition-all ${
                        index === currentSlide
                          ? 'border-primary ring-2 ring-primary/20'
                          : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    >
                      <img
                        src={slide.image}
                        alt={`Slide ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-[10px] sm:text-xs font-bold text-white drop-shadow-lg">
                          {index + 1}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Control buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <button
                      onClick={isPlaying ? handlePause : handlePlay}
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary flex items-center justify-center hover:bg-primary/90 transition-colors"
                      aria-label={isPlaying ? 'Pause' : 'Play'}
                    >
                      {isPlaying ? (
                        <Pause className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="white" />
                      ) : (
                        <Play className="w-4 h-4 sm:w-5 sm:h-5 text-white ml-0.5" fill="white" />
                      )}
                    </button>
                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className="p-2 rounded-lg hover:bg-muted transition-colors"
                      aria-label={isMuted ? 'Unmute' : 'Mute'}
                    >
                      {isMuted ? <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" /> : <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />}
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm text-muted-foreground">
                      {currentSlide + 1} / {demoSlides.length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-3 sm:px-4 lg:px-5 py-2 sm:py-3 border-t bg-muted/30 shrink-0">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3">
                  <p className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
                    Watch how Universal Doc transforms your ideas into professional documents
                  </p>
                  <Button size="sm" onClick={onClose} className="w-full sm:w-auto">
                    Try It Now
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
