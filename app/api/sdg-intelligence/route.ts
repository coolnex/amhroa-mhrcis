// app/api/sdg-intelligence/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const region = searchParams.get("region");
    const year = searchParams.get("year");

    let query = supabase
      .from("mental_health_reforms")
      .select(`
        id,
        country_name,
        reform_tier,
        law_status,
        implementation_status,
        budget_level,
        priority_level,
        strategy,
        reform_score,
        implementation_score,
        sdg3_score,
        sdg10_score,
        sdg16_score,
        agenda2063_score,
        funding_gap_level,
        investment_priority,
        estimated_investment_need,
        donor_readiness_score,
        created_at
      `)
      .order("reform_score", { ascending: false });

    // Apply filters
    if (region && region !== "all") {
      // Note: region is not in mental_health_reforms table
      // You might need to add a region column or join with countries table
      // For now, we'll skip region filtering
    }

    const { data, error } = await query;

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        {
          success: false,
          message: "Failed to fetch SDG intelligence",
          error: error.message,
        },
        { status: 500 }
      );
    }

    // Calculate SDG metrics
    const metrics = {
      total_countries: data?.length || 0,
      average_sdg_score: Math.round(data?.reduce((sum, c) => sum + (c.sdg3_score || 0), 0) / (data?.length || 1)),
      average_sdg_3_4: Math.round(data?.reduce((sum, c) => sum + (c.sdg3_score || 0), 0) / (data?.length || 1)),
      average_sdg_10_2: Math.round(data?.reduce((sum, c) => sum + (c.sdg10_score || 0), 0) / (data?.length || 1)),
      average_sdg_16_3: Math.round(data?.reduce((sum, c) => sum + (c.sdg16_score || 0), 0) / (data?.length || 1)),
      high_performers: data?.filter(c => (c.sdg3_score || 0) >= 70 && (c.sdg16_score || 0) >= 70).length || 0,
      low_performers: data?.filter(c => (c.sdg3_score || 0) < 40 || (c.sdg16_score || 0) < 40).length || 0,
    };

    // Group by reform tier (as proxy for region)
    const byTier = data?.reduce((acc, country) => {
      const tier = country.reform_tier || "Unclassified";
      if (!acc[tier]) {
        acc[tier] = {
          region: tier,
          countries: [],
          average_sdg_score: 0,
        };
      }
      acc[tier].countries.push(country);
      const scores = acc[tier].countries.map((c: any) => c.sdg3_score || 0);
      acc[tier].average_sdg_score = Math.round(
        scores.reduce((sum: number, s: number) => sum + s, 0) / scores.length
      );
      return acc;
    }, {} as Record<string, any>);

    // Get top performers based on combined SDG scores
    const topPerformers = data?.slice(0, 10).map((country, index) => {
      const sdgScore = Math.round(
        ((country.sdg3_score || 0) + (country.sdg10_score || 0) + (country.sdg16_score || 0)) / 3
      );
      return {
        rank: index + 1,
        country_name: country.country_name,
        sdg_score: sdgScore,
        sdg_3_4_score: country.sdg3_score || 0,
        sdg_10_2_score: country.sdg10_score || 0,
        sdg_16_3_score: country.sdg16_score || 0,
        reform_tier: country.reform_tier,
        priority_level: country.priority_level,
      };
    });

    // Get bottom performers
    const bottomPerformers = data?.slice(-10).reverse().map((country, index) => {
      const sdgScore = Math.round(
        ((country.sdg3_score || 0) + (country.sdg10_score || 0) + (country.sdg16_score || 0)) / 3
      );
      return {
        rank: (data?.length || 0) - 9 + index,
        country_name: country.country_name,
        sdg_score: sdgScore,
        sdg_3_4_score: country.sdg3_score || 0,
        sdg_10_2_score: country.sdg10_score || 0,
        sdg_16_3_score: country.sdg16_score || 0,
        reform_tier: country.reform_tier,
        priority_level: country.priority_level,
      };
    });

    // Transform data to match frontend interface
    const transformedData = data?.map(country => ({
      id: country.id.toString(),
      country_name: country.country_name,
      region: country.reform_tier || "Unclassified",
      sdg_score: Math.round(
        ((country.sdg3_score || 0) + (country.sdg10_score || 0) + (country.sdg16_score || 0)) / 3
      ),
      sdg_3_4_score: country.sdg3_score || 0,
      sdg_10_2_score: country.sdg10_score || 0,
      sdg_16_3_score: country.sdg16_score || 0,
      reform_score: country.reform_score || 0,
      population: 0, // Not available in this table
      last_updated: country.created_at || new Date().toISOString(),
      // Additional fields
      reform_tier: country.reform_tier,
      law_status: country.law_status,
      implementation_status: country.implementation_status,
      budget_level: country.budget_level,
      priority_level: country.priority_level,
      funding_gap_level: country.funding_gap_level,
      investment_priority: country.investment_priority,
      estimated_investment_need: country.estimated_investment_need,
      donor_readiness_score: country.donor_readiness_score,
      agenda2063_score: country.agenda2063_score,
    }));

    return NextResponse.json({
      success: true,
      countries: transformedData || [],
      metrics,
      by_region: Object.values(byTier || {}),
      top_performers: topPerformers || [],
      bottom_performers: bottomPerformers || [],
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch SDG intelligence",
      },
      { status: 500 }
    );
  }
}

// POST endpoint to update SDG scores for a country
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      country_id,
      sdg_score,
      sdg_3_4_score,
      sdg_10_2_score,
      sdg_16_3_score,
      reform_score,
      agenda2063_score,
      donor_readiness_score,
    } = body;

    if (!country_id) {
      return NextResponse.json(
        { success: false, message: "Country ID is required" },
        { status: 400 }
      );
    }

    const updateData: any = {};

    if (sdg_3_4_score !== undefined) updateData.sdg3_score = sdg_3_4_score;
    if (sdg_10_2_score !== undefined) updateData.sdg10_score = sdg_10_2_score;
    if (sdg_16_3_score !== undefined) updateData.sdg16_score = sdg_16_3_score;
    if (reform_score !== undefined) updateData.reform_score = reform_score;
    if (agenda2063_score !== undefined) updateData.agenda2063_score = agenda2063_score;
    if (donor_readiness_score !== undefined) updateData.donor_readiness_score = donor_readiness_score;

    // Update the record
    const { data, error } = await supabase
      .from("mental_health_reforms")
      .update(updateData)
      .eq("id", country_id)
      .select();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { success: false, message: "Failed to update SDG scores" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "SDG scores updated successfully",
      country: data,
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update SDG scores" },
      { status: 500 }
    );
  }
}