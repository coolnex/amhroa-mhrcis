// app/researcher/activities/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  Video,
  ExternalLink,
  Search,
  Filter,
  RefreshCw,
  Loader2,
  Plus,
  Eye,
  CheckCircle,
  Clock as ClockIcon,
  AlertCircle,
  X,
  ChevronDown,
  ChevronUp,
  Grid,
  List,
  User,
  Building2,
  Globe,
  Mail,
  Phone,
  Link2,
  Share2,
  Copy,
  Check,
  CalendarDays,
  Sparkles,
  TrendingUp,
  Award,
  LogOut,
} from "lucide-react";
import { CountrySelect } from "@/components/ui/country-select";

interface Activity {
  id: string;
  title: string;
  type: "Webinar" | "Workshop" | "Conference" | "Seminar" | "Training" | "Collaboration" | "Panel Discussion" | "Roundtable";
  description: string;
  date: string;
  time: string;
  venue: string;
  is_virtual: boolean;
  link?: string;
  capacity: number;
  registered: number;
  university_id: string;
  university_name?: string;
  status: "Upcoming" | "Ongoing" | "Completed" | "Cancelled";
  created_at: string;
  created_by: string;
  organizer_name?: string;
  organizer_email?: string;
  agenda?: string[];
  speakers?: string[];
  target_audience?: string[];
  registration_deadline?: string;
  is_free: boolean;
  fee?: number;
  tags?: string[];
}

const activityTypes = [
  "All Types",
  "Webinar",
  "Workshop",
  "Conference",
  "Seminar",
  "Training",
  "Collaboration",
  "Panel Discussion",
  "Roundtable",
];

const statusOptions = [
  "All Status",
  "Upcoming",
  "Ongoing",
  "Completed",
  "Cancelled",
];

