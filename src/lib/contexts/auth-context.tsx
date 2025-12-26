'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
} from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { User, Session } from '@supabase/supabase-js';
import { usePathname } from 'next/navigation';
import { insertEventLog } from '@/repositories/event-log-repository';
import { logAuthError } from '@/lib/utils/error-logger';

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
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setSession(session ?? undefined);
        setUser(session?.user ?? undefined);
      } catch (error) {
        // Log session fetch error
        await logAuthError(error);
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
      // Log logout event before signing out (while we still have user info)
      if (user?.id) {
        try {
          await insertEventLog({
            event_type: 'authentication',
            event_name: 'user_logout',
            description: 'User logged out successfully',
            actor_type: 'user',
            actor_id: user.id,
          });
        } catch (logError) {
          // Don't block logout if event logging fails
          console.error('Failed to log logout event:', logError);
        }
      }

      await supabase.auth.signOut();
    } catch (error) {
      // Log sign out error
      await logAuthError(error, user?.id);
    }
  };

  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) {
        // Log session refresh error
        await logAuthError(error, user?.id);
        // If refresh fails, sign out the user
        await signOut();
      } else {
        setSession(data.session ?? undefined);
        setUser(data.session?.user ?? undefined);
      }
    } catch (error) {
      await logAuthError(error, user?.id);
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

// Hook for components that need to check if they should redirect authenticated users
// This hook automatically redirects authenticated users away from login/register pages
// to the onboarding page. Components using this hook will show a loading state
// while the authentication check is happening.
export const useProtectedRoute = () => {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Only redirect if we're not loading and user is authenticated
    // Using inline check to avoid function recreation and potential hook ordering issues
    if (
      !loading &&
      user &&
      (pathname === '/login' || pathname === '/register')
    ) {
      // User is authenticated but trying to access login/register pages
      // Redirect them to onboarding
      router.replace('/onboarding');
    }
  }, [user, loading, pathname, router]);

  return { user, loading };
};

// Hook for protecting routes that require authentication
// This hook redirects unauthenticated users to login when they try to access protected routes
// Use this hook in components that should only be accessible to authenticated users
export const useRequireAuth = () => {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Only redirect if we're not loading and user is not authenticated
    if (
      !loading &&
      !user &&
      pathname !== '/login' &&
      pathname !== '/register'
    ) {
      // User is not authenticated but trying to access protected pages
      // Redirect them to login
      router.replace('/login');
    }
  }, [user, loading, pathname, router]);

  return { user, loading };
};

// Hook for showing loading screen on every page visit
// This prevents content flashing and provides consistent loading experience
export const usePageLoading = () => {
  const [isPageLoading, setIsPageLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    // Set loading to true when pathname changes (new page visit)
    setIsPageLoading(true);

    // Simulate a minimum loading time to prevent flash
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 500); // Minimum 500ms loading time

    return () => clearTimeout(timer);
  }, [pathname]);

  return { isPageLoading };
};
