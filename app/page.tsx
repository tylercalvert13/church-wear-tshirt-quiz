"use client";

import { useState, useEffect, useRef } from "react";
import BookingWidget from "./components/BookingWidget";

// ─── Shirt catalog ────────────────────────────────────────────────────────────

const SHIRTS = {
  blend: {
    name: "The Blend Tee",
    subtitle: "Tri-Blend · 160gsm · True-to-size fit",
    description:
      "A lightweight tri-blend tee with a soft, athletic feel. Perfect for events, baptisms, and giveaways. Breathable and comfortable for all ages.",
    heroImage:
      "https://lqrogzixbdviijmumckp.supabase.co/storage/v1/object/public/church-wear-catalog/blanks/the-blend-tee/olive/modelfront.png",
    flatImage:
      "https://lqrogzixbdviijmumckp.supabase.co/storage/v1/object/public/church-wear-catalog/blanks/the-blend-tee/olive/front.png",
    pricing: [11.4, 9.09, 8.31, 6.3],
    colors: ["Obsidian", "Slate", "Olive", "Desert", "Ash", "Vellum", "Pure"],
    specs: { weight: "160gsm", fabric: "Tri-Blend", fit: "True to size" },
    bestFor: "Baptisms, youth events, VBS, missions, giveaways",
  },
  lite: {
    name: "The Lite Tee",
    subtitle: "100% Cotton · 140gsm · True-to-size fit",
    description:
      "A lightweight 100% cotton shirt built for easy everyday wear. Great for baptisms, giveaways, and first-time guest gifts. True-to-size fit works for kids and adults.",
    heroImage:
      "https://lqrogzixbdviijmumckp.supabase.co/storage/v1/object/public/church-wear-catalog/blanks/the-lite-tee/evergreen/modelfront.png",
    flatImage:
      "https://lqrogzixbdviijmumckp.supabase.co/storage/v1/object/public/church-wear-catalog/blanks/the-lite-tee/evergreen/front.png",
    pricing: [11.4, 9.09, 8.31, 6.3],
    colors: [
      "Obsidian",
      "Evergreen",
      "Slate",
      "Sand",
      "Ash",
      "Dune",
      "Vellum",
      "Pure",
    ],
    specs: { weight: "140gsm", fabric: "100% Cotton", fit: "True to size" },
    bestFor: "Baptisms, VBS, kids, missions, large giveaway runs",
  },
  routine: {
    name: "The Routine Tee",
    subtitle: "Heavyweight · 240gsm · Oversized drop shoulder",
    description:
      "A premium heavyweight tee with an oversized drop shoulder fit. Built for elevated event shirts and church merch people actually want to wear long after the event.",
    heroImage:
      "https://lqrogzixbdviijmumckp.supabase.co/storage/v1/object/public/church-wear-catalog/blanks/the-routine-tee/pollen/modelfront.png",
    flatImage:
      "https://lqrogzixbdviijmumckp.supabase.co/storage/v1/object/public/church-wear-catalog/blanks/the-routine-tee/pollen/front.png",
    pricing: [17.0, 14.08, 11.79, 9.23],
    colors: [
      "Obsidian",
      "Evergreen",
      "Espresso",
      "Ash",
      "Mist",
      "Pollen",
      "Camel",
    ],
    specs: {
      weight: "240gsm",
      fabric: "100% Cotton",
      fit: "Oversized / Drop shoulder",
    },
    bestFor: "Staff shirts, elevated event tees, merch to sell",
  },
  block: {
    name: "The Block Tee",
    subtitle: "Ultra Heavyweight · 330gsm · Boxy oversized",
    description:
      "An ultra-heavyweight premium tee with a boxy oversized fit. Built for bold church merch with substantial weight and a structure that's immediately noticeable.",
    heroImage:
      "https://lqrogzixbdviijmumckp.supabase.co/storage/v1/object/public/church-wear-catalog/blanks/the-block-tee/obsidian/modelfront.png",
    flatImage:
      "https://lqrogzixbdviijmumckp.supabase.co/storage/v1/object/public/church-wear-catalog/blanks/the-block-tee/obsidian/front.png",
    pricing: [20.0, 17.21, 15.43, 12.75],
    colors: ["Obsidian"],
    specs: {
      weight: "330gsm",
      fabric: "100% Cotton",
      fit: "Boxy oversized",
    },
    bestFor: "Premium merch, bold statement pieces",
  },
} as const;

type ShirtKey = keyof typeof SHIRTS;

type Occasion =
  | "baptism"
  | "youth"
  | "vbs"
  | "missions"
  | "conference"
  | "staff"
  | "merch"
  | "other";
