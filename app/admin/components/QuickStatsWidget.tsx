// app/admin/components/QuickStatsWidget.tsx
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { calculateSurveyStats } from "@/lib/survey-analytics";
import { TrendingUp, Users, CheckCircle, Clock } from "lucide-react";

interface QuickStatsWidgetProps {
  surveyId: string;
}

export function QuickStatsWidget({ surveyId }: QuickStatsWidgetProps) {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [surveyId]);

  const fetchStats = async () => {
    try {
      // Fetch survey
      const { data: survey } = await supabase
        .from("surveys")
        .select("*")
        .eq("id", surveyId)
        .single();

      // Fetch responses
      const { data: responses } = await supabase
        .from("survey_responses")
        .select("*")
        .eq("survey_id", surveyId);

      // Calculate stats using the library
      const calculatedStats = calculateSurveyStats(
        responses || [],
        survey?.questions || []
      );

      setStats(calculatedStats);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-20 bg-slate-700 rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
        <div className="flex items-center gap-2 mb-1">
          <Users className="w-4 h-4 text-cyan-400" />
          <p className="text-slate-400 text-xs">Total Responses</p>
        </div>
        <p className="text-2xl font-bold text-white">{stats?.totalResponses || 0}</p>
      </div>
      <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
        <div className="flex items-center gap-2 mb-1">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <p className="text-slate-400 text-xs">Completion Rate</p>
        </div>
        <p className="text-2xl font-bold text-emerald-400">
          {stats?.completionRate?.toFixed(1) || 0}%
        </p>
      </div>
      <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
        <div className="flex items-center gap-2 mb-1">
          <Clock className="w-4 h-4 text-purple-400" />
          <p className="text-slate-400 text-xs">Avg. Time</p>
        </div>
        <p className="text-2xl font-bold text-white">
          {stats?.averageTime?.toFixed(0) || 0}s
        </p>
      </div>
      <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp className="w-4 h-4 text-blue-400" />
          <p className="text-slate-400 text-xs">Questions Analyzed</p>
        </div>
        <p className="text-2xl font-bold text-blue-400">
          {Object.keys(stats?.questionStats || {}).length}
        </p>
      </div>
    </div>
  );
}