import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("mental_health_reforms")
      .select("*")
      .order("country_name");

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      countries: data,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch countries",
      },
      { status: 500 }
    );
  }
}