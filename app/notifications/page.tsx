// app/notifications/page.tsx
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  Bell,
  AlertTriangle,
  Info,
  CheckCircle,
  Clock,
  Globe,
  ArrowLeft,
  RefreshCw,
  Loader2,
  Filter,
  Search,
  X,
  Calendar,
  Users,
  Eye,
  EyeOff,
} from "lucide-react";

// ============================================================
// Types
// ============================================================
interface Alert {
  id: string;
  title: string;
  message: string;
  severity: "high" | "medium" | "low";
  type?: "critical" | "warning" | "info" | null;
  status: "active" | "inactive" | "expired";
  audience: string;
  country?: string | null;
  created_at: string;
  expires_at?: string | null;
  created_by?: string | null;
  updated_at?: string | null;
  /** Populated from alert_reads for the current user */
  is_read?: boolean;
}

type SeverityFilter = "all" | "high" | "medium" | "low";
type StatusFilter = "active" | "unread" | "read" | "all";

// ============================================================
// Helpers
// ============================================================
const SEVERITY_STYLES: Record<
  string,
  {
    label: string;
    icon: typeof AlertTriangle;
    cardBorder: string;
    cardBg: string;
    badge: string;
    iconColor: string;
    glow: string;
  }
> = {
  high: {
    label: "Critical",
    icon: AlertTriangle,
    cardBorder: "border-red-500/40",
    cardBg:
      "bg-gradient-to-br from-red-950/40 via-slate-900/60 to-slate-900/40",
    badge: "bg-red-500/20 text-red-300 border border-red-500/30",
    iconColor: "text-red-400",
    glow: "shadow-[0_0_30px_-10px_rgba(239,68,68,0.4)]",
  },
  medium: {
    label: "Warning",
    icon: AlertTriangle,
    cardBorder: "border-yellow-500/40",
    cardBg:
      "bg-gradient-to-br from-yellow-950/30 via-slate-900/60 to-slate-900/40",
    badge: "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30",
    iconColor: "text-yellow-400",
    glow: "shadow-[0_0_30px_-10px_rgba(234,179,8,0.4)]",
  },
  low: {
    label: "Info",
    icon: Info,
    cardBorder: "border-blue-500/40",
    cardBg:
      "bg-gradient-to-br from-blue-950/30 via-slate-900/60 to-slate-900/40",
    badge: "bg-blue-500/20 text-blue-300 border border-blue-500/30",
    iconColor: "text-blue-400",
    glow: "shadow-[0_0_30px_-10px_rgba(59,130,246,0.4)]",
  },
};

const AUDIENCE_ROLE_MAP: Record<string, string[]> = {
  all: ["*"],
  policymakers: ["Policymaker"],
  donors: ["Donor"],
  researchers: ["Researcher"],
  coordinators: [
    "Coordinator",
    "mental_health_coordinator",
    "researcher_coordinator",
    "cso_coordinator",
    "policymaker_coordinator",
    "donor_coordinator",
    "admin_coordinator",
  ],
  cso: ["CSO"],
  mental_health_professional: ["Mental_Health_Professional"],
};

function isAlertVisibleToUser(alert: Alert, user: any): boolean {
  if (!user) {
    if (alert.audience && alert.audience !== "all") return false;
    return true;
  }
  if (user.role === "Admin") return true;
  const allowedRoles = AUDIENCE_ROLE_MAP[alert.audience || "all"] || ["*"];
  if (!allowedRoles.includes("*") && !allowedRoles.includes(user.role)) {
    return false;
  }
  if (alert.country && user.country && alert.country !== user.country) {
    return false;
  }
  return true;
}

