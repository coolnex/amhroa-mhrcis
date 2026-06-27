// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function middleware(request: NextRequest) {
  try {
    // Get token from cookies or authorization header
    const token = request.cookies.get('auth_token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (token) {
      try {
        // Decode the token (simple decode without verification for reading user ID)
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        
        const decoded = JSON.parse(jsonPayload);
        
        if (decoded.id) {
          // Set the user ID in the session for RLS
          await supabase.rpc('set_current_user_id', { user_id: decoded.id });
        }
      } catch (e) {
        // Token decode error - ignore
        console.error('Token decode error:', e);
      }
    }
  } catch (error) {
    console.error('Middleware error:', error);
  }
  
  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    '/api/:path*',
    '/dashboard/:path*',
    '/admin/:path*',
    '/coordinators/:path*',
    '/researcher/:path*',
    '/organizations/:path*',
  ],
};