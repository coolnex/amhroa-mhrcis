// app/data-explorer/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Database,
  Search,
  Filter,
  Download,
  RefreshCw,
  Loader2,
  ArrowLeft,
  BarChart3,
  PieChart,
  Activity,
  Globe,
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
  law_status: string;
  implementation_status: string;
  budget_level: string;
  strategy: string;
}

export default function DataExplorerPage() {
  const [data, setData] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMetric, setSelectedMetric] = useState<string>("all");
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

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
      setData(data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const metrics = [
    { key: "reform_score", label: "Reform Score", color: "text-cyan-400" },
    { key: "implementation_score", label: "Implementation", color: "text-purple-400" },
    { key: "sdg3_score", label: "SDG 3.4", color: "text-emerald-400" },
    { key: "sdg10_score", label: "SDG 10.2", color: "text-blue-400" },
    { key: "sdg16_score", label: "SDG 16.3", color: "text-yellow-400" },
    { key: "agenda2063_score", label: "Agenda 2063", color: "text-orange-400" },
    { key: "donor_readiness_score", label: "Donor Readiness", color: "text-pink-400" },
  ];

  const filteredData = data.filter((item) => {
    const matchesSearch = item.country_name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-400";
    if (score >= 60) return "text-cyan-400";
    if (score >= 40) return "text-yellow-400";
    return "text-red-400";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-300">Loading data explorer...</p>
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
                    CONTINENTAL DATA EXPLORER
                  </span>
                </div>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Data Explorer
              </h1>
              <p className="text-slate-300 text-base md:text-lg mt-3 max-w-2xl">
                Explore continental mental health reform datasets.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={fetchData}
                className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-600 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="text-sm hidden sm:inline">Refresh</span>
              </button>
              <button className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-600 transition-colors">
                <Download className="w-4 h-4" />
                <span className="text-sm hidden sm:inline">Export</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-8 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center gap-2 mb-1">
              <Globe className="w-4 h-4 text-cyan-400" />
              <p className="text-slate-400 text-xs">Countries</p>
            </div>
            <p className="text-2xl font-bold text-white">{data.length}</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              <p className="text-slate-400 text-xs">Metrics</p>
            </div>
            <p className="text-2xl font-bold text-white">{metrics.length}</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center gap-2 mb-1">
              <PieChart className="w-4 h-4 text-cyan-400" />
              <p className="text-slate-400 text-xs">Data Points</p>
            </div>
            <p className="text-2xl font-bold text-white">{data.length * metrics.length}</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="w-4 h-4 text-cyan-400" />
              <p className="text-slate-400 text-xs">Last Updated</p>
            </div>
            <p className="text-2xl font-bold text-white">Today</p>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search countries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="all">All Metrics</option>
              {metrics.map((m) => (
                <option key={m.key} value={m.key}>{m.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-slate-800/50 rounded-2xl border border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-900/50">
                <tr>
                  <th className="text-left p-4 text-slate-400 text-sm font-medium sticky left-0 bg-slate-900/50">Country</th>
                  {metrics.map((m) => (
                    <th key={m.key} className="text-left p-4 text-slate-400 text-sm font-medium">{m.label}</th>
                  ))}
                  <th className="text-left p-4 text-slate-400 text-sm font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item) => (
                  <tr
                    key={item.id}
                    className="border-t border-slate-700/50 hover:bg-slate-700/30 transition-colors cursor-pointer"
                    onClick={() => setSelectedCountry(selectedCountry === item.country_name ? null : item.country_name)}
                  >
                    <td className="p-4 font-medium text-white sticky left-0 bg-slate-800/50">
                      {item.country_name}
                    </td>
                    {metrics.map((m) => {
                      const value = item[m.key as keyof Country] as number;
                      return (
                        <td key={m.key} className={`p-4 font-medium ${getScoreColor(value || 0)}`}>
                          {value || "—"}
                          {typeof value === "number" && <span className="text-slate-500 text-xs ml-1">%</span>}
                        </td>
                      );
                    })}
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        item.priority_level === "High" || item.priority_level === "🔥" 
                          ? "bg-red-500/20 text-red-400" 
                          : item.priority_level === "Medium" || item.priority_level === "⚡"
                          ? "bg-yellow-500/20 text-yellow-400"
                          : "bg-emerald-500/20 text-emerald-400"
                      }`}>
                        {item.priority_level || "N/A"}
                      </span>
                    </td>
                  </tr>
                ))}
                {filteredData.length === 0 && (
                  <tr>
                    <td colSpan={metrics.length + 2} className="p-12 text-center text-slate-400">
                      <Database className="w-12 h-12 mx-auto mb-3 text-slate-600" />
                      <p>No data found</p>
                      <p className="text-sm text-slate-500">Try adjusting your search</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-8 bg-gradient-to-r from-cyan-600/10 to-blue-600/10 rounded-2xl border border-cyan-500/20 p-6 text-center">
          <Database className="w-8 h-8 text-cyan-400 mx-auto mb-3" />
          <h3 className="text-white font-semibold text-lg">Coming Soon</h3>
          <p className="text-slate-400 text-sm">
            Advanced data filtering, visualization tools, and API access for researchers.
          </p>
        </div>
      </div>
    </div>
  );
}