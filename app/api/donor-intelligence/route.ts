// app/api/donor-intelligence/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("countries")
      .select(`
        id,
        country_name,
        region,
        reform_score,
        reform_tier,
        population,
        funding_gap_level,
        funding_gap_score,
        investment_priority,
        estimated_investment_need,
        current_funding,
        donor_readiness_score,
        roi_potential,
        risk_level,
        key_gaps,
        recommended_donors,
        last_updated
      `)
      .order("estimated_investment_need", { ascending: false });

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        {
          success: false,
          message: "Failed to fetch donor intelligence",
          error: error.message,
        },
        { status: 500 }
      );
    }

    // Calculate additional metrics
    const totalFundingGap = data?.reduce((sum, country) => 
      sum + (country.estimated_investment_need || 0) - (country.current_funding || 0), 0
    ) || 0;

    const averageReadiness = data?.reduce((sum, country) => 
      sum + (country.donor_readiness_score || 0), 0
    ) / (data?.length || 1) || 0;

    return NextResponse.json({
      success: true,
      countries: data,
      metrics: {
        total_funding_gap: totalFundingGap,
        average_donor_readiness: Math.round(averageReadiness),
        high_priority_countries: data?.filter(c => c.investment_priority === "High").length || 0,
        critical_funding_gap: data?.filter(c => c.funding_gap_level === "Critical").length || 0,
      },
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch donor intelligence",
      },
      { status: 500 }
    );
  }
}

// POST endpoint to update donor intelligence for a specific country
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      country_id,
      funding_gap_level,
      funding_gap_score,
      investment_priority,
      estimated_investment_need,
      current_funding,
      donor_readiness_score,
      roi_potential,
      risk_level,
      key_gaps,
      recommended_donors,
    } = body;

    if (!country_id) {
      return NextResponse.json(
        { success: false, message: "Country ID is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("countries")
      .update({
        funding_gap_level,
        funding_gap_score,
        investment_priority,
        estimated_investment_need,
        current_funding,
        donor_readiness_score,
        roi_potential,
        risk_level,
        key_gaps,
        recommended_donors,
        updated_at: new Date().toISOString(),
      })
      .eq("id", country_id)
      .select();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { success: false, message: "Failed to update donor intelligence" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Donor intelligence updated successfully",
      country: data,
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update donor intelligence" },
      { status: 500 }
    );
  }
}