// app/research/mentorship/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import {
  ArrowLeft,
  GraduationCap,
  Search,
  Filter,
  RefreshCw,
  Loader2,
  UserPlus,
  MessageSquare,
  Mail,
  Calendar,
  MapPin,
  Building2,
  Award,
  CheckCircle,
  Clock,
  Star,
  Users,
  Heart,
  Target,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Grid,
  List,
  Plus,
  X,
  User,
  BookOpen,
  Sparkles,
  Zap,
} from "lucide-react";

interface Mentor {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  organization: string;
  title: string;
  expertise: string[];
  years_experience: number;
  country: string;
  region: string;
  availability: "Available" | "Limited" | "Full";
  mentees_count: number;
  rating: number;
  research_areas: string[];
  bio: string;
  publications: number;
  is_active: boolean;
  created_at: string;
}

interface MentorshipRequest {
  id: string;
  mentor_id: string;
  mentee_id: string;
  mentee_name: string;
  mentee_organization: string;
  message: string;
  status: "Pending" | "Approved" | "Rejected" | "Completed";
  created_at: string;
  mentor?: Mentor;
}

const expertiseAreas = [
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
];

export default function ResearchMentorshipPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [mentorshipRequests, setMentorshipRequests] = useState<MentorshipRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedExpertise, setSelectedExpertise] = useState("All Areas");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [requestMessage, setRequestMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showMyMentors, setShowMyMentors] = useState(false);

  useEffect(() => {
    checkAuth();
    fetchMentors();
    fetchMentorshipRequests();
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

  const fetchMentors = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("mentors")
        .select("*")
        .eq("is_active", true)
        .order("rating", { ascending: false });

      if (error) throw error;
      setMentors(data || []);
    } catch (error) {
      console.error("Error fetching mentors:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMentorshipRequests = async () => {
    try {
      const { data, error } = await supabase
        .from("mentorship_requests")
        .select(`
          *,
          mentor:mentor_id (
            *
          )
        `)
        .eq("mentee_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMentorshipRequests(data || []);
    } catch (error) {
      console.error("Error fetching mentorship requests:", error);
    }
  };

  const handleRequestMentorship = async () => {
    if (!selectedMentor || !user) return;
    
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from("mentorship_requests")
        .insert({
          mentor_id: selectedMentor.user_id,
          mentee_id: user.id,
          mentee_name: user.full_name,
          mentee_organization: user.organization || "Independent Researcher",
          message: requestMessage || "I would like to request mentorship.",
          status: "Pending",
        });

      if (error) throw error;

      alert("Mentorship request sent successfully!");
      setShowRequestModal(false);
      setRequestMessage("");
      fetchMentorshipRequests();
    } catch (error) {
      console.error("Error sending mentorship request:", error);
      alert("Failed to send mentorship request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredMentors = useMemo(() => {
    let filtered = mentors;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(m =>
        m.full_name.toLowerCase().includes(term) ||
        m.organization.toLowerCase().includes(term) ||
        m.expertise?.some(e => e.toLowerCase().includes(term)) ||
        m.research_areas?.some(a => a.toLowerCase().includes(term))
      );
    }

    if (selectedExpertise !== "All Areas") {
      filtered = filtered.filter(m =>
        m.expertise?.includes(selectedExpertise) ||
        m.research_areas?.includes(selectedExpertise)
      );
    }

    return filtered;
  }, [mentors, searchTerm, selectedExpertise]);

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case "Available":
        return "bg-emerald-500/20 text-emerald-400";
      case "Limited":
        return "bg-yellow-500/20 text-yellow-400";
      case "Full":
        return "bg-red-500/20 text-red-400";
      default:
        return "bg-slate-500/20 text-slate-400";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-300">Loading mentors...</p>
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
                    RESEARCH MENTORSHIP
                  </span>
                </div>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Research Mentorship
              </h1>
              <p className="text-slate-300 text-sm md:text-base mt-2 max-w-2xl">
                Connect with experienced researchers who can guide your research career. Find mentors, share knowledge, and grow together.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowMyMentors(!showMyMentors)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-600 text-white transition-colors"
              >
                <Users className="w-4 h-4" />
                <span className="text-sm hidden sm:inline">My Mentors</span>
                {mentorshipRequests.filter(r => r.status === "Approved").length > 0 && (
                  <span className="ml-1 px-2 py-0.5 bg-emerald-500 text-white text-xs rounded-full">
                    {mentorshipRequests.filter(r => r.status === "Approved").length}
                  </span>
                )}
              </button>
              <button
                onClick={() => {
                  fetchMentors();
                  fetchMentorshipRequests();
                }}
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
        {/* Search and Filters */}
        <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search mentors by name, expertise, or organization..."
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
                <label className="text-slate-400 text-sm block mb-2">Expertise Area</label>
                <select
                  value={selectedExpertise}
                  onChange={(e) => setSelectedExpertise(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                >
                  {expertiseAreas.map(area => (
                    <option key={area} value={area}>{area}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-slate-400 text-sm block mb-2">Availability</label>
                <select
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="all">All</option>
                  <option value="Available">Available</option>
                  <option value="Limited">Limited</option>
                  <option value="Full">Full</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* My Mentors Panel */}
        {showMyMentors && (
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                <Users className="w-5 h-5 text-cyan-400" />
                My Mentors
              </h3>
              <button
                onClick={() => setShowMyMentors(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {mentorshipRequests.filter(r => r.status === "Approved").length === 0 ? (
              <p className="text-slate-400 text-center py-4">You haven't been matched with any mentors yet</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mentorshipRequests.filter(r => r.status === "Approved").map((request) => (
                  <div key={request.id} className="bg-slate-700/30 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center">
                        <span className="text-cyan-400 font-bold text-lg">
                          {request.mentor?.full_name?.charAt(0) || "M"}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium">{request.mentor?.full_name}</p>
                        <p className="text-slate-400 text-sm">{request.mentor?.organization}</p>
                        <p className="text-slate-400 text-xs">{request.mentor?.title}</p>
                        <div className="flex gap-2 mt-2">
                          <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-500/20 text-emerald-400">
                            Active
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-xs bg-cyan-500/20 text-cyan-400">
                            {request.mentor?.mentees_count || 0} mentees
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Mentors Grid */}
        {filteredMentors.length === 0 ? (
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-12 text-center">
            <GraduationCap className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">No mentors found</p>
            <p className="text-slate-500 text-sm mt-2">
              {searchTerm || selectedExpertise !== "All Areas"
                ? "Try adjusting your search or filters"
                : "Check back later for new mentors"}
            </p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMentors.map((mentor) => (
              <div key={mentor.id} className="bg-slate-800/50 rounded-2xl border border-slate-700 hover:border-cyan-500/30 transition-all overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-full bg-cyan-500/20 flex items-center justify-center">
                        <span className="text-cyan-400 font-bold text-xl">
                          {mentor.full_name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-white font-bold">{mentor.full_name}</h3>
                        <p className="text-slate-400 text-sm">{mentor.title}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${getAvailabilityColor(mentor.availability)}`}>
                      {mentor.availability}
                    </span>
                  </div>

                  <p className="text-slate-400 text-sm mb-3 line-clamp-2">{mentor.bio}</p>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {mentor.expertise?.slice(0, 3).map((exp, index) => (
                      <span key={index} className="px-2 py-0.5 rounded-full text-xs bg-cyan-500/10 text-cyan-300">
                        {exp}
                      </span>
                    ))}
                    {(mentor.expertise?.length || 0) > 3 && (
                      <span className="px-2 py-0.5 rounded-full text-xs bg-slate-700 text-slate-300">
                        +{(mentor.expertise?.length || 0) - 3}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-slate-700/30 rounded-lg p-2">
                      <p className="text-xs text-slate-400">Experience</p>
                      <p className="text-white font-bold">{mentor.years_experience}+ yrs</p>
                    </div>
                    <div className="bg-slate-700/30 rounded-lg p-2">
                      <p className="text-xs text-slate-400">Rating</p>
                      <p className="text-yellow-400 font-bold">{mentor.rating || 0}★</p>
                    </div>
                    <div className="bg-slate-700/30 rounded-lg p-2">
                      <p className="text-xs text-slate-400">Mentees</p>
                      <p className="text-white font-bold">{mentor.mentees_count || 0}</p>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-700 flex justify-between items-center">
                    <span className="text-slate-500 text-xs">
                      {mentor.country}
                    </span>
                    <button
                      onClick={() => {
                        setSelectedMentor(mentor);
                        setShowRequestModal(true);
                      }}
                      className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-white text-sm transition-colors flex items-center gap-1"
                      disabled={mentor.availability === "Full"}
                    >
                      <UserPlus className="w-4 h-4" />
                      {mentor.availability === "Full" ? "Full" : "Request"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // List View
          <div className="space-y-4">
            {filteredMentors.map((mentor) => (
              <div key={mentor.id} className="bg-slate-800/50 rounded-2xl border border-slate-700 hover:border-cyan-500/30 transition-all p-6">
                <div className="flex flex-wrap justify-between items-start gap-4">
                  <div className="flex-1 min-w-[200px]">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center">
                        <span className="text-cyan-400 font-bold text-lg">
                          {mentor.full_name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-white font-bold">{mentor.full_name}</h3>
                        <p className="text-slate-400 text-sm">{mentor.title}</p>
                      </div>
                    </div>
                    <p className="text-slate-400 text-sm mb-2 line-clamp-2">{mentor.bio}</p>
                    <div className="flex flex-wrap gap-2">
                      {mentor.expertise?.slice(0, 4).map((exp, index) => (
                        <span key={index} className="px-2 py-0.5 rounded-full text-xs bg-cyan-500/10 text-cyan-300">
                          {exp}
                        </span>
                      ))}
                      {(mentor.expertise?.length || 0) > 4 && (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-slate-700 text-slate-300">
                          +{(mentor.expertise?.length || 0) - 4}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="text-center">
                      <p className="text-slate-400 text-xs">Experience</p>
                      <p className="text-white font-bold">{mentor.years_experience}+ yrs</p>
                    </div>
                    <div className="text-center">
                      <p className="text-slate-400 text-xs">Rating</p>
                      <p className="text-yellow-400 font-bold">{mentor.rating || 0}★</p>
                    </div>
                    <div className="text-center">
                      <p className="text-slate-400 text-xs">Mentees</p>
                      <p className="text-white font-bold">{mentor.mentees_count || 0}</p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedMentor(mentor);
                        setShowRequestModal(true);
                      }}
                      className={`px-4 py-2 rounded-xl text-white text-sm transition-colors ${
                        mentor.availability === "Full"
                          ? "bg-slate-600 cursor-not-allowed"
                          : "bg-cyan-600 hover:bg-cyan-700"
                      }`}
                      disabled={mentor.availability === "Full"}
                    >
                      {mentor.availability === "Full" ? "Unavailable" : "Request Mentorship"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mentorship Request Modal */}
      {showRequestModal && selectedMentor && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setShowRequestModal(false)}>
          <div className="bg-slate-800 rounded-2xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-700">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Request Mentorship</h2>
                <button onClick={() => setShowRequestModal(false)} className="text-slate-400 hover:text-white text-2xl">&times;</button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <h3 className="text-white font-medium">{selectedMentor.full_name}</h3>
                <p className="text-slate-400 text-sm">{selectedMentor.title} at {selectedMentor.organization}</p>
              </div>
              <div>
                <label className="text-slate-400 text-sm block mb-2">Message</label>
                <textarea
                  value={requestMessage}
                  onChange={(e) => setRequestMessage(e.target.value)}
                  rows={4}
                  placeholder="Why do you want this mentor? What are your research goals?"
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 resize-none focus:outline-none focus:border-cyan-500"
                />
              </div>
              <button
                onClick={handleRequestMentorship}
                disabled={submitting}
                className="w-full py-3 bg-cyan-600 hover:bg-cyan-700 rounded-xl text-white font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {submitting ? "Sending..." : "Send Request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}