"use client";

import {
  Users,
  Globe,
  Handshake,
  FileText,
  BadgeCheck,
  Bell,
  Calendar,
  Activity,
} from "lucide-react";

export default function CSODashboard() {

  return (

    <main className="min-h-screen bg-slate-100 p-6 lg:p-10">

      <div className="max-w-7xl mx-auto">

        {/* HERO SECTION */}
        <div className="bg-gradient-to-r from-green-900 to-emerald-700 text-white rounded-3xl p-10 shadow-2xl mb-10 relative overflow-hidden">

          <div className="absolute right-0 top-0 opacity-10 text-[180px] font-black">
            CSO
          </div>

          <div className="relative z-10">

            <div className="flex items-center gap-5 mb-6">

              <div className="bg-white/10 p-4 rounded-2xl">
                <Users className="w-10 h-10" />
              </div>

              <div>

                <h1 className="text-4xl lg:text-5xl font-black">
                  CSO & NGO Collaboration Portal
                </h1>

                <p className="text-green-100 mt-3 text-lg max-w-4xl">
                  Collaborate, advocate, share reforms, and build strategic
                  partnerships across Africa’s mental health ecosystem.
                </p>

              </div>

            </div>

            {/* QUICK STATS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">

              <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
                <p className="text-green-100 text-sm">
                  Active Partnerships
                </p>
                <h3 className="text-3xl font-black mt-2">
                  42
                </h3>
              </div>

              <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
                <p className="text-green-100 text-sm">
                  Advocacy Campaigns
                </p>
                <h3 className="text-3xl font-black mt-2">
                  18
                </h3>
              </div>

              <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
                <p className="text-green-100 text-sm">
                  Member Organizations
                </p>
                <h3 className="text-3xl font-black mt-2">
                  120+
                </h3>
              </div>

              <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
                <p className="text-green-100 text-sm">
                  Countries Connected
                </p>
                <h3 className="text-3xl font-black mt-2">
                  20+
                </h3>
              </div>

            </div>

          </div>

        </div>

        {/* KPI GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">

          {/* PARTNERSHIPS */}
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-200">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-slate-500 text-sm uppercase tracking-wide">
                  Partnerships
                </p>

                <h2 className="text-4xl font-black mt-4 text-green-700">
                  42
                </h2>
              </div>

              <div className="bg-green-100 p-4 rounded-2xl">
                <Handshake className="w-8 h-8 text-green-700" />
              </div>

            </div>

          </div>

          {/* VERIFIED */}
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-200">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-slate-500 text-sm uppercase tracking-wide">
                  Verified CSOs
                </p>

                <h2 className="text-4xl font-black mt-4 text-cyan-700">
                  87
                </h2>
              </div>

              <div className="bg-cyan-100 p-4 rounded-2xl">
                <BadgeCheck className="w-8 h-8 text-cyan-700" />
              </div>

            </div>

          </div>

          {/* CAMPAIGNS */}
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-200">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-slate-500 text-sm uppercase tracking-wide">
                  Campaigns
                </p>

                <h2 className="text-4xl font-black mt-4 text-purple-700">
                  18
                </h2>
              </div>

              <div className="bg-purple-100 p-4 rounded-2xl">
                <Activity className="w-8 h-8 text-purple-700" />
              </div>

            </div>

          </div>

          {/* COUNTRIES */}
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-200">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-slate-500 text-sm uppercase tracking-wide">
                  Continental Reach
                </p>

                <h2 className="text-4xl font-black mt-4 text-amber-600">
                  20+
                </h2>
              </div>

              <div className="bg-amber-100 p-4 rounded-2xl">
                <Globe className="w-8 h-8 text-amber-700" />
              </div>

            </div>

          </div>

        </div>

        {/* MAIN CONTENT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">

          {/* ACTIVE PROJECTS */}
          <div className="lg:col-span-2 bg-white rounded-3xl shadow-xl p-8">

            <div className="flex items-center justify-between mb-8">

              <div>
                <h2 className="text-3xl font-black">
                  Active Continental Projects
                </h2>

                <p className="text-slate-500 mt-2">
                  Current advocacy and reform collaborations.
                </p>
              </div>

              <div className="bg-green-100 p-4 rounded-2xl">
                <FileText className="w-8 h-8 text-green-700" />
              </div>

            </div>

            <div className="space-y-5">

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">

                <div className="flex items-center justify-between">

                  <div>
                    <h3 className="text-xl font-bold">
                      Africa Suicide Decriminalization Campaign
                    </h3>

                    <p className="text-slate-500 mt-2">
                      Regional legal reform initiative across multiple African countries.
                    </p>
                  </div>

                  <span className="bg-red-100 text-red-700 px-4 py-2 rounded-full text-sm font-semibold">
                    High Priority
                  </span>

                </div>

              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">

                <div className="flex items-center justify-between">

                  <div>
                    <h3 className="text-xl font-bold">
                      Community Workforce Expansion Initiative
                    </h3>

                    <p className="text-slate-500 mt-2">
                      Training grassroots mental health responders across regions.
                    </p>
                  </div>

                  <span className="bg-cyan-100 text-cyan-700 px-4 py-2 rounded-full text-sm font-semibold">
                    Active
                  </span>

                </div>

              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">

                <div className="flex items-center justify-between">

                  <div>
                    <h3 className="text-xl font-bold">
                      Pan-African Lived Experience Network
                    </h3>

                    <p className="text-slate-500 mt-2">
                      Strengthening representation of lived experience leadership.
                    </p>
                  </div>

                  <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold">
                    Growing
                  </span>

                </div>

              </div>

            </div>

          </div>

          {/* ANNOUNCEMENTS */}
          <div className="bg-white rounded-3xl shadow-xl p-8">

            <div className="flex items-center gap-4 mb-8">

              <div className="bg-amber-100 p-4 rounded-2xl">
                <Bell className="w-8 h-8 text-amber-700" />
              </div>

              <div>
                <h2 className="text-3xl font-black">
                  Announcements
                </h2>

                <p className="text-slate-500 mt-1">
                  Latest coalition updates.
                </p>
              </div>

            </div>

            <div className="space-y-5">

              <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
                <h3 className="font-bold text-green-700">
                  Conference 3.0 Registration Open
                </h3>
                <p className="text-sm text-slate-600 mt-2">
                  Member CSOs are encouraged to register for AMHROA Conference 3.0.
                </p>
              </div>

              <div className="bg-cyan-50 border border-cyan-200 rounded-2xl p-5">
                <h3 className="font-bold text-cyan-700">
                  New Partnership Opportunities
                </h3>
                <p className="text-sm text-slate-600 mt-2">
                  Regional collaborations are now open for member organizations.
                </p>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-2xl p-5">
                <h3 className="font-bold text-purple-700">
                  Advocacy Toolkit Released
                </h3>
                <p className="text-sm text-slate-600 mt-2">
                  Updated mental health advocacy resources now available.
                </p>
              </div>

            </div>

          </div>

        </div>

        {/* EVENTS */}
        <div className="bg-white rounded-3xl shadow-xl p-8">

          <div className="flex items-center justify-between mb-8">

            <div>
              <h2 className="text-3xl font-black">
                Upcoming Continental Events
              </h2>

              <p className="text-slate-500 mt-2">
                Conferences, trainings, advocacy events, and policy dialogues.
              </p>
            </div>

            <div className="bg-slate-100 p-4 rounded-2xl">
              <Calendar className="w-8 h-8 text-slate-700" />
            </div>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
              <h3 className="text-xl font-bold">
                AMHROA Conference 3.0
              </h3>
              <p className="text-slate-500 mt-2">
                Advancing Rights-Based Mental Health Systems in Africa.
              </p>
              <p className="mt-4 text-green-700 font-semibold">
                July 2026
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
              <h3 className="text-xl font-bold">
                CSO Capacity Building Workshop
              </h3>
              <p className="text-slate-500 mt-2">
                Training on governance, advocacy, and mental health reforms.
              </p>
              <p className="mt-4 text-cyan-700 font-semibold">
                August 2026
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
              <h3 className="text-xl font-bold">
                Regional Policy Dialogue
              </h3>
              <p className="text-slate-500 mt-2">
                Multi-stakeholder reform discussions across African regions.
              </p>
              <p className="mt-4 text-purple-700 font-semibold">
                September 2026
              </p>
            </div>

          </div>

        </div>

      </div>

    </main>

  );

}