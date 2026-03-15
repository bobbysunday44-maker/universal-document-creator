import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Play, Sparkles, Zap, Shield } from 'lucide-react';
import { VideoModal } from '@/components/VideoModal';
import { BackgroundSlideshow } from '@/components/BackgroundSlideshow';

interface HeroSectionProps {
  onGetStarted: () => void;
}

const heroImages = [
  '/slide-1.jpg',
  '/slide-2.jpg',
  '/slide-3.jpg',
  '/slide-4.jpg',
  '/slide-5.jpg',
];

export function HeroSection({ onGetStarted }: HeroSectionProps) {
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring' as const, damping: 20, stiffness: 100 },
    },
  };

  const floatingIcons = [
    { icon: Sparkles, delay: 0, x: '5%', y: '15%' },
    { icon: Zap, delay: 0.5, x: '90%', y: '25%' },
    { icon: Shield, delay: 1, x: '85%', y: '65%' },
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Slideshow */}
      <BackgroundSlideshow 
        images={heroImages} 
        interval={6000}
        overlayOpacity={0.75}
      />

      {/* Floating Icons - Hidden on small mobile */}
      {floatingIcons.map((item, index) => (
        <motion.div
          key={index}
          className="absolute hidden md:block z-10"
          style={{ left: item.x, top: item.y }}
          animate={{
            y: [0, -15, 0],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 4,
            delay: item.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-2xl bg-primary/10 backdrop-blur-sm flex items-center justify-center border border-primary/20">
            <item.icon className="w-5 h-5 lg:w-6 lg:h-6 text-primary" />
          </div>
        </motion.div>
      ))}

      {/* Content */}
      <motion.div
        className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-16 sm:pt-20 pb-20"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Badge */}
        <motion.div variants={itemVariants} className="mb-4 sm:mb-6">
          <span className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs sm:text-sm font-medium backdrop-blur-sm">
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
            AI-Powered Document Creation
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={itemVariants}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight mb-4 sm:mb-6 text-foreground"
        >
          <span className="block">Create{' '}
            <span className="bg-gradient-to-r from-primary via-orange-400 to-amber-500 bg-clip-text text-transparent">
              Perfect Documents
            </span>
          </span>
          <span className="block mt-1 sm:mt-2">in Seconds</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          variants={itemVariants}
          className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-xl sm:max-w-2xl mx-auto mb-6 sm:mb-8 px-2 sm:px-0"
        >
          Transform your ideas into professional documents with AI. From business proposals 
          to legal contracts, create anything in minutes—not hours.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-8 sm:mb-12"
        >
          <Button
            size="lg"
            onClick={onGetStarted}
            className="w-full sm:w-auto gap-2 text-sm sm:text-base px-6 sm:px-8 py-2.5 sm:py-3 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25"
          >
            Start Creating Free
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => setIsVideoOpen(true)}
            className="w-full sm:w-auto gap-2 text-sm sm:text-base px-6 sm:px-8 py-2.5 sm:py-3 border-primary/30 hover:bg-primary/5 backdrop-blur-sm"
          >
            <Play className="w-4 h-4 sm:w-5 sm:h-5" />
            Watch Demo
          </Button>
        </motion.div>

        {/* Stats */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-3 gap-4 sm:gap-8 max-w-xs sm:max-w-lg mx-auto"
        >
          {[
            { value: '50K+', label: 'Documents' },
            { value: '10K+', label: 'Users' },
            { value: '4.9', label: 'Rating' },
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-orange-400 bg-clip-text text-transparent">
                {stat.value}
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-16 sm:bottom-20 left-1/2 -translate-x-1/2 z-10"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-5 h-8 sm:w-6 sm:h-10 rounded-full border-2 border-primary/30 flex items-start justify-center p-1.5 sm:p-2 backdrop-blur-sm">
          <motion.div
            className="w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full bg-primary"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
      </motion.div>

      {/* Video Modal */}
      <VideoModal isOpen={isVideoOpen} onClose={() => setIsVideoOpen(false)} />
    </section>
  );
}
