"use client";

import { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  Cell,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Equal,
  Scale,
  Target,
  Users,
  TrendingUp as FinanceIcon,
  Globe,
  Award,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ArrowRight,
  Download,
  Share2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Star,
  MapPin,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Brain,
} from "lucide-react";

// Complete country data
const countriesData = [
  { id: 1, name: "Nigeria", region: "West Africa", reform_score: 62, sdg_score: 58, workforce_score: 45, financing_score: 40, implementation_score: 45, law_score: 70, population: 218.6, rank: 32 },
  { id: 2, name: "Kenya", region: "East Africa", reform_score: 74, sdg_score: 72, workforce_score: 65, financing_score: 60, implementation_score: 60, law_score: 85, population: 53.8, rank: 18 },
  { id: 3, name: "Ghana", region: "West Africa", reform_score: 68, sdg_score: 70, workforce_score: 58, financing_score: 55, implementation_score: 55, law_score: 80, population: 32.8, rank: 24 },
  { id: 4, name: "South Africa", region: "Southern Africa", reform_score: 81, sdg_score: 78, workforce_score: 75, financing_score: 70, implementation_score: 75, law_score: 90, population: 60.1, rank: 5 },
  { id: 5, name: "Rwanda", region: "East Africa", reform_score: 77, sdg_score: 75, workforce_score: 70, financing_score: 68, implementation_score: 65, law_score: 88, population: 13.3, rank: 12 },
  { id: 6, name: "Egypt", region: "North Africa", reform_score: 70, sdg_score: 68, workforce_score: 62, financing_score: 65, implementation_score: 62, law_score: 75, population: 104.3, rank: 22 },
  { id: 7, name: "Morocco", region: "North Africa", reform_score: 72, sdg_score: 70, workforce_score: 65, financing_score: 68, implementation_score: 64, law_score: 78, population: 37.1, rank: 20 },
  { id: 8, name: "Ethiopia", region: "East Africa", reform_score: 65, sdg_score: 62, workforce_score: 55, financing_score: 50, implementation_score: 52, law_score: 72, population: 117.9, rank: 28 },
  { id: 9, name: "Tanzania", region: "East Africa", reform_score: 48, sdg_score: 50, workforce_score: 40, financing_score: 35, implementation_score: 40, law_score: 55, population: 61.5, rank: 42 },
  { id: 10, name: "Uganda", region: "East Africa", reform_score: 68, sdg_score: 65, workforce_score: 58, financing_score: 52, implementation_score: 52, law_score: 78, population: 45.9, rank: 25 },
  { id: 11, name: "Senegal", region: "West Africa", reform_score: 48, sdg_score: 52, workforce_score: 42, financing_score: 38, implementation_score: 42, law_score: 60, population: 16.7, rank: 43 },
  { id: 12, name: "Zambia", region: "Southern Africa", reform_score: 58, sdg_score: 56, workforce_score: 48, financing_score: 44, implementation_score: 48, law_score: 68, population: 18.4, rank: 36 },
];

const getScoreColor = (score: number) => {
  if (score >= 80) return "text-emerald-400";
  if (score >= 70) return "text-cyan-400";
  if (score >= 60) return "text-blue-400";
  if (score >= 50) return "text-yellow-400";
  if (score >= 40) return "text-orange-400";
  return "text-red-400";
};

const getScoreBgColor = (score: number) => {
  if (score >= 80) return "bg-emerald-500/20 border-emerald-500/30";
  if (score >= 70) return "bg-cyan-500/20 border-cyan-500/30";
  if (score >= 60) return "bg-blue-500/20 border-blue-500/30";
  if (score >= 50) return "bg-yellow-500/20 border-yellow-500/30";
  if (score >= 40) return "bg-orange-500/20 border-orange-500/30";
  return "bg-red-500/20 border-red-500/30";
};

const getTrendIcon = (score1: number, score2: number) => {
  if (score1 > score2) return <TrendingUp className="w-4 h-4 text-emerald-400" />;
  if (score1 < score2) return <TrendingDown className="w-4 h-4 text-red-400" />;
  return <Equal className="w-4 h-4 text-slate-400" />;
};

