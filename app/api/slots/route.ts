import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const GHL_TOKEN = "pit-ca2ec7ff-6967-4e89-8615-fb0b6ad14a0f";
const CALENDAR_ID = "7GR1imvjNI2hduZWdYe2";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const days = parseInt(searchParams.get("days") || "7", 10);
  const tz = searchParams.get("tz") || "America/New_York";

  const now = new Date();
  const start = new Date(now);
  start.setDate(start.getDate() + 1);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + days);

  const startMs = start.getTime();
  const endMs = end.getTime();

  try {
    const res = await fetch(
      `https://services.leadconnectorhq.com/calendars/${CALENDAR_ID}/free-slots?startDate=${startMs}&endDate=${endMs}&timezone=${encodeURIComponent(tz)}`,
      {
        headers: {
          Authorization: `Bearer ${GHL_TOKEN}`,
          Version: "2021-04-15",
        },
        cache: "no-store",
      }
    );

    if (!res.ok) {
      const err = await res.text();
      console.error("GHL free-slots error:", err);
      return NextResponse.json({ error: "Failed to fetch slots" }, { status: 500 });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("Slots fetch error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
