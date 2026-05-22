"use client";

import { useState, useCallback } from "react";

type SlotsData = Record<string, { slots: string[] }>;

function getUserTz(): string {
  if (typeof window === "undefined") return "America/New_York";
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return "America/New_York";
  }
}

function formatDate(dateStr: string, tz: string) {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: tz,
  });
}

function formatTime(slot: string, tz: string) {
  const d = new Date(slot);
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: tz,
  });
}

type Props = {
  leadData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    recommendedShirt: string;
    occasion: string;
    quantity: string;
  };
  onBooked: (slot: string) => void;
};

export default function BookingWidget({ leadData, onBooked }: Props) {
  const [userTz] = useState(() => getUserTz());
  const [slots, setSlots] = useState<SlotsData>({});
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);

  const fetchSlots = useCallback(async () => {
    if (loaded) return;
    setLoading(true);
    setError("");
    try {
      const tz = getUserTz();
      const res = await fetch(`/api/slots?days=7&tz=${encodeURIComponent(tz)}`);
      const data = await res.json();
      const filtered: SlotsData = {};
      for (const [date, val] of Object.entries(data)) {
        const v = val as { slots: string[] };
        if (v.slots && v.slots.length > 0) {
          filtered[date] = v;
        }
      }
      setSlots(filtered);
      const dates = Object.keys(filtered).sort();
      if (dates.length > 0) setSelectedDay(dates[0]);
      setLoaded(true);
    } catch {
      setError("Failed to load available times. Please try again.");
    }
    setLoading(false);
  }, [loaded]);

  // Trigger fetch when component mounts in view
  useState(() => {
    fetchSlots();
  });

  const handleBookSlot = async (slot: string) => {
    setBooking(true);
    setError("");
    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...leadData, slot }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to book. Please try again.");
        setBooking(false);
        return;
      }
      onBooked(slot);
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setBooking(false);
  };

  const availableDays = Object.keys(slots).sort();

  return (
    <div className="w-full" id="booking-widget">
      {loading && (
        <p className="text-[#6b6b6b] text-sm py-4">Loading available times...</p>
      )}

      {!loading && availableDays.length === 0 && loaded && (
        <p className="text-[#6b6b6b] text-sm py-4">
          No available times found. Please check back soon or email us at{" "}
          <a href="mailto:hello@churchwear.com" className="underline">
            hello@churchwear.com
          </a>
          .
        </p>
      )}

      {!loading && availableDays.length > 0 && (
        <div className="space-y-4">
          {/* Day pills — scrollable horizontal on mobile */}
          <div>
            <p className="text-xs uppercase tracking-[0.15em] text-[#6b6b6b] mb-2">
              Pick a day
            </p>
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-0 scrollbar-hide">
              {availableDays.map((date) => (
                <button
                  key={date}
                  onClick={() => setSelectedDay(date)}
                  className={`flex-shrink-0 px-4 py-2 border text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedDay === date
                      ? "border-[#1a1a1a] bg-[#1a1a1a] text-white"
                      : "border-[#1a1a1a]/20 hover:border-[#1a1a1a]/60"
                  }`}
                >
                  {formatDate(date, userTz)}
                </button>
              ))}
            </div>
          </div>

          {/* Time slots — 2-col grid */}
          {selectedDay && slots[selectedDay] && (
            <div>
              <p className="text-xs uppercase tracking-[0.15em] text-[#6b6b6b] mb-2">
                Pick a time
              </p>
              <div className="grid grid-cols-2 gap-2">
                {slots[selectedDay].slots.map((slot) => (
                  <button
                    key={slot}
                    disabled={booking}
                    onClick={() => handleBookSlot(slot)}
                    className="py-3 px-4 border border-[#1a1a1a]/15 text-sm font-medium hover:border-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white transition-colors disabled:opacity-40 text-center"
                  >
                    {formatTime(slot, userTz)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {booking && (
        <p className="mt-3 text-[#6b6b6b] text-sm">Booking your call...</p>
      )}
      {error && <p className="mt-3 text-red-600 text-sm">{error}</p>}
    </div>
  );
}
