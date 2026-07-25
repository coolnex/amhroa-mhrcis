// app/events/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  Video,
  Building2,
  Ticket,
  CheckCircle,
  Activity,
  User,
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
  Globe,
  UserPlus,
  Link as LinkIcon,
  Shield,
  Check,
  XCircle,
  Lock,
  Users as UsersIcon,
  UserCog,
  Building,
  Layers,
  Flag,
} from "lucide-react";
import Link from "next/link";
import { africanCountries } from "@/lib/countries-data";

interface Event {
  id: string;
  title: string;
  description: string;
  event_type: string;
  start_date: string;
  end_date: string;
  venue: string;
  location: string;
  country: string;
  capacity: number;
  registered_count: number;
  is_virtual: boolean;
  meeting_link: string;
  registration_fee: number;
  status: string;
  approval_status: "Pending" | "Approved" | "Rejected";
  rejected_reason?: string;
  created_by: string;
  created_by_name?: string;
  created_by_email?: string;
  approved_by?: string;
  approved_at?: string;
  speakers: Array<{ name: string; title: string; organization: string }>;
  // Target audience fields
  target_audience_type: "all" | "roles" | "working_groups" | "organizations" | "countries";
  target_roles: string[];
  target_working_group_ids: string[];
  target_organization_ids: string[];
  target_countries: string[];
  target_working_group_names?: string[];
  target_organization_names?: string[];
}

interface WorkingGroup {
  id: string;
  name: string;
  description: string;
}

interface Organization {
  id: string;
  name: string;
  type: string;
}

const eventTypes = [
  "Conference",
  "Webinar",
  "Workshop",
  "Training",
  "Summit",
  "Networking",
];

const USER_ROLES = [
  "Admin",
  "Policymaker",
  "Researcher",
  "CSO",
  "Coordinator",
  "Donor",
  "Mental_Health_Professional",
  "Regional_Executive",
];

const TARGET_AUDIENCE_TYPES = [
  { value: "all", label: "Everyone", icon: Globe },
  { value: "roles", label: "Specific Roles", icon: UserCog },
  { value: "working_groups", label: "Working Groups", icon: UsersIcon },
  { value: "organizations", label: "Organizations", icon: Building },
  { value: "countries", label: "Specific Countries", icon: Flag },
];

