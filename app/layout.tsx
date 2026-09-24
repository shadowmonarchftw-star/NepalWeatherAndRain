import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#050d1a",
};

export const metadata: Metadata = {
  title: "Nepal Weather & Rain Tracker | नेपाल मौसम तथा बाढी अनुगमन",
  description:
    "Real-time precipitation, flood alerts, and Bay of Bengal monsoon depression tracking across all 7 provinces and 77 districts of Nepal.",
  keywords: [
    "Nepal Weather",
    "Nepal Rain Forecast",
    "Bay of Bengal Cyclone",
    "Kathmandu Rain",
    "Pokhara Weather",
    "Koshi Flood Alert",
    "DHM Nepal Weather",
    "Monsoon Nepal",
  ],
  authors: [{ name: "Nepal Meteorological Alert Network" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full">
      <body className="min-h-full flex flex-col bg-[#050D1A] text-white selection:bg-[#DC143C] selection:text-white">
        {children}
      </body>
    </html>
  );
}
