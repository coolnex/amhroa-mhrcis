// app/funding-requests/page.tsx
"use client";

// Add missing imports
import { StateSelect } from "@/components/ui/state-select";
import { Info } from "lucide-react";
import { XCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { CountrySelect } from "@/components/ui/country-select";
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
  FileText,
  Send,
  Edit,
  Trash2,
} from "lucide-react";

interface FundingRequest {
  id: string;
  researcher_id: string;
  title: string;
  description: string;
  amount_needed: number;
  amount_raised: number;
  country: string;
  region?: string;
  category: string;
  status: "Pending" | "Approved" | "Open" | "Funded" | "Closed" | "Rejected";
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
  const router = useRouter();
  const [requests, setRequests] = useState<FundingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string>("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [submitting, setSubmitting] = useState(false);
  const [selectedCountryCode, setSelectedCountryCode] = useState("");
  const [selectedCountryName, setSelectedCountryName] = useState("");
  const [selectedRegionName, setSelectedRegionName] = useState("");
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    amount_needed: "",
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

    const userData = JSON.parse(userStr);
    setUser(userData);
    setUserRole(userData.role);
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

      if (userRole !== "Admin") {
        query = query.or(`researcher_id.eq.${user?.id},status.eq.Approved,status.eq.Open`);
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

  const handleCountrySelect = (code: string, name: string) => {
    setSelectedCountryCode(code);
    setSelectedCountryName(name);
    setSelectedRegionName(""); // Reset region when country changes
  };

  const handleRegionSelect = (regionId: string, regionName: string) => {
    setSelectedRegionName(regionName);
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validate country selection
    if (!selectedCountryName) {
      alert("Please select a country");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from("funding_requests").insert({
        researcher_id: user.id,
        title: formData.title,
        description: formData.description,
        amount_needed: parseFloat(formData.amount_needed),
        amount_raised: 0,
        country: selectedCountryName,
        region: selectedRegionName || null,
        category: formData.category,
        status: "Pending",
        deadline: formData.deadline,
      });

      if (error) throw error;

      setShowCreateModal(false);
      setFormData({
        title: "",
        description: "",
        amount_needed: "",
        category: "",
        deadline: "",
      });
      setSelectedCountryCode("");
      setSelectedCountryName("");
      setSelectedRegionName("");
      fetchRequests();
      alert("Funding request submitted for approval!");
    } catch (error) {
      console.error("Error creating request:", error);
      alert("Failed to create funding request");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { color: string; icon: any }> = {
      Pending: { color: "bg-yellow-500/20 text-yellow-400", icon: Clock },
      Approved: { color: "bg-blue-500/20 text-blue-400", icon: CheckCircle },
      Open: { color: "bg-emerald-500/20 text-emerald-400", icon: Target },
      Funded: { color: "bg-purple-500/20 text-purple-400", icon: CheckCircle },
      Closed: { color: "bg-red-500/20 text-red-400", icon: XCircle },
      Rejected: { color: "bg-red-500/20 text-red-400", icon: AlertCircle },
    };
    const Icon = config[status]?.icon || Clock;
    return { color: config[status]?.color || "bg-slate-500/20 text-slate-400", Icon };
  };

  const filteredRequests = requests.filter((request: { title: string; country: string; category: any; status: any; }) => {
    const matchesSearch = request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.country.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || request.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || request.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mx-auto mb-4" />
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
                Request funding for your research projects, community programs, and mental health initiatives.
              </p>
            </div>

            <div className="flex gap-2">
              {(userRole === "researcher" || userRole === "admin") && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-xl text-white transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span className="text-sm">Request Funding</span>
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
          </select>
        </div>

        {/* Funding Requests Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredRequests.map((request) => {
            const { color, Icon } = getStatusBadge(request.status);
            const progress = (request.amount_raised / request.amount_needed) * 100;
            
            return (
              <div key={request.id} className="bg-slate-800/50 rounded-2xl border border-slate-700 hover:border-cyan-500/30 transition-all overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${color}`}>
                      <span className="flex items-center gap-1">
                        <Icon className="w-3 h-3" />
                        {request.status}
                      </span>
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
                      {request.country}{request.region && `, ${request.region}`}
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
                        <p className="text-white text-sm">{request.researcher?.full_name || "Anonymous"}</p>
                        <p className="text-slate-500 text-xs">{request.researcher?.organization}</p>
                      </div>
                    </div>
                    <button className="text-slate-400 hover:text-cyan-400 transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
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
            <p className="text-slate-500 text-sm mt-2">Create your first funding request</p>
          </div>
        )}
      </div>

      {/* Create Funding Request Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto" onClick={() => setShowCreateModal(false)}>
          <div className="bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-700 sticky top-0 bg-slate-800">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Request Funding</h2>
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
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400"
                  placeholder="Enter a descriptive title for your project"
                />
              </div>

              <div>
                <label className="text-slate-400 text-sm block mb-2">Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={4}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 resize-none"
                  placeholder="Describe your project, methodology, and expected impact"
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
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white"
                    placeholder="50000"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-sm block mb-2">Country *</label>
                  <CountrySelect
                    value={selectedCountryCode}
                    onChange={handleCountrySelect}
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-sm block mb-2">Region/State</label>
                  <StateSelect
                    countryCode={selectedCountryCode}
                    value={selectedRegionName}
                    onChange={handleRegionSelect}
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
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
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

              {/* Info Box */}
              <div className="p-4 bg-cyan-600/10 rounded-xl border border-cyan-500/20">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-white text-sm font-semibold">Submission Process</p>
                    <p className="text-slate-400 text-xs mt-1">
                      1. Your request will be reviewed by AMHROA administrators<br />
                      2. Approved requests become visible to donors<br />
                      3. AMHROA takes a 5% platform fee on funded amounts<br />
                      4. Funds are disbursed within 7 days of reaching goal
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 rounded-xl text-white font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {submitting ? "Submitting..." : "Submit for Approval"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

