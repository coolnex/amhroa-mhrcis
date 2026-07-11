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

  // Mock data for demonstration when API is not available
  const mockProfiles: Record<string, CountryProfile> = {
    "1": {
      country: {
        id: 1,
        country_name: "Kenya",
        region: "East Africa",
        reform_score: 74,
        population: 53.8,
        capital: "Nairobi",
        last_updated: "2024-03-15",
      },
      intelligence: {
        reformLevel: "Moderate Reform",
        riskLevel: "Medium Risk",
        priority: "⚡",
        implementationStatus: "Partial Implementation",
        lawStatus: "Modern Law (2019)",
        summary: "Kenya has made significant progress in mental health reform with the passage of the Mental Health Act 2019 and subsequent devolution of services to county level. However, implementation remains uneven across 47 counties, with urban centers showing better service delivery than rural areas. The country has established a Mental Health Taskforce and is working on integrating mental health into primary healthcare. Key challenges include inadequate funding, workforce shortages, and persistent stigma in rural communities.",
        strengths: [
          "Modern legal framework aligned with WHO standards",
          "Devolution has enabled county-level innovation",
          "Strong civil society engagement and advocacy",
          "Mental health integrated into Universal Health Coverage",
        ],
        challenges: [
          "Uneven implementation across counties",
          "Severe shortage of psychiatrists (0.5 per 100k)",
          "Limited community-based services",
          "Stigma remains high in rural areas",
        ],
        recommendations: [
          "Accelerate county-level implementation through dedicated technical assistance",
          "Expand community health worker training on mental health",
          "Increase mental health budget allocation to 5% of health budget",
          "Launch national anti-stigma campaign targeting rural populations",
          "Establish telepsychiatry network to reach underserved areas",
        ],
        sdgProgress: {
          sdg3_4: 68,
          sdg10_2: 55,
          sdg16_3: 72,
        },
        metrics: {
          psychiatristsPer100k: 0.5,
          bedsPer100k: 10.5,
          budgetAllocation: 1.2,
          ngoPresence: 45,
        },
        timeline: [
          { year: 2019, event: "Mental Health Act Passed", status: "completed" },
          { year: 2020, event: "Mental Health Task Force Established", status: "completed" },
          { year: 2022, event: "County-Level Implementation Begins", status: "in-progress" },
          { year: 2024, event: "Community Health Worker Training", status: "in-progress" },
          { year: 2026, event: "Full Implementation Target", status: "planned" },
        ],
      },
      aiConfidence: 94,
      generatedAt: new Date().toISOString(),
    },
    "2": {
      country: {
        id: 2,
        country_name: "Nigeria",
        region: "West Africa",
        reform_score: 62,
        population: 218.6,
        capital: "Abuja",
        last_updated: "2024-03-15",
      },
      intelligence: {
        reformLevel: "Limited Reform",
        riskLevel: "High Risk",
        priority: "🔥",
        implementationStatus: "Minimal Implementation",
        lawStatus: "Modern Law (2013 - National Mental Health Act)",
        summary: "Nigeria passed the National Mental Health Act in 2013, replacing the outdated Lunacy Act. However, implementation has been slow due to federal-state coordination challenges, inadequate funding, and competing health priorities. Only a few states have domesticated the act, and mental health services remain concentrated in federal neuropsychiatric hospitals. The country faces a massive treatment gap with only 10% of those in need receiving care.",
        strengths: [
          "National Mental Health Act exists (2013)",
          "Federal neuropsychiatric hospitals provide specialized care",
          "Growing youth mental health advocacy movement",
        ],
        challenges: [
          "Poor domestication at state level",
          "Mental health budget <1% of health budget",
          "Severe workforce shortage (0.4 psychiatrists per 100k)",
          "Weak primary healthcare integration",
        ],
        recommendations: [
          "Accelerate state-level domestication of the Mental Health Act",
          "Establish Mental Health Department at federal and state levels",
          "Train 10,000 primary healthcare workers in mental health",
          "Launch pilot community mental health programs in 6 geo-political zones",
          "Create national mental health funding mechanism",
        ],
        sdgProgress: {
          sdg3_4: 45,
          sdg10_2: 35,
          sdg16_3: 50,
        },
        metrics: {
          psychiatristsPer100k: 0.4,
          bedsPer100k: 8.0,
          budgetAllocation: 0.8,
          ngoPresence: 65,
        },
        timeline: [
          { year: 2013, event: "National Mental Health Act Passed", status: "completed" },
          { year: 2015, event: "National Mental Health Policy", status: "completed" },
          { year: 2018, event: "State-Level Domestication Campaign", status: "in-progress" },
          { year: 2023, event: "Primary Healthcare Integration", status: "in-progress" },
          { year: 2025, event: "Community Mental Health Rollout", status: "planned" },
        ],
      },
      aiConfidence: 96,
      generatedAt: new Date().toISOString(),
    },
  };

  const fetchProfile = async () => {
    if (!countryId && !countryName) {
      setError("Please enter a Country ID or Name");
      return;
    }

    setLoading(true);
    setError(null);
    setProfile(null);

    try {
      // Try API first
      const response = await fetch(
        `/api/ai-country-profile?${countryId ? `countryId=${countryId}` : `countryName=${encodeURIComponent(countryName)}`}`
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.profile) {
          setProfile(data.profile);
          return;
        }
      }

      // Fallback to mock data
      if (countryId && mockProfiles[countryId]) {
        setProfile(mockProfiles[countryId]);
      } else if (countryName) {
        const foundProfile = Object.values(mockProfiles).find(
          (p) => p.country.country_name.toLowerCase() === countryName.toLowerCase()
        );
        if (foundProfile) {
          setProfile(foundProfile);
        } else {
          setError("Country not found. Please try a different ID or name.");
        }
      } else {
        setError("Country not found. Please try a different ID or name.");
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
                    AI-POWERED INTELLIGENCE
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Brain className="w-4 h-4 text-purple-400" />
                  <span className="text-slate-400 text-xs">Generative AI Analysis</span>
                </div>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                AI Country Intelligence Profiles
              </h1>
              <p className="text-slate-300 text-base md:text-lg mt-3 max-w-2xl">
                Automated continental reform intelligence and governance insights powered by advanced AI analysis.
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
          <div className="space-y-6">
            {/* Hero Card */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-800/50 rounded-2xl border border-slate-700 overflow-hidden">
              <div className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <MapPin className="w-5 h-5 text-cyan-400" />
                      <span className="text-slate-400 text-sm">{profile.country.region}</span>
                      <span className="text-slate-600">•</span>
                      <span className="text-slate-400 text-sm">Capital: {profile.country.capital}</span>
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
                    </div>
                  </div>
                  <div className="text-center md:text-right">
                    <p className="text-slate-400 text-sm">Population</p>
                    <p className="text-3xl font-bold text-white">{profile.country.population}M</p>
                    <p className="text-slate-500 text-xs mt-1">Last updated: {new Date(profile.generatedAt).toLocaleDateString()}</p>
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
                  <p className="text-slate-300 leading-relaxed">{profile.intelligence.summary}</p>
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
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-slate-400 text-sm">SDG 3.4 (Mental Health)</span>
                        <span className="text-cyan-400 text-sm">{profile.intelligence.sdgProgress.sdg3_4}%</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div className="bg-cyan-500 h-2 rounded-full" style={{ width: `${profile.intelligence.sdgProgress.sdg3_4}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-slate-400 text-sm">SDG 10.2 (Social Inclusion)</span>
                        <span className="text-cyan-400 text-sm">{profile.intelligence.sdgProgress.sdg10_2}%</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div className="bg-cyan-500 h-2 rounded-full" style={{ width: `${profile.intelligence.sdgProgress.sdg10_2}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-slate-400 text-sm">SDG 16.3 (Rule of Law)</span>
                        <span className="text-cyan-400 text-sm">{profile.intelligence.sdgProgress.sdg16_3}%</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div className="bg-cyan-500 h-2 rounded-full" style={{ width: `${profile.intelligence.sdgProgress.sdg16_3}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Metrics Tab */}
            {activeTab === "metrics" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
                  <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-cyan-400" />
                    Workforce Metrics
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-slate-700">
                      <span className="text-slate-400">Psychiatrists per 100k</span>
                      <span className="text-white font-bold">{profile.intelligence.metrics.psychiatristsPer100k}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-700">
                      <span className="text-slate-400">Psychiatric Beds per 100k</span>
                      <span className="text-white font-bold">{profile.intelligence.metrics.bedsPer100k}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-700">
                      <span className="text-slate-400">NGO/CSO Presence</span>
                      <span className="text-white font-bold">{profile.intelligence.metrics.ngoPresence} organizations</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
                  <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-cyan-400" />
                    System Indicators
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-slate-700">
                      <span className="text-slate-400">Budget Allocation</span>
                      <span className="text-white font-bold">{profile.intelligence.metrics.budgetAllocation}% of health budget</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-700">
                      <span className="text-slate-400">Implementation Status</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        profile.intelligence.implementationStatus === "Full Implementation" ? "bg-emerald-500/20 text-emerald-400" :
                        profile.intelligence.implementationStatus === "Partial Implementation" ? "bg-yellow-500/20 text-yellow-400" :
                        "bg-red-500/20 text-red-400"
                      }`}>
                        {profile.intelligence.implementationStatus}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-700">
                      <span className="text-slate-400">Law Status</span>
                      <span className="text-white font-bold">{profile.intelligence.lawStatus}</span>
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
                    {profile.intelligence.timeline.map((item, idx) => (
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
                          <span className={`text-xs mt-1 ${
                            item.status === "completed" ? "text-emerald-400" :
                            item.status === "in-progress" ? "text-yellow-400" :
                            "text-slate-500"
                          }`}>
                            {item.status === "completed" ? "✓ Completed" :
                             item.status === "in-progress" ? "● In Progress" :
                             "○ Planned"}
                          </span>
                        </div>
                      </div>
                    ))}
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
                  {profile.intelligence.recommendations.map((rec, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-4 bg-slate-700/30 rounded-xl hover:bg-slate-700/50 transition-colors">
                      <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-cyan-400 text-sm font-bold">{idx + 1}</span>
                      </div>
                      <p className="text-slate-300 flex-1">{rec}</p>
                      <ChevronRight className="w-4 h-4 text-slate-500 flex-shrink-0" />
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="mt-6 pt-6 border-t border-slate-700 flex gap-3">
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
              <p className="text-slate-500 text-xs flex items-center justify-center gap-2">
                <Brain className="w-3 h-3" />
                AI-generated intelligence based on continental reform data and global best practices
                <span className="text-slate-600">•</span>
                Confidence score: {profile.aiConfidence}%
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}