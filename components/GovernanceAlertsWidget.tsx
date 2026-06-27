// components/GovernanceAlertsWidget.tsx
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { AlertTriangle, Info, Bell, X, ChevronRight } from "lucide-react";
import Link from "next/link";

interface Alert {
  id: string;
  title: string;
  message: string;
  severity: "high" | "medium" | "low";
  status: string;
  country?: string;
  created_at: string;
}

interface GovernanceAlertsWidgetProps {
  userRole: string;
  userCountry?: string;
  limit?: number;
  showViewAll?: boolean;
}

export function GovernanceAlertsWidget({ 
  userRole, 
  userCountry, 
  limit = 3, 
  showViewAll = true 
}: GovernanceAlertsWidgetProps) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);

  useEffect(() => {
    fetchAlerts();
  }, [userRole, userCountry]);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("alerts")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false });

      // Filter by audience
      query = query.or(`audience.eq.all,audience.eq.${userRole.toLowerCase()}`);

      // Filter by country if specified
      if (userCountry) {
        query = query.or(`country.is.null,country.eq.${userCountry}`);
      }

      // Filter by expiry date
      query = query.or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`);

      const { data, error } = await query.limit(limit);

      if (error) throw error;
      setAlerts(data || []);
    } catch (error) {
      console.error("Error fetching alerts:", error);
    } finally {
      setLoading(false);
    }
  };

  const dismissAlert = (alertId: string) => {
    setDismissedAlerts([...dismissedAlerts, alertId]);
    // Optionally store in localStorage to persist across sessions
    const stored = localStorage.getItem("dismissedAlerts");
    const dismissed = stored ? JSON.parse(stored) : [];
    localStorage.setItem("dismissedAlerts", JSON.stringify([...dismissed, alertId]));
  };

  // Load dismissed alerts from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("dismissedAlerts");
    if (stored) {
      setDismissedAlerts(JSON.parse(stored));
    }
  }, []);

  const visibleAlerts = alerts.filter(alert => !dismissedAlerts.includes(alert.id));

  if (visibleAlerts.length === 0 && !loading) {
    return null;
  }

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case "high":
        return {
          bg: "bg-red-500/10",
          border: "border-red-500/30",
          text: "text-red-400",
          icon: AlertTriangle,
        };
      case "medium":
        return {
          bg: "bg-yellow-500/10",
          border: "border-yellow-500/30",
          text: "text-yellow-400",
          icon: AlertTriangle,
        };
      default:
        return {
          bg: "bg-blue-500/10",
          border: "border-blue-500/30",
          text: "text-blue-400",
          icon: Info,
        };
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4 mb-6">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-slate-400 animate-pulse" />
          <span className="text-slate-400 text-sm">Loading alerts...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 mb-6">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-semibold text-sm flex items-center gap-2">
          <Bell className="w-4 h-4 text-cyan-400" />
          Governance Alerts
        </h3>
        {showViewAll && alerts.length > limit && (
          <Link href="/governance-alerts" className="text-cyan-400 hover:text-cyan-300 text-xs">
            View All
          </Link>
        )}
      </div>
      {visibleAlerts.map((alert) => {
        const styles = getSeverityStyles(alert.severity);
        const Icon = styles.icon;
        
        return (
          <div
            key={alert.id}
            className={`${styles.bg} ${styles.border} border rounded-xl p-4 relative group`}
          >
            <button
              onClick={() => dismissAlert(alert.id)}
              className="absolute top-2 right-2 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-3 h-3 text-slate-400 hover:text-white" />
            </button>
            <div className="flex items-start gap-3">
              <Icon className={`w-5 h-5 ${styles.text} flex-shrink-0 mt-0.5`} />
              <div className="flex-1">
                <h4 className="text-white font-semibold text-sm">{alert.title}</h4>
                <p className="text-slate-300 text-sm mt-1">{alert.message}</p>
                <div className="flex items-center gap-3 mt-2">
                  {alert.country && (
                    <span className="text-xs text-cyan-400">{alert.country}</span>
                  )}
                  <span className="text-xs text-slate-500">
                    {new Date(alert.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}