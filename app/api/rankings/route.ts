// app/api/rankings/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const region = searchParams.get("region");
    const year = searchParams.get("year");
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : 54;

    let query = supabase
      .from("countries")
      .select(`
        id,
        country_name,
        region,
        reform_score,
        reform_tier,
        sdg_score,
        legislation_score,
        workforce_score,
        financing_score,
        population,
        previous_rank,
        trend,
        last_updated
      `)
      .order("reform_score", { ascending: false })
      .limit(limit);

    // Apply filters
    if (region && region !== "all") {
      query = query.eq("region", region);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        {
          success: false,
          message: "Failed to fetch rankings",
          error: error.message,
        },
        { status: 500 }
      );
    }

    // Calculate additional rankings data
    const rankingsWithRank = data?.map((country, index) => ({
      ...country,
      rank: index + 1,
      previous_rank: country.previous_rank || index + 1,
      trend: country.trend || (index + 1 < (country.previous_rank || index + 1) ? "up" : 
              index + 1 > (country.previous_rank || index + 1) ? "down" : "same"),
    })) || [];

    // Get continent-wide statistics
    const stats = {
      total_countries: data?.length || 0,
      average_score: Math.round(data?.reduce((sum, c) => sum + (c.reform_score || 0), 0) / (data?.length || 1)),
      highest_score: Math.max(...(data?.map(c => c.reform_score) || [0])),
      lowest_score: Math.min(...(data?.map(c => c.reform_score) || [0])),
      top_performer: data?.[0]?.country_name || "N/A",
      top_score: data?.[0]?.reform_score || 0,
    };

    // Group by region
    const byRegion = data?.reduce((acc, country) => {
      if (!acc[country.region]) {
        acc[country.region] = {
          region: country.region,
          countries: [],
          average_score: 0,
        };
      }
      acc[country.region].countries.push(country);
      acc[country.region].average_score = Math.round(
        acc[country.region].countries.reduce((sum: any, c: { reform_score: any; }) => sum + (c.reform_score || 0), 0) / 
        acc[country.region].countries.length
      );
      return acc;
    }, {} as Record<string, any>);

    return NextResponse.json({
      success: true,
      rankings: rankingsWithRank,
      stats,
      by_region: Object.values(byRegion || {}),
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch rankings",
      },
      { status: 500 }
    );
  }
}

// POST endpoint to update rankings (e.g., when new scores are calculated)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { country_id, reform_score, previous_rank } = body;

    if (!country_id) {
      return NextResponse.json(
        { success: false, message: "Country ID is required" },
        { status: 400 }
      );
    }

    // Get current rank to set as previous
    const { data: currentData } = await supabase
      .from("countries")
      .select("reform_score")
      .eq("id", country_id)
      .single();

    const updateData: any = {};
    if (reform_score !== undefined) {
      updateData.reform_score = reform_score;
    }
    if (previous_rank !== undefined) {
      updateData.previous_rank = previous_rank;
    } else if (currentData) {
      // Store current rank as previous for next update
      const { data: allCountries } = await supabase
        .from("countries")
        .select("id, reform_score")
        .order("reform_score", { ascending: false });
      
      const currentRank = allCountries?.findIndex(c => c.id === country_id) || 0;
      updateData.previous_rank = currentRank + 1;
    }

    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("countries")
      .update(updateData)
      .eq("id", country_id)
      .select();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { success: false, message: "Failed to update ranking" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Ranking updated successfully",
      country: data,
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update ranking" },
      { status: 500 }
    );
  }
}