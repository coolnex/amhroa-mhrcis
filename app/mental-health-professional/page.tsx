"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { GovernanceAlertsWidget } from "@/components/GovernanceAlertsWidget";
import {
  Brain,
  Users,
  FileText,
  TrendingUp,
  Target,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Crown,
  Globe,
  Mail,
  Phone,
  MapPin,
  RefreshCw,
  Plus,
  Eye,
  Award,
  Heart,
  Briefcase,
  BookOpen,
  Handshake,
  Megaphone,
  UserPlus,
  Video,
  Shield,
  Stethoscope,
  Microscope,
  Sparkles,
  LayoutDashboard,
  Loader2,
  ChevronRight,
  ArrowRight,
  Activity,
  GraduationCap,
  HeartHandshake,
  Users2,
  Bookmark,
  Send,
  ExternalLink,
  Star,
} from "lucide-react";

// ============================================================
// Types
// ============================================================
interface WorkingGroup {
  id: string;
  name: string;
  description: string;
  role: string;
  members: number;
  status: "Active" | "Pending" | "Completed";
  progress: number;
  created_at: string;
}

interface AdvocacyCampaign {
  id: string;
  title: string;
  description: string;
  reach: number;
  engagement: number;
  status: "Active" | "Planning" | "Completed";
  start_date: string;
  end_date: string;
  region: string;
}

interface ResearchProject {
  id: string;
  title: string;
  description: string;
  lead: string;
  lead_id: string;
  collaborators: number;
  status: "Active" | "Pending" | "Completed";
  start_date: string;
  end_date: string;
}

interface EventItem {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date?: string;
  event_type: string;
  capacity?: number;
  registered_count?: number;
  location?: string;
  country?: string;
  is_virtual?: boolean;
  meeting_link?: string;
}

type TabKey =
  | "overview"
  | "working-groups"
  | "advocacy"
  | "research"
  | "events";

// ============================================================
// Accent palette
// ============================================================
const ACCENTS: Record<
  string,
  { bg: string; text: string; border: string; glow: string }
> = {
  rose: {
    bg: "bg-rose-500/10",
    text: "text-rose-400",
    border: "border-rose-500/20",
    glow: "from-rose-500/20",
  },
  cyan: {
    bg: "bg-cyan-500/10",
    text: "text-cyan-400",
    border: "border-cyan-500/20",
    glow: "from-cyan-500/20",
  },
  emerald: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    border: "border-emerald-500/20",
    glow: "from-emerald-500/20",
  },
  purple: {
    bg: "bg-purple-500/10",
    text: "text-purple-400",
    border: "border-purple-500/20",
    glow: "from-purple-500/20",
  },
  amber: {
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    border: "border-amber-500/20",
    glow: "from-amber-500/20",
  },
  blue: {
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    border: "border-blue-500/20",
    glow: "from-blue-500/20",
  },
};

// ============================================================
// Helpers
// ============================================================
const statusStyles: Record<string, string> = {
  Active: "bg-emerald-500/15 border-emerald-500/30 text-emerald-300",
  Planning: "bg-amber-500/15 border-amber-500/30 text-amber-300",
  Pending: "bg-amber-500/15 border-amber-500/30 text-amber-300",
  Completed: "bg-blue-500/15 border-blue-500/30 text-blue-300",
  Upcoming: "bg-purple-500/15 border-purple-500/30 text-purple-300",
};

const getStatusStyle = (s: string) =>
  statusStyles[s] || "bg-slate-500/15 border-slate-500/30 text-slate-300";

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const shorten = (v: string | null | undefined, max = 18) => {
  if (!v) return "";
  return v.length > max ? `${v.slice(0, max - 1)}…` : v;
};

