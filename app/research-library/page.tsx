// app/research-library/page.tsx
"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { supabase } from "@/lib/supabase";
import {
  Search,
  FileText,
  Download,
  Eye,
  Calendar,
  MapPin,
  Building2,
  User,
  Tag,
  TrendingUp,
  BookOpen,
  Filter,
  X,
  RefreshCw,
  Loader2,
  ChevronDown,
  Grid,
  List,
  ExternalLink,
  Share2,
  Bookmark,
  BookmarkCheck,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Clock,
  Star,
  Quote,
  Link2,
  Mail,
  Twitter,
  Linkedin,
  Facebook,
  Printer,
} from "lucide-react";
import Link from "next/link";

interface Report {
  id: string;
  title: string;
  description: string;
  country: string;
  organization: string;
  report_type: string;
  submitted_by: string;
  file_url: string;
  status: string;
  created_at: string;
  sdg_alignment: string[];
  views: number;
  downloads: number;
  citations?: number;
  bookmarks?: number;
  doi?: string;
  keywords?: string[];
}

const reportTypes = [
  "All Types",
  "Research Paper",
  "Policy Brief",
  "Case Study",
  "Annual Report",
  "Assessment Report",
  "Evaluation Report",
  "Strategic Plan",
  "Technical Report",
];

const countries = [
  "All Countries",
  "Nigeria",
  "Kenya",
  "South Africa",
  "Ghana",
  "Ethiopia",
  "Tanzania",
  "Uganda",
  "Rwanda",
  "Zambia",
  "Malawi",
  "Senegal",
  "Cameroon",
  "Botswana",
  "Namibia",
  "Zimbabwe",
];

const sortOptions = [
  { value: "newest", label: "Newest First", icon: Clock },
  { value: "oldest", label: "Oldest First", icon: Clock },
  { value: "popular", label: "Most Popular", icon: TrendingUp },
  { value: "most_viewed", label: "Most Viewed", icon: Eye },
  { value: "most_downloaded", label: "Most Downloaded", icon: Download },
  { value: "title_asc", label: "Title (A-Z)", icon: ArrowUpDown },
  { value: "title_desc", label: "Title (Z-A)", icon: ArrowUpDown },
];

const citationFormats = [
  { value: "apa", label: "APA 7th Edition" },
  { value: "mla", label: "MLA 9th Edition" },
  { value: "chicago", label: "Chicago 17th Edition" },
  { value: "harvard", label: "Harvard" },
  { value: "vancouver", label: "Vancouver" },
  { value: "bibtex", label: "BibTeX" },
];

const ITEMS_PER_PAGE = 9;

