// components/AlertsWidget.tsx
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  Bell,
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  X,
  Globe,
  Users,
  Clock,
} from "lucide-react";
import Link from "next/link";

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

interface AlertsWidgetProps {
  userRole?: string;
  userCountry?: string;
  userId?: string;
  limit?: number;
  showViewAll?: boolean;
}

export function AlertsWidget({ 
  userRole, 
  userCountry, 
  userId,
  limit = 5,
  showViewAll = true,
}: AlertsWidgetProps) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAlerts();
    loadDismissedAlerts();
  }, []);

  const loadDismissedAlerts = () => {
    const dismissed = localStorage.getItem('dismissed_alerts');
    if (dismissed) {
      setDismissedAlerts(new Set(JSON.parse(dismissed)));
    }
  };

  const fetchAlerts = async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from("alerts")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false });

      // Filter by audience based on user role
      if (userRole) {
        const audienceMap: Record<string, string[]> = {
          'Admin': ['all', 'policymakers', 'donors', 'researchers', 'coordinators', 'cso'],
          'Policymaker': ['all', 'policymakers'],
          'Donor': ['all', 'donors'],
          'Researcher': ['all', 'researchers'],
          'Coordinator': ['all', 'coordinators'],
          'cso_coordinator': ['all', 'cso'],
          'CSO': ['all', 'cso'],
        };

        const allowedAudiences = audienceMap[userRole] || ['all'];
        query = query.in('audience', allowedAudiences);
      }

      // Filter by country if user has a country
      if (userCountry) {
        query = query.or(`country.eq.${userCountry},country.is.null`);
      }

      // Check expiration
      query = query.or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`);

      const { data, error } = await query.limit(limit + 5);

      if (error) throw error;
      setAlerts(data || []);
    } catch (error) {
      console.error("Error fetching alerts:", error);
      setError("Failed to load alerts");
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
      case "high":
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      case "medium":
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      default:
        return <Bell className="w-5 h-5 text-blue-400" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "border-red-500/30 bg-red-500/10";
      case "medium":
        return "border-yellow-500/30 bg-yellow-500/10";
      default:
        return "border-blue-500/30 bg-blue-500/10";
    }
  };

  const visibleAlerts = alerts
    .filter(alert => !dismissedAlerts.has(alert.id))
    .slice(0, limit);

  if (loading) {
    return (
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
        <div className="flex items-center gap-2 text-slate-400">
          <Bell className="w-4 h-4 animate-pulse" />
          <span className="text-sm">Loading alerts...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
        <div className="flex items-center gap-2 text-red-400">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">{error}</span>
        </div>
      </div>
    );
  }

  if (visibleAlerts.length === 0) {
    return (
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
        <div className="flex items-center gap-2 text-slate-400">
          <Bell className="w-4 h-4" />
          <span className="text-sm">No new alerts</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {visibleAlerts.map((alert) => (
        <div
          key={alert.id}
          className={`rounded-xl border p-4 ${getSeverityColor(alert.severity)}`}
        >
          <div className="flex items-start gap-3">
            {getSeverityIcon(alert.severity)}
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start flex-wrap gap-2">
                <h4 className="text-white font-medium text-sm">{alert.title}</h4>
                <button
                  onClick={() => dismissAlert(alert.id)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-slate-300 text-sm mt-1">{alert.message}</p>
              <div className="flex flex-wrap gap-3 mt-2">
                {alert.country && (
                  <span className="inline-flex items-center gap-1 text-xs text-cyan-400">
                    <Globe className="w-3 h-3" />
                    {alert.country}
                  </span>
                )}
                <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                  <Users className="w-3 h-3" />
                  {alert.audience}
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                  <Clock className="w-3 h-3" />
                  {new Date(alert.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
      
      {showViewAll && alerts.length > limit && (
        <Link
          href="/alerts"
          className="block text-center text-cyan-400 hover:text-cyan-300 text-sm transition-colors"
        >
          View All Alerts →
        </Link>
      )}
    </div>
  );
}