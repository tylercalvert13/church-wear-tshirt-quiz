export default function BookedPage() {
  return (
    <main className="min-h-screen bg-[#f5f2ed] flex flex-col items-center justify-center px-5 py-20 text-center">
      <div className="inline-block bg-green-100 text-green-700 px-4 py-2 text-sm uppercase tracking-[0.2em] font-medium mb-6 rounded">
        ✓ Confirmed
      </div>
      <h1
        className="text-4xl md:text-5xl font-bold mb-4"
        style={{ fontFamily: "Georgia, serif" }}
      >
        You&apos;re booked.
      </h1>
      <p className="text-lg text-[#6b6b6b] max-w-md">
        Check your email for confirmation. A Church Wear team member will have
        your shirt recommendation ready before the call.
      </p>
      <a
        href="/"
        className="mt-8 text-sm text-[#6b6b6b] underline hover:text-[#1a1a1a] transition-colors"
      >
        Back to quiz
      </a>
    </main>
  );
}
