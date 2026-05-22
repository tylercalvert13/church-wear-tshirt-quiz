import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";

export const dynamic = "force-dynamic";

const GHL_TOKEN = "pit-ca2ec7ff-6967-4e89-8615-fb0b6ad14a0f";
const LOCATION_ID = "HkwiPPnxEEApyLNNNG7w";
const GHL_WEBHOOK_URL =
  "https://services.leadconnectorhq.com/hooks/HkwiPPnxEEApyLNNNG7w/webhook-trigger/8b10ca38-19ed-4215-9512-5570121ee194";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      firstName,
      lastName,
      email,
      phone,
      occasion,
      quantity,
      whoWearing,
      vibe,
      timeline,
      recommendedShirt,
      tcpaConsent,
    } = body;

    // Return 200 immediately — do work in after()
    after(async () => {
      try {
        // 1. Create/upsert contact in GHL
        const contactRes = await fetch(
          "https://services.leadconnectorhq.com/contacts/",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${GHL_TOKEN}`,
              Version: "2021-07-28",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              locationId: LOCATION_ID,
              firstName,
              lastName,
              email,
              phone,
              source: "Church Wear T-Shirt Quiz",
              tags: [
                "tshirt-quiz",
                "paid-ads-funnel",
                `quiz:${occasion}`,
                `qty:${quantity}`,
              ],
            }),
          }
        );

        const contactData = await contactRes.json();
        if (!contactRes.ok) {
          console.error("[/api/lead] GHL contact create error:", contactData);
        } else {
          console.log("[/api/lead] GHL contact created:", contactData?.contact?.id);
        }

        // 2. Fire GHL webhook
        const webhookRes = await fetch(GHL_WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            firstName,
            lastName,
            email,
            phone,
            occasion,
            quantity,
            whoWearing,
            vibe,
            timeline,
            recommendedShirt,
            tcpaConsent,
            source: "church-wear-tshirt-quiz",
            timestamp: new Date().toISOString(),
          }),
        });

        if (!webhookRes.ok) {
          console.error("[/api/lead] GHL webhook error:", webhookRes.status, await webhookRes.text());
        } else {
          console.log("[/api/lead] GHL webhook fired OK for", email);
        }
      } catch (err) {
        console.error("[/api/lead] after() error:", err);
      }
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[/api/lead] error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
