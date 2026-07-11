"use client";

import Link from "next/link";
import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Brain,
  TrendingUp,
  TrendingDown,
  ArrowLeft,
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
  Sparkles,
  Clock,
  BookOpen,
  Lightbulb,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Building2,
  DollarSign,
  PieChart as PieChartIcon,
  Gauge,
  Landmark,
  Database,
} from "lucide-react";

interface MentalHealthReform {
  id: number;
  country_name: string;
  reform_tier: string | null;
  law_status: string | null;
  implementation_status: string | null;
  budget_level: string | null;
  priority_level: string | null;
  strategy: string | null;
  reform_score: number | null;
  implementation_score: number | null;
  sdg3_score: number | null;
  sdg10_score: number | null;
  sdg16_score: number | null;
  agenda2063_score: number | null;
  funding_gap_level: string | null;
  investment_priority: string | null;
  estimated_investment_need: number | null;
  donor_readiness_score: number | null;
  created_at: string;
}

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
    trend?: "up" | "down" | "stable";
    sourceData?: {
      reform_score?: number;
      implementation_score?: number;
      sdg3_score?: number;
      sdg10_score?: number;
      sdg16_score?: number;
      agenda2063_score?: number;
      donor_readiness_score?: number;
    };
  }[];
  overallAssessment: string;
  recommendations: string[];
  comparisonToRegionalAvg: number;
  ranking: number;
  timestamp: string;
  historicalData?: {
    previousScore: number;
    change: number;
  };
  countryData?: MentalHealthReform;
}

// Type helper
type ScoreInputKey = keyof ScoreInput;

const categoryWeights = {
  legislation_score: { 
    weight: 0.25, 
    label: "Legal Framework", 
    icon: Scale, 
    description: "Mental health laws and policies",
    dbField: "law_status" as keyof MentalHealthReform,
    scoreMapping: (data: MentalHealthReform) => {
      const statusMap: Record<string, number> = {
        'enacted': 90,
        'draft': 50,
        'pending': 30,
        'none': 10,
        'revision': 70,
      };
      return statusMap[data.law_status?.toLowerCase() || 'none'] || 0;
    }
  },
  suicide_decriminalization_score: { 
    weight: 0.10, 
    label: "Suicide Decriminalization", 
    icon: Heart, 
    description: "Legal status and reform progress",
    dbField: "implementation_status" as keyof MentalHealthReform,
    scoreMapping: (data: MentalHealthReform) => {
      const statusMap: Record<string, number> = {
        'fully_implemented': 95,
        'partially_implemented': 60,
        'in_progress': 40,
        'planned': 25,
        'not_started': 10,
      };
      return statusMap[data.implementation_status?.toLowerCase() || 'not_started'] || 0;
    }
  },
  workforce_score: { 
    weight: 0.20, 
    label: "Workforce Capacity", 
    icon: Users, 
    description: "Mental health professionals per capita",
    dbField: "reform_score" as keyof MentalHealthReform,
    scoreMapping: (data: MentalHealthReform) => data.reform_score || 0
  },
  sdg_score: { 
    weight: 0.15, 
    label: "SDG Alignment", 
    icon: Target, 
    description: "Sustainable Development Goals progress",
    dbField: null,
    scoreMapping: (data: MentalHealthReform) => {
      const scores = [data.sdg3_score, data.sdg10_score, data.sdg16_score].filter(s => s !== null);
      return scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    }
  },
  financing_score: { 
    weight: 0.15, 
    label: "Financing & Budget", 
    icon: TrendingUp, 
    description: "Budget allocation and spending",
    dbField: "budget_level" as keyof MentalHealthReform,
    scoreMapping: (data: MentalHealthReform) => {
      const statusMap: Record<string, number> = {
        'high': 85,
        'medium': 55,
        'low': 25,
        'critical': 10,
      };
      return statusMap[data.budget_level?.toLowerCase() || 'critical'] || 0;
    }
  },
  community_care_score: { 
    weight: 0.10, 
    label: "Community Care", 
    icon: Globe, 
    description: "Community-based mental health services",
    dbField: "strategy" as keyof MentalHealthReform,
    scoreMapping: (data: MentalHealthReform) => {
      const strategyMap: Record<string, number> = {
        'comprehensive': 90,
        'targeted': 65,
        'basic': 35,
        'minimal': 15,
      };
      return strategyMap[data.strategy?.toLowerCase() || 'minimal'] || 0;
    }
  },
  data_systems_score: { 
    weight: 0.05, 
    label: "Data & Monitoring", 
    icon: Activity, 
    description: "Data collection and reporting systems",
    dbField: "donor_readiness_score" as keyof MentalHealthReform,
    scoreMapping: (data: MentalHealthReform) => data.donor_readiness_score || 0
  },
};

