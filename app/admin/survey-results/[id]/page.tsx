// app/admin/survey-results/[id]/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { calculateSurveyStats } from "@/lib/survey-analytics";
import Link from "next/link";
import {
  ArrowLeft,
  BarChart3,
  Download,
  FileText,
  Users,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  TrendingUp,
  Filter,
  Search,
  ChevronDown,
  ChevronRight,
  FileSpreadsheet,
  FileJson,
  List,
  Printer,
  Bug,
} from "lucide-react";

interface Survey {
  id: string;
  title: string;
  description: string;
  category: string;
  type: string;
  questions: any;
  metadata: any;
  created_at: string;
  status: string;
}

interface SurveyResponse {
  id: string;
  user_id: string;
  survey_id: string;
  responses: any;
  created_at: string;
  user?: {
    full_name: string;
    email: string;
  };
}

interface QuestionAnalysis {
  questionId: string;
  questionLabel: string;
  questionType: string;
  totalResponses: number;
  responseDistribution: {
    value: string | number;
    count: number;
    percentage: number;
  }[];
  average?: number;
  min?: number;
  max?: number;
  median?: number;
  textResponses?: string[];
}

interface SurveyAnalytics {
  totalResponses: number;
  uniqueRespondents: number;
  completionRate: number;
  averageTimeToComplete: number;
  responseRate: number;
  questionAnalytics: QuestionAnalysis[];
  demographicBreakdown: {
    age_groups: { [key: string]: number };
    genders: { [key: string]: number };
    countries: { [key: string]: number };
  };
  timeline: {
    date: string;
    responses: number;
  }[];
}

