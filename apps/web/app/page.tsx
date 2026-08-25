"use client";

import { Navbar } from "@/components/shared/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { SponsorBar } from "@/components/landing/SponsorBar";
import { RankShowcase } from "@/components/landing/RankShowcase";

export default function Home() {
  return (
    <main className="flex flex-col min-h-dvh bg-void">
      <Navbar />
      <SponsorBar />
      <div className="flex-1 flex flex-col items-center justify-center gap-16 py-12">
        <HeroSection />
        <RankShowcase />
      </div>
    </main>
  );
}
