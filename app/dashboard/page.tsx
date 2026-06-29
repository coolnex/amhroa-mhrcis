// app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdvocacyWidget } from "@/components/dashboard/AdvocacyWidget";
import { AlertsWidget } from "@/components/AlertsWidget";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

import {
  LayoutDashboard,
  Users,
  Building2,
  FileText,
  TrendingUp,
  Target,
  Bell,
  Settings,
  LogOut,
  ChevronRight,
  Activity,
  Globe,
  Award,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  PieChart,
  MessageSquare,
  Star,
  Flame,
  Zap,
  Leaf,
  ArrowRight,
  Download,
  RefreshCw,
  UserCog,
  Home,
  Bot,
  Lightbulb,
  Flag,
  Sparkles,
  Brain,
  Network,
  Map,
  Compass,
  Radar,
  LineChart,
  Database,
  Cpu,
} from "lucide-react";

interface User {
  id: string;
  full_name: string;
  email: string;
  role: "Admin" | "Policymaker" | "Researcher" | "CSO" | "Coordinator" | "Donor" | "Mental_Health_Professional" | "coordinator" | "Regional_Executive" | "admin_coordinator" | "policymaker_coordinator" | "donor_coordinator" | "researcher_coordinator" | "mental_health_coordinator";
  country?: string;
  organization?: string;
  avatar?: string;
  status?: string;
}

interface DashboardMetric {
  title: string;
  value: number | string;
  change?: number;
  icon: any;
  color: string;
}

interface RecentActivity {
  id: string;
  action: string;
  description: string;
  timestamp: string;
  type: "success" | "warning" | "info" | "error";
}

interface QuickLink {
  title: string;
  href: string;
  description: string;
  icon: any;
  color?: string;
}

interface IntelligenceHubLink {
  name: string;
  href: string;
  icon: any;
  description: string;
  status?: "new" | "beta" | "active";
}

// Intelligence Hub Links
const INTELLIGENCE_HUB_LINKS: IntelligenceHubLink[] = [
  { 
    name: "Analytics", 
    href: "/analytics", 
    icon: BarChart3,
    description: "Advanced data analytics and visualization",
    status: "active"
  },
  { 
    name: "AI Scoring", 
    href: "/ai-scoring", 
    icon: Star,
    description: "AI-powered reform scoring system",
    status: "new"
  },
  { 
    name: "AI Country Profile", 
    href: "/ai-country-profile", 
    icon: Bot,
    description: "Intelligent country reform profiles",
    status: "active"
  },
  { 
    name: "SDG Intelligence", 
    href: "/sdg-intelligence", 
    icon: Target,
    description: "SDG alignment and tracking",
    status: "active"
  },
  { 
    name: "Reform Intelligence", 
    href: "/reform-intelligence", 
    icon: Lightbulb,
    description: "Reform progress and insights",
    status: "active"
  },
  { 
    name: "Agenda 2063", 
    href: "/agenda2063", 
    icon: Flag,
    description: "African Union Agenda 2063 tracking",
    status: "active"
  },
  { 
    name: "AI Policy", 
    href: "/ai-policy", 
    icon: Brain,
    description: "AI-driven policy recommendations",
    status: "new"
  },
  { 
    name: "Network Intelligence", 
    href: "/network-intelligence", 
    icon: Network,
    description: "Continental collaboration insights",
    status: "beta"
  },
  { 
    name: "Predictive Analytics", 
    href: "/predictive-analytics", 
    icon: Radar,
    description: "Forecast reform trajectories",
    status: "beta"
  },
  { 
    name: "Data Explorer", 
    href: "/data-explorer", 
    icon: Database,
    description: "Explore continental datasets",
    status: "active"
  },
  { 
    name: "Impact Intelligence", 
    href: "/impact-intelligence", 
    icon: Sparkles,
    description: "Measure reform impact",
    status: "active"
  },
];

