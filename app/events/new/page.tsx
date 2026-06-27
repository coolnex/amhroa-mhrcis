// app/events/new/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { ArrowLeft, Loader2, Calendar, MapPin, Video, Globe, Clock } from "lucide-react";

const eventTypes = [
  "Conference",
  "Webinar",
  "Workshop",
  "Training",
  "Summit",
  "Networking",
];

export default function NewEventPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    event_type: "Webinar",
    start_date: "",
    end_date: "",
    venue: "",
    location: "",
    country: "",
    capacity: "",
    is_virtual: false,
    meeting_link: "",
    registration_fee: "0",
  });

  useEffect(() => {
    // Check if user is logged in
    const userStr = localStorage.getItem("user");
    if (userStr) {
      setUser(JSON.parse(userStr));
    } else {
      router.push("/login");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("Please login to create an event");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.from("events").insert({
        title: formData.title,
        description: formData.description,
        event_type: formData.event_type,
        start_date: formData.start_date,
        end_date: formData.end_date || null,
        venue: formData.venue || null,
        location: formData.location || null,
        country: formData.country || null,
        capacity: parseInt(formData.capacity) || null,
        is_virtual: formData.is_virtual,
        meeting_link: formData.meeting_link || null,
        registration_fee: parseFloat(formData.registration_fee) || 0,
        created_by: user.id,
        status: "Upcoming",
        approval_status: "Pending", // Always pending by default
        created_at: new Date().toISOString(),
      });

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      alert("Event created successfully! It will be displayed after admin approval.");
      router.push("/events");
    } catch (error) {
      console.error("Error creating event:", error);
      alert("Failed to create event. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <Link href="/events" className="inline-flex items-center gap-2 text-slate-400 hover:text-cyan-400 mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Events
        </Link>

        <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-8">
          <h1 className="text-3xl font-bold text-white mb-2">Create New Event</h1>
          <p className="text-slate-400 mb-6">Events require admin approval before being displayed to users</p>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-slate-400 text-sm block mb-2">Event Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                placeholder="e.g., Continental Mental Health Summit 2024"
              />
            </div>

            <div>
              <label className="text-slate-400 text-sm block mb-2">Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                rows={4}
                className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white resize-none focus:outline-none focus:border-cyan-500"
                placeholder="Describe the event agenda and objectives"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-slate-400 text-sm block mb-2">Event Type *</label>
                <select
                  value={formData.event_type}
                  onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                >
                  {eventTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-slate-400 text-sm block mb-2">Country</label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                  placeholder="e.g., Nigeria, Kenya"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-slate-400 text-sm block mb-2">Start Date & Time *</label>
                <input
                  type="datetime-local"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  required
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="text-slate-400 text-sm block mb-2">End Date & Time (Optional)</label>
                <input
                  type="datetime-local"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
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
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                  placeholder="e.g., Conference Center"
                />
              </div>
              <div>
                <label className="text-slate-400 text-sm block mb-2">City/Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                  placeholder="e.g., Lagos, Nairobi"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-slate-400 text-sm block mb-2">Capacity</label>
                <input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                  placeholder="e.g., 100"
                />
              </div>
              <div>
                <label className="text-slate-400 text-sm block mb-2">Registration Fee ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.registration_fee}
                  onChange={(e) => setFormData({ ...formData, registration_fee: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                  placeholder="e.g., 50"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_virtual}
                  onChange={(e) => setFormData({ ...formData, is_virtual: e.target.checked })}
                  className="w-4 h-4 accent-cyan-500"
                />
                <span className="text-slate-400 text-sm">Virtual Event</span>
              </label>
            </div>

            {formData.is_virtual && (
              <div>
                <label className="text-slate-400 text-sm block mb-2">Meeting Link</label>
                <input
                  type="url"
                  value={formData.meeting_link}
                  onChange={(e) => setFormData({ ...formData, meeting_link: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                  placeholder="https://zoom.us/..."
                />
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
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 rounded-xl text-white font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Calendar className="w-5 h-5" />}
              {loading ? "Creating..." : "Create Event"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}