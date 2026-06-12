"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Globe,
  Heart,
  Target,
  TrendingUp,
  Award,
  Users,
  FileText,
  Calendar,
  MapPin,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Facebook,
  Twitter,
  Linkedin,
  Mail,
  Phone,
  MapPin as MapPinIcon,
  Clock,
  ChevronRight,
  Star,
  BookOpen,
  Video,
  Newspaper,
  Download,
  Search,
  Menu,
  X,
  Eye,
} from "lucide-react";

// Mock data - would come from API
const stats = {
  countries: 54,
  reforms: 32,
  organizations: 245,
  reports: 128,
};

const featuredReports = [
  { id: 1, title: "State of Mental Health Reform in Africa 2024", date: "March 2024", downloads: 1245, category: "Flagship Report" },
  { id: 2, title: "SDG 3.4 Implementation Progress Report", date: "February 2024", downloads: 892, category: "Policy Brief" },
  { id: 3, title: "Workforce Capacity Assessment", date: "January 2024", downloads: 567, category: "Research Paper" },
];

const upcomingEvents = [
  { id: 1, title: "African Mental Health Leadership Summit", date: "June 15-17, 2024", location: "Nairobi, Kenya", type: "Summit" },
  { id: 2, title: "Policy Makers Workshop: Implementation Strategies", date: "July 22-24, 2024", location: "Accra, Ghana", type: "Workshop" },
  { id: 3, title: "CSO Coalition Meeting", date: "August 5, 2024", location: "Virtual", type: "Webinar" },
];

const successStories = [
  { id: 1, country: "Rwanda", title: "Community Mental Health Integration", impact: "85% increase in service access", image: "/stories/rwanda.jpg" },
  { id: 2, country: "Kenya", title: "County-Level Reform Acceleration", impact: "47 counties implementing new policies", image: "/stories/kenya.jpg" },
  { id: 3, country: "South Africa", title: "Workforce Expansion Program", impact: "500+ new mental health workers trained", image: "/stories/southafrica.jpg" },
];

const resources = [
  { id: 1, title: "Mental Health Policy Toolkit", type: "Guide", icon: BookOpen },
  { id: 2, title: "Advocacy Training Videos", type: "Video Series", icon: Video },
  { id: 3, title: "Annual Report 2023", type: "Report", icon: FileText },
  { id: 4, title: "Reform Implementation Framework", type: "Framework", icon: Target },
];

const faqs = [
  { q: "What is AMHROA?", a: "The African Mental Health Reform Organization Africa (AMHROA) is a continental body dedicated to advancing mental health reform across African nations." },
  { q: "How can my organization get involved?", a: "Organizations can register through our CSO portal to access funding opportunities, collaborate on advocacy campaigns, and participate in continental events." },
  { q: "What countries are covered?", a: "AMHROA covers all 54 African Union member states, with active reform tracking and technical assistance programs." },
  { q: "How can I access reports?", a: "All public reports are available for free download in our knowledge repository. Create a free account for enhanced access." },
];

