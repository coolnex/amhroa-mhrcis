// app/opportunities/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  Search,
  Filter,
  Calendar,
  MapPin,
  DollarSign,
  Globe,
  Users,
  Clock,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  ChevronDown,
  ChevronRight,
  Loader2,
  RefreshCw,
  Eye,
  Briefcase,
  GraduationCap,
  Heart,
  Award,
  TrendingUp,
  Sparkles,
  Zap,
  Flame,
  Leaf,
  Grid,
  List,
  X,
} from "lucide-react";

interface Opportunity {
  id: string;
  title: string;
  description: string;
  opportunity_type: string;
  target_audience: string[];
  target_countries: string[];
  target_regions: string[];
  eligibility_criteria: string;
  application_deadline: string;
  start_date: string;
  end_date: string;
  funding_amount: number;
  funding_currency: string;
  organization_name: string;
  organization_logo: string;
  contact_email: string;
  contact_phone: string;
  website_url: string;
  application_url: string;
  application_instructions: string;
  documents_required: string[];
  is_remote: boolean;
  location: string;
  status: string;
  views: number;
  applications_count: number;
  created_at: string;
  published_at: string;
  tags: string[];
}

const africanCountries = [
  { name: "Nigeria" },
  { name: "Kenya" },
  { name: "South Africa" },
  { name: "Egypt" },
  { name: "Ghana" },
  { name: "Ethiopia" },
  { name: "Uganda" },
  { name: "Tanzania" },
  { name: "Morocco" },
  { name: "Algeria" },
  // Add more countries as needed
];

const OPPORTUNITY_TYPES = [
  { value: "all", label: "All Types", icon: Briefcase },
  { value: "grant", label: "Grants", icon: DollarSign },
  { value: "job", label: "Jobs", icon: Briefcase },
  { value: "fellowship", label: "Fellowships", icon: Award },
  { value: "training", label: "Trainings", icon: GraduationCap },
  { value: "scholarship", label: "Scholarships", icon: GraduationCap },
  { value: "internship", label: "Internships", icon: Briefcase },
  { value: "volunteer", label: "Volunteer", icon: Heart },
  { value: "consultancy", label: "Consultancy", icon: Briefcase },
  { value: "award", label: "Awards", icon: Award },
  { value: "competition", label: "Competitions", icon: TrendingUp },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "deadline_soon", label: "Deadline Soon" },
  { value: "most_viewed", label: "Most Viewed" },
  { value: "most_applied", label: "Most Applied" },
  { value: "funding_high", label: "Highest Funding" },
  { value: "funding_low", label: "Lowest Funding" },
];

