"use client";

import { useState, useRef } from "react";
import BookingWidget from "./components/BookingWidget";

// ─── Shirt catalog ────────────────────────────────────────────────────────────

const STORAGE = "https://lqrogzixbdviijmumckp.supabase.co/storage/v1/object/public/church-wear-catalog";

const SHIRTS = {
  blend: {
    name: "The Blend Tee",
    subtitle: "Tri-Blend · 160gsm · True-to-size fit",
    description:
      "A lightweight tri-blend tee with a soft, athletic feel. Breathable and comfortable for all ages — perfect for events, baptisms, giveaways, and anything in between.",
    heroImage: `${STORAGE}/blanks/the-blend-tee/olive/modelfront.png`,
    flatImage: `${STORAGE}/blanks/the-blend-tee/olive/flat.png`,
    pricing: [11.4, 9.09, 8.31, 6.3],
    colors: ["Obsidian", "Slate", "Olive", "Desert", "Ash", "Vellum", "Pure"],
    specs: { weight: "160gsm", fabric: "Tri-Blend", fit: "True to size" },
    bestFor: "Baptisms, youth events, VBS, missions, giveaways",
  },
  lite: {
    name: "The Lite Tee",
    subtitle: "100% Cotton · 140gsm · True-to-size fit",
    description:
      "A 100% cotton tee built for easy everyday wear. True-to-size fit works for kids and adults alike — great for high-volume runs, first-time guest gifts, and any event where comfort is the priority.",
    heroImage: `${STORAGE}/blanks/the-lite-tee/evergreen/modelfront.png`,
    flatImage: `${STORAGE}/blanks/the-lite-tee/evergreen/flat.png`,
    pricing: [11.4, 9.09, 8.31, 6.3],
    colors: ["Obsidian", "Evergreen", "Slate", "Sand", "Ash", "Dune", "Vellum", "Pure"],
    specs: { weight: "140gsm", fabric: "100% Cotton", fit: "True to size" },
    bestFor: "Baptisms, VBS, kids, mission trips, large giveaway runs",
  },
  routine: {
    name: "The Routine Tee",
    subtitle: "Heavyweight · 240gsm · Oversized drop shoulder",
    description:
      "A premium heavyweight tee with an oversized drop shoulder fit. Built for elevated event shirts and church merch people actually keep wearing — substantial feel without the premium price.",
    heroImage: `${STORAGE}/blanks/the-routine-tee/pollen/modelfront.png`,
    flatImage: `${STORAGE}/blanks/the-routine-tee/pollen/flat.png`,
    pricing: [17.0, 14.08, 11.79, 9.23],
    colors: ["Obsidian", "Evergreen", "Espresso", "Ash", "Mist", "Pollen", "Camel"],
    specs: { weight: "240gsm", fabric: "100% Cotton", fit: "Oversized / Drop shoulder" },
    bestFor: "Staff shirts, elevated event tees, merch your congregation keeps",
  },
  block: {
    name: "The Block Tee",
    subtitle: "Ultra Heavyweight · 330gsm · Boxy oversized",
    description:
      "The most substantial shirt in our lineup. Ultra-heavyweight with a boxy oversized fit built for bold church merch. Substantial weight and structure that's immediately noticeable.",
    heroImage: `${STORAGE}/blanks/the-block-tee/obsidian/modelfront.png`,
    flatImage: `${STORAGE}/blanks/the-block-tee/obsidian/flat.png`,
    pricing: [20.0, 17.21, 15.43, 12.75],
    colors: ["Obsidian"],
    specs: { weight: "330gsm", fabric: "100% Cotton", fit: "Boxy oversized" },
    bestFor: "Premium merch, bold statement pieces",
  },
} as const;

type ShirtKey = keyof typeof SHIRTS;
type Occasion = "baptism" | "youth" | "vbs" | "missions" | "conference" | "staff" | "merch" | "other";
type WhoWearing = "kids" | "adults" | "mix" | "staff";
type Vibe = "simple" | "premium" | "merch";