export default function ResearchLibraryPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("All Types");
  const [selectedCountry, setSelectedCountry] = useState("All Countries");
  const [sortBy, setSortBy] = useState("newest");
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [bookmarkedReports, setBookmarkedReports] = useState<Set<string>>(new Set());
  const [showShareModal, setShowShareModal] = useState(false);
  const [showCitationModal, setShowCitationModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [copied, setCopied] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [relatedReports, setRelatedReports] = useState<Report[]>([]);
  const [showRelated, setShowRelated] = useState(false);
  const [citationFormat, setCitationFormat] = useState("apa");
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchReports();
    // Load bookmarks from localStorage
    const savedBookmarks = localStorage.getItem("bookmarked_reports");
    if (savedBookmarks) {
      setBookmarkedReports(new Set(JSON.parse(savedBookmarks)));
    }
  }, []);

  useEffect(() => {
    filterAndSortReports();
  }, [searchTerm, selectedType, selectedCountry, sortBy, reports]);

  useEffect(() => {
    // Update total pages
    setTotalPages(Math.ceil(filteredReports.length / ITEMS_PER_PAGE));
    setCurrentPage(1);
  }, [filteredReports.length]);

  useEffect(() => {
    // Generate search suggestions
    if (searchTerm.length > 1) {
      const suggestions = new Set<string>();
      reports.forEach(report => {
        if (report.title.toLowerCase().includes(searchTerm.toLowerCase())) {
          suggestions.add(report.title);
        }
        if (report.country.toLowerCase().includes(searchTerm.toLowerCase())) {
          suggestions.add(report.country);
        }
        if (report.organization?.toLowerCase().includes(searchTerm.toLowerCase())) {
          suggestions.add(report.organization);
        }
        if (report.keywords?.some(k => k.toLowerCase().includes(searchTerm.toLowerCase()))) {
          report.keywords?.forEach(k => {
            if (k.toLowerCase().includes(searchTerm.toLowerCase())) {
              suggestions.add(k);
            }
          });
        }
      });
      setSearchSuggestions(Array.from(suggestions).slice(0, 5));
      setShowSuggestions(true);
    } else {
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchTerm, reports]);

  async function fetchReports() {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("submissions")
        .select("*")
        .eq("status", "Approved")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Supabase error:", error);
        setError("Failed to load reports. Please try again.");
        return;
      }

      // Get real view and download counts
      const reportsWithStats = await Promise.all(
        (data || []).map(async (report) => {
          // Get view count
          const { count: viewCount } = await supabase
            .from("report_views")
            .select("*", { count: "exact", head: true })
            .eq("report_id", report.id);

          // Get download count
          const { count: downloadCount } = await supabase
            .from("report_downloads")
            .select("*", { count: "exact", head: true })
            .eq("report_id", report.id);

          // Get bookmark count
          const { count: bookmarkCount } = await supabase
            .from("report_bookmarks")
            .select("*", { count: "exact", head: true })
            .eq("report_id", report.id);

          return {
            ...report,
            views: viewCount || 0,
            downloads: downloadCount || 0,
            bookmarks: bookmarkCount || 0,
          };
        })
      );

      setReports(reportsWithStats);
      setFilteredReports(reportsWithStats);
    } catch (error) {
      console.error("Error fetching reports:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function filterAndSortReports() {
    let filtered = [...reports];

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (report) =>
          report.title.toLowerCase().includes(term) ||
          report.description?.toLowerCase().includes(term) ||
          report.country.toLowerCase().includes(term) ||
          report.organization?.toLowerCase().includes(term) ||
          report.submitted_by?.toLowerCase().includes(term) ||
          report.keywords?.some(k => k.toLowerCase().includes(term))
      );
    }

    // Type filter
    if (selectedType !== "All Types") {
      filtered = filtered.filter((report) => report.report_type === selectedType);
    }

    // Country filter
    if (selectedCountry !== "All Countries") {
      filtered = filtered.filter((report) => report.country === selectedCountry);
    }

    // Sort
    switch (sortBy) {
      case "newest":
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case "oldest":
        filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case "popular":
        filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
        break;
      case "most_viewed":
        filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
        break;
      case "most_downloaded":
        filtered.sort((a, b) => (b.downloads || 0) - (a.downloads || 0));
        break;
      case "title_asc":
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "title_desc":
        filtered.sort((a, b) => b.title.localeCompare(a.title));
        break;
      default:
        break;
    }

    setFilteredReports(filtered);
  }

  const handleTrackView = async (reportId: string) => {
    try {
      await supabase.from("report_views").insert({
        report_id: reportId,
        viewed_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error tracking view:", error);
    }
  };

  const handleTrackDownload = async (reportId: string) => {
    try {
      await supabase.from("report_downloads").insert({
        report_id: reportId,
        downloaded_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error tracking download:", error);
    }
  };

  const handleBookmark = async (reportId: string) => {
    const newBookmarks = new Set(bookmarkedReports);
    if (newBookmarks.has(reportId)) {
      newBookmarks.delete(reportId);
      // Remove from database
      await supabase
        .from("report_bookmarks")
        .delete()
        .eq("report_id", reportId);
    } else {
      newBookmarks.add(reportId);
      // Add to database
      await supabase.from("report_bookmarks").insert({
        report_id: reportId,
        bookmarked_at: new Date().toISOString(),
      });
    }
    setBookmarkedReports(newBookmarks);
    localStorage.setItem("bookmarked_reports", JSON.stringify(Array.from(newBookmarks)));
  };

  const handleShare = (report: Report) => {
    setSelectedReport(report);
    setShowShareModal(true);
  };

  const handleCite = (report: Report) => {
    setSelectedReport(report);
    setShowCitationModal(true);
  };

  const handleViewRelated = async (report: Report) => {
    setSelectedReport(report);
    setShowRelated(true);
    setLoading(true);
    try {
      // Find related reports by country, type, or keywords
      const related = reports.filter(r =>
        r.id !== report.id &&
        (r.country === report.country ||
         r.report_type === report.report_type ||
         r.sdg_alignment?.some(sdg => report.sdg_alignment?.includes(sdg)) ||
         r.keywords?.some(k => report.keywords?.includes(k)))
      ).slice(0, 4);
      setRelatedReports(related);
    } catch (error) {
      console.error("Error fetching related reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateCitation = (report: Report, format: string) => {
    const author = report.submitted_by || "Unknown Author";
    const year = new Date(report.created_at).getFullYear();
    const title = report.title;
    const url = window.location.origin + `/research-library/${report.id}`;

    switch (format) {
      case "apa":
        return `${author}. (${year}). *${title}*. Retrieved from ${url}`;
      case "mla":
        return `${author}. "${title}." *Research Library*, ${year}, ${url}.`;
      case "chicago":
        return `${author}. "${title}." Research Library. ${year}. ${url}.`;
      case "harvard":
        return `${author} (${year}) '${title}', Research Library. Available at: ${url} (Accessed: ${new Date().toLocaleDateString()})`;
      case "vancouver":
        return `${author}. ${title}. Research Library [Internet]. ${year} [cited ${new Date().toLocaleDateString()}]. Available from: ${url}`;
      case "bibtex":
        return `@misc{${report.id},
  author = {${author}},
  title = {${title}},
  year = {${year}},
  url = {${url}},
  note = {[Online; accessed ${new Date().toLocaleDateString()}]}
}`;
      default:
        return "";
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOnSocial = (platform: string, url: string, title: string) => {
    const shareUrls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      email: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`Check out this research: ${url}`)}`,
    };
    window.open(shareUrls[platform], "_blank", "width=600,height=400");
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedType("All Types");
    setSelectedCountry("All Countries");
    setSortBy("newest");
    setCurrentPage(1);
  };

  const getPaginatedReports = () => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return filteredReports.slice(start, end);
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      "Research Paper": "bg-blue-500/10 text-blue-400 border-blue-500/20",
      "Policy Brief": "bg-purple-500/10 text-purple-400 border-purple-500/20",
      "Case Study": "bg-green-500/10 text-green-400 border-green-500/20",
      "Annual Report": "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
      "Assessment Report": "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
      "Evaluation Report": "bg-orange-500/10 text-orange-400 border-orange-500/20",
      "Strategic Plan": "bg-pink-500/10 text-pink-400 border-pink-500/20",
      "Technical Report": "bg-slate-500/10 text-slate-400 border-slate-500/20",
    };
    return colors[type] || "bg-slate-500/10 text-slate-400 border-slate-500/20";
  };

  const getSdgColor = (sdg: string) => {
    const colors: Record<string, string> = {
      "SDG 1": "bg-red-500/20 text-red-400",
      "SDG 2": "bg-yellow-500/20 text-yellow-400",
      "SDG 3": "bg-green-500/20 text-green-400",
      "SDG 4": "bg-blue-500/20 text-blue-400",
      "SDG 5": "bg-purple-500/20 text-purple-400",
      "SDG 6": "bg-cyan-500/20 text-cyan-400",
      "SDG 7": "bg-amber-500/20 text-amber-400",
      "SDG 8": "bg-emerald-500/20 text-emerald-400",
      "SDG 9": "bg-indigo-500/20 text-indigo-400",
      "SDG 10": "bg-pink-500/20 text-pink-400",
      "SDG 11": "bg-orange-500/20 text-orange-400",
      "SDG 12": "bg-lime-500/20 text-lime-400",
      "SDG 13": "bg-teal-500/20 text-teal-400",
      "SDG 14": "bg-sky-500/20 text-sky-400",
      "SDG 15": "bg-emerald-500/20 text-emerald-400",
      "SDG 16": "bg-violet-500/20 text-violet-400",
      "SDG 17": "bg-rose-500/20 text-rose-400",
    };
    return colors[sdg] || "bg-slate-500/20 text-slate-400";
  };

  const paginatedReports = getPaginatedReports();

  if (loading && reports.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-300">Loading research library...</p>
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
                RESEARCH LIBRARY
              </span>
            </div>
          </div>
          <div className="flex justify-between items-start flex-wrap gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Research Library
              </h1>
              <p className="text-slate-300 text-sm md:text-base mt-2 max-w-2xl">
                Access approved reports, research findings, and policy documents from across the continent.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={fetchReports}
                className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-600 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="text-sm hidden sm:inline">Refresh</span>
              </button>
              {bookmarkedReports.size > 0 && (
                <button
                  onClick={() => {
                    const bookmarked = reports.filter(r => bookmarkedReports.has(r.id));
                    setFilteredReports(bookmarked);
                    setSearchTerm("");
                    setSelectedType("All Types");
                    setSelectedCountry("All Countries");
                  }}
                  className="flex items-center gap-2 px-3 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 rounded-xl border border-yellow-500/30 text-yellow-400 transition-colors"
                >
                  <Bookmark className="w-4 h-4" />
                  <span className="text-sm hidden sm:inline">Bookmarks ({bookmarkedReports.size})</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-8 py-6">
        {/* Error State */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 flex items-center justify-between">
            <p className="text-red-400 text-sm">{error}</p>
            <button
              onClick={fetchReports}
              className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-400 text-sm transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </button>
          </div>
        )}

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="w-4 h-4 text-cyan-400" />
              <p className="text-slate-400 text-xs">Total Reports</p>
            </div>
            <p className="text-2xl font-bold text-white">{filteredReports.length}</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="w-4 h-4 text-cyan-400" />
              <p className="text-slate-400 text-xs">Countries</p>
            </div>
            <p className="text-2xl font-bold text-white">
              {new Set(reports.map(r => r.country)).size}
            </p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="w-4 h-4 text-cyan-400" />
              <p className="text-slate-400 text-xs">Organizations</p>
            </div>
            <p className="text-2xl font-bold text-white">
              {new Set(reports.map(r => r.organization).filter(Boolean)).size}
            </p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center gap-2 mb-1">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <p className="text-slate-400 text-xs">Total Views</p>
            </div>
            <p className="text-2xl font-bold text-white">
              {reports.reduce((sum, r) => sum + (r.views || 0), 0).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search reports by title, country, organization, or keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => searchTerm.length > 1 && setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                className="w-full bg-slate-700 border border-slate-600 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
              />
              {/* Search Suggestions */}
              {showSuggestions && searchSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-slate-700 border border-slate-600 rounded-xl overflow-hidden z-20">
                  {searchSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSearchTerm(suggestion);
                        setShowSuggestions(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-600 text-white text-sm transition-colors flex items-center gap-2"
                    >
                      <Search className="w-3 h-3 text-slate-400" />
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-xl text-white transition-colors flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Filters
                <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
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

            {(searchTerm || selectedType !== "All Types" || selectedCountry !== "All Countries" || sortBy !== "newest") && (
              <button
                onClick={clearFilters}
                className="px-4 py-2.5 bg-red-500/20 hover:bg-red-500/30 rounded-xl text-red-400 text-sm transition-colors flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Clear Filters
              </button>
            )}
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-700">
              <div>
                <label className="text-slate-400 text-sm block mb-2">Report Type</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                >
                  {reportTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
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
                  {countries.map(country => (
                    <option key={country} value={country}>{country}</option>
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
                  {sortOptions.map(option => {
                    const Icon = option.icon;
                    return (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Empty State */}
        {filteredReports.length === 0 ? (
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-12 text-center">
            <BookOpen className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">No reports found</p>
            <p className="text-slate-500 text-sm mt-2">
              {searchTerm || selectedType !== "All Types" || selectedCountry !== "All Countries" || sortBy !== "newest"
                ? "Try adjusting your search or filters"
                : "Check back later for new research publications"}
            </p>
            {(searchTerm || selectedType !== "All Types" || selectedCountry !== "All Countries" || sortBy !== "newest") && (
              <button
                onClick={clearFilters}
                className="mt-4 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-xl text-white transition-colors"
              >
                Clear All Filters
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Reports Grid/List */}
            <div className={viewMode === "grid" 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
              : "space-y-4"
            }>
              {paginatedReports.map((report) => {
                const typeColor = getTypeColor(report.report_type);
                const isBookmarked = bookmarkedReports.has(report.id);
                
                if (viewMode === "list") {
                  return (
                    <div key={report.id} className="bg-slate-800/50 rounded-2xl border border-slate-700 hover:border-cyan-500/30 transition-all p-6 group">
                      <div className="flex flex-wrap justify-between items-start gap-4">
                        <div className="flex-1 min-w-[200px]">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <h3 className="text-xl font-bold text-white">{report.title}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs border ${typeColor}`}>
                              {report.report_type}
                            </span>
                          </div>
                          <p className="text-slate-400 text-sm mb-3 line-clamp-2">{report.description}</p>
                          <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {report.country}
                            </span>
                            {report.organization && (
                              <span className="flex items-center gap-1">
                                <Building2 className="w-3 h-3" />
                                {report.organization}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {report.submitted_by || "Unknown"}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(report.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-3 mt-2 text-sm text-slate-500">
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {report.views || 0} views
                            </span>
                            <span className="flex items-center gap-1">
                              <Download className="w-3 h-3" />
                              {report.downloads || 0} downloads
                            </span>
                            <span className="flex items-center gap-1">
                              <Bookmark className="w-3 h-3" />
                              {report.bookmarks || 0} bookmarks
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleBookmark(report.id)}
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
                              onClick={() => handleShare(report)}
                              className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-400 hover:text-white transition-colors"
                              title="Share"
                            >
                              <Share2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleCite(report)}
                              className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-400 hover:text-white transition-colors"
                              title="Cite"
                            >
                              <Quote className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleViewRelated(report)}
                              className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-400 hover:text-white transition-colors"
                              title="Related Reports"
                            >
                              <Link2 className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="flex gap-2">
                            <a
                              href={report.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => handleTrackView(report.id)}
                              className="flex-1 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-xl text-white text-sm transition-colors flex items-center justify-center gap-2"
                            >
                              <Eye className="w-4 h-4" />
                              View
                            </a>
                            <a
                              href={report.file_url}
                              download
                              onClick={() => handleTrackDownload(report.id)}
                              className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-xl text-white text-sm transition-colors flex items-center justify-center gap-2"
                            >
                              <Download className="w-4 h-4" />
                              Download
                            </a>
                          </div>
                        </div>
                      </div>
                      {report.sdg_alignment?.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-700">
                          {report.sdg_alignment.map((sdg, index) => (
                            <span key={index} className={`px-2 py-1 rounded-full text-xs ${getSdgColor(sdg)}`}>
                              {sdg}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }

                // Grid View
                return (
                  <div key={report.id} className="bg-slate-800/50 rounded-2xl border border-slate-700 hover:border-cyan-500/30 transition-all overflow-hidden group">
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-3">
                        <span className={`px-2 py-1 rounded-full text-xs border ${typeColor}`}>
                          {report.report_type}
                        </span>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleBookmark(report.id)}
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
                            onClick={() => handleShare(report)}
                            className="p-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-400 hover:text-white transition-colors"
                            title="Share"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleCite(report)}
                            className="p-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-400 hover:text-white transition-colors"
                            title="Cite"
                          >
                            <Quote className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">{report.title}</h3>
                      <p className="text-slate-400 text-sm mb-4 line-clamp-2">{report.description}</p>

                      <div className="space-y-2 text-sm text-slate-400">
                        <p className="flex items-center gap-2">
                          <MapPin className="w-3 h-3 text-cyan-400" />
                          {report.country}
                        </p>
                        {report.organization && (
                          <p className="flex items-center gap-2">
                            <Building2 className="w-3 h-3 text-cyan-400" />
                            {report.organization}
                          </p>
                        )}
                        <p className="flex items-center gap-2">
                          <Calendar className="w-3 h-3 text-cyan-400" />
                          {new Date(report.created_at).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-3 mt-2 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {report.views || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <Download className="w-3 h-3" />
                          {report.downloads || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <Bookmark className="w-3 h-3" />
                          {report.bookmarks || 0}
                        </span>
                      </div>

                      {report.sdg_alignment?.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-700">
                          {report.sdg_alignment.slice(0, 3).map((sdg, index) => (
                            <span key={index} className={`px-2 py-0.5 rounded-full text-xs ${getSdgColor(sdg)}`}>
                              {sdg}
                            </span>
                          ))}
                          {report.sdg_alignment.length > 3 && (
                            <span className="px-2 py-0.5 rounded-full text-xs bg-slate-700 text-slate-400">
                              +{report.sdg_alignment.length - 3}
                            </span>
                          )}
                        </div>
                      )}

                      <div className="mt-4 pt-4 border-t border-slate-700 flex justify-between items-center">
                        <span className="text-slate-500 text-xs">
                          {report.submitted_by || "Unknown author"}
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleViewRelated(report)}
                            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-white text-xs transition-colors flex items-center gap-1"
                            title="Related Reports"
                          >
                            <Link2 className="w-3 h-3" />
                            Related
                          </button>
                          <a
                            href={report.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => handleTrackView(report.id)}
                            className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-white text-xs transition-colors flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" />
                            View
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
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
                  <ChevronRight className="w-5 h-5" />
                </button>
                <span className="text-slate-500 text-sm ml-2">
                  Page {currentPage} of {totalPages}
                </span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Share Modal */}
      {showShareModal && selectedReport && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setShowShareModal(false)}>
          <div className="bg-slate-800 rounded-2xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-700">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-cyan-400" />
                  Share Report
                </h2>
                <button onClick={() => setShowShareModal(false)} className="text-slate-400 hover:text-white text-2xl">&times;</button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <h3 className="text-white font-medium">{selectedReport.title}</h3>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => shareOnSocial("twitter", window.location.href, selectedReport.title)}
                  className="flex-1 p-3 bg-slate-700 hover:bg-slate-600 rounded-xl text-white transition-colors flex items-center justify-center gap-2"
                >
                  <Twitter className="w-5 h-5 text-blue-400" />
                  Twitter
                </button>
                <button
                  onClick={() => shareOnSocial("linkedin", window.location.href, selectedReport.title)}
                  className="flex-1 p-3 bg-slate-700 hover:bg-slate-600 rounded-xl text-white transition-colors flex items-center justify-center gap-2"
                >
                  <Linkedin className="w-5 h-5 text-blue-600" />
                  LinkedIn
                </button>
                <button
                  onClick={() => shareOnSocial("facebook", window.location.href, selectedReport.title)}
                  className="flex-1 p-3 bg-slate-700 hover:bg-slate-600 rounded-xl text-white transition-colors flex items-center justify-center gap-2"
                >
                  <Facebook className="w-5 h-5 text-blue-500" />
                  Facebook
                </button>
                <button
                  onClick={() => shareOnSocial("email", window.location.href, selectedReport.title)}
                  className="flex-1 p-3 bg-slate-700 hover:bg-slate-600 rounded-xl text-white transition-colors flex items-center justify-center gap-2"
                >
                  <Mail className="w-5 h-5 text-cyan-400" />
                  Email
                </button>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={window.location.href}
                  readOnly
                  className="flex-1 bg-slate-700 border border-slate-600 rounded-xl px-4 py-2 text-white text-sm"
                />
                <button
                  onClick={() => copyToClipboard(window.location.href)}
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

      {/* Citation Modal */}
      {showCitationModal && selectedReport && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setShowCitationModal(false)}>
          <div className="bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-700">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Quote className="w-5 h-5 text-cyan-400" />
                  Cite This Report
                </h2>
                <button onClick={() => setShowCitationModal(false)} className="text-slate-400 hover:text-white text-2xl">&times;</button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-slate-400 text-sm block mb-2">Citation Format</label>
                <select
                  value={citationFormat}
                  onChange={(e) => setCitationFormat(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white"
                >
                  {citationFormats.map(format => (
                    <option key={format.value} value={format.value}>{format.label}</option>
                  ))}
                </select>
              </div>
              <div className="bg-slate-700/30 rounded-xl p-4">
                <p className="text-white text-sm whitespace-pre-wrap font-mono">
                  {generateCitation(selectedReport, citationFormat)}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => copyToClipboard(generateCitation(selectedReport, citationFormat))}
                  className="flex-1 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-xl text-white transition-colors flex items-center justify-center gap-2"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Copied!" : "Copy Citation"}
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-xl text-white transition-colors flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  Print
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Related Reports Modal */}
      {showRelated && selectedReport && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setShowRelated(false)}>
          <div className="bg-slate-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-700">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Link2 className="w-5 h-5 text-cyan-400" />
                  Related Reports
                </h2>
                <button onClick={() => setShowRelated(false)} className="text-slate-400 hover:text-white text-2xl">&times;</button>
              </div>
            </div>
            <div className="p-6">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                </div>
              ) : relatedReports.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <BookOpen className="w-12 h-12 mx-auto mb-3 text-slate-600" />
                  <p>No related reports found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {relatedReports.map(report => (
                    <div key={report.id} className="bg-slate-700/30 rounded-xl p-4 hover:bg-slate-700/50 transition-colors">
                      <h4 className="text-white font-medium">{report.title}</h4>
                      <p className="text-slate-400 text-sm mt-1">{report.description}</p>
                      <div className="flex justify-between items-center mt-3">
                        <div className="flex gap-3 text-sm text-slate-500">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {report.country}
                          </span>
                          <span className="flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            {report.report_type}
                          </span>
                        </div>
                        <a
                          href={report.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-white text-sm transition-colors"
                        >
                          View
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}