export default function SurveyResultsPage() {
  const params = useParams();
  const router = useRouter();
  const surveyId = typeof params?.id === "string" ? params.id : "";

  const [user, setUser] = useState<any>(null);
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [analytics, setAnalytics] = useState<SurveyAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [viewMode, setViewMode] = useState<"summary" | "individual" | "analytics">("summary");
  const [selectedResponse, setSelectedResponse] = useState<SurveyResponse | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState<string>("");
  const [debugInfo, setDebugInfo] = useState<any>({});

  useEffect(() => {
    if (!surveyId) return;
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [surveyId]);

  const checkAuth = async () => {
    try {
      const userStr = localStorage.getItem("user");
      const token = localStorage.getItem("token");

      if (!token || !userStr) {
        router.push("/login");
        return;
      }

      const userData = JSON.parse(userStr);
      setUser(userData);

      if (userData.role !== "Admin") {
        router.push("/dashboard");
        return;
      }
      
      if (!surveyId) return;
      await Promise.all([fetchSurvey(), fetchResponses()]);
    } catch (err) {
      console.error("Auth error:", err);
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  const fetchSurvey = async () => {
    try {
      const { data, error } = await supabase
        .from("surveys")
        .select("*")
        .eq("id", surveyId)
        .single();

      if (error) {
        console.error("Survey fetch error:", error);
        throw error;
      }
      if (!data) {
        console.error("Survey not found");
        return;
      }

      console.log("📊 Survey data:", data);
      console.log("📊 Survey questions type:", typeof data.questions);
      console.log("📊 Survey questions:", JSON.stringify(data.questions).substring(0, 500));

      setSurvey(data);
    } catch (error) {
      console.error("Error fetching survey:", error);
    }
  };

  const fetchResponses = async () => {
    try {
      const { data, error } = await supabase
        .from("survey_responses")
        .select(
          `
          *,
          user:user_id (
            full_name,
            email
          )
        `
        )
        .eq("survey_id", surveyId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Responses fetch error:", error);
        throw error;
      }
      
      console.log(`📊 Found ${data?.length || 0} responses`);
      if (data && data.length > 0) {
        console.log("📊 First response:", JSON.stringify(data[0]).substring(0, 300));
        console.log("📊 First response responses:", JSON.stringify(data[0].responses).substring(0, 300));
      }
      
      setResponses(data || []);
      
      // Process analytics using the library
      if (survey && data) {
        processAnalyticsWithLibrary(data, survey);
      }
    } catch (error) {
      console.error("Error fetching responses:", error);
    }
  };

  // In app/admin/survey-results/[id]/page.tsx - update processAnalyticsWithLibrary

  const processAnalyticsWithLibrary = (responseData: SurveyResponse[], surveyData: Survey) => {
    console.log("🔍 Processing analytics with library...");
    
    // Extract questions from survey - use the same extraction logic as the form
    const extractAllQuestions = (obj: any): any[] => {
      const questions: any[] = [];
      if (!obj) return questions;

      if (Array.isArray(obj)) {
        obj.forEach(item => {
          questions.push(...extractAllQuestions(item));
        });
        return questions;
      }

      if (typeof obj === 'object') {
        if (obj.id && (obj.label || obj.text || obj.question) && obj.visible !== false) {
          questions.push(obj);
        }

        Object.keys(obj).forEach(key => {
          const value = obj[key];
          if (value && typeof value === 'object') {
            if (key === 'questions' || key === 'fields' || key === 'items' || key === 'sections') {
              questions.push(...extractAllQuestions(value));
            } else if (key !== 'id' && key !== 'label' && key !== 'type' &&
                      key !== 'required' && key !== 'options' && key !== 'placeholder' &&
                      key !== 'helpText' && key !== 'min' && key !== 'max' && key !== 'rows' &&
                      key !== 'visible' && key !== 'conditional') {
              questions.push(...extractAllQuestions(value));
            }
          }
        });
      }

      return questions;
    };

    // Try to extract questions
    let extractedQuestions = extractAllQuestions(surveyData.questions);
    console.log("📊 Extracted questions:", extractedQuestions);

    // If no questions found, try to infer from responses
    if (extractedQuestions.length === 0 && responseData.length > 0) {
      console.log("📊 No questions found, inferring from responses");
      const firstResponse = responseData[0];
      if (firstResponse.responses) {
        const responseKeys = Object.keys(firstResponse.responses);
        extractedQuestions = responseKeys.map(key => ({
          id: key,
          label: key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
          type: typeof firstResponse.responses[key] === 'number' ? 'number' : 'text',
          visible: true,
        }));
        console.log("📊 Created questions from response keys:", extractedQuestions);
      }
    }

    // Use the library to calculate stats
    const stats = calculateSurveyStats(responseData, extractedQuestions);
    console.log("📊 Library stats:", stats);

    // If library stats are empty, calculate manually
    if (Object.keys(stats.questionStats).length === 0 && responseData.length > 0) {
      console.log("📊 Library returned no stats, calculating manually");
      // Manual calculation as fallback
      const firstResponse = responseData[0];
      if (firstResponse.responses) {
        const responseKeys = Object.keys(firstResponse.responses);
        responseKeys.forEach(key => {
          stats.questionStats[key] = {
            questionLabel: key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
            responseCount: responseData.filter(r => r.responses?.[key] !== undefined && r.responses?.[key] !== null && r.responses?.[key] !== "").length,
            distribution: {
              type: "text",
              responses: responseData.map(r => String(r.responses?.[key] || "")).filter(v => v !== ""),
            },
          };
        });
        console.log("📊 Manual stats:", stats);
      }
    }

    // Transform stats to match our UI format
    const analyticsData: SurveyAnalytics = {
      totalResponses: stats.totalResponses || 0,
      uniqueRespondents: new Set(responseData.map((r) => r.user_id)).size || 0,
      completionRate: stats.completionRate || 0,
      averageTimeToComplete: stats.averageTime || 0,
      responseRate: 0,
      questionAnalytics: [],
      demographicBreakdown: {
        age_groups: {},
        genders: {},
        countries: {},
      },
      timeline: [],
    };

    // Process question stats
    if (stats.questionStats) {
      Object.entries(stats.questionStats).forEach(([questionId, questionStat]: [string, any]) => {
        const analysis: QuestionAnalysis = {
          questionId: questionId,
          questionLabel: questionStat.questionLabel || questionId,
          questionType: 'text',
          totalResponses: questionStat.responseCount || 0,
          responseDistribution: [],
          textResponses: [],
        };

        if (questionStat.distribution) {
          if (questionStat.distribution.type === 'text') {
            analysis.questionType = 'textarea';
            analysis.textResponses = questionStat.distribution.responses || [];
          } else if (questionStat.distribution.values) {
            analysis.questionType = 'select';
            analysis.responseDistribution = questionStat.distribution.values || [];
          }
        }

        if (questionStat.average !== undefined) {
          analysis.average = questionStat.average;
          analysis.min = questionStat.min;
          analysis.max = questionStat.max;
          analysis.median = questionStat.median;
        }

        analyticsData.questionAnalytics.push(analysis);
      });
    }

    // Process demographics
    responseData.forEach((response) => {
      const resp = response.responses;
      if (resp) {
        if (resp.age_group) {
          analyticsData.demographicBreakdown.age_groups[resp.age_group] =
            (analyticsData.demographicBreakdown.age_groups[resp.age_group] || 0) + 1;
        }
        if (resp.gender) {
          analyticsData.demographicBreakdown.genders[resp.gender] =
            (analyticsData.demographicBreakdown.genders[resp.gender] || 0) + 1;
        }
        if (resp.country) {
          analyticsData.demographicBreakdown.countries[resp.country] =
            (analyticsData.demographicBreakdown.countries[resp.country] || 0) + 1;
        }
      }
    });

    // Timeline
    const dateMap: { [key: string]: number } = {};
    responseData.forEach((response) => {
      const date = new Date(response.created_at).toLocaleDateString();
      dateMap[date] = (dateMap[date] || 0) + 1;
    });
    analyticsData.timeline = Object.entries(dateMap)
      .map(([date, responses]) => ({ date, responses }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    console.log("✅ Analytics processing complete");
    console.log("📊 Final analytics:", analyticsData);
    
    setDebugInfo({
      totalQuestions: Object.keys(stats.questionStats || {}).length,
      questionAnalytics: analyticsData.questionAnalytics.length,
      totalResponses: analyticsData.totalResponses,
      demographics: analyticsData.demographicBreakdown,
    });
    
    setAnalytics(analyticsData);
  };

  const filteredResponses = useMemo(() => {
    let filtered = responses;

    if (searchTerm) {
      filtered = filtered.filter(
        (r) =>
          r.user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          JSON.stringify(r.responses).toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterDate) {
      filtered = filtered.filter(
        (r) =>
          new Date(r.created_at).toDateString() === new Date(filterDate).toDateString()
      );
    }

    return filtered;
  }, [responses, searchTerm, filterDate]);

  const exportResults = async (format: "csv" | "json") => {
    setExporting(true);
    try {
      const data = responses.map((r) => ({
        respondent: r.user?.full_name || "Anonymous",
        email: r.user?.email || "N/A",
        submittedAt: new Date(r.created_at).toLocaleString(),
        ...r.responses,
      }));

      if (format === "csv") {
        const headers = Object.keys(data[0] || {});
        const csvRows = [
          headers.join(","),
          ...data.map((row) =>
            headers
              .map((h) => {
                const val = row[h as keyof typeof row];
                return typeof val === "string" && val.includes(",") ? `"${val}"` : val;
              })
              .join(",")
          ),
        ];
        const csvContent = csvRows.join("\n");
        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${survey?.title}_responses.csv`;
        link.click();
        URL.revokeObjectURL(url);
      } else if (format === "json") {
        const jsonContent = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonContent], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${survey?.title}_responses.json`;
        link.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Error exporting data:", error);
      alert("Failed to export data. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  const renderQuestionAnalysis = (analysis: QuestionAnalysis) => {
    const total = analysis.totalResponses;

    if (total === 0) {
      return (
        <div key={analysis.questionId} className="bg-slate-700/30 rounded-xl p-4">
          <p className="text-slate-400 text-sm">{analysis.questionLabel}</p>
          <p className="text-slate-500 text-xs mt-1">No responses yet</p>
        </div>
      );
    }

    return (
      <div key={analysis.questionId} className="bg-slate-700/30 rounded-xl p-4">
        <h4 className="text-white font-medium text-sm mb-2">{analysis.questionLabel}</h4>
        <p className="text-slate-400 text-xs mb-3">{analysis.totalResponses} responses</p>

        {analysis.questionType === "textarea" || (analysis.textResponses?.length ?? 0) > 0 ? (
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {analysis.textResponses?.slice(0, 10).map((text, idx) => (
              <p key={idx} className="text-slate-300 text-sm border-b border-slate-600/30 pb-2">
                "{text}"
              </p>
            ))}
            {(analysis.textResponses?.length || 0) > 10 && (
              <p className="text-slate-500 text-xs">
                + {(analysis.textResponses?.length || 0) - 10} more responses
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {analysis.responseDistribution.map((dist, idx) => (
              <div key={idx}>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-300">{dist.value}</span>
                  <span className="text-slate-400">
                    {dist.count} ({dist.percentage.toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-1.5">
                  <div
                    className="bg-cyan-500 h-1.5 rounded-full transition-all"
                    style={{ width: `${dist.percentage}%` }}
                  />
                </div>
              </div>
            ))}
            {analysis.average !== undefined && (
              <div className="mt-2 pt-2 border-t border-slate-600/30 grid grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="text-slate-400">Average</span>
                  <p className="text-white font-bold">{analysis.average.toFixed(1)}</p>
                </div>
                <div>
                  <span className="text-slate-400">Min</span>
                  <p className="text-white font-bold">{analysis.min}</p>
                </div>
                <div>
                  <span className="text-slate-400">Max</span>
                  <p className="text-white font-bold">{analysis.max}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-300">Loading survey results...</p>
        </div>
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Survey Not Found</h2>
          <Link href="/admin/surveys" className="text-cyan-400 hover:text-cyan-300">
            Back to Surveys
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
      <div className="px-4 md:px-8 py-6">
        {/* Debug Panel */}
        {process.env.NODE_ENV === "development" && (
          <div className="fixed bottom-4 right-4 bg-slate-900/95 border border-cyan-500/30 rounded-xl p-4 max-w-xs z-50 text-xs">
            <details>
              <summary className="text-cyan-400 font-mono cursor-pointer flex items-center gap-2">
                <Bug className="w-4 h-4" />
                Debug Info
              </summary>
              <div className="mt-2 space-y-1 text-slate-300">
                <p>Questions: {debugInfo.totalQuestions || 0}</p>
                <p>Analytics: {debugInfo.questionAnalytics || 0}</p>
                <p>Responses: {debugInfo.totalResponses || 0}</p>
                <p>Age Groups: {Object.keys(debugInfo.demographics?.age_groups || {}).length}</p>
                <p>Genders: {Object.keys(debugInfo.demographics?.genders || {}).length}</p>
                <p>Countries: {Object.keys(debugInfo.demographics?.countries || {}).length}</p>
                <button 
                  onClick={() => {
                    console.log("🔍 Survey data:", survey);
                    console.log("🔍 Responses:", responses);
                    console.log("🔍 Analytics:", analytics);
                  }}
                  className="mt-2 px-2 py-1 bg-cyan-600 rounded text-white text-xs"
                >
                  Log to Console
                </button>
              </div>
            </details>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
          <div>
            <Link
              href="/admin/surveys"
              className="inline-flex items-center gap-2 text-slate-400 hover:text-cyan-400 mb-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Surveys
            </Link>
            <h1 className="text-2xl font-bold text-white">{survey.title}</h1>
            <p className="text-slate-400 text-sm">{survey.description}</p>
            <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Created: {new Date(survey.created_at).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {responses.length} responses
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs ${
                  survey.status === "published"
                    ? "bg-emerald-500/20 text-emerald-400"
                    : survey.status === "draft"
                    ? "bg-yellow-500/20 text-yellow-400"
                    : "bg-slate-500/20 text-slate-400"
                }`}
              >
                {survey.status}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => exportResults("csv")}
              disabled={exporting}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-xl text-white transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <FileSpreadsheet className="w-4 h-4" />
              {exporting ? "Exporting..." : "CSV"}
            </button>
            <button
              onClick={() => exportResults("json")}
              disabled={exporting}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl text-white transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <FileJson className="w-4 h-4" />
              {exporting ? "Exporting..." : "JSON"}
            </button>
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-xl text-white transition-colors flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
          </div>
        </div>

        {/* View Mode Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-700 pb-4">
          <button
            onClick={() => setViewMode("summary")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              viewMode === "summary"
                ? "bg-cyan-600 text-white"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Summary
          </button>
          <button
            onClick={() => setViewMode("analytics")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              viewMode === "analytics"
                ? "bg-cyan-600 text-white"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Analytics
          </button>
          <button
            onClick={() => setViewMode("individual")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              viewMode === "individual"
                ? "bg-cyan-600 text-white"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <List className="w-4 h-4" />
            Individual Responses
          </button>
        </div>

        {/* Summary View */}
        {viewMode === "summary" && analytics && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-4 h-4 text-cyan-400" />
                  <p className="text-slate-400 text-xs">Total Responses</p>
                </div>
                <p className="text-2xl font-bold text-white">{analytics.totalResponses}</p>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-4 h-4 text-emerald-400" />
                  <p className="text-slate-400 text-xs">Unique Respondents</p>
                </div>
                <p className="text-2xl font-bold text-white">{analytics.uniqueRespondents}</p>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <p className="text-slate-400 text-xs">Completion Rate</p>
                </div>
                <p className="text-2xl font-bold text-emerald-400">
                  {analytics.completionRate.toFixed(1)}%
                </p>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-purple-400" />
                  <p className="text-slate-400 text-xs">Avg. Time to Complete</p>
                </div>
                <p className="text-2xl font-bold text-white">
                  {analytics.averageTimeToComplete.toFixed(0)}s
                </p>
              </div>
            </div>

            {/* Timeline Chart */}
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
              <h3 className="text-white font-semibold text-lg mb-4">Response Timeline</h3>
              <div className="h-48 flex items-end gap-1">
                {analytics.timeline.map((item, idx) => {
                  const maxResponses = Math.max(...analytics.timeline.map((t) => t.responses));
                  const height = maxResponses > 0 ? (item.responses / maxResponses) * 100 : 0;
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center">
                      <div
                        className="w-full bg-cyan-500/30 rounded-t transition-all hover:bg-cyan-500/50"
                        style={{ height: `${height}%` }}
                      />
                      <span className="text-slate-500 text-xs mt-1 rotate-45 origin-top-left">
                        {new Date(item.date).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Demographics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
                <h4 className="text-white font-medium mb-3">Age Groups</h4>
                <div className="space-y-2">
                  {Object.entries(analytics.demographicBreakdown.age_groups).map(([age, count]) => (
                    <div key={age}>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-300">{age}</span>
                        <span className="text-slate-400">{count}</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-1.5">
                        <div
                          className="bg-cyan-500 h-1.5 rounded-full"
                          style={{ width: `${(count / analytics.totalResponses) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
                <h4 className="text-white font-medium mb-3">Gender Distribution</h4>
                <div className="space-y-2">
                  {Object.entries(analytics.demographicBreakdown.genders).map(([gender, count]) => (
                    <div key={gender}>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-300">{gender}</span>
                        <span className="text-slate-400">{count}</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-1.5">
                        <div
                          className="bg-purple-500 h-1.5 rounded-full"
                          style={{ width: `${(count / analytics.totalResponses) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
                <h4 className="text-white font-medium mb-3">Top Countries</h4>
                <div className="space-y-2">
                  {Object.entries(analytics.demographicBreakdown.countries)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5)
                    .map(([country, count]) => (
                      <div key={country}>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-300">{country}</span>
                          <span className="text-slate-400">{count}</span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-1.5">
                          <div
                            className="bg-emerald-500 h-1.5 rounded-full"
                            style={{ width: `${(count / analytics.totalResponses) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Question Analysis */}
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
              <h3 className="text-white font-semibold text-lg mb-4">Question Analysis</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analytics.questionAnalytics.length > 0 ? (
                  analytics.questionAnalytics.map(renderQuestionAnalysis)
                ) : (
                  <div className="col-span-2 text-center py-8 text-slate-400">
                    <AlertCircle className="w-12 h-12 mx-auto mb-3 text-slate-600" />
                    <p>No question data available</p>
                    <p className="text-sm text-slate-500">Check the debug panel for more information</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Analytics View */}
        {viewMode === "analytics" && analytics && (
          <div className="space-y-6">
            {/* AI Insights */}
            <div className="bg-gradient-to-r from-purple-600/10 to-pink-600/10 rounded-2xl border border-purple-500/30 p-6">
              <h3 className="text-white font-semibold text-lg mb-3 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-400" />
                AI-Generated Insights
              </h3>
              <ul className="space-y-2">
                <li className="text-slate-300 text-sm flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5" />
                  <span>
                    Response rate: <strong>{analytics.responseRate.toFixed(1)}%</strong> of target
                    audience responded
                  </span>
                </li>
                <li className="text-slate-300 text-sm flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5" />
                  <span>
                    Completion rate: <strong>{analytics.completionRate.toFixed(1)}%</strong> of
                    respondents completed the survey
                  </span>
                </li>
                {analytics.questionAnalytics.map((q, idx) => {
                  if (q.average !== undefined && q.questionType === "rating") {
                    return (
                      <li key={idx} className="text-slate-300 text-sm flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5" />
                        <span>
                          Average rating for "{q.questionLabel}":{" "}
                          <strong>
                            {q.average.toFixed(1)}/{q.max || 5}
                          </strong>
                        </span>
                      </li>
                    );
                  }
                  return null;
                })}
                <li className="text-slate-300 text-sm flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5" />
                  <span>
                    Most common age group:{" "}
                    <strong>
                      {Object.entries(analytics.demographicBreakdown.age_groups)
                        .sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A"}
                    </strong>
                  </span>
                </li>
                <li className="text-slate-300 text-sm flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5" />
                  <span>
                    Most common country:{" "}
                    <strong>
                      {Object.entries(analytics.demographicBreakdown.countries)
                        .sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A"}
                    </strong>
                  </span>
                </li>
              </ul>
            </div>

            {/* Detailed Question Analytics */}
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
              <h3 className="text-white font-semibold text-lg mb-4">Detailed Question Analytics</h3>
              <div className="space-y-6">
                {analytics.questionAnalytics.length > 0 ? (
                  analytics.questionAnalytics.map((analysis) => (
                    <div key={analysis.questionId} className="bg-slate-700/30 rounded-xl p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="text-white font-medium">{analysis.questionLabel}</h4>
                          <p className="text-slate-400 text-xs">
                            Type: {analysis.questionType} · {analysis.totalResponses} responses
                          </p>
                        </div>
                      </div>

                      {analysis.questionType === "textarea" || (analysis.textResponses?.length ?? 0) > 0 ? (
                        <div className="max-h-48 overflow-y-auto space-y-2">
                          {analysis.textResponses?.map((text, idx) => (
                            <div key={idx} className="bg-slate-800/50 rounded-lg p-2">
                              <p className="text-slate-300 text-sm">"{text}"</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {analysis.responseDistribution.map((dist, idx) => (
                            <div key={idx}>
                              <div className="flex justify-between text-sm">
                                <span className="text-slate-300">{dist.value}</span>
                                <span className="text-slate-400">
                                  {dist.count} ({dist.percentage.toFixed(1)}%)
                                </span>
                              </div>
                              <div className="w-full bg-slate-700 rounded-full h-2">
                                <div
                                  className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all"
                                  style={{ width: `${dist.percentage}%` }}
                                />
                              </div>
                            </div>
                          ))}
                          {analysis.average !== undefined && (
                            <div className="mt-3 pt-3 border-t border-slate-600/30 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                              <div>
                                <span className="text-slate-400 block">Average</span>
                                <span className="text-white font-bold">{analysis.average.toFixed(2)}</span>
                              </div>
                              <div>
                                <span className="text-slate-400 block">Median</span>
                                <span className="text-white font-bold">{analysis.median || "N/A"}</span>
                              </div>
                              <div>
                                <span className="text-slate-400 block">Minimum</span>
                                <span className="text-white font-bold">{analysis.min || "N/A"}</span>
                              </div>
                              <div>
                                <span className="text-slate-400 block">Maximum</span>
                                <span className="text-white font-bold">{analysis.max || "N/A"}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-slate-400">
                    <AlertCircle className="w-12 h-12 mx-auto mb-3 text-slate-600" />
                    <p>No detailed question data available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Individual Responses View */}
        {viewMode === "individual" && (
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap gap-4 bg-slate-800/50 rounded-xl p-4 border border-slate-700">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search responses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
              <div>
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilterDate("");
                }}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white transition-colors"
              >
                Clear Filters
              </button>
            </div>

            {/* Responses List */}
            <div className="space-y-4">
              {filteredResponses.length === 0 ? (
                <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-12 text-center">
                  <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">No responses found</p>
                </div>
              ) : (
                filteredResponses.map((response) => (
                  <div
                    key={response.id}
                    className="bg-slate-800/50 rounded-2xl border border-slate-700 hover:border-cyan-500/30 transition-all p-6"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-white font-medium">
                          {response.user?.full_name || "Anonymous"}
                        </h4>
                        <p className="text-slate-400 text-sm">{response.user?.email || "No email"}</p>
                        <p className="text-slate-500 text-xs mt-1">
                          Submitted: {new Date(response.created_at).toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          setSelectedResponse(selectedResponse?.id === response.id ? null : response)
                        }
                        className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                      >
                        {selectedResponse?.id === response.id ? (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        )}
                      </button>
                    </div>

                    {selectedResponse?.id === response.id && (
                      <div className="mt-4 pt-4 border-t border-slate-700">
                        {Object.entries(response.responses || {})
                          .filter(([_, value]) => value !== undefined && value !== null && value !== "")
                          .map(([key, value]) => (
                            <div key={key} className="bg-slate-700/30 rounded-lg p-3 mb-2">
                              <p className="text-slate-400 text-xs">
                                {key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                              </p>
                              <p className="text-white text-sm">{String(value)}</p>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}