type WhoWearing = "kids" | "adults" | "mix" | "staff";
type Vibe = "simple" | "premium" | "merch";

function recommendShirt(
  occasion: Occasion,
  whoWearing: WhoWearing,
  vibe: Vibe
): ShirtKey {
  if (vibe === "merch" || occasion === "merch") return "block";
  if (
    vibe === "premium" ||
    occasion === "staff" ||
    whoWearing === "staff"
  )
    return "routine";
  if (whoWearing === "kids") return "lite";
  if (["baptism", "vbs", "missions"].includes(occasion)) return "lite";
  return "blend";
}

function getPriceTier(qty: string): number {
  if (qty === "100-199") return 0;
  if (qty === "200-499") return 1;
  if (qty === "500-999") return 2;
  return 3;
}

// ─── Quiz steps config ────────────────────────────────────────────────────────

const STEPS = [
  {
    id: "occasion",
    question: "What are you making shirts for?",
    options: [
      { label: "Baptism shirts", value: "baptism" },
      { label: "Youth event or camp", value: "youth" },
      { label: "Vacation Bible School (VBS)", value: "vbs" },
      { label: "Mission trip", value: "missions" },
      { label: "Conference or large event", value: "conference" },
      { label: "Staff or volunteer shirts", value: "staff" },
      { label: "Merch to sell", value: "merch" },
      { label: "Something else", value: "other" },
    ],
  },
  {
    id: "quantity",
    question: "How many shirts do you need?",
    options: [
      { label: "100–199 shirts", value: "100-199" },
      { label: "200–499 shirts", value: "200-499" },
      { label: "500–999 shirts", value: "500-999" },
      { label: "1,000+ shirts", value: "1000+" },
    ],
  },
  {
    id: "whoWearing",
    question: "Who's wearing these shirts?",
    options: [
      { label: "Kids and youth", value: "kids" },
      { label: "Adults", value: "adults" },
      { label: "Mix of both", value: "mix" },
      { label: "Staff only", value: "staff" },
    ],
  },
  {
    id: "vibe",
    question: "What feel are you going for?",
    options: [
      {
        label: "Clean and simple — just our logo on a quality tee",
        value: "simple",
      },
      {
        label: "Premium look — oversized, something people keep wearing",
        value: "premium",
      },
      {
        label: "Merch to sell — needs to look and feel like real merchandise",
        value: "merch",
      },
    ],
  },
  {
    id: "timeline",
    question: "When do you need them?",
    options: [
      { label: "Less than 30 days (urgent)", value: "under30" },
      { label: "30 to 60 days", value: "30to60" },
      { label: "60 to 90 days", value: "60to90" },
      { label: "No rush — 90+ days", value: "90plus" },
    ],
  },
];

type Phase = "quiz" | "lead" | "results" | "booked";

type Answers = {
  occasion: string;
  quantity: string;
  whoWearing: string;
  vibe: string;
  timeline: string;
};

type LeadForm = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  tcpa: boolean;
};

