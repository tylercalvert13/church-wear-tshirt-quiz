import { NextRequest, NextResponse } from "next/server";

// TODO: Replace with real GHL credentials when Tyler provides them
// const GHL_TOKEN = "pit-XXXXXXXX";
// const CALENDAR_ID = "XXXXXXXX";

// Stub: returns mock available slots for the next 7 days
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tz = searchParams.get("tz") || "America/New_York";

  const slots: Record<string, { slots: string[] }> = {};

  const now = new Date();
  for (let d = 1; d <= 7; d++) {
    const day = new Date(now);
    day.setDate(day.getDate() + d);

    // Skip weekends
    const dow = day.getDay();
    if (dow === 0 || dow === 6) continue;

    const dateKey = day.toISOString().split("T")[0];
    const daySlots: string[] = [];

    // Generate 9 AM, 10 AM, 11 AM, 1 PM, 2 PM, 3 PM slots in ET
    for (const hour of [9, 10, 11, 13, 14, 15]) {
      const slot = new Date(`${dateKey}T${String(hour).padStart(2, "0")}:00:00-04:00`);
      daySlots.push(slot.toISOString());
    }

    slots[dateKey] = { slots: daySlots };
  }

  return NextResponse.json(slots);
}
