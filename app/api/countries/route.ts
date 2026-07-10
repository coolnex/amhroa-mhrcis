// app/api/countries/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    console.log("🔍 Fetching countries from mental_health_reforms...");
    
    const { data, error, count } = await supabase
      .from("mental_health_reforms")
      .select("*", { count: 'exact', head: false })
      .order("country_name", { ascending: true });

    if (error) {
      console.error("❌ Supabase error:", error);
      return NextResponse.json(
        {
          success: false,
          message: "Database error",
          error: error.message,
        },
        { status: 500 }
      );
    }

    console.log(`✅ Fetched ${data?.length || 0} countries (total count: ${count || data?.length || 0})`);
    
    // Log first few countries for debugging
    if (data && data.length > 0) {
      console.log("📋 First 5 countries:", data.slice(0, 5).map(c => c.country_name));
    }

    return NextResponse.json({
      success: true,
      countries: data || [],
      count: count || data?.length || 0,
    });
  } catch (error) {
    console.error("❌ Error in countries API:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch countries",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}