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
} from "lucide-react";

interface Country {
  id: number;
  country_name: string;
  region: string;
  reform_score: number;
  reform_tier: string;
  sdg3_score: number;
  priority_level: "🔥" | "⚡" | "🌱";
  population: number;
  capital: string;
  law_status: string;
  implementation_status: string;
  last_updated: string;
}

// Mock data for demonstration
const mockCountries: Country[] = [
  { id: 1, country_name: "Nigeria", region: "West Africa", reform_score: 62, reform_tier: "Tier 2 - Law Exists / Limited Implementation", sdg3_score: 58, priority_level: "🔥", population: 218.6, capital: "Abuja", law_status: "Modern Law (2013)", implementation_status: "Minimal", last_updated: "2024-03-15" },
  { id: 2, country_name: "Kenya", region: "East Africa", reform_score: 74, reform_tier: "Tier 2 - Law Exists / Limited Implementation", sdg3_score: 72, priority_level: "🔥", population: 53.8, capital: "Nairobi", law_status: "Modern Law (2019)", implementation_status: "Partial", last_updated: "2024-03-15" },
  { id: 3, country_name: "South Africa", region: "Southern Africa", reform_score: 81, reform_tier: "Tier 4 - Moderate Systems", sdg3_score: 78, priority_level: "⚡", population: 60.1, capital: "Pretoria", law_status: "Modern Law (2002)", implementation_status: "Partial", last_updated: "2024-03-15" },
  { id: 4, country_name: "Ghana", region: "West Africa", reform_score: 68, reform_tier: "Tier 2 - Law Exists / Limited Implementation", sdg3_score: 70, priority_level: "⚡", population: 32.8, capital: "Accra", law_status: "Modern Law (2012)", implementation_status: "Minimal", last_updated: "2024-03-15" },
  { id: 5, country_name: "Rwanda", region: "East Africa", reform_score: 77, reform_tier: "Tier 2 - Law Exists / Limited Implementation", sdg3_score: 75, priority_level: "⚡", population: 13.3, capital: "Kigali", law_status: "Modern Law (2018)", implementation_status: "Partial", last_updated: "2024-03-15" },
  { id: 6, country_name: "Egypt", region: "North Africa", reform_score: 70, reform_tier: "Tier 4 - Moderate Systems", sdg3_score: 68, priority_level: "⚡", population: 104.3, capital: "Cairo", law_status: "Modern Law (2009)", implementation_status: "Partial", last_updated: "2024-03-15" },
  { id: 7, country_name: "Morocco", region: "North Africa", reform_score: 72, reform_tier: "Tier 4 - Moderate Systems", sdg3_score: 70, priority_level: "⚡", population: 37.1, capital: "Rabat", law_status: "Modern Law (2011)", implementation_status: "Partial", last_updated: "2024-03-15" },
  { id: 8, country_name: "Ethiopia", region: "East Africa", reform_score: 65, reform_tier: "Tier 2 - Law Exists / Limited Implementation", sdg3_score: 62, priority_level: "🔥", population: 117.9, capital: "Addis Ababa", law_status: "Modern Law (2019)", implementation_status: "Minimal", last_updated: "2024-03-15" },
  { id: 9, country_name: "Tanzania", region: "East Africa", reform_score: 48, reform_tier: "Tier 5 - Mixed Systems", sdg3_score: 50, priority_level: "⚡", population: 61.5, capital: "Dodoma", law_status: "Outdated Law", implementation_status: "Minimal", last_updated: "2024-03-15" },
  { id: 10, country_name: "Uganda", region: "East Africa", reform_score: 68, reform_tier: "Tier 2 - Law Exists / Limited Implementation", sdg3_score: 65, priority_level: "🔥", population: 45.9, capital: "Kampala", law_status: "Modern Law (2014)", implementation_status: "Minimal", last_updated: "2024-03-15" },
  { id: 11, country_name: "Senegal", region: "West Africa", reform_score: 48, reform_tier: "Tier 3 - Outdated Laws", sdg3_score: 52, priority_level: "⚡", population: 16.7, capital: "Dakar", law_status: "Outdated Law", implementation_status: "Minimal", last_updated: "2024-03-15" },
  { id: 12, country_name: "Zambia", region: "Southern Africa", reform_score: 58, reform_tier: "Tier 2 - Law Exists / Limited Implementation", sdg3_score: 56, priority_level: "🔥", population: 18.4, capital: "Lusaka", law_status: "Modern Law (2019)", implementation_status: "Minimal", last_updated: "2024-03-15" },
  { id: 13, country_name: "DR Congo", region: "Central Africa", reform_score: 16, reform_tier: "Tier 1 - System Failure", sdg3_score: 15, priority_level: "🔥", population: 89.6, capital: "Kinshasa", law_status: "No Law", implementation_status: "None", last_updated: "2024-03-15" },
  { id: 14, country_name: "Somalia", region: "East Africa", reform_score: 12, reform_tier: "Tier 1 - System Failure", sdg3_score: 10, priority_level: "🔥", population: 15.9, capital: "Mogadishu", law_status: "No Law", implementation_status: "None", last_updated: "2024-03-15" },
  { id: 15, country_name: "Mauritius", region: "Island States", reform_score: 85, reform_tier: "Tier 4 - Moderate Systems", sdg3_score: 88, priority_level: "🌱", population: 1.3, capital: "Port Louis", law_status: "Modern Law", implementation_status: "Partial", last_updated: "2024-03-15" },
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

const getPriorityText = (priority: string) => {
  switch (priority) {
    case "🔥": return "Crisis Priority";
    case "⚡": return "High Impact Priority";
    case "🌱": return "Model System";
    default: return "";
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
  const [sortBy, setSortBy] = useState<"name" | "score" | "population">("score");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    fetchCountries();
  }, []);

  const fetchCountries = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/heatmap");
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.countries) {
          setCountries(data.countries);
        } else {
          setCountries(mockCountries);
        }
      } else {
        setCountries(mockCountries);
      }
    } catch (error) {
      console.error("Error fetching countries:", error);
      setCountries(mockCountries);
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedCountries = useMemo(() => {
    let filtered = countries.filter(country => {
      const matchesSearch = country.country_name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRegion = selectedRegion === "all" || country.region === selectedRegion;
      return matchesSearch && matchesRegion;
    });

    filtered.sort((a, b) => {
      if (sortBy === "name") return a.country_name.localeCompare(b.country_name);
      if (sortBy === "score") return b.reform_score - a.reform_score;
      if (sortBy === "population") return b.population - a.population;
      return 0;
    });

    return filtered;
  }, [countries, searchTerm, selectedRegion, sortBy]);

  const stats = {
    total: countries.length,
    avgScore: Math.round(countries.reduce((acc, c) => acc + c.reform_score, 0) / countries.length),
    crisisCountries: countries.filter(c => c.reform_score < 30).length,
    highPerformers: countries.filter(c => c.reform_score >= 70).length,
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
                  <span className="text-slate-400 text-xs">54 African Nations</span>
                </div>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                African Countries
              </h1>
              <p className="text-slate-300 text-base md:text-lg mt-3 max-w-2xl">
                Continental mental health reform intelligence overview with comprehensive country profiles.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={fetchCountries}
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
            onChange={(e) => setSortBy(e.target.value as "name" | "score" | "population")}
            className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="score">Sort by Score</option>
            <option value="name">Sort by Name</option>
            <option value="population">Sort by Population</option>
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
        {viewMode === "grid" ? (
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
                        {country.region}
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
                      <div className={`w-24 h-24 rounded-full ${getScoreBgColor(country.reform_score)} flex items-center justify-center mx-auto`}>
                        <span className={`text-3xl font-bold ${getScoreColor(country.reform_score)}`}>
                          {country.reform_score}
                        </span>
                      </div>
                      <p className="text-slate-400 text-sm mt-2">Reform Score</p>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">SDG 3.4 Alignment</span>
                      <span className={`font-medium ${getScoreColor(country.sdg3_score)}`}>{country.sdg3_score}%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-1.5">
                      <div className={`h-1.5 rounded-full ${country.sdg3_score >= 70 ? "bg-emerald-500" : country.sdg3_score >= 50 ? "bg-yellow-500" : "bg-red-500"}`} style={{ width: `${country.sdg3_score}%` }}></div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Population</span>
                      <span className="text-white">{country.population}M</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Law Status</span>
                      <span className="text-white text-xs">{country.law_status}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <Link
                    href={`/country/${encodeURIComponent(country.country_name)}`}
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
                    <th className="text-left p-4 text-slate-400 text-sm font-medium">Region</th>
                    <th className="text-left p-4 text-slate-400 text-sm font-medium">Reform Score</th>
                    <th className="text-left p-4 text-slate-400 text-sm font-medium">SDG 3.4</th>
                    <th className="text-left p-4 text-slate-400 text-sm font-medium">Priority</th>
                    <th className="text-left p-4 text-slate-400 text-sm font-medium">Population</th>
                    <th className="text-left p-4 text-slate-400 text-sm font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedCountries.map((country) => (
                    <tr key={country.id} className="border-t border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                      <td className="p-4">
                        <div>
                          <p className="text-white font-medium">{country.country_name}</p>
                          <p className="text-slate-400 text-xs">{country.capital}</p>
                        </div>
                      </td>
                      <td className="p-4 text-slate-300 text-sm">{country.region}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-slate-700 rounded-full h-1.5">
                            <div className={`h-1.5 rounded-full ${getScoreBgColor(country.reform_score).replace('bg-', 'bg-').replace('/20', '')}`} style={{ width: `${country.reform_score}%` }}></div>
                          </div>
                          <span className={`text-sm font-medium ${getScoreColor(country.reform_score)}`}>{country.reform_score}%</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`text-sm font-medium ${getScoreColor(country.sdg3_score)}`}>{country.sdg3_score}%</span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          {getPriorityIcon(country.priority_level)}
                          <span className="text-slate-300 text-sm">{getPriorityText(country.priority_level)}</span>
                        </div>
                      </td>
                      <td className="p-4 text-slate-300 text-sm">{country.population}M</td>
                      <td className="p-4">
                        <Link
                          href={`/country/${encodeURIComponent(country.country_name)}`}
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
        )}

        {/* Empty State */}
        {filteredAndSortedCountries.length === 0 && (
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-12 text-center">
            <Globe className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">No countries found</p>
            <p className="text-slate-500 text-sm mt-2">Try adjusting your search or filters</p>
          </div>
        )}

        {/* Footer Insights */}
        <div className="mt-8 bg-gradient-to-r from-cyan-600/10 to-blue-600/10 rounded-2xl border border-cyan-500/20 p-6">
          <div className="flex items-start gap-4">
            <BarChart3 className="w-8 h-8 text-cyan-400 flex-shrink-0" />
            <div>
              <h3 className="text-white font-semibold text-lg mb-2">Continental Insights</h3>
              <p className="text-slate-300">
                {stats.crisisCountries} countries are in crisis tier requiring immediate intervention.
                {stats.highPerformers} countries demonstrate strong reform progress.
                The continental average reform score is {stats.avgScore}%.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}