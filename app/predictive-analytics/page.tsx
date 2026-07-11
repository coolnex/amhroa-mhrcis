// app/predictive-analytics/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Radar,
  TrendingUp,
  TrendingDown,
  Target,
  Activity,
  Loader2,
  ArrowLeft,
  BarChart3,
  LineChart,
} from "lucide-react";
import Link from "next/link";
import {
  LineChart as ReLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

interface Country {
  id: number;
  country_name: string;
  reform_score: number;
  implementation_score: number;
  sdg3_score: number;
  sdg10_score: number;
  sdg16_score: number;
  agenda2063_score: number;
  donor_readiness_score: number;
  funding_gap_level: string;
  priority_level: string;
  strategy: string;
}

interface Prediction {
  country: string;
  current_score: number;
  predicted_score: number;
  growth: number;
  confidence: number;
  trend: "up" | "down" | "stable";
}

export default function PredictiveAnalyticsPage() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("mental_health_reforms")
        .select("*")
        .order("country_name", { ascending: true });

      if (error) throw error;

      if (data) {
        setCountries(data);
        
        // Generate predictions based on current scores and trends
        const predictionsData = data.map((c: Country) => {
          const baseScore = c.reform_score || 0;
          // Simple prediction: if implementation is high, predict growth
          const growthFactor = (c.implementation_score || 0) / 100;
          const sdgFactor = ((c.sdg3_score || 0) + (c.sdg10_score || 0) + (c.sdg16_score || 0)) / 300;
          const predictedGrowth = Math.round((growthFactor * 15 + sdgFactor * 10) * 10) / 10;
          
          return {
            country: c.country_name,
            current_score: baseScore,
            predicted_score: Math.min(100, Math.round(baseScore + predictedGrowth)),
            growth: Math.round(predictedGrowth * 10) / 10,
            confidence: Math.min(95, Math.round(65 + (c.donor_readiness_score || 0) * 0.3)),
            trend: predictedGrowth > 5 ? "up" : predictedGrowth < -5 ? "down" : "stable" as "up" | "down" | "stable",
          };
        });
        setPredictions(predictionsData);
      }
    } catch (error) {
      console.error("Error fetching predictive analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const getPredictionColor = (growth: number) => {
    if (growth > 5) return "text-emerald-400";
    if (growth > 0) return "text-cyan-400";
    if (growth > -5) return "text-yellow-400";
    return "text-red-400";
  };

  const getTrendIcon = (trend: string) => {
    if (trend === "up") return <TrendingUp className="w-4 h-4 text-emerald-400" />;
    if (trend === "down") return <TrendingDown className="w-4 h-4 text-red-400" />;
    return <div className="w-4 h-4 text-slate-400">—</div>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-300">Loading predictive analytics...</p>
        </div>
      </div>
    );
  }

  const topPredictions = predictions.sort((a, b) => b.growth - a.growth).slice(0, 10);

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
                    AI PREDICTIVE INTELLIGENCE
                  </span>
                </div>
                <div className="px-2 py-1 bg-yellow-500/20 rounded-full">
                  <span className="text-yellow-400 text-xs">BETA</span>
                </div>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Predictive Analytics
              </h1>
              <p className="text-slate-300 text-base md:text-lg mt-3 max-w-2xl">
                AI-powered reform trajectory forecasting and trend analysis.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-8 py-6">
        {/* Top Predictions */}
        <div className="mb-8">
          <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
            Top 10 Growth Predictions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {topPredictions.map((pred) => (
              <div
                key={pred.country}
                className="bg-slate-800/50 rounded-xl border border-slate-700 p-4 hover:border-cyan-500/30 transition-all"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-white font-semibold text-sm">{pred.country}</h3>
                  <span className={`text-xs font-bold ${getPredictionColor(pred.growth)}`}>
                    +{pred.growth}%
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Current</span>
                  <span className="text-white font-bold">{pred.current_score}%</span>
                </div>
                <div className="flex justify-between items-center text-xs mt-1">
                  <span className="text-slate-400">Predicted</span>
                  <span className="text-cyan-400 font-bold">{pred.predicted_score}%</span>
                </div>
                <div className="flex justify-between items-center text-xs mt-2 pt-2 border-t border-slate-700">
                  <span className="text-slate-400">Confidence</span>
                  <div className="flex items-center gap-1">
                    <div className="w-12 bg-slate-700 rounded-full h-1">
                      <div className="bg-emerald-500 h-1 rounded-full" style={{ width: `${pred.confidence}%` }}></div>
                    </div>
                    <span className="text-emerald-400 text-xs">{pred.confidence}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* All Countries */}
        <div className="bg-slate-800/50 rounded-2xl border border-slate-700 overflow-hidden">
          <div className="p-4 border-b border-slate-700 bg-slate-800/80">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-cyan-400" />
              All Country Predictions
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-900/50">
                <tr>
                  <th className="text-left p-4 text-slate-400 text-sm font-medium">Country</th>
                  <th className="text-left p-4 text-slate-400 text-sm font-medium">Current Score</th>
                  <th className="text-left p-4 text-slate-400 text-sm font-medium">Predicted Score</th>
                  <th className="text-left p-4 text-slate-400 text-sm font-medium">Growth</th>
                  <th className="text-left p-4 text-slate-400 text-sm font-medium">Confidence</th>
                  <th className="text-left p-4 text-slate-400 text-sm font-medium">Trend</th>
                </tr>
              </thead>
              <tbody>
                {predictions.map((pred) => (
                  <tr key={pred.country} className="border-t border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                    <td className="p-4 font-medium text-white">{pred.country}</td>
                    <td className="p-4 text-slate-300">{pred.current_score}%</td>
                    <td className="p-4 text-cyan-400 font-bold">{pred.predicted_score}%</td>
                    <td className={`p-4 font-bold ${getPredictionColor(pred.growth)}`}>
                      {pred.growth > 0 ? "+" : ""}{pred.growth}%
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-700 rounded-full h-1.5">
                          <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${pred.confidence}%` }}></div>
                        </div>
                        <span className="text-slate-300 text-sm">{pred.confidence}%</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        {getTrendIcon(pred.trend)}
                        <span className="text-slate-400 text-sm capitalize">{pred.trend}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-8 bg-gradient-to-r from-cyan-600/10 to-blue-600/10 rounded-2xl border border-cyan-500/20 p-6 text-center">
          <Radar className="w-8 h-8 text-cyan-400 mx-auto mb-3" />
          <h3 className="text-white font-semibold text-lg">Coming Soon</h3>
          <p className="text-slate-400 text-sm">
            Advanced forecasting models, scenario planning, and AI-powered reform simulations.
          </p>
        </div>
      </div>
    </div>
  );
}