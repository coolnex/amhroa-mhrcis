// app/api/login/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    console.log("Searching email:", email);

    // Find user by email
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (error || !user) {
      console.log("User not found:", error?.message);
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      );
    }

    console.log("User found:", user.id);
    console.log("User status:", user.status);
    console.log("User role:", user.role);

    // Check if user is approved
    if (user.status !== "Approved") {
      return NextResponse.json(
        { success: false, message: "Account pending approval" },
        { status: 401 }
      );
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password_hash);
    console.log("Password match result:", isValid);

    if (!isValid) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Create JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email,
        role: user.role 
      },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "7d" }
    );

    console.log("JWT Token created successfully");

    // Set the session variable for RLS
    await supabase.rpc('set_current_user_id', { user_id: user.id });

    // Return user data without password
    const { password_hash, ...userWithoutPassword } = user;

    // Set the token in a cookie for middleware
    const response = NextResponse.json({
      success: true,
      token,
      user: userWithoutPassword,
    });

    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;

  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, message: "Login failed" },
      { status: 500 }
    );
  }
}