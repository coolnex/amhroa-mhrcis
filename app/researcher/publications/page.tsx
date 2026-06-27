// app/researcher/publications/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  Search,
  Filter,
  Tag,
  RefreshCw,
  Loader2,
  Plus,
  Eye,
  Award,
  Download,
  Calendar,
  Users,
  BookOpen,
  Globe,
  Link2,
  Share2,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Grid,
  List,
  X,
  AlertCircle,
  CheckCircle,
  Clock,
  ExternalLink,
  Sparkles,
  TrendingUp,
  BarChart3,
  User,
  Building2,
  Mail,
  Twitter,
  Linkedin,
} from "lucide-react";
import { CountrySelect } from "@/components/ui/country-select";

interface Publication {
  id: string;
  title: string;
  authors: string[];
  journal: string;
  doi: string;
  citations: number;
  downloads: number;
  publication_date: string;
  university_id: string;
  university_name?: string;
  status: "Published" | "Under Review" | "In Progress" | "Accepted";
  research_area: string;
  abstract: string;
  keywords: string[];
  url?: string;
  pdf_url?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  publisher?: string;
  issn?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}

const statusOptions = [
  "All Status",
  "Published",
  "Under Review",
  "In Progress",
  "Accepted",
];

const researchAreas = [
  "All Areas",
  "Mental Health Research",
  "Policy Analysis",
  "Community Research",
  "Clinical Trials",
  "Data Science",
  "Public Health",
  "Health Economics",
  "Implementation Science",
  "Qualitative Research",
  "Quantitative Research",
  "Mixed Methods",
  "Epidemiology",
  "Health Systems",
  "Global Health",
  "Neuroscience",
  "Psychology",
  "Psychiatry",
  "Social Work",
  "Nursing",
  "Pharmacy",
  "Public Policy",
  "Health Law",
  "Bioethics",
  "Health Informatics",
];