// ============================================================
// Component
// ============================================================
export default function NotificationsPage() {
  const [user, setUser] = useState<any>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // UI state
  const [searchTerm, setSearchTerm] = useState("");
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("active");
  const [showFilters, setShowFilters] = useState(false);

  // ============================================================
  // Effects
  // ============================================================
  useEffect(() => {
    checkAuth();
  }, []);

  // Refetch alerts whenever the user changes (so read state is per-user)
  useEffect(() => {
    if (!checkingAuth) {
      fetchAlerts();
    }
  }, [user, checkingAuth]);

  // ============================================================
  // Auth
  // ============================================================
  const checkAuth = async () => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          const cached = JSON.parse(userStr);
          if (cached?.id) {
            setUser(cached);
            setCheckingAuth(false);
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

      if (sessionError || !session?.user) {
        setUser(null);
        setCheckingAuth(false);
        return;
      }

      const { data: profile, error: dbError } = await supabase
        .from("users")
        .select("id, full_name, email, role, status, country, assigned_country")
        .eq("auth_user_id", session.user.id)
        .single();

      if (dbError || !profile) {
        setUser(null);
        setCheckingAuth(false);
        return;
      }

      localStorage.setItem("user", JSON.stringify(profile));
      setUser(profile);
    } catch (err) {
      console.error("checkAuth error:", err);
      setUser(null);
    } finally {
      setCheckingAuth(false);
    }
  };

  // ============================================================
  // Fetch — joins in read state for current user
  // ============================================================
  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch active alerts
      const { data, error } = await supabase
        .from("alerts")
        .select("*")
        .eq("status", "active") // ← filter here so we never mutate alerts.status
        .order("created_at", { ascending: false });

      if (error) throw error;

      const now = new Date();
      const visibleAlerts: Alert[] = (data || [])
        .filter((a: any) => {
          if (a.expires_at && new Date(a.expires_at) < now) return false;
          return true;
        })
        .filter((a: any) => isAlertVisibleToUser(a, user));

      // 2. If a user is logged in, fetch their read records
      if (user?.id && visibleAlerts.length > 0) {
        const alertIds = visibleAlerts.map((a) => a.id);
        const { data: reads, error: readsError } = await supabase
          .from("alert_reads")
          .select("alert_id")
          .eq("user_id", user.id)
          .in("alert_id", alertIds);

        if (readsError) {
          console.warn("alert_reads fetch error:", readsError.message);
        }

        const readSet = new Set(
          (reads || []).map((r: { alert_id: string }) => r.alert_id)
        );
        visibleAlerts.forEach((a) => {
          a.is_read = readSet.has(a.id);
        });
      } else {
        // Anonymous or empty — everything unread
        visibleAlerts.forEach((a) => {
          a.is_read = false;
        });
      }

      setAlerts(visibleAlerts);
    } catch (err) {
      console.error("Error fetching alerts:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAlerts();
  };

  // ============================================================
  // Read tracking — DB-backed, per user
  // ============================================================
  const markAsRead = async (id: string) => {
    if (!user?.id) return;

    // Optimistic update
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, is_read: true } : a))
    );

    const { error } = await supabase
      .from("alert_reads")
      .upsert(
        { alert_id: id, user_id: user.id, read_at: new Date().toISOString() },
        { onConflict: "alert_id,user_id" }
      );

    if (error) {
      console.error("markAsRead error:", error.message);
      // Roll back on failure
      setAlerts((prev) =>
        prev.map((a) => (a.id === id ? { ...a, is_read: false } : a))
      );
    }
  };

  const markAsUnread = async (id: string) => {
    if (!user?.id) return;

    // Optimistic update
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, is_read: false } : a))
    );

    const { error } = await supabase
      .from("alert_reads")
      .delete()
      .eq("alert_id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("markAsUnread error:", error.message);
      setAlerts((prev) =>
        prev.map((a) => (a.id === id ? { ...a, is_read: true } : a))
      );
    }
  };

  const markAllAsRead = async () => {
    if (!user?.id) return;
    const unread = alerts.filter((a) => !a.is_read);
    if (unread.length === 0) return;

    // Optimistic
    setAlerts((prev) => prev.map((a) => ({ ...a, is_read: true })));

    const nowIso = new Date().toISOString();
    const rows = unread.map((a) => ({
      alert_id: a.id,
      user_id: user.id,
      read_at: nowIso,
    }));

    const { error } = await supabase
      .from("alert_reads")
      .upsert(rows, { onConflict: "alert_id,user_id" });

    if (error) {
      console.error("markAllAsRead error:", error.message);
      // Reload from server to get back to a consistent state
      fetchAlerts();
    }
  };

  // ============================================================
  // Derived
  // ============================================================
  const filteredAlerts = useMemo(() => {
    return alerts.filter((a) => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const hay = `${a.title} ${a.message} ${a.country || ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (severityFilter !== "all" && a.severity !== severityFilter) {
        return false;
      }
      if (statusFilter === "unread" && a.is_read) return false;
      if (statusFilter === "read" && !a.is_read) return false;
      return true;
    });
  }, [alerts, searchTerm, severityFilter, statusFilter]);

  const stats = useMemo(() => {
    const total = alerts.length;
    const unread = alerts.filter((a) => !a.is_read).length;
    const critical = alerts.filter((a) => a.severity === "high").length;
    const warning = alerts.filter((a) => a.severity === "medium").length;
    const info = alerts.filter((a) => a.severity === "low").length;
    return { total, unread, critical, warning, info };
  }, [alerts]);

  // ============================================================
  // Loading state
  // ============================================================
  if (checkingAuth || (loading && alerts.length === 0 && !refreshing)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-300">Loading notifications…</p>
        </div>
      </div>
    );
  }

  // ============================================================
  // Render
  // ============================================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
      {/* ===== Header ===== */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-cyan-950 to-slate-900 border-b border-cyan-500/20">
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative px-6 md:px-8 py-8 md:py-10">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-cyan-400 mb-4 transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>

          <div className="flex justify-between items-start flex-wrap gap-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-gradient-to-br from-cyan-500/30 to-blue-500/20 rounded-2xl border border-cyan-500/30">
                <Bell className="w-7 h-7 text-cyan-300" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="px-3 py-1 bg-cyan-500/20 rounded-full border border-cyan-500/30">
                    <span className="text-cyan-300 text-xs font-mono tracking-wider">
                      NOTIFICATIONS CENTER
                    </span>
                  </div>
                  {stats.unread > 0 && (
                    <span className="px-2.5 py-1 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse">
                      {stats.unread} new
                    </span>
                  )}
                </div>
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Governance Alerts
                </h1>
                <p className="text-slate-400 text-sm md:text-base mt-2">
                  {user
                    ? `Personalized updates for ${
                        user.full_name || user.email
                      }`
                    : "Public alerts from the continental governance system"}
                </p>
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-600 text-white transition-colors disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
                />
                <span className="text-sm hidden sm:inline">Refresh</span>
              </button>
              {user?.id && stats.unread > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center gap-2 px-3 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-xl text-white transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">Mark all read</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ===== Main ===== */}
      <div className="px-4 md:px-8 py-6 max-w-6xl mx-auto">
        {/* ===== Stats ===== */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={Bell}
            label="Total"
            value={stats.total}
            color="text-cyan-400"
            bg="bg-cyan-500/10 border-cyan-500/20"
          />
          <StatCard
            icon={AlertTriangle}
            label="Critical"
            value={stats.critical}
            color="text-red-400"
            bg="bg-red-500/10 border-red-500/20"
          />
          <StatCard
            icon={AlertTriangle}
            label="Warnings"
            value={stats.warning}
            color="text-yellow-400"
            bg="bg-yellow-500/10 border-yellow-500/20"
          />
          <StatCard
            icon={Info}
            label="Info"
            value={stats.info}
            color="text-blue-400"
            bg="bg-blue-500/10 border-blue-500/20"
          />
        </div>

        {/* ===== Search + Filters ===== */}
        <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-4 mb-6">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search alerts…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-900/60 border border-slate-600 rounded-xl pl-10 pr-10 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <button
              onClick={() => setShowFilters((s) => !s)}
              className={`px-4 py-2.5 rounded-xl border transition-colors flex items-center gap-2 ${
                showFilters
                  ? "bg-cyan-600/20 border-cyan-500/40 text-cyan-300"
                  : "bg-slate-900/60 border-slate-600 text-slate-300 hover:text-white"
              }`}
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>

            {(searchTerm ||
              severityFilter !== "all" ||
              statusFilter !== "active") && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSeverityFilter("all");
                  setStatusFilter("active");
                }}
                className="px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 text-sm transition-colors flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Clear
              </button>
            )}
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-700/50">
              <div>
                <label className="text-slate-400 text-xs block mb-2 uppercase tracking-wider">
                  Severity
                </label>
                <div className="flex flex-wrap gap-2">
                  {(["all", "high", "medium", "low"] as SeverityFilter[]).map(
                    (s) => (
                      <button
                        key={s}
                        onClick={() => setSeverityFilter(s)}
                        className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                          severityFilter === s
                            ? "bg-cyan-600 text-white"
                            : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                        }`}
                      >
                        {s === "all"
                          ? "All"
                          : s === "high"
                          ? "Critical"
                          : s === "medium"
                          ? "Warning"
                          : "Info"}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div>
                <label className="text-slate-400 text-xs block mb-2 uppercase tracking-wider">
                  Status
                </label>
                <div className="flex flex-wrap gap-2">
                  {(
                    ["active", "unread", "read", "all"] as StatusFilter[]
                  ).map((s) => (
                    <button
                      key={s}
                      onClick={() => setStatusFilter(s)}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-colors capitalize ${
                        statusFilter === s
                          ? "bg-cyan-600 text-white"
                          : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ===== Alerts List ===== */}
        {filteredAlerts.length === 0 ? (
          <EmptyState
            hasFilters={
              !!searchTerm ||
              severityFilter !== "all" ||
              statusFilter !== "active"
            }
            onClear={() => {
              setSearchTerm("");
              setSeverityFilter("all");
              setStatusFilter("active");
            }}
          />
        ) : (
          <div className="space-y-4">
            {filteredAlerts.map((alert) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                isRead={!!alert.is_read}
                canTrackRead={!!user?.id}
                onMarkRead={() => markAsRead(alert.id)}
                onMarkUnread={() => markAsUnread(alert.id)}
              />
            ))}
          </div>
        )}

        <p className="text-center text-slate-500 text-xs mt-10">
          Alerts are updated in real time by the governance control center.
          <br />
          Marking an alert as read only affects{" "}
          <span className="text-slate-400 font-semibold">your</span> view — it
          stays visible for everyone else.
        </p>
      </div>
    </div>
  );
}

// ============================================================
// Sub-components
// ============================================================
function StatCard({
  icon: Icon,
  label,
  value,
  color,
  bg,
}: {
  icon: typeof Bell;
  label: string;
  value: number;
  color: string;
  bg: string;
}) {
  return (
    <div className={`${bg} border rounded-xl p-4`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-4 h-4 ${color}`} />
        <p className={`${color} text-xs font-medium`}>{label}</p>
      </div>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

function EmptyState({
  hasFilters,
  onClear,
}: {
  hasFilters: boolean;
  onClear: () => void;
}) {
  return (
    <div className="bg-slate-800/50 backdrop-blur rounded-2xl border border-slate-700 p-16 text-center">
      <div className="w-20 h-20 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-cyan-500/20">
        <Bell className="w-10 h-10 text-cyan-400/60" />
      </div>
      <h3 className="text-xl font-bold text-white mb-2">
        {hasFilters ? "No matching alerts" : "You're all caught up!"}
      </h3>
      <p className="text-slate-400 max-w-md mx-auto mb-6">
        {hasFilters
          ? "Try adjusting your search or filters to find what you're looking for."
          : "There are no active alerts at the moment. We'll notify you the moment something important happens."}
      </p>
      {hasFilters && (
        <button
          onClick={onClear}
          className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-700 rounded-xl text-white transition-colors"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}

function AlertCard({
  alert,
  isRead,
  canTrackRead,
  onMarkRead,
  onMarkUnread,
}: {
  alert: Alert;
  isRead: boolean;
  canTrackRead: boolean;
  onMarkRead: () => void;
  onMarkUnread: () => void;
}) {
  const style = SEVERITY_STYLES[alert.severity] || SEVERITY_STYLES.low;
  const Icon = style.icon;

  const created = new Date(alert.created_at);
  const expires = alert.expires_at ? new Date(alert.expires_at) : null;
  const now = new Date();
  const hoursLeft = expires
    ? Math.max(0, Math.round((expires.getTime() - now.getTime()) / 36e5))
    : null;
  const isExpiringSoon = hoursLeft !== null && hoursLeft <= 48 && hoursLeft > 0;
  const timeAgo = formatTimeAgo(created);

  return (
    <div
      className={`relative border rounded-2xl p-5 md:p-6 transition-all duration-300 ${
        isRead ? "opacity-75" : style.glow
      } ${style.cardBg} ${style.cardBorder} hover:scale-[1.005]`}
    >
      {/* Unread pulse dot */}
      {!isRead && (
        <span className="absolute top-5 right-5 flex h-3 w-3">
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full ${
              alert.severity === "high"
                ? "bg-red-400"
                : alert.severity === "medium"
                ? "bg-yellow-400"
                : "bg-blue-400"
            } opacity-75`}
          />
          <span
            className={`relative inline-flex rounded-full h-3 w-3 ${
              alert.severity === "high"
                ? "bg-red-500"
                : alert.severity === "medium"
                ? "bg-yellow-500"
                : "bg-blue-500"
            }`}
          />
        </span>
      )}

      <div className="flex items-start gap-4">
        {/* Icon */}
        <div
          className={`shrink-0 p-3 rounded-xl bg-slate-900/60 border ${style.cardBorder}`}
        >
          <Icon className={`w-6 h-6 ${style.iconColor}`} />
        </div>

        {/* Body */}
        <div className="flex-1 min-w-0">
          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${style.badge}`}
            >
              {style.label}
            </span>

            {!isRead && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                NEW
              </span>
            )}

            {isRead && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-700/60 text-slate-400 border border-slate-600/60 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Read
              </span>
            )}

            {alert.audience && alert.audience !== "all" && (
              <span className="px-2.5 py-0.5 rounded-full text-xs bg-slate-700/60 text-slate-300 flex items-center gap-1">
                <Users className="w-3 h-3" />
                {alert.audience.replace(/_/g, " ")}
              </span>
            )}

            {alert.country && (
              <span className="px-2.5 py-0.5 rounded-full text-xs bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 flex items-center gap-1">
                <Globe className="w-3 h-3" />
                {alert.country}
              </span>
            )}

            {isExpiringSoon && (
              <span className="px-2.5 py-0.5 rounded-full text-xs bg-orange-500/20 text-orange-300 border border-orange-500/30 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Expires in {hoursLeft}h
              </span>
            )}
          </div>

          <h3
            className={`text-lg md:text-xl font-bold mb-2 ${
              isRead ? "text-slate-300" : "text-white"
            }`}
          >
            {alert.title}
          </h3>

          <p className="text-slate-300/90 text-sm md:text-base whitespace-pre-wrap leading-relaxed">
            {alert.message}
          </p>

          <div className="flex flex-wrap items-center gap-4 mt-4 pt-3 border-t border-slate-700/50 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {created.toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
              <span className="text-slate-600">•</span>
              <span>{timeAgo}</span>
            </span>

            {expires && (
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Expires{" "}
                {expires.toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        {canTrackRead && (
          <div className="shrink-0 flex flex-col gap-1">
            <button
              onClick={() => (isRead ? onMarkUnread() : onMarkRead())}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/60 rounded-lg transition-colors"
              title={isRead ? "Mark as unread" : "Mark as read"}
            >
              {isRead ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// Utils
// ============================================================
function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}