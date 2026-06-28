// app/admin/page.tsx
"use client";

import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { africanCountries, getCountryByName } from "@/lib/countries-data";
import {
  Shield,
  Users,
  Building2,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Activity,
  Eye,
  Crown,
  TrendingUp,
  Bell,
  Settings,
  Download,
  Filter,
  Loader2,
  Search,
  UserCheck,
  UserX,
  RefreshCw,
  Globe,
  Zap,
  Heart,
  BarChart3,
  Calendar,
  MessageSquare,
  Flag,
  Award,
  ChevronRight,
  MoreVertical,
  FileText,
  Key,
  LogOut,
  Plus,
  Edit,
  Trash2,
  Send,
  HelpCircle,
  ClipboardList,
  PieChart,
  UserPlus,
} from "lucide-react";
import { CountrySelect } from "@/components/ui/country-select";

interface User {
  id: string;
  full_name: string;
  email: string;
  role: string;
  status: "Approved" | "Pending" | "Rejected";
  created_at: string;
  country?: string;
  organization?: string;
  assigned_region: string;
  updated_at: string;
}

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
  speakers: Array<{ name: string; title: string; organization: string }>;
}

interface Organization {
  id: string;
  name: string;
  country: string;
  type: string;
  contact_email: string;
  status: "Approved" | "Pending" | "Rejected";
  created_at: string;
}

interface Coordinator {
  id: string;
  name: string;
  country: string;
  assigned_regions: string[];
  status: "Active" | "Inactive";
  user_id: string;
  original_role: string;
  combined_role: string;
  created_at: string;
}

interface Alert {
  id: string;
  type: "warning" | "critical" | "info";
  title: string;
  message: string;
  severity: "high" | "medium" | "low";
  status: "active" | "inactive";
  country?: string;
  audience: "all" | "policymakers" | "donors" | "researchers" | "coordinators" | "cso";
  created_at: string;
  expires_at?: string;
}

interface Survey {
  id: string;
  title: string;
  description: string;
  category: string;
  status: "Active" | "Draft" | "Archived";
  created_at: string;
  response_count: number;
}

interface Report {
  id: string;
  report_title: string;
  country: string;
  reporting_period: string;
  status: string;
  score: number;
  submitted_by: string;
  created_at: string;
}

interface SystemHealth {
  status: "healthy" | "degraded" | "down";
  uptime: string;
  apiLatency: number;
  databaseStatus: "connected" | "disconnected";
  lastBackup: string;
}

// Role mapping for coordinator combinations
const getCoordinatorRole = (originalRole: string): string => {
  const roleMap: Record<string, string> = {
    "Policymaker": "policymaker_coordinator",
    "Researcher": "researcher_coordinator",
    "Mental_Health_Professional": "mental_health_coordinator",
    "CSO": "cso_coordinator",
    "Donor": "donor_coordinator",
    "Admin": "admin_coordinator",
  };
  return roleMap[originalRole] || `${originalRole.toLowerCase()}_coordinator`;
};

