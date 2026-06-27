// app/api/organizations/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const country = searchParams.get("country");
    const type = searchParams.get("type");

    let query = supabase
      .from("organizations")
      .select(`
        *,
        users:created_by (
          full_name,
          email
        )
      `)
      .order("created_at", { ascending: false });

    // Apply filters if provided
    if (status && status !== "all") {
      query = query.eq("status", status);
    }
    if (country && country !== "all") {
      query = query.eq("country", country);
    }
    if (type && type !== "all") {
      query = query.eq("type", type);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        {
          success: false,
          message: "Failed to fetch organizations",
          error: error.message,
        },
        { status: 500 }
      );
    }

    const metrics = {
      total: data?.length || 0,
      approved: data?.filter(o => o.status === "Approved").length || 0,
      pending: data?.filter(o => o.status === "Pending").length || 0,
      by_country: data?.reduce((acc, org) => {
        acc[org.country] = (acc[org.country] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };

    return NextResponse.json({
      success: true,
      organizations: data,
      metrics,
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch organizations",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      name,
      type,
      country,
      region,
      description,
      registration_number,
      website,
      contact_person,
      contact_email,
      contact_phone,
      focus_areas,
      created_by,
    } = body;

    // Validate required fields
    if (!name || !type || !country || !contact_email || !contact_phone || !created_by) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Missing required fields: name, type, country, contact_email, contact_phone, created_by" 
        },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("organizations")
      .insert({
        name: name,
        type: type,
        country: country,
        region: region || null,
        description: description || null,
        registration_number: registration_number || null,
        website: website || null,
        contact_person: contact_person || null,
        contact_email: contact_email,
        contact_phone: contact_phone,
        focus_areas: focus_areas || [],
        created_by: created_by,
        status: "Pending",
      })
      .select();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        {
          success: false,
          message: "Failed to register organization",
          error: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Organization registered successfully",
      organization: data,
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Registration failed",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, status, approval_notes, approved_by } = body;

    if (!id || !status) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const updateData: any = { status };
    if (status === "Approved") {
      updateData.approved_at = new Date().toISOString();
      updateData.approved_by = approved_by;
    }
    if (approval_notes) {
      updateData.approval_notes = approval_notes;
    }

    const { data, error } = await supabase
      .from("organizations")
      .update(updateData)
      .eq("id", id)
      .select();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { success: false, message: "Failed to update organization" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Organization ${status.toLowerCase()} successfully`,
      organization: data,
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update organization" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Organization ID is required" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("organizations")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { success: false, message: "Failed to delete organization" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Organization deleted successfully",
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete organization" },
      { status: 500 }
    );
  }
}