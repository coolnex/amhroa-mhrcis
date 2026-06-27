"use client";

import { supabase } from "@/lib/supabase";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Globe,
  Activity,
  Map,
  BarChart3,
  Bot,
  Star,
  Flag,
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
  DollarSign,
  Award,
} from "lucide-react";

// User role types - including combined coordinator roles
type UserRole = 
  | "Admin" 
  | "Policymaker" 
  | "Researcher" 
  | "CSO" 
  | "Coordinator" 
  | "Donor" 
  | "Mental_Health_Professional" 
  | "public"
  | "policymaker_coordinator"
  | "researcher_coordinator"
  | "mental_health_coordinator"
  | "cso_coordinator"
  | "donor_coordinator"
  | "admin_coordinator";

// Role display names
const roleDisplayNames: Record<UserRole, string> = {
  Admin: "System Administrator",
  Policymaker: "Policy Director",
  Researcher: "Research Lead",
  CSO: "CSO Director",
  Coordinator: "Country Coordinator",
  Donor: "Investment Director",
  Mental_Health_Professional: "Mental Health Professional",
  public: "Public User",
  policymaker_coordinator: "Policy Director & Country Coordinator",
  researcher_coordinator: "Research Lead & Country Coordinator",
  mental_health_coordinator: "Mental Health Professional & Country Coordinator",
  cso_coordinator: "CSO Director & Country Coordinator",
  donor_coordinator: "Investment Director & Country Coordinator",
  admin_coordinator: "Administrator & Country Coordinator",
};

// Role badges
const roleBadges: Record<UserRole, { color: string; bg: string }> = {
  Admin: { color: "text-purple-400", bg: "bg-purple-500/20" },
  Policymaker: { color: "text-cyan-400", bg: "bg-cyan-500/20" },
  Researcher: { color: "text-blue-400", bg: "bg-blue-500/20" },
  CSO: { color: "text-emerald-400", bg: "bg-emerald-500/20" },
  Coordinator: { color: "text-orange-400", bg: "bg-orange-500/20" },
  Donor: { color: "text-yellow-400", bg: "bg-yellow-500/20" },
  Mental_Health_Professional: { color: "text-pink-400", bg: "bg-pink-500/20" },
  public: { color: "text-slate-400", bg: "bg-slate-500/20" },
  policymaker_coordinator: { color: "text-cyan-400", bg: "bg-gradient-to-r from-cyan-500/20 to-orange-500/20" },
  researcher_coordinator: { color: "text-blue-400", bg: "bg-gradient-to-r from-blue-500/20 to-orange-500/20" },
  mental_health_coordinator: { color: "text-pink-400", bg: "bg-gradient-to-r from-pink-500/20 to-orange-500/20" },
  cso_coordinator: { color: "text-emerald-400", bg: "bg-gradient-to-r from-emerald-500/20 to-orange-500/20" },
  donor_coordinator: { color: "text-yellow-400", bg: "bg-gradient-to-r from-yellow-500/20 to-orange-500/20" },
  admin_coordinator: { color: "text-purple-400", bg: "bg-gradient-to-r from-purple-500/20 to-orange-500/20" },
};

// Helper function to get base role (removes _coordinator suffix)
const getBaseRole = (role: string): UserRole => {
  if (role.endsWith("_coordinator")) {
    const baseRole = role.replace("_coordinator", "") as UserRole;
    // Map mental_health to mental_health_professional
    if (baseRole === "mental_health" as UserRole) return "Mental_Health_Professional";
    return baseRole;
  }
  return role as UserRole;
};

// Check if role has coordinator access
const hasCoordinatorAccess = (role: string): boolean => {
  return role.endsWith("_coordinator") || role === "coordinator" || role === "Admin";
};

