import type { Metadata, Viewport } from "next";
import { Big_Shoulders, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// Next.js has no built-in fallback metrics for this family, so the fallback
// stack is declared manually to avoid a layout-shift-prone default.
const bigShoulders = Big_Shoulders({
  variable: "--font-big-shoulders",
  subsets: ["latin"],
  adjustFontFallback: false,
  fallback: ["Arial Narrow", "Impact", "sans-serif"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? new URL(`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`)
    : new URL("http://localhost:3000"),
  title: {
    default: "Seat Scope 3D - Preview the view from any theater seat",
    template: "%s | Seat Scope 3D",
  },
  description:
    "Check the view from any seat before the lights go down. Compare real theaters and screen formats seat by seat, with true viewing distances and angles.",
  applicationName: "Seat Scope 3D",
  openGraph: {
    title: "Seat Scope 3D",
    description:
      "Check the view from any seat before the lights go down. Compare real theaters and screen formats seat by seat.",
    type: "website",
    siteName: "Seat Scope 3D",
  },
};

export const viewport: Viewport = {
  themeColor: "#0d0a10",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${bigShoulders.variable} ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
