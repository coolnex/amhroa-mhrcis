// app/api/users/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role");
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : 100;
    const page = searchParams.get("page") ? parseInt(searchParams.get("page")!) : 1;
    const offset = (page - 1) * limit;

    let query = supabase
      .from("users")
      .select(`
        id,
        full_name,
        email,
        role,
        status,
        organization,
        country,
        phone,
        created_at,
        last_login,
        updated_at
      `, { count: "exact" });

    // Apply filters
    if (role && role !== "all") {
      query = query.eq("role", role);
    }
    if (status && status !== "all") {
      query = query.eq("status", status);
    }
    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    // Apply pagination and ordering
    query = query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        {
          success: false,
          message: "Failed to fetch users",
          error: error.message,
        },
        { status: 500 }
      );
    }

    // Get statistics
    const { data: allUsers } = await supabase
      .from("users")
      .select("role, status");

    const stats = {
      total: allUsers?.length || 0,
      by_role: allUsers?.reduce((acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      by_status: allUsers?.reduce((acc, user) => {
        acc[user.status] = (acc[user.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };

    return NextResponse.json({
      success: true,
      users: data,
      pagination: {
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
      },
      stats,
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch users",
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
      password_hash,
      role,
      organization,
      country,
      phone,
    } = body;

    // Validate required fields
    if (!full_name || !email || !password_hash || !role) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Missing required fields: full_name, email, password_hash, role" 
        },
        { status: 400 }
      );
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "User with this email already exists" },
        { status: 409 }
      );
    }

    const { data, error } = await supabase
      .from("users")
      .insert({
        full_name: full_name,
        email: email,
        password_hash: password_hash,
        role: role,
        organization: organization || null,
        country: country || null,
        phone: phone || null,
        status: "Pending",
        created_at: new Date().toISOString(),
      })
      .select();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        {
          success: false,
          message: "Failed to create user",
          error: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "User created successfully",
      user: data,
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create user",
      },
      { status: 500 }
    );
  }
}