"use client";

import { Inter } from "next/font/google";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import Sidebar from "@/components/shared/Sidebar";
import { ChatWidget } from "@/components/Chat/ChatWidget";
import Link from "next/link";
import { chatService } from "@/lib/chat-service";
import { Users } from "lucide-react";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

// Initialize Supabase client outside component scope
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

export function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  const isLoginPage = pathname === "/login" || pathname === "/";

  const noSidebarRoutes = [
    "/",
    "/login",
    "/signup",
    "/signup/user",
    "/signup/organizations",
    "/forgot-password",
    "/public",
  ];

  const showSidebar = !noSidebarRoutes.includes(pathname);

  // 1. Prevent Hydration Mismatch: Wait for client mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // 2. Synchronized Authentication State Hydration
  useEffect(() => {
    if (!mounted) return;

    const checkUserSession = async () => {
      setIsLoading(true);
      try {
        // First priority: Pull existing active user metadata from localStorage to prevent sync splits
        const localUserStr = localStorage.getItem("user");
        if (localUserStr) {
          try {
            const parsedLocalUser = JSON.parse(localUserStr);
            if (parsedLocalUser && parsedLocalUser.id) {
              setUser(parsedLocalUser);
              setIsAuthenticated(true);
              setIsAdmin(parsedLocalUser.role === "Admin" || parsedLocalUser.role === "Mental_Health_Professional");
              chatService.reset();
              setIsLoading(false);
              return; // Session resolved successfully from existing login state
            }
          } catch (e) {
            console.error("❌ Failed to parse local user state layout:", e);
            localStorage.removeItem("user");
          }
        }

        // Secondary fallback: Check native Supabase token cookies
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          setIsAuthenticated(true);
          setIsAdmin(session.user.user_metadata?.role === "Admin");
          chatService.reset();
        } else {
          setUser(null);
          setIsAuthenticated(false);
          setIsAdmin(false);
          if (!isLoginPage) {
            chatService.cleanup();
          }
        }
      } catch (error) {
        console.error("Auth hydration error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkUserSession();

    // Listen to real-time session updates (Logins, Logouts, Token Refreshes)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
        setIsAuthenticated(true);
        setIsAdmin(session.user.user_metadata?.role === "Admin");
        chatService.reset();
      } else {
        setUser(null);
        setIsAuthenticated(false);
        setIsAdmin(false);
        if (!isLoginPage) {
          chatService.cleanup();
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [mounted, isLoginPage]);

  // 3. Fallback view during SSR and prior to mount to prevent structure mismatch
  if (!mounted) {
    return (
      <div className={`${inter.variable} bg-slate-900 min-h-screen`}>
        <div className="flex items-center justify-center h-screen">
          <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  // 4. Loading Spinner while evaluating local storage and Supabase session state
  if (isLoading) {
    return (
      <div className={`${inter.variable} bg-slate-900 min-h-screen flex items-center justify-center`}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${inter.variable} bg-slate-100 min-h-screen`}>
      <div className="flex min-h-screen">
        {showSidebar && (
          <Sidebar
            collapsed={collapsed}
            onToggle={() => setCollapsed(!collapsed)}
          />
        )}

        <main className={`flex-1 overflow-x-hidden transition-all duration-300 ${showSidebar ? '' : 'w-full'}`}>
          {children}
        </main>
      </div>

      {/* User Chat - Only available when authenticated */}
      {isAuthenticated && user && (
        <>
          <ChatWidget 
            userId={user.id} 
            userRole={user.role || user.user_metadata?.role}
          />
          
          {/* Admin Chat Button - only for admins */}
          {isAdmin && (
            <Link
              href="/admin/chat"
              className="fixed bottom-24 right-6 z-50 p-3 bg-purple-600 hover:bg-purple-700 rounded-full shadow-lg transition-colors group"
            >
              <Users className="w-5 h-5 text-white" />
              <span className="absolute right-full mr-2 top-1/2 -translate-y-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Admin Chat
              </span>
            </Link>
          )}
        </>
      )}
    </div>
  );
}
