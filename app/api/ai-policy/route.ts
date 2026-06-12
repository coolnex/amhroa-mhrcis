import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const { data: countries, error } = await supabase
      .from("mental_health_reforms")
      .select("*");

    if (error) {
      throw error;
    }

    const intelligence = (countries || []).map(
      (country: any) => {
        const recommendations: string[] = [];

        /*
          LAW ANALYSIS
        */
        if (
          country.law_status ===
          "No Law"
        ) {
          recommendations.push(
            "Develop and adopt modern rights-based mental health legislation."
          );
        }

        /*
          IMPLEMENTATION
        */
        if (
          country.implementation_status ===
          "Critical"
        ) {
          recommendations.push(
            "Establish national implementation framework and emergency workforce development."
          );
        }

        if (
          country.implementation_status ===
          "Moderate"
        ) {
          recommendations.push(
            "Strengthen decentralization and community mental health services."
          );
        }

        /*
          SDG ANALYSIS
        */
        if (
          (country.sdg3_score || 0) < 50
        ) {
          recommendations.push(
            "Increase SDG 3 investment in mental health integration and primary healthcare."
          );
        }

        /*
          GOVERNANCE
        */
        if (
          (country.sdg16_score || 0) < 50
        ) {
          recommendations.push(
            "Strengthen governance, human rights protections, and accountability systems."
          );
        }

        /*
          PRIORITY
        */
        if (
          country.priority_level ===
          "High Priority"
        ) {
          recommendations.push(
            "Mobilize urgent donor, AU, and WHO engagement."
          );
        }

        /*
          DONOR READINESS
        */
        if (
          (country.donor_readiness_score || 0) < 50
        ) {
          recommendations.push(
            "Improve donor readiness through stronger accountability and investment planning."
          );
        }

        /*
          FUNDING GAP
        */
        if (
          country.funding_gap_level ===
          "High"
        ) {
          recommendations.push(
            "Develop a national mental health financing roadmap."
          );
        }

        return {
          ...country,
          ai_recommendations:
            recommendations,
        };
      }
    );

    return NextResponse.json({
      success: true,
      intelligence,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message:
          "AI intelligence generation failed",
      },
      { status: 500 }
    );
  }
}