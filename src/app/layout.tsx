import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "UHUB — Smart Coworking Space & Workstation Platform",
  description:
    "Craft your success here. Premium coworking spaces, flexible desks, executive offices, and smart meeting rooms tailored for modern productivity.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased scroll-smooth`}
    >
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col bg-[#F6F6F4] text-[#0E0F12]"
      >
        <SmoothScroll />
        {children}
      </body>
    </html>
  );
}
