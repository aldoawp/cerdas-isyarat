'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
} from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseClient, getCurrentSession } from '@/lib/utils/auth-util';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | undefined;
  session: Session | undefined;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | undefined>(undefined);
  const [session, setSession] = useState<Session | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Use useMemo to ensure we only create one client instance
  const supabase = useMemo(() => getSupabaseClient(), []);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const session = await getCurrentSession();
        setSession(session ?? undefined);
        setUser(session?.user ?? undefined);
      } catch {
        // Silent error handling
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session ?? undefined);
      setUser(session?.user ?? undefined);
      setLoading(false);

      if (event === 'SIGNED_OUT') {
        // Clear localStorage on sign out
        localStorage.removeItem('loggedInUser');
        localStorage.removeItem('userBisindoProgress');
        router.push('/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth, router]);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // Error handling is done silently
    }
  };

  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) {
        // If refresh fails, sign out the user
        await signOut();
      } else {
        setSession(data.session ?? undefined);
        setUser(data.session?.user ?? undefined);
      }
    } catch {
      await signOut();
    }
  };

  const value: AuthContextType = {
    user,
    session,
    loading,
    signOut,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