export default function ComparePage() {
  const [country1, setCountry1] = useState(countriesData[0]);
  const [country2, setCountry2] = useState(countriesData[1]);
  const [viewMode, setViewMode] = useState<"cards" | "detailed">("detailed");
  const [selectedMetric, setSelectedMetric] = useState<string>("all");

  const radarData = useMemo(() => {
    const metrics = [
      { metric: "Reform Score", key: "reform_score" },
      { metric: "SDG Alignment", key: "sdg_score" },
      { metric: "Workforce", key: "workforce_score" },
      { metric: "Financing", key: "financing_score" },
      { metric: "Implementation", key: "implementation_score" },
      { metric: "Legal Framework", key: "law_score" },
    ];

    return metrics.map(m => ({
      metric: m.metric,
      country1: country1[m.key as keyof typeof country1] as number,
      country2: country2[m.key as keyof typeof country2] as number,
      fullMark: 100,
    }));
  }, [country1, country2]);

  const comparisonData = useMemo(() => {
    const metrics = [
      { name: "Reform Score", key: "reform_score", icon: Award },
      { name: "SDG Alignment", key: "sdg_score", icon: Target },
      { name: "Workforce Capacity", key: "workforce_score", icon: Users },
      { name: "Financing", key: "financing_score", icon: FinanceIcon },
      { name: "Implementation", key: "implementation_score", icon: Activity },
      { name: "Legal Framework", key: "law_score", icon: Scale },
    ];

    return metrics.map(m => ({
      ...m,
      country1Value: country1[m.key as keyof typeof country1] as number,
      country2Value: country2[m.key as keyof typeof country2] as number,
      difference: (country1[m.key as keyof typeof country1] as number) - (country2[m.key as keyof typeof country2] as number),
    }));
  }, [country1, country2]);

  const overallWinner = country1.reform_score > country2.reform_score ? country1.name : country2.name;
  const scoreDifference = Math.abs(country1.reform_score - country2.reform_score);

  const getWinnerText = () => {
    if (country1.reform_score > country2.reform_score) {
      return `${country1.name} leads by ${scoreDifference} points`;
    } else if (country2.reform_score > country1.reform_score) {
      return `${country2.name} leads by ${scoreDifference} points`;
    }
    return "Countries are tied";
  };

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
                    COMPARATIVE INTELLIGENCE
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Scale className="w-4 h-4 text-cyan-400" />
                  <span className="text-slate-400 text-xs">Multi-Dimensional Analysis</span>
                </div>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Continental Comparative Intelligence
              </h1>
              <p className="text-slate-300 text-base md:text-lg mt-3 max-w-2xl">
                Compare reforms, governance indicators, and policy intelligence across African nations.
              </p>
            </div>

            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-600 transition-colors">
                <Download className="w-4 h-4" />
                <span className="text-sm hidden sm:inline">Export Comparison</span>
              </button>
              <button className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-600 transition-colors">
                <Share2 className="w-4 h-4" />
                <span className="text-sm hidden sm:inline">Share</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-8 py-6">
        {/* Country Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Country 1 Selector */}
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-4">
            <label className="text-slate-400 text-sm mb-2 block flex items-center gap-2">
              <MapPin className="w-4 h-4 text-cyan-400" />
              Select First Country
            </label>
            <div className="relative">
              <select
                value={country1.id}
                onChange={(e) => {
                  const selected = countriesData.find(c => c.id === Number(e.target.value));
                  if (selected) setCountry1(selected);
                }}
                className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 appearance-none cursor-pointer"
              >
                {countriesData.map((country) => (
                  <option key={country.id} value={country.id}>
                    {country.name} - {country.region} (Score: {country.reform_score})
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          </div>

          {/* Country 2 Selector */}
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-4">
            <label className="text-slate-400 text-sm mb-2 block flex items-center gap-2">
              <MapPin className="w-4 h-4 text-purple-400" />
              Select Second Country
            </label>
            <div className="relative">
              <select
                value={country2.id}
                onChange={(e) => {
                  const selected = countriesData.find(c => c.id === Number(e.target.value));
                  if (selected) setCountry2(selected);
                }}
                className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 appearance-none cursor-pointer"
              >
                {countriesData.map((country) => (
                  <option key={country.id} value={country.id}>
                    {country.name} - {country.region} (Score: {country.reform_score})
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-2 bg-slate-800 rounded-xl p-1">
            <button
              onClick={() => setViewMode("cards")}
              className={`px-4 py-2 rounded-lg text-sm transition-all ${viewMode === "cards" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-white"}`}
            >
              Card View
            </button>
            <button
              onClick={() => setViewMode("detailed")}
              className={`px-4 py-2 rounded-lg text-sm transition-all ${viewMode === "detailed" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-white"}`}
            >
              Detailed Analysis
            </button>
          </div>

          <div className="text-slate-400 text-sm">
            {getWinnerText()}
          </div>
        </div>

        {/* Card View */}
        {viewMode === "cards" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Country 1 Card */}
            <div className={`rounded-2xl border p-6 ${getScoreBgColor(country1.reform_score)}`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-3xl font-bold text-white">{country1.name}</h2>
                  <p className="text-slate-400 text-sm">{country1.region}</p>
                </div>
                <div className="text-center">
                  <p className="text-slate-400 text-xs">Overall Rank</p>
                  <p className="text-2xl font-bold text-white">#{country1.rank}</p>
                </div>
              </div>

              <div className="text-center mb-6">
                <div className="inline-block">
                  <div className="relative w-32 h-32 mx-auto">
                    <div className="w-32 h-32 rounded-full border-4 border-slate-700 flex items-center justify-center">
                      <div>
                        <p className="text-4xl font-bold text-white">{country1.reform_score}</p>
                        <p className="text-slate-400 text-sm">/100</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-cyan-400 text-sm mt-2">Reform Score</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm">SDG Alignment</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-slate-700 rounded-full h-1.5">
                      <div className="bg-cyan-500 h-1.5 rounded-full" style={{ width: `${country1.sdg_score}%` }}></div>
                    </div>
                    <span className={`text-sm font-medium ${getScoreColor(country1.sdg_score)}`}>{country1.sdg_score}%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm">Workforce</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-slate-700 rounded-full h-1.5">
                      <div className="bg-cyan-500 h-1.5 rounded-full" style={{ width: `${country1.workforce_score}%` }}></div>
                    </div>
                    <span className={`text-sm font-medium ${getScoreColor(country1.workforce_score)}`}>{country1.workforce_score}%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm">Financing</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-slate-700 rounded-full h-1.5">
                      <div className="bg-cyan-500 h-1.5 rounded-full" style={{ width: `${country1.financing_score}%` }}></div>
                    </div>
                    <span className={`text-sm font-medium ${getScoreColor(country1.financing_score)}`}>{country1.financing_score}%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm">Implementation</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-slate-700 rounded-full h-1.5">
                      <div className="bg-cyan-500 h-1.5 rounded-full" style={{ width: `${country1.implementation_score}%` }}></div>
                    </div>
                    <span className={`text-sm font-medium ${getScoreColor(country1.implementation_score)}`}>{country1.implementation_score}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Country 2 Card */}
            <div className={`rounded-2xl border p-6 ${getScoreBgColor(country2.reform_score)}`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-3xl font-bold text-white">{country2.name}</h2>
                  <p className="text-slate-400 text-sm">{country2.region}</p>
                </div>
                <div className="text-center">
                  <p className="text-slate-400 text-xs">Overall Rank</p>
                  <p className="text-2xl font-bold text-white">#{country2.rank}</p>
                </div>
              </div>

              <div className="text-center mb-6">
                <div className="inline-block">
                  <div className="relative w-32 h-32 mx-auto">
                    <div className="w-32 h-32 rounded-full border-4 border-slate-700 flex items-center justify-center">
                      <div>
                        <p className="text-4xl font-bold text-white">{country2.reform_score}</p>
                        <p className="text-slate-400 text-sm">/100</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-purple-400 text-sm mt-2">Reform Score</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm">SDG Alignment</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-slate-700 rounded-full h-1.5">
                      <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: `${country2.sdg_score}%` }}></div>
                    </div>
                    <span className={`text-sm font-medium ${getScoreColor(country2.sdg_score)}`}>{country2.sdg_score}%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm">Workforce</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-slate-700 rounded-full h-1.5">
                      <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: `${country2.workforce_score}%` }}></div>
                    </div>
                    <span className={`text-sm font-medium ${getScoreColor(country2.workforce_score)}`}>{country2.workforce_score}%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm">Financing</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-slate-700 rounded-full h-1.5">
                      <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: `${country2.financing_score}%` }}></div>
                    </div>
                    <span className={`text-sm font-medium ${getScoreColor(country2.financing_score)}`}>{country2.financing_score}%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm">Implementation</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-slate-700 rounded-full h-1.5">
                      <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: `${country2.implementation_score}%` }}></div>
                    </div>
                    <span className={`text-sm font-medium ${getScoreColor(country2.implementation_score)}`}>{country2.implementation_score}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Detailed Analysis View */}
        {viewMode === "detailed" && (
          <div className="space-y-6">
            {/* Radar Chart */}
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
              <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-cyan-400" />
                Multi-Dimensional Comparison Radar
              </h3>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#334155" />
                    <PolarAngleAxis dataKey="metric" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94a3b8' }} />
                    <Radar name={country1.name} dataKey="country1" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.2} />
                    <Radar name={country2.name} dataKey="country2" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} />
                    <Legend />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#0f172a' }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Side by Side Comparison Table */}
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700 overflow-hidden">
              <div className="p-4 border-b border-slate-700 bg-slate-800/80">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <Scale className="w-5 h-5 text-cyan-400" />
                  Detailed Metric Comparison
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-900/50">
                    <tr>
                      <th className="text-left p-4 text-slate-400 text-sm font-medium">Metric</th>
                      <th className="text-center p-4 text-slate-400 text-sm font-medium">{country1.name}</th>
                      <th className="text-center p-4 text-slate-400 text-sm font-medium">Comparison</th>
                      <th className="text-center p-4 text-slate-400 text-sm font-medium">{country2.name}</th>
                      <th className="text-left p-4 text-slate-400 text-sm font-medium">Insight</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonData.map((metric, idx) => {
                      const Icon = metric.icon;
                      const isWinner1 = metric.country1Value > metric.country2Value;
                      const isWinner2 = metric.country2Value > metric.country1Value;
                      const diff = Math.abs(metric.difference);
                      
                      return (
                        <tr key={idx} className="border-t border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <Icon className="w-4 h-4 text-cyan-400" />
                              <span className="text-white font-medium">{metric.name}</span>
                            </div>
                          </td>
                          <td className="p-4 text-center">
                            <span className={`text-xl font-bold ${getScoreColor(metric.country1Value)}`}>
                              {metric.country1Value}%
                            </span>
                            {isWinner1 && <Star className="w-4 h-4 text-yellow-400 inline ml-2" />}
                          </td>
                          <td className="p-4 text-center">
                            <div className="flex items-center justify-center gap-1">
                              {getTrendIcon(metric.country1Value, metric.country2Value)}
                              <span className="text-slate-500 text-xs">{diff}% diff</span>
                            </div>
                          </td>
                          <td className="p-4 text-center">
                            <span className={`text-xl font-bold ${getScoreColor(metric.country2Value)}`}>
                              {metric.country2Value}%
                            </span>
                            {isWinner2 && <Star className="w-4 h-4 text-yellow-400 inline ml-2" />}
                          </td>
                          <td className="p-4">
                            <p className="text-slate-300 text-sm">
                              {isWinner1 ? `${country1.name} leads by ${diff}%` : 
                               isWinner2 ? `${country2.name} leads by ${diff}%` : 
                               "Equal performance"}
                            </p>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bar Chart Comparison */}
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
              <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-cyan-400" />
                Side-by-Side Metric Comparison
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonData} layout="vertical" margin={{ left: 80 }}>
                    <XAxis type="number" domain={[0, 100]} tick={{ fill: '#94a3b8' }} />
                    <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8' }} width={120} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#0f172a' }} />
                    <Legend />
                    <Bar dataKey="country1Value" name={country1.name} fill="#06b6d4" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="country2Value" name={country2.name} fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* AI Comparative Analysis */}
            <div className="bg-gradient-to-r from-cyan-600/10 to-purple-600/10 rounded-2xl border border-cyan-500/20 p-6">
              <div className="flex items-start gap-4">
                <Brain className="w-8 h-8 text-cyan-400 flex-shrink-0" />
                <div>
                  <h3 className="text-white font-semibold text-lg mb-2">AI Comparative Analysis</h3>
                  <p className="text-slate-300">
                    {country1.name} and {country2.name} show {Math.abs(country1.reform_score - country2.reform_score) < 10 ? "similar" : "significant"} reform trajectories.
                    {country1.reform_score > country2.reform_score ? 
                      `${country1.name} outperforms ${country2.name} in ${comparisonData.filter(c => c.country1Value > c.country2Value).length} out of ${comparisonData.length} metrics.` :
                      `${country2.name} outperforms ${country1.name} in ${comparisonData.filter(c => c.country2Value > c.country1Value).length} out of ${comparisonData.length} metrics.`
                    }
                    The biggest gap is in <span className="text-cyan-400 font-semibold">
                      {comparisonData.reduce((prev, curr) => Math.abs(curr.difference) > Math.abs(prev.difference) ? curr : prev).name}
                    </span> with a difference of {Math.max(...comparisonData.map(c => Math.abs(c.difference)))}%.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button className="flex-1 py-3 bg-cyan-600 hover:bg-cyan-700 rounded-xl text-white font-semibold transition-colors flex items-center justify-center gap-2">
                <Download className="w-4 h-4" />
                Download Comparison Report
              </button>
              <button className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 rounded-xl text-white font-semibold transition-colors flex items-center justify-center gap-2">
                <Share2 className="w-4 h-4" />
                Share Analysis
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}