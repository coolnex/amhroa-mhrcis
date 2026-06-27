// app/api/rankings/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const region = searchParams.get("region");
    const year = searchParams.get("year");
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : 54;

    // 1. Fetch data from countries table
    const { data: countriesData, error: countriesError } = await supabase
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
        implementation_score,
        population,
        previous_rank,
        trend,
        priority_level,
        law_status,
        implementation_status,
        budget_level,
        funding_gap_level,
        investment_priority,
        donor_readiness_score,
        psychiatrists_per_100k,
        last_updated
      `)
      .order("reform_score", { ascending: false });

    if (countriesError) {
      console.error("Countries table error:", countriesError);
    }

    // 2. Fetch data from mental_health_reforms table
    const { data: reformsData, error: reformsError } = await supabase
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

    if (reformsError) {
      console.error("Mental health reforms table error:", reformsError);
    }

    // 3. Merge data from both tables
    const mergedData = mergeRankingsData(countriesData || [], reformsData || []);

    // 4. Apply region filter if specified
    let filteredData = mergedData;
    if (region && region !== "all") {
      filteredData = mergedData.filter(c => c.region === region);
    }

    // 5. Sort by reform score (highest first)
    filteredData.sort((a, b) => (b.reform_score || 0) - (a.reform_score || 0));

    // 6. Apply limit
    if (limit && filteredData.length > limit) {
      filteredData = filteredData.slice(0, limit);
    }

    // 7. Calculate rankings with rank and trend
    const rankingsWithRank = filteredData.map((country, index) => {
      const rank = index + 1;
      const previousRank = country.previous_rank || rank;
      
      let trend = country.trend || "same";
      if (!country.trend) {
        if (rank < previousRank) trend = "up";
        else if (rank > previousRank) trend = "down";
        else trend = "same";
      }

      return {
        ...country,
        rank,
        previous_rank: previousRank,
        trend,
        // Calculate additional metrics
        sdg_score: country.sdg_score || Math.round(
          ((country.sdg3_score || 0) + (country.sdg10_score || 0) + (country.sdg16_score || 0)) / 3
        ),
        // Map fields for consistency
        reform_tier: country.reform_tier || "Not Classified",
        law_status: country.law_status || "Not Specified",
        implementation_status: country.implementation_status || "Not Specified",
        priority_level: country.priority_level || "Medium",
      };
    });

    // 8. Calculate continent-wide statistics
    const stats = calculateRankingStats(rankingsWithRank);

    // 9. Group by region
    const byRegion = groupByRegion(rankingsWithRank);

    // 10. Get top performers by category
    const topPerformers = getTopPerformers(rankingsWithRank);

    return NextResponse.json({
      success: true,
      rankings: rankingsWithRank,
      stats,
      by_region: byRegion,
      top_performers: topPerformers,
      data_sources: {
        countries_table: countriesData?.length || 0,
        reforms_table: reformsData?.length || 0,
        merged_total: mergedData.length,
      },
    });
  } catch (error) {
    console.error("Error fetching rankings:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch rankings",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Helper function to merge rankings data from both tables
function mergeRankingsData(countriesData: any[], reformsData: any[]) {
  // Create a map of country data from reforms table
  const reformsMap = new Map();
  reformsData.forEach(reform => {
    reformsMap.set(reform.country_name, reform);
  });

  // Create a set of country names from countries table
  const countryNames = new Set(countriesData.map(c => c.country_name));

  // Merge data, prioritizing countries table but filling gaps from reforms
  const merged = countriesData.map(country => {
    const reform = reformsMap.get(country.country_name);
    
    return {
      ...country,
      // Use reform data if country data is missing or null
      reform_tier: country.reform_tier || reform?.reform_tier || "Not Classified",
      law_status: country.law_status || reform?.law_status || "Not Specified",
      implementation_status: country.implementation_status || reform?.implementation_status || "Not Specified",
      budget_level: country.budget_level || reform?.budget_level || "Not Specified",
      priority_level: country.priority_level || reform?.priority_level || "Medium",
      reform_score: country.reform_score || reform?.reform_score || 0,
      implementation_score: country.implementation_score || reform?.implementation_score || 0,
      funding_gap_level: country.funding_gap_level || reform?.funding_gap_level || null,
      investment_priority: country.investment_priority || reform?.investment_priority || null,
      donor_readiness_score: country.donor_readiness_score || reform?.donor_readiness_score || 0,
      // Additional fields from reforms
      strategy: reform?.strategy || null,
      sdg3_score: country.sdg_3_4_score || reform?.sdg3_score || 0,
      sdg10_score: country.sdg_10_2_score || reform?.sdg10_score || 0,
      sdg16_score: country.sdg_16_3_score || reform?.sdg16_score || 0,
      agenda2063_score: reform?.agenda2063_score || 0,
      estimated_investment_need: reform?.estimated_investment_need || 0,
      // Calculated fields
      sdg_score: country.sdg_score || Math.round(
        ((country.sdg_3_4_score || reform?.sdg3_score || 0) + 
         (country.sdg_10_2_score || reform?.sdg10_score || 0) + 
         (country.sdg_16_3_score || reform?.sdg16_score || 0)) / 3
      ),
      region: country.region || "Not Specified",
      data_source: {
        countries_table: !!country,
        reforms_table: !!reform,
      },
    };
  });

  // Add countries that are only in reforms table
  reformsData.forEach(reform => {
    if (!countryNames.has(reform.country_name)) {
      merged.push({
        id: `reform_${reform.id}`,
        country_name: reform.country_name,
        region: "Not Specified",
        reform_tier: reform.reform_tier || "Not Classified",
        law_status: reform.law_status || "Not Specified",
        implementation_status: reform.implementation_status || "Not Specified",
        budget_level: reform.budget_level || "Not Specified",
        priority_level: reform.priority_level || "Medium",
        reform_score: reform.reform_score || 0,
        implementation_score: reform.implementation_score || 0,
        sdg_score: Math.round((reform.sdg3_score + reform.sdg10_score + reform.sdg16_score) / 3) || 0,
        legislation_score: reform.sdg16_score || 0,
        workforce_score: reform.implementation_score || 0,
        financing_score: reform.donor_readiness_score || 0,
        funding_gap_level: reform.funding_gap_level || null,
        investment_priority: reform.investment_priority || null,
        donor_readiness_score: reform.donor_readiness_score || 0,
        sdg3_score: reform.sdg3_score || 0,
        sdg10_score: reform.sdg10_score || 0,
        sdg16_score: reform.sdg16_score || 0,
        agenda2063_score: reform.agenda2063_score || 0,
        estimated_investment_need: reform.estimated_investment_need || 0,
        strategy: reform.strategy || null,
        population: 0,
        previous_rank: 0,
        trend: "same",
        last_updated: reform.created_at || new Date().toISOString(),
        data_source: {
          countries_table: false,
          reforms_table: true,
        },
      });
    }
  });

  return merged.sort((a, b) => a.country_name.localeCompare(b.country_name));
}

// Helper function to calculate ranking statistics
function calculateRankingStats(rankings: any[]) {
  const validScores = rankings.filter(c => c.reform_score > 0);
  
  return {
    total_countries: rankings.length,
    average_score: validScores.length > 0 
      ? Math.round(validScores.reduce((sum, c) => sum + c.reform_score, 0) / validScores.length)
      : 0,
    average_implementation: validScores.length > 0
      ? Math.round(validScores.reduce((sum, c) => sum + (c.implementation_score || 0), 0) / validScores.length)
      : 0,
    highest_score: Math.max(...(validScores.map(c => c.reform_score) || [0])),
    lowest_score: Math.min(...(validScores.map(c => c.reform_score) || [0])),
    top_performer: rankings[0]?.country_name || "N/A",
    top_score: rankings[0]?.reform_score || 0,
    countries_with_data: validScores.length,
    countries_missing_data: rankings.length - validScores.length,
  };
}

// Helper function to group by region
function groupByRegion(rankings: any[]) {
  const regionMap = new Map();
  
  rankings.forEach(country => {
    const region = country.region || "Not Specified";
    if (!regionMap.has(region)) {
      regionMap.set(region, {
        region,
        countries: [],
        total_score: 0,
        count: 0,
      });
    }
    const group = regionMap.get(region);
    group.countries.push(country);
    group.total_score += country.reform_score || 0;
    group.count += 1;
  });

  return Array.from(regionMap.values()).map(group => ({
    ...group,
    average_score: Math.round(group.total_score / group.count),
    top_performer: group.countries.sort((a: any, b: any) => (b.reform_score || 0) - (a.reform_score || 0))[0]?.country_name || "N/A",
  })).sort((a, b) => b.average_score - a.average_score);
}

// Helper function to get top performers by category
function getTopPerformers(rankings: any[]) {
  const validData = rankings.filter(c => c.reform_score > 0);
  
  return {
    by_reform_score: validData.slice(0, 5).map(c => ({
      country: c.country_name,
      score: c.reform_score,
    })),
    by_implementation: validData
      .sort((a, b) => (b.implementation_score || 0) - (a.implementation_score || 0))
      .slice(0, 5)
      .map(c => ({
        country: c.country_name,
        score: c.implementation_score,
      })),
    by_sdg: validData
      .sort((a, b) => (b.sdg_score || 0) - (a.sdg_score || 0))
      .slice(0, 5)
      .map(c => ({
        country: c.country_name,
        score: c.sdg_score,
      })),
    by_funding_readiness: validData
      .sort((a, b) => (b.donor_readiness_score || 0) - (a.donor_readiness_score || 0))
      .slice(0, 5)
      .map(c => ({
        country: c.country_name,
        score: c.donor_readiness_score,
      })),
    by_region: Object.values(groupByRegion(rankings))
      .sort((a: any, b: any) => b.average_score - a.average_score)
      .slice(0, 5)
      .map((region: any) => ({
        region: region.region,
        average_score: region.average_score,
        countries: region.count,
      })),
    by_priority: {
      crisis: validData.filter(c => c.priority_level?.toLowerCase() === 'crisis' || c.priority_level === '🔥').length,
      high: validData.filter(c => c.priority_level?.toLowerCase() === 'high' || c.priority_level === '⚡').length,
      model: validData.filter(c => c.priority_level?.toLowerCase() === 'model' || c.priority_level === '🌱').length,
    },
  };
}

// POST endpoint to update rankings (e.g., when new scores are calculated)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      country_name, 
      reform_score, 
      implementation_score,
      sdg_score,
      priority_level,
      previous_rank,
      trend,
    } = body;

    if (!country_name) {
      return NextResponse.json(
        { success: false, message: "Country name is required" },
        { status: 400 }
      );
    }

    // Get current rank to set as previous
    const { data: currentData } = await supabase
      .from("countries")
      .select("reform_score, reform_tier")
      .eq("country_name", country_name)
      .single();

    const updateData: any = {
      updated_at: new Date().toISOString(),
      last_updated: new Date().toISOString(),
    };

    if (reform_score !== undefined) updateData.reform_score = reform_score;
    if (implementation_score !== undefined) updateData.implementation_score = implementation_score;
    if (sdg_score !== undefined) updateData.sdg_score = sdg_score;
    if (priority_level !== undefined) updateData.priority_level = priority_level;
    
    if (previous_rank !== undefined) {
      updateData.previous_rank = previous_rank;
    } else if (currentData) {
      // Store current rank as previous for next update
      const { data: allCountries } = await supabase
        .from("countries")
        .select("country_name, reform_score")
        .order("reform_score", { ascending: false });
      
      const currentRank = allCountries?.findIndex(c => c.country_name === country_name) || 0;
      updateData.previous_rank = currentRank + 1;
    }

    if (trend !== undefined) updateData.trend = trend;

    // Update countries table
    const { data: countriesData, error: countriesError } = await supabase
      .from("countries")
      .update(updateData)
      .eq("country_name", country_name)
      .select();

    if (countriesError) {
      console.error("Error updating countries table:", countriesError);
    }

    // Also update mental_health_reforms table
    const reformsUpdateData: any = {
      reform_score: reform_score,
      implementation_score: implementation_score,
      priority_level: priority_level,
      updated_at: new Date().toISOString(),
    };

    if (sdg_score !== undefined) {
      reformsUpdateData.sdg3_score = sdg_score;
      reformsUpdateData.sdg10_score = Math.round(sdg_score * 0.9);
      reformsUpdateData.sdg16_score = Math.round(sdg_score * 0.85);
    }

    const { data: reformsData, error: reformsError } = await supabase
      .from("mental_health_reforms")
      .update(reformsUpdateData)
      .eq("country_name", country_name)
      .select();

    if (reformsError) {
      console.error("Error updating mental_health_reforms table:", reformsError);
    }

    // If both updates failed, return error
    if (countriesError && reformsError) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Failed to update data in both tables",
          errors: { countries: countriesError.message, reforms: reformsError.message }
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Ranking updated successfully",
      updated: {
        countries_table: !!countriesData,
        reforms_table: !!reformsData,
      },
    });
  } catch (error) {
    console.error("Error updating ranking:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to update ranking",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// PATCH endpoint for batch updates (e.g., recalculating all rankings)
export async function PATCH(req: Request) {
  try {
    // Recalculate all rankings based on current data
    const { data: countries, error } = await supabase
      .from("countries")
      .select("id, country_name, reform_score, previous_rank")
      .order("reform_score", { ascending: false });

    if (error) throw error;

    // Update previous_rank and trend for all countries
    const updates = countries.map((country, index) => {
      const newRank = index + 1;
      const previousRank = country.previous_rank || newRank;
      let trend = "same";
      if (newRank < previousRank) trend = "up";
      else if (newRank > previousRank) trend = "down";

      return supabase
        .from("countries")
        .update({
          previous_rank: newRank,
          trend: trend,
          updated_at: new Date().toISOString(),
        })
        .eq("id", country.id);
    });

    await Promise.all(updates);

    return NextResponse.json({
      success: true,
      message: "All rankings recalculated successfully",
    });
  } catch (error) {
    console.error("Error recalculating rankings:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to recalculate rankings",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}