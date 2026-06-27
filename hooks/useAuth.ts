// hooks/useAuth.ts
import { useEffect, useState } from 'react';
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

interface AuthState {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  session: any;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    session: null,
  });
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      // 1. Check localStorage first (for existing sessions)
      const userStr = localStorage.getItem('user');
      const sessionStr = localStorage.getItem('session');

      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          const session = sessionStr ? JSON.parse(sessionStr) : null;
          
          if (user && user.id) {
            setState({
              user,
              session,
              isAuthenticated: true,
              isLoading: false,
            });
            return;
          }
        } catch (e) {
          // Invalid JSON, clear it
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
        return;
      }

      // 3. Get user profile from users table
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

    } catch (error) {
      console.error('Auth check error:', error);
      setState({
        user: null,
        session: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  };

  const signOut = async () => {
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
      
      router.push('/login');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const refreshUser = async () => {
    await checkAuth();
  };

  return {
    ...state,
    signOut,
    refreshUser,
  };
}