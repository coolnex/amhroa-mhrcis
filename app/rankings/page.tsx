"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Trophy,
  Medal,
  TrendingUp,
  TrendingDown,
  Award,
  Target,
  MapPin,
  Search,
  Filter,
  Download,
  RefreshCw,
  Crown,
  Star,
  ArrowLeft,
  Flame,
  Zap,
  Leaf,
  ChevronUp,
  ChevronDown,
  Eye,
  BarChart3,
  Globe,
  Users,
  Calendar,
} from "lucide-react";

interface CountryRanking {
  id: number;
  country_name: string;
  region: string;
  reform_score: number;
  reform_tier: string;
  implementation_status: string;
  priority_level: "🔥" | "⚡" | "🌱";
  previous_rank: number;
  trend: "up" | "down" | "same";
  sdg_score: number;
  workforce_score: number;
  financing_score: number;
  last_updated: string;
}

// Mock data for demonstration
const mockRankings: CountryRanking[] = [
  { id: 1, country_name: "Mauritius", region: "Island States", reform_score: 85, reform_tier: "Tier 4 - Moderate Systems", implementation_status: "Partial", priority_level: "🌱", previous_rank: 1, trend: "same", sdg_score: 88, workforce_score: 75, financing_score: 82, last_updated: "2024-03-15" },
  { id: 2, country_name: "South Africa", region: "Southern Africa", reform_score: 81, reform_tier: "Tier 4 - Moderate Systems", implementation_status: "Partial", priority_level: "⚡", previous_rank: 2, trend: "same", sdg_score: 78, workforce_score: 75, financing_score: 70, last_updated: "2024-03-15" },
  { id: 3, country_name: "Seychelles", region: "Island States", reform_score: 82, reform_tier: "Tier 5 - Small States", implementation_status: "Partial", priority_level: "🌱", previous_rank: 4, trend: "up", sdg_score: 85, workforce_score: 70, financing_score: 80, last_updated: "2024-03-15" },
  { id: 4, country_name: "Rwanda", region: "East Africa", reform_score: 77, reform_tier: "Tier 2 - Law Exists / Limited Implementation", implementation_status: "Partial", priority_level: "⚡", previous_rank: 5, trend: "up", sdg_score: 75, workforce_score: 70, financing_score: 68, last_updated: "2024-03-15" },
  { id: 5, country_name: "Kenya", region: "East Africa", reform_score: 74, reform_tier: "Tier 2 - Law Exists / Limited Implementation", implementation_status: "Partial", priority_level: "🔥", previous_rank: 6, trend: "up", sdg_score: 72, workforce_score: 65, financing_score: 60, last_updated: "2024-03-15" },
  { id: 6, country_name: "Botswana", region: "Southern Africa", reform_score: 75, reform_tier: "Tier 4 - Moderate Systems", implementation_status: "Partial", priority_level: "⚡", previous_rank: 3, trend: "down", sdg_score: 73, workforce_score: 68, financing_score: 65, last_updated: "2024-03-15" },
  { id: 7, country_name: "Namibia", region: "Southern Africa", reform_score: 73, reform_tier: "Tier 4 - Moderate Systems", implementation_status: "Partial", priority_level: "⚡", previous_rank: 7, trend: "same", sdg_score: 70, workforce_score: 65, financing_score: 62, last_updated: "2024-03-15" },
  { id: 8, country_name: "Morocco", region: "North Africa", reform_score: 72, reform_tier: "Tier 4 - Moderate Systems", implementation_status: "Partial", priority_level: "⚡", previous_rank: 8, trend: "same", sdg_score: 70, workforce_score: 65, financing_score: 68, last_updated: "2024-03-15" },
  { id: 9, country_name: "Egypt", region: "North Africa", reform_score: 70, reform_tier: "Tier 4 - Moderate Systems", implementation_status: "Partial", priority_level: "⚡", previous_rank: 9, trend: "same", sdg_score: 68, workforce_score: 62, financing_score: 65, last_updated: "2024-03-15" },
  { id: 10, country_name: "Cabo Verde", region: "West Africa", reform_score: 70, reform_tier: "Tier 4 - Moderate Systems", implementation_status: "Partial", priority_level: "⚡", previous_rank: 10, trend: "same", sdg_score: 68, workforce_score: 60, financing_score: 64, last_updated: "2024-03-15" },
  { id: 11, country_name: "Ghana", region: "West Africa", reform_score: 68, reform_tier: "Tier 2 - Law Exists / Limited Implementation", implementation_status: "Minimal", priority_level: "⚡", previous_rank: 11, trend: "same", sdg_score: 70, workforce_score: 58, financing_score: 55, last_updated: "2024-03-15" },
  { id: 12, country_name: "Tunisia", region: "North Africa", reform_score: 68, reform_tier: "Tier 4 - Moderate Systems", implementation_status: "Partial", priority_level: "⚡", previous_rank: 12, trend: "same", sdg_score: 65, workforce_score: 60, financing_score: 62, last_updated: "2024-03-15" },
  { id: 13, country_name: "Uganda", region: "East Africa", reform_score: 68, reform_tier: "Tier 2 - Law Exists / Limited Implementation", implementation_status: "Minimal", priority_level: "🔥", previous_rank: 13, trend: "same", sdg_score: 65, workforce_score: 58, financing_score: 52, last_updated: "2024-03-15" },
  { id: 14, country_name: "Nigeria", region: "West Africa", reform_score: 62, reform_tier: "Tier 2 - Law Exists / Limited Implementation", implementation_status: "Minimal", priority_level: "🔥", previous_rank: 14, trend: "same", sdg_score: 58, workforce_score: 45, financing_score: 40, last_updated: "2024-03-15" },
  { id: 15, country_name: "Ethiopia", region: "East Africa", reform_score: 65, reform_tier: "Tier 2 - Law Exists / Limited Implementation", implementation_status: "Minimal", priority_level: "🔥", previous_rank: 15, trend: "same", sdg_score: 62, workforce_score: 55, financing_score: 50, last_updated: "2024-03-15" },
  { id: 16, country_name: "Zambia", region: "Southern Africa", reform_score: 58, reform_tier: "Tier 2 - Law Exists / Limited Implementation", implementation_status: "Minimal", priority_level: "🔥", previous_rank: 16, trend: "same", sdg_score: 56, workforce_score: 48, financing_score: 44, last_updated: "2024-03-15" },
  { id: 17, country_name: "Zimbabwe", region: "Southern Africa", reform_score: 55, reform_tier: "Tier 2 - Law Exists / Limited Implementation", implementation_status: "Minimal", priority_level: "🔥", previous_rank: 18, trend: "up", sdg_score: 52, workforce_score: 46, financing_score: 42, last_updated: "2024-03-15" },
  { id: 18, country_name: "Malawi", region: "Southern Africa", reform_score: 52, reform_tier: "Tier 2 - Law Exists / Limited Implementation", implementation_status: "Minimal", priority_level: "🔥", previous_rank: 17, trend: "down", sdg_score: 50, workforce_score: 44, financing_score: 40, last_updated: "2024-03-15" },
  { id: 19, country_name: "DR Congo", region: "Central Africa", reform_score: 16, reform_tier: "Tier 1 - System Failure", implementation_status: "None", priority_level: "🔥", previous_rank: 19, trend: "same", sdg_score: 15, workforce_score: 10, financing_score: 5, last_updated: "2024-03-15" },
  { id: 20, country_name: "Somalia", region: "East Africa", reform_score: 12, reform_tier: "Tier 1 - System Failure", implementation_status: "None", priority_level: "🔥", previous_rank: 20, trend: "same", sdg_score: 10, workforce_score: 8, financing_score: 3, last_updated: "2024-03-15" },
];

