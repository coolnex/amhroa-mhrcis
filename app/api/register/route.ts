// app/api/signup/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { full_name, email, password, role, organization, country, phone } = body;

    // Validate required fields
    if (!full_name || !email || !password || !role) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Missing required fields: full_name, email, password, and role are required" 
        },
        { status: 400 }
      );
    }

    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabase
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

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          full_name: full_name,
          role: role,
          organization: organization || null,
          country: country || null,
        },
      },
    });

    if (authError) {
      console.error("Auth error:", authError);
      return NextResponse.json(
        { success: false, message: authError.message },
        { status: 400 }
      );
    }

    // Insert user into users table
    const { data: userData, error: insertError } = await supabase
      .from("users")
      .insert({
        id: authData.user?.id,
        full_name: full_name,
        email: email,
        password_hash: hashedPassword,
        role: role,
        organization: organization || null,
        country: country || null,
        phone: phone || null,
        status: "Pending",
        created_at: new Date().toISOString(),
      })
      .select();

    if (insertError) {
      console.error("Insert error:", insertError);
      // Rollback: Delete the auth user if profile creation fails
      await supabase.auth.admin.deleteUser(authData.user?.id as string);
      return NextResponse.json(
        { success: false, message: "Failed to create user profile" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "User registered successfully. Please check your email to verify your account.",
      user: {
        id: authData.user?.id,
        full_name: full_name,
        email: email,
        role: role,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Registration failed. Please try again.",
      },
      { status: 500 }
    );
  }
}

// Optional: GET to check if email is available
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email parameter is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    const isAvailable = !data;

    return NextResponse.json({
      success: true,
      available: isAvailable,
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to check email availability" },
      { status: 500 }
    );
  }
}