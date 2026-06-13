"use client";

import { supabase } from "@/lib/supabase";
import bcrypt from "bcryptjs";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  TrendingUp,
  Bell,
  Settings,
  Download,
  Filter,
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
} from "lucide-react";

interface User {
  id: string;
  full_name: string;
  email: string;
  role: string;
  status: "Approved" | "Pending" | "Rejected";
  created_at: string;
  country?: string;
  organization?: string;
}

interface Organization {
  id: string;
  organization_name: string;
  country: string;
  organization_type: string;
  email: string;
  status: "Approved" | "Pending" | "Rejected";
  created_at: string;
}

interface Coordinator {
  id: string;
  name: string;
  country: string;
  assigned_regions: string[];
  status: "Active" | "Inactive";
  created_at: string;
}

interface Alert {
  id: string;
  type: "warning" | "critical" | "info";
  title: string;
  message: string;
  severity: string;
  status: string;
  country?: string;
  created_at: string;
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

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [adminUser, setAdminUser] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [coordinators, setCoordinators] = useState<Coordinator[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
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
  const [activeTab, setActiveTab] = useState<"users" | "organizations" | "coordinators" | "alerts" | "reports">("users");
  const [activityFeed, setActivityFeed] = useState<any[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
    checkAuth();
    checkAdmin();
  }, 100);
  return () => clearTimeout(timer);
  }, []);

  const checkAdmin = async () => {
    try {
      // Check localStorage first
      const userStr = localStorage.getItem("user");
      const token = localStorage.getItem("token");

      if (!userStr || !token) {
        router.push("/login");
        return;
      }

      const userData = JSON.parse(userStr);
      
      if (userData.role !== "Admin") {
        router.push("/dashboard");
        return;
      }

      if (userData.status !== "Approved") {
        router.push("/login?message=Account pending approval");
        return;
      }

      setAdminUser(userData);
      await fetchAllData();
    } catch (error) {
      console.error("Admin check error:", error);
      router.push("/login");
    } finally {
      setLoading(false);
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
      ]);
      await fetchActivityFeed();
    } catch (error) {
      console.error("Error fetching data:", error);
      setErrorMessage("Failed to load some data. Please refresh.");
    } finally {
      setLoading(false);
    }
  };

  const resetUserPassword = async (userId: string, userEmail: string) => {
    const newPassword = prompt(`Enter new password for ${userEmail}:`);
    
    if (!newPassword || newPassword.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    try {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      const { error } = await supabase
        .from("users")
        .update({ password_hash: hashedPassword })
        .eq("id", userId);

      if (error) throw error;
      
      alert(`Password reset successful for ${userEmail}`);
    } catch (error) {
      console.error("Error resetting password:", error);
      alert("Failed to reset password");
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

  const fetchOrganizations = async () => {
    const { data, error } = await supabase
      .from("organizations")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setOrganizations(data);
    }
  };

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setUsers(data);
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
      target: o.organization_name,
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

  const approveUser = async (userId: string) => {
    setActionLoading(userId);
    setErrorMessage(null);
    
    try {
      const { error } = await supabase
        .from("users")
        .update({ 
          status: "Approved",
          updated_at: new Date().toISOString()
        })
        .eq("id", userId);

      if (error) throw error;
      
      await fetchUsers();
      await fetchActivityFeed();
      alert("User approved successfully!");
    } catch (err) {
      console.error("Error in approveUser:", err);
      setErrorMessage("An unexpected error occurred");
      alert("Failed to approve user");
    } finally {
      setActionLoading(null);
    }
  };

  const rejectUser = async (userId: string) => {
    setActionLoading(userId);
    setErrorMessage(null);
    
    try {
      const { error } = await supabase
        .from("users")
        .update({ 
          status: "Rejected",
          updated_at: new Date().toISOString()
        })
        .eq("id", userId);

      if (error) throw error;
      
      await fetchUsers();
      alert("User rejected successfully!");
    } catch (err) {
      console.error("Error in rejectUser:", err);
      setErrorMessage("An unexpected error occurred");
      alert("Failed to reject user");
    } finally {
      setActionLoading(null);
    }
  };

  const approveOrganization = async (orgId: string) => {
    setActionLoading(orgId);
    
    try {
      const { error } = await supabase
        .from("organizations")
        .update({ 
          status: "Approved",
          approved_at: new Date().toISOString()
        })
        .eq("id", orgId);

      if (error) throw error;
      
      await fetchOrganizations();
      alert("Organization approved successfully!");
    } catch (err) {
      console.error("Error in approveOrganization:", err);
      alert("Failed to approve organization");
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
      console.error("Error in updateCoordinatorStatus:", err);
      alert("Failed to update coordinator status");
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
      console.error("Error in updateReportStatus:", err);
      alert("Failed to update report status");
    } finally {
      setActionLoading(null);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
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
  };

  const checkAuth = () => {
    try {
      console.log("Checking admin auth...");
      
      // Get from localStorage
      const userStr = localStorage.getItem("user");
      const token = localStorage.getItem("token");

      console.log("localStorage user:", userStr);
      console.log("localStorage token:", token ? "exists" : "missing");

      if (!userStr || !token) {
        console.log("No user/token found, redirecting to login");
        router.push("/login");
        return;
      }

      const userData = JSON.parse(userStr);
      console.log("User role:", userData.role);
      console.log("User status:", userData.status);

      if (userData.role !== "Admin") {
        console.log("Not admin role, redirecting to dashboard");
        router.push("/dashboard");
        return;
      }

      if (userData.status !== "Approved") {
        console.log("Account not approved, redirecting to login");
        router.push("/login?message=Account pending approval");
        return;
      }

      console.log("Admin authenticated successfully");
      setUser(userData);
    } catch (error) {
      console.error("Admin auth error:", error);
      router.push("/login");
    } finally {
      setLoading(false);
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

  if (!user) {
    return null;
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
            <div className="p-7-screen bg-gradient-to-br from-slate-900 to-slate-800 p-7">
                <h1 className="text-3xl font-bold text-white mb-4">Admin Dashboard</h1>
                <p className="text-slate-400">Welcome, {user.full_name}!</p>
                <p className="text-slate-400">Role: {user.role}</p>
                <p className="text-slate-400">Status: {user.status}</p>
                <div className="flex gap-3">
                  <button onClick={() => fetchAllData()} className="mt-4 px-4 py-2 bg-blue-600 rounded-lg text-white">
                  <RefreshCw className="w-4 h-4" />
                  <span className="text-sm hidden sm:inline">Refresh</span>
                  </button>
                  <button 
                    onClick={() => {
                      localStorage.removeItem("token");
                      localStorage.removeItem("user");
                      router.push("/login");
                    }}
                    className="mt-4 px-4 py-2 bg-red-600 rounded-lg text-white"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-8 py-6">
        {/* Error Message */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 text-sm">
            {errorMessage}
          </div>
        )}

        {/* KPI Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-9 gap-4 mb-8">
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
              <Award className="w-4 h-4 text-blue-400" />
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
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-700 pb-4">
          <button
            onClick={() => setActiveTab("users")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "users" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800"}`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            User Management
            {stats.pendingUsers > 0 && <span className="ml-2 px-1.5 py-0.5 bg-yellow-500 text-white text-xs rounded-full">{stats.pendingUsers}</span>}
          </button>
          <button
            onClick={() => setActiveTab("organizations")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "organizations" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800"}`}
          >
            <Building2 className="w-4 h-4 inline mr-2" />
            Organization Approvals
            {stats.pendingOrganizations > 0 && <span className="ml-2 px-1.5 py-0.5 bg-yellow-500 text-white text-xs rounded-full">{stats.pendingOrganizations}</span>}
          </button>
          <button
            onClick={() => setActiveTab("coordinators")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "coordinators" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800"}`}
          >
            <Flag className="w-4 h-4 inline mr-2" />
            Coordinator Assignments
          </button>
          <button
            onClick={() => setActiveTab("reports")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "reports" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800"}`}
          >
            <FileText className="w-4 h-4 inline mr-2" />
            Report Reviews
            {stats.pendingReports > 0 && <span className="ml-2 px-1.5 py-0.5 bg-yellow-500 text-white text-xs rounded-full">{stats.pendingReports}</span>}
          </button>
          <button
            onClick={() => setActiveTab("alerts")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "alerts" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800"}`}
          >
            <Bell className="w-4 h-4 inline mr-2" />
            Governance Alerts
            {stats.criticalAlerts > 0 && <span className="ml-2 px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">{stats.criticalAlerts}</span>}
          </button>
        </div>

        {/* Search and Filters for Users */}
        {activeTab === "users" && (
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="all">All Roles</option>
              <option value="Policymaker">Policymaker</option>
              <option value="Researcher">Researcher</option>
              <option value="CSO">CSO/NGO</option>
              <option value="Coordinator">Coordinator</option>
              <option value="Donor">Donor</option>
              <option value="Admin">Admin</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="all">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        )}

        {/* Users Table */}
        {activeTab === "users" && (
          <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
            <div className="p-4 border-b border-slate-700 bg-slate-800/80">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Users className="w-5 h-5 text-cyan-400" />
                User Registry
                <span className="text-slate-400 text-sm font-normal ml-2">({filteredUsers.length} users)</span>
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
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
                    <tr key={u.id} className="border-t border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                      <td className="p-4">
                        <div>
                          <p className="text-white font-medium">{u.full_name}</p>
                          <p className="text-slate-400 text-xs">{u.email}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-1 bg-slate-700 rounded-lg text-xs text-slate-300">{u.role}</span>
                      </td>
                      <td className="p-4 text-slate-300 text-sm">{u.country || "—"}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          u.status === "Approved" ? "bg-emerald-500/20 text-emerald-400" :
                          u.status === "Pending" ? "bg-yellow-500/20 text-yellow-400" :
                          "bg-red-500/20 text-red-400"
                        }`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="p-4 text-slate-400 text-sm">{new Date(u.created_at).toLocaleDateString()}</td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => resetUserPassword(u.id, u.email)}
                            className="p-1.5 bg-yellow-500/20 hover:bg-yellow-500/30 rounded-lg text-yellow-400 transition-colors"
                            title="Reset Password"
                          >
                            <Key className="w-4 h-4" />
                          </button>
                          {u.status === "Pending" && (
                            <>
                              <button
                                onClick={() => approveUser(u.id)}
                                disabled={actionLoading === u.id}
                                className="p-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 rounded-lg text-emerald-400 transition-colors disabled:opacity-50"
                                title="Approve"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => rejectUser(u.id)}
                                disabled={actionLoading === u.id}
                                className="p-1.5 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-400 transition-colors disabled:opacity-50"
                                title="Reject"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          <button className="p-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-400 transition-colors">
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Organizations Table */}
        {activeTab === "organizations" && (
          <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
            <div className="p-4 border-b border-slate-700 bg-slate-800/80">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Building2 className="w-5 h-5 text-cyan-400" />
                Organization Approvals
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
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
                    <tr key={org.id} className="border-t border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                      <td className="p-4 font-medium text-white">{org.organization_name}</td>
                      <td className="p-4 text-slate-300 text-sm">{org.organization_type}</td>
                      <td className="p-4 text-slate-300 text-sm">{org.country}</td>
                      <td className="p-4 text-slate-300 text-sm">{org.email}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          org.status === "Approved" ? "bg-emerald-500/20 text-emerald-400" :
                          org.status === "Pending" ? "bg-yellow-500/20 text-yellow-400" :
                          "bg-red-500/20 text-red-400"
                        }`}>
                          {org.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          {org.status === "Pending" && (
                            <button
                              onClick={() => approveOrganization(org.id)}
                              className="p-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 rounded-lg text-emerald-400 transition-colors"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          <button className="p-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-400 transition-colors">
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === "reports" && (
          <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
            <div className="p-4 border-b border-slate-700 bg-slate-800/80">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <FileText className="w-5 h-5 text-cyan-400" />
                Report Reviews
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className="bg-slate-900/50">
                  <tr>
                    <th className="text-left p-4 text-slate-400 text-sm font-medium">Title</th>
                    <th className="text-left p-4 text-slate-400 text-sm font-medium">Country</th>
                    <th className="text-left p-4 text-slate-400 text-sm font-medium">Period</th>
                    <th className="text-left p-4 text-slate-400 text-sm font-medium">Status</th>
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
                          "bg-blue-500/20 text-blue-400"
                        }`}>
                          {report.status || "Pending"}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          {(!report.status || report.status === "Pending") && (
                            <>
                              <button
                                onClick={() => updateReportStatus(report.id, "Approved", 75)}
                                className="p-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 rounded-lg text-emerald-400 transition-colors"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => updateReportStatus(report.id, "Rejected")}
                                className="p-1.5 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-400 transition-colors"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          <button className="p-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-400 transition-colors">
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
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
          <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
            <h3 className="text-white font-semibold flex items-center gap-2 mb-4">
              <Flag className="w-5 h-5 text-cyan-400" />
              Country Coordinators
            </h3>
            <div className="divide-y divide-slate-700">
              {coordinators.map((coord) => (
                <div key={coord.id} className="p-4 flex justify-between items-center">
                  <div>
                    <p className="text-white font-medium">{coord.name}</p>
                    <p className="text-slate-400 text-xs">{coord.country}</p>
                    <div className="flex gap-1 mt-1">
                      {coord.assigned_regions?.map(region => (
                        <span key={region} className="px-1.5 py-0.5 bg-slate-700 rounded text-xs text-slate-300">{region}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${coord.status === "Active" ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
                      {coord.status}
                    </span>
                    <button
                      onClick={() => updateCoordinatorStatus(coord.id, coord.status === "Active" ? "Inactive" : "Active")}
                      className="p-1.5 bg-cyan-600/20 hover:bg-cyan-600/30 rounded-lg text-cyan-400 transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Alerts Tab */}
        {activeTab === "alerts" && (
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div key={alert.id} className={`p-4 rounded-xl border ${
                alert.severity === "high" || alert.type === "critical" ? "bg-red-500/10 border-red-500/30" :
                alert.severity === "medium" || alert.type === "warning" ? "bg-yellow-500/10 border-yellow-500/30" :
                "bg-blue-500/10 border-blue-500/30"
              }`}>
                <div className="flex items-start gap-3">
                  {alert.severity === "high" && <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />}
                  {alert.severity === "medium" && <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0" />}
                  {alert.severity === "low" && <Bell className="w-5 h-5 text-blue-400 flex-shrink-0" />}
                  <div className="flex-1">
                    <div className="flex justify-between items-start flex-wrap gap-2">
                      <h4 className="text-white font-semibold">{alert.title}</h4>
                      <span className="text-slate-500 text-xs">{new Date(alert.created_at).toLocaleString()}</span>
                    </div>
                    <p className="text-slate-300 text-sm mt-1">{alert.message}</p>
                    {alert.country && (
                      <span className="inline-flex items-center gap-1 mt-2 text-xs text-cyan-400">
                        <Globe className="w-3 h-3" />
                        {alert.country}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Activity Feed and System Health */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          {/* Activity Feed */}
          <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
            <div className="p-4 border-b border-slate-700 bg-slate-800/80">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Activity className="w-5 h-5 text-cyan-400" />
                Platform Activity Feed
              </h3>
            </div>
            <div className="divide-y divide-slate-700 max-h-80 overflow-y-auto">
              {activityFeed.map((activity) => (
                <div key={activity.id} className="p-3 flex items-start gap-3">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-slate-300 text-sm">
                      <span className="text-white font-medium">{activity.action}</span>
                      {" · "}{activity.target}
                    </p>
                    <p className="text-slate-500 text-xs mt-1">{new Date(activity.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* System Health */}
          <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
            <h3 className="text-white font-semibold flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-cyan-400" />
              System Health Monitoring
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">API Status</span>
                <span className="text-green-400 text-sm flex items-center gap-1"><div className="w-2 h-2 bg-green-500 rounded-full"></div> Operational</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">Database</span>
                <span className="text-green-400 text-sm flex items-center gap-1"><div className="w-2 h-2 bg-green-500 rounded-full"></div> Connected</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">Uptime</span>
                <span className="text-white text-sm font-mono">{systemHealth.uptime}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">Last Backup</span>
                <span className="text-white text-sm">{systemHealth.lastBackup}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}