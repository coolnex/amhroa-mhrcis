// app/organizations/collaboration-hub/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  Building2,
  Users,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Mail,
  Phone,
  MapPin,
  Link as LinkIcon,
  Settings,
  LogOut,
  RefreshCw,
  Plus,
  Eye,
  Edit,
  Trash2,
  Heart,
  Briefcase,
  Handshake,
  Megaphone,
  UserPlus,
  Filter,
  Search,
  Share2,
  Network,
  MessageCircle,
  FileSpreadsheet,
  Users as UsersIcon,
  Star,
  Sparkles,
  Zap,
  Clock as ClockIcon,
  CheckCheck,
  ExternalLink,
  Upload,
  Download,
  Send,
  Bell,
  BellRing,
  Eye as EyeIcon,
  MapPin as MapPinIcon,
  Calendar as CalendarIcon,
  ArrowRight,
  Rocket,
  Compass,
  Coffee,
  Gift,
  Lightbulb,
  PieChart,
  Database,
  Code,
  GitBranch,
  GraduationCap,
  BookOpen,
  Globe,
  Target,
  Award,
  X,
} from "lucide-react";

// ============ INTERFACES ============

interface Organization {
  id: string;
  name: string;
  type: string;
  country: string;
  region: string;
  description: string;
  logo_url?: string;
  focus_areas?: string[];
}

interface TeamMember {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  role: string;
  joined_at: string;
  avatar_url?: string;
  skills?: string[];
  department?: string;
}

interface Event {
  id: string;
  title: string;
  description: string;
  type: "webinar" | "workshop" | "conference" | "networking" | "training" | "meeting" | "social";
  organization_id: string;
  organization_name: string;
  start_date: string;
  end_date: string;
  location: string;
  virtual_link?: string;
  capacity: number;
  registered: number;
  status: "upcoming" | "ongoing" | "completed" | "cancelled";
  focus_areas: string[];
  created_at: string;
  image_url?: string;
  speakers?: string[];
  agenda?: string[];
  is_public?: boolean;
}

interface Notice {
  id: string;
  title: string;
  content: string;
  organization_id: string;
  organization_name: string;
  type: "announcement" | "update" | "alert" | "reminder" | "news";
  priority: "low" | "medium" | "high" | "urgent";
  created_at: string;
  expires_at?: string;
  is_pinned: boolean;
  read_count: number;
  target_audience?: string[];
  attachments?: string[];
}

interface CollaborationRequest {
  id: string;
  from_organization_id: string;
  to_organization_id: string;
  from_organization_name: string;
  message: string;
  partnership_type: "partnership" | "affiliation" | "coalition" | "project" | "network" | "mentorship";
  status: "pending" | "accepted" | "rejected" | "expired";
  created_at: string;
  focus_areas: string[];
  contact_email: string;
  contact_name: string;
  proposed_start_date?: string;
  proposed_end_date?: string;
  expected_outcomes?: string[];
  resources_offered?: string[];
}

interface Collaboration {
  id: string;
  organization_id: string;
  partner_organization_id: string;
  partner_organization_name: string;
  type: string;
  status: "active" | "pending" | "completed" | "on-hold";
  start_date: string;
  end_date?: string;
  description: string;
  focus_areas: string[];
  contact_person_id?: string;
  contact_person_name?: string;
  created_at: string;
  updated_at: string;
  meeting_frequency?: string;
  communication_channels?: string[];
  shared_resources?: string[];
}

// ============ CONSTANTS ============

const eventTypeColors = {
  webinar: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  workshop: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  conference: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  networking: "bg-pink-500/20 text-pink-400 border-pink-500/30",
  training: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  meeting: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  social: "bg-orange-500/20 text-orange-400 border-orange-500/30",
};

const noticePriorityColors = {
  low: "bg-slate-500/20 text-slate-400",
  medium: "bg-blue-500/20 text-blue-400",
  high: "bg-yellow-500/20 text-yellow-400",
  urgent: "bg-red-500/20 text-red-400",
};

const focusAreasOptions = [
  "Mental Health",
  "Education",
  "Healthcare",
  "Economic Empowerment",
  "Gender Equality",
  "Human Rights",
  "Environment",
  "Youth Development",
  "Community Engagement",
  "Research",
  "Policy Advocacy",
  "Capacity Building",
];

// ============ MAIN COMPONENT ============