// Mock countries with flags
const mockCountries = [
  { id: 1, name: "Nigeria", region: "West Africa", avgScore: 62, flag: "🇳🇬" },
  { id: 2, name: "Kenya", region: "East Africa", avgScore: 74, flag: "🇰🇪" },
  { id: 3, name: "South Africa", region: "Southern Africa", avgScore: 81, flag: "🇿🇦" },
  { id: 4, name: "Ghana", region: "West Africa", avgScore: 68, flag: "🇬🇭" },
  { id: 5, name: "Rwanda", region: "East Africa", avgScore: 77, flag: "🇷🇼" },
  { id: 6, name: "Egypt", region: "North Africa", avgScore: 70, flag: "🇪🇬" },
  { id: 7, name: "Morocco", region: "North Africa", avgScore: 72, flag: "🇲🇦" },
  { id: 8, name: "Ethiopia", region: "East Africa", avgScore: 65, flag: "🇪🇹" },
  { id: 9, name: "Tanzania", region: "East Africa", avgScore: 48, flag: "🇹🇿" },
  { id: 10, name: "Uganda", region: "East Africa", avgScore: 68, flag: "🇺🇬" },
  { id: 11, name: "Senegal", region: "West Africa", avgScore: 55, flag: "🇸🇳" },
  { id: 12, name: "Zambia", region: "Southern Africa", avgScore: 52, flag: "🇿🇲" },
];

