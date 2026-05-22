import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";

export const dynamic = "force-dynamic";

const GHL_TOKEN = "pit-ca2ec7ff-6967-4e89-8615-fb0b6ad14a0f";
const LOCATION_ID = "HkwiPPnxEEApyLNNNG7w";
const CALENDAR_ID = "7GR1imvjNI2hduZWdYe2";
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
      slot,
      recommendedShirt,
      occasion,
      quantity,
    } = body;

    if (!firstName || !lastName || !email || !phone || !slot) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Create or find contact in GHL
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
            ...(occasion ? [`quiz:${occasion}`] : []),
            ...(quantity ? [`qty:${quantity}`] : []),
          ],
        }),
      }
    );

    let contactId: string;
    const contactData = await contactRes.json();

    if (contactRes.ok) {
      contactId = contactData.contact?.id;
    } else if (
      contactData.message?.includes("duplicate") ||
      contactRes.status === 422
    ) {
      const searchRes = await fetch(
        `https://services.leadconnectorhq.com/contacts/search/duplicate?locationId=${LOCATION_ID}&email=${encodeURIComponent(email)}`,
        {
          headers: {
            Authorization: `Bearer ${GHL_TOKEN}`,
            Version: "2021-07-28",
          },
        }
      );
      const searchData = await searchRes.json();
      contactId = searchData.contact?.id;
    } else {
      console.error("Contact create error:", contactData);
      return NextResponse.json({ error: "Failed to create contact" }, { status: 500 });
    }

    if (!contactId) {
      return NextResponse.json({ error: "Could not resolve contact" }, { status: 500 });
    }

    // 2. Book appointment
    const slotDate = new Date(slot);
    const endDate = new Date(slotDate.getTime() + 15 * 60 * 1000); // 15-min merch call

    const bookRes = await fetch(
      "https://services.leadconnectorhq.com/calendars/events/appointments",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GHL_TOKEN}`,
          Version: "2021-04-15",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          calendarId: CALENDAR_ID,
          locationId: LOCATION_ID,
          contactId,
          startTime: slot,
          endTime: endDate.toISOString(),
          title: `T-Shirt Order Call — ${firstName} ${lastName}`,
          appointmentStatus: "confirmed",
        }),
      }
    );

    if (!bookRes.ok) {
      const bookErr = await bookRes.text();
      console.error("Booking error:", bookErr);
      return NextResponse.json({ error: "Failed to book appointment" }, { status: 500 });
    }

    const bookData = await bookRes.json();

    after(async () => {
      try {
        const webhookRes = await fetch(GHL_WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            firstName,
            lastName,
            email,
            phone,
            recommendedShirt,
            occasion,
            quantity,
            source: "church-wear-tshirt-quiz-booking",
            booked_slot: slot,
            contact_id: contactId,
            timestamp: new Date().toISOString(),
          }),
        });
        if (!webhookRes.ok) {
          console.error("[/api/book webhook] error:", webhookRes.status, await webhookRes.text());
        }
      } catch (err) {
        console.error("[/api/book webhook] failed:", err);
      }
    });

    return NextResponse.json({ success: true, appointment: bookData });
  } catch (err) {
    console.error("Book error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
