// app/organizations/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  Building2,
  Users,
  FileText,
  TrendingUp,
  Target,
  XCircle,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Globe,
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
  Award,
  Heart,
  Briefcase,
  BookOpen,
  Handshake,
  Megaphone,
  BarChart3,
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
  Github,
  Mic,
  Database,
  Code,
  GitBranch,
  Upload,
  Download,
  Send,
  Bell,
  BellRing,
  Eye as EyeIcon,
  Camera as CameraIcon,
  Book,
  GraduationCap,
  School,
  University,
  Library,
  Music as MusicIcon,
  Film as FilmIcon,
  Map,
  Compass as CompassIcon,
  Navigation,
  Locate,
  MapPin as MapPinIcon,
  Star as StarIcon,
  Sparkles as SparklesIcon,
  Zap as ZapIcon,
  Clock as ClockIcon2,
  CheckCheck as CheckCheckIcon,
  ExternalLink as ExternalLinkIcon,
  Github as GithubIcon,
  Twitter as TwitterIcon,
  Linkedin as LinkedinIcon,
  Youtube as YoutubeIcon,
  FileVideo as FileVideoIcon,
  Mic as MicIcon,
  MessageSquare as MessageSquareIcon,
  ArrowRight as ArrowRightIcon,
  Gift as GiftIcon,
  Lightbulb as LightbulbIcon,
  PieChart as PieChartIcon,
  Database as DatabaseIcon,
  Code as CodeIcon,
  GitBranch as GitBranchIcon,
  Upload as UploadIcon,
  Download as DownloadIcon,
  Send as SendIcon,
  Bell as BellIcon,
  BellRing as BellRingIcon,
  Rocket as RocketIcon,
  Compass as CompassIcon2,
  Coffee as CoffeeIcon,
  X,
  Loader2,
} from "lucide-react";
import Link from "next/link";

interface Organization {
  id: string;
  name: string;
  type: string;
  country: string;
  region: string;
  description: string;
  registration_number: string;
  website: string;
  contact_person: string;
  contact_email: string;
  contact_phone: string;
  focus_areas: string[];
  status: string;
  created_at: string;
  approved_at?: string;
  created_by: string;
  created_by_user?: {
    full_name: string;
    email: string;
  };
  is_member?: boolean;
}

interface TeamMember {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  role: string;
  joined_at: string;
}

interface Project {
  id: string;
  title: string;
  description: string;
  status: string;
  budget: number;
  start_date: string;
  end_date: string;
  organization_id?: string;
}

interface JoinRequest {
  id: string;
  organization_id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  status: "pending" | "approved" | "rejected";
  message?: string;
  created_at: string;
}

interface Report {
  id: string;
  title: string;
  report_type: string;
  status: string;
  created_at: string;
  file_url?: string;
  description?: string;
  submitted_by?: string;
}

interface Collaboration {
  id: string;
  organization_id: string;
  partner_organization_id: string;
  partner_organization_name: string;
  type: string;
  status: string;
  start_date: string;
  end_date?: string;
  description: string;
  focus_areas: string[];
  contact_person_id?: string;
  contact_person_name?: string;
  created_at: string;
  updated_at: string;
}

interface CollaborationRequest {
  id: string;
  from_organization_id: string;
  to_organization_id: string;
  from_organization_name: string;
  message: string;
  partnership_type: string;
  status: "pending" | "accepted" | "rejected";
  created_at: string;
  focus_areas: string[];
  contact_email: string;
  contact_name: string;
}

interface SharedResource {
  id: string;
  title: string;
  description: string;
  type: string;
  organization_id: string;
  organization_name: string;
  url?: string;
  file_url?: string;
  access_level: string;
  tags: string[];
  created_at: string;
  downloads: number;
  views: number;
}

interface Event {
  id: string;
  title: string;
  description: string;
  event_type: string;
  organization_id: string;
  organization_name: string;
  start_date: string;
  end_date: string;
  location: string;
  venue: string;
  meeting_link?: string;
  capacity: number;
  registered_count: number;
  status: string;
  focus_areas: string[];
  created_at: string;
  is_virtual: boolean;
}

interface ProjectCollaboration {
  id: string;
  title: string;
  description: string;
  organization_id: string;
  organization_name: string;
  partner_organizations: string[];
  partner_names: string[];
  status: string;
  start_date: string;
  end_date?: string;
  budget: number;
  funding_source?: string;
  impact_metrics: string[];
  created_at: string;
  lead_contact: string;
}

const organizationTypes = [
  "Non-Governmental Organization (NGO)",
  "Community-Based Organization (CBO)",
  "Faith-Based Organization (FBO)",
  "Government Ministry",
  "Research Institution",
  "Academic Institution",
  "Hospital / Health Facility",
  "Development Partner",
  "Private Sector",
  "Professional Association",
  "Network/Coalition",
];

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

const resourceTypes = [
  "dataset",
  "report",
  "toolkit",
  "training",
  "policy",
  "research"
];

const eventTypes = [
  "Conference",
  "Webinar",
  "Workshop",
  "Training",
  "Summit",
  "Networking"
];

