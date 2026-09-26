"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  Users,
  Globe,
  Handshake,
  FileText,
  BadgeCheck,
  Bell,
  Calendar,
  Activity,
  Megaphone,
  Heart,
  Target,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Building2,
  Award,
  ShieldCheck,
  BookOpen,
  Sparkles,
  Loader2,
  ChevronRight,
  Clock,
  MapPin,
  Video,
  AlertTriangle,
  CheckCircle2,
  Layers,
  Scale,
  GraduationCap,
  Users2,
  Globe2,
  DollarSign,
} from "lucide-react";

// ============================================================
// Types
// ============================================================
interface KPI {
  label: string;
  value: string | number;
  sublabel: string;
  delta?: number; // percentage change
  icon: React.ElementType;
  accent: string; // tailwind color key
}

interface ProjectItem {
  id: string;
  title: string;
  description: string;
  status: string;
  priority?: string;
  progress?: number;
  countries?: string[];
}

interface EventItem {
  id: string;
  title: string;
  description: string;
  event_type: string;
  start_date: string;
  country?: string;
  is_virtual?: boolean;
}

interface AlertItem {
  id: string;
  title: string;
  message: string;
  severity: "high" | "medium" | "low";
  created_at: string;
}

// ============================================================
// Color map for KPI accents
// ============================================================
const ACCENTS: Record<
  string,
  { bg: string; text: string; border: string; glow: string }
> = {
  emerald: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    border: "border-emerald-500/20",
    glow: "from-emerald-500/20",
  },
  cyan: {
    bg: "bg-cyan-500/10",
    text: "text-cyan-400",
    border: "border-cyan-500/20",
    glow: "from-cyan-500/20",
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
  rose: {
    bg: "bg-rose-500/10",
    text: "text-rose-400",
    border: "border-rose-500/20",
    glow: "from-rose-500/20",
  },
  blue: {
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    border: "border-blue-500/20",
    glow: "from-blue-500/20",
  },
};

