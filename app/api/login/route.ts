// app/api/login/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required" },
        { status: 400 }
      );
    }

    // Find user in Supabase
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Check if account is approved
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
          message: "Your account application was rejected. Please contact support for more information." 
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

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password" },
        { status: 401 }
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
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    // Update last login time
    await supabase
      .from("users")
      .update({ last_login: new Date().toISOString() })
      .eq("id", user.id);

    // Return user data (excluding sensitive fields)
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

    return NextResponse.json({
      success: true,
      message: "Login successful",
      token,
      user: userData,
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, message: "Login failed. Please try again." },
      { status: 500 }
    );
  }
}

// Optional: GET to check session validity
export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return NextResponse.json(
        { success: false, message: "No token provided" },
        { status: 401 }
      );
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
      
      const { data: user, error } = await supabase
        .from("users")
        .select("id, full_name, email, role, organization, country, status")
        .eq("id", decoded.id)
        .single();

      if (error || !user) {
        return NextResponse.json(
          { success: false, message: "Invalid token" },
          { status: 401 }
        );
      }

      return NextResponse.json({
        success: true,
        user,
      });
    } catch (jwtError) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired token" },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Session check error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to validate session" },
      { status: 500 }
    );
  }
}