const regions = ["all", "West Africa", "East Africa", "Southern Africa", "North Africa", "Central Africa", "Island States"];

const getPriorityIcon = (priority: string) => {
  switch (priority) {
    case "🔥": return <Flame className="w-4 h-4 text-red-400" />;
    case "⚡": return <Zap className="w-4 h-4 text-yellow-400" />;
    case "🌱": return <Leaf className="w-4 h-4 text-emerald-400" />;
    default: return null;
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

const getTrendIcon = (trend: string) => {
  if (trend === "up") return <ChevronUp className="w-4 h-4 text-emerald-400" />;
  if (trend === "down") return <ChevronDown className="w-4 h-4 text-red-400" />;
  return <div className="w-4 h-4"></div>;
};

export default function RankingsPage() {
  const [rankings, setRankings] = useState<CountryRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [sortBy, setSortBy] = useState<"rank" | "score" | "sdg">("rank");
  const [selectedCountry, setSelectedCountry] = useState<CountryRanking | null>(null);

  useEffect(() => {
    fetchRankings();
  }, []);

  const fetchRankings = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/rankings");
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.rankings) {
          setRankings(data.rankings);
        } else {
          setRankings(mockRankings);
        }
      } else {
        setRankings(mockRankings);
      }
    } catch (error) {
      console.error("Error fetching rankings:", error);
      setRankings(mockRankings);
    } finally {
      setLoading(false);
    }
  };

  const filteredRankings = rankings
    .filter(country => {
      const matchesSearch = country.country_name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRegion = selectedRegion === "all" || country.region === selectedRegion;
      return matchesSearch && matchesRegion;
    })
    .sort((a, b) => {
      if (sortBy === "rank") return a.reform_score > b.reform_score ? -1 : 1;
      if (sortBy === "score") return b.reform_score - a.reform_score;
      if (sortBy === "sdg") return b.sdg_score - a.sdg_score;
      return 0;
    });

  const topThree = filteredRankings.slice(0, 3);
  const remainingRankings = filteredRankings.slice(3);

  const stats = {
    total: rankings.length,
    averageScore: Math.round(rankings.reduce((acc, c) => acc + c.reform_score, 0) / rankings.length),
    topPerformer: rankings[0]?.country_name || "N/A",
    topScore: rankings[0]?.reform_score || 0,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-300">Loading continental rankings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
      {/* Header */}
      <div className="px-4 md:px-8 pt-4">
        <Link 
          href="/countries" 
          className="inline-flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Countries
        </Link>
      </div>
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-cyan-950 to-slate-900 border-b border-cyan-500/20">
        <div className="relative px-6 md:px-8 py-8 md:py-10">
          <div className="flex justify-between items-start flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="px-3 py-1 bg-cyan-500/20 rounded-full border border-cyan-500/30">
                  <span className="text-cyan-300 text-xs font-mono tracking-wider">
                    CONTINENTAL SCORECARD
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Trophy className="w-4 h-4 text-yellow-400" />
                  <span className="text-slate-400 text-xs">54 Nations Ranked</span>
                </div>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Continental Rankings & Score Card
              </h1>
              <p className="text-slate-300 text-base md:text-lg mt-3 max-w-2xl">
                Pan-African reform benchmarking and implementation intelligence system.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={fetchRankings}
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <p className="text-slate-400 text-xs">Total Countries</p>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </div>
          <div className="bg-cyan-500/10 rounded-xl p-4 border border-cyan-500/20">
            <p className="text-cyan-400 text-xs">Continental Average</p>
            <p className="text-2xl font-bold text-cyan-400">{stats.averageScore}%</p>
          </div>
          <div className="bg-yellow-500/10 rounded-xl p-4 border border-yellow-500/20">
            <p className="text-yellow-400 text-xs">Top Performer</p>
            <p className="text-lg font-bold text-yellow-400 truncate">{stats.topPerformer}</p>
          </div>
          <div className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/20">
            <p className="text-emerald-400 text-xs">Top Score</p>
            <p className="text-2xl font-bold text-emerald-400">{stats.topScore}%</p>
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
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
          >
            {regions.map(region => (
              <option key={region} value={region}>
                {region === "all" ? "All Regions" : region}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "rank" | "score" | "sdg")}
            className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="rank">Sort by Rank</option>
            <option value="score">Sort by Score</option>
            <option value="sdg">Sort by SDG Score</option>
          </select>
        </div>

        {/* Top 3 Podium */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {topThree.map((country, index) => {
            const medalColors = [
              "from-yellow-500 to-amber-600",
              "from-slate-400 to-gray-500",
              "from-amber-600 to-orange-700",
            ];
            const medals = ["🥇", "🥈", "🥉"];
            
            return (
              <div
                key={country.id}
                className={`bg-gradient-to-br ${medalColors[index]} rounded-2xl p-6 text-center transform hover:scale-105 transition-all cursor-pointer shadow-xl`}
                onClick={() => setSelectedCountry(country)}
              >
                <div className="text-6xl mb-3">{medals[index]}</div>
                <h2 className="text-2xl font-bold text-white">{country.country_name}</h2>
                <p className="text-white/80 text-sm mt-1">{country.region}</p>
                <p className="text-white/70 text-sm mt-3">Reform Score</p>
                <p className="text-5xl font-bold text-white mt-2">{country.reform_score}%</p>
                <div className="mt-3 flex items-center justify-center gap-2">
                  {getPriorityIcon(country.priority_level)}
                  <span className="text-white/80 text-xs">{country.implementation_status}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Full Rankings Table */}
        <div className="bg-slate-800/50 rounded-2xl border border-slate-700 overflow-hidden">
          <div className="p-4 border-b border-slate-700 bg-slate-800/80">
            <h2 className="text-white font-semibold flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              Continental Performance Rankings
              <span className="text-slate-400 text-sm font-normal ml-2">({remainingRankings.length + 3} countries)</span>
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-slate-900/50">
                <tr>
                  <th className="text-left p-4 text-slate-400 text-sm font-medium">Rank</th>
                  <th className="text-left p-4 text-slate-400 text-sm font-medium">Country</th>
                  <th className="text-left p-4 text-slate-400 text-sm font-medium">Region</th>
                  <th className="text-left p-4 text-slate-400 text-sm font-medium">Tier</th>
                  <th className="text-left p-4 text-slate-400 text-sm font-medium">Reform Score</th>
                  <th className="text-left p-4 text-slate-400 text-sm font-medium">SDG Score</th>
                  <th className="text-left p-4 text-slate-400 text-sm font-medium">Implementation</th>
                  <th className="text-left p-4 text-slate-400 text-sm font-medium">Trend</th>
                </tr>
              </thead>
              <tbody>
                {remainingRankings.map((country, idx) => {
                  const rank = idx + 4;
                  return (
                    <tr
                      key={country.id}
                      className="border-t border-slate-700/50 hover:bg-slate-700/30 transition-colors cursor-pointer"
                      onClick={() => setSelectedCountry(country)}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-bold">#{rank}</span>
                          {rank === 4 && <Crown className="w-4 h-4 text-slate-400" />}
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="text-white font-medium">{country.country_name}</p>
                          <div className="flex items-center gap-1 mt-1">
                            {getPriorityIcon(country.priority_level)}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-slate-300 text-sm">{country.region}</td>
                      <td className="p-4">
                        <span className="text-slate-300 text-xs">{country.reform_tier}</span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-slate-700 rounded-full h-1.5">
                            <div
                              className={`h-1.5 rounded-full ${getScoreColor(country.reform_score)}`}
                              style={{ width: `${country.reform_score}%` }}
                            ></div>
                          </div>
                          <span className={`text-sm font-medium ${getScoreColor(country.reform_score)}`}>
                            {country.reform_score}%
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-slate-700 rounded-full h-1.5">
                            <div
                              className="bg-purple-500 h-1.5 rounded-full"
                              style={{ width: `${country.sdg_score}%` }}
                            ></div>
                          </div>
                          <span className="text-purple-400 text-sm">{country.sdg_score}%</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-slate-300 text-sm">{country.implementation_status}</span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          {getTrendIcon(country.trend)}
                          <span className="text-slate-400 text-xs">
                            {country.trend === "up" ? "↑" : country.trend === "down" ? "↓" : "—"}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Empty State */}
        {filteredRankings.length === 0 && (
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-12 text-center">
            <Globe className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">No ranking data found</p>
            <p className="text-slate-500 text-sm mt-2">Try adjusting your filters</p>
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
                  <h2 className="text-2xl font-bold text-white">{selectedCountry.country_name}</h2>
                  <p className="text-slate-400">{selectedCountry.region}</p>
                </div>
                <button onClick={() => setSelectedCountry(null)} className="text-slate-400 hover:text-white text-2xl">&times;</button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-700/30 rounded-lg p-3 text-center">
                  <p className="text-slate-400 text-xs">Reform Score</p>
                  <p className={`text-3xl font-bold ${getScoreColor(selectedCountry.reform_score)}`}>
                    {selectedCountry.reform_score}%
                  </p>
                </div>
                <div className="bg-slate-700/30 rounded-lg p-3 text-center">
                  <p className="text-slate-400 text-xs">SDG 3.4 Score</p>
                  <p className="text-3xl font-bold text-purple-400">{selectedCountry.sdg_score}%</p>
                </div>
                <div className="bg-slate-700/30 rounded-lg p-3 text-center">
                  <p className="text-slate-400 text-xs">Workforce</p>
                  <p className="text-3xl font-bold text-cyan-400">{selectedCountry.workforce_score}%</p>
                </div>
                <div className="bg-slate-700/30 rounded-lg p-3 text-center">
                  <p className="text-slate-400 text-xs">Financing</p>
                  <p className="text-3xl font-bold text-emerald-400">{selectedCountry.financing_score}%</p>
                </div>
              </div>

              <div className="bg-slate-700/30 rounded-lg p-4">
                <p className="text-white text-sm font-semibold mb-2">Reform Tier</p>
                <p className="text-slate-300 text-sm">{selectedCountry.reform_tier}</p>
              </div>

              <div className="bg-slate-700/30 rounded-lg p-4">
                <p className="text-white text-sm font-semibold mb-2">Implementation Status</p>
                <p className="text-slate-300 text-sm">{selectedCountry.implementation_status}</p>
              </div>

              <div className="flex justify-between pt-4 border-t border-slate-700">
                <div>
                  <p className="text-slate-500 text-xs">Last Updated</p>
                  <p className="text-white text-sm">{new Date(selectedCountry.last_updated).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  {getPriorityIcon(selectedCountry.priority_level)}
                  <span className="text-slate-300">
                    {selectedCountry.priority_level === "🔥" ? "Crisis Priority" :
                     selectedCountry.priority_level === "⚡" ? "High Impact Priority" : "Model System"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}