// ============================================================
// Component
// ============================================================
export default function MentalHealthProfessionalDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [refreshing, setRefreshing] = useState(false);

  const [workingGroups, setWorkingGroups] = useState<WorkingGroup[]>([]);
  const [advocacyCampaigns, setAdvocacyCampaigns] = useState<AdvocacyCampaign[]>([]);
  const [researchProjects, setResearchProjects] = useState<ResearchProject[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<EventItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  // ============================================================
  // Init
  // ============================================================
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // 1. Fast path: cached profile
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          const cached = JSON.parse(userStr);
          if (
            cached?.id &&
            (cached.role === "Mental_Health_Professional" ||
              cached.role === "mental_health_professional" ||
              cached.role === "mental_health_coordinator" ||
              cached.role === "Admin")
          ) {
            setUser(cached);
            await fetchData(cached);
            setCheckingAuth(false);
            setLoading(false);
            return;
          }
        } catch {
          localStorage.removeItem("user");
        }
      }

      // 2. Authoritative path: Supabase session
      const { data: { session }, error: sessionError } =
        await supabase.auth.getSession();

      if (sessionError || !session?.user) {
        router.push("/login");
        return;
      }

      // 3. Fetch profile using auth_user_id (not id)
      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("*")
        .eq("auth_user_id", session.user.id)
        .single();

      if (profileError || !profile) {
        router.push("/login");
        return;
      }

      // 4. Guard: allowed roles only
      const allowed = [
        "Mental_Health_Professional",
        "mental_health_professional",
        "mental_health_coordinator",
        "Admin",
      ];
      if (!allowed.includes(profile.role)) {
        router.push("/dashboard");
        return;
      }

      // 5. Guard: approved
      if (profile.status && profile.status !== "Approved") {
        router.push("/login?message=Account pending approval");
        return;
      }

      localStorage.setItem("user", JSON.stringify(profile));
      setUser(profile);
      await fetchData(profile);
    } catch (err) {
      console.error("Auth error:", err);
      router.push("/login");
    } finally {
      setCheckingAuth(false);
      setLoading(false);
    }
  };

  // ============================================================
  // Data
  // ============================================================
  const fetchData = async (currentUser?: any) => {
    const u = currentUser || user;
    if (!u?.id) return;

    setLoading(true);
    setError(null);
    try {
      await Promise.all([
        fetchWorkingGroups(u.id),
        fetchAdvocacyCampaigns(),
        fetchResearchProjects(),
        fetchUpcomingEvents(),
      ]);
    } catch (err) {
      console.error("fetchData error:", err);
      setError("Failed to load some dashboard data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchWorkingGroups = async (userId: string) => {
    try {
      const { data: memberGroups, error: wgError } = await supabase
        .from("working_group_members")
        .select(
          `
          working_group_id,
          role,
          working_groups:working_group_id (
            id, name, description, status, progress, created_by, created_at
          )
        `
        )
        .eq("user_id", userId);

      if (wgError) {
        console.warn("WG error:", wgError);
        return;
      }
      if (!memberGroups || memberGroups.length === 0) {
        setWorkingGroups([]);
        return;
      }

      const groupsWithCounts = await Promise.all(
        memberGroups.map(async (mg: any) => {
          const { count } = await supabase
            .from("working_group_members")
            .select("*", { count: "exact", head: true })
            .eq("working_group_id", mg.working_group_id);

          const groupData = mg.working_groups as any;
          if (!groupData) return null;

          return {
            id: groupData.id,
            name: groupData.name || "Unnamed Group",
            description: groupData.description || "",
            role: mg.role || "Member",
            members: count || 0,
            status:
              (groupData.status as "Active" | "Pending" | "Completed") ||
              "Active",
            progress: groupData.progress || 0,
            created_at: groupData.created_at || new Date().toISOString(),
          };
        })
      );

      setWorkingGroups(groupsWithCounts.filter(Boolean) as WorkingGroup[]);
    } catch (err) {
      console.warn("fetchWorkingGroups:", err);
    }
  };

  const fetchAdvocacyCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from("advocacy_campaigns")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(6);
      if (error) throw error;
      if (data) setAdvocacyCampaigns(data);
    } catch (err) {
      console.warn("fetchAdvocacy:", err);
    }
  };

  const fetchResearchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from("research_projects")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(6);
      if (error) throw error;
      if (data) setResearchProjects(data);
    } catch (err) {
      console.warn("fetchResearch:", err);
    }
  };

  // Fixed: use start_date, not date
  const fetchUpcomingEvents = async () => {
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("approval_status", "Approved")
        .gte("start_date", new Date().toISOString())
        .order("start_date", { ascending: true })
        .limit(6);
      if (error) throw error;
      if (data) setUpcomingEvents(data);
    } catch (err) {
      console.warn("fetchEvents:", err);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData(user);
  };

  // ============================================================
  // Derived stats & recommendations
  // ============================================================
  const stats = useMemo(() => {
    const activeWG = workingGroups.filter((g) => g.status === "Active").length;
    const activeCampaigns = advocacyCampaigns.filter(
      (c) => c.status === "Active"
    ).length;
    const activeResearch = researchProjects.filter(
      (p) => p.status === "Active"
    ).length;
    const campaignReach = advocacyCampaigns.reduce(
      (sum, c) => sum + (c.reach || 0),
      0
    );
    const totalEngagement = advocacyCampaigns.reduce(
      (sum, c) => sum + (c.engagement || 0),
      0
    );
    return {
      workingGroups: workingGroups.length,
      activeWorkingGroups: activeWG,
      activeCampaigns,
      activeResearch,
      campaignReach,
      totalEngagement,
    };
  }, [workingGroups, advocacyCampaigns, researchProjects]);

  const recommendations = useMemo(() => {
    const recs: { text: string; severity: "high" | "medium" | "info"; href?: string }[] = [];

    if (workingGroups.length === 0) {
      recs.push({
        text: "You're not part of any working group yet. Join a group to contribute to continental reform.",
        severity: "high",
        href: "/working-groups",
      });
    }

    if (researchProjects.filter((p) => p.status === "Active").length === 0) {
      recs.push({
        text: "No active research projects. Consider starting or joining a study on mental health outcomes.",
        severity: "medium",
        href: "/research-library",
      });
    }

    if (advocacyCampaigns.length === 0) {
      recs.push({
        text: "No advocacy campaigns found. Launch one to shape public discourse on mental health.",
        severity: "medium",
        href: "/advocacy-campaigns/new",
      });
    }

    recs.push({
      text: "Explore the continental working groups and align your clinical expertise with a priority area.",
      severity: "info",
      href: "/working-groups",
    });

    return recs.slice(0, 4);
  }, [workingGroups, researchProjects, advocacyCampaigns]);

  // ============================================================
  // Six pillars of professional practice
  // ============================================================
  const pillars = [
    {
      icon: Stethoscope,
      title: "Clinical Practice",
      desc: "Rights-based, person-centered care across the continuum — from community to specialist services.",
      color: "rose",
    },
    {
      icon: GraduationCap,
      title: "Training & Supervision",
      desc: "Upskill peers, supervise trainees, and strengthen the continental mental health workforce.",
      color: "cyan",
    },
    {
      icon: Microscope,
      title: "Research & Evidence",
      desc: "Generate and use evidence that drives policy, service design, and clinical guidelines.",
      color: "purple",
    },
    {
      icon: Megaphone,
      title: "Advocacy & Voice",
      desc: "Champion de-stigmatisation, decriminalisation, and rights-based reforms in your country.",
      color: "amber",
    },
    {
      icon: Users2,
      title: "Peer Networks",
      desc: "Connect with colleagues across borders, share case learning, and support each other.",
      color: "emerald",
    },
    {
      icon: HeartHandshake,
      title: "Community Engagement",
      desc: "Work with CSOs, faith groups, and community leaders to reach underserved populations.",
      color: "blue",
    },
  ];

  // ============================================================
  // Loading state
  // ============================================================
  if (checkingAuth || (loading && !user)) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-14 h-14 text-rose-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-300">Loading clinical workspace…</p>
        </div>
      </main>
    );
  }

  // ============================================================
  // Render
  // ============================================================
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 text-slate-200">
      <GovernanceAlertsWidget userRole="mental_health_professional" />

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-10">
        {/* ============================================
            HERO
        ============================================ */}
        <section className="relative overflow-hidden rounded-3xl border border-rose-500/20 bg-gradient-to-br from-rose-950 via-slate-900/80 to-slate-900 p-8 md:p-10 mb-8 shadow-2xl">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-rose-500/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
          </div>
          <div className="absolute right-0 top-0 text-[180px] font-black text-white/[0.03] select-none pointer-events-none leading-none">
            MHP
          </div>

          <div className="relative z-10">
            <div className="flex flex-wrap items-start gap-6 mb-8">
              <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 backdrop-blur">
                <Stethoscope className="w-10 h-10 text-rose-300" />
              </div>
              <div className="flex-1 min-w-[260px]">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <span className="px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-mono tracking-wider">
                    MENTAL HEALTH PROFESSIONAL PORTAL
                  </span>
                  <Link
                    href="/notifications"
                    className="px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-mono tracking-wider flex items-center gap-1.5 hover:bg-amber-500/25 transition-colors"
                  >
                    <Heart className="w-3 h-3" />
                    Clinical alerts
                  </Link>
                </div>
                <h1 className="text-3xl md:text-5xl font-black text-white leading-tight">
                  {user?.full_name
                    ? `Welcome, ${user.full_name.split(" ")[0]}`
                    : "Mental Health Professional Workspace"}
                </h1>
                <p className="text-rose-100/80 mt-3 text-base md:text-lg max-w-3xl">
                  Clinical practice, research, supervision, and continental
                  advocacy — all in one place. You are the backbone of
                  Africa's mental health reform.
                </p>
              </div>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <QuickStat
                label="Working Groups"
                value={stats.workingGroups}
                icon={Users}
                accent="rose"
              />
              <QuickStat
                label="Active Campaigns"
                value={stats.activeCampaigns}
                icon={Megaphone}
                accent="amber"
              />
              <QuickStat
                label="Research Projects"
                value={stats.activeResearch}
                icon={Microscope}
                accent="purple"
              />
              <QuickStat
                label="Campaign Reach"
                value={
                  stats.campaignReach > 1000
                    ? `${(stats.campaignReach / 1000).toFixed(1)}K`
                    : stats.campaignReach
                }
                icon={TrendingUp}
                accent="cyan"
              />
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3 mt-8">
              <Link
                href="/working-groups"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-rose-900 font-semibold hover:bg-rose-50 transition-colors shadow-lg"
              >
                <Users className="w-4 h-4" />
                Browse Working Groups
              </Link>
              <Link
                href="/advocacy-campaigns"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-100 font-semibold hover:bg-rose-500/25 transition-colors"
              >
                <Megaphone className="w-4 h-4" />
                Advocacy Campaigns
              </Link>
              <Link
                href="/research-library"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-100 font-semibold hover:bg-rose-500/25 transition-colors"
              >
                <Microscope className="w-4 h-4" />
                Research Hub
              </Link>
            </div>
          </div>
        </section>

        {/* ============================================
            ERROR
        ============================================ */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-300 text-sm flex-1">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-300"
            >
              ×
            </button>
          </div>
        )}

        {/* ============================================
            RECOMMENDED ACTIONS
        ============================================ */}
        {recommendations.length > 0 && (
          <section className="rounded-2xl border border-cyan-500/20 bg-slate-900/60 backdrop-blur p-6 mb-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                <Sparkles className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white">
                  Recommended Next Steps
                </h2>
                <p className="text-slate-400 text-xs mt-0.5">
                  Personalised from your activity and the continental
                  priorities.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {recommendations.map((rec, idx) => {
                const styles =
                  rec.severity === "high"
                    ? { border: "border-rose-500/30", bg: "bg-rose-500/5" }
                    : rec.severity === "medium"
                    ? { border: "border-amber-500/30", bg: "bg-amber-500/5" }
                    : { border: "border-blue-500/30", bg: "bg-blue-500/5" };
                const dot =
                  rec.severity === "high"
                    ? "bg-rose-400"
                    : rec.severity === "medium"
                    ? "bg-amber-400"
                    : "bg-blue-400";
                return (
                  <Link
                    key={idx}
                    href={rec.href || "#"}
                    className={`group rounded-xl border ${styles.border} ${styles.bg} p-4 hover:scale-[1.01] transition-transform`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div
                        className={`mt-1 w-2 h-2 rounded-full shrink-0 ${dot}`}
                      />
                      <p className="text-slate-300 text-sm leading-relaxed flex-1">
                        {rec.text}
                      </p>
                      <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-1" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* ============================================
            SIX PILLARS
        ============================================ */}
        <section className="mb-10">
          <div className="flex items-end justify-between mb-5 flex-wrap gap-3">
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-white">
                Six Pillars of Professional Practice
              </h2>
              <p className="text-slate-400 mt-1 text-sm">
                What it means to be a mental health professional in the
                AMHROA network.
              </p>
            </div>
            <span className="text-xs text-slate-500 font-mono">
              6 PILLARS
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pillars.map((p) => {
              const Icon = p.icon;
              const a = ACCENTS[p.color] || ACCENTS.rose;
              return (
                <div
                  key={p.title}
                  className={`relative overflow-hidden rounded-2xl border ${a.border} bg-slate-900/60 backdrop-blur p-5 hover:bg-slate-800/60 transition-colors group`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2.5 rounded-xl ${a.bg} border ${a.border}`}
                    >
                      <Icon className={`w-5 h-5 ${a.text}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-bold">{p.title}</h3>
                      <p className="text-slate-400 text-sm mt-1 leading-relaxed">
                        {p.desc}
                      </p>
                    </div>
                  </div>
                  <div
                    className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${a.glow} to-transparent opacity-0 group-hover:opacity-100 transition-opacity`}
                  />
                </div>
              );
            })}
          </div>
        </section>

        {/* ============================================
            TABS
        ============================================ */}
        <section className="flex flex-wrap gap-2 mb-6 border-b border-slate-700 pb-4">
          <TabButton
            active={activeTab === "overview"}
            onClick={() => setActiveTab("overview")}
            icon={LayoutDashboard}
            label="Overview"
          />
          <TabButton
            active={activeTab === "working-groups"}
            onClick={() => setActiveTab("working-groups")}
            icon={Users}
            label="Working Groups"
            badge={stats.workingGroups || undefined}
          />
          <TabButton
            active={activeTab === "advocacy"}
            onClick={() => setActiveTab("advocacy")}
            icon={Megaphone}
            label="Advocacy"
            badge={advocacyCampaigns.length || undefined}
          />
          <TabButton
            active={activeTab === "research"}
            onClick={() => setActiveTab("research")}
            icon={Microscope}
            label="Research"
            badge={researchProjects.length || undefined}
          />
          <TabButton
            active={activeTab === "events"}
            onClick={() => setActiveTab("events")}
            icon={Calendar}
            label="Events"
            badge={upcomingEvents.length || undefined}
          />
        </section>

        {/* ============================================
            OVERVIEW
        ============================================ */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Working groups preview */}
            <div className="rounded-2xl border border-slate-700/60 bg-slate-900/60 backdrop-blur p-6">
              <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
                    <Users className="w-5 h-5 text-rose-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white">
                      Your Working Groups
                    </h2>
                    <p className="text-slate-400 text-xs mt-0.5">
                      Where your clinical expertise is making a difference.
                    </p>
                  </div>
                </div>
                <Link
                  href="/working-groups"
                  className="text-rose-400 hover:text-rose-300 text-sm font-semibold inline-flex items-center gap-1"
                >
                  See all
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              {workingGroups.length === 0 ? (
                <div className="text-center py-10 rounded-2xl border border-dashed border-slate-700/60">
                  <Users className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                  <p className="text-white font-semibold">
                    You haven't joined a working group yet
                  </p>
                  <p className="text-slate-400 text-sm mt-1">
                    Working groups are where clinical insight meets collective
                    action.
                  </p>
                  <Link
                    href="/working-groups"
                    className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-sm font-semibold hover:bg-rose-500/25 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Browse Working Groups
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {workingGroups.slice(0, 4).map((g) => (
                    <WorkingGroupCard key={g.id} group={g} />
                  ))}
                </div>
              )}
            </div>

            {/* Advocacy + Research side-by-side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Advocacy */}
              <div className="rounded-2xl border border-slate-700/60 bg-slate-900/60 backdrop-blur p-6">
                <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                      <Megaphone className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-white">
                        Advocacy Campaigns
                      </h3>
                      <p className="text-slate-400 text-xs mt-0.5">
                        Movements you can join or amplify.
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/advocacy-campaigns"
                    className="text-amber-400 hover:text-amber-300 text-sm font-semibold inline-flex items-center gap-1"
                  >
                    All
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>

                {advocacyCampaigns.length === 0 ? (
                  <p className="text-slate-400 text-sm text-center py-6">
                    No active campaigns right now.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {advocacyCampaigns.slice(0, 3).map((c) => (
                      <Link
                        key={c.id}
                        href={`/advocacy-campaigns/${c.id}`}
                        className="block rounded-xl border border-slate-700/60 bg-slate-800/40 hover:border-amber-500/40 hover:bg-slate-800/70 p-4 transition-all group"
                      >
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <p className="text-white font-bold group-hover:text-amber-300 transition-colors line-clamp-2">
                            {c.title}
                          </p>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full border shrink-0 ${getStatusStyle(
                              c.status
                            )}`}
                          >
                            {c.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            {c.reach?.toLocaleString() || 0} reached
                          </span>
                          {c.region && (
                            <span className="flex items-center gap-1">
                              <Globe className="w-3 h-3" />
                              {c.region}
                            </span>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Research */}
              <div className="rounded-2xl border border-slate-700/60 bg-slate-900/60 backdrop-blur p-6">
                <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20">
                      <Microscope className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-white">
                        Research Projects
                      </h3>
                      <p className="text-slate-400 text-xs mt-0.5">
                        Studies shaping the reform agenda.
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/research-library"
                    className="text-purple-400 hover:text-purple-300 text-sm font-semibold inline-flex items-center gap-1"
                  >
                    All
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>

                {researchProjects.length === 0 ? (
                  <p className="text-slate-400 text-sm text-center py-6">
                    No research projects yet.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {researchProjects.slice(0, 3).map((p) => (
                      <Link
                        key={p.id}
                        href={`/research-projects/${p.id}`}
                        className="block rounded-xl border border-slate-700/60 bg-slate-800/40 hover:border-purple-500/40 hover:bg-slate-800/70 p-4 transition-all group"
                      >
                        <div className="flex items-start justify-between gap-3 mb-1">
                          <p className="text-white font-bold group-hover:text-purple-300 transition-colors line-clamp-2">
                            {p.title}
                          </p>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full border shrink-0 ${getStatusStyle(
                              p.status
                            )}`}
                          >
                            {p.status}
                          </span>
                        </div>
                        <p className="text-slate-500 text-xs">
                          Lead: {p.lead || "—"} · {p.collaborators || 0}{" "}
                          collaborators
                        </p>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Upcoming events */}
            {upcomingEvents.length > 0 && (
              <div className="rounded-2xl border border-slate-700/60 bg-slate-900/60 backdrop-blur p-6">
                <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                      <Calendar className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-white">
                        Upcoming Events
                      </h3>
                      <p className="text-slate-400 text-xs mt-0.5">
                        Learning, collaboration, and peer connection.
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/events"
                    className="text-cyan-400 hover:text-cyan-300 text-sm font-semibold inline-flex items-center gap-1"
                  >
                    All events
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {upcomingEvents.slice(0, 3).map((e) => (
                    <EventCard key={e.id} event={e} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================
            WORKING GROUPS
        ============================================ */}
        {activeTab === "working-groups" && (
          <section>
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <div>
                <h2 className="text-2xl font-black text-white">
                  Working Groups
                </h2>
                <p className="text-slate-400 text-sm mt-1">
                  Ongoing and completed groups you're part of.
                </p>
              </div>
              <Link
                href="/working-groups/new"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-200 font-semibold text-sm hover:bg-rose-500/25 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create Working Group
              </Link>
            </div>

            {workingGroups.length === 0 ? (
              <EmptyState
                icon={Users}
                title="You haven't joined a working group yet"
                sub="Working groups are the primary way professionals collaborate on the platform."
                cta={{ label: "Browse Working Groups", href: "/working-groups" }}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {workingGroups.map((g) => (
                  <WorkingGroupCard key={g.id} group={g} detailed />
                ))}
              </div>
            )}
          </section>
        )}

        {/* ============================================
            ADVOCACY
        ============================================ */}
        {activeTab === "advocacy" && (
          <section>
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <div>
                <h2 className="text-2xl font-black text-white">
                  Advocacy Campaigns
                </h2>
                <p className="text-slate-400 text-sm mt-1">
                  Movements you can join, amplify, or lead.
                </p>
              </div>
              <Link
                href="/advocacy-campaigns/new"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-200 font-semibold text-sm hover:bg-amber-500/25 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create Campaign
              </Link>
            </div>

            {advocacyCampaigns.length === 0 ? (
              <EmptyState
                icon={Megaphone}
                title="No campaigns yet"
                sub="Be the first professional to launch an advocacy campaign for reform."
                cta={{
                  label: "Start a Campaign",
                  href: "/advocacy-campaigns/new",
                }}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {advocacyCampaigns.map((c) => (
                  <Link
                    key={c.id}
                    href={`/advocacy-campaigns/${c.id}`}
                    className="group rounded-2xl border border-slate-700/60 bg-slate-900/60 backdrop-blur p-6 hover:border-amber-500/40 hover:bg-slate-800/60 transition-all"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <span
                        className={`px-2 py-0.5 rounded-full border text-xs font-semibold ${getStatusStyle(
                          c.status
                        )}`}
                      >
                        {c.status}
                      </span>
                      {c.region && (
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Globe className="w-3 h-3" />
                          {c.region}
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-2">
                      {c.title}
                    </h3>
                    <p className="text-slate-400 text-sm mt-2 line-clamp-3">
                      {c.description}
                    </p>
                    <div className="grid grid-cols-2 gap-3 mt-5 pt-4 border-t border-slate-700/50">
                      <div>
                        <p className="text-2xl font-black text-amber-300">
                          {c.reach?.toLocaleString() || 0}
                        </p>
                        <p className="text-slate-500 text-xs uppercase tracking-wider">
                          Reach
                        </p>
                      </div>
                      <div>
                        <p className="text-2xl font-black text-purple-300">
                          {c.engagement?.toLocaleString() || 0}
                        </p>
                        <p className="text-slate-500 text-xs uppercase tracking-wider">
                          Engagement
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ============================================
            RESEARCH
        ============================================ */}
        {activeTab === "research" && (
          <section>
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <div>
                <h2 className="text-2xl font-black text-white">
                  Research Projects
                </h2>
                <p className="text-slate-400 text-sm mt-1">
                  Studies driving evidence-based reform.
                </p>
              </div>
              <Link
                href="/research-projects/new"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-200 font-semibold text-sm hover:bg-purple-500/25 transition-colors"
              >
                <Plus className="w-4 h-4" />
                New Research Project
              </Link>
            </div>

            {researchProjects.length === 0 ? (
              <EmptyState
                icon={Microscope}
                title="No research projects"
                sub="Start or join a study to contribute to continental evidence."
                cta={{
                  label: "Start Research",
                  href: "/research-projects/new",
                }}
              />
            ) : (
              <div className="space-y-3">
                {researchProjects.map((p) => (
                  <Link
                    key={p.id}
                    href={`/research-projects/${p.id}`}
                    className="block rounded-2xl border border-slate-700/60 bg-slate-900/60 backdrop-blur p-5 hover:border-purple-500/40 hover:bg-slate-800/60 transition-all group"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex-1 min-w-[240px]">
                        <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors">
                          {p.title}
                        </h3>
                        <p className="text-slate-400 text-sm mt-1 line-clamp-2">
                          {p.description}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            Lead: {p.lead || "—"}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users2 className="w-3 h-3" />
                            {p.collaborators || 0} collaborators
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(p.start_date)}
                          </span>
                        </div>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full border text-xs font-semibold shrink-0 ${getStatusStyle(
                          p.status
                        )}`}
                      >
                        {p.status}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ============================================
            EVENTS
        ============================================ */}
        {activeTab === "events" && (
          <section>
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <div>
                <h2 className="text-2xl font-black text-white">
                  Upcoming Events
                </h2>
                <p className="text-slate-400 text-sm mt-1">
                  Conferences, trainings, and clinical peer exchanges.
                </p>
              </div>
              <Link
                href="/events"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-200 font-semibold text-sm hover:bg-cyan-500/25 transition-colors"
              >
                <Calendar className="w-4 h-4" />
                Browse All Events
              </Link>
            </div>

            {upcomingEvents.length === 0 ? (
              <EmptyState
                icon={Calendar}
                title="No upcoming events"
                sub="Check back soon — new events are published weekly."
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {upcomingEvents.map((e) => (
                  <EventCard key={e.id} event={e} />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Footer */}
        <p className="text-center text-slate-500 text-xs mt-12">
          AMHROA · Mental Health Professional Network · You are the backbone of
          Africa's mental health reform
        </p>
      </div>
    </main>
  );
}

// ============================================================
// Sub-components
// ============================================================
function QuickStat({
  label,
  value,
  icon: Icon,
  accent = "rose",
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  accent?: string;
}) {
  const a = ACCENTS[accent] || ACCENTS.rose;
  const display = String(value);
  const isLong = display.length > 12;
  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 backdrop-blur p-4 hover:bg-white/10 transition-colors min-w-0">
      <div className="flex items-center justify-between mb-2 gap-2">
        <p className="text-rose-100/70 text-xs font-medium truncate">
          {label}
        </p>
        <Icon className={`w-4 h-4 ${a.text} opacity-60 shrink-0`} />
      </div>
      <p
        className={`font-black text-white leading-tight break-words ${
          isLong ? "text-lg md:text-xl" : "text-xl md:text-2xl"
        }`}
        title={display}
      >
        {display}
      </p>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon: Icon,
  label,
  badge,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ElementType;
  label: string;
  badge?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
        active
          ? "bg-rose-600 text-white shadow-lg shadow-rose-500/20"
          : "text-slate-400 hover:text-white hover:bg-slate-800"
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
      {badge !== undefined && badge > 0 && (
        <span
          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
            active ? "bg-white/20" : "bg-rose-500 text-white"
          }`}
        >
          {badge}
        </span>
      )}
    </button>
  );
}

function WorkingGroupCard({
  group,
  detailed = false,
}: {
  group: WorkingGroup;
  detailed?: boolean;
}) {
  return (
    <Link
      href={`/working-groups/${group.id}`}
      className="block rounded-2xl border border-slate-700/60 bg-slate-800/40 hover:border-rose-500/40 hover:bg-slate-800/70 transition-all p-5 group"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="text-lg font-bold text-white group-hover:text-rose-300 transition-colors line-clamp-2">
          {group.name}
        </h3>
        <span
          className={`px-2 py-0.5 rounded-full border text-xs font-semibold shrink-0 ${getStatusStyle(
            group.status
          )}`}
        >
          {group.status}
        </span>
      </div>

      <p className="text-slate-400 text-sm line-clamp-2 mb-4">
        {group.description || "No description"}
      </p>

      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mb-4">
        <span className="flex items-center gap-1">
          <Users className="w-3 h-3" />
          {group.members} members
        </span>
        <span className="flex items-center gap-1">
          <Award className="w-3 h-3" />
          {group.role}
        </span>
      </div>

      <div>
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs text-slate-400">Progress</span>
          <span className="text-xs font-bold text-rose-300">
            {group.progress}%
          </span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-1.5 overflow-hidden">
          <div
            className="h-1.5 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 transition-all"
            style={{ width: `${group.progress}%` }}
          />
        </div>
      </div>

      {detailed && (
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-700/50">
          <span className="text-xs text-slate-500">
            Created {formatDate(group.created_at)}
          </span>
          <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-rose-400 group-hover:translate-x-0.5 transition-all" />
        </div>
      )}
    </Link>
  );
}

function EventCard({ event }: { event: EventItem }) {
  const date = new Date(event.start_date);
  const day = date.getDate();
  const month = date.toLocaleDateString("en-US", { month: "short" }).toUpperCase();

  return (
    <Link
      href={`/events?id=${event.id}`}
      className="rounded-2xl border border-slate-700/60 bg-slate-900/60 backdrop-blur p-5 hover:border-cyan-500/40 hover:bg-slate-800/60 transition-all block group"
    >
      <div className="flex gap-4">
        <div className="shrink-0 w-14 h-14 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex flex-col items-center justify-center">
          <span className="text-cyan-300 text-lg font-black leading-none">
            {day}
          </span>
          <span className="text-cyan-400/70 text-[10px] font-bold tracking-wider">
            {month}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="px-2 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-[10px] font-bold uppercase tracking-wider">
              {event.event_type}
            </span>
            {event.is_virtual && (
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                <Video className="w-2.5 h-2.5" />
                Virtual
              </span>
            )}
          </div>
          <h3 className="text-white font-bold group-hover:text-cyan-300 transition-colors line-clamp-2">
            {event.title}
          </h3>
          {event.description && (
            <p className="text-slate-400 text-xs mt-1 line-clamp-2">
              {event.description}
            </p>
          )}
          {event.country && (
            <div className="flex items-center gap-1 text-xs text-slate-500 mt-2">
              <MapPin className="w-3 h-3" />
              {event.country}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

function EmptyState({
  icon: Icon,
  title,
  sub,
  cta,
}: {
  icon: React.ElementType;
  title: string;
  sub: string;
  cta?: { label: string; href: string };
}) {
  return (
    <div className="text-center py-14 rounded-2xl border border-dashed border-slate-700/60 bg-slate-900/40">
      <Icon className="w-12 h-12 text-slate-600 mx-auto mb-3" />
      <p className="text-white font-semibold">{title}</p>
      <p className="text-slate-400 text-sm mt-1 max-w-md mx-auto">{sub}</p>
      {cta && (
        <Link
          href={cta.href}
          className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-sm font-semibold hover:bg-rose-500/25 transition-colors"
        >
          <Plus className="w-4 h-4" />
          {cta.label}
        </Link>
      )}
    </div>
  );
}