// app/api/reports/recent/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : 10;

    const { data, error } = await supabase
      .from("reports")
      .select(`
        id,
        title,
        report_type,
        country,
        status,
        priority,
        created_at
      `)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        {
          success: false,
          message: "Failed to fetch recent reports",
          error: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      submissions: data,
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch recent reports",
      },
      { status: 500 }
    );
  }
}