const DEADLINE_FILTERS = [
  { value: "all", label: "All Deadlines" },
  { value: "this_week", label: "This Week" },
  { value: "this_month", label: "This Month" },
  { value: "next_month", label: "Next Month" },
  { value: "no_deadline", label: "No Deadline" },
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

const getTypeIcon = (type: string) => {
  const icons: Record<string, any> = {
    grant: DollarSign,
    job: Briefcase,
    fellowship: Award,
    training: GraduationCap,
    scholarship: GraduationCap,
    internship: Briefcase,
    volunteer: Heart,
    consultancy: Briefcase,
    award: Award,
    competition: TrendingUp,
  };
  return icons[type] || Briefcase;
};

export default function OpportunitiesPage() {
  const router = useRouter();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [savedOpportunities, setSavedOpportunities] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedType, setSelectedType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [deadlineFilter, setDeadlineFilter] = useState("all");
  const [selectedCountry, setSelectedCountry] = useState("all");
  const [selectedAudience, setSelectedAudience] = useState("all");

  useEffect(() => {
    checkUser();
    fetchOpportunities();
  }, []);

  const checkUser = async () => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const userData = JSON.parse(userStr);
        setUser(userData);
        if (userData.id) {
          await fetchSavedOpportunities(userData.id);
        }
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: userData } = await supabase
          .from("users")
          .select("*")
          .eq("id", session.user.id)
          .single();
        if (userData) {
          setUser(userData);
          await fetchSavedOpportunities(userData.id);
        }
      }
    } catch (error) {
      console.error("Error checking user:", error);
    }
  };

  const fetchSavedOpportunities = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("opportunity_saves")
        .select("opportunity_id")
        .eq("user_id", userId);

      if (error) throw error;
      setSavedOpportunities(new Set(data?.map(item => item.opportunity_id) || []));
    } catch (error) {
      console.error("Error fetching saved opportunities:", error);
    }
  };

  const fetchOpportunities = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("opportunities")
        .select("*")
        .eq("status", "published")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOpportunities(data || []);
    } catch (error) {
      console.error("Error fetching opportunities:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveOpportunity = async (opportunityId: string) => {
    if (!user) {
      router.push("/login");
      return;
    }

    try {
      if (savedOpportunities.has(opportunityId)) {
        // Unsave
        const { error } = await supabase
          .from("opportunity_saves")
          .delete()
          .eq("opportunity_id", opportunityId)
          .eq("user_id", user.id);

        if (error) throw error;
        setSavedOpportunities(prev => {
          const newSet = new Set(prev);
          newSet.delete(opportunityId);
          return newSet;
        });
      } else {
        // Save
        const { error } = await supabase
          .from("opportunity_saves")
          .insert({
            opportunity_id: opportunityId,
            user_id: user.id,
          });

        if (error) throw error;
        setSavedOpportunities(prev => new Set([...prev, opportunityId]));
      }
    } catch (error) {
      console.error("Error saving opportunity:", error);
    }
  };

  const handleTrackView = async (opportunityId: string) => {
    try {
      await supabase
        .rpc('increment_views', { row_id: opportunityId });
    } catch (error) {
      console.error("Error tracking view:", error);
    }
  };

  const filteredOpportunities = useMemo(() => {
    let filtered = [...opportunities];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(opp =>
        opp.title.toLowerCase().includes(term) ||
        opp.description.toLowerCase().includes(term) ||
        opp.organization_name.toLowerCase().includes(term) ||
        opp.tags?.some(t => t.toLowerCase().includes(term))
      );
    }

    // Type filter
    if (selectedType !== "all") {
      filtered = filtered.filter(opp => opp.opportunity_type === selectedType);
    }

    // Country filter
    if (selectedCountry !== "all") {
      filtered = filtered.filter(opp =>
        opp.target_countries?.includes(selectedCountry) ||
        opp.target_countries?.length === 0
      );
    }

    // Audience filter
    if (selectedAudience !== "all") {
      filtered = filtered.filter(opp =>
        opp.target_audience?.includes(selectedAudience) ||
        opp.target_audience?.length === 0
      );
    }

    // Deadline filter
    if (deadlineFilter !== "all") {
      const now = new Date();
      const weekFromNow = new Date(now);
      weekFromNow.setDate(weekFromNow.getDate() + 7);
      const monthFromNow = new Date(now);
      monthFromNow.setMonth(monthFromNow.getMonth() + 1);
      const nextMonthStart = new Date(now);
      nextMonthStart.setMonth(nextMonthStart.getMonth() + 1);
      nextMonthStart.setDate(1);
      const nextMonthEnd = new Date(now);
      nextMonthEnd.setMonth(nextMonthEnd.getMonth() + 2);
      nextMonthEnd.setDate(0);

      filtered = filtered.filter(opp => {
        if (!opp.application_deadline) return deadlineFilter === "no_deadline";
        const deadline = new Date(opp.application_deadline);
        switch (deadlineFilter) {
          case "this_week":
            return deadline >= now && deadline <= weekFromNow;
          case "this_month":
            return deadline >= now && deadline <= monthFromNow;
          case "next_month":
            return deadline >= nextMonthStart && deadline <= nextMonthEnd;
          case "no_deadline":
            return false;
          default:
            return true;
        }
      });
    }

    // Sort
    switch (sortBy) {
      case "newest":
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case "oldest":
        filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case "deadline_soon":
        filtered.sort((a, b) => {
          if (!a.application_deadline) return 1;
          if (!b.application_deadline) return -1;
          return new Date(a.application_deadline).getTime() - new Date(b.application_deadline).getTime();
        });
        break;
      case "most_viewed":
        filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
        break;
      case "most_applied":
        filtered.sort((a, b) => (b.applications_count || 0) - (a.applications_count || 0));
        break;
      case "funding_high":
        filtered.sort((a, b) => (b.funding_amount || 0) - (a.funding_amount || 0));
        break;
      case "funding_low":
        filtered.sort((a, b) => (a.funding_amount || 0) - (b.funding_amount || 0));
        break;
      default:
        break;
    }

    return filtered;
  }, [opportunities, searchTerm, selectedType, selectedCountry, selectedAudience, deadlineFilter, sortBy]);

  const getDeadlineStatus = (deadline: string) => {
    if (!deadline) return { label: "No Deadline", color: "text-slate-400" };
    
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const daysUntil = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntil < 0) return { label: "Expired", color: "text-red-400" };
    if (daysUntil <= 7) return { label: `${daysUntil} days left`, color: "text-red-400 font-semibold" };
    if (daysUntil <= 30) return { label: `${daysUntil} days left`, color: "text-yellow-400" };
    return { label: `${daysUntil} days left`, color: "text-emerald-400" };
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
                    OPPORTUNITIES
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Globe className="w-4 h-4 text-cyan-400" />
                  <span className="text-slate-400 text-xs">{filteredOpportunities.length} Opportunities</span>
                </div>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Opportunities Across Africa
              </h1>
              <p className="text-slate-300 text-sm md:text-base mt-2 max-w-2xl">
                Discover grants, jobs, fellowships, and more opportunities for individuals and organizations across the continent.
              </p>
            </div>

            {savedOpportunities.size > 0 && (
              <button
                onClick={() => {
                  const saved = opportunities.filter(opp => savedOpportunities.has(opp.id));
                  if (saved.length > 0) {
                    // Filter to show only saved
                    setOpportunities(saved);
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 rounded-xl border border-yellow-500/30 text-yellow-400 transition-colors"
              >
                <BookmarkCheck className="w-4 h-4" />
                Saved ({savedOpportunities.size})
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 md:px-8 py-6">
        {/* Search and Filters */}
        <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search opportunities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-xl text-white transition-colors flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filters
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
            </button>

            <div className="flex bg-slate-700 rounded-xl p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  viewMode === "grid" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  viewMode === "list" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-4 pt-4 border-t border-slate-700">
              <div>
                <label className="text-slate-400 text-sm block mb-2">Opportunity Type</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                >
                  {OPPORTUNITY_TYPES.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 text-sm block mb-2">Country</label>
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="all">All Countries</option>
                  <option value="all_africa">🌍 All Africa</option>
                  {africanCountries.map(c => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 text-sm block mb-2">Target Audience</label>
                <select
                  value={selectedAudience}
                  onChange={(e) => setSelectedAudience(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="all">All Audiences</option>
                  <option value="individuals">Individuals</option>
                  <option value="organizations">Organizations</option>
                  <option value="students">Students</option>
                  <option value="researchers">Researchers</option>
                  <option value="policymakers">Policymakers</option>
                  <option value="cso">CSOs</option>
                  <option value="youth">Youth</option>
                  <option value="women">Women</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 text-sm block mb-2">Deadline</label>
                <select
                  value={deadlineFilter}
                  onChange={(e) => setDeadlineFilter(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                >
                  {DEADLINE_FILTERS.map(filter => (
                    <option key={filter.value} value={filter.value}>{filter.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 text-sm block mb-2">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                >
                  {SORT_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="flex justify-between items-center mb-4">
          <p className="text-slate-400 text-sm">
            Showing <span className="text-white font-medium">{filteredOpportunities.length}</span> opportunities
          </p>
        </div>

        {/* Opportunities Grid/List */}
        {filteredOpportunities.length === 0 ? (
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-12 text-center">
            <Globe className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">No opportunities found</p>
            <p className="text-slate-500 text-sm mt-2">
              {searchTerm || selectedType !== "all" || selectedCountry !== "all"
                ? "Try adjusting your filters"
                : "Check back later for new opportunities"}
            </p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOpportunities.map((opp) => {
              const TypeIcon = getTypeIcon(opp.opportunity_type);
              const typeColor = getTypeColor(opp.opportunity_type);
              const isSaved = savedOpportunities.has(opp.id);
              const deadlineStatus = opp.application_deadline ? getDeadlineStatus(opp.application_deadline) : { label: "No Deadline", color: "text-slate-400" };

              return (
                <div
                  key={opp.id}
                  className="bg-slate-800/50 rounded-2xl border border-slate-700 hover:border-cyan-500/30 transition-all overflow-hidden group"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <TypeIcon className={`w-4 h-4 ${typeColor.replace(/border.*$/, '').trim()}`} />
                        <span className={`px-2 py-1 rounded-full text-xs border ${typeColor}`}>
                          {opp.opportunity_type}
                        </span>
                      </div>
                      <button
                        onClick={() => handleSaveOpportunity(opp.id)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          isSaved
                            ? "bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30"
                            : "bg-slate-700 hover:bg-slate-600 text-slate-400 hover:text-white"
                        }`}
                      >
                        {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                      </button>
                    </div>

                    <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">{opp.title}</h3>
                    <p className="text-slate-400 text-sm mb-3 line-clamp-2">{opp.description}</p>

                    <div className="space-y-2 text-sm text-slate-400">
                      <p className="flex items-center gap-2">
                        <Briefcase className="w-3 h-3 text-cyan-400" />
                        {opp.organization_name}
                      </p>
                      {opp.location && (
                        <p className="flex items-center gap-2">
                          <MapPin className="w-3 h-3 text-cyan-400" />
                          {opp.is_remote ? "🌐 Remote" : opp.location}
                        </p>
                      )}
                      {opp.funding_amount > 0 && (
                        <p className="flex items-center gap-2">
                          <DollarSign className="w-3 h-3 text-cyan-400" />
                          {opp.funding_amount.toLocaleString()} {opp.funding_currency}
                        </p>
                      )}
                      {opp.application_deadline && (
                        <p className={`flex items-center gap-2 ${deadlineStatus.color}`}>
                          <Calendar className="w-3 h-3" />
                          Deadline: {new Date(opp.application_deadline).toLocaleDateString()} · {deadlineStatus.label}
                        </p>
                      )}
                    </div>

                    {opp.tags && opp.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-4 pt-4 border-t border-slate-700">
                        {opp.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="px-2 py-0.5 rounded-full text-xs bg-slate-700 text-slate-300">
                            #{tag}
                          </span>
                        ))}
                        {opp.tags.length > 3 && (
                          <span className="px-2 py-0.5 rounded-full text-xs bg-slate-700 text-slate-400">
                            +{opp.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="mt-4 pt-4 border-t border-slate-700 flex justify-between items-center">
                      <div className="flex gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {opp.views || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {opp.applications_count || 0} applied
                        </span>
                      </div>
                      <Link
                        href={`/opportunities/${opp.id}`}
                        onClick={() => handleTrackView(opp.id)}
                        className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-white text-xs transition-colors flex items-center gap-1"
                      >
                        View Details
                        <ChevronRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOpportunities.map((opp) => {
              const TypeIcon = getTypeIcon(opp.opportunity_type);
              const typeColor = getTypeColor(opp.opportunity_type);
              const isSaved = savedOpportunities.has(opp.id);
              const deadlineStatus = opp.application_deadline ? getDeadlineStatus(opp.application_deadline) : { label: "No Deadline", color: "text-slate-400" };

              return (
                <div
                  key={opp.id}
                  className="bg-slate-800/50 rounded-2xl border border-slate-700 hover:border-cyan-500/30 transition-all p-6 group"
                >
                  <div className="flex flex-wrap justify-between items-start gap-4">
                    <div className="flex-1 min-w-[200px]">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <TypeIcon className={`w-4 h-4 ${typeColor.replace(/border.*$/, '').trim()}`} />
                        <span className={`px-2 py-1 rounded-full text-xs border ${typeColor}`}>
                          {opp.opportunity_type}
                        </span>
                        <h3 className="text-xl font-bold text-white">{opp.title}</h3>
                      </div>
                      <p className="text-slate-400 text-sm mb-3 line-clamp-2">{opp.description}</p>
                      <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-3 h-3" />
                          {opp.organization_name}
                        </span>
                        {opp.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {opp.is_remote ? "🌐 Remote" : opp.location}
                          </span>
                        )}
                        {opp.funding_amount > 0 && (
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            {opp.funding_amount.toLocaleString()} {opp.funding_currency}
                          </span>
                        )}
                        {opp.application_deadline && (
                          <span className={`flex items-center gap-1 ${deadlineStatus.color}`}>
                            <Calendar className="w-3 h-3" />
                            {new Date(opp.application_deadline).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      {opp.tags && opp.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {opp.tags.map((tag) => (
                            <span key={tag} className="px-2 py-0.5 rounded-full text-xs bg-slate-700 text-slate-300">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSaveOpportunity(opp.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            isSaved
                              ? "bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30"
                              : "bg-slate-700 hover:bg-slate-600 text-slate-400 hover:text-white"
                          }`}
                        >
                          {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                        </button>
                      </div>
                      <div className="flex gap-2">
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          <Eye className="w-3 h-3" />
                          {opp.views || 0}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          <Users className="w-3 h-3" />
                          {opp.applications_count || 0}
                        </span>
                      </div>
                      <Link
                        href={`/opportunities/${opp.id}`}
                        onClick={() => handleTrackView(opp.id)}
                        className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-xl text-white text-sm transition-colors flex items-center gap-2"
                      >
                        View Details
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
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