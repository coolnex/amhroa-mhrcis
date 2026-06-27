// app/api/countries/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("mental_health_reforms")
      .select("*")
      .order("country_name", { ascending: true });

    if (error) {
      console.error("❌ Error fetching countries:", error);
      throw error;
    }

    console.log(`✅ Fetched ${data?.length || 0} countries`);

    return NextResponse.json({
      success: true,
      countries: data || [],
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