// app/countries/page.tsx
"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  MapPin,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Target,
  Users,
  Building2,
  Globe,
  Search,
  Filter,
  Download,
  RefreshCw,
  Star,
  Award,
  Flame,
  Zap,
  Leaf,
  ChevronRight,
  BarChart3,
  Eye,
  ArrowUpRight,
  Scale,
  Activity,
  Trophy,
} from "lucide-react";

// Interface matching mental_health_reforms table
interface Country {
  id: number;
  country_name: string;
  reform_tier: string;
  law_status: string;
  implementation_status: string;
  budget_level: string;
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
  created_at: string;
}

const regions = [
  "all", 
  "West Africa", 
  "East Africa", 
  "Southern Africa", 
  "North Africa", 
  "Central Africa", 
  "Island States"
];

const getPriorityIcon = (priority: string) => {
  switch (priority?.toLowerCase()) {
    case "crisis":
    case "🔥": return <Flame className="w-4 h-4 text-red-400" />;
    case "high":
    case "⚡": return <Zap className="w-4 h-4 text-yellow-400" />;
    case "model":
    case "🌱": return <Leaf className="w-4 h-4 text-emerald-400" />;
    default: return <Zap className="w-4 h-4 text-yellow-400" />;
  }
};

const getPriorityText = (priority: string) => {
  switch (priority?.toLowerCase()) {
    case "crisis":
    case "🔥": return "Crisis Priority";
    case "high":
    case "⚡": return "High Impact Priority";
    case "model":
    case "🌱": return "Model System";
    default: return "High Impact Priority";
  }
};

const getScoreColor = (score: number) => {
  if (score >= 80) return "text-emerald-400";
  if (score >= 70) return "text-cyan-400";
  if (score >= 60) return "text-blue-400";
  if (score >= 50) return "text-yellow-400";
  if (score >= 40) return "text-orange-400";
  return "text-red-400";
};

const getScoreBgColor = (score: number) => {
  if (score >= 80) return "bg-emerald-500/20";
  if (score >= 70) return "bg-cyan-500/20";
  if (score >= 60) return "bg-blue-500/20";
  if (score >= 50) return "bg-yellow-500/20";
  if (score >= 40) return "bg-orange-500/20";
  return "bg-red-500/20";
};