export default function PublicPortal() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [emailSignup, setEmailSignup] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      const sections = ["home", "about", "reports", "events", "resources", "contact"];
      const scrollPosition = window.scrollY + 100;
      
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const offsetTop = element.offsetTop;
          const offsetHeight = element.offsetHeight;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNewsletterSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    // API call would go here
    alert("Thank you for subscribing! You'll receive our latest updates.");
    setEmailSignup("");
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setMobileMenuOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => scrollToSection("home")}>
              <div className="inline-flex items-center gap-2 bg-transparent px-4 py-2 rounded-full mb-6">
                <Image
                  src="/logo.png"
                  alt="AMHROA Logo"
                  width={80}
                  height={80}
                  className="object-contain"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                  AMHROA
                </h1>
                <p className="text-xs text-slate-500">African Mental Health Reform</p>
              </div>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              <button onClick={() => scrollToSection("home")} className={`text-slate-600 hover:text-cyan-600 transition-colors ${activeSection === "home" ? "text-cyan-600 font-semibold" : ""}`}>Home</button>
              <button onClick={() => scrollToSection("about")} className={`text-slate-600 hover:text-cyan-600 transition-colors ${activeSection === "about" ? "text-cyan-600 font-semibold" : ""}`}>About</button>
              <button onClick={() => scrollToSection("reports")} className={`text-slate-600 hover:text-cyan-600 transition-colors ${activeSection === "reports" ? "text-cyan-600 font-semibold" : ""}`}>Reports</button>
              <button onClick={() => scrollToSection("events")} className={`text-slate-600 hover:text-cyan-600 transition-colors ${activeSection === "events" ? "text-cyan-600 font-semibold" : ""}`}>Events</button>
              <button onClick={() => scrollToSection("resources")} className={`text-slate-600 hover:text-cyan-600 transition-colors ${activeSection === "resources" ? "text-cyan-600 font-semibold" : ""}`}>Resources</button>
              <button onClick={() => scrollToSection("contact")} className={`text-slate-600 hover:text-cyan-600 transition-colors ${activeSection === "contact" ? "text-cyan-600 font-semibold" : ""}`}>Contact</button>
            </div>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <Link href="/login" className="px-4 py-2 text-cyan-600 border border-cyan-600 rounded-lg hover:bg-cyan-50 transition-colors">
                Sign In
              </Link>
              <Link href="/signup" className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors">
                Join Us
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2">
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-4 py-4 space-y-3">
              <button onClick={() => scrollToSection("home")} className="block w-full text-left py-2 text-slate-600 hover:text-cyan-600">Home</button>
              <button onClick={() => scrollToSection("about")} className="block w-full text-left py-2 text-slate-600 hover:text-cyan-600">About</button>
              <button onClick={() => scrollToSection("reports")} className="block w-full text-left py-2 text-slate-600 hover:text-cyan-600">Reports</button>
              <button onClick={() => scrollToSection("events")} className="block w-full text-left py-2 text-slate-600 hover:text-cyan-600">Events</button>
              <button onClick={() => scrollToSection("resources")} className="block w-full text-left py-2 text-slate-600 hover:text-cyan-600">Resources</button>
              <button onClick={() => scrollToSection("contact")} className="block w-full text-left py-2 text-slate-600 hover:text-cyan-600">Contact</button>
              <div className="pt-4 flex flex-col gap-3">
                <Link href="/login" className="text-center px-4 py-2 text-cyan-600 border border-cyan-600 rounded-lg hover:bg-cyan-50 transition-colors">
                  Sign In
                </Link>
                <Link href="/organizations" className="text-center px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors">
                  Join Us
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <div className="pt-20">
        <section id="home" className="relative overflow-hidden bg-gradient-to-br from-cyan-50 via-white to-blue-50 py-20">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2306b6d4' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
                <div className="inline-flex items-center gap-2 bg-transparent px-4 py-2 rounded-full mb-6">
                <Image
                  src="/logo.png"
                  alt="AMHROA Logo"
                  width={40}
                  height={40}
                  className="object-contain"
                />
                <span className="text-cyan-700 text-sm font-medium">Advancing Mental Health Reform Across Africa</span>
                </div>
              <h1 className="text-5xl md:text-7xl font-bold text-slate-900 mb-6">
                Transforming Mental Health
                <span className="block text-cyan-600">Across Africa</span>
              </h1>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-10">
                AMHROA is dedicated to advancing mental health reform, policy implementation, 
                and continental collaboration for better mental health outcomes.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link href="/reform-intelligence" className="px-8 py-3 bg-cyan-600 text-white rounded-xl hover:bg-cyan-700 transition-colors flex items-center gap-2">
                  Explore Reform Intelligence
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/countries" className="px-8 py-3 border border-cyan-600 text-cyan-600 rounded-xl hover:bg-cyan-50 transition-colors">
                  View Country Profiles
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <Globe className="w-10 h-10 text-cyan-600 mx-auto mb-3" />
                <h3 className="text-4xl font-bold text-slate-900">{stats.countries}</h3>
                <p className="text-slate-500">African Countries</p>
              </div>
              <div className="text-center">
                <TrendingUp className="w-10 h-10 text-cyan-600 mx-auto mb-3" />
                <h3 className="text-4xl font-bold text-slate-900">{stats.reforms}+</h3>
                <p className="text-slate-500">Active Reforms</p>
              </div>
              <div className="text-center">
                <Users className="w-10 h-10 text-cyan-600 mx-auto mb-3" />
                <h3 className="text-4xl font-bold text-slate-900">{stats.organizations}+</h3>
                <p className="text-slate-500">Partner Organizations</p>
              </div>
              <div className="text-center">
                <FileText className="w-10 h-10 text-cyan-600 mx-auto mb-3" />
                <h3 className="text-4xl font-bold text-slate-900">{stats.reports}+</h3>
                <p className="text-slate-500">Published Reports</p>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-slate-900 mb-4">About AMHROA</h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                Africa's leading continental body for mental health reform advocacy and implementation
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div className="bg-cyan-100 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
                  <Target className="w-7 h-7 text-cyan-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Our Mission</h3>
                <p className="text-slate-600 leading-relaxed">
                  To accelerate mental health reform across Africa through policy advocacy, 
                  continental collaboration, and evidence-based implementation strategies.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div className="bg-cyan-100 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
                  <Eye className="w-7 h-7 text-cyan-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Our Vision</h3>
                <p className="text-slate-600 leading-relaxed">
                  A mentally healthy Africa where quality mental health services are accessible, 
                  affordable, and stigma-free for all citizens.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div className="bg-cyan-100 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
                  <Users className="w-7 h-7 text-cyan-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Our Approach</h3>
                <p className="text-slate-600 leading-relaxed">
                  Multi-stakeholder collaboration engaging governments, civil society, 
                  researchers, donors, and communities in reform processes.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Reports */}
        <section id="reports" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-12">
              <div>
                <h2 className="text-4xl font-bold text-slate-900 mb-4">Featured Reports</h2>
                <p className="text-xl text-slate-600">Latest continental research and policy analysis</p>
              </div>
              <Link href="/repository" className="text-cyan-600 hover:text-cyan-700 flex items-center gap-1">
                View All Reports
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredReports.map((report) => (
                <div key={report.id} className="bg-slate-50 rounded-2xl p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-1 bg-cyan-100 text-cyan-700 text-xs rounded-full">{report.category}</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{report.title}</h3>
                  <p className="text-slate-500 text-sm mb-4">{report.date}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-sm">{report.downloads} downloads</span>
                    <button className="text-cyan-600 hover:text-cyan-700 flex items-center gap-1">
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Success Stories */}
        <section className="py-20 bg-gradient-to-r from-cyan-600 to-blue-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white mb-4">Success Stories</h2>
              <p className="text-xl text-cyan-100 max-w-3xl mx-auto">
                Real impact from mental health reform across the continent
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {successStories.map((story) => (
                <div key={story.id} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="w-4 h-4 text-cyan-200" />
                    <span className="text-cyan-200 text-sm">{story.country}</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{story.title}</h3>
                  <p className="text-cyan-100 mb-4">{story.impact}</p>
                  <button className="text-white hover:text-cyan-200 flex items-center gap-1 text-sm">
                    Read Full Story
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Events Section */}
        <section id="events" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-12">
              <div>
                <h2 className="text-4xl font-bold text-slate-900 mb-4">Upcoming Events</h2>
                <p className="text-xl text-slate-600">Join us in advancing mental health reform</p>
              </div>
              <Link href="/events" className="text-cyan-600 hover:text-cyan-700 flex items-center gap-1">
                View Calendar
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="flex gap-4 p-4 border border-slate-200 rounded-xl hover:shadow-md transition-shadow">
                  <div className="bg-cyan-100 p-3 rounded-xl h-fit">
                    <Calendar className="w-6 h-6 text-cyan-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 bg-cyan-100 text-cyan-700 text-xs rounded-full">{event.type}</span>
                    </div>
                    <h3 className="font-bold text-slate-900 mb-1">{event.title}</h3>
                    <p className="text-slate-500 text-sm">{event.date}</p>
                    <p className="text-slate-400 text-sm flex items-center gap-1 mt-1">
                      <MapPinIcon className="w-3 h-3" />
                      {event.location}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Resources Section */}
        <section id="resources" className="py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-slate-900 mb-4">Knowledge Resources</h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                Tools, guides, and materials to support mental health advocacy and implementation
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {resources.map((resource) => (
                <div key={resource.id} className="bg-white p-6 rounded-2xl text-center hover:shadow-md transition-shadow">
                  <div className="bg-cyan-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <resource.icon className="w-8 h-8 text-cyan-600" />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-2">{resource.title}</h3>
                  <p className="text-slate-500 text-sm mb-3">{resource.type}</p>
                  <button className="text-cyan-600 hover:text-cyan-700 text-sm flex items-center justify-center gap-1">
                    Access Resource
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="bg-gradient-to-r from-cyan-600 to-blue-600 rounded-3xl p-12">
              <h2 className="text-3xl font-bold text-white mb-4">Stay Informed</h2>
              <p className="text-cyan-100 mb-8 max-w-2xl mx-auto">
                Subscribe to our newsletter for the latest updates on mental health reform across Africa
              </p>
              <form onSubmit={handleNewsletterSignup} className="flex flex-wrap gap-4 justify-center">
                <input
                  type="email"
                  value={emailSignup}
                  onChange={(e) => setEmailSignup(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  className="px-6 py-3 rounded-xl w-80 focus:outline-none focus:ring-2 focus:ring-white"
                />
                <button type="submit" className="px-8 py-3 bg-white text-cyan-600 rounded-xl font-semibold hover:bg-cyan-50 transition-colors">
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 bg-slate-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-slate-900 mb-4">Frequently Asked Questions</h2>
              <p className="text-xl text-slate-600">Everything you need to know about AMHROA</p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-white rounded-xl p-6 border border-slate-200">
                  <h3 className="font-bold text-slate-900 mb-2">{faq.q}</h3>
                  <p className="text-slate-600">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-slate-900 mb-4">Contact Us</h2>
              <p className="text-xl text-slate-600">Get in touch with our continental secretariat</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="bg-cyan-100 p-3 rounded-xl">
                      <MapPinIcon className="w-6 h-6 text-cyan-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">Our Headquarters</h3>
                      <p className="text-slate-600">Abuja, Nigeria</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="bg-cyan-100 p-3 rounded-xl">
                      <Phone className="w-6 h-6 text-cyan-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">Phone</h3>
                      <p className="text-slate-600">+234 803 464 5001</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="bg-cyan-100 p-3 rounded-xl">
                      <Mail className="w-6 h-6 text-cyan-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">Email</h3>
                      <p className="text-slate-600">info@amhroa.org</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="bg-cyan-100 p-3 rounded-xl">
                      <Clock className="w-6 h-6 text-cyan-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">Office Hours</h3>
                      <p className="text-slate-600">Monday - Friday, 9:00 AM - 5:00 PM EAT</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 mt-8">
                  <a href="#" className="bg-slate-100 p-3 rounded-full hover:bg-cyan-100 transition-colors">
                    <Facebook className="w-5 h-5 text-slate-600" />
                  </a>
                  <a href="#" className="bg-slate-100 p-3 rounded-full hover:bg-cyan-100 transition-colors">
                    <Twitter className="w-5 h-5 text-slate-600" />
                  </a>
                  <a href="#" className="bg-slate-100 p-3 rounded-full hover:bg-cyan-100 transition-colors">
                    <Linkedin className="w-5 h-5 text-slate-600" />
                  </a>
                </div>
              </div>

              <form className="space-y-4">
                <div>
                  <input type="text" placeholder="Your Name" className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:border-cyan-500" />
                </div>
                <div>
                  <input type="email" placeholder="Your Email" className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:border-cyan-500" />
                </div>
                <div>
                  <textarea rows={4} placeholder="Your Message" className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:border-cyan-500"></textarea>
                </div>
                <button type="submit" className="w-full px-6 py-3 bg-cyan-600 text-white rounded-xl hover:bg-cyan-700 transition-colors">
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-slate-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Image
                    src="/logo.png"
                    alt="AMHROA Logo"
                    width={80}
                    height={80}
                    className="object-contain"
                  />
                  <h3 className="text-xl font-bold">AMHROA</h3>
                </div>
                <p className="text-slate-400 text-sm">
                  Advancing mental health reform across Africa through collaboration, advocacy, and evidence-based implementation.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Quick Links</h4>
                <ul className="space-y-2 text-sm text-slate-400">
                  <li><Link href="/about" className="hover:text-cyan-400">About Us</Link></li>
                  <li><Link href="/countries" className="hover:text-cyan-400">Country Profiles</Link></li>
                  <li><Link href="/repository" className="hover:text-cyan-400">Knowledge Repository</Link></li>
                  <li><Link href="/careers" className="hover:text-cyan-400">Careers</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Resources</h4>
                <ul className="space-y-2 text-sm text-slate-400">
                  <li><Link href="/publications" className="hover:text-cyan-400">Publications</Link></li>
                  <li><Link href="/toolkits" className="hover:text-cyan-400">Policy Toolkits</Link></li>
                  <li><Link href="/webinars" className="hover:text-cyan-400">Webinars</Link></li>
                  <li><Link href="/faq" className="hover:text-cyan-400">FAQs</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Legal</h4>
                <ul className="space-y-2 text-sm text-slate-400">
                  <li><Link href="/privacy" className="hover:text-cyan-400">Privacy Policy</Link></li>
                  <li><Link href="/terms" className="hover:text-cyan-400">Terms of Use</Link></li>
                  <li><Link href="/accessibility" className="hover:text-cyan-400">Accessibility</Link></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-400 text-sm">
              <p>&copy; 2024 AMHROA. All rights reserved. Advancing Mental Health Reform Across Africa.</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}