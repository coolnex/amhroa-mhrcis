"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { chatService } from "@/lib/chat-service";
import { GovernanceAlertsWidget } from "@/components/GovernanceAlertsWidget";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  Building2,
  FileText,
  Calendar,
  Award,
  Target,
  Globe,
  Briefcase,
  Heart,
  Shield,
  RefreshCw,
  Eye,
  ChevronRight,
  Star,
  Zap,
  AlertTriangle,
  CheckCircle,
  Clock,
  Loader2,
  PieChart,
  BarChart3,
  Sparkles,
  Wallet,
  Handshake,
  MapPin,
  ArrowRight,
  Crown,
  Activity,
  BookOpen,
} from "lucide-react";
import Link from "next/link";

// ============================================================
// Types
// ============================================================
interface DonorMetrics {
  total_investment: number;
  active_projects: number;
  countries_reached: number;
  beneficiaries: number;
  roi_avg: number;
  impact_score: number;
}

interface FundingRequest {
  id: string;
  researcher_id: string;
  title: string;
  amount_needed: number;
  amount_raised: number;
  country: string;
  status: "Open" | "Funded" | "Closed";
  created_at: string;
  researcher: {
    full_name: string;
    organization: string;
  };
}

interface Organization {
  id: string;
  name: string;
  type: string;
  country: string;
  status: string;
}

interface ResearchProject {
  id: string;
  title: string;
  country: string;
  status: string;
  budget: number;
}

type TabKey =
  | "overview"
  | "funding"
  | "organizations"
  | "workforce"
  | "events";

// ============================================================
// Helpers
// ============================================================
const formatMoney = (n: number, short = true) => {
  if (!n) return "$0";
  if (!short) return `$${n.toLocaleString()}`;
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
};

const getFundingProgress = (req: FundingRequest) => {
  if (!req.amount_needed) return 0;
  return Math.min(100, Math.round((req.amount_raised / req.amount_needed) * 100));
};

