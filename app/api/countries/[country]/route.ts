// app/api/countries/[country]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(
  request: NextRequest,
  { params }: { params: { country: string } }
) {
  try {
    // Decode the URL parameter
    const slug = decodeURIComponent(params.country);
    console.log("🔍 Searching for country:", slug);

    // First, try to find by exact match
    let { data, error } = await supabase
      .from("mental_health_reforms")
      .select("*")
      .eq("country_name", slug)
      .single();

    // If not found, try case-insensitive search
    if (error || !data) {
      console.log("❌ Exact match not found, trying case-insensitive...");
      
      const { data: caseInsensitiveData, error: caseError } = await supabase
        .from("mental_health_reforms")
        .select("*")
        .ilike("country_name", slug)
        .single();

      if (caseError || !caseInsensitiveData) {
        console.log("❌ Country not found:", slug);
        return NextResponse.json(
          {
            success: false,
            message: `Country "${slug}" not found`,
          },
          { status: 404 }
        );
      }
      
      data = caseInsensitiveData;
    }

    console.log("✅ Country found:", data.country_name);

    return NextResponse.json({
      success: true,
      country: data,
    });
  } catch (error) {
    console.error("❌ Error fetching country:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch country",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}