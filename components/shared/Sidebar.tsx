"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Globe,
  Activity,
  Map,
  BarChart3,
  Bot,
  Star,
  FolderGit2,
  FileCheck,
  Shield,
  GitCompare,
  Trophy,
  Target,
  Lightbulb,
  TrendingUp,
  Crown,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Users,
  Building2,
  BookOpen,
  Handshake,
  Briefcase,
  Eye,
  AlertTriangle,
} from "lucide-react";

// Role-based navigation groups
const navigationGroups = {
  continental: {
    label: "CONTINENTAL OVERSIGHT",
    icon: Globe,
    roles: ["admin", "executive"],
    links: [
      { name: "Executive Dashboard", href: "/executive-dashboard", icon: Crown },
      { name: "Admin Panel", href: "/admin", icon: Shield },
      { name: "System Health", href: "/system-health", icon: Activity },
      { name: "Governance Alerts", href: "/governance-alerts", icon: AlertTriangle },
    ],
  },
  intelligence: {
    label: "INTELLIGENCE HUB",
    icon: TrendingUp,
    roles: ["admin", "policymaker", "donor", "executive"],
    links: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { name: "Analytics", href: "/analytics", icon: BarChart3 },
      { name: "AI Scoring", href: "/ai-scoring", icon: Star },
      { name: "AI Country Profile", href: "/ai-country-profile", icon: Bot },
      { name: "SDG Intelligence", href: "/sdg-intelligence", icon: Target },
      { name: "Reform Intelligence", href: "/reform-intelligence", icon: Lightbulb },
      { name: "Donor Intelligence", href: "/donor-intelligence", icon: TrendingUp },
      { name: "AI Policy", href: "/ai-policy", icon: Bot },
    ],
  },
  analysis: {
    label: "COMPARATIVE ANALYSIS",
    icon: GitCompare,
    roles: ["admin", "policymaker", "researcher", "executive"],
    links: [
      { name: "Countries", href: "/countries", icon: Globe },
      { name: "Heatmap", href: "/heatmap", icon: Map },
      { name: "Compare", href: "/compare", icon: GitCompare },
      { name: "Rankings", href: "/rankings", icon: Trophy },
    ],
  },
  repository: {
    label: "KNOWLEDGE REPOSITORY",
    icon: FolderGit2,
    roles: ["admin", "researcher", "cso", "coordinator"],
    links: [
      { name: "Repository", href: "/repository", icon: FolderGit2 },
      { name: "Submissions", href: "/submissions", icon: FileCheck },
    ],
  },
  collaboration: {
    label: "COLLABORATION",
    icon: Handshake,
    roles: ["cso", "coordinator", "researcher"],
    links: [
      { name: "CSO Network", href: "/cso-network", icon: Building2 },
      { name: "Research Hub", href: "/research-hub", icon: BookOpen },
      { name: "Coalitions", href: "/coalitions", icon: Users },
    ],
  },
  public: {
    label: "PUBLIC PORTAL",
    icon: Eye,
    roles: ["public"],
    links: [
      { name: "Public Dashboard", href: "/public", icon: Eye },
      { name: "Country Profiles", href: "/public/countries", icon: Globe },
      { name: "Educational Resources", href: "/public/resources", icon: BookOpen },
    ],
  },
};

// Mock user role - would come from auth context
const USER_ROLE = "executive"; // Change this based on logged-in user

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;

  variant?: string;
  activeItem?: string;
  userRole?: string;
  userName?: string;
}

