import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { AuthModal } from './AuthModal';
import { FileText, Menu, X, Sparkles, Crown } from 'lucide-react';
import { toast } from 'sonner';

interface PremiumHeaderProps {
  onNavigate: (section: string) => void;
  currentSection: string;
}

const navItems = [
  { id: 'home', label: 'Home' },
  { id: 'features', label: 'Features' },
  { id: 'templates', label: 'Templates' },
  { id: 'testimonials', label: 'Testimonials' },
  { id: 'pricing', label: 'Pricing' },
];

export function PremiumHeader({ onNavigate, currentSection }: PremiumHeaderProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const openLogin = () => {
    setAuthMode('login');
    setIsAuthModalOpen(true);
    setIsMobileMenuOpen(false);
  };

  const openRegister = () => {
    setAuthMode('register');
    setIsAuthModalOpen(true);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
  };

  const handleNavClick = (sectionId: string) => {
    onNavigate(sectionId);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', damping: 20 }}
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
          isScrolled
            ? 'bg-background/95 backdrop-blur-xl border-b border-border shadow-sm'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 lg:h-20">
            {/* Logo */}
            <motion.div
              className="flex items-center gap-2 cursor-pointer shrink-0"
              whileHover={{ scale: 1.02 }}
              onClick={() => handleNavClick('home')}
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <span className="font-bold text-base sm:text-lg text-foreground">Universal</span>
                <span className="font-bold text-base sm:text-lg text-primary">Doc</span>
              </div>
            </motion.div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    currentSection === item.id
                      ? 'text-primary bg-primary/10'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>

            {/* Right Side */}
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              {isAuthenticated ? (
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="hidden md:flex items-center gap-2 px-2 sm:px-3 py-1 rounded-full bg-primary/10">
                    <Crown className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                    <span className="text-xs sm:text-sm font-medium capitalize text-foreground">{user?.plan}</span>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center text-white text-xs sm:text-sm font-bold">
                      {user?.name?.[0]?.toUpperCase()}
                    </div>
                    <span className="hidden lg:block text-sm font-medium text-foreground truncate max-w-[100px]">{user?.name}</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleLogout} className="hidden sm:flex">
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={openLogin}>
                    Sign In
                  </Button>
                  <Button size="sm" onClick={openRegister} className="gap-1 bg-primary hover:bg-primary/90">
                    <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden md:inline">Get Started</span>
                    <span className="md:hidden">Start</span>
                  </Button>
                </div>
              )}

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden h-9 w-9"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden border-t bg-background/98 backdrop-blur-xl overflow-hidden"
            >
              <nav className="flex flex-col p-4 gap-1">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`px-4 py-3 rounded-lg text-left font-medium transition-all ${
                      currentSection === item.id
                        ? 'text-primary bg-primary/10'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
                {!isAuthenticated && (
                  <div className="flex flex-col gap-2 mt-4 pt-4 border-t">
                    <Button variant="outline" onClick={openLogin} className="w-full">
                      Sign In
                    </Button>
                    <Button onClick={openRegister} className="w-full bg-primary hover:bg-primary/90">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Get Started
                    </Button>
                  </div>
                )}
                {isAuthenticated && (
                  <Button variant="outline" onClick={handleLogout} className="w-full mt-4 pt-4 border-t">
                    Logout
                  </Button>
                )}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultMode={authMode}
      />
    </>
  );
}
