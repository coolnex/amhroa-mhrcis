// components/LogoutButton.tsx
"use client";

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { chatService } from "@/lib/chat-service";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // Clean up chat service first
      await chatService.cleanup();
      
      // Clear localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      
      // Clear cookies if any
      document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      // Redirect to login
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      // Force redirect even on error
      router.push("/login");
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 rounded-xl border border-red-500/30 text-red-400 transition-colors"
    >
      <LogOut className="w-4 h-4" />
      <span className="text-sm hidden sm:inline">Logout</span>
    </button>
  );
}