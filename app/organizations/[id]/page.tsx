"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { CountrySelect } from "@/components/ui/country-select";
import {
  ArrowLeft,
  Building2,
  Users,
  MapPin,
  Globe,
  Mail,
  Phone,
  Calendar,
  Target,
  Award,
  Heart,
  BookOpen,
  Handshake,
  FileText,
  ExternalLink,
  CheckCircle,
  Clock,
  Briefcase,
  GraduationCap,
  Database,
  Share2,
  MessageSquare,
  UserPlus,
  Star,
  TrendingUp,
  Shield,
  Layers,
  Download,
  Eye,
  Loader2,
  AlertCircle,
  Sparkles,
  Flag,
  Crown,
  Activity,
  DollarSign,
  Link as LinkIcon,
  Copy,
  Send,
  X,
} from "lucide-react";

// ============================================================
// Types
// ============================================================
interface Organization {
  id: string;
  name: string;
  type: string;
  country: string;
  region: string;
  description: string;
  registration_number: string;
  website: string;
  contact_person: string;
  contact_email: string;
  contact_phone: string;
  focus_areas: string[];
  status: string;
  created_at: string;
  approved_at?: string;
  created_by: string;
  logo_url?: string;
  created_by_user?: {
    full_name: string;
    email: string;
  };
}

interface Activity {
  id: string;
  title: string;
  description: string;
  status: string;
  budget: number;
  start_date: string;
  end_date: string;
}

interface Collaboration {
  id: string;
  partner_organization_name: string;
  type: string;
  status: string;
  start_date: string;
  description: string;
  focus_areas: string[];
}

interface Resource {
  id: string;
  title: string;
  description: string;
  type: string;
  url?: string;
  access_level: string;
  views: number;
  downloads: number;
  created_at: string;
}

interface EventItem {
  id: string;
  title: string;
  description: string;
  event_type: string;
  start_date: string;
  country?: string;
  is_virtual: boolean;
}

interface ReportItem {
  id: string;
  title: string;
  report_type: string;
  status: string;
  created_at: string;
  file_url?: string;
}

interface TeamMember {
  id: string;
  full_name: string;
  role: string;
  avatar_url?: string;
}

// ============================================================
// Helpers
// ============================================================
const ORG_TYPE_COLORS: Record<string, string> = {
  NGO: "bg-emerald-500/15 border-emerald-500/30 text-emerald-300",
  CBO: "bg-cyan-500/15 border-cyan-500/30 text-cyan-300",
  FBO: "bg-amber-500/15 border-amber-500/30 text-amber-300",
  Government: "bg-purple-500/15 border-purple-500/30 text-purple-300",
  Research: "bg-blue-500/15 border-blue-500/30 text-blue-300",
  Academic: "bg-indigo-500/15 border-indigo-500/30 text-indigo-300",
  Hospital: "bg-rose-500/15 border-rose-500/30 text-rose-300",
  Development: "bg-teal-500/15 border-teal-500/30 text-teal-300",
  Private: "bg-slate-500/15 border-slate-500/30 text-slate-300",
};

const getOrgTypeStyle = (type: string) => {
  const key = Object.keys(ORG_TYPE_COLORS).find((k) =>
    (type || "").includes(k)
  );
  return key
    ? ORG_TYPE_COLORS[key]
    : "bg-slate-500/15 border-slate-500/30 text-slate-300";
};

const STATUS_STYLES: Record<string, string> = {
  Approved: "bg-emerald-500/15 border-emerald-500/30 text-emerald-300",
  active: "bg-emerald-500/15 border-emerald-500/30 text-emerald-300",
  Active: "bg-emerald-500/15 border-emerald-500/30 text-emerald-300",
  Published: "bg-cyan-500/15 border-cyan-500/30 text-cyan-300",
  Upcoming: "bg-purple-500/15 border-purple-500/30 text-purple-300",
  Planning: "bg-amber-500/15 border-amber-500/30 text-amber-300",
  Pending: "bg-amber-500/15 border-amber-500/30 text-amber-300",
  Draft: "bg-slate-500/15 border-slate-500/30 text-slate-300",
  Completed: "bg-blue-500/15 border-blue-500/30 text-blue-300",
};