export default function Sidebar({
  collapsed = false,
  onToggle,
  variant,
  activeItem,
  userRole,
  userName,
}: SidebarProps) {
  const pathname = usePathname();
  const [expandedGroups, setExpandedGroups] = useState<string[]>([
    "intelligence",
    "analysis",
  ]);

  const toggleGroup = (groupKey: string) => {
    setExpandedGroups((prev) =>
      prev.includes(groupKey)
        ? prev.filter((g) => g !== groupKey)
        : [...prev, groupKey]
    );
  };

  // Filter groups based on user role
  const visibleGroups = Object.entries(navigationGroups).filter(
    ([_, group]) => group.roles.includes(USER_ROLE)
  );

  const isActiveLink = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={`relative bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 text-white transition-all duration-300 ${
        collapsed ? "w-20" : "w-80"
      } min-h-screen flex flex-col shadow-2xl border-r border-slate-700/50`}
    >
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-20 bg-slate-700 hover:bg-cyan-600 rounded-full p-1.5 border-2 border-slate-800 transition-all z-50"
      >
        {collapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </button>

      {/* Logo Section */}
      <div className={`p-6 border-b border-slate-700/50 ${collapsed ? "text-center" : ""}`}>
        {!collapsed ? (
          <>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              MHRCIS
            </h1>
            <p className="text-slate-400 text-xs mt-2 tracking-wide">
              CONTINENTAL INTELLIGENCE PLATFORM
            </p>
            <div className="mt-3 flex items-center gap-2 text-xs">
              <span className="px-2 py-0.5 bg-cyan-600/20 text-cyan-300 rounded-full border border-cyan-500/30">
                v3.0.1
              </span>
              <span className="px-2 py-0.5 bg-emerald-600/20 text-emerald-300 rounded-full border border-emerald-500/30">
                LIVE
              </span>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center">
            <Crown className="w-8 h-8 text-cyan-400" />
            <div className="w-6 h-0.5 bg-cyan-500/50 mt-2"></div>
          </div>
        )}
      </div>

      {/* User Role Indicator (Executive Style) */}
      {!collapsed && (
        <div className="mx-4 mt-4 p-3 bg-slate-800/50 rounded-xl border border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">AD</span>
            </div>
            <div className="flex-1">
            <p className="text-white text-sm font-semibold">
                {userName || "Dr. Alagie Zakare"}
              </p>

              <p className="text-slate-400 text-xs">
                {userRole || "Continental Policy Director"}
              </p>
            </div>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 custom-scrollbar">
        <div className="space-y-6">
          {visibleGroups.map(([groupKey, group]) => {
            const isExpanded = expandedGroups.includes(groupKey);
            const GroupIcon = group.icon;

            return (
              <div key={groupKey} className="px-3">
                {/* Group Header */}
                <button
                  onClick={() => toggleGroup(groupKey)}
                  className={`w-full flex items-center justify-between text-slate-400 text-xs font-semibold tracking-wider mb-2 hover:text-cyan-400 transition-colors ${
                    collapsed ? "justify-center" : "px-3"
                  }`}
                >
                  {!collapsed && (
                    <>
                      <span className="flex items-center gap-2">
                        <GroupIcon className="w-3.5 h-3.5" />
                        {group.label}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </>
                  )}
                  {collapsed && <GroupIcon className="w-4 h-4" />}
                </button>

                {/* Group Links */}
                {(isExpanded || collapsed) && (
                  <div className="space-y-1">
                    {group.links.map((link) => {
                      const isActive = isActiveLink(link.href);
                      const LinkIcon = link.icon;

                      return (
                        <Link
                          key={link.href}
                          href={link.href}
                          className={`
                            flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
                            ${
                              collapsed
                                ? "justify-center"
                                : "justify-start"
                            }
                            ${
                              isActive
                                ? "bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border border-cyan-500/30 text-cyan-300 shadow-lg"
                                : "text-slate-300 hover:bg-slate-800/50 hover:text-cyan-300"
                            }
                          `}
                          title={collapsed ? link.name : undefined}
                        >
                          <LinkIcon
                            className={`w-5 h-5 ${isActive ? "text-cyan-400" : ""}`}                        />
                          {!collapsed && (
                            <span className="text-sm font-medium">
                              {link.name}
                            </span>
                          )}
                          {isActive && !collapsed && (
                            <div className="ml-auto w-1 h-6 bg-cyan-400 rounded-full"></div>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </nav>

      {/* Footer Stats (Executive Style) */}
      {!collapsed && (
        <div className="p-4 border-t border-slate-700/50 space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">Active Countries</span>
            <span className="text-cyan-400 font-mono font-bold">54/54</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">AI Confidence</span>
            <span className="text-emerald-400 font-mono font-bold">94.7%</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-1 mt-2">
            <div className="bg-gradient-to-r from-cyan-500 to-blue-500 h-1 rounded-full w-3/4"></div>
          </div>
          <p className="text-slate-500 text-xs text-center mt-3">
            Continental Intelligence Network
          </p>
        </div>
      )}

      {/* Collapsed Footer */}
      {collapsed && (
        <div className="p-4 border-t border-slate-700/50 flex justify-center">
          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          </div>
        </div>
      )}
    </aside>
  );
};