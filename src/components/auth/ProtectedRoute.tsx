import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Heart } from 'lucide-react';

export const ProtectedRoute: React.FC = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4 animate-fade-in">
          <div className="w-12 h-12 rounded-2xl bg-blush-500 text-white flex items-center justify-center shadow-glow-pink animate-pulse-gentle">
            <Heart className="w-6 h-6 fill-white/20" />
          </div>
          <div className="text-center space-y-1">
            <p className="text-sm font-semibold text-slate-800">Unlocking Vault...</p>
            <p className="text-xs text-slate-400">Verifying encrypted session</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};