const getStatusStyle = (s: string) =>
  STATUS_STYLES[s] || "bg-slate-500/15 border-slate-500/30 text-slate-300";

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

// ============================================================
// Component
// ============================================================
export default function OrganizationProfilePage() {
  const router = useRouter();
  const params = useParams();
  const orgId = params?.id as string;

  const [viewer, setViewer] = useState<any>(null);
  const [org, setOrg] = useState<Organization | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [collaborations, setCollaborations] = useState<Collaboration[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [isMember, setIsMember] = useState(false);
  const [hasPendingRequest, setHasPendingRequest] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Join request modal
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinMessage, setJoinMessage] = useState("");
  const [submittingJoin, setSubmittingJoin] = useState(false);

  // ============================================================
  // Init
  // ============================================================
  useEffect(() => {
    if (!orgId) return;
    init();
  }, [orgId]);

  const init = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Load viewer (may be anonymous)
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
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data } = await supabase
            .from("users")
            .select("id, full_name, email, role, country, status")
            .eq("auth_user_id", session.user.id)
            .single();
          profile = data;
          if (profile) localStorage.setItem("user", JSON.stringify(profile));
        }
      }
      setViewer(profile);

      // 2. Fetch org (public data)
      const { data: orgData, error: orgError } = await supabase
        .from("organizations")
        .select("*")
        .eq("id", orgId)
        .maybeSingle();

      if (orgError) throw orgError;
      if (!orgData) {
        setError("Organization not found");
        return;
      }

      // Fetch creator info separately
      let createdByName = "Unknown";
      let createdByEmail = "";
      if (orgData.created_by) {
        const { data: creator } = await supabase
          .from("users")
          .select("full_name, email")
          .eq("id", orgData.created_by)
          .maybeSingle();
        if (creator) {
          createdByName = creator.full_name || "Unknown";
          createdByEmail = creator.email || "";
        }
      }

      const fullOrg: Organization = {
        ...orgData,
        created_by_user: {
          full_name: createdByName,
          email: createdByEmail,
        },
      };
      setOrg(fullOrg);

      // 3. Parallel fetch all profile data
      await Promise.all([
        fetchActivities(orgId),
        fetchCollaborations(orgId),
        fetchResources(orgId),
        fetchEvents(orgId),
        fetchReports(orgId, orgData.country),
        fetchTeam(orgId),
        checkMembership(profile, orgId),
      ]);
    } catch (err: any) {
      console.error("Profile init error:", err);
      setError(err?.message || "Failed to load organization");
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // Data fetchers
  // ============================================================
  const fetchActivities = async (id: string) => {
    try {
      const { data } = await supabase
        .from("organization_activities")
        .select("*")
        .eq("organization_id", id)
        .order("created_at", { ascending: false })
        .limit(6);
      if (data) {
        setActivities(
          data.map((a: any) => ({
            id: a.id,
            title: a.action || "Untitled Activity",
            description: a.details?.description || "",
            status: a.details?.status || "Planning",
            budget: a.details?.budget || 0,
            start_date: a.details?.start_date || a.created_at,
            end_date: a.details?.end_date || "",
          }))
        );
      }
    } catch (err) {
      console.warn("activities fetch:", err);
    }
  };

  const fetchCollaborations = async (id: string) => {
    try {
      const { data } = await supabase
        .from("collaborations")
        .select("*")
        .or(`organization_id.eq.${id},partner_organization_id.eq.${id}`)
        .eq("status", "active")
        .limit(8);
      if (data) setCollaborations(data);
    } catch (err) {
      console.warn("collaborations fetch:", err);
    }
  };

  const fetchResources = async (id: string) => {
    try {
      const { data } = await supabase
        .from("shared_resources")
        .select("*")
        .eq("organization_id", id)
        .order("created_at", { ascending: false })
        .limit(6);
      if (data) setResources(data);
    } catch (err) {
      console.warn("resources fetch:", err);
    }
  };

  const fetchEvents = async (id: string) => {
    try {
      const { data } = await supabase
        .from("events")
        .select("id, title, description, event_type, start_date, country, is_virtual")
        .eq("organization_id", id)
        .eq("approval_status", "Approved")
        .gte("start_date", new Date().toISOString())
        .order("start_date", { ascending: true })
        .limit(4);
      if (data) setEvents(data);
    } catch (err) {
      console.warn("events fetch:", err);
    }
  };

  const fetchReports = async (id: string, country?: string) => {
    if (!country) return;
    try {
      const { data } = await supabase
        .from("reports")
        .select("id, title, report_type, status, created_at, file_url")
        .eq("country", country)
        .order("created_at", { ascending: false })
        .limit(4);
      if (data) setReports(data);
    } catch (err) {
      console.warn("reports fetch:", err);
    }
  };

  const fetchTeam = async (id: string) => {
    try {
      const { data: members } = await supabase
        .from("organization_members")
        .select("user_id, role")
        .eq("organization_id", id)
        .limit(12);
      if (!members || members.length === 0) return;

      const userIds = members.map((m) => m.user_id).filter(Boolean);
      const { data: users } = await supabase
        .from("users")
        .select("id, full_name, avatar_url")
        .in("id", userIds);
      if (!users) return;

      const usersMap = users.reduce((acc: any, u: any) => {
        acc[u.id] = u;
        return acc;
      }, {});

      setTeam(
        members
          .filter((m) => usersMap[m.user_id])
          .map((m) => ({
            id: m.user_id,
            full_name: usersMap[m.user_id].full_name || "Unknown",
            role: m.role || "Member",
            avatar_url: usersMap[m.user_id].avatar_url,
          }))
      );
    } catch (err) {
      console.warn("team fetch:", err);
    }
  };

  const checkMembership = async (profile: any, id: string) => {
    if (!profile?.id) return;
    try {
      const { data: member } = await supabase
        .from("organization_members")
        .select("id")
        .eq("organization_id", id)
        .eq("user_id", profile.id)
        .maybeSingle();
      setIsMember(!!member);

      const { data: req } = await supabase
        .from("organization_join_requests")
        .select("id")
        .eq("organization_id", id)
        .eq("user_id", profile.id)
        .eq("status", "pending")
        .maybeSingle();
      setHasPendingRequest(!!req);
    } catch (err) {
      // tables may not exist — ignore
    }
  };

  // ============================================================
  // Actions
  // ============================================================
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRequestJoin = async () => {
    if (!viewer) {
      router.push("/login");
      return;
    }
    setSubmittingJoin(true);
    try {
      const { error } = await supabase
        .from("organization_join_requests")
        .insert({
          organization_id: orgId,
          user_id: viewer.id,
          user_name: viewer.full_name || viewer.email,
          user_email: viewer.email,
          message: joinMessage || null,
          status: "pending",
          created_at: new Date().toISOString(),
        });
      if (error) throw error;

      setHasPendingRequest(true);
      setShowJoinModal(false);
      setJoinMessage("");
      alert("Join request sent. The organization will review it shortly.");
    } catch (err: any) {
      console.error("join request:", err);
      alert(err?.message || "Failed to send join request");
    } finally {
      setSubmittingJoin(false);
    }
  };

  const canManage = () => {
    if (!viewer || !org) return false;
    if (viewer.role === "Admin") return true;
    return org.created_by === viewer.id || isMember;
  };

  // ============================================================
  // Render
  // ============================================================
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-14 h-14 text-cyan-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-300">Loading organization profile…</p>
        </div>
      </div>
    );
  }

  if (error || !org) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 flex items-center justify-center p-4">
        <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">
            Organization Not Found
          </h2>
          <p className="text-slate-400 mb-6">
            {error || "The organization you're looking for doesn't exist."}
          </p>
          <Link
            href="/organizations"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-cyan-600 hover:bg-cyan-700 rounded-xl text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Organizations
          </Link>
        </div>
      </div>
    );
  }

  // ============================================================
  // Derived
  // ============================================================
  const totalImpact = activities.reduce((s, a) => s + (a.budget || 0), 0);
  const activeActivities = activities.filter(
    (a) => a.status === "Active" || a.status === "In Progress"
  ).length;

  const typeStyle = getOrgTypeStyle(org.type);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 text-slate-200">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-10">
        {/* Back link */}
        <Link
          href="/organizations"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-cyan-400 mb-6 transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Organizations
        </Link>

        {/* ============================================
            HERO
        ============================================ */}
        <section className="relative overflow-hidden rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-cyan-950 via-slate-900/80 to-slate-900 p-6 md:p-10 mb-6 shadow-2xl">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10">
            <div className="flex flex-wrap items-start gap-6">
              {/* Logo / avatar */}
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center backdrop-blur shrink-0 overflow-hidden">
                {org.logo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={org.logo_url}
                    alt={org.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Building2 className="w-10 h-10 text-cyan-300" />
                )}
              </div>

              {/* Name + meta */}
              <div className="flex-1 min-w-[260px]">
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <span
                    className={`px-2.5 py-1 rounded-full border text-xs font-bold uppercase tracking-wider ${typeStyle}`}
                  >
                    {org.type}
                  </span>
                  <span
                    className={`px-2.5 py-1 rounded-full border text-xs font-semibold ${getStatusStyle(
                      org.status
                    )}`}
                  >
                    {org.status}
                  </span>
                  <span className="px-2.5 py-1 rounded-full border text-xs font-mono bg-slate-800/60 border-slate-700 text-slate-400">
                    Reg #{org.registration_number || "—"}
                  </span>
                </div>

                <h1 className="text-3xl md:text-5xl font-black text-white leading-tight">
                  {org.name}
                </h1>

                <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-cyan-100/80">
                  {org.country && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4" />
                      {org.country}
                      {org.region && ` · ${org.region}`}
                    </span>
                  )}
                  {org.website && (
                    <a
                      href={org.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 hover:text-cyan-300 transition-colors"
                    >
                      <Globe className="w-4 h-4" />
                      {org.website.replace(/^https?:\/\//, "").slice(0, 40)}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    Member since {formatDate(org.approved_at || org.created_at)}
                  </span>
                </div>

                {/* Action buttons */}
                <div className="flex flex-wrap gap-3 mt-6">
                  {canManage() && (
                    <Link
                      href={`/organizations/collaboration-hub`}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-cyan-900 font-semibold hover:bg-cyan-50 transition-colors shadow-lg"
                    >
                      <Layers className="w-4 h-4" />
                      Open Workspace
                    </Link>
                  )}

                  {viewer && !isMember && !hasPendingRequest && (
                    <button
                      onClick={() => setShowJoinModal(true)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold hover:from-cyan-400 hover:to-blue-400 transition-all shadow-lg shadow-cyan-500/20"
                    >
                      <UserPlus className="w-4 h-4" />
                      Request to Join
                    </button>
                  )}

                  {hasPendingRequest && (
                    <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-200 font-semibold">
                      <Clock className="w-4 h-4" />
                      Join Request Pending
                    </span>
                  )}

                  {viewer && (
                    <Link
                      href={`/organizations/collaboration-hub`}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-100 font-semibold hover:bg-cyan-500/25 transition-colors"
                    >
                      <Handshake className="w-4 h-4" />
                      Request Collaboration
                    </Link>
                  )}

                  <button
                    onClick={handleCopyLink}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-semibold transition-colors"
                  >
                    {copied ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Share2 className="w-4 h-4" />
                        Share Profile
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Quick metrics ribbon */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/10">
              <MetricRibbon
                icon={Target}
                label="Active Programs"
                value={activeActivities}
              />
              <MetricRibbon
                icon={Handshake}
                label="Collaborations"
                value={collaborations.length}
              />
              <MetricRibbon
                icon={BookOpen}
                label="Resources"
                value={resources.length}
              />
              <MetricRibbon
                icon={DollarSign}
                label="Portfolio Value"
                value={
                  totalImpact > 0
                    ? `$${(totalImpact / 1000).toFixed(0)}K`
                    : "—"
                }
              />
            </div>
          </div>
        </section>

        {/* ============================================
            MAIN GRID
        ============================================ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ============ LEFT COLUMN (2/3) ============ */}
          <div className="lg:col-span-2 space-y-6">
            {/* About */}
            <Section
              icon={Building2}
              title="About the Organization"
              subtitle="Mission, focus, and continental positioning"
            >
              <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                {org.description || "No description provided."}
              </p>

              {org.focus_areas && org.focus_areas.length > 0 && (
                <div className="mt-6">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                    Focus Areas
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {org.focus_areas.map((area) => (
                      <span
                        key={area}
                        className="px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-sm font-medium"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </Section>

            {/* Programs / Activities */}
            {activities.length > 0 && (
              <Section
                icon={Target}
                title="Active Programs"
                subtitle={`${activities.length} program${
                  activities.length > 1 ? "s" : ""
                } on record`}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activities.map((a) => (
                    <div
                      key={a.id}
                      className="rounded-2xl border border-slate-700/60 bg-slate-800/40 p-4 hover:border-cyan-500/40 hover:bg-slate-800/70 transition-all"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span
                          className={`px-2 py-0.5 rounded-full border text-xs font-semibold ${getStatusStyle(
                            a.status
                          )}`}
                        >
                          {a.status}
                        </span>
                        {a.budget > 0 && (
                          <span className="text-cyan-300 font-mono text-sm">
                            ${a.budget.toLocaleString()}
                          </span>
                        )}
                      </div>
                      <h4 className="text-white font-bold">{a.title}</h4>
                      <p className="text-slate-400 text-sm mt-1 line-clamp-2">
                        {a.description || "No description"}
                      </p>
                      <div className="flex items-center gap-3 mt-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(a.start_date)}
                        </span>
                        {a.end_date && (
                          <span>→ {formatDate(a.end_date)}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Collaborations */}
            {collaborations.length > 0 && (
              <Section
                icon={Handshake}
                title="Collaboration Network"
                subtitle="Active partnerships across the continent"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {collaborations.map((c) => (
                    <div
                      key={c.id}
                      className="rounded-2xl border border-slate-700/60 bg-slate-800/40 p-4"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-emerald-500/15 border border-emerald-500/30">
                          <Handshake className="w-4 h-4 text-emerald-300" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-semibold truncate">
                            {c.partner_organization_name || "Partner"}
                          </p>
                          <p className="text-xs text-slate-500 capitalize">
                            {c.type}
                          </p>
                        </div>
                      </div>
                      <p className="text-slate-400 text-sm line-clamp-2">
                        {c.description}
                      </p>
                      <div className="flex items-center gap-2 mt-3 text-xs text-slate-500">
                        <Clock className="w-3 h-3" />
                        Since {formatDate(c.start_date)}
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Shared resources */}
            {resources.length > 0 && (
              <Section
                icon={Database}
                title="Published Resources"
                subtitle="Open and partner-only knowledge assets"
              >
                <div className="space-y-3">
                  {resources.map((r) => (
                    <div
                      key={r.id}
                      className="rounded-xl border border-slate-700/60 bg-slate-800/40 p-4 hover:border-cyan-500/40 hover:bg-slate-800/70 transition-all"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-cyan-500/15 border border-cyan-500/30 shrink-0">
                          <FileText className="w-4 h-4 text-cyan-300" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 flex-wrap">
                            <p className="text-white font-semibold">
                              {r.title}
                            </p>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700/60 text-slate-300">
                              {r.type}
                            </span>
                          </div>
                          <p className="text-slate-400 text-sm mt-1 line-clamp-2">
                            {r.description}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {r.views || 0}
                            </span>
                            <span className="flex items-center gap-1">
                              <Download className="w-3 h-3" />
                              {r.downloads || 0}
                            </span>
                            <span className="flex items-center gap-1 capitalize">
                              <Shield className="w-3 h-3" />
                              {r.access_level}
                            </span>
                          </div>
                        </div>
                        {r.url && (
                          <a
                            href={r.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg hover:bg-slate-700 transition-colors shrink-0"
                          >
                            <ExternalLink className="w-4 h-4 text-cyan-400" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Reports */}
            {reports.length > 0 && (
              <Section
                icon={FileText}
                title="Recent Reports"
                subtitle={`Latest publications from ${org.country}`}
              >
                <div className="space-y-2">
                  {reports.map((r) => (
                    <div
                      key={r.id}
                      className="rounded-xl border border-slate-700/60 bg-slate-800/40 p-3 flex items-center justify-between gap-3 hover:bg-slate-800/70 transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2 rounded-lg bg-purple-500/15 border border-purple-500/30 shrink-0">
                          <FileText className="w-4 h-4 text-purple-300" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-white font-semibold truncate">
                            {r.title}
                          </p>
                          <p className="text-xs text-slate-500">
                            {r.report_type} · {formatDate(r.created_at)}
                          </p>
                        </div>
                      </div>
                      {r.file_url && (
                        <a
                          href={r.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg hover:bg-slate-700 transition-colors shrink-0"
                        >
                          <Eye className="w-4 h-4 text-cyan-400" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Empty state if nothing */}
            {activities.length === 0 &&
              collaborations.length === 0 &&
              resources.length === 0 &&
              reports.length === 0 && (
                <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/40 p-12 text-center">
                  <Sparkles className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-white font-semibold">
                    This organization hasn't published activity yet
                  </p>
                  <p className="text-slate-400 text-sm mt-1">
                    Check back soon, or reach out via the contact details below.
                  </p>
                </div>
              )}
          </div>

          {/* ============ RIGHT COLUMN (1/3) ============ */}
          <div className="space-y-6">
            {/* Contact card */}
            <Section icon={Mail} title="Contact" compact>
              <div className="space-y-3 text-sm">
                {org.contact_person && (
                  <ContactRow
                    icon={Users}
                    label="Contact Person"
                    value={org.contact_person}
                  />
                )}
                {org.contact_email && (
                  <ContactRow
                    icon={Mail}
                    label="Email"
                    value={org.contact_email}
                    href={`mailto:${org.contact_email}`}
                  />
                )}
                {org.contact_phone && (
                  <ContactRow
                    icon={Phone}
                    label="Phone"
                    value={org.contact_phone}
                    href={`tel:${org.contact_phone}`}
                  />
                )}
                {org.website && (
                  <ContactRow
                    icon={Globe}
                    label="Website"
                    value={org.website.replace(/^https?:\/\//, "")}
                    href={org.website}
                  />
                )}
                {org.country && (
                  <ContactRow
                    icon={MapPin}
                    label="Headquarters"
                    value={org.country}
                  />
                )}
              </div>
            </Section>

            {/* Team preview */}
            {team.length > 0 && (
              <Section
                icon={Users}
                title="Team"
                subtitle={`${team.length} member${
                  team.length > 1 ? "s" : ""
                }`}
                compact
              >
                <div className="space-y-2">
                  {team.slice(0, 5).map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-800/60 transition-colors"
                    >
                      <div className="w-9 h-9 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center shrink-0 overflow-hidden">
                        {m.avatar_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={m.avatar_url}
                            alt={m.full_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-cyan-300 font-bold text-sm">
                            {m.full_name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">
                          {m.full_name}
                        </p>
                        <p className="text-slate-500 text-xs truncate">
                          {m.role}
                        </p>
                      </div>
                    </div>
                  ))}
                  {team.length > 5 && (
                    <p className="text-slate-500 text-xs text-center pt-2">
                      +{team.length - 5} more members
                    </p>
                  )}
                </div>
              </Section>
            )}

            {/* Upcoming events */}
            {events.length > 0 && (
              <Section
                icon={Calendar}
                title="Upcoming Events"
                subtitle="Convenings hosted by this org"
                compact
              >
                <div className="space-y-3">
                  {events.map((e) => (
                    <Link
                      key={e.id}
                      href={`/events?id=${e.id}`}
                      className="block rounded-xl border border-slate-700/60 bg-slate-800/40 hover:border-cyan-500/40 hover:bg-slate-800/70 p-3 transition-all group"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-cyan-500/15 border border-cyan-500/30 text-cyan-300">
                          {e.event_type}
                        </span>
                        {e.is_virtual && (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-purple-500/15 border border-purple-500/30 text-purple-300">
                            Virtual
                          </span>
                        )}
                      </div>
                      <p className="text-white text-sm font-semibold group-hover:text-cyan-300 transition-colors line-clamp-2">
                        {e.title}
                      </p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                        <Calendar className="w-3 h-3" />
                        {formatDate(e.start_date)}
                        {e.country && (
                          <>
                            <span>·</span>
                            <MapPin className="w-3 h-3" />
                            {e.country}
                          </>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </Section>
            )}

            {/* Registered by */}
            <Section icon={Crown} title="Registered By" compact>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/40 border border-slate-700/60">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center shrink-0">
                  <span className="text-purple-300 font-bold text-sm">
                    {org.created_by_user?.full_name
                      ?.charAt(0)
                      .toUpperCase() || "?"}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-white text-sm font-semibold truncate">
                    {org.created_by_user?.full_name || "Unknown"}
                  </p>
                  <p className="text-slate-500 text-xs truncate">
                    {org.created_by_user?.email}
                  </p>
                </div>
              </div>
              <p className="text-slate-500 text-xs mt-3 text-center">
                Registered {formatDate(org.created_at)}
              </p>
            </Section>

            {/* Trust badge */}
            {org.status === "Approved" && (
              <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/40 via-slate-900/60 to-slate-900/40 p-5 text-center">
                <Shield className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <p className="text-white font-bold text-sm">
                  Verified AMHROA Member
                </p>
                <p className="text-slate-400 text-xs mt-1">
                  This organization has been reviewed and approved by the
                  AMHROA administration.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-500 text-xs mt-12">
          AMHROA · Continental Organizations Directory · Verified member profile
        </p>
      </div>

      {/* ============================================
          JOIN REQUEST MODAL
      ============================================ */}
      {showJoinModal && viewer && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setShowJoinModal(false)}
        >
          <div
            className="bg-slate-800 rounded-2xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-700 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-cyan-400" />
                Request to Join {org.name}
              </h2>
              <button
                onClick={() => setShowJoinModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-slate-300 text-sm">
                Your request will be reviewed by the organization's
                administrators. Once approved, you'll gain access to their
                collaboration workspace.
              </p>
              <div>
                <label className="text-slate-400 text-sm block mb-2">
                  Message (optional)
                </label>
                <textarea
                  value={joinMessage}
                  onChange={(e) => setJoinMessage(e.target.value)}
                  rows={4}
                  placeholder="Why do you want to join?"
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 resize-none focus:outline-none focus:border-cyan-500"
                />
              </div>
              <button
                onClick={handleRequestJoin}
                disabled={submittingJoin}
                className="w-full py-3 bg-cyan-600 hover:bg-cyan-700 rounded-xl text-white font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submittingJoin ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                {submittingJoin ? "Sending…" : "Send Request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// Sub-components
// ============================================================
function MetricRibbon({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 backdrop-blur p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-cyan-100/70 text-xs font-medium truncate">
          {label}
        </p>
        <Icon className="w-4 h-4 text-cyan-300/60 shrink-0" />
      </div>
      <p className="text-2xl md:text-3xl font-black text-white leading-none">
        {value}
      </p>
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  subtitle,
  children,
  compact = false,
}: {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-slate-700/60 bg-slate-900/60 backdrop-blur p-5 md:p-6">
      <div className="flex items-start gap-3 mb-5">
        <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 shrink-0">
          <Icon className="w-5 h-5 text-cyan-400" />
        </div>
        <div className="min-w-0">
          <h2
            className={`text-white font-black ${
              compact ? "text-lg" : "text-xl md:text-2xl"
            }`}
          >
            {title}
          </h2>
          {subtitle && (
            <p className="text-slate-400 text-xs mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}

function ContactRow({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  href?: string;
}) {
  const content = (
    <div className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-800/60 transition-colors">
      <Icon className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
      <div className="min-w-0">
        <p className="text-slate-500 text-xs uppercase tracking-wider">
          {label}
        </p>
        <p className="text-white text-sm font-medium truncate">{value}</p>
      </div>
    </div>
  );
  return href ? (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
      className="block"
    >
      {content}
    </a>
  ) : (
    content
  );
}