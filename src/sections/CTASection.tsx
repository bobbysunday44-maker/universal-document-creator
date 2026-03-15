import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Check } from 'lucide-react';
import { toast } from 'sonner';
import { BackgroundSlideshow } from '@/components/BackgroundSlideshow';

interface CTASectionProps {
  onGetStarted: () => void;
}

const ctaImages = [
  '/slide-3.jpg',
  '/slide-4.jpg',
  '/slide-5.jpg',
];

export function CTASection({ onGetStarted }: CTASectionProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const [email, setEmail] = useState('');

  const handleScheduleDemo = () => {
    toast.info('Demo scheduling coming soon!');
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast.success('Thanks for subscribing!');
      setEmail('');
    }
  };

  return (
    <section className="py-16 sm:py-20 lg:py-32 relative overflow-hidden">
      {/* Background Slideshow */}
      <BackgroundSlideshow 
        images={ctaImages} 
        interval={8000}
        overlayOpacity={0.85}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs sm:text-sm font-medium mb-4 sm:mb-6 backdrop-blur-sm"
          >
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
            Start Creating Today
          </motion.div>

          {/* Headline */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 text-foreground"
          >
            <span className="block">Ready to Transform Your</span>
            <span className="block mt-1 sm:mt-2 bg-gradient-to-r from-primary via-orange-400 to-amber-500 bg-clip-text text-transparent">
              Document Workflow?
            </span>
          </motion.h2>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto mb-6 sm:mb-8 px-2 sm:px-0"
          >
            Join 10,000+ professionals who are already creating better documents faster. 
            Start your free trial today—no credit card required.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4"
          >
            <Button
              size="lg"
              onClick={onGetStarted}
              className="w-full sm:w-auto gap-2 text-sm sm:text-base px-6 sm:px-8 py-2.5 sm:py-3 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25"
            >
              Start Free Trial
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={handleScheduleDemo}
              className="w-full sm:w-auto gap-2 text-sm sm:text-base px-6 sm:px-8 py-2.5 sm:py-3 border-primary/30 hover:bg-primary/5 backdrop-blur-sm"
            >
              Schedule Demo
            </Button>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mt-8 sm:mt-10 text-muted-foreground text-xs sm:text-sm"
          >
            <span className="flex items-center gap-1.5 sm:gap-2">
              <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
              No credit card required
            </span>
            <span className="flex items-center gap-1.5 sm:gap-2">
              <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
              14-day free trial
            </span>
            <span className="flex items-center gap-1.5 sm:gap-2">
              <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
              Cancel anytime
            </span>
          </motion.div>

          {/* Newsletter */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.6 }}
            onSubmit={handleSubscribe}
            className="mt-8 sm:mt-12 max-w-xs sm:max-w-md mx-auto px-2 sm:px-0"
          >
            <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">Get productivity tips delivered to your inbox</p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border border-border bg-card/80 backdrop-blur-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
              />
              <Button type="submit" variant="secondary" className="w-full sm:w-auto text-sm">
                Subscribe
              </Button>
            </div>
          </motion.form>
        </motion.div>
      </div>
    </section>
  );
}
