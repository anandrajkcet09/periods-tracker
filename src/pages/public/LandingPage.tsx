import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Lock,
  Smartphone,
  Heart,
  ArrowRight,
  Database,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export const LandingPage: React.FC = () => {
  const privacyPillars = [
    {
      icon: Lock,
      title: 'Zero Third-Party Tracking',
      description:
        'No analytics trackers, no ad networks, no data brokers. Your reproductive health data is never monetized.',
      color: 'blush',
    },
    {
      icon: Database,
      title: 'End-to-End Privacy',
      description:
        'Stored securely with encrypted protocols. You maintain full ownership and can export or wipe your data anytime.',
      color: 'sage',
    },
    {
      icon: Smartphone,
      title: 'Installable PWA',
      description:
        'Add directly to your mobile home screen without app store surveillance or background telemetry.',
      color: 'lavender',
    },
  ];

  const features = [
    {
      title: 'Gentle Cycle Predictions',
      desc: 'Predict your next period and fertile windows accurately without invasive notifications.',
      tag: 'Accurate & Calm',
    },
    {
      title: 'Symptom & Mood Journaling',
      desc: 'Log physical sensations, cramps, moods, and notes with one-tap ease.',
      tag: 'Fast Logging',
    },
    {
      title: 'History & Trend Insights',
      desc: 'Understand your cycle regularity, average length, and patterns over time.',
      tag: 'Clear Trends',
    },
  ];

  return (
    <div className="space-y-16 sm:space-y-24 py-8 sm:py-16">
      {/* Hero Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
        <div className="inline-flex items-center gap-2">
          <Badge variant="sage" size="md" icon={<ShieldCheck className="w-3.5 h-3.5" />}>
            Built for 100% Privacy & Simplicity
          </Badge>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
          A menstrual tracker that{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blush-600 via-blush-500 to-coral-500">
            respects your privacy
          </span>
        </h1>

        <p className="text-base sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Track your cycle, symptoms, and bodily rhythms without third-party tracking, ad tech,
          or corporate surveillance. Lightweight, serene, and installable as a PWA.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link to="/signup" className="w-full sm:w-auto">
            <Button size="lg" variant="primary" fullWidth rightIcon={<ArrowRight className="w-4 h-4" />}>
              Create Private Account
            </Button>
          </Link>
          <Link to="/app/dashboard" className="w-full sm:w-auto">
            <Button size="lg" variant="outline" fullWidth>
              Try Live App Preview
            </Button>
          </Link>
        </div>

        <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs font-medium text-slate-500">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> No ads or data sharing
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Free & lightweight
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> PWA install ready
          </span>
        </div>
      </section>

      {/* Hero UI Showcase / Mock Preview */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="relative rounded-3xl p-1 bg-gradient-to-b from-blush-200 via-sage-100 to-slate-200 shadow-soft-lg">
          <div className="bg-white rounded-[22px] p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blush-50 flex items-center justify-center text-blush-600">
                  <Heart className="w-5 h-5 fill-blush-500/20" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-900">Today • Cycle Day 14</h2>
                  <p className="text-xs text-slate-500">Predicted Follicular Phase</p>
                </div>
              </div>
              <Badge variant="blush">Period in 14 days</Badge>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-blush-50/50 rounded-xl border border-blush-100 text-center">
                <span className="text-[11px] text-blush-700 font-medium block">Avg Cycle</span>
                <span className="text-lg font-bold text-slate-800">28 Days</span>
              </div>
              <div className="p-3 bg-sage-50/50 rounded-xl border border-sage-100 text-center">
                <span className="text-[11px] text-sage-700 font-medium block">Period Length</span>
                <span className="text-lg font-bold text-slate-800">5 Days</span>
              </div>
              <div className="p-3 bg-lavender-50/50 rounded-xl border border-lavender-100 text-center">
                <span className="text-[11px] text-lavender-700 font-medium block">Fertile Window</span>
                <span className="text-lg font-bold text-slate-800">In 2 Days</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy Pillars */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Privacy is not a feature. It is the foundation.
          </h2>
          <p className="text-sm sm:text-base text-slate-500 max-w-xl mx-auto">
            Traditional health apps sell user telemetry to advertisers. Aura is engineered with privacy as a fundamental human right.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {privacyPillars.map((p, idx) => {
            const Icon = p.icon;
            return (
              <Card key={idx} variant="default" className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-blush-50 text-blush-600 flex items-center justify-center">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">{p.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{p.description}</p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Core Features */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Everything you need, nothing you don't.
          </h2>
          <p className="text-sm text-slate-500">
            Lightweight, rapid load times, and simple navigation.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {features.map((feat, idx) => (
            <Card key={idx} variant="outline" className="p-6 space-y-3">
              <Badge variant="sage" size="sm">
                {feat.tag}
              </Badge>
              <h3 className="font-semibold text-slate-900">{feat.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{feat.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Footer Section */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="bg-gradient-to-r from-blush-500 to-coral-500 rounded-3xl p-8 sm:p-12 text-center text-white space-y-6 shadow-soft-lg">
          <h2 className="text-2xl sm:text-4xl font-bold">
            Take control of your cycle in total peace.
          </h2>
          <p className="text-blush-100 max-w-md mx-auto text-sm sm:text-base">
            No credit cards, no tracking cookies, no complex setups. Just a private sanctuary for your health.
          </p>
          <div className="pt-2">
            <Link to="/signup">
              <Button size="lg" className="bg-white text-blush-600 hover:bg-blush-50 shadow-none font-semibold">
                Get Started Now — It's Free
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
