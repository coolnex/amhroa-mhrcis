"use client";

import { useEffect, useState } from "react";
import {
  Users,
  UserPlus,
  MapPin,
  Globe,
  Building2,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Edit,
  Trash2,
  Eye,
  Download,
  Search,
  Filter,
  Plus,
  RefreshCw,
  Award,
  Star,
  Flag,
  Shield,
  Activity,
  TrendingUp,
  MessageSquare,
  Settings,
  ChevronDown,
  ChevronUp,
  MoreVertical,
} from "lucide-react";

interface Coordinator {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  country: string;
  region: string;
  organization: string;
  status: "Active" | "Inactive" | "Pending";
  assigned_since: string;
  last_active: string;
  reports_submitted: number;
  approval_rate: number;
  avatar?: string;
}

// Mock data for demonstration
const mockCoordinators: Coordinator[] = [
  {
    id: 1,
    full_name: "Dr. James Mwangi",
    email: "james.mwangi@example.com",
    phone: "+254 712 345 678",
    country: "Kenya",
    region: "East Africa",
    organization: "Ministry of Health, Kenya",
    status: "Active",
    assigned_since: "2023-01-15",
    last_active: "2024-03-15",
    reports_submitted: 24,
    approval_rate: 92,
  },
  {
    id: 2,
    full_name: "Prof. Aisha Diallo",
    email: "aisha.diallo@example.com",
    phone: "+234 802 345 678",
    country: "Nigeria",
    region: "West Africa",
    organization: "Federal Ministry of Health",
    status: "Active",
    assigned_since: "2023-02-10",
    last_active: "2024-03-14",
    reports_submitted: 18,
    approval_rate: 88,
  },
  {
    id: 3,
    full_name: "Dr. Thabo Nkosi",
    email: "thabo.nkosi@example.com",
    phone: "+27 82 345 6789",
    country: "South Africa",
    region: "Southern Africa",
    organization: "National Department of Health",
    status: "Active",
    assigned_since: "2023-01-20",
    last_active: "2024-03-15",
    reports_submitted: 31,
    approval_rate: 95,
  },
  {
    id: 4,
    full_name: "Mariya Umuhoza",
    email: "mariya.umuhoza@example.com",
    phone: "+250 788 345 678",
    country: "Rwanda",
    region: "East Africa",
    organization: "Rwanda Biomedical Centre",
    status: "Active",
    assigned_since: "2023-03-05",
    last_active: "2024-03-13",
    reports_submitted: 22,
    approval_rate: 90,
  },
  {
    id: 5,
    full_name: "Prof. Kwame Asante",
    email: "kwame.asante@example.com",
    phone: "+233 244 345 678",
    country: "Ghana",
    region: "West Africa",
    organization: "Mental Health Authority",
    status: "Inactive",
    assigned_since: "2023-04-12",
    last_active: "2024-02-01",
    reports_submitted: 12,
    approval_rate: 75,
  },
  {
    id: 6,
    full_name: "Dr. Fatima El-Mansouri",
    email: "fatima.elm@example.com",
    phone: "+212 661 345 678",
    country: "Morocco",
    region: "North Africa",
    organization: "Ministry of Health",
    status: "Pending",
    assigned_since: "2024-01-10",
    last_active: "2024-03-10",
    reports_submitted: 5,
    approval_rate: 80,
  },
];

