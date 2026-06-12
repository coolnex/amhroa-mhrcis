"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";
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
  FolderOpen,
  Database,
  FileText,
  ClipboardList,
  ChevronDown,
  ChevronUp,
  Users,
  Building2,
  BookOpen,
  Handshake,
  Briefcase,
  Eye,
  AlertTriangle,
  LogOut,
  Heart,
  Mail,
} from "lucide-react";

// User role types
type UserRole = "admin" | "policymaker" | "researcher" | "cso" | "coordinator" | "donor" | "mental_health_professional" | "public";

// Role display names
const roleDisplayNames: Record<UserRole, string> = {
  admin: "System Administrator",
  policymaker: "Policy Director",
  researcher: "Research Lead",
  cso: "CSO Director",
  coordinator: "Country Coordinator",
  donor: "Investment Director",
  mental_health_professional: "Mental Health Professional",
  public: "Public User",
};

// Role badges
const roleBadges: Record<UserRole, { color: string; bg: string }> = {
  admin: { color: "text-purple-400", bg: "bg-purple-500/20" },
  policymaker: { color: "text-cyan-400", bg: "bg-cyan-500/20" },
  researcher: { color: "text-blue-400", bg: "bg-blue-500/20" },
  cso: { color: "text-emerald-400", bg: "bg-emerald-500/20" },
  coordinator: { color: "text-orange-400", bg: "bg-orange-500/20" },
  donor: { color: "text-yellow-400", bg: "bg-yellow-500/20" },
  mental_health_professional: { color: "text-pink-400", bg: "bg-pink-500/20" },
  public: { color: "text-slate-400", bg: "bg-slate-500/20" },
};