// Navigation groups with role-based access
const navigationGroups = {
  continental: {
    label: "CONTINENTAL OVERSIGHT",
    icon: Globe,
    roles: ["Admin", "admin_coordinator"],
    links: [
      { name: "Executive Dashboard", href: "/executive-dashboard", icon: Crown },
      { name: "Admin Panel", href: "/admin", icon: Shield },
      { name: "System Health", href: "/system-health", icon: Activity },
      { name: "Governance Alerts", href: "/governance-alerts", icon: AlertTriangle },
      { name: "Research Library", href: "/research-library", icon: Bot },
      { name: "Surveys", href: "/admin/surveys", icon: FileText },
    ],
  },
  intelligence: {
    label: "INTELLIGENCE HUB",
    icon: TrendingUp,
    roles: ["Admin", "admin_coordinator", "Policymaker", "policymaker_coordinator", "donor", "donor_coordinator", "researcher", "researcher_coordinator", "mental_health_professional", "mental_health_coordinator"],
    links: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { name: "Analytics", href: "/analytics", icon: BarChart3 },
      { name: "AI Scoring", href: "/ai-scoring", icon: Star },
      { name: "AI Country Profile", href: "/ai-country-profile", icon: Bot },
      { name: "SDG Intelligence", href: "/sdg-intelligence", icon: Target },
      { name: "Reform Intelligence", href: "/reform-intelligence", icon: Lightbulb },
      { name: "Agenda 2063", href: "/agenda2063", icon: Flag },
      { name: "AI Policy", href: "/ai-policy", icon: Bot },
    ],
  },
  analysis: {
    label: "COMPARATIVE ANALYSIS",
    icon: GitCompare,
    roles: ["Admin", "admin_coordinator", "Policymaker", "policymaker_coordinator", "researcher", "researcher_coordinator", "mental_health_professional", "mental_health_coordinator"],
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
    roles: ["Admin", "admin_coordinator", "researcher", "researcher_coordinator", "cso", "cso_coordinator", "coordinator", "mental_health_professional", "mental_health_coordinator", "donor", "donor_coordinator"],
    links: [
      { name: "Repository", href: "/repository", icon: FolderGit2 },
      { name: "Submissions", href: "/data-collection/submissions", icon: FileCheck },
      {name: "Continental Reforms", href: "/continental-reform-dashboard", icon: Globe},
    ],
  },
  collaboration: {
    label: "COLLABORATION",
    icon: Handshake,
    roles: ["cso", "cso_coordinator", "coordinator", "researcher", "researcher_coordinator", "mental_health_professional", "mental_health_coordinator", "donor", "donor_coordinator", "admin", "admin_coordinator"],
    links: [
      { name: "Organizations", href: "/organizations", icon: Building2 },
      { name: "Research Hub", href: "/repository", icon: BookOpen },
      { name: "Events & Networking", href: "/events", icon: Handshake },
      { name: "Advocacy Campaigns", href: "/advocacy-campaigns", icon:Flag },
    ],
  },
  datacollection: {
    label: "DATA COLLECTION",
    icon: Database,
    roles: ["Admin", "Policymaker", "admin_coordinator", "researcher", "researcher_coordinator", "cso", "cso_coordinator", "coordinator", "mental_health_professional", "mental_health_coordinator"],
    links: [
      { name: "Submit Report", href: "/data-collection/field-reports", icon: AlertTriangle },
      { name: "Surveys", href: "/data-collection/surveys", icon: ClipboardList },
      { name: "My Submissions", href: "/data-collection/submissions", icon: FolderOpen },
      { name: "Funding Requests", href: "/funding-requests", icon: Target },
    ],
  },
  investment: {
    label: "INVESTMENT & FUNDING",
    icon: DollarSign,
    roles: ["Admin", "admin_coordinator", "donor", "donor_coordinator"],
    links: [
      { name: "Donor Dashboard", href: "/donor", icon: Award },
      { name: "Funding Requests", href: "/funding-requests", icon: Target },
      { name: "Research Sponsorships", href: "/research-sponsorships", icon: Briefcase },
      { name: "Impact Reports", href: "/impact-reports", icon: FileText },
      { name: "Donor Intelligence", href: "/donor-intelligence", icon: TrendingUp },
      { name: "Investment Portfolio", href: "/investment-portfolio", icon: TrendingUp },
    ],
  },
  coordination: {
    label: "COUNTRY COORDINATION",
    icon: Flag,
    roles: ["coordinator", "policymaker_coordinator", "researcher_coordinator", "mental_health_coordinator", "cso_coordinator", "donor_coordinator", "admin_coordinator", "Admin"],
    links: [
      { name: "Coordinator Dashboard", href: "/coordinators", icon: Flag },
      { name: "Field Reports", href: "/data-collection/field-reports", icon: AlertTriangle },
      { name: "Local Organizations", href: "/organizations", icon: Building2 },
    ],
  },
  activities: {
    label: "WORKING GROUPS",
    icon: Users,
    roles: ["Admin", "Policymaker", "researcher", "mental_health_professional", "coordinator", "admin_coordinator", "policymaker_coordinator", "donor_coordinator", "researcher_coordinator", "mental_health_coordinator"],
    links: [
      { name: "All Working Groups", href: "/working-groups", icon: Users },
    ],
  },
  regionalexecutives: {
    label: "REGIONAL OVERSIGHT",
    icon: Globe,
    roles: ["admin", "regional_executive"],
    links: [
      { name: "Regional Dashboard", href: "/regional-executive", icon: Globe },
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
  const [userData, setUserData] = useState<any>(null);
  const [expandedGroups, setExpandedGroups] = useState<string[]>([
    "intelligence",
    "analysis",
    "investment",
    "coordination",
    "activities",
  ]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUserSession();
  }, [pathname]);

  const checkUserSession = async () => {
    setLoading(true);
    try {
      // First check localStorage for user profile (from login)
      const userStr = localStorage.getItem("user");
      
      console.log("🔍 Sidebar - Checking user session...");
      console.log("🔍 Sidebar - User string exists:", !!userStr);

      if (userStr) {
        try {
          const userData = JSON.parse(userStr);
          console.log("🔍 Sidebar - User data from localStorage:", userData);
          
          // Check if the user data is valid and has a role
          if (userData && userData.role) {
            setIsAuthenticated(true);
            setUserRole(userData.role as UserRole);
            setUserName(userData.full_name || userData.email?.split("@")[0] || "User");
            setUserEmail(userData.email || "");
            setUserData(userData);
            setLoading(false);
            console.log("✅ Sidebar - User authenticated via localStorage");
            return;
          }
        } catch (parseError) {
          console.error("Error parsing user data:", parseError);
          // If parsing fails, clear invalid data
          localStorage.removeItem("user");
        }
      }

      // If no valid localStorage, check Supabase session
      console.log("🔍 Sidebar - Checking Supabase session...");
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Session error:", sessionError);
      }

      if (!session) {
        console.log("❌ Sidebar - No session found");
        setIsAuthenticated(false);
        setUserRole("public");
        
        // Check if current route requires authentication
        const isPublicRoute = 
          pathname === "/" ||
          pathname === "/login" ||
          pathname === "/signup" ||
          pathname === "/signup/user" ||
          pathname === '/reset-password' ||  
          pathname === "/signup/organizations" ||
          pathname === "/about" ||
          pathname === "/contact" ||
          pathname === "/forgot-password" ||
          pathname === "/terms" ||
          pathname === "/privacy" ||
          pathname.startsWith("/public");
        
        if (!isPublicRoute && pathname !== "/") {
          console.log("No auth, redirecting to login");
          router.push("/login");
        }
        setLoading(false);
        return;
      }
      
      // User is authenticated via Supabase
      console.log("✅ Sidebar - User authenticated via Supabase:", session.user.id);
      setIsAuthenticated(true);
      
      // Try to get role from user metadata first
      let role = session.user.user_metadata?.role || "public";
      
      // If role is still public or not set, check the users table
      if (role === "public") {
        console.log("🔍 Sidebar - Looking up role in users table...");
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("role, full_name, email")
          .eq("auth_user_id", session.user.id)  // Use auth_user_id
          .single();
        
        if (userError) {
          console.error("Error fetching user data:", userError);
        } else if (userData) {
          console.log("🔍 Sidebar - User data from DB:", userData);
          role = userData.role || "public";
          setUserData(userData);
          setUserName(userData.full_name || session.user.email?.split("@")[0] || "User");
          setUserEmail(userData.email || session.user.email || "");
        }
      }
      
      // If role is still not set, use default
      if (!role || role === "public") {
        role = "public";
      }
      
      console.log("🔍 Sidebar - Final role:", role);
      setUserRole(role as UserRole);
      
      // If we haven't set user name yet, use from session
      if (!userName) {
        setUserName(session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "User");
        setUserEmail(session.user.email || "");
      }
      
    } catch (error) {
      console.error("❌ Error checking user session:", error);
      setIsAuthenticated(false);
      setUserRole("public");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      console.log("🚪 Logging out...");
      
      // Clear localStorage
      localStorage.removeItem("user");
      localStorage.removeItem("session");
      localStorage.removeItem("token");
      
      // Clear cookies if any
      document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Logout error:", error);
      }
      
      // Reset state
      setIsAuthenticated(false);
      setUserRole("public");
      setUserData(null);
      
      // Redirect to login
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Filter groups based on user role
  const visibleGroups = Object.entries(navigationGroups).filter(
    ([_, group]) => {
      // Check if user role matches any role in the group
      return group.roles.some(role => 
        role.toLowerCase() === userRole.toLowerCase() ||
        // Check for coordinator variations
        (userRole.endsWith("_coordinator") && role === userRole.replace("_coordinator", "")) ||
        (userRole === "Coordinator" && role === "coordinator")
      );
    }
  );

  const isActiveLink = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname?.startsWith(href);
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
      const parts = userName.split(" ");
      if (parts.length >= 2) {
        return parts[0][0] + parts[1][0];
      }
      return userName.slice(0, 2).toUpperCase();
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
      <div className={`p-6 border-b border-slate-700/50 ${collapsed ? "text-center" : ""}`}>
        {!collapsed ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                AMHROA
              </h1>
              <p className="text-slate-400 text-xs">Mental Health Reform Observatory</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <Heart className="w-8 h-8 text-cyan-400" />
            <div className="w-6 h-0.5 bg-cyan-500/50 mt-2"></div>
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
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-semibold truncate">{userName || roleDisplay}</p>
              <p className={`text-xs ${roleBadge.color} truncate`}>{roleDisplay}</p>
            </div>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse flex-shrink-0"></div>
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
                          <LinkIcon className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-cyan-400" : ""}`} />
                          {!collapsed && (
                            <span className="text-sm font-medium truncate">
                              {link.name}
                            </span>
                          )}
                          {isActive && !collapsed && (
                            <div className="ml-auto w-1 h-6 bg-cyan-400 rounded-full flex-shrink-0"></div>
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
          <LogOut className="w-5 h-5 flex-shrink-0" />
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
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">Active Investments</span>
            <span className="text-yellow-400 font-mono font-bold">$2.4M</span>
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