import Navbar from "../components/home/Navbar";
import Hero from "../components/home/Hero";
import Stats from "../components/home/Stats";
import MapPreview from "../components/home/MapPreview";
import Features from "../components/home/Features";
import Leaderboard from "../components/home/Leaderboard";
import CTA from "../components/home/CTA";
import Footer from "../components/home/Footer";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <Hero />
      <Stats />
      <MapPreview />
      <Features />
      <Leaderboard />
      <CTA />
      <Footer />
    </>
  );
}
