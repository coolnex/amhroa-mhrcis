"use client";

import { useEffect, useState, useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
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
} from "lucide-react";
import Link from "next/link";

interface ReformCountry {
  id: number;
  country_name: string;
  region: string;
  law_status: string;
  implementation_status: string;
  budget_level: string;
  priority_level: "🔥" | "⚡" | "🌱";
  reform_score: number;
  reform_tier: string;
  population: number;
  last_updated: string;
  key_gaps: string[];
}

// Mock data - would come from API
const mockReforms: ReformCountry[] = [
  { id: 1, country_name: "Nigeria", region: "West Africa", law_status: "Modern Law", implementation_status: "Minimal", budget_level: "Low", priority_level: "🔥", reform_score: 62, reform_tier: "Tier 2", population: 218.6, last_updated: "2024-03-15", key_gaps: ["State domestication", "Workforce shortage"] },
  { id: 2, country_name: "Kenya", region: "East Africa", law_status: "Modern Law", implementation_status: "Partial", budget_level: "Low", priority_level: "🔥", reform_score: 74, reform_tier: "Tier 2", population: 53.8, last_updated: "2024-03-15", key_gaps: ["County implementation", "Community services"] },
  { id: 3, country_name: "South Africa", region: "Southern Africa", law_status: "Modern Law", implementation_status: "Partial", budget_level: "Medium", priority_level: "⚡", reform_score: 81, reform_tier: "Tier 4", population: 60.1, last_updated: "2024-03-15", key_gaps: ["Equity access", "Workforce distribution"] },
  { id: 4, country_name: "Ghana", region: "West Africa", law_status: "Modern Law", implementation_status: "Minimal", budget_level: "Medium", priority_level: "⚡", reform_score: 68, reform_tier: "Tier 2", population: 32.8, last_updated: "2024-03-15", key_gaps: ["Mental Health Authority", "Workforce training"] },
  { id: 5, country_name: "Rwanda", region: "East Africa", law_status: "Modern Law", implementation_status: "Partial", budget_level: "Medium", priority_level: "⚡", reform_score: 77, reform_tier: "Tier 2", population: 13.3, last_updated: "2024-03-15", key_gaps: ["Scale community services", "Telepsychiatry"] },
  { id: 6, country_name: "DR Congo", region: "Central Africa", law_status: "No Law", implementation_status: "None", budget_level: "Low", priority_level: "🔥", reform_score: 16, reform_tier: "Tier 1", population: 89.6, last_updated: "2024-03-15", key_gaps: ["No legislation", "Humanitarian crisis"] },
  { id: 7, country_name: "Somalia", region: "East Africa", law_status: "No Law", implementation_status: "None", budget_level: "Low", priority_level: "🔥", reform_score: 12, reform_tier: "Tier 1", population: 15.9, last_updated: "2024-03-15", key_gaps: ["Emergency policy", "Humanitarian integration"] },
  { id: 8, country_name: "Mauritius", region: "Island States", law_status: "Modern Law", implementation_status: "Partial", budget_level: "High", priority_level: "🌱", reform_score: 85, reform_tier: "Tier 4", population: 1.3, last_updated: "2024-03-15", key_gaps: ["Innovation scaling", "Specialized services"] },
];

const tierConfig: Record<string, { color: string; bg: string; border: string; text: string; description: string }> = {
  "Tier 1": { color: "bg-red-600", bg: "bg-red-500/10", border: "border-red-500/30", text: "text-red-400", description: "System Failure - No Law / No Implementation" },
  "Tier 2": { color: "bg-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/30", text: "text-orange-400", description: "Law Exists / Minimal Implementation" },
  "Tier 3": { color: "bg-yellow-500", bg: "bg-yellow-500/10", border: "border-yellow-500/30", text: "text-yellow-400", description: "Outdated Laws / Reform Urgent" },
  "Tier 4": { color: "bg-green-600", bg: "bg-green-500/10", border: "border-green-500/30", text: "text-green-400", description: "Moderate Systems / Implementation Gaps" },
  "Tier 5": { color: "bg-cyan-600", bg: "bg-cyan-500/10", border: "border-cyan-500/30", text: "text-cyan-400", description: "Small States / Mixed Systems" },
};

