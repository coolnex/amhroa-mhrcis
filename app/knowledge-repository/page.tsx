// app/knowledge-repository/page.tsx
"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import {
  BookOpen,
  Search,
  Filter,
  Download,
  Eye,
  Calendar,
  MapPin,
  User,
  ArrowUpDown,
  Tag,
  RefreshCw,
  Loader2,
  AlertCircle,
  ChevronDown,
  ChevronRight,
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
  Building2,
  Globe,
  BarChart3,
  Users,
  Sparkles,
  Zap,
  Trophy,
  Quote,
  Mail,
  Twitter,
  Linkedin,
  Facebook,
  Printer,
  Shield,
  Lock,
  Unlock,
  EyeOff,
  Flag,
  ThumbsUp,
  MessageCircle,
  Star,
  TrendingDown,
  Flame,
  Compass,
  Layers,
} from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { CountrySelect } from "@/components/ui/country-select";
import { useRouter } from "next/navigation";

// ============================================
// INTERFACES
// ============================================

interface UnifiedResource {
  id: string;
  title: string;
  description: string;
  type: "research" | "report" | "submission" | "survey" | "activity" | "field_report";
  source: string;
  source_id: string;
  country: string;
  region?: string;
  organization?: string;
  author?: string;
  author_id?: string;
  file_url?: string;
  public_url?: string;
  status: string;
  visibility: "public" | "private" | "restricted";
  views: number;
  downloads: number;
  bookmarks: number;
  citations?: number;
  sdg_alignment: string[];
  tags: string[];
  created_at: string;
  updated_at: string;
  metadata?: any;
  // Research specific
  project_id?: string;
  research_type?: string;
  // Report specific
  report_type?: string;
  reporting_period?: string;
  score?: number;
  // Submission specific
  submission_type?: string;
  category?: string[];
  // Survey specific
  survey_type?: string;
  response_count?: number;
  // Activity specific
  activity_status?: string;
  progress?: number;
  due_date?: string;
  priority?: string;
  // Field report specific
  incident_type?: string;
  severity?: string;
  location?: string;
  evidence_url?: string;
  reported_by?: any;
  // Engagement
  likes?: number;
  comments?: number;
  shares?: number;
  relevance_score?: number;
}

interface ResourceFilters {
  search: string;
  type: string;
  country: string;
  region: string;
  category: string;
  sdg: string;
  sortBy: string;
  dateRange: string;
  status: string;
  visibility: string;
  severity: string;
  hasFile: boolean;
}

// ============================================
// CONSTANTS
// ============================================

const RESOURCE_TYPES = [
  { value: "all", label: "All Resources", icon: FolderOpen },
  { value: "research", label: "Research Projects", icon: BookOpen },
  { value: "report", label: "Reports", icon: FileText },
  { value: "submission", label: "Submissions", icon: FileText },
  { value: "survey", label: "Surveys", icon: BarChart3 },
  { value: "activity", label: "Activities", icon: Users },
  { value: "field_report", label: "Field Reports", icon: Flag },
];

const SDG_OPTIONS = [
  "SDG 1", "SDG 2", "SDG 3", "SDG 4", "SDG 5",
  "SDG 6", "SDG 7", "SDG 8", "SDG 9", "SDG 10",
  "SDG 11", "SDG 12", "SDG 13", "SDG 14", "SDG 15",
  "SDG 16", "SDG 17",
];

// Update the SORT_OPTIONS to include relevance
const SORT_OPTIONS = [
    { value: "newest", label: "Newest First", icon: Clock },
    { value: "popular", label: "Most Popular", icon: TrendingUp },
    { value: "most_viewed", label: "Most Viewed", icon: Eye },
    { value: "most_downloaded", label: "Most Downloaded", icon: Download },
    { value: "most_bookmarked", label: "Most Bookmarked", icon: Bookmark },
    { value: "title_asc", label: "Title (A-Z)", icon: ArrowUpDown },
    { value: "title_desc", label: "Title (Z-A)", icon: ArrowUpDown },
  ];

const DATE_RANGES = [
  { value: "all", label: "All Time" },
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "quarter", label: "This Quarter" },
  { value: "year", label: "This Year" },
];

const STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "Approved", label: "Approved" },
  { value: "Pending", label: "Pending" },
  { value: "Under Review", label: "Under Review" },
  { value: "Rejected", label: "Rejected" },
  { value: "In Progress", label: "In Progress" },
  { value: "Completed", label: "Completed" },
  { value: "Active", label: "Active" },
];

const VISIBILITY_OPTIONS = [
  { value: "all", label: "All Visibility" },
  { value: "public", label: "Public", icon: Globe },
  { value: "restricted", label: "Restricted", icon: Lock },
  { value: "private", label: "Private", icon: Shield },
];

const SEVERITY_OPTIONS = [
  { value: "all", label: "All Severities" },
  { value: "critical", label: "Critical", color: "text-red-400" },
  { value: "high", label: "High", color: "text-orange-400" },
  { value: "medium", label: "Medium", color: "text-yellow-400" },
  { value: "low", label: "Low", color: "text-emerald-400" },
];

const REGIONS = [
  "All Regions",
  "West Africa",
  "East Africa",
  "North Africa",
  "Southern Africa",
  "Central Africa",
  "Island States",
];

const ITEMS_PER_PAGE = 12;

// ============================================
// MAIN COMPONENT
// ============================================

