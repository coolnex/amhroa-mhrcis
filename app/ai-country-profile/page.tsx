"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  Brain,
  TrendingUp,
  ArrowLeft,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Target,
  Flag,
  MapPin,
  Calendar,
  Download,
  Share2,
  Sparkles,
  Shield,
  BarChart3,
  PieChart,
  LineChart,
  Users,
  Building2,
  Heart,
  Globe,
  Zap,
  Leaf,
  Flame,
  Award,
  Clock,
  FileText,
  MessageSquare,
  Star,
  ChevronRight,
  DollarSign,
  Gauge,
  BookOpen,
} from "lucide-react";

interface CountryProfile {
  country: {
    id: number;
    country_name: string;
    region: string;
    reform_score: number;
    population: number;
    capital: string;
    last_updated: string;
  };
  intelligence: {
    reformLevel: string;
    riskLevel: string;
    priority: "🔥" | "⚡" | "🌱";
    implementationStatus: string;
    lawStatus: string;
    summary: string;
    strengths: string[];
    challenges: string[];
    recommendations: string[];
    sdgProgress: {
      sdg3_4: number;
      sdg10_2: number;
      sdg16_3: number;
    };
    metrics: {
      psychiatristsPer100k: number;
      bedsPer100k: number;
      budgetAllocation: number;
      ngoPresence: number;
    };
    timeline: {
      year: number;
      event: string;
      status: "completed" | "in-progress" | "planned";
    }[];
    // Additional fields from mental_health_reforms
    reformTier?: string;
    fundingGapLevel?: string;
    investmentPriority?: string;
    estimatedInvestmentNeed?: number;
    donorReadinessScore?: number;
    agenda2063Score?: number;
    strategy?: string;
    priorityLevel?: string;
  };
  aiConfidence: number;
  generatedAt: string;
}

