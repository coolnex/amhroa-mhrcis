// app/impact-intelligence/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Sparkles,
  Award,
  TrendingUp,
  CheckCircle,
  Activity,
  Loader2,
  ArrowLeft,
  Globe,
  Target,
  Users,
  BarChart3,
} from "lucide-react";
import Link from "next/link";

interface Country {
  id: number;
  country_name: string;
  reform_score: number;
  implementation_score: number;
  sdg3_score: number;
  sdg10_score: number;
  sdg16_score: number;
  agenda2063_score: number;
  donor_readiness_score: number;
  funding_gap_level: string;
  priority_level: string;
  reform_tier: string;
}

interface ImpactMetric {
  label: string;
  value: number;
  icon: any;
  color: string;
  description: string;
}

export default function ImpactIntelligencePage() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [impactMetrics, setImpactMetrics] = useState<ImpactMetric[]>([]);

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
        
        // Calculate impact metrics
        const validData = data.filter((c: Country) => c.reform_score > 0);
        const avgReform = validData.length > 0 
          ? Math.round(validData.reduce((acc: number, c: Country) => acc + (c.reform_score || 0), 0) / validData.length)
          : 0;
        const avgImplementation = validData.length > 0
          ? Math.round(validData.reduce((acc: number, c: Country) => acc + (c.implementation_score || 0), 0) / validData.length)
          : 0;
        
        setImpactMetrics([
          {
            label: "Average Reform Score",
            value: avgReform,
            icon: Award,
            color: "text-cyan-400",
            description: "Continental average reform progress",
          },
          {
            label: "Average Implementation",
            value: avgImplementation,
            icon: Activity,
            color: "text-purple-400",
            description: "Policy implementation across Africa",
          },
          {
            label: "Countries Tracked",
            value: data.length,
            icon: Globe,
            color: "text-emerald-400",
            description: "African nations under review",
          },
          {
            label: "High Priority Countries",
            value: data.filter((c: Country) => c.priority_level === "High" || c.priority_level === "🔥").length,
            icon: Target,
            color: "text-yellow-400",
            description: "Countries requiring urgent attention",
          },
        ]);
      }
    } catch (error) {
      console.error("Error fetching impact intelligence:", error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-emerald-500/20 text-emerald-400";
    if (score >= 60) return "bg-cyan-500/20 text-cyan-400";
    if (score >= 40) return "bg-yellow-500/20 text-yellow-400";
    return "bg-red-500/20 text-red-400";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-300">Loading impact intelligence...</p>
        </div>
      </div>
    );
  }

  const topPerformers = countries
    .filter(c => c.reform_score > 0)
    .sort((a, b) => (b.reform_score || 0) - (a.reform_score || 0))
    .slice(0, 5);

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
                    IMPACT INTELLIGENCE
                  </span>
                </div>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Impact Intelligence
              </h1>
              <p className="text-slate-300 text-base md:text-lg mt-3 max-w-2xl">
                Measure and track the impact of mental health reforms across Africa.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-8 py-6">
        {/* Impact Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {impactMetrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <div key={metric.label} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={`w-4 h-4 ${metric.color}`} />
                  <p className="text-slate-400 text-xs">{metric.label}</p>
                </div>
                <p className={`text-2xl font-bold ${metric.color}`}>{metric.value}</p>
                <p className="text-slate-500 text-xs mt-1">{metric.description}</p>
              </div>
            );
          })}
        </div>

        {/* Top Performers */}
        <div className="mb-8">
          <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-400" />
            Top Performers
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topPerformers.map((country) => (
              <div
                key={country.id}
                className="bg-slate-800/50 rounded-xl border border-slate-700 p-4 hover:border-cyan-500/30 transition-all"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                    <Award className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">{country.country_name}</h3>
                    <p className="text-slate-400 text-xs">{country.reform_tier}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-slate-700/30 rounded-lg p-2 text-center">
                    <p className="text-slate-400 text-xs">Reform</p>
                    <p className={`text-lg font-bold ${getScoreColor(country.reform_score || 0)}`}>
                      {country.reform_score}%
                    </p>
                  </div>
                  <div className="bg-slate-700/30 rounded-lg p-2 text-center">
                    <p className="text-slate-400 text-xs">Implementation</p>
                    <p className={`text-lg font-bold ${getScoreColor(country.implementation_score || 0)}`}>
                      {country.implementation_score}%
                    </p>
                  </div>
                  <div className="bg-slate-700/30 rounded-lg p-2 text-center">
                    <p className="text-slate-400 text-xs">Priority</p>
                    <p className={`text-sm font-bold ${
                      country.priority_level === "High" || country.priority_level === "🔥" 
                        ? "text-red-400" 
                        : country.priority_level === "Medium" || country.priority_level === "⚡"
                        ? "text-yellow-400"
                        : "text-emerald-400"
                    }`}>
                      {country.priority_level || "N/A"}
                    </p>
                  </div>
                  <div className="bg-slate-700/30 rounded-lg p-2 text-center">
                    <p className="text-slate-400 text-xs">Funding Gap</p>
                    <p className={`text-sm font-bold ${
                      country.funding_gap_level === "High" ? "text-red-400" :
                      country.funding_gap_level === "Medium" ? "text-yellow-400" :
                      "text-emerald-400"
                    }`}>
                      {country.funding_gap_level || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* All Countries Table */}
        <div className="bg-slate-800/50 rounded-2xl border border-slate-700 overflow-hidden">
          <div className="p-4 border-b border-slate-700 bg-slate-800/80">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-cyan-400" />
              All Country Impact Scores
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-900/50">
                <tr>
                  <th className="text-left p-4 text-slate-400 text-sm font-medium">Country</th>
                  <th className="text-left p-4 text-slate-400 text-sm font-medium">Reform</th>
                  <th className="text-left p-4 text-slate-400 text-sm font-medium">Implementation</th>
                  <th className="text-left p-4 text-slate-400 text-sm font-medium">SDG 3.4</th>
                  <th className="text-left p-4 text-slate-400 text-sm font-medium">SDG 10.2</th>
                  <th className="text-left p-4 text-slate-400 text-sm font-medium">SDG 16.3</th>
                  <th className="text-left p-4 text-slate-400 text-sm font-medium">Priority</th>
                </tr>
              </thead>
              <tbody>
                {countries.map((country) => (
                  <tr key={country.id} className="border-t border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                    <td className="p-4 font-medium text-white">{country.country_name}</td>
                    <td className={`p-4 font-bold ${getScoreColor(country.reform_score || 0)}`}>
                      {country.reform_score}%
                    </td>
                    <td className={`p-4 font-bold ${getScoreColor(country.implementation_score || 0)}`}>
                      {country.implementation_score}%
                    </td>
                    <td className={`p-4 font-bold ${getScoreColor(country.sdg3_score || 0)}`}>
                      {country.sdg3_score}%
                    </td>
                    <td className={`p-4 font-bold ${getScoreColor(country.sdg10_score || 0)}`}>
                      {country.sdg10_score}%
                    </td>
                    <td className={`p-4 font-bold ${getScoreColor(country.sdg16_score || 0)}`}>
                      {country.sdg16_score}%
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        country.priority_level === "High" || country.priority_level === "🔥" 
                          ? "bg-red-500/20 text-red-400" 
                          : country.priority_level === "Medium" || country.priority_level === "⚡"
                          ? "bg-yellow-500/20 text-yellow-400"
                          : "bg-emerald-500/20 text-emerald-400"
                      }`}>
                        {country.priority_level || "N/A"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-8 bg-gradient-to-r from-cyan-600/10 to-blue-600/10 rounded-2xl border border-cyan-500/20 p-6 text-center">
          <Sparkles className="w-8 h-8 text-cyan-400 mx-auto mb-3" />
          <h3 className="text-white font-semibold text-lg">Coming Soon</h3>
          <p className="text-slate-400 text-sm">
            Advanced impact metrics, ROI analysis, and success story tracking.
          </p>
        </div>
      </div>
    </div>
  );
}