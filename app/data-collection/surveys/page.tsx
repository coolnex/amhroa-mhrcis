// app/data-collection/surveys/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  FileText,
  Search,
  Calendar,
  Activity,
  Heart,
  Target,
  Shield,
  ChevronRight,
  Loader2,
  RefreshCw,
  CheckCircle,
  BarChart3,
  Users,
  TrendingUp,
} from "lucide-react";

interface Survey {
  id: string;
  title: string;
  description: string;
  category: string;
  status: "Active" | "Draft" | "Archived";
  created_at: string;
  response_count?: number;
}

const categoryColors: Record<string, string> = {
  "Health Assessment": "bg-cyan-500/20 text-cyan-400",
  "Community": "bg-emerald-500/20 text-emerald-400",
  "Youth": "bg-purple-500/20 text-purple-400",
  "Healthcare": "bg-blue-500/20 text-blue-400",
  "Governance": "bg-yellow-500/20 text-yellow-400",
  "Rights": "bg-red-500/20 text-red-400",
  "Workforce": "bg-orange-500/20 text-orange-400",
  "Policy": "bg-indigo-500/20 text-indigo-400",
};

export default function SurveysDashboardPage() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [user, setUser] = useState<any>(null);
  const [completedSurveys, setCompletedSurveys] = useState<Set<string>>(new Set());

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUser(user);
      await fetchUserCompletedSurveys(user.id);
    }
    await fetchSurveys();
  };

  const fetchUserCompletedSurveys = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("survey_responses")
        .select("survey_id")
        .eq("user_id", userId);

      if (error) throw error;
      
      const completed = new Set(data?.map(r => r.survey_id) || []);
      setCompletedSurveys(completed);
    } catch (error) {
      console.error("Error fetching completed surveys:", error);
    }
  };

  const fetchSurveys = async () => {
    setLoading(true);
    try {
      // Fetch active surveys only
      const { data, error } = await supabase
        .from("surveys")
        .select("*")
        .eq("status", "Active")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Get response counts for each survey
      if (data && data.length > 0) {
        const surveysWithCounts = await Promise.all(
          data.map(async (survey) => {
            const { count, error: countError } = await supabase
              .from("survey_responses")
              .select("*", { count: "exact", head: true })
              .eq("survey_id", survey.id);

            if (countError) {
              return { ...survey, response_count: 0 };
            }
            return { ...survey, response_count: count || 0 };
          })
        );
        setSurveys(surveysWithCounts);
      } else {
        setSurveys([]);
      }
    } catch (error) {
      console.error("Error fetching surveys:", error);
      setSurveys([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredSurveys = useMemo(() => {
    return surveys.filter(survey => {
      const matchesSearch = survey.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           survey.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === "all" || survey.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [surveys, searchTerm, categoryFilter]);

  const categories = useMemo(() => {
    return ["all", ...new Set(surveys.map(s => s.category).filter(Boolean))];
  }, [surveys]);

  const stats = {
    total: surveys.length,
    categories: new Set(surveys.map(s => s.category)).size,
    totalResponses: surveys.reduce((acc, s) => acc + (s.response_count || 0), 0),
    completionRate: user ? Math.round((completedSurveys.size / surveys.length) * 100) : 0,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-300">Loading surveys...</p>
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
                    DATA COLLECTION & RESEARCH
                  </span>
                </div>
                {user && stats.completionRate > 0 && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-emerald-500/20 rounded-full">
                    <CheckCircle className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400 text-xs">{stats.completionRate}% Complete</span>
                  </div>
                )}
              </div>
              <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Survey Dashboard
              </h1>
              <p className="text-slate-300 text-base md:text-lg mt-3 max-w-2xl">
                Access and participate in continental research surveys, community assessments, and monitoring tools.
              </p>
            </div>

            <button
              onClick={fetchSurveys}
              className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-600 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="text-sm hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-8 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              <p className="text-slate-400 text-xs">Total Surveys</p>
            </div>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </div>
          <div className="bg-purple-500/10 rounded-xl p-4 border border-purple-500/20">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-4 h-4 text-purple-400" />
              <p className="text-purple-400 text-xs">Categories</p>
            </div>
            <p className="text-2xl font-bold text-purple-400">{stats.categories}</p>
          </div>
          <div className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-emerald-400" />
              <p className="text-emerald-400 text-xs">Total Responses</p>
            </div>
            <p className="text-2xl font-bold text-emerald-400">{stats.totalResponses}</p>
          </div>
          <div className="bg-cyan-500/10 rounded-xl p-4 border border-cyan-500/20">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <p className="text-cyan-400 text-xs">Your Progress</p>
            </div>
            <p className="text-2xl font-bold text-cyan-400">{stats.completionRate}%</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search surveys..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat === "all" ? "All Categories" : cat}
              </option>
            ))}
          </select>
        </div>

        {/* Surveys Grid */}
        {filteredSurveys.length === 0 ? (
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-12 text-center">
            <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">No surveys found</p>
            <p className="text-slate-500 text-sm mt-2">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSurveys.map((survey) => {
              const isCompleted = completedSurveys.has(survey.id);
              
              return (
                <div
                  key={survey.id}
                  className={`bg-slate-800/50 rounded-2xl border transition-all overflow-hidden group ${
                    isCompleted 
                      ? "border-emerald-500/30 hover:border-emerald-500/50" 
                      : "border-slate-700 hover:border-cyan-500/30"
                  }`}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`px-2 py-1 rounded-full text-xs ${categoryColors[survey.category] || "bg-slate-500/20 text-slate-400"}`}>
                        {survey.category}
                      </div>
                      {isCompleted ? (
                        <span className="px-2 py-1 rounded-full text-xs bg-emerald-500/20 text-emerald-400 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Completed
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-full text-xs bg-emerald-500/20 text-emerald-400 flex items-center gap-1">
                          <Activity className="w-3 h-3" />
                          Active
                        </span>
                      )}
                    </div>

                    <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">{survey.title}</h3>
                    <p className="text-slate-400 text-sm mb-4 line-clamp-3">{survey.description}</p>

                    <div className="flex items-center justify-between text-slate-500 text-xs mb-6">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(survey.created_at).toLocaleDateString()}
                      </span>
                      {survey.response_count !== undefined && (
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {survey.response_count} responses
                        </span>
                      )}
                    </div>

                    {isCompleted ? (
                      <button
                        disabled
                        className="w-full py-2.5 bg-slate-700 rounded-xl text-slate-400 font-medium cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Already Completed
                      </button>
                    ) : (
                      <Link
                        href={`/data-collection/surveys/${survey.id}`}
                        className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-700 rounded-xl text-white font-medium transition-colors flex items-center justify-center gap-2 group"
                      >
                        Start Survey
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}