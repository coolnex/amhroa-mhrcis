// app/api/reform-intelligence/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tier = searchParams.get("tier");
    const region = searchParams.get("region");
    const priority = searchParams.get("priority");
    const search = searchParams.get("search");

    // Build query using mental_health_reforms table
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
      .order("country_name", { ascending: true });

    // Apply filters
    if (tier && tier !== "all") {
      query = query.ilike("reform_tier", `%${tier}%`);
    }
    
    if (priority && priority !== "all") {
      query = query.ilike("priority_level", `%${priority}%`);
    }

    if (search && search.trim() !== "") {
      query = query.ilike("country_name", `%${search.trim()}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        {
          success: false,
          message: "Failed to fetch reform intelligence",
          error: error.message,
        },
        { status: 500 }
      );
    }

    // Map data to match the expected format
    const mappedData = (data || []).map((item: any) => ({
      id: item.id,
      country_name: item.country_name || "Unknown",
      region: "Africa", // Default since region isn't in the table
      law_status: item.law_status || "Unknown",
      implementation_status: item.implementation_status || "Unknown",
      budget_level: item.budget_level || "Unknown",
      priority_level: item.priority_level || "Medium",
      reform_score: item.reform_score || 0,
      reform_tier: item.reform_tier || "Unclassified",
      population: 0, // Not in table, default to 0
      last_updated: item.created_at || new Date().toISOString(),
      key_gaps: [], // Not in table, default to empty array
      implementation_score: item.implementation_score || 0,
      sdg3_score: item.sdg3_score || 0,
      sdg10_score: item.sdg10_score || 0,
      sdg16_score: item.sdg16_score || 0,
      agenda2063_score: item.agenda2063_score || 0,
      funding_gap_level: item.funding_gap_level || "Unknown",
      investment_priority: item.investment_priority || "Unknown",
      estimated_investment_need: item.estimated_investment_need || 0,
      donor_readiness_score: item.donor_readiness_score || 0,
    }));

    // Calculate continental metrics
    const metrics = {
      total_countries: mappedData?.length || 0,
      average_reform_score: mappedData?.length > 0 
        ? Math.round(mappedData.reduce((sum: number, c: any) => sum + (c.reform_score || 0), 0) / mappedData.length)
        : 0,
      tier_1_count: mappedData?.filter((c: any) => c.reform_tier?.includes("Tier 1")).length || 0,
      tier_2_count: mappedData?.filter((c: any) => c.reform_tier?.includes("Tier 2")).length || 0,
      tier_3_count: mappedData?.filter((c: any) => c.reform_tier?.includes("Tier 3")).length || 0,
      tier_4_count: mappedData?.filter((c: any) => c.reform_tier?.includes("Tier 4")).length || 0,
      tier_5_count: mappedData?.filter((c: any) => c.reform_tier?.includes("Tier 5")).length || 0,
      high_priority_count: mappedData?.filter((c: any) => c.priority_level?.includes("High")).length || 0,
      critical_count: mappedData?.filter((c: any) => (c.reform_score || 0) < 30).length || 0,
    };

    // Group by tier
    const byTier = mappedData?.reduce((acc: Record<string, any[]>, country: any) => {
      const tier = country.reform_tier || "Unclassified";
      if (!acc[tier]) {
        acc[tier] = [];
      }
      acc[tier].push(country);
      return acc;
    }, {} as Record<string, any[]>);

    return NextResponse.json({
      success: true,
      reforms: mappedData,
      metrics,
      by_tier: byTier,
      by_region: [], // Region grouping removed since region not in table
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch reform intelligence",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}