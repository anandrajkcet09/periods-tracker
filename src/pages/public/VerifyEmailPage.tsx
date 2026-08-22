import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { MailCheck, ArrowRight, RefreshCw, Mail, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { supabase } from '@/lib/supabase';

export const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialEmail = searchParams.get('email') || '';

  const [email, setEmail] = useState<string>(initialEmail);
  const [resending, setResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleResend = async () => {
    if (!email.trim()) {
      setErrorMessage('Please provide your email address to resend confirmation.');
      return;
    }

    setResending(true);
    setResendStatus(null);
    setErrorMessage(null);

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim(),
      });

      if (error) {
        setErrorMessage(error.message);
      } else {
        setResendStatus(`A new confirmation email has been sent to ${email.trim()}.`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to resend confirmation email.';
      setErrorMessage(msg);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12 sm:px-6">
      <div className="w-full max-w-md space-y-6">
        <Card className="p-6 sm:p-8 space-y-6 text-center bg-white border border-slate-100 shadow-soft">
          <div className="w-14 h-14 rounded-2xl bg-sage-50 text-sage-600 flex items-center justify-center mx-auto shadow-soft">
            <MailCheck className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Verify Your Email
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              We have dispatched an email confirmation link to:
            </p>
            {email ? (
              <p className="font-semibold text-sm text-slate-900 bg-slate-50 py-1.5 px-3 rounded-xl inline-block border border-slate-200">
                {email}
              </p>
            ) : null}
            <p className="text-xs text-slate-500 pt-1">
              Please click the link inside the email to activate your private account and sign in.
            </p>
          </div>

          {resendStatus && (
            <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-xl border border-emerald-200 flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{resendStatus}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200 flex items-center justify-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {!initialEmail && (
            <div className="text-left pt-2">
              <Input
                label="Your Email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="w-4 h-4" />}
              />
            </div>
          )}

          <div className="space-y-3 pt-2">
            <Link to="/login">
              <Button variant="primary" fullWidth size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Proceed to Sign In
              </Button>
            </Link>

            <Button
              variant="outline"
              fullWidth
              size="md"
              onClick={handleResend}
              disabled={resending || !email.trim()}
              leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />}
            >
              {resending ? 'Sending...' : 'Resend Verification Link'}
            </Button>
          </div>

          <div className="pt-2 text-center text-xs text-slate-500">
            Need to register a different email?{' '}
            <Link to="/signup" className="font-semibold text-blush-600 hover:underline">
              Back to Signup
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
