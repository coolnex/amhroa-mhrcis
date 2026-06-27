// app/governance-alerts/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { CountrySelect } from "@/components/ui/country-select";
import {
  Bell,
  AlertTriangle,
  Info,
  CheckCircle,
  Plus,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  Globe,
  Users,
  Calendar,
  Clock,
  XCircle,
  Send,
  Loader2,
} from "lucide-react";

interface Alert {
  id: string;
  title: string;
  message: string;
  severity: "high" | "medium" | "low";
  type: "critical" | "warning" | "info";
  status: "active" | "inactive" | "expired";
  audience: string;
  country?: string;
  created_at: string;
  expires_at?: string;
  created_by?: string;
}

export default function GovernanceAlertsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAlert, setEditingAlert] = useState<Alert | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    severity: "medium",
    audience: "all",
    country: "",
    expires_at: "",
  });

  useEffect(() => {
    checkAuth();
    fetchAlerts();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    if (!token || !userStr) {
      router.push("/login");
      return;
    }

    const userData = JSON.parse(userStr);
    if (userData.role !== "Admin") {
      router.push("/dashboard");
      return;
    }
    setUser(userData);
  };

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("alerts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAlerts(data || []);
    } catch (error) {
      console.error("Error fetching alerts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAlert = async () => {
    if (!formData.title || !formData.message) {
      alert("Please fill in title and message");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from("alerts").insert({
        title: formData.title,
        message: formData.message,
        severity: formData.severity,
        type: formData.severity === "high" ? "critical" : formData.severity === "medium" ? "warning" : "info",
        audience: formData.audience,
        country: formData.country || null,
        status: "active",
        expires_at: formData.expires_at || null,
        created_by: user?.id,
        created_at: new Date().toISOString(),
      });

      if (error) throw error;

      alert("Alert created successfully!");
      setShowCreateModal(false);
      setFormData({
        title: "",
        message: "",
        severity: "medium",
        audience: "all",
        country: "",
        expires_at: "",
      });
      fetchAlerts();
    } catch (error) {
      console.error("Error creating alert:", error);
      alert("Failed to create alert");
    } finally {
      setSubmitting(false);
    }
  };

  const updateAlertStatus = async (alertId: string, status: string) => {
    try {
      const { error } = await supabase
        .from("alerts")
        .update({ status })
        .eq("id", alertId);

      if (error) throw error;
      fetchAlerts();
      alert(`Alert ${status === "active" ? "activated" : "deactivated"} successfully`);
    } catch (error) {
      console.error("Error updating alert:", error);
      alert("Failed to update alert");
    }
  };

  const deleteAlert = async (alertId: string) => {
    if (!confirm("Are you sure you want to delete this alert?")) return;
    
    try {
      const { error } = await supabase
        .from("alerts")
        .delete()
        .eq("id", alertId);

      if (error) throw error;
      fetchAlerts();
      alert("Alert deleted successfully");
    } catch (error) {
      console.error("Error deleting alert:", error);
      alert("Failed to delete alert");
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "high":
        return { color: "bg-red-500/20 text-red-400 border-red-500/30", icon: AlertTriangle, label: "Critical" };
      case "medium":
        return { color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", icon: AlertTriangle, label: "Warning" };
      default:
        return { color: "bg-blue-500/20 text-blue-400 border-blue-500/30", icon: Info, label: "Info" };
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return { color: "bg-emerald-500/20 text-emerald-400", icon: CheckCircle };
      case "inactive":
        return { color: "bg-red-500/20 text-red-400", icon: XCircle };
      default:
        return { color: "bg-slate-500/20 text-slate-400", icon: Clock };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-300">Loading governance alerts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-cyan-950 to-slate-900 border-b border-cyan-500/20">
        <div className="relative px-6 md:px-8 py-8 md:py-10">
          <div className="flex justify-between items-start flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="px-3 py-1 bg-cyan-500/20 rounded-full border border-cyan-500/30">
                  <span className="text-cyan-300 text-xs font-mono tracking-wider">
                    GOVERNANCE ALERTS
                  </span>
                </div>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Governance Alerts
              </h1>
              <p className="text-slate-300 text-base md:text-lg mt-3 max-w-2xl">
                Create and manage continental alerts for different user roles and countries.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-xl text-white transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm">Create Alert</span>
              </button>
              <button
                onClick={fetchAlerts}
                className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-600 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="text-sm hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-8 py-6">
        {/* Alerts List */}
        <div className="space-y-4">
          {alerts.length === 0 ? (
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-12 text-center">
              <Bell className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 text-lg">No governance alerts</p>
              <p className="text-slate-500 text-sm mt-2">Create your first alert to notify users</p>
            </div>
          ) : (
            alerts.map((alert) => {
              const severity = getSeverityBadge(alert.severity);
              const StatusIcon = getStatusBadge(alert.status).icon;
              const SeverityIcon = severity.icon;
              
              return (
                <div key={alert.id} className={`p-4 rounded-xl border ${severity.color}`}>
                  <div className="flex items-start justify-between flex-wrap gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 flex-wrap mb-2">
                        <div className="flex items-center gap-1">
                          <SeverityIcon className="w-4 h-4" />
                          <span className="text-sm font-semibold">{severity.label}</span>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusBadge(alert.status).color}`}>
                          {alert.status}
                        </span>
                        {alert.country && (
                          <span className="text-xs text-cyan-400 flex items-center gap-1">
                            <Globe className="w-3 h-3" />
                            {alert.country}
                          </span>
                        )}
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          Audience: {alert.audience}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">{alert.title}</h3>
                      <p className="text-slate-300 text-sm mb-3">{alert.message}</p>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Created: {new Date(alert.created_at).toLocaleDateString()}
                        </span>
                        {alert.expires_at && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Expires: {new Date(alert.expires_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateAlertStatus(alert.id, alert.status === "active" ? "inactive" : "active")}
                        className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                        title={alert.status === "active" ? "Deactivate" : "Activate"}
                      >
                        {alert.status === "active" ? (
                          <XCircle className="w-4 h-4 text-yellow-400" />
                        ) : (
                          <CheckCircle className="w-4 h-4 text-emerald-400" />
                        )}
                      </button>
                      <button
                        onClick={() => deleteAlert(alert.id)}
                        className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Create Alert Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setShowCreateModal(false)}>
          <div className="bg-slate-800 rounded-2xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-700">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Create Governance Alert</h2>
                <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white text-2xl">&times;</button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-slate-400 text-sm block mb-2">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white"
                  placeholder="Alert title"
                />
              </div>
              <div>
                <label className="text-slate-400 text-sm block mb-2">Message *</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={3}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white resize-none"
                  placeholder="Alert message"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 text-sm block mb-2">Severity</label>
                  <select
                    value={formData.severity}
                    onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white"
                  >
                    <option value="high">High (Critical)</option>
                    <option value="medium">Medium (Warning)</option>
                    <option value="low">Low (Info)</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 text-sm block mb-2">Audience</label>
                  <select
                    value={formData.audience}
                    onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white"
                  >
                    <option value="all">All Users</option>
                    <option value="policymakers">Policymakers</option>
                    <option value="donors">Donors</option>
                    <option value="researchers">Researchers</option>
                    <option value="coordinators">Coordinators</option>
                    <option value="cso">CSOs</option>
                    <option value="mental_health_professional">Mental Health Professionals</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-slate-400 text-sm block mb-2">Country (Optional)</label>
                <CountrySelect
                  value=""
                  onChange={(code, name) => setFormData({ ...formData, country: name })}
                />
              </div>
              <div>
                <label className="text-slate-400 text-sm block mb-2">Expiry Date (Optional)</label>
                <input
                  type="datetime-local"
                  value={formData.expires_at}
                  onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white"
                />
              </div>
              <button
                onClick={handleCreateAlert}
                disabled={submitting}
                className="w-full py-3 bg-cyan-600 hover:bg-cyan-700 rounded-xl text-white font-semibold transition-colors disabled:opacity-50"
              >
                {submitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Create Alert"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}