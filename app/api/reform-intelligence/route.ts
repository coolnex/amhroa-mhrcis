// app/api/reform-intelligence/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tier = searchParams.get("tier");
    const region = searchParams.get("region");
    const priority = searchParams.get("priority");

    let query = supabase
      .from("countries")
      .select(`
        id,
        country_name,
        region,
        reform_score,
        reform_tier,
        legislation_score,
        implementation_score,
        budget_level,
        priority_level,
        law_status,
        implementation_status,
        population,
        key_gaps,
        last_updated
      `)
      .order("reform_score", { ascending: false });

    // Apply filters
    if (tier && tier !== "all") {
      query = query.eq("reform_tier", tier);
    }
    if (region && region !== "all") {
      query = query.eq("region", region);
    }
    if (priority && priority !== "all") {
      query = query.eq("priority_level", priority);
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

    // Calculate continental metrics
    const metrics = {
      total_countries: data?.length || 0,
      average_reform_score: Math.round(data?.reduce((sum, c) => sum + (c.reform_score || 0), 0) / (data?.length || 1)),
      tier_1_count: data?.filter(c => c.reform_tier === "Tier 1").length || 0,
      tier_2_count: data?.filter(c => c.reform_tier === "Tier 2").length || 0,
      tier_3_count: data?.filter(c => c.reform_tier === "Tier 3").length || 0,
      tier_4_count: data?.filter(c => c.reform_tier === "Tier 4").length || 0,
      tier_5_count: data?.filter(c => c.reform_tier === "Tier 5").length || 0,
      high_priority_count: data?.filter(c => c.priority_level === "High").length || 0,
      critical_count: data?.filter(c => c.reform_score < 30).length || 0,
    };

    // Group by tier
    const byTier = data?.reduce((acc, country) => {
      const tier = country.reform_tier || "Unclassified";
      if (!acc[tier]) {
        acc[tier] = [];
      }
      acc[tier].push(country);
      return acc;
    }, {} as Record<string, any[]>);

    // Group by region
    const byRegion = data?.reduce((acc, country) => {
      const region = country.region || "Unknown";
      if (!acc[region]) {
        acc[region] = {
          region: region,
          countries: [],
          average_score: 0,
        };
      }
      acc[region].countries.push(country);
      acc[region].average_score = Math.round(
        acc[region].countries.reduce((sum: any, c: { reform_score: any; }) => sum + (c.reform_score || 0), 0) / 
        acc[region].countries.length
      );
      return acc;
    }, {} as Record<string, any>);

    return NextResponse.json({
      success: true,
      reforms: data,
      metrics,
      by_tier: byTier,
      by_region: Object.values(byRegion || {}),
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch reform intelligence",
      },
      { status: 500 }
    );
  }
}

// POST endpoint to update reform data for a country
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      country_id,
      reform_score,
      reform_tier,
      legislation_score,
      implementation_score,
      budget_level,
      priority_level,
      law_status,
      implementation_status,
      key_gaps,
    } = body;

    if (!country_id) {
      return NextResponse.json(
        { success: false, message: "Country ID is required" },
        { status: 400 }
      );
    }

    const updateData: any = {
      updated_at: new Date().toISOString(),
      last_updated: new Date().toISOString(),
    };
    
    if (reform_score !== undefined) updateData.reform_score = reform_score;
    if (reform_tier !== undefined) updateData.reform_tier = reform_tier;
    if (legislation_score !== undefined) updateData.legislation_score = legislation_score;
    if (implementation_score !== undefined) updateData.implementation_score = implementation_score;
    if (budget_level !== undefined) updateData.budget_level = budget_level;
    if (priority_level !== undefined) updateData.priority_level = priority_level;
    if (law_status !== undefined) updateData.law_status = law_status;
    if (implementation_status !== undefined) updateData.implementation_status = implementation_status;
    if (key_gaps !== undefined) updateData.key_gaps = key_gaps;

    const { data, error } = await supabase
      .from("countries")
      .update(updateData)
      .eq("id", country_id)
      .select();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { success: false, message: "Failed to update reform data" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Reform data updated successfully",
      country: data,
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update reform data" },
      { status: 500 }
    );
  }
}