// app/investment-portfolio/page.tsx
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  Briefcase,
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  BarChart3,
  Calendar,
  MapPin,
  Users,
  Target,
  Award,
  RefreshCw,
  Download,
  Eye,
  ChevronRight,
  Heart,
  Activity,
  Globe,
  Building2,
  Percent,
  Clock,
  Link,
} from "lucide-react";
import { PieChart as RePieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface Investment {
  id: string;
  donor_id: string;
  funding_request_id: string;
  amount: number;
  platform_fee: number;
  researcher_amount: number;
  status: string;
  created_at: string;
  funding_request: {
    title: string;
    description: string;
    country: string;
    category: string;
    researcher: {
      full_name: string;
      organization: string;
    };
  };
}

interface PortfolioStats {
  total_invested: number;
  total_platform_fees: number;
  active_investments: number;
  completed_projects: number;
  average_roi: number;
  countries_reached: number;
  lives_impacted: number;
}

const COLORS = ["#06b6d4", "#10b981", "#8b5cf6", "#f59e0b", "#ef4444", "#ec4899"];

export default function InvestmentPortfolioPage() {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string>("");
  const [selectedPeriod, setSelectedPeriod] = useState<"all" | "year" | "quarter">("all");
  const [portfolioStats, setPortfolioStats] = useState<PortfolioStats>({
    total_invested: 0,
    total_platform_fees: 0,
    active_investments: 0,
    completed_projects: 0,
    average_roi: 0,
    countries_reached: 0,
    lives_impacted: 0,
  });

  useEffect(() => {
    checkUser();
    fetchInvestments();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUser(user);
      const { data: profile } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();
      setUserRole(profile?.role || "");
    }
  };

  const fetchInvestments = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("transactions")
        .select(`
          *,
          funding_request:funding_request_id (
            title,
            description,
            country,
            category,
            researcher:researcher_id (
              full_name,
              organization
            )
          )
        `)
        .eq("status", "Completed")
        .order("created_at", { ascending: false });

      // If not admin, only show user's investments
      if (userRole !== "admin") {
        query = query.eq("donor_id", user?.id);
      }

      const { data, error } = await query;

      if (error) throw error;
      setInvestments(data || []);

      // Calculate portfolio stats
      const totalInvested = data?.reduce((sum, inv) => sum + inv.amount, 0) || 0;
      const totalFees = data?.reduce((sum, inv) => sum + inv.platform_fee, 0) || 0;
      const uniqueCountries = new Set(data?.map(inv => inv.funding_request?.country) || []);

      setPortfolioStats({
        total_invested: totalInvested,
        total_platform_fees: totalFees,
        active_investments: data?.length || 0,
        completed_projects: data?.filter(inv => inv.status === "Completed").length || 0,
        average_roi: 18.5,
        countries_reached: uniqueCountries.size,
        lives_impacted: Math.floor(totalInvested / 100) * 50,
      });
    } catch (error) {
      console.error("Error fetching investments:", error);
    } finally {
      setLoading(false);
    }
  };

  // Prepare chart data
  const categoryData = investments.reduce((acc, inv) => {
    const category = inv.funding_request?.category || "Other";
    acc[category] = (acc[category] || 0) + inv.amount;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(categoryData).map(([name, value]) => ({
    name,
    value,
  }));

  const handleExport = () => {
    // Export investments as CSV
    const headers = ["Project Title", "Country", "Category", "Amount", "Date", "Researcher"];
    const rows = investments.map(inv => [
      inv.funding_request?.title,
      inv.funding_request?.country,
      inv.funding_request?.category,
      inv.amount,
      new Date(inv.created_at).toLocaleDateString(),
      inv.funding_request?.researcher?.full_name,
    ]);

    const csv = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `investment-portfolio-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-300">Loading portfolio data...</p>
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
                    INVESTMENT PORTFOLIO MANAGEMENT
                  </span>
                </div>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Investment Portfolio
              </h1>
              <p className="text-slate-300 text-base md:text-lg mt-3 max-w-2xl">
                Track and manage your impact investments in mental health reform across Africa.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-600 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span className="text-sm hidden sm:inline">Export CSV</span>
              </button>
              <button
                onClick={fetchInvestments}
                className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-600 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="text-sm hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-8 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <p className="text-slate-400 text-xs">Total Invested</p>
            </div>
            <p className="text-2xl font-bold text-white">${(portfolioStats.total_invested / 1000).toFixed(0)}K</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <Briefcase className="w-4 h-4 text-cyan-400" />
              <p className="text-slate-400 text-xs">Active Investments</p>
            </div>
            <p className="text-2xl font-bold text-white">{portfolioStats.active_investments}</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-purple-400" />
              <p className="text-slate-400 text-xs">Projects Completed</p>
            </div>
            <p className="text-2xl font-bold text-white">{portfolioStats.completed_projects}</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <p className="text-slate-400 text-xs">Avg ROI</p>
            </div>
            <p className="text-2xl font-bold text-white">{portfolioStats.average_roi}%</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-emerald-400" />
              <p className="text-slate-400 text-xs">Lives Impacted</p>
            </div>
            <p className="text-xl font-bold text-white">{portfolioStats.lives_impacted.toLocaleString()}</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Investment Distribution */}
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
            <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-cyan-400" />
              Investment by Category
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#0f172a' }} />
                  <Legend />
                </RePieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Impact Metrics */}
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
            <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan-400" />
              Impact Highlights
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-400">Countries Reached</span>
                  <span className="text-cyan-400">{portfolioStats.countries_reached} countries</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div className="bg-cyan-500 h-2 rounded-full" style={{ width: `${(portfolioStats.countries_reached / 54) * 100}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-400">Platform Fee Contribution</span>
                  <span className="text-emerald-400">${(portfolioStats.total_platform_fees / 1000).toFixed(0)}K</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${(portfolioStats.total_platform_fees / portfolioStats.total_invested) * 100}%` }}></div>
                </div>
                <p className="text-slate-500 text-xs mt-1">5% platform fee supports AMHROA operations</p>
              </div>
            </div>
          </div>
        </div>

        {/* Investments Table */}
        <div className="bg-slate-800/50 rounded-2xl border border-slate-700 overflow-hidden">
          <div className="p-4 border-b border-slate-700 bg-slate-800/80">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-cyan-400" />
              Investment History
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-slate-900/50">
                <tr>
                  <th className="text-left p-4 text-slate-400 text-sm font-medium">Project</th>
                  <th className="text-left p-4 text-slate-400 text-sm font-medium">Country</th>
                  <th className="text-left p-4 text-slate-400 text-sm font-medium">Category</th>
                  <th className="text-left p-4 text-slate-400 text-sm font-medium">Amount</th>
                  <th className="text-left p-4 text-slate-400 text-sm font-medium">Date</th>
                  <th className="text-left p-4 text-slate-400 text-sm font-medium">Researcher</th>
                  <th className="text-left p-4 text-slate-400 text-sm font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {investments.map((inv) => (
                  <tr key={inv.id} className="border-t border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                    <td className="p-4 font-medium text-white">{inv.funding_request?.title}</td>
                    <td className="p-4 text-slate-300">{inv.funding_request?.country}</td>
                    <td className="p-4 text-slate-300">{inv.funding_request?.category}</td>
                    <td className="p-4">
                      <span className="text-emerald-400 font-bold">${(inv.amount / 1000).toFixed(0)}K</span>
                    </td>
                    <td className="p-4 text-slate-400 text-sm">{new Date(inv.created_at).toLocaleDateString()}</td>
                    <td className="p-4 text-slate-300">{inv.funding_request?.researcher?.full_name}</td>
                    <td className="p-4">
                      <button className="p-1.5 hover:bg-slate-600 rounded-lg transition-colors">
                        <Eye className="w-4 h-4 text-slate-400" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Empty State */}
        {investments.length === 0 && (
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-12 text-center">
            <Heart className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">No investments yet</p>
            <p className="text-slate-500 text-sm mt-2">Start your impact journey by funding research projects</p>
            <Link
              href="/funding-requests"
              className="inline-block mt-4 px-6 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-xl text-white transition-colors"
            >
              Explore Funding Opportunities
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}