// providers/ChatProvider.tsx
"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ChatWidget } from "@/components/Chat/ChatWidget";
import { supabase } from "@/lib/supabase";

interface ChatContextType {
  userId: string | null;
  userRole: string | null;
  setUser: (user: any) => void;
  isChatVisible: boolean;
}

const ChatContext = createContext<ChatContextType>({
  userId: null,
  userRole: null,
  setUser: () => {},
  isChatVisible: false,
});

export const useChatContext = () => useContext(ChatContext);

// Pages where chat should be hidden
const PUBLIC_PAGES = [
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/",
  "/about",
  "/contact",
  "/privacy",
  "/terms",
];

export function ChatProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      setIsLoading(true);
      
      // 1. Check localStorage first
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          const userData = JSON.parse(userStr);
          if (userData && userData.id && userData.status === "Approved") {
            setUserId(userData.id);
            setUserRole(userData.role);
            setIsAuthenticated(true);
            setIsLoading(false);
            return;
          }
        } catch (e) {
          localStorage.removeItem("user");
        }
      }

      // 2. Check Supabase session
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: userData } = await supabase
          .from("users")
          .select("id, role, status")
          .eq("auth_user_id", session.user.id)
          .single();

        if (userData && userData.status === "Approved") {
          setUserId(userData.id);
          setUserRole(userData.role);
          setIsAuthenticated(true);
          localStorage.setItem("user", JSON.stringify(userData));
        }
      }
    } catch (error) {
      console.error("Error checking user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Check if we're on a public page
  const isPublicPage = PUBLIC_PAGES.some(page => pathname?.startsWith(page)) || 
                       pathname?.includes("/auth/") ||
                       pathname?.includes("/public/");

  // Chat is visible only if:
  // 1. User is authenticated
  // 2. Not on a public page
  // 3. User has a valid UUID
  const isChatVisible = isAuthenticated && 
                        !isPublicPage && 
                        userId !== null && 
                        userId !== "undefined" &&
                        userId.length > 10;

  console.log("💬 Chat visibility:", {
    isAuthenticated,
    isPublicPage,
    userId,
    isChatVisible,
    pathname
  });

  return (
    <ChatContext.Provider value={{ 
      userId, 
      userRole, 
      setUser: (user: any) => {
        if (user) {
          setUserId(user.id);
          setUserRole(user.role);
          setIsAuthenticated(true);
        } else {
          setUserId(null);
          setUserRole(null);
          setIsAuthenticated(false);
        }
      },
      isChatVisible 
    }}>
      {children}
      {isChatVisible && userId && (
        <ChatWidget 
          userId={userId} 
          userRole={userRole || undefined} 
        />
      )}
    </ChatContext.Provider>
  );
}