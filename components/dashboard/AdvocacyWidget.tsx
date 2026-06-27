// components/dashboard/AdvocacyWidget.tsx
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import {
  Megaphone,
  Users,
  Target,
  TrendingUp,
  Globe,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  ChevronRight,
  BarChart3,
  Activity,
  Zap,
} from "lucide-react";

interface AdvocacyStats {
  total_campaigns: number;
  active_campaigns: number;
  total_actions: number;
  completed_actions: number;
  total_reach: number;
  total_engagement: number;
  coalition_members: number;
  countries_covered: string[];
}

interface Campaign {
  id: string;
  title: string;
  description: string;
  status: string;
  progress: number;
  region: string;
  country: string;
  reach: number;
  engagement: number;
  start_date: string;
  end_date: string;
}

export function AdvocacyWidget() {
  const [stats, setStats] = useState<AdvocacyStats | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdvocacyData();
  }, []);

  const fetchAdvocacyData = async () => {
    try {
      // Fetch campaigns
      const { data: campaignsData } = await supabase
        .from("advocacy_campaigns")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

      if (campaignsData) {
        setCampaigns(campaignsData);
      }

      // Fetch stats
      const { data: allCampaigns } = await supabase
        .from("advocacy_campaigns")
        .select("status, reach, engagement, country, region");

      const { data: actionsData } = await supabase
        .from("advocacy_actions")
        .select("status");

      const { data: coalitionData } = await supabase
        .from("advocacy_coalition_members")
        .select("organization_id");

      if (allCampaigns) {
        const activeCampaigns = allCampaigns.filter(c => c.status === "Active" || c.status === "In Progress");
        const countries = new Set(allCampaigns.map(c => c.country).filter(Boolean));
        
        setStats({
          total_campaigns: allCampaigns.length,
          active_campaigns: activeCampaigns.length,
          total_actions: actionsData?.length || 0,
          completed_actions: actionsData?.filter(a => a.status === "Completed").length || 0,
          total_reach: allCampaigns.reduce((sum, c) => sum + (c.reach || 0), 0),
          total_engagement: allCampaigns.reduce((sum, c) => sum + (c.engagement || 0), 0),
          coalition_members: coalitionData?.length || 0,
          countries_covered: Array.from(countries),
        });
      }
    } catch (error) {
      console.error("Error fetching advocacy data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
        <div className="flex items-center justify-center h-32">
          <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-white font-semibold text-lg flex items-center gap-2">
          <Megaphone className="w-5 h-5 text-cyan-400" />
          Advocacy Dashboard
        </h2>
        <Link href="/advocacy-campaigns" className="text-cyan-400 hover:text-cyan-300 text-sm flex items-center gap-1">
          View All <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-700/30 rounded-xl p-3">
          <div className="flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-cyan-400" />
            <p className="text-slate-400 text-xs">Campaigns</p>
          </div>
          <p className="text-xl font-bold text-white">{stats.total_campaigns}</p>
          <p className="text-xs text-emerald-400">{stats.active_campaigns} active</p>
        </div>

        <div className="bg-slate-700/30 rounded-xl p-3">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-cyan-400" />
            <p className="text-slate-400 text-xs">Actions</p>
          </div>
          <p className="text-xl font-bold text-white">{stats.total_actions}</p>
          <p className="text-xs text-emerald-400">{stats.completed_actions} completed</p>
        </div>

        <div className="bg-slate-700/30 rounded-xl p-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-cyan-400" />
            <p className="text-slate-400 text-xs">Coalition</p>
          </div>
          <p className="text-xl font-bold text-white">{stats.coalition_members}</p>
          <p className="text-xs text-slate-400">{stats.countries_covered.length} countries</p>
        </div>

        <div className="bg-slate-700/30 rounded-xl p-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <p className="text-slate-400 text-xs">Impact</p>
          </div>
          <p className="text-xl font-bold text-white">{stats.total_reach.toLocaleString()}</p>
          <p className="text-xs text-slate-400">{stats.total_engagement.toLocaleString()} engagements</p>
        </div>
      </div>

      {/* Recent Campaigns */}
      <div>
        <h3 className="text-white font-medium text-sm mb-3">Recent Campaigns</h3>
        <div className="space-y-3">
          {campaigns.map((campaign) => (
            <div key={campaign.id} className="bg-slate-700/30 rounded-xl p-3 hover:bg-slate-700/50 transition-colors cursor-pointer">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-white font-medium">{campaign.title}</h4>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      campaign.status === "Active" ? "bg-emerald-500/20 text-emerald-400" :
                      campaign.status === "Planning" ? "bg-yellow-500/20 text-yellow-400" :
                      campaign.status === "Completed" ? "bg-blue-500/20 text-blue-400" :
                      "bg-slate-500/20 text-slate-400"
                    }`}>
                      {campaign.status}
                    </span>
                  </div>
                  <div className="flex gap-3 text-xs text-slate-400 mt-1">
                    <span className="flex items-center gap-1">
                      <Globe className="w-3 h-3" />
                      {campaign.country || campaign.region || "Continental"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(campaign.start_date).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {campaign.reach || 0} reached
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-slate-400">Progress</span>
                    <span className="text-cyan-400 text-sm font-bold">{campaign.progress || 0}%</span>
                  </div>
                  <div className="w-20 bg-slate-600 rounded-full h-1.5 mt-1">
                    <div 
                      className="bg-cyan-500 h-1.5 rounded-full"
                      style={{ width: `${campaign.progress || 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}