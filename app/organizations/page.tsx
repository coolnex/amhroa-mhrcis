"use client";

import { useState, useEffect } from "react";
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
  FileText,
  CheckCircle,
  AlertCircle,
  Eye,
  Download,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  Shield,
  Clock,
  Calendar,
  TrendingUp,
  Users,
  Award,
  ArrowRight,
  X,
  Loader2,
  HelpCircle,
} from "lucide-react";

interface Organization {
  id: string;
  organization_name: string;
  country: string;
  region: string;
  organization_type: string;
  email: string;
  phone: string;
  website?: string;
  status: "Pending" | "Approved" | "Rejected";
  submitted_at: string;
  approved_at?: string;
  member_count?: number;
  focus_areas: string[];
}

interface OrganizationFormData {
  organization_name: string;
  country: string;
  region: string;
  organization_type: string;
  email: string;
  phone: string;
  website: string;
  focus_areas: string[];
  description: string;
}

const countries = [
  "Nigeria", "Kenya", "South Africa", "Ghana", "Rwanda", "Egypt", "Morocco",
  "Ethiopia", "Tanzania", "Uganda", "Senegal", "Zambia", "DR Congo", "Somalia"
];

const regions = ["East Africa", "West Africa", "Southern Africa", "North Africa", "Central Africa", "Island States"];

const organizationTypes = [
  "Non-Governmental Organization (NGO)",
  "Community-Based Organization (CBO)",
  "Faith-Based Organization (FBO)",
  "Research Institution",
  "Academic Institution",
  "Professional Association",
  "Private Sector",
  "Government Agency",
  "International Organization",
  "Network/Coalition"
];

const focusAreasOptions = [
  "Mental Health Advocacy",
  "Service Delivery",
  "Research",
  "Training & Capacity Building",
  "Policy Reform",
  "Suicide Prevention",
  "Youth Mental Health",
  "Workplace Mental Health",
  "Community Mental Health",
  "Substance Abuse",
  "Disability Rights",
  "Human Rights"
];

// Mock data for demonstration
const mockOrganizations: Organization[] = [
  {
    id: "1",
    organization_name: "Mental Health Africa",
    country: "Nigeria",
    region: "West Africa",
    organization_type: "Non-Governmental Organization (NGO)",
    email: "info@mentalhealthafrica.org",
    phone: "+234 802 345 6789",
    website: "www.mentalhealthafrica.org",
    status: "Approved",
    submitted_at: "2024-01-15",
    approved_at: "2024-01-20",
    member_count: 245,
    focus_areas: ["Mental Health Advocacy", "Policy Reform", "Youth Mental Health"],
  },
  {
    id: "2",
    organization_name: "Kenya Mental Health Foundation",
    country: "Kenya",
    region: "East Africa",
    organization_type: "Non-Governmental Organization (NGO)",
    email: "contact@kmhf.org",
    phone: "+254 712 345 678",
    website: "www.kmhf.org",
    status: "Approved",
    submitted_at: "2024-01-10",
    approved_at: "2024-01-15",
    member_count: 189,
    focus_areas: ["Service Delivery", "Community Mental Health", "Training & Capacity Building"],
  },
  {
    id: "3",
    organization_name: "South African Depression Group",
    country: "South Africa",
    region: "Southern Africa",
    organization_type: "Community-Based Organization (CBO)",
    email: "info@sadg.org.za",
    phone: "+27 82 345 6789",
    website: "www.sadg.org.za",
    status: "Pending",
    submitted_at: "2024-03-10",
    member_count: 0,
    focus_areas: ["Mental Health Advocacy", "Suicide Prevention"],
  },
];

