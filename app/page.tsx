import type { Metadata } from "next";
import KoiPondHero from "@/components/KoiPondHero";
import "./portfolio-hero.css";

// Title, description, and preview image are shared from app/layout.tsx; this only marks the homepage's own URL.
export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function Home() {
  return <KoiPondHero />;
}
