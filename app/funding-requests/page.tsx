// app/funding-requests/page.tsx
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  Target,
  DollarSign,
  MapPin,
  User,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Search,
  Filter,
  Plus,
  Eye,
  RefreshCw,
  X,
  Loader2,
  TrendingUp,
  Heart,
  Briefcase,
} from "lucide-react";
import Link from "next/link";

interface FundingRequest {
  id: string;
  researcher_id: string;
  title: string;
  description: string;
  amount_needed: number;
  amount_raised: number;
  country: string;
  category: string;
  status: "Open" | "Funded" | "Closed";
  created_at: string;
  deadline: string;
  researcher: {
    full_name: string;
    organization: string;
    email: string;
  };
}

const categories = [
  "Research Study",
  "Community Program",
  "Workforce Training",
  "Infrastructure",
  "Awareness Campaign",
  "Policy Development",
  "Emergency Response",
];

export default function FundingRequestsPage() {
  const [requests, setRequests] = useState<FundingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string>("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    amount_needed: "",
    country: "",
    category: "",
    deadline: "",
  });

  useEffect(() => {
    checkUser();
    fetchRequests();
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

  const fetchRequests = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("funding_requests")
        .select(`
          *,
          researcher:researcher_id (
            full_name,
            organization,
            email
          )
        `)
        .order("created_at", { ascending: false });

      const { data, error } = await query;

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error("Error fetching funding requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSubmitting(true);
    try {
      const { error } = await supabase.from("funding_requests").insert({
        researcher_id: user.id,
        title: formData.title,
        description: formData.description,
        amount_needed: parseFloat(formData.amount_needed),
        amount_raised: 0,
        country: formData.country,
        category: formData.category,
        status: "Open",
        deadline: formData.deadline,
      });

      if (error) throw error;

      setShowCreateModal(false);
      setFormData({
        title: "",
        description: "",
        amount_needed: "",
        country: "",
        category: "",
        deadline: "",
      });
      fetchRequests();
      alert("Funding request created successfully!");
    } catch (error) {
      console.error("Error creating request:", error);
      alert("Failed to create funding request");
    } finally {
      setSubmitting(false);
    }
  };

  const handleFundRequest = async (requestId: string, amount: number) => {
    const investmentAmount = prompt(`Enter investment amount for this project (max $${amount.toLocaleString()}):`);
    if (!investmentAmount) return;

    const amountNum = parseFloat(investmentAmount);
    if (isNaN(amountNum) || amountNum <= 0 || amountNum > amount) {
      alert("Invalid amount");
      return;
    }

    // Calculate platform fee (5%)
    const platformFee = amountNum * 0.05;
    const researcherAmount = amountNum - platformFee;

    try {
      // Create transaction
      const { error: txError } = await supabase.from("transactions").insert({
        donor_id: user?.id,
        funding_request_id: requestId,
        amount: amountNum,
        platform_fee: platformFee,
        researcher_amount: researcherAmount,
        status: "Completed",
      });

      if (txError) throw txError;

      // Update funding request
      const { data: request } = await supabase
        .from("funding_requests")
        .select("amount_raised")
        .eq("id", requestId)
        .single();

      const newAmountRaised = (request?.amount_raised || 0) + amountNum;
      const newStatus = newAmountRaised >= amount ? "Funded" : "Open";

      await supabase
        .from("funding_requests")
        .update({
          amount_raised: newAmountRaised,
          status: newStatus,
        })
        .eq("id", requestId);

      alert(`Successfully invested $${amountNum.toLocaleString()}! Platform fee: $${platformFee.toFixed(2)}`);
      fetchRequests();
    } catch (error) {
      console.error("Error processing investment:", error);
      alert("Failed to process investment");
    }
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.country.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || request.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || request.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const stats = {
    total: requests.length,
    open: requests.filter(r => r.status === "Open").length,
    funded: requests.filter(r => r.status === "Funded").length,
    totalAmount: requests.reduce((sum, r) => sum + r.amount_needed, 0),
    raisedAmount: requests.reduce((sum, r) => sum + (r.amount_raised || 0), 0),
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-300">Loading funding opportunities...</p>
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
                    RESEARCH FUNDING MARKETPLACE
                  </span>
                </div>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Funding Requests
              </h1>
              <p className="text-slate-300 text-base md:text-lg mt-3 max-w-2xl">
                Discover and fund mental health research projects, community programs, and reform initiatives across Africa.
              </p>
            </div>

            <div className="flex gap-2">
              {(userRole === "researcher" || userRole === "admin") && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-xl text-white transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span className="text-sm">Create Request</span>
                </button>
              )}
              <button
                onClick={fetchRequests}
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <p className="text-slate-400 text-xs">Total Requests</p>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </div>
          <div className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/20">
            <p className="text-emerald-400 text-xs">Open Requests</p>
            <p className="text-2xl font-bold text-emerald-400">{stats.open}</p>
          </div>
          <div className="bg-cyan-500/10 rounded-xl p-4 border border-cyan-500/20">
            <p className="text-cyan-400 text-xs">Funded</p>
            <p className="text-2xl font-bold text-cyan-400">{stats.funded}</p>
          </div>
          <div className="bg-purple-500/10 rounded-xl p-4 border border-purple-500/20">
            <p className="text-purple-400 text-xs">Total Value</p>
            <p className="text-xl font-bold text-purple-400">${(stats.totalAmount / 1000).toFixed(0)}K</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by title or country..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white"
          >
            <option value="all">All Categories</option>
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white"
          >
            <option value="all">All Status</option>
            <option value="Open">Open</option>
            <option value="Funded">Funded</option>
            <option value="Closed">Closed</option>
          </select>
        </div>

        {/* Funding Requests Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredRequests.map((request) => {
            const progress = (request.amount_raised / request.amount_needed) * 100;
            
            return (
              <div key={request.id} className="bg-slate-800/50 rounded-2xl border border-slate-700 hover:border-cyan-500/30 transition-all overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      request.status === "Open" ? "bg-emerald-500/20 text-emerald-400" :
                      request.status === "Funded" ? "bg-cyan-500/20 text-cyan-400" :
                      "bg-red-500/20 text-red-400"
                    }`}>
                      {request.status}
                    </span>
                    <span className="text-slate-500 text-xs flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Deadline: {new Date(request.deadline).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2">{request.title}</h3>
                  <p className="text-slate-300 text-sm mb-3 line-clamp-2">{request.description}</p>

                  <div className="flex items-center gap-3 text-sm text-slate-400 mb-4">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {request.country}
                    </span>
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-3 h-3" />
                      {request.category}
                    </span>
                  </div>

                  {/* Funding Progress */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-400">Funding Progress</span>
                      <span className="text-cyan-400">{progress.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div className="bg-cyan-500 h-2 rounded-full" style={{ width: `${progress}%` }}></div>
                    </div>
                    <div className="flex justify-between mt-1 text-xs">
                      <span className="text-slate-500">Raised: ${(request.amount_raised / 1000).toFixed(0)}K</span>
                      <span className="text-slate-500">Goal: ${(request.amount_needed / 1000).toFixed(0)}K</span>
                    </div>
                  </div>

                  {/* Researcher Info */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-700">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center">
                        <User className="w-4 h-4 text-cyan-400" />
                      </div>
                      <div>
                        <p className="text-white text-sm">{request.researcher?.full_name}</p>
                        <p className="text-slate-500 text-xs">{request.researcher?.organization}</p>
                      </div>
                    </div>
                    {userRole === "donor" && request.status === "Open" && (
                      <button
                        onClick={() => handleFundRequest(request.id, request.amount_needed - request.amount_raised)}
                        className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-white text-sm transition-colors"
                      >
                        Fund Project
                      </button>
                    )}
                    {(userRole === "admin" || userRole === "researcher") && (
                      <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white text-sm transition-colors">
                        View Details
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredRequests.length === 0 && (
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-12 text-center">
            <Target className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">No funding requests found</p>
            <p className="text-slate-500 text-sm mt-2">Be the first to create a funding request</p>
          </div>
        )}
      </div>

      {/* Create Funding Request Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto" onClick={() => setShowCreateModal(false)}>
          <div className="bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-700 sticky top-0 bg-slate-800">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Create Funding Request</h2>
                <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white text-2xl">&times;</button>
              </div>
            </div>
            <form onSubmit={handleCreateRequest} className="p-6 space-y-5">
              <div>
                <label className="text-slate-400 text-sm block mb-2">Project Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 text-sm block mb-2">Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={4}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 text-sm block mb-2">Amount Needed ($) *</label>
                  <input
                    type="number"
                    value={formData.amount_needed}
                    onChange={(e) => setFormData({ ...formData, amount_needed: e.target.value })}
                    required
                    placeholder="5000"
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-sm block mb-2">Country *</label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    required
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-sm block mb-2">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white"
                  >
                    <option value="">Select Category</option>
                    {categories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 text-sm block mb-2">Deadline *</label>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    required
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 rounded-xl text-white font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Target className="w-4 h-4" />}
                {submitting ? "Creating..." : "Create Funding Request"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}