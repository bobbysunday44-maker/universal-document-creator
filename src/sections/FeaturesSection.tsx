import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { 
  Wand2, 
  FileText, 
  Zap, 
  Shield, 
  Globe, 
  Layers,
  Sparkles
} from 'lucide-react';

const features = [
  {
    icon: Wand2,
    title: 'AI-Powered Generation',
    description: 'Advanced AI models create professional documents tailored to your needs with just a few clicks.',
    color: 'from-orange-500 to-amber-500',
  },
  {
    icon: FileText,
    title: '50+ Document Templates',
    description: 'From business proposals to legal contracts, access our library of professionally designed templates.',
    color: 'from-primary to-orange-400',
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Generate complete documents in under 30 seconds. No more staring at blank pages.',
    color: 'from-amber-500 to-yellow-500',
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'Your documents are encrypted and secure. We never train our AI on your private content.',
    color: 'from-emerald-500 to-teal-500',
  },
  {
    icon: Globe,
    title: 'Multi-Language Support',
    description: 'Create documents in 25+ languages. Expand your global reach effortlessly.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Layers,
    title: 'Skill Chaining',
    description: 'Chain multiple skills together. Generate a proposal, then convert it to a pitch deck automatically.',
    color: 'from-rose-500 to-pink-500',
  },
];

export function FeaturesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <section id="features" className="py-16 sm:py-20 lg:py-32 relative overflow-hidden bg-background">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-orange-300/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 sm:mb-16"
        >
          <span className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-medium mb-3 sm:mb-4">
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
            Powerful Features
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 text-foreground">
            Everything You Need to{' '}
            <span className="bg-gradient-to-r from-primary to-orange-400 bg-clip-text text-transparent">
              Create Faster
            </span>
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto px-2 sm:px-0">
            Our AI-powered platform comes packed with features designed to streamline 
            your document creation workflow.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="group relative"
            >
              <div className="relative p-5 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl bg-card border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5">
                {/* Icon */}
                <div className={`w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-lg sm:rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-lg sm:text-xl font-semibold mb-1.5 sm:mb-2 text-foreground">{feature.title}</h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{feature.description}</p>

                {/* Hover Glow */}
                <div className={`absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none`} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
