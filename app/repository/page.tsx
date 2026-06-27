// app/knowledge-repository/page.tsx
"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import {
  BookOpen,
  Search,
  Filter,
  Download,
  Eye,
  Calendar,
  MapPin,
  User,
  Tag,
  RefreshCw,
  Loader2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Grid,
  List,
  ExternalLink,
  Plus,
  X,
  Clock,
  TrendingUp,
  Award,
  FileText,
  FolderOpen,
  Link2,
  Copy,
  Check,
  Share2,
  Bookmark,
  BookmarkCheck,
} from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { CountrySelect } from "@/components/ui/country-select";

interface Resource {
  id: string;
  title: string;
  description: string;
  author: string;
  category: string;
  country: string;
  publication_year: number;
  file_url: string;
  thumbnail_url: string;
  resource_type: string;
  tags: string[];
  downloads: number;
  views: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface Filters {
  categories: string[];
  countries: string[];
  years: number[];
}

const resourceTypes = [
  "All Types",
  "Research Paper",
  "Policy Brief",
  "Case Study",
  "Toolkit",
  "Guideline",
  "Report",
  "Training Material",
  "Infographic",
  "Video",
  "Podcast",
  "Webinar",
];

const ITEMS_PER_PAGE = 12;

export default function KnowledgeRepositoryPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedCountry, setSelectedCountry] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [filters, setFilters] = useState<Filters>({
    categories: [],
    countries: [],
    years: [],
  });
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [bookmarkedResources, setBookmarkedResources] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [countryCode, setCountryCode] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    author: "",
    category: "",
    country: "",
    publication_year: new Date().getFullYear(),
    file_url: "",
    thumbnail_url: "",
    resource_type: "",
    tags: "",
  });

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      // First check localStorage
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const userData = JSON.parse(userStr);
        setUser(userData);
        setFormData(prev => ({
          ...prev,
          author: userData.full_name || userData.email || "",
        }));
        await loadFilters();
        await fetchResources();
        return;
      }

      // Check Supabase session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        setLoading(false);
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (profileError || !profile) {
        setLoading(false);
        return;
      }

      setUser(profile);
      localStorage.setItem("user", JSON.stringify(profile));
      setFormData(prev => ({
        ...prev,
        author: profile.full_name || profile.email || "",
      }));
      
      await loadFilters();
      await fetchResources();
    } catch (error) {
      console.error("Auth error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchResources();
    }
  }, [currentPage, selectedCategory, selectedCountry, selectedYear, selectedType, search]);

  const loadFilters = async () => {
    try {
      // Fetch distinct categories
      const { data: categoriesData } = await supabase
        .from("repository_resources")
        .select("category")
        .not("category", "is", null);
      
      const categories = [...new Set(categoriesData?.map(r => r.category).filter(Boolean) || [])];

      // Fetch distinct countries
      const { data: countriesData } = await supabase
        .from("repository_resources")
        .select("country")
        .not("country", "is", null);
      
      const countries = [...new Set(countriesData?.map(r => r.country).filter(Boolean) || [])];

      // Fetch distinct years
      const { data: yearsData } = await supabase
        .from("repository_resources")
        .select("publication_year")
        .not("publication_year", "is", null);
      
      const years = [...new Set(yearsData?.map(r => r.publication_year).filter(Boolean) || [])].sort((a, b) => b - a);

      setFilters({
        categories,
        countries,
        years,
      });
    } catch (error) {
      console.error("Error loading filters:", error);
    }
  };

  const fetchResources = async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from("repository_resources")
        .select("*", { count: "exact" });

      if (search) {
        query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,author.ilike.%${search}%`);
      }
      if (selectedCategory !== "all") {
        query = query.eq("category", selectedCategory);
      }
      if (selectedCountry !== "all") {
        query = query.eq("country", selectedCountry);
      }
      if (selectedYear !== "all") {
        query = query.eq("publication_year", parseInt(selectedYear));
      }
      if (selectedType !== "all") {
        query = query.eq("resource_type", selectedType);
      }

      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      const { data, error, count } = await query
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) throw error;

      setResources(data || []);
      setTotalItems(count || 0);
      setTotalPages(Math.ceil((count || 0) / ITEMS_PER_PAGE));
    } catch (error) {
      console.error("Error fetching resources:", error);
      setError("Failed to load resources. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("Please login to add resources");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from("repository_resources").insert({
        title: formData.title,
        description: formData.description,
        author: formData.author || user.full_name || user.email,
        category: formData.category,
        country: formData.country || null,
        publication_year: formData.publication_year || null,
        file_url: formData.file_url || null,
        thumbnail_url: formData.thumbnail_url || null,
        resource_type: formData.resource_type,
        tags: formData.tags.split(",").map(t => t.trim()).filter(Boolean),
        created_by: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;

      alert("Resource added successfully!");
      setShowAddModal(false);
      setFormData({
        title: "",
        description: "",
        author: user.full_name || user.email || "",
        category: "",
        country: "",
        publication_year: new Date().getFullYear(),
        file_url: "",
        thumbnail_url: "",
        resource_type: "",
        tags: "",
      });
      setCountryCode("");
      await loadFilters();
      await fetchResources();
    } catch (error) {
      console.error("Error adding resource:", error);
      alert("Failed to add resource. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleTrackView = async (resourceId: string) => {
    try {
      // Get current views count
      const { data: resource } = await supabase
        .from("repository_resources")
        .select("views")
        .eq("id", resourceId)
        .single();

      if (resource) {
        await supabase
          .from("repository_resources")
          .update({ views: (resource.views || 0) + 1 })
          .eq("id", resourceId);
        
        setResources(prev => prev.map(r => 
          r.id === resourceId ? { ...r, views: (r.views || 0) + 1 } : r
        ));
      }
    } catch (error) {
      console.error("Error tracking view:", error);
    }
  };

  const handleTrackDownload = async (resourceId: string) => {
    try {
      // Get current downloads count
      const { data: resource } = await supabase
        .from("repository_resources")
        .select("downloads")
        .eq("id", resourceId)
        .single();

      if (resource) {
        await supabase
          .from("repository_resources")
          .update({ downloads: (resource.downloads || 0) + 1 })
          .eq("id", resourceId);
        
        setResources(prev => prev.map(r => 
          r.id === resourceId ? { ...r, downloads: (r.downloads || 0) + 1 } : r
        ));
      }
    } catch (error) {
      console.error("Error tracking download:", error);
    }
  };

  const handleBookmark = (resourceId: string) => {
    const newBookmarks = new Set(bookmarkedResources);
    if (newBookmarks.has(resourceId)) {
      newBookmarks.delete(resourceId);
    } else {
      newBookmarks.add(resourceId);
    }
    setBookmarkedResources(newBookmarks);
    localStorage.setItem("bookmarked_resources", JSON.stringify(Array.from(newBookmarks)));
  };

  const handleShare = (resource: Resource) => {
    setSelectedResource(resource);
    setShowShareModal(true);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      "Research Paper": "bg-blue-500/10 text-blue-400 border-blue-500/20",
      "Policy Brief": "bg-purple-500/10 text-purple-400 border-purple-500/20",
      "Case Study": "bg-green-500/10 text-green-400 border-green-500/20",
      "Toolkit": "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
      "Guideline": "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
      "Report": "bg-orange-500/10 text-orange-400 border-orange-500/20",
      "Training Material": "bg-pink-500/10 text-pink-400 border-pink-500/20",
      "Infographic": "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
      "Video": "bg-red-500/10 text-red-400 border-red-500/20",
      "Podcast": "bg-amber-500/10 text-amber-400 border-amber-500/20",
      "Webinar": "bg-teal-500/10 text-teal-400 border-teal-500/20",
    };
    return colors[type] || "bg-slate-500/10 text-slate-400 border-slate-500/20";
  };

  const clearFilters = () => {
    setSelectedCategory("all");
    setSelectedCountry("all");
    setSelectedYear("all");
    setSelectedType("all");
    setSearch("");
    setCurrentPage(1);
  };

  if (loading && resources.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-300">Loading knowledge repository...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-cyan-950 to-slate-900 border-b border-cyan-500/20">
        <div className="relative px-6 md:px-8 py-8 md:py-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="px-3 py-1 bg-cyan-500/20 rounded-full border border-cyan-500/30">
              <span className="text-cyan-300 text-xs font-mono tracking-wider">
                KNOWLEDGE REPOSITORY
              </span>
            </div>
          </div>

          <div className="flex justify-between items-start flex-wrap gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Knowledge Repository
              </h1>
              <p className="text-slate-300 text-sm md:text-base mt-2 max-w-2xl">
                Access a curated collection of research, tools, and resources for mental health advocacy and reform.
              </p>
            </div>

            <div className="flex gap-2">
              {user && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-xl text-white transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span className="text-sm hidden sm:inline">Add Resource</span>
                </button>
              )}
              <button
                onClick={fetchResources}
                className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-600 text-white transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="text-sm hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-8 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center gap-2 mb-1">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <p className="text-slate-400 text-xs">Total Resources</p>
            </div>
            <p className="text-2xl font-bold text-white">{totalItems}</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center gap-2 mb-1">
              <FolderOpen className="w-4 h-4 text-cyan-400" />
              <p className="text-slate-400 text-xs">Categories</p>
            </div>
            <p className="text-2xl font-bold text-white">{filters.categories?.length || 0}</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="w-4 h-4 text-cyan-400" />
              <p className="text-slate-400 text-xs">Countries</p>
            </div>
            <p className="text-2xl font-bold text-white">{filters.countries?.length || 0}</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center gap-2 mb-1">
              <Eye className="w-4 h-4 text-cyan-400" />
              <p className="text-slate-400 text-xs">Total Views</p>
            </div>
            <p className="text-2xl font-bold text-white">
              {resources.reduce((sum, r) => sum + (r.views || 0), 0).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search resources..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                />
              </div>
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

            {bookmarkedResources.size > 0 && (
              <button
                onClick={() => {
                  const bookmarked = resources.filter(r => bookmarkedResources.has(r.id));
                  if (bookmarked.length > 0) {
                    setResources(bookmarked);
                  } else {
                    alert("No bookmarked resources found");
                    fetchResources();
                  }
                }}
                className="px-4 py-2.5 bg-yellow-500/20 hover:bg-yellow-500/30 rounded-xl text-yellow-400 text-sm transition-colors flex items-center gap-2"
              >
                <Bookmark className="w-4 h-4" />
                Bookmarks ({bookmarkedResources.size})
              </button>
            )}
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-slate-700">
              <div>
                <label className="text-slate-400 text-sm block mb-2">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="all">All Categories</option>
                  {filters.categories?.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
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
                  {filters.countries?.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-slate-400 text-sm block mb-2">Year</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="all">All Years</option>
                  {filters.years?.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-slate-400 text-sm block mb-2">Resource Type</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                >
                  {resourceTypes.map(type => (
                    <option key={type} value={type === "All Types" ? "all" : type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Resources Grid */}
        {resources.length === 0 ? (
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-12 text-center">
            <BookOpen className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">No resources found</p>
            <p className="text-slate-500 text-sm mt-2">
              {search || selectedCategory !== "all" || selectedCountry !== "all" || selectedYear !== "all" || selectedType !== "all"
                ? "Try adjusting your search or filters"
                : "Check back later for new resources"}
            </p>
            {(search || selectedCategory !== "all" || selectedCountry !== "all" || selectedYear !== "all" || selectedType !== "all") && (
              <button
                onClick={clearFilters}
                className="mt-4 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-xl text-white transition-colors"
              >
                Clear All Filters
              </button>
            )}
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((resource) => {
              const isBookmarked = bookmarkedResources.has(resource.id);
              const typeColor = getTypeColor(resource.resource_type);
              return (
                <div key={resource.id} className="bg-slate-800/50 rounded-2xl border border-slate-700 hover:border-cyan-500/30 transition-all overflow-hidden group">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <span className={`px-2 py-1 rounded-full text-xs border ${typeColor}`}>
                        {resource.resource_type}
                      </span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleBookmark(resource.id)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            isBookmarked 
                              ? "bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30" 
                              : "bg-slate-700 hover:bg-slate-600 text-slate-400 hover:text-white"
                          }`}
                          title={isBookmarked ? "Remove bookmark" : "Add bookmark"}
                        >
                          {isBookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleShare(resource)}
                          className="p-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-400 hover:text-white transition-colors"
                          title="Share"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">{resource.title}</h3>
                    <p className="text-slate-400 text-sm mb-4 line-clamp-2">{resource.description}</p>

                    <div className="space-y-2 text-sm text-slate-400">
                      <p className="flex items-center gap-2">
                        <User className="w-3 h-3 text-cyan-400" />
                        {resource.author}
                      </p>
                      {resource.country && (
                        <p className="flex items-center gap-2">
                          <MapPin className="w-3 h-3 text-cyan-400" />
                          {resource.country}
                        </p>
                      )}
                      {resource.publication_year && (
                        <p className="flex items-center gap-2">
                          <Calendar className="w-3 h-3 text-cyan-400" />
                          {resource.publication_year}
                        </p>
                      )}
                    </div>

                    {resource.tags && resource.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-700">
                        {resource.tags.slice(0, 3).map((tag, index) => (
                          <span key={index} className="px-2 py-0.5 rounded-full text-xs bg-slate-700 text-slate-300">
                            #{tag}
                          </span>
                        ))}
                        {resource.tags.length > 3 && (
                          <span className="px-2 py-0.5 rounded-full text-xs bg-slate-700 text-slate-400">
                            +{resource.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="mt-4 pt-4 border-t border-slate-700 flex justify-between items-center">
                      <div className="flex gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {resource.views || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <Download className="w-3 h-3" />
                          {resource.downloads || 0}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        {resource.file_url && (
                          <>
                            <a
                              href={resource.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => handleTrackView(resource.id)}
                              className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-white text-xs transition-colors flex items-center gap-1"
                            >
                              <Eye className="w-3 h-3" />
                              View
                            </a>
                            <a
                              href={resource.file_url}
                              download
                              onClick={() => handleTrackDownload(resource.id)}
                              className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-white text-xs transition-colors flex items-center gap-1"
                            >
                              <Download className="w-3 h-3" />
                            </a>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // List View - Keep existing list view
          <div className="space-y-4">
            {resources.map((resource) => {
              const isBookmarked = bookmarkedResources.has(resource.id);
              const typeColor = getTypeColor(resource.resource_type);
              return (
                <div key={resource.id} className="bg-slate-800/50 rounded-2xl border border-slate-700 hover:border-cyan-500/30 transition-all p-6">
                  <div className="flex flex-wrap justify-between items-start gap-4">
                    <div className="flex-1 min-w-[200px]">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="text-xl font-bold text-white">{resource.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs border ${typeColor}`}>
                          {resource.resource_type}
                        </span>
                      </div>
                      <p className="text-slate-400 text-sm mb-3 line-clamp-2">{resource.description}</p>
                      <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {resource.author}
                        </span>
                        {resource.country && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {resource.country}
                          </span>
                        )}
                        {resource.publication_year && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {resource.publication_year}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {resource.views || 0} views
                        </span>
                        <span className="flex items-center gap-1">
                          <Download className="w-3 h-3" />
                          {resource.downloads || 0} downloads
                        </span>
                      </div>
                      {resource.tags && resource.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {resource.tags.map((tag, index) => (
                            <span key={index} className="px-2 py-0.5 rounded-full text-xs bg-slate-700 text-slate-300">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleBookmark(resource.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          isBookmarked 
                            ? "bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30" 
                            : "bg-slate-700 hover:bg-slate-600 text-slate-400 hover:text-white"
                        }`}
                        title={isBookmarked ? "Remove bookmark" : "Add bookmark"}
                      >
                        {isBookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleShare(resource)}
                        className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-400 hover:text-white transition-colors"
                        title="Share"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                      {resource.file_url && (
                        <>
                          <a
                            href={resource.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => handleTrackView(resource.id)}
                            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-xl text-white text-sm transition-colors flex items-center gap-2"
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </a>
                          <a
                            href={resource.file_url}
                            download
                            onClick={() => handleTrackDownload(resource.id)}
                            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-xl text-white text-sm transition-colors flex items-center gap-2"
                          >
                            <Download className="w-4 h-4" />
                            Download
                          </a>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination - Keep existing */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronUp className="w-5 h-5 rotate-270" />
            </button>
            <div className="flex gap-1">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-10 h-10 rounded-lg text-sm transition-colors ${
                      currentPage === pageNum
                        ? "bg-cyan-600 text-white"
                        : "bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronDown className="w-5 h-5 rotate-90" />
            </button>
            <span className="text-slate-500 text-sm ml-2">
              Page {currentPage} of {totalPages}
            </span>
          </div>
        )}
      </div>

      {/* Share Modal - Keep existing */}
      {showShareModal && selectedResource && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setShowShareModal(false)}>
          <div className="bg-slate-800 rounded-2xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-700">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-cyan-400" />
                  Share Resource
                </h2>
                <button onClick={() => setShowShareModal(false)} className="text-slate-400 hover:text-white text-2xl">&times;</button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <h3 className="text-white font-medium">{selectedResource.title}</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={`${window.location.origin}/knowledge-repository/${selectedResource.id}`}
                  readOnly
                  className="flex-1 bg-slate-700 border border-slate-600 rounded-xl px-4 py-2 text-white text-sm"
                />
                <button
                  onClick={() => copyToClipboard(`${window.location.origin}/knowledge-repository/${selectedResource.id}`)}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-xl text-white transition-colors flex items-center gap-2"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Resource Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto" onClick={() => setShowAddModal(false)}>
          <div className="bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-700 sticky top-0 bg-slate-800">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Add Resource</h2>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white text-2xl">&times;</button>
              </div>
            </div>
            <form onSubmit={handleAddResource} className="p-6 space-y-5">
              <div>
                <label className="text-slate-400 text-sm block mb-2">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 text-sm block mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 text-sm block mb-2">Author *</label>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    required
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-sm block mb-2">Resource Type *</label>
                  <select
                    value={formData.resource_type}
                    onChange={(e) => setFormData({ ...formData, resource_type: e.target.value })}
                    required
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white"
                  >
                    <option value="">Select Type</option>
                    {resourceTypes.filter(t => t !== "All Types").map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
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
                    {filters.categories?.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 text-sm block mb-2">Country</label>
                  <CountrySelect
                    value={countryCode}
                    onChange={(code, name) => {
                      setCountryCode(code);
                      setFormData(prev => ({ ...prev, country: name }));
                    }}
                    placeholder="Select a country"
                    className="w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 text-sm block mb-2">Publication Year</label>
                  <input
                    type="number"
                    value={formData.publication_year}
                    onChange={(e) => setFormData({ ...formData, publication_year: parseInt(e.target.value) })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-sm block mb-2">Tags (comma separated)</label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="mental-health, policy, advocacy"
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 text-sm block mb-2">File URL</label>
                <input
                  type="url"
                  value={formData.file_url}
                  onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
                  placeholder="https://example.com/file.pdf"
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 text-sm block mb-2">Thumbnail URL</label>
                <input
                  type="url"
                  value={formData.thumbnail_url}
                  onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                  placeholder="https://example.com/thumbnail.jpg"
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 rounded-xl text-white font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {submitting ? "Adding..." : "Add Resource"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}