export default function ResearcherActivitiesPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("All Types");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [registeredActivities, setRegisteredActivities] = useState<Set<string>>(new Set());
  const [isAuthorized, setIsAuthorized] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    type: "",
    description: "",
    date: "",
    time: "",
    venue: "",
    is_virtual: false,
    link: "",
    capacity: 50,
    status: "Upcoming",
    organizer_name: "",
    organizer_email: "",
    agenda: [] as string[],
    speakers: [] as string[],
    target_audience: [] as string[],
    registration_deadline: "",
    is_free: true,
    fee: 0,
    tags: [] as string[],
  });

  const [newAgendaItem, setNewAgendaItem] = useState("");
  const [newSpeaker, setNewSpeaker] = useState("");
  const [newAudience, setNewAudience] = useState("");
  const [newTag, setNewTag] = useState("");

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      fetchActivities();
      loadRegisteredActivities();
    }
  }, [user]);

  const checkAuth = async () => {
    try {
      console.log("🔐 Researcher Activities - Verifying security clearance...");

      // 1. First check localStorage for user profile
      const userStr = localStorage.getItem("user");
      
      if (userStr) {
        try {
          const userData = JSON.parse(userStr);
          const allowedRoles = ["Researcher", "Admin", "University"];
          
          if (allowedRoles.includes(userData.role) && userData.status === "Approved") {
            setUser(userData);
            setIsAuthorized(true);
            setLoading(false);
            return;
          }
        } catch (e) {
          localStorage.removeItem("user");
        }
      }

      // 2. Fetch active authentication token session from Supabase
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session?.user) {
        console.log("No active session found, routing back to login page.");
        router.push("/login");
        return;
      }

      // 3. Fetch structural profile record from public.users table
      const { data: userData, error: dbError } = await supabase
        .from("users")
        .select("id, full_name, email, role, status, country")
        .eq("id", session.user.id)
        .single();

      if (dbError || !userData) {
        console.error("Profile matching session ID not found:", dbError?.message);
        router.push("/login");
        return;
      }

      // 4. Researcher Authorization Guard Rule
      const allowedRoles = ["Researcher", "Admin", "University"];
      
      if (!allowedRoles.includes(userData.role)) {
        console.warn(`🛑 Unauthorized access attempt. User role "${userData.role}" is not authorized.`);
        router.push("/dashboard");
        return;
      }

      // 5. Approval Constraint Guard Rule
      if (userData.status !== "Approved") {
        console.log("Account is not yet marked as Approved.");
        router.push("/login?message=Account pending approval");
        return;
      }

      // 6. Cache user data in localStorage
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      setIsAuthorized(true);
      
    } catch (error) {
      console.error("Critical error encountered during security verification:", error);
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      localStorage.removeItem("user");
      localStorage.removeItem("session");
      localStorage.removeItem("token");
      await supabase.auth.signOut();
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const loadRegisteredActivities = () => {
    const saved = localStorage.getItem("registered_activities");
    if (saved) {
      setRegisteredActivities(new Set(JSON.parse(saved)));
    }
  };

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("research_activities")
        .select(`
          *,
          university:university_id (
            name
          )
        `)
        .order("date", { ascending: true });

      if (error) throw error;

      const activitiesWithNames = (data || []).map((a: any) => ({
        ...a,
        university_name: a.university?.name,
      }));

      setActivities(activitiesWithNames);
    } catch (error) {
      console.error("Error fetching activities:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.type || !formData.date || !formData.venue) {
      alert("Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from("research_activities")
        .insert({
          title: formData.title,
          type: formData.type,
          description: formData.description,
          date: formData.date,
          time: formData.time || null,
          venue: formData.venue,
          is_virtual: formData.is_virtual,
          link: formData.link || null,
          capacity: formData.capacity || 50,
          status: formData.status,
          organizer_name: formData.organizer_name || user?.full_name,
          organizer_email: formData.organizer_email || user?.email,
          agenda: formData.agenda,
          speakers: formData.speakers,
          target_audience: formData.target_audience,
          registration_deadline: formData.registration_deadline || null,
          is_free: formData.is_free,
          fee: formData.is_free ? 0 : formData.fee || 0,
          tags: formData.tags,
          created_by: user.id,
          created_at: new Date().toISOString(),
        });

      if (error) throw error;

      alert("Activity created successfully!");
      setShowCreateModal(false);
      resetForm();
      fetchActivities();
    } catch (error) {
      console.error("Error creating activity:", error);
      alert("Failed to create activity. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegister = async (activityId: string) => {
    if (registeredActivities.has(activityId)) {
      alert("You are already registered for this activity");
      return;
    }

    try {
      // In a real app, you would insert into a registrations table
      // For now, we'll store in localStorage
      const newSet = new Set(registeredActivities);
      newSet.add(activityId);
      setRegisteredActivities(newSet);
      localStorage.setItem("registered_activities", JSON.stringify(Array.from(newSet)));

      // Update registered count
      const activity = activities.find(a => a.id === activityId);
      if (activity) {
        const updatedActivity = { ...activity, registered: (activity.registered || 0) + 1 };
        setActivities(prev => prev.map(a => a.id === activityId ? updatedActivity : a));
      }

      alert("Successfully registered for this activity!");
    } catch (error) {
      console.error("Error registering for activity:", error);
      alert("Failed to register. Please try again.");
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      type: "",
      description: "",
      date: "",
      time: "",
      venue: "",
      is_virtual: false,
      link: "",
      capacity: 50,
      status: "Upcoming",
      organizer_name: "",
      organizer_email: "",
      agenda: [],
      speakers: [],
      target_audience: [],
      registration_deadline: "",
      is_free: true,
      fee: 0,
      tags: [],
    });
    setNewAgendaItem("");
    setNewSpeaker("");
    setNewAudience("");
    setNewTag("");
  };

  const addAgendaItem = () => {
    if (newAgendaItem.trim() && !formData.agenda.includes(newAgendaItem.trim())) {
      setFormData({
        ...formData,
        agenda: [...formData.agenda, newAgendaItem.trim()],
      });
      setNewAgendaItem("");
    }
  };

  const removeAgendaItem = (item: string) => {
    setFormData({
      ...formData,
      agenda: formData.agenda.filter(i => i !== item),
    });
  };

  const addSpeaker = () => {
    if (newSpeaker.trim() && !formData.speakers.includes(newSpeaker.trim())) {
      setFormData({
        ...formData,
        speakers: [...formData.speakers, newSpeaker.trim()],
      });
      setNewSpeaker("");
    }
  };

  const removeSpeaker = (speaker: string) => {
    setFormData({
      ...formData,
      speakers: formData.speakers.filter(s => s !== speaker),
    });
  };

  const addAudience = () => {
    if (newAudience.trim() && !formData.target_audience.includes(newAudience.trim())) {
      setFormData({
        ...formData,
        target_audience: [...formData.target_audience, newAudience.trim()],
      });
      setNewAudience("");
    }
  };

  const removeAudience = (audience: string) => {
    setFormData({
      ...formData,
      target_audience: formData.target_audience.filter(a => a !== audience),
    });
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, newTag.trim()],
      });
      setNewTag("");
    }
  };

  const removeTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(t => t !== tag),
    });
  };

  const filteredActivities = useMemo(() => {
    let filtered = activities;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(a =>
        a.title.toLowerCase().includes(term) ||
        a.description?.toLowerCase().includes(term) ||
        a.venue.toLowerCase().includes(term) ||
        a.university_name?.toLowerCase().includes(term) ||
        a.tags?.some(tag => tag.toLowerCase().includes(term))
      );
    }

    if (selectedType !== "All Types") {
      filtered = filtered.filter(a => a.type === selectedType);
    }

    if (selectedStatus !== "All Status") {
      filtered = filtered.filter(a => a.status === selectedStatus);
    }

    return filtered;
  }, [activities, searchTerm, selectedType, selectedStatus]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Upcoming":
        return { color: "bg-blue-500/20 text-blue-400", icon: ClockIcon };
      case "Ongoing":
        return { color: "bg-emerald-500/20 text-emerald-400", icon: ClockIcon };
      case "Completed":
        return { color: "bg-slate-500/20 text-slate-400", icon: CheckCircle };
      case "Cancelled":
        return { color: "bg-red-500/20 text-red-400", icon: AlertCircle };
      default:
        return { color: "bg-slate-500/20 text-slate-400", icon: ClockIcon };
    }
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      "Webinar": "bg-purple-500/10 text-purple-400 border-purple-500/20",
      "Workshop": "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
      "Conference": "bg-blue-500/10 text-blue-400 border-blue-500/20",
      "Seminar": "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
      "Training": "bg-green-500/10 text-green-400 border-green-500/20",
      "Collaboration": "bg-pink-500/10 text-pink-400 border-pink-500/20",
      "Panel Discussion": "bg-orange-500/10 text-orange-400 border-orange-500/20",
      "Roundtable": "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    };
    return colors[type] || "bg-slate-500/10 text-slate-400";
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const isRegistrationOpen = (activity: Activity) => {
    if (activity.status === "Cancelled" || activity.status === "Completed") return false;
    if (activity.registration_deadline) {
      return new Date(activity.registration_deadline) > new Date();
    }
    return true;
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-300">Loading activities...</p>
        </div>
      </div>
    );
  }

  // If not authorized, return null
  if (!isAuthorized || !user) {
    return null;
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
                    RESEARCH ACTIVITIES
                  </span>
                </div>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Research Activities
              </h1>
              <p className="text-slate-300 text-sm md:text-base mt-2 max-w-2xl">
                Discover and participate in research activities across Africa. Join webinars, workshops, conferences, and more.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-xl text-white transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm hidden sm:inline">Create Activity</span>
              </button>
              <button
                onClick={fetchActivities}
                className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-600 text-white transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="text-sm hidden sm:inline">Refresh</span>
              </button>
              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 rounded-xl border border-red-500/30 text-red-400 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm hidden sm:inline">Logout</span>
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
              <Calendar className="w-4 h-4 text-cyan-400" />
              <p className="text-slate-400 text-xs">Total Activities</p>
            </div>
            <p className="text-2xl font-bold text-white">{activities.length}</p>
          </div>
          <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/20">
            <div className="flex items-center gap-2 mb-1">
              <ClockIcon className="w-4 h-4 text-blue-400" />
              <p className="text-blue-400 text-xs">Upcoming</p>
            </div>
            <p className="text-2xl font-bold text-blue-400">
              {activities.filter(a => a.status === "Upcoming").length}
            </p>
          </div>
          <div className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/20">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-emerald-400" />
              <p className="text-emerald-400 text-xs">Registered</p>
            </div>
            <p className="text-2xl font-bold text-emerald-400">{registeredActivities.size}</p>
          </div>
          <div className="bg-purple-500/10 rounded-xl p-4 border border-purple-500/20">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <p className="text-purple-400 text-xs">Activity Types</p>
            </div>
            <p className="text-2xl font-bold text-purple-400">
              {new Set(activities.map(a => a.type)).size}
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
                  placeholder="Search activities..."
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-700">
              <div>
                <label className="text-slate-400 text-sm block mb-2">Activity Type</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                >
                  {activityTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
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
                <label className="text-slate-400 text-sm block mb-2">Venue Type</label>
                <select
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="all">All</option>
                  <option value="virtual">Virtual</option>
                  <option value="physical">Physical</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Activities Grid */}
        {filteredActivities.length === 0 ? (
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-12 text-center">
            <Calendar className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">No activities found</p>
            <p className="text-slate-500 text-sm mt-2">
              {searchTerm || selectedType !== "All Types" || selectedStatus !== "All Status"
                ? "Try adjusting your search or filters"
                : "Create your first research activity"}
            </p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredActivities.map((activity) => {
              const statusBadge = getStatusBadge(activity.status);
              const StatusIcon = statusBadge.icon;
              const isRegistered = registeredActivities.has(activity.id);
              
              return (
                <div key={activity.id} className="bg-slate-800/50 rounded-2xl border border-slate-700 hover:border-cyan-500/30 transition-all overflow-hidden">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${getTypeColor(activity.type)}`}>
                        {activity.type}
                      </span>
                      <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${statusBadge.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {activity.status}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">{activity.title}</h3>
                    <p className="text-slate-400 text-sm mb-4 line-clamp-2">{activity.description}</p>

                    <div className="space-y-2 text-sm text-slate-400">
                      <p className="flex items-center gap-2">
                        <Calendar className="w-3 h-3 text-cyan-400" />
                        {formatDate(activity.date)}
                        {activity.time && ` at ${activity.time}`}
                      </p>
                      <p className="flex items-center gap-2">
                        {activity.is_virtual ? (
                          <Video className="w-3 h-3 text-cyan-400" />
                        ) : (
                          <MapPin className="w-3 h-3 text-cyan-400" />
                        )}
                        {activity.is_virtual ? "Virtual Event" : activity.venue}
                      </p>
                      <p className="flex items-center gap-2">
                        <Users className="w-3 h-3 text-cyan-400" />
                        {activity.registered || 0} / {activity.capacity || 0} registered
                      </p>
                    </div>

                    {activity.tags && activity.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-700">
                        {activity.tags.slice(0, 3).map((tag, index) => (
                          <span key={index} className="px-2 py-0.5 rounded-full text-xs bg-slate-700 text-slate-300">
                            #{tag}
                          </span>
                        ))}
                        {activity.tags.length > 3 && (
                          <span className="px-2 py-0.5 rounded-full text-xs bg-slate-700 text-slate-400">
                            +{activity.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="mt-4 pt-4 border-t border-slate-700 flex justify-between items-center">
                      <span className="text-slate-500 text-xs">
                        {activity.university_name || "Independent"}
                      </span>
                      <div className="flex gap-2">
                        {isRegistered ? (
                          <span className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg text-xs flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Registered
                          </span>
                        ) : (
                          activity.status === "Upcoming" && isRegistrationOpen(activity) && (
                            <button
                              onClick={() => handleRegister(activity.id)}
                              className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-white text-xs transition-colors"
                            >
                              Register
                            </button>
                          )
                        )}
                        <button
                          onClick={() => {
                            setSelectedActivity(activity);
                            setShowDetailModal(true);
                          }}
                          className="p-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-400 hover:text-white transition-colors"
                        >
                          <Eye className="w-4 h-4" />
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
            {filteredActivities.map((activity) => {
              const statusBadge = getStatusBadge(activity.status);
              const StatusIcon = statusBadge.icon;
              const isRegistered = registeredActivities.has(activity.id);
              
              return (
                <div key={activity.id} className="bg-slate-800/50 rounded-2xl border border-slate-700 hover:border-cyan-500/30 transition-all p-6">
                  <div className="flex flex-wrap justify-between items-start gap-4">
                    <div className="flex-1 min-w-[200px]">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="text-xl font-bold text-white">{activity.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs ${getTypeColor(activity.type)}`}>
                          {activity.type}
                        </span>
                        <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${statusBadge.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {activity.status}
                        </span>
                      </div>
                      <p className="text-slate-400 text-sm mb-3 line-clamp-2">{activity.description}</p>
                      <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(activity.date)}
                          {activity.time && ` at ${activity.time}`}
                        </span>
                        <span className="flex items-center gap-1">
                          {activity.is_virtual ? (
                            <Video className="w-3 h-3" />
                          ) : (
                            <MapPin className="w-3 h-3" />
                          )}
                          {activity.is_virtual ? "Virtual" : activity.venue}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {activity.registered || 0} / {activity.capacity || 0} registered
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {isRegistered ? (
                        <span className="px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-xl text-sm flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          Registered
                        </span>
                      ) : (
                        activity.status === "Upcoming" && isRegistrationOpen(activity) && (
                          <button
                            onClick={() => handleRegister(activity.id)}
                            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-xl text-white text-sm transition-colors"
                          >
                            Register
                          </button>
                        )
                      )}
                      <button
                        onClick={() => {
                          setSelectedActivity(activity);
                          setShowDetailModal(true);
                        }}
                        className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-400 hover:text-white transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Activity Detail Modal */}
      {showDetailModal && selectedActivity && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto" onClick={() => setShowDetailModal(false)}>
          <div className="bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-700 sticky top-0 bg-slate-800">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-white">{selectedActivity.title}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-1 rounded-full text-xs ${getTypeColor(selectedActivity.type)}`}>
                      {selectedActivity.type}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadge(selectedActivity.status).color}`}>
                      {selectedActivity.status}
                    </span>
                  </div>
                </div>
                <button onClick={() => setShowDetailModal(false)} className="text-slate-400 hover:text-white text-2xl">&times;</button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              {/* Activity Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-400 text-sm">Date & Time</p>
                  <p className="text-white">{formatDate(selectedActivity.date)}</p>
                  {selectedActivity.time && <p className="text-slate-300">{selectedActivity.time}</p>}
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Venue</p>
                  <p className="text-white">{selectedActivity.is_virtual ? "Virtual Event" : selectedActivity.venue}</p>
                  {selectedActivity.is_virtual && selectedActivity.link && (
                    <a
                      href={selectedActivity.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 hover:text-cyan-300 text-sm flex items-center gap-1 mt-1"
                    >
                      Join Event <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Capacity</p>
                  <p className="text-white">{selectedActivity.registered || 0} / {selectedActivity.capacity || 0} registered</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Organizer</p>
                  <p className="text-white">{selectedActivity.organizer_name || "N/A"}</p>
                  {selectedActivity.organizer_email && (
                    <a href={`mailto:${selectedActivity.organizer_email}`} className="text-cyan-400 hover:text-cyan-300 text-sm">
                      {selectedActivity.organizer_email}
                    </a>
                  )}
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Registration Fee</p>
                  <p className="text-white">{selectedActivity.is_free ? "Free" : `$${selectedActivity.fee}`}</p>
                </div>
                {selectedActivity.registration_deadline && (
                  <div>
                    <p className="text-slate-400 text-sm">Registration Deadline</p>
                    <p className="text-white">{formatDate(selectedActivity.registration_deadline)}</p>
                  </div>
                )}
              </div>

              {/* Description */}
              {selectedActivity.description && (
                <div>
                  <h3 className="text-white font-semibold mb-2">Description</h3>
                  <p className="text-slate-300">{selectedActivity.description}</p>
                </div>
              )}

              {/* Agenda */}
              {selectedActivity.agenda && selectedActivity.agenda.length > 0 && (
                <div>
                  <h3 className="text-white font-semibold mb-2">Agenda</h3>
                  <ul className="space-y-2">
                    {selectedActivity.agenda.map((item, index) => (
                      <li key={index} className="flex items-start gap-2 text-slate-300">
                        <span className="text-cyan-400 font-bold mt-0.5">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Speakers */}
              {selectedActivity.speakers && selectedActivity.speakers.length > 0 && (
                <div>
                  <h3 className="text-white font-semibold mb-2">Speakers</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedActivity.speakers.map((speaker, index) => (
                      <span key={index} className="px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-300 text-sm">
                        {speaker}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Target Audience */}
              {selectedActivity.target_audience && selectedActivity.target_audience.length > 0 && (
                <div>
                  <h3 className="text-white font-semibold mb-2">Target Audience</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedActivity.target_audience.map((audience, index) => (
                      <span key={index} className="px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-cyan-300 text-sm">
                        {audience}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {selectedActivity.tags && selectedActivity.tags.length > 0 && (
                <div>
                  <h3 className="text-white font-semibold mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedActivity.tags.map((tag, index) => (
                      <span key={index} className="px-2 py-1 rounded-full text-xs bg-slate-700 text-slate-300">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-slate-700">
                {!registeredActivities.has(selectedActivity.id) && 
                 selectedActivity.status === "Upcoming" && 
                 isRegistrationOpen(selectedActivity) && (
                  <button
                    onClick={() => {
                      handleRegister(selectedActivity.id);
                      setShowDetailModal(false);
                    }}
                    className="flex-1 py-3 bg-cyan-600 hover:bg-cyan-700 rounded-xl text-white font-semibold transition-colors"
                  >
                    Register Now
                  </button>
                )}
                {registeredActivities.has(selectedActivity.id) && (
                  <div className="flex-1 py-3 bg-emerald-500/20 rounded-xl text-emerald-400 font-semibold text-center flex items-center justify-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Already Registered
                  </div>
                )}
                <button
                  onClick={() => {
                    // Share activity
                    const url = `${window.location.origin}/researcher/activities/${selectedActivity.id}`;
                    navigator.clipboard.writeText(url);
                    alert("Link copied to clipboard!");
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

      {/* Create Activity Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto" onClick={() => setShowCreateModal(false)}>
          <div className="bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-700 sticky top-0 bg-slate-800">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Create Research Activity</h2>
                <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white text-2xl">&times;</button>
              </div>
            </div>
            <form onSubmit={handleCreateActivity} className="p-6 space-y-5">
              {/* ... rest of the form stays the same ... */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 rounded-xl text-white font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    Create Activity
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