export default function CoordinatorsPage() {
  const [coordinators, setCoordinators] = useState<Coordinator[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [regionFilter, setRegionFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedCoordinator, setSelectedCoordinator] = useState<Coordinator | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    fetchCoordinators();
  }, []);

  const fetchCoordinators = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/coordinators");
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCoordinators(data.coordinators);
        } else {
          setCoordinators(mockCoordinators);
        }
      } else {
        setCoordinators(mockCoordinators);
      }
    } catch (error) {
      console.error("Error fetching coordinators:", error);
      setCoordinators(mockCoordinators);
    } finally {
      setLoading(false);
    }
  };

  const filteredCoordinators = coordinators.filter(coord => {
    const matchesSearch = coord.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         coord.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         coord.organization.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRegion = regionFilter === "all" || coord.region === regionFilter;
    const matchesStatus = statusFilter === "all" || coord.status === statusFilter;
    return matchesSearch && matchesRegion && matchesStatus;
  });

  const stats = {
    total: coordinators.length,
    active: coordinators.filter(c => c.status === "Active").length,
    inactive: coordinators.filter(c => c.status === "Inactive").length,
    pending: coordinators.filter(c => c.status === "Pending").length,
    avgApprovalRate: Math.round(coordinators.reduce((acc, c) => acc + c.approval_rate, 0) / coordinators.length),
    totalReports: coordinators.reduce((acc, c) => acc + c.reports_submitted, 0),
    regions: [...new Set(coordinators.map(c => c.region))].length,
  };

  const regions = ["all", ...new Set(coordinators.map(c => c.region))];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      case "Inactive": return "bg-red-500/20 text-red-400 border-red-500/30";
      case "Pending": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      default: return "bg-slate-500/20 text-slate-400";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Active": return <CheckCircle className="w-3 h-3" />;
      case "Inactive": return <XCircle className="w-3 h-3" />;
      case "Pending": return <Clock className="w-3 h-3" />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-300">Loading continental leadership data...</p>
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
                    CONTINENTAL LEADERSHIP
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Shield className="w-4 h-4 text-cyan-400" />
                  <span className="text-slate-400 text-xs">Governance Structure</span>
                </div>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Country Coordinators
              </h1>
              <p className="text-slate-300 text-base md:text-lg mt-3 max-w-2xl">
                Continental leadership and governance structure for mental health reform implementation.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-xl text-white transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                <span className="text-sm hidden sm:inline">Add Coordinator</span>
              </button>
              <button
                onClick={fetchCoordinators}
                className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-600 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="text-sm hidden sm:inline">Refresh</span>
              </button>
              <button className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-600 transition-colors">
                <Download className="w-4 h-4" />
                <span className="text-sm hidden sm:inline">Export</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-8 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-cyan-400" />
              <p className="text-slate-400 text-xs">Total Coordinators</p>
            </div>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </div>
          <div className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/20">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <p className="text-emerald-400 text-xs">Active</p>
            </div>
            <p className="text-2xl font-bold text-emerald-400">{stats.active}</p>
          </div>
          <div className="bg-red-500/10 rounded-xl p-4 border border-red-500/20">
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="w-4 h-4 text-red-400" />
              <p className="text-red-400 text-xs">Inactive</p>
            </div>
            <p className="text-2xl font-bold text-red-400">{stats.inactive}</p>
          </div>
          <div className="bg-yellow-500/10 rounded-xl p-4 border border-yellow-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-yellow-400" />
              <p className="text-yellow-400 text-xs">Pending</p>
            </div>
            <p className="text-2xl font-bold text-yellow-400">{stats.pending}</p>
          </div>
          <div className="bg-purple-500/10 rounded-xl p-4 border border-purple-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-4 h-4 text-purple-400" />
              <p className="text-purple-400 text-xs">Avg Approval Rate</p>
            </div>
            <p className="text-2xl font-bold text-purple-400">{stats.avgApprovalRate}%</p>
          </div>
          <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Flag className="w-4 h-4 text-blue-400" />
              <p className="text-blue-400 text-xs">Regions Covered</p>
            </div>
            <p className="text-2xl font-bold text-blue-400">{stats.regions}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, country, or organization..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Regions</option>
            {regions.filter(r => r !== "all").map(region => (
              <option key={region} value={region}>{region}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Pending">Pending</option>
          </select>
        </div>

        {/* Coordinators Grid/Table */}
        <div className="bg-slate-800/50 rounded-2xl border border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-slate-900/50">
                <tr>
                  <th className="text-left p-4 text-slate-400 text-sm font-medium">Coordinator</th>
                  <th className="text-left p-4 text-slate-400 text-sm font-medium">Location</th>
                  <th className="text-left p-4 text-slate-400 text-sm font-medium">Organization</th>
                  <th className="text-left p-4 text-slate-400 text-sm font-medium">Performance</th>
                  <th className="text-left p-4 text-slate-400 text-sm font-medium">Status</th>
                  <th className="text-left p-4 text-slate-400 text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCoordinators.map((coord) => (
                  <tr
                    key={coord.id}
                    className="border-t border-slate-700/50 hover:bg-slate-700/30 transition-colors cursor-pointer"
                    onClick={() => setExpandedId(expandedId === coord.id ? null : coord.id)}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center">
                          <span className="text-white font-bold text-sm">
                            {coord.full_name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <p className="text-white font-medium">{coord.full_name}</p>
                          <p className="text-slate-400 text-xs flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {coord.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="text-white text-sm flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-cyan-400" />
                          {coord.country}
                        </p>
                        <p className="text-slate-400 text-xs">{coord.region}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="text-white text-sm flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-cyan-400" />
                          {coord.organization}
                        </p>
                        <p className="text-slate-400 text-xs">
                          Since {new Date(coord.assigned_since).toLocaleDateString()}
                        </p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-400">Reports: {coord.reports_submitted}</span>
                          <span className="text-cyan-400">{coord.approval_rate}%</span>
                        </div>
                        <div className="w-24 bg-slate-700 rounded-full h-1.5">
                          <div className="bg-cyan-500 h-1.5 rounded-full" style={{ width: `${coord.approval_rate}%` }}></div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getStatusColor(coord.status)}`}>
                        {getStatusIcon(coord.status)}
                        {coord.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                        <button className="p-1.5 hover:bg-slate-600 rounded-lg transition-colors" title="View Details">
                          <Eye className="w-4 h-4 text-slate-400" />
                        </button>
                        <button className="p-1.5 hover:bg-slate-600 rounded-lg transition-colors" title="Edit">
                          <Edit className="w-4 h-4 text-slate-400" />
                        </button>
                        <button className="p-1.5 hover:bg-slate-600 rounded-lg transition-colors" title="Message">
                          <MessageSquare className="w-4 h-4 text-slate-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {filteredCoordinators.length === 0 && (
            <div className="p-12 text-center">
              <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 text-lg">No coordinators found</p>
              <p className="text-slate-500 text-sm mt-2">Try adjusting your filters or add a new coordinator</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-4 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-xl text-white transition-colors inline-flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                Add Coordinator
              </button>
            </div>
          )}
        </div>

        {/* Expanded Details Panel */}
        {expandedId && (
          <div className="mt-6 bg-slate-800/50 rounded-2xl border border-slate-700 overflow-hidden">
            {coordinators.filter(c => c.id === expandedId).map(coord => (
              <div key={coord.id} className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center">
                      <span className="text-white text-2xl font-bold">
                        {coord.full_name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">{coord.full_name}</h3>
                      <p className="text-slate-400">{coord.organization}</p>
                    </div>
                  </div>
                  <button onClick={() => setExpandedId(null)} className="text-slate-400 hover:text-white">✕</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                  <div className="bg-slate-700/30 rounded-xl p-4">
                    <p className="text-slate-400 text-sm">Contact Information</p>
                    <p className="text-white mt-2 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-cyan-400" />
                      {coord.email}
                    </p>
                    <p className="text-white mt-1 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-cyan-400" />
                      {coord.phone}
                    </p>
                  </div>
                  <div className="bg-slate-700/30 rounded-xl p-4">
                    <p className="text-slate-400 text-sm">Assignment Details</p>
                    <p className="text-white mt-2">Assigned: {new Date(coord.assigned_since).toLocaleDateString()}</p>
                    <p className="text-white mt-1">Last Active: {new Date(coord.last_active).toLocaleDateString()}</p>
                  </div>
                  <div className="bg-slate-700/30 rounded-xl p-4">
                    <p className="text-slate-400 text-sm">Performance Metrics</p>
                    <p className="text-2xl font-bold text-white mt-2">{coord.reports_submitted}</p>
                    <p className="text-slate-400 text-sm">Reports Submitted</p>
                  </div>
                  <div className="bg-slate-700/30 rounded-xl p-4">
                    <p className="text-slate-400 text-sm">Approval Rate</p>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex-1 bg-slate-600 rounded-full h-3">
                        <div className="bg-cyan-500 h-3 rounded-full" style={{ width: `${coord.approval_rate}%` }}></div>
                      </div>
                      <span className="text-white font-bold">{coord.approval_rate}%</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-white transition-colors flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Send Message
                  </button>
                  <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white transition-colors flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    View Activity
                  </button>
                  <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white transition-colors flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Performance Report
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Coordinator Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setShowAddModal(false)}>
          <div className="bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-700">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Add New Coordinator</h2>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white text-2xl">&times;</button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 text-sm block mb-2">Full Name</label>
                  <input type="text" className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white" placeholder="Enter full name" />
                </div>
                <div>
                  <label className="text-slate-400 text-sm block mb-2">Email</label>
                  <input type="email" className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white" placeholder="Enter email" />
                </div>
                <div>
                  <label className="text-slate-400 text-sm block mb-2">Phone</label>
                  <input type="tel" className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white" placeholder="Enter phone number" />
                </div>
                <div>
                  <label className="text-slate-400 text-sm block mb-2">Country</label>
                  <input type="text" className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white" placeholder="Enter country" />
                </div>
                <div>
                  <label className="text-slate-400 text-sm block mb-2">Region</label>
                  <select className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white">
                    <option>East Africa</option>
                    <option>West Africa</option>
                    <option>Southern Africa</option>
                    <option>North Africa</option>
                    <option>Central Africa</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 text-sm block mb-2">Organization</label>
                  <input type="text" className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white" placeholder="Enter organization" />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button className="flex-1 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-white transition-colors">Add Coordinator</button>
                <button onClick={() => setShowAddModal(false)} className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white transition-colors">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}