export default function EventsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventIdParam = searchParams.get('id');
  
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string>("");
  const [userWorkingGroups, setUserWorkingGroups] = useState<string[]>([]);
  const [userOrganizations, setUserOrganizations] = useState<string[]>([]);
  const [userCountry, setUserCountry] = useState<string>("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [approvalFilter, setApprovalFilter] = useState("all");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [registeredEvents, setRegisteredEvents] = useState<Set<string>>(new Set());
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [workingGroups, setWorkingGroups] = useState<WorkingGroup[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [audienceFilter, setAudienceFilter] = useState("all");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    event_type: "",
    start_date: "",
    end_date: "",
    venue: "",
    location: "",
    country: "",
    capacity: "",
    is_virtual: false,
    meeting_link: "",
    registration_fee: "0",
    speakers: [] as { name: string; title: string; organization: string }[],
    target_audience_type: "all" as "all" | "roles" | "working_groups" | "organizations" | "countries",
    target_roles: [] as string[],
    target_working_group_ids: [] as string[],
    target_organization_ids: [] as string[],
    target_countries: [] as string[],
  });

  // Calculate stats
  const stats = {
    total: events.length,
    upcoming: events.filter(e => e.status === "Upcoming" && e.approval_status === "Approved").length,
    ongoing: events.filter(e => e.status === "Ongoing" && e.approval_status === "Approved").length,
    completed: events.filter(e => e.status === "Completed" && e.approval_status === "Approved").length,
    pending: events.filter(e => e.approval_status === "Pending").length,
  };

  const isAdmin = userRole === "Admin";

  useEffect(() => {
    checkUser();
    fetchEvents();
    fetchWorkingGroups();
    fetchOrganizations();
  }, []);

  // Auto-open event from URL parameter
  useEffect(() => {
    if (eventIdParam && events.length > 0 && !selectedEvent) {
      const event = events.find(e => e.id === eventIdParam);
      if (event) {
        setSelectedEvent(event);
        router.replace('/events', { scroll: false });
      }
    }
  }, [eventIdParam, events, selectedEvent]);

  const checkUser = async () => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const userData = JSON.parse(userStr);
      setUser(userData);
      setUserRole(userData.role || "");
      setUserCountry(userData.country || "");
      
      // Get user's working groups
      const { data: wgData } = await supabase
        .from("working_group_members")
        .select("working_group_id")
        .eq("user_id", userData.id);
      
      setUserWorkingGroups(wgData?.map((w: any) => w.working_group_id) || []);
      
      // Get user's organizations
      const { data: orgData } = await supabase
        .from("organization_members")
        .select("organization_id")
        .eq("user_id", userData.id);
      
      setUserOrganizations(orgData?.map((o: any) => o.organization_id) || []);
      
      const { data: registrations } = await supabase
        .from("event_registrations")
        .select("event_id")
        .eq("user_id", userData.id);
      
      setRegisteredEvents(new Set(registrations?.map((r: any) => r.event_id) || []));
      return;
    }

    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) return;

    const { data: profile } = await supabase
      .from("users")
      .select("*")
      .eq("id", session.user.id)
      .single();
    
    if (profile) {
      setUser(profile);
      setUserRole(profile.role || "");
      setUserCountry(profile.country || "");
      localStorage.setItem("user", JSON.stringify(profile));
      
      // Get user's working groups
      const { data: wgData } = await supabase
        .from("working_group_members")
        .select("working_group_id")
        .eq("user_id", profile.id);
      
      setUserWorkingGroups(wgData?.map((w: any) => w.working_group_id) || []);
      
      // Get user's organizations
      const { data: orgData } = await supabase
        .from("organization_members")
        .select("organization_id")
        .eq("user_id", profile.id);
      
      setUserOrganizations(orgData?.map((o: any) => o.organization_id) || []);
      
      const { data: registrations } = await supabase
        .from("event_registrations")
        .select("event_id")
        .eq("user_id", profile.id);
      
      setRegisteredEvents(new Set(registrations?.map((r: any) => r.event_id) || []));
    }
  };

  const fetchWorkingGroups = async () => {
    try {
      const { data, error } = await supabase
        .from("working_groups")
        .select("id, name, description")
        .order("name");
      
      if (!error && data) {
        setWorkingGroups(data);
      }
    } catch (error) {
      console.error("Error fetching working groups:", error);
    }
  };

  const fetchOrganizations = async () => {
    try {
      const { data, error } = await supabase
        .from("organizations")
        .select("id, name, type")
        .eq("status", "Approved")
        .order("name");
      
      if (!error && data) {
        setOrganizations(data);
      }
    } catch (error) {
      console.error("Error fetching organizations:", error);
    }
  };

  const fetchEvents = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("events")
        .select("*")
        .order("start_date", { ascending: true });

      // For non-admin users, filter by visibility
      if (userRole !== "Admin") {
        // Get events that are approved AND the user can view
        const { data: allEvents, error: fetchError } = await query;
        
        if (fetchError) throw fetchError;
        
        if (!allEvents) {
          setEvents([]);
          setLoading(false);
          return;
        }

        // Filter events based on user's visibility
        const visibleEvents = await Promise.all(
          allEvents.map(async (event: any) => {
            // Only show approved events to non-admins
            if (event.approval_status !== "Approved") return null;
            
            // Check if user can view this event using RPC
            const { data: canView, error: viewError } = await supabase
              .rpc('can_user_view_event', {
                user_id: user?.id || null,
                event_id: event.id
              });
            
            if (viewError) {
              console.error("Error checking event visibility:", viewError);
              return null;
            }
            
            return canView ? event : null;
          })
        );

        const filteredEvents = visibleEvents.filter((e: any) => e !== null);
        
        // Get creator names
        const creatorIds = filteredEvents.map((e: any) => e.created_by).filter((id: string) => id);
        let creatorsMap: Record<string, { full_name: string; email: string }> = {};
        
        if (creatorIds.length > 0) {
          const { data: usersData } = await supabase
            .from("users")
            .select("id, full_name, email")
            .in("id", creatorIds);
          
          if (usersData) {
            creatorsMap = usersData.reduce((acc: any, user: any) => {
              acc[user.id] = { full_name: user.full_name, email: user.email };
              return acc;
            }, {});
          }
        }

        const eventsWithDetails = filteredEvents.map((event: any) => ({
          ...event,
          created_by_name: creatorsMap[event.created_by]?.full_name || "Unknown",
          created_by_email: creatorsMap[event.created_by]?.email || "",
        }));

        setEvents(eventsWithDetails);
      } else {
        // Admin sees all events
        const { data, error } = await query;

        if (error) throw error;

        if (!data || data.length === 0) {
          setEvents([]);
          setLoading(false);
          return;
        }

        const creatorIds = data.map((e: any) => e.created_by).filter((id: string) => id);
        let creatorsMap: Record<string, { full_name: string; email: string }> = {};
        
        if (creatorIds.length > 0) {
          const { data: usersData } = await supabase
            .from("users")
            .select("id, full_name, email")
            .in("id", creatorIds);
          
          if (usersData) {
            creatorsMap = usersData.reduce((acc: any, user: any) => {
              acc[user.id] = { full_name: user.full_name, email: user.email };
              return acc;
            }, {});
          }
        }

        // Get working group names for target audiences
        const wgIds = data.flatMap((e: any) => e.target_working_group_ids || []).filter((id: string) => id);
        let wgNamesMap: Record<string, string> = {};
        if (wgIds.length > 0) {
          const { data: wgData } = await supabase
            .from("working_groups")
            .select("id, name")
            .in("id", wgIds);
          if (wgData) {
            wgNamesMap = wgData.reduce((acc: any, wg: any) => {
              acc[wg.id] = wg.name;
              return acc;
            }, {});
          }
        }

        // Get organization names for target audiences
        const orgIds = data.flatMap((e: any) => e.target_organization_ids || []).filter((id: string) => id);
        let orgNamesMap: Record<string, string> = {};
        if (orgIds.length > 0) {
          const { data: orgData } = await supabase
            .from("organizations")
            .select("id, name")
            .in("id", orgIds);
          if (orgData) {
            orgNamesMap = orgData.reduce((acc: any, org: any) => {
              acc[org.id] = org.name;
              return acc;
            }, {});
          }
        }

        // Get country names for target audiences
        const countryNames = data.flatMap((e: any) => e.target_countries || []).filter((id: string) => id);

        const eventsWithDetails = data.map((event: any) => ({
          ...event,
          created_by_name: creatorsMap[event.created_by]?.full_name || "Unknown",
          created_by_email: creatorsMap[event.created_by]?.email || "",
          target_working_group_names: (event.target_working_group_ids || []).map((id: string) => wgNamesMap[id] || id),
          target_organization_names: (event.target_organization_ids || []).map((id: string) => orgNamesMap[id] || id),
        }));

        setEvents(eventsWithDetails);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveEvent = async (eventId: string) => {
    if (!user) return;
    
    setActionLoading(eventId);
    try {
      const { error } = await supabase
        .from("events")
        .update({
          approval_status: "Approved",
          approved_by: user.id,
          approved_at: new Date().toISOString(),
          status: "Upcoming",
        })
        .eq("id", eventId);

      if (error) throw error;
      
      alert("Event approved successfully!");
      fetchEvents();
    } catch (error) {
      console.error("Error approving event:", error);
      alert("Failed to approve event");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectEvent = async (eventId: string) => {
    const reason = prompt("Please enter the reason for rejection:");
    if (reason === null) return;
    
    if (!reason.trim()) {
      alert("Please provide a reason for rejection");
      return;
    }

    setActionLoading(eventId);
    try {
      const { error } = await supabase
        .from("events")
        .update({
          approval_status: "Rejected",
          rejected_reason: reason,
        })
        .eq("id", eventId);

      if (error) throw error;
      
      alert("Event rejected successfully!");
      fetchEvents();
    } catch (error) {
      console.error("Error rejecting event:", error);
      alert("Failed to reject event");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRegister = async (eventId: string) => {
    if (!user) {
      alert("Please login to register for events");
      return;
    }
  
    setActionLoading(eventId);
    try {
      const { data: existingRegistration, error: checkError } = await supabase
        .from("event_registrations")
        .select("id")
        .eq("event_id", eventId)
        .eq("user_id", user.id)
        .maybeSingle();
  
      if (checkError) {
        console.error("Check error:", checkError);
      }
  
      if (existingRegistration) {
        alert("You are already registered for this event!");
        setActionLoading(null);
        return;
      }
  
      const { error } = await supabase.from("event_registrations").insert({
        event_id: eventId,
        user_id: user.id,
        registration_status: "Registered",
        registered_at: new Date().toISOString(),
      });
  
      if (error) throw error;
  
      // Update registered count
      const { error: updateError } = await supabase.rpc('increment_event_registrations', { 
        event_id: eventId 
      });
      
      if (updateError) {
        console.error("Error updating count:", updateError);
        
        const { data: eventData, error: fetchError } = await supabase
          .from("events")
          .select("registered_count")
          .eq("id", eventId)
          .single();
        
        if (fetchError) {
          console.error("Error fetching event:", fetchError);
        } else if (eventData) {
          const newCount = (eventData.registered_count || 0) + 1;
          const { error: directUpdateError } = await supabase
            .from("events")
            .update({ registered_count: newCount })
            .eq("id", eventId);
          
          if (directUpdateError) {
            console.error("Direct update error:", directUpdateError);
          }
        }
      }
      
      await fetchEvents();
      setRegisteredEvents(prev => new Set([...prev, eventId]));
      
      alert("Successfully registered for event!");
    } catch (error) {
      console.error("Error registering for event:", error);
      alert("Failed to register. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSubmitting(true);
    try {
      const eventData = {
        title: formData.title,
        description: formData.description,
        event_type: formData.event_type,
        start_date: formData.start_date,
        end_date: formData.end_date,
        venue: formData.venue,
        location: formData.location,
        country: formData.country,
        capacity: parseInt(formData.capacity) || null,
        is_virtual: formData.is_virtual,
        meeting_link: formData.meeting_link,
        registration_fee: parseFloat(formData.registration_fee),
        speakers: formData.speakers,
        created_by: user.id,
        status: "Upcoming",
        approval_status: "Pending",
        // Target audience fields
        target_audience_type: formData.target_audience_type,
        target_roles: formData.target_roles,
        target_working_group_ids: formData.target_working_group_ids,
        target_organization_ids: formData.target_organization_ids,
        target_countries: formData.target_countries,
      };

      const { error } = await supabase.from("events").insert(eventData);

      if (error) throw error;

      setShowCreateModal(false);
      setFormData({
        title: "",
        description: "",
        event_type: "",
        start_date: "",
        end_date: "",
        venue: "",
        location: "",
        country: "",
        capacity: "",
        is_virtual: false,
        meeting_link: "",
        registration_fee: "0",
        speakers: [],
        target_audience_type: "all",
        target_roles: [],
        target_working_group_ids: [],
        target_organization_ids: [],
        target_countries: [],
      });
      
      alert("Event created successfully! It will be displayed after admin approval.");
      fetchEvents();
    } catch (error) {
      console.error("Error creating event:", error);
      alert("Failed to create event");
    } finally {
      setSubmitting(false);
    }
  };

  const addSpeaker = () => {
    setFormData(prev => ({
      ...prev,
      speakers: [...prev.speakers, { name: "", title: "", organization: "" }],
    }));
  };

  const updateSpeaker = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      speakers: prev.speakers.map((speaker, i) =>
        i === index ? { ...speaker, [field]: value } : speaker
      ),
    }));
  };

  const removeSpeaker = (index: number) => {
    setFormData(prev => ({
      ...prev,
      speakers: prev.speakers.filter((_, i) => i !== index),
    }));
  };

  const toggleRole = (role: string) => {
    setFormData(prev => ({
      ...prev,
      target_roles: prev.target_roles.includes(role)
        ? prev.target_roles.filter(r => r !== role)
        : [...prev.target_roles, role],
    }));
  };

  const toggleWorkingGroup = (id: string) => {
    setFormData(prev => ({
      ...prev,
      target_working_group_ids: prev.target_working_group_ids.includes(id)
        ? prev.target_working_group_ids.filter(w => w !== id)
        : [...prev.target_working_group_ids, id],
    }));
  };

  const toggleOrganization = (id: string) => {
    setFormData(prev => ({
      ...prev,
      target_organization_ids: prev.target_organization_ids.includes(id)
        ? prev.target_organization_ids.filter(o => o !== id)
        : [...prev.target_organization_ids, id],
    }));
  };

  const toggleCountry = (country: string) => {
    setFormData(prev => ({
      ...prev,
      target_countries: prev.target_countries.includes(country)
        ? prev.target_countries.filter(c => c !== country)
        : [...prev.target_countries, country],
    }));
  };

  // Filter events
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || event.event_type === typeFilter;
    const matchesStatus = statusFilter === "all" || event.status === statusFilter;
    const matchesApproval = approvalFilter === "all" || event.approval_status === approvalFilter;
    
    // Audience filter
    let matchesAudience = true;
    if (audienceFilter === "all") {
      matchesAudience = true;
    } else if (audienceFilter === "roles") {
      matchesAudience = event.target_audience_type === "roles";
    } else if (audienceFilter === "working_groups") {
      matchesAudience = event.target_audience_type === "working_groups";
    } else if (audienceFilter === "organizations") {
      matchesAudience = event.target_audience_type === "organizations";
    } else if (audienceFilter === "countries") {
      matchesAudience = event.target_audience_type === "countries";
    }
    
    return matchesSearch && matchesType && matchesStatus && matchesApproval && matchesAudience;
  });

  const getAudienceDisplay = (event: Event) => {
    if (event.target_audience_type === "all") {
      return <span className="text-xs text-emerald-400">🌍 Everyone</span>;
    }
    if (event.target_audience_type === "roles") {
      return (
        <div className="flex flex-wrap gap-1">
          {event.target_roles?.slice(0, 2).map(role => (
            <span key={role} className="px-1.5 py-0.5 bg-blue-500/20 rounded text-xs text-blue-300">
              {role.replace(/_/g, ' ')}
            </span>
          ))}
          {(event.target_roles?.length || 0) > 2 && (
            <span className="px-1.5 py-0.5 bg-slate-600 rounded text-xs text-slate-300">
              +{event.target_roles.length - 2}
            </span>
          )}
        </div>
      );
    }
    if (event.target_audience_type === "working_groups") {
      return (
        <div className="flex flex-wrap gap-1">
          {(event.target_working_group_names || event.target_working_group_ids || []).slice(0, 2).map((name, i) => (
            <span key={i} className="px-1.5 py-0.5 bg-purple-500/20 rounded text-xs text-purple-300">
              {name}
            </span>
          ))}
          {(event.target_working_group_ids?.length || 0) > 2 && (
            <span className="px-1.5 py-0.5 bg-slate-600 rounded text-xs text-slate-300">
              +{event.target_working_group_ids.length - 2}
            </span>
          )}
        </div>
      );
    }
    if (event.target_audience_type === "organizations") {
      return (
        <div className="flex flex-wrap gap-1">
          {(event.target_organization_names || event.target_organization_ids || []).slice(0, 2).map((name, i) => (
            <span key={i} className="px-1.5 py-0.5 bg-emerald-500/20 rounded text-xs text-emerald-300">
              {name}
            </span>
          ))}
          {(event.target_organization_ids?.length || 0) > 2 && (
            <span className="px-1.5 py-0.5 bg-slate-600 rounded text-xs text-slate-300">
              +{event.target_organization_ids.length - 2}
            </span>
          )}
        </div>
      );
    }
    if (event.target_audience_type === "countries") {
      return (
        <div className="flex flex-wrap gap-1">
          {(event.target_countries || []).slice(0, 2).map(country => (
            <span key={country} className="px-1.5 py-0.5 bg-amber-500/20 rounded text-xs text-amber-300">
              {country}
            </span>
          ))}
          {(event.target_countries?.length || 0) > 2 && (
            <span className="px-1.5 py-0.5 bg-slate-600 rounded text-xs text-slate-300">
              +{event.target_countries.length - 2}
            </span>
          )}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-300">Loading events...</p>
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
                    CONTINENTAL EVENTS & NETWORKING
                  </span>
                </div>
                {isAdmin && stats.pending > 0 && (
                  <div className="px-3 py-1 bg-yellow-500/20 rounded-full border border-yellow-500/30">
                    <span className="text-yellow-300 text-xs font-mono tracking-wider">
                      {stats.pending} Pending Approval
                    </span>
                  </div>
                )}
              </div>
              <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Events & Networking
              </h1>
              <p className="text-slate-300 text-base md:text-lg mt-3 max-w-2xl">
                {isAdmin 
                  ? "Manage events across the continent. Approve, review, and coordinate all activities."
                  : "Connect with mental health professionals, attend continental conferences, webinars, and networking events."}
              </p>
            </div>

            <div className="flex gap-2">
              {user && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-xl text-white transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span className="text-sm">Create Event</span>
                </button>
              )}
              <button
                onClick={fetchEvents}
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
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-cyan-400" />
              <p className="text-slate-400 text-xs">Total Events</p>
            </div>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </div>
          <div className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              <p className="text-emerald-400 text-xs">Upcoming</p>
            </div>
            <p className="text-2xl font-bold text-emerald-400">{stats.upcoming}</p>
          </div>
          <div className="bg-cyan-500/10 rounded-xl p-4 border border-cyan-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <p className="text-cyan-400 text-xs">Ongoing</p>
            </div>
            <p className="text-2xl font-bold text-cyan-400">{stats.ongoing}</p>
          </div>
          <div className="bg-purple-500/10 rounded-xl p-4 border border-purple-500/20">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-purple-400" />
              <p className="text-purple-400 text-xs">Completed</p>
            </div>
            <p className="text-2xl font-bold text-purple-400">{stats.completed}</p>
          </div>
          {isAdmin && (
            <div className="bg-yellow-500/10 rounded-xl p-4 border border-yellow-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-yellow-400" />
                <p className="text-yellow-400 text-xs">Pending Approval</p>
              </div>
              <p className="text-2xl font-bold text-yellow-400">{stats.pending}</p>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search events..."
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
            {eventTypes.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white"
          >
            <option value="all">All Status</option>
            <option value="Upcoming">Upcoming</option>
            <option value="Ongoing">Ongoing</option>
            <option value="Completed">Completed</option>
          </select>

          {isAdmin && (
            <>
              <select
                value={approvalFilter}
                onChange={(e) => setApprovalFilter(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white"
              >
                <option value="all">All Approval</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
              
              <select
                value={audienceFilter}
                onChange={(e) => setAudienceFilter(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white"
              >
                <option value="all">All Audiences</option>
                <option value="roles">Role-Based</option>
                <option value="working_groups">Working Groups</option>
                <option value="organizations">Organizations</option>
                <option value="countries">Countries</option>
              </select>
            </>
          )}
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredEvents.map((event) => {
            const isRegistered = registeredEvents.has(event.id);
            const isFull = event.registered_count >= event.capacity;
            const isUpcoming = event.status === "Upcoming";
            const isPending = event.approval_status === "Pending";
            const isRejected = event.approval_status === "Rejected";
            const isApproved = event.approval_status === "Approved";
            const canView = isAdmin || isApproved;
            
            if (!canView) return null;
            
            return (
              <div
                key={event.id}
                className={`bg-slate-800/50 rounded-2xl border transition-all overflow-hidden cursor-pointer ${
                  isPending ? "border-yellow-500/30 opacity-75" :
                  isRejected ? "border-red-500/30 opacity-50" :
                  "border-slate-700 hover:border-cyan-500/30"
                }`}
                onClick={() => setSelectedEvent(event)}
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3 flex-wrap gap-2">
                    <div className="flex gap-2 flex-wrap">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        event.event_type === "Conference" ? "bg-purple-500/20 text-purple-400" :
                        event.event_type === "Webinar" ? "bg-cyan-500/20 text-cyan-400" :
                        event.event_type === "Workshop" ? "bg-emerald-500/20 text-emerald-400" :
                        "bg-slate-500/20 text-slate-400"
                      }`}>
                        {event.event_type}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        event.status === "Upcoming" ? "bg-emerald-500/20 text-emerald-400" :
                        event.status === "Ongoing" ? "bg-cyan-500/20 text-cyan-400" :
                        "bg-slate-500/20 text-slate-400"
                      }`}>
                        {event.status}
                      </span>
                      {isPending && (
                        <span className="px-2 py-1 rounded-full text-xs bg-yellow-500/20 text-yellow-400">
                          Pending Approval
                        </span>
                      )}
                      {isRejected && (
                        <span className="px-2 py-1 rounded-full text-xs bg-red-500/20 text-red-400">
                          Rejected
                        </span>
                      )}
                    </div>
                    {isAdmin && isPending && (
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApproveEvent(event.id);
                          }}
                          disabled={actionLoading === event.id}
                          className="p-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 rounded-lg text-emerald-400 transition-colors disabled:opacity-50"
                          title="Approve"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRejectEvent(event.id);
                          }}
                          disabled={actionLoading === event.id}
                          className="p-1.5 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-400 transition-colors disabled:opacity-50"
                          title="Reject"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2">{event.title}</h3>
                  <p className="text-slate-300 text-sm mb-4 line-clamp-2">{event.description}</p>

                  {/* Target Audience Badge */}
                  <div className="mb-3">
                    {getAudienceDisplay(event)}
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(event.start_date).toLocaleDateString()} {event.end_date && `- ${new Date(event.end_date).toLocaleDateString()}`}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                      {event.is_virtual ? (
                        <Video className="w-4 h-4" />
                      ) : (
                        <MapPin className="w-4 h-4" />
                      )}
                      <span>{event.is_virtual ? "Virtual Event" : `${event.venue}, ${event.location}`}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                      <Users className="w-4 h-4" />
                      <span>{event.registered_count} / {event.capacity || "Unlimited"} registered</span>
                    </div>
                    {isRejected && event.rejected_reason && (
                      <div className="flex items-start gap-2 text-red-400 text-sm bg-red-500/10 p-2 rounded-lg">
                        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <span>Rejected: {event.rejected_reason}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-700">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center">
                        <User className="w-4 h-4 text-cyan-400" />
                      </div>
                      <div>
                        <p className="text-white text-sm">Organized by</p>
                        <p className="text-slate-500 text-xs">{event.created_by_name}</p>
                      </div>
                    </div>
                    {isApproved && isUpcoming && !isRegistered && !isFull && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRegister(event.id);
                        }}
                        className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-white text-sm transition-colors"
                      >
                        Register
                      </button>
                    )}
                    {isRegistered && (
                      <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-lg text-sm">
                        Registered
                      </span>
                    )}
                    {isFull && (
                      <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg text-sm">
                        Full
                      </span>
                    )}
                    {isPending && (
                      <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-lg text-sm">
                        Awaiting Approval
                      </span>
                    )}
                    {isRejected && (
                      <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg text-sm">
                        Not Approved
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredEvents.length === 0 && (
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-12 text-center">
            <Calendar className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">No events found</p>
            <p className="text-slate-500 text-sm mt-2">
              {isAdmin && approvalFilter !== "all" 
                ? "No events match the selected filter"
                : "Check back later for upcoming events"}
            </p>
            {user && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-4 px-6 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-xl text-white transition-colors"
              >
                Create an Event
              </button>
            )}
          </div>
        )}
      </div>

      {/* Create Event Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto" onClick={() => setShowCreateModal(false)}>
          <div className="bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-700 sticky top-0 bg-slate-800">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Create Event</h2>
                <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white text-2xl">&times;</button>
              </div>
              <p className="text-slate-400 text-sm mt-1">Events require admin approval before being displayed</p>
            </div>
            <form onSubmit={handleCreateEvent} className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 text-sm block mb-2">Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                    placeholder="Event title"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-sm block mb-2">Event Type *</label>
                  <select
                    value={formData.event_type}
                    onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white"
                    required
                  >
                    <option value="">Select type</option>
                    {eventTypes.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 text-sm block mb-2">Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                  placeholder="Event description"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 text-sm block mb-2">Start Date *</label>
                  <input
                    type="datetime-local"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-sm block mb-2">End Date</label>
                  <input
                    type="datetime-local"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 text-sm block mb-2">Venue</label>
                  <input
                    type="text"
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                    placeholder="Venue name"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-sm block mb-2">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                    placeholder="City, Country"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 text-sm block mb-2">Country</label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                    placeholder="Country"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-sm block mb-2">Capacity</label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                    placeholder="Max attendees"
                    min="1"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-slate-300 text-sm">
                  <input
                    type="checkbox"
                    checked={formData.is_virtual}
                    onChange={(e) => setFormData({ ...formData, is_virtual: e.target.checked })}
                  />
                  Virtual Event
                </label>
                <label className="flex items-center gap-2 text-slate-300 text-sm">
                  <input
                    type="checkbox"
                    onChange={() => setFormData(prev => ({
                      ...prev,
                      speakers: prev.speakers.length === 0 ? [{ name: "", title: "", organization: "" }] : prev.speakers
                    }))}
                  />
                  Add Speakers
                </label>
              </div>

              {formData.is_virtual && (
                <div>
                  <label className="text-slate-400 text-sm block mb-2">Meeting Link</label>
                  <input
                    type="url"
                    value={formData.meeting_link}
                    onChange={(e) => setFormData({ ...formData, meeting_link: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                    placeholder="https://meet.example.com/event"
                  />
                </div>
              )}

              {/* Target Audience Section */}
              <div className="bg-slate-700/30 rounded-xl p-4 space-y-4">
                <h3 className="text-white font-semibold text-lg">Target Audience</h3>
                
                <div>
                  <label className="text-slate-400 text-sm block mb-2">Audience Type</label>
                  <select
                    value={formData.target_audience_type}
                    onChange={(e) => setFormData({ ...formData, target_audience_type: e.target.value as any })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                  >
                    {TARGET_AUDIENCE_TYPES.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                {formData.target_audience_type === "roles" && (
                  <div>
                    <label className="text-slate-400 text-sm block mb-2">Select Roles</label>
                    <div className="flex flex-wrap gap-2">
                      {USER_ROLES.map(role => (
                        <button
                          key={role}
                          type="button"
                          onClick={() => toggleRole(role)}
                          className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                            formData.target_roles.includes(role)
                              ? "bg-cyan-600 text-white"
                              : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                          }`}
                        >
                          {role.replace(/_/g, ' ')}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {formData.target_audience_type === "working_groups" && (
                  <div>
                    <label className="text-slate-400 text-sm block mb-2">Select Working Groups</label>
                    <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                      {workingGroups.map(wg => (
                        <button
                          key={wg.id}
                          type="button"
                          onClick={() => toggleWorkingGroup(wg.id)}
                          className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                            formData.target_working_group_ids.includes(wg.id)
                              ? "bg-cyan-600 text-white"
                              : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                          }`}
                        >
                          {wg.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {formData.target_audience_type === "organizations" && (
                  <div>
                    <label className="text-slate-400 text-sm block mb-2">Select Organizations</label>
                    <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                      {organizations.map(org => (
                        <button
                          key={org.id}
                          type="button"
                          onClick={() => toggleOrganization(org.id)}
                          className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                            formData.target_organization_ids.includes(org.id)
                              ? "bg-cyan-600 text-white"
                              : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                          }`}
                        >
                          {org.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {formData.target_audience_type === "countries" && (
                  <div>
                    <label className="text-slate-400 text-sm block mb-2">Select Countries</label>
                    <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                      {africanCountries.map(c => (
                        <button
                          key={c.name}
                          type="button"
                          onClick={() => toggleCountry(c.name)}
                          className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                            formData.target_countries.includes(c.name)
                              ? "bg-cyan-600 text-white"
                              : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                          }`}
                        >
                          {c.name}
                        </button>
                      ))}
                    </div>
                    <p className="text-slate-500 text-xs mt-1">Select specific countries or leave empty for all African countries</p>
                  </div>
                )}
              </div>

              {/* Speakers */}
              {formData.speakers.length > 0 && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-slate-400 text-sm font-medium">Speakers</label>
                    <button
                      type="button"
                      onClick={addSpeaker}
                      className="text-cyan-400 hover:text-cyan-300 text-sm flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" /> Add Speaker
                    </button>
                  </div>
                  {formData.speakers.map((speaker, index) => (
                    <div key={index} className="bg-slate-700/30 rounded-lg p-4 space-y-3">
                      <div className="flex justify-between">
                        <span className="text-slate-400 text-sm">Speaker {index + 1}</span>
                        <button
                          type="button"
                          onClick={() => removeSpeaker(index)}
                          className="text-red-400 hover:text-red-300 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                      <input
                        type="text"
                        placeholder="Full Name"
                        value={speaker.name}
                        onChange={(e) => updateSpeaker(index, "name", e.target.value)}
                        className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                      />
                      <input
                        type="text"
                        placeholder="Title / Position"
                        value={speaker.title}
                        onChange={(e) => updateSpeaker(index, "title", e.target.value)}
                        className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                      />
                      <input
                        type="text"
                        placeholder="Organization"
                        value={speaker.organization}
                        onChange={(e) => updateSpeaker(index, "organization", e.target.value)}
                        className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  ))}
                </div>
              )}

              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-yellow-300 text-sm font-medium">Pending Approval</p>
                    <p className="text-yellow-200/70 text-sm mt-1">
                      Your event will be reviewed by an administrator. You will be notified once it's approved.
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 rounded-xl text-white font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calendar className="w-4 h-4" />}
                {submitting ? "Creating..." : "Create Event"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto" onClick={() => setSelectedEvent(null)}>
          <div className="bg-slate-800 rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-700 sticky top-0 bg-slate-800">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      selectedEvent.event_type === "Conference" ? "bg-purple-500/20 text-purple-400" :
                      selectedEvent.event_type === "Webinar" ? "bg-cyan-500/20 text-cyan-400" :
                      selectedEvent.event_type === "Workshop" ? "bg-emerald-500/20 text-emerald-400" :
                      "bg-slate-500/20 text-slate-400"
                    }`}>
                      {selectedEvent.event_type}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      selectedEvent.status === "Upcoming" ? "bg-emerald-500/20 text-emerald-400" :
                      selectedEvent.status === "Ongoing" ? "bg-cyan-500/20 text-cyan-400" :
                      "bg-slate-500/20 text-slate-400"
                    }`}>
                      {selectedEvent.status}
                    </span>
                    {selectedEvent.approval_status === "Pending" && (
                      <span className="px-2 py-1 rounded-full text-xs bg-yellow-500/20 text-yellow-400">
                        Pending Approval
                      </span>
                    )}
                    {selectedEvent.approval_status === "Rejected" && (
                      <span className="px-2 py-1 rounded-full text-xs bg-red-500/20 text-red-400">
                        Rejected
                      </span>
                    )}
                    {selectedEvent.is_virtual && (
                      <span className="px-2 py-1 rounded-full text-xs bg-purple-500/20 text-purple-400">
                        Virtual
                      </span>
                    )}
                  </div>
                  <h2 className="text-2xl font-bold text-white">{selectedEvent.title}</h2>
                </div>
                <button onClick={() => setSelectedEvent(null)} className="text-slate-400 hover:text-white text-2xl">&times;</button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Event Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 text-slate-300">
                  <Calendar className="w-5 h-5 text-cyan-400" />
                  <div>
                    <p className="text-sm font-medium">Date & Time</p>
                    <p className="text-sm">{new Date(selectedEvent.start_date).toLocaleString()}</p>
                    {selectedEvent.end_date && (
                      <p className="text-sm">to {new Date(selectedEvent.end_date).toLocaleString()}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 text-slate-300">
                  {selectedEvent.is_virtual ? (
                    <Video className="w-5 h-5 text-cyan-400" />
                  ) : (
                    <MapPin className="w-5 h-5 text-cyan-400" />
                  )}
                  <div>
                    <p className="text-sm font-medium">Location</p>
                    <p className="text-sm">{selectedEvent.is_virtual ? "Virtual Event" : `${selectedEvent.venue || "TBD"}, ${selectedEvent.location || "TBD"}`}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-slate-300">
                  <Users className="w-5 h-5 text-cyan-400" />
                  <div>
                    <p className="text-sm font-medium">Capacity</p>
                    <p className="text-sm">{selectedEvent.registered_count || 0} / {selectedEvent.capacity || "Unlimited"} registered</p>
                  </div>
                </div>
                {selectedEvent.registration_fee > 0 && (
                  <div className="flex items-center gap-3 text-slate-300">
                    <Ticket className="w-5 h-5 text-cyan-400" />
                    <div>
                      <p className="text-sm font-medium">Registration Fee</p>
                      <p className="text-sm">${selectedEvent.registration_fee}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3 text-slate-300">
                  <User className="w-5 h-5 text-cyan-400" />
                  <div>
                    <p className="text-sm font-medium">Organized By</p>
                    <p className="text-sm">{selectedEvent.created_by_name || "Unknown"}</p>
                    {selectedEvent.created_by_email && (
                      <p className="text-xs text-slate-400">{selectedEvent.created_by_email}</p>
                    )}
                  </div>
                </div>
                {selectedEvent.country && (
                  <div className="flex items-center gap-3 text-slate-300">
                    <Globe className="w-5 h-5 text-cyan-400" />
                    <div>
                      <p className="text-sm font-medium">Country</p>
                      <p className="text-sm">{selectedEvent.country}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="bg-slate-700/30 rounded-lg p-4">
                <h3 className="text-white font-semibold mb-2">About This Event</h3>
                <p className="text-slate-300 whitespace-pre-wrap">{selectedEvent.description}</p>
              </div>

              {/* Speakers */}
              {selectedEvent.speakers && selectedEvent.speakers.length > 0 && (
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <h3 className="text-white font-semibold mb-3">Speakers</h3>
                  <div className="space-y-3">
                    {selectedEvent.speakers.map((speaker, idx) => (
                      <div key={idx} className="border-b border-slate-600 pb-3 last:border-0 last:pb-0">
                        <p className="text-white font-medium">{speaker.name}</p>
                        <p className="text-cyan-400 text-sm">{speaker.title}</p>
                        <p className="text-slate-400 text-sm">{speaker.organization}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {selectedEvent.approval_status === "Approved" && selectedEvent.status === "Upcoming" && (
                <div className="flex flex-wrap gap-3">
                  {!registeredEvents.has(selectedEvent.id) && (
                    <button
                      onClick={() => {
                        handleRegister(selectedEvent.id);
                        setSelectedEvent(null);
                      }}
                      disabled={actionLoading === selectedEvent.id}
                      className="flex-1 py-3 bg-cyan-600 hover:bg-cyan-700 rounded-xl text-white font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {actionLoading === selectedEvent.id ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <UserPlus className="w-5 h-5" />
                      )}
                      {actionLoading === selectedEvent.id ? "Registering..." : "Register for Event"}
                    </button>
                  )}
                  {registeredEvents.has(selectedEvent.id) && (
                    <div className="flex-1 text-center p-3 bg-emerald-500/20 rounded-xl">
                      <CheckCircle className="w-5 h-5 text-emerald-400 inline mr-2" />
                      <span className="text-emerald-400">You are registered for this event</span>
                    </div>
                  )}
                  {selectedEvent.is_virtual && selectedEvent.meeting_link && registeredEvents.has(selectedEvent.id) && (
                    <a
                      href={selectedEvent.meeting_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 rounded-xl text-white text-center font-semibold transition-colors"
                    >
                      <Video className="w-5 h-5 inline mr-2" />
                      Join Event
                    </a>
                  )}
                </div>
              )}

              {/* Share Event Link */}
              <div className="border-t border-slate-700 pt-4">
                <p className="text-slate-400 text-sm mb-2">Share this event:</p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={`${window.location.origin}/events?id=${selectedEvent.id}`}
                    readOnly
                    className="flex-1 bg-slate-700 border border-slate-600 rounded-xl px-4 py-2 text-white text-sm focus:outline-none"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/events?id=${selectedEvent.id}`);
                      alert("Event link copied to clipboard!");
                    }}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-xl text-white text-sm transition-colors"
                  >
                    Copy Link
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}