// Navigation groups with role-based access
const navigationGroups = {
  continental: {
    label: "CONTINENTAL OVERSIGHT",
    icon: Globe,
    roles: ["admin"],
    links: [
      { name: "Executive Dashboard", href: "/executive-dashboard", icon: Crown },
      { name: "Admin Panel", href: "/admin", icon: Shield },
      { name: "System Health", href: "/system-health", icon: Activity },
      { name: "Governance Alerts", href: "/governance-alerts", icon: AlertTriangle },
      { name: "Research Library", href: "/research-library", icon: Bot },
    ],
  },
  intelligence: {
    label: "INTELLIGENCE HUB",
    icon: TrendingUp,
    roles: ["admin", "policymaker", "donor", "researcher", "mental_health_professional"],
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
    roles: ["admin", "policymaker", "researcher", "mental_health_professional"],
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
    roles: ["admin", "researcher", "cso", "coordinator", "mental_health_professional"],
    links: [
      { name: "Repository", href: "/repository", icon: FolderGit2 },
      { name: "Submissions", href: "/submissions", icon: FileCheck },
    ],
  },
  collaboration: {
    label: "COLLABORATION",
    icon: Handshake,
    roles: ["cso", "coordinator", "researcher", "mental_health_professional"],
    links: [
      { name: "Organizations", href: "/organizations", icon: Building2 },
      { name: "Research Hub", href: "/research-hub", icon: BookOpen },
      { name: "Coalitions", href: "/coalitions", icon: Users },
    ],
  },
  datacollection: {
    label: "DATA COLLECTION",
    icon: Database,
    roles: ["admin", "researcher", "cso", "coordinator", "mental_health_professional"],
    links: [
      { name: "Submit Report", href: "/data-collection/submit-report", icon: FileText },
      { name: "Field Reports", href: "/data-collection/field-reports", icon: AlertTriangle },
      { name: "Surveys", href: "/data-collection/surveys", icon: ClipboardList },
      { name: "My Submissions", href: "/data-collection/my-submissions", icon: FolderOpen },
    ],
  },
};

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export default function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [userRole, setUserRole] = useState<UserRole>("public");
  const [userName, setUserName] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");
  const [expandedGroups, setExpandedGroups] = useState<string[]>([
    "intelligence",
    "analysis",
  ]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUserSession();
  }, []);

  const checkUserSession = async () => {
    setLoading(true);
    try {
      // Get session from Supabase
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setIsAuthenticated(false);
        setUserRole("public");
        
        // Check if current route requires authentication
        const isPublicRoute = 
          pathname === "/" ||
          pathname === "/login" ||
          pathname === "/signup" ||
          pathname === "/signup/user" ||
          pathname === "/signup/organizations" ||
          pathname === "/about" ||
          pathname === "/contact" ||
          pathname === "/forgot-password" ||
          pathname.startsWith("/public");
        
        if (!isPublicRoute && pathname !== "/") {
          router.push("/login");
        }
        setLoading(false);
        return;
      }
      
      // User is authenticated
      setIsAuthenticated(true);
      
      // Get user role from metadata or localStorage
      let role = session.user.user_metadata?.role || "public";
      
      // Also check users table for role if not in metadata
      if (role === "public") {
        const { data: userData } = await supabase
          .from("users")
          .select("role")
          .eq("id", session.user.id)
          .single();
        
        if (userData?.role) {
          role = userData.role.toLowerCase();
        }
      }
      
      setUserRole(role as UserRole);
      setUserName(session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "User");
      setUserEmail(session.user.email || "");
      
    } catch (error) {
      console.error("Error checking user session:", error);
      setIsAuthenticated(false);
      setUserRole("public");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  // Filter groups based on user role
  const visibleGroups = Object.entries(navigationGroups).filter(
    ([_, group]) => group.roles.includes(userRole)
  );

  const isActiveLink = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  const toggleGroup = (groupKey: string) => {
    setExpandedGroups((prev) =>
      prev.includes(groupKey)
        ? prev.filter((g) => g !== groupKey)
        : [...prev, groupKey]
    );
  };

  // Show loading state
  if (loading) {
    return (
      <aside className={`relative bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 text-white transition-all duration-300 ${collapsed ? "w-20" : "w-80"} min-h-screen flex flex-col shadow-2xl border-r border-slate-700/50 z-50`}>
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </aside>
    );
  }

  // Don't render sidebar for public users or unauthenticated
  if (!isAuthenticated || userRole === "public") {
    return null;
  }

  const roleBadge = roleBadges[userRole] || roleBadges.public;
  const roleDisplay = roleDisplayNames[userRole] || "User";

  // Get user initials for avatar
  const getUserInitials = () => {
    if (userName) {
      return userName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    }
    return roleDisplay.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <aside
      className={`relative bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 text-white transition-all duration-300 ${
        collapsed ? "w-20" : "w-80"
      } min-h-screen flex flex-col shadow-2xl border-r border-slate-700/50 z-50`}
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
      <div className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="AMHROA"
            width={48}
            height={48}
          />

          {!collapsed && (
            <div>
              <h1 className="text-xl font-bold">
                AMHROA
              </h1>

              <p className="text-xs text-slate-400">
                Mental Health Reform Observatory
              </p>
            </div>
          )}
        </div>

      {/* User Role Indicator */}
      {!collapsed && (
        <div className="mx-4 mt-4 p-3 bg-slate-800/50 rounded-xl border border-slate-700">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full ${roleBadge.bg} flex items-center justify-center`}>
              <span className={`text-white font-bold text-sm ${roleBadge.color}`}>
                {getUserInitials()}
              </span>
            </div>
            <div className="flex-1">
              <p className="text-white text-sm font-semibold truncate">{userName || roleDisplay}</p>
              <p className={`text-xs ${roleBadge.color}`}>{roleDisplay}</p>
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
                            ${collapsed ? "justify-center" : "justify-start"}
                            ${
                              isActive
                                ? "bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border border-cyan-500/30 text-cyan-300 shadow-lg"
                                : "text-slate-300 hover:bg-slate-800/50 hover:text-cyan-300"
                            }
                          `}
                          title={collapsed ? link.name : undefined}
                        >
                          <LinkIcon className={`w-5 h-5 ${isActive ? "text-cyan-400" : ""}`} />
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

      {/* Logout Button */}
      <div className="p-4 border-t border-slate-700/50">
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-slate-300 hover:bg-red-600/20 hover:text-red-400 ${
            collapsed ? "justify-center" : "justify-start"
          }`}
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>

      {/* Footer Stats */}
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
}

// CSS for custom scrollbar (add to your global CSS file)
export const scrollbarStyles = `
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #1e293b;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #06b6d4;
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #0891b2;
}
`;