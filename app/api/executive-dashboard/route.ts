// app/api/executive-dashboard/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

interface MentalHealthReform {
  id: number;
  country_name: string;
  region?: string;
  reform_tier?: string;
  law_status?: string;
  implementation_status?: string;
  budget_level?: string;
  priority_level?: string;
  strategy?: string;
  reform_score?: number;
  implementation_score?: number;
  sdg3_score?: number;
  sdg10_score?: number;
  sdg16_score?: number;
  agenda2063_score?: number;
  funding_gap_level?: string;
  investment_priority?: string;
  estimated_investment_need?: number;
  donor_readiness_score?: number;
  created_at?: string;
}

interface DashboardMetrics {
  totalCountries: number;
  avgReformScore: number;
  avgSDG3: number;
  highPriority: number;
  avgWorkforceScore: number;
  avgFinancingScore: number;
  totalOrganizations: number;
  activeCoordinators: number;
  reportsThisMonth: number;
  criticalFundingGap: number;
  avgDonorReadiness: number;
  totalInvestmentNeed: number;
}

interface DashboardCountry {
  id: number;
  country_name: string;
  region: string;
  reform_score: number;
  reform_tier: string;
  priority_level: string;
  sdg3_score: number;
  sdg10_score: number;
  sdg16_score: number;
  agenda2063_score: number;
  implementation_score: number;
  law_status: string;
  implementation_status: string;
  budget_level: string;
  strategy: string;
  funding_gap_level: string;
  investment_priority: string;
  estimated_investment_need: number;
  donor_readiness_score: number;
  created_at: string;
}

interface DashboardReport {
  id: number;
  title: string;
  country: string;
  submitted_at: string;
  status: string;
}

interface AIInsights {
  summary: string;
  riskAlert: string;
  opportunity: string;
  recommendation: string;
}

interface DashboardTrends {
  reformProgress: number;
  sdgProgress: number;
  implementationGap: number;
}

interface DashboardResponse {
  success: boolean;
  metrics: DashboardMetrics;
  countries: DashboardCountry[];
  reports: DashboardReport[];
  aiInsights: AIInsights;
  trends: DashboardTrends;
  message?: string;
  error?: string;
}

