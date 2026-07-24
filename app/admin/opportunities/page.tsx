// app/admin/opportunities/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Copy,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  Globe,
  Users,
  DollarSign,
  MapPin,
  ExternalLink,
  Loader2,
  RefreshCw,
  LogOut,
  ArrowLeft,
  ChevronRight,
  MoreVertical,
  LayoutGrid,
  List,
} from "lucide-react";

interface Opportunity {
  id: string;
  title: string;
  description: string;
  opportunity_type: string;
  target_audience: string[];
  target_countries: string[];
  target_regions: string[];
  application_deadline: string;
  funding_amount: number;
  funding_currency: string;
  organization_name: string;
  location: string;
  is_remote: boolean;
  status: "draft" | "published" | "expired" | "archived";
  views: number;
  applications_count: number;
  created_at: string;
  published_at: string;
}

const OPPORTUNITY_TYPES = [
  "grant",
  "job",
  "fellowship",
  "training",
  "scholarship",
  "internship",
  "volunteer",
  "consultancy",
  "award",
  "competition",
];

const getTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    grant: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    job: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    fellowship: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    training: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    scholarship: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    internship: "bg-pink-500/10 text-pink-400 border-pink-500/20",
    volunteer: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    consultancy: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    award: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    competition: "bg-red-500/10 text-red-400 border-red-500/20",
  };
  return colors[type] || "bg-slate-500/10 text-slate-400";
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "published":
      return "bg-emerald-500/20 text-emerald-400";
    case "draft":
      return "bg-slate-500/20 text-slate-400";
    case "expired":
      return "bg-red-500/20 text-red-400";
    case "archived":
      return "bg-yellow-500/20 text-yellow-400";
    default:
      return "bg-slate-500/20 text-slate-400";
  }
};