// ============================================================
// Component
// ============================================================
export default function DonorDashboard() {
  const router = useRouter();
  const [donor, setDonor] = useState<any>(null);
  const [metrics, setMetrics] = useState<DonorMetrics>({
    total_investment: 0,
    active_projects: 0,
    countries_reached: 0,
    beneficiaries: 0,
    roi_avg: 0,
    impact_score: 0,
  });
  const [fundingRequests, setFundingRequests] = useState<FundingRequest[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [researchProjects, setResearchProjects] = useState<ResearchProject[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [workforceData, setWorkforceData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<TabKey>("overview");
  const [donorType, setDonorType] = useState<"premium" | "standard">("standard");
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    checkDonor();
  }, []);

  // ============================================================
  // Auth
  // ============================================================
  const checkDonor = async () => {
    try {
      const userStr = localStorage.getItem("user");

      if (userStr) {
        try {
          const userData = JSON.parse(userStr);
          if (
            userData.role === "Donor" ||
            userData.role === "donor" ||
            userData.role === "donor_coordinator" ||
            userData.role === "Admin"
          ) {
            setDonor(userData);
            await fetchDonorData(userData);
            setLoading(false);
            return;
          }
        } catch {
          localStorage.removeItem("user");
        }
      }

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        router.push("/login");
        return;
      }

      // IMPORTANT: match on auth_user_id (not id)
      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("*")
        .eq("auth_user_id", session.user.id)
        .single();

      if (profileError || !profile) {
        router.push("/login");
        return;
      }

      const allowed = [
        "Donor",
        "donor",
        "donor_coordinator",
        "Admin",
      ];
      if (!allowed.includes(profile.role)) {
        router.push("/dashboard");
        return;
      }
      if (profile.status && profile.status !== "Approved") {
        router.push("/login?message=Account pending approval");
        return;
      }

      localStorage.setItem("user", JSON.stringify(profile));
      setDonor(profile);
      await fetchDonorData(profile);
    } catch (error) {
      console.error("Auth error:", error);
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // Data (unchanged from your original — just kept tidy)
  // ============================================================
  const fetchDonorData = async (currentUser?: any) => {
    setLoading(true);
    setError(null);

    try {
      const userId = currentUser?.id || donor?.id;
      if (!userId) {
        setError("User not found");
        setLoading(false);
        return;
      }

      // 1. Investments
      const { data: investments } = await supabase
        .from("investments")
        .select("amount, country")
        .eq("donor_id", userId);

      const totalInvested =
        investments?.reduce((sum, inv) => sum + (inv.amount || 0), 0) || 0;
      const uniqueCountries = [
        ...new Set(investments?.map((inv) => inv.country).filter(Boolean) || []),
      ];

      setDonorType(totalInvested >= 100000 ? "premium" : "standard");

      // 2. Funding requests + researcher names
      const { data: fundingData } = await supabase
        .from("funding_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (fundingData) {
        const researcherIds = fundingData
          .map((r) => r.researcher_id)
          .filter(Boolean);
        let researchersMap: Record<
          string,
          { full_name: string; organization: string }
        > = {};

        if (researcherIds.length > 0) {
          const { data: usersData } = await supabase
            .from("users")
            .select("id, full_name, organization")
            .in("id", researcherIds);
          if (usersData) {
            researchersMap = usersData.reduce((acc: any, u: any) => {
              acc[u.id] = {
                full_name: u.full_name || "Unknown",
                organization: u.organization || "N/A",
              };
              return acc;
            }, {});
          }
        }

        setFundingRequests(
          fundingData.map((request) => ({
            ...request,
            researcher: researchersMap[request.researcher_id] || {
              full_name: "Unknown",
              organization: "N/A",
            },
          }))
        );
      }

      // 3. Organizations
      const { data: orgData } = await supabase
        .from("organizations")
        .select("*")
        .eq("status", "Approved")
        .limit(12);
      if (orgData) setOrganizations(orgData);

      // 4. Research projects
      const { data: researchData } = await supabase
        .from("research_projects")
        .select("*")
        .eq("status", "Active")
        .limit(10);
      if (researchData) setResearchProjects(researchData);

      // 5. Events
      const { data: eventsData } = await supabase
        .from("events")
        .select("*")
        .eq("approval_status", "Approved")
        .gte("start_date", new Date().toISOString())
        .order("start_date", { ascending: true })
        .limit(6);
      if (eventsData) setEvents(eventsData);

      // 6. Workforce (best-effort)
      const { data: workforceRes } = await supabase
        .from("countries")
        .select("country_name, workforce_score, reform_score")
        .order("reform_score", { ascending: false, nullsFirst: false })
        .limit(10);
      if (workforceRes) setWorkforceData(workforceRes);

      // 7. Metrics
      setMetrics({
        total_investment: totalInvested,
        active_projects: researchData?.length || 0,
        countries_reached: uniqueCountries.length || 0,
        beneficiaries: Math.floor(totalInvested / 100) * 50,
        roi_avg: 18.5,
        impact_score: 92,
      });
    } catch (err) {
      console.error("Error fetching donor data:", err);
      setError("Failed to load some dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // Actions
  // ============================================================
  const handleFundRequest = async (requestId: string, amount: number) => {
    if (!donor) {
      alert("Please login to fund requests");
      return;
    }
    setActionLoading(requestId);
    try {
      // Placeholder — swap in your real funding flow
      alert(
        `Redirecting to fund request ${requestId} with ${formatMoney(amount, false)}`
      );
      await fetchDonorData(donor);
    } catch (error) {
      console.error("Error funding request:", error);
      alert("Failed to fund request. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  const logout = async () => {
    try {
      localStorage.removeItem("user");
      localStorage.removeItem("session");
      localStorage.removeItem("token");
      chatService.clearAllCache();
      await supabase.auth.signOut();
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // ============================================================
  // Derived
  // ============================================================
  const priorityRequests = useMemo(() => {
    // Sort by "closest to funded" first, then largest ask
    return [...fundingRequests]
      .filter((r) => r.status === "Open")
      .sort((a, b) => {
        const aPct = a.amount_raised / (a.amount_needed || 1);
        const bPct = b.amount_raised / (b.amount_needed || 1);
        if (Math.abs(bPct - aPct) > 0.05) return bPct - aPct;
        return b.amount_needed - a.amount_needed;
      });
  }, [fundingRequests]);

  const fundingStats = useMemo(() => {
    const totalAsked = fundingRequests.reduce(
      (a, r) => a + (r.amount_needed || 0),
      0
    );
    const totalRaised = fundingRequests.reduce(
      (a, r) => a + (r.amount_raised || 0),
      0
    );
    return {
      totalAsked,
      totalRaised,
      gap: totalAsked - totalRaised,
      open: fundingRequests.filter((r) => r.status === "Open").length,
      pctFunded: totalAsked > 0 ? Math.round((totalRaised / totalAsked) * 100) : 0,
    };
  }, [fundingRequests]);

  const recommendedActions = useMemo(() => {
    const actions: { text: string; severity: "high" | "medium" | "info"; href?: string }[] = [];

    // 1. Near-complete requests
    const almostFunded = fundingRequests.filter(
      (r) =>
        r.status === "Open" &&
        r.amount_raised / (r.amount_needed || 1) >= 0.75 &&
        r.amount_raised / (r.amount_needed || 1) < 1
    );
    if (almostFunded.length > 0) {
      actions.push({
        text: `${almostFunded.length} funding request${
          almostFunded.length > 1 ? "s are" : " is"
        } over 75% funded. A closing grant can unlock the project.`,
        severity: "high",
        href: "/donor?tab=funding",
      });
    }

    // 2. Critical funding gaps (country-based)
    const criticalCountries = workforceData.filter(
      (c) => (c.reform_score ?? 0) < 40
    );
    if (criticalCountries.length > 0) {
      actions.push({
        text: `${criticalCountries.length} countries with reform score below 40%. Priority region for catalytic investment.`,
        severity: "high",
        href: "/donor-intelligence",
      });
    }

    // 3. Workforce capacity
    const lowWorkforce = workforceData.filter(
      (c) => (c.workforce_score ?? 100) < 50
    );
    if (lowWorkforce.length > 0) {
      actions.push({
        text: `Workforce capacity is below 50% in ${lowWorkforce.length} countries. Consider multi-year capacity-building grants.`,
        severity: "medium",
        href: "/donor-intelligence",
      });
    }

    // 4. Donor intelligence nudge
    actions.push({
      text: "Explore the Investment Intelligence Hub for ROI-ranked opportunities across the continent.",
      severity: "info",
      href: "/donor-intelligence",
    });

    return actions.slice(0, 4);
  }, [fundingRequests, workforceData]);

  // ============================================================
  // Loading / guard
  // ============================================================
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-14 h-14 text-amber-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-300">Loading donor workspace…</p>
        </div>
      </div>
    );
  }

  // ============================================================
  // Render
  // ============================================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 text-slate-200">
      <GovernanceAlertsWidget
        userRole="Donor"
        userCountry={donor?.country || "Unknown"}
      />

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-10">
        {/* ============================================
            HERO
        ============================================ */}
        <section className="relative overflow-hidden rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-950 via-slate-900/80 to-slate-900 p-8 md:p-10 mb-8 shadow-2xl">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
          </div>
          <div className="absolute right-0 top-0 text-[180px] font-black text-white/[0.03] select-none pointer-events-none leading-none">
            DONOR
          </div>

          <div className="relative z-10">
            <div className="flex flex-wrap items-start gap-6 mb-8">
              <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 backdrop-blur">
                <Wallet className="w-10 h-10 text-amber-300" />
              </div>
              <div className="flex-1 min-w-[260px]">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <span className="px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-mono tracking-wider">
                    DONOR · INVESTMENT INTELLIGENCE
                  </span>
                  {donorType === "premium" && (
                    <span className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-400/20 to-yellow-400/20 border border-amber-400/40 text-amber-200 text-xs font-mono flex items-center gap-1.5">
                      <Crown className="w-3 h-3" />
                      PREMIUM ACCESS
                    </span>
                  )}
                </div>
                <h1 className="text-3xl md:text-5xl font-black text-white leading-tight">
                  {donor?.full_name
                    ? `Welcome back, ${donor.full_name.split(" ")[0]}`
                    : "Donor & Investment Intelligence"}
                </h1>
                <p className="text-amber-100/80 mt-3 text-base md:text-lg max-w-3xl">
                  Strategic capital deployment, impact tracking, and pipeline
                  visibility across Africa's mental health reform ecosystem.
                </p>
              </div>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <QuickStat
                label="Total Investment"
                value={formatMoney(metrics.total_investment)}
                icon={DollarSign}
                accent="amber"
              />
              <QuickStat
                label="Active Projects"
                value={metrics.active_projects}
                icon={Briefcase}
                accent="cyan"
              />
              <QuickStat
                label="Countries Reached"
                value={metrics.countries_reached}
                icon={Globe}
                accent="purple"
              />
              <QuickStat
                label="Impact Score"
                value={`${metrics.impact_score}/100`}
                icon={Award}
                accent="emerald"
              />
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3 mt-8">
              <Link
                href="/donor-intelligence"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-amber-900 font-semibold hover:bg-amber-50 transition-colors shadow-lg"
              >
                <PieChart className="w-4 h-4" />
                Investment Intelligence Hub
              </Link>
              <Link
                href="/funding-requests"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-100 font-semibold hover:bg-amber-500/25 transition-colors"
              >
                <Handshake className="w-4 h-4" />
                Browse Funding Requests
              </Link>
              <Link
                href="/admin/opportunities"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-100 font-semibold hover:bg-amber-500/25 transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                Post an Opportunity
              </Link>
            </div>
          </div>
        </section>

        {/* ============================================
            ERROR BANNER
        ============================================ */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-400 font-semibold">Heads up</p>
              <p className="text-red-300 text-sm">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-300"
            >
              ×
            </button>
          </div>
        )}

        {/* ============================================
            PORTFOLIO SNAPSHOT
        ============================================ */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
          {/* Portfolio composition */}
          <div className="lg:col-span-2 rounded-2xl border border-slate-700/60 bg-slate-900/60 backdrop-blur p-6">
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <BarChart3 className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white">
                    Portfolio Snapshot
                  </h2>
                  <p className="text-slate-400 text-xs mt-0.5">
                    Capital deployed across your investment portfolio.
                  </p>
                </div>
              </div>
              <Link
                href="/donor-intelligence"
                className="text-amber-400 hover:text-amber-300 text-sm font-semibold inline-flex items-center gap-1"
              >
                View intelligence hub
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <SnapshotTile
                label="Committed"
                value={formatMoney(metrics.total_investment)}
                sub="Lifetime capital"
                accent="amber"
              />
              <SnapshotTile
                label="Beneficiaries"
                value={metrics.beneficiaries.toLocaleString()}
                sub="Direct + indirect"
                accent="emerald"
              />
              <SnapshotTile
                label="Avg ROI"
                value={`${metrics.roi_avg}%`}
                sub="Annualized"
                accent="cyan"
              />
              <SnapshotTile
                label="Countries"
                value={metrics.countries_reached}
                sub="Active footprint"
                accent="purple"
              />
            </div>
          </div>

          {/* Premium insights */}
          <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-950/40 via-slate-900/60 to-slate-900/40 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30">
                {donorType === "premium" ? (
                  <Crown className="w-5 h-5 text-amber-300" />
                ) : (
                  <Star className="w-5 h-5 text-amber-300" />
                )}
              </div>
              <div>
                <h3 className="text-white font-black text-lg">
                  {donorType === "premium"
                    ? "Premium Concierge"
                    : "Standard Access"}
                </h3>
                <p className="text-slate-400 text-xs">
                  {donorType === "premium"
                    ? "All capabilities unlocked"
                    : "Upgrade for concierge support"}
                </p>
              </div>
            </div>
            <ul className="space-y-2.5 text-sm">
              {[
                {
                  label: "AI-powered investment recommendations",
                  unlocked: true,
                },
                { label: "Direct researcher matching", unlocked: true },
                {
                  label: "Exclusive impact reports",
                  unlocked: donorType === "premium",
                },
                {
                  label: "Priority event access",
                  unlocked: donorType === "premium",
                },
                {
                  label: "Dedicated concierge officer",
                  unlocked: donorType === "premium",
                },
              ].map((f, i) => (
                <li
                  key={i}
                  className={`flex items-start gap-2.5 ${
                    f.unlocked ? "text-slate-300" : "text-slate-500"
                  }`}
                >
                  <CheckCircle
                    className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                      f.unlocked ? "text-emerald-400" : "text-slate-600"
                    }`}
                  />
                  <span className={f.unlocked ? "" : "line-through"}>
                    {f.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ============================================
            RECOMMENDED ACTIONS
        ============================================ */}
        {recommendedActions.length > 0 && (
          <section className="rounded-2xl border border-cyan-500/20 bg-slate-900/60 backdrop-blur p-6 mb-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                <Zap className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white">
                  Recommended Next Actions
                </h2>
                <p className="text-slate-400 text-xs mt-0.5">
                  Based on your pipeline, coverage, and continental reform
                  signals.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {recommendedActions.map((rec, idx) => {
                const styles =
                  rec.severity === "high"
                    ? {
                        border: "border-rose-500/30",
                        bg: "bg-rose-500/5",
                      }
                    : rec.severity === "medium"
                    ? {
                        border: "border-amber-500/30",
                        bg: "bg-amber-500/5",
                      }
                    : {
                        border: "border-blue-500/30",
                        bg: "bg-blue-500/5",
                      };
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
                      <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${dot}`} />
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
            TABS
        ============================================ */}
        <section className="flex flex-wrap gap-2 mb-6 border-b border-slate-700 pb-4">
          <TabButton
            active={selectedTab === "overview"}
            onClick={() => setSelectedTab("overview")}
            icon={Activity}
            label="Overview"
          />
          <TabButton
            active={selectedTab === "funding"}
            onClick={() => setSelectedTab("funding")}
            icon={Handshake}
            label="Funding Pipeline"
            badge={priorityRequests.length || undefined}
          />
          <TabButton
            active={selectedTab === "organizations"}
            onClick={() => setSelectedTab("organizations")}
            icon={Building2}
            label="Organizations"
            badge={organizations.length || undefined}
          />
          <TabButton
            active={selectedTab === "workforce"}
            onClick={() => setSelectedTab("workforce")}
            icon={Users}
            label="Workforce"
          />
          <TabButton
            active={selectedTab === "events"}
            onClick={() => setSelectedTab("events")}
            icon={Calendar}
            label="Events"
            badge={events.length || undefined}
          />
        </section>

        {/* ============================================
            OVERVIEW
        ============================================ */}
        {selectedTab === "overview" && (
          <div className="space-y-6">
            {/* Priority pipeline preview */}
            <div className="rounded-2xl border border-slate-700/60 bg-slate-900/60 backdrop-blur p-6">
              <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <Target className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white">
                      Priority Funding Pipeline
                    </h3>
                    <p className="text-slate-400 text-xs mt-0.5">
                      Ranked by funding progress and impact proximity.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedTab("funding")}
                  className="text-emerald-400 hover:text-emerald-300 text-sm font-semibold inline-flex items-center gap-1"
                >
                  See full pipeline
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {priorityRequests.length === 0 ? (
                <div className="text-center py-10 rounded-2xl border border-dashed border-slate-700/60">
                  <Briefcase className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                  <p className="text-white font-semibold">
                    No open funding requests
                  </p>
                  <p className="text-slate-400 text-sm mt-1">
                    Check back soon — new research and program requests arrive
                    weekly.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {priorityRequests.slice(0, 4).map((req) => (
                    <FundingRequestRow
                      key={req.id}
                      request={req}
                      onFund={() =>
                        handleFundRequest(req.id, req.amount_needed)
                      }
                      loading={actionLoading === req.id}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* SDG impact + top orgs preview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* SDG Impact */}
              <div className="rounded-2xl border border-slate-700/60 bg-slate-900/60 backdrop-blur p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                    <Target className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white">
                      SDG Impact Alignment
                    </h3>
                    <p className="text-slate-400 text-xs mt-0.5">
                      How your portfolio maps to continental goals.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <ImpactBar label="SDG 3.4 · Mental Health" score={78} />
                  <ImpactBar label="SDG 10.2 · Social Inclusion" score={65} />
                  <ImpactBar label="SDG 16.3 · Rule of Law" score={72} />
                  <ImpactBar label="Agenda 2063 · Continental Unity" score={61} />
                </div>
              </div>

              {/* Top organizations */}
              <div className="rounded-2xl border border-slate-700/60 bg-slate-900/60 backdrop-blur p-6">
                <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20">
                      <Building2 className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-white">
                        Partner Organizations
                      </h3>
                      <p className="text-slate-400 text-xs mt-0.5">
                        Verified CSOs and institutes in the network.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedTab("organizations")}
                    className="text-purple-400 hover:text-purple-300 text-sm font-semibold inline-flex items-center gap-1"
                  >
                    View all
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {organizations.length === 0 ? (
                  <p className="text-slate-400 text-sm text-center py-6">
                    No approved organizations yet.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {organizations.slice(0, 5).map((org) => (
                      <div
                        key={org.id}
                        className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 hover:bg-slate-800/70 transition-colors"
                      >
                        <div className="w-9 h-9 rounded-lg bg-purple-500/15 border border-purple-500/30 flex items-center justify-center shrink-0">
                          <Building2 className="w-4 h-4 text-purple-300" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-semibold truncate">
                            {org.name}
                          </p>
                          <p className="text-slate-400 text-xs truncate">
                            {org.type} · {org.country}
                          </p>
                        </div>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 shrink-0">
                          Verified
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Upcoming events preview */}
            {events.length > 0 && (
              <div className="rounded-2xl border border-slate-700/60 bg-slate-900/60 backdrop-blur p-6">
                <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-pink-500/10 border border-pink-500/20">
                      <Calendar className="w-5 h-5 text-pink-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-white">
                        Upcoming Continental Events
                      </h3>
                      <p className="text-slate-400 text-xs mt-0.5">
                        High-level convenings for donor engagement.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedTab("events")}
                    className="text-pink-400 hover:text-pink-300 text-sm font-semibold inline-flex items-center gap-1"
                  >
                    See all events
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {events.slice(0, 3).map((event) => (
                    <Link
                      key={event.id}
                      href={`/events?id=${event.id}`}
                      className="group rounded-xl border border-slate-700/60 bg-slate-800/40 hover:bg-slate-800/70 hover:border-pink-500/40 p-4 transition-all"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-pink-500/15 border border-pink-500/30 text-pink-300 uppercase tracking-wider font-bold">
                          {event.event_type}
                        </span>
                      </div>
                      <h4 className="text-white font-bold group-hover:text-pink-300 transition-colors line-clamp-2">
                        {event.title}
                      </h4>
                      <p className="text-slate-400 text-xs mt-2 line-clamp-2">
                        {event.description}
                      </p>
                      <div className="flex items-center gap-3 mt-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(event.start_date).toLocaleDateString(
                            undefined,
                            { month: "short", day: "numeric" }
                          )}
                        </span>
                        {event.country && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {event.country}
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================
            FUNDING PIPELINE
        ============================================ */}
        {selectedTab === "funding" && (
          <div className="space-y-6">
            {/* Summary bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MiniStat
                label="Open Requests"
                value={fundingStats.open}
                accent="emerald"
              />
              <MiniStat
                label="Total Asked"
                value={formatMoney(fundingStats.totalAsked)}
                accent="cyan"
              />
              <MiniStat
                label="Total Raised"
                value={formatMoney(fundingStats.totalRaised)}
                accent="amber"
              />
              <MiniStat
                label="Funding Gap"
                value={formatMoney(fundingStats.gap)}
                accent="rose"
              />
            </div>

            {/* Requests list */}
            <div className="rounded-2xl border border-slate-700/60 bg-slate-900/60 backdrop-blur p-6">
              <h3 className="text-xl font-black text-white mb-5">
                Funding Requests
              </h3>
              {priorityRequests.length === 0 ? (
                <div className="text-center py-12 rounded-2xl border border-dashed border-slate-700/60">
                  <Briefcase className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                  <p className="text-white font-semibold">
                    No open requests right now
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {priorityRequests.map((req) => (
                    <FundingRequestRow
                      key={req.id}
                      request={req}
                      onFund={() =>
                        handleFundRequest(req.id, req.amount_needed)
                      }
                      loading={actionLoading === req.id}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================
            ORGANIZATIONS
        ============================================ */}
        {selectedTab === "organizations" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {organizations.map((org) => (
              <div
                key={org.id}
                className="rounded-2xl border border-slate-700/60 bg-slate-900/60 backdrop-blur p-5 hover:border-purple-500/40 hover:bg-slate-800/60 transition-all group"
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-11 h-11 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center shrink-0">
                    <Building2 className="w-5 h-5 text-purple-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-bold truncate group-hover:text-purple-300 transition-colors">
                      {org.name}
                    </h4>
                    <p className="text-slate-400 text-xs truncate">
                      {org.type}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
                  <MapPin className="w-3 h-3" />
                  {org.country}
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-slate-700/50">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
                    {org.status}
                  </span>
                  <Link
                    href={`/organizations/${org.id}`}
                    className="text-cyan-400 hover:text-cyan-300 text-sm font-semibold inline-flex items-center gap-1"
                  >
                    View
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
            {organizations.length === 0 && (
              <div className="col-span-full rounded-2xl border border-dashed border-slate-700/60 p-12 text-center">
                <Building2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">
                  No approved organizations yet.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ============================================
            WORKFORCE
        ============================================ */}
        {selectedTab === "workforce" && (
          <div className="rounded-2xl border border-slate-700/60 bg-slate-900/60 backdrop-blur overflow-hidden">
            <div className="p-5 border-b border-slate-700/50 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">
                  Mental Health Workforce & Reform by Country
                </h3>
                <p className="text-slate-400 text-xs mt-0.5">
                  Where capital is most catalytic right now.
                </p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-900/60">
                  <tr>
                    <th className="text-left p-4 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                      Country
                    </th>
                    <th className="text-left p-4 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                      Workforce Score
                    </th>
                    <th className="text-left p-4 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                      Reform Score
                    </th>
                    <th className="text-left p-4 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                      Investment Signal
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {workforceData.map((country, idx) => {
                    const reform = country.reform_score ?? 0;
                    const signal =
                      reform < 40
                        ? { label: "High opportunity", cls: "text-emerald-300 bg-emerald-500/15 border-emerald-500/30" }
                        : reform < 60
                        ? { label: "Catalytic", cls: "text-amber-300 bg-amber-500/15 border-amber-500/30" }
                        : { label: "Consolidate", cls: "text-blue-300 bg-blue-500/15 border-blue-500/30" };
                    return (
                      <tr
                        key={idx}
                        className="border-t border-slate-700/50 hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="p-4 font-semibold text-white">
                          {country.country_name}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="h-1.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
                                style={{
                                  width: `${country.workforce_score ?? 0}%`,
                                }}
                              />
                            </div>
                            <span className="text-slate-300 text-sm font-mono">
                              {country.workforce_score ?? 0}%
                            </span>
                          </div>
                        </td>
                        <td className="p-4 text-slate-300 font-mono">
                          {reform}%
                        </td>
                        <td className="p-4">
                          <span
                            className={`text-xs px-2 py-1 rounded-full border ${signal.cls}`}
                          >
                            {signal.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {workforceData.length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="p-12 text-center text-slate-400"
                      >
                        <Users className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                        No workforce data available yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ============================================
            EVENTS
        ============================================ */}
        {selectedTab === "events" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {events.map((event) => (
              <Link
                key={event.id}
                href={`/events?id=${event.id}`}
                className="rounded-2xl border border-slate-700/60 bg-slate-900/60 backdrop-blur p-5 hover:border-pink-500/40 hover:bg-slate-800/60 transition-all group"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-pink-500/15 border border-pink-500/30 text-pink-300 uppercase tracking-wider font-bold">
                    {event.event_type}
                  </span>
                </div>
                <h4 className="text-white font-bold text-lg group-hover:text-pink-300 transition-colors line-clamp-2">
                  {event.title}
                </h4>
                <p className="text-slate-400 text-sm mt-2 line-clamp-2">
                  {event.description}
                </p>
                <div className="flex items-center gap-4 mt-4 pt-3 border-t border-slate-700/50 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(event.start_date).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  {event.country && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {event.country}
                    </span>
                  )}
                </div>
              </Link>
            ))}
            {events.length === 0 && (
              <div className="col-span-full rounded-2xl border border-dashed border-slate-700/60 p-12 text-center">
                <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">No upcoming events</p>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-slate-500 text-xs mt-12">
          AMHROA · Donor & Investment Intelligence · Data refreshed live from
          the continental reform registry
        </p>
      </div>
    </div>
  );
}

// ============================================================
// Sub-components
// ============================================================
const ACCENTS: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  amber: {
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    border: "border-amber-500/20",
  },
  cyan: {
    bg: "bg-cyan-500/10",
    text: "text-cyan-400",
    border: "border-cyan-500/20",
  },
  purple: {
    bg: "bg-purple-500/10",
    text: "text-purple-400",
    border: "border-purple-500/20",
  },
  emerald: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    border: "border-emerald-500/20",
  },
  rose: {
    bg: "bg-rose-500/10",
    text: "text-rose-400",
    border: "border-rose-500/20",
  },
};

function QuickStat({
  label,
  value,
  icon: Icon,
  accent = "amber",
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  accent?: string;
}) {
  const a = ACCENTS[accent] || ACCENTS.amber;
  const display = String(value);
  const isLong = display.length > 12;
  return (
    <div
      className={`rounded-2xl bg-white/5 border border-white/10 backdrop-blur p-4 hover:bg-white/10 transition-colors min-w-0`}
    >
      <div className="flex items-center justify-between mb-2 gap-2">
        <p className="text-amber-100/70 text-xs font-medium truncate">
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

function SnapshotTile({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string | number;
  sub: string;
  accent: string;
}) {
  const a = ACCENTS[accent] || ACCENTS.amber;
  return (
    <div className={`rounded-2xl ${a.bg} border ${a.border} p-4`}>
      <p className="text-slate-400 text-xs uppercase tracking-wider mb-1.5">
        {label}
      </p>
      <p className={`text-2xl font-black ${a.text}`}>{value}</p>
      <p className="text-slate-500 text-xs mt-1">{sub}</p>
    </div>
  );
}

function MiniStat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent: string;
}) {
  const a = ACCENTS[accent] || ACCENTS.amber;
  return (
    <div className={`rounded-xl ${a.bg} border ${a.border} p-4`}>
      <p className={`text-xs font-semibold uppercase tracking-wider ${a.text}`}>
        {label}
      </p>
      <p className="text-2xl font-black text-white mt-1">{value}</p>
    </div>
  );
}

function ImpactBar({ label, score }: { label: string; score: number }) {
  const color =
    score >= 75
      ? "from-emerald-500 to-green-500"
      : score >= 55
      ? "from-cyan-500 to-blue-500"
      : score >= 40
      ? "from-amber-500 to-yellow-500"
      : "from-rose-500 to-red-500";
  const textColor =
    score >= 75
      ? "text-emerald-400"
      : score >= 55
      ? "text-cyan-400"
      : score >= 40
      ? "text-amber-400"
      : "text-rose-400";
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-slate-300 text-sm">{label}</span>
        <span className={`text-sm font-mono font-bold ${textColor}`}>
          {score}%
        </span>
      </div>
      <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
        <div
          className={`h-2 rounded-full bg-gradient-to-r ${color}`}
          style={{ width: `${score}%` }}
        />
      </div>
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
          ? "bg-amber-600 text-white shadow-lg shadow-amber-500/20"
          : "text-slate-400 hover:text-white hover:bg-slate-800"
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
      {badge !== undefined && badge > 0 && (
        <span
          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
            active ? "bg-white/20" : "bg-red-500 text-white"
          }`}
        >
          {badge}
        </span>
      )}
    </button>
  );
}

function FundingRequestRow({
  request,
  onFund,
  loading,
}: {
  request: FundingRequest;
  onFund: () => void;
  loading: boolean;
}) {
  const pct = getFundingProgress(request);
  const barColor =
    pct >= 75
      ? "from-emerald-500 to-green-500"
      : pct >= 40
      ? "from-cyan-500 to-blue-500"
      : "from-amber-500 to-yellow-500";

  return (
    <div className="rounded-2xl border border-slate-700/60 bg-slate-800/40 hover:bg-slate-800/70 hover:border-amber-500/30 p-5 transition-all">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex-1 min-w-[240px]">
          <h4 className="text-white font-bold text-lg">{request.title}</h4>
          <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {request.researcher?.full_name || "Unknown"}
            </span>
            {request.researcher?.organization && (
              <span className="flex items-center gap-1">
                <Building2 className="w-3 h-3" />
                {request.researcher.organization}
              </span>
            )}
            {request.country && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {request.country}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <span className="text-slate-400 text-xs uppercase tracking-wider">
            Goal
          </span>
          <span className="text-amber-300 font-black text-lg">
            {formatMoney(request.amount_needed)}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-4">
        <div className="flex justify-between items-center mb-1.5 text-xs">
          <span className="text-slate-400">
            {formatMoney(request.amount_raised)} raised
          </span>
          <span
            className={`font-bold ${
              pct >= 75
                ? "text-emerald-400"
                : pct >= 40
                ? "text-cyan-400"
                : "text-amber-400"
            }`}
          >
            {pct}%
          </span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
          <div
            className={`h-2 rounded-full bg-gradient-to-r ${barColor}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-700/50">
        <button
          onClick={onFund}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold hover:from-amber-400 hover:to-orange-400 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <DollarSign className="w-4 h-4" />
          )}
          {loading ? "Processing…" : "Fund This Project"}
        </button>
        <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-semibold transition-colors text-sm">
          <Eye className="w-4 h-4" />
          View Details
        </button>
        <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-semibold transition-colors text-sm">
          <BookOpen className="w-4 h-4" />
          Proposal
        </button>
      </div>
    </div>
  );
}