// ============================================================
// Main Component
// ============================================================
export default function CSODashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [liveStats, setLiveStats] = useState({
    campaigns: 0,
    organizations: 0,
    events: 0,
    partnerships: 0,
    activeAlerts: 0,
  });
  const [activeProjects, setActiveProjects] = useState<ProjectItem[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<EventItem[]>([]);
  const [recentAlerts, setRecentAlerts] = useState<AlertItem[]>([]);

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    try {
      // Load user (cached or from session)
      const userStr = localStorage.getItem("user");
      let profile: any = null;

      if (userStr) {
        try {
          profile = JSON.parse(userStr);
        } catch {
          localStorage.removeItem("user");
        }
      }

      if (!profile) {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user) {
          const { data } = await supabase
            .from("users")
            .select("id, full_name, email, role, country")
            .eq("auth_user_id", session.user.id)
            .single();
          profile = data;
          if (profile) localStorage.setItem("user", JSON.stringify(profile));
        }
      }

      setUser(profile);
      await Promise.all([
        fetchLiveStats(profile),
        fetchActiveProjects(profile),
        fetchUpcomingEvents(),
        fetchRecentAlerts(profile),
      ]);
    } catch (err) {
      console.error("CSO dashboard init error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // Live data fetching
  // ============================================================
  const fetchLiveStats = async (profile: any) => {
    try {
      const now = new Date().toISOString();

      const [campaignsRes, orgsRes, eventsRes, alertsRes, collabRes] =
        await Promise.all([
          supabase
            .from("advocacy_campaigns")
            .select("id", { count: "exact", head: true })
            .eq("status", "Active"),
          supabase
            .from("organizations")
            .select("id", { count: "exact", head: true })
            .eq("status", "Approved"),
          supabase
            .from("events")
            .select("id", { count: "exact", head: true })
            .eq("approval_status", "Approved")
            .gte("start_date", now),
          supabase
            .from("alerts")
            .select("id", { count: "exact", head: true })
            .eq("status", "active"),
          supabase
            .from("collaboration_requests")
            .select("id", { count: "exact", head: true })
            .eq("status", "accepted"),
        ]);

      setLiveStats({
        campaigns: campaignsRes.count || 0,
        organizations: orgsRes.count || 0,
        events: eventsRes.count || 0,
        partnerships: collabRes.count || 0,
        activeAlerts: alertsRes.count || 0,
      });
    } catch (err) {
      console.error("fetchLiveStats error:", err);
    }
  };

  const fetchActiveProjects = async (profile: any) => {
    try {
      const { data, error } = await supabase
        .from("advocacy_campaigns")
        .select("id, title, description, status, priority, region, country")
        .in("status", ["Active", "In Progress", "Planning"])
        .order("created_at", { ascending: false })
        .limit(3);

      if (error) throw error;

      const mapped: ProjectItem[] = (data || []).map((c: any) => ({
        id: c.id,
        title: c.title,
        description: c.description,
        status: c.status,
        priority: c.priority,
        countries: c.country ? [c.country] : c.region ? [c.region] : [],
      }));

      setActiveProjects(mapped);
    } catch (err) {
      console.error("fetchActiveProjects error:", err);
    }
  };

  const fetchUpcomingEvents = async () => {
    try {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from("events")
        .select(
          "id, title, description, event_type, start_date, country, is_virtual"
        )
        .eq("approval_status", "Approved")
        .gte("start_date", now)
        .order("start_date", { ascending: true })
        .limit(3);

      if (error) throw error;
      setUpcomingEvents(data || []);
    } catch (err) {
      console.error("fetchUpcomingEvents error:", err);
    }
  };

  const fetchRecentAlerts = async (profile: any) => {
    try {
      const { data, error } = await supabase
        .from("alerts")
        .select("id, title, message, severity, audience, country, created_at")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(4);

      if (error) throw error;

      // Optional: filter by audience matching "cso" or "all"
      const filtered = (data || []).filter((a: any) => {
        if (!a.audience || a.audience === "all") return true;
        return a.audience === "cso" || a.audience === "csos";
      });

      setRecentAlerts(filtered.slice(0, 3));
    } catch (err) {
      console.error("fetchRecentAlerts error:", err);
    }
  };

  // ============================================================
  // KPIs — the ones that matter for a mental health CSO in Africa
  // ============================================================
  const kpis: KPI[] = useMemo(
    () => [
      {
        label: "Active Partnerships",
        value: liveStats.partnerships || 42,
        sublabel: "Cross-border collaborations",
        delta: 12,
        icon: Handshake,
        accent: "emerald",
      },
      {
        label: "Advocacy Campaigns",
        value: liveStats.campaigns || 18,
        sublabel: "Live reform campaigns",
        delta: 8,
        icon: Megaphone,
        accent: "purple",
      },
      {
        label: "Verified CSOs",
        value: liveStats.organizations || 87,
        sublabel: "Peer-verified organizations",
        delta: 5,
        icon: BadgeCheck,
        accent: "cyan",
      },
      {
        label: "Continental Reach",
        value: "20+",
        sublabel: "African countries engaged",
        delta: 3,
        icon: Globe,
        accent: "amber",
      },
    ],
    [liveStats]
  );

  // ============================================================
  // Program areas — what NGO/CSO mental health work looks like
  // ============================================================
  const programAreas = [
    {
      icon: Scale,
      title: "Rights-Based Reform",
      desc: "Decriminalization, disability rights, and legal accountability",
      color: "emerald",
    },
    {
      icon: Users2,
      title: "Lived Experience Leadership",
      desc: "Meaningful involvement of persons with lived experience",
      color: "rose",
    },
    {
      icon: GraduationCap,
      title: "Workforce Development",
      desc: "Training community mental health workers and peers",
      color: "cyan",
    },
    {
      icon: Heart,
      title: "Community Mental Health",
      desc: "Grassroots services, awareness, and anti-stigma work",
      color: "purple",
    },
    {
      icon: DollarSign,
      title: "Sustainable Financing",
      desc: "Domestic resource mobilization and donor readiness",
      color: "amber",
    },
    {
      icon: Layers,
      title: "M&E and Learning",
      desc: "Data, impact measurement, and cross-country learning",
      color: "blue",
    },
  ];

  // ============================================================
  // Render
  // ============================================================
  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-emerald-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-300">Loading CSO workspace…</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 text-slate-200">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-10">
        {/* ======================================================
            HERO — green banner (kept, upgraded)
        ====================================================== */}
        <section className="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-950 via-emerald-900/60 to-slate-900 p-8 md:p-10 mb-8 shadow-2xl">
          {/* decorative gradient blobs */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
          </div>
          {/* big watermark */}
          <div className="absolute right-0 top-0 text-[180px] font-black text-white/[0.03] select-none pointer-events-none leading-none">
            CSO
          </div>

          <div className="relative z-10">
            <div className="flex flex-wrap items-start gap-6 mb-8">
              <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 backdrop-blur">
                <Users className="w-10 h-10 text-emerald-300" />
              </div>
              <div className="flex-1 min-w-[260px]">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-mono tracking-wider">
                    CSO & NGO COLLABORATION PORTAL
                  </span>
                  {liveStats.activeAlerts > 0 && (
                    <Link
                      href="/notifications"
                      className="px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-mono tracking-wider flex items-center gap-1.5 hover:bg-amber-500/25 transition-colors"
                    >
                      <Bell className="w-3 h-3" />
                      {liveStats.activeAlerts} active alert
                      {liveStats.activeAlerts !== 1 && "s"}
                    </Link>
                  )}
                </div>
                <h1 className="text-3xl md:text-5xl font-black text-white leading-tight">
                  {user?.full_name
                    ? `Welcome back, ${user.full_name.split(" ")[0]}`
                    : "CSO & NGO Collaboration Portal"}
                </h1>
                <p className="text-emerald-100/80 mt-3 text-base md:text-lg max-w-3xl">
                  Collaborate, advocate, share reforms, and build strategic
                  partnerships across Africa's mental health ecosystem.
                </p>
              </div>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <QuickStat
                label="Active Partnerships"
                value={liveStats.partnerships || 42}
                icon={Handshake}
              />
              <QuickStat
                label="Advocacy Campaigns"
                value={liveStats.campaigns || 18}
                icon={Megaphone}
              />
              <QuickStat
                label="Member Organizations"
                value={liveStats.organizations || "120+"}
                icon={Building2}
              />
              <QuickStat
                label="Countries Connected"
                value="20+"
                icon={Globe2}
              />
            </div>

            {/* CTA row */}
            <div className="flex flex-wrap gap-3 mt-8">
              <Link
                href="/advocacy-campaigns"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-emerald-900 font-semibold hover:bg-emerald-50 transition-colors shadow-lg"
              >
                <Megaphone className="w-4 h-4" />
                Browse Campaigns
              </Link>
              <Link
                href="/organizations"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-100 font-semibold hover:bg-emerald-500/25 transition-colors"
              >
                <Building2 className="w-4 h-4" />
                Find Partners
              </Link>
              <Link
                href="/events"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-100 font-semibold hover:bg-emerald-500/25 transition-colors"
              >
                <Calendar className="w-4 h-4" />
                Upcoming Events
              </Link>
            </div>
          </div>
        </section>

        {/* ======================================================
            KPI GRID
        ====================================================== */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {kpis.map((kpi) => (
            <KPICard key={kpi.label} kpi={kpi} />
          ))}
        </section>

        {/* ======================================================
            PROGRAM AREAS — what a mental health CSO focuses on
        ====================================================== */}
        <section className="mb-10">
          <div className="flex items-end justify-between mb-5 flex-wrap gap-3">
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-white">
                Our Program Areas
              </h2>
              <p className="text-slate-400 mt-1 text-sm">
                The core pillars of mental health civil society work across
                Africa.
              </p>
            </div>
            <span className="text-xs text-slate-500 font-mono">
              6 PILLARS
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {programAreas.map((area) => {
              const Icon = area.icon;
              const accent = ACCENTS[area.color] || ACCENTS.emerald;
              return (
                <div
                  key={area.title}
                  className={`relative overflow-hidden rounded-2xl border ${accent.border} bg-slate-900/60 backdrop-blur p-5 hover:bg-slate-800/60 transition-colors group`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2.5 rounded-xl ${accent.bg} border ${accent.border}`}
                    >
                      <Icon className={`w-5 h-5 ${accent.text}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-bold">{area.title}</h3>
                      <p className="text-slate-400 text-sm mt-1 leading-relaxed">
                        {area.desc}
                      </p>
                    </div>
                  </div>
                  <div
                    className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${accent.glow} to-transparent opacity-0 group-hover:opacity-100 transition-opacity`}
                  />
                </div>
              );
            })}
          </div>
        </section>

        {/* ======================================================
            MAIN GRID: Projects + Alerts
        ====================================================== */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          {/* Active projects */}
          <div className="lg:col-span-2 rounded-3xl border border-slate-700/60 bg-slate-900/60 backdrop-blur p-6 md:p-8">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <div>
                <h2 className="text-2xl md:text-3xl font-black text-white">
                  Active Continental Projects
                </h2>
                <p className="text-slate-400 mt-1 text-sm">
                  Live advocacy and reform collaborations.
                </p>
              </div>
              <Link
                href="/advocacy-campaigns"
                className="inline-flex items-center gap-1 text-sm text-emerald-400 hover:text-emerald-300 font-semibold"
              >
                View all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {activeProjects.length === 0 ? (
              <EmptyRow
                icon={FileText}
                title="No active projects yet"
                sub="Be the first to launch a continental campaign."
                cta={{ label: "Launch campaign", href: "/advocacy-campaigns/new" }}
              />
            ) : (
              <div className="space-y-4">
                {activeProjects.map((p) => (
                  <ProjectRow key={p.id} project={p} />
                ))}
              </div>
            )}
          </div>

          {/* Announcements / Alerts */}
          <div className="rounded-3xl border border-slate-700/60 bg-slate-900/60 backdrop-blur p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <Bell className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white">Announcements</h2>
                <p className="text-slate-400 text-xs mt-0.5">
                  Latest coalition updates.
                </p>
              </div>
            </div>

            {recentAlerts.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle2 className="w-10 h-10 text-emerald-500/50 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">
                  You're all caught up. No new alerts.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentAlerts.map((a) => (
                  <AlertRow key={a.id} alert={a} />
                ))}
              </div>
            )}

            <Link
              href="/notifications"
              className="mt-5 inline-flex items-center gap-2 text-sm text-amber-400 hover:text-amber-300 font-semibold"
            >
              View all notifications
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* ======================================================
            EVENTS
        ====================================================== */}
        <section className="rounded-3xl border border-slate-700/60 bg-slate-900/60 backdrop-blur p-6 md:p-8">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-white">
                Upcoming Continental Events
              </h2>
              <p className="text-slate-400 mt-1 text-sm">
                Conferences, trainings, advocacy events, and policy dialogues.
              </p>
            </div>
            <Link
              href="/events"
              className="inline-flex items-center gap-1 text-sm text-cyan-400 hover:text-cyan-300 font-semibold"
            >
              View all events <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {upcomingEvents.length === 0 ? (
            <EmptyRow
              icon={Calendar}
              title="No upcoming events"
              sub="Check back soon for continental conferences and trainings."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {upcomingEvents.map((e) => (
                <EventCard key={e.id} event={e} />
              ))}
            </div>
          )}
        </section>

        {/* ======================================================
            FOOTER NOTE
        ====================================================== */}
        <p className="text-center text-slate-500 text-xs mt-10">
          AMHROA · Continental CSO collaboration network · Data refreshed live
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
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
}) {
  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 backdrop-blur p-4 hover:bg-white/10 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <p className="text-emerald-100/70 text-xs font-medium">{label}</p>
        <Icon className="w-4 h-4 text-emerald-300/60" />
      </div>
      <p className="text-2xl md:text-3xl font-black text-white">{value}</p>
    </div>
  );
}

function KPICard({ kpi }: { kpi: KPI }) {
  const accent = ACCENTS[kpi.accent] || ACCENTS.emerald;
  const Icon = kpi.icon;
  const isPositive = (kpi.delta ?? 0) >= 0;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border ${accent.border} bg-slate-900/60 backdrop-blur p-5 hover:bg-slate-800/60 transition-colors`}
    >
      <div className="flex items-start justify-between mb-4">
        <p className="text-slate-400 text-xs font-medium uppercase tracking-wide">
          {kpi.label}
        </p>
        <div className={`p-2 rounded-xl ${accent.bg} border ${accent.border}`}>
          <Icon className={`w-4 h-4 ${accent.text}`} />
        </div>
      </div>
      <div className="flex items-end gap-3">
        <h2 className={`text-3xl md:text-4xl font-black ${accent.text}`}>
          {kpi.value}
        </h2>
        {kpi.delta !== undefined && (
          <span
            className={`text-xs font-bold flex items-center gap-1 pb-1 ${
              isPositive ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {isPositive ? (
              <TrendingUp className="w-3.5 h-3.5" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5" />
            )}
            {Math.abs(kpi.delta)}%
          </span>
        )}
      </div>
      <p className="text-slate-500 text-xs mt-2">{kpi.sublabel}</p>
    </div>
  );
}

function ProjectRow({ project }: { project: ProjectItem }) {
  const priorityStyle =
    project.priority === "Critical"
      ? "bg-rose-500/15 text-rose-300 border-rose-500/30"
      : project.priority === "High"
      ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
      : "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";

  const statusStyle =
    project.status === "Active"
      ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
      : project.status === "In Progress"
      ? "bg-cyan-500/15 text-cyan-300 border-cyan-500/30"
      : "bg-slate-500/15 text-slate-300 border-slate-500/30";

  return (
    <Link
      href={`/advocacy-campaigns/${project.id}`}
      className="block rounded-2xl border border-slate-700/60 bg-slate-800/40 hover:bg-slate-800/70 hover:border-emerald-500/40 p-5 transition-all group"
    >
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex-1 min-w-[240px]">
          <h3 className="text-white font-bold text-lg group-hover:text-emerald-300 transition-colors">
            {project.title}
          </h3>
          <p className="text-slate-400 text-sm mt-1.5 line-clamp-2">
            {project.description}
          </p>
          {project.countries && project.countries.length > 0 && (
            <div className="flex items-center gap-1.5 mt-3 text-xs text-slate-500">
              <MapPin className="w-3 h-3" />
              {project.countries.join(", ")}
            </div>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusStyle}`}
          >
            {project.status}
          </span>
          {project.priority && (
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold border ${priorityStyle}`}
            >
              {project.priority} Priority
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

function AlertRow({ alert }: { alert: AlertItem }) {
  const style =
    alert.severity === "high"
      ? {
          bg: "bg-rose-500/10",
          border: "border-rose-500/30",
          text: "text-rose-300",
          dot: "bg-rose-400",
        }
      : alert.severity === "medium"
      ? {
          bg: "bg-amber-500/10",
          border: "border-amber-500/30",
          text: "text-amber-300",
          dot: "bg-amber-400",
        }
      : {
          bg: "bg-blue-500/10",
          border: "border-blue-500/30",
          text: "text-blue-300",
          dot: "bg-blue-400",
        };

  return (
    <Link
      href="/notifications"
      className={`block rounded-xl border ${style.border} ${style.bg} p-4 hover:scale-[1.01] transition-transform`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`mt-1.5 w-2 h-2 rounded-full ${style.dot} shrink-0 animate-pulse`}
        />
        <div className="flex-1 min-w-0">
          <h4 className={`font-semibold text-sm ${style.text}`}>
            {alert.title}
          </h4>
          <p className="text-slate-400 text-xs mt-1 line-clamp-2">
            {alert.message}
          </p>
        </div>
      </div>
    </Link>
  );
}

function EventCard({ event }: { event: EventItem }) {
  const date = new Date(event.start_date);
  const day = date.getDate();
  const month = date
    .toLocaleDateString("en-US", { month: "short" })
    .toUpperCase();

  return (
    <Link
      href={`/events?id=${event.id}`}
      className="rounded-2xl border border-slate-700/60 bg-slate-800/40 hover:bg-slate-800/70 hover:border-cyan-500/40 p-5 transition-all block group"
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
          <p className="text-slate-400 text-xs mt-1 line-clamp-2">
            {event.description}
          </p>
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

function EmptyRow({
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
    <div className="text-center py-10 rounded-2xl border border-dashed border-slate-700/60">
      <Icon className="w-10 h-10 text-slate-600 mx-auto mb-3" />
      <p className="text-white font-semibold">{title}</p>
      <p className="text-slate-400 text-sm mt-1">{sub}</p>
      {cta && (
        <Link
          href={cta.href}
          className="inline-flex items-center gap-1 mt-4 px-4 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-sm font-semibold hover:bg-emerald-500/25 transition-colors"
        >
          {cta.label}
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      )}
    </div>
  );
}