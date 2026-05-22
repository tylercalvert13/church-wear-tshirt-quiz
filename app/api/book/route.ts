import { NextRequest, NextResponse } from "next/server";

// TODO: Replace with real GHL credentials when Tyler provides them
// const GHL_TOKEN = "pit-XXXXXXXX";
// const LOCATION_ID = "XXXXXXXX";
// const CALENDAR_ID = "XXXXXXXX";  // merch-quote calendar

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    console.log("[CW T-Shirt Quiz] Booking (stub):", JSON.stringify(data, null, 2));

    // TODO: When credentials are ready:
    // 1. Create/find GHL contact
    // 2. Book appointment on the merch-quote calendar

    return NextResponse.json({ success: true, appointmentId: "stub-appointment" });
  } catch (err) {
    console.error("[book] error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