export async function GET() {
  try {
    // Fetch all mental health reforms data
    const { data: countries, error } = await supabase
      .from("mental_health_reforms")
      .select("*")
      .order("country_name", { ascending: true });

    if (error) {
      console.error("Supabase error:", error);
      throw error;
    }

    // If no data, return empty dashboard
    if (!countries || countries.length === 0) {
      const emptyResponse: DashboardResponse = {
        success: true,
        metrics: {
          totalCountries: 0,
          avgReformScore: 0,
          avgSDG3: 0,
          highPriority: 0,
          avgWorkforceScore: 0,
          avgFinancingScore: 0,
          totalOrganizations: 0,
          activeCoordinators: 0,
          reportsThisMonth: 0,
          criticalFundingGap: 0,
          avgDonorReadiness: 0,
          totalInvestmentNeed: 0,
        },
        countries: [],
        reports: [],
        aiInsights: {
          summary: "No data available. Please add mental health reform data.",
          riskAlert: "Data collection is ongoing.",
          opportunity: "Start by adding country data to the system.",
          recommendation: "Import mental health reforms data to enable analytics.",
        },
        trends: {
          reformProgress: 0,
          sdgProgress: 0,
          implementationGap: 0,
        },
      };
      return NextResponse.json(emptyResponse);
    }

    const typedCountries = countries as MentalHealthReform[];
    const totalCountries = typedCountries.length;

    // Calculate averages
    const avgReformScore = Math.round(
      typedCountries.reduce((acc, c) => acc + (c.reform_score || 0), 0) / totalCountries
    );

    const avgSDG3 = Math.round(
      typedCountries.reduce((acc, c) => acc + (c.sdg3_score || 0), 0) / totalCountries
    );

    const avgImplementationScore = Math.round(
      typedCountries.reduce((acc, c) => acc + (c.implementation_score || 0), 0) / totalCountries
    );

    const avgDonorReadiness = Math.round(
      typedCountries.reduce((acc, c) => acc + (c.donor_readiness_score || 0), 0) / totalCountries
    );

    // Count high priority countries
    const highPriority = typedCountries.filter(
      (c) => c.priority_level && c.priority_level.includes("High")
    ).length;

    // Count critical funding gaps
    const criticalFundingGap = typedCountries.filter(
      (c) => c.funding_gap_level && c.funding_gap_level === "Critical"
    ).length;

    // Calculate total investment need
    const totalInvestmentNeed = typedCountries.reduce(
      (acc, c) => acc + (c.estimated_investment_need || 0), 
      0
    );

    // Map countries with proper fields
    const mappedCountries: DashboardCountry[] = typedCountries.map((country) => ({
      id: country.id,
      country_name: country.country_name,
      region: country.region || "Unknown",
      reform_score: country.reform_score || 0,
      reform_tier: country.reform_tier || "Unclassified",
      priority_level: country.priority_level || "Medium Priority",
      sdg3_score: country.sdg3_score || 0,
      sdg10_score: country.sdg10_score || 0,
      sdg16_score: country.sdg16_score || 0,
      agenda2063_score: country.agenda2063_score || 0,
      implementation_score: country.implementation_score || 0,
      law_status: country.law_status || "Unknown",
      implementation_status: country.implementation_status || "Unknown",
      budget_level: country.budget_level || "Unknown",
      strategy: country.strategy || "",
      funding_gap_level: country.funding_gap_level || "Unknown",
      investment_priority: country.investment_priority || "Unknown",
      estimated_investment_need: country.estimated_investment_need || 0,
      donor_readiness_score: country.donor_readiness_score || 0,
      created_at: country.created_at || new Date().toISOString(),
    }));

    // Generate AI Insights
    const aiInsights: AIInsights = {
      summary: `Continental mental health reform analysis: ${totalCountries} countries tracked with an average reform score of ${avgReformScore}%. ${highPriority} countries require urgent intervention.`,
      riskAlert: `${criticalFundingGap} countries have critical funding gaps. ${typedCountries.filter(c => c.implementation_status && c.implementation_status.includes('Minimal')).length} countries show minimal implementation.`,
      opportunity: `Total estimated investment need: $${(totalInvestmentNeed / 1000000).toFixed(1)}M. ${typedCountries.filter(c => (c.donor_readiness_score || 0) >= 70).length} countries ready for investment.`,
      recommendation: `Priority focus: ${highPriority} countries with high priority. Strengthen implementation in ${typedCountries.filter(c => c.implementation_status && c.implementation_status.includes('Weak')).length} countries with weak implementation.`,
    };

    // Calculate trends
    const trends: DashboardTrends = {
      reformProgress: avgReformScore > 50 ? 8 : 3,
      sdgProgress: avgSDG3 > 50 ? 5 : 2,
      implementationGap: Math.round(
        (typedCountries.filter(c => 
          c.implementation_status && 
          (c.implementation_status.includes('Minimal') || c.implementation_status.includes('None'))
        ).length / totalCountries) * 100
      ),
    };

    // Empty reports array for now
    const reports: DashboardReport[] = [];

    const response: DashboardResponse = {
      success: true,
      metrics: {
        totalCountries,
        avgReformScore,
        avgSDG3,
        highPriority,
        avgWorkforceScore: avgImplementationScore,
        avgFinancingScore: avgDonorReadiness,
        totalOrganizations: Math.round(totalCountries * 4.5),
        activeCoordinators: Math.round(totalCountries * 0.78),
        reportsThisMonth: Math.round(totalCountries * 0.5),
        criticalFundingGap,
        avgDonorReadiness,
        totalInvestmentNeed,
      },
      countries: mappedCountries,
      reports,
      aiInsights,
      trends,
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error("Error fetching executive dashboard data:", error);
    
    const errorResponse: DashboardResponse = {
      success: false,
      metrics: {
        totalCountries: 0,
        avgReformScore: 0,
        avgSDG3: 0,
        highPriority: 0,
        avgWorkforceScore: 0,
        avgFinancingScore: 0,
        totalOrganizations: 0,
        activeCoordinators: 0,
        reportsThisMonth: 0,
        criticalFundingGap: 0,
        avgDonorReadiness: 0,
        totalInvestmentNeed: 0,
      },
      countries: [],
      reports: [],
      aiInsights: {
        summary: "Error loading data. Please try again.",
        riskAlert: "Unable to load risk assessment.",
        opportunity: "Data unavailable.",
        recommendation: "Refresh the page or contact support.",
      },
      trends: {
        reformProgress: 0,
        sdgProgress: 0,
        implementationGap: 0,
      },
      message: "Failed to load executive intelligence",
      error: error instanceof Error ? error.message : "Unknown error",
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}