// Role-specific configurations
const roleConfig: Record<string, any> = {
  Admin: {
    title: "Continental Control Center",
    description: "Platform governance and continental oversight dashboard",
    rolePath: "/admin",
    metrics: [
      { title: "Total Users", value: 1247, change: 12, icon: Users, color: "cyan" },
      { title: "Active Countries", value: 54, change: 0, icon: Globe, color: "emerald" },
      { title: "Pending Approvals", value: 23, change: -5, icon: Clock, color: "yellow" },
      { title: "System Health", value: "98%", change: 2, icon: Activity, color: "purple" },
    ],
    quickLinks: [
      { title: "User Management", href: "/admin", description: "Approve and manage users", icon: Users },
      { title: "Organization Approvals", href: "/organizations", description: "Review CSO applications", icon: Building2 },
      { title: "Reports Review", href: "/admin/reports", description: "Validate submissions", icon: FileText },
      { title: "System Settings", href: "/admin/settings", description: "Configure platform", icon: Settings },
    ],
  },
  Policymaker: {
    title: "National Reform Intelligence Center",
    description: "Policy decision support and reform analytics",
    rolePath: "/policymaker",
    metrics: [
      { title: "Country Reform Score", value: 74, change: 5, icon: TrendingUp, color: "cyan" },
      { title: "Legislative Progress", value: 68, change: 3, icon: Target, color: "blue" },
      { title: "Implementation Rate", value: "55%", change: 8, icon: Activity, color: "emerald" },
      { title: "Pending Policies", value: 4, change: -1, icon: Clock, color: "yellow" },
    ],
    quickLinks: [
      { title: "Country Dashboard", href: "/countries", description: "View reform progress", icon: Globe },
      { title: "Policy Timeline", href: "/policy-timeline", description: "Track legislation", icon: Calendar },
      { title: "AI Recommendations", href: "/ai-policy", description: "Strategic insights", icon: Star },
      { title: "Benchmarking", href: "/compare", description: "Compare countries", icon: BarChart3 },
    ],
  },
  Researcher: {
    title: "Intelligence Hub",
    description: "Continental evidence and publication system",
    rolePath: "/researcher",
    metrics: [
      { title: "Publications", value: 128, change: 15, icon: FileText, color: "cyan" },
      { title: "Citations", value: 342, change: 28, icon: Award, color: "purple" },
      { title: "Datasets", value: 47, change: 6, icon: BarChart3, color: "blue" },
      { title: "Active Projects", value: 12, change: 3, icon: Activity, color: "emerald" },
    ],
    quickLinks: [
      { title: "Repository", href: "/repository", description: "Access publications", icon: FileText },
      { title: "Data Explorer", href: "/data", description: "Analyze datasets", icon: BarChart3 },
      { title: "Collaboration Hub", href: "/collaborate", description: "Connect with peers", icon: Users },
      { title: "AI Research Assistant", href: "/ai-research", description: "Generate insights", icon: Star },
    ],
  },
  CSO: {
    title: "Civil Society Collaboration Hub",
    description: "Advocacy management and partnership tracking",
    rolePath: "/organizations",
    metrics: [
      { title: "Active Campaigns", value: 8, change: 2, icon: Target, color: "cyan" },
      { title: "Coalition Members", value: 24, change: 5, icon: Users, color: "emerald" },
      { title: "Reports Submitted", value: 16, change: 4, icon: FileText, color: "blue" },
      { title: "Impact Score", value: "78%", change: 6, icon: Award, color: "purple" },
    ],
    quickLinks: [
      { title: "Advocacy Tools", href: "/advocacy", description: "Launch campaigns", icon: Target },
      { title: "Coalition Hub", href: "/coalitions", description: "Manage partnerships", icon: Users },
      { title: "Funding Opportunities", href: "/funding", description: "Discover grants", icon: TrendingUp },
      { title: "Event Calendar", href: "/events", description: "Plan activities", icon: Calendar },
    ],
  },
  Coordinator: {
    title: "National Reporting Center",
    description: "Reform coordination and submission management",
    rolePath: "/coordinators",
    metrics: [
      { title: "Reports Due", value: 3, change: -2, icon: Clock, color: "yellow" },
      { title: "Submitted", value: 12, change: 4, icon: CheckCircle, color: "emerald" },
      { title: "Approval Rate", value: "92%", change: 3, icon: Award, color: "cyan" },
      { title: "Local Partners", value: 28, change: 6, icon: Users, color: "purple" },
    ],
    quickLinks: [
      { title: "Submit Report", href: "/submissions/new", description: "Upload new report", icon: FileText },
      { title: "Reform Tracker", href: "/reform-tracking", description: "Monitor progress", icon: TrendingUp },
      { title: "CSO Coordination", href: "/cso-coordination", description: "Partner management", icon: Users },
      { title: "Calendar", href: "/calendar", description: "View deadlines", icon: Calendar },
    ],
  },
  Regional_Executive: {
    title: "National Reporting Center",
    description: "Reform coordination and submission management",
    rolePath: "/coordinators",
    metrics: [
      { title: "Reports Due", value: 3, change: -2, icon: Clock, color: "yellow" },
      { title: "Submitted", value: 12, change: 4, icon: CheckCircle, color: "emerald" },
      { title: "Approval Rate", value: "92%", change: 3, icon: Award, color: "cyan" },
      { title: "Local Partners", value: 28, change: 6, icon: Users, color: "purple" },
    ],
    quickLinks: [
      { title: "Submit Report", href: "/submissions/new", description: "Upload new report", icon: FileText },
      { title: "Reform Tracker", href: "/reform-tracking", description: "Monitor progress", icon: TrendingUp },
      { title: "CSO Coordination", href: "/cso-coordination", description: "Partner management", icon: Users },
      { title: "Calendar", href: "/calendar", description: "View deadlines", icon: Calendar },
    ],
  },
  Donor: {
    title: "Investment Intelligence Center",
    description: "Funding coordination and impact analytics",
    rolePath: "/donor",
    metrics: [
      { title: "Funding Gap", value: "$245M", change: -12, icon: TrendingUp, color: "red" },
      { title: "Active Projects", value: 18, change: 4, icon: Target, color: "cyan" },
      { title: "ROI Potential", value: "82%", change: 5, icon: Award, color: "emerald" },
      { title: "High-Impact Countries", value: 12, change: 3, icon: Globe, color: "purple" },
    ],
    quickLinks: [
      { title: "Investment Map", href: "/donor/map", description: "View opportunities", icon: Globe },
      { title: "Project Pipeline", href: "/donor/projects", description: "Review proposals", icon: Target },
      { title: "Impact Reports", href: "/impact-reports", description: "Track outcomes", icon: BarChart3 },
      { title: "Funding Portfolio", href: "/donor/portfolio", description: "Manage investments", icon: TrendingUp },
    ],
  },
};