export default function AICountryProfilePage() {
  const [countryId, setCountryId] = useState<string>("");
  const [countryName, setCountryName] = useState<string>("");
  const [profile, setProfile] = useState<CountryProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "metrics" | "timeline" | "recommendations">("overview");
  const [savedProfiles, setSavedProfiles] = useState<any[]>([]);

  const fetchProfile = async () => {
    if (!countryId && !countryName) {
      setError("Please enter a Country ID or Name");
      return;
    }

    setLoading(true);
    setError(null);
    setProfile(null);

    try {
      const queryParams = new URLSearchParams();
      if (countryId) {
        queryParams.append("countryId", countryId);
      }
      if (countryName) {
        queryParams.append("countryName", countryName);
      }

      const response = await fetch(
        `/api/ai-country-profile?${queryParams.toString()}`
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.profile) {
          setProfile(data.profile);
        } else {
          setError(data.message || "Country not found");
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to load profile");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      setError("Failed to load profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      fetchProfile();
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "🔥": return <Flame className="w-5 h-5 text-red-400" />;
      case "⚡": return <Zap className="w-5 h-5 text-yellow-400" />;
      case "🌱": return <Leaf className="w-5 h-5 text-emerald-400" />;
      default: return <Leaf className="w-5 h-5 text-emerald-400" />;
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case "🔥": return "Immediate Crisis Intervention";
      case "⚡": return "High Impact Priority";
      case "🌱": return "Model System / Sustaining";
      default: return "Strategic Priority";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-400";
    if (score >= 60) return "text-cyan-400";
    if (score >= 40) return "text-yellow-400";
    return "text-red-400";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return "bg-emerald-500/20 border-emerald-500/30";
    if (score >= 60) return "bg-cyan-500/20 border-cyan-500/30";
    if (score >= 40) return "bg-yellow-500/20 border-yellow-500/30";
    return "bg-red-500/20 border-red-500/30";
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { color: string; label: string }> = {
      'completed': { color: 'bg-emerald-500/20 text-emerald-400', label: '✓ Completed' },
      'in-progress': { color: 'bg-yellow-500/20 text-yellow-400', label: '● In Progress' },
      'planned': { color: 'bg-slate-600/20 text-slate-400', label: '○ Planned' },
    };
    return statusMap[status] || statusMap['planned'];
  };

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
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <div className="px-3 py-1 bg-cyan-500/20 rounded-full border border-cyan-500/30">
                  <span className="text-cyan-300 text-xs font-mono tracking-wider">
                    AI-POWERED INTELLIGENCE
                  </span>
                </div>
                <div className="flex items-center gap-1 px-3 py-1 bg-purple-500/20 rounded-full border border-purple-500/30">
                  <Brain className="w-3 h-3 text-purple-400" />
                  <span className="text-purple-300 text-xs font-mono">Generative AI Analysis</span>
                </div>
                <div className="flex items-center gap-1 px-3 py-1 bg-emerald-500/20 rounded-full border border-emerald-500/30">
                  <Database className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-300 text-xs font-mono">Mental Health Reforms</span>
                </div>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                AI Country Intelligence Profiles
              </h1>
              <p className="text-slate-300 text-base md:text-lg mt-3 max-w-2xl">
                Automated continental reform intelligence and governance insights powered by advanced AI analysis from the mental_health_reforms database.
              </p>
            </div>

            {profile && (
              <div className="flex gap-2">
                <button className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-600 transition-colors">
                  <Download className="w-4 h-4" />
                  <span className="text-sm hidden sm:inline">Export PDF</span>
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
        {/* Search Section */}
        <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="text-slate-400 text-sm mb-2 block">Country ID</label>
              <input
                type="number"
                placeholder="Enter Country ID (e.g., 1, 2, 3...)"
                value={countryId}
                onChange={(e) => {
                  setCountryId(e.target.value);
                  setCountryName("");
                }}
                onKeyPress={handleKeyPress}
                className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div className="flex items-center justify-center">
              <span className="text-slate-500 text-lg font-bold">OR</span>
            </div>
            <div className="flex-1">
              <label className="text-slate-400 text-sm mb-2 block">Country Name</label>
              <input
                type="text"
                placeholder="Enter Country Name (e.g., Kenya, Nigeria)"
                value={countryName}
                onChange={(e) => {
                  setCountryName(e.target.value);
                  setCountryId("");
                }}
                onKeyPress={handleKeyPress}
                className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={fetchProfile}
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 rounded-xl text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate AI Profile
                  </>
                )}
              </button>
            </div>
          </div>
          {error && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
              <p className="text-red-400 text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                {error}
              </p>
            </div>
          )}
        </div>

        {/* Profile Content */}
        {profile && (
          <div className="space-y-6 animate-in fade-in duration-500">
            {/* Hero Card */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-800/50 rounded-2xl border border-slate-700 overflow-hidden">
              <div className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                      <MapPin className="w-5 h-5 text-cyan-400" />
                      <span className="text-slate-400 text-sm">Tier: {profile.intelligence.reformTier || profile.country.region}</span>
                      <span className="text-slate-600">•</span>
                      <span className="text-slate-400 text-sm">Priority: {profile.intelligence.priorityLevel || 'Not specified'}</span>
                      {profile.intelligence.fundingGapLevel && (
                        <>
                          <span className="text-slate-600">•</span>
                          <span className="text-slate-400 text-sm">Funding Gap: {profile.intelligence.fundingGapLevel}</span>
                        </>
                      )}
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold text-white">
                      {profile.country.country_name}
                    </h2>
                    <div className="flex flex-wrap gap-3 mt-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreBgColor(profile.country.reform_score)}`}>
                        Reform Score: {profile.country.reform_score}%
                      </span>
                      <span className="flex items-center gap-1 px-3 py-1 bg-slate-700 rounded-full text-sm">
                        {getPriorityIcon(profile.intelligence.priority)}
                        {getPriorityText(profile.intelligence.priority)}
                      </span>
                      <span className="flex items-center gap-1 px-3 py-1 bg-purple-500/20 rounded-full text-sm text-purple-400">
                        <Brain className="w-3 h-3" />
                        AI Confidence: {profile.aiConfidence}%
                      </span>
                      {profile.intelligence.donorReadinessScore !== undefined && (
                        <span className="flex items-center gap-1 px-3 py-1 bg-emerald-500/20 rounded-full text-sm text-emerald-400">
                          <DollarSign className="w-3 h-3" />
                          Donor Readiness: {profile.intelligence.donorReadinessScore}%
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-center md:text-right">
                    {profile.intelligence.estimatedInvestmentNeed && (
                      <>
                        <p className="text-slate-400 text-sm">Investment Need</p>
                        <p className="text-2xl font-bold text-emerald-400">
                          ${(profile.intelligence.estimatedInvestmentNeed / 1000000).toFixed(1)}M
                        </p>
                      </>
                    )}
                    <p className="text-slate-500 text-xs mt-1">Generated: {new Date(profile.generatedAt).toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Score Gauge */}
                <div className="mt-6 pt-6 border-t border-slate-700">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-slate-400 text-sm">Continental Reform Index</span>
                    <span className={`text-2xl font-bold ${getScoreColor(profile.country.reform_score)}`}>
                      {profile.country.reform_score}/100
                    </span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-500 ${
                        profile.country.reform_score >= 80 ? "bg-emerald-500" :
                        profile.country.reform_score >= 60 ? "bg-cyan-500" :
                        profile.country.reform_score >= 40 ? "bg-yellow-500" : "bg-red-500"
                      }`}
                      style={{ width: `${profile.country.reform_score}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-slate-500">
                    <span>Crisis (0-20)</span>
                    <span>Limited (21-40)</span>
                    <span>Moderate (41-60)</span>
                    <span>Progressing (61-80)</span>
                    <span>Advanced (81-100)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex flex-wrap gap-2 border-b border-slate-700 pb-4">
              <button
                onClick={() => setActiveTab("overview")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                  activeTab === "overview"
                    ? "bg-cyan-600 text-white"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                <Globe className="w-4 h-4" />
                Overview
              </button>
              <button
                onClick={() => setActiveTab("metrics")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                  activeTab === "metrics"
                    ? "bg-cyan-600 text-white"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                Key Metrics
              </button>
              <button
                onClick={() => setActiveTab("timeline")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                  activeTab === "timeline"
                    ? "bg-cyan-600 text-white"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                <Clock className="w-4 h-4" />
                Reform Timeline
              </button>
              <button
                onClick={() => setActiveTab("recommendations")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                  activeTab === "recommendations"
                    ? "bg-cyan-600 text-white"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                <Target className="w-4 h-4" />
                Strategic Recommendations
              </button>
            </div>

            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Summary Card */}
                <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
                  <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                    <Brain className="w-5 h-5 text-purple-400" />
                    AI-Generated Reform Summary
                  </h3>
                  <div className="text-slate-300 leading-relaxed whitespace-pre-line">
                    {profile.intelligence.summary}
                  </div>
                  {profile.intelligence.strategy && (
                    <div className="mt-4 p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
                      <p className="text-cyan-400 text-sm flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        Reform Strategy: {profile.intelligence.strategy}
                      </p>
                    </div>
                  )}
                </div>

                {/* Strengths & Challenges Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-emerald-500/5 rounded-2xl border border-emerald-500/20 p-6">
                    <h3 className="text-emerald-400 font-semibold text-lg mb-4 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      Strengths & Assets
                    </h3>
                    <ul className="space-y-3">
                      {profile.intelligence.strengths.map((strength, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-slate-300">
                          <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-red-500/5 rounded-2xl border border-red-500/20 p-6">
                    <h3 className="text-red-400 font-semibold text-lg mb-4 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" />
                      Challenges & Gaps
                    </h3>
                    <ul className="space-y-3">
                      {profile.intelligence.challenges.map((challenge, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-slate-300">
                          <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{challenge}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* SDG Progress */}
                <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
                  <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-cyan-400" />
                    SDG Alignment Progress
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-slate-400 text-sm">SDG 3.4</span>
                        <span className="text-cyan-400 text-sm">{profile.intelligence.sdgProgress.sdg3_4}%</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div className="bg-cyan-500 h-2 rounded-full" style={{ width: `${profile.intelligence.sdgProgress.sdg3_4}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-slate-400 text-sm">SDG 10.2</span>
                        <span className="text-cyan-400 text-sm">{profile.intelligence.sdgProgress.sdg10_2}%</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div className="bg-cyan-500 h-2 rounded-full" style={{ width: `${profile.intelligence.sdgProgress.sdg10_2}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-slate-400 text-sm">SDG 16.3</span>
                        <span className="text-cyan-400 text-sm">{profile.intelligence.sdgProgress.sdg16_3}%</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div className="bg-cyan-500 h-2 rounded-full" style={{ width: `${profile.intelligence.sdgProgress.sdg16_3}%` }}></div>
                      </div>
                    </div>
                  </div>
                  {profile.intelligence.agenda2063Score !== undefined && (
                    <div className="mt-4 pt-4 border-t border-slate-700">
                      <div className="flex justify-between mb-1">
                        <span className="text-slate-400 text-sm">Agenda 2063 Alignment</span>
                        <span className="text-purple-400 text-sm">{profile.intelligence.agenda2063Score}%</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${profile.intelligence.agenda2063Score}%` }}></div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Status Cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                    <p className="text-slate-400 text-xs">Law Status</p>
                    <p className="text-white font-medium mt-1">{profile.intelligence.lawStatus}</p>
                  </div>
                  <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                    <p className="text-slate-400 text-xs">Implementation</p>
                    <p className="text-white font-medium mt-1">{profile.intelligence.implementationStatus}</p>
                  </div>
                  {profile.intelligence.fundingGapLevel && (
                    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                      <p className="text-slate-400 text-xs">Funding Gap</p>
                      <p className={`font-medium mt-1 ${
                        profile.intelligence.fundingGapLevel === 'critical' ? 'text-red-400' :
                        profile.intelligence.fundingGapLevel === 'high' ? 'text-orange-400' :
                        profile.intelligence.fundingGapLevel === 'medium' ? 'text-yellow-400' :
                        'text-emerald-400'
                      }`}>
                        {profile.intelligence.fundingGapLevel}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Metrics Tab */}
            {activeTab === "metrics" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
                  <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                    <Gauge className="w-5 h-5 text-cyan-400" />
                    System Performance
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-slate-700">
                      <span className="text-slate-400">Reform Score</span>
                      <span className={`font-bold ${getScoreColor(profile.country.reform_score)}`}>
                        {profile.country.reform_score}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-700">
                      <span className="text-slate-400">Implementation Status</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        profile.intelligence.implementationStatus === "Full Implementation" ? "bg-emerald-500/20 text-emerald-400" :
                        profile.intelligence.implementationStatus === "Partial Implementation" ? "bg-yellow-500/20 text-yellow-400" :
                        profile.intelligence.implementationStatus === "In Progress" ? "bg-yellow-500/20 text-yellow-400" :
                        "bg-red-500/20 text-red-400"
                      }`}>
                        {profile.intelligence.implementationStatus}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-700">
                      <span className="text-slate-400">Donor Readiness</span>
                      <span className={`font-bold ${getScoreColor(profile.intelligence.donorReadinessScore || 0)}`}>
                        {profile.intelligence.donorReadinessScore || 0}%
                      </span>
                    </div>
                    {profile.intelligence.investmentPriority && (
                      <div className="flex justify-between items-center py-2 border-b border-slate-700">
                        <span className="text-slate-400">Investment Priority</span>
                        <span className="text-cyan-400 font-medium">{profile.intelligence.investmentPriority}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
                  <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-cyan-400" />
                    Financial & Strategic Indicators
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-slate-700">
                      <span className="text-slate-400">Budget Allocation</span>
                      <span className="text-white font-bold">{profile.intelligence.metrics.budgetAllocation}% of health budget</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-700">
                      <span className="text-slate-400">NGO/CSO Presence</span>
                      <span className="text-white font-bold">{profile.intelligence.metrics.ngoPresence} organizations</span>
                    </div>
                    {profile.intelligence.estimatedInvestmentNeed && (
                      <div className="flex justify-between items-center py-2 border-b border-slate-700">
                        <span className="text-slate-400">Estimated Investment Need</span>
                        <span className="text-emerald-400 font-bold">
                          ${profile.intelligence.estimatedInvestmentNeed.toLocaleString()}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between items-center py-2 border-b border-slate-700">
                      <span className="text-slate-400">Strategic Priority</span>
                      <span className="flex items-center gap-1">
                        {getPriorityIcon(profile.intelligence.priority)}
                        <span className="text-white font-medium">{getPriorityText(profile.intelligence.priority)}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Timeline Tab */}
            {activeTab === "timeline" && (
              <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
                <h3 className="text-white font-semibold text-lg mb-6 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-cyan-400" />
                  Reform Implementation Timeline
                </h3>
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-700"></div>
                  <div className="space-y-6">
                    {profile.intelligence.timeline.map((item, idx) => {
                      const statusBadge = getStatusBadge(item.status);
                      return (
                        <div key={idx} className="relative pl-10">
                          <div className={`absolute left-0 w-8 h-8 rounded-full flex items-center justify-center ${
                            item.status === "completed" ? "bg-emerald-500/20 border border-emerald-500" :
                            item.status === "in-progress" ? "bg-yellow-500/20 border border-yellow-500" :
                            "bg-slate-700 border border-slate-600"
                          }`}>
                            {item.status === "completed" && <CheckCircle className="w-4 h-4 text-emerald-400" />}
                            {item.status === "in-progress" && <Clock className="w-4 h-4 text-yellow-400" />}
                            {item.status === "planned" && <Target className="w-4 h-4 text-slate-400" />}
                          </div>
                          <div>
                            <span className="text-cyan-400 font-mono text-sm">{item.year}</span>
                            <p className="text-white font-medium mt-1">{item.event}</p>
                            <span className={`text-xs mt-1 ${statusBadge.color}`}>
                              {statusBadge.label}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Recommendations Tab */}
            {activeTab === "recommendations" && (
              <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
                <h3 className="text-white font-semibold text-lg mb-6 flex items-center gap-2">
                  <Target className="w-5 h-5 text-cyan-400" />
                  AI-Generated Strategic Recommendations
                </h3>
                <div className="space-y-4">
                  {profile.intelligence.recommendations.map((rec, idx) => {
                    const isCritical = rec.includes('⚠️') || rec.includes('CRITICAL') || rec.includes('🚀');
                    const isFinancial = rec.includes('💰') || rec.includes('$');
                    const isLegal = rec.includes('⚖️') || rec.includes('📋');
                    
                    let bgColor = "bg-slate-700/30";
                    if (isCritical) bgColor = "bg-red-500/10 border-red-500/20";
                    else if (isFinancial) bgColor = "bg-emerald-500/10 border-emerald-500/20";
                    else if (isLegal) bgColor = "bg-purple-500/10 border-purple-500/20";
                    
                    return (
                      <div key={idx} className={`flex items-start gap-3 p-4 ${bgColor} rounded-xl hover:bg-slate-700/50 transition-colors border border-transparent`}>
                        <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-cyan-400 text-sm font-bold">{idx + 1}</span>
                        </div>
                        <p className="text-slate-300 flex-1">{rec}</p>
                        <ChevronRight className="w-4 h-4 text-slate-500 flex-shrink-0" />
                      </div>
                    );
                  })}
                </div>

                {/* Action Buttons */}
                <div className="mt-6 pt-6 border-t border-slate-700 flex flex-col sm:flex-row gap-3">
                  <button className="flex-1 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-white font-medium transition-colors flex items-center justify-center gap-2">
                    <Download className="w-4 h-4" />
                    Export Recommendations
                  </button>
                  <button className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white font-medium transition-colors flex items-center justify-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Share with Country Team
                  </button>
                </div>
              </div>
            )}

            {/* AI Attribution */}
            <div className="text-center py-4">
              <p className="text-slate-500 text-xs flex items-center justify-center gap-2 flex-wrap">
                <Brain className="w-3 h-3" />
                AI-generated intelligence based on mental_health_reforms database and global best practices
                <span className="text-slate-600">•</span>
                Confidence score: {profile.aiConfidence}%
                {profile.intelligence.reformTier && (
                  <>
                    <span className="text-slate-600">•</span>
                    <span className="text-emerald-400">Tier: {profile.intelligence.reformTier}</span>
                  </>
                )}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Add missing import
import { Database } from "lucide-react";