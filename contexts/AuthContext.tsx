// contexts/AuthContext.tsx
"use client";

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  role: string;
  status: string;
  country?: string;
  organization?: string;
  auth_user_id?: string;
  created_at: string;
  [key: string]: any;
}

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  session: any;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{
    user: UserProfile | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    session: any;
  }>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    session: null,
  });
  
  const router = useRouter();
  const isChecking = useRef(false);
  const initialCheckDone = useRef(false);

  const checkAuth = useCallback(async () => {
    // Prevent multiple simultaneous checks
    if (isChecking.current) return;
    
    // Skip if already checked and authenticated
    if (initialCheckDone.current && state.isAuthenticated && state.user) {
      return;
    }

    isChecking.current = true;
    
    try {
      // 1. Check localStorage first
      const userStr = localStorage.getItem('user');
      const sessionStr = localStorage.getItem('session');

      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          const session = sessionStr ? JSON.parse(sessionStr) : null;
          
          if (user && user.id && user.role) {
            setState({
              user,
              session,
              isAuthenticated: true,
              isLoading: false,
            });
            initialCheckDone.current = true;
            isChecking.current = false;
            return;
          }
        } catch (e) {
          localStorage.removeItem('user');
          localStorage.removeItem('session');
        }
      }

      // 2. Check Supabase session
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error || !session) {
        setState({
          user: null,
          session: null,
          isAuthenticated: false,
          isLoading: false,
        });
        initialCheckDone.current = true;
        isChecking.current = false;
        return;
      }

      // 3. Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('auth_user_id', session.user.id)
        .single();

      if (profileError || !profile) {
        console.error('Profile fetch error:', profileError);
        setState({
          user: null,
          session,
          isAuthenticated: false,
          isLoading: false,
        });
        initialCheckDone.current = true;
        isChecking.current = false;
        return;
      }

      // 4. Cache in localStorage
      localStorage.setItem('user', JSON.stringify(profile));
      localStorage.setItem('session', JSON.stringify(session));

      setState({
        user: profile,
        session,
        isAuthenticated: true,
        isLoading: false,
      });
      initialCheckDone.current = true;

    } catch (error) {
      console.error('Auth check error:', error);
      setState({
        user: null,
        session: null,
        isAuthenticated: false,
        isLoading: false,
      });
    } finally {
      isChecking.current = false;
    }
  }, [state.isAuthenticated, state.user]);

  const signOut = useCallback(async () => {
    try {
      // Clear localStorage
      localStorage.removeItem('user');
      localStorage.removeItem('session');
      localStorage.removeItem('token');
      
      // Clear cookies
      document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      setState({
        user: null,
        session: null,
        isAuthenticated: false,
        isLoading: false,
      });
      
      initialCheckDone.current = false;
      router.push('/login');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }, [router]);

  const refreshUser = useCallback(async () => {
    initialCheckDone.current = false;
    await checkAuth();
  }, [checkAuth]);

  // Only run auth check once on mount
  useEffect(() => {
    if (!initialCheckDone.current) {
      checkAuth();
    }
  }, [checkAuth]);

  // Listen for auth state changes from Supabase
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // User signed in, refresh auth
        initialCheckDone.current = false;
        await checkAuth();
      } else if (event === 'SIGNED_OUT') {
        // User signed out
        localStorage.removeItem('user');
        localStorage.removeItem('session');
        setState({
          user: null,
          session: null,
          isAuthenticated: false,
          isLoading: false,
        });
        initialCheckDone.current = false;
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [checkAuth]);

  const value = {
    ...state,
    signOut,
    refreshUser,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}