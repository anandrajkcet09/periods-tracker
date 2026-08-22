import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Heart, Shield, ArrowRight, AlertCircle, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/context/AuthContext';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, isConfigured } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [unverifiedNotice, setUnverifiedNotice] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Return to requested destination if redirected from protected route
  const fromLocation = (location.state as { from?: { pathname?: string } })?.from?.pathname || '/app/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setUnverifiedNotice(false);

    if (!email.trim() || !password) {
      setFormError('Please enter your email and password.');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error, unverified } = await signIn(email.trim(), password);

      if (unverified) {
        setUnverifiedNotice(true);
        setFormError('Your email address has not been verified yet. Please check your inbox for the confirmation link.');
        setIsSubmitting(false);
        return;
      }

      if (error) {
        setFormError(error.message || 'Invalid email or password. Please try again.');
        setIsSubmitting(false);
        return;
      }

      // Success
      navigate(fromLocation, { replace: true });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unexpected login error occurred.';
      setFormError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12 sm:px-6">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-blush-500 text-white flex items-center justify-center mx-auto shadow-soft">
            <Heart className="w-6 h-6 fill-white/20" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Sign In to Aura
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Access your private, encrypted period tracker vault.
          </p>
        </div>

        {/* Configuration Notice if placeholder */}
        {!isConfigured && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold">Setup Tip:</strong> Configure Supabase credentials in <code className="bg-amber-100 px-1 py-0.5 rounded">.env</code> to connect live authentication.
            </div>
          </div>
        )}

        {/* Form Card */}
        <Card className="p-6 sm:p-8 space-y-5 bg-white border border-slate-100 shadow-soft">
          {formError && (
            <div className={`p-3.5 rounded-xl text-xs flex items-start gap-2 animate-fade-in ${
              unverifiedNotice
                ? 'bg-amber-50 border border-amber-200 text-amber-800'
                : 'bg-rose-50 border border-rose-200 text-rose-700'
            }`}>
              {unverifiedNotice ? (
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <span>{formError}</span>
                {unverifiedNotice && (
                  <div>
                    <Link
                      to={`/verify-email?email=${encodeURIComponent(email.trim())}`}
                      className="font-bold underline text-amber-900 block mt-1"
                    >
                      Go to Verification Screen →
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
              required
            />

            <div className="space-y-1">
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock className="w-4 h-4" />}
                required
              />
              <div className="flex justify-end pt-1">
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-blush-600 hover:text-blush-700"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              size="lg"
              disabled={isSubmitting}
              rightIcon={
                isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ArrowRight className="w-4 h-4" />
                )
              }
            >
              {isSubmitting ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>

          <div className="pt-2 text-center text-xs text-slate-500 space-y-3">
            <p>
              Don't have an account?{' '}
              <Link to="/signup" className="font-semibold text-blush-600 hover:underline">
                Create one free
              </Link>
            </p>
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-sage-700 bg-sage-50/80 py-1.5 px-3 rounded-xl border border-sage-200/50">
              <Shield className="w-3 h-3" />
              <span>Zero third-party trackers. Passwords never exposed.</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