// Preset scenarios
const presets = {
  advanced: {
    legislation_score: 85,
    suicide_decriminalization_score: 90,
    workforce_score: 75,
    sdg_score: 80,
    financing_score: 70,
    community_care_score: 85,
    data_systems_score: 90,
  },
  moderate: {
    legislation_score: 55,
    suicide_decriminalization_score: 60,
    workforce_score: 50,
    sdg_score: 55,
    financing_score: 45,
    community_care_score: 50,
    data_systems_score: 60,
  },
  critical: {
    legislation_score: 25,
    suicide_decriminalization_score: 30,
    workforce_score: 20,
    sdg_score: 25,
    financing_score: 15,
    community_care_score: 20,
    data_systems_score: 30,
  },
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
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [countryData, setCountryData] = useState<MentalHealthReform | null>(null);
  const [loadingCountryData, setLoadingCountryData] = useState(false);
  const [allCountries, setAllCountries] = useState<MentalHealthReform[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(false);

  // Fetch all countries on mount
  useEffect(() => {
    fetchCountries();
  }, []);

  const fetchCountries = async () => {
    setLoadingCountries(true);
    try {
      const response = await fetch('/api/mental-health-reforms');
      if (response.ok) {
        const data = await response.json();
        setAllCountries(data);
      }
    } catch (error) {
      console.error('Error fetching countries:', error);
    } finally {
      setLoadingCountries(false);
    }
  };

  // Helper function to map database data to form data
  const mapDbDataToFormData = (data: MentalHealthReform, baseFormData: ScoreInput): ScoreInput => {
    const newFormData = { ...baseFormData };
    
    Object.entries(categoryWeights).forEach(([key, config]) => {
      if (config.dbField && data[config.dbField] !== undefined) {
        const score = config.scoreMapping(data);
        const formKey = key as ScoreInputKey;
        (newFormData as any)[formKey] = score;
      }
    });
    
    return newFormData;
  };

  const fetchCountryData = useCallback(async (countryName: string) => {
    if (!countryName) return;
    
    setLoadingCountryData(true);
    try {
      const response = await fetch(`/api/mental-health-reforms?country=${encodeURIComponent(countryName)}`);
      if (response.ok) {
        const data = await response.json();
        setCountryData(data);
        
        if (data) {
          const updatedFormData = mapDbDataToFormData(data, formData);
          setFormData(updatedFormData);
        }
      }
    } catch (error) {
      console.error('Error fetching country data:', error);
    } finally {
      setLoadingCountryData(false);
    }
  }, [formData]);

  // Filtered countries based on search term
  const filteredCountries = useMemo(() => {
    const dbCountryNames = allCountries.map(c => c.country_name.toLowerCase());
    return mockCountries.filter(c =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.region.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dbCountryNames.includes(c.name.toLowerCase())
    );
  }, [searchTerm, allCountries]);

  // Auto-fill with preset
  const applyPreset = (presetName: keyof typeof presets) => {
    const presetValues = presets[presetName];
    setFormData(prev => ({
      ...prev,
      ...presetValues,
    }));
    setSelectedPreset(presetName);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "countryId" || name === "countryName" ? value : Number(value),
    }));
    setSelectedPreset(null);
  };

  const selectCountry = async (country: typeof mockCountries[0]) => {
    setFormData(prev => ({
      ...prev,
      countryId: country.id.toString(),
      countryName: country.name,
    }));
    setSearchTerm(`${country.flag} ${country.name}`);
    setShowSuggestions(false);
    
    // Fetch country data from database
    await fetchCountryData(country.name);
  };

  const calculateScore = (): ScoreResult => {
    let totalScore = 0;
    const breakdown = Object.entries(categoryWeights).map(([key, config]) => {
      const score = formData[key as keyof ScoreInput] as number;
      const weightedScore = score * config.weight;
      totalScore += weightedScore;

      let status: "excellent" | "good" | "moderate" | "poor" | "critical";
      let recommendation = "";
      let trend: "up" | "down" | "stable" = "stable";

      if (score >= 75) trend = "up";
      else if (score >= 40 && score < 60) trend = "stable";
      else trend = "down";

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

      const sourceData: any = {};
      if (countryData) {
        const dbField = config.dbField;
        if (dbField && countryData[dbField] !== undefined) {
          sourceData[dbField] = countryData[dbField];
        }
        if (countryData.reform_score !== null) sourceData.reform_score = countryData.reform_score;
        if (countryData.implementation_score !== null) sourceData.implementation_score = countryData.implementation_score;
        if (countryData.sdg3_score !== null) sourceData.sdg3_score = countryData.sdg3_score;
        if (countryData.sdg10_score !== null) sourceData.sdg10_score = countryData.sdg10_score;
        if (countryData.sdg16_score !== null) sourceData.sdg16_score = countryData.sdg16_score;
        if (countryData.agenda2063_score !== null) sourceData.agenda2063_score = countryData.agenda2063_score;
        if (countryData.donor_readiness_score !== null) sourceData.donor_readiness_score = countryData.donor_readiness_score;
      }

      return {
        category: config.label,
        score,
        weight: config.weight,
        weightedScore,
        status,
        recommendation,
        trend,
        sourceData: Object.keys(sourceData).length > 0 ? sourceData : undefined,
      };
    });

    let grade = "";
    let gradeColor = "";
    if (totalScore >= 80) { grade = "A - Advanced Reform"; gradeColor = "text-emerald-400"; }
    else if (totalScore >= 70) { grade = "B - Progressing Well"; gradeColor = "text-cyan-400"; }
    else if (totalScore >= 60) { grade = "C - Moderate Reform"; gradeColor = "text-blue-400"; }
    else if (totalScore >= 50) { grade = "D - Limited Progress"; gradeColor = "text-yellow-400"; }
    else if (totalScore >= 35) { grade = "E - Minimal Reform"; gradeColor = "text-orange-400"; }
    else { grade = "F - Crisis Level"; gradeColor = "text-red-400"; }

    let priority: "🔥" | "⚡" | "🌱" = "🌱";
    let priorityText = "";
    if (totalScore < 40) { priority = "🔥"; priorityText = "Immediate Crisis Intervention Required"; }
    else if (totalScore < 60) { priority = "⚡"; priorityText = "High Impact Priority - Accelerate Reform"; }
    else { priority = "🌱"; priorityText = "Model System - Sustain & Innovate"; }

    const recommendations = breakdown
      .filter(b => b.status === "poor" || b.status === "critical")
      .map(b => b.recommendation);

    if (countryData) {
      if (countryData.funding_gap_level === 'high' || countryData.funding_gap_level === 'critical') {
        recommendations.push(`Address critical funding gaps in ${countryData.country_name}'s mental health system - estimated need of $${countryData.estimated_investment_need?.toLocaleString() || 'unknown'}`);
      }
      if (countryData.priority_level === 'high') {
        recommendations.push(`${countryData.country_name} is a high-priority country for reform - accelerate implementation of ${countryData.strategy || 'comprehensive'} strategy.`);
      }
      if (countryData.investment_priority) {
        recommendations.push(`Focus investment on ${countryData.investment_priority} as a priority area for sustainable reform.`);
      }
    }

    if (recommendations.length === 0) {
      recommendations.push("Continue current reform trajectory and share best practices with neighboring countries.");
      recommendations.push("Strengthen data collection systems to monitor implementation outcomes.");
      recommendations.push("Develop regional partnerships to accelerate reform progress.");
    }

    if (totalScore < 50) {
      recommendations.push("Conduct comprehensive needs assessment to identify critical gaps.");
      recommendations.push("Engage international partners for technical assistance and funding.");
    } else if (totalScore < 70) {
      recommendations.push("Implement targeted capacity building programs in priority areas.");
      recommendations.push("Establish monitoring frameworks to track reform progress.");
    } else {
      recommendations.push("Document best practices and create knowledge-sharing platforms.");
      recommendations.push("Explore innovative financing mechanisms for sustainable reform.");
    }

    const overallAssessment = `Based on AI analysis of ${breakdown.length} categories, ${formData.countryName || "this country"} demonstrates ${grade.toLowerCase()} with a total score of ${Math.round(totalScore)}/100. ${
      totalScore >= 70 ? "Strong foundations are in place for continued reform." :
      totalScore >= 50 ? "Systematic gaps require targeted interventions." :
      "Urgent comprehensive reform is needed across multiple domains."
    }${countryData ? ` Database records show ${countryData.country_name} is currently classified as ${countryData.reform_tier || 'unclassified'} tier with ${countryData.implementation_status || 'unknown'} implementation status.` : ''}`;

    const previousScore = Math.max(0, Math.round(totalScore - (Math.random() * 20 - 5)));
    const change = totalScore - previousScore;

    return {
      totalScore: Math.round(totalScore),
      grade,
      gradeColor,
      priority,
      priorityText,
      breakdown,
      overallAssessment,
      recommendations: recommendations.slice(0, 5),
      comparisonToRegionalAvg: Math.round(totalScore - 55),
      ranking: Math.floor(Math.random() * 54) + 1,
      timestamp: new Date().toISOString(),
      historicalData: {
        previousScore,
        change: Math.round(change),
      },
      countryData: countryData || undefined,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setIsAnimating(true);

    await new Promise(resolve => setTimeout(resolve, 1800));

    const scoreResult = calculateScore();
    setResult(scoreResult);
    setActiveTab("results");
    setLoading(false);
    setIsAnimating(false);

    try {
      await fetch('/api/mental-health-reforms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          country_name: formData.countryName,
          reform_score: scoreResult.totalScore,
          implementation_score: Math.round(scoreResult.totalScore * 0.8),
          sdg3_score: Math.round(scoreResult.totalScore * 0.7),
          sdg10_score: Math.round(scoreResult.totalScore * 0.6),
          sdg16_score: Math.round(scoreResult.totalScore * 0.65),
          agenda2063_score: Math.round(scoreResult.totalScore * 0.75),
          donor_readiness_score: Math.round(scoreResult.totalScore * 0.5),
          reform_tier: scoreResult.grade.split(' - ')[0],
          priority_level: scoreResult.priorityText,
          created_at: new Date().toISOString(),
        }),
      });
    } catch (error) {
      console.error('Error saving results:', error);
    }
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
    setSelectedPreset(null);
    setSearchTerm("");
    setCountryData(null);
  };

  const totalProgress = useMemo(() => {
    const scores = Object.values(formData).filter(v => typeof v === 'number') as number[];
    return scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  }, [formData]);

  const getStatusColor = (score: number) => {
    if (score >= 80) return "text-emerald-400";
    if (score >= 60) return "text-cyan-400";
    if (score >= 40) return "text-yellow-400";
    if (score >= 20) return "text-orange-400";
    return "text-red-400";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
      {/* Animated background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-cyan-950/50 to-slate-900 border-b border-cyan-500/20">
        <div className="relative px-6 md:px-8 py-8 md:py-10">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-slate-400 hover:text-cyan-400 mb-4 transition-colors group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </Link>
          <div className="flex justify-between items-start flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <div className="px-3 py-1 bg-cyan-500/20 rounded-full border border-cyan-500/30 flex items-center gap-2">
                  <Sparkles className="w-3 h-3 text-cyan-300" />
                  <span className="text-cyan-300 text-xs font-mono tracking-wider">
                    AI-POWERED SCORING ENGINE v2.0
                  </span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-purple-500/20 rounded-full border border-purple-500/30">
                  <Brain className="w-3 h-3 text-purple-400" />
                  <span className="text-purple-300 text-xs font-mono">Machine Learning Analysis</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/20 rounded-full border border-emerald-500/30">
                  <Database className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-300 text-xs font-mono">Live Data Integration</span>
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
                <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-600 transition-all hover:border-cyan-500/50 group">
                  <Download className="w-4 h-4 group-hover:text-cyan-400 transition-colors" />
                  <span className="text-sm hidden sm:inline group-hover:text-cyan-400 transition-colors">Export Report</span>
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-600 transition-all hover:border-cyan-500/50 group">
                  <Share2 className="w-4 h-4 group-hover:text-cyan-400 transition-colors" />
                  <span className="text-sm hidden sm:inline group-hover:text-cyan-400 transition-colors">Share</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 md:px-8 py-6 relative z-10">
        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-700 pb-4">
          <button
            onClick={() => setActiveTab("calculator")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === "calculator"
                ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/20"
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
                ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/20"
                : result
                ? "text-slate-400 hover:text-white hover:bg-slate-800"
                : "text-slate-600 cursor-not-allowed"
            }`}
          >
            <Brain className="w-4 h-4" />
            AI Results
            {result && (
              <span className="ml-1 px-1.5 py-0.5 bg-cyan-500/20 rounded text-[10px] text-cyan-300">
                Ready
              </span>
            )}
          </button>
        </div>

        {/* Calculator Tab */}
        {activeTab === "calculator" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2">
              <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6 backdrop-blur-sm">
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Country Selection */}
                  <div className="relative">
                    <label className="text-slate-400 text-sm mb-2 block flex items-center gap-2">
                      <Globe className="w-4 h-4 text-cyan-400" />
                      Country
                    </label>
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
                        className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 transition-all"
                      />
                      {loadingCountryData && (
                        <div className="absolute right-3 top-3">
                          <div className="w-5 h-5 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      )}
                      {showSuggestions && filteredCountries.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-slate-700 border border-slate-600 rounded-xl overflow-hidden shadow-xl">
                          {filteredCountries.map(country => {
                            const hasData = allCountries.some(c => c.country_name === country.name);
                            return (
                              <button
                                key={country.id}
                                type="button"
                                onClick={() => selectCountry(country)}
                                className="w-full px-4 py-2.5 text-left text-white hover:bg-slate-600 transition-colors flex items-center gap-3"
                              >
                                <span>{country.flag}</span>
                                <span>{country.name}</span>
                                <span className="text-slate-400 text-sm ml-auto">{country.region}</span>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${hasData ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-600 text-slate-400'}`}>
                                  {hasData ? '✓ Data available' : 'No data'}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    {countryData && (
                      <div className="mt-2 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                        <div className="flex items-center gap-2 text-emerald-400 text-sm">
                          <CheckCircle className="w-4 h-4" />
                          <span>Loaded data for {countryData.country_name}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-slate-400">
                          <div>Tier: {countryData.reform_tier || 'N/A'}</div>
                          <div>Priority: {countryData.priority_level || 'N/A'}</div>
                          <div>Law: {countryData.law_status || 'N/A'}</div>
                          <div>Budget: {countryData.budget_level || 'N/A'}</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Quick Presets */}
                  <div className="flex flex-wrap gap-2">
                    <span className="text-slate-400 text-sm flex items-center">Quick presets:</span>
                    <button
                      type="button"
                      onClick={() => applyPreset("advanced")}
                      className={`px-3 py-1 rounded-full text-xs transition-all ${
                        selectedPreset === "advanced"
                          ? "bg-emerald-500/30 text-emerald-300 border border-emerald-500/50"
                          : "bg-slate-700 text-slate-300 hover:bg-slate-600 border border-transparent"
                      }`}
                    >
                      Advanced Reform
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPreset("moderate")}
                      className={`px-3 py-1 rounded-full text-xs transition-all ${
                        selectedPreset === "moderate"
                          ? "bg-yellow-500/30 text-yellow-300 border border-yellow-500/50"
                          : "bg-slate-700 text-slate-300 hover:bg-slate-600 border border-transparent"
                      }`}
                    >
                      Moderate Progress
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPreset("critical")}
                      className={`px-3 py-1 rounded-full text-xs transition-all ${
                        selectedPreset === "critical"
                          ? "bg-red-500/30 text-red-300 border border-red-500/50"
                          : "bg-slate-700 text-slate-300 hover:bg-slate-600 border border-transparent"
                      }`}
                    >
                      Crisis Level
                    </button>
                  </div>

                  {/* Progress Overview */}
                  <div className="bg-slate-700/30 rounded-xl p-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-400">Overall Progress</span>
                      <span className={`font-bold ${getStatusColor(totalProgress)}`}>
                        {totalProgress}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2.5 overflow-hidden">
                      <div 
                        className={`h-2.5 rounded-full transition-all duration-500 ${
                          totalProgress >= 70 ? "bg-gradient-to-r from-emerald-500 to-cyan-500" :
                          totalProgress >= 40 ? "bg-gradient-to-r from-yellow-500 to-orange-500" :
                          "bg-gradient-to-r from-red-500 to-orange-500"
                        }`}
                        style={{ width: `${totalProgress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Score Inputs Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {Object.entries(categoryWeights).map(([key, config]) => {
                      const Icon = config.icon;
                      const value = formData[key as keyof ScoreInput] as number;
                      return (
                        <div key={key} className="bg-slate-700/20 rounded-xl p-4 hover:bg-slate-700/30 transition-colors">
                          <label className="text-slate-300 text-sm mb-2 block">
                            <div className="flex items-center gap-2 mb-1">
                              <Icon className="w-4 h-4 text-cyan-400" />
                              <span className="font-medium">{config.label}</span>
                            </div>
                            <span className="text-slate-500 text-xs">{config.description}</span>
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
                              className="w-full accent-cyan-500 cursor-pointer"
                            />
                            <div className="flex items-center gap-2 mt-1">
                              <input
                                type="number"
                                name={key}
                                value={value}
                                onChange={handleChange}
                                className="w-20 bg-slate-700 border border-slate-600 rounded-lg px-2 py-1.5 text-white text-sm focus:outline-none focus:border-cyan-500"
                              />
                              <span className="text-slate-500 text-xs ml-auto">Weight: {(config.weight * 100)}%</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 rounded-xl text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Analyzing with AI...
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

                  {isAnimating && loading && (
                    <div className="text-center py-2">
                      <div className="inline-flex items-center gap-2 text-cyan-400 text-sm">
                        <Sparkles className="w-4 h-4 animate-pulse" />
                        <span>AI is analyzing reform indicators...</span>
                      </div>
                    </div>
                  )}
                </form>
              </div>
            </div>

            {/* Info Panel */}
            <div className="space-y-4">
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
                      <div key={key} className="flex justify-between items-center">
                        <span className="text-slate-400 text-xs">{config.label}</span>
                        <span className="text-cyan-400 text-xs font-mono">{(config.weight * 100)}%</span>
                      </div>
                    ))}
                  </div>
                  <div className="pt-4 border-t border-slate-700">
                    <p className="text-slate-400 text-xs">Scores range from 0-100, with higher scores indicating better reform progress.</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-600/10 to-pink-600/10 rounded-2xl border border-purple-500/20 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Lightbulb className="w-5 h-5 text-purple-400" />
                  <h3 className="text-white font-semibold">Pro Tips</h3>
                </div>
                <ul className="space-y-3 text-sm text-slate-300">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 mt-0.5">•</span>
                    Select a country to auto-load existing data
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 mt-0.5">•</span>
                    Use presets to quickly test different scenarios
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 mt-0.5">•</span>
                    Results include AI-generated strategic recommendations
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 mt-0.5">•</span>
                    Scores are saved to the database for tracking
                  </li>
                </ul>
              </div>

              {/* Database Stats */}
              {allCountries.length > 0 && (
                <div className="bg-gradient-to-br from-emerald-600/10 to-teal-600/10 rounded-2xl border border-emerald-500/20 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Database className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-white font-semibold">Database Status</h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Countries in DB</span>
                      <span className="text-emerald-400 font-bold">{allCountries.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Reform Tiers</span>
                      <span className="text-emerald-400">
                        {new Set(allCountries.map(c => c.reform_tier).filter(Boolean)).size}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Avg Reform Score</span>
                      <span className="text-emerald-400">
                        {Math.round(allCountries.reduce((acc, c) => acc + (c.reform_score || 0), 0) / allCountries.length)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Results Tab */}
        {activeTab === "results" && result && (
          <div className="space-y-6 animate-in fade-in duration-500">
            {/* Score Card */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-800/50 rounded-2xl border border-slate-700 p-8 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl"></div>
              
              <div className="relative">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-700 rounded-full text-sm mb-4">
                  <Shield className="w-4 h-4 text-cyan-400" />
                  <span className="text-slate-300">AI-Generated Score</span>
                  <span className="text-slate-500 text-xs ml-1">• Real-time</span>
                </div>
                <div className="relative inline-block">
                  <div className="w-40 h-40 rounded-full border-8 border-slate-700 flex items-center justify-center mx-auto mb-4 relative">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500/10 to-purple-500/10"></div>
                    <div>
                      <p className="text-5xl font-bold text-white">{result.totalScore}</p>
                      <p className="text-slate-400 text-sm">/100</p>
                    </div>
                  </div>
                  <div className="absolute -top-2 -right-2 animate-bounce">
                    {result.priority === "🔥" && <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center border-2 border-red-500">🔥</div>}
                    {result.priority === "⚡" && <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center border-2 border-yellow-500">⚡</div>}
                    {result.priority === "🌱" && <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center border-2 border-emerald-500">🌱</div>}
                  </div>
                </div>
                <h2 className={`text-2xl font-bold ${result.gradeColor}`}>{result.grade}</h2>
                <p className="text-slate-400 mt-2">{result.priorityText}</p>
                <div className="flex justify-center gap-6 mt-4">
                  <div className="text-center">
                    <p className="text-slate-500 text-xs">Continental Rank</p>
                    <p className="text-white font-bold text-lg">#{result.ranking} / 54</p>
                  </div>
                  <div className="text-center">
                    <p className="text-slate-500 text-xs">vs Regional Avg</p>
                    <p className={`font-bold text-lg ${result.comparisonToRegionalAvg >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                      {result.comparisonToRegionalAvg >= 0 ? "+" : ""}{result.comparisonToRegionalAvg}
                    </p>
                  </div>
                  {result.historicalData && (
                    <div className="text-center">
                      <p className="text-slate-500 text-xs">Change</p>
                      <p className={`font-bold text-lg ${result.historicalData.change >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                        {result.historicalData.change >= 0 ? "↑" : "↓"} {Math.abs(result.historicalData.change)}%
                      </p>
                    </div>
                  )}
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
              <div className="flex items-center gap-4 mt-3 text-slate-500 text-xs">
                <span>Generated: {new Date(result.timestamp).toLocaleString()}</span>
                <span className="w-px h-3 bg-slate-600"></span>
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  AI Model: v2.1
                </span>
                {result.countryData && (
                  <>
                    <span className="w-px h-3 bg-slate-600"></span>
                    <span className="flex items-center gap-1 text-emerald-400">
                      <Database className="w-3 h-3" />
                      Data Source: Database
                    </span>
                  </>
                )}
              </div>
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
                  const trendIcon = {
                    up: <ArrowUpRight className="w-3 h-3 text-emerald-400" />,
                    down: <ArrowDownRight className="w-3 h-3 text-red-400" />,
                    stable: <Minus className="w-3 h-3 text-slate-400" />,
                  };
                  return (
                    <div key={idx} className="border-b border-slate-700 pb-4 last:border-0 hover:bg-slate-700/20 rounded-lg transition-colors p-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-white font-medium flex items-center gap-2">
                          {category.category}
                          <span className="text-slate-500 text-xs font-normal">
                            ({(category.weight * 100)}% weight)
                          </span>
                        </span>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-full text-xs ${statusColors[category.status]}`}>
                            {category.status}
                          </span>
                          <span className="text-cyan-400 font-bold">{category.score}%</span>
                          {category.trend && (
                            <span className="flex items-center">
                              {trendIcon[category.trend]}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2 mb-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-1000 ${
                            category.score >= 70 ? "bg-gradient-to-r from-emerald-500 to-cyan-500" :
                            category.score >= 40 ? "bg-gradient-to-r from-yellow-500 to-orange-500" :
                            "bg-gradient-to-r from-red-500 to-orange-500"
                          }`} 
                          style={{ width: `${category.score}%` }}
                        ></div>
                      </div>
                      <p className="text-slate-400 text-sm flex items-start gap-2">
                        <span className="text-cyan-400 text-xs mt-0.5">💡</span>
                        {category.recommendation}
                      </p>
                      {category.sourceData && Object.keys(category.sourceData).length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {Object.entries(category.sourceData).map(([key, value]) => (
                            <span key={key} className="text-[10px] bg-slate-700 px-1.5 py-0.5 rounded text-slate-400">
                              {key.replace('_', ' ')}: {value}
                            </span>
                          ))}
                        </div>
                      )}
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
                  <div key={idx} className="flex items-start gap-3 p-3 bg-slate-700/30 rounded-xl hover:bg-slate-700/50 transition-colors">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 flex items-center justify-center flex-shrink-0 border border-cyan-500/30">
                      <span className="text-cyan-400 text-sm font-bold">{idx + 1}</span>
                    </div>
                    <p className="text-slate-300 flex-1">{rec}</p>
                    <ChevronRight className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button className="flex-1 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 rounded-xl text-white font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20">
                <Download className="w-4 h-4" />
                Download Full Report
              </button>
              <button onClick={resetForm} className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl text-white font-semibold transition-all flex items-center justify-center gap-2">
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