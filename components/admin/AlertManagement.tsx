// components/admin/AlertManagement.tsx
"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Plus, Send, Loader2 } from "lucide-react";
import { CountrySelect } from "@/components/ui/country-select";

interface AlertManagementProps {
  onAlertCreated?: () => void;
}

export function AlertManagement({ onAlertCreated }: AlertManagementProps) {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    severity: "medium",
    country: "",
    audience: "all",
    expires_at: "",
  });

  const handleCreateAlert = async () => {
    if (!formData.title || !formData.message) {
      alert("Please fill in title and message");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("alerts")
        .insert({
          title: formData.title,
          message: formData.message,
          severity: formData.severity,
          status: "active",
          country: formData.country || null,
          audience: formData.audience,
          expires_at: formData.expires_at || null,
          created_at: new Date().toISOString(),
        });

      if (error) throw error;

      alert("Alert created successfully!");
      setShowModal(false);
      setFormData({
        title: "",
        message: "",
        severity: "medium",
        country: "",
        audience: "all",
        expires_at: "",
      });
      
      if (onAlertCreated) onAlertCreated();
    } catch (error) {
      console.error("Error creating alert:", error);
      alert("Failed to create alert");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-xl text-white transition-colors"
      >
        <Plus className="w-4 h-4" />
        Create Alert
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl max-w-md w-full">
            <div className="p-6 border-b border-slate-700">
              <h2 className="text-2xl font-bold text-white">Create Alert</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-slate-400 text-sm block mb-2">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white"
                />
              </div>
              <div>
                <label className="text-slate-400 text-sm block mb-2">Message *</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={3}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white resize-none"
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
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
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
                  </select>
                </div>
              </div>
              <div>
                <label className="text-slate-400 text-sm block mb-2">Country (Optional)</label>
                <CountrySelect
                  value={formData.country}
                  onChange={(code, name) => setFormData({ ...formData, country: name })}
                />
              </div>
              <div>
                <label className="text-slate-400 text-sm block mb-2">Expires At (Optional)</label>
                <input
                  type="datetime-local"
                  value={formData.expires_at}
                  onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white"
                />
              </div>
              <button
                onClick={handleCreateAlert}
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 rounded-xl text-white font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {loading ? "Creating..." : "Create Alert"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}