export default function CountriesPage() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [sortBy, setSortBy] = useState<"name" | "score" | "implementation">("score");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    fetchCountries();
  }, []);

  const fetchCountries = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/countries");
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.countries) {
          setCountries(data.countries);
        } else {
          setCountries([]);
        }
      } else {
        setCountries([]);
      }
    } catch (error) {
      console.error("Error fetching countries:", error);
      setCountries([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedCountries = useMemo(() => {
    let filtered = countries.filter(country => {
      const matchesSearch = country.country_name?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
      const matchesRegion = selectedRegion === "all" || true;
      return matchesSearch && matchesRegion;
    });

    filtered.sort((a, b) => {
      if (sortBy === "name") return (a.country_name || "").localeCompare(b.country_name || "");
      if (sortBy === "score") return (b.reform_score || 0) - (a.reform_score || 0);
      if (sortBy === "implementation") return (b.implementation_score || 0) - (a.implementation_score || 0);
      return 0;
    });

    return filtered;
  }, [countries, searchTerm, selectedRegion, sortBy]);

  const stats = {
    total: countries.length,
    avgScore: countries.length > 0 ? Math.round(countries.reduce((acc, c) => acc + (c.reform_score || 0), 0) / countries.length) : 0,
    avgImplementation: countries.length > 0 ? Math.round(countries.reduce((acc, c) => acc + (c.implementation_score || 0), 0) / countries.length) : 0,
    crisisCountries: countries.filter(c => (c.reform_score || 0) < 30).length,
    highPerformers: countries.filter(c => (c.reform_score || 0) >= 70).length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-300">Loading continental country data...</p>
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
                    CONTINENTAL DIRECTORY
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Globe className="w-4 h-4 text-cyan-400" />
                  <span className="text-slate-400 text-xs">{countries.length} African Nations</span>
                </div>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                African Countries
              </h1>
              <p className="text-slate-300 text-base md:text-lg mt-3 max-w-2xl">
                Continental mental health reform intelligence overview with comprehensive country profiles.
              </p>
            </div>

            <div className="flex gap-2 flex-wrap">
              <Link
                href="/compare"
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-xl text-white transition-colors"
              >
                <Scale className="w-4 h-4" />
                <span className="text-sm hidden sm:inline">Compare</span>
              </Link>
              <Link
                href="/heatmap"
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-xl text-white transition-colors"
              >
                <Activity className="w-4 h-4" />
                <span className="text-sm hidden sm:inline">Heatmap</span>
              </Link>
              <Link
                href="/rankings"
                className="flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-xl text-white transition-colors"
              >
                <Trophy className="w-4 h-4" />
                <span className="text-sm hidden sm:inline">Rankings</span>
              </Link>
              <button
                onClick={fetchCountries}
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
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <p className="text-slate-400 text-xs">Total Countries</p>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </div>
          <div className="bg-cyan-500/10 rounded-xl p-4 border border-cyan-500/20">
            <p className="text-cyan-400 text-xs">Average Reform Score</p>
            <p className="text-2xl font-bold text-cyan-400">{stats.avgScore}%</p>
          </div>
          <div className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/20">
            <p className="text-emerald-400 text-xs">High Performers (70+)</p>
            <p className="text-2xl font-bold text-emerald-400">{stats.highPerformers}</p>
          </div>
          <div className="bg-red-500/10 rounded-xl p-4 border border-red-500/20">
            <p className="text-red-400 text-xs">Crisis Level (&lt;30)</p>
            <p className="text-2xl font-bold text-red-400">{stats.crisisCountries}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search countries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "name" | "score" | "implementation")}
            className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="score">Sort by Reform Score</option>
            <option value="implementation">Sort by Implementation</option>
            <option value="name">Sort by Name</option>
          </select>

          <div className="flex bg-slate-800 rounded-xl p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`px-4 py-2 rounded-lg text-sm transition-all ${viewMode === "grid" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-white"}`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-4 py-2 rounded-lg text-sm transition-all ${viewMode === "list" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-white"}`}
            >
              List
            </button>
          </div>
        </div>

        {/* Countries Grid/List View */}
        {filteredAndSortedCountries.length > 0 ? (
          viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedCountries.map((country) => (
                <div
                  key={country.id}
                  className="bg-slate-800/50 rounded-2xl border border-slate-700 hover:border-cyan-500/50 transition-all group overflow-hidden"
                >
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h2 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">
                          {country.country_name}
                        </h2>
                        <p className="text-slate-400 text-sm flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3" />
                          {country.reform_tier || "Not classified"}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-slate-700">
                        {getPriorityIcon(country.priority_level)}
                        <span className="text-xs text-slate-300">{getPriorityText(country.priority_level)}</span>
                      </div>
                    </div>

                    {/* Score Display */}
                    <div className="text-center py-4 border-y border-slate-700 my-4">
                      <div className="inline-block">
                        <div className={`w-24 h-24 rounded-full ${getScoreBgColor(country.reform_score || 0)} flex items-center justify-center mx-auto`}>
                          <span className={`text-3xl font-bold ${getScoreColor(country.reform_score || 0)}`}>
                            {country.reform_score || 0}
                          </span>
                        </div>
                        <p className="text-slate-400 text-sm mt-2">Reform Score</p>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Implementation</span>
                        <span className={`font-medium ${getScoreColor(country.implementation_score || 0)}`}>{country.implementation_score || 0}%</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-1.5">
                        <div className={`h-1.5 rounded-full ${(country.implementation_score || 0) >= 70 ? "bg-emerald-500" : (country.implementation_score || 0) >= 50 ? "bg-yellow-500" : "bg-red-500"}`} style={{ width: `${country.implementation_score || 0}%` }}></div>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Law Status</span>
                        <span className="text-white text-xs">{country.law_status || "N/A"}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Funding Gap</span>
                        <span className="text-white text-xs">{country.funding_gap_level || "N/A"}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <Link
                      href={`/countries/${encodeURIComponent(country.country_name)}`}
                      className="w-full mt-4 py-2.5 bg-slate-700 hover:bg-cyan-600 rounded-xl text-white font-medium transition-colors flex items-center justify-center gap-2 group"
                    >
                      View Country Profile
                      <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead className="bg-slate-900/50">
                    <tr>
                      <th className="text-left p-4 text-slate-400 text-sm font-medium">Country</th>
                      <th className="text-left p-4 text-slate-400 text-sm font-medium">Reform Tier</th>
                      <th className="text-left p-4 text-slate-400 text-sm font-medium">Reform Score</th>
                      <th className="text-left p-4 text-slate-400 text-sm font-medium">Implementation</th>
                      <th className="text-left p-4 text-slate-400 text-sm font-medium">Priority</th>
                      <th className="text-left p-4 text-slate-400 text-sm font-medium">Funding Gap</th>
                      <th className="text-left p-4 text-slate-400 text-sm font-medium"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAndSortedCountries.map((country) => (
                      <tr key={country.id} className="border-t border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                        <td className="p-4">
                          <div>
                            <p className="text-white font-medium">{country.country_name}</p>
                          </div>
                        </td>
                        <td className="p-4 text-slate-300 text-sm">{country.reform_tier || "N/A"}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-slate-700 rounded-full h-1.5">
                              <div className={`h-1.5 rounded-full ${getScoreBgColor(country.reform_score || 0).replace('bg-', 'bg-').replace('/20', '')}`} style={{ width: `${country.reform_score || 0}%` }}></div>
                            </div>
                            <span className={`text-sm font-medium ${getScoreColor(country.reform_score || 0)}`}>{country.reform_score || 0}%</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`text-sm font-medium ${getScoreColor(country.implementation_score || 0)}`}>{country.implementation_score || 0}%</span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1">
                            {getPriorityIcon(country.priority_level)}
                            <span className="text-slate-300 text-sm">{getPriorityText(country.priority_level)}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            country.funding_gap_level?.toLowerCase() === "high" ? "bg-red-500/20 text-red-400" :
                            country.funding_gap_level?.toLowerCase() === "medium" ? "bg-yellow-500/20 text-yellow-400" :
                            "bg-emerald-500/20 text-emerald-400"
                          }`}>
                            {country.funding_gap_level || "N/A"}
                          </span>
                        </td>
                        <td className="p-4">
                          <Link
                            href={`/countries/${encodeURIComponent(country.country_name)}`}
                            className="p-2 hover:bg-slate-600 rounded-lg transition-colors inline-flex items-center"
                          >
                            <Eye className="w-4 h-4 text-slate-400" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        ) : (
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-12 text-center">
            <Globe className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">No countries found</p>
            <p className="text-slate-500 text-sm mt-2">Try adjusting your search or filters</p>
          </div>
        )}

        {/* Footer Insights */}
        {countries.length > 0 && (
          <div className="mt-8 bg-gradient-to-r from-cyan-600/10 to-blue-600/10 rounded-2xl border border-cyan-500/20 p-6">
            <div className="flex items-start gap-4">
              <BarChart3 className="w-8 h-8 text-cyan-400 flex-shrink-0" />
              <div>
                <h3 className="text-white font-semibold text-lg mb-2">Continental Insights</h3>
                <p className="text-slate-300">
                  {stats.crisisCountries} countries are in crisis tier requiring immediate intervention.
                  {stats.highPerformers} countries demonstrate strong reform progress.
                  The continental average reform score is {stats.avgScore}% with {stats.avgImplementation}% implementation.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}