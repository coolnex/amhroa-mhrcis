// app/alerts/page.tsx
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import {
  ArrowLeft,
  Bell,
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Globe,
  Users,
  Clock,
  X,
} from "lucide-react";

interface Alert {
  id: string;
  title: string;
  message: string;
  severity: "high" | "medium" | "low";
  status: "active" | "inactive";
  country?: string;
  audience: "all" | "policymakers" | "donors" | "researchers" | "coordinators" | "cso";
  created_at: string;
  expires_at?: string;
}

export default function AlertsPage() {
  const [user, setUser] = useState<any>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

  useEffect(() => {
    checkAuth();
    loadDismissedAlerts();
  }, []);

  const checkAuth = async () => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
    await fetchAlerts();
  };

  const loadDismissedAlerts = () => {
    const dismissed = localStorage.getItem('dismissed_alerts');
    if (dismissed) {
      setDismissedAlerts(new Set(JSON.parse(dismissed)));
    }
  };

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("alerts")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false });

      // Filter by audience
      if (user?.role) {
        const audienceMap: Record<string, string[]> = {
          'Admin': ['all', 'policymakers', 'donors', 'researchers', 'coordinators', 'cso'],
          'Policymaker': ['all', 'policymakers'],
          'Donor': ['all', 'donors'],
          'Researcher': ['all', 'researchers'],
          'Coordinator': ['all', 'coordinators'],
          'cso_coordinator': ['all', 'cso'],
          'CSO': ['all', 'cso'],
        };

        const allowedAudiences = audienceMap[user.role] || ['all'];
        query = query.in('audience', allowedAudiences);
      }

      // Filter by country
      if (user?.country) {
        query = query.or(`country.eq.${user.country},country.is.null`);
      }

      // Check expiration
      query = query.or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`);

      const { data, error } = await query;
      if (error) throw error;
      setAlerts(data || []);
    } catch (error) {
      console.error("Error fetching alerts:", error);
    } finally {
      setLoading(false);
    }
  };

  const dismissAlert = (alertId: string) => {
    const newDismissed = new Set(dismissedAlerts);
    newDismissed.add(alertId);
    setDismissedAlerts(newDismissed);
    localStorage.setItem('dismissed_alerts', JSON.stringify(Array.from(newDismissed)));
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "high": return <AlertCircle className="w-5 h-5 text-red-400" />;
      case "medium": return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      default: return <Bell className="w-5 h-5 text-blue-400" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high": return "border-red-500/30 bg-red-500/10";
      case "medium": return "border-yellow-500/30 bg-yellow-500/10";
      default: return "border-blue-500/30 bg-blue-500/10";
    }
  };

  const visibleAlerts = alerts.filter(alert => !dismissedAlerts.has(alert.id));

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-300">Loading alerts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
      <div className="px-4 md:px-8 py-6">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-slate-400 hover:text-cyan-400 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white">Alerts</h1>
          {visibleAlerts.length > 0 && (
            <span className="text-slate-400 text-sm">{visibleAlerts.length} active alerts</span>
          )}
        </div>

        {visibleAlerts.length === 0 ? (
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-12 text-center">
            <Bell className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">No alerts</p>
            <p className="text-slate-500 text-sm mt-2">You're all caught up!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {visibleAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`rounded-2xl border p-6 ${getSeverityColor(alert.severity)}`}
              >
                <div className="flex items-start gap-4">
                  {getSeverityIcon(alert.severity)}
                  <div className="flex-1">
                    <div className="flex justify-between items-start flex-wrap gap-2">
                      <h3 className="text-xl font-bold text-white">{alert.title}</h3>
                      <button
                        onClick={() => dismissAlert(alert.id)}
                        className="text-slate-400 hover:text-white transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <p className="text-slate-300 mt-2">{alert.message}</p>
                    <div className="flex flex-wrap gap-4 mt-3">
                      {alert.country && (
                        <span className="inline-flex items-center gap-1 text-sm text-cyan-400">
                          <Globe className="w-4 h-4" />
                          {alert.country}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 text-sm text-slate-400">
                        <Users className="w-4 h-4" />
                        {alert.audience}
                      </span>
                      <span className="inline-flex items-center gap-1 text-sm text-slate-500">
                        <Clock className="w-4 h-4" />
                        {new Date(alert.created_at).toLocaleString()}
                      </span>
                      {alert.expires_at && (
                        <span className="inline-flex items-center gap-1 text-sm text-slate-500">
                          <Clock className="w-4 h-4" />
                          Expires: {new Date(alert.expires_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}