export default function OrganizationsDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "team" | "projects" | "reports" | "settings" | "collaborations" | "resources" | "events" | "partnerships">("overview");
  
  // Collaboration State
  const [collaborations, setCollaborations] = useState<Collaboration[]>([]);
  const [collaborationRequests, setCollaborationRequests] = useState<CollaborationRequest[]>([]);
  const [sharedResources, setSharedResources] = useState<SharedResource[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [projectCollaborations, setProjectCollaborations] = useState<ProjectCollaboration[]>([]);
  
  // UI State
  const [showAddMember, setShowAddMember] = useState(false);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberRole, setNewMemberRole] = useState("Member");
  const [inviting, setInviting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"list" | "detail">("list");
  const [showCollaborationModal, setShowCollaborationModal] = useState(false);
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState("");
  const [collaborationMessage, setCollaborationMessage] = useState("");
  const [partnershipType, setPartnershipType] = useState("partnership");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Project Form State - FIXED: Use organization_activities table
  const [projectForm, setProjectForm] = useState({
    title: "",
    description: "",
    status: "Planning",
    budget: 0,
    start_date: "",
    end_date: "",
  });

  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showRequestJoinModal, setShowRequestJoinModal] = useState(false);
  const [selectedOrgToJoin, setSelectedOrgToJoin] = useState<Organization | null>(null);
  const [joinMessage, setJoinMessage] = useState("");
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportForm, setReportForm] = useState({
    title: "",
    description: "",
    type: "",
    file_url: "",
  });

  // Collaboration search state
  const [collaborationSearchTerm, setCollaborationSearchTerm] = useState("");
  const [filteredPartnerOrgs, setFilteredPartnerOrgs] = useState<Organization[]>([]);

  // Resource Form State
  const [resourceForm, setResourceForm] = useState({
    title: "",
    description: "",
    type: "report",
    url: "",
    access_level: "public",
    tags: "",
  });

  // Event Form State - FIXED: Use correct field names
  const [eventForm, setEventForm] = useState({
    title: "",
    description: "",
    event_type: "Webinar",
    start_date: "",
    end_date: "",
    location: "",
    venue: "",
    meeting_link: "",
    capacity: 100,
    is_virtual: false,
    focus_areas: [] as string[],
  });

  useEffect(() => {
    checkAuth();
  }, []);

  // Filter partner organizations for collaboration
  useEffect(() => {
    if (selectedOrg) {
      const filtered = organizations.filter(org => 
        org.id !== selectedOrg.id && 
        (org.name.toLowerCase().includes(collaborationSearchTerm.toLowerCase()) ||
         org.country?.toLowerCase().includes(collaborationSearchTerm.toLowerCase()))
      );
      setFilteredPartnerOrgs(filtered);
    }
  }, [collaborationSearchTerm, organizations, selectedOrg]);

  const checkAuth = async () => {
    setIsLoading(true);
    try {
      const userStr = localStorage.getItem("user");
      
      if (userStr) {
        try {
          const userData = JSON.parse(userStr);
          console.log("✅ User found in localStorage:", userData);
          setUser(userData);
          setIsLoading(false);
          await fetchOrganizations(userData);
          return;
        } catch (e) {
          localStorage.removeItem("user");
        }
      }

      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        router.push("/login");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("*")
        .eq("auth_user_id", session.user.id)
        .single();

      if (profileError || !profile) {
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
      console.warn("No user data provided to fetchOrganizations");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const isCoordinator = [
        "Coordinator",
        "mental_health_coordinator",
        "researcher_coordinator",
        "cso_coordinator"
      ].includes(userData.role);

      let orgsData: any[] = [];
      let memberOrgIds = new Set<string>();

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
          console.warn("Coordinator has no assigned country");
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

        if (memberError) {
          console.error("Error fetching memberships:", memberError);
          throw memberError;
        }

        const orgIds = memberOrgs?.map(m => m.organization_id) || [];
        memberOrgIds = new Set(orgIds);

        if (orgIds.length > 0) {
          const { data, error } = await supabase
            .from("organizations")
            .select("*")
            .eq("status", "Approved")
            .in("id", orgIds)
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

      const orgsWithCreators = await Promise.all(
        orgsData.map(async (org) => {
          let creatorName = "Unknown";
          let creatorEmail = "";

          if (org.created_by) {
            try {
              const { data: userInfo, error: userError } = await supabase
                .from("users")
                .select("full_name, email")
                .eq("id", org.created_by)
                .single();

              if (!userError && userInfo) {
                creatorName = userInfo.full_name || "Unknown";
                creatorEmail = userInfo.email || "";
              }
            } catch (e) {
              console.error(`Error fetching creator for org ${org.id}:`, e);
            }
          }

          return {
            ...org,
            created_by_user: {
              full_name: creatorName,
              email: creatorEmail
            },
            is_member: memberOrgIds.has(org.id) || org.created_by === userData.id
          };
        })
      );

      setOrganizations(orgsWithCreators);

      if (orgsWithCreators.length === 1) {
        setSelectedOrg(orgsWithCreators[0]);
        setViewMode("detail");
        await fetchOrganizationDetails(orgsWithCreators[0].id);
      } else if (orgsWithCreators.length > 0 && isCoordinator) {
        setViewMode("list");
      }

    } catch (error) {
      console.error("Error fetching organizations:", error);
      setError("Failed to load organizations");
      setOrganizations([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrganizationDetails = async (orgId: string) => {
    if (!orgId) return;

    try {
      await Promise.all([
        fetchTeamMembers(orgId),
        fetchProjects(orgId),
        fetchCollaborations(orgId),
        fetchCollaborationRequests(orgId),
        fetchSharedResources(orgId),
        fetchEvents(orgId),
        fetchProjectCollaborations(orgId),
        fetchJoinRequests(orgId),
        fetchReports(orgId),
      ]);

    } catch (error) {
      console.error("Error fetching organization details:", error);
      setError("Failed to load organization details");
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
            .select("id, full_name, email")
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
        })));
      } else {
        setTeamMembers([]);
      }
    } catch (error) {
      console.error("Error fetching team members:", error);
      setTeamMembers([]);
    }
  };

  // FIXED: Use organization_activities table instead of organization_projects
  const fetchProjects = async (orgId: string) => {
    try {
      const { data, error } = await supabase
        .from("organization_activities")
        .select("*")
        .eq("organization_id", orgId)
        .order("created_at", { ascending: false });

      if (!error && data) {
        // Map the data to match the Project interface
        const mappedProjects = data.map((activity: any) => ({
          id: activity.id,
          title: activity.action || "Untitled Activity",
          description: activity.details?.description || "",
          status: activity.details?.status || "Planning",
          budget: activity.details?.budget || 0,
          start_date: activity.details?.start_date || activity.created_at,
          end_date: activity.details?.end_date || "",
          organization_id: activity.organization_id,
        }));
        setProjects(mappedProjects);
      } else {
        setProjects([]);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
      setProjects([]);
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

  const fetchSharedResources = async (orgId: string) => {
    try {
      const { data, error } = await supabase
        .from("shared_resources")
        .select("*")
        .eq("organization_id", orgId);

      if (error) {
        console.warn("Shared resources table not found:", error);
        setSharedResources([]);
        return;
      }
      setSharedResources(data || []);
    } catch (error) {
      console.error("Error fetching shared resources:", error);
      setSharedResources([]);
    }
  };

  // FIXED: Use correct column names from events table
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
      
      // Map the data to match the Event interface
      const mappedEvents = (data || []).map((event: any) => ({
        id: event.id,
        title: event.title,
        description: event.description,
        event_type: event.event_type,
        organization_id: event.organization_id,
        organization_name: event.organization_name,
        start_date: event.start_date,
        end_date: event.end_date,
        location: event.location || event.venue,
        venue: event.venue,
        meeting_link: event.meeting_link,
        capacity: event.capacity,
        registered_count: event.registered_count || 0,
        status: event.status,
        focus_areas: event.focus_areas || [],
        created_at: event.created_at,
        is_virtual: event.is_virtual || false,
      }));
      setEvents(mappedEvents);
    } catch (error) {
      console.error("Error fetching events:", error);
      setEvents([]);
    }
  };

  const fetchProjectCollaborations = async (orgId: string) => {
    try {
      const { data, error } = await supabase
        .from("project_collaborations")
        .select("*")
        .or(`organization_id.eq.${orgId},partner_organizations.cs.{${orgId}}`);

      if (error) {
        console.warn("Project collaborations table not found:", error);
        setProjectCollaborations([]);
        return;
      }
      setProjectCollaborations(data || []);
    } catch (error) {
      console.error("Error fetching project collaborations:", error);
      setProjectCollaborations([]);
    }
  };

  const fetchJoinRequests = async (orgId: string) => {
    try {
      const { data, error } = await supabase
        .from("organization_join_requests")
        .select("*")
        .eq("organization_id", orgId)
        .eq("status", "pending")
        .order("created_at", { ascending: false });
  
      if (error) {
        console.warn("Join requests table not found:", error);
        setJoinRequests([]);
        return;
      }
      setJoinRequests(data || []);
    } catch (error) {
      console.error("Error fetching join requests:", error);
      setJoinRequests([]);
    }
  };
  
  // Fetch reports
  const fetchReports = async (orgId: string) => {
    try {
      const { data, error } = await supabase
        .from("reports")
        .select("*")
        .eq("country", selectedOrg?.country || "")
        .order("created_at", { ascending: false });

      if (error) {
        console.warn("Reports table not found:", error);
        setReports([]);
        return;
      }
      setReports(data || []);
    } catch (error) {
      console.error("Error fetching reports:", error);
      setReports([]);
    }
  };
  
  // ============ REQUEST TO JOIN ORGANIZATION ============
  
  const handleRequestToJoin = async () => {
    if (!user) {
      alert("Please login to request to join an organization");
      return;
    }
  
    if (!selectedOrgToJoin) {
      alert("No organization selected");
      return;
    }
  
    setSubmitting(true);
    try {
      // Check if already a member
      const { data: existingMember, error: checkError } = await supabase
        .from("organization_members")
        .select("id")
        .eq("organization_id", selectedOrgToJoin.id)
        .eq("user_id", user.id)
        .maybeSingle();
  
      if (checkError) {
        console.error("Error checking membership:", checkError);
      }
  
      if (existingMember) {
        alert("You are already a member of this organization!");
        setSubmitting(false);
        return;
      }
  
      // Check if already requested
      const { data: existingRequest, error: requestError } = await supabase
        .from("organization_join_requests")
        .select("id")
        .eq("organization_id", selectedOrgToJoin.id)
        .eq("user_id", user.id)
        .eq("status", "pending")
        .maybeSingle();
  
      if (requestError) {
        console.error("Error checking request:", requestError);
      }
  
      if (existingRequest) {
        alert("You have already requested to join this organization. Please wait for approval.");
        setSubmitting(false);
        return;
      }
  
      const { error } = await supabase
        .from("organization_join_requests")
        .insert({
          organization_id: selectedOrgToJoin.id,
          user_id: user.id,
          user_name: user.full_name || user.email,
          user_email: user.email,
          message: joinMessage || null,
          status: "pending",
          created_at: new Date().toISOString(),
        });
  
      if (error) throw error;
  
      setSuccessMessage(`Join request sent to ${selectedOrgToJoin.name}!`);
      setShowRequestJoinModal(false);
      setSelectedOrgToJoin(null);
      setJoinMessage("");
      
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error("Error requesting to join:", error);
      alert("Failed to send join request");
    } finally {
      setSubmitting(false);
    }
  };
  
  // ============ HANDLE JOIN REQUEST RESPONSE ============
  
  const handleJoinRequestResponse = async (requestId: string, accept: boolean) => {
    try {
      // Get the request details first
      const { data: request, error: fetchError } = await supabase
        .from("organization_join_requests")
        .select("*")
        .eq("id", requestId)
        .single();
  
      if (fetchError) throw fetchError;
  
      if (accept) {
        // Add user to organization members
        const { error: memberError } = await supabase
          .from("organization_members")
          .insert({
            organization_id: request.organization_id,
            user_id: request.user_id,
            role: "Member",
            joined_at: new Date().toISOString(),
          });
  
        if (memberError) throw memberError;
      }
  
      // Update the join request status
      const { error: updateError } = await supabase
        .from("organization_join_requests")
        .update({
          status: accept ? "approved" : "rejected",
          updated_at: new Date().toISOString(),
        })
        .eq("id", requestId);
  
      if (updateError) throw updateError;
  
      setSuccessMessage(accept ? "User added to organization successfully!" : "Join request declined.");
      await fetchJoinRequests(selectedOrg?.id || "");
      await fetchTeamMembers(selectedOrg?.id || "");
      
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error("Error processing join request:", error);
      alert("Failed to process join request");
    }
  };
  
  // ============ CREATE REPORT ============
  
  const handleCreateReport = async () => {
    if (!reportForm.title) {
      alert("Please enter a report title");
      return;
    }
  
    if (!selectedOrg) {
      alert("No organization selected");
      return;
    }
  
    setSubmitting(true);
    try {
      const { data, error } = await supabase
        .from("reports")
        .insert({
          title: reportForm.title,
          description: reportForm.description,
          report_type: reportForm.type || "General Report",
          country: selectedOrg.country,
          file_url: reportForm.file_url || null,
          submitted_by: user.id,
          status: "Pending",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select();

      if (error) throw error;
  
      setSuccessMessage("✅ Report submitted successfully!");
      setShowReportModal(false);
      setReportForm({
        title: "",
        description: "",
        type: "",
        file_url: "",
      });
      
      // Refresh reports list
      await fetchReports(selectedOrg.id);
      
      // Also refresh organization details
      await fetchOrganizationDetails(selectedOrg.id);
      
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (error) {
      console.error("Error creating report:", error);
      alert("Failed to create report: " + (error as any).message);
    } finally {
      setSubmitting(false);
    }
  };
  
  // ============ SEARCH ORGANIZATIONS TO JOIN ============
  
  const searchOrganizationsToJoin = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      return;
    }
  
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("organizations")
        .select("*")
        .eq("status", "Approved")
        .ilike("name", `%${searchTerm}%`)
        .limit(10);
  
      if (error) throw error;
      
      if (data && data.length > 0) {
        // Show results and let user select one
        const org = data[0]; // For simplicity, auto-select first match
        setSelectedOrgToJoin(org);
        setShowRequestJoinModal(true);
      } else {
        alert("No organizations found matching your search. Try a different search term.");
      }
    } catch (error) {
      console.error("Error searching organizations:", error);
      alert("Failed to search organizations");
    } finally {
      setLoading(false);
    }
  };

  // ============ HANDLERS ============

  const handleSelectOrganization = async (org: Organization) => {
    setSelectedOrg(org);
    setViewMode("detail");
    await fetchOrganizationDetails(org.id);
  };

  // ============ ADD MEMBER ============

  const handleInviteMember = async () => {
    if (!newMemberEmail) {
      alert("Please enter an email address");
      return;
    }

    if (!selectedOrg) {
      alert("No organization selected");
      return;
    }

    setInviting(true);
    try {
      const { data: existingUser, error: userError } = await supabase
        .from("users")
        .select("id, full_name, email")
        .eq("email", newMemberEmail)
        .maybeSingle();

      if (userError) {
        console.error("Error checking user:", userError);
        alert("Error checking user. Please try again.");
        setInviting(false);
        return;
      }

      if (!existingUser) {
        alert("User not found. Please ask them to register first.");
        setInviting(false);
        return;
      }

      // Check if already a member
      const { data: existingMember, error: checkError } = await supabase
        .from("organization_members")
        .select("id")
        .eq("organization_id", selectedOrg.id)
        .eq("user_id", existingUser.id)
        .maybeSingle();

      if (checkError) {
        console.error("Error checking membership:", checkError);
      }

      if (existingMember) {
        alert(`${existingUser.full_name} is already a member of this organization.`);
        setInviting(false);
        return;
      }

      const { error: insertError } = await supabase
        .from("organization_members")
        .insert({
          organization_id: selectedOrg.id,
          user_id: existingUser.id,
          role: newMemberRole,
          joined_at: new Date().toISOString(),
        });

      if (insertError) {
        console.error("Error adding member:", insertError);
        alert(`Failed to add member: ${insertError.message}`);
        setInviting(false);
        return;
      }

      setSuccessMessage(`Successfully added ${existingUser.full_name} to the team!`);
      setShowAddMember(false);
      setNewMemberEmail("");
      setNewMemberRole("Member");
      await fetchTeamMembers(selectedOrg.id);
      
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error("Error inviting member:", error);
      alert("Failed to invite member");
    } finally {
      setInviting(false);
    }
  };

  // ============ CREATE PROJECT - FIXED: Use organization_activities ============

  const handleCreateProject = async () => {
    if (!projectForm.title) {
      alert("Please enter a project title");
      return;
    }

    if (!selectedOrg) {
      alert("No organization selected");
      return;
    }

    setSubmitting(true);
    try {
      const { data, error } = await supabase
        .from("organization_activities")
        .insert({
          organization_id: selectedOrg.id,
          user_id: user?.id,
          action: projectForm.title,
          details: {
            description: projectForm.description,
            status: projectForm.status,
            budget: projectForm.budget,
            start_date: projectForm.start_date || null,
            end_date: projectForm.end_date || null,
          },
          created_at: new Date().toISOString(),
        })
        .select();

      if (error) {
        console.error("Error creating project:", error);
        alert(`Failed to create project: ${error.message}`);
        setSubmitting(false);
        return;
      }

      setSuccessMessage("✅ Project created successfully!");
      setShowCreateProject(false);
      setProjectForm({
        title: "",
        description: "",
        status: "Planning",
        budget: 0,
        start_date: "",
        end_date: "",
      });
      await fetchProjects(selectedOrg.id);
      
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error("Error creating project:", error);
      alert("Failed to create project");
    } finally {
      setSubmitting(false);
    }
  };

  // ============ SHARE RESOURCE ============

  const handleShareResource = async () => {
    if (!resourceForm.title) {
      alert("Please enter a resource title");
      return;
    }

    if (!selectedOrg) {
      alert("No organization selected");
      return;
    }

    setSubmitting(true);
    try {
      const { data, error } = await supabase
        .from("shared_resources")
        .insert({
          title: resourceForm.title,
          description: resourceForm.description,
          type: resourceForm.type,
          organization_id: selectedOrg.id,
          organization_name: selectedOrg.name,
          url: resourceForm.url || null,
          access_level: resourceForm.access_level,
          tags: resourceForm.tags ? resourceForm.tags.split(',').map(t => t.trim()) : [],
          views: 0,
          downloads: 0,
          created_at: new Date().toISOString(),
        })
        .select();

      if (error) {
        console.error("Error sharing resource:", error);
        alert(`Failed to share resource: ${error.message}`);
        setSubmitting(false);
        return;
      }

      setSuccessMessage("✅ Resource shared successfully!");
      setShowResourceModal(false);
      setResourceForm({
        title: "",
        description: "",
        type: "report",
        url: "",
        access_level: "public",
        tags: "",
      });
      await fetchSharedResources(selectedOrg.id);
      
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error("Error sharing resource:", error);
      alert("Failed to share resource");
    } finally {
      setSubmitting(false);
    }
  };

  // ============ CREATE EVENT - FIXED: Use correct column names ============

  const handleCreateEvent = async () => {
    if (!eventForm.title || !eventForm.start_date || !eventForm.end_date) {
      alert("Please fill in all required fields (Title, Start Date, End Date)");
      return;
    }

    if (!selectedOrg) {
      alert("No organization selected");
      return;
    }

    setSubmitting(true);
    try {
      const { data, error } = await supabase
        .from("events")
        .insert({
          title: eventForm.title,
          description: eventForm.description,
          event_type: eventForm.event_type,
          organization_id: selectedOrg.id,
          organization_name: selectedOrg.name,
          start_date: new Date(eventForm.start_date).toISOString(),
          end_date: new Date(eventForm.end_date).toISOString(),
          location: eventForm.location || null,
          venue: eventForm.venue || null,
          meeting_link: eventForm.meeting_link || null,
          capacity: eventForm.capacity || 100,
          registered_count: 0,
          is_virtual: eventForm.is_virtual || false,
          status: new Date(eventForm.start_date) > new Date() ? "Upcoming" : "Ongoing",
          focus_areas: eventForm.focus_areas || [],
          created_at: new Date().toISOString(),
          approval_status: "Pending",
        })
        .select();

      if (error) {
        console.error("Error creating event:", error);
        alert(`Failed to create event: ${error.message}`);
        setSubmitting(false);
        return;
      }

      setSuccessMessage("✅ Event created successfully!");
      setShowEventModal(false);
      setEventForm({
        title: "",
        description: "",
        event_type: "Webinar",
        start_date: "",
        end_date: "",
        location: "",
        venue: "",
        meeting_link: "",
        capacity: 100,
        is_virtual: false,
        focus_areas: [],
      });
      await fetchEvents(selectedOrg.id);
      
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error("Error creating event:", error);
      alert("Failed to create event");
    } finally {
      setSubmitting(false);
    }
  };

  // ============ SEND COLLABORATION REQUEST ============

  const handleSendCollaborationRequest = async () => {
    if (!selectedPartner || !collaborationMessage) {
      alert("Please select a partner organization and enter a message");
      return;
    }

    if (!selectedOrg) {
      alert("No organization selected");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from("collaboration_requests")
        .insert({
          from_organization_id: selectedOrg.id,
          to_organization_id: selectedPartner,
          message: collaborationMessage,
          partnership_type: partnershipType,
          status: "pending",
          focus_areas: selectedOrg.focus_areas || [],
          contact_email: user?.email,
          contact_name: user?.full_name,
          created_at: new Date().toISOString(),
        });

      if (error) {
        console.error("Error sending collaboration request:", error);
        alert(`Failed to send request: ${error.message}`);
        setSubmitting(false);
        return;
      }

      setSuccessMessage("✅ Collaboration request sent successfully!");
      setShowCollaborationModal(false);
      setCollaborationMessage("");
      setSelectedPartner("");
      setCollaborationSearchTerm("");
      await fetchCollaborationRequests(selectedOrg.id);
      
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error("Error sending collaboration request:", error);
      alert("Failed to send collaboration request");
    } finally {
      setSubmitting(false);
    }
  };

  // ============ RESPOND TO COLLABORATION REQUEST ============

  const handleRespondToRequest = async (requestId: string, accept: boolean) => {
    try {
      const { error } = await supabase
        .from("collaboration_requests")
        .update({ 
          status: accept ? "accepted" : "rejected",
          updated_at: new Date().toISOString()
        })
        .eq("id", requestId);

      if (error) throw error;

      if (accept) {
        const request = collaborationRequests.find(r => r.id === requestId);
        if (request && selectedOrg) {
          const { error: collabError } = await supabase
            .from("collaborations")
            .insert({
              organization_id: selectedOrg.id,
              partner_organization_id: request.from_organization_id,
              partner_organization_name: request.from_organization_name,
              type: request.partnership_type,
              status: "active",
              start_date: new Date().toISOString(),
              description: request.message,
              focus_areas: request.focus_areas,
              contact_person_id: user?.id,
              contact_person_name: user?.full_name,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });

          if (collabError) throw collabError;
        }
      }

      await fetchCollaborationRequests(selectedOrg?.id || "");
      await fetchCollaborations(selectedOrg?.id || "");
      
      setSuccessMessage(accept ? "✅ Collaboration request accepted!" : "Collaboration request declined.");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error("Error responding to request:", error);
      alert("Failed to process request");
    }
  };

  // ============ REGISTER FOR EVENT - FIXED: Use registered_count ============

  const handleRegisterForEvent = async (eventId: string) => {
    if (!user) {
      alert("Please login to register for events");
      return;
    }

    try {
      // Check if already registered
      const { data: existing, error: checkError } = await supabase
        .from("event_registrations")
        .select("id")
        .eq("event_id", eventId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (checkError) {
        console.error("Error checking registration:", checkError);
      }

      if (existing) {
        alert("You are already registered for this event!");
        return;
      }

      const { error } = await supabase
        .from("event_registrations")
        .insert({
          event_id: eventId,
          user_id: user.id,
          organization_id: selectedOrg?.id,
          registered_at: new Date().toISOString(),
          registration_status: "Registered",
          payment_status: "Pending",
        });

      if (error) throw error;
      
      // Update registered count - FIXED: Use registered_count
      const event = events.find(e => e.id === eventId);
      if (event) {
        const { error: updateError } = await supabase
          .from("events")
          .update({ registered_count: (event.registered_count || 0) + 1 })
          .eq("id", eventId);

        if (updateError) throw updateError;
      }

      setSuccessMessage("✅ Successfully registered for the event!");
      await fetchEvents(selectedOrg?.id || "");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error("Error registering for event:", error);
      alert("Failed to register for event");
    }
  };

  // ============ HELPERS ============

  const getOrganizationTypeIcon = (type: string) => {
    if (type?.includes("NGO")) return <Heart className="w-5 h-5" />;
    if (type?.includes("Community")) return <Users className="w-5 h-5" />;
    if (type?.includes("Faith")) return <Heart className="w-5 h-5" />;
    if (type?.includes("Government")) return <Building2 className="w-5 h-5" />;
    if (type?.includes("Research")) return <BookOpen className="w-5 h-5" />;
    if (type?.includes("Academic")) return <BookOpen className="w-5 h-5" />;
    if (type?.includes("Hospital")) return <Building2 className="w-5 h-5" />;
    if (type?.includes("Development")) return <Handshake className="w-5 h-5" />;
    if (type?.includes("Private")) return <Briefcase className="w-5 h-5" />;
    if (type?.includes("Professional")) return <Users className="w-5 h-5" />;
    return <Building2 className="w-5 h-5" />;
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
      case "published":
      case "upcoming":
        return "bg-emerald-500/20 text-emerald-400";
      case "planning":
      case "draft":
      case "ongoing":
        return "bg-yellow-500/20 text-yellow-400";
      case "completed":
        return "bg-blue-500/20 text-blue-400";
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
    return selectedOrg.created_by === user.id || selectedOrg.is_member;
  };

  const getPartnerOptions = () => {
    return filteredPartnerOrgs.map(org => ({
      value: org.id,
      label: `${org.name} (${org.country || 'N/A'})`
    }));
  };

  const filteredOrganizations = organizations.filter(org => {
    const matchesSearch = org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          org.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || org.type === typeFilter;
    return matchesSearch && matchesType;
  });

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-300">Loading organization data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
      {/* Success Toast */}
      {successMessage && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-500/20 border border-emerald-500/30 rounded-xl px-6 py-4 text-emerald-300 max-w-md shadow-lg backdrop-blur-sm animate-slide-in">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <span>{successMessage}</span>
            <button onClick={() => setSuccessMessage(null)} className="ml-4 text-emerald-400 hover:text-emerald-300">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-cyan-950 to-slate-900 border-b border-cyan-500/20">
        <div className="relative px-6 md:px-8 py-6 md:py-8">
          <div className="flex justify-between items-start flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="px-3 py-1 bg-cyan-500/20 rounded-full border border-cyan-500/30">
                  <span className="text-cyan-300 text-xs font-mono tracking-wider">
                    ORGANIZATIONS PORTAL
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Building2 className="w-4 h-4 text-green-400 animate-pulse" />
                  <span className="text-slate-400 text-xs">
                    {organizations.length} Organizations
                  </span>
                </div>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                {selectedOrg ? selectedOrg.name : "Organizations & Partners"}
              </h1>
              <p className="text-slate-300 text-sm md:text-base mt-2">
                {selectedOrg 
                  ? `Manage ${selectedOrg.name} - ${selectedOrg.type}` 
                  : "Browse and collaborate with organizations across the continent"}
              </p>
            </div>

            <div className="flex gap-2">
              {!selectedOrg && (
                <button
                  onClick={() => router.push("/signup/organizations")}
                  className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-xl text-white transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span className="text-sm hidden sm:inline">Register Organization</span>
                </button>
              )}
              <button
                onClick={() => window.location.reload()}
                className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-600 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="text-sm hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 md:px-8 py-6">
        {/* Stats Cards - Only show in list view */}
        {viewMode === "list" && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="w-4 h-4 text-cyan-400" />
                <p className="text-slate-400 text-xs">Total Organizations</p>
              </div>
              <p className="text-2xl font-bold text-white">{organizations.length}</p>
            </div>
            <div className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-emerald-400" />
                <p className="text-emerald-400 text-xs">Active Members</p>
              </div>
              <p className="text-2xl font-bold text-emerald-400">{
                organizations.reduce((acc, org) => acc + (org.is_member ? 1 : 0), 0)
              }</p>
            </div>
            <div className="bg-purple-500/10 rounded-xl p-4 border border-purple-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Handshake className="w-4 h-4 text-purple-400" />
                <p className="text-purple-400 text-xs">Collaborations</p>
              </div>
              <p className="text-2xl font-bold text-purple-400">{collaborations.length}</p>
            </div>
            <div className="bg-amber-500/10 rounded-xl p-4 border border-amber-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-amber-400" />
                <p className="text-amber-400 text-xs">Events</p>
              </div>
              <p className="text-2xl font-bold text-amber-400">{events.length}</p>
            </div>
          </div>
        )}

        {/* Tab Navigation - Only show when organization is selected or in list view */}
        <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-700 pb-4">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === "overview" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Building2 className="w-4 h-4" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab("team")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === "team" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Users className="w-4 h-4" />
            Team
          </button>
          <button
            onClick={() => setActiveTab("projects")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === "projects" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Target className="w-4 h-4" />
            Projects
          </button>
          <button
            onClick={() => setActiveTab("collaborations")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === "collaborations" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Handshake className="w-4 h-4" />
            Collaborations
            {collaborationRequests.length > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                {collaborationRequests.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("resources")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === "resources" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Database className="w-4 h-4" />
            Resources
          </button>
          <button
            onClick={() => setActiveTab("events")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === "events" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Calendar className="w-4 h-4" />
            Events
          </button>
          <button
            onClick={() => setActiveTab("reports")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === "reports" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <FileText className="w-4 h-4" />
            Reports
          </button>
          {canEdit() && (
            <button
              onClick={() => setActiveTab("settings")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                activeTab === "settings" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <Settings className="w-4 h-4" />
              Settings
            </button>
          )}
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div>
              {viewMode === "list" ? (
                /* Organization List View */
                <div>
                  {/* Search and Filter Bar */}
                  <div className="flex flex-wrap gap-4 mb-6">
                    <div className="flex-1 min-w-[200px] relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search organizations..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-700 border border-slate-600 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <select
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                      className="bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500"
                    >
                      <option value="all">All Types</option>
                      {organizationTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  {/* Search for Organization to Join */}
                  <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6 mb-6">
                    <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                      <Users className="w-5 h-5 text-cyan-400" />
                      Find an Organization to Join
                    </h3>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Search for organizations by name..."
                        className="flex-1 bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            searchOrganizationsToJoin((e.target as HTMLInputElement).value);
                          }
                        }}
                        id="orgSearchInput"
                      />
                      <button
                        onClick={() => {
                          const input = document.getElementById("orgSearchInput") as HTMLInputElement;
                          if (input) searchOrganizationsToJoin(input.value);
                        }}
                        className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 rounded-xl text-white transition-colors flex items-center gap-2"
                      >
                        <Search className="w-4 h-4" />
                        Search
                      </button>
                    </div>
                    <p className="text-slate-400 text-sm mt-2">
                      Search for an organization by name to request membership.
                    </p>
                  </div>

                  {/* Organization Cards */}
                  {filteredOrganizations.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredOrganizations.map((org) => (
                        <div
                          key={org.id}
                          onClick={() => handleSelectOrganization(org)}
                          className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6 hover:border-cyan-500/30 cursor-pointer transition-all group"
                        >
                          <div className="flex items-start gap-3 mb-3">
                            <div className={`p-2 rounded-xl ${org.type?.includes("NGO") ? "bg-emerald-500/20" : "bg-cyan-500/20"}`}>
                              {getOrganizationTypeIcon(org.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-white font-semibold truncate">{org.name}</h3>
                              <p className="text-slate-400 text-sm truncate">{org.type}</p>
                            </div>
                          </div>
                          <p className="text-slate-400 text-sm line-clamp-2 mb-3">{org.description || "No description provided"}</p>
                          <div className="flex items-center gap-4 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <Globe className="w-3 h-3" />
                              {org.country || "N/A"}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {org.is_member ? "Member" : "Pending"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    /* Empty State - No Organizations */
                    <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-20 h-20 bg-cyan-500/20 rounded-full flex items-center justify-center mb-4">
                          <Building2 className="w-10 h-10 text-cyan-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">No Organizations Found</h3>
                        <p className="text-slate-400 max-w-md mb-6">
                          {searchTerm || typeFilter !== "all" 
                            ? "No organizations match your search criteria. Try adjusting your filters." 
                            : "You haven't registered or been added to any organizations yet."}
                        </p>
                        <div className="flex flex-wrap gap-3 justify-center">
                          <button
                            onClick={() => router.push("/signup/organizations")}
                            className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-700 rounded-xl text-white transition-colors flex items-center gap-2"
                          >
                            <Plus className="w-4 h-4" />
                            Register New Organization
                          </button>
                          {(searchTerm || typeFilter !== "all") && (
                            <button
                              onClick={() => {
                                setSearchTerm("");
                                setTypeFilter("all");
                              }}
                              className="px-6 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-xl text-white transition-colors"
                            >
                              Clear Filters
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Organization Detail View */
                selectedOrg && (
                  <div>
                    {/* Back Button */}
                    <button
                      onClick={() => {
                        setViewMode("list");
                        setSelectedOrg(null);
                      }}
                      className="mb-4 text-slate-400 hover:text-cyan-400 flex items-center gap-2 transition-colors"
                    >
                      <ArrowRightIcon className="w-4 h-4 rotate-180" />
                      Back to Organizations
                    </button>

                    {/* Organization Header */}
                    <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6 mb-6">
                      <div className="flex flex-wrap justify-between items-start gap-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h2 className="text-2xl font-bold text-white">{selectedOrg.name}</h2>
                            <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadge(selectedOrg.status)}`}>
                              {selectedOrg.status}
                            </span>
                          </div>
                          <p className="text-slate-400">{selectedOrg.type}</p>
                          <p className="text-slate-400 text-sm mt-2 max-w-2xl">{selectedOrg.description}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {canEdit() && (
                            <button
                              onClick={() => router.push(`/organizations/${selectedOrg.id}/edit`)}
                              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-xl text-white transition-colors flex items-center gap-2"
                            >
                              <Edit className="w-4 h-4" />
                              Edit Organization
                            </button>
                          )}
                          {!selectedOrg.is_member && user && (
                            <button
                              onClick={() => {
                                setSelectedOrgToJoin(selectedOrg);
                                setShowRequestJoinModal(true);
                              }}
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-xl text-white transition-colors flex items-center gap-2"
                            >
                              <UserPlus className="w-4 h-4" />
                              Request to Join
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Join Requests Section */}
                    {canEdit() && joinRequests.length > 0 && (
                      <div className="bg-yellow-500/10 rounded-2xl border border-yellow-500/20 p-6 mb-6">
                        <div className="flex items-center gap-2 mb-4">
                          <BellRing className="w-5 h-5 text-yellow-400" />
                          <h3 className="text-white font-semibold text-lg">Pending Join Requests ({joinRequests.length})</h3>
                        </div>
                        <div className="space-y-3">
                          {joinRequests.map((request) => (
                            <div key={request.id} className="bg-slate-700/30 rounded-xl p-4 flex flex-wrap justify-between items-center gap-4">
                              <div>
                                <p className="text-white font-medium">{request.user_name}</p>
                                <p className="text-slate-400 text-sm">{request.user_email}</p>
                                {request.message && (
                                  <p className="text-slate-400 text-xs mt-1">"{request.message}"</p>
                                )}
                                <p className="text-slate-500 text-xs mt-1">
                                  Requested: {new Date(request.created_at).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleJoinRequestResponse(request.id, true)}
                                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-white text-sm transition-colors flex items-center gap-1"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                  Accept
                                </button>
                                <button
                                  onClick={() => handleJoinRequestResponse(request.id, false)}
                                  className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white text-sm transition-colors flex items-center gap-1"
                                >
                                  <XCircle className="w-4 h-4" />
                                  Decline
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              )}
            </div>
          )}

          {/* Team Tab */}
          {activeTab === "team" && selectedOrg && (
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                  <Users className="w-5 h-5 text-cyan-400" />
                  Team Members ({teamMembers.length})
                </h3>
                {canEdit() && (
                  <button
                    onClick={() => setShowAddMember(true)}
                    className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-white text-sm transition-colors flex items-center gap-1"
                  >
                    <UserPlus className="w-4 h-4" />
                    Add Member
                  </button>
                )}
              </div>
              <div className="space-y-3">
                {teamMembers.length > 0 ? (
                  teamMembers.map((member) => (
                    <div key={member.id} className="bg-slate-700/30 rounded-xl p-3 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center">
                          <span className="text-cyan-400 font-bold">{member.full_name?.charAt(0) || '?'}</span>
                        </div>
                        <div>
                          <p className="text-white font-medium">{member.full_name}</p>
                          <p className="text-slate-400 text-sm">{member.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          member.role === "Admin" ? "bg-purple-500/20 text-purple-400" :
                          member.role === "Manager" ? "bg-yellow-500/20 text-yellow-400" :
                          "bg-slate-500/20 text-slate-400"
                        }`}>
                          {member.role}
                        </span>
                        <span className="text-slate-500 text-xs">
                          Joined {new Date(member.joined_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 text-center py-8">No team members yet</p>
                )}
              </div>
            </div>
          )}

          {/* Projects Tab */}
          {activeTab === "projects" && selectedOrg && (
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                  <Target className="w-5 h-5 text-cyan-400" />
                  Projects & Initiatives ({projects.length})
                </h3>
                {canEdit() && (
                  <button
                    onClick={() => setShowCreateProject(true)}
                    className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-white text-sm transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Create Project
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projects.map((project) => (
                  <div key={project.id} className="bg-slate-700/30 rounded-xl p-4 border border-slate-600">
                    <h4 className="text-white font-semibold">{project.title}</h4>
                    <p className="text-slate-400 text-sm mt-1">{project.description}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadge(project.status)}`}>
                        {project.status}
                      </span>
                      <span className="text-xs bg-slate-600 text-slate-300 px-2 py-1 rounded-full">
                        ${project.budget.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-500 mt-2">
                      <span>Start: {new Date(project.start_date).toLocaleDateString()}</span>
                      <span>End: {new Date(project.end_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Collaborations Tab */}
          {activeTab === "collaborations" && selectedOrg && (
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => setShowCollaborationModal(true)}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-xl text-white transition-colors flex items-center gap-2"
                >
                  <Handshake className="w-4 h-4" />
                  Request Collaboration
                </button>
              </div>

              {/* Collaboration Requests */}
              {collaborationRequests.length > 0 && (
                <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
                  <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                    <BellRing className="w-5 h-5 text-yellow-400" />
                    Pending Collaboration Requests
                  </h3>
                  <div className="space-y-4">
                    {collaborationRequests.map((request) => (
                      <div key={request.id} className="bg-slate-700/30 rounded-xl p-4 border border-slate-600">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-white font-medium">{request.from_organization_name}</h4>
                            <p className="text-slate-400 text-sm mt-1">{request.message}</p>
                            <div className="flex gap-2 mt-2">
                              <span className="text-xs bg-cyan-500/20 text-cyan-300 px-2 py-1 rounded-full">
                                {request.partnership_type}
                              </span>
                              {request.focus_areas?.map((area, idx) => (
                                <span key={idx} className="text-xs bg-slate-600 text-slate-300 px-2 py-1 rounded-full">
                                  {area}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleRespondToRequest(request.id, true)}
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-white text-sm transition-colors"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleRespondToRequest(request.id, false)}
                              className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded-lg text-white text-sm transition-colors"
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
                  Active Collaborations
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

          {/* Resources Tab */}
          {activeTab === "resources" && selectedOrg && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                  <Database className="w-5 h-5 text-cyan-400" />
                  Shared Resources
                </h3>
                <button
                  onClick={() => setShowResourceModal(true)}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-xl text-white transition-colors flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Share Resource
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sharedResources.map((resource) => (
                  <div key={resource.id} className="bg-slate-800/50 rounded-xl border border-slate-700 p-4 hover:border-cyan-500/30 transition-all">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="p-2 bg-cyan-500/20 rounded-lg">
                        {resource.type === "dataset" && <Database className="w-4 h-4 text-cyan-400" />}
                        {resource.type === "report" && <FileText className="w-4 h-4 text-cyan-400" />}
                        {resource.type === "toolkit" && <Mic className="w-4 h-4 text-cyan-400" />}
                        {resource.type === "training" && <GraduationCap className="w-4 h-4 text-cyan-400" />}
                        {resource.type === "policy" && <FileText className="w-4 h-4 text-cyan-400" />}
                        {resource.type === "research" && <BookOpen className="w-4 h-4 text-cyan-400" />}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-white font-medium">{resource.title}</h4>
                        <p className="text-slate-400 text-sm">by {resource.organization_name}</p>
                      </div>
                    </div>
                    <p className="text-slate-400 text-sm mb-3 line-clamp-2">{resource.description}</p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {resource.tags?.map((tag, idx) => (
                        <span key={idx} className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">
                          #{tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex justify-between items-center text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {resource.views || 0} views
                      </span>
                      <span className="flex items-center gap-1">
                        <Download className="w-3 h-3" />
                        {resource.downloads || 0} downloads
                      </span>
                      <span className={`px-2 py-0.5 rounded-full ${
                        resource.access_level === "public" ? "bg-emerald-500/20 text-emerald-400" :
                        resource.access_level === "partners" ? "bg-yellow-500/20 text-yellow-400" :
                        "bg-red-500/20 text-red-400"
                      }`}>
                        {resource.access_level}
                      </span>
                    </div>
                    {resource.url && (
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 text-cyan-400 hover:text-cyan-300 text-sm flex items-center gap-1"
                      >
                        View Resource <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Events Tab */}
          {activeTab === "events" && selectedOrg && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-cyan-400" />
                  Events & Activities
                </h3>
                <button
                  onClick={() => setShowEventModal(true)}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-xl text-white transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create Event
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {events.map((event) => (
                  <div key={event.id} className="bg-slate-800/50 rounded-xl border border-slate-700 p-4 hover:border-cyan-500/30 transition-all">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          event.event_type === "Webinar" ? "bg-purple-500/20 text-purple-400" :
                          event.event_type === "Workshop" ? "bg-yellow-500/20 text-yellow-400" :
                          event.event_type === "Conference" ? "bg-blue-500/20 text-blue-400" :
                          event.event_type === "Networking" ? "bg-pink-500/20 text-pink-400" :
                          "bg-cyan-500/20 text-cyan-400"
                        }`}>
                          {event.event_type}
                        </span>
                        <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getStatusBadge(event.status)}`}>
                          {event.status}
                        </span>
                      </div>
                      <span className="text-slate-400 text-sm">
                        {event.registered_count || 0}/{event.capacity || 0} registered
                      </span>
                    </div>
                    <h4 className="text-white font-semibold">{event.title}</h4>
                    <p className="text-slate-400 text-sm mt-1 line-clamp-2">{event.description}</p>
                    <div className="mt-3 space-y-1 text-sm text-slate-400">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {new Date(event.start_date).toLocaleString()} - {new Date(event.end_date).toLocaleString()}
                      </div>
                      {(event.location || event.venue) && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {event.location || event.venue}
                        </div>
                      )}
                      {event.meeting_link && (
                        <a
                          href={event.meeting_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                        >
                          Join Virtual Event <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                    <button
                      onClick={() => handleRegisterForEvent(event.id)}
                      className="mt-4 w-full py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-white transition-colors"
                    >
                      Register for Event
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reports Tab */}
          {activeTab === "reports" && selectedOrg && (
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5 text-cyan-400" />
                  Reports & Publications ({reports.length})
                </h3>
                <button
                  onClick={() => setShowReportModal(true)}
                  className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-white text-sm transition-colors flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Submit Report
                </button>
              </div>
              <div className="space-y-3">
                {reports.length > 0 ? (
                  reports.map((report) => (
                    <div key={report.id} className="bg-slate-700/30 rounded-xl p-3 flex justify-between items-center">
                      <div>
                        <p className="text-white font-medium">{report.title}</p>
                        <p className="text-slate-400 text-sm">{report.report_type || "General Report"}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadge(report.status)}`}>
                          {report.status}
                        </span>
                        <span className="text-slate-500 text-xs">
                          {new Date(report.created_at).toLocaleDateString()}
                        </span>
                        {report.file_url && (
                          <a
                            href={report.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 hover:bg-slate-600 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4 text-cyan-400" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 text-center py-8">No reports submitted yet</p>
                )}
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && selectedOrg && canEdit() && (
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
              <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-cyan-400" />
                Organization Settings
              </h3>
              <p className="text-slate-400 text-sm">
                Organization settings and configuration options will appear here.
              </p>
            </div>
          )}
        </div>

        {/* ============ ADD MEMBER MODAL ============ */}
      {showAddMember && selectedOrg && (
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
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
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
              <button
                onClick={handleInviteMember}
                disabled={inviting}
                className="w-full py-3 bg-cyan-600 hover:bg-cyan-700 rounded-xl text-white font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {inviting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
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

      {/* Request to Join Modal */}
      {showRequestJoinModal && selectedOrgToJoin && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setShowRequestJoinModal(false)}>
          <div className="bg-slate-800 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-700">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <UserPlus className="w-6 h-6 text-cyan-400" />
                  Request to Join
                </h2>
                <button onClick={() => setShowRequestJoinModal(false)} className="text-slate-400 hover:text-white text-2xl">&times;</button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-white font-medium">{selectedOrgToJoin.name}</p>
                <p className="text-slate-400 text-sm">{selectedOrgToJoin.type}</p>
                <p className="text-slate-400 text-sm">{selectedOrgToJoin.country}</p>
              </div>
              <div>
                <label className="text-slate-400 text-sm block mb-2">Message (Optional)</label>
                <textarea
                  value={joinMessage}
                  onChange={(e) => setJoinMessage(e.target.value)}
                  rows={3}
                  placeholder="Why do you want to join this organization?"
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 resize-none focus:outline-none focus:border-cyan-500"
                />
              </div>
              <button
                onClick={handleRequestToJoin}
                disabled={submitting}
                className="w-full py-3 bg-cyan-600 hover:bg-cyan-700 rounded-xl text-white font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Request
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && selectedOrg && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setShowReportModal(false)}>
          <div className="bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-700">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <FileText className="w-6 h-6 text-cyan-400" />
                  Submit Report
                </h2>
                <button onClick={() => setShowReportModal(false)} className="text-slate-400 hover:text-white text-2xl">&times;</button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-slate-400 text-sm block mb-2">Report Title *</label>
                <input
                  type="text"
                  value={reportForm.title}
                  onChange={(e) => setReportForm({ ...reportForm, title: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                  placeholder="Enter report title"
                />
              </div>
              <div>
                <label className="text-slate-400 text-sm block mb-2">Description</label>
                <textarea
                  value={reportForm.description}
                  onChange={(e) => setReportForm({ ...reportForm, description: e.target.value })}
                  rows={3}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 resize-none focus:outline-none focus:border-cyan-500"
                  placeholder="Describe the report..."
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 text-sm block mb-2">Report Type *</label>
                  <select
                    value={reportForm.type}
                    onChange={(e) => setReportForm({ ...reportForm, type: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white"
                  >
                    <option value="">Select Type</option>
                    <option value="Research Paper">Research Paper</option>
                    <option value="Policy Brief">Policy Brief</option>
                    <option value="Case Study">Case Study</option>
                    <option value="Annual Report">Annual Report</option>
                    <option value="Assessment Report">Assessment Report</option>
                    <option value="Evaluation Report">Evaluation Report</option>
                    <option value="Strategic Plan">Strategic Plan</option>
                    <option value="Technical Report">Technical Report</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 text-sm block mb-2">File URL</label>
                  <input
                    type="url"
                    value={reportForm.file_url}
                    onChange={(e) => setReportForm({ ...reportForm, file_url: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                    placeholder="https://example.com/report.pdf"
                  />
                </div>
              </div>
              <button
                onClick={handleCreateReport}
                disabled={submitting}
                className="w-full py-3 bg-cyan-600 hover:bg-cyan-700 rounded-xl text-white font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Report
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============ CREATE PROJECT MODAL ============ */}
      {showCreateProject && selectedOrg && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setShowCreateProject(false)}>
          <div className="bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-700">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Target className="w-6 h-6 text-cyan-400" />
                  Create Project
                </h2>
                <button onClick={() => setShowCreateProject(false)} className="text-slate-400 hover:text-white text-2xl">&times;</button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-slate-400 text-sm block mb-2">Project Title *</label>
                <input
                  type="text"
                  value={projectForm.title}
                  onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                  placeholder="Enter project title"
                />
              </div>
              <div>
                <label className="text-slate-400 text-sm block mb-2">Description</label>
                <textarea
                  value={projectForm.description}
                  onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                  rows={3}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 resize-none focus:outline-none focus:border-cyan-500"
                  placeholder="Describe your project..."
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 text-sm block mb-2">Status</label>
                  <select
                    value={projectForm.status}
                    onChange={(e) => setProjectForm({ ...projectForm, status: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white"
                  >
                    <option value="Planning">Planning</option>
                    <option value="Active">Active</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 text-sm block mb-2">Budget ($)</label>
                  <input
                    type="number"
                    value={projectForm.budget}
                    onChange={(e) => setProjectForm({ ...projectForm, budget: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 text-sm block mb-2">Start Date</label>
                  <input
                    type="date"
                    value={projectForm.start_date}
                    onChange={(e) => setProjectForm({ ...projectForm, start_date: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-sm block mb-2">End Date</label>
                  <input
                    type="date"
                    value={projectForm.end_date}
                    onChange={(e) => setProjectForm({ ...projectForm, end_date: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white"
                  />
                </div>
              </div>
              <button
                onClick={handleCreateProject}
                disabled={submitting}
                className="w-full py-3 bg-cyan-600 hover:bg-cyan-700 rounded-xl text-white font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Create Project
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============ SHARE RESOURCE MODAL ============ */}
      {showResourceModal && selectedOrg && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setShowResourceModal(false)}>
          <div className="bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-700">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Upload className="w-6 h-6 text-cyan-400" />
                  Share Resource
                </h2>
                <button onClick={() => setShowResourceModal(false)} className="text-slate-400 hover:text-white text-2xl">&times;</button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-slate-400 text-sm block mb-2">Resource Title *</label>
                <input
                  type="text"
                  value={resourceForm.title}
                  onChange={(e) => setResourceForm({ ...resourceForm, title: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                  placeholder="Enter resource title"
                />
              </div>
              <div>
                <label className="text-slate-400 text-sm block mb-2">Description</label>
                <textarea
                  value={resourceForm.description}
                  onChange={(e) => setResourceForm({ ...resourceForm, description: e.target.value })}
                  rows={3}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 resize-none focus:outline-none focus:border-cyan-500"
                  placeholder="Describe the resource..."
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 text-sm block mb-2">Resource Type *</label>
                  <select
                    value={resourceForm.type}
                    onChange={(e) => setResourceForm({ ...resourceForm, type: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white"
                  >
                    {resourceTypes.map(type => (
                      <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 text-sm block mb-2">Access Level</label>
                  <select
                    value={resourceForm.access_level}
                    onChange={(e) => setResourceForm({ ...resourceForm, access_level: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white"
                  >
                    <option value="public">Public - Everyone can view</option>
                    <option value="partners">Partners Only</option>
                    <option value="private">Private - Organization only</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-slate-400 text-sm block mb-2">Resource URL</label>
                <input
                  type="url"
                  value={resourceForm.url}
                  onChange={(e) => setResourceForm({ ...resourceForm, url: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                  placeholder="https://example.com/resource"
                />
              </div>
              <div>
                <label className="text-slate-400 text-sm block mb-2">Tags (comma separated)</label>
                <input
                  type="text"
                  value={resourceForm.tags}
                  onChange={(e) => setResourceForm({ ...resourceForm, tags: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                  placeholder="e.g., mental-health, policy, advocacy"
                />
              </div>
              <button
                onClick={handleShareResource}
                disabled={submitting}
                className="w-full py-3 bg-cyan-600 hover:bg-cyan-700 rounded-xl text-white font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Share Resource
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============ CREATE EVENT MODAL - FIXED ============ */}
      {showEventModal && selectedOrg && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setShowEventModal(false)}>
          <div className="bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-700">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-cyan-400" />
                  Create Event
                </h2>
                <button onClick={() => setShowEventModal(false)} className="text-slate-400 hover:text-white text-2xl">&times;</button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-slate-400 text-sm block mb-2">Event Title *</label>
                <input
                  type="text"
                  value={eventForm.title}
                  onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                  placeholder="Enter event title"
                />
              </div>
              <div>
                <label className="text-slate-400 text-sm block mb-2">Description</label>
                <textarea
                  value={eventForm.description}
                  onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                  rows={3}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 resize-none focus:outline-none focus:border-cyan-500"
                  placeholder="Describe your event..."
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 text-sm block mb-2">Event Type *</label>
                  <select
                    value={eventForm.event_type}
                    onChange={(e) => setEventForm({ ...eventForm, event_type: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white"
                  >
                    {eventTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 text-sm block mb-2">Capacity</label>
                  <input
                    type="number"
                    value={eventForm.capacity}
                    onChange={(e) => setEventForm({ ...eventForm, capacity: parseInt(e.target.value) || 1 })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white"
                    min="1"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <label className="text-slate-400 text-sm block mb-2">Location/Venue</label>
                <input
                  type="text"
                  value={eventForm.location}
                  onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                  placeholder="e.g., Conference Hall, Online"
                />
              </div>
              <div>
                <label className="text-slate-400 text-sm block mb-2">Venue</label>
                <input
                  type="text"
                  value={eventForm.venue}
                  onChange={(e) => setEventForm({ ...eventForm, venue: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                  placeholder="Specific venue name"
                />
              </div>
              <div>
                <label className="text-slate-400 text-sm block mb-2">Virtual Meeting Link</label>
                <input
                  type="url"
                  value={eventForm.meeting_link}
                  onChange={(e) => setEventForm({ ...eventForm, meeting_link: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                  placeholder="https://meet.example.com/event"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={eventForm.is_virtual}
                  onChange={(e) => setEventForm({ ...eventForm, is_virtual: e.target.checked })}
                  className="w-4 h-4 rounded bg-slate-700 border-slate-600"
                />
                <label className="text-slate-300 text-sm">This is a virtual event</label>
              </div>
              <button
                onClick={handleCreateEvent}
                disabled={submitting}
                className="w-full py-3 bg-cyan-600 hover:bg-cyan-700 rounded-xl text-white font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Calendar className="w-4 h-4" />
                    Create Event
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============ COLLABORATION MODAL - FIXED with search ============ */}
      {showCollaborationModal && selectedOrg && (
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
                <label className="text-slate-400 text-sm block mb-2">Search Partner Organization *</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by organization name or country..."
                    value={collaborationSearchTerm}
                    onChange={(e) => setCollaborationSearchTerm(e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div className="mt-2 max-h-48 overflow-y-auto">
                  {filteredPartnerOrgs.length > 0 ? (
                    <div className="space-y-1">
                      {filteredPartnerOrgs.slice(0, 10).map((org) => (
                        <button
                          key={org.id}
                          onClick={() => {
                            setSelectedPartner(org.id);
                            setCollaborationSearchTerm(`${org.name} (${org.country || 'N/A'})`);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                            selectedPartner === org.id
                              ? "bg-cyan-600/30 border border-cyan-500"
                              : "hover:bg-slate-700"
                          }`}
                        >
                          <p className="text-white text-sm">{org.name}</p>
                          <p className="text-slate-400 text-xs">{org.type} • {org.country || 'N/A'}</p>
                        </button>
                      ))}
                      {filteredPartnerOrgs.length > 10 && (
                        <p className="text-slate-400 text-xs px-3 py-1">
                          +{filteredPartnerOrgs.length - 10} more organizations
                        </p>
                      )}
                    </div>
                  ) : collaborationSearchTerm && (
                    <p className="text-slate-400 text-sm px-3 py-2">No organizations found matching your search</p>
                  )}
                </div>
                {selectedPartner && (
                  <p className="text-emerald-400 text-sm mt-2 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    Selected: {organizations.find(o => o.id === selectedPartner)?.name}
                  </p>
                )}
              </div>
              <div>
                <label className="text-slate-400 text-sm block mb-2">Type of Collaboration *</label>
                <select
                  value={partnershipType}
                  onChange={(e) => setPartnershipType(e.target.value)}
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
                <label className="text-slate-400 text-sm block mb-2">Message *</label>
                <textarea
                  value={collaborationMessage}
                  onChange={(e) => setCollaborationMessage(e.target.value)}
                  rows={4}
                  placeholder="Describe why you want to collaborate and what you hope to achieve..."
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 resize-none focus:outline-none focus:border-cyan-500"
                />
              </div>
              <button
                onClick={handleSendCollaborationRequest}
                disabled={submitting || !selectedPartner}
                className="w-full py-3 bg-cyan-600 hover:bg-cyan-700 rounded-xl text-white font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Request
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
     </div>
  );
}