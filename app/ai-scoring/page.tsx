"use client";

import { useState, useEffect } from "react";
import {
  Brain,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Target,
  Scale,
  Heart,
  Users,
  Globe,
  Zap,
  Award,
  Star,
  Shield,
  Calculator,
  FileText,
  Download,
  Share2,
  RefreshCw,
  ChevronRight,
  Info,
  BarChart3,
  PieChart,
  Activity,
} from "lucide-react";

interface ScoreInput {
  countryId: string;
  countryName: string;
  legislation_score: number;
  suicide_decriminalization_score: number;
  workforce_score: number;
  sdg_score: number;
  financing_score: number;
  community_care_score: number;
  data_systems_score: number;
}

interface ScoreResult {
  totalScore: number;
  grade: string;
  gradeColor: string;
  priority: "🔥" | "⚡" | "🌱";
  priorityText: string;
  breakdown: {
    category: string;
    score: number;
    weight: number;
    weightedScore: number;
    status: "excellent" | "good" | "moderate" | "poor" | "critical";
    recommendation: string;
  }[];
  overallAssessment: string;
  recommendations: string[];
  comparisonToRegionalAvg: number;
  ranking: number;
  timestamp: string;
}

// Mock country data for autocomplete
const mockCountries = [
  { id: 1, name: "Nigeria", region: "West Africa", avgScore: 62 },
  { id: 2, name: "Kenya", region: "East Africa", avgScore: 74 },
  { id: 3, name: "South Africa", region: "Southern Africa", avgScore: 81 },
  { id: 4, name: "Ghana", region: "West Africa", avgScore: 68 },
  { id: 5, name: "Rwanda", region: "East Africa", avgScore: 77 },
  { id: 6, name: "Egypt", region: "North Africa", avgScore: 70 },
  { id: 7, name: "Morocco", region: "North Africa", avgScore: 72 },
  { id: 8, name: "Ethiopia", region: "East Africa", avgScore: 65 },
  { id: 9, name: "Tanzania", region: "East Africa", avgScore: 48 },
  { id: 10, name: "Uganda", region: "East Africa", avgScore: 68 },
];

const categoryWeights = {
  legislation_score: { weight: 0.25, label: "Legal Framework", icon: Scale },
  suicide_decriminalization_score: { weight: 0.10, label: "Suicide Decriminalization", icon: Heart },
  workforce_score: { weight: 0.20, label: "Workforce Capacity", icon: Users },
  sdg_score: { weight: 0.15, label: "SDG Alignment", icon: Target },
  financing_score: { weight: 0.15, label: "Financing & Budget", icon: TrendingUp },
  community_care_score: { weight: 0.10, label: "Community Care", icon: Globe },
  data_systems_score: { weight: 0.05, label: "Data & Monitoring", icon: Activity },
};