export default function AdminOpportunitiesPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const userStr = localStorage.getItem("user");
      
      if (userStr) {
        const userData = JSON.parse(userStr);
        if (userData.role === "Admin" && userData.status === "Approved") {
          setUser(userData);
          setIsAuthorized(true);
          await fetchOpportunities();
          setLoading(false);
          return;
        }
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }

      const { data: userData, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (error || !userData || userData.role !== "Admin") {
        router.push("/dashboard");
        return;
      }

      setUser(userData);
      setIsAuthorized(true);
      localStorage.setItem("user", JSON.stringify(userData));
      await fetchOpportunities();
    } catch (error) {
      console.error("Auth error:", error);
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      localStorage.removeItem("user");
      await supabase.auth.signOut();
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const fetchOpportunities = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("opportunities")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOpportunities(data || []);
    } catch (error) {
      console.error("Error fetching opportunities:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this opportunity?")) return;
    
    try {
      const { error } = await supabase
        .from("opportunities")
        .delete()
        .eq("id", id);

      if (error) throw error;
      await fetchOpportunities();
    } catch (error) {
      console.error("Error deleting opportunity:", error);
      alert("Failed to delete opportunity");
    }
  };

  const handlePublish = async (id: string) => {
    try {
      const { error } = await supabase
        .from("opportunities")
        .update({ 
          status: "published",
          published_at: new Date().toISOString()
        })
        .eq("id", id);

      if (error) throw error;
      await fetchOpportunities();
    } catch (error) {
      console.error("Error publishing opportunity:", error);
      alert("Failed to publish opportunity");
    }
  };

  const handleArchive = async (id: string) => {
    try {
      const { error } = await supabase
        .from("opportunities")
        .update({ status: "archived" })
        .eq("id", id);

      if (error) throw error;
      await fetchOpportunities();
    } catch (error) {
      console.error("Error archiving opportunity:", error);
      alert("Failed to archive opportunity");
    }
  };

  const filteredOpportunities = opportunities.filter(opp => {
    const matchesSearch = opp.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || opp.opportunity_type === typeFilter;
    const matchesStatus = statusFilter === "all" || opp.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const stats = {
    total: opportunities.length,
    published: opportunities.filter(o => o.status === "published").length,
    draft: opportunities.filter(o => o.status === "draft").length,
    expired: opportunities.filter(o => o.status === "expired").length,
    totalApplications: opportunities.reduce((acc, o) => acc + (o.applications_count || 0), 0),
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-300">Loading opportunities...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-cyan-950 to-slate-900 border-b border-cyan-500/20">
        <div className="relative px-6 md:px-8 py-6 md:py-8">
          <div className="flex justify-between items-center mb-4">
            <Link href="/admin" className="inline-flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to Admin
            </Link>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 rounded-xl border border-red-500/30 text-red-400 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm hidden sm:inline">Logout</span>
            </button>
          </div>

          <div className="flex justify-between items-start flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="px-3 py-1 bg-cyan-500/20 rounded-full border border-cyan-500/30">
                  <span className="text-cyan-300 text-xs font-mono tracking-wider">
                    OPPORTUNITIES MANAGER
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Globe className="w-4 h-4 text-cyan-400" />
                  <span className="text-slate-400 text-xs">{stats.total} Opportunities</span>
                </div>
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Opportunities Management
              </h1>
              <p className="text-slate-400 mt-1">
                Post and manage grants, jobs, fellowships, and more for African individuals and organizations
              </p>
            </div>

            <Link
              href="/admin/opportunities/create"
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-xl text-white transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Opportunity
            </Link>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-8 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <p className="text-slate-400 text-xs">Total</p>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </div>
          <div className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/20">
            <p className="text-emerald-400 text-xs">Published</p>
            <p className="text-2xl font-bold text-emerald-400">{stats.published}</p>
          </div>
          <div className="bg-slate-500/10 rounded-xl p-4 border border-slate-500/20">
            <p className="text-slate-400 text-xs">Draft</p>
            <p className="text-2xl font-bold text-slate-400">{stats.draft}</p>
          </div>
          <div className="bg-red-500/10 rounded-xl p-4 border border-red-500/20">
            <p className="text-red-400 text-xs">Expired</p>
            <p className="text-2xl font-bold text-red-400">{stats.expired}</p>
          </div>
          <div className="bg-purple-500/10 rounded-xl p-4 border border-purple-500/20">
            <p className="text-purple-400 text-xs">Applications</p>
            <p className="text-2xl font-bold text-purple-400">{stats.totalApplications}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search opportunities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white"
          >
            <option value="all">All Types</option>
            {OPPORTUNITY_TYPES.map(type => (
              <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="expired">Expired</option>
            <option value="archived">Archived</option>
          </select>

          <button
            onClick={fetchOpportunities}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 text-white transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Opportunities List/Grid */}
        {filteredOpportunities.length === 0 ? (
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-12 text-center">
            <Globe className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">No opportunities found</p>
            <p className="text-slate-500 text-sm mt-2">
              {searchTerm || typeFilter !== "all" || statusFilter !== "all"
                ? "Try adjusting your filters"
                : "Create your first opportunity to help African individuals and organizations"}
            </p>
            <Link
              href="/admin/opportunities/create"
              className="inline-block mt-4 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-xl text-white transition-colors"
            >
              <Plus className="w-4 h-4 inline mr-2" />
              Create Opportunity
            </Link>
          </div>
        ) : (
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-900/50">
                  <tr>
                    <th className="text-left p-4 text-slate-400 text-sm font-medium">Title</th>
                    <th className="text-left p-4 text-slate-400 text-sm font-medium">Type</th>
                    <th className="text-left p-4 text-slate-400 text-sm font-medium">Countries</th>
                    <th className="text-left p-4 text-slate-400 text-sm font-medium">Deadline</th>
                    <th className="text-left p-4 text-slate-400 text-sm font-medium">Applications</th>
                    <th className="text-left p-4 text-slate-400 text-sm font-medium">Status</th>
                    <th className="text-left p-4 text-slate-400 text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOpportunities.map((opp) => (
                    <tr key={opp.id} className="border-t border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                      <td className="p-4">
                        <div>
                          <p className="text-white font-medium">{opp.title}</p>
                          <p className="text-slate-400 text-xs">{opp.organization_name}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${getTypeColor(opp.opportunity_type)}`}>
                          {opp.opportunity_type}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {opp.target_countries?.slice(0, 2).map((country) => (
                            <span key={country} className="px-1.5 py-0.5 bg-slate-700 rounded text-xs text-slate-300">
                              {country}
                            </span>
                          ))}
                          {(opp.target_countries?.length || 0) > 2 && (
                            <span className="px-1.5 py-0.5 bg-slate-700 rounded text-xs text-slate-300">
                              +{opp.target_countries.length - 2}
                            </span>
                          )}
                          {opp.target_countries?.length === 0 && (
                            <span className="text-slate-500 text-xs">All Africa</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        {opp.application_deadline ? (
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span className="text-white">
                              {new Date(opp.application_deadline).toLocaleDateString()}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-500 text-sm">No deadline</span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className="text-white">{opp.applications_count || 0}</span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadge(opp.status)}`}>
                          {opp.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Link
                            href={`/admin/opportunities/${opp.id}`}
                            className="p-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-400 hover:text-white transition-colors"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/admin/opportunities/edit/${opp.id}`}
                            className="p-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-400 hover:text-white transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          {opp.status === "draft" && (
                            <button
                              onClick={() => handlePublish(opp.id)}
                              className="p-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 rounded-lg text-emerald-400 transition-colors"
                              title="Publish"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          {opp.status === "published" && (
                            <button
                              onClick={() => handleArchive(opp.id)}
                              className="p-1.5 bg-yellow-500/20 hover:bg-yellow-500/30 rounded-lg text-yellow-400 transition-colors"
                              title="Archive"
                            >
                              <Archive className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(opp.id)}
                            className="p-1.5 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-400 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Add missing import
import { Archive } from "lucide-react";