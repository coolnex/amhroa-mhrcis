import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(
  req: Request,
  { params }: { params: { country: string } }
) {
  try {
    const slug = params.country;

    const { data, error } = await supabase
      .from("mental_health_reforms")
      .select("*")
      .eq("country_slug", slug)
      .single();

    if (error || !data) {
      return NextResponse.json(
        {
          success: false,
          message: "Country not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      country: data,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch country",
      },
      { status: 500 }
    );
  }
}