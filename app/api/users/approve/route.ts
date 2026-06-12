// app/api/users/approve/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User ID is required" },
        { status: 400 }
      );
    }

    // Get user email before approval for notification
    const { data: user, error: fetchError } = await supabase
      .from("users")
      .select("email, full_name, role")
      .eq("id", userId)
      .single();

    if (fetchError || !user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Update user status to Approved
    const { data, error } = await supabase
      .from("users")
      .update({
        status: "Approved",
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        {
          success: false,
          message: "Failed to approve user",
          error: error.message,
        },
        { status: 500 }
      );
    }

    // Optional: Send approval email notification
    // await sendApprovalEmail(user.email, user.full_name, user.role);

    return NextResponse.json({
      success: true,
      message: "User approved successfully",
      user: data,
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Approval failed",
      },
      { status: 500 }
    );
  }
}