import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export interface UserProfile {
  id: string;
  username: string;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  isConfigured: boolean;
  signUp: (email: string, password: string, username: string) => Promise<{ error: AuthError | Error | null; user: User | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | Error | null; unverified?: boolean }>;
  signOut: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<{ error: AuthError | Error | null }>;
  updatePassword: (password: string) => Promise<{ error: AuthError | Error | null }>;
  checkUsernameAvailable: (username: string) => Promise<{ available: boolean; message?: string }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const isConfigured = isSupabaseConfigured();

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (!error && data) {
        setProfile(data as UserProfile);
      } else {
        // If trigger hasn't fired or profile not created yet, create from user metadata
        const currentUser = (await supabase.auth.getUser()).data.user;
        const metaUsername = currentUser?.user_metadata?.username;
        if (metaUsername) {
          const { data: newProfile } = await supabase
            .from('profiles')
            .upsert({ id: userId, username: metaUsername })
            .select()
            .single();
          if (newProfile) setProfile(newProfile as UserProfile);
        }
      }
    } catch {
      // Profile fetch failed gracefully
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function initSession() {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        if (isMounted) {
          setSession(initialSession);
          setUser(initialSession?.user ?? null);
          if (initialSession?.user) {
            await fetchProfile(initialSession.user.id);
          }
        }
      } catch (err) {
        console.error('Session init error:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, currentSession) => {
        if (!isMounted) return;
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          await fetchProfile(currentSession.user.id);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  const checkUsernameAvailable = async (username: string): Promise<{ available: boolean; message?: string }> => {
    const trimmed = username.trim();
    if (!trimmed) {
      return { available: false, message: 'Username is required' };
    }
    if (trimmed.length < 3 || trimmed.length > 20) {
      return { available: false, message: 'Username must be between 3 and 20 characters' };
    }
    if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
      return { available: false, message: 'Only letters, numbers, and underscores are allowed' };
    }

    if (!isConfigured) {
      return { available: true };
    }

    try {
      // Try calling RPC function first
      const { data, error } = await supabase.rpc('is_username_available', {
        check_username: trimmed,
      });

      if (!error && typeof data === 'boolean') {
        if (!data) {
          return { available: false, message: 'This username is already taken' };
        }
        return { available: true };
      }

      // Fallback query if RPC isn't loaded yet
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .ilike('username', trimmed)
        .maybeSingle();

      if (existing) {
        return { available: false, message: 'This username is already taken' };
      }

      return { available: true };
    } catch {
      return { available: true };
    }
  };

  const signUp = async (email: string, password: string, username: string) => {
    const trimmedUsername = username.trim();

    // Client check on username format
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(trimmedUsername)) {
      return {
        error: new Error('Username must be 3–20 characters and contain only letters, numbers, or underscore.'),
        user: null,
      };
    }

    // Availability check
    const availability = await checkUsernameAvailable(trimmedUsername);
    if (!availability.available) {
      return {
        error: new Error(availability.message || 'Username is unavailable.'),
        user: null,
      };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: trimmedUsername,
        },
      },
    });

    if (error) {
      return { error, user: null };
    }

    if (data.user) {
      // If user is auto-confirmed or session is active, ensure profile exists
      try {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          username: trimmedUsername,
        });
      } catch {
        // Handled by database trigger
      }
    }

    return { error: null, user: data.user };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Check for unverified email error
      if (
        error.message?.toLowerCase().includes('email not confirmed') ||
        error.message?.toLowerCase().includes('not confirmed')
      ) {
        return { error, unverified: true };
      }
      return { error };
    }

    // Double check confirmation status if present
    if (data.user && !data.user.email_confirmed_at && data.user.confirmation_sent_at) {
      // If project has email confirmation enforced
      return { error: null, unverified: false };
    }

    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  const sendPasswordReset = async (email: string) => {
    const redirectUrl = `${window.location.origin}/reset-password`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });
    return { error };
  };

  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({
      password,
    });
    return { error };
  };

  const value: AuthContextType = {
    user,
    session,
    profile,
    loading,
    isConfigured,
    signUp,
    signIn,
    signOut,
    sendPasswordReset,
    updatePassword,
    checkUsernameAvailable,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
