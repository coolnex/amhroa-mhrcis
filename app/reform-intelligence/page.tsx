"use client";

import Link from "next/link";
import { useEffect, useState, useMemo, useCallback } from "react";
import {
  TrendingUp,
  TrendingDown,
  ArrowLeft,
  AlertTriangle,
  CheckCircle,
  XCircle,
  AlertCircle,
  Flame,
  Zap,
  Leaf,
  Target,
  Globe,
  Search,
  Filter,
  Download,
  RefreshCw,
  Eye,
  BarChart3,
  PieChart,
  ChevronDown,
  ChevronUp,
  MapPin,
  Calendar,
  Award,
  Shield,
  Brain,
  Activity,
  Loader2,
} from "lucide-react";


interface ReformCountry {
  id: number;
  country_name: string;
  region: string;
  law_status: string;
  strategy: string;
  implementation_status: string;
  budget_level: string;
  priority_level: string;
  reform_score: number;
  reform_tier: string;
  population: number;
  last_updated: string;
  key_gaps: string[];
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

const tierConfig: Record<string, { color: string; bg: string; border: string; text: string; description: string }> = {
  "Tier 1 - High Priority": { 
    color: "bg-red-600", 
    bg: "bg-red-500/10", 
    border: "border-red-500/30", 
    text: "text-red-400", 
    description: "System Failure - No Law / No Implementation" 
  },
  "Tier 2 - Law Exists, Minimal Implementation": { 
    color: "bg-orange-500", 
    bg: "bg-orange-500/10", 
    border: "border-orange-500/30", 
    text: "text-orange-400", 
    description: "Law Exists / Minimal Implementation" 
  },
  "Tier 3 - Outdated Laws": { 
    color: "bg-yellow-500", 
    bg: "bg-yellow-500/10", 
    border: "border-yellow-500/30", 
    text: "text-yellow-400", 
    description: "Outdated Laws / Reform Urgent" 
  },
  "Tier 4 - Moderate Systems": { 
    color: "bg-green-600", 
    bg: "bg-green-500/10", 
    border: "border-green-500/30", 
    text: "text-green-400", 
    description: "Moderate Systems / Implementation Gaps" 
  },
  "Tier 5 - Small States": { 
    color: "bg-cyan-600", 
    bg: "bg-cyan-500/10", 
    border: "border-cyan-500/30", 
    text: "text-cyan-400", 
    description: "Small States / Mixed Systems" 
  },
};

const getPriorityIcon = (priority: string) => {
  if (!priority) return <Zap className="w-4 h-4 text-yellow-400" />;
  const lower = priority.toLowerCase();
  if (lower.includes("crisis") || lower.includes("🔥")) 
    return <Flame className="w-4 h-4 text-red-400" />;
  if (lower.includes("high") || lower.includes("⚡")) 
    return <Zap className="w-4 h-4 text-yellow-400" />;
  if (lower.includes("model") || lower.includes("🌱")) 
    return <Leaf className="w-4 h-4 text-emerald-400" />;
  return <Zap className="w-4 h-4 text-yellow-400" />;
};

const getPriorityText = (priority: string) => {
  if (!priority) return "Medium Priority";
  const lower = priority.toLowerCase();
  if (lower.includes("crisis") || lower.includes("🔥")) return "Crisis Priority";
  if (lower.includes("high") || lower.includes("⚡")) return "High Impact Priority";
  if (lower.includes("model") || lower.includes("🌱")) return "Model System";
  return "Medium Priority";
};

const getLawIcon = (status: string) => {
  if (!status) return <AlertCircle className="w-4 h-4 text-slate-400" />;
  if (status.includes("✅")) return <CheckCircle className="w-4 h-4 text-emerald-400" />;
  if (status.includes("⚠️")) return <AlertCircle className="w-4 h-4 text-yellow-400" />;
  if (status.includes("❌")) return <XCircle className="w-4 h-4 text-red-400" />;
  return <AlertCircle className="w-4 h-4 text-slate-400" />;
};

const getLawLabel = (status: string) => {
  if (!status) return "Unknown";
  if (status.includes("✅")) return "Modern";
  if (status.includes("⚠️")) return "Outdated";
  if (status.includes("❌")) return "None";
  return status;
};

const getImplIcon = (status: string) => {
  if (!status) return <AlertCircle className="w-4 h-4 text-slate-400" />;
  if (status.includes("🟢")) return <CheckCircle className="w-4 h-4 text-emerald-400" />;
  if (status.includes("🟡")) return <AlertCircle className="w-4 h-4 text-yellow-400" />;
  if (status.includes("🔴")) return <XCircle className="w-4 h-4 text-red-400" />;
  return <AlertCircle className="w-4 h-4 text-slate-400" />;
};

const getImplLabel = (status: string) => {
  if (!status) return "Unknown";
  if (status.includes("🟢")) return "Moderate";
  if (status.includes("🟡")) return "Weak";
  if (status.includes("🔴")) return "Minimal";
  return status;
};

const getBudgetColor = (budget: string) => {
  if (!budget) return "bg-slate-500/20 text-slate-400";
  const lower = budget.toLowerCase();
  if (lower.includes("high") || lower.includes(">2%")) 
    return "bg-emerald-500/20 text-emerald-400";
  if (lower.includes("medium") || lower.includes("1–2%")) 
    return "bg-yellow-500/20 text-yellow-400";
  if (lower.includes("low") || lower.includes("<1%")) 
    return "bg-red-500/20 text-red-400";
  return "bg-slate-500/20 text-slate-400";
};

export default function ReformIntelligencePage() {
  const [reforms, setReforms] = useState<ReformCountry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTier, setSelectedTier] = useState<string>("all");
  const [selectedPriority, setSelectedPriority] = useState<string>("all");
  const [expandedTiers, setExpandedTiers] = useState<string[]>([
    "Tier 1 - High Priority",
    "Tier 2 - Law Exists, Minimal Implementation",
    "Tier 3 - Outdated Laws",
    "Tier 4 - Moderate Systems",
    "Tier 5 - Small States"
  ]);
  const [selectedCountry, setSelectedCountry] = useState<ReformCountry | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReforms();
  }, []);

  const fetchReforms = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/reform-intelligence");
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.reforms) {
        setReforms(data.reforms);
      } else {
        setError(data.message || "Failed to load reform data");
        setReforms([]);
      }
    } catch (error) {
      console.error("Error fetching reforms:", error);
      setError("Failed to load reform intelligence. Please try again.");
      setReforms([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter reforms based on search and filters
  const filteredReforms = useMemo(() => {
    let filtered = reforms;

    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(reform => 
        reform.country_name.toLowerCase().includes(searchLower)
      );
    }

    // Apply tier filter
    if (selectedTier !== "all") {
      filtered = filtered.filter(reform => 
        reform.reform_tier === selectedTier
      );
    }

    // Apply priority filter
    if (selectedPriority !== "all") {
      filtered = filtered.filter(reform => 
        reform.priority_level?.toLowerCase().includes(selectedPriority.toLowerCase())
      );
    }

    return filtered;
  }, [reforms, searchTerm, selectedTier, selectedPriority]);

  // Group reforms by tier
  const groupedReforms = useMemo(() => {
    return filteredReforms.reduce((acc: Record<string, ReformCountry[]>, reform) => {
      const tier = reform.reform_tier || "Unclassified";
      if (!acc[tier]) {
        acc[tier] = [];
      }
      acc[tier].push(reform);
      return acc;
    }, {});
  }, [filteredReforms]);

  const stats = {
    total: reforms.length,
    avgScore: reforms.length > 0 
      ? Math.round(reforms.reduce((acc, r) => acc + (r.reform_score || 0), 0) / reforms.length) 
      : 0,
    tier1: reforms.filter(r => r.reform_tier?.includes("Tier 1")).length,
    tier2: reforms.filter(r => r.reform_tier?.includes("Tier 2")).length,
    tier3: reforms.filter(r => r.reform_tier?.includes("Tier 3")).length,
    highPriority: reforms.filter(r => r.priority_level?.toLowerCase().includes("high")).length,
    critical: reforms.filter(r => (r.reform_score || 0) < 30).length,
  };

  const toggleTier = (tier: string) => {
    setExpandedTiers(prev =>
      prev.includes(tier) ? prev.filter(t => t !== tier) : [...prev, tier]
    );
  };

  // Get unique tier names for filter dropdown
  const uniqueTiers = useMemo(() => {
    const tiers = reforms.map(r => r.reform_tier).filter(Boolean);
    return [...new Set(tiers)];
  }, [reforms]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-cyan-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-300">Loading reform intelligence...</p>
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
                    CONTINENTAL REFORM OBSERVATORY
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Activity className="w-4 h-4 text-green-400 animate-pulse" />
                  <span className="text-slate-400 text-xs">Live Intelligence</span>
                </div>
                {error && (
                  <div className="px-3 py-1 bg-red-500/20 rounded-full border border-red-500/30">
                    <span className="text-red-300 text-xs">{error}</span>
                  </div>
                )}
              </div>
              <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Continental Reform Intelligence
              </h1>
              <p className="text-slate-300 text-base md:text-lg mt-3 max-w-2xl">
                Live Pan-African mental health reform observatory tracking implementation progress across {reforms.length} nations.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={fetchReforms}
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
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <p className="text-slate-400 text-xs">Countries Tracked</p>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </div>
          <div className="bg-cyan-500/10 rounded-xl p-4 border border-cyan-500/20">
            <p className="text-cyan-400 text-xs">Continental Avg Score</p>
            <p className="text-2xl font-bold text-cyan-400">{stats.avgScore}%</p>
          </div>
          <div className="bg-red-500/10 rounded-xl p-4 border border-red-500/20">
            <p className="text-red-400 text-xs">🔥 Tier 1 (Crisis)</p>
            <p className="text-2xl font-bold text-red-400">{stats.tier1}</p>
          </div>
          <div className="bg-orange-500/10 rounded-xl p-4 border border-orange-500/20">
            <p className="text-orange-400 text-xs">⚡ Tier 2 (Law/No Impl)</p>
            <p className="text-2xl font-bold text-orange-400">{stats.tier2}</p>
          </div>
          <div className="bg-yellow-500/10 rounded-xl p-4 border border-yellow-500/20">
            <p className="text-yellow-400 text-xs">⚠️ Tier 3 (Outdated)</p>
            <p className="text-2xl font-bold text-yellow-400">{stats.tier3}</p>
          </div>
          <div className="bg-red-500/10 rounded-xl p-4 border border-red-500/20">
            <p className="text-red-400 text-xs">🚨 Critical (&lt;30%)</p>
            <p className="text-2xl font-bold text-red-400">{stats.critical}</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-wrap gap-4 mb-8">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by country name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
            {searchTerm && (
              <p className="text-slate-400 text-xs mt-1">
                Showing {filteredReforms.length} of {reforms.length} countries
              </p>
            )}
          </div>

          <select
            value={selectedTier}
            onChange={(e) => setSelectedTier(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Tiers</option>
            {uniqueTiers.map((tier) => (
              <option key={tier} value={tier}>
                {tier}
              </option>
            ))}
          </select>

          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Priorities</option>
            <option value="high">🔥 High Priority</option>
            <option value="medium">⚡ Medium Priority</option>
            <option value="low">🌱 Low Priority</option>
          </select>

          {(searchTerm || selectedTier !== "all" || selectedPriority !== "all") && (
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedTier("all");
                setSelectedPriority("all");
              }}
              className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-xl text-white text-sm transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Tier Sections */}
        <div className="space-y-6">
          {Object.entries(groupedReforms)
            .sort(([tierA], [tierB]) => {
              const order: Record<string, number> = {
                "Tier 1 - High Priority": 1,
                "Tier 2 - Law Exists, Minimal Implementation": 2,
                "Tier 3 - Outdated Laws": 3,
                "Tier 4 - Moderate Systems": 4,
                "Tier 5 - Small States": 5,
              };
              return (order[tierA] || 99) - (order[tierB] || 99);
            })
            .map(([tier, countries]) => {
              const isExpanded = expandedTiers.includes(tier);
              const config = tierConfig[tier as keyof typeof tierConfig] || tierConfig["Tier 2 - Law Exists, Minimal Implementation"];
              const countriesList = countries as ReformCountry[];

              return (
                <div key={tier} className="bg-slate-800/50 rounded-2xl border border-slate-700 overflow-hidden">
                  {/* Tier Header */}
                  <button
                    onClick={() => toggleTier(tier)}
                    className={`w-full ${config.color} text-white p-6 flex justify-between items-center transition-opacity hover:opacity-90`}
                  >
                    <div className="text-left">
                      <h2 className="text-3xl font-bold">{tier}</h2>
                      <p className="text-white/80 text-sm mt-1">{config.description}</p>
                      <p className="text-white/60 text-xs mt-2">{countriesList.length} countries</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-white/60 text-sm">
                        Avg Score: {Math.round(countriesList.reduce((sum, c) => sum + (c.reform_score || 0), 0) / countriesList.length)}%
                      </span>
                      {isExpanded ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
                    </div>
                  </button>

                  {/* Countries Table */}
                  {isExpanded && (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[900px]">
                        <thead className="bg-slate-900/50">
                          <tr>
                            <th className="text-left p-4 text-slate-400 text-sm font-medium">Country</th>
                            <th className="text-left p-4 text-slate-400 text-sm font-medium">Law</th>
                            <th className="text-left p-4 text-slate-400 text-sm font-medium">Implementation</th>
                            <th className="text-left p-4 text-slate-400 text-sm font-medium">Budget</th>
                            <th className="text-left p-4 text-slate-400 text-sm font-medium">Priority</th>
                            <th className="text-left p-4 text-slate-400 text-sm font-medium">Score</th>
                            <th className="text-left p-4 text-slate-400 text-sm font-medium">SDG 3</th>
                            <th className="text-left p-4 text-slate-400 text-sm font-medium"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {countriesList.map((country) => (
                            <tr
                              key={country.id}
                              className="border-t border-slate-700/50 hover:bg-slate-700/30 transition-colors cursor-pointer"
                              onClick={() => setSelectedCountry(country)}
                            >
                              <td className="p-4">
                                <div>
                                  <p className="text-white font-semibold">{country.country_name}</p>
                                  <p className="text-slate-400 text-xs">
                                    Investment Need: ${(country.estimated_investment_need || 0).toLocaleString()}
                                  </p>
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="flex items-center gap-2">
                                  {getLawIcon(country.law_status)}
                                  <span className="text-slate-300 text-sm">{getLawLabel(country.law_status)}</span>
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="flex items-center gap-2">
                                  {getImplIcon(country.implementation_status)}
                                  <span className="text-slate-300 text-sm">{getImplLabel(country.implementation_status)}</span>
                                </div>
                              </td>
                              <td className="p-4">
                                <span className={`px-2 py-1 rounded-full text-xs ${getBudgetColor(country.budget_level)}`}>
                                  {country.budget_level || "N/A"}
                                </span>
                              </td>
                              <td className="p-4">
                                <div className="flex items-center gap-1">
                                  {getPriorityIcon(country.priority_level)}
                                  <span className="text-slate-300 text-sm">{getPriorityText(country.priority_level)}</span>
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="flex items-center gap-2">
                                  <div className="w-20 bg-slate-700 rounded-full h-1.5">
                                    <div
                                      className={`h-1.5 rounded-full ${(country.reform_score || 0) >= 70 ? "bg-emerald-500" : (country.reform_score || 0) >= 50 ? "bg-yellow-500" : "bg-red-500"}`}
                                      style={{ width: `${Math.min(country.reform_score || 0, 100)}%` }}
                                    ></div>
                                  </div>
                                  <span className={`text-sm font-medium ${(country.reform_score || 0) >= 70 ? "text-emerald-400" : (country.reform_score || 0) >= 50 ? "text-yellow-400" : "text-red-400"}`}>
                                    {country.reform_score || 0}%
                                  </span>
                                </div>
                              </td>
                              <td className="p-4">
                                <span className="text-slate-300 text-sm">{country.sdg3_score || 0}%</span>
                              </td>
                              <td className="p-4">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedCountry(country);
                                  }}
                                  className="p-2 hover:bg-slate-600 rounded-lg transition-colors"
                                >
                                  <Eye className="w-4 h-4 text-slate-400" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}
        </div>

        {/* Empty State */}
        {filteredReforms.length === 0 && reforms.length > 0 && (
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-12 text-center">
            <Search className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">No countries match your filters</p>
            <p className="text-slate-500 text-sm mt-2">Try adjusting your search or filters</p>
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedTier("all");
                setSelectedPriority("all");
              }}
              className="mt-4 px-6 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-xl text-white transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        )}

        {/* Empty State - No Data */}
        {reforms.length === 0 && !loading && (
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-12 text-center">
            <Globe className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">No reform data available</p>
            <p className="text-slate-500 text-sm mt-2">Data will appear here once available</p>
            <button
              onClick={fetchReforms}
              className="mt-4 px-6 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-xl text-white transition-colors"
            >
              <RefreshCw className="w-4 h-4 inline mr-2" />
              Retry
            </button>
          </div>
        )}
      </div>

      {/* Country Detail Modal */}
      {selectedCountry && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setSelectedCountry(null)}>
          <div className="bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-700 sticky top-0 bg-slate-800 z-10">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="text-2xl font-bold text-white">{selectedCountry.country_name}</h2>
                    {getPriorityIcon(selectedCountry.priority_level)}
                  </div>
                  <p className="text-slate-400">{selectedCountry.reform_tier}</p>
                </div>
                <button onClick={() => setSelectedCountry(null)} className="text-slate-400 hover:text-white text-2xl">&times;</button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-700/30 rounded-lg p-3 text-center">
                  <p className="text-slate-400 text-xs">Reform Score</p>
                  <p className={`text-3xl font-bold ${(selectedCountry.reform_score || 0) >= 70 ? "text-emerald-400" : (selectedCountry.reform_score || 0) >= 50 ? "text-yellow-400" : "text-red-400"}`}>
                    {selectedCountry.reform_score || 0}%
                  </p>
                </div>
                <div className="bg-slate-700/30 rounded-lg p-3 text-center">
                  <p className="text-slate-400 text-xs">Implementation</p>
                  <p className={`text-2xl font-bold ${(selectedCountry.implementation_score || 0) >= 70 ? "text-emerald-400" : (selectedCountry.implementation_score || 0) >= 50 ? "text-yellow-400" : "text-red-400"}`}>
                    {selectedCountry.implementation_score || 0}%
                  </p>
                </div>
                <div className="bg-slate-700/30 rounded-lg p-3">
                  <p className="text-slate-400 text-xs">Law Status</p>
                  <div className="flex items-center gap-2 mt-1">
                    {getLawIcon(selectedCountry.law_status)}
                    <span className="text-white">{getLawLabel(selectedCountry.law_status)}</span>
                  </div>
                </div>
                <div className="bg-slate-700/30 rounded-lg p-3">
                  <p className="text-slate-400 text-xs">Donor Readiness</p>
                  <p className="text-2xl font-bold text-cyan-400">{selectedCountry.donor_readiness_score || 0}%</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-700/30 rounded-lg p-3 text-center">
                  <p className="text-slate-400 text-xs">SDG 3.4</p>
                  <p className="text-xl font-bold text-purple-400">{selectedCountry.sdg3_score || 0}%</p>
                </div>
                <div className="bg-slate-700/30 rounded-lg p-3 text-center">
                  <p className="text-slate-400 text-xs">SDG 10</p>
                  <p className="text-xl font-bold text-blue-400">{selectedCountry.sdg10_score || 0}%</p>
                </div>
                <div className="bg-slate-700/30 rounded-lg p-3 text-center">
                  <p className="text-slate-400 text-xs">SDG 16</p>
                  <p className="text-xl font-bold text-green-400">{selectedCountry.sdg16_score || 0}%</p>
                </div>
              </div>

              {selectedCountry.funding_gap_level && (
                <div className={`rounded-lg p-4 border ${
                  selectedCountry.funding_gap_level?.toLowerCase() === "critical" ? "bg-red-500/10 border-red-500/20" :
                  selectedCountry.funding_gap_level?.toLowerCase() === "high" ? "bg-orange-500/10 border-orange-500/20" :
                  selectedCountry.funding_gap_level?.toLowerCase() === "medium" ? "bg-yellow-500/10 border-yellow-500/20" :
                  "bg-emerald-500/10 border-emerald-500/20"
                }`}>
                  <p className="text-slate-400 text-sm">Funding Gap Level</p>
                  <p className={`text-lg font-semibold ${
                    selectedCountry.funding_gap_level?.toLowerCase() === "critical" ? "text-red-400" :
                    selectedCountry.funding_gap_level?.toLowerCase() === "high" ? "text-orange-400" :
                    selectedCountry.funding_gap_level?.toLowerCase() === "medium" ? "text-yellow-400" :
                    "text-emerald-400"
                  }`}>
                    {selectedCountry.funding_gap_level}
                  </p>
                  {selectedCountry.estimated_investment_need > 0 && (
                    <p className="text-slate-400 text-sm mt-1">
                      Estimated Investment Need: ${selectedCountry.estimated_investment_need.toLocaleString()}
                    </p>
                  )}
                </div>
              )}

              {selectedCountry.strategy && (
                <div className="bg-cyan-600/10 rounded-lg p-4 border border-cyan-500/20">
                  <p className="text-cyan-400 text-sm font-semibold mb-2">Recommended Strategy</p>
                  <p className="text-white text-sm">{selectedCountry.strategy}</p>
                </div>
              )}

              <div className="flex justify-between pt-4 border-t border-slate-700">
                <p className="text-slate-500 text-xs">Last updated: {new Date(selectedCountry.last_updated).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}