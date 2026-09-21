"use client";

import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ValueProposition from "@/components/ValueProposition";
import WorkspaceGrid from "@/components/WorkspaceGrid";
import WhyUhub from "@/components/WhyUhub";
import FeatureBanner from "@/components/FeatureBanner";
import LocationsAndBlueprint from "@/components/LocationsAndBlueprint";
import CommunityPerspectives from "@/components/CommunityPerspectives";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main
      suppressHydrationWarning
      className="min-h-screen flex flex-col bg-[#F6F6F4] selection:bg-[#D5F066] selection:text-[#0E0F12]"
    >
      {/* Top Floating Navigation */}
      <Navbar />

      {/* Hero Section */}
      <Hero />

      {/* Value Proposition Split Block */}
      <ValueProposition />

      {/* Workspace Category Grid (3 Cards) */}
      <WorkspaceGrid />

      {/* Editorial Accordion ("WHY UHUB?") */}
      <WhyUhub />

      {/* Mid-Page Feature Image Banner */}
      <FeatureBanner />

      {/* Locations & 2D CAD Blueprint Section */}
      <LocationsAndBlueprint />

      {/* Membership Pricing Deck
        <MembershipPricing /> */}

      {/* Community Perspectives Testimonials ("Space to Create, Room to Thrive") */}
      <CommunityPerspectives />

      <Footer />
    </main>
  );
}
