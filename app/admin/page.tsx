"use client";

import { useEffect, useState } from "react";
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
}

interface GovernanceAlert {
  id: string;
  type: "warning" | "critical" | "info";
  title: string;
  message: string;
  timestamp: string;
  country?: string;
}

interface SystemHealth {
  status: "healthy" | "degraded" | "down";
  uptime: string;
  apiLatency: number;
  databaseStatus: "connected" | "disconnected";
  lastBackup: string;
}

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [coordinators, setCoordinators] = useState<Coordinator[]>([]);
  const [alerts, setAlerts] = useState<GovernanceAlert[]>([]);
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
  const [activeTab, setActiveTab] = useState<"users" | "organizations" | "coordinators" | "alerts">("users");
  const [activityFeed, setActivityFeed] = useState<any[]>([]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      window.location.href = "/login";
      return;
    }

    const parsedUser = JSON.parse(storedUser);

    if (parsedUser.role !== "Admin") {
      alert("Access denied. Admin privileges required.");
      window.location.href = "/dashboard";
      return;
    }

    setUser(parsedUser);
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([
      fetchOrganizations(),
      fetchUsers(),
      fetchCoordinators(),
      fetchGovernanceAlerts(),
      fetchActivityFeed(),
    ]);
    setLoading(false);
  };

  const fetchOrganizations = async () => {
    try {
      const response = await fetch("/api/organizations");
      const data = await response.json();
      if (data.success) {
        setOrganizations(data.organizations);
      }
    } catch (error) {
      console.error("Error fetching organizations:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users");
      const data = await response.json();
      if (data.success) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchCoordinators = async () => {
    // Mock data - replace with API call
    setCoordinators([
      { id: "1", name: "Dr. James Mwangi", country: "Kenya", assigned_regions: ["Nairobi", "Mombasa"], status: "Active" },
      { id: "2", name: "Prof. Aisha Diallo", country: "Nigeria", assigned_regions: ["Lagos", "Abuja"], status: "Active" },
      { id: "3", name: "Dr. Thabo Nkosi", country: "South Africa", assigned_regions: ["Gauteng", "Western Cape"], status: "Inactive" },
    ]);
  };

  const fetchGovernanceAlerts = async () => {
    // Mock data - replace with API call
    setAlerts([
      { id: "1", type: "critical", title: "System Implementation Gap", message: "Nigeria reporting overdue by 14 days", timestamp: "2024-03-15T10:30:00", country: "Nigeria" },
      { id: "2", type: "warning", title: "User Approval Pending", message: "15 organizations awaiting verification", timestamp: "2024-03-15T09:15:00" },
      { id: "3", type: "info", title: "AI Governance Update", message: "New continental scoring model deployed", timestamp: "2024-03-14T16:45:00" },
    ]);
  };

  const fetchActivityFeed = async () => {
    // Mock data - replace with API call
    setActivityFeed([
      { id: "1", action: "User Approved", user: "Admin", target: "John Doe (Researcher)", timestamp: "2024-03-15T11:23:00" },
      { id: "2", action: "Organization Registered", user: "CSO", target: "Mental Health Africa", timestamp: "2024-03-15T10:45:00" },
      { id: "3", action: "Report Submitted", user: "Kenya Coordinator", target: "Q1 2024 Reform Report", timestamp: "2024-03-15T09:30:00" },
      { id: "4", action: "AI Alert Triggered", user: "System", target: "Implementation gap detected - Tanzania", timestamp: "2024-03-15T08:15:00" },
    ]);
  };

  const approveUser = async (userId: string) => {
    try {
      const response = await fetch("/api/users/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (response.ok) {
        fetchUsers();
        fetchActivityFeed();
      }
    } catch (error) {
      console.error("Error approving user:", error);
    }
  };

  const rejectUser = async (userId: string) => {
    try {
      const response = await fetch("/api/users/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (response.ok) {
        fetchUsers();
      }
    } catch (error) {
      console.error("Error rejecting user:", error);
    }
  };

  const approveOrganization = async (orgId: string) => {
    try {
      const response = await fetch("/api/organizations/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId: orgId }),
      });
      if (response.ok) {
        fetchOrganizations();
      }
    } catch (error) {
      console.error("Error approving organization:", error);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
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
    criticalAlerts: alerts.filter(a => a.type === "critical").length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-300">Loading Continental Control Center...</p>
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
                Welcome back, {user?.full_name || "Administrator"} · Continental Oversight Portal
              </p>
            </div>

            <div className="flex gap-3">
              <button onClick={() => fetchAllData()} className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-600 transition-colors">
                <RefreshCw className="w-4 h-4" />
                <span className="text-sm hidden sm:inline">Refresh</span>
              </button>
              <button onClick={logout} className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 rounded-xl border border-red-500/30 text-red-400 transition-colors">
                <Shield className="w-4 h-4" />
                <span className="text-sm hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-8 py-6">
        {/* KPI Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-8">
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
              <p className="text-yellow-400 text-xs">Pending</p>
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
              <p className="text-red-400 text-xs">Alerts</p>
            </div>
            <p className="text-2xl font-bold text-red-400">{stats.criticalAlerts}</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-green-400" />
              <p className="text-slate-400 text-xs">API Latency</p>
            </div>
            <p className="text-2xl font-bold text-white">{systemHealth.apiLatency}<span className="text-xs text-slate-500">ms</span></p>
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
            onClick={() => setActiveTab("alerts")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "alerts" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800"}`}
          >
            <Bell className="w-4 h-4 inline mr-2" />
            Governance Alerts
            {stats.criticalAlerts > 0 && <span className="ml-2 px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">{stats.criticalAlerts}</span>}
          </button>
        </div>

        {/* Search and Filters */}
        {(activeTab === "users" || activeTab === "organizations") && (
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder={`Search ${activeTab === "users" ? "users" : "organizations"}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {activeTab === "users" && (
              <>
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
              </>
            )}
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
                          {u.status === "Pending" && (
                            <>
                              <button
                                onClick={() => approveUser(u.id)}
                                className="p-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 rounded-lg text-emerald-400 transition-colors"
                                title="Approve"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => rejectUser(u.id)}
                                className="p-1.5 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-400 transition-colors"
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

        {/* Coordinators Tab */}
        {activeTab === "coordinators" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
              <div className="p-4 border-b border-slate-700 bg-slate-800/80">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <Flag className="w-5 h-5 text-cyan-400" />
                  Country Coordinators
                </h3>
              </div>
              <div className="divide-y divide-slate-700">
                {coordinators.map((coord) => (
                  <div key={coord.id} className="p-4 flex justify-between items-center">
                    <div>
                      <p className="text-white font-medium">{coord.name}</p>
                      <p className="text-slate-400 text-xs">{coord.country}</p>
                      <div className="flex gap-1 mt-1">
                        {coord.assigned_regions.map(region => (
                          <span key={region} className="px-1.5 py-0.5 bg-slate-700 rounded text-xs text-slate-300">{region}</span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${coord.status === "Active" ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
                        {coord.status}
                      </span>
                      <button className="p-1.5 bg-cyan-600/20 hover:bg-cyan-600/30 rounded-lg text-cyan-400 transition-colors">
                        <Settings className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
              <h3 className="text-white font-semibold flex items-center gap-2 mb-4">
                <UserCheck className="w-5 h-5 text-cyan-400" />
                Assign New Coordinator
              </h3>
              <div className="space-y-4">
                <select className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500">
                  <option>Select Country</option>
                  <option>Nigeria</option>
                  <option>Kenya</option>
                  <option>South Africa</option>
                  <option>Ghana</option>
                </select>
                <select className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500">
                  <option>Select User</option>
                  <option>Dr. James Mwangi</option>
                  <option>Prof. Aisha Diallo</option>
                  <option>Dr. Thabo Nkosi</option>
                </select>
                <button className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-white font-medium transition-colors">
                  Assign Coordinator
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Alerts Tab */}
        {activeTab === "alerts" && (
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div key={alert.id} className={`p-4 rounded-xl border ${
                alert.type === "critical" ? "bg-red-500/10 border-red-500/30" :
                alert.type === "warning" ? "bg-yellow-500/10 border-yellow-500/30" :
                "bg-blue-500/10 border-blue-500/30"
              }`}>
                <div className="flex items-start gap-3">
                  {alert.type === "critical" && <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />}
                  {alert.type === "warning" && <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0" />}
                  {alert.type === "info" && <Bell className="w-5 h-5 text-blue-400 flex-shrink-0" />}
                  <div className="flex-1">
                    <div className="flex justify-between items-start flex-wrap gap-2">
                      <h4 className="text-white font-semibold">{alert.title}</h4>
                      <span className="text-slate-500 text-xs">{new Date(alert.timestamp).toLocaleString()}</span>
                    </div>
                    <p className="text-slate-300 text-sm mt-1">{alert.message}</p>
                    {alert.country && (
                      <span className="inline-flex items-center gap-1 mt-2 text-xs text-cyan-400">
                        <Globe className="w-3 h-3" />
                        {alert.country}
                      </span>
                    )}
                  </div>
                  <button className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors">
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Activity Feed and System Health - Bottom Row */}
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

          {/* System Health & Quick Actions */}
          <div className="space-y-6">
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

            <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
              <h3 className="text-white font-semibold flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-cyan-400" />
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <button className="p-3 bg-slate-700/50 hover:bg-slate-700 rounded-xl text-left transition-colors">
                  <Download className="w-4 h-4 text-cyan-400 mb-2" />
                  <p className="text-white text-sm">Export Report</p>
                  <p className="text-slate-500 text-xs">Full governance report</p>
                </button>
                <button className="p-3 bg-slate-700/50 hover:bg-slate-700 rounded-xl text-left transition-colors">
                  <Bell className="w-4 h-4 text-cyan-400 mb-2" />
                  <p className="text-white text-sm">Broadcast Alert</p>
                  <p className="text-slate-500 text-xs">Send to all users</p>
                </button>
                <button className="p-3 bg-slate-700/50 hover:bg-slate-700 rounded-xl text-left transition-colors">
                  <Settings className="w-4 h-4 text-cyan-400 mb-2" />
                  <p className="text-white text-sm">System Config</p>
                  <p className="text-slate-500 text-xs">Governance settings</p>
                </button>
                <button className="p-3 bg-slate-700/50 hover:bg-slate-700 rounded-xl text-left transition-colors">
                  <Calendar className="w-4 h-4 text-cyan-400 mb-2" />
                  <p className="text-white text-sm">Schedule Review</p>
                  <p className="text-slate-500 text-xs">Continental audit</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}