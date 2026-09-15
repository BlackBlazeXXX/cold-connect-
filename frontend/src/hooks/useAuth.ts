// FILE: src/hooks/useAuth.ts
import { useState, useEffect, useCallback, useMemo, createContext, useContext, ReactNode, createElement } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { STORAGE_KEYS } from '../constants/constants';

export interface UserProfile {
  id: string;
  email: string;
  user_metadata?: {
    full_name?: string;
  };
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isConfigured: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null; isNew?: boolean }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const DEFAULT_DEMO_USER: UserProfile = {
  id: 'usr_demo_7701a2',
  email: 'sanju.designer001@gmail.com',
  user_metadata: {
    full_name: 'Sanju Designer',
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(() => {
    // Check local storage for session fallback
    const cached = localStorage.getItem(STORAGE_KEYS.authFallbackUser);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        return DEFAULT_DEMO_USER;
      }
    }
    // Default to active session for preview
    return DEFAULT_DEMO_USER;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isSupabaseConfigured) {
      // Get current Supabase session
      supabase.auth.getSession().then(({ data: { session }, error }) => {
        if (error) {
          console.warn('Supabase auth session error:', error.message);
        }
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            user_metadata: session.user.user_metadata,
          });
        }
        setLoading(false);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            user_metadata: session.user.user_metadata,
          });
        } else {
          setUser(null);
        }
        setLoading(false);
      });

      return () => {
        subscription.unsubscribe();
      };
    } else {
      // Fallback local session
      if (!user) {
        setUser(DEFAULT_DEMO_USER);
        localStorage.setItem(STORAGE_KEYS.authFallbackUser, JSON.stringify(DEFAULT_DEMO_USER));
      }
      setLoading(false);
    }
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) {
        return { error: new Error(error.message || 'Invalid credentials. Try again.') };
      }
      if (data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email || email,
          user_metadata: data.user.user_metadata,
        });
      }
      return { error: null };
    } else {
      // Offline fallback login
      if (!email || !password) {
        return { error: new Error('Email and password are required.') };
      }
      const localUser: UserProfile = {
        id: `usr_${Math.random().toString(36).substring(2, 9)}`,
        email: email.trim(),
        user_metadata: {
          full_name: email.split('@')[0],
        },
      };
      setUser(localUser);
      localStorage.setItem(STORAGE_KEYS.authFallbackUser, JSON.stringify(localUser));
      return { error: null };
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, fullName: string) => {
    if (password.length < 8) {
      return { error: new Error('Password must be at least 8 characters long.') };
    }

    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
          },
        },
      });

      if (error) {
        if (error.message?.toLowerCase().includes('already registered')) {
          return { error: new Error('Account exists. Sign in instead.') };
        }
        return { error: new Error(error.message || 'Sign up failed.') };
      }

      if (data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email || email,
          user_metadata: { full_name: fullName },
        });
      }
      return { error: null, isNew: true };
    } else {
      const localUser: UserProfile = {
        id: `usr_${Math.random().toString(36).substring(2, 9)}`,
        email: email.trim(),
        user_metadata: {
          full_name: fullName.trim(),
        },
      };
      setUser(localUser);
      localStorage.setItem(STORAGE_KEYS.authFallbackUser, JSON.stringify(localUser));
      return { error: null, isNew: true };
    }
  }, []);

  const signOut = useCallback(async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setUser(null);
    localStorage.removeItem(STORAGE_KEYS.authFallbackUser);
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    if (!email || !email.includes('@')) {
      return { error: new Error('Please enter a valid email address.') };
    }
    if (isSupabaseConfigured) {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
      if (error) {
        return { error: new Error(error.message) };
      }
    }
    return { error: null };
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isConfigured: isSupabaseConfigured,
      signIn,
      signUp,
      signOut,
      resetPassword,
    }),
    [user, loading, signIn, signUp, signOut, resetPassword]
  );

  return createElement(
    AuthContext.Provider,
    { value },
    children
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