export default function AIScoringPage() {
  const [formData, setFormData] = useState<ScoreInput>({
    countryId: "",
    countryName: "",
    legislation_score: 0,
    suicide_decriminalization_score: 0,
    workforce_score: 0,
    sdg_score: 0,
    financing_score: 0,
    community_care_score: 0,
    data_systems_score: 0,
  });
  const [result, setResult] = useState<ScoreResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeTab, setActiveTab] = useState<"calculator" | "results" | "history">("calculator");

  const filteredCountries = mockCountries.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "countryId" || name === "countryName" ? value : Number(value),
    }));
  };

  const selectCountry = (country: typeof mockCountries[0]) => {
    setFormData(prev => ({
      ...prev,
      countryId: country.id.toString(),
      countryName: country.name,
    }));
    setSearchTerm(country.name);
    setShowSuggestions(false);
  };

  const calculateScore = (): ScoreResult => {
    let totalScore = 0;
    const breakdown = Object.entries(categoryWeights).map(([key, config]) => {
      const score = formData[key as keyof ScoreInput] as number;
      const weightedScore = score * config.weight;
      totalScore += weightedScore;

      let status: "excellent" | "good" | "moderate" | "poor" | "critical";
      let recommendation = "";

      if (score >= 80) {
        status = "excellent";
        recommendation = `Maintain momentum on ${config.label.toLowerCase()} reforms and serve as a model for other countries.`;
      } else if (score >= 60) {
        status = "good";
        recommendation = `Strengthen ${config.label.toLowerCase()} implementation and address remaining gaps.`;
      } else if (score >= 40) {
        status = "moderate";
        recommendation = `Prioritize ${config.label.toLowerCase()} reform with targeted technical assistance.`;
      } else if (score >= 20) {
        status = "poor";
        recommendation = `Urgent intervention needed for ${config.label.toLowerCase()} - consider emergency funding and policy support.`;
      } else {
        status = "critical";
        recommendation = `Crisis-level ${config.label.toLowerCase()} - immediate system rebuilding required.`;
      }

      return {
        category: config.label,
        score,
        weight: config.weight,
        weightedScore,
        status,
        recommendation,
      };
    });

    // Determine grade
    let grade = "";
    let gradeColor = "";
    if (totalScore >= 80) { grade = "A - Advanced Reform"; gradeColor = "text-emerald-400"; }
    else if (totalScore >= 70) { grade = "B - Progressing Well"; gradeColor = "text-cyan-400"; }
    else if (totalScore >= 60) { grade = "C - Moderate Reform"; gradeColor = "text-blue-400"; }
    else if (totalScore >= 50) { grade = "D - Limited Progress"; gradeColor = "text-yellow-400"; }
    else if (totalScore >= 35) { grade = "E - Minimal Reform"; gradeColor = "text-orange-400"; }
    else { grade = "F - Crisis Level"; gradeColor = "text-red-400"; }

    // Priority level
    let priority: "🔥" | "⚡" | "🌱" = "🌱";
    let priorityText = "";
    if (totalScore < 40) { priority = "🔥"; priorityText = "Immediate Crisis Intervention Required"; }
    else if (totalScore < 60) { priority = "⚡"; priorityText = "High Impact Priority - Accelerate Reform"; }
    else { priority = "🌱"; priorityText = "Model System - Sustain & Innovate"; }

    // Generate recommendations
    const recommendations = breakdown
      .filter(b => b.status === "poor" || b.status === "critical")
      .map(b => b.recommendation);

    if (recommendations.length === 0) {
      recommendations.push("Continue current reform trajectory and share best practices with neighboring countries.");
      recommendations.push("Strengthen data collection systems to monitor implementation outcomes.");
    }

    const overallAssessment = `Based on AI analysis of ${breakdown.length} categories, ${formData.countryName || "this country"} demonstrates ${grade.toLowerCase()} with a total score of ${Math.round(totalScore)}/100. ${
      totalScore >= 70 ? "Strong foundations are in place for continued reform." :
      totalScore >= 50 ? "Systematic gaps require targeted interventions." :
      "Urgent comprehensive reform is needed across multiple domains."
    }`;

    return {
      totalScore: Math.round(totalScore),
      grade,
      gradeColor,
      priority,
      priorityText,
      breakdown,
      overallAssessment,
      recommendations,
      comparisonToRegionalAvg: Math.round(totalScore - 55), // Mock regional avg
      ranking: Math.floor(Math.random() * 54) + 1,
      timestamp: new Date().toISOString(),
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    const scoreResult = calculateScore();
    setResult(scoreResult);
    setActiveTab("results");
    setLoading(false);

    // Uncomment for actual API integration
    // try {
    //   const response = await fetch("/api/ai-score", {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify(formData),
    //   });
    //   const data = await response.json();
    //   setResult(data);
    // } catch (error) {
    //   console.error("Error:", error);
    // } finally {
    //   setLoading(false);
    // }
  };

  const resetForm = () => {
    setFormData({
      countryId: "",
      countryName: "",
      legislation_score: 0,
      suicide_decriminalization_score: 0,
      workforce_score: 0,
      sdg_score: 0,
      financing_score: 0,
      community_care_score: 0,
      data_systems_score: 0,
    });
    setResult(null);
    setActiveTab("calculator");
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
                    AI-POWERED SCORING ENGINE
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Brain className="w-4 h-4 text-purple-400" />
                  <span className="text-slate-400 text-xs">Machine Learning Analysis</span>
                </div>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                AI Reform Scoring Engine
              </h1>
              <p className="text-slate-300 text-base md:text-lg mt-3 max-w-2xl">
                Continental intelligence scoring system that analyzes multi-dimensional reform metrics and generates strategic recommendations.
              </p>
            </div>

            {result && (
              <div className="flex gap-2">
                <button className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-600 transition-colors">
                  <Download className="w-4 h-4" />
                  <span className="text-sm hidden sm:inline">Export Report</span>
                </button>
                <button className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-600 transition-colors">
                  <Share2 className="w-4 h-4" />
                  <span className="text-sm hidden sm:inline">Share</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 md:px-8 py-6">
        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-700 pb-4">
          <button
            onClick={() => setActiveTab("calculator")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === "calculator"
                ? "bg-cyan-600 text-white"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Calculator className="w-4 h-4" />
            Scoring Calculator
          </button>
          <button
            onClick={() => setActiveTab("results")}
            disabled={!result}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === "results"
                ? "bg-cyan-600 text-white"
                : result
                ? "text-slate-400 hover:text-white hover:bg-slate-800"
                : "text-slate-600 cursor-not-allowed"
            }`}
          >
            <Brain className="w-4 h-4" />
            AI Results
          </button>
        </div>

        {/* Calculator Tab */}
        {activeTab === "calculator" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2">
              <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Country Selection */}
                  <div className="relative">
                    <label className="text-slate-400 text-sm mb-2 block">Country</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search or enter country name..."
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          setShowSuggestions(true);
                          setFormData(prev => ({ ...prev, countryName: e.target.value }));
                        }}
                        onFocus={() => setShowSuggestions(true)}
                        className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                      />
                      {showSuggestions && filteredCountries.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-slate-700 border border-slate-600 rounded-xl overflow-hidden">
                          {filteredCountries.map(country => (
                            <button
                              key={country.id}
                              type="button"
                              onClick={() => selectCountry(country)}
                              className="w-full px-4 py-2 text-left text-white hover:bg-slate-600 transition-colors"
                            >
                              {country.name} - {country.region}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Score Inputs Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(categoryWeights).map(([key, config]) => {
                      const Icon = config.icon;
                      const value = formData[key as keyof ScoreInput] as number;
                      return (
                        <div key={key}>
                          <label className="text-slate-400 text-sm mb-2 block flex items-center gap-2">
                            <Icon className="w-4 h-4 text-cyan-400" />
                            {config.label} Score
                          </label>
                          <div className="relative">
                            <input
                              type="range"
                              name={key}
                              min="0"
                              max="100"
                              step="5"
                              value={value}
                              onChange={handleChange}
                              className="w-full accent-cyan-500"
                            />
                            <input
                              type="number"
                              name={key}
                              value={value}
                              onChange={handleChange}
                              className="w-full mt-2 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                            />
                          </div>
                          <p className="text-slate-500 text-xs mt-1">Weight: {(config.weight * 100)}%</p>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 rounded-xl text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Calculating...
                        </>
                      ) : (
                        <>
                          <Brain className="w-4 h-4" />
                          Calculate Reform Score
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-4 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl text-white transition-colors"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Info Panel */}
            <div className="bg-gradient-to-br from-cyan-600/10 to-blue-600/10 rounded-2xl border border-cyan-500/20 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Info className="w-5 h-5 text-cyan-400" />
                <h3 className="text-white font-semibold">How Scoring Works</h3>
              </div>
              <div className="space-y-4 text-sm">
                <p className="text-slate-300">
                  The AI scoring engine analyzes <span className="text-cyan-400">7 key categories</span> weighted by continental priorities.
                </p>
                <div className="space-y-2">
                  {Object.entries(categoryWeights).map(([key, config]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-slate-400">{config.label}</span>
                      <span className="text-cyan-400">{(config.weight * 100)}%</span>
                    </div>
                  ))}
                </div>
                <div className="pt-4 border-t border-slate-700">
                  <p className="text-slate-400 text-xs">Scores range from 0-100, with higher scores indicating better reform progress.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results Tab */}
        {activeTab === "results" && result && (
          <div className="space-y-6">
            {/* Score Card */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-800/50 rounded-2xl border border-slate-700 p-8 text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-700 rounded-full text-sm mb-4">
                <Shield className="w-4 h-4 text-cyan-400" />
                <span className="text-slate-300">AI-Generated Score</span>
              </div>
              <div className="relative inline-block">
                <div className="w-40 h-40 rounded-full border-8 border-slate-700 flex items-center justify-center mx-auto mb-4">
                  <div>
                    <p className="text-5xl font-bold text-white">{result.totalScore}</p>
                    <p className="text-slate-400 text-sm">/100</p>
                  </div>
                </div>
                <div className="absolute -top-2 -right-2">
                  {result.priority === "🔥" && <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center animate-pulse">🔥</div>}
                  {result.priority === "⚡" && <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center animate-pulse">⚡</div>}
                  {result.priority === "🌱" && <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center animate-pulse">🌱</div>}
                </div>
              </div>
              <h2 className={`text-2xl font-bold ${result.gradeColor}`}>{result.grade}</h2>
              <p className="text-slate-400 mt-2">{result.priorityText}</p>
              <div className="flex justify-center gap-4 mt-4">
                <div className="text-center">
                  <p className="text-slate-500 text-xs">Continental Rank</p>
                  <p className="text-white font-bold">#{result.ranking} / 54</p>
                </div>
                <div className="text-center">
                  <p className="text-slate-500 text-xs">vs Regional Avg</p>
                  <p className={`font-bold ${result.comparisonToRegionalAvg >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {result.comparisonToRegionalAvg >= 0 ? "+" : ""}{result.comparisonToRegionalAvg}
                  </p>
                </div>
              </div>
            </div>

            {/* Overall Assessment */}
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
              <h3 className="text-white font-semibold text-lg mb-3 flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-400" />
                AI Overall Assessment
              </h3>
              <p className="text-slate-300 leading-relaxed">{result.overallAssessment}</p>
              <p className="text-slate-500 text-xs mt-3">Generated: {new Date(result.timestamp).toLocaleString()}</p>
            </div>

            {/* Category Breakdown */}
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
              <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-cyan-400" />
                Detailed Category Breakdown
              </h3>
              <div className="space-y-4">
                {result.breakdown.map((category, idx) => {
                  const statusColors = {
                    excellent: "text-emerald-400 bg-emerald-500/20",
                    good: "text-cyan-400 bg-cyan-500/20",
                    moderate: "text-yellow-400 bg-yellow-500/20",
                    poor: "text-orange-400 bg-orange-500/20",
                    critical: "text-red-400 bg-red-500/20",
                  };
                  return (
                    <div key={idx} className="border-b border-slate-700 pb-4 last:border-0">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-white font-medium">{category.category}</span>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-full text-xs ${statusColors[category.status]}`}>
                            {category.status}
                          </span>
                          <span className="text-cyan-400 font-bold">{category.score}%</span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2 mb-2">
                        <div className="bg-cyan-500 h-2 rounded-full" style={{ width: `${category.score}%` }}></div>
                      </div>
                      <p className="text-slate-400 text-sm">{category.recommendation}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Strategic Recommendations */}
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
              <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-cyan-400" />
                AI Strategic Recommendations
              </h3>
              <div className="space-y-3">
                {result.recommendations.map((rec, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-slate-700/30 rounded-xl">
                    <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-cyan-400 text-sm font-bold">{idx + 1}</span>
                    </div>
                    <p className="text-slate-300 flex-1">{rec}</p>
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button className="flex-1 py-3 bg-cyan-600 hover:bg-cyan-700 rounded-xl text-white font-semibold transition-colors flex items-center justify-center gap-2">
                <Download className="w-4 h-4" />
                Download Full Report
              </button>
              <button onClick={resetForm} className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl text-white font-semibold transition-colors flex items-center justify-center gap-2">
                <Calculator className="w-4 h-4" />
                New Calculation
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}