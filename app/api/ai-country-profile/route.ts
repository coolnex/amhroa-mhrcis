import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const countryId = searchParams.get("countryId");

    if (!countryId) {
      return NextResponse.json(
        {
          success: false,
          message: "Country ID required",
        },
        { status: 400 }
      );
    }

    const { data: country, error } = await supabase
      .from("mental_health_reforms")
      .select("*")
      .eq("id", countryId)
      .single();

    if (error || !country) {
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

    let reformLevel = "";
    let riskLevel = "";

    const recommendations: string[] = [];

    // Reform Level

    if (country.reform_score >= 80) {
      reformLevel = "High Reform Progress";
    } else if (country.reform_score >= 50) {
      reformLevel = "Moderate Reform Progress";
    } else {
      reformLevel = "Low Reform Progress";
    }

    // Risk Level

    if (country.reform_score >= 75) {
      riskLevel = "Low Governance Risk";
    } else if (country.reform_score >= 50) {
      riskLevel = "Moderate Governance Risk";
    } else {
      riskLevel = "High Governance Risk";
    }

    /*
      Recommendations based on your new table
    */

    if (country.budget_level === "Low") {
      recommendations.push(
        "Increase national mental health budget allocation."
      );
    }

    if (
      country.implementation_status === "Critical"
    ) {
      recommendations.push(
        "Accelerate implementation of mental health reforms."
      );
    }

    if (
      country.law_status === "No Law"
    ) {
      recommendations.push(
        "Develop and enact national mental health legislation."
      );
    }

    if (
      country.donor_readiness_score < 50
    ) {
      recommendations.push(
        "Improve donor readiness and investment governance."
      );
    }

    if (
      country.funding_gap_level === "High"
    ) {
      recommendations.push(
        "Prioritize resource mobilization and donor engagement."
      );
    }

    /*
      AI Summary
    */

    const summary = `
${country.country_name} demonstrates ${reformLevel.toLowerCase()}
with a reform score of ${country.reform_score}%.

Current assessment indicates
${riskLevel.toLowerCase()}.

Priority level:
${country.priority_level}.

Strategic reform pathway:
${country.strategy}.

Key recommendations:
${recommendations.join(" ")}
`;

    return NextResponse.json({
      success: true,

      country: {
        id: country.id,
        country_name: country.country_name,
        reform_tier: country.reform_tier,
        law_status: country.law_status,
        implementation_status:
          country.implementation_status,
        reform_score:
          country.reform_score,
      },

      intelligence: {
        reformLevel,
        riskLevel,
        recommendations,
        summary,
      },
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to generate country intelligence profile",
      },
      { status: 500 }
    );
  }
}