import { Inter } from "next/font/google";
import "./globals.css";
import type { Metadata, Viewport } from "next";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "ApniSec Trackify - Security Issue Management",
    template: "%s | ApniSec Trackify",
  },
  description:
    "ApniSec Trackify is a comprehensive security issue tracking platform. Manage Cloud Security, VAPT, and Red Team assessments with ease.",
  keywords: [
    "cybersecurity",
    "security",
    "VAPT",
    "penetration testing",
    "cloud security",
    "red team",
    "issue tracking",
    "ApniSec",
  ],
  authors: [{ name: "ApniSec" }],
  creator: "ApniSec",
  publisher: "ApniSec",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "ApniSec Trackify",
    title: "ApniSec Trackify - Security Issue Management",
    description:
      "Comprehensive security issue tracking for Cloud Security, VAPT, and Red Team assessments.",
  },
  twitter: {
    card: "summary_large_image",
    title: "ApniSec Trackify",
    description: "Security Issue Management Platform",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a0a0a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>{children}</body>
    </html>
  );
}