const getPriorityIcon = (priority: string) => {
  switch (priority) {
    case "🔥": return <Flame className="w-4 h-4 text-red-400" />;
    case "⚡": return <Zap className="w-4 h-4 text-yellow-400" />;
    case "🌱": return <Leaf className="w-4 h-4 text-emerald-400" />;
    default: return null;
  }
};

const getLawIcon = (status: string) => {
  if (status === "Modern Law") return <CheckCircle className="w-4 h-4 text-emerald-400" />;
  if (status === "Outdated Law") return <AlertCircle className="w-4 h-4 text-yellow-400" />;
  return <XCircle className="w-4 h-4 text-red-400" />;
};

const getImplIcon = (status: string) => {
  if (status === "Partial") return <CheckCircle className="w-4 h-4 text-yellow-400" />;
  if (status === "Minimal") return <AlertCircle className="w-4 h-4 text-orange-400" />;
  return <XCircle className="w-4 h-4 text-red-400" />;
};

export default function ReformIntelligencePage() {
  const [reforms, setReforms] = useState<ReformCountry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTier, setSelectedTier] = useState<string>("all");
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [expandedTiers, setExpandedTiers] = useState<string[]>(["Tier 1", "Tier 2", "Tier 3", "Tier 4", "Tier 5"]);
  const [selectedCountry, setSelectedCountry] = useState<ReformCountry | null>(null);

  useEffect(() => {
    fetchReforms();
  }, []);

  const fetchReforms = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/reform-intelligence");
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.reforms) {
          setReforms(data.reforms);
        } else {
          setReforms(mockReforms);
        }
      } else {
        setReforms(mockReforms);
      }
    } catch (error) {
      console.error("Error fetching reforms:", error);
      setReforms(mockReforms);
    } finally {
      setLoading(false);
    }
  };

  const filteredReforms = useMemo(() => {
    return reforms.filter(reform => {
      const matchesSearch = reform.country_name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTier = selectedTier === "all" || reform.reform_tier === selectedTier;
      const matchesRegion = selectedRegion === "all" || reform.region === selectedRegion;
      return matchesSearch && matchesTier && matchesRegion;
    });
  }, [reforms, searchTerm, selectedTier, selectedRegion]);

  const groupedReforms = useMemo(() => {
    return filteredReforms.reduce((acc: Record<string, ReformCountry[]>, reform) => {
      if (!acc[reform.reform_tier]) {
        acc[reform.reform_tier] = [];
      }
      acc[reform.reform_tier].push(reform);
      return acc;
    }, {});
  }, [filteredReforms]);

  const stats = {
    total: reforms.length,
    avgScore: Math.round(reforms.reduce((acc, r) => acc + r.reform_score, 0) / reforms.length),
    tier1: reforms.filter(r => r.reform_tier === "Tier 1").length,
    tier2: reforms.filter(r => r.reform_tier === "Tier 2").length,
    tier3: reforms.filter(r => r.reform_tier === "Tier 3").length,
  };

  const toggleTier = (tier: string) => {
    setExpandedTiers(prev =>
      prev.includes(tier) ? prev.filter(t => t !== tier) : [...prev, tier]
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
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
              </div>
              <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Continental Reform Intelligence
              </h1>
              <p className="text-slate-300 text-base md:text-lg mt-3 max-w-2xl">
                Live Pan-African mental health reform observatory tracking implementation progress across 54 nations.
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
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
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
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8">
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
            value={selectedTier}
            onChange={(e) => setSelectedTier(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Tiers</option>
            <option value="Tier 1">Tier 1 - System Failure 🔥</option>
            <option value="Tier 2">Tier 2 - Law/No Impl ⚡</option>
            <option value="Tier 3">Tier 3 - Outdated Laws ⚠️</option>
            <option value="Tier 4">Tier 4 - Moderate Systems</option>
            <option value="Tier 5">Tier 5 - Small States</option>
          </select>

          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Regions</option>
            <option value="East Africa">East Africa</option>
            <option value="West Africa">West Africa</option>
            <option value="Southern Africa">Southern Africa</option>
            <option value="North Africa">North Africa</option>
            <option value="Central Africa">Central Africa</option>
            <option value="Island States">Island States</option>
          </select>
        </div>

        {/* Tier Sections */}
        <div className="space-y-6">
          {Object.entries(groupedReforms)
            .sort(([tierA], [tierB]) => {
              const order = { "Tier 1": 1, "Tier 2": 2, "Tier 3": 3, "Tier 4": 4, "Tier 5": 5 };
              return (order[tierA as keyof typeof order] || 0) - (order[tierB as keyof typeof order] || 0);
            })
            .map(([tier, countries]) => {
              const isExpanded = expandedTiers.includes(tier);
              const config = tierConfig[tier] || tierConfig["Tier 2"];
              const countriesList = countries as ReformCountry[];

              return (
                <div key={tier} className="bg-slate-800/50 rounded-2xl border border-slate-700 overflow-hidden">
                  {/* Tier Header - Clickable to expand/collapse */}
                  <button
                    onClick={() => toggleTier(tier)}
                    className={`w-full ${config.color} text-white p-6 flex justify-between items-center transition-opacity hover:opacity-90`}
                  >
                    <div className="text-left">
                      <h2 className="text-3xl font-bold">{tier}</h2>
                      <p className="text-white/80 text-sm mt-1">{config.description}</p>
                      <p className="text-white/60 text-xs mt-2">{countriesList.length} countries</p>
                    </div>
                    {isExpanded ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
                  </button>

                  {/* Countries Table */}
                  {isExpanded && (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[800px]">
                        <thead className="bg-slate-900/50">
                          <tr>
                            <th className="text-left p-4 text-slate-400 text-sm font-medium">Country</th>
                            <th className="text-left p-4 text-slate-400 text-sm font-medium">Region</th>
                            <th className="text-left p-4 text-slate-400 text-sm font-medium">Law</th>
                            <th className="text-left p-4 text-slate-400 text-sm font-medium">Implementation</th>
                            <th className="text-left p-4 text-slate-400 text-sm font-medium">Budget</th>
                            <th className="text-left p-4 text-slate-400 text-sm font-medium">Priority</th>
                            <th className="text-left p-4 text-slate-400 text-sm font-medium">Score</th>
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
                                  <p className="text-slate-400 text-xs">{country.population}M people</p>
                                </div>
                              </td>
                              <td className="p-4 text-slate-300 text-sm">{country.region}</td>
                              <td className="p-4">
                                <div className="flex items-center gap-2">
                                  {getLawIcon(country.law_status)}
                                  <span className="text-slate-300 text-sm">{country.law_status}</span>
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="flex items-center gap-2">
                                  {getImplIcon(country.implementation_status)}
                                  <span className="text-slate-300 text-sm">{country.implementation_status}</span>
                                </div>
                              </td>
                              <td className="p-4">
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  country.budget_level === "High" ? "bg-emerald-500/20 text-emerald-400" :
                                  country.budget_level === "Medium" ? "bg-yellow-500/20 text-yellow-400" :
                                  "bg-red-500/20 text-red-400"
                                }`}>
                                  {country.budget_level}
                                </span>
                              </td>
                              <td className="p-4">
                                <div className="flex items-center gap-1">
                                  {getPriorityIcon(country.priority_level)}
                                  <span className="text-slate-300 text-sm">
                                    {country.priority_level === "🔥" ? "Crisis" : country.priority_level === "⚡" ? "High" : "Model"}
                                  </span>
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="flex items-center gap-2">
                                  <div className="w-20 bg-slate-700 rounded-full h-1.5">
                                    <div
                                      className={`h-1.5 rounded-full ${country.reform_score >= 70 ? "bg-emerald-500" : country.reform_score >= 50 ? "bg-yellow-500" : "bg-red-500"}`}
                                      style={{ width: `${country.reform_score}%` }}
                                    ></div>
                                  </div>
                                  <span className={`text-sm font-medium ${
                                    country.reform_score >= 70 ? "text-emerald-400" :
                                    country.reform_score >= 50 ? "text-yellow-400" : "text-red-400"
                                  }`}>
                                    {country.reform_score}%
                                  </span>
                                </div>
                              </td> {/* FIXED: Changed from <td> to </td> */}
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
        {filteredReforms.length === 0 && (
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-12 text-center">
            <Globe className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">No reform data found</p>
            <p className="text-slate-500 text-sm mt-2">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Country Detail Modal */}
      {selectedCountry && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setSelectedCountry(null)}>
          <div className="bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-700">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="text-2xl font-bold text-white">{selectedCountry.country_name}</h2>
                    {getPriorityIcon(selectedCountry.priority_level)}
                  </div>
                  <p className="text-slate-400">{selectedCountry.region}</p>
                </div>
                <button onClick={() => setSelectedCountry(null)} className="text-slate-400 hover:text-white text-2xl">&times;</button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-700/30 rounded-lg p-3 text-center">
                  <p className="text-slate-400 text-xs">Reform Score</p>
                  <p className={`text-3xl font-bold ${
                    selectedCountry.reform_score >= 70 ? "text-emerald-400" :
                    selectedCountry.reform_score >= 50 ? "text-yellow-400" : "text-red-400"
                  }`}>
                    {selectedCountry.reform_score}%
                  </p>
                </div>
                <div className="bg-slate-700/30 rounded-lg p-3 text-center">
                  <p className="text-slate-400 text-xs">Population</p>
                  <p className="text-2xl font-bold text-white">{selectedCountry.population}M</p>
                </div>
                <div className="bg-slate-700/30 rounded-lg p-3">
                  <p className="text-slate-400 text-xs">Law Status</p>
                  <div className="flex items-center gap-2 mt-1">
                    {getLawIcon(selectedCountry.law_status)}
                    <span className="text-white">{selectedCountry.law_status}</span>
                  </div>
                </div>
                <div className="bg-slate-700/30 rounded-lg p-3">
                  <p className="text-slate-400 text-xs">Implementation</p>
                  <div className="flex items-center gap-2 mt-1">
                    {getImplIcon(selectedCountry.implementation_status)}
                    <span className="text-white">{selectedCountry.implementation_status}</span>
                  </div>
                </div>
              </div>

              <div className="bg-cyan-600/10 rounded-lg p-4 border border-cyan-500/20">
                <p className="text-cyan-400 text-sm font-semibold mb-2">Reform Tier</p>
                <p className="text-white">{selectedCountry.reform_tier}</p>
                <p className="text-slate-400 text-sm mt-1">{tierConfig[selectedCountry.reform_tier]?.description}</p>
              </div>

              {selectedCountry.key_gaps && selectedCountry.key_gaps.length > 0 && (
                <div className="bg-red-500/10 rounded-lg p-4 border border-red-500/20">
                  <p className="text-red-400 text-sm font-semibold mb-2">Key Implementation Gaps</p>
                  <ul className="space-y-1">
                    {selectedCountry.key_gaps.map((gap, idx) => (
                      <li key={idx} className="text-slate-300 text-sm flex items-center gap-2">
                        <AlertTriangle className="w-3 h-3 text-red-400" />
                        {gap}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="bg-slate-700/30 rounded-lg p-4">
                <p className="text-white text-sm font-semibold mb-2">Strategic Priority</p>
                <div className="flex items-center gap-2">
                  {getPriorityIcon(selectedCountry.priority_level)}
                  <span className="text-slate-300">
                    {selectedCountry.priority_level === "🔥" ? "Immediate Crisis Intervention Required" :
                     selectedCountry.priority_level === "⚡" ? "High Impact Priority - Accelerate Reform" :
                     "Model System - Sustain & Innovate"}
                  </span>
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-slate-700">
                <p className="text-slate-500 text-xs">Last updated: {new Date(selectedCountry.last_updated).toLocaleDateString()}</p>
                <Link href={`/country/${encodeURIComponent(selectedCountry.country_name)}`} className="text-cyan-400 hover:text-cyan-300 text-sm">
                  View Full Profile →
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
