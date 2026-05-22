import { NextRequest, NextResponse } from "next/server";

// TODO: Replace with real GHL credentials when Tyler provides them
// const GHL_TOKEN = "pit-XXXXXXXX";
// const LOCATION_ID = "XXXXXXXX";
// const WEBHOOK_URL = "https://services.leadconnectorhq.com/hooks/XXXXXXXX/webhook-trigger/XXXXXXXX";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    console.log("[CW T-Shirt Quiz] Lead captured (stub):", JSON.stringify(data, null, 2));

    // TODO: When credentials are ready, fire:
    // 1. POST to GHL /contacts/ to create contact with quiz tags
    // 2. POST to GHL webhook to trigger automation workflow

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[lead] error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
