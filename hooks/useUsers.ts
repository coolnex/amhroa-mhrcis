// hooks/useUsers.ts
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

interface User {
  id: string;
  full_name: string;
  email: string;
  role: string;
  status: 'Approved' | 'Pending' | 'Rejected';
  created_at: string;
  country?: string;
  organization?: string;
  assigned_region: string;
  auth_user_id?: string;
}

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateUserStatus = useCallback(async (userId: string, status: 'Approved' | 'Pending' | 'Rejected') => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ 
          status, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', userId);

      if (error) throw error;
      
      // Update local state
      setUsers(prev => 
        prev.map(u => u.id === userId ? { ...u, status } : u)
      );
      
      return { success: true };
    } catch (err: any) {
      console.error('Error updating user status:', err);
      return { success: false, error: err.message };
    }
  }, []);

  const updateUserRole = useCallback(async (userId: string, role: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ 
          role, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', userId);

      if (error) throw error;
      
      setUsers(prev => 
        prev.map(u => u.id === userId ? { ...u, role } : u)
      );
      
      return { success: true };
    } catch (err: any) {
      console.error('Error updating user role:', err);
      return { success: false, error: err.message };
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    loading,
    error,
    fetchUsers,
    updateUserStatus,
    updateUserRole,
  };
}