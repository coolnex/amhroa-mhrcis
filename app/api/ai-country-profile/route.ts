// app/api/ai-country-profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const countryId = searchParams.get("countryId");

    if (!countryId) {
      return NextResponse.json(
        {
          success: false,
          message: "Country ID is required",
        },
        { status: 400 }
      );
    }

    // Check if supabase is initialized
    if (!supabase) {
      console.error("Supabase client not initialized");
      return NextResponse.json(
        {
          success: false,
          message: "Database client not available",
        },
        { status: 500 }
      );
    }

    // Fetch country data
    const { data: country, error } = await supabase
      .from("mental_health_reforms")
      .select("*")
      .eq("id", countryId)
      .single();

    if (error) {
      console.error("Error fetching country:", error);
      return NextResponse.json(
        {
          success: false,
          message: "Country not found or error fetching data",
          error: error.message,
        },
        { status: 404 }
      );
    }

    if (!country) {
      return NextResponse.json(
        {
          success: false,
          message: "Country not found",
        },
        { status: 404 }
      );
    }

    /*
      AI INTELLIGENCE ENGINE
    */

    // Determine reform level
    let reformLevel = "";
    if (country.reform_score >= 80) {
      reformLevel = "High Reform Progress";
    } else if (country.reform_score >= 50) {
      reformLevel = "Moderate Reform Progress";
    } else {
      reformLevel = "Low Reform Progress";
    }

    // Determine risk level
    let riskLevel = "";
    if (country.reform_score >= 75) {
      riskLevel = "Low Governance Risk";
    } else if (country.reform_score >= 50) {
      riskLevel = "Moderate Governance Risk";
    } else {
      riskLevel = "High Governance Risk";
    }

    // Generate recommendations
    const recommendations: string[] = [];

    if (country.budget_level === "Low") {
      recommendations.push("Increase national mental health budget allocation.");
    }

    if (country.implementation_status === "Critical") {
      recommendations.push("Accelerate implementation of mental health reforms.");
    }

    if (country.law_status === "No Law") {
      recommendations.push("Develop and enact national mental health legislation.");
    }

    if (country.donor_readiness_score < 50) {
      recommendations.push("Improve donor readiness and investment governance.");
    }

    if (country.funding_gap_level === "High") {
      recommendations.push("Prioritize resource mobilization and donor engagement.");
    }

    // Ensure we have at least one recommendation
    if (recommendations.length === 0) {
      recommendations.push("Continue current reform trajectory and monitor progress.");
    }

    // Generate AI summary
    const summary = `
${country.country_name} demonstrates ${reformLevel.toLowerCase()}
with a reform score of ${country.reform_score}%.

Current assessment indicates ${riskLevel.toLowerCase()}.

Priority level: ${country.priority_level || "Not specified"}.

Strategic reform pathway: ${country.strategy || "No strategy defined"}.

Key recommendations: ${recommendations.join(" ")}
`;

    return NextResponse.json({
      success: true,
      country: {
        id: country.id,
        country_name: country.country_name,
        reform_tier: country.reform_tier,
        law_status: country.law_status,
        implementation_status: country.implementation_status,
        reform_score: country.reform_score,
      },
      intelligence: {
        reformLevel,
        riskLevel,
        recommendations,
        summary,
      },
    });
  } catch (error) {
    console.error("Error in AI country profile:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to generate country intelligence profile",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}