// app/funding-requests/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  Check,
  XCircle,
  Edit,
  Mail,
  Phone,
  Building2,
  FileText,
  ExternalLink,
  Copy,
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
  status: "Open" | "Funded" | "Closed" | "Pending" | "Approved" | "Rejected";
  created_at: string;
  deadline: string;
  updated_at?: string;
  researcher: {
    full_name: string;
    organization: string;
    email: string;
    phone?: string;
    bio?: string;
  };
}

interface Transaction {
  id: string;
  donor_id: string;
  amount: number;
  platform_fee: number;
  researcher_amount: number;
  status: string;
  created_at: string;
  donor: {
    full_name: string;
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
  const router = useRouter();
  const [requests, setRequests] = useState<FundingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string>("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<FundingRequest | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [submitting, setSubmitting] = useState(false);
  const [processingAction, setProcessingAction] = useState(false);
  
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
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    if (!token || !userStr) {
      router.push("/login");
      return;
    }

    try {
      const userData = JSON.parse(userStr);
      setUser(userData);
      setUserRole(userData.role || "");
    } catch (error) {
      console.error("Error parsing user data:", error);
      router.push("/login");
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

      // For donors, only show Approved/Open requests
      if (userRole === "donor") {
        query = query.in("status", ["Approved", "Open", "Funded"]);
      }
      // For researchers, show their own requests plus approved ones
      else if (userRole === "researcher") {
        query = query.or(`researcher_id.eq.${user?.id},status.in.(Approved,Open,Funded)`);
      }
      // For admins, show all
      else if (userRole === "Admin") {
        // Show all requests for admin
      }

      const { data, error } = await query;

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error("Error fetching funding requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async (requestId: string) => {
    try {
      const { data, error } = await supabase
        .from("transactions")
        .select(`
          *,
          donor:donor_id (
            full_name,
            email
          )
        `)
        .eq("funding_request_id", requestId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  const handleViewDetails = async (request: FundingRequest) => {
    setSelectedRequest(request);
    await fetchTransactions(request.id);
    setShowDetailModal(true);
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("Please login to create a funding request");
      return;
    }

    if (!formData.title || !formData.description || !formData.amount_needed || !formData.country || !formData.category || !formData.deadline) {
      alert("Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    try {
      // First, verify the user exists in the users table
      const { data: userExists, error: userCheckError } = await supabase
        .from("users")
        .select("id, role")
        .eq("id", user.id)
        .single();

      if (userCheckError) {
        console.error("User check error:", userCheckError);
        alert("Your account is not properly set up. Please contact support.");
        setSubmitting(false);
        return;
      }

      console.log("User exists:", userExists);

      // Check if user has researcher role
      if (userExists.role !== "Researcher" && userExists.role !== "Admin") {
        alert("Only researchers can create funding requests");
        setSubmitting(false);
        return;
      }

      const requestData = {
        researcher_id: user.id,
        title: formData.title,
        description: formData.description,
        amount_needed: parseFloat(formData.amount_needed),
        amount_raised: 0,
        country: formData.country,
        category: formData.category,
        status: "Pending",
        deadline: formData.deadline,
      };

      console.log("Inserting funding request:", requestData);

      const { data, error } = await supabase
        .from("funding_requests")
        .insert(requestData)
        .select();

      if (error) {
        console.error("Supabase error:", error);
        
        if (error.code === "23503") {
          alert("Foreign key violation: Your user ID is not valid. Please contact support.");
        } else if (error.code === "23505") {
          alert("Duplicate entry. Please try again.");
        } else {
          alert(`Error: ${error.message}`);
        }
        setSubmitting(false);
        return;
      }

      console.log("Funding request created:", data);

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
      alert("Funding request submitted for admin approval!");
    } catch (error) {
      console.error("Error creating request:", error);
      alert("An unexpected error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAdminAction = async (requestId: string, action: "approve" | "reject" | "cancel") => {
    if (!confirm(`Are you sure you want to ${action} this funding request?`)) return;

    setProcessingAction(true);
    try {
      let status = "";
      let message = "";

      switch (action) {
        case "approve":
          status = "Approved";
          message = "Funding request approved successfully!";
          break;
        case "reject":
          status = "Rejected";
          message = "Funding request rejected.";
          break;
        case "cancel":
          status = "Closed";
          message = "Funding request cancelled.";
          break;
        default:
          throw new Error("Invalid action");
      }

      const { error } = await supabase
        .from("funding_requests")
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq("id", requestId);

      if (error) throw error;

      alert(message);
      setShowDetailModal(false);
      fetchRequests();
    } catch (error) {
      console.error(`Error ${action}ing request:`, error);
      alert(`Failed to ${action} request. Please try again.`);
    } finally {
      setProcessingAction(false);
    }
  };

  const handleFundRequest = async (requestId: string, amount: number) => {
    if (!user) {
      alert("Please login to fund projects");
      return;
    }

    if (userRole !== "Donor" && userRole !== "Admin") {
      alert("Only donors and administrators can fund projects");
      return;
    }

    const investmentAmount = prompt(`Enter investment amount for this project (max $${amount.toLocaleString()}):`);
    if (!investmentAmount) return;

    const amountNum = parseFloat(investmentAmount);
    if (isNaN(amountNum) || amountNum <= 0 || amountNum > amount) {
      alert("Invalid amount");
      return;
    }

    const platformFee = amountNum * 0.05;
    const researcherAmount = amountNum - platformFee;

    try {
      const { error: txError } = await supabase.from("transactions").insert({
        donor_id: user.id,
        funding_request_id: requestId,
        amount: amountNum,
        platform_fee: platformFee,
        researcher_amount: researcherAmount,
        status: "Completed",
      });

      if (txError) throw txError;

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
      if (showDetailModal) {
        await fetchTransactions(requestId);
      }
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
    open: requests.filter(r => r.status === "Open" || r.status === "Approved").length,
    funded: requests.filter(r => r.status === "Funded").length,
    pending: requests.filter(r => r.status === "Pending").length,
    totalAmount: requests.reduce((sum, r) => sum + r.amount_needed, 0),
    raisedAmount: requests.reduce((sum, r) => sum + (r.amount_raised || 0), 0),
  };

  const canCreateRequest = userRole === "Researcher" || userRole === "Admin";
  const canFundProject = userRole === "Donor" || userRole === "Admin";
  const isAdmin = userRole === "Admin";

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
                {isAdmin && (
                  <div className="px-3 py-1 bg-purple-500/20 rounded-full border border-purple-500/30">
                    <span className="text-purple-300 text-xs font-mono tracking-wider">
                      ADMIN MODE
                    </span>
                  </div>
                )}
              </div>
              <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Funding Requests
              </h1>
              <p className="text-slate-300 text-base md:text-lg mt-3 max-w-2xl">
                Discover and fund mental health research projects, community programs, and reform initiatives across Africa.
              </p>
            </div>

            <div className="flex gap-2">
              {canCreateRequest && (
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
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <p className="text-slate-400 text-xs">Total Requests</p>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </div>
          <div className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/20">
            <p className="text-emerald-400 text-xs">Open</p>
            <p className="text-2xl font-bold text-emerald-400">{stats.open}</p>
          </div>
          <div className="bg-cyan-500/10 rounded-xl p-4 border border-cyan-500/20">
            <p className="text-cyan-400 text-xs">Funded</p>
            <p className="text-2xl font-bold text-cyan-400">{stats.funded}</p>
          </div>
          <div className="bg-yellow-500/10 rounded-xl p-4 border border-yellow-500/20">
            <p className="text-yellow-400 text-xs">Pending</p>
            <p className="text-2xl font-bold text-yellow-400">{stats.pending}</p>
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
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Open">Open</option>
            <option value="Funded">Funded</option>
            <option value="Closed">Closed</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        {/* Funding Requests Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredRequests.map((request) => {
            const progress = request.amount_needed > 0 ? (request.amount_raised / request.amount_needed) * 100 : 0;
            
            return (
              <div key={request.id} className="bg-slate-800/50 rounded-2xl border border-slate-700 hover:border-cyan-500/30 transition-all overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      request.status === "Open" || request.status === "Approved" ? "bg-emerald-500/20 text-emerald-400" :
                      request.status === "Funded" ? "bg-cyan-500/20 text-cyan-400" :
                      request.status === "Pending" ? "bg-yellow-500/20 text-yellow-400" :
                      request.status === "Rejected" ? "bg-red-500/20 text-red-400" :
                      "bg-slate-500/20 text-slate-400"
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
                      <span className="text-slate-500">Raised: ${(request.amount_raised / 1000).toFixed(1)}K</span>
                      <span className="text-slate-500">Goal: ${(request.amount_needed / 1000).toFixed(1)}K</span>
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
                    <div className="flex gap-2">
                      {canFundProject && (request.status === "Open" || request.status === "Approved") && (
                        <button
                          onClick={() => handleFundRequest(request.id, request.amount_needed - request.amount_raised)}
                          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-white text-sm transition-colors"
                        >
                          Fund
                        </button>
                      )}
                      <button
                        onClick={() => handleViewDetails(request)}
                        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white text-sm transition-colors flex items-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        Details
                      </button>
                    </div>
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

      {/* Detail Modal */}
      {showDetailModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 overflow-y-auto" onClick={() => setShowDetailModal(false)}>
          <div className="bg-slate-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-700 sticky top-0 bg-slate-800 z-10">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-white">{selectedRequest.title}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      selectedRequest.status === "Open" || selectedRequest.status === "Approved" ? "bg-emerald-500/20 text-emerald-400" :
                      selectedRequest.status === "Funded" ? "bg-cyan-500/20 text-cyan-400" :
                      selectedRequest.status === "Pending" ? "bg-yellow-500/20 text-yellow-400" :
                      selectedRequest.status === "Rejected" ? "bg-red-500/20 text-red-400" :
                      "bg-slate-500/20 text-slate-400"
                    }`}>
                      {selectedRequest.status}
                    </span>
                    <span className="text-slate-500 text-sm flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Deadline: {new Date(selectedRequest.deadline).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <button onClick={() => setShowDetailModal(false)} className="text-slate-400 hover:text-white text-2xl">&times;</button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Admin Actions */}
              {isAdmin && selectedRequest.status === "Pending" && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                  <h3 className="text-yellow-400 font-semibold mb-3 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Admin Review Required
                  </h3>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleAdminAction(selectedRequest.id, "approve")}
                      disabled={processingAction}
                      className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-xl text-white transition-colors flex items-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleAdminAction(selectedRequest.id, "reject")}
                      disabled={processingAction}
                      className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded-xl text-white transition-colors flex items-center gap-2"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                    <button
                      onClick={() => handleAdminAction(selectedRequest.id, "cancel")}
                      disabled={processingAction}
                      className="px-6 py-2 bg-slate-600 hover:bg-slate-700 rounded-xl text-white transition-colors flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                  {processingAction && (
                    <div className="mt-2 text-yellow-400 text-sm flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </div>
                  )}
                </div>
              )}

              {/* Request Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-slate-400 text-sm font-medium mb-1">Description</h3>
                    <p className="text-white">{selectedRequest.description}</p>
                  </div>
                  <div>
                    <h3 className="text-slate-400 text-sm font-medium mb-1">Category</h3>
                    <p className="text-white">{selectedRequest.category}</p>
                  </div>
                  <div>
                    <h3 className="text-slate-400 text-sm font-medium mb-1">Country</h3>
                    <p className="text-white">{selectedRequest.country}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-slate-400 text-sm font-medium mb-1">Funding Goal</h3>
                    <p className="text-2xl font-bold text-cyan-400">${selectedRequest.amount_needed.toLocaleString()}</p>
                  </div>
                  <div>
                    <h3 className="text-slate-400 text-sm font-medium mb-1">Amount Raised</h3>
                    <p className="text-2xl font-bold text-emerald-400">${selectedRequest.amount_raised.toLocaleString()}</p>
                  </div>
                  <div>
                    <h3 className="text-slate-400 text-sm font-medium mb-1">Progress</h3>
                    <div className="w-full bg-slate-700 rounded-full h-3">
                      <div 
                        className="bg-cyan-500 h-3 rounded-full" 
                        style={{ width: `${selectedRequest.amount_needed > 0 ? (selectedRequest.amount_raised / selectedRequest.amount_needed) * 100 : 0}%` }}
                      ></div>
                    </div>
                    <p className="text-slate-400 text-sm mt-1">
                      {selectedRequest.amount_needed > 0 ? ((selectedRequest.amount_raised / selectedRequest.amount_needed) * 100).toFixed(1) : 0}% funded
                    </p>
                  </div>
                </div>
              </div>

              {/* Researcher Info */}
              <div className="bg-slate-700/30 rounded-xl p-4">
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <User className="w-4 h-4 text-cyan-400" />
                  Researcher Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-slate-400 text-sm">Name</p>
                    <p className="text-white">{selectedRequest.researcher?.full_name}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Organization</p>
                    <p className="text-white">{selectedRequest.researcher?.organization}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Email</p>
                    <p className="text-white">{selectedRequest.researcher?.email}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Submitted</p>
                    <p className="text-white">{new Date(selectedRequest.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {/* Transactions */}
              {transactions.length > 0 && (
                <div className="bg-slate-700/30 rounded-xl p-4">
                  <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                    Funding Transactions ({transactions.length})
                  </h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {transactions.map((tx) => (
                      <div key={tx.id} className="bg-slate-800/50 rounded-lg p-3 flex justify-between items-center">
                        <div>
                          <p className="text-white text-sm">{tx.donor?.full_name}</p>
                          <p className="text-slate-400 text-xs">{new Date(tx.created_at).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-emerald-400 font-bold">${tx.amount.toLocaleString()}</p>
                          <p className="text-slate-500 text-xs">Fee: ${tx.platform_fee.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-700">
                {canFundProject && (selectedRequest.status === "Open" || selectedRequest.status === "Approved") && (
                  <button
                    onClick={() => handleFundRequest(selectedRequest.id, selectedRequest.amount_needed - selectedRequest.amount_raised)}
                    className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-xl text-white transition-colors flex items-center gap-2"
                  >
                    <DollarSign className="w-4 h-4" />
                    Fund This Project
                  </button>
                )}
                {isAdmin && selectedRequest.status !== "Pending" && (
                  <>
                    <button
                      onClick={() => handleAdminAction(selectedRequest.id, "cancel")}
                      className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded-xl text-white transition-colors flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Cancel Request
                    </button>
                  </>
                )}
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.origin + `/funding-requests/${selectedRequest.id}`);
                    alert("Link copied to clipboard!");
                  }}
                  className="px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded-xl text-white transition-colors flex items-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Share Link
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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