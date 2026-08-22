import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Heart, ShieldCheck, ArrowRight, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/context/AuthContext';

export const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { signUp, checkUsernameAvailable, isConfigured } = useAuth();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreed, setAgreed] = useState(true);

  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [usernameValid, setUsernameValid] = useState<boolean>(false);
  const [checkingUsername, setCheckingUsername] = useState<boolean>(false);

  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validate username format and availability
  useEffect(() => {
    const trimmed = username.trim();
    if (!trimmed) {
      setUsernameError(null);
      setUsernameValid(false);
      return;
    }

    if (trimmed.length < 3) {
      setUsernameError('Username must be at least 3 characters');
      setUsernameValid(false);
      return;
    }

    if (trimmed.length > 20) {
      setUsernameError('Username cannot exceed 20 characters');
      setUsernameValid(false);
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
      setUsernameError('Only letters, numbers, and underscores (_) are allowed');
      setUsernameValid(false);
      return;
    }

    setUsernameError(null);

    // Debounce availability check
    const timer = setTimeout(async () => {
      setCheckingUsername(true);
      const res = await checkUsernameAvailable(trimmed);
      setCheckingUsername(false);
      if (!res.available) {
        setUsernameError(res.message || 'This username is already taken');
        setUsernameValid(false);
      } else {
        setUsernameError(null);
        setUsernameValid(true);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [username, checkUsernameAvailable]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const trimmedUsername = username.trim();

    if (!trimmedUsername) {
      setFormError('Please choose a private username.');
      return;
    }

    if (usernameError || !usernameValid) {
      setFormError(usernameError || 'Please provide a valid, available username.');
      return;
    }

    if (password.length < 6) {
      setFormError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }

    if (!agreed) {
      setFormError('Please agree to the privacy policy.');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await signUp(email.trim(), password, trimmedUsername);

      if (error) {
        setFormError(error.message);
        setIsSubmitting(false);
        return;
      }

      // Success: Navigate to email verification screen
      navigate(`/verify-email?email=${encodeURIComponent(email.trim())}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred during signup.';
      setFormError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12 sm:px-6">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blush-500 to-coral-500 text-white flex items-center justify-center mx-auto shadow-soft">
            <Heart className="w-6 h-6 fill-white/20" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Create Your Private Account
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Encrypted cycle tracking. No real names, no tracking trackers.
          </p>
        </div>

        {/* Demo configuration notice if env is placeholder */}
        {!isConfigured && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold">Supabase Environment Setup:</strong> Add your real Supabase credentials to <code className="bg-amber-100 px-1 py-0.5 rounded">.env</code> to enable live database persistence.
            </div>
          </div>
        )}

        {/* Form Card */}
        <Card className="p-6 sm:p-8 space-y-5 bg-white border border-slate-100 shadow-soft">
          {formError && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div className="space-y-1">
              <Input
                label="Anonymous Username"
                type="text"
                placeholder="e.g. moon_flower99"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                leftIcon={<User className="w-4 h-4" />}
                rightIcon={
                  checkingUsername ? (
                    <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
                  ) : usernameValid ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : undefined
                }
                error={usernameError || undefined}
                required
              />
              <p className="text-[11px] text-slate-500 pl-1">
                3–20 characters (letters, numbers, underscores). Do not use your real name.
              </p>
            </div>

            {/* Email */}
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
              required
            />

            {/* Password */}
            <Input
              label="Password"
              type="password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
              required
            />

            {/* Confirm Password */}
            <Input
              label="Confirm Password"
              type="password"
              placeholder="Repeat your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
              error={
                confirmPassword && password !== confirmPassword
                  ? 'Passwords do not match'
                  : undefined
              }
              required
            />

            <label className="flex items-start gap-2.5 pt-1 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 rounded border-slate-300 text-blush-500 focus:ring-blush-400"
              />
              <span className="text-xs text-slate-600 leading-relaxed">
                I understand Aura enforces a strict zero-tracker policy and does not expose passwords or private health data.
              </span>
            </label>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              size="lg"
              disabled={isSubmitting || !agreed}
              rightIcon={
                isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ArrowRight className="w-4 h-4" />
                )
              }
            >
              {isSubmitting ? 'Creating Account...' : 'Sign Up with Email'}
            </Button>
          </form>

          <div className="pt-2 text-center text-xs text-slate-500 space-y-3">
            <p>
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-blush-600 hover:underline">
                Sign In
              </Link>
            </p>
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-sage-700 bg-sage-50/80 py-1.5 px-3 rounded-xl border border-sage-200/50">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Passwords securely hashed by Supabase Auth</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
