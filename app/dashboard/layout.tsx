// app/dashboard/layout.tsx (or app/layout.tsx if you have one)
"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Check if user exists in localStorage
      const userStr = localStorage.getItem("user");
      const token = localStorage.getItem("token");

      console.log("Checking auth - User:", userStr);
      console.log("Checking auth - Token:", token);

      if (!userStr || !token) {
        console.log("No user or token found, redirecting to login");
        router.push("/login");
        return;
      }

      const user = JSON.parse(userStr);
      console.log("User role:", user.role);

      // Check if user is approved
      if (user.status !== "Approved") {
        console.log("User not approved, status:", user.status);
        router.push("/login?message=Account pending approval");
        return;
      }

      setIsAuthenticated(true);
    } catch (error) {
      console.error("Auth check error:", error);
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  // Public routes that don't need authentication
  const publicRoutes = ["/login", "/signup", "/signup/user", "/signup/organizations", "/forgot-password", "/reset-password", "/terms", "/privacy"];
  
  if (publicRoutes.includes(pathname)) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-300">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}