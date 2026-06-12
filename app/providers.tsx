"use client";

import { Inter } from "next/font/google";
import { usePathname } from "next/navigation";
import { useState } from "react";

import Sidebar from "@/components/shared/Sidebar";

const inter = Inter({
  subsets: ["latin"],
});

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const [collapsed, setCollapsed] =
    useState(false);

  const noSidebarRoutes = [
    "/",
    "/login",
    "/signup",
    "/signup/user",
    "/signup/organizations",
    "/forgot-password",
  ];

  const showSidebar =
    !noSidebarRoutes.includes(pathname);

  return (
    <div
      className={`${inter.className} bg-slate-100`}
    >
      <div className="flex min-h-screen">

        {showSidebar && (
          <Sidebar
            collapsed={collapsed}
            onToggle={() =>
              setCollapsed(!collapsed)
            }
          />
        )}

        <main className="flex-1 overflow-x-hidden">
          {children}
        </main>

      </div>
    </div>
  );
}