function recommendShirt(occasion: Occasion, whoWearing: WhoWearing, vibe: Vibe): ShirtKey {
  if (vibe === "merch" || occasion === "merch") return "block";
  if (vibe === "premium" || occasion === "staff" || whoWearing === "staff") return "routine";
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

// ─── Quiz steps ───────────────────────────────────────────────────────────────

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
      { label: "Clean and simple — just our logo on a quality tee", value: "simple" },
      { label: "Premium look — oversized, something people keep wearing", value: "premium" },
      { label: "Merch to sell — needs to look and feel like real merchandise", value: "merch" },
    ],
  },
  {
    id: "timeline",
    question: "When do you need them?",
    options: [
      { label: "Less than 30 days", value: "under30" },
      { label: "30 to 60 days", value: "30to60" },
      { label: "60 to 90 days", value: "60to90" },
      { label: "No rush — 90+ days", value: "90plus" },
    ],
  },
];

type Phase = "landing" | "quiz" | "lead" | "results" | "booked";
type Answers = { occasion: string; quantity: string; whoWearing: string; vibe: string; timeline: string };
type LeadForm = { firstName: string; lastName: string; email: string; phone: string; tcpa: boolean };

export default function Home() {
  const [phase, setPhase] = useState<Phase>("landing");
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<Answers>>({});
  const [leadForm, setLeadForm] = useState<LeadForm>({ firstName: "", lastName: "", email: "", phone: "", tcpa: false });
  const [leadError, setLeadError] = useState("");
  const [leadSubmitting, setLeadSubmitting] = useState(false);
  const [bookedSlot, setBookedSlot] = useState("");
  const bookingRef = useRef<HTMLDivElement>(null);

  const totalSteps = STEPS.length;
  const progress =
    phase === "landing" ? 0 :
    phase === "quiz" ? ((currentStep + 1) / (totalSteps + 2)) * 100 :
    phase === "lead" ? ((totalSteps + 1) / (totalSteps + 2)) * 100 : 100;

  const handleAnswer = (stepId: string, value: string) => {
    const updated = { ...answers, [stepId]: value };
    setAnswers(updated);
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setPhase("lead");
      window.scrollTo({ top: 0, behavior: "smooth" });
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
    fetch("/api/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...leadForm,
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
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const shirtKey = recommendShirt(
    (answers.occasion as Occasion) || "other",
    (answers.whoWearing as WhoWearing) || "adults",
    (answers.vibe as Vibe) || "simple"
  );
  const shirt = SHIRTS[shirtKey];
  const priceTier = getPriceTier(answers.quantity || "100-199");
  const pricePerShirt = shirt.pricing[priceTier];
  const qtyLabel = { "100-199": "100–199", "200-499": "200–499", "500-999": "500–999", "1000+": "1,000+" }[answers.quantity as string] || answers.quantity;

  const timelineBadge = ({
    under30: { color: "bg-red-50 text-red-700 border border-red-200", text: "Tight timeline — let's talk and see what we can do", dot: "⚠️" },
    "30to60": { color: "bg-yellow-50 text-yellow-800 border border-yellow-200", text: "Possible if your design is ready — we'll confirm on the call", dot: "🕐" },
    "60to90": { color: "bg-green-50 text-green-800 border border-green-200", text: "You're in great shape — plenty of time", dot: "✓" },
    "90plus": { color: "bg-green-50 text-green-800 border border-green-200", text: "No rush — we'll plan this out perfectly", dot: "✓" },
  } as Record<string, { color: string; text: string; dot: string }>)[answers.timeline as string] || { color: "bg-gray-100 text-gray-700 border border-gray-200", text: "Timeline TBD — let's confirm on the call", dot: "○" };

  const scrollToBooking = () => {
    bookingRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-[#f5f2ed]">

      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-[#f5f2ed]/95 backdrop-blur border-b border-[#1a1a1a]/10 px-5 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <span className="text-sm font-bold tracking-[0.3em] uppercase" style={{ fontFamily: "Georgia, serif" }}>
            CHURCH WEAR
          </span>
          {(phase === "results" || phase === "booked") && (
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
      {phase !== "landing" && (
        <div className="h-1 bg-[#1a1a1a]/10">
          <div
            className="h-full bg-[#8b7355] transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* ─── Landing Page ─────────────────────────────────────────────────────── */}
      {phase === "landing" && (
        <main className="max-w-2xl mx-auto px-5">

          {/* Hero */}
          <div className="pt-12 pb-8 text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-[#8b7355] font-medium mb-5">
              Church Wear · Custom T-Shirts
            </p>
            <h1
              className="text-4xl md:text-6xl font-bold leading-[1.05] tracking-tight mb-5"
              style={{ fontFamily: "Georgia, serif" }}
            >
              T-shirts for your church event.
              <br />
              <span className="text-[#8b7355]">Done right.</span>
            </h1>
            <p className="text-lg md:text-xl text-[#6b6b6b] max-w-lg mx-auto leading-relaxed mb-6">
              Answer 5 quick questions. Get a shirt recommendation built for your specific event — with exact pricing and a 60-day delivery window.
            </p>

            {/* Trust bar */}
            <div className="flex flex-wrap gap-3 justify-center mb-8">
              {["50+ Churches Served", "Free Design Included", "60-Day Delivery"].map((t) => (
                <span key={t} className="text-xs uppercase tracking-[0.12em] font-medium px-3 py-2 border border-[#1a1a1a]/20 text-[#6b6b6b]">
                  ✓ {t}
                </span>
              ))}
            </div>

            <button
              onClick={() => { setPhase("quiz"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              className="inline-block px-10 py-4 bg-[#1a1a1a] text-white text-sm uppercase tracking-[0.2em] font-medium hover:bg-[#1a1a1a]/80 transition-colors w-full sm:w-auto"
            >
              Find My Shirt — Takes 2 Minutes →
            </button>
            <p className="text-xs text-[#6b6b6b] mt-3">100-piece minimum · Fully custom designed · No commitment to see results</p>
          </div>

          {/* Hero shirt image */}
          <div className="mb-10 rounded-lg overflow-hidden">
            <img
              src={`${STORAGE}/blanks/the-lite-tee/evergreen/modelfront.png`}
              alt="Church Wear custom t-shirt"
              className="w-full object-cover max-h-[480px]"
              style={{ objectPosition: "top" }}
            />
          </div>

          {/* How it works */}
          <div className="border-t border-[#1a1a1a]/10 pt-10 pb-12">
            <p className="text-xs uppercase tracking-[0.3em] text-[#6b6b6b] mb-6 text-center">
              How it works
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { step: "01", title: "Answer 5 quick questions", body: "Tell us what you need the shirts for, how many, and your timeline." },
                { step: "02", title: "See your recommendation", body: "Get a specific shirt recommendation with exact pricing for your quantity." },
                { step: "03", title: "Book a free 15-min call", body: "We finalize the design, confirm your order, and get it moving. Shirts delivered in 60 days." },
              ].map((item) => (
                <div key={item.step} className="flex flex-col gap-2">
                  <span className="text-3xl font-bold text-[#8b7355]/30" style={{ fontFamily: "Georgia, serif" }}>{item.step}</span>
                  <h3 className="font-semibold text-[#1a1a1a]">{item.title}</h3>
                  <p className="text-sm text-[#6b6b6b] leading-relaxed">{item.body}</p>
                </div>
              ))}
            </div>

            <div className="text-center mt-10">
              <button
                onClick={() => { setPhase("quiz"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                className="inline-block px-10 py-4 bg-[#1a1a1a] text-white text-sm uppercase tracking-[0.2em] font-medium hover:bg-[#1a1a1a]/80 transition-colors w-full sm:w-auto"
              >
                Get Started →
              </button>
            </div>
          </div>
        </main>
      )}

      {/* ─── Quiz Phase ───────────────────────────────────────────────────────── */}
      {phase === "quiz" && (
        <main className="max-w-2xl mx-auto px-5 py-10">
          <p className="text-xs uppercase tracking-[0.2em] text-[#6b6b6b] mb-2">
            Question {currentStep + 1} of {totalSteps}
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
                className="w-full text-left px-5 py-4 border border-[#1a1a1a]/15 bg-white hover:border-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white transition-all duration-150 text-base font-medium min-h-[60px] flex items-center gap-3 group rounded-sm"
              >
                <span className="w-5 h-5 border border-current flex-shrink-0 flex items-center justify-center opacity-25 group-hover:opacity-100 transition-opacity text-xs">
                  →
                </span>
                {opt.label}
              </button>
            ))}
          </div>

          {currentStep > 0 && (
            <button
              onClick={() => { setCurrentStep(currentStep - 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              className="mt-6 text-sm text-[#6b6b6b] hover:text-[#1a1a1a] transition-colors"
            >
              ← Back
            </button>
          )}
          {currentStep === 0 && (
            <button
              onClick={() => { setPhase("landing"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
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
          <p className="text-xs uppercase tracking-[0.2em] text-[#8b7355] mb-2 font-medium">
            Almost done
          </p>
          <h1
            className="text-2xl md:text-3xl font-bold mb-2 leading-snug"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Where should we send your recommendation?
          </h1>
          <p className="text-[#6b6b6b] mb-8 leading-relaxed">
            We&apos;ll show you the best shirt for your order and send the details to your inbox.
          </p>

          <form onSubmit={handleLeadSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs uppercase tracking-[0.15em] text-[#6b6b6b] mb-1.5">First Name *</label>
                <input required type="text" value={leadForm.firstName}
                  onChange={(e) => setLeadForm({ ...leadForm, firstName: e.target.value })}
                  className="w-full bg-white border border-[#1a1a1a]/15 px-3 py-3 text-base outline-none focus:border-[#8b7355] transition-colors rounded-sm"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-[0.15em] text-[#6b6b6b] mb-1.5">Last Name *</label>
                <input required type="text" value={leadForm.lastName}
                  onChange={(e) => setLeadForm({ ...leadForm, lastName: e.target.value })}
                  className="w-full bg-white border border-[#1a1a1a]/15 px-3 py-3 text-base outline-none focus:border-[#8b7355] transition-colors rounded-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-[0.15em] text-[#6b6b6b] mb-1.5">Email *</label>
              <input required type="email" value={leadForm.email}
                onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                className="w-full bg-white border border-[#1a1a1a]/15 px-3 py-3 text-base outline-none focus:border-[#8b7355] transition-colors rounded-sm"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-[0.15em] text-[#6b6b6b] mb-1.5">Phone *</label>
              <input required type="tel" value={leadForm.phone}
                onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                placeholder="(555) 555-5555"
                className="w-full bg-white border border-[#1a1a1a]/15 px-3 py-3 text-base outline-none focus:border-[#8b7355] transition-colors rounded-sm"
              />
            </div>
            <div className="flex items-start gap-3 pt-1">
              <input required type="checkbox" id="tcpa" checked={leadForm.tcpa}
                onChange={(e) => setLeadForm({ ...leadForm, tcpa: e.target.checked })}
                className="mt-1 w-4 h-4 flex-shrink-0 cursor-pointer accent-[#8b7355]"
              />
              <label htmlFor="tcpa" className="text-xs text-[#6b6b6b] leading-relaxed cursor-pointer">
                By submitting, I agree to receive SMS and email communications from Church Wear regarding my order. Reply STOP to opt out at any time.
              </label>
            </div>
            {leadError && <p className="text-red-600 text-sm">{leadError}</p>}
            <button
              type="submit"
              disabled={leadSubmitting}
              className="w-full px-8 py-4 bg-[#1a1a1a] text-white text-sm uppercase tracking-[0.2em] font-medium hover:bg-[#1a1a1a]/80 transition-colors disabled:opacity-50 mt-2"
            >
              {leadSubmitting ? "Loading..." : "See My Recommendation →"}
            </button>
            <p className="text-xs text-[#6b6b6b] text-center">No commitment. See your recommendation instantly.</p>
          </form>

          <button
            onClick={() => { setCurrentStep(totalSteps - 1); setPhase("quiz"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            className="mt-6 text-sm text-[#6b6b6b] hover:text-[#1a1a1a] transition-colors"
          >
            ← Back
          </button>
        </main>
      )}

      {/* ─── Results Phase ────────────────────────────────────────────────────── */}
      {(phase === "results" || phase === "booked") && (
        <main className="max-w-2xl mx-auto px-5 py-8">

          {/* Eyebrow + headline */}
          <div className="mb-6">
            <p className="text-xs uppercase tracking-[0.3em] text-[#8b7355] font-semibold mb-2">
              YOUR RECOMMENDATION
            </p>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-1" style={{ fontFamily: "Georgia, serif" }}>
              {shirt.name}.
            </h1>
            <p className="text-[#6b6b6b]">{shirt.subtitle}</p>
          </div>

          {/* Hero image */}
          <div className="mb-5 rounded-lg overflow-hidden bg-white">
            <img
              src={shirt.heroImage}
              alt={shirt.name}
              className="w-full object-cover max-h-[460px]"
              style={{ objectPosition: "top" }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          </div>

          {/* Flat image (secondary) */}
          <div className="mb-6 rounded-lg overflow-hidden bg-white">
            <img
              src={shirt.flatImage}
              alt={`${shirt.name} flat lay`}
              className="w-full object-contain max-h-[260px] p-4"
              loading="lazy"
              onError={(e) => { (e.target as HTMLImageElement).parentElement!.style.display = 'none'; }}
            />
          </div>

          {/* Price callout — prominent */}
          <div className="bg-[#1a1a1a] text-white rounded-lg px-6 py-6 mb-4">
            <p className="text-xs uppercase tracking-[0.2em] text-white/50 mb-2">Your price</p>
            <p className="text-5xl font-bold mb-1" style={{ fontFamily: "Georgia, serif" }}>
              ${pricePerShirt.toFixed(2)}
              <span className="text-xl font-normal text-white/60 ml-2">per shirt</span>
            </p>
            <p className="text-sm text-white/70 mb-5">
              At {qtyLabel} shirts · Fully designed · 60-day delivery
            </p>
            <button
              onClick={scrollToBooking}
              className="w-full sm:w-auto px-8 py-3 bg-[#8b7355] text-white text-sm uppercase tracking-[0.2em] font-medium hover:bg-[#8b7355]/80 transition-colors"
            >
              Book My Free 15-Min Call ↓
            </button>
          </div>

          {/* Timeline badge */}
          <div className="mb-6">
            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${timelineBadge.color}`}>
              <span>{timelineBadge.dot}</span>
              {timelineBadge.text}
            </span>
          </div>

          {/* Description */}
          <p className="text-[#6b6b6b] mb-5 leading-relaxed">{shirt.description}</p>

          {/* Spec pills */}
          <div className="flex flex-wrap gap-2 mb-5">
            {Object.entries(shirt.specs).map(([key, val]) => (
              <span key={key} className="px-3 py-1.5 border border-[#1a1a1a]/15 text-xs uppercase tracking-[0.12em] text-[#6b6b6b] font-medium">
                {val}
              </span>
            ))}
          </div>

          {/* Colors */}
          <p className="text-sm text-[#6b6b6b] mb-8">
            <span className="font-semibold text-[#1a1a1a]">Available colors:</span>{" "}
            {shirt.colors.join(", ")}
          </p>

          {/* Social proof */}
          <div className="bg-white border border-[#1a1a1a]/10 rounded-lg px-6 py-6 mb-8">
            <p className="text-xs uppercase tracking-[0.2em] text-[#6b6b6b] mb-4">Why churches choose Church Wear</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { stat: "50+", label: "Churches served" },
                { stat: "100%", label: "Custom designed" },
                { stat: "60 days", label: "Delivery window" },
              ].map((item) => (
                <div key={item.stat} className="text-center">
                  <p className="text-2xl font-bold text-[#1a1a1a]" style={{ fontFamily: "Georgia, serif" }}>{item.stat}</p>
                  <p className="text-xs text-[#6b6b6b] mt-0.5 uppercase tracking-wide">{item.label}</p>
                </div>
              ))}
            </div>
            <p className="text-sm text-[#6b6b6b] mt-5 leading-relaxed border-t border-[#1a1a1a]/10 pt-4">
              "Most print vendors give you a blank template and send you off. Church Wear handled the whole design and got our baptism shirts looking exactly how we wanted — delivered on time with zero headaches."
            </p>
            <p className="text-xs text-[#8b7355] font-medium mt-2 uppercase tracking-wide">Church Wear Customer</p>
          </div>

          {/* Separator */}
          <div className="border-t border-[#1a1a1a]/10 my-8" />

          {/* Booking section */}
          {phase === "results" && (
            <div ref={bookingRef} id="booking">
              <p className="text-xs uppercase tracking-[0.3em] text-[#8b7355] font-semibold mb-2">Next step</p>
              <h2 className="text-2xl md:text-3xl font-bold mb-3" style={{ fontFamily: "Georgia, serif" }}>
                Book your free 15-minute call.
              </h2>
              <p className="text-[#6b6b6b] mb-2 leading-relaxed">
                Bring your logo. We&apos;ll review your design, confirm your order details, and get everything moving. Your shirts will be delivered within 60 days of approval.
              </p>
              <p className="text-sm text-[#6b6b6b] mb-6 italic">No commitment needed. We&apos;ll walk you through exactly what it looks like before you decide anything.</p>

              {/* What to expect */}
              <div className="bg-[#f5f2ed] border border-[#1a1a1a]/10 rounded-lg px-5 py-4 mb-6">
                <p className="text-xs uppercase tracking-[0.2em] text-[#6b6b6b] mb-3">What we cover on the call</p>
                <ul className="space-y-2">
                  {[
                    "Review your logo or design (or start one from scratch)",
                    "Confirm shirt style, color, and size breakdown",
                    "Lock in your pricing and timeline",
                    "Answer any questions — no sales pressure",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-[#6b6b6b]">
                      <span className="text-[#8b7355] mt-0.5 flex-shrink-0">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

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
            <div className="bg-white border border-[#1a1a1a]/10 rounded-lg px-6 py-10 text-center">
              <div className="inline-block bg-green-100 text-green-800 px-4 py-2 text-xs uppercase tracking-[0.2em] font-semibold mb-5 rounded-full">
                ✓ You&apos;re booked
              </div>
              <h2 className="text-3xl font-bold mb-3" style={{ fontFamily: "Georgia, serif" }}>
                See you on the call.
              </h2>
              <p className="text-[#6b6b6b] max-w-md mx-auto leading-relaxed">
                Check your email for a confirmation. A Church Wear team member will have your shirt recommendation ready before the call starts.
              </p>
              {bookedSlot && (
                <p className="mt-5 font-semibold text-lg text-[#1a1a1a]">
                  {new Date(bookedSlot).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                  {" at "}
                  {new Date(bookedSlot).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}
                </p>
              )}
            </div>
          )}

          {/* Trust bar */}
          <div className="border-t border-[#1a1a1a]/10 mt-10 pt-6">
            <div className="flex flex-wrap gap-4 justify-center">
              {["50+ Churches Served", "Free Design Included", "60-Day Delivery", "100 Piece Minimum"].map((t) => (
                <span key={t} className="text-xs uppercase tracking-[0.12em] font-medium text-[#6b6b6b]">✓ {t}</span>
              ))}
            </div>
          </div>
        </main>
      )}

      {/* Footer */}
      <footer className="px-5 py-10 border-t border-[#1a1a1a]/10 mt-10">
        <div className="max-w-2xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="text-sm font-bold tracking-[0.3em] uppercase" style={{ fontFamily: "Georgia, serif" }}>CHURCH WEAR</span>
            <p className="text-xs text-[#6b6b6b] mt-1">© 2026 Church Wear. All rights reserved.</p>
          </div>
          <a href="https://churchwear.com" className="text-xs text-[#6b6b6b] hover:text-[#1a1a1a] transition-colors">churchwear.com</a>
        </div>
      </footer>
    </div>
  );
}
