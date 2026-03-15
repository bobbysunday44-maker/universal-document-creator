import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, Sparkles, Zap, Crown, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { createCheckoutSession, createCustomerPortal } from '@/lib/api';

const plans = [
  {
    name: 'Free',
    description: 'Perfect for getting started',
    price: 0,
    period: 'forever',
    icon: Sparkles,
    features: [
      '10 documents per month',
      '5 AI generations',
      'Basic templates',
      'Text export only',
      'Community support',
    ],
    cta: 'Get Started',
    variant: 'outline' as const,
    popular: false,
  },
  {
    name: 'Pro',
    description: 'For professionals and small teams',
    price: 19,
    period: 'month',
    icon: Zap,
    features: [
      'Unlimited documents',
      'Unlimited AI generations',
      'All 50+ templates',
      'All export formats (PDF, MD, TXT)',
      'Priority support',
      'Custom skills upload',
      'Document history',
    ],
    cta: 'Start Free Trial',
    variant: 'default' as const,
    popular: true,
  },
  {
    name: 'Enterprise',
    description: 'For large organizations',
    price: 49,
    period: 'month',
    icon: Crown,
    features: [
      'Everything in Pro',
      'Team collaboration',
      'SSO & SAML',
      'API access',
      'Dedicated support',
      'Custom AI training',
      'SLA guarantee',
    ],
    cta: 'Contact Sales',
    variant: 'outline' as const,
    popular: false,
  },
];

export function PricingSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const [hoveredPlan, setHoveredPlan] = useState<string | null>(null);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuth();

  const handlePlanClick = async (planName: string) => {
    if (planName === 'Enterprise') {
      toast.info('Contact sales coming soon!');
      return;
    }

    if (planName === 'Free') {
      toast.success('Welcome to Universal Doc!');
      return;
    }

    // Pro plan
    if (!isAuthenticated) {
      toast.error('Please sign in first');
      return;
    }

    // Already on this plan — open billing portal instead
    if (user?.plan === 'pro' || user?.plan === 'enterprise') {
      try {
        setLoadingPlan(planName);
        const { portal_url } = await createCustomerPortal();
        window.location.href = portal_url;
      } catch (err: any) {
        toast.error(err.message || 'Failed to open billing portal');
      } finally {
        setLoadingPlan(null);
      }
      return;
    }

    try {
      setLoadingPlan(planName);
      const { checkout_url } = await createCheckoutSession('pro');
      window.location.href = checkout_url;
    } catch (err: any) {
      toast.error(err.message || 'Failed to create checkout session');
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <section id="pricing" className="py-16 sm:py-20 lg:py-32 relative overflow-hidden bg-background">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] sm:w-[800px] h-[500px] sm:h-[800px] bg-primary/5 rounded-full blur-3xl" />
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
            Simple Pricing
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 text-foreground">
            Choose Your{' '}
            <span className="bg-gradient-to-r from-primary to-orange-400 bg-clip-text text-transparent">
              Perfect Plan
            </span>
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto px-2 sm:px-0">
            Start free and scale as you grow. No hidden fees, cancel anytime.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative ${plan.popular ? 'md:-mt-2 md:mb-2 lg:-mt-4 lg:mb-4' : ''}`}
              onMouseEnter={() => setHoveredPlan(plan.name)}
              onMouseLeave={() => setHoveredPlan(null)}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                  <span className="px-3 sm:px-4 py-1 rounded-full bg-gradient-to-r from-primary to-orange-400 text-white text-xs sm:text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              <div
                className={`h-full p-5 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl border transition-all duration-300 ${
                  plan.popular
                    ? 'bg-card border-primary shadow-xl shadow-primary/10'
                    : 'bg-card/50 hover:border-primary/30'
                } ${hoveredPlan === plan.name ? 'scale-[1.02]' : ''}`}
              >
                {/* Header */}
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center ${
                    plan.popular ? 'bg-primary' : 'bg-muted'
                  }`}>
                    <plan.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${plan.popular ? 'text-white' : 'text-muted-foreground'}`} />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-foreground">{plan.name}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">{plan.description}</p>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-4 sm:mb-6">
                  <span className="text-3xl sm:text-4xl font-bold text-foreground">${plan.price}</span>
                  <span className="text-sm sm:text-base text-muted-foreground">/{plan.period}</span>
                </div>

                {/* Features */}
                <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className={`w-4 h-4 sm:w-5 sm:h-5 mt-0.5 shrink-0 ${plan.popular ? 'text-primary' : 'text-muted-foreground'}`} />
                      <span className="text-sm sm:text-base text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Button
                  variant={plan.variant}
                  className="w-full gap-2 text-sm sm:text-base"
                  size="lg"
                  disabled={loadingPlan === plan.name}
                  onClick={() => handlePlanClick(plan.name)}
                >
                  {loadingPlan === plan.name ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      {plan.name === 'Pro' && isAuthenticated && (user?.plan === 'pro' || user?.plan === 'enterprise')
                        ? 'Manage Subscription'
                        : plan.cta}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Money Back Guarantee */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center mt-8 sm:mt-12"
        >
          <p className="text-xs sm:text-sm text-muted-foreground">
            30-day money-back guarantee. No questions asked.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
