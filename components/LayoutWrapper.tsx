// app/components/LayoutWrapper.tsx
"use client";

import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Load collapsed state from localStorage
    const savedState = localStorage.getItem("sidebarCollapsed");
    if (savedState) {
      setCollapsed(JSON.parse(savedState));
    }
  }, []);

  const handleToggle = () => {
    const newState = !collapsed;
    setCollapsed(newState);
    localStorage.setItem("sidebarCollapsed", JSON.stringify(newState));
  };

  if (!isMounted) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-slate-900">
      <Sidebar collapsed={collapsed} onToggle={handleToggle} />
      <main 
        className={`flex-1 transition-all duration-300 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 ${
          collapsed ? "ml-20" : "ml-80"
        } h-screen overflow-y-auto`}
      >
        {children}
      </main>
    </div>
  );
}