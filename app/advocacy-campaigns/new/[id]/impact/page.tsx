// app/advocacy-campaigns/[id]/impact/page.tsx
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  BarChart3,
  TrendingUp,
  Users,
  Target,
  Calendar,
  Download,
  RefreshCw,
  Loader2,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";

interface ImpactMetric {
  id: string;
  metric_type: string;
  value: number;
  target: number;
  recorded_at: string;
  notes: string;
}

export default function CampaignImpactPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.id as string;

  const [campaign, setCampaign] = useState<any>(null);
  const [metrics, setMetrics] = useState<ImpactMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMetric, setNewMetric] = useState({
    metric_type: "reach",
    value: 0,
    target: 0,
    notes: "",
  });

  useEffect(() => {
    fetchData();
  }, [campaignId]);

  const fetchData = async () => {
    try {
      const [campaignRes, metricsRes] = await Promise.all([
        supabase.from("advocacy_campaigns").select("*").eq("id", campaignId).single(),
        supabase.from("advocacy_impact").select("*").eq("campaign_id", campaignId).order("recorded_at", { ascending: false }),
      ]);

      if (campaignRes.data) setCampaign(campaignRes.data);
      if (metricsRes.data) setMetrics(metricsRes.data);
    } catch (error) {
      console.error("Error fetching impact data:", error);
    } finally {
      setLoading(false);
    }
  };

  const addMetric = async () => {
    if (!newMetric.value) return;

    try {
      const { error } = await supabase.from("advocacy_impact").insert({
        campaign_id: campaignId,
        metric_type: newMetric.metric_type,
        value: newMetric.value,
        target: newMetric.target || 0,
        notes: newMetric.notes,
        recorded_at: new Date().toISOString(),
      });

      if (error) throw error;
      
      setNewMetric({ metric_type: "reach", value: 0, target: 0, notes: "" });
      fetchData();
    } catch (error) {
      console.error("Error adding metric:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <Link href={`/advocacy-campaigns/${campaignId}`} className="inline-flex items-center gap-2 text-slate-400 hover:text-cyan-400 mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Campaign
        </Link>

        <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-8">
          <h1 className="text-3xl font-bold text-white mb-2">{campaign?.title}</h1>
          <p className="text-slate-400 mb-6">Impact Tracking</p>

          {/* Impact Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-slate-700/30 rounded-xl p-4 text-center">
              <p className="text-slate-400 text-xs">Total Reach</p>
              <p className="text-2xl font-bold text-white">
                {metrics.filter(m => m.metric_type === "reach").reduce((sum, m) => sum + m.value, 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-slate-700/30 rounded-xl p-4 text-center">
              <p className="text-slate-400 text-xs">Engagement</p>
              <p className="text-2xl font-bold text-white">
                {metrics.filter(m => m.metric_type === "engagement").reduce((sum, m) => sum + m.value, 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-slate-700/30 rounded-xl p-4 text-center">
              <p className="text-slate-400 text-xs">Petition Signatures</p>
              <p className="text-2xl font-bold text-white">
                {metrics.filter(m => m.metric_type === "signatures").reduce((sum, m) => sum + m.value, 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-slate-700/30 rounded-xl p-4 text-center">
              <p className="text-slate-400 text-xs">Policy Meetings</p>
              <p className="text-2xl font-bold text-white">
                {metrics.filter(m => m.metric_type === "meetings").length}
              </p>
            </div>
          </div>

          {/* Add Metric */}
          <div className="bg-slate-700/30 rounded-xl p-4 mb-6">
            <h3 className="text-white font-medium mb-3">Record Impact</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <select
                value={newMetric.metric_type}
                onChange={(e) => setNewMetric({ ...newMetric, metric_type: e.target.value })}
                className="bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white"
              >
                <option value="reach">Reach</option>
                <option value="engagement">Engagement</option>
                <option value="signatures">Petition Signatures</option>
                <option value="meetings">Policy Meetings</option>
                <option value="media_mentions">Media Mentions</option>
              </select>
              <input
                type="number"
                value={newMetric.value}
                onChange={(e) => setNewMetric({ ...newMetric, value: parseInt(e.target.value) || 0 })}
                placeholder="Value"
                className="bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white"
              />
              <input
                type="number"
                value={newMetric.target}
                onChange={(e) => setNewMetric({ ...newMetric, target: parseInt(e.target.value) || 0 })}
                placeholder="Target (optional)"
                className="bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white"
              />
              <button
                onClick={addMetric}
                className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-700 rounded-xl text-white transition-colors"
              >
                Record
              </button>
            </div>
          </div>

          {/* Metrics History */}
          <div className="space-y-3">
            {metrics.map((metric) => (
              <div key={metric.id} className="bg-slate-700/30 rounded-xl p-4 flex justify-between items-center">
                <div>
                  <p className="text-white font-medium capitalize">{metric.metric_type.replace("_", " ")}</p>
                  <p className="text-slate-400 text-sm">{metric.notes || "No notes"}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-cyan-400">{metric.value.toLocaleString()}</p>
                  {metric.target > 0 && (
                    <p className="text-slate-400 text-xs">Target: {metric.target.toLocaleString()}</p>
                  )}
                  <p className="text-slate-500 text-xs">{new Date(metric.recorded_at).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}