"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  Globe,
  ShieldAlert,
  TrendingUp,
  Activity,
  FileText,
  BrainCircuit,
  Landmark,
  BadgeDollarSign,
} from "lucide-react";

export default function ExecutiveDashboardPage() {

  const [dashboard, setDashboard] =
    useState<any>(null);

  useEffect(() => {

    fetchDashboard();

  }, []);

  const fetchDashboard = async () => {

    try {

      const response =
        await fetch(
          "/api/executive-dashboard"
        );

      const data =
        await response.json();

      if (data.success) {

        setDashboard(data);

      }

    } catch (error) {

      console.log(error);

    }

  };

  if (!dashboard) {

    return (
      <main className="min-h-screen bg-slate-100 flex items-center justify-center">

        <div className="bg-white p-10 rounded-3xl shadow-xl text-center">

          <Activity className="w-14 h-14 mx-auto text-cyan-600 animate-pulse" />

          <h2 className="text-2xl font-bold mt-5">
            Loading Continental Intelligence...
          </h2>

          <p className="text-slate-500 mt-3">
            Initializing executive governance systems.
          </p>

        </div>

      </main>
    );

  }

  const topCountries =
    [...dashboard.countries]
      .sort(
        (a: any, b: any) =>
          b.reform_score - a.reform_score
      )
      .slice(0, 5);

  const priorityCountries =
    dashboard.countries.filter(
      (country: any) =>
        country.priority_level ===
        "High Priority"
    );

  return (

    <main className="min-h-screen bg-slate-100 p-6 lg:p-10">

      <div className="max-w-7xl mx-auto">

        {/* HERO HEADER */}
        <div className="bg-gradient-to-r from-slate-900 to-cyan-900 text-white rounded-3xl p-10 shadow-2xl mb-10 relative overflow-hidden">

          <div className="absolute top-0 right-0 opacity-10 text-[180px] font-black">
            AFRICA
          </div>

          <div className="relative z-10">

            <div className="flex items-center gap-4 mb-6">

              <div className="bg-white/10 p-4 rounded-2xl">
                <Globe className="w-10 h-10" />
              </div>

              <div>
                <h1 className="text-4xl lg:text-5xl font-black">
                  Executive Continental Command Center
                </h1>

                <p className="text-cyan-100 mt-3 text-lg max-w-4xl">
                  Unified Pan-African mental health reform intelligence, governance analytics,
                  SDG monitoring, donor intelligence, and AI-assisted policy insights.
                </p>
              </div>

            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">

              <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
                <p className="text-cyan-100 text-sm">
                  Active Countries
                </p>
                <h3 className="text-3xl font-black mt-2">
                  {dashboard.metrics.totalCountries}
                </h3>
              </div>

              <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
                <p className="text-cyan-100 text-sm">
                  Avg Reform Score
                </p>
                <h3 className="text-3xl font-black mt-2">
                  {dashboard.metrics.avgReformScore}%
                </h3>
              </div>

              <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
                <p className="text-cyan-100 text-sm">
                  Avg SDG 3 Score
                </p>
                <h3 className="text-3xl font-black mt-2">
                  {dashboard.metrics.avgSDG3}%
                </h3>
              </div>

              <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
                <p className="text-cyan-100 text-sm">
                  High Priority States
                </p>
                <h3 className="text-3xl font-black mt-2 text-red-300">
                  {dashboard.metrics.highPriority}
                </h3>
              </div>

            </div>

          </div>

        </div>

        {/* KPI GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">

          {/* REFORM */}
          <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-200">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-slate-500 text-sm uppercase tracking-wide">
                  Reform Intelligence
                </p>

                <h2 className="text-4xl font-black mt-4 text-cyan-700">
                  {dashboard.metrics.avgReformScore}%
                </h2>
              </div>

              <div className="bg-cyan-100 p-4 rounded-2xl">
                <TrendingUp className="w-8 h-8 text-cyan-700" />
              </div>

            </div>

          </div>

          {/* SDG */}
          <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-200">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-slate-500 text-sm uppercase tracking-wide">
                  SDG Governance
                </p>

                <h2 className="text-4xl font-black mt-4 text-green-700">
                  {dashboard.metrics.avgSDG3}%
                </h2>
              </div>

              <div className="bg-green-100 p-4 rounded-2xl">
                <Landmark className="w-8 h-8 text-green-700" />
              </div>

            </div>

          </div>

          {/* PRIORITY */}
          <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-200">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-slate-500 text-sm uppercase tracking-wide">
                  Risk Alerts
                </p>

                <h2 className="text-4xl font-black mt-4 text-red-600">
                  {dashboard.metrics.highPriority}
                </h2>
              </div>

              <div className="bg-red-100 p-4 rounded-2xl">
                <ShieldAlert className="w-8 h-8 text-red-600" />
              </div>

            </div>

          </div>

          {/* DONOR */}
          <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-200">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-slate-500 text-sm uppercase tracking-wide">
                  Investment Readiness
                </p>

                <h2 className="text-4xl font-black mt-4 text-amber-600">
                  72%
                </h2>
              </div>

              <div className="bg-amber-100 p-4 rounded-2xl">
                <BadgeDollarSign className="w-8 h-8 text-amber-700" />
              </div>

            </div>

          </div>

        </div>

        {/* MAIN CONTENT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">

          {/* TOP COUNTRIES */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-xl">

            <div className="flex items-center justify-between mb-8">

              <div>
                <h2 className="text-3xl font-black">
                  Top Reforming Countries
                </h2>

                <p className="text-slate-500 mt-2">
                  Highest performing mental health reform systems.
                </p>
              </div>

              <div className="bg-cyan-100 p-4 rounded-2xl">
                <Globe className="w-7 h-7 text-cyan-700" />
              </div>

            </div>

            <div className="space-y-5">

              {topCountries.map(
                (
                  country: any,
                  index: number
                ) => (

                  <div
                    key={country.id}
                    className="flex items-center justify-between bg-slate-50 p-5 rounded-2xl border border-slate-200"
                  >

                    <div className="flex items-center gap-5">

                      <div className="bg-slate-900 text-white w-12 h-12 rounded-full flex items-center justify-center font-black text-lg">
                        {index + 1}
                      </div>

                      <div>

                        <h3 className="text-xl font-bold">
                          {country.country_name}
                        </h3>

                        <p className="text-slate-500 mt-1">
                          {country.reform_tier}
                        </p>

                      </div>

                    </div>

                    <div className="text-right">

                      <p className="text-3xl font-black text-cyan-700">
                        {country.reform_score}%
                      </p>

                      <p className="text-slate-500 text-sm">
                        Reform Score
                      </p>

                    </div>

                  </div>

                )
              )}

            </div>

          </div>

          {/* AI INSIGHTS */}
          <div className="bg-white rounded-3xl p-8 shadow-xl">

            <div className="flex items-center gap-4 mb-8">

              <div className="bg-purple-100 p-4 rounded-2xl">
                <BrainCircuit className="w-8 h-8 text-purple-700" />
              </div>

              <div>
                <h2 className="text-3xl font-black">
                  AI Insights
                </h2>

                <p className="text-slate-500 mt-1">
                  Continental intelligence analysis.
                </p>
              </div>

            </div>

            <div className="space-y-5">

              <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
                <h3 className="font-bold text-red-700">
                  High-Risk Alert
                </h3>

                <p className="text-slate-600 mt-2 text-sm leading-relaxed">
                  Multiple countries remain without fully operational mental health legislation and implementation frameworks.
                </p>
              </div>

              <div className="bg-cyan-50 border border-cyan-200 rounded-2xl p-5">
                <h3 className="font-bold text-cyan-700">
                  Reform Momentum
                </h3>

                <p className="text-slate-600 mt-2 text-sm leading-relaxed">
                  West and East Africa show increasing policy modernization and SDG integration trends.
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
                <h3 className="font-bold text-green-700">
                  Investment Opportunity
                </h3>

                <p className="text-slate-600 mt-2 text-sm leading-relaxed">
                  Community workforce expansion and suicide decriminalization reforms present high-impact donor opportunities.
                </p>
              </div>

            </div>

          </div>

        </div>

        {/* PRIORITY COUNTRIES */}
        <div className="bg-white rounded-3xl p-8 shadow-xl mb-10">

          <div className="flex items-center justify-between mb-8">

            <div>
              <h2 className="text-3xl font-black">
                High Priority Countries
              </h2>

              <p className="text-slate-500 mt-2">
                Countries requiring urgent governance and reform interventions.
              </p>
            </div>

            <div className="bg-red-100 p-4 rounded-2xl">
              <ShieldAlert className="w-8 h-8 text-red-700" />
            </div>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            {priorityCountries.slice(0, 6).map(
              (country: any) => (

                <div
                  key={country.id}
                  className="border border-red-200 bg-red-50 rounded-2xl p-6"
                >

                  <h3 className="text-xl font-bold text-red-700">
                    {country.country_name}
                  </h3>

                  <p className="text-slate-600 mt-2 text-sm leading-relaxed">
                    Requires accelerated policy reform, governance strengthening, and donor-supported implementation strategies.
                  </p>

                  <div className="mt-5 flex justify-between text-sm">

                    <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full">
                      {country.reform_score}% Reform
                    </span>

                    <span className="bg-white px-3 py-1 rounded-full border border-red-200">
                      SDG {country.sdg3_score}%
                    </span>

                  </div>

                </div>

              )
            )}

          </div>

        </div>

        {/* RECENT REPORTS */}
        <div className="bg-white rounded-3xl p-8 shadow-xl">

          <div className="flex items-center justify-between mb-8">

            <div>
              <h2 className="text-3xl font-black">
                Governance Intelligence Feed
              </h2>

              <p className="text-slate-500 mt-2">
                Latest submissions and continental reporting activity.
              </p>
            </div>

            <div className="bg-slate-100 p-4 rounded-2xl">
              <FileText className="w-8 h-8 text-slate-700" />
            </div>

          </div>

          <div className="space-y-5">

            {dashboard.reports.length === 0 ? (

              <div className="bg-slate-50 rounded-2xl p-8 text-center border border-slate-200">

                <p className="text-slate-500 text-lg">
                  No reports uploaded yet.
                </p>

                <p className="text-slate-400 mt-2">
                  Country coordinators and researchers will appear here.
                </p>

              </div>

            ) : (

              dashboard.reports.map(
                (report: any) => (

                  <div
                    key={report.id}
                    className="bg-slate-50 p-6 rounded-2xl border border-slate-200"
                  >

                    <h3 className="text-xl font-bold">
                      {report.title}
                    </h3>

                    <p className="text-slate-500 mt-2">
                      {report.country}
                    </p>

                  </div>

                )
              )

            )}

          </div>

        </div>

      </div>

    </main>

  );

}
