// app/api/investments/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { funding_request_id, donor_id, amount } = body;

    // Get platform fee percentage
    const { data: settings } = await supabase
      .from("platform_settings")
      .select("value")
      .eq("key", "platform_fee_percentage")
      .single();
    
    const platformFeePercent = parseInt(settings?.value || "5");
    const platformFee = (amount * platformFeePercent) / 100;
    const researcherAmount = amount - platformFee;

    // Create transaction record
    const { data: transaction, error: txError } = await supabase
      .from("transactions")
      .insert({
        donor_id,
        funding_request_id,
        amount,
        platform_fee: platformFee,
        researcher_amount: researcherAmount,
        status: "Completed",
        completed_at: new Date().toISOString(),
      })
      .select();

    if (txError) throw txError;

    // Update funding request
    await supabase
      .from("funding_requests")
      .update({ 
        amount_raised: supabase.rpc('increment', { row_id: funding_request_id, amount: amount }),
        status: supabase.rpc('check_funding_status', { row_id: funding_request_id })
      })
      .eq("id", funding_request_id);

    return NextResponse.json({
      success: true,
      message: `Investment of $${amount} processed. AMHROA fee: $${platformFee}`,
      transaction,
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { success: false, message: "Transaction failed" },
      { status: 500 }
    );
  }
}