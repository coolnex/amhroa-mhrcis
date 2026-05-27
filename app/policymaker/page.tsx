"use client";

import { useState } from "react";
import {
  Sidebar,
  TopNavigation,
  AnalyticsCard,
  DataTable,
  IntelligenceWidget,
  ReformHeatmap,
  PolicyTimeline,
} from "@/components/shared"; // Assuming a shared component library
import {
  TrendingUp,
  Scale,
  Target,
  AlertTriangle,
  Download,
  Eye,
  Calendar,
  BarChart3,
} from "lucide-react";

export default function PolicymakerDashboard() {
  const [selectedCountry, setSelectedCountry] = useState("Kenya");

  // Mock data - would come from API
  const reformScore = {
    overall: 72,
    legislative: 68,
    implementation: 74,
    financing: 65,
    monitoring: 81,
  };

  const neighboringBenchmarks = [
    { country: "Kenya", score: 72, rank: 2 },
    { country: "Tanzania", score: 68, rank: 3 },
    { country: "Uganda", score: 74, rank: 1 },
    { country: "Ethiopia", score: 58, rank: 4 },
    { country: "Rwanda", score: 81, rank: 0 },
  ];

  const legislationStatus = [
    {
      policy: "Mental Health Act 2024",
      status: "Passed",
      sdgAlignment: "SDG 3.4",
      implementation: "75%",
    },
    {
      policy: "Community Care Framework",
      status: "In Committee",
      sdgAlignment: "SDG 3.4, 10.2",
      implementation: "40%",
    },
    {
      policy: "Workplace Mental Health Regulation",
      status: "Drafting",
      sdgAlignment: "SDG 8.5",
      implementation: "15%",
    },
  ];

  const aiRecommendations = [
    "Accelerate community-based service regulations - 12 countries ahead on this metric",
    "Increase budget allocation for preventive care (currently 12% below regional avg)",
    "Align reporting framework with continental SDG indicators by Q3 2026",
  ];

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
      {/* Sidebar */}
      <Sidebar
        variant="executive"
        activeItem="policymaker"
        userRole="Policy Director"
        userName="Dr. Aisha Okonkwo"
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <TopNavigation
          title="National Reform Intelligence Center"
          subtitle="Continental Policy Decision Support System"
          onDownload={() => console.log("Download brief")}
          onShare={() => console.log("Share insights")}
          notificationCount={3}
          userAvatar="/avatars/aisha.jpg"
        />

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Country Selector & KPIs Row */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option>Kenya</option>
                  <option>Nigeria</option>
                  <option>South Africa</option>
                  <option>Ghana</option>
                  <option>Rwanda</option>
                </select>
                <div className="text-slate-400 text-sm">
                  Last updated: Today, 14:23 EAT
                </div>
              </div>
              <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                <Download className="w-4 h-4" />
                Download Policy Brief
              </button>
            </div>

            {/* Analytics Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <AnalyticsCard
                title="Overall Reform Score"
                value={reformScore.overall}
                unit="pts"
                icon={TrendingUp}
                trend={{ value: 5.2, direction: "up" }}
                color="blue"
              />
              <AnalyticsCard
                title="Legislative Progress"
                value={reformScore.legislative}
                unit="pts"
                icon={Scale}
                trend={{ value: 3.1, direction: "up" }}
                color="purple"
              />
              <AnalyticsCard
                title="SDG 3.4 Alignment"
                value={84}
                unit="%"
                icon={Target}
                trend={{ value: 12, direction: "up" }}
                color="green"
              />
              <AnalyticsCard
                title="Implementation Gaps"
                value={6}
                unit="critical"
                icon={AlertTriangle}
                trend={{ value: 2, direction: "down" }}
                color="red"
              />
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - 2/3 width */}
              <div className="lg:col-span-2 space-y-6">
                {/* Reform Heatmap */}
                <ReformHeatmap
                  title="Implementation Gaps by Region"
                  data={{
                    regions: [
                      "Nairobi",
                      "Coast",
                      "Eastern",
                      "Central",
                      "Rift Valley",
                      "Western",
                    ],
                    scores: [82, 45, 67, 78, 59, 38],
                  }}
                  onDrillDown={(region: any) =>
                    console.log("Drill into", region)
                  }
                />

                {/* Legislation Status Table */}
                <DataTable
                  title="Legislation Status & SDG Alignment"
                  columns={["Policy", "Status", "SDG Alignment", "Implementation"]}
                  data={legislationStatus}
                  actions={[
                    {
                      label: "View Details",
                      icon: Eye,
                      onClick: (row: any) => console.log(row),
                    },
                  ]}
                />

                {/* Policy Timeline */}
                <PolicyTimeline
                  title="Reform Implementation Timeline"
                  milestones={[
                    {
                      date: "2024 Q4",
                      title: "Mental Health Act Passage",
                      status: "completed",
                    },
                    {
                      date: "2025 Q1",
                      title: "National Commission Establishment",
                      status: "in-progress",
                    },
                    {
                      date: "2025 Q3",
                      title: "County-Level Rollout",
                      status: "pending",
                    },
                    {
                      date: "2026 Q1",
                      title: "Continental Compliance Audit",
                      status: "pending",
                    },
                  ]}
                />
              </div>

              {/* Right Column - 1/3 width */}
              <div className="space-y-6">
                {/* Benchmarking Widget */}
                <IntelligenceWidget
                  title="Regional Benchmarking"
                  subtitle="vs. Neighboring Countries"
                  type="comparison"
                  data={neighboringBenchmarks}
                  primaryMetric="score"
                  secondaryMetric="rank"
                  onExport={() => console.log("Export benchmark")}
                />

                {/* AI Recommendations */}
                <IntelligenceWidget
                  title="AI Policy Recommendations"
                  subtitle="Continental intelligence analysis"
                  type="recommendations"
                  data={aiRecommendations}
                  icon="brain"
                  onApply={(rec: any) => console.log("Apply recommendation", rec)}
                />

                {/* Quick Actions */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
                  <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-400" />
                    Quick Actions
                  </h3>
                  <div className="space-y-2">
                    <button className="w-full text-left px-3 py-2 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-slate-300 text-sm transition-colors">
                      Generate Legislative Impact Assessment
                    </button>
                    <button className="w-full text-left px-3 py-2 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-slate-300 text-sm transition-colors">
                      Compare with 3 Countries
                    </button>
                    <button className="w-full text-left px-3 py-2 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-slate-300 text-sm transition-colors">
                      Schedule Cross-Ministerial Review
                    </button>
                    <button className="w-full text-left px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 rounded-lg text-blue-300 text-sm transition-colors">
                      Export SDG Compliance Report
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}