export default function KnowledgeRepositoryPage() {
  const router = useRouter();
  const [resources, setResources] = useState<UnifiedResource[]>([]);
  const [filteredResources, setFilteredResources] = useState<UnifiedResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  
  // Search suggestions
  const [searchSuggestions, setSearchSuggestions] = useState<UnifiedResource[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // Filters
  const [filters, setFilters] = useState<ResourceFilters>({
    search: "",
    type: "all",
    country: "all",
    region: "all",
    category: "all",
    sdg: "all",
    sortBy: "newest",
    dateRange: "all",
    status: "all",
    visibility: "all",
    severity: "all",
    hasFile: false,
  });
  
  // UI State
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  const [showShareModal, setShowShareModal] = useState(false);
  const [showCitationModal, setShowCitationModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedResource, setSelectedResource] = useState<UnifiedResource | null>(null);
  const [detailResource, setDetailResource] = useState<UnifiedResource | null>(null);
  const [copied, setCopied] = useState(false);
  const [citationFormat, setCitationFormat] = useState("apa");
  const [trendingResources, setTrendingResources] = useState<UnifiedResource[]>([]);
  const [recommendedResources, setRecommendedResources] = useState<UnifiedResource[]>([]);

  // ============================================
  // AUTHENTICATION
  // ============================================

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      console.log("🔐 Knowledge Repository - Verifying security clearance...");

      const userStr = localStorage.getItem("user");
      
      if (userStr) {
        try {
          const userData = JSON.parse(userStr);
          if (userData.status === "Approved") {
            setUser(userData);
            setIsAuthorized(true);
            await loadBookmarks();
            await fetchAllResources();
            setLoading(false);
            return;
          }
        } catch (e) {
          localStorage.removeItem("user");
        }
      }

      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session?.user) {
        console.log("No active session found.");
        setLoading(false);
        return;
      }

      const { data: userData, error: dbError } = await supabase
        .from("users")
        .select("id, full_name, email, role, status, country, interests")
        .eq("id", session.user.id)
        .single();

      if (dbError || !userData) {
        console.error("Profile matching session ID not found:", dbError?.message);
        setLoading(false);
        return;
      }

      if (userData.status !== "Approved") {
        console.log("Account is not yet marked as Approved.");
        setLoading(false);
        return;
      }

      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      setIsAuthorized(true);
      
      await loadBookmarks();
      await fetchAllResources();
    } catch (error) {
      console.error("Critical error during security verification:", error);
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // BOOKMARKS
  // ============================================

  const loadBookmarks = async () => {
    try {
      if (!user) return;
      const savedBookmarks = localStorage.getItem("knowledge_bookmarks");
      if (savedBookmarks) {
        setBookmarks(new Set(JSON.parse(savedBookmarks)));
      }
    } catch (error) {
      console.error("Error loading bookmarks:", error);
    }
  };

  const handleBookmark = async (resourceId: string) => {
    const newBookmarks = new Set(bookmarks);
    if (newBookmarks.has(resourceId)) {
      newBookmarks.delete(resourceId);
    } else {
      newBookmarks.add(resourceId);
    }
    setBookmarks(newBookmarks);
    localStorage.setItem("knowledge_bookmarks", JSON.stringify(Array.from(newBookmarks)));
  };

  // ============================================
  // FETCH RESOURCES
  // ============================================

  // Update the fetchAllResources function in the Knowledge Repository

const fetchAllResources = async () => {
    setLoading(true);
    setError(null);
    try {
      const resources: UnifiedResource[] = [];
  
      // 1. Fetch Research Files
      const { data: researchData, error: researchError } = await supabase
        .from("research_files")
        .select("*");
  
      if (!researchError && researchData) {
        researchData.forEach((file: any) => {
          const visibility = file.visibility || "public";
          resources.push({
            id: `research_${file.id}`,
            source_id: file.id,
            title: file.file_name || "Research File",
            description: "",
            type: "research",
            source: "research_files",
            country: "Global",
            region: "",
            organization: "",
            author: file.uploaded_by || "",
            author_id: file.uploaded_by,
            file_url: file.public_url,
            status: "Active",
            visibility: visibility as "public" | "private" | "restricted",
            views: file.views || 0,
            downloads: file.downloads || 0,
            bookmarks: 0,
            sdg_alignment: [],
            tags: [],
            created_at: file.uploaded_at || new Date().toISOString(),
            updated_at: file.uploaded_at || new Date().toISOString(),
            metadata: file,
            project_id: file.project_id,
            research_type: file.file_type,
            likes: file.likes || 0,
            comments: file.comments || 0,
            shares: file.shares || 0,
          });
        });
      }
  
      // 2. Fetch Reports
      const { data: reportsData, error: reportsError } = await supabase
        .from("reports")
        .select("*")
        .in("status", ["Approved", "Published"]);
  
      if (!reportsError && reportsData) {
        reportsData.forEach((report: any) => {
          const visibility = report.visibility || "public";
          resources.push({
            id: `report_${report.id}`,
            source_id: report.id,
            title: report.title,
            description: report.description || "",
            type: "report",
            source: "reports",
            country: report.country || "Global",
            region: report.region || "",
            organization: report.organization || "",
            author: report.submitted_by || "",
            author_id: report.submitted_by,
            file_url: report.file_url,
            status: report.status || "Approved",
            visibility: visibility as "public" | "private" | "restricted",
            views: report.views || 0,
            downloads: report.downloads || 0,
            bookmarks: 0,
            sdg_alignment: report.sdg_alignment || [],
            tags: report.tags || [],
            created_at: report.created_at || new Date().toISOString(),
            updated_at: report.updated_at || report.created_at || new Date().toISOString(),
            metadata: report,
            report_type: report.report_type,
            reporting_period: report.reporting_period,
            score: report.score,
            likes: report.likes || 0,
            comments: report.comments || 0,
            shares: report.shares || 0,
          });
        });
      }
  
      // 3. Fetch Submissions - Allow all users to see approved submissions
      const { data: submissionsData, error: submissionsError } = await supabase
        .from("submissions")
        .select("*")
        .in("status", ["Approved", "Published"]);
  
      if (!submissionsError && submissionsData) {
        submissionsData.forEach((submission: any) => {
          const visibility = submission.visibility || "public";
          resources.push({
            id: `submission_${submission.id}`,
            source_id: submission.id,
            title: submission.title,
            description: submission.description || "",
            type: "submission",
            source: "submissions",
            country: submission.country || "Global",
            region: submission.region || "",
            organization: submission.organization || "",
            author: submission.submitted_by || "",
            author_id: submission.user_id,
            file_url: submission.file_url,
            status: submission.status || "Approved",
            visibility: visibility as "public" | "private" | "restricted",
            views: submission.views || 0,
            downloads: submission.downloads || 0,
            bookmarks: 0,
            sdg_alignment: submission.sdg_alignment || [],
            tags: submission.tags || [],
            created_at: submission.created_at || new Date().toISOString(),
            updated_at: submission.updated_at || submission.created_at || new Date().toISOString(),
            metadata: submission,
            submission_type: submission.report_type,
            category: submission.category,
            priority: submission.priority,
            likes: submission.likes || 0,
            comments: submission.comments || 0,
            shares: submission.shares || 0,
          });
        });
      }
  
      // 4. Fetch Field Reports - Show approved/verified ones
      const { data: fieldReportsData, error: fieldReportsError } = await supabase
        .from("field_reports")
        .select("*")
        .in("status", ["approved", "verified", "resolved"]);
  
      if (!fieldReportsError && fieldReportsData) {
        console.log(`📊 Found ${fieldReportsData.length} field reports`);
        fieldReportsData.forEach((report: any) => {
          const visibility = report.visibility || "public";
          resources.push({
            id: `field_${report.id}`,
            source_id: report.id,
            title: report.title,
            description: report.description || "",
            type: "field_report",
            source: "field_reports",
            country: report.country || "Global",
            region: "",
            organization: "",
            author: report.reported_by?.name || "Field Reporter",
            author_id: report.user_id,
            file_url: report.evidence_url,
            status: report.status || "Pending",
            visibility: visibility as "public" | "private" | "restricted",
            views: report.views || 0,
            downloads: report.downloads || 0,
            bookmarks: 0,
            sdg_alignment: [],
            tags: [],
            created_at: report.created_at || new Date().toISOString(),
            updated_at: report.updated_at || report.created_at || new Date().toISOString(),
            metadata: report,
            incident_type: report.incident_type,
            severity: report.severity,
            location: report.location,
            evidence_url: report.evidence_url,
            reported_by: report.reported_by,
            likes: report.likes || 0,
            comments: report.comments || 0,
            shares: report.shares || 0,
          });
        });
      } else {
        console.log("No field reports found or error:", fieldReportsError?.message);
      }
  
      // 5. Fetch Working Group Activities
      const { data: activitiesData, error: activitiesError } = await supabase
        .from("working_group_activities")
        .select("*");
  
      if (!activitiesError && activitiesData) {
        console.log(`📊 Found ${activitiesData.length} working group activities`);
        activitiesData.forEach((activity: any) => {
          const visibility = activity.visibility || "public";
          resources.push({
            id: `activity_${activity.id}`,
            source_id: activity.id,
            title: activity.title,
            description: activity.description || "",
            type: "activity",
            source: "working_group_activities",
            country: "Global",
            region: "",
            organization: "",
            author: activity.assigned_to || "",
            author_id: activity.assigned_to,
            file_url: "",
            status: activity.status || "In Progress",
            visibility: visibility as "public" | "private" | "restricted",
            views: 0,
            downloads: 0,
            bookmarks: 0,
            sdg_alignment: [],
            tags: activity.tags || [],
            created_at: activity.created_at || new Date().toISOString(),
            updated_at: activity.updated_at || activity.created_at || new Date().toISOString(),
            metadata: activity,
            activity_status: activity.status,
            progress: activity.progress || 0,
            due_date: activity.due_date,
            priority: activity.priority,
            likes: 0,
            comments: 0,
            shares: 0,
          });
        });
      } else {
        console.log("No activities found or error:", activitiesError?.message);
      }
  
      // 6. Fetch Surveys
      const { data: surveysData, error: surveysError } = await supabase
        .from("surveys")
        .select("*")
        .in("status", ["Active", "published"]);
  
      if (!surveysError && surveysData) {
        surveysData.forEach((survey: any) => {
          const visibility = survey.visibility || "public";
          resources.push({
            id: `survey_${survey.id}`,
            source_id: survey.id,
            title: survey.title,
            description: survey.description || "",
            type: "survey",
            source: "surveys",
            country: "Global",
            region: "",
            organization: "",
            author: survey.created_by || "",
            author_id: survey.created_by,
            file_url: "",
            status: survey.status || "Active",
            visibility: visibility as "public" | "private" | "restricted",
            views: survey.views || 0,
            downloads: 0,
            bookmarks: 0,
            sdg_alignment: [],
            tags: [],
            created_at: survey.created_at || new Date().toISOString(),
            updated_at: survey.updated_at || survey.created_at || new Date().toISOString(),
            metadata: survey,
            survey_type: survey.type,
            response_count: survey.response_count || 0,
            likes: survey.likes || 0,
            comments: survey.comments || 0,
            shares: survey.shares || 0,
          });
        });
      }
  
      console.log(`📊 Total resources fetched: ${resources.length}`);
      console.log(`📊 Breakdown: Research=${researchData?.length || 0}, Reports=${reportsData?.length || 0}, Submissions=${submissionsData?.length || 0}, Field Reports=${fieldReportsData?.length || 0}, Activities=${activitiesData?.length || 0}, Surveys=${surveysData?.length || 0}`);
      
      // Filter resources based on user's visibility permissions
      const visibleResources = resources.filter(r => {
        // If user is admin, show everything
        if (user?.role === "Admin") return true;
        
        // If resource is public, show it
        if (r.visibility === "public") return true;
        
        // If user is logged in and resource is restricted to their country
        if (r.visibility === "restricted" && user) {
          // For field reports, show if user is in same country
          if (r.type === "field_report") {
            return r.country === user.country;
          }
          // For activities, show if user is assigned or in the group
          if (r.type === "activity") {
            return r.author_id === user.id || true; // Adjust based on your group logic
          }
          return r.country === user.country;
        }
        
        // If resource is private and user is the author
        if (r.visibility === "private" && user) {
          return r.author_id === user.id;
        }
        
        return false;
      });
  
      console.log(`📊 Visible resources after filtering: ${visibleResources.length}`);
      setResources(visibleResources);
      setFilteredResources(visibleResources);
      
      // Calculate trending and recommended
      calculateTrending(visibleResources);
      calculateRecommendations(visibleResources);
      
    } catch (error) {
      console.error("Error fetching resources:", error);
      setError("Failed to load resources. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // TRENDING & RECOMMENDATIONS
  // ============================================

  const calculateTrending = (resources: UnifiedResource[]) => {
    const sorted = [...resources].sort((a, b) => {
      const scoreA = (a.views || 0) + (a.downloads || 0) * 2 + (a.bookmarks || 0) * 3 + (a.likes || 0) * 2 + (a.comments || 0);
      const scoreB = (b.views || 0) + (b.downloads || 0) * 2 + (b.bookmarks || 0) * 3 + (b.likes || 0) * 2 + (b.comments || 0);
      return scoreB - scoreA;
    });
    setTrendingResources(sorted.slice(0, 6));
  };

  const calculateRecommendations = (resources: UnifiedResource[]) => {
    if (!user) {
      setRecommendedResources([]);
      return;
    }

    const scored = resources.map(r => {
      let score = 0;
      if (r.country === user.country) score += 3;
      const tags = r.tags || [];
      const userInterests = user.interests || [];
      const matches = tags.filter(t => userInterests.includes(t));
      score += matches.length * 2;
      const sdgs = r.sdg_alignment || [];
      const sdgMatches = sdgs.filter(s => userInterests.includes(s));
      score += sdgMatches.length;
      return { ...r, relevance_score: score };
    });

    const sorted = scored.sort((a, b) => (b.relevance_score || 0) - (a.relevance_score || 0));
    setRecommendedResources(sorted.slice(0, 6));
  };

  // ============================================
  // SEARCH SUGGESTIONS
  // ============================================

  const generateSearchSuggestions = useCallback((term: string) => {
    if (term.length < 2) {
      setSearchSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const termLower = term.toLowerCase();
    const suggestions = resources.filter(r => 
      r.title.toLowerCase().includes(termLower) ||
      r.description?.toLowerCase().includes(termLower) ||
      r.country.toLowerCase().includes(termLower) ||
      r.organization?.toLowerCase().includes(termLower) ||
      r.author?.toLowerCase().includes(termLower) ||
      r.tags?.some(t => t.toLowerCase().includes(termLower))
    ).slice(0, 8);

    setSearchSuggestions(suggestions);
    setShowSuggestions(suggestions.length > 0);
  }, [resources]);

  const handleSearchChange = (value: string) => {
    setFilters({ ...filters, search: value });
    generateSearchSuggestions(value);
    setSelectedSuggestionIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev < searchSuggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedSuggestionIndex >= 0 && searchSuggestions[selectedSuggestionIndex]) {
          const selected = searchSuggestions[selectedSuggestionIndex];
          setFilters({ ...filters, search: selected.title });
          setShowSuggestions(false);
          handleResourceClick(selected);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        break;
    }
  };

  // ============================================
  // RESOURCE CLICK HANDLER
  // ============================================

  const handleResourceClick = (resource: UnifiedResource) => {
    setDetailResource(resource);
    setShowDetailModal(true);
  };

  const handleTrackView = async (resourceId: string) => {
    try {
      const resource = resources.find(r => r.id === resourceId);
      if (!resource) return;

      const tableMap: Record<string, string> = {
        research: 'research_files',
        report: 'reports',
        submission: 'submissions',
        field_report: 'field_reports',
        survey: 'surveys',
        activity: 'working_group_activities',
      };

      const tableName = tableMap[resource.type];
      if (!tableName) return;

      await supabase
        .from(tableName)
        .update({ views: (resource.views || 0) + 1 })
        .eq('id', resource.source_id);

      setResources(prev => prev.map(r => 
        r.id === resourceId ? { ...r, views: (r.views || 0) + 1 } : r
      ));
      setFilteredResources(prev => prev.map(r => 
        r.id === resourceId ? { ...r, views: (r.views || 0) + 1 } : r
      ));
    } catch (error) {
      console.error("Error tracking view:", error);
    }
  };

  const handleTrackDownload = async (resourceId: string) => {
    try {
      const resource = resources.find(r => r.id === resourceId);
      if (!resource) return;

      const tableMap: Record<string, string> = {
        research: 'research_files',
        report: 'reports',
        submission: 'submissions',
        field_report: 'field_reports',
      };

      const tableName = tableMap[resource.type];
      if (!tableName) return;

      await supabase
        .from(tableName)
        .update({ downloads: (resource.downloads || 0) + 1 })
        .eq('id', resource.source_id);

      setResources(prev => prev.map(r => 
        r.id === resourceId ? { ...r, downloads: (r.downloads || 0) + 1 } : r
      ));
      setFilteredResources(prev => prev.map(r => 
        r.id === resourceId ? { ...r, downloads: (r.downloads || 0) + 1 } : r
      ));
    } catch (error) {
      console.error("Error tracking download:", error);
    }
  };

  // ============================================
  // FILTERING & SORTING
  // ============================================

  useEffect(() => {
    applyFilters();
  }, [resources, filters]);

  const applyFilters = () => {
    let filtered = [...resources];

    if (filters.search) {
      const term = filters.search.toLowerCase();
      filtered = filtered.filter(r =>
        r.title.toLowerCase().includes(term) ||
        r.description?.toLowerCase().includes(term) ||
        r.country.toLowerCase().includes(term) ||
        r.organization?.toLowerCase().includes(term) ||
        r.author?.toLowerCase().includes(term) ||
        r.tags?.some(t => t.toLowerCase().includes(term))
      );
    }

    if (filters.type !== "all") {
      filtered = filtered.filter(r => r.type === filters.type);
    }

    if (filters.country !== "all") {
      filtered = filtered.filter(r => r.country === filters.country);
    }

    if (filters.region !== "all") {
      filtered = filtered.filter(r => r.region === filters.region);
    }

    if (filters.sdg !== "all") {
      filtered = filtered.filter(r => r.sdg_alignment?.includes(filters.sdg));
    }

    if (filters.status !== "all") {
      filtered = filtered.filter(r => r.status === filters.status);
    }

    if (filters.visibility !== "all") {
      filtered = filtered.filter(r => r.visibility === filters.visibility);
    }

    if (filters.severity !== "all") {
      filtered = filtered.filter(r => r.severity === filters.severity);
    }

    if (filters.hasFile) {
      filtered = filtered.filter(r => r.file_url || r.evidence_url);
    }

    if (filters.dateRange !== "all") {
      const now = new Date();
      let cutoff = new Date();
      switch (filters.dateRange) {
        case "today":
          cutoff.setHours(0, 0, 0, 0);
          break;
        case "week":
          cutoff.setDate(now.getDate() - 7);
          break;
        case "month":
          cutoff.setMonth(now.getMonth() - 1);
          break;
        case "quarter":
          cutoff.setMonth(now.getMonth() - 3);
          break;
        case "year":
          cutoff.setFullYear(now.getFullYear() - 1);
          break;
      }
      filtered = filtered.filter(r => new Date(r.created_at) >= cutoff);
    }

    switch (filters.sortBy) {
      case "newest":
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
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
      case "most_bookmarked":
        filtered.sort((a, b) => (b.bookmarks || 0) - (a.bookmarks || 0));
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

    setFilteredResources(filtered);
    setTotalPages(Math.ceil(filtered.length / ITEMS_PER_PAGE));
    setCurrentPage(1);
  };

  const getUniqueCountries = () => {
    const countries = new Set(resources.map(r => r.country).filter(Boolean));
    return Array.from(countries).sort();
  };

  // ============================================
  // PAGINATION
  // ============================================

  const getPaginatedResources = () => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return filteredResources.slice(start, end);
  };

  // ============================================
  // HELPERS
  // ============================================

  const clearFilters = () => {
    setFilters({
      search: "",
      type: "all",
      country: "all",
      region: "all",
      category: "all",
      sdg: "all",
      sortBy: "newest",
      dateRange: "all",
      status: "all",
      visibility: "all",
      severity: "all",
      hasFile: false,
    });
    setSearchSuggestions([]);
    setShowSuggestions(false);
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      research: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      report: "bg-purple-500/10 text-purple-400 border-purple-500/20",
      submission: "bg-green-500/10 text-green-400 border-green-500/20",
      survey: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
      activity: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
      field_report: "bg-red-500/10 text-red-400 border-red-500/20",
    };
    return colors[type] || "bg-slate-500/10 text-slate-400 border-slate-500/20";
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, any> = {
      research: BookOpen,
      report: FileText,
      submission: FileText,
      survey: BarChart3,
      activity: Users,
      field_report: Flag,
    };
    return icons[type] || FileText;
  };

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case "public": return <Globe className="w-3 h-3 text-emerald-400" />;
      case "restricted": return <Lock className="w-3 h-3 text-yellow-400" />;
      case "private": return <Shield className="w-3 h-3 text-red-400" />;
      default: return <Globe className="w-3 h-3 text-slate-400" />;
    }
  };

  const getVisibilityLabel = (visibility: string) => {
    switch (visibility) {
      case "public": return "Public";
      case "restricted": return "Restricted";
      case "private": return "Private";
      default: return visibility;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-red-500/20 text-red-400 border-red-500/20";
      case "high": return "bg-orange-500/20 text-orange-400 border-orange-500/20";
      case "medium": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/20";
      case "low": return "bg-emerald-500/20 text-emerald-400 border-emerald-500/20";
      default: return "bg-slate-500/20 text-slate-400 border-slate-500/20";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Approved":
      case "Published":
      case "Completed":
      case "verified":
        return "bg-emerald-500/20 text-emerald-400";
      case "Pending":
      case "pending":
        return "bg-yellow-500/20 text-yellow-400";
      case "Under Review":
        return "bg-blue-500/20 text-blue-400";
      case "In Progress":
        return "bg-cyan-500/20 text-cyan-400";
      case "Rejected":
        return "bg-red-500/20 text-red-400";
      default:
        return "bg-slate-500/20 text-slate-400";
    }
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

  // ============================================
  // SHARE & CITATION
  // ============================================

  const handleShare = (resource: UnifiedResource) => {
    setSelectedResource(resource);
    setShowShareModal(true);
  };

  const handleCite = (resource: UnifiedResource) => {
    setSelectedResource(resource);
    setShowCitationModal(true);
  };

  const generateCitation = (resource: UnifiedResource, format: string) => {
    const author = resource.author || "Unknown Author";
    const year = new Date(resource.created_at).getFullYear();
    const title = resource.title;
    const url = window.location.origin + `/knowledge-repository/${resource.id}`;

    switch (format) {
      case "apa":
        return `${author}. (${year}). *${title}*. Retrieved from ${url}`;
      case "mla":
        return `${author}. "${title}." *Knowledge Repository*, ${year}, ${url}.`;
      case "chicago":
        return `${author}. "${title}." Knowledge Repository. ${year}. ${url}.`;
      case "harvard":
        return `${author} (${year}) '${title}', Knowledge Repository. Available at: ${url} (Accessed: ${new Date().toLocaleDateString()})`;
      case "vancouver":
        return `${author}. ${title}. Knowledge Repository [Internet]. ${year} [cited ${new Date().toLocaleDateString()}]. Available from: ${url}`;
      case "bibtex":
        return `@misc{${resource.id},
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
      email: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`Check out this resource: ${url}`)}`,
    };
    window.open(shareUrls[platform], "_blank", "width=600,height=400");
  };

  // ============================================
  // RENDER
  // ============================================

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

  const paginatedResources = getPaginatedResources();

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
                    KNOWLEDGE REPOSITORY
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Sparkles className="w-4 h-4 text-yellow-400" />
                  <span className="text-slate-400 text-xs">
                    {filteredResources.length} Resources
                  </span>
                </div>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Knowledge Repository
              </h1>
              <p className="text-slate-300 text-base md:text-lg mt-3 max-w-2xl">
                Discover research, reports, submissions, surveys, activities, and field reports from across the continent.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={fetchAllResources}
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
        {/* Error State */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 flex items-center justify-between">
            <p className="text-red-400 text-sm">{error}</p>
            <button
              onClick={fetchAllResources}
              className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-400 text-sm transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center gap-2 mb-1">
              <FolderOpen className="w-4 h-4 text-cyan-400" />
              <p className="text-slate-400 text-xs">Total Resources</p>
            </div>
            <p className="text-2xl font-bold text-white">{filteredResources.length}</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center gap-2 mb-1">
              <Globe className="w-4 h-4 text-emerald-400" />
              <p className="text-slate-400 text-xs">Public</p>
            </div>
            <p className="text-2xl font-bold text-white">
              {resources.filter(r => r.visibility === "public").length}
            </p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center gap-2 mb-1">
              <Lock className="w-4 h-4 text-yellow-400" />
              <p className="text-slate-400 text-xs">Restricted</p>
            </div>
            <p className="text-2xl font-bold text-white">
              {resources.filter(r => r.visibility === "restricted").length}
            </p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-yellow-400" />
              <p className="text-slate-400 text-xs">Trending</p>
            </div>
            <p className="text-2xl font-bold text-white">{trendingResources.length}</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="w-4 h-4 text-yellow-400" />
              <p className="text-slate-400 text-xs">SDG Alignments</p>
            </div>
            <p className="text-2xl font-bold text-white">
              {new Set(resources.flatMap(r => r.sdg_alignment || [])).size}
            </p>
          </div>
        </div>

        {/* Trending Section */}
        {trendingResources.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Flame className="w-5 h-5 text-orange-400" />
              <h2 className="text-xl font-bold text-white">Trending Resources</h2>
              <span className="text-slate-400 text-sm">Most engaged content</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {trendingResources.slice(0, 3).map((resource) => (
                <div 
                  key={resource.id} 
                  className="bg-slate-800/50 rounded-xl border border-orange-500/20 p-4 hover:border-orange-500/40 transition-all cursor-pointer"
                  onClick={() => handleResourceClick(resource)}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${getTypeColor(resource.type)}`}>
                      {resource.type}
                    </span>
                    {getVisibilityIcon(resource.visibility)}
                  </div>
                  <h4 className="text-white font-medium line-clamp-1">{resource.title}</h4>
                  <p className="text-slate-400 text-sm line-clamp-1">{resource.country}</p>
                  <div className="flex gap-3 mt-2 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {resource.views || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <Download className="w-3 h-3" />
                      {resource.downloads || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="w-3 h-3" />
                      {resource.likes || 0}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommended Section */}
        {recommendedResources.length > 0 && user && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <h2 className="text-xl font-bold text-white">Recommended for You</h2>
              <span className="text-slate-400 text-sm">Based on your interests</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recommendedResources.slice(0, 3).map((resource) => (
                <div 
                  key={resource.id} 
                  className="bg-slate-800/50 rounded-xl border border-purple-500/20 p-4 hover:border-purple-500/40 transition-all cursor-pointer"
                  onClick={() => handleResourceClick(resource)}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${getTypeColor(resource.type)}`}>
                      {resource.type}
                    </span>
                    {getVisibilityIcon(resource.visibility)}
                  </div>
                  <h4 className="text-white font-medium line-clamp-1">{resource.title}</h4>
                  <p className="text-slate-400 text-sm line-clamp-1">{resource.country}</p>
                  <div className="flex gap-3 mt-2 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      {(resource.relevance_score || 0).toFixed(1)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {resource.views || 0}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search & Filters */}
        <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search resources, research, reports..."
                value={filters.search}
                onChange={(e) => handleSearchChange(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => filters.search.length > 1 && generateSearchSuggestions(filters.search)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                className="w-full bg-slate-700 border border-slate-600 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
              />
              
              {/* Search Suggestions Dropdown */}
              {showSuggestions && searchSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-xl z-30 max-h-[400px] overflow-y-auto">
                  {searchSuggestions.map((suggestion, index) => (
                    <div
                      key={suggestion.id}
                      onClick={() => {
                        setFilters({ ...filters, search: suggestion.title });
                        setShowSuggestions(false);
                        handleResourceClick(suggestion);
                      }}
                      className={`px-4 py-3 hover:bg-slate-700 cursor-pointer transition-colors border-b border-slate-700/50 last:border-b-0 ${
                        index === selectedSuggestionIndex ? 'bg-slate-700' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-1.5 rounded-lg ${getTypeColor(suggestion.type)}`}>
                          {getTypeIcon(suggestion.type) && (
                            <span className="w-4 h-4" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium text-sm truncate">{suggestion.title}</p>
                          <div className="flex items-center gap-3 text-xs text-slate-400">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {suggestion.country}
                            </span>
                            {suggestion.organization && (
                              <span className="flex items-center gap-1">
                                <Building2 className="w-3 h-3" />
                                {suggestion.organization}
                              </span>
                            )}
                            <span className={`px-1.5 py-0.5 rounded-full text-xs ${getStatusBadge(suggestion.status)}`}>
                              {suggestion.status}
                            </span>
                          </div>
                        </div>
                        <span className="text-slate-500 text-xs whitespace-nowrap">
                          {suggestion.type}
                        </span>
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center justify-between px-4 py-2 bg-slate-900/50 border-t border-slate-700">
                    <span className="text-slate-500 text-xs">
                      {searchSuggestions.length} results found
                    </span>
                    <button
                      onClick={() => {
                        setShowSuggestions(false);
                        searchInputRef.current?.blur();
                      }}
                      className="text-cyan-400 text-xs hover:text-cyan-300 transition-colors flex items-center gap-1"
                    >
                      View All Results
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}
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

            {bookmarks.size > 0 && (
              <button
                onClick={() => {
                  const bookmarked = resources.filter(r => bookmarks.has(r.id));
                  setFilteredResources(bookmarked);
                }}
                className="px-4 py-2.5 bg-yellow-500/20 hover:bg-yellow-500/30 rounded-xl text-yellow-400 text-sm transition-colors flex items-center gap-2"
              >
                <Bookmark className="w-4 h-4" />
                Bookmarks ({bookmarks.size})
              </button>
            )}
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4 pt-4 border-t border-slate-700">
              <div>
                <label className="text-slate-400 text-sm block mb-2">Resource Type</label>
                <select
                  value={filters.type}
                  onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                >
                  {RESOURCE_TYPES.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 text-sm block mb-2">Country</label>
                <select
                  value={filters.country}
                  onChange={(e) => setFilters({ ...filters, country: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="all">All Countries</option>
                  {getUniqueCountries().map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 text-sm block mb-2">Region</label>
                <select
                  value={filters.region}
                  onChange={(e) => setFilters({ ...filters, region: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                >
                  {REGIONS.map(region => (
                    <option key={region} value={region === "All Regions" ? "all" : region}>
                      {region}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 text-sm block mb-2">SDG Alignment</label>
                <select
                  value={filters.sdg}
                  onChange={(e) => setFilters({ ...filters, sdg: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="all">All SDGs</option>
                  {SDG_OPTIONS.map(sdg => (
                    <option key={sdg} value={sdg}>{sdg}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 text-sm block mb-2">Visibility</label>
                <select
                  value={filters.visibility}
                  onChange={(e) => setFilters({ ...filters, visibility: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                >
                  {VISIBILITY_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 text-sm block mb-2">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                >
                  {STATUS_OPTIONS.map(status => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 text-sm block mb-2">Severity</label>
                <select
                  value={filters.severity}
                  onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                >
                  {SEVERITY_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 text-sm block mb-2">Date Range</label>
                <select
                  value={filters.dateRange}
                  onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                >
                  {DATE_RANGES.map(range => (
                    <option key={range.value} value={range.value}>{range.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 text-sm block mb-2">Sort By</label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                >
                  {SORT_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-end gap-2">
                <button
                  onClick={clearFilters}
                  className="flex-1 px-4 py-2.5 bg-red-500/20 hover:bg-red-500/30 rounded-xl text-red-400 text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Clear All
                </button>
                <button
                  onClick={() => setFilters({ ...filters, hasFile: !filters.hasFile })}
                  className={`px-4 py-2.5 rounded-xl text-sm transition-colors flex items-center gap-2 ${
                    filters.hasFile
                      ? "bg-cyan-600 text-white"
                      : "bg-slate-700 text-slate-400 hover:text-white"
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  Has File
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="flex justify-between items-center mb-4">
          <p className="text-slate-400 text-sm">
            Showing <span className="text-white font-medium">{paginatedResources.length}</span> of{" "}
            <span className="text-white font-medium">{filteredResources.length}</span> resources
          </p>
        </div>

        {/* Resources Grid */}
        {paginatedResources.length === 0 ? (
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-12 text-center">
            <FolderOpen className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">No resources found</p>
            <p className="text-slate-500 text-sm mt-2">
              {filters.search || filters.type !== "all" || filters.country !== "all" || filters.sdg !== "all"
                ? "Try adjusting your search or filters"
                : "Check back later for new resources"}
            </p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedResources.map((resource) => {
              const isBookmarked = bookmarks.has(resource.id);
              const TypeIcon = getTypeIcon(resource.type);
              const typeColor = getTypeColor(resource.type);
              
              return (
                <div
                  key={resource.id}
                  className="bg-slate-800/50 rounded-2xl border border-slate-700 hover:border-cyan-500/30 transition-all overflow-hidden group cursor-pointer relative"
                  onClick={() => handleResourceClick(resource)}
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <TypeIcon className={`w-4 h-4 ${typeColor.replace(/border.*$/, '').trim()}`} />
                        <span className={`px-2 py-1 rounded-full text-xs border ${typeColor}`}>
                          {resource.type}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBookmark(resource.id);
                          }}
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
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShare(resource);
                          }}
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
                      {resource.country && (
                        <p className="flex items-center gap-2">
                          <MapPin className="w-3 h-3 text-cyan-400" />
                          {resource.country}
                        </p>
                      )}
                      {resource.organization && (
                        <p className="flex items-center gap-2">
                          <Building2 className="w-3 h-3 text-cyan-400" />
                          {resource.organization}
                        </p>
                      )}
                      {resource.author && (
                        <p className="flex items-center gap-2">
                          <User className="w-3 h-3 text-cyan-400" />
                          {resource.author}
                        </p>
                      )}
                      <p className="flex items-center gap-2">
                        <Calendar className="w-3 h-3 text-cyan-400" />
                        {new Date(resource.created_at).toLocaleDateString()}
                      </p>
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

                    {resource.sdg_alignment && resource.sdg_alignment.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {resource.sdg_alignment.slice(0, 3).map((sdg) => (
                          <span key={sdg} className={`px-2 py-0.5 rounded-full text-xs ${getSdgColor(sdg)}`}>
                            {sdg}
                          </span>
                        ))}
                        {resource.sdg_alignment.length > 3 && (
                          <span className="px-2 py-0.5 rounded-full text-xs bg-slate-700 text-slate-400">
                            +{resource.sdg_alignment.length - 3}
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
                        <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusBadge(resource.status)}`}>
                          {resource.status}
                        </span>
                        {getVisibilityIcon(resource.visibility)}
                      </div>
                      <div className="flex gap-2">
                        {resource.file_url && (
                          <a
                            href={resource.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTrackView(resource.id);
                            }}
                            className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-white text-xs transition-colors flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" />
                            View
                          </a>
                        )}
                        {resource.evidence_url && (
                          <a
                            href={resource.evidence_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTrackView(resource.id);
                            }}
                            className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 rounded-lg text-white text-xs transition-colors flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" />
                            Evidence
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // List View
          <div className="space-y-4">
            {paginatedResources.map((resource) => {
              const isBookmarked = bookmarks.has(resource.id);
              const TypeIcon = getTypeIcon(resource.type);
              const typeColor = getTypeColor(resource.type);
              
              return (
                <div
                  key={resource.id}
                  className="bg-slate-800/50 rounded-2xl border border-slate-700 hover:border-cyan-500/30 transition-all p-6 group cursor-pointer"
                  onClick={() => handleResourceClick(resource)}
                >
                  <div className="flex flex-wrap justify-between items-start gap-4">
                    <div className="flex-1 min-w-[200px]">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <TypeIcon className={`w-4 h-4 ${typeColor.replace(/border.*$/, '').trim()}`} />
                        <span className={`px-2 py-1 rounded-full text-xs border ${typeColor}`}>
                          {resource.type}
                        </span>
                        <h3 className="text-xl font-bold text-white">{resource.title}</h3>
                      </div>
                      <p className="text-slate-400 text-sm mb-3 line-clamp-2">{resource.description}</p>
                      <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                        {resource.country && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {resource.country}
                          </span>
                        )}
                        {resource.organization && (
                          <span className="flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            {resource.organization}
                          </span>
                        )}
                        {resource.author && (
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {resource.author}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(resource.created_at).toLocaleDateString()}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusBadge(resource.status)}`}>
                          {resource.status}
                        </span>
                        {getVisibilityIcon(resource.visibility)}
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
                      {resource.sdg_alignment && resource.sdg_alignment.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {resource.sdg_alignment.map((sdg) => (
                            <span key={sdg} className={`px-2 py-0.5 rounded-full text-xs ${getSdgColor(sdg)}`}>
                              {sdg}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBookmark(resource.id);
                          }}
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
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShare(resource);
                          }}
                          className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-400 hover:text-white transition-colors"
                          title="Share"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex gap-2">
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          <Eye className="w-3 h-3" />
                          {resource.views || 0}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          <Download className="w-3 h-3" />
                          {resource.downloads || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronDown className="w-5 h-5 rotate-90" />
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
              <ChevronDown className="w-5 h-5 -rotate-90" />
            </button>
            <span className="text-slate-500 text-sm ml-2">
              Page {currentPage} of {totalPages}
            </span>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && detailResource && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4"
          onClick={() => setShowDetailModal(false)}
        >
          <div 
            className="bg-slate-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-slate-800 p-6 border-b border-slate-700 flex justify-between items-start z-10">
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className={`px-2 py-1 rounded-full text-xs border ${getTypeColor(detailResource.type)}`}>
                    {detailResource.type}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadge(detailResource.status)}`}>
                    {detailResource.status}
                  </span>
                  {detailResource.visibility && (
                    <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-slate-700 text-slate-300">
                      {getVisibilityIcon(detailResource.visibility)}
                      {getVisibilityLabel(detailResource.visibility)}
                    </span>
                  )}
                  {detailResource.severity && (
                    <span className={`px-2 py-1 rounded-full text-xs ${getSeverityColor(detailResource.severity)}`}>
                      {detailResource.severity}
                    </span>
                  )}
                </div>
                <h2 className="text-2xl font-bold text-white mt-2">{detailResource.title}</h2>
              </div>
              <button 
                onClick={() => setShowDetailModal(false)}
                className="text-slate-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Description */}
              {detailResource.description && (
                <div>
                  <h3 className="text-slate-400 text-sm font-semibold mb-2">Description</h3>
                  <p className="text-slate-300 leading-relaxed">{detailResource.description}</p>
                </div>
              )}

              {/* Metadata Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {detailResource.country && (
                  <div className="bg-slate-700/30 rounded-xl p-3">
                    <p className="text-slate-400 text-xs">Country</p>
                    <p className="text-white font-medium">{detailResource.country}</p>
                  </div>
                )}
                {detailResource.region && (
                  <div className="bg-slate-700/30 rounded-xl p-3">
                    <p className="text-slate-400 text-xs">Region</p>
                    <p className="text-white font-medium">{detailResource.region}</p>
                  </div>
                )}
                {detailResource.organization && (
                  <div className="bg-slate-700/30 rounded-xl p-3">
                    <p className="text-slate-400 text-xs">Organization</p>
                    <p className="text-white font-medium">{detailResource.organization}</p>
                  </div>
                )}
                {detailResource.author && (
                  <div className="bg-slate-700/30 rounded-xl p-3">
                    <p className="text-slate-400 text-xs">Author</p>
                    <p className="text-white font-medium">{detailResource.author}</p>
                  </div>
                )}
                {detailResource.created_at && (
                  <div className="bg-slate-700/30 rounded-xl p-3">
                    <p className="text-slate-400 text-xs">Created</p>
                    <p className="text-white font-medium">{new Date(detailResource.created_at).toLocaleDateString()}</p>
                  </div>
                )}
                {detailResource.report_type && (
                  <div className="bg-slate-700/30 rounded-xl p-3">
                    <p className="text-slate-400 text-xs">Report Type</p>
                    <p className="text-white font-medium">{detailResource.report_type}</p>
                  </div>
                )}
                {detailResource.incident_type && (
                  <div className="bg-slate-700/30 rounded-xl p-3">
                    <p className="text-slate-400 text-xs">Incident Type</p>
                    <p className="text-white font-medium">{detailResource.incident_type}</p>
                  </div>
                )}
                {detailResource.location && (
                  <div className="bg-slate-700/30 rounded-xl p-3">
                    <p className="text-slate-400 text-xs">Location</p>
                    <p className="text-white font-medium">{detailResource.location}</p>
                  </div>
                )}
                {detailResource.progress !== undefined && (
                  <div className="bg-slate-700/30 rounded-xl p-3">
                    <p className="text-slate-400 text-xs">Progress</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-600 rounded-full h-2">
                        <div 
                          className="bg-cyan-500 h-2 rounded-full transition-all"
                          style={{ width: `${detailResource.progress}%` }}
                        />
                      </div>
                      <span className="text-white font-medium">{detailResource.progress}%</span>
                    </div>
                  </div>
                )}
                {detailResource.due_date && (
                  <div className="bg-slate-700/30 rounded-xl p-3">
                    <p className="text-slate-400 text-xs">Due Date</p>
                    <p className="text-white font-medium">{new Date(detailResource.due_date).toLocaleDateString()}</p>
                  </div>
                )}
              </div>

              {/* Tags */}
              {detailResource.tags && detailResource.tags.length > 0 && (
                <div>
                  <h3 className="text-slate-400 text-sm font-semibold mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {detailResource.tags.map((tag, index) => (
                      <span key={index} className="px-3 py-1 bg-slate-700 rounded-full text-slate-300 text-sm">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* SDG Alignment */}
              {detailResource.sdg_alignment && detailResource.sdg_alignment.length > 0 && (
                <div>
                  <h3 className="text-slate-400 text-sm font-semibold mb-2">SDG Alignment</h3>
                  <div className="flex flex-wrap gap-2">
                    {detailResource.sdg_alignment.map((sdg, index) => (
                      <span key={index} className={`px-3 py-1 rounded-full text-sm ${getSdgColor(sdg)}`}>
                        {sdg}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-700">
                {detailResource.file_url && (
                  <>
                    <a
                      href={detailResource.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => handleTrackView(detailResource.id)}
                      className="flex-1 min-w-[120px] px-4 py-3 bg-cyan-600 hover:bg-cyan-700 rounded-xl text-white font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      View File
                    </a>
                    <a
                      href={detailResource.file_url}
                      download
                      onClick={() => handleTrackDownload(detailResource.id)}
                      className="flex-1 min-w-[120px] px-4 py-3 bg-emerald-600 hover:bg-emerald-700 rounded-xl text-white font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </a>
                  </>
                )}
                {detailResource.evidence_url && (
                  <a
                    href={detailResource.evidence_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 min-w-[120px] px-4 py-3 bg-orange-600 hover:bg-orange-700 rounded-xl text-white font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View Evidence
                  </a>
                )}
                <button
                  onClick={() => handleBookmark(detailResource.id)}
                  className={`flex-1 min-w-[100px] px-4 py-3 rounded-xl text-white font-medium transition-colors flex items-center justify-center gap-2 ${
                    bookmarks.has(detailResource.id)
                      ? "bg-yellow-600 hover:bg-yellow-700"
                      : "bg-slate-700 hover:bg-slate-600"
                  }`}
                >
                  {bookmarks.has(detailResource.id) ? (
                    <>
                      <BookmarkCheck className="w-4 h-4" />
                      Bookmarked
                    </>
                  ) : (
                    <>
                      <Bookmark className="w-4 h-4" />
                      Bookmark
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setSelectedResource(detailResource);
                    setShowShareModal(true);
                  }}
                  className="flex-1 min-w-[100px] px-4 py-3 bg-purple-600 hover:bg-purple-700 rounded-xl text-white font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
                <button
                  onClick={() => {
                    setSelectedResource(detailResource);
                    setShowCitationModal(true);
                  }}
                  className="flex-1 min-w-[100px] px-4 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-white font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Quote className="w-4 h-4" />
                  Cite
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && selectedResource && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[70] p-4" onClick={() => setShowShareModal(false)}>
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
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => shareOnSocial("twitter", window.location.href, selectedResource.title)}
                  className="flex-1 p-3 bg-slate-700 hover:bg-slate-600 rounded-xl text-white transition-colors flex items-center justify-center gap-2"
                >
                  <Twitter className="w-5 h-5 text-blue-400" />
                  Twitter
                </button>
                <button
                  onClick={() => shareOnSocial("linkedin", window.location.href, selectedResource.title)}
                  className="flex-1 p-3 bg-slate-700 hover:bg-slate-600 rounded-xl text-white transition-colors flex items-center justify-center gap-2"
                >
                  <Linkedin className="w-5 h-5 text-blue-600" />
                  LinkedIn
                </button>
                <button
                  onClick={() => shareOnSocial("facebook", window.location.href, selectedResource.title)}
                  className="flex-1 p-3 bg-slate-700 hover:bg-slate-600 rounded-xl text-white transition-colors flex items-center justify-center gap-2"
                >
                  <Facebook className="w-5 h-5 text-blue-500" />
                  Facebook
                </button>
                <button
                  onClick={() => shareOnSocial("email", window.location.href, selectedResource.title)}
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
      {showCitationModal && selectedResource && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[70] p-4" onClick={() => setShowCitationModal(false)}>
          <div className="bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-700">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Quote className="w-5 h-5 text-cyan-400" />
                  Cite This Resource
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
                  <option value="apa">APA 7th Edition</option>
                  <option value="mla">MLA 9th Edition</option>
                  <option value="chicago">Chicago 17th Edition</option>
                  <option value="harvard">Harvard</option>
                  <option value="vancouver">Vancouver</option>
                  <option value="bibtex">BibTeX</option>
                </select>
              </div>
              <div className="bg-slate-700/30 rounded-xl p-4">
                <p className="text-white text-sm whitespace-pre-wrap font-mono">
                  {generateCitation(selectedResource, citationFormat)}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => copyToClipboard(generateCitation(selectedResource, citationFormat))}
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
    </div>
  );
}