// app/api/coordinators/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("coordinators")
      .select(`
        *,
        users:assigned_by (
          full_name,
          email
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        {
          success: false,
          message: "Failed to fetch coordinators",
          error: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      coordinators: data,
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch coordinators",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      full_name,
      email,
      phone,
      country,
      region,
      organization,
      assigned_by,
      assigned_regions,
    } = body;

    // Validate required fields
    if (!full_name || !email || !country) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("coordinators")
      .insert({
        name: full_name,
        email: email,
        phone: phone || null,
        country: country,
        region: region || null,
        organization: organization || null,
        assigned_by: assigned_by || null,
        assigned_regions: assigned_regions || [],
        status: "Pending",
      })
      .select();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        {
          success: false,
          message: "Failed to add coordinator",
          error: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Coordinator added successfully",
      coordinator: data,
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to add coordinator",
      },
      { status: 500 }
    );
  }
}

// PATCH endpoint for updating coordinator status
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("coordinators")
      .update({ 
        status: status,
        updated_at: new Date().toISOString()
      })
      .eq("id", id)
      .select();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { success: false, message: "Failed to update coordinator" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Coordinator updated successfully",
      coordinator: data,
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update coordinator" },
      { status: 500 }
    );
  }
}

// DELETE endpoint for removing a coordinator
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Coordinator ID is required" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("coordinators")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { success: false, message: "Failed to delete coordinator" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Coordinator deleted successfully",
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete coordinator" },
      { status: 500 }
    );
  }
}