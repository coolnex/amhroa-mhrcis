// app/api/reports/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const country = searchParams.get("country");
    const reportType = searchParams.get("report_type");
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!): 50;

    let query = supabase
      .from("reports")
      .select(`
        *,
        users:submitted_by (
          full_name,
          email,
          role
        )
      `)
      .order("created_at", { ascending: false })
      .limit(limit);

    // Apply filters
    if (status && status !== "all") {
      query = query.eq("status", status);
    }
    if (country && country !== "all") {
      query = query.eq("country", country);
    }
    if (reportType && reportType !== "all") {
      query = query.eq("report_type", reportType);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        {
          success: false,
          message: "Failed to fetch reports",
          error: error.message,
        },
        { status: 500 }
      );
    }

    // Get statistics
    const stats = {
      total: data?.length || 0,
      pending: data?.filter(r => r.status === "Pending").length || 0,
      approved: data?.filter(r => r.status === "Approved").length || 0,
      rejected: data?.filter(r => r.status === "Rejected").length || 0,
      under_review: data?.filter(r => r.status === "Under Review").length || 0,
      by_country: data?.reduce((acc, report) => {
        acc[report.country] = (acc[report.country] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };

    return NextResponse.json({
      success: true,
      reports: data,
      stats,
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch reports",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      country,
      submitted_by,
      report_type,
      title,
      description,
      file_url,
      priority,
      sdg_alignment,
      reporting_period,
    } = body;

    // Validate required fields
    if (!country || !submitted_by || !report_type || !title || !description) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Missing required fields: country, submitted_by, report_type, title, description" 
        },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("reports")
      .insert({
        country: country,
        submitted_by: submitted_by,
        report_type: report_type,
        title: title,
        description: description,
        file_url: file_url || null,
        priority: priority || "Medium",
        sdg_alignment: sdg_alignment || [],
        reporting_period: reporting_period || null,
        status: "Pending",
        created_at: new Date().toISOString(),
      })
      .select();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        {
          success: false,
          message: "Failed to submit report",
          error: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Report submitted successfully",
      report: data,
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to submit report",
      },
      { status: 500 }
    );
  }
}