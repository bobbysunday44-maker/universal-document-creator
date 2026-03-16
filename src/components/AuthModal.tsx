import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Mail, Lock, User, Loader2, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { forgotPassword, resetPassword } from '@/lib/api';

type AuthMode = 'login' | 'register' | 'forgot' | 'reset';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'register';
}

export function AuthModal({ isOpen, onClose, defaultMode = 'login' }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>(defaultMode);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login, register } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  // Forgot/reset password state
  const [resetToken, setResetToken] = useState('');
  const [resetEmail, setResetEmail] = useState('');

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setMode(defaultMode);
      setFormData({ name: '', email: '', password: '' });
      setShowPassword(false);
      setResetToken('');
      setResetEmail('');
    }
  }, [isOpen, defaultMode]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (mode === 'login') {
        await login(formData.email, formData.password);
        toast.success('Welcome back!');
        onClose();
      } else if (mode === 'register') {
        if (formData.password.length < 6) {
          toast.error('Password must be at least 6 characters');
          setIsLoading(false);
          return;
        }
        try {
          await register(formData.name, formData.email, formData.password);
          toast.success('Account created successfully!');
          onClose();
        } catch (regError) {
          const msg = regError instanceof Error ? regError.message : '';
          if (msg.includes('pending') || msg.includes('approval')) {
            toast.success('Account created! Waiting for admin approval. You will be notified when approved.');
            onClose();
          } else {
            throw regError;
          }
        }
      } else if (mode === 'forgot') {
        await handleForgotPassword();
      } else if (mode === 'reset') {
        await handleResetPassword();
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong. Please try again.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!resetEmail.trim()) {
      toast.error('Please enter your email address');
      return;
    }
    const result = await forgotPassword(resetEmail.trim());
    toast.success(result.message);

    // In dev/local mode, the API returns the token directly
    if (result.reset_token) {
      setResetToken(result.reset_token);
      setMode('reset');
      setFormData({ ...formData, password: '' });
      setShowPassword(false);
    }
  };

  const handleResetPassword = async () => {
    if (!formData.password.trim()) {
      toast.error('Please enter a new password');
      return;
    }
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    const result = await resetPassword(resetToken, formData.password);
    toast.success(result.message);
    setMode('login');
    setFormData({ name: '', email: '', password: '' });
    setResetToken('');
    setResetEmail('');
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setFormData({ name: '', email: '', password: '' });
  };

  const getHeaderTitle = () => {
    switch (mode) {
      case 'login': return 'Welcome Back';
      case 'register': return 'Create Account';
      case 'forgot': return 'Forgot Password';
      case 'reset': return 'Reset Password';
    }
  };

  const getHeaderSubtitle = () => {
    switch (mode) {
      case 'login': return 'Sign in to continue creating amazing documents';
      case 'register': return 'Start your journey with Universal Document Creator';
      case 'forgot': return 'Enter your email to reset your password';
      case 'reset': return 'Enter your new password';
    }
  };

  const getSubmitLabel = () => {
    switch (mode) {
      case 'login': return isLoading ? 'Signing in...' : 'Sign In';
      case 'register': return isLoading ? 'Creating account...' : 'Create Account';
      case 'forgot': return isLoading ? 'Sending...' : 'Send Reset Link';
      case 'reset': return isLoading ? 'Resetting...' : 'Reset Password';
    }
  };

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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal Container - Centered */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-md max-h-[90vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-card border rounded-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="relative h-28 sm:h-32 bg-gradient-to-br from-primary via-primary/80 to-orange-400">
                  <button
                    onClick={onClose}
                    className="absolute top-3 right-3 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                    aria-label="Close"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                  {(mode === 'forgot' || mode === 'reset') && (
                    <button
                      onClick={() => {
                        setMode('login');
                        setFormData({ name: '', email: '', password: '' });
                        setResetToken('');
                        setResetEmail('');
                      }}
                      className="absolute top-3 left-3 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                      aria-label="Back to login"
                    >
                      <ArrowLeft className="w-4 h-4 text-white" />
                    </button>
                  )}
                  <div className="absolute bottom-4 left-5 sm:left-6">
                    <h2 className="text-xl sm:text-2xl font-bold text-white">
                      {getHeaderTitle()}
                    </h2>
                    <p className="text-white/80 text-xs sm:text-sm">
                      {getHeaderSubtitle()}
                    </p>
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
                  {/* Register: Name field */}
                  {mode === 'register' && (
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="name"
                          type="text"
                          placeholder="John Doe"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                  )}

                  {/* Login & Register: Email field */}
                  {(mode === 'login' || mode === 'register') && (
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="you@example.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                  )}

                  {/* Forgot: Email field */}
                  {mode === 'forgot' && (
                    <div className="space-y-2">
                      <Label htmlFor="reset-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="reset-email"
                          type="email"
                          placeholder="you@example.com"
                          value={resetEmail}
                          onChange={(e) => setResetEmail(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                  )}

                  {/* Login & Register: Password field */}
                  {(mode === 'login' || mode === 'register') && (
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          className="pl-10 pr-10"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Reset: New password field */}
                  {mode === 'reset' && (
                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="new-password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          className="pl-10 pr-10"
                          required
                          minLength={6}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Submit button */}
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {getSubmitLabel()}
                  </Button>

                  {/* Forgot password link (login mode only) */}
                  {mode === 'login' && (
                    <div className="text-center">
                      <button
                        type="button"
                        onClick={() => setMode('forgot')}
                        className="text-sm text-muted-foreground hover:text-primary hover:underline"
                      >
                        Forgot your password?
                      </button>
                    </div>
                  )}

                  {/* Login/Register toggle */}
                  {(mode === 'login' || mode === 'register') && (
                    <div className="text-center text-sm">
                      <span className="text-muted-foreground">
                        {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                      </span>
                      <button
                        type="button"
                        onClick={switchMode}
                        className="text-primary hover:underline font-medium"
                      >
                        {mode === 'login' ? 'Sign up' : 'Sign in'}
                      </button>
                    </div>
                  )}

                  {/* Back to sign in (forgot/reset modes) */}
                  {(mode === 'forgot' || mode === 'reset') && (
                    <div className="text-center text-sm">
                      <button
                        type="button"
                        onClick={() => {
                          setMode('login');
                          setFormData({ name: '', email: '', password: '' });
                          setResetToken('');
                          setResetEmail('');
                        }}
                        className="text-primary hover:underline font-medium"
                      >
                        Back to Sign In
                      </button>
                    </div>
                  )}
                </form>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
