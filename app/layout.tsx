import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Find Your Church Shirt — Church Wear",
  description:
    "Answer 5 quick questions and get a personalized t-shirt recommendation for your church event, baptism, VBS, or merch drop.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#f5f2ed] text-[#1a1a1a]">
        {children}
      </body>
    </html>
  );
}
