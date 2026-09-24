import type { Metadata, Viewport } from "next";
import { Inter, Noto_Sans_Devanagari } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const devanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  variable: "--font-devanagari",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#FFFFFF",
};

export const metadata: Metadata = {
  title: "Nepal Weather & Rain Tracker | नेपाल मौसम तथा बाढी अनुगमन प्रणाली",
  description:
    "Live DHM river gauges, NDRRMA disaster alerts, rainfall forecasts and INSAT-3D satellite imagery for all 7 provinces and 77 districts of Nepal.",
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
    <html
      lang="ne"
      className={`${inter.variable} ${devanagari.variable} h-full`}
    >
      <body className="min-h-full flex flex-col font-sans selection:bg-[#DC143C] selection:text-white">
        {children}
      </body>
    </html>
  );
}
