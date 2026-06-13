// app/api/login/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { verifyPassword } from "@/lib/password-utils";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required" },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    console.log("Searching email:", cleanEmail);

    const { data: user, error: userError } = await supabaseAdmin
      .from("users")
      .select("*")
      .ilike("email", cleanEmail)
      .maybeSingle();

    if (userError || !user) {
      console.log("User not found:", userError?.message);
      return NextResponse.json(
        { success: false, message: "Invalid email or password" },
        { status: 401 }
      );
    }

    console.log("User found:", user.id);
    console.log("User status:", user.status);
    console.log("User role:", user.role);

    // Check account status
    if (user.status === "Pending") {
      return NextResponse.json(
        { 
          success: false, 
          message: "Your account is pending approval. You will receive an email once approved." 
        },
        { status: 403 }
      );
    }

    if (user.status === "Rejected") {
      return NextResponse.json(
        { 
          success: false, 
          message: "Your account application was rejected. Please contact support." 
        },
        { status: 403 }
      );
    }

    if (user.status === "Suspended") {
      return NextResponse.json(
        { 
          success: false, 
          message: "Your account has been suspended. Please contact support." 
        },
        { status: 403 }
      );
    }

    if (!user.password_hash) {
      console.log("No password hash found");
      return NextResponse.json(
        { success: false, message: "Invalid email or password" },
        { status: 401 }
      );
    }

    const isMatch = await verifyPassword(password, user.password_hash);
    console.log("Password match result:", isMatch);

    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password" },
        { status: 401 }
      );
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not defined");
      return NextResponse.json(
        { success: false, message: "Server configuration error" },
        { status: 500 }
      );
    }

    // Create JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        full_name: user.full_name,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    console.log("JWT Token created successfully");

    // Update last login time
    await supabaseAdmin
      .from("users")
      .update({ last_login: new Date().toISOString() })
      .eq("id", user.id);

    const userData = {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      organization: user.organization,
      country: user.country,
      status: user.status,
      created_at: user.created_at,
    };

    console.log("Login successful, returning user data:", userData);

    // Return with proper headers
    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      token,
      user: userData,
    });

    // Also set cookie for additional persistence
    response.cookies.set("auth_token", token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, message: "Login failed. Please try again." },
      { status: 500 }
    );
  }
}