// Get recent activities based on role
const getRecentActivities = (role: string): RecentActivity[] => {
  const baseActivities = [
    { id: "1", action: "Report Submitted", description: "Q4 2024 Reform Report", timestamp: "2 hours ago", type: "success" as const },
    { id: "2", action: "AI Alert", description: "Implementation gap detected in Tanzania", timestamp: "5 hours ago", type: "warning" as const },
    { id: "3", action: "New Publication", description: "Mental Health Workforce Study", timestamp: "1 day ago", type: "info" as const },
    { id: "4", action: "Organization Approved", description: "Mental Health Africa", timestamp: "2 days ago", type: "success" as const },
  ];

  if (role === "Admin") {
    return [
      { id: "1", action: "User Approval", description: "15 new users pending", timestamp: "1 hour ago", type: "warning" as const },
      { id: "2", action: "System Update", description: "AI scoring engine deployed", timestamp: "3 hours ago", type: "success" as const },
      { id: "3", action: "Organization Request", description: "5 new CSO applications", timestamp: "1 day ago", type: "info" as const },
      { id: "4", action: "Report Review", description: "8 reports awaiting validation", timestamp: "2 days ago", type: "warning" as const },
    ];
  }
  return baseActivities;
};

// Get greeting based on time
const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

// Get current time
const getCurrentTime = (): string => {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("🔐 Dashboard - Verifying Supabase session...");
  
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
        if (sessionError || !session?.user) {
          console.log("No active Supabase session found, redirecting to login");
          router.push("/login");
          return;
        }
  
        const { data: userData, error: dbError } = await supabase
          .from("users")
          .select("id, full_name, email, role, status")
          .eq("id", session.user.id)
          .single();
  
        if (dbError || !userData) {
          console.error("User profile entry missing in database directory:", dbError?.message);
          router.push("/login");
          return;
        }
  
        console.log("Dashboard - Logged User profile role:", userData.role);
        
        if (userData.status !== "Approved") {
          console.log("User not approved, redirecting to login");
          router.push("/login?message=Account pending approval");
          return;
        }
        
        setUser(userData);
        setGreeting(getGreeting());
        setCurrentTime(getCurrentTime());
        setRecentActivities(getRecentActivities(userData.role));
        
        const interval = setInterval(() => {
          setCurrentTime(getCurrentTime());
        }, 60000);
        
        return () => clearInterval(interval);
      } catch (error) {
        console.error("Dashboard absolute error handling profile check:", error);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };
  
    checkAuth();
  }, [router]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const redirectUser = (role: string) => {
    console.log("🔍 Redirecting user with role:", role);
    
    const normalizedRole = role?.toLowerCase() || "";
    
    const roleMap: Record<string, string> = {
      "admin": "/admin",
      "policymaker": "/policymaker",
      "researcher": "/researcher",
      "cso": "/organizations",
      "coordinator": "/coordinators",
      "researcher_coordinator": "/coordinators",
      "cso_coordinator": "/coordinators",
      "mental_health_coordinator": "/coordinators",
      "policymaker_coordinator": "/coordinators",
      "donor_coordinator": "/coordinators",
      "admin_coordinator": "/coordinators",
      "donor": "/donor",
      "mental_health_professional": "/mental-health-professional",
      "regional_executive": "/regional-executive",
    };

    const path = roleMap[normalizedRole] || "/";
    window.location.href = path;
  };

  const getRoleDisplayName = (role: string): string => {
    const roleNames: Record<string, string> = {
      "admin": "Admin",
      "policymaker": "Policymaker",
      "researcher": "Researcher",
      "cso": "CSO",
      "coordinator": "Coordinator",
      "researcher_coordinator": "Research Coordinator",
      "cso_coordinator": "CSO Coordinator",
      "mental_health_coordinator": "Mental Health Coordinator",
      "policymaker_coordinator": "Policy Coordinator",
      "donor_coordinator": "Donor Coordinator",
      "admin_coordinator": "Admin Coordinator",
      "donor": "Donor",
      "mental_health_professional": "Mental Health Professional",
    };
    return roleNames[role?.toLowerCase() || ""] || role || "User";
  };

  const getMetricColorClasses = (color: string) => {
    const colors: Record<string, string> = {
      cyan: "bg-cyan-500/10 border-cyan-500/20 text-cyan-400",
      emerald: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
      yellow: "bg-yellow-500/10 border-yellow-500/20 text-yellow-400",
      purple: "bg-purple-500/10 border-purple-500/20 text-purple-400",
      blue: "bg-blue-500/10 border-blue-500/20 text-blue-400",
      red: "bg-red-500/10 border-red-500/20 text-red-400",
    };
    return colors[color] || colors.cyan;
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "new":
        return <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs rounded-full">New</span>;
      case "beta":
        return <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">Beta</span>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-300">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const config = roleConfig[user.role] || roleConfig.Policymaker;
  const metrics = config.metrics;
  const quickLinks = config.quickLinks;
  const roleDisplayName = getRoleDisplayName(user.role);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-cyan-950 to-slate-900 border-b border-cyan-500/20">
        <div className="relative px-6 md:px-8 py-6 md:py-8">
          <div className="flex justify-between items-start flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="px-3 py-1 bg-cyan-500/20 rounded-full border border-cyan-500/30">
                  <span className="text-cyan-300 text-xs font-mono tracking-wider">
                    {user.role.toUpperCase()} PORTAL
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-slate-400 text-xs">Connected</span>
                </div>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                {config.title}
              </h1>
              <p className="text-slate-300 text-sm md:text-base mt-2">
                {greeting}, {user.full_name} · {config.description}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => redirectUser(user.role)}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 rounded-xl text-white font-medium transition-all shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:scale-105"
              >
                <UserCog className="w-4 h-4" />
                <span className="text-sm">
                  Go to {roleDisplayName} Dashboard
                </span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <div className="text-right hidden sm:block">
                <p className="text-slate-400 text-xs">{currentTime}</p>
                <p className="text-slate-500 text-xs">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 rounded-xl border border-red-500/30 text-red-400 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-8 py-6">
        {/* Advocacy Widget */}
        <div className="mb-6">
          <AdvocacyWidget />
        </div>
        
        {/* Alerts Widget */}
        <div className="mb-6">
          <AlertsWidget 
            userRole={user?.role}
            userCountry={user?.country}
            userId={user?.id}
            limit={3}
            showViewAll={true}
          />
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric: DashboardMetric, idx: number) => {
            const Icon = metric.icon;
            const colorClasses = getMetricColorClasses(metric.color);
            return (
              <div key={idx} className={`${colorClasses} rounded-2xl border p-6 transition-all hover:scale-105`}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm opacity-80">{metric.title}</p>
                    <p className="text-3xl font-bold mt-2">{metric.value}</p>
                    {metric.change !== undefined && (
                      <p className={`text-xs mt-1 flex items-center gap-1 ${metric.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {metric.change >= 0 ? '↑' : '↓'} {Math.abs(metric.change)}% from last month
                      </p>
                    )}
                  </div>
                  <Icon className="w-8 h-8 opacity-70" />
                </div>
              </div>
            );
          })}
        </div>

        {/* INTELLIGENCE HUB SECTION - Main Feature */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-purple-600/20 to-cyan-600/20 rounded-xl border border-purple-500/30">
                <Brain className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Intelligence Hub</h2>
                <p className="text-slate-400 text-sm">AI-powered analytics and insights for continental reform</p>
              </div>
            </div>
            <Link 
              href="/intelligence-hub" 
              className="text-cyan-400 hover:text-cyan-300 text-sm flex items-center gap-1 transition-colors"
            >
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {INTELLIGENCE_HUB_LINKS.map((link, idx) => {
              const Icon = link.icon;
              const colors = [
                "from-cyan-600/10 to-blue-600/10 border-cyan-500/20",
                "from-purple-600/10 to-pink-600/10 border-purple-500/20",
                "from-emerald-600/10 to-cyan-600/10 border-emerald-500/20",
                "from-yellow-600/10 to-orange-600/10 border-yellow-500/20",
                "from-red-600/10 to-pink-600/10 border-red-500/20",
                "from-blue-600/10 to-indigo-600/10 border-blue-500/20",
              ];
              const color = colors[idx % colors.length];
              
              return (
                <Link
                  key={idx}
                  href={link.href}
                  className={`group bg-gradient-to-br ${color} rounded-2xl border p-5 transition-all hover:scale-105 hover:shadow-lg hover:shadow-purple-500/10`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2 bg-slate-800/50 rounded-xl group-hover:bg-slate-800/70 transition-colors">
                      <Icon className="w-5 h-5 text-cyan-400" />
                    </div>
                    {getStatusBadge(link.status)}
                  </div>
                  <h3 className="text-white font-medium group-hover:text-cyan-400 transition-colors">
                    {link.name}
                  </h3>
                  <p className="text-slate-400 text-xs mt-1">{link.description}</p>
                  <div className="mt-3 flex items-center text-cyan-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                    Access <ChevronRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Quick Links & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Links */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-white font-semibold text-lg flex items-center gap-2">
                  <LayoutDashboard className="w-5 h-5 text-cyan-400" />
                  Quick Actions
                </h2>
                <Link href="/" className="text-slate-400 hover:text-cyan-400 text-sm transition-colors">
                  View All
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quickLinks.map((link: QuickLink, idx: number) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={idx}
                      href={link.href}
                      className="group p-4 bg-slate-700/30 hover:bg-slate-700/50 rounded-xl transition-all hover:translate-x-1"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-cyan-500/20 rounded-lg">
                          <Icon className="w-5 h-5 text-cyan-400" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-white font-medium group-hover:text-cyan-400 transition-colors">
                            {link.title}
                          </h3>
                          <p className="text-slate-400 text-sm mt-1">{link.description}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-white font-semibold text-lg flex items-center gap-2">
                <Activity className="w-5 h-5 text-cyan-400" />
                Recent Activity
              </h2>
              <button 
                onClick={() => setRecentActivities(getRecentActivities(user.role))}
                className="text-slate-400 hover:text-cyan-400 text-sm transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              {recentActivities.map((activity) => {
                const typeColors = {
                  success: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
                  warning: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
                  info: "bg-blue-500/20 text-blue-400 border-blue-500/30",
                  error: "bg-red-500/20 text-red-400 border-red-500/30",
                };
                const TypeIcon = activity.type === "success" ? CheckCircle : activity.type === "warning" ? AlertTriangle : Bell;
                return (
                  <div key={activity.id} className="flex items-start gap-3 p-3 bg-slate-700/30 rounded-xl">
                    <div className={`p-1.5 rounded-lg ${typeColors[activity.type]}`}>
                      <TypeIcon className="w-3 h-3" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium">{activity.action}</p>
                      <p className="text-slate-400 text-xs">{activity.description}</p>
                      <p className="text-slate-500 text-xs mt-1">{activity.timestamp}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <button className="w-full mt-4 py-2 text-center text-slate-400 hover:text-cyan-400 text-sm transition-colors">
              View All Activity
            </button>
          </div>
        </div>

        {/* Role-Specific Widgets */}
        <div className="mt-8">
          {user.role === "Policymaker" && (
            <div className="bg-gradient-to-r from-cyan-600/10 to-blue-600/10 rounded-2xl border border-cyan-500/20 p-6">
              <div className="flex items-start gap-4">
                <Star className="w-8 h-8 text-cyan-400 flex-shrink-0" />
                <div>
                  <h3 className="text-white font-semibold text-lg mb-2">AI Policy Recommendation</h3>
                  <p className="text-slate-300">
                    Based on continental analysis, accelerate community-based service regulations. 
                    12 countries are ahead on this metric. Consider increasing budget allocation for preventive care.
                  </p>
                  <button className="mt-3 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-white text-sm transition-colors inline-flex items-center gap-2">
                    View Full Analysis
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {user.role === "Donor" && (
            <div className="bg-gradient-to-r from-emerald-600/10 to-cyan-600/10 rounded-2xl border border-emerald-500/20 p-6">
              <div className="flex items-start gap-4">
                <TrendingUp className="w-8 h-8 text-emerald-400 flex-shrink-0" />
                <div>
                  <h3 className="text-white font-semibold text-lg mb-2">High-Impact Investment Opportunity</h3>
                  <p className="text-slate-300">
                    Kenya shows 85% ROI potential with $85M funding gap. Current donor readiness at 68% - 
                    strategic investment could accelerate reform progress significantly.
                  </p>
                  <button className="mt-3 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-white text-sm transition-colors inline-flex items-center gap-2">
                    View Investment Case
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {user.role === "Researcher" && (
            <div className="bg-gradient-to-r from-purple-600/10 to-pink-600/10 rounded-2xl border border-purple-500/20 p-6">
              <div className="flex items-start gap-4">
                <FileText className="w-8 h-8 text-purple-400 flex-shrink-0" />
                <div>
                  <h3 className="text-white font-semibold text-lg mb-2">New Research Available</h3>
                  <p className="text-slate-300">
                    3 new publications added to the repository. Your recent paper has received 12 new citations.
                    Continental research collaboration opportunities available.
                  </p>
                  <button className="mt-3 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white text-sm transition-colors inline-flex items-center gap-2">
                    Go to Repository
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Stats */}
        <div className="mt-8 bg-slate-800/30 rounded-xl border border-slate-700 p-4">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <Globe className="w-5 h-5 text-cyan-400" />
              <span className="text-slate-400 text-sm">Continental Intelligence Network</span>
            </div>
            <div className="flex gap-6">
              <div className="text-center">
                <p className="text-slate-500 text-xs">AI Confidence Score</p>
                <p className="text-cyan-400 font-bold text-sm">94.7%</p>
              </div>
              <div className="text-center">
                <p className="text-slate-500 text-xs">Last Sync</p>
                <p className="text-white text-sm">{currentTime}</p>
              </div>
              <div className="text-center">
                <p className="text-slate-500 text-xs">Active Users</p>
                <p className="text-emerald-400 font-bold text-sm">1,247</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}