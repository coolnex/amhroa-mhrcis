// app/network-intelligence/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Network,
  Globe,
  Users,
  Handshake,
  Building2,
  MapPin,
  TrendingUp,
  Activity,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

interface Country {
  id: number;
  country_name: string;
  reform_tier: string;
  law_status: string;
  implementation_status: string;
  priority_level: string;
  strategy: string;
  reform_score: number;
  implementation_score: number;
  sdg3_score: number;
  sdg10_score: number;
  sdg16_score: number;
  agenda2063_score: number;
  funding_gap_level: string;
  investment_priority: string;
  estimated_investment_need: number;
  donor_readiness_score: number;
}

interface CollaborationInsight {
  country: string;
  reform_score: number;
  implementation_score: number;
  priority_level: string;
  funding_gap: string;
  donor_readiness: number;
  tier: string;
}

export default function NetworkIntelligencePage() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState<CollaborationInsight[]>([]);
  const [stats, setStats] = useState({
    totalCountries: 0,
    avgReformScore: 0,
    avgImplementation: 0,
    highPriorityCountries: 0,
    readyForInvestment: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("mental_health_reforms")
        .select("*")
        .order("country_name", { ascending: true });

      if (error) throw error;

      if (data) {
        setCountries(data);
        
        // Calculate insights
        const insightsData = data.map((c: Country) => ({
          country: c.country_name,
          reform_score: c.reform_score || 0,
          implementation_score: c.implementation_score || 0,
          priority_level: c.priority_level || "Medium",
          funding_gap: c.funding_gap_level || "Unknown",
          donor_readiness: c.donor_readiness_score || 0,
          tier: c.reform_tier || "Not Classified",
        }));
        setInsights(insightsData);

        // Calculate stats
        const validScores = data.filter((c: Country) => c.reform_score > 0);
        setStats({
          totalCountries: data.length,
          avgReformScore: validScores.length > 0 
            ? Math.round(validScores.reduce((acc: number, c: Country) => acc + (c.reform_score || 0), 0) / validScores.length)
            : 0,
          avgImplementation: validScores.length > 0
            ? Math.round(validScores.reduce((acc: number, c: Country) => acc + (c.implementation_score || 0), 0) / validScores.length)
            : 0,
          highPriorityCountries: data.filter((c: Country) => c.priority_level === "High" || c.priority_level === "🔥").length,
          readyForInvestment: data.filter((c: Country) => (c.donor_readiness_score || 0) >= 70).length,
        });
      }
    } catch (error) {
      console.error("Error fetching network intelligence:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-300">Loading network intelligence...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-cyan-950 to-slate-900 border-b border-cyan-500/20">
        <div className="relative px-6 md:px-8 py-8 md:py-10">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-slate-400 hover:text-cyan-400 mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>

          <div className="flex justify-between items-start flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="px-3 py-1 bg-cyan-500/20 rounded-full border border-cyan-500/30">
                  <span className="text-cyan-300 text-xs font-mono tracking-wider">
                    CONTINENTAL INTELLIGENCE
                  </span>
                </div>
                <div className="px-2 py-1 bg-yellow-500/20 rounded-full">
                  <span className="text-yellow-400 text-xs">BETA</span>
                </div>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Network Intelligence
              </h1>
              <p className="text-slate-300 text-base md:text-lg mt-3 max-w-2xl">
                Continental collaboration insights and partnership opportunities.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-8 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <p className="text-slate-400 text-xs">Countries</p>
            <p className="text-2xl font-bold text-white">{stats.totalCountries}</p>
          </div>
          <div className="bg-cyan-500/10 rounded-xl p-4 border border-cyan-500/20">
            <p className="text-cyan-400 text-xs">Avg Reform Score</p>
            <p className="text-2xl font-bold text-cyan-400">{stats.avgReformScore}%</p>
          </div>
          <div className="bg-purple-500/10 rounded-xl p-4 border border-purple-500/20">
            <p className="text-purple-400 text-xs">Avg Implementation</p>
            <p className="text-2xl font-bold text-purple-400">{stats.avgImplementation}%</p>
          </div>
          <div className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/20">
            <p className="text-emerald-400 text-xs">Investment Ready</p>
            <p className="text-2xl font-bold text-emerald-400">{stats.readyForInvestment}</p>
          </div>
        </div>

        {/* Network Insights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {insights.map((country) => (
            <div
              key={country.country}
              className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6 hover:border-cyan-500/30 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-white font-bold text-lg">{country.country}</h3>
                  <p className="text-slate-400 text-sm">{country.tier}</p>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs ${
                  country.priority_level === "High" || country.priority_level === "🔥" 
                    ? "bg-red-500/20 text-red-400" 
                    : country.priority_level === "Medium" || country.priority_level === "⚡"
                    ? "bg-yellow-500/20 text-yellow-400"
                    : "bg-emerald-500/20 text-emerald-400"
                }`}>
                  {country.priority_level}
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">Reform Score</span>
                    <span className="text-cyan-400">{country.reform_score}%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-1.5">
                    <div className="bg-cyan-500 h-1.5 rounded-full" style={{ width: `${country.reform_score}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">Implementation</span>
                    <span className="text-purple-400">{country.implementation_score}%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-1.5">
                    <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: `${country.implementation_score}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">Donor Readiness</span>
                    <span className="text-emerald-400">{country.donor_readiness}%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-1.5">
                    <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${country.donor_readiness}%` }}></div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-700 flex items-center justify-between text-sm">
                <span className="text-slate-400">Funding Gap</span>
                <span className={`font-medium ${
                  country.funding_gap === "High" ? "text-red-400" :
                  country.funding_gap === "Medium" ? "text-yellow-400" :
                  "text-emerald-400"
                }`}>
                  {country.funding_gap}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Coming Soon */}
        <div className="mt-8 bg-gradient-to-r from-cyan-600/10 to-blue-600/10 rounded-2xl border border-cyan-500/20 p-6 text-center">
          <Network className="w-8 h-8 text-cyan-400 mx-auto mb-3" />
          <h3 className="text-white font-semibold text-lg">Coming Soon</h3>
          <p className="text-slate-400 text-sm">
            Advanced collaboration insights, partnership recommendations, and network visualization.
          </p>
        </div>
      </div>
    </div>
  );
}