export default function OrganizationsPage() {
  const [activeTab, setActiveTab] = useState<"register" | "directory">("register");
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  
  const [formData, setFormData] = useState<OrganizationFormData>({
    organization_name: "",
    country: "",
    region: "",
    organization_type: "",
    email: "",
    phone: "",
    website: "",
    focus_areas: [],
    description: "",
  });

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/organizations");
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.organizations) {
          setOrganizations(data.organizations);
        } else {
          setOrganizations(mockOrganizations);
        }
      } else {
        setOrganizations(mockOrganizations);
      }
    } catch (error) {
      console.error("Error fetching organizations:", error);
      setOrganizations(mockOrganizations);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFocusAreaToggle = (area: string) => {
    setFormData(prev => ({
      ...prev,
      focus_areas: prev.focus_areas.includes(area)
        ? prev.focus_areas.filter(a => a !== area)
        : [...prev.focus_areas, area]
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const response = await fetch("/api/organizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setShowSuccess(true);
        setFormData({
          organization_name: "",
          country: "",
          region: "",
          organization_type: "",
          email: "",
          phone: "",
          website: "",
          focus_areas: [],
          description: "",
        });
        setTimeout(() => setShowSuccess(false), 5000);
        fetchOrganizations();
      } else {
        alert(data.message || "Registration failed. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredOrganizations = organizations.filter(org => {
    const matchesSearch = org.organization_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         org.country.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCountry = selectedCountry === "all" || org.country === selectedCountry;
    const matchesType = selectedType === "all" || org.organization_type === selectedType;
    const matchesStatus = selectedStatus === "all" || org.status === selectedStatus;
    return matchesSearch && matchesCountry && matchesType && matchesStatus;
  });

  const stats = {
    total: organizations.length,
    approved: organizations.filter(o => o.status === "Approved").length,
    pending: organizations.filter(o => o.status === "Pending").length,
    totalMembers: organizations.reduce((acc, o) => acc + (o.member_count || 0), 0),
  };

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
                    CIVIL SOCIETY DIRECTORY
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Building2 className="w-4 h-4 text-cyan-400" />
                  <span className="text-slate-400 text-xs">Partner Organizations</span>
                </div>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Organization Registration & Directory
              </h1>
              <p className="text-slate-300 text-base md:text-lg mt-3 max-w-2xl">
                Register your organization to join the continental mental health reform movement.
              </p>
            </div>

            <button
              onClick={fetchOrganizations}
              className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-600 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="text-sm hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-8 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="w-4 h-4 text-cyan-400" />
              <p className="text-slate-400 text-xs">Total Organizations</p>
            </div>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </div>
          <div className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/20">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <p className="text-emerald-400 text-xs">Approved</p>
            </div>
            <p className="text-2xl font-bold text-emerald-400">{stats.approved}</p>
          </div>
          <div className="bg-yellow-500/10 rounded-xl p-4 border border-yellow-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-yellow-400" />
              <p className="text-yellow-400 text-xs">Pending Approval</p>
            </div>
            <p className="text-2xl font-bold text-yellow-400">{stats.pending}</p>
          </div>
          <div className="bg-purple-500/10 rounded-xl p-4 border border-purple-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-purple-400" />
              <p className="text-purple-400 text-xs">Total Members</p>
            </div>
            <p className="text-2xl font-bold text-purple-400">{stats.totalMembers.toLocaleString()}</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-700 pb-4">
          <button
            onClick={() => setActiveTab("register")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === "register"
                ? "bg-cyan-600 text-white"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Building2 className="w-4 h-4" />
            Register Organization
          </button>
          <button
            onClick={() => setActiveTab("directory")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === "directory"
                ? "bg-cyan-600 text-white"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Globe className="w-4 h-4" />
            Organization Directory
          </button>
        </div>

        {/* Registration Form Tab */}
        {activeTab === "register" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
                <h2 className="text-2xl font-bold text-white mb-6">Register Your Organization</h2>
                
                {showSuccess && (
                  <div className="mb-6 p-4 bg-emerald-500/20 border border-emerald-500/30 rounded-xl flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                    <div>
                      <p className="text-emerald-400 font-semibold">Registration Submitted Successfully!</p>
                      <p className="text-slate-300 text-sm">Your organization has been registered and is pending admin approval.</p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="text-slate-400 text-sm mb-2 block">Organization Name *</label>
                    <input
                      type="text"
                      name="organization_name"
                      value={formData.organization_name}
                      onChange={handleChange}
                      required
                      placeholder="Enter full organization name"
                      className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-slate-400 text-sm mb-2 block">Country *</label>
                      <select
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        required
                        className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                      >
                        <option value="">Select Country</option>
                        {countries.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-slate-400 text-sm mb-2 block">Region *</label>
                      <select
                        name="region"
                        value={formData.region}
                        onChange={handleChange}
                        required
                        className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                      >
                        <option value="">Select Region</option>
                        {regions.map(r => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-400 text-sm mb-2 block">Organization Type *</label>
                    <select
                      name="organization_type"
                      value={formData.organization_type}
                      onChange={handleChange}
                      required
                      className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                    >
                      <option value="">Select Type</option>
                      {organizationTypes.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-slate-400 text-sm mb-2 block">Email *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="contact@organization.org"
                        className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 text-sm mb-2 block">Phone *</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        placeholder="+123 456 7890"
                        className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-400 text-sm mb-2 block">Website (Optional)</label>
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      placeholder="https://www.organization.org"
                      className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 text-sm mb-2 block">Focus Areas *</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {focusAreasOptions.map(area => (
                        <label key={area} className="flex items-center gap-2 p-2 bg-slate-700/50 rounded-lg cursor-pointer hover:bg-slate-700 transition-colors">
                          <input
                            type="checkbox"
                            checked={formData.focus_areas.includes(area)}
                            onChange={() => handleFocusAreaToggle(area)}
                            className="w-4 h-4 accent-cyan-500"
                          />
                          <span className="text-slate-300 text-sm">{area}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-400 text-sm mb-2 block">Organization Description *</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      required
                      rows={4}
                      placeholder="Describe your organization's mission, activities, and mental health focus..."
                      className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 rounded-xl text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Building2 className="w-4 h-4" />
                        Register Organization
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            <div className="bg-gradient-to-br from-cyan-600/10 to-blue-600/10 rounded-2xl border border-cyan-500/20 p-6 h-fit">
              <div className="flex items-center gap-2 mb-4">
                <HelpCircle className="w-5 h-5 text-cyan-400" />
                <h3 className="text-white font-semibold">Registration Benefits</h3>
              </div>
              <div className="space-y-4 text-sm">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5" />
                  <span className="text-slate-300">Access to continental funding opportunities</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5" />
                  <span className="text-slate-300">Collaboration with partner organizations</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5" />
                  <span className="text-slate-300">Publish reports and research findings</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5" />
                  <span className="text-slate-300">Participate in continental events</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5" />
                  <span className="text-slate-300">Access to AI-powered policy recommendations</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Organization Directory Tab */}
        {activeTab === "directory" && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by name or country..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="all">All Countries</option>
                {countries.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="all">All Types</option>
                {organizationTypes.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="all">All Status</option>
                <option value="Approved">Approved</option>
                <option value="Pending">Pending</option>
              </select>
            </div>

            {/* Organizations Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredOrganizations.map((org) => (
                <div
                  key={org.id}
                  className="bg-slate-800/50 rounded-2xl border border-slate-700 hover:border-cyan-500/30 transition-all overflow-hidden cursor-pointer"
                  onClick={() => setSelectedOrg(org)}
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <div className="p-2 bg-cyan-500/20 rounded-lg">
                        <Building2 className="w-6 h-6 text-cyan-400" />
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        org.status === "Approved" ? "bg-emerald-500/20 text-emerald-400" : "bg-yellow-500/20 text-yellow-400"
                      }`}>
                        {org.status}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-bold text-white mb-1">{org.organization_name}</h3>
                    <p className="text-slate-400 text-sm flex items-center gap-1 mb-3">
                      <MapPin className="w-3 h-3" />
                      {org.country}, {org.region}
                    </p>
                    
                    <div className="flex flex-wrap gap-1 mb-4">
                      {org.focus_areas.slice(0, 2).map((area, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-slate-700 rounded-full text-xs text-slate-300">
                          {area}
                        </span>
                      ))}
                      {org.focus_areas.length > 2 && (
                        <span className="px-2 py-0.5 bg-slate-700 rounded-full text-xs text-slate-300">
                          +{org.focus_areas.length - 2}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between pt-3 border-t border-slate-700">
                      <div className="flex items-center gap-2">
                        <Mail className="w-3 h-3 text-slate-500" />
                        <span className="text-slate-400 text-xs truncate max-w-[150px]">{org.email}</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-500" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {filteredOrganizations.length === 0 && (
              <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-12 text-center">
                <Building2 className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 text-lg">No organizations found</p>
                <p className="text-slate-500 text-sm mt-2">Try adjusting your filters</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Organization Detail Modal */}
      {selectedOrg && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setSelectedOrg(null)}>
          <div className="bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-700">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-cyan-500/20 rounded-xl">
                    <Building2 className="w-8 h-8 text-cyan-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">{selectedOrg.organization_name}</h2>
                    <p className="text-slate-400 text-sm">{selectedOrg.organization_type}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedOrg(null)} className="text-slate-400 hover:text-white text-2xl">&times;</button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-700/30 rounded-lg p-3">
                  <p className="text-slate-400 text-xs">Country</p>
                  <p className="text-white font-medium">{selectedOrg.country}</p>
                </div>
                <div className="bg-slate-700/30 rounded-lg p-3">
                  <p className="text-slate-400 text-xs">Region</p>
                  <p className="text-white font-medium">{selectedOrg.region}</p>
                </div>
                <div className="bg-slate-700/30 rounded-lg p-3">
                  <p className="text-slate-400 text-xs">Email</p>
                  <p className="text-white text-sm">{selectedOrg.email}</p>
                </div>
                <div className="bg-slate-700/30 rounded-lg p-3">
                  <p className="text-slate-400 text-xs">Phone</p>
                  <p className="text-white">{selectedOrg.phone}</p>
                </div>
              </div>

              <div className="bg-slate-700/30 rounded-lg p-4">
                <p className="text-white text-sm font-semibold mb-2">Focus Areas</p>
                <div className="flex flex-wrap gap-2">
                  {selectedOrg.focus_areas.map((area, idx) => (
                    <span key={idx} className="px-2 py-1 bg-cyan-500/20 rounded-lg text-cyan-300 text-xs">{area}</span>
                  ))}
                </div>
              </div>

              {selectedOrg.website && (
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <p className="text-white text-sm font-semibold mb-2">Website</p>
                  <a href={`https://${selectedOrg.website}`} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline text-sm">
                    {selectedOrg.website}
                  </a>
                </div>
              )}

              <div className="flex justify-between items-center pt-4 border-t border-slate-700">
                <div>
                  <p className="text-slate-500 text-xs">Submitted</p>
                  <p className="text-white text-sm">{new Date(selectedOrg.submitted_at).toLocaleDateString()}</p>
                </div>
                {selectedOrg.approved_at && (
                  <div>
                    <p className="text-slate-500 text-xs">Approved</p>
                    <p className="text-white text-sm">{new Date(selectedOrg.approved_at).toLocaleDateString()}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}