export default function CollaborationHubPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [collaborations, setCollaborations] = useState<Collaboration[]>([]);
  const [collaborationRequests, setCollaborationRequests] = useState<CollaborationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"members" | "events" | "notices" | "collaborate">("members");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [showAddMember, setShowAddMember] = useState(false);
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [showCreateNotice, setShowCreateNotice] = useState(false);
  const [showCollaborationModal, setShowCollaborationModal] = useState(false);

  // Form states - Members
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberRole, setNewMemberRole] = useState("Member");
  const [newMemberDepartment, setNewMemberDepartment] = useState("");
  const [newMemberSkills, setNewMemberSkills] = useState("");
  const [inviting, setInviting] = useState(false);

  // Form states - Events
  const [eventForm, setEventForm] = useState({
    title: "",
    description: "",
    type: "webinar" as Event["type"],
    start_date: "",
    end_date: "",
    location: "",
    virtual_link: "",
    capacity: 100,
    focus_areas: [] as string[],
    is_public: true,
  });

  // Form states - Notices
  const [noticeForm, setNoticeForm] = useState({
    title: "",
    content: "",
    type: "announcement" as Notice["type"],
    priority: "medium" as Notice["priority"],
    is_pinned: false,
    expires_at: "",
  });

  // Form states - Collaboration
  const [collaborationForm, setCollaborationForm] = useState({
    partner_organization_id: "",
    message: "",
    partnership_type: "partnership" as CollaborationRequest["partnership_type"],
    focus_areas: [] as string[],
    proposed_start_date: "",
    proposed_end_date: "",
    expected_outcomes: "",
    resources_offered: "",
  });

  // ============ AUTH & DATA FETCHING ============

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    setIsLoading(true);
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const userData = JSON.parse(userStr);
        setUser(userData);
        setIsLoading(false);
        await fetchOrganizations(userData);
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("users")
        .select("*")
        .eq("auth_user_id", session.user.id)
        .single();

      if (!profile) {
        router.push("/login");
        return;
      }

      localStorage.setItem("user", JSON.stringify(profile));
      setUser(profile);
      setIsLoading(false);
      await fetchOrganizations(profile);
    } catch (error) {
      console.error("Auth check error:", error);
      router.push("/login");
    }
  };

  const fetchOrganizations = async (userData: any) => {
    if (!userData) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const isCoordinator = ["Coordinator", "mental_health_coordinator", "researcher_coordinator", "cso_coordinator"].includes(userData.role);

      let orgsData: any[] = [];

      if (userData.role === "Admin") {
        const { data, error } = await supabase
          .from("organizations")
          .select("*")
          .eq("status", "Approved")
          .order("name", { ascending: true });
        if (error) throw error;
        orgsData = data || [];
      } else if (isCoordinator) {
        const userCountry = userData.assigned_country || userData.country;
        if (!userCountry) {
          setOrganizations([]);
          setLoading(false);
          return;
        }
        const { data, error } = await supabase
          .from("organizations")
          .select("*")
          .eq("status", "Approved")
          .eq("country", userCountry)
          .order("name", { ascending: true });
        if (error) throw error;
        orgsData = data || [];
      } else {
        const { data: memberOrgs, error: memberError } = await supabase
          .from("organization_members")
          .select("organization_id")
          .eq("user_id", userData.id);
        if (memberError) throw memberError;

        const orgIds = memberOrgs?.map(m => m.organization_id) || [];
        if (orgIds.length > 0) {
          const idsString = orgIds.map(id => `"${id}"`).join(',');
          const { data, error } = await supabase
            .from("organizations")
            .select("*")
            .eq("status", "Approved")
            .or(`id.in.(${idsString}),created_by.eq.${userData.id}`)
            .order("name", { ascending: true });
          if (error) throw error;
          orgsData = data || [];
        } else {
          const { data, error } = await supabase
            .from("organizations")
            .select("*")
            .eq("status", "Approved")
            .eq("created_by", userData.id)
            .order("name", { ascending: true });
          if (error) throw error;
          orgsData = data || [];
        }
      }

      setOrganizations(orgsData);
      if (orgsData.length > 0) {
        setSelectedOrg(orgsData[0]);
        await fetchOrganizationData(orgsData[0].id);
      }
    } catch (error) {
      console.error("Error fetching organizations:", error);
      setError("Failed to load organizations");
    } finally {
      setLoading(false);
    }
  };

  const fetchOrganizationData = async (orgId: string) => {
    if (!orgId) return;

    try {
      await Promise.all([
        fetchTeamMembers(orgId),
        fetchEvents(orgId),
        fetchNotices(orgId),
        fetchCollaborations(orgId),
        fetchCollaborationRequests(orgId),
      ]);
    } catch (error) {
      console.error("Error fetching organization data:", error);
      setError("Failed to load organization data");
    }
  };

  const fetchTeamMembers = async (orgId: string) => {
    try {
      const { data: membersData, error: membersError } = await supabase
        .from("organization_members")
        .select("*")
        .eq("organization_id", orgId);

      if (membersError) {
        console.warn("Members table not found:", membersError);
        setTeamMembers([]);
        return;
      }

      if (membersData && membersData.length > 0) {
        const userIds = membersData.map(m => m.user_id).filter(id => id);
        let usersMap: Record<string, any> = {};

        if (userIds.length > 0) {
          const { data: usersData, error: usersError } = await supabase
            .from("users")
            .select("id, full_name, email, avatar_url")
            .in("id", userIds);

          if (!usersError && usersData) {
            usersMap = usersData.reduce((acc: any, user: any) => {
              acc[user.id] = user;
              return acc;
            }, {});
          }
        }

        setTeamMembers(membersData.map(m => ({
          id: m.id,
          user_id: m.user_id,
          full_name: usersMap[m.user_id]?.full_name || "Unknown",
          email: usersMap[m.user_id]?.email || "",
          role: m.role || "Member",
          joined_at: m.joined_at || m.created_at || new Date().toISOString(),
          avatar_url: usersMap[m.user_id]?.avatar_url,
          skills: m.skills || [],
          department: m.department || "",
        })));
      } else {
        setTeamMembers([]);
      }
    } catch (error) {
      console.error("Error fetching team members:", error);
      setTeamMembers([]);
    }
  };

  const fetchEvents = async (orgId: string) => {
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("organization_id", orgId)
        .order("start_date", { ascending: true });

      if (error) {
        console.warn("Events table not found:", error);
        setEvents([]);
        return;
      }
      setEvents(data || []);
    } catch (error) {
      console.error("Error fetching events:", error);
      setEvents([]);
    }
  };

  const fetchNotices = async (orgId: string) => {
    try {
      const { data, error } = await supabase
        .from("notices")
        .select("*")
        .eq("organization_id", orgId)
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) {
        console.warn("Notices table not found:", error);
        setNotices([]);
        return;
      }
      setNotices(data || []);
    } catch (error) {
      console.error("Error fetching notices:", error);
      setNotices([]);
    }
  };

  const fetchCollaborations = async (orgId: string) => {
    try {
      const { data, error } = await supabase
        .from("collaborations")
        .select("*")
        .or(`organization_id.eq.${orgId},partner_organization_id.eq.${orgId}`)
        .eq("status", "active");

      if (error) {
        console.warn("Collaborations table not found:", error);
        setCollaborations([]);
        return;
      }
      setCollaborations(data || []);
    } catch (error) {
      console.error("Error fetching collaborations:", error);
      setCollaborations([]);
    }
  };

  const fetchCollaborationRequests = async (orgId: string) => {
    try {
      const { data, error } = await supabase
        .from("collaboration_requests")
        .select("*")
        .eq("to_organization_id", orgId)
        .eq("status", "pending");

      if (error) {
        console.warn("Collaboration requests table not found:", error);
        setCollaborationRequests([]);
        return;
      }
      setCollaborationRequests(data || []);
    } catch (error) {
      console.error("Error fetching collaboration requests:", error);
      setCollaborationRequests([]);
    }
  };

  // ============ HANDLERS ============

  const handleInviteMember = async () => {
    if (!newMemberEmail) {
      alert("Please enter an email address");
      return;
    }

    setInviting(true);
    try {
      const { data: existingUser } = await supabase
        .from("users")
        .select("id, full_name, email")
        .eq("email", newMemberEmail)
        .single();

      if (!existingUser) {
        alert("User not found. Please ask them to register first.");
        setInviting(false);
        return;
      }

      const { error } = await supabase
        .from("organization_members")
        .insert({
          organization_id: selectedOrg?.id,
          user_id: existingUser.id,
          role: newMemberRole,
          department: newMemberDepartment,
          skills: newMemberSkills ? newMemberSkills.split(',').map(s => s.trim()) : [],
          joined_at: new Date().toISOString(),
        });

      if (error) throw error;

      alert(`Successfully added ${newMemberEmail} to the team!`);
      setShowAddMember(false);
      setNewMemberEmail("");
      setNewMemberRole("Member");
      setNewMemberDepartment("");
      setNewMemberSkills("");
      if (selectedOrg) {
        await fetchTeamMembers(selectedOrg.id);
      }
    } catch (error) {
      console.error("Error inviting member:", error);
      alert("Failed to invite member. Please try again.");
    } finally {
      setInviting(false);
    }
  };

  const handleCreateEvent = async () => {
    if (!eventForm.title || !eventForm.start_date || !eventForm.end_date) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("events")
        .insert({
          ...eventForm,
          organization_id: selectedOrg?.id,
          organization_name: selectedOrg?.name,
          registered: 0,
          status: new Date(eventForm.start_date) > new Date() ? "upcoming" : "ongoing",
          created_at: new Date().toISOString(),
        })
        .select();

      if (error) throw error;

      alert("Event created successfully!");
      setShowCreateEvent(false);
      setEventForm({
        title: "",
        description: "",
        type: "webinar",
        start_date: "",
        end_date: "",
        location: "",
        virtual_link: "",
        capacity: 100,
        focus_areas: [],
        is_public: true,
      });
      if (selectedOrg) {
        await fetchEvents(selectedOrg.id);
      }
    } catch (error) {
      console.error("Error creating event:", error);
      alert("Failed to create event. Please try again.");
    }
  };

  const handleCreateNotice = async () => {
    if (!noticeForm.title || !noticeForm.content) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("notices")
        .insert({
          ...noticeForm,
          organization_id: selectedOrg?.id,
          organization_name: selectedOrg?.name,
          read_count: 0,
          created_at: new Date().toISOString(),
        })
        .select();

      if (error) throw error;

      alert("Notice published successfully!");
      setShowCreateNotice(false);
      setNoticeForm({
        title: "",
        content: "",
        type: "announcement",
        priority: "medium",
        is_pinned: false,
        expires_at: "",
      });
      if (selectedOrg) {
        await fetchNotices(selectedOrg.id);
      }
    } catch (error) {
      console.error("Error creating notice:", error);
      alert("Failed to publish notice. Please try again.");
    }
  };

  const handleSendCollaborationRequest = async () => {
    if (!collaborationForm.partner_organization_id || !collaborationForm.message) {
      alert("Please select a partner organization and enter a message");
      return;
    }

    try {
      const { error } = await supabase
        .from("collaboration_requests")
        .insert({
          from_organization_id: selectedOrg?.id,
          to_organization_id: collaborationForm.partner_organization_id,
          message: collaborationForm.message,
          partnership_type: collaborationForm.partnership_type,
          status: "pending",
          focus_areas: collaborationForm.focus_areas,
          contact_email: user?.email,
          contact_name: user?.full_name,
          proposed_start_date: collaborationForm.proposed_start_date || null,
          proposed_end_date: collaborationForm.proposed_end_date || null,
          expected_outcomes: collaborationForm.expected_outcomes ? collaborationForm.expected_outcomes.split(',').map(s => s.trim()) : [],
          resources_offered: collaborationForm.resources_offered ? collaborationForm.resources_offered.split(',').map(s => s.trim()) : [],
          created_at: new Date().toISOString(),
        });

      if (error) throw error;

      alert("Collaboration request sent successfully!");
      setShowCollaborationModal(false);
      setCollaborationForm({
        partner_organization_id: "",
        message: "",
        partnership_type: "partnership",
        focus_areas: [],
        proposed_start_date: "",
        proposed_end_date: "",
        expected_outcomes: "",
        resources_offered: "",
      });
      if (selectedOrg) {
        await fetchCollaborationRequests(selectedOrg.id);
      }
    } catch (error) {
      console.error("Error sending collaboration request:", error);
      alert("Failed to send collaboration request. Please try again.");
    }
  };

  const handleRespondToRequest = async (requestId: string, accept: boolean) => {
    try {
      const { error } = await supabase
        .from("collaboration_requests")
        .update({ status: accept ? "accepted" : "rejected" })
        .eq("id", requestId);

      if (error) throw error;

      if (accept) {
        const request = collaborationRequests.find(r => r.id === requestId);
        if (request) {
          const { error: collabError } = await supabase
            .from("collaborations")
            .insert({
              organization_id: request.to_organization_id,
              partner_organization_id: request.from_organization_id,
              type: request.partnership_type,
              status: "active",
              start_date: request.proposed_start_date || new Date().toISOString(),
              end_date: request.proposed_end_date || null,
              description: request.message,
              focus_areas: request.focus_areas,
              contact_person_id: user?.id,
              contact_person_name: user?.full_name,
              communication_channels: ["email", "meetings"],
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });

          if (collabError) throw collabError;
        }
      }

      await fetchCollaborationRequests(selectedOrg?.id || "");
      await fetchCollaborations(selectedOrg?.id || "");
      
      alert(accept ? "Collaboration request accepted!" : "Collaboration request declined.");
    } catch (error) {
      console.error("Error responding to request:", error);
      alert("Failed to process request. Please try again.");
    }
  };

  const handleRegisterForEvent = async (eventId: string) => {
    try {
      const { error } = await supabase
        .from("event_registrations")
        .insert({
          event_id: eventId,
          user_id: user?.id,
          organization_id: selectedOrg?.id,
          registered_at: new Date().toISOString(),
        });

      if (error) throw error;
      
      const { error: updateError } = await supabase
        .from("events")
        .update({ registered: (events.find(e => e.id === eventId)?.registered || 0) + 1 })
        .eq("id", eventId);

      if (updateError) throw updateError;

      alert("Successfully registered for the event!");
      if (selectedOrg) {
        await fetchEvents(selectedOrg.id);
      }
    } catch (error) {
      console.error("Error registering for event:", error);
      alert("Failed to register for event. Please try again.");
    }
  };

  // ============ HELPERS ============

  const getEventTypeColor = (type: string) => {
    return eventTypeColors[type as keyof typeof eventTypeColors] || "bg-slate-500/20 text-slate-400";
  };

  const getNoticePriorityColor = (priority: string) => {
    return noticePriorityColors[priority as keyof typeof noticePriorityColors] || "bg-slate-500/20 text-slate-400";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
      case "accepted":
        return "bg-emerald-500/20 text-emerald-400";
      case "pending":
        return "bg-yellow-500/20 text-yellow-400";
      case "completed":
        return "bg-blue-500/20 text-blue-400";
      case "rejected":
      case "cancelled":
        return "bg-red-500/20 text-red-400";
      default:
        return "bg-slate-500/20 text-slate-400";
    }
  };

  const canEdit = () => {
    if (!user || !selectedOrg) return false;
    if (user.role === "Admin") return true;
    if (["Coordinator", "mental_health_coordinator", "researcher_coordinator", "cso_coordinator"].includes(user.role)) {
      return selectedOrg.country === (user.assigned_country || user.country);
    }
    return true;
  };

  const getPartnerOptions = () => {
    return organizations
      .filter(org => org.id !== selectedOrg?.id)
      .map(org => ({
        value: org.id,
        label: `${org.name} (${org.country})`
      }));
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          event.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || event.type === filterType;
    return matchesSearch && matchesType;
  });

  const filteredNotices = notices.filter(notice => {
    return notice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
           notice.content.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const filteredMembers = teamMembers.filter(member => {
    return member.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           member.email.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // ============ LOADING STATE ============

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-300">Loading collaboration hub...</p>
        </div>
      </div>
    );
  }

  if (!selectedOrg) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-10 h-10 text-cyan-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">No Organization Selected</h2>
          <p className="text-slate-400 mb-6">Please select or create an organization to access the collaboration hub.</p>
          <button
            onClick={() => router.push("/organizations")}
            className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-700 rounded-xl text-white transition-colors"
          >
            Go to Organizations
          </button>
        </div>
      </div>
    );
  }

  // ============ RENDER ============

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-cyan-950 to-slate-900 border-b border-cyan-500/20">
        <div className="relative px-6 md:px-8 py-6 md:py-8">
          <div className="flex justify-between items-start flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="px-3 py-1 bg-cyan-500/20 rounded-full border border-cyan-500/30">
                  <span className="text-cyan-300 text-xs font-mono tracking-wider">
                    COLLABORATION HUB
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Handshake className="w-4 h-4 text-emerald-400" />
                  <span className="text-slate-400 text-xs">
                    {collaborations.length} Active Collaborations
                  </span>
                </div>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                {selectedOrg.name}
              </h1>
              <p className="text-slate-300 text-sm md:text-base mt-2">
                Manage your team, events, notices, and collaborate with partners
              </p>
            </div>

            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => window.location.reload()}
                className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-600 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="text-sm hidden sm:inline">Refresh</span>
              </button>
              <button
                onClick={() => router.push("/organizations")}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-600 text-white transition-colors"
              >
                <ArrowRight className="w-4 h-4" />
                <span className="text-sm">All Orgs</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 md:px-8 py-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-cyan-400" />
              <p className="text-slate-400 text-xs">Team Members</p>
            </div>
            <p className="text-2xl font-bold text-white">{teamMembers.length}</p>
          </div>
          <div className="bg-purple-500/10 rounded-xl p-4 border border-purple-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-purple-400" />
              <p className="text-purple-400 text-xs">Upcoming Events</p>
            </div>
            <p className="text-2xl font-bold text-purple-400">{events.filter(e => e.status === "upcoming").length}</p>
          </div>
          <div className="bg-yellow-500/10 rounded-xl p-4 border border-yellow-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Megaphone className="w-4 h-4 text-yellow-400" />
              <p className="text-yellow-400 text-xs">Notices</p>
            </div>
            <p className="text-2xl font-bold text-yellow-400">{notices.length}</p>
          </div>
          <div className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Handshake className="w-4 h-4 text-emerald-400" />
              <p className="text-emerald-400 text-xs">Collaborations</p>
            </div>
            <p className="text-2xl font-bold text-emerald-400">{collaborations.length}</p>
          </div>
          <div className="bg-amber-500/10 rounded-xl p-4 border border-amber-500/20">
            <div className="flex items-center gap-2 mb-2">
              <BellRing className="w-4 h-4 text-amber-400" />
              <p className="text-amber-400 text-xs">Pending Requests</p>
            </div>
            <p className="text-2xl font-bold text-amber-400">{collaborationRequests.length}</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-700 pb-4">
          <button
            onClick={() => setActiveTab("members")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === "members" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Users className="w-4 h-4" />
            Team Members
            <span className="text-xs bg-slate-700 px-2 py-0.5 rounded-full">{teamMembers.length}</span>
          </button>
          <button
            onClick={() => setActiveTab("events")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === "events" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Calendar className="w-4 h-4" />
            Events
            <span className="text-xs bg-slate-700 px-2 py-0.5 rounded-full">{events.filter(e => e.status === "upcoming").length}</span>
          </button>
          <button
            onClick={() => setActiveTab("notices")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === "notices" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Megaphone className="w-4 h-4" />
            Notices
          </button>
          <button
            onClick={() => setActiveTab("collaborate")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === "collaborate" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Handshake className="w-4 h-4" />
            Collaborate
            {collaborationRequests.length > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                {collaborationRequests.length}
              </span>
            )}
          </button>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {/* ===== MEMBERS TAB ===== */}
          {activeTab === "members" && (
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
              <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                    <Users className="w-5 h-5 text-cyan-400" />
                    Team Members
                  </h3>
                  <span className="text-slate-400 text-sm">({teamMembers.length} members)</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search members..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="bg-slate-700 border border-slate-600 rounded-xl pl-10 pr-4 py-2 text-white text-sm focus:outline-none focus:border-cyan-500 w-48"
                    />
                  </div>
                  {canEdit() && (
                    <button
                      onClick={() => setShowAddMember(true)}
                      className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-xl text-white text-sm transition-colors flex items-center gap-2"
                    >
                      <UserPlus className="w-4 h-4" />
                      Add Member
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMembers.map((member) => (
                  <div key={member.id} className="bg-slate-700/30 rounded-xl p-4 border border-slate-600 hover:border-cyan-500/30 transition-all">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                        {member.avatar_url ? (
                          <img src={member.avatar_url} alt={member.full_name} className="w-12 h-12 rounded-full object-cover" />
                        ) : (
                          <span className="text-cyan-400 font-bold text-lg">{member.full_name?.charAt(0) || '?'}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">{member.full_name}</p>
                        <p className="text-slate-400 text-sm truncate">{member.email}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          <span className={`px-2 py-0.5 rounded-full text-xs ${
                            member.role === "Admin" ? "bg-purple-500/20 text-purple-400" :
                            member.role === "Manager" ? "bg-yellow-500/20 text-yellow-400" :
                            "bg-cyan-500/20 text-cyan-400"
                          }`}>
                            {member.role}
                          </span>
                          {member.department && (
                            <span className="px-2 py-0.5 rounded-full text-xs bg-slate-600 text-slate-300">
                              {member.department}
                            </span>
                          )}
                        </div>
                        {member.skills && member.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {member.skills.slice(0, 3).map((skill, idx) => (
                              <span key={idx} className="text-xs text-slate-400">#{skill}</span>
                            ))}
                            {member.skills.length > 3 && (
                              <span className="text-xs text-slate-500">+{member.skills.length - 3}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-slate-600/50 flex justify-between items-center">
                      <span className="text-slate-500 text-xs">
                        Joined {new Date(member.joined_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {filteredMembers.length === 0 && (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                  <p className="text-slate-400">No team members found</p>
                </div>
              )}
            </div>
          )}

          {/* ===== EVENTS TAB ===== */}
          {activeTab === "events" && (
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
              <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-cyan-400" />
                  Events & Activities
                </h3>
                <div className="flex flex-wrap gap-2">
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="bg-slate-700 border border-slate-600 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500"
                  >
                    <option value="all">All Types</option>
                    <option value="webinar">Webinar</option>
                    <option value="workshop">Workshop</option>
                    <option value="conference">Conference</option>
                    <option value="networking">Networking</option>
                    <option value="training">Training</option>
                    <option value="meeting">Meeting</option>
                    <option value="social">Social</option>
                  </select>
                  {canEdit() && (
                    <button
                      onClick={() => setShowCreateEvent(true)}
                      className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-xl text-white text-sm transition-colors flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Create Event
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredEvents.map((event) => (
                  <div key={event.id} className="bg-slate-700/30 rounded-xl border border-slate-600 p-4 hover:border-cyan-500/30 transition-all">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex flex-wrap gap-1">
                        <span className={`px-2 py-1 rounded-full text-xs ${getEventTypeColor(event.type)}`}>
                          {event.type}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadge(event.status)}`}>
                          {event.status}
                        </span>
                      </div>
                      <span className="text-slate-400 text-sm">
                        {event.registered}/{event.capacity} registered
                      </span>
                    </div>
                    <h4 className="text-white font-semibold">{event.title}</h4>
                    <p className="text-slate-400 text-sm mt-1 line-clamp-2">{event.description}</p>
                    <div className="mt-3 space-y-1 text-sm text-slate-400">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4" />
                        {new Date(event.start_date).toLocaleString()} - {new Date(event.end_date).toLocaleString()}
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-2">
                          <MapPinIcon className="w-4 h-4" />
                          {event.location}
                        </div>
                      )}
                      {event.virtual_link && (
                        <a
                          href={event.virtual_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                        >
                          Join Virtual Event <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                    {event.status !== "completed" && event.status !== "cancelled" && (
                      <button
                        onClick={() => handleRegisterForEvent(event.id)}
                        className="mt-4 w-full py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-white transition-colors text-sm"
                      >
                        Register for Event
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {filteredEvents.length === 0 && (
                <div className="text-center py-12">
                  <Calendar className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                  <p className="text-slate-400">No events found</p>
                </div>
              )}
            </div>
          )}

          {/* ===== NOTICES TAB ===== */}
          {activeTab === "notices" && (
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
              <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                  <Megaphone className="w-5 h-5 text-cyan-400" />
                  Notices & Announcements
                </h3>
                {canEdit() && (
                  <button
                    onClick={() => setShowCreateNotice(true)}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-xl text-white text-sm transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Post Notice
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {filteredNotices.map((notice) => (
                  <div
                    key={notice.id}
                    className={`bg-slate-700/30 rounded-xl p-4 border ${
                      notice.is_pinned ? "border-yellow-500/40 bg-yellow-500/10" : "border-slate-600"
                    } transition-all`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <span className={`px-2 py-1 rounded-full text-xs ${getNoticePriorityColor(notice.priority)}`}>
                          {notice.priority}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-white font-semibold">{notice.title}</h4>
                          {notice.is_pinned && (
                            <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Star className="w-3 h-3" /> Pinned
                            </span>
                          )}
                          <span className="text-xs bg-slate-600 text-slate-300 px-2 py-0.5 rounded-full">
                            {notice.type}
                          </span>
                        </div>
                        <p className="text-slate-300 text-sm mt-1 whitespace-pre-wrap">{notice.content}</p>
                        <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-500">
                          <span>Posted {new Date(notice.created_at).toLocaleDateString()}</span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {notice.read_count} views
                          </span>
                          {notice.expires_at && (
                            <span>Expires {new Date(notice.expires_at).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredNotices.length === 0 && (
                <div className="text-center py-12">
                  <Megaphone className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                  <p className="text-slate-400">No notices posted yet</p>
                </div>
              )}
            </div>
          )}

          {/* ===== COLLABORATE TAB ===== */}
          {activeTab === "collaborate" && (
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
                <div className="flex flex-wrap gap-4">
                  <button
                    onClick={() => setShowCollaborationModal(true)}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-xl text-white transition-colors flex items-center gap-2"
                  >
                    <Handshake className="w-4 h-4" />
                    Request Collaboration
                  </button>
                </div>
              </div>

              {/* Pending Collaboration Requests */}
              {collaborationRequests.length > 0 && (
                <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
                  <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                    <BellRing className="w-5 h-5 text-yellow-400" />
                    Pending Collaboration Requests ({collaborationRequests.length})
                  </h3>
                  <div className="space-y-4">
                    {collaborationRequests.map((request) => (
                      <div key={request.id} className="bg-slate-700/30 rounded-xl p-4 border border-slate-600">
                        <div className="flex flex-wrap justify-between items-start gap-4">
                          <div className="flex-1">
                            <h4 className="text-white font-medium">{request.from_organization_name}</h4>
                            <p className="text-slate-400 text-sm mt-1">{request.message}</p>
                            <div className="flex flex-wrap gap-2 mt-2">
                              <span className="text-xs bg-cyan-500/20 text-cyan-300 px-2 py-1 rounded-full">
                                {request.partnership_type}
                              </span>
                              {request.focus_areas?.map((area, idx) => (
                                <span key={idx} className="text-xs bg-slate-600 text-slate-300 px-2 py-1 rounded-full">
                                  {area}
                                </span>
                              ))}
                            </div>
                            <div className="flex flex-wrap gap-3 mt-2 text-xs text-slate-500">
                              <span>Contact: {request.contact_name}</span>
                              <span>{request.contact_email}</span>
                              {request.proposed_start_date && (
                                <span>Proposed: {new Date(request.proposed_start_date).toLocaleDateString()}</span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2 flex-shrink-0">
                            <button
                              onClick={() => handleRespondToRequest(request.id, true)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-white text-sm transition-colors"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleRespondToRequest(request.id, false)}
                              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 rounded-lg text-white text-sm transition-colors"
                            >
                              Decline
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Active Collaborations */}
              <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
                <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                  <Handshake className="w-5 h-5 text-emerald-400" />
                  Active Collaborations ({collaborations.length})
                </h3>
                {collaborations.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {collaborations.map((collab) => (
                      <div key={collab.id} className="bg-slate-700/30 rounded-xl p-4 border border-slate-600">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-emerald-500/20 rounded-lg">
                            <Handshake className="w-5 h-5 text-emerald-400" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-white font-medium">
                              {collab.partner_organization_name || "Partner Organization"}
                            </h4>
                            <p className="text-slate-400 text-sm">{collab.type}</p>
                            <p className="text-slate-400 text-sm mt-1">{collab.description}</p>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {collab.focus_areas?.map((area, idx) => (
                                <span key={idx} className="text-xs bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full">
                                  {area}
                                </span>
                              ))}
                            </div>
                            <p className="text-slate-500 text-xs mt-2">
                              Since {new Date(collab.start_date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 text-center py-8">
                    No active collaborations yet. Start partnering with other organizations!
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ===== MODALS ===== */}

      {/* Add Member Modal */}
      {showAddMember && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setShowAddMember(false)}>
          <div className="bg-slate-800 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-700">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <UserPlus className="w-6 h-6 text-cyan-400" />
                  Add Team Member
                </h2>
                <button onClick={() => setShowAddMember(false)} className="text-slate-400 hover:text-white text-2xl">&times;</button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-slate-400 text-sm block mb-2">Email Address *</label>
                <input
                  type="email"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400"
                  placeholder="member@example.com"
                />
              </div>
              <div>
                <label className="text-slate-400 text-sm block mb-2">Role</label>
                <select
                  value={newMemberRole}
                  onChange={(e) => setNewMemberRole(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white"
                >
                  <option value="Member">Member</option>
                  <option value="Manager">Manager</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="text-slate-400 text-sm block mb-2">Department</label>
                <input
                  type="text"
                  value={newMemberDepartment}
                  onChange={(e) => setNewMemberDepartment(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400"
                  placeholder="e.g., Programs, Research, Communications"
                />
              </div>
              <div>
                <label className="text-slate-400 text-sm block mb-2">Skills (comma separated)</label>
                <input
                  type="text"
                  value={newMemberSkills}
                  onChange={(e) => setNewMemberSkills(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400"
                  placeholder="e.g., Project Management, Data Analysis, Grant Writing"
                />
              </div>
              <button
                onClick={handleInviteMember}
                disabled={inviting}
                className="w-full py-3 bg-cyan-600 hover:bg-cyan-700 rounded-xl text-white font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {inviting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Invitation
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Event Modal */}
      {showCreateEvent && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setShowCreateEvent(false)}>
          <div className="bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-700">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-cyan-400" />
                  Create Event
                </h2>
                <button onClick={() => setShowCreateEvent(false)} className="text-slate-400 hover:text-white text-2xl">&times;</button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-slate-400 text-sm block mb-2">Event Title *</label>
                <input
                  type="text"
                  value={eventForm.title}
                  onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400"
                  placeholder="e.g., Annual Mental Health Conference"
                />
              </div>
              <div>
                <label className="text-slate-400 text-sm block mb-2">Description</label>
                <textarea
                  rows={3}
                  value={eventForm.description}
                  onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 resize-none"
                  placeholder="Describe your event..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 text-sm block mb-2">Event Type *</label>
                  <select
                    value={eventForm.type}
                    onChange={(e) => setEventForm({ ...eventForm, type: e.target.value as Event["type"] })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white"
                  >
                    <option value="webinar">Webinar</option>
                    <option value="workshop">Workshop</option>
                    <option value="conference">Conference</option>
                    <option value="networking">Networking</option>
                    <option value="training">Training</option>
                    <option value="meeting">Meeting</option>
                    <option value="social">Social</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 text-sm block mb-2">Capacity</label>
                  <input
                    type="number"
                    value={eventForm.capacity}
                    onChange={(e) => setEventForm({ ...eventForm, capacity: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white"
                    min="1"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 text-sm block mb-2">Start Date *</label>
                  <input
                    type="datetime-local"
                    value={eventForm.start_date}
                    onChange={(e) => setEventForm({ ...eventForm, start_date: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-sm block mb-2">End Date *</label>
                  <input
                    type="datetime-local"
                    value={eventForm.end_date}
                    onChange={(e) => setEventForm({ ...eventForm, end_date: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white"
                  />
                </div>
              </div>
              <div>
                <label className="text-slate-400 text-sm block mb-2">Location</label>
                <input
                  type="text"
                  value={eventForm.location}
                  onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400"
                  placeholder="e.g., Conference Hall, City"
                />
              </div>
              <div>
                <label className="text-slate-400 text-sm block mb-2">Virtual Link</label>
                <input
                  type="url"
                  value={eventForm.virtual_link}
                  onChange={(e) => setEventForm({ ...eventForm, virtual_link: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400"
                  placeholder="https://meet.example.com/event"
                />
              </div>
              <button
                onClick={handleCreateEvent}
                className="w-full py-3 bg-cyan-600 hover:bg-cyan-700 rounded-xl text-white font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                Create Event
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Notice Modal */}
      {showCreateNotice && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setShowCreateNotice(false)}>
          <div className="bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-700">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Megaphone className="w-6 h-6 text-cyan-400" />
                  Post Notice
                </h2>
                <button onClick={() => setShowCreateNotice(false)} className="text-slate-400 hover:text-white text-2xl">&times;</button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-slate-400 text-sm block mb-2">Title *</label>
                <input
                  type="text"
                  value={noticeForm.title}
                  onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400"
                  placeholder="e.g., Important Update: New Partnership"
                />
              </div>
              <div>
                <label className="text-slate-400 text-sm block mb-2">Content *</label>
                <textarea
                  rows={5}
                  value={noticeForm.content}
                  onChange={(e) => setNoticeForm({ ...noticeForm, content: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 resize-none"
                  placeholder="Write your notice content here..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 text-sm block mb-2">Type</label>
                  <select
                    value={noticeForm.type}
                    onChange={(e) => setNoticeForm({ ...noticeForm, type: e.target.value as Notice["type"] })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white"
                  >
                    <option value="announcement">Announcement</option>
                    <option value="update">Update</option>
                    <option value="alert">Alert</option>
                    <option value="reminder">Reminder</option>
                    <option value="news">News</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 text-sm block mb-2">Priority</label>
                  <select
                    value={noticeForm.priority}
                    onChange={(e) => setNoticeForm({ ...noticeForm, priority: e.target.value as Notice["priority"] })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-slate-300 text-sm">
                  <input
                    type="checkbox"
                    checked={noticeForm.is_pinned}
                    onChange={(e) => setNoticeForm({ ...noticeForm, is_pinned: e.target.checked })}
                  />
                  Pin this notice
                </label>
                <label className="flex items-center gap-2 text-slate-300 text-sm">
                  <input
                    type="checkbox"
                    onChange={(e) => setNoticeForm({ ...noticeForm, expires_at: e.target.checked ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : "" })}
                  />
                  Set expiration date
                </label>
              </div>
              {noticeForm.expires_at && (
                <div>
                  <label className="text-slate-400 text-sm block mb-2">Expires At</label>
                  <input
                    type="date"
                    value={noticeForm.expires_at}
                    onChange={(e) => setNoticeForm({ ...noticeForm, expires_at: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white"
                  />
                </div>
              )}
              <button
                onClick={handleCreateNotice}
                className="w-full py-3 bg-cyan-600 hover:bg-cyan-700 rounded-xl text-white font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <Megaphone className="w-4 h-4" />
                Post Notice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Collaboration Modal */}
      {showCollaborationModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setShowCollaborationModal(false)}>
          <div className="bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-700">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Handshake className="w-6 h-6 text-cyan-400" />
                  Request Collaboration
                </h2>
                <button onClick={() => setShowCollaborationModal(false)} className="text-slate-400 hover:text-white text-2xl">&times;</button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-slate-400 text-sm block mb-2">Partner Organization *</label>
                <select
                  value={collaborationForm.partner_organization_id}
                  onChange={(e) => setCollaborationForm({ ...collaborationForm, partner_organization_id: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white"
                >
                  <option value="">Select an organization</option>
                  {getPartnerOptions().map(org => (
                    <option key={org.value} value={org.value}>{org.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="text-slate-400 text-sm block mb-2">Type of Collaboration *</label>
                <select
                  value={collaborationForm.partnership_type}
                  onChange={(e) => setCollaborationForm({ ...collaborationForm, partnership_type: e.target.value as CollaborationRequest["partnership_type"] })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white"
                >
                  <option value="partnership">Partnership</option>
                  <option value="affiliation">Affiliation</option>
                  <option value="coalition">Coalition</option>
                  <option value="project">Joint Project</option>
                  <option value="network">Network</option>
                  <option value="mentorship">Mentorship</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 text-sm block mb-2">Focus Areas</label>
                <select
                  multiple
                  value={collaborationForm.focus_areas}
                  onChange={(e) => {
                    const values = Array.from(e.target.selectedOptions, option => option.value);
                    setCollaborationForm({ ...collaborationForm, focus_areas: values });
                  }}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white min-h-[100px]"
                >
                  {focusAreasOptions.map(area => (
                    <option key={area} value={area}>{area}</option>
                  ))}
                </select>
                <p className="text-slate-500 text-xs mt-1">Hold Ctrl/Cmd to select multiple</p>
              </div>

              <div>
                <label className="text-slate-400 text-sm block mb-2">Message *</label>
                <textarea
                  value={collaborationForm.message}
                  onChange={(e) => setCollaborationForm({ ...collaborationForm, message: e.target.value })}
                  rows={4}
                  placeholder="Describe why you want to collaborate and what you hope to achieve..."
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 text-sm block mb-2">Proposed Start Date</label>
                  <input
                    type="date"
                    value={collaborationForm.proposed_start_date}
                    onChange={(e) => setCollaborationForm({ ...collaborationForm, proposed_start_date: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-sm block mb-2">Proposed End Date</label>
                  <input
                    type="date"
                    value={collaborationForm.proposed_end_date}
                    onChange={(e) => setCollaborationForm({ ...collaborationForm, proposed_end_date: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 text-sm block mb-2">Expected Outcomes (comma separated)</label>
                <input
                  type="text"
                  value={collaborationForm.expected_outcomes}
                  onChange={(e) => setCollaborationForm({ ...collaborationForm, expected_outcomes: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400"
                  placeholder="e.g., Improved access, Capacity building, Knowledge sharing"
                />
              </div>

              <div>
                <label className="text-slate-400 text-sm block mb-2">Resources Offered (comma separated)</label>
                <input
                  type="text"
                  value={collaborationForm.resources_offered}
                  onChange={(e) => setCollaborationForm({ ...collaborationForm, resources_offered: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400"
                  placeholder="e.g., Training materials, Data, Technical expertise"
                />
              </div>

              <button
                onClick={handleSendCollaborationRequest}
                className="w-full py-3 bg-cyan-600 hover:bg-cyan-700 rounded-xl text-white font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                Send Collaboration Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}