export default function Home() {
  const [phase, setPhase] = useState<Phase>("quiz");
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<Answers>>({});
  const [leadForm, setLeadForm] = useState<LeadForm>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    tcpa: false,
  });
  const [leadError, setLeadError] = useState("");
  const [leadSubmitting, setLeadSubmitting] = useState(false);
  const [bookedSlot, setBookedSlot] = useState("");
  const bookingRef = useRef<HTMLDivElement>(null);

  const totalSteps = STEPS.length;
  const progress =
    phase === "quiz"
      ? ((currentStep + 1) / (totalSteps + 2)) * 100
      : phase === "lead"
      ? ((totalSteps + 1) / (totalSteps + 2)) * 100
      : 100;

  const handleAnswer = (stepId: string, value: string) => {
    const updated = { ...answers, [stepId]: value };
    setAnswers(updated);
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Last quiz step — go to lead gate
      setPhase("lead");
    }
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLeadError("");
    setLeadSubmitting(true);

    const shirtKey = recommendShirt(
      answers.occasion as Occasion,
      answers.whoWearing as WhoWearing,
      answers.vibe as Vibe
    );

    // Fire and forget
    fetch("/api/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: leadForm.firstName,
        lastName: leadForm.lastName,
        email: leadForm.email,
        phone: leadForm.phone,
        occasion: answers.occasion,
        quantity: answers.quantity,
        whoWearing: answers.whoWearing,
        vibe: answers.vibe,
        timeline: answers.timeline,
        recommendedShirt: shirtKey,
        tcpaConsent: leadForm.tcpa,
      }),
    }).catch(() => {});

    setPhase("results");
    setLeadSubmitting(false);
  };

  const shirtKey = recommendShirt(
    (answers.occasion as Occasion) || "other",
    (answers.whoWearing as WhoWearing) || "adults",
    (answers.vibe as Vibe) || "simple"
  );
  const shirt = SHIRTS[shirtKey];
  const priceTier = getPriceTier(answers.quantity || "100-199");
  const pricePerShirt = shirt.pricing[priceTier];

  const timelineBadge = {
    under30: { color: "bg-red-100 text-red-700", text: "Tight timeline — let's talk first", dot: "🔴" },
    "30to60": { color: "bg-yellow-100 text-yellow-700", text: "Possible if your design is ready", dot: "🟡" },
    "60to90": { color: "bg-green-100 text-green-700", text: "You're in great shape", dot: "🟢" },
    "90plus": { color: "bg-green-100 text-green-700", text: "Plenty of time", dot: "🟢" },
  }[answers.timeline as string] || {
    color: "bg-gray-100 text-gray-700",
    text: "Check timeline with us",
    dot: "⚪",
  };

  const qtyLabel =
    {
      "100-199": "100–199",
      "200-499": "200–499",
      "500-999": "500–999",
      "1000+": "1,000+",
    }[answers.quantity as string] || answers.quantity;

  const scrollToBooking = () => {
    bookingRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Auto-fetch slots when results page loads
  useEffect(() => {
    if (phase === "results") {
      // Small delay to allow page render
      setTimeout(() => {
        bookingRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [phase]);

  return (
    <div className="min-h-screen bg-[#f5f2ed]">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-[#f5f2ed]/95 backdrop-blur border-b border-[#1a1a1a]/10 px-5 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <span
            className="text-sm font-bold tracking-[0.3em] uppercase"
            style={{ fontFamily: "Georgia, serif" }}
          >
            CHURCH WEAR
          </span>
          {phase === "results" && (
            <button
              onClick={scrollToBooking}
              className="text-xs uppercase tracking-[0.2em] bg-[#1a1a1a] text-white px-4 py-2 font-medium hover:bg-[#1a1a1a]/80 transition-colors"
            >
              Book Now ↓
            </button>
          )}
        </div>
      </nav>

      {/* Progress bar */}
      <div className="h-1 bg-[#1a1a1a]/10">
        <div
          className="h-full bg-[#8b7355] transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* ─── Quiz Phase ───────────────────────────────────────────────────────── */}
      {phase === "quiz" && (
        <main className="max-w-2xl mx-auto px-5 py-10">
          <p className="text-xs uppercase tracking-[0.2em] text-[#6b6b6b] mb-2">
            Step {currentStep + 1} of {totalSteps}
          </p>
          <h1
            className="text-2xl md:text-3xl font-bold mb-8 leading-snug"
            style={{ fontFamily: "Georgia, serif" }}
          >
            {STEPS[currentStep].question}
          </h1>

          <div className="space-y-3">
            {STEPS[currentStep].options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleAnswer(STEPS[currentStep].id, opt.value)}
                className="w-full text-left px-5 py-4 border border-[#1a1a1a]/15 bg-white hover:border-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white transition-colors text-base font-medium min-h-[56px] flex items-center gap-3 group"
              >
                <span className="w-5 h-5 border border-current flex-shrink-0 flex items-center justify-center opacity-30 group-hover:opacity-100 transition-opacity text-xs">
                  →
                </span>
                {opt.label}
              </button>
            ))}
          </div>

          {currentStep > 0 && (
            <button
              onClick={() => setCurrentStep(currentStep - 1)}
              className="mt-6 text-sm text-[#6b6b6b] hover:text-[#1a1a1a] transition-colors"
            >
              ← Back
            </button>
          )}
        </main>
      )}

      {/* ─── Lead Gate Phase ──────────────────────────────────────────────────── */}
      {phase === "lead" && (
        <main className="max-w-xl mx-auto px-5 py-10">
          <p className="text-xs uppercase tracking-[0.2em] text-[#6b6b6b] mb-2">
            Almost there
          </p>
          <h1
            className="text-2xl md:text-3xl font-bold mb-2 leading-snug"
            style={{ fontFamily: "Georgia, serif" }}
          >
            See your recommendation →
          </h1>
          <p className="text-[#6b6b6b] mb-8">
            We&apos;ll send your personalized shirt recommendation and pricing to your inbox.
          </p>

          <form onSubmit={handleLeadSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs uppercase tracking-[0.15em] text-[#6b6b6b] mb-1">
                  First Name *
                </label>
                <input
                  required
                  type="text"
                  value={leadForm.firstName}
                  onChange={(e) =>
                    setLeadForm({ ...leadForm, firstName: e.target.value })
                  }
                  className="w-full bg-white border border-[#1a1a1a]/15 px-3 py-3 text-base outline-none focus:border-[#1a1a1a]/50 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-[0.15em] text-[#6b6b6b] mb-1">
                  Last Name *
                </label>
                <input
                  required
                  type="text"
                  value={leadForm.lastName}
                  onChange={(e) =>
                    setLeadForm({ ...leadForm, lastName: e.target.value })
                  }
                  className="w-full bg-white border border-[#1a1a1a]/15 px-3 py-3 text-base outline-none focus:border-[#1a1a1a]/50 transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-[0.15em] text-[#6b6b6b] mb-1">
                Email *
              </label>
              <input
                required
                type="email"
                value={leadForm.email}
                onChange={(e) =>
                  setLeadForm({ ...leadForm, email: e.target.value })
                }
                className="w-full bg-white border border-[#1a1a1a]/15 px-3 py-3 text-base outline-none focus:border-[#1a1a1a]/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-[0.15em] text-[#6b6b6b] mb-1">
                Phone *
              </label>
              <input
                required
                type="tel"
                value={leadForm.phone}
                onChange={(e) =>
                  setLeadForm({ ...leadForm, phone: e.target.value })
                }
                placeholder="(555) 555-5555"
                className="w-full bg-white border border-[#1a1a1a]/15 px-3 py-3 text-base outline-none focus:border-[#1a1a1a]/50 transition-colors"
              />
            </div>

            <div className="flex items-start gap-3 pt-1">
              <input
                required
                type="checkbox"
                id="tcpa"
                checked={leadForm.tcpa}
                onChange={(e) =>
                  setLeadForm({ ...leadForm, tcpa: e.target.checked })
                }
                className="mt-1 w-4 h-4 flex-shrink-0 cursor-pointer"
              />
              <label
                htmlFor="tcpa"
                className="text-xs text-[#6b6b6b] leading-relaxed cursor-pointer"
              >
                By submitting, I agree to receive SMS and email communications
                from Church Wear regarding my order. Reply STOP to opt out at
                any time.
              </label>
            </div>

            {leadError && (
              <p className="text-red-600 text-sm">{leadError}</p>
            )}

            <button
              type="submit"
              disabled={leadSubmitting}
              className="w-full px-8 py-4 bg-[#1a1a1a] text-white text-sm uppercase tracking-[0.2em] font-medium hover:bg-[#1a1a1a]/80 transition-colors disabled:opacity-50 mt-2"
            >
              {leadSubmitting ? "Loading..." : "See My Recommendation →"}
            </button>
          </form>

          <button
            onClick={() => setCurrentStep(totalSteps - 1)}
            className="mt-6 text-sm text-[#6b6b6b] hover:text-[#1a1a1a] transition-colors"
            type="button"
          >
            ← Back to quiz
          </button>
        </main>
      )}

      {/* ─── Results Phase ────────────────────────────────────────────────────── */}
      {(phase === "results" || phase === "booked") && (
        <main className="max-w-2xl mx-auto px-5 py-8">

          {/* Eyebrow + headline */}
          <div className="mb-6">
            <p className="text-xs uppercase tracking-[0.3em] text-[#8b7355] font-medium mb-2">
              YOUR RECOMMENDATION
            </p>
            <h1
              className="text-4xl md:text-5xl font-bold leading-tight mb-1"
              style={{ fontFamily: "Georgia, serif" }}
            >
              {shirt.name}.
            </h1>
            <p className="text-[#6b6b6b]">{shirt.subtitle}</p>
          </div>

          {/* Hero image */}
          <div className="mb-6">
            <img
              src={shirt.heroImage}
              alt={shirt.name}
              className="w-full rounded-lg object-cover max-h-[420px] md:max-h-[500px]"
              style={{ objectPosition: "top" }}
            />
            <img
              src={shirt.flatImage}
              alt={`${shirt.name} flat`}
              className="w-full rounded-lg object-cover mt-3 max-h-[280px]"
              loading="lazy"
            />
          </div>

          {/* Price callout */}
          <div className="bg-[#8b7355]/10 border border-[#8b7355]/20 rounded-lg px-6 py-5 mb-4">
            <p
              className="text-4xl font-bold text-[#8b7355] mb-1"
              style={{ fontFamily: "Georgia, serif" }}
            >
              ${pricePerShirt.toFixed(2)}
              <span className="text-lg font-normal text-[#6b6b6b] ml-1">
                per shirt
              </span>
            </p>
            <p className="text-sm text-[#6b6b6b]">
              At {qtyLabel} shirts · Fully designed · 60-day delivery
            </p>

            {/* Sticky Book Now anchor */}
            <button
              onClick={scrollToBooking}
              className="mt-4 w-full sm:w-auto px-6 py-3 bg-[#1a1a1a] text-white text-sm uppercase tracking-[0.2em] font-medium hover:bg-[#1a1a1a]/80 transition-colors"
            >
              Book My Free Call ↓
            </button>
          </div>

          {/* Timeline badge */}
          <div className="mb-5">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${timelineBadge.color}`}
            >
              {timelineBadge.dot} {timelineBadge.text}
            </span>
          </div>

          {/* Shirt description */}
          <p className="text-[#6b6b6b] mb-5 leading-relaxed">{shirt.description}</p>

          {/* Spec pills */}
          <div className="flex flex-wrap gap-2 mb-8">
            {Object.entries(shirt.specs).map(([key, val]) => (
              <span
                key={key}
                className="px-3 py-1.5 border border-[#1a1a1a]/15 text-xs uppercase tracking-[0.12em] text-[#6b6b6b] font-medium"
              >
                {val}
              </span>
            ))}
          </div>

          {/* Best for */}
          <p className="text-sm text-[#6b6b6b] mb-8">
            <span className="font-semibold text-[#1a1a1a]">Best for:</span>{" "}
            {shirt.bestFor}
          </p>

          {/* Separator */}
          <div className="border-t border-[#1a1a1a]/10 my-8" />

          {/* What's next + booking widget */}
          {phase === "results" && (
            <div ref={bookingRef} id="booking">
              <h2
                className="text-2xl md:text-3xl font-bold mb-2"
                style={{ fontFamily: "Georgia, serif" }}
              >
                Book your free 15-minute order call.
              </h2>
              <p className="text-[#6b6b6b] mb-6">
                Bring your logo. We&apos;ll finalize the design, confirm pricing,
                and get your order moving.
              </p>
              <BookingWidget
                leadData={{
                  firstName: leadForm.firstName,
                  lastName: leadForm.lastName,
                  email: leadForm.email,
                  phone: leadForm.phone,
                  recommendedShirt: shirtKey,
                  occasion: answers.occasion || "",
                  quantity: answers.quantity || "",
                }}
                onBooked={(slot) => {
                  setBookedSlot(slot);
                  setPhase("booked");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              />
            </div>
          )}

          {/* Booked confirmation */}
          {phase === "booked" && (
            <div className="text-center py-8">
              <div className="inline-block bg-green-100 text-green-700 px-4 py-2 text-sm uppercase tracking-[0.2em] font-medium mb-5 rounded">
                ✓ You&apos;re booked
              </div>
              <h2
                className="text-3xl font-bold mb-3"
                style={{ fontFamily: "Georgia, serif" }}
              >
                See you on the call.
              </h2>
              <p className="text-[#6b6b6b] max-w-md mx-auto">
                Check your email for confirmation. A Church Wear team member
                will have your shirt recommendation ready before the call.
              </p>
              {bookedSlot && (
                <p className="mt-4 font-semibold text-lg">
                  {new Date(bookedSlot).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}{" "}
                  at{" "}
                  {new Date(bookedSlot).toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </p>
              )}
            </div>
          )}

          {/* Trust bar */}
          <div className="border-t border-[#1a1a1a]/10 mt-10 pt-6">
            <div className="flex flex-wrap gap-4 justify-center">
              {[
                "50+ Churches Served",
                "Free Design Included",
                "60-Day Delivery",
              ].map((t) => (
                <span
                  key={t}
                  className="text-xs uppercase tracking-[0.12em] font-medium text-[#6b6b6b]"
                >
                  ✓ {t}
                </span>
              ))}
            </div>
          </div>
        </main>
      )}

      {/* Footer */}
      <footer className="px-5 py-10 border-t border-[#1a1a1a]/10 mt-10">
        <div className="max-w-2xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span
              className="text-sm font-bold tracking-[0.3em] uppercase"
              style={{ fontFamily: "Georgia, serif" }}
            >
              CHURCH WEAR
            </span>
            <p className="text-xs text-[#6b6b6b] mt-1">
              © 2026 Church Wear. All rights reserved.
            </p>
          </div>
          <div className="flex gap-4 text-xs text-[#6b6b6b]">
            <a href="https://churchwear.com" className="hover:text-[#1a1a1a] transition-colors">
              churchwear.com
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