export default function AdminDashboard() {
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [coordinators, setCoordinators] = useState<Coordinator[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [eventTab, setEventTab] = useState<"all" | "Pending" | "Approved" | "Rejected">("Pending");
  const [selectedRegionalUser, setSelectedRegionalUser] = useState("");
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    status: "healthy",
    uptime: "14d 8h 32m",
    apiLatency: 124,
    databaseStatus: "connected",
    lastBackup: "2024-03-15 02:00:00",
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [activeTab, setActiveTab] = useState<"users" | "organizations" | "regional" | "coordinators" | "alerts" | "reports" | "events" | "surveys">("users");
  const [activityFeed, setActivityFeed] = useState<any[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Coordinator Assignment Modal States
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedCountryCode, setSelectedCountryCode] = useState("");
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [assigning, setAssigning] = useState(false);
  
  // Regional Executive Modal States
  const [showRegionalModal, setShowRegionalModal] = useState(false);
  const [regionalUserSearchTerm, setRegionalUserSearchTerm] = useState("");
  const [selectedRegionalUserId, setSelectedRegionalUserId] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedRegionalCountry, setSelectedRegionalCountry] = useState("");
  const [regionalAssigning, setRegionalAssigning] = useState(false);

  // Get eligible users for regional executive assignment
  const getEligibleRegionalUsers = () => {
    return users.filter(u => 
      u.status === "Approved" && 
      u.role !== "Admin" &&
      u.role !== "Regional_Executive"
    );
  };

  // Alert Modal States
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertForm, setAlertForm] = useState({
    title: "",
    message: "",
    severity: "medium",
    country: "",
    audience: "all",
    expires_at: "",
  });
  
  // Survey Modal States
  const [showSurveyModal, setShowSurveyModal] = useState(false);
  const [surveyForm, setSurveyForm] = useState({
    title: "",
    description: "",
    category: "",
    status: "Draft",
  });

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    try {
      console.log("🔐 Admin Gate - Verifying security clearance...");

      // 1. First check localStorage for user profile
      const userStr = localStorage.getItem("user");
      
      if (userStr) {
        try {
          const userData = JSON.parse(userStr);
          if (userData.role === "Admin" && userData.status === "Approved") {
            setAdminUser(userData);
            await fetchAllData();
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
        .select("id, full_name, email, role, status")
        .eq("auth_user_id", session.user.id)
        .single();

      if (dbError || !userData) {
        console.error("Profile matching session ID not found in database registry:", dbError?.message);
        router.push("/login");
        return;
      }

      // 4. Admin Authorization Guard Rule
      if (userData.role !== "Admin") {
        console.warn(`🛑 Unauthorized access attempt. User role "${userData.role}" is not an Admin.`);
        router.push("/dashboard");
        return;
      }

      // 5. Approval Constraint Guard Rule
      if (userData.status !== "Approved") {
        console.log("Admin account is not yet marked as Approved.");
        router.push("/login?message=Account pending approval");
        return;
      }

      // 6. Cache user data in localStorage
      localStorage.setItem("user", JSON.stringify(userData));
      setAdminUser(userData);
      await fetchAllData();
      
    } catch (error) {
      console.error("Critical error encountered during admin security verification:", error);
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      // Fetch events with approval_status
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("created_at", { ascending: false });
  
      if (error) throw error;
  
      if (!data || data.length === 0) {
        setEvents([]);
        return;
      }
  
      // Get creator names separately
      const creatorIds = data.map(e => e.created_by).filter(id => id);
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
  
      const eventsWithDetails = data.map(event => ({
        ...event,
        created_by_name: creatorsMap[event.created_by]?.full_name || "Unknown",
        created_by_email: creatorsMap[event.created_by]?.email || "",
      }));
  
      setEvents(eventsWithDetails);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  // ==================== EVENT APPROVAL FUNCTIONS ====================

  const handleApproveEvent = async (eventId: string) => {
    if (!adminUser) return;
    
    setActionLoading(eventId);
    try {
      const { error } = await supabase
        .from("events")
        .update({
          approval_status: "Approved",
          approved_by: adminUser.id,
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

  const getEventStatusBadge = (status: string) => {
    switch (status) {
      case "Approved":
        return { color: "bg-emerald-500/20 text-emerald-400", icon: CheckCircle };
      case "Pending":
        return { color: "bg-yellow-500/20 text-yellow-400", icon: Clock };
      case "Rejected":
        return { color: "bg-red-500/20 text-red-400", icon: XCircle };
      default:
        return { color: "bg-slate-500/20 text-slate-400", icon: Clock };
    }
  };

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchOrganizations(),
        fetchUsers(),
        fetchReports(),
        fetchCoordinators(),
        fetchAlerts(),
        fetchSurveys(),
        fetchEvents(), // Add this
      ]);
      await fetchActivityFeed();
    } catch (error) {
      console.error("Error fetching data:", error);
      setErrorMessage("Failed to load some data. Please refresh.");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      console.log("🔄 Fetching users...");
      const { data, error } = await supabase
        .rpc('admin_get_all_users');
        
  
      if (error) {
        console.error("❌ Error fetching users:", error);
        return;
      }
  
      if (data) {
        console.log("✅ Users fetched:", data.length);
        console.log("📊 First user status:", data[0]?.status);
        setUsers(data);
      }
    } catch (error) {
      console.error("❌ Error fetching users:", error);
    }
  };

  const fetchCoordinators = async () => {
    const { data, error } = await supabase
      .from("coordinators")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setCoordinators(data);
    }
  };

  const fetchAlerts = async () => {
    const { data, error } = await supabase
      .from("alerts")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setAlerts(data);
    }
  };

  const fetchSurveys = async () => {
    const { data, error } = await supabase
      .from("surveys")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      const surveysWithCounts = await Promise.all(
        data.map(async (survey) => {
          const { count } = await supabase
            .from("survey_responses")
            .select("*", { count: "exact", head: true })
            .eq("survey_id", survey.id);
          return { ...survey, response_count: count || 0 };
        })
      );
      setSurveys(surveysWithCounts);
    }
  };

  const fetchOrganizations = async () => {
    const { data, error } = await supabase
      .from("organizations")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setOrganizations(data);
    }
  };

  const fetchReports = async () => {
    const { data, error } = await supabase
      .from("reports")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setReports(data);
    }
  };

  const fetchActivityFeed = async () => {
    const recentUsers = users.slice(0, 3).map(u => ({
      id: u.id,
      action: "User Registered",
      target: u.full_name,
      timestamp: u.created_at,
      type: "user"
    }));
    
    const recentOrgs = organizations.slice(0, 3).map(o => ({
      id: o.id,
      action: "Organization Registered",
      target: o.name,
      timestamp: o.created_at,
      type: "org"
    }));
    
    const recentReports = reports.slice(0, 3).map(r => ({
      id: r.id,
      action: "Report Submitted",
      target: r.report_title,
      timestamp: r.created_at,
      type: "report"
    }));
    
    const allActivities = [...recentUsers, ...recentOrgs, ...recentReports]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10);
    
    setActivityFeed(allActivities);
  };

  // Get eligible users for coordinator assignment
  const getEligibleUsers = () => {
    const assignedUserIds = coordinators.map(c => c.user_id);
    return users.filter(u => 
      u.status === "Approved" && 
      !assignedUserIds.includes(u.id) &&
      u.role !== "Admin"
    );
  };

  const filteredEligibleUsers = getEligibleUsers().filter(user =>
    user.full_name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(userSearchTerm.toLowerCase())
  );

  const filteredRegionalUsers = getEligibleRegionalUsers().filter(user =>
    user.full_name.toLowerCase().includes(regionalUserSearchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(regionalUserSearchTerm.toLowerCase())
  );

  const handleAssignCoordinator = async () => {
    if (!selectedUserId || !selectedCountry) {
      alert("Please select a user and country");
      return;
    }

    setAssigning(true);
    try {
      const selectedUser = users.find(u => u.id === selectedUserId);
      if (!selectedUser) throw new Error("User not found");

      const originalRole = selectedUser.role;
      const combinedRole = getCoordinatorRole(originalRole);

      // 1. Insert into coordinators table
      const { error: coordError } = await supabase
        .from("coordinators")
        .insert({
          user_id: selectedUserId,
          name: selectedUser.full_name,
          country: selectedCountry,
          assigned_regions: selectedRegions,
          status: "Active",
          original_role: originalRole,
          combined_role: combinedRole,
          created_at: new Date().toISOString(),
        });

      if (coordError) throw coordError;

      // 2. Use the admin function to update the user role
      const { data: functionData, error: functionError } = await supabase
        .rpc('admin_update_user_role', {
          target_user_id: selectedUserId,
          new_role: combinedRole,
          assigned_country: selectedCountry,
          assigned_region: null
        });

      if (functionError) {
        console.error("❌ Function error:", functionError);
        throw new Error(`Failed to update user role: ${functionError.message}`);
      }

      if (!functionData?.success) {
        throw new Error(functionData?.error || "Failed to update user role");
      }

      alert(`Successfully assigned ${selectedUser.full_name} as coordinator for ${selectedCountry}.`);
      
      setShowAssignModal(false);
      setSelectedUserId("");
      setSelectedCountry("");
      setSelectedCountryCode("");
      setSelectedRegions([]);
      setUserSearchTerm("");
      await fetchCoordinators();
      await fetchUsers();
      
    } catch (error: any) {
      console.error("Error assigning coordinator:", error);
      alert(`Failed to assign coordinator: ${error.message}`);
    } finally {
      setAssigning(false);
    }
  };

  const handleAssignRegionalExecutive = async () => {
    if (!selectedRegionalUserId || !selectedRegion) {
      alert("Please select a user and region");
      return;
    }

    setRegionalAssigning(true);
    try {
      const selectedUser = users.find(u => u.id === selectedRegionalUserId);
      if (!selectedUser) throw new Error("User not found");

      // Update the user's role in public.users table
      const { error } = await supabase
        .from("users")
        .update({ 
          role: "Regional_Executive",
          assigned_region: selectedRegion,
          assigned_country: selectedRegionalCountry || null,
          updated_at: new Date().toISOString()
        })
        .eq("id", selectedRegionalUserId);

      if (error) {
        console.error("❌ Supabase update error:", error);
        throw new Error(`Failed to update user role: ${error.message}`);
      }

      alert(`Successfully assigned ${selectedUser?.full_name} as Regional Executive for ${selectedRegion}`);
      setShowRegionalModal(false);
      setSelectedRegionalUserId("");
      setSelectedRegion("");
      setSelectedRegionalCountry("");
      setRegionalUserSearchTerm("");
      await fetchUsers();
      
    } catch (error: any) {
      console.error("Error assigning regional executive:", error);
      alert(`Failed to assign regional executive: ${error.message}`);
    } finally {
      setRegionalAssigning(false);
    }
  };

  // ==================== ENHANCED REPORT REVIEW ====================
  const handleReportReview = async (reportId: string, action: "approve" | "reject" | "request_changes", score?: number) => {
    setActionLoading(reportId);
    try {
      let status = "";
      let message = "";

      switch (action) {
        case "approve":
          status = "Approved";
          message = "Report approved successfully!";
          break;
        case "reject":
          status = "Rejected";
          message = "Report rejected.";
          break;
        case "request_changes":
          status = "Changes Requested";
          message = "Changes requested. Please provide feedback.";
          break;
        default:
          throw new Error("Invalid action");
      }

      const updateData: any = { status };
      if (score !== undefined) updateData.score = score;
      if (action === "request_changes") {
        const feedback = prompt("Please provide feedback for the changes needed:");
        if (feedback !== null) {
          updateData.feedback = feedback;
        } else {
          setActionLoading(null);
          return;
        }
      }

      const { error } = await supabase
        .from("reports")
        .update(updateData)
        .eq("id", reportId);

      if (error) throw error;
      
      await fetchReports();
      alert(message);
    } catch (error) {
      console.error("Error reviewing report:", error);
      alert("Failed to review report");
    } finally {
      setActionLoading(null);
    }
  };

  const updateReportFeedback = async (reportId: string, message: string) => {
    // Implementation for updating report feedback
  };

  // Regions for dropdown
  const regions = [
    "West Africa",
    "East Africa",
    "Central Africa",
    "Southern Africa",
    "North Africa",
    "Sahel Region",
    "Horn of Africa",
    "Great Lakes Region",
  ];

  // Alert Management Functions
  const handleCreateAlert = async () => {
    if (!alertForm.title || !alertForm.message) {
      alert("Please fill in title and message");
      return;
    }

    setActionLoading("create-alert");
    try {
      const { data, error } = await supabase
        .from("alerts")
        .insert({
          title: alertForm.title,
          message: alertForm.message,
          severity: alertForm.severity,
          status: "active",
          country: alertForm.country || null,
          audience: alertForm.audience || "all",
          expires_at: alertForm.expires_at || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select();

      if (error) {
        console.error("Supabase error:", error);
        alert(`Failed to create alert: ${error.message}`);
        setActionLoading(null);
        return;
      }

      alert("Alert created successfully!");
      setShowAlertModal(false);
      setAlertForm({
        title: "",
        message: "",
        severity: "medium",
        country: "",
        audience: "all",
        expires_at: "",
      });
      await fetchAlerts();
      
    } catch (error) {
      console.error("Error creating alert:", error);
      alert("Failed to create alert. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  const updateAlertStatus = async (alertId: string, status: string) => {
    setActionLoading(alertId);
    try {
      const { error } = await supabase
        .from("alerts")
        .update({ status })
        .eq("id", alertId);

      if (error) throw error;
      fetchAlerts();
      alert(`Alert ${status === "active" ? "activated" : "deactivated"} successfully`);
    } catch (error) {
      console.error("Error updating alert:", error);
      alert("Failed to update alert");
    } finally {
      setActionLoading(null);
    }
  };

  const deleteAlert = async (alertId: string) => {
    if (!confirm("Are you sure you want to delete this alert?")) return;
    
    setActionLoading(alertId);
    try {
      const { error } = await supabase
        .from("alerts")
        .delete()
        .eq("id", alertId);

      if (error) throw error;
      fetchAlerts();
      alert("Alert deleted successfully");
    } catch (error) {
      console.error("Error deleting alert:", error);
      alert("Failed to delete alert");
    } finally {
      setActionLoading(null);
    }
  };

  // Survey Management Functions
  const handleCreateSurvey = async () => {
    if (!surveyForm.title || !surveyForm.description || !surveyForm.category) {
      alert("Please fill in all required fields");
      return;
    }

    setActionLoading("create-survey");
    try {
      const { error } = await supabase
        .from("surveys")
        .insert({
          title: surveyForm.title,
          description: surveyForm.description,
          category: surveyForm.category,
          status: surveyForm.status,
        });

      if (error) throw error;

      alert("Survey created successfully!");
      setShowSurveyModal(false);
      setSurveyForm({
        title: "",
        description: "",
        category: "",
        status: "Draft",
      });
      fetchSurveys();
    } catch (error) {
      console.error("Error creating survey:", error);
      alert("Failed to create survey");
    } finally {
      setActionLoading(null);
    }
  };

  const updateSurveyStatus = async (surveyId: string, status: string) => {
    setActionLoading(surveyId);
    try {
      const { error } = await supabase
        .from("surveys")
        .update({ status })
        .eq("id", surveyId);

      if (error) throw error;
      fetchSurveys();
      alert(`Survey ${status.toLowerCase()} successfully`);
    } catch (error) {
      console.error("Error updating survey:", error);
      alert("Failed to update survey");
    } finally {
      setActionLoading(null);
    }
  };

  const deleteSurvey = async (surveyId: string) => {
    if (!confirm("Are you sure you want to delete this survey?")) return;
    
    setActionLoading(surveyId);
    try {
      const { error } = await supabase
        .from("surveys")
        .delete()
        .eq("id", surveyId);

      if (error) throw error;
      fetchSurveys();
      alert("Survey deleted successfully");
    } catch (error) {
      console.error("Error deleting survey:", error);
      alert("Failed to delete survey");
    } finally {
      setActionLoading(null);
    }
  };

  // User Management Functions
  const approveUser = async (userId: string) => {
    setActionLoading(userId);
    try {
      console.log("🔍 Approving user:", userId);
  
      // Simple update without select
      const { error } = await supabase
        .from("users")
        .update({ 
          status: "Approved",
          updated_at: new Date().toISOString()
        })
        .eq("id", userId);
  
      if (error) {
        console.error("❌ Update error:", error);
        alert(`Failed to approve user: ${error.message}`);
        setActionLoading(null);
        return;
      }
  
      console.log("✅ Update completed");
  
      // Fetch fresh data
      const { data: freshUsers, error: fetchError } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false });
  
      if (fetchError) {
        console.error("❌ Fetch error:", fetchError);
      } else if (freshUsers) {
        console.log("✅ Fresh users fetched:", freshUsers.length);
        setUsers(freshUsers);
      }
  
      await fetchActivityFeed();
      alert("User approved successfully!");
    } catch (err) {
      console.error("❌ Error approving user:", err);
      alert("Failed to approve user");
    } finally {
      setActionLoading(null);
    }
  };

  // Add this temporary debug function
const debugUserStatus = async (userId: string) => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();
  
  console.log("🔍 Direct DB query result:", data);
  console.log("🔍 Direct DB query error:", error);
  alert(`User status in DB: ${data?.status}`);
};

  const rejectUser = async (userId: string) => {
    setActionLoading(userId);
    try {
      const { error } = await supabase
        .from("users")
        .update({ status: "Rejected", updated_at: new Date().toISOString() })
        .eq("id", userId);

      if (error) throw error;
      await fetchUsers();
      alert("User rejected successfully!");
    } catch (err) {
      console.error("Error rejecting user:", err);
      alert("Failed to reject user");
    } finally {
      setActionLoading(null);
    }
  };

  // Updated reset password using Supabase
  const resetUserPassword = async (userId: string, userEmail: string) => {
    const newPassword = prompt(`Enter new password for ${userEmail}:`);
    if (!newPassword || newPassword.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    try {
      // Get the auth user ID from the users table
      const { data: userData, error: fetchError } = await supabase
        .from("users")
        .select("auth_user_id")
        .eq("id", userId)
        .single();

      if (fetchError || !userData?.auth_user_id) {
        alert("User not found or no auth account linked");
        return;
      }

      // Update password using Supabase admin API
      const { error } = await supabase.auth.admin.updateUserById(
        userData.auth_user_id,
        { password: newPassword }
      );

      if (error) {
        console.error("Supabase error:", error);
        alert("Failed to reset password. Please use the Supabase dashboard.");
        return;
      }
      
      alert(`Password reset successful for ${userEmail}`);
    } catch (error) {
      console.error("Error resetting password:", error);
      alert("Failed to reset password. Please use the Supabase dashboard.");
    }
  };

  const approveOrganization = async (orgId: string) => {
    setActionLoading(orgId);
    try {
      const { error } = await supabase
        .from("organizations")
        .update({ status: "Approved", approved_at: new Date().toISOString() })
        .eq("id", orgId);

      if (error) throw error;
      await fetchOrganizations();
      alert("Organization approved successfully!");
    } catch (err) {
      console.error("Error approving organization:", err);
      alert("Failed to approve organization");
    } finally {
      setActionLoading(null);
    }
  };

  const updateReportStatus = async (reportId: string, status: string, score?: number) => {
    setActionLoading(reportId);
    try {
      const updateData: any = { status };
      if (score !== undefined) updateData.score = score;
      
      const { error } = await supabase
        .from("reports")
        .update(updateData)
        .eq("id", reportId);

      if (error) throw error;
      await fetchReports();
      alert(`Report ${status.toLowerCase()} successfully!`);
    } catch (err) {
      console.error("Error updating report:", err);
      alert("Failed to update report status");
    } finally {
      setActionLoading(null);
    }
  };

  const updateCoordinatorStatus = async (coordId: string, status: string) => {
    setActionLoading(coordId);
    try {
      const { error } = await supabase
        .from("coordinators")
        .update({ status })
        .eq("id", coordId);

      if (error) throw error;
      await fetchCoordinators();
      alert(`Coordinator ${status.toLowerCase()} successfully!`);
    } catch (err) {
      console.error("Error updating coordinator:", err);
      alert("Failed to update coordinator status");
    } finally {
      setActionLoading(null);
    }
  };

  const logout = async () => {
    try {
      // Clear localStorage
      localStorage.removeItem("user");
      localStorage.removeItem("session");
      localStorage.removeItem("token");
      
      // Sign out from Supabase
      await supabase.auth.signOut();
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === "all" || user.role === selectedRole;
    const matchesStatus = selectedStatus === "all" || user.status === selectedStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const stats = {
    totalUsers: users.length,
    approvedUsers: users.filter(u => u.status === "Approved").length,
    pendingUsers: users.filter(u => u.status === "Pending").length,
    totalOrganizations: organizations.length,
    pendingOrganizations: organizations.filter(o => o.status === "Pending").length,
    activeCoordinators: coordinators.filter(c => c.status === "Active").length,
    criticalAlerts: alerts.filter(a => a.severity === "high" || a.type === "critical").length,
    totalReports: reports.length,
    pendingReports: reports.filter(r => r.status === "Pending").length,
    totalSurveys: surveys.length,
    activeSurveys: surveys.filter(s => s.status === "Active").length,
    pendingEvents: events.filter(e => e.approval_status === "Pending").length,
    totalEvents: events.length,
  };

  const getAlertSeverityColor = (severity: string) => {
    switch (severity) {
      case "high": return "bg-red-500/10 border-red-500/30";
      case "medium": return "bg-yellow-500/10 border-yellow-500/30";
      case "low": return "bg-blue-500/10 border-blue-500/30";
      default: return "bg-slate-500/10 border-slate-500/30";
    }
  };

  const getAlertSeverityIcon = (severity: string) => {
    switch (severity) {
      case "high": return <AlertTriangle className="w-5 h-5 text-red-400" />;
      case "medium": return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      default: return <Bell className="w-5 h-5 text-blue-400" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-300">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-cyan-950 to-slate-900 border-b border-cyan-500/20">
        <div className="relative px-6 md:px-8 py-6 md:py-8">
          <div className="flex justify-between items-start flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="px-3 py-1 bg-cyan-500/20 rounded-full border border-cyan-500/30">
                  <span className="text-cyan-300 text-xs font-mono tracking-wider">CONTINENTAL CONTROL CENTER</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full animate-pulse ${systemHealth.status === 'healthy' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-slate-400 text-xs">System {systemHealth.status}</span>
                </div>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Governance Command Center
              </h1>
              <p className="text-slate-300 text-sm md:text-base mt-2">
                Welcome back, {adminUser?.full_name || "Administrator"} · Continental Oversight Portal
              </p>
            </div>
            
            <div className="flex gap-3">
              <button onClick={() => fetchAllData()} className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-600 transition-colors">
                <RefreshCw className="w-4 h-4" />
                <span className="text-sm hidden sm:inline">Refresh</span>
              </button>
              <button onClick={logout} className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 rounded-xl border border-red-500/30 text-red-400 transition-colors">
                <LogOut className="w-4 h-4" />
                <span className="text-sm hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-8 py-6">
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 text-sm">
            {errorMessage}
          </div>
        )}

        {/* KPI Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-10 gap-4 mb-8">
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-cyan-400" />
              <p className="text-slate-400 text-xs">Total Users</p>
            </div>
            <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
          </div>
          <div className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/20">
            <div className="flex items-center gap-2 mb-2">
              <UserCheck className="w-4 h-4 text-emerald-400" />
              <p className="text-emerald-400 text-xs">Approved</p>
            </div>
            <p className="text-2xl font-bold text-emerald-400">{stats.approvedUsers}</p>
          </div>
          <div className="bg-yellow-500/10 rounded-xl p-4 border border-yellow-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-yellow-400" />
              <p className="text-yellow-400 text-xs">Pending Users</p>
            </div>
            <p className="text-2xl font-bold text-yellow-400">{stats.pendingUsers}</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="w-4 h-4 text-purple-400" />
              <p className="text-slate-400 text-xs">Organizations</p>
            </div>
            <p className="text-2xl font-bold text-white">{stats.totalOrganizations}</p>
          </div>
          <div className="bg-orange-500/10 rounded-xl p-4 border border-orange-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-orange-400" />
              <p className="text-orange-400 text-xs">Pending Orgs</p>
            </div>
            <p className="text-2xl font-bold text-orange-400">{stats.pendingOrganizations}</p>
          </div>
          <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Flag className="w-4 h-4 text-blue-400" />
              <p className="text-blue-400 text-xs">Coordinators</p>
            </div>
            <p className="text-2xl font-bold text-blue-400">{stats.activeCoordinators}</p>
          </div>
          <div className="bg-red-500/10 rounded-xl p-4 border border-red-500/20">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <p className="text-red-400 text-xs">Active Alerts</p>
            </div>
            <p className="text-2xl font-bold text-red-400">{stats.criticalAlerts}</p>
          </div>
          <div className="bg-indigo-500/10 rounded-xl p-4 border border-indigo-500/20">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-indigo-400" />
              <p className="text-indigo-400 text-xs">Total Reports</p>
            </div>
            <p className="text-2xl font-bold text-indigo-400">{stats.totalReports}</p>
          </div>
          <div className="bg-cyan-500/10 rounded-xl p-4 border border-cyan-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <p className="text-cyan-400 text-xs">Pending Reports</p>
            </div>
            <p className="text-2xl font-bold text-cyan-400">{stats.pendingReports}</p>
          </div>
          <div className="bg-purple-500/10 rounded-xl p-4 border border-purple-500/20">
            <div className="flex items-center gap-2 mb-2">
              <ClipboardList className="w-4 h-4 text-purple-400" />
              <p className="text-purple-400 text-xs">Surveys</p>
            </div>
            <p className="text-2xl font-bold text-purple-400">{stats.totalSurveys}</p>
          </div>
          <div className="bg-yellow-500/10 rounded-xl p-4 border border-yellow-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-yellow-400" />
              <p className="text-yellow-400 text-xs">Pending Events</p>
            </div>
            <p className="text-2xl font-bold text-yellow-400">{stats.pendingEvents}</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-700 pb-4">
          <button
            onClick={() => setActiveTab("users")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "users" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800"}`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            Users
            {stats.pendingUsers > 0 && <span className="ml-2 px-1.5 py-0.5 bg-yellow-500 text-white text-xs rounded-full">{stats.pendingUsers}</span>}
          </button>
          <button
            onClick={() => setActiveTab("organizations")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "organizations" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800"}`}
          >
            <Building2 className="w-4 h-4 inline mr-2" />
            Organizations
            {stats.pendingOrganizations > 0 && <span className="ml-2 px-1.5 py-0.5 bg-yellow-500 text-white text-xs rounded-full">{stats.pendingOrganizations}</span>}
          </button>
          <button
            onClick={() => setActiveTab("coordinators")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "coordinators" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800"}`}
          >
            <Flag className="w-4 h-4 inline mr-2" />
            Coordinators
          </button>
          <button
            onClick={() => setActiveTab("alerts")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "alerts" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800"}`}
          >
            <Bell className="w-4 h-4 inline mr-2" />
            Alerts
          </button>
          <button
            onClick={() => setActiveTab("surveys")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "surveys" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800"}`}
          >
            <ClipboardList className="w-4 h-4 inline mr-2" />
            Surveys
          </button>
          <button
            onClick={() => setActiveTab("reports")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "reports" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800"}`}
          >
            <FileText className="w-4 h-4 inline mr-2" />
            Reports
          </button>
          <button
            onClick={() => setActiveTab("events")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "events" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800"}`}
          >
            <Calendar className="w-4 h-4 inline mr-2" />
            Events
            {events.filter(e => e.approval_status === "Pending").length > 0 && (
              <span className="ml-2 px-1.5 py-0.5 bg-yellow-500 text-white text-xs rounded-full">
                {events.filter(e => e.approval_status === "Pending").length}
              </span>
            )}
          </button>
        </div>

        {/* Users Tab */}
        {activeTab === "users" && (
          <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
            <div className="p-4 border-b border-slate-700 bg-slate-800/80">
              <div className="flex justify-between items-center">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <Users className="w-5 h-5 text-cyan-400" />
                  User Registry
                  <span className="text-slate-400 text-sm font-normal ml-2">({filteredUsers.length} users)</span>
                </h3>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-64 bg-slate-700 border border-slate-600 rounded-lg pl-10 pr-4 py-1.5 text-white text-sm"
                    />
                  </div>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-1.5 text-white text-sm"
                  >
                    <option value="all">All Roles</option>
                    <option value="Policymaker">Policymaker</option>
                    <option value="Researcher">Researcher</option>
                    <option value="CSO">CSO</option>
                    <option value="Coordinator">Coordinator</option>
                    <option value="Donor">Donor</option>
                    <option value="Admin">Admin</option>
                  </select>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-1.5 text-white text-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-900/50">
                  <tr>
                    <th className="text-left p-4 text-slate-400 text-sm font-medium">User</th>
                    <th className="text-left p-4 text-slate-400 text-sm font-medium">Role</th>
                    <th className="text-left p-4 text-slate-400 text-sm font-medium">Country</th>
                    <th className="text-left p-4 text-slate-400 text-sm font-medium">Status</th>
                    <th className="text-left p-4 text-slate-400 text-sm font-medium">Registered</th>
                    <th className="text-left p-4 text-slate-400 text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="border-t border-slate-700/50 hover:bg-slate-700/30">
                      <td className="p-4">
                        <p className="text-white font-medium">{u.full_name}</p>
                        <p className="text-slate-400 text-xs">{u.email}</p>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-1 bg-slate-700 rounded-lg text-xs text-slate-300">{u.role}</span>
                      </td>
                      <td className="p-4 text-slate-300 text-sm">{u.country || "—"}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          u.status === "Approved" ? "bg-emerald-500/20 text-emerald-400" :
                          u.status === "Pending" ? "bg-yellow-500/20 text-yellow-400" : "bg-red-500/20 text-red-400"
                        }`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="p-4 text-slate-400 text-sm">{new Date(u.created_at).toLocaleDateString()}</td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          
                        <button
                          onClick={() => debugUserStatus(u.id)}
                          className="p-1.5 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg text-blue-400"
                          title="Debug Status"
                        >
                          <Search className="w-4 h-4" />
                        </button>
                          <button
                            onClick={() => resetUserPassword(u.id, u.email)}
                            className="p-1.5 bg-yellow-500/20 hover:bg-yellow-500/30 rounded-lg text-yellow-400"
                            title="Reset Password"
                          >
                            <Key className="w-4 h-4" />
                          </button>
                          {u.status === "Pending" && (
                            <>
                              <button
                                onClick={() => approveUser(u.id)}
                                className="p-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 rounded-lg text-emerald-400"
                                title="Approve"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => rejectUser(u.id)}
                                className="p-1.5 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-400"
                                title="Reject"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Organizations Tab */}
        {activeTab === "organizations" && (
          <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
            <div className="p-4 border-b border-slate-700 bg-slate-800/80">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Building2 className="w-5 h-5 text-cyan-400" />
                Organization Approvals
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-900/50">
                  <tr>
                    <th className="text-left p-4 text-slate-400 text-sm font-medium">Organization</th>
                    <th className="text-left p-4 text-slate-400 text-sm font-medium">Type</th>
                    <th className="text-left p-4 text-slate-400 text-sm font-medium">Country</th>
                    <th className="text-left p-4 text-slate-400 text-sm font-medium">Email</th>
                    <th className="text-left p-4 text-slate-400 text-sm font-medium">Status</th>
                    <th className="text-left p-4 text-slate-400 text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {organizations.map((org) => (
                    <tr key={org.id} className="border-t border-slate-700/50 hover:bg-slate-700/30">
                      <td className="p-4 font-medium text-white">{org.name}</td>
                      <td className="p-4 text-slate-300 text-sm">{org.type}</td>
                      <td className="p-4 text-slate-300 text-sm">{org.country}</td>
                      <td className="p-4 text-slate-300 text-sm">{org.contact_email}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          org.status === "Approved" ? "bg-emerald-500/20 text-emerald-400" :
                          org.status === "Pending" ? "bg-yellow-500/20 text-yellow-400" : "bg-red-500/20 text-red-400"
                        }`}>
                          {org.status}
                        </span>
                      </td>
                      <td className="p-4">
                        {org.status === "Pending" && (
                          <button
                            onClick={() => approveOrganization(org.id)}
                            className="p-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 rounded-lg text-emerald-400"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Coordinators Tab */}
        {activeTab === "coordinators" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
              <div className="p-4 border-b border-slate-700 bg-slate-800/80 flex justify-between items-center">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <Flag className="w-5 h-5 text-cyan-400" />
                  Assigned Coordinators
                </h3>
                <span className="text-slate-400 text-sm">{coordinators.length} coordinators</span>
              </div>
              <div className="divide-y divide-slate-700 max-h-[400px] overflow-y-auto">
                {coordinators.map((coord) => (
                  <div key={coord.id} className="p-4 flex justify-between items-center hover:bg-slate-700/30 transition-colors">
                    <div>
                      <p className="text-white font-medium">{coord.name}</p>
                      <p className="text-slate-400 text-xs">{coord.country}</p>
                      <p className="text-slate-500 text-xs">Role: {coord.combined_role}</p>
                      {coord.assigned_regions?.length > 0 && (
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {coord.assigned_regions.map(region => (
                            <span key={region} className="px-1.5 py-0.5 bg-slate-700 rounded text-xs text-slate-300">{region}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${coord.status === "Active" ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
                        {coord.status}
                      </span>
                      <button
                        onClick={() => updateCoordinatorStatus(coord.id, coord.status === "Active" ? "Inactive" : "Active")}
                        className="p-1.5 bg-cyan-600/20 hover:bg-cyan-600/30 rounded-lg text-cyan-400 transition-colors"
                        title="Toggle Status"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {coordinators.length === 0 && (
                  <div className="p-8 text-center text-slate-400">
                    No coordinators assigned yet
                  </div>
                )}
              </div>

              {/* Regional Executives Section */}
              <div className="p-4 border-t border-slate-700 bg-slate-800/80">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-white font-semibold flex items-center gap-2">
                    <Crown className="w-5 h-5 text-yellow-400" />
                    Regional Executives
                  </h3>
                  <button
                    onClick={() => setShowRegionalModal(true)}
                    className="px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 rounded-lg text-white text-sm transition-colors flex items-center gap-1"
                  >
                    <UserPlus className="w-4 h-4" />
                    Assign Regional Executive
                  </button>
                </div>
                <div className="divide-y divide-slate-700 max-h-[200px] overflow-y-auto">
                  {users.filter(u => u.role === "Regional_Executive").map((exec) => (
                    <div key={exec.id} className="p-3 flex justify-between items-center hover:bg-slate-700/30 transition-colors">
                      <div>
                        <p className="text-white font-medium">{exec.full_name}</p>
                        <p className="text-slate-400 text-xs">{exec.assigned_region || "Region not assigned"}</p>
                        <p className="text-slate-500 text-xs">{exec.country || "No country"}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-1 rounded-full text-xs bg-yellow-500/20 text-yellow-400">
                          Regional Executive
                        </span>
                      </div>
                    </div>
                  ))}
                  {users.filter(u => u.role === "Regional_Executive").length === 0 && (
                    <div className="p-4 text-center text-slate-400 text-sm">
                      No regional executives assigned
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Assign Coordinator Panel */}
            <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
              <h3 className="text-white font-semibold flex items-center gap-2 mb-4">
                <UserPlus className="w-5 h-5 text-cyan-400" />
                Assign New Coordinator
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-slate-400 text-sm block mb-2">Search User</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search by name or email..."
                      value={userSearchTerm}
                      onChange={(e) => setUserSearchTerm(e.target.value)}
                      className="w-full bg-slate-700 border border-slate-600 rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 text-sm block mb-2">Select User</label>
                  <select
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                    size={Math.min(filteredEligibleUsers.length + 1, 5)}
                  >
                    <option value="">Select a user</option>
                    {filteredEligibleUsers.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.full_name} - {user.role} ({user.email})
                      </option>
                    ))}
                  </select>
                  {filteredEligibleUsers.length === 0 && (
                    <p className="text-slate-500 text-xs mt-1">
                      {userSearchTerm ? "No matching users found" : "No eligible users."}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-slate-400 text-sm block mb-2">Country</label>
                  <CountrySelect
                    value={selectedCountryCode}
                    onChange={(code, name) => {
                      setSelectedCountryCode(code);
                      setSelectedCountry(name);
                    }}
                    required
                  />
                </div>

                <button
                  onClick={handleAssignCoordinator}
                  disabled={assigning || !selectedUserId || !selectedCountry}
                  className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-700 rounded-xl text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {assigning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                  {assigning ? "Assigning..." : "Assign Coordinator"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Alerts Tab */}
        {activeTab === "alerts" && (
          <div className="space-y-4">
            <button
              onClick={() => setShowAlertModal(true)}
              className="mb-4 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-white text-sm transition-colors inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create New Alert
            </button>
            
            <div className="max-h-[600px] overflow-y-auto pr-2 space-y-3">
              {alerts.map((alert) => (
                <div key={alert.id} className={`p-4 rounded-xl border ${getAlertSeverityColor(alert.severity)}`}>
                  <div className="flex items-start gap-3">
                    {getAlertSeverityIcon(alert.severity)}
                    <div className="flex-1">
                      <div className="flex justify-between items-start flex-wrap gap-2">
                        <h4 className="text-white font-semibold">{alert.title}</h4>
                        <div className="flex gap-2">
                          <span className="text-slate-500 text-xs">{new Date(alert.created_at).toLocaleString()}</span>
                          <button
                            onClick={() => updateAlertStatus(alert.id, alert.status === "active" ? "inactive" : "active")}
                            className="p-1 hover:bg-slate-700 rounded transition-colors"
                            title={alert.status === "active" ? "Deactivate" : "Activate"}
                          >
                            {alert.status === "active" ? (
                              <CheckCircle className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <Clock className="w-4 h-4 text-yellow-400" />
                            )}
                          </button>
                          <button
                            onClick={() => deleteAlert(alert.id)}
                            className="p-1 hover:bg-slate-700 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      </div>
                      <p className="text-slate-300 text-sm mt-1">{alert.message}</p>
                      <div className="flex flex-wrap gap-3 mt-2">
                        {alert.country && (
                          <span className="inline-flex items-center gap-1 text-xs text-cyan-400">
                            <Globe className="w-3 h-3" />
                            {alert.country}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                          <Users className="w-3 h-3" />
                          Audience: {alert.audience || "all"}
                        </span>
                        <span className={`inline-flex items-center gap-1 text-xs ${
                          alert.status === "active" ? "text-emerald-400" : "text-slate-500"
                        }`}>
                          {alert.status === "active" ? "Active" : "Inactive"}
                        </span>
                        {alert.expires_at && (
                          <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                            <Clock className="w-3 h-3" />
                            Expires: {new Date(alert.expires_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {alerts.length === 0 && (
                <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-12 text-center">
                  <Bell className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400 text-lg">No alerts created</p>
                  <p className="text-slate-500 text-sm mt-2">Create your first governance alert</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Surveys Tab */}
        {activeTab === "surveys" && (
          <div className="space-y-4">
            <button
              onClick={() => setShowSurveyModal(true)}
              className="mb-4 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-white text-sm transition-colors inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create New Survey
            </button>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {surveys.map((survey) => (
                <div key={survey.id} className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6 hover:border-cyan-500/30 transition-all">
                  <div className="flex justify-between items-start mb-3">
                    <div className="px-2 py-1 bg-cyan-500/20 rounded-lg">
                      <ClipboardList className="w-4 h-4 text-cyan-400" />
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      survey.status === "Active" ? "bg-emerald-500/20 text-emerald-400" :
                      survey.status === "Draft" ? "bg-yellow-500/20 text-yellow-400" : "bg-slate-500/20 text-slate-400"
                    }`}>
                      {survey.status}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{survey.title}</h3>
                  <p className="text-slate-400 text-sm mb-4 line-clamp-2">{survey.description}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">{survey.category}</span>
                    <span className="text-cyan-400">{survey.response_count} responses</span>
                  </div>
                  <div className="flex gap-2 mt-4 pt-4 border-t border-slate-700">
                    {survey.status === "Draft" && (
                      <button
                        onClick={() => updateSurveyStatus(survey.id, "Active")}
                        className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-white text-sm transition-colors"
                      >
                        Publish
                      </button>
                    )}
                    {survey.status === "Active" && (
                      <button
                        onClick={() => updateSurveyStatus(survey.id, "Archived")}
                        className="flex-1 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg text-white text-sm transition-colors"
                      >
                        Archive
                      </button>
                    )}
                    <button
                      onClick={() => deleteSurvey(survey.id)}
                      className="flex-1 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white text-sm transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {surveys.length === 0 && (
              <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-12 text-center">
                <ClipboardList className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 text-lg">No surveys created</p>
                <p className="text-slate-500 text-sm mt-2">Create your first survey</p>
              </div>
            )}
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === "reports" && (
          <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
            <div className="p-4 border-b border-slate-700 bg-slate-800/80 flex justify-between items-center">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <FileText className="w-5 h-5 text-cyan-400" />
                Report Reviews
              </h3>
              <span className="text-slate-400 text-sm">{reports.length} reports</span>
            </div>
            <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
              <table className="w-full">
                <thead className="bg-slate-900/50 sticky top-0">
                  <tr>
                    <th className="text-left p-4 text-slate-400 text-sm font-medium">Title</th>
                    <th className="text-left p-4 text-slate-400 text-sm font-medium">Country</th>
                    <th className="text-left p-4 text-slate-400 text-sm font-medium">Period</th>
                    <th className="text-left p-4 text-slate-400 text-sm font-medium">Status</th>
                    <th className="text-left p-4 text-slate-400 text-sm font-medium">Score</th>
                    <th className="text-left p-4 text-slate-400 text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report) => (
                    <tr key={report.id} className="border-t border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                      <td className="p-4 font-medium text-white">{report.report_title}</td>
                      <td className="p-4 text-slate-300 text-sm">{report.country || "—"}</td>
                      <td className="p-4 text-slate-300 text-sm">{report.reporting_period || "—"}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          report.status === "Approved" ? "bg-emerald-500/20 text-emerald-400" :
                          report.status === "Pending" ? "bg-yellow-500/20 text-yellow-400" :
                          report.status === "Rejected" ? "bg-red-500/20 text-red-400" :
                          report.status === "Changes Requested" ? "bg-blue-500/20 text-blue-400" :
                          "bg-slate-500/20 text-slate-400"
                        }`}>
                          {report.status || "Pending"}
                        </span>
                      </td>
                      <td className="p-4">
                        {report.score ? (
                          <span className="text-cyan-400 font-bold">{report.score}%</span>
                        ) : (
                          <span className="text-slate-500 text-sm">—</span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2 flex-wrap">
                          <button
                            onClick={() => window.open(`/admin/reports/${report.id}`, "_blank")}
                            className="p-1.5 bg-slate-600/20 hover:bg-slate-600/30 rounded-lg text-slate-400 transition-colors"
                            title="View Report"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {(!report.status || report.status === "Pending") && (
                            <>
                              <button
                                onClick={() => {
                                  const score = prompt("Enter score (0-100):", "75");
                                  if (score !== null) {
                                    const numScore = parseInt(score);
                                    if (!isNaN(numScore) && numScore >= 0 && numScore <= 100) {
                                      handleReportReview(report.id, "approve", numScore);
                                    } else {
                                      alert("Please enter a valid score between 0 and 100");
                                    }
                                  }
                                }}
                                className="p-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 rounded-lg text-emerald-400 transition-colors"
                                title="Approve"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleReportReview(report.id, "reject")}
                                className="p-1.5 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-400 transition-colors"
                                title="Reject"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleReportReview(report.id, "request_changes")}
                                className="p-1.5 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg text-blue-400 transition-colors"
                                title="Request Changes"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          {report.status === "Changes Requested" && (
                            <button
                              onClick={() => {
                                const feedback = prompt("Add additional feedback:");
                                if (feedback !== null) {
                                  updateReportFeedback(report.id, feedback);
                                }
                              }}
                              className="p-1.5 bg-yellow-500/20 hover:bg-yellow-500/30 rounded-lg text-yellow-400 transition-colors"
                              title="Add Feedback"
                            >
                              <MessageSquare className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Events Tab */}
      {activeTab === "events" && (
        <div className="space-y-4">
          {/* Event Status Filter */}
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => setEventTab("all")}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                eventTab === "all" ? "bg-cyan-600 text-white" : "bg-slate-700 text-slate-400 hover:text-white"
              }`}
            >
              All ({events.length})
            </button>
            <button
              onClick={() => setEventTab("Pending")}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                eventTab === "Pending" ? "bg-yellow-600 text-white" : "bg-slate-700 text-slate-400 hover:text-white"
              }`}
            >
              Pending ({events.filter(e => e.approval_status === "Pending").length})
            </button>
            <button
              onClick={() => setEventTab("Approved")}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                eventTab === "Approved" ? "bg-emerald-600 text-white" : "bg-slate-700 text-slate-400 hover:text-white"
              }`}
            >
              Approved ({events.filter(e => e.approval_status === "Approved").length})
            </button>
            <button
              onClick={() => setEventTab("Rejected")}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                eventTab === "Rejected" ? "bg-red-600 text-white" : "bg-slate-700 text-slate-400 hover:text-white"
              }`}
            >
              Rejected ({events.filter(e => e.approval_status === "Rejected").length})
            </button>
          </div>

          {/* Events List */}
          <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
            <div className="p-4 border-b border-slate-700 bg-slate-800/80">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Calendar className="w-5 h-5 text-cyan-400" />
                Event Approvals
                <span className="text-slate-400 text-sm font-normal ml-2">
                  ({events.filter(e => eventTab === "all" || e.approval_status === eventTab).length} events)
                </span>
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-900/50">
                  <tr>
                    <th className="text-left p-4 text-slate-400 text-sm font-medium">Event</th>
                    <th className="text-left p-4 text-slate-400 text-sm font-medium">Type</th>
                    <th className="text-left p-4 text-slate-400 text-sm font-medium">Date</th>
                    <th className="text-left p-4 text-slate-400 text-sm font-medium">Created By</th>
                    <th className="text-left p-4 text-slate-400 text-sm font-medium">Status</th>
                    <th className="text-left p-4 text-slate-400 text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {events
                    .filter(e => eventTab === "all" || e.approval_status === eventTab)
                    .map((event) => {
                      const statusBadge = getEventStatusBadge(event.approval_status);
                      const StatusIcon = statusBadge.icon;
                      
                      return (
                        <tr key={event.id} className="border-t border-slate-700/50 hover:bg-slate-700/30">
                          <td className="p-4">
                            <p className="text-white font-medium">{event.title}</p>
                            <p className="text-slate-400 text-xs">{event.description?.slice(0, 50)}...</p>
                          </td>
                          <td className="p-4">
                            <span className="px-2 py-1 bg-slate-700 rounded-lg text-xs text-slate-300">
                              {event.event_type}
                            </span>
                          </td>
                          <td className="p-4 text-slate-300 text-sm">
                            {new Date(event.start_date).toLocaleDateString()}
                          </td>
                          <td className="p-4">
                            <p className="text-white text-sm">{event.created_by_name || "Unknown"}</p>
                            <p className="text-slate-400 text-xs">{event.created_by_email}</p>
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusBadge.color}`}>
                              <StatusIcon className="w-3 h-3 inline mr-1" />
                              {event.approval_status}
                            </span>
                            {event.rejected_reason && (
                              <p className="text-red-400 text-xs mt-1">Reason: {event.rejected_reason}</p>
                            )}
                          </td>
                          <td className="p-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => window.open(`/events/${event.id}`, "_blank")}
                                className="p-1.5 bg-slate-600/20 hover:bg-slate-600/30 rounded-lg text-slate-400 transition-colors"
                                title="View Event"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              {event.approval_status === "Pending" && (
                                <>
                                  <button
                                    onClick={() => handleApproveEvent(event.id)}
                                    disabled={actionLoading === event.id}
                                    className="p-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 rounded-lg text-emerald-400 transition-colors disabled:opacity-50"
                                    title="Approve"
                                  >
                                    {actionLoading === event.id ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <CheckCircle className="w-4 h-4" />
                                    )}
                                  </button>
                                  <button
                                    onClick={() => handleRejectEvent(event.id)}
                                    disabled={actionLoading === event.id}
                                    className="p-1.5 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-400 transition-colors disabled:opacity-50"
                                    title="Reject"
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                              {event.approval_status === "Rejected" && (
                                <button
                                  onClick={() => {
                                    if (confirm("Do you want to reopen this event for review?")) {
                                      // Reset to pending
                                      supabase
                                        .from("events")
                                        .update({
                                          approval_status: "Pending",
                                          rejected_reason: null,
                                        })
                                        .eq("id", event.id)
                                        .then(() => fetchEvents());
                                    }
                                  }}
                                  className="p-1.5 bg-yellow-500/20 hover:bg-yellow-500/30 rounded-lg text-yellow-400 transition-colors"
                                  title="Reopen for Review"
                                >
                                  <RefreshCw className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  {events.filter(e => eventTab === "all" || e.approval_status === eventTab).length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400">
                        <Calendar className="w-12 h-12 mx-auto mb-3 text-slate-600" />
                        <p>No events found</p>
                        <p className="text-sm mt-1">
                          {eventTab === "Pending" 
                            ? "All events have been reviewed" 
                            : eventTab === "Approved"
                            ? "No approved events yet"
                            : eventTab === "Rejected"
                            ? "No rejected events"
                            : "No events available"}
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Alert Modal */}
      {showAlertModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setShowAlertModal(false)}>
          <div className="bg-slate-800 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-700 sticky top-0 bg-slate-800">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Create Governance Alert</h2>
                <button onClick={() => setShowAlertModal(false)} className="text-slate-400 hover:text-white text-2xl">&times;</button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-slate-400 text-sm block mb-2">Title *</label>
                <input
                  type="text"
                  value={alertForm.title}
                  onChange={(e) => setAlertForm({ ...alertForm, title: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                  placeholder="Alert title"
                />
              </div>
              <div>
                <label className="text-slate-400 text-sm block mb-2">Message *</label>
                <textarea
                  value={alertForm.message}
                  onChange={(e) => setAlertForm({ ...alertForm, message: e.target.value })}
                  rows={3}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 resize-none focus:outline-none focus:border-cyan-500"
                  placeholder="Alert message"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 text-sm block mb-2">Severity</label>
                  <select
                    value={alertForm.severity}
                    onChange={(e) => setAlertForm({ ...alertForm, severity: e.target.value as any })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="high">High (Critical)</option>
                    <option value="medium">Medium (Warning)</option>
                    <option value="low">Low (Info)</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 text-sm block mb-2">Audience</label>
                  <select
                    value={alertForm.audience}
                    onChange={(e) => setAlertForm({ ...alertForm, audience: e.target.value as any })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="all">All Users</option>
                    <option value="policymakers">Policymakers</option>
                    <option value="donors">Donors</option>
                    <option value="researchers">Researchers</option>
                    <option value="coordinators">Coordinators</option>
                    <option value="cso">CSOs</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-slate-400 text-sm block mb-2">Country (Optional)</label>
                <CountrySelect
                  value={alertForm.country}
                  onChange={(code, name) => setAlertForm({ ...alertForm, country: name })}
                />
              </div>
              <div>
                <label className="text-slate-400 text-sm block mb-2">Expires At (Optional)</label>
                <input
                  type="datetime-local"
                  value={alertForm.expires_at}
                  onChange={(e) => setAlertForm({ ...alertForm, expires_at: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <button
                onClick={handleCreateAlert}
                disabled={actionLoading === "create-alert"}
                className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 rounded-xl text-white font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {actionLoading === "create-alert" ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Create Alert
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Survey Modal */}
      {showSurveyModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setShowSurveyModal(false)}>
          <div className="bg-slate-800 rounded-2xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-700">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Create Survey</h2>
                <button onClick={() => setShowSurveyModal(false)} className="text-slate-400 hover:text-white text-2xl">&times;</button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-slate-400 text-sm block mb-2">Title *</label>
                <input
                  type="text"
                  value={surveyForm.title}
                  onChange={(e) => setSurveyForm({ ...surveyForm, title: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white"
                  placeholder="Survey title"
                />
              </div>
              <div>
                <label className="text-slate-400 text-sm block mb-2">Description *</label>
                <textarea
                  value={surveyForm.description}
                  onChange={(e) => setSurveyForm({ ...surveyForm, description: e.target.value })}
                  rows={3}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white resize-none"
                  placeholder="Survey description"
                />
              </div>
              <div>
                <label className="text-slate-400 text-sm block mb-2">Category *</label>
                <select
                  value={surveyForm.category}
                  onChange={(e) => setSurveyForm({ ...surveyForm, category: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white"
                >
                  <option value="">Select Category</option>
                  <option value="Health Assessment">Health Assessment</option>
                  <option value="Community">Community</option>
                  <option value="Youth">Youth</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Governance">Governance</option>
                  <option value="Rights">Rights</option>
                </select>
              </div>
              <button
                onClick={handleCreateSurvey}
                className="w-full py-3 bg-cyan-600 hover:bg-cyan-700 rounded-xl text-white font-semibold transition-colors"
              >
                Create Survey
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Regional Executive Modal */}
      {showRegionalModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setShowRegionalModal(false)}>
          <div className="bg-slate-800 rounded-2xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-700">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Crown className="w-6 h-6 text-yellow-400" />
                  Assign Regional Executive
                </h2>
                <button onClick={() => setShowRegionalModal(false)} className="text-slate-400 hover:text-white text-2xl">&times;</button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-slate-400 text-sm block mb-2">Search User</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={regionalUserSearchTerm}
                    onChange={(e) => setRegionalUserSearchTerm(e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-yellow-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 text-sm block mb-2">Select User</label>
                <select
                  value={selectedRegionalUserId}
                  onChange={(e) => setSelectedRegionalUserId(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-yellow-500"
                  size={Math.min(filteredRegionalUsers.length + 1, 5)}
                >
                  <option value="">Select a user</option>
                  {filteredRegionalUsers.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.full_name} - {user.role} ({user.email})
                    </option>
                  ))}
                </select>
                {filteredRegionalUsers.length === 0 && (
                  <p className="text-slate-500 text-xs mt-1">
                    {regionalUserSearchTerm ? "No matching users found" : "No eligible users."}
                  </p>
                )}
              </div>

              <div>
                <label className="text-slate-400 text-sm block mb-2">Region</label>
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-yellow-500"
                >
                  <option value="">Select Region</option>
                  {regions.map(region => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 text-sm block mb-2">Country (Optional)</label>
                <CountrySelect
                  value=""
                  onChange={(code, name) => setSelectedRegionalCountry(name)}
                />
              </div>

              <button
                onClick={handleAssignRegionalExecutive}
                disabled={regionalAssigning || !selectedRegionalUserId || !selectedRegion}
                className="w-full py-2.5 bg-yellow-600 hover:bg-yellow-700 rounded-xl text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {regionalAssigning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Crown className="w-4 h-4" />}
                {regionalAssigning ? "Assigning..." : "Assign Regional Executive"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}