export default function ResearcherPublicationsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [selectedArea, setSelectedArea] = useState("All Areas");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedPublication, setSelectedPublication] = useState<Publication | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [universities, setUniversities] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    authors: [] as string[],
    journal: "",
    doi: "",
    publication_date: "",
    university_id: "",
    status: "Published",
    research_area: "",
    abstract: "",
    keywords: [] as string[],
    url: "",
    pdf_url: "",
    volume: "",
    issue: "",
    pages: "",
    publisher: "",
    issn: "",
  });

  const [newAuthor, setNewAuthor] = useState("");
  const [newKeyword, setNewKeyword] = useState("");

  useEffect(() => {
    checkAuth();
    fetchUniversities();
    fetchPublications();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    if (!token || !userStr) {
      router.push("/login");
      return;
    }

    try {
      const userData = JSON.parse(userStr);
      if (userData.role !== "Researcher" && userData.role !== "Admin" && userData.role !== "University") {
        router.push("/dashboard");
        return;
      }
      setUser(userData);
    } catch (error) {
      console.error("Error parsing user data:", error);
      router.push("/login");
    }
  };

  const fetchUniversities = async () => {
    try {
      const { data, error } = await supabase
        .from("universities")
        .select("id, name")
        .eq("status", "Active")
        .order("name", { ascending: true });

      if (error) throw error;
      setUniversities(data || []);
    } catch (error) {
      console.error("Error fetching universities:", error);
    }
  };

  const fetchPublications = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("publications")
        .select(`
          *,
          university:university_id (
            name
          )
        `)
        .order("publication_date", { ascending: false });

      if (error) throw error;

      const publicationsWithNames = (data || []).map((p: any) => ({
        ...p,
        university_name: p.university?.name,
      }));

      setPublications(publicationsWithNames);
    } catch (error) {
      console.error("Error fetching publications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePublication = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.journal.trim() || !formData.publication_date) {
      alert("Please fill in all required fields");
      return;
    }

    if (formData.authors.length === 0) {
      alert("Please add at least one author");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from("publications")
        .insert({
          title: formData.title,
          authors: formData.authors,
          journal: formData.journal,
          doi: formData.doi || null,
          publication_date: formData.publication_date,
          university_id: formData.university_id || null,
          status: formData.status,
          research_area: formData.research_area || null,
          abstract: formData.abstract || null,
          keywords: formData.keywords,
          url: formData.url || null,
          pdf_url: formData.pdf_url || null,
          volume: formData.volume || null,
          issue: formData.issue || null,
          pages: formData.pages || null,
          publisher: formData.publisher || null,
          issn: formData.issn || null,
          created_by: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      alert("Publication added successfully!");
      setShowCreateModal(false);
      resetForm();
      fetchPublications();
    } catch (error) {
      console.error("Error creating publication:", error);
      alert("Failed to create publication. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      authors: [],
      journal: "",
      doi: "",
      publication_date: "",
      university_id: "",
      status: "Published",
      research_area: "",
      abstract: "",
      keywords: [],
      url: "",
      pdf_url: "",
      volume: "",
      issue: "",
      pages: "",
      publisher: "",
      issn: "",
    });
    setNewAuthor("");
    setNewKeyword("");
  };

  const addAuthor = () => {
    if (newAuthor.trim() && !formData.authors.includes(newAuthor.trim())) {
      setFormData({
        ...formData,
        authors: [...formData.authors, newAuthor.trim()],
      });
      setNewAuthor("");
    }
  };

  const removeAuthor = (author: string) => {
    setFormData({
      ...formData,
      authors: formData.authors.filter(a => a !== author),
    });
  };

  const addKeyword = () => {
    if (newKeyword.trim() && !formData.keywords.includes(newKeyword.trim())) {
      setFormData({
        ...formData,
        keywords: [...formData.keywords, newKeyword.trim()],
      });
      setNewKeyword("");
    }
  };

  const removeKeyword = (keyword: string) => {
    setFormData({
      ...formData,
      keywords: formData.keywords.filter(k => k !== keyword),
    });
  };

  const filteredPublications = useMemo(() => {
    let filtered = publications;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(term) ||
        p.authors.some(a => a.toLowerCase().includes(term)) ||
        p.journal.toLowerCase().includes(term) ||
        p.research_area?.toLowerCase().includes(term) ||
        p.keywords?.some(k => k.toLowerCase().includes(term))
      );
    }

    if (selectedStatus !== "All Status") {
      filtered = filtered.filter(p => p.status === selectedStatus);
    }

    if (selectedArea !== "All Areas") {
      filtered = filtered.filter(p => p.research_area === selectedArea);
    }

    return filtered;
  }, [publications, searchTerm, selectedStatus, selectedArea]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Published":
        return { color: "bg-emerald-500/20 text-emerald-400", icon: CheckCircle };
      case "Accepted":
        return { color: "bg-blue-500/20 text-blue-400", icon: CheckCircle };
      case "Under Review":
        return { color: "bg-yellow-500/20 text-yellow-400", icon: Clock };
      case "In Progress":
        return { color: "bg-purple-500/20 text-purple-400", icon: Clock };
      default:
        return { color: "bg-slate-500/20 text-slate-400", icon: Clock };
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const generateCitation = (pub: Publication) => {
    const authors = pub.authors.join(", ");
    const year = new Date(pub.publication_date).getFullYear();
    return `${authors} (${year}). ${pub.title}. ${pub.journal}, ${pub.volume || ""}${pub.issue ? `(${pub.issue})` : ""}${pub.pages ? `, ${pub.pages}` : ""}.`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-300">Loading publications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-cyan-950 to-slate-900 border-b border-cyan-500/20">
        <div className="relative px-6 md:px-8 py-8 md:py-10">
          <Link href="/researcher" className="inline-flex items-center gap-2 text-slate-400 hover:text-cyan-400 mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>

          <div className="flex justify-between items-start flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="px-3 py-1 bg-cyan-500/20 rounded-full border border-cyan-500/30">
                  <span className="text-cyan-300 text-xs font-mono tracking-wider">
                    RESEARCH PUBLICATIONS
                  </span>
                </div>
                <div className="px-3 py-1 bg-purple-500/20 rounded-full border border-purple-500/30">
                  <span className="text-purple-300 text-xs font-mono tracking-wider">
                    {publications.length} PUBLICATIONS
                  </span>
                </div>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Research Publications
              </h1>
              <p className="text-slate-300 text-sm md:text-base mt-2 max-w-2xl">
                Manage and showcase your research publications. Track citations, share your work, and contribute to mental health research across Africa.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-xl text-white transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm hidden sm:inline">Add Publication</span>
              </button>
              <button
                onClick={fetchPublications}
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
              <FileText className="w-4 h-4 text-cyan-400" />
              <p className="text-slate-400 text-xs">Total Publications</p>
            </div>
            <p className="text-2xl font-bold text-white">{publications.length}</p>
          </div>
          <div className="bg-purple-500/10 rounded-xl p-4 border border-purple-500/20">
            <div className="flex items-center gap-2 mb-1">
              <Award className="w-4 h-4 text-purple-400" />
              <p className="text-purple-400 text-xs">Total Citations</p>
            </div>
            <p className="text-2xl font-bold text-purple-400">
              {publications.reduce((sum, p) => sum + (p.citations || 0), 0)}
            </p>
          </div>
          <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/20">
            <div className="flex items-center gap-2 mb-1">
              <Download className="w-4 h-4 text-blue-400" />
              <p className="text-blue-400 text-xs">Total Downloads</p>
            </div>
            <p className="text-2xl font-bold text-blue-400">
              {publications.reduce((sum, p) => sum + (p.downloads || 0), 0)}
            </p>
          </div>
          <div className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/20">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <p className="text-emerald-400 text-xs">Published</p>
            </div>
            <p className="text-2xl font-bold text-emerald-400">
              {publications.filter(p => p.status === "Published").length}
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
                  placeholder="Search publications by title, author, journal..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
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
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-700">
              <div>
                <label className="text-slate-400 text-sm block mb-2">Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                >
                  {statusOptions.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-slate-400 text-sm block mb-2">Research Area</label>
                <select
                  value={selectedArea}
                  onChange={(e) => setSelectedArea(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                >
                  {researchAreas.map(area => (
                    <option key={area} value={area}>{area}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Publications Grid */}
        {filteredPublications.length === 0 ? (
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-12 text-center">
            <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">No publications found</p>
            <p className="text-slate-500 text-sm mt-2">
              {searchTerm || selectedStatus !== "All Status" || selectedArea !== "All Areas"
                ? "Try adjusting your search or filters"
                : "Add your first research publication"}
            </p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPublications.map((pub) => {
              const statusBadge = getStatusBadge(pub.status);
              const StatusIcon = statusBadge.icon;
              return (
                <div key={pub.id} className="bg-slate-800/50 rounded-2xl border border-slate-700 hover:border-cyan-500/30 transition-all overflow-hidden group">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${statusBadge.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {pub.status}
                      </span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            setSelectedPublication(pub);
                            setShowDetailModal(true);
                          }}
                          className="p-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-400 hover:text-white transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">{pub.title}</h3>
                    
                    <p className="text-slate-400 text-sm mb-3 line-clamp-2">
                      {pub.authors.join(", ")}
                    </p>

                    <div className="space-y-2 text-sm text-slate-400">
                      <p className="flex items-center gap-2">
                        <BookOpen className="w-3 h-3 text-cyan-400" />
                        {pub.journal}
                      </p>
                      <p className="flex items-center gap-2">
                        <Calendar className="w-3 h-3 text-cyan-400" />
                        {formatDate(pub.publication_date)}
                      </p>
                      {pub.research_area && (
                        <p className="flex items-center gap-2">
                          <Tag className="w-3 h-3 text-cyan-400" />
                          {pub.research_area}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-700">
                      {pub.keywords?.slice(0, 3).map((keyword, index) => (
                        <span key={index} className="px-2 py-0.5 rounded-full text-xs bg-slate-700 text-slate-300">
                          #{keyword}
                        </span>
                      ))}
                      {(pub.keywords?.length || 0) > 3 && (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-slate-700 text-slate-400">
                          +{(pub.keywords?.length || 0) - 3}
                        </span>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-700 flex justify-between items-center">
                      <div className="flex gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Award className="w-3 h-3" />
                          {pub.citations || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <Download className="w-3 h-3" />
                          {pub.downloads || 0}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        {pub.doi && (
                          <a
                            href={`https://doi.org/${pub.doi}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-cyan-400 hover:text-cyan-300 text-xs flex items-center gap-1"
                          >
                            <ExternalLink className="w-3 h-3" />
                            DOI
                          </a>
                        )}
                        <button
                          onClick={() => {
                            copyToClipboard(generateCitation(pub));
                          }}
                          className="text-slate-400 hover:text-white text-xs flex items-center gap-1"
                        >
                          <Copy className="w-3 h-3" />
                          Cite
                        </button>
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
            {filteredPublications.map((pub) => {
              const statusBadge = getStatusBadge(pub.status);
              const StatusIcon = statusBadge.icon;
              return (
                <div key={pub.id} className="bg-slate-800/50 rounded-2xl border border-slate-700 hover:border-cyan-500/30 transition-all p-6">
                  <div className="flex flex-wrap justify-between items-start gap-4">
                    <div className="flex-1 min-w-[200px]">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="text-xl font-bold text-white">{pub.title}</h3>
                        <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${statusBadge.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {pub.status}
                        </span>
                      </div>
                      <p className="text-slate-400 text-sm mb-2">
                        {pub.authors.join(", ")}
                      </p>
                      <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-3 h-3" />
                          {pub.journal}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(pub.publication_date)}
                        </span>
                        {pub.research_area && (
                          <span className="flex items-center gap-1">
                            <Tag className="w-3 h-3" />
                            {pub.research_area}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Award className="w-3 h-3" />
                          {pub.citations || 0} citations
                        </span>
                        <span className="flex items-center gap-1">
                          <Download className="w-3 h-3" />
                          {pub.downloads || 0} downloads
                        </span>
                      </div>
                      {pub.keywords && pub.keywords.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {pub.keywords.slice(0, 4).map((keyword, index) => (
                            <span key={index} className="px-2 py-0.5 rounded-full text-xs bg-slate-700 text-slate-300">
                              #{keyword}
                            </span>
                          ))}
                          {pub.keywords.length > 4 && (
                            <span className="px-2 py-0.5 rounded-full text-xs bg-slate-700 text-slate-400">
                              +{pub.keywords.length - 4}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedPublication(pub);
                          setShowDetailModal(true);
                        }}
                        className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-400 hover:text-white transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {pub.doi && (
                        <a
                          href={`https://doi.org/${pub.doi}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-400 hover:text-white transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                      <button
                        onClick={() => {
                          copyToClipboard(generateCitation(pub));
                        }}
                        className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-xl text-white text-sm transition-colors flex items-center gap-2"
                      >
                        <Copy className="w-4 h-4" />
                        Cite
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Publication Detail Modal */}
      {showDetailModal && selectedPublication && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto" onClick={() => setShowDetailModal(false)}>
          <div className="bg-slate-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-700 sticky top-0 bg-slate-800">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-white">{selectedPublication.title}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadge(selectedPublication.status).color}`}>
                      {selectedPublication.status}
                    </span>
                    <span className="text-slate-400 text-sm">{selectedPublication.journal}</span>
                  </div>
                </div>
                <button onClick={() => setShowDetailModal(false)} className="text-slate-400 hover:text-white text-2xl">&times;</button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              {/* Authors */}
              <div>
                <h3 className="text-slate-400 text-sm font-medium mb-2">Authors</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedPublication.authors.map((author, index) => (
                    <span key={index} className="px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-cyan-300 text-sm">
                      {author}
                    </span>
                  ))}
                </div>
              </div>

              {/* Abstract */}
              {selectedPublication.abstract && (
                <div>
                  <h3 className="text-slate-400 text-sm font-medium mb-2">Abstract</h3>
                  <p className="text-slate-300 text-sm">{selectedPublication.abstract}</p>
                </div>
              )}

              {/* Publication Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-slate-400 text-sm font-medium mb-1">Journal</h3>
                  <p className="text-white">{selectedPublication.journal}</p>
                </div>
                <div>
                  <h3 className="text-slate-400 text-sm font-medium mb-1">Publication Date</h3>
                  <p className="text-white">{formatDate(selectedPublication.publication_date)}</p>
                </div>
                {selectedPublication.volume && (
                  <div>
                    <h3 className="text-slate-400 text-sm font-medium mb-1">Volume</h3>
                    <p className="text-white">{selectedPublication.volume}</p>
                  </div>
                )}
                {selectedPublication.issue && (
                  <div>
                    <h3 className="text-slate-400 text-sm font-medium mb-1">Issue</h3>
                    <p className="text-white">{selectedPublication.issue}</p>
                  </div>
                )}
                {selectedPublication.pages && (
                  <div>
                    <h3 className="text-slate-400 text-sm font-medium mb-1">Pages</h3>
                    <p className="text-white">{selectedPublication.pages}</p>
                  </div>
                )}
                {selectedPublication.publisher && (
                  <div>
                    <h3 className="text-slate-400 text-sm font-medium mb-1">Publisher</h3>
                    <p className="text-white">{selectedPublication.publisher}</p>
                  </div>
                )}
                {selectedPublication.issn && (
                  <div>
                    <h3 className="text-slate-400 text-sm font-medium mb-1">ISSN</h3>
                    <p className="text-white">{selectedPublication.issn}</p>
                  </div>
                )}
                {selectedPublication.doi && (
                  <div>
                    <h3 className="text-slate-400 text-sm font-medium mb-1">DOI</h3>
                    <a
                      href={`https://doi.org/${selectedPublication.doi}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 hover:text-cyan-300"
                    >
                      {selectedPublication.doi}
                    </a>
                  </div>
                )}
                {selectedPublication.research_area && (
                  <div>
                    <h3 className="text-slate-400 text-sm font-medium mb-1">Research Area</h3>
                    <span className="px-2 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-300 text-sm">
                      {selectedPublication.research_area}
                    </span>
                  </div>
                )}
              </div>

              {/* Keywords */}
              {selectedPublication.keywords && selectedPublication.keywords.length > 0 && (
                <div>
                  <h3 className="text-slate-400 text-sm font-medium mb-2">Keywords</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedPublication.keywords.map((keyword, index) => (
                      <span key={index} className="px-2 py-1 rounded-full text-xs bg-slate-700 text-slate-300">
                        #{keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-4 bg-slate-700/30 rounded-xl p-4">
                <div className="text-center">
                  <p className="text-slate-400 text-xs">Citations</p>
                  <p className="text-2xl font-bold text-purple-400">{selectedPublication.citations || 0}</p>
                </div>
                <div className="text-center">
                  <p className="text-slate-400 text-xs">Downloads</p>
                  <p className="text-2xl font-bold text-blue-400">{selectedPublication.downloads || 0}</p>
                </div>
                <div className="text-center">
                  <p className="text-slate-400 text-xs">Impact Factor</p>
                  <p className="text-2xl font-bold text-emerald-400">
                    {selectedPublication.citations && selectedPublication.downloads 
                      ? ((selectedPublication.citations + selectedPublication.downloads) / 10).toFixed(1)
                      : "N/A"}
                  </p>
                </div>
              </div>

              {/* Citation */}
              <div className="bg-slate-700/30 rounded-xl p-4">
                <h3 className="text-slate-400 text-sm font-medium mb-2">Citation</h3>
                <div className="flex items-start gap-2">
                  <p className="text-white text-sm flex-1">{generateCitation(selectedPublication)}</p>
                  <button
                    onClick={() => copyToClipboard(generateCitation(selectedPublication))}
                    className="p-1.5 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-white transition-colors flex-shrink-0"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                {copied && (
                  <p className="text-emerald-400 text-xs mt-1">Copied to clipboard!</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-slate-700">
                {selectedPublication.pdf_url && (
                  <a
                    href={selectedPublication.pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-3 bg-cyan-600 hover:bg-cyan-700 rounded-xl text-white font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    Download PDF
                  </a>
                )}
                {selectedPublication.url && (
                  <a
                    href={selectedPublication.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl text-white font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View Online
                  </a>
                )}
                <button
                  onClick={() => {
                    const shareUrl = `${window.location.origin}/researcher/publications/${selectedPublication.id}`;
                    copyToClipboard(shareUrl);
                  }}
                  className="px-4 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl text-white transition-colors flex items-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Publication Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto" onClick={() => setShowCreateModal(false)}>
          <div className="bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-700 sticky top-0 bg-slate-800">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Add Publication</h2>
                <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white text-2xl">&times;</button>
              </div>
            </div>
            <form onSubmit={handleCreatePublication} className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="text-slate-400 text-sm block mb-2">Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Publication title..."
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-slate-400 text-sm block mb-2">Authors *</label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={newAuthor}
                      onChange={(e) => setNewAuthor(e.target.value)}
                      placeholder="Add author name..."
                      className="flex-1 bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addAuthor())}
                    />
                    <button
                      type="button"
                      onClick={addAuthor}
                      className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-700 rounded-xl text-white transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.authors.map((author) => (
                      <span key={author} className="px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-cyan-300 text-sm flex items-center gap-2">
                        {author}
                        <button
                          type="button"
                          onClick={() => removeAuthor(author)}
                          className="text-cyan-400 hover:text-red-400 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                    {formData.authors.length === 0 && (
                      <p className="text-slate-400 text-sm">Add at least one author</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 text-sm block mb-2">Journal *</label>
                  <input
                    type="text"
                    value={formData.journal}
                    onChange={(e) => setFormData({ ...formData, journal: e.target.value })}
                    placeholder="Journal name"
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-slate-400 text-sm block mb-2">Publication Date *</label>
                  <input
                    type="date"
                    value={formData.publication_date}
                    onChange={(e) => setFormData({ ...formData, publication_date: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-slate-400 text-sm block mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                  >
                    {statusOptions.filter(s => s !== "All Status").map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 text-sm block mb-2">Research Area</label>
                  <select
                    value={formData.research_area}
                    onChange={(e) => setFormData({ ...formData, research_area: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="">Select Research Area</option>
                    {researchAreas.filter(a => a !== "All Areas").map(area => (
                      <option key={area} value={area}>{area}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 text-sm block mb-2">University</label>
                  <select
                    value={formData.university_id}
                    onChange={(e) => setFormData({ ...formData, university_id: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="">Select University</option>
                    {universities.map(uni => (
                      <option key={uni.id} value={uni.id}>{uni.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 text-sm block mb-2">DOI</label>
                  <input
                    type="text"
                    value={formData.doi}
                    onChange={(e) => setFormData({ ...formData, doi: e.target.value })}
                    placeholder="10.xxxx/xxxxx"
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 text-sm block mb-2">Volume</label>
                  <input
                    type="text"
                    value={formData.volume}
                    onChange={(e) => setFormData({ ...formData, volume: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 text-sm block mb-2">Issue</label>
                  <input
                    type="text"
                    value={formData.issue}
                    onChange={(e) => setFormData({ ...formData, issue: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 text-sm block mb-2">Pages</label>
                  <input
                    type="text"
                    value={formData.pages}
                    onChange={(e) => setFormData({ ...formData, pages: e.target.value })}
                    placeholder="e.g., 123-145"
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 text-sm block mb-2">Publisher</label>
                  <input
                    type="text"
                    value={formData.publisher}
                    onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 text-sm block mb-2">ISSN</label>
                  <input
                    type="text"
                    value={formData.issn}
                    onChange={(e) => setFormData({ ...formData, issn: e.target.value })}
                    placeholder="1234-5678"
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-slate-400 text-sm block mb-2">Abstract</label>
                  <textarea
                    value={formData.abstract}
                    onChange={(e) => setFormData({ ...formData, abstract: e.target.value })}
                    rows={4}
                    placeholder="Publication abstract..."
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 resize-none focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-slate-400 text-sm block mb-2">URL</label>
                  <input
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    placeholder="https://..."
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-slate-400 text-sm block mb-2">PDF URL</label>
                  <input
                    type="url"
                    value={formData.pdf_url}
                    onChange={(e) => setFormData({ ...formData, pdf_url: e.target.value })}
                    placeholder="https://..."
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-slate-400 text-sm block mb-2">Keywords</label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={newKeyword}
                      onChange={(e) => setNewKeyword(e.target.value)}
                      placeholder="Add keyword..."
                      className="flex-1 bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addKeyword())}
                    />
                    <button
                      type="button"
                      onClick={addKeyword}
                      className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-700 rounded-xl text-white transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.keywords.map((keyword) => (
                      <span key={keyword} className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-300 text-sm flex items-center gap-2">
                        #{keyword}
                        <button
                          type="button"
                          onClick={() => removeKeyword(keyword)}
                          className="text-amber-400 hover:text-red-400 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 